// Performance report generator with comprehensive metrics and recommendations
import { performanceMonitor } from '../monitoring/performance-monitor';
import { webVitalsDashboard } from '../monitoring/web-vitals';
import { performanceBenchmark } from '../testing/performance-benchmarks';

export interface PerformanceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface PerformanceRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  implementation: string;
  estimatedImprovement: string;
}

export interface DetailedPerformanceReport {
  timestamp: string;
  summary: {
    overallScore: number;
    grade: string;
    criticalIssues: number;
    recommendations: number;
  };
  webVitals: {
    score: number;
    metrics: Array<{
      name: string;
      value: number;
      rating: string;
      target: string;
    }>;
  };
  performance: {
    renderMetrics: Record<string, unknown>;
    memoryUsage: Record<string, unknown>;
    networkMetrics: Record<string, unknown>;
  };
  issues: PerformanceIssue[];
  recommendations: PerformanceRecommendation[];
  benchmarks: {
    summary: Record<string, unknown>;
    improvements: string[];
  };
}

class PerformanceReportGenerator {
  async generateComprehensiveReport(): Promise<DetailedPerformanceReport> {
    const timestamp = new Date().toISOString();
    const performanceData = performanceMonitor.getPerformanceReport();
    const webVitalsData = webVitalsDashboard.getLatestMetrics();
    const benchmarkData = { summary: { averageImprovement: 0 }, details: {} }; // Mock benchmark data
    
    const overallScore = this.calculateOverallScore(performanceData, webVitalsData, benchmarkData);
    const grade = this.calculateGrade(overallScore);
    
    const issues: PerformanceIssue[] = this.identifyCriticalIssues(performanceData, webVitalsData);
    const recommendations: PerformanceRecommendation[] = this.generateRecommendations(performanceData, webVitalsData, benchmarkData);
    
    return {
      timestamp,
      summary: {
        overallScore,
        grade,
        criticalIssues: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length,
        recommendations: recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length
      },
      webVitals: {
        score: webVitalsDashboard.getPerformanceScore(),
        metrics: webVitalsData.map(metric => ({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          target: this.getMetricTarget(metric.name)
        }))
      },
      performance: {
        renderMetrics: performanceData.current || {},
        memoryUsage: {
          heapUsed: performanceData.current?.heapUsed || 0,
          heapTotal: performanceData.current?.heapTotal || 0,
          external: performanceData.current?.external || 0
        },
        networkMetrics: {
          requestCount: performanceData.current?.requestCount || 0,
          totalTransferSize: performanceData.current?.totalTransferSize || 0
        }
      },
      issues,
      recommendations,
      benchmarks: {
        summary: benchmarkData.summary || {},
        improvements: this.identifyImprovements(benchmarkData)
      }
    };
  }

  private calculateOverallScore(performanceData: unknown, _webVitalsData: unknown[], benchmarkData: unknown): number {
    const webVitalsScore = webVitalsDashboard.getPerformanceScore();
    const performanceScore = this.calculatePerformanceScore(performanceData);
    const benchmarkScore = benchmarkData.summary?.averageImprovement ? 
      Math.min(100, benchmarkData.summary.averageImprovement + 60) : 75;
    
    return Math.round((webVitalsScore * 0.4 + performanceScore * 0.4 + benchmarkScore * 0.2));
  }

  private calculatePerformanceScore(data: unknown): number {
    if (!data.current) return 75;
    
    let score = 100;
    
    // Deduct points for slow render times
    if (data.current.renderTime > 16) {
      score -= Math.min(30, (data.current.renderTime - 16) * 2);
    }
    
    // Deduct points for high memory usage
    const memoryMB = data.current.heapUsed / 1024 / 1024;
    if (memoryMB > 100) {
      score -= Math.min(20, (memoryMB - 100) / 10);
    }
    
    // Deduct points for warnings
    score -= Math.min(25, data.warnings.length * 5);
    
    return Math.max(0, Math.round(score));
  }

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private identifyCriticalIssues(performanceData: unknown, webVitalsData: unknown[]): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    
    // Check for critical web vitals issues
    webVitalsData.forEach(vital => {
      if (vital.rating === 'poor') {
        issues.push({
          severity: 'high',
          metric: vital.name,
          description: `${vital.name} is ${vital.value.toFixed(1)}ms (poor rating)`,
          impact: 'Poor user experience and SEO ranking',
          recommendation: `Optimize ${vital.name} to be under ${this.getMetricTarget(vital.name)}`
        });
      }
    });
    
