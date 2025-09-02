// Performance report generator for comprehensive analysis
import { performanceMonitor } from '../monitoring/performance-monitor';
import { webVitalsDashboard } from '../monitoring/web-vitals';
import { performanceBenchmark } from '../testing/performance-benchmarks';

export interface PerformanceReport {
  timestamp: Date;
  summary: {
    overallScore: number;
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    criticalIssues: string[];
    improvements: string[];
  };
  coreWebVitals: {
    metrics: any[];
    scores: { [key: string]: number };
    recommendations: string[];
  };
  applicationMetrics: {
    renderPerformance: any;
    xpCalculationPerformance: any;
    memoryUsage: any;
    userExperience: any;
  };
  benchmarkResults: any;
  optimizationOpportunities: {
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    effort: string;
  }[];
  budgetCompliance: {
    violations: any[];
    compliance: number;
  };
}

export class PerformanceReportGenerator {
  async generateComprehensiveReport(): Promise<PerformanceReport> {
    const timestamp = new Date();
    
    // Gather all performance data
    const performanceData = performanceMonitor.getPerformanceReport();
    const webVitalsData = webVitalsDashboard.getLatestMetrics();
    const benchmarkData = performanceBenchmark.generatePerformanceReport();
    
    // Calculate overall performance score
    const overallScore = this.calculateOverallScore(performanceData, webVitalsData);
    const performanceGrade = this.getPerformanceGrade(overallScore);
    
    // Identify critical issues
    const criticalIssues = this.identifyCriticalIssues(performanceData, webVitalsData);
    
    // Generate optimization opportunities
    const optimizationOpportunities = this.generateOptimizationOpportunities(
      performanceData,
      webVitalsData,
      benchmarkData
    );

    return {
      timestamp,
      summary: {
        overallScore,
        performanceGrade,
        criticalIssues,
        improvements: this.identifyImprovements(benchmarkData)
      },
      coreWebVitals: {
        metrics: webVitalsData,
        scores: this.calculateWebVitalsScores(webVitalsData),
        recommendations: this.generateWebVitalsRecommendations(webVitalsData)
      },
      applicationMetrics: {
        renderPerformance: this.analyzeRenderPerformance(performanceData),
        xpCalculationPerformance: this.analyzeXpCalculationPerformance(performanceData),
        memoryUsage: this.analyzeMemoryUsage(performanceData),
        userExperience: this.analyzeUserExperience(performanceData, webVitalsData)
      },
      benchmarkResults: benchmarkData,
      optimizationOpportunities,
      budgetCompliance: {
        violations: performanceData.warnings,
        compliance: this.calculateBudgetCompliance(performanceData.warnings)
      }
    };
  }

  private calculateOverallScore(performanceData: any, webVitalsData: any[]): number {
    let score = 100;
    
    // Deduct points for web vitals issues
    webVitalsData.forEach(vital => {
      if (vital.rating === 'poor') score -= 20;
      else if (vital.rating === 'needs-improvement') score -= 10;
    });
    
    // Deduct points for performance budget violations
    performanceData.warnings.forEach((warning: any) => {
      switch (warning.metric) {
        case 'renderTime':
          score -= 15;
          break;
        case 'fcp':
        case 'lcp':
          score -= 20;
          break;
        case 'fid':
          score -= 10;
          break;
        case 'cls':
          score -= 15;
          break;
        default:
          score -= 5;
      }
    });
    
    return Math.max(0, score);
  }

  private getPerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private identifyCriticalIssues(performanceData: any, webVitalsData: any[]): string[] {
    const issues: string[] = [];
    
    // Check for critical web vitals issues
    webVitalsData.forEach(vital => {
      if (vital.rating === 'poor') {
        issues.push(`${vital.name} is ${vital.value.toFixed(1)}ms (poor rating)`);
      }
    });
    
    // Check for performance budget violations
    performanceData.warnings.forEach((warning: any) => {
      issues.push(`${warning.metric} exceeds budget: ${warning.current.toFixed(1)} > ${warning.budget}`);
    });
    
    // Check component-specific issues
    const componentReport = performanceData.componentTimings || [];
    componentReport.forEach((comp: any) => {
      if (comp.averageRenderTime > 32) { // 2 frames
        issues.push(`${comp.component} renders slowly (${comp.averageRenderTime.toFixed(1)}ms avg)`);
      }
      if (comp.renderCount > 50) {
        issues.push(`${comp.component} re-renders frequently (${comp.renderCount} times)`);
      }
    });
    
    return issues;
  }

