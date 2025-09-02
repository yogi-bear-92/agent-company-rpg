import { Agent } from '../types/agent';

interface AgentSheetProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentSheet({ agent, onClose }: AgentSheetProps) {
  const renderStatBar = (value: number, max: number = 100, color: string) => (
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );

  const renderSkillTree = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        🌟 Skill Tree
      </h3>
      <div className="grid gap-3">
        {Object.entries(agent.skillTree).map(([skillName, skill]) => (
          <div key={skillName} className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{skillName}</span>
              <span className="text-sm text-slate-400">
                {skill.level}/{skill.maxLevel}
              </span>
            </div>
            {renderStatBar(skill.level, skill.maxLevel, 'bg-gradient-to-r from-purple-500 to-cyan-500')}
            {skill.recentProgress && (
              <div className="text-xs text-green-400 mt-1">
                {skill.recentProgress}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderKnowledgeBase = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        🧠 Knowledge Base
        <span className="ml-2 text-sm bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
          {agent.knowledgeBase.totalMemories} memories
        </span>
      </h3>
      
      <div className="bg-slate-800/50 p-3 rounded-lg">
        <div className="text-sm text-slate-400 mb-1">Recent Learning:</div>
        <div className="text-cyan-300">{agent.knowledgeBase.recentLearning}</div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium">Domain Expertise:</div>
        {Object.entries(agent.knowledgeBase.knowledgeDomains).map(([domain, level]) => (
          <div key={domain} className="flex items-center justify-between">
            <span className="text-sm capitalize">{domain.replace('_', ' ')}</span>
            <div className="flex items-center space-x-2">
              <div className="w-20">
                {renderStatBar(level, 100, 'bg-gradient-to-r from-blue-500 to-purple-500')}
              </div>
              <span className="text-xs text-slate-400 w-8">{level}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {agent.knowledgeBase.crawlingProgress.active && (
        <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
          <div className="text-green-400 text-sm font-medium mb-1">🔄 Currently Learning</div>
          <div className="text-xs text-green-300">
            {agent.knowledgeBase.crawlingProgress.currentUrl || agent.knowledgeBase.crawlingProgress.lastUrl}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Pages learned: {agent.knowledgeBase.crawlingProgress.pagesLearned} • 
            Knowledge gained: +{agent.knowledgeBase.crawlingProgress.knowledgeGained}
          </div>
        </div>
      )}
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        ⚔️ Equipment
      </h3>
      <div className="space-y-3">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="text-sm text-purple-400 font-medium mb-1">Primary Tool</div>
          <div className="text-sm">{agent.equipment.primary}</div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="text-sm text-cyan-400 font-medium mb-1">Secondary Tool</div>
          <div className="text-sm">{agent.equipment.secondary}</div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="text-sm text-green-400 font-medium mb-1">Utility Item</div>
          <div className="text-sm">{agent.equipment.utility}</div>
        </div>
      </div>
    </div>
  );

  const renderRelationships = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        👥 Relationships
      </h3>
      {agent.relationships.length === 0 ? (
        <div className="text-sm text-slate-400 italic">No active relationships</div>
      ) : (
        <div className="space-y-3">
          {agent.relationships.map((rel, idx) => (
            <div key={idx} className="bg-slate-800/50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium">Agent #{rel.agentId}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    rel.type === 'mentor' ? 'bg-purple-500/20 text-purple-300' :
                    rel.type === 'apprentice' ? 'bg-green-500/20 text-green-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {rel.type}
                  </span>
                  <span className="text-xs text-slate-400">{rel.strength}% strength</span>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                Recent: {rel.recentInteraction}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{agent.avatar}</span>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <p className="text-lg text-purple-300">{agent.class}</p>
                <p className="text-sm text-slate-400 italic">{agent.personality}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl p-2"
            >
              ✕
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { key: 'intelligence', label: 'Intelligence', value: agent.stats.intelligence, color: 'text-blue-400' },
              { key: 'creativity', label: 'Creativity', value: agent.stats.creativity, color: 'text-purple-400' },
              { key: 'reliability', label: 'Reliability', value: agent.stats.reliability, color: 'text-green-400' },
              { key: 'speed', label: 'Speed', value: agent.stats.speed, color: 'text-yellow-400' },
              { key: 'leadership', label: 'Leadership', value: agent.stats.leadership, color: 'text-red-400' }
            ].map(stat => (
              <div key={stat.key} className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
                <div className="mt-2">
                  {renderStatBar(stat.value, 100, `bg-gradient-to-r from-${stat.color.split('-')[1]}-500 to-${stat.color.split('-')[1]}-400`)}
                </div>
              </div>
            ))}
          </div>

          {/* Level & XP */}
          <div className="bg-slate-800/50 p-4 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Level {agent.level}</span>
              <span className="text-sm text-slate-400">{agent.xp} / {agent.xpToNext} XP</span>
            </div>
            <div className="xp-bar">
              <div 
                className="xp-progress" 
                style={{ width: `${(agent.xp / agent.xpToNext) * 100}%` }}
              />
            </div>
          </div>

          {/* Specializations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">🎯 Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {agent.specializations.map((spec, idx) => (
                <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Current Mission */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">📋 Current Mission</h3>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <span className={`text-lg ${
                agent.currentMission === 'Available for Mission' 
                  ? 'text-green-400' 
                  : 'text-cyan-400'
              }`}>
                {agent.currentMission}
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {renderKnowledgeBase()}
              {renderEquipment()}
            </div>
            <div className="space-y-8">
              {renderSkillTree()}
              {renderRelationships()}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">⚡ Recent Activity</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {agent.realtimeActivity.map((activity, idx) => (
                <div key={idx} className="bg-slate-800/30 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm">{activity.action}</div>
                      <div className="text-xs text-slate-400 mt-1">{activity.timestamp}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {activity.xpGained && (
                        <span className="text-xs text-green-400">+{activity.xpGained} XP</span>
                      )}
                      {activity.synergy && (
                        <span className="text-xs text-purple-400">{activity.synergy}</span>
                      )}
                      {activity.confidence && (
                        <span className="text-xs text-cyan-400">{activity.confidence}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}