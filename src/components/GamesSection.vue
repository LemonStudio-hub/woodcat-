<template>
  <section class="games-section" id="games">
    <h3>精选游戏</h3>
    <div class="games-grid">
      <GameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
        @click="handleGameClick"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import GameCard from './GameCard.vue';

const games = ref([
  {
    id: 'tetris',
    title: '俄罗斯方块',
    description: '经典益智游戏',
    icon: '🧩',
    difficulty: 'easy',
    players: 1,
    url: '/games/tetris.html'
  },
  {
    id: 'snake',
    title: '贪吃蛇',
    description: '怀旧经典玩法',
    icon: '🐍',
    difficulty: 'medium',
    players: 1,
    url: '/games/snake.html'
  },
  {
    id: 'minesweeper',
    title: '扫雷',
    description: '挑战逻辑思维',
    icon: '💣',
    difficulty: 'hard',
    players: 1,
    url: '/games/minesweeper.html'
  },
  {
    id: '2048',
    title: '2048',
    description: '数字合并挑战',
    icon: '🔢',
    difficulty: 'medium',
    players: 1,
    url: '/games/2048.html'
  },
  {
    id: 'chess',
    title: '国际象棋',
    description: '策略对战游戏',
    icon: '♟️',
    difficulty: 'hard',
    players: 2,
    url: '/games/chess.html'
  },
  {
    id: 'checkers',
    title: '跳棋',
    description: '经典双人对战',
    icon: '⚪',
    difficulty: 'medium',
    players: 2,
    url: '/games/checkers.html'
  },
  {
    id: 'tic-tac-toe',
    title: '井字棋',
    description: '经典策略游戏',
    icon: '❌',
    difficulty: 'easy',
    players: 2,
    url: '/games/tic-tac-toe.html'
  },
  {
    id: 'memory-card',
    title: '记忆卡牌',
    description: '考验记忆能力',
    icon: '🃏',
    difficulty: 'medium',
    players: 1,
    url: '/games/memory-card.html'
  },
  {
    id: 'arkanoid',
    title: '打砖块',
    description: '经典街机游戏',
    icon: '🎮',
    difficulty: 'medium',
    players: 1,
    url: '/games/arkanoid.html'
  }
]);

const handleGameClick = (gameUrl) => {
  window.location.href = gameUrl;
};
</script>

<style scoped>
.games-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.games-section h3 {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .games-section {
    padding: 30px 15px;
  }

  .games-section h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .games-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>