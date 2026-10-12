const CACHE="chatty-v4";
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["/storeinventory/chatty/","/storeinventory/chatty/index.html","/storeinventory/chatty/manifest.json","/storeinventory/chatty/icon.png"])));
  self.skipWaiting();
});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));