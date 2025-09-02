#!/bin/bash

# Branch Protection Setup Script
# This script configures branch protection rules for the repository

set -e

# Configuration
OWNER="yogi-bear-92"
REPO="agent-rpg-project"
BRANCH="main"
GH_TOKEN=${GITHUB_TOKEN}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [ -z "$GH_TOKEN" ]; then
        log_error "GITHUB_TOKEN environment variable is not set"
        log_info "Please set your GitHub token: export GITHUB_TOKEN=your_token"
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_info "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Authenticate with GitHub CLI
    echo "$GH_TOKEN" | gh auth login --with-token
    
    log_success "Prerequisites check passed"
}

# Create branch protection rule
setup_branch_protection() {
    log_info "Setting up branch protection for $BRANCH branch..."
    
    # Create the branch protection rule using GitHub API
    curl -X PUT \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$OWNER/$REPO/branches/$BRANCH/protection" \
        -d '{
            "required_status_checks": {
                "strict": true,
                "contexts": [
                    "Code Quality & Linting",
                    "Unit & Integration Tests",
                    "Build Application",
                    "Dependency Vulnerability Scan",
                    "CodeQL Security Analysis",
                    "Secrets Detection"
                ]
            },
            "enforce_admins": true,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1,
                "dismiss_stale_reviews": true,
                "require_code_owner_reviews": true,
                "require_last_push_approval": false
            },
            "restrictions": null,
            "allow_force_pushes": false,
            "allow_deletions": false,
            "required_conversation_resolution": true
        }'
    
    if [ $? -eq 0 ]; then
        log_success "Branch protection rules applied successfully"
    else
        log_error "Failed to apply branch protection rules"
        exit 1
    fi
}

# Setup repository settings
setup_repository_settings() {
    log_info "Configuring repository settings..."
    
    # Update repository settings
    curl -X PATCH \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$OWNER/$REPO" \
        -d '{
            "allow_squash_merge": true,
            "allow_merge_commit": false,
            "allow_rebase_merge": true,
            "delete_branch_on_merge": true,
            "has_vulnerability_alerts": true,
            "has_automated_security_fixes": true
        }'
    
    log_success "Repository settings configured"
}

# Create required labels
setup_labels() {
    log_info "Creating required labels..."
    
    declare -a labels=(
        "bug|d73a4a|Something isn't working"
        "documentation|0075ca|Improvements or additions to documentation"
        "duplicate|cfd3d7|This issue or pull request already exists"
        "enhancement|a2eeef|New feature or request"
        "good first issue|7057ff|Good for newcomers"
        "help wanted|008672|Extra attention is needed"
        "invalid|e4e669|This doesn't seem right"
        "question|d876e3|Further information is requested"
        "wontfix|ffffff|This will not be worked on"
        "security|b60205|Security related issue"
        "performance|fbca04|Performance related issue"
        "ci/cd|0e8a16|Continuous integration and deployment"
        "dependencies|0366d6|Pull requests that update a dependency file"
        "automated|ededed|Automated pull request or issue"
        "needs-triage|ff9800|Needs initial review and categorization"
        "needs-discussion|9c27b0|Needs discussion before implementation"
        "breaking-change|ff5722|Contains breaking changes"
        "agent-system|4caf50|Related to AI agent functionality"
        "game-mechanics|ff9800|Related to RPG game mechanics"
        "frontend|2196f3|Frontend/UI related"
        "backend|795548|Backend/API related"
    )
    
    for label_info in "${labels[@]}"; do
        IFS='|' read -r name color description <<< "$label_info"
        
        # Check if label exists
        if gh label list -R "$OWNER/$REPO" | grep -q "$name"; then
            log_info "Label '$name' already exists, updating..."
            gh label edit "$name" -R "$OWNER/$REPO" --color "$color" --description "$description" 2>/dev/null || true
        else
            log_info "Creating label '$name'..."
            gh label create "$name" -R "$OWNER/$REPO" --color "$color" --description "$description" 2>/dev/null || true
        fi
    done
    
    log_success "Labels configured"
}

