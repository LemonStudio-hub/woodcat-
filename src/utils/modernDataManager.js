/**
 * 现代化数据管理模块 - 使用ES6模块和async/await
 */

export class ModernDataManager {
  constructor() {
    this.dbName = 'WoodcatGameDB';
    this.version = 1;
    this.storeName = 'gameData';
    this.db = null;
    this._cache = new Map();
    this._cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

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

  _generateKey(gameName, dataType) {
    return `woodcat_${gameName}_${dataType}`;
  }

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

  _setCached(key, value) {
    this._cache.set(key, {
      value: value,
      timestamp: Date.now()
    });
  }

  async saveData(gameName, dataType, data) {
    try {
      if (!this.db) {
        await this.init();
      }

      const key = this._generateKey(gameName, dataType);
      const value = {
        key: key,
        gameName: gameName,
        data: data,
        timestamp: Date.now(),
        version: this.version
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value);

        request.onsuccess = () => {
          this._setCached(key, data);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('保存数据失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('保存游戏数据失败:', error);
      return false;
    }
  }

  async loadData(gameName, dataType, defaultValue = null) {
    try {
      // 检查缓存
      const key = this._generateKey(gameName, dataType);
      const cached = this._getCached(key);
      if (cached !== undefined) {
        return cached;
      }

      if (!this.db) {
        await this.init();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result) {
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
      });
    } catch (error) {
      console.error('读取游戏数据失败:', error);
      return defaultValue;
    }
  }

  async getAllGameData() {
    try {
      if (!this.db) {
        await this.init();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = (event) => {
          const allData = {};
          const results = event.target.result;

          for (const result of results) {
            if (result.key.startsWith('woodcat_')) {
              allData[result.key] = result.data;
              this._setCached(result.key, result.data);
            }
          }

          resolve(allData);
        };

        request.onerror = (event) => {
          console.error('获取所有数据失败:', event.target.error);
          resolve({});
        };
      });
    } catch (error) {
      console.error('获取所有游戏数据失败:', error);
      return {};
    }
  }
}

// 创建全局实例
export const dataManager = new ModernDataManager();