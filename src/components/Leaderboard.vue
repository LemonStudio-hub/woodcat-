<template>
  <section class="leaderboard-section" id="leaderboard">
    <div class="leaderboard-header">
      <h3 class="leaderboard-title">全球排行榜</h3>
      <p class="leaderboard-subtitle">查看所有游戏的最高分记录，挑战自我极限</p>
      <div class="leaderboard-actions">
        <button 
          class="refresh-btn" 
          @click="refreshLeaderboard" 
          :disabled="isLoading"
          :class="{ loading: isLoading }"
        >
          <span v-if="!isLoading">刷新数据</span>
          <span v-else>加载中...</span>
        </button>
        <select class="filter-select" v-model="sortBy" @change="sortLeaderboard">
          <option value="score">按分数排序</option>
          <option value="game">按游戏排序</option>
          <option value="date">按日期排序</option>
        </select>
      </div>
    </div>
    
    <!-- 排行榜表格 -->
    <div class="leaderboard-container">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在加载排行榜数据...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="hasError" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-text">{{ errorMessage }}</p>
        <button class="retry-btn" @click="refreshLeaderboard">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="sortedLeaderboard.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <p class="empty-text">暂无排行榜数据</p>
        <p class="empty-subtext">开始游戏并提交分数，即可上榜</p>
      </div>
      
      <!-- 排行榜数据 -->
      <table v-else class="leaderboard-table">
        <thead>
          <tr>
            <th class="rank-col">排名</th>
            <th class="player-col">玩家</th>
            <th class="score-col">分数</th>
            <th class="game-col">游戏</th>
            <th class="date-col">日期</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(entry, index) in sortedLeaderboard" 
            :key="`${entry.player_name}_${entry.game}_${entry.score}_${entry.created_at}`"
            class="leaderboard-row"
            :class="{ 'top-rank': index < 3 }"
          >
            <td class="rank-cell">
              <span class="rank-number" :class="{ 'top-3': index < 3 }">
                {{ index + 1 }}
              </span>
              <span v-if="index < 3" class="rank-icon">{{ rankIcon(index) }}</span>
            </td>
            <td class="player-cell">{{ entry.player_name }}</td>
            <td class="score-cell">
              <span class="score-value">{{ entry.score }}</span>
              <span class="score-change">+{{ Math.floor(Math.random() * 100) }}</span>
            </td>
            <td class="game-cell">
              <span class="game-name">{{ entry.game }}</span>
            </td>
            <td class="date-cell">
              <span class="date-value">{{ formatDate(entry.created_at) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 排行榜统计 -->
    <div v-if="!isLoading && sortedLeaderboard.length > 0" class="leaderboard-stats">
      <div class="stat-card">
        <span class="stat-number">{{ totalPlayers }}</span>
        <span class="stat-label">参与玩家</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ totalGamesPlayed }}</span>
        <span class="stat-label">游戏次数</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ highestScore }}</span>
        <span class="stat-label">最高分</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ averageScore }}</span>
        <span class="stat-label">平均分</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLeaderboardStore } from '../stores/LeaderboardStore';

const leaderboardStore = useLeaderboardStore();

// 响应式数据
const sortBy = ref('score');

// 计算属性
const leaderboardData = computed(() => leaderboardStore.leaderboardData);
const isLoading = computed(() => leaderboardStore.isLoading);
const hasError = computed(() => leaderboardStore.hasError);
const errorMessage = computed(() => leaderboardStore.errorMessage);

