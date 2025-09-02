import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppOptimized from './App-optimized.tsx'
import './index.css'
import './styles/levelProgression.css'
import { PerformanceProvider } from '../performance/integration/performance-provider'

// Initialize performance monitoring immediately
import { performanceMonitor } from '../performance/monitoring/performance-monitor'

// Start performance tracking before React renders
const appStartTime = performance.now();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerformanceProvider enableInProduction={false}>
      <AppOptimized />
    </PerformanceProvider>
  </StrictMode>,
)

// Log initial app startup time
window.addEventListener('load', () => {
  const loadTime = performance.now() - appStartTime;
  console.log(`App initialization completed in ${loadTime.toFixed(2)}ms`);
  
  // Store performance data in memory after initial load
  setTimeout(() => {
    const report = performanceMonitor.getPerformanceReport();
    if (window.location.search.includes('debug=performance')) {
      console.table(report.current);
    }
  }, 1000);
});