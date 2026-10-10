const CACHE_NAME = 'store-inv-offline-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle GET
  if (e.request.method !== 'GET') return;
  
  // For navigation (user opens app) - NETWORK FIRST!
  // This prevents 404 cache bug
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Cache the good page
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, res.clone());
            return res;
          });
        })
        .catch(() => {
          // Offline - return cached index.html
          return caches.match(e.request).then(cached => {
            return cached || caches.match('./index.html') || caches.match('/storeinventory/index.html');
          });
        })
    );
    return;
  }

  // For other files - CACHE FIRST
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Don't cache bad responses (404)
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, res.clone());
          return res;
        });
      });
    })
  );
});