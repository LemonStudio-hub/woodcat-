// 木头猫游戏合集 - JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const gameCards = document.querySelectorAll('.game-card');
    
    // 移动端菜单按钮
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
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
    
    // 为每个游戏卡片添加点击事件
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
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
                const gameId = this.getAttribute('data-game');
                const game = games[gameId];
                if (game && game.url) {
                    window.location.href = game.url;
                }
            }
        });
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
    
    // 添加游戏卡片悬停效果增强
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});