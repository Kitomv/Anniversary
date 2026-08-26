/* Service worker minimal — cache-first untuk shell situs.
   Tujuan: buka instan setelah install PWA + tetap bisa dibuka offline. */
const CACHE = 'kado-aniv-v1';
const SHELL = [
  './',
  './index.html',
  './aiv.css',
  './aiv.js',
  './aiv-data.js',
  './manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache-first; foto & audio di-cache saat pertama diminta (stale-while-revisit) */
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit ||
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => hit)
    )
  );
});
