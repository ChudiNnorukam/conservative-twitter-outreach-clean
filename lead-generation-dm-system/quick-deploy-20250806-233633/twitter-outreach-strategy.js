const fs = require('fs').promises;
const path = require('path');

/**
 * Conservative Twitter Outreach Strategy
 * Based on Moz research and $1/day strategy principles
 * Prioritizes engagement over DMs to conserve API tokens
 * Focuses on high-quality, targeted interactions
 */
class TwitterOutreachStrategy {
  constructor() {
    this.strategy = {
      // Phase 1: Research & Discovery (Low API cost)
      research: {
        priority: 1,
        actions: ['userLookup', 'tweetLookup'],
        maxPerDay: 30,
        apiCost: 'low',
        description: 'Find high-quality prospects using advanced search'
      },
      // Phase 2: Engagement (Medium API cost)
      engagement: {
        priority: 2,
        actions: ['follow', 'like', 'reply'],
        maxPerDay: 20,
        apiCost: 'medium',
        description: 'Build relationships through genuine engagement'
      },
      // Phase 3: Direct Outreach (High API cost, limited)
      directOutreach: {
        priority: 3,
        actions: ['dmSend'],
        maxPerDay: 5, // Conservative limit
        apiCost: 'high',
        description: 'Send personalized DMs only to highly qualified leads'
      }
    };
    
    // Conservative engagement templates based on Moz research
    this.engagementTemplates = {
      follow: "Following for your insights on {{topic}}! 👋",
      like: "👍",
      reply: "{{insight}} - really resonates with my experience in {{field}}.",
      retweet: "RT @{{username}}: {{tweetText}} // {{comment}}"
    };

    // Conservative DM templates based on $1/day strategy
    this.dmTemplates = {
      initial: "Hi {{username}}! Loved your thread about {{threadTopic}}. Your point about {{specificInsight}} really resonated. I'm building {{solution}} and think you might find {{value}} interesting. Would you be open to a quick chat?",
      followUp: "Hi {{username}}! Just wanted to follow up on my previous message about {{topic}}. No pressure, but I'd love to share some insights that might be valuable for your work. Cheers!",
      warm: "Hi {{username}}! Thanks for the follow back. I noticed your recent post about {{recentTopic}} - really insightful! I'm working on similar {{solution}} initiatives and would love to connect. Best regards!"
    };

    // Conservative targeting criteria based on Moz research
    this.targetingCriteria = {
      minFollowers: 100,
      maxFollowers: 50000, // Avoid mega-influencers
      minEngagement: 0.5, // 0.5% engagement rate minimum
      recentActivity: 7, // Days since last activity
      relevantKeywords: ['AI', 'automation', 'SaaS', 'marketing', 'sales', 'growth', 'startup', 'tech'],
      excludeKeywords: ['spam', 'bot', 'fake', 'buy followers']
    };
  }

  /**
   * Get optimal outreach sequence for a lead using conservative approach
   */
  getOutreachSequence(lead, apiQuota) {
    const sequence = [];
    
    // Step 1: Research (if we have quota)
    if (apiQuota.userLookup.remaining > 0 && this.isWorthResearching(lead)) {
      sequence.push({
        action: 'research',
        priority: 1,
        reason: 'Gather data for qualification',
        apiCost: 'low'
      });
    }
    
    // Step 2: Engagement (if we have quota and lead is qualified)
    if (apiQuota.follow.remaining > 0 && apiQuota.like.remaining > 0 && this.isWorthEngaging(lead)) {
      sequence.push({
        action: 'follow',
        priority: 2,
        reason: 'Build relationship first (conservative approach)',
        apiCost: 'medium'
      });
      
      // Add like if we have recent content to engage with
      if (lead.recentTweets && lead.recentTweets.length > 0 && apiQuota.like.remaining > 0) {
        sequence.push({
          action: 'like',
          priority: 3,
          reason: 'Show appreciation for recent content',
          apiCost: 'medium'
        });
      }
    }
    
    // Step 3: DM only if highly qualified and we have quota
    if (apiQuota.dmSend.remaining > 0 && this.isHighlyQualified(lead) && sequence.length >= 2) {
      sequence.push({
        action: 'dmSend',
        priority: 4,
        reason: 'Direct outreach only to highly qualified leads',
        apiCost: 'high'
      });
    }
    
    return sequence;
  }

