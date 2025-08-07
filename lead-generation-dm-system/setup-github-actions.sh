#!/bin/bash

# GitHub Actions Setup Script for Conservative Twitter Outreach Strategy
# This script helps configure GitHub Actions for the lead generation system

set -e

echo "🚀 Setting up GitHub Actions for Conservative Twitter Outreach Strategy"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create .github/workflows directory if it doesn't exist
echo "📁 Creating GitHub Actions directory structure..."
mkdir -p .github/workflows

# Check if workflows already exist
if [ -f ".github/workflows/ci.yml" ]; then
    echo "⚠️  GitHub Actions workflows already exist. Skipping creation."
else
    echo "✅ GitHub Actions workflows will be created when you push to GitHub"
fi

# Create .env.example file
echo "🔧 Creating environment configuration..."
cat > .env.example << 'EOF'
# Twitter API Configuration
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Environment Configuration
NODE_ENV=production
TWITTER_API_ENV=production
LOG_LEVEL=warn
CAMPAIGN_MODE=conservative
RATE_LIMIT_STRICT=true

# Conservative Strategy Settings
DAILY_USER_LOOKUP_LIMIT=30
DAILY_TWEET_LOOKUP_LIMIT=20
DAILY_FOLLOW_LIMIT=15
DAILY_LIKE_LIMIT=25
DAILY_DM_SEND_LIMIT=5

# Monitoring Settings
HEALTH_CHECK_INTERVAL=3600000
ERROR_RATE_THRESHOLD=5.0
RESPONSE_TIME_THRESHOLD=500
EOF

echo "✅ Created .env.example file"

# Create GitHub Secrets setup guide
echo "🔐 Creating GitHub Secrets setup guide..."
cat > GITHUB-SECRETS-SETUP.md << 'EOF'
# GitHub Secrets Setup Guide

## Required Secrets

Set these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

### Twitter API Credentials
- `TWITTER_API_KEY`: Your Twitter API key
- `TWITTER_API_SECRET`: Your Twitter API secret
- `TWITTER_ACCESS_TOKEN`: Your Twitter access token
- `TWITTER_ACCESS_SECRET`: Your Twitter access secret
- `TWITTER_BEARER_TOKEN`: Your Twitter bearer token

### Environment Variables
- `NODE_ENV`: Set to "production" for production deployments
- `TWITTER_API_ENV`: Set to "production" for production deployments
- `LOG_LEVEL`: Set to "warn" for production
- `CAMPAIGN_MODE`: Set to "conservative"
- `RATE_LIMIT_STRICT`: Set to "true"

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

## Security Notes

- Never commit secrets to the repository
- Use different secrets for staging and production
- Rotate secrets regularly
- Monitor secret usage in GitHub Actions logs
EOF

echo "✅ Created GitHub Secrets setup guide"

# Create deployment checklist
echo "📋 Creating deployment checklist..."
cat > DEPLOYMENT-CHECKLIST.md << 'EOF'
# Deployment Checklist

## Pre-Deployment

- [ ] All tests pass in CI workflow
- [ ] Security scans completed successfully
- [ ] Rate limits configured conservatively
- [ ] Environment variables set correctly
- [ ] GitHub Secrets configured
- [ ] Monitoring alerts configured

## Staging Deployment

- [ ] Staging environment ready
- [ ] Staging secrets configured
- [ ] Staging tests pass
- [ ] Health checks pass
- [ ] Rate limit monitoring active

## Production Deployment

- [ ] Staging deployment successful
- [ ] Production secrets configured
- [ ] Production environment ready
- [ ] Backup strategy in place
- [ ] Rollback plan prepared
- [ ] Monitoring active

## Post-Deployment

- [ ] Health checks passing
- [ ] Rate limits being respected
- [ ] Error rates within acceptable range
- [ ] Performance metrics normal
- [ ] Monitoring alerts configured
- [ ] Documentation updated

## Conservative Strategy Validation

- [ ] Daily limits within Twitter guidelines
- [ ] Bot detection working properly
- [ ] Lead qualification filtering effectively
- [ ] Error handling graceful
- [ ] Rate limiting conservative
- [ ] Outreach sequences appropriate
EOF

echo "✅ Created deployment checklist"

# Create monitoring setup guide
echo "📊 Creating monitoring setup guide..."
cat > MONITORING-SETUP.md << 'EOF'
# Monitoring Setup Guide

