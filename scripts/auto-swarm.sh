#!/bin/bash

# Auto Swarm Mode - Intelligent autonomous development system
# Automatically analyzes and works on GitHub issues without human intervention

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
MAX_CONCURRENT_SWARMS=3
WORK_DIR="$(pwd)"
LOG_DIR="${WORK_DIR}/.swarm/logs"
STATE_FILE="${WORK_DIR}/.swarm/auto-state.json"
PRIORITIES_FILE="${WORK_DIR}/.swarm/priorities.yaml"

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$(dirname "$STATE_FILE")"

# ASCII Art Banner
show_banner() {
    echo -e "${PURPLE}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     🤖 AUTONOMOUS SWARM INTELLIGENCE SYSTEM 🤖              ║
    ║                                                              ║
    ║     Auto Mode: Full Autonomous Development Pipeline         ║
    ║     Version: 3.0.0 | Powered by Claude Flow                 ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Initialize auto mode
init_auto_mode() {
    echo -e "${CYAN}🚀 Initializing Autonomous Development Mode...${NC}"
    
    # Check for required tools
    command -v gh >/dev/null 2>&1 || { echo -e "${RED}❌ GitHub CLI (gh) is required${NC}"; exit 1; }
    command -v npx >/dev/null 2>&1 || { echo -e "${RED}❌ npx is required${NC}"; exit 1; }
    command -v jq >/dev/null 2>&1 || { echo -e "${RED}❌ jq is required${NC}"; exit 1; }
    
    # Initialize state file if doesn't exist
    if [ ! -f "$STATE_FILE" ]; then
        echo '{
            "mode": "auto",
            "started_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
            "active_swarms": [],
            "completed_issues": [],
            "failed_issues": [],
            "stats": {
                "total_processed": 0,
                "successful": 0,
                "failed": 0,
                "in_progress": 0
            }
        }' > "$STATE_FILE"
    fi
    
    # Create default priorities if doesn't exist
    if [ ! -f "$PRIORITIES_FILE" ]; then
        cat > "$PRIORITIES_FILE" << 'EOF'
# Auto Swarm Priority Configuration
priorities:
  # Issue label priorities (higher = more important)
  labels:
    critical: 100
    high-priority: 80
    bug: 70
    security: 90
    performance: 60
    feature: 50
    enhancement: 40
    documentation: 30
    chore: 20
    
  # Issue state priorities
  states:
    ready-for-development: 100
    approved: 80
    needs-review: 40
    draft: 10
    
  # Complexity scoring (lower complexity = higher priority)
  complexity:
    simple: 80
    medium: 50
    complex: 30
    
  # Age bonus (older issues get priority boost)
  age_bonus_per_day: 2
  max_age_bonus: 50
  
# Auto-assignment rules
assignment:
  max_concurrent: 3
  prefer_unassigned: true
  respect_assignments: false
  
# Swarm configuration
swarm:
  auto_topology: true
  default_topology: adaptive
  max_agents_per_swarm: 5
  timeout_minutes: 30
  
# Decision thresholds
thresholds:
  min_priority_score: 20
  auto_merge_confidence: 0.95
  test_pass_requirement: 0.98
EOF
    fi
    
    echo -e "${GREEN}✅ Auto mode initialized${NC}"
}

