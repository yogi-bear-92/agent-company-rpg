// Performance benchmarking suite for Agent Company RPG
import { Agent } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';
import { initialAgents } from '../../src/data/agents';
import { optimizedUtils } from '../optimization/xp-calculator-optimized';
import * as originalUtils from '../../src/utils/xpCalculator';

export interface BenchmarkResult {
  testName: string;
  originalTime: number;
  optimizedTime: number;
  improvement: number; // Percentage improvement
  iterations: number;
  memoryUsage?: {
    before: number;
    after: number;
  };
}

export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  // Benchmark XP calculation performance
  async benchmarkXpCalculations(iterations = 1000): Promise<BenchmarkResult> {
    const testAgents = this.generateTestAgents(100);
    const testQuest = this.generateTestQuest();
    
    const memoryBefore = this.getMemoryUsage();
    
    // Test original implementation
    const originalStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testAgents.forEach(agent => {
        originalUtils.calculateQuestXpReward(testQuest, agent, 30, 2);
      });
    }
    const originalTime = performance.now() - originalStart;
    
    // Test optimized implementation
    const optimizedStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testAgents.forEach(agent => {
        optimizedUtils.calculateQuestXpRewardOptimized(testQuest, agent, {
          completionTime: 30,
          optionalObjectivesCompleted: 2
        });
      });
    }
    const optimizedTime = performance.now() - optimizedStart;
    
    const memoryAfter = this.getMemoryUsage();
    const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
    
    const result: BenchmarkResult = {
      testName: 'XP Calculations',
      originalTime,
      optimizedTime,
      improvement,
      iterations: iterations * testAgents.length,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter
      }
    };
    
    this.results.push(result);
    return result;
  }

  // Benchmark level calculation performance
  async benchmarkLevelCalculations(iterations = 10000): Promise<BenchmarkResult> {
    const testXpValues = this.generateTestXpValues(1000);
    
    const memoryBefore = this.getMemoryUsage();
    
    // Test original implementation
    const originalStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testXpValues.forEach(xp => {
        originalUtils.calculateLevelFromXp(xp);
      });
    }
    const originalTime = performance.now() - originalStart;
    
    // Test optimized implementation
    const optimizedStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testXpValues.forEach(xp => {
        optimizedUtils.calculateLevelFromXp(xp);
      });
    }
    const optimizedTime = performance.now() - optimizedStart;
    
    const memoryAfter = this.getMemoryUsage();
    const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
    
    const result: BenchmarkResult = {
      testName: 'Level Calculations',
      originalTime,
      optimizedTime,
      improvement,
      iterations: iterations * testXpValues.length,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter
      }
    };
    
    this.results.push(result);
    return result;
  }

  // Benchmark batch operations
  async benchmarkBatchOperations(iterations = 100): Promise<BenchmarkResult> {
    const testAgents = this.generateTestAgents(50);
    const testXpAwards = testAgents.map((agent, index) => ({
      agentId: agent.id,
      amount: 100 + (index * 10),
      source: `Benchmark test ${index}`
    }));
    
    const memoryBefore = this.getMemoryUsage();
    
    // Test individual operations
    const originalStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testXpAwards.forEach(award => {
        const agent = testAgents.find(a => a.id === award.agentId)!;
        originalUtils.applyXpToAgent(agent, award.amount, award.source);
      });
    }
    const originalTime = performance.now() - originalStart;
    
    // Test batch operations
    const optimizedStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      optimizedUtils.batchApplyXpToAgents(testAgents, testXpAwards);
    }
    const optimizedTime = performance.now() - optimizedStart;
    
    const memoryAfter = this.getMemoryUsage();
    const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
    
    const result: BenchmarkResult = {
      testName: 'Batch XP Operations',
      originalTime,
      optimizedTime,
      improvement,
      iterations: iterations * testXpAwards.length,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter
      }
    };
    
    this.results.push(result);
    return result;
  }

  // Benchmark React component render performance
  async benchmarkComponentRenders(): Promise<BenchmarkResult> {
    const testAgents = this.generateTestAgents(20);
    const iterations = 100;
    
    const memoryBefore = this.getMemoryUsage();
    
    // Simulate component renders with complex calculations
    const originalStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testAgents.forEach(agent => {
        // Simulate expensive calculations that happen during render
        (agent.xp / agent.xpToNext) * 100;
        testAgents.reduce((sum, a) => sum + a.level, 0);
        testAgents.reduce((sum, a) => sum + a.knowledgeBase.totalMemories, 0);
      });
    }
    const originalTime = performance.now() - originalStart;
    
    // Simulate optimized renders with memoization
    const memoizedCalculations = new Map();
    const optimizedStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      testAgents.forEach(agent => {
        const key = `${agent.id}_${agent.xp}_${agent.xpToNext}`;
        if (!memoizedCalculations.has(key)) {
          const percentage = (agent.xp / agent.xpToNext) * 100;
          memoizedCalculations.set(key, percentage);
        }
      });
      
      // Cache aggregate calculations
      if (!memoizedCalculations.has('totalLevels')) {
        const totalLevels = testAgents.reduce((sum, a) => sum + a.level, 0);
        memoizedCalculations.set('totalLevels', totalLevels);
      }
      if (!memoizedCalculations.has('totalMemories')) {
        const totalMemories = testAgents.reduce((sum, a) => sum + a.knowledgeBase.totalMemories, 0);
        memoizedCalculations.set('totalMemories', totalMemories);
      }
    }
    const optimizedTime = performance.now() - optimizedStart;
    
    const memoryAfter = this.getMemoryUsage();
    const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
    
    const result: BenchmarkResult = {
      testName: 'Component Renders',
      originalTime,
      optimizedTime,
      improvement,
      iterations: iterations * testAgents.length,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter
      }
    };
    
    this.results.push(result);
    return result;
  }

  // Run all benchmarks
  async runFullBenchmarkSuite(): Promise<BenchmarkResult[]> {
    console.log('Starting performance benchmark suite...');
    
    const results = await Promise.all([
      this.benchmarkXpCalculations(),
      this.benchmarkLevelCalculations(),
      this.benchmarkBatchOperations(),
      this.benchmarkComponentRenders()
    ]);
    
    console.log('Benchmark suite completed!');
    return results;
  }

  // Generate comprehensive performance report
  generatePerformanceReport(): {
    summary: {
      averageImprovement: number;
      totalTestsRun: number;
      memoryEfficiency: number;
    };
    results: BenchmarkResult[];
    recommendations: string[];
  } {
    const averageImprovement = this.results.reduce((sum, r) => sum + r.improvement, 0) / this.results.length;
    const totalTests = this.results.reduce((sum, r) => sum + r.iterations, 0);
    
    const memoryEfficiency = this.calculateMemoryEfficiency();
    const recommendations = this.generateOptimizationRecommendations();
    
    return {
      summary: {
        averageImprovement,
        totalTestsRun: totalTests,
        memoryEfficiency
      },
      results: [...this.results],
      recommendations
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as unknown).memory.usedJSHeapSize;
    }
    return 0;
  }

  private calculateMemoryEfficiency(): number {
    const memoryResults = this.results.filter(r => r.memoryUsage);
    if (memoryResults.length === 0) return 100;
    
    const avgMemoryIncrease = memoryResults.reduce((sum, r) => {
      const increase = r.memoryUsage!.after - r.memoryUsage!.before;
      return sum + increase;
    }, 0) / memoryResults.length;
    
    // Return efficiency as percentage (lower memory increase = higher efficiency)
    return Math.max(0, 100 - (avgMemoryIncrease / 1024 / 1024)); // Convert to MB
  }

  private generateOptimizationRecommendations(): string[] {
    const recommendations = [];
    
    const avgImprovement = this.results.reduce((sum, r) => sum + r.improvement, 0) / this.results.length;
    
    if (avgImprovement < 20) {
      recommendations.push('Consider implementing Web Workers for heavy calculations');
      recommendations.push('Add more aggressive memoization for frequently accessed data');
    }
    
    if (avgImprovement > 50) {
      recommendations.push('Excellent optimization results! Consider applying similar patterns to other components');
    }
    
    const memoryEfficiency = this.calculateMemoryEfficiency();
    if (memoryEfficiency < 80) {
      recommendations.push('Implement object pooling for frequently created objects');
      recommendations.push('Add garbage collection optimization with WeakMap/WeakSet');
    }
    
    recommendations.push('Monitor performance in production with real user data');
    recommendations.push('Set up automated performance regression testing');
    
    return recommendations;
  }

  private generateTestAgents(count: number): Agent[] {
    const agents: Agent[] = [];
    for (let i = 0; i < count; i++) {
      agents.push({
        ...initialAgents[i % initialAgents.length],
        id: i + 1000, // Unique IDs
        xp: Math.floor(Math.random() * 5000),
        level: Math.floor(Math.random() * 20) + 1
      });
    }
    return agents;
  }

  private generateTestQuest(): Quest {
    return {
      id: 'benchmark-quest',
      title: 'Benchmark Quest',
      description: 'A test quest for benchmarking',
      type: 'side',
      category: 'Investigation',
      difficulty: 'Medium',
      status: 'active',
      icon: '⚔️',
      objectives: [
        { id: '1', description: 'Test objective', completed: true, progress: 1, maxProgress: 1 },
        { id: '2', description: 'Optional objective', completed: true, progress: 1, maxProgress: 1, optional: true }
      ],
      currentObjectiveIndex: 0,
      progressPercentage: 100,
      requirements: {},
      rewards: { xp: 150 },
      bonusRewards: { xp: 50 },
      assignedAgents: [1000, 1001],
      recommendedTeamSize: 2,
      autoAssign: false,
      dialogue: [],
      createdAt: new Date(),
      repeatable: false,
      timeLimit: 60
    };
  }

  private generateTestXpValues(count: number): number[] {
    const values = [];
    for (let i = 0; i < count; i++) {
      values.push(Math.floor(Math.random() * 50000)); // Random XP up to level ~25
    }
    return values;
  }

  clearResults() {
    this.results = [];
  }

  getResults() {
    return [...this.results];
  }
}

// Global benchmark instance
export const performanceBenchmark = new PerformanceBenchmark();

// Utility functions for quick performance tests
export function quickBenchmark(testFunction: () => void, iterations = 1000): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    testFunction();
  }
  return performance.now() - start;
}

export function comparePerformance(
  originalFn: () => void,
  optimizedFn: () => void,
  iterations = 1000
): { improvement: number; originalTime: number; optimizedTime: number } {
  const originalTime = quickBenchmark(originalFn, iterations);
  const optimizedTime = quickBenchmark(optimizedFn, iterations);
  const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
  
  return { improvement, originalTime, optimizedTime };
}

export default performanceBenchmark;