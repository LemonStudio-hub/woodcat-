/**
 * 木头猫游戏合集 - 优化版国际化系统
 * 支持多语言、动态加载、懒翻译等功能
 */

const I18n = {
  // 配置
  config: {
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    availableLocales: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
    storageKey: 'woodcat_locale',
    cacheEnabled: true
  },

  // 当前语言
  currentLocale: null,

  // 翻译数据
  translations: {},

  // 格式化器
  formatters: {},

  /**
   * 初始化i18n系统
   * @param {Object} options - 配置选项
   */
  init(options = {}) {
    this.config = { ...this.config, ...options };
    this.currentLocale = this.detectLocale();
    this.loadTranslations();
    this.setupEventListeners();
    console.log('[I18n] Initialized with locale:', this.currentLocale);
  },

  /**
   * 检测用户语言
   * @returns {string} 检测到的语言代码
   */
  detectLocale() {
    // 1. 检查存储的语言偏好
    const storedLocale = localStorage.getItem(this.config.storageKey);
    if (storedLocale && this.isLocaleAvailable(storedLocale)) {
      return storedLocale;
    }

    // 2. 检查浏览器语言
    const browserLocale = navigator.language;
    if (this.isLocaleAvailable(browserLocale)) {
      return browserLocale;
    }

    // 3. 使用默认语言
    return this.config.defaultLocale;
  },

  /**
   * 检查语言是否可用
   * @param {string} locale - 语言代码
   * @returns {boolean} 是否可用
   */
  isLocaleAvailable(locale) {
    return this.config.availableLocales.includes(locale);
  },

  /**
   * 加载翻译数据
   */
  async loadTranslations() {
    const locale = this.currentLocale;

    try {
      // 尝试从localStorage加载
      if (this.config.cacheEnabled) {
        const cached = localStorage.getItem(`woodcat_i18n_${locale}`);
        if (cached) {
          this.translations[locale] = JSON.parse(cached);
          this.updateUI();
          return;
        }
      }

      // 从服务器加载
      const response = await fetch(`/i18n/${locale}.json`);
      if (response.ok) {
        const translations = await response.json();
        this.translations[locale] = translations;
        
        // 缓存翻译数据
        if (this.config.cacheEnabled) {
          localStorage.setItem(`woodcat_i18n_${locale}`, JSON.stringify(translations));
        }
        
        this.updateUI();
      } else {
        throw new Error('Failed to load translations');
      }
    } catch (error) {
      console.error('[I18n] Failed to load translations:', error);
      // 使用回退语言
      if (locale !== this.config.fallbackLocale) {
        this.currentLocale = this.config.fallbackLocale;
        this.loadTranslations();
      }
    }
  },

  /**
   * 切换语言
   * @param {string} locale - 目标语言
   */
  async setLocale(locale) {
    if (!this.isLocaleAvailable(locale)) {
      console.warn('[I18n] Locale not available:', locale);
      return;
    }

    if (locale === this.currentLocale) {
      return;
    }

    this.currentLocale = locale;
    localStorage.setItem(this.config.storageKey, locale);
    await this.loadTranslations();
    
    // 触发语言切换事件
    this.emit('localeChanged', { locale });
  },

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getLocale() {
    return this.currentLocale;
  },

  /**
   * 获取可用语言列表
   * @returns {Array<string>} 可用语言列表
   */
  getAvailableLocales() {
    return this.config.availableLocales;
  },

  /**
   * 翻译文本
   * @param {string} key - 翻译键
   * @param {Object} params - 参数
   * @returns {string} 翻译后的文本
   */
  t(key, params = {}) {
    const locale = this.currentLocale;
    const translations = this.translations[locale] || {};
    
    // 支持嵌套键（如 'nav.home'）
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // 如果找不到翻译，使用回退语言
    if (value === undefined && locale !== this.config.fallbackLocale) {
      const fallbackTranslations = this.translations[this.config.fallbackLocale] || {};
      value = fallbackTranslations[key];
    }

    // 如果还是找不到，返回键名
    if (value === undefined) {
      console.warn('[I18n] Translation not found:', key);
      return key;
    }

    // 如果是字符串，进行参数替换
    if (typeof value === 'string') {
      return this.interpolate(value, params);
    }

    return value;
  },

  /**
   * 参数插值
   * @param {string} template - 模板字符串
   * @param {Object} params - 参数对象
   * @returns {string} 插值后的字符串
   */
  interpolate(template, params) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  },

  /**
   * 格式化数字
   * @param {number} number - 数字
   * @param {Object} options - 格式化选项
   * @returns {string} 格式化后的数字
   */
  formatNumber(number, options = {}) {
    const locale = this.currentLocale;
    const formatter = new Intl.NumberFormat(locale, options);
    return formatter.format(number);
  },

  /**
   * 格式化日期
   * @param {Date} date - 日期
   * @param {Object} options - 格式化选项
   * @returns {string} 格式化后的日期
   */
  formatDate(date, options = {}) {
    const locale = this.currentLocale;
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
  },

  /**
   * 格式化时间
   * @param {Date} date - 日期
   * @param {Object} options - 格式化选项
   * @returns {string} 格式化后的时间
   */
  formatTime(date, options = {}) {
    const locale = this.currentLocale;
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
    return formatter.format(date);
  },

  /**
   * 格式化货币
   * @param {number} amount - 金额
   * @param {string} currency - 货币代码
   * @returns {string} 格式化后的货币
   */
  formatCurrency(amount, currency = 'CNY') {
    const locale = this.currentLocale;
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    });
    return formatter.format(amount);
  },

  /**
   * 格式化相对时间
   * @param {Date} date - 日期
   * @returns {string} 相对时间字符串
   */
  formatRelativeTime(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const rtf = new Intl.RelativeTimeFormat(this.currentLocale);

    if (years > 0) {
      return rtf.format(-years, 'year');
    } else if (months > 0) {
      return rtf.format(-months, 'month');
    } else if (days > 0) {
      return rtf.format(-days, 'day');
    } else if (hours > 0) {
      return rtf.format(-hours, 'hour');
    } else if (minutes > 0) {
      return rtf.format(-minutes, 'minute');
    } else {
      return rtf.format(-seconds, 'second');
    }
  },

  /**
   * 更新UI中的所有翻译
   */
  updateUI() {
    // 更新所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        element.textContent = this.t(key);
      }
    });

    // 更新带有 data-i18n-placeholder 属性的元素
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key) {
        element.placeholder = this.t(key);
      }
    });

    // 更新带有 data-i18n-title 属性的元素
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      if (key) {
        element.title = this.t(key);
      }
    });

    // 更新HTML文档的语言属性
    document.documentElement.lang = this.currentLocale;
  },

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听语言切换按钮
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        const currentIndex = this.config.availableLocales.indexOf(this.currentLocale);
        const nextIndex = (currentIndex + 1) % this.config.availableLocales.length;
        this.setLocale(this.config.availableLocales[nextIndex]);
      });
    }
  },

  /**
   * 事件发射器
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  emit(event, data) {
    const customEvent = new CustomEvent(`i18n:${event}`, { detail: data });
    window.dispatchEvent(customEvent);
  },

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  on(event, handler) {
    window.addEventListener(`i18n:${event}`, handler);
  },

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  off(event, handler) {
    window.removeEventListener(`i18n:${event}`, handler);
  },

  /**
   * 批量翻译
   * @param {Array<string>} keys - 翻译键数组
   * @returns {Object} 翻译对象
   */
  translateBatch(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.t(key);
    });
    return result;
  },

  /**
   * 添加翻译
   * @param {string} locale - 语言代码
   * @param {Object} translations - 翻译数据
   */
  addTranslations(locale, translations) {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    Object.assign(this.translations[locale], translations);
  },

  /**
   * 获取语言名称
   * @param {string} locale - 语言代码
   * @returns {string} 语言名称
   */
  getLanguageName(locale) {
    const names = {
      'zh-CN': '简体中文',
      'en-US': 'English',
      'ja-JP': '日本語',
      'ko-KR': '한국어'
    };
    return names[locale] || locale;
  },

  /**
   * 获取语言方向
   * @param {string} locale - 语言代码
   * @returns {string} 语言方向（ltr或rtl）
   */
  getDirection(locale) {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.some(l => locale.startsWith(l)) ? 'rtl' : 'ltr';
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.I18n = I18n;
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
  } else {
    I18n.init();
  }
}

// 导出模块
export default I18n;