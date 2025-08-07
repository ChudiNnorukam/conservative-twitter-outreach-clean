# 🚀 Quick Start Guide

## 1. Installation

```bash
cd /Users/chudinnorukam/Documents/n8n/lead-generation-dm-system
npm install
```

## 2. Environment Setup

Copy your existing API credentials to a `.env` file:

```bash
# LinkedIn API (use your existing credentials)
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
LINKEDIN_PERSON_ID=your_linkedin_person_id

# Twitter API (use your existing credentials)  
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

## 3. Test the System

### Test Lead Hunter
```bash
npm run hunt-test
```

### Test DM Dispatcher
```bash
npm run test
```

## 4. Run Lead Generation

### Hunt for leads
```bash
npm run hunt
```

### Start a DM campaign
```javascript
const DMDispatcher = require('./agents/dm-dispatcher-agent');
const LeadHunter = require('./agents/lead-hunter-agent');

async function runCampaign() {
  // 1. Hunt for leads
  const hunter = new LeadHunter();
  const leads = await hunter.huntLeads({
    platforms: ['linkedin', 'twitter'],
    keywords: ['AI', 'automation'],
    titles: ['CEO', 'CTO', 'Founder'],
    industries: ['Technology', 'SaaS']
  });

  // 2. Start DM campaign
  const dispatcher = new DMDispatcher();
  const campaign = await dispatcher.startCampaign({
    name: 'AI Automation Outreach',
    leads: leads.slice(0, 10), // Start small
    template: 'cold-outreach',
    platforms: ['linkedin', 'twitter'],
    dailyLimit: 20
  });

  console.log('Campaign completed:', campaign.id);
}

runCampaign().catch(console.error);
```

## 5. View Analytics

```bash
npm run analytics
```

## 📋 Important Notes

### LinkedIn Messaging Requirements
- LinkedIn messaging API requires **special partner approval**
- For now, the system will work with connection requests
- Once approved as partner, full messaging capabilities will activate

### Twitter DM Requirements
- Twitter DMs work out of the box with your existing API
- Rate limits: 1000 DMs per day, 5 per conversation
- Users must follow you OR you must follow them for DMs

### Compliance Features
- ✅ Rate limiting built-in
- ✅ Daily quotas enforced  
- ✅ Message personalization
- ✅ Conversation tracking
- ✅ Analytics and reporting

## 🎯 Usage Examples

### Target Tech Executives
```javascript
const criteria = {
  platforms: ['linkedin'],
  titles: ['CTO', 'VP Engineering', 'Head of Engineering'],
  industries: ['Technology', 'Software'],
  keywords: ['AI', 'automation', 'engineering'],
  companySize: ['50-200', '200-1000']
};
```

### Target Marketing Leaders  
```javascript
const criteria = {
  platforms: ['twitter', 'linkedin'],
  titles: ['CMO', 'VP Marketing', 'Head of Marketing'],
  industries: ['SaaS', 'E-commerce'],
  keywords: ['marketing', 'growth', 'analytics'],
  competitorAccounts: ['hubspot', 'salesforce']
};
```

## 🔧 Advanced Configuration

### Custom Message Templates
Edit `templates/cold-outreach.json` to customize messages

### Lead Criteria
Edit `config/lead-criteria.json` to adjust targeting

### Rate Limits
Modify daily limits in the client files:
- `utils/linkedin-dm-client.js`
- `utils/twitter-dm-client.js`

## 📊 Analytics Available

- Lead generation metrics
- Outreach performance  
- Response rates
- Conversion tracking
- Platform-specific analytics
- Campaign comparisons

## 🛡️ Safety Features

- **Automatic rate limiting**: Prevents API violations
- **Daily quotas**: Ensures compliance with platform rules
- **Message deduplication**: Prevents duplicate outreach
- **Conversation tracking**: Avoids over-messaging
- **Audit trails**: Complete activity logging

## 💡 Next Steps

1. **Test thoroughly** with small batches first
2. **Monitor analytics** to optimize performance
3. **Adjust templates** based on response rates
4. **Scale gradually** as you refine the process
5. **Apply for LinkedIn partner status** for full messaging capabilities

---

**Questions?** Check the logs in `/logs/` directory for detailed information about all activities. 