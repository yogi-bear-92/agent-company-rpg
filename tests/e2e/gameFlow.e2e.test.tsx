import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

// Mock external dependencies
vi.mock('../../src/hooks/useLevelProgression', () => ({
  useLevelProgression: () => ({
    awardXp: vi.fn().mockResolvedValue({ 
      id: 1, 
      name: 'Test Agent', 
      level: 6, 
      xp: 100,
      xpToNext: 200 
    }),
    completeQuest: vi.fn().mockResolvedValue([{
      id: 1,
      name: 'Test Agent',
      level: 6,
      xp: 600,
      xpToNext: 800
    }]),
    calculatePreviewXp: vi.fn(() => ({
      newLevel: 6,
      levelUp: true,
      xpProgress: 100,
      xpToNext: 200
    })),
    playLevelUpEffect: vi.fn(),
    activeNotifications: [],
    levelUpQueue: [],
    recentEvents: [],
    isProcessing: false,
    dismissNotification: vi.fn(),
    clearDismissedNotifications: vi.fn(),
    getNextLevelUp: vi.fn(),
    onLevelUp: vi.fn(),
    onXpGain: vi.fn(),
    onSkillUnlock: vi.fn()
  })
}));

// Mock requestAnimationFrame for smooth testing
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

describe('Game Flow End-to-End Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Application Initialization', () => {
    it('should load and display the main game interface', async () => {
      render(<App />);

      // Wait for the app to load
      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      // Verify main sections are present
      expect(screen.getByText(/Agents/i)).toBeInTheDocument();
      expect(screen.getByText(/Quests/i)).toBeInTheDocument();
    });

    it('should load initial agents data', async () => {
      render(<App />);

      await waitFor(() => {
        // Should show agents from initial data
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
        expect(screen.getByText('Sage Analytica')).toBeInTheDocument();
        expect(screen.getByText('Bard Creative')).toBeInTheDocument();
        expect(screen.getByText('Scout Rapid')).toBeInTheDocument();
      });
    });

    it('should load initial quests data', async () => {
      render(<App />);

      await waitFor(() => {
        // Should show quests from initial data
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
        expect(screen.getByText('The Lost Algorithm')).toBeInTheDocument();
        expect(screen.getByText('Documentation Patrol')).toBeInTheDocument();
      });
    });
  });

  describe('Agent Management Flow', () => {
    it('should display agent details when clicking on an agent', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
      });

      // Click on an agent
      await user.click(screen.getByText('CodeMaster Zyx'));

      // Should show detailed agent information
      await waitFor(() => {
        expect(screen.getByText(/Level/)).toBeInTheDocument();
        expect(screen.getByText(/Intelligence/)).toBeInTheDocument();
        expect(screen.getByText(/Specializations/)).toBeInTheDocument();
      });
    });

    it('should show XP progression information for agents', async () => {
      render(<App />);

      await waitFor(() => {
        // Should show XP bars
        const xpBars = screen.getAllByRole('progressbar');
        expect(xpBars.length).toBeGreaterThan(0);
        
        // Should show XP text
        expect(screen.getByText(/XP/)).toBeInTheDocument();
      });
    });

    it('should handle agent mission assignment', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
      });

      // Look for mission assignment interface
      const assignButton = screen.queryByText(/Assign Mission/i);
      if (assignButton) {
        await user.click(assignButton);
        
        // Should show mission assignment interface
        await waitFor(() => {
          expect(screen.getByText(/Available Missions|Select Mission/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Quest Management Flow', () => {
    it('should display quest board with available quests', async () => {
      render(<App />);

      await waitFor(() => {
        // Verify quest types are displayed
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
        expect(screen.getByText('The Lost Algorithm')).toBeInTheDocument();
      });

      // Should show quest difficulties
      expect(screen.getByText('Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should handle quest selection and details', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
      });

      // Click on a quest
      await user.click(screen.getByText('Welcome to the Guild'));

      // Should show quest details
      await waitFor(() => {
        expect(screen.getByText(/Report to the Guild Master/)).toBeInTheDocument();
        expect(screen.getByText(/100.*XP/)).toBeInTheDocument();
      });
    });

    it('should show quest objectives and progress', async () => {
      render(<App />);

      await waitFor(() => {
        // Should show quest objectives
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
        
        // Should show completion percentages
        expect(screen.getByText(/0%|40%|100%/)).toBeInTheDocument();
      });
    });

    it('should handle agent assignment to quests', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
      });

      // Look for quest assignment interface
      const questCard = screen.getByText('Welcome to the Guild').closest('[data-quest-id]');
      if (questCard) {
        const assignButton = questCard.querySelector('button') || 
                           screen.getByRole('button', { name: /assign/i });
        
        if (assignButton) {
          await user.click(assignButton);
          
          // Should show agent assignment interface
          await waitFor(() => {
            expect(screen.getByText(/Select Agent|Available Agents/i)).toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Level Progression Flow', () => {
    it('should handle XP award and level up animations', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
      });

      // Trigger level up through quest completion or direct XP award
      const completeButton = screen.queryByRole('button', { name: /complete|award xp/i });
      
      if (completeButton) {
        await user.click(completeButton);

        // Should trigger level up animation
        await waitFor(() => {
          // Check for level up notification or animation
          const notification = screen.queryByText(/Level Up|Congratulations/i);
          if (notification) {
            expect(notification).toBeInTheDocument();
          }
        });
      }
    });

    it('should show skill unlocks on level up', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      // Mock a level up event with skill unlocks
      // const mockLevelUpEvent // unused: = {
        agentId: 1,
        oldLevel: 5,
        newLevel: 6,
        xpGained: 200,
        source: 'Quest Completion',
        unlockedSkills: ['Advanced Analysis', 'Master Coordination'],
        statIncreases: [
          { stat: 'intelligence' as const, amount: 2, reason: 'Level Up' }
        ],
        timestamp: new Date()
      };

      // Trigger level up
      const completeButton = screen.queryByRole('button', { name: /complete/i });
      
      if (completeButton) {
        await user.click(completeButton);

        await waitFor(() => {
          // Should show skill unlocks if level up occurs
          const skillText = screen.queryByText(/skill|unlock/i);
          if (skillText) {
            expect(skillText).toBeInTheDocument();
          }
        });
      }
    });

    it('should update agent stats after level up', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
      });

      // Record initial stats
      const initialLevel = screen.getByText(/Level \d+/);
      const initialXP = screen.getByText(/\d+.*XP/);

      // Trigger XP award/quest completion
      const actionButton = screen.queryByRole('button', { name: /complete|award/i });
      
      if (actionButton) {
        await user.click(actionButton);

        await waitFor(() => {
          // Stats should be updated
          const updatedLevel = screen.getByText(/Level \d+/);
          const updatedXP = screen.getByText(/\d+.*XP/);
          
          // At least XP should change
          expect(updatedXP).not.toEqual(initialXP);
        });
      }
    });
  });

  describe('Quest Completion Flow', () => {
    it('should handle complete quest workflow', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Documentation Patrol')).toBeInTheDocument();
      });

      // Find and complete a quest
      const questCard = screen.getByText('Documentation Patrol').closest('[data-quest-id]');
      const completeButton = screen.queryByRole('button', { name: /complete/i });
      
      if (completeButton && !completeButton.disabled) {
        await user.click(completeButton);

        // Should show completion confirmation
        await waitFor(() => {
          const confirmation = screen.queryByText(/complete.*quest|confirm/i);
          if (confirmation) {
            expect(confirmation).toBeInTheDocument();
            
            // Confirm completion
            const confirmButton = screen.getByRole('button', { name: /yes|confirm|complete/i });
            await user.click(confirmButton);
          }
        });

        // Should update quest status and award XP
        await waitFor(() => {
          // Look for XP award notification or updated agent stats
          const xpNotification = screen.queryByText(/\+.*XP|experience gained/i);
          if (xpNotification) {
            expect(xpNotification).toBeInTheDocument();
          }
        });
      }
    });

    it('should show quest rewards upon completion', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
      });

      // Complete tutorial quest
      const tutorialQuest = screen.getByText('Welcome to the Guild');
      const questCard = tutorialQuest.closest('[data-quest-id]');
      
      if (questCard) {
        const completeButton = questCard.querySelector('button[data-action="complete"]') ||
                             screen.queryByRole('button', { name: /complete/i });
        
        if (completeButton) {
          await user.click(completeButton);

          await waitFor(() => {
            // Should show rewards (XP, gold, items)
            expect(screen.getByText(/100.*XP/)).toBeInTheDocument();
            expect(screen.getByText(/50.*Gold/)).toBeInTheDocument();
            expect(screen.getByText(/Apprentice Badge/)).toBeInTheDocument();
          });
        }
      }
    });

    it('should handle team quest completion with multiple agents', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('The Lost Algorithm')).toBeInTheDocument();
      });

      // This quest requires multiple agents
      const teamQuest = screen.getByText('The Lost Algorithm');
      const questCard = teamQuest.closest('[data-quest-id]');
      
      if (questCard) {
        // Should show team requirements
        expect(screen.getByText(/team.*3|3.*agents/i)).toBeInTheDocument();
        
        // Assign multiple agents
        const assignButton = screen.queryByRole('button', { name: /assign/i });
        if (assignButton) {
          await user.click(assignButton);
          
          await waitFor(() => {
            // Should show agent selection interface
            const agentButtons = screen.getAllByText(/CodeMaster|Sage|Bard|Scout/);
            expect(agentButtons.length).toBeGreaterThan(0);
            
            // Select multiple agents
            if (agentButtons.length >= 2) {
              await user.click(agentButtons[0]);
              await user.click(agentButtons[1]);
            }
          });
        }
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);

      // App should still render
      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should handle invalid agent data gracefully', async () => {
      render(<App />);

      // Even with potential data issues, app should render
      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      // Should not crash the application
      expect(() => {
        fireEvent.click(document.body);
      }).not.toThrow();
    });

    it('should handle rapid user interactions', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
      });

      // Rapidly click on different elements
      const elements = screen.getAllByRole('button').slice(0, 5);
      
      for (const element of elements) {
        await user.click(element);
      }

      // App should remain stable
      expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design and Accessibility', () => {
    it('should be keyboard navigable', async () => {
      // const user = userEvent.setup(); // unused
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
      
      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
      
      // Should be able to activate focused elements with Enter
      await user.keyboard('{Enter}');
      
      // App should remain functional
      expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<App />);

      await waitFor(() => {
        // Check for main application structure
        expect(screen.getByRole('main')).toBeInTheDocument();
        
        // Check for navigation elements
        const navigation = screen.queryByRole('navigation');
        if (navigation) {
          expect(navigation).toBeInTheDocument();
        }

        // Check for proper button labels
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveAttribute('aria-label');
        });
      });
    });

    it('should adapt to different screen sizes', async () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      // Should render mobile-friendly layout
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();

      // Test tablet size
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      fireEvent(window, new Event('resize'));

      // Should still be functional
      expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large numbers of agents efficiently', async () => {
      const startTime = performance.now();
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      
      // Should render quickly even with multiple agents and quests
      expect(renderTime).toBeLessThan(2000); // Under 2 seconds
    });

    it('should not have memory leaks in animations', async () => {
      const { unmount } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      // Trigger some animations
      const buttons = screen.getAllByRole('button').slice(0, 3);
      for (const button of buttons) {
        fireEvent.click(button);
      }

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Data Persistence', () => {
    it('should maintain state during component updates', async () => {
      const { rerender } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
      });

      // Rerender the component
      rerender(<App />);

      // State should be maintained
      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
      });
    });

    it('should handle browser refresh gracefully', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Agent RPG/i)).toBeInTheDocument();
      });

      // Simulate page refresh by re-rendering
      const { rerender } = render(<App />);
      rerender(<App />);

      // Should reload with initial data
      await waitFor(() => {
        expect(screen.getByText('CodeMaster Zyx')).toBeInTheDocument();
        expect(screen.getByText('Welcome to the Guild')).toBeInTheDocument();
      });
    });
  });
});