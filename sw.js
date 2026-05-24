const CACHE_NAME = 'ea-youth-union-v1';
// ከመስመር ውጭ እንዲሰሩ የሚፈልጓቸውን ፋይሎች ዝርዝር እዚህ ያስገቡ
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './home.html',
  './live.html',
  './hyminal.html',
  './mezmur.html', 
  './sabbath.html',  
  './thanks.html',  
  './choir.html',
  './lesson.html',
  './style.css',
  './nav.css',
  './nav.js',
  './transition.css',
  './ea.js',
  './hymnal.js',
  './live.js',
  './ea-keybooard.js'
];

// Service Worker ሲጫን ፋይሎቹን Cache ያደርጋል
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // ወዲያውኑ አዲሱን ስሪት እንዲያነቃ ያደርገዋል
  );
});

// አሮጌ Cache ካለ ያጠፋል
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

// ተጠቃሚው አፑን ሲከፍት መረጃዎችን ከሰርቨር ወይም ከCache ያመጣል
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ኢንተርኔት ካለ አዲሱን መረጃ ለተጠቃሚው ያሳያል፣ በዚያውም Cache ውስጥ ያድሳል
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ኢንተርኔት ከሌለ ከተቀመጠው Cache ያነባል
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // የሌለ ነገር ከሆነ (ለምሳሌ ከመስመር ውጭ ሆኖ አዲስ ገጽ ከፈለገ) index.html ያሳየው
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
