// Service worker NEXOMIA : application disponible hors connexion, leçons et audios téléchargés.
const SHELL = "nx-shell-v3";
const OFFLINE = "nx-offline-v1";
const SHELL_FILES = ["/", "/manifest.webmanifest", "/icon-192.png"];

self.addEventListener("install", (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("nx-shell") && k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Audios : d'abord le cache (téléchargés), sinon le réseau.
  if (url.pathname.startsWith("/api/audio/")) {
    e.respondWith(caches.open(OFFLINE).then(async (c) => (await c.match(url.pathname)) || fetch(req)));
    return;
  }
  // Leçons : réseau d'abord, copie hors connexion si elle existe.
  if (url.pathname.startsWith("/api/lessons/")) {
    e.respondWith(fetch(req).catch(async () => (await (await caches.open(OFFLINE)).match(url.pathname)) || new Response(JSON.stringify({ error: "Hors connexion : cette leçon n’est pas téléchargée." }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }
  if (url.pathname.startsWith("/api/")) return;
  // Interface : réseau d'abord pour rester à jour, cache en secours.
  e.respondWith(fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(SHELL).then((c) => c.put(req, cp)); } return r; })
    .catch(async () => (await caches.match(req)) || (await caches.match("/"))));
});
