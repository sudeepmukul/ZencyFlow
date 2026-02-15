// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in the background or closed

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config - using compat version for service workers
// Note: This must match your firebase.js config
firebase.initializeApp({
    apiKey: 'AIzaSyB7FHGYLt4WB7MEtQG0a5As0jUOuQ32sls',
    authDomain: 'zencyflow.firebaseapp.com',
    projectId: 'zencyflow',
    storageBucket: 'zencyflow.firebasestorage.app',
    messagingSenderId: '688088421850',
    appId: '1:688088421850:web:d1fb47eb831aaf706adce3'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Zency Flow';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: payload.data?.tag || 'zency-notification',
        data: payload.data,
        requireInteraction: payload.data?.requireInteraction === 'true',
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes('zency-flow') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle push events for local scheduled notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push event received');

    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Notification from Zency Flow',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: data.tag || 'zency-push',
            data: data
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Zency Flow', options)
        );
    }
});

// Install and activate immediately
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activating');
    event.waitUntil(clients.claim());
});

console.log('[SW] Firebase Messaging Service Worker loaded');
