<template>
  <div class="modal-overlay" v-if="visible" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>提交分数</h3>
        <span class="modal-close" @click="handleClose" aria-label="关闭">&times;</span>
      </div>
      <div class="modal-body">
        <div class="score-info">
          <p>您的分数: <span class="current-score">{{ score }}</span></p>
          <p>游戏: <span class="current-game">{{ game }}</span></p>
        </div>
        <div class="form-group" :class="{ 'error': nameError }">
          <label for="player-name">请输入您的昵称:</label>
          <input 
            type="text" 
            id="player-name" 
            v-model="playerName" 
            maxlength="20" 
            placeholder="输入昵称" 
            @keyup.enter="handleSubmit"
            :disabled="isSubmitting"
          >
          <span class="error-message" v-if="nameError">{{ nameError }}</span>
        </div>
        <div class="modal-actions">
          <button 
            id="submit-score-btn" 
            class="btn-primary" 
            @click="handleSubmit"
            :disabled="isSubmitting"
            :class="{ 'submitting': isSubmitting }"
          >
            {{ isSubmitting ? '提交中...' : '提交分数' }}
          </button>
          <button 
            id="cancel-score-btn" 
            class="btn-secondary" 
            @click="handleClose"
            :disabled="isSubmitting"
          >
            取消
          </button>
        </div>
        <div class="submission-status" v-if="submissionStatus">
          <p :class="['status-message', submissionStatus.type]">{{ submissionStatus.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLeaderboardStore } from '../stores/LeaderboardStore';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  game: {
    type: String,
    default: '未知'
  }
});

const emit = defineEmits(['close', 'submit']);

const leaderboardStore = useLeaderboardStore();

const playerName = ref('');
const nameError = ref('');
const isSubmitting = ref(false);
const submissionStatus = ref(null);

// 验证昵称
const validateName = () => {
  if (!playerName.value.trim()) {
    nameError.value = '请输入昵称';
    return false;
  }
  if (playerName.value.length < 2) {
    nameError.value = '昵称至少需要2个字符';
    return false;
  }
  if (playerName.value.length > 20) {
    nameError.value = '昵称最多20个字符';
    return false;
  }
  nameError.value = '';
  return true;
};

// 处理提交
const handleSubmit = async () => {
  if (!validateName()) {
    return;
  }

  isSubmitting.value = true;
  submissionStatus.value = null;

  try {
    await leaderboardStore.submitScore(playerName.value, props.score, props.game);
    submissionStatus.value = {
      type: 'success',
      message: '分数提交成功！'
    };
    
    // 3秒后关闭模态框
    setTimeout(() => {
      emit('submit', playerName.value);
      handleClose();
    }, 1500);
  } catch (error) {
    console.error('提交分数失败:', error);
    submissionStatus.value = {
      type: 'error',
      message: '提交失败，请稍后重试'
    };
  } finally {
    isSubmitting.value = false;
  }
};

// 处理关闭
const handleClose = () => {
  resetForm();
  emit('close');
};

// 处理点击遮罩层
const handleOverlayClick = () => {
  if (!isSubmitting.value) {
    handleClose();
  }
};

// 重置表单
const resetForm = () => {
  playerName.value = '';
  nameError.value = '';
  isSubmitting.value = false;
  submissionStatus.value = null;
};

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Escape' && !isSubmitting.value) {
    handleClose();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.modal-close {
  font-size: 24px;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  color: #2c3e50;
  background: #e9ecef;
}

.modal-body {
  padding: 24px;
}

.score-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.score-info p {
  margin: 8px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.current-score {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e67e22;
}

.current-game {
  font-weight: 600;
  color: #3498db;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group.error input {
  border-color: #e74c3c;
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #e74c3c;
  font-size: 0.8rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary.submitting {
  position: relative;
}

.btn-primary.submitting::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  transform: translateY(-50%);
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-secondary:disabled {
  background: #f8f9fa;
  color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submission-status {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.status-message {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-message.success {
  color: #27ae60;
}

.status-message.error {
  color: #e74c3c;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    padding: 12px;
  }
}
</style>