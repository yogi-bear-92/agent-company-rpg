// Component performance tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { performanceTestUtils, expectFastRender, expectLowMemoryUsage } from './setup-performance-tests';
import { OptimizedAgentCard, OptimizedXPBar, VirtualizedAgentList } from '../optimization/react-optimizations';

describe('Component Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OptimizedAgentCard', () => {
    it('should render quickly with complex agent data', async () => {
      const testAgent = performanceTestUtils.createTestAgent(1);
      const mockRenderXPBar = vi.fn(() => <div>XP Bar</div>);
      const mockOnSelect = vi.fn();

      const { result, time } = await performanceTestUtils.measureTime(() => {
        render(
          <OptimizedAgentCard
            agent={testAgent}
            isLeveling={false}
            onSelect={mockOnSelect}
            renderXPBar={mockRenderXPBar}
          />
        );
      });

      expectFastRender(time);
      expect(screen.getByText(testAgent.name)).toBeInTheDocument();
    });

    it('should handle rapid re-renders efficiently', async () => {
      const testAgent = performanceTestUtils.createTestAgent(1);
      const mockRenderXPBar = vi.fn(() => <div>XP Bar</div>);
      const mockOnSelect = vi.fn();

      const { time } = await performanceTestUtils.measureTime(() => {
        // Simulate multiple rapid re-renders
        for (let i = 0; i < 10; i++) {
          const { rerender } = render(
            <OptimizedAgentCard
              agent={{ ...testAgent, xp: testAgent.xp + i }}
              isLeveling={i % 2 === 0}
              onSelect={mockOnSelect}
              renderXPBar={mockRenderXPBar}
            />
          );
          
          rerender(
            <OptimizedAgentCard
              agent={{ ...testAgent, xp: testAgent.xp + i + 1 }}
              isLeveling={i % 2 === 1}
              onSelect={mockOnSelect}
              renderXPBar={mockRenderXPBar}
            />
          );
        }
      });

      // Should handle 20 renders in under 100ms
      expect(time).toBeLessThan(100);
    });
  });

  describe('OptimizedXPBar', () => {
    it('should render XP bar with minimal computation', async () => {
      const { time } = await performanceTestUtils.measureTime(() => {
        render(
          <OptimizedXPBar
            current={750}
            toNext={1000}
            level={5}
            isLeveling={false}
          />
        );
      });

      expectFastRender(time);
    });

    it('should handle level-up animations efficiently', async () => {
      const { time } = await performanceTestUtils.measureTime(() => {
        render(
          <OptimizedXPBar
            current={750}
            toNext={1000}
            level={5}
            isLeveling={true}
          />
        );
      });

      expectFastRender(time);
    });
  });

  describe('VirtualizedAgentList', () => {
    it('should render large agent lists efficiently', async () => {
      const largeAgentList = performanceTestUtils.generateTestData.agents(1000);
      const mockRenderItem = vi.fn((agent, index) => (
        <div key={agent.id} data-testid={`agent-${agent.id}`}>
          {agent.name} - {index}
        </div>
      ));

      const { time } = await performanceTestUtils.measureTime(() => {
        render(
          <VirtualizedAgentList
            agents={largeAgentList}
            renderItem={mockRenderItem}
            itemHeight={200}
            containerHeight={600}
          />
        );
      });

      // Should render 1000 agents (virtualized) in under 50ms
      expect(time).toBeLessThan(50);
      
      // Should only render visible items (3-4 items for 600px container with 200px items)
      expect(mockRenderItem).toHaveBeenCalledTimes(4); // 3 visible + 1 buffer
    });

    it('should handle scrolling efficiently', async () => {
      const largeAgentList = performanceTestUtils.generateTestData.agents(1000);
      const mockRenderItem = vi.fn((agent, index) => (
        <div key={agent.id}>{agent.name}</div>
      ));

      const { container } = render(
        <VirtualizedAgentList
          agents={largeAgentList}
          renderItem={mockRenderItem}
          itemHeight={200}
          containerHeight={600}
        />
      );

      const scrollContainer = container.firstChild as HTMLElement;
      
      const { time } = await performanceTestUtils.measureTime(() => {
        // Simulate rapid scrolling
        for (let i = 0; i < 10; i++) {
          scrollContainer.scrollTop = i * 200;
          // Trigger scroll event
          scrollContainer.dispatchEvent(new Event('scroll'));
        }
      });

      // Scrolling should be very fast
      expect(time).toBeLessThan(20);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during component re-renders', () => {
      const testAgent = performanceTestUtils.createTestAgent(1);
      const mockRenderXPBar = vi.fn(() => <div>XP Bar</div>);
      const mockOnSelect = vi.fn();

      const memoryIncrease = performanceTestUtils.measureMemory(() => {
        // Render and unmount component 100 times
        for (let i = 0; i < 100; i++) {
          const { unmount } = render(
            <OptimizedAgentCard
              agent={testAgent}
              isLeveling={false}
              onSelect={mockOnSelect}
              renderXPBar={mockRenderXPBar}
            />
          );
          unmount();
        }
      });

      expectLowMemoryUsage(memoryIncrease);
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should handle complete app re-render efficiently', async () => {
      const largeAgentList = performanceTestUtils.generateTestData.agents(50);
      
      const { time } = await performanceTestUtils.measureTime(() => {
        // Simulate full app re-render with state changes
        largeAgentList.forEach((agent, index) => {
          render(
            <OptimizedAgentCard
              agent={{ ...agent, xp: agent.xp + index }}
              isLeveling={index % 5 === 0}
              onSelect={vi.fn()}
              renderXPBar={vi.fn(() => <div>XP</div>)}
            />
          );
        });
      });

      // 50 agent cards should render in under 200ms
      expect(time).toBeLessThan(200);
    });

    it('should handle concurrent animations efficiently', async () => {
      const testAgents = performanceTestUtils.generateTestData.agents(10);
      
      const { time } = await performanceTestUtils.measureTime(() => {
        // Render multiple leveling agents simultaneously
        testAgents.forEach(agent => {
          render(
            <OptimizedXPBar
              current={agent.xp}
              toNext={agent.xpToNext}
              level={agent.level}
              isLeveling={true}
            />
          );
        });
      });

      // Multiple concurrent animations should start quickly
      expect(time).toBeLessThan(50);
    });
  });
});