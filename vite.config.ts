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
        rollupOptions: {
          input: {
            'content-script': resolve(__dirname, 'src/content/content-script.tsx'),
            'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]'
          }
        },
        target: 'es2015',
        minify: true
      },
      optimizeDeps: {
        exclude: ['lucide-react'],
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