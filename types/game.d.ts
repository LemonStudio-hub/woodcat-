/**
 * 木头猫游戏合集 - 游戏相关类型定义
 */

// 游戏基础类型
type GameId = 
  | 'tetris'
  | 'snake'
  | 'minesweeper'
  | '2048'
  | 'chess'
  | 'checkers'
  | 'tic-tac-toe'
  | 'memory-card'
  | 'arkanoid'
  | 'spider-solitaire'
  | 'tank-battle'
  | 'tank-battle-phaser';

type GameDifficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'single-player' | 'two-player' | 'multiplayer';

// 游戏分数类型
interface Score {
  id: string;
  gameId: GameId;
  playerId: string;
  playerName: string;
  score: number;
  level?: number;
  time?: number;
  date: Date;
  difficulty?: GameDifficulty;
  mode?: GameMode;
}

// 游戏配置类型
interface GameSettings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  difficulty: GameDifficulty;
  theme: 'light' | 'dark';
  language: string;
}

// 游戏状态类型
interface GameState {
  gameMode: GameMode;
  settings: GameSettings;
  score: {
    player1: number;
    player2?: number;
  };
  currentGame: GameId | null;
  isPaused: boolean;
  isPlaying: boolean;
}

// 游戏统计数据类型
interface GameStats {
  totalGamesPlayed: number;
  totalPlayTime: number;
  highScores: Record<GameId, Score>;
  lastPlayed: Record<GameId, Date>;
  favoriteGames: GameId[];
}

// 排行榜类型
interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  game: string;
  date: Date;
}

interface LeaderboardData {
  gameId: GameId;
  entries: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: Date;
}

// 存档类型
interface SaveGame {
  id: string;
  gameId: GameId;
  playerId: string;
  playerName: string;
  data: any;
  date: Date;
  thumbnail?: string;
}

// 成就类型
interface Achievement {
  id: string;
  gameId: GameId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// 用户资料类型
interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  createdAt: Date;
  lastLogin: Date;
  stats: GameStats;
  achievements: Achievement[];
  savedGames: SaveGame[];
}

// 游戏事件类型
type GameEventType = 
  | 'game_start'
  | 'game_end'
  | 'game_pause'
  | 'game_resume'
  | 'level_complete'
  | 'score_update'
  | 'achievement_unlock'
  | 'error';

interface GameEvent {
  type: GameEventType;
  gameId: GameId;
  timestamp: Date;
  data?: any;
}

// 游戏配置类型
interface GameConfig {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: GameDifficulty[];
  modes: GameMode[];
  maxPlayers: number;
  minPlayers: number;
  estimatedPlayTime: number; // 分钟
  features: string[];
}

// 游戏加载进度类型
interface LoadProgress {
  gameId: GameId;
  progress: number; // 0-100
  stage: string;
  error?: string;
}

// Phaser游戏特定类型
interface PhaserGameData {
  scene: string;
  players: {
    player1?: any;
    player2?: any;
  };
  enemies: any[];
  obstacles: any[];
  bullets: any[];
  score: number;
  level: number;
  enemiesDefeated: number;
  enemiesToDefeat: number;
}

// 导出所有类型
export type {
  GameId,
  GameDifficulty,
  GameMode,
  Score,
  GameSettings,
  GameState,
  GameStats,
  LeaderboardEntry,
  LeaderboardData,
  SaveGame,
  Achievement,
  UserProfile,
  GameEventType,
  GameEvent,
  GameConfig,
  LoadProgress,
  PhaserGameData
};

// 声明全局游戏对象
declare global {
  interface Window {
    game?: any;
    phaserGame?: any;
  }
}