# Analyze repository and issues
analyze_repository() {
    echo -e "${CYAN}🔍 Analyzing repository state...${NC}"
    
    # Get repository info
    REPO_INFO=$(gh repo view --json name,owner,defaultBranchRef,issues,pullRequests)
    REPO_NAME=$(echo "$REPO_INFO" | jq -r '.name')
    REPO_OWNER=$(echo "$REPO_INFO" | jq -r '.owner.login')
    DEFAULT_BRANCH=$(echo "$REPO_INFO" | jq -r '.defaultBranchRef.name')
    
    # Get open issues
    echo -e "${BLUE}📋 Fetching open issues...${NC}"
    ISSUES=$(gh issue list --state open --json number,title,labels,assignees,createdAt,body,comments --limit 100)
    
    # Get open PRs
    echo -e "${BLUE}🔄 Fetching open pull requests...${NC}"
    PRS=$(gh pr list --state open --json number,title,labels,isDraft)
    
    # Analyze codebase health
    echo -e "${BLUE}🏥 Analyzing codebase health...${NC}"
    if [ -f "package.json" ]; then
        # Check for test failures
        npm test --silent 2>/dev/null && TEST_STATUS="passing" || TEST_STATUS="failing"
        
        # Check for lint issues
        npm run lint --silent 2>/dev/null && LINT_STATUS="clean" || LINT_STATUS="issues"
        
        # Check build status
        npm run build --silent 2>/dev/null && BUILD_STATUS="success" || BUILD_STATUS="failing"
    fi
    
    echo -e "${GREEN}✅ Repository analysis complete${NC}"
    echo -e "  📦 Repository: ${REPO_OWNER}/${REPO_NAME}"
    echo -e "  📝 Open Issues: $(echo "$ISSUES" | jq '. | length')"
    echo -e "  🔄 Open PRs: $(echo "$PRS" | jq '. | length')"
    echo -e "  🧪 Tests: ${TEST_STATUS:-unknown}"
    echo -e "  🎨 Lint: ${LINT_STATUS:-unknown}"
    echo -e "  🏗️ Build: ${BUILD_STATUS:-unknown}"
}

# Calculate issue priority score
calculate_priority() {
    local issue_json="$1"
    local score=50  # Base score
    
    # Load priority configuration
    local label_priorities=$(yq eval '.priorities.labels' "$PRIORITIES_FILE" 2>/dev/null || echo "{}")
    
    # Add label-based priority
    local labels=$(echo "$issue_json" | jq -r '.labels[].name' 2>/dev/null)
    for label in $labels; do
        case "$label" in
            critical|urgent) score=$((score + 100)) ;;
            high-priority) score=$((score + 80)) ;;
            bug|bugfix) score=$((score + 70)) ;;
            security) score=$((score + 90)) ;;
            performance) score=$((score + 60)) ;;
            feature) score=$((score + 50)) ;;
            enhancement) score=$((score + 40)) ;;
            documentation) score=$((score + 30)) ;;
            good-first-issue) score=$((score + 60)) ;;
            ready-for-development) score=$((score + 100)) ;;
            swarm-ready) score=$((score + 100)) ;;
        esac
    done
    
    # Add age bonus (older issues get priority)
    local created_at=$(echo "$issue_json" | jq -r '.createdAt')
    if [ ! -z "$created_at" ]; then
        local age_days=$(( ($(date +%s) - $(date -d "$created_at" +%s)) / 86400 ))
        local age_bonus=$((age_days * 2))
        [ $age_bonus -gt 50 ] && age_bonus=50
        score=$((score + age_bonus))
    fi
    
    # Reduce score if already assigned
    local assignees=$(echo "$issue_json" | jq '.assignees | length')
    [ "$assignees" -gt 0 ] && score=$((score - 30))
    
    # Boost if has many comments (active discussion)
    local comments=$(echo "$issue_json" | jq '.comments | length' 2>/dev/null || echo "0")
    [ "$comments" -gt 5 ] && score=$((score + 20))
    
    # Analyze complexity from body
    local body_length=$(echo "$issue_json" | jq -r '.body' | wc -c)
    if [ "$body_length" -lt 200 ]; then
        score=$((score + 30))  # Simple issue
    elif [ "$body_length" -lt 1000 ]; then
        score=$((score + 10))  # Medium complexity
    else
        score=$((score - 10))  # Complex issue
    fi
    
    echo "$score"
}

