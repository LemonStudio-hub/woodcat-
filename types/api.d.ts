/**
 * 木头猫游戏合集 - API相关类型定义
 */

// API基础类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    requestId: string;
  };
}

interface ApiRequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

// 分页类型
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 认证相关类型
interface AuthCredentials {
  username?: string;
  email?: string;
  password: string;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 分数API类型
interface ScoreRequest {
  gameId: string;
  score: number;
  playerName: string;
  difficulty?: string;
  mode?: string;
}

interface ScoreFilter {
  gameId?: string;
  difficulty?: string;
  mode?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// 成就API类型
interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
}

// 排行榜API类型
interface LeaderboardRequest {
  gameId: string;
  limit?: number;
  offset?: number;
  timeRange?: 'all' | 'daily' | 'weekly' | 'monthly';
}

// 存档API类型
interface SaveGameRequest {
  gameId: string;
  gameData: any;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

// WebSocket消息类型
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

// 文件上传类型
interface FileUploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onUploadComplete?: (response: ApiResponse) => void;
  onError?: (error: Error) => void;
}

// 缓存配置类型
interface CacheConfig {
  enabled: boolean;
  ttl: number; // 缓存过期时间（毫秒）
  maxSize: number; // 最大缓存条目数
  strategy: 'memory' | 'localStorage' | 'indexedDB';
}

// API客户端类型
interface ApiClient {
  request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>>;
  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T>(url: string, body?: any): Promise<ApiResponse<T>>;
  put<T>(url: string, body?: any): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
  patch<T>(url: string, body?: any): Promise<ApiResponse<T>>;
}

// 错误类型
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 导出所有类型
export type {
  HttpMethod,
  ApiResponse,
  ApiRequestConfig,
  PaginationParams,
  PaginatedResponse,
  AuthCredentials,
  AuthToken,
  UserProfile,
  ScoreRequest,
  ScoreFilter,
  AchievementProgress,
  LeaderboardRequest,
  SaveGameRequest,
  WebSocketMessage,
  WebSocketConfig,
  FileUploadOptions,
  CacheConfig,
  ApiClient
};

export { ApiError };