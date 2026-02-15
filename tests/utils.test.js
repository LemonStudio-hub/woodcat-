/**
 * 木头猫游戏合集 - 工具函数单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// 模拟 Utils 模块
const Utils = {
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

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('保存到本地存储失败:', error);
      }
    },

    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('从本地存储读取失败:', error);
        return defaultValue;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('删除本地存储失败:', error);
      }
    },

    clear() {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('清空本地存储失败:', error);
      }
    }
  },

  validate: {
    isEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    isNumber(value) {
      return typeof value === 'number' && !isNaN(value);
    },

    isString(value) {
      return typeof value === 'string' && value.trim().length > 0;
    },

    isArray(value) {
      return Array.isArray(value);
    },

    isObject(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
  }
};

describe('Utils', () => {
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('应该延迟执行函数', () => {
      const mockFn = jest.fn();
      const debouncedFn = Utils.debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该取消之前的执行', () => {
      const mockFn = jest.fn();
      const debouncedFn = Utils.debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('应该限制函数执行频率', () => {
      const mockFn = jest.fn();
      const throttledFn = Utils.throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepClone', () => {
    it('应该深拷贝对象', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = Utils.deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('应该深拷贝数组', () => {
      const arr = [1, 2, { a: 3 }];
      const cloned = Utils.deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('应该处理基本类型', () => {
      expect(Utils.deepClone(null)).toBe(null);
      expect(Utils.deepClone(1)).toBe(1);
      expect(Utils.deepClone('string')).toBe('string');
    });

    it('应该处理日期对象', () => {
      const date = new Date();
      const cloned = Utils.deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('formatNumber', () => {
    it('应该添加千位分隔符', () => {
      expect(Utils.formatNumber(1000)).toBe('1,000');
      expect(Utils.formatNumber(1000000)).toBe('1,000,000');
      expect(Utils.formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('generateId', () => {
    it('应该生成指定长度的ID', () => {
      const id = Utils.generateId(8);
      expect(id).toHaveLength(8);
    });

    it('应该生成不同的ID', () => {
      const id1 = Utils.generateId();
      const id2 = Utils.generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('应该保存和获取数据', () => {
      Utils.storage.set('test', { value: 123 });
      const result = Utils.storage.get('test');
      expect(result).toEqual({ value: 123 });
    });

    it('应该返回默认值', () => {
      const result = Utils.storage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('应该删除数据', () => {
      Utils.storage.set('test', { value: 123 });
      Utils.storage.remove('test');
      const result = Utils.storage.get('test');
      expect(result).toBe(null);
    });

    it('应该清空所有数据', () => {
      Utils.storage.set('test1', 1);
      Utils.storage.set('test2', 2);
      Utils.storage.clear();
      expect(Utils.storage.get('test1')).toBe(null);
      expect(Utils.storage.get('test2')).toBe(null);
    });
  });

  describe('validate', () => {
    describe('isEmail', () => {
      it('应该验证有效的邮箱', () => {
        expect(Utils.validate.isEmail('test@example.com')).toBe(true);
        expect(Utils.validate.isEmail('user.name@domain.co.uk')).toBe(true);
      });

      it('应该拒绝无效的邮箱', () => {
        expect(Utils.validate.isEmail('invalid')).toBe(false);
        expect(Utils.validate.isEmail('invalid@')).toBe(false);
        expect(Utils.validate.isEmail('@invalid.com')).toBe(false);
      });
    });

    describe('isUrl', () => {
      it('应该验证有效的URL', () => {
        expect(Utils.validate.isUrl('https://example.com')).toBe(true);
        expect(Utils.validate.isUrl('http://example.com')).toBe(true);
      });

      it('应该拒绝无效的URL', () => {
        expect(Utils.validate.isUrl('not a url')).toBe(false);
        expect(Utils.validate.isUrl('example')).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('应该识别数字', () => {
        expect(Utils.validate.isNumber(123)).toBe(true);
        expect(Utils.validate.isNumber(0)).toBe(true);
        expect(Utils.validate.isNumber(-1)).toBe(true);
        expect(Utils.validate.isNumber(1.23)).toBe(true);
      });

      it('应该拒绝非数字', () => {
        expect(Utils.validate.isNumber('123')).toBe(false);
        expect(Utils.validate.isNumber(NaN)).toBe(false);
        expect(Utils.validate.isNumber(null)).toBe(false);
      });
    });

    describe('isString', () => {
      it('应该识别字符串', () => {
        expect(Utils.validate.isString('hello')).toBe(true);
        expect(Utils.validate.isString('  hello  ')).toBe(true);
      });

      it('应该拒绝非字符串', () => {
        expect(Utils.validate.isString('')).toBe(false);
        expect(Utils.validate.isString('   ')).toBe(false);
        expect(Utils.validate.isString(123)).toBe(false);
      });
    });

    describe('isArray', () => {
      it('应该识别数组', () => {
        expect(Utils.validate.isArray([])).toBe(true);
        expect(Utils.validate.isArray([1, 2, 3])).toBe(true);
      });

      it('应该拒绝非数组', () => {
        expect(Utils.validate.isArray({})).toBe(false);
        expect(Utils.validate.isArray(null)).toBe(false);
        expect(Utils.validate.isArray('string')).toBe(false);
      });
    });

    describe('isObject', () => {
      it('应该识别对象', () => {
        expect(Utils.validate.isObject({})).toBe(true);
        expect(Utils.validate.isObject({ a: 1 })).toBe(true);
      });

      it('应该拒绝非对象', () => {
        expect(Utils.validate.isObject([])).toBe(false);
        expect(Utils.validate.isObject(null)).toBe(false);
        expect(Utils.validate.isObject('string')).toBe(false);
      });
    });
  });
});