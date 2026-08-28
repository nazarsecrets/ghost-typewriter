import { useState, useEffect, useRef } from "react";

const SVR_SYSTEM_PROMPT = `You are an SVR-Optimized UX Writing Assistant. You help draft journal-like, reflective UX articles that feel warm, thoughtful, and grounded in real product work.

The author is a systems-driven B2B product designer with a UX generalist mindset. Their work centers on clarity within complex workflows, realistic prototypes, and research-led decision making. Their storytelling is structured, humble, and outcome-aware—not performative.

Writing Style (Non-Negotiables):
- Tone: Warm, grounded, quietly confident
- Language: Plain, precise, no fluff, no buzzwords
- Structure: Scannable, intentional flow
- Voice: Observational > opinionated; evidence > claims
- Avoid: Dramatic hooks, overly poetic metaphors, generic "UX thought leadership" language

When critiquing a draft:
1. Preserve the author's voice and structure
2. Grammar check — flag errors clearly but gently
3. Suggest in-line refinements for clarity, flow, and tone
4. Provide a short rationale after edits
5. Check against SVR guardrails: no buzzwords, no performative language, no vague claims
6. Connect narrative to product outcomes and systems thinking
7. End with 2–3 alternative title options and 3 hashtags if suited for social`;

const TODAY = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const TOPICS_PROMPT = `You are a UX industry intelligence assistant for a senior B2B product designer who writes reflective, systems-thinking articles on LinkedIn and Medium.

Today's date is ${TODAY}.

Return exactly 6 UX/product design industry topics. All topics must have emerged or peaked within the last 30 days — nothing older. Draw from signals across LinkedIn discourse, Medium publications, design news, and product industry newsletters.

Distribute the 6 topics across these three tiers:
- 2 x "Breaking" — surfaced in the last 7 days, still raw and debated
- 2 x "Trending" — 1–3 weeks old, gaining momentum in design circles
- 2 x "Under the Radar" — within the last month but largely missed by the mainstream; niche, overlooked, or quietly discussed in smaller communities. These should feel like hidden gems a thoughtful designer would want to claim before everyone else does.

For each topic include an honest, specific date estimate of when it entered conversation — be precise (e.g. "Late March 2026", "Early April 2026").

Respond ONLY with a JSON array of 6 objects, each with:
- "title": 3–5 word topic label
- "teaser": under 200 chars, punchy and curiosity-sparking — written to make a writer want to reflect and write about it
- "tag": one of ["Systems", "Research", "AI", "Leadership", "Process", "Ethics"]
- "since": short precise date string e.g. "Late March 2026"
- "recency": one of ["Breaking", "Trending", "Under the Radar"]

No markdown, no backticks, no preamble. Pure JSON array only.`;

const PATHWAYS_PROMPT = (topic) => `You are a reflective writing coach for a senior B2B product designer. They clicked on this topic:

Title: "${topic.title}"
Context: "${topic.teaser}"

Your job is NOT to write an article. Your job is to give them quiet, specific prompts that help them look inward and recall real experiences they can write from.

Return ONLY a JSON object with:
- "angle": one sentence — what this piece is really about beneath the surface
- "pathways": array of exactly 5 objects, each with:
  - "prompt": a reflective question or pointer (1–2 sentences, specific, grounded, not generic)
  - "type": one of ["Memory", "Tension", "Outcome", "System", "People"]

No markdown, no backticks, no preamble. Pure JSON only.`;

const CRITIQUE_PROMPT = (mode, tone) => `You are an SVR-Optimized UX Writing Assistant critiquing a draft.

Mode: ${mode === "article" ? "Reflective UX article" : "LinkedIn post"}
Tone target: ${tone === "reflective" ? "Gentle-reflective — warm, observational, narrative-led" : "Crisp-editorial — sharper, more direct, insight-led"}

${SVR_SYSTEM_PROMPT}

When you receive a draft, do the following in order:
1. Grammar & mechanics — list any errors clearly (be specific, line-level if possible)
2. Voice & tone check — flag anything that drifts from SVR style (buzzwords, performative claims, vague language)
3. Structure & flow — note any sections that feel rushed, unclear, or missing
4. Refined version — rewrite the draft with your improvements embedded, preserving the author's voice
5. What changed & why — brief rationale for key edits
6. Title options — 2–3 alternatives
7. Hashtags — 3 relevant ones if suited for social

Be direct but warm. Think: thoughtful editor, not harsh critic.`;

