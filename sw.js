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

/* Network-first untuk shell assets (HTML/CSS/JS) — selalu ambil versi terbaru;
   cache-first untuk foto & audio — hemat bandwidth */
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  const isShell = SHELL.some(s => url.endsWith(s.replace('./', '')));
  if(isShell){
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(hit =>
        hit ||
        fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
      )
    );
  }
});