    // Check for performance budget violations
    performanceData.warnings.forEach((warning: unknown) => {
      issues.push({
        severity: 'medium',
        metric: warning.metric,
        description: `${warning.metric} exceeds budget: ${warning.current.toFixed(1)} > ${warning.budget}`,
        impact: 'Degraded performance and user experience',
        recommendation: 'Optimize component rendering and reduce computational complexity'
      });
    });
    
    // Check component-specific issues
    const componentReport = performanceData.componentTimings || [];
    componentReport.forEach((comp: unknown) => {
      if (comp.averageRenderTime > 32) { // 2 frames
        issues.push({
          severity: 'high',
          metric: comp.component,
          description: `${comp.component} renders slowly (${comp.averageRenderTime.toFixed(1)}ms avg)`,
          impact: 'Blocking UI updates and poor responsiveness',
          recommendation: 'Use React.memo, useMemo, or useCallback to optimize component'
        });
      }
      if (comp.renderCount > 50) {
        issues.push({
          severity: 'medium',
          metric: comp.component,
          description: `${comp.component} re-renders frequently (${comp.renderCount} times)`,
          impact: 'Unnecessary computations and battery drain',
          recommendation: 'Check dependencies in useEffect and optimize state updates'
        });
      }
    });
    
    return issues;
  }

  private identifyImprovements(benchmarkData: unknown): string[] {
    const improvements: string[] = [];
    
    if (benchmarkData.summary?.averageImprovement > 30) {
      improvements.push(`Optimizations achieved ${benchmarkData.summary.averageImprovement.toFixed(1)}% performance improvement`);
    }
    
    if (benchmarkData.details?.agentRendering?.improvement > 25) {
      improvements.push('Agent rendering optimizations show significant improvement');
    }
    
    if (benchmarkData.details?.questProcessing?.improvement > 20) {
      improvements.push('Quest processing performance has been enhanced');
    }
    
    return improvements;
  }

  private generateRecommendations(performanceData: unknown, webVitalsData: unknown[], _benchmarkData: unknown): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    
    // Web Vitals recommendations
    webVitalsData.forEach(vital => {
      if (vital.rating === 'needs-improvement' || vital.rating === 'poor') {
        recommendations.push(this.getWebVitalRecommendation(vital));
      }
    });
    
    // Component optimization recommendations
    if (performanceData.warnings.length > 3) {
      recommendations.push({
        priority: 'high',
        category: 'Component Optimization',
        title: 'Implement React Performance Patterns',
        description: 'Multiple components are causing performance warnings',
        implementation: 'Use React.memo, useMemo, useCallback, and lazy loading',
        estimatedImprovement: '20-40% render time reduction'
      });
    }
    
    // Memory optimization recommendations
    if (performanceData.current?.heapUsed > 100 * 1024 * 1024) {
      recommendations.push({
        priority: 'medium',
        category: 'Memory Management',
        title: 'Optimize Memory Usage',
        description: 'High memory consumption detected',
        implementation: 'Implement object pooling and cleanup event listeners',
        estimatedImprovement: '15-30% memory reduction'
      });
    }
    
    // Bundle optimization recommendations
    recommendations.push({
      priority: 'medium',
      category: 'Code Splitting',
      title: 'Implement Advanced Code Splitting',
      description: 'Reduce initial bundle size for faster loading',
      implementation: 'Split components by route and feature, use dynamic imports',
      estimatedImprovement: '25-50% faster initial load'
    });
    
    return recommendations;
  }

  private getWebVitalRecommendation(vital: unknown): PerformanceRecommendation {
    const recommendations = {
      'FCP': {
        priority: 'high' as const,
        category: 'Loading Performance',
        title: 'Optimize First Contentful Paint',
        description: 'Reduce time to first contentful paint',
        implementation: 'Optimize critical CSS, preload key resources, reduce server response time',
        estimatedImprovement: '20-40% faster initial render'
      },
      'LCP': {
        priority: 'high' as const,
        category: 'Loading Performance', 
        title: 'Improve Largest Contentful Paint',
        description: 'Optimize largest content element loading',
        implementation: 'Optimize images, preload resources, reduce render-blocking resources',
        estimatedImprovement: '30-60% faster content loading'
      },
      'CLS': {
        priority: 'medium' as const,
        category: 'Visual Stability',
        title: 'Reduce Cumulative Layout Shift',
        description: 'Minimize unexpected layout shifts',
        implementation: 'Set dimensions for images/videos, reserve space for ads, avoid inserting content',
        estimatedImprovement: '50-80% reduction in layout shifts'
      },
      'FID': {
        priority: 'high' as const,
        category: 'Interactivity',
        title: 'Improve First Input Delay',
        description: 'Reduce main thread blocking time',
        implementation: 'Code splitting, reduce JavaScript execution time, use web workers',
        estimatedImprovement: '40-70% faster interaction response'
      }
    };
    
    return recommendations[vital.name as keyof typeof recommendations] || {
      priority: 'medium',
      category: 'Performance',
      title: `Optimize ${vital.name}`,
      description: `Improve ${vital.name} performance`,
      implementation: 'Follow web performance best practices',
      estimatedImprovement: '10-30% improvement'
    };
  }

  private getMetricTarget(metricName: string): string {
    const targets = {
      'FCP': '1.8s',
      'LCP': '2.5s',
      'FID': '100ms',
      'CLS': '0.1',
      'TTFB': '800ms',
      'TTI': '3.8s'
    };
    
    return targets[metricName as keyof typeof targets] || 'Optimize';
  }

  async exportReport(format: 'json' | 'html' | 'csv' = 'json'): Promise<string> {
    const report = await this.generateComprehensiveReport();
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'html':
        return this.generateHTMLReport(report);
      case 'csv':
        return this.generateCSVReport(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  private generateHTMLReport(report: DetailedPerformanceReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report - ${report.timestamp}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem; }
        .score { font-size: 2rem; font-weight: bold; }
        .good { color: #10b981; }
        .warning { color: #f59e0b; }
        .critical { color: #ef4444; }
        .metric { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        .section { margin: 2rem 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <h1>Performance Report</h1>
    <p>Generated: ${report.timestamp}</p>
    
    <div class="section">
        <h2>Summary</h2>
        <div class="score ${report.summary.overallScore >= 80 ? 'good' : report.summary.overallScore >= 60 ? 'warning' : 'critical'}">
            Score: ${report.summary.overallScore} (${report.summary.grade})
        </div>
        <div>Critical Issues: ${report.summary.criticalIssues}</div>
        <div>Recommendations: ${report.summary.recommendations}</div>
    </div>
    
    <div class="section">
        <h2>Web Vitals</h2>
        ${report.webVitals.metrics.map(metric => `
            <div class="metric">
                <span>${metric.name}</span>
                <span class="${metric.rating === 'good' ? 'good' : metric.rating === 'needs-improvement' ? 'warning' : 'critical'}">
                    ${metric.value.toFixed(1)}ms (${metric.rating})
                </span>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>Critical Issues</h2>
        <table>
            <thead>
                <tr><th>Severity</th><th>Metric</th><th>Description</th><th>Recommendation</th></tr>
            </thead>
            <tbody>
                ${report.issues.map(issue => `
                    <tr>
                        <td class="${issue.severity === 'critical' ? 'critical' : issue.severity === 'high' ? 'warning' : ''}">${issue.severity}</td>
                        <td>${issue.metric}</td>
                        <td>${issue.description}</td>
                        <td>${issue.recommendation}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
  }

  private generateCSVReport(report: DetailedPerformanceReport): string {
    const csvRows = [
      ['Metric', 'Value', 'Status', 'Target'],
      ...report.webVitals.metrics.map(metric => [
        metric.name,
        metric.value.toFixed(1),
        metric.rating,
        metric.target
      ]),
      [''],
      ['Issue Type', 'Severity', 'Metric', 'Description'],
      ...report.issues.map(issue => [
        'Issue',
        issue.severity,
        issue.metric,
        issue.description
      ])
    ];
    
    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

export const performanceReportGenerator = new PerformanceReportGenerator();