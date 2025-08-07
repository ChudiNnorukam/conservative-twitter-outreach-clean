const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');

/**
 * Twitter DM Client for Lead Generation
 * Extends existing Twitter API client with DM capabilities
 * Follows Twitter API v1.1 DM guidelines and rate limits
 */
class TwitterDMClient {
  constructor() {
    this.client = null;
    this.v2Client = null;
    this.isInitialized = false;
    this.rateLimitInfo = {};
    this.logPath = path.join(__dirname, '../logs/twitter-dm.log');
    this.messagesSent = 0;
    this.dailyLimits = {
      messages: 5,        // Very conservative: 5 DMs per day (based on $1/day strategy)
      appMessages: 100    // Conservative app-wide limit
    };
    this.conversationLimits = {
      initial: 1,        // 1 message per conversation per 24h (very conservative)
      followUp: 1        // 1 follow-up after receiving response
    };
    this.apiCallCount = {
      userLookup: 0,
      tweetLookup: 0,
      dmSend: 0,
      follow: 0,
      like: 0
    };
    this.freeTierLimits = {
      userLookup: 30,    // Conservative: 30 user lookups per 15min
      tweetLookup: 20,   // Conservative: 20 tweet lookups per 15min
      dmSend: 5,         // Very conservative: 5 DMs per day
      follow: 15,        // Conservative: 15 follows per day
      like: 25           // Conservative: 25 likes per day
    };
  }

