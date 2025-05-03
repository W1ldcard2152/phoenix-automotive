import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  publicDir: 'public',
  plugins: [react()],
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
        manualChunks: undefined,
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
        drop_console: false, // Keep console logs for debugging in production
        drop_debugger: true
      }
    }
  }
});