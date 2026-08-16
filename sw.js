/**
 * Project Phoenix - Service Worker
 * Provides offline functionality by caching core app assets.
 */

// IMPORTANT: bump this version number every time you change a cached file
// (index.html, style.css, survival-guide.js, protocols.js, analyzer.js, app.js).
// Otherwise returning users' browsers will keep serving the old cached files.
const CACHE_NAME = "phoenix-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./survival-guide.js",
  "./protocols.js",
  "./analyzer.js",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : undefined)
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(evt.request).catch(() => {
        if (evt.request.destination === "document") return caches.match("./index.html");
        return undefined;
      });
    })
  );
});
