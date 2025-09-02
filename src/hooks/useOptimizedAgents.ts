// Optimized hooks for agent management with performance monitoring
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Agent } from '../types/agent';
import { performanceMonitor } from '../../performance/monitoring/performance-monitor';

interface UseOptimizedAgentsOptions {
  enableFiltering?: boolean;
  enableSorting?: boolean;
  batchSize?: number;
}

interface OptimizedAgentsState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  filteredAgents: Agent[];
  sortedAgents: Agent[];
}

export function useOptimizedAgents(
  initialAgents: Agent[] = [],
  options: UseOptimizedAgentsOptions = {}
) {
  const {
    enableFiltering = true,
    enableSorting = true,
    batchSize = 20
  } = options;

  const [state, setState] = useState<OptimizedAgentsState>({
    agents: initialAgents,
    loading: false,
    error: null,
    filteredAgents: initialAgents,
    sortedAgents: initialAgents
  });

  const [filterCriteria, setFilterCriteria] = useState({
    search: '',
    class: '',
    minLevel: 0,
    maxLevel: 100
  });

  const [sortCriteria, setSortCriteria] = useState({
    field: 'level' as keyof Agent,
    direction: 'desc' as 'asc' | 'desc'
  });

  // Memoized filtering function
  const filteredAgents = useMemo(() => {
    if (!enableFiltering) return state.agents;

    const startTime = performance.now();
    
    const filtered = state.agents.filter(agent => {
      const matchesSearch = !filterCriteria.search || 
        agent.name.toLowerCase().includes(filterCriteria.search.toLowerCase()) ||
        agent.class.toLowerCase().includes(filterCriteria.search.toLowerCase());
      
      const matchesClass = !filterCriteria.class || 
        agent.class === filterCriteria.class;
      
      const matchesLevel = agent.level >= filterCriteria.minLevel && 
        agent.level <= filterCriteria.maxLevel;

      return matchesSearch && matchesClass && matchesLevel;
    });

    const endTime = performance.now();
    const filterTime = endTime - startTime;

    // Track filtering performance
    if (filterTime > 10) {
      performanceMonitor.logWarning('Agent filtering', filterTime, 10, 'medium');
    }

    return filtered;
  }, [state.agents, filterCriteria, enableFiltering]);

  // Memoized sorting function
  const sortedAgents = useMemo(() => {
    if (!enableSorting) return filteredAgents;

    const startTime = performance.now();
    
    const sorted = [...filteredAgents].sort((a, b) => {
      const aValue = a[sortCriteria.field];
      const bValue = b[sortCriteria.field];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortCriteria.direction === 'asc' ? comparison : -comparison;
    });

    const sortTime = performance.now() - startTime;

    // Track sorting performance
    if (sortTime > 5) {
      performanceMonitor.logWarning('Agent sorting', sortTime, 5, 'medium');
    }

    return sorted;
  }, [filteredAgents, sortCriteria, enableSorting]);

  // Batched agents for virtual scrolling
  const batchedAgents = useMemo(() => {
    const batches: Agent[][] = [];
    for (let i = 0; i < sortedAgents.length; i += batchSize) {
      batches.push(sortedAgents.slice(i, i + batchSize));
    }
    return batches;
  }, [sortedAgents, batchSize]);

  // Update agents with performance tracking
  const updateAgents = useCallback((newAgents: Agent[]) => {
    const startTime = performance.now();
    
    setState(prev => ({
      ...prev,
      agents: newAgents,
      loading: false,
      error: null
    }));

    const updateTime = performance.now() - startTime;
    
    // Track update performance
    performanceMonitor.recordMetric('agent-update', updateTime);
    
    if (updateTime > 50) {
      performanceMonitor.logWarning('Agent update', updateTime, 50, 'medium');
    }
  }, []);

  // Optimized agent addition
  const addAgent = useCallback((agent: Agent) => {
    setState(prev => ({
      ...prev,
      agents: [...prev.agents, agent]
    }));
  }, []);

  // Optimized agent removal
  const removeAgent = useCallback((agentId: number | string) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.filter(a => a.id.toString() !== agentId.toString())
    }));
  }, []);

  // Optimized agent update
  const updateAgent = useCallback((agentId: number | string, updates: Partial<Agent>) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id.toString() === agentId.toString() ? { ...agent, ...updates } : agent
      )
    }));
  }, []);

  // Filter update functions
  const updateFilter = useCallback((updates: Partial<typeof filterCriteria>) => {
    setFilterCriteria(prev => ({ ...prev, ...updates }));
  }, []);

  // Sort update functions
  const updateSort = useCallback((field: keyof Agent, direction?: 'asc' | 'desc') => {
    setSortCriteria(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc')
    }));
  }, []);

  // Search optimization with debouncing
  const debouncedSearch = useCallback((searchTerm: string) => {
    const timeoutId = setTimeout(() => {
      updateFilter({ search: searchTerm });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [updateFilter]);

  // Performance metrics
  const performanceStats = useMemo(() => ({
    totalAgents: state.agents.length,
    filteredCount: filteredAgents.length,
    sortedCount: sortedAgents.length,
    batchCount: batchedAgents.length,
    filterRatio: state.agents.length > 0 ? filteredAgents.length / state.agents.length : 1,
    memoryUsage: state.agents.length * 1024 // Rough estimate in bytes
  }), [state.agents.length, filteredAgents.length, sortedAgents.length, batchedAgents.length]);

  // Effect for performance monitoring
  useEffect(() => {
    performanceMonitor.recordMetric('agents-processed', state.agents.length);
    performanceMonitor.recordMetric('filter-efficiency', performanceStats.filterRatio);
  }, [state.agents.length, performanceStats.filterRatio]);

  return {
    // State
    agents: state.agents,
    loading: state.loading,
    error: state.error,
    
    // Processed data
    filteredAgents,
    sortedAgents,
    batchedAgents,
    
    // Actions
    updateAgents,
    addAgent,
    removeAgent,
    updateAgent,
    
    // Filtering
    filterCriteria,
    updateFilter,
    debouncedSearch,
    
    // Sorting
    sortCriteria,
    updateSort,
    
    // Performance
    performanceStats,
    
    // Utils
    clearFilters: useCallback(() => {
      setFilterCriteria({
        search: '',
        class: '',
        minLevel: 0,
        maxLevel: 100
      });
    }, []),
    
    resetSort: useCallback(() => {
      setSortCriteria({
        field: 'level',
        direction: 'desc'
      });
    }, [])
  };
}

export default useOptimizedAgents;