// Performance benchmarks for XP calculation system
import { bench, describe } from 'vitest';
import { performanceTestUtils } from './setup-performance-tests';
import * as originalXpCalc from '../../src/utils/xpCalculator';
import { optimizedUtils } from '../optimization/xp-calculator-optimized';

describe('XP Calculator Performance Benchmarks', () => {
  const testAgents = performanceTestUtils.generateTestData.agents(100);
  const testQuest = {
    id: 'benchmark-quest',
    title: 'Benchmark Quest',
    description: 'Performance test quest',
    type: 'side' as const,
    category: 'Investigation' as const,
    difficulty: 'Medium' as const,
    status: 'active' as const,
    icon: '⚔️',
    objectives: [
      { id: '1', description: 'Test', completed: true, progress: 1, maxProgress: 1 },
      { id: '2', description: 'Optional', completed: true, progress: 1, maxProgress: 1, optional: true }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 100,
    requirements: {},
    rewards: { xp: 150 },
    bonusRewards: { xp: 50 },
    assignedAgents: [1, 2],
    recommendedTeamSize: 2,
    autoAssign: false,
    dialogue: [],
    createdAt: new Date(),
    repeatable: false,
    timeLimit: 60
  };

  bench('Original XP calculation - single agent', () => {
    originalXpCalc.calculateQuestXpReward(testQuest, testAgents[0], 30, 2);
  });

  bench('Optimized XP calculation - single agent', () => {
    optimizedUtils.calculateQuestXpRewardOptimized(testQuest, testAgents[0], {
      completionTime: 30,
      optionalObjectivesCompleted: 2
    });
  });

  bench('Original XP calculation - 100 agents', () => {
    testAgents.forEach(agent => {
      originalXpCalc.calculateQuestXpReward(testQuest, agent, 30, 2);
    });
  });

  bench('Optimized XP calculation - 100 agents', () => {
    testAgents.forEach(agent => {
      optimizedUtils.calculateQuestXpRewardOptimized(testQuest, agent, {
        completionTime: 30,
        optionalObjectivesCompleted: 2
      });
    });
  });

  bench('Batch XP calculation - 100 agents', () => {
    const questAgentPairs = testAgents.map(agent => ({ 
      quest: testQuest, 
      agent, 
      completionData: { completionTime: 30, optionalObjectivesCompleted: 2 }
    }));
    optimizedUtils.batchCalculateXpRewards(questAgentPairs);
  });

  bench('Original level calculation - 1000 XP values', () => {
    for (let xp = 0; xp <= 50000; xp += 50) {
      originalXpCalc.calculateLevelFromXp(xp);
    }
  });

  bench('Optimized level calculation - 1000 XP values', () => {
    for (let xp = 0; xp <= 50000; xp += 50) {
      optimizedUtils.calculateLevelFromXp(xp);
    }
  });

  bench('Batch level calculation - 100 agents', () => {
    optimizedUtils.batchCalculateLevels(testAgents);
  });

  bench('Original XP application - 100 agents', () => {
    testAgents.forEach(agent => {
      originalXpCalc.applyXpToAgent(agent, 100, 'Benchmark test');
    });
  });

  bench('Batch XP application - 100 agents', () => {
    const xpAwards = testAgents.map(agent => ({
      agentId: agent.id,
      amount: 100,
      source: 'Benchmark test'
    }));
    optimizedUtils.batchApplyXpToAgents(testAgents, xpAwards);
  });

  bench('Streak bonus calculation - 100 agents', () => {
    testAgents.forEach(agent => {
      originalXpCalc.calculateStreakBonus(agent);
    });
  });

  bench('Optimized streak bonus calculation - 100 agents', () => {
    testAgents.forEach(agent => {
      optimizedUtils.calculateStreakBonusOptimized(agent);
    });
  });
});