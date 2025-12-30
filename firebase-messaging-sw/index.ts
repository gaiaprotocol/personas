import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

declare const self: ServiceWorkerGlobalScope;

const firebaseApp = initializeApp({
  apiKey: "AIzaSyDr1Z_EFx_xeV2iTIDAM8P17LlALdHrhxc",
  authDomain: "gaia-personas.firebaseapp.com",
  projectId: "gaia-personas",
  storageBucket: "gaia-personas.firebasestorage.app",
  messagingSenderId: "615977174684",
  appId: "1:615977174684:web:a70fe1bdba155c19fb0f59",
  measurementId: "G-K0EJRQ4574"
});

let messaging: ReturnType<typeof getMessaging> | null = null;
try {
  messaging = getMessaging(firebaseApp);
} catch (err) {
  console.error('[SW] Failed to initialize Firebase Messaging', err);
}

// 상대 경로를 절대 URL로 변환
function toAbsoluteUrl(urlOrPath: string): string {
  try {
    return new URL(urlOrPath).toString();
  } catch {
    return new URL(urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`, self.location.origin).toString();
  }
}

// Background message handler
if (messaging) {
  onBackgroundMessage(messaging, (payload) => {
    console.log('[SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Personas';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.image || '/images/icon.png',
      badge: '/images/logo-icon.png',
      tag: payload.data?.type === 'chat' ? `chat-${payload.data?.roomId}` : 'personas-notification',
      data: payload.data,
      requireInteraction: true,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const data = (event.notification.data || {}) as Record<string, any>;

  // 우선순위: data.clickAction > chat 타입 기본 경로 > notice 타입 기본 경로 > '/'
  let target = '/';
  if (typeof data.clickAction === 'string' && data.clickAction) {
    target = data.clickAction;
  } else if (data.type === 'chat' && data.roomId) {
    target = `/chat/${data.roomId}`;
  } else if (data.type === 'notice') {
    target = '/notices';
  }

  const targetUrl = toAbsoluteUrl(target);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            payload: { targetUrl, data },
          });
          return;
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Fallback push event handler
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push event received');

  if (!event.data) {
    console.log('[SW] Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);

    if (!data.notification) {
      const title = data.title || 'Personas';
      const options: NotificationOptions = {
        body: data.body || '',
        icon: '/images/icon.png',
        badge: '/images/logo-icon.png',
        data: data,
      };

      event.waitUntil(self.registration.showNotification(title, options));
    }
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
  }
});

// Immediate activation on install
self.addEventListener('install', () => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});
