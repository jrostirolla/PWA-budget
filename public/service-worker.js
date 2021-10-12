const FILES_TO_CACHE = [
    "/",
    "/index.js",
    "/manifest.json",
    "/index.js",
    "/styles.css",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";



self.addEventListener("install", event => {
    event.waitUntil(
        caches
        .open(STATIC_CACHE)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
        .keys()
        .then(cacheNames => {
            return cacheNames => {
                return cacheNames.filter(
                    cacheName => !currentCaches.includes(cacheNames)
                )}
        })
        .then(cachesToDelete => {
            return Promise.all(
                cachesToDelete.map(cacheToDelete => {
                    return caches.delete(cacheToDelete);
                })
            )
        })
        .then(() => self.clients.claim())
    )
});

self.addEventListener("fetch", event => {
    //handles non GET requests
    if ( event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        event.respondWith(fetch(event.request));
        return;
    }

    //selects between online or offline mode
    if (event.request.url.includes('/api/transaction')) {
        event.respondWith(
            caches.open(RUNTIME_CACHE)
            .then(cache => {
                return fetch(event.request)
                .then(response => {
                    cache.put(event.request, response.clone());
                    return response;
                })
                .catch(() => caches.match(event.request))
            })
        )
        return;
    }

    //uses cache first
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});
