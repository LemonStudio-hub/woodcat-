#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * 构建后处理脚本 - 自动修复HTML文件中的脚本标签
 */
import fs from 'fs';
import path from 'path';

const distDir = './dist';
const publicDir = './public';

// 修复所有HTML文件中的脚本标签
function fixHtmlScriptTags() {
  const htmlFiles = findAllHtmlFiles(distDir);
  
  htmlFiles.forEach(file => {
    fixSingleHtmlFile(file);
  });
  
console.log(`已处理 ${htmlFiles.length} 个HTML文件`);
}

// 查找所有HTML文件
function findAllHtmlFiles(dir) {
  let results = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findAllHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// 修复单个HTML文件
function fixSingleHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 移除Vite添加的错误资源引用
  content = content.replace(/<link rel="modulepreload"[^>]+>/gi, '');
  content = content.replace(/<script type="module" src="\/games\/assets\/[^>]+><\/script>/gi, '');
  content = content.replace(/<link rel="stylesheet" href="\/games\/css\/[^>]+>/gi, '');
  
  // 恢复被注释掉的脚本标签
  content = content.replace(
    /<!--\s*NON_MODULE_SCRIPT:\s*([^>]+)\s*-->/gi,
    '<script src="$1"></script>'
  );
  
  // 为游戏页面添加必要的脚本引用
  if (filePath.includes('\\games\\') || filePath.includes('/games/')) {
    // 移除所有现有的脚本引用，然后重新添加
    content = content.replace(/<script src="\.\.\/js\/[^>]+><\/script>/gi, '');
    
    // 在body标签结束前添加脚本引用
    // 找到Vite插件注释的位置，如果没有则直接在body结束标签前添加
    const viteCommentIndex = content.indexOf('<!-- [nonModulePlugin] Processed -->');
    const bodyEndIndex = content.indexOf('</body>');
    
    if (viteCommentIndex !== -1 && viteCommentIndex < bodyEndIndex) {
      // 在Vite插件注释之前添加脚本标签
      const scriptTags = `    <script src="../js/logger.js" defer></script>\n    <script src="../js/dataManager.js" defer></script>\n    <script src="../js/scoreManager.js" defer></script>\n    <script src="../js/audioVibration.js" defer></script>\n    <script src="../js/i18n.js" defer></script>\n    <script src="../js/gameFamiliarity.js" defer></script>\n    <script src="../js/lib/hammer.min.js" defer></script>\n`;
      content = content.substring(0, viteCommentIndex) + scriptTags + content.substring(viteCommentIndex);
    } else if (bodyEndIndex !== -1) {
      // 直接在body结束标签前添加脚本标签
      const scriptTags = `    <script src="../js/logger.js" defer></script>\n    <script src="../js/dataManager.js" defer></script>\n    <script src="../js/scoreManager.js" defer></script>\n    <script src="../js/audioVibration.js" defer></script>\n    <script src="../js/i18n.js" defer></script>\n    <script src="../js/gameFamiliarity.js" defer></script>\n    <script src="../js/lib/hammer.min.js" defer></script>\n`;
      content = content.substring(0, bodyEndIndex) + scriptTags + content.substring(bodyEndIndex);
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`已修复: ${filePath}`);
}

// 复制根目录js目录中的文件到dist目录
function copyRootJsFiles() {
  const rootJsDir = './js';
  const distJsDir = path.join(distDir, 'js');
  
  if (!fs.existsSync(rootJsDir)) {
    console.log('js目录不存在，跳过复制');
    return;
  }
  
  // 确保目标目录存在
  if (!fs.existsSync(distJsDir)) {
    fs.mkdirSync(distJsDir, { recursive: true });
  }
  
  // 复制所有JS文件
  const copyDir = (src, dest) => {
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`已复制: ${srcPath} -> ${destPath}`);
      }
    }
  };
  
  copyDir(rootJsDir, distJsDir);
}

// 复制public目录中的JS文件到dist目录
function copyPublicJsFiles() {
  const publicJsDir = path.join(publicDir, 'js');
  const distJsDir = path.join(distDir, 'js');
  
  if (!fs.existsSync(publicJsDir)) {
    console.log('public/js目录不存在，跳过复制');
    return;
  }
  
  // 确保目标目录存在
  if (!fs.existsSync(distJsDir)) {
    fs.mkdirSync(distJsDir, { recursive: true });
  }
  
  // 复制所有JS文件
  const copyDir = (src, dest) => {
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`已复制: ${srcPath} -> ${destPath}`);
      }
    }
  };
  
  copyDir(publicJsDir, distJsDir);
}

// 运行修复
fixHtmlScriptTags();
copyRootJsFiles();
copyPublicJsFiles();

console.log('构建后处理完成！');