// Vitest configuration for performance testing
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./performance/testing/setup-performance-tests.ts'],
    include: ['performance/**/*.test.ts', 'performance/**/*.test.tsx'],
    globals: true,
    // Performance test specific settings
    testTimeout: 30000, // 30 seconds for performance tests
    hookTimeout: 10000,  // 10 seconds for setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './performance/reports/coverage',
      include: [
        'src/**/*.{ts,tsx}',
        'performance/**/*.{ts,tsx}'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    },
    reporter: ['verbose'],
    outputFile: './performance/reports/test-results.json'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@perf': resolve(__dirname, '../')
    }
  }
});