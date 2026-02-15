/**
 * 木头猫游戏合集 - 游戏加载优化模块
 * 提供游戏懒加载、预加载、资源管理等功能
 */

const GameLoader = {
  // 游戏配置
  games: {
    tetris: {
      name: '俄罗斯方块',
      path: '/games/tetris.html',
      priority: 'high',
      preload: true,
      size: 50
    },
    snake: {
      name: '贪吃蛇',
      path: '/games/snake.html',
      priority: 'medium',
      preload: false,
      size: 30
    },
    minesweeper: {
      name: '扫雷',
      path: '/games/minesweeper.html',
      priority: 'low',
      preload: false,
      size: 20
    },
    '2048': {
      name: '2048',
      path: '/games/2048.html',
      priority: 'medium',
      preload: false,
      size: 40
    },
    chess: {
      name: '国际象棋',
      path: '/games/chess.html',
      priority: 'low',
      preload: false,
      size: 60
    },
    checkers: {
      name: '西洋跳棋',
      path: '/games/checkers.html',
      priority: 'low',
      preload: false,
      size: 45
    },
    'tic-tac-toe': {
      name: '井字棋',
      path: '/games/tic-tac-toe.html',
      priority: 'low',
      preload: false,
      size: 15
    },
    'memory-card': {
      name: '记忆卡片',
      path: '/games/memory-card.html',
      priority: 'low',
      preload: false,
      size: 25
    },
    arkanoid: {
      name: '打砖块',
      path: '/games/arkanoid.html',
      priority: 'medium',
      preload: false,
      size: 35
    },
    'spider-solitaire': {
      name: '蜘蛛纸牌',
      path: '/games/spider-solitaire.html',
      priority: 'low',
      preload: false,
      size: 40
    },
    'tank-battle': {
      name: '坦克大战',
      path: '/games/tank-battle.html',
      priority: 'medium',
      preload: false,
      size: 55
    },
    'tank-battle-phaser': {
      name: '坦克大战Phaser版',
      path: '/games/tank-battle-phaser/index.html',
      priority: 'high',
      preload: false,
      size: 120
    }
  },

  // 加载状态
  loadingState: {
    loaded: new Set(),
    loading: new Set(),
    failed: new Set()
  },

  // 加载队列
  loadQueue: [],

  /**
   * 初始化游戏加载器
   */
  init() {
    console.log('[GameLoader] Initializing...');
    this.registerServiceWorker();
    this.preloadHighPriorityGames();
    this.setupVisibilityObserver();
    this.setupNetworkListener();
  },

  /**
   * 注册Service Worker
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker-optimized.js')
        .then((registration) => {
          console.log('[GameLoader] Service Worker registered:', registration.scope);
          
          // 监听更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[GameLoader] New Service Worker available');
                this.notifyUpdate();
              }
            });
          });
        })
        .catch((error) => {
          console.error('[GameLoader] Service Worker registration failed:', error);
        });
    }
  },

  /**
   * 预加载高优先级游戏
   */
  preloadHighPriorityGames() {
    const highPriorityGames = Object.entries(this.games)
      .filter(([_, config]) => config.priority === 'high' && config.preload)
      .map(([id, config]) => ({ id, ...config }));

    // 延迟预加载，避免阻塞页面加载
    setTimeout(() => {
      highPriorityGames.forEach(game => {
        this.preloadGame(game.id);
      });
    }, 2000);
  },

  /**
   * 预加载游戏
   * @param {string} gameId - 游戏ID
   */
  preloadGame(gameId) {
    const game = this.games[gameId];
    if (!game || this.loadingState.loaded.has(gameId) || this.loadingState.loading.has(gameId)) {
      return;
    }

    console.log('[GameLoader] Preloading game:', gameId);
    this.loadingState.loading.add(gameId);

    // 使用fetch预加载
    fetch(game.path, { mode: 'no-cors' })
      .then(() => {
        this.loadingState.loaded.add(gameId);
        this.loadingState.loading.delete(gameId);
        console.log('[GameLoader] Game preloaded:', gameId);
      })
      .catch((error) => {
        this.loadingState.loading.delete(gameId);
        this.loadingState.failed.add(gameId);
        console.error('[GameLoader] Preload failed:', gameId, error);
      });
  },

  /**
   * 加载游戏
   * @param {string} gameId - 游戏ID
   * @returns {Promise<boolean>} 加载是否成功
   */
  loadGame(gameId) {
    return new Promise((resolve, reject) => {
      const game = this.games[gameId];
      if (!game) {
        reject(new Error(`Game not found: ${gameId}`));
        return;
      }

      // 如果已经加载过，直接返回
      if (this.loadingState.loaded.has(gameId)) {
        this.navigateToGame(game.path);
        resolve(true);
        return;
      }

      // 显示加载进度
      this.showLoadingProgress(game.name, game.size);

      // 添加到加载队列
      this.loadQueue.push({
        gameId,
        priority: game.priority,
        size: game.size
      });

      // 处理加载队列
      this.processLoadQueue()
        .then(() => {
          this.loadingState.loaded.add(gameId);
          this.hideLoadingProgress();
          this.navigateToGame(game.path);
          resolve(true);
        })
        .catch((error) => {
          this.loadingState.failed.add(gameId);
          this.hideLoadingProgress();
          this.showLoadError(game.name, error);
          reject(error);
        });
    });
  },

  /**
   * 处理加载队列
   * @returns {Promise<void>}
   */
  async processLoadQueue() {
    if (this.loadQueue.length === 0) return;

    // 按优先级排序
    this.loadQueue.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const item = this.loadQueue.shift();
    const game = this.games[item.gameId];

    console.log('[GameLoader] Loading game:', item.gameId);
    this.loadingState.loading.add(item.gameId);

    // 模拟加载进度
    await this.simulateLoading(game.size);

    // 预加载游戏资源
    await this.preloadGameResources(game);

    this.loadingState.loading.delete(item.gameId);
  },

  /**
   * 预加载游戏资源
   * @param {Object} game - 游戏配置
   * @returns {Promise<void>}
   */
  async preloadGameResources(game) {
    const resources = this.getGameResources(game.path);
    const promises = resources.map(resource => {
      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        link.as = 'script';
        link.onload = resolve;
        link.onerror = resolve;
        document.head.appendChild(link);
      });
    });

    await Promise.all(promises);
  },

  /**
   * 获取游戏资源列表
   * @param {string} gamePath - 游戏路径
   * @returns {Array<string>} 资源路径列表
   */
  getGameResources(gamePath) {
    const basePath = gamePath.replace(/\.html$/, '');
    return [
      `${basePath}.js`,
      `${basePath}.css`,
      '/css/style.css',
      '/js/main.js'
    ];
  },

  /**
   * 模拟加载进度
   * @param {number} size - 游戏大小（KB）
   * @returns {Promise<void>}
   */
  async simulateLoading(size) {
    const duration = Math.min(size * 10, 3000); // 最多3秒
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      this.updateLoadingProgress((i / steps) * 100);
    }
  },

  /**
   * 导航到游戏页面
   * @param {string} gamePath - 游戏路径
   */
  navigateToGame(gamePath) {
    // 使用pushState保持SPA体验
    window.history.pushState({ game: gamePath }, '', gamePath);
    window.location.href = gamePath;
  },

  /**
   * 显示加载进度
   * @param {string} gameName - 游戏名称
   * @param {number} size - 游戏大小
   */
  showLoadingProgress(gameName, size) {
    let modal = document.getElementById('game-loading-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'game-loading-modal';
      modal.innerHTML = `
        <div class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <h3 class="loading-title">正在加载游戏</h3>
            <p class="loading-game-name">${gameName}</p>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill" id="loading-progress-fill"></div>
              </div>
              <span class="progress-text" id="loading-progress-text">0%</span>
            </div>
            <p class="loading-size">大小: ${size} KB</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        #game-loading-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
        }
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto 20px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .loading-game-name {
          font-size: 16px;
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        .loading-progress {
          margin-bottom: 10px;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #ecf0f1;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3498db, #2ecc71);
          width: 0%;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 14px;
          color: #7f8c8d;
        }
        .loading-size {
          font-size: 12px;
          color: #95a5a6;
        }
      `;
      document.head.appendChild(style);
    } else {
      modal.querySelector('.loading-game-name').textContent = gameName;
      modal.querySelector('.loading-size').textContent = `大小: ${size} KB`;
    }
  },

  /**
   * 更新加载进度
   * @param {number} progress - 进度百分比
   */
  updateLoadingProgress(progress) {
    const fill = document.getElementById('loading-progress-fill');
    const text = document.getElementById('loading-progress-text');
    
    if (fill) fill.style.width = `${progress}%`;
    if (text) text.textContent = `${Math.round(progress)}%`;
  },

  /**
   * 隐藏加载进度
   */
  hideLoadingProgress() {
    const modal = document.getElementById('game-loading-modal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 显示加载错误
   * @param {string} gameName - 游戏名称
   * @param {Error} error - 错误对象
   */
  showLoadError(gameName, error) {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.innerHTML = `
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h3>加载失败</h3>
        <p>无法加载游戏: ${gameName}</p>
        <p class="error-message">${error.message}</p>
        <button class="retry-button" onclick="this.closest('.error-modal').remove()">关闭</button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  /**
   * 设置可见性观察器
   */
  setupVisibilityObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const gameId = entry.target.dataset.game;
            if (gameId) {
              this.preloadGame(gameId);
              observer.unobserve(entry.target);
            }
          }
        });
      }, {
        rootMargin: '100px'
      });

      // 观察游戏卡片
      document.querySelectorAll('[data-game]').forEach(card => {
        observer.observe(card);
      });
    }
  },

  /**
   * 设置网络监听器
   */
  setupNetworkListener() {
    window.addEventListener('online', () => {
      console.log('[GameLoader] Network online');
      this.retryFailedLoads();
    });

    window.addEventListener('offline', () => {
      console.log('[GameLoader] Network offline');
    });
  },

  /**
   * 重试失败的加载
   */
  retryFailedLoads() {
    this.loadingState.failed.forEach(gameId => {
      this.loadingState.failed.delete(gameId);
      this.preloadGame(gameId);
    });
  },

  /**
   * 通知有更新
   */
  notifyUpdate() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <span>有新版本可用，点击刷新</span>
      <button onclick="location.reload()">刷新</button>
    `;
    document.body.appendChild(notification);
    
    // 3秒后自动隐藏
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },

  /**
   * 获取加载统计
   * @returns {Object} 加载统计信息
   */
  getStats() {
    return {
      loaded: this.loadingState.loaded.size,
      loading: this.loadingState.loading.size,
      failed: this.loadingState.failed.size,
      total: Object.keys(this.games).length
    };
  },

  /**
   * 清除所有缓存
   * @returns {Promise<void>}
   */
  async clearCache() {
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[GameLoader] Cache cleared');
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.GameLoader = GameLoader;
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GameLoader.init());
  } else {
    GameLoader.init();
  }
}

// 导出模块
export default GameLoader;