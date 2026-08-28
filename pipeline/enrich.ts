// Deterministic normalization, classification, and relevance scoring.
// This is the "no-model" baseline the PRD requires (FR-2.4): keyword matching
// and metadata only. A semantic-embedding pass can layer on top later without
// changing this contract.

import { AUTHOR_PROFILE, CORE_TERMS, MIN_RELEVANCE, TAG_KEYWORDS, WINDOW_DAYS } from "./config.ts";
import type { NormalizedItem, RawItem, Tag } from "./types.ts";
import { clamp01, daysAgo, hash } from "./util.ts";

const TAGS = Object.keys(TAG_KEYWORDS) as Tag[];

function haystack(item: RawItem): string {
  return `${item.title} ${item.description}`.toLowerCase();
}

// Assign tags by keyword count. Always returns at least one (best guess).
function classify(text: string): Tag[] {
  const scored = TAGS.map((tag) => {
    const count = TAG_KEYWORDS[tag].reduce((n, kw) => (text.includes(kw) ? n + 1 : n), 0);
    return { tag, count };
  }).filter((s) => s.count > 0).sort((a, b) => b.count - a.count);

  if (!scored.length) return ["Process"]; // neutral default rather than dropping the item
  const top = scored[0].count;
  // Keep the leader plus any strong runner-up (within 1 hit).
  return scored.filter((s) => s.count >= top - 0 && s.count === top).map((s) => s.tag).slice(0, 2);
}

// Relevance to the author profile. Gated: an item must contain at least one
// core design/UX term, else it scores 0 and is dropped downstream. Past the
// gate, relevance is weighted keyword overlap, saturating.
function relevance(text: string): number {
  if (!CORE_TERMS.some((term) => text.includes(term))) return 0;
  let score = 0;
  for (const [term, weight] of Object.entries(AUTHOR_PROFILE)) {
    if (text.includes(term)) score += weight;
  }
  // ~7 weighted points saturates to 1.0; tuned to keep off-topic items low.
  return clamp01(score / 7);
}

// Normalize raw items: drop stale / off-topic, attach id, tags, relevance.
export function normalize(raw: RawItem[], now = Date.now()): NormalizedItem[] {
  const out: NormalizedItem[] = [];
  for (const item of raw) {
    if (daysAgo(item.publishedAt, now) > WINDOW_DAYS) continue; // outside freshness window
    const text = haystack(item);
    const rel = relevance(text);
    if (rel < MIN_RELEVANCE) continue; // below the gate or too marginal to include
    out.push({
      ...item,
      id: hash(`${item.url}|${item.title}`),
      tags: classify(text),
      relevance: rel,
    });
  }
  return out;
}
