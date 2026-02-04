<template>
  <div
    class="game-card"
    :class="difficultyClass"
    role="button"
    tabindex="0"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @keydown.enter="handleClick"
  >
    <div class="game-icon">{{ game.icon }}</div>
    <h4>{{ game.title }}</h4>
    <p>{{ game.description }}</p>
    <div class="game-meta">
      <span class="difficulty" :class="game.difficulty">{{ difficultyText }}</span>
      <span class="players">{{ game.players }}人</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const touchStartTime = ref(0);
const touchStartY = ref(0);

const difficultyText = computed(() => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return texts[props.game.difficulty] || '未知';
});

const difficultyClass = computed(() => {
  return props.game.difficulty || 'medium';
});

const handleClick = () => {
  emit('click', props.game.url);
};

const handleTouchStart = () => {
  touchStartTime.value = Date.now();
  touchStartY.value = 0;
};

const handleTouchEnd = (e) => {
  const touchDuration = Date.now() - touchStartTime.value;
  if (touchDuration < 300) {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  }
};
</script>

<style scoped>
.game-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.game-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.game-card h4 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.game-card p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.game-meta {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: auto;
}

.difficulty {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.difficulty.easy {
  background: #d4edda;
  color: #155724;
}

.difficulty.medium {
  background: #fff3cd;
  color: #856404;
}

.difficulty.hard {
  background: #f8d7da;
  color: #721c24;
}

.players {
  padding: 3px 8px;
  background: #e9ecef;
  border-radius: 10px;
  font-size: 0.75rem;
  color: #495057;
}

@media (max-width: 768px) {
  .game-card {
    padding: 15px;
    min-height: 140px;
  }

  .game-icon {
    font-size: 1.8rem;
  }

  .game-card h4 {
    font-size: 1rem;
  }

  .game-card p {
    font-size: 0.85rem;
  }
}
</style>