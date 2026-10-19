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
  // NEVER cache Firebase - fixes disappearing PRIVATE / DMs after Chrome close
  if(e.request.url.includes("firestore") || e.request.url.includes("firebase") || e.request.url.includes("googleapis") || e.request.url.includes("gstatic")){
    return;
  }
  // For HTML pages, go to network first
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(r=>r).catch(()=> caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});