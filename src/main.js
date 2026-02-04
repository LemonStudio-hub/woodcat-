/**
 * 木头猫游戏合集 - Vue应用入口
 * 负责创建和挂载Vue应用实例
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

/**
 * 全局错误处理器
 * @param {Error} error - 错误对象
 */
const handleError = (error) => {
  console.error('Vue应用错误:', error);
  // 可以在这里添加错误上报逻辑
  // 例如发送到 Sentry 或其他错误追踪服务
};

try {
  // 创建Vue应用实例
  const app = createApp(App);
  const pinia = createPinia();

  // 配置全局错误处理器
  app.config.errorHandler = (err, instance, info) => {
    handleError(err);
  };

  // 使用Pinia状态管理
  app.use(pinia);

  // 挂载应用到DOM
  app.mount('#app');

  console.log('🐱 木头猫游戏合集 - Vue应用已启动');
} catch (error) {
  handleError(error);
  // 在页面上显示错误信息
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #e74c3c;">
        <h2>应用启动失败</h2>
        <p>抱歉，应用启动时发生错误。请刷新页面重试。</p>
        <p style="color: #7f8c8d; font-size: 0.9em;">错误信息: ${error.message}</p>
      </div>
    `;
  }
}