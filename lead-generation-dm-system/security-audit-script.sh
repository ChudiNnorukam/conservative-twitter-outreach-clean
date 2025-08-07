#!/bin/bash

# Comprehensive Security Audit Script for All Repositories
# This script evaluates repositories for security issues based on GitHub security best practices

set -e

echo "🔒 COMPREHENSIVE SECURITY AUDIT"
echo "================================="
echo "Evaluating all repositories for security issues..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS") echo -e "${GREEN}✅ PASS${NC}: $message" ;;
        "FAIL") echo -e "${RED}❌ FAIL${NC}: $message" ;;
        "WARN") echo -e "${YELLOW}⚠️  WARN${NC}: $message" ;;
        "INFO") echo -e "${BLUE}ℹ️  INFO${NC}: $message" ;;
    esac
}

# Function to audit a single repository
audit_repository() {
    local repo_path=$1
    local repo_name=$(basename "$repo_path")
    
    echo ""
    echo "🔍 AUDITING: $repo_name"
    echo "Path: $repo_path"
    echo "----------------------------------------"
    
    cd "$repo_path"
    
    # Check if it's a git repository
    if [ ! -d ".git" ]; then
        print_status "FAIL" "Not a git repository"
        return
    fi
    
    # 1. Check for secrets in code
    echo "1. Scanning for secrets in code..."
    local secrets_found=0
    
    # Check for common secret patterns
    if grep -r -i "sk_live\|pk_live\|AKIA\|ghp_\|gho_\|ghu_\|ghs_\|ghr_\|sk-\|pk-\|sk_test\|pk_test" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null; then
        print_status "FAIL" "Found potential secrets in code"
        secrets_found=1
    else
        print_status "PASS" "No obvious secrets found in code"
    fi
    
    # Check for .env files with real secrets
    if find . -name ".env" -type f 2>/dev/null | grep -q .; then
        print_status "WARN" "Found .env files - check if they contain real secrets"
        find . -name ".env" -type f 2>/dev/null | while read file; do
            echo "   Found: $file"
        done
    fi
    
    # 2. Check for .env.example files
    if find . -name ".env.example" -type f 2>/dev/null | grep -q .; then
        print_status "PASS" "Found .env.example file (good practice)"
    else
        print_status "WARN" "No .env.example file found"
    fi
    
    # 3. Check for .gitignore
    if [ -f ".gitignore" ]; then
        print_status "PASS" "Found .gitignore file"
        
        # Check if .env files are ignored
        if grep -q "\.env" .gitignore; then
            print_status "PASS" ".env files are properly ignored"
        else
            print_status "FAIL" ".env files are NOT ignored in .gitignore"
        fi
    else
        print_status "FAIL" "No .gitignore file found"
    fi
    
    # 4. Check for package.json and security audit
    if [ -f "package.json" ]; then
        print_status "PASS" "Found package.json"
        
        # Run npm audit if possible
        if command -v npm &> /dev/null; then
            echo "   Running npm audit..."
            if npm audit --audit-level moderate 2>/dev/null; then
                print_status "PASS" "npm audit passed"
            else
                print_status "FAIL" "npm audit found vulnerabilities"
            fi
        fi
    fi
    
    # 5. Check for GitHub Actions workflows
    if [ -d ".github/workflows" ]; then
        print_status "PASS" "Found GitHub Actions workflows"
        
        # Check for security-related workflows
        if find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | xargs grep -l "security\|audit\|scan" 2>/dev/null; then
            print_status "PASS" "Found security-related workflows"
        else
            print_status "WARN" "No security-related workflows found"
        fi
    else
        print_status "WARN" "No GitHub Actions workflows found"
    fi
    
    # 6. Check for README with security information
    if [ -f "README.md" ]; then
        print_status "PASS" "Found README.md"
        
        if grep -i "security\|secret\|env\|config" README.md 2>/dev/null; then
            print_status "PASS" "README contains security-related information"
        else
            print_status "WARN" "README doesn't mention security setup"
        fi
    else
        print_status "WARN" "No README.md found"
    fi
    
    # 7. Check for large files that might contain secrets
    echo "7. Checking for large files..."
    local large_files=$(find . -type f -size +1M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null | head -5)
    if [ -n "$large_files" ]; then
        print_status "WARN" "Found large files (check for secrets):"
        echo "$large_files" | while read file; do
            echo "   $file"
        done
    else
        print_status "PASS" "No suspiciously large files found"
    fi
    
    # 8. Check for exposed configuration files
    echo "8. Checking for exposed configuration files..."
    local config_files=$(find . -name "config.*" -o -name "*.config.*" -o -name "settings.*" 2>/dev/null | grep -v node_modules | head -5)
    if [ -n "$config_files" ]; then
        print_status "WARN" "Found configuration files (check for secrets):"
        echo "$config_files" | while read file; do
            echo "   $file"
        done
    fi
    
    # 9. Check repository visibility (if we can determine it)
    echo "9. Repository visibility check..."
    if git remote -v 2>/dev/null | grep -q "github.com"; then
        print_status "INFO" "Repository has GitHub remote"
        # Could add more checks here for public/private status
    else
        print_status "INFO" "No GitHub remote found"
    fi
    
    # 10. Check for security policy
    if [ -f "SECURITY.md" ] || [ -f ".github/SECURITY.md" ]; then
        print_status "PASS" "Found security policy file"
    else
        print_status "WARN" "No security policy file found"
    fi
    
    echo ""
    print_status "INFO" "Repository audit completed for: $repo_name"
    echo "----------------------------------------"
}

