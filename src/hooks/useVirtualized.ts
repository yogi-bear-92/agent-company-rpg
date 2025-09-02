import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizedOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizedResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    style: React.CSSProperties;
  }>;
  totalHeight: number;
  scrollElementProps: {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
}

/**
 * Custom hook for virtualizing long lists to improve performance
 * Only renders visible items plus a small buffer
 */
export function useVirtualized<T>(
  items: T[],
  options: VirtualizedOptions
): VirtualizedResult<T> {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }

    return visibleItems;
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  const scrollElementProps = useMemo(() => ({
    onScroll: handleScroll,
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const,
    },
  }), [handleScroll, containerHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollElementProps,
  };
}

/**
 * Hook for performance monitoring and optimization suggestions
 */
export function usePerformanceMonitor(componentName: string) {
  const [renderTimes, setRenderTimes] = useState<number[]>([]);
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      setRenderTimes(prev => [...prev.slice(-9), renderTime]); // Keep last 10 measurements
      
      // Log performance warnings in development
      if (process.env.NODE_ENV === 'development') {
        const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
        
        if (avgRenderTime > 16) { // 60fps threshold
          console.warn(
            `🐌 Performance Warning: ${componentName} is rendering slowly (avg: ${avgRenderTime.toFixed(2)}ms).`,
            'Consider memoization or virtualization.'
          );
        }
      }
    };
  });

  const averageRenderTime = useMemo(() => {
    if (renderTimes.length === 0) return 0;
    return renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
  }, [renderTimes]);

  return {
    averageRenderTime,
    renderTimes,
    isSlowRendering: averageRenderTime > 16,
  };
}

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for intersection observer to lazy load components
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, IntersectionObserverEntry | null] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [element, setElement] = useState<Element | null>(null);

  const ref = useCallback((el: Element | null) => {
    setElement(el);
  }, []);

  useEffect(() => {
    if (!element || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, options]);

  return [ref, entry];
}