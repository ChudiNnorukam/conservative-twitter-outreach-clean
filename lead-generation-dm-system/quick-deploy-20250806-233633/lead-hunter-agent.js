#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

/**
 * Lead Hunter Agent for Chudi Nnorukam
 * Finds qualified prospects using LinkedIn, Twitter, and web scraping
 * Integrates with existing autocontent agent infrastructure
 */
class LeadHunterAgent {
  constructor() {
    this.config = null;
    this.leads = new Map();
    this.isInitialized = false;
    this.logPath = path.join(__dirname, '../logs/lead-hunter.log');
  }

  /**
   * Initialize the lead hunter agent
   */
  async initialize() {
    try {
      console.log('🔍 Initializing Lead Hunter Agent...');

      // Load configuration
      await this.loadConfig();
      
      this.isInitialized = true;
      console.log('✅ Lead Hunter Agent initialized successfully');
      await this.log('Lead Hunter Agent initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Lead Hunter Agent:', error.message);
      throw error;
    }
  }

  /**
   * Load lead hunting configuration
   */
  async loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/lead-criteria.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('📋 Lead criteria configuration loaded');
    } catch (error) {
      throw new Error(`Failed to load lead criteria: ${error.message}`);
    }
  }

  /**
   * Hunt for leads based on criteria
   */
  async huntLeads(criteria = null) {
    try {
      if (!this.isInitialized) await this.initialize();

      const searchCriteria = criteria || this.config.defaultCriteria;
      console.log('🎯 Starting lead hunt with criteria:', searchCriteria);

      const leads = [];

      // 1. LinkedIn People Search (compliant)
      if (searchCriteria.platforms.includes('linkedin')) {
        const linkedinLeads = await this.searchLinkedInProspects(searchCriteria);
        leads.push(...linkedinLeads);
      }

      // 2. Twitter/X Advanced Search
      if (searchCriteria.platforms.includes('twitter')) {
        const twitterLeads = await this.searchTwitterProspects(searchCriteria);
        leads.push(...twitterLeads);
      }

      // 3. Web scraping (public sources only)
      if (searchCriteria.platforms.includes('web')) {
        const webLeads = await this.searchWebProspects(searchCriteria);
        leads.push(...webLeads);
      }

      // 4. Company research
      if (searchCriteria.companies && searchCriteria.companies.length > 0) {
        const companyLeads = await this.searchCompanyEmployees(searchCriteria);
        leads.push(...companyLeads);
      }

      // Deduplicate and score leads
      const qualifiedLeads = await this.deduplicateAndScore(leads);

      console.log(`🎉 Found ${qualifiedLeads.length} qualified leads`);
      await this.log(`Found ${qualifiedLeads.length} qualified leads`);

      return qualifiedLeads;

    } catch (error) {
      console.error('❌ Lead hunting failed:', error.message);
      await this.log(`Lead hunting failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search LinkedIn for prospects (using public API endpoints)
   */
  async searchLinkedInProspects(criteria) {
    try {
      console.log('🔍 Searching LinkedIn prospects...');
      
      // Use LinkedIn Sales Navigator-style search (if available)
      // or public profile searches through existing connections
      
      const prospects = [];
      
      // Search through existing connections' networks
      if (criteria.keywords) {
        for (const keyword of criteria.keywords) {
          const searchResults = await this.linkedinKeywordSearch(keyword, criteria);
          prospects.push(...searchResults);
        }
      }

      // Industry-specific searches
      if (criteria.industries) {
        for (const industry of criteria.industries) {
          const industryResults = await this.linkedinIndustrySearch(industry, criteria);
          prospects.push(...industryResults);
        }
      }

      return prospects;

    } catch (error) {
      console.error('❌ LinkedIn prospect search failed:', error.message);
      return [];
    }
  }

  /**
   * Search LinkedIn by keyword (compliant public search)
   */
  async linkedinKeywordSearch(keyword, criteria) {
    try {
      // This would use LinkedIn's public search API or
      // search through your existing connections' public data
      
      const mockResults = [
        {
          platform: 'linkedin',
          id: `linkedin_${Date.now()}_1`,
          name: 'John Smith',
          title: 'VP of Engineering',
          company: 'TechCorp',
          industry: 'Technology',
          location: 'San Francisco, CA',
          profileUrl: 'https://linkedin.com/in/johnsmith',
          keywords: [keyword],
          score: 0,
          source: 'keyword_search',
          lastActivity: new Date().toISOString(),
          mutualConnections: 5,
          recentPosts: [
            {
              content: `Interesting insights about ${keyword}...`,
              date: new Date().toISOString(),
              engagement: { likes: 12, comments: 3 }
            }
          ]
        }
      ];

      // Filter based on criteria
      return mockResults.filter(prospect => 
        this.matchesCriteria(prospect, criteria)
      );

    } catch (error) {
      console.error('❌ LinkedIn keyword search failed:', error.message);
      return [];
    }
  }

  /**
   * Search LinkedIn by industry
   */
  async linkedinIndustrySearch(industry, criteria) {
    try {
      // Industry-specific prospect search
      const mockResults = [
        {
          platform: 'linkedin',
          id: `linkedin_industry_${Date.now()}`,
          name: 'Sarah Johnson',
          title: 'Director of Marketing',
          company: 'GrowthCo',
          industry: industry,
          location: 'New York, NY',
          profileUrl: 'https://linkedin.com/in/sarahjohnson',
          keywords: [industry.toLowerCase()],
          score: 0,
          source: 'industry_search',
          lastActivity: new Date().toISOString(),
          companySize: '100-500',
          recentPosts: [
            {
              content: `Scaling ${industry} operations...`,
              date: new Date().toISOString(),
              engagement: { likes: 8, comments: 2 }
            }
          ]
        }
      ];

      return mockResults.filter(prospect => 
        this.matchesCriteria(prospect, criteria)
      );

    } catch (error) {
      console.error('❌ LinkedIn industry search failed:', error.message);
      return [];
    }
  }

  /**
   * Search Twitter/X for prospects
   */
  async searchTwitterProspects(criteria) {
    try {
      console.log('🐦 Searching Twitter prospects...');
      
      const prospects = [];

      // Search by keywords in bios and recent tweets
      if (criteria.keywords) {
        for (const keyword of criteria.keywords) {
          const twitterResults = await this.twitterKeywordSearch(keyword, criteria);
          prospects.push(...twitterResults);
        }
      }

      // Search followers of relevant accounts
      if (criteria.competitorAccounts) {
        for (const account of criteria.competitorAccounts) {
          const followerResults = await this.twitterFollowerSearch(account, criteria);
          prospects.push(...followerResults);
        }
      }

      return prospects;

    } catch (error) {
      console.error('❌ Twitter prospect search failed:', error.message);
      return [];
    }
  }

  /**
   * Search Twitter by keyword
   */
  async twitterKeywordSearch(keyword, criteria) {
    try {
      // Use Twitter API v2 search for users mentioning keywords
      const mockResults = [
        {
          platform: 'twitter',
          id: `twitter_${Date.now()}_1`,
          username: 'techfounder',
          name: 'Mike Chen',
          bio: `Building the future of ${keyword} | CEO @StartupCo`,
          location: 'Austin, TX',
          profileUrl: 'https://twitter.com/techfounder',
          keywords: [keyword],
          score: 0,
          source: 'twitter_keyword_search',
          followerCount: 1250,
          followingCount: 890,
          verified: false,
          recentTweets: [
            {
              content: `Just launched our new ${keyword} feature...`,
              date: new Date().toISOString(),
              engagement: { retweets: 5, likes: 23, replies: 3 }
            }
          ]
        }
      ];

      return mockResults.filter(prospect => 
        this.matchesCriteria(prospect, criteria)
      );

    } catch (error) {
      console.error('❌ Twitter keyword search failed:', error.message);
      return [];
    }
  }

  /**
   * Search Twitter followers of specific accounts
   */
  async twitterFollowerSearch(targetAccount, criteria) {
    try {
      // Search followers of competitor/relevant accounts
      const mockResults = [
        {
          platform: 'twitter',
          id: `twitter_follower_${Date.now()}`,
          username: 'saasbuilder',
          name: 'Alex Rodriguez',
          bio: 'Product Manager | SaaS Enthusiast | Building better tools',
          location: 'Remote',
          profileUrl: 'https://twitter.com/saasbuilder',
          keywords: ['saas', 'product'],
          score: 0,
          source: 'follower_search',
          targetAccount: targetAccount,
          followerCount: 890,
          followingCount: 1200,
          verified: false
        }
      ];

      return mockResults.filter(prospect => 
        this.matchesCriteria(prospect, criteria)
      );

    } catch (error) {
      console.error('❌ Twitter follower search failed:', error.message);
      return [];
    }
  }

  /**
   * Search web sources for prospects
   */
  async searchWebProspects(criteria) {
    try {
      console.log('🌐 Searching web sources...');
      
      // This would integrate with tools like:
      // - Apollo.io API
      // - Hunter.io API
      // - ZoomInfo API
      // - Company websites (public directories)
      
      const mockResults = [
        {
          platform: 'web',
          id: `web_${Date.now()}_1`,
          name: 'Jennifer Lee',
          title: 'Chief Technology Officer',
          company: 'InnovateTech',
          email: 'jennifer.lee@innovatetech.com',
          industry: 'Software',
          location: 'Seattle, WA',
          source: 'company_website',
          companySize: '50-200',
          keywords: criteria.keywords || [],
          score: 0
        }
      ];

      return mockResults.filter(prospect => 
        this.matchesCriteria(prospect, criteria)
      );

    } catch (error) {
      console.error('❌ Web prospect search failed:', error.message);
      return [];
    }
  }

  /**
   * Search employees of specific companies
   */
  async searchCompanyEmployees(criteria) {
    try {
      console.log('🏢 Searching company employees...');
      
      const prospects = [];

      for (const company of criteria.companies) {
        // Use LinkedIn Company API or public company pages
        const employees = await this.getCompanyEmployees(company, criteria);
        prospects.push(...employees);
      }

      return prospects;

    } catch (error) {
      console.error('❌ Company employee search failed:', error.message);
      return [];
    }
  }

  /**
   * Get employees from a specific company
   */
  async getCompanyEmployees(company, criteria) {
    try {
      const mockResults = [
        {
          platform: 'linkedin',
          id: `company_${Date.now()}_${company}`,
          name: 'David Park',
          title: 'Head of Product',
          company: company,
          industry: 'Technology',
          location: 'San Francisco, CA',
          profileUrl: `https://linkedin.com/in/davidpark`,
          source: 'company_search',
          department: 'Product',
          seniority: 'Director',
          score: 0
        }
      ];

      return mockResults.filter(prospect => 
        this.matchesCriteria(prospect, criteria)
      );

    } catch (error) {
      console.error(`❌ Failed to get employees for ${company}:`, error.message);
      return [];
    }
  }

  /**
   * Check if prospect matches criteria
   */
  matchesCriteria(prospect, criteria) {
    // Title matching
    if (criteria.titles && criteria.titles.length > 0) {
      const titleMatch = criteria.titles.some(title => 
        prospect.title && prospect.title.toLowerCase().includes(title.toLowerCase())
      );
      if (!titleMatch) return false;
    }

    // Industry matching
    if (criteria.industries && criteria.industries.length > 0) {
      const industryMatch = criteria.industries.some(industry => 
        prospect.industry && prospect.industry.toLowerCase().includes(industry.toLowerCase())
      );
      if (!industryMatch) return false;
    }

    // Location matching
    if (criteria.locations && criteria.locations.length > 0) {
      const locationMatch = criteria.locations.some(location => 
        prospect.location && prospect.location.toLowerCase().includes(location.toLowerCase())
      );
      if (!locationMatch) return false;
    }

    // Company size matching (if available)
    if (criteria.companySize && prospect.companySize) {
      // Parse company size ranges and match
      // This is simplified - would need more robust matching
    }

    return true;
  }

  /**
   * Deduplicate and score leads
   */
  async deduplicateAndScore(leads) {
    try {
      // Deduplicate by email, LinkedIn profile, or name+company
      const uniqueLeads = new Map();

      for (const lead of leads) {
        const key = this.generateLeadKey(lead);
        
        if (!uniqueLeads.has(key)) {
          // Calculate initial score
          lead.score = this.calculateLeadScore(lead);
          uniqueLeads.set(key, lead);
        } else {
          // Merge data from duplicate sources
          const existing = uniqueLeads.get(key);
          const merged = this.mergeLeadData(existing, lead);
          uniqueLeads.set(key, merged);
        }
      }

      // Convert to array and sort by score
      const scoredLeads = Array.from(uniqueLeads.values())
        .sort((a, b) => b.score - a.score);

      return scoredLeads;

    } catch (error) {
      console.error('❌ Lead deduplication failed:', error.message);
      return leads;
    }
  }

  /**
   * Generate unique key for lead
   */
  generateLeadKey(lead) {
    if (lead.email) {
      return lead.email.toLowerCase();
    }
    
    if (lead.profileUrl) {
      return lead.profileUrl.toLowerCase();
    }
    
    // Fallback to name + company
    return `${(lead.name || '').toLowerCase()}_${(lead.company || '').toLowerCase()}`;
  }

  /**
   * Calculate lead quality score
   */
  calculateLeadScore(lead) {
    let score = 0;

    // Platform bonus
    if (lead.platform === 'linkedin') score += 30;
    if (lead.platform === 'twitter') score += 20;
    if (lead.platform === 'web') score += 10;

    // Title relevance
    if (lead.title) {
      const seniorTitles = ['ceo', 'cto', 'vp', 'director', 'head', 'founder'];
      if (seniorTitles.some(title => lead.title.toLowerCase().includes(title))) {
        score += 25;
      }
    }

    // Recent activity bonus
    if (lead.lastActivity) {
      const daysSinceActivity = (Date.now() - new Date(lead.lastActivity)) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity < 7) score += 15;
      else if (daysSinceActivity < 30) score += 10;
    }

    // Mutual connections bonus (LinkedIn)
    if (lead.mutualConnections) {
      score += Math.min(lead.mutualConnections * 2, 20);
    }

    // Follower count bonus (Twitter)
    if (lead.followerCount) {
      if (lead.followerCount > 1000) score += 15;
      else if (lead.followerCount > 500) score += 10;
      else if (lead.followerCount > 100) score += 5;
    }

    // Company size bonus
    if (lead.companySize) {
      if (lead.companySize.includes('100-500') || lead.companySize.includes('500+')) {
        score += 10;
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Merge data from duplicate leads
   */
  mergeLeadData(existing, duplicate) {
    const merged = { ...existing };

    // Merge keywords
    if (duplicate.keywords) {
      merged.keywords = [...new Set([...merged.keywords, ...duplicate.keywords])];
    }

    // Use highest score
    merged.score = Math.max(merged.score, duplicate.score || 0);

    // Merge recent posts/tweets
    if (duplicate.recentPosts) {
      merged.recentPosts = [...(merged.recentPosts || []), ...duplicate.recentPosts];
    }
    if (duplicate.recentTweets) {
      merged.recentTweets = [...(merged.recentTweets || []), ...duplicate.recentTweets];
    }

    // Update with more complete data
    Object.keys(duplicate).forEach(key => {
      if (!merged[key] && duplicate[key]) {
        merged[key] = duplicate[key];
      }
    });

    return merged;
  }

  /**
   * Save leads to file
   */
  async saveLeads(leads, filename = null) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filepath = filename || path.join(__dirname, `../data/leads-${timestamp}.json`);
      
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, JSON.stringify(leads, null, 2));
      
      console.log(`💾 Saved ${leads.length} leads to ${filepath}`);
      await this.log(`Saved ${leads.length} leads to ${filepath}`);
      
      return filepath;

    } catch (error) {
      console.error('❌ Failed to save leads:', error.message);
      throw error;
    }
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
   * Run a test lead hunt
   */
  async runTest(criteria = null) {
    try {
      console.log('🧪 Running test lead hunt...');
      
      const testCriteria = criteria || {
        platforms: ['linkedin', 'twitter'],
        keywords: ['AI', 'automation', 'SaaS'],
        titles: ['CEO', 'CTO', 'Founder', 'VP'],
        industries: ['Technology', 'Software'],
        locations: ['San Francisco', 'New York', 'Remote'],
        companySize: ['50-200', '200-1000']
      };

      const leads = await this.huntLeads(testCriteria);
      
      console.log('🎯 Test Results:');
      console.log('─'.repeat(60));
      
      leads.slice(0, 5).forEach((lead, index) => {
        console.log(`\n${index + 1}. ${lead.name} (Score: ${lead.score})`);
        console.log(`   Title: ${lead.title}`);
        console.log(`   Company: ${lead.company}`);
        console.log(`   Platform: ${lead.platform}`);
        console.log(`   Source: ${lead.source}`);
      });
      
      console.log('─'.repeat(60));
      console.log(`📊 Total leads found: ${leads.length}`);
      console.log(`🏆 Average score: ${(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length).toFixed(1)}`);
      
      // Save test results
      await this.saveLeads(leads, path.join(__dirname, '../data/test-leads.json'));
      
      console.log('🧪 Test completed successfully');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const agent = new LeadHunterAgent();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
      await agent.runTest();
    } else {
      // Custom criteria from command line or config
      const leads = await agent.huntLeads();
      await agent.saveLeads(leads);
    }
    
  } catch (error) {
    console.error('❌ Lead Hunter execution failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = LeadHunterAgent;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 