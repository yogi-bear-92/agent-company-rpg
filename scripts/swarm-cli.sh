#!/bin/bash

# Agent Company RPG - Swarm CLI
# Command-line interface for managing AI agent swarms via GitHub issues

set -e

REPO="yogi-bear-92/agent-company-rpg"
CLAUDE_FLOW="npx claude-flow@alpha"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to create a new swarm task
create_swarm() {
    print_color "$CYAN" "🚀 Creating New Swarm Task"
    echo ""
    
    # Prompt for swarm configuration
    print_color "$YELLOW" "Select Swarm Type:"
    echo "1) Hierarchical (CodeMaster leads)"
    echo "2) Mesh (All agents collaborate)"
    echo "3) Specialized (Task-specific agents)"
    echo "4) Adaptive (Self-organizing)"
    echo "5) Research (Scout leads exploration)"
    echo "6) Development (CodeMaster + Sage)"
    echo "7) Creative (Bard leads content)"
    echo "8) Full Team (All 4 agents)"
    read -p "Choice (1-8): " swarm_type
    
    case $swarm_type in
        1) SWARM_TYPE="Hierarchical (CodeMaster leads)" ;;
        2) SWARM_TYPE="Mesh (All agents collaborate)" ;;
        3) SWARM_TYPE="Specialized (Task-specific agents)" ;;
        4) SWARM_TYPE="Adaptive (Self-organizing)" ;;
        5) SWARM_TYPE="Research (Scout leads exploration)" ;;
        6) SWARM_TYPE="Development (CodeMaster + Sage)" ;;
        7) SWARM_TYPE="Creative (Bard leads content)" ;;
        8) SWARM_TYPE="Full Team (All 4 agents)" ;;
        *) SWARM_TYPE="Full Team (All 4 agents)" ;;
    esac
    
    # Get task description
    print_color "$YELLOW" "Enter Task Description:"
    read -p "> " task_description
    
    # Select priority
    print_color "$YELLOW" "Select Priority:"
    echo "1) 🔴 Critical - Immediate swarm deployment"
    echo "2) 🟠 High - Deploy within 4 hours"
    echo "3) 🟡 Medium - Deploy within 24 hours"
    echo "4) 🟢 Low - Schedule for next sprint"
    read -p "Choice (1-4): " priority
    
    case $priority in
        1) PRIORITY="🔴 Critical - Immediate swarm deployment" ;;
        2) PRIORITY="🟠 High - Deploy within 4 hours" ;;
        3) PRIORITY="🟡 Medium - Deploy within 24 hours" ;;
        4) PRIORITY="🟢 Low - Schedule for next sprint" ;;
        *) PRIORITY="🟡 Medium - Deploy within 24 hours" ;;
    esac
    
    # Create GitHub issue
    print_color "$GREEN" "Creating GitHub issue..."
    
    ISSUE_BODY="## Swarm Task Configuration

**Swarm Type:** $SWARM_TYPE
**Priority:** $PRIORITY

## Task Description
$task_description

## Required Agents
- [x] ⚔️ CodeMaster Zyx (Code Warrior - Development)
- [x] 🧙‍♀️ Sage Analytica (Data Sage - Analysis)
- [x] 🎭 Bard Creative (Content Bard - Documentation)
- [x] 🏃‍♂️ Scout Rapid (Research Scout - Information Gathering)

## Automation Triggers
- [x] Auto-create PR when complete
- [x] Run tests automatically
- [x] Generate progress reports
- [x] Enable real-time monitoring"

    gh issue create \
        --repo $REPO \
        --title "[SWARM] $task_description" \
        --body "$ISSUE_BODY" \
        --label "swarm:task,needs-triage,auto-assign"
    
    print_color "$GREEN" "✅ Swarm task created successfully!"
}

# Function to monitor active swarms
monitor_swarms() {
    print_color "$CYAN" "📊 Monitoring Active Swarms"
    echo ""
    
    # Get active swarms
    print_color "$YELLOW" "Active Swarms:"
    gh issue list --repo $REPO --label "swarm:active" --limit 10
    
    echo ""
    print_color "$YELLOW" "Recent Swarm Activity:"
    gh issue list --repo $REPO --label "swarm:task" --limit 5
    
    # Launch real-time monitoring
    if command -v claude-flow &> /dev/null; then
        print_color "$GREEN" "Launching real-time monitor..."
        $CLAUDE_FLOW swarm monitor
    fi
}

