# 🎮 Agent Company RPG - Project Development Rules & Commands

## 🚨 CRITICAL: Development Workflow Rules

### 1. GitHub Issue-Driven Development
**ALWAYS use GitHub issues to coordinate work:**
- Every feature/task MUST have a corresponding GitHub issue
- Issues trigger automated swarm workflows
- Use labels to categorize and prioritize work
- Reference issue numbers in all commits

### 2. Swarm Coordination Protocol
**When working on features:**
1. Create GitHub issue with `@CLAUDE.md` mention to trigger swarm
2. Use Claude Code's Task tool to spawn specialized agents
3. Coordinate through MCP tools for topology setup
4. Let agents work in parallel with proper hooks

### 3. File Organization Rules
**NEVER save files to root directory:**
- `/src` - All source code
- `/src/components` - React components
- `/src/utils` - Utility functions
- `/src/types` - TypeScript type definitions
- `/src/data` - Mock data and constants
- `/src/hooks` - Custom React hooks
- `/tests` - Test files
- `/docs` - Documentation
- `/scripts` - Build and utility scripts

## 📋 Command Reference

### GitHub Integration Commands

```bash
# List all issues
gh issue list --repo yogi-bear-92/agent-company-rpg

# Create new issue (triggers swarm)
gh issue create --repo yogi-bear-92/agent-company-rpg \
  --title "Feature Title" \
  --body "Description with @CLAUDE.md mention" \
  --label "enhancement" \
  --label "feature:rpg-mechanics"

# View issue details
gh issue view <number> --repo yogi-bear-92/agent-company-rpg

# Close issue
gh issue close <number> --repo yogi-bear-92/agent-company-rpg

# List pull requests
gh pr list --repo yogi-bear-92/agent-company-rpg

# Create pull request
gh pr create --repo yogi-bear-92/agent-company-rpg \
  --title "PR Title" \
  --body "Description" \
  --base main
```

### Swarm Coordination Commands

```bash
# Initialize swarm with topology
npx claude-flow@alpha swarm init --topology mesh --max-agents 8

# Spawn specialized agents
npx claude-flow@alpha agent spawn --type researcher --name "Research Agent"
npx claude-flow@alpha agent spawn --type coder --name "Implementation Agent"
npx claude-flow@alpha agent spawn --type tester --name "Testing Agent"

# Orchestrate tasks
npx claude-flow@alpha task orchestrate --task "Build feature" --strategy parallel

# Monitor swarm status
npx claude-flow@alpha swarm status
npx claude-flow@alpha swarm monitor --interval 1000

# Session management
npx claude-flow@alpha hooks session-start --session-id "rpg-session-$(date +%s)"
npx claude-flow@alpha hooks session-end --export-metrics true
```

### SPARC Development Commands

```bash
# Run SPARC modes
npx claude-flow sparc run spec-pseudocode "Feature description"
npx claude-flow sparc run architect "System design task"
npx claude-flow sparc run refine "Implementation task"
npx claude-flow sparc tdd "Feature name"

# Batch operations
npx claude-flow sparc batch "spec-pseudocode,architect" "Task description"
npx claude-flow sparc pipeline "Complete feature"

# View SPARC info
npx claude-flow sparc modes
npx claude-flow sparc info <mode>
```

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck

# Preview production build
npm run preview
```

### Git Workflow Commands

```bash
# Create feature branch
git checkout -b feature/feature-name

# Stage changes
git add .

# Commit with conventional format
git commit -m "feat: add level progression system

- Implement XP calculations
- Add level up notifications
- Create skill unlock system

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push -u origin feature/feature-name

# Sync with main
git pull origin main --rebase
```

### MCP Tool Commands (via Claude Code)

```javascript
// Initialize swarm topology
mcp__claude-flow__swarm_init({ topology: "mesh", maxAgents: 8 })

// Spawn agents for coordination
mcp__claude-flow__agent_spawn({ type: "researcher" })
mcp__claude-flow__agent_spawn({ type: "coder" })

// Orchestrate tasks
mcp__claude-flow__task_orchestrate({ 
  task: "Implement feature",
  strategy: "parallel",
  priority: "high"
})

// Monitor performance
mcp__claude-flow__swarm_status()
mcp__claude-flow__agent_metrics()

