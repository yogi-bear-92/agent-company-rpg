import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentSheet from '../../src/components/AgentSheet';
import { Agent } from '../../src/types/agent';

// Mock the level progression hook
vi.mock('../../src/hooks/useLevelProgression', () => ({
  useLevelProgression: () => ({
    awardXp: vi.fn(),
    calculatePreviewXp: vi.fn(() => ({
      newLevel: 5,
      levelUp: false,
      xpProgress: 450,
      xpToNext: 550
    })),
    playLevelUpEffect: vi.fn()
  })
}));

describe('AgentSheet Component', () => {
  let mockAgent: Agent;
  let mockOnAgentUpdate: ReturnType<typeof vi.fn>;
  let mockOnMissionAssign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAgent = {
      id: 1,
      name: 'Test Agent',
      class: 'Code Master',
      level: 5,
      xp: 450,
      xpToNext: 550,
      stats: {
        intelligence: 75,
        creativity: 65,
        reliability: 85,
        speed: 70,
        leadership: 60
      },
      specializations: ['JavaScript', 'React', 'Testing'],
      currentMission: 'Available for Mission',
      personality: 'Methodical and precise',
      avatar: '⚔️',
      knowledgeBase: {
        totalMemories: 247,
        recentLearning: 'Advanced testing patterns',
        knowledgeDomains: {
          'frontend_development': 89,
          'testing': 92,
          'javascript': 88
        },
        crawlingProgress: {
          active: false,
          lastUrl: 'https://testing-library.com',
          pagesLearned: 15,
          knowledgeGained: 12.3
        }
      },
      equipment: {
        primary: 'Advanced Code Analysis Engine v2.1',
        secondary: 'Real-time Test Runner',
        utility: 'Knowledge Synthesis Matrix'
      },
      relationships: [
        { agentId: 2, type: 'mentor', strength: 88, recentInteraction: 'Shared testing strategies' }
      ],
      skillTree: {
        'Test Mastery': { level: 8, maxLevel: 10, unlocked: true, recentProgress: '+0.3 from new patterns' },
        'Code Analysis': { level: 7, maxLevel: 10, unlocked: true },
        'Team Leadership': { level: 5, maxLevel: 10, unlocked: false }
      },
      realtimeActivity: [
        { timestamp: '2 mins ago', action: 'Completed unit test suite', xpGained: 25 },
        { timestamp: '5 mins ago', action: 'Reviewed testing documentation', confidence: '+0.1' }
      ]
    };

    mockOnAgentUpdate = vi.fn();
    mockOnMissionAssign = vi.fn();
  });

  describe('Rendering', () => {
    it('should render agent basic information', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Test Agent')).toBeInTheDocument();
      expect(screen.getByText('Code Master')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.getByText('⚔️')).toBeInTheDocument();
    });

    it('should render agent stats', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/Intelligence/)).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText(/Creativity/)).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
    });

    it('should render specializations', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });

    it('should render current mission status', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Available for Mission')).toBeInTheDocument();
    });

    it('should render XP bar with correct values', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('450 / 550 XP')).toBeInTheDocument();
    });
  });

  describe('Knowledge Base Section', () => {
    it('should render knowledge base information', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/247.*memories/i)).toBeInTheDocument(); // Total memories
      expect(screen.getByText('Advanced testing patterns')).toBeInTheDocument();
    });

    it('should render knowledge domains', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/frontend.development/i)).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('testing')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });

    it('should show crawling status when inactive', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/Last crawled/)).toBeInTheDocument();
      expect(screen.getByText('https://testing-library.com')).toBeInTheDocument();
    });

    it('should show active crawling status', () => {
      const activeCrawlingAgent = {
        ...mockAgent,
        knowledgeBase: {
          ...mockAgent.knowledgeBase,
          crawlingProgress: {
            active: true,
            lastUrl: 'https://example.com',
            pagesLearned: 5,
            knowledgeGained: 3.2
          }
        }
      };

      render(
        <AgentSheet 
          agent={activeCrawlingAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/Currently crawling/)).toBeInTheDocument();
      expect(screen.getByText('5 pages learned')).toBeInTheDocument();
    });
  });

  describe('Equipment Section', () => {
    it('should render equipment information', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Advanced Code Analysis Engine v2.1')).toBeInTheDocument();
      expect(screen.getByText('Real-time Test Runner')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Synthesis Matrix')).toBeInTheDocument();
    });
  });

  describe('Relationships Section', () => {
    it('should render relationships', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('mentor')).toBeInTheDocument();
      expect(screen.getAllByText('88')[1]).toBeInTheDocument(); // Strength (second occurrence)
      expect(screen.getByText('Shared testing strategies')).toBeInTheDocument();
    });

    it('should handle empty relationships', () => {
      const agentWithoutRelationships = {
        ...mockAgent,
        relationships: []
      };

      render(
        <AgentSheet 
          agent={agentWithoutRelationships} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/No active relationships/)).toBeInTheDocument();
    });
  });

  describe('Skill Tree Section', () => {
    it('should render unlocked skills', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Test Mastery')).toBeInTheDocument();
      expect(screen.getByText('8/10')).toBeInTheDocument();
      expect(screen.getByText('Code Analysis')).toBeInTheDocument();
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('should show locked skills', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Team Leadership')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument();
      // Should show as locked/unavailable
    });

    it('should show recent progress', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('+0.3 from new patterns')).toBeInTheDocument();
    });
  });

  describe('Real-time Activity Section', () => {
    it('should render recent activities', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Completed unit test suite')).toBeInTheDocument();
      expect(screen.getByText('2 mins ago')).toBeInTheDocument();
      expect(screen.getByText('+25 XP')).toBeInTheDocument();
    });

    it('should show activity without XP gains', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Reviewed testing documentation')).toBeInTheDocument();
      expect(screen.getByText('+0.1')).toBeInTheDocument();
    });

    it('should handle empty activity feed', () => {
      const agentWithoutActivity = {
        ...mockAgent,
        realtimeActivity: []
      };

      render(
        <AgentSheet 
          agent={agentWithoutActivity} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText(/No recent activity/)).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should call onMissionAssign when assign mission button is clicked', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      const assignButton = screen.getByRole('button', { name: /assign mission/i });
      await user.click(assignButton);

      expect(mockOnMissionAssign).toHaveBeenCalledWith(mockAgent);
    });

    it('should disable mission assignment for busy agents', () => {
      const busyAgent = {
        ...mockAgent,
        currentMission: 'Debugging critical system'
      };

      render(
        <AgentSheet 
          agent={busyAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      const assignButton = screen.getByRole('button', { name: /assign mission/i });
      expect(assignButton).toBeDisabled();
    });

    it('should show mission status for busy agents', () => {
      const busyAgent = {
        ...mockAgent,
        currentMission: 'Debugging critical system'
      };

      render(
        <AgentSheet 
          agent={busyAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByText('Debugging critical system')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByLabelText(/agent details for test agent/i)).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      await user.tab();
      expect(screen.getByRole('button', { name: /assign mission/i })).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      const initialRenderCount = mockOnAgentUpdate.mock.calls.length;

      // Re-render with same props
      rerender(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      expect(mockOnAgentUpdate.mock.calls.length).toBe(initialRenderCount);
    });
  });

  describe('Data Validation', () => {
    it('should handle missing agent data gracefully', () => {
      const incompleteAgent = {
        ...mockAgent,
        knowledgeBase: undefined,
        equipment: undefined,
        relationships: undefined,
        skillTree: undefined,
        realtimeActivity: undefined
      } as unknown;

      expect(() => {
        render(
          <AgentSheet 
            agent={incompleteAgent} 
            onAgentUpdate={mockOnAgentUpdate}
            onMissionAssign={mockOnMissionAssign}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid skill tree data', () => {
      const agentWithInvalidSkills = {
        ...mockAgent,
        skillTree: {
          'Invalid Skill': null,
          'Another Skill': undefined
        }
      } as unknown;

      expect(() => {
        render(
          <AgentSheet 
            agent={agentWithInvalidSkills} 
            onAgentUpdate={mockOnAgentUpdate}
            onMissionAssign={mockOnMissionAssign}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid stats', () => {
      const agentWithInvalidStats = {
        ...mockAgent,
        stats: {
          intelligence: NaN,
          creativity: -5,
          reliability: 150,
          speed: null,
          leadership: undefined
        }
      } as unknown;

      expect(() => {
        render(
          <AgentSheet 
            agent={agentWithInvalidStats} 
            onAgentUpdate={mockOnAgentUpdate}
            onMissionAssign={mockOnMissionAssign}
          />
        );
      }).not.toThrow();
    });
  });

  describe('XP Bar Integration', () => {
    it('should render XP bar with data-agent-id for animations', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      const xpBar = screen.getByTestId('xp-bar');
      expect(xpBar).toHaveAttribute('data-agent-id', '1');
    });

    it('should show correct XP percentage', () => {
      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      // 450/550 = ~81.8%
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '450');
      expect(progressBar).toHaveAttribute('aria-valuemax', '550');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('should adapt layout for mobile screens', () => {
      // Mock mobile screen
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <AgentSheet 
          agent={mockAgent} 
          onAgentUpdate={mockOnAgentUpdate}
          onMissionAssign={mockOnMissionAssign}
        />
      );

      // Should still render all essential information
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });
  });
});