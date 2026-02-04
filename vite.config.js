import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nonModulePlugin } from './vite-plugin-non-module.js';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [vue(), nonModulePlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    },
    rollupOptions: {
      input: {
        'index-vue': './index-vue.html',
        main: './index.html',
        leaderboard: './leaderboard.html',
        tetris: './games/tetris.html',
        snake: './games/snake.html',
        minesweeper: './games/minesweeper.html',
        '2048': './games/2048.html',
        chess: './games/chess.html',
        checkers: './games/checkers.html',
        'tic-tac-toe': './games/tic-tac-toe.html',
        'memory-card': './games/memory-card.html',
        arkanoid: './games/arkanoid.html',
      },
      output: {
        manualChunks: {
          'vendor': ['@supabase/supabase-js'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name].[ext]';
          }
          if (assetInfo.name.endsWith('.js')) {
            return 'js/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
        entryFileNames: (entryInfo) => {
          if (entryInfo.name.includes('games/')) {
            return 'games/[name].js';
          }
          return 'js/[name].js';
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/, /js/],
      transformMixedEsModules: true
    },
    brotliSize: false,
  },
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    host: true,
    hmr: {
      overlay: false,
    }
  },
  preview: {
    port: 8080,
    host: true
  },
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
      '@styles': './src/styles',
      '@games': './src/games'
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'vue'],
  },
  define: {
    global: 'globalThis',
  },
  experimental: {
    renderBuiltUrl(filename, { type }) {
      if (type === 'asset') {
        return `./${filename}`;
      }
      return { relative: true };
    }
  }
});