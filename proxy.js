const express = require("express");
const cors    = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    // ✅ Debug : vérifier que la clé existe
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY manquante !");
      return res.status(500).json({ error: "GROQ_API_KEY non configurée" });
    }

    const { system, history } = req.body;

    console.log("📩 Body reçu:", JSON.stringify({ system: system?.slice(0, 50), historyLength: history?.length }));

    const messages = [
      { role: "system", content: system ?? "" },
      ...(history || []).map(m => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts?.[0]?.text ?? ""
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:      "llama3-8b-8192",
        max_tokens: 300,
        messages
      })
    });

    const data = await response.json();
    console.log("📤 Réponse Groq status:", response.status);

    if (!response.ok) {
      console.error("❌ Erreur Groq:", JSON.stringify(data));
      return res.status(response.status).json({ error: data });
    }

    const reply = data.choices?.[0]?.message?.content ?? "Je n'ai pas pu répondre.";

    res.json({
      candidates: [{ content: { parts: [{ text: reply }] } }]
    });

  } catch (err) {
    console.error("❌ Erreur serveur:", err.message);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy Groq démarré sur le port ${PORT}`));