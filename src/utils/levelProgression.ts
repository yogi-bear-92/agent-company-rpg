// Level progression system for Agent Company RPG
// Integrates with existing XP calculator and provides progression mechanics

import { Agent } from '../types/agent';
import { Quest } from '../types/quest';
import { 
  applyXpToAgent, 
  calculateQuestXpReward
} from './xpCalculator';

export interface LevelUpEvent {
  agentId: number;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
  source: string;
  unlockedSkills: string[];
  statIncreases: StatIncrease[];
  timestamp: Date;
}

export interface StatIncrease {
  stat: keyof Agent['stats'];
  amount: number;
  reason: string;
}

export interface ProgressionEvent {
  type: 'xp_gained' | 'level_up' | 'skill_unlocked' | 'quest_completed';
  agentId: number;
  data: unknown;
  timestamp: Date;
}

export interface ProgressionNotification {
  id: string;
  type: 'level_up' | 'skill_unlock' | 'achievement' | 'stat_boost';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
  duration?: number; // milliseconds to show
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  timestamp: Date;
  dismissed: boolean;
}

export interface ProgressionState {
  recentEvents: ProgressionEvent[];
  activeNotifications: ProgressionNotification[];
  levelUpQueue: LevelUpEvent[];
  isProcessing: boolean;
}

// Core level progression manager
export class LevelProgressionManager {
  private progressionState: ProgressionState = {
    recentEvents: [],
    activeNotifications: [],
    levelUpQueue: [],
    isProcessing: false
  };

  private eventHandlers: { [key: string]: ((event: ProgressionEvent) => void)[] } = {};

  constructor() {
    this.setupEventHandlers();
  }

