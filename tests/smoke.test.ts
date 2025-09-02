import { describe, it, expect } from 'vitest';
import { 
  calculateXpToNextLevel,
  calculateLevelFromXp,
  calculateQuestXpReward
} from '../src/utils/xpCalculator';

describe('Smoke Tests - Basic Functionality', () => {
  describe('XP Calculator Functions', () => {
    it('should calculate XP for next level', () => {
      expect(calculateXpToNextLevel(1)).toBe(100);
      expect(calculateXpToNextLevel(5)).toBeGreaterThan(0);
    });

    it('should calculate level from XP', () => {
      const result = calculateLevelFromXp(250);
      expect(result.level).toBeGreaterThan(0);
      expect(result.currentLevelXp).toBeGreaterThanOrEqual(0);
      expect(result.xpToNext).toBeGreaterThan(0);
    });

    it('should calculate quest XP rewards', () => {
      const mockAgent = {
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

      const mockQuest = {
        id: 'test_quest',
        title: 'Test Quest',
        description: 'A quest for testing',
        type: 'main' as const,
        category: 'Investigation' as const,
        difficulty: 'Medium' as const,
        status: 'available' as const,
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

      const xp = calculateQuestXpReward(mockQuest, mockAgent);
      expect(xp).toBeGreaterThan(0);
    });
  });

  describe('Test Infrastructure', () => {
    it('should run tests successfully', () => {
      expect(true).toBe(true);
    });

    it('should handle async operations', async () => {
      const result = await Promise.resolve('test');
      expect(result).toBe('test');
    });

    it('should support modern JavaScript features', () => {
      const obj = { a: 1, b: 2 };
      const spread = { ...obj, c: 3 };
      expect(spread).toEqual({ a: 1, b: 2, c: 3 });
    });
  });
});