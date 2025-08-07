# GitHub Actions Deployment Guide

## Overview

This guide will help you deploy the Conservative Twitter Outreach GitHub Actions workflows to your target repository: `https://github.com/ChudiNnorukam/conservative-twitter-outreach-clean`

## Workflows Included

### 1. `ci.yml` - Continuous Integration
- **Purpose**: Conservative Twitter outreach testing and validation
- **Triggers**: Push to main/develop, pull requests, daily health checks
- **Features**:
  - Project structure validation
  - Conservative rate limit testing
  - Security vulnerability checks
  - Performance testing with conservative limits
  - Build packaging for deployment

### 2. `deploy.yml` - Continuous Deployment
- **Purpose**: Deploy to staging and production with conservative limits
- **Triggers**: After successful CI workflow, manual dispatch
- **Features**:
  - Conservative strategy validation
  - Staging deployment with reduced limits
  - Production deployment with strict limits
  - Health monitoring and rollback capability

### 3. `test-twitter-strategy.yml` - Twitter Strategy Testing
- **Purpose**: Specialized testing for conservative Twitter outreach
- **Triggers**: Changes to Twitter strategy files, daily testing, manual dispatch
- **Features**:
  - Rate limit and API quota testing
  - Lead qualification logic testing
  - Outreach sequence generation testing
  - API validation and error handling

### 4. `monitor.yml` - System Health Monitoring
- **Purpose**: Monitor system health and conservative compliance
- **Triggers**: Every 6 hours, manual dispatch
- **Features**:
  - API health monitoring
  - Rate limit status tracking
  - Performance metrics monitoring
  - Conservative strategy compliance checks

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

If you have GitHub CLI installed:

```bash
# Navigate to the project directory
cd lead-generation-dm-system

# Run the deployment script
./deploy-github-actions.sh
```

### Method 2: Manual Deployment

1. **Clone your target repository**:
   ```bash
   git clone https://github.com/ChudiNnorukam/conservative-twitter-outreach-clean.git
   cd conservative-twitter-outreach-clean
   ```

2. **Create the workflows directory**:
   ```bash
   mkdir -p .github/workflows
   ```

3. **Copy the workflow files**:
   ```bash
   cp ../lead-generation-dm-system/.github/workflows/* .github/workflows/
   ```

4. **Commit and push**:
   ```bash
   git add .github/workflows/
   git commit -m "Deploy conservative Twitter outreach GitHub Actions workflows"
   git push origin main
   ```

### Method 3: Using the Deployment Package

1. **Run the deployment script to create a package**:
   ```bash
   cd lead-generation-dm-system
   ./deploy-github-actions.sh
   ```

2. **Copy files from the generated package**:
   ```bash
   cp github-actions-deploy/* /path/to/your/target/repo/.github/workflows/
   ```

## Required Setup

### 1. GitHub Secrets

Set up the following secrets in your target repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:

```
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### 2. Environment Configuration

The workflows will automatically create environment files with conservative limits:

**Staging Environment**:
- Daily DMs: 3
- Daily Follows: 10
- Daily Likes: 15

**Production Environment**:
- Daily DMs: 5
- Daily Follows: 15
- Daily Likes: 25
- Daily User Lookups: 30
- Daily Tweet Lookups: 20

### 3. Repository Settings

1. **Enable GitHub Actions**: Ensure Actions are enabled in your repository
2. **Set up branch protection**: Protect the main branch to require CI checks
3. **Configure environments**: Set up staging and production environments if needed

## Conservative Strategy Features

### Rate Limiting
- All workflows enforce conservative daily limits
- Automatic rate limit monitoring and alerts
- Graceful handling of API quota exhaustion

### Security
- Secrets validation before deployment
- Code security scanning
- Conservative strategy compliance checks

### Testing
- Comprehensive test coverage for conservative outreach
- Lead qualification testing
- API error handling validation

### Monitoring
- Real-time health monitoring
- Performance metrics tracking
- Conservative compliance verification

## Workflow Triggers

### CI Workflow (`ci.yml`)
- **Push**: Any push to main or develop branches
- **Pull Request**: Any PR targeting main branch
- **Schedule**: Daily at 2 AM UTC for health checks

### Deploy Workflow (`deploy.yml`)
- **Workflow Run**: After successful CI workflow completion
- **Manual**: Manual dispatch with environment selection

### Test Strategy Workflow (`test-twitter-strategy.yml`)
- **Path Changes**: Changes to Twitter strategy files
- **Schedule**: Daily at 6 AM UTC
- **Manual**: Manual dispatch with test mode selection

### Monitor Workflow (`monitor.yml`)
- **Schedule**: Every 6 hours
- **Manual**: Manual dispatch with check type selection

## Verification Steps

1. **Check Workflows**: Visit `https://github.com/ChudiNnorukam/conservative-twitter-outreach-clean/actions`

2. **Test CI**: Make a small commit to trigger the CI workflow

3. **Verify Secrets**: Ensure all required secrets are properly configured

4. **Check Environments**: Verify staging and production environments are set up

5. **Monitor Health**: Check that the monitoring workflow is running regularly

## Troubleshooting

### Common Issues

1. **Workflows not appearing**:
   - Check that the files are in `.github/workflows/` directory
   - Verify the YAML syntax is correct
   - Ensure Actions are enabled in repository settings

2. **Secrets not found**:
   - Verify all required secrets are set in repository settings
   - Check secret names match exactly (case-sensitive)

3. **Rate limit errors**:
   - The conservative limits should prevent this
   - Check that conservative strategy is being enforced

4. **Deployment failures**:
   - Verify environment configurations
   - Check that all required files exist in the repository

### Debug Steps

1. **Check workflow logs**: Click on any workflow run to see detailed logs
2. **Validate YAML**: Use a YAML validator to check syntax
3. **Test locally**: Use `act` tool to test workflows locally
4. **Check permissions**: Ensure the repository has proper permissions

## Conservative Compliance

All workflows are designed to maintain conservative Twitter outreach practices:

- ✅ Rate limits well below Twitter's guidelines
- ✅ Comprehensive error handling
- ✅ Lead qualification filtering
- ✅ Monitoring and alerting
- ✅ Production safeguards

## Support

If you encounter issues:

1. Check the workflow logs for detailed error messages
2. Verify all secrets and environment variables are set correctly
3. Ensure the repository structure matches the expected layout
4. Test with a small change first before full deployment

## Next Steps

After successful deployment:

1. **Test the workflows** with a small commit
2. **Configure monitoring** alerts if needed
3. **Set up branch protection** rules
4. **Review and adjust** conservative limits as needed
5. **Monitor performance** and adjust accordingly

---

**Note**: These workflows are specifically designed for conservative Twitter outreach to ensure compliance with Twitter's terms of service and best practices for lead generation.
