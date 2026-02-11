import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }
    
    preload() {
        // 加载进度条
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.centerX - 150, this.cameras.main.centerY - 25, 300, 50);
        
        const loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, '加载中...', {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const percentText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '0%', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const assetText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, '', {
            fontFamily: 'Noto Sans SC',
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 更新进度条
        this.load.on('progress', (value) => {
            percentText.setText(`${Math.round(value * 100)}%`);
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(this.cameras.main.centerX - 140, this.cameras.main.centerY - 15, 280 * value, 30);
        });
        
        this.load.on('fileprogress', (file) => {
            assetText.setText(`加载: ${file.key}`);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            
            // 延迟进入菜单场景
            setTimeout(() => {
                this.scene.start('MenuScene');
            }, 500);
        });
        
        // 加载游戏资源
        this.loadAssets();
    }
    
    loadAssets() {
        // 创建简单的坦克精灵（使用Phaser的图形API）
        this.createSimpleSprites();
        
        // 加载音效
        this.loadAudio();
    }
    
    loadAudio() {
        // 由于没有实际的音效文件，我们将在游戏中使用Web Audio API创建音效
        // 在GameScene中实现音效播放方法
    }
    
    createSimpleSprites() {
        // 创建军事风格的背景纹理
        const background = this.make.graphics();
        background.fillStyle(0x1a1a1a, 1);
        background.fillRect(0, 0, 800, 600);
        // 添加网格纹理
        background.lineStyle(1, 0x333333, 0.3);
        for (let x = 0; x <= 800; x += 40) {
            background.moveTo(x, 0);
            background.lineTo(x, 600);
        }
        for (let y = 0; y <= 600; y += 40) {
            background.moveTo(0, y);
            background.lineTo(800, y);
        }
        background.generateTexture('background', 800, 600);
        background.destroy();
        
        // 创建玩家1坦克精灵（军事蓝色）
        const player1Tank = this.make.graphics();
        // 坦克主体
        player1Tank.fillStyle(0x2c5aa0, 1);
        player1Tank.fillRect(5, 5, 30, 20);
        // 坦克履带
        player1Tank.fillStyle(0x333333, 1);
        player1Tank.fillRect(0, 0, 5, 30);
        player1Tank.fillRect(35, 0, 5, 30);
        // 坦克顶部
        player1Tank.fillStyle(0x1a4b8c, 1);
        player1Tank.fillRect(10, 2, 20, 6);
        player1Tank.generateTexture('tank-player1', 40, 30);
        player1Tank.destroy();
        
        // 创建玩家2坦克精灵（军事红色）
        const player2Tank = this.make.graphics();
        // 坦克主体
        player2Tank.fillStyle(0xa02c2c, 1);
        player2Tank.fillRect(5, 5, 30, 20);
        // 坦克履带
        player2Tank.fillStyle(0x333333, 1);
        player2Tank.fillRect(0, 0, 5, 30);
        player2Tank.fillRect(35, 0, 5, 30);
        // 坦克顶部
        player2Tank.fillStyle(0x8c1a1a, 1);
        player2Tank.fillRect(10, 2, 20, 6);
        player2Tank.generateTexture('tank-player2', 40, 30);
        player2Tank.destroy();
        
        // 创建敌人坦克精灵（军事绿色）
        const enemyTank = this.make.graphics();
        // 坦克主体
        enemyTank.fillStyle(0x2ca02c, 1);
        enemyTank.fillRect(5, 5, 30, 20);
        // 坦克履带
        enemyTank.fillStyle(0x333333, 1);
        enemyTank.fillRect(0, 0, 5, 30);
        enemyTank.fillRect(35, 0, 5, 30);
        // 坦克顶部
        enemyTank.fillStyle(0x1a8c1a, 1);
        enemyTank.fillRect(10, 2, 20, 6);
        enemyTank.generateTexture('tank-enemy', 40, 30);
        enemyTank.destroy();
        
        // 创建炮塔精灵
        const turret = this.make.graphics();
        turret.fillStyle(0x555555, 1);
        turret.fillRect(0, 3, 15, 4);
        turret.fillStyle(0x777777, 1);
        turret.fillRect(15, 2, 5, 6);
        turret.generateTexture('tank-turret', 20, 10);
        turret.destroy();
        
        // 创建子弹精灵
        const bullet = this.make.graphics();
        bullet.fillStyle(0xffff00, 1);
        bullet.fillCircle(5, 5, 4);
        bullet.lineStyle(1, 0xffffff, 1);
        bullet.strokeCircle(5, 5, 4);
        bullet.generateTexture('bullet', 10, 10);
        bullet.destroy();
        
        // 创建墙壁精灵
        const wall = this.make.graphics();
        wall.fillStyle(0x666666, 1);
        wall.fillRect(0, 0, 40, 40);
        // 添加砖块纹理
        wall.fillStyle(0x555555, 1);
        wall.fillRect(0, 0, 20, 20);
        wall.fillRect(20, 20, 20, 20);
        wall.generateTexture('wall', 40, 40);
        wall.destroy();
        
        // 创建爆炸特效精灵
        const explosion = this.make.graphics();
        explosion.fillStyle(0xffff00, 1);
        explosion.fillCircle(20, 20, 15);
        explosion.fillStyle(0xff8800, 1);
        explosion.fillCircle(20, 20, 10);
        explosion.fillStyle(0xff0000, 1);
        explosion.fillCircle(20, 20, 5);
        explosion.generateTexture('explosion', 40, 40);
        explosion.destroy();
        
        // 创建烟雾特效精灵
        const smoke = this.make.graphics();
        smoke.fillStyle(0x999999, 0.7);
        smoke.fillCircle(15, 15, 10);
        smoke.generateTexture('smoke', 30, 30);
        smoke.destroy();
    }
}