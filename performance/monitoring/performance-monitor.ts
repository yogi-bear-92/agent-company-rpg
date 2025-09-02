// Performance monitoring system for Agent Company RPG
// Tracks Core Web Vitals, component performance, and user interactions

export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  
  // React-specific metrics
  renderTime: number;
  componentCount: number;
  rerenderCount: number;
  stateUpdates: number;
  
  // Application-specific metrics
  xpCalculationTime: number;
  agentListRenderTime: number;
  questFilterTime: number;
  animationFrameDrops: number;
  
  // Memory usage
  heapUsed: number;
  heapTotal: number;
  jsHeapSizeLimit: number;
  
  // Network
  bundleLoadTime: number;
  assetLoadTime: number;
  
  timestamp: number;
}

export interface PerformanceBudget {
  fcp: number; // Target: < 1.8s
  lcp: number; // Target: < 2.5s
  fid: number; // Target: < 100ms
  cls: number; // Target: < 0.1
  renderTime: number; // Target: < 16ms per frame
  bundleSize: number; // Target: < 200KB gzipped
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private budget: PerformanceBudget = {
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    renderTime: 16,
    bundleSize: 200 * 1024 // 200KB
  };
  
  private observers: {
    performance?: PerformanceObserver;
    mutation?: MutationObserver;
    intersection?: IntersectionObserver;
  } = {};

  private renderTimings: { [component: string]: number[] } = {};
  private rerenderCounts: { [component: string]: number } = {};

  constructor() {
    this.initializeObservers();
    this.startMetricsCollection();
  }

  private initializeObservers() {
    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observers.performance = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      try {
        this.observers.performance.observe({ 
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation']
        });
      } catch (e) {
        console.warn('Performance Observer not fully supported:', e);
      }
    }