# Select best issue to work on
select_next_issue() {
    echo -e "${CYAN}🎯 Selecting next issue to work on...${NC}"
    
    local best_issue=""
    local best_score=0
    local best_title=""
    
    # Get list of issues not being worked on
    local active_issues=$(jq -r '.active_swarms[].issue_number' "$STATE_FILE" 2>/dev/null | tr '\n' ' ')
    local completed_issues=$(jq -r '.completed_issues[]' "$STATE_FILE" 2>/dev/null | tr '\n' ' ')
    local failed_issues=$(jq -r '.failed_issues[]' "$STATE_FILE" 2>/dev/null | tr '\n' ' ')
    
    # Evaluate each issue
    echo "$ISSUES" | jq -c '.[]' | while read -r issue; do
        local issue_number=$(echo "$issue" | jq -r '.number')
        local issue_title=$(echo "$issue" | jq -r '.title')
        
        # Skip if already being worked on or completed
        if [[ " $active_issues " =~ " $issue_number " ]] || \
           [[ " $completed_issues " =~ " $issue_number " ]] || \
           [[ " $failed_issues " =~ " $issue_number " ]]; then
            continue
        fi
        
        # Calculate priority score
        local score=$(calculate_priority "$issue")
        
        echo -e "  Issue #${issue_number}: ${issue_title} (Score: ${score})"
        
        if [ "$score" -gt "$best_score" ]; then
            best_score=$score
            best_issue=$issue_number
            best_title=$issue_title
        fi
    done
    
    if [ ! -z "$best_issue" ]; then
        echo -e "${GREEN}✅ Selected Issue #${best_issue}: ${best_title} (Priority: ${best_score})${NC}"
        echo "$best_issue"
    else
        echo -e "${YELLOW}⚠️ No suitable issues found${NC}"
        echo ""
    fi
}

# Determine swarm configuration for issue
determine_swarm_config() {
    local issue_number=$1
    local issue_json=$(echo "$ISSUES" | jq ".[] | select(.number == $issue_number)")
    
    local labels=$(echo "$issue_json" | jq -r '.labels[].name' | tr '\n' ' ')
    local body_length=$(echo "$issue_json" | jq -r '.body' | wc -c)
    
    # Determine topology based on issue characteristics
    local topology="adaptive"
    local max_agents=4
    local strategy="balanced"
    
    if [[ "$labels" =~ "bug" ]]; then
        topology="hierarchical"
        max_agents=3
        strategy="focused"
    elif [[ "$labels" =~ "feature" ]]; then
        topology="mesh"
        max_agents=5
        strategy="collaborative"
    elif [[ "$labels" =~ "documentation" ]]; then
        topology="star"
        max_agents=2
        strategy="specialized"
    elif [[ "$labels" =~ "performance" ]]; then
        topology="adaptive"
        max_agents=4
        strategy="analytical"
    fi
    
    # Adjust based on complexity
    if [ "$body_length" -gt 2000 ]; then
        max_agents=$((max_agents + 1))
        topology="mesh"
    fi
    
    echo "{\"topology\": \"$topology\", \"max_agents\": $max_agents, \"strategy\": \"$strategy\"}"
}

