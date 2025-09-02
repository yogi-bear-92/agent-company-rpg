import { useState, useEffect } from 'react';
import { Agent, AppState } from './types/agent';
import { initialAgents } from './data/agents';
import AgentSheet from './components/AgentSheet';
import QuestBoard from './components/QuestBoard';
import { LevelUpNotification, NotificationContainer } from './components/LevelUpNotification';
import { useQuestProgression } from './hooks/useLevelProgression';
import { LevelUpEvent } from './utils/levelProgression';
import { Quest } from './types/quest';

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    activeTab: 'guild',
    selectedAgent: null,
    expandedSkillTrees: {},
    knowledgeConnected: true,
    realtimeUpdates: []
  });

  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [currentLevelUpEvent, setCurrentLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelingAgents, setLevelingAgents] = useState<Set<number>>(new Set());

  // Initialize level progression system
  const progression = useQuestProgression();

  const handleQuestAssign = (questId: string, agentIds: number[]) => {
    console.log(`Assigning quest ${questId} to agents:`, agentIds);
    // Update agents with quest assignment
    setAgents(prev => prev.map(agent => 
      agentIds.includes(agent.id)
        ? { ...agent, currentMission: `Quest: ${questId}` }
        : agent
    ));
  };

  const handleQuestStart = (questId: string) => {
    console.log(`Starting quest ${questId}`);
    // Could trigger Claude Flow swarm here
  };

  const handleQuestComplete = async (questId: string) => {
    console.log(`Completing quest ${questId}`);
    
    // Find the quest from data (you would typically have quest data available)
    // For demo purposes, creating a mock quest
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
      assignedAgents: agents.slice(0, 2).map(a => a.id), // Assign to first 2 agents
      recommendedTeamSize: 2,
      autoAssign: false,
      dialogue: [],
      createdAt: new Date(),
      repeatable: false
    };

    try {
      // Complete quest with level progression
      const updatedAgents = await progression.completeQuestWithTracking(
        questId,
        mockQuest,
        agents.filter(a => mockQuest.assignedAgents.includes(a.id)),
        {
          completionTime: 45, // 45 minutes
          optionalObjectivesCompleted: 1,
          teamPerformanceBonus: 1.2
        }
      );

      // Update agent state with new progression
      setAgents(prev => prev.map(agent => {
        const updated = updatedAgents.find(a => a.id === agent.id);
        return updated || agent;
      }));

    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const renderXPBar = (current: number, toNext: number, level: number, agent?: Agent) => {
    const percentage = (current / toNext) * 100;
    const isLevelingUp = agent && levelingAgents.has(agent.id);
    
    return (
      <div className="xp-bar relative">
        <div 
          className={`xp-progress ${isLevelingUp ? 'xp-multi-level' : ''}`}
          style={{ 
            width: `${percentage}%`,
            '--xp-percentage': `${percentage}%`,
            '--xp-start': '0%',
            '--xp-final': `${percentage}%`,
            animation: isLevelingUp ? 'xpBarMultiLevel 2s ease-out' : undefined,
            transition: !isLevelingUp ? 'width 0.5s ease-out' : undefined
          } as React.CSSProperties}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          Level {level} • {current}/{toNext} XP
        </div>
      </div>
    );
  };

  const renderAgentCard = (agent: Agent) => (
    <div 
      key={agent.id} 
      data-agent-id={agent.id}
      className="agent-card p-4 space-y-3 transition-all duration-300"
      onClick={() => setAppState(prev => ({ ...prev, selectedAgent: agent }))}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{agent.avatar}</span>
          <div>
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-purple-300">{agent.class}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Level {agent.level}</div>
          <div className="text-xs text-green-400">{agent.currentMission}</div>
        </div>
      </div>
      
      <div className="relative">
        {renderXPBar(agent.xp, agent.xpToNext, agent.level, agent)}
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-xs">
        <div className="text-center">
          <div className="text-blue-400 font-semibold">{agent.stats.intelligence}</div>
          <div className="text-slate-400">INT</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400 font-semibold">{agent.stats.creativity}</div>
          <div className="text-slate-400">CRE</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-semibold">{agent.stats.reliability}</div>
          <div className="text-slate-400">REL</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-semibold">{agent.stats.speed}</div>
          <div className="text-slate-400">SPD</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-semibold">{agent.stats.leadership}</div>
          <div className="text-slate-400">LEA</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {agent.specializations.slice(0, 3).map((spec, idx) => (
          <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded">
            {spec}
          </span>
        ))}
        {agent.specializations.length > 3 && (
          <span className="text-xs text-slate-400">+{agent.specializations.length - 3} more</span>
        )}
      </div>
      
      <div className="border-t border-slate-600 pt-2">
        <div className="text-xs text-slate-400 mb-1">Recent Activity:</div>
        <div className="text-xs text-cyan-300">
          {agent.realtimeActivity[0]?.action || 'No recent activity'}
        </div>
      </div>
    </div>
  );

  const renderGuildHall = () => (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          🏰 Agent Company Guild Hall
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-cyan-400">{agents.length}</div>
            <div className="text-sm text-slate-400">Active Agents</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">
              {agents.reduce((sum, agent) => sum + agent.level, 0)}
            </div>
            <div className="text-sm text-slate-400">Total Levels</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">
              {agents.reduce((sum, agent) => sum + agent.knowledgeBase.totalMemories, 0)}
            </div>
            <div className="text-sm text-slate-400">Knowledge Items</div>
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">⚔️ Agent Roster</h3>
        <div className="grid gap-4">
          {agents.map(renderAgentCard)}
        </div>
      </div>
      
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">📊 Real-time Knowledge Feed</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {agents.flatMap(agent => 
            agent.realtimeActivity.map((activity, idx) => (
              <div key={`${agent.id}-${idx}`} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded">
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
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="flex space-x-1 mb-6">
      {[
        { id: 'guild', label: '🏰 Guild Hall', icon: '🏰' },
        { id: 'knowledge', label: '📚 Knowledge Network', icon: '📚' },
        { id: 'analytics', label: '📊 Analytics', icon: '📊' },
        { id: 'quests', label: '⚔️ Quest Board', icon: '⚔️' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setAppState(prev => ({ ...prev, activeTab: tab.id as AppState['activeTab'] }))}
          className={`px-4 py-2 rounded-lg transition-colors ${
            appState.activeTab === tab.id
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="glass-panel p-12 text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-slate-400 mb-6">{description}</p>
      <div className="text-6xl mb-4">🚧</div>
      <p className="text-sm text-slate-500">Coming soon in the next sprint...</p>
    </div>
  );

  // Set up level progression event handlers
  useEffect(() => {
    // Handle level up events
    progression.onLevelUp((event: LevelUpEvent) => {
      // Mark agent as leveling up for smooth animation
      setLevelingAgents(prev => new Set(prev).add(event.agentId));
      
      setCurrentLevelUpEvent(event);
      setShowLevelUpModal(true);
      
      // Remove leveling animation after 2 seconds
      setTimeout(() => {
        setLevelingAgents(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.agentId);
          return newSet;
        });
      }, 2000);
    });

    // Handle XP gain events for visual feedback
    progression.onXpGain((event) => {
      console.log('XP gained:', event);
      // Briefly highlight the agent when gaining XP
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

    // Handle skill unlock events
    progression.onSkillUnlock((event) => {
      console.log('Skill unlocked:', event);
    });
  }, [progression]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Agent Company RPG
          </h1>
          <p className="text-slate-400">Revolutionary AI Agent Management Platform</p>
        </div>
        
        {renderTabs()}
        
        <div className="space-y-6">
          {appState.activeTab === 'guild' && renderGuildHall()}
          {appState.activeTab === 'knowledge' && renderPlaceholder(
            '📚 Knowledge Network', 
            'Visualize the interconnected learning network between your agents'
          )}
          {appState.activeTab === 'analytics' && renderPlaceholder(
            '📊 Analytics Dashboard', 
            'Deep insights into agent performance, learning patterns, and optimization opportunities'
          )}
          {appState.activeTab === 'quests' && (
            <QuestBoard
              agents={agents}
              onQuestAssign={handleQuestAssign}
              onQuestStart={handleQuestStart}
              onQuestComplete={handleQuestComplete}
            />
          )}
        </div>
        
        {/* Agent Detail Sheet Modal */}
        {appState.selectedAgent && (
          <AgentSheet 
            agent={appState.selectedAgent} 
            onClose={() => setAppState(prev => ({ ...prev, selectedAgent: null }))}
          />
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
  );
}