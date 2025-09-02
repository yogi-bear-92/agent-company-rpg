import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestBoard from '../../src/components/QuestBoard';
import { Quest } from '../../src/types/quest';
import { Agent } from '../../src/types/agent';

// Mock the level progression hook
vi.mock('../../src/hooks/useLevelProgression', () => ({
  useLevelProgression: () => ({
    completeQuest: vi.fn(),
    calculatePreviewXp: vi.fn(() => ({
      newLevel: 5,
      levelUp: false,
      xpProgress: 450,
      xpToNext: 550
    })),
    isProcessing: false
  })
}));

describe('QuestBoard Component', () => {
  let mockQuests: Quest[];
  let mockAgents: Agent[];
  let mockOnQuestSelect: ReturnType<typeof vi.fn>;
  let mockOnQuestComplete: ReturnType<typeof vi.fn>;
  let mockOnAgentAssign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQuests = [
      {
        id: 'quest_001',
        title: 'Debug the Authentication System',
        description: 'Fix critical authentication bugs affecting user login.',
        lore: 'The authentication guardians have been compromised...',
        type: 'main',
        category: 'Investigation',
        difficulty: 'Medium',
        status: 'available',
        icon: '🔍',
        objectives: [
          {
            id: 'obj_001_1',
            description: 'Identify the root cause',
            completed: false,
            progress: 0,
            maxProgress: 1
          },
          {
            id: 'obj_001_2',
            description: 'Implement the fix',
            completed: false,
            progress: 0,
            maxProgress: 1
          }
        ],
        currentObjectiveIndex: 0,
        progressPercentage: 0,
        requirements: {
          minLevel: 3,
          requiredSkills: [
            { skill: 'Debugging', level: 5 }
          ]
        },
        rewards: {
          xp: 500,
          gold: 200,
          items: ['Bug Hunter Badge'],
          skillPoints: 2
        },
        assignedAgents: [],
        recommendedTeamSize: 2,
        autoAssign: false,
        dialogue: [],
        createdAt: new Date(),
        repeatable: false,
        timeLimit: 120
      },
      {
        id: 'quest_002',
        title: 'Daily Code Review',
        description: 'Review and improve code quality across projects.',
        type: 'daily',
        category: 'Creation',
        difficulty: 'Easy',
        status: 'available',
        icon: '📝',
        objectives: [
          {
            id: 'obj_002_1',
            description: 'Review 5 pull requests',
            completed: false,
            progress: 2,
            maxProgress: 5
          }
        ],
        currentObjectiveIndex: 0,
        progressPercentage: 40,
        requirements: {
          minLevel: 1
        },
        rewards: {
          xp: 150,
          gold: 50,
          items: ['Review Token']
        },
        assignedAgents: [1],
        recommendedTeamSize: 1,
        autoAssign: true,
        dialogue: [],
        createdAt: new Date(),
        repeatable: true,
        cooldownHours: 24
      },
      {
        id: 'quest_003',
        title: 'The Epic Raid: System Overhaul',
        description: 'Complete overhaul of the legacy system architecture.',
        lore: 'Ancient code spirits guard the legacy systems...',
        type: 'raid',
        category: 'Combat',
        difficulty: 'Legendary',
        status: 'locked',
        icon: '⚔️',
        objectives: [
          {
            id: 'obj_003_1',
            description: 'Analyze legacy architecture',
            completed: false,
            progress: 0,
            maxProgress: 1
          }
        ],
        currentObjectiveIndex: 0,
        progressPercentage: 0,
        requirements: {
          minLevel: 15,
          teamSize: { min: 4, max: 8 },
          requiredQuests: ['quest_001']
        },
        rewards: {
          xp: 5000,
          gold: 2000,
          items: ['Legendary Architect Crown'],
          skillPoints: 10
        },
        assignedAgents: [],
        recommendedTeamSize: 6,
        autoAssign: false,
        dialogue: [],
        createdAt: new Date(),
        repeatable: false
      }
    ];

    mockAgents = [
      {
        id: 1,
        name: 'Agent Alpha',
        class: 'Code Master',
        level: 8,
        xp: 1200,
        xpToNext: 1500,
        stats: { intelligence: 85, creativity: 70, reliability: 90, speed: 75, leadership: 65 },
        specializations: ['JavaScript', 'Debugging'],
        currentMission: 'Available for Mission',
        personality: 'Analytical',
        avatar: '🤖',
        knowledgeBase: {
          totalMemories: 150,
          recentLearning: 'Advanced debugging techniques',
          knowledgeDomains: {},
          crawlingProgress: { active: false, lastUrl: '', pagesLearned: 0, knowledgeGained: 0 }
        },
        equipment: { primary: 'Debug Tool', secondary: 'Code Scanner', utility: 'Knowledge Base' },
        relationships: [],
        skillTree: {},
        realtimeActivity: []
      },
      {
        id: 2,
        name: 'Agent Beta',
        class: 'Data Sage',
        level: 5,
        xp: 800,
        xpToNext: 1000,
        stats: { intelligence: 95, creativity: 60, reliability: 85, speed: 65, leadership: 55 },
        specializations: ['Data Analysis', 'Research'],
        currentMission: 'Researching optimization patterns',
        personality: 'Thorough',
        avatar: '📊',
        knowledgeBase: {
          totalMemories: 200,
          recentLearning: 'Statistical methods',
          knowledgeDomains: {},
          crawlingProgress: { active: false, lastUrl: '', pagesLearned: 0, knowledgeGained: 0 }
        },
        equipment: { primary: 'Analysis Engine', secondary: 'Data Probe', utility: 'Research Kit' },
        relationships: [],
        skillTree: {},
        realtimeActivity: []
      }
    ];

    mockOnQuestSelect = vi.fn();
    mockOnQuestComplete = vi.fn();
    mockOnAgentAssign = vi.fn();
  });

  describe('Rendering', () => {
    it('should render quest board with all quests', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('Debug the Authentication System')).toBeInTheDocument();
      expect(screen.getByText('Daily Code Review')).toBeInTheDocument();
      expect(screen.getByText('The Epic Raid: System Overhaul')).toBeInTheDocument();
    });

    it('should render quest difficulties with appropriate styling', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });

    it('should render quest icons and categories', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('⚔️')).toBeInTheDocument();
      expect(screen.getByText('Investigation')).toBeInTheDocument();
      expect(screen.getByText('Creation')).toBeInTheDocument();
      expect(screen.getByText('Combat')).toBeInTheDocument();
    });

    it('should render quest progress bars', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
      
      // Daily quest has 40% progress
      const dailyQuestProgress = progressBars.find(bar => 
        bar.getAttribute('aria-valuenow') === '40'
      );
      expect(dailyQuestProgress).toBeInTheDocument();
    });
  });

  describe('Quest Status Display', () => {
    it('should show available quests as selectable', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const availableQuests = mockQuests.filter(q => q.status === 'available');
      availableQuests.forEach(quest => {
        const questElement = screen.getByText(quest.title).closest('[data-quest-id]');
        expect(questElement).not.toHaveClass('opacity-50');
      });
    });

    it('should show locked quests as disabled', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const lockedQuest = screen.getByText('The Epic Raid: System Overhaul').closest('[data-quest-id]');
      expect(lockedQuest).toHaveClass('opacity-50');
    });

    it('should show quest requirements', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('Level 3+')).toBeInTheDocument();
      expect(screen.getByText('Level 15+')).toBeInTheDocument();
      expect(screen.getByText('Team: 4-8')).toBeInTheDocument();
    });

    it('should show assigned agents', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('Agent Alpha')).toBeInTheDocument();
    });

    it('should show time limits', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('⏱️ 120 min')).toBeInTheDocument();
    });
  });

  describe('Quest Rewards Display', () => {
    it('should show XP rewards', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('500 XP')).toBeInTheDocument();
      expect(screen.getByText('150 XP')).toBeInTheDocument();
      expect(screen.getByText('5000 XP')).toBeInTheDocument();
    });

    it('should show gold rewards', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('200 Gold')).toBeInTheDocument();
      expect(screen.getByText('50 Gold')).toBeInTheDocument();
      expect(screen.getByText('2000 Gold')).toBeInTheDocument();
    });

    it('should show item rewards', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText('Bug Hunter Badge')).toBeInTheDocument();
      expect(screen.getByText('Review Token')).toBeInTheDocument();
      expect(screen.getByText('Legendary Architect Crown')).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter quests by difficulty', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const difficultyFilter = screen.getByLabelText(/filter by difficulty/i);
      await user.selectOptions(difficultyFilter, 'Medium');

      expect(screen.getByText('Debug the Authentication System')).toBeInTheDocument();
      expect(screen.queryByText('Daily Code Review')).not.toBeInTheDocument();
    });

    it('should filter quests by type', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const typeFilter = screen.getByLabelText(/filter by type/i);
      await user.selectOptions(typeFilter, 'daily');

      expect(screen.getByText('Daily Code Review')).toBeInTheDocument();
      expect(screen.queryByText('Debug the Authentication System')).not.toBeInTheDocument();
    });

    it('should filter quests by status', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const statusFilter = screen.getByLabelText(/filter by status/i);
      await user.selectOptions(statusFilter, 'locked');

      expect(screen.getByText('The Epic Raid: System Overhaul')).toBeInTheDocument();
      expect(screen.queryByText('Daily Code Review')).not.toBeInTheDocument();
    });

    it('should sort quests by XP reward', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'xp_desc');

      // Should show highest XP first
      const questElements = screen.getAllByText(/XP/);
      expect(questElements[0]).toHaveTextContent('5000 XP');
    });
  });

  describe('Quest Interaction', () => {
    it('should call onQuestSelect when quest is clicked', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      await user.click(screen.getByText('Debug the Authentication System'));

      expect(mockOnQuestSelect).toHaveBeenCalledWith(mockQuests[0]);
    });

    it('should not allow selecting locked quests', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      await user.click(screen.getByText('The Epic Raid: System Overhaul'));

      expect(mockOnQuestSelect).not.toHaveBeenCalled();
    });

    it('should show agent assignment interface', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const assignButton = screen.getByText('Assign Agents');
      await user.click(assignButton);

      expect(screen.getByText('Available Agents')).toBeInTheDocument();
    });

    it('should show quest completion button for assigned quests', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const completeButton = screen.getByText('Complete Quest');
      expect(completeButton).toBeInTheDocument();
    });
  });

  describe('Agent Assignment', () => {
    it('should show eligible agents for quest', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const assignButton = screen.getByText('Assign Agents');
      await user.click(assignButton);

      // Agent Alpha should be eligible (level 8 >= required level 3)
      expect(screen.getByText('Agent Alpha')).toBeInTheDocument();
    });

    it('should disable ineligible agents', async () => {
      // Create a high-level quest
      const highLevelQuest: Quest = {
        ...mockQuests[0],
        requirements: { minLevel: 10 }
      };

      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={[highLevelQuest]}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const assignButton = screen.getByText('Assign Agents');
      await user.click(assignButton);

      // Both agents are under level 10, so should be disabled
      const agentAlpha = screen.getByText('Agent Alpha').closest('button');
      const agentBeta = screen.getByText('Agent Beta').closest('button');
      
      expect(agentAlpha).toBeDisabled();
      expect(agentBeta).toBeDisabled();
    });

    it('should show busy agents as unavailable', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const assignButton = screen.getByText('Assign Agents');
      await user.click(assignButton);

      // Agent Beta is busy with research
      expect(screen.getByText('Researching optimization patterns')).toBeInTheDocument();
    });

    it('should call onAgentAssign when agent is assigned', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const assignButton = screen.getByText('Assign Agents');
      await user.click(assignButton);

      const agentButton = screen.getByText('Agent Alpha').closest('button');
      await user.click(agentButton!);

      expect(mockOnAgentAssign).toHaveBeenCalledWith(mockQuests[0], mockAgents[0]);
    });
  });

  describe('Quest Completion', () => {
    it('should call onQuestComplete when complete button is clicked', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const completeButton = screen.getByText('Complete Quest');
      await user.click(completeButton);

      expect(mockOnQuestComplete).toHaveBeenCalled();
    });

    it('should show completion confirmation dialog', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const completeButton = screen.getByText('Complete Quest');
      await user.click(completeButton);

      expect(screen.getByText(/are you sure you want to complete/i)).toBeInTheDocument();
    });

    it('should show expected XP rewards in completion dialog', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const completeButton = screen.getByText('Complete Quest');
      await user.click(completeButton);

      expect(screen.getByText('150 XP')).toBeInTheDocument(); // Daily quest reward
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no quests available', () => {
      render(
        <QuestBoard
          quests={[]}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByText(/no quests available/i)).toBeInTheDocument();
    });

    it('should show empty state when all quests are filtered out', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const difficultyFilter = screen.getByLabelText(/filter by difficulty/i);
      await user.selectOptions(difficultyFilter, 'Expert');

      expect(screen.getByText(/no quests match your filters/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      expect(screen.getByRole('main', { name: /quest board/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by difficulty/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      await user.tab();
      expect(screen.getByLabelText(/filter by difficulty/i)).toHaveFocus();
    });

    it('should announce quest selection to screen readers', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <QuestBoard
          quests={mockQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const questCard = screen.getByText('Debug the Authentication System').closest('[role="button"]');
      expect(questCard).toHaveAttribute('aria-describedby');
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of quests efficiently', () => {
      const manyQuests = Array(100).fill(null).map((_, i) => ({
        ...mockQuests[0],
        id: `quest_${i}`,
        title: `Quest ${i}`
      }));

      const startTime = performance.now();
      
      render(
        <QuestBoard
          quests={manyQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it('should virtualize quest list for large datasets', () => {
      const manyQuests = Array(1000).fill(null).map((_, i) => ({
        ...mockQuests[0],
        id: `quest_${i}`,
        title: `Quest ${i}`
      }));

      render(
        <QuestBoard
          quests={manyQuests}
          agents={mockAgents}
          onQuestSelect={mockOnQuestSelect}
          onQuestComplete={mockOnQuestComplete}
          onAgentAssign={mockOnAgentAssign}
        />
      );

      // Should not render all 1000 quests at once
      const renderedQuests = screen.getAllByText(/Quest \d+/);
      expect(renderedQuests.length).toBeLessThan(50);
    });
  });
});