/* EZBaths Portal - PWA Service Worker */
const STATIC_CACHE = 'ezbaths-static-v6';
const RUNTIME_CACHE = 'ezbaths-runtime-v6';
const OFFLINE_URL = './offline.html';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './portal.html',
  './login.html',
  './offline.html',
  './manifest.json',
  './assets/css/responsive-fixes.css',
  './assets/css/styles.css',
  './assets/js/toast-notifications.js',
  './assets/js/loading-spinner.js',
  './assets/js/auth-check.js',
  './assets/js/ezapp-data.js',
  './assets/js/universal-cache.js',
  './assets/app_icons/icon-180.png',
  './assets/app_icons/icon-192.png',
  './assets/app_icons/icon-512.png',
  './assets/images/EZBATHS-graphic.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await Promise.allSettled(
      PRECACHE_ASSETS.map(async (asset) => {
        const response = await fetch(asset, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(asset, response);
        }
      })
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

const isHtmlNavigation = (request) => request.mode === 'navigate';

const isStaticAsset = (request) => {
  const url = new URL(request.url);
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.json'))
  );
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  if (isHtmlNavigation(request)) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const runtime = await caches.open(RUNTIME_CACHE);
        runtime.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        const cachedPage = await caches.match(request);
        return cachedPage || caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch {
      return caches.match(request);
    }
  })());
});
