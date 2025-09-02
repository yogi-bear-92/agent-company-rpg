import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  LevelProgressionManager,
  createProgressionManager,
  processAgentXpGain,
  processQuestCompletion,
  generateLevelUpAnimation
} from '../../src/utils/levelProgression';
import { Agent } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';

// Mock the xpCalculator functions
vi.mock('../../src/utils/xpCalculator', () => ({
  applyXpToAgent: vi.fn(),
  calculateQuestXpReward: vi.fn()
}));

describe('Level Progression System', () => {
  let manager: LevelProgressionManager;
  let mockAgent: Agent;
  let mockQuest: Quest;

  beforeEach(() => {
    manager = createProgressionManager();
    
    mockAgent = {
      id: 1,
      name: 'Test Agent',
      class: 'Code Master',
      level: 5,
      xp: 450,
      xpToNext: 550,
      stats: { intelligence: 75, creativity: 65, reliability: 85, speed: 70, leadership: 60 },
      specializations: ['Testing'],
      currentMission: 'Available',
      personality: 'Methodical',
      avatar: '🧪',
      knowledgeBase: {
        totalMemories: 100,
        recentLearning: 'Test concepts',
        knowledgeDomains: {},
        crawlingProgress: { active: false, lastUrl: '', pagesLearned: 0, knowledgeGained: 0 }
      },
      equipment: { primary: 'Test Tool', secondary: 'Debug Kit', utility: 'Knowledge Base' },
      relationships: [],
      skillTree: {},
      realtimeActivity: []
    };

    mockQuest = {
      id: 'test_quest',
      title: 'Test Quest',
      description: 'A quest for testing',
      type: 'main',
      category: 'Investigation',
      difficulty: 'Medium',
      status: 'available',
      icon: '🧪',
      objectives: [
        { id: '1', description: 'Test objective', completed: false, progress: 0, maxProgress: 1 }
      ],
      currentObjectiveIndex: 0,
      progressPercentage: 0,
      requirements: { minLevel: 1 },
      rewards: { xp: 100, gold: 50, items: [] },
      assignedAgents: [1],
      recommendedTeamSize: 1,
      autoAssign: false,
      dialogue: [],
      createdAt: new Date(),
      repeatable: false
    };

    // Clear any existing timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('LevelProgressionManager', () => {
    describe('Constructor and Initialization', () => {
      it('should initialize with empty state', () => {
        const state = manager.getProgressionState();
        
        expect(state.recentEvents).toHaveLength(0);
        expect(state.activeNotifications).toHaveLength(0);
        expect(state.levelUpQueue).toHaveLength(0);
        expect(state.isProcessing).toBe(false);
      });

      it('should set up event handlers on construction', () => {
        expect(manager).toBeDefined();
        expect(typeof manager.on).toBe('function');
      });
    });

    describe('Event System', () => {
      it('should allow subscribing to events', () => {
        const handler = vi.fn();
        manager.on('level_up', handler);
        
        // Trigger event by emitting directly (testing internal method)
        (manager as unknown).emit({
          type: 'level_up',
          agentId: 1,
          data: { test: true },
          timestamp: new Date()
        });

        expect(handler).toHaveBeenCalled();
      });

      it('should store recent events', () => {
        (manager as unknown).emit({
          type: 'xp_gained',
          agentId: 1,
          data: { amount: 100 },
          timestamp: new Date()
        });

        const state = manager.getProgressionState();
        expect(state.recentEvents).toHaveLength(1);
        expect(state.recentEvents[0].type).toBe('xp_gained');
      });

      it('should limit recent events to 100', () => {
        // Add 150 events
        for (let i = 0; i < 150; i++) {
          (manager as unknown).emit({
            type: 'xp_gained',
            agentId: 1,
            data: { amount: i },
            timestamp: new Date()
          });
        }

        const state = manager.getProgressionState();
        expect(state.recentEvents).toHaveLength(100);
      });
    });

    describe('XP Processing', () => {
      it('should process XP gain without level up', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, xp: 550 },
          leveledUp: false
        });

        const result = await manager.processXpGain(mockAgent, 100, 'test');

        expect(result.updatedAgent.xp).toBe(550);
        expect(result.levelUpEvent).toBeUndefined();
        expect(result.notifications).toHaveLength(0);
      });

      it('should process XP gain with level up', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, level: 6, xp: 50 },
          leveledUp: true,
          newLevel: 6,
          unlockedSkills: ['New Skill']
        });

        const result = await manager.processXpGain(mockAgent, 200, 'level up test');

        expect(result.levelUpEvent).toBeDefined();
        expect(result.levelUpEvent?.newLevel).toBe(6);
        expect(result.levelUpEvent?.unlockedSkills).toContain('New Skill');
        expect(result.notifications.length).toBeGreaterThan(0);
      });

      it('should handle processing state correctly', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({
              updatedAgent: mockAgent,
              leveledUp: false
            }), 100)
          )
        );

        const promise = manager.processXpGain(mockAgent, 100, 'test');
        
        // Should be processing initially
        expect(manager.getProgressionState().isProcessing).toBe(true);
        
        await promise;
        
        // Should not be processing after completion
        expect(manager.getProgressionState().isProcessing).toBe(false);
      });
    });

    describe('Quest Completion Processing', () => {
      it('should process quest completion for assigned agents', async () => {
        const { calculateQuestXpReward, applyXpToAgent } = await import('../../src/utils/xpCalculator');
        
        vi.mocked(calculateQuestXpReward).mockReturnValue(150);
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, xp: 600 },
          leveledUp: false
        });

        const result = await manager.processQuestCompletion(mockQuest, [mockAgent]);

        expect(result.updatedAgents).toHaveLength(1);
        expect(result.updatedAgents[0].xp).toBe(600);
        expect(calculateQuestXpReward).toHaveBeenCalledWith(mockQuest, mockAgent, undefined, undefined);
      });

      it('should skip agents not assigned to quest', async () => {
        const unassignedAgent = { ...mockAgent, id: 99 };
        mockQuest.assignedAgents = [1]; // Only agent 1 is assigned

        const result = await manager.processQuestCompletion(mockQuest, [mockAgent, unassignedAgent]);

        expect(result.updatedAgents).toHaveLength(2);
        expect(result.updatedAgents[1]).toBe(unassignedAgent); // Unchanged
      });

      it('should apply team performance bonus', async () => {
        const { calculateQuestXpReward, applyXpToAgent } = await import('../../src/utils/xpCalculator');
        
        vi.mocked(calculateQuestXpReward).mockReturnValue(100);
        vi.mocked(applyXpToAgent).mockImplementation((agent, xp) => ({
          updatedAgent: { ...agent, xp: agent.xp + xp },
          leveledUp: false
        }));

        await manager.processQuestCompletion(
          mockQuest, 
          [mockAgent], 
          { teamPerformanceBonus: 1.5 }
        );

        expect(applyXpToAgent).toHaveBeenCalledWith(
          mockAgent,
          150, // 100 * 1.5
          expect.stringContaining('Quest:')
        );
      });
    });

    describe('Notification System', () => {
      it('should create level up notifications', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, level: 6 },
          leveledUp: true,
          newLevel: 6
        });

        const result = await manager.processXpGain(mockAgent, 200, 'test');

        expect(result.notifications).toHaveLength(1);
        expect(result.notifications[0].type).toBe('level_up');
        expect(result.notifications[0].title).toBe('Level Up! 🎉');
      });

      it('should create skill unlock notifications', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, level: 6 },
          leveledUp: true,
          newLevel: 6,
          unlockedSkills: ['Skill A', 'Skill B']
        });

        const result = await manager.processXpGain(mockAgent, 200, 'test');

        expect(result.notifications.length).toBe(3); // 1 level up + 2 skill unlocks
        expect(result.notifications.filter(n => n.type === 'skill_unlock')).toHaveLength(2);
      });

      it('should dismiss notifications', () => {
        const notification = {
          id: 'test_notification',
          type: 'level_up' as const,
          title: 'Test',
          message: 'Test message',
          icon: '🎉',
          priority: 'high' as const,
          timestamp: new Date(),
          dismissed: false
        };

        (manager as unknown).progressionState.activeNotifications.push(notification);
        
        manager.dismissNotification('test_notification');
        
        expect(notification.dismissed).toBe(true);
      });

      it('should clear dismissed notifications', () => {
        const notifications = [
          { id: '1', dismissed: true },
          { id: '2', dismissed: false },
          { id: '3', dismissed: true }
        ];

        (manager as unknown).progressionState.activeNotifications = notifications;
        
        manager.clearDismissedNotifications();
        
        const state = manager.getProgressionState();
        expect(state.activeNotifications).toHaveLength(1);
        expect(state.activeNotifications[0].id).toBe('2');
      });
    });

    describe('Level Up Queue Management', () => {
      it('should queue level up events', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, level: 6 },
          leveledUp: true,
          newLevel: 6
        });

        await manager.processXpGain(mockAgent, 200, 'test');

        const state = manager.getProgressionState();
        expect(state.levelUpQueue).toHaveLength(1);
        expect(state.levelUpQueue[0].newLevel).toBe(6);
      });

      it('should return next level up event from queue', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: { ...mockAgent, level: 6 },
          leveledUp: true,
          newLevel: 6
        });

        await manager.processXpGain(mockAgent, 200, 'test');

        const levelUpEvent = manager.getNextLevelUpEvent();
        
        expect(levelUpEvent).toBeDefined();
        expect(levelUpEvent?.newLevel).toBe(6);
        
        // Should be removed from queue
        const state = manager.getProgressionState();
        expect(state.levelUpQueue).toHaveLength(0);
      });
    });

    describe('Stat Increase Calculation', () => {
      it('should calculate milestone stat increases', () => {
        const increases = (manager as unknown).calculateStatIncreases(4, 5);
        
        expect(increases).toHaveLength(1);
        expect(increases[0].stat).toBe('intelligence');
        expect(increases[0].amount).toBe(2);
        expect(increases[0].reason).toBe('Novice Milestone');
      });

      it('should calculate multiple milestone increases', () => {
        const increases = (manager as unknown).calculateStatIncreases(8, 10);
        
        expect(increases.length).toBeGreaterThan(1);
        expect(increases.some((inc: unknown) => inc.stat === 'creativity')).toBe(true);
        expect(increases.some((inc: unknown) => inc.stat === 'leadership')).toBe(true);
      });

      it('should not calculate increases for non-milestone levels', () => {
        const increases = (manager as unknown).calculateStatIncreases(6, 7);
        
        expect(increases).toHaveLength(0);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('processAgentXpGain', () => {
      it('should use global progression manager', async () => {
        const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: mockAgent,
          leveledUp: false
        });

        const result = await processAgentXpGain(mockAgent, 100, 'test');
        
        expect(result.updatedAgent).toBeDefined();
        expect(result.levelUpEvent).toBeUndefined();
        expect(result.notifications).toBeDefined();
      });
    });

    describe('processQuestCompletion', () => {
      it('should use global progression manager', async () => {
        const { calculateQuestXpReward, applyXpToAgent } = await import('../../src/utils/xpCalculator');
        
        vi.mocked(calculateQuestXpReward).mockReturnValue(150);
        vi.mocked(applyXpToAgent).mockReturnValue({
          updatedAgent: mockAgent,
          leveledUp: false
        });

        const result = await processQuestCompletion(mockQuest, [mockAgent]);
        
        expect(result.updatedAgents).toHaveLength(1);
        expect(result.levelUpEvents).toHaveLength(0);
        expect(result.notifications).toBeDefined();
      });
    });

    describe('generateLevelUpAnimation', () => {
      it('should generate animation configuration', () => {
        const levelUpEvent = {
          agentId: 1,
          oldLevel: 5,
          newLevel: 6,
          xpGained: 200,
          source: 'test',
          unlockedSkills: [],
          statIncreases: [],
          timestamp: new Date()
        };

        const animation = generateLevelUpAnimation(levelUpEvent);
        
        expect(animation.agentId).toBe(1);
        expect(animation.animations).toBeDefined();
        expect(animation.animations.length).toBeGreaterThan(0);
        
        // Check for expected animation types
        const animationTypes = animation.animations.map(a => a.type);
        expect(animationTypes).toContain('scale');
        expect(animationTypes).toContain('glow');
        expect(animationTypes).toContain('particles');
      });

      it('should include proper animation properties', () => {
        const levelUpEvent = {
          agentId: 1,
          oldLevel: 5,
          newLevel: 6,
          xpGained: 200,
          source: 'test',
          unlockedSkills: [],
          statIncreases: [],
          timestamp: new Date()
        };

        const animation = generateLevelUpAnimation(levelUpEvent);
        
        animation.animations.forEach(anim => {
          expect(anim.duration).toBeGreaterThan(0);
          if (anim.type === 'scale') {
            expect(anim.from).toBeDefined();
            expect(anim.to).toBeDefined();
            expect(anim.easing).toBeDefined();
          }
        });
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle errors during XP processing gracefully', async () => {
      const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
      vi.mocked(applyXpToAgent).mockRejectedValue(new Error('XP calculation failed'));

      await expect(manager.processXpGain(mockAgent, 100, 'error test'))
        .rejects.toThrow('XP calculation failed');
      
      // Should not be processing after error
      expect(manager.getProgressionState().isProcessing).toBe(false);
    });

    it('should handle missing agent data', async () => {
      const incompleteAgent = { ...mockAgent } as unknown;
      delete incompleteAgent.realtimeActivity;
      delete incompleteAgent.stats;

      const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
      vi.mocked(applyXpToAgent).mockReturnValue({
        updatedAgent: incompleteAgent,
        leveledUp: false
      });

      await expect(manager.processXpGain(incompleteAgent, 100, 'test'))
        .resolves.toBeDefined();
    });

    it('should handle concurrent processing attempts', async () => {
      const { applyXpToAgent } = await import('../../src/utils/xpCalculator');
      vi.mocked(applyXpToAgent).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            updatedAgent: mockAgent,
            leveledUp: false
          }), 100)
        )
      );

      const promise1 = manager.processXpGain(mockAgent, 100, 'test1');
      const promise2 = manager.processXpGain(mockAgent, 100, 'test2');

      const results = await Promise.all([promise1, promise2]);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });

    it('should handle invalid notification IDs', () => {
      expect(() => manager.dismissNotification('nonexistent')).not.toThrow();
    });

    it('should handle empty level up queue', () => {
      const levelUpEvent = manager.getNextLevelUpEvent();
      expect(levelUpEvent).toBeUndefined();
    });
  });

  describe('Memory Management', () => {
    it('should properly manage event history', () => {
      // Add events beyond the limit
      for (let i = 0; i < 120; i++) {
        (manager as unknown).emit({
          type: 'xp_gained',
          agentId: 1,
          data: { amount: i },
          timestamp: new Date()
        });
      }

      const state = manager.getProgressionState();
      expect(state.recentEvents.length).toBeLessThanOrEqual(100);
    });

    it('should handle notification cleanup', () => {
      const oldNotification = {
        id: 'old',
        type: 'level_up' as const,
        title: 'Old',
        message: 'Old message',
        icon: '🎉',
        priority: 'high' as const,
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        dismissed: true
      };

      (manager as unknown).progressionState.activeNotifications.push(oldNotification);
      
      manager.clearDismissedNotifications();
      
      const state = manager.getProgressionState();
      expect(state.activeNotifications).toHaveLength(0);
    });
  });
});