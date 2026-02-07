// 木头猫游戏合集 - JavaScript功能

// 使用全局Logger对象（由logger.js提供）

// 定义全局变量用于存储supabase客户端
let globalSupabaseClient = null;

// 游戏数据
const games = {
    tetris: {
        title: '俄罗斯方块',
        description: '经典益智游戏，考验你的空间思维能力',
        url: 'games/tetris.html'
    },
    snake: {
        title: '贪吃蛇',
        description: '怀旧经典玩法，控制蛇吃食物并避免撞墙',
        url: 'games/snake.html'
    },
    minesweeper: {
        title: '扫雷',
        description: '挑战逻辑思维，找出所有地雷而不触发它们',
        url: 'games/minesweeper.html'
    },
    '2048': {
        title: '2048',
        description: '数字合并挑战，通过合并相同数字获得更高分数',
        url: 'games/2048.html'
    },
    chess: {
        title: '国际象棋',
        description: '策略对战游戏，经典的两人对弈棋类游戏',
        url: 'games/chess.html'
    },
    checkers: {
        title: '跳棋',
        description: '经典双人对战，通过跳跃吃掉对方棋子获得胜利',
        url: 'games/checkers.html'
    },
    'tic-tac-toe': {
        title: '井字棋',
        description: '经典策略游戏，两个玩家轮流在3x3网格上放置标记',
        url: 'games/tic-tac-toe.html'
    },
    'memory-card': {
        title: '记忆卡牌',
        description: '考验记忆能力，翻转卡牌找到匹配的对',
        url: 'games/memory-card.html'
    },
    'arkanoid': {
        title: '打砖块',
        description: '经典街机游戏，控制挡板反弹球打碎砖块',
        url: 'games/arkanoid.html'
    },
    'spider-solitaire': {
        title: '蜘蛛卡牌',
        description: '经典纸牌游戏，通过排序将卡牌按花色顺序排列',
        url: 'games/spider-solitaire.html'
    }
};

