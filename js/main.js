// 木头猫游戏合集 - JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const gameCards = document.querySelectorAll('.game-card');
    
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
        }
    };
    
    // 为每个游戏卡片添加点击事件 - 这是关键部分，必须优先执行
    gameCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault(); // 防止默认行为
            const gameId = this.getAttribute('data-game');
            const game = games[gameId];
            if (game && game.url) {
                // 直接跳转到游戏页面
                window.location.href = game.url;
            }
        });
    });
    
    // 为游戏卡片添加键盘支持（回车键）
    gameCards.forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // 防止默认行为
                const gameId = this.getAttribute('data-game');
                const game = games[gameId];
                if (game && game.url) {
                    window.location.href = game.url;
                }
            }
        });
    });
    
    // 添加游戏卡片悬停效果增强
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 动态加载Supabase库和配置（如果需要）
    // 首先检查配置是否已存在
    if (typeof window.AppConfig === 'undefined' || !window.AppConfig || !window.AppConfig.supabase) {
        // 如果配置不存在，尝试动态加载
        loadConfigAndSupabase();
    } else {
        // 配置已存在，直接初始化排行榜功能
        initializeLeaderboard();
    }
    
    // 动态加载配置和Supabase库
    function loadConfigAndSupabase() {
        // 创建script标签加载配置文件
        const configScript = document.createElement('script');
        configScript.src = 'js/config.js';
        configScript.onload = function() {
            // 配置加载完成后，创建Supabase库的script标签
            const supabaseScript = document.createElement('script');
            supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            supabaseScript.onload = function() {
                // 库加载完成后，初始化排行榜功能
                initializeLeaderboard();
            };
            supabaseScript.onerror = function() {
                console.warn('Supabase库加载失败，排行榜功能将被禁用');
                initializeNonLeaderboardFeatures();
            };
            document.head.appendChild(supabaseScript);
        };
        configScript.onerror = function() {
            console.warn('配置文件加载失败，排行榜功能将被禁用');
            initializeNonLeaderboardFeatures();
        };
        document.head.appendChild(configScript);
    }
    
    // 初始化排行榜功能
    function initializeLeaderboard() {
        let supabase;
        
        if (window.AppConfig && window.AppConfig.supabase) {
            try {
                // 初始化Supabase客户端
                supabase = supabase.createClient(window.AppConfig.supabase.url, window.AppConfig.supabase.key);
                
                // 排行榜相关元素
                const leaderboardBody = document.getElementById('leaderboard-body');
                const leaderboardLoading = document.getElementById('leaderboard-loading');
                const leaderboardEmpty = document.getElementById('leaderboard-empty');
                const scoreModal = document.getElementById('score-modal');
                const scoreModalClose = document.getElementById('score-modal-close');
                const cancelScoreBtn = document.getElementById('cancel-score-btn');
                const submitScoreBtn = document.getElementById('submit-score-btn');
                const playerNameInput = document.getElementById('player-name');
                const currentScoreSpan = document.getElementById('current-score');
                const currentGameSpan = document.getElementById('current-game');
                
                // 用于存储游戏结束时的分数和游戏类型
                let currentScore = 0;
                let currentGame = '';
                
                // 排行榜缓存
                let leaderboardCache = null;
                let cacheTimestamp = 0;
                const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
                
                // 移动端菜单按钮
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                
                // 从URL参数获取分数并询问是否添加到排行榜
                function checkForScoreSubmission() {
                    const urlParams = new URLSearchParams(window.location.search);
                    const score = urlParams.get('score');
                    const game = urlParams.get('game');
                    
                    if (score && game) {
                        currentScore = parseInt(score);
                        currentGame = game;
                        showScoreSubmissionModal();
                    }
                }
                
                // 显示分数提交模态框
                function showScoreSubmissionModal() {
                    currentScoreSpan.textContent = currentScore;
                    currentGameSpan.textContent = games[currentGame]?.title || currentGame;
                    scoreModal.style.display = 'flex';
                    playerNameInput.focus();
                }
                
                // 隐藏分数提交模态框
                function hideScoreSubmissionModal() {
                    scoreModal.style.display = 'none';
                    playerNameInput.value = '';
                }
                
                // 提交分数到排行榜
                async function submitScoreToLeaderboard() {
                    const playerName = playerNameInput.value.trim();
                    
                    if (!playerName) {
                        alert('请输入您的昵称');
                        return;
                    }
                    
                    if (playerName.length > 20) {
                        alert('昵称长度不能超过20个字符');
                        return;
                    }
                    
                    try {
                        const { data, error } = await supabase
                            .from('leaderboard')
                            .insert([
                                {
                                    player_name: playerName,
                                    score: currentScore,
                                    game: games[currentGame]?.title || currentGame,
                                    created_at: new Date().toISOString()
                                }
                            ]);
                            
                        if (error) {
                            console.error('提交分数失败:', error);
                            alert('提交分数失败，请稍后重试');
                            return;
                        }
                        
                        alert('分数已成功提交到排行榜！');
                        hideScoreSubmissionModal();
                        
                        // 清除缓存并重新加载排行榜
                        leaderboardCache = null;
                        cacheTimestamp = 0;
                        loadLeaderboard(); // 刷新排行榜
                    } catch (err) {
                        console.error('提交分数时发生错误:', err);
                        alert('提交分数时发生错误，请稍后重试');
                    }
                }
                
                // 加载排行榜数据
                async function loadLeaderboard() {
                    // 检查是否有有效缓存
                    const now = Date.now();
                    if (leaderboardCache && (now - cacheTimestamp) < CACHE_DURATION) {
                        // 使用缓存数据
                        displayLeaderboardData(leaderboardCache);
                        return;
                    }
                    
                    try {
                        // 显示加载状态
                        leaderboardLoading.style.display = 'block';
                        leaderboardEmpty.style.display = 'none';
                        
                        // 创建一个带超时的请求
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('加载排行榜超时')), 10000); // 10秒超时
                        });
                        
                        // 从Supabase获取排行榜数据，按分数降序排列，限制前20条
                        const queryPromise = supabase
                            .from('leaderboard')
                            .select('*')
                            .order('score', { ascending: false })
                            .limit(20);
                        
                        // 使用Promise.race来处理超时
                        const response = await Promise.race([queryPromise, timeoutPromise]);
                        
                        if (response.error) {
                            console.error('加载排行榜失败:', response.error);
                            leaderboardLoading.style.display = 'none';
                            leaderboardEmpty.style.display = 'block';
                            return;
                        }
                        
                        const { data } = response;
                        
                        // 更新缓存
                        leaderboardCache = data;
                        cacheTimestamp = now;
                        
                        // 隐藏加载状态
                        leaderboardLoading.style.display = 'none';
                        
                        if (!data || data.length === 0) {
                            leaderboardEmpty.style.display = 'block';
                            return;
                        }
                        
                        // 显示排行榜数据
                        leaderboardEmpty.style.display = 'none';
                        
                        displayLeaderboardData(data);
                    } catch (err) {
                        console.error('加载排行榜时发生错误:', err);
                        leaderboardLoading.style.display = 'none';
                        
                        // 如果是超时错误，显示不同的错误信息
                        if (err.message === '加载排行榜超时') {
                            console.warn('排行榜加载超时，显示空状态');
                        } else {
                            console.error('排行榜加载失败:', err);
                        }
                        
                        // 即使加载失败，也不显示错误状态，而是显示空状态，避免影响用户体验
                        leaderboardEmpty.style.display = 'block';
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
                
                // 检查URL参数并初始化分数提交
                checkForScoreSubmission();
                
                // 延迟加载排行榜，确保页面其他功能优先加载
                setTimeout(() => {
                    loadLeaderboard();
                }, 500); // 延迟500毫秒加载排行榜
                
                // 分数提交模态框事件处理
                scoreModalClose.addEventListener('click', hideScoreSubmissionModal);
                cancelScoreBtn.addEventListener('click', hideScoreSubmissionModal);
                
                submitScoreBtn.addEventListener('click', async function() {
                    await submitScoreToLeaderboard();
                });
                
                // 按ESC键关闭模态框
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && scoreModal.style.display === 'flex') {
                        hideScoreSubmissionModal();
                    }
                });
                
                // 点击模态框外部区域关闭模态框
                scoreModal.addEventListener('click', function(e) {
                    if (e.target === scoreModal) {
                        hideScoreSubmissionModal();
                    }
                });
                
                // 按Enter键提交分数（在输入框中）
                playerNameInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        submitScoreToLeaderboard();
                    }
                });
                
                // 移动端菜单切换功能
                if (mobileMenuBtn) {
                    mobileMenuBtn.addEventListener('click', function() {
                        const nav = document.querySelector('.nav');
                        const navList = nav.querySelector('ul');
                        
                        // 检查当前窗口大小
                        if (window.innerWidth <= 768) { // 移动端
                            // 获取当前计算样式
                            const computedStyle = window.getComputedStyle(navList);
                            
                            if (computedStyle.display === 'flex' || computedStyle.display === 'block') {
                                // 菜单当前显示，需要隐藏
                                navList.style.display = 'none';
                                this.classList.remove('active');
                            } else {
                                // 菜单当前隐藏，需要显示
                                navList.style.display = 'flex';
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
                }
                
                // 确保桌面端导航栏在小屏幕时隐藏，大屏幕时显示
                function updateNavDisplay() {
                    const nav = document.querySelector('.nav');
                    const navList = nav.querySelector('ul');
                    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                    
                    if (window.innerWidth > 768) {
                        // 桌面端：始终显示导航，隐藏反馈项（如果存在）
                        navList.style.display = 'flex'; // 桌面端使用flex显示
                        navList.style.flexDirection = 'row'; // 桌面端水平排列
                        const existingFeedbackItem = document.querySelector('.feedback-menu-item');
                        if (existingFeedbackItem) {
                            existingFeedbackItem.remove();
                        }
                        mobileMenuBtn.classList.remove('active');
                    } else {
                        // 移动端：默认隐藏，仅在点击按钮时显示
                        navList.style.display = 'none';
                        mobileMenuBtn.classList.remove('active');
                    }
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
            } catch (error) {
                console.error('Supabase初始化失败:', error);
                console.warn('排行榜功能将被禁用，但游戏功能仍可用');
                initializeNonLeaderboardFeatures();
            }
        } else {
            console.warn('Supabase配置不可用，排行榜功能将被禁用');
            initializeNonLeaderboardFeatures();
        }
    }
    
    // 初始化非排行榜功能（当Supabase不可用时）
    function initializeNonLeaderboardFeatures() {
        // 移动端菜单切换功能
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function() {
                const nav = document.querySelector('.nav');
                const navList = nav.querySelector('ul');
                
                // 检查当前窗口大小
                if (window.innerWidth <= 768) { // 移动端
                    // 获取当前计算样式
                    const computedStyle = window.getComputedStyle(navList);
                    
                    if (computedStyle.display === 'flex' || computedStyle.display === 'block') {
                        // 菜单当前显示，需要隐藏
                        navList.style.display = 'none';
                        this.classList.remove('active');
                    } else {
                        // 菜单当前隐藏，需要显示
                        navList.style.display = 'flex';
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
        }
        
        // 确保桌面端导航栏在小屏幕时隐藏，大屏幕时显示
        function updateNavDisplay() {
            const nav = document.querySelector('.nav');
            const navList = nav.querySelector('ul');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            
            if (window.innerWidth > 768) {
                // 桌面端：始终显示导航，隐藏反馈项（如果存在）
                navList.style.display = 'flex'; // 桌面端使用flex显示
                navList.style.flexDirection = 'row'; // 桌面端水平排列
                const existingFeedbackItem = document.querySelector('.feedback-menu-item');
                if (existingFeedbackItem) {
                    existingFeedbackItem.remove();
                }
                mobileMenuBtn.classList.remove('active');
            } else {
                // 移动端：默认隐藏，仅在点击按钮时显示
                navList.style.display = 'none';
                mobileMenuBtn.classList.remove('active');
            }
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
    }
});