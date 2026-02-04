<template>
  <div
    class="game-card"
    :class="[difficultyClass, { active: isActive }]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @keydown.enter="handleClick"
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
  >
    <!-- 游戏图标 -->
    <div class="game-icon-container">
      <div class="game-icon" :style="{ animationDelay: `${animationDelay}s` }">{{ game.icon }}</div>
      <div class="icon-bg" :style="{ backgroundColor: iconBgColor }"></div>
    </div>
    
    <!-- 游戏标题 -->
    <h4 class="game-title">{{ game.title }}</h4>
    
    <!-- 游戏描述 -->
    <p class="game-description">{{ game.description }}</p>
    
    <!-- 游戏分类标签 -->
    <div v-if="game.category" class="game-category">
      <span class="category-tag">{{ categoryText }}</span>
    </div>
    
    <!-- 游戏元数据 -->
    <div class="game-meta">
      <span class="difficulty-badge" :class="game.difficulty">
        <span class="difficulty-icon">{{ difficultyIcon }}</span>
        <span class="difficulty-text">{{ difficultyText }}</span>
      </span>
      <span class="players-badge">
        <span class="players-icon">👥</span>
        <span class="players-text">{{ game.players }}人</span>
      </span>
    </div>
    
    <!-- 点击反馈效果 -->
    <div v-if="isClicked" class="click-effect"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/GameStore';

const gameStore = useGameStore();

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

// 响应式数据
const touchStartTime = ref(0);
const touchStartY = ref(0);
const isActive = ref(false);
const isClicked = ref(false);

// 计算属性
const difficultyText = computed(() => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return texts[props.game.difficulty] || '未知';
});

const difficultyIcon = computed(() => {
  const icons = {
    easy: '🟢',
    medium: '🟡',
    hard: '🔴'
  };
  return icons[props.game.difficulty] || '⚪';
});

const difficultyClass = computed(() => {
  return props.game.difficulty || 'medium';
});

const categoryText = computed(() => {
  const texts = {
    puzzle: '益智',
    casual: '休闲',
    logic: '逻辑',
    strategy: '策略',
    memory: '记忆',
    arcade: '街机'
  };
  return texts[props.game.category] || '其他';
});

const iconBgColor = computed(() => {
  const colors = {
    puzzle: '#e3f2fd',
    casual: '#fff3e0',
    logic: '#f3e5f5',
    strategy: '#e8f5e8',
    memory: '#fffde7',
    arcade: '#ffebee'
  };
  return colors[props.game.category] || '#f5f5f5';
});

const animationDelay = computed(() => {
  // 为不同游戏设置不同的动画延迟，创造层次感
  const delays = {
    tetris: 0.1,
    snake: 0.2,
    minesweeper: 0.3,
    '2048': 0.4,
    chess: 0.5,
    checkers: 0.6,
    'tic-tac-toe': 0.7,
    'memory-card': 0.8,
    arkanoid: 0.9
  };
  return delays[props.game.id] || 0;
});

// 方法
const handleClick = () => {
  // 添加点击反馈效果
  isClicked.value = true;
  setTimeout(() => {
    isClicked.value = false;
  }, 200);
  
  // 跳转到游戏页面
  emit('click', props.game.url);
};

const handleTouchStart = (e) => {
  touchStartTime.value = Date.now();
  touchStartY.value = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  const touchDuration = Date.now() - touchStartTime.value;
  const touchEndY = e.changedTouches[0].clientY;
  const touchDistance = Math.abs(touchEndY - touchStartY.value);
  
  if (touchDuration < 300 && touchDistance < 10) {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  }
};
</script>

<style scoped>
.game-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 2px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.game-card.active {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  border-color: #3498db;
}

/* 游戏图标容器 */
.game-icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.icon-bg {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.game-card:hover .icon-bg {
  transform: scale(1.1);
  opacity: 0.8;
}

.game-icon {
  position: relative;
  font-size: 2.5rem;
  transition: all 0.3s ease;
  animation: bounceIn 0.6s ease-out;
  z-index: 1;
}

.game-card:hover .game-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 游戏标题 */
.game-title {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.game-card:hover .game-title {
  color: #3498db;
}

/* 游戏描述 */
.game-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
  line-height: 1.4;
  flex-grow: 1;
}

/* 游戏分类标签 */
.game-category {
  margin-bottom: 12px;
}

.category-tag {
  display: inline-block;
  background: #f8f9fa;
  color: #495057;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.game-card:hover .category-tag {
  background: #e3f2fd;
  color: #1976d2;
}

/* 游戏元数据 */
.game-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.difficulty-badge,
.players-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.difficulty-badge {
  background: #f8f9fa;
}

.players-badge {
  background: #f0f0f0;
}

.game-card:hover .difficulty-badge,
.game-card:hover .players-badge {
  transform: translateY(-2px);
}

/* 难度徽章样式 */
.difficulty-badge.easy {
  background: #e8f5e8;
  color: #2e7d32;
}

.difficulty-badge.medium {
  background: #fff8e1;
  color: #ef6c00;
}

.difficulty-badge.hard {
  background: #ffebee;
  color: #c62828;
}

/* 图标和文本样式 */
.difficulty-icon,
.players-icon {
  font-size: 0.9rem;
}

.difficulty-text,
.players-text {
  font-size: 0.75rem;
}

/* 点击效果 */
.click-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(52, 152, 219, 0.3);
  transform: translate(-50%, -50%);
  animation: clickEffect 0.6s ease-out;
  pointer-events: none;
}

/* 动画效果 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes clickEffect {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .game-card {
    padding: 20px;
    min-height: 200px;
  }
  
  .game-icon {
    font-size: 2.2rem;
  }
  
  .game-title {
    font-size: 1.1rem;
  }
  
  .game-description {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .game-card {
    padding: 16px;
    min-height: 180px;
    gap: 10px;
  }
  
  .game-icon {
    font-size: 2rem;
  }
  
  .icon-bg {
    width: 50px;
    height: 50px;
  }
  
  .game-title {
    font-size: 1rem;
  }
  
  .game-description {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }
  
  .game-meta {
    gap: 8px;
  }
  
  .difficulty-badge,
  .players-badge {
    padding: 4px 10px;
    font-size: 0.75rem;
  }
  
  .difficulty-text,
  .players-text {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .game-card {
    padding: 14px;
    min-height: 160px;
    gap: 8px;
  }
  
  .game-icon {
    font-size: 1.8rem;
  }
  
  .icon-bg {
    width: 45px;
    height: 45px;
  }
  
  .game-title {
    font-size: 0.9rem;
  }
  
  .game-description {
    font-size: 0.75rem;
  }
  
  .category-tag {
    font-size: 0.7rem;
    padding: 3px 10px;
  }
  
  .difficulty-badge,
  .players-badge {
    padding: 3px 8px;
  }
}
</style>