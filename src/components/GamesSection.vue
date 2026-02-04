<template>
  <section class="games-section" id="games">
    <div class="games-header">
      <h3 class="games-title">精选游戏</h3>
      <p class="games-subtitle">发现9款经典有趣的小游戏，随时随地享受游戏的乐趣</p>
    </div>
    
    <!-- 游戏分类筛选 -->
    <div class="games-filters">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-btn"
        :class="{ active: selectedFilter.value === filter.value }"
        @click="selectFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>
    
    <!-- 游戏网格 -->
    <div class="games-grid">
      <GameCard
        v-for="game in filteredGames"
        :key="game.id"
        :game="game"
        @click="handleGameClick(game.url)"
      />
    </div>
    
    <!-- 游戏统计 -->
    <div class="games-stats">
      <div class="stat-item">
        <span class="stat-number">{{ totalGames }}</span>
        <span class="stat-label">款游戏</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ easyGames }}</span>
        <span class="stat-label">款简单</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ mediumGames }}</span>
        <span class="stat-label">款中等</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ hardGames }}</span>
        <span class="stat-label">款困难</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import GameCard from './GameCard.vue';
import { useGameStore } from '../stores/GameStore';

const gameStore = useGameStore();

// 分类筛选选项
const filters = [
  { label: '全部游戏', value: 'all' },
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' },
  { label: '单人', value: 'single' },
  { label: '双人', value: 'multi' }
];

// 响应式数据
const selectedFilter = ref('all');

// 计算属性
const gamesList = computed(() => gameStore.getGamesList);
const filteredGames = computed(() => {
  if (selectedFilter.value === 'all') {
    return gamesList.value;
  } else if (selectedFilter.value === 'single') {
    return gamesList.value.filter(game => game.players === 1);
  } else if (selectedFilter.value === 'multi') {
    return gamesList.value.filter(game => game.players === 2);
  } else {
    return gamesList.value.filter(game => game.difficulty === selectedFilter.value);
  }
});
const totalGames = computed(() => gamesList.value.length);
const easyGames = computed(() => gamesList.value.filter(game => game.difficulty === 'easy').length);
const mediumGames = computed(() => gamesList.value.filter(game => game.difficulty === 'medium').length);
const hardGames = computed(() => gamesList.value.filter(game => game.difficulty === 'hard').length);

// 方法
const selectFilter = (filter) => {
  selectedFilter.value = filter;
};

const handleGameClick = (gameUrl) => {
  window.location.href = gameUrl;
};

// 初始化游戏数据
gameStore.loadGames();
</script>

<style scoped>
.games-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 20px;
  margin: 40px auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.games-header {
  text-align: center;
  margin-bottom: 40px;
}

.games-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.games-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 0;
  line-height: 1.6;
}

.games-filters {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #e9ecef;
  border-radius: 50px;
  background: #fff;
  color: #34495e;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.filter-btn:hover {
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

.filter-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: #fff;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.games-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding-top: 30px;
  border-top: 2px solid #e9ecef;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  min-width: 100px;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #7f8c8d;
}

@media (max-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .games-section {
    padding: 40px 15px;
    margin: 30px auto;
  }

  .games-title {
    font-size: 2rem;
  }

  .games-subtitle {
    font-size: 1rem;
  }

  .games-filters {
    gap: 8px;
    margin-bottom: 30px;
  }

  .filter-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  .games-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 30px;
  }

  .games-stats {
    gap: 20px;
    padding-top: 20px;
  }

  .stat-item {
    padding: 15px;
    min-width: 80px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .games-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .games-filters {
    flex-direction: column;
    align-items: center;
  }

  .filter-btn {
    width: 100%;
    max-width: 200px;
  }

  .games-stats {
    flex-direction: column;
    align-items: center;
  }

  .stat-item {
    width: 100%;
    max-width: 200px;
  }
}
</style>