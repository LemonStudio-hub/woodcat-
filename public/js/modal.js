// 通用模态框系统
class GameModal {
  constructor() {
    this.modals = new Map();
    this.createGlobalModal();
  }

  // 创建全局模态框元素
  createGlobalModal() {
    // 防止重复创建
    if (document.getElementById('game-modal-overlay')) {
      return;
    }

    const modalHtml = `
      <div id="game-modal-overlay" class="game-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10000; opacity: 0; transition: opacity 0.3s ease; align-items: center; justify-content: center;">
        <div class="game-modal-content" style="background: white; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); transform: scale(0.8); transition: transform 0.3s ease; overflow: hidden; animation: modalPop 0.3s forwards;">
          <div class="game-modal-header" style="padding: 20px; background: #3498db; color: white; display: flex; justify-content: space-between; align-items: center;">
            <h3 id="game-modal-title" style="margin: 0; font-size: 1.2rem;">提示</h3>
            <span id="game-modal-close" style="font-size: 1.5rem; cursor: pointer; background: none; border: none; color: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background-color 0.2s;">&times;</span>
          </div>
          <div class="game-modal-body" style="padding: 20px;">
            <p id="game-modal-message" style="margin: 0; font-size: 1rem; color: #333; line-height: 1.5;"></p>
          </div>
          <div class="game-modal-footer" style="padding: 15px 20px; display: flex; justify-content: flex-end; border-top: 1px solid #eee;">
            <button id="game-modal-confirm" class="btn-primary" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">确定</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 添加动画关键帧
    if (!document.getElementById('game-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'game-modal-styles';
      style.textContent = `
        @keyframes modalPop {
          to { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 显示模态框
  show(options = {}) {
    const {
      title = '提示',
      message = '',
      showConfirmButton = true,
      onConfirm = null,
      onClose = null,
      confirmText = '确定',
      closeOnOverlayClick = true
    } = options;

    const overlay = document.getElementById('game-modal-overlay');
    const titleEl = document.getElementById('game-modal-title');
    const messageEl = document.getElementById('game-modal-message');
    const confirmBtn = document.getElementById('game-modal-confirm');
    const closeBtn = document.getElementById('game-modal-close');

    if (!overlay) return;

    // 设置内容
    titleEl.textContent = title;
    messageEl.textContent = message;

    // 设置确认按钮
    if (showConfirmButton) {
      confirmBtn.style.display = 'block';
      confirmBtn.textContent = confirmText;
    } else {
      confirmBtn.style.display = 'none';
    }

    // 清除之前的事件监听器
    this.clearEventListeners();

    // 设置事件监听器
    const handleConfirm = () => {
      this.clearEventListeners();
      if (onConfirm) onConfirm();
      this.hide();
    };

    const handleClose = () => {
      this.clearEventListeners();
      if (onClose) onClose();
      this.hide();
    };

    const handleOverlayClick = (e) => {
      if (e.target === overlay && closeOnOverlayClick) {
        handleClose();
      }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    closeBtn.addEventListener('click', handleClose);
    overlay.addEventListener('click', handleOverlayClick);

    // 显示模态框
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('.game-modal-content').style.transform = 'scale(1)';
    }, 10);
  }

  // 隐藏模态框
  hide() {
    const overlay = document.getElementById('game-modal-overlay');
    if (!overlay) return;

    overlay.style.opacity = '0';
    overlay.querySelector('.game-modal-content').style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }

  // 清除事件监听器
  clearEventListeners() {
    const overlay = document.getElementById('game-modal-overlay');
    if (!overlay) return;

    // 移除所有事件监听器（通过重新创建元素的方式）
    overlay.replaceWith(overlay.cloneNode(true));
  }

  // 显示成功模态框
  showSuccess(message, onConfirm = null) {
    this.show({
      title: '成功',
      message,
      onConfirm
    });
  }

  // 显示错误模态框
  showError(message, onConfirm = null) {
    this.show({
      title: '错误',
      message,
      onConfirm
    });
  }

  // 显示警告模态框
  showWarning(message, onConfirm = null) {
    this.show({
      title: '警告',
      message,
      onConfirm
    });
  }

  // 显示信息模态框
  showInfo(message, onConfirm = null) {
    this.show({
      title: '信息',
      message,
      onConfirm
    });
  }
}

// 创建全局实例
const gameModal = new GameModal();

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.GameModal = GameModal;
  window.gameModal = gameModal;
}

// 也可以作为模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameModal, gameModal };
}