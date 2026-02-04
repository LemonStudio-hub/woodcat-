/**
 * 木头猫游戏统一计分管理模块
 * 统一管理所有游戏的计分规则、排行榜和数据存储
 */

class ScoreManager {
    constructor() {
        this.dataManager = window.gameDataManager || this._createLocalDataManager();
        this.gameTypes = {
            'snake': { name: '贪吃蛇', scoreType: 'points' },
            'arkanoid': { name: '打砖块', scoreType: 'points' },
            'tetris': { name: '俄罗斯方块', scoreType: 'points' },
            'chess': { name: '国际象棋', scoreType: 'win_rate' },
            'checkers': { name: '跳棋', scoreType: 'win_rate' },
            'minesweeper': { name: '扫雷', scoreType: 'time' },
            '2048': { name: '2048', scoreType: 'points' },
            'tic-tac-toe': { name: '井字棋', scoreType: 'win_rate' },
            'memory-card': { name: '记忆翻牌', scoreType: 'time' }
        };
    }

    // 如果没有找到数据管理器，则创建一个本地存储的替代方案
    _createLocalDataManager() {
        return {
            loadData: async (gameName, dataType, defaultValue) => {
                try {
                    const key = `woodcat_${gameName}_${dataType}`;
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : defaultValue;
                } catch (e) {
                    console.error('读取本地数据失败:', e);
                    return defaultValue;
                }
            },
            saveData: async (gameName, dataType, data) => {
                try {
                    const key = `woodcat_${gameName}_${dataType}`;
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (e) {
                    console.error('保存本地数据失败:', e);
                    return false;
                }
            }
        };
    }

    /**
     * 获取游戏的最高分
     * @param {string} gameName - 游戏名称
     * @param {number} defaultValue - 默认值
     * @returns {number} 最高分
     */
    async getHighScore(gameName, defaultValue = 0) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return defaultValue;
        }
        
        const scoreType = this.gameTypes[gameName].scoreType;
        if (scoreType === 'points' || scoreType === 'time') {
            return await this.dataManager.loadData(gameName, 'highScore', defaultValue);
        } else if (scoreType === 'win_rate') {
            // 对于胜率类游戏，返回胜场数
            const stats = await this.dataManager.loadData(gameName, 'stats', { wins: 0, losses: 0, total: 0 });
            return stats.wins || 0;
        }
        