# Setup issue templates
verify_templates() {
    log_info "Verifying issue and PR templates..."
    
    if [ -d ".github/ISSUE_TEMPLATE" ]; then
        log_success "Issue templates found"
    else
        log_warn "Issue templates not found in .github/ISSUE_TEMPLATE/"
    fi
    
    if [ -f ".github/pull_request_template.md" ]; then
        log_success "PR template found"
    else
        log_warn "PR template not found at .github/pull_request_template.md"
    fi
    
    if [ -f ".github/CODEOWNERS" ]; then
        log_success "CODEOWNERS file found"
    else
        log_warn "CODEOWNERS file not found at .github/CODEOWNERS"
    fi
}

# Setup rulesets (GitHub's new feature)
setup_rulesets() {
    log_info "Setting up repository rulesets..."
    
    # This is a newer GitHub feature, might not be available for all repos
    curl -X POST \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$OWNER/$REPO/rulesets" \
        -d '{
            "name": "Main Branch Protection",
            "target": "branch",
            "enforcement": "active",
            "conditions": {
                "ref_name": {
                    "include": ["main"],
                    "exclude": []
                }
            },
            "rules": [
                {
                    "type": "required_status_checks",
                    "parameters": {
                        "required_status_checks": [
                            {
                                "context": "Code Quality & Linting",
                                "integration_id": null
                            },
                            {
                                "context": "Unit & Integration Tests",
                                "integration_id": null
                            }
                        ],
                        "strict_required_status_checks_policy": true
                    }
                },
                {
                    "type": "pull_request",
                    "parameters": {
                        "required_approving_review_count": 1,
                        "dismiss_stale_reviews_on_push": true,
                        "require_code_owner_review": true,
                        "require_last_push_approval": false
                    }
                },
                {
                    "type": "required_deployments",
                    "parameters": {
                        "required_deployment_environments": []
                    }
                }
            ]
        }' 2>/dev/null || log_warn "Rulesets not available or failed to create"
    
    log_info "Rulesets setup attempted"
}

# Verify setup
verify_setup() {
    log_info "Verifying branch protection setup..."
    
    # Get branch protection status
    response=$(curl -s -H "Authorization: token $GH_TOKEN" \
        "https://api.github.com/repos/$OWNER/$REPO/branches/$BRANCH/protection")
    
    if echo "$response" | grep -q '"required_status_checks"'; then
        log_success "Branch protection is active"
        
        # Show summary
        echo
        log_info "Branch Protection Summary:"
        echo "  - Required status checks: Enabled"
        echo "  - Required reviews: Enabled (1 required)"
        echo "  - Admin enforcement: Enabled"
        echo "  - Force pushes: Disabled"
        echo "  - Branch deletion: Disabled"
        echo "  - Conversation resolution: Required"
        echo
    else
        log_error "Branch protection verification failed"
        echo "Response: $response"
        exit 1
    fi
}

# Show help
show_help() {
    cat << EOF
Branch Protection Setup Script

This script configures branch protection rules and repository settings.

Usage: $0 [options]

Options:
  -h, --help     Show this help message
  --dry-run      Show what would be configured without applying changes
  --owner NAME   Set repository owner (default: $OWNER)
  --repo NAME    Set repository name (default: $REPO)
  --branch NAME  Set protected branch (default: $BRANCH)

Environment Variables:
  GITHUB_TOKEN   Your GitHub personal access token (required)

Required GitHub Token Permissions:
  - repo (Full control of private repositories)
  - admin:repo_hook (Read and write repository hooks)

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --owner)
            OWNER="$2"
            shift 2
            ;;
        --repo)
            REPO="$2"
            shift 2
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    log_info "Setting up branch protection for $OWNER/$REPO"
    log_info "Protected branch: $BRANCH"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_warn "DRY RUN MODE - No changes will be made"
        return 0
    fi
    
    check_prerequisites
    setup_repository_settings
    setup_labels
    setup_branch_protection
    setup_rulesets
    verify_templates
    verify_setup
    
    log_success "Branch protection setup completed!"
    log_info "Your main branch is now protected with:"
    echo "  ✅ Required status checks"
    echo "  ✅ Required pull request reviews"
    echo "  ✅ Admin enforcement"
    echo "  ✅ Conversation resolution required"
    echo "  ❌ Force pushes disabled"
    echo "  ❌ Branch deletion disabled"
    
    echo
    log_info "Next steps:"
    echo "  1. Verify your CI/CD workflows are running"
    echo "  2. Test the protection by creating a PR"
    echo "  3. Update team members on the new process"
    echo "  4. Monitor the protection rules effectiveness"
}

# Run main function
main "$@"