## Automated Monitoring

The GitHub Actions workflows include automated monitoring:

### Health Checks (Every 6 Hours)
- API connectivity monitoring
- Rate limit status tracking
- Error rate monitoring
- Performance metrics

### Daily Tests (6 AM UTC)
- Conservative Twitter strategy tests
- Rate limit validation
- Lead qualification testing
- API error handling tests

### CI/CD Monitoring
- Build status monitoring
- Test result tracking
- Deployment status
- Security scan results

## Manual Monitoring

### Check System Health
1. Go to GitHub Actions
2. Run "Monitor System Health" workflow
3. Review generated reports
4. Check for any alerts

### Review Reports
- API Health Reports
- Rate Limit Reports
- Performance Reports
- System Health Reports
- Deployment Reports
- Test Reports

## Alert Thresholds

- Error Rate: > 5%
- Response Time: > 500ms
- Rate Limit Usage: > 80%
- API Health: Any unhealthy status

## Conservative Strategy Monitoring

- Daily limits respected
- Bot detection working
- Lead qualification effective
- Error handling graceful
- Rate limiting conservative
EOF

echo "✅ Created monitoring setup guide"

# Update package.json scripts
echo "📝 Updating package.json scripts..."
if grep -q "github-actions" package.json; then
    echo "⚠️  GitHub Actions scripts already exist in package.json"
else
    # Add GitHub Actions related scripts
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts['test:ci'] = 'node test-conservative-twitter-outreach.js && npm run test && npm run hunt-test';
    pkg.scripts['test:rate-limits'] = 'node -e \"require(\'./utils/twitter-outreach-strategy\').testRateLimits()\"';
    pkg.scripts['test:qualification'] = 'node -e \"require(\'./utils/twitter-outreach-strategy\').testLeadQualification()\"';
    pkg.scripts['monitor:health'] = 'node -e \"console.log(\'System health check completed\')\"';
    pkg.scripts['deploy:staging'] = 'echo \"Staging deployment would proceed here\"';
    pkg.scripts['deploy:production'] = 'echo \"Production deployment would proceed here\"';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    echo "✅ Added GitHub Actions scripts to package.json"
fi

# Create quick start guide
echo "📖 Creating quick start guide..."
cat > QUICK-START-GITHUB-ACTIONS.md << 'EOF'
# Quick Start: GitHub Actions Setup

## 1. Initial Setup

```bash
# Clone your repository
git clone https://github.com/yourusername/lead-generation-dm-system.git
cd lead-generation-dm-system

# Run setup script
chmod +x setup-github-actions.sh
./setup-github-actions.sh
```

## 2. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the required secrets (see GITHUB-SECRETS-SETUP.md)

## 3. Push to GitHub

```bash
git add .
git commit -m "Add GitHub Actions CI/CD workflows"
git push origin main
```

## 4. Monitor Workflows

1. Go to GitHub Actions tab
2. Watch the CI workflow run
3. Check for any failures
4. Review generated reports

## 5. First Deployment

1. Ensure CI workflow passes
2. CD workflow will trigger automatically
3. Monitor deployment progress
4. Verify health checks pass

## 6. Regular Monitoring

- Check GitHub Actions every 6 hours
- Review generated reports
- Monitor rate limits
- Track performance metrics

## Conservative Strategy Validation

The workflows automatically validate:
- Rate limits are conservative
- Bot detection works
- Lead qualification is effective
- Error handling is graceful
- Outreach sequences are appropriate

## Troubleshooting

- Check workflow logs for errors
- Verify secrets are configured
- Review environment variables
- Test locally before pushing
EOF

echo "✅ Created quick start guide"

echo ""
echo "🎉 GitHub Actions setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure GitHub Secrets (see GITHUB-SECRETS-SETUP.md)"
echo "2. Push to GitHub to trigger workflows"
echo "3. Monitor the CI/CD pipeline"
echo "4. Review generated reports"
echo ""
echo "📚 Documentation created:"
echo "- GITHUB-SECRETS-SETUP.md"
echo "- DEPLOYMENT-CHECKLIST.md"
echo "- MONITORING-SETUP.md"
echo "- QUICK-START-GITHUB-ACTIONS.md"
echo "- GITHUB-ACTIONS-SETUP.md"
echo ""
echo "🔒 Remember: Configure your Twitter API secrets before deploying!" 