  /**
   * Check if lead is worth researching (conservative approach)
   */
  isWorthResearching(lead) {
    // Basic qualification before spending API calls
    const basicCriteria = {
      hasUsername: lead.username && lead.username.length > 0,
      noSpamKeywords: !this.targetingCriteria.excludeKeywords.some(keyword => 
        lead.username?.toLowerCase().includes(keyword) || 
        lead.bio?.toLowerCase().includes(keyword)
      ),
      hasRelevantKeywords: lead.keywords && lead.keywords.some(keyword =>
        this.targetingCriteria.relevantKeywords.some(relevant => 
          keyword.toLowerCase().includes(relevant.toLowerCase())
        )
      )
    };
    
    return Object.values(basicCriteria).every(Boolean);
  }

  /**
   * Check if lead is worth engaging with (conservative approach)
   */
  isWorthEngaging(lead) {
    // Conservative engagement criteria based on Moz research
    const criteria = {
      hasRecentActivity: lead.recentTweets && lead.recentTweets.length > 0,
      goodEngagement: lead.recentTweets && lead.recentTweets.some(tweet => 
        tweet.engagement && (tweet.engagement.likes > 3 || tweet.engagement.comments > 0)
      ),
      relevantContent: lead.keywords && lead.keywords.length > 0,
      activeUser: lead.lastActivity && 
        (new Date() - new Date(lead.lastActivity)) < (this.targetingCriteria.recentActivity * 24 * 60 * 60 * 1000),
      reasonableFollowerCount: lead.followerCount >= this.targetingCriteria.minFollowers && 
        lead.followerCount <= this.targetingCriteria.maxFollowers,
      goodEngagementRate: lead.followerCount > 0 && 
        (lead.recentTweets?.reduce((total, tweet) => total + (tweet.engagement?.likes || 0), 0) / lead.followerCount) >= this.targetingCriteria.minEngagement
    };
    
    // Must meet at least 3 criteria for engagement
    const metCriteria = Object.values(criteria).filter(Boolean).length;
    return metCriteria >= 3;
  }

  /**
   * Check if lead is highly qualified for DM (very conservative)
   */
  isHighlyQualified(lead) {
    // Very strict criteria for DMs based on $1/day strategy
    const strictCriteria = {
      hasEngagedWithUs: lead.hasEngagedWithUs || false, // They've liked/replied to our content
      mutualConnections: lead.mutualConnections && lead.mutualConnections.length > 0,
      highEngagementRate: lead.followerCount > 0 && 
        (lead.recentTweets?.reduce((total, tweet) => total + (tweet.engagement?.likes || 0), 0) / lead.followerCount) >= 1.0, // 1% engagement
      veryRecentActivity: lead.lastActivity && 
        (new Date() - new Date(lead.lastActivity)) < (3 * 24 * 60 * 60 * 1000), // 3 days
      perfectMatch: lead.keywords && lead.keywords.some(keyword =>
        ['AI', 'automation', 'SaaS'].some(perfect => 
          keyword.toLowerCase().includes(perfect.toLowerCase())
        )
      )
    };
    
    // Must meet at least 2 strict criteria for DM
    const metCriteria = Object.values(strictCriteria).filter(Boolean).length;
    return metCriteria >= 2;
  }

  /**
   * Generate personalized engagement message (conservative approach)
   */
  generateEngagementMessage(action, lead, tweetData = null) {
    const template = this.engagementTemplates[action];
    if (!template) return null;
    
    let message = template;
    
    // Replace variables based on available data
    if (lead.keywords && lead.keywords.length > 0) {
      message = message.replace('{{topic}}', lead.keywords[0]);
    }
    
    if (tweetData && tweetData.text) {
      const insight = this.extractInsight(tweetData.text);
      message = message.replace('{{insight}}', insight);
    }
    
    if (lead.industry) {
      message = message.replace('{{field}}', lead.industry);
    }
    
    return message;
  }

  /**
   * Generate personalized DM message (conservative approach)
   */
  generateDMMessage(type, lead, tweetData = null) {
    const template = this.dmTemplates[type];
    if (!template) return null;
    
    let message = template;
    
    // Replace Twitter-specific variables
    if (lead.username) {
      message = message.replace(/{{username}}/g, lead.username);
    }
    
    if (tweetData && tweetData.text) {
      const threadTopic = this.extractTopicFromTweet(tweetData.text);
      const specificInsight = this.extractInsight(tweetData.text);
      
      message = message.replace('{{threadTopic}}', threadTopic);
      message = message.replace('{{specificInsight}}', specificInsight);
    }
    
    // Replace lead-specific data
    if (lead.keywords && lead.keywords.length > 0) {
      message = message.replace('{{topic}}', lead.keywords[0]);
      message = message.replace('{{field}}', lead.keywords[0]);
    }
    
    // Replace generic placeholders with conservative values
    message = message.replace('{{solution}}', 'AI automation tools');
    message = message.replace('{{value}}', 'some insights');
    
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
  extractInsight(text) {
    // Extract first sentence or key phrase (conservative approach)
    const sentences = text.split('.').filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      return sentences[0].trim().substring(0, 50) + '...';
    }
    
    return 'your perspective';
  }

