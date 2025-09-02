import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLevelProgression, useQuestProgression } from '../../src/hooks/useLevelProgression';
import { Agent } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';

// Mock levelProgression functions
vi.mock('../../src/utils/levelProgression', () => ({
  levelProgressionManager: {
    getProgressionState: vi.fn(),
    processXpGain: vi.fn(),
    processQuestCompletion: vi.fn(),
    dismissNotification: vi.fn(),
    clearDismissedNotifications: vi.fn(),
    getNextLevelUpEvent: vi.fn(),
    on: vi.fn()
  },
  processAgentXpGain: vi.fn(),
  processQuestCompletion: vi.fn()
}));

// Mock DOM manipulation functions
Object.defineProperty(document, 'querySelector', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(document, 'querySelectorAll', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
  writable: true
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

describe('useLevelProgression Hook', () => {
  let mockAgent: Agent;
  let mockQuest: Quest;
  let mockProgressionManager: unknown;

  beforeEach(() => {
    vi.clearAllMocks();
    
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

    // Set up mock progression manager
    mockProgressionManager = {
      getProgressionState: vi.fn(() => ({
        activeNotifications: [],
        levelUpQueue: [],
        recentEvents: [],
        isProcessing: false
      })),
      processXpGain: vi.fn(),
      processQuestCompletion: vi.fn(),
      dismissNotification: vi.fn(),
      clearDismissedNotifications: vi.fn(),
      getNextLevelUpEvent: vi.fn(),
      on: vi.fn()
    };

    const { levelProgressionManager } = await import('../../src/utils/levelProgression');
    Object.assign(levelProgressionManager, mockProgressionManager);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useLevelProgression());

      expect(result.current.activeNotifications).toEqual([]);
      expect(result.current.levelUpQueue).toEqual([]);
      expect(result.current.recentEvents).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should sync with progression manager state', () => {
      const mockState = {
        activeNotifications: [{ id: '1', type: 'level_up', title: 'Test' }],
        levelUpQueue: [{ agentId: 1, newLevel: 6 }],
        recentEvents: [{ type: 'xp_gained', agentId: 1 }],
        isProcessing: true
      };

      mockProgressionManager.getProgressionState.mockReturnValue(mockState);

      const { result } = renderHook(() => useLevelProgression());

      expect(result.current.activeNotifications).toHaveLength(1);
      expect(result.current.levelUpQueue).toHaveLength(1);
      expect(result.current.recentEvents).toHaveLength(1);
      expect(result.current.isProcessing).toBe(true);
    });

    it('should register event listeners on mount', () => {
      renderHook(() => useLevelProgression());

      expect(mockProgressionManager.on).toHaveBeenCalledWith('level_up', expect.any(Function));
      expect(mockProgressionManager.on).toHaveBeenCalledWith('xp_gained', expect.any(Function));
      expect(mockProgressionManager.on).toHaveBeenCalledWith('skill_unlocked', expect.any(Function));
    });
  });

  describe('XP Award Functionality', () => {
    it('should award XP to agent', async () => {
      const { processAgentXpGain } = await import('../../src/utils/levelProgression');
      const updatedAgent = { ...mockAgent, xp: 550 };
      
      processAgentXpGain.mockResolvedValue({
        updatedAgent,
        levelUpEvent: null,
        notifications: []
      });

      const { result } = renderHook(() => useLevelProgression());

      let returnedAgent;
      await act(async () => {
        returnedAgent = await result.current.awardXp(mockAgent, 100, 'test reward');
      });

      expect(processAgentXpGain).toHaveBeenCalledWith(mockAgent, 100, 'test reward');
      expect(returnedAgent).toEqual(updatedAgent);
    });

    it('should handle XP award errors', async () => {
      const { processAgentXpGain } = await import('../../src/utils/levelProgression');
      processAgentXpGain.mockRejectedValue(new Error('XP award failed'));

      const { result } = renderHook(() => useLevelProgression());

      await act(async () => {
        await expect(result.current.awardXp(mockAgent, 100, 'test'))
          .rejects.toThrow('XP award failed');
      });
    });

    it('should update processing state during XP award', async () => {
      const { processAgentXpGain } = await import('../../src/utils/levelProgression');
      
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      processAgentXpGain.mockReturnValue(promise);

      const { result } = renderHook(() => useLevelProgression());

      act(() => {
        result.current.awardXp(mockAgent, 100, 'test');
      });

      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        resolvePromise!({ updatedAgent: mockAgent, notifications: [] });
        await promise;
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('Quest Completion Functionality', () => {
    it('should complete quest with agents', async () => {
      const { processQuestCompletion } = await import('../../src/utils/levelProgression');
      const updatedAgents = [{ ...mockAgent, xp: 600 }];
      
      processQuestCompletion.mockResolvedValue({
        updatedAgents,
        levelUpEvents: [],
        notifications: []
      });

      const { result } = renderHook(() => useLevelProgression());

      let returnedAgents;
      await act(async () => {
        returnedAgents = await result.current.completeQuest(mockQuest, [mockAgent]);
      });

      expect(processQuestCompletion).toHaveBeenCalledWith(mockQuest, [mockAgent], undefined);
      expect(returnedAgents).toEqual(updatedAgents);
    });

    it('should complete quest with completion data', async () => {
      const { processQuestCompletion } = await import('../../src/utils/levelProgression');
      processQuestCompletion.mockResolvedValue({
        updatedAgents: [mockAgent],
        levelUpEvents: [],
        notifications: []
      });

      const { result } = renderHook(() => useLevelProgression());
      const completionData = {
        completionTime: 30,
        optionalObjectivesCompleted: 2,
        teamPerformanceBonus: 1.2
      };

      await act(async () => {
        await result.current.completeQuest(mockQuest, [mockAgent], completionData);
      });

      expect(processQuestCompletion).toHaveBeenCalledWith(mockQuest, [mockAgent], completionData);
    });
  });

  describe('Notification Management', () => {
    it('should dismiss notifications', () => {
      const { result } = renderHook(() => useLevelProgression());

      act(() => {
        result.current.dismissNotification('test_id');
      });

      expect(mockProgressionManager.dismissNotification).toHaveBeenCalledWith('test_id');
    });

    it('should clear dismissed notifications', () => {
      const { result } = renderHook(() => useLevelProgression());

      act(() => {
        result.current.clearDismissedNotifications();
      });

      expect(mockProgressionManager.clearDismissedNotifications).toHaveBeenCalled();
    });

    it('should get next level up event', () => {
      // const mockLevelUpEvent // unused: = { agentId: 1, newLevel: 6 };
      mockProgressionManager.getNextLevelUpEvent.mockReturnValue(mockLevelUpEvent);

      const { result } = renderHook(() => useLevelProgression());

      const levelUpEvent = result.current.getNextLevelUp();

      expect(levelUpEvent).toEqual(mockLevelUpEvent);
      expect(mockProgressionManager.getNextLevelUpEvent).toHaveBeenCalled();
    });
  });

  describe('Event Handler Registration', () => {
    it('should register level up handlers', () => {
      const { result } = renderHook(() => useLevelProgression());
      const handler = vi.fn();

      act(() => {
        result.current.onLevelUp(handler);
      });

      // Simulate a level up event
      const levelUpEvent = { agentId: 1, newLevel: 6 };
      const mockEvent = { type: 'level_up', agentId: 1, data: levelUpEvent, timestamp: new Date() };
      
      // Get the registered handler from the mock
      const registeredHandler = mockProgressionManager.on.mock.calls
        .find(call => call[0] === 'level_up')?.[1];
      
      if (registeredHandler) {
        registeredHandler(mockEvent);
        expect(handler).toHaveBeenCalledWith(levelUpEvent);
      }
    });

    it('should register XP gain handlers', () => {
      const { result } = renderHook(() => useLevelProgression());
      const handler = vi.fn();

      act(() => {
        result.current.onXpGain(handler);
      });

      // Simulate XP gain event
      const xpEvent = { type: 'xp_gained', agentId: 1, data: { amount: 100 }, timestamp: new Date() };
      
      const registeredHandler = mockProgressionManager.on.mock.calls
        .find(call => call[0] === 'xp_gained')?.[1];
      
      if (registeredHandler) {
        registeredHandler(xpEvent);
        expect(handler).toHaveBeenCalledWith(xpEvent);
      }
    });

    it('should register skill unlock handlers', () => {
      const { result } = renderHook(() => useLevelProgression());
      const handler = vi.fn();

      act(() => {
        result.current.onSkillUnlock(handler);
      });

      // Test handler registration
      expect(typeof result.current.onSkillUnlock).toBe('function');
    });
  });

  describe('XP Preview Calculation', () => {
    it('should calculate XP preview without level up', () => {
      const { result } = renderHook(() => useLevelProgression());

      const preview = result.current.calculatePreviewXp(mockAgent, 50);

      expect(preview.newLevel).toBe(5);
      expect(preview.levelUp).toBe(false);
      expect(preview.xpProgress).toBe(500);
    });

    it('should calculate XP preview with level up', () => {
      const { result } = renderHook(() => useLevelProgression());

      const preview = result.current.calculatePreviewXp(mockAgent, 600);

      expect(preview.newLevel).toBeGreaterThan(5);
      expect(preview.levelUp).toBe(true);
    });

    it('should handle edge cases in XP preview', () => {
      const { result } = renderHook(() => useLevelProgression());

      const preview = result.current.calculatePreviewXp(mockAgent, 0);

      expect(preview.newLevel).toBe(5);
      expect(preview.levelUp).toBe(false);
      expect(preview.xpProgress).toBe(450);
    });
  });

  describe('Level Up Visual Effects', () => {
    beforeEach(() => {
      // Mock DOM elements
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 200,
          width: 50,
          height: 30
        }),
        style: {}
      };

      vi.mocked(document.querySelector).mockReturnValue(mockElement as unknown);
      vi.mocked(document.querySelectorAll).mockReturnValue([mockElement] as unknown);
    });

    it('should trigger visual effects for level up', () => {
      const { result } = renderHook(() => useLevelProgression());

      act(() => {
        result.current.playLevelUpEffect(1);
      });

      expect(document.querySelectorAll).toHaveBeenCalledWith('[data-agent-id="1"]');
    });

    it('should create particle effects', () => {
      const { result } = renderHook(() => useLevelProgression());

      act(() => {
        result.current.playLevelUpEffect(1);
      });

      // Should attempt to create particles
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should handle missing elements gracefully', () => {
      vi.mocked(document.querySelector).mockReturnValue(null);
      vi.mocked(document.querySelectorAll).mockReturnValue([] as unknown);

      const { result } = renderHook(() => useLevelProgression());

      expect(() => {
        act(() => {
          result.current.playLevelUpEffect(1);
        });
      }).not.toThrow();
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should cleanup timers on unmount', () => {
      const { unmount } = renderHook(() => useLevelProgression());
      
      // Trigger some effects that create timers
      const { result } = renderHook(() => useLevelProgression());
      
      act(() => {
        result.current.playLevelUpEffect(1);
      });

      expect(() => unmount()).not.toThrow();
    });

    it('should handle concurrent animation cleanup', () => {
      const { result } = renderHook(() => useLevelProgression());

      // Start multiple animations for the same agent
      act(() => {
        result.current.playLevelUpEffect(1);
        result.current.playLevelUpEffect(1);
        result.current.playLevelUpEffect(1);
      });

      // Should not throw errors
      expect(() => {
        act(() => {
          result.current.playLevelUpEffect(1);
        });
      }).not.toThrow();
    });
  });
});

