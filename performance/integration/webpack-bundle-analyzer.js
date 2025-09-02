// Bundle analysis script for performance optimization
const fs = require('fs');
const path = require('path');

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
    const files = fs.readdirSync(this.distPath, { recursive: true });
    const assets = files
      .filter(file => file.toString().includes('assets/'))
      .map(file => {
        const filePath = path.join(this.distPath, file.toString());
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          type: this.getFileType(file.toString())
        };
      });

    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = assets.filter(a => a.type === 'js').reduce((sum, a) => sum + a.size, 0);
    const cssSize = assets.filter(a => a.type === 'css').reduce((sum, a) => sum + a.size, 0);

    return {
      total: { bytes: totalSize, mb: (totalSize / 1024 / 1024).toFixed(2) },
      javascript: { bytes: jsSize, mb: (jsSize / 1024 / 1024).toFixed(2) },
      css: { bytes: cssSize, mb: (cssSize / 1024 / 1024).toFixed(2) },
      assets: assets.sort((a, b) => b.size - a.size)
    };
  }

  async analyzeAssetOptimization() {
    const indexPath = path.join(this.distPath, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    return {
      hasSourceMaps: indexContent.includes('.map'),
      isMinified: !indexContent.includes('  '), // Simple minification check
      hasGzipOptimization: this.checkGzipOptimization(),
      hasPreloading: indexContent.includes('rel="preload"'),
      hasPrefetching: indexContent.includes('rel="prefetch"')
    };
  }

  async analyzeChunkingStrategy() {
    const assetFiles = fs.readdirSync(path.join(this.distPath, 'assets'));
    const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
    const cssFiles = assetFiles.filter(file => file.endsWith('.css'));

    return {
      jsChunks: jsFiles.length,
      cssChunks: cssFiles.length,
      hasVendorChunk: jsFiles.some(file => file.includes('vendor')),
      hasComponentChunks: jsFiles.some(file => file.includes('components')),
      chunkSizes: jsFiles.map(file => {
        const filePath = path.join(this.distPath, 'assets', file);
        const size = fs.statSync(filePath).size;
        return { file, size, mb: (size / 1024 / 1024).toFixed(2) };
      }).sort((a, b) => b.size - a.size)
    };
  }

  checkGzipOptimization() {
    // Check if gzipped files exist or if server should compress
    const assetPath = path.join(this.distPath, 'assets');
    const files = fs.readdirSync(assetPath);
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
    
    // Bundle size recommendations
    if (parseFloat(analysis.bundleSize.total.mb) > 1.0) {
      recommendations.push({
        priority: 'high',
        category: 'bundle-size',
        description: 'Bundle size exceeds 1MB - implement code splitting',
        action: 'Split large components and implement lazy loading'
      });
    }

    if (parseFloat(analysis.bundleSize.javascript.mb) > 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'javascript',
        description: 'JavaScript bundle is large - optimize imports',
        action: 'Use tree shaking and remove unused dependencies'
      });
    }

    // Chunking recommendations
    if (analysis.chunkingStrategy.jsChunks < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'chunking',
        description: 'Implement better code splitting',
        action: 'Separate vendor, components, and utils into different chunks'
      });
    }

    if (!analysis.chunkingStrategy.hasVendorChunk) {
      recommendations.push({
        priority: 'high',
        category: 'chunking',
        description: 'Create separate vendor chunk',
        action: 'Split React and other vendor libraries into separate chunk'
      });
    }

    // Asset optimization recommendations
    if (!analysis.assetOptimization.hasPreloading) {
      recommendations.push({
        priority: 'medium',
        category: 'loading',
        description: 'Implement resource preloading',
        action: 'Add preload links for critical resources'
      });
    }

    if (!analysis.assetOptimization.hasGzipOptimization) {
      recommendations.push({
        priority: 'high',
        category: 'compression',
        description: 'Enable gzip compression',
        action: 'Configure server-side compression for static assets'
      });
    }

    return recommendations;
  }

  displayResults(analysis) {
    console.log('📦 Bundle Analysis Results\n');
    console.log('📊 Bundle Size:');
    console.log(`   Total: ${analysis.bundleSize.total.mb}MB (${analysis.bundleSize.total.bytes} bytes)`);
    console.log(`   JavaScript: ${analysis.bundleSize.javascript.mb}MB`);
    console.log(`   CSS: ${analysis.bundleSize.css.mb}MB`);
    console.log('');

    console.log('🗂️  Chunking Strategy:');
    console.log(`   JS Chunks: ${analysis.chunkingStrategy.jsChunks}`);
    console.log(`   CSS Chunks: ${analysis.chunkingStrategy.cssChunks}`);
    console.log(`   Has Vendor Chunk: ${analysis.chunkingStrategy.hasVendorChunk ? '✅' : '❌'}`);
    console.log('');

    console.log('⚡ Asset Optimization:');
    console.log(`   Minified: ${analysis.assetOptimization.isMinified ? '✅' : '❌'}`);
    console.log(`   Source Maps: ${analysis.assetOptimization.hasSourceMaps ? '✅' : '❌'}`);
    console.log(`   Gzip: ${analysis.assetOptimization.hasGzipOptimization ? '✅' : '❌'}`);
    console.log(`   Preloading: ${analysis.assetOptimization.hasPreloading ? '✅' : '❌'}`);
    console.log('');

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
    const reportPath = path.join('performance', 'reports', 'bundle-analysis.json');
    
    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = { BundleAnalyzer };