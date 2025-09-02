#!/bin/bash

REPO="yogi-bear-92/agent-company-rpg"

# BUILD Sprint 1: Foundation
gh issue create --repo $REPO \
  --title "[BUILD] Sprint 1: Foundation - Guild Hall Dashboard & Core RPG" \
  --body "## 🏗️ BUILD Phase - Sprint 1 (Week 1-2)

### Main Objectives
- [ ] Guild Hall Dashboard - Main agent roster overview
- [ ] Basic Agent Character Sheets (Level, XP, Class, Stats)
- [ ] Simple Quest Board with 3 mission types
- [ ] Claude Code integration interface for agent dispatch
- [ ] Basic XP/leveling system

### Subtasks
- [ ] Set up React project structure with TypeScript
- [ ] Create main dashboard layout component
- [ ] Implement agent data models and interfaces
- [ ] Design character sheet UI components
- [ ] Build quest board with mission types
- [ ] Integrate Claude Code API endpoints
- [ ] Implement XP calculation logic
- [ ] Add level progression system
- [ ] Create agent roster display
- [ ] Add basic state management

### Acceptance Criteria
- Dashboard displays all 4 agents
- Character sheets show stats and XP
- Quest board shows available missions
- XP updates when tasks complete
- Claude Code integration works

### Technical Requirements
- React 18+ with TypeScript
- State management (Redux/Zustand)
- Responsive design
- API integration ready" \
  --milestone 1 \
  --label "priority:critical,component:frontend,type:enhancement"

# BUILD Sprint 2: RPG Mechanics
gh issue create --repo $REPO \
  --title "[BUILD] Sprint 2: RPG Mechanics - Skills, Equipment & Relationships" \
  --body "## 🎮 BUILD Phase - Sprint 2 (Week 3-4)

### Main Objectives
- [ ] Character classes and skill trees
- [ ] Equipment/tool system for agents
- [ ] Agent relationship mapping
- [ ] Mentorship system implementation
- [ ] Achievement/badge system

### Subtasks
- [ ] Design skill tree data structure
- [ ] Create skill tree UI components
- [ ] Implement equipment system
- [ ] Build inventory management
- [ ] Create relationship graph visualization
- [ ] Implement mentorship mechanics
- [ ] Design achievement tracking system
- [ ] Create badge display components
- [ ] Add skill progression logic
- [ ] Implement equipment effects on stats

### Acceptance Criteria
- Each agent has visible skill tree
- Equipment affects agent capabilities
- Relationships shown between agents
- Mentorship increases learning speed
- Achievements unlock and display

### Technical Requirements
- Graph visualization library
- Achievement persistence
- Skill tree state management
- Equipment effect calculations" \
  --milestone 1 \
  --label "priority:high,component:frontend,feature:rpg-mechanics"

# BUILD Sprint 3: Advanced Features
gh issue create --repo $REPO \
  --title "[BUILD] Sprint 3: Advanced Features - Analytics & Optimization" \
  --body "## 📊 BUILD Phase - Sprint 3 (Week 5-6)

### Main Objectives
- [ ] Team composition optimizer
- [ ] Advanced analytics and performance tracking
- [ ] Agent personality development system
- [ ] Cross-agent evaluation pipeline
- [ ] Mission difficulty scaling

### Subtasks
- [ ] Build team composition algorithm
- [ ] Create analytics dashboard
- [ ] Implement performance metrics collection
- [ ] Design personality trait system
- [ ] Build evaluation scoring system
- [ ] Create difficulty scaling algorithm
- [ ] Add performance charts and graphs
- [ ] Implement agent comparison tools
- [ ] Create mission success predictors
- [ ] Build optimization recommendations

### Acceptance Criteria
- Team optimizer suggests best compositions
- Analytics show detailed performance metrics
- Personalities affect agent behavior
- Agents can evaluate each other
- Missions scale with team level

### Technical Requirements
- Chart.js or D3 for visualizations
- Analytics data pipeline
- Machine learning for predictions
- Performance optimization algorithms" \
  --milestone 1 \
  --label "priority:medium,component:frontend,type:enhancement"

# Archon Knowledge Integration
gh issue create --repo $REPO \
  --title "[BUILD] Archon Integration: Knowledge System & Crawling" \
  --body "## 🧠 BUILD Phase - Archon Knowledge Integration

### Main Objectives
- [ ] Supabase + pgvector setup for agent memories
- [ ] MCP-Crawl4AI integration for documentation learning
- [ ] WebSocket real-time knowledge sync
- [ ] Contextual embeddings system

### Subtasks
- [ ] Configure Supabase project with pgvector
- [ ] Design agent knowledge schema
- [ ] Implement vector similarity search
- [ ] Set up MCP-Crawl4AI server
- [ ] Create smart crawling with sitemap detection
- [ ] Implement contextual chunking strategies
- [ ] Build knowledge ingestion pipeline
- [ ] Add WebSocket server for real-time sync
- [ ] Create knowledge broadcasting system
- [ ] Implement conflict resolution

### Acceptance Criteria
- Agents store and retrieve memories
- Documentation crawling works
- Real-time sync between agents
- Vector search returns relevant knowledge
- Knowledge affects agent decisions

### Technical Requirements
- Supabase with pgvector extension
- Socket.IO for real-time
- OpenAI embeddings API
- Redis for caching" \
  --milestone 1 \
  --label "priority:high,feature:knowledge-system,component:backend"

# DAA Integration
gh issue create --repo $REPO \
  --title "[BUILD] DAA Integration: Autonomous Agents & Token Economy" \
  --body "## 🤖 BUILD Phase - DAA Autonomous Agent Integration

### Main Objectives
- [ ] Convert agents to real DAA entities
- [ ] Implement MRARA autonomy loops
- [ ] Add rUv token integration
- [ ] Enable quantum-resistant P2P communication
- [ ] Prime ML distributed training setup

### Subtasks
- [ ] Set up Rust development environment
- [ ] Implement basic DAA orchestrator
- [ ] Create CodeMaster as first DAA
- [ ] Integrate MRARA loop (Monitor-Reason-Act-Reflect-Adapt)
- [ ] Build token reward system
- [ ] Implement Prime ML framework
- [ ] Set up federated learning infrastructure
- [ ] Add Byzantine fault tolerance
- [ ] Implement QuDAG protocol
- [ ] Create P2P network setup

### Acceptance Criteria
- Agents operate autonomously
- MRARA loops function correctly
- Tokens earned for achievements
- P2P communication secure
- Distributed learning works

### Technical Requirements
- Rust with DAA SDK
- Smart contract deployment
- LibP2P networking
- Prime ML framework
- Quantum-resistant cryptography" \
  --milestone 1 \
  --label "priority:critical,feature:daa-integration,type:enhancement"

echo "✅ BUILD phase issues created!"
