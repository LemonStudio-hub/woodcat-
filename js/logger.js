/**
 * 日志工具
 * 提供可配置的日志功能，在生产环境中可以禁用日志
 */

// 确保Logger只被初始化一次
(function() {
    if (!window.Logger) {
        window.Logger = {
            // 日志级别: 'debug', 'info', 'warn', 'error'
            level: 'info',
            
            // 是否启用日志
            enabled: true,
            
            // 日志级别映射
            levels: {
                debug: 0,
                info: 1,
                warn: 2,
                error: 3
            },
            
            // 检查是否应该记录指定级别的日志
            _shouldLog(level) {
                return this.enabled && this.levels[level] >= this.levels[this.level];
            },
            
            // 调试日志
            debug(...args) {
                if (this._shouldLog('debug')) {
                    console.debug(...args);
                }
            },
            
            // 信息日志
            info(...args) {
                if (this._shouldLog('info')) {
                    console.info(...args);
                }
            },
            
            // 警告日志
            warn(...args) {
                if (this._shouldLog('warn')) {
                    console.warn(...args);
                }
            },
            
            // 错误日志
            error(...args) {
                if (this._shouldLog('error')) {
                    console.error(...args);
                }
            },
            
            // 设置日志级别
            setLevel(level) {
                if (this.levels[level] !== undefined) {
                    this.level = level;
                }
            },
            
            // 启用或禁用日志
            setEnabled(enabled) {
                this.enabled = enabled;
            },
            
            // 初始化日志工具，根据环境设置合适的日志级别
            init() {
                // 在浏览器环境中，默认为debug级别
                this.setLevel('debug');
            }
        };
        
        // 初始化日志工具
        window.Logger.init();
    }
})();

// 导出日志工具
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.Logger;
} else if (typeof window !== 'undefined') {
    window.Logger = window.Logger;
}
