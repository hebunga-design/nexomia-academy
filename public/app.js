/* NEXOMIA Academy — interface web (sans framework). */
(() => {
"use strict";

/* ================= Utilitaires ================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtD = (iso) => iso ? new Date(iso.replace(" ", "T") + (iso.length <= 19 ? "Z" : "")).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
const money = (n) => `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 })} $`;
const store = { get(k, d) { try { const v = localStorage.getItem("nx_" + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem("nx_" + k, JSON.stringify(v)); } catch {} } };

class ApiError extends Error { constructor(status, data) { super(data && data.error || "Erreur réseau"); this.status = status; this.data = data; } }
async function api(path, { method = "GET", body, raw, type } = {}) {
  const opts = { method, headers: {}, credentials: "same-origin" };
  if (raw) { opts.body = raw; opts.headers["Content-Type"] = type; }
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers["Content-Type"] = "application/json"; }
  let res;
  try { res = await fetch(path, opts); } catch { throw new ApiError(0, { error: "Pas de connexion. Vérifie ton réseau et réessaie." }); }
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) throw new ApiError(res.status, data || {});
  return data;
}
function toast(t, bad) { const d = document.createElement("div"); d.className = "toast"; d.setAttribute("role", "status"); if (bad) d.style.background = "var(--bad)"; d.textContent = t; $("#layer").appendChild(d); setTimeout(() => d.remove(), 3200); }

const I = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>',
  spk: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
  loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  cat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
  me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  studio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  pass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>',
  admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  dl: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};
const wave = (n) => Array.from({ length: n }, (_, i) => `<i style="--h:${30 + ((i * 37) % 70)}%;animation-delay:${(i % 7) * 0.09}s"></i>`).join("");
const motif = (w = 64) => `<div class="motif" style="width:${w}px" aria-hidden="true"><span class="m1"></span><span class="m2"></span><span class="m2"></span><span class="q"><span class="m1"></span><span class="m3"></span><span class="m3"></span><span class="m4"></span></span></div>`;
const RANK = { learner: 0, mentor: 1, coach: 2, creator: 3, reviewer: 4, admin: 5 };
const ROLE_FR = { learner: "Apprenant", mentor: "Mentor", coach: "Accompagnateur", creator: "Créateur de cours", reviewer: "Responsable pédagogique", admin: "Administrateur" };
const can = (role) => S.me && RANK[S.me.role] >= RANK[role];

/* ================= État ================= */
const S = { me: null, payments: "test", methods: ["mpesa", "airtel", "orange", "card"], catalog: null, pricing: null, filter: "Tous", cart: store.get("cart", []), payMethod: "mpesa" };
const priceFor = (n, p = S.pricing) => { if (!p || n <= 0) return 0; const t = p.tiers; return n <= t.length ? t[n - 1] : t[t.length - 1] + (n - t.length) * p.extra; };

/* ================= Voix (synthèse de l'appareil, en secours) ================= */
const Speech = {
  ok: "speechSynthesis" in window, voices: [],
  load() { if (this.ok) this.voices = speechSynthesis.getVoices(); },
  pick(lang) {
    const L = lang.toLowerCase(), b = L.slice(0, 2), n = (x) => x.lang.replace("_", "-").toLowerCase();
    return this.voices.find((x) => n(x) === L && /natural|neural|google|premium|enhanced/i.test(x.name)) || this.voices.find((x) => n(x) === L) || this.voices.find((x) => n(x).startsWith(b)) || null;
  },
  speak(text, lang, rate = 1) {
    return new Promise((res) => {
      if (!this.ok) { setTimeout(res, 1000); return; }
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate; const v = this.pick(lang); if (v) u.voice = v;
      let done = false; const fin = () => { if (!done) { done = true; clearTimeout(t); res(); } };
      const t = setTimeout(fin, (text.split(/\s+/).length * 650) / rate + 3000);
      u.onend = fin; u.onerror = fin; speechSynthesis.speak(u);
    });
  },
  stop() { if (this.ok) speechSynthesis.cancel(); },
};
if (Speech.ok) { Speech.load(); speechSynthesis.onvoiceschanged = () => Speech.load(); }

/* ================= Lecteur audio ================= */
const audio = new Audio(); audio.preload = "auto";
let stopCurrent = null;
function playSentence(s, lang, rate) {
  if (s.audio) {
    return new Promise((res) => {
      const fin = () => { audio.onended = audio.onerror = null; stopCurrent = null; res(); };
      stopCurrent = () => { audio.pause(); fin(); };
      audio.onended = fin; audio.onerror = () => { Speech.speak(s.text, lang, rate).then(fin); };
      audio.src = s.audio; audio.playbackRate = rate; audio.preservesPitch = true;
      audio.play().catch(() => Speech.speak(s.text, lang, rate).then(fin));
    });
  }
  stopCurrent = () => Speech.stop();
  return Speech.speak(s.text, lang, rate).then(() => { stopCurrent = null; });
}
function stopAudio() { if (stopCurrent) stopCurrent(); Speech.stop(); audio.pause(); }

const P = { data: null, idx: 0, playing: false, rate: store.get("rate", 1), mode: "continu", loop: false, repeat: false, showTr: true, run: 0, listened: 0 };
setInterval(flushListening, 30000);
function flushListening() { const s = Math.round(P.listened); if (s >= 5 && S.me) { P.listened = 0; api("/api/listening", { method: "POST", body: { seconds: s } }).catch(() => {}); } }
window.addEventListener("pagehide", flushListening);

async function playFrom(i) {
  const d = P.data; if (!d) return;
  const sents = d.lesson.sentences; const my = ++P.run;
  stopAudio(); P.playing = true; P.idx = i; paintPlayer();
  while (P.run === my && P.idx < sents.length) {
    paintPlayer(); mediaSession();
    const t0 = Date.now();
    await playSentence(sents[P.idx], d.course.lang, P.rate);
    if (P.run !== my) return;
    P.listened += (Date.now() - t0) / 1000;
    if (P.repeat) { await sleep(Math.min(7000, Math.max(1200, (Date.now() - t0) * 1.1))); if (P.run !== my) return; } else await sleep(300);
    if (P.loop) continue;
    if (P.mode === "phrase") { P.idx = Math.min(P.idx + 1, sents.length - 1); P.playing = false; paintPlayer(); return; }
    P.idx++;
  }
  if (P.run === my) { P.playing = false; if (P.idx >= sents.length) P.idx = sents.length - 1; paintPlayer(); }
}
function stopPlay() { P.run++; P.playing = false; stopAudio(); paintPlayer(); }
function togglePlay() { P.playing ? stopPlay() : playFrom(P.idx); }
function mediaSession() {
  if (!("mediaSession" in navigator) || !P.data) return;
  const s = P.data.lesson.sentences[P.idx];
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: s.text, artist: `${P.data.course.title} · ${P.data.lesson.title}`, album: "NEXOMIA Academy", artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }] });
    navigator.mediaSession.setActionHandler("play", () => playFrom(P.idx));
    navigator.mediaSession.setActionHandler("pause", stopPlay);
    navigator.mediaSession.setActionHandler("previoustrack", () => playFrom(Math.max(0, P.idx - 1)));
    navigator.mediaSession.setActionHandler("nexttrack", () => playFrom(Math.min(P.data.lesson.sentences.length - 1, P.idx + 1)));
  } catch {}
}
function paintPlayer() {
  const el = $("#player"); const d = P.data;
  if (el && d) {
    const sents = d.lesson.sentences, s = sents[P.idx];
    el.className = "player" + (P.playing ? " playing" : "");
    el.innerHTML = `<div class="top-row">
      <button class="play" data-pp aria-label="${P.playing ? "Pause" : "Écouter"}">${P.playing ? I.pause : I.play}</button>
      <div class="now"><small>Phrase ${P.idx + 1} sur ${sents.length}${s.audio ? " · voix enregistrée" : ""}</small>${esc(s.text)}</div></div>
      <div class="wave" style="height:28px;margin-top:12px" aria-hidden="true">${wave(48)}</div>
      <div class="prog">${sents.map((_, i) => `<i data-seek="${i}" class="${i < P.idx ? "done" : i === P.idx ? "cur" : ""}" title="Phrase ${i + 1}"></i>`).join("")}</div>
      <div class="ctrls">
        <button class="pbtn" data-step="-1" aria-label="Phrase précédente">${I.prev}</button>
        <button class="pbtn" data-step="1" aria-label="Phrase suivante">${I.next}</button>
        <div class="speed" role="group" aria-label="Vitesse">${[0.5, 0.75, 1, 1.25, 1.5].map((r) => `<button data-rate="${r}" aria-pressed="${P.rate === r}">${String(r).replace(".", ",")}×</button>`).join("")}</div>
        <button class="pbtn" data-toggle="mode" aria-pressed="${P.mode === "phrase"}">Phrase par phrase</button>
        <button class="pbtn" data-toggle="repeat" aria-pressed="${P.repeat}">Écoute-répète</button>
        <button class="pbtn" data-toggle="loop" aria-pressed="${P.loop}">${I.loop} Boucle</button>
        <button class="pbtn" data-toggle="tr" aria-pressed="${P.showTr}">Traduction</button>
      </div>`;
    document.querySelectorAll(".sent").forEach((b) => b.classList.toggle("active", +b.dataset.sent === P.idx));
  }
  const mini = $("#mini");
  if (d && P.playing && !location.hash.startsWith("#/lecon/")) {
    mini.innerHTML = `<div class="mini-player playing"><button class="play" data-pp aria-label="Pause">${I.pause}</button><span class="txt">${esc(d.lesson.sentences[P.idx].text)}</span><a class="pbtn" href="#/lecon/${d.lesson.id}" style="text-decoration:none">Ouvrir</a></div>`;
  } else mini.innerHTML = "";
}

/* ================= Navigation ================= */
function tabs() {
  const t = [["#/", "Accueil", "home"], ["#/cours", "Cours", "cat"]];
  if (S.me) t.push(["#/parcours", "Mon parcours", "me"]);
  t.push(["#/abonnements", "Abonnements", "pass"]);
  if (can("creator")) t.push(["#/studio", "Studio", "studio"]);
  if (can("admin")) t.push(["#/admin", "Admin", "admin"]);
  return t;
}
function paintNav() {
  const h = location.hash || "#/";
  const cur = (href) => href === "#/" ? h === "#/" || h === "" : h.startsWith(href) || (href === "#/cours" && h.startsWith("#/lecon"));
  $("#nav").innerHTML = tabs().map(([href, l]) => `<a href="${href}" ${cur(href) ? 'aria-current="page"' : ""}>${l}</a>`).join("");
  const SHORT = { "Mon parcours": "Parcours", "Abonnements": "Abonner" };
  $("#tabbar").innerHTML = tabs().map(([href, l, i]) => `<a href="${href}" ${cur(href) ? 'aria-current="page"' : ""} aria-label="${l}">${I[i]}<span>${SHORT[l] || l}</span></a>`).join("");
  $("#topActions").innerHTML = (S.me
    ? `<a class="user-chip" href="#/parcours" style="text-decoration:none;color:inherit"><span class="av">${esc(S.me.name[0].toUpperCase())}</span><span class="n">${esc(S.me.name.split(" ")[0])}</span></a><button class="iconbtn" data-logout aria-label="Se déconnecter" title="Se déconnecter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg></button>`
    : `<a class="btn btn-ghost btn-sm" href="#/connexion">Se connecter</a>`) + `<button class="iconbtn" data-theme aria-label="Changer de thème">${I.sun}</button>`;
}

