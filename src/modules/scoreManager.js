/**
 * 统一计分管理模块 - ES6模块化版本
 */

import { dataManager } from './gameDataManager.js';

export class ScoreManager {
  constructor() {
    this.dataManager = dataManager;
    this.gameTypes = new Map([
      ['snake', { name: '贪吃蛇', scoreType: 'points' }],
      ['arkanoid', { name: '打砖块', scoreType: 'points' }],
      ['tetris', { name: '俄罗斯方块', scoreType: 'points' }],
      ['chess', { name: '国际象棋', scoreType: 'win_rate' }],
      ['checkers', { name: '跳棋', scoreType: 'win_rate' }],
      ['minesweeper', { name: '扫雷', scoreType: 'time' }],
      ['2048', { name: '2048', scoreType: 'points' }],
      ['tic-tac-toe', { name: '井字棋', scoreType: 'win_rate' }],
      ['memory-card', { name: '记忆翻牌', scoreType: 'time' }]
    ]);
  }

  /**
   * 获取最高分
   */
  async getHighScore(gameName, defaultValue = 0) {
    if (!this.gameTypes.has(gameName)) {
      console.warn(`未知的游戏类型: ${gameName}`);
      return defaultValue;
    }

    const scoreType = this.gameTypes.get(gameName).scoreType;
    if (scoreType === 'points' || scoreType === 'time') {
      return await this.dataManager.loadData(gameName, 'highScore', defaultValue);
    } else if (scoreType === 'win_rate') {
      const stats = await this.dataManager.loadData(gameName, 'stats', { wins: 0, losses: 0, total: 0 });
      return stats.wins || 0;
    }

    return defaultValue;
  }

  /**
   * 更新最高分
   */
  async updateHighScore(gameName, newScore) {
    if (!this.gameTypes.has(gameName)) {
      console.warn(`未知的游戏类型: ${gameName}`);
      return false;
    }

    const scoreType = this.gameTypes.get(gameName).scoreType;
    if (scoreType === 'points') {
      const currentHighScore = await this.getHighScore(gameName, 0);
      if (newScore > currentHighScore) {
        return await this.dataManager.saveData(gameName, 'highScore', newScore);
      }
    } else if (scoreType === 'time') {
      const currentBestTime = await this.getHighScore(gameName, Number.MAX_SAFE_INTEGER);
      if (newScore < currentBestTime && newScore > 0) {
        return await this.dataManager.saveData(gameName, 'highScore', newScore);
      }
    }

    return true;
  }

  /**
   * 记录游戏结果
   */
  async recordGameResult(gameName, result, score = null) {
    if (!this.gameTypes.has(gameName)) {
      console.warn(`未知的游戏类型: ${gameName}`);
      return false;
    }

    try {
      const stats = await this.dataManager.loadData(gameName, 'stats', {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        totalScore: 0,
        bestScore: 0
      });

      stats.totalGames = (stats.totalGames || 0) + 1;

      if (result === 'win') {
        stats.wins = (stats.wins || 0) + 1;
      } else if (result === 'loss') {
        stats.losses = (stats.losses || 0) + 1;
      } else if (result === 'draw') {
        stats.draws = (stats.draws || 0) + 1;
      }

      if (score !== null) {
        stats.totalScore = (stats.totalScore || 0) + score;

        const scoreType = this.gameTypes.get(gameName).scoreType;
        if (scoreType === 'points') {
          if (score > (stats.bestScore || 0)) {
            stats.bestScore = score;
          }
        } else if (scoreType === 'time') {
          if (score < (stats.bestTime || Number.MAX_SAFE_INTEGER)) {
            stats.bestTime = score;
          }
        }
      }

      const saveSuccess = await this.dataManager.saveData(gameName, 'stats', stats);

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
   * 计算胜率
   */
  async calculateWinRate(gameName) {
    if (!this.gameTypes.has(gameName)) {
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
   * 获取游戏统计信息
   */
  async getGameStats(gameName) {
    if (!this.gameTypes.has(gameName)) {
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

    stats.winRate = await this.calculateWinRate(gameName);
    stats.highScore = await this.getHighScore(gameName, 0);

    return stats;
  }

  /**
   * 获取全局排行榜
   */
  async getGlobalLeaderboard() {
    const leaderboard = {};

    for (const [gameName, gameInfo] of this.gameTypes) {
      const highScore = await this.getHighScore(gameName, 0);
      const stats = await this.getGameStats(gameName);

      leaderboard[gameName] = {
        name: gameInfo.name,
        highScore: highScore,
        stats: stats
      };
    }

    return leaderboard;
  }

  /**
   * 比较分数
   */
  compareScores(gameName, score1, score2) {
    if (!this.gameTypes.has(gameName)) {
      console.warn(`未知的游戏类型: ${gameName}`);
      return 0;
    }

    const scoreType = this.gameTypes.get(gameName).scoreType;

    if (scoreType === 'time') {
      if (score1 < score2) return 1;
      if (score1 > score2) return -1;
      return 0;
    } else {
      if (score1 < score2) return -1;
      if (score1 > score2) return 1;
      return 0;
    }
  }

  /**
   * 格式化分数显示
   */
  formatScore(gameName, score) {
    if (!this.gameTypes.has(gameName)) {
      console.warn(`未知的游戏类型: ${gameName}`);
      return score.toString();
    }

    const scoreType = this.gameTypes.get(gameName).scoreType;

    if (scoreType === 'time') {
      if (score > 60) {
        const minutes = Math.floor(score / 60);
        const seconds = score % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${score}s`;
      }
    } else {
      return score.toString();
    }
  }
}

// 创建全局实例
export const scoreManager = new ScoreManager();