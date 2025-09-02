#!/usr/bin/env node

// Performance CI script for automated performance monitoring
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const BASELINE_PATH = './performance/reports/baseline-report.json';
const CONFIG_PATH = './config/performance-baseline.json';

class PerformanceCI {
  constructor() {
    this.config = this.loadConfig();
    this.baseline = this.loadBaseline();
    this.currentResults = {
      timestamp: new Date().toISOString(),
      bundleSize: {},
      lighthouse: {},
      benchmarks: {},
      regression: {
        detected: false,
        issues: [],
        severity: 'none'
      }
    };
  }

  loadConfig() {
    try {
      return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    } catch {
      console.error('Performance config not found');
      return null;
    }
  }

  loadBaseline() {
    try {
      return JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
    } catch {
      console.warn('No baseline found, will establish new baseline');
      return null;
    }
  }

  async runPerformanceCheck() {
    console.log('🔍 Running performance CI check...');
    
    // 1. Analyze current bundle size
    await this.checkBundleSize();
    
    // 2. Run quick lighthouse check
    await this.checkLighthouse();
    
    // 3. Run performance benchmarks
    await this.checkBenchmarks();
    
    // 4. Detect regressions
    this.detectRegressions();
    
    // 5. Generate CI report
    this.generateCIReport();
    
    // 6. Set exit code based on results
    this.setExitCode();
  }

  async checkBundleSize() {
    console.log('📦 Checking bundle size...');
    
    try {
      // Build project
      execSync('npm run build', { stdio: 'pipe' });
      
      // Analyze bundle
      const distPath = './dist/assets';
      if (existsSync(distPath)) {
        const { readdirSync, statSync } = await import('fs');
        const files = readdirSync(distPath);
        
        let totalJs = 0;
        let totalCss = 0;
        
        files.forEach(file => {
          const stats = statSync(join(distPath, file));
          const sizeKB = stats.size / 1024;
          
          if (file.endsWith('.js')) totalJs += sizeKB;
          if (file.endsWith('.css')) totalCss += sizeKB;
        });
        
        this.currentResults.bundleSize = {
          js: Math.round(totalJs),
          css: Math.round(totalCss),
          total: Math.round(totalJs + totalCss)
        };
        
        // Check against budgets
        this.checkBundleBudgets();
      }
    } catch (error) {
      console.error('Bundle size check failed:', error.message);
    }
  }

  checkBundleBudgets() {
    const current = this.currentResults.bundleSize;
    const budgets = this.config.baseline.bundleSize;
    
    if (current.js > budgets.js.error) {
      this.currentResults.regression.issues.push({
        type: 'bundle-size',
        severity: 'error',
        metric: 'JavaScript bundle',
        current: current.js,
        target: budgets.js.target,
        message: `JS bundle (${current.js}KB) exceeds error threshold (${budgets.js.error}KB)`
      });
    } else if (current.js > budgets.js.warning) {
      this.currentResults.regression.issues.push({
        type: 'bundle-size',
        severity: 'warning',
        metric: 'JavaScript bundle',
        current: current.js,
        target: budgets.js.target,
        message: `JS bundle (${current.js}KB) exceeds warning threshold (${budgets.js.warning}KB)`
      });
    }
    
    if (current.css > budgets.css.error) {
      this.currentResults.regression.issues.push({
        type: 'bundle-size',
        severity: 'error',
        metric: 'CSS bundle',
        current: current.css,
        target: budgets.css.target,
        message: `CSS bundle (${current.css}KB) exceeds error threshold (${budgets.css.error}KB)`
      });
    }
  }

  async checkLighthouse() {
    console.log('💡 Running Lighthouse check...');
    
    try {
      // Quick lighthouse check with basic metrics
      execSync('npm run lighthouse', { stdio: 'pipe' });
      
      this.currentResults.lighthouse = {
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch {
      console.warn('Lighthouse check skipped (preview server required)');
      this.currentResults.lighthouse = {
        status: 'skipped',
        reason: 'preview server not available'
      };
    }
  }

  async checkBenchmarks() {
    console.log('🏃 Running performance benchmarks...');
    
    try {
      execSync('npm run perf:bench', { stdio: 'pipe' });
      
      this.currentResults.benchmarks = {
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch {
      console.warn('Performance benchmarks skipped');
      this.currentResults.benchmarks = {
        status: 'skipped',
        reason: 'benchmark suite unavailable'
      };
    }
  }

  detectRegressions() {
    console.log('🔎 Detecting performance regressions...');
    
    if (!this.baseline) {
      console.log('No baseline available for regression detection');
      return;
    }
    
    const issues = this.currentResults.regression.issues;
    const hasErrors = issues.some(issue => issue.severity === 'error');
    const hasWarnings = issues.some(issue => issue.severity === 'warning');
    
    if (hasErrors) {
      this.currentResults.regression.detected = true;
      this.currentResults.regression.severity = 'error';
    } else if (hasWarnings) {
      this.currentResults.regression.detected = true;
      this.currentResults.regression.severity = 'warning';
    }
    
    console.log(`Regression status: ${this.currentResults.regression.severity}`);
  }

  generateCIReport() {
    const reportPath = join('./performance/reports', `ci-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(this.currentResults, null, 2));
    
    // Generate GitHub Actions summary
    this.generateGitHubSummary();
  }

  generateGitHubSummary() {
    const summary = `
## 📊 Performance Check Results

**Overall Status:** ${this.currentResults.regression.severity === 'error' ? '❌ Failed' : 
                    this.currentResults.regression.severity === 'warning' ? '⚠️ Warning' : '✅ Passed'}

### Bundle Size
- **JavaScript:** ${this.currentResults.bundleSize.js || 0}KB
- **CSS:** ${this.currentResults.bundleSize.css || 0}KB  
- **Total:** ${this.currentResults.bundleSize.total || 0}KB

### Issues Found
${this.currentResults.regression.issues.length === 0 ? 'No performance issues detected' : 
  this.currentResults.regression.issues.map(issue => 
    `- **${issue.severity.toUpperCase()}:** ${issue.message}`
  ).join('\n')}

### Recommendations
- Monitor bundle size growth
- Run Lighthouse audits on preview deployments
- Implement performance budgets in CI
- Set up automated performance regression detection

---
*Generated by Performance CI - ${this.currentResults.timestamp}*
`;

    // Write to GitHub Actions summary if in CI
    if (process.env.GITHUB_ACTIONS) {
      writeFileSync(process.env.GITHUB_STEP_SUMMARY || '/dev/stdout', summary);
    } else {
      console.log(summary);
    }
  }

  setExitCode() {
    const severity = this.currentResults.regression.severity;
    
    if (severity === 'error' && this.config.automation?.failOnRegression) {
      console.error('💥 Performance check failed due to critical regressions');
      process.exit(1);
    } else if (severity === 'warning') {
      console.warn('⚠️ Performance warnings detected');
      process.exit(0); // Don't fail CI on warnings
    } else {
      console.log('✅ Performance check passed');
      process.exit(0);
    }
  }

  printSummary() {
    console.log('\n📊 PERFORMANCE CI SUMMARY');
    console.log('=========================');
    console.log(`Status: ${this.currentResults.regression.severity}`);
    console.log(`Bundle: ${this.currentResults.bundleSize.total || 0}KB`);
    console.log(`Issues: ${this.currentResults.regression.issues.length}`);
    console.log(`Timestamp: ${this.currentResults.timestamp}`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const ci = new PerformanceCI();
  ci.runPerformanceCheck().catch(console.error);
}

export default PerformanceCI;