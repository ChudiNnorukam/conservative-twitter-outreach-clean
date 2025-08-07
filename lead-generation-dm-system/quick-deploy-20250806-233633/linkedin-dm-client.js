const fs = require('fs').promises;
const path = require('path');

/**
 * LinkedIn DM Client for Lead Generation
 * Extends existing LinkedIn API client with messaging capabilities
 * Follows LinkedIn API guidelines and rate limits
 */
class LinkedInDMClient {
  constructor() {
    this.isInitialized = false;
    this.rateLimitInfo = {};
    this.logPath = path.join(__dirname, '../logs/linkedin-dm.log');
    this.messagesSent = 0;
    this.connectionsRequested = 0;
    this.dailyLimits = {
      connectionRequests: 100, // LinkedIn daily limit
      messages: 200,           // Conservative daily message limit
      searches: 300           // Search operations per day
    };
  }

  /**
   * Initialize LinkedIn DM client
   */
  async initialize() {
    try {
      if (!process.env.LINKEDIN_ACCESS_TOKEN || !process.env.LINKEDIN_PERSON_ID) {
        throw new Error('Missing required LinkedIn API credentials');
      }

      // Test connection using existing profile endpoint
      await this.testConnection();
      this.isInitialized = true;
      
      console.log('✅ LinkedIn DM client initialized successfully');
      await this.log('LinkedIn DM client initialized');

    } catch (error) {
      console.error('❌ Failed to initialize LinkedIn DM client:', error.message);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      // Use the basic profile endpoint to test credentials
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API test failed: ${response.status}`);
      }

      const userData = await response.json();
      console.log(`✅ Connected to LinkedIn as: ${userData.localizedFirstName} ${userData.localizedLastName}`);
      return userData;

    } catch (error) {
      throw new Error(`LinkedIn API connection failed: ${error.message}`);
    }
  }

  /**
   * Send connection request with personalized message
   * Note: This is a simulation for testing - actual LinkedIn API requires specific scopes
   */
  async sendConnectionRequest(recipientPersonId, message = null) {
    try {
      if (!this.isInitialized) await this.initialize();

      // Check daily limits
      if (this.connectionsRequested >= this.dailyLimits.connectionRequests) {
        throw new Error('Daily connection request limit reached');
      }

      console.log('🤝 Simulating connection request...');
      console.log(`   To: ${recipientPersonId}`);
      console.log(`   Message: ${message || 'No message'}`);

      // For now, we'll simulate the connection request
      // In production, you'd need LinkedIn API with proper scopes
      this.connectionsRequested++;
      
      await this.logOutreach({
        action: 'connection_request',
        recipient: recipientPersonId,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'simulated'
      });

      console.log('✅ Connection request simulated successfully');
      return { success: true, id: `sim_${Date.now()}` };

    } catch (error) {
      console.error('❌ Connection request failed:', error.message);
      throw error;
    }
  }

  /**
   * Send direct message to existing connection
   * Note: This is a simulation for testing - actual LinkedIn API requires specific scopes
   */
  async sendDirectMessage(recipientPersonId, messageText, subject = null) {
    try {
      if (!this.isInitialized) await this.initialize();

      // Check daily limits
      if (this.messagesSent >= this.dailyLimits.messages) {
        throw new Error('Daily message limit reached');
      }

      console.log('💬 Simulating direct message...');
      console.log(`   To: ${recipientPersonId}`);
      console.log(`   Subject: ${subject || 'Message from Chudi Nnorukam'}`);
      console.log(`   Message: ${messageText}`);

      // For now, we'll simulate the direct message
      // In production, you'd need LinkedIn API with proper scopes
      this.messagesSent++;

      // Log the message
      await this.logOutreach({
        type: 'direct_message',
        recipientPersonId,
        messageText,
        subject,
        timestamp: new Date().toISOString(),
        success: true,
        status: 'simulated'
      });

      console.log(`✅ Direct message simulated to ${recipientPersonId}`);
      return {
        success: true,
        messageUrn: `sim_${Date.now()}`,
        message: 'Direct message simulated successfully'
      };

    } catch (error) {
      console.error('❌ Failed to simulate direct message:', error.message);
      
      await this.logOutreach({
        type: 'direct_message',
        recipientPersonId,
        messageText,
        subject,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Send follow-up message to accepted connection
   */
  async sendFollowUpMessage(recipientPersonId, messageText, threadUrn = null) {
    try {
      if (!this.isInitialized) await this.initialize();

      console.log('🔄 Sending follow-up message...');

      const messageData = {
        body: messageText,
        messageType: "MEMBER_TO_MEMBER"
      };

      // If we have a thread URN, this is a reply to existing conversation
      if (threadUrn) {
        messageData.thread = threadUrn;
      } else {
        messageData.recipients = [`urn:li:person:${recipientPersonId}`];
      }

      const response = await fetch('https://api.linkedin.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`LinkedIn follow-up failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const messageUrn = response.headers.get('x-linkedin-id');
      this.messagesSent++;

      await this.logOutreach({
        type: 'follow_up',
        recipientPersonId,
        messageText,
        threadUrn,
        messageUrn,
        timestamp: new Date().toISOString(),
        success: true
      });

      console.log(`✅ Follow-up message sent to ${recipientPersonId}`);
      return {
        success: true,
        messageUrn,
        message: 'Follow-up message sent successfully'
      };

    } catch (error) {
      console.error('❌ Failed to send follow-up message:', error.message);
      throw error;
    }
  }

