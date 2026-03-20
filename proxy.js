const http  = require("http");
const https = require("https");
const PORT           = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL   = "gemini-2.0-flash";
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method === "GET") {
    res.writeHead(200, {"Content-Type":"application/json"});
    return res.end(JSON.stringify({status:"ok"}));
  }
  if (req.method === "POST") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      let payload;
      try { payload = JSON.parse(body); } catch { res.writeHead(400); return res.end('{"error":"bad json"}'); }
      const gb = JSON.stringify({
        system_instruction: {parts:[{text: payload.system||""}]},
        contents: payload.history||[],
        generationConfig: {maxOutputTokens:300, temperature:0.7}
      });
      const opt = {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        method: "POST",
        headers: {"Content-Type":"application/json","Content-Length":Buffer.byteLength(gb)}
      };
      const gr = https.request(opt, r => {
        let d = ""; r.on("data", c => d+=c);
        r.on("end", () => { res.writeHead(r.statusCode,{"Content-Type":"application/json"}); res.end(d); });
      });
      gr.on("error", e => { res.writeHead(500); res.end(JSON.stringify({error:e.message})); });
      gr.write(gb); gr.end();
    });
    return;
  }
  res.writeHead(404); res.end('{"error":"not found"}');
});
server.listen(PORT, () => console.log("Proxy actif sur port", PORT));
