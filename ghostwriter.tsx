import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { enterWritingMode, focusParagraph, pathwayEnter, pathwayExit, quietParagraph } from "./src/motion";
import { advanceDeskOffset, loadTopics as loadTopicDesk, type DisplayTopic, type EditorialLens, type TopicResult } from "./src/topicSource";

import { PlumeCursor, type PlumeOrigin } from "./src/PlumeCursor";
import { measureCaret } from "./src/caret";
import { stopWritingScroll } from "./src/motion";
import { writingGuides } from "./src/writingGuides";

declare const __ANTHROPIC_CONFIGURED__: boolean;

type View = "today" | "reflect" | "write" | "review";
type Mode = "article" | "linkedin";
type Tone = "reflective" | "editorial";
type PathwayType = "Memory" | "Tension" | "Outcome" | "System" | "People";
type Topic = DisplayTopic;
type Pathway = { prompt: string; type: PathwayType };
type Reflection = { angle: string; pathways: Pathway[] };
type Draft = { id: string; title: string; updatedAt: string; content: string; topic?: Topic | null; notes?: Partial<Record<PathwayType, string>> };
type Session = {
  draftId?: string;
  savedAt?: string;
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
const SIGNAL_SKELETONS = [0, 1, 2, 3, 4];
const LENS_BY_TAG: Record<Topic["tag"], EditorialLens> = {
  Systems: "Design",
  Research: "Design",
  AI: "Technology",
  Leadership: "Self",
  Process: "Ways of Working",
  Ethics: "Industry",
};

const FALLBACK_PATHWAYS: Pathway[] = [
  { type: "Memory", prompt: "Think about the first time this actually became a problem in your work. What do you remember noticing?" },
  { type: "Tension", prompt: "What did everyone initially assume that later turned out to be wrong?" },
  { type: "Outcome", prompt: "What changed after the team understood the problem more clearly, and what did not?" },
  { type: "System", prompt: "Which rule, dependency, or workflow kept producing the same tension?" },
  { type: "People", prompt: "Who experienced the problem most directly, and what did you learn by watching or listening to them?" }
];

const INITIAL_SESSION: Session = {
  view: "today", mode: "article", tone: "reflective", selectedTopic: null,
  pathways: null, pathwayIndex: 0, reflectionAnswers: {}, title: "",
  paragraphs: [""], activeParagraph: 0, review: ""
};

function topicPrompt(topic: Topic): string {
  return topic.origin === "source-backed" ? topic.provocation : topic.title;
}

function topicContext(topic: Topic): string {
  return topic.origin === "source-backed" ? topic.whyNow : topic.teaser;
}

const CRITIQUE_PROMPT = (mode: Mode, tone: Tone) => `You are a warm, precise UX writing editor. Review this ${mode === "article" ? "reflective UX article" : "LinkedIn post"} in a ${tone === "reflective" ? "gentle, observational" : "crisp, editorial"} tone. Return: grammar and mechanics, voice and tone, structure and flow, a refined version, what changed and why, 2-3 titles, and 3 relevant hashtags. Preserve the author's voice. Avoid buzzwords, performative claims, and vague language.`;

function fallbackReflection(topic: Topic): Reflection {
  return {
    angle: `A closer look at how ${topicPrompt(topic).toLowerCase()} shows up in real product work.`,
    pathways: FALLBACK_PATHWAYS,
  };
}

function editorialLens(topic: Topic): EditorialLens {
  return topic.origin === "source-backed" ? topic.lens : LENS_BY_TAG[topic.tag];
}

function displayCopy(value: string): string {
  return value
    .replace(/[—–]/g, "-")
    .replace(/Published 0 days ago/gi, "Published today")
    .replace(/Published 1 days ago/gi, "Published yesterday");
}

function displayTeaser(value: string): string {
  const teaser = displayCopy(value).trim();
  if (!teaser) return "";
  return /[.!?…]$/.test(teaser) ? teaser : `${teaser}…`;
}

function sourceLabel(value: string): string {
  const knownSources: Record<string, string> = {
    "arxiv-hci": "arXiv HCI",
    "devto-design": "DEV Community",
    "devto-ux": "DEV Community",
    "hn-designsystem": "Hacker News",
    "hn-ux": "Hacker News",
    uxcollective: "UX Collective",
  };
  return knownSources[value] ?? value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function TopicProvenance({ topic }: { topic: Topic }) {
  if (topic.origin === "curated") {
    return <div className="story-provenance is-evergreen">
      <span>Evergreen</span>
      <small>Curated prompt, not a live source</small>
    </div>;
  }

  const source = topic.sources[0];
  return <div className="story-provenance">
    <span>{topic.category}</span>
    <small>{displayCopy(topic.categoryReason)}</small>
    <a href={source.url} target="_blank" rel="noreferrer" title={source.title} aria-label={`Read source: ${source.title}`}>{sourceLabel(source.name)} ↗</a>
  </div>;
}

function TopicDeskSkeleton() {
  return <div className="editorial-desk desk-skeleton" aria-label="Loading ideas" aria-busy="true">
    <div className="lead-story"><span className="skeleton-line short" /><span className="skeleton-line title" /><span className="skeleton-line title second" /><span className="skeleton-line body" /></div>
    <div className="signal-list">{SIGNAL_SKELETONS.map((item) => <div className="signal-story" key={item}><span className="skeleton-line short" /><span className="skeleton-line signal" /><span className="skeleton-line body" /></div>)}</div>
  </div>;
}

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

async function askClaude(system: string | undefined, content: string, maxTokens = 1400, signal?: AbortSignal) {
  const response = await fetch("/api/anthropic/v1/messages", {
    method: "POST", signal,
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

/** How long the typing has to stop before the writing position settles. */
const SETTLE_DELAY = 600;

function caretOffset(element: HTMLTextAreaElement) {
  return measureCaret(element).offsetY;
}

type ParagraphEditorProps = {
  value: string; index: number; activeIndex: number;
  register: (index: number, element: HTMLTextAreaElement | null) => void;
  onActivate: (index: number) => void;
  onChange: (index: number, value: string) => void;
  onEnter: (index: number, before: string, after: string) => void;
  onEmptyBackspace: (index: number) => void;
  onSelection: (index: number, start: number, end: number) => void;
};

function ParagraphEditor({ value, index, activeIndex, register, onActivate, onChange, onEnter, onEmptyBackspace, onSelection }: ParagraphEditorProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const resize = useCallback(() => {
    const element = localRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.max(48, element.scrollHeight)}px`;
  }, []);
  useLayoutEffect(resize, [resize, value]);

  function setRef(element: HTMLTextAreaElement | null) {
    localRef.current = element;
    register(index, element);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    stopWritingScroll();
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const start = event.currentTarget.selectionStart;
      onEnter(index, value.slice(0, start), value.slice(event.currentTarget.selectionEnd));
    } else if (event.key === "Backspace" && !value && index > 0) {
      event.preventDefault();
      onEmptyBackspace(index);
    }
  }

  return <textarea
    ref={setRef}
    className={`manuscript-paragraph ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-past" : ""} ${index < activeIndex - 1 ? "is-distant" : ""}`}
    value={value} rows={1} name={`paragraph-${index}`} autoComplete="off" aria-label={`Paragraph ${index + 1}`}
    placeholder={index === 0 ? "Start with what you noticed…" : "Continue the thought…"}
    onSelect={(event) => onSelection(index, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)}
    onFocus={() => onActivate(index)} onChange={(event) => onChange(index, event.target.value)} onKeyDown={handleKeyDown}
  />;
}

export default function Ghostwriter() {
  const [initialSession] = useState(() => readStorage(SESSION_KEY, INITIAL_SESSION));
  const restored = useRef(initialSession);
  const [draftId, setDraftId] = useState(() => initialSession.draftId || crypto.randomUUID());
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
  const [topicResult, setTopicResult] = useState<TopicResult | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const [savedAt, setSavedAt] = useState<string | undefined>(initialSession.savedAt);
  const [plumeOrigin, setPlumeOrigin] = useState<PlumeOrigin | null>(null);
  const savedSelection = useRef<{ index: number; start: number; end: number } | null>(null);
  const previousView = useRef(view);
  const reviewRequest = useRef<AbortController | null>(null);
  const [drafts, setDrafts] = useState(() => readStorage<Draft[]>(DRAFTS_KEY, []));
  const [showDrafts, setShowDrafts] = useState(false);
  const reflectionRef = useRef<HTMLDivElement | null>(null);
  const writingRef = useRef<HTMLDivElement | null>(null);
  const paragraphRefs = useRef(new Map<number, HTMLTextAreaElement>());
  const reflectParagraphRefs = useRef(new Map<number, HTMLTextAreaElement>());
  const lastSavedSession = useRef(JSON.stringify(restored.current));
  const topicsRequested = useRef(false);

  const manuscript = paragraphs.join("\n\n");
  const wordCount = manuscript.trim().split(/\s+/).filter(Boolean).length;
  const topics = topicResult?.topics ?? [];
  const leadTopic = topics[0];
  const signalTopics = topics.slice(1);
  const leadContext = leadTopic ? displayTeaser(topicContext(leadTopic)) : "";

  const loadTopics = useCallback(async () => {
    setTopicsLoading(true); setTopicsError("");
    try { setTopicResult(await loadTopicDesk()); }
    catch (error) { setTopicsError(error instanceof Error ? error.message : "Topics could not be loaded."); }
    finally { setTopicsLoading(false); }
  }, []);

  function refreshTopics() {
    advanceDeskOffset();
    void loadTopics();
  }

  useEffect(() => {
    if (!topicsRequested.current && view === "today") {
      topicsRequested.current = true;
      void loadTopics();
    }
  }, [loadTopics, view]);

  useEffect(() => {
    const session: Session = { draftId, view, mode, tone, selectedTopic, pathways, pathwayIndex, reflectionAnswers, title, paragraphs, activeParagraph, review };
    const serialized = JSON.stringify(session);
    if (serialized === lastSavedSession.current) return;
    setSaveStatus("unsaved");
    const persist = () => {
      setSaveStatus("saving");
      try {
        const timestamp = new Date().toISOString();
        if (title.trim() || manuscript.trim() || Object.values(reflectionAnswers).some((answer) => answer?.trim()) || readStorage<Draft[]>(DRAFTS_KEY, []).some((draft) => draft.id === draftId)) {
          const draft: Draft = { id: draftId, title: title || "Untitled manuscript", content: manuscript, topic: selectedTopic, notes: reflectionAnswers, updatedAt: new Date().toISOString() };
          const updated = [draft, ...readStorage<Draft[]>(DRAFTS_KEY, []).filter((item) => item.id !== draftId)];
          writeStorage(DRAFTS_KEY, updated);
          setDrafts(updated);
        }
        writeStorage(SESSION_KEY, { ...session, savedAt: timestamp });
        setSavedAt(timestamp);
        lastSavedSession.current = serialized;
        setSaveStatus("saved");
      } catch { setSaveStatus("error"); }
    };
    const timer = window.setTimeout(persist, 700);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (serialized !== lastSavedSession.current) {
        persist();
        if (serialized !== lastSavedSession.current) { event.preventDefault(); event.returnValue = ""; }
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    const flush = () => { if (document.visibilityState === "hidden") persist(); };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", persist);
    };
  }, [draftId, view, mode, tone, selectedTopic, pathways, pathwayIndex, reflectionAnswers, title, paragraphs, activeParagraph, review, manuscript]);

  // The caret follows the active paragraph in either view; the writing position
  // and the falloff are the write view's rule alone.
  useLayoutEffect(() => {
    const writing = view === "write";
    if (!writing && view !== "reflect") return;
    const refs = writing ? paragraphRefs.current : reflectParagraphRefs.current;
    const element = refs.get(activeParagraph) || null;
    // Synchronous, before paint: a split paragraph must not drop the next keystroke.
    const changedView = previousView.current !== view;
    previousView.current = view;
    // Avoid summoning the mobile keyboard just by opening a document.
    if (element && (!matchMedia("(pointer: coarse)").matches || !changedView)) {
      element.focus({ preventScroll: true });
      const selection = savedSelection.current;
      if (selection?.index === activeParagraph) element.setSelectionRange(selection.start, selection.end);
    }
    if (!writing || !element) return;
    focusParagraph(element, caretOffset(element));
    quietParagraph([...refs.entries()].map(([index, paragraph]) => ({ element: paragraph, distance: activeParagraph - index })));
  }, [activeParagraph, view]);

  // The anchor settles on a pause, never on every keystroke (POC.md §2).
  useEffect(() => {
    if (view !== "write") return;
    const element = paragraphRefs.current.get(activeParagraph);
    if (!element) return;
    const timer = window.setTimeout(() => {
      if (document.activeElement === element) focusParagraph(element, caretOffset(element));
    }, SETTLE_DELAY);
    return () => window.clearTimeout(timer);
  }, [view, activeParagraph, paragraphs]);

  function preserveDraft() {
    if (!title.trim() && !manuscript.trim() && !Object.values(reflectionAnswers).some((answer) => answer?.trim())) return true;
    try {
      const draft: Draft = { id: draftId, title: title || "Untitled manuscript", content: manuscript, topic: selectedTopic, notes: reflectionAnswers, updatedAt: new Date().toISOString() };
      const updated = [draft, ...drafts.filter((item) => item.id !== draftId)];
      writeStorage(DRAFTS_KEY, updated); setDrafts(updated);
      return true;
    } catch { setSaveStatus("error"); return false; }
  }

  function chooseTopic(topic: Topic) {
    if (!preserveDraft()) return;
    savedSelection.current = null; setPlumeOrigin(null); reviewRequest.current?.abort();
    setDraftId(crypto.randomUUID()); setSelectedTopic(topic); setTitle(topic.title);
    setParagraphs([""]); setActiveParagraph(0); setPathwayIndex(0);
    setReflectionAnswers({}); setReview(""); setPathways(fallbackReflection(topic)); setView("reflect");
    requestAnimationFrame(() => pathwayEnter(reflectionRef.current));
  }

  function openReflection() {
    setView("reflect");
  }

  function enterWriting() {
    const question = reflectionRef.current?.querySelector("h1");
    if (question && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const rect = question.getBoundingClientRect();
      const style = getComputedStyle(question);
      setPlumeOrigin({ x: rect.left, y: rect.top, width: rect.width, height: rect.height, text: question.textContent || "", font: style.font, letterSpacing: style.letterSpacing, id: performance.now() });
    } else setPlumeOrigin(null);
    setView("write");
  }

  function rememberSelection(index: number, start: number, end: number) {
    savedSelection.current = { index, start, end };
  }

  function updateParagraph(index: number, value: string) {
    stopWritingScroll();
    setParagraphs((current) => current.map((paragraph, paragraphIndex) => paragraphIndex === index ? value : paragraph));
  }
  function addParagraph(index: number, before: string, after: string) {
    savedSelection.current = { index: index + 1, start: 0, end: 0 };
    setParagraphs((current) => [...current.slice(0, index), before, after, ...current.slice(index + 1)]);
    setActiveParagraph(index + 1);
  }
  function removeEmptyParagraph(index: number) {
    const end = paragraphs[index - 1]?.length || 0;
    savedSelection.current = { index: index - 1, start: end, end };
    setParagraphs((current) => current.filter((_, paragraphIndex) => paragraphIndex !== index));
    setActiveParagraph(index - 1);
  }
  function registerParagraph(index: number, element: HTMLTextAreaElement | null) {
    if (element) paragraphRefs.current.set(index, element); else paragraphRefs.current.delete(index);
  }
  // Reflect shares the manuscript surface but not the writing position: its own
  // map keeps the two views' refs from colliding across a view switch.
  function registerReflectParagraph(index: number, element: HTMLTextAreaElement | null) {
    if (element) reflectParagraphRefs.current.set(index, element); else reflectParagraphRefs.current.delete(index);
  }

  async function requestReview() {
    if (!manuscript.trim() || reviewLoading) return;
    const controller = new AbortController();
    reviewRequest.current = controller;
    setView("review"); setReviewLoading(true);
    try {
      const response = await askClaude(CRITIQUE_PROMPT(mode, tone), `${title ? `${title}\n\n` : ""}${manuscript}`, 2600, controller.signal);
      setReview(response);

    } catch (error) { if (controller.signal.aborted) return; setReview(`The review could not be loaded. ${error instanceof Error ? error.message : "Try again."}`); }
    finally { setReviewLoading(false); }
  }

  function download(extension: "txt" | "md") {
    const heading = title || "Untitled manuscript";
    const notes = Object.entries(reflectionAnswers).filter(([, answer]) => answer?.trim()).map(([label, answer]) => `${label}\n${answer}`).join("\n\n");
    const body = [manuscript, notes ? `Reflection notes\n\n${notes}` : ""].filter(Boolean).join("\n\n");
    const content = extension === "md" ? `# ${heading}\n\n${body}` : `${heading}\n\n${body}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${heading.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "manuscript"}.${extension}`;
    anchor.click(); URL.revokeObjectURL(anchor.href);
  }

  function startBlank() {
    if (!preserveDraft()) return;
    savedSelection.current = null; setPlumeOrigin(null); reviewRequest.current?.abort();
    setDraftId(crypto.randomUUID()); setPathways(null); setReflectionAnswers({}); setPathwayIndex(0); setReview("");
    setSelectedTopic(null); setTitle(""); setParagraphs([""]); setActiveParagraph(0); setView("write");
    requestAnimationFrame(() => enterWritingMode(writingRef.current));
  }

  const saveLabel = saveStatus === "saved" ? "All changes saved" : saveStatus === "error" ? "Could not save" : saveStatus === "saving" ? "Saving…" : "Unsaved changes";
  const saveTimeLabel = savedAt ? `Saved on this device at ${new Date(savedAt).toLocaleTimeString()}` : "Saved on this device";

  const utility = <div className="utility-bar" aria-label="Writing settings">
    <div className="segmented">
      <button className={mode === "article" ? "selected" : ""} onClick={() => setMode("article")}>Article</button>
      <button className={mode === "linkedin" ? "selected" : ""} onClick={() => setMode("linkedin")}>LinkedIn</button>
    </div>
    <div className="segmented">
      <button className={tone === "reflective" ? "selected" : ""} onClick={() => setTone("reflective")}>Reflective</button>
      <button className={tone === "editorial" ? "selected" : ""} onClick={() => setTone("editorial")}>Editorial</button>
    </div>
    <span className={`save-state ${saveStatus}`} role="status" title={saveTimeLabel}>{saveLabel}</span>
  </div>;

  return <div className={`app view-${view}`}>
    <PlumeCursor active={view === "write" || view === "reflect"} busy={reviewLoading} origin={plumeOrigin} />
    <header className="app-header">
      <button className="wordmark" onClick={() => setView("today")}><span>SVR</span><i>/</i><span>Ghostwriter</span></button>
      <nav>
        {view !== "today" ? <button onClick={() => setView("today")}>Today</button> : null}
        {view !== "write" && (title.trim() || manuscript.trim()) ? <button onClick={() => setView("write")}>Write</button> : null}
        <button onClick={() => setShowDrafts((shown) => !shown)}>Drafts <span>{drafts.length}</span></button>
      </nav>
    </header>

    {saveStatus === "error" ? <div className="storage-error" role="alert">Your changes could not be saved on this device. Export a copy before leaving.<button onClick={() => download("txt")}>Export text</button></div> : null}

    {showDrafts ? <aside className="draft-drawer">
      <div className="drawer-heading"><span>Recent drafts</span><button onClick={() => setShowDrafts(false)}>Close</button></div>
      {drafts.length ? drafts.map((draft) => <button className="draft-row" key={draft.id} onClick={() => {
        if (!preserveDraft()) return;
        savedSelection.current = null; setPlumeOrigin(null); reviewRequest.current?.abort();
        setDraftId(draft.id); setSelectedTopic(draft.topic || null); setPathways(null); setReflectionAnswers(draft.notes || {}); setPathwayIndex(0); setReview("");
        setTitle(draft.title); setParagraphs(draft.content.split(/\n\s*\n/)); setActiveParagraph(0); setShowDrafts(false); setView("write");
      }}><strong>{draft.title}</strong><span>{new Date(draft.updatedAt).toLocaleDateString()}</span></button>) : <p>No saved drafts yet.</p>}
    </aside> : null}

    {view === "today" ? <main className="today-shell">
      <p className="eyebrow">Today · {TODAY}</p>
      <h1>What is worth<br />noticing?</h1>
      <div className="today-actions"><p>Choose an idea, then find the experience only you can write about.</p><div className="today-action-links"><button className="text-action" disabled={topicsLoading} onClick={refreshTopics}>Refresh ideas</button><button className="text-action" onClick={startBlank}>Start with a blank page →</button></div></div>
      {topicsLoading && !topicResult ? <TopicDeskSkeleton /> : null}
      {topicsError ? <div className="error-line"><span>{topicsError}</span><button onClick={() => void loadTopics()}>Try again</button></div> : null}
      {topicResult && leadTopic ? <>
        <div className="desk-heading">
          <p>{topicResult.origin === "curated" ? "Evergreen prompts" : `${topicResult.stale ? "Earlier" : "Current"} source desk`}</p>
          {topicResult.generatedAt ? <time dateTime={topicResult.generatedAt}>Updated {new Date(topicResult.generatedAt).toLocaleDateString()}</time> : <span>Six prompts for reflection</span>}
        </div>
        <section className="editorial-desk" aria-label="Ideas worth considering">
          <article className="lead-story">
            <div className="story-kicker"><span>Lead idea</span><span>{editorialLens(leadTopic)}</span></div>
            <button className="lead-story-action" onClick={() => void chooseTopic(leadTopic)}>
              <h2>{displayCopy(topicPrompt(leadTopic))}</h2>
              {leadContext ? <p>{leadTopic.origin === "source-backed" ? "Why now: " : ""}{leadContext}</p> : null}
              <span className="story-invitation">Follow this thought <i>→</i></span>
            </button>
            <TopicProvenance topic={leadTopic} />
          </article>
          <div className="signal-list" aria-label="More ideas">
            {signalTopics.map((topic, index) => {
              const context = displayTeaser(topicContext(topic));
              return <article className="signal-story" key={topic.id}>
                <div className="story-kicker"><span>{String(index + 2).padStart(2, "0")}</span><span>{editorialLens(topic)}</span></div>
                <button className="signal-story-action" onClick={() => void chooseTopic(topic)}>
                  <strong>{displayCopy(topicPrompt(topic))}</strong>
                  {context ? <span>{topic.origin === "source-backed" ? "Why now: " : ""}{context}</span> : null}
                </button>
                <TopicProvenance topic={topic} />
              </article>;
            })}
          </div>
        </section>
      </> : null}
      {!topicsLoading && !topicsError && topicResult && !leadTopic ? <div className="topic-empty"><p>No ideas are available yet.</p><button className="text-action" onClick={refreshTopics}>Try another desk</button></div> : null}
    </main> : null}

    {view === "reflect" ? <main className="reflect-shell">
      <div className="guide-toolbar">
        <span><span role="status" title={saveTimeLabel}>{saveLabel}</span> · {wordCount} {wordCount === 1 ? "word" : "words"}</span>
        <button className="text-action" onClick={enterWriting}>Focus on manuscript →</button>
      </div>
      <div className="reflection-stage" ref={reflectionRef}>
        <p className="pathway-label">{selectedTopic ? editorialLens(selectedTopic) : "Your writing"}</p>
        <h1>{selectedTopic ? topicPrompt(selectedTopic) : "What would you like to explore?"}</h1>
        <ul className="writing-guides" aria-label="Guides to keep in mind">
          {writingGuides(selectedTopic).map((guide) => <li key={guide.label}><strong>{guide.label}:</strong> {guide.text}</li>)}
        </ul>
        {Object.values(reflectionAnswers).some((answer) => answer?.trim()) ? <details className="writing-context">
          <summary>Your earlier reflection notes</summary>
          {Object.entries(reflectionAnswers).map(([label, answer]) => answer?.trim() ? <div key={label}><strong>{label}</strong><p>{answer}</p></div> : null)}
          <button className="text-action" onClick={() => {
            const notes = Object.values(reflectionAnswers).filter((answer): answer is string => Boolean(answer?.trim()));
            setParagraphs((current) => [...current.filter((paragraph) => paragraph.trim()), ...notes]);
            setReflectionAnswers({});
          }}>Move earlier notes into manuscript</button>
        </details> : null}
        <div className="paragraphs">{paragraphs.map((paragraph, index) => <ParagraphEditor key={index} value={paragraph} index={index} activeIndex={activeParagraph} register={registerReflectParagraph} onActivate={setActiveParagraph} onChange={updateParagraph} onEnter={addParagraph} onEmptyBackspace={removeEmptyParagraph} onSelection={rememberSelection} />)}</div>
      </div>
    </main> : null}

    {view === "write" ? <main className="writing-shell" ref={writingRef}>
      <div className="document-toolbar" aria-label="Document actions">
        <span className="document-status" role="status" title={saveTimeLabel}>{saveLabel}</span>
        <div>
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          {selectedTopic ? <button onClick={() => void openReflection()}>Writing guides</button> : null}
          {__ANTHROPIC_CONFIGURED__ ? <button disabled={!manuscript.trim()} onClick={() => void requestReview()}>Review</button> : null}
          <button onClick={() => download("md")}>Export</button>
          <button onClick={startBlank}>New draft</button>
        </div>
      </div>
      <section className="manuscript">
        {selectedTopic ? <details className="writing-context"><summary>Writing from · {editorialLens(selectedTopic)}</summary><p>{topicPrompt(selectedTopic)}</p><TopicProvenance topic={selectedTopic} /></details> : <p className="manuscript-label">Your manuscript</p>}
        {Object.values(reflectionAnswers).some((answer) => answer?.trim()) ? <details className="writing-context"><summary>Your reflection notes</summary>{Object.entries(reflectionAnswers).map(([label, answer]) => answer?.trim() ? <div key={label}><strong>{label}</strong><p>{answer}</p></div> : null)}</details> : null}
        <input name="title" autoComplete="off" className="manuscript-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Untitled" aria-label="Manuscript title" />
        <div className="paragraphs">{paragraphs.map((paragraph, index) => <ParagraphEditor key={index} value={paragraph} index={index} activeIndex={activeParagraph} register={registerParagraph} onActivate={setActiveParagraph} onChange={updateParagraph} onEnter={addParagraph} onEmptyBackspace={removeEmptyParagraph} onSelection={rememberSelection} />)}</div>
      </section>
    </main> : null}

    {view === "review" ? <main className="review-shell">
      <div className="review-toolbar">{utility}<button className="primary-action" onClick={() => setView("write")}>Return to manuscript</button></div>
      <div className="review-columns">
        <article className="review-manuscript"><p className="eyebrow">Manuscript · {wordCount} words</p><h1>{title || "Untitled manuscript"}</h1>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
        <aside className="editorial-notes">
          <div className="notes-heading"><span>Ghostwriter review</span><button disabled={reviewLoading} onClick={() => void requestReview()}>Review again</button></div>
          {reviewLoading ? <p className="loading-line" role="status">Reading closely…</p> : <div className="review-copy">{review}</div>}
          {!reviewLoading && review ? <div className="export-actions"><button onClick={() => download("md")}>Download Markdown</button><button onClick={() => download("txt")}>Download text</button><button onClick={() => window.open("https://medium.com/new-story", "_blank", "noopener,noreferrer")}>Open Medium</button></div> : null}
        </aside>
      </div>
    </main> : null}
  </div>;
}
