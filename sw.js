const CACHE = "hombro-v59";
const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg", CDN];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const sameOrigin = e.request.url.startsWith(self.location.origin);
  const cdn = e.request.url.startsWith("https://cdn.jsdelivr.net/");
  // Las llamadas a la API (supabase.co) van siempre por red, sin caché.
  if (e.request.method !== "GET" || (!sameOrigin && !cdn)) return;

  // Página: RED PRIMERO — con conexión, la última versión llega a la primera
  // apertura; sin red, se sirve la copia cacheada (offline intacto).
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Resto de recursos: caché primero (rápido y offline).
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
            return res;
          })
          .catch(() => (sameOrigin ? caches.match("./index.html") : undefined))
    )
  );
});
