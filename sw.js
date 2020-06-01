// Your Service Worker. You can use its instance with the keyword `self`
// Example: self.addEventListener(...)

const appShellCacheName = "app-shell-v1";
const appShellFilesToCache = [
  // TODO: 2a - Declare files and URLs to cache at Service Worker installation
  "/",
  "index.html",
  "/assets/css/desktop.css",
  "/assets/css/fonts.css",
  "/assets/css/mobile.css",
  "/assets/css/normalize.css",
  "/assets/css/shell.css",
  "/assets/fonts/balsamiq-sans-v1-latin-700.woff",
  "/assets/js/dexie.min.js",
  "/assets/js/fontawesome-pro-5.13.0.min.js",
  "/assets/js/lazysizes.min.js",
  "/assets/js/trending.js",
  "/assets/js/saved.js",
  "/assets/js/search.js",
  "/assets/images/icon-192x192.png",
  "/assets/images/icon-512x512.png"
];

const appCaches = [appShellCacheName];

// TODO: 2b - On install, add app shell files to cache
self.addEventListener("install", event => {
  console.log("Your service worker is being installed !");
  event.waitUntil(
    caches.open(appShellCacheName).then(cache => {
      return cache.addAll(appShellFilesToCache);
    })
  );
});
// TODO: 2c - On activation, remove obsolete caches
self.addEventListener("activate", event => {
  console.log("Your service worker has been activated");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return true;
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});
// TODO: 2d - On intercepted fetch, use the strategy of your choice to respond to requests
self.addEventListener("fetch", event => {
  //console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
