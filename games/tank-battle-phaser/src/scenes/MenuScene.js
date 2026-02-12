import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }
    
    create() {
        // 背景
        this.cameras.main.setBackgroundColor('#1a1a1a');
        
        // 添加动态背景效果
        this.createDynamicBackground();
        
        // 标题
        const title = this.add.text(this.cameras.main.centerX, 100, '坦克大战', {
            fontFamily: 'Noto Sans SC',
            fontSize: '48px',
            fontWeight: 'bold',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        
        // 添加标题动画
        this.tweens.add({
            targets: title,
            scale: 1.05,
            yoyo: true,
            repeat: -1,
            duration: 1500,
            ease: 'Sine.easeInOut'
        });
        
        // 副标题
        const subtitle = this.add.text(this.cameras.main.centerX, 160, 'TANK BATTLE', {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 按钮样式
        const buttonStyle = {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        };
        
        // 开始游戏按钮
        const startButton = this.createButton(this.cameras.main.centerX, 250, '开始游戏', buttonStyle, () => {
            this.scene.start('GameScene');
        });
        
        // 游戏模式按钮
        const modeButton = this.createButton(this.cameras.main.centerX, 320, '游戏模式', buttonStyle, () => {
            this.showGameModeMenu();
        });
        
        // 设置按钮
        const settingsButton = this.createButton(this.cameras.main.centerX, 390, '设置', buttonStyle, () => {
            this.showSettingsMenu();
        });
        
        // 关于按钮
        const aboutButton = this.createButton(this.cameras.main.centerX, 460, '关于', buttonStyle, () => {
            this.showAboutMenu();
        });
        
        // 添加按钮进入动画
        this.addButtonEnterAnimations([startButton, modeButton, settingsButton, aboutButton]);
    }
    
    createDynamicBackground() {
        // 创建动态背景效果
        
        // 网格背景
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x333333, 0.2);
        
        const gridSize = 40;
        for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
            grid.moveTo(x, 0);
            grid.lineTo(x, this.cameras.main.height);
        }
        for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
            grid.moveTo(0, y);
            grid.lineTo(this.cameras.main.width, y);
        }
        grid.strokePath();
        
        // 动态粒子
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.5 + 0.2;
            
            const particle = this.add.circle(x, y, size, 0x3498db, alpha);
            this.particles.push(particle);
            
            // 粒子动画
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + (Math.random() - 0.5) * 200,
                alpha: 0,
                duration: Math.random() * 3000 + 2000,
                ease: 'Linear',
                onComplete: () => {
                    // 重置粒子
                    particle.setPosition(Math.random() * this.cameras.main.width, Math.random() * this.cameras.main.height);
                    particle.setAlpha(Math.random() * 0.5 + 0.2);
                    
                    // 重新开始动画
                    this.tweens.add({
                        targets: particle,
                        x: particle.x + (Math.random() - 0.5) * 200,
                        y: particle.y + (Math.random() - 0.5) * 200,
                        alpha: 0,
                        duration: Math.random() * 3000 + 2000,
                        ease: 'Linear',
                        onComplete: () => {
                            this.tweens.add({
                                targets: particle,
                                x: particle.x + (Math.random() - 0.5) * 200,
                                y: particle.y + (Math.random() - 0.5) * 200,
                                alpha: 0,
                                duration: Math.random() * 3000 + 2000,
                                ease: 'Linear'
                            });
                        }
                    });
                }
            });
        }
        
        // 边框
        const border = this.add.graphics();
        border.lineStyle(2, 0x3498db, 0.3);
        border.strokeRect(50, 50, this.cameras.main.width - 100, this.cameras.main.height - 100);
    }
    
    createButton(x, y, text, style, callback) {
        // 创建按钮背景
        const buttonBackground = this.add.graphics();
        buttonBackground.fillStyle(0x222222, 0.8);
        buttonBackground.fillRoundedRect(x - 100, y - 20, 200, 40, 10);
        buttonBackground.lineStyle(2, 0x3498db, 0.7);
        buttonBackground.strokeRoundedRect(x - 100, y - 20, 200, 40, 10);
        
        // 创建按钮文本
        const button = this.add.text(x, y, text, style)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                // 按钮按下效果
                this.tweens.add({
                    targets: [button, buttonBackground],
                    scale: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: callback
                });
            })
            .on('pointerover', () => {
                // 鼠标悬停效果
                button.setFill('#3498db');
                buttonBackground.clear();
                buttonBackground.fillStyle(0x333333, 0.9);
                buttonBackground.fillRoundedRect(x - 100, y - 20, 200, 40, 10);
                buttonBackground.lineStyle(2, 0x3498db, 1);
                buttonBackground.strokeRoundedRect(x - 100, y - 20, 200, 40, 10);
            })
            .on('pointerout', () => {
                // 鼠标离开效果
                button.setFill('#ffffff');
                buttonBackground.clear();
                buttonBackground.fillStyle(0x222222, 0.8);
                buttonBackground.fillRoundedRect(x - 100, y - 20, 200, 40, 10);
                buttonBackground.lineStyle(2, 0x3498db, 0.7);
                buttonBackground.strokeRoundedRect(x - 100, y - 20, 200, 40, 10);
            });
        
        return button;
    }
    
    addButtonEnterAnimations(buttons) {
        // 添加按钮进入动画
        buttons.forEach((button, index) => {
            button.setAlpha(0);
            button.setY(button.y + 50);
            
            this.tweens.add({
                targets: button,
                alpha: 1,
                y: button.y - 50,
                duration: 500,
                delay: index * 100,
                ease: 'Cubic.easeOut'
            });
        });
    }
    
    showGameModeMenu() {
        // 隐藏主菜单元素
        this.children.each(child => {
            child.setVisible(false);
        });
        
        // 游戏模式菜单
        const menuTitle = this.add.text(this.cameras.main.centerX, 100, '选择游戏模式', {
            fontFamily: 'Noto Sans SC',
            fontSize: '32px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 添加标题动画
        this.tweens.add({
            targets: menuTitle,
            scale: 1.05,
            duration: 500,
            ease: 'Cubic.easeOut'
        });
        
        // 按钮样式
        const buttonStyle = {
            fontFamily: 'Noto Sans SC',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        };
        
        const singlePlayerButton = this.createButton(this.cameras.main.centerX, 200, '单人对战', buttonStyle, () => {
            this.game.gameState.gameMode = 'single-player';
            this.game.gameState.saveSystem.saveGame();
            this.scene.start('GameScene');
        });
        
        const twoPlayerButton = this.createButton(this.cameras.main.centerX, 280, '双人对战', buttonStyle, () => {
            this.game.gameState.gameMode = 'two-player';
            this.game.gameState.saveSystem.saveGame();
            this.scene.start('GameScene');
        });
        
        const backButton = this.createButton(this.cameras.main.centerX, 380, '返回', {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }, () => {
            this.scene.restart();
        });
        
        // 添加按钮进入动画
        this.addButtonEnterAnimations([singlePlayerButton, twoPlayerButton, backButton]);
    }
    
    showSettingsMenu() {
        // 隐藏主菜单元素
        this.children.each(child => {
            child.setVisible(false);
        });
        
        // 设置菜单
        const menuTitle = this.add.text(this.cameras.main.centerX, 100, '设置', {
            fontFamily: 'Noto Sans SC',
            fontSize: '32px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 添加标题动画
        this.tweens.add({
            targets: menuTitle,
            scale: 1.05,
            duration: 500,
            ease: 'Cubic.easeOut'
        });
        
        // 创建设置面板
        const panel = this.add.graphics();
        panel.fillStyle(0x111111, 0.8);
        panel.fillRoundedRect(this.cameras.main.centerX - 225, 150, 450, 320, 10);
        panel.lineStyle(2, 0x3498db, 0.7);
        panel.strokeRoundedRect(this.cameras.main.centerX - 225, 150, 450, 320, 10);
        
        // 难度设置
        const difficultyText = this.add.text(this.cameras.main.centerX, 200, `难度: ${this.game.gameState.settings.difficulty}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        const difficultyButton = this.createButton(this.cameras.main.centerX, 240, '更改难度', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }, () => {
            const difficulties = ['easy', 'medium', 'hard'];
            const currentIndex = difficulties.indexOf(this.game.gameState.settings.difficulty);
            const nextIndex = (currentIndex + 1) % difficulties.length;
            this.game.gameState.settings.difficulty = difficulties[nextIndex];
            this.game.gameState.saveSystem.saveGame();
            difficultyText.setText(`难度: ${this.game.gameState.settings.difficulty}`);
            
            // 添加文本变化动画
            this.tweens.add({
                targets: difficultyText,
                scale: 1.1,
                duration: 200,
                yoyo: true
            });
        });
        
        // 音效设置
        const soundText = this.add.text(this.cameras.main.centerX, 290, `音效: ${this.game.gameState.settings.sound ? '开' : '关'}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        const soundButton = this.createButton(this.cameras.main.centerX, 330, '切换音效', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }, () => {
            this.game.gameState.settings.sound = !this.game.gameState.settings.sound;
            this.game.gameState.saveSystem.saveGame();
            soundText.setText(`音效: ${this.game.gameState.settings.sound ? '开' : '关'}`);
            
            // 添加文本变化动画
            this.tweens.add({
                targets: soundText,
                scale: 1.1,
                duration: 200,
                yoyo: true
            });
        });
        
        // 音乐设置
        const musicText = this.add.text(this.cameras.main.centerX, 380, `音乐: ${this.game.gameState.settings.music ? '开' : '关'}`, {
            fontFamily: 'Noto Sans SC',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        const musicButton = this.createButton(this.cameras.main.centerX, 420, '切换音乐', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }, () => {
            this.game.gameState.settings.music = !this.game.gameState.settings.music;
            this.game.gameState.saveSystem.saveGame();
            musicText.setText(`音乐: ${this.game.gameState.settings.music ? '开' : '关'}`);
            
            // 添加文本变化动画
            this.tweens.add({
                targets: musicText,
                scale: 1.1,
                duration: 200,
                yoyo: true
            });
        });
        
        const backButton = this.createButton(this.cameras.main.centerX, 480, '返回', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }, () => {
            this.scene.restart();
        });
        
        // 添加元素进入动画
        this.tweens.add({
            targets: [panel, difficultyText, soundText, musicText],
            alpha: { from: 0, to: 1 },
            y: { from: -50, to: 0 },
            duration: 500,
            stagger: 100,
            ease: 'Cubic.easeOut'
        });
        
        // 添加按钮进入动画
        this.addButtonEnterAnimations([difficultyButton, soundButton, musicButton, backButton]);
    }
    
    showAboutMenu() {
        // 隐藏主菜单元素
        this.children.each(child => {
            child.setVisible(false);
        });
        
        // 关于菜单
        const menuTitle = this.add.text(this.cameras.main.centerX, 100, '关于游戏', {
            fontFamily: 'Noto Sans SC',
            fontSize: '32px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 添加标题动画
        this.tweens.add({
            targets: menuTitle,
            scale: 1.05,
            duration: 500,
            ease: 'Cubic.easeOut'
        });
        
        // 创建关于面板
        const panel = this.add.graphics();
        panel.fillStyle(0x111111, 0.8);
        panel.fillRoundedRect(this.cameras.main.centerX - 225, 150, 450, 320, 10);
        panel.lineStyle(2, 0x3498db, 0.7);
        panel.strokeRoundedRect(this.cameras.main.centerX - 225, 150, 450, 320, 10);
        
        const aboutText = this.add.text(this.cameras.main.centerX, 200, '坦克大战是一款经典的对战游戏，支持单人对战和双人对战模式。\n\n使用WASD键控制坦克移动，鼠标控制炮塔方向，点击鼠标左键开火。\n\n双人模式下，玩家2使用方向键控制移动，使用小键盘4和6控制炮塔方向，小键盘5键开火。', {
            fontFamily: 'Noto Sans SC',
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center',
            wordWrap: {
                width: 400,
                useAdvancedWrap: true
            }
        }).setOrigin(0.5);
        
        const versionText = this.add.text(this.cameras.main.centerX, 380, '版本: 1.0.0', {
            fontFamily: 'Noto Sans SC',
            fontSize: '16px',
            fill: '#7f8c8d',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        const backButton = this.createButton(this.cameras.main.centerX, 420, '返回', {
            fontFamily: 'Noto Sans SC',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }, () => {
            this.scene.restart();
        });
        
        // 添加元素进入动画
        this.tweens.add({
            targets: [panel, aboutText, versionText],
            alpha: { from: 0, to: 1 },
            y: { from: -50, to: 0 },
            duration: 500,
            stagger: 100,
            ease: 'Cubic.easeOut'
        });
        
        // 添加按钮进入动画
        this.addButtonEnterAnimations([backButton]);
    }
}