  private identifyImprovements(benchmarkData: any): string[] {
    const improvements = [];
    
    if (benchmarkData.summary.averageImprovement > 30) {
      improvements.push(`Optimizations achieved ${benchmarkData.summary.averageImprovement.toFixed(1)}% performance improvement`);
    }
    
    if (benchmarkData.summary.memoryEfficiency > 80) {
      improvements.push(`Memory efficiency improved to ${benchmarkData.summary.memoryEfficiency.toFixed(1)}%`);
    }
    
    benchmarkData.results.forEach((result: any) => {
      if (result.improvement > 50) {
        improvements.push(`${result.testName} optimized by ${result.improvement.toFixed(1)}%`);
      }
    });
    
    return improvements;
  }

  private calculateWebVitalsScores(webVitalsData: any[]): { [key: string]: number } {
    const scores: { [key: string]: number } = {};
    
    webVitalsData.forEach(vital => {
      let score = 100;
      switch (vital.rating) {
        case 'good':
          score = 100;
          break;
        case 'needs-improvement':
          score = 50;
          break;
        case 'poor':
          score = 0;
          break;
      }
      scores[vital.name] = score;
    });
    
    return scores;
  }

  private generateWebVitalsRecommendations(webVitalsData: any[]): string[] {
    const recommendations: string[] = [];
    
    webVitalsData.forEach(vital => {
      if (vital.rating !== 'good') {
        switch (vital.name) {
          case 'FCP':
            recommendations.push('Optimize critical rendering path and reduce blocking resources');
            break;
          case 'LCP':
            recommendations.push('Optimize largest content element loading and reduce server response times');
            break;
          case 'FID':
            recommendations.push('Reduce JavaScript execution time and optimize event handlers');
            break;
          case 'CLS':
            recommendations.push('Reserve space for dynamic content and avoid sudden layout changes');
            break;
          case 'TTFB':
            recommendations.push('Optimize server response times and consider CDN implementation');
            break;
        }
      }
    });
    
    return recommendations;
  }

  private analyzeRenderPerformance(performanceData: any) {
    const componentReport = performanceData.componentTimings || [];
    
    return {
      averageRenderTime: componentReport.reduce((sum: number, comp: any) => sum + comp.averageRenderTime, 0) / componentReport.length || 0,
      slowestComponent: componentReport.reduce((slowest: any, comp: any) => 
        !slowest || comp.averageRenderTime > slowest.averageRenderTime ? comp : slowest, null
      ),
      totalRenders: componentReport.reduce((sum: number, comp: any) => sum + comp.renderCount, 0),
      componentsNeedingOptimization: componentReport.filter((comp: any) => comp.averageRenderTime > 16)
    };
  }

  private analyzeXpCalculationPerformance(performanceData: any) {
    return {
      averageCalculationTime: performanceData.current?.xpCalculationTime || 0,
      optimizationNeeded: (performanceData.current?.xpCalculationTime || 0) > 1,
      recommendations: [
        'Implement memoization for frequent calculations',
        'Use batch processing for multiple agent updates',
        'Cache level threshold calculations'
      ]
    };
  }

  private analyzeMemoryUsage(performanceData: any) {
    const current = performanceData.current;
    if (!current) return {};
    
    const memoryUsageMB = current.heapUsed / 1024 / 1024;
    const memoryLimitMB = current.jsHeapSizeLimit / 1024 / 1024;
    const usagePercentage = (memoryUsageMB / memoryLimitMB) * 100;
    
    return {
      currentUsage: memoryUsageMB,
      memoryLimit: memoryLimitMB,
      usagePercentage,
      isHigh: usagePercentage > 70,
      recommendations: usagePercentage > 70 ? [
        'Implement object pooling for frequently created objects',
        'Add cleanup for event listeners and timers',
        'Consider using WeakMap/WeakSet for caching'
      ] : []
    };
  }

