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
      const fidValue = fidEntry.processingStart - fidEntry.startTime;
      
      callback({
        name: 'FID',
        value: fidValue,
        rating: getRating(fidValue, THRESHOLDS.FID),
        delta: fidValue,
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

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
  startTime: number;
}

export function onCLS(callback: WebVitalsCallback) {
  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: LayoutShiftEntry[] = [];
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as LayoutShiftEntry;
      
      if (!layoutShiftEntry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
        
        // If the entry occurred less than 1 second after the previous entry and
        // less than 5 seconds after the first entry in the session, include it
        if (sessionValue &&
            lastSessionEntry &&
            firstSessionEntry &&
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
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigationEntry) {
    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    
    callback({
      name: 'TTFB',
      value: ttfb,
      rating: getRating(ttfb, THRESHOLDS.TTFB),
      delta: ttfb,
      id: generateUniqueId(),
      timestamp: Date.now()
    });
  }
}

export function onINP(callback: WebVitalsCallback) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as PerformanceEventTiming;
      const inpValue = eventEntry.processingStart - eventEntry.startTime;
      
      callback({
        name: 'INP',
        value: inpValue,
        rating: getRating(inpValue, THRESHOLDS.INP),
        delta: inpValue,
        id: generateUniqueId(),
        timestamp: Date.now()
      });
    }
  });
  
  try {
    observer.observe({ entryTypes: ['event'] });
  } catch {
    console.warn('INP observation not supported');
  }
}

function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Dashboard class for managing web vitals
class WebVitalsDashboard {
  private metrics: WebVitalsMetric[] = [];
  private callbacks: WebVitalsCallback[] = [];
  private isTracking = false;

  subscribe(callback: WebVitalsCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private notifyCallbacks(metric: WebVitalsMetric) {
    this.metrics.push(metric);
    this.callbacks.forEach(callback => callback(metric));
  }

  startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;

    onFCP((metric) => this.notifyCallbacks(metric));
    onLCP((metric) => this.notifyCallbacks(metric));
    onFID((metric) => this.notifyCallbacks(metric));
    onCLS((metric) => this.notifyCallbacks(metric));
    onTTFB((metric) => this.notifyCallbacks(metric));
    onINP((metric) => this.notifyCallbacks(metric));
  }

  stopTracking() {
    this.isTracking = false;
    this.callbacks = [];
  }

  getMetrics(): WebVitalsMetric[] {
    return [...this.metrics];
  }

  getPerformanceScore(): number {
    if (this.metrics.length === 0) return 100;

    const weights = { FCP: 0.15, LCP: 0.25, FID: 0.15, CLS: 0.15, TTFB: 0.15, INP: 0.15 };
    let totalScore = 0;
    let totalWeight = 0;

    for (const [metric, weight] of Object.entries(weights)) {
      const latestMetric = this.metrics.filter(m => m.name === metric).pop();
      if (latestMetric) {
        const score = latestMetric.rating === 'good' ? 100 : 
                     latestMetric.rating === 'needs-improvement' ? 60 : 25;
        totalScore += score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 100;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const webVitalsDashboard = new WebVitalsDashboard();