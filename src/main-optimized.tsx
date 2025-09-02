import React from 'react';
import ReactDOM from 'react-dom/client';
import { performanceMonitor } from '../performance/monitoring/performance-monitor';
// import { webVitalsDashboard } from '../performance/monitoring/web-vitals';
import AppOptimized from './App-optimized';
import './index.css';

// Initialize performance monitoring
performanceMonitor.startMonitoring();

// Initialize web vitals monitoring for production insights
if (process.env.NODE_ENV === 'production') {
  // WebVitalsDashboard initializes automatically in constructor
}

// Create root with performance tracking
const startTime = performance.now();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppOptimized />
  </React.StrictMode>
);

// Track initial render performance
const renderTime = performance.now() - startTime;
performanceMonitor.recordMetric('initial-render', renderTime);

if (renderTime > 100) {
  console.warn(`Slow initial render detected: ${renderTime.toFixed(2)}ms`);
}

// Log performance summary in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    const report = performanceMonitor.getPerformanceReport();
    console.info('Performance Summary:', {
      initialRender: `${renderTime.toFixed(2)}ms`,
      current: report.current,
      warnings: report.warnings.length
    });
  }, 1000);
}