# Function to stop a swarm
stop_swarm() {
    print_color "$CYAN" "🛑 Stopping Swarm"
    echo ""
    
    # List active swarms
    print_color "$YELLOW" "Active Swarms:"
    gh issue list --repo $REPO --label "swarm:active" --limit 10
    
    read -p "Enter issue number to stop: " issue_number
    
    # Remove active label and add complete label
    gh issue edit $issue_number --repo $REPO \
        --remove-label "swarm:active" \
        --add-label "swarm:complete"
    
    # Add completion comment
    gh issue comment $issue_number --repo $REPO \
        --body "🛑 **Swarm Terminated**

The swarm has been manually stopped.
- Agents recalled to base
- Tasks suspended
- Resources deallocated"
    
    print_color "$GREEN" "✅ Swarm stopped successfully!"
}

# Function to view swarm status
view_status() {
    print_color "$CYAN" "📈 Swarm Status Dashboard"
    echo ""
    
    # Count swarms by status
    ACTIVE=$(gh issue list --repo $REPO --label "swarm:active" --json id --jq '. | length')
    COMPLETE=$(gh issue list --repo $REPO --label "swarm:complete" --json id --jq '. | length')
    PENDING=$(gh issue list --repo $REPO --label "swarm:task" --json id --jq '. | length')
    
    print_color "$GREEN" "Statistics:"
    echo "- Active Swarms: $ACTIVE"
    echo "- Completed: $COMPLETE"
    echo "- Pending: $PENDING"
    echo ""
    
    # Show agent assignments
    print_color "$YELLOW" "Agent Assignments:"
    echo "⚔️ CodeMaster: $(gh issue list --repo $REPO --label "agent:codemaster" --json id --jq '. | length') tasks"
    echo "🧙‍♀️ Sage: $(gh issue list --repo $REPO --label "agent:sage" --json id --jq '. | length') tasks"
    echo "🎭 Bard: $(gh issue list --repo $REPO --label "agent:bard" --json id --jq '. | length') tasks"
    echo "🏃‍♂️ Scout: $(gh issue list --repo $REPO --label "agent:scout" --json id --jq '. | length') tasks"
}

# Function to trigger swarm workflow
trigger_workflow() {
    print_color "$CYAN" "⚡ Triggering Swarm Workflow"
    echo ""
    
    read -p "Enter issue number: " issue_number
    
    # Trigger workflow
    gh workflow run swarm-orchestration.yml \
        --repo $REPO \
        -f issue_number=$issue_number
    
    print_color "$GREEN" "✅ Workflow triggered for issue #$issue_number"
    
    # Watch workflow
    print_color "$YELLOW" "Watching workflow execution..."
    gh run watch --repo $REPO
}

# Main menu
show_menu() {
    clear
    print_color "$PURPLE" "╔════════════════════════════════════════╗"
    print_color "$PURPLE" "║     🎮 Agent Company RPG Swarm CLI     ║"
    print_color "$PURPLE" "╚════════════════════════════════════════╝"
    echo ""
    print_color "$CYAN" "Main Menu:"
    echo "1) 🚀 Create New Swarm Task"
    echo "2) 📊 Monitor Active Swarms"
    echo "3) 📈 View Swarm Status"
    echo "4) ⚡ Trigger Swarm Workflow"
    echo "5) 🛑 Stop Active Swarm"
    echo "6) 📝 View Recent Issues"
    echo "7) 🔄 Refresh Labels"
    echo "8) 📖 Help"
    echo "9) 🚪 Exit"
    echo ""
    read -p "Select option (1-9): " choice
}

# Help function
show_help() {
    print_color "$CYAN" "📖 Swarm CLI Help"
    echo ""
    echo "This CLI helps you manage AI agent swarms for the Agent Company RPG project."
    echo ""
    print_color "$YELLOW" "Features:"
    echo "- Create swarm tasks that automatically deploy AI agents"
    echo "- Monitor active swarms in real-time"
    echo "- View status of all agents and tasks"
    echo "- Stop swarms manually if needed"
    echo ""
    print_color "$YELLOW" "Swarm Types:"
    echo "- Hierarchical: CodeMaster leads the team"
    echo "- Mesh: All agents work collaboratively"
    echo "- Specialized: Task-specific agent selection"
    echo "- Adaptive: Self-organizing based on task"
    echo ""
    print_color "$YELLOW" "Agents:"
    echo "⚔️ CodeMaster Zyx - Development and architecture"
    echo "🧙‍♀️ Sage Analytica - Data analysis and ML"
    echo "🎭 Bard Creative - Documentation and content"
    echo "🏃‍♂️ Scout Rapid - Research and information gathering"
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1) create_swarm ;;
        2) monitor_swarms ;;
        3) view_status ;;
        4) trigger_workflow ;;
        5) stop_swarm ;;
        6) gh issue list --repo $REPO --limit 10 ;;
        7) ./add-swarm-labels.sh ;;
        8) show_help ;;
        9) 
            print_color "$GREEN" "👋 Goodbye!"
            exit 0
            ;;
        *)
            print_color "$RED" "Invalid option. Please try again."
            sleep 2
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done