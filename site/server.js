// Site vitrine NEXOMIA (nexomia360.com) : fichiers statiques + formulaire de contact envoyé par Brevo.
// Variables : PORT, BREVO_API_KEY, CONTACT_TO (défaut headoffice@nexomia360.com), MAIL_FROM.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PUB = path.join(__dirname, "public");
const PORT = Number(process.env.PORT) || 8080;
const CONTACT_TO = process.env.CONTACT_TO || "headoffice@nexomia360.com";
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml" };
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Strict-Transport-Security": "max-age=31536000" };

function sender() {
  const raw = process.env.MAIL_FROM || "NEXOMIA <headoffice@nexomia360.com>";
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || "NEXOMIA", email: m[2] } : { name: "NEXOMIA", email: raw.trim() };
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Limite simple : 5 messages par heure et par adresse IP.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

function json(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", ...SEC }); res.end(JSON.stringify(obj)); }

async function contact(req, res) {
  let body = "";
  for await (const chunk of req) { body += chunk; if (body.length > 20000) return json(res, 413, { error: "Message trop long." }); }
  let d; try { d = JSON.parse(body); } catch { return json(res, 400, { error: "Requête invalide." }); }
  if (d.website) return json(res, 200, { ok: true }); // piège à robots
  const name = String(d.name || "").trim().slice(0, 120), email = String(d.email || "").trim().slice(0, 160);
  const phone = String(d.phone || "").trim().slice(0, 40), topic = String(d.topic || "").trim().slice(0, 80), message = String(d.message || "").trim().slice(0, 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: "Indiquez votre nom, une adresse e-mail valide et votre message." });
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (limited(ip)) return json(res, 429, { error: "Trop de messages envoyés. Réessayez dans une heure ou écrivez à " + CONTACT_TO + "." });
  if (!process.env.BREVO_API_KEY) { console.log("contact (e-mail non configuré)", { name, email, topic }); return json(res, 503, { error: "Le formulaire est momentanément indisponible. Écrivez-nous à " + CONTACT_TO + "." }); }
  const html = `<h2 style="font-family:sans-serif">Nouveau message depuis nexomia360.com</h2>
    <p style="font-family:sans-serif"><b>Nom :</b> ${esc(name)}<br><b>E-mail :</b> ${esc(email)}<br><b>Téléphone :</b> ${esc(phone || "—")}<br><b>Sujet :</b> ${esc(topic || "—")}</p>
    <p style="font-family:sans-serif;white-space:pre-wrap">${esc(message)}</p>`;
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ sender: sender(), to: [{ email: CONTACT_TO, name: "NEXOMIA" }], replyTo: { email, name }, subject: `[Site] ${topic || "Contact"} — ${name}`, htmlContent: html, textContent: `${name} <${email}> ${phone}\n${topic}\n\n${message}` }),
    });
    if (!r.ok) { console.error("brevo", r.status, (await r.text()).slice(0, 300)); return json(res, 502, { error: "L'envoi a échoué. Écrivez-nous directement à " + CONTACT_TO + "." }); }
    console.log("contact envoyé", { topic });
    return json(res, 200, { ok: true });
  } catch (e) { console.error("brevo", e.message); return json(res, 502, { error: "L'envoi a échoué. Écrivez-nous directement à " + CONTACT_TO + "." }); }
}

async function handle(req, res) {
  const url = new URL(req.url, "http://x");
  // Adresse unique : si SITE_CANONICAL est défini (ex. www.nexomia360.com), les autres noms y sont redirigés.
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(":")[0].toLowerCase();
  const canon = (process.env.SITE_CANONICAL || "").toLowerCase();
  if (canon && host !== canon && !host.startsWith("localhost")) { res.writeHead(301, { Location: "https://" + canon + req.url }); return res.end(); }
  if (url.pathname === "/api/contact" && req.method === "POST") return contact(req, res);
  if (url.pathname === "/health") return json(res, 200, { ok: true });
  let p = decodeURIComponent(url.pathname);
  if (p === "/" || p === "/en" || p === "/en/") p = "/index.html";
  const file = path.join(PUB, path.normalize(p));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) {
      return fs.readFile(path.join(PUB, "index.html"), (e2, idx) => { res.writeHead(404, { "Content-Type": TYPES[".html"], ...SEC }); res.end(idx); });
    }
    const ext = path.extname(file);
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400", ...SEC });
    res.end(data);
  });
}

module.exports = { handle };
// Lancé seul (node site/server.js) : serveur autonome. Sinon, le serveur de l'Academy appelle handle()
// pour les requêtes adressées à nexomia360.com.
if (require.main === module) {
  http.createServer(handle).listen(PORT, () => console.log(`Site NEXOMIA en ligne sur le port ${PORT} · e-mails : ${process.env.BREVO_API_KEY ? "brevo" : "non configurés"}`));
}
