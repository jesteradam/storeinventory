self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // A fetch handler must be present for the app to be installable
  event.respondWith(fetch(event.request));
});