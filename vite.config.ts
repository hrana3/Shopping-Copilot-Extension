import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'extension') {
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',
        emptyOutDir: true, // Empty dist to ensure clean build
        rollupOptions: {
          input: {
            'content-script': resolve(__dirname, 'src/content/content-script.tsx'),
            'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
            'popup': resolve(__dirname, 'public/popup.js')
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name].js',
            assetFileNames: (assetInfo) => {
              // Keep CSS files in the root directory with their original names
              if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                return '[name][extname]';
              }
              return 'assets/[name][extname]';
            }
          },
          external: ['chrome']
        },
        target: 'es2020',
        minify: false, // Disable minification for easier debugging
        sourcemap: true,
        copyPublicDir: true
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
    };
  }

  // Default development configuration
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});