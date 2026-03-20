const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY; // À ajouter dans les variables Railway

app.post("/chat", async (req, res) => {
  try {
    const { system, history } = req.body;

    // Convertir l'historique Gemini → format OpenAI/Groq
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
        model:      "llama3-8b-8192", // Rapide et gratuit
        max_tokens: 300,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Je n'ai pas pu répondre.";

    // Même format de réponse qu'avant → chatbot.js ne change pas
    res.json({
      candidates: [{ content: { parts: [{ text: reply }] } }]
    });

  } catch (err) {
    console.error("[Proxy Groq]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy Groq démarré sur le port ${PORT}`));