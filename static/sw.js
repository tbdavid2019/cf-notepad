const CACHE_NAME = 'david888-wiki-shell-v4'
const OFFLINE_URL = '/_pwa-offline'
const PRECACHE_URLS = [
    OFFLINE_URL,
    '/app.webmanifest',
    '/notepad-icon-192.png',
    '/notepad-icon.png',
    '/notepad-icon.svg',
    '/favicon.ico',
    '/js/offline-store.mjs',
    '/js/pwa-install.mjs',
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting()),
    )
})

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName)),
            ))
            .then(() => self.clients.claim()),
    )
})

self.addEventListener('fetch', event => {
    const { request } = event

    if (request.method !== 'GET') return

    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(async () =>
                (await caches.match(OFFLINE_URL)) || Response.error(),
            ),
        )
        return
    }

    if (url.pathname === '/app.webmanifest') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone()
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
                    return response
                })
                .catch(() => caches.match(request)),
        )
        return
    }

    if (!PRECACHE_URLS.includes(url.pathname)) return

    event.respondWith(
        caches.match(request).then(response => response || fetch(request)),
    )
})
