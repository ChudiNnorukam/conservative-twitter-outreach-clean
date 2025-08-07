#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const LinkedInDMClient = require('../utils/linkedin-dm-client');
const TwitterDMClient = require('../utils/twitter-dm-client');
const TwitterOutreachStrategy = require('../utils/twitter-outreach-strategy');

/**
 * DM Dispatcher Agent for Chudi Nnorukam
 * Orchestrates LinkedIn and Twitter DM campaigns
 * Manages outreach sequences, personalization, and compliance
 */
class DMDispatcherAgent {
  constructor() {
    this.linkedinClient = new LinkedInDMClient();
    this.twitterClient = new TwitterDMClient();
    this.twitterStrategy = new TwitterOutreachStrategy();
    this.templates = new Map();
    this.campaigns = new Map();
    this.isInitialized = false;
    this.logPath = path.join(__dirname, '../logs/dm-dispatcher.log');
  }

  /**
   * Initialize DM dispatcher agent
   */
  async initialize() {
    try {
      console.log('🚀 Initializing DM Dispatcher Agent...');

      // Initialize both clients
      await this.linkedinClient.initialize();
      await this.twitterClient.initialize();
      
      // Load message templates
      await this.loadTemplates();
      
      this.isInitialized = true;
      console.log('✅ DM Dispatcher Agent initialized successfully');
      await this.log('DM Dispatcher Agent initialized');

    } catch (error) {
      console.error('❌ Failed to initialize DM Dispatcher Agent:', error.message);
      throw error;
    }
  }

