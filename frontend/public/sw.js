/**
 * Service Worker — WTR App Web Push Notifications
 * Handles: push events, notification clicks, offline caching
 */

const CACHE_NAME = 'wtr-app-v2';
const OFFLINE_URL = '/';

// ── Install: cache shell ──────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push: receive and display notification ────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Water Quality Update', body: 'Your water quality report has been updated.' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // If not JSON, treat as text
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Tap to view your updated water quality report.',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'wtr-update',
    renotify: true,
    data: {
      url: data.url || '/',
      city: data.city || null,
      zip: data.zip || null,
      type: data.type || 'general'
    },
    actions: [
      { action: 'view', title: 'View Report' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Water Quality Update', options)
  );
});

// ── Notification Click: open/focus app ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('app.generositywater.com') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});

// ── Fetch: network-first with offline fallback ────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
