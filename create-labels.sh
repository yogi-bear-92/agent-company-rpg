#!/bin/bash

REPO="yogi-bear-92/agent-company-rpg"

# Feature labels
gh label create "feature:rpg-mechanics" --description "RPG gameplay and mechanics" --color "7057ff" --repo $REPO
gh label create "feature:knowledge-system" --description "Knowledge base and learning integration" --color "0e8a16" --repo $REPO
gh label create "feature:daa-integration" --description "DAA autonomous agent features" --color "d73a4a" --repo $REPO
gh label create "feature:token-economy" --description "Token rewards and economics" --color "fbca04" --repo $REPO
gh label create "feature:ml-training" --description "Distributed ML and Prime framework" --color "006b75" --repo $REPO

# Priority labels
gh label create "priority:critical" --description "Critical issue blocking development" --color "d73a4a" --repo $REPO
gh label create "priority:high" --description "High priority feature or fix" --color "e99695" --repo $REPO
gh label create "priority:medium" --description "Medium priority enhancement" --color "fbca04" --repo $REPO
gh label create "priority:low" --description "Nice to have features" --color "0e8a16" --repo $REPO

# Type labels
gh label create "type:bug" --description "Something isn't working" --color "d73a4a" --repo $REPO
gh label create "type:enhancement" --description "New feature or request" --color "a2eeef" --repo $REPO
gh label create "type:documentation" --description "Documentation improvements" --color "0075ca" --repo $REPO
gh label create "type:performance" --description "Performance optimization" --color "ffd700" --repo $REPO
gh label create "type:security" --description "Security vulnerability or concern" --color "ee0701" --repo $REPO

# Component labels
gh label create "component:frontend" --description "React UI components" --color "bfd4f2" --repo $REPO
gh label create "component:backend" --description "Backend services and APIs" --color "5319e7" --repo $REPO
gh label create "component:smart-contracts" --description "Blockchain and smart contracts" --color "1d76db" --repo $REPO
gh label create "component:infrastructure" --description "Infrastructure and DevOps" --color "c5def5" --repo $REPO

# Workflow labels
gh label create "needs-triage" --description "Issue needs to be triaged" --color "d93f0b" --repo $REPO
gh label create "in-progress" --description "Work in progress" --color "0e8a16" --repo $REPO
gh label create "needs-review" --description "Needs code review" --color "fbca04" --repo $REPO
gh label create "completed" --description "Task completed" --color "0e8a16" --repo $REPO
gh label create "stale" --description "No activity for 30 days" --color "795548" --repo $REPO

echo "✅ All labels created successfully!"
