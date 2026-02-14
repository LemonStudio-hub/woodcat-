import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }
    
    create() {
        // 创建半透明背景
        const background = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        
        // 背景进入动画
        background.setAlpha(0);
        this.tweens.add({
            targets: background,
            alpha: 0.7,
            duration: 300,
            ease: 'Cubic.easeOut'
        });
        
        // 创建暂停标题 - 增强视觉效果
        const title = this.add.text(this.cameras.main.centerX, 150, '游戏暂停', {
            fontFamily: 'Noto Sans SC',
            fontSize: '48px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 4,
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
        
        // 标题动画
        title.setAlpha(0);
        title.setScale(0.5);
        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 500,
            delay: 100,
            ease: 'Elastic.easeOut'
        });
        
        // 按钮配置
        const buttons = [
            { text: '继续游戏', y: 250, action: () => this.resumeGame() },
            { text: '重新开始', y: 320, action: () => this.restartGame() },
            { text: '返回主菜单', y: 390, action: () => this.returnToMenu() },
            { text: '设置', y: 460, action: () => this.showSettings() }
        ];
        
        // 创建按钮
        this.menuButtons = [];
        buttons.forEach((config, index) => {
            const button = this.createMenuButton(
                config.text,
                this.cameras.main.centerX,
                config.y,
                config.action,
                index * 100
            );
            this.menuButtons.push(button);
        });
        
        // 背景装饰
        this.createBackgroundDecorations();
    }
    
    createMenuButton(text, x, y, callback, delay) {
        // 创建按钮背景
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x16213e, 0.8);
        buttonBg.fillRoundedRect(x - 100, y - 25, 200, 50, 10);
        buttonBg.lineStyle(2, 0x3498db, 1);
        buttonBg.strokeRoundedRect(x - 100, y - 25, 200, 50, 10);
        buttonBg.setAlpha(0);
        
        // 创建按钮文本
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        buttonText.setAlpha(0);
        
        // 按钮进入动画
        this.tweens.add({
            targets: [buttonBg, buttonText],
            alpha: 1,
            duration: 300,
            delay: delay,
            ease: 'Cubic.easeOut'
        });
        
        // 按钮交互
        const buttonContainer = this.add.container(x, y, [buttonBg, buttonText]);
        
        buttonBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // 按钮按下效果
                this.tweens.add({
                    targets: buttonContainer,
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
                buttonBg.fillStyle(0x0f3460, 0.9);
                buttonBg.fillRoundedRect(x - 100, y - 25, 200, 50, 10);
                buttonBg.lineStyle(2, 0x3498db, 1);
                buttonBg.strokeRoundedRect(x - 100, y - 25, 200, 50, 10);
                
                buttonText.setFill('#3498db');
            })
            .on('pointerout', () => {
                this.tweens.add({
                    targets: buttonBg,
                    fillStyle: 0x16213e,
                    duration: 200
                });
                buttonBg.clear();
                buttonBg.fillStyle(0x16213e, 0.8);
                buttonBg.fillRoundedRect(x - 100, y - 25, 200, 50, 10);
                buttonBg.lineStyle(2, 0x3498db, 1);
                buttonBg.strokeRoundedRect(x - 100, y - 25, 200, 50, 10);
                
                buttonText.setFill('#ffffff');
            });
        
        return { bg: buttonBg, text: buttonText, container: buttonContainer };
    }
    
    createBackgroundDecorations() {
        // 创建一些背景装饰元素
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            const size = Math.random() * 2 + 1;
            
            this.add.circle(x, y, size, 0x3498db, 0.7);
        }
        
        // 边框
        const border = this.add.graphics();
        border.lineStyle(2, 0x3498db, 0.5);
        border.strokeRect(100, 100, this.cameras.main.width - 200, this.cameras.main.height - 200);
    }
    
    resumeGame() {
        // 停止当前场景
        this.scene.stop();
        // 恢复游戏场景
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.resumeGame();
        }
    }
    
    restartGame() {
        // 停止当前场景
        this.scene.stop();
        // 停止游戏场景
        this.scene.stop('GameScene');
        // 重新启动游戏场景
        this.scene.start('GameScene');
    }
    
    returnToMenu() {
        // 停止当前场景
        this.scene.stop();
        // 停止游戏场景
        this.scene.stop('GameScene');
        // 启动菜单场景
        this.scene.start('MenuScene');
    }
    
    showSettings() {
        // 隐藏当前所有元素
        this.children.each(child => {
            child.setVisible(false);
        });
        
        // 创建设置标题
        const title = this.add.text(this.cameras.main.centerX, 150, '设置', {
            fontFamily: 'Noto Sans SC',
            fontSize: '48px',
            fill: '#3498db'
        }).setOrigin(0.5);
        
        // 难度设置
        const difficultyText = this.add.text(this.cameras.main.centerX, 230, `难度: ${this.game.gameState.settings.difficulty}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const difficultyButton = this.add.text(this.cameras.main.centerX, 280, '更改难度', {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#3498db'
        }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                const difficulties = ['easy', 'medium', 'hard'];
                const currentIndex = difficulties.indexOf(this.game.gameState.settings.difficulty);
                const nextIndex = (currentIndex + 1) % difficulties.length;
                this.game.gameState.settings.difficulty = difficulties[nextIndex];
                this.game.gameState.saveSystem.saveGame();
                difficultyText.setText(`难度: ${this.game.gameState.settings.difficulty}`);
            });
        
        // 音效设置
        const soundText = this.add.text(this.cameras.main.centerX, 340, `音效: ${this.game.gameState.settings.sound ? '开' : '关'}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const soundButton = this.add.text(this.cameras.main.centerX, 390, '切换音效', {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#3498db'
        }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.game.gameState.settings.sound = !this.game.gameState.settings.sound;
                this.game.gameState.saveSystem.saveGame();
                soundText.setText(`音效: ${this.game.gameState.settings.sound ? '开' : '关'}`);
            });
        
        // 音乐设置
        const musicText = this.add.text(this.cameras.main.centerX, 450, `音乐: ${this.game.gameState.settings.music ? '开' : '关'}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const musicButton = this.add.text(this.cameras.main.centerX, 500, '切换音乐', {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#3498db'
        }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.game.gameState.settings.music = !this.game.gameState.settings.music;
                this.game.gameState.saveSystem.saveGame();
                musicText.setText(`音乐: ${this.game.gameState.settings.music ? '开' : '关'}`);
            });
        
        // 返回按钮
        const backButton = this.add.text(this.cameras.main.centerX, 570, '返回', {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.restart();
            })
            .on('pointerover', () => {
                backButton.setFill('#3498db');
            })
            .on('pointerout', () => {
                backButton.setFill('#ffffff');
            });
    }
}