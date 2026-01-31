// 木头猫游戏合集 - 配置文件示例
// 请复制此文件为 config.js 并填入您的实际配置

const config = {
  supabase: {
    url: 'YOUR_SUPABASE_URL',  // 例如: 'https://your-project.supabase.co'
    key: 'YOUR_SUPABASE_ANON_KEY'  // 例如: 'your-anon-key'
  },
  // 游戏相关配置
  game: {
    // 是否启用排行榜功能
    enableLeaderboard: true
  }
};

// 导出配置（在浏览器环境中，这将成为全局变量）
window.AppConfig = config;