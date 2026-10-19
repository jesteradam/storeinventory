// Store Inventory - Offline Service Worker
// Path: /storeinventory/sw.js | Scope: /storeinventory/
const CACHE_NAME = 'store-inventory-v4';
const PRECACHE_URLS = [
  '/storeinventory/',
  '/storeinventory/index.html',
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS.map(url => new Request(url, {cache: 'reload'}))).catch(err => {
        console.log('[SW] Precache failed, caching what we can', err);
        // Try to cache individually to not fail whole install
        return Promise.allSettled(
          PRECACHE_URLS.map(u => cache.add(u).catch(()=>{}))
        );
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Only handle GET, same-origin, not chrome-extension
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  if (req.url.includes('chrome-extension')) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      // Cache first, then network update
      if (cached) {
        // Update cache in background (stale-while-revalidate)
        event.waitUntil(
          fetch(req).then((fresh) => {
            if (fresh && fresh.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(req, fresh));
            }
          }).catch(()=>{})
        );
        return cached;
      }

      // Not in cache, go to network
      return fetch(req).then((response) => {
        // Cache successful same-origin responses
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
          return caches.match('/storeinventory/index.html')
            .then(r => r || caches.match('./index.html'))
            .then(r => r || caches.match('/storeinventory/'));
        }
      });
    })
  );
});
