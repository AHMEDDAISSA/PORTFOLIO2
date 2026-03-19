// proxy.js — Gemini proxy pour portfolio (Railway / Render)
// Aucune dépendance npm — Node.js pur

const http  = require("http");
const https = require("https");

const PORT           = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const GEMINI_MODEL   = "gemini-2.0-flash";

const server = http.createServer((req, res) => {

  // ── CORS : autorise toutes les origines ────────────────
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Health check — vérifie que le proxy tourne
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", message: "Proxy Gemini actif ✓" }));
  }

  // ── Route principale ───────────────────────────────────
  if (req.method === "POST" && req.url === "/chat") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {

      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "JSON invalide" }));
      }

      const geminiBody = JSON.stringify({
        system_instruction: { parts: [{ text: payload.system || "" }] },
        contents: payload.history || [],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
      });

      const options = {
        hostname: "generativelanguage.googleapis.com",
        path:     `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        method:   "POST",
        headers: {
          "Content-Type":   "application/json",
          "Content-Length": Buffer.byteLength(geminiBody)
        }
      };

      const gReq = https.request(options, gRes => {
        let data = "";
        gRes.on("data", c => data += c);
        gRes.on("end", () => {
          res.writeHead(gRes.statusCode, { "Content-Type": "application/json" });
          res.end(data);
        });
      });

      gReq.on("error", err => {
        console.error("Gemini error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      });

      gReq.write(geminiBody);
      gReq.end();
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route non trouvée" }));
});

server.listen(PORT, () => {
  console.log(`\n✅  Proxy Gemini actif → http://localhost:${PORT}`);
  console.log(`    /        → health check`);
  console.log(`    /chat    → endpoint chatbot`);
  console.log(`    Clé API  : ${GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" ? "⚠️  NON CONFIGURÉE" : "✓ OK"}\n`);
});