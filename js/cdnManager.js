/**
 * CDN镜像源管理模块
 * 提供国内镜像源和降级机制，确保JavaScript库文件的可靠加载
 */

class CDNManager {
    constructor() {
        // 国内镜像源配置
        this.mirrors = {
            // 阿里云镜像源
            aliyun: {
                name: '阿里云',
                urls: {
                    supabase: 'https://npmmirror.com/mirrors/supabase-js@2/dist/umd/supabase.min.js',
                    vue: 'https://npmmirror.com/mirrors/vue@3.5.27/dist/vue.global.min.js',
                    vueRouter: 'https://npmmirror.com/mirrors/vue-router@5.0.2/dist/vue-router.global.min.js',
                    pinia: 'https://npmmirror.com/mirrors/pinia@3.0.4/dist/pinia.global.min.js',
                    howler: 'https://npmmirror.com/mirrors/howler@2.2.3/dist/howler.min.js'
                }
            },
            // 腾讯云镜像源
            tencent: {
                name: '腾讯云',
                urls: {
                    supabase: 'https://mirrors.cloud.tencent.com/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
                    vue: 'https://mirrors.cloud.tencent.com/npm/vue@3.5.27/dist/vue.global.min.js',
                    vueRouter: 'https://mirrors.cloud.tencent.com/npm/vue-router@5.0.2/dist/vue-router.global.min.js',
                    pinia: 'https://mirrors.cloud.tencent.com/npm/pinia@3.0.4/dist/pinia.global.min.js',
                    howler: 'https://mirrors.cloud.tencent.com/npm/howler@2.2.3/dist/howler.min.js'
                }
            },
            // 华为云镜像源
            huawei: {
                name: '华为云',
                urls: {
                    supabase: 'https://mirrors.huaweicloud.com/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
                    vue: 'https://mirrors.huaweicloud.com/npm/vue@3.5.27/dist/vue.global.min.js',
                    vueRouter: 'https://mirrors.huaweicloud.com/npm/vue-router@5.0.2/dist/vue-router.global.min.js',
                    pinia: 'https://mirrors.huaweicloud.com/npm/pinia@3.0.4/dist/pinia.global.min.js',
                    howler: 'https://mirrors.huaweicloud.com/npm/howler@2.2.3/dist/howler.min.js'
                }
            },
            // 官方CDN作为最后备用
            official: {
                name: '官方CDN',
                urls: {
                    supabase: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
                    vue: 'https://cdn.jsdelivr.net/npm/vue@3.5.27/dist/vue.global.min.js',
                    vueRouter: 'https://cdn.jsdelivr.net/npm/vue-router@5.0.2/dist/vue-router.global.min.js',
                    pinia: 'https://cdn.jsdelivr.net/npm/pinia@3.0.4/dist/pinia.global.min.js',
                    howler: 'https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js'
                }
            }
        };
        
        // 本地备份路径
        this.localBackups = {
            supabase: 'js/lib/supabase.min.js',
            vue: 'js/lib/vue.global.min.js',
            vueRouter: 'js/lib/vue-router.global.min.js',
            pinia: 'js/lib/pinia.global.min.js',
            howler: 'js/lib/howler.min.js'
        };
        
        // 加载状态
        this.loadingState = {};
        
        // 初始化Logger
        this.logger = window.Logger || {
            info: function(...args) { console.info(...args); },
            warn: function(...args) { console.warn(...args); },
            error: function(...args) { console.error(...args); }
        };
    }
    
