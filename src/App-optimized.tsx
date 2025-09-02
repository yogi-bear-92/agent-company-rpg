import { useState, useCallback, lazy, Suspense } from 'react';
import { PerformanceProvider } from '../performance/integration/performance-provider';
import { performanceMonitor } from '../performance/monitoring/performance-monitor';
import { LoadingSpinner, ErrorBoundary } from '../performance/optimization/react-optimizations';

// Lazy load main components
const LazyApp = lazy(() => import('./App'));

// Main optimized application component
export default function AppOptimized() {
  const [performanceEnabled, setPerformanceEnabled] = useState(
    process.env.NODE_ENV === 'development'
  );

  const handlePerformanceToggle = useCallback(() => {
    setPerformanceEnabled(prev => !prev);
  }, []);

  return (
    <ErrorBoundary>
      <PerformanceProvider enableInProduction={performanceEnabled}>
        <div className="min-h-screen bg-slate-900">
          {/* Development performance controls */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-4 left-4 z-40">
              <button
                onClick={handlePerformanceToggle}
                className="px-3 py-1 bg-slate-700 text-white text-xs rounded-lg border border-slate-600 hover:bg-slate-600"
                aria-label={`${performanceEnabled ? 'Disable' : 'Enable'} performance monitoring`}
              >
                Perf: {performanceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          {/* Main application */}
          <Suspense fallback={<LoadingSpinner />}>
            <LazyApp />
          </Suspense>
        </div>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}