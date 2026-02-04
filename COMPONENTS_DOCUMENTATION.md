# 木头猫游戏合集 - Vue组件文档

## 1. 项目概述

本项目是木头猫游戏合集的Vue 3重构版本，使用Vue 3 Composition API、Pinia状态管理和Vite构建工具，实现了响应式设计和现代化的用户界面。

## 2. 组件列表

### 2.1 核心组件

| 组件名称 | 描述 | 文件路径 |
|---------|------|----------|
| Header | 页面头部，包含logo和导航菜单 | `src/components/Header.vue` |
| Navigation | 导航菜单组件，支持移动端菜单 | `src/components/Navigation.vue` |
| Hero | 英雄区组件，展示欢迎信息 | `src/components/Hero.vue` |
| GamesSection | 游戏列表组件，展示所有游戏 | `src/components/GamesSection.vue` |
| GameCard | 游戏卡片组件，展示单个游戏信息 | `src/components/GameCard.vue` |
| Leaderboard | 排行榜组件，展示游戏排行榜 | `src/components/Leaderboard.vue` |
| ScoreModal | 分数提交模态框组件 | `src/components/ScoreModal.vue` |
| ConnectionStatus | 连接状态组件，显示网络连接状态 | `src/components/ConnectionStatus.vue` |
| FeedbackPage | 反馈页面组件 | `src/components/FeedbackPage.vue` |

### 2.2 状态管理

| Store名称 | 描述 | 文件路径 |
|---------|------|----------|
| AppStore | 应用状态管理，包括导航、连接状态等 | `src/stores/AppStore.js` |
| GameStore | 游戏数据管理，包括游戏列表、分类等 | `src/stores/GameStore.js` |
| LeaderboardStore | 排行榜数据管理，包括分数提交、获取等 | `src/stores/LeaderboardStore.js` |

## 3. 组件使用说明

### 3.1 Header组件

**功能**：页面头部，包含logo、导航菜单和移动端菜单按钮

**Props**：
| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| isMenuOpen | Boolean | false | 是否显示移动端菜单 |

**Events**：
| 事件名 | 描述 |
|-------|------|
| toggle-menu | 切换移动端菜单显示状态 |

**使用示例**：
```vue
<Header
  :is-menu-open="isMenuOpen"
  @toggle-menu="toggleMenu"
/>
```

### 3.2 Navigation组件

**功能**：导航菜单组件，支持移动端菜单显示

**Props**：
| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| isOpen | Boolean | false | 是否显示导航菜单 |

**Events**：
| 事件名 | 描述 |
|-------|------|
| close-menu | 关闭导航菜单 |

**使用示例**：
```vue
<Navigation :is-open="isMenuOpen" @close-menu="closeMenu" />
```

### 3.3 Hero组件

**功能**：英雄区组件，展示欢迎信息和CTA按钮

**Props**：无

**Events**：无

**使用示例**：
```vue
<Hero />
```

### 3.4 GamesSection组件

**功能**：游戏列表组件，展示所有游戏，支持按难度和玩家数量筛选

**Props**：无

**Events**：无

**使用示例**：
```vue
<GamesSection />
```

### 3.5 GameCard组件

**功能**：游戏卡片组件，展示单个游戏信息，支持点击跳转到游戏页面

**Props**：
| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| game | Object | - | 游戏数据对象 |

**Events**：无

**使用示例**：
```vue
<GameCard :game="game" />
```

### 3.6 Leaderboard组件

**功能**：排行榜组件，展示游戏排行榜数据，支持排序和筛选

**Props**：无

**Events**：无

**使用示例**：
```vue
<Leaderboard />
```

### 3.7 ScoreModal组件

**功能**：分数提交模态框组件，用于提交游戏分数到排行榜

**Props**：
| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| visible | Boolean | false | 是否显示模态框 |
| score | Number | 0 | 要提交的分数 |
| game | String | '未知' | 游戏名称 |

**Events**：
| 事件名 | 描述 | 参数 |
|-------|------|------|
| close | 关闭模态框 | 无 |
| submit | 提交分数 | playerName: String |