  /**
   * Get conservative daily limits based on free tier and $1/day strategy
   */
  getConservativeLimits() {
    return {
      research: {
        userLookup: 30,    // Conservative: 30 user lookups per day
        tweetLookup: 20    // Conservative: 20 tweet lookups per day
      },
      engagement: {
        follow: 15,        // Conservative: 15 follows per day
        like: 25,          // Conservative: 25 likes per day
        reply: 5           // Conservative: 5 replies per day
      },
      directOutreach: {
        dmSend: 5          // Very conservative: 5 DMs per day
      }
    };
  }

  /**
   * Get advanced search queries for finding prospects (based on Moz research)
   */
  getAdvancedSearchQueries(targetAudience) {
    const queries = [];
    
    // Based on Moz research: search for shared URLs from influential users
    if (targetAudience === 'marketers') {
      queries.push('filter:links from:randfish OR from:neilpatel OR from:brianclark');
    }
    
    if (targetAudience === 'developers') {
      queries.push('filter:links from:github OR from:stackoverflow');
    }
    
    if (targetAudience === 'entrepreneurs') {
      queries.push('filter:links from:naval OR from:paulg OR from:ycombinator');
    }
    
    // Generic queries for tech/startup audience
    queries.push('AI automation (filter:links)');
    queries.push('SaaS growth (filter:links)');
    queries.push('startup marketing (filter:links)');
    
    return queries;
  }

  /**
   * Log strategy decisions with conservative approach
   */
  async logStrategy(lead, sequence, quota) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        lead: {
          id: lead.id,
          name: lead.name,
          username: lead.username,
          platform: lead.platform,
          score: lead.score,
          followerCount: lead.followerCount,
          engagementRate: lead.followerCount > 0 ? 
            (lead.recentTweets?.reduce((total, tweet) => total + (tweet.engagement?.likes || 0), 0) / lead.followerCount) : 0
        },
        sequence: sequence,
        quota: quota,
        strategy: 'conservative_engagement_first',
        qualification: {
          worthResearching: this.isWorthResearching(lead),
          worthEngaging: this.isWorthEngaging(lead),
          highlyQualified: this.isHighlyQualified(lead)
        }
      };
      
      const logFile = path.join(__dirname, '../logs/outreach-strategy.json');
      let strategyLog = [];
      
      try {
        const existingData = await fs.readFile(logFile, 'utf8');
        strategyLog = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist yet
      }
      
      strategyLog.push(logEntry);
      await fs.mkdir(path.dirname(logFile), { recursive: true });
      await fs.writeFile(logFile, JSON.stringify(strategyLog, null, 2));
      
    } catch (error) {
      console.error('Failed to log strategy:', error.message);
    }
  }

  /**
   * Get analytics for conservative strategy performance
   */
  async getStrategyAnalytics(days = 30) {
    try {
      const logFile = path.join(__dirname, '../logs/outreach-strategy.json');
      const data = await fs.readFile(logFile, 'utf8');
      const strategyLog = JSON.parse(data);

      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const recentStrategy = strategyLog.filter(entry => 
        new Date(entry.timestamp) > cutoffDate
      );

      const analytics = {
        totalLeads: recentStrategy.length,
        qualifiedForResearch: recentStrategy.filter(entry => entry.qualification.worthResearching).length,
        qualifiedForEngagement: recentStrategy.filter(entry => entry.qualification.worthEngaging).length,
        highlyQualifiedForDM: recentStrategy.filter(entry => entry.qualification.highlyQualified).length,
        averageEngagementRate: recentStrategy.reduce((sum, entry) => sum + entry.lead.engagementRate, 0) / recentStrategy.length,
        averageFollowerCount: recentStrategy.reduce((sum, entry) => sum + entry.lead.followerCount, 0) / recentStrategy.length,
        strategyEfficiency: {
          researchToEngagement: recentStrategy.filter(entry => entry.qualification.worthEngaging).length / 
            Math.max(recentStrategy.filter(entry => entry.qualification.worthResearching).length, 1),
          engagementToDM: recentStrategy.filter(entry => entry.qualification.highlyQualified).length / 
            Math.max(recentStrategy.filter(entry => entry.qualification.worthEngaging).length, 1)
        }
      };

      return analytics;

    } catch (error) {
      console.error('Failed to get strategy analytics:', error.message);
      return null;
    }
  }
}

module.exports = TwitterOutreachStrategy; 