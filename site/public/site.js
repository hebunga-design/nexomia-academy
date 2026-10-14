// NEXOMIA — langue FR/EN, menu mobile, formulaire de contact.
(function () {
  const EN = {
    "skip": "Skip to content", "menu": "Menu",
    "nav.sol": "Solidarity", "nav.svc": "Services", "nav.about": "About", "nav.contact": "Contact",
    "hero.place": "Lubumbashi, Democratic Republic of the Congo",
    "hero.h1": "Learn, build a business and connect with the world, from Katanga.",
    "hero.lead": "NEXOMIA trains young people, supports businesses and builds digital tools designed for the DRC: Mobile Money payments, modest connections, French and English.",
    "hero.cta1": "Discover NEXOMIA Academy", "hero.cta2": "Talk about a project", "hero.stone": "Katanga malachite",
    "ac.lead": "Our online school. Complete language courses, with audio and exercises, paid for by phone and taken at your own pace.",
    "ac.f1": "English lessons, from beginner (A1) to mastery (C2)",
    "ac.f2": "Professional English lessons: mining, customs, health, banking, logistics…",
    "ac.f3": "per course per month, paid with M-Pesa, Airtel Money or Orange Money",
    "ac.f4": "certificate at every level, verifiable online by any employer",
    "ac.cta1": "Start for free", "ac.cta2": "Test my level", "ac.note": "The first lesson of every course is free.",
    "ac.s1": "The placement test", "ac.s1t": "24 questions to find where to start.",
    "ac.s2": "One lesson a day", "ac.s2t": "Audio dialogue, grammar explained in French, corrected exercises, pronunciation with the microphone.",
    "ac.s3": "The end-of-level exam", "ac.s3t": "16 questions, 70% to pass.",
    "ac.s4": "The certificate", "ac.s4t": "A PDF in your name, with a public verification code.",
    "sol.h": "Every subscription supports a young person.",
    "sol.lead": "NEXOMIA works with vulnerable young people in Lubumbashi: orphans and unemployed youth. Academy subscriptions fund our field visits and our activities with them.",
    "sol.a": "Subscribe", "sol.at": "Learn English for yourself and move the work forward at the same time.", "sol.al": "Create my account",
    "sol.b": "Give a subscription", "sol.bt": "Pay a month of lessons for a young person who can't afford it. They receive a gift code.", "sol.bl": "Give a month",
    "sol.c": "Become a partner", "sol.ct": "Companies, foundations, churches, schools: sponsor a group of young people or host our activities.", "sol.cl": "Write to us",
    "svc.h": "What we do for businesses and organisations",
    "svc.d": "Digital services", "svc.dt": "We design, host and maintain tools that work in Congolese conditions. NEXOMIA Academy is our own product.",
    "svc.d1": "Websites and apps", "svc.d1t": "Company websites, web and mobile apps, fast even on a modest connection.",
    "svc.d2": "Mobile Money payments", "svc.d2t": "M-Pesa, Airtel Money and Orange Money payments built into your website or app.",
    "svc.d3": "Training platforms", "svc.d3t": "Online courses, learner tracking, exams and verifiable certificates.",
    "svc.d4": "Hosting and maintenance", "svc.d4t": "Domain names, professional email, backups and updates.",
    "svc.t": "Consulting and professional training", "svc.tt": "Tailored training for your teams, on your premises or online.",
    "svc.t1": "Professional English", "svc.t1t": "Programmes by trade: mining and safety, customs and logistics, health, banking, hospitality, NGOs.",
    "svc.t2": "Digital tools at work", "svc.t2t": "Email, shared documents, spreadsheets, password security.",
    "svc.t3": "Digital support", "svc.t3t": "Choosing the right tools, taking your business online, training the people who will use them.",
    "svc.cta": "Request a quote",
    "ab.h": "About",
    "ab.p1": "NEXOMIA SARL is a Congolese company based in Lubumbashi, founded by Héritier Ebunga Muloko.",
    "ab.p2": "We believe that languages and digital skills open doors: a first job, a client abroad, a scholarship. Our work is to make these tools accessible, in price, language and use, to the people who need them most.",
    "ct.h": "Write to us", "ct.lead": "A project, training for your team, a partnership? We reply within two working days.",
    "ct.name": "Name", "ct.email": "Email", "ct.phone": "Phone (optional)", "ct.topic": "Subject", "ct.msg": "Message",
    "ct.o1": "Website, app or quote", "ct.o2": "Training for a team", "ct.o3": "Solidarity partnership", "ct.o4": "Question about the Academy", "ct.o5": "Other",
    "ct.send": "Send the message",
  };
  const MSG = {
    fr: { sending: "Envoi en cours…", ok: "Message envoyé. Nous vous répondons sous deux jours ouvrables.", invalid: "Indiquez votre nom, une adresse e-mail valide et votre message.", net: "Pas de connexion. Réessayez, ou écrivez à headoffice@nexomia360.com.", title: "NEXOMIA · Formation et numérique à Lubumbashi", open: "Fermer", closed: "Menu" },
    en: { sending: "Sending…", ok: "Message sent. We will reply within two working days.", invalid: "Please enter your name, a valid email address and your message.", net: "No connection. Try again, or write to headoffice@nexomia360.com.", title: "NEXOMIA · Training and digital services in Lubumbashi", open: "Close", closed: "Menu" },
  };
  const FR = {};
  document.querySelectorAll("[data-i]").forEach((el) => { FR[el.dataset.i] = el.textContent; });
  let lang = "fr";
  function setLang(l) {
    lang = l === "en" ? "en" : "fr";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i]").forEach((el) => { const k = el.dataset.i; el.textContent = lang === "en" ? (EN[k] || FR[k]) : FR[k]; });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.title = MSG[lang].title;
    try { localStorage.setItem("nx-lang", lang); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem("nx-lang"); } catch (e) {}
  if (location.pathname.startsWith("/en")) saved = "en";
  if (saved === "en") setLang("en");
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  // Menu mobile
  const menu = document.querySelector(".menu"), nav = document.getElementById("nav");
  menu.addEventListener("click", () => { const open = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); menu.textContent = open ? MSG[lang].open : MSG[lang].closed; });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); menu.textContent = MSG[lang].closed; } });

  // Les liens « Nous écrire » / « Demander un devis » préremplissent le sujet.
  const form = document.getElementById("form");
  document.querySelectorAll("[data-topic]").forEach((a) => a.addEventListener("click", () => { form.topic.value = a.dataset.topic; }));

  const status = form.querySelector(".status"), btn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    status.className = "status";
    if (!d.name.trim() || !d.message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) { status.textContent = MSG[lang].invalid; status.classList.add("err"); return; }
    btn.disabled = true; status.textContent = MSG[lang].sending;
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { status.textContent = MSG[lang].ok; status.classList.add("ok"); form.reset(); }
      else { status.textContent = j.error || MSG[lang].net; status.classList.add("err"); }
    } catch (err) { status.textContent = MSG[lang].net; status.classList.add("err"); }
    btn.disabled = false;
  });
  document.getElementById("year").textContent = new Date().getFullYear();
})();
