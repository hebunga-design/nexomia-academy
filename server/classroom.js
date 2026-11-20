// Classe virtuelle intégrée : visioconférence Jitsi hébergée par 8x8 (JaaS), affichée dans l'application.
// Variables Railway : JAAS_APP_ID (vpaas-magic-cookie-…), JAAS_KID (identifiant de la clé API), JAAS_PRIVATE_KEY (clé privée PEM).
// L'accès est contrôlé par un jeton signé ici : seuls les abonnés actifs du cours (et l'équipe) peuvent entrer.
const crypto = require("node:crypto");

const appId = () => String(process.env.JAAS_APP_ID || "").trim();
const kid = () => { const k = String(process.env.JAAS_KID || "").trim(); return k.includes("/") ? k : (appId() && k ? `${appId()}/${k}` : ""); };
const privateKey = () => String(process.env.JAAS_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();
const enabled = () => !!(appId() && kid() && privateKey().includes("PRIVATE KEY"));
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

function roomFor(sessionId) { return `nexomia-classe-${sessionId}`; }

// Jeton valable 4 heures pour une salle précise.
function token(user, room, moderator) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", kid: kid(), typ: "JWT" };
  const payload = {
    aud: "jitsi", iss: "chat", sub: appId(), room, nbf: now - 10, exp: now + 4 * 3600,
    context: {
      user: { id: String(user.id), name: user.name, email: user.email, avatar: "", moderator: moderator ? "true" : "false" },
      features: { livestreaming: "false", recording: "false", transcription: "false", "outbound-call": "false", "sip-outbound-call": "false" },
      room: { regex: false },
    },
  };
  const unsigned = `${b64(header)}.${b64(payload)}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), privateKey()).toString("base64url");
  return `${unsigned}.${sig}`;
}

module.exports = { enabled, appId, roomFor, token, domain: "8x8.vc" };
