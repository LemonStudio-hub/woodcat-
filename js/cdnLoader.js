// CDN加载器 - 覆盖main.js中的loadConfigAndSupabase函数
// 确保在main.js之后加载

// 直接使用全局Logger

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideLoadConfig);
} else {
    overrideLoadConfig();
}

function overrideLoadConfig() {
    // 保存原始函数
    const originalLoadConfigAndSupabase = window.loadConfigAndSupabase;
    
    // 覆盖loadConfigAndSupabase函数
    window.loadConfigAndSupabase = function() {
        // 检查必要的函数是否存在
        function checkRequiredFunctions() {
            return typeof window.initializeNonLeaderboardFeatures === 'function' && 
                   typeof window.initializeLeaderboard === 'function';
        }
        
        // 确保必要的函数存在
        function ensureFunctionsExist() {
            if (checkRequiredFunctions()) {
                return Promise.resolve();
            }
            
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (checkRequiredFunctions()) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                // 最多等待5秒
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(); // 即使函数不存在也继续执行
                }, 5000);
            });
        }
        
        // 创建script标签加载配置文件
        const configScript = document.createElement('script');
        configScript.src = 'js/config.js';
        configScript.onload = function() {
            // 加载Howler.js库（无论是否启用排行榜功能都需要）
            if (window.CDNManager) {
                window.Logger.info('使用CDNManager加载Howler.js库');
                window.CDNManager.loadLibrary('howler').catch(error => {
                    window.Logger.warn('Howler.js库加载失败，音频功能将不可用:', error);
                });
            } else {
                // 备用方式：直接创建script标签加载Howler.js
                const howlerScript = document.createElement('script');
                howlerScript.src = 'https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js';
                howlerScript.onload = function() {
                    window.Logger.info('Howler.js库加载成功');
                };
                howlerScript.onerror = function() {
                    window.Logger.warn('Howler.js库加载失败，音频功能将不可用');
                };
                document.head.appendChild(howlerScript);
            }
            
            // 配置加载完成后，检查是否启用了排行榜功能
            if (window.AppConfig && window.AppConfig.game && window.AppConfig.game.enableLeaderboard) {
                // 使用CDNManager加载Supabase库
                if (window.CDNManager) {
                    window.Logger.info('使用CDNManager加载Supabase库');
                    window.CDNManager.loadLibrary('supabase').then(success => {
                        ensureFunctionsExist().then(() => {
                            if (success) {
                                // 库加载完成后，初始化所有功能
                                if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                                    window.initializeNonLeaderboardFeatures();
                                } else {
                                    window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                                }
                                if (typeof window.initializeLeaderboard === 'function') {
                                    window.initializeLeaderboard();
                                } else {
                                    window.Logger.error('initializeLeaderboard函数未定义');
                                }
                            } else {
                                window.Logger.warn('Supabase库加载失败，仅初始化基本功能');
                                if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                                    window.initializeNonLeaderboardFeatures();
                                } else {
                                    window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                                }
                            }
                        });
                    }).catch(error => {
                        window.Logger.error('加载Supabase库时发生错误:', error);
                        ensureFunctionsExist().then(() => {
                            if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                                window.initializeNonLeaderboardFeatures();
                            } else {
                                window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                            }
                        });
                    });
                } else {
                    window.Logger.error('CDNManager未初始化，使用备用方式加载Supabase库');
                    // 备用方式：直接创建script标签加载Supabase
                    const supabaseScript = document.createElement('script');
                    supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                    supabaseScript.onload = function() {
                        ensureFunctionsExist().then(() => {
                            // 库加载完成后，初始化所有功能
                            if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                                window.initializeNonLeaderboardFeatures();
                            } else {
                                window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                            }
                            if (typeof window.initializeLeaderboard === 'function') {
                                window.initializeLeaderboard();
                            } else {
                                window.Logger.error('initializeLeaderboard函数未定义');
                            }
                        });
                    };
                    supabaseScript.onerror = function() {
                        window.Logger.warn('Supabase库加载失败，仅初始化基本功能');
                        ensureFunctionsExist().then(() => {
                            if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                                window.initializeNonLeaderboardFeatures();
                            } else {
                                window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                            }
                        });
                    };
                    document.head.appendChild(supabaseScript);
                }
            } else {
                // 排行榜功能已禁用，直接初始化非排行榜功能
                window.Logger.info('排行榜功能已禁用，跳过Supabase库加载');
                ensureFunctionsExist().then(() => {
                    if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                        window.initializeNonLeaderboardFeatures();
                    } else {
                        window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                    }
                });
            }
        };
        configScript.onerror = function() {
            window.Logger.warn('配置文件加载失败，仅初始化基本功能');
            ensureFunctionsExist().then(() => {
                if (typeof window.initializeNonLeaderboardFeatures === 'function') {
                    window.initializeNonLeaderboardFeatures();
                } else {
                    window.Logger.error('initializeNonLeaderboardFeatures函数未定义');
                }
            });
        };
        document.head.appendChild(configScript);
    };
    
    // 将必要的函数暴露到全局
    window.initializeNonLeaderboardFeatures = window.initializeNonLeaderboardFeatures || function() {
        window.Logger.warn('initializeNonLeaderboardFeatures函数未定义，使用默认实现');
    };
    
    window.initializeLeaderboard = window.initializeLeaderboard || function() {
        window.Logger.warn('initializeLeaderboard函数未定义，使用默认实现');
    };
    
    // 重新执行配置加载
    window.loadConfigAndSupabase();
}
