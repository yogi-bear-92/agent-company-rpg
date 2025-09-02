#!/bin/bash

REPO="yogi-bear-92/agent-company-rpg"

echo "==================================="
echo "📊 AGENT COMPANY RPG - BMAD PROGRESS"
echo "==================================="
echo ""

# Function to count issues by milestone
count_issues() {
    local milestone="$1"
    local count=$(gh issue list --repo $REPO --milestone "$milestone" --json number --jq '. | length' 2>/dev/null || echo "0")
    echo "$count"
}

# BUILD Phase
echo "🏗️ BUILD Phase - Foundation & Development"
echo "----------------------------------------"
BUILD_COUNT=$(count_issues "🏗️ BUILD Phase - Foundation & Development")
echo "Total Issues: $BUILD_COUNT"
gh issue list --repo $REPO --milestone "🏗️ BUILD Phase - Foundation & Development" --limit 10 2>/dev/null || echo "No issues yet"
echo ""

# MEASURE Phase
echo "📊 MEASURE Phase - Metrics & KPIs"
echo "----------------------------------------"
MEASURE_COUNT=$(count_issues "📊 MEASURE Phase - Metrics & KPIs")
echo "Total Issues: $MEASURE_COUNT"
gh issue list --repo $REPO --milestone "📊 MEASURE Phase - Metrics & KPIs" --limit 10 2>/dev/null || echo "No issues yet"
echo ""

# ANALYZE Phase
echo "🔍 ANALYZE Phase - Insights & Optimization"
echo "----------------------------------------"
ANALYZE_COUNT=$(count_issues "🔍 ANALYZE Phase - Insights & Optimization")
echo "Total Issues: $ANALYZE_COUNT"
gh issue list --repo $REPO --milestone "🔍 ANALYZE Phase - Insights & Optimization" --limit 10 2>/dev/null || echo "No issues yet"
echo ""

# DECIDE Phase
echo "🎯 DECIDE Phase - Strategy & Decisions"
echo "----------------------------------------"
DECIDE_COUNT=$(count_issues "🎯 DECIDE Phase - Strategy & Decisions")
echo "Total Issues: $DECIDE_COUNT"
gh issue list --repo $REPO --milestone "🎯 DECIDE Phase - Strategy & Decisions" --limit 10 2>/dev/null || echo "No issues yet"
echo ""

# Summary
echo "==================================="
echo "📈 SUMMARY"
echo "==================================="
echo "BUILD:   $BUILD_COUNT issues"
echo "MEASURE: $MEASURE_COUNT issues"
echo "ANALYZE: $ANALYZE_COUNT issues"
echo "DECIDE:  $DECIDE_COUNT issues"
TOTAL=$((BUILD_COUNT + MEASURE_COUNT + ANALYZE_COUNT + DECIDE_COUNT))
echo "----------------------------------------"
echo "TOTAL:   $TOTAL issues across all phases"
echo ""
echo "View milestones: https://github.com/$REPO/milestones"
echo "View project: https://github.com/$REPO/issues"

