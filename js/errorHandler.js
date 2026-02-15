/**
 * 木头猫游戏合集 - 错误处理和日志系统
 * 提供统一的错误处理、日志记录和性能监控
 */

const ErrorHandler = {
  // 配置
  config: {
    enableLogging: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    logLevel: 'info', // debug, info, warn, error
    maxLogEntries: 100,
    maxErrorEntries: 50,
    apiEndpoint: '/api/logs',
    environment: process.env.NODE_ENV || 'production'
  },

  // 日志存储
  logs: [],
  errors: [],
  metrics: [],

  // 初始化
  init() {
    console.log('[ErrorHandler] Initializing...');
    this.setupGlobalErrorHandlers();
    this.setupPerformanceMonitoring();
    this.setupUnhandledRejectionHandler();
    this.startPeriodicCleanup();
    this.loadPersistedLogs();
  },

  /**
   * 设置全局错误处理器
   */
  setupGlobalErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.handleGlobalError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        error: event.error
      });
    });

    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleResourceError({
          type: 'resource',
          target: event.target,
          message: `Failed to load resource: ${event.target.src || event.target.href}`
        });
      }
    }, true);
  },

  /**
   * 设置性能监控
   */
  setupPerformanceMonitoring() {
    if (!this.config.enablePerformanceMonitoring) return;

    // 监控页面加载性能
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.recordPerformanceMetrics();
        }, 0);
      });
    }

    // 监控长任务
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.log('warn', `Long task detected: ${entry.duration}ms`, {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('[ErrorHandler] Long task monitoring not supported');
      }
    }
  },

  /**
   * 设置未处理的Promise拒绝处理器
   */
  setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection({
        type: 'unhandledrejection',
        reason: event.reason,
        promise: event.promise
      });
    });
  },

  /**
   * 处理全局错误
   * @param {Object} errorInfo - 错误信息
   */
  handleGlobalError(errorInfo) {
    const error = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    this.errors.push(error);
    this.log('error', errorInfo.message, errorInfo);

    // 发送到服务器
    if (this.config.enableErrorTracking) {
      this.sendErrorToServer(error);
    }

    // 保存到本地存储
    this.persistErrors();

    // 限制错误数量
    if (this.errors.length > this.config.maxErrorEntries) {
      this.errors.shift();
    }
  },

  /**
   * 处理资源加载错误
   * @param {Object} errorInfo - 错误信息
   */
  handleResourceError(errorInfo) {
    this.log('error', errorInfo.message, errorInfo);
  },

  /**
   * 处理未处理的Promise拒绝
   * @param {Object} errorInfo - 错误信息
   */
  handleUnhandledRejection(errorInfo) {
    this.handleGlobalError({
      type: 'unhandledrejection',
      message: errorInfo.reason?.message || String(errorInfo.reason),
      stack: errorInfo.reason?.stack,
      reason: errorInfo.reason
    });
  },

  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  log(level, message, data = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      message,
      data,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    this.logs.push(logEntry);

    // 控制台输出
    this.logToConsole(level, message, data);

    // 发送到服务器
    if (this.config.enableErrorTracking && level === 'error') {
      this.sendLogToServer(logEntry);
    }

    // 保存到本地存储
    this.persistLogs();

    // 限制日志数量
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs.shift();
    }
  },

  /**
   * 检查是否应该记录日志
   * @param {string} level - 日志级别
   * @returns {boolean}
   */
  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevel;
  },

  /**
   * 输出到控制台
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  logToConsole(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  },

  /**
   * 调试日志
   * @param {string} message - 消息
   * @param {Object} data - 数据
   */
  debug(message, data) {
    this.log('debug', message, data);
  },

  /**
   * 信息日志
   * @param {string} message - 消息
   * @param {Object} data - 数据
   */
  info(message, data) {
    this.log('info', message, data);
  },

  /**
   * 警告日志
   * @param {string} message - 消息
   * @param {Object} data - 数据
   */
  warn(message, data) {
    this.log('warn', message, data);
  },

  /**
   * 错误日志
   * @param {string} message - 消息
   * @param {Object} data - 数据
   */
  error(message, data) {
    this.log('error', message, data);
  },

  /**
   * 记录性能指标
   */
  recordPerformanceMetrics() {
    const timing = performance.timing;
    const metrics = {
      id: this.generateId(),
      timestamp: Date.now(),
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domProcessing: timing.domComplete - timing.domLoading,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      totalLoadTime: timing.loadEventEnd - timing.navigationStart,
      url: window.location.href
    };

    this.metrics.push(metrics);
    this.log('info', 'Performance metrics recorded', metrics);

    // 检查性能问题
    this.checkPerformanceIssues(metrics);
  },

  /**
   * 检查性能问题
   * @param {Object} metrics - 性能指标
   */
  checkPerformanceIssues(metrics) {
    const issues = [];

    if (metrics.totalLoadTime > 5000) {
      issues.push({
        type: 'slow_load',
        message: `页面加载时间过长: ${metrics.totalLoadTime}ms`,
        threshold: 5000,
        actual: metrics.totalLoadTime
      });
    }

    if (metrics.ttfb > 1000) {
      issues.push({
        type: 'slow_ttfb',
        message: `服务器响应时间过长: ${metrics.ttfb}ms`,
        threshold: 1000,
        actual: metrics.ttfb
      });
    }

    if (metrics.domProcessing > 1000) {
      issues.push({
        type: 'slow_dom',
        message: `DOM处理时间过长: ${metrics.domProcessing}ms`,
        threshold: 1000,
        actual: metrics.domProcessing
      });
    }

    if (issues.length > 0) {
      this.log('warn', 'Performance issues detected', { issues });
    }
  },

  /**
   * 发送错误到服务器
   * @param {Object} error - 错误对象
   */
  async sendErrorToServer(error) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      });

      if (!response.ok) {
        throw new Error('Failed to send error to server');
      }
    } catch (e) {
      console.warn('[ErrorHandler] Failed to send error to server:', e);
    }
  },

  /**
   * 发送日志到服务器
   * @param {Object} log - 日志对象
   */
  async sendLogToServer(log) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      });

      if (!response.ok) {
        throw new Error('Failed to send log to server');
      }
    } catch (e) {
      console.warn('[ErrorHandler] Failed to send log to server:', e);
    }
  },

  /**
   * 保存日志到本地存储
   */
  persistLogs() {
    try {
      const recentLogs = this.logs.slice(-50); // 只保存最近50条
      localStorage.setItem('woodcat_logs', JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('[ErrorHandler] Failed to persist logs:', e);
    }
  },

  /**
   * 保存错误到本地存储
   */
  persistErrors() {
    try {
      const recentErrors = this.errors.slice(-20); // 只保存最近20条
      localStorage.setItem('woodcat_errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('[ErrorHandler] Failed to persist errors:', e);
    }
  },

  /**
   * 加载持久化的日志
   */
  loadPersistedLogs() {
    try {
      const savedLogs = localStorage.getItem('woodcat_logs');
      const savedErrors = localStorage.getItem('woodcat_errors');

      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }

      if (savedErrors) {
        this.errors = JSON.parse(savedErrors);
      }

      this.log('info', 'Persisted logs loaded', {
        logsCount: this.logs.length,
        errorsCount: this.errors.length
      });
    } catch (e) {
      console.warn('[ErrorHandler] Failed to load persisted logs:', e);
    }
  },

  /**
   * 开始定期清理
   */
  startPeriodicCleanup() {
    // 每小时清理一次旧日志
    setInterval(() => {
      this.cleanupOldLogs();
    }, 60 * 60 * 1000);
  },

  /**
   * 清理旧日志
   */
  cleanupOldLogs() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    this.logs = this.logs.filter(log => log.timestamp > oneHourAgo);
    this.errors = this.errors.filter(error => error.timestamp > oneHourAgo);
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);

    this.persistLogs();
    this.persistErrors();

    this.log('info', 'Old logs cleaned up', {
      remainingLogs: this.logs.length,
      remainingErrors: this.errors.length
    });
  },

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return {
      logs: {
        total: this.logs.length,
        lastHour: this.logs.filter(l => l.timestamp > oneHourAgo).length,
        lastDay: this.logs.filter(l => l.timestamp > oneDayAgo).length,
        byLevel: this.getLogCountsByLevel()
      },
      errors: {
        total: this.errors.length,
        lastHour: this.errors.filter(e => e.timestamp > oneHourAgo).length,
        lastDay: this.errors.filter(e => e.timestamp > oneDayAgo).length,
        byType: this.getErrorCountsByType()
      },
      metrics: {
        total: this.metrics.length,
        lastHour: this.metrics.filter(m => m.timestamp > oneHourAgo).length
      }
    };
  },

  /**
   * 获取按级别分组的日志数量
   * @returns {Object}
   */
  getLogCountsByLevel() {
    return this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * 获取按类型分组的错误数量
   * @returns {Object}
   */
  getErrorCountsByType() {
    return this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * 导出日志
   * @param {number} limit - 限制数量
   * @returns {Array} 日志数组
   */
  exportLogs(limit = 100) {
    return this.logs.slice(-limit);
  },

  /**
   * 导出错误
   * @param {number} limit - 限制数量
   * @returns {Array} 错误数组
   */
  exportErrors(limit = 50) {
    return this.errors.slice(-limit);
  },

  /**
   * 清除所有日志
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('woodcat_logs');
    this.log('info', 'All logs cleared');
  },

  /**
   * 清除所有错误
   */
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('woodcat_errors');
    this.log('info', 'All errors cleared');
  },

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 获取会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('woodcat_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('woodcat_session_id', sessionId);
    }
    return sessionId;
  },

  /**
   * 包装异步函数，添加错误处理
   * @param {Function} fn - 异步函数
   * @param {string} context - 上下文描述
   * @returns {Function} 包装后的函数
   */
  wrapAsync(fn, context = 'async') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.log('error', `Error in ${context}`, {
          error: error.message,
          stack: error.stack,
          args
        });
        throw error;
      }
    };
  },

  /**
   * 包装函数，添加错误处理
   * @param {Function} fn - 函数
   * @param {string} context - 上下文描述
   * @returns {Function} 包装后的函数
   */
  wrapSync(fn, context = 'sync') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.log('error', `Error in ${context}`, {
          error: error.message,
          stack: error.stack,
          args
        });
        throw error;
      }
    };
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
  } else {
    ErrorHandler.init();
  }
}

// 导出模块
export default ErrorHandler;