# Start swarm on issue
start_swarm() {
    local issue_number=$1
    local config=$2
    
    echo -e "${CYAN}🚀 Starting swarm on Issue #${issue_number}...${NC}"
    
    local topology=$(echo "$config" | jq -r '.topology')
    local max_agents=$(echo "$config" | jq -r '.max_agents')
    local strategy=$(echo "$config" | jq -r '.strategy')
    
    # Update state file
    local swarm_id="swarm-${issue_number}-$(date +%s)"
    jq --arg sid "$swarm_id" --arg inum "$issue_number" \
        '.active_swarms += [{"swarm_id": $sid, "issue_number": $inum, "started_at": now | todate}]' \
        "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
    
    # Start the actual swarm
    echo -e "${BLUE}📡 Initializing swarm with topology: ${topology}${NC}"
    
    # Create a background process for the swarm
    (
        # Log file for this swarm
        LOG_FILE="${LOG_DIR}/swarm-${issue_number}-$(date +%Y%m%d-%H%M%S).log"
        
        echo "[$(date)] Starting autonomous swarm for Issue #${issue_number}" >> "$LOG_FILE"
        echo "[$(date)] Configuration: topology=${topology}, agents=${max_agents}, strategy=${strategy}" >> "$LOG_FILE"
        
        # Run the development swarm
        if [ -f "./scripts/dev-swarm.sh" ]; then
            ./scripts/dev-swarm.sh --issue "$issue_number" \
                --topology "$topology" \
                --agents "$max_agents" \
                --auto \
                >> "$LOG_FILE" 2>&1
            
            SWARM_EXIT_CODE=$?
        else
            # Fallback to Claude Flow commands
            npx claude-flow@alpha swarm init --topology "$topology" --maxAgents "$max_agents" >> "$LOG_FILE" 2>&1
            npx claude-flow@alpha github issue-swarm --issue "$issue_number" --auto-pr >> "$LOG_FILE" 2>&1
            
            SWARM_EXIT_CODE=$?
        fi
        
        # Update state based on exit code
        if [ $SWARM_EXIT_CODE -eq 0 ]; then
            echo "[$(date)] Swarm completed successfully" >> "$LOG_FILE"
            
            # Move from active to completed
            jq --arg sid "$swarm_id" --arg inum "$issue_number" \
                '.active_swarms = [.active_swarms[] | select(.swarm_id != $sid)] |
                 .completed_issues += [$inum] |
                 .stats.successful += 1 |
                 .stats.in_progress -= 1' \
                "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
        else
            echo "[$(date)] Swarm failed with exit code: $SWARM_EXIT_CODE" >> "$LOG_FILE"
            
            # Move from active to failed
            jq --arg sid "$swarm_id" --arg inum "$issue_number" \
                '.active_swarms = [.active_swarms[] | select(.swarm_id != $sid)] |
                 .failed_issues += [$inum] |
                 .stats.failed += 1 |
                 .stats.in_progress -= 1' \
                "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
        fi
    ) &
    
    # Update in_progress counter
    jq '.stats.in_progress += 1 | .stats.total_processed += 1' \
        "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
    
    echo -e "${GREEN}✅ Swarm ${swarm_id} started in background${NC}"
}

# Monitor active swarms
monitor_swarms() {
    local active_count=$(jq '.active_swarms | length' "$STATE_FILE")
    
    if [ "$active_count" -gt 0 ]; then
        echo -e "${CYAN}📊 Active Swarms:${NC}"
        jq -r '.active_swarms[] | "  🤖 Issue #\(.issue_number) (ID: \(.swarm_id))"' "$STATE_FILE"
    fi
    
    # Show stats
    local stats=$(jq '.stats' "$STATE_FILE")
    echo -e "${CYAN}📈 Statistics:${NC}"
    echo -e "  Total Processed: $(echo "$stats" | jq -r '.total_processed')"
    echo -e "  ✅ Successful: $(echo "$stats" | jq -r '.successful')"
    echo -e "  ❌ Failed: $(echo "$stats" | jq -r '.failed')"
    echo -e "  🔄 In Progress: $(echo "$stats" | jq -r '.in_progress')"
}

