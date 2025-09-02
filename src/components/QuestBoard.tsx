import { useState, useMemo } from 'react';
import { Quest, QuestType, Difficulty, QuestStatus, QuestFilter, QuestSortOptions } from '../types/quest';
import { Agent } from '../types/agent';
import { initialQuests } from '../data/quests';

interface QuestBoardProps {
  agents: Agent[];
  onQuestAssign: (questId: string, agentIds: number[]) => void;
  onQuestStart: (questId: string) => void;
  onQuestComplete: (questId: string) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ agents, onQuestAssign, onQuestStart, onQuestComplete }) => {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [filter, setFilter] = useState<QuestFilter>({});
  const [sortOptions, setSortOptions] = useState<QuestSortOptions>({ by: 'difficulty', direction: 'asc' });
  const [showDetails, setShowDetails] = useState(false);

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let filtered = [...quests];

    // Apply filters
    if (filter.type?.length) {
      filtered = filtered.filter(q => filter.type!.includes(q.type));
    }
    if (filter.category?.length) {
      filtered = filtered.filter(q => filter.category!.includes(q.category));
    }
    if (filter.difficulty?.length) {
      filtered = filtered.filter(q => filter.difficulty!.includes(q.difficulty));
    }
    if (filter.status?.length) {
      filtered = filtered.filter(q => filter.status!.includes(q.status));
    }
    if (filter.hideCompleted) {
      filtered = filtered.filter(q => q.status !== 'completed');
    }
    if (filter.hideLocked) {
      filtered = filtered.filter(q => q.status !== 'locked');
    }
    if (filter.minRewardXp) {
      filtered = filtered.filter(q => q.rewards.xp >= filter.minRewardXp!);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortOptions.by) {
        case 'difficulty': {
          const diffOrder = ['Tutorial', 'Easy', 'Medium', 'Hard', 'Expert', 'Legendary'];
          comparison = diffOrder.indexOf(a.difficulty) - diffOrder.indexOf(b.difficulty);
          break;
        }
        case 'xp':
          comparison = a.rewards.xp - b.rewards.xp;
          break;
        case 'progress':
          comparison = a.progressPercentage - b.progressPercentage;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'newest':
          comparison = b.createdAt.getTime() - a.createdAt.getTime();
          break;
      }
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [quests, filter, sortOptions]);

  const getDifficultyColor = (difficulty: Difficulty) => {
    const colors = {
      'Tutorial': 'text-gray-400',
      'Easy': 'text-green-400',
      'Medium': 'text-yellow-400',
      'Hard': 'text-orange-400',
      'Expert': 'text-red-400',
      'Legendary': 'text-purple-400'
    };
    return colors[difficulty] || 'text-gray-400';
  };

  const getTypeColor = (type: QuestType) => {
    const colors = {
      'main': 'bg-blue-500/20 border-blue-400',
      'side': 'bg-green-500/20 border-green-400',
      'daily': 'bg-yellow-500/20 border-yellow-400',
      'epic': 'bg-purple-500/20 border-purple-400',
      'raid': 'bg-red-500/20 border-red-400'
    };
    return colors[type] || 'bg-gray-500/20 border-gray-400';
  };

  const getStatusIcon = (status: QuestStatus) => {
    const icons = {
      'available': '✓',
      'active': '⚡',
      'completed': '✓',
      'failed': '✗',
      'locked': '🔒'
    };
    return icons[status] || '?';
  };

  const canStartQuest = (quest: Quest) => {
    if (quest.status !== 'available') return false;
    if (selectedAgents.length === 0) return false;
    
    // Check requirements
    const req = quest.requirements;
    if (req.teamSize) {
      if (selectedAgents.length < req.teamSize.min || selectedAgents.length > req.teamSize.max) {
        return false;
      }
    }
    
    // Check agent levels
    if (req.minLevel) {
      const lowestLevel = Math.min(...selectedAgents.map(id => 
        agents.find(a => a.id === id)?.level || 0
      ));
      if (lowestLevel < req.minLevel) return false;
    }
    
    return true;
  };

  const handleAgentToggle = (agentId: number) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleQuestStart = () => {
    if (selectedQuest && canStartQuest(selectedQuest)) {
      onQuestAssign(selectedQuest.id, selectedAgents);
      onQuestStart(selectedQuest.id);
      setQuests(prev => prev.map(q => 
        q.id === selectedQuest.id 
          ? { ...q, status: 'active' as QuestStatus, assignedAgents: selectedAgents }
          : q
      ));
      setSelectedAgents([]);
      setShowDetails(false);
    }
  };

  const renderQuestCard = (quest: Quest) => (
    <div
      key={quest.id}
      className={`quest-card p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${getTypeColor(quest.type)} ${
        selectedQuest?.id === quest.id ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={() => {
        setSelectedQuest(quest);
        setShowDetails(true);
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{quest.icon}</span>
          <div>
            <h3 className="font-bold text-white">{quest.title}</h3>
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full bg-black/30 ${getDifficultyColor(quest.difficulty)}`}>
                {quest.difficulty}
              </span>
              <span className="px-2 py-1 rounded-full bg-black/30 text-gray-300">
                {quest.category}
              </span>
            </div>
          </div>
        </div>
        <span className="text-lg">{getStatusIcon(quest.status)}</span>
      </div>
      
      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{quest.description}</p>
      
      <div className="flex justify-between items-end">
        <div className="text-xs text-gray-400">
          <div>🎯 {quest.objectives.length} objectives</div>
          <div>👥 {quest.recommendedTeamSize} agents recommended</div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 font-bold">+{quest.rewards.xp} XP</div>
          {quest.rewards.gold && (
            <div className="text-yellow-300 text-xs">+{quest.rewards.gold} gold</div>
          )}
        </div>
      </div>
      
      {quest.status === 'active' && (
        <div className="mt-2">
          <div className="w-full bg-black/30 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
              style={{ width: `${quest.progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-center mt-1 text-gray-300">
            {quest.progressPercentage}% Complete
          </div>
        </div>
      )}
      
      {quest.timeLimit && quest.status === 'active' && (
        <div className="mt-2 text-xs text-orange-400 text-center">
          ⏱️ {quest.timeRemaining || quest.timeLimit} minutes remaining
        </div>
      )}
    </div>
  );

  return (
    <div className="quest-board p-6">
      {/* Header and Filters */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          Quest Board
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Type filters */}
          <div className="flex gap-2">
            {(['main', 'side', 'daily', 'epic', 'raid'] as QuestType[]).map(type => (
              <button
                key={type}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  filter.type?.includes(type)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                onClick={() => {
                  setFilter(prev => ({
                    ...prev,
                    type: prev.type?.includes(type)
                      ? prev.type.filter(t => t !== type)
                      : [...(prev.type || []), type]
                  }));
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Sort options */}
          <select
            className="px-3 py-1 rounded bg-white/10 text-white text-xs"
            value={sortOptions.by}
            onChange={(e) => setSortOptions(prev => ({ ...prev, by: e.target.value as QuestSortOptions['by'] }))}
          >
            <option value="difficulty">Sort by Difficulty</option>
            <option value="xp">Sort by XP</option>
            <option value="progress">Sort by Progress</option>
            <option value="type">Sort by Type</option>
            <option value="newest">Sort by Newest</option>
          </select>
          
          <button
            className="px-3 py-1 rounded bg-white/10 text-white text-xs hover:bg-white/20"
            onClick={() => setSortOptions(prev => ({ 
              ...prev, 
              direction: prev.direction === 'asc' ? 'desc' : 'asc' 
            }))}
          >
            {sortOptions.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredQuests.map(quest => renderQuestCard(quest))}
      </div>
      
      {/* Quest Details Modal */}
      {showDetails && selectedQuest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedQuest.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedQuest.title}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full bg-black/30 text-sm ${getDifficultyColor(selectedQuest.difficulty)}`}>
                      {selectedQuest.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-black/30 text-sm text-gray-300">
                      {selectedQuest.type} • {selectedQuest.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white text-2xl"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </button>
            </div>
            
            {selectedQuest.lore && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg italic text-gray-300">
                {selectedQuest.lore}
              </div>
            )}
            
            <p className="text-gray-300 mb-4">{selectedQuest.description}</p>
            
            {/* Objectives */}
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-white">Objectives</h3>
              <div className="space-y-2">
                {selectedQuest.objectives.map((obj, idx) => (
                  <div key={obj.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                      obj.completed ? 'bg-green-500 border-green-400' : 'border-gray-500'
                    }`}>
                      {obj.completed ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">
                        {obj.description}
                        {obj.optional && <span className="ml-2 text-xs text-blue-400">(Optional)</span>}
                      </div>
                      {obj.maxProgress > 1 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-black/30 rounded-full h-1">
                            <div 
                              className="h-1 bg-blue-400 rounded-full"
                              style={{ width: `${(obj.progress / obj.maxProgress) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {obj.progress}/{obj.maxProgress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Requirements */}
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-white">Requirements</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                {selectedQuest.requirements.minLevel && (
                  <div>📊 Min Level: {selectedQuest.requirements.minLevel}</div>
                )}
                {selectedQuest.requirements.teamSize && (
                  <div>👥 Team Size: {selectedQuest.requirements.teamSize.min}-{selectedQuest.requirements.teamSize.max}</div>
                )}
                {selectedQuest.requirements.requiredClass && (
                  <div>🎭 Classes: {selectedQuest.requirements.requiredClass.join(', ')}</div>
                )}
                {selectedQuest.requirements.requiredSkills && (
                  <div>🎯 Skills: {selectedQuest.requirements.requiredSkills.map(s => `${s.skill} (${s.level})`).join(', ')}</div>
                )}
              </div>
            </div>
            
            {/* Rewards */}
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-white">Rewards</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-yellow-400">⭐ {selectedQuest.rewards.xp} XP</div>
                {selectedQuest.rewards.gold && (
                  <div className="text-yellow-300">💰 {selectedQuest.rewards.gold} Gold</div>
                )}
                {selectedQuest.rewards.items && (
                  <div className="text-blue-400">📦 {selectedQuest.rewards.items.join(', ')}</div>
                )}
                {selectedQuest.rewards.skillPoints && (
                  <div className="text-purple-400">💎 {selectedQuest.rewards.skillPoints} Skill Points</div>
                )}
              </div>
              {selectedQuest.bonusRewards && (
                <div className="mt-2 p-2 bg-white/5 rounded">
                  <div className="text-xs text-blue-400 mb-1">Bonus Rewards (Optional Objectives):</div>
                  <div className="text-xs text-gray-300">
                    +{selectedQuest.bonusRewards.xp} XP
                    {selectedQuest.bonusRewards.items && `, ${selectedQuest.bonusRewards.items.join(', ')}`}
                  </div>
                </div>
              )}
            </div>
            
            {/* Agent Selection */}
            {selectedQuest.status === 'available' && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2 text-white">Assign Agents</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {agents.map(agent => (
                    <button
                      key={agent.id}
                      className={`p-2 rounded-lg border transition-all ${
                        selectedAgents.includes(agent.id)
                          ? 'bg-blue-500/30 border-blue-400'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => handleAgentToggle(agent.id)}
                    >
                      <div className="flex items-center gap-2">
                        <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full" />
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">{agent.name}</div>
                          <div className="text-xs text-gray-400">Lv.{agent.level} {agent.class}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400">
                  Selected: {selectedAgents.length} / Recommended: {selectedQuest.recommendedTeamSize}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              {selectedQuest.status === 'available' && (
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    canStartQuest(selectedQuest)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 cursor-not-allowed opacity-50'
                  }`}
                  onClick={handleQuestStart}
                  disabled={!canStartQuest(selectedQuest)}
                >
                  Start Quest
                </button>
              )}
              {selectedQuest.status === 'active' && selectedQuest.progressPercentage >= 100 && (
                <button
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                  onClick={() => {
                    onQuestComplete(selectedQuest.id);
                    setQuests(prev => prev.map(q => 
                      q.id === selectedQuest.id 
                        ? { ...q, status: 'completed' as QuestStatus }
                        : q
                    ));
                    setShowDetails(false);
                  }}
                >
                  Complete Quest
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestBoard;