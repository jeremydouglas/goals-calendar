// Minimal service worker: keeps page installable and responds to basic fetches.
self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// Simple network-first fetch handler for navigation requests.
self.addEventListener('fetch', event => {
  // Let the browser handle non-navigation requests
  if (event.request.mode !== 'navigate') return

  event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')))
})
