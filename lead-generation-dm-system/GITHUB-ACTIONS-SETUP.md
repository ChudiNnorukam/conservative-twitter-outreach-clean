# GitHub Actions CI/CD Setup

This document outlines the comprehensive GitHub Actions workflows for automating the deployment and testing of the conservative Twitter outreach strategy.

## Overview

The CI/CD pipeline consists of four main workflows:

1. **CI - Test and Validate** (`ci.yml`)
2. **CD - Deploy to Production** (`deploy.yml`)
3. **Test Conservative Twitter Strategy** (`test-twitter-strategy.yml`)
4. **Monitor System Health** (`monitor.yml`)

## Workflow Details

### 1. CI - Test and Validate (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Daily at 2 AM UTC (health checks)

**Jobs:**
- **Lint and Validate**: Code linting, security audits, package validation
- **Run Tests**: Multi-node testing (16, 18, 20), conservative Twitter outreach tests
- **Security Checks**: Vulnerability scanning, secret detection
- **Performance Tests**: Load testing, rate limiting validation
- **Build Package**: Create deployment artifacts
- **Notify Results**: Generate status reports

**Key Features:**
- Conservative rate limit validation
- Security vulnerability scanning
- Multi-node compatibility testing
- Automated artifact generation

### 2. CD - Deploy to Production (`deploy.yml`)

**Triggers:**
- Successful completion of CI workflow
- Manual dispatch with environment selection

**Jobs:**
- **Validate Deployment Readiness**: Check CI status, validate environment variables
- **Deploy to Staging**: Staging environment deployment with validation
- **Deploy to Production**: Production deployment with strict validation
- **Post-Deployment Monitoring**: Health checks and monitoring setup
- **Rollback**: Manual rollback capability

**Key Features:**
- Environment-specific deployments
- Production secret validation
- Health check verification
- Rollback capability
- Comprehensive deployment reports

### 3. Test Conservative Twitter Strategy (`test-twitter-strategy.yml`)

**Triggers:**
- Changes to Twitter strategy files
- Daily at 6 AM UTC
- Manual dispatch with test mode selection

**Jobs:**
- **Test Rate Limits & API Quotas**: Validate conservative limits
- **Test Lead Qualification Logic**: Verify bot filtering and qualification
- **Test Outreach Sequence Generation**: Validate sequence logic
- **Test API Validation & Error Handling**: Verify error handling
- **Generate Test Report**: Comprehensive test reporting

**Key Features:**
- Conservative rate limit testing
- Lead qualification validation
- Outreach sequence verification
- API error handling tests
- Detailed test reporting

### 4. Monitor System Health (`monitor.yml`)

**Triggers:**
- Every 6 hours (scheduled)
- Manual dispatch with check type selection

**Jobs:**
- **Monitor API Health**: API connectivity and health checks
- **Monitor Rate Limits**: Rate limit status and quota tracking
- **Monitor Performance**: Error rates and system performance
- **Generate Monitoring Report**: Comprehensive health reporting

**Key Features:**
- Real-time API health monitoring
- Rate limit tracking
- Performance metrics
- Automated health reporting

## Conservative Strategy Integration

All workflows are designed to support the conservative Twitter outreach strategy:

### Rate Limiting
- Daily limits respect Twitter guidelines
- Conservative approach to API usage
- Automatic quota management
- Rate limit monitoring and alerts

### Lead Qualification
- Bot detection and filtering
- Quality lead identification
- Conservative engagement criteria
- Automated qualification testing

### Error Handling
- Graceful API error handling
- Rate limit error detection
- Automatic operation pausing
- Comprehensive error reporting

## Environment Configuration

### Required Secrets
```bash
# Twitter API Credentials
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Environment-specific variables
NODE_ENV=production
TWITTER_API_ENV=production
LOG_LEVEL=warn
CAMPAIGN_MODE=conservative
RATE_LIMIT_STRICT=true
```

### Environment Setup
1. **Staging Environment**: For testing and validation
2. **Production Environment**: For live operations
3. **Test Environment**: For automated testing

## Deployment Process

### Staging Deployment
1. CI workflow completes successfully
2. CD workflow validates deployment readiness
3. Staging environment deployment
4. Staging validation tests
5. Health checks
6. Deployment report generation

### Production Deployment
1. Staging deployment successful
2. Production environment validation
3. Production secret verification
4. Production deployment
5. Production health checks
6. Deployment verification
7. Monitoring setup

## Monitoring and Alerting

### Health Checks
- API connectivity monitoring
- Rate limit status tracking
- Error rate monitoring
- Performance metrics
- System resource usage

### Reports Generated
- API Health Reports
- Rate Limit Reports
- Performance Reports
- System Health Reports
- Deployment Reports
- Test Reports

## Security Features

### Secret Management
- GitHub Secrets for sensitive data
- Environment-specific secret validation
- Secret scanning in CI
- Secure deployment practices

### Security Scanning
- npm audit for vulnerabilities
- Secret detection in code
- Environment variable validation
- Security best practices enforcement

## Usage Instructions

### Manual Workflow Triggers

1. **Deploy to Specific Environment:**
   ```bash
   # Trigger deployment workflow
   # Select environment: staging/production
   # Optionally force deployment
   ```

2. **Test Specific Components:**
   ```bash
   # Trigger Twitter strategy tests
   # Select test mode: all/rate_limits/lead_qualification/outreach_sequences/api_validation
   ```

3. **Run Health Checks:**
   ```bash
   # Trigger monitoring workflow
   # Select check type: all/api_health/rate_limits/error_rates/performance
   ```

### Automated Triggers

- **Push to main**: Triggers CI → CD pipeline
- **Pull requests**: Triggers CI validation
- **Scheduled runs**: Daily health checks and monitoring
- **File changes**: Targeted testing for specific components

## Best Practices

### Conservative Approach
- Respect Twitter API rate limits
- Conservative daily limits
- Quality over quantity in outreach
- Bot detection and filtering
- Error handling and recovery

### Monitoring
- Regular health checks
- Performance monitoring
- Error rate tracking
- Rate limit monitoring
- Automated reporting

### Security
- Secure secret management
- Vulnerability scanning
- Environment isolation
- Access control
- Audit logging

## Troubleshooting

### Common Issues

1. **CI Failures:**
   - Check test logs for specific failures
   - Verify environment variables
   - Review security scan results

2. **Deployment Failures:**
   - Validate production secrets
   - Check environment configuration
   - Review health check results

3. **Monitoring Alerts:**
   - Check API connectivity
   - Review rate limit status
   - Analyze performance metrics

### Debugging Steps

1. **Check Workflow Logs:**
   - Navigate to Actions tab in GitHub
   - Review specific job logs
   - Download artifacts for analysis

2. **Validate Configuration:**
   - Check environment variables
   - Verify secret configuration
   - Review workflow triggers

3. **Test Locally:**
   - Run tests locally before pushing
   - Validate environment setup
   - Check for configuration issues

## Maintenance

### Regular Tasks
- Monitor workflow performance
- Review and update dependencies
- Validate security configurations
- Update documentation
- Review and optimize workflows

### Updates
- Keep Node.js version updated
- Update GitHub Actions versions
- Review and update test scenarios
- Optimize workflow efficiency

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review generated reports and artifacts
3. Consult this documentation
4. Review conservative strategy guidelines

---

**Note**: This CI/CD setup is designed specifically for the conservative Twitter outreach strategy, ensuring safe and compliant automation of the lead generation system. 