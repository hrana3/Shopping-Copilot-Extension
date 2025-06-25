import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'extension') {
    return {
      plugins: [
        react(),
        {
          name: 'copy-extension-files',
          writeBundle() {
            // Ensure dist directory exists
            if (!existsSync('dist')) {
              mkdirSync('dist', { recursive: true });
            }
            
            // Copy manifest.json
            copyFileSync('public/manifest.json', 'dist/manifest.json');
            
            // Copy popup.html
            copyFileSync('public/popup.html', 'dist/popup.html');
            
            // Copy popup.js
            copyFileSync('public/popup.js', 'dist/popup.js');
            
            // Copy content-styles.css
            copyFileSync('public/content-styles.css', 'dist/content-styles.css');
            
            // Copy icons directory
            if (!existsSync('dist/icons')) {
              mkdirSync('dist/icons', { recursive: true });
            }
            copyFileSync('public/icons/icon-16.png', 'dist/icons/icon-16.png');
            copyFileSync('public/icons/icon-32.png', 'dist/icons/icon-32.png');
            copyFileSync('public/icons/icon-48.png', 'dist/icons/icon-48.png');
            copyFileSync('public/icons/icon-128.png', 'dist/icons/icon-128.png');
            
            console.log('✅ Extension files copied successfully');
          }
        }
      ],
      build: {
        outDir: 'dist',
        emptyOutDir: false, // Don't empty the directory to preserve copied files
        rollupOptions: {
          input: {
            'content-script': resolve(__dirname, 'src/content/content-script.tsx'),
            'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            format: 'iife',
          },
          external: [], // Don't externalize anything for extension
        },
        target: 'es2020',
        minify: false, // Disable minification for easier debugging
        sourcemap: false, // Disable source maps to avoid issues
        lib: false, // Not building a library
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
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
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