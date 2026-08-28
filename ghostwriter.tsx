import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { enterWritingMode, focusParagraph, ghostReveal, pathwayEnter, pathwayExit, quietParagraph } from "./src/motion";

declare const __ANTHROPIC_CONFIGURED__: boolean;

type View = "today" | "reflect" | "write" | "review";
type Mode = "article" | "linkedin";
type Tone = "reflective" | "editorial";
type PathwayType = "Memory" | "Tension" | "Outcome" | "System" | "People";
type Topic = {
  title: string;
  teaser: string;
  tag: "Systems" | "Research" | "AI" | "Leadership" | "Process" | "Ethics";
  since: string;
  recency: "Breaking" | "Trending" | "Under the Radar";
};
type Pathway = { prompt: string; type: PathwayType };
type Reflection = { angle: string; pathways: Pathway[] };
type Draft = { id: string; title: string; updatedAt: string; content: string };
type Session = {
  view: View;
  mode: Mode;
  tone: Tone;
  selectedTopic: Topic | null;
  pathways: Reflection | null;
  pathwayIndex: number;
  reflectionAnswers: Partial<Record<PathwayType, string>>;
  title: string;
  paragraphs: string[];
  activeParagraph: number;
  review: string;
};

const SESSION_KEY = "svr-ghostwriter-session";
const DRAFTS_KEY = "svr-ghostwriter-drafts";
const STORAGE_VERSION = 1;
const TODAY = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const FALLBACK_PATHWAYS: Pathway[] = [
  { type: "Memory", prompt: "Think about the first time this actually became a problem in your work. What do you remember noticing?" },
  { type: "Tension", prompt: "What did everyone initially assume that later turned out to be wrong?" },
  { type: "Outcome", prompt: "What changed after the team understood the problem more clearly—and what did not?" },
  { type: "System", prompt: "Which rule, dependency, or workflow kept producing the same tension?" },
  { type: "People", prompt: "Who experienced the problem most directly, and what did you learn by watching or listening to them?" }
];

const INITIAL_SESSION: Session = {
  view: "today", mode: "article", tone: "reflective", selectedTopic: null,
  pathways: null, pathwayIndex: 0, reflectionAnswers: {}, title: "",
  paragraphs: [""], activeParagraph: 0, review: ""
};

const TOPICS_PROMPT = `Return exactly 6 UX/product design industry topics that emerged or peaked in the last 30 days as a JSON array. Today is ${TODAY}. Include exactly two Breaking, two Trending, and two Under the Radar topics. Each object must contain title, teaser, tag, since, and recency. Tags must be Systems, Research, AI, Leadership, Process, or Ethics. No markdown.`;
const PATHWAY_PROMPT = (topic: Topic) => `Act as a reflective writing coach. For the topic "${topic.title}" (${topic.teaser}), return JSON with an angle and exactly five pathways. Use each type exactly once: Memory, Tension, Outcome, System, People. Prompts must help a senior B2B product designer recall specific real work. No markdown.`;
const CRITIQUE_PROMPT = (mode: Mode, tone: Tone) => `You are a warm, precise UX writing editor. Review this ${mode === "article" ? "reflective UX article" : "LinkedIn post"} in a ${tone === "reflective" ? "gentle, observational" : "crisp, editorial"} tone. Return: grammar and mechanics, voice and tone, structure and flow, a refined version, what changed and why, 2–3 titles, and 3 relevant hashtags. Preserve the author's voice. Avoid buzzwords, performative claims, and vague language.`;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { version?: number; data?: T };
    return parsed.version === STORAGE_VERSION && parsed.data ? parsed.data : fallback;
  } catch { return fallback; }
}

function writeStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }));
}

async function askClaude(system: string | undefined, content: string, maxTokens = 1400) {
  const response = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: maxTokens,
      ...(system ? { system } : {}), messages: [{ role: "user", content }]
    })
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  const data = await response.json();
  return data.content?.find((block: { type: string; text?: string }) => block.type === "text")?.text || "";
}

function parseJson<T>(text: string): T {
  return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
}

function Words({ children }: { children: string }) {
  return <>{children.split(" ").map((word, index) => <span data-word key={`${word}-${index}`}>{word}{" "}</span>)}</>;
}

type ParagraphEditorProps = {
  value: string; index: number; activeIndex: number;
  register: (index: number, element: HTMLTextAreaElement | null) => void;
  onActivate: (index: number) => void;
  onChange: (index: number, value: string) => void;
  onEnter: (index: number, before: string, after: string) => void;
  onEmptyBackspace: (index: number) => void;
};