  private analyzeUserExperience(performanceData: any, webVitalsData: any[]) {
    const poorVitals = webVitalsData.filter(v => v.rating === 'poor').length;
    const needsImprovement = webVitalsData.filter(v => v.rating === 'needs-improvement').length;
    
    let uxScore = 100;
    uxScore -= poorVitals * 25;
    uxScore -= needsImprovement * 10;
    
    if ((performanceData.current?.animationFrameDrops || 0) > 5) {
      uxScore -= 20; // Janky animations hurt UX significantly
    }
    
    return {
      score: Math.max(0, uxScore),
      issues: this.identifyUXIssues(performanceData, webVitalsData),
      recommendations: this.generateUXRecommendations(uxScore, poorVitals, needsImprovement)
    };
  }

  private identifyUXIssues(performanceData: any, webVitalsData: any[]): string[] {
    const issues = [];
    
    if ((performanceData.current?.animationFrameDrops || 0) > 5) {
      issues.push('Janky animations detected');
    }
    
    if (webVitalsData.some(v => v.name === 'FID' && v.value > 100)) {
      issues.push('Slow response to user interactions');
    }
    
    if (webVitalsData.some(v => v.name === 'CLS' && v.value > 0.1)) {
      issues.push('Unexpected layout shifts affecting user experience');
    }
    
    return issues;
  }

  private generateUXRecommendations(uxScore: number, poorVitals: number, needsImprovement: number): string[] {
    const recommendations = [];
    
    if (uxScore < 70) {
      recommendations.push('Critical UX issues detected - prioritize Core Web Vitals optimization');
    }
    
    if (poorVitals > 0) {
      recommendations.push('Focus on fixing poor-rated Core Web Vitals first');
    }
    
    if (needsImprovement > 2) {
      recommendations.push('Multiple metrics need improvement - consider systematic optimization');
    }
    
    recommendations.push('Monitor real user metrics (RUM) in production');
    recommendations.push('Set up automated performance testing in CI/CD');
    
    return recommendations;
  }

  private generateOptimizationOpportunities(performanceData: any, webVitalsData: any[], benchmarkData: any) {
    const opportunities = [];
    
    // High priority opportunities
    if (performanceData.warnings.some((w: any) => w.metric === 'renderTime')) {
      opportunities.push({
        priority: 'high' as const,
        description: 'Optimize component rendering performance',
        impact: 'Significant improvement in user experience and responsiveness',
        effort: 'Medium - requires component memoization and state optimization'
      });
    }
    
    if (webVitalsData.some(v => v.rating === 'poor')) {
      opportunities.push({
        priority: 'high' as const,
        description: 'Fix Core Web Vitals violations',
        impact: 'Improved SEO ranking and user satisfaction',
        effort: 'High - requires comprehensive optimization strategy'
      });
    }
    
    // Medium priority opportunities
    if (benchmarkData.summary.averageImprovement < 50) {
      opportunities.push({
        priority: 'medium' as const,
        description: 'Further optimize XP calculation algorithms',
        impact: 'Reduced CPU usage and faster quest completion',
        effort: 'Low - algorithmic improvements and caching'
      });
    }
    
    if ((performanceData.current?.heapUsed || 0) > 50 * 1024 * 1024) { // 50MB
      opportunities.push({
        priority: 'medium' as const,
        description: 'Implement memory optimization strategies',
        impact: 'Better performance on low-end devices',
        effort: 'Medium - memory profiling and optimization'
      });
    }
    
    // Low priority opportunities
    opportunities.push({
      priority: 'low' as const,
      description: 'Implement service worker for caching',
      impact: 'Faster subsequent page loads',
      effort: 'Medium - service worker implementation and cache strategy'
    });
    
    opportunities.push({
      priority: 'low' as const,
      description: 'Add performance monitoring in production',
      impact: 'Better visibility into real-world performance',
      effort: 'Low - integrate monitoring service'
    });
    
    return opportunities;
  }

