import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { carriageReturn, guideOverstrike, recedeGuides, enterWritingMode, focusParagraph, paperImpulse, pathwayEnter, pathwayExit, quietParagraph, strikeOf } from "./src/motion";
import { advanceDeskOffset, loadTopics as loadTopicDesk, syncStatus, type DisplayTopic, type EditorialLens, type TopicResult } from "./src/topicSource";

import { measureCaret } from "./src/caret";
import { stopWritingScroll } from "./src/motion";
import { writingGuides } from "./src/writingGuides";
import { enableTypewriterSound, muteTypewriterSound, playTypewriterSound, prepareTypewriterSound } from "./src/typewriterAudio";

import { initialGhost, type GhostState } from "./src/ghostModel";
const Ghost = lazy(() => import("./src/Ghost"));

declare const __GHOST_CONFIGURED__: boolean;

type View = "today" | "reflect" | "write" | "review";
type Mode = "article" | "linkedin";
type Tone = "reflective" | "editorial";
type PathwayType = "Memory" | "Tension" | "Outcome" | "System" | "People";
type Topic = DisplayTopic;
type Pathway = { prompt: string; type: PathwayType };
type Reflection = { angle: string; pathways: Pathway[] };
type Draft = { guideChecks?: string[]; ghost?: GhostState; id: string; title: string; updatedAt: string; content: string; topic?: Topic | null; notes?: Partial<Record<PathwayType, string>> };
type Session = {
  guideChecks?: string[];
  ghost?: GhostState;
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
const SOUND_KEY = "svr-ghostwriter-sound";
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
    <a href={source.url} target="_blank" rel="noreferrer" title={source.title} aria-label={`${sourceLabel(source.name)}: ${source.title} (opens in a new tab)`}>{sourceLabel(source.name)} ↗</a>
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

async function requestGhost(_system: string, content: string, signal: AbortSignal) {
  const response = await fetch(import.meta.env.VITE_GHOST_API_URL || "/api/ghost/read", {
    method: "POST", signal, headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: JSON.parse(content) })
  });
  if (!response.ok) throw new Error(response.status === 429 ? "reading-limit" : `Reading failed (${response.status})`);
  const data = await response.json();
  if (!data.slip) throw new Error("Invalid reading response");
  return JSON.stringify(data.slip);
}

/** How long the typing has to stop before the writing position settles. */
const SETTLE_DELAY = 600;

function caretOffset(element: HTMLTextAreaElement) {
  return measureCaret(element).offsetY;
}

type ParagraphEditorProps = {
  value: string; index: number; activeIndex: number; paragraphCount: number; soundOn: boolean;
  register: (index: number, element: HTMLTextAreaElement | null) => void;
  onActivate: (index: number) => void;
  onChange: (index: number, value: string) => void;
  onEnter: (index: number, before: string, after: string) => void;
  onMergeBackward: (index: number) => void;
  onMergeForward: (index: number) => void;
  onMoveCaret: (index: number, position: "start" | "end") => void;
  onSelection: (index: number, start: number, end: number) => void;
  /** Overrides the default empty-paragraph cue (Reflect uses the Memory guide). */
  placeholder?: string;
};

