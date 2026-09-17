/* CCNA Forge — SW mínimo: só estáticos. Sem API, Stripe, Auth, JSON de questões. */
const CACHE = "ccna-forge-static-v1";

const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

function shouldBypass(url) {
  const p = url.pathname;
  if (p === "/sw.js") return true;
  if (p.startsWith("/api/")) return true;
  if (p.includes("webhook")) return true;
  if (p.includes("/auth/")) return true;
  return false;
}

function isStaticAsset(url) {
  const p = url.pathname;
  if (p === "/" || p === "/index.html") return true;
  if (p === "/manifest.webmanifest") return true;
  if (p === "/icon-192.png" || p === "/icon-512.png" || p === "/apple-touch-icon.png") {
    return true;
  }
  if (p.startsWith("/_next/static/")) return true;
  return false;
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => undefined))
      );
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url)) return;
  if (!isStaticAsset(url)) return;

  const isHashedOrIcon =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".webmanifest");

  if (isHashedOrIcon) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || caches.match("/");
      })
  );
});
