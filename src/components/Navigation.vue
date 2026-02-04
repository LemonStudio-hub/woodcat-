<template>
  <nav class="nav" :class="{ 'mobile-open': isOpen }">
    <ul>
      <li>
        <a href="#" class="nav-link" :class="{ active: currentPage === 'home' }" @click="navigateTo('home')">首页</a>
      </li>
      <li>
        <a href="#games" class="nav-link" :class="{ active: currentPage === 'games' }" @click="navigateTo('games')">游戏</a>
      </li>
      <li>
        <a href="#leaderboard" class="nav-link" :class="{ active: currentPage === 'leaderboard' }" @click="navigateTo('leaderboard')">排行榜</a>
      </li>
      <!-- 移动端反馈菜单项 -->
      <li v-if="isMobile" class="feedback-menu-item">
        <a href="feedback.html" class="nav-link">反馈与支持</a>
      </li>
      <!-- 连接状态显示 -->
      <li v-if="isMobile" class="connection-status-item">
        <div class="connection-status">
          <span>连接状态: </span>
          <span :class="['status-indicator', connectionStatus]" :style="{ color: connectionStatusColor }">{{ connectionStatusText }}</span>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '../stores/AppStore';

const appStore = useAppStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close-menu']);

// 计算属性
const currentPage = computed(() => appStore.currentPage);
const isMobile = computed(() => appStore.isMobile);
const connectionStatus = computed(() => appStore.connectionStatus);
const connectionStatusText = computed(() => appStore.connectionStatusText);
const connectionStatusColor = computed(() => appStore.connectionStatusColor);

// 方法
const navigateTo = (page) => {
  appStore.setCurrentPage(page);
  appStore.closeMenu();
  emit('close-menu');
};
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
}

.nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.nav li {
  position: relative;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
  padding: 5px 0;
  display: block;
}

.nav-link:hover,
.nav-link.active {
  color: #3498db;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3498db;
}

.connection-status-item {
  margin-left: 20px;
}

.connection-status {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.status-indicator {
  font-weight: 500;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    z-index: 999;
    display: none;
    animation: slideDown 0.3s ease;
  }

  .nav.mobile-open {
    display: block;
  }

  .nav ul {
    flex-direction: column;
    padding: 20px 0;
    gap: 0;
  }

  .nav li {
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav li:last-child {
    border-bottom: none;
  }

  .nav-link {
    padding: 15px 0;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }

  .nav-link:hover {
    background-color: #f8f9fa;
  }

  .feedback-menu-item {
    border-top: 1px solid #e9ecef;
    margin-top: 10px;
  }

  .connection-status-item {
    border-top: 1px solid #e9ecef;
    margin-top: 10px;
    padding: 15px 0;
  }

  .connection-status {
    font-size: 1rem;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@media (min-width: 769px) {
  .feedback-menu-item,
  .connection-status-item {
    display: none;
  }
}
</style>