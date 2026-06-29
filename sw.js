// Service worker — caches the game so it works fully offline once installed.
const CACHE = 'simpletetris-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Network-first, bypassing the browser HTTP cache so updates always take when
  // online (GitHub Pages caches HTML ~10min; without no-store the SW would serve
  // that stale copy). Falls back to the cached copy offline.
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() =>
        caches.match(e.request).then((r) => r || caches.match('./index.html'))
      )
  );
});
