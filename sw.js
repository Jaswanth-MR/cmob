/**
 * Project Phoenix - Service Worker
 * Provides 100% offline functionality by caching core app assets.
 */

const CACHE_NAME = "phoenix-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./protocols.js",
  "./analyzer.js",
  "./app.js",
  "./manifest.json"
];

// Install Event
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Phoenix SW] Caching offline shell assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Phoenix SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Cache First Strategy)
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(evt.request).catch(() => {
        // Fallback for document requests if offline
        if (evt.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});