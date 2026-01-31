/**
 * 木头猫游戏数据持久化模块
 * 统一管理所有游戏的本地存储功能
 */

class GameDataManager {
    constructor() {
        this.prefix = 'woodcat_'; // 统一前缀，避免与其他应用冲突
        this.version = '1.0';
    }

    /**
     * 保存游戏数据
     * @param {string} gameName - 游戏名称
     * @param {string} dataType - 数据类型 (score, progress, settings等)
     * @param {*} data - 要保存的数据
     */
    saveData(gameName, dataType, data) {
        try {
            const key = this._generateKey(gameName, dataType);
            const value = {
                data: data,
                timestamp: Date.now(),
                version: this.version
            };
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('保存游戏数据失败:', error);
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
    loadData(gameName, dataType, defaultValue = null) {
        try {
            const key = this._generateKey(gameName, dataType);
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.data;
            }
            return defaultValue;
        } catch (error) {
            console.error('读取游戏数据失败:', error);
            return defaultValue;
        }
    }

    /**
     * 删除游戏数据
     * @param {string} gameName - 游戏名称
     * @param {string} dataType - 数据类型
     */
    removeData(gameName, dataType) {
        try {
            const key = this._generateKey(gameName, dataType);
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除游戏数据失败:', error);
            return false;
        }
    }

    /**
     * 获取所有游戏数据
     * @returns {Object} 包含所有游戏数据的对象
     */
    getAllGameData() {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                try {
                    const value = JSON.parse(localStorage.getItem(key));
                    allData[key] = value.data;
                } catch (e) {
                    console.error('解析本地存储数据失败:', key);
                }
            }
        }
        return allData;
    }

    /**
     * 清空指定游戏的所有数据
     * @param {string} gameName - 游戏名称
     */
    clearGameAllData(gameName) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${this.prefix}${gameName}_`)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        return keysToRemove.length;
    }

    /**
     * 清空所有游戏数据
     */
    clearAllData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        return keysToRemove.length;
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
     * 获取存储使用情况
     * @returns {Object} 存储使用信息
     */
    getStorageInfo() {
        let totalSize = 0;
        const gameSizes = {};

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                totalSize += size;

                // 按游戏统计大小
                if (key.startsWith(this.prefix)) {
                    const gameName = key.substring(this.prefix.length, key.indexOf('_', this.prefix.length));
                    if (!gameSizes[gameName]) {
                        gameSizes[gameName] = 0;
                    }
                    gameSizes[gameName] += size;
                }
            }
        }

        return {
            totalSize,
            gameSizes,
            count: localStorage.length
        };
    }
}

// 创建全局实例
const gameDataManager = new GameDataManager();

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameDataManager, gameDataManager };
} else {
    window.GameDataManager = GameDataManager;
    window.gameDataManager = gameDataManager;
}