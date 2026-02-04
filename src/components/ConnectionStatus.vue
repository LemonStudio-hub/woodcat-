<template>
  <div class="connection-status" :class="[statusClass]">
    <div class="status-indicator">
      <span class="status-dot" :class="[connectionStatus]"></span>
      <span class="status-text">{{ connectionStatusText }}</span>
    </div>
    <div class="status-details" v-if="showDetails">
      <p class="connection-type">{{ connectionType }}</p>
      <p class="last-updated">{{ lastUpdated }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAppStore } from '../stores/AppStore';

const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const appStore = useAppStore();

const connectionStatus = ref('online');
const connectionType = ref('未知');
const lastUpdated = ref('');

// 计算属性
const statusClass = computed(() => {
  return {
    'compact': props.compact,
    'online': connectionStatus.value === 'online',
    'offline': connectionStatus.value === 'offline',
    'connecting': connectionStatus.value === 'connecting'
  };
});

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'online':
      return '在线';
    case 'offline':
      return '离线';
    case 'connecting':
      return '连接中...';
    default:
      return '未知';
  }
});

// 方法
const updateConnectionStatus = () => {
  const online = navigator.onLine;
  connectionStatus.value = online ? 'online' : 'offline';
  updateConnectionType();
  updateLastUpdated();
  // 更新AppStore中的状态
  appStore.setConnectionStatus(online ? 'online' : 'offline');
};

const updateConnectionType = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connectionType.value = connection.type || '未知';
    }
  } else {
    connectionType.value = '未知';
  }
};

const updateLastUpdated = () => {
  const now = new Date();
  lastUpdated.value = `最后更新: ${now.toLocaleTimeString()}`;
};

// 监听网络状态变化
const handleOnline = () => {
  connectionStatus.value = 'online';
  updateConnectionType();
  updateLastUpdated();
  appStore.setConnectionStatus('online');
};

const handleOffline = () => {
  connectionStatus.value = 'offline';
  updateLastUpdated();
  appStore.setConnectionStatus('offline');
};

// 生命周期
onMounted(() => {
  // 初始化连接状态
  updateConnectionStatus();
  // 添加事件监听器
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  // 定期检查连接状态
  setInterval(updateConnectionStatus, 30000); // 每30秒检查一次
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.connection-status.compact {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.connection-status.online {
  background: rgba(46, 204, 113, 0.1);
  border-color: rgba(46, 204, 113, 0.3);
}

.connection-status.offline {
  background: rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.3);
}

.connection-status.connecting {
  background: rgba(241, 196, 15, 0.1);
  border-color: rgba(241, 196, 15, 0.3);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background: #2ecc71;
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.3);
}

.status-dot.offline {
  background: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
  animation: none;
}

.status-dot.connecting {
  background: #f1c40f;
  box-shadow: 0 0 0 2px rgba(241, 196, 15, 0.3);
  animation: pulse 1s infinite;
}

.status-text {
  font-weight: 500;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.connection-status.offline .status-text {
  color: #e74c3c;
}

.connection-status.connecting .status-text {
  color: #f1c40f;
}

.status-details {
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid #e9ecef;
  font-size: 0.8rem;
  color: #7f8c8d;
  line-height: 1.3;
}

.connection-type {
  margin: 0;
}

.last-updated {
  margin: 2px 0 0 0;
  font-size: 0.7rem;
}

/* 动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .connection-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px;
  }

  .status-indicator {
    width: 100%;
    justify-content: space-between;
  }

  .status-details {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #e9ecef;
    padding-top: 6px;
    width: 100%;
  }

  .connection-status.compact {
    flex-direction: row;
    align-items: center;
    padding: 6px 10px;
  }

  .connection-status.compact .status-details {
    display: none;
  }
}
</style>