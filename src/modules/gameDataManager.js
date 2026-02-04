/**
 * 木头猫游戏数据持久化模块 - ES6模块化版本
 * 使用IndexedDB管理所有游戏的本地存储功能
 */

export class GameDataManager {
  constructor() {
    this.prefix = 'woodcat_'; // 统一前缀，避免与其他应用冲突
    this.version = '1.0';
    this.dbName = 'WoodcatGameDB';
    this.storeName = 'gameData';
    this.db = null;
    this._cache = new Map(); // 内存缓存
    this._cacheTimeout = 5 * 60 * 1000; // 5分钟缓存过期时间
    this._saveQueue = new Map(); // 保存队列，用于去抖
    this._saveTimeouts = new Map(); // 保存超时ID
    this._saveDelay = 300; // 去抖延迟，300ms
    this._initPromise = this._initDB();
  }

  /**
   * 初始化IndexedDB
   */
  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('IndexedDB打开失败:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB初始化成功');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('gameName', 'gameName', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('IndexedDB对象存储创建成功');
        }
      };
    });
  }

  /**
   * 生成存储键名
   */
  _generateKey(gameName, dataType) {
    return `${this.prefix}${gameName}_${dataType}`;
  }

  /**
   * 从缓存中获取数据
   */
  _getCached(key) {
    const cached = this._cache.get(key);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this._cacheTimeout) {
        return cached.value;
      } else {
        this._cache.delete(key);
      }
    }
    return undefined;
  }

  /**
   * 设置缓存数据
   */
  _setCached(key, value) {
    this._cache.set(key, {
      value: value,
      timestamp: Date.now()
    });
  }

  /**
   * 去抖保存数据
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

    // 设置新的保存任务
    const timeoutId = setTimeout(async () => {
      try {
        await this._initPromise;
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
        console.error(`保存数据失败 ${key}:`, error);
      } finally {
        this._saveTimeouts.delete(key);
      }
    }, this._saveDelay);

    this._saveTimeouts.set(key, timeoutId);
  }

  /**
   * 保存游戏数据
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
      console.error('保存游戏数据失败:', error);
      return false;
    }
  }

  /**
   * 立即保存游戏数据
   */
  async saveDataImmediate(gameName, dataType, data) {
    try {
      await this._initPromise;

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
      console.error('立即保存游戏数据失败:', error);
      return false;
    }
  }

  /**
   * 读取游戏数据
   */
  async loadData(gameName, dataType, defaultValue = null) {
    try {
      // 检查缓存
      const key = this._generateKey(gameName, dataType);
      const cached = this._getCached(key);
      if (cached !== undefined) {
        return cached;
      }

      await this._initPromise;

      return new Promise((resolve, reject) => {
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
          console.error('读取数据失败:', event.target.error);
          resolve(defaultValue);
        };

        // 为事务添加错误处理
        transaction.onerror = (event) => {
          console.error('事务执行失败:', event.target.error);
          resolve(defaultValue);
        };
      });
    } catch (error) {
      console.error('读取游戏数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 获取所有游戏数据
   */
  async getAllGameData() {
    try {
      await this._initPromise;

      return new Promise((resolve, reject) => {
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
          console.error('获取所有数据失败:', event.target.error);
          resolve({});
        };

        // 为事务添加错误处理
        transaction.onerror = (event) => {
          console.error('事务执行失败:', event.target.error);
          resolve({});
        };
      });
    } catch (error) {
      console.error('获取所有游戏数据失败:', error);
      return {};
    }
  }

  /**
   * 清除指定游戏的所有数据
   */
  async clearGameData(gameName) {
    try {
      await this._initPromise;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('gameName');
        const request = index.getAllKeys(IDBKeyRange.only(gameName));

        request.onsuccess = (event) => {
          const keys = event.target.result;
          keys.forEach(key => {
            store.delete(key);
            this._cache.delete(key);
          });
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('清除游戏数据失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('清除游戏数据失败:', error);
      return false;
    }
  }
}

// 创建全局实例
export const dataManager = new GameDataManager();