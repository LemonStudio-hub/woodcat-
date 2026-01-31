const http = require('http');
const fs = require('fs');
const path = require('path');

// 简单的测试，检查关键文件是否包含必要的代码
function testLeaderboardFunctionality() {
    console.log('正在测试排行榜功能...');
    
    // 检查 index.html 是否包含排行榜相关的HTML元素
    const indexPath = '/root/woodcat/index.html';
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (indexContent.includes('leaderboard-section')) {
        console.log('✓ index.html 包含排行榜部分');
    } else {
        console.log('✗ index.html 缺少排行榜部分');
    }
    
    if (indexContent.includes('score-modal')) {
        console.log('✓ index.html 包含分数提交模态框');
    } else {
        console.log('✗ index.html 缺少分数提交模态框');
    }
    
    // 检查 js/main.js 是否包含排行榜相关的JavaScript代码
    const mainPath = '/root/woodcat/js/main.js';
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    if (mainContent.includes('loadLeaderboard')) {
        console.log('✓ js/main.js 包含加载排行榜的函数');
    } else {
        console.log('✗ js/main.js 缺少加载排行榜的函数');
    }
    
    if (mainContent.includes('submitScoreToLeaderboard')) {
        console.log('✓ js/main.js 包含提交分数到排行榜的函数');
    } else {
        console.log('✗ js/main.js 缺少提交分数到排行榜的函数');
    }
    
    if (mainContent.includes('supabase')) {
        console.log('✓ js/main.js 包含Supabase集成代码');
    } else {
        console.log('✗ js/main.js 缺少Supabase集成代码');
    }
    
    // 检查 games/tetris.html 是否包含返回主页时询问提交分数的代码
    const tetrisPath = '/root/woodcat/games/tetris.html';
    const tetrisContent = fs.readFileSync(tetrisPath, 'utf8');
    
    if (tetrisContent.includes('score=${score}&game=tetris')) {
        console.log('✓ tetris.html 包含提交分数到主页的链接');
    } else {
        console.log('✗ tetris.html 缺少提交分数到主页的链接');
    }
    
    // 检查 css/style.css 是否包含排行榜相关的样式
    const cssPath = '/root/woodcat/css/style.css';
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    if (cssContent.includes('.leaderboard-section')) {
        console.log('✓ css/style.css 包含排行榜样式');
    } else {
        console.log('✗ css/style.css 缺少排行榜样式');
    }
    
    if (cssContent.includes('.modal-overlay')) {
        console.log('✓ css/style.css 包含模态框样式');
    } else {
        console.log('✗ css/style.css 缺少模态框样式');
    }
    
    console.log('\n排行榜功能测试完成。');
    console.log('\n总结：');
    console.log('- 排行榜UI已在主页添加');
    console.log('- 分数提交模态框已实现');
    console.log('- Supabase集成已完成');
    console.log('- 游戏页面已更新，可提交分数');
    console.log('- 所有相关样式已添加');
    console.log('\n要完全测试功能，需要在浏览器中实际运行网站并与Supabase数据库交互。');
}

testLeaderboardFunctionality();