**使用示例**：
```vue
<ScoreModal
  v-if="scoreModalVisible"
  :visible="scoreModalVisible"
  :score="scoreModalScore"
  :game="scoreModalGame"
  @close="closeScoreModal"
  @submit="submitScore"
/>
```

### 3.8 ConnectionStatus组件

**功能**：连接状态组件，显示网络连接状态

**Props**：
| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| showDetails | Boolean | false | 是否显示详细信息 |
| compact | Boolean | false | 是否使用紧凑模式 |

**Events**：无

**使用示例**：
```vue
<ConnectionStatus :show-details="true" />
```

### 3.9 FeedbackPage组件

**功能**：反馈页面组件，显示联系信息和反馈选项

**Props**：无

**Events**：无

**使用示例**：
```vue
<FeedbackPage />
```

## 4. 状态管理（Pinia Stores）

### 4.1 AppStore

**功能**：管理应用全局状态，包括导航状态、连接状态等

**State**：
- `isMenuOpen`: Boolean - 移动端菜单是否打开
- `currentPage`: String - 当前页面
- `isMobile`: Boolean - 是否为移动端设备
- `connectionStatus`: String - 连接状态（'online'/'offline'/'connecting'）
- `connectionStatusText`: String - 连接状态文本
- `connectionStatusColor`: String - 连接状态颜色

**Actions**：
- `toggleMenu()`: 切换菜单显示状态
- `closeMenu()`: 关闭菜单
- `setCurrentPage(page)`: 设置当前页面
- `initApp()`: 初始化应用
- `startNetworkMonitoring()`: 开始网络状态监控
- `startResizeMonitoring()`: 开始窗口大小变化监控
- `setConnectionStatus(status)`: 设置连接状态

### 4.2 GameStore

**功能**：管理游戏数据，包括游戏列表、分类等

**State**：
- `games`: Object - 游戏数据对象
- `currentGame`: Object - 当前游戏

**Getters**：
- `getGameById(id)`: 根据ID获取游戏
- `getGamesList()`: 获取所有游戏列表
- `getGamesByCategory(category)`: 根据分类获取游戏
- `getGamesByDifficulty(difficulty)`: 根据难度获取游戏

**Actions**：
- `setCurrentGame(gameId)`: 设置当前游戏
- `resetCurrentGame()`: 重置当前游戏
- `loadGames()`: 加载游戏数据

### 4.3 LeaderboardStore

**功能**：管理排行榜数据，包括分数提交、获取等

**State**：
- `scores`: Array - 排行榜分数数据
- `isLoading`: Boolean - 是否正在加载
- `error`: String - 错误信息

**Actions**：
- `loadScores()`: 加载排行榜数据
- `submitScore(playerName, score, game)`: 提交分数
- `clearError()`: 清除错误信息

## 5. 数据存储

### 5.1 本地存储

使用IndexedDB进行本地数据存储，通过`GameDataManager`类管理游戏数据：

- 文件路径：`src/utils/data-manager.js`
- 功能：存储游戏设置、高分、游戏状态等

### 5.2 云端存储

使用Supabase进行云端数据存储，主要存储排行榜数据：

- 集成在`LeaderboardStore`中
- 功能：存储和获取全球排行榜数据

## 6. 响应式设计

### 6.1 断点设置

| 断点 | 设备类型 | 屏幕宽度 |
|------|---------|----------|
| 移动端 | 手机 | < 768px |
| 平板 | 平板设备 | 768px - 1024px |
| 桌面 | 桌面设备 | > 1024px |

### 6.2 适配策略

- 移动端：使用汉堡菜单，单列布局
- 平板：调整间距和字体大小，双列布局
- 桌面：多列布局，完整导航菜单

## 7. 迁移指南

### 7.1 从旧结构迁移到Vue组件

#### 7.1.1 旧结构

```html
<!-- 旧的HTML结构 -->
<header class="header">
  <div class="logo">...</div>
  <nav class="nav">...</nav>
  <div class="mobile-menu-btn">...</div>
</header>

<section class="games-section">
  <div class="games-grid">
    <div class="game-card">...</div>
    <!-- 多个游戏卡片 -->
  </div>
</section>
```

#### 7.1.2 新结构

