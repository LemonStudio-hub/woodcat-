/**
 * 木头猫游戏合集 - 安全头部配置
 * 提供Content Security Policy和其他安全相关的HTTP头部
 */

// Content Security Policy配置
const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://fonts.googleapis.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.github.com',
    'wss:',
    'blob:'
  ],
  'media-src': [
    "'self'",
    'blob:'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': []
};

// 其他安全头部配置
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp'
};

/**
 * 生成CSP头部
 * @returns {string} CSP头部字符串
 */
function generateCSP() {
  const directives = Object.entries(cspConfig)
    .map(([directive, sources]) => {
      const sourceList = sources.join(' ');
      return `${directive} ${sourceList}`;
    })
    .join('; ');

  return directives;
}

/**
 * 生成所有安全头部
 * @returns {Object} 安全头部对象
 */
function generateSecurityHeaders() {
  return {
    'Content-Security-Policy': generateCSP(),
    ...securityHeaders
  };
}

/**
 * 在HTML中添加安全meta标签
 * @returns {string} HTML meta标签字符串
 */
function generateSecurityMetaTags() {
  const metaTags = [
    `<meta charset="UTF-8">`,
    `<meta http-equiv="X-Content-Type-Options" content="nosniff">`,
    `<meta http-equiv="X-Frame-Options" content="DENY">`,
    `<meta http-equiv="X-XSS-Protection" content="1; mode=block">`,
    `<meta name="referrer" content="strict-origin-when-cross-origin">`,
    `<meta http-equiv="Content-Security-Policy" content="${generateCSP()}">`
  ];

  return metaTags.join('\n');
}

/**
 * 验证URL是否安全
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否安全
 */
function isSecureURL(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // 检查协议
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    
    // 检查是否是相对URL
    if (!parsed.host) {
      return true;
    }
    
    // 检查是否是同源
    if (parsed.origin === window.location.origin) {
      return true;
    }
    
    // 检查白名单域名
    const allowedDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdn.jsdelivr.net',
      'api.github.com'
    ];
    
    return allowedDomains.includes(parsed.hostname);
  } catch (e) {
    return false;
  }
}

/**
 * 清理HTML内容，防止XSS攻击
 * @param {string} html - HTML内容
 * @returns {string} 清理后的HTML
 */
function sanitizeHTML(html) {
  // 创建一个临时的DOM元素
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * 验证用户输入
 * @param {string} input - 用户输入
 * @param {Object} options - 验证选项
 * @returns {boolean} 是否有效
 */
function validateInput(input, options = {}) {
  const {
    maxLength = 1000,
    minLength = 0,
    allowedChars = null,
    disallowScripts = true
  } = options;

  // 检查长度
  if (input.length < minLength || input.length > maxLength) {
    return false;
  }

  // 检查脚本注入
  if (disallowScripts) {
    const scriptPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:\s*text\/html/gi
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }
  }

  // 检查允许的字符
  if (allowedChars) {
    const regex = new RegExp(`^[${allowedChars}]*$`);
    if (!regex.test(input)) {
      return false;
    }
  }

  return true;
}

/**
 * 防止点击劫持
 */
function preventClickjacking() {
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
}

/**
 * 检测和防止CSRF攻击
 * @param {string} token - CSRF令牌
 * @returns {boolean} 是否有效
 */
function validateCSRFToken(token) {
  // 从localStorage获取存储的令牌
  const storedToken = localStorage.getItem('csrf_token');
  
  // 比较令牌
  return token === storedToken;
}

/**
 * 生成CSRF令牌
 * @returns {string} CSRF令牌
 */
function generateCSRFToken() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  localStorage.setItem('csrf_token', token);
  return token;
}

/**
 * 安全的JSON解析
 * @param {string} json - JSON字符串
 * @param {any} defaultValue - 默认值
 * @returns {any} 解析结果或默认值
 */
function safeJSONParse(json, defaultValue = null) {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('JSON parse failed:', e);
    return defaultValue;
  }
}

/**
 * 安全的本地存储操作
 */
const SecureStorage = {
  /**
   * 安全地保存数据
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      const encrypted = btoa(JSON.stringify({
        data: value,
        timestamp: Date.now()
      }));
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error('Secure storage set failed:', e);
    }
  },

  /**
   * 安全地读取数据
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;

      const decrypted = JSON.parse(atob(encrypted));
      
      // 检查是否过期（7天）
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - decrypted.timestamp > maxAge) {
        this.remove(key);
        return defaultValue;
      }

      return decrypted.data;
    } catch (e) {
      console.error('Secure storage get failed:', e);
      return defaultValue;
    }
  },

  /**
   * 删除数据
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Secure storage remove failed:', e);
    }
  },

  /**
   * 清空所有数据
   */
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Secure storage clear failed:', e);
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.Security = {
    generateCSP,
    generateSecurityHeaders,
    generateSecurityMetaTags,
    isSecureURL,
    sanitizeHTML,
    validateInput,
    preventClickjacking,
    validateCSRFToken,
    generateCSRFToken,
    safeJSONParse,
    SecureStorage
  };
  
  // 自动执行安全措施
  window.addEventListener('DOMContentLoaded', () => {
    // 防止点击劫持
    preventClickjacking();
    
    // 生成CSRF令牌
    generateCSRFToken();
    
    console.log('[Security] Security measures initialized');
  });
}

// 导出模块
export {
  cspConfig,
  securityHeaders,
  generateCSP,
  generateSecurityHeaders,
  generateSecurityMetaTags,
  isSecureURL,
  sanitizeHTML,
  validateInput,
  preventClickjacking,
  validateCSRFToken,
  generateCSRFToken,
  safeJSONParse,
  SecureStorage
};