describe('useQuestProgression Hook', () => {
  let mockAgent: Agent;
  let mockQuest: Quest;

  beforeEach(() => {
    vi.clearAllMocks();
    
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
  });

  describe('Quest Completion Tracking', () => {
    it('should track quest completion with XP calculation', async () => {
      const { processQuestCompletion } = await import('../../src/utils/levelProgression');
      const updatedAgent = { ...mockAgent, xp: 600 };
      
      processQuestCompletion.mockResolvedValue({
        updatedAgents: [updatedAgent],
        levelUpEvents: [],
        notifications: []
      });

      const { result } = renderHook(() => useQuestProgression());

      await act(async () => {
        await result.current.completeQuestWithTracking(
          'quest_001',
          mockQuest,
          [mockAgent]
        );
      });

      expect(result.current.questCompletions).toHaveProperty('quest_001');
      expect(result.current.questCompletions.quest_001.completed).toBe(true);
      expect(result.current.questCompletions.quest_001.xpAwarded).toBe(150); // 600 - 450
    });

    it('should track multiple quest completions', async () => {
      const { processQuestCompletion } = await import('../../src/utils/levelProgression');
      processQuestCompletion.mockResolvedValue({
        updatedAgents: [{ ...mockAgent, xp: 600 }],
        levelUpEvents: [],
        notifications: []
      });

      const { result } = renderHook(() => useQuestProgression());

      await act(async () => {
        await result.current.completeQuestWithTracking('quest_001', mockQuest, [mockAgent]);
      });

      await act(async () => {
        await result.current.completeQuestWithTracking('quest_002', mockQuest, [mockAgent]);
      });

      expect(Object.keys(result.current.questCompletions)).toHaveLength(2);
      expect(result.current.questCompletions).toHaveProperty('quest_001');
      expect(result.current.questCompletions).toHaveProperty('quest_002');
    });

    it('should include all useLevelProgression functionality', () => {
      const { result } = renderHook(() => useQuestProgression());

      // Should have all the base hook functionality
      expect(result.current.awardXp).toBeDefined();
      expect(result.current.completeQuest).toBeDefined();
      expect(result.current.dismissNotification).toBeDefined();
      expect(result.current.playLevelUpEffect).toBeDefined();
      expect(result.current.calculatePreviewXp).toBeDefined();
      
      // Plus quest-specific functionality
      expect(result.current.questCompletions).toBeDefined();
      expect(result.current.completeQuestWithTracking).toBeDefined();
    });

    it('should handle quest completion errors', async () => {
      const { processQuestCompletion } = await import('../../src/utils/levelProgression');
      processQuestCompletion.mockRejectedValue(new Error('Quest completion failed'));

      const { result } = renderHook(() => useQuestProgression());

      await act(async () => {
        await expect(
          result.current.completeQuestWithTracking('quest_001', mockQuest, [mockAgent])
        ).rejects.toThrow('Quest completion failed');
      });

      // Should not have tracked the failed completion
      expect(result.current.questCompletions).not.toHaveProperty('quest_001');
    });
  });
});