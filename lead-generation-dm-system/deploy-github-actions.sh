#!/bin/bash

# Deploy GitHub Actions Workflows to Conservative Twitter Outreach Repository
# This script helps deploy the CI/CD workflows to your GitHub repository

set -e

echo "🚀 Deploying Conservative Twitter Outreach GitHub Actions Workflows"
echo "================================================================"

# Configuration
TARGET_REPO="ChudiNnorukam/conservative-twitter-outreach-clean"
SOURCE_DIR=".github/workflows"
WORKFLOW_FILES=("ci.yml" "deploy.yml" "test-twitter-strategy.yml" "monitor.yml")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -d ".github/workflows" ]; then
    print_error "Not in the correct directory. Please run this from the lead-generation-dm-system directory."
    exit 1
fi

print_info "Current directory: $(pwd)"
print_info "Target repository: $TARGET_REPO"

# Validate workflow files exist
print_info "Validating workflow files..."
for file in "${WORKFLOW_FILES[@]}"; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        print_status "Found $file"
    else
        print_error "Missing workflow file: $file"
        exit 1
    fi
done

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not in PATH"
    exit 1
fi

# Check if GitHub CLI is available (optional)
if command -v gh &> /dev/null; then
    print_status "GitHub CLI found - will use for deployment"
    USE_GH_CLI=true
else
    print_warning "GitHub CLI not found - will provide manual instructions"
    USE_GH_CLI=false
fi

# Function to get file SHA from GitHub
get_file_sha() {
    local file_path="$1"
    local response
    
    response=$(gh api repos/$TARGET_REPO/contents/$file_path 2>/dev/null || echo "")
    
    if [ -n "$response" ]; then
        echo "$response" | grep -o '"sha":"[^"]*"' | cut -d'"' -f4
    else
        echo ""
    fi
}

# Function to deploy using GitHub CLI with proper base64 encoding
deploy_with_gh_cli() {
    print_info "Deploying workflows using GitHub CLI..."
    
    # Check authentication
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI. Please run 'gh auth login' first."
        exit 1
    fi
    
    # Deploy each workflow file
    for file in "${WORKFLOW_FILES[@]}"; do
        print_info "Deploying $file..."
        
        # Get the SHA of existing file if it exists
        file_path=".github/workflows/$file"
        existing_sha=$(get_file_sha "$file_path")
        
        # Use proper base64 encoding for macOS compatibility
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS base64 doesn't support -w flag
            CONTENT=$(cat "$SOURCE_DIR/$file" | base64)
        else
            # Linux base64 with -w flag
            CONTENT=$(cat "$SOURCE_DIR/$file" | base64 -w 0)
        fi
        
        # Prepare the API call
        if [ -n "$existing_sha" ]; then
            print_info "Updating existing file $file (SHA: $existing_sha)"
            gh api repos/$TARGET_REPO/contents/$file_path \
                --method PUT \
                --field message="Update conservative Twitter outreach workflow: $file" \
                --field content="$CONTENT" \
                --field sha="$existing_sha" \
                --field branch=main
        else
            print_info "Creating new file $file"
            gh api repos/$TARGET_REPO/contents/$file_path \
                --method PUT \
                --field message="Deploy conservative Twitter outreach workflow: $file" \
                --field content="$CONTENT" \
                --field branch=main
        fi
        
        if [ $? -eq 0 ]; then
            print_status "Successfully deployed $file"
        else
            print_error "Failed to deploy $file"
            exit 1
        fi
    done
}

# Function to provide manual deployment instructions
provide_manual_instructions() {
    print_info "Manual deployment instructions:"
    echo ""
    echo "1. Clone your target repository:"
    echo "   git clone https://github.com/$TARGET_REPO.git"
    echo "   cd conservative-twitter-outreach-clean"
    echo ""
    echo "2. Create the workflows directory:"
    echo "   mkdir -p .github/workflows"
    echo ""
    echo "3. Copy the workflow files:"
    for file in "${WORKFLOW_FILES[@]}"; do
        echo "   cp ../lead-generation-dm-system/.github/workflows/$file .github/workflows/"
    done
    echo ""
    echo "4. Commit and push the changes:"
    echo "   git add .github/workflows/"
    echo "   git commit -m 'Deploy conservative Twitter outreach GitHub Actions workflows'"
    echo "   git push origin main"
    echo ""
    echo "5. Verify the workflows are active in your GitHub repository:"
    echo "   https://github.com/$TARGET_REPO/actions"
    echo ""
}

# Function to create deployment package
create_deployment_package() {
    print_info "Creating deployment package..."
    
    DEPLOY_DIR="github-actions-deploy"
    mkdir -p $DEPLOY_DIR
    
    # Copy workflow files
    for file in "${WORKFLOW_FILES[@]}"; do
        cp "$SOURCE_DIR/$file" "$DEPLOY_DIR/"
        print_status "Copied $file to deployment package"
    done
    
    # Create README for deployment
    cat > "$DEPLOY_DIR/README.md" << 'EOF'
# Conservative Twitter Outreach GitHub Actions Workflows

This package contains the GitHub Actions workflows for the Conservative Twitter Outreach system.

## Workflows Included:

1. **ci.yml** - Continuous Integration with conservative testing and validation
2. **deploy.yml** - Continuous Deployment to staging/production with conservative limits
3. **test-twitter-strategy.yml** - Specialized Twitter strategy testing
4. **monitor.yml** - System health monitoring

## Deployment Instructions:

1. Copy these files to your repository's `.github/workflows/` directory
2. Commit and push the changes
3. Verify workflows are active in your GitHub repository's Actions tab

## Conservative Strategy Features:

- Rate limiting to prevent API abuse
- Conservative daily limits for all Twitter operations
- Comprehensive testing and validation
- Health monitoring and alerting
- Production deployment safeguards

## Required Secrets:

Make sure to set up the following secrets in your GitHub repository:

- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`
- `TWITTER_BEARER_TOKEN`

## Environment Variables:

The workflows will automatically create appropriate environment files for:
- Staging environment
- Production environment
- Conservative rate limiting

EOF
    
    print_status "Deployment package created in $DEPLOY_DIR/"
    print_info "You can now copy the files from $DEPLOY_DIR/ to your target repository"
}

# Main deployment logic
print_info "Starting deployment process..."

if [ "$USE_GH_CLI" = true ]; then
    deploy_with_gh_cli
    print_status "Deployment completed successfully!"
    print_info "Check your workflows at: https://github.com/$TARGET_REPO/actions"
else
    create_deployment_package
    provide_manual_instructions
fi

# Final instructions
echo ""
print_info "Next steps:"
echo "1. Set up the required secrets in your GitHub repository"
echo "2. Configure environment variables for staging and production"
echo "3. Test the workflows by making a commit to trigger CI"
echo "4. Monitor the workflows in the Actions tab"
echo ""
print_info "Conservative Twitter Outreach GitHub Actions deployment complete! 🎉"
