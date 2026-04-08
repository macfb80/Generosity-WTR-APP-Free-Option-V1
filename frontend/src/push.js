/**
 * push.js — Web Push subscription module for WTR App
 * 
 * Usage:
 *   import { requestPushPermission, isPushSupported } from './push';
 *   
 *   if (isPushSupported()) {
 *     const result = await requestPushPermission(zip, prospectId);
 *     if (result.granted) { ... }
 *   }
 */

const VAPID_PUBLIC_KEY = 'BGM63koflZfZJWPw2ikTiwfF9--0iFkMJzI_wuwzVmf7fxUWmC2BeLIS04JRS1ebvFTqldodUijzZ0UCkH-JzEs';
const API_BASE = 'https://generosity-dashboard.vercel.app';

/**
 * Convert a base64 VAPID key to Uint8Array for PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if Web Push is supported in this browser
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Check current push permission state without prompting
 */
export function getPushPermissionState() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

/**
 * Register the service worker (call once on app mount)
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[WTR Push] Service worker registered:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[WTR Push] Service worker registration failed:', err.message);
    return null;
  }
}

/**
 * Request push notification permission and subscribe
 * 
 * @param {string} zip - User's scanned ZIP code
 * @param {string|null} prospectId - Prospect ID from email capture (if available)
 * @param {object} householdProfile - Household profile data (optional)
 * @returns {object} { supported, granted, subscription, error }
 */
export async function requestPushPermission(zip, prospectId = null, householdProfile = {}) {
  if (!isPushSupported()) {
    return { supported: false, granted: false, error: 'Push not supported in this browser' };
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      return { supported: true, granted: false, error: 'Permission denied by user' };
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    // Extract keys from subscription
    const subJson = subscription.toJSON();
    const p256dh = subJson.keys?.p256dh || '';
    const auth = subJson.keys?.auth || '';

    // Save to backend
    try {
      await fetch(`${API_BASE}/api/wtr/push-subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          zip,
          prospect_id: prospectId,
          household_profile: householdProfile
        })
      });
    } catch (apiErr) {
      // Don't fail the whole flow if backend save fails
      console.warn('[WTR Push] Backend save failed:', apiErr.message);
      // Store locally for retry
      try {
        const pending = JSON.parse(localStorage.getItem('wtr_push_pending') || '[]');
        pending.push({ endpoint: subscription.endpoint, p256dh, auth, zip, prospect_id: prospectId, household_profile: householdProfile, ts: Date.now() });
        localStorage.setItem('wtr_push_pending', JSON.stringify(pending));
      } catch (e) {}
    }

    return { supported: true, granted: true, subscription };

  } catch (err) {
    console.error('[WTR Push] Error:', err.message);
    return { supported: true, granted: false, error: err.message };
  }
}
