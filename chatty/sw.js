const CACHE = "chatty-v2";
const ASSETS = ["./","./index.html","./manifest.json","./icon.png"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>{
      return cached || fetch(e.request).catch(()=>caches.match("./index.html"));
    })
  );
});