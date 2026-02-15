/**
 * 木头猫游戏合集 - 优化版Service Worker
 * 提供离线缓存、后台同步、推送通知等功能
 */

const CACHE_NAME = 'woodcat-v1.0.0';
const STATIC_CACHE = 'woodcat-static-v1.0.0';
const DYNAMIC_CACHE = 'woodcat-dynamic-v1.0.0';
const GAME_CACHE = 'woodcat-games-v1.0.0';

// 缓存策略配置
const CACHE_STRATEGIES = {
  // 静态资源：Cache First
  static: {
    patterns: [
      /\.(?:js|css|woff2?|eot|ttf|otf)$/,
      /\/icons\//,
      /\/images\//
    ],
    strategy: 'cacheFirst',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
  },
  
  // 游戏资源：Stale While Revalidate
  games: {
    patterns: [
      /\/games\//,
      /\/tank-battle-phaser\//
    ],
    strategy: 'staleWhileRevalidate',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
  },
  
  // API请求：Network First
  api: {
    patterns: [/\/api\//],
    strategy: 'networkFirst',
    maxAge: 5 * 60 * 1000 // 5分钟
  },
  
  // HTML页面：Network First
  html: {
    patterns: [/\.html$/],
    strategy: 'networkFirst',
    maxAge: 24 * 60 * 60 * 1000 // 1天
  }
};

// 需要预缓存的资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index-vue.html',
  '/leaderboard.html',
  '/css/style.css',
  '/js/main.js',
  '/js/utils.js',
  '/js/i18n.js',
  '/js/scoreManager.js',
  '/js/dataManager.js',
  '/fonts/*',
  '/icons/*'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== GAME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Activation failed:', error);
      })
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 跳过非HTTP请求
  if (!request.method.startsWith('GET')) {
    return;
  }
  
  // 根据URL匹配缓存策略
  const strategy = getCacheStrategy(url);
  
  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

// 获取缓存策略
function getCacheStrategy(url) {
  for (const [type, config] of Object.entries(CACHE_STRATEGIES)) {
    for (const pattern of config.patterns) {
      if (pattern.test(url.pathname)) {
        return config;
      }
    }
  }
  return null;
}

// 处理请求
async function handleRequest(request, strategy) {
  const cacheName = getCacheName(strategy);
  const cache = await caches.open(cacheName);
  
  switch (strategy.strategy) {
    case 'cacheFirst':
      return cacheFirst(request, cache, strategy.maxAge);
    
    case 'networkFirst':
      return networkFirst(request, cache, strategy.maxAge);
    
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, cache, strategy.maxAge);
    
    default:
      return fetch(request);
  }
}

// 获取缓存名称
function getCacheName(strategy) {
  if (strategy.patterns.some(p => p.test(/\/games\//))) {
    return GAME_CACHE;
  }
  return STATIC_CACHE;
}

// Cache First策略
async function cacheFirst(request, cache, maxAge) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    console.log('[SW] Cache First: serving from cache', request.url);
    return cachedResponse;
  }
  
  console.log('[SW] Cache First: fetching from network', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse && networkResponse.ok) {
    const clonedResponse = networkResponse.clone();
    cache.put(request, clonedResponse);
  }
  
  return networkResponse;
}

// Network First策略
async function networkFirst(request, cache, maxAge) {
  try {
    console.log('[SW] Network First: fetching from network', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      cache.put(request, clonedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First: serving from cache', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面
    return caches.match('/offline.html');
  }
}

// Stale While Revalidate策略
async function staleWhileRevalidate(request, cache, maxAge) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Stale While Revalidate: serving from cache', request.url);
    // 后台更新缓存
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      });
    
    return cachedResponse;
  }
  
  console.log('[SW] Stale While Revalidate: fetching from network', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse && networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// 检查缓存是否过期
function isExpired(response, maxAge) {
  const date = response.headers.get('date');
  if (!date) return true;
  
  const cachedDate = new Date(date);
  const now = new Date();
  const age = now - cachedDate;
  
  return age > maxAge;
}

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncScores());
  }
});

// 同步分数
async function syncScores() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const scoreRequests = await cache.match('/scores-sync');
    
    if (scoreRequests) {
      const scores = await scoreRequests.json();
      
      // 发送到服务器
      await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scores)
      });
      
      // 清除同步队列
      await cache.delete('/scores-sync');
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : '您有新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看',
        icon: '/icons/explore.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('木头猫游戏', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
    );
  }
});

// 缓存清理
async function cleanupCache() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      
      if (isExpired(response, 30 * 24 * 60 * 60 * 1000)) {
        await cache.delete(request);
      }
    }
  }
}

// 定期清理缓存
setInterval(cleanupCache, 24 * 60 * 60 * 1000); // 每天清理一次

console.log('[SW] Service Worker loaded');