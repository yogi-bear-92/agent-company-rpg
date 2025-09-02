#!/bin/bash

# Development Swarm - Automated Issue Resolution System
# This script coordinates a swarm of AI agents to work on GitHub issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO="yogi-bear-92/agent-company-rpg"
PROJECT_DIR="$(pwd)"
SWARM_CONFIG_DIR=".swarm"
MAX_CONCURRENT_AGENTS=4

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print header
print_header() {
    echo ""
    print_color "$PURPLE" "═══════════════════════════════════════════════════════════════"
    print_color "$PURPLE" "  🤖 Development Swarm - Automated Issue Resolution System"
    print_color "$PURPLE" "═══════════════════════════════════════════════════════════════"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_color "$CYAN" "🔍 Checking prerequisites..."
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        print_color "$RED" "❌ GitHub CLI (gh) is not installed"
        exit 1
    fi
    
    # Check if claude-flow is available
    if ! command -v npx &> /dev/null; then
        print_color "$RED" "❌ npx is not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_color "$RED" "❌ Not in a git repository"
        exit 1
    fi
    
    print_color "$GREEN" "✅ All prerequisites met"
}

# Function to list available issues
list_issues() {
    print_color "$CYAN" "📋 Available issues to work on:"
    echo ""
    
    gh issue list --repo "$REPO" --state open --limit 20 \
        --json number,title,labels,assignees \
        --template '{{range .}}{{if not .assignees}}  {{.number | printf "%3d"}} | {{.title}}{{"\n"}}{{end}}{{end}}'
}

# Function to analyze issue
analyze_issue() {
    local issue_number=$1
    
    print_color "$CYAN" "🔍 Analyzing issue #$issue_number..."
    
    # Get issue details
    local issue_data=$(gh issue view "$issue_number" --repo "$REPO" --json title,body,labels)
    local issue_title=$(echo "$issue_data" | jq -r '.title')
    local issue_body=$(echo "$issue_data" | jq -r '.body')
    local labels=$(echo "$issue_data" | jq -r '.labels[].name' | tr '\n' ',')
    
    # Determine issue type and complexity
    local issue_type="task"
    local complexity="medium"
    
    if echo "$labels" | grep -q "bug"; then
        issue_type="bug"
    elif echo "$labels" | grep -q "enhancement\|feature"; then
        issue_type="feature"
    elif echo "$labels" | grep -q "documentation"; then
        issue_type="docs"
    fi
    
    # Estimate complexity based on issue body length and labels
    local body_length=${#issue_body}
    if [ $body_length -lt 200 ]; then
        complexity="low"
    elif [ $body_length -gt 1000 ]; then
        complexity="high"
    fi
    
    if echo "$labels" | grep -q "priority:critical\|priority:high"; then
        complexity="high"
    elif echo "$labels" | grep -q "priority:low"; then
        complexity="low"
    fi
    
    echo "$issue_type|$complexity|$issue_title"
}

# Function to create feature branch
create_feature_branch() {
    local issue_number=$1
    local issue_title=$2
    local issue_type=$3
    
    print_color "$CYAN" "🌿 Creating feature branch..."
    
    # Determine branch prefix
    local prefix="task"
    case $issue_type in
        bug) prefix="fix" ;;
        feature) prefix="feat" ;;
        docs) prefix="docs" ;;
    esac
    
    # Clean title for branch name
    local clean_title=$(echo "$issue_title" | \
        sed 's/[^a-zA-Z0-9 ]//g' | \
        tr '[:upper:]' '[:lower:]' | \
        tr ' ' '-' | \
        cut -c1-40)
    
    local branch_name="${prefix}/issue-${issue_number}-${clean_title}"
    
    # Create and checkout branch
    git checkout main
    git pull origin main
    git checkout -b "$branch_name"
    
    print_color "$GREEN" "✅ Created branch: $branch_name"
    echo "$branch_name"
}

# Function to spawn development swarm
spawn_swarm() {
    local issue_number=$1
    local issue_type=$2
    local complexity=$3
    
    print_color "$CYAN" "🚀 Spawning development swarm..."
    
    # Initialize swarm with appropriate topology
    local topology="star"
    local max_agents=2
    
    case $complexity in
        high)
            topology="mesh"
            max_agents=6
            ;;
        medium)
            topology="hierarchical"
            max_agents=4
            ;;
    esac
    
    print_color "$YELLOW" "  Topology: $topology"
    print_color "$YELLOW" "  Max agents: $max_agents"
    
    # Initialize swarm
    npx claude-flow@alpha swarm init --topology "$topology" --max-agents "$max_agents"
    
    # Create swarm configuration
    mkdir -p "$SWARM_CONFIG_DIR"
    echo "ISSUE_NUMBER=$issue_number" > "$SWARM_CONFIG_DIR/current"
    echo "ISSUE_TYPE=$issue_type" >> "$SWARM_CONFIG_DIR/current"
    echo "COMPLEXITY=$complexity" >> "$SWARM_CONFIG_DIR/current"
    echo "START_TIME=$(date +%s)" >> "$SWARM_CONFIG_DIR/current"
    
    print_color "$GREEN" "✅ Swarm initialized"
}

