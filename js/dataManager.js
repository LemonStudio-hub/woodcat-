/**
 * 木头猫游戏数据持久化模块
 * 使用IndexedDB管理所有游戏的本地存储功能
 */

// 使用全局Logger对象（如果不存在则创建一个简单的替代实现）
let Logger;
if (typeof window.Logger !== 'undefined') {
    Logger = window.Logger;
} else {
    Logger = {
        info: function(...args) { console.info(...args); },
        warn: function(...args) { console.warn(...args); },
        error: function(...args) { console.error(...args); }
    };
    window.Logger = Logger;
}

class GameDataManager {
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
                Logger.error('IndexedDB打开失败:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                Logger.info('IndexedDB初始化成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
                    store.createIndex('gameName', 'gameName', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    Logger.info('IndexedDB对象存储创建成功');
                }
            };
        });
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
     * 去抖保存数据
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

        // 设置新的保存任务
        const timeoutId = setTimeout(async () => {
            try {
                await this._waitForDB();
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                
                // 检查是否还有更新的数据在队列中
                if (this._saveQueue.has(key)) {
                    const finalData = this._saveQueue.get(key);
                    await store.put(finalData);
                    Logger.info(`数据已保存: ${key}`);
                    
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
                    resolve(defaultValue); // 失败时返回默认值而不是拒绝
                };
                
                // 为事务添加错误处理
                transaction.onerror = (event) => {
                    Logger.error('事务执行失败:', event.target.error);
                    resolve(defaultValue); // 失败时返回默认值而不是拒绝
                };
            });
        } catch (error) {
            Logger.error('读取游戏数据失败:', error);
            return defaultValue;
        }
    }

    /**
     * 删除游戏数据
     * @param {string} gameName - 游戏名称
     * @param {string} dataType - 数据类型
     */
    async removeData(gameName, dataType) {
        try {
            await this._waitForDB();
            
            const key = this._generateKey(gameName, dataType);
            
            return new Promise((resolve) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);

                request.onsuccess = () => {
                    // 清除缓存
                    this._clearCache(key);
                    
                    // 清除队列中的任务
                    this._saveQueue.delete(key);
                    if (this._saveTimeouts.has(key)) {
                        clearTimeout(this._saveTimeouts.get(key));
                        this._saveTimeouts.delete(key);
                    }
                    
                    resolve(true);
                };

                request.onerror = (event) => {
                    Logger.error('删除数据失败:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            Logger.error('删除游戏数据失败:', error);
            return false;
        }
    }

    /**
     * 获取所有游戏数据
     * @returns {Object} 包含所有游戏数据的对象
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
                    resolve({}); // 失败时返回空对象而不是拒绝
                };
                
                // 为事务添加错误处理
                transaction.onerror = (event) => {
                    Logger.error('事务执行失败:', event.target.error);
                    resolve({}); // 失败时返回空对象而不是拒绝
                };
            });
        } catch (error) {
            Logger.error('获取所有游戏数据失败:', error);
            return {};
        }
    }

    /**
     * 清空指定游戏的所有数据
     * @param {string} gameName - 游戏名称
     */
    async clearGameAllData(gameName) {
        try {
            await this._waitForDB();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const index = store.index('gameName');
                const request = index.openCursor(IDBKeyRange.only(gameName));

                let removedCount = 0;

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const key = cursor.value.key;
                        
                        // 删除缓存
                        this._clearCache(key);
                        
                        // 删除队列中的任务
                        this._saveQueue.delete(key);
                        if (this._saveTimeouts.has(key)) {
                            clearTimeout(this._saveTimeouts.get(key));
                            this._saveTimeouts.delete(key);
                        }
                        
                        cursor.delete();
                        removedCount++;
                        cursor.continue();
                    } else {
                        resolve(removedCount);
                    }
                };

                request.onerror = (event) => {
                    Logger.error('清空游戏数据失败:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            Logger.error('清空指定游戏数据失败:', error);
            return 0;
        }
    }

    /**
     * 清空所有游戏数据
     */
    async clearAllData() {
        try {
            await this._waitForDB();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAllKeys();

                request.onsuccess = (event) => {
                    const allKeys = event.target.result;
                    const woodcatKeys = allKeys.filter(key => key.startsWith(this.prefix));
                    
                    // 清除缓存
                    this._cache.clear();
                    
                    // 清除队列
                    this._saveQueue.clear();
                    for (const timeoutId of this._saveTimeouts.values()) {
                        clearTimeout(timeoutId);
                    }
                    this._saveTimeouts.clear();
                    
                    if (woodcatKeys.length === 0) {
                        resolve(0);
                        return;
                    }
                    
                    // 删除所有woodcat相关的数据
                    for (const key of woodcatKeys) {
                        store.delete(key);
                    }
                    
                    resolve(woodcatKeys.length);
                };

                request.onerror = (event) => {
                    Logger.error('获取键列表失败:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            Logger.error('清空所有游戏数据失败:', error);
            return 0;
        }
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储使用信息
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
                        // 计算数据大小（近似值）
                        const size = new Blob([JSON.stringify(result)]).size;
                        totalSize += size;

                        // 按游戏统计大小
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

    /**
     * 立即执行所有待保存的数据
     */
    async flushAllSaves() {
        // 清除所有剩余的定时器
        for (const timeoutId of this._saveTimeouts.values()) {
            clearTimeout(timeoutId);
        }
        this._saveTimeouts.clear();

        // 立即保存队列中的所有数据
        const promises = [];
        for (const [key, data] of this._saveQueue) {
            promises.push(this.saveDataImmediate(
                data.gameName,
                key.split('_')[1], // 从键中提取dataType
                data.data
            ));
        }
        
        this._saveQueue.clear();
        await Promise.all(promises);
    }
}

// 创建全局实例
const gameDataManager = new GameDataManager();

// 页面隐藏/卸载时，保存所有待处理的数据
window.addEventListener('beforeunload', async () => {
    if (gameDataManager && gameDataManager.flushAllSaves) {
        try {
            await gameDataManager.flushAllSaves();
        } catch (e) {
            Logger.error('保存待处理数据失败:', e);
        }
    }
});

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameDataManager, gameDataManager };
} else {
    window.GameDataManager = GameDataManager;
    window.gameDataManager = gameDataManager;
}