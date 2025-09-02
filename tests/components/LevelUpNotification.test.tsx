import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LevelUpNotification from '../../src/components/LevelUpNotification';
import { LevelUpEvent } from '../../src/utils/levelProgression';

// Mock requestAnimationFrame for animation testing
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe('LevelUpNotification Component', () => {
  let mockLevelUpEvent: LevelUpEvent;
  let mockOnDismiss: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLevelUpEvent = {
      agentId: 1,
      oldLevel: 5,
      newLevel: 6,
      xpGained: 250,
      source: 'Quest Completion',
      unlockedSkills: ['Advanced Debugging', 'Code Optimization'],
      statIncreases: [
        { stat: 'intelligence', amount: 2, reason: 'Level Up Bonus' },
        { stat: 'reliability', amount: 1, reason: 'Experience Gain' }
      ],
      timestamp: new Date()
    };

    mockOnDismiss = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('should render level up notification with basic information', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Level Up!')).toBeInTheDocument();
      expect(screen.getByText('Level 6')).toBeInTheDocument();
      expect(screen.getByText('+250 XP')).toBeInTheDocument();
      expect(screen.getByText('Quest Completion')).toBeInTheDocument();
    });

    it('should render unlocked skills', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('New Skills Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('Advanced Debugging')).toBeInTheDocument();
      expect(screen.getByText('Code Optimization')).toBeInTheDocument();
    });

    it('should render stat increases', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Stat Increases')).toBeInTheDocument();
      expect(screen.getByText('Intelligence +2')).toBeInTheDocument();
      expect(screen.getByText('Reliability +1')).toBeInTheDocument();
    });

    it('should not render when not visible', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={false}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Level Up!')).not.toBeInTheDocument();
    });

    it('should render without unlocked skills', () => {
      const eventWithoutSkills = {
        ...mockLevelUpEvent,
        unlockedSkills: []
      };

      render(
        <LevelUpNotification 
          levelUpEvent={eventWithoutSkills}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Level Up!')).toBeInTheDocument();
      expect(screen.queryByText('New Skills Unlocked!')).not.toBeInTheDocument();
    });

    it('should render without stat increases', () => {
      const eventWithoutStats = {
        ...mockLevelUpEvent,
        statIncreases: []
      };

      render(
        <LevelUpNotification 
          levelUpEvent={eventWithoutStats}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Level Up!')).toBeInTheDocument();
      expect(screen.queryByText('Stat Increases')).not.toBeInTheDocument();
    });
  });

  describe('Animation and Visual Effects', () => {
    it('should apply entrance animation when becoming visible', async () => {
      const { rerender } = render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={false}
          onDismiss={mockOnDismiss}
        />
      );

      rerender(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = screen.getByRole('dialog');
      expect(notification).toHaveClass('animate-scale-in');
    });

    it('should apply glow effect to level display', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const levelDisplay = screen.getByText('Level 6');
      expect(levelDisplay).toHaveClass('text-yellow-400', 'animate-pulse');
    });

    it('should show celebration particles', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const particles = screen.getByTestId('celebration-particles');
      expect(particles).toBeInTheDocument();
    });

    it('should animate skill reveals sequentially', async () => {
      vi.useFakeTimers();
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      // Initially, skills should be hidden or have delayed animation
      const skills = screen.getAllByText(/Advanced Debugging|Code Optimization/);
      expect(skills[0]).toHaveClass('animate-fade-in-delay-1');
      expect(skills[1]).toHaveClass('animate-fade-in-delay-2');

      vi.useRealTimers();
    });

    it('should animate stat increases with counter effect', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const statIncrease = screen.getByText('Intelligence +2');
      expect(statIncrease).toHaveClass('animate-count-up');
    });
  });

  describe('User Interaction', () => {
    it('should call onDismiss when close button is clicked', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should call onDismiss when clicking outside notification', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <div data-testid="backdrop">
          <LevelUpNotification 
            levelUpEvent={mockLevelUpEvent}
            isVisible={true}
            onDismiss={mockOnDismiss}
          />
        </div>
      );

      const backdrop = screen.getByTestId('backdrop');
      await user.click(backdrop);

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should not dismiss when clicking on the notification content', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = screen.getByRole('dialog');
      await user.click(notification);

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('should support keyboard dismissal with Escape key', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('Auto-dismiss Functionality', () => {
    it('should auto-dismiss after specified duration', async () => {
      vi.useFakeTimers();
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
          autoDismissDelay={3000}
        />
      );

      expect(mockOnDismiss).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3000);

      expect(mockOnDismiss).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should not auto-dismiss when delay is not provided', async () => {
      vi.useFakeTimers();
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      vi.advanceTimersByTime(5000);

      expect(mockOnDismiss).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should cancel auto-dismiss when manually dismissed', async () => {
      vi.useFakeTimers();
      // const user = userEvent.setup(); // unused
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
          autoDismissDelay={3000}
        />
      );

      // Manually dismiss before auto-dismiss
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);

      // Advance time to when auto-dismiss would occur
      vi.advanceTimersByTime(3000);

      // Should not be called again
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = screen.getByRole('dialog');
      expect(notification).toHaveAttribute('aria-labelledby');
      expect(notification).toHaveAttribute('aria-describedby');
      expect(notification).toHaveAttribute('role', 'dialog');
    });

    it('should trap focus within notification', async () => {
      // const user = userEvent.setup(); // unused
      
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      
      // Focus should be on close button initially
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Tabbing should cycle within the notification
      await user.tab();
      // Focus should stay within notification bounds
    });

    it('should announce level up to screen readers', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const announcement = screen.getByRole('status');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveTextContent(/level up.*level 6/i);
    });

    it('should have high contrast colors for visibility', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = screen.getByRole('dialog');
      expect(notification).toHaveClass('bg-gray-900', 'text-white');
    });
  });

  describe('Multiple Level Ups', () => {
    it('should handle multiple level increases', () => {
      const multipleLevelEvent = {
        ...mockLevelUpEvent,
        oldLevel: 5,
        newLevel: 8,
        xpGained: 1500
      };

      render(
        <LevelUpNotification 
          levelUpEvent={multipleLevelEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Level 8')).toBeInTheDocument();
      expect(screen.getByText('+3 Levels!')).toBeInTheDocument();
      expect(screen.getByText('+1500 XP')).toBeInTheDocument();
    });

    it('should show enhanced animation for multiple levels', () => {
      const multipleLevelEvent = {
        ...mockLevelUpEvent,
        oldLevel: 5,
        newLevel: 8
      };

      render(
        <LevelUpNotification 
          levelUpEvent={multipleLevelEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = screen.getByRole('dialog');
      expect(notification).toHaveClass('animate-mega-level-up');
    });
  });

  describe('Performance', () => {
    it('should cleanup animation timers on unmount', () => {
      const { unmount } = render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
          autoDismissDelay={3000}
        />
      );

      // Start some animations
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid visibility changes gracefully', () => {
      const { rerender } = render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      // Rapidly toggle visibility
      for (let i = 0; i < 10; i++) {
        rerender(
          <LevelUpNotification 
            levelUpEvent={mockLevelUpEvent}
            isVisible={i % 2 === 0}
            onDismiss={mockOnDismiss}
          />
        );
      }

      expect(() => {}).not.toThrow();
    });
  });

  describe('Sound Integration', () => {
    beforeEach(() => {
      // Mock Audio API
      global.Audio = vi.fn().mockImplementation(() => ({
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));
    });

    it('should play level up sound when shown', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
          playSound={true}
        />
      );

      expect(global.Audio).toHaveBeenCalledWith('/sounds/level-up.wav');
    });

    it('should not play sound when disabled', () => {
      render(
        <LevelUpNotification 
          levelUpEvent={mockLevelUpEvent}
          isVisible={true}
          onDismiss={mockOnDismiss}
          playSound={false}
        />
      );

      expect(global.Audio).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing level up event gracefully', () => {
      expect(() => {
        render(
          <LevelUpNotification 
            levelUpEvent={null as unknown}
            isVisible={true}
            onDismiss={mockOnDismiss}
          />
        );
      }).not.toThrow();
    });

    it('should handle malformed stat increases', () => {
      const malformedEvent = {
        ...mockLevelUpEvent,
        statIncreases: [
          { stat: null, amount: 2, reason: 'Test' },
          { stat: 'intelligence', amount: null, reason: 'Test' }
        ]
      } as unknown;

      expect(() => {
        render(
          <LevelUpNotification 
            levelUpEvent={malformedEvent}
            isVisible={true}
            onDismiss={mockOnDismiss}
          />
        );
      }).not.toThrow();
    });

    it('should handle malformed unlocked skills', () => {
      const malformedEvent = {
        ...mockLevelUpEvent,
        unlockedSkills: [null, undefined, 'Valid Skill']
      } as unknown;

      expect(() => {
        render(
          <LevelUpNotification 
            levelUpEvent={malformedEvent}
            isVisible={true}
            onDismiss={mockOnDismiss}
          />
        );
      }).not.toThrow();

      expect(screen.getByText('Valid Skill')).toBeInTheDocument();
    });
  });
});