# 🔧 GitHub Actions Troubleshooting Guide

## 🚨 Common Failure Scenarios & Solutions

### 1. **CI Workflow Dependency Failure**

**Problem**: Deploy workflow fails because CI workflow didn't complete successfully

**Symptoms**:
```bash
echo "ready=false" >> $GITHUB_OUTPUT
echo "❌ CI workflow failed, conservative deployment blocked"
exit 1
```

**Solutions**:

#### A. Manual Workflow Dispatch
```bash
# Trigger deployment manually with force deploy
gh workflow run deploy.yml -f environment=staging -f force_deploy=true
```

#### B. Check CI Workflow Status
1. Go to Actions tab in GitHub
2. Check "CI - Conservative Twitter Outreach Testing" workflow
3. Review failed jobs and fix underlying issues

#### C. Debug Workflow Context
The updated deploy workflow now includes debugging:
```yaml
- name: Debug workflow context
  run: |
    echo "Event name: ${{ github.event_name }}"
    echo "Workflow run conclusion: ${{ github.event.workflow_run.conclusion }}"
    echo "Force deploy: ${{ github.event.inputs.force_deploy }}"
```

### 2. **Test Failures**

**Problem**: Tests fail during CI pipeline

**Common Causes**:
- Missing dependencies
- Environment variable issues
- API rate limits
- File permission problems

**Solutions**:

#### A. Run Basic Tests First
```bash
# Test basic functionality without external dependencies
node test-basic-functionality.js
```

#### B. Check File Structure
```bash
# Verify required files exist
ls -la
ls -la utils/
ls -la agents/
```

#### C. Test Individual Components
```bash
# Test DM dispatcher
npm run test

# Test lead hunter
npm run hunt-test

# Test conservative strategy
node test-conservative-twitter-outreach.js
```

### 3. **Environment Variable Issues**

**Problem**: Missing or invalid environment variables

**Solutions**:

#### A. Check Required Secrets
```bash
# Production requires these secrets
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET
TWITTER_BEARER_TOKEN
```

#### B. Validate Environment Setup
```bash
# Check environment file
cat .env.test
cat .env.staging
cat .env.production
```

### 4. **Node.js Version Issues**

**Problem**: Incompatible Node.js version

**Solutions**:

#### A. Check Node Version
```bash
node --version
npm --version
```

#### B. Update package.json
```json
{
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 5. **Permission Issues**

**Problem**: File permission or access denied errors

**Solutions**:

#### A. Fix File Permissions
```bash
chmod +x test-basic-functionality.js
chmod +x deploy-conservative.sh
```

#### B. Check Directory Structure
```bash
# Ensure all required directories exist
mkdir -p agents utils config templates data logs
```

## 🔍 **Debugging Steps**

### Step 1: Check Workflow Logs
1. Go to GitHub Actions
2. Click on failed workflow run
3. Review job logs for specific error messages

### Step 2: Run Tests Locally
```bash
# Clone repository
git clone https://github.com/ChudiNnorukam/conservative-twitter-outreach-clean.git
cd conservative-twitter-outreach-clean

# Install dependencies
npm install

# Run basic tests
node test-basic-functionality.js

# Run specific tests
npm run test
npm run hunt-test
```

### Step 3: Check Dependencies
```bash
# Verify package.json
cat package.json

# Check installed packages
npm list

# Audit for vulnerabilities
npm audit
```

### Step 4: Validate Configuration
```bash
# Check conservative strategy
cat CONSERVATIVE-TWITTER-STRATEGY.md

# Verify environment files
ls -la .env*
```

## 🛠️ **Quick Fixes**

### Fix 1: Force Deploy (Bypass CI)
```bash
# Trigger manual deployment with force flag
gh workflow run deploy.yml -f environment=staging -f force_deploy=true
```

### Fix 2: Skip Tests Temporarily
```yaml
# In CI workflow, comment out failing tests temporarily
# - name: Run conservative Twitter outreach tests
#   run: |
#     echo "Skipping tests temporarily"
```

### Fix 3: Update Node Version
```yaml
# In workflow files, update Node version
env:
  NODE_VERSION: '18'  # or '20'
```

### Fix 4: Add Debug Output
```yaml
# Add to any failing step
- name: Debug step
  run: |
    echo "Debugging..."
    echo "Current directory: $(pwd)"
    echo "Files: $(ls -la)"
    echo "Environment: $NODE_ENV"
```

## 📊 **Monitoring & Prevention**

### 1. **Add Health Checks**
```yaml
- name: Health check
  run: |
    echo "Checking system health..."
    node --version
    npm --version
    echo "Health check passed"
```

### 2. **Implement Retry Logic**
```yaml
- name: Run tests with retry
  run: |
    for i in {1..3}; do
      echo "Attempt $i of 3"
      npm run test && break
      sleep 5
    done
```

### 3. **Add Timeout Controls**
```yaml
- name: Run tests with timeout
  timeout-minutes: 10
  run: npm run test
```

## 🚀 **Deployment Best Practices**

### 1. **Staging First**
Always deploy to staging before production:
```bash
gh workflow run deploy.yml -f environment=staging
```

### 2. **Monitor Deployments**
Check deployment status:
```bash
gh run list --workflow=deploy.yml
```

### 3. **Rollback Plan**
If deployment fails, use rollback:
```bash
gh workflow run deploy.yml -f environment=rollback
```

## 📞 **Getting Help**

### 1. **Check GitHub Issues**
Search existing issues in the repository

### 2. **Review Documentation**
- README.md
- CONSERVATIVE-TWITTER-STRATEGY.md
- GITHUB-ACTIONS-SETUP.md

### 3. **Enable Debug Logging**
```bash
# Enable GitHub Actions debug logging
# Set repository secret: ACTIONS_STEP_DEBUG = true
```

### 4. **Contact Support**
- Create detailed issue with logs
- Include error messages and context
- Provide steps to reproduce

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: Chudi Nnorukam
