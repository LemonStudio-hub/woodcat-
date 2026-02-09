/**
 * 国际化（i18n）模块
 * 支持多语言切换功能
 */

class I18n {
    constructor() {
        this.translations = {
            'zh-CN': {
                // 网站通用文本
                'site.title': '木头猫 - 小游戏合集',
                'site.slogan': '发现有趣的小游戏',
                'nav.home': '首页',
                'nav.games': '游戏',
                'nav.leaderboard': '排行榜',
                'hero.title': '欢迎来到木头猫游戏世界',
                'hero.description': '在这里，您可以找到各种经典有趣的小游戏，随时随地享受游戏的乐趣。',
                'hero.startGame': '开始游戏',
                'section.games': '精选游戏',
                'section.features': '功能特点',
                'section.leaderboard': '排行榜',
                
                // 功能特点
                'feature.richGames': '丰富游戏',
                'feature.richGames.desc': '涵盖各类经典游戏，满足不同玩家的喜好',
                'feature.responsive': '响应式设计',
                'feature.responsive.desc': '完美适配桌面、平板和手机设备',
                'feature.updates': '持续更新',
                'feature.updates.desc': '定期添加新游戏，保持新鲜感',
                
                // 排行榜
                'leaderboard.rank': '排名',
                'leaderboard.player': '玩家',
                'leaderboard.score': '分数',
                'leaderboard.game': '游戏',
                'leaderboard.date': '日期',
                'leaderboard.loading': '正在加载排行榜...',
                'leaderboard.empty': '暂无排行榜数据',
                
                // 提交分数模态框
                'modal.submitScore': '提交分数',
                'modal.yourScore': '您的分数:',
                'modal.game': '游戏:',
                'modal.playerName': '请输入您的昵称:',
                'modal.placeholder': '输入昵称',
                'modal.submit': '提交分数',
                'modal.cancel': '取消',
                
                // 通用按钮和文本
                'btn.play': '开始游戏',
                'btn.newGame': '新游戏',
                'btn.restart': '重新开始',
                'btn.pause': '暂停',
                'btn.resume': '继续',
                'btn.reset': '重置',
                'btn.back': '返回',
                'btn.tutorial': '游戏教程',
                'difficulty.easy': '简单',
                'difficulty.medium': '中等',
                'difficulty.hard': '困难',
                'players.1': '1人',
                'players.2': '2人',
                
                // 游戏名称
                'game.tetris': '俄罗斯方块',
                'game.snake': '贪吃蛇',
                'game.minesweeper': '扫雷',
                'game.2048': '2048',
                'game.chess': '国际象棋',
                'game.checkers': '跳棋',
                'game.tic-tac-toe': '井字棋',
                'game.memory-card': '记忆卡牌',
                'game.arkanoid': '打砖块',
                'game.spider-solitaire': '蜘蛛卡牌',
                
                // 游戏描述
                'game.tetris.desc': '经典益智游戏',
                'game.snake.desc': '怀旧经典玩法',
                'game.minesweeper.desc': '挑战逻辑思维',
                'game.2048.desc': '数字合并挑战',
                'game.chess.desc': '策略对战游戏',
                'game.checkers.desc': '经典双人对战',
                'game.tic-tac-toe.desc': '经典策略游戏',
                'game.memory-card.desc': '考验记忆能力',
                'game.arkanoid.desc': '经典街机游戏',
                'game.spider-solitaire.desc': '经典纸牌游戏',
                'game.tank-battle': '坦克大战',
                'game.tank-battle.desc': '经典坦克对战游戏',
                
                // 蜘蛛卡牌游戏
                'spiderSolitaire.title': '蜘蛛卡牌',
                'spiderSolitaire.score': '得分',
                'spiderSolitaire.time': '时间',
                'spiderSolitaire.moves': '移动',
                'spiderSolitaire.newGame': '新游戏',
                'spiderSolitaire.undo': '撤销',
                'spiderSolitaire.hint': '提示',
                'spiderSolitaire.stockPile': '发牌',
                'spiderSolitaire.gameOver': '游戏结束!',
                'spiderSolitaire.finalScore': '最终得分: ',
                'spiderSolitaire.totalTime': '总时间: ',
                'spiderSolitaire.totalMoves': '总移动: ',
                'spiderSolitaire.playAgain': '再玩一次',
                'spiderSolitaire.backToMenu': '返回菜单',
                
                // 游戏状态
                'game.score': '分数',
                'game.highScore': '最高分',
                'game.lives': '生命',
                'game.level': '关卡',
                'game.time': '时间',
                'game.status': '游戏状态',
                'game.gameOver': '游戏结束',
                'game.youWin': '恭喜获胜',
                'game.youLose': '游戏失败',
                'game.draw': '平局',
                'game.finalScore': '最终得分',
                'game.congratulations': '恭喜！',
                'game.tryAgain': '再试一次吧！',

                // 2048游戏
                'game2048.intro': '滑动或使用方向键合并相同数字的方块',
                'game2048.instructions': '向上滑动↑ 向下滑动↓ 向左滑动← 向右滑动→',
                'game2048.gameOver': '游戏结束!',
                'game2048.youWin': '恭喜！你达到了2048!',

                // 井字棋游戏
                'tictactoe.mode': '游戏模式：',
                'tictactoe.pvp': '双人对战',
                'tictactoe.pvc': '人机对战',
                'tictactoe.change': '更改',
                'tictactoe.turn': '玩家 X 回合',
                'tictactoe.playerXTurn': '玩家 X 回合',
                'tictactoe.playerOTurn': '玩家 O 回合',
                'tictactoe.yourTurn': '你的回合',
                'tictactoe.aiThinking': 'AI 思考中...',
                'tictactoe.playerXWins': '玩家 X',
                'tictactoe.playerOWins': '玩家 O',
                'tictactoe.draws': '平局',
                'tictactoe.resetScores': '重置计分',
                'tictactoe.gameOver': '游戏结束',
                'tictactoe.playerXWin': '玩家 X 获胜！',
                'tictactoe.playerOWin': '玩家 O 获胜！',
                'tictactoe.youWin': '你赢了！',
                'tictactoe.aiWin': 'AI获胜！再试一次吧！',
                'tictactoe.draw': '平局！',
                'tictactoe.selectMode': '选择游戏模式',
                'tictactoe.pvpDesc': '两名玩家轮流对战',
                'tictactoe.pvcDesc': '与AI对战挑战',

                // 打砖块游戏
                'arkanoid.score': '得分',
                'arkanoid.lives': '生命',
                'arkanoid.level': '关卡',
                'arkanoid.highScore': '最高分',
                'arkanoid.gameOver': '游戏结束',
                'arkanoid.finalScore': '最终得分',
                'arkanoid.congrats': '恭喜通关',
                'arkanoid.winScore': '最终得分',
                'arkanoid.nextLevel': '下一关',
                'arkanoid.start': '开始游戏',
                'arkanoid.pause': '暂停',
                'arkanoid.resume': '继续',
                'arkanoid.restart': '重新开始',
                'arkanoid.hint': '使用 ← → 键、鼠标或滑动手势移动挡板',
                'arkanoid.mobileHint': '💡 提示：左右滑动屏幕可控制挡板',

                // 扫雷游戏
                'minesweeper.score': '分数',
                'minesweeper.flags': '标记',
                'minesweeper.time': '时间',
                'minesweeper.bestTime': '最佳时间',
                'minesweeper.easy': '简单 (10×10)',
                'minesweeper.medium': '中等 (15×15)',
                'minesweeper.hard': '困难 (20×20)',
                'minesweeper.newGame': '新游戏',
                'minesweeper.gameOver': '游戏结束',
                'minesweeper.youWin': '恭喜！你成功清除了所有地雷！',
                'minesweeper.timeSpent': '用时',

                // 版权
                'copyright': '© 2026 木头猫 - 保留所有权利',

                // 排行榜页面
                'leaderboard.maintenance.title': '排行榜功能维护中',
                'leaderboard.maintenance.message': '尊敬的玩家，排行榜功能目前正在进行维护升级，预计很快就会恢复正常。感谢您的理解和支持！',
                'leaderboard.totalGames': '总游戏数',
                'leaderboard.wins': '胜场',
                'leaderboard.losses': '负场',
                'leaderboard.winRate': '胜率',
                'leaderboard.totalScore': '总得分',
                'leaderboard.resetAll': '重置所有游戏数据',
                'leaderboard.resetConfirm': '确定要重置所有游戏的统计数据吗？此操作不可撤销！',
                'leaderboard.resetSuccess': '成功重置了 {count} 个游戏的统计数据',
                'leaderboard.resetFailed': '重置失败，请稍后重试',
                'leaderboard.loadingFailed': '加载失败，请稍后重试',

                // 贪吃蛇游戏
                'snake.selectMode': '选择游戏模式',
                'snake.singlePlayer': '单人模式',
                'snake.aiBattle': 'AI对战模式',
                'snake.selectModeDesc': '选择一个游戏模式开始游戏',
                'snake.length': '长度',
                'snake.aiScore': 'AI得分',
                'snake.aiLength': 'AI长度',
                'snake.ready': '准备中',
                'snake.controls': '使用 ← → ↑ ↓ 键或滑动手势控制方向',
                'snake.playAgain': '再玩一次',
                'snake.changeMode': '更换模式',
                'snake.objective': '游戏目标',
                'snake.objectiveDesc': '控制贪吃蛇吃掉食物，不断增长身体并获得高分！',
                'snake.controlsTitle': '操作方法',
                'snake.controlsKeyboard': '键盘：使用方向键控制蛇的移动方向',
                'snake.controlsTouch': '触屏：在屏幕上滑动手指控制方向',
                'snake.controlsSpace': '空格键：暂停/继续游戏',
                'snake.rules': '游戏规则',
                'snake.ruleAutoMove': '贪吃蛇会自动向前移动',
                'snake.ruleGrow': '吃掉红色食物后，蛇身会增长一节',
                'snake.ruleGameOver': '撞到墙壁或自己的身体会游戏结束',
                'snake.ruleScore': '每吃一个食物得10分',
                'snake.tips': '技巧提示',
                'snake.tipStraight': '尽量保持蛇身直线移动，避免不必要的转弯',
                'snake.tipBoundaries': '利用边界反弹来规划移动路线',
                'snake.tipLength': '注意观察蛇身长度，避免撞到自己',
                'snake.tipFood': '合理规划食物的吃取顺序',
                'snake.tipCalm': '保持冷静，不要因为高分而急躁',

                // 俄语公告
                'russianNotice.title': '重要公告',
                'russianNotice.content': '本网站与 woodcat.io 无任何关联。我们是一个独立的小游戏合集网站，与其他任何使用类似名称的网站无关。',
                'russianNotice.highlight': '请勿混淆',
                'russianNotice.confirm': '我明白了'
            },
            'ru': {
                // 网站通用文本
                'site.title': 'Деревянная Кошка - Сборник мини-игр',
                'site.slogan': 'Откройте для себя интересные мини-игры',
                'nav.home': 'Главная',
                'nav.games': 'Игры',
                'nav.leaderboard': 'Рейтинг',
                'hero.title': 'Добро пожаловать в мир игр Деревянной Кошки',
                'hero.description': 'Здесь вы найдете различные классические и интересные мини-игры, наслаждайтесь играми в любое время и в любом месте.',
                'hero.startGame': 'Начать игру',
                'section.games': 'Избранные игры',
                'section.features': 'Особенности',
                'section.leaderboard': 'Рейтинг',
                
                // 功能特点
                'feature.richGames': 'Множество игр',
                'feature.richGames.desc': 'Включает в себя различные классические игры, удовлетворяющие предпочтения разных игроков',
                'feature.responsive': 'Адаптивный дизайн',
                'feature.responsive.desc': 'Идеально подходит для настольных компьютеров, планшетов и мобильных устройств',
                'feature.updates': 'Постоянные обновления',
                'feature.updates.desc': 'Регулярно добавляем новые игры, поддерживаем свежесть',
                
                // 排行榜
                'leaderboard.rank': 'Ранг',
                'leaderboard.player': 'Игрок',
                'leaderboard.score': 'Счёт',
                'leaderboard.game': 'Игра',
                'leaderboard.date': 'Дата',
                'leaderboard.loading': 'Загрузка рейтинга...',
                'leaderboard.empty': 'Нет данных рейтинга',
                
                // 提交分数模态框
                'modal.submitScore': 'Отправить счёт',
                'modal.yourScore': 'Ваш счёт:',
                'modal.game': 'Игра:',
                'modal.playerName': 'Введите ваше имя:',
                'modal.placeholder': 'Введите имя',
                'modal.submit': 'Отправить',
                'modal.cancel': 'Отмена',
                
                // 通用按钮和文本
                'btn.play': 'Начать игру',
                'btn.newGame': 'Новая игра',
                'btn.restart': 'Начать заново',
                'btn.pause': 'Пауза',
                'btn.resume': 'Продолжить',
                'btn.reset': 'Сброс',
                'btn.back': 'Назад',
                'btn.tutorial': 'Инструкции по игре',
                'difficulty.easy': 'Легко',
                'difficulty.medium': 'Средне',
                'difficulty.hard': 'Сложно',
                'players.1': '1 игрок',
                'players.2': '2 игрока',
                
                // 游戏名称
                'game.tetris': 'Тетрис',
                'game.snake': 'Змейка',
                'game.minesweeper': 'Сапёр',
                'game.2048': '2048',
                'game.chess': 'Шахматы',
                'game.checkers': 'Шашки',
                'game.tic-tac-toe': 'Крестики-нолики',
                'game.memory-card': 'Карточная память',
                'game.arkanoid': 'Арканоид',
                'game.spider-solitaire': 'Пасьянс Паутина',
                
                // 游戏描述
                'game.tetris.desc': 'Классическая головоломка',
                'game.snake.desc': 'Классическая ностальгическая игра',
                'game.minesweeper.desc': 'Испытайте логическое мышление',
                'game.2048.desc': 'Вызов объединения чисел',
                'game.chess.desc': 'Стратегическая игра',
                'game.checkers.desc': 'Классическая игра для двоих',
                'game.tic-tac-toe.desc': 'Классическая стратегическая игра',
                'game.memory-card.desc': 'Проверьте память',
                'game.arkanoid.desc': 'Классическая аркадная игра',
                'game.spider-solitaire.desc': 'Классическая карточная игра',
                'game.tank-battle': 'Битва танков',
                'game.tank-battle.desc': 'Классическая игра с танками',
                
                // 蜘蛛卡牌游戏
                'spiderSolitaire.title': 'Пасьянс Паутина',
                'spiderSolitaire.score': 'Счёт',
                'spiderSolitaire.time': 'Время',
                'spiderSolitaire.moves': 'Ходы',
                'spiderSolitaire.newGame': 'Новая игра',
                'spiderSolitaire.undo': 'Отменить',
                'spiderSolitaire.hint': 'Подсказка',
                'spiderSolitaire.stockPile': 'Раздать карты',
                'spiderSolitaire.gameOver': 'Игра окончена!',
                'spiderSolitaire.finalScore': 'Финальный счёт: ',
                'spiderSolitaire.totalTime': 'Общее время: ',
                'spiderSolitaire.totalMoves': 'Всего ходов: ',
                'spiderSolitaire.playAgain': 'Сыграть снова',
                'spiderSolitaire.backToMenu': 'Вернуться в меню',
                
                // 游戏状态
                'game.score': 'Счёт',
                'game.highScore': 'Рекорд',
                'game.lives': 'Жизни',
                'game.level': 'Уровень',
                'game.time': 'Время',
                'game.status': 'Состояние игры',
                'game.gameOver': 'Игра окончена',
                'game.youWin': 'Поздравляем с победой',
                'game.youLose': 'Игра проиграна',
                'game.draw': 'Ничья',
                'game.finalScore': 'Финальный счёт',
                'game.congratulations': 'Поздравляем!',
                'game.tryAgain': 'Попробуйте ещё раз!',

                // 2048游戏
                'game2048.intro': 'Сводите или используйте клавиши стрелок для объединения плиток с одинаковыми числами',
                'game2048.instructions': 'Сводите вверх↑ Сводите вниз↓ Сводите влево← Сводите вправо→',
                'game2048.gameOver': 'Игра окончена!',
                'game2048.youWin': 'Поздравляем! Вы достигли 2048!',

                // 井字棋游戏
                'tictactoe.mode': 'Режим игры:',
                'tictactoe.pvp': 'Два игрока',
                'tictactoe.pvc': 'Игрок против компьютера',
                'tictactoe.change': 'Изменить',
                'tictactoe.turn': 'Ход игрока X',
                'tictactoe.playerXTurn': 'Ход игрока X',
                'tictactoe.playerOTurn': 'Ход игрока O',
                'tictactoe.yourTurn': 'Ваш ход',
                'tictactoe.aiThinking': 'Компьютер думает...',
                'tictactoe.playerXWins': 'Игрок X',
                'tictactoe.playerOWins': 'Игрок O',
                'tictactoe.draws': 'Ничьи',
                'tictactoe.resetScores': 'Сбросить счёт',
                'tictactoe.gameOver': 'Игра окончена',
                'tictactoe.playerXWin': 'Игрок X победил!',
                'tictactoe.playerOWin': 'Игрок O победил!',
                'tictactoe.youWin': 'Вы победили!',
                'tictactoe.aiWin': 'Компьютер победил! Попробуйте ещё раз!',
                'tictactoe.draw': 'Ничья!',
                'tictactoe.selectMode': 'Выберите режим игры',
                'tictactoe.pvpDesc': 'Два игрока играют по очереди',
                'tictactoe.pvcDesc': 'Играйте против компьютера',

                // 打砖块游戏
                'arkanoid.score': 'Счёт',
                'arkanoid.lives': 'Жизни',
                'arkanoid.level': 'Уровень',
                'arkanoid.highScore': 'Рекорд',
                'arkanoid.gameOver': 'Игра окончена',
                'arkanoid.finalScore': 'Финальный счёт',
                'arkanoid.congrats': 'Поздравляем с прохождением',
                'arkanoid.winScore': 'Финальный счёт',
                'arkanoid.nextLevel': 'Следующий уровень',
                'arkanoid.start': 'Начать игру',
                'arkanoid.pause': 'Пауза',
                'arkanoid.resume': 'Продолжить',
                'arkanoid.restart': 'Начать заново',
                'arkanoid.hint': 'Используйте клавиши ← →, мышь или свайпы для управления ракеткой',
                'arkanoid.mobileHint': '💡 Подсказка: свайп влево/вправо для управления ракеткой',

                // 扫雷游戏
                'minesweeper.score': 'Счёт',
                'minesweeper.flags': 'Флаги',
                'minesweeper.time': 'Время',
                'minesweeper.bestTime': 'Лучшее время',
                'minesweeper.easy': 'Легко (10×10)',
                'minesweeper.medium': 'Средне (15×15)',
                'minesweeper.hard': 'Сложно (20×20)',
                'minesweeper.newGame': 'Новая игра',
                'minesweeper.gameOver': 'Игра окончена',
                'minesweeper.youWin': 'Поздравляем! Вы успешно очистили все мины!',
                'minesweeper.timeSpent': 'Время',

                // 版权
                'copyright': '© 2026 Деревянная Кошка - Все права защищены',

                // 排行榜页面
                'leaderboard.maintenance.title': 'Функция рейтинга на техническом обслуживании',
                'leaderboard.maintenance.message': 'Дорогой игрок, функция рейтинга в данный момент проходит техническое обслуживание и обновление. Она скоро вернется в нормальное состояние. Спасибо за ваше понимание и поддержку!',
                'leaderboard.totalGames': 'Всего игр',
                'leaderboard.wins': 'Побед',
                'leaderboard.losses': 'Поражений',
                'leaderboard.winRate': 'Процент побед',
                'leaderboard.totalScore': 'Общий счёт',
                'leaderboard.resetAll': 'Сбросить все игровые данные',
                'leaderboard.resetConfirm': 'Вы уверены, что хотите сбросить статистику всех игр? Это действие нельзя отменить!',
                'leaderboard.resetSuccess': 'Успешно сбросили статистику {count} игр',
                'leaderboard.resetFailed': 'Сброс не удалось, попробуйте позже',
                'leaderboard.loadingFailed': 'Загрузка не удалась, попробуйте позже',

                // 贪吃蛇游戏
                'snake.selectMode': 'Выберите режим игры',
                'snake.singlePlayer': 'Одиночный режим',
                'snake.aiBattle': 'Режим с ИИ',
                'snake.selectModeDesc': 'Выберите режим игры, чтобы начать',
                'snake.length': 'Длина',
                'snake.aiScore': 'Счёт ИИ',
                'snake.aiLength': 'Длина ИИ',
                'snake.ready': 'Готов',
                'snake.controls': 'Используйте клавиши ← → ↑ ↓ или жесты касания для управления',
                'snake.playAgain': 'Играть снова',
                'snake.changeMode': 'Сменить режим',
                'snake.objective': 'Цель игры',
                'snake.objectiveDesc': 'Управляйте змейкой, чтобы съедать еду, расти и набирать очки!',
                'snake.controlsTitle': 'Способы управления',
                'snake.controlsKeyboard': 'Клавиатура: используйте клавиши со стрелками для управления направлением змейки',
                'snake.controlsTouch': 'Тачскрин: проведите пальцем по экрану для управления',
                'snake.controlsSpace': 'Пробел: пауза/продолжение игры',
                'snake.rules': 'Правила игры',
                'snake.ruleAutoMove': 'Змейка двигается автоматически вперёд',
                'snake.ruleGrow': 'После съедания красной еды змейка вырастает',
                'snake.ruleGameOver': 'Игра заканчивается, если змейка врежется в стену или в себя',
                'snake.ruleScore': 'За каждую съеденную еду вы получаете 10 очков',
                'snake.tips': 'Советы',
                'snake.tipStraight': 'Постарайтесь держать змейку прямым, избегая ненужных поворотов',
                'snake.tipBoundaries': 'Используйте отскоки от границ для планирования маршрута',
                'snake.tipLength': 'Следите за длиной змейки, чтобы не врезаться в себя',
                'snake.tipFood': 'Разумно планируйте порядок поедания еды',
                'snake.tipCalm': 'Будьте спокойны и не спешите из-за высоких очков',

                // 俄语公告
                'russianNotice.title': 'Важное уведомление',
                'russianNotice.content': 'Этот веб-сайт не связан с woodcat.io. Мы являемся независимым веб-сайтом с коллекцией мини-игр и не связаны ни с каким другим веб-сайтом, использующим похожее название.',
                'russianNotice.highlight': 'Не путайте',
                'russianNotice.confirm': 'Я понял'
            }
        };
        
        // 初始化当前语言
        this.currentLang = this.detectLanguage();
        
        // 延迟初始化语言，确保DOM已加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initLanguage();
            });
        } else {
            this.initLanguage();
        }
    }
    
    /**
     * 检测浏览器语言
     */
    detectLanguage() {
        // 确保translations对象存在
        if (!this.translations) {
            // 使用console而不是Logger，因为Logger可能还未初始化
            console.error('translations对象未初始化');
            return 'zh-CN';
        }
        
        const savedLang = localStorage.getItem('woodcat_lang');
        if (savedLang && this.translations[savedLang]) {
            return savedLang;
        }
        
        try {
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang && browserLang.startsWith('ru')) {
                return 'ru';
            }
        } catch (error) {
            // 使用console而不是Logger，因为Logger可能还未初始化
            console.error('检测浏览器语言时出错:', error);
        }
        
        return 'zh-CN';
    }
    
    /**
     * 初始化语言设置
     */
    initLanguage() {
        // 设置HTML语言属性
        document.documentElement.lang = this.currentLang;
        
        // 应用翻译
        this.applyTranslations();
    }
    
    /**
     * 获取翻译文本
     * @param {string} key - 翻译键
     * @returns {string} 翻译后的文本
     */
    t(key) {
        if (!this.translations || !this.translations[this.currentLang]) {
            return key;
        }
        const lang = this.translations[this.currentLang];
        return lang[key] || key;
    }
    
    /**
     * 切换语言
     * @param {string} lang - 语言代码
     */
    setLanguage(lang) {
        console.log('i18n.setLanguage called with:', lang);
        if (this.translations[lang]) {
            this.currentLang = lang;
            console.log('Current language updated to:', this.currentLang);
            localStorage.setItem('woodcat_lang', lang);
            console.log('Language saved to localStorage:', lang);
            document.documentElement.lang = lang;
            console.log('HTML lang attribute updated:', lang);
            this.applyTranslations();
            console.log('Translations applied');
            
            // 触发语言切换事件
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
            console.log('Language changed event dispatched');

            // 如果切换到俄语且未显示过公告，则显示公告
            if (lang === 'ru' && !this.hasShownRussianNotice()) {
                this.showRussianNotice();
                console.log('Russian notice shown');
            }
        } else {
            console.log('Language not found:', lang);
        }
    }

    /**
     * 检查是否已显示过俄语公告
     * @returns {boolean}
     */
    hasShownRussianNotice() {
        return localStorage.getItem('woodcat_russian_notice_shown') === 'true';
    }

    /**
     * 显示俄语公告
     */
    showRussianNotice() {
        const modal = document.getElementById('russian-notice-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // 标记已显示过
            localStorage.setItem('woodcat_russian_notice_shown', 'true');
            
            // 绑定关闭事件
            const closeBtn = document.getElementById('russian-notice-close');
            const confirmBtn = document.getElementById('russian-notice-confirm');
            
            const closeModal = () => {
                modal.style.display = 'none';
            };
            
            // 移除旧的事件监听器（避免重复绑定）
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', closeModal);
            
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            newConfirmBtn.addEventListener('click', closeModal);
            
            // 点击遮罩层关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // ESC键关闭
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        }
    }
    
    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    /**
     * 应用翻译到页面
     */
    applyTranslations() {
        // 翻译带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // 翻译带有data-i18n-placeholder属性的元素
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // 翻译带有data-i18n-title属性的元素
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    }
    
    /**
     * 获取所有可用语言
     * @returns {Array} 语言代码数组
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
    
    /**
     * 获取语言名称
     * @param {string} lang - 语言代码
     * @returns {string} 语言名称
     */
    getLanguageName(lang) {
        const names = {
            'zh-CN': '简体中文',
            'ru': 'Русский'
        };
        return names[lang] || lang;
    }
    
    /**
     * 初始化方法（兼容调用）
     */
    init() {
        this.initLanguage();
    }
}

// 创建全局实例
const i18n = new I18n();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
} else {
    window.I18n = I18n;
    window.i18n = i18n;
}

// 确保i18n对象在全局可用
if (typeof window !== 'undefined') {
    window.i18n = i18n;
}