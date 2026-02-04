<template>
  <header class="header">
    <div class="logo">
      <h1>木头猫</h1>
      <p class="slogan">发现有趣的小游戏</p>
    </div>
    <Navigation :is-open="isMenuOpen" @close-menu="$emit('close-menu')" />
    <button
      class="mobile-menu-btn"
      :class="{ active: isMenuOpen }"
      @click="toggleMenu"
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
import { ref } from 'vue';
import Navigation from './Navigation.vue';

const props = defineProps({
  isMenuOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-menu', 'close-menu']);

const touchStartTime = ref(0);

const toggleMenu = () => {
  emit('toggle-menu');
};

const handleTouchEnd = (e) => {
  const touchDuration = Date.now() - touchStartTime.value;
  if (touchDuration < 300) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  }
};
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
}

.logo h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.slogan {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
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
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  transition: 0.3s;
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

  .logo h1 {
    font-size: 1.5rem;
  }

  .slogan {
    font-size: 0.8rem;
  }

  .mobile-menu-btn {
    display: flex;
  }
}
</style>