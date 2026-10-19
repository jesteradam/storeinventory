const CACHE_NAME = "canapnapan-v5-no-cache-firebase"
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
  // NEVER cache Firebase - fixes PRIVATE 0 / DMs 0 after closing Chrome
  if(e.request.url.includes("firestore") || e.request.url.includes("firebase") || e.request.url.includes("googleapis") || e.request.url.includes("gstatic")){
    return;
  }
  // For HTML pages, go to network first - fixes can't enter after close
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(res=>res).catch(()=> caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
