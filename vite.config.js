import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Improve asset naming for cross-browser compatibility
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and performance
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI components (only include packages that actually exist)
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            'lucide-react'
          ],
          
          // Admin-only dependencies
          admin: [
            'jwt-decode'
          ],
          
          // Utilities
          utils: [
            'class-variance-authority',
            'clsx',
            'cmdk'
          ]
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Ensure compatibility with older browsers
    target: 'es2015',
    // Add source maps for better debugging
    sourcemap: true,
    // Improve asset handling
    assetsInlineLimit: 4096, // Only inline assets smaller than 4kb
    emptyOutDir: true,     // Clean the output directory before build
    manifest: true,        // Generate a manifest.json for asset references
    minify: 'terser',      // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production for better performance
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'] // Remove specific console methods
      }
    },
    // Optimize chunk size limits
    chunkSizeWarningLimit: 1000 // Warn for chunks larger than 1MB
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});