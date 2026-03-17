// Service Worker v3 - Fixed Android Notification Badge
const SW_VERSION = 'v3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/logo.png', // Large icon
            badge: '/badge.svg', // Small monochrome status bar icon
            vibrate: [200, 100, 200]
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/dashboard'));
});