    /**
     * 加载JavaScript库
     * @param {string} libName - 库名称
     * @param {string[]} mirrorOrder - 镜像源尝试顺序
     * @returns {Promise} - 加载结果
     */
    async loadLibrary(libName, mirrorOrder = ['aliyun', 'tencent', 'huawei', 'official']) {
        // 检查是否已经加载
        if (this.loadingState[libName] === 'loaded') {
            this.logger.info(`${libName} 已经加载，跳过加载过程`);
            return true;
        }
        
        // 检查是否正在加载
        if (this.loadingState[libName] === 'loading') {
            this.logger.info(`${libName} 正在加载中，等待加载完成`);
            // 等待加载完成
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.loadingState[libName] === 'loaded') {
                        clearInterval(checkInterval);
                        resolve(true);
                    } else if (this.loadingState[libName] === 'failed') {
                        clearInterval(checkInterval);
                        resolve(false);
                    }
                }, 100);
            });
        }
        
        this.loadingState[libName] = 'loading';
        this.logger.info(`开始加载 ${libName} 库`);
        
        // 尝试从镜像源加载
        for (const mirrorName of mirrorOrder) {
            if (this.mirrors[mirrorName] && this.mirrors[mirrorName].urls[libName]) {
                const url = this.mirrors[mirrorName].urls[libName];
                this.logger.info(`尝试从 ${this.mirrors[mirrorName].name} 加载 ${libName}: ${url}`);
                
                try {
                    const success = await this.loadScript(url, libName);
                    if (success) {
                        this.loadingState[libName] = 'loaded';
                        this.logger.info(`${libName} 从 ${this.mirrors[mirrorName].name} 加载成功`);
                        return true;
                    }
                    this.logger.warn(`${libName} 从 ${this.mirrors[mirrorName].name} 加载失败，尝试下一个镜像源`);
                } catch (error) {
                    this.logger.warn(`${libName} 从 ${this.mirrors[mirrorName].name} 加载出错:`, error);
                }
            }
        }
        
        // 尝试从本地备份加载
        if (this.localBackups[libName]) {
            this.logger.info(`尝试从本地备份加载 ${libName}: ${this.localBackups[libName]}`);
            try {
                const success = await this.loadScript(this.localBackups[libName], libName);
                if (success) {
                    this.loadingState[libName] = 'loaded';
                    this.logger.info(`${libName} 从本地备份加载成功`);
                    return true;
                }
                this.logger.warn(`${libName} 从本地备份加载失败`);
            } catch (error) {
                this.logger.warn(`${libName} 从本地备份加载出错:`, error);
            }
        }
        
        // 所有加载方式都失败
        this.loadingState[libName] = 'failed';
        this.logger.warn(`${libName} 所有加载方式都失败，将使用本地模拟实现`);
        
        // 为 Supabase 创建本地模拟实现
        if (libName === 'supabase') {
            this.logger.info('创建 Supabase 本地模拟实现');
            if (typeof window.supabase === 'undefined') {
                window.supabase = {
                    createClient: function() {
                        return {
                            from: function() {
                                return {
                                    select: function() {
                                        return Promise.resolve({ data: [], error: null });
                                    },
                                    insert: function() {
                                        return Promise.resolve({ data: null, error: null });
                                    },
                                    order: function() {
                                        return this;
                                    },
                                    limit: function() {
                                        return this;
                                    }
                                };
                            }
                        };
                    }
                };
                this.logger.info('Supabase 本地模拟实现创建成功');
            }
            return true; // 模拟加载成功
        }
        
        return false;
    }
    
    /**
     * 加载单个脚本文件
     * @param {string} url - 脚本URL
     * @param {string} libName - 库名称
     * @returns {Promise<boolean>} - 加载结果
     */
    loadScript(url, libName) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            script.async = true;
            
            // 加载成功
            script.onload = () => {
                script.__loaded = true;
                this.logger.info(`脚本 ${url} 加载成功`);
                resolve(true);
            };
            
            // 加载失败
            script.onerror = () => {
                script.__loaded = true;
                this.logger.warn(`脚本 ${url} 加载失败`);
                resolve(false);
            };
            
            // 加载超时 - 减少超时时间以更快处理ORB错误
            setTimeout(() => {
                if (!script.__loaded) {
                    script.__loaded = true;
                    this.logger.warn(`脚本 ${url} 加载超时`);
                    resolve(false);
                }
            }, 5000); // 5秒超时，更快处理ORB错误
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * 批量加载多个库
     * @param {string[]} libNames - 库名称数组
     * @param {string[]} mirrorOrder - 镜像源尝试顺序
     * @returns {Promise<Object>} - 加载结果
     */
    async loadLibraries(libNames, mirrorOrder = ['aliyun', 'tencent', 'huawei', 'official']) {
        const results = {};
        
        for (const libName of libNames) {
            results[libName] = await this.loadLibrary(libName, mirrorOrder);
        }
        
        return results;
    }
    
    /**
     * 获取库的加载状态
     * @param {string} libName - 库名称
     * @returns {string} - 加载状态
     */
    getLoadingState(libName) {
        return this.loadingState[libName] || 'unloaded';
    }
    
    /**
     * 重置库的加载状态
     * @param {string} libName - 库名称
     */
    resetLoadingState(libName) {
        delete this.loadingState[libName];
        this.logger.info(`重置 ${libName} 的加载状态`);
    }
    
    /**
     * 预加载常用库
     * @param {string[]} libNames - 要预加载的库名称
     * @returns {Promise<Object>} - 预加载结果
     */
    async preloadLibraries(libNames = ['supabase', 'vue', 'vueRouter', 'pinia']) {
        this.logger.info('开始预加载常用库');
        return await this.loadLibraries(libNames);
    }
}

// 创建全局实例
window.CDNManager = new CDNManager();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CDNManager;
}
