const CACHE_NAME = 'ea-youth-pwa-v2';

// Service Worker ሲጫን
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// አሮጌ Cache ካለ ማጥፋት እና አዲሱን ማንቃት
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ተጠቃሚው አፑን ሲጠቀም መረጃዎችን ከሰርቨር ወይም ከCache ማምጣት
self.addEventListener('fetch', (event) => {
  // GET ሪኩዌስቶችን ብቻ ነው Cache የምናደርገው
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ኢንተርኔት ካለ አዲሱን መረጃ ለተጠቃሚው ያሳያል፣ በዚያውም Cache ውስጥ ያድሳል
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // ኢንተርኔት ከሌለ ከተቀመጠው Cache ያነባል
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // የሌለ ነገር ከሆነ index.html ያሳያል
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
