/**
 * 轻量级手势操作控制器
 * 支持滑动手势（上、下、左、右）
 */
class GestureController {
    /**
     * 初始化手势控制器
     * @param {HTMLElement} element - 需要监听手势的DOM元素
     * @param {Object} options - 配置选项
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            // 最小滑动距离阈值
            minSwipeDistance: options.minSwipeDistance || 15,
            // 滑动速度阈值（像素/毫秒）
            minSwipeSpeed: options.minSwipeSpeed || 0.1,
            // 回调函数
            onSwipeLeft: options.onSwipeLeft || null,
            onSwipeRight: options.onSwipeRight || null,
            onSwipeUp: options.onSwipeUp || null,
            onSwipeDown: options.onSwipeDown || null,
            // 是否阻止默认行为
            preventDefault: options.preventDefault !== undefined ? options.preventDefault : true
        };
        
        // 触摸事件数据
        this.touchStartData = {
            x: 0,
            y: 0,
            time: 0
        };
        
        // 触摸事件监听器
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // 初始化触摸事件
        this.init();
    }
    
    /**
     * 初始化触摸事件监听器
     */
    init() {
        // 使用 passive: false 以确保可以调用 preventDefault
        const touchOptions = { passive: false };
        
        this.element.addEventListener('touchstart', this.handleTouchStart, touchOptions);
        this.element.addEventListener('touchmove', this.handleTouchMove, touchOptions);
        this.element.addEventListener('touchend', this.handleTouchEnd, touchOptions);
    }
    
    /**
     * 触摸开始事件处理
     */
    handleTouchStart(e) {
        if (this.options.preventDefault) {
            e.preventDefault();
        }
        
        const touch = e.touches[0];
        this.touchStartData.x = touch.clientX;
        this.touchStartData.y = touch.clientY;
        this.touchStartData.time = Date.now();
    }
    
    /**
     * 触摸移动事件处理
     */
    handleTouchMove(e) {
        if (this.options.preventDefault) {
            e.preventDefault();
        }
        
        // 可以在这里添加拖拽等其他手势处理
        if (this.options.onTouchMove) {
            this.options.onTouchMove(e);
        }
    }
    
    /**
     * 触摸结束事件处理
     */
    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();
        
        const deltaX = endX - this.touchStartData.x;
        const deltaY = endY - this.touchStartData.y;
        const deltaTime = endTime - this.touchStartData.time;
        
        // 计算滑动距离和速度
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = distance / Math.max(deltaTime, 1); // 避免除以0
        
        // 判断是否为有效滑动
        if (distance >= this.options.minSwipeDistance || speed >= this.options.minSwipeSpeed) {
            // 确定主要滑动方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 0) {
                    // 向右滑动
                    if (this.options.onSwipeRight) {
                        this.options.onSwipeRight(e, { 
                            deltaX, 
                            deltaY, 
                            deltaTime, 
                            speed, 
                            distance,
                            direction: 'right'
                        });
                    }
                } else {
                    // 向左滑动
                    if (this.options.onSwipeLeft) {
                        this.options.onSwipeLeft(e, { 
                            deltaX, 
                            deltaY, 
                            deltaTime, 
                            speed, 
                            distance,
                            direction: 'left'
                        });
                    }
                }
            } else {
                // 垂直滑动
                if (deltaY > 0) {
                    // 向下滑动
                    if (this.options.onSwipeDown) {
                        this.options.onSwipeDown(e, { 
                            deltaX, 
                            deltaY, 
                            deltaTime, 
                            speed, 
                            distance,
                            direction: 'down'
                        });
                    }
                } else {
                    // 向上滑动
                    if (this.options.onSwipeUp) {
                        this.options.onSwipeUp(e, { 
                            deltaX, 
                            deltaY, 
                            deltaTime, 
                            speed, 
                            distance,
                            direction: 'up'
                        });
                    }
                }
            }
        }
    }
    
    /**
     * 更新配置选项
     */
    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }
    
    /**
     * 销毁手势控制器
     */
    destroy() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    /**
     * 启用控制器
     */
    enable() {
        this.updateOptions({ preventDefault: true });
    }
    
    /**
     * 禁用控制器
     */
    disable() {
        this.updateOptions({ preventDefault: false });
    }
}

// 导出类（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureController;
} else {
    window.GestureController = GestureController;
}