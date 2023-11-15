const staticCacheName = 'site-static-pwa-v1.0.7';
const dynamicCacheName = 'site-dynamic-pwa-v1.0.7';
const assets = [
    '/',
    '/index.html',
    '/offline.html', // Add offline.html to the assets for precaching
    // Add other critical assets for precaching
];

// Install event
self.addEventListener('install', evt => {
    // Precache static assets during installation
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('Caching Static Assets');
            cache.addAll(assets);
        })
    );
});

// Activate event
self.addEventListener('activate', evt => {
    // Remove old caches during activation
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', evt => {
    // Serve from cache or fetch and cache dynamically
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    // Check cached items size
                    limitCacheSize(dynamicCacheName, 14);
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Serve offline page for HTML requests that couldn't be fetched
            if (evt.request.url.indexOf('.html') > -1) {
                return caches.match('/offline.html');
            }
        })
    );
});