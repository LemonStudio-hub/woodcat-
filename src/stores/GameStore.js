import { defineStore } from 'pinia';

// 游戏数据
export const useGameStore = defineStore('game', {
  state: () => ({
    games: {
      tetris: {
        id: 'tetris',
        title: '俄罗斯方块',
        description: '经典益智游戏，考验你的空间思维能力',
        url: 'games/tetris.html',
        icon: '🧩',
        difficulty: 'easy',
        difficultyText: '简单',
        players: 1,
        category: 'puzzle'
      },
      snake: {
        id: 'snake',
        title: '贪吃蛇',
        description: '怀旧经典玩法，控制蛇吃食物并避免撞墙',
        url: 'games/snake.html',
        icon: '🐍',
        difficulty: 'medium',
        difficultyText: '中等',
        players: 1,
        category: 'casual'
      },
      minesweeper: {
        id: 'minesweeper',
        title: '扫雷',
        description: '挑战逻辑思维，找出所有地雷而不触发它们',
        url: 'games/minesweeper.html',
        icon: '💣',
        difficulty: 'hard',
        difficultyText: '困难',
        players: 1,
        category: 'logic'
      },
      '2048': {
        id: '2048',
        title: '2048',
        description: '数字合并挑战，通过合并相同数字获得更高分数',
        url: 'games/2048.html',
        icon: '🔢',
        difficulty: 'medium',
        difficultyText: '中等',
        players: 1,
        category: 'puzzle'
      },
      chess: {
        id: 'chess',
        title: '国际象棋',
        description: '策略对战游戏，经典的两人对弈棋类游戏',
        url: 'games/chess.html',
        icon: '♟️',
        difficulty: 'hard',
        difficultyText: '困难',
        players: 2,
        category: 'strategy'
      },
      checkers: {
        id: 'checkers',
        title: '跳棋',
        description: '经典双人对战，通过跳跃吃掉对方棋子获得胜利',
        url: 'games/checkers.html',
        icon: '⚪',
        difficulty: 'medium',
        difficultyText: '中等',
        players: 2,
        category: 'strategy'
      },
      'tic-tac-toe': {
        id: 'tic-tac-toe',
        title: '井字棋',
        description: '经典策略游戏，两个玩家轮流在3x3网格上放置标记',
        url: 'games/tic-tac-toe.html',
        icon: '❌',
        difficulty: 'easy',
        difficultyText: '简单',
        players: 2,
        category: 'strategy'
      },
      'memory-card': {
        id: 'memory-card',
        title: '记忆卡牌',
        description: '考验记忆能力，翻转卡牌找到匹配的对',
        url: 'games/memory-card.html',
        icon: '🃏',
        difficulty: 'medium',
        difficultyText: '中等',
        players: 1,
        category: 'memory'
      },
      'arkanoid': {
        id: 'arkanoid',
        title: '打砖块',
        description: '经典街机游戏，控制挡板反弹球打碎砖块',
        url: 'games/arkanoid.html',
        icon: '⚾',
        difficulty: 'medium',
        difficultyText: '中等',
        players: 1,
        category: 'arcade'
      }
    },
    currentGame: null
  }),
  getters: {
    getGameById: (state) => (id) => {
      return state.games[id] || null;
    },
    getGamesList: (state) => {
      return Object.values(state.games);
    },
    getGamesByCategory: (state) => (category) => {
      return Object.values(state.games).filter(game => game.category === category);
    },
    getGamesByDifficulty: (state) => (difficulty) => {
      return Object.values(state.games).filter(game => game.difficulty === difficulty);
    }
  },
  actions: {
    setCurrentGame(gameId) {
      this.currentGame = this.games[gameId] || null;
    },
    resetCurrentGame() {
      this.currentGame = null;
    },
    loadGames() {
      // 这里可以从API或本地存储加载游戏数据
      // 目前使用硬编码数据
      return this.games;
    }
  }
});
