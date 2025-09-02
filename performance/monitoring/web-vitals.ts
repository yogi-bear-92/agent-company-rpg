// Core Web Vitals monitoring implementation
// Based on Google's web-vitals library patterns

export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
}

export type WebVitalsCallback = (metric: WebVitalsMetric) => void;

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  FCP: [1800, 3000], // [good, needs-improvement] - poor is above needs-improvement
  LCP: [2500, 4000],
  FID: [100, 300],
  CLS: [0.1, 0.25],
  TTFB: [800, 1800],
  INP: [200, 500]
};

function getRating(value: number, thresholds: number[]): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs-improvement';
  return 'poor';
}

let fcpReported = false;
let lcpReported = false;

export function onFCP(callback: WebVitalsCallback) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint' && !fcpReported) {
        fcpReported = true;
        callback({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating(entry.startTime, THRESHOLDS.FCP),
          delta: entry.startTime,
          id: generateUniqueId(),
          timestamp: Date.now()
        });
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['paint'] });
  } catch {
    console.warn('FCP observation not supported');
  }
}

export function onLCP(callback: WebVitalsCallback) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!lcpReported) {
        lcpReported = true;
        callback({
          name: 'LCP',
          value: entry.startTime,
          rating: getRating(entry.startTime, THRESHOLDS.LCP),
          delta: entry.startTime,
          id: generateUniqueId(),
          timestamp: Date.now()
        });
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch {
    console.warn('LCP observation not supported');
  }
}

export function onFID(callback: WebVitalsCallback) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEventTiming;
      const value = fidEntry.processingStart - fidEntry.startTime;
      
      callback({
        name: 'FID',
        value,
        rating: getRating(value, THRESHOLDS.FID),
        delta: value,
        id: generateUniqueId(),
        timestamp: Date.now()
      });
    }
  });
  
  try {
    observer.observe({ entryTypes: ['first-input'] });
  } catch {
    console.warn('FID observation not supported');
  }
}

export function onCLS(callback: WebVitalsCallback) {
  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: unknown[] = [];
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number; startTime: number };
      
      if (!layoutShiftEntry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
        
        // If the entry occurred less than 1 second after the previous entry and
        // less than 5 seconds after the first entry in the session, include it
        if (sessionValue &&
            layoutShiftEntry.startTime - lastSessionEntry.startTime < 1000 &&
            layoutShiftEntry.startTime - firstSessionEntry.startTime < 5000) {
          sessionValue += layoutShiftEntry.value;
          sessionEntries.push(layoutShiftEntry);
        } else {
          sessionValue = layoutShiftEntry.value;
          sessionEntries = [layoutShiftEntry];
        }
        
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          callback({
            name: 'CLS',
            value: clsValue,
            rating: getRating(clsValue, THRESHOLDS.CLS),
            delta: layoutShiftEntry.value,
            id: generateUniqueId(),
            timestamp: Date.now()
          });
        }
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['layout-shift'] });
  } catch {
    console.warn('CLS observation not supported');
  }
}

export function onTTFB(callback: WebVitalsCallback) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const navEntry = entry as PerformanceNavigationTiming;
      const value = navEntry.responseStart - navEntry.requestStart;
      
      callback({
        name: 'TTFB',
        value,
        rating: getRating(value, THRESHOLDS.TTFB),
        delta: value,
        id: generateUniqueId(),
        timestamp: Date.now()
      });
    }
  });
  
  try {
    observer.observe({ entryTypes: ['navigation'] });
  } catch {
    console.warn('TTFB observation not supported');
  }
}

// Interaction to Next Paint (INP) - newer metric
export function onINP(callback: WebVitalsCallback) {
  const interactionMap = new Map();
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as PerformanceEntry & { interactionId?: number; duration?: number };
      
      if (eventEntry.interactionId) {
        const interaction = interactionMap.get(eventEntry.interactionId) || [];
        interaction.push(eventEntry);
        interactionMap.set(eventEntry.interactionId, interaction);
        
        // Calculate INP when interaction is complete
        if (interaction.length >= 3 || eventEntry.duration > 0) {
          const duration = Math.max(...interaction.map((e: PerformanceEntry & { duration?: number }) => e.duration || 0));
          
          callback({
            name: 'INP',
            value: duration,
            rating: getRating(duration, THRESHOLDS.INP),
            delta: duration,
            id: generateUniqueId(),
            timestamp: Date.now()
          });
        }
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['event'] });
  } catch {
    console.warn('INP observation not supported');
  }
}

export function getCoreWebVitals(callback: WebVitalsCallback) {
  onFCP(callback);
  onLCP(callback);
  onFID(callback);
  onCLS(callback);
  onTTFB(callback);
  onINP(callback);
}

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Real-time performance dashboard data
export class WebVitalsDashboard {
  private metrics: WebVitalsMetric[] = [];
  private callbacks: WebVitalsCallback[] = [];

  constructor() {
    this.initializeCollection();
  }

  private initializeCollection() {
    const callback: WebVitalsCallback = (metric) => {
      this.metrics.push(metric);
      this.callbacks.forEach(cb => cb(metric));
      
      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }
    };

    getCoreWebVitals(callback);
  }

  subscribe(callback: WebVitalsCallback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  getMetrics() {
    return [...this.metrics];
  }

  getLatestMetrics() {
    const latest: { [key: string]: WebVitalsMetric } = {};
    
    for (const metric of this.metrics) {
      if (!latest[metric.name] || metric.timestamp > latest[metric.name].timestamp) {
        latest[metric.name] = metric;
      }
    }
    
    return Object.values(latest);
  }

  getPerformanceScore(): number {
    const latest = this.getLatestMetrics();
    if (latest.length === 0) return 100;
    
    const scores = latest.map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
      }
    });
    
    return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
  }
}

export const webVitalsDashboard = new WebVitalsDashboard();
export default webVitalsDashboard;