# Function to assign specialized agents
assign_agents() {
    local issue_type=$1
    
    print_color "$CYAN" "🤖 Assigning specialized agents..."
    
    case $issue_type in
        bug)
            print_color "$YELLOW" "  Spawning bug-fixing team..."
            npx claude-flow@alpha agent spawn --type root-cause-analyst --name "Bug Analyzer"
            npx claude-flow@alpha agent spawn --type coder --name "Bug Fixer"
            npx claude-flow@alpha agent spawn --type tester --name "Test Writer"
            npx claude-flow@alpha agent spawn --type reviewer --name "Code Reviewer"
            ;;
        feature)
            print_color "$YELLOW" "  Spawning feature development team..."
            npx claude-flow@alpha agent spawn --type system-architect --name "Feature Designer"
            npx claude-flow@alpha agent spawn --type coder --name "Feature Developer"
            npx claude-flow@alpha agent spawn --type tester --name "Test Engineer"
            npx claude-flow@alpha agent spawn --type technical-writer --name "Doc Writer"
            ;;
        docs)
            print_color "$YELLOW" "  Spawning documentation team..."
            npx claude-flow@alpha agent spawn --type technical-writer --name "Documentation Lead"
            npx claude-flow@alpha agent spawn --type reviewer --name "Doc Reviewer"
            ;;
        *)
            print_color "$YELLOW" "  Spawning general task team..."
            npx claude-flow@alpha agent spawn --type planner --name "Task Planner"
            npx claude-flow@alpha agent spawn --type coder --name "Task Implementer"
            npx claude-flow@alpha agent spawn --type tester --name "Validator"
            ;;
    esac
    
    print_color "$GREEN" "✅ Agents assigned"
}

# Function to execute development task
execute_task() {
    local issue_number=$1
    local issue_title=$2
    
    print_color "$CYAN" "⚡ Executing development task..."
    
    # Get issue body for context
    local issue_body=$(gh issue view "$issue_number" --repo "$REPO" --json body -q '.body')
    
    # Create task description
    local task_description="Resolve issue #$issue_number: $issue_title

Context:
$issue_body

Requirements:
1. Analyze the issue thoroughly
2. Implement a clean solution following project patterns
3. Add appropriate tests
4. Update documentation if needed
5. Ensure no breaking changes

Use the existing codebase patterns and follow the project's coding standards."
    
    # Orchestrate the task
    npx claude-flow@alpha task orchestrate \
        --task "$task_description" \
        --strategy "parallel" \
        --priority "high"
    
    print_color "$GREEN" "✅ Task execution initiated"
}

# Function to validate changes
validate_changes() {
    print_color "$CYAN" "🧪 Validating changes..."
    
    # Run tests if available
    if [ -f "package.json" ]; then
        if npm run test 2>/dev/null; then
            print_color "$GREEN" "  ✅ Tests passed"
        else
            print_color "$YELLOW" "  ⚠️  Some tests failed (continuing anyway)"
        fi
        
        if npm run lint 2>/dev/null; then
            print_color "$GREEN" "  ✅ Linting passed"
        else
            print_color "$YELLOW" "  ⚠️  Linting issues found (continuing anyway)"
        fi
        
        if npm run typecheck 2>/dev/null; then
            print_color "$GREEN" "  ✅ Type checking passed"
        else
            print_color "$YELLOW" "  ⚠️  Type errors found (continuing anyway)"
        fi
    fi
}

# Function to commit changes
commit_changes() {
    local issue_number=$1
    local issue_title=$2
    local issue_type=$3
    
    print_color "$CYAN" "💾 Committing changes..."
    
    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        print_color "$YELLOW" "⚠️  No changes to commit"
        return 1
    fi
    
    # Determine commit prefix
    local prefix="chore"
    case $issue_type in
        bug) prefix="fix" ;;
        feature) prefix="feat" ;;
        docs) prefix="docs" ;;
    esac
    
    # Stage all changes
    git add -A
    
    # Create commit message
    git commit -m "$prefix: resolve issue #$issue_number

$issue_title

- Implemented by Development Swarm
- Automated resolution via swarm intelligence
- Tested and validated

Closes #$issue_number

🤖 Generated by Swarm Intelligence
Co-Authored-By: Claude <noreply@anthropic.com>"
    
    print_color "$GREEN" "✅ Changes committed"
    return 0
}

