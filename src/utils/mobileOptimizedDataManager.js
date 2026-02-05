/**
 * 轻量级数据管理模块 - 专为移动端优化
 * 使用IndexedDB管理所有游戏的本地存储功能
 */

class MobileOptimizedDataManager {
  constructor() {
    this.prefix = 'woodcat_'; // 统一前缀，避免与其他应用冲突
    this.version = '1.0';
    this.dbName = 'WoodcatGameDB';
    this.storeName = 'gameData';
    this.db = null;
    this._cache = new Map(); // 内存缓存
    this._cacheTimeout = 3 * 60 * 1000; // 3分钟缓存过期时间（比桌面版短，以节省内存）
    this._saveQueue = new Map(); // 保存队列，用于去抖
    this._saveTimeouts = new Map(); // 保存超时ID
    this._saveDelay = 500; // 去抖延迟，500ms（比桌面版长，减少写入频率以节省资源）
    this._initPromise = this._initDB();
  }

  /**
   * 初始化IndexedDB
   */
  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        Logger.error('IndexedDB打开失败:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        // 限制缓存大小以节省内存
        this._enforceCacheLimit();
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('gameName', 'gameName', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 限制缓存大小以节省内存
   */
  _enforceCacheLimit() {
    // 限制缓存大小，移动端内存有限
    if (this._cache.size > 50) { // 限制为最多50个项目
      const keys = Array.from(this._cache.keys());
      for (let i = 0; i < keys.length - 40; i++) { // 保留最近的40个
        this._cache.delete(keys[i]);
      }
    }
  }

  /**
   * 等待数据库初始化
   */
  async _waitForDB() {
    if (!this.db) {
      await this._initPromise;
    }
  }

  /**
   * 生成存储键名
   * @param {string} gameName - 游戏名称
   * @param {string} dataType - 数据类型
   * @returns {string} 完整的键名
   */
  _generateKey(gameName, dataType) {
    return `${this.prefix}${gameName}_${dataType}`;
  }

  /**
   * 从缓存中获取数据
   * @param {string} key - 键名
   * @returns {*} 缓存的数据或undefined
   */
  _getCached(key) {
    const cached = this._cache.get(key);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this._cacheTimeout) {
        return cached.value;
      } else {
        // 缓存过期，删除它
        this._cache.delete(key);
      }
    }
    return undefined;
  }

  /**
   * 设置缓存数据
   * @param {string} key - 键名
   * @param {*} value - 要缓存的值
   */
  _setCached(key, value) {
    this._cache.set(key, {
      value: value,
      timestamp: Date.now()
    });
    // 检查并执行缓存限制
    this._enforceCacheLimit();
  }

  /**
   * 清除缓存
   * @param {string} key - 可选，指定键名清除，如果不提供则清除所有缓存
   */
  _clearCache(key) {
    if (key) {
      this._cache.delete(key);
    } else {
      this._cache.clear();
    }
  }

  /**
   * 去抖保存数据 - 移动端优化版本
   * @param {string} gameName - 游戏名称
   * @param {string} dataType - 数据类型
   * @param {*} data - 要保存的数据
   */
  _debouncedSave(gameName, dataType, data) {
    const key = this._generateKey(gameName, dataType);
    const saveData = {
      key: key,
      gameName: gameName,
      data: data,
      timestamp: Date.now(),
      version: this.version
    };

    // 取消之前的保存任务
    if (this._saveTimeouts.has(key)) {
      clearTimeout(this._saveTimeouts.get(key));
    }

    // 添加到队列
    this._saveQueue.set(key, saveData);

    // 设置新的保存任务 - 使用更长的延迟以减少移动端的I/O操作
    const timeoutId = setTimeout(async () => {
      try {
        await this._waitForDB();
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // 检查是否还有更新的数据在队列中
        if (this._saveQueue.has(key)) {
          const finalData = this._saveQueue.get(key);
          await store.put(finalData);
          
          // 更新缓存
          this._setCached(key, finalData.data);
          
          // 从队列中移除
          this._saveQueue.delete(key);
        }
      } catch (error) {
        Logger.error(`保存数据失败 ${key}:`, error);
      } finally {
        this._saveTimeouts.delete(key);
      }
    }, this._saveDelay);

    this._saveTimeouts.set(key, timeoutId);
  }

  /**
   * 保存游戏数据（带去抖）
   * @param {string} gameName - 游戏名称
   * @param {string} dataType - 数据类型
   * @param {*} data - 要保存的数据
   */
  async saveData(gameName, dataType, data) {
    try {
      // 更新缓存
      const key = this._generateKey(gameName, dataType);
      this._setCached(key, data);

      // 去抖保存
      this._debouncedSave(gameName, dataType, data);
      
      return true;
    } catch (error) {
      Logger.error('保存游戏数据失败:', error);
      return false;
    }
  }

