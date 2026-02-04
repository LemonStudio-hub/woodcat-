#!/usr/bin/env node

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
  
  // 恢复被注释掉的脚本标签
  content = content.replace(
    /<!--\s*NON_MODULE_SCRIPT:\s*([^>]+)\s*-->/gi,
    '<script src="$1"></script>'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`已修复: ${filePath}`);
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
copyPublicJsFiles();

console.log('构建后处理完成！');