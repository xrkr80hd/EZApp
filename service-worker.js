/* EZBaths Portal - Enhanced Service Worker */
const CACHE = 'ezbaths-v5';
const ASSETS = [
    './',
    './index.html',
    './portal.html',
    './create-customer.html',
    './scheduler.html',
    './customer-survey.html',
    './photo-checklist.html',
    './whodat-video.html',
    './bathroom-measurement.html',
    './commission_calculator.html',
    './tools.html',
    './tip-sheet.html',
    './4-square.html',
    './post-appointment.html',
    './post-sale-checklist.html',
    './post-sale-documents.html',
    './joc-complete.html',
    './joc-complete-new.html',
    './joc-page1.html',
    './joc-page2.html',
    './office-processing.html',
    './login.html',
    './admin-users.html',
    './offline.html',
    './manifest.json',
    './assets/js/ezapp-data.js',
    './assets/js/universal-cache.js',
    './assets/js/toast-notifications.js',
    './assets/js/loading-spinner.js',
    './assets/js/html2canvas.min.js',
    './assets/js/auth-check.js',
    './assets/css/responsive-fixes.css',
    './assets/css/styles.css',
    './assets/app_icons/bathtub.svg',
    './assets/app_icons/icon-180.png',
    './assets/app_icons/icon-192.png',
    './assets/app_icons/icon-512.png',
    './assets/images/EZBATHS-graphic.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => {
            return cache.addAll(ASSETS).catch((err) => {
                console.error('Cache install failed for some assets:', err);
                // Continue anyway - partial cache is better than no cache
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Network-first for navigations, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    // Handle page navigations with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful navigations
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => { });
                    return response;
                })
                .catch(async () => {
                    const cache = await caches.open(CACHE);
                    const offline = await cache.match('./offline.html');
                    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
                })
        );
        return;
    }

    // For other GET requests: cache-first, then network
    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => { });
                    return response;
                })
                .catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