const routes = [
  [/^#?\/?$/, vHome], [/^#\/cours$/, vCatalog], [/^#\/cours\/([\w-]+)$/, vCourse], [/^#\/lecon\/(\d+)$/, vLesson],
  [/^#\/parcours$/, vDash, "auth"], [/^#\/abonnements$/, vSubs], [/^#\/connexion$/, vLogin], [/^#\/inscription$/, vRegister],
  [/^#\/reinitialiser\/([\w-]+)$/, vReset], [/^#\/recuperation$/, vRecover], [/^#\/studio$/, vStudio, "creator"], [/^#\/studio\/(\d+)$/, vStudioCourse, "creator"],
  [/^#\/admin$/, vAdmin, "admin"],
  [/^#\/test-niveau\/([\w-]+)$/, vPlacement], [/^#\/bienvenue$/, vWelcome, "auth"], [/^#\/certificat\/([\w-]+)$/, vCertificate], [/^#\/revision$/, vReview, "auth"],
];
function parseHash() { const h = location.hash || "#/"; const [p, q] = h.split("?"); return { path: p, query: new URLSearchParams(q || "") }; }
let renderId = 0;
async function render() {
  const my = ++renderId;
  const { path, query } = parseHash();
  if (!path.startsWith("#/lecon/") && P.data && !P.playing) P.data = null;
  paintNav(); paintPlayer();
  const app = $("#app");
  const r = routes.find(([re]) => re.test(path));
  if (!r) { app.innerHTML = `<div class="empty"><h2>Page introuvable</h2><p style="margin-top:8px"><a href="#/">Retour à l’accueil</a></p></div>`; return; }
  if (r[2] && !S.me) { location.hash = `#/connexion?next=${encodeURIComponent(path)}`; return; }
  if (r[2] && r[2] !== "auth" && !can(r[2])) { app.innerHTML = `<div class="empty">Tu n’as pas accès à cet espace.</div>`; return; }
  app.innerHTML = `<div class="skeleton" aria-busy="true"></div>`;
  try {
    const html = await r[1](...path.match(r[0]).slice(1), query);
    if (my !== renderId) return;
    if (typeof html === "string") app.innerHTML = html + footer();
    paintPlayer();
    window.scrollTo(0, 0);
  } catch (e) {
    if (my !== renderId) return;
    app.innerHTML = `<div class="empty"><p><b>${esc(e.message)}</b></p><p style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-reload>Réessayer</button></p></div>`;
  }
}
const footer = () => `<footer><div class="wrap" style="padding:0"><span><b style="color:var(--ink)">NEXOMIA</b> · Former · Créer · Transformer · Lubumbashi, RDC</span><span>Paiements : M-Pesa · Airtel Money · Orange Money${S.methods.includes("card") ? " · Carte" : ""}</span></div></footer>`;

async function loadCatalog(force) { if (!S.catalog || force) { const d = await api("/api/catalog"); S.catalog = d.courses; S.pricing = d.pricing; } return S.catalog; }

/* ================= Vues publiques ================= */
const HERO = {
  en: { lang: "en-GB", s: [["Hello! My name is Amani.", "Bonjour ! Je m’appelle Amani."], ["Hi Amani, I’m Grace. Nice to meet you.", "Salut Amani, moi c’est Grace. Enchantée."], ["I’m from Lubumbashi. And you?", "Je viens de Lubumbashi. Et toi ?"]] },
  pt: { lang: "pt-BR", s: [["Olá! Eu me chamo Amani.", "Bonjour ! Je m’appelle Amani."], ["Prazer, eu sou a Grace.", "Enchantée, je suis Grace."], ["Eu sou de Lubumbashi, na RDC.", "Je suis de Lubumbashi, en RDC."]] },
};
let heroLang = "en", heroRun = 0;
function courseCard(c) {
  return `<a class="course" href="#/cours/${esc(c.slug)}" style="text-decoration:none;color:inherit">
    <div class="cover" style="background:${esc(c.color)}"><span class="code">${esc(c.code)}</span><span class="big">${esc(c.big)}</span></div>
    <div class="meta"><span class="tag">${esc(c.domain)}</span></div>
    <h3>${esc(c.title)}</h3>
    <p class="muted" style="font-size:15px">${esc(c.description)}</p>
    <div class="meta" style="margin-top:auto"><span>${esc(c.level)}</span><span>· ${c.lessons} leçon${c.lessons > 1 ? "s" : ""} audio</span>${c.completed ? `<span>· ${c.completed}/${c.lessons} terminée${c.completed > 1 ? "s" : ""}</span>` : ""}</div>
    <div class="meta" style="justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:10px">${c.subscribed_until ? `<span class="tag subbed">Abonné · jusqu’au ${fmtD(c.subscribed_until)}</span>` : `<span class="pricetag">${money(S.pricing.tiers[0])} / mois</span><span>1re leçon gratuite</span>`}</div>
  </a>`;
}
function priceBlock() {
  const p = S.pricing; const ex = [1, 2, 3].map((n) => [n, priceFor(n)]);
  return `<div class="price">
    <div><p class="eyebrow">Tarif</p>
      <p class="amount" style="margin-top:10px">${money(p.tiers[0])} <small>par cours · par mois</small></p>
      <p class="muted" style="margin-top:10px;max-width:42ch">Tu paies uniquement les cours que tu suis, et c’est moins cher quand tu en prends plusieurs ensemble. La première leçon de chaque cours est gratuite.</p>
      <div class="examples">${ex.map(([n, t]) => `<div><span>${n} cours${n > 1 ? ` · soit ${money(t / n)} par cours` : ""}</span><b>${money(t)} / mois</b></div>`).join("")}</div>
      <div class="pay"><span class="chip">M-Pesa</span><span class="chip">Airtel Money</span><span class="chip">Orange Money</span>${S.methods.includes("card") ? `<span class="chip">Visa · Mastercard</span>` : ""}</div></div>
    <div><ul class="ticks"><li>Tous les niveaux et toutes les leçons du cours choisi</li><li>Audios téléchargeables pour écouter sans données</li><li>Exercices corrigés et révisions</li><li>Accompagnement par l’équipe NEXOMIA et groupes de pratique</li><li>Sans engagement : tu renouvelles quand tu veux</li></ul>
      <a class="btn btn-primary" style="margin-top:20px;width:100%" href="#/abonnements">Choisir mes cours</a></div>
  </div>`;
}
async function vHome() {
  const courses = await loadCatalog();
  const h = HERO[heroLang];
  return `<section class="hero"><div>
      <p class="eyebrow">NEXOMIA Academy · Lubumbashi</p>
      <h1 style="margin-top:12px">Apprends.<br>Produis.<br><em>Transmets.</em></h1>
      <p class="lede">Des cours de langues et de compétences qui mènent à un vrai revenu. Tu écoutes de vraies voix, tu pratiques chaque jour et tu avances avec une équipe à tes côtés.</p>
      <div class="cta">${S.me ? `<a class="btn btn-primary" href="#/parcours">Continuer mon parcours</a>` : `<a class="btn btn-primary" href="#/inscription">Créer mon compte gratuit</a>`}<a class="btn btn-ghost" href="#/cours">Voir les cours</a></div></div>
    <div class="hero-card" id="heroCard">
      <div class="motif" aria-hidden="true"><span class="m1"></span><span class="m2" style="background:#fff"></span><span class="m2" style="background:#fff"></span><span class="q"><span class="m1"></span><span class="m3"></span><span class="m3"></span><span class="m4"></span></span></div>
      <p class="eyebrow">Écoute ta première phrase</p>
      <p class="line" id="heroLine">${esc(h.s[0][0])}</p><p class="tr" id="heroTr">${esc(h.s[0][1])}</p>
      <div class="row"><button class="play" id="heroPlay" aria-label="Écouter">${I.play}</button><div class="wave" aria-hidden="true">${wave(34)}</div></div>
      <div class="langs" role="group" aria-label="Langue"><button class="chip" data-hl="en" aria-pressed="${heroLang === "en"}">Anglais</button><button class="chip" data-hl="pt" aria-pressed="${heroLang === "pt"}">Portugais</button></div>
    </div></section>
  <section class="sec"><div class="sec-h"><div><p class="eyebrow">Le cycle NEXOMIA</p><h2>Ton parcours ne s’arrête pas à la dernière leçon</h2></div></div>
    <div class="cycle"><div class="c1"><b>Apprendre</b><small>Cours, audios et exercices adaptés à ton niveau</small></div><div class="c2"><b>Pratiquer</b><small>Projets réels, corrigés par un formateur</small></div><div class="c3"><b>Produire</b><small>Tes premiers clients, tes premiers revenus</small></div><div class="c4"><b>Transmettre</b><small>Deviens mentor et forme à ton tour</small></div></div></section>
  <section class="sec"><div class="sec-h"><div><p class="eyebrow">Catalogue</p><h2>Les compétences qui ouvrent des portes</h2></div><a class="btn btn-ghost btn-sm" href="#/cours">Voir tous les cours</a></div>
    <div class="grid">${courses.slice(0, 3).map(courseCard).join("")}</div></section>
  <section class="sec">${priceBlock()}</section>`;
}
async function heroPlay() {
  const card = $("#heroCard"); if (!card) return;
  if (card.classList.contains("playing")) { heroRun++; Speech.stop(); card.classList.remove("playing"); $("#heroPlay").innerHTML = I.play; return; }
  const my = ++heroRun, h = HERO[heroLang];
  card.classList.add("playing"); $("#heroPlay").innerHTML = I.pause;
  for (let i = 0; i < h.s.length && heroRun === my; i++) {
    if (!$("#heroLine")) return;
    $("#heroLine").textContent = h.s[i][0]; $("#heroTr").textContent = h.s[i][1];
    await Speech.speak(h.s[i][0], h.lang, 0.95); await sleep(300);
  }
  if (heroRun === my && $("#heroCard")) { $("#heroCard").classList.remove("playing"); $("#heroPlay").innerHTML = I.play; }
}

async function vCatalog() {
  const courses = await loadCatalog(true);
  const fs = ["Tous", ...new Set(courses.map((c) => c.domain))];
  const list = courses.filter((c) => S.filter === "Tous" || c.domain === S.filter);
  return `<div class="sec-h"><div><p class="eyebrow">${courses.length} cours publiés</p><h2 style="font-size:clamp(30px,4vw,44px)">Choisis ton prochain cours</h2></div></div>
    <div class="filters" role="group" aria-label="Domaines">${fs.map((f) => `<button class="chip" data-filter="${esc(f)}" aria-pressed="${S.filter === f}">${esc(f)}</button>`).join("")}</div>
    ${list.length ? `<div class="grid">${list.map(courseCard).join("")}</div>` : `<div class="empty">Aucun cours dans ce domaine pour l’instant.</div>`}`;
}

function groupByModule(lessons) {
  const out = [];
  for (const l of lessons) { const m = l.module || ""; const last = out[out.length - 1]; if (last && last[0] === m) last[1].push(l); else out.push([m, [l]]); }
  return out;
}
function modulesNav(lessons) {
  const g = groupByModule(lessons); if (g.length < 2) return "";
  return `<nav class="modnav" aria-label="Niveaux">${g.map(([m], i) => `<button type="button" class="chip" data-jump="mod-${i}">${esc(m.split("·")[0].trim() || m)}</button>`).join("")}</nav>`;
}
// Mise en forme simple et sûre des explications : **gras**, listes « - », paragraphes.
function richNotes(t) {
  const lines = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split("\n");
  let html = "", list = false;
  for (const ln of lines) {
    const m = ln.match(/^\s*[-•]\s+(.*)$/);
    if (m) { if (!list) { html += "<ul>"; list = true; } html += `<li>${m[1]}</li>`; continue; }
    if (list) { html += "</ul>"; list = false; }
    if (ln.trim()) html += `<p>${ln}</p>`;
  }
  return html + (list ? "</ul>" : "");
}
async function vCourse(slug) {
  await loadCatalog();
  const { course: c, lessons, certificates = [], placement_test } = await api(`/api/courses/${encodeURIComponent(slug)}`);
  const certOf = (m) => certificates.find((x) => x.module === m);
  const myLevel = S.me && S.me.placement && S.me.placement[slug];
  const sub = c.subscribed_until;
  return `<a class="back" href="#/cours">${I.back} Tous les cours</a>
  <div class="course-hero" style="background:${esc(c.color)}"><div><p class="eyebrow" style="color:#fff;opacity:.8">${esc(c.domain)} · ${esc(c.code)}</p><h1 style="margin:8px 0">${esc(c.title)}</h1><p>${esc(c.level)} · ${lessons.length} leçon${lessons.length > 1 ? "s" : ""}</p></div><span class="big" aria-hidden="true">${esc(c.big)}</span></div>
  ${c.status !== "published" ? `<div class="review-note">Aperçu équipe : ce cours n’est pas encore publié.</div>` : ""}
  <div class="dash">
    <div style="min-width:0">${placement_test ? `<div class="ptbanner">${myLevel ? `<span>Ton niveau : <b>${esc(myLevel.level)} · ${esc(LEVEL_FR[myLevel.level] || "")}</b></span><a class="btn btn-ghost btn-sm" href="#/test-niveau/${esc(slug)}">Refaire le test</a>` : `<span><b>Pas sûr de ton niveau ?</b><br><small class="muted">10 minutes pour savoir où commencer, de A1 à C2.</small></span><a class="btn btn-primary btn-sm" href="#/test-niveau/${esc(slug)}">Passer le test</a>`}</div>` : ""}${modulesNav(lessons)}${groupByModule(lessons).map(([mod, ls], gi) => `<section class="modsec" id="mod-${gi}">
      ${mod ? `<div class="modhead"><h2>${esc(mod)}</h2><span class="muted">${ls.filter((l) => l.completed).length}/${ls.length} leçon${ls.length > 1 ? "s" : ""}</span></div>
      ${certOf(mod) ? `<a class="certitem" style="margin-bottom:10px" href="#/certificat/${esc(certOf(mod).code)}"><span class="cert-lv">${esc(mod.split("·")[0].trim())}</span><span><b>Niveau validé</b><br><small class="muted">Voir et télécharger mon certificat</small></span></a>` : ""}` : ""}
      <div class="llist">${ls.map((l) => `<a class="lrow ${l.completed ? "done" : ""} ${l.locked ? "locked" : ""}" href="#/lecon/${l.id}" style="text-decoration:none;color:inherit">
      <span class="num">${l.completed ? "✓" : l.position}</span><span style="min-width:0"><b>${esc(l.title)}</b><br><span class="st">${l.duration_min} min${l.position === 1 && !sub ? " · gratuite" : ""}${l.score !== null && l.score !== undefined ? ` · meilleur score ${l.score} %` : ""}</span></span>
      <span class="st">${l.locked ? "Abonnement" : l.completed ? "Terminée" : "Écouter"}</span></a>`).join("")}</div></section>`).join("")}</div>
    <div class="card" style="align-self:start"><p class="muted">${esc(c.description)}</p>
      ${sub ? `<p style="margin-top:14px"><span class="tag subbed">Abonné jusqu’au ${fmtD(sub)}</span></p><a class="btn btn-ghost btn-sm" style="margin-top:12px" data-subscribe="${c.id}" href="#/abonnements">Prolonger d’un mois</a>`
      : `<p class="amount" style="font-family:var(--f-display);font-size:40px;font-weight:800;margin-top:16px">${money(S.pricing.tiers[0])} <small class="muted" style="font-size:15px;font-weight:500">par mois</small></p><button class="btn btn-primary" style="width:100%;margin-top:12px" data-subscribe="${c.id}">S’abonner à ce cours</button><p class="muted" style="font-size:13px;margin-top:10px">La première leçon est gratuite. Prix réduit si tu prends plusieurs cours ensemble.</p>`}
    </div></div>`;
}

/* ================= Leçon ================= */
async function vLesson(id) {
  let d;
  try { d = await api(`/api/lessons/${id}`); }
  catch (e) {
    if (e.status === 402) {
      stopPlay(); const x = e.data;
      return `<a class="back" href="#/cours/${esc(x.course.slug)}">${I.back} ${esc(x.course.title)}</a>
      <div class="lesson-head"><p class="eyebrow">${esc(x.course.code)} · Leçon ${x.position} sur ${x.lessons.length}</p><h1>${esc(x.lesson.title)}</h1></div>
      <div class="lock" style="max-width:620px">${motif()}
        <h2 style="font-size:28px">Continue ton cours de ${esc(x.course.title.toLowerCase())}</h2>
        <p class="muted" style="margin:10px auto 0;max-width:44ch">Abonne-toi à ce cours pour débloquer toutes les leçons, les audios hors connexion et l’accompagnement.</p>
        <p class="amount" style="font-family:var(--f-display);font-size:44px;font-weight:800;margin-top:18px">${money((S.pricing || { tiers: [5] }).tiers[0])} <small class="muted" style="font-size:16px;font-weight:500">par mois pour ce cours</small></p>
        <button class="btn btn-primary" style="margin-top:16px" data-subscribe="${x.course.id}">S’abonner à ${esc(x.course.title)}</button>
        ${S.me ? "" : `<p class="muted" style="margin-top:12px;font-size:14px">Déjà abonné ? <a href="#/connexion?next=${encodeURIComponent("#/lecon/" + id)}">Connecte-toi</a></p>`}</div>`;
    }
    throw e;
  }
  if (!P.data || P.data.lesson.id !== d.lesson.id) { stopPlay(); P.idx = Math.min(d.progress ? d.progress.last_sentence : 0, d.lesson.sentences.length - 1); }
  P.data = d;
  const l = d.lesson, c = d.course;
  const next = d.lessons.find((x) => x.position === l.position + 1);
  const voiceMissing = l.sentences.some((s) => !s.audio) && Speech.ok && Speech.voices.length && !Speech.pick(c.lang);
  Q.items = buildExercises(l, c.lang); Q.state = newQuizState();
  if (SP.lesson !== l.id) Object.assign(SP, { lesson: l.id, i: 0, result: null, good: new Set(), sent: false, listening: false });
  const audioCount = l.sentences.filter((s) => s.audio).length;
  return `<a class="back" href="#/cours/${esc(c.slug)}">${I.back} ${esc(c.title)}</a>
  <div class="lesson"><div style="min-width:0">
    <div class="lesson-head"><p class="eyebrow">${l.module ? esc(l.module) + " · " : esc(c.code) + " · "}Leçon ${l.position} sur ${d.lessons.length} · ${l.duration_min} min</p><h1>${esc(l.title)}</h1>
      <p class="muted">Écoute chaque phrase, répète-la à voix haute, puis vérifie que tu as compris.</p>
      <p style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        ${d.subscribed_until ? `<span class="tag subbed">Abonné jusqu’au ${fmtD(d.subscribed_until)}</span>` : l.position === 1 ? `<span class="tag">Leçon d’essai gratuite</span><button class="btn btn-ghost btn-sm" data-subscribe="${c.id}">S’abonner · ${money((S.pricing || { tiers: [5] }).tiers[0])} / mois</button>` : ""}
        ${audioCount && "caches" in window ? `<button class="btn btn-ghost btn-sm" data-offline="${l.id}">${I.dl} Télécharger pour écouter hors connexion</button>` : ""}
      </p></div>
    ${l.notes ? `<div class="notes-card"><p class="eyebrow">À retenir</p>${richNotes(l.notes)}</div>` : ""}
    <div class="player" id="player"></div>
    ${voiceMissing ? `<p class="note">Cet appareil n’a pas de voix pour cette langue. Les phrases sans enregistrement seront lues dès qu’une voix sera disponible, ou quand l’équipe aura ajouté l’audio.</p>` : ""}
    <div class="transcript ${P.showTr ? "" : "hide-tr"}" id="transcript">${l.sentences.map((s, i) => `<button class="sent" data-sent="${i}"><span class="who ${s.speaker === "B" ? "b" : ""}">${s.speaker === "N" ? "♪" : esc(s.speaker)}</span><span style="min-width:0"><span class="t">${esc(s.text)}</span>${s.translation ? `<span class="tr" style="display:block">${esc(s.translation)}</span>` : ""}</span><span class="mini" aria-hidden="true">${I.spk}</span></button>`).join("")}</div>
    ${/^fr/i.test(c.lang) ? "" : `<div class="card speak" id="speak">${speakHTML()}</div>`}
  </div>
  <aside class="side">
    ${l.vocab.length ? `<div class="card"><h3 style="font-size:18px">Vocabulaire</h3><div class="vocab" style="margin-top:12px">${l.vocab.map((v) => `<button data-say="${esc(v.term)}"><span><b>${esc(v.term)}</b><br><small>${esc(v.meaning)}</small></span>${I.spk}</button>`).join("")}</div></div>` : ""}
    <div class="card quiz" id="quiz">${quizHTML()}</div>
    ${next ? `<a class="btn btn-ghost" href="#/lecon/${next.id}">Leçon suivante : ${esc(next.title)}</a>` : ""}
  </aside></div>`;
}
/* ================= Exercices ================= */
// Les exercices d'écoute rédigés pour la leçon, complétés par des exercices générés
// à partir du dialogue : mots dans l'ordre, phrase à compléter, dictée.
const Q = { state: null, items: [] };
const norm = (t) => String(t).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, " ").replace(/\s+/g, " ").trim();
function seeded(seed) { let x = seed % 2147483647 || 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
function shuffleWith(a, rnd) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
const clean = (w) => w.replace(/[^\p{L}’']/gu, "");
function buildExercises(lesson, lang) {
  const items = lesson.questions.map((q) => ({ type: "listen", ...q }));
  if (/^fr/i.test(lang)) return items;
  const rnd = seeded(lesson.id * 7919 + 13);
  const words = (t) => t.split(/\s+/).filter(Boolean);
  const pool = lesson.sentences.filter((x) => x.translation && words(x.text).length >= 3);
  const used = new Set();
  const pick = (ok) => { const c = shuffleWith(pool.filter((x) => !used.has(x.text) && ok(x)), rnd)[0]; if (c) used.add(c.text); return c; };
  // 1. Remettre les mots dans l'ordre
  const o = pick((x) => { const n = words(x.text).length; return n >= 4 && n <= 10; });
  if (o) {
    const toks = words(o.text).map((w) => w.replace(/[.,!?;:…]+$/, "")); let tiles = shuffleWith(toks.map((w, i) => ({ w, i })), rnd);
    if (tiles.every((t, k) => t.i === k)) tiles = tiles.slice(1).concat(tiles[0]);
    items.push({ type: "order", text: o.text, tr: o.translation, tiles });
  }
  // 2. Compléter la phrase
  const allWords = [...new Set(lesson.sentences.flatMap((x) => words(x.text)).map(clean).filter((w) => w.length >= 3))];
  const g = pick((x) => words(x.text).some((w) => clean(w).length >= 4));
  if (g) {
    const cands = words(g.text).map((w, i) => ({ w: clean(w), i })).filter((x) => x.w.length >= 4).sort((a, b) => b.w.length - a.w.length);
    const target = cands[Math.floor(rnd() * Math.min(2, cands.length))];
    const wrong = shuffleWith(allWords.filter((w) => w.toLowerCase() !== target.w.toLowerCase() && Math.abs(w.length - target.w.length) <= 4), rnd).slice(0, 2);
    if (wrong.length === 2) {
      const options = shuffleWith([target.w, ...wrong], rnd);
      const shown = words(g.text).map((w, i) => i === target.i ? w.replace(target.w, "_____") : w).join(" ");
      items.push({ type: "gap", say: g.text, shown, tr: g.translation, options, answer: options.indexOf(target.w) });
    }
  }
  // 3. Dictée
  const dct = pick((x) => words(x.text).length <= 9);
  if (dct) items.push({ type: "dict", say: dct.text, text: dct.text, tr: dct.translation });
  return items;
}
// Compare la dictée mot à mot (distance d'édition) : tolère une petite faute.
function dictScore(typed, ref) {
  const a = norm(typed).split(" ").filter(Boolean), b = norm(ref).split(" ").filter(Boolean);
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return b.length ? Math.max(0, 1 - d[a.length][b.length] / b.length) : 0;
}
const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const TYPE_LABEL = { listen: "Écoute", order: "Mots dans l’ordre", gap: "Phrase à compléter", dict: "Dictée" };
function quizHTML() {
  const items = Q.items, st = Q.state;
  if (!items.length) return `<p class="eyebrow">Fin de leçon</p><h3 style="font-size:18px;margin:8px 0 12px">As-tu tout écouté ?</h3><button class="btn btn-primary" style="width:100%" data-finish>Terminer la leçon</button>`;
  const q = items[st.i], done = st.result !== null;
  const head = `<div class="qhead"><p class="eyebrow">${TYPE_LABEL[q.type]} · ${st.i + 1}/${items.length}</p><div class="qdots" aria-hidden="true">${items.map((_, k) => `<i class="${k < st.i || (k === st.i && done) ? (st.marks[k] ? "ok" : "ko") : k === st.i ? "cur" : ""}"></i>`).join("")}</div></div>`;
  const nextBtn = done ? `<div class="feedback ${st.result ? "good" : "bad"}" role="status"><b>${st.result ? ["Bien joué !", "Excellent !", "Parfait !", "Bien entendu !"][st.i % 4] : "Pas tout à fait."}</b> ${st.fb || ""}</div>
    <button class="btn btn-primary" style="width:100%;margin-top:12px" data-qnext>${st.i + 1 < items.length ? "Continuer" : "Voir mon résultat"}</button>` : "";
  if (q.type === "listen" || q.type === "gap") {
    const title = q.type === "gap" ? `<h3 class="qtitle">Complète la phrase</h3><p class="gap-line">${esc(q.shown)}</p><p class="muted" style="font-size:14px;margin-bottom:10px">${esc(q.tr)}</p>` : `<h3 class="qtitle">${esc(q.prompt)}</h3>`;
    return `${head}${title}
      <button class="btn btn-dark btn-sm" data-say="${esc(q.say)}">${I.spk} Écouter${q.type === "gap" ? " la phrase" : " l’extrait"}</button>
      <div class="opts" role="group">${q.options.map((o, i) => `<button class="opt ${done && i === q.answer ? "right" : ""} ${done && i === st.picked && i !== q.answer ? "wrong" : ""}" data-pick="${i}" ${done ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>${nextBtn}`;
  }
  if (q.type === "order") {
    const chosen = st.chosen;
    return `${head}<h3 class="qtitle">Remets les mots dans l’ordre</h3><p class="muted" style="font-size:14px">${esc(q.tr)}</p>
      <div class="answer-line ${done ? (st.result ? "good" : "bad") : ""}" aria-live="polite">${chosen.length ? chosen.map((k, pos) => `<button class="tile" data-untile="${pos}" ${done ? "disabled" : ""}>${esc(q.tiles[k].w)}</button>`).join("") : `<span class="muted" style="font-size:14px">Touche les mots dans le bon ordre</span>`}</div>
      <div class="tiles">${q.tiles.map((t, k) => `<button class="tile ${chosen.includes(k) ? "used" : ""}" data-tile="${k}" ${chosen.includes(k) || done ? "disabled" : ""}>${esc(t.w)}</button>`).join("")}</div>
      ${done ? nextBtn : `<button class="btn btn-primary" style="width:100%;margin-top:12px" data-check ${chosen.length === q.tiles.length ? "" : "disabled"}>Vérifier</button>`}`;
  }
  return `${head}<h3 class="qtitle">Écoute et écris la phrase</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-dark btn-sm" data-say="${esc(q.say)}">${I.spk} Écouter</button><button class="btn btn-ghost btn-sm" data-sayslow="${esc(q.say)}">Plus lentement</button></div>
    <label class="sr" for="dictIn">Ta réponse</label>
    <textarea id="dictIn" class="dict-in" rows="2" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Écris ce que tu entends…" ${done ? "disabled" : ""}>${esc(st.typed || "")}</textarea>
    ${done ? `<p class="dict-ref"><b>${esc(q.text)}</b><br><span class="muted">${esc(q.tr)}</span></p>${nextBtn}` : `<button class="btn btn-primary" style="width:100%;margin-top:12px" data-check>Vérifier</button>`}`;
}
function answerItem(ok, fb) { const st = Q.state; st.result = ok; st.fb = fb; st.marks[st.i] = ok; if (ok) st.correct++; $("#quiz").innerHTML = quizHTML(); const n = $("#quiz [data-qnext]"); if (n) n.focus({ preventScroll: true }); }
function newQuizState() { return { i: 0, correct: 0, picked: null, result: null, fb: "", chosen: [], typed: "", marks: [] }; }
async function finishLesson() {
  const d = P.data, qs = Q.items;
  const score = qs.length ? Math.round((Q.state.correct / qs.length) * 100) : 100;
  stopPlay(); flushListening();
  let passed = score >= 80;
  let res = null;
  if (S.me) { try { res = await api("/api/progress", { method: "POST", body: { lessonId: d.lesson.id, score, correct: Q.state.correct, completed: true, lastSentence: P.idx } }); passed = res.passed; } catch {} }
  const next = d.lessons.find((x) => x.position === d.lesson.position + 1);
  const cols = ["var(--green)", "var(--navy)", "var(--sage)", "var(--pale)"];
  $("#layer").innerHTML = `<div class="overlay" id="ov"><div class="celebrate" role="dialog" aria-modal="true" aria-labelledby="ct">
    ${passed ? `<div class="cgrid">${Array.from({ length: 8 }, (_, i) => `<span style="background:${cols[i % 4]};animation-delay:${i * 0.08}s"></span>`).join("")}</div>` : motif(72)}
    <p class="eyebrow">${passed ? "Leçon validée" : "Presque"} · ${score} %</p><h2 id="ct" style="margin:8px 0 10px">${passed ? "Bravo !" : "Encore un petit effort"}</h2>
    <p class="muted" style="font-size:17px">${passed ? esc(d.lesson.goal || "Tu as terminé cette leçon.") : "Il faut 80 % pour valider. Réécoute les phrases en mode phrase par phrase, puis refais les exercices."}</p>
    ${res ? `<div class="gain"><span class="pill xp">⚡ +${res.xp} points</span><span class="gain-goal"><i style="width:${Math.min(100, Math.round((res.today / res.goal) * 100))}%"></i></span><small>${res.today >= res.goal ? "Objectif du jour atteint !" : `Objectif du jour : ${res.today} / ${res.goal}`}</small></div>` : ""}
    ${res && res.certificate ? `<a class="certwin" href="#/certificat/${esc(res.certificate.code)}" data-close><span class="cert-lv">${esc(res.certificate.module.split("·")[0].trim())}</span><span><b>Niveau terminé !</b><br><small>Ton certificat ${esc(res.certificate.module)} est prêt. Ouvre-le.</small></span></a>` : ""}
    <p class="muted" style="font-size:14px;margin-top:8px">${Q.state.correct} bonne${Q.state.correct > 1 ? "s" : ""} réponse${Q.state.correct > 1 ? "s" : ""} sur ${qs.length}</p>
    ${!S.me ? `<p class="muted" style="font-size:14px;margin-top:10px">Crée un compte gratuit pour enregistrer ta progression.</p>` : ""}
    <div style="display:grid;gap:10px;margin-top:22px">
      ${passed ? (next ? `<a class="btn btn-primary" href="#/lecon/${next.id}" data-close>Leçon suivante : ${esc(next.title)}</a>` : `<a class="btn btn-primary" href="${S.me ? "#/parcours" : "#/cours"}" data-close>${S.me ? "Voir mon parcours" : "Voir les cours"}</a>`) : `<button class="btn btn-primary" data-retry>Réécouter et réessayer</button>`}
      ${!S.me ? `<a class="btn btn-ghost" href="#/inscription" data-close>Créer mon compte</a>` : `<button class="btn btn-ghost" data-close>Rester ici</button>`}
    </div></div></div>`;
}
async function downloadOffline(id, btn) {
  try {
    btn.disabled = true; btn.textContent = "Téléchargement…";
    const c = await caches.open("nx-offline-v1");
    const res = await fetch(`/api/lessons/${id}`, { credentials: "same-origin" });
    if (!res.ok) throw new Error();
    const data = await res.clone().json();
    await c.put(`/api/lessons/${id}`, res);
    let bytes = 0;
    for (const s of data.lesson.sentences.filter((x) => x.audio)) { const r = await fetch(s.audio, { credentials: "same-origin" }); if (r.ok) { const b = await r.clone().blob(); bytes += b.size; await c.put(s.audio, r); } }
    btn.innerHTML = `✓ Disponible hors connexion · ${(bytes / 1048576).toFixed(1).replace(".", ",")} Mo`;
  } catch { btn.disabled = false; btn.textContent = "Échec du téléchargement, réessaie"; }
}

/* ================= Prononciation ================= */
// Reconnaissance vocale du navigateur (Chrome, Edge, Safari récents). Aucun enregistrement n'est conservé.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const SP = { i: 0, listening: false, result: null, good: new Set(), rec: null, sent: false };
function speakHTML() {
  const d = P.data; if (!d) return "";
  const sents = d.lesson.sentences.filter((s) => s.speaker !== "N" || !/^fr/i.test(d.course.lang));
  if (!sents.length || /^fr/i.test(d.course.lang)) return "";
  const s = sents[Math.min(SP.i, sents.length - 1)], r = SP.result;
  const words = s.text.split(/\s+/);
  const heard = r ? new Set(norm(r.text).split(" ")) : null;
  return `<div class="speak-head"><div><p class="eyebrow">Prononciation</p><h3 style="font-size:20px;margin-top:4px">Parle, l’application t’écoute</h3></div><span class="muted" style="font-size:13px">${SP.good.size} phrase${SP.good.size > 1 ? "s" : ""} réussie${SP.good.size > 1 ? "s" : ""}</span></div>
    ${!SR ? `<p class="note" style="margin-top:12px">Ton navigateur ne permet pas encore la reconnaissance vocale. Ouvre NEXOMIA Academy avec Google Chrome pour t’entraîner à la prononciation.</p>` : ""}
    <p class="speak-line">${heard ? words.map((w) => `<span class="${heard.has(norm(w)) ? "hit" : "miss"}">${esc(w)}</span>`).join(" ") : esc(s.text)}</p>
    <p class="muted" style="font-size:14px">${esc(s.translation || "")}</p>
    ${r ? `<div class="speak-res ${r.score >= 0.8 ? "good" : "bad"}" role="status"><b>${Math.round(r.score * 100)} %</b><span>${r.score >= 0.95 ? "Excellente prononciation !" : r.score >= 0.8 ? "Très bien, c’est compréhensible." : r.score >= 0.5 ? "Presque : réécoute les mots en rouge et réessaie." : "Réécoute la phrase lentement, puis réessaie."}<br><small class="muted">Compris : « ${esc(r.text)} »</small></span></div>` : ""}
    <div class="speak-ctrls">
      <button class="pbtn" data-spstep="-1" aria-label="Phrase précédente">${I.prev}</button>
      <button class="btn btn-ghost btn-sm" data-spsay>${I.spk} Modèle</button>
      <button class="micbtn ${SP.listening ? "on" : ""}" data-mic ${SR ? "" : "disabled"} aria-label="${SP.listening ? "J’écoute… touche pour arrêter" : "Appuie et prononce la phrase"}">${SP.listening ? '<span class="pulse"></span>' : ""}<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/></svg></button>
      <button class="pbtn" data-spstep="1" aria-label="Phrase suivante">${I.next}</button>
    </div>
    <p class="muted speak-count" aria-live="polite">${SP.listening ? "J’écoute… parle maintenant" : `Phrase ${Math.min(SP.i, sents.length - 1) + 1} sur ${sents.length} · touche le micro et parle`}</p>`;
}
function paintSpeak() { const el = $("#speak"); if (el) el.innerHTML = speakHTML(); }
function speakSentences() { return P.data.lesson.sentences.filter((s) => s.speaker !== "N" || !/^fr/i.test(P.data.course.lang)); }
function startMic() {
  if (!SR) return;
  if (SP.listening && SP.rec) { SP.rec.stop(); return; }
  stopPlay();
  const target = speakSentences()[SP.i];
  const rec = new SR(); SP.rec = rec;
  rec.lang = P.data.course.lang; rec.interimResults = false; rec.maxAlternatives = 3;
  rec.onresult = (e) => {
    const alts = [...e.results[0]].map((a) => a.transcript);
    const best = alts.map((t) => ({ text: t, score: dictScore(t, target.text) })).sort((a, b) => b.score - a.score)[0];
    SP.result = best;
    if (best.score >= 0.8 && !SP.good.has(SP.i)) {
      SP.good.add(SP.i);
      if (S.me && SP.good.size >= 3 && !SP.sent) { SP.sent = true; api("/api/me/speak", { method: "POST", body: { lessonId: P.data.lesson.id, good: SP.good.size } }).then((r) => r.xp && toast(`+${r.xp} points de prononciation`)).catch(() => {}); }
    }
  };
  rec.onerror = (e) => { SP.listening = false; if (e.error === "not-allowed" || e.error === "service-not-allowed") toast("Autorise le micro pour t’entraîner à la prononciation.", true); else if (e.error === "no-speech") toast("Je n’ai rien entendu. Approche-toi du micro et réessaie."); else if (e.error === "network") toast("La reconnaissance vocale a besoin d’Internet.", true); paintSpeak(); };
  rec.onend = () => { SP.listening = false; paintSpeak(); };
  SP.listening = true; SP.result = null; paintSpeak();
  try { rec.start(); } catch { SP.listening = false; paintSpeak(); }
}

/* ================= Test de niveau ================= */
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_FR = { A1: "Débutant", A2: "Élémentaire", B1: "Intermédiaire", B2: "Intermédiaire avancé", C1: "Avancé", C2: "Maîtrise" };
const PT = { data: null, q: [], i: 0, byLevel: {}, picked: null, done: false, result: null };
async function vPlacement(slug) {
  stopPlay();
  const d = await api(`/api/placement/${encodeURIComponent(slug)}`);
  PT.data = d; PT.slug = slug; PT.i = -1; PT.byLevel = {}; PT.picked = null; PT.result = null;
  const rnd = seeded(Date.now() % 100000 + 7);
  PT.q = d.questions.map((q) => { const opts = shuffleWith(q.options.map((o, k) => ({ o, k })), rnd); return { ...q, options: opts.map((x) => x.o), answer: opts.findIndex((x) => x.k === q.answer) }; });
  return `<a class="back" href="#/cours/${esc(slug)}">${I.back} ${esc(d.course.title)}</a><div class="ptest card" id="ptest">${placementHTML()}</div>`;
}
function placementHTML() {
  const d = PT.data;
  if (PT.result) {
    const r = PT.result, start = d.starts.find((s) => s.level === r.start) || d.starts[0];
    return `<div class="ptest-result">${motif(72)}
      <p class="eyebrow">Ton résultat</p>
      <div class="levelbadge" aria-hidden="true">${esc(r.start)}</div>
      <h1 style="font-size:clamp(28px,5vw,40px)">Commence au niveau ${esc(r.start)} · ${esc(LEVEL_FR[r.start])}</h1>
      <p class="muted" style="max-width:46ch;margin:10px auto 0">${r.mastered ? `Tu maîtrises déjà les bases jusqu’au niveau ${esc(r.mastered)}. ` : ""}${r.correct} bonnes réponses sur ${r.total}. Tu peux toujours revenir aux niveaux précédents pour réviser.</p>
      <div class="lvlscale" aria-label="Échelle des niveaux">${LEVELS.map((L) => `<span class="${L === r.start ? "cur" : LEVELS.indexOf(L) < LEVELS.indexOf(r.start) ? "past" : ""}">${L}</span>`).join("")}</div>
      <div style="display:grid;gap:10px;max-width:360px;margin:22px auto 0">
        <a class="btn btn-primary" href="#/lecon/${start.lesson_id}">Commencer au niveau ${esc(r.start)}</a>
        <a class="btn btn-ghost" href="#/cours/${esc(PT.slug)}">Voir toutes les leçons</a>
        ${S.me ? "" : `<p class="muted" style="font-size:14px">Crée un compte gratuit pour garder ce résultat.</p><a class="btn btn-ghost" href="#/inscription?next=${encodeURIComponent("#/parcours")}">Créer mon compte</a>`}
      </div></div>`;
  }
  if (PT.i < 0) return `<div style="text-align:center">${motif(64)}<p class="eyebrow" style="margin-top:14px">Test de niveau · ${esc(d.course.title)}</p>
    <h1 style="font-size:clamp(28px,5vw,40px);margin:8px 0">Trouve ton point de départ</h1>
    <p class="muted" style="max-width:48ch;margin:0 auto">Environ 10 minutes. Les questions deviennent plus difficiles au fil du test, qui s’arrête dès que tu atteins ton niveau. Pas de stress : ce n’est pas un examen.</p>
    <ul class="ticks" style="text-align:left;max-width:360px;margin:18px auto 0"><li>Grammaire, vocabulaire et écoute</li><li>Du niveau A1 (débutant) au C2 (maîtrise)</li><li>Mets le son pour les questions d’écoute</li></ul>
    <button class="btn btn-primary" style="margin-top:20px" data-ptstart>Commencer le test</button></div>`;
  const q = PT.q[PT.i], ans = PT.picked !== null, lv = q.level;
  const progress = Math.round((PT.i / PT.q.length) * 100);
  return `<div class="ptop"><span class="eyebrow">Niveau ${esc(lv)} · question ${PT.i + 1}</span><button class="btn btn-ghost btn-sm" data-ptquit>Arrêter</button></div>
    <div class="pbar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(3, progress)}%"></i></div>
    <h2 class="pq">${esc(q.prompt)}</h2>
    ${q.say ? `<button class="btn btn-dark btn-sm" data-ptsay="${esc(q.say)}">${I.spk} Écouter</button>` : ""}
    <div class="opts" role="group" style="margin-top:6px">${q.options.map((o, k) => `<button class="opt ${ans && k === q.answer ? "right" : ""} ${ans && k === PT.picked && k !== q.answer ? "wrong" : ""}" data-ptpick="${k}" ${ans ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>
    ${ans ? `<button class="btn btn-primary" style="width:100%;margin-top:14px" data-ptnext>Continuer</button>` : ""}`;
}
async function placementNext() {
  // On s'arrête à la fin d'un niveau si moins de 3 bonnes réponses sur 4.
  const q = PT.q[PT.i], nextQ = PT.q[PT.i + 1];
  if (!nextQ || nextQ.level !== q.level) {
    const r = PT.byLevel[q.level] || 0;
    if (r < 3 || !nextQ) return placementFinish();
  }
  PT.i++; PT.picked = null; $("#ptest").innerHTML = placementHTML();
}
async function placementFinish() {
  const levels = LEVELS.filter((L) => PT.q.some((q) => q.level === L));
  let mastered = null;
  for (const L of levels) { if ((PT.byLevel[L] || 0) >= 3) mastered = L; else break; }
  const start = mastered ? (levels[levels.indexOf(mastered) + 1] || "C2") : "A1";
  const total = PT.i + 1, correct = Object.values(PT.byLevel).reduce((a, b) => a + b, 0);
  PT.result = { start, mastered, correct, total };
  const payload = { slug: PT.slug, level: start, score: Math.round((correct / total) * 100) };
  if (S.me) { try { const r = await api("/api/me/placement", { method: "POST", body: payload }); S.me.placement = r.placement; if (r.xp) toast(`+${r.xp} points`); } catch {} }
  else store.set("pendingPlacement", payload);
  $("#ptest").innerHTML = placementHTML(); window.scrollTo(0, 0);
}

/* ================= Accueil guidé ================= */
const OB = { step: 0, motive: "", goal: 20 };
const MOTIVES = [["travail", "Pour mon travail", "Clients, réunions, entretiens"], ["etudes", "Pour mes études", "Cours, examens, bourses"], ["voyage", "Pour voyager", "Zambie, Afrique du Sud, ailleurs"], ["entreprise", "Pour mon entreprise", "Vendre, négocier, exporter"], ["culture", "Par plaisir", "Films, musique, culture"]];
const GOALS = [[10, "Détente", "environ 5 min par jour"], [20, "Régulier", "environ 10 min par jour"], [30, "Sérieux", "environ 15 min par jour"], [50, "Intense", "20 min et plus par jour"]];
function vWelcome() {
  if (!S.me) { location.hash = "#/inscription"; return ""; }
  OB.step = 0; OB.motive = S.me.motive || ""; OB.goal = S.me.daily_goal || 20;
  return `<div class="onb card" id="onb">${welcomeHTML()}</div>`;
}
function welcomeHTML() {
  const dots = `<div class="onb-dots" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= OB.step ? "on" : ""}"></i>`).join("")}</div>`;
  if (OB.step === 0) return `${dots}<p class="eyebrow">Bienvenue, ${esc(S.me.name.split(" ")[0])}</p><h1 class="onb-h">Pourquoi apprends-tu ?</h1><p class="muted">Nous adaptons les exemples et les rappels à ton objectif.</p>
    <div class="choice-list">${MOTIVES.map(([k, t, s]) => `<button class="choice" data-obmotive="${k}" aria-pressed="${OB.motive === k}"><b>${t}</b><small>${s}</small></button>`).join("")}</div>
    <button class="btn btn-primary onb-next" data-obnext ${OB.motive ? "" : "disabled"}>Continuer</button>`;
  if (OB.step === 1) return `${dots}<p class="eyebrow">Ton rythme</p><h1 class="onb-h">Quel objectif chaque jour ?</h1><p class="muted">Une leçon rapporte environ 20 à 30 points. Tu pourras changer d’objectif à tout moment.</p>
    <div class="choice-list">${GOALS.map(([g, t, s]) => `<button class="choice" data-obgoal="${g}" aria-pressed="${OB.goal === g}"><b>${t} · ${g} points</b><small>${s}</small></button>`).join("")}</div>
    <div class="onb-nav"><button class="btn btn-ghost" data-obback>Retour</button><button class="btn btn-primary" data-obnext>Continuer</button></div>`;
  return `${dots}<p class="eyebrow">Ton niveau</p><h1 class="onb-h">Par où commencer ?</h1><p class="muted">Le test de niveau te place directement au bon endroit du cours d’anglais.</p>
    <div class="choice-list"><button class="choice" data-obfinish="test"><b>Passer le test de niveau</b><small>10 minutes, de A1 à C2 · recommandé</small></button>
    <button class="choice" data-obfinish="start"><b>Je débute en anglais</b><small>Commencer au niveau A1, leçon 1</small></button>
    <button class="choice" data-obfinish="browse"><b>Voir tous les cours</b><small>Portugais, design, numérique, entrepreneuriat…</small></button></div>
    <div class="onb-nav"><button class="btn btn-ghost" data-obback>Retour</button></div>`;
}
async function welcomeFinish(choice) {
  try { await api("/api/me/profile", { method: "PUT", body: { motive: OB.motive, daily_goal: OB.goal, onboarded: true } }); Object.assign(S.me, { motive: OB.motive, daily_goal: OB.goal, onboarded: true }); } catch (e) { toast(e.message, true); }
  if (choice === "test") location.hash = "#/test-niveau/anglais";
  else if (choice === "start") { const c = (await loadCatalog()).find((x) => x.slug === "anglais"); location.hash = c ? `#/lecon/${c.first_lesson}` : "#/cours"; }
  else location.hash = "#/cours";
}

/* ================= Certificat ================= */
async function vCertificate(code) {
  const { certificate: c } = await api(`/api/certificates/${encodeURIComponent(code)}`);
  const lvl = c.module.split("·")[0].trim(), url = `${location.origin}/#/certificat/${c.code}`;
  return `<div class="cert-actions noprint"><a class="back" href="${S.me ? "#/parcours" : "#/"}">${I.back} ${S.me ? "Mon parcours" : "Accueil"}</a>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-print>${I.dl} Télécharger en PDF</button><button class="btn btn-ghost btn-sm" data-copy="${esc(url)}">Copier le lien de vérification</button></div></div>
    <article class="cert" aria-label="Certificat">
      <div class="cert-in">
        <div class="cert-top">${motif(56)}<div><b class="cert-brand">NEXOMIA Academy</b><small>Lubumbashi · République démocratique du Congo</small></div></div>
        <p class="eyebrow cert-eyebrow">Certificat de réussite</p>
        <p class="cert-small">Ce certificat atteste que</p>
        <h1 class="cert-name">${esc(c.name)}</h1>
        <p class="cert-small">a validé l’ensemble du niveau</p>
        <p class="cert-level"><span class="cert-lv">${esc(lvl)}</span> ${esc(c.course)} · ${esc(c.module.split("·")[1] ? c.module.split("·")[1].trim() : "")}</p>
        <p class="cert-small">${c.lessons} leçons audio et exercices · score moyen de ${c.avg_score} % · niveau aligné sur le Cadre européen commun de référence (CECRL)</p>
        <div class="cert-foot">
          <div><small>Délivré le</small><b>${fmtD(c.issued_at)}</b></div>
          <div><small>Code de vérification</small><b class="mono">${esc(c.code)}</b></div>
          <div><small>Pour NEXOMIA SARL</small><b>Héritier Ebunga Muloko</b><small>Fondateur</small></div>
        </div>
        <p class="cert-verify">Vérifier l’authenticité : ${esc(location.host)}/#/certificat/${esc(c.code)}</p>
      </div>
    </article>`;
}

/* ================= Révision ================= */
const RV = { items: [], i: 0, flipped: false, results: [] };
async function vReview() {
  stopPlay();
  const d = await api("/api/me/reviews");
  RV.items = d.items; RV.i = 0; RV.flipped = false; RV.results = []; RV.counts = d.counts;
  return `<a class="back" href="#/parcours">${I.back} Mon parcours</a><div class="review-wrap" id="review">${reviewHTML()}</div>`;
}
function reviewHTML() {
  if (!RV.items.length) return `<div class="card" style="text-align:center">${motif(64)}<h1 style="font-size:28px;margin:12px 0 6px">Rien à réviser pour l’instant</h1>
    <p class="muted">Les mots de chaque leçon terminée arrivent ici, au bon moment pour ne pas les oublier.${RV.counts.total ? ` Tu as déjà ${RV.counts.total} mots en mémoire, dont ${RV.counts.mastered} maîtrisés.` : ""}</p>
    <a class="btn btn-primary" style="margin-top:16px" href="#/parcours">Retour à mon parcours</a></div>`;
  if (RV.i >= RV.items.length) {
    const k = RV.results.filter((r) => r.knew).length;
    return `<div class="card" style="text-align:center">${motif(64)}<p class="eyebrow" style="margin-top:12px">Révision terminée</p><h1 style="font-size:32px;margin:6px 0">${k} sur ${RV.results.length} retenus</h1>
      <p class="muted">Les mots à revoir reviendront demain. Ceux que tu connais reviendront de plus en plus tard.</p>
      <a class="btn btn-primary" style="margin-top:16px" href="#/parcours">Retour à mon parcours</a></div>`;
  }
  const it = RV.items[RV.i];
  return `<div class="ptop"><span class="eyebrow">Révision · ${RV.i + 1}/${RV.items.length}</span><span class="muted" style="font-size:13px">Boîte ${it.box + 1} sur 6</span></div>
    <div class="pbar"><i style="width:${Math.max(3, Math.round((RV.i / RV.items.length) * 100))}%"></i></div>
    <button class="flash ${RV.flipped ? "flipped" : ""}" data-flip aria-live="polite">
      <span class="flash-term">${esc(it.item)}</span>
      ${RV.flipped ? `<span class="flash-mean">${esc(it.meaning || "")}</span>` : `<span class="muted" style="font-size:14px">Dis la traduction à voix haute, puis touche la carte</span>`}
    </button>
    <button class="btn btn-dark btn-sm" style="margin-top:12px" data-rvsay>${I.spk} Écouter</button>
    ${RV.flipped ? `<div class="rv-actions"><button class="btn btn-ghost" data-rvgrade="0">À revoir</button><button class="btn btn-primary" data-rvgrade="1">Je savais</button></div>` : ""}`;
}
async function reviewGrade(knew) {
  const it = RV.items[RV.i];
  RV.results.push({ item: it.item, lesson_id: it.lesson_id, knew });
  RV.i++; RV.flipped = false;
  if (RV.i >= RV.items.length) { try { const r = await api("/api/me/reviews", { method: "POST", body: { results: RV.results } }); if (r.xp) toast(`+${r.xp} points`); } catch (e) { toast(e.message, true); } }
  $("#review").innerHTML = reviewHTML();
  if (RV.i < RV.items.length) playSentence({ text: RV.items[RV.i].item }, RV.items[RV.i].lang, 1);
}

/* ================= Petits éléments visuels ================= */
function ring(value, max, size = 120, label = "") {
  const r = (size - 14) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, max ? value / max : 0));
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--green)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring-fg"/>
  </svg>`;
}
const BADGE_ICON = { first: "1", ten: "10", thirty: "30", streak3: "3j", streak7: "7j", streak30: "30j", xp500: "500", xp2000: "2k", perfect: "100", placement: "A→C", cert: "★", review: "↺" };

/* ================= Parcours ================= */
async function vDash() {
  const d = await api("/api/me/dashboard"); await loadCatalog();
  if (!S.me.onboarded && !d.completed && !d.xp) { location.hash = "#/bienvenue"; return ""; }
  const n = d.next, first = esc(S.me.name.split(" ")[0]);
  const goalPct = Math.min(100, Math.round((d.today / d.goal) * 100));
  const enPlace = d.placement && d.placement.anglais;
  const dayL = ["L", "M", "M", "J", "V", "S", "D"];
  const maxXp = Math.max(d.goal, ...d.last7.map((x) => x.xp));
  const earned = d.badges.filter((b) => b.earned).length;
  return `<div class="dash-hello"><div><p class="eyebrow">Mon parcours</p><h1>${d.completed || d.xp ? "Content de te revoir" : "Bienvenue"}, ${first}.</h1></div>
    <div class="hello-stats"><span class="pill streak ${d.streak ? "on" : ""}" title="Jours de suite">🔥 ${d.streak} jour${d.streak > 1 ? "s" : ""}</span><span class="pill xp" title="Points">⚡ ${d.xp.toLocaleString("fr-FR")} pts</span></div></div>
  <div class="dash"><div style="display:grid;gap:18px;min-width:0">
    ${n ? `<div class="card continue"><p class="eyebrow">Continuer · ${esc(n.course)}</p><h3>${esc(n.title)}</h3><p style="color:#A9BCB0">Leçon ${n.position} · ${n.duration_min} min${n.locked ? " · abonnement requis" : ""}</p><a class="btn btn-primary" style="margin-top:16px" href="#/lecon/${n.id}">${I.spk} ${n.locked ? "Voir la leçon" : "Reprendre l’écoute"}</a></div>`
      : `<div class="card continue"><p class="eyebrow">Commencer</p><h3>Choisis ton premier cours</h3><p style="color:#A9BCB0">La première leçon de chaque cours est gratuite.</p><a class="btn btn-primary" style="margin-top:16px" href="#/cours">Voir les cours</a></div>`}
    <div class="dash-duo">
      <div class="card goalcard"><div class="ringwrap">${ring(d.today, d.goal, 112, `Objectif du jour : ${d.today} sur ${d.goal} points`)}<div class="ringtxt"><b>${d.today}</b><small>/ ${d.goal} pts</small></div></div>
        <div><h3 style="font-size:18px">Objectif du jour</h3><p class="muted" style="font-size:14px;margin-top:4px">${goalPct >= 100 ? "Objectif atteint, bravo !" : `Encore ${d.goal - d.today} points pour l’atteindre.`}</p>
        <div class="seg" role="group" aria-label="Changer l’objectif">${[10, 20, 30, 50].map((g) => `<button data-setgoal="${g}" aria-pressed="${d.goal === g}">${g}</button>`).join("")}</div></div></div>
      <a class="card revcard" href="#/revision" style="text-decoration:none;color:inherit"><p class="eyebrow">Révision intelligente</p>
        <h3 style="font-size:28px;margin:6px 0 2px">${d.reviews.due} mot${d.reviews.due > 1 ? "s" : ""}</h3><p class="muted" style="font-size:14px">${d.reviews.due ? "à revoir aujourd’hui, pour ne pas les oublier." : d.reviews.total ? "Rien à revoir aujourd’hui. Reviens demain." : "Termine une leçon pour remplir ta mémoire."}</p>
        <p style="margin-top:10px;font-size:13px" class="muted">${d.reviews.mastered} maîtrisé${d.reviews.mastered > 1 ? "s" : ""} sur ${d.reviews.total}</p>
        ${d.reviews.due ? `<span class="btn btn-primary btn-sm" style="margin-top:12px">Réviser maintenant</span>` : ""}</a>
    </div>
    <div class="card"><div class="sec-h" style="margin:0"><h3 style="font-size:20px">Ma semaine</h3><span class="muted" style="font-size:14px">Record : ${d.best} jour${d.best > 1 ? "s" : ""} de suite</span></div>
      <div class="week7" role="img" aria-label="Points des 7 derniers jours">${d.last7.map((x) => { const wd = (new Date(x.day + "T12:00:00Z").getUTCDay() + 6) % 7; return `<div class="wk ${x.xp >= d.goal ? "hit" : ""}"><span class="wkbar"><i style="height:${Math.max(x.xp ? 8 : 0, Math.round((x.xp / maxXp) * 100))}%"></i></span><b>${x.xp}</b><small>${dayL[wd]}</small></div>`; }).join("")}</div>
      <div class="stats"><div class="stat"><b>${d.minutes}</b><small>min d’écoute</small></div><div class="stat"><b>${d.completed}</b><small>leçon${d.completed > 1 ? "s" : ""} validée${d.completed > 1 ? "s" : ""}</small></div><div class="stat"><b>${d.certificates.length}</b><small>certificat${d.certificates.length > 1 ? "s" : ""}</small></div></div></div>
    <div class="card"><h3 style="font-size:20px">Mes cours</h3>
      ${d.courses.length ? `<div class="plist" style="margin-top:14px">${d.courses.map((c) => { const p = c.total ? Math.round((c.done / c.total) * 100) : 0; const sub = d.subs.find((s) => s.course_id === c.id); return `<a class="row" href="#/cours/${esc(c.slug)}" style="text-decoration:none;color:inherit"><b>${esc(c.title)} ${sub ? `<span class="tag subbed" style="margin-left:6px">Abonné</span>` : `<span class="tag" style="margin-left:6px">Essai</span>`}</b><span class="muted" style="font-variant-numeric:tabular-nums">${p} %</span><div class="bar"><i style="width:${Math.max(p, 3)}%"></i></div></a>`; }).join("")}</div>` : `<p class="muted" style="margin-top:8px">Tu n’as pas encore commencé de cours.</p>`}
      <div class="placement-row">${enPlace ? `<span>Niveau d’anglais : <b>${esc(enPlace.level)} · ${esc(LEVEL_FR[enPlace.level] || "")}</b></span><a href="#/test-niveau/anglais">Refaire le test</a>` : `<span>Tu ne connais pas ton niveau d’anglais ?</span><a class="btn btn-ghost btn-sm" href="#/test-niveau/anglais">Passer le test de niveau</a>`}</div></div>
    <div class="card"><div class="sec-h" style="margin:0"><h3 style="font-size:20px">Mes certificats</h3></div>
      ${d.certificates.length ? `<div class="certlist">${d.certificates.map((c) => `<a href="#/certificat/${esc(c.code)}" class="certitem"><span class="cert-lv">${esc(c.module.split("·")[0].trim())}</span><span><b>${esc(c.course)} · ${esc(c.module)}</b><br><small class="muted">Délivré le ${fmtD(c.issued_at)} · ${esc(c.code)}</small></span></a>`).join("")}</div>`
        : `<p class="muted" style="margin-top:8px;font-size:15px">Valide toutes les leçons d’un niveau (A1, A2, B1…) pour recevoir ton certificat NEXOMIA, téléchargeable en PDF et vérifiable en ligne.</p>`}</div>
  </div>
  <div style="display:grid;gap:18px;align-content:start;min-width:0">
    <div class="card"><div class="sec-h" style="margin:0"><h3 style="font-size:20px">Badges</h3><span class="muted" style="font-size:14px">${earned}/${d.badges.length}</span></div>
      <div class="badges">${d.badges.map((b) => `<div class="badge ${b.earned ? "on" : ""}" title="${esc(b.how)}"><span class="bico" aria-hidden="true">${BADGE_ICON[b.id] || "★"}</span><b>${esc(b.title)}</b><small>${esc(b.how)}</small></div>`).join("")}</div></div>
    <div class="card"><h3 style="font-size:20px">Classement de la semaine</h3><p class="muted" style="font-size:13px;margin-top:4px">Points gagnés ces 7 derniers jours</p>
      ${d.board.length ? `<ol class="board">${d.board.map((b) => `<li class="${b.me ? "me" : ""}"><span class="rk">${b.rank || "–"}</span><span class="nm">${esc(b.me ? b.name + " (toi)" : b.name)}</span><b>${b.xp}</b></li>`).join("")}</ol>` : `<p class="muted" style="margin-top:8px">Sois le premier à gagner des points cette semaine.</p>`}</div>
    <div class="card"><h3 style="font-size:20px">Mes abonnements</h3>
      ${d.subs.length ? d.subs.map((s) => `<p style="margin-top:10px;display:flex;justify-content:space-between;gap:10px"><b>${esc(s.title)}</b><span class="muted">jusqu’au ${fmtD(s.end_at)}</span></p>`).join("") : `<p class="muted" style="margin-top:8px">Aucun abonnement. Les premières leçons restent gratuites.</p>`}
      <a class="btn btn-ghost btn-sm" style="margin-top:14px" href="#/abonnements">Gérer mes abonnements</a></div>
    <div class="card"><h3 style="font-size:20px">Besoin d’aide ?</h3><p class="muted" style="font-size:15px;margin-top:6px">L’équipe NEXOMIA répond sous deux jours ouvrables. Ton rôle : <b style="color:var(--ink)">${ROLE_FR[S.me.role]}</b>.</p></div>
  </div></div>`;
}

/* ================= Abonnements ================= */
const METHODS = { mpesa: ["M-Pesa", "Vodacom"], airtel: ["Airtel Money", "Airtel"], orange: ["Orange Money", "Orange"], card: ["Carte bancaire", "Visa · Mastercard"] };
let pollRun = 0;
async function vSubs(query) {
  const courses = await loadCatalog(true);
  const mine = S.me ? await api("/api/me/orders") : { orders: [], subs: [] };
  S.cart = S.cart.filter((id) => courses.some((c) => c.id === id));
  const cart = S.cart.map((id) => courses.find((c) => c.id === id));
  const total = priceFor(cart.length), single = S.pricing.tiers[0] * cart.length;
  const ref = query.get("ref");
  if (ref && S.me) setTimeout(() => pollOrder(ref), 50);
  if (!S.methods.includes(S.payMethod)) S.payMethod = S.methods[0];
  return `<p class="eyebrow">Abonnements · ${money(S.pricing.tiers[0])} par cours et par mois</p><h1 style="font-size:clamp(30px,4vw,44px);margin:8px 0 6px">Choisis tes cours</h1>
  <p class="muted" style="max-width:62ch">Chaque cours est un abonnement séparé, avec sa propre date de fin. Plus tu prends de cours ensemble, moins chaque cours coûte : ${[2, 3].map((n) => `${n} cours = ${money(priceFor(n))}`).join(", ")}.</p>
  <div class="dash" style="margin-top:22px"><div class="card">
    ${S.payments === "test" ? `<div class="demo-banner"><b>Mode test.</b> Les paiements sont simulés : aucun argent n’est prélevé. Le mode réel s’active dès que le prestataire de paiement est configuré.</div>` : ""}
    <div id="payState"></div>
    <h3 style="font-size:20px">1. Cours</h3>
    <div class="cartlist" role="group" aria-label="Cours à payer">${courses.map((c) => { const on = S.cart.includes(c.id); return `<button class="citem" data-cart="${c.id}" aria-pressed="${on}"><span class="box">${on ? "✓" : ""}</span><span style="min-width:0"><b>${esc(c.title)}</b><br><small class="muted">${esc(c.domain)} · ${c.subscribed_until ? `abonné jusqu’au ${fmtD(c.subscribed_until)} · prolonger` : esc(c.level)}</small></span><span class="pricetag">${money(S.pricing.tiers[0])}</span></button>`; }).join("")}</div>
    <h3 style="font-size:20px;margin-top:8px">2. Moyen de paiement</h3>
    <div class="methods" role="group" aria-label="Moyen de paiement">${Object.entries(METHODS).filter(([k]) => S.methods.includes(k)).map(([k, v]) => `<button class="method" data-pm="${k}" aria-pressed="${S.payMethod === k}">${v[0]}<small>${v[1]}</small></button>`).join("")}</div>
    ${S.payMethod === "card" ? `<p class="muted" style="font-size:15px">Tu seras redirigé vers la page sécurisée du prestataire pour saisir ta carte. NEXOMIA ne voit jamais ton numéro de carte.</p>`
      : `<div class="field"><label for="f-phone">Numéro ${esc(METHODS[S.payMethod][0])}</label><input id="f-phone" inputmode="tel" autocomplete="tel" placeholder="+243 81 234 5678" value="${esc(store.get("phone", S.me && S.me.phone || ""))}"><span class="hint">Tu recevras une demande de paiement sur ce téléphone : valide-la avec ton code secret, uniquement sur ton téléphone. Ne communique jamais ton code PIN à personne.</span></div>`}
    ${S.me ? `<button class="btn btn-primary" style="width:100%;margin-top:8px" id="payBtn" ${cart.length ? "" : "disabled"}>${cart.length ? `Payer ${money(total)}` : "Choisis au moins un cours"}</button>`
      : `<a class="btn btn-primary" style="width:100%;margin-top:8px" href="#/connexion?next=${encodeURIComponent("#/abonnements")}">Se connecter pour payer</a>`}
  </div>
  <div style="display:grid;gap:18px;align-content:start;min-width:0">
    <div class="card"><h3 style="font-size:20px">Récapitulatif</h3>
      <div style="display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:14px;font-variant-numeric:tabular-nums">
        ${cart.length ? cart.map((c) => `<span>${esc(c.title)} · 1 mois</span><span class="muted">${money(S.pricing.tiers[0])}</span>`).join("") : `<span class="muted">Aucun cours choisi</span><span></span>`}
        ${total < single ? `<span style="color:var(--green);font-weight:700">Réduction ${cart.length} cours</span><b style="color:var(--green)">−${money(single - total)}</b>` : ""}
        <span style="border-top:1px solid var(--line);padding-top:8px;font-weight:700">Total</span><b style="border-top:1px solid var(--line);padding-top:8px;font-size:20px">${money(total)}</b>
      </div>
      <p class="muted" style="font-size:14px;margin-top:14px">Un mois à partir de la confirmation. Si tu es déjà abonné, le mois s’ajoute à la suite. Le renouvellement est manuel : nous te rappelons avant chaque échéance.</p></div>
    ${S.me ? `<div class="card"><h3 style="font-size:20px">Mes abonnements</h3>
      ${mine.subs.length ? `<div class="slist" style="margin-top:12px">${mine.subs.map((s) => `<div class="sitem"><div><b>${esc(s.title)}</b><br><small class="muted">Jusqu’au ${fmtD(s.end_at)}</small></div><span class="status st-pub">Actif</span></div>`).join("")}</div>` : `<p class="muted" style="font-size:15px;margin-top:8px">Aucun abonnement actif.</p>`}
      ${mine.orders.length ? `<h4 style="margin:16px 0 8px">Historique des paiements</h4><div class="slist">${mine.orders.slice(0, 8).map((o) => `<div class="sitem"><div style="min-width:0"><b>${money(o.amount)}</b> · ${esc(o.method)}<br><small class="muted">${fmtD(o.created_at)} · ${o.items.map((i) => esc(i.title)).join(", ")} · réf. ${esc(o.ref)}</small></div><span class="status ${o.status === "paid" ? "st-pub" : o.status === "pending" ? "st-review" : "st-draft"}">${{ paid: "Payé", pending: "En attente", failed: "Échoué", cancelled: "Expiré" }[o.status]}</span></div>`).join("")}</div>` : ""}
    </div>` : ""}
  </div></div>`;
}
const maskPhone = (p) => { const d = String(p || "").replace(/\D/g, "").replace(/^0/, "243"); const n = d.startsWith("243") ? d : "243" + d; return n.length >= 12 ? `+243 ${n.slice(3, 5)} ••• ${n.slice(-4)}` : String(p || ""); };
const OPERATOR = { mpesa: "M-Pesa", airtel: "Airtel Money", orange: "Orange Money", card: "carte bancaire" };
let payCtx = null; // { phone, method, ref, started }

async function pay(btn) {
  const ph = $("#f-phone");
  if (ph && ph.value.replace(/\D/g, "").length < 9) { ph.focus(); $("#payState").innerHTML = `<div class="feedback" style="color:var(--bad);margin-bottom:14px"><b>Saisis ton numéro ${esc(OPERATOR[S.payMethod])} complet, par exemple 0970 000 000.</b></div>`; ph.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
  const body = { courseIds: S.cart, method: S.payMethod, phone: ph ? ph.value : undefined };
  if (ph) store.set("phone", ph.value);
  const label = btn.innerHTML;
  btn.disabled = true; btn.classList.add("is-loading");
  btn.innerHTML = `<span class="spin" aria-hidden="true"></span> Envoi de la demande à ${esc(OPERATOR[S.payMethod])}…`;
  payCtx = { phone: body.phone, method: S.payMethod, started: Date.now() };
  try {
    const o = await api("/api/orders", { method: "POST", body });
    if (o.redirect) { location.href = o.redirect; return; }
    S.cart = []; store.set("cart", S.cart);
    payCtx.ref = o.ref;
    showOrder(o);
    if (!o.test) pollOrder(o.ref);
  } catch (e) {
    btn.disabled = false; btn.classList.remove("is-loading"); btn.innerHTML = label;
    openPayModal({ status: "error", message: e.message });
  }
}

function openPayModal(o) {
  const layer = $("#layer");
  let m = $("#payModal");
  if (!m) { layer.innerHTML = `<div class="overlay" id="ov"><div class="celebrate paymodal" id="payModal" role="dialog" aria-modal="true" aria-live="polite"></div></div>`; m = $("#payModal"); }
  const op = OPERATOR[(payCtx && payCtx.method) || S.payMethod] || "Mobile Money";
  const detected = o.method && o.method !== op && /M-Pesa|Airtel|Orange/.test(o.method) ? o.method : op;
  if (o.status === "paid") {
    m.dataset.state = "paid";
    m.innerHTML = `<div class="pm-icon ok" aria-hidden="true">✓</div>
      <h2>Paiement confirmé</h2>
      <p class="muted">${money(o.amount)} reçus via ${esc(o.method || detected)}. Merci !</p>
      ${o.items && o.items.length ? `<div class="pm-box"><b>Accès ouvert :</b> ${o.items.map((i) => esc(i.title)).join(", ")}</div>` : ""}
      <p class="muted" style="font-size:13px">Référence ${esc(o.ref)}</p>
      <div class="pm-actions"><a class="btn btn-primary" href="#/parcours" data-close>Commencer à apprendre</a><button class="btn btn-ghost" data-close>Fermer</button></div>`;
    return;
  }
  if (o.status === "failed" || o.status === "cancelled" || o.status === "error") {
    m.dataset.state = "failed";
    m.innerHTML = `<div class="pm-icon bad" aria-hidden="true">!</div>
      <h2>Paiement non abouti</h2>
      <p>${esc(o.message || "Le paiement n’a pas été confirmé.")}</p>
      <p class="muted" style="font-size:14px">Aucun montant n’a été prélevé pour cet essai et aucun abonnement n’a été activé.</p>
      <div class="pm-actions"><button class="btn btn-primary" data-close data-retrypay>Réessayer</button></div>`;
    return;
  }
  // En attente
  const secs = payCtx ? Math.round((Date.now() - payCtx.started) / 1000) : 0;
  const late = secs > 120;
  if (m.dataset.state === "pending" && !o.test) {
    const st = m.querySelector(".pm-status");
    if (st) st.innerHTML = `<span class="dot"></span> ${late ? "Toujours en attente de la réponse de l’opérateur…" : "En attente de ta confirmation…"} <span class="muted">${Math.floor(secs / 60) ? Math.floor(secs / 60) + " min " : ""}${secs % 60} s</span>`;
    if (late && !m.dataset.lateShown) { m.dataset.lateShown = "1"; const h = m.querySelector(".pm-help"); if (h) h.open = true; }
    return;
  }
  m.dataset.state = "pending";
  m.innerHTML = `<div class="pm-icon wait" aria-hidden="true"><span class="spin big"></span></div>
    <h2>Confirme le paiement sur ton téléphone</h2>
    <p>Une demande de <b>${money(o.amount)}</b> a été envoyée à ton compte <b>${esc(detected)}</b>${payCtx && payCtx.phone ? ` (${esc(maskPhone(payCtx.phone))})` : ""}.</p>
    ${o.test ? `<div class="pm-box">Mode test : aucun téléphone ne sonnera. Choisis le résultat à simuler.</div>
      <div class="pm-actions"><button class="btn btn-primary btn-sm" data-testpay="${esc(o.ref)}" data-result="success">Simuler un paiement réussi</button><button class="btn btn-ghost btn-sm" data-testpay="${esc(o.ref)}" data-result="fail">Simuler un refus</button></div>` : `
    <ol class="pm-steps">
      <li>Regarde l’écran de ton téléphone : une notification <b>${esc(detected)}</b> va s’afficher.</li>
      <li>Vérifie le montant : <b>${money(o.amount)}</b> pour NEXOMIA Academy.</li>
      <li>Entre ton <b>code secret</b> sur ton téléphone pour accepter.</li>
    </ol>
    <div class="pm-status"><span class="dot"></span> ${late ? "Toujours en attente de la réponse de l’opérateur…" : "En attente de ta confirmation…"} <span class="muted">${secs > 5 ? `${Math.floor(secs / 60) ? Math.floor(secs / 60) + " min " : ""}${secs % 60} s` : ""}</span></div>
    <details class="pm-help"${late ? " open" : ""}><summary>Je n’ai rien reçu sur mon téléphone</summary>
      <ul>
        <li>Garde ton téléphone allumé, déverrouillé et avec du réseau.</li>
        <li>Vérifie que le numéro est bien celui de ton compte ${esc(detected)}.</li>
        <li>Vérifie que tu as assez de solde <b>en dollars (USD)</b> sur ce compte.</li>
        <li>Regarde dans le menu ${esc(detected)} de ton téléphone si une demande de paiement est en attente.</li>
        <li>Si la demande a expiré, ferme cette fenêtre et clique à nouveau sur « Payer ».</li>
      </ul></details>
    <p class="muted" style="font-size:13px;margin-top:10px">Ne ferme pas cette page. Elle se met à jour toute seule. Référence ${esc(o.ref)}.</p>
    <div class="pm-actions"><button class="btn btn-ghost btn-sm" data-close>Fermer cette fenêtre</button></div>`}`;
}

function showOrder(o) {
  if (o.status === "paid" || o.status === "failed" || o.status === "cancelled") {
    const btn = $("#payBtn"); if (btn) { btn.classList.remove("is-loading"); }
  }
  const dismissed = payCtx && payCtx.dismissed && o.status === "pending";
  if ($("#payModal") || (location.hash.startsWith("#/abonnements") && !dismissed)) openPayModal(o);
  const el = $("#payState"); if (!el) return;
  if (o.status === "paid") { el.innerHTML = `<div class="feedback" style="margin-bottom:14px;background:var(--hi)"><b style="color:var(--green)">Paiement confirmé.</b> ${o.items ? `Accès ouvert : ${o.items.map((i) => esc(i.title)).join(", ")}.` : ""} Référence ${esc(o.ref)}.</div>`; return; }
  if (o.status === "failed" || o.status === "cancelled") { el.innerHTML = `<div class="feedback" style="margin-bottom:14px"><b style="color:var(--bad)">Paiement non abouti.</b> ${esc(o.message || "")} Tu peux réessayer.</div>`; return; }
  el.innerHTML = `<div class="feedback" style="margin-bottom:14px"><b>Paiement en attente · ${money(o.amount)}</b><br>Confirme la demande sur ton téléphone. Référence ${esc(o.ref)}.</div>`;
}

async function pollOrder(ref) {
  const my = ++pollRun;
  for (let i = 0; i < 100 && my === pollRun; i++) { // environ 5 minutes
    try {
      const o = await api(`/api/orders/${encodeURIComponent(ref)}`);
      if (my !== pollRun) return;
      showOrder(o);
      if (o.status !== "pending") {
        if (o.status === "paid") { toast("Paiement confirmé"); S.catalog = null; if (location.hash.startsWith("#/abonnements")) { const keep = $("#layer").innerHTML; await render(); if (!$("#payModal")) $("#layer").innerHTML = keep; } }
        return;
      }
    } catch {}
    await sleep(3000);
  }
  if (my === pollRun && $("#payModal")) {
    $("#payModal").querySelector(".pm-status").innerHTML = `Pas encore de réponse de l’opérateur. Si tu as validé le paiement, ton cours s’activera automatiquement dans quelques minutes. Sinon, ferme cette fenêtre et réessaie.`;
  }
}

/* ================= Connexion ================= */
function vLogin(query) {
  const next = query.get("next") || "#/parcours";
  return `<div class="auth"><p class="eyebrow">Connexion</p><h1>Content de te revoir</h1>
    <form class="card" id="loginForm" data-next="${esc(next)}"><div class="field"><label for="l-email">Adresse électronique</label><input id="l-email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="l-pw">Mot de passe</label><input id="l-pw" type="password" autocomplete="current-password" required minlength="8"></div>
    <button class="btn btn-primary" style="width:100%">Se connecter</button><p class="err" id="formErr" role="alert"></p>
    <p class="muted" style="font-size:14px;margin-top:6px">Mot de passe oublié ? Écris à l’équipe NEXOMIA : elle t’enverra un lien de réinitialisation. <a href="#/recuperation">Administrateur ?</a></p></form>
    <p style="margin-top:16px;text-align:center">Pas encore de compte ? <a href="#/inscription?next=${encodeURIComponent(next)}">Créer un compte gratuit</a></p></div>`;
}
function vRegister(query) {
  const next = query.get("next") || "#/bienvenue";
  return `<div class="auth"><p class="eyebrow">Inscription gratuite</p><h1>Ton parcours commence</h1><p class="muted">Crée ton compte pour enregistrer ta progression. La première leçon de chaque cours est gratuite.</p>
    <form class="card" id="registerForm" data-next="${esc(next)}"><div class="field"><label for="r-name">Nom complet</label><input id="r-name" autocomplete="name" required minlength="2"></div>
    <div class="field"><label for="r-email">Adresse électronique</label><input id="r-email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="r-phone">Téléphone (facultatif)</label><input id="r-phone" inputmode="tel" autocomplete="tel" placeholder="+243 81 234 5678"></div>
    <div class="field"><label for="r-pw">Mot de passe</label><input id="r-pw" type="password" autocomplete="new-password" required minlength="8"><span class="hint">8 caractères au moins. Une phrase de trois mots est idéale.</span></div>
    <button class="btn btn-primary" style="width:100%">Créer mon compte</button><p class="err" id="formErr" role="alert"></p></form>
    <p style="margin-top:16px;text-align:center">Déjà un compte ? <a href="#/connexion?next=${encodeURIComponent(next)}">Se connecter</a></p></div>`;
}
function vRecover() {
  return `<div class="auth"><p class="eyebrow">Récupération administrateur</p><h1>Nouveau mot de passe</h1>
    <p class="muted">Réservé à l’administrateur. Utilise le code de récupération défini dans Railway (variable ADMIN_RECOVERY_CODE).</p>
    <form class="card" id="recoverForm" autocomplete="off"><div class="field"><label for="rc-email">Adresse électronique administrateur</label><input id="rc-email" type="email" autocomplete="username" required></div>
    <div class="field"><label for="rc-code">Code de récupération</label><input id="rc-code" type="password" autocomplete="off" required minlength="12"></div>
    <div class="field"><label for="rc-pw">Nouveau mot de passe</label><input id="rc-pw" type="password" autocomplete="new-password" required minlength="8"><span class="hint">8 caractères au moins. Note-le dans un endroit sûr.</span></div>
    <button class="btn btn-primary" style="width:100%">Enregistrer le nouveau mot de passe</button><p class="err" id="formErr" role="alert"></p></form></div>`;
}
function vReset(token) {
  return `<div class="auth"><p class="eyebrow">Nouveau mot de passe</p><h1>Choisis un nouveau mot de passe</h1>
    <form class="card" id="resetForm" data-token="${esc(token)}"><div class="field"><label for="p-pw">Nouveau mot de passe</label><input id="p-pw" type="password" autocomplete="new-password" required minlength="8"></div>
    <button class="btn btn-primary" style="width:100%">Enregistrer</button><p class="err" id="formErr" role="alert"></p></form></div>`;
}

/* ================= Studio ================= */
const STATUS_FR = { draft: ["Brouillon", "st-draft"], review: ["En revue", "st-review"], published: ["Publié", "st-pub"], archived: ["Archivé", "st-draft"] };
let studioMeta = null;
async function getMeta() { if (!studioMeta) studioMeta = await api("/api/studio/meta"); return studioMeta; }
async function vStudio() {
  const [{ courses }, meta] = await Promise.all([api("/api/studio/courses"), getMeta()]);
  const rev = can("reviewer");
  return `<p class="eyebrow">NEXOMIA Studio · ${esc(ROLE_FR[S.me.role])}</p><h1 style="font-size:clamp(30px,4vw,44px);margin:8px 0 6px">Créer et publier des cours</h1>
  <p class="muted" style="max-width:64ch">Crée un cours dans n’importe quel domaine, sans développeur. Chaque ligne devient une phrase audio avec sa traduction et un exercice d’écoute. Tu peux ensuite enregistrer la vraie voix de chaque phrase.</p>
  <div class="flow" style="margin-top:14px"><span class="on">Brouillon</span>›<span class="on">En revue</span>›<span class="on">Publié</span>›<span>Archivé</span></div>
  <div class="studio" style="margin-top:12px">
    <form class="card" id="newCourse" autocomplete="off"><h3 style="font-size:20px;margin-bottom:14px">Nouveau cours</h3>
      <div class="two"><div class="field"><label for="n-domain">Domaine</label><input id="n-domain" list="domains" required value="Langues"><datalist id="domains">${meta.domains.map((d) => `<option value="${esc(d)}">`).join("")}</datalist><span class="hint">Choisis ou écris un nouveau domaine.</span></div>
        <div class="field"><label for="n-template">Gabarit</label><select id="n-template">${meta.templates.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div></div>
      <div class="two"><div class="field"><label for="n-title">Titre du cours</label><input id="n-title" required placeholder="Swahili"></div><div class="field"><label for="n-level">Niveau</label><input id="n-level" placeholder="Débutant · A1"></div></div>
      <div class="field"><label for="n-desc">Description</label><input id="n-desc" placeholder="Ce que l’apprenant saura faire à la fin"></div>
      <div class="two"><div class="field"><label for="n-lang">Langue de l’audio</label><select id="n-lang">${Object.entries(meta.langs).map(([k, v]) => `<option value="${k}" ${k === "sw-KE" ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div><div class="field"><label for="n-ltitle">Première leçon</label><input id="n-ltitle" placeholder="Salutations"></div></div>
      <div class="field"><label for="n-lines">Phrases audio</label><textarea id="n-lines" spellcheck="false" placeholder="Habari yako? | Comment vas-tu ?&#10;Nzuri sana, asante. | Très bien, merci."></textarea><span class="hint">Une phrase par ligne : <code>phrase | traduction</code>. Préfixe <code>A:</code>, <code>B:</code> ou <code>N:</code> pour choisir la voix.</span></div>
      <button class="btn btn-primary">Créer le brouillon</button><p class="err" id="formErr" role="alert"></p></form>
    <div class="card"><h3 style="font-size:20px">${rev ? "Tous les cours" : "Mes cours"}</h3>
      ${courses.length ? `<div class="slist" style="margin-top:12px">${courses.map((c) => `<div class="sitem"><div style="min-width:0"><b>${esc(c.title)}</b><br><small class="muted">${esc(c.domain)} · ${c.lessons} leçon${c.lessons > 1 ? "s" : ""}${c.author ? ` · ${esc(c.author)}` : ""}</small></div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="status ${STATUS_FR[c.status][1]}">${STATUS_FR[c.status][0]}</span>${rev && c.status === "review" ? `<button class="btn btn-primary btn-sm" data-decide="${c.id}" data-action="publish">Publier</button>` : ""}<a class="btn btn-ghost btn-sm" href="#/studio/${c.id}">Ouvrir</a></div></div>`).join("")}</div>`
      : `<p class="empty" style="margin-top:12px">Aucun cours pour l’instant. Crée ton premier cours avec le formulaire.</p>`}
    </div></div>`;
}
const linesOf = (l) => l.sentences.map((s) => `${s.speaker}: ${s.text}${s.translation ? " | " + s.translation : ""}`).join("\n");
async function vStudioCourse(id) {
  const [{ course: c, lessons, editable }, meta] = await Promise.all([api(`/api/studio/courses/${id}`), getMeta()]);
  const rev = can("reviewer");
  const st = STATUS_FR[c.status];
  return `<a class="back" href="#/studio">${I.back} Studio</a>
  <div class="sec-h" style="margin-bottom:10px"><div><p class="eyebrow">${esc(c.domain)} · ${esc(c.code)}</p><h1 style="font-size:clamp(30px,4vw,44px);margin-top:6px">${esc(c.title)} <span class="status ${st[1]}" style="font-size:14px;vertical-align:middle">${st[0]}</span></h1></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${lessons[0] ? `<a class="btn btn-ghost btn-sm" href="#/lecon/${lessons[0].id}">Aperçu apprenant</a>` : ""}
      ${c.status === "draft" ? `<button class="btn btn-primary btn-sm" data-submit="${c.id}">Soumettre à la revue</button>` : ""}
      ${rev && c.status === "review" ? `<button class="btn btn-primary btn-sm" data-decide="${c.id}" data-action="publish">Publier</button><button class="btn btn-ghost btn-sm" data-decide="${c.id}" data-action="reject">Renvoyer en brouillon</button>` : ""}
      ${rev && c.status === "published" ? `<button class="btn btn-ghost btn-sm" data-decide="${c.id}" data-action="unpublish">Retirer du catalogue</button>` : ""}
      ${rev && c.status !== "archived" ? `<button class="btn btn-ghost btn-sm" data-decide="${c.id}" data-action="archive">Archiver</button>` : ""}
      ${rev && c.status === "archived" ? `<button class="btn btn-ghost btn-sm" data-decide="${c.id}" data-action="reject">Restaurer en brouillon</button>` : ""}</div></div>
  ${c.review_note ? `<div class="review-note"><b>Note du responsable pédagogique :</b> ${esc(c.review_note)}</div>` : ""}
  ${!editable ? `<div class="review-note">${c.status === "review" ? "Ce cours est en revue. Tu pourras le modifier s’il est renvoyé en brouillon." : "Ce cours est publié : seul un responsable pédagogique peut le modifier."}</div>` : ""}
  <div class="studio">
    <div style="display:grid;gap:18px;min-width:0">
      ${lessons.map((l) => `<div class="card"><form class="lessonForm" data-lesson="${l.id}">
        <div class="two"><div class="field"><label for="lt-${l.id}">Leçon ${l.position}</label><input id="lt-${l.id}" name="title" value="${esc(l.title)}" ${editable ? "" : "disabled"}></div><div class="field"><label for="ld-${l.id}">Durée (min)</label><input id="ld-${l.id}" name="duration_min" type="number" min="1" max="120" value="${l.duration_min}" ${editable ? "" : "disabled"}></div></div>
        <div class="two"><div class="field"><label for="lm-${l.id}">Niveau / module</label><input id="lm-${l.id}" name="module" value="${esc(l.module || "")}" placeholder="A1 · Débutant" ${editable ? "" : "disabled"}></div>
        <div class="field"><label for="lg-${l.id}">Objectif affiché à la fin</label><input id="lg-${l.id}" name="goal" value="${esc(l.goal)}" ${editable ? "" : "disabled"}></div></div>
        <div class="field"><label for="ln-${l.id}">À retenir (explication)</label><textarea id="ln-${l.id}" name="notes" style="min-height:90px;font-family:var(--f-body)" ${editable ? "" : "disabled"}>${esc(l.notes || "")}</textarea><span class="hint">Texte simple. **gras** et lignes commençant par « - » pour une liste.</span></div>
        <div class="field"><label for="ll-${l.id}">Phrases</label><textarea id="ll-${l.id}" name="lines" spellcheck="false" ${editable ? "" : "disabled"}>${esc(linesOf(l))}</textarea></div>
        ${editable ? `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm">Enregistrer la leçon</button><button type="button" class="btn btn-ghost btn-sm" data-dellesson="${l.id}">Supprimer</button></div>` : ""}</form>
        <h4 style="margin:18px 0 8px">Voix enregistrées</h4>
        <div style="display:grid;gap:8px">${l.sentences.map((s) => `<div class="sent-edit"><div style="min-width:0"><span class="t">${esc(s.text)}</span><br><small>${s.audio ? `<span class="has-audio">● voix enregistrée</span>` : "Voix de synthèse de l’appareil"}</small></div>
          <div class="acts"><button class="pbtn" style="background:var(--surface-2);color:var(--ink);border-color:var(--line)" data-preview="${esc(s.audio || "")}" data-text="${esc(s.text)}" data-lang="${esc(c.lang)}" aria-label="Écouter">${I.spk}</button>
          ${editable ? `<label class="btn btn-ghost btn-sm file-btn">${s.audio ? "Remplacer" : "Ajouter l’audio"}<input type="file" accept="audio/*" data-upload="${s.id}"></label>${s.audio ? `<button class="btn btn-ghost btn-sm" data-delaudio="${s.id}">Retirer</button>` : ""}` : ""}</div></div>`).join("")}</div>
      </div>`).join("") || `<div class="empty">Aucune leçon. Ajoute la première avec le formulaire.</div>`}
    </div>
    <div style="display:grid;gap:18px;align-content:start;min-width:0">
      ${editable ? `<form class="card" id="courseMeta" data-course="${c.id}"><h3 style="font-size:18px;margin-bottom:12px">Informations du cours</h3>
        <div class="field"><label for="m-title">Titre</label><input id="m-title" value="${esc(c.title)}"></div>
        <div class="two"><div class="field"><label for="m-domain">Domaine</label><input id="m-domain" list="domains2" value="${esc(c.domain)}"><datalist id="domains2">${meta.domains.map((d) => `<option value="${esc(d)}">`).join("")}</datalist></div><div class="field"><label for="m-level">Niveau</label><input id="m-level" value="${esc(c.level)}"></div></div>
        <div class="field"><label for="m-lang">Langue de l’audio</label><select id="m-lang">${Object.entries(meta.langs).map(([k, v]) => `<option value="${k}" ${k === c.lang ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>
        <div class="field"><label for="m-desc">Description</label><input id="m-desc" value="${esc(c.description)}"></div>
        <button class="btn btn-ghost btn-sm">Enregistrer</button></form>
      <form class="card" id="addLesson" data-course="${c.id}"><h3 style="font-size:18px;margin-bottom:12px">Ajouter une leçon</h3>
        <div class="field"><label for="a-title">Titre</label><input id="a-title" required></div>
        <div class="two"><div class="field"><label for="a-module">Niveau / module</label><input id="a-module" placeholder="A1 · Débutant" value="${esc((lessons[lessons.length - 1] || {}).module || "")}"></div>
        <div class="field"><label for="a-goal">Objectif</label><input id="a-goal" placeholder="Tu sais maintenant…"></div></div>
        <div class="field"><label for="a-notes">À retenir (explication)</label><textarea id="a-notes" style="min-height:80px;font-family:var(--f-body)" placeholder="**to be** : I am, you are…"></textarea></div>
        <div class="field"><label for="a-lines">Phrases</label><textarea id="a-lines" spellcheck="false" required placeholder="phrase | traduction"></textarea></div>
        <button class="btn btn-primary btn-sm">Ajouter la leçon</button><p class="err" id="formErr" role="alert"></p></form>` : ""}
      <div class="card"><h3 style="font-size:18px">Normes audio</h3><p class="muted" style="font-size:14px;margin-top:6px">MP3 ou M4A, mono, 96 kbit/s, volume normalisé à −16 LUFS, 8 Mo maximum par phrase. Locuteur natif, pièce calme, 0,3 s de silence au début et à la fin.</p></div>
    </div></div>`;
}

/* ================= Administration ================= */
let adminTab = "overview";
async function vAdmin() {
  const head = `<p class="eyebrow">Administration</p><h1 style="font-size:clamp(30px,4vw,44px);margin:8px 0 6px">Pilotage NEXOMIA</h1>
    <div class="tabs" role="group">${[["overview", "Vue d’ensemble"], ["users", "Utilisateurs"], ["orders", "Paiements"]].map(([k, l]) => `<button data-atab="${k}" aria-pressed="${adminTab === k}">${l}</button>`).join("")}</div>`;
  if (adminTab === "users") {
    const [{ users, roles }, cat] = [await api(`/api/admin/users?q=${encodeURIComponent(S.adminQ || "")}`), await loadCatalog()];
    return head + `<form id="userSearch" style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap"><input id="u-q" class="chip" style="flex:1;min-width:200px;font-weight:400;padding:10px 14px" placeholder="Rechercher un nom ou une adresse" value="${esc(S.adminQ || "")}"><button class="btn btn-ghost btn-sm">Rechercher</button></form>
    <div class="table-wrap"><table class="t"><thead><tr><th>Nom</th><th>Contact</th><th>Rôle</th><th>Abonnements</th><th>Actions</th></tr></thead><tbody>
    ${users.map((u) => `<tr><td><b>${esc(u.name)}</b><br><small class="muted">Inscrit le ${fmtD(u.created_at)}</small>${u.suspended ? `<br><span class="status st-review">Suspendu</span>` : ""}</td><td>${esc(u.email)}<br><small class="muted">${esc(u.phone || "")}</small></td>
      <td><select data-role="${u.id}" aria-label="Rôle de ${esc(u.name)}">${roles.map((r) => `<option value="${r}" ${r === u.role ? "selected" : ""}>${ROLE_FR[r]}</option>`).join("")}</select></td><td class="num">${u.subs}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-resetlink="${u.id}">Lien mot de passe</button><select data-grant="${u.id}" aria-label="Offrir un mois de cours"><option value="">Bourse : offrir 1 mois…</option>${cat.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}</select><button class="btn btn-ghost btn-sm" data-suspend="${u.id}" data-val="${u.suspended ? 0 : 1}">${u.suspended ? "Réactiver" : "Suspendre"}</button></td></tr>`).join("")}
    </tbody></table></div><div id="resetOut"></div>`;
  }
  if (adminTab === "orders") {
    const { orders } = await api("/api/admin/orders");
    return head + `<div class="table-wrap"><table class="t"><thead><tr><th>Date</th><th>Apprenant</th><th>Cours</th><th>Moyen</th><th>Montant</th><th>Statut</th><th></th></tr></thead><tbody>
    ${orders.map((o) => `<tr><td>${fmtD(o.created_at)}<br><small class="muted">${esc(o.ref)}</small></td><td>${esc(o.user)}<br><small class="muted">${esc(o.phone || o.email)}</small></td><td>${o.items.map((i) => esc(i.title)).join(", ")}</td><td>${esc(o.method)}${o.provider === "test" ? `<br><small class="muted">test</small>` : ""}</td><td class="num">${money(o.amount)}</td>
      <td><span class="status ${o.status === "paid" ? "st-pub" : o.status === "pending" ? "st-review" : "st-draft"}">${{ paid: "Payé", pending: "En attente", failed: "Échoué", cancelled: "Expiré" }[o.status]}</span>${o.message ? `<br><small class="muted">${esc(o.message)}</small>` : ""}</td>
      <td>${o.status === "pending" && (o.provider === "flexpay" || o.provider === "pawapay") ? `<button class="btn btn-ghost btn-sm" data-verify="${esc(o.ref)}">Vérifier</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">Aucun paiement pour l’instant.</td></tr>`}
    </tbody></table></div>`;
  }
  const o = await api("/api/admin/overview");
  return head + `<div class="kpis">
    <div class="kpi"><b>${o.users}</b><small>comptes</small></div><div class="kpi"><b>${o.activeSubscribers}</b><small>abonnés actifs</small></div><div class="kpi"><b>${o.activeSubscriptions}</b><small>abonnements actifs</small></div>
    <div class="kpi"><b>${money(o.revenue30)}</b><small>encaissés sur 30 jours</small></div><div class="kpi"><b>${o.lessonsCompleted}</b><small>leçons validées</small></div><div class="kpi"><b>${String(o.listeningHours).replace(".", ",")}</b><small>heures d’écoute</small></div>
    <div class="kpi"><b>${o.pendingOrders}</b><small>paiements en attente</small></div><div class="kpi"><b>${o.inReview}</b><small>cours en revue</small></div></div>
  <div class="dash"><form class="card" id="pricingForm"><h3 style="font-size:20px">Tarif dégressif</h3><p class="muted" style="font-size:14px;margin:6px 0 14px">Prix total d’une commande selon le nombre de cours payés ensemble. Au-delà du dernier palier, chaque cours ajoute le montant indiqué.</p>
      <div class="two">${o.pricing.tiers.map((t, i) => `<div class="field"><label for="tier-${i}">${i + 1} cours (USD)</label><input id="tier-${i}" data-tier type="number" min="0.5" step="0.5" value="${t}"></div>`).join("")}<div class="field"><label for="tier-extra">Chaque cours en plus (USD)</label><input id="tier-extra" type="number" min="0.5" step="0.5" value="${o.pricing.extra}"></div></div>
      <button class="btn btn-primary btn-sm">Enregistrer le tarif</button><p class="err" id="formErr" role="alert"></p></form>
    <div class="card"><h3 style="font-size:20px">Paiements</h3><p style="margin-top:8px">Mode actuel : <b>${{ pawapay: "pawaPay (réel)", flexpay: "FlexPaie (réel)", test: "Test (simulation)" }[o.payments] || "Fermé"}</b></p>
      <p class="muted" style="font-size:14px;margin-top:8px">${o.payments === "test" ? "Pour activer les vrais paiements, renseigne PAWAPAY_TOKEN (ou FLEXPAY_TOKEN et FLEXPAY_MERCHANT) dans Railway." : "Les paiements sont vérifiés auprès du prestataire avant toute activation. Fais un paiement réel de faible montant par réseau avant d’ouvrir au public."}</p></div></div>`;
}

/* ================= Événements ================= */
document.addEventListener("click", async (e) => {
  const t = e.target.closest("button,[data-seek],a[data-close],a[data-subscribe],a[data-jump]"); if (!t) return;
  const ds = t.dataset;
  if (ds.close !== undefined || ds.retry !== undefined) { if ($("#payModal") && payCtx) payCtx.dismissed = true; $("#layer").innerHTML = ""; if (ds.retrypay !== undefined) { pollRun++; payCtx = null; render(); return; } if (ds.retry !== undefined) { Q.state = newQuizState(); $("#quiz").innerHTML = quizHTML(); P.mode = "phrase"; playFrom(0); } if (t.tagName !== "A") return; }
  if (ds.reload !== undefined) return render();
  if (ds.jump) { e.preventDefault(); const el = document.getElementById(ds.jump); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
  if (ds.theme !== undefined) { const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; r.dataset.theme = dark ? "light" : "dark"; store.set("theme", r.dataset.theme); return; }
  if (ds.logout !== undefined) { await api("/api/auth/logout", { method: "POST" }).catch(() => {}); S.me = null; S.catalog = null; stopPlay(); P.data = null; location.hash = "#/"; render(); return; }
  if (t.id === "heroPlay") return heroPlay();
  if (ds.hl) { heroRun++; Speech.stop(); heroLang = ds.hl; return render(); }
  if (ds.filter) { S.filter = ds.filter; return render(); }
  if (ds.subscribe) { e.preventDefault(); const id = +ds.subscribe; if (!S.cart.includes(id)) S.cart.push(id); store.set("cart", S.cart); location.hash = "#/abonnements"; return; }
  // Lecteur
  if (ds.pp !== undefined) return togglePlay();
  if (ds.sent) return playFrom(+ds.sent);
  if (ds.seek) return playFrom(+ds.seek);
  if (ds.step) { const n = Math.max(0, Math.min(P.data.lesson.sentences.length - 1, P.idx + +ds.step)); if (P.playing) playFrom(n); else { P.idx = n; paintPlayer(); } return; }
  if (ds.rate) { P.rate = +ds.rate; store.set("rate", P.rate); if (P.playing) playFrom(P.idx); else paintPlayer(); return; }
  if (ds.toggle) { const k = ds.toggle; if (k === "mode") P.mode = P.mode === "phrase" ? "continu" : "phrase"; if (k === "repeat") P.repeat = !P.repeat; if (k === "loop") P.loop = !P.loop; if (k === "tr") { P.showTr = !P.showTr; $("#transcript").classList.toggle("hide-tr", !P.showTr); } return paintPlayer(); }
  if (ds.say) { stopPlay(); const lang = P.data ? P.data.course.lang : "fr-FR"; const s = P.data && P.data.lesson.sentences.find((x) => x.text === ds.say); return playSentence(s || { text: ds.say }, lang, P.rate); }
  if (ds.offline) return downloadOffline(ds.offline, t);
  if (ds.ptstart !== undefined) { PT.i = 0; PT.picked = null; $("#ptest").innerHTML = placementHTML(); return; }
  if (ds.ptquit !== undefined) { if (PT.i > 0) return placementFinish(); location.hash = `#/cours/${PT.slug}`; return; }
  if (ds.ptsay) return playSentence({ text: ds.ptsay }, PT.data.course.lang, 0.95);
  if (ds.ptpick !== undefined) { if (PT.picked !== null) return; const q = PT.q[PT.i]; PT.picked = +ds.ptpick; if (PT.picked === q.answer) PT.byLevel[q.level] = (PT.byLevel[q.level] || 0) + 1; $("#ptest").innerHTML = placementHTML(); const nb = $("[data-ptnext]"); if (nb) nb.focus({ preventScroll: true }); return; }
  if (ds.ptnext !== undefined) return placementNext();
  if (ds.obmotive) { OB.motive = ds.obmotive; $("#onb").innerHTML = welcomeHTML(); return; }
  if (ds.obgoal) { OB.goal = +ds.obgoal; $("#onb").innerHTML = welcomeHTML(); return; }
  if (ds.obnext !== undefined) { OB.step++; $("#onb").innerHTML = welcomeHTML(); return; }
  if (ds.obback !== undefined) { OB.step = Math.max(0, OB.step - 1); $("#onb").innerHTML = welcomeHTML(); return; }
  if (ds.obfinish) return welcomeFinish(ds.obfinish);
  if (ds.setgoal) { try { await api("/api/me/profile", { method: "PUT", body: { daily_goal: +ds.setgoal } }); S.me.daily_goal = +ds.setgoal; toast("Objectif du jour : " + ds.setgoal + " points"); render(); } catch (err) { toast(err.message, true); } return; }
  if (ds.flip !== undefined) { RV.flipped = !RV.flipped; $("#review").innerHTML = reviewHTML(); return; }
  if (ds.rvsay !== undefined) { const it = RV.items[RV.i]; return playSentence({ text: it.item }, it.lang, 1); }
  if (ds.rvgrade !== undefined) return reviewGrade(ds.rvgrade === "1");
  if (ds.print !== undefined) { window.print(); return; }
  if (ds.mic !== undefined) return startMic();
  if (ds.spsay !== undefined) { const s0 = speakSentences()[SP.i]; stopPlay(); return playSentence(s0, P.data.course.lang, P.rate); }
  if (ds.spstep) { const n0 = speakSentences().length; SP.i = Math.max(0, Math.min(n0 - 1, SP.i + +ds.spstep)); SP.result = null; if (SP.rec && SP.listening) SP.rec.abort(); paintSpeak(); return; }
  if (ds.sayslow) { stopPlay(); return playSentence({ text: ds.sayslow }, P.data.course.lang, 0.6); }
  if (ds.pick !== undefined && t.closest("#quiz")) {
    if (Q.state.result !== null) return;
    const q = Q.items[Q.state.i]; Q.state.picked = +ds.pick;
    return answerItem(+ds.pick === q.answer, q.type === "gap" ? `La phrase complète : « ${esc(q.say)} »` : md(q.explanation));
  }
  if (ds.tile !== undefined) { Q.state.chosen.push(+ds.tile); $("#quiz").innerHTML = quizHTML(); return; }
  if (ds.untile !== undefined) { Q.state.chosen.splice(+ds.untile, 1); $("#quiz").innerHTML = quizHTML(); return; }
  if (ds.check !== undefined && Q.state.result === null) {
    const q = Q.items[Q.state.i];
    if (q.type === "order") { const okk = norm(Q.state.chosen.map((k) => q.tiles[k].w).join(" ")) === norm(q.text); playSentence({ text: q.text }, P.data.course.lang, P.rate); return answerItem(okk, okk ? `« ${esc(q.text)} »` : `L’ordre correct : « ${esc(q.text)} »`); }
    if (q.type === "dict") { const v = ($("#dictIn") || {}).value || ""; if (!v.trim()) { toast("Écris d’abord ce que tu entends."); return; } Q.state.typed = v; const sc = dictScore(v, q.text); return answerItem(sc >= 0.85, sc === 1 ? "Aucune faute." : sc >= 0.85 ? "Presque parfait : compare avec la phrase ci-dessous." : "Compare avec la bonne phrase, puis réécoute-la."); }
  }
  if (ds.qnext !== undefined) { if (Q.state.i + 1 < Q.items.length) { const m = Q.state.marks, c0 = Q.state.correct; Q.state = { ...newQuizState(), i: Q.state.i + 1, correct: c0, marks: m }; $("#quiz").innerHTML = quizHTML(); } else finishLesson(); return; }
  if (ds.finish !== undefined) return finishLesson();
  // Abonnements
  if (ds.cart) { const id = +ds.cart; S.cart = S.cart.includes(id) ? S.cart.filter((x) => x !== id) : S.cart.concat(id); store.set("cart", S.cart); return render(); }
  if (ds.pm) { const ph = $("#f-phone"); if (ph) store.set("phone", ph.value); S.payMethod = ds.pm; return render(); }
  if (t.id === "payBtn") return pay(t);
  if (ds.testpay) { t.disabled = true; try { const o = await api(`/api/orders/${encodeURIComponent(ds.testpay)}/test-result`, { method: "POST", body: { result: ds.result } }); showOrder(o); if (o.status === "paid") { toast("Paiement confirmé (test)"); S.catalog = null; const keep = $("#layer").innerHTML; await render(); if (!$("#payModal")) $("#layer").innerHTML = keep; } } catch (err) { toast(err.message, true); } return; }
  // Studio
  if (ds.preview !== undefined) { return playSentence({ audio: ds.preview || null, text: ds.text }, ds.lang, 1); }
  if (ds.submit) { try { await api(`/api/studio/courses/${ds.submit}/submit`, { method: "POST" }); toast("Cours soumis à la revue"); render(); } catch (err) { toast(err.message, true); } return; }
  if (ds.decide) {
    const action = ds.action; let note = null;
    if (action === "reject") { note = window.prompt ? window.prompt("Note pour le créateur (facultatif) :") : null; }
    try { await api(`/api/studio/courses/${ds.decide}/decision`, { method: "POST", body: { action, note } }); toast({ publish: "Cours publié dans le catalogue", reject: "Cours renvoyé en brouillon", archive: "Cours archivé", unpublish: "Cours retiré du catalogue" }[action]); S.catalog = null; render(); } catch (err) { toast(err.message, true); }
    return;
  }
  if (ds.dellesson) { if (!confirm("Supprimer cette leçon et ses audios ?")) return; try { await api(`/api/studio/lessons/${ds.dellesson}`, { method: "DELETE" }); toast("Leçon supprimée"); render(); } catch (err) { toast(err.message, true); } return; }
  if (ds.delaudio) { try { await api(`/api/studio/sentences/${ds.delaudio}/audio`, { method: "DELETE" }); toast("Audio retiré"); render(); } catch (err) { toast(err.message, true); } return; }
  // Admin
  if (ds.atab) { adminTab = ds.atab; return render(); }
  if (ds.resetlink) { try { const r = await api(`/api/admin/users/${ds.resetlink}/reset-link`, { method: "POST" }); $("#resetOut").innerHTML = `<div class="card" style="margin-top:14px"><b>Lien à transmettre à la personne (valable 48 h) :</b><p style="margin-top:8px;word-break:break-all;font-family:var(--f-mono);font-size:13px;user-select:all">${esc(r.url)}</p><button class="btn btn-ghost btn-sm" style="margin-top:10px" data-copy="${esc(r.url)}">Copier</button></div>`; } catch (err) { toast(err.message, true); } return; }
  if (ds.copy) { try { await navigator.clipboard.writeText(ds.copy); toast("Lien copié"); } catch { toast("Sélectionne le lien pour le copier"); } return; }
  if (ds.suspend) { try { await api(`/api/admin/users/${ds.suspend}`, { method: "PUT", body: { suspended: ds.val === "1" } }); toast(ds.val === "1" ? "Compte suspendu" : "Compte réactivé"); render(); } catch (err) { toast(err.message, true); } return; }
  if (ds.verify) { try { const o = await api(`/api/admin/orders/${encodeURIComponent(ds.verify)}/verify`, { method: "POST" }); toast(`Statut : ${o.status}`); render(); } catch (err) { toast(err.message, true); } return; }
});

document.addEventListener("change", async (e) => {
  const t = e.target;
  if (t.dataset.upload) {
    const f = t.files[0]; if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast("Fichier trop lourd : 8 Mo maximum.", true); return; }
    toast("Envoi de l’audio…");
    try { await api(`/api/studio/sentences/${t.dataset.upload}/audio`, { method: "PUT", raw: f, type: f.type || "audio/mpeg" }); toast("Audio enregistré"); render(); } catch (err) { toast(err.message, true); }
  }
  if (t.dataset.role) { try { await api(`/api/admin/users/${t.dataset.role}`, { method: "PUT", body: { role: t.value } }); toast("Rôle mis à jour"); } catch (err) { toast(err.message, true); render(); } }
  if (t.dataset.grant && t.value) { try { await api(`/api/admin/users/${t.dataset.grant}/grant`, { method: "POST", body: { courseId: +t.value } }); toast("Bourse accordée : un mois offert"); render(); } catch (err) { toast(err.message, true); } }
});

document.addEventListener("submit", async (e) => {
  const f = e.target; e.preventDefault();
  const err = (m) => { const el = f.querySelector("#formErr") || $("#formErr"); if (el) el.textContent = m; else toast(m, true); };
  const btn = f.querySelector("button:not([type=button])"); if (btn) btn.disabled = true;
  try {
    if (f.id === "loginForm") { const r = await api("/api/auth/login", { method: "POST", body: { email: $("#l-email").value, password: $("#l-pw").value } }); S.me = r.user; S.catalog = null; await sendPendingPlacement(); location.hash = f.dataset.next; }
    else if (f.id === "registerForm") { const r = await api("/api/auth/register", { method: "POST", body: { name: $("#r-name").value, email: $("#r-email").value, phone: $("#r-phone").value, password: $("#r-pw").value } }); S.me = r.user; S.catalog = null; await sendPendingPlacement(); toast("Bienvenue dans NEXOMIA Academy"); location.hash = f.dataset.next || "#/bienvenue"; }
    else if (f.id === "recoverForm") { await api("/api/auth/admin-recover", { method: "POST", body: { email: $("#rc-email").value, code: $("#rc-code").value, password: $("#rc-pw").value } }); await boot(true); toast("Mot de passe enregistré. Pense à supprimer ADMIN_RECOVERY_CODE dans Railway."); location.hash = "#/admin"; }
    else if (f.id === "resetForm") { await api("/api/auth/reset", { method: "POST", body: { token: f.dataset.token, password: $("#p-pw").value } }); await boot(true); toast("Mot de passe enregistré"); location.hash = "#/parcours"; }
    else if (f.id === "newCourse") { const r = await api("/api/studio/courses", { method: "POST", body: { domain: $("#n-domain").value, template: $("#n-template").value, title: $("#n-title").value, level: $("#n-level").value, description: $("#n-desc").value, lang: $("#n-lang").value, lessonTitle: $("#n-ltitle").value, lines: $("#n-lines").value } }); studioMeta = null; toast("Brouillon créé"); location.hash = `#/studio/${r.id}`; }
    else if (f.id === "courseMeta") { await api(`/api/studio/courses/${f.dataset.course}`, { method: "PUT", body: { title: $("#m-title").value, domain: $("#m-domain").value, level: $("#m-level").value, lang: $("#m-lang").value, description: $("#m-desc").value } }); toast("Informations enregistrées"); render(); }
    else if (f.id === "addLesson") { await api(`/api/studio/courses/${f.dataset.course}/lessons`, { method: "POST", body: { title: $("#a-title").value, goal: $("#a-goal").value, lines: $("#a-lines").value, module: $("#a-module").value, notes: $("#a-notes").value } }); toast("Leçon ajoutée"); render(); }
    else if (f.classList.contains("lessonForm")) { const fd = new FormData(f); await api(`/api/studio/lessons/${f.dataset.lesson}`, { method: "PUT", body: Object.fromEntries(fd) }); toast("Leçon enregistrée"); render(); }
    else if (f.id === "userSearch") { S.adminQ = $("#u-q").value; render(); }
    else if (f.id === "pricingForm") { const tiers = [...f.querySelectorAll("[data-tier]")].map((i) => Number(i.value)); const r = await api("/api/admin/pricing", { method: "PUT", body: { tiers, extra: Number($("#tier-extra").value) } }); S.pricing = r.pricing; toast("Tarif enregistré"); }
  } catch (x) { err(x.message); }
  if (btn) btn.disabled = false;
});

window.addEventListener("hashchange", () => { $("#layer").innerHTML = ""; render(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#layer").innerHTML = ""; });

async function sendPendingPlacement() {
  const pp = store.get("pendingPlacement", null); if (!pp || !S.me) return;
  try { const r = await api("/api/me/placement", { method: "POST", body: pp }); S.me.placement = r.placement; } catch {}
  store.set("pendingPlacement", null);
}
async function boot(silent) {
  try { const r = await api("/api/me"); S.me = r.user; S.payments = r.payments; if (r.methods) S.methods = r.methods; } catch { S.me = null; }
  if (!silent) render();
}
(() => { const t = store.get("theme", null); if (t) document.documentElement.dataset.theme = t; })();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
boot();
})();
