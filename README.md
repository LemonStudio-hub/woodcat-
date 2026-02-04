# 🐱 木头猫游戏合集

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=white">
  <img src="https://img.shields.io/badge/IndexedDB-007ACC?style=for-the-badge&logo=database&logoColor=white">
</p>

<p align="center">
  <strong>发现有趣的小游戏世界</strong><br>
  一个集合了多种经典小游戏的网站，采用现代化前端技术实现，无需服务器支持，可直接在浏览器中运行。
</p>

<p align="center">
  <a href="https://www.woodcat.online"><strong>🌐 官网</strong></a> •
  <a href="#-游戏列表"><strong>🎮 游戏列表</strong></a> •
  <a href="#-特色功能"><strong>✨ 特色功能</strong></a> •
  <a href="#%EF%B8%8F-安装"><strong>🛠️ 安装</strong></a>
</p>

---

## 🎮 游戏列表

<div align="center">

| 游戏 | 类型 | 难度 | 玩法 |
|------|------|------|------|
| 🧩 **俄罗斯方块** | 益智 | 🟢 简单 | 经典益智游戏，旋转方块填满行 |
| 🐍 **贪吃蛇** | 休闲 | 🟡 中等 | 怀旧经典玩法，吃食物成长 |
| 💣 **扫雷** | 逻辑 | 🔴 困难 | 挑战逻辑思维，标记所有地雷 |
| 🔢 **2048** | 益智 | 🟡 中等 | 数字合并挑战，达到2048 |
| ♟️ **国际象棋** | 策略 | 🔴 困难 | 策略对战游戏，人机/双人模式 |
| ⚪ **跳棋** | 策略 | 🟡 中等 | 经典双人对战，跳跃吃子 |
| ❌ **井字棋** | 策略 | 🟢 简单 | 经典策略游戏，三子连线 |
| 🃏 **记忆卡牌** | 记忆 | 🟡 中等 | 考验记忆能力，配对相同卡牌 |
| ⚾ **打砖块** | 休闲 | 🟡 中等 | 经典街机游戏，反弹球击砖 |

</div>

---

## ✨ 特色功能

### 🎨 现代化界面
- 🚀 **Vue.js 3 主页** - 采用现代化框架的主页界面
- 📱 **响应式设计** - 完美适配桌面、平板、手机
- ✨ **动画效果** - 丰富的CSS动画和过渡效果
- 🎨 **现代风格** - 采用Material Design设计语言
- 🌙 **暗黑模式** - 可选主题配色方案

### 📊 统一计分系统
- 🏆 **全球排行榜** - 查看各游戏最高分记录
- 📈 **实时统计** - 记录胜率、得分、游玩次数
- 📱 **数据持久化** - 基于IndexedDB本地存储
- ⚡ **智能评分** - 不同游戏类型采用相应计分规则

### 🎮 人性体验
- 🎵 **音效反馈** - 每个操作都有相应音效
- 📱 **触控支持** - 为移动端优化的触控操作
- ⚡ **流畅动画** - 60FPS平滑游戏体验
- 🔔 **震动反馈** - 支持设备震动反馈

### 🧪 测试保障
- ✅ **单元测试** - 使用Vitest进行组件测试
- 🔄 **集成测试** - 测试组件间的交互
- 🎯 **E2E测试** - 使用Cypress进行端到端测试
- 📊 **测试覆盖率** - 确保代码质量

---

## 🛠️ 安装

### 本地运行

```bash
# 克隆项目
git clone https://github.com/LemonStudio-hub/woodcat.git
cd woodcat

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 或使用其他方式启动
# 方式1: 使用npm
npm run dev

# 方式2: 使用Python
python -m http.server 8000

# 方式3: 使用Node.js
npx serve
```

然后在浏览器中访问 `http://localhost:3000` 查看Vue主页，或访问 `http://localhost:8000` 查看原版主页。

### 构建生产版本

```bash
# 构建项目
pnpm build

# 预览构建结果
pnpm preview
```

### 运行测试

```bash
# 运行单元测试
npx vitest run

# 运行E2E测试
npx cypress run
```

### 部署到生产环境

可直接将整个项目文件夹部署到任何静态网站托管服务：

- 🟦 **Vercel** - 一键部署
- 🔵 **Netlify** - 自动构建
- 🟨 **GitHub Pages** - 免费托管
- 🟪 **Cloudflare Pages** - 全球加速

---

## 📁 项目结构

