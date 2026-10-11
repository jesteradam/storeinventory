const CACHE_NAME = 'pasahero-moto-v5-online-offline';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(res=>{
      const clone=res.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(e.request, clone)); return res;
    }).catch(()=>caches.match(e.request).then(c=>c||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached){
      e.waitUntil(fetch(e.request).then(r=>caches.open(CACHE_NAME).then(cache=>cache.put(e.request,r))).catch(()=>{}));
      return cached;
    }
    return fetch(e.request).then(r=>caches.open(CACHE_NAME).then(cache=>{cache.put(e.request,r.clone()); return r;}));
  }));
});
