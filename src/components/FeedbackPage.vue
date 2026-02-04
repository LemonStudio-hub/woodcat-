<template>
  <div class="feedback-page">
    <!-- 装饰元素 -->
    <div class="decoration decoration-1">🎮</div>
    <div class="decoration decoration-2">⭐</div>
    <div class="decoration decoration-3">💡</div>
    
    <div class="feedback-container">
      <div class="feedback-header">
        <h1>反馈与支持</h1>
        <p>感谢您使用木头猫游戏合集！<br>我们非常重视您的意见和建议，欢迎随时联系我们。</p>
      </div>
      
      <div class="contact-options">
        <div 
          v-for="(contact, index) in contactOptions" 
          :key="index" 
          class="contact-card" 
          :data-index="index"
        >
          <div class="contact-icon">{{ contact.icon }}</div>
          <h3 class="contact-title">{{ contact.title }}</h3>
          <p class="contact-description">{{ contact.description }}</p>
          <div class="contact-info">{{ contact.info }}</div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a 
          href="https://github.com/LemonStudio-hub/woodcat-" 
          target="_blank" 
          class="action-btn github-btn"
          @click="trackClick('github')"
        >
          <span>🌐</span> 访问仓库
        </a>
        <button 
          class="action-btn back-btn"
          @click="goBack"
        >
          <span>👈</span> 返回首页
        </button>
      </div>
      
      <div class="social-links">
        <a 
          href="https://github.com/LemonStudio-hub/woodcat-" 
          target="_blank" 
          class="social-link" 
          title="GitHub"
          @click="trackClick('github-social')"
        >🐱</a>
        <a 
          href="mailto:lemonhub@163.com" 
          class="social-link" 
          title="Email"
          @click="trackClick('email')"
        >✉️</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const contactOptions = ref([
  {
    icon: '🌟',
    title: 'GitHub 仓库',
    description: '访问我们的GitHub仓库，查看源代码，提交问题或贡献代码',
    info: 'https://github.com/LemonStudio-hub/woodcat-'
  },
  {
    icon: '📧',
    title: '联系邮箱',
    description: '发送邮件与我们交流，分享您的想法和建议',
    info: 'lemonhub@163.com'
  }
]);

const contactCards = ref([]);

// 方法
const goBack = () => {
  // 如果有路由历史，返回上一页
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // 否则跳转到首页
    window.location.href = '/';
  }
};

const trackClick = (action) => {
  // 这里可以添加事件跟踪代码
  console.log(`Feedback page action: ${action}`);
  // 实际项目中可以集成Google Analytics或其他跟踪工具
};

const animateContactCards = () => {
  contactCards.value = document.querySelectorAll('.contact-card');
  contactCards.value.forEach((card, index) => {
    // 延迟显示以创建顺序动画效果
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      
      // 触发动画
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    }, 100);
  });
};

const addButtonEffects = () => {
  const buttons = document.querySelectorAll('.action-btn');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
};

const addSocialLinkEffects = () => {
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) rotate(5deg)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) rotate(0)';
    });
  });
};

// 生命周期
onMounted(() => {
  // 为联系卡片添加动画效果
  animateContactCards();
  // 为按钮添加悬停效果
  addButtonEffects();
  // 为社交链接添加悬停效果
  addSocialLinkEffects();
});

onUnmounted(() => {
  // 清理事件监听器
  if (contactCards.value.length > 0) {
    contactCards.value.forEach(card => {
      // 移除可能的事件监听器
      card.style.transition = '';
    });
  }
});
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.feedback-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  animation: fadeIn 0.8s ease;
  position: relative;
  z-index: 10;
}

.feedback-header {
  margin-bottom: 30px;
  animation: slideDown 0.6s ease 0.2s both;
}

.feedback-header h1 {
  color: #2c3e50;
  font-size: 2.2rem;
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feedback-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.contact-options {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin: 30px 0;
}

.contact-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid #dee2e6;
  animation: slideUp 0.6s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.contact-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

.contact-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.contact-description {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 1rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.contact-info {
  font-size: 1.2rem;
  font-weight: 600;
  color: #3498db;
  word-break: break-all;
  padding: 8px 15px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  display: inline-block;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.contact-info:hover {
  background: rgba(52, 152, 219, 0.2);
  transform: scale(1.02);
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
  animation: slideUp 0.6s ease 0.4s both;
}

.action-btn {
  padding: 12px 25px;
  border-radius: 50px;
  text-decoration: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
  justify-content: center;
  outline: none;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.github-btn {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
}

.back-btn {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
  animation: slideUp 0.6s ease 0.6s both;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
  font-size: 1.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.social-link:hover {
  transform: translateY(-5px) rotate(5deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.decoration {
  position: absolute;
  opacity: 0.1;
  z-index: 1;
  font-size: 4rem;
  animation: float 6s ease-in-out infinite;
}

.decoration-1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.decoration-2 {
  bottom: 10%;
  right: 5%;
  animation-delay: 2s;
}

.decoration-3 {
  top: 40%;
  right: 15%;
  animation-delay: 4s;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .feedback-page {
    padding: 10px;
  }
  
  .feedback-container {
    padding: 30px 20px;
    border-radius: 15px;
  }
  
  .feedback-header h1 {
    font-size: 1.8rem;
  }
  
  .contact-card {
    padding: 20px;
  }
  
  .contact-title {
    font-size: 1.1rem;
  }
  
  .contact-info {
    font-size: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 250px;
  }
  
  .contact-icon {
    font-size: 2.5rem;
  }
  
  .decoration {
    font-size: 3rem;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .feedback-container {
    padding: 35px;
  }
  
  .feedback-header h1 {
    font-size: 2rem;
  }
  
  .contact-card {
    padding: 22px;
  }
}
</style>