function ParagraphEditor({ value, index, activeIndex, register, onActivate, onChange, onEnter, onEmptyBackspace }: ParagraphEditorProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const resize = useCallback(() => {
    const element = localRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.max(44, element.scrollHeight)}px`;
  }, []);
  useEffect(resize, [resize, value]);

  function setRef(element: HTMLTextAreaElement | null) {
    localRef.current = element;
    register(index, element);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const start = event.currentTarget.selectionStart;
      onEnter(index, value.slice(0, start), value.slice(start));
    } else if (event.key === "Backspace" && !value && index > 0) {
      event.preventDefault();
      onEmptyBackspace(index);
    }
  }

  return <textarea
    ref={setRef}
    className={`manuscript-paragraph ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-past" : ""}`}
    value={value} rows={1} aria-label={`Paragraph ${index + 1}`}
    placeholder={index === 0 ? "Start with what you noticed…" : "Continue the thought…"}
    onFocus={() => onActivate(index)} onChange={(event) => onChange(index, event.target.value)} onKeyDown={handleKeyDown}
  />;
}

export default function Ghostwriter() {
  const restored = useRef(readStorage(SESSION_KEY, INITIAL_SESSION));
  const [view, setView] = useState<View>(restored.current.view);
  const [mode, setMode] = useState<Mode>(restored.current.mode);
  const [tone, setTone] = useState<Tone>(restored.current.tone);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(restored.current.selectedTopic);
  const [pathways, setPathways] = useState<Reflection | null>(restored.current.pathways);
  const [pathwayIndex, setPathwayIndex] = useState(restored.current.pathwayIndex);
  const [reflectionAnswers, setReflectionAnswers] = useState(restored.current.reflectionAnswers);
  const [title, setTitle] = useState(restored.current.title);
  const [paragraphs, setParagraphs] = useState(restored.current.paragraphs.length ? restored.current.paragraphs : [""]);
  const [activeParagraph, setActiveParagraph] = useState(restored.current.activeParagraph);
  const [review, setReview] = useState(restored.current.review);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState("");
  const [pathwaysLoading, setPathwaysLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved">("saved");
  const [drafts, setDrafts] = useState(() => readStorage<Draft[]>(DRAFTS_KEY, []));
  const [showDrafts, setShowDrafts] = useState(false);
  const reflectionRef = useRef<HTMLDivElement | null>(null);
  const writingRef = useRef<HTMLDivElement | null>(null);
  const paragraphRefs = useRef(new Map<number, HTMLTextAreaElement>());
  const lastSavedSession = useRef(JSON.stringify(restored.current));
  const topicsRequested = useRef(false);

  const manuscript = paragraphs.join("\n\n");
  const wordCount = `${title} ${manuscript}`.trim().split(/\s+/).filter(Boolean).length;
  const currentPathway = pathways?.pathways[pathwayIndex];

  const loadTopics = useCallback(async () => {
    setTopicsLoading(true); setTopicsError("");
    if (!__ANTHROPIC_CONFIGURED__) {
      setTopicsError("Add ANTHROPIC_API_KEY to .env to load current topics.");
      setTopicsLoading(false);
      return;
    }
    try { setTopics(parseJson<Topic[]>(await askClaude(undefined, TOPICS_PROMPT, 1100))); }
    catch (error) { setTopicsError(error instanceof Error ? error.message : "Topics could not be loaded."); }
    finally { setTopicsLoading(false); }
  }, []);

  useEffect(() => {
    if (!topicsRequested.current && view === "today") {
      topicsRequested.current = true;
      void loadTopics();
    }
  }, [loadTopics, view]);

  useEffect(() => {
    const session: Session = { view, mode, tone, selectedTopic, pathways, pathwayIndex, reflectionAnswers, title, paragraphs, activeParagraph, review };
    const serialized = JSON.stringify(session);
    if (serialized === lastSavedSession.current) return;
    setSaveStatus("unsaved");
    const timer = window.setTimeout(() => {
      writeStorage(SESSION_KEY, session);
      lastSavedSession.current = serialized;
      setSaveStatus("saved");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [view, mode, tone, selectedTopic, pathways, pathwayIndex, reflectionAnswers, title, paragraphs, activeParagraph, review]);

  useEffect(() => {
    if (view !== "write") return;
    const element = paragraphRefs.current.get(activeParagraph) || null;
    requestAnimationFrame(() => {
      element?.focus({ preventScroll: true });
      focusParagraph(element);
      const older = [...paragraphRefs.current.entries()]
        .filter(([index]) => index < activeParagraph).sort(([a], [b]) => b - a).map(([, paragraph]) => paragraph);
      quietParagraph(older);
    });
  }, [activeParagraph, view]);

  async function chooseTopic(topic: Topic) {
    setSelectedTopic(topic); setPathwayIndex(0); setReflectionAnswers({}); setView("reflect"); setPathwaysLoading(true);
    try { setPathways(parseJson<Reflection>(await askClaude(undefined, PATHWAY_PROMPT(topic), 1000))); }
    catch { setPathways({ angle: `A closer look at how ${topic.title.toLowerCase()} shows up in real product work.`, pathways: FALLBACK_PATHWAYS }); }
    finally { setPathwaysLoading(false); requestAnimationFrame(() => pathwayEnter(reflectionRef.current)); }
  }

  function moveToPathway(nextIndex: number) {
    pathwayExit(reflectionRef.current);
    window.setTimeout(() => {
      setPathwayIndex(nextIndex);
      requestAnimationFrame(() => { pathwayEnter(reflectionRef.current); ghostReveal(reflectionRef.current); });
    }, 190);
  }

  function enterWriting() {
    pathwayExit(reflectionRef.current);
    window.setTimeout(() => { setView("write"); requestAnimationFrame(() => enterWritingMode(writingRef.current)); }, 190);
  }

  function updateParagraph(index: number, value: string) {
    setParagraphs((current) => current.map((paragraph, paragraphIndex) => paragraphIndex === index ? value : paragraph));
  }
  function addParagraph(index: number, before: string, after: string) {
    setParagraphs((current) => [...current.slice(0, index), before, after, ...current.slice(index + 1)]);
    setActiveParagraph(index + 1);
  }
  function removeEmptyParagraph(index: number) {
    setParagraphs((current) => current.filter((_, paragraphIndex) => paragraphIndex !== index));
    setActiveParagraph(index - 1);
  }
  function registerParagraph(index: number, element: HTMLTextAreaElement | null) {
    if (element) paragraphRefs.current.set(index, element); else paragraphRefs.current.delete(index);
  }

  async function requestReview() {
    if (!manuscript.trim()) return;
    setView("review"); setReviewLoading(true);
    try {
      const response = await askClaude(CRITIQUE_PROMPT(mode, tone), `${title ? `${title}\n\n` : ""}${manuscript}`, 2600);
      setReview(response);
      const draft: Draft = { id: crypto.randomUUID(), title: title || "Untitled manuscript", updatedAt: new Date().toISOString(), content: manuscript };
      const updatedDrafts = [draft, ...drafts].slice(0, 20);
      setDrafts(updatedDrafts); writeStorage(DRAFTS_KEY, updatedDrafts);
    } catch (error) { setReview(`The review could not be loaded. ${error instanceof Error ? error.message : "Try again."}`); }
    finally { setReviewLoading(false); }
  }

  function download(extension: "txt" | "md") {
    const heading = title || "Untitled manuscript";
    const content = extension === "md" ? `# ${heading}\n\n${manuscript}` : `${heading}\n\n${manuscript}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${heading.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "manuscript"}.${extension}`;
    anchor.click(); URL.revokeObjectURL(anchor.href);
  }

  function startBlank() {
    setSelectedTopic(null); setTitle(""); setParagraphs([""]); setActiveParagraph(0); setView("write");
    requestAnimationFrame(() => enterWritingMode(writingRef.current));
  }

  const utility = <div className="utility-bar" aria-label="Writing settings">
    <div className="segmented">
      <button className={mode === "article" ? "selected" : ""} onClick={() => setMode("article")}>Article</button>
      <button className={mode === "linkedin" ? "selected" : ""} onClick={() => setMode("linkedin")}>LinkedIn</button>
    </div>
    <div className="segmented">
      <button className={tone === "reflective" ? "selected" : ""} onClick={() => setTone("reflective")}>Reflective</button>
      <button className={tone === "editorial" ? "selected" : ""} onClick={() => setTone("editorial")}>Editorial</button>
    </div>
    <span className={`save-state ${saveStatus}`}>{saveStatus === "saved" ? "Saved" : "Unsaved"}</span>
  </div>;

  return <div className={`app view-${view}`}>
    <header className="app-header">
      <button className="wordmark" onClick={() => setView("today")} aria-label="Go to Today"><span>SVR</span><i>/</i><span>Ghostwriter</span></button>
      <nav>
        {view !== "today" ? <button onClick={() => setView("today")}>Today</button> : null}
        {manuscript.trim() ? <button onClick={() => setView("write")}>Write</button> : null}
        <button onClick={() => setShowDrafts((shown) => !shown)}>Drafts <span>{drafts.length}</span></button>
      </nav>
    </header>

    {showDrafts ? <aside className="draft-drawer">
      <div className="drawer-heading"><span>Recent drafts</span><button onClick={() => setShowDrafts(false)}>Close</button></div>
      {drafts.length ? drafts.map((draft) => <button className="draft-row" key={draft.id} onClick={() => {
        setTitle(draft.title); setParagraphs(draft.content.split(/\n\s*\n/)); setActiveParagraph(0); setShowDrafts(false); setView("write");
      }}><strong>{draft.title}</strong><span>{new Date(draft.updatedAt).toLocaleDateString()}</span></button>) : <p>No saved drafts yet.</p>}
    </aside> : null}

    {view === "today" ? <main className="today-shell">
      <p className="eyebrow">Today · {TODAY}</p>
      <h1>What is worth<br />noticing?</h1>
      <div className="today-actions"><p>Choose an idea, then find the experience only you can write about.</p><button className="text-action" onClick={startBlank}>Start with a blank page →</button></div>
      {topicsLoading ? <div className="loading-line">Listening for current conversations…</div> : null}
      {topicsError ? <div className="error-line"><span>{topicsError}</span><button onClick={() => void loadTopics()}>Try again</button></div> : null}
      <div className="topic-list">{topics.map((topic, index) => <button className="topic-row" key={topic.title} onClick={() => void chooseTopic(topic)}>
        <span className="topic-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="topic-copy"><strong>{topic.title}</strong><small>{topic.teaser}</small></span>
        <span className="topic-meta">{topic.recency}<small>{topic.since}</small></span><span className="topic-arrow">→</span>
      </button>)}</div>
    </main> : null}

    {view === "reflect" ? <main className="reflect-shell">
      <div className="reflection-context"><span>{selectedTopic?.tag}</span><strong>{selectedTopic?.title}</strong></div>
      {pathwaysLoading ? <div className="reflection-loading">Finding a way into the story…</div> : null}
      {currentPathway && !pathwaysLoading ? <>
        <div className="pathway-trail" aria-label="Reflection pathways">{pathways?.pathways.map((pathway, index) => <button
          key={pathway.type} className={index === pathwayIndex ? "current" : index < pathwayIndex ? "visited" : ""}
          disabled={index > pathwayIndex} onClick={() => moveToPathway(index)}>{pathway.type}{index < (pathways?.pathways.length || 0) - 1 ? <i>→</i> : null}</button>)}</div>
        <div className="reflection-stage" ref={reflectionRef}>
          <p className="pathway-label">{currentPathway.type}</p>
          <h2><Words>{currentPathway.prompt}</Words></h2>
          <textarea value={reflectionAnswers[currentPathway.type] || ""} onChange={(event) => setReflectionAnswers((current) => ({ ...current, [currentPathway.type]: event.target.value }))} placeholder="Write down what came to mind…" rows={3} />
          <div className="reflection-actions">
            {pathwayIndex < (pathways?.pathways.length || 1) - 1 ? <button className="primary-action" onClick={() => moveToPathway(pathwayIndex + 1)}>Continue →</button> : <button className="primary-action" onClick={enterWriting}>Enter the manuscript →</button>}
            {pathwayIndex < (pathways?.pathways.length || 1) - 1 ? <button className="text-action" onClick={() => moveToPathway(pathwayIndex + 1)}>Show me another angle</button> : null}
          </div>
        </div>
      </> : null}
    </main> : null}

    {view === "write" ? <main className="writing-shell" ref={writingRef}>
      <div className="writing-line" aria-hidden="true"><span>writing line</span></div>
      {utility}
      <section className="manuscript">
        <div className="manuscript-meta"><span>{wordCount} words</span><span>{selectedTopic?.title || "Open manuscript"}</span></div>
        <input className="manuscript-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Untitled" aria-label="Manuscript title" />
        <div className="paragraphs">{paragraphs.map((paragraph, index) => <ParagraphEditor key={index} value={paragraph} index={index} activeIndex={activeParagraph} register={registerParagraph} onActivate={setActiveParagraph} onChange={updateParagraph} onEnter={addParagraph} onEmptyBackspace={removeEmptyParagraph} />)}</div>
        <div className="manuscript-end"><button className="primary-action" disabled={!manuscript.trim()} onClick={() => void requestReview()}>Review this draft →</button></div>
      </section>
    </main> : null}

    {view === "review" ? <main className="review-shell">
      <div className="review-toolbar">{utility}<button className="primary-action" onClick={() => setView("write")}>Return to manuscript</button></div>
      <div className="review-columns">
        <article className="review-manuscript"><p className="eyebrow">Manuscript · {wordCount} words</p><h1>{title || "Untitled manuscript"}</h1>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
        <aside className="editorial-notes">
          <div className="notes-heading"><span>Ghostwriter review</span><button onClick={() => void requestReview()}>Review again</button></div>
          {reviewLoading ? <p className="loading-line">Reading closely…</p> : <div className="review-copy">{review}</div>}
          {!reviewLoading && review ? <div className="export-actions"><button onClick={() => download("md")}>Download Markdown</button><button onClick={() => download("txt")}>Download text</button><button onClick={() => window.open("https://medium.com/new-story", "_blank", "noopener,noreferrer")}>Open Medium</button></div> : null}
        </aside>
      </div>
    </main> : null}
  </div>;
}
