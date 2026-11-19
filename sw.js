/* Service worker: here only so Chrome on Android installs Shelf as a real app (no "Tap to copy the URL" notice).
   It caches NOTHING: same-origin GET requests go straight to the network, everything else is left to the browser.
   Version bumps in index.html keep working exactly as before. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r));
});
