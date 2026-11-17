// Client topic source (PRD FR-1.3, §10). Fetches the source-backed manifest,
// validates it, and selects a balanced set preferring unseen topics. Falls back
// to the honest Evergreen curated desk when no valid manifest is available.
// No Claude, no secrets — this runs entirely in the browser off a static file.

import { curatedDesk, type Tag } from "./topics";

export type Category = "Latest" | "Trending" | "Under the Radar";
export type EditorialLens = "Design" | "Technology" | "Industry" | "Ways of Working" | "Self";

export type SourceBackedTopic = {
  id: string;
  title: string;
  provocation: string;
  whyNow: string;
  tag: Tag;
  lens: EditorialLens;
  origin: "source-backed";
  category: Category;
  publishedAt: string;
  since: string;
  relevanceScore: number;
  categoryReason: string;
  sources: Array<{ name: string; title: string; url: string; publishedAt: string }>;
};

type Manifest = {
  version: 2;
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
  shortfalls?: Array<{ category: Category; available: number }>;
};

const MANIFEST_URL = `${import.meta.env.BASE_URL}topics.json`;
const SEEN_KEY = "svr-ghostwriter-seen-topics";
const OFFSET_KEY = "svr-ghostwriter-desk-offset";
const STALE_HOURS = 24;

function isValidManifest(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") return false;
  const m = value as Manifest;
  if (m.version !== 2 || !Array.isArray(m.topics) || m.topics.length === 0) return false;
  return m.topics.every(
    (t) => t.id && t.title && t.provocation?.trim().endsWith("?") && t.whyNow && t.lens && t.tag
      && Array.isArray(t.sources) && t.sources[0]?.url && !Number.isNaN(Date.parse(t.publishedAt)),
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
  const usedProvocations = new Set<string>();

  for (const category of categories) {
    const inCategory = topics.filter((t) => t.category === category);
    const unseen = inCategory.filter((t) => !seen.has(t.id));
    const seenPool = inCategory.filter((t) => seen.has(t.id));
    const pool = [...unseen, ...seenPool]; // already rank-ordered
    const diverse = pool.filter((topic) => !usedProvocations.has(topic.provocation)).slice(0, 2);
    const categoryChoice = diverse.length === 2
      ? diverse
      : [...diverse, ...pool.filter((topic) => !diverse.includes(topic))].slice(0, 2);
    categoryChoice.forEach((topic) => usedProvocations.add(topic.provocation));
    chosen.push(...categoryChoice);
  }
  return chosen;
}

// Sync cadence. Must match the cron in .github/workflows/topics.yml
// ("0 */8 * * *": 00:00, 08:00, 16:00 UTC). The countdown is to the next
// scheduled check, which is a fact; it never promises that new ideas arrive.
export const SYNC_INTERVAL_HOURS = 8;
const SYNC_GRACE_MINUTES = 90; // scheduled runs start late; allow before saying so

export type SyncState = "scheduled" | "due" | "late" | "stale";
export type SyncStatus = { state: SyncState; synced: string; next: string };

function compactDuration(ms: number, round: (n: number) => number): string {
  const minutes = Math.max(1, round(ms / 60_000));
  return minutes < 60 ? `${minutes}m` : `${round(ms / 3_600_000)}h`;
}

// "Synced 3h ago • Next sync in 5h". Synced = when the manifest was generated.
export function syncStatus(generatedAt: string, now = new Date()): SyncStatus {
  const synced = Date.parse(generatedAt);
  const age = Math.max(0, now.getTime() - synced);
  if (age > STALE_HOURS * 3_600_000) {
    const date = new Date(synced).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { state: "stale", synced: `Last synced ${date}`, next: "New syncs haven't arrived" };
  }
  const syncedLabel = age < 60_000 ? "Synced just now" : `Synced ${compactDuration(age, Math.floor)} ago`;
  const interval = SYNC_INTERVAL_HOURS * 3_600_000;
  const nextSlot = (Math.floor(synced / interval) + 1) * interval; // first scheduled run after this sync
  const untilNext = nextSlot - now.getTime();
  if (untilNext > 0) return { state: "scheduled", synced: syncedLabel, next: `Next sync in ${compactDuration(untilNext, Math.floor)}` };
  if (-untilNext <= SYNC_GRACE_MINUTES * 60_000) return { state: "due", synced: syncedLabel, next: "Next sync due now" };
  return { state: "late", synced: syncedLabel, next: "Next sync is running late" };
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
    // Keep every available category; never replace a partial source desk with
    // curated material or borrow extra topics from another category to fill it.
    if (selected.length === 0) return curatedResult();
    const categories: Category[] = ["Latest", "Trending", "Under the Radar"];
    const shortfalls = categories
      .map((category) => ({ category, available: selected.filter((topic) => topic.category === category).length }))
      .filter(({ available }) => available < 2);

    rememberSeen(selected.map((t) => t.id));
    const ageHours = (Date.now() - Date.parse(data.generatedAt)) / 3_600_000;
    return { origin: "source-backed", topics: selected, generatedAt: data.generatedAt, stale: ageHours > STALE_HOURS, shortfalls };
  } catch {
    return curatedResult();
  }
}
