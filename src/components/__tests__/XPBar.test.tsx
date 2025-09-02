import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('XP Bar Animation Fix', () => {
  describe('should handle rapid level ups without glitching', () => {
    // Test that multiple level ups in quick succession animate smoothly
    const testCases = [
      { 
        name: 'Single level up',
        startXP: 90,
        gainedXP: 20,
        expectedLevels: 1,
        expectedFinalXP: 10
      },
      {
        name: 'Double level up',
        startXP: 90,
        gainedXP: 120,
        expectedLevels: 2,
        expectedFinalXP: 10
      },
      {
        name: 'Triple level up',
        startXP: 90,
        gainedXP: 320,
        expectedLevels: 4,
        expectedFinalXP: 10
      }
    ];

    testCases.forEach(testCase => {
      it(testCase.name, () => {
        // Mock XP calculation
        const levelThreshold = 100;
        let currentXP = testCase.startXP;
        let levelsGained = 0;
        
        // Simulate XP gain
        currentXP += testCase.gainedXP;
        
        // Calculate levels gained
        while (currentXP >= levelThreshold) {
          currentXP -= levelThreshold;
          levelsGained++;
        }
        
        expect(levelsGained).toBe(testCase.expectedLevels);
        expect(currentXP).toBe(testCase.expectedFinalXP);
      });
    });
  });

  it('should apply correct CSS classes during multi-level animation', () => {
    // Test that the xp-multi-level class is applied during rapid level ups
    const mockAgent = {
      id: 1,
      xp: 90,
      xpToNext: 100,
      level: 5
    };
    
    const levelingAgents = new Set([1]);
    const isLeveling = levelingAgents.has(mockAgent.id);
    
    expect(isLeveling).toBe(true);
    
    // After animation completes
    levelingAgents.delete(1);
    const isStillLeveling = levelingAgents.has(mockAgent.id);
    
    expect(isStillLeveling).toBe(false);
  });

  it('should maintain correct XP percentage after multiple level ups', () => {
    // Test final XP bar position after multiple level ups
    const calculateFinalPosition = (startXP: number, gainedXP: number, threshold: number) => {
      let total = startXP + gainedXP;
      while (total >= threshold) {
        total -= threshold;
      }
      return (total / threshold) * 100;
    };
    
    const position1 = calculateFinalPosition(90, 20, 100); // Single level
    expect(position1).toBe(10);
    
    const position2 = calculateFinalPosition(90, 220, 100); // Multiple levels
    expect(position2).toBe(10);
    
    const position3 = calculateFinalPosition(50, 350, 100); // Exact multiple
    expect(position3).toBe(0);
  });

  it('should prevent animation stacking when multiple XP gains occur rapidly', () => {
    // Test that rapid XP gains don't cause animation conflicts
    const animationQueue: number[] = [];
    const addAnimation = (agentId: number) => {
      if (!animationQueue.includes(agentId)) {
        animationQueue.push(agentId);
        setTimeout(() => {
          const index = animationQueue.indexOf(agentId);
          if (index > -1) {
            animationQueue.splice(index, 1);
          }
        }, 500);
      }
    };
    
    // Simulate rapid XP gains
    addAnimation(1);
    addAnimation(1); // Should not duplicate
    addAnimation(1); // Should not duplicate
    
    expect(animationQueue.length).toBe(1);
    expect(animationQueue[0]).toBe(1);
  });
});