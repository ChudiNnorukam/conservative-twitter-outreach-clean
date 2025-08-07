#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const DMDispatcherAgent = require('./agents/dm-dispatcher-agent');

async function runCampaign() {
  try {
    console.log('🚀 Starting Lead Generation DM Campaign...');
    
    // Load leads from file
    const leadsPath = path.join(__dirname, 'data/leads-2025-08-07.json');
    const leadsData = await fs.readFile(leadsPath, 'utf8');
    const leads = JSON.parse(leadsData);
    
    console.log(`📨 Loaded ${leads.length} leads from file`);
    
    // Initialize agent
    const agent = new DMDispatcherAgent();
    await agent.initialize();
    
    // Create campaign configuration
    const campaignConfig = {
      name: 'First Lead Generation Campaign',
      leads: leads,
      template: 'cold-outreach',
      platforms: ['linkedin', 'twitter'],
      delay: 300000, // 5 minutes between messages
      dailyLimit: 10,
      followUpDelay: 3, // days
      maxFollowUps: 2
    };
    
    console.log('🎯 Campaign configuration:');
    console.log(`  • Name: ${campaignConfig.name}`);
    console.log(`  • Leads: ${campaignConfig.leads.length}`);
    console.log(`  • Platforms: ${campaignConfig.platforms.join(', ')}`);
    console.log(`  • Template: ${campaignConfig.template}`);
    console.log(`  • Daily Limit: ${campaignConfig.dailyLimit}`);
    
    // Start the campaign
    await agent.startCampaign(campaignConfig);
    
    console.log('✅ Campaign completed successfully!');
    
  } catch (error) {
    console.error('❌ Campaign failed:', error.message);
    process.exit(1);
  }
}

// Run the campaign
runCampaign(); 