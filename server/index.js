// NEXOMIA Academy — serveur web (Node.js ≥ 22, aucune dépendance externe).
process.removeAllListeners("warning"); // masque l'avertissement « SQLite expérimental »
const http = require("node:http");
const path = require("node:path");
const zlib = require("node:zlib");
const fs = require("node:fs");
const { send, serveFile, HttpError } = require("./http");
const { currentUser } = require("./auth");
const { seedIfEmpty, syncBundledContent } = require("./seed");
const { startReconciliation, providerName } = require("./billing");
const routes = require("./routes");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(__dirname, "..", "public");

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

function baseUrlOf(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}

// Version de déploiement : force les navigateurs à recharger app.js et app.css après chaque mise à jour.
const VERSION = (process.env.RAILWAY_GIT_COMMIT_SHA || String(Date.now())).slice(0, 10);

// Petits fichiers texte compressés à la volée (connexions lentes).
const gzCache = new Map();
function serveStatic(req, res, file) {
  const ext = path.extname(file);
  const accepts = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
  if (accepts && [".js", ".css", ".html", ".webmanifest", ".json"].includes(ext)) {
    let st; try { st = fs.statSync(file); } catch { return false; }
    const key = file + ":" + st.mtimeMs;
    let gz = gzCache.get(key);
    if (!gz) { let buf = fs.readFileSync(file); if (ext === ".html") buf = Buffer.from(buf.toString("utf8").replace(/__VERSION__/g, VERSION)); gz = zlib.gzipSync(buf); gzCache.set(key, gz); }
    const types = { ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".webmanifest": "application/manifest+json", ".json": "application/json" };
    res.writeHead(200, { "Content-Type": types[ext], "Content-Encoding": "gzip", "Vary": "Accept-Encoding", "Cache-Control": ext === ".html" || file.endsWith("sw.js") ? "no-cache" : "public, max-age=31536000, immutable" });
    res.end(gz);
    return true;
  }
  if (path.extname(file) === ".html") { // navigateur sans gzip
    const html = fs.readFileSync(file, "utf8").replace(/__VERSION__/g, VERSION);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }); res.end(html); return true;
  }
  return serveFile(req, res, file, { cache: "public, max-age=86400" });
}

const server = http.createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  const url = new URL(req.url, "http://x");
  const pathname = decodeURIComponent(url.pathname);
  const proto = (req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const ctx = {
    req, res, query: url.searchParams, params: {},
    ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim(),
    secure: proto === "https", baseUrl: baseUrlOf(req),
  };
  if (proto === "http" && process.env.FORCE_HTTPS === "true") { res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` }); return res.end(); }
  try {
    const m = routes.match(req.method === "HEAD" ? "GET" : req.method, pathname);
    if (m) {
      // Protection CSRF : les écritures doivent venir de la même origine (sauf notification du prestataire).
      if (!["GET", "HEAD"].includes(req.method) && !pathname.startsWith("/api/payments/")) {
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host && new URL(origin).host !== (req.headers["x-forwarded-host"] || "")) throw new HttpError(403, "Origine refusée.");
      }
      ctx.params = m.params;
      ctx.user = currentUser(req);
      for (const h of m.handlers) await h(ctx);
      return;
    }
    if (pathname.startsWith("/api/")) throw new HttpError(404, "Route inconnue.");
    if (req.method !== "GET" && req.method !== "HEAD") throw new HttpError(405, "Méthode non autorisée.");
    const file = path.join(PUBLIC, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
    if (file.startsWith(PUBLIC) && pathname !== "/" && serveStatic(req, res, file)) return;
    serveStatic(req, res, path.join(PUBLIC, "index.html"));
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...(e.extra || {}) });
    console.error(e);
    send(res, 500, { error: "Une erreur est survenue de notre côté. Réessaie dans un instant." });
  }
});

const seeded = seedIfEmpty();
const synced = syncBundledContent();
if (synced) console.log(`Cours d'anglais mis à jour : ${synced} leçons`);
startReconciliation();
server.listen(PORT, () => {
  console.log(`NEXOMIA Academy en ligne sur le port ${PORT} · paiements : ${providerName()}${seeded ? " · catalogue de départ créé" : ""}`);
});
