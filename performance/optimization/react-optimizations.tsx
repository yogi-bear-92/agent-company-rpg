// React performance optimizations for Agent Company RPG
import React, { memo, useMemo, useCallback, lazy } from 'react';
import { Agent } from '../../src/types/agent';

// Lazy loaded components for code splitting
export const LazyAgentSheet = lazy(() => import('../../src/components/AgentSheet'));
export const LazyQuestBoard = lazy(() => import('../../src/components/QuestBoard'));

// Memoized agent card component
export const OptimizedAgentCard = memo(({ 
  agent, 
  onSelect, 
  renderXPBar 
}: {
  agent: Agent;
  isLeveling: boolean;
  onSelect: (agent: Agent) => void;
  renderXPBar: (current: number, toNext: number, level: number, agent?: Agent) => React.ReactNode;
}) => {
  const handleSelect = useCallback(() => {
    onSelect(agent);
  }, [agent, onSelect]);

  const specializations = useMemo(() => 
    agent.specializations.slice(0, 3), 
    [agent.specializations]
  );

  const recentActivity = useMemo(() => 
    agent.realtimeActivity[0]?.action || 'No recent activity',
    [agent.realtimeActivity]
  );

  return (
    <div 
      data-agent-id={agent.id}
      className="agent-card p-4 space-y-3 transition-all duration-300"
      onClick={handleSelect}
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
      
      <AgentStats stats={agent.stats} />
      
      <div className="flex flex-wrap gap-1">
        {specializations.map((spec, idx) => (
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
        <div className="text-xs text-cyan-300">{recentActivity}</div>
      </div>
    </div>
  );
});

// Memoized stats component
const AgentStats = memo(({ stats }: { stats: Agent['stats'] }) => (
  <div className="grid grid-cols-5 gap-2 text-xs">
    <StatItem value={stats.intelligence} label="INT" color="text-blue-400" />
    <StatItem value={stats.creativity} label="CRE" color="text-purple-400" />
    <StatItem value={stats.reliability} label="REL" color="text-green-400" />
    <StatItem value={stats.speed} label="SPD" color="text-yellow-400" />
    <StatItem value={stats.leadership} label="LEA" color="text-red-400" />
  </div>
));

// Micro-optimized stat item
const StatItem = memo(({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="text-center">
    <div className={`${color} font-semibold`}>{value}</div>
    <div className="text-slate-400">{label}</div>
  </div>
));

// Virtualized agent list for large datasets
export const VirtualizedAgentList = memo(({ 
  agents, 
  renderItem,
  itemHeight = 200,
  containerHeight = 600
}: {
  agents: Agent[];
  renderItem: (agent: Agent, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 1, agents.length);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, agents.length]);

  const visibleItems = useMemo(() => 
    agents.slice(visibleRange.start, visibleRange.end),
    [agents, visibleRange]
  );

  const totalHeight = agents.length * itemHeight;

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleRange.start * itemHeight}px)` }}>
          {visibleItems.map((agent, index) => 
            renderItem(agent, visibleRange.start + index)
          )}
        </div>
      </div>
    </div>
  );
});

// Optimized XP bar with memoization
export const OptimizedXPBar = memo(({ 
  current, 
  toNext, 
  level, 
  isLeveling = false 
}: {
  current: number;
  toNext: number;
  level: number;
  isLeveling?: boolean;
}) => {
  const percentage = useMemo(() => 
    (current / toNext) * 100, 
    [current, toNext]
  );

  const style = useMemo(() => ({
    width: `${percentage}%`,
    '--xp-percentage': `${percentage}%`,
    '--xp-start': '0%',
    '--xp-final': `${percentage}%`,
    animation: isLeveling ? 'xpBarMultiLevel 2s ease-out' : undefined,
    transition: !isLeveling ? 'width 0.5s ease-out' : undefined
  } as React.CSSProperties), [percentage, isLeveling]);

  return (
    <div className="xp-bar relative">
      <div 
        className={`xp-progress ${isLeveling ? 'xp-multi-level' : ''}`}
        style={style}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        Level {level} • {current}/{toNext} XP
      </div>
    </div>
  );
});

// Debounced search component
export const DebouncedSearch = memo(({ 
  onSearch, 
  placeholder = "Search...",
  delay = 300
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
}) => {
  const [query, setQuery] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, delay, onSearch]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
    />
  );
});

// Performance-optimized loading states
export const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
  </div>
));

export const ErrorBoundary = class extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-red-300">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
};

// Higher-order component for performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return memo((props: P) => {
    const renderStart = performance.now();
    
    React.useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (renderTime > 16) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });

    return <Component {...props} />;
  });
}

// Optimized grid layout for responsive performance
export const ResponsiveGrid = memo(({ 
  children, 
  minItemWidth = 300,
  gap = 16 
}: {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
}) => {
  const [columns, setColumns] = React.useState(1);
  
  React.useEffect(() => {
    const updateColumns = () => {
      const containerWidth = window.innerWidth - 48; // Account for padding
      const maxColumns = Math.floor((containerWidth + gap) / (minItemWidth + gap));
      setColumns(Math.max(1, maxColumns));
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [minItemWidth, gap]);

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
});

export default {
  OptimizedAgentCard,
  OptimizedXPBar,
  VirtualizedAgentList,
  DebouncedSearch,
  LoadingSpinner,
  ErrorBoundary,
  withPerformanceTracking,
  ResponsiveGrid,
  LazyAgentSheet,
  LazyQuestBoard
};