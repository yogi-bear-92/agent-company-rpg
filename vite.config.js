import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        // Performance optimizations
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug']
            },
            mangle: {
                safari10: true
            }
        },
        rollupOptions: {
            output: {
                // Code splitting for better caching
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'utils': [
                        './src/utils/xpCalculator.ts',
                        './src/utils/levelProgression.ts'
                    ],
                    'components': [
                        './src/components/AgentSheet.tsx',
                        './src/components/QuestBoard.tsx',
                        './src/components/LevelUpNotification.tsx'
                    ]
                },
                // Optimize chunk names for caching
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        // Chunk size warnings
        chunkSizeWarningLimit: 500, // KB
        assetsInlineLimit: 4096 // Inline assets smaller than 4KB
    },
    // Performance optimizations for development
    optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
        exclude: ['@vite/client', '@vite/env']
    },
    // CSS optimization
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            // Enable CSS optimization
        }
    }
});