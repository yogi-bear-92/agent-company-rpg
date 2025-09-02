#!/bin/bash
#
# GitHub Swarm Coordinator
# Central control script for managing all GitHub agents
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO="yogi-bear-92/agent-company-rpg"
SWARM_ID="github-management-swarm"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI not found. Please install gh CLI."
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        error "GitHub CLI not authenticated. Please run 'gh auth login'."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        error "npx not found. Please install Node.js."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Initialize swarm coordination
init_swarm() {
    log "Initializing GitHub Management Swarm..."
    
    # Initialize Claude Flow swarm
    npx claude-flow@alpha hooks pre-task --description "GitHub Management Swarm Initialization"
    
    # Create swarm session
    npx claude-flow@alpha hooks session-restore --session-id "$SWARM_ID" || true
    
    success "GitHub Management Swarm initialized"
}

# Agent management functions
trigger_issue_triage() {
    log "Triggering Issue Triage Agent..."
    
    gh workflow run issue-triage-agent.yml --repo "$REPO"
    success "Issue Triage Agent triggered"
}

trigger_pr_review() {
    log "Triggering PR Review Agent for all open PRs..."
    
    # Get all open PRs and trigger review
    prs=$(gh pr list --repo "$REPO" --state open --json number --jq '.[].number')
    
    if [ -z "$prs" ]; then
        warning "No open pull requests found"
        return
    fi
    
    for pr in $prs; do
        log "Triggering review for PR #$pr"
        gh workflow run pr-review-agent.yml --repo "$REPO"
    done
    
    success "PR Review Agent triggered for all open PRs"
}

trigger_documentation() {
    log "Triggering Documentation Agent..."
    
    gh workflow run documentation-agent.yml --repo "$REPO"
    success "Documentation Agent triggered"
}

trigger_release_planning() {
    local release_type=${1:-patch}
    log "Triggering Release Coordination Agent (type: $release_type)..."
    
    gh workflow run release-coordination-agent.yml \
        --repo "$REPO" \
        --field release_type="$release_type" \
        --field pre_release=false
        
    success "Release Coordination Agent triggered"
}

trigger_health_check() {
    local full_scan=${1:-false}
    log "Triggering Repository Health Agent (full scan: $full_scan)..."
    
    gh workflow run repository-health-agent.yml \
        --repo "$REPO" \
        --field full_scan="$full_scan"
        
    success "Repository Health Agent triggered"
}

# Comprehensive swarm status check
check_swarm_status() {
    log "Checking GitHub Management Swarm status..."
    
    echo ""
    echo "🔍 REPOSITORY OVERVIEW"
    echo "======================"
    gh repo view "$REPO" --json name,description,stargazerCount,forkCount,openIssues
    
    echo ""
    echo "📋 ISSUE OVERVIEW"  
    echo "=================="
    echo "Open issues by priority:"
    echo "- Critical: $(gh issue list --repo "$REPO" --label "priority:critical" --state open --json number | jq '. | length')"
    echo "- High: $(gh issue list --repo "$REPO" --label "priority:high" --state open --json number | jq '. | length')"
    echo "- Medium: $(gh issue list --repo "$REPO" --label "priority:medium" --state open --json number | jq '. | length')"
    echo "- Low: $(gh issue list --repo "$REPO" --label "priority:low" --state open --json number | jq '. | length')"
    
    echo ""
    echo "🔄 PULL REQUESTS"
    echo "================"
    gh pr list --repo "$REPO" --state open --limit 5
    
    echo ""
    echo "🤖 WORKFLOW STATUS"
    echo "=================="
    gh run list --repo "$REPO" --limit 5
    
    echo ""
    echo "📊 SWARM METRICS"
    echo "================"
    npx claude-flow@alpha hooks session-end --export-metrics true || true
}

# Emergency procedures
emergency_stop() {
    log "Executing emergency stop for all agents..."
    
    # Cancel running workflows
    running_workflows=$(gh run list --repo "$REPO" --status in_progress --json databaseId --jq '.[].databaseId')
    
    for workflow in $running_workflows; do
        log "Cancelling workflow run $workflow"
        gh run cancel "$workflow" --repo "$REPO" || true
    done
    
    success "Emergency stop completed"
}

# Automated maintenance routine
run_maintenance() {
    log "Running automated maintenance routine..."
    
    # 1. Health check
    trigger_health_check true
    sleep 30
    
    # 2. Issue triage
    trigger_issue_triage
    sleep 30
    
    # 3. Documentation update
    trigger_documentation
    sleep 30
    
    # 4. Status report
    check_swarm_status
    
    success "Maintenance routine completed"
}

# Interactive mode
interactive_mode() {
    while true; do
        echo ""
        echo "🤖 GitHub Management Swarm - Interactive Mode"
        echo "=============================================="
        echo "1. Check Swarm Status"
        echo "2. Trigger Issue Triage"
        echo "3. Trigger PR Review"
        echo "4. Trigger Documentation Update"
        echo "5. Trigger Health Check"
        echo "6. Plan Release (patch)"
        echo "7. Plan Release (minor)"
        echo "8. Plan Release (major)"
        echo "9. Run Maintenance Routine"
        echo "10. Emergency Stop"
        echo "0. Exit"
        echo ""
        read -p "Select option: " choice
        
        case $choice in
            1) check_swarm_status ;;
            2) trigger_issue_triage ;;
            3) trigger_pr_review ;;
            4) trigger_documentation ;;
            5) trigger_health_check ;;
            6) trigger_release_planning "patch" ;;
            7) trigger_release_planning "minor" ;;
            8) trigger_release_planning "major" ;;
            9) run_maintenance ;;
            10) emergency_stop ;;
            0) log "Exiting..."; break ;;
            *) warning "Invalid option" ;;
        esac
        
        read -p "Press Enter to continue..."
    done
}

# Help function
show_help() {
    echo "GitHub Management Swarm Coordinator"
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status              Check swarm status and metrics"
    echo "  triage              Trigger issue triage agent"
    echo "  review              Trigger PR review agent"
    echo "  docs                Trigger documentation agent"
    echo "  health [full]       Trigger health check (optional: full scan)"
    echo "  release [type]      Trigger release planning (patch/minor/major)"
    echo "  maintenance         Run full maintenance routine"
    echo "  emergency           Emergency stop all agents"
    echo "  interactive         Start interactive mode"
    echo "  init                Initialize swarm coordination"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 health full"
    echo "  $0 release minor"
    echo "  $0 interactive"
}

# Main execution
main() {
    check_prerequisites
    
    case ${1:-help} in
        status)
            init_swarm
            check_swarm_status
            ;;
        triage)
            init_swarm
            trigger_issue_triage
            ;;
        review)
            init_swarm
            trigger_pr_review
            ;;
        docs)
            init_swarm
            trigger_documentation
            ;;
        health)
            init_swarm
            trigger_health_check "${2:-false}"
            ;;
        release)
            init_swarm
            trigger_release_planning "${2:-patch}"
            ;;
        maintenance)
            init_swarm
            run_maintenance
            ;;
        emergency)
            emergency_stop
            ;;
        interactive)
            init_swarm
            interactive_mode
            ;;
        init)
            init_swarm
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"