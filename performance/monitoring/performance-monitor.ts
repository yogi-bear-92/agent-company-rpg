// Performance monitoring system for Agent Company RPG
// Tracks render times, memory usage, component performance, and bottlenecks

export interface PerformanceMetric {
  timestamp: number;
  renderTime: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  componentCount: number;
  requestCount?: number;
  totalTransferSize?: number;
}

export interface PerformanceWarning {
  timestamp: number;
  metric: string;
  current: number;
  budget: number;
  severity: 'low' | 'medium' | 'high';
}

export interface ComponentTiming {
  component: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
  lastRender: number;
}

export interface PerformanceReport {
  current: PerformanceMetric | null;
  history: PerformanceMetric[];
  warnings: PerformanceWarning[];
  componentTimings: ComponentTiming[];
  summary: {
    averageRenderTime: number;
    peakMemoryUsage: number;
    totalWarnings: number;
    slowComponents: string[];
  };
}

interface MemoryInfo {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private warnings: PerformanceWarning[] = [];
  private componentTimings: Map<string, ComponentTiming> = new Map();
  private isMonitoring = false;
  private monitoringInterval: number | null = null;
  private maxHistorySize = 100;
  
  // Performance budgets (in milliseconds)
  private budgets = {
    renderTime: 16, // 60fps
    componentRender: 8, // Individual component budget
    memoryGrowth: 50 * 1024 * 1024, // 50MB memory growth warning
  };