const TAG_COLORS = {
  Systems:    { bg: "#E6F1FB", text: "#0C447C", border: "#B5D4F4" },
  Research:   { bg: "#E1F5EE", text: "#085041", border: "#9FE1CB" },
  AI:         { bg: "#EEEDFE", text: "#3C3489", border: "#CECBF6" },
  Leadership: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  Process:    { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" },
  Ethics:     { bg: "#FBEAF0", text: "#72243E", border: "#F4C0D1" },
};

const RECENCY_MAP = {
  Breaking:         { dot: "#E24B4A", bg: "#FCEBEB", text: "#791F1F" },
  Trending:         { dot: "#EF9F27", bg: "#FAEEDA", text: "#633806" },
  "Under the Radar":{ dot: "#7F77DD", bg: "#EEEDFE", text: "#3C3489" },
};

const TYPE_COLORS = {
  Memory:  { bg: "#FAEEDA", text: "#633806" },
  Tension: { bg: "#FCEBEB", text: "#791F1F" },
  Outcome: { bg: "#E1F5EE", text: "#085041" },
  System:  { bg: "#E6F1FB", text: "#0C447C" },
  People:  { bg: "#EEEDFE", text: "#3C3489" },
};

function Badge({ tag, small }) {
  const c = TAG_COLORS[tag] || TAG_COLORS.Systems;
  return (
    <span style={{
      fontSize: small ? 10 : 11, fontWeight: 500, padding: small ? "1px 6px" : "2px 8px",
      borderRadius: 20, border: `0.5px solid ${c.border}`,
      background: c.bg, color: c.text, whiteSpace: "nowrap"
    }}>{tag}</span>
  );
}

function RecencyStamp({ recency, since }) {
  const r = RECENCY_MAP[recency] || RECENCY_MAP.Established;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.dot, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 7px", borderRadius: 20, background: r.bg, color: r.text }}>{recency}</span>
      <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>since {since}</span>
    </div>
  );
}

function TypePill({ type }) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.System;
  return (
    <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 7px", borderRadius: 20, background: c.bg, color: c.text, whiteSpace: "nowrap" }}>{type}</span>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center", padding: "2px 0" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-text-tertiary)", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
      ))}
      <style>{`@keyframes pulse{0%,80%,100%{opacity:0.3}40%{opacity:1}}`}</style>
    </span>
  );
}

