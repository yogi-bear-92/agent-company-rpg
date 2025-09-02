#!/bin/bash

REPO="yogi-bear-92/agent-company-rpg"

# BUILD Issues
echo "Creating BUILD issues..."

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
- [ ] Implement equipment effects on stats" \
  --label "priority:high,component:frontend,feature:rpg-mechanics"

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
- [ ] Implement conflict resolution" \
  --label "priority:high,feature:knowledge-system,component:backend"

# MEASURE Issues
echo "Creating MEASURE issues..."

gh issue create --repo $REPO \
  --title "[MEASURE] Implement KPI Tracking System" \
  --body "## 📊 MEASURE Phase - KPI Implementation

### Main Objectives
- [ ] Agent learning velocity tracking
- [ ] Knowledge acquisition rate metrics
- [ ] Task completion success rates
- [ ] Cross-evaluation accuracy scores
- [ ] System performance monitoring

### Subtasks
- [ ] Create metrics collection service
- [ ] Implement performance dashboards
- [ ] Add real-time metric streaming
- [ ] Build analytics data pipeline
- [ ] Create metric aggregation logic
- [ ] Implement alerting thresholds
- [ ] Add historical data storage
- [ ] Create metric visualization components" \
  --label "priority:high,type:enhancement"

gh issue create --repo $REPO \
  --title "[MEASURE] Analytics Dashboard Development" \
  --body "## 📈 MEASURE Phase - Analytics Dashboard

### Main Objectives
- [ ] Real-time performance monitoring
- [ ] Agent comparison tools
- [ ] Knowledge network visualization
- [ ] Quest success rate tracking
- [ ] Resource utilization metrics

### Subtasks
- [ ] Design dashboard layout
- [ ] Implement Chart.js visualizations
- [ ] Create data refresh mechanisms
- [ ] Build filter and search functionality
- [ ] Add export capabilities
- [ ] Implement drill-down views
- [ ] Create custom report builder" \
  --label "priority:medium,component:frontend"

# ANALYZE Issues
echo "Creating ANALYZE issues..."

gh issue create --repo $REPO \
  --title "[ANALYZE] Performance Optimization Analysis" \
  --body "## 🔍 ANALYZE Phase - Performance Analysis

### Main Objectives
- [ ] Identify system bottlenecks
- [ ] Analyze agent learning patterns
- [ ] Evaluate knowledge sharing efficiency
- [ ] Assess quest difficulty balance
- [ ] Review resource allocation

### Subtasks
- [ ] Implement performance profiling
- [ ] Create pattern recognition algorithms
- [ ] Build efficiency scoring system
- [ ] Analyze user engagement metrics
- [ ] Review code optimization opportunities
- [ ] Identify scaling limitations" \
  --label "priority:medium,type:performance"

gh issue create --repo $REPO \
  --title "[ANALYZE] Agent Behavior Pattern Analysis" \
  --body "## 🧠 ANALYZE Phase - Behavior Patterns

### Main Objectives
- [ ] Identify successful agent strategies
- [ ] Analyze collaboration patterns
- [ ] Detect emergent behaviors
- [ ] Evaluate learning effectiveness
- [ ] Assess relationship impacts

### Subtasks
- [ ] Implement behavior tracking
- [ ] Create pattern detection algorithms
- [ ] Build strategy effectiveness metrics
- [ ] Analyze interaction graphs
- [ ] Generate insight reports" \
  --label "priority:low,feature:ml-training"

# DECIDE Issues
echo "Creating DECIDE issues..."

gh issue create --repo $REPO \
  --title "[DECIDE] Strategic Planning & Roadmap" \
  --body "## 🎯 DECIDE Phase - Strategic Planning

### Main Objectives
- [ ] Feature prioritization framework
- [ ] Resource allocation decisions
- [ ] Technology stack evaluation
- [ ] Scaling strategy definition
- [ ] Market positioning planning

### Subtasks
- [ ] Create decision matrix
- [ ] Implement A/B testing framework
- [ ] Build ROI calculators
- [ ] Design feedback collection system
- [ ] Create roadmap visualization
- [ ] Implement decision tracking" \
  --label "priority:medium"

gh issue create --repo $REPO \
  --title "[DECIDE] Implementation Priorities & Next Steps" \
  --body "## 🚀 DECIDE Phase - Implementation Planning

### Main Objectives
- [ ] Sprint planning automation
- [ ] Feature flag management
- [ ] Release planning system
- [ ] Risk assessment framework
- [ ] Success criteria definition

### Subtasks
- [ ] Create priority scoring system
- [ ] Build release calendar
- [ ] Implement feature toggles
- [ ] Design risk matrix
- [ ] Create success metrics dashboard" \
  --label "priority:low,type:documentation"

echo "✅ All BMAD issues created!"