  /**
   * Load message templates
   */
  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates');
      const templateFiles = await fs.readdir(templatesDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(templatesDir, file);
          const templateData = await fs.readFile(templatePath, 'utf8');
          const template = JSON.parse(templateData);
          this.templates.set(template.name, template);
        }
      }
      
      console.log(`📋 Loaded ${this.templates.size} message templates`);
    } catch (error) {
      throw new Error(`Failed to load templates: ${error.message}`);
    }
  }

  /**
   * Start outreach campaign
   */
  async startCampaign(campaignConfig) {
    try {
      if (!this.isInitialized) await this.initialize();

      console.log('🎯 Starting outreach campaign:', campaignConfig.name);

      const campaign = {
        id: this.generateCampaignId(),
        name: campaignConfig.name,
        leads: campaignConfig.leads || [],
        template: campaignConfig.template,
        platforms: campaignConfig.platforms || ['linkedin', 'twitter'],
        settings: {
          delay: campaignConfig.delay || 300000, // 5 minutes between messages
          dailyLimit: campaignConfig.dailyLimit || 50,
          followUpDelay: campaignConfig.followUpDelay || 3, // days
          maxFollowUps: campaignConfig.maxFollowUps || 2
        },
        status: 'active',
        stats: {
          sent: 0,
          delivered: 0,
          responses: 0,
          connections: 0
        },
        startedAt: new Date().toISOString()
      };

      this.campaigns.set(campaign.id, campaign);

      // Process leads
      const results = await this.processLeads(campaign);

      campaign.status = 'completed';
      campaign.completedAt = new Date().toISOString();

      console.log(`🎉 Campaign '${campaign.name}' completed`);
      console.log(`📊 Results: ${results.length} leads processed`);

      await this.saveCampaign(campaign);
      return campaign;

    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
      throw error;
    }
  }

  /**
   * Process leads for outreach
   */
  async processLeads(campaign) {
    const results = [];
    let processed = 0;

    console.log(`📨 Processing ${campaign.leads.length} leads...`);

    for (const lead of campaign.leads) {
      try {
        // Check daily limits
        if (processed >= campaign.settings.dailyLimit) {
          console.log('📊 Daily limit reached, pausing campaign');
          break;
        }

        // Process lead on appropriate platforms
        const leadResults = await this.processLead(lead, campaign);
        results.push(...leadResults);

        processed++;
        campaign.stats.sent += leadResults.filter(r => r.success).length;

        // Delay between messages for rate limiting
        if (processed < campaign.leads.length) {
          console.log(`⏳ Waiting ${campaign.settings.delay / 1000}s before next lead...`);
          await this.sleep(campaign.settings.delay);
        }

      } catch (error) {
        console.error(`❌ Failed to process lead ${lead.name}:`, error.message);
        
        results.push({
          leadId: lead.id,
          platform: 'error',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Process individual lead
   */
  async processLead(lead, campaign) {
    const results = [];

    console.log(`👤 Processing lead: ${lead.name} (${lead.platform})`);

    // LinkedIn outreach
    if (campaign.platforms.includes('linkedin') && lead.platform === 'linkedin') {
      try {
        const linkedinResult = await this.sendLinkedInOutreach(lead, campaign);
        results.push(linkedinResult);
      } catch (error) {
        console.error('LinkedIn outreach failed:', error.message);
        results.push({
          leadId: lead.id,
          platform: 'linkedin',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Twitter outreach
    if (campaign.platforms.includes('twitter') && lead.platform === 'twitter') {
      try {
        const twitterResult = await this.sendTwitterOutreach(lead, campaign);
        results.push(twitterResult);
      } catch (error) {
        console.error('Twitter outreach failed:', error.message);
        results.push({
          leadId: lead.id,
          platform: 'twitter',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Send LinkedIn outreach
   */
  async sendLinkedInOutreach(lead, campaign) {
    try {
      const template = this.templates.get(campaign.template);
      if (!template) {
        throw new Error(`Template '${campaign.template}' not found`);
      }

      // Get LinkedIn profile info for personalization
      const personId = this.extractPersonIdFromProfile(lead.profileUrl);
      if (!personId) {
        throw new Error('Could not extract LinkedIn person ID');
      }

      const profileInfo = await this.linkedinClient.getProfileInfo(personId);
      
      // Check if already connected
      const isConnected = await this.linkedinClient.isAlreadyConnected(personId);

      let result;

      if (isConnected) {
        // Send direct message
        const message = this.personalizeLinkedInMessage(
          template.directMessage,
          profileInfo,
          lead
        );

        result = await this.linkedinClient.sendDirectMessage(personId, message);
      } else {
        // Send connection request
        const message = this.personalizeLinkedInMessage(
          template.connectionRequest,
          profileInfo,
          lead
        );

        result = await this.linkedinClient.sendConnectionRequest(personId, message);
      }

      return {
        leadId: lead.id,
        platform: 'linkedin',
        action: isConnected ? 'direct_message' : 'connection_request',
        personId,
        success: result.success,
        messageId: result.invitationUrn || result.messageUrn,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`LinkedIn outreach failed: ${error.message}`);
    }
  }

  /**
   * Send Twitter outreach with conservative strategy
   */
  async sendTwitterOutreach(lead, campaign) {
    try {
      // Check if lead is worth engaging with
      if (!this.twitterStrategy.isWorthEngaging(lead)) {
        console.log(`⏭️ Skipping ${lead.name} - not worth engaging`);
        return {
          leadId: lead.id,
          platform: 'twitter',
          action: 'skipped',
          reason: 'low_engagement_potential',
          timestamp: new Date().toISOString()
        };
      }

      // Get API quota
      const quota = this.twitterClient.getRemainingQuota();
      
      // Get optimal outreach sequence
      const sequence = this.twitterStrategy.getOutreachSequence(lead, quota);
      
      if (sequence.length === 0) {
        console.log(`⏭️ Skipping ${lead.name} - no API quota available`);
        return {
          leadId: lead.id,
          platform: 'twitter',
          action: 'skipped',
          reason: 'no_api_quota',
          timestamp: new Date().toISOString()
        };
      }

      console.log(`🎯 Twitter outreach sequence for ${lead.name}:`, 
        sequence.map(s => `${s.action} (${s.reason})`).join(' → '));

      // Execute sequence
      let result = { success: false };
      
      for (const step of sequence) {
        try {
          switch (step.action) {
            case 'follow':
              if (quota.follow.remaining > 0) {
                await this.twitterClient.followUser(lead.id);
                console.log(`✅ Followed ${lead.name}`);
              }
              break;
              
            case 'like':
              if (quota.like.remaining > 0 && lead.recentTweets && lead.recentTweets.length > 0) {
                await this.twitterClient.likeTweet(lead.recentTweets[0].id);
                console.log(`👍 Liked tweet from ${lead.name}`);
              }
              break;
              
            case 'research':
              if (quota.userLookup.remaining > 0) {
                const userInfo = await this.twitterClient.getUserInfo(lead.id);
                console.log(`🔍 Researched ${lead.name}`);
              }
              break;
              
            case 'dmSend':
              if (quota.dmSend.remaining > 0) {
                const template = this.templates.get(campaign.template);
                const message = this.personalizeTwitterMessage(
                  template.twitter.directMessage,
                  lead,
                  lead
                );
                result = await this.twitterClient.sendDirectMessage(lead.id, message);
                console.log(`💬 Sent DM to ${lead.name}`);
              }
              break;
          }
        } catch (error) {
          console.log(`⚠️ Failed ${step.action} for ${lead.name}: ${error.message}`);
        }
      }

      // Log strategy
      await this.twitterStrategy.logStrategy(lead, sequence, quota);

      return {
        leadId: lead.id,
        platform: 'twitter',
        action: sequence.map(s => s.action).join('_'),
        userId: lead.id,
        success: result.success,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Twitter outreach failed: ${error.message}`);
    }
  }

  /**
   * Personalize LinkedIn message
   */
  personalizeLinkedInMessage(template, profileInfo, lead) {
    return this.linkedinClient.personalizeMessage(template, profileInfo, lead);
  }

  /**
   * Personalize Twitter message
   */
  personalizeTwitterMessage(template, userInfo, lead) {
    return this.twitterClient.personalizeMessage(template, userInfo, lead);
  }

  /**
   * Generate engagement reply for Twitter
   */
  generateEngagementReply(tweet, userInfo) {
    const replyTemplates = [
      `Great insight about ${this.extractTopicFromTweet(tweet.text)}! 👍`,
      `This resonates with my experience in ${this.extractTopicFromTweet(tweet.text)}. Thanks for sharing!`,
      `Interesting perspective on ${this.extractTopicFromTweet(tweet.text)}. Would love to hear more about this.`,
      `Spot on about ${this.extractTopicFromTweet(tweet.text)}! This is exactly what we're seeing too.`
    ];

    const randomTemplate = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
    return randomTemplate;
  }

  /**
   * Extract topic from tweet for engagement
   */
  extractTopicFromTweet(content) {
    const topics = ['AI', 'automation', 'SaaS', 'marketing', 'sales', 'product', 'growth', 'technology'];
    
    for (const topic of topics) {
      if (content.toLowerCase().includes(topic.toLowerCase())) {
        return topic;
      }
    }
    
    return 'this topic';
  }

  /**
   * Extract LinkedIn person ID from profile URL
   */
  extractPersonIdFromProfile(profileUrl) {
    // Extract person ID from LinkedIn URL
    // This is a simplified version - actual implementation would be more robust
    const match = profileUrl.match(/linkedin\.com\/in\/(.+?)(?:\/|$)/);
    return match ? match[1] : null;
  }

  /**
   * Extract Twitter user ID from profile URL
   */
  async extractUserIdFromProfile(profileUrl) {
    try {
      const match = profileUrl.match(/twitter\.com\/(.+?)(?:\/|$)/);
      if (!match) return null;

      const username = match[1];
      const userInfo = await this.twitterClient.getUserByUsername(username);
      return userInfo ? userInfo.id : null;
    } catch (error) {
      console.error('Failed to extract Twitter user ID:', error.message);
      return null;
    }
  }

  /**
   * Schedule follow-up campaigns
   */
  async scheduleFollowUps(campaignId, days = 3) {
    try {
      const campaign = this.campaigns.get(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      console.log(`📅 Scheduling follow-ups for campaign '${campaign.name}' in ${days} days`);

      // This would integrate with a job scheduler like node-cron
      // For now, just log the intention
      await this.log(`Follow-up scheduled for campaign ${campaignId} in ${days} days`);

      return {
        success: true,
        followUpDate: new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString(),
        message: 'Follow-up scheduled successfully'
      };

    } catch (error) {
      console.error('Failed to schedule follow-ups:', error.message);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId = null) {
    try {
      if (campaignId) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) {
          throw new Error('Campaign not found');
        }

        // Get detailed analytics for specific campaign
        const linkedinAnalytics = await this.linkedinClient.getOutreachAnalytics();
        const twitterAnalytics = await this.twitterClient.getOutreachAnalytics();

        return {
          campaign: campaign,
          linkedin: linkedinAnalytics,
          twitter: twitterAnalytics,
          combined: {
            totalOutreach: (linkedinAnalytics?.totalOutreach || 0) + (twitterAnalytics?.totalOutreach || 0),
            averageSuccessRate: ((linkedinAnalytics?.successRate || 0) + (twitterAnalytics?.successRate || 0)) / 2
          }
        };
      } else {
        // Get overall analytics
        const allCampaigns = Array.from(this.campaigns.values());
        const totalLeads = allCampaigns.reduce((sum, c) => sum + c.leads.length, 0);
        const totalSent = allCampaigns.reduce((sum, c) => sum + c.stats.sent, 0);

        return {
          totalCampaigns: allCampaigns.length,
          totalLeads,
          totalSent,
          activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
          completedCampaigns: allCampaigns.filter(c => c.status === 'completed').length
        };
      }

    } catch (error) {
      console.error('Failed to get analytics:', error.message);
      return null;
    }
  }

  /**
   * Generate campaign ID
   */
  generateCampaignId() {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save campaign to file
   */
  async saveCampaign(campaign) {
    try {
      const campaignFile = path.join(__dirname, `../data/campaigns/${campaign.id}.json`);
      await fs.mkdir(path.dirname(campaignFile), { recursive: true });
      await fs.writeFile(campaignFile, JSON.stringify(campaign, null, 2));
      
      console.log(`💾 Campaign saved: ${campaign.id}`);
    } catch (error) {
      console.error('Failed to save campaign:', error.message);
    }
  }

  /**
   * Load campaign from file
   */
  async loadCampaign(campaignId) {
    try {
      const campaignFile = path.join(__dirname, `../data/campaigns/${campaignId}.json`);
      const campaignData = await fs.readFile(campaignFile, 'utf8');
      const campaign = JSON.parse(campaignData);
      
      this.campaigns.set(campaignId, campaign);
      return campaign;
    } catch (error) {
      console.error('Failed to load campaign:', error.message);
      return null;
    }
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log activities
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
   * Run test campaign
   */
  async runTest(testLeads = null) {
    try {
      console.log('🧪 Running test DM campaign...');
      
      const mockLeads = testLeads || [
        {
          id: 'test_linkedin_1',
          name: 'John Smith',
          title: 'VP of Engineering',
          company: 'TechCorp',
          platform: 'linkedin',
          profileUrl: 'https://linkedin.com/in/johnsmith',
          score: 85,
          keywords: ['AI', 'automation']
        },
        {
          id: 'test_twitter_1',
          username: 'techfounder',
          name: 'Mike Chen',
          bio: 'Building the future of AI | CEO @StartupCo',
          platform: 'twitter',
          profileUrl: 'https://twitter.com/techfounder',
          score: 78,
          keywords: ['AI', 'startups']
        }
      ];

      const testCampaign = {
        name: 'Test DM Campaign',
        leads: mockLeads,
        template: 'cold-outreach',
        platforms: ['linkedin', 'twitter'],
        delay: 5000, // 5 seconds for testing
        dailyLimit: 10
      };

      console.log('📋 Test campaign configuration:');
      console.log(`  • Leads: ${testCampaign.leads.length}`);
      console.log(`  • Platforms: ${testCampaign.platforms.join(', ')}`);
      console.log(`  • Template: ${testCampaign.template}`);
      
      // Note: This is a dry run - no actual messages sent
      console.log('🔍 DRY RUN - No actual messages will be sent');
      
      console.log('─'.repeat(60));
      
      for (const lead of testCampaign.leads) {
        console.log(`\n👤 Would process: ${lead.name}`);
        console.log(`   Platform: ${lead.platform}`);
        console.log(`   Score: ${lead.score}`);
        console.log(`   Action: ${lead.platform === 'linkedin' ? 'Send connection request' : 'Engage with content'}`);
      }
      
      console.log('─'.repeat(60));
      console.log('🧪 Test completed successfully');
      console.log('💡 To run live campaign, use: agent.startCampaign(config)');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const agent = new DMDispatcherAgent();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
      await agent.runTest();
    } else {
      // Initialize for interactive use
      await agent.initialize();
      console.log('🚀 DM Dispatcher Agent ready for campaigns');
    }
    
  } catch (error) {
    console.error('❌ DM Dispatcher execution failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = DMDispatcherAgent;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 