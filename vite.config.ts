// Version: 1.0.1 - Updated for GitHub tracking
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'extension') {
    return {
      plugins: [
        react(),
        {
          name: 'copy-manifest',
          closeBundle() {
            // Copy manifest.json to dist folder
            copyFileSync('public/manifest.json', 'dist/manifest.json');
            console.log('Copied manifest.json to dist folder');
            
            // Copy icons to dist/icons folder
            try {
              const fs = require('fs');
              const path = require('path');
              
              // Create icons directory if it doesn't exist
              if (!fs.existsSync('dist/icons')) {
                fs.mkdirSync('dist/icons', { recursive: true });
              }
              
              // Copy all icon files
              const iconFiles = ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png'];
              iconFiles.forEach(file => {
                if (fs.existsSync(`public/icons/${file}`)) {
                  copyFileSync(`public/icons/${file}`, `dist/icons/${file}`);
                  console.log(`Copied ${file} to dist/icons folder`);
                }
              });
              
              // Copy popup.html and popup.js
              if (fs.existsSync('public/popup.html')) {
                copyFileSync('public/popup.html', 'dist/popup.html');
                console.log('Copied popup.html to dist folder');
              }
              
              if (fs.existsSync('public/popup.js')) {
                copyFileSync('public/popup.js', 'dist/popup.js');
                console.log('Copied popup.js to dist folder');
              }
              
              // Copy content-styles.css
              if (fs.existsSync('public/content-styles.css')) {
                copyFileSync('public/content-styles.css', 'dist/content-styles.css');
                console.log('Copied content-styles.css to dist folder');
              }
            } catch (error) {
              console.error('Error copying files:', error);
            }
          }
        }
      ],
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