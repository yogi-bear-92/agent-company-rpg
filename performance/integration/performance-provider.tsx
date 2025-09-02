// Performance monitoring provider for React app
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { performanceMonitor } from '../monitoring/performance-monitor';
import { webVitalsDashboard, WebVitalsMetric } from '../monitoring/web-vitals';
import { performanceReportGenerator, DetailedPerformanceReport } from '../reports/performance-report-generator';

interface PerformanceContextType {
  isMonitoring: boolean;
  webVitals: WebVitalsMetric[];
  performanceScore: number;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  generateReport: () => Promise<DetailedPerformanceReport>;
  clearMetrics: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
  enableInProduction?: boolean;
}

export function PerformanceProvider({ 
  children, 
  enableInProduction = false
}: PerformanceProviderProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [webVitals, setWebVitals] = useState<WebVitalsMetric[]>([]);
  const [performanceScore, setPerformanceScore] = useState(100);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Subscribe to web vitals updates
    const unsubscribe = webVitalsDashboard.subscribe((metric) => {
      setWebVitals(prev => {
        const filtered = prev.filter(m => m.name !== metric.name);
        return [...filtered, metric];
      });
    });

    // Update performance score periodically
    const scoreInterval = setInterval(() => {
      setPerformanceScore(webVitalsDashboard.getPerformanceScore());
    }, 5000);

    // Store cleanup functions
    (window as any).__performanceCleanup = () => {
      unsubscribe();
      clearInterval(scoreInterval);
    };
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    
    const cleanup = (window as any).__performanceCleanup;
    if (typeof cleanup === 'function') {
      cleanup();
      delete (window as any).__performanceCleanup;
    }
  }, [isMonitoring]);

  useEffect(() => {
    // Only enable monitoring in development or if explicitly enabled in production
    if (process.env.NODE_ENV === 'development' || enableInProduction) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enableInProduction, startMonitoring, stopMonitoring]);

  const generateReport = async (): Promise<DetailedPerformanceReport> => {
    return await performanceReportGenerator.generateComprehensiveReport();
  };

  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    setWebVitals([]);
    setPerformanceScore(100);
  };

  const contextValue: PerformanceContextType = {
    isMonitoring,
    webVitals,
    performanceScore,
    startMonitoring,
    stopMonitoring,
    generateReport,
    clearMetrics
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
      {/* Development performance overlay */}
      {process.env.NODE_ENV === 'development' && isMonitoring && (
        <PerformanceOverlay />
      )}
    </PerformanceContext.Provider>
  );
}

// Development overlay for real-time performance monitoring
function PerformanceOverlay() {
  const { webVitals, performanceScore } = usePerformanceContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const latestMetrics = performanceMonitor.getPerformanceReport();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`bg-black/80 backdrop-blur border border-slate-600 rounded-lg transition-all ${
          isExpanded ? 'w-80 h-auto' : 'w-16 h-16'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-16 flex items-center justify-center text-white hover:bg-white/10 rounded-lg"
          aria-label={isExpanded ? 'Collapse performance overlay' : 'Expand performance overlay'}
        >
          {isExpanded ? '📊' : '⚡'}
        </button>
        
        {isExpanded && (
          <div className="p-4 pt-0">
            <div className="text-white font-semibold mb-2">Performance</div>
            
            {/* Performance Score */}
            <div className="mb-3">
              <div className={`text-lg font-bold ${
                performanceScore >= 80 ? 'text-green-400' :
                performanceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                Score: {Math.round(performanceScore)}
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="space-y-1 text-xs">
              {webVitals.slice(0, 3).map(vital => (
                <div key={vital.name} className="flex justify-between">
                  <span className="text-slate-300">{vital.name}:</span>
                  <span className={
                    vital.rating === 'good' ? 'text-green-400' :
                    vital.rating === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {vital.value.toFixed(0)}ms
                  </span>
                </div>
              ))}
              
              {latestMetrics.current && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Render:</span>
                    <span className={
                      (latestMetrics.current as any).renderTime < 16 ? 'text-green-400' : 'text-yellow-400'
                    }>
                      {((latestMetrics.current as any).renderTime || 0).toFixed(1)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Memory:</span>
                    <span className="text-blue-400">
                      {(((latestMetrics.current as any).heapUsed || 0) / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Warnings */}
            {latestMetrics.warnings.length > 0 && (
              <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs">
                <div className="text-red-400 font-semibold">Issues:</div>
                {latestMetrics.warnings.slice(0, 2).map((warning, i) => (
                  <div key={i} className="text-red-300">{(warning as any).metric}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceProvider');
  }
  return context;
}

export default PerformanceProvider;