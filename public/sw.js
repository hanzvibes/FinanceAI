const CACHE = "financeai-shell-v5";
const RUNTIME = "financeai-runtime-v5";
const APP_SHELL = ["/", "/finance", "/calendar", "/personal", "/manifest.webmanifest", "/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![CACHE, RUNTIME].includes(key)).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(RUNTIME).then((cache) => cache.put(request, clone)));
      }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match("/offline.html"))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const clone = response.clone();
      event.waitUntil(caches.open(RUNTIME).then((cache) => cache.put(request, clone)));
    }
    return response;
  })));
});
