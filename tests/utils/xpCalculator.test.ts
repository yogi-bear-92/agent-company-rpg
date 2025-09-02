import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateXpToNextLevel,
  calculateTotalXpForLevel,
  calculateLevelFromXp,
  calculateQuestXpReward,
  calculatePartialQuestXp,
  calculateStreakBonus,
  calculateSkillXp,
  calculateCollaborationXp,
  calculateKnowledgeXp,
  applyXpToAgent,
  distributeTeamXp,
  calculateXpDecay
} from '../../src/utils/xpCalculator';
import { Agent } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';

describe('XP Calculator Utilities', () => {
  let mockAgent: Agent;
  let mockQuest: Quest;

  beforeEach(() => {
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
      repeatable: false,
      timeLimit: 60
    };
  });

  describe('Level Calculation Functions', () => {
    it('should calculate XP required for next level correctly', () => {
      expect(calculateXpToNextLevel(1)).toBe(100);
      expect(calculateXpToNextLevel(2)).toBe(150);
      expect(calculateXpToNextLevel(3)).toBe(225);
      expect(calculateXpToNextLevel(5)).toBe(506); // Base * 1.5^4
    });

    it('should calculate total XP for a target level', () => {
      expect(calculateTotalXpForLevel(1)).toBe(0);
      expect(calculateTotalXpForLevel(2)).toBe(100);
      expect(calculateTotalXpForLevel(3)).toBe(250);
    });

    it('should calculate level from total XP correctly', () => {
      const result1 = calculateLevelFromXp(50);
      expect(result1.level).toBe(1);
      expect(result1.currentLevelXp).toBe(50);
      expect(result1.xpToNext).toBe(100);

      const result2 = calculateLevelFromXp(250);
      expect(result2.level).toBe(3);
      expect(result2.currentLevelXp).toBe(0);
      expect(result2.xpToNext).toBe(225);
    });

    it('should handle edge cases for level calculation', () => {
      const result = calculateLevelFromXp(0);
      expect(result.level).toBe(1);
      expect(result.currentLevelXp).toBe(0);
      
      const highXpResult = calculateLevelFromXp(10000);
      expect(highXpResult.level).toBeGreaterThan(1);
    });
  });

  describe('Quest XP Rewards', () => {
    it('should calculate basic quest XP reward', () => {
      const xp = calculateQuestXpReward(mockQuest, mockAgent);
      expect(xp).toBe(150); // 100 * 1.5 (Medium difficulty)
    });

    it('should apply class bonuses correctly', () => {
      const xp = calculateQuestXpReward(mockQuest, mockAgent);
      // Code Master gets bonus for Investigation
      expect(xp).toBeGreaterThan(100);
    });

    it('should apply time bonuses for fast completion', () => {
      const fastXp = calculateQuestXpReward(mockQuest, mockAgent, 15); // 25% of time limit
      const normalXp = calculateQuestXpReward(mockQuest, mockAgent, 60); // Full time
      expect(fastXp).toBeGreaterThan(normalXp);
    });

    it('should apply optional objectives bonus', () => {
      mockQuest.bonusRewards = { xp: 50 };
      const xpWithBonus = calculateQuestXpReward(mockQuest, mockAgent, undefined, 1);
      const xpWithoutBonus = calculateQuestXpReward(mockQuest, mockAgent, undefined, 0);
      expect(xpWithBonus).toBeGreaterThan(xpWithoutBonus);
    });

    it('should apply team synergy bonus', () => {
      mockQuest.assignedAgents = [1, 2, 3];
      const teamXp = calculateQuestXpReward(mockQuest, mockAgent);
      
      mockQuest.assignedAgents = [1];
      const soloXp = calculateQuestXpReward(mockQuest, mockAgent);
      
      expect(teamXp).toBeGreaterThan(soloXp);
    });
  });

  describe('Partial Quest Completion', () => {
    it('should calculate partial XP correctly', () => {
      const partialXp = calculatePartialQuestXp(mockQuest, 2, 4);
      expect(partialXp).toBe(25); // 50% completion * 50% efficiency
    });

    it('should handle zero progress', () => {
      const partialXp = calculatePartialQuestXp(mockQuest, 0, 4);
      expect(partialXp).toBe(0);
    });

    it('should handle complete objectives', () => {
      const partialXp = calculatePartialQuestXp(mockQuest, 4, 4);
      expect(partialXp).toBe(50); // Full progress * 50% efficiency
    });
  });

  describe('Streak Bonus Calculation', () => {
    it('should calculate streak bonus based on recent activity', () => {
      // No recent activity
      expect(calculateStreakBonus(mockAgent)).toBe(1.0);

      // Add some XP-gaining activities
      mockAgent.realtimeActivity = Array(15).fill(null).map((_, i) => ({
        timestamp: new Date().toISOString(),
        action: `Activity ${i}`,
        xpGained: 10
      }));

      expect(calculateStreakBonus(mockAgent)).toBe(1.3);
    });

    it('should ignore activities without XP gains', () => {
      mockAgent.realtimeActivity = Array(10).fill(null).map((_, i) => ({
        timestamp: new Date().toISOString(),
        action: `Activity ${i}`
      }));

      expect(calculateStreakBonus(mockAgent)).toBe(1.0);
    });
  });

  describe('Skill XP Calculation', () => {
    it('should calculate skill XP based on complexity', () => {
      const simpleXp = calculateSkillXp(5, 'simple');
      const moderateXp = calculateSkillXp(5, 'moderate');
      const complexXp = calculateSkillXp(5, 'complex');

      expect(simpleXp).toBeLessThan(moderateXp);
      expect(moderateXp).toBeLessThan(complexXp);
    });

    it('should include level bonus in skill XP', () => {
      const level1Xp = calculateSkillXp(1, 'moderate');
      const level5Xp = calculateSkillXp(5, 'moderate');
      
      expect(level5Xp).toBeGreaterThan(level1Xp);
    });
  });

  describe('Collaboration XP', () => {
    it('should scale collaboration XP with team size', () => {
      const solo = calculateCollaborationXp(1, 'medium', 1.0);
      const team = calculateCollaborationXp(4, 'medium', 1.0);
      
      expect(team).toBeGreaterThan(solo);
    });

    it('should scale with task complexity', () => {
      const low = calculateCollaborationXp(3, 'low', 1.0);
      const high = calculateCollaborationXp(3, 'high', 1.0);
      
      expect(high).toBeGreaterThan(low);
    });

    it('should scale with success rate', () => {
      const poor = calculateCollaborationXp(3, 'medium', 0.3);
      const excellent = calculateCollaborationXp(3, 'medium', 1.0);
      
      expect(excellent).toBeGreaterThan(poor);
    });
  });

  describe('Knowledge XP', () => {
    it('should calculate knowledge XP with expertise multiplier', () => {
      const novice = calculateKnowledgeXp(10, 0, false);
      const expert = calculateKnowledgeXp(10, 100, false);
      
      expect(expert).toBeGreaterThan(novice);
    });

    it('should add bonus for new domain learning', () => {
      const existing = calculateKnowledgeXp(10, 50, false);
      const newDomain = calculateKnowledgeXp(10, 50, true);
      
      expect(newDomain).toBeGreaterThan(existing);
    });
  });

  describe('Apply XP to Agent', () => {
    it('should update agent XP correctly without leveling', () => {
      const result = applyXpToAgent(mockAgent, 50, 'test');
      
      expect(result.updatedAgent.xp).toBe(500); // 450 + 50
      expect(result.leveledUp).toBe(false);
      expect(result.updatedAgent.realtimeActivity[0].xpGained).toBe(50);
    });

    it('should handle level up correctly', () => {
      const result = applyXpToAgent(mockAgent, 600, 'test');
      
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(mockAgent.level);
      expect(result.unlockedSkills).toBeDefined();
    });

    it('should apply stat bonuses on level up', () => {
      const result = applyXpToAgent(mockAgent, 1000, 'test');
      
      if (result.leveledUp) {
        expect(result.updatedAgent.stats.intelligence).toBeGreaterThan(mockAgent.stats.intelligence);
      }
    });

    it('should limit recent activity to 50 entries', () => {
      mockAgent.realtimeActivity = Array(50).fill(null).map(() => ({
        timestamp: new Date().toISOString(),
        action: 'old activity'
      }));

      const result = applyXpToAgent(mockAgent, 50, 'test');
      
      expect(result.updatedAgent.realtimeActivity).toHaveLength(50);
      expect(result.updatedAgent.realtimeActivity[0].action).toBe('test');
    });
  });

  describe('Team XP Distribution', () => {
    let agents: Agent[];

    beforeEach(() => {
      agents = [
        { ...mockAgent, id: 1 },
        { ...mockAgent, id: 2 },
        { ...mockAgent, id: 3 }
      ];
    });

    it('should distribute XP equally without weights', () => {
      const distribution = distributeTeamXp(300, agents);
      
      expect(distribution[1]).toBe(100);
      expect(distribution[2]).toBe(100);
      expect(distribution[3]).toBe(100);
    });

    it('should distribute XP by weight when provided', () => {
      const weights = { 1: 2, 2: 1, 3: 1 };
      const distribution = distributeTeamXp(400, agents, weights);
      
      expect(distribution[1]).toBe(200); // 2/4 of total
      expect(distribution[2]).toBe(100); // 1/4 of total
      expect(distribution[3]).toBe(100); // 1/4 of total
    });

    it('should handle missing weights gracefully', () => {
      const weights = { 1: 2 }; // Missing weights for agents 2 and 3
      const distribution = distributeTeamXp(400, agents, weights);
      
      expect(distribution[1]).toBeGreaterThan(distribution[2]);
      expect(distribution[2]).toBe(distribution[3]);
    });
  });

  describe('XP Decay', () => {
    it('should not apply decay for recent activity', () => {
      const recent = new Date();
      recent.setDate(recent.getDate() - 3);
      
      expect(calculateXpDecay(recent)).toBe(0);
    });

    it('should apply progressive decay over time', () => {
      const oneWeek = new Date();
      oneWeek.setDate(oneWeek.getDate() - 10);
      
      const oneMonth = new Date();
      oneMonth.setDate(oneMonth.getDate() - 20);
      
      const twoMonths = new Date();
      twoMonths.setDate(twoMonths.getDate() - 45);
      
      expect(calculateXpDecay(oneWeek)).toBe(0.05);
      expect(calculateXpDecay(oneMonth)).toBe(0.1);
      expect(calculateXpDecay(twoMonths)).toBe(0.2);
    });

    it('should cap decay at 30%', () => {
      const ancient = new Date();
      ancient.setDate(ancient.getDate() - 100);
      
      expect(calculateXpDecay(ancient)).toBe(0.3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative XP gracefully', () => {
      const result = applyXpToAgent(mockAgent, -100, 'penalty');
      expect(result.updatedAgent.xp).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large XP gains', () => {
      const result = applyXpToAgent(mockAgent, 1000000, 'massive bonus');
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(mockAgent.level);
    });

    it('should handle missing quest properties', () => {
      const incompleteQuest = { ...mockQuest };
      delete (incompleteQuest as unknown).timeLimit;
      delete (incompleteQuest as unknown).bonusRewards;
      
      expect(() => calculateQuestXpReward(incompleteQuest, mockAgent)).not.toThrow();
    });

    it('should handle unknown agent class', () => {
      const unknownClassAgent = { ...mockAgent, class: 'Unknown Class' };
      const xp = calculateQuestXpReward(mockQuest, unknownClassAgent);
      
      expect(xp).toBeGreaterThan(0);
    });

    it('should handle invalid difficulty levels', () => {
      const invalidQuest = { ...mockQuest, difficulty: 'Unknown' as unknown };
      const xp = calculateQuestXpReward(invalidQuest, mockAgent);
      
      expect(xp).toBeGreaterThan(0);
    });
  });
});