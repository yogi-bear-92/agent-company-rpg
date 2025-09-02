# 🤖 Auto Mode - Autonomous Development System

## Overview

Auto Mode is an intelligent, autonomous development system that automatically:
- Analyzes all open GitHub issues
- Prioritizes them based on importance and complexity
- Spawns AI agent swarms to work on them
- Creates branches, implements solutions, runs tests, and creates PRs
- Works continuously without human intervention

## 🚀 Quick Start

### Simplest Way to Start

```bash
# Start auto mode - it will automatically work on all issues
npm run swarm:auto
```

That's it! The system will now:
1. Scan all open issues
2. Pick the highest priority issue
3. Start working on it automatically
4. Move to the next issue when done
5. Continue until stopped

### Other Options

```bash
# Run as background daemon (keeps running even if you close terminal)
npm run swarm:auto:daemon

# Work on a specific issue manually
npm run swarm -- --issue 16

# Check status of active swarms
npm run swarm:status

# Stop all swarms
npm run swarm:stop
```

## 🎯 How It Works

### Automatic Priority System

The system automatically prioritizes issues based on:

1. **Labels** (automatically detected):
   - `critical` / `urgent`: Highest priority (100 points)
   - `security`: Very high priority (90 points)
   - `bug`: High priority (70 points)
   - `performance`: Medium-high priority (60 points)
   - `feature`: Medium priority (50 points)
   - `documentation`: Lower priority (30 points)

2. **Issue Age**: Older issues get priority boost (2 points per day, max 50)

3. **Complexity**: Simple issues are prioritized (based on description length)

4. **Assignment Status**: Unassigned issues are preferred

### Intelligent Swarm Configuration

The system automatically configures swarms based on issue type:

- **Bug Fixes**: Hierarchical swarm with analyzer, fixer, and tester agents
- **Features**: Mesh swarm with architect, developer, tester, and documenter
- **Documentation**: Star topology with specialized documentation agents
- **Performance**: Adaptive swarm with performance analysis agents

## 📊 Monitoring

While Auto Mode is running, you'll see:

```
🔄 Auto Mode Check - 2024-01-02 10:30:00
════════════════════════════════════════════════════════════════

🔍 Fetching open issues...
  Found 12 open issues

🎯 Selecting next issue...
  Selected: Issue #16 - Fix XP bar animation (Priority: 170)

🚀 Starting swarm on Issue #16...
  Command: npx claude-flow@alpha github issue-swarm --issue 16 --topology hierarchical --agents 3 --auto-pr
  Swarm started in background

📊 Statistics:
  Active Swarms: 1
  Total Processed: 5
  Successful: 4
  Failed: 0
  Working on: #16

💤 Waiting 60 seconds...
```

## 🛠️ Advanced Configuration

### Custom Priority Rules

Create `.swarm/priorities.yaml`:

```yaml
priorities:
  labels:
    your-custom-label: 85
    another-label: 45
  age_bonus_per_day: 3
  max_age_bonus: 75

swarm:
  max_agents_per_swarm: 6
  timeout_minutes: 45
```

### Command Line Options

```bash
# Run with custom settings
./scripts/auto-swarm.sh --max-concurrent 5 --iterations 10

# Node.js version
node ./scripts/swarm-auto.js --max-concurrent 5 --interval 30000
```

### Options:
- `--max-concurrent <n>`: Maximum swarms running at once (default: 3)
- `--iterations <n>`: Number of cycles to run (0 = infinite)
- `--interval <ms>`: Check interval in milliseconds (default: 60000)
- `--daemon`: Run in background
- `--once`: Process one issue and exit

## 🔍 What Each Swarm Does

When a swarm starts on an issue, it will:

1. **Analyze** the issue to understand requirements
2. **Create** a feature branch with proper naming
3. **Implement** the solution using appropriate agents
4. **Test** the implementation
5. **Fix** any linting or type errors
6. **Commit** with conventional commit messages
7. **Push** to origin
8. **Create** a pull request with full description
9. **Update** the issue with progress

## 📈 Success Metrics

Auto Mode tracks:
- Total issues processed
- Success rate
- Average time per issue
- Active swarms
- Failed attempts

## 🛑 Stopping Auto Mode

To stop Auto Mode gracefully:

```bash
# Stop all swarms
npm run swarm:stop

# Or press Ctrl+C in the terminal running Auto Mode
```

The system will:
1. Stop accepting new issues
2. Wait for active swarms to complete
3. Show final statistics
4. Exit cleanly

## 💡 Best Practices

1. **Label Your Issues**: Use standard labels for better prioritization
2. **Clear Descriptions**: Write clear issue descriptions for better AI understanding
3. **Monitor PRs**: Review the PRs created by swarms before merging
4. **Resource Management**: Don't run more than 3-5 concurrent swarms
5. **Regular Breaks**: Consider running Auto Mode in cycles rather than continuously

## 🚨 Troubleshooting

### Swarms Not Starting
- Check GitHub CLI is authenticated: `gh auth status`
- Ensure Claude Flow is installed: `npx claude-flow@alpha --version`
- Check for rate limits: `gh api rate_limit`

### Swarms Failing
- Check logs in `.swarm/logs/`
- Ensure tests pass: `npm test`
- Verify build works: `npm run build`

### Too Many Swarms
- Reduce max concurrent: `--max-concurrent 2`
- Increase check interval: `--interval 120000`

## 🎯 Examples

### Example 1: Work Through Backlog
```bash
# Process all bugs first, then features
npm run swarm:auto
```

### Example 2: Overnight Processing
```bash
# Run overnight as daemon
npm run swarm:auto:daemon
# Check in the morning
npm run swarm:status
```

### Example 3: Quick Issue Fix
```bash
# Process just one issue
node ./scripts/swarm-auto.js --once
```

## 🔗 Integration with CI/CD

Auto Mode integrates with your GitHub Actions:
- Triggers PR review workflows
- Runs tests automatically
- Updates issue labels
- Tracks progress in issue comments

## 📝 Logs

All swarm activity is logged to:
- `.swarm/logs/` - Individual swarm logs
- `.swarm/auto-state.json` - Current state
- Console output - Real-time monitoring

---

**Remember**: Auto Mode is powerful but should be monitored. Always review PRs before merging!