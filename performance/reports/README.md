# Performance Reports

This directory contains automated performance reports and analysis results.

## Generated Files

- `bundle-analysis.json` - Bundle size and optimization analysis
- `lighthouse.html` - Lighthouse performance audit
- `latest-report.html` - Comprehensive performance report
- `test-results.json` - Performance test results
- `coverage/` - Code coverage reports

## Performance Targets

### Core Web Vitals
- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s  
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Application Metrics
- **Component Render Time**: < 16ms (60fps)
- **XP Calculation Time**: < 1ms
- **Bundle Size**: < 200KB gzipped
- **Memory Usage**: < 50MB baseline

## Running Performance Tests

```bash
# Run all performance tests
npm run perf:test

# Run performance benchmarks
npm run perf:bench

# Generate comprehensive report  
npm run perf:report

# Full performance analysis
npm run perf:analyze

# Bundle analysis
node performance/integration/bundle-analyzer.mjs

# Lighthouse audit
npm run lighthouse
```

## Performance Optimization Results

Based on the implemented optimizations:

### Bundle Optimizations
- ✅ Code splitting implemented
- ✅ Lazy loading for heavy components
- ✅ Tree shaking enabled
- ✅ Minification and compression

### React Optimizations  
- ✅ Component memoization with React.memo()
- ✅ useMemo() for expensive calculations
- ✅ useCallback() for event handlers
- ✅ Virtualized lists for large datasets

### XP System Optimizations
- ✅ Memoized calculations with caching
- ✅ Binary search for level calculations
- ✅ Batch operations for multiple agents
- ✅ Pre-computed lookup tables

### Expected Performance Improvements
- **Render Performance**: 40-60% improvement
- **XP Calculations**: 70-80% improvement  
- **Bundle Loading**: 25-35% reduction
- **Memory Usage**: 20-30% optimization

## Monitoring in Development

Enable performance monitoring overlay:
- Add `?debug=performance` to URL
- Check browser console for performance logs
- Use React DevTools Profiler

## Production Monitoring

Performance monitoring is disabled by default in production. To enable:

```tsx
<PerformanceProvider enableInProduction={true}>
  <App />
</PerformanceProvider>
```