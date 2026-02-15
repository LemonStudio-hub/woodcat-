/**
 * 木头猫游戏合集 - API客户端
 * 提供统一的API请求管理、缓存、重试等功能
 */

const ApiClient = {
  // 配置
  config: {
    baseURL: '/api',
    timeout: 10000,
    retries: 3,
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5分钟
      maxSize: 100
    }
  },

  // 缓存存储
  cache: new Map(),

  // 请求拦截器
  interceptors: {
    request: [],
    response: [],
    error: []
  },

  /**
   * 初始化API客户端
   */
  init(config = {}) {
    this.config = { ...this.config, ...config };
    this.setupCacheCleanup();
    console.log('[ApiClient] Initialized with config:', this.config);
  },

  /**
   * 发送API请求
   * @param {Object} config - 请求配置
   * @returns {Promise} 响应数据
   */
  async request(config) {
    const requestConfig = this.normalizeConfig(config);
    
    // 请求拦截
    for (const interceptor of this.interceptors.request) {
      await interceptor(requestConfig);
    }

    // 检查缓存
    if (requestConfig.method === 'GET' && this.config.cache.enabled) {
      const cached = this.getFromCache(requestConfig);
      if (cached) {
        console.log('[ApiClient] Serving from cache:', requestConfig.url);
        return cached;
      }
    }

    // 发送请求
    let response;
    let attempt = 0;
    
    while (attempt < this.config.retries) {
      try {
        response = await this.fetchWithTimeout(requestConfig);
        break;
      } catch (error) {
        attempt++;
        if (attempt >= this.config.retries) {
          throw this.handleError(error, requestConfig);
        }
        console.warn(`[ApiClient] Request failed, retrying (${attempt}/${this.config.retries}):`, error);
        await this.delay(1000 * attempt); // 指数退避
      }
    }

    // 响应拦截
    for (const interceptor of this.interceptors.response) {
      await interceptor(response);
    }

    // 缓存GET请求
    if (requestConfig.method === 'GET' && this.config.cache.enabled && response.success) {
      this.setToCache(requestConfig, response);
    }

    return response;
  },

  /**
   * GET请求
   */
  async get(url, params = {}) {
    return this.request({
      method: 'GET',
      url: this.buildURL(url, params)
    });
  },

  /**
   * POST请求
   */
  async post(url, body = {}) {
    return this.request({
      method: 'POST',
      url: this.buildURL(url),
      body
    });
  },

  /**
   * PUT请求
   */
  async put(url, body = {}) {
    return this.request({
      method: 'PUT',
      url: this.buildURL(url),
      body
    });
  },

  /**
   * DELETE请求
   */
  async delete(url) {
    return this.request({
      method: 'DELETE',
      url: this.buildURL(url)
    });
  },

  /**
   * PATCH请求
   */
  async patch(url, body = {}) {
    return this.request({
      method: 'PATCH',
      url: this.buildURL(url),
      body
    });
  },

  /**
   * 标准化请求配置
   */
  normalizeConfig(config) {
    return {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      ...config
    };
  },

  /**
   * 构建完整URL
   */
  buildURL(path, params = {}) {
    const url = new URL(path, this.config.baseURL);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.toString();
  },

  /**
   * 带超时的fetch
   */
  async fetchWithTimeout(config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.config.timeout);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        meta: {
          timestamp: Date.now(),
          requestId: this.generateRequestId()
        }
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  /**
   * 处理错误
   */
  handleError(error, config) {
    console.error('[ApiClient] Request failed:', error, config);

    // 错误拦截
    for (const interceptor of this.interceptors.error) {
      interceptor(error, config);
    }

    const apiError = {
      code: 'REQUEST_FAILED',
      message: error.message,
      details: {
        url: config.url,
        method: config.method,
        originalError: error
      }
    };

    return {
      success: false,
      error: apiError
    };
  },

  /**
   * 从缓存获取
   */
  getFromCache(config) {
    const cacheKey = this.getCacheKey(config);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.config.cache.ttl) {
      return cached.data;
    }

    this.cache.delete(cacheKey);
    return null;
  },

  /**
   * 设置缓存
   */
  setToCache(config, data) {
    const cacheKey = this.getCacheKey(config);
    
    // 限制缓存大小
    if (this.cache.size >= this.config.cache.maxSize) {
      // 删除最旧的缓存
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  },

  /**
   * 获取缓存键
   */
  getCacheKey(config) {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  },

  /**
   * 清理过期缓存
   */
  setupCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.config.cache.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000); // 每分钟清理一次
  },

  /**
   * 清除所有缓存
   */
  clearCache() {
    this.cache.clear();
    console.log('[ApiClient] Cache cleared');
  },

  /**
   * 添加请求拦截器
   */
  useRequest(interceptor) {
    this.interceptors.request.push(interceptor);
  },

  /**
   * 添加响应拦截器
   */
  useResponse(interceptor) {
    this.interceptors.response.push(interceptor);
  },

  /**
   * 添加错误拦截器
   */
  useError(interceptor) {
    this.interceptors.error.push(interceptor);
  },

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 生成请求ID
   */
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// 游戏API
const GameAPI = {
  /**
   * 获取游戏列表
   */
  async getGames() {
    return ApiClient.get('/games');
  },

  /**
   * 获取游戏详情
   */
  async getGameDetails(gameId) {
    return ApiClient.get(`/games/${gameId}`);
  },

  /**
   * 提交分数
   */
  async submitScore(data) {
    return ApiClient.post('/scores', data);
  },

  /**
   * 获取排行榜
   */
  async getLeaderboard(gameId, params = {}) {
    return ApiClient.get(`/leaderboard/${gameId}`, params);
  },

  /**
   * 保存游戏进度
   */
  async saveGame(data) {
    return ApiClient.post('/saves', data);
  },

  /**
   * 加载游戏进度
   */
  async loadGame(saveId) {
    return ApiClient.get(`/saves/${saveId}`);
  },

  /**
   * 获取存档列表
   */
  async getSaves(gameId) {
    return ApiClient.get(`/saves`, { gameId });
  },

  /**
   * 删除存档
   */
  async deleteSave(saveId) {
    return ApiClient.delete(`/saves/${saveId}`);
  },

  /**
   * 获取成就
   */
  async getAchievements(gameId) {
    return ApiClient.get(`/achievements/${gameId}`);
  },

  /**
   * 更新成就进度
   */
  async updateAchievementProgress(data) {
    return ApiClient.post('/achievements/progress', data);
  }
};

// 用户API
const UserAPI = {
  /**
   * 用户登录
   */
  async login(credentials) {
    return ApiClient.post('/auth/login', credentials);
  },

  /**
   * 用户注册
   */
  async register(userData) {
    return ApiClient.post('/auth/register', userData);
  },

  /**
   * 用户登出
   */
  async logout() {
    return ApiClient.post('/auth/logout');
  },

  /**
   * 获取用户资料
   */
  async getProfile() {
    return ApiClient.get('/user/profile');
  },

  /**
   * 更新用户资料
   */
  async updateProfile(data) {
    return ApiClient.put('/user/profile', data);
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    return ApiClient.request({
      method: 'POST',
      url: ApiClient.buildURL('/user/avatar'),
      headers: {}, // 让浏览器自动设置Content-Type
      body: formData
    });
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
  window.GameAPI = GameAPI;
  window.UserAPI = UserAPI;
  
  // 初始化
  ApiClient.init();
}

// 导出模块
export { ApiClient, GameAPI, UserAPI };