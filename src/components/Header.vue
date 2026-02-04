<template>
  <header class="header" :class="{ 'scrolled': isScrolled }">
    <div class="logo">
      <h1>木头猫</h1>
      <p class="slogan">发现有趣的小游戏</p>
    </div>
    <nav class="nav desktop-nav">
      <ul>
        <li><a href="#" class="nav-link" @click="navigateTo('home')">首页</a></li>
        <li><a href="#games" class="nav-link" @click="navigateTo('games')">游戏</a></li>
        <li><a href="#leaderboard" class="nav-link" @click="navigateTo('leaderboard')">排行榜</a></li>
      </ul>
    </nav>
    <button
      class="mobile-menu-btn"
      :class="{ active: isMenuOpen }"
      @click="toggleMenu"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      aria-label="菜单"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAppStore } from '../stores/AppStore';

const appStore = useAppStore();

const props = defineProps({
  isMenuOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-menu', 'close-menu']);

const touchStartTime = ref(0);
const touchStartY = ref(0);
const isScrolled = ref(false);

// 计算属性
const isMenuOpen = computed(() => appStore.isMenuOpen);

// 方法
const toggleMenu = () => {
  appStore.toggleMenu();
  emit('toggle-menu');
};

const navigateTo = (page) => {
  appStore.setCurrentPage(page);
  appStore.closeMenu();
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
    toggleMenu();
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.header.scrolled {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 15px 30px;
}

.logo h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  transition: font-size 0.3s ease;
}

.slogan {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  transition: font-size 0.3s ease;
}

.nav {
  display: flex;
  align-items: center;
}

.nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav li {
  margin-left: 30px;
}

.nav-link {
  color: #34495e;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #3498db;
}

.nav-link.active {
  color: #3498db;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3498db;
  border-radius: 2px;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 5px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s ease;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

@media (max-width: 768px) {
  .header {
    padding: 10px 15px;
  }

  .header.scrolled {
    padding: 10px 15px;
  }

  .logo h1 {
    font-size: 1.5rem;
  }

  .slogan {
    font-size: 0.8rem;
  }

  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }
}

@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none;
  }
}
</style>