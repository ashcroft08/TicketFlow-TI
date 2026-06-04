/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files, // everything in `static`
    '/offline' // página de arranque offline
];

self.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // Serve build/static assets from cache first
        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);
            if (response) return response;
        }

        // For everything else, try the network first, fall back to cache
        try {
            const response = await fetch(event.request);

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch {
            const url = new URL(event.request.url);
            
            // Si es navegación y estamos offline, redirigimos limpiamente a /offline
            // Esto evita errores de hidratación de SvelteKit al no mezclar URLs con HTMLs
            if (event.request.mode === 'navigate') {
                if (url.pathname !== '/offline') {
                    return Response.redirect('/offline', 302);
                }
                // Si ya estamos pidiendo /offline y falla la red, devolvemos su HTML en caché
                const offlinePage = await cache.match('/offline');
                if (offlinePage) return offlinePage;
            }

            return cache.match(event.request);
        }
    }

    event.respondWith(respond());
});

// --- NOTIFICACIONES PUSH & SYSTEM ---

self.addEventListener('push', (event) => {
    let data = { title: 'TicketFlow TI', body: 'Nueva actualización en el sistema.' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data = { title: 'TicketFlow TI', body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const targetUrl = event.notification.data.url;
            
            // Si ya hay una ventana abierta con la misma URL, enfocarla
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Si no hay ventana abierta, abrir una nueva
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
