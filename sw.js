const CACHE_NAME = 'hello-games-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/images/Logosite.png', // ✅ Fixed path spelling (was `/imges`)
  // Add more assets like icons, fonts, manifest, etc.
];

// Install event: Pre-cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Activate event: Clear old caches
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
  self.clients.claim(); // Take control of all open clients
});

// Fetch event: Serve from cache or fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Serve from cache if available
      if (response) return response;

      // Else fetch and optionally cache new request
      return fetch(event.request)
        .then(networkResponse => {
          // Optionally cache dynamic assets here if needed
          return networkResponse;
        })
        .catch(() => {
          // Optionally return a fallback offline page/image
          return caches.match('/offline.html'); // if you create one
        });
    })
  );
});
