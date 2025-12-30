import { tokenManager } from '@gaiaprotocol/client-common';

declare const GAIA_API_BASE_URI: string;

/**
 * Register FCM token to server and subscribe to topic
 */
export async function registerFcmToken(
  fcmToken: string,
  platform: 'web' | 'android' | 'ios' = 'web'
): Promise<boolean> {
  const authToken = tokenManager.getToken();
  if (!authToken) {
    console.error('[FCM] No auth token available');
    return false;
  }

  try {
    const res = await fetch(`${GAIA_API_BASE_URI}/fcm-tokens/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: fcmToken, platform, app: 'personas' }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[FCM] Failed to register token:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[FCM] Error registering token:', err);
    return false;
  }
}

/**
 * Unregister FCM token from server and unsubscribe from topic
 */
export async function unregisterFcmToken(fcmToken: string): Promise<boolean> {
  const authToken = tokenManager.getToken();
  if (!authToken) {
    console.error('[FCM] No auth token available');
    return false;
  }

  try {
    const res = await fetch(`${GAIA_API_BASE_URI}/fcm-tokens/unregister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: fcmToken, app: 'personas' }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[FCM] Failed to unregister token:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[FCM] Error unregistering token:', err);
    return false;
  }
}
