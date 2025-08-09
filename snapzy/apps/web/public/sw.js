self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open('snapzy-cache-v1');
    const cached = await cache.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  })());
});