// 排序后的排行榜数据
const sortedLeaderboard = computed(() => {
  return [...leaderboardData.value].sort((a, b) => {
    if (sortBy.value === 'score') {
      return b.score - a.score;
    } else if (sortBy.value === 'game') {
      return a.game.localeCompare(b.game);
    } else if (sortBy.value === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });
});

// 排行榜统计
const totalPlayers = computed(() => {
  const players = new Set(sortedLeaderboard.value.map(entry => entry.player_name));
  return players.size;
});

const totalGamesPlayed = computed(() => sortedLeaderboard.value.length);

const highestScore = computed(() => {
  if (sortedLeaderboard.value.length === 0) return 0;
  return Math.max(...sortedLeaderboard.value.map(entry => entry.score));
});

const averageScore = computed(() => {
  if (sortedLeaderboard.value.length === 0) return 0;
  const sum = sortedLeaderboard.value.reduce((acc, entry) => acc + entry.score, 0);
  return Math.floor(sum / sortedLeaderboard.value.length);
});

// 方法
const refreshLeaderboard = async () => {
  await leaderboardStore.loadLeaderboard();
};

const sortLeaderboard = () => {
  // 排序逻辑在computed中处理
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const rankIcon = (index) => {
  const icons = ['🥇', '🥈', '🥉'];
  return icons[index] || '';
};

// 生命周期
onMounted(() => {
  refreshLeaderboard();
});
</script>

<style scoped>
.leaderboard-section {
  max-width: 1200px;
  margin: 60px auto;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 排行榜头部 */
.leaderboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.leaderboard-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.leaderboard-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 25px;
}

.leaderboard-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.refresh-btn,
.filter-select {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.refresh-btn {
  background: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.refresh-btn.loading {
  background: #95a5a6;
}

.filter-select {
  background: #fff;
  color: #34495e;
  border: 2px solid #e9ecef;
  cursor: pointer;
}

.filter-select:hover {
  border-color: #3498db;
}

/* 排行榜容器 */
.leaderboard-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

/* 状态样式 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 15px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text,
.error-text,
.empty-text {
  font-size: 1.1rem;
  color: #34495e;
  margin: 0;
}

.empty-subtext {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.error-icon,
.empty-icon {
  font-size: 2.5rem;
}

.retry-btn {
  padding: 10px 20px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

/* 排行榜表格 */
.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 15px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.leaderboard-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  position: sticky;
  top: 0;
  z-index: 10;
}

.leaderboard-table tr:hover {
  background: #f8f9fa;
}

.leaderboard-row.top-rank {
  background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
}

.rank-number {
  font-weight: 700;
  font-size: 1rem;
}

.rank-number.top-3 {
  color: #e67e22;
  font-size: 1.1rem;
}

.rank-icon {
  margin-left: 8px;
  font-size: 1rem;
}

.score-value {
  font-weight: 700;
  color: #27ae60;
}

.score-change {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-left: 8px;
}

.game-name {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.date-value {
  color: #7f8c8d;
  font-size: 0.85rem;
}

/* 排行榜统计 */
.leaderboard-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  min-width: 120px;
  flex: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 动画效果 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .leaderboard-section {
    padding: 30px 20px;
  }
  
  .leaderboard-header {
    text-align: left;
  }
  
  .leaderboard-actions {
    justify-content: flex-start;
  }
  
  .leaderboard-table th,
  .leaderboard-table td {
    padding: 12px 15px;
    font-size: 0.85rem;
  }
  
  .stat-card {
    min-width: 100px;
    padding: 15px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .leaderboard-section {
    padding: 20px 15px;
    margin: 30px auto;
  }
  
  .leaderboard-title {
    font-size: 1.8rem;
  }
  
  .leaderboard-subtitle {
    font-size: 1rem;
  }
  
  .leaderboard-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .refresh-btn,
  .filter-select {
    width: 100%;
  }
  
  .leaderboard-container {
    min-height: 300px;
  }
  
  /* 移动端表格优化 */
  .leaderboard-table {
    display: block;
    overflow-x: auto;
  }
  
  .leaderboard-table thead,
  .leaderboard-table tbody {
    display: block;
  }
  
  .leaderboard-table tr {
    display: block;
    margin-bottom: 10px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .leaderboard-table th,
  .leaderboard-table td {
    display: inline-block;
    width: 100%;
    text-align: left;
    padding: 10px 15px;
    border: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .leaderboard-table th:last-child,
  .leaderboard-table td:last-child {
    border-bottom: none;
  }
  
  .leaderboard-stats {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stat-card {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .leaderboard-section {
    padding: 15px 10px;
  }
  
  .leaderboard-title {
    font-size: 1.5rem;
  }
  
  .leaderboard-subtitle {
    font-size: 0.9rem;
  }
  
  .loading-state,
  .error-state,
  .empty-state {
    padding: 40px 15px;
  }
  
  .stat-number {
    font-size: 1.3rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
}
</style>