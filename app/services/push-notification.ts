import { getMessaging, getToken, onMessage, type Messaging, type MessagePayload } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';
import { registerFcmToken } from '../api/fcm';

const VAPID_KEY = 'BMbUW_vmSlr_sDuZWDqlDC75IAJoBEZsTo-bdKYT6Cjql8CTS30846fD0wgV6G-a62x8qVA0lryEP2vtAhC2Zjc';

// localStorage keys
const FCM_TOKEN_KEY = 'fcm_token';
const PUSH_PERMISSION_KEY = 'push_permission_asked';

/**
 * Initialize push notifications and register FCM token
 */
export async function initializePushNotifications(app: FirebaseApp): Promise<string | null> {
  // Push notifications not available in WebView
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('[Push] Notifications not supported');
    return null;
  }

  // Check Service Worker support
  if (!('serviceWorker' in navigator)) {
    console.log('[Push] Service Worker not supported');
    return null;
  }

  try {
    // Register Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[Push] Service Worker registered:', registration);

    // Handle denied permission
    if (Notification.permission === 'denied') {
      console.log('[Push] Notification permission denied');
      return null;
    }

    // Don't re-ask if already asked
    if (Notification.permission === 'default') {
      const alreadyAsked = localStorage.getItem(PUSH_PERMISSION_KEY);
      if (alreadyAsked) {
        console.log('[Push] Permission already asked, skipping');
        return null;
      }
    }

    let messaging: Messaging;
    try {
      messaging = getMessaging(app);
    } catch (err) {
      console.error('[Push] Failed to get messaging instance:', err);
      return null;
    }

    // Request FCM token (will auto-request permission if needed)
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    localStorage.setItem(PUSH_PERMISSION_KEY, 'true');

    if (!token) {
      console.log('[Push] No FCM token received');
      return null;
    }

    console.log('[Push] FCM token:', token);

    // Register to server if token changed
    const existingToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (token !== existingToken) {
      const registered = await registerFcmToken(token, 'web');
      if (registered) {
        localStorage.setItem(FCM_TOKEN_KEY, token);
        console.log('[Push] Token registered to server');
      }
    }

    return token;
  } catch (err) {
    console.error('[Push] Error initializing push notifications:', err);
    localStorage.setItem(PUSH_PERMISSION_KEY, 'true');
    return null;
  }
}

/**
 * Setup foreground message handler
 */
export function setupForegroundMessageHandler(
  app: FirebaseApp,
  onNotification: (payload: MessagePayload) => void,
): (() => void) | null {
  try {
    const messaging = getMessaging(app);

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Push] Foreground message received:', payload);
      onNotification(payload);
    });

    return unsubscribe;
  } catch (err) {
    console.error('[Push] Error setting up foreground handler:', err);
    return null;
  }
}

/**
 * Get current FCM token
 */
export function getCurrentFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_KEY);
}

/**
 * Get push permission status
 */
export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Handler for Service Worker messages
 */
export function setupServiceWorkerMessageHandler(
  onNavigate: (path: string) => void,
): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[Push] Message from SW:', event.data);

    if (event.data?.type === 'NOTIFICATION_CLICK') {
      const { targetUrl } = event.data.payload;
      if (targetUrl) {
        onNavigate(targetUrl);
      }
    }
  });
}

/**
 * Clear stored FCM token
 */
export function clearFcmToken(): void {
  localStorage.removeItem(FCM_TOKEN_KEY);
  localStorage.removeItem(PUSH_PERMISSION_KEY);
}
