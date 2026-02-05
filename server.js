/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ROOT_DIR = '/root/woodcat';

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // 处理根路径和index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(ROOT_DIR, filePath);

  // 处理路由，如果文件不存在尝试添加.html扩展名
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 如果文件不存在，尝试添加.html扩展名
      const htmlPath = filePath + '.html';
      fs.access(htmlPath, fs.constants.F_OK, (htmlErr) => {
        if (!htmlErr) {
          filePath = htmlPath;
          sendFile(filePath, res);
        } else {
          // 文件不存在，返回404
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>');
        }
      });
    } else {
      sendFile(filePath, res);
    }
  });
});

function sendFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  }[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${ROOT_DIR}`);
});