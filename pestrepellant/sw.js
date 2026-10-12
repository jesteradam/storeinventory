const CACHE_NAME = 'pestrepellant-v8.0';
const FILES_TO_CACHE = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      Promise.all(FILES_TO_CACHE.map(url => cache.add(url).catch(()=>{})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.url.includes('firestore') || e.request.url.includes('firebase')) return;
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached || (e.request.mode === 'navigate' ? caches.match('./index.html') : null));
      
      return cached || fetchPromise;
    })
  );
});