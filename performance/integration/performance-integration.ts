// Performance integration utilities and helpers
import { performanceMonitor } from '../monitoring/performance-monitor';
import { webVitalsDashboard } from '../monitoring/web-vitals';
import { performanceReportGenerator } from '../reports/performance-report-generator';

// Initialize performance monitoring for the application
export function initializePerformanceMonitoring(options: {
  enableWebVitals?: boolean;
  enableComponentTracking?: boolean;
  enableMemoryMonitoring?: boolean;
  reportingInterval?: number;
} = {}) {
  const {
    enableWebVitals = true,
    enableComponentTracking = true,
    enableMemoryMonitoring = true,
    reportingInterval = 30000
  } = options;

  console.log('🚀 Initializing performance monitoring...');

  // Set up Web Vitals monitoring
  if (enableWebVitals) {
    webVitalsDashboard.subscribe((metric) => {
      console.log(`📊 Web Vital: ${metric.name} = ${metric.value.toFixed(1)}ms (${metric.rating})`);
    });
  }

  // Set up component performance tracking
  if (enableComponentTracking) {
    // Monitor for slow components
    setInterval(() => {
      const report = performanceMonitor.getPerformanceReport();
      const slowComponents = report.componentTimings?.filter(comp => comp.averageRenderTime > 16) || [];
      
      if (slowComponents.length > 0) {
        console.warn('⚠️ Slow components detected:', slowComponents);
      }
    }, reportingInterval);
  }

  // Set up memory monitoring
  if (enableMemoryMonitoring) {
    setInterval(() => {
      const report = performanceMonitor.getPerformanceReport();
      if (report.current) {
        const memoryUsage = report.current.heapUsed / 1024 / 1024; // MB
        if (memoryUsage > 100) { // 100MB threshold
          console.warn(`⚠️ High memory usage detected: ${memoryUsage.toFixed(1)}MB`);
        }
      }
    }, reportingInterval * 2); // Check memory less frequently
  }

  console.log('✅ Performance monitoring initialized');
}

// Performance budget enforcement
export function enforcePerformanceBudgets() {
  const report = performanceMonitor.getPerformanceReport();
  
  if (report.warnings.length > 0) {
    console.group('⚠️ Performance Budget Violations:');
    report.warnings.forEach(warning => {
      console.warn(`${warning.metric}: ${warning.current.toFixed(1)} > ${warning.budget} budget`);
    });
    console.groupEnd();
    
    // In development, show visual indicator
    if (process.env.NODE_ENV === 'development') {
      showPerformanceWarning(report.warnings);
    }
  }
}

// Visual performance warning for development
function showPerformanceWarning(warnings: Array<{ metric: string; current: number; budget: number }>) {
  // Remove existing warning
  const existing = document.getElementById('perf-warning');
  if (existing) existing.remove();

  const warning = document.createElement('div');
  warning.id = 'perf-warning';
  warning.style.cssText = `
    position: fixed;
    top: 80px;
    right: 16px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  warning.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Performance Issues</div>
    ${warnings.map(w => `<div>• ${w.metric}: ${w.current.toFixed(1)}ms</div>`).join('')}
    <button onclick="this.parentElement.remove()" style="
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      margin-top: 8px;
      cursor: pointer;
    ">Dismiss</button>
  `;
  
  document.body.appendChild(warning);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('perf-warning')) {
      warning.remove();
    }
  }, 10000);
}

// React DevTools performance profiler integration
export function enableReactProfiler() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Enable React DevTools Profiler
    const devtools = (window as unknown).__REACT_DEVTOOLS_GLOBAL_HOOK__ as {
      onCommitFiberRoot?: Array<(id: string, root: unknown, priorityLevel: number) => void>;
    } | undefined;
    devtools?.onCommitFiberRoot?.push?.(
      (id: string, root: unknown, priorityLevel: number) => {
        console.log('React render committed:', { id, priorityLevel });
      }
    );
  }
}

// Automated performance testing
export async function runPerformanceAudit() {
  console.log('🔍 Running performance audit...');
  
  const startTime = performance.now();
  
  try {
    // Generate comprehensive report
    const report = await performanceReportGenerator.generateComprehensiveReport();
    
    // Check critical thresholds
    const criticalIssues = report.summary.criticalIssues;
    const performanceScore = report.summary.overallScore;
    
    console.log(`📊 Performance Score: ${performanceScore}/100 (${report.summary.performanceGrade})`);
    
    if (criticalIssues.length > 0) {
      console.group('🚨 Critical Issues:');
      criticalIssues.forEach(issue => console.error(`• ${issue}`));
      console.groupEnd();
    }
    
    if (report.optimizationOpportunities.length > 0) {
      console.group('💡 Optimization Opportunities:');
      report.optimizationOpportunities
        .filter(opp => opp.priority === 'high')
        .forEach(opp => console.log(`• ${opp.description}: ${opp.impact}`));
      console.groupEnd();
    }
    
    const auditTime = performance.now() - startTime;
    console.log(`✅ Performance audit completed in ${auditTime.toFixed(2)}ms`);
    
    return report;
  } catch (error) {
    console.error('❌ Performance audit failed:', error);
    throw error;
  }
}

// Performance monitoring hooks for React components
export const PerformanceHooks = {
  // Hook for measuring component render time
  useRenderTime: (componentName: string) => {
    const startTime = performance.now();
    
    return {
      startTime,
      measureRender: () => {
        return performanceMonitor.measureComponentRender(componentName, startTime);
      }
    };
  },

  // Hook for measuring heavy calculations
  useCalculationTime: (calculationName: string) => {
    return {
      measure: <T>(fn: () => T): { result: T; time: number } => {
        const start = performance.now();
        const result = fn();
        const time = performance.now() - start;
        
        if (time > 10) { // Log calculations taking longer than 10ms
          console.warn(`⚠️ Slow calculation: ${calculationName} took ${time.toFixed(2)}ms`);
        }
        
        return { result, time };
      }
    };
  },

  // Hook for tracking state update frequency
  useStateUpdateTracking: () => {
    return {
      trackUpdate: () => {
        performanceMonitor.trackStateUpdate();
      }
    };
  }
};

// Performance testing helpers
export const PerformanceTestHelpers = {
  // Simulate load testing
  simulateLoad: async (requests: number = 100, concurrency: number = 10) => {
    console.log(`🔄 Simulating load: ${requests} requests with ${concurrency} concurrency`);
    
    const batches = [];
    for (let i = 0; i < requests; i += concurrency) {
      const batch = [];
      for (let j = 0; j < concurrency && i + j < requests; j++) {
        batch.push(simulateRequest());
      }
      batches.push(Promise.all(batch));
    }
    
    const startTime = performance.now();
    await Promise.all(batches);
    const totalTime = performance.now() - startTime;
    
    console.log(`✅ Load test completed in ${totalTime.toFixed(2)}ms`);
    return { totalTime, averageTime: totalTime / requests };
  },

  // Measure rendering performance under load
  measureRenderUnderLoad: (renderFunction: () => void, iterations: number = 50) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      renderFunction();
      times.push(performance.now() - start);
    }
    
    return {
      average: times.reduce((sum, t) => sum + t, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
    };
  }
};

async function simulateRequest(): Promise<void> {
  // Simulate async operation
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * 100);
  });
}

export default {
  initializePerformanceMonitoring,
  enforcePerformanceBudgets,
  enableReactProfiler,
  runPerformanceAudit,
  PerformanceHooks,
  PerformanceTestHelpers
};