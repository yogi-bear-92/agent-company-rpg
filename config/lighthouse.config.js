// Lighthouse CI configuration for performance monitoring
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 20000,
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        // Performance budgets
        'categories:performance': ['error', { minScore: 0.65 }],
        'categories:accessibility': ['warn', { minScore: 0.80 }],
        'categories:best-practices': ['warn', { minScore: 0.80 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.25 }],
        'first-input-delay': ['warn', { maxNumericValue: 300 }],
        
        // Bundle size budgets
        'total-byte-weight': ['warn', { maxNumericValue: 600000 }], // 600KB
        'unused-javascript': ['warn', { maxNumericValue: 100000 }], // 100KB
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }], // 50KB
        
        // Resource optimization
        'render-blocking-resources': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        'interactive': ['warn', { maxNumericValue: 5000 }],
        
        // Progressive enhancement
        'uses-responsive-images': 'error',
        'uses-webp-images': 'warn',
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'warn'
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './performance/reports/lighthouse',
      reportFilenamePattern: 'lighthouse-%%DATETIME%%.%%EXTENSION%%'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './performance/reports/lighthouse-history'
      }
    }
  }
};