// AI proxy for the tracker: keeps API keys on the server, allows only approved emails.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const ALLOWED_EMAILS = defineString("ALLOWED_EMAILS");                       // comma-separated, same as rules
const CLAUDE_MODEL = defineString("CLAUDE_MODEL", { default: "claude-sonnet-5-5" });
const CLAUDE_MODEL_DEEP = defineString("CLAUDE_MODEL_DEEP", { default: "claude-opus-5-5" });
const GEMINI_MODEL = defineString("GEMINI_MODEL", { default: "gemini-2.5-flash" });
const GEMINI_MODEL_DEEP = defineString("GEMINI_MODEL_DEEP", { default: "gemini-2.5-pro" });

const JSON_RULE = "Reply with one valid JSON value only. No prose, no markdown, no code fences.";

async function askClaude(prompt, json, deep) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY.value(), "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: deep ? CLAUDE_MODEL_DEEP.value() : CLAUDE_MODEL.value(),
      max_tokens: 4096,
      ...(json ? { system: JSON_RULE } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new HttpsError(r.status === 429 ? "resource-exhausted" : "internal", d?.error?.message || "Claude error");
  return { text: (d.content || []).filter(b => b.type === "text").map(b => b.text).join(""), truncated: d.stop_reason === "max_tokens" };
}

async function askGemini(prompt, json, deep) {
  const model = deep ? GEMINI_MODEL_DEEP.value() : GEMINI_MODEL.value();
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_API_KEY.value() },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...(json ? { systemInstruction: { parts: [{ text: JSON_RULE }] }, generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 } } : { generationConfig: { maxOutputTokens: 4096 } }),
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new HttpsError(r.status === 429 ? "resource-exhausted" : "internal", d?.error?.message || "Gemini error");
  const c = d.candidates?.[0];
  return { text: (c?.content?.parts || []).map(p => p.text || "").join(""), truncated: c?.finishReason === "MAX_TOKENS" };
}

exports.ai = onCall(
  { region: "asia-south1", secrets: [ANTHROPIC_API_KEY, GEMINI_API_KEY], timeoutSeconds: 120, memory: "256MiB", maxInstances: 5 },
  async (req) => {
    const t = req.auth?.token;
    if (!t) throw new HttpsError("unauthenticated", "Sign in first.");
    const allowed = ALLOWED_EMAILS.value().toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    if (!t.email_verified || !allowed.includes(String(t.email).toLowerCase())) throw new HttpsError("permission-denied", "Not on the access list.");

    const { provider = "claude", prompt, json = false, tier = "default" } = req.data || {};
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 20000) throw new HttpsError("invalid-argument", "Bad prompt.");
    const deep = tier === "complex";

    const out = provider === "gemini" ? await askGemini(prompt, json, deep) : await askClaude(prompt, json, deep);
    if (!json) return out;
    const raw = out.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    try { return { json: JSON.parse(raw) }; }
    catch { throw new HttpsError("internal", "AI reply was not valid JSON. Try again."); }
  }
);
