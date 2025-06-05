const CACHE_NAME = 'hello-games-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/imges/Logosite.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('[ServiceWorker] Attempting to cache:', urlsToCache);
        try {
          await cache.addAll(urlsToCache);
          console.log('[ServiceWorker] All files cached successfully ✅');
        } catch (err) {
          console.error('[ServiceWorker] Failed to cache:', err);
        }
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (!cacheWhitelist.includes(name)) {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).catch(() =>
        new Response('Offline and no cached version available.', {
          status: 503,
          statusText: 'Offline fallback not found'
        })
      );
    })
  );
});
