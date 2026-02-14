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
        const background = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8
        );
        
        // 背景进入动画
        background.setAlpha(0);
        this.tweens.add({
            targets: background,
            alpha: 0.8,
            duration: 500,
            ease: 'Cubic.easeOut'
        });
        
        // 创建游戏结束标题 - 增强视觉效果
        const titleColor = this.isVictory ? '#2ecc71' : '#e74c3c';
        const title = this.add.text(this.cameras.main.centerX, 150, this.isVictory ? '游戏胜利!' : '游戏结束', {
            fontFamily: 'Noto Sans SC',
            fontSize: '56px',
            fill: titleColor,
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold',
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000',
                blur: 8,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        
        // 标题动画
        title.setAlpha(0);
        title.setScale(0.3);
        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 800,
            delay: 200,
            ease: 'Elastic.easeOut'
        });
        
        // 显示分数 - 延迟显示
        const scoreText = this.add.text(this.cameras.main.centerX, 240, `最终分数: ${this.score}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        scoreText.setAlpha(0);
        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            y: 240,
            duration: 500,
            delay: 400,
            ease: 'Cubic.easeOut'
        });
        
        // 显示关卡
        const levelText = this.add.text(this.cameras.main.centerX, 300, `达到关卡: ${this.level}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '28px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        levelText.setAlpha(0);
        this.tweens.add({
            targets: levelText,
            alpha: 1,
            duration: 500,
            delay: 500,
            ease: 'Cubic.easeOut'
        });
        
        // 显示最高分
        const highScoreText = this.add.text(this.cameras.main.centerX, 350, `最高分: ${this.game.gameState.score.player1}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '28px',
            fill: '#f39c12',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        highScoreText.setAlpha(0);
        this.tweens.add({
            targets: highScoreText,
            alpha: 1,
            duration: 500,
            delay: 600,
            ease: 'Cubic.easeOut'
        });
        
        // 检查是否创造了新纪录
        if (this.score > this.game.gameState.score.player1) {
            const newRecordText = this.add.text(this.cameras.main.centerX, 410, '🎉 新纪录! 🎉', {
                fontFamily: 'Noto Sans SC',
                fontSize: '32px',
                fill: '#f1c40f',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold',
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }).setOrigin(0.5);
            
            newRecordText.setAlpha(0);
            newRecordText.setScale(0.5);
            this.tweens.add({
                targets: newRecordText,
                alpha: 1,
                scale: 1.2,
                duration: 800,
                delay: 700,
                ease: 'Elastic.easeOut',
                yoyo: true,
                repeat: -1
            });
        }
        
        // 创建按钮
        const buttons = [
            { text: '再玩一次', y: 480, action: () => this.playAgain() },
            { text: '返回主菜单', y: 550, action: () => this.returnToMenu() }
        ];
        
        buttons.forEach((config, index) => {
            this.createMenuButton(
                config.text,
                this.cameras.main.centerX,
                config.y,
                config.action,
                800 + index * 100
            );
        });
        
        // 背景装饰
        this.createBackgroundDecorations();
    }
    
    createMenuButton(text, x, y, callback, delay) {
        // 创建按钮背景
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x16213e, 0.9);
        buttonBg.fillRoundedRect(x - 120, y - 30, 240, 60, 12);
        buttonBg.lineStyle(3, this.isVictory ? 0x2ecc71 : 0xe74c3c, 1);
        buttonBg.strokeRoundedRect(x - 120, y - 30, 240, 60, 12);
        buttonBg.setAlpha(0);
        
        // 创建按钮文本
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Noto Sans SC',
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        buttonText.setAlpha(0);
        
        // 按钮进入动画
        this.tweens.add({
            targets: [buttonBg, buttonText],
            alpha: 1,
            duration: 400,
            delay: delay,
            ease: 'Cubic.easeOut'
        });
        
        // 按钮交互
        buttonBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // 按钮按下效果
                this.tweens.add({
                    targets: buttonBg,
                    scale: 0.95,
                    duration: 100,
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        callback();
                    }
                });
            })
            .on('pointerover', () => {
                this.tweens.add({
                    targets: buttonBg,
                    fillStyle: 0x0f3460,
                    duration: 200
                });
                buttonBg.clear();
                buttonBg.fillStyle(0x0f3460, 0.95);
                buttonBg.fillRoundedRect(x - 120, y - 30, 240, 60, 12);
                buttonBg.lineStyle(3, this.isVictory ? 0x2ecc71 : 0xe74c3c, 1);
                buttonBg.strokeRoundedRect(x - 120, y - 30, 240, 60, 12);
                
                buttonText.setFill(this.isVictory ? '#2ecc71' : '#e74c3c');
            })
            .on('pointerout', () => {
                this.tweens.add({
                    targets: buttonBg,
                    fillStyle: 0x16213e,
                    duration: 200
                });
                buttonBg.clear();
                buttonBg.fillStyle(0x16213e, 0.9);
                buttonBg.fillRoundedRect(x - 120, y - 30, 240, 60, 12);
                buttonBg.lineStyle(3, this.isVictory ? 0x2ecc71 : 0xe74c3c, 1);
                buttonBg.strokeRoundedRect(x - 120, y - 30, 240, 60, 12);
                
                buttonText.setFill('#ffffff');
            });
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