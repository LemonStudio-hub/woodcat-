// Service Worker for Woodcat Game Collection
// PWA implementation for offline support and performance optimization

const CACHE_NAME = 'woodcat-games-v1';
const ASSETS_TO_CACHE = [
  // Core files
  '/',
  '/index.html',
  '/site.webmanifest',
  
  // CSS files
  '/css/style.css',
  '/css/responsive.css',
  '/css/mobile-optimized.css',
  
  // JavaScript files
  '/js/main.js',
  '/js/dataManager.js',
  '/js/scoreManager.js',
  '/js/logger.js',
  '/js/cdnLoader.js',
  
  // Icon files
  '/icons/apple-touch-icon.png',
  '/icons/favicon-96x96.png',
  '/icons/favicon.svg',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  
  // Game files (core games)
  '/games/tetris.html',
  '/games/tic-tac-toe.html',
  '/games/tank-battle.html',
  '/games/2048.html',
  '/games/minesweeper.html'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If cached response exists, return it
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache opaque responses (cross-origin resources without CORS)
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response (it can only be used once)
            const responseToCache = networkResponse.clone();
            
            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(() => {
            // If network fails, try to serve a fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync event - sync data when connection is available
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncScores());
  }
});

// Sync scores function
async function syncScores() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_SCORES' });
    });
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/web-app-manifest-192x192.png',
    badge: '/icons/web-app-manifest-192x192.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Woodcat Games', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});