```vue
<!-- 新的Vue组件结构 -->
<template>
  <div id="app">
    <Header @toggle-menu="toggleMenu" />
    <Navigation :is-open="isMenuOpen" @close-menu="closeMenu" />
    <main>
      <Hero />
      <GamesSection />
      <Leaderboard />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Header from './components/Header.vue';
import Navigation from './components/Navigation.vue';
import Hero from './components/Hero.vue';
import GamesSection from './components/GamesSection.vue';
import Leaderboard from './components/Leaderboard.vue';
import { useAppStore } from './stores/AppStore';

const appStore = useAppStore();
const isMenuOpen = computed(() => appStore.isMenuOpen);

const toggleMenu = () => appStore.toggleMenu();
const closeMenu = () => appStore.closeMenu();
</script>
```

### 7.2 数据管理迁移

#### 7.2.1 旧数据管理

```javascript
// 旧的本地存储方式
localStorage.setItem('woodcat_tetris_highScore', JSON.stringify(1000));
const highScore = JSON.parse(localStorage.getItem('woodcat_tetris_highScore') || '0');
```

#### 7.2.2 新数据管理

```javascript
// 新的数据管理方式
import { useGameStore } from './stores/GameStore';
import { gameDataManager } from './utils/data-manager';

// 使用Pinia store
const gameStore = useGameStore();

// 使用GameDataManager
await gameDataManager.saveData('tetris', 'highScore', 1000);
const highScore = await gameDataManager.loadData('tetris', 'highScore', 0);
```

## 8. 性能优化

### 8.1 代码分割

- 使用Vue 3的动态导入实现代码分割
- 游戏页面按需加载

### 8.2 缓存策略

- 游戏数据本地缓存
- 排行榜数据云端缓存
- 图片资源预加载

### 8.3 渲染优化

- 使用Vue 3的虚拟DOM
- 组件懒加载
- 避免不必要的重渲染

## 9. 测试

### 9.1 单元测试

- 使用Vitest进行单元测试
- 测试文件：`src/components/*.test.js`

### 9.2 集成测试

- 测试组件间的交互
- 测试文件：`src/App.test.js`

### 9.3 E2E测试

- 使用Cypress进行E2E测试
- 测试文件：`cypress/e2e/app.cy.js`

## 10. 部署

### 10.1 构建命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 10.2 部署目标

- 静态网站托管
- GitHub Pages
- Vercel/Netlify等平台

## 11. 开发指南

### 11.1 项目结构

```
src/
├── components/       # Vue组件
├── stores/          # Pinia状态管理
├── utils/           # 工具函数
├── styles/          # 样式文件
├── App.vue          # 根组件
└── main.js          # 入口文件
```

### 11.2 开发规范

- 使用Vue 3 Composition API
- 使用ES6+语法
- 组件命名使用PascalCase
- 文件命名使用PascalCase（组件）和camelCase（其他）
- 代码缩进使用2个空格
- 提交信息使用中文描述

## 12. 故障排除

### 12.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 组件不显示 | 组件路径错误 | 检查import路径是否正确 |
| 状态不更新 | 响应式数据使用错误 | 使用ref()或reactive()包装数据 |
| 网络请求失败 | Supabase配置错误 | 检查config.js中的Supabase配置 |
| 移动端菜单不显示 | 媒体查询错误 | 检查CSS媒体查询断点 |

### 12.2 调试技巧

- 使用Vue DevTools调试组件状态
- 使用console.log()输出调试信息
- 使用Vite的热更新功能快速预览修改
- 使用Cypress进行E2E测试

## 13. 更新日志

### v1.0.0

- 初始化Vue 3项目
- 创建核心组件（Header、Navigation、Hero、GamesSection、Leaderboard）
- 实现Pinia状态管理
- 添加响应式设计
- 集成数据存储（本地存储和云端存储）
- 添加单元测试和集成测试
- 创建组件文档

## 14. 贡献指南

1. Fork项目仓库
2. 创建功能分支
3. 提交修改
4. 推送到远程分支
5. 创建Pull Request

## 15. 联系方式

- GitHub仓库：https://github.com/LemonStudio-hub/woodcat-
- 联系邮箱：lemonhub@163.com

---

**文档更新时间**：2026年2月4日
**版本**：v1.0.0
