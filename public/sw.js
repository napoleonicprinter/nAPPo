// nAPPo Trails — Service Worker
// Provides offline caching so the app works without an internet connection.

const CACHE_NAME = 'nappo-trails-v1';

// Core app shell files to cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
];

// ─── Install: cache the app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ─── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: Network-first for data/API, Cache-first for assets ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests we don't control
  if (request.method !== 'GET') return;

  // ── GitHub raw data fetches: Network-first (always get fresh data) ──
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a copy of the fresh response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline fallback: serve from cache if available
          return caches.match(request);
        })
    );
    return;
  }

  // ── Same-origin static assets: Cache-first ──
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        // Not in cache — fetch, cache, and return
        return fetch(request).then((response) => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // ── Everything else (fonts, external CDN): Network with cache fallback ──
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