function ParagraphEditor({ value, index, activeIndex, paragraphCount, soundOn, register, onActivate, onChange, onEnter, onMergeBackward, onMergeForward, onMoveCaret, onSelection, placeholder }: ParagraphEditorProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const resize = useCallback(() => {
    const element = localRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.max(40, element.scrollHeight)}px`;
  }, []);
  useLayoutEffect(resize, [resize, value]);

  function setRef(element: HTMLTextAreaElement | null) {
    localRef.current = element;
    register(index, element);
  }

  /** The mechanism reacts to keys that do work on the page. Shortcuts, arrows
   * and bare modifiers are not strikes (typewriting-feel.md §5). */
  function mechanicalResponse(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
    const { key } = event;
    if (key.length !== 1 && key !== "Backspace" && key !== "Delete") return;
    const strike = strikeOf(key);
    paperImpulse(localRef.current, strike);
    if (soundOn) playTypewriterSound(strike);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    stopWritingScroll();
    mechanicalResponse(event);
    const start = event.currentTarget.selectionStart;
    const end = event.currentTarget.selectionEnd;
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onEnter(index, value.slice(0, start), value.slice(end));
      // Only a real paragraph split earns the carriage cue, after committing
      // the edit. Soft line breaks, IME and title navigation stay silent.
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        carriageReturn(localRef.current?.closest(".manuscript") as HTMLElement | null);
        if (soundOn) playTypewriterSound("return");
      }
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || start !== end || event.nativeEvent.isComposing) return;
    if (event.key === "Backspace" && start === 0 && index > 0) {
      event.preventDefault(); onMergeBackward(index);
    } else if (event.key === "Delete" && start === value.length && index < paragraphCount - 1) {
      event.preventDefault(); onMergeForward(index);
    } else if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && start === 0 && index > 0) {
      event.preventDefault(); onMoveCaret(index - 1, "end");
    } else if ((event.key === "ArrowRight" || event.key === "ArrowDown") && start === value.length && index < paragraphCount - 1) {
      event.preventDefault(); onMoveCaret(index + 1, "start");
    }
  }

  return <textarea
    ref={setRef}
    className={`manuscript-paragraph ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-past" : ""} ${index < activeIndex - 1 ? "is-distant" : ""}`}
    value={value} rows={1} name={`paragraph-${index}`} autoComplete="off" aria-label={`Paragraph ${index + 1}`}
    placeholder={placeholder ?? (index === 0 ? "Start with what you noticed…" : "Continue the thought…")}
    onSelect={(event) => onSelection(index, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)}
    onFocus={() => onActivate(index)} onChange={(event) => onChange(index, event.target.value)} onKeyDown={handleKeyDown}
  />;
}

export default function Ghostwriter() {
  const [initialSession] = useState(() => readStorage(SESSION_KEY, INITIAL_SESSION));
  const restored = useRef(initialSession);
  const [draftId, setDraftId] = useState(() => initialSession.draftId || crypto.randomUUID());
  const [guideChecks, setGuideChecks] = useState<string[]>(() => initialSession.guideChecks ?? []);
  const [ghost, setGhost] = useState(() => initialSession.ghost ?? initialGhost(Boolean(initialSession.selectedTopic)));
  const [view, setView] = useState<View>(restored.current.view);
  // Guides fold to their labels only when Reflect opens on a draft that already
  // has words, so the manuscript never jumps under the caret mid-sentence.
  const [guidesFolded, setGuidesFolded] = useState(false);
  const guideSetRef = useRef<HTMLDivElement | null>(null);
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const openGuideRef = useRef<HTMLParagraphElement | null>(null);
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
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const [savedAt, setSavedAt] = useState<string | undefined>(initialSession.savedAt);
  const savedSelection = useRef<{ index: number; start: number; end: number } | null>(null);
  const pendingCaret = useRef<{ index: number; offset: number } | null>(null);
  const previousView = useRef<View | null>(null);
  const lastPageView = useRef<View | null>(null);
  const [drafts, setDrafts] = useState(() => readStorage<Draft[]>(DRAFTS_KEY, []));
  const [showDrafts, setShowDrafts] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(() => readStorage<boolean>(SOUND_KEY, false) === true);
  const [soundPending, setSoundPending] = useState(false);
  const [soundError, setSoundError] = useState<"unavailable" | "storage" | null>(null);
  const draftsRef = useRef<HTMLDivElement | null>(null);
  const todayHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const reflectHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const reviewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const draftsOpener = useRef<HTMLElement | null>(null);
  const reflectionRef = useRef<HTMLDivElement | null>(null);
  const writingRef = useRef<HTMLDivElement | null>(null);
  const paragraphRefs = useRef(new Map<number, HTMLTextAreaElement>());
  const reflectParagraphRefs = useRef(new Map<number, HTMLTextAreaElement>());
  const lastSavedSession = useRef(JSON.stringify(restored.current));
  const deletedDraftIds = useRef(new Set<string>());
  const topicsRequested = useRef(false);

  useEffect(() => { if (soundOn) prepareTypewriterSound(); }, []);

  useEffect(() => {
    if (!exportOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setExportOpen(false);
      exportRef.current?.querySelector<HTMLButtonElement>(".export-trigger")?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [exportOpen]);

  useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  async function toggleSound() {
    if (soundOn) {
      muteTypewriterSound();
      setSoundOn(false);
      setSoundError(null);
      try { writeStorage(SOUND_KEY, false); } catch { setSoundError("storage"); }
      return;
    }
    setSoundPending(true);
    const enabled = await enableTypewriterSound();
    setSoundPending(false);
    if (!enabled) { setSoundError("unavailable"); return; }
    setSoundError(null);
    setSoundOn(true);
    try { writeStorage(SOUND_KEY, true); } catch { setSoundError("storage"); }
  }

  const manuscript = paragraphs.join("\n\n");
  const wordCount = manuscript.trim().split(/\s+/).filter(Boolean).length;
  const guides = writingGuides(selectedTopic);
  const hasWriting = wordCount > 0;
  useEffect(() => recedeGuides(guideSetRef.current, hasWriting), [hasWriting, view, guidesFolded]);
  useEffect(() => {
    if (view !== "reflect") return;
    setGuidesFolded(wordCount > 0); setOpenGuide(null);
    // Folding is decided on entry only; later typing must not reflow the page.
  }, [view, draftId]);
  useEffect(() => { if (openGuide) pathwayEnter(openGuideRef.current); }, [openGuide]);
  function guideMark(label: string, text: string) {
    const checked = guideChecks.includes(label);
    return <label className={`guide-mark ${checked ? "is-marked" : ""}`}><input type="checkbox" checked={checked} aria-label={`Mark ${label} as explored`} onChange={event => {
      const marked = event.currentTarget.checked;
      setGuideChecks(current => marked ? [...current, label] : current.filter(item => item !== label));
      guideOverstrike(event.currentTarget.parentElement?.querySelector<HTMLElement>(".guide-overstrike") ?? null, marked);
    }}/><span className="guide-mark-copy"><strong>{label}:</strong> {text}<span className="guide-overstrike" aria-hidden="true" /></span></label>;
  }
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

  // Re-render the sync line each minute while the source desk is on screen.
  const [clock, setClock] = useState(() => Date.now());
  const showsSync = view === "today" && Boolean(topicResult?.generatedAt);
  useEffect(() => {
    if (!showsSync) return;
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [showsSync]);
  const sync = topicResult?.generatedAt ? syncStatus(topicResult.generatedAt, new Date(clock)) : null;

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
    const session: Session = { guideChecks, ghost, draftId, view, mode, tone, selectedTopic, pathways, pathwayIndex, reflectionAnswers, title, paragraphs, activeParagraph, review };
    const serialized = JSON.stringify(session);
    if (serialized === lastSavedSession.current) return;
    setSaveStatus("unsaved");
    const persist = () => {
      if (deletedDraftIds.current.has(draftId)) return;
      setSaveStatus("saving");
      try {
        const timestamp = new Date().toISOString();
        if (title.trim() || manuscript.trim() || Object.values(reflectionAnswers).some((answer) => answer?.trim()) || readStorage<Draft[]>(DRAFTS_KEY, []).some((draft) => draft.id === draftId)) {
          const draft: Draft = { guideChecks, ghost, id: draftId, title: title || "Untitled manuscript", content: manuscript, topic: selectedTopic, notes: reflectionAnswers, updatedAt: new Date().toISOString() };
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
  }, [guideChecks, ghost, draftId, view, mode, tone, selectedTopic, pathways, pathwayIndex, reflectionAnswers, title, paragraphs, activeParagraph, review, manuscript]);

  useLayoutEffect(() => {
    const previous = lastPageView.current;
    if (previous === view) return;
    lastPageView.current = view;
    if (view !== "write" && previous !== null) {
      stopWritingScroll();
      document.scrollingElement?.scrollTo(0, 0);
    }
    if (view === "today" && previous !== null) todayHeadingRef.current?.focus({ preventScroll: true });
    if (view === "reflect") reflectHeadingRef.current?.focus({ preventScroll: true });
    if (view === "review") reviewHeadingRef.current?.focus({ preventScroll: true });
  }, [view]);

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
    if (element && (!changedView || (writing && !matchMedia("(pointer: coarse)").matches))) {
      element.focus({ preventScroll: true });
      const selection = savedSelection.current;
      if (selection?.index === activeParagraph) element.setSelectionRange(selection.start, selection.end);
    }
    if (!writing || !element) return;
    focusParagraph(element, caretOffset(element));
    quietParagraph([...refs.entries()].map(([index, paragraph]) => ({ element: paragraph, distance: activeParagraph - index })));
  }, [activeParagraph, view]);

  // A forward merge updates the focused textarea without changing its index.
  // Restore the join position before paint, rather than one frame later.
  useLayoutEffect(() => {
    const pending = pendingCaret.current;
    if (!pending || (view !== "write" && view !== "reflect")) return;
    const refs = view === "write" ? paragraphRefs.current : reflectParagraphRefs.current;
    const element = refs.get(pending.index);
    if (!element) return;
    element.setSelectionRange(pending.offset, pending.offset);
    pendingCaret.current = null;
  }, [paragraphs, view]);

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

  // The drafts drawer is a modal dialog: focus enters it, stays inside while it is
  // open, and returns to the control that opened it.
  useEffect(() => {
    if (!showDrafts) return;
    const drawer = draftsRef.current;
    if (!drawer) return;
    const opener = draftsOpener.current;
    const focusable = () => [...drawer.querySelectorAll<HTMLElement>("button, [href], input, textarea, [tabindex]:not([tabindex='-1'])")];
    focusable()[0]?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setShowDrafts(false); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !drawer.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !drawer.contains(active))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore after the drawer has actually gone, or removing it blurs us again.
      requestAnimationFrame(() => { if (opener?.isConnected) opener.focus(); });
    };
  }, [showDrafts]);

  function preserveDraft() {
    if (deletedDraftIds.current.has(draftId)) return true;
    if (!title.trim() && !manuscript.trim() && !Object.values(reflectionAnswers).some((answer) => answer?.trim())) return true;
    try {
      const draft: Draft = { guideChecks, ghost, id: draftId, title: title || "Untitled manuscript", content: manuscript, topic: selectedTopic, notes: reflectionAnswers, updatedAt: new Date().toISOString() };
      const updated = [draft, ...drafts.filter((item) => item.id !== draftId)];
      writeStorage(DRAFTS_KEY, updated); setDrafts(updated);
      return true;
    } catch { setSaveStatus("error"); return false; }
  }

  function chooseTopic(topic: Topic) {
    if (!preserveDraft()) return;
    savedSelection.current = null;
    setGuideChecks([]); setGhost(initialGhost(true)); setDraftId(crypto.randomUUID()); setSelectedTopic(topic); setTitle(topic.title);
    setParagraphs([""]); setActiveParagraph(0); setPathwayIndex(0);
    setReflectionAnswers({}); setReview(""); setPathways(fallbackReflection(topic)); setView("reflect");
    requestAnimationFrame(() => pathwayEnter(reflectionRef.current));
  }

  function openReflection() {
    setView("reflect");
  }

  function enterWriting() {
    setView("write");
  }

  function rememberSelection(index: number, start: number, end: number) {
    savedSelection.current = { index, start, end };
  }

  function updateParagraph(index: number, value: string) {
    stopWritingScroll();
    // The text model is authoritative: commit first, then let the surface react.
    setParagraphs((current) => current.map((paragraph, paragraphIndex) => paragraphIndex === index ? value : paragraph));
  }
  function addParagraph(index: number, before: string, after: string) {
    savedSelection.current = { index: index + 1, start: 0, end: 0 };
    setParagraphs((current) => [...current.slice(0, index), before, after, ...current.slice(index + 1)]);
    setActiveParagraph(index + 1);
  }
  function mergeBackward(index: number) {
    const end = paragraphs[index - 1]?.length || 0;
    savedSelection.current = { index: index - 1, start: end, end };
    setParagraphs((current) => [...current.slice(0, index - 1), `${current[index - 1]}${current[index]}`, ...current.slice(index + 1)]);
    setActiveParagraph(index - 1);
  }
  function mergeForward(index: number) {
    const end = paragraphs[index]?.length || 0;
    savedSelection.current = { index, start: end, end };
    pendingCaret.current = { index, offset: end };
    setParagraphs((current) => [...current.slice(0, index), `${current[index]}${current[index + 1]}`, ...current.slice(index + 2)]);
  }
  function moveCaret(index: number, position: "start" | "end") {
    const offset = position === "end" ? paragraphs[index]?.length || 0 : 0;
    savedSelection.current = { index, start: offset, end: offset };
    setActiveParagraph(index);
  }
  function registerParagraph(index: number, element: HTMLTextAreaElement | null) {
    if (element) paragraphRefs.current.set(index, element); else paragraphRefs.current.delete(index);
  }
  // Reflect shares the manuscript surface but not the writing position: its own
  // map keeps the two views' refs from colliding across a view switch.
  function registerReflectParagraph(index: number, element: HTMLTextAreaElement | null) {
    if (element) reflectParagraphRefs.current.set(index, element); else reflectParagraphRefs.current.delete(index);
  }

  function exportContent(extension: "txt" | "md") {
    const heading = title || "Untitled manuscript";
    const notes = Object.entries(reflectionAnswers).filter(([, answer]) => answer?.trim());
    const parts = [extension === "md" ? `# ${heading}` : heading, manuscript];
    if (notes.length) {
      parts.push(extension === "md"
        ? `## Reflection notes\n\n${notes.map(([label, answer]) => `### ${label}\n\n${answer}`).join("\n\n")}`
        : `Reflection notes\n\n${notes.map(([label, answer]) => `${label}\n${answer}`).join("\n\n")}`);
    }
    return parts.filter(Boolean).join("\n\n");
  }

  function download(extension: "txt" | "md") {
    const heading = title || "Untitled manuscript";
    const content = exportContent(extension);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${heading.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "manuscript"}.${extension}`;
    anchor.click(); URL.revokeObjectURL(anchor.href);
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(exportContent("md"));
      setCopyMessage("Markdown copied");
      setExportOpen(false);
    } catch { setCopyMessage("Could not copy Markdown. Check clipboard access."); }
  }

  function startBlank() {
    if (!preserveDraft()) return;
    savedSelection.current = null;
    setGuideChecks([]); setGhost(initialGhost(false)); setDraftId(crypto.randomUUID()); setPathways(null); setReflectionAnswers({}); setPathwayIndex(0); setReview("");
    setSelectedTopic(null); setTitle(""); setParagraphs([""]); setActiveParagraph(0); setView("write");
    requestAnimationFrame(() => enterWritingMode(writingRef.current));
  }

  function deleteDraft(draft: Draft) {
    if (!window.confirm(`Delete “${draft.title}”? This draft cannot be recovered.`)) return;
    const remaining = drafts.filter((item) => item.id !== draft.id);
    const deletingActive = draft.id === draftId;
    const nextSession: Session | null = deletingActive
      ? { ...INITIAL_SESSION, draftId: crypto.randomUUID() }
      : null;
    try {
      writeStorage(DRAFTS_KEY, remaining);
      if (nextSession) {
        try { writeStorage(SESSION_KEY, nextSession); }
        catch (error) { writeStorage(DRAFTS_KEY, drafts); throw error; }
      }
    } catch { setSaveStatus("error"); return; }

    deletedDraftIds.current.add(draft.id);
    setDrafts(remaining);
    if (!nextSession) return;
    savedSelection.current = null;

    lastSavedSession.current = JSON.stringify(nextSession);
    setGuideChecks([]); setGhost(initialGhost(false));
    setDraftId(nextSession.draftId!);
    setView("today"); setMode("article"); setTone("reflective");
    setSelectedTopic(null); setPathways(null); setPathwayIndex(0);
    setReflectionAnswers({}); setTitle(""); setParagraphs([""]);
    setActiveParagraph(0); setReview(""); setSavedAt(undefined); setSaveStatus("saved");
  }

  const saveLabel = saveStatus === "saved" ? "All changes saved" : saveStatus === "error" ? "Could not save" : saveStatus === "saving" ? "Saving…" : "Unsaved changes";
  const manuscriptDateLabel = savedAt ? new Date(savedAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : TODAY;
  const saveTimeLabel = savedAt ? `Saved on this device at ${new Date(savedAt).toLocaleTimeString()}` : "Saved on this device";
  const soundControl = <button className="sound-toggle" type="button" aria-pressed={soundOn} disabled={soundPending} onClick={() => void toggleSound()}>{soundOn ? "Sound on" : "Sound off"}</button>;

  const utility = <div className="utility-bar" aria-label="Writing settings">
    <div className="segmented">
      <button className={mode === "article" ? "selected" : ""} onClick={() => setMode("article")}>Article</button>
      <button className={mode === "linkedin" ? "selected" : ""} onClick={() => setMode("linkedin")}>LinkedIn</button>
    </div>
    <div className="segmented">
      <button className={tone === "reflective" ? "selected" : ""} onClick={() => setTone("reflective")}>Reflective</button>
      <button className={tone === "editorial" ? "selected" : ""} onClick={() => setTone("editorial")}>Editorial</button>
    </div>
    <span className={`save-state ${saveStatus}`} title={saveTimeLabel}>{saveLabel}</span>
  </div>;

  return <div className={`app view-${view}`} data-theme="typewriter">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="app-header">
      <button className="wordmark" onClick={() => setView("today")}><span>SVR</span><i>/</i><span>Ghostwriter</span></button>
      <nav>
        {view !== "today" ? <button onClick={() => setView("today")}>Today</button> : null}
        {view !== "write" && view !== "reflect" && (title.trim() || manuscript.trim()) ? <button onClick={() => setView("write")}>Write</button> : null}
        {view === "write" || view === "reflect" ? soundControl : null}
        <button aria-haspopup="dialog" aria-expanded={showDrafts} onClick={(event) => { draftsOpener.current = event.currentTarget; setShowDrafts((shown) => !shown); }}>Drafts <span>{drafts.length}</span></button>
      </nav>
    </header>

    {saveStatus === "error" ? <div className="storage-error" role="alert">Your changes could not be saved on this device. Export a copy before leaving.<button onClick={() => download("txt")}>Export text</button></div> : null}

    {showDrafts ? <div className="draft-drawer" ref={draftsRef} role="dialog" aria-modal="true" aria-labelledby="drafts-heading">
      <div className="drawer-heading"><span id="drafts-heading">Recent drafts</span><button onClick={() => setShowDrafts(false)}>Close</button></div>
      {drafts.length ? drafts.map((draft) => <div className="draft-row" key={draft.id}>
        <button className="draft-open" type="button" onClick={() => {
          if (!preserveDraft()) return;
          savedSelection.current = null;
          setDraftId(draft.id); setSelectedTopic(draft.topic || null); setPathways(null); setReflectionAnswers(draft.notes || {}); setPathwayIndex(0); setReview("");
          setGuideChecks(draft.guideChecks ?? []); setGhost(draft.ghost ?? initialGhost(Boolean(draft.topic))); setTitle(draft.title); setParagraphs(draft.content.split(/\n\s*\n/)); setActiveParagraph(0); setShowDrafts(false); setView("write");
        }} aria-label={`Open draft: ${draft.title}`}><strong>{draft.title}</strong><time dateTime={draft.updatedAt}>{new Date(draft.updatedAt).toLocaleDateString()}</time></button>
        <button className="draft-delete" type="button" aria-label={`Delete draft: ${draft.title}`} title={`Delete ${draft.title}`} onClick={() => deleteDraft(draft)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" /></svg>
        </button>
      </div>) : <p>No saved drafts yet.</p>}
    </div> : null}

    {view === "today" ? <main className="today-shell" id="main-content" tabIndex={-1}>
      <p className="eyebrow">Today · {TODAY}</p>
      <h1 ref={todayHeadingRef} tabIndex={-1}>What is worth<br />noticing?</h1>
      <div className="today-actions"><p>Choose an idea, then find the experience only you can write about.</p><div className="today-action-links"><button className="text-action" disabled={topicsLoading} onClick={refreshTopics}>Refresh ideas</button><button className="text-action" onClick={startBlank}>Start with a blank page →</button></div></div>
      {topicsLoading && !topicResult ? <TopicDeskSkeleton /> : null}
      {topicsError ? <div className="error-line"><span>{topicsError}</span><button onClick={() => void loadTopics()}>Try again</button></div> : null}
      {topicResult && leadTopic ? <>
        <div className="desk-heading">
          <p>{topicResult.origin === "curated" ? "Evergreen prompts" : `${topicResult.stale ? "Earlier" : "Current"} source desk`}</p>
          {topicResult.generatedAt && sync ? <span className="sync-status" title={`Topics are checked every 8 hours. Last synced ${new Date(topicResult.generatedAt).toLocaleString()}.`}><time dateTime={topicResult.generatedAt}>{sync.synced}</time><span aria-hidden="true"> • </span><span className="visually-hidden">. </span>{sync.next}</span> : <span>Six prompts for reflection</span>}
        </div>
        {topicResult.shortfalls?.length ? <p className="loading-line" role="status">
          Showing {topics.length} of 6 source-backed ideas. {topicResult.shortfalls.map(({ category, available }) => `${category}: ${available} of 2 available`).join("; ")}. There are not enough qualified topics in these categories in this source desk.
        </p> : null}
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

    {view === "reflect" ? <main className="reflect-shell" id="main-content" tabIndex={-1}>
      <div className="guide-toolbar">
        <span className="guide-toolbar-meta"><span className="guide-lens">{selectedTopic ? editorialLens(selectedTopic) : "Your writing"}</span><span><span title={saveTimeLabel}>{saveLabel}</span> · {wordCount} {wordCount === 1 ? "word" : "words"}</span></span>
        <button className="text-action" onClick={enterWriting}>Focus on manuscript →</button>
      </div>
      {soundError ? <p className="sound-error" role="alert">{soundError === "storage" ? "Sound preference could not be saved on this device." : "Sound could not start in this browser."}</p> : null}
      <div className="reflection-stage" ref={reflectionRef}>
        <h1 ref={reflectHeadingRef} tabIndex={-1}>{selectedTopic ? topicPrompt(selectedTopic) : "What would you like to explore?"}</h1>
        {guides.length ? <div ref={guideSetRef} className={`guide-set ${wordCount > 0 ? "is-receded" : ""}`}>
          <div className="guide-note"><p>Angles, not steps — use any, in any order. Mark an angle when you’ve explored it.</p>
            <button className="text-action" type="button" aria-expanded={!guidesFolded} aria-controls="writing-guides" onClick={() => { setGuidesFolded((folded) => !folded); setOpenGuide(null); }}>{guidesFolded ? "Show all angles" : "Fold to labels"}</button>
          </div>
          {guidesFolded ? <div className="guide-labels" id="writing-guides" aria-label="Guides to keep in mind">
            <div className="guide-label-row">{guides.map((guide) => <button key={guide.label} type="button" className={openGuide === guide.label ? "selected" : ""} aria-expanded={openGuide === guide.label} aria-controls="open-guide" onClick={() => setOpenGuide((current) => current === guide.label ? null : guide.label)}>{guideChecks.includes(guide.label) ? <s>{guide.label}</s> : guide.label}</button>)}</div>
            {openGuide ? <p className="open-guide" id="open-guide" ref={openGuideRef}>{guideMark(openGuide, guides.find((guide) => guide.label === openGuide)?.text ?? "")}</p> : null}
          </div> : <ul className="writing-guides" id="writing-guides" aria-label="Guides to keep in mind">
            {guides.map((guide) => <li key={guide.label}>{guideMark(guide.label, guide.text)}</li>)}
          </ul>}
        </div> : null}
        {Object.values(reflectionAnswers).some((answer) => answer?.trim()) ? <details className="writing-context">
          <summary>Your earlier reflection notes</summary>
          {Object.entries(reflectionAnswers).map(([label, answer]) => answer?.trim() ? <div key={label}><strong>{label}</strong><p>{answer}</p></div> : null)}
          <button className="text-action" onClick={() => {
            const notes = Object.values(reflectionAnswers).filter((answer): answer is string => Boolean(answer?.trim()));
            setParagraphs((current) => [...current.filter((paragraph) => paragraph.trim()), ...notes]);
            setReflectionAnswers({});
          }}>Move earlier notes into manuscript</button>
        </details> : null}
        <div className="paragraphs" role="group" aria-label="Manuscript">{paragraphs.map((paragraph, index) => <ParagraphEditor key={index} value={paragraph} index={index} activeIndex={activeParagraph} paragraphCount={paragraphs.length} soundOn={soundOn} register={registerReflectParagraph} placeholder={index === 0 && guides[0] ? guides[0].text : undefined} onActivate={setActiveParagraph} onChange={updateParagraph} onEnter={addParagraph} onMergeBackward={mergeBackward} onMergeForward={mergeForward} onMoveCaret={moveCaret} onSelection={rememberSelection} />)}</div>
      </div>
    </main> : null}

    {view === "write" ? <><main className="writing-shell" id="main-content" tabIndex={-1} ref={writingRef}>
      <div className="document-toolbar" aria-label="Document actions">
        <span className="document-status" title={saveTimeLabel}>{saveLabel}</span>
        <div>
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          {selectedTopic ? <button onClick={() => void openReflection()}>Writing guides</button> : null}

          <div className="export-control" ref={exportRef}>
            <button className="export-trigger" type="button" aria-haspopup="true" aria-expanded={exportOpen} aria-controls={exportOpen ? "export-options" : undefined} onClick={() => { setCopyMessage(null); setExportOpen((open) => !open); }}>Export ▾</button>
            {exportOpen ? <div className="export-popover" id="export-options" aria-label="Export options">
              <button type="button" onClick={() => { download("md"); setExportOpen(false); }}>Download Markdown</button>
              <button type="button" onClick={() => void copyMarkdown()}>Copy Markdown</button>
            </div> : null}
            {copyMessage ? <span className="export-feedback" role="status">{copyMessage}</span> : null}
          </div>
          <button onClick={startBlank}>New draft</button>
        </div>
      </div>
      {soundError ? <p className="sound-error" role="alert">{soundError === "storage" ? "Sound preference could not be saved on this device." : "Sound could not start in this browser."}</p> : null}
      <section className="manuscript">
        <h1 className="visually-hidden">{title || "Untitled manuscript"}</h1>
        <input name="title" autoComplete="off" className="manuscript-title" value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); paragraphRefs.current.get(0)?.focus(); } }} placeholder="Untitled" aria-label="Manuscript title" />
        <time className="manuscript-date" dateTime={savedAt ?? undefined}>{manuscriptDateLabel}</time>
        {selectedTopic ? <details className="writing-context"><summary>Writing from · {editorialLens(selectedTopic)}</summary><p>{topicPrompt(selectedTopic)}</p><TopicProvenance topic={selectedTopic} /></details> : null}
        {Object.values(reflectionAnswers).some((answer) => answer?.trim()) ? <details className="writing-context"><summary>Your reflection notes</summary>{Object.entries(reflectionAnswers).map(([label, answer]) => answer?.trim() ? <div key={label}><strong>{label}</strong><p>{answer}</p></div> : null)}</details> : null}
        <div className="paragraphs" role="group" aria-label="Manuscript">{paragraphs.map((paragraph, index) => <ParagraphEditor key={index} value={paragraph} index={index} activeIndex={activeParagraph} paragraphCount={paragraphs.length} soundOn={soundOn} register={registerParagraph} onActivate={setActiveParagraph} onChange={updateParagraph} onEnter={addParagraph} onMergeBackward={mergeBackward} onMergeForward={mergeForward} onMoveCaret={moveCaret} onSelection={rememberSelection} />)}</div>
      </section>
    </main>
      <Suspense fallback={null}><Ghost key={draftId} drafts={drafts} draftId={draftId} state={ghost} onChange={setGhost} title={title} paragraphs={paragraphs} guides={guides} prompted={Boolean(selectedTopic)} mode={mode} tone={tone} onMode={setMode} onTone={setTone} configured={__GHOST_CONFIGURED__} request={requestGhost} /></Suspense>
    </> : null}

    {view === "review" ? <main className="review-shell" id="main-content" tabIndex={-1}>
      <div className="review-toolbar">{utility}<button className="primary-action" onClick={() => setView("write")}>Return to manuscript</button></div>
      <div className="review-columns">
        <article className="review-manuscript"><p className="eyebrow">Manuscript · {wordCount} words</p><h1 ref={reviewHeadingRef} tabIndex={-1}>{title || "Untitled manuscript"}</h1>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
        <aside className="editorial-notes">
          <div className="notes-heading"><span>Ghostwriter review</span><button onClick={() => setView("write")}>Open Ghost in manuscript</button></div>
          <div className="review-copy">{review}</div>
          {review ? <div className="export-actions"><button onClick={() => download("md")}>Download Markdown</button><button onClick={() => download("txt")}>Download text</button><button onClick={() => void copyMarkdown()}>Copy Markdown</button><button onClick={() => window.open("https://medium.com/new-story", "_blank", "noopener,noreferrer")}>Open Medium</button>{copyMessage ? <span role="status">{copyMessage}</span> : null}</div> : null}
        </aside>
      </div>
    </main> : null}
  </div>;
}
