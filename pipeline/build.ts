// Orchestrator: fetch → normalize → cluster → rank → categorize → validate →
// write public/topics.json. Retains the previous valid manifest on failure
// (FR-2.2). Run: `npm run topics:build`.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MANIFEST_MAX_TOPICS, SOURCES, WINDOW_DAYS } from "./config.ts";
import type { Cluster, RawItem, SourceHealth, SourceBackedTopic, TopicManifest } from "./types.ts";
import { normalize } from "./enrich.ts";
import { cluster } from "./cluster.ts";
import { applyCategories, rank } from "./rank.ts";
import { fetchSource } from "./sources.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(HERE, "..", "public", "topics.json");
const INBOX_PATH = join(HERE, "..", "data", "inbox.json");

function sinceLabel(iso: string, now: number): string {
  const days = Math.max(0, Math.round((now - Date.parse(iso)) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

function toTopic(c: Cluster, now: number): SourceBackedTopic {
  return {
    id: c.id,
    title: c.title,
    teaser: c.teaser,
    tag: c.tag,
    origin: "source-backed",
    category: c.category,
    publishedAt: c.publishedAt,
    since: sinceLabel(c.publishedAt, now),
    relevanceScore: Number(c.relevanceScore.toFixed(3)),
    categoryReason: c.categoryReason,
    sources: c.items.slice(0, 4).map((i) => ({ name: i.source, title: i.title, url: i.url, publishedAt: i.publishedAt })),
  };
}

// A manifest is valid only if it carries real, source-backed topics.
function validate(manifest: TopicManifest): string | null {
  if (manifest.version !== 1) return "bad version";
  if (!Array.isArray(manifest.topics) || manifest.topics.length === 0) return "no topics produced";
  for (const t of manifest.topics) {
    if (!t.id || !t.title || !t.tag) return `topic missing required fields (${t.id})`;
    if (!t.sources?.length || !t.sources[0].url) return `topic ${t.id} has no source URL`;
    if (Number.isNaN(Date.parse(t.publishedAt))) return `topic ${t.id} has invalid date`;
  }
  return null;
}

async function loadInbox(): Promise<RawItem[]> {
  try {
    const items = JSON.parse(await readFile(INBOX_PATH, "utf8")) as Array<Partial<RawItem>>;
    return items
      .filter((i) => i.title && i.url)
      .map((i) => ({
        source: "inbox",
        title: i.title!,
        description: i.description ?? "",
        url: i.url!,
        publishedAt: i.publishedAt ?? new Date().toISOString(),
        engagement: i.engagement,
      }));
  } catch {
    return [];
  }
}

async function loadPreviousManifest(): Promise<TopicManifest | null> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as TopicManifest;
  } catch {
    return null;
  }
}

async function main() {
  const now = Date.now();
  console.log(`\n▪ Building topic manifest — ${SOURCES.filter((s) => s.enabled !== false).length} sources\n`);

  // 1. Fetch all sources in parallel; isolate failures.
  const results = await Promise.all(SOURCES.filter((s) => s.enabled !== false).map(fetchSource));
  const health: SourceHealth[] = results.map((r) => r.health);
  const raw: RawItem[] = results.flatMap((r) => r.items).concat(await loadInbox());

  for (const h of health) {
    console.log(`  ${h.ok ? "✓" : "✗"} ${h.source.padEnd(18)} ${h.ok ? `${h.items} items` : h.error}`);
  }

  // 2..5 Enrich → cluster → rank → categorize.
  const seenIds = new Set((await loadPreviousManifest())?.topics.map((t) => t.id) ?? []);
  const normalized = normalize(raw, now);
  const clusters = applyCategories(rank(cluster(normalized), now, seenIds), now).slice(0, MANIFEST_MAX_TOPICS);

  const manifest: TopicManifest = {
    version: 1,
    generatedAt: new Date(now).toISOString(),
    windowStart: new Date(now - WINDOW_DAYS * 86_400_000).toISOString(),
    windowEnd: new Date(now).toISOString(),
    topics: clusters.map((c) => toTopic(c, now)),
    sourceHealth: health,
  };

  // 6. Validate. On failure, keep the previous valid manifest untouched.
  const problem = validate(manifest);
  const byCat = manifest.topics.reduce<Record<string, number>>((a, t) => ((a[t.category] = (a[t.category] ?? 0) + 1), a), {});
  console.log(`\n  raw=${raw.length} normalized=${normalized.length} clusters=${manifest.topics.length}`);
  console.log(`  categories: ${JSON.stringify(byCat)}`);

  if (problem) {
    console.error(`\n✗ Manifest invalid: ${problem}. Keeping previous manifest.\n`);
    process.exitCode = 1;
    return;
  }

  await mkdir(dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ Wrote ${MANIFEST_PATH} (${manifest.topics.length} topics)\n`);
}

main().catch((error) => {
  console.error("\n✗ Pipeline crashed:", error);
  process.exitCode = 1;
});
