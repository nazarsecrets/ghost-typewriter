// Ranking (FR-2.5) and deterministic category assignment (FR-1.2).
// Every number here is inspectable; categories carry a human-readable reason.

import { CATEGORY_DAYS, WEIGHTS, WINDOW_DAYS } from "./config.ts";
import type { Category, Cluster } from "./types.ts";
import { clamp01, daysAgo } from "./util.ts";

// Momentum: normalized engagement across the pool (log-scaled so a viral
// outlier doesn't flatten everything else).
function momentumScores(clusters: Cluster[]): Map<string, number> {
  const raw = clusters.map((c) => {
    const eng = c.items.reduce((n, i) => n + (i.engagement ?? 0), 0);
    return { id: c.id, v: Math.log10(1 + eng) };
  });
  const max = Math.max(1e-9, ...raw.map((r) => r.v));
  return new Map(raw.map((r) => [r.id, r.v / max]));
}

export function rank(clusters: Cluster[], now = Date.now(), seenIds: Set<string> = new Set()): Cluster[] {
  const momentum = momentumScores(clusters);

  for (const c of clusters) {
    const recency = clamp01(1 - daysAgo(c.publishedAt, now) / WINDOW_DAYS);
    const sourceDiversity = clamp01(new Set(c.items.map((i) => i.source)).size / 3);
    const novelty = seenIds.has(c.id) ? 0 : 1;
    c.score =
      WEIGHTS.relevance * c.relevanceScore +
      WEIGHTS.recency * recency +
      WEIGHTS.momentum * (momentum.get(c.id) ?? 0) +
      WEIGHTS.sourceDiversity * sourceDiversity +
      WEIGHTS.novelty * novelty;
  }

  return clusters.sort((a, b) => b.score - a.score);
}

// Deterministic category rule, in priority order. Returns category + reason.
function categorize(c: Cluster, now: number): { category: Category; reason: string } {
  const age = Math.round(daysAgo(c.publishedAt, now));
  const sources = new Set(c.items.map((i) => i.source)).size;
  const engagement = c.items.reduce((n, i) => n + (i.engagement ?? 0), 0);

  // Trending: recent, and corroborated by multiple sources or real engagement.
  if (age <= CATEGORY_DAYS.trending && (sources >= 2 || engagement >= 40)) {
    return {
      category: "Trending",
      reason: sources >= 2
        ? `Covered by ${sources} sources within ${age} days`
        : `${engagement} engagement signals within ${age} days`,
    };
  }
  // Latest: very recent single-source coverage.
  if (age <= CATEGORY_DAYS.latest) {
    return { category: "Latest", reason: `Published ${age} days ago` };
  }
  // Under the Radar: still in-window, high relevance, limited coverage.
  return {
    category: "Under the Radar",
    reason: `High relevance (${c.relevanceScore.toFixed(2)}) with limited coverage over ${age} days`,
  };
}

export function applyCategories(clusters: Cluster[], now = Date.now()): Cluster[] {
  for (const c of clusters) {
    const { category, reason } = categorize(c, now);
    c.category = category;
    c.categoryReason = reason;
  }
  return clusters;
}
