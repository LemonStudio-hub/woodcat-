/**
 * 木头猫游戏通用音频和振动模块
 * 提供统一的音效和振动反馈功能
 */

class GameAudioVibrationModule {
    constructor() {
        this.audioContext = null;
        this.audioInitialized = false;
        this.vibrationEnabled = true;
        
        // 初始化音频上下文
        this.initAudio();
    }
    
    /**
     * 初始化音频上下文
     */
    initAudio() {
        if (this.audioInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 在移动端，需要用户交互后才能播放音频
            if (this.audioContext.state === 'suspended') {
                // 尝试恢复音频上下文
                this.audioContext.resume();
            }
            
            this.audioInitialized = true;
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    /**
     * 播放音效
     * @param {number} frequency - 频率
     * @param {number} duration - 持续时间(毫秒)
     * @param {string} type - 波形类型
     * @param {number} volume - 音量
     */
    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration / 1000);
        
        setTimeout(() => {
            oscillator.stop();
        }, duration);
    }
    
    /**
     * 播放移动音效
     */
    playMoveSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 300;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.2);
        
        setTimeout(() => {
            oscillator.stop();
        }, 200);
    }
    
    /**
     * 播放匹配/成功音效
     */
    playSuccessSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 523.25; // C音符
        gainNode.gain.value = 0.15;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.3);
        
        setTimeout(() => {
            oscillator.stop();
        }, 300);
    }
    
    /**
     * 播放错误/失败音效
     */
    playErrorSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 220; // A音符
        gainNode.gain.value = 0.15;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.4);
        
        setTimeout(() => {
            oscillator.stop();
        }, 400);
    }
    
    /**
     * 播放胜利音效
     */
    playWinSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // 播放上升的音调
        oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime); // C
        oscillator.frequency.exponentialRampToValueAtTime(329.63, this.audioContext.currentTime + 0.2); // E
        oscillator.frequency.exponentialRampToValueAtTime(392.00, this.audioContext.currentTime + 0.4); // G
        oscillator.frequency.exponentialRampToValueAtTime(523.25, this.audioContext.currentTime + 0.6); // C
        
        gainNode.gain.value = 0.15;
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.8);
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
        }, 800);
    }
    
    /**
     * 播放失败音效
     */
    playLoseSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // 播放下降的音调
        oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime); // C
        oscillator.frequency.exponentialRampToValueAtTime(220.00, this.audioContext.currentTime + 0.2); // A
        oscillator.frequency.exponentialRampToValueAtTime(196.00, this.audioContext.currentTime + 0.4); // G
        
        gainNode.gain.value = 0.15;
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.6);
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
        }, 600);
    }
    
    /**
     * 播放点击音效
     */
    playClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.08;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.1);
        
        setTimeout(() => {
            oscillator.stop();
        }, 100);
    }
    
    /**
     * 播放卡牌翻转音效
     */
    playCardFlipSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 300;
        gainNode.gain.value = 0.08;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.15);
        
        setTimeout(() => {
            oscillator.stop();
        }, 150);
    }
    
    /**
     * 播放匹配音效 (记忆卡牌游戏)
     */
    playMatchSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.value = 0.12;
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
        }, 500);
    }
    
    /**
     * 播放不匹配音效 (记忆卡牌游戏)
     */
    playMismatchSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.value = 0.12;
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.4);
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
        }, 400);
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
     * 检查是否支持振动功能
     */
    isVibrationSupported() {
        return !!navigator.vibrate;
    }
    
    /**
     * 检查是否支持音频功能
     */
    isAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    /**
     * 恢复音频上下文（在用户交互后）
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// 创建全局实例
const gameAudioVibration = new GameAudioVibrationModule();

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameAudioVibrationModule, gameAudioVibration };
} else {
    window.GameAudioVibrationModule = GameAudioVibrationModule;
    window.gameAudioVibration = gameAudioVibration;
}