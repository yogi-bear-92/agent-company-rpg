// Performance testing setup and utilities
import '@testing-library/jest-dom';

// Mock performance APIs for testing environment
(global as unknown).performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByType: () => [],
  getEntriesByName: () => [],
  clearMarks: () => {},
  clearMeasures: () => {},
  memory: {
    usedJSHeapSize: 10 * 1024 * 1024, // 10MB
    totalJSHeapSize: 20 * 1024 * 1024, // 20MB
    jsHeapSizeLimit: 100 * 1024 * 1024 // 100MB
  }
};

// Mock PerformanceObserver for testing
(global as unknown).PerformanceObserver = class MockPerformanceObserver {
  constructor(private callback: (list: unknown) => void) {}
  observe() {}
  disconnect() {}
};

// Mock requestAnimationFrame
(global as unknown).requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16); // ~60fps
};

(global as unknown).cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Performance test utilities
export const performanceTestUtils = {
  // Create deterministic test data
  createTestAgent: (id: number) => ({
    id,
    name: `Test Agent ${id}`,
    class: 'Code Master',
    level: Math.floor(Math.random() * 20) + 1,
    xp: Math.floor(Math.random() * 5000),
    xpToNext: 1000,
    stats: {
      intelligence: 75,
      creativity: 65,
      reliability: 80,
      speed: 70,
      leadership: 60
    },
    specializations: ['Testing', 'Performance'],
    currentMission: 'Running tests',
    personality: 'Methodical',
    avatar: '🧪',
    knowledgeBase: {
      totalMemories: 100,
      recentLearning: 'Performance testing',
      knowledgeDomains: {
        testing: 90,
        performance: 85
      },
      crawlingProgress: {
        active: false,
        lastUrl: '',
        pagesLearned: 0,
        knowledgeGained: 0
      }
    },
    equipment: {
      primary: 'Test Framework',
      secondary: 'Performance Monitor',
      utility: 'Benchmark Suite'
    },
    relationships: [],
    skillTree: {
      'Testing Mastery': { level: 5, maxLevel: 10, unlocked: true }
    },
    realtimeActivity: [
      {
        timestamp: new Date().toISOString(),
        action: 'Performance testing',
        xpGained: 10
      }
    ]
  }),

  // Measure function execution time
  measureTime: async (fn: () => Promise<any> | any): Promise<{ result: unknown; time: number }> => {
    const start = performance.now();
    const result = await fn();
    const time = performance.now() - start;
    return { result, time };
  },

  // Create performance baseline
  createBaseline: (testName: string, iterations: number, fn: () => void) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      times.push(performance.now() - start);
    }
    
    return {
      testName,
      iterations,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      medianTime: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
    };
  },

  // Memory usage measurement
  measureMemory: (fn: () => void) => {
    const before = (performance as unknown).memory.usedJSHeapSize;
    fn();
    const after = (performance as unknown).memory.usedJSHeapSize;
    return after - before;
  },

  // Assert performance requirements
  expectPerformance: (actualTime: number, maxTime: number, testName: string) => {
    if (actualTime > maxTime) {
      throw new Error(
        `Performance assertion failed for ${testName}: ` +
        `${actualTime.toFixed(2)}ms > ${maxTime}ms (${((actualTime / maxTime - 1) * 100).toFixed(1)}% slower)`
      );
    }
  },

  // Generate large test datasets
  generateTestData: {
    agents: (count: number) => Array.from({ length: count }, (_, i) => 
      performanceTestUtils.createTestAgent(i + 1)
    ),
    
    quests: (count: number) => Array.from({ length: count }, (_, i) => ({
      id: `quest-${i}`,
      title: `Test Quest ${i}`,
      description: `Performance test quest number ${i}`,
      type: 'side',
      category: 'Investigation',
      difficulty: 'Medium',
      status: 'available',
      icon: '⚔️',
      objectives: [
        { id: '1', description: 'Test objective', completed: false, progress: 0, maxProgress: 1 }
      ],
      currentObjectiveIndex: 0,
      progressPercentage: 0,
      requirements: {},
      rewards: { xp: 100 + i * 10 },
      assignedAgents: [],
      recommendedTeamSize: 2,
      autoAssign: false,
      dialogue: [],
      createdAt: new Date(),
      repeatable: false
    }))
  }
};

// Performance assertion helpers
export function expectFastRender(renderTime: number) {
  performanceTestUtils.expectPerformance(renderTime, 16, 'Component render');
}

export function expectFastCalculation(calcTime: number) {
  performanceTestUtils.expectPerformance(calcTime, 1, 'XP calculation');
}

export function expectLowMemoryUsage(memoryIncrease: number) {
  const maxMemoryIncrease = 5 * 1024 * 1024; // 5MB
  if (memoryIncrease > maxMemoryIncrease) {
    throw new Error(
      `Memory usage too high: ${(memoryIncrease / 1024 / 1024).toFixed(1)}MB > 5MB`
    );
  }
}

export default performanceTestUtils;