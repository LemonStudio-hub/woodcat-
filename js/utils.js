/**
 * 木头猫游戏合集 - 工具函数库
 * 提供通用的工具函数和辅助方法
 */

// 性能优化的工具函数
const Utils = {
  /**
   * 防抖函数
   * @param {Function} func - 需要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 节流函数
   * @param {Function} func - 需要节流的函数
   * @param {number} limit - 时间限制（毫秒）
   * @returns {Function} 节流后的函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 深拷贝对象
   * @param {any} obj - 需要拷贝的对象
   * @returns {any} 拷贝后的对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * 格式化数字（添加千位分隔符）
   * @param {number} num - 需要格式化的数字
   * @returns {string} 格式化后的字符串
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * 生成随机ID
   * @param {number} length - ID长度
   * @returns {string} 随机ID
   */
  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 获取URL参数
   * @param {string} name - 参数名称
   * @returns {string|null} 参数值
   */
  getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * 设置URL参数
   * @param {string} name - 参数名称
   * @param {string} value - 参数值
   */
  setUrlParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  },

  /**
   * 本地存储封装
   */
  storage: {
    /**
     * 保存数据到本地存储
     * @param {string} key - 键名
     * @param {any} value - 值
     */
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('保存到本地存储失败:', error);
      }
    },

    /**
     * 从本地存储获取数据
     * @param {string} key - 键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 存储的值或默认值
     */
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('从本地存储读取失败:', error);
        return defaultValue;
      }
    },

    /**
     * 删除本地存储中的数据
     * @param {string} key - 键名
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('删除本地存储失败:', error);
      }
    },

    /**
     * 清空本地存储
     */
    clear() {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('清空本地存储失败:', error);
      }
    }
  },

  /**
   * Cookie操作
   */
  cookie: {
    /**
     * 设置Cookie
     * @param {string} name - Cookie名称
     * @param {string} value - Cookie值
     * @param {number} days - 过期天数
     */
    set(name, value, days = 7) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = 'expires=' + date.toUTCString();
      document.cookie = name + '=' + value + ';' + expires + ';path=/';
    },

    /**
     * 获取Cookie
     * @param {string} name - Cookie名称
     * @returns {string|null} Cookie值
     */
    get(name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    /**
     * 删除Cookie
     * @param {string} name - Cookie名称
     */
    remove(name) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  },

  /**
   * 检测设备类型
   * @returns {Object} 设备信息
   */
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad|Android/i.test(userAgent) && window.innerWidth >= 768,
      isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isIOS: /iPhone|iPad|iPod/i.test(userAgent),
      isAndroid: /Android/i.test(userAgent),
      isSafari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
      isChrome: /Chrome/i.test(userAgent),
      isFirefox: /Firefox/i.test(userAgent),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  },

  /**
   * 检测网络状态
   * @returns {Object} 网络信息
   */
  getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      online: navigator.onLine,
      effectiveType: connection ? connection.effectiveType : null,
      downlink: connection ? connection.downlink : null,
      rtt: connection ? connection.rtt : null,
      saveData: connection ? connection.saveData : null
    };
  },

  /**
   * 性能监控
   */
  performance: {
    /**
     * 测量函数执行时间
     * @param {Function} func - 需要测量的函数
     * @returns {any} 函数执行结果
     */
    measure(func) {
      const start = performance.now();
      const result = func();
      const end = performance.now();
      console.log(`函数执行时间: ${(end - start).toFixed(2)}ms`);
      return result;
    },

    /**
     * 获取页面加载性能
     * @returns {Object} 性能数据
     */
    getPageLoadMetrics() {
      const timing = performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        dom: timing.domComplete - timing.domLoading,
        load: timing.loadEventEnd - timing.navigationStart,
        total: timing.loadEventEnd - timing.navigationStart
      };
    }
  },

  /**
   * 动画工具
   */
  animation: {
    /**
     * 平滑滚动到元素
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    scrollTo(element, duration = 500) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();

      function animation(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    },

    /**
     * 淡入元素
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    fadeIn(element, duration = 300) {
      element.style.opacity = '0';
      element.style.display = 'block';
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        if (progress < duration) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    },

    /**
     * 淡出元素
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    fadeOut(element, duration = 300) {
      let start = null;
      const initialOpacity = parseFloat(getComputedStyle(element).opacity);

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = initialOpacity - (initialOpacity * (progress / duration));
        if (progress < duration) {
          requestAnimationFrame(step);
        } else {
          element.style.display = 'none';
        }
      }

      requestAnimationFrame(step);
    }
  },

  /**
   * 错误处理
   */
  error: {
    /**
     * 全局错误处理器
     * @param {Function} callback - 错误回调函数
     */
    handleGlobalErrors(callback) {
      window.addEventListener('error', (event) => {
        callback({
          type: 'error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        callback({
          type: 'unhandledrejection',
          reason: event.reason,
          promise: event.promise
        });
      });
    },

    /**
     * 安全执行函数
     * @param {Function} func - 需要执行的函数
     * @param {any} defaultValue - 出错时的默认值
     * @returns {any} 函数执行结果或默认值
     */
    safeExecute(func, defaultValue = null) {
      try {
        return func();
      } catch (error) {
        console.error('函数执行失败:', error);
        return defaultValue;
      }
    }
  },

  /**
   * 验证工具
   */
  validate: {
    /**
     * 验证邮箱
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    isEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * 验证URL
     * @param {string} url - URL地址
     * @returns {boolean} 是否有效
     */
    isUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    /**
     * 验证数字
     * @param {any} value - 需要验证的值
     * @returns {boolean} 是否为有效数字
     */
    isNumber(value) {
      return typeof value === 'number' && !isNaN(value);
    },

    /**
     * 验证字符串
     * @param {any} value - 需要验证的值
     * @returns {boolean} 是否为有效字符串
     */
    isString(value) {
      return typeof value === 'string' && value.trim().length > 0;
    },

    /**
     * 验证数组
     * @param {any} value - 需要验证的值
     * @returns {boolean} 是否为数组
     */
    isArray(value) {
      return Array.isArray(value);
    },

    /**
     * 验证对象
     * @param {any} value - 需要验证的值
     * @returns {boolean} 是否为对象
     */
    isObject(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
  },

  /**
   * 格式化工具
   */
  format: {
    /**
     * 格式化日期
     * @param {Date} date - 日期对象
     * @param {string} format - 格式字符串
     * @returns {string} 格式化后的日期
     */
    date(date, format = 'YYYY-MM-DD HH:mm:ss') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    fileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间
     */
    time(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return [h, m, s]
        .map(v => String(v).padStart(2, '0'))
        .filter(v => v !== '00')
        .join(':') || '00:00';
    }
  },

  /**
   * DOM工具
   */
  dom: {
    /**
     * 查询元素
     * @param {string} selector - CSS选择器
     * @param {HTMLElement} context - 上下文元素
     * @returns {HTMLElement|null} 找到的元素
     */
    $(selector, context = document) {
      return context.querySelector(selector);
    },

    /**
     * 查询所有元素
     * @param {string} selector - CSS选择器
     * @param {HTMLElement} context - 上下文元素
     * @returns {NodeList} 找到的元素列表
     */
    $$(selector, context = document) {
      return context.querySelectorAll(selector);
    },

    /**
     * 添加类名
     * @param {HTMLElement} element - 目标元素
     * @param {string} className - 类名
     */
    addClass(element, className) {
      element.classList.add(className);
    },

    /**
     * 移除类名
     * @param {HTMLElement} element - 目标元素
     * @param {string} className - 类名
     */
    removeClass(element, className) {
      element.classList.remove(className);
    },

    /**
     * 切换类名
     * @param {HTMLElement} element - 目标元素
     * @param {string} className - 类名
     */
    toggleClass(element, className) {
      element.classList.toggle(className);
    },

    /**
     * 检查类名
     * @param {HTMLElement} element - 目标元素
     * @param {string} className - 类名
     * @returns {boolean} 是否包含类名
     */
    hasClass(element, className) {
      return element.classList.contains(className);
    },

    /**
     * 获取元素数据
     * @param {HTMLElement} element - 目标元素
     * @param {string} key - 数据键
     * @returns {any} 数据值
     */
    getData(element, key) {
      return element.dataset[key];
    },

    /**
     * 设置元素数据
     * @param {HTMLElement} element - 目标元素
     * @param {string} key - 数据键
     * @param {any} value - 数据值
     */
    setData(element, key, value) {
      element.dataset[key] = value;
    }
  },

  /**
   * 事件工具
   */
  event: {
    /**
     * 添加事件监听器
     * @param {HTMLElement} element - 目标元素
     * @param {string} eventType - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object} options - 事件选项
     */
    on(element, eventType, handler, options = {}) {
      element.addEventListener(eventType, handler, options);
    },

    /**
     * 移除事件监听器
     * @param {HTMLElement} element - 目标元素
     * @param {string} eventType - 事件类型
     * @param {Function} handler - 事件处理函数
     */
    off(element, eventType, handler) {
      element.removeEventListener(eventType, handler);
    },

    /**
     * 触发自定义事件
     * @param {HTMLElement} element - 目标元素
     * @param {string} eventType - 事件类型
     * @param {any} detail - 事件详情
     */
    emit(element, eventType, detail) {
      const event = new CustomEvent(eventType, { detail });
      element.dispatchEvent(event);
    },

    /**
     * 代理事件
     * @param {HTMLElement} element - 父元素
     * @param {string} eventType - 事件类型
     * @param {string} selector - 子元素选择器
     * @param {Function} handler - 事件处理函数
     */
    delegate(element, eventType, selector, handler) {
      element.addEventListener(eventType, (e) => {
        const target = e.target.closest(selector);
        if (target && element.contains(target)) {
          handler.call(target, e);
        }
      });
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.Utils = Utils;
}

// 导出模块
export default Utils;