  /**
   * Get profile information for personalization
   */
  async getProfileInfo(personId) {
    try {
      const response = await fetch(`https://api.linkedin.com/v2/people/(id:${personId})`, {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get profile: ${response.status}`);
      }

      const profileData = await response.json();
      
      return {
        firstName: profileData.localizedFirstName,
        lastName: profileData.localizedLastName,
        headline: profileData.localizedHeadline,
        industry: profileData.industryName,
        location: profileData.locationName,
        profileUrl: `https://linkedin.com/in/${profileData.vanityName || personId}`
      };

    } catch (error) {
      console.error('❌ Failed to get profile info:', error.message);
      return null;
    }
  }

  /**
   * Check if user is already connected
   */
  async isAlreadyConnected(personId) {
    try {
      // Use connections API to check existing connections
      const response = await fetch(`https://api.linkedin.com/v2/people/~/connections?q=viewer&count=500`, {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!response.ok) {
        console.warn('Could not check connection status');
        return false;
      }

      const connectionsData = await response.json();
      const connections = connectionsData.elements || [];
      
      return connections.some(connection => 
        connection.id === personId || connection.id === `urn:li:person:${personId}`
      );

    } catch (error) {
      console.warn('Could not verify connection status:', error.message);
      return false;
    }
  }

  /**
   * Get conversation history with a person
   */
  async getConversationHistory(personId, limit = 10) {
    try {
      const response = await fetch(`https://api.linkedin.com/v2/messages?q=participants&participants=urn:li:person:${personId}&count=${limit}`, {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!response.ok) {
        return [];
      }

      const messagesData = await response.json();
      return messagesData.elements || [];

    } catch (error) {
      console.warn('Could not get conversation history:', error.message);
      return [];
    }
  }

  /**
   * Personalize message using profile data
   */
  personalizeMessage(template, profileData, leadData = {}) {
    let message = template;

    // Replace common variables
    if (profileData.firstName) {
      message = message.replace(/{{firstName}}/g, profileData.firstName);
    }
    
    if (profileData.lastName) {
      message = message.replace(/{{lastName}}/g, profileData.lastName);
    }
    
    if (profileData.headline) {
      message = message.replace(/{{headline}}/g, profileData.headline);
    }
    
    if (profileData.industry) {
      message = message.replace(/{{industry}}/g, profileData.industry);
    }

    // Replace lead-specific data
    if (leadData.company) {
      message = message.replace(/{{company}}/g, leadData.company);
    }
    
    if (leadData.title) {
      message = message.replace(/{{title}}/g, leadData.title);
    }

    if (leadData.recentPosts && leadData.recentPosts.length > 0) {
      const recentPost = leadData.recentPosts[0];
      message = message.replace(/{{recentTopic}}/g, this.extractTopicFromPost(recentPost.content));
    }

    return message;
  }

  /**
   * Extract topic from post content (simple keyword extraction)
   */
  extractTopicFromPost(content) {
    // Simple topic extraction - could be enhanced with NLP
    const topics = ['AI', 'automation', 'SaaS', 'marketing', 'sales', 'product', 'growth', 'technology'];
    
    for (const topic of topics) {
      if (content.toLowerCase().includes(topic.toLowerCase())) {
        return topic;
      }
    }
    
    return 'your recent insights';
  }

  /**
   * Check rate limits
   */
  checkRateLimit(action) {
    const now = new Date();
    const today = now.toDateString();
    
    // Reset daily counters if it's a new day
    if (this.lastResetDate !== today) {
      this.messagesSent = 0;
      this.connectionsRequested = 0;
      this.lastResetDate = today;
    }

    switch (action) {
      case 'connection':
        return this.connectionsRequested < this.dailyLimits.connectionRequests;
      case 'message':
        return this.messagesSent < this.dailyLimits.messages;
      default:
        return true;
    }
  }

  /**
   * Get remaining daily quota
   */
  getRemainingQuota() {
    return {
      connectionRequests: Math.max(0, this.dailyLimits.connectionRequests - this.connectionsRequested),
      messages: Math.max(0, this.dailyLimits.messages - this.messagesSent),
      resetTime: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
    };
  }

  /**
   * Log outreach activities
   */
  async logOutreach(data) {
    try {
      const logFile = path.join(__dirname, '../logs/linkedin-outreach.json');
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
      const logFile = path.join(__dirname, '../logs/linkedin-outreach.json');
      const data = await fs.readFile(logFile, 'utf8');
      const outreachLog = JSON.parse(data);

      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const recentOutreach = outreachLog.filter(entry => 
        new Date(entry.timestamp) > cutoffDate
      );

      const analytics = {
        totalOutreach: recentOutreach.length,
        connectionRequests: recentOutreach.filter(entry => entry.type === 'connection_request').length,
        directMessages: recentOutreach.filter(entry => entry.type === 'direct_message').length,
        followUps: recentOutreach.filter(entry => entry.type === 'follow_up').length,
        successRate: recentOutreach.filter(entry => entry.success).length / recentOutreach.length,
        dailyAverage: recentOutreach.length / days
      };

      return analytics;

    } catch (error) {
      console.error('Failed to get analytics:', error.message);
      return null;
    }
  }
}

module.exports = LinkedInDMClient; 