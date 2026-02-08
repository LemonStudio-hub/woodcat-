/**
 * 木头猫游戏通用音频和振动模块（基于Web Audio API）
 * 提供统一的音效和振动反馈功能
 */

// 使用全局Logger对象（如果不存在则创建一个简单的替代实现）
if (!window.Logger) {
    window.Logger = {
        info: function(...args) { console.info(...args); },
        warn: function(...args) { console.warn(...args); },
        error: function(...args) { console.error(...args); }
    };
}

// 本地引用全局Logger
if (typeof Logger === 'undefined') {
    var Logger = window.Logger;
}

class GameAudioVibrationModule {
    constructor() {
        this.vibrationEnabled = true;
        this.soundEnabled = true;
        this.audioContext = null;
        
        // 初始化音频系统
        this.initAudio();
    }
    
    /**
     * 初始化音频系统
     */
    initAudio() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            Logger.warn('Web Audio API 未支持，音频功能将不可用');
        }
    }
    
    /**
     * 恢复音频上下文（在用户交互后调用）
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * 播放音调音效
     * @param {number|number[]} frequency - 频率或频率数组
     * @param {number} duration - 持续时间(毫秒)
     * @param {string} waveform - 波形类型
     * @param {number} volume - 音量
     */
    playSound(frequency, duration, waveform = 'sine', volume = 0.1) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // 恢复音频上下文
        this.resumeAudioContext();
        
        try {
            // 创建振荡器
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置音量
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
            
            // 设置波形
            oscillator.type = waveform;
            
            // 处理频率
            if (Array.isArray(frequency) && frequency.length > 1) {
                // 多个频率，依次播放
                const stepDuration = duration / frequency.length;
                oscillator.frequency.setValueAtTime(frequency[0], this.audioContext.currentTime);
                
                for (let i = 1; i < frequency.length; i++) {
                    oscillator.frequency.setValueAtTime(frequency[i], this.audioContext.currentTime + (i * stepDuration) / 1000);
                }
            } else {
                // 单个频率
                const freq = Array.isArray(frequency) ? frequency[0] : frequency;
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            }
            
            // 开始播放
            oscillator.start(this.audioContext.currentTime);
            
            // 停止播放
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            Logger.error('播放音效时出错:', e);
        }
    }
    
    /**
     * 播放预设音效
     */
    playPresetSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // 根据音效类型生成相应的音效
        switch(type) {
            case 'click':
                this.playSound(400, 100, 'sine', 0.08);
                break;
            case 'move':
                this.playSound(300, 200, 'sine', 0.1);
                break;
            case 'success':
                this.playSound(523.25, 300, 'sine', 0.15); // C音符
                break;
            case 'error':
                this.playSound(220, 400, 'sine', 0.15); // A音符
                break;
            case 'win':
                // 播放上升的音调序列
                this.playSound([261.63, 329.63, 392.00, 523.25], 800, 'sine', 0.15); // C-E-G-C
                break;
            case 'lose':
                // 播放下降的音调序列
                this.playSound([261.63, 220, 196], 600, 'sine', 0.15); // C-A-G
                break;
            case 'cardFlip':
                this.playSound(300, 150, 'sine', 0.08);
                break;
            case 'match':
                this.playSound([300, 400, 500], 500, 'sine', 0.12); // 上升音调
                break;
            case 'mismatch':
                this.playSound([300, 200], 400, 'sine', 0.12); // 下降音调
                break;
        }
    }
    
    /**
     * 播放移动音效
     */
    playMoveSound() {
        this.playPresetSound('move');
    }
    
    /**
     * 播放匹配/成功音效
     */
    playSuccessSound() {
        this.playPresetSound('success');
    }
    
    /**
     * 播放错误/失败音效
     */
    playErrorSound() {
        this.playPresetSound('error');
    }
    
    /**
     * 播放胜利音效
     */
    playWinSound() {
        this.playPresetSound('win');
    }
    
    /**
     * 播放失败音效
     */
    playLoseSound() {
        this.playPresetSound('lose');
    }
    
    /**
     * 播放点击音效
     */
    playClickSound() {
        this.playPresetSound('click');
    }
    
    /**
     * 播放卡牌翻转音效
     */
    playCardFlipSound() {
        this.playPresetSound('cardFlip');
    }
    
    /**
     * 播放匹配音效 (记忆卡牌游戏)
     */
    playMatchSound() {
        this.playPresetSound('match');
    }
    
    /**
     * 播放不匹配音效 (记忆卡牌游戏)
     */
    playMismatchSound() {
        this.playPresetSound('mismatch');
    }
    
    /**
     * 振动反馈
     * @param {number|number[]} pattern - 振动模式
     */
    vibrate(pattern) {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
    
    /**
     * 短振动反馈
     */
    vibrateShort() {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    /**
     * 中等长度振动反馈
     */
    vibrateMedium() {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    /**
     * 长振动反馈
     */
    vibrateLong() {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(200);
        }
    }
    
    /**
     * 成功振动反馈
     */
    vibrateSuccess() {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
    
    /**
     * 失败振动反馈
     */
    vibrateFailure() {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate([150, 100, 150]);
        }
    }
    
    /**
     * 开启振动功能
     */
    enableVibration() {
        this.vibrationEnabled = true;
    }
    
    /**
     * 关闭振动功能
     */
    disableVibration() {
        this.vibrationEnabled = false;
    }
    
    /**
     * 开启音频功能
     */
    enableSound() {
        this.soundEnabled = true;
    }
    
    /**
     * 关闭音频功能
     */
    disableSound() {
        this.soundEnabled = false;
    }
    
    /**
     * 检查是否支持振动功能
     */
    isVibrationSupported() {
        return !!navigator.vibrate;
    }
    
    /**
     * 检查是否支持音频功能
     */
    isAudioSupported() {
        return !!this.audioContext;
    }
}

// 初始化模块
let gameAudioVibration = null;

function initAudioVibrationModule() {
    gameAudioVibration = new GameAudioVibrationModule();
}

// 初始化模块
initAudioVibrationModule();

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameAudioVibrationModule, gameAudioVibration };
} else {
    window.GameAudioVibrationModule = GameAudioVibrationModule;
    window.gameAudioVibration = gameAudioVibration;
}

// 在用户交互时恢复音频上下文
document.addEventListener('touchstart', () => {
    if (gameAudioVibration) {
        gameAudioVibration.resumeAudioContext();
    }
});

document.addEventListener('click', () => {
    if (gameAudioVibration) {
        gameAudioVibration.resumeAudioContext();
    }
});