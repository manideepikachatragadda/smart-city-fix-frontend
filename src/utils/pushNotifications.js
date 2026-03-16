import { subscribePushNotification } from '../services/api';
import toast from 'react-hot-toast';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Converts a URL-safe Base64 VAPID key to a Uint8Array
 * required by pushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Full push-notification subscription flow:
 * 1. Check browser support
 * 2. Request permission
 * 3. Register service worker
 * 4. Subscribe to push
 * 5. Send subscription to backend
 *
 * @returns {Promise<boolean>} true if successfully subscribed
 */
export async function subscribeToPushNotifications() {
    // 1. Check browser support
    if (!('serviceWorker' in navigator)) {
        console.warn('[Push] Service Workers not supported');
        toast.error('Push notifications are not supported in this browser.');
        return false;
    }
    if (!('PushManager' in window)) {
        console.warn('[Push] PushManager not supported');
        toast.error('Push notifications are not supported in this browser.');
        return false;
    }
    if (!VAPID_PUBLIC_KEY) {
        console.error('[Push] VITE_VAPID_PUBLIC_KEY is not set in .env');
        toast.error('Push notifications are not configured.');
        return false;
    }

    try {
        // 2. Request permission
        console.log('[Push] Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('[Push] Permission result:', permission);
        if (permission !== 'granted') {
            toast.error('Notification permission denied.');
            return false;
        }

        // 3. Register the service worker
        console.log('[Push] Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[Push] Service worker registered, waiting for ready...');
        await navigator.serviceWorker.ready;
        console.log('[Push] Service worker ready');

        // 4. Subscribe to push manager
        console.log('[Push] Subscribing to push manager...');
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('[Push] Subscription obtained:', subscription.toJSON());

        // 5. Send subscription to backend
        console.log('[Push] Sending subscription to backend...');
        await subscribePushNotification(subscription.toJSON());

        localStorage.setItem('push-subscribed', 'true');
        toast.success('Notifications enabled successfully!');
        return true;
    } catch (error) {
        console.error('[Push] Subscription failed at step:', error.message, error);
        toast.error('Failed to enable notifications. Please try again.');
        return false;
    }
}

/**
 * Check whether the user has already subscribed on this device.
 */
export function isPushSubscribed() {
    return localStorage.getItem('push-subscribed') === 'true';
}

/**
 * Unsubscribe from push notifications on this device.
 */
export async function unsubscribeFromPushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
        }
        localStorage.removeItem('push-subscribed');
        toast.success('Notifications disabled successfully!');
        return true;
    } catch (error) {
        console.error('[Push] Unsubscribe failed:', error);
        toast.error('Failed to disable notifications.');
        return false;
    }
}
