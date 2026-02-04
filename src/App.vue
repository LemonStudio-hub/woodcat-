<template>
  <div id="app">
    <Header
      :is-menu-open="isMenuOpen"
      @toggle-menu="toggleMenu"
    />
    <Navigation :is-open="isMenuOpen" @close-menu="closeMenu" />
    <main class="main">
      <Hero />
      <GamesSection />
      <Leaderboard />
    </main>
    <ScoreModal
      v-if="scoreModalVisible"
      :visible="scoreModalVisible"
      :score="scoreModalScore"
      :game="scoreModalGame"
      @close="closeScoreModal"
      @submit="submitScore"
    />
    <footer class="footer">
      <div class="copyright-notice">
        <p>&copy; 2026 木头猫 - 保留所有权利</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from './components/Header.vue';
import Navigation from './components/Navigation.vue';
import Hero from './components/Hero.vue';
import GamesSection from './components/GamesSection.vue';
import Leaderboard from './components/Leaderboard.vue';
import ScoreModal from './components/ScoreModal.vue';
import { useAppStore } from './stores/AppStore';
import { useLeaderboardStore } from './stores/LeaderboardStore';

// 获取状态管理
const appStore = useAppStore();
const leaderboardStore = useLeaderboardStore();

// 分数提交模态框状态
const scoreModalVisible = ref(false);
const scoreModalScore = ref(0);
const scoreModalGame = ref('');

// 计算属性
const isMenuOpen = computed(() => appStore.isMenuOpen);

// 方法
const toggleMenu = () => {
  appStore.toggleMenu();
};

const closeMenu = () => {
  appStore.closeMenu();
};

const openScoreModal = (score, game) => {
  scoreModalScore.value = score;
  scoreModalGame.value = game;
  scoreModalVisible.value = true;
};

const closeScoreModal = () => {
  scoreModalVisible.value = false;
  scoreModalScore.value = 0;
  scoreModalGame.value = '';
};

const submitScore = async (playerName) => {
  try {
    await leaderboardStore.submitScore(
      playerName,
      scoreModalScore.value,
      scoreModalGame.value
    );
    closeScoreModal();
  } catch (error) {
    console.error('提交分数失败:', error);
  }
};

// 检查URL参数中的分数
const checkForScoreSubmission = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const score = urlParams.get('score');
  const game = urlParams.get('game');
  
  if (score && game) {
    openScoreModal(parseInt(score), game);
  }
};

// 生命周期
onMounted(() => {
  // 初始化应用
  appStore.initApp();
  // 开始网络状态监控
  appStore.startNetworkMonitoring();
  // 开始窗口大小变化监控
  appStore.startResizeMonitoring();
  // 检查URL参数中的分数
  checkForScoreSubmission();
});
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}

.footer {
  background-color: #f8f9fa;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.copyright-notice {
  font-size: 14px;
  color: #6c757d;
}
</style>