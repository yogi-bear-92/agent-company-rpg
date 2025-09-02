// Bundle analyzer configuration for size monitoring
import { defineConfig } from 'vite';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default defineConfig({
  plugins: [
    {
      name: 'bundle-analyzer',
      generateBundle() {
        // Custom bundle analysis logic
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        // Generate detailed bundle analysis
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['lucide-react'],
          'game-logic': [
            './src/utils/xpCalculator.ts',
            './src/utils/levelProgression.ts'
          ],
          'ui-components': [
            './src/components/AgentSheet.tsx',
            './src/components/QuestBoard.tsx',
            './src/components/LevelUpNotification.tsx'
          ],
          'performance': [
            './performance/monitoring/performance-monitor.ts',
            './performance/monitoring/web-vitals.ts'
          ]
        }
      }
    },
    // Generate bundle analysis report
    sourcemap: true,
    minify: 'terser'
  }
});

// Bundle size budgets (in KB)
export const BUNDLE_BUDGETS = {
  'vendor-react': 150,
  'vendor-utils': 50,
  'game-logic': 30,
  'ui-components': 80,
  'performance': 25,
  'main': 50,
  'total': 385
};

// Bundle analysis utilities
export function analyzeBundleSize(stats) {
  const analysis = {
    chunks: [],
    total: 0,
    issues: [],
    recommendations: []
  };

  if (stats && stats.chunks) {
    stats.chunks.forEach(chunk => {
      const size = chunk.size / 1024; // Convert to KB
      const budget = BUNDLE_BUDGETS[chunk.name] || 100;
      
      analysis.chunks.push({
        name: chunk.name,
        size: Math.round(size),
        budget,
        percentage: Math.round((size / budget) * 100)
      });
      
      analysis.total += size;
      
      if (size > budget * 1.2) {
        analysis.issues.push({
          severity: 'high',
          chunk: chunk.name,
          message: `Chunk ${chunk.name} (${Math.round(size)}KB) exceeds budget ${budget}KB by ${Math.round(((size/budget - 1) * 100))}%`
        });
      } else if (size > budget) {
        analysis.issues.push({
          severity: 'medium',
          chunk: chunk.name,
          message: `Chunk ${chunk.name} (${Math.round(size)}KB) exceeds budget ${budget}KB`
        });
      }
    });
  }

  // Generate recommendations
  if (analysis.total > BUNDLE_BUDGETS.total) {
    analysis.recommendations.push('Consider code splitting for large components');
    analysis.recommendations.push('Implement dynamic imports for non-critical features');
    analysis.recommendations.push('Analyze and remove unused dependencies');
  }

  return analysis;
}