# Main execution
echo "Starting comprehensive security audit..."
echo ""

# List of repositories to audit
repositories=(
    "/Users/chudinnorukam/Documents/n8n/lead-generation-dm-system"
    "/Users/chudinnorukam/Documents/clay_clone_project"
    "/Users/chudinnorukam/Documents/Chudi's Micro SaaS Apps/lead-magnet-generator"
    "/Users/chudinnorukam/Documents/Chudi's Micro SaaS Apps/wellness-agent-saas"
    "/Users/chudinnorukam/Documents/Agentic RAG BMAD Experimental Projects"
    "/Users/chudinnorukam/Documents/conservative-twitter-outreach-clean"
    "/Users/chudinnorukam/Documents/Chudi's Other Projects/BMAD-METHOD"
    "/Users/chudinnorukam/Documents/Chudi's Other Projects/zapier-platform-schema"
    "/Users/chudinnorukam/Documents/n8n/twitter-autocontent-agent-bundle"
    "/Users/chudinnorukam/Documents/n8n/linkedin-autocontent-agent-bundle"
    "/Users/chudinnorukam/Documents/n8n"
    "/Users/chudinnorukam/Documents/Cursor Agent/lead-magnet-generator"
    "/Users/chudinnorukam/Documents/Cursor Agent"
    "/Users/chudinnorukam/Documents/Chudi's Prompt Engineering Portfolio"
)

# Audit each repository
for repo in "${repositories[@]}"; do
    if [ -d "$repo" ]; then
        audit_repository "$repo"
    else
        echo "⚠️  Repository not found: $repo"
    fi
done

echo ""
echo "🎯 SECURITY AUDIT SUMMARY"
echo "=========================="
echo ""
echo "📊 Recommendations:"
echo "1. Ensure all .env files are in .gitignore"
echo "2. Add security workflows to GitHub Actions"
echo "3. Create SECURITY.md files for public repos"
echo "4. Run npm audit regularly"
echo "5. Review large files for potential secrets"
echo "6. Add security policies to README files"
echo ""
echo "🔒 For more information, see:"
echo "- https://docs.github.com/en/code-security"
echo "- https://github.com/iAnonymous3000/GitHub-Hardening-Guide"
echo ""
echo "✅ Security audit completed!"
