import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
        this.score = 0;
        this.level = 1;
        this.isVictory = false;
    }
    
    init(data) {
        // 接收来自游戏场景的数据
        this.score = data.score || 0;
        this.level = data.level || 1;
        this.isVictory = data.isVictory || false;
    }
    
    create() {
        // 创建半透明背景
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8
        );
        
        // 创建游戏结束标题
        const title = this.add.text(this.cameras.main.centerX, 150, this.isVictory ? '游戏胜利!' : '游戏结束', {
            fontFamily: 'Noto Sans SC',
            fontSize: '48px',
            fill: this.isVictory ? '#2ecc71' : '#e74c3c'
        }).setOrigin(0.5);
        
        // 显示分数
        const scoreText = this.add.text(this.cameras.main.centerX, 230, `最终分数: ${this.score}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 显示关卡
        const levelText = this.add.text(this.cameras.main.centerX, 280, `达到关卡: ${this.level}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 显示最高分
        const highScoreText = this.add.text(this.cameras.main.centerX, 330, `最高分: ${this.game.gameState.score.player1}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#f39c12'
        }).setOrigin(0.5);
        
        // 检查是否创造了新纪录
        if (this.score > this.game.gameState.score.player1) {
            const newRecordText = this.add.text(this.cameras.main.centerX, 380, '🎉 新纪录!', {
                fontFamily: 'Noto Sans SC',
                fontSize: '28px',
                fill: '#f1c40f'
            }).setOrigin(0.5);
        }
        
        // 按钮样式
        const buttonStyle = {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        };
        
        // 再玩一次按钮
        const playAgainButton = this.add.text(this.cameras.main.centerX, 450, '再玩一次', buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.playAgain();
            })
            .on('pointerover', () => {
                playAgainButton.setFill('#3498db');
            })
            .on('pointerout', () => {
                playAgainButton.setFill('#ffffff');
            });
        
        // 返回主菜单按钮
        const menuButton = this.add.text(this.cameras.main.centerX, 520, '返回主菜单', buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.returnToMenu();
            })
            .on('pointerover', () => {
                menuButton.setFill('#3498db');
            })
            .on('pointerout', () => {
                menuButton.setFill('#ffffff');
            });
        
        // 背景装饰
        this.createBackgroundDecorations();
    }
    
    createBackgroundDecorations() {
        // 创建一些背景装饰元素
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            const size = Math.random() * 3 + 1;
            
            this.add.circle(x, y, size, this.isVictory ? 0x2ecc71 : 0xe74c3c, 0.7);
        }
        
        // 边框
        const border = this.add.graphics();
        border.lineStyle(2, this.isVictory ? 0x2ecc71 : 0xe74c3c, 0.6);
        border.strokeRect(100, 100, this.cameras.main.width - 200, this.cameras.main.height - 200);
    }
    
    playAgain() {
        // 停止当前场景
        this.scene.stop();
        // 启动游戏场景
        this.scene.start('GameScene');
    }
    
    returnToMenu() {
        // 停止当前场景
        this.scene.stop();
        // 启动菜单场景
        this.scene.start('MenuScene');
    }
}