/**
 * 木头猫游戏合集 - 测试设置文件
 * 提供测试环境和工具函数
 */

import { vi } from 'vitest';

// 模拟localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// 模拟sessionStorage
const sessionStorageMock = new LocalStorageMock();

// 设置全局对象
global.localStorage = new LocalStorageMock();
global.sessionStorage = sessionStorageMock;

// 模拟window对象
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// 模拟navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
});

// 模拟performance
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    timing: {
      navigationStart: 0,
      domainLookupStart: 100,
      domainLookupEnd: 200,
      connectStart: 200,
      connectEnd: 300,
      requestStart: 300,
      responseStart: 500,
      responseEnd: 600,
      domLoading: 600,
      domComplete: 1200,
      loadEventStart: 1300,
      loadEventEnd: 1500
    },
    mark: vi.fn(),
    measure: vi.fn()
  },
  writable: true
});

// 模拟fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// 模拟IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = [];
  }

  observe(element) {
    this.elements.push(element);
  }

  unobserve(element) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect() {
    this.elements = [];
  }
};

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = [];
  }

  observe(element) {
    this.elements.push(element);
  }

  unobserve(element) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect() {
    this.elements = [];
  }
};

// 模拟requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// 模拟setTimeout和setInterval
global.setTimeout = vi.fn((fn, delay) => {
  const id = setTimeout(fn, delay);
  return id;
});

global.setInterval = vi.fn((fn, delay) => {
  const id = setInterval(fn, delay);
  return id;
});

global.clearTimeout = vi.fn((id) => {
  clearTimeout(id);
});

global.clearInterval = vi.fn((id) => {
  clearInterval(id);
});

// 模拟crypto
global.crypto = {
  getRandomValues: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  })
};

// 模拟URL
global.URL = class URL {
  constructor(url, base) {
    this.href = url;
    this.origin = base || 'https://example.com';
    this.protocol = 'https:';
    this.hostname = 'example.com';
    this.pathname = url;
    this.searchParams = new URLSearchParams();
  }

  toString() {
    return this.href;
  }
};

global.URLSearchParams = class URLSearchParams {
  constructor(search) {
    this.params = {};
    if (search) {
      search.split('&').forEach(param => {
        const [key, value] = param.split('=');
        this.params[key] = decodeURIComponent(value || '');
      });
    }
  }

  append(key, value) {
    this.params[key] = value;
  }

  get(key) {
    return this.params[key];
  }

  getAll(key) {
    return this.params[key] ? [this.params[key]] : [];
  }

  has(key) {
    return key in this.params;
  }

  set(key, value) {
    this.params[key] = value;
  }

  delete(key) {
    delete this.params[key];
  }

  toString() {
    return Object.entries(this.params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  }
};

// 测试工具函数
export const testUtils = {
  /**
   * 等待指定时间
   */
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * 创建模拟元素
   */
  createMockElement: (tagName = 'div', attributes = {}) => {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  },

  /**
   * 触发事件
   */
  triggerEvent: (element, eventType, detail = {}) => {
    const event = new CustomEvent(eventType, { detail, bubbles: true });
    element.dispatchEvent(event);
  },

  /**
   * 模拟用户输入
   */
  simulateUserInput: async (element, value) => {
    element.value = value;
    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(inputEvent);
    element.dispatchEvent(changeEvent);
  },

  /**
   * 等待DOM更新
   */
  waitForDOM: () => {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  },

  /**
   * 清理DOM
   */
  cleanupDOM: () => {
    document.body.innerHTML = '';
  }
};

// 测试后清理
afterEach(() => {
  // 清理mock
  vi.clearAllMocks();
  
  // 清理定时器
  vi.clearAllTimers();
  
  // 清理DOM
  testUtils.cleanupDOM();
  
  // 重置localStorage
  global.localStorage.clear();
});

console.log('[Test Setup] Test environment initialized');