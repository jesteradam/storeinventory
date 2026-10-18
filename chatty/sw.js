const CACHE_NAME = "canapnapan-v4-fix"
const FILES=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if(key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  // For HTML pages, go to network first, not cache
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(()=> caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});