import { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import { Agent, AppState } from './types/agent';
import { LevelUpNotification, NotificationContainer } from './components/LevelUpNotification';
import { useQuestProgression } from './hooks/useLevelProgression';
import { LevelUpEvent } from './utils/levelProgression';
import { Quest } from './types/quest';
import { useOptimizedAgents } from './hooks/useOptimizedAgents';
import { usePerformanceMonitor } from '../performance/monitoring/performance-monitor';
import { OptimizedAgentCard, OptimizedXPBar, LazyAgentSheet, LazyQuestBoard, LoadingSpinner, ErrorBoundary } from '../performance/optimization/react-optimizations';

// Memoized tab component
const TabButton = memo(({ 
  tab, 
  isActive, 
  onClick 
}: { 
  tab: { id: string; label: string; icon: string }; 
  isActive: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`}
  >
    {tab.label}
  </button>
));

// Memoized guild hall stats
const GuildStats = memo(({ agents }: { agents: Agent[] }) => {
  const stats = useMemo(() => ({
    totalAgents: agents.length,
    totalLevels: agents.reduce((sum, agent) => sum + agent.level, 0),
    totalMemories: agents.reduce((sum, agent) => sum + agent.knowledgeBase.totalMemories, 0)
  }), [agents]);

  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-3xl font-bold text-cyan-400">{stats.totalAgents}</div>
        <div className="text-sm text-slate-400">Active Agents</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-purple-400">{stats.totalLevels}</div>
        <div className="text-sm text-slate-400">Total Levels</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-green-400">{stats.totalMemories}</div>
        <div className="text-sm text-slate-400">Knowledge Items</div>
      </div>
    </div>
  );
});

// Memoized real-time activity feed
const ActivityFeed = memo(({ agents }: { agents: Agent[] }) => {
  const activities = useMemo(() => 
    agents.flatMap(agent => 
      agent.realtimeActivity.map((activity, idx) => ({
        key: `${agent.id}-${idx}`,
        agent,
        activity
      }))
    ).slice(0, 20), // Limit to prevent excessive rendering
    [agents]
  );

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {activities.map(({ key, agent, activity }) => (
        <div key={key} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded">
          <span>{agent.avatar}</span>
          <div className="flex-1">
            <div className="text-sm">
              <span className="text-purple-300">{agent.name}</span> {activity.action}
            </div>
            <div className="text-xs text-slate-400">{activity.timestamp}</div>
          </div>
          {activity.xpGained && (
            <div className="text-xs text-green-400">+{activity.xpGained} XP</div>
          )}
        </div>
      ))}
    </div>
  );
});

export default function AppOptimized() {
  const [appState, setAppState] = useState<AppState>({
    activeTab: 'guild',
    selectedAgent: null,
    expandedSkillTrees: {},
    knowledgeConnected: true,
    realtimeUpdates: []
  });

  const [currentLevelUpEvent, setCurrentLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelingAgents, setLevelingAgents] = useState<Set<number>>(new Set());

  // Use optimized agents hook
  const {
    agents,
    filteredAgents,
    selectAgent,
    batchUpdateAgents,
    renderMetrics
  } = useOptimizedAgents();

  // Performance monitoring
  const perfMonitor = usePerformanceMonitor();

  // Initialize level progression system
  const progression = useQuestProgression();

  // Optimized tab definitions
  const tabs = useMemo(() => [
    { id: 'guild', label: '🏰 Guild Hall', icon: '🏰' },
    { id: 'knowledge', label: '📚 Knowledge Network', icon: '📚' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
    { id: 'quests', label: '⚔️ Quest Board', icon: '⚔️' }
  ], []);

  // Optimized quest handlers
  const handleQuestAssign = useCallback((questId: string, agentIds: number[]) => {
    console.log(`Assigning quest ${questId} to agents:`, agentIds);
    
    const updates = agentIds.map(id => ({
      id,
      updates: { currentMission: `Quest: ${questId}` } as Partial<Agent>
    }));
    
    batchUpdateAgents(updates);
  }, [batchUpdateAgents]);

  const handleQuestStart = useCallback((questId: string) => {
    console.log(`Starting quest ${questId}`);
  }, []);

  const handleQuestComplete = useCallback(async (questId: string) => {
    console.log(`Completing quest ${questId}`);
    
    const mockQuest: Quest = {
      id: questId,
      title: `Quest ${questId}`,
      description: `Complete quest ${questId}`,
      type: 'side',
      category: 'Investigation',
      difficulty: 'Medium',
      status: 'active',
      icon: '⚔️',
      objectives: [{
        id: '1',
        description: 'Complete the main objective',
        completed: true,
        progress: 1,
        maxProgress: 1
      }],
      currentObjectiveIndex: 0,
      progressPercentage: 100,
      requirements: {},
      rewards: { xp: 150 },
      assignedAgents: agents.slice(0, 2).map(a => a.id),
      recommendedTeamSize: 2,
      autoAssign: false,
      dialogue: [],
      createdAt: new Date(),
      repeatable: false
    };

    try {
      const updatedAgents = await progression.completeQuestWithTracking(
        questId,
        mockQuest,
        agents.filter(a => mockQuest.assignedAgents.includes(a.id)),
        {
          completionTime: 45,
          optionalObjectivesCompleted: 1,
          teamPerformanceBonus: 1.2
        }
      );

      // Use batch update for performance
      const agentUpdates = updatedAgents.map(updatedAgent => ({
        id: updatedAgent.id,
        updates: updatedAgent as Partial<Agent>
      }));
      
      batchUpdateAgents(agentUpdates);

    } catch (error) {
      console.error('Error completing quest:', error);
    }
  }, [agents, progression, batchUpdateAgents]);

  // Optimized XP bar renderer with memoization
  const renderXPBar = useCallback((current: number, toNext: number, level: number, agent?: Agent) => {
    const isLevelingUp = agent && levelingAgents.has(agent.id);
    return (
      <OptimizedXPBar 
        current={current}
        toNext={toNext}
        level={level}
        isLeveling={isLevelingUp}
      />
    );
  }, [levelingAgents]);

  // Optimized agent selection
  const handleAgentSelect = useCallback((agent: Agent) => {
    selectAgent(agent);
    setAppState(prev => ({ ...prev, selectedAgent: agent }));
  }, [selectAgent]);

  // Tab change handler
  const handleTabChange = useCallback((tabId: string) => {
    setAppState(prev => ({ ...prev, activeTab: tabId as AppState['activeTab'] }));
  }, []);

  // Memoized guild hall content
  const guildHallContent = useMemo(() => (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          🏰 Agent Company Guild Hall
        </h2>
        <GuildStats agents={agents} />
      </div>
      
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">⚔️ Agent Roster</h3>
        <div className="grid gap-4">
          {filteredAgents.map(agent => (
            <OptimizedAgentCard
              key={agent.id}
              agent={agent}
              isLeveling={levelingAgents.has(agent.id)}
              onSelect={handleAgentSelect}
              renderXPBar={renderXPBar}
            />
          ))}
        </div>
      </div>
      
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">📊 Real-time Knowledge Feed</h3>
        <ActivityFeed agents={agents} />
      </div>
    </div>
  ), [agents, filteredAgents, levelingAgents, handleAgentSelect, renderXPBar]);

  // Placeholder renderer
  const renderPlaceholder = useCallback((title: string, description: string) => (
    <div className="glass-panel p-12 text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-slate-400 mb-6">{description}</p>
      <div className="text-6xl mb-4">🚧</div>
      <p className="text-sm text-slate-500">Coming soon in the next sprint...</p>
    </div>
  ), []);

  // Set up level progression event handlers
  useEffect(() => {
    const measureStart = performance.now();
    
    progression.onLevelUp((event: LevelUpEvent) => {
      setLevelingAgents(prev => new Set(prev).add(event.agentId));
      setCurrentLevelUpEvent(event);
      setShowLevelUpModal(true);
      
      setTimeout(() => {
        setLevelingAgents(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.agentId);
          return newSet;
        });
      }, 2000);
    });

    progression.onXpGain((event) => {
      console.log('XP gained:', event);
      if (event.agentId) {
        setLevelingAgents(prev => new Set(prev).add(event.agentId));
        setTimeout(() => {
          setLevelingAgents(prev => {
            const newSet = new Set(prev);
            newSet.delete(event.agentId);
            return newSet;
          });
        }, 500);
      }
    });

    progression.onSkillUnlock((event) => {
      console.log('Skill unlocked:', event);
    });

    perfMonitor.measureRender('App useEffect setup', measureStart);
  }, [progression, perfMonitor]);

  // Performance monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      const report = perfMonitor.getReport();
      if (report.warnings.length > 0) {
        console.warn('Performance budget violations:', report.warnings);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [perfMonitor]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Agent Company RPG
            </h1>
            <p className="text-slate-400">Revolutionary AI Agent Management Platform</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-green-400 mt-2">
                Render Count: {renderMetrics.rerenderCount} | Last Render: {renderMetrics.lastRenderTime.toFixed(2)}ms
              </div>
            )}
          </div>
          
          {/* Optimized tab navigation */}
          <div className="flex space-x-1 mb-6">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={appState.activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
              />
            ))}
          </div>
          
          <div className="space-y-6">
            {appState.activeTab === 'guild' && guildHallContent}
            {appState.activeTab === 'knowledge' && renderPlaceholder(
              '📚 Knowledge Network', 
              'Visualize the interconnected learning network between your agents'
            )}
            {appState.activeTab === 'analytics' && renderPlaceholder(
              '📊 Analytics Dashboard', 
              'Deep insights into agent performance, learning patterns, and optimization opportunities'
            )}
            {appState.activeTab === 'quests' && (
              <Suspense fallback={<LoadingSpinner />}>
                <LazyQuestBoard
                  agents={agents}
                  onQuestAssign={handleQuestAssign}
                  onQuestStart={handleQuestStart}
                  onQuestComplete={handleQuestComplete}
                />
              </Suspense>
            )}
          </div>
          
          {/* Lazy-loaded Agent Detail Sheet Modal */}
          {appState.selectedAgent && (
            <Suspense fallback={<LoadingSpinner />}>
              <LazyAgentSheet 
                agent={appState.selectedAgent} 
                onClose={() => {
                  selectAgent(null);
                  setAppState(prev => ({ ...prev, selectedAgent: null }));
                }}
              />
            </Suspense>
          )}
          
          {/* Level progression integration */}
          <NotificationContainer 
            notifications={progression.activeNotifications}
            onDismiss={progression.dismissNotification}
          />

          {/* Level up modal */}
          {currentLevelUpEvent && showLevelUpModal && (
            <LevelUpNotification
              agent={agents.find(a => a.id === currentLevelUpEvent.agentId)!}
              levelUpEvent={currentLevelUpEvent}
              onClose={() => {
                setShowLevelUpModal(false);
                setCurrentLevelUpEvent(null);
              }}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}