  startMonitoring(interval = 1000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🚀 Performance monitoring started');
    
    // Initial metric collection
    this.collectMetrics();
    
    // Start periodic monitoring
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, interval);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('🛑 Performance monitoring stopped');
  }

  collectMetrics(): PerformanceMetric {
    const renderStartTime = performance.now();
    
    // Get memory information with type safety
    const memInfo: MemoryInfo = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
    
    // Calculate render time (approximate)
    const renderTime = performance.now() - renderStartTime;
    
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      renderTime,
      heapUsed: memInfo.usedJSHeapSize || 0,
      heapTotal: memInfo.totalJSHeapSize || 0,
      external: memInfo.jsHeapSizeLimit || 0,
      componentCount: this.componentTimings.size,
      requestCount: this.getNetworkMetrics().requestCount,
      totalTransferSize: this.getNetworkMetrics().totalTransferSize
    };
    
    // Add to metrics history
    this.metrics.push(metric);
    
    // Maintain history size
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }
    
    // Check for performance issues
    this.checkPerformanceBudgets(metric);
    
    return metric;
  }

  recordComponentTiming(componentName: string, renderTime: number): void {
    const existing = this.componentTimings.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.renderTime += renderTime;
      existing.averageRenderTime = existing.renderTime / existing.renderCount;
      existing.lastRender = Date.now();
    } else {
      this.componentTimings.set(componentName, {
        component: componentName,
        renderTime,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRender: Date.now()
      });
    }
    
    // Check component performance budget
    if (renderTime > this.budgets.componentRender) {
      this.logWarning(
        `${componentName} render time`,
        renderTime,
        this.budgets.componentRender,
        'medium'
      );
    }
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    // Store custom metrics for analysis
    if (process.env.NODE_ENV === 'development') {
      console.debug(`📊 ${name}: ${value.toFixed(2)}ms`, tags);
    }
    
    // Check if this is a concerning metric
    if (name.includes('render') && value > 32) {
      this.logWarning(`Custom metric: ${name}`, value, 32, 'medium');
    }
  }

  logWarning(metric: string, current: number, budget: number, severity: PerformanceWarning['severity'] = 'medium'): void {
    const warning: PerformanceWarning = {
      timestamp: Date.now(),
      metric,
      current,
      budget,
      severity
    };
    
    this.warnings.push(warning);
    
    // Maintain warnings history
    if (this.warnings.length > 50) {
      this.warnings.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : 'ℹ️';
      console.warn(
        `${emoji} Performance Warning: ${metric} - ${current.toFixed(1)} > ${budget} (${severity})`
      );
    }
  }

  private checkPerformanceBudgets(metric: PerformanceMetric): void {
    // Check render time budget
    if (metric.renderTime > this.budgets.renderTime) {
      this.logWarning(
        'Frame render time',
        metric.renderTime,
        this.budgets.renderTime,
        'high'
      );
    }
    
    // Check memory growth
    if (this.metrics.length > 1) {
      const previousMetric = this.metrics[this.metrics.length - 2];
      const memoryGrowth = metric.heapUsed - previousMetric.heapUsed;
      
      if (memoryGrowth > this.budgets.memoryGrowth) {
        this.logWarning(
          'Memory growth',
          memoryGrowth,
          this.budgets.memoryGrowth,
          'medium'
        );
      }
    }
  }

  private getNetworkMetrics(): { requestCount: number; totalTransferSize: number } {
    if (!('getEntriesByType' in performance)) {
      return { requestCount: 0, totalTransferSize: 0 };
    }
    
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return {
      requestCount: entries.length,
      totalTransferSize: entries.reduce((total, entry) => total + (entry.transferSize || 0), 0)
    };
  }

  getPerformanceReport(): PerformanceReport {
    const current = this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    
    // Calculate summary statistics
    const renderTimes = this.metrics.map(m => m.renderTime);
    const memoryUsages = this.metrics.map(m => m.heapUsed);
    
    const averageRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
      : 0;
      
    const peakMemoryUsage = memoryUsages.length > 0 
      ? Math.max(...memoryUsages) 
      : 0;
    
    // Find slow components
    const slowComponents = Array.from(this.componentTimings.values())
      .filter(timing => timing.averageRenderTime > this.budgets.componentRender)
      .map(timing => timing.component);
    
    return {
      current,
      history: [...this.metrics],
      warnings: [...this.warnings],
      componentTimings: Array.from(this.componentTimings.values()),
      summary: {
        averageRenderTime,
        peakMemoryUsage,
        totalWarnings: this.warnings.length,
        slowComponents
      }
    };
  }

  clearMetrics(): void {
    this.metrics = [];
    this.warnings = [];
    this.componentTimings.clear();
    console.log('🗑️ Performance metrics cleared');
  }

  // Utility method to get current performance snapshot
  getCurrentSnapshot(): {
    renderTime: number;
    memoryUsage: number;
    componentCount: number;
    warningCount: number;
  } {
    const current = this.metrics[this.metrics.length - 1];
    return {
      renderTime: current?.renderTime || 0,
      memoryUsage: current?.heapUsed || 0,
      componentCount: this.componentTimings.size,
      warningCount: this.warnings.length
    };
  }

  // Export data for external analysis
  exportData(): {
    metrics: PerformanceMetric[];
    warnings: PerformanceWarning[];
    componentTimings: ComponentTiming[];
    timestamp: string;
  } {
    return {
      metrics: [...this.metrics],
      warnings: [...this.warnings],
      componentTimings: Array.from(this.componentTimings.values()),
      timestamp: new Date().toISOString()
    };
  }

  // Set custom performance budgets
  setBudgets(budgets: Partial<typeof this.budgets>): void {
    this.budgets = { ...this.budgets, ...budgets };
    console.log('📋 Performance budgets updated:', this.budgets);
  }

  // Get performance grade based on metrics
  getPerformanceGrade(): { score: number; grade: string; issues: string[] } {
    let score = 100;
    const issues: string[] = [];
    
    // Deduct points for warnings
    const highWarnings = this.warnings.filter(w => w.severity === 'high').length;
    const mediumWarnings = this.warnings.filter(w => w.severity === 'medium').length;
    
    score -= highWarnings * 15;
    score -= mediumWarnings * 5;
    
    if (highWarnings > 0) issues.push(`${highWarnings} critical performance issues`);
    if (mediumWarnings > 3) issues.push(`${mediumWarnings} performance warnings`);
    
    // Deduct points for slow average render time
    const report = this.getPerformanceReport();
    if (report.summary.averageRenderTime > this.budgets.renderTime) {
      score -= 20;
      issues.push('Slow average render time');
    }
    
    // Deduct points for slow components
    if (report.summary.slowComponents.length > 0) {
      score -= report.summary.slowComponents.length * 10;
      issues.push(`${report.summary.slowComponents.length} slow components`);
    }
    
    score = Math.max(0, score);
    
    let grade = 'A';
    if (score < 90) grade = 'B';
    if (score < 80) grade = 'C';
    if (score < 70) grade = 'D';
    if (score < 60) grade = 'F';
    
    return { score, grade, issues };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Small delay to avoid startup performance impact
  setTimeout(() => {
    performanceMonitor.startMonitoring();
  }, 1000);
}

export default performanceMonitor;