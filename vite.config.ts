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
        emptyOutDir: false, // Don't empty dist to preserve manifest and other files
        rollupOptions: {
          input: {
            'content-script': resolve(__dirname, 'src/content/content-script.tsx'),
            'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            format: 'es',
            // Remove conflicting options
          },
          external: ['chrome']
        },
        target: 'es2020',
        minify: false,
        sourcemap: false,
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