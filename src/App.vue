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
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from './components/Header.vue';
import Navigation from './components/Navigation.vue';
import Hero from './components/Hero.vue';
import GamesSection from './components/GamesSection.vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
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
</style>