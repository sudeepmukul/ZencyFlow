// Notification Manager with scheduling capabilities
// Uses browser's Notification API with timeout-based scheduling
// Enhanced with Firebase Cloud Messaging (FCM) for push notifications

import { getMessagingInstance } from './firebase';

const scheduledNotifications = new Map();
let fcmToken = null;

export const NotificationManager = {
    // Request permission for browser notifications
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("[Notifications] Browser does not support desktop notifications");
            return false;
        }

        if (Notification.permission === "granted") {
            // Also try to get FCM token
            await NotificationManager.getFCMToken();
            return true;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                // Get FCM token after permission granted
                await NotificationManager.getFCMToken();
                return true;
            }
        }

        return false;
    },

    // Get FCM token for push notifications
    getFCMToken: async () => {
        try {
            const fcm = await getMessagingInstance();
            if (!fcm) {
                console.log("[Notifications] FCM not available");
                return null;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            fcmToken = await fcm.getToken(fcm.messaging, {
                vapidKey: undefined, // Add your VAPID key here if you have one
                serviceWorkerRegistration: registration
            });

            if (fcmToken) {
                console.log("[Notifications] FCM Token obtained:", fcmToken.substring(0, 20) + "...");
                // Store token for later use (e.g., send to backend)
                localStorage.setItem('fcmToken', fcmToken);
            }

            return fcmToken;
        } catch (error) {
            console.log("[Notifications] FCM token error:", error.message);
            return null;
        }
    },

    // Check if notifications are enabled
    isEnabled: () => {
        return "Notification" in window && Notification.permission === "granted";
    },

    // Send an immediate notification using service worker when available
    send: async (title, options = {}, force = false) => {
        console.log(`[Notifications] send() called: "${title}", force=${force}, permission=${Notification?.permission}`);

        if (!force && !NotificationManager.isEnabled()) {
            console.log("[Notifications] Not enabled, skipping:", title);
            return null;
        }

        try {
            // Try to use service worker for persistent notifications
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, {
                    icon: '/favicon.svg',
                    badge: '/favicon.svg',
                    tag: options.tag || undefined,
                    requireInteraction: options.requireInteraction || false,
                    body: options.body,
                    data: options.data
                });
                console.log("[Notifications] Service Worker notification sent");
                return true;
            }

            // Fallback to browser Notification API
            const notification = new Notification(title, {
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                tag: options.tag || undefined,
                requireInteraction: options.requireInteraction || false,
                ...options
            });

            console.log("[Notifications] Browser notification created");

            notification.onclick = () => {
                window.focus();
                notification.close();
                if (options.onClick) options.onClick();
            };

            return notification;
        } catch (error) {
            console.error("[Notifications] Failed to send:", error);
            return null;
        }
    },

    // Schedule a notification for a specific time
    // key: unique identifier for this notification (e.g., "reminder-abc123")
    // targetDate: Date object or ISO string for when to fire
    scheduleAt: (key, title, options, targetDate) => {
        // Cancel existing if same key
        NotificationManager.cancelScheduled(key);

        const targetTime = new Date(targetDate).getTime();
        const now = Date.now();
        const delay = targetTime - now;

        // Don't schedule if in the past
        if (delay <= 0) {
            console.log(`[Notifications] Skipping past notification: ${key}`);
            return false;
        }

        // Cap at ~24 hours to prevent issues with very large timeouts
        const maxDelay = 24 * 60 * 60 * 1000;
        if (delay > maxDelay) {
            console.log(`[Notifications] Delay too long (${Math.round(delay / 3600000)}h), will reschedule later: ${key}`);
            // Schedule a re-check in 12 hours
            const recheckTimeout = setTimeout(() => {
                scheduledNotifications.delete(key);
                NotificationManager.scheduleAt(key, title, options, targetDate);
            }, 12 * 60 * 60 * 1000);

            scheduledNotifications.set(key, { timeoutId: recheckTimeout, targetDate });
            return true;
        }

        const timeoutId = setTimeout(() => {
            NotificationManager.send(title, options);
            scheduledNotifications.delete(key);
        }, delay);

        scheduledNotifications.set(key, { timeoutId, targetDate });
        console.log(`[Notifications] Scheduled "${title}" for ${new Date(targetDate).toLocaleString()} (key: ${key})`);
        return true;
    },

    // Cancel a scheduled notification by key
    cancelScheduled: (key) => {
        const scheduled = scheduledNotifications.get(key);
        if (scheduled) {
            clearTimeout(scheduled.timeoutId);
            scheduledNotifications.delete(key);
            console.log(`[Notifications] Cancelled: ${key}`);
            return true;
        }
        return false;
    },

    // Cancel all notifications with a matching prefix
    // e.g., cancelAllWithPrefix("task-") cancels all task notifications
    cancelAllWithPrefix: (prefix) => {
        let count = 0;
        for (const key of scheduledNotifications.keys()) {
            if (key.startsWith(prefix)) {
                NotificationManager.cancelScheduled(key);
                count++;
            }
        }
        if (count > 0) {
            console.log(`[Notifications] Cancelled ${count} notifications with prefix "${prefix}"`);
        }
        return count;
    },

    // Get all currently scheduled notifications (for debugging)
    getScheduled: () => {
        const result = {};
        for (const [key, value] of scheduledNotifications.entries()) {
            result[key] = {
                targetDate: value.targetDate,
                timeUntil: Math.round((new Date(value.targetDate).getTime() - Date.now()) / 1000) + 's'
            };
        }
        return result;
    },

    // Clear all scheduled notifications
    clearAll: () => {
        for (const [key, value] of scheduledNotifications.entries()) {
            clearTimeout(value.timeoutId);
        }
        scheduledNotifications.clear();
        console.log("[Notifications] Cleared all scheduled notifications");
    },

    // Get stored FCM token
    getStoredToken: () => {
        return fcmToken || localStorage.getItem('fcmToken');
    }
};
