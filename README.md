# 木头猫游戏合集 - Woodcat Games Collection

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License">
</div>

<div align="center">
  <p>一个包含多种经典游戏的集合，所有游戏均采用纯前端技术实现，无需服务器支持，可直接在浏览器中运行。</p>
</div>

## 🎮 游戏列表

### 🧩 俄罗斯方块 (Tetris)
- **特色**: 经典的俄罗斯方块游戏，支持键盘控制和手势操作
- **功能**: 分数统计、等级提升、行数计算、流畅动画、手势控制
- **操作**: 方向键控制，空格键硬下降，支持移动端滑动

### 🐍 贪吃蛇 (Snake)
- **特色**: 经典贪吃蛇游戏，响应式设计，音效反馈
- **功能**: 分数统计、长度显示、流畅动画、手势控制、音效系统
- **操作**: 方向键控制，支持移动端滑动

### 💣 扫雷 (Minesweeper)
- **特色**: 经典扫雷游戏，支持标记功能，胜利判定
- **功能**: 剩余雷数统计、已标记数、计时器、标记功能、胜利判定
- **操作**: 左键揭开，右键标记，支持移动端长按标记

### 🔢 2048
- **特色**: 数字合并游戏，响应式设计，动画效果
- **功能**: 分数统计、最高分记录、流畅动画、手势控制
- **操作**: 方向键或WASD移动，支持移动端滑动

### ♟️ 国际象棋 (Chess)
- **特色**: 经典国际象棋游戏，完整规则实现
- **功能**: 记分板、回合指示、动画效果、胜利判定
- **操作**: 点击选择棋子，点击目标位置移动

### ⚫ 跳棋 (Checkers)
- **特色**: 经典跳棋游戏，吃子规则完整
- **功能**: 记分板、回合指示、动画效果、胜利判定、王棋升级、人机对战AI
- **操作**: 点击选择棋子，点击目标位置移动

### ❌ 井字棋 (Tic-Tac-Toe)
- **特色**: 经典井字棋游戏，支持双人对战和人机对战
- **功能**: 记分板、回合指示、动画效果、胜利判定、人机对战AI
- **操作**: 点击空白格子放置标记

### 🃏 记忆卡牌 (Memory Card)
- **特色**: 记忆力挑战游戏，多种难度级别
- **功能**: 时间统计、步数统计、难度选择、动画效果、音效反馈
- **操作**: 点击翻开卡牌，寻找匹配的对子

## 🌟 项目特色

### 📱 移动端优化
- 所有游戏均针对移动设备进行了优化
- 支持触摸操作和手势控制
- 响应式设计，适配各种屏幕尺寸

### 🎨 精美界面
- 现代化UI设计
- 丰富的动画效果
- 流畅的用户交互体验

### 🔊 音效与震动反馈
- 多数游戏配备了音效反馈
- 移动、吃子、胜利等不同场景的音效
- 支持移动设备震动反馈

### 📞 反馈系统
- 集成用户反馈功能
- 提供GitHub仓库链接
- 访问支持信息

### 🎯 完整功能
- 记分板系统
- 胜利/失败判定
- 游戏重置功能

## 🚀 快速开始

### 直接运行
1. 克克隆或下载项目文件
2. 直接在浏览器中打开 `index.html` 文件
3. 选择您喜欢的游戏开始游玩

### 本地服务器运行（可选）
```bash
# 如果您有本地服务器环境
cd woodcat
python -m http.server 8000  # Python 3
# 或者
php -S localhost:8000      # PHP
```

## 📁 项目结构

```
woodcat/
├── index.html           # 主页面
├── css/
│   ├── style.css        # 主样式文件
│   └── responsive.css   # 响应式样式（可选）
├── js/
│   ├── main.js          # 主JavaScript文件
│   └── gesture-controller.js  # 手势控制器
├── games/
│   ├── tetris.html      # 俄罗斯方块
│   ├── snake.html       # 贪吃蛇
│   ├── minesweeper.html # 扫雷
│   ├── 2048.html        # 2048
│   ├── chess.html       # 国际象棋
│   ├── checkers.html    # 跳棋
│   ├── tic-tac-toe.html # 井字棋
│   └── memory-card.html # 记忆卡牌
├── feedback.html        # 反馈页面
└── README.md            # 项目说明文档
```

## ⚙️ 游戏操作说明

### 俄罗斯方块
- `← →`: 左右移动
- `↑`: 旋转
- `↓`: 加速下降
- `空格`: 硬下降
- 手势: 滑动控制

### 贪吃蛇
- `方向键`: 控制蛇的移动方向
- 手势: 滑动控制

### 扫雷
- `左键`: 揭开方块
- `右键`: 标记/取消标记
- `长按`: 移动端标记

### 2048
- `方向键`: 移动方块
- `WASD`: 移动方块
- 手势: 滑动控制

### 国际象棋
- `点击`: 选择棋子，选择目标位置

### 跳棋
- `点击`: 选择棋子，选择目标位置

### 井字棋
- `点击`: 在空白格子放置标记
- 支持双人对战和人机对战模式

### 记忆卡牌
- `点击`: 翻开卡牌
- 目标是找到所有匹配的卡牌对

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Flexbox, Grid, CSS动画
- **交互**: 原生JavaScript事件处理
- **响应式**: 媴体优先设计，媒体查询
- **AI算法**: Minimax算法（用于棋类游戏AI）
- **音效**: Web Audio API
- **震动**: Vibration API

## 📱 浏览器兼容性

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解更多详情

## 🙏 致谢

- 感谢所有经典游戏的原创者
- 感谢开源社区的支持

---

<div align="center">
  <p> Made with ❤️ by Woodcat </p>
  <p> 🎲 享受游戏时光 🎲 </p>
</div>