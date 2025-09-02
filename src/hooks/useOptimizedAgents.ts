// Optimized agents hook with performance enhancements
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Agent } from '../types/agent';
import { initialAgents } from '../data/agents';
import { performanceMonitor } from '../../performance/monitoring/performance-monitor';

export interface UseOptimizedAgentsReturn {
  agents: Agent[];
  filteredAgents: Agent[];
  selectedAgent: Agent | null;
  searchQuery: string;
  sortBy: string;
  
  // Actions
  updateAgent: (agentId: number, updates: Partial<Agent>) => void;
  selectAgent: (agent: Agent | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string) => void;
  batchUpdateAgents: (updates: Array<{ id: number; updates: Partial<Agent> }>) => void;
  
  // Performance metrics
  renderMetrics: {
    lastRenderTime: number;
    rerenderCount: number;
    filteredCount: number;
  };
}

export function useOptimizedAgents(): UseOptimizedAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('level');
  
  // Performance tracking
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const filterStartTimeRef = useRef(0);

  // Memoized filtering and sorting with performance measurement
  const filteredAgents = useMemo(() => {
    filterStartTimeRef.current = performance.now();
    
    let filtered = agents;
    
    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = agents.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.class.toLowerCase().includes(query) ||
        agent.specializations.some(spec => spec.toLowerCase().includes(query)) ||
        agent.currentMission.toLowerCase().includes(query)
      );
    }
    
    // Sorting with optimized comparisons
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.level - a.level; // Descending
        case 'class':
          return a.class.localeCompare(b.class);
        case 'xp':
          return b.xp - a.xp; // Descending
        case 'activity':
          const aLastActivity = a.realtimeActivity[0]?.timestamp || '';
          const bLastActivity = b.realtimeActivity[0]?.timestamp || '';
          return bLastActivity.localeCompare(aLastActivity); // Most recent first
        default:
          return 0;
      }
    });
    
    // Measure filter performance
    performanceMonitor.measureQuestFilter(filterStartTimeRef.current);
    
    return sorted;
  }, [agents, searchQuery, sortBy]);

  // Track render performance
  useEffect(() => {
    const renderStart = performance.now();
    renderCountRef.current++;
    
    // Measure render time after DOM update
    const measureRender = () => {
      const renderTime = performance.now() - renderStart;
      lastRenderTimeRef.current = renderTime;
      performanceMonitor.measureComponentRender('useOptimizedAgents', renderStart);
    };
    
    // Use setTimeout to measure after React's commit phase
    setTimeout(measureRender, 0);
  });

  // Optimized agent update with minimal re-renders
  const updateAgent = useCallback((agentId: number, updates: Partial<Agent>) => {
    performanceMonitor.trackStateUpdate();
    
    setAgents(prevAgents => {
      const agentIndex = prevAgents.findIndex(a => a.id === agentId);
      if (agentIndex === -1) return prevAgents;
      
      const newAgents = [...prevAgents];
      newAgents[agentIndex] = { ...newAgents[agentIndex], ...updates };
      return newAgents;
    });
    
    // Update selected agent if it's the one being updated
    setSelectedAgent(prevSelected => 
      prevSelected?.id === agentId 
        ? { ...prevSelected, ...updates }
        : prevSelected
    );
  }, []);

  // Batch update for performance
  const batchUpdateAgents = useCallback((updates: Array<{ id: number; updates: Partial<Agent> }>) => {
    const startTime = performance.now();
    performanceMonitor.trackStateUpdate();
    
    setAgents(prevAgents => {
      const newAgents = [...prevAgents];
      const updateMap = new Map(updates.map(u => [u.id, u.updates]));
      
      for (let i = 0; i < newAgents.length; i++) {
        const agentUpdates = updateMap.get(newAgents[i].id);
        if (agentUpdates) {
          newAgents[i] = { ...newAgents[i], ...agentUpdates };
        }
      }
      
      return newAgents;
    });
    
    // Update selected agent if it's being updated
    const selectedAgentUpdate = updates.find(u => u.id === selectedAgent?.id);
    if (selectedAgentUpdate && selectedAgent) {
      setSelectedAgent({ ...selectedAgent, ...selectedAgentUpdate.updates });
    }
    
    const batchTime = performance.now() - startTime;
    console.log(`Batch update completed in ${batchTime.toFixed(2)}ms for ${updates.length} agents`);
  }, [selectedAgent]);

  // Optimized agent selection
  const selectAgent = useCallback((agent: Agent | null) => {
    setSelectedAgent(agent);
  }, []);

  // Debounced search query update
  const debouncedSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Optimized sort update
  const optimizedSetSortBy = useCallback((newSortBy: string) => {
    if (newSortBy !== sortBy) {
      setSortBy(newSortBy);
    }
  }, [sortBy]);

  // Performance metrics
  const renderMetrics = useMemo(() => ({
    lastRenderTime: lastRenderTimeRef.current,
    rerenderCount: renderCountRef.current,
    filteredCount: filteredAgents.length
  }), [filteredAgents.length]);

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useOptimizedAgents render metrics:', renderMetrics);
    }
  }, [renderMetrics]);

  return {
    agents,
    filteredAgents,
    selectedAgent,
    searchQuery,
    sortBy,
    updateAgent,
    selectAgent,
    setSearchQuery: debouncedSetSearchQuery,
    setSortBy: optimizedSetSortBy,
    batchUpdateAgents,
    renderMetrics
  };
}

// Hook for optimized quest filtering
export function useOptimizedQuestFilter(quests: any[], filters: any) {
  const filterStartTime = useRef(0);
  
  return useMemo(() => {
    filterStartTime.current = performance.now();
    
    let filtered = quests;
    
    // Apply filters efficiently
    if (filters.type?.length) {
      filtered = filtered.filter(q => filters.type.includes(q.type));
    }
    if (filters.difficulty?.length) {
      filtered = filtered.filter(q => filters.difficulty.includes(q.difficulty));
    }
    if (filters.status?.length) {
      filtered = filtered.filter(q => filters.status.includes(q.status));
    }
    if (filters.hideCompleted) {
      filtered = filtered.filter(q => q.status !== 'completed');
    }
    if (filters.minRewardXp) {
      filtered = filtered.filter(q => q.rewards.xp >= filters.minRewardXp);
    }
    
    // Measure and report filter performance
    setTimeout(() => {
      performanceMonitor.measureQuestFilter(filterStartTime.current);
    }, 0);
    
    return filtered;
  }, [quests, filters]);
}

export default useOptimizedAgents;