#!/bin/bash

# Agent Company RPG - GitHub Issue Triage Setup Script
# Sets up intelligent issue management with Claude-Flow

echo "🎮 Agent Company RPG - GitHub Issue Triage Setup"
echo "================================================"

# Check if claude-flow is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

# Configuration
REPO_OWNER=${GITHUB_OWNER:-"your-github-username"}
REPO_NAME=${GITHUB_REPO:-"agent-company-rpg"}
CONFIG_FILE="./config/issue-triage-config.yml"

echo ""
echo "📋 Configuration:"
echo "  Repository: $REPO_OWNER/$REPO_NAME"
echo "  Config File: $CONFIG_FILE"
echo ""

# Initialize GitHub integration
echo "🔧 Initializing GitHub integration..."
npx claude-flow@alpha github init

# Function to run issue triage
run_triage() {
    echo ""
    echo "🤖 Running intelligent issue triage..."
    npx claude-flow@alpha github issue-tracker "analyze and triage all open issues for Agent Company RPG" \
        --verbose \
        --config "$CONFIG_FILE"
}

# Function to create labels
create_labels() {
    echo ""
    echo "🏷️ Creating GitHub labels..."
    npx claude-flow@alpha github issue-tracker "create all labels defined in config" \
        --auto-approve \
        --config "$CONFIG_FILE"
}

# Function to setup project board
setup_project_board() {
    echo ""
    echo "📊 Setting up project board..."
    npx claude-flow@alpha github issue-tracker "create project board with columns for Agent Company RPG" \
        --auto-approve \
        --config "$CONFIG_FILE"
}

# Function to create issue templates
create_templates() {
    echo ""
    echo "📝 Creating issue templates..."
    npx claude-flow@alpha github issue-tracker "create issue templates for bug reports, features, and DAA integration" \
        --auto-approve \
        --config "$CONFIG_FILE"
}

# Function to setup milestones
setup_milestones() {
    echo ""
    echo "🎯 Setting up milestones..."
    npx claude-flow@alpha github issue-tracker "create milestones for all project phases" \
        --auto-approve \
        --config "$CONFIG_FILE"
}

# Main menu
while true; do
    echo ""
    echo "🎮 Agent Company RPG Issue Triage Menu"
    echo "======================================"
    echo "1) Run full issue triage (analyze & label)"
    echo "2) Create GitHub labels"
    echo "3) Setup project board"
    echo "4) Create issue templates"
    echo "5) Setup milestones"
    echo "6) Full setup (all of the above)"
    echo "7) Dry run (preview without changes)"
    echo "8) Exit"
    echo ""
    read -p "Select an option (1-8): " choice

    case $choice in
        1)
            run_triage
            ;;
        2)
            create_labels
            ;;
        3)
            setup_project_board
            ;;
        4)
            create_templates
            ;;
        5)
            setup_milestones
            ;;
        6)
            echo "🚀 Running full setup..."
            create_labels
            setup_project_board
            create_templates
            setup_milestones
            run_triage
            echo ""
            echo "✅ Full setup complete!"
            ;;
        7)
            echo "🔍 Running dry run..."
            npx claude-flow@alpha github issue-tracker "analyze issues and show proposed changes" \
                --dry-run \
                --verbose \
                --config "$CONFIG_FILE"
            ;;
        8)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please select 1-8."
            ;;
    esac
done