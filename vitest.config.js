import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'build/',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/types/**',
        '**/*.d.ts'
      ],
      include: [
        'js/**/*.{js,ts}',
        'src/**/*.{js,ts,vue}',
        'games/**/*.{js,ts,vue}'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      },
      all: true,
      cleanOnRerun: true
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,vue}'],
    exclude: ['node_modules', 'dist', 'build', '.git', '.github']
  }
});