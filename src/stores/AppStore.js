import { defineStore } from 'pinia';

// 应用状态管理
export const useAppStore = defineStore('app', {
  state: () => ({
    connectionStatus: 'unknown', // unknown, online, offline
    isMobile: false,
    isMenuOpen: false,
    currentPage: 'home',
    loading: false,
    error: null
  }),
  getters: {
    isOnline: (state) => state.connectionStatus === 'online',
    isOffline: (state) => state.connectionStatus === 'offline',
    connectionStatusText: (state) => {
      const statusMap = {
        unknown: '未知',
        online: '在线',
        offline: '离线'
      };
      return statusMap[state.connectionStatus] || '未知';
    },
    connectionStatusColor: (state) => {
      const colorMap = {
        unknown: 'gray',
        online: 'green',
        offline: 'red'
      };
      return colorMap[state.connectionStatus] || 'gray';
    },
    isMenuActive: (state) => state.isMenuOpen,
    currentPageName: (state) => state.currentPage,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error
  },
  actions: {
    // 初始化应用
    initApp() {
      this.detectMobile();
      this.checkConnectionStatus();
    },

    // 检测是否为移动端
    detectMobile() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    },

    // 检查连接状态
    checkConnectionStatus() {
      if (navigator.onLine) {
        this.updateConnectionStatus('online');
      } else {
        this.updateConnectionStatus('offline');
      }
    },

    // 更新连接状态
    updateConnectionStatus(status) {
      this.connectionStatus = status;
    },

    // 切换菜单状态
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    // 打开菜单
    openMenu() {
      this.isMenuOpen = true;
    },

    // 关闭菜单
    closeMenu() {
      this.isMenuOpen = false;
    },

    // 设置当前页面
    setCurrentPage(page) {
      this.currentPage = page;
      // 切换页面时关闭菜单
      this.closeMenu();
    },

    // 设置加载状态
    setLoading(loading) {
      this.loading = loading;
    },

    // 设置错误信息
    setError(error) {
      this.error = error;
    },

    // 清除错误信息
    clearError() {
      this.error = null;
    },

    // 监听网络状态变化
    startNetworkMonitoring() {
      window.addEventListener('online', () => {
        this.updateConnectionStatus('online');
      });

      window.addEventListener('offline', () => {
        this.updateConnectionStatus('offline');
      });
    },

    // 监听窗口大小变化
    startResizeMonitoring() {
      window.addEventListener('resize', () => {
        this.detectMobile();
        // 窗口大小变化时，如果是桌面端，关闭菜单
        if (!this.isMobile) {
          this.closeMenu();
        }
      });
    }
  }
});