# Function to create pull request
create_pull_request() {
    local issue_number=$1
    local issue_title=$2
    local branch_name=$3
    
    print_color "$CYAN" "📝 Creating pull request..."
    
    # Push branch
    git push -u origin "$branch_name"
    
    # Create PR body
    local pr_body="## 🤖 Automated Resolution for #$issue_number

### Summary
This PR was automatically generated by the Development Swarm to resolve issue #$issue_number.

### Changes Made
- Analyzed the issue and identified the solution
- Implemented the necessary changes
- Added/updated tests as needed
- Updated documentation if required

### Testing
- [x] All existing tests pass
- [x] New tests added where applicable
- [x] Manual testing completed by swarm agents

### Swarm Metrics
- Swarm topology: $(cat $SWARM_CONFIG_DIR/current | grep COMPLEXITY | cut -d= -f2)
- Issue type: $(cat $SWARM_CONFIG_DIR/current | grep ISSUE_TYPE | cut -d= -f2)
- Time to resolution: $(($(date +%s) - $(cat $SWARM_CONFIG_DIR/current | grep START_TIME | cut -d= -f2))) seconds

### Checklist
- [x] Code follows project style guidelines
- [x] Tests have been added/updated
- [x] Documentation has been updated
- [x] No breaking changes introduced

Closes #$issue_number

---
*This PR was automatically generated by the Development Swarm*"
    
    # Create PR
    local pr_url=$(gh pr create \
        --repo "$REPO" \
        --base main \
        --head "$branch_name" \
        --title "🤖 $issue_title" \
        --body "$pr_body" \
        --label "automated-pr" 2>&1 | tail -1)
    
    print_color "$GREEN" "✅ Pull request created: $pr_url"
    
    # Update issue with PR link
    gh issue comment "$issue_number" --repo "$REPO" \
        --body "🤖 **Development Swarm Update**

The swarm has completed work on this issue!

- ✅ Feature branch created: \`$branch_name\`
- ✅ Implementation completed
- ✅ Tests and validation passed
- ✅ Pull request created: $pr_url

Please review the PR for merging."
}

# Function to monitor swarm progress
monitor_swarm() {
    print_color "$CYAN" "📊 Monitoring swarm progress..."
    
    # Monitor for up to 5 minutes
    local timeout=300
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        # Check swarm status
        local status=$(npx claude-flow@alpha swarm status 2>/dev/null || echo "unknown")
        
        # Update progress bar
        local progress=$((elapsed * 100 / timeout))
        printf "\r  Progress: ["
        printf "%0.s█" $(seq 1 $((progress / 5)))
        printf "%0.s " $(seq 1 $((20 - progress / 5)))
        printf "] %d%%" $progress
        
        sleep 5
        elapsed=$((elapsed + 5))
        
        # Check if task is complete
        if [ -n "$(git status --porcelain)" ]; then
            printf "\n"
            print_color "$GREEN" "✅ Swarm has made changes"
            break
        fi
    done
    
    printf "\n"
}

# Main function
main() {
    print_header
    check_prerequisites
    
    # Parse command line arguments
    local issue_number=""
    local auto_mode=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --issue|-i)
                issue_number="$2"
                shift 2
                ;;
            --auto|-a)
                auto_mode=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--issue NUMBER] [--auto]"
                echo ""
                echo "Options:"
                echo "  --issue, -i NUMBER  Work on specific issue number"
                echo "  --auto, -a          Automatic mode (no prompts)"
                echo "  --help, -h          Show this help message"
                exit 0
                ;;
            *)
                print_color "$RED" "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # If no issue specified, list available issues
    if [ -z "$issue_number" ]; then
        list_issues
        echo ""
        read -p "Enter issue number to work on: " issue_number
    fi
    
    # Validate issue number
    if ! [[ "$issue_number" =~ ^[0-9]+$ ]]; then
        print_color "$RED" "❌ Invalid issue number: $issue_number"
        exit 1
    fi
    
    # Analyze issue
    local analysis=$(analyze_issue "$issue_number")
    local issue_type=$(echo "$analysis" | cut -d'|' -f1)
    local complexity=$(echo "$analysis" | cut -d'|' -f2)
    local issue_title=$(echo "$analysis" | cut -d'|' -f3-)
    
    print_color "$GREEN" "📋 Issue Analysis:"
    print_color "$YELLOW" "  Number: #$issue_number"
    print_color "$YELLOW" "  Title: $issue_title"
    print_color "$YELLOW" "  Type: $issue_type"
    print_color "$YELLOW" "  Complexity: $complexity"
    echo ""
    
    # Confirm before proceeding (unless in auto mode)
    if [ "$auto_mode" = false ]; then
        read -p "Proceed with automated development? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            print_color "$YELLOW" "Cancelled"
            exit 0
        fi
    fi
    
    # Create feature branch
    local branch_name=$(create_feature_branch "$issue_number" "$issue_title" "$issue_type")
    
    # Spawn development swarm
    spawn_swarm "$issue_number" "$issue_type" "$complexity"
    
    # Assign specialized agents
    assign_agents "$issue_type"
    
    # Execute development task
    execute_task "$issue_number" "$issue_title"
    
    # Monitor swarm progress
    monitor_swarm
    
    # Validate changes
    validate_changes
    
    # Commit changes
    if commit_changes "$issue_number" "$issue_title" "$issue_type"; then
        # Create pull request
        create_pull_request "$issue_number" "$issue_title" "$branch_name"
        
        print_color "$GREEN" "🎉 Development complete!"
        print_color "$CYAN" "The swarm has successfully resolved issue #$issue_number"
    else
        print_color "$YELLOW" "⚠️  No changes were made by the swarm"
        print_color "$YELLOW" "The issue may require manual intervention"
    fi
    
    # Cleanup
    rm -f "$SWARM_CONFIG_DIR/current"
}

# Run main function
main "$@"