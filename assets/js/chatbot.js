// ============================================================
//  PORTFOLIO CHATBOT — chatbot.js
//  Propulsé par Gemini Flash via proxy Railway (gratuit)
//  Copie dans assets/js/ et ajoute avant </body> :
//  <script src="assets/js/chatbot.js"></script>
// ============================================================

(function () {

  // ── ⚙️  CONFIG — MODIFIE CES VALEURS ────────────────────
  // ⚠️  IMPORTANT : l'URL doit se terminer par /chat
  const PROXY_URL = "https://portfolio2-production-c0ad.up.railway.app/chat";

  const SYSTEM_PROMPT = `Tu es l'assistant IA du portfolio de [TON PRÉNOM NOM], [TON MÉTIER].
Tu réponds en français par défaut, sauf si l'utilisateur écrit dans une autre langue.
Tu es concis, amical et professionnel. Tes réponses font maximum 3 phrases.

Infos sur le propriétaire :
- Nom : [TON PRÉNOM NOM]
- Métier : [ex: Développeur Full-Stack]
- Compétences : [ex: HTML, CSS, JavaScript, React, Node.js]
- Projets : [ex: Portfolio personnel, App de gestion de tâches, API REST]
- Contact : [ex: ton@email.com ou linkedin.com/in/tonprofil]
- Disponibilité : [ex: Disponible pour des missions freelance]

Règles :
- Réponds uniquement sur ces sujets (portfolio, compétences, projets, contact).
- Si la question n'est pas liée, redirige poliment.
- Ne génère jamais d'informations inventées.`;

  const SUGGESTIONS = ["Qui es-tu ?", "Tes projets", "Tes compétences", "Te contacter"];
  const BOT_NAME    = "Assistant Portfolio";
  const BOT_SUB     = "Propulsé par Gemini AI";
  // ─────────────────────────────────────────────────────────

  // ── CSS ──────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #cb-toggle{position:fixed;bottom:1.75rem;right:1.75rem;width:54px;height:54px;border-radius:50%;background:#7f77dd;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:9999;transition:transform .2s,box-shadow .2s;box-shadow:0 0 0 0 rgba(127,119,221,.3)}
    #cb-toggle:hover{transform:scale(1.07);box-shadow:0 0 0 8px rgba(127,119,221,.2)}
    #cb-toggle .ico-open{display:flex}#cb-toggle .ico-close{display:none}
    #cb-toggle.cb-open .ico-open{display:none}#cb-toggle.cb-open .ico-close{display:flex}
    #cb-window{position:fixed;bottom:5.25rem;right:1.75rem;width:360px;max-height:560px;background:#141417;border:1px solid rgba(255,255,255,.09);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;z-index:9998;transform:scale(.92) translateY(14px);opacity:0;pointer-events:none;transform-origin:bottom right;transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .2s ease}
    #cb-window.cb-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
    .cb-head{padding:.85rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;background:#1c1c21;flex-shrink:0}
    .cb-avatar{width:34px;height:34px;border-radius:50%;background:rgba(127,119,221,.15);border:1px solid #7f77dd;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .cb-hinfo{flex:1;min-width:0}.cb-hinfo h3{font-size:13px;font-weight:600;color:#f0efe8;margin:0;font-family:inherit}.cb-hinfo p{font-size:11px;color:#8a8a9a;margin:0;font-family:inherit}
    .cb-dot{width:8px;height:8px;border-radius:50%;background:#5dcaa5;box-shadow:0 0 5px rgba(93,202,165,.5);flex-shrink:0}
    .cb-msgs{flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    .cb-msgs::-webkit-scrollbar{width:3px}.cb-msgs::-webkit-scrollbar-track{background:transparent}.cb-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}
    .cb-msg{display:flex;gap:7px;animation:cbIn .22s ease}
    @keyframes cbIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .cb-msg.cb-user{flex-direction:row-reverse}
    .cb-bubble{max-width:80%;padding:9px 13px;border-radius:13px;font-size:13px;line-height:1.6;font-family:inherit;word-break:break-word;white-space:pre-wrap}
    .cb-msg.cb-bot .cb-bubble{background:#16161a;border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px;color:#f0efe8}
    .cb-msg.cb-user .cb-bubble{background:#1e1c38;border:1px solid rgba(127,119,221,.28);border-bottom-right-radius:4px;color:#f0efe8}
    .cb-mic{width:26px;height:26px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;margin-top:2px}
    .cb-msg.cb-bot .cb-mic{background:rgba(127,119,221,.12);color:#7f77dd;border:1px solid rgba(127,119,221,.4)}
    .cb-msg.cb-user .cb-mic{background:rgba(255,255,255,.05);color:#8a8a9a;border:1px solid rgba(255,255,255,.09)}
    .cb-typing .cb-bubble{display:flex;align-items:center;gap:5px;padding:11px 15px}
    .cb-d{width:6px;height:6px;border-radius:50%;background:#8a8a9a;animation:cbB 1.1s infinite}
    .cb-d:nth-child(2){animation-delay:.18s}.cb-d:nth-child(3){animation-delay:.36s}
    @keyframes cbB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    .cb-sugg{display:flex;flex-wrap:wrap;gap:5px;padding:0 .9rem .65rem}
    .cb-sq{background:#1c1c21;border:1px solid rgba(255,255,255,.08);color:#8a8a9a;font-family:inherit;font-size:11px;padding:4px 9px;border-radius:20px;cursor:pointer;transition:all .15s}
    .cb-sq:hover{border-color:#7f77dd;color:#7f77dd;background:rgba(127,119,221,.1)}
    .cb-foot{padding:.65rem .9rem;border-top:1px solid rgba(255,255,255,.07);display:flex;gap:7px;align-items:flex-end;background:#1c1c21;flex-shrink:0}
    .cb-ta{flex:1;background:#141417;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#f0efe8;font-family:inherit;font-size:12px;padding:8px 11px;resize:none;outline:none;line-height:1.5;max-height:90px;min-height:34px;transition:border-color .15s}
    .cb-ta::placeholder{color:#8a8a9a}.cb-ta:focus{border-color:rgba(255,255,255,.18)}
    .cb-send{width:34px;height:34px;border-radius:7px;background:#7f77dd;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s,transform .15s}
    .cb-send:hover{opacity:.82;transform:scale(1.04)}.cb-send:disabled{opacity:.35;cursor:not-allowed;transform:none}
    .cb-err{background:rgba(226,75,74,.1);border:1px solid rgba(226,75,74,.3);color:#f09595;padding:7px 11px;border-radius:8px;font-size:12px;text-align:center}
    @media(max-width:480px){#cb-window{width:calc(100vw - 2rem);right:1rem}#cb-toggle{bottom:1.25rem;right:1.25rem}}
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <button id="cb-toggle" aria-label="Ouvrir le chat" aria-expanded="false">
      <span class="ico-open">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </span>
      <span class="ico-close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
    </button>
    <div id="cb-window" role="dialog" aria-label="${BOT_NAME}">
      <div class="cb-head">
        <div class="cb-avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7f77dd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div class="cb-hinfo"><h3>${BOT_NAME}</h3><p>${BOT_SUB}</p></div>
        <div class="cb-dot"></div>
      </div>
      <div class="cb-msgs" id="cb-msgs"></div>
      <div class="cb-sugg" id="cb-sugg"></div>
      <div class="cb-foot">
        <textarea class="cb-ta" id="cb-ta" placeholder="Pose ta question…" rows="1" maxlength="500" aria-label="Message"></textarea>
        <button class="cb-send" id="cb-send" aria-label="Envoyer" disabled>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  // ── STATE ────────────────────────────────────────────────
  const history = [];
  let isOpen    = false;
  let isLoading = false;

  const toggle = document.getElementById("cb-toggle");
  const win    = document.getElementById("cb-window");
  const msgs   = document.getElementById("cb-msgs");
  const sugg   = document.getElementById("cb-sugg");
  const ta     = document.getElementById("cb-ta");
  const send   = document.getElementById("cb-send");

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

  function mkMsg(role, text) {
    const div = document.createElement("div");
    div.className = `cb-msg cb-${role}`;
    const mic = document.createElement("div");
    mic.className = "cb-mic";
    mic.textContent = role === "bot" ? "AI" : "◉";
    const bubble = document.createElement("div");
    bubble.className = "cb-bubble";
    bubble.textContent = text;
    role === "bot"
      ? (div.appendChild(mic), div.appendChild(bubble))
      : (div.appendChild(bubble), div.appendChild(mic));
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "cb-msg cb-bot cb-typing";
    div.id = "cb-typing";
    const mic = document.createElement("div");
    mic.className = "cb-mic"; mic.textContent = "AI";
    const bubble = document.createElement("div");
    bubble.className = "cb-bubble";
    bubble.innerHTML = '<span class="cb-d"></span><span class="cb-d"></span><span class="cb-d"></span>';
    div.appendChild(mic); div.appendChild(bubble);
    msgs.appendChild(div);
    scrollBottom();
  }

  function removeTyping() { document.getElementById("cb-typing")?.remove(); }

  function showError(msg) {
    removeTyping();
    const div = document.createElement("div");
    div.className = "cb-err";
    div.textContent = msg;
    msgs.appendChild(div);
    scrollBottom();
  }

  function buildSuggestions() {
    sugg.innerHTML = "";
    SUGGESTIONS.forEach(s => {
      const btn = document.createElement("button");
      btn.className = "cb-sq";
      btn.textContent = s;
      btn.onclick = () => { ta.value = s; send.disabled = false; sendMsg(); };
      sugg.appendChild(btn);
    });
  }

  function openChat() {
    isOpen = true;
    toggle.classList.add("cb-open");
    win.classList.add("cb-open");
    toggle.setAttribute("aria-expanded", "true");
    if (msgs.children.length === 0) greet();
    setTimeout(() => ta.focus(), 280);
  }

  function closeChat() {
    isOpen = false;
    toggle.classList.remove("cb-open");
    win.classList.remove("cb-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => isOpen ? closeChat() : openChat());
  document.addEventListener("keydown", e => { if (e.key === "Escape" && isOpen) closeChat(); });

  function greet() {
    msgs.appendChild(mkMsg("bot", "Bonjour ! Je suis l'assistant IA de ce portfolio. Pose-moi une question sur les projets, compétences, ou pour prendre contact 👋"));
    buildSuggestions();
    scrollBottom();
  }

  async function callProxy(userText) {
    history.push({ role: "user", parts: [{ text: userText }] });

    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: SYSTEM_PROMPT, history })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data  = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "Je n'ai pas pu générer de réponse.";

    history.push({ role: "model", parts: [{ text: reply }] });
    return reply;
  }

  async function sendMsg() {
    const text = ta.value.trim();
    if (!text || isLoading) return;

    sugg.innerHTML  = "";
    ta.value        = "";
    ta.style.height = "34px";
    send.disabled   = true;
    isLoading       = true;

    msgs.appendChild(mkMsg("user", text));
    scrollBottom();
    showTyping();

    try {
      const reply = await callProxy(text);
      removeTyping();
      msgs.appendChild(mkMsg("bot", reply));
      scrollBottom();
    } catch (err) {
      console.error("[Chatbot]", err);
      showError("Oups, une erreur est survenue. Réessaie dans un instant.");
    } finally {
      isLoading     = false;
      send.disabled = ta.value.trim().length === 0;
    }
  }

  ta.addEventListener("input", function () {
    this.style.height = "34px";
    this.style.height = Math.min(this.scrollHeight, 90) + "px";
    send.disabled     = this.value.trim().length === 0;
  });

  ta.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!send.disabled) sendMsg(); }
  });

  send.addEventListener("click", sendMsg);

})();