<template>
  <section class="hero">
    <div class="hero-background">
      <div class="hero-pattern"></div>
      <div class="hero-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
    <div class="hero-content">
      <div class="hero-badge">🎮 经典游戏合集</div>
      <h2 class="hero-title">欢迎来到木头猫游戏世界</h2>
      <p class="hero-description">在这里，您可以找到各种经典有趣的小游戏，随时随地享受游戏的乐趣。</p>
      <div class="hero-features">
        <div class="feature-item">
          <span class="feature-icon">📱</span>
          <span class="feature-text">响应式设计</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <span class="feature-text">9款经典游戏</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🏆</span>
          <span class="feature-text">排行榜系统</span>
        </div>
      </div>
      <div class="cta-buttons">
        <a href="#games" class="btn btn-primary" @click="startGame" @touchend="handleTouchEnd">
          <span class="btn-text">开始游戏</span>
          <span class="btn-icon">🚀</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '../stores/AppStore';

const appStore = useAppStore();

const touchStartTime = ref(0);

const startGame = () => {
  appStore.setCurrentPage('games');
  appStore.closeMenu();
};

const handleTouchEnd = (e) => {
  const touchDuration = Date.now() - touchStartTime.value;
  if (touchDuration < 300) {
    e.preventDefault();
    e.stopPropagation();
    startGame();
  }
};
</script>

<style scoped>
.hero {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
  overflow: hidden;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 90%);
  opacity: 0.6;
}

.hero-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeInUp 1s ease-out;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 20px;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 25px;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: fadeInDown 0.8s ease-out 0.4s both;
}

.hero-description {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.95;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.1rem;
}

.cta-buttons {
  animation: fadeInUp 0.8s ease-out 1s both;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 40px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-decoration: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: #fff;
  color: #764ba2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-primary:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(5px) rotate(10deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 80px 20px;
    min-height: 60vh;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-description {
    font-size: 1.1rem;
    margin-bottom: 30px;
  }

  .hero-features {
    gap: 15px;
    margin-bottom: 30px;
  }

  .feature-item {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .btn {
    padding: 14px 32px;
    font-size: 1rem;
  }

  .shape {
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 60px 15px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-features {
    flex-direction: column;
    align-items: center;
  }

  .feature-item {
    width: 100%;
    justify-content: center;
  }

  .btn {
    padding: 12px 28px;
  }
}
</style>