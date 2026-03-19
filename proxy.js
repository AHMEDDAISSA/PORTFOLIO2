// ============================================================
//  proxy.js — Serveur proxy Gemini pour ton portfolio
//  Node.js pur, aucune dépendance npm requise
//
//  DÉMARRAGE LOCAL :
//    1. node proxy.js
//    2. Ouvre ton portfolio normalement dans le navigateur
//
//  HÉBERGEMENT GRATUIT (Railway / Render) :
//    - Push ce fichier + package.json sur GitHub
//    - Connecte le repo sur railway.app ou render.com
//    - Ajoute la variable d'env GEMINI_API_KEY
//    - Remplace PROXY_URL dans chatbot.js par l'URL fournie
// ============================================================

const http  = require("http");
const https = require("https");

// ── CONFIG ──────────────────────────────────────────────────
const PORT          = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const GEMINI_MODEL  = "gemini-2.0-flash";

// Origines autorisées (ajoute ton domaine en prod)
const ALLOWED_ORIGINS = [
  "http://localhost",
  "http://127.0.0.1",
  "null", // file:// ouvert localement
];
// ────────────────────────────────────────────────────────────

function isAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some(o => origin.startsWith(o));
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || "";

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin",  isAllowed(origin) ? (origin || "*") : "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  if (req.method === "POST" && req.url === "/chat") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      let payload;
      try { payload = JSON.parse(body); }
      catch { res.writeHead(400); return res.end(JSON.stringify({ error: "Invalid JSON" })); }

      const geminiBody = JSON.stringify({
        system_instruction: { parts: [{ text: payload.system }] },
        contents: payload.history,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
      });

      const options = {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(geminiBody) }
      };

      const geminiReq = https.request(options, geminiRes => {
        let data = "";
        geminiRes.on("data", c => data += c);
        geminiRes.on("end", () => {
          res.writeHead(geminiRes.statusCode, { "Content-Type": "application/json" });
          res.end(data);
        });
      });

      geminiReq.on("error", err => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });

      geminiReq.write(geminiBody);
      geminiReq.end();
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`\n✅ Proxy Gemini démarré sur http://localhost:${PORT}`);
  console.log(`   → Endpoint : http://localhost:${PORT}/chat`);
  console.log(`   → Clé API  : ${GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" ? "⚠️  NON CONFIGURÉE" : "✓ configurée"}\n`);
});