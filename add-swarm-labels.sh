#!/bin/bash

REPO="yogi-bear-92/agent-company-rpg"

# Swarm coordination labels
gh label create "swarm:task" --description "Task for AI agent swarm execution" --color "9C27B0" --repo $REPO
gh label create "swarm:active" --description "Swarm currently executing" --color "4CAF50" --repo $REPO
gh label create "swarm:complete" --description "Swarm task completed" --color "2196F3" --repo $REPO
gh label create "swarm:urgent" --description "Urgent swarm deployment needed" --color "F44336" --repo $REPO
gh label create "swarm:monitoring" --description "Swarm being monitored" --color "FF9800" --repo $REPO

# Agent-specific labels
gh label create "agent:codemaster" --description "Assigned to CodeMaster Zyx" --color "7B1FA2" --repo $REPO
gh label create "agent:sage" --description "Assigned to Sage Analytica" --color "303F9F" --repo $REPO
gh label create "agent:bard" --description "Assigned to Bard Creative" --color "00796B" --repo $REPO
gh label create "agent:scout" --description "Assigned to Scout Rapid" --color "F57C00" --repo $REPO

# Swarm topology labels
gh label create "topology:hierarchical" --description "Hierarchical swarm structure" --color "6A1B9A" --repo $REPO
gh label create "topology:mesh" --description "Mesh network swarm" --color "1976D2" --repo $REPO
gh label create "topology:adaptive" --description "Self-organizing swarm" --color "388E3C" --repo $REPO
gh label create "topology:specialized" --description "Task-specific swarm" --color "E65100" --repo $REPO

# Automation status labels
gh label create "auto-assign" --description "Automatically assign agents" --color "9E9E9E" --repo $REPO
gh label create "auto-pr" --description "Auto-create PR when complete" --color "795548" --repo $REPO
gh label create "auto-test" --description "Run tests automatically" --color "607D8B" --repo $REPO
gh label create "auto-deploy" --description "Auto-deploy on success" --color "455A64" --repo $REPO

echo "✅ All swarm labels created successfully!"
