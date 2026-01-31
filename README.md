# 木头猫游戏合集

一个集合了多种经典小游戏的网站，所有游戏均采用纯前端技术实现，无需服务器支持，可直接在浏览器中运行。

## 项目结构

```
woodcat/
├── css/                 # 样式文件
├── games/               # 各个小游戏
├── js/                  # JavaScript文件
│   ├── config.js        # 配置文件
│   └── main.js          # 主要功能代码
├── .github/workflows/   # GitHub Actions工作流
├── index.html           # 主页面
└── README.md            # 项目说明
```

## 配置说明

### Supabase 配置

本项目使用 Supabase 作为后端服务。要配置 Supabase 连接，请按以下步骤操作：

1. 复制 `js/config.example.js` 为 `js/config.js`
2. 在 `js/config.js` 中填入您的 Supabase 连接信息：

```javascript
const config = {
  supabase: {
    url: 'YOUR_SUPABASE_URL',  // 例如: 'https://your-project.supabase.co'
    key: 'YOUR_SUPABASE_ANON_KEY'  // 例如: 'your-anon-key'
  }
};
```

**注意：** 在生产环境中，请确保：

1. 使用 Supabase 的匿名访问密钥（anon key），而不是服务角色密钥（service role key）
2. 在 Supabase 仪表板中设置适当的 RLS（Row Level Security）策略
3. 限制数据库访问权限，避免安全风险

## 安全注意事项

由于这是一个纯前端项目，所有代码（包括配置）都对用户可见。在生产环境中，您应该：

1. 使用 Supabase 的 RLS（Row Level Security）来限制数据访问
2. 仅暴露必要的 API 端点
3. 考虑使用中间件或 Edge Functions 来处理敏感操作

## 本地运行

要本地运行此项目：

```bash
# 克隆项目
git clone <repository-url>
cd woodcat

# 安装依赖（如有）
npm install

# 启动本地服务器
npm start
# 或者
python -m http.server 8000
```

然后在浏览器中访问 `http://localhost:8000`

## 部署

可以直接将整个项目文件夹部署到任何静态网站托管服务，如：
- GitHub Pages
- Vercel
- Netlify
- 任何支持静态文件托管的服务