function TopicCard({ topic, onUse }) {
  return (
    <div onClick={() => onUse(topic)} style={{
      background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)", padding: "12px 14px", cursor: "pointer",
      transition: "border-color 0.15s", display: "flex", flexDirection: "column", gap: 7
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{topic.title}</span>
        <Badge tag={topic.tag} />
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{topic.teaser}</p>
      <RecencyStamp recency={topic.recency} since={topic.since} />
    </div>
  );
}

export default function Ghostwriter() {
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState(false);
  const [view, setView] = useState("home");
  const [mode, setMode] = useState("article");
  const [tone, setTone] = useState("reflective");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [pathways, setPathways] = useState(null);
  const [pathwaysLoading, setPathwaysLoading] = useState(false);
  const [draftInput, setDraftInput] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "unsaved"
  const bottomRef = useRef(null);
  const autoSaveTimer = useRef(null);

  useEffect(() => { loadTopics(); restoreSession(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, aiLoading]);

  useEffect(() => {
    if (view === "critique" && (draftInput || messages.length > 0)) {
      setSaveStatus("unsaved");
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        setSaveStatus("saving");
        setTimeout(() => {
          saveSession();
          setSaveStatus("saved");
        }, 600);
      }, 1200);
    }
    return () => clearTimeout(autoSaveTimer.current);
  }, [draftInput, messages, view]);

  function saveSession() {
    try {
      const session = {
        view, mode, tone,
        selectedTopic: selectedTopic || null,
        draftInput, messages,
        savedAt: new Date().toISOString()
      };
      window._ghostSession = session;
    } catch {}
  }

  function restoreSession() {
    try {
      const s = window._ghostSession;
      if (!s) return;
      if (s.view) setView(s.view);
      if (s.mode) setMode(s.mode);
      if (s.tone) setTone(s.tone);
      if (s.selectedTopic) setSelectedTopic(s.selectedTopic);
      if (s.draftInput) setDraftInput(s.draftInput);
      if (s.messages?.length) setMessages(s.messages);
    } catch {}
  }

  async function loadTopics() {
    setTopicsLoading(true); setTopicsError(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: TOPICS_PROMPT }] })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "[]";
      setTopics(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setTopicsError(true); }
    finally { setTopicsLoading(false); }
  }

  async function selectTopic(topic) {
    setSelectedTopic(topic); setPathways(null); setView("reflect"); setPathwaysLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: PATHWAYS_PROMPT(topic) }] })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "{}";
      setPathways(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setPathways({ angle: "Could not load pathways.", pathways: [] }); }
    finally { setPathwaysLoading(false); }
  }

  function goToCritique() { setMessages([]); setDraftInput(""); setView("critique"); }

  function saveDraft(userInput, aiResponse) {
    const draft = { id: Date.now(), date: new Date().toLocaleDateString(), preview: userInput.slice(0, 80), content: aiResponse };
    window._ghostDrafts = [draft, ...(window._ghostDrafts || [])].slice(0, 20);
  }

  function getLatestContent() {
    const aiMsgs = messages.filter(m => m.role === "assistant");
    return aiMsgs.length ? aiMsgs[aiMsgs.length - 1].content : draftInput;
  }

  function downloadTxt() {
    const content = getLatestContent();
    const title = selectedTopic?.title || "SVR Draft";
    const blob = new Blob([`${title}\n${"─".repeat(title.length)}\n\n${content}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, "_")}.txt`; a.click();
  }

  function downloadDocx() {
    const content = getLatestContent();
    const title = selectedTopic?.title || "SVR Draft";
    const html = `<html><head><meta charset="utf-8"></head><body><h1>${title}</h1><p>${content.replace(/\n/g, "</p><p>")}</p></body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, "_")}.doc`; a.click();
  }

  function openMedium() {
    window.open("https://medium.com/new-story", "_blank");
  }

  function openGoogleDocs() {
    const content = getLatestContent();
    const title = selectedTopic?.title || "SVR Draft";
    const encoded = encodeURIComponent(`${title}\n\n${content}`);
    window.open(`https://docs.google.com/document/create?title=${encodeURIComponent(title)}`, "_blank");
    navigator.clipboard.writeText(`${title}\n\n${content}`).catch(() => {});
  }

  const [showExport, setShowExport] = useState(false);

  async function submitDraft() {
    if (!draftInput.trim()) return;
    const userMsg = { role: "user", content: `Here is my draft. Please critique and improve it:\n\n${draftInput}` };
    const newMessages = [userMsg];
    setMessages(newMessages); setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: CRITIQUE_PROMPT(mode, tone), messages: newMessages })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Something went wrong.";
      const updated = [...newMessages, { role: "assistant", content: reply }];
      setMessages(updated); saveDraft(draftInput, reply);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Could not reach the API. Please try again." }]); }
    finally { setAiLoading(false); }
  }

  async function sendFollowUp(text) {
    if (!text.trim()) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages); setFollowUp(""); setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: CRITIQUE_PROMPT(mode, tone), messages: newMessages })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Something went wrong.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Could not reach the API." }]); }
    finally { setAiLoading(false); }
  }

  const modeBtn = (val, label) => (
    <button onClick={() => setMode(val)} style={{
      padding: "5px 14px", fontSize: 12, borderRadius: 20,
      border: `0.5px solid ${mode === val ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
      background: mode === val ? "var(--color-background-secondary)" : "transparent",
      color: mode === val ? "var(--color-text-primary)" : "var(--color-text-secondary)",
      cursor: "pointer", fontWeight: mode === val ? 500 : 400
    }}>{label}</button>
  );

  const toneBtn = (val, label) => (
    <button onClick={() => setTone(val)} style={{
      padding: "5px 14px", fontSize: 12, borderRadius: 20,
      border: `0.5px solid ${tone === val ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
      background: tone === val ? "var(--color-background-secondary)" : "transparent",
      color: tone === val ? "var(--color-text-primary)" : "var(--color-text-secondary)",
      cursor: "pointer", fontWeight: tone === val ? 500 : 400
    }}>{label}</button>
  );

  const drafts = window._ghostDrafts || [];

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>SVR Ghostwriter</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>Systems-driven UX writing, grounded in real work</p>
            {view === "critique" && (
              <span style={{ fontSize: 10, color: saveStatus === "saved" ? "var(--color-text-tertiary)" : saveStatus === "saving" ? "#1D9E75" : "#EF9F27", transition: "color 0.3s" }}>
                {saveStatus === "saved" ? "● All changes saved" : saveStatus === "saving" ? "● Saving…" : "● Unsaved changes"}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {view !== "home" && (
            <button onClick={() => { setView("home"); setSelectedTopic(null); setMessages([]); }} style={{
              fontSize: 12, padding: "5px 12px", borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-tertiary)", background: "transparent",
              color: "var(--color-text-secondary)", cursor: "pointer"
            }}>← Home</button>
          )}
          {view === "critique" && messages.some(m => m.role === "assistant") && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowExport(!showExport)} style={{
                fontSize: 12, padding: "5px 12px", borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-tertiary)", background: "transparent",
                color: "var(--color-text-secondary)", cursor: "pointer"
              }}>Export ↓</button>
              {showExport && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 10,
                  background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-lg)", padding: "6px 0", minWidth: 180,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
                }}>
                  {[
                    { label: "Download .txt", fn: downloadTxt, note: null },
                    { label: "Download .doc", fn: downloadDocx, note: null },
                    { label: "Open in Google Docs", fn: openGoogleDocs, note: "copies content" },
                    { label: "Open Medium editor", fn: openMedium, note: "paste manually" },
                  ].map(({ label, fn, note }) => (
                    <button key={label} onClick={() => { fn(); setShowExport(false); }} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", padding: "8px 14px", fontSize: 12, border: "none",
                      background: "transparent", color: "var(--color-text-primary)", cursor: "pointer",
                      textAlign: "left", gap: 10
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span>{label}</span>
                      {note && <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{note}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
            <button onClick={goToCritique} style={{
              fontSize: 12, padding: "5px 14px", borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)", background: "transparent",
              color: "var(--color-text-primary)", cursor: "pointer", fontWeight: 500
            }}>I've written something →</button>
          )}
          <button onClick={() => setShowDrafts(!showDrafts)} style={{
            fontSize: 12, padding: "5px 12px", borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-tertiary)", background: "transparent",
            color: "var(--color-text-secondary)", cursor: "pointer"
          }}>Drafts ({drafts.length})</button>
        </div>
      </div>

      {/* Drafts panel */}
      {showDrafts && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "12px 14px", marginBottom: "1.25rem" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)" }}>Recent drafts</p>
          {drafts.length === 0 && <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>No drafts yet.</p>}
          {drafts.map(d => (
            <div key={d.id} style={{ padding: "8px 0", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{d.preview}…</span>
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>{d.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 16, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginRight: 2 }}>Mode</span>
          {modeBtn("article", "Article")} {modeBtn("linkedin", "LinkedIn")}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginRight: 2 }}>Tone</span>
          {toneBtn("reflective", "Gentle-reflective")} {toneBtn("editorial", "Crisp-editorial")}
        </div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>What's worth writing about today — click to reflect</p>
            <button onClick={loadTopics} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              border: "0.5px solid var(--color-border-tertiary)", background: "transparent",
              color: "var(--color-text-tertiary)", cursor: "pointer"
            }}>Refresh ↺</button>
          </div>
          {topicsLoading && (
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: 90, borderRadius: "var(--border-radius-lg)", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", opacity: 0.5 }} />)}
            </div>
          )}
          {topicsError && <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Could not load topics. <span onClick={loadTopics} style={{ cursor: "pointer", textDecoration: "underline" }}>Try again</span></p>}
          {!topicsLoading && !topicsError && (
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {topics.map((t, i) => <TopicCard key={i} topic={t} onUse={selectTopic} />)}
            </div>
          )}
          <div style={{ marginTop: "1.5rem", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "1.25rem" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-text-secondary)" }}>Already written something? Go straight to critique →</p>
            <button onClick={goToCritique} style={{
              fontSize: 13, padding: "7px 18px", borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)", background: "transparent",
              color: "var(--color-text-primary)", cursor: "pointer", fontWeight: 500
            }}>Critique my draft ↗</button>
          </div>
        </div>
      )}

      {/* REFLECT */}
      {view === "reflect" && selectedTopic && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
            <Badge tag={selectedTopic.tag} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>{selectedTopic.title}</span>
            <RecencyStamp recency={selectedTopic.recency} since={selectedTopic.since} />
          </div>
          {pathwaysLoading && (
            <div style={{ padding: "2rem 0", display: "flex", alignItems: "center", gap: 10 }}>
              <TypingDots />
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Finding your angle…</span>
            </div>
          )}
          {pathways && !pathwaysLoading && (
            <div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", padding: "10px 14px", marginBottom: "1.25rem" }}>
                <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>The real angle</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6, fontStyle: "italic" }}>{pathways.angle}</p>
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>Sit with these. One of them will pull at something real.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pathways.pathways?.map((p, i) => (
                  <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <TypePill type={p.type} />
                    <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{p.prompt}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--color-text-secondary)" }}>When something surfaces — go write. Come back when you have a draft.</p>
                <button onClick={goToCritique} style={{
                  fontSize: 13, padding: "7px 18px", borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid var(--color-border-secondary)", background: "transparent",
                  color: "var(--color-text-primary)", cursor: "pointer", fontWeight: 500
                }}>I've written something →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRITIQUE */}
      {view === "critique" && (
        <div>
          {messages.length === 0 && (
            <div>
              {selectedTopic && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                  <Badge tag={selectedTopic.tag} small />
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Writing from: {selectedTopic.title}</span>
                </div>
              )}
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10 }}>Paste your draft below. The critique covers grammar, voice, structure, and SVR guardrails — then hands back a refined version.</p>
              <textarea value={draftInput} onChange={e => setDraftInput(e.target.value)} placeholder="Paste your draft here…" rows={10} style={{
                width: "100%", fontSize: 13, padding: "10px 12px", boxSizing: "border-box",
                borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)",
                background: "var(--color-background-primary)", color: "var(--color-text-primary)",
                resize: "vertical", lineHeight: 1.7, outline: "none"
              }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={submitDraft} disabled={!draftInput.trim()} style={{
                  fontSize: 13, padding: "7px 18px", borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid var(--color-border-secondary)", background: "transparent",
                  color: !draftInput.trim() ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                  cursor: !draftInput.trim() ? "default" : "pointer", fontWeight: 500
                }}>Critique this ↗</button>
              </div>
            </div>
          )}
          {messages.length > 0 && (
            <div>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "90%", background: m.role === "user" ? "var(--color-background-secondary)" : "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)",
                    padding: "10px 14px", fontSize: 13, lineHeight: 1.75, color: "var(--color-text-primary)", whiteSpace: "pre-wrap"
                  }}>{m.content}</div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: "flex", marginBottom: "1rem" }}>
                  <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "10px 14px" }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
              <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <textarea value={followUp} onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendFollowUp(followUp); }}
                  placeholder="Ask for a revision, LinkedIn version, pull quotes… (⌘↵ to send)"
                  rows={3} style={{
                    width: "100%", fontSize: 13, padding: "10px 12px", boxSizing: "border-box",
                    borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-primary)", color: "var(--color-text-primary)",
                    resize: "vertical", lineHeight: 1.6, outline: "none"
                  }} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button onClick={() => sendFollowUp(followUp)} disabled={aiLoading || !followUp.trim()} style={{
                    fontSize: 13, padding: "7px 18px", borderRadius: "var(--border-radius-md)",
                    border: "0.5px solid var(--color-border-secondary)", background: "transparent",
                    color: aiLoading || !followUp.trim() ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                    cursor: aiLoading || !followUp.trim() ? "default" : "pointer", fontWeight: 500
                  }}>Send ↗</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
