<template>
  <nav class="nav" :class="{ 'mobile-open': isOpen }">
    <ul>
      <li>
        <a href="/index-vue.html" class="active">首页</a>
      </li>
      <li>
        <a href="#games">游戏</a>
      </li>
      <li>
        <a href="/leaderboard.html">排行榜</a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close-menu']);
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
}

.nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.nav a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
  padding: 5px 0;
}

.nav a:hover,
.nav a.active {
  color: #3498db;
}

.nav a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3498db;
}

@media (max-width: 768px) {
  .nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    z-index: 999;
    display: none;
  }

  .nav.mobile-open {
    display: block;
  }

  .nav ul {
    flex-direction: column;
    padding: 20px 0;
  }

  .nav li {
    text-align: center;
  }

  .nav a {
    display: block;
    padding: 15px 0;
    font-size: 1.1rem;
  }
}
</style>