# Main auto mode loop
run_auto_mode() {
    local max_iterations=${1:-0}  # 0 = infinite
    local iteration=0
    
    echo -e "${PURPLE}🤖 AUTO MODE ACTIVATED - Entering autonomous development loop${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
    
    while true; do
        iteration=$((iteration + 1))
        
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}🔄 Iteration #${iteration} - $(date)${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        # Check current swarm count
        local active_count=$(jq '.active_swarms | length' "$STATE_FILE")
        
        if [ "$active_count" -lt "$MAX_CONCURRENT_SWARMS" ]; then
            # Analyze repository
            analyze_repository
            
            # Select next issue
            local next_issue=$(select_next_issue)
            
            if [ ! -z "$next_issue" ]; then
                # Determine swarm configuration
                local swarm_config=$(determine_swarm_config "$next_issue")
                
                # Start swarm
                start_swarm "$next_issue" "$swarm_config"
            else
                echo -e "${YELLOW}⚠️ No issues available for processing${NC}"
            fi
        else
            echo -e "${YELLOW}⏳ Maximum concurrent swarms reached (${active_count}/${MAX_CONCURRENT_SWARMS})${NC}"
        fi
        
        # Monitor active swarms
        monitor_swarms
        
        # Check if we should stop
        if [ "$max_iterations" -gt 0 ] && [ "$iteration" -ge "$max_iterations" ]; then
            echo -e "${GREEN}✅ Completed ${max_iterations} iterations${NC}"
            break
        fi
        
        # Wait before next iteration
        echo -e "\n${CYAN}💤 Waiting 60 seconds before next check...${NC}\n"
        sleep 60
    done
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down Auto Mode...${NC}"
    
    # Wait for active swarms to complete (with timeout)
    local active_count=$(jq '.active_swarms | length' "$STATE_FILE")
    
    if [ "$active_count" -gt 0 ]; then
        echo -e "${CYAN}⏳ Waiting for ${active_count} active swarms to complete...${NC}"
        
        local timeout=300  # 5 minutes
        local waited=0
        
        while [ "$active_count" -gt 0 ] && [ "$waited" -lt "$timeout" ]; do
            sleep 10
            waited=$((waited + 10))
            active_count=$(jq '.active_swarms | length' "$STATE_FILE")
            echo -ne "\r${CYAN}⏳ Active swarms: ${active_count} (waited ${waited}s)${NC}"
        done
        echo ""
    fi
    
    # Final statistics
    echo -e "\n${CYAN}📊 Final Statistics:${NC}"
    monitor_swarms
    
    echo -e "\n${GREEN}✅ Auto Mode shutdown complete${NC}"
    echo -e "${BLUE}📝 Logs available in: ${LOG_DIR}${NC}"
}

# Trap Ctrl+C
trap cleanup EXIT INT TERM

# Parse command line arguments
MODE="auto"
MAX_ITERATIONS=0
DAEMON=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --iterations|-i)
            MAX_ITERATIONS="$2"
            shift 2
            ;;
        --daemon|-d)
            DAEMON=true
            shift
            ;;
        --config|-c)
            PRIORITIES_FILE="$2"
            shift 2
            ;;
        --max-concurrent|-m)
            MAX_CONCURRENT_SWARMS="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -i, --iterations <n>    Number of iterations (0 = infinite)"
            echo "  -d, --daemon           Run as daemon in background"
            echo "  -c, --config <file>    Priority configuration file"
            echo "  -m, --max-concurrent   Maximum concurrent swarms (default: 3)"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run infinitely"
            echo "  $0 -i 10              # Run 10 iterations"
            echo "  $0 -d                 # Run as daemon"
            echo "  $0 -m 5               # Allow 5 concurrent swarms"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Main execution
show_banner
init_auto_mode

if [ "$DAEMON" = true ]; then
    echo -e "${CYAN}🌙 Starting Auto Mode as daemon...${NC}"
    nohup "$0" --iterations "$MAX_ITERATIONS" > "${LOG_DIR}/auto-mode-daemon.log" 2>&1 &
    echo $! > "${WORK_DIR}/.swarm/auto-mode.pid"
    echo -e "${GREEN}✅ Auto Mode daemon started with PID: $!${NC}"
    echo -e "${BLUE}📝 Logs: ${LOG_DIR}/auto-mode-daemon.log${NC}"
else
    run_auto_mode "$MAX_ITERATIONS"
fi