// Memory operations
mcp__claude-flow__memory_usage({ 
  action: "store",
  key: "feature-context",
  value: "data"
})
```

## 🔄 Development Workflow

### Standard Feature Implementation Flow

1. **Create GitHub Issue**
   ```bash
   gh issue create --repo yogi-bear-92/agent-company-rpg \
     --title "🎮 Feature: [Name]" \
     --body "## Task\n[Description]\n\n@CLAUDE.md activate swarm" \
     --label "enhancement"
   ```

2. **Swarm Initialization**
   ```bash
   npx claude-flow@alpha swarm init --topology mesh
   npx claude-flow@alpha hooks session-start --session-id "feature-$(date +%s)"
   ```

3. **Parallel Agent Execution** (via Claude Code Task tool)
   ```javascript
   Task("Research", "Analyze requirements", "researcher")
   Task("Design", "Create architecture", "architect")
   Task("Implement", "Build feature", "coder")
   Task("Test", "Write tests", "tester")
   ```

4. **Development & Testing**
   ```bash
   npm run dev        # Start dev server
   npm run test       # Run tests
   npm run typecheck  # Check types
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: implement feature #<issue-number>"
   git push
   ```

6. **Create Pull Request**
   ```bash
   gh pr create --repo yogi-bear-92/agent-company-rpg \
     --title "Feature: [Name]" \
     --body "Closes #<issue-number>"
   ```

## 🏷️ GitHub Label Categories

### Priority Labels
- `priority:critical` - Blocking issues
- `priority:high` - Important features
- `priority:medium` - Standard enhancements
- `priority:low` - Nice to have

### Feature Labels
- `feature:rpg-mechanics` - Game mechanics
- `feature:knowledge-system` - AI learning
- `feature:daa-integration` - Autonomous agents
- `feature:token-economy` - Token system

### Type Labels
- `type:bug` - Bug fixes
- `type:enhancement` - New features
- `type:documentation` - Docs updates
- `type:performance` - Optimizations

### Component Labels
- `component:frontend` - React UI
- `component:backend` - API services
- `component:infrastructure` - DevOps
- `component:smart-contracts` - Blockchain

### Status Labels
- `in-progress` - Active work
- `needs-review` - Review required
- `needs-triage` - Needs prioritization

## 🎯 Best Practices

### Code Quality
1. Always run `npm run typecheck` before committing
2. Ensure `npm run build` succeeds
3. Write tests for new features
4. Follow existing code patterns

### Swarm Coordination
1. Use parallel execution for independent tasks
2. Store context in memory for agent coordination
3. Monitor swarm performance with metrics
4. Export session data for analysis

### GitHub Integration
1. Reference issue numbers in commits
2. Use descriptive PR titles
3. Link PRs to issues with "Closes #X"
4. Apply appropriate labels

### Performance
1. Batch operations when possible
2. Use concurrent tool calls
3. Optimize component re-renders
4. Implement proper memoization

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/yogi-bear-92/agent-company-rpg.git
cd agent-company-rpg
npm install

# Start development
npm run dev

# Create new feature
gh issue create --repo yogi-bear-92/agent-company-rpg \
  --title "Feature: [Name]" \
  --body "@CLAUDE.md implement this feature"

# Activate swarm
npx claude-flow@alpha swarm init --topology mesh
```

## 📊 Monitoring & Debugging

```bash
# View swarm status
npx claude-flow@alpha swarm status

# Check agent metrics
npx claude-flow@alpha agent metrics

# Export performance data
npx claude-flow@alpha hooks session-end --export-metrics true

# View memory usage
npx claude-flow@alpha memory usage

# Check GitHub webhook logs
gh api repos/yogi-bear-92/agent-company-rpg/hooks
```

## 🔗 Important Links

- **Repository**: https://github.com/yogi-bear-92/agent-company-rpg
- **Issues**: https://github.com/yogi-bear-92/agent-company-rpg/issues
- **Pull Requests**: https://github.com/yogi-bear-92/agent-company-rpg/pulls
- **Claude Flow Docs**: https://github.com/ruvnet/claude-flow

---

**Remember**: Always use GitHub issues to coordinate work and trigger swarm automation!