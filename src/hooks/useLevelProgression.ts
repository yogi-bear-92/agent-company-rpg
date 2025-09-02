// React hook for level progression integration in Agent Company RPG

import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent } from '../types/agent';
import { Quest } from '../types/quest';
import { 
  LevelUpEvent, 
  ProgressionNotification, 
  ProgressionEvent,
  levelProgressionManager,
  processAgentXpGain,
  processQuestCompletion
} from '../utils/levelProgression';

export interface LevelProgressionHookReturn {
  // State
  activeNotifications: ProgressionNotification[];
  levelUpQueue: LevelUpEvent[];
  recentEvents: ProgressionEvent[];
  isProcessing: boolean;
  
  // Actions
  awardXp: (agent: Agent, amount: number, source: string) => Promise<Agent>;
  completeQuest: (quest: Quest, agents: Agent[], completionData?: {
    completionTime?: number;
    optionalObjectivesCompleted?: number;
    teamPerformanceBonus?: number;
  }) => Promise<Agent[]>;
  dismissNotification: (id: string) => void;
  clearDismissedNotifications: () => void;
  getNextLevelUp: () => LevelUpEvent | undefined;
  
  // Event handlers
  onLevelUp: (handler: (event: LevelUpEvent) => void) => void;
  onXpGain: (handler: (event: ProgressionEvent) => void) => void;
  onSkillUnlock: (handler: (event: ProgressionEvent) => void) => void;
  
  // Utilities
  playLevelUpEffect: (agentId: number) => void;
  calculatePreviewXp: (agent: Agent, amount: number) => {
    newLevel: number;
    levelUp: boolean;
    xpProgress: number;
    xpToNext: number;
  };
}

