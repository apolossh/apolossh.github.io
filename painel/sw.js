const CACHE_NAME = 'painel-cache-v1';
const urlsToCache = [
  '/painel.html',
  '/painel/style.css',
  '/painel/script.js',
  '/painel/jspdf.umd.min.js',
  '/painel/icon-192.png',
  '/painel/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});