```
woodcat/
├── 📁 css/                 # 样式文件
│   ├── style.css          # 主样式文件
│   ├── responsive.css     # 响应式样式
│   └── mobile-optimized.css # 移动端优化样式
├── 📁 games/               # 各个小游戏
│   ├── tetris.html        # 俄罗斯方块
│   ├── snake.html         # 贪吃蛇
│   ├── minesweeper.html   # 扫雷
│   ├── 2048.html          # 2048
│   ├── chess.html         # 国际象棋
│   ├── checkers.html      # 跳棋
│   ├── tic-tac-toe.html   # 井字棋
│   ├── memory-card.html   # 记忆卡牌
│   └── arkanoid.html      # 打砖块
├── 📁 js/                  # JavaScript文件
│   ├── data-manager.js    # 数据管理模块
│   ├── score-manager.js   # 计分管理模块
│   ├── audio-vibration.js # 音效震动模块
│   ├── modal.js          # 模态框模块
│   ├── main.js           # 主逻辑文件
│   └── lib/              # 第三方库
│       └── hammer.min.js # 触控手势库
├── 📁 src/                 # Vue.js 源代码
│   ├── components/       # Vue组件
│   │   ├── Header.vue   # 头部组件
│   │   ├── Navigation.vue # 导航组件
│   │   ├── Hero.vue     # 英雄区域组件
│   │   ├── GamesSection.vue # 游戏列表组件
│   │   ├── GameCard.vue # 游戏卡片组件
│   │   ├── Leaderboard.vue # 排行榜组件
│   │   ├── ScoreModal.vue # 分数提交模态框
│   │   ├── ConnectionStatus.vue # 连接状态组件
│   │   └── FeedbackPage.vue # 反馈页面组件
│   ├── stores/           # Pinia状态管理
│   │   ├── AppStore.js # 应用状态管理
│   │   ├── GameStore.js # 游戏数据管理
│   │   └── LeaderboardStore.js # 排行榜数据管理
│   ├── modules/          # ES6模块
│   │   ├── GameDataManager.js # 数据管理器
│   │   └── ScoreManager.js # 计分管理器
│   ├── utils/            # 工具函数
│   ├── styles/           # 样式文件
│   ├── App.vue          # 主应用组件
│   ├── main.js          # 应用入口
│   └── style.css        # 全局样式
├── 📁 public/              # 静态资源
├── index.html            # 原版主页
├── index-vue.html        # Vue主页（推荐）
├── leaderboard.html      # 排行榜页面
├── vite.config.js        # Vite配置
├── postbuild.js          # 构建后处理脚本
├── .gitignore           # Git忽略文件
└── README.md            # 项目说明
```

---

## 🔧 技术栈

### 前端框架
- **Vue.js 3** - 现代化前端框架（主页）
- **Vite** - 快速构建工具
- **ES6 Modules** - 模块化开发

### 前端技术
- **HTML5** - 结构化内容
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 交互逻辑
- **Canvas API** - 游戏渲染
- **IndexedDB** - 本地数据存储

### 交互功能
- **Touch Events** - 移动端触控
- **Keyboard Events** - 键盘控制
- **Audio API** - 音效播放
- **Vibration API** - 震动反馈

---

## 🎯 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

### 开发规范
1. 遵循 [Vue.js 风格指南](https://vuejs.org/style-guide/)
2. 遵循 [Airbnb JavaScript 风格指南](https://github.com/airbnb/javascript)
3. 保持代码注释清晰
4. 确保响应式设计兼容性
5. 测试所有主流浏览器兼容性

### 贡献步骤
```bash
1. Fork 仓库
2. 创建功能分支 (git checkout -b feature/AmazingFeature)
3. 提交更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 开启 Pull Request
```

---

## 📄 许可证

本项目采用 [MIT 许可证](https://opensource.org/licenses/MIT) - 查看 [LICENSE](./LICENSE) 文件了解详情。

---

## 📚 文档

### 组件文档

详细的Vue组件使用说明和API文档请参考：

- [COMPONENTS_DOCUMENTATION.md](./COMPONENTS_DOCUMENTATION.md) - 包含所有组件的详细文档

### 迁移指南

从旧版本迁移到Vue 3版本的指南：

- [COMPONENTS_DOCUMENTATION.md#7-迁移指南](./COMPONENTS_DOCUMENTATION.md#7-迁移指南)

### 开发文档

- [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md) - 开发进度记录

---

## 🤝 支持项目

如果您喜欢这个项目，请考虑：

- ⭐ 给项目一个Star
- 🔄 分享给朋友
- 💬 提交功能建议
- 🔧 提交修复补丁

---

## 📞 联系我们

遇到问题或有建议？请随时通过以下方式联系：

- 🐛 [Issue Tracker](https://github.com/LemonStudio-hub/woodcat/issues)
- 🌐 [官网](https://www.woodcat.online)
- 📧 lemonhub@163.com

---

<div align="center">
  <p>🐱 <strong>木头猫游戏合集</strong> - 发现有趣的小游戏世界</p>
  <p>Made with ❤️ by LemonStudio</p>
</div>