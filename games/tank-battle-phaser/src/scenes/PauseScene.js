import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }
    
    create() {
        // 创建半透明背景
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        
        // 创建暂停标题
        const title = this.add.text(this.cameras.main.centerX, 150, '游戏暂停', {
            fontFamily: 'Noto Sans SC',
            fontSize: '48px',
            fill: '#3498db'
        }).setOrigin(0.5);
        
        // 按钮样式
        const buttonStyle = {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff'
        };
        
        // 继续游戏按钮
        const resumeButton = this.add.text(this.cameras.main.centerX, 250, '继续游戏', buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.resumeGame();
            })
            .on('pointerover', () => {
                resumeButton.setFill('#3498db');
            })
            .on('pointerout', () => {
                resumeButton.setFill('#ffffff');
            });
        
        // 重新开始按钮
        const restartButton = this.add.text(this.cameras.main.centerX, 320, '重新开始', buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.restartGame();
            })
            .on('pointerover', () => {
                restartButton.setFill('#3498db');
            })
            .on('pointerout', () => {
                restartButton.setFill('#ffffff');
            });
        
        // 返回主菜单按钮
        const menuButton = this.add.text(this.cameras.main.centerX, 390, '返回主菜单', buttonStyle)
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
        
        // 设置按钮
        const settingsButton = this.add.text(this.cameras.main.centerX, 460, '设置', buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.showSettings();
            })
            .on('pointerover', () => {
                settingsButton.setFill('#3498db');
            })
            .on('pointerout', () => {
                settingsButton.setFill('#ffffff');
            });
        
        // 背景装饰
        this.createBackgroundDecorations();
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