  private calculateBudgetCompliance(warnings: any[]): number {
    const totalBudgetItems = 5; // FCP, LCP, FID, CLS, renderTime
    const violations = warnings.length;
    return Math.max(0, ((totalBudgetItems - violations) / totalBudgetItems) * 100);
  }

  async exportReport(format: 'json' | 'html' | 'markdown' = 'json'): Promise<string> {
    const report = await this.generateComprehensiveReport();
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'html':
        return this.generateHTMLReport(report);
      case 'markdown':
        return this.generateMarkdownReport(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  private generateHTMLReport(report: PerformanceReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report - ${report.timestamp.toISOString()}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .score { font-size: 48px; font-weight: bold; }
        .good { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
    </style>
</head>
<body>
    <h1>Performance Report</h1>
    <p>Generated: ${report.timestamp.toLocaleString()}</p>
    
    <div class="card">
        <h2>Overall Performance</h2>
        <div class="score ${report.summary.overallScore >= 80 ? 'good' : report.summary.overallScore >= 60 ? 'warning' : 'error'}">
            Grade: ${report.summary.performanceGrade} (${report.summary.overallScore})
        </div>
    </div>
    
    <div class="grid">
        <div class="card">
            <h3>Core Web Vitals</h3>
            ${report.coreWebVitals.metrics.map(vital => `
                <div>
                    <strong>${vital.name}:</strong> 
                    <span class="${vital.rating === 'good' ? 'good' : vital.rating === 'needs-improvement' ? 'warning' : 'error'}">
                        ${vital.value.toFixed(1)}ms (${vital.rating})
                    </span>
                </div>
            `).join('')}
        </div>
        
        <div class="card">
            <h3>Critical Issues</h3>
            ${report.summary.criticalIssues.length > 0 ? 
              report.summary.criticalIssues.map(issue => `<div class="error">• ${issue}</div>`).join('') :
              '<div class="good">No critical issues detected</div>'
            }
        </div>
    </div>
    
    <div class="card">
        <h3>Optimization Opportunities</h3>
        ${report.optimizationOpportunities.map(opp => `
            <div style="margin: 12px 0; padding: 12px; border-left: 4px solid ${
              opp.priority === 'high' ? '#ef4444' : opp.priority === 'medium' ? '#f59e0b' : '#10b981'
            }; background: #f1f5f9;">
                <strong>${opp.description}</strong><br>
                <small>Impact: ${opp.impact} | Effort: ${opp.effort}</small>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;
  }

  private generateMarkdownReport(report: PerformanceReport): string {
    return `
# Performance Report

**Generated:** ${report.timestamp.toISOString()}

## Summary

**Overall Score:** ${report.summary.overallScore}/100 (Grade: ${report.summary.performanceGrade})

### Critical Issues
${report.summary.criticalIssues.length > 0 ? 
  report.summary.criticalIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ No critical issues detected'
}

### Improvements
${report.summary.improvements.map(improvement => `- ✅ ${improvement}`).join('\n')}

## Core Web Vitals

| Metric | Value | Rating | Status |
|--------|-------|--------|---------|
${report.coreWebVitals.metrics.map(vital => 
  `| ${vital.name} | ${vital.value.toFixed(1)}ms | ${vital.rating} | ${vital.rating === 'good' ? '✅' : vital.rating === 'needs-improvement' ? '⚠️' : '❌'} |`
).join('\n')}

## Optimization Opportunities

${report.optimizationOpportunities.map(opp => `
### ${opp.priority.toUpperCase()} Priority: ${opp.description}
- **Impact:** ${opp.impact}
- **Effort:** ${opp.effort}
`).join('\n')}

## Benchmark Results

**Average Improvement:** ${report.benchmarkResults.summary.averageImprovement.toFixed(1)}%
**Memory Efficiency:** ${report.benchmarkResults.summary.memoryEfficiency.toFixed(1)}%

${report.benchmarkResults.results.map((result: any) => `
- **${result.testName}:** ${result.improvement.toFixed(1)}% improvement (${result.originalTime.toFixed(1)}ms → ${result.optimizedTime.toFixed(1)}ms)
`).join('')}
    `;
  }
}

export const performanceReportGenerator = new PerformanceReportGenerator();
export default performanceReportGenerator;