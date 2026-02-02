/**
 * 木头猫游戏通用音频和振动模块（基于Howler.js）
 * 提供统一的音效和振动反馈功能
 */

class GameAudioVibrationModule {
    constructor() {
        this.vibrationEnabled = true;
        this.soundEnabled = true;
        
        // 预设音效的URL（使用预生成的音效或通过其他方式）
        this.presetSounds = {
            click: 'https://actions.google.com/sounds/v1/system/keyboard_click.ogg', // 示例URL，实际使用时会生成动态音效
            move: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg', // 示例URL
            success: 'https://actions.google.com/sounds/v1/retro_positive/retro_success.ogg', // 示例URL
            error: 'https://actions.google.com/sounds/v1/retro_negative/retro_negative_click.ogg', // 示例URL
            win: 'https://actions.google.com/sounds/v1/cartoon/toy_honk.ogg', // 示例URL
            lose: 'https://actions.google.com/sounds/v1/retro_negative/retro_game_over_female.ogg', // 示例URL
            cardFlip: 'https://actions.google.com/sounds/v1/foley/paper_rustle_short_foley.ogg', // 示例URL
            match: 'https://actions.google.com/sounds/v1/retro_arcade/retro_coin_drop_positive.ogg', // 示例URL
            mismatch: 'https://actions.google.com/sounds/v1/retro_arcade/retro_negative.ogg' // 示例URL
        };
        
        // 使用空的音效对象，因为我们会动态生成音效
        this.sounds = {};
        
        // 初始化音频系统
        this.initAudio();
    }
    
    /**
     * 初始化音频系统
     */
    initAudio() {
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js 未加载，音频功能将不可用');
            return;
        }
        
