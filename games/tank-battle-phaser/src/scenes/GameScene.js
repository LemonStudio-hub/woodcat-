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
    }
    
    create() {
        // 设置背景
        this.cameras.main.setBackgroundColor('#1a1a1a');
        
        // 添加背景纹理
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
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
        // 创建地图边界
        this.physics.add.staticGroup()
            .create(this.cameras.main.width / 2, 0, 'wall')
            .setScale(this.cameras.main.width, 1)
            .refreshBody();
        
        this.physics.add.staticGroup()
            .create(this.cameras.main.width / 2, this.cameras.main.height, 'wall')
            .setScale(this.cameras.main.width, 1)
            .refreshBody();
        
        this.physics.add.staticGroup()
            .create(0, this.cameras.main.height / 2, 'wall')
            .setScale(1, this.cameras.main.height)
            .refreshBody();
        
        this.physics.add.staticGroup()
            .create(this.cameras.main.width, this.cameras.main.height / 2, 'wall')
            .setScale(1, this.cameras.main.height)
            .refreshBody();
        
        // 创建障碍物
        this.obstacles = this.physics.add.staticGroup();
        
        // 随机创建障碍物
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
            const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
            
            this.obstacles.create(x, y, 'wall')
                .setScale(0.5)
                .refreshBody();
        }
        
        // 创建网格背景
        const gridSize = 40;
        const graphics = this.add.graphics();
        
        graphics.lineStyle(1, 0x34495e, 0.3);
        
        for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.cameras.main.height);
        }
        
        for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.cameras.main.width, y);
        }
        
        graphics.strokePath();
    }
    
    createPlayers() {
        // 创建玩家1坦克
        this.player1 = this.physics.add.sprite(100, 100, 'tank-player1')
            .setScale(0.5)
            .setRotation(-Math.PI / 2) // 初始朝向上方
            .setDrag(1000)
            .setAngularDrag(1000);
        
        this.player1.turret = this.physics.add.sprite(this.player1.x, this.player1.y, 'tank-turret')
            .setScale(0.5)
            .setOrigin(0.3, 0.5);
        
        this.player1.health = 100;
        this.player1.score = 0;
        this.player1.alive = true;
        
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
        
        this.enemiesToDefeat = enemyCount;
        
        for (let i = 0; i < enemyCount; i++) {
            const x = Phaser.Math.Between(200, this.cameras.main.width - 200);
            const y = Phaser.Math.Between(200, this.cameras.main.height - 200);
            
            const enemy = this.physics.add.sprite(x, y, 'tank-enemy')
                .setScale(0.5)
                .setDrag(1000)
                .setAngularDrag(1000);
            
            enemy.turret = this.physics.add.sprite(enemy.x, enemy.y, 'tank-turret')
                .setScale(0.5)
                .setOrigin(0.3, 0.5);
            
            enemy.health = 50;
            enemy.alive = true;
            enemy.speed = Phaser.Math.Between(50, 100);
            enemy.fireRate = Phaser.Math.Between(1000, 3000);
            enemy.lastFired = 0;
            enemy.moveTimer = 0;
            enemy.moveInterval = Phaser.Math.Between(1000, 3000);
            enemy.targetAngle = Phaser.Math.Between(0, 360);
            
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
        
        // 创建生命值背景（军事风格）
        const healthBarBackground = this.add.graphics();
        healthBarBackground.fillStyle(0x16213e, 0.8);
        healthBarBackground.fillRoundedRect(x, y, healthBarWidth, healthBarHeight, 5);
        healthBarBackground.lineStyle(2 * uiScale, 0x0f3460, 1);
        healthBarBackground.strokeRoundedRect(x, y, healthBarWidth, healthBarHeight, 5);
        
        // 创建生命值文本
        this.add.text(x + 12 * uiScale, y + 8 * uiScale, `${label}:`, {
            fontFamily: 'Noto Sans SC',
            fontSize: textSize,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        });
        
        // 创建生命值条背景
        const barBackground = this.add.graphics();
        barBackground.fillStyle(0x1a1a2e, 0.8);
        barBackground.fillRoundedRect(x + 90 * uiScale, y + 7 * uiScale, 120 * uiScale, 20 * uiScale, 3);
        barBackground.lineStyle(1 * uiScale, 0x0f3460, 1);
        barBackground.strokeRoundedRect(x + 90 * uiScale, y + 7 * uiScale, 120 * uiScale, 20 * uiScale, 3);
        
        // 创建生命值条
        const healthBar = this.add.graphics();
        const barWidth = 120 * uiScale * (value / 100);
        healthBar.fillStyle(color, 0.9);
        healthBar.fillRoundedRect(x + 90 * uiScale, y + 7 * uiScale, barWidth, 20 * uiScale, 3);
        healthBar.lineStyle(1 * uiScale, 0xffffff, 1);
        healthBar.strokeRoundedRect(x + 90 * uiScale, y + 7 * uiScale, barWidth, 20 * uiScale, 3);
        
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
        
        // 添加生命值变化动画
        this.tweens.add({
            targets: healthText,
            scale: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Cubic.easeOut'
        });
        
        return healthText;
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
        
        // 鼠标点击开火
        this.input.on('pointerdown', (pointer) => {
            if (this.player1 && this.player1.alive && !this.isPaused) {
                this.fireBullet(this.player1, this.player1.turret.rotation);
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
        }
    }
    
    createVirtualControls() {
        // 根据屏幕尺寸计算控制元素大小和位置
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const controlScale = Math.min(screenWidth, screenHeight) / 768; // 基于768px屏幕尺寸缩放
        
        // 摇杆配置
        const joystickSize = 60 * controlScale;
        const joystickHandleSize = 30 * controlScale;
        const joystickX = joystickSize + 20 * controlScale;
        const joystickY = screenHeight - joystickSize - 20 * controlScale;
        
        // 攻击按钮配置
        const attackButtonSize = 50 * controlScale;
        const attackButtonHandleSize = 40 * controlScale;
        const attackButtonX = screenWidth - attackButtonSize - 20 * controlScale;
        const attackButtonY = screenHeight - attackButtonSize - 20 * controlScale;
        
        // 创建虚拟摇杆背景
        const joystickBackground = this.add.graphics();
        joystickBackground.fillStyle(0x222222, 0.5);
        joystickBackground.fillCircle(joystickX, joystickY, joystickSize);
        joystickBackground.setScrollFactor(0);
        
        // 创建虚拟摇杆
        this.joystick = this.add.circle(joystickX, joystickY, joystickHandleSize, 0x3498db, 0.8);
        this.joystick.setScrollFactor(0);
        this.joystick.setInteractive({ cursor: 'pointer' });
        
        // 创建攻击按钮
        const attackButtonBackground = this.add.graphics();
        attackButtonBackground.fillStyle(0x222222, 0.5);
        attackButtonBackground.fillCircle(attackButtonX, attackButtonY, attackButtonSize);
        attackButtonBackground.setScrollFactor(0);
        
        this.attackButton = this.add.circle(attackButtonX, attackButtonY, attackButtonHandleSize, 0xe74c3c, 0.8);
        this.attackButton.setScrollFactor(0);
        this.attackButton.setInteractive({ cursor: 'pointer' });
        
        // 添加攻击按钮文本
        this.attackText = this.add.text(attackButtonX, attackButtonY, '开火', {
            fontFamily: 'Noto Sans SC',
            fontSize: Math.max(12, 14 * controlScale) + 'px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(1, 1 * controlScale),
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 摇杆输入处理
        this.input.setDraggable(this.joystick);
        
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // 限制摇杆移动范围
            const distance = Phaser.Math.Distance.Between(joystickX, joystickY, dragX, dragY);
            const maxDistance = joystickSize;
            
            if (distance <= maxDistance) {
                gameObject.setPosition(dragX, dragY);
            } else {
                const angle = Phaser.Math.Angle.Between(joystickX, joystickY, dragX, dragY);
                const newX = joystickX + Math.cos(angle) * maxDistance;
                const newY = joystickY + Math.sin(angle) * maxDistance;
                gameObject.setPosition(newX, newY);
            }
        });
        
        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setPosition(joystickX, joystickY);
        });
        
        // 攻击按钮点击处理
        this.attackButton.on('pointerdown', () => {
            if (this.player1 && this.player1.alive && !this.isPaused) {
                this.fireBullet(this.player1, this.player1.turret.rotation);
                // 按钮按下效果
                this.tweens.add({
                    targets: this.attackButton,
                    scale: 0.9,
                    duration: 100,
                    yoyo: true
                });
            }
        });
        
        // 保存控制配置以便在updateMobileControls中使用
        this.controlConfig = {
            joystickX,
            joystickY,
            maxDistance: joystickSize
        };
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
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 归一化摇杆输入 (-1 到 1)
        const normalizedX = deltaX / maxDistance;
        const normalizedY = deltaY / maxDistance;
        
        // 设置死区阈值
        const deadZone = 0.15;
        
        if (distance > maxDistance * deadZone) {
            // 计算移动角度和速度
            const moveAngle = Math.atan2(deltaY, deltaX);
            const moveSpeed = Math.min(distance / maxDistance, 1) * 150;
            
            // 更新坦克旋转朝向摇杆方向
            this.player1.rotation = moveAngle;
            
            // 设置速度
            this.physics.velocityFromRotation(moveAngle, moveSpeed, this.player1.body.velocity);
            
            // 自动炮塔朝向
            this.player1.turret.rotation = moveAngle;
        } else {
            // 停止移动
            this.player1.setVelocity(0);
            this.player1.setAngularVelocity(0);
        }
    }
    
    setupCollisions() {
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
    }
    
    updatePlayers() {
        // 更新玩家1
        if (this.player1 && this.player1.alive) {
            // 移动
            if (this.keys.up.isDown) {
                this.physics.velocityFromRotation(this.player1.rotation, 150, this.player1.body.velocity);
            } else if (this.keys.down.isDown) {
                this.physics.velocityFromRotation(this.player1.rotation, -100, this.player1.body.velocity);
            } else {
                this.player1.setVelocity(0);
            }
            
            // 转向
            if (this.keys.left.isDown) {
                this.player1.setAngularVelocity(-200);
            } else if (this.keys.right.isDown) {
                this.player1.setAngularVelocity(200);
            } else {
                this.player1.setAngularVelocity(0);
            }
            
            // 更新炮塔位置
            this.player1.turret.x = this.player1.x;
            this.player1.turret.y = this.player1.y;
            
            // 边界检测
            this.checkBoundary(this.player1);
        }
        
        // 更新玩家2
        if (this.player2 && this.player2.alive) {
            // 移动
            if (this.keys2.up2.isDown) {
                this.physics.velocityFromRotation(this.player2.rotation, 150, this.player2.body.velocity);
            } else if (this.keys2.down2.isDown) {
                this.physics.velocityFromRotation(this.player2.rotation, -100, this.player2.body.velocity);
            } else {
                this.player2.setVelocity(0);
            }
            
            // 转向
            if (this.keys2.left2.isDown) {
                this.player2.setAngularVelocity(-200);
            } else if (this.keys2.right2.isDown) {
                this.player2.setAngularVelocity(200);
            } else {
                this.player2.setAngularVelocity(0);
            }
            
            // 炮塔转向
            if (this.keys2.turretLeft.isDown) {
                this.player2.turret.rotation -= 0.05;
            } else if (this.keys2.turretRight.isDown) {
                this.player2.turret.rotation += 0.05;
            }
            
            // 开火
            if (this.keys2.fire2.isDown && !this.isPaused) {
                this.fireBullet(this.player2, this.player2.turret.rotation);
            }
            
            // 更新炮塔位置
            this.player2.turret.x = this.player2.x;
            this.player2.turret.y = this.player2.y;
            
            // 边界检测
            this.checkBoundary(this.player2);
        }
    }
    
    updateEnemies() {
        const enemies = this.enemies.getChildren();
        enemies.forEach(enemy => {
            if (enemy && enemy.alive) {
                // 更新炮塔位置
                enemy.turret.x = enemy.x;
                enemy.turret.y = enemy.y;
                
                // 敌人AI移动
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
                
                // 边界检测
                this.checkBoundary(enemy);
                
                // 敌人AI开火
                enemy.lastFired += this.game.loop.delta;
                if (enemy.lastFired >= enemy.fireRate) {
                    enemy.lastFired = 0;
                    enemy.fireRate = Phaser.Math.Between(1000, 3000);
                    
                    // 瞄准玩家
                    let target = this.player1;
                    if (this.player2 && this.player2.alive && Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player2.x, this.player2.y) < Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player1.x, this.player1.y)) {
                        target = this.player2;
                    }
                    
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
    
    updateBullets() {
        // 优化子弹更新，使用过滤而不是遍历和删除
        this.bullets = this.bullets.filter(bullet => {
            if (bullet && bullet.active) {
                // 检查子弹是否超出边界
                this.checkBulletBoundary(bullet);
                return bullet.active;
            }
            return false;
        });
    }
    
    fireBullet(tank, angle, isEnemy = false) {
        // 从对象池获取子弹
        let bullet = this.bulletPool.find(b => !b.active);
        if (!bullet) {
            // 如果对象池为空，创建新子弹
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
        
        // 添加到子弹数组
        this.bullets.push(bullet);
        
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
            }
        });
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
        if (bullet && bullet.active && player && player.alive && bullet.isEnemy) {
            player.health -= bullet.damage;
            
            // 显示伤害效果
            this.showDamageEffect(player.x, player.y);
            
            // 播放击中音效
            this.playSound('hit');
            
            // 被击中振动
            this.vibrate([80]);
            
            bullet.setActive(false).setVisible(false);
            const index = this.bullets.indexOf(bullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
            
            // 更新生命值条
            this.updateHealthBar('player1', player.health);
            
            // 检查玩家是否被击败
            if (player.health <= 0) {
                this.playerDefeated(player);
            }
        }
    }
    
    bulletHitPlayer2(bullet, player) {
        if (bullet && bullet.active && player && player.alive && bullet.isEnemy) {
            player.health -= bullet.damage;
            
            // 显示伤害效果
            this.showDamageEffect(player.x, player.y);
            
            // 播放击中音效
            this.playSound('hit');
            
            // 被击中振动
            this.vibrate([80]);
            
            bullet.setActive(false).setVisible(false);
            const index = this.bullets.indexOf(bullet);
            if (index > -1) {
                this.bullets.splice(index, 1);
            }
            
            // 更新生命值条
            this.updateHealthBar('player2', player.health);
            
            // 检查玩家是否被击败
            if (player.health <= 0) {
                this.playerDefeated(player);
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
        
        frequency.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                // 设置音量 envelope
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, index * 50);
        });
    }
    
    initObjectPools() {
        this.bulletPool = [];
        this.particlePool = [];
        this.textPool = [];
        
        // 预创建子弹对象
        for (let i = 0; i < 20; i++) {
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
        
        // 预创建粒子对象
        for (let i = 0; i < 30; i++) {
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
        if (!damageText) {
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
        
        damageText.setPosition(x, y)
            .setActive(true)
            .setVisible(true)
            .setAlpha(1)
            .setScale(1)
            .setRotation(0);
        
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 60,
            alpha: 0,
            scale: 1.5,
            rotation: Math.PI / 4,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (damageText) {
                    damageText.setActive(false).setVisible(false);
                }
            }
        });
        
        // 增强伤害特效粒子效果
        for (let i = 0; i < 6; i++) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle) {
                particle = this.add.image(0, 0, 'bullet')
                    .setScale(0.1)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            const angle = i * Math.PI / 3;
            const distance = Phaser.Math.Between(20, 40);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            particle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(0.8)
                .setScale(0.1)
                .setTint(0xff4444);
            
            this.tweens.add({
                targets: particle,
                x: particleX,
                y: particleY,
                scale: 0.2 + Math.random() * 0.1,
                alpha: 0,
                duration: 500 + Math.random() * 300,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
        
        // 添加火花效果
        for (let i = 0; i < 4; i++) {
            let spark = this.particlePool.find(p => !p.active);
            if (!spark) {
                spark = this.add.image(0, 0, 'bullet')
                    .setScale(0.05)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(spark);
            }
            
            const angle = i * Math.PI / 2;
            const distance = Phaser.Math.Between(30, 60);
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;
            
            spark.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.05)
                .setTint(0xffff44);
            
            this.tweens.add({
                targets: spark,
                x: sparkX,
                y: sparkY,
                scale: 0,
                alpha: 0,
                duration: 300 + Math.random() * 200,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (spark) {
                        spark.setActive(false).setVisible(false);
                        spark.clearTint();
                    }
                }
            });
        }
    }
    
    showExplosionEffect(x, y) {
        // 播放爆炸音效
        this.playSound('explosion');
        
        // 爆炸振动
        this.vibrate([100, 50, 100]);
        
        // 创建主爆炸效果
        const explosion = this.add.image(x, y, 'explosion')
            .setScale(0.5)
            .setAlpha(1);
        
        this.tweens.add({
            targets: explosion,
            scale: 2.5,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // 增强爆炸冲击波效果
        for (let i = 0; i < 3; i++) {
            const shockwave = this.add.graphics();
            const initialRadius = 10 + i * 20;
            const finalRadius = 100 + i * 50;
            
            shockwave.lineStyle(2 - i * 0.5, 0xffffff - i * 0x333333, 1 - i * 0.3);
            shockwave.strokeCircle(x, y, initialRadius);
            
            this.tweens.add({
                targets: shockwave,
                scale: finalRadius / initialRadius,
                alpha: 0,
                duration: 600,
                delay: i * 100,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    shockwave.destroy();
                }
            });
        }
        
        // 增强爆炸粒子效果
        for (let i = 0; i < 12; i++) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle) {
                particle = this.add.image(0, 0, 'smoke')
                    .setScale(0.2)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = Phaser.Math.Between(60, 120);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            particle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(0.8)
                .setScale(0.2)
                .setTint(0xffffff - Math.floor(Math.random() * 0x444444));
            
            this.tweens.add({
                targets: particle,
                x: particleX,
                y: particleY,
                scale: 0.5 + Math.random() * 0.8,
                alpha: 0,
                duration: 800 + Math.random() * 400,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
        
        // 添加火焰粒子效果
        for (let i = 0; i < 8; i++) {
            let fireParticle = this.particlePool.find(p => !p.active);
            if (!fireParticle) {
                fireParticle = this.add.image(0, 0, 'bullet')
                    .setScale(0.1)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(fireParticle);
            }
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = Phaser.Math.Between(30, 60);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            fireParticle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(1)
                .setScale(0.1)
                .setTint(0xff6600 + Math.floor(Math.random() * 0x333300));
            
            this.tweens.add({
                targets: fireParticle,
                x: particleX,
                y: particleY,
                scale: 0.3 + Math.random() * 0.2,
                alpha: 0,
                duration: 400 + Math.random() * 200,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (fireParticle) {
                        fireParticle.setActive(false).setVisible(false);
                        fireParticle.clearTint();
                    }
                }
            });
        }
        
        // 添加地面震动效果
        this.cameras.main.shake(300, 0.01);
    }
    
    updateHealthBar(playerType, health) {
        // 清除旧的生命值条
        const children = this.children.getChildren();
        children.forEach(child => {
            if (child && child.text && child.text.includes(`${playerType === 'player1' ? '玩家1' : '玩家2'}:`)) {
                child.destroy();
            }
        });
        
        // 根据屏幕尺寸计算UI元素大小
        const screenWidth = this.cameras.main.width;
        const isMobile = screenWidth < 600;
        const uiScale = isMobile ? 0.7 : 1;
        const uiPadding = 10 * uiScale;
        const textPadding = 20 * uiScale;
        const healthBarY = this.cameras.main.height - 80 * uiScale;
        const healthBarWidth = 200 * uiScale;
        
        // 创建新的生命值条
        if (playerType === 'player1') {
            this.createHealthBar(uiPadding + textPadding, healthBarY, '玩家1', health, 0x3498db, uiScale);
        } else if (playerType === 'player2') {
            this.createHealthBar(screenWidth - healthBarWidth - uiPadding - textPadding, healthBarY, '玩家2', health, 0xe74c3c, uiScale);
        }
    }
    
    checkLevelComplete() {
        if (this.enemiesDefeated >= this.enemiesToDefeat) {
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
                    bullet.destroy();
                }
            });
            this.bullets = [];
            
            // 创建新的敌人
            this.createEnemies();
            
            // 重新设置碰撞检测
            this.setupCollisions();
            
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
        
        // 添加庆祝文字效果
        const levelUpText = this.add.text(x, y - 50, '关卡完成!', {
            fontFamily: 'Noto Sans SC',
            fontSize: '36px',
            fill: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);
        
        this.tweens.add({
            targets: levelUpText,
            alpha: 1,
            scale: 1.2,
            duration: 500,
            ease: 'Cubic.easeOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
        
        // 添加彩色粒子效果
        for (let i = 0; i < 20; i++) {
            let particle = this.particlePool.find(p => !p.active);
            if (!particle) {
                particle = this.add.image(0, 0, 'explosion')
                    .setScale(0.3)
                    .setActive(false)
                    .setVisible(false);
                this.particlePool.push(particle);
            }
            
            const angle = (i / 20) * Math.PI * 2;
            const distance = Phaser.Math.Between(150, 250);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            // 彩色粒子
            const colors = [0x3498db, 0x2ecc71, 0xe74c3c, 0xf39c12, 0x9b59b6];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.setPosition(x, y)
                .setActive(true)
                .setVisible(true)
                .setAlpha(0.8)
                .setScale(0.3)
                .setTint(color);
            
            this.tweens.add({
                targets: particle,
                x: particleX,
                y: particleY,
                scale: 0,
                alpha: 0,
                duration: 1000 + Math.random() * 500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle) {
                        particle.setActive(false).setVisible(false);
                        particle.clearTint();
                    }
                }
            });
        }
        
        // 添加中心爆炸效果
        for (let i = 0; i < 8; i++) {
            const firework = this.add.image(x, y, 'explosion')
                .setScale(0.2)
                .setAlpha(1)
                .setTint(0xffffff);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = Phaser.Math.Between(80, 120);
            const fireworkX = x + Math.cos(angle) * distance;
            const fireworkY = y + Math.sin(angle) * distance;
            
            this.tweens.add({
                targets: firework,
                x: fireworkX,
                y: fireworkY,
                scale: 0.6,
                alpha: 0,
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    firework.destroy();
                }
            });
        }
        
        // 添加背景闪烁效果
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 0.3);
        flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                flash.destroy();
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
}