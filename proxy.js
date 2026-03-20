// proxy.js — Proxy Gemini robuste (Railway/Render) — Node.js pur

const http  = require("http");
const https = require("https");

const PORT           = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ⚠️ obligatoire
const GEMINI_MODEL   = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// --- petits utilitaires ---
function sendJson(res, code, obj, extraHeaders = {}) {
  res.writeHead(code, { "Content-Type": "application/json", ...extraHeaders });
  res.end(JSON.stringify(obj));
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function getIp(req) {
  const xf = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.socket.remoteAddress || "unknown";
}

// --- rate limit simple (par IP, fenêtre glissante) ---
const windowMs = 60_000;       // 1 min
const maxPerWindow = 20;       // ajuste selon ton quota
const ipBuckets = new Map();   // ip -> { count, resetAt }

function rateLimitOk(ip) {
  const now = Date.now();
  const b = ipBuckets.get(ip);
  if (!b || now > b.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (b.count >= maxPerWindow) {
    const retryAfterSec = Math.ceil((b.resetAt - now) / 1000);
    return { ok: false, retryAfterSec };
  }
  b.count += 1;
  return { ok: true };
}

// --- appel Gemini avec retry backoff ---
async function callGemini(geminiBody, attempt = 0) {
  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(geminiBody),
    },
  };

  const { statusCode, headers, data } = await new Promise((resolve, reject) => {
    const gReq = https.request(options, gRes => {
      let raw = "";
      gRes.on("data", c => (raw += c));
      gRes.on("end", () => resolve({ statusCode: gRes.statusCode, headers: gRes.headers, data: raw }));
    });
    gReq.on("error", reject);
    gReq.write(geminiBody);
    gReq.end();
  });

  // Retry sur 429 / 503
  if ((statusCode === 429 || statusCode === 503) && attempt < 3) {
    const retryAfterHeader = headers["retry-after"];
    const retryAfterMs =
      retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;

    const backoffMs = Math.min(15000, 1000 * Math.pow(2, attempt)) + Math.floor(Math.random() * 250);
    await sleep(Math.max(retryAfterMs, backoffMs));
    return callGemini(geminiBody, attempt + 1);
  }

  return { statusCode, data, headers };
}

const server = http.createServer(async (req, res) => {
  // --- CORS ---
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (req.method === "GET") {
    return sendJson(res, 200, { status: "ok", message: "Proxy Gemini actif ✓" });
  }

  // Route unique
  if (req.method !== "POST" || req.url !== "/chat") {
    return sendJson(res, 404, { error: "Route non trouvée (utilise POST /chat)" });
  }

  // Clé absente => erreur claire
  if (!GEMINI_API_KEY) {
    return sendJson(res, 500, { error: "GEMINI_API_KEY non configurée sur le serveur." });
  }

  // Rate limit (serveur)
  const ip = getIp(req);
  const rl = rateLimitOk(ip);
  if (!rl.ok) {
    return sendJson(
      res,
      429,
      { error: "Trop de requêtes. Réessaie dans quelques secondes." },
      { "Retry-After": String(rl.retryAfterSec) }
    );
  }

  // Read body (limite taille)
  let body = "";
  req.on("data", chunk => {
    body += chunk;
    if (body.length > 200_000) req.destroy(); // anti abus
  });

  req.on("end", async () => {
    let payload;
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      return sendJson(res, 400, { error: "JSON invalide" });
    }

    // Sanitize / trim history côté serveur
    const history = Array.isArray(payload.history) ? payload.history : [];
    const trimmedHistory = history.slice(-10); // garde seulement les 10 derniers échanges

    const geminiBody = JSON.stringify({
      system_instruction: { parts: [{ text: payload.system || "" }] },
      contents: trimmedHistory,
      generationConfig: { maxOutputTokens: 220, temperature: 0.7 },
    });

    try {
      const g = await callGemini(geminiBody);
      // forward tel quel, mais tu peux aussi normaliser les erreurs
      res.writeHead(g.statusCode || 500, { "Content-Type": "application/json" });
      res.end(g.data);
    } catch (err) {
      console.error("Gemini error:", err.message);
      sendJson(res, 500, { error: err.message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Proxy Gemini actif → http://localhost:${PORT}`);
  console.log(`   GET  /     → health`);
  console.log(`   POST /chat  → chatbot`);
});