        // 预加载常用音效
        this.preloadPresetSounds();
    }
    
    /**
     * 预加载预设音效
     */
    preloadPresetSounds() {
        // 为每个预设音效创建一个空的Howl对象，避免在播放时重复创建
        // 在实际使用中，我们直接播放生成的音效
    }
    
    /**
     * 创建音调音效
     * @param {number|number[]} frequency - 频率或频率数组
     * @param {number} duration - 持续时间(毫秒)
     * @param {string} waveform - 波形类型
     * @param {number} volume - 音量
     */
    createToneSound(frequency, duration, waveform = 'sine', volume = 0.1) {
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js 未加载，无法创建音效');
            return null;
        }
        
        // 生成音频数据
        const sampleRate = 44100;
        const durationSec = duration / 1000;
        const numFrames = Math.min(sampleRate * durationSec, sampleRate); // 限制最大长度为1秒
        
        // 创建音频上下文来生成音频数据
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, numFrames, sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成音调
        for (let i = 0; i < numFrames; i++) {
            let value = 0;
            const t = i / sampleRate;
            
            // 支持单个频率或多个频率
            if (Array.isArray(frequency)) {
                for (let j = 0; j < frequency.length; j++) {
                    // 生成不同频率的音调，应用包络（fade-out）
                    const freq = frequency[j];
                    const envelope = Math.exp(-5 * t / durationSec); // 指数衰减
                    value += Math.sin(2 * Math.PI * freq * t) * envelope;
                }
                value /= frequency.length; // 平均化多个频率
            } else {
                // 单个频率
                const envelope = Math.exp(-5 * t / durationSec); // 指数衰减
                value = Math.sin(2 * Math.PI * frequency * t) * envelope;
            }
            
            data[i] = value * volume;
        }
        
        // 将音频数据转换为WAV格式的Base64 URL
        const wav = this.encodeWAV(buffer);
        const base64 = this.arrayBufferToBase64(wav);
        const wavUrl = 'data:audio/wav;base64,' + base64;
        
        // 创建Howler.js音效对象
        return new Howl({
            src: [wavUrl],
            volume: 1.0, // 音量已在生成音频时设置
            onload: function() {
                // console.log('音效加载完成');
            },
            onloaderror: function(id, msg) {
                console.error(`音效加载失败: ${msg}`);
            }
        });
    }
    
    /**
     * 将ArrayBuffer转换为Base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    /**
     * 将AudioBuffer编码为WAV格式
     */
    encodeWAV(audioBuffer) {
        const length = audioBuffer.length;
        const buffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(buffer);
        
        // WAV文件头
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true); // 文件大小
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // fmt块大小
        view.setUint16(20, 1, true); // 音频格式 (1 = PCM)
        view.setUint16(22, 1, true); // 声道数
        view.setUint32(24, audioBuffer.sampleRate, true); // 采样率
        view.setUint32(28, audioBuffer.sampleRate * 2, true); // 字节率
        view.setUint16(32, 2, true); // 块对齐
        view.setUint16(34, 16, true); // 位深度
        writeString(36, 'data');
        view.setUint32(40, length * 2, true); // 数据块大小
        
        // 写入音频数据
        const dataOffset = 44;
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < channelData.length; i++) {
            // 将-1到1的浮点数转换为-32768到32767的整数
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(dataOffset + i * 2, sample * 0x7FFF, true);
        }
        
        return buffer;
    }
    
    /**
     * 播放预设音效
     */
    playPresetSound(type) {
        if (!this.soundEnabled || typeof Howl === 'undefined') return;
        
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
                const winSound = this.createToneSound([261.63, 329.63, 392.00, 523.25], 800, 'sine', 0.15); // C-E-G-C
                if (winSound) winSound.play();
                break;
            case 'lose':
                // 播放下降的音调序列
                const loseSound = this.createToneSound([261.63, 220, 196], 600, 'sine', 0.15); // C-A-G
                if (loseSound) loseSound.play();
                break;
            case 'cardFlip':
                this.playSound(300, 150, 'sine', 0.08);
                break;
            case 'match':
                const matchSound = this.createToneSound([300, 400, 500], 500, 'sine', 0.12); // 上升音调
                if (matchSound) matchSound.play();
                break;
            case 'mismatch':
                const mismatchSound = this.createToneSound([300, 200], 400, 'sine', 0.12); // 下降音调
                if (mismatchSound) mismatchSound.play();
                break;
        }
    }
    
    /**
     * 播放音效
     * @param {number|number[]} frequency - 频率或频率数组
     * @param {number} duration - 持续时间(毫秒)
     * @param {string} waveform - 波形类型
     * @param {number} volume - 音量
     */
    playSound(frequency, duration, waveform = 'sine', volume = 0.1) {
        if (!this.soundEnabled || typeof Howl === 'undefined') return;
        
        const sound = this.createToneSound(frequency, duration, waveform, volume);
        if (sound) {
            sound.play();
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
        return typeof Howl !== 'undefined';
    }
    
    /**
     * 设置全局音量
     */
    setVolume(volume) {
        if (typeof Howl !== 'undefined') {
            Howler.volume(volume);
        }
    }
    
    /**
     * 停止所有音效
     */
    stopAllSounds() {
        if (typeof Howl !== 'undefined') {
            Howler.stop();
        }
    }
}

// 等待Howler.js加载完成后初始化模块
let gameAudioVibration = null;

function initAudioVibrationModule() {
    if (typeof Howl !== 'undefined') {
        gameAudioVibration = new GameAudioVibrationModule();
    } else {
        console.warn('Howler.js 未加载，音频功能将不可用');
    }
}

// 检查Howler.js是否已加载
if (typeof Howl !== 'undefined') {
    initAudioVibrationModule();
} else {
    // 如果Howler.js尚未加载，等待它加载完成后再初始化
    window.addEventListener('load', function() {
        setTimeout(initAudioVibrationModule, 100); // 短暂延迟确保库已加载
    });
}

// 导出模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameAudioVibrationModule, gameAudioVibration };
} else {
    window.GameAudioVibrationModule = GameAudioVibrationModule;
    window.gameAudioVibration = gameAudioVibration;
}