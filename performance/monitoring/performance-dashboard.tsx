// Real-time performance dashboard component
import React, { useState, useEffect, useMemo } from 'react';
import { performanceMonitor, PerformanceMetrics } from './performance-monitor';
import { webVitalsDashboard, WebVitalsMetric } from './web-vitals';
import { performanceBenchmark } from '../testing/performance-benchmarks';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [webVitals, setWebVitals] = useState<WebVitalsMetric[]>([]);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<{
    summary: {
      averageImprovement: number;
      totalTestsRun: number;
      memoryEfficiency: number;
    };
    results: Array<{
      testName: string;
      improvement: number;
      originalTime: number;
      optimizedTime: number;
      iterations: number;
    }>;
  } | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setWebVitals(webVitalsDashboard.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const latestMetrics = useMemo(() => {
    return metrics[metrics.length - 1];
  }, [metrics]);

  const runBenchmarks = async () => {
    setIsRunningBenchmark(true);
    try {
      await performanceBenchmark.runFullBenchmarkSuite();
      const report = performanceBenchmark.generatePerformanceReport();
      setBenchmarkResults(report);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  const formatMetric = (value: number, unit: string = 'ms') => {
    if (value < 1000) {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${(value / 1000).toFixed(2)}s`;
  };

  const getMetricColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'text-green-400';
    if (value <= poor) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">📊 Performance Dashboard</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl p-2"
            >
              ✕
            </button>
          </div>

          {/* Core Web Vitals */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Core Web Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {webVitals.map((vital) => (
                <div key={vital.name} className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">{vital.name}</div>
                  <div className={`text-xl font-bold ${
                    vital.rating === 'good' ? 'text-green-400' : 
                    vital.rating === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {formatMetric(vital.value, vital.name === 'CLS' ? '' : 'ms')}
                  </div>
                  <div className="text-xs text-slate-500">{vital.rating}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Performance Metrics */}
          {latestMetrics && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Real-time Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Render Time</div>
                  <div className={`text-xl font-bold ${getMetricColor(latestMetrics.renderTime, 16, 32)}`}>
                    {formatMetric(latestMetrics.renderTime)}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">XP Calc Time</div>
                  <div className={`text-xl font-bold ${getMetricColor(latestMetrics.xpCalculationTime, 1, 5)}`}>
                    {formatMetric(latestMetrics.xpCalculationTime)}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Memory Usage</div>
                  <div className="text-xl font-bold text-blue-400">
                    {(latestMetrics.heapUsed / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Frame Drops</div>
                  <div className={`text-xl font-bold ${
                    latestMetrics.animationFrameDrops > 10 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {latestMetrics.animationFrameDrops}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Score */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Performance Score</h3>
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${
                    webVitalsDashboard.getPerformanceScore() >= 80 ? 'text-green-400' :
                    webVitalsDashboard.getPerformanceScore() >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {Math.round(webVitalsDashboard.getPerformanceScore())}
                  </div>
                  <div className="text-sm text-slate-400">Overall Score</div>
                </div>
                <div className="w-32 h-32">
                  <ScoreRing score={webVitalsDashboard.getPerformanceScore()} />
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Performance Benchmarks</h3>
              <button
                onClick={runBenchmarks}
                disabled={isRunningBenchmark}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors"
              >
                {isRunningBenchmark ? 'Running...' : 'Run Benchmarks'}
              </button>
            </div>
            
            {benchmarkResults && (
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Avg Improvement:</span>
                      <span className="ml-2 text-green-400 font-bold">
                        {benchmarkResults.summary.averageImprovement.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tests Run:</span>
                      <span className="ml-2 text-blue-400 font-bold">
                        {benchmarkResults.summary.totalTestsRun.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Memory Efficiency:</span>
                      <span className="ml-2 text-purple-400 font-bold">
                        {benchmarkResults.summary.memoryEfficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {benchmarkResults.results.map((result, index: number) => (
                    <div key={index} className="bg-slate-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{result.testName}</span>
                        <span className={`font-bold ${
                          result.improvement > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.improvement > 0 ? '+' : ''}{result.improvement.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                        <div>Original: {formatMetric(result.originalTime)}</div>
                        <div>Optimized: {formatMetric(result.optimizedTime)}</div>
                        <div>Iterations: {result.iterations.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {latestMetrics && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Optimization Recommendations</h3>
              <div className="bg-slate-800 p-4 rounded-lg">
                <ul className="space-y-2 text-sm">
                  {performanceMonitor.getPerformanceReport().recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">💡</span>
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple score ring visualization
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#374151"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  );
};

export default PerformanceDashboard;