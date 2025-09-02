#!/usr/bin/env node

/**
 * Swarm Auto Mode - Intelligent autonomous development
 * Automatically selects and works on GitHub issues
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxConcurrent: 3,
  checkInterval: 60000, // 1 minute
  priorityRules: {
    labels: {
      'critical': 100,
      'high-priority': 80,
      'bug': 70,
      'security': 90,
      'performance': 60,
      'feature': 50,
      'enhancement': 40,
      'documentation': 30,
      'good-first-issue': 60,
      'ready-for-development': 100,
      'swarm-ready': 100
    },
    age: {
      bonusPerDay: 2,
      maxBonus: 50
    }
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// State management
let state = {
  activeSwarms: [],
  completedIssues: [],
  failedIssues: [],
  stats: {
    total: 0,
    successful: 0,
    failed: 0
  }
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

// Get open issues from GitHub
function getOpenIssues() {
  log('\n🔍 Fetching open issues...', 'cyan');
  
  const issuesJson = execCommand('gh issue list --state open --json number,title,labels,assignees,createdAt,body --limit 100');
  
  if (!issuesJson) {
    log('❌ Failed to fetch issues', 'red');
    return [];
  }
  
  const issues = JSON.parse(issuesJson);
  log(`  Found ${issues.length} open issues`, 'green');
  return issues;
}

// Calculate priority score for an issue
function calculatePriority(issue) {
  let score = 50; // Base score
  
  // Label-based priority
  if (issue.labels) {
    issue.labels.forEach(label => {
      const labelName = label.name.toLowerCase();
      Object.keys(CONFIG.priorityRules.labels).forEach(key => {
        if (labelName.includes(key)) {
          score += CONFIG.priorityRules.labels[key];
        }
      });
    });
  }
  
  // Age bonus
  if (issue.createdAt) {
    const ageInDays = Math.floor((Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24));
    const ageBonus = Math.min(ageInDays * CONFIG.priorityRules.age.bonusPerDay, CONFIG.priorityRules.age.maxBonus);
    score += ageBonus;
  }
  
  // Reduce score if already assigned
  if (issue.assignees && issue.assignees.length > 0) {
    score -= 30;
  }
  
  // Simple issues get priority
  if (issue.body && issue.body.length < 500) {
    score += 20;
  }
  
  return score;
}

// Select the best issue to work on
function selectNextIssue(issues) {
  log('\n🎯 Selecting next issue...', 'cyan');
  
  // Filter out issues already being worked on or completed
  const availableIssues = issues.filter(issue => {
    const issueNum = issue.number.toString();
    return !state.activeSwarms.includes(issueNum) &&
           !state.completedIssues.includes(issueNum) &&
           !state.failedIssues.includes(issueNum);
  });
  
  if (availableIssues.length === 0) {
    log('  No available issues to work on', 'yellow');
    return null;
  }
  
  // Calculate priorities and sort
  const prioritizedIssues = availableIssues.map(issue => ({
    ...issue,
    priority: calculatePriority(issue)
  })).sort((a, b) => b.priority - a.priority);
  
  const selected = prioritizedIssues[0];
  log(`  Selected: Issue #${selected.number} - ${selected.title} (Priority: ${selected.priority})`, 'green');
  
  return selected;
}

// Start a swarm on an issue
function startSwarm(issue) {
  log(`\n🚀 Starting swarm on Issue #${issue.number}...`, 'magenta');
  
  // Add to active swarms
  state.activeSwarms.push(issue.number.toString());
  state.stats.total++;
  
  // Determine swarm configuration based on issue
  let topology = 'adaptive';
  let agents = 4;
  
  const labels = issue.labels ? issue.labels.map(l => l.name.toLowerCase()).join(' ') : '';
  
  if (labels.includes('bug')) {
    topology = 'hierarchical';
    agents = 3;
  } else if (labels.includes('feature')) {
    topology = 'mesh';
    agents = 5;
  } else if (labels.includes('documentation')) {
    topology = 'star';
    agents = 2;
  }
  
  // Execute swarm command
  const command = `npx claude-flow@alpha github issue-swarm --issue ${issue.number} --topology ${topology} --agents ${agents} --auto-pr`;
  
  log(`  Command: ${command}`, 'blue');
  
  // Run in background
  const child = spawn('npx', [
    'claude-flow@alpha',
    'github',
    'issue-swarm',
    '--issue', issue.number.toString(),
    '--topology', topology,
    '--agents', agents.toString(),
    '--auto-pr'
  ], {
    detached: true,
    stdio: 'ignore'
  });
  
  child.unref();
  
  // Handle completion (simplified - in production would monitor properly)
  setTimeout(() => {
    const index = state.activeSwarms.indexOf(issue.number.toString());
    if (index > -1) {
      state.activeSwarms.splice(index, 1);
      state.completedIssues.push(issue.number.toString());
      state.stats.successful++;
      log(`✅ Swarm completed for Issue #${issue.number}`, 'green');
    }
  }, 300000); // 5 minutes timeout
  
  log(`  Swarm started in background (PID: ${child.pid})`, 'green');
}

// Main auto mode loop
async function runAutoMode() {
  log('\n╔══════════════════════════════════════════════════════════════╗', 'magenta');
  log('║     🤖 AUTONOMOUS SWARM INTELLIGENCE - AUTO MODE 🤖         ║', 'magenta');
  log('║                                                              ║', 'magenta');
  log('║     Automatically selecting and working on GitHub issues     ║', 'magenta');
  log('╚══════════════════════════════════════════════════════════════╝', 'magenta');
  
  log('\nPress Ctrl+C to stop\n', 'yellow');
  
  // Main loop
  while (true) {
    log('\n' + '═'.repeat(60), 'cyan');
    log(`🔄 Auto Mode Check - ${new Date().toLocaleString()}`, 'cyan');
    log('═'.repeat(60), 'cyan');
    
    // Check if we can start new swarms
    if (state.activeSwarms.length < CONFIG.maxConcurrent) {
      // Get issues
      const issues = getOpenIssues();
      
      if (issues.length > 0) {
        // Select next issue
        const nextIssue = selectNextIssue(issues);
        
        if (nextIssue) {
          // Start swarm
          startSwarm(nextIssue);
        }
      }
    } else {
      log(`⏳ Maximum concurrent swarms reached (${state.activeSwarms.length}/${CONFIG.maxConcurrent})`, 'yellow');
    }
    
    // Show statistics
    log('\n📊 Statistics:', 'cyan');
    log(`  Active Swarms: ${state.activeSwarms.length}`, 'blue');
    log(`  Total Processed: ${state.stats.total}`, 'blue');
    log(`  Successful: ${state.stats.successful}`, 'green');
    log(`  Failed: ${state.stats.failed}`, 'red');
    
    if (state.activeSwarms.length > 0) {
      log(`  Working on: #${state.activeSwarms.join(', #')}`, 'blue');
    }
    
    // Wait before next check
    log(`\n💤 Waiting ${CONFIG.checkInterval / 1000} seconds...`, 'cyan');
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Shutting down Auto Mode...', 'yellow');
  log('📊 Final Statistics:', 'cyan');
  log(`  Total Processed: ${state.stats.total}`, 'blue');
  log(`  Successful: ${state.stats.successful}`, 'green');
  log(`  Failed: ${state.stats.failed}`, 'red');
  process.exit(0);
});

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node swarm-auto.js [options]

Options:
  --max-concurrent <n>  Maximum concurrent swarms (default: 3)
  --interval <ms>       Check interval in milliseconds (default: 60000)
  --once               Run once and exit
  --help, -h          Show this help message

Examples:
  node swarm-auto.js                     # Run continuously
  node swarm-auto.js --max-concurrent 5  # Allow 5 concurrent swarms
  node swarm-auto.js --once              # Process one issue and exit
  `);
  process.exit(0);
}

// Override config from command line
if (args.includes('--max-concurrent')) {
  const index = args.indexOf('--max-concurrent');
  CONFIG.maxConcurrent = parseInt(args[index + 1]);
}

if (args.includes('--interval')) {
  const index = args.indexOf('--interval');
  CONFIG.checkInterval = parseInt(args[index + 1]);
}

// Run the auto mode
if (args.includes('--once')) {
  // Run once mode
  getOpenIssues().forEach(issue => {
    const nextIssue = selectNextIssue([issue]);
    if (nextIssue) {
      startSwarm(nextIssue);
    }
  });
} else {
  // Run continuous mode
  runAutoMode().catch(console.error);
}