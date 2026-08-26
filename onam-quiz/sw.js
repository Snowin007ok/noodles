/* The Great Onam Quiz — offline cache (network-first, cache fallback) */
const CACHE = "onamquiz-v4";
const CORE = [
  ".",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "assets/maveli-1.png",
  "assets/maveli-2.png",
  "assets/maveli-3.png",
  "assets/onam-music.mp3",
  "assets/onam-finale.mp3",
  "assets/icon-192.png",
  "assets/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Network first so a bad cached response can never wedge the app;
   the cache serves only when the network is unreachable (true offline). */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
