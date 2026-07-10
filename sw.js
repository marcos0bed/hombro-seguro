const CACHE = "hombro-v78";
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

// Web Push: el servidor (push-timer) avisa al vencer el descanso. El push llega
// sin payload; el mensaje se lee de la cache que dejó la página al programarlo.
self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    let meta = null;
    try {
      const c = await caches.open("fitmet-push");
      const r = await c.match("/push-meta");
      if (r) meta = await r.json();
    } catch (err) {}
    // Sin payload: distinguimos por contexto. Meta de temporizador reciente
    // (±10 min) → aviso de descanso; si no, es el parte del día/semana.
    let body = "☀️ Parte del día listo · Daily brief ready";
    if (meta && meta.endAt) {
      const now = Date.now();
      if (now < meta.endAt - 5000) body = "⏳ +30 s";
      else if (now - meta.endAt < 10 * 60 * 1000) body = meta.msg || "⏱️";
    }
    // etiqueta ÚNICA: en iOS, reutilizar tag reemplaza en silencio (sin sonido).
    // Cerramos las viejas a mano y estrenamos tag para que el aviso suene.
    try {
      const old = await self.registration.getNotifications();
      old.forEach((n) => { if ((n.tag || "").indexOf("fitmet-timer") === 0) n.close(); });
    } catch (err) {}
    await self.registration.showNotification("Fitmet", { body, tag: "fitmet-timer-" + Date.now() });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if ("focus" in c) return c.focus();
    return self.clients.openWindow("./");
  }));
});
