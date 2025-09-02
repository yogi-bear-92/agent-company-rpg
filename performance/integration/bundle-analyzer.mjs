// Bundle analysis script for performance optimization (ES Module)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BundleAnalyzer {
  constructor(distPath = './dist') {
    this.distPath = distPath;
  }

  async analyze() {
    console.log('🔍 Analyzing bundle performance...\n');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      bundleSize: await this.analyzeBundleSize(),
      assetOptimization: await this.analyzeAssetOptimization(),
      chunkingStrategy: await this.analyzeChunkingStrategy(),
      recommendations: []
    };

    analysis.recommendations = this.generateRecommendations(analysis);
    
    this.displayResults(analysis);
    this.saveReport(analysis);
    
    return analysis;
  }

  async analyzeBundleSize() {
    const distPath = path.resolve(this.distPath);
    
    if (!fs.existsSync(distPath)) {
      console.log('❌ Dist folder not found. Run npm run build first.');
      return null;
    }

    const assetsPath = path.join(distPath, 'assets');
    const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];
    
    const assets = files.map(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        type: this.getFileType(file)
      };
    });

    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = assets.filter(a => a.type === 'js').reduce((sum, a) => sum + a.size, 0);
    const cssSize = assets.filter(a => a.type === 'css').reduce((sum, a) => sum + a.size, 0);

    return {
      total: { bytes: totalSize, mb: (totalSize / 1024 / 1024).toFixed(2) },
      javascript: { bytes: jsSize, mb: (jsSize / 1024 / 1024).toFixed(2), kb: (jsSize / 1024).toFixed(2) },
      css: { bytes: cssSize, mb: (cssSize / 1024 / 1024).toFixed(2), kb: (cssSize / 1024).toFixed(2) },
      assets: assets.sort((a, b) => b.size - a.size)
    };
  }

  async analyzeAssetOptimization() {
    const indexPath = path.resolve(this.distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      return { error: 'index.html not found' };
    }
    
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    return {
      hasSourceMaps: indexContent.includes('.map'),
      isMinified: !indexContent.includes('  '), // Simple minification check
      hasGzipOptimization: this.checkGzipOptimization(),
      hasPreloading: indexContent.includes('rel="preload"'),
      hasPrefetching: indexContent.includes('rel="prefetch"'),
      indexSize: fs.statSync(indexPath).size
    };
  }

  async analyzeChunkingStrategy() {
    const assetsPath = path.resolve(this.distPath, 'assets');
    
    if (!fs.existsSync(assetsPath)) {
      return { error: 'Assets folder not found' };
    }
    
    const assetFiles = fs.readdirSync(assetsPath);
    const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
    const cssFiles = assetFiles.filter(file => file.endsWith('.css'));

    return {
      jsChunks: jsFiles.length,
      cssChunks: cssFiles.length,
      hasVendorChunk: jsFiles.some(file => file.includes('vendor') || file.includes('react')),
      hasComponentChunks: jsFiles.some(file => file.includes('components')),
      chunkSizes: jsFiles.map(file => {
        const filePath = path.join(assetsPath, file);
        const size = fs.statSync(filePath).size;
        return { 
          file, 
          size, 
          kb: (size / 1024).toFixed(2),
          mb: (size / 1024 / 1024).toFixed(2) 
        };
      }).sort((a, b) => b.size - a.size)
    };
  }

  checkGzipOptimization() {
    const assetsPath = path.resolve(this.distPath, 'assets');
    if (!fs.existsSync(assetsPath)) return false;
    
    const files = fs.readdirSync(assetsPath);
    return files.some(file => file.endsWith('.gz'));
  }

  getFileType(filename) {
    if (filename.endsWith('.js')) return 'js';
    if (filename.endsWith('.css')) return 'css';
    if (filename.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (filename.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.bundleSize) return recommendations;
    
    // Bundle size recommendations
    if (parseFloat(analysis.bundleSize.javascript.kb) > 200) {
      recommendations.push({
        priority: 'high',
        category: 'bundle-size',
        description: `JavaScript bundle is ${analysis.bundleSize.javascript.kb}KB - implement code splitting`,
        action: 'Split large components and implement lazy loading'
      });
    }

    if (parseFloat(analysis.bundleSize.css.kb) > 50) {
      recommendations.push({
        priority: 'medium',
        category: 'css',
        description: `CSS bundle is ${analysis.bundleSize.css.kb}KB - optimize styles`,
        action: 'Remove unused CSS and implement critical path CSS'
      });
    }

    // Chunking recommendations
    if (!analysis.chunkingStrategy.error && analysis.chunkingStrategy.jsChunks < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'chunking',
        description: 'Implement better code splitting',
        action: 'Separate vendor, components, and utils into different chunks'
      });
    }

    if (!analysis.chunkingStrategy.error && !analysis.chunkingStrategy.hasVendorChunk) {
      recommendations.push({
        priority: 'high',
        category: 'chunking',
        description: 'Create separate vendor chunk',
        action: 'Split React and other vendor libraries into separate chunk'
      });
    }

    // Asset optimization recommendations
    if (!analysis.assetOptimization.error && !analysis.assetOptimization.hasPreloading) {
      recommendations.push({
        priority: 'medium',
        category: 'loading',
        description: 'Implement resource preloading',
        action: 'Add preload links for critical resources'
      });
    }

    return recommendations;
  }

  displayResults(analysis) {
    console.log('📦 Bundle Analysis Results\n');
    
    if (analysis.bundleSize) {
      console.log('📊 Bundle Size:');
      console.log(`   Total: ${analysis.bundleSize.total.mb}MB`);
      console.log(`   JavaScript: ${analysis.bundleSize.javascript.kb}KB`);
      console.log(`   CSS: ${analysis.bundleSize.css.kb}KB`);
      console.log('');

      console.log('📁 Largest Assets:');
      analysis.bundleSize.assets.slice(0, 5).forEach(asset => {
        console.log(`   ${asset.name}: ${(asset.size / 1024).toFixed(2)}KB (${asset.type})`);
      });
      console.log('');
    }

    if (analysis.chunkingStrategy && !analysis.chunkingStrategy.error) {
      console.log('🗂️  Chunking Strategy:');
      console.log(`   JS Chunks: ${analysis.chunkingStrategy.jsChunks}`);
      console.log(`   CSS Chunks: ${analysis.chunkingStrategy.cssChunks}`);
      console.log(`   Has Vendor Chunk: ${analysis.chunkingStrategy.hasVendorChunk ? '✅' : '❌'}`);
      console.log('');
    }

    if (analysis.assetOptimization && !analysis.assetOptimization.error) {
      console.log('⚡ Asset Optimization:');
      console.log(`   Minified: ${analysis.assetOptimization.isMinified ? '✅' : '❌'}`);
      console.log(`   Source Maps: ${analysis.assetOptimization.hasSourceMaps ? '✅' : '❌'}`);
      console.log(`   Preloading: ${analysis.assetOptimization.hasPreloading ? '✅' : '❌'}`);
      console.log('');
    }

    if (analysis.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      analysis.recommendations.forEach((rec, i) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} ${rec.description}`);
        console.log(`      → ${rec.action}`);
      });
    } else {
      console.log('✅ No optimization recommendations - bundle is well optimized!');
    }
  }

  saveReport(analysis) {
    const reportDir = path.resolve('performance', 'reports');
    const reportPath = path.join(reportDir, 'bundle-analysis.json');
    
    // Ensure directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze().catch(console.error);