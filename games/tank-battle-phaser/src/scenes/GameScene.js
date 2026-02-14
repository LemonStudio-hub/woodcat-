import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player1 = null;
        this.player2 = null;
        this.enemies = [];
        this.bullets = [];
        this.bulletGroup = null;
        this.obstacles = [];
        this.score = 0;
        this.level = 1;
        this.enemiesDefeated = 0;
        this.enemiesToDefeat = 5;
        this.gameStarted = false;
        this.gameTime = 0;
        this.isPaused = false;
        this.bulletPool = [];
        this.particlePool = [];
        this.textPool = [];
        this.healthBarElements = [];
        this.lastHealthBarUpdate = 0;
        
        // 性能优化缓存
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.uiScale = 1;
        this.isMobile = false;
        
        // 坦克轨迹效果
        this.player1Trail = [];
        this.player2Trail = [];
        this.maxTrailLength = 10;
    }
    
    create() {
        // 性能优化：缓存屏幕尺寸和设备类型
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;
        this.isMobile = this.screenWidth < 600;
        this.uiScale = this.isMobile ? 0.7 : 1;
        
        // 设置背景
        this.cameras.main.setBackgroundColor('#1a1a1a');
        
        // 添加背景纹理
        this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background')
            .setDisplaySize(this.screenWidth, this.screenHeight);
        
        // 初始化音效系统
        this.initAudioSystem();
        
        // 创建子弹物理组
        this.bulletGroup = this.physics.add.group({
            runChildUpdate: true
        });
        
        // 初始化对象池
        this.initObjectPools();
        
        // 创建游戏地图
        this.createMap();
        
        // 创建玩家坦克
        this.createPlayers();
        
        // 创建敌人坦克
        this.createEnemies();
        
        // 创建UI
        this.createUI();
        
        // 设置输入控制
        this.setupControls();
        
        // 设置物理碰撞
        this.setupCollisions();
        
        // 播放游戏开始音效
        this.playSound('gameStart');
        
        // 开始游戏
        this.gameStarted = true;
    }
    
    update(time, delta) {
        if (!this.gameStarted || this.isPaused) return;
        
        // 更新游戏时间
        this.gameTime += delta;
        
        // 更新玩家坦克
        this.updatePlayers();
        
        // 更新敌人坦克
        this.updateEnemies();
        
        // 更新子弹
        this.updateBullets();
        
        // 更新移动端控制
        this.updateMobileControls();
        
        // 检查关卡完成
        this.checkLevelComplete();
    }
    
    createMap() {
        // 创建地图边界 - 合并为一个staticGroup以提高性能
        this.walls = this.physics.add.staticGroup();
        
        this.walls.create(this.screenWidth / 2, 0, 'wall')
            .setScale(this.screenWidth, 1)
            .refreshBody();
        
        this.walls.create(this.screenWidth / 2, this.screenHeight, 'wall')
            .setScale(this.screenWidth, 1)
            .refreshBody();
        
        this.walls.create(0, this.screenHeight / 2, 'wall')
            .setScale(1, this.screenHeight)
            .refreshBody();
        
        this.walls.create(this.screenWidth, this.screenHeight / 2, 'wall')
            .setScale(1, this.screenHeight)
            .refreshBody();
        
        // 创建障碍物
        this.obstacles = this.physics.add.staticGroup();
        
        // 随机创建障碍物
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(100, this.screenWidth - 100);
            const y = Phaser.Math.Between(100, this.screenHeight - 100);
            
            this.obstacles.create(x, y, 'wall')
                .setScale(0.5)
                .refreshBody();
        }
        
        // 创建网格背景 - 缓存为纹理以提高性能
        const gridSize = 40;
        const graphics = this.add.graphics();
        
        graphics.lineStyle(1, 0x34495e, 0.3);
        
        for (let x = 0; x <= this.screenWidth; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.screenHeight);
        }
        
        for (let y = 0; y <= this.screenHeight; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.screenWidth, y);
        }
        
        graphics.strokePath();
        
        // 生成纹理并缓存
        graphics.generateTexture('gridBackground', this.screenWidth, this.screenHeight);
        
        // 添加网格背景
        this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'gridBackground');
        
        // 销毁临时graphics对象
        graphics.destroy();
    }
    
    createPlayers() {
        // 创建玩家1坦克
        this.player1 = this.physics.add.sprite(100, 100, 'tank-player1')
            .setScale(0.5)
            .setRotation(-Math.PI / 2) // 初始朝向上方
            .setDrag(1200)
            .setAngularDrag(1500);
        
        this.player1.turret = this.physics.add.sprite(this.player1.x, this.player1.y, 'tank-turret')
            .setScale(0.5)
            .setOrigin(0.3, 0.5);
        
        this.player1.health = 100;
        this.player1.score = 0;
        this.player1.alive = true;
        this.player1.maxHealth = 100;
        
        // 添加玩家发光效果容器
        this.player1Glow = this.add.circle(0, 0, 40, 0x3498db, 0.3);
        this.player1Glow.setScrollFactor(0);
        this.player1Glow.setVisible(false);
        
        // 如果是双人模式，创建玩家2坦克
        if (this.game.gameState.gameMode === 'two-player') {
            this.player2 = this.physics.add.sprite(this.cameras.main.width - 100, this.cameras.main.height - 100, 'tank-player2')
                .setScale(0.5)
                .setRotation(-Math.PI / 2) // 初始朝向上方
                .setDrag(1000)
                .setAngularDrag(1000);
            
            this.player2.turret = this.physics.add.sprite(this.player2.x, this.player2.y, 'tank-turret')
                .setScale(0.5)
                .setOrigin(0.3, 0.5);
            
            this.player2.health = 100;
            this.player2.score = 0;
            this.player2.alive = true;
            this.player2.maxHealth = 100;
            
            // 添加玩家2发光效果容器
            this.player2Glow = this.add.circle(0, 0, 40, 0xe74c3c, 0.3);
            this.player2Glow.setScrollFactor(0);
            this.player2Glow.setVisible(false);
        }
    }
    
    createEnemies() {
        this.enemies = this.physics.add.group();
        
        // 根据难度和关卡创建敌人
        const difficulty = this.game.gameState.settings.difficulty;
        let enemyCount = 5;
        
        switch (difficulty) {
            case 'easy':
                enemyCount = 3;
                break;
            case 'medium':
                enemyCount = 5;
                break;
            case 'hard':
                enemyCount = 8;
                break;
        }
        
        // 随关卡增加敌人数量
        enemyCount += Math.floor((this.level - 1) * 1.5);
        
        this.enemiesToDefeat = enemyCount;
        
        // 根据难度和关卡调整敌人属性
        const baseSpeed = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 80 : 120;
        const baseHealth = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 80;
        const baseFireRate = difficulty === 'easy' ? 3000 : difficulty === 'medium' ? 2000 : 1500;
        
        // 随关卡增加敌人能力
        const speedMultiplier = 1 + (this.level - 1) * 0.1;
        const healthMultiplier = 1 + (this.level - 1) * 0.15;
        
        for (let i = 0; i < enemyCount; i++) {
            const x = Phaser.Math.Between(200, this.screenWidth - 200);
            const y = Phaser.Math.Between(200, this.screenHeight - 200);
            
            const enemy = this.physics.add.sprite(x, y, 'tank-enemy')
                .setScale(0.5)
                .setDrag(1000)
                .setAngularDrag(1000);
            
            enemy.turret = this.physics.add.sprite(enemy.x, enemy.y, 'tank-turret')
                .setScale(0.5)
                .setOrigin(0.3, 0.5);
            
            enemy.health = Math.floor(baseHealth * healthMultiplier);
            enemy.maxHealth = enemy.health;
            enemy.alive = true;
            enemy.speed = Math.floor(baseSpeed * speedMultiplier);
            enemy.fireRate = baseFireRate - (this.level - 1) * 100;
            enemy.lastFired = 0;
            enemy.moveTimer = 0;
            enemy.moveInterval = Phaser.Math.Between(1000, 3000);
            enemy.targetAngle = Phaser.Math.Between(0, 360);
            enemy.aiMode = 'patrol'; // AI模式：patrol(巡逻)、chase(追逐)、evade(躲避)
            enemy.aiTimer = 0;
            enemy.lastKnownPlayerPos = null;
            
            this.enemies.add(enemy);
        }
    }
    
    createUI() {
        // 根据屏幕尺寸计算UI元素大小
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const isMobile = screenWidth < 600;
        
        const uiScale = isMobile ? 0.7 : 1;
        const uiPadding = 10 * uiScale;
        const uiBackgroundWidth = 320 * uiScale;
        const uiBackgroundHeight = 140 * uiScale;
        
        // 创建军事风格UI背景面板
        const uiBackground = this.add.graphics();
        uiBackground.fillStyle(0x1a1a2e, 0.8);
        uiBackground.fillRoundedRect(uiPadding, uiPadding, uiBackgroundWidth, uiBackgroundHeight, 10);
        uiBackground.lineStyle(2 * uiScale, 0x16213e, 1);
        uiBackground.strokeRoundedRect(uiPadding, uiPadding, uiBackgroundWidth, uiBackgroundHeight, 10);
        uiBackground.lineStyle(1 * uiScale, 0x0f3460, 1);
        uiBackground.strokeRoundedRect(uiPadding + 2, uiPadding + 2, uiBackgroundWidth - 4, uiBackgroundHeight - 4, 8);
        
        const textSize = 20 * uiScale;
        const textPadding = 20 * uiScale;
        
        // 创建分数文本
        this.scoreText = this.add.text(uiPadding + textPadding, uiPadding + textPadding * 0.75, `分数: ${this.score}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#e94560',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        });
        
        // 创建关卡文本
        this.levelText = this.add.text(uiPadding + textPadding, uiPadding + textPadding * 2.25, `关卡: ${this.level}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#0f3460',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        });
        
        // 创建敌人数量文本
        this.enemiesText = this.add.text(uiPadding + textPadding, uiPadding + textPadding * 3.75, `敌人: ${this.enemiesToDefeat - this.enemiesDefeated}/${this.enemiesToDefeat}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#16213e',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        });
        
        const healthBarY = screenHeight - 90 * uiScale;
        const healthBarWidth = 220 * uiScale;
        
        // 创建玩家1生命值条
        this.player1HealthBar = this.createHealthBar(uiPadding + textPadding, healthBarY, '玩家1', this.player1?.health || 100, 0x3498db, uiScale);
        
        // 创建玩家2生命值条（如果是双人模式）
        if (this.game.gameState.gameMode === 'two-player') {
            this.player2HealthBar = this.createHealthBar(screenWidth - healthBarWidth - uiPadding - textPadding, healthBarY, '玩家2', this.player2?.health || 100, 0xe74c3c, uiScale);
        }
        
        // 创建暂停按钮
        const pauseButtonWidth = 120 * uiScale;
        const pauseButtonHeight = 45 * uiScale;
        
        const pauseButtonBackground = this.add.graphics();
        pauseButtonBackground.fillStyle(0x16213e, 0.8);
        pauseButtonBackground.fillRoundedRect(screenWidth - pauseButtonWidth - uiPadding, uiPadding, pauseButtonWidth, pauseButtonHeight, 8);
        pauseButtonBackground.lineStyle(2 * uiScale, 0x0f3460, 1);
        pauseButtonBackground.strokeRoundedRect(screenWidth - pauseButtonWidth - uiPadding, uiPadding, pauseButtonWidth, pauseButtonHeight, 8);
        
        this.pauseButton = this.add.text(screenWidth - pauseButtonWidth / 2 - uiPadding, uiPadding + pauseButtonHeight / 2, '暂停', {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            fontWeight: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            // 按钮按下效果
            this.tweens.add({
                targets: [this.pauseButton, pauseButtonBackground],
                scale: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.pauseGame();
                }
            });
        })
        .on('pointerover', () => {
            // 鼠标悬停效果
            this.pauseButton.setFill('#e94560');
            pauseButtonBackground.clear();
            pauseButtonBackground.fillStyle(0x0f3460, 0.9);
            pauseButtonBackground.fillRoundedRect(screenWidth - pauseButtonWidth - uiPadding, uiPadding, pauseButtonWidth, pauseButtonHeight, 8);
            pauseButtonBackground.lineStyle(2 * uiScale, 0xe94560, 1);
            pauseButtonBackground.strokeRoundedRect(screenWidth - pauseButtonWidth - uiPadding, uiPadding, pauseButtonWidth, pauseButtonHeight, 8);
        })
        .on('pointerout', () => {
            // 鼠标离开效果
            this.pauseButton.setFill('#ffffff');
            pauseButtonBackground.clear();
            pauseButtonBackground.fillStyle(0x16213e, 0.8);
            pauseButtonBackground.fillRoundedRect(screenWidth - pauseButtonWidth - uiPadding, uiPadding, pauseButtonWidth, pauseButtonHeight, 8);
            pauseButtonBackground.lineStyle(2 * uiScale, 0x0f3460, 1);
            pauseButtonBackground.strokeRoundedRect(screenWidth - pauseButtonWidth - uiPadding, uiPadding, pauseButtonWidth, pauseButtonHeight, 8);
        });
        
        // 添加UI进入动画
        this.addUIEnterAnimations([uiBackground, this.scoreText, this.levelText, this.enemiesText, this.pauseButton, pauseButtonBackground]);
    }
    
    addUIEnterAnimations(elements) {
        // 添加UI元素进入动画
        elements.forEach((element, index) => {
            if (element) {
                element.setAlpha(0);
                element.setY(element.y - 20);
                
                this.tweens.add({
                    targets: element,
                    alpha: 1,
                    y: element.y + 20,
                    duration: 500,
                    delay: index * 50,
                    ease: 'Cubic.easeOut'
                });
            }
        });
    }
    
    createHealthBar(x, y, label, value, color, uiScale = 1) {
        const healthBarWidth = 220 * uiScale;
        const healthBarHeight = 35 * uiScale;
        const textSize = 16 * uiScale;
        
        const elements = [];
        
        // 创建生命值背景（军事风格）
        const healthBarBackground = this.add.graphics();
        healthBarBackground.fillStyle(0x16213e, 0.8);
        healthBarBackground.fillRoundedRect(x, y, healthBarWidth, healthBarHeight, 5);
        healthBarBackground.lineStyle(2 * uiScale, 0x0f3460, 1);
        healthBarBackground.strokeRoundedRect(x, y, healthBarWidth, healthBarHeight, 5);
        elements.push(healthBarBackground);
        
        // 创建生命值文本
        const labelText = this.add.text(x + 12 * uiScale, y + 8 * uiScale, `${label}:`, {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        });
        elements.push(labelText);
        
        // 创建生命值条背景
        const barBackground = this.add.graphics();
        barBackground.fillStyle(0x1a1a2e, 0.8);
        barBackground.fillRoundedRect(x + 90 * uiScale, y + 7 * uiScale, 120 * uiScale, 20 * uiScale, 3);
        barBackground.lineStyle(1 * uiScale, 0x0f3460, 1);
        barBackground.strokeRoundedRect(x + 90 * uiScale, y + 7 * uiScale, 120 * uiScale, 20 * uiScale, 3);
        elements.push(barBackground);
        
        // 创建生命值条
        const healthBar = this.add.graphics();
        const barWidth = 120 * uiScale * (value / 100);
        healthBar.fillStyle(color, 0.9);
        healthBar.fillRoundedRect(x + 90 * uiScale, y + 7 * uiScale, barWidth, 20 * uiScale, 3);
        healthBar.lineStyle(1 * uiScale, 0xffffff, 1);
        healthBar.strokeRoundedRect(x + 90 * uiScale, y + 7 * uiScale, barWidth, 20 * uiScale, 3);
        elements.push(healthBar);
        
        // 添加生命值条动画
        this.tweens.add({
            targets: healthBar,
            width: barWidth,
            duration: 300,
            ease: 'Cubic.easeOut'
        });
        
        // 创建生命值数值
        const healthText = this.add.text(x + 200 * uiScale, y + 8 * uiScale, `${value}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'right',
            fontWeight: 'bold'
        });
        elements.push(healthText);
        
        // 添加生命值变化动画
        this.tweens.add({
            targets: healthText,
            scale: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Cubic.easeOut'
        });
        
        return elements;
    }
    
    setupControls() {
        // 玩家1控制（WASD移动，鼠标瞄准和开火）
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        
        // 鼠标控制
        this.input.on('pointermove', (pointer) => {
            if (this.player1 && this.player1.alive) {
                const angle = Phaser.Math.Angle.Between(
                    this.player1.x, this.player1.y,
                    pointer.x, pointer.y
                );
                this.player1.turret.rotation = angle;
            }
        });
        
        // 鼠标点击开火 - 添加冷却时间
        this.input.on('pointerdown', (pointer) => {
            if (this.player1 && this.player1.alive && !this.isPaused) {
                const now = this.time.now;
                
                // 检查是否点击了开火按钮，避免重复开火
                if (this.attackButton && this.attackButton.input && 
                    this.attackButton.input.enabled && 
                    pointer.x >= this.attackButton.x - this.attackButton.displayWidth / 2 &&
                    pointer.x <= this.attackButton.x + this.attackButton.displayWidth / 2 &&
                    pointer.y >= this.attackButton.y - this.attackButton.displayHeight / 2 &&
                    pointer.y <= this.attackButton.y + this.attackButton.displayHeight / 2) {
                    // 点击了开火按钮，不处理
                    return;
                }
                
                // 添加开火冷却时间
                if (!this.player1.lastFireTime || now - this.player1.lastFireTime >= 300) {
                    this.fireBullet(this.player1, this.player1.turret.rotation);
                    this.player1.lastFireTime = now;
                }
            }
        });
        
        // 玩家2控制（方向键移动，小键盘控制炮塔和开火）
        if (this.game.gameState.gameMode === 'two-player') {
            this.keys2 = this.input.keyboard.addKeys({
                up2: Phaser.Input.Keyboard.KeyCodes.UP,
                down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                fire2: Phaser.Input.Keyboard.KeyCodes.NUMPAD_5,
                turretLeft: Phaser.Input.Keyboard.KeyCodes.NUMPAD_4,
                turretRight: Phaser.Input.Keyboard.KeyCodes.NUMPAD_6
            });
        }
        
        // 添加移动端适配
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // 检查是否为移动设备
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            console.log('检测到移动设备，启用虚拟控制');
            this.createVirtualControls();
            
            // 添加触摸事件优化
            this.setupTouchOptimizations();
        }
    }
    
    setupTouchOptimizations() {
        // 防止移动端双击缩放
        const gameCanvas = this.sys.canvas;
        gameCanvas.style.touchAction = 'none';
        
        // 优化触摸事件处理
        this.input.topOnly = true;
        this.input.maxPointers = 5; // 支持多点触控
        
        // 添加触摸反馈配置
        this.touchFeedback = {
            vibrationEnabled: true,
            hapticIntensity: 'medium'
        };
    }
    
    createVirtualControls() {
        // 根据屏幕尺寸计算控制元素大小和位置
        const screenWidth = this.screenWidth;
        const screenHeight = this.screenHeight;
        const controlScale = Math.min(screenWidth, screenHeight) / 768; // 基于768px屏幕尺寸缩放
        
        // 摇杆配置 - 增大触控区域
        const joystickSize = 60 * controlScale;
        const joystickHandleSize = 30 * controlScale;
        const joystickX = joystickSize + 20 * controlScale;
        const joystickY = screenHeight - joystickSize - 20 * controlScale;
        
        // 攻击按钮配置 - 增大触控区域
        const attackButtonSize = 50 * controlScale;
        const attackButtonHandleSize = 40 * controlScale;
        const attackButtonX = screenWidth - attackButtonSize - 20 * controlScale;
        const attackButtonY = screenHeight - attackButtonSize - 20 * controlScale;
        
        // 创建更大的虚拟摇杆背景触控区域（增大50%以便更容易触摸）
        const joystickTouchZone = this.add.graphics();
        joystickTouchZone.fillStyle(0x000000, 0); // 透明
        joystickTouchZone.fillCircle(joystickX, joystickY, joystickSize * 1.5);
        joystickTouchZone.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', (pointer) => {
                // 点击摇杆区域时立即激活
                this.joystickActive = true;
                this.updateJoystickPosition(pointer.x, pointer.y, joystickX, joystickY, maxDistance, joystick);
            });
        
        // 创建虚拟摇杆背景
        const joystickBackground = this.add.graphics();
        joystickBackground.fillStyle(0x222222, 0.6);
        joystickBackground.lineStyle(2, 0x444444, 1);
        joystickBackground.fillCircle(joystickX, joystickY, joystickSize);
        joystickBackground.strokeCircle(joystickX, joystickY, joystickSize);
        joystickBackground.setScrollFactor(0);
        
        // 添加摇杆方向指示
        const joystickCenter = this.add.circle(joystickX, joystickY, joystickSize * 0.3, 0x555555, 0.5);
        joystickCenter.setScrollFactor(0);
        
        // 创建虚拟摇杆
        this.joystick = this.add.circle(joystickX, joystickY, joystickHandleSize, 0x3498db, 0.9);
        this.joystick.setStrokeStyle(2, 0x2980b9);
        this.joystick.setScrollFactor(0);
        this.joystick.setInteractive({ cursor: 'pointer' });
        
        // 添加摇杆阴影效果
        this.joystick.shadowColor = '#000000';
        this.joystick.shadowBlur = 10;
        this.joystick.shadowOffsetX = 2;
        this.joystick.shadowOffsetY = 2;
        
        // 摇杆输入处理 - 改进响应性
        this.input.setDraggable(this.joystick);
        
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            this.updateJoystickPosition(dragX, dragY, joystickX, joystickY, joystickSize, gameObject);
        });
        
        this.input.on('dragend', (pointer, gameObject) => {
            this.joystickActive = false;
            gameObject.setPosition(joystickX, joystickY);
        });
        
        // 创建更大的攻击按钮触控区域
        const attackButtonTouchZone = this.add.graphics();
        attackButtonTouchZone.fillStyle(0x000000, 0); // 透明
        attackButtonTouchZone.fillCircle(attackButtonX, attackButtonY, attackButtonSize * 1.5);
        attackButtonTouchZone.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                this.handleAttackButtonPress();
            });
        
        // 创建攻击按钮背景
        const attackButtonBackground = this.add.graphics();
        attackButtonBackground.fillStyle(0x222222, 0.6);
        attackButtonBackground.lineStyle(3, 0x444444, 1);
        attackButtonBackground.fillCircle(attackButtonX, attackButtonY, attackButtonSize);
        attackButtonBackground.strokeCircle(attackButtonX, attackButtonY, attackButtonSize);
        attackButtonBackground.setScrollFactor(0);
        
        // 创建攻击按钮
        this.attackButton = this.add.circle(attackButtonX, attackButtonY, attackButtonHandleSize, 0xe74c3c, 0.95);
        this.attackButton.setStrokeStyle(3, 0xc0392b);
        this.attackButton.setScrollFactor(0);
        this.attackButton.setInteractive({ cursor: 'pointer' });
        
        // 添加攻击按钮阴影效果
        this.attackButton.shadowColor = '#000000';
        this.attackButton.shadowBlur = 12;
        this.attackButton.shadowOffsetX = 3;
        this.attackButton.shadowOffsetY = 3;
        
        // 添加攻击按钮图标
        this.attackIcon = this.add.text(attackButtonX, attackButtonY, '🎯', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, 22 * controlScale) + 'px',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 攻击按钮点击处理
        this.attackButton.on('pointerdown', () => {
            this.handleAttackButtonPress();
        });
        
        // 攻击按钮释放效果
        this.attackButton.on('pointerup', () => {
            this.handleAttackButtonRelease();
        });
        
        // 攻击按钮移出效果
        this.attackButton.on('pointerout', () => {
            this.handleAttackButtonRelease();
        });
        
        // 保存控制配置以便在updateMobileControls中使用
        this.controlConfig = {
            joystickX,
            joystickY,
            maxDistance: joystickSize
        };
        
        // 初始化摇杆状态
        this.joystickActive = false;
    }
    
    updateJoystickPosition(dragX, dragY, baseX, baseY, maxDistance, gameObject) {
        // 计算距离
        const deltaX = dragX - baseX;
        const deltaY = dragY - baseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance <= maxDistance) {
            gameObject.setPosition(dragX, dragY);
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            const newX = baseX + Math.cos(angle) * maxDistance;
            const newY = baseY + Math.sin(angle) * maxDistance;
            gameObject.setPosition(newX, newY);
        }
    }
    
    handleAttackButtonPress() {
        if (this.player1 && this.player1.alive && !this.isPaused) {
            const now = this.time.now;
            
            // 添加开火冷却时间 (300ms)
            if (!this.player1.lastFireTime || now - this.player1.lastFireTime >= 300) {
                this.fireBullet(this.player1, this.player1.turret.rotation);
                this.player1.lastFireTime = now;
                
                // 按钮按下效果 - 缩小
                this.tweens.add({
                    targets: [this.attackButton, this.attackIcon],
                    scale: 0.85,
                    duration: 80,
                    ease: 'Cubic.easeOut'
                });
                
                // 添加闪光效果
                const flash = this.add.circle(
                    this.controlConfig.joystickX || this.screenWidth / 2,
                    this.controlConfig.joystickY || this.screenHeight / 2,
                    40 * 1.5,
                    0xff6b6b,
                    0.8
                );
                flash.setScrollFactor(0);
                this.tweens.add({
                    targets: flash,
                    scale: 2,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => flash.destroy()
                });
                
                // 添加开火震动反馈
                this.vibrate([30, 20, 30]);
            } else {
                // 冷却中的视觉反馈 - 轻微闪烁
                this.tweens.add({
                    targets: this.attackButton,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true,
                    ease: 'Cubic.easeOut'
                });
            }
        }
    }
    
    handleAttackButtonRelease() {
        this.tweens.add({
            targets: [this.attackButton, this.attackIcon],
            scale: 1,
            duration: 100,
            ease: 'Back.easeOut'
        });
    }
    
    updateMobileControls() {
        if (!this.isMobile || !this.joystick || !this.controlConfig || !this.player1 || !this.player1.alive) return;
        
        // 计算摇杆输入
        const joystickX = this.joystick.x;
        const joystickY = this.joystick.y;
        const baseX = this.controlConfig.joystickX;
        const baseY = this.controlConfig.joystickY;
        const maxDistance = this.controlConfig.maxDistance;
        
        const deltaX = joystickX - baseX;
        const deltaY = joystickY - baseY;
        
        // 使用距离平方比较避免sqrt计算，提高性能
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const deadZoneSquared = (maxDistance * 0.12) * (maxDistance * 0.12);
        const maxDistanceSquared = maxDistance * maxDistance;
        
        if (distanceSquared > deadZoneSquared) {
            // 只在需要时才计算实际距离
            const distance = Math.sqrt(distanceSquared);
            const moveAngle = Math.atan2(deltaY, deltaX);
            const moveSpeed = Math.min(distance / maxDistance, 1) * 180;
            
            // 更新坦克旋转朝向摇杆方向
            this.player1.rotation = moveAngle;
            
            // 设置速度
            this.physics.velocityFromRotation(moveAngle, moveSpeed, this.player1.body.velocity);
            
            // 保存当前移动方向，用于开火
            this.player1.lastMoveAngle = moveAngle;
            
            // 移动时的视觉效果
            this.player1.alpha = 0.9;
            
            // 摇杆缩放反馈
            const scale = 1 + (distance / maxDistance) * 0.3;
            this.joystick.setScale(scale);
        } else {
            // 停止移动
            this.player1.setVelocity(0);
            this.player1.setAngularVelocity(0);
            this.player1.alpha = 1;
            
            // 恢复摇杆大小
            this.joystick.setScale(1);
        }
        
        // 始终更新炮塔位置和旋转
        this.player1.turret.x = this.player1.x;
        this.player1.turret.y = this.player1.y;
        
        // 如果有保存的移动方向，使用它来设置炮塔方向
        if (this.player1.lastMoveAngle !== undefined) {
            this.player1.turret.rotation = this.player1.lastMoveAngle;
        }
    }
    
    setupCollisions() {
        // 先移除所有现有的碰撞检测
        if (this.physics.world) {
            this.physics.world.colliders.destroy();
        }
        
        // 坦克与障碍物碰撞
        this.physics.add.collider(this.player1, this.obstacles);
        if (this.player2) {
            this.physics.add.collider(this.player2, this.obstacles);
        }
        this.physics.add.collider(this.enemies, this.obstacles);
        this.physics.add.collider(this.player1, this.enemies);
        if (this.player2) {
            this.physics.add.collider(this.player2, this.enemies);
        }
        this.physics.add.collider(this.player1, this.player2);
        this.physics.add.collider(this.enemies, this.enemies);
        
        // 子弹碰撞 - 使用物理组
        this.physics.add.collider(this.bulletGroup, this.obstacles, this.bulletHitObstacle, null, this);
        this.physics.add.collider(this.bulletGroup, this.enemies, this.bulletHitEnemy, null, this);
        this.physics.add.collider(this.bulletGroup, this.player1, this.bulletHitPlayer1, null, this);
        if (this.player2) {
            this.physics.add.collider(this.bulletGroup, this.player2, this.bulletHitPlayer2, null, this);
        }
        
        console.log('碰撞检测已重新设置');
    }
    
    updatePlayers() {
        // 更新玩家1
        if (this.player1 && this.player1.alive) {
            // 添加冷却时间检测，避免按键重复触发
            const now = this.time.now;
            
            // 移动控制 - 改进响应性
            let moving = false;
            if (this.keys.up.isDown) {
                this.physics.velocityFromRotation(this.player1.rotation, 180, this.player1.body.velocity);
                moving = true;
            } else if (this.keys.down.isDown) {
                this.physics.velocityFromRotation(this.player1.rotation, -120, this.player1.body.velocity);
                moving = true;
            } else {
                this.player1.setVelocity(0);
            }
            
            // 转向控制 - 改进响应性
            if (this.keys.left.isDown) {
                this.player1.setAngularVelocity(-250);
            } else if (this.keys.right.isDown) {
                this.player1.setAngularVelocity(250);
            } else {
                this.player1.setAngularVelocity(0);
            }
            
            // 开火控制 - 添加冷却时间
            if (this.keys.space.isDown && !this.isPaused) {
                if (!this.player1.lastFireTime || now - this.player1.lastFireTime >= 300) {
                    this.fireBullet(this.player1, this.player1.turret.rotation);
                    this.player1.lastFireTime = now;
                }
            }
            
            // 更新炮塔位置
            this.player1.turret.x = this.player1.x;
            this.player1.turret.y = this.player1.y;
            
            // 更新发光效果位置
            if (this.player1Glow) {
                this.player1Glow.setPosition(this.player1.x, this.player1.y);
            }
            
            // 移动时的视觉效果
            if (moving) {
                this.player1.alpha = 0.9;
                if (this.player1Glow) {
                    this.player1Glow.setVisible(true);
                    this.player1Glow.setScale(1.1);
                }
                // 添加移动轨迹效果
                this.updatePlayerTrail(this.player1, this.player1Trail, 0x3498db);
                // 添加尾焰效果
                this.spawnExhaustParticle(this.player1);
            } else {
                this.player1.alpha = 1;
                if (this.player1Glow) {
                    this.player1Glow.setVisible(false);
                }
            }
            
            // 更新轨迹显示
            this.updateTrailDisplay(this.player1Trail);
            
            // 边界检测
            this.checkBoundary(this.player1);
        }
        
        // 更新玩家2
        if (this.player2 && this.player2.alive) {
            // 移动控制
            let moving2 = false;
            if (this.keys2.up2.isDown) {
                this.physics.velocityFromRotation(this.player2.rotation, 180, this.player2.body.velocity);
                moving2 = true;
            } else if (this.keys2.down2.isDown) {
                this.physics.velocityFromRotation(this.player2.rotation, -120, this.player2.body.velocity);
                moving2 = true;
            } else {
                this.player2.setVelocity(0);
            }
            
            // 转向
            if (this.keys2.left2.isDown) {
                this.player2.setAngularVelocity(-250);
            } else if (this.keys2.right2.isDown) {
                this.player2.setAngularVelocity(250);
            } else {
                this.player2.setAngularVelocity(0);
            }
            
            // 炮塔转向
            if (this.keys2.turretLeft.isDown) {
                this.player2.turret.rotation -= 0.06;
            } else if (this.keys2.turretRight.isDown) {
                this.player2.turret.rotation += 0.06;
            }
            
            // 开火 - 添加冷却时间
            if (this.keys2.fire2.isDown && !this.isPaused) {
                if (!this.player2.lastFireTime || now - this.player2.lastFireTime >= 300) {
                    this.fireBullet(this.player2, this.player2.turret.rotation);
                    this.player2.lastFireTime = now;
                }
            }
            
            // 更新炮塔位置
            this.player2.turret.x = this.player2.x;
            this.player2.turret.y = this.player2.y;
            
            // 更新发光效果位置
            if (this.player2Glow) {
                this.player2Glow.setPosition(this.player2.x, this.player2.y);
            }
            
            // 移动时的视觉效果
            if (moving2) {
                this.player2.alpha = 0.9;
                if (this.player2Glow) {
                    this.player2Glow.setVisible(true);
                    this.player2Glow.setScale(1.1);
                }
                // 添加移动轨迹效果
                this.updatePlayerTrail(this.player2, this.player2Trail, 0xe74c3c);
                // 添加尾焰效果
                this.spawnExhaustParticle(this.player2);
            } else {
                this.player2.alpha = 1;
                if (this.player2Glow) {
                    this.player2Glow.setVisible(false);
                }
            }
            
            // 更新轨迹显示
            this.updateTrailDisplay(this.player2Trail);
            
            // 边界检测
            this.checkBoundary(this.player2);
        }
    }
    
    updatePlayerTrail(player, trail, color) {
        // 添加当前位置到轨迹
        trail.push({
            x: player.x,
            y: player.y,
            rotation: player.rotation,
            alpha: 1
        });
        
        // 限制轨迹长度
        if (trail.length > this.maxTrailLength) {
            trail.shift();
        }
    }
    
    updateTrailDisplay(trail) {
        // 如果轨迹已经创建，先销毁
        if (this.trailGraphics) {
            this.trailGraphics.destroy();
        }
        
        // 创建新的轨迹图形
        this.trailGraphics = this.add.graphics();
        
        // 绘制轨迹
        for (let i = 0; i < trail.length; i++) {
            const point = trail[i];
            const alpha = (i / trail.length) * 0.3; // 越新的点越不透明
            
            this.trailGraphics.fillStyle(point.color || 0x3498db, alpha);
            this.trailGraphics.fillCircle(point.x, point.y, 3);
        }
    }
    
    spawnExhaustParticle(player) {
        // 每5帧生成一个尾焰粒子
        if (this.time.now % 100 < 17) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle && this.particlePool.length < 150) {
                particle = this.add.image(0, 0, 'bullet')
                    .setScale(0.08)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            if (!particle) return;
            
            // 计算尾焰位置（坦克后方）
            const backX = player.x - Math.cos(player.rotation) * 15;
            const backY = player.y - Math.sin(player.rotation) * 15;
            
            const flameColors = [0xff6600, 0xff8800, 0xffaa00, 0xff4400];
            const flameColor = flameColors[Math.floor(Math.random() * flameColors.length)];
            
            particle.setPosition(backX, backY)
                .setActive(true)
                .setVisible(true)
                .setAlpha(0.8)
                .setScale(0.1)
                .setTint(flameColor)
                .setRotation(Math.random() * Math.PI);
            
            // 随机散开
            const spreadX = (Math.random() - 0.5) * 10;
            const spreadY = (Math.random() - 0.5) * 10;
            
            this.tweens.add({
                targets: particle,
                x: particle.x + spreadX - Math.cos(player.rotation) * 20,
                y: particle.y + spreadY - Math.sin(player.rotation) * 20,
                scale: 0,
                alpha: 0,
                duration: 300,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
    }
    
    updateEnemies() {
        const enemies = this.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy && enemy.alive) {
                // 更新炮塔位置
                enemy.turret.x = enemy.x;
                enemy.turret.y = enemy.y;
                
                // 智能AI行为
                this.updateEnemyAI(enemy);
                
                // 边界检测
                this.checkBoundary(enemy);
                
                // 敌人AI开火
                enemy.lastFired += this.game.loop.delta;
                if (enemy.lastFired >= enemy.fireRate) {
                    enemy.lastFired = 0;
                    
                    // 瞄准最近的玩家
                    let target = this.findNearestPlayer(enemy);
                    
                    if (target && target.alive) {
                        const angle = Phaser.Math.Angle.Between(
                            enemy.x, enemy.y,
                            target.x, target.y
                        );
                        enemy.turret.rotation = angle;
                        this.fireBullet(enemy, angle, true);
                    }
                }
            }
        });
    }
    
    updateEnemyAI(enemy) {
        // 更新AI计时器
        enemy.aiTimer += this.game.loop.delta;
        
        // 每隔一段时间重新评估AI模式
        if (enemy.aiTimer >= 2000) {
            enemy.aiTimer = 0;
            this.evaluateEnemyMode(enemy);
        }
        
        // 根据AI模式执行不同行为
        switch (enemy.aiMode) {
            case 'chase':
                this.executeChaseMode(enemy);
                break;
            case 'evade':
                this.executeEvadeMode(enemy);
                break;
            case 'patrol':
            default:
                this.executePatrolMode(enemy);
                break;
        }
    }
    
    evaluateEnemyMode(enemy) {
        // 找到最近的玩家
        const target = this.findNearestPlayer(enemy);
        if (!target || !target.alive) {
            enemy.aiMode = 'patrol';
            return;
        }
        
        const distanceToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);
        
        // 检查是否有子弹接近
        const hasIncomingBullet = this.checkIncomingBullets(enemy);
        
        // AI模式决策逻辑
        if (hasIncomingBullet) {
            // 有子弹接近，切换到躲避模式
            enemy.aiMode = 'evade';
        } else if (distanceToPlayer < 200) {
            // 距离玩家较近，追逐玩家
            enemy.aiMode = 'chase';
        } else if (distanceToPlayer > 400) {
            // 距离玩家较远，巡逻模式
            enemy.aiMode = 'patrol';
        } else {
            // 中等距离，随机选择模式
            const modes = ['chase', 'patrol'];
            enemy.aiMode = modes[Math.floor(Math.random() * modes.length)];
        }
    }
    
    executeChaseMode(enemy) {
        const target = this.findNearestPlayer(enemy);
        if (!target || !target.alive) {
            enemy.aiMode = 'patrol';
            return;
        }
        
        // 计算朝向玩家的角度
        const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);
        
        // 平滑转向玩家
        enemy.rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, angleToPlayer, 0.03);
        
        // 向前移动
        this.physics.velocityFromRotation(enemy.rotation, enemy.speed, enemy.body.velocity);
    }
    
    executeEvadeMode(enemy) {
        // 检测最近的威胁（子弹）
        const nearestBullet = this.findNearestBullet(enemy);
        if (nearestBullet) {
            // 计算躲避方向（垂直于子弹方向）
            const bulletAngle = Math.atan2(nearestBullet.y - enemy.y, nearestBullet.x - enemy.x);
            const evadeAngle = bulletAngle + Math.PI / 2;
            
            // 平滑转向躲避方向
            enemy.rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, evadeAngle, 0.05);
            
            // 快速移动
            this.physics.velocityFromRotation(enemy.rotation, enemy.speed * 1.3, enemy.body.velocity);
        } else {
            // 没有威胁，切换回巡逻模式
            enemy.aiMode = 'patrol';
        }
    }
    
    executePatrolMode(enemy) {
        // 定期改变移动方向
        enemy.moveTimer += this.game.loop.delta;
        if (enemy.moveTimer >= enemy.moveInterval) {
            enemy.moveTimer = 0;
            enemy.moveInterval = Phaser.Math.Between(1000, 3000);
            enemy.targetAngle = Phaser.Math.Between(0, 360);
        }
        
        // 转向目标角度
        enemy.rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, enemy.targetAngle * Phaser.Math.DEG_TO_RAD, 0.02);
        
        // 向前移动
        this.physics.velocityFromRotation(enemy.rotation, enemy.speed, enemy.body.velocity);
    }
    
    findNearestPlayer(enemy) {
        let nearest = null;
        let minDistance = Infinity;
        
        if (this.player1 && this.player1.alive) {
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player1.x, this.player1.y);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = this.player1;
            }
        }
        
        if (this.player2 && this.player2.alive) {
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player2.x, this.player2.y);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = this.player2;
            }
        }
        
        return nearest;
    }
    
    findNearestBullet(enemy) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.bullets.forEach(bullet => {
            if (bullet && bullet.active && bullet.isEnemy === false) {
                const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, bullet.x, bullet.y);
                if (dist < minDistance && dist < 150) { // 只检测150范围内的子弹
                    minDistance = dist;
                    nearest = bullet;
                }
            }
        });
        
        return nearest;
    }
    
    checkIncomingBullets(enemy) {
        // 检查是否有玩家子弹接近
        const nearestBullet = this.findNearestBullet(enemy);
        return nearestBullet !== null;
    }
    
    updateBullets() {
        // 优化子弹更新，使用filter但避免创建新数组
        let i = 0;
        while (i < this.bullets.length) {
            const bullet = this.bullets[i];
            if (bullet && bullet.active) {
                // 检查子弹是否超出边界
                this.checkBulletBoundary(bullet);
                i++;
            } else {
                // 移除不活跃的子弹，不需要调整索引
                this.bullets.splice(i, 1);
            }
        }
    }
    
    fireBullet(tank, angle, isEnemy = false) {
        // 从对象池获取子弹
        let bullet = this.bulletPool.find(b => !b.active);
        if (!bullet) {
            // 如果对象池为空，创建新子弹（限制最大数量）
            if (this.bulletPool.length >= 80) {
                console.warn('子弹对象池已满，跳过创建');
                return;
            }
            bullet = this.physics.add.sprite(0, 0, 'bullet')
                .setScale(0.2)
                .setActive(false)
                .setVisible(false);
            this.bulletPool.push(bullet);
        }
        
        // 检查bullet是否有效
        if (!bullet || !bullet.body) {
            console.error('无效的子弹对象:', bullet);
            return;
        }
        
        // 确保子弹在物理组中
        if (!this.bulletGroup.contains(bullet)) {
            this.bulletGroup.add(bullet);
        }
        
        // 检查子弹是否已在数组中，避免重复添加
        if (!this.bullets.includes(bullet)) {
            this.bullets.push(bullet);
        }
        
        // 重置子弹属性
        bullet.setPosition(tank.x, tank.y)
            .setRotation(angle)
            .setActive(true)
            .setVisible(true)
            .setAlpha(1);
        
        this.physics.velocityFromRotation(angle, 400, bullet.body.velocity);
        
        bullet.damage = isEnemy ? 20 : 30;
        bullet.owner = tank;
        bullet.isEnemy = isEnemy;
        
        // 添加子弹发光效果
        const bulletColor = isEnemy ? 0xff4444 : 0x00ffff;
        bullet.setTint(bulletColor);
        
        // 添加子弹光晕
        const bulletGlow = this.add.graphics();
        bulletGlow.fillStyle(bulletColor, 0.4);
        bulletGlow.fillCircle(0, 0, 8);
        bulletGlow.setScrollFactor(0);
        bulletGlow.setVisible(false);
        bullet.glow = bulletGlow;
        
        // 播放开火音效
        this.playSound('fire');
        
        // 开火振动
        this.vibrate([50]);
        
        // 子弹生命周期
        this.time.delayedCall(2000, () => {
            if (bullet && bullet.active) {
                bullet.setActive(false).setVisible(false);
                // 从子弹数组中移除
                const index = this.bullets.indexOf(bullet);
                if (index > -1) {
                    this.bullets.splice(index, 1);
                }
                // 销毁光晕
                if (bullet.glow) {
                    bullet.glow.destroy();
                    bullet.glow = null;
                }
            }
        });
        
        // 添加子弹尾迹效果
        this.createBulletTrail(bullet, angle, isEnemy);
    }
    
    createBulletTrail(bullet, angle, isEnemy) {
        // 创建子弹尾迹
        const trailLength = 8;
        for (let i = 0; i < trailLength; i++) {
            const trailParticle = this.particlePool.find(p => !p.active);
            if (!trailParticle && this.particlePool.length < 150) {
                trailParticle = this.add.image(0, 0, 'bullet')
                    .setScale(0.05)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(trailParticle);
            }
            
            if (!trailParticle) continue;
            
            const trailColor = isEnemy ? 0xff4444 : 0x00ffff;
            const trailX = bullet.x - Math.cos(angle) * (i * 5);
            const trailY = bullet.y - Math.sin(angle) * (i * 5);
            
            trailParticle.setPosition(trailX, trailY)
                .setActive(true)
                .setVisible(true)
                .setAlpha(0.6 - (i * 0.07))
                .setScale(0.1 - (i * 0.01))
                .setTint(trailColor);
            
            // 延迟消失
            this.time.delayedCall(100 + i * 20, () => {
                if (trailParticle && trailParticle.active) {
                    trailParticle.setActive(false).setVisible(false);
                    trailParticle.clearTint();
                }
            });
        }
    }
    
    bulletHitObstacle(bullet, obstacle) {
        if (bullet && bullet.active) {
            bullet.setActive(false).setVisible(false);
            const index = this.bullets.indexOf(bullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
        }
    }
    
    bulletHitEnemy(bullet, enemy) {
        if (bullet && bullet.active && enemy && enemy.alive && !bullet.isEnemy) {
            enemy.health -= bullet.damage;
            
            // 显示伤害效果
            this.showDamageEffect(enemy.x, enemy.y);
            
            // 播放击中音效
            this.playSound('hit');
            
            bullet.setActive(false).setVisible(false);
            const index = this.bullets.indexOf(bullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
            
            // 检查敌人是否被击败
            if (enemy.health <= 0) {
                this.enemyDefeated(enemy);
            }
        }
    }
    
    bulletHitPlayer1(bullet, player) {
        // 参数可能反过来，确保正确的顺序
        const realBullet = (bullet && bullet.isEnemy !== undefined) ? bullet : player;
        const realPlayer = (player && player.health !== undefined) ? player : bullet;
        
        if (realBullet && realBullet.active && realPlayer && realPlayer.alive && realBullet.isEnemy) {
            realPlayer.health -= realBullet.damage;
            
            // 显示伤害效果
            this.showDamageEffect(realPlayer.x, realPlayer.y);
            
            // 播放击中音效
            this.playSound('hit');
            
            // 被击中振动
            this.vibrate([80]);
            
            realBullet.setActive(false).setVisible(false);
            const index = this.bullets.indexOf(realBullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
            
            // 添加被击中的视觉效果 - 屏幕闪红
            const cameraFlash = this.cameras.main.add.rectangle(
                0, 0,
                this.screenWidth, 
                this.screenHeight,
                0xff0000, 
                0.2
            );
            this.tweens.add({
                targets: cameraFlash,
                alpha: 0,
                duration: 200,
                onComplete: () => cameraFlash.destroy()
            });
            
            // 坦克闪红效果
            this.tweens.add({
                targets: realPlayer,
                tint: 0xff0000,
                duration: 100,
                yoyo: true,
                ease: 'Cubic.easeOut',
                onYoyo: () => {
                    realPlayer.clearTint();
                }
            });
            
            // 更新生命值条
            this.updateHealthBar('player1', realPlayer.health);
            
            // 检查玩家是否被击败
            if (realPlayer.health <= 0) {
                this.playerDefeated(realPlayer);
            }
        }
    }
    
    bulletHitPlayer2(bullet, player) {
        // 参数可能反过来，确保正确的顺序
        const realBullet = (bullet && bullet.isEnemy !== undefined) ? bullet : player;
        const realPlayer = (player && player.health !== undefined) ? player : bullet;
        
        if (realBullet && realBullet.active && realPlayer && realPlayer.alive && realBullet.isEnemy) {
            realPlayer.health -= realBullet.damage;
            
            // 显示伤害效果
            this.showDamageEffect(realPlayer.x, realPlayer.y);
            
            // 播放击中音效
            this.playSound('hit');
            
            // 被击中振动
            this.vibrate([80]);
            
            realBullet.setActive(false).setVisible(false);
            const index = this.bullets.indexOf(realBullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
            
            // 添加被击中的视觉效果 - 屏幕闪红
            const cameraFlash = this.cameras.main.add.rectangle(
                0, 0,
                this.cameras.main.width, 
                this.cameras.main.height,
                0xff0000, 
                0.2
            );
            this.tweens.add({
                targets: cameraFlash,
                alpha: 0,
                duration: 200,
                onComplete: () => cameraFlash.destroy()
            });
            
            // 坦克闪红效果
            this.tweens.add({
                targets: realPlayer,
                tint: 0xff0000,
                duration: 100,
                yoyo: true,
                ease: 'Cubic.easeOut',
                onYoyo: () => {
                    realPlayer.clearTint();
                }
            });
            
            // 更新生命值条
            this.updateHealthBar('player2', realPlayer.health);
            
            // 检查玩家是否被击败
            if (realPlayer.health <= 0) {
                this.playerDefeated(realPlayer);
            }
        }
    }
    
    enemyDefeated(enemy) {
        enemy.alive = false;
        enemy.setVisible(false);
        enemy.setActive(false);
        enemy.turret.setVisible(false);
        enemy.turret.setActive(false);
        
        // 显示爆炸效果
        this.showExplosionEffect(enemy.x, enemy.y);
        
        // 增加分数
        this.score += 100;
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 增加敌人击败计数
        this.enemiesDefeated++;
        this.enemiesText.setText(`敌人: ${this.enemiesToDefeat - this.enemiesDefeated}/${this.enemiesToDefeat}`);
    }
    
    playerDefeated(player) {
        player.alive = false;
        player.setVisible(false);
        player.setActive(false);
        player.turret.setVisible(false);
        player.turret.setActive(false);
        
        // 显示爆炸效果
        this.showExplosionEffect(player.x, player.y);
        
        // 检查游戏是否结束
        if ((!this.player1 || !this.player1.alive) && (!this.player2 || !this.player2.alive)) {
            this.gameOver(false);
        } else if (this.game.gameState.gameMode === 'two-player') {
            // 双人模式下，一个玩家死亡后游戏继续
            if (!this.player1.alive) {
                this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '玩家1被击败!', {
                    fontFamily: 'Noto Sans SC',
                    fontSize: '32px',
                    fill: '#e74c3c'
                }).setOrigin(0.5).setDepth(100);
            } else {
                this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '玩家2被击败!', {
                    fontFamily: 'Noto Sans SC',
                    fontSize: '32px',
                    fill: '#e74c3c'
                }).setOrigin(0.5).setDepth(100);
            }
        } else {
            // 单人模式下，玩家死亡游戏结束
            this.gameOver(false);
        }
    }
    
    // 初始化对象池
    initAudioSystem() {
        // 初始化Web Audio API
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported');
        }
        
        // 音效配置
        this.sounds = {
            fire: {
                frequency: [440, 880],
                duration: 0.1,
                type: 'square'
            },
            explosion: {
                frequency: [220, 110, 55],
                duration: 0.3,
                type: 'sawtooth'
            },
            gameStart: {
                frequency: [220, 330, 440, 550],
                duration: 0.5,
                type: 'sine'
            },
            levelComplete: {
                frequency: [440, 550, 660, 880],
                duration: 0.6,
                type: 'sine'
            },
            hit: {
                frequency: [220, 165],
                duration: 0.15,
                type: 'triangle'
            }
        };
        
        // 检查振动支持
        this.vibrateSupported = 'vibrate' in navigator;
    }
    
    vibrate(pattern = [50]) {
        // 检查振动是否可用
        if (!this.vibrateSupported) return;
        
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Vibration error:', error);
        }
    }
    
    playSound(soundType) {
        // 检查音效是否开启
        if (!this.game.gameState.settings.sound) return;
        
        // 检查AudioContext是否可用
        if (!this.audioContext) return;
        
        // 确保AudioContext处于运行状态
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const soundConfig = this.sounds[soundType];
        if (!soundConfig) return;
        
        // 创建音效
        const { frequency, duration, type } = soundConfig;
        
        // 添加随机变化，使音效更自然
        const frequencyVariation = (Math.random() - 0.5) * 20; // ±10Hz变化
        const durationVariation = (Math.random() - 0.5) * 0.02; // ±0.01秒变化
        
        frequency.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(freq + frequencyVariation, this.audioContext.currentTime);
                
                // 改进音量 envelope
                const actualDuration = duration + durationVariation;
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + actualDuration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + actualDuration);
            }, index * 50);
        });
        
        // 根据音效类型添加特殊效果
        if (soundType === 'explosion') {
            this.addExplosionNoise();
        } else if (soundType === 'fire') {
            this.addFireNoise();
        }
    }
    
    addExplosionNoise() {
        // 添加爆炸噪音效果
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.3);
    }
    
    addFireNoise() {
        // 添加开火噪音效果
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(500, this.audioContext.currentTime);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.1);
    }
    
    initObjectPools() {
        // 如果已经初始化过，跳过
        if (this.bulletPool.length > 0 || this.particlePool.length > 0) {
            return;
        }
        
        this.bulletPool = [];
        this.particlePool = [];
        this.textPool = [];
        
        // 预创建子弹对象（增加数量以支持更多粒子效果）
        const bulletPoolSize = this.isMobile ? 30 : 50;
        for (let i = 0; i < bulletPoolSize; i++) {
            const bullet = this.physics.add.sprite(0, 0, 'bullet')
                .setScale(0.2)
                .setActive(false)
                .setVisible(false);
            this.bulletPool.push(bullet);
            // 添加到物理组
            if (this.bulletGroup) {
                this.bulletGroup.add(bullet);
            }
        }
        
        // 预创建粒子对象（增加数量以支持丰富的粒子效果）
        const particlePoolSize = this.isMobile ? 80 : 150;
        for (let i = 0; i < particlePoolSize; i++) {
            const particle = this.add.image(0, 0, 'bullet')
                .setScale(0.1)
                .setActive(false)
                .setVisible(false);
            this.particlePool.push(particle);
        }
    }
    
    showDamageEffect(x, y) {
        // 从对象池获取或创建伤害文本
        let damageText = this.textPool.find(text => !text.active);
        if (!damageText && this.textPool.length < 30) {
            damageText = this.add.text(0, 0, `-30`, {
                fontFamily: 'Noto Sans SC',
                fontSize: '24px',
                fill: '#ff4444',
                stroke: '#000000',
                strokeThickness: 2,
                fontWeight: 'bold'
            }).setOrigin(0.5)
              .setActive(false)
              .setVisible(false);
            this.textPool.push(damageText);
        }
        
        if (damageText) {
            damageText.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(1)
                .setRotation(0);
            
            this.tweens.add({
                targets: damageText,
                y: damageText.y - 80,
                alpha: 0,
                scale: 1.8,
                rotation: Math.PI / 6,
                duration: 1200,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (damageText) {
                        damageText.setActive(false).setVisible(false);
                    }
                }
            });
        }
        
        // 恢复并增强粒子效果数量
        const particleCount = this.isMobile ? 8 : 12;
        
        // 粒子效果 - 增强版
        for (let i = 0; i < particleCount; i++) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle && this.particlePool.length < 150) {
                particle = this.add.image(0, 0, 'bullet')
                    .setScale(0.1)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            if (!particle) continue;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(25, 50);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            particle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.15)
                .setTint(0xff6666);
            
            this.tweens.add({
                targets: particle,
                x: particleX,
                y: particleY,
                scale: 0.3 + Math.random() * 0.2,
                alpha: 0,
                duration: 600 + Math.random() * 400,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
        
        // 添加火花效果 - 增强版
        const sparkCount = this.isMobile ? 4 : 8;
        for (let i = 0; i < sparkCount; i++) {
            let spark = this.particlePool.find(p => !p.active);
            if (!spark && this.particlePool.length < 150) {
                spark = this.add.image(0, 0, 'bullet')
                    .setScale(0.05)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(spark);
            }
            
            if (!spark) continue;
            
            const angle = (i / sparkCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(40, 80);
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;
            
            spark.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.08)
                .setTint(0xffff88);
            
            this.tweens.add({
                targets: spark,
                x: sparkX,
                y: sparkY,
                scale: 0,
                alpha: 0,
                duration: 400 + Math.random() * 300,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (spark) {
                        spark.setActive(false).setVisible(false);
                        spark.clearTint();
                    }
                }
            });
        }
        
        // 添加光晕效果
        const glow = this.add.graphics();
        glow.fillStyle(0xff6666, 0.4);
        glow.fillCircle(x, y, 30);
        
        this.tweens.add({
            targets: glow,
            scale: 2,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                glow.destroy();
            }
        });
    }
    
    showExplosionEffect(x, y) {
        // 播放爆炸音效
        this.playSound('explosion');
        
        // 爆炸振动
        this.vibrate([100, 50, 100]);
        
        // 创建主爆炸效果 - 增强版
        const explosion = this.add.image(x, y, 'explosion')
            .setScale(0.5)
            .setAlpha(1)
            .setTint(0xffaa00);
        
        this.tweens.add({
            targets: explosion,
            scale: 3.5,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // 恢复并增强爆炸冲击波效果
        const shockwaveCount = this.isMobile ? 3 : 5;
        
        for (let i = 0; i < shockwaveCount; i++) {
            const shockwave = this.add.graphics();
            const initialRadius = 10 + i * 15;
            const finalRadius = 80 + i * 40;
            
            const colors = [0xffffff, 0xffaa00, 0xff6600, 0xff3300, 0xff0000];
            shockwave.lineStyle(3 - i * 0.4, colors[i % colors.length], 1 - i * 0.15);
            shockwave.strokeCircle(x, y, initialRadius);
            
            this.tweens.add({
                targets: shockwave,
                scale: finalRadius / initialRadius,
                alpha: 0,
                duration: 700,
                delay: i * 80,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    shockwave.destroy();
                }
            });
        }
        
        // 恢复并增强爆炸粒子效果
        const particleCount = this.isMobile ? 8 : 20;
        
        for (let i = 0; i < particleCount; i++) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle && this.particlePool.length < 150) {
                particle = this.add.image(0, 0, 'smoke')
                    .setScale(0.2)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            if (!particle) continue;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(70, 150);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            particle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.25)
                .setTint(0xffffff - Math.floor(Math.random() * 0x222222));
            
            this.tweens.add({
                targets: particle,
                x: particleX,
                y: particleY,
                scale: 0.6 + Math.random() * 0.8,
                alpha: 0,
                duration: 900 + Math.random() * 500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
        
        // 恢复并增强火焰粒子效果
        const fireParticleCount = this.isMobile ? 5 : 12;
        
        for (let i = 0; i < fireParticleCount; i++) {
            let fireParticle = this.particlePool.find(p => !p.active);
            if (!fireParticle && this.particlePool.length < 150) {
                fireParticle = this.add.image(0, 0, 'bullet')
                    .setScale(0.1)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(fireParticle);
            }
            
            if (!fireParticle) continue;
            
            const angle = (i / fireParticleCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(40, 90);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            const fireColors = [0xff6600, 0xff8800, 0xffaa00, 0xffcc00, 0xff4400];
            const fireColor = fireColors[Math.floor(Math.random() * fireColors.length)];
            
            fireParticle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.15)
                .setTint(fireColor);
            
            this.tweens.add({
                targets: fireParticle,
                x: particleX,
                y: particleY,
                scale: 0.4 + Math.random() * 0.3,
                alpha: 0,
                duration: 500 + Math.random() * 300,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (fireParticle) {
                        fireParticle.setActive(false).setVisible(false);
                        fireParticle.clearTint();
                    }
                }
            });
        }
        
        // 添加爆炸闪光效果
        const flash = this.add.graphics();
        flash.fillStyle(0xffaa00, 0.5);
        flash.fillCircle(x, y, 50);
        
        this.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // 添加地面震动效果
        this.cameras.main.shake(400, 0.015);
    }
    
    updateHealthBar(playerType, health) {
        // 使用防抖处理，避免频繁更新导致重叠
        const now = this.time.now;
        const cooldown = 100; // 100ms冷却时间
        
        if (this.lastHealthBarUpdate && now - this.lastHealthBarUpdate < cooldown) {
            return;
        }
        
        this.lastHealthBarUpdate = now;
        
        // 保存旧的生命值条引用，避免每次遍历所有children
        if (!this.healthBarElements) {
            this.healthBarElements = [];
        }
        
        // 销毁旧的生命值条
        this.healthBarElements.forEach(child => {
            if (child && child.active) {
                child.destroy();
            }
        });
        this.healthBarElements = [];
        
        // 根据屏幕尺寸计算UI元素大小
        const screenWidth = this.cameras.main.width;
        const isMobile = screenWidth < 600;
        const uiScale = isMobile ? 0.7 : 1;
        const uiPadding = 10 * uiScale;
        const textPadding = 20 * uiScale;
        const healthBarY = this.cameras.main.height - 80 * uiScale;
        const healthBarWidth = 200 * uiScale;
        
        // 创建新的生命值条并保存引用
        if (playerType === 'player1') {
            const elements = this.createHealthBar(uiPadding + textPadding, healthBarY, '玩家1', health, 0x3498db, uiScale);
            this.healthBarElements.push(...elements);
        } else if (playerType === 'player2') {
            const elements = this.createHealthBar(screenWidth - healthBarWidth - uiPadding - textPadding, healthBarY, '玩家2', health, 0xe74c3c, uiScale);
            this.healthBarElements.push(...elements);
        }
    }
    
    checkLevelComplete() {
        if (this.enemiesDefeated >= this.enemiesToDefeat) {
            console.log('关卡完成，进入下一关');
            
            // 所有敌人被击败，进入下一关
            this.level++;
            this.enemiesDefeated = 0;
            this.enemiesToDefeat = 5 + (this.level - 1) * 2;
            
            // 清除现有敌人
            const enemies = this.enemies.getChildren();
            enemies.forEach(enemy => {
                if (enemy) {
                    enemy.destroy();
                }
            });
            this.enemies.clear(true, true);
            
            // 清除现有子弹
            this.bullets.forEach(bullet => {
                if (bullet) {
                    bullet.setActive(false).setVisible(false);
                }
            });
            this.bullets = [];
            
            // 清除子弹组中的所有子弹
            if (this.bulletGroup) {
                this.bulletGroup.clear(true, true);
            }
            
            // 创建新的敌人
            this.createEnemies();
            
            // 更新UI
            this.levelText.setText(`关卡: ${this.level}`);
            this.enemiesText.setText(`敌人: ${this.enemiesToDefeat - this.enemiesDefeated}/${this.enemiesToDefeat}`);
            
            // 播放关卡完成音效
            this.playSound('levelComplete');
            
            // 显示关卡完成信息
            const levelCompleteText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `关卡 ${this.level - 1} 完成!`, {
                fontFamily: 'Noto Sans SC',
                fontSize: '32px',
                fill: '#2ecc71',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
            
            // 添加关卡完成特效
            this.showLevelCompleteEffect(this.cameras.main.centerX, this.cameras.main.centerY);
            
            // 2秒后移除关卡完成信息
            this.time.delayedCall(2000, () => {
                if (levelCompleteText && levelCompleteText.active) {
                    levelCompleteText.destroy();
                }
            });
            
            // 恢复玩家生命值
            if (this.player1) {
                this.player1.health = Math.min(this.player1.health + 50, 100);
                this.updateHealthBar('player1', this.player1.health);
            }
            if (this.player2) {
                this.player2.health = Math.min(this.player2.health + 50, 100);
                this.updateHealthBar('player2', this.player2.health);
            }
        }
    }
    
    showLevelCompleteEffect(x, y) {
        // 增强关卡完成特效
        
        // 添加庆祝文字效果 - 增强版
        const levelUpText = this.add.text(x, y - 50, '关卡完成!', {
            fontFamily: 'Noto Sans SC',
            fontSize: '40px',
            fill: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 4,
            fontWeight: 'bold',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            alpha: 1,
            scale: 1.3,
            duration: 600,
            ease: 'Elastic.easeOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
        
        // 恢复并增强彩色粒子效果
        const particleCount = this.isMobile ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle && this.particlePool.length < 150) {
                particle = this.add.image(0, 0, 'explosion')
                    .setScale(0.3)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            if (!particle) continue;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(150, 300);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            // 丰富的彩色粒子
            const colors = [
                0x3498db, 0x2ecc71, 0xe74c3c, 0xf39c12, 0x9b59b6,
                0x1abc9c, 0xe67e22, 0x34495e, 0x16a085, 0x27ae60
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.35)
                .setTint(color);
            
            this.tweens.add({
                targets: particle,
                x: particleX,
                y: particleY,
                scale: 0,
                alpha: 0,
                duration: 1200 + Math.random() * 600,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
        
        // 恢复并增强中心爆炸效果
        const fireworkCount = this.isMobile ? 6 : 12;
        
        for (let i = 0; i < fireworkCount; i++) {
            const firework = this.add.image(x, y, 'explosion')
                .setScale(0.25)
                .setAlpha(1)
                .setTint(0xffffff);
            
            const angle = (i / fireworkCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(100, 180);
            const fireworkX = x + Math.cos(angle) * distance;
            const fireworkY = y + Math.sin(angle) * distance;
            
            this.tweens.add({
                targets: firework,
                x: fireworkX,
                y: fireworkY,
                scale: 0.8,
                alpha: 0,
                duration: 800,
                delay: i * 50,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    firework.destroy();
                }
            });
        }
        
        // 添加星形粒子效果
        const starCount = this.isMobile ? 8 : 16;
        for (let i = 0; i < starCount; i++) {
            const star = this.add.image(x, y, 'explosion')
                .setScale(0.2)
                .setAlpha(1)
                .setTint(0xffff00);
            
            const angle = (i / starCount) * Math.PI * 2;
            const distance = Phaser.Math.Between(200, 350);
            const starX = x + Math.cos(angle) * distance;
            const starY = y + Math.sin(angle) * distance;
            
            this.tweens.add({
                targets: star,
                x: starX,
                y: starY,
                scale: 0.5,
                alpha: 0,
                duration: 1500,
                delay: i * 80,
                ease: 'Bounce.easeOut',
                onComplete: () => {
                    star.destroy();
                }
            });
        }
        
        // 添加增强背景闪烁效果
        const flash = this.add.graphics();
        flash.fillStyle(0x2ecc71, 0.4);
        flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // 添加光环效果
        const halo = this.add.graphics();
        halo.lineStyle(5, 0x2ecc71, 0.6);
        halo.strokeCircle(x, y, 50);
        
        this.tweens.add({
            targets: halo,
            scale: 5,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                halo.destroy();
            }
        });
    }
    
    pauseGame() {
        this.isPaused = true;
        this.scene.pause();
        this.scene.launch('PauseScene');
    }
    
    resumeGame() {
        this.isPaused = false;
        this.scene.resume();
    }
    
    gameOver(isVictory) {
        this.gameStarted = false;
        
        // 保存分数
        if (this.score > this.game.gameState.score.player1) {
            this.game.gameState.score.player1 = this.score;
            this.game.gameState.saveSystem.saveGame();
        }
        
        // 切换到游戏结束场景
        this.scene.start('GameOverScene', {
            score: this.score,
            level: this.level,
            isVictory: isVictory
        });
    }
    
    checkBoundary(tank) {
        // 游戏场景边界
        const minX = 20; // 左边距
        const maxX = this.cameras.main.width - 20; // 右边距
        const minY = 20; // 上边距
        const maxY = this.cameras.main.height - 20; // 下边距
        
        // 限制坦克位置在边界内
        if (tank.x < minX) {
            tank.x = minX;
            tank.setVelocityX(0);
        } else if (tank.x > maxX) {
            tank.x = maxX;
            tank.setVelocityX(0);
        }
        
        if (tank.y < minY) {
            tank.y = minY;
            tank.setVelocityY(0);
        } else if (tank.y > maxY) {
            tank.y = maxY;
            tank.setVelocityY(0);
        }
        
        // 同时更新炮塔位置
        if (tank.turret) {
            tank.turret.x = tank.x;
            tank.turret.y = tank.y;
        }
    }
    
    checkBulletBoundary(bullet) {
        // 检查子弹是否超出边界
        if (bullet.x < 0 || bullet.x > this.cameras.main.width || bullet.y < 0 || bullet.y > this.cameras.main.height) {
            bullet.setActive(false).setVisible(false);
            // 从子弹数组中移除
            const index = this.bullets.indexOf(bullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
        }
    }
    
    shutdown() {
        // 清理所有 tweens
        this.tweens.killAll();
        
        // 清理所有定时器
        this.time.removeAllEvents();
        
        // 清理所有粒子池
        if (this.particlePool) {
            this.particlePool.forEach(particle => {
                if (particle && particle.active) {
                    particle.destroy();
                }
            });
            this.particlePool = [];
        }
        
        // 清理所有文本池
        if (this.textPool) {
            this.textPool.forEach(text => {
                if (text && text.active) {
                    text.destroy();
                }
            });
            this.textPool = [];
        }
        
        // 清理所有子弹池
        if (this.bulletPool) {
            this.bulletPool.forEach(bullet => {
                if (bullet && bullet.active) {
                    bullet.destroy();
                }
            });
            this.bulletPool = [];
        }
        
        // 清理所有生命值条元素
        if (this.healthBarElements) {
            this.healthBarElements.forEach(element => {
                if (element && element.active) {
                    element.destroy();
                }
            });
            this.healthBarElements = [];
        }
        
        // 清理音频上下文
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        console.log('GameScene 已清理所有资源');
    }
}