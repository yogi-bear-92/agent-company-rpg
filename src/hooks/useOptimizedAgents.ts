// Optimized agents hook with performance monitoring and efficient updates
import { useState, useCallback, useMemo } from 'react';
import { Agent, Quest } from '../types/gameTypes';
import { batchCalculateXpRewards } from '../../performance/optimization/xp-calculator-optimized';

interface AgentsState {
  agents: Agent[];
  quests: Quest[];
  loading: boolean;
  error: string | null;
}

interface FilterCriteria {
  level: {
    min: number;
    max: number;
  };
  skills: string[];
  availability: 'all' | 'available' | 'busy';
  sortBy: 'level' | 'name' | 'xp' | 'efficiency';
  sortOrder: 'asc' | 'desc';
}

export function useOptimizedAgents() {
  const [state, setState] = useState<AgentsState>({
    agents: [],
    quests: [],
    loading: false,
    error: null
  });

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    level: { min: 1, max: 100 },
    skills: [],
    availability: 'all',
    sortBy: 'level',
    sortOrder: 'desc'
  });

  // Memoized filtered and sorted agents
  const filteredAgents = useMemo(() => {
    let filtered = state.agents;

    // Level filtering
    filtered = filtered.filter(agent => 
      agent.level >= filterCriteria.level.min && 
      agent.level <= filterCriteria.level.max
    );

    // Skills filtering
    if (filterCriteria.skills.length > 0) {
      filtered = filtered.filter(agent => 
        filterCriteria.skills.every(skill => 
          agent.skills.some((agentSkill: { name: string; level: number }) => agentSkill.name === skill)
        )
      );
    }

    // Availability filtering
    if (filterCriteria.availability !== 'all') {
      filtered = filtered.filter(agent => {
        const isAvailable = agent.status === 'idle';
        return filterCriteria.availability === 'available' ? isAvailable : !isAvailable;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filterCriteria.sortBy) {
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'xp':
          comparison = a.experiencePoints - b.experiencePoints;
          break;
        case 'efficiency':
          // Calculate efficiency based on completed quests vs time
          const aEfficiency = a.completedQuests.length / Math.max(1, a.level);
          const bEfficiency = b.completedQuests.length / Math.max(1, b.level);
          comparison = aEfficiency - bEfficiency;
          break;
        default:
          comparison = 0;
      }

      return filterCriteria.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.agents, filterCriteria]);

  // Optimized batch operations
  const batchUpdateAgents = useCallback((updates: Array<{ agentId: string; updates: Partial<Agent> }>) => {
    setState(prev => {
      const updatedAgents = prev.agents.map(agent => {
        const update = updates.find(u => u.agentId === agent.id);
        return update ? { ...agent, ...update.updates } : agent;
      });

      return {
        ...prev,
        agents: updatedAgents
      };
    });
  }, []);

  // Optimized quest assignment with performance tracking
  const assignQuestToAgent = useCallback(async (questId: string, agentId: string) => {
    const startTime = performance.now();
    
    try {
      setState(prev => ({ ...prev, loading: true }));

      const quest = state.quests.find(q => q.id === questId);
      const agent = state.agents.find(a => a.id === agentId);

      if (!quest || !agent) {
        throw new Error('Quest or agent not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));

      setState(prev => ({
        ...prev,
        agents: prev.agents.map(a => 
          a.id === agentId 
            ? { ...a, status: 'busy' as const, currentQuestId: questId }
            : a
        ),
        quests: prev.quests.map(q => 
          q.id === questId 
            ? { ...q, assignedAgentId: agentId, status: 'in-progress' as const }
            : q
        ),
        loading: false
      }));

      const operationTime = performance.now() - startTime;
      console.log(`Quest assignment completed in ${operationTime.toFixed(2)}ms`);

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Assignment failed'
      }));
    }
  }, [state.agents, state.quests]);

  // Optimized agent operations
  const addAgent = useCallback((agent: Agent) => {
    setState(prev => ({
      ...prev,
      agents: [...prev.agents, agent]
    }));
  }, []);

  const removeAgent = useCallback((agentId: string) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.filter(a => a.id !== agentId)
    }));
  }, []);

  // Optimized agent update
  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    }));
  }, []);

  // Filter update functions
  const updateFilter = useCallback((updates: Partial<FilterCriteria>) => {
    setFilterCriteria(prev => ({ ...prev, ...updates }));
  }, []);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      totalAgents: state.agents.length,
      filteredAgents: filteredAgents.length,
      filterEfficiency: state.agents.length > 0 ? filteredAgents.length / state.agents.length : 0,
      averageLevel: filteredAgents.length > 0 
        ? filteredAgents.reduce((sum, agent) => sum + agent.level, 0) / filteredAgents.length 
        : 0
    };
  }, [state.agents.length, filteredAgents.length, filteredAgents]);

  // Batch XP reward calculation
  const calculateBatchXpRewards = useCallback((questAgentPairs: Array<{
    quest: Quest;
    agent: Agent;
    completionData?: {
      completionTime?: number;
      optionalObjectivesCompleted?: number;
      teamPerformanceBonus?: number;
    };
  }>) => {
    return batchCalculateXpRewards(questAgentPairs);
  }, []);

  return {
    // State
    agents: filteredAgents,
    allAgents: state.agents,
    quests: state.quests,
    loading: state.loading,
    error: state.error,
    
    // Filter state
    filterCriteria,
    
    // Actions
    addAgent,
    removeAgent,
    updateAgent,
    batchUpdateAgents,
    assignQuestToAgent,
    calculateBatchXpRewards,
    
    // Filter actions
    updateFilter,
    
    // Performance metrics
    performanceMetrics,
    
    // Utility functions
    clearError: useCallback(() => setState(prev => ({ ...prev, error: null })), []),
    refreshData: useCallback(() => setState(prev => ({ ...prev, loading: true })), [])
  };
}