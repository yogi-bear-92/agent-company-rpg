import React, { memo } from 'react';
import { Agent } from '../types/gameTypes';

interface AgentSheetProps {
  agents?: Agent[];
  onAgentClick?: (agent: Agent) => void;
  className?: string;
}

// Memoized component for performance
const AgentSheet = memo(function AgentSheet({ 
  agents = [], 
  onAgentClick,
  className = ""
}: AgentSheetProps) {
  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-4">Agent Roster</h2>
      
      {agents.length === 0 ? (
        <div className="text-slate-400 text-center py-8">
          No agents available. Recruit some agents to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => onAgentClick?.(agent)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  agent.status === 'idle' ? 'bg-green-500/20 text-green-400' :
                  agent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {agent.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Level {agent.level}</span>
                <span>{agent.experiencePoints} XP</span>
                <span>{agent.health}/100 HP</span>
              </div>
              
              {agent.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {agent.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                    >
                      {skill.name} {skill.level}
                    </span>
                  ))}
                  {agent.skills.length > 3 && (
                    <span className="px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs">
                      +{agent.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AgentSheet;