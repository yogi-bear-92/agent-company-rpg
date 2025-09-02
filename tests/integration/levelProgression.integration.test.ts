import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  LevelProgressionManager, 
  processAgentXpGain,
  processQuestCompletion 
} from '../../src/utils/levelProgression';
import { Agent } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';

describe('Level Progression Integration Tests', () => {
  let mockAgent: Agent;
  let mockQuest: Quest;
  let manager: LevelProgressionManager;

  beforeEach(() => {
    manager = new LevelProgressionManager();
    
    mockAgent = {
      id: 1,
      name: 'Integration Test Agent',
      class: 'Code Master',
      level: 5,
      xp: 450,
      xpToNext: 550,
      stats: { intelligence: 75, creativity: 65, reliability: 85, speed: 70, leadership: 60 },
      specializations: ['JavaScript', 'Testing'],
      currentMission: 'Available',
      personality: 'Methodical',
      avatar: '🧪',
      knowledgeBase: {
        totalMemories: 100,
        recentLearning: 'Integration testing',
        knowledgeDomains: { testing: 90 },
        crawlingProgress: { active: false, lastUrl: '', pagesLearned: 0, knowledgeGained: 0 }
      },
      equipment: { primary: 'Test Framework', secondary: 'Assertion Library', utility: 'Mock Tools' },
      relationships: [],
      skillTree: {},
      realtimeActivity: []
    };

    mockQuest = {
      id: 'integration_quest',
      title: 'Integration Testing Quest',
      description: 'Master the art of integration testing',
      type: 'main',
      category: 'Investigation',
      difficulty: 'Medium',
      status: 'available',
      icon: '🔬',
      objectives: [
        { id: '1', description: 'Write integration tests', completed: false, progress: 0, maxProgress: 1 }
      ],
      currentObjectiveIndex: 0,
      progressPercentage: 0,
      requirements: { minLevel: 3 },
      rewards: { xp: 400, gold: 100, items: ['Integration Badge'] },
      assignedAgents: [1],
      recommendedTeamSize: 1,
      autoAssign: false,
      dialogue: [],
      createdAt: new Date(),
      repeatable: false
    };
  });

  describe('XP Award and Level Up Flow', () => {
    it('should handle complete XP award workflow without level up', async () => {
      const eventHandler = vi.fn();
      manager.on('xp_gained', eventHandler);

      const result = await manager.processXpGain(mockAgent, 50, 'Integration Test');

      // Verify updated agent
      expect(result.updatedAgent.xp).toBe(500);
      expect(result.updatedAgent.level).toBe(5);
      expect(result.leveledUp).toBe(false);
      expect(result.levelUpEvent).toBeUndefined();

      // Verify event was emitted
      expect(eventHandler).toHaveBeenCalled();
      const emittedEvent = eventHandler.mock.calls[0][0];
      expect(emittedEvent.type).toBe('xp_gained');
      expect(emittedEvent.agentId).toBe(1);

      // Verify activity was recorded
      expect(result.updatedAgent.realtimeActivity[0]).toMatchObject({
        action: 'Integration Test',
        xpGained: 50
      });

      // Verify state management
      const state = manager.getProgressionState();
      expect(state.recentEvents).toHaveLength(1);
      expect(state.levelUpQueue).toHaveLength(0);
    });

    it('should handle complete level up workflow', async () => {
      const levelUpHandler = vi.fn();
      const xpHandler = vi.fn();
      
      manager.on('level_up', levelUpHandler);
      manager.on('xp_gained', xpHandler);

      // Award enough XP to trigger level up
      const result = await manager.processXpGain(mockAgent, 200, 'Major Achievement');

      // Verify level up occurred
      expect(result.leveledUp).toBe(true);
      expect(result.levelUpEvent).toBeDefined();
      expect(result.updatedAgent.level).toBeGreaterThan(5);

      // Verify events were emitted in correct order
      expect(xpHandler).toHaveBeenCalled();
      expect(levelUpHandler).toHaveBeenCalled();

      // Verify level up event structure
      const levelUpEvent = result.levelUpEvent!;
      expect(levelUpEvent.agentId).toBe(1);
      expect(levelUpEvent.oldLevel).toBe(5);
      expect(levelUpEvent.newLevel).toBeGreaterThan(5);
      expect(levelUpEvent.xpGained).toBe(200);
      expect(levelUpEvent.source).toBe('Major Achievement');

      // Verify notifications were created
      expect(result.notifications.length).toBeGreaterThan(0);
      const levelUpNotification = result.notifications.find(n => n.type === 'level_up');
      expect(levelUpNotification).toBeDefined();

      // Verify queue management
      const state = manager.getProgressionState();
      expect(state.levelUpQueue).toHaveLength(1);
      expect(state.levelUpQueue[0]).toEqual(levelUpEvent);
    });

    it('should handle multiple rapid level ups', async () => {
      // Award massive XP to trigger multiple level ups
      const result = await manager.processXpGain(mockAgent, 2000, 'Epic Achievement');

      expect(result.leveledUp).toBe(true);
      expect(result.updatedAgent.level).toBeGreaterThan(6);
      
      // Should handle stat bonuses correctly
      expect(result.updatedAgent.stats.intelligence).toBeGreaterThan(mockAgent.stats.intelligence);
      
      // Should have multiple stat increases for major milestone
      if (result.levelUpEvent && result.levelUpEvent.statIncreases) {
        expect(result.levelUpEvent.statIncreases.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Quest Completion Integration', () => {
    it('should handle complete quest completion workflow', async () => {
      const questHandler = vi.fn();
      manager.on('quest_completed', questHandler);

      const result = await manager.processQuestCompletion(mockQuest, [mockAgent]);

      // Verify agent was updated with XP
      expect(result.updatedAgents).toHaveLength(1);
      expect(result.updatedAgents[0].xp).toBeGreaterThan(mockAgent.xp);

      // Verify quest completion event was emitted
      expect(questHandler).toHaveBeenCalled();

      // Verify XP calculation considered quest parameters
      const xpGained = result.updatedAgents[0].xp - mockAgent.xp;
      expect(xpGained).toBeGreaterThan(mockQuest.rewards.xp); // Should include multipliers
    });

    it('should handle quest completion with level up', async () => {
      // Use high-XP quest to trigger level up
      const highXpQuest = {
        ...mockQuest,
        rewards: { ...mockQuest.rewards, xp: 1000 }
      };

      const result = await manager.processQuestCompletion(highXpQuest, [mockAgent]);

      // Should have level up events
      expect(result.levelUpEvents.length).toBeGreaterThan(0);
      
      // Should have notifications
      expect(result.notifications.length).toBeGreaterThan(0);
      
      // Should have both XP and level up notifications
      const levelUpNotifications = result.notifications.filter(n => n.type === 'level_up');
      expect(levelUpNotifications.length).toBeGreaterThan(0);
    });

    it('should handle team quest completion', async () => {
      const agent2: Agent = { 
        ...mockAgent, 
        id: 2, 
        name: 'Team Member',
        level: 3,
        xp: 200,
        xpToNext: 300
      };

      const teamQuest = {
        ...mockQuest,
        assignedAgents: [1, 2]
      };

      const result = await manager.processQuestCompletion(teamQuest, [mockAgent, agent2]);

      // Both agents should be updated
      expect(result.updatedAgents).toHaveLength(2);
      expect(result.updatedAgents[0].xp).toBeGreaterThan(mockAgent.xp);
      expect(result.updatedAgents[1].xp).toBeGreaterThan(agent2.xp);

      // Team bonus should apply
      const agent1XpGain = result.updatedAgents[0].xp - mockAgent.xp;
      const agent2XpGain = result.updatedAgents[1].xp - agent2.xp;
      
      // XP should include team synergy bonus
      expect(agent1XpGain).toBeGreaterThan(mockQuest.rewards.xp);
      expect(agent2XpGain).toBeGreaterThan(mockQuest.rewards.xp);
    });

    it('should handle quest completion with performance bonuses', async () => {
      const completionData = {
        completionTime: 30, // Fast completion (half of 60 min default)
        optionalObjectivesCompleted: 2,
        teamPerformanceBonus: 1.5
      };

      const questWithOptionals = {
        ...mockQuest,
        timeLimit: 60,
        objectives: [
          ...mockQuest.objectives,
          { id: '2', description: 'Optional 1', completed: true, progress: 1, maxProgress: 1, optional: true },
          { id: '3', description: 'Optional 2', completed: true, progress: 1, maxProgress: 1, optional: true }
        ],
        bonusRewards: { xp: 100 }
      };

      const result = await manager.processQuestCompletion(
        questWithOptionals, 
        [mockAgent], 
        completionData
      );

      const xpGained = result.updatedAgents[0].xp - mockAgent.xp;
      
      // Should include time bonus, optional objectives bonus, and team performance bonus
      expect(xpGained).toBeGreaterThan(questWithOptionals.rewards.xp * 1.5);
    });
  });

  describe('Global Helper Functions Integration', () => {
    it('should integrate processAgentXpGain with global manager', async () => {
      const result = await processAgentXpGain(mockAgent, 100, 'Global Helper Test');

      expect(result.updatedAgent.xp).toBe(550);
      expect(result.updatedAgent.realtimeActivity[0]).toMatchObject({
        action: 'Global Helper Test',
        xpGained: 100
      });
    });

    it('should integrate processQuestCompletion with global manager', async () => {
      const result = await processQuestCompletion(mockQuest, [mockAgent]);

      expect(result.updatedAgents).toHaveLength(1);
      expect(result.updatedAgents[0].xp).toBeGreaterThan(mockAgent.xp);
    });
  });

  describe('State Persistence and Recovery', () => {
    it('should maintain state consistency across multiple operations', async () => {
      // Perform multiple operations
      await manager.processXpGain(mockAgent, 50, 'First Operation');
      
      const updatedAgent = { ...mockAgent, xp: 500 };
      await manager.processXpGain(updatedAgent, 75, 'Second Operation');
      
      const state = manager.getProgressionState();
      
      // Should have all events recorded
      expect(state.recentEvents).toHaveLength(2);
      expect(state.recentEvents[0].type).toBe('xp_gained');
      expect(state.recentEvents[1].type).toBe('xp_gained');
    });

    it('should handle notification lifecycle correctly', async () => {
      // Trigger level up to create notifications
      const result = await manager.processXpGain(mockAgent, 200, 'Notification Test');
      
      if (result.leveledUp) {
        const state = manager.getProgressionState();
        expect(state.activeNotifications.length).toBeGreaterThan(0);

        // Dismiss a notification
        const notificationId = state.activeNotifications[0].id;
        manager.dismissNotification(notificationId);

        // Clear dismissed notifications
        manager.clearDismissedNotifications();

        const updatedState = manager.getProgressionState();
        expect(updatedState.activeNotifications.length).toBeLessThan(state.activeNotifications.length);
      }
    });

    it('should manage level up queue correctly', async () => {
      // Trigger multiple level ups
      await manager.processXpGain(mockAgent, 2000, 'Queue Test');
      
      const state = manager.getProgressionState();
      expect(state.levelUpQueue.length).toBeGreaterThan(0);

      // Process level up queue
      const levelUpEvent = manager.getNextLevelUpEvent();
      expect(levelUpEvent).toBeDefined();

      // Queue should be reduced
      const updatedState = manager.getProgressionState();
      expect(updatedState.levelUpQueue.length).toBe(state.levelUpQueue.length - 1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent processing gracefully', async () => {
      const promises = [];
      
      // Start multiple concurrent operations
      for (let i = 0; i < 5; i++) {
        promises.push(manager.processXpGain(mockAgent, 10, `Concurrent ${i}`));
      }

      const results = await Promise.all(promises);
      
      // All should complete successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.updatedAgent).toBeDefined();
      });
    });

    it('should handle invalid agent data gracefully', async () => {
      const invalidAgent = {
        ...mockAgent,
        stats: null,
        realtimeActivity: null
      } as unknown;

      await expect(manager.processXpGain(invalidAgent, 100, 'Invalid Test'))
        .resolves.toBeDefined();
    });

    it('should handle quest with missing assigned agents', async () => {
      const questWithoutAssignedAgents = {
        ...mockQuest,
        assignedAgents: []
      };

      const result = await manager.processQuestCompletion(
        questWithoutAssignedAgents, 
        [mockAgent]
      );

      // Agent should not receive XP since not assigned
      expect(result.updatedAgents[0]).toEqual(mockAgent);
    });

    it('should handle quest with agents not in provided list', async () => {
      const questWithMissingAgents = {
        ...mockQuest,
        assignedAgents: [1, 999] // Agent 999 doesn't exist
      };

      await expect(
        manager.processQuestCompletion(questWithMissingAgents, [mockAgent])
      ).resolves.toBeDefined();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle large numbers of events efficiently', async () => {
      const startTime = performance.now();
      
      // Process many small XP gains
      for (let i = 0; i < 100; i++) {
        await manager.processXpGain(mockAgent, 1, `Micro Award ${i}`);
        mockAgent.xp += 1; // Update for next iteration
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second

      // Verify event history is managed
      const state = manager.getProgressionState();
      expect(state.recentEvents.length).toBeLessThanOrEqual(100);
    });

    it('should manage memory efficiently with many notifications', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create many level up events
      for (let i = 0; i < 50; i++) {
        await manager.processXpGain(
          { ...mockAgent, id: i, xp: 450 + i }, 
          200, 
          `Memory Test ${i}`
        );
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Event System Integration', () => {
    it('should handle complex event listener scenarios', async () => {
      const events: unknown[] = [];
      
      const eventLogger = (event: unknown) => events.push(event);
      
      manager.on('xp_gained', eventLogger);
      manager.on('level_up', eventLogger);
      manager.on('quest_completed', eventLogger);

      // Trigger multiple event types
      await manager.processXpGain(mockAgent, 200, 'Event Test');
      await manager.processQuestCompletion(mockQuest, [mockAgent]);

      // Should have recorded all events
      expect(events.length).toBeGreaterThanOrEqual(3);
      
      const eventTypes = events.map(e => e.type);
      expect(eventTypes).toContain('xp_gained');
      expect(eventTypes).toContain('quest_completed');
      
      if (events.some(e => e.type === 'level_up')) {
        expect(eventTypes).toContain('level_up');
      }
    });

    it('should handle event listener errors gracefully', async () => {
      const faultyHandler = () => {
        throw new Error('Handler error');
      };

      manager.on('xp_gained', faultyHandler);

      // Should not break processing
      await expect(manager.processXpGain(mockAgent, 50, 'Error Test'))
        .resolves.toBeDefined();
    });
  });
});