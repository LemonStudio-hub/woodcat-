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
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
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
        'spider-solitaire': './games/spider-solitaire.html',
        'tank-battle': './games/tank-battle.html',
        'tank-battle-phaser': './games/tank-battle-phaser/index.html',
      },
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('vue')) {
              return 'vendor-vue';
            }
            if (id.includes('phaser')) {
              return 'vendor-phaser';
            }
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash:8].[ext]';
          }
          if (assetInfo.name.endsWith('.js')) {
            return 'js/[name].[hash:8].[ext]';
          }
          return 'assets/[name].[hash:8].[ext]';
        },
        entryFileNames: (entryInfo) => {
          // 检查是否是游戏入口
          const gameEntries = ['tetris', 'snake', 'minesweeper', '2048', 'chess', 'checkers', 'tic-tac-toe', 'memory-card', 'arkanoid', 'spider-solitaire', 'tank-battle', 'tank-battle-phaser'];
          if (gameEntries.includes(entryInfo.name)) {
            return 'games/[name].[hash:8].js';
          }
          return 'js/[name].[hash:8].js';
        },
        chunkFileNames: 'js/[name].[hash:8].js',
      }
    },
    commonjsOptions: {
      include: [/node_modules/, /js/],
      transformMixedEsModules: true
    },
    brotliSize: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
    strictPort: false,
    host: true,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
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
    include: ['@supabase/supabase-js', 'vue', 'phaser'],
    exclude: []
  },
  define: {
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
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