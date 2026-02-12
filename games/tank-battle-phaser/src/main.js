import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1200,
            height: 900
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        PreloadScene,
        MenuScene,
        GameScene,
        PauseScene,
        GameOverScene
    ]
};

// 游戏实例
class TankBattleGame extends Phaser.Game {
    constructor(config) {
        super(config);
        
        // 全局游戏状态
        this.gameState = {
            score: {
                player1: 0,
                player2: 0
            },
            settings: {
                difficulty: 'easy',
                sound: true,
                music: true,
                controls: 'standard'
            },
            gameMode: 'single-player', // single-player or two-player
            currentLevel: 1
        };
        
        // 游戏存档系统
        this.saveSystem = {
            saveGame: () => {
                try {
                    localStorage.setItem('tankBattleSave', JSON.stringify(this.gameState));
                } catch (error) {
                    console.error('保存游戏失败:', error);
                }
            },
            loadGame: () => {
                try {
                    const savedState = localStorage.getItem('tankBattleSave');
                    if (savedState) {
                        this.gameState = JSON.parse(savedState);
                        return true;
                    }
                } catch (error) {
                    console.error('加载游戏失败:', error);
                }
                return false;
            },
            clearSave: () => {
                try {
                    localStorage.removeItem('tankBattleSave');
                } catch (error) {
                    console.error('清除存档失败:', error);
                }
            }
        };
    }
}

// 初始化游戏
const game = new TankBattleGame(config);

// 处理加载进度
window.addEventListener('load', () => {
    const loadingProgress = document.getElementById('loading-progress');
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (loadingProgress && loadingScreen) {
        // 模拟加载进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            loadingProgress.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 100);
    }
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    if (game) {
        game.scale.refresh();
    }
});

export default game;