  /**
   * 立即保存游戏数据（不使用去抖）
   * @param {string} gameName - 游戏名称
   * @param {string} dataType - 数据类型
   * @param {*} data - 要保存的数据
   */
  async saveDataImmediate(gameName, dataType, data) {
    try {
      await this._waitForDB();
      
      const key = this._generateKey(gameName, dataType);
      const value = {
        key: key,
        gameName: gameName,
        data: data,
        timestamp: Date.now(),
        version: this.version
      };

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.put(value);
      
      // 更新缓存
      this._setCached(key, data);
      
      // 清除队列中的任务
      this._saveQueue.delete(key);
      if (this._saveTimeouts.has(key)) {
        clearTimeout(this._saveTimeouts.get(key));
        this._saveTimeouts.delete(key);
      }
      
      return true;
    } catch (error) {
      Logger.error('立即保存游戏数据失败:', error);
      return false;
    }
  }

  /**
   * 读取游戏数据
   * @param {string} gameName - 游戏名称
   * @param {string} dataType - 数据类型
   * @param {*} defaultValue - 默认值
   * @returns {*} 读取的数据或默认值
   */
  async loadData(gameName, dataType, defaultValue = null) {
    try {
      // 检查缓存
      const key = this._generateKey(gameName, dataType);
      const cached = this._getCached(key);
      if (cached !== undefined) {
        return cached;
      }
      
      await this._waitForDB();
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result) {
            // 缓存数据
            this._setCached(key, result.data);
            resolve(result.data);
          } else {
            resolve(defaultValue);
          }
        };

        request.onerror = (event) => {
          Logger.error('读取数据失败:', event.target.error);
          resolve(defaultValue);
        };
        
        // 为事务添加错误处理
        transaction.onerror = (event) => {
          Logger.error('事务执行失败:', event.target.error);
          resolve(defaultValue);
        };
      });
    } catch (error) {
      Logger.error('读取游戏数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 获取所有游戏数据 - 移动端优化版本，限制返回数据量
   */
  async getAllGameData() {
    try {
      await this._waitForDB();
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = (event) => {
          const allData = {};
          const results = event.target.result;
          
          for (const result of results) {
            if (result.key.startsWith(this.prefix)) {
              allData[result.key] = result.data;
              
              // 同时更新缓存
              this._setCached(result.key, result.data);
            }
          }
          
          resolve(allData);
        };

        request.onerror = (event) => {
          Logger.error('获取所有数据失败:', event.target.error);
          resolve({});
        };
        
        // 为事务添加错误处理
        transaction.onerror = (event) => {
          Logger.error('事务执行失败:', event.target.error);
          resolve({});
        };
      });
    } catch (error) {
      Logger.error('获取所有游戏数据失败:', error);
      return {};
    }
  }

  /**
   * 获取存储使用情况 - 移动端优化版本
   */
  async getStorageInfo() {
    try {
      await this._waitForDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = (event) => {
          const results = event.target.result;
          let totalSize = 0;
          const gameSizes = {};

          for (const result of results) {
            // 简化的大小估算以节省移动端资源
            const size = JSON.stringify(result).length;
            totalSize += size;

            if (result.key.startsWith(this.prefix)) {
              const gameName = result.key.substring(
                this.prefix.length, 
                result.key.indexOf('_', this.prefix.length)
              );
              if (gameName) {
                if (!gameSizes[gameName]) {
                  gameSizes[gameName] = 0;
                }
                gameSizes[gameName] += size;
              }
            }
          }

          resolve({
            totalSize,
            gameSizes,
            count: results.length
          });
        };

        request.onerror = (event) => {
          Logger.error('获取存储信息失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      Logger.error('获取存储使用情况失败:', error);
      return {
        totalSize: 0,
        gameSizes: {},
        count: 0
      };
    }
  }
}

// 创建全局实例
const mobileOptimizedDataManager = new MobileOptimizedDataManager();

// 页面隐藏/卸载时，保存所有待处理的数据
window.addEventListener('pagehide', async () => {
  if (mobileOptimizedDataManager && mobileOptimizedDataManager.flushAllSaves) {
    try {
      await mobileOptimizedDataManager.flushAllSaves();
    } catch (e) {
      Logger.error('保存待处理数据失败:', e);
    }
  }
});

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileOptimizedDataManager, mobileOptimizedDataManager };
} else {
  window.MobileOptimizedDataManager = MobileOptimizedDataManager;
  window.mobileOptimizedDataManager = mobileOptimizedDataManager;
}