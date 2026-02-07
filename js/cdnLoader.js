// CDN加载器 - 覆盖main.js中的loadConfigAndSupabase函数
// 确保在main.js之后加载

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
        // 创建script标签加载配置文件
        const configScript = document.createElement('script');
        configScript.src = 'js/config.js';
        configScript.onload = function() {
            // 配置加载完成后，检查是否启用了排行榜功能
            if (window.AppConfig && window.AppConfig.game && window.AppConfig.game.enableLeaderboard) {
                // 使用CDNManager加载Supabase库
                if (window.CDNManager) {
                    Logger.info('使用CDNManager加载Supabase库');
                    window.CDNManager.loadLibrary('supabase').then(success => {
                        if (success) {
                            // 库加载完成后，初始化所有功能
                            initializeNonLeaderboardFeatures();
                            initializeLeaderboard();
                        } else {
                            Logger.warn('Supabase库加载失败，仅初始化基本功能');
                            initializeNonLeaderboardFeatures();
                        }
                    }).catch(error => {
                        Logger.error('加载Supabase库时发生错误:', error);
                        initializeNonLeaderboardFeatures();
                    });
                } else {
                    Logger.error('CDNManager未初始化，使用备用方式加载Supabase库');
                    // 备用方式：直接创建script标签加载Supabase
                    const supabaseScript = document.createElement('script');
                    supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                    supabaseScript.onload = function() {
                        // 库加载完成后，初始化所有功能
                        initializeNonLeaderboardFeatures();
                        initializeLeaderboard();
                    };
                    supabaseScript.onerror = function() {
                        Logger.warn('Supabase库加载失败，仅初始化基本功能');
                        initializeNonLeaderboardFeatures();
                    };
                    document.head.appendChild(supabaseScript);
                }
            } else {
                // 排行榜功能已禁用，直接初始化非排行榜功能
                Logger.info('排行榜功能已禁用，跳过Supabase库加载');
                initializeNonLeaderboardFeatures();
            }
        };
        configScript.onerror = function() {
            Logger.warn('配置文件加载失败，仅初始化基本功能');
            initializeNonLeaderboardFeatures();
        };
        document.head.appendChild(configScript);
    };
    
    // 重新执行配置加载
    window.loadConfigAndSupabase();
}