    // Memory usage monitoring
    this.startMemoryMonitoring();
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.updateMetric('fcp', entry.startTime);
        }
        break;
      case 'largest-contentful-paint':
        this.updateMetric('lcp', (entry as PerformancePaintTiming).startTime);
        break;
      case 'first-input':
        const firstInputEntry = entry as PerformanceEventTiming;
        this.updateMetric('fid', firstInputEntry.processingStart - entry.startTime);
        break;
      case 'layout-shift':
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShiftEntry.hadRecentInput) {
          this.updateMetric('cls', layoutShiftEntry.value, true); // Cumulative
        }
        break;
    }
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number, cumulative = false) {
    const latestMetrics = this.getLatestMetrics();
    if (cumulative) {
      const currentValue = (latestMetrics as any)[key] as number || 0;
      (latestMetrics as any)[key] = currentValue + value;
    } else {
      (latestMetrics as any)[key] = value;
    }
  }

  private getLatestMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      this.metrics.push(this.createInitialMetrics());
    }
    return this.metrics[this.metrics.length - 1];
  }

  private createInitialMetrics(): PerformanceMetrics {
    return {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      renderTime: 0,
      componentCount: 0,
      rerenderCount: 0,
      stateUpdates: 0,
      xpCalculationTime: 0,
      agentListRenderTime: 0,
      questFilterTime: 0,
      animationFrameDrops: 0,
      heapUsed: 0,
      heapTotal: 0,
      jsHeapSizeLimit: 0,
      bundleLoadTime: 0,
      assetLoadTime: 0,
      timestamp: performance.now()
    };
  }

  private startMemoryMonitoring() {
    const collectMemoryStats = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory as {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
        this.updateMetric('heapUsed', memory.usedJSHeapSize);
        this.updateMetric('heapTotal', memory.totalJSHeapSize);
        this.updateMetric('jsHeapSizeLimit', memory.jsHeapSizeLimit);
      }
    };

    collectMemoryStats();
    setInterval(collectMemoryStats, 5000); // Every 5 seconds
  }

  private startMetricsCollection() {
    // Collect metrics every second
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 1000);

    // Clean up old metrics (keep last 100 samples)
    setInterval(() => {
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }
    }, 30000);
  }

  private collectCurrentMetrics() {
    const now = performance.now();
    const current = this.getLatestMetrics();
    
    // Calculate frame rate and dropped frames
    this.calculateFrameMetrics();
    
    // Store snapshot
    this.metrics.push({
      ...current,
      timestamp: now
    });
  }

  private calculateFrameMetrics() {
    // Track animation frame performance
    const frameStart = performance.now();
    requestAnimationFrame(() => {
      const frameEnd = performance.now();
      const frameDuration = frameEnd - frameStart;
      
      this.updateMetric('renderTime', frameDuration);
      
      if (frameDuration > 16.67) { // > 60fps
        this.updateMetric('animationFrameDrops', 1, true);
      }
    });
  }

  // Public API for components to report performance
  public measureComponentRender(componentName: string, renderStart: number) {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    if (!this.renderTimings[componentName]) {
      this.renderTimings[componentName] = [];
    }
    
    this.renderTimings[componentName].push(renderTime);
    
    // Keep only last 20 measurements
    if (this.renderTimings[componentName].length > 20) {
      this.renderTimings[componentName] = this.renderTimings[componentName].slice(-20);
    }
    
    // Track rerender count
    this.rerenderCounts[componentName] = (this.rerenderCounts[componentName] || 0) + 1;
    
    return renderTime;
  }

  public measureXpCalculation(startTime: number) {
    const duration = performance.now() - startTime;
    this.updateMetric('xpCalculationTime', duration);
    return duration;
  }

  public measureAgentListRender(startTime: number) {
    const duration = performance.now() - startTime;
    this.updateMetric('agentListRenderTime', duration);
    return duration;
  }

  public measureQuestFilter(startTime: number) {
    const duration = performance.now() - startTime;
    this.updateMetric('questFilterTime', duration);
    return duration;
  }

  public trackStateUpdate() {
    this.updateMetric('stateUpdates', 1, true);
  }

  // Analytics and reporting
  public getPerformanceReport() {
    const latest = this.getLatestMetrics();
    const warnings = this.checkBudgetViolations(latest);
    
    return {
      current: latest,
      budget: this.budget,
      warnings,
      componentTimings: this.getComponentReport(),
      recommendations: this.generateRecommendations(latest, warnings)
    };
  }

  private checkBudgetViolations(metrics: PerformanceMetrics) {
    const violations = [];
    
    if (metrics.fcp > this.budget.fcp) {
      violations.push({ metric: 'fcp', current: metrics.fcp, budget: this.budget.fcp });
    }
    if (metrics.lcp > this.budget.lcp) {
      violations.push({ metric: 'lcp', current: metrics.lcp, budget: this.budget.lcp });
    }
    if (metrics.fid > this.budget.fid) {
      violations.push({ metric: 'fid', current: metrics.fid, budget: this.budget.fid });
    }
    if (metrics.cls > this.budget.cls) {
      violations.push({ metric: 'cls', current: metrics.cls, budget: this.budget.cls });
    }
    if (metrics.renderTime > this.budget.renderTime) {
      violations.push({ metric: 'renderTime', current: metrics.renderTime, budget: this.budget.renderTime });
    }
    
    return violations;
  }

  private getComponentReport() {
    return Object.entries(this.renderTimings).map(([component, timings]) => ({
      component,
      averageRenderTime: timings.reduce((sum, time) => sum + time, 0) / timings.length,
      maxRenderTime: Math.max(...timings),
      minRenderTime: Math.min(...timings),
      renderCount: this.rerenderCounts[component] || 0,
      lastRenderTime: timings[timings.length - 1] || 0
    }));
  }

  private generateRecommendations(metrics: PerformanceMetrics, warnings: Array<{ metric: string; current: number; budget: number }>) {
    const recommendations = [];
    
    if (warnings.some(w => w.metric === 'renderTime')) {
      recommendations.push('Consider memoizing expensive components with React.memo()');
      recommendations.push('Implement useMemo() for heavy calculations');
      recommendations.push('Use useCallback() for event handlers');
    }
    
    if (metrics.componentCount > 50) {
      recommendations.push('Implement virtual scrolling for large lists');
      recommendations.push('Consider lazy loading for off-screen components');
    }
    
    if (metrics.stateUpdates > 100) {
      recommendations.push('Optimize state structure to reduce unnecessary updates');
      recommendations.push('Use state management library for complex state');
    }
    
    if (this.rerenderCounts.App > 10) {
      recommendations.push('Split App component into smaller, focused components');
      recommendations.push('Move state closer to components that need it');
    }
    
    return recommendations;
  }

  public getMetrics() {
    return [...this.metrics];
  }

  public clearMetrics() {
    this.metrics = [];
    this.renderTimings = {};
    this.rerenderCounts = {};
  }

  public setBudget(newBudget: Partial<PerformanceBudget>) {
    this.budget = { ...this.budget, ...newBudget };
  }

  public destroy() {
    Object.values(this.observers).forEach(observer => {
      if (observer && 'disconnect' in observer) {
        observer.disconnect();
      }
    });
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    measureRender: performanceMonitor.measureComponentRender.bind(performanceMonitor),
    measureXpCalc: performanceMonitor.measureXpCalculation.bind(performanceMonitor),
    measureAgentList: performanceMonitor.measureAgentListRender.bind(performanceMonitor),
    measureQuestFilter: performanceMonitor.measureQuestFilter.bind(performanceMonitor),
    trackStateUpdate: performanceMonitor.trackStateUpdate.bind(performanceMonitor),
    getReport: performanceMonitor.getPerformanceReport.bind(performanceMonitor)
  };
}

export default performanceMonitor;