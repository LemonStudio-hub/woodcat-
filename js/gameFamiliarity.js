// 游戏熟悉度询问系统
class GameFamiliaritySystem {
  constructor() {
    this.storageKeyPrefix = 'woodcat_game_familiarity_';
  }

  /**
   * 检查用户是否熟悉指定游戏
   * @param {string} gameId - 游戏ID
   * @returns {boolean} - 用户是否熟悉该游戏
   */
  isGameFamiliar(gameId) {
    const storageKey = `${this.storageKeyPrefix}${gameId}`;
    const storedValue = localStorage.getItem(storageKey);
    return storedValue === 'true';
  }

  /**
   * 标记用户熟悉指定游戏
   * @param {string} gameId - 游戏ID
   */
  markGameAsFamiliar(gameId) {
    const storageKey = `${this.storageKeyPrefix}${gameId}`;
    localStorage.setItem(storageKey, 'true');
  }

  /**
   * 显示游戏熟悉度询问模态框
   * @param {string} gameId - 游戏ID
   * @param {string} gameName - 游戏名称
   */
  showFamiliarityModal(gameId, gameName) {
    // 创建模态框元素
    const modalHtml = `
      <div id="familiarity-modal" class="familiarity-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        opacity: 0;
        transition: opacity 0.3s ease;
      ">
        <div class="familiarity-modal-content" style="
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transform: scale(0.8);
          transition: transform 0.3s ease;
          overflow: hidden;
        ">
          <div class="familiarity-modal-header" style="
            padding: 20px;
            background: #3498db;
            color: white;
            text-align: center;
          ">
            <h3 style="margin: 0; font-size: 1.2rem;">你熟悉${gameName}吗？</h3>
          </div>
          <div class="familiarity-modal-body" style="
            padding: 20px;
            text-align: center;
          ">
            <p style="margin: 0 0 20px 0; font-size: 1rem; color: #333;">
              如果你熟悉这个游戏，可以隐藏教程按钮以获得更简洁的界面。
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button id="familiarity-yes" style="
                padding: 10px 20px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
                flex: 1;
              ">是的，我熟悉</button>
              <button id="familiarity-no" style="
                padding: 10px 20px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
                flex: 1;
              ">不，我需要教程</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 显示模态框
    const modal = document.getElementById('familiarity-modal');
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.querySelector('.familiarity-modal-content').style.transform = 'scale(1)';
    }, 10);

    // 绑定事件
    document.getElementById('familiarity-yes').addEventListener('click', () => {
      this.markGameAsFamiliar(gameId);
      this.hideFamiliarityModal();
      this.hideTutorialButton();
    });

    document.getElementById('familiarity-no').addEventListener('click', () => {
      this.hideFamiliarityModal();
      this.showTutorial();
    });
  }

  /**
   * 隐藏游戏熟悉度询问模态框
   */
  hideFamiliarityModal() {
    const modal = document.getElementById('familiarity-modal');
    if (modal) {
      modal.style.opacity = '0';
      modal.querySelector('.familiarity-modal-content').style.transform = 'scale(0.8)';
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  /**
   * 隐藏教程按钮
   */
  hideTutorialButton() {
    const tutorialBtn = document.getElementById('tutorial-btn');
    if (tutorialBtn) {
      tutorialBtn.style.display = 'none';
    }
    
    // 也检查移动端教程按钮
    const mobileTutorialBtn = document.getElementById('mobile-tutorial-btn') || document.querySelector('[data-action="tutorial"]');
    if (mobileTutorialBtn) {
      mobileTutorialBtn.style.display = 'none';
    }
  }

  /**
   * 显示游戏教程
   */
  showTutorial() {
    const tutorialModal = document.getElementById('tutorial-modal');
    if (tutorialModal) {
      // 不同游戏可能使用不同的类名来显示模态框
      if (tutorialModal.classList.contains('active')) {
        tutorialModal.classList.add('active');
      } else if (tutorialModal.classList.contains('show')) {
        tutorialModal.classList.add('show');
      } else {
        // 尝试使用内联样式显示
        tutorialModal.style.display = 'flex';
      }
    }
  }

  /**
   * 初始化游戏熟悉度系统
   * @param {string} gameId - 游戏ID
   * @param {string} gameName - 游戏名称
   */
  init(gameId, gameName) {
    if (this.isGameFamiliar(gameId)) {
      // 用户已经熟悉该游戏，隐藏教程按钮
      this.hideTutorialButton();
    } else {
      // 用户不熟悉该游戏，显示询问模态框
      this.showFamiliarityModal(gameId, gameName);
    }
  }
}

// 创建全局实例
window.GameFamiliaritySystem = GameFamiliaritySystem;
window.gameFamiliaritySystem = new GameFamiliaritySystem();