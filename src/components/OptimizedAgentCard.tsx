import React, { memo, useCallback } from 'react';
import { Agent } from '../types/agent';
import { ComponentErrorBoundary } from './ErrorBoundary';

interface OptimizedAgentCardProps {
  agent: Agent;
  onAgentClick: (agent: Agent) => void;
  isLeveling?: boolean;
  className?: string;
}

// Memoized component for better performance with many agents
const OptimizedAgentCard: React.FC<OptimizedAgentCardProps> = memo(({
  agent,
  onAgentClick,
  isLeveling = false,
  className = ""
}) => {
  // Memoize click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onAgentClick(agent);
  }, [agent, onAgentClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAgentClick(agent);
    }
  }, [agent, onAgentClick]);

  // Memoized XP percentage calculation
  const xpPercentage = React.useMemo(() => 
    (agent.xp / agent.xpToNext) * 100
  , [agent.xp, agent.xpToNext]);

  return (
    <ComponentErrorBoundary componentName="Agent Card">
      <article
        className={`agent-card p-4 space-y-3 transition-all duration-300 ${
          isLeveling ? 'level-up-glow' : ''
        } ${className}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${agent.name}, Level ${agent.level} ${agent.class}`}
        data-agent-id={agent.id}
        data-leveling-up={isLeveling}
      >
        {/* Agent Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span 
              className="text-2xl" 
              role="img" 
              aria-label={`${agent.name} avatar`}
            >
              {agent.avatar}
            </span>
            <div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-purple-300">{agent.class}</p>
            </div>
          </div>
          <div className="text-right" aria-live="polite">
            <div className="text-sm text-slate-400">Level {agent.level}</div>
            <div className="text-xs text-green-400">{agent.currentMission}</div>
          </div>
        </header>
        
        {/* XP Progress Bar */}
        <div className="relative">
          <div 
            className="xp-bar"
            role="progressbar"
            aria-valuenow={agent.xp}
            aria-valuemin={0}
            aria-valuemax={agent.xpToNext}
            aria-label={`Experience: ${agent.xp} out of ${agent.xpToNext} XP to next level`}
          >
            <div 
              className={`xp-progress ${isLeveling ? 'xp-multi-level' : ''}`}
              style={{ 
                width: `${xpPercentage}%`,
                '--xp-percentage': `${xpPercentage}%`,
                '--xp-start': '0%',
                '--xp-final': `${xpPercentage}%`,
                animation: isLeveling ? 'xpBarMultiLevel 2s ease-out' : undefined,
                transition: !isLeveling ? 'width 0.5s ease-out' : undefined
              } as React.CSSProperties}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            <span className="sr-only">
              Experience progress: {agent.xp} out of {agent.xpToNext} XP
            </span>
            Level {agent.level} • {agent.xp}/{agent.xpToNext} XP
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-2 text-xs" role="group" aria-label="Agent statistics">
          {[
            { key: 'intelligence', label: 'INT', value: agent.stats.intelligence, color: 'text-blue-400' },
            { key: 'creativity', label: 'CRE', value: agent.stats.creativity, color: 'text-purple-400' },
            { key: 'reliability', label: 'REL', value: agent.stats.reliability, color: 'text-green-400' },
            { key: 'speed', label: 'SPD', value: agent.stats.speed, color: 'text-yellow-400' },
            { key: 'leadership', label: 'LEA', value: agent.stats.leadership, color: 'text-red-400' }
          ].map(stat => (
            <div key={stat.key} className="text-center">
              <div className={`${stat.color} font-semibold`} aria-label={`${stat.key}: ${stat.value}`}>
                {stat.value}
              </div>
              <div className="text-slate-400" aria-hidden="true">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Specializations */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Agent specializations">
          {agent.specializations.slice(0, 3).map((spec, idx) => (
            <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded">
              {spec}
            </span>
          ))}
          {agent.specializations.length > 3 && (
            <span className="text-xs text-slate-400" aria-label={`${agent.specializations.length - 3} more specializations`}>
              +{agent.specializations.length - 3} more
            </span>
          )}
        </div>
        
        {/* Recent Activity */}
        <footer className="border-t border-slate-600 pt-2">
          <div className="text-xs text-slate-400 mb-1">Recent Activity:</div>
          <div className="text-xs text-cyan-300" aria-live="polite">
            {agent.realtimeActivity[0]?.action || 'No recent activity'}
          </div>
        </footer>
      </article>
    </ComponentErrorBoundary>
  );
});

OptimizedAgentCard.displayName = 'OptimizedAgentCard';

export default OptimizedAgentCard;