export const useLevelProgression = (): LevelProgressionHookReturn => {
  const [activeNotifications, setActiveNotifications] = useState<ProgressionNotification[]>([]);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<ProgressionEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const eventHandlersRef = useRef<{
    levelUp: ((event: LevelUpEvent) => void)[];
    xpGain: ((event: ProgressionEvent) => void)[];
    skillUnlock: ((event: ProgressionEvent) => void)[];
  }>({
    levelUp: [],
    xpGain: [],
    skillUnlock: []
  });

  const animationTimersRef = useRef<{ [agentId: number]: NodeJS.Timeout[] }>({});

  // Create particle effect for level ups
  const createParticleEffect = useCallback((agentId: number) => {
    const agentElement = document.querySelector(`[data-agent-id="${agentId}"]`);
    if (!agentElement) return;

    const rect = agentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'fixed pointer-events-none z-50';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.backgroundColor = ['#ffd700', '#ffed4e', '#f7c41f'][i % 3];
      particle.style.borderRadius = '50%';
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      const angle = (i / 15) * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      particle.style.transform = `translate(-50%, -50%)`;
      document.body.appendChild(particle);

      // Animate particle
      let progress = 0;
      const animate = () => {
        progress += 0.02;
        if (progress >= 1) {
          document.body.removeChild(particle);
          return;
        }

        const x = vx * progress;
        const y = vy * progress + (progress * progress * 200); // Gravity
        const opacity = 1 - progress;

        particle.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
        particle.style.opacity = opacity.toString();

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  }, []);

  // Play level up visual effects
  const playLevelUpEffect = useCallback((agentId: number) => {
    // Clear existing timers for this agent
    if (animationTimersRef.current[agentId]) {
      animationTimersRef.current[agentId].forEach(timer => clearTimeout(timer));
    }

    animationTimersRef.current[agentId] = [];

    // Find agent elements and apply effects
    const agentElements = document.querySelectorAll(`[data-agent-id="${agentId}"]`);
    
    agentElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Glow effect
      htmlElement.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
      htmlElement.style.transform = 'scale(1.05)';
      htmlElement.style.transition = 'all 0.3s ease-out';
      
      // Remove glow after animation
      const glowTimer = setTimeout(() => {
        htmlElement.style.boxShadow = '';
        htmlElement.style.transform = '';
      }, 2000);
      
      animationTimersRef.current[agentId].push(glowTimer);
    });

    // Screen flash effect
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-yellow-400 opacity-20 pointer-events-none z-50';
    flash.style.animation = 'flash 0.2s ease-out';
    document.body.appendChild(flash);

    const flashTimer = setTimeout(() => {
      document.body.removeChild(flash);
    }, 200);
    
    animationTimersRef.current[agentId].push(flashTimer);

    // Particle effect
    createParticleEffect(agentId);
  }, [createParticleEffect]);

  // Initialize and sync with progression manager
  useEffect(() => {
    const syncState = () => {
      const state = levelProgressionManager.getProgressionState();
      setActiveNotifications([...state.activeNotifications]);
      setLevelUpQueue([...state.levelUpQueue]);
      setRecentEvents([...state.recentEvents]);
      setIsProcessing(state.isProcessing);
    };

    // Initial sync
    syncState();

    // Set up event listeners
    const levelUpHandler = (event: ProgressionEvent) => {
      if (event.type === 'level_up') {
        const levelUpEvent = event.data as LevelUpEvent;
        eventHandlersRef.current.levelUp.forEach(handler => handler(levelUpEvent));
        playLevelUpEffect(event.agentId);
      }
    };

    const xpGainHandler = (event: ProgressionEvent) => {
      if (event.type === 'xp_gained') {
        eventHandlersRef.current.xpGain.forEach(handler => handler(event));
      }
    };

    const skillUnlockHandler = (event: ProgressionEvent) => {
      if (event.type === 'skill_unlocked') {
        eventHandlersRef.current.skillUnlock.forEach(handler => handler(event));
      }
    };

    levelProgressionManager.on('level_up', levelUpHandler);
    levelProgressionManager.on('xp_gained', xpGainHandler);
    levelProgressionManager.on('skill_unlocked', skillUnlockHandler);

    // Periodic sync
    const syncInterval = setInterval(syncState, 1000);
    
    // Copy ref value to avoid stale closure warning
    const currentTimers = animationTimersRef.current;

    return () => {
      clearInterval(syncInterval);
      // Clean up animation timers using the copied value
      if (currentTimers) {
        Object.values(currentTimers).forEach(timers => {
          timers.forEach(timer => clearTimeout(timer));
        });
      }
    };
  }, [playLevelUpEffect]);

  // Award XP to an agent
  const awardXp = useCallback(async (
    agent: Agent, 
    amount: number, 
    source: string
  ): Promise<Agent> => {
    setIsProcessing(true);
    try {
      const result = await processAgentXpGain(agent, amount, source);
      return result.updatedAgent;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Complete a quest and award XP to all assigned agents
  const completeQuest = useCallback(async (
    quest: Quest, 
    agents: Agent[], 
    completionData?: {
      completionTime?: number;
      optionalObjectivesCompleted?: number;
      teamPerformanceBonus?: number;
    }
  ): Promise<Agent[]> => {
    setIsProcessing(true);
    try {
      const result = await processQuestCompletion(quest, agents, completionData);
      return result.updatedAgents;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Dismiss a notification
  const dismissNotification = useCallback((id: string) => {
    levelProgressionManager.dismissNotification(id);
  }, []);

  // Clear all dismissed notifications
  const clearDismissedNotifications = useCallback(() => {
    levelProgressionManager.clearDismissedNotifications();
  }, []);

  // Get next level up from queue
  const getNextLevelUp = useCallback((): LevelUpEvent | undefined => {
    return levelProgressionManager.getNextLevelUpEvent();
  }, []);

  // Register event handlers
  const onLevelUp = useCallback((handler: (event: LevelUpEvent) => void) => {
    eventHandlersRef.current.levelUp.push(handler);
  }, []);

  const onXpGain = useCallback((handler: (event: ProgressionEvent) => void) => {
    eventHandlersRef.current.xpGain.push(handler);
  }, []);

  const onSkillUnlock = useCallback((handler: (event: ProgressionEvent) => void) => {
    eventHandlersRef.current.skillUnlock.push(handler);
  }, []);

  // Calculate preview of XP gain effects
  const calculatePreviewXp = useCallback((agent: Agent, amount: number) => {
    const totalXp = agent.xp + amount;
    let level = agent.level;
    let currentXp = totalXp;
    let xpToNext = agent.xpToNext;
    
    // Simple level calculation (should match xpCalculator logic)
    while (currentXp >= xpToNext && level < 100) {
      currentXp -= xpToNext;
      level++;
      xpToNext = Math.floor(100 * Math.pow(1.5, level - 1));
    }

    return {
      newLevel: level,
      levelUp: level > agent.level,
      xpProgress: currentXp,
      xpToNext: xpToNext
    };
  }, []);

  return {
    // State
    activeNotifications,
    levelUpQueue,
    recentEvents,
    isProcessing,
    
    // Actions
    awardXp,
    completeQuest,
    dismissNotification,
    clearDismissedNotifications,
    getNextLevelUp,
    
    // Event handlers
    onLevelUp,
    onXpGain,
    onSkillUnlock,
    
    // Utilities
    playLevelUpEffect,
    calculatePreviewXp
  };
};

// Specialized hook for quest-specific progression
export const useQuestProgression = () => {
  const progression = useLevelProgression();
  const [questCompletions, setQuestCompletions] = useState<{
    [questId: string]: {
      completed: boolean;
      agents: number[];
      xpAwarded: number;
      timestamp: Date;
    }
  }>({});

  const completeQuestWithTracking = useCallback(async (
    questId: string,
    quest: Quest,
    agents: Agent[],
    completionData?: {
      completionTime?: number;
      optionalObjectivesCompleted?: number;
      teamPerformanceBonus?: number;
    }
  ) => {
    const updatedAgents = await progression.completeQuest(quest, agents, completionData);
    
    // Track completion
    const totalXpAwarded = agents.reduce((sum, agent) => {
      const updated = updatedAgents.find(a => a.id === agent.id);
      return sum + (updated ? updated.xp - agent.xp : 0);
    }, 0);

    setQuestCompletions(prev => ({
      ...prev,
      [questId]: {
        completed: true,
        agents: quest.assignedAgents,
        xpAwarded: totalXpAwarded,
        timestamp: new Date()
      }
    }));

    return updatedAgents;
  }, [progression]);

  return {
    ...progression,
    questCompletions,
    completeQuestWithTracking
  };
};

export default useLevelProgression;