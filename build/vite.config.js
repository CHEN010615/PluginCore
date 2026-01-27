import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: './vite',
  base: './',
  plugins: [vue()],
  server: {
    host: 'localhost',
    port: process.env.VITE_PORT
  },
  resolve: {
    alias: {
      '@': path.resolve('vite/src')
    }
  },
  build: {
    outDir: '../dist/vite',
    assetsDir: '../dist/vite/asset',
    rollupOptions: {
      manualChunks(id) {
        if (id.includes("node_modules")) {
          return "rendor";
        } else if (id.includes("src"))  {
          return "about";
        } else {
          return "asset";
        }
      },
      output: {
        entryFileNames: 'js/index-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames(asset) {
          console.log(asset.name);
          if (asset.name.endsWith(".css") && asset.name.includes("about")) {
            return 'style/[name]-[hash].css';
          }
          return 'asset/[name]-[hash].[ext]';
        }
      }
    }
  }
});