  /**
   * Initialize Twitter DM client
   */
  async initialize() {
    try {
      if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET ||
          !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
        throw new Error('Missing required Twitter API credentials');
      }

      // Initialize main client for DMs (v1.1)
      this.client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
      });

      // Initialize v2 client for user lookup
      if (process.env.TWITTER_BEARER_TOKEN) {
        this.v2Client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
      }

      // Test connection
      await this.testConnection();
      this.isInitialized = true;
      
      console.log('✅ Twitter DM client initialized successfully');
      await this.log('Twitter DM client initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Twitter DM client:', error.message);
      throw error;
    }
  }

  /**
   * Test API connection and get user info
   */
  async testConnection() {
    try {
      const user = await this.client.v2.me();
      console.log(`✅ Connected to Twitter as: @${user.data.username}`);
      return user.data;
    } catch (error) {
      throw new Error(`Twitter API connection failed: ${error.message}`);
    }
  }

  /**
   * Check if user is highly qualified for DM (conservative approach)
   */
  isHighlyQualifiedForDM(userData, leadData = {}) {
    // Very strict criteria based on $1/day strategy
    const criteria = {
      // Must have reasonable follower count (not too small, not too large)
      reasonableFollowers: userData.followerCount >= 100 && userData.followerCount <= 50000,
      
      // Must have good engagement rate (at least 1%)
      goodEngagementRate: userData.followerCount > 0 && 
        (leadData.recentTweets?.reduce((total, tweet) => total + (tweet.engagement?.likes || 0), 0) / userData.followerCount) >= 0.01,
      
      // Must have recent activity (within 3 days)
      recentActivity: leadData.lastActivity && 
        (new Date() - new Date(leadData.lastActivity)) < (3 * 24 * 60 * 60 * 1000),
      
      // Must have relevant keywords in bio or recent tweets
      relevantContent: (userData.bio && this.hasRelevantKeywords(userData.bio)) ||
        (leadData.recentTweets && leadData.recentTweets.some(tweet => this.hasRelevantKeywords(tweet.text))),
      
      // Must not have spam indicators
      noSpamIndicators: !this.hasSpamIndicators(userData.username, userData.bio),
      
      // Must have engaged with our content (if available)
      hasEngagedWithUs: leadData.hasEngagedWithUs || false,
      
      // Must have mutual connections (if available)
      hasMutualConnections: leadData.mutualConnections && leadData.mutualConnections.length > 0
    };
    
    // Must meet at least 4 criteria for DM (very conservative)
    const metCriteria = Object.values(criteria).filter(Boolean).length;
    return metCriteria >= 4;
  }

  /**
   * Check if content has relevant keywords
   */
  hasRelevantKeywords(content) {
    if (!content) return false;
    
    const relevantKeywords = ['AI', 'automation', 'SaaS', 'marketing', 'sales', 'growth', 'startup', 'tech', 'product'];
    return relevantKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for spam indicators
   */
  hasSpamIndicators(username, bio) {
    if (!username && !bio) return false;
    
    const spamIndicators = ['spam', 'bot', 'fake', 'buy followers', 'get followers', 'follow back'];
    const content = `${username || ''} ${bio || ''}`.toLowerCase();
    
    return spamIndicators.some(indicator => content.includes(indicator));
  }

  /**
   * Send direct message to user (with qualification check)
   */
  async sendDirectMessage(recipientUserId, messageText, mediaId = null, userData = null, leadData = {}) {
    try {
      if (!this.isInitialized) await this.initialize();

      // Check rate limits
      if (!this.checkRateLimit('message')) {
        throw new Error('Daily message limit reached');
      }

      // Check if user is highly qualified (conservative approach)
      if (userData && !this.isHighlyQualifiedForDM(userData, leadData)) {
        console.log('⚠️ User not highly qualified for DM - skipping');
        return {
          success: false,
          reason: 'User not highly qualified for DM',
          message: 'Conservative strategy: only sending DMs to highly qualified users'
        };
      }

      console.log('💬 Sending Twitter DM...');

      // Prepare message data
      const messageData = {
        event: {
          type: "message_create",
          message_create: {
            target: {
              recipient_id: recipientUserId.toString()
            },
            message_data: {
              text: messageText
            }
          }
        }
      };

      // Add media attachment if provided
      if (mediaId) {
        messageData.event.message_create.message_data.attachment = {
          type: "media",
          media: {
            id: mediaId
          }
        };
      }

      // Send DM using v1.1 API
      const response = await this.client.v1.post('direct_messages/events/new.json', messageData);
      this.messagesSent++;

      // Log the message
      await this.logOutreach({
        type: 'direct_message',
        recipientUserId,
        messageText,
        mediaId,
        messageId: response.event.id,
        timestamp: new Date().toISOString(),
        success: true,
        qualification: userData ? this.isHighlyQualifiedForDM(userData, leadData) : null
      });

      console.log(`✅ Twitter DM sent to ${recipientUserId}`);
      return {
        success: true,
        messageId: response.event.id,
        message: 'Direct message sent successfully'
      };

    } catch (error) {
      console.error('❌ Failed to send Twitter DM:', error.message);
      
      await this.logOutreach({
        type: 'direct_message',
        recipientUserId,
        messageText,
        mediaId,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Send follow-up DM
   */
  async sendFollowUpMessage(recipientUserId, messageText) {
    try {
      if (!this.isInitialized) await this.initialize();

      // Check conversation limits
      const conversationHistory = await this.getConversationHistory(recipientUserId);
      if (conversationHistory.length >= this.conversationLimits.initial) {
        throw new Error('Conversation message limit reached');
      }

      console.log('🔄 Sending Twitter follow-up DM...');

      const result = await this.sendDirectMessage(recipientUserId, messageText);

      await this.logOutreach({
        type: 'follow_up',
        recipientUserId,
        messageText,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        success: true
      });

      return result;

    } catch (error) {
      console.error('❌ Failed to send Twitter follow-up:', error.message);
      throw error;
    }
  }

  /**
   * Get user information for personalization
   */
  async getUserInfo(userId) {
    try {
      if (!this.v2Client) {
        console.warn('⚠️ No bearer token provided, user lookup limited');
        return null;
      }

      const user = await this.v2Client.v2.user(userId, {
        'user.fields': ['public_metrics', 'description', 'location', 'verified']
      });

      return {
        id: user.data.id,
        username: user.data.username,
        name: user.data.name,
        bio: user.data.description,
        location: user.data.location,
        verified: user.data.verified,
        followerCount: user.data.public_metrics?.followers_count || 0,
        followingCount: user.data.public_metrics?.following_count || 0,
        profileUrl: `https://twitter.com/${user.data.username}`
      };

    } catch (error) {
      console.error('❌ Failed to get Twitter user info:', error.message);
      return null;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    try {
      if (!this.v2Client) {
        console.warn('⚠️ No bearer token provided, user lookup limited');
        return null;
      }

      const user = await this.v2Client.v2.userByUsername(username, {
        'user.fields': ['public_metrics', 'description', 'location', 'verified']
      });

      return this.formatUserData(user.data);

    } catch (error) {
      console.error('❌ Failed to get Twitter user by username:', error.message);
      return null;
    }
  }

  /**
   * Format user data consistently
   */
  formatUserData(userData) {
    return {
      id: userData.id,
      username: userData.username,
      name: userData.name,
      bio: userData.description,
      location: userData.location,
      verified: userData.verified,
      followerCount: userData.public_metrics?.followers_count || 0,
      followingCount: userData.public_metrics?.following_count || 0,
      profileUrl: `https://twitter.com/${userData.username}`
    };
  }

  /**
   * Check if user follows you (for DM permissions)
   */
  async isFollowingYou(userId) {
    try {
      if (!this.v2Client) {
        return false;
      }

      // Get your own user ID
      const me = await this.client.v2.me();
      
      // Check if user follows you
      const following = await this.v2Client.v2.following(userId, {
        max_results: 1000
      });

      return following.data?.some(user => user.id === me.data.id) || false;

    } catch (error) {
      console.warn('Could not verify follower status:', error.message);
      return false;
    }
  }

  /**
   * Get recent tweets from user for personalization
   */
  async getRecentTweets(userId, maxResults = 5) {
    try {
      if (!this.v2Client) {
        return [];
      }

      const tweets = await this.v2Client.v2.userTimeline(userId, {
        max_results: maxResults,
        'tweet.fields': ['public_metrics', 'created_at']
      });

      return tweets.data?.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        metrics: tweet.public_metrics
      })) || [];

    } catch (error) {
      console.warn('Could not get recent tweets:', error.message);
      return [];
    }
  }

  /**
   * Get conversation history with user
   */
  async getConversationHistory(userId, limit = 10) {
    try {
      // Note: This requires additional API access for message history
      // For now, return mock data based on our outreach logs
      const logFile = path.join(__dirname, '../logs/twitter-outreach.json');
      
      try {
        const data = await fs.readFile(logFile, 'utf8');
        const outreachLog = JSON.parse(data);
        
        return outreachLog
          .filter(entry => entry.recipientUserId === userId)
          .slice(-limit);
          
      } catch (error) {
        return [];
      }

    } catch (error) {
      console.warn('Could not get conversation history:', error.message);
      return [];
    }
  }

  /**
   * Personalize DM message using user data
   */
  personalizeMessage(template, userData, leadData = {}) {
    let message = template;

    // Replace Twitter-specific variables
    if (userData.username) {
      message = message.replace(/{{username}}/g, userData.username);
    }
    
    if (userData.name) {
      message = message.replace(/{{name}}/g, userData.name);
    }
    
    if (userData.bio) {
      message = message.replace(/{{bio}}/g, userData.bio);
    }

    // Replace lead-specific data
    if (leadData.recentTweets && leadData.recentTweets.length > 0) {
      const recentTweet = leadData.recentTweets[0];
      message = message.replace(/{{threadTopic}}/g, this.extractTopicFromTweet(recentTweet.content));
      message = message.replace(/{{specificInsight}}/g, this.extractInsightFromTweet(recentTweet.content));
    }

    if (leadData.keywords && leadData.keywords.length > 0) {
      message = message.replace(/{{field}}/g, leadData.keywords[0]);
    }

    // Replace generic placeholders
    message = message.replace(/{{solution}}/g, 'AI automation tools');
    message = message.replace(/{{value}}/g, 'some insights');

    return message;
  }

  /**
   * Extract topic from tweet content
   */
  extractTopicFromTweet(content) {
    const topics = ['AI', 'automation', 'SaaS', 'marketing', 'sales', 'product', 'growth', 'technology', 'startups'];
    
    for (const topic of topics) {
      if (content.toLowerCase().includes(topic.toLowerCase())) {
        return topic;
      }
    }
    
    return 'tech trends';
  }

  /**
   * Extract insight from tweet content
   */
  extractInsightFromTweet(content) {
    // Extract first sentence or key phrase
    const sentences = content.split('.').filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      return sentences[0].trim().substring(0, 50) + '...';
    }
    
    return 'your perspective';
  }

  /**
   * Upload media for DM attachment
   */
  async uploadMedia(filePath, altText = null) {
    try {
      const mediaId = await this.client.v1.uploadMedia(filePath);
      
      // Add alt text if provided
      if (altText) {
        await this.client.v1.createMediaMetadata(mediaId, {
          alt_text: { text: altText }
        });
      }

      return mediaId;

    } catch (error) {
      console.error('❌ Failed to upload media:', error.message);
      throw error;
    }
  }

  /**
   * Check rate limits with free tier optimization
   */
  checkRateLimit(action) {
    const now = new Date();
    const today = now.toDateString();
    
    // Reset daily counters if it's a new day
    if (this.lastResetDate !== today) {
      this.messagesSent = 0;
      this.apiCallCount = {
        userLookup: 0,
        tweetLookup: 0,
        dmSend: 0,
        follow: 0,
        like: 0
      };
      this.lastResetDate = today;
    }

    // Check free tier limits
    const limit = this.freeTierLimits[action];
    const used = this.apiCallCount[action] || 0;
    
    if (limit && used >= limit) {
      console.log(`⚠️ Free tier limit reached for ${action}: ${used}/${limit}`);
      return false;
    }

    // Update usage counter
    if (this.apiCallCount[action] !== undefined) {
      this.apiCallCount[action]++;
    }

    switch (action) {
      case 'message':
        return this.messagesSent < this.dailyLimits.messages;
      default:
        return true;
    }
  }

  /**
   * Get remaining daily quota with free tier limits
   */
  getRemainingQuota() {
    const quota = {};
    
    // Daily limits
    quota.messages = Math.max(0, this.dailyLimits.messages - this.messagesSent);
    
    // Free tier limits
    for (const [action, limit] of Object.entries(this.freeTierLimits)) {
      const used = this.apiCallCount[action] || 0;
      quota[action] = {
        remaining: Math.max(0, limit - used),
        used: used,
        limit: limit
      };
    }
    
    quota.resetTime = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
    return quota;
  }

  /**
   * Get DM rate limit status
   */
  async getDMRateLimit() {
    try {
      const limits = await this.client.v1.getRateLimitStatus();
      return limits.resources?.direct_messages || {};
    } catch (error) {
      console.error('Failed to check DM rate limits:', error.message);
      return {};
    }
  }

  /**
   * Log outreach activities
   */
  async logOutreach(data) {
    try {
      const logFile = path.join(__dirname, '../logs/twitter-outreach.json');
      let outreachLog = [];

      try {
        const existingData = await fs.readFile(logFile, 'utf8');
        outreachLog = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist yet
      }

      outreachLog.push(data);

      await fs.mkdir(path.dirname(logFile), { recursive: true });
      await fs.writeFile(logFile, JSON.stringify(outreachLog, null, 2));

    } catch (error) {
      console.error('Failed to log outreach activity:', error.message);
    }
  }

  /**
   * Log general activities
   */
  async log(message) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: message
      };

      await fs.mkdir(path.dirname(this.logPath), { recursive: true });
      await fs.appendFile(this.logPath, JSON.stringify(logEntry) + '\n');

    } catch (error) {
      console.error('Failed to write to log:', error.message);
    }
  }

  /**
   * Get outreach analytics
   */
  async getOutreachAnalytics(days = 30) {
    try {
      const logFile = path.join(__dirname, '../logs/twitter-outreach.json');
      const data = await fs.readFile(logFile, 'utf8');
      const outreachLog = JSON.parse(data);

      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const recentOutreach = outreachLog.filter(entry => 
        new Date(entry.timestamp) > cutoffDate
      );

      const analytics = {
        totalOutreach: recentOutreach.length,
        directMessages: recentOutreach.filter(entry => entry.type === 'direct_message').length,
        followUps: recentOutreach.filter(entry => entry.type === 'follow_up').length,
        successRate: recentOutreach.filter(entry => entry.success).length / recentOutreach.length,
        dailyAverage: recentOutreach.length / days,
        uniqueRecipients: new Set(recentOutreach.map(entry => entry.recipientUserId)).size
      };

      return analytics;

    } catch (error) {
      console.error('Failed to get analytics:', error.message);
      return null;
    }
  }

  /**
   * Follow user (for DM permissions)
   */
  async followUser(userId) {
    try {
      const response = await this.client.v2.follow(userId);
      
      await this.log(`Followed user: ${userId}`);
      return response;

    } catch (error) {
      console.error('❌ Failed to follow user:', error.message);
      throw error;
    }
  }

  /**
   * Unfollow user
   */
  async unfollowUser(userId) {
    try {
      const response = await this.client.v2.unfollow(userId);
      
      await this.log(`Unfollowed user: ${userId}`);
      return response;

    } catch (error) {
      console.error('❌ Failed to unfollow user:', error.message);
      throw error;
    }
  }

  /**
   * Like a tweet (engagement before DM)
   */
  async likeTweet(tweetId) {
    try {
      const response = await this.client.v2.like(tweetId);
      
      await this.log(`Liked tweet: ${tweetId}`);
      return response;

    } catch (error) {
      console.error('❌ Failed to like tweet:', error.message);
      throw error;
    }
  }

  /**
   * Reply to a tweet (engagement before DM)
   */
  async replyToTweet(tweetId, replyText) {
    try {
      const response = await this.client.v2.tweet(replyText, {
        reply: { in_reply_to_tweet_id: tweetId }
      });

      await this.log(`Replied to tweet: ${tweetId}`);
      return response;

    } catch (error) {
      console.error('❌ Failed to reply to tweet:', error.message);
      throw error;
    }
  }
}

module.exports = TwitterDMClient; 