        return defaultValue;
    }

    /**
     * 更新游戏的最高分
     * @param {string} gameName - 游戏名称
     * @param {number} newScore - 新分数
     * @returns {boolean} 是否更新成功
     */
    async updateHighScore(gameName, newScore) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return false;
        }
        
        const scoreType = this.gameTypes[gameName].scoreType;
        if (scoreType === 'points') {
            // 对于积分类游戏，保存最高分
            const currentHighScore = await this.getHighScore(gameName, 0);
            if (newScore > currentHighScore) {
                return await this.dataManager.saveData(gameName, 'highScore', newScore);
            }
        } else if (scoreType === 'time') {
            // 对于计时类游戏（如扫雷、记忆翻牌），保存最低时间
            const currentBestTime = await this.getHighScore(gameName, Number.MAX_SAFE_INTEGER);
            if (newScore < currentBestTime && newScore > 0) {
                return await this.dataManager.saveData(gameName, 'highScore', newScore);
            }
        }
        
        return true; // 分数未超过最高分，但操作成功
    }

    /**
     * 记录游戏统计数据
     * @param {string} gameName - 游戏名称
     * @param {string} result - 游戏结果 ('win', 'loss', 'draw', 'play')
     * @param {number} score - 游戏分数（可选）
     * @returns {boolean} 是否记录成功
     */
    async recordGameResult(gameName, result, score = null) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return false;
        }

        try {
            // 加载现有统计数据
            const stats = await this.dataManager.loadData(gameName, 'stats', {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                totalScore: 0,
                bestScore: 0
            });

            // 更新统计数据
            stats.totalGames = (stats.totalGames || 0) + 1;
            
            if (result === 'win') {
                stats.wins = (stats.wins || 0) + 1;
            } else if (result === 'loss') {
                stats.losses = (stats.losses || 0) + 1;
            } else if (result === 'draw') {
                stats.draws = (stats.draws || 0) + 1;
            }

            // 如果提供了分数，更新总分和最佳分
            if (score !== null) {
                stats.totalScore = (stats.totalScore || 0) + score;
                
                const scoreType = this.gameTypes[gameName].scoreType;
                if (scoreType === 'points') {
                    // 对于积分类游戏，更新最佳分
                    if (score > (stats.bestScore || 0)) {
                        stats.bestScore = score;
                    }
                } else if (scoreType === 'time') {
                    // 对于计时类游戏，更新最佳时间
                    if (score < (stats.bestTime || Number.MAX_SAFE_INTEGER)) {
                        stats.bestTime = score;
                    }
                }
            }

            // 保存更新后的统计数据
            const saveSuccess = await this.dataManager.saveData(gameName, 'stats', stats);
            
            // 同时更新最高分
            if (score !== null) {
                await this.updateHighScore(gameName, score);
            }
            
            return saveSuccess;
        } catch (error) {
            console.error('记录游戏结果失败:', error);
            return false;
        }
    }

    /**
     * 计算游戏胜率
     * @param {string} gameName - 游戏名称
     * @returns {number} 胜率 (0-100)
     */
    async calculateWinRate(gameName) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return 0;
        }
        
        const stats = await this.dataManager.loadData(gameName, 'stats', {
            wins: 0,
            losses: 0,
            totalGames: 0
        });
        
        if (stats.totalGames === 0) {
            return 0;
        }
        
        return Math.round((stats.wins / stats.totalGames) * 100);
    }

    /**
     * 获取游戏统计数据
     * @param {string} gameName - 游戏名称
     * @returns {Object} 统计数据对象
     */
    async getGameStats(gameName) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                winRate: 0,
                highScore: 0
            };
        }

        const stats = await this.dataManager.loadData(gameName, 'stats', {
            wins: 0,
            losses: 0,
            draws: 0,
            totalGames: 0,
            totalScore: 0,
            bestScore: 0,
            bestTime: Number.MAX_SAFE_INTEGER
        });

        // 补充计算字段
        stats.winRate = await this.calculateWinRate(gameName);
        stats.highScore = await this.getHighScore(gameName, 0);

        return stats;
    }

    /**
     * 获取所有游戏的排行榜
     * @returns {Object} 包含所有游戏排行榜的对象
     */
    async getGlobalLeaderboard() {
        const leaderboard = {};
        
        for (const gameName in this.gameTypes) {
            const highScore = await this.getHighScore(gameName, 0);
            const stats = await this.getGameStats(gameName);
            
            leaderboard[gameName] = {
                name: this.gameTypes[gameName].name,
                highScore: highScore,
                stats: stats
            };
        }
        
        return leaderboard;
    }

    /**
     * 重置特定游戏的统计数据
     * @param {string} gameName - 游戏名称
     * @returns {boolean} 是否重置成功
     */
    async resetGameStats(gameName) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return false;
        }

        try {
            // 重置统计数据
            await this.dataManager.saveData(gameName, 'stats', {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                totalScore: 0,
                bestScore: 0,
                bestTime: Number.MAX_SAFE_INTEGER
            });
            
            // 重置最高分
            await this.dataManager.saveData(gameName, 'highScore', 0);
            
            return true;
        } catch (error) {
            console.error('重置游戏统计数据失败:', error);
            return false;
        }
    }

    /**
     * 比较两个分数
     * @param {string} gameName - 游戏名称
     * @param {number} score1 - 分数1
     * @param {number} score2 - 分数2
     * @returns {number} 比较结果 (-1: score1 < score2, 0: score1 === score2, 1: score1 > score2)
     */
    compareScores(gameName, score1, score2) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return 0;
        }

        const scoreType = this.gameTypes[gameName].scoreType;
        
        if (scoreType === 'time') {
            // 对于时间类游戏，时间越少越好
            if (score1 < score2) return 1;
            if (score1 > score2) return -1;
            return 0;
        } else {
            // 对于积分类游戏，分数越高越好
            if (score1 < score2) return -1;
            if (score1 > score2) return 1;
            return 0;
        }
    }

    /**
     * 获取分数显示格式
     * @param {string} gameName - 游戏名称
     * @param {number} score - 分数
     * @returns {string} 格式化后的分数字符串
     */
    formatScore(gameName, score) {
        if (!this.gameTypes[gameName]) {
            console.warn(`未知的游戏类型: ${gameName}`);
            return score.toString();
        }

        const scoreType = this.gameTypes[gameName].scoreType;
        
        if (scoreType === 'time') {
            // 对于时间类游戏，格式化为秒数
            if (score > 60) {
                const minutes = Math.floor(score / 60);
                const seconds = score % 60;
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return `${score}s`;
            }
        } else {
            // 对于积分类游戏，直接显示
            return score.toString();
        }
    }
}

// 创建全局实例
const scoreManager = new ScoreManager();

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoreManager, scoreManager };
} else {
    window.ScoreManager = ScoreManager;
    window.scoreManager = scoreManager;
}