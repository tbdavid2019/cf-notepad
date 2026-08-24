const CACHE_NAME = 'david888-wiki-shell-v5'
const OFFLINE_URL = '/_pwa-offline'
const PRECACHE_URLS = [
    OFFLINE_URL,
    '/app.webmanifest',
    '/notepad-icon-192.png',
    '/notepad-icon.png',
    '/notepad-icon.svg',
    '/favicon.ico',
    '/css/app.css',
    '/js/offline-store.mjs',
    '/js/pwa-install.mjs',
    '/js/marked.min.js',
    '/js/purify.min.js',
    '/js/markdown-toolbar.mjs',
    '/js/markdown-extensions.mjs',
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

    // 1. Navigation requests fallback to offline workspace if network fails
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(async () =>
                (await caches.match(OFFLINE_URL)) || Response.error(),
            ),
        )
        return
    }

    // 2. Web App Manifest
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

    // 3. Stale-While-Revalidate for JS, CSS, Fonts, Images, and Precached Assets
    const isStaticAsset = (
        PRECACHE_URLS.includes(url.pathname) ||
        url.pathname.startsWith('/js/') ||
        url.pathname.startsWith('/css/') ||
        url.pathname.startsWith('/fonts/') ||
        url.pathname.startsWith('/img/') ||
        url.pathname.startsWith('/wasm/') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico')
    )

    if (!isStaticAsset) return

    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const cachedResponse = await cache.match(request)
            const networkFetch = fetch(request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(request, networkResponse.clone())
                    }
                    return networkResponse
                })
                .catch(() => null)

            return cachedResponse || (await networkFetch) || Response.error()
        }),
    )
})
