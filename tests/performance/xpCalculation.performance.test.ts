import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateXpToNextLevel,
  calculateLevelFromXp,
  calculateQuestXpReward,
  applyXpToAgent,
  distributeTeamXp
} from '../../src/utils/xpCalculator';
import { LevelProgressionManager } from '../../src/utils/levelProgression';
import { Agent } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';

describe('XP Calculation Performance Tests', () => {
  let mockAgent: Agent;
  let mockQuest: Quest;
  let manager: LevelProgressionManager;

  beforeEach(() => {
    manager = new LevelProgressionManager();
    
    mockAgent = {
      id: 1,
      name: 'Performance Test Agent',
      class: 'Code Master',
      level: 5,
      xp: 450,
      xpToNext: 550,
      stats: { intelligence: 75, creativity: 65, reliability: 85, speed: 70, leadership: 60 },
      specializations: ['Performance Testing'],
      currentMission: 'Available',
      personality: 'Efficient',
      avatar: '⚡',
      knowledgeBase: {
        totalMemories: 100,
        recentLearning: 'Performance optimization',
        knowledgeDomains: {},
        crawlingProgress: { active: false, lastUrl: '', pagesLearned: 0, knowledgeGained: 0 }
      },
      equipment: { primary: 'Benchmark Suite', secondary: 'Profiler', utility: 'Load Tester' },
      relationships: [],
      skillTree: {},
      realtimeActivity: []
    };

    mockQuest = {
      id: 'perf_quest',
      title: 'Performance Quest',
      description: 'Test system performance',
      type: 'main',
      category: 'Investigation',
      difficulty: 'Medium',
      status: 'available',
      icon: '⚡',
      objectives: [
        { id: '1', description: 'Benchmark system', completed: false, progress: 0, maxProgress: 1 }
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
  });

  describe('Basic XP Calculations', () => {
    it('should calculate XP to next level efficiently for high levels', () => {
      const startTime = performance.now();
      
      // Test with high level values
      for (let level = 1; level <= 100; level++) {
        const xp = calculateXpToNextLevel(level);
        expect(xp).toBeGreaterThan(0);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
    });

    it('should calculate level from XP efficiently for large XP values', () => {
      const startTime = performance.now();
      
      // Test with various XP amounts
      const xpValues = [100, 1000, 10000, 100000, 1000000];
      
      xpValues.forEach(xp => {
        const result = calculateLevelFromXp(xp);
        expect(result.level).toBeGreaterThan(0);
        expect(result.currentLevelXp).toBeGreaterThanOrEqual(0);
        expect(result.xpToNext).toBeGreaterThan(0);
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should handle batch level calculations efficiently', () => {
      const startTime = performance.now();
      const batchSize = 1000;
      const results = [];
      
      for (let i = 0; i < batchSize; i++) {
        const xp = i * 100; // Vary XP amounts
        results.push(calculateLevelFromXp(xp));
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(results).toHaveLength(batchSize);
    });
  });

  describe('Quest XP Reward Calculations', () => {
    it('should calculate quest rewards efficiently', () => {
      const startTime = performance.now();
      
      // Test with various completion scenarios
      for (let i = 0; i < 100; i++) {
        const completionTime = 30 + (i % 60); // Vary completion times
        const optionalObjectives = i % 3; // Vary optional completions
        
        const xp = calculateQuestXpReward(
          mockQuest,
          mockAgent,
          completionTime,
          optionalObjectives
        );
        
        expect(xp).toBeGreaterThan(0);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle complex quest calculations efficiently', () => {
      // Create complex quest with many modifiers
      const complexQuest = {
        ...mockQuest,
        difficulty: 'Expert' as const,
        assignedAgents: [1, 2, 3, 4], // Team quest
        timeLimit: 180,
        bonusRewards: { xp: 200 },
        objectives: Array(10).fill(null).map((_, i) => ({
          id: `obj_${i}`,
          description: `Objective ${i}`,
          completed: false,
          progress: 0,
          maxProgress: 1,
          optional: i > 5 // Half are optional
        }))
      };

      // Agent with activity history
      const activeAgent = {
        ...mockAgent,
        realtimeActivity: Array(20).fill(null).map((_, i) => ({
          timestamp: new Date().toISOString(),
          action: `Activity ${i}`,
          xpGained: 10
        }))
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const xp = calculateQuestXpReward(
          complexQuest,
          activeAgent,
          90, // Fast completion
          5   // Many optional objectives
        );
        
        expect(xp).toBeGreaterThan(complexQuest.rewards.xp);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
    });
  });

  describe('Agent XP Application', () => {
    it('should apply XP to agents efficiently', () => {
      const startTime = performance.now();
      
      let currentAgent = { ...mockAgent };
      
      // Apply many small XP gains
      for (let i = 0; i < 100; i++) {
        const result = applyXpToAgent(currentAgent, 10, `Micro gain ${i}`);
        currentAgent = result.updatedAgent;
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(currentAgent.xp).toBeGreaterThan(mockAgent.xp);
    });

    it('should handle level up calculations efficiently', () => {
      const startTime = performance.now();
      
      let currentAgent = { ...mockAgent };
      const levelUpResults = [];
      
      // Apply XP that triggers level ups
      for (let i = 0; i < 20; i++) {
        const result = applyXpToAgent(currentAgent, 500, `Major gain ${i}`);
        currentAgent = result.updatedAgent;
        
        if (result.leveledUp) {
          levelUpResults.push(result);
        }
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(150); // Should complete in under 150ms
      expect(levelUpResults.length).toBeGreaterThan(0);
    });

    it('should manage activity history efficiently', () => {
      const agentWithHistory = {
        ...mockAgent,
        realtimeActivity: Array(49).fill(null).map((_, i) => ({
          timestamp: new Date().toISOString(),
          action: `Old activity ${i}`
        }))
      };

      const startTime = performance.now();
      
      // Add activities that should trigger history management
      let currentAgent = agentWithHistory;
      for (let i = 0; i < 50; i++) {
        const result = applyXpToAgent(currentAgent, 5, `New activity ${i}`);
        currentAgent = result.updatedAgent;
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      
      // Should maintain activity limit
      expect(currentAgent.realtimeActivity).toHaveLength(50);
    });
  });

  describe('Team XP Distribution', () => {
    it('should distribute XP to large teams efficiently', () => {
      // Create large team
      const largeTeam: Agent[] = Array(50).fill(null).map((_, i) => ({
        ...mockAgent,
        id: i + 1,
        name: `Agent ${i + 1}`
      }));

      const startTime = performance.now();
      
      // Test equal distribution
      const equalDistribution = distributeTeamXp(10000, largeTeam);
      
      // Test weighted distribution
      const weights: { [key: number]: number } = {};
      largeTeam.forEach((agent, i) => {
        weights[agent.id] = (i % 5) + 1; // Varying weights 1-5
      });
      const weightedDistribution = distributeTeamXp(10000, largeTeam, weights);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      
      expect(Object.keys(equalDistribution)).toHaveLength(50);
      expect(Object.keys(weightedDistribution)).toHaveLength(50);
    });

    it('should handle complex team calculations efficiently', () => {
      const complexTeam: Agent[] = Array(20).fill(null).map((_, i) => ({
        ...mockAgent,
        id: i + 1,
        name: `Complex Agent ${i + 1}`,
        level: 1 + (i % 10), // Varying levels
        class: ['Code Master', 'Data Sage', 'Creative Bard'][i % 3] // Varying classes
      }));

      const startTime = performance.now();
      
      // Distribute XP multiple times with different parameters
      for (let iteration = 0; iteration < 10; iteration++) {
        const xpAmount = 1000 + (iteration * 500);
        const weights: { [key: number]: number } = {};
        
        complexTeam.forEach(agent => {
          weights[agent.id] = agent.level; // Level-based weighting
        });
        
        const distribution = distributeTeamXp(xpAmount, complexTeam, weights);
        expect(Object.keys(distribution)).toHaveLength(20);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('Level Progression Manager Performance', () => {
    it('should handle many concurrent XP awards efficiently', async () => {
      const startTime = performance.now();
      const promises = [];
      
      // Create many concurrent XP processing requests
      for (let i = 0; i < 50; i++) {
        const testAgent = { ...mockAgent, id: i, xp: 400 + i };
        promises.push(manager.processXpGain(testAgent, 100 + i, `Concurrent test ${i}`));
      }
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(results).toHaveLength(50);
      
      // All should be processed successfully
      results.forEach(result => {
        expect(result.updatedAgent).toBeDefined();
        expect(result.updatedAgent.xp).toBeGreaterThan(400);
      });
    });

    it('should handle many quest completions efficiently', async () => {
      const startTime = performance.now();
      const promises = [];
      
      // Create team of agents
      const team: Agent[] = Array(10).fill(null).map((_, i) => ({
        ...mockAgent,
        id: i + 1,
        name: `Team Member ${i + 1}`,
        xp: 400 + (i * 50)
      }));

      // Process multiple quest completions
      for (let i = 0; i < 20; i++) {
        const quest = {
          ...mockQuest,
          id: `quest_${i}`,
          assignedAgents: team.map(a => a.id)
        };
        
        promises.push(manager.processQuestCompletion(quest, team));
      }
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(results).toHaveLength(20);
      
      // All should be processed successfully
      results.forEach(result => {
        expect(result.updatedAgents).toHaveLength(10);
      });
    });

    it('should manage event history efficiently under load', async () => {
      const startTime = performance.now();
      
      // Generate many events to test history management
      for (let i = 0; i < 200; i++) {
        const testAgent = { ...mockAgent, id: i % 10 };
        await manager.processXpGain(testAgent, 10, `History test ${i}`);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(3000); // Should complete in under 3 seconds
      
      // Verify history is managed (should not exceed 100 events)
      const state = manager.getProgressionState();
      expect(state.recentEvents.length).toBeLessThanOrEqual(100);
    });

    it('should handle notification management efficiently', async () => {
      const startTime = performance.now();
      
      // Generate level ups to create many notifications
      for (let i = 0; i < 30; i++) {
        const testAgent = { ...mockAgent, id: i, xp: 400 };
        await manager.processXpGain(testAgent, 500, `Notification test ${i}`);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
      
      const state = manager.getProgressionState();
      expect(state.activeNotifications.length).toBeGreaterThan(0);
      
      // Test notification cleanup
      const cleanupStartTime = performance.now();
      
      state.activeNotifications.forEach(notification => {
        manager.dismissNotification(notification.id);
      });
      manager.clearDismissedNotifications();
      
      const cleanupEndTime = performance.now();
      expect(cleanupEndTime - cleanupStartTime).toBeLessThan(50); // Cleanup should be fast
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during intensive operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform intensive operations
      for (let i = 0; i < 100; i++) {
        const testAgent = { ...mockAgent, id: i };
        
        // XP calculations
        calculateLevelFromXp(i * 1000);
        calculateQuestXpReward(mockQuest, testAgent);
        
        // Level progression
        await manager.processXpGain(testAgent, 100, `Memory test ${i}`);
        
        // Force garbage collection periodically
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }
      
      // Force final garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 20MB)
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
    });

    it('should efficiently manage large activity histories', () => {
      const startTime = performance.now();
      
      // Create agent with large activity history
      const agentWithLargeHistory = {
        ...mockAgent,
        realtimeActivity: Array(1000).fill(null).map((_, i) => ({
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          action: `Activity ${i}`,
          xpGained: i % 2 === 0 ? 10 : undefined
        }))
      };
      
      // Perform operations that need to process the history
      for (let i = 0; i < 20; i++) {
        const result = applyXpToAgent(agentWithLargeHistory, 50, `Large history test ${i}`);
        expect(result.updatedAgent.realtimeActivity).toHaveLength(50); // Should be trimmed
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should handle efficiently
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme XP values gracefully', () => {
      const startTime = performance.now();
      
      // Test with extreme values
      const extremeValues = [0, 1, 999999999, Number.MAX_SAFE_INTEGER / 2];
      
      extremeValues.forEach(xp => {
        const result = calculateLevelFromXp(xp);
        expect(result.level).toBeGreaterThan(0);
        expect(Number.isFinite(result.level)).toBe(true);
        expect(Number.isFinite(result.currentLevelXp)).toBe(true);
        expect(Number.isFinite(result.xpToNext)).toBe(true);
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should maintain accuracy under computational load', () => {
      const iterations = 1000;
      const results: number[] = [];
      
      const startTime = performance.now();
      
      // Perform same calculation many times
      for (let i = 0; i < iterations; i++) {
        const xp = calculateXpToNextLevel(10);
        results.push(xp);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
      
      // All results should be identical (deterministic)
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toBe(firstResult);
      });
    });

    it('should handle rapid state changes in progression manager', async () => {
      const startTime = performance.now();
      const operations = [];
      
      // Rapid fire operations
      for (let i = 0; i < 100; i++) {
        const operation = async () => {
          const testAgent = { ...mockAgent, id: i, xp: 400 + (i % 50) };
          return manager.processXpGain(testAgent, 50 + (i % 100), `Rapid test ${i}`);
        };
        
        operations.push(operation());
      }
      
      const results = await Promise.all(operations);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(results).toHaveLength(100);
      
      // Manager should remain in consistent state
      const finalState = manager.getProgressionState();
      expect(finalState).toBeDefined();
      expect(finalState.recentEvents.length).toBeLessThanOrEqual(100);
    });
  });
});