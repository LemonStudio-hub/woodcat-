/**
 * 木头猫游戏合集 - 工具函数类型定义
 */

// 基础类型
type AnyObject = Record<string, any>;
type AnyObjectOrArray = AnyObject | any[];

// 存储相关类型
interface StorageItem {
  value: any;
  timestamp: number;
  expires?: number;
}

interface StorageOptions {
  expires?: number; // 过期时间（毫秒）
}

// 日志相关类型
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: AnyObject;
  url?: string;
  sessionId?: string;
}

interface ErrorEntry {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  userAgent?: string;
  url?: string;
  sessionId?: string;
}

// 性能相关类型
interface PerformanceMetrics {
  id: string;
  timestamp: number;
  dns: number;
  tcp: number;
  ttfb: number;
  download: number;
  domProcessing: number;
  loadComplete: number;
  totalLoadTime: number;
  url: string;
}

// 设备信息类型
interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  screenWidth: number;
  screenHeight: number;
}

// 网络信息类型
interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

// 验证相关类型
type Validator = (value: any) => boolean;

interface ValidationRule {
  validator: Validator;
  message: string;
}

// 事件相关类型
interface EventHandler {
  (event: Event): void;
}

interface EventOptions {
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
}

// 动画相关类型
interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}

// 工具函数类型
type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

// 游戏相关类型
interface GameConfig {
  id: string;
  name: string;
  path: string;
  priority: 'high' | 'medium' | 'low';
  preload: boolean;
  size: number;
}

interface LoadingState {
  loaded: Set<string>;
  loading: Set<string>;
  failed: Set<string>;
}

// 导出所有类型
export type {
  AnyObject,
  AnyObjectOrArray,
  StorageItem,
  StorageOptions,
  LogLevel,
  LogEntry,
  ErrorEntry,
  PerformanceMetrics,
  DeviceInfo,
  NetworkInfo,
  Validator,
  ValidationRule,
  EventHandler,
  EventOptions,
  AnimationOptions,
  DebouncedFunction,
  ThrottledFunction,
  GameConfig,
  LoadingState
};

// 声明全局 Utils 对象
declare global {
  interface Window {
    Utils: {
      debounce: <T extends (...args: any[]) => any>(
        func: T,
        wait: number
      ) => DebouncedFunction<T>;
      throttle: <T extends (...args: any[]) => any>(
        func: T,
        limit: number
      ) => ThrottledFunction<T>;
      deepClone: <T>(obj: T) => T;
      formatNumber: (num: number) => string;
      generateId: (length?: number) => string;
      getUrlParam: (name: string) => string | null;
      setUrlParam: (name: string, value: string) => void;
      storage: {
        set: (key: string, value: any) => void;
        get: <T>(key: string, defaultValue?: T) => T | null;
        remove: (key: string) => void;
        clear: () => void;
      };
      cookie: {
        set: (name: string, value: string, days?: number) => void;
        get: (name: string) => string | null;
        remove: (name: string) => void;
      };
      getDeviceInfo: () => DeviceInfo;
      getNetworkInfo: () => NetworkInfo;
      performance: {
        measure: <T>(func: () => T) => T;
        getPageLoadMetrics: () => PerformanceMetrics;
      };
      animation: {
        scrollTo: (element: HTMLElement, duration?: number) => void;
        fadeIn: (element: HTMLElement, duration?: number) => void;
        fadeOut: (element: HTMLElement, duration?: number) => void;
      };
      error: {
        handleGlobalErrors: (callback: (error: ErrorEntry) => void) => void;
        safeExecute: <T>(func: () => T, defaultValue?: T) => T;
      };
      validate: {
        isEmail: (email: string) => boolean;
        isUrl: (url: string) => boolean;
        isNumber: (value: any) => boolean;
        isString: (value: any) => boolean;
        isArray: (value: any) => boolean;
        isObject: (value: any) => boolean;
      };
      format: {
        date: (date: Date, format?: string) => string;
        fileSize: (bytes: number) => string;
        time: (seconds: number) => string;
      };
      dom: {
        $: (selector: string, context?: Document) => HTMLElement | null;
        $$: (selector: string, context?: Document) => NodeListOf<HTMLElement>;
        addClass: (element: HTMLElement, className: string) => void;
        removeClass: (element: HTMLElement, className: string) => void;
        toggleClass: (element: HTMLElement, className: string) => void;
        hasClass: (element: HTMLElement, className: string) => boolean;
        getData: (element: HTMLElement, key: string) => string | undefined;
        setData: (element: HTMLElement, key: string, value: string) => void;
      };
      event: {
        on: (
          element: HTMLElement,
          eventType: string,
          handler: EventHandler,
          options?: EventOptions
        ) => void;
        off: (
          element: HTMLElement,
          eventType: string,
          handler: EventHandler
        ) => void;
        emit: (
          element: HTMLElement,
          eventType: string,
          detail?: any
        ) => void;
        delegate: (
          element: HTMLElement,
          eventType: string,
          selector: string,
          handler: EventHandler
        ) => void;
      };
    };
    GameLoader: {
      init: () => void;
      loadGame: (gameId: string) => Promise<boolean>;
      preloadGame: (gameId: string) => void;
      getStats: () => {
        loaded: number;
        loading: number;
        failed: number;
        total: number;
      };
      clearCache: () => Promise<void>;
    };
    ErrorHandler: {
      init: () => void;
      log: (level: LogLevel, message: string, data?: AnyObject) => void;
      debug: (message: string, data?: AnyObject) => void;
      info: (message: string, data?: AnyObject) => void;
      warn: (message: string, data?: AnyObject) => void;
      error: (message: string, data?: AnyObject) => void;
      getStats: () => {
        logs: {
          total: number;
          lastHour: number;
          lastDay: number;
          byLevel: Record<LogLevel, number>;
        };
        errors: {
          total: number;
          lastHour: number;
          lastDay: number;
          byType: Record<string, number>;
        };
        metrics: {
          total: number;
          lastHour: number;
        };
      };
      exportLogs: (limit?: number) => LogEntry[];
      exportErrors: (limit?: number) => ErrorEntry[];
      clearLogs: () => void;
      clearErrors: () => void;
      wrapAsync: <T>(
        fn: (...args: any[]) => Promise<T>,
        context?: string
      ) => (...args: any[]) => Promise<T>;
      wrapSync: <T>(
        fn: (...args: any[]) => T,
        context?: string
      ) => (...args: any[]) => T;
    };
  }
}