// 确保DOM完全加载后执行游戏卡片初始化
function initGameCardsWithRetry() {
    let attempts = 0;
    const maxAttempts = 5;
    const interval = 500;

    function tryInit() {
        attempts++;
        const gameCards = document.querySelectorAll('.game-card');
        
        if (gameCards.length > 0) {
            initGameCards(gameCards);
        } else if (attempts < maxAttempts) {
            console.log(`尝试初始化游戏卡片 (${attempts}/${maxAttempts})...`);
            setTimeout(tryInit, interval);
        } else {
            console.error('无法找到游戏卡片元素，初始化失败');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
}

// 初始化游戏卡片事件
function initGameCards(gameCards) {
    console.log(`开始初始化 ${gameCards.length} 个游戏卡片...`);
    
    // 为每个游戏卡片添加事件 - 统一处理，提高效率
    gameCards.forEach((card, index) => {
        console.log(`初始化游戏卡片 ${index + 1}: ${card.getAttribute('data-game')}`);
        
        // 确保卡片有完整的可点击区域
        card.style.cursor = 'pointer';
        card.style.pointerEvents = 'auto';
        card.style.zIndex = '1';
        
        // 添加触摸事件支持（移动端优化）
        card.addEventListener('touchstart', function(e) {
            // 记录触摸开始时间和位置，用于区分点击和滑动
            this.touchStartTime = Date.now();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // 添加触摸结束事件
        card.addEventListener('touchend', function(e) {
            // 确保触摸开始数据存在
            if (!this.touchStartTime) return;
            
            // 如果触摸时间小于300ms且移动距离小于10px，则认为是点击
            const touchDuration = Date.now() - this.touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchDistanceX = Math.abs(touchEndX - this.touchStartX);
            const touchDistanceY = Math.abs(touchEndY - this.touchStartY);
            const touchDistance = Math.sqrt(touchDistanceX * touchDistanceX + touchDistanceY * touchDistanceY);

            if (touchDuration < 300 && touchDistance < 10) {
                handleGameCardClick(this, e);
            }
        }, { passive: false });

        // 保留原有的点击事件（桌面端）
        card.addEventListener('click', function(e) {
            handleGameCardClick(this, e);
        });

        // 添加键盘支持（回车键）
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleGameCardClick(this, e);
            }
        });

        // 添加游戏卡片悬停效果增强
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    console.log('游戏卡片初始化完成');
}

// 统一处理游戏卡片点击事件
function handleGameCardClick(card, e) {
    try {
        // 阻止事件冒泡，避免触发父元素事件
        e.stopPropagation();
        
        const gameId = card.getAttribute('data-game');
        console.log(`点击游戏卡片: ${gameId}`);
        
        // 验证游戏数据
        if (!gameId) {
            console.error('游戏卡片缺少data-game属性');
            return;
        }
        
        const game = games[gameId];
        if (!game) {
            console.error(`游戏数据不存在: ${gameId}`);
            alert('游戏数据加载失败，请刷新页面重试');
            return;
        }
        
        if (!game.url) {
            console.error(`游戏URL不存在: ${gameId}`);
            alert('游戏链接无效，请联系管理员');
            return;
        }
        
        console.log(`跳转到游戏: ${game.title} (${game.url})`);
        // 直接跳转到游戏页面
        window.location.href = game.url;
    } catch (error) {
        console.error('处理游戏卡片点击时出错:', error);
        alert('操作失败，请刷新页面重试');
    }
}

// 动态加载配置和Supabase库
window.loadConfigAndSupabase = function() {
    // 创建script标签加载配置文件
    const configScript = document.createElement('script');
    configScript.src = 'js/config.js';
    configScript.onload = function() {
        // 配置加载完成后，检查是否启用了排行榜功能
        if (window.AppConfig && window.AppConfig.game && window.AppConfig.game.enableLeaderboard) {
            // 创建Supabase库的script标签
            const supabaseScript = document.createElement('script');
            supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            supabaseScript.onload = function() {
                // 库加载完成后，初始化所有功能
                window.initializeNonLeaderboardFeatures();
                window.initializeLeaderboard();
            };
            supabaseScript.onerror = function() {
                Logger.warn('Supabase库加载失败，仅初始化基本功能');
                window.initializeNonLeaderboardFeatures();
            };
            document.head.appendChild(supabaseScript);
        } else {
            // 排行榜功能已禁用，直接初始化非排行榜功能
            Logger.info('排行榜功能已禁用，跳过Supabase库加载');
            window.initializeNonLeaderboardFeatures();
        }
    };
    configScript.onerror = function() {
        Logger.warn('配置文件加载失败，仅初始化基本功能');
        window.initializeNonLeaderboardFeatures();
    };
    document.head.appendChild(configScript);
};

// 启动初始化
initGameCardsWithRetry();

// 动态加载Supabase库和配置（如果需要）
// 首先检查配置是否已存在
if (typeof window.AppConfig === 'undefined' || !window.AppConfig || !window.AppConfig.supabase) {
    // 如果配置不存在，尝试动态加载
    window.loadConfigAndSupabase();
} else {
    // 配置已存在，直接初始化非排行榜功能，确保菜单等正常工作
    window.initializeNonLeaderboardFeatures();
    // 然后尝试初始化排行榜功能
    window.initializeLeaderboard();
}

// 验证Supabase连接的函数
window.validateSupabaseConnection = async function() {
    if (!globalSupabaseClient) {
        return false;
    }
    
    try {
        // 尝试执行一个简单的查询来验证连接
        const { error } = await globalSupabaseClient
            .from('leaderboard')
            .select('id')
            .limit(1);
        
        if (error) {
            Logger.error('Supabase连接验证失败:', error);
            return false;
        }
        return true;
    } catch (err) {
        Logger.error('Supabase连接验证异常:', err);
        return false;
    }
};

// 监控Supabase连接状态
window.monitorSupabaseConnection = async function() {
    return await window.validateSupabaseConnection();
};

// 开始连接监控
window.startConnectionMonitoring = function() {
    // 每30秒检查一次连接状态
    setInterval(async () => {
        const isConnected = await window.monitorSupabaseConnection();
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = isConnected ? '在线' : '离线';
            statusElement.style.color = isConnected ? 'green' : 'red';
        }
    }, 30000);
};

// 初始化排行榜功能
window.initializeLeaderboard = function() {
    globalSupabaseClient = null;
    
    if (window.AppConfig && window.AppConfig.supabase) {
        try {
            // 初始化Supabase客户端
            globalSupabaseClient = window.supabase.createClient(window.AppConfig.supabase.url, window.AppConfig.supabase.key);
            
            Logger.info('Supabase客户端初始化成功');
        } catch (error) {
            Logger.error('Supabase客户端初始化失败:', error);
            globalSupabaseClient = null;
        }
    } else {
        Logger.warn('Supabase配置未找到');
    }
            
    // 排行榜相关元素
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const leaderboardEmpty = document.getElementById('leaderboard-empty');
    
    // 排行榜缓存
    let leaderboardCache = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
    
    // 加载排行榜数据
    async function loadLeaderboard() {
        // 检查是否有有效缓存
        const now = Date.now();
        if (leaderboardCache && (now - cacheTimestamp) < CACHE_DURATION) {
            // 使用缓存数据
            displayLeaderboardData(leaderboardCache);
            return;
        }
        
        // 显示加载状态
        leaderboardLoading.style.display = 'block';
        leaderboardEmpty.style.display = 'none';
        
        let allData = [];
        
        try {
            // 首先尝试从云端加载（如果可用）
            let cloudData = [];
            
            if (globalSupabaseClient) {
                try {
                    // 验证连接是否仍然有效
                    const isConnected = await window.validateSupabaseConnection();
                    if (!isConnected) {
                        Logger.warn('Supabase连接无效，跳过云端请求');
                        globalSupabaseClient = null; // 标记为无效连接
                    } else {
                        // 设置更合理的超时时间并实现重试机制
                        let attempts = 0;
                        const maxAttempts = 2;
                        
                        while (attempts < maxAttempts) {
                            try {
                                // 创建一个带超时的请求
                                const timeoutPromise = new Promise((_, reject) => {
                                    setTimeout(() => reject(new Error('云端加载排行榜超时')), 10000); // 10秒超时
                                });
                                
                                // 从Supabase获取排行榜数据，按分数降序排列，限制前20条
                                const queryPromise = globalSupabaseClient
                                    .from('leaderboard')
                                    .select('*')
                                    .order('score', { ascending: false })
                                    .limit(20);
                                
                                // 使用Promise.race来处理超时
                                const response = await Promise.race([queryPromise, timeoutPromise]);
                                
                                const { data, error } = response;
                                
                                if (error) {
                                    Logger.error(`云端加载排行榜失败 (尝试 ${attempts + 1}/${maxAttempts}):`, error);
                                    attempts++;
                                    
                                    if (attempts >= maxAttempts) {
                                        break; // 达到最大尝试次数
                                    }
                                    
                                    // 等待短暂时间后重试
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    continue;
                                } else {
                                    cloudData = data || [];
                                    Logger.info(`从云端加载了 ${cloudData.length} 条排行榜数据`);
                                    break; // 成功则跳出循环
                                }
                            } catch (timeoutError) {
                                Logger.warn(`云端排行榜加载超时 (尝试 ${attempts + 1}/${maxAttempts}):`, timeoutError.message);
                                attempts++;
                                
                                if (attempts >= maxAttempts) {
                                    break;
                                }
                                
                                // 等待短暂时间后重试
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                        }
                    }
                } catch (connectionError) {
                    Logger.error('云端加载异常:', connectionError);
                }
            }
            
            // 从本地存储获取数据
            let localLeaderboardEntries = [];
            try {
                const localData = await gameDataManager.getAllGameData();
                localLeaderboardEntries = Object.keys(localData)
                    .filter(key => key.startsWith('woodcat_leaderboard_'))
                    .map(key => localData[key])
                    .sort((a, b) => b.score - a.score) // 按分数降序排列
                    .slice(0, 20); // 只取前20条
                
                Logger.info(`从本地加载了 ${localLeaderboardEntries.length} 条排行榜数据`);
            } catch (localError) {
                Logger.error('本地数据加载失败:', localError);
            }
            
            // 合并云端和本地数据，去重并按分数排序
            const combinedDataMap = new Map();
            
            // 添加云端数据
            cloudData.forEach(item => {
                // 使用更唯一的键来避免冲突
                const key = `${item.player_name}_${item.game}_${item.score}_${new Date(item.created_at).getTime()}`;
                if (!combinedDataMap.has(key)) {
                    combinedDataMap.set(key, item);
                }
            });
            
            // 添加本地数据（如果云端没有相同记录）
            localLeaderboardEntries.forEach(item => {
                // 使用更唯一的键来避免冲突  
                const key = `${item.player_name}_${item.game}_${item.score}_${new Date(item.created_at).getTime()}`;
                if (!combinedDataMap.has(key)) {
                    combinedDataMap.set(key, item);
                }
            });
            
            // 转换为数组并按分数排序
            allData = Array.from(combinedDataMap.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);
            
            // 更新缓存
            leaderboardCache = allData;
            cacheTimestamp = now;
            
            // 隐藏加载状态
            leaderboardLoading.style.display = 'none';
            
            if (allData.length === 0) {
                leaderboardEmpty.style.display = 'block';
                return;
            }
            
            // 显示排行榜数据
            displayLeaderboardData(allData);
        } catch (err) {
            Logger.error('加载排行榜时发生错误:', err);
            leaderboardLoading.style.display = 'none';
            
            // 即使出错也要尝试从本地获取数据作为降级方案
            try {
                const localData = await gameDataManager.getAllGameData();
                const localLeaderboardEntries = Object.keys(localData)
                    .filter(key => key.startsWith('woodcat_leaderboard_'))
                    .map(key => localData[key])
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 20);
                
                if (localLeaderboardEntries.length > 0) {
                    displayLeaderboardData(localLeaderboardEntries);
                    Logger.info('使用本地数据成功显示排行榜');
                } else {
                    leaderboardEmpty.style.display = 'block';
                }
            } catch (localErr) {
                Logger.error('使用本地数据也失败:', localErr);
                leaderboardEmpty.style.display = 'block';
            }
        }
    }
    
    // 显示排行榜数据的辅助函数
    function displayLeaderboardData(data) {
        // 清空现有内容
        leaderboardBody.innerHTML = '';
        
        if (!data || data.length === 0) {
            leaderboardEmpty.style.display = 'block';
            return;
        }
        
        leaderboardEmpty.style.display = 'none';
        
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // 格式化日期为 YYYY-MM-DD
            const date = new Date(entry.created_at);
            const formattedDate = date.toISOString().split('T')[0];
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.player_name}</td>
                <td>${entry.score}</td>
                <td>${entry.game}</td>
                <td>${formattedDate}</td>
            `;
            
            leaderboardBody.appendChild(row);
        });
    }
    
    // 加载排行榜
    loadLeaderboard();
};

// 初始化非排行榜相关功能（如菜单等）
window.initializeNonLeaderboardFeatures = function() {
    // 确保桌面端导航栏在小屏幕时隐藏，大屏幕时显示
    function updateNavDisplay() {
        const nav = document.querySelector('.nav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!nav) return; // 确保nav元素存在
        
        const navList = nav.querySelector('ul');
        if (!navList) return; // 确保navList元素存在
        
        if (window.innerWidth > 768) {
            // 桌面端：始终显示导航，隐藏反馈项（如果存在）
            navList.style.display = 'flex'; // 桌面端使用flex显示
            navList.style.flexDirection = 'row'; // 桌面端水平排列
            const existingFeedbackItem = document.querySelector('.feedback-menu-item');
            if (existingFeedbackItem) {
                existingFeedbackItem.remove();
            }
            // 桌面端时移除移动端按钮的active类
            mobileMenuBtn && mobileMenuBtn.classList.remove('active');
        } else {
            // 移动端：默认隐藏，仅在点击按钮时显示
            navList.style.display = 'none';
            mobileMenuBtn && mobileMenuBtn.classList.remove('active');
        }
    }
    
    // 移动端菜单按钮
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (mobileMenuBtn) {
        // 添加触摸事件支持（移动端优化）
        mobileMenuBtn.addEventListener('touchstart', function() {
            // 记录触摸开始时间
            this.touchStartTime = Date.now();
        }, { passive: true });

        // 添加触摸结束事件
        mobileMenuBtn.addEventListener('touchend', function(e) {
            // 如果触摸时间小于300ms，则认为是点击
            const touchDuration = Date.now() - this.touchStartTime;

            if (touchDuration < 300) {
                // 阻止默认行为和事件冒泡
                e.preventDefault();
                e.stopPropagation();

                const nav = document.querySelector('.nav');
                const navList = nav.querySelector('ul');

                // 检查当前窗口大小
                if (window.innerWidth <= 768) { // 移动端
                    // 检查当前显示状态
                    if (navList.style.display === 'flex' || getComputedStyle(navList).display === 'flex') {
                        // 菜单当前显示，需要隐藏
                        navList.style.display = 'none';
                        this.classList.remove('active');
                    } else {
                        // 菜单当前隐藏，需要显示
                        navList.style.display = 'flex';
                        navList.style.flexDirection = 'column';
                        this.classList.add('active'); // 添加active类来实现动画效果

                        // 检查是否已经添加了反馈项，避免重复添加
                        const existingFeedbackItem = navList.querySelector('.feedback-menu-item');
                        if (!existingFeedbackItem) {
                            const feedbackItem = document.createElement('li');
                            feedbackItem.className = 'feedback-menu-item';
                            feedbackItem.innerHTML = '<a href="feedback.html">反馈与支持</a>';
                            navList.appendChild(feedbackItem);
                        }
                    }
                }
            }
        }, { passive: false });

        // 保留原有的点击事件（桌面端）
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 防止默认行为
            e.stopPropagation(); // 阻止事件冒泡

            const nav = document.querySelector('.nav');
            const navList = nav.querySelector('ul');

            // 检查当前窗口大小
            if (window.innerWidth <= 768) { // 移动端
                // 检查当前显示状态
                if (navList.style.display === 'flex' || getComputedStyle(navList).display === 'flex') {
                    // 菜单当前显示，需要隐藏
                    navList.style.display = 'none';
                    this.classList.remove('active');
                } else {
                    // 菜单当前隐藏，需要显示
                    navList.style.display = 'flex';
                    navList.style.flexDirection = 'column';
                    this.classList.add('active'); // 添加active类来实现动画效果

                    // 检查是否已经添加了反馈项，避免重复添加
                    const existingFeedbackItem = navList.querySelector('.feedback-menu-item');
                    if (!existingFeedbackItem) {
                        const feedbackItem = document.createElement('li');
                        feedbackItem.className = 'feedback-menu-item';
                        feedbackItem.innerHTML = '<a href="feedback.html">反馈与支持</a>';
                        navList.appendChild(feedbackItem);
                    }
                }
            }
        });
        
        // 点击菜单外部关闭菜单（仅在移动端）
        document.addEventListener('click', function(e) {
            const nav = document.querySelector('.nav');
            const navList = nav.querySelector('ul');
            
            if (window.innerWidth <= 768 && 
                !mobileMenuBtn.contains(e.target) && 
                navList && navList.style.display === 'flex' && 
                !nav.contains(e.target)) {
                navList.style.display = 'none';
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // 页面加载时和窗口大小改变时更新导航显示
    updateNavDisplay();
    window.addEventListener('resize', updateNavDisplay);
    
    // 添加页面滚动效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
    
    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 添加连接状态监控
    const connectionStatusItem = document.createElement('div');
    connectionStatusItem.className = 'menu-item connection-status-item';
    connectionStatusItem.style.padding = '10px';
    connectionStatusItem.style.borderTop = '1px solid #333';
    connectionStatusItem.style.marginTop = '10px';
    connectionStatusItem.style.textAlign = 'center';
    connectionStatusItem.style.fontSize = '14px';
    connectionStatusItem.style.color = '#ccc';
    connectionStatusItem.innerHTML = `
        <span>连接状态: </span>
        <span id="connection-status" style="color: gray;">未知</span>
    `;
    
    const nav = document.querySelector('.nav');
    const navList = nav.querySelector('ul');
    if (navList) {
        navList.appendChild(connectionStatusItem);
    }
    
    // 开始连接监控
    if (globalSupabaseClient) {
        startConnectionMonitoring();
        
        // 立即更新一次状态
        setTimeout(async () => {
            const isConnected = await monitorSupabaseConnection();
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
                statusElement.textContent = isConnected ? '在线' : '离线';
                statusElement.style.color = isConnected ? 'green' : 'red';
            }
        }, 1000);
    }
}

// 从URL参数获取分数并询问是否添加到排行榜 - 这个函数需要在所有初始化函数之外定义
function checkForScoreSubmission() {
    const urlParams = new URLSearchParams(window.location.search);
    const score = urlParams.get('score');
    const game = urlParams.get('game');
    
    // 获取模态框元素 - 在函数内部动态获取，确保DOM已加载
    const scoreModal = document.getElementById('score-modal');
    const currentScoreSpan = document.getElementById('current-score');
    const currentGameSpan = document.getElementById('current-game');
    const playerNameInput = document.getElementById('player-name');
    
    if (score && game && scoreModal && currentScoreSpan && currentGameSpan && playerNameInput) {
        // 临时变量存储分数和游戏信息
        let currentScore = parseInt(score);
        let currentGame = game;
        
        // 显示分数提交模态框
        currentScoreSpan.textContent = currentScore;
        currentGameSpan.textContent = games[currentGame]?.title || currentGame;
        scoreModal.style.display = 'flex';
        playerNameInput.focus();
        
        // 为模态框中的提交按钮添加事件监听器
        const submitScoreBtn = document.getElementById('submit-score-btn');
        const cancelScoreBtn = document.getElementById('cancel-score-btn');
        const scoreModalClose = document.getElementById('score-modal-close');
        
        if (submitScoreBtn) {
            // 定义提交分数函数
            const submitScoreToLeaderboard = async function() {
                const playerName = playerNameInput.value.trim();
                
                if (!playerName) {
                    alert('请输入您的昵称');
                    return;
                }
                
                if (playerName.length > 20) {
                    alert('昵称长度不能超过20个字符');
                    return;
                }
                
                // 显示加载状态
                submitScoreBtn.disabled = true;
                submitScoreBtn.textContent = '提交中...';
                
                try {
                    // 准备要插入的数据
                    const insertData = {
                        player_name: playerName,
                        score: currentScore,
                        game: games[currentGame]?.title || currentGame,
                        created_at: new Date().toISOString()
                    };
                    
                    Logger.info('准备插入的数据:', insertData);
                    
                    // 首先尝试本地存储，确保数据不会丢失
                    const localSuccess = await gameDataManager.saveData(
                        'leaderboard', 
                        `${currentGame}_${Date.now()}`, 
                        insertData
                    );
                    
                    if (!localSuccess) {
                        Logger.warn('本地存储失败，但继续尝试云端存储');
                    }
                    
                    // 尝试提交到云端（Supabase）
                    let cloudSuccess = false;
                    let cloudError = null;
                    
                    if (globalSupabaseClient) {
                        try {
                            // 验证连接是否仍然有效
                            const isConnected = await window.validateSupabaseConnection();
                            if (!isConnected) {
                                Logger.warn('Supabase连接无效，跳过云端提交');
                                globalSupabaseClient = null; // 标记为无效连接
                            } else {
                                // 实现重试机制
                                let attempts = 0;
                                const maxAttempts = 3;
                                
                                while (attempts < maxAttempts) {
                                    try {
                                        const { data, error } = await globalSupabaseClient
                                            .from('leaderboard')
                                            .insert([insertData]);
                                            
                                        if (error) {
                                            Logger.error(`云端提交分数失败 (尝试 ${attempts + 1}/${maxAttempts}):`, error);
                                            attempts++;
                                            
                                            if (attempts >= maxAttempts) {
                                                break; // 达到最大尝试次数
                                            }
                                            
                                            // 等待短暂时间后重试
                                            await new Promise(resolve => setTimeout(resolve, 1500));
                                            continue;
                                        } else {
                                            cloudSuccess = true;
                                            Logger.info('云端提交成功:', data);
                                            break; // 成功则跳出循环
                                        }
                                    } catch (err) {
                                        Logger.error(`云端提交异常 (尝试 ${attempts + 1}/${maxAttempts}):`, err);
                                        attempts++;
                                        
                                        if (attempts >= maxAttempts) {
                                            break;
                                        }
                                        
                                        // 等待短暂时间后重试
                                        await new Promise(resolve => setTimeout(resolve, 1500));
                                    }
                                }
                            }
                        } catch (err) {
                            Logger.error('云端提交时发生异常:', err);
                        }
                    } else {
                        Logger.warn('Supabase客户端未初始化或连接无效，跳过云端提交');
                    }
                    
                    // 根据结果决定显示什么信息
                    if (cloudSuccess) {
                        alert('分数已成功提交到排行榜！');
                    } else {
                        // 检查是否有具体的错误信息
                        if (cloudError) {
                            // 根据错误类型提供更具体的错误信息
                            let errorMessage = '提交分数失败，请稍后重试';
                            if (cloudError.code === '23505') {
                                errorMessage = '该记录已存在，请尝试其他昵称';
                            } else if (cloudError.code === '42P01') {
                                errorMessage = '数据库表不存在，请联系管理员';
                            } else if (cloudError.code === '42501') {
                                errorMessage = '没有权限写入数据，请联系管理员';
                            } else {
                                errorMessage = cloudError.message || '提交分数失败，请稍后重试';
                            }
                            
                            alert(`云端提交失败: ${errorMessage}\n\n本地已保存您的分数。`);
                        } else {
                            // 云端不可用，但本地存储成功
                            if (localSuccess) {
                                alert('云端不可用，但分数已本地保存。');
                            } else {
                                alert('提交分数时发生错误，但数据已尝试保存。');
                            }
                        }
                    }
                    
                    // 隐藏模态框
                    scoreModal.style.display = 'none';
                    playerNameInput.value = '';
                } catch (err) {
                    Logger.error('提交分数时发生错误:', err);
                    // 即使发生错误，也提供选项让用户关闭对话框
                    if (confirm('提交分数时发生错误，请稍后重试\n\n是否仍要关闭提交窗口？')) {
                        scoreModal.style.display = 'none';
                        playerNameInput.value = '';
                    }
                } finally {
                    // 恢复按钮状态
                    submitScoreBtn.disabled = false;
                    submitScoreBtn.textContent = '提交分数';
                }
            };
            
            // 绑定提交事件
            submitScoreBtn.onclick = submitScoreToLeaderboard;
        }
        
        // 绑定取消事件
        if (cancelScoreBtn) {
            cancelScoreBtn.onclick = function() {
                scoreModal.style.display = 'none';
                playerNameInput.value = '';
            };
        }
        
        if (scoreModalClose) {
            scoreModalClose.onclick = function() {
                scoreModal.style.display = 'none';
                playerNameInput.value = '';
            };
        }
        
        // 点击模态框外部关闭
        scoreModal.onclick = function(event) {
            if (event.target === scoreModal) {
                scoreModal.style.display = 'none';
                playerNameInput.value = '';
            }
        };
        
        // ESC键关闭模态框
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && scoreModal.style.display === 'flex') {
                scoreModal.style.display = 'none';
                playerNameInput.value = '';
            }
        });
    }
}

// 执行URL参数检查
checkForScoreSubmission();