  // Subscribe to progression events
  on(eventType: string, handler: (event: ProgressionEvent) => void) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
  }

  // Emit progression events
  private emit(event: ProgressionEvent) {
    const handlers = this.eventHandlers[event.type];
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
    
    // Store recent events
    this.progressionState.recentEvents.unshift(event);
    if (this.progressionState.recentEvents.length > 100) {
      this.progressionState.recentEvents = this.progressionState.recentEvents.slice(0, 100);
    }
  }

  // Process XP gain and handle level ups
  async processXpGain(
    agent: Agent, 
    xpAmount: number, 
    source: string
  ): Promise<{
    updatedAgent: Agent;
    levelUpEvent?: LevelUpEvent;
    notifications: ProgressionNotification[];
  }> {
    this.progressionState.isProcessing = true;

    try {
      // Apply XP using existing calculator
      const result = applyXpToAgent(agent, xpAmount, source);
      
      let levelUpEvent: LevelUpEvent | undefined;
      const notifications: ProgressionNotification[] = [];

      // Emit XP gained event
      this.emit({
        type: 'xp_gained',
        agentId: agent.id,
        data: { amount: xpAmount, source, newTotal: result.updatedAgent.xp },
        timestamp: new Date()
      });

      // Handle level up
      if (result.leveledUp && result.newLevel) {
        levelUpEvent = {
          agentId: agent.id,
          oldLevel: agent.level,
          newLevel: result.newLevel,
          xpGained: xpAmount,
          source,
          unlockedSkills: result.unlockedSkills || [],
          statIncreases: this.calculateStatIncreases(agent.level, result.newLevel),
          timestamp: new Date()
        };

        // Queue level up for animations
        this.progressionState.levelUpQueue.push(levelUpEvent);

        // Create level up notification
        notifications.push(this.createLevelUpNotification(levelUpEvent));

        // Create skill unlock notifications
        if (result.unlockedSkills) {
          result.unlockedSkills.forEach(skill => {
            notifications.push(this.createSkillUnlockNotification(agent, skill));
          });
        }

        // Emit level up event
        this.emit({
          type: 'level_up',
          agentId: agent.id,
          data: levelUpEvent,
          timestamp: new Date()
        });
      }

      // Add notifications to active queue
      notifications.forEach(notification => {
        this.progressionState.activeNotifications.push(notification);
      });

      return {
        updatedAgent: result.updatedAgent,
        levelUpEvent,
        notifications
      };
    } finally {
      this.progressionState.isProcessing = false;
    }
  }

  // Process quest completion with full progression
  async processQuestCompletion(
    quest: Quest,
    agents: Agent[],
    completionData?: {
      completionTime?: number;
      optionalObjectivesCompleted?: number;
      teamPerformanceBonus?: number;
    }
  ): Promise<{
    updatedAgents: Agent[];
    levelUpEvents: LevelUpEvent[];
    notifications: ProgressionNotification[];
  }> {
    const updatedAgents: Agent[] = [];
    const levelUpEvents: LevelUpEvent[] = [];
    const allNotifications: ProgressionNotification[] = [];

    for (const agent of agents) {
      if (quest.assignedAgents.includes(agent.id)) {
        // Calculate XP reward for this agent
        const xpReward = calculateQuestXpReward(
          quest, 
          agent, 
          completionData?.completionTime,
          completionData?.optionalObjectivesCompleted
        );

        // Apply team performance bonus
        const finalXp = completionData?.teamPerformanceBonus 
          ? Math.floor(xpReward * completionData.teamPerformanceBonus)
          : xpReward;

        // Process XP gain
        const result = await this.processXpGain(
          agent, 
          finalXp, 
          `Quest: ${quest.title}`
        );

        updatedAgents.push(result.updatedAgent);
        if (result.levelUpEvent) {
          levelUpEvents.push(result.levelUpEvent);
        }
        allNotifications.push(...result.notifications);
      } else {
        updatedAgents.push(agent);
      }
    }

    // Emit quest completion event
    this.emit({
      type: 'quest_completed',
      agentId: 0, // System event
      data: { quest, agents: quest.assignedAgents, xpAwarded: true },
      timestamp: new Date()
    });

    return {
      updatedAgents,
      levelUpEvents,
      notifications: allNotifications
    };
  }

  // Calculate stat increases between levels
  private calculateStatIncreases(oldLevel: number, newLevel: number): StatIncrease[] {
    const increases: StatIncrease[] = [];
    
    // Major milestone bonuses
    if (newLevel >= 5 && oldLevel < 5) {
      increases.push({
        stat: 'intelligence',
        amount: 2,
        reason: 'Novice Milestone'
      });
    }
    
    if (newLevel >= 10 && oldLevel < 10) {
      increases.push({
        stat: 'creativity',
        amount: 3,
        reason: 'Adept Milestone'
      });
      increases.push({
        stat: 'leadership',
        amount: 2,
        reason: 'Leadership Awakening'
      });
    }

    if (newLevel >= 15 && oldLevel < 15) {
      increases.push({
        stat: 'reliability',
        amount: 3,
        reason: 'Expert Milestone'
      });
    }

    if (newLevel >= 20 && oldLevel < 20) {
      increases.push({
        stat: 'speed',
        amount: 4,
        reason: 'Master Milestone'
      });
      increases.push({
        stat: 'intelligence',
        amount: 3,
        reason: 'Wisdom of Masters'
      });
    }

    return increases;
  }

  // Create level up notification
  private createLevelUpNotification(levelUpEvent: LevelUpEvent): ProgressionNotification {
    return {
      id: `levelup_${levelUpEvent.agentId}_${Date.now()}`,
      type: 'level_up',
      title: `Level Up! 🎉`,
      message: `Agent reached Level ${levelUpEvent.newLevel}!`,
      icon: '⬆️',
      priority: 'high',
      duration: 5000,
      timestamp: new Date(),
      dismissed: false
    };
  }

  // Create skill unlock notification
  private createSkillUnlockNotification(agent: Agent, skill: string): ProgressionNotification {
    return {
      id: `skill_${agent.id}_${skill}_${Date.now()}`,
      type: 'skill_unlock',
      title: `New Skill Unlocked! ✨`,
      message: `${agent.name} learned "${skill}"`,
      icon: '🔓',
      priority: 'medium',
      duration: 4000,
      timestamp: new Date(),
      dismissed: false
    };
  }

  // Get progression state
  getProgressionState(): ProgressionState {
    return { ...this.progressionState };
  }

  // Dismiss notification
  dismissNotification(notificationId: string) {
    const notification = this.progressionState.activeNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
    }
  }

  // Clear dismissed notifications
  clearDismissedNotifications() {
    this.progressionState.activeNotifications = this.progressionState.activeNotifications
      .filter(n => !n.dismissed);
  }

  // Get next level up event from queue
  getNextLevelUpEvent(): LevelUpEvent | undefined {
    return this.progressionState.levelUpQueue.shift();
  }

  // Setup default event handlers
  private setupEventHandlers() {
    // Auto-clear old events
    setInterval(() => {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);
      
      this.progressionState.recentEvents = this.progressionState.recentEvents
        .filter(event => event.timestamp > cutoff);
      
      this.clearDismissedNotifications();
    }, 60000); // Every minute
  }
}

// Global instance
export const levelProgressionManager = new LevelProgressionManager();

// Helper functions for external use
export function createProgressionManager(): LevelProgressionManager {
  return new LevelProgressionManager();
}

export function processAgentXpGain(
  agent: Agent, 
  xpAmount: number, 
  source: string
): Promise<{
  updatedAgent: Agent;
  levelUpEvent?: LevelUpEvent;
  notifications: ProgressionNotification[];
}> {
  return levelProgressionManager.processXpGain(agent, xpAmount, source);
}

export function processQuestCompletion(
  quest: Quest,
  agents: Agent[],
  completionData?: {
    completionTime?: number;
    optionalObjectivesCompleted?: number;
    teamPerformanceBonus?: number;
  }
): Promise<{
  updatedAgents: Agent[];
  levelUpEvents: LevelUpEvent[];
  notifications: ProgressionNotification[];
}> {
  return levelProgressionManager.processQuestCompletion(quest, agents, completionData);
}

// Animation and visual helpers
export function generateLevelUpAnimation(levelUpEvent: LevelUpEvent) {
  return {
    agentId: levelUpEvent.agentId,
    animations: [
      {
        type: 'scale',
        from: 1,
        to: 1.2,
        duration: 300,
        easing: 'ease-out'
      },
      {
        type: 'glow',
        color: '#ffd700',
        intensity: 0.8,
        duration: 2000
      },
      {
        type: 'particles',
        count: 20,
        colors: ['#ffd700', '#ffed4e', '#f7c41f'],
        duration: 1500
      }
    ]
  };
}

export default levelProgressionManager;