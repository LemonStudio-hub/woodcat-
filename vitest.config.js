import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom', // 使用happy-dom模拟浏览器环境
    globals: true, // 启用全局API
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
