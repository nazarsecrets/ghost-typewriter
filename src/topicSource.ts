// Client topic source (PRD FR-1.3, §10). Fetches the source-backed manifest,
// validates it, and selects a balanced set preferring unseen topics. Falls back
// to the honest Evergreen curated desk when no valid manifest is available.
// No Claude, no secrets — this runs entirely in the browser off a static file.

import { curatedDesk, type Tag } from "./topics";

export type Category = "Latest" | "Trending" | "Under the Radar";

export type SourceBackedTopic = {
  id: string;
  title: string;
  teaser: string;
  tag: Tag;
  origin: "source-backed";
  category: Category;
  publishedAt: string;
  since: string;
  relevanceScore: number;
  categoryReason: string;
  sources: Array<{ name: string; title: string; url: string; publishedAt: string }>;
};

type Manifest = {
  version: 1;
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  topics: SourceBackedTopic[];
};

export type DisplayTopic =
  | SourceBackedTopic
  | (ReturnType<typeof curatedDesk>[number]);

export type TopicResult = {
  origin: "source-backed" | "curated";
  topics: DisplayTopic[];
  generatedAt?: string; // manifest age, when source-backed
  stale?: boolean; // manifest older than STALE_HOURS
};

const MANIFEST_URL = `${import.meta.env.BASE_URL}topics.json`;
const SEEN_KEY = "svr-ghostwriter-seen-topics";
const OFFSET_KEY = "svr-ghostwriter-desk-offset";
const STALE_HOURS = 24;

function isValidManifest(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") return false;
  const m = value as Manifest;
  if (m.version !== 1 || !Array.isArray(m.topics) || m.topics.length === 0) return false;
  return m.topics.every(
    (t) => t.id && t.title && t.tag && Array.isArray(t.sources) && t.sources[0]?.url && !Number.isNaN(Date.parse(t.publishedAt)),
  );
}

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

function rememberSeen(ids: string[]) {
  try {
    const merged = [...readSeen(), ...ids];
    // Keep the most recent 200 ids so history rotates without growing forever.
    localStorage.setItem(SEEN_KEY, JSON.stringify(merged.slice(-200)));
  } catch {
    /* storage full or unavailable — rotation degrades gracefully */
  }
}

// Balanced 2/2/2 selection, preferring unseen topics within each category.
function selectBalanced(topics: SourceBackedTopic[], seen: Set<string>): SourceBackedTopic[] {
  const categories: Category[] = ["Latest", "Trending", "Under the Radar"];
  const chosen: SourceBackedTopic[] = [];

  for (const category of categories) {
    const inCategory = topics.filter((t) => t.category === category);
    const unseen = inCategory.filter((t) => !seen.has(t.id));
    const seenPool = inCategory.filter((t) => seen.has(t.id));
    chosen.push(...[...unseen, ...seenPool].slice(0, 2)); // already rank-ordered
  }
  return chosen;
}

// Advance the curated desk to a fresh deterministic set.
export function advanceDeskOffset(): number {
  const next = Number(localStorage.getItem(OFFSET_KEY) || "0") + 1;
  try {
    localStorage.setItem(OFFSET_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

function curatedResult(): TopicResult {
  const offset = Number(localStorage.getItem(OFFSET_KEY) || "0");
  const seen = readSeen();
  const topics = curatedDesk(offset, seen);
  rememberSeen(topics.map((t) => t.id));
  return { origin: "curated", topics };
}

// The single entry point the UI calls. Never throws; always returns a desk.
export async function loadTopics(): Promise<TopicResult> {
  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-cache" });
    if (!res.ok) return curatedResult();
    const data: unknown = await res.json();
    if (!isValidManifest(data)) return curatedResult();

    const seen = readSeen();
    const selected = selectBalanced(data.topics, seen);
    // If the manifest can't fill the balanced set, fall back to Evergreen.
    if (selected.length < 6) return curatedResult();

    rememberSeen(selected.map((t) => t.id));
    const ageHours = (Date.now() - Date.parse(data.generatedAt)) / 3_600_000;
    return { origin: "source-backed", topics: selected, generatedAt: data.generatedAt, stale: ageHours > STALE_HOURS };
  } catch {
    return curatedResult();
  }
}
