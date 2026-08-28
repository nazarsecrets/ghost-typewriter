// Two-stage deduplication → clustering (FR-2.3).
// Stage 1: exact canonical-URL and normalized-title collapse.
// Stage 2: near-duplicate title grouping (Jaccard) merges coverage of the
// same story across sources into a single cluster.

import type { Cluster, NormalizedItem, Tag } from "./types.ts";
import { canonicalUrl, jaccard, normalizeTitle } from "./util.ts";

const TITLE_SIMILARITY = 0.6;

export function cluster(items: NormalizedItem[]): Cluster[] {
  // Stage 1 — exact collapse. Highest relevance wins as the representative.
  const byKey = new Map<string, NormalizedItem>();
  for (const item of items) {
    const key = `${canonicalUrl(item.url)}::${normalizeTitle(item.title)}`;
    const existing = byKey.get(key);
    if (!existing || item.relevance > existing.relevance) byKey.set(key, item);
  }
  const unique = [...byKey.values()];

  // Stage 2 — greedy near-duplicate grouping on normalized titles.
  const clusters: NormalizedItem[][] = [];
  const titles: string[] = [];
  outer: for (const item of unique) {
    const nt = normalizeTitle(item.title);
    for (let i = 0; i < clusters.length; i++) {
      if (jaccard(nt, titles[i]) >= TITLE_SIMILARITY) {
        clusters[i].push(item);
        continue outer;
      }
    }
    clusters.push([item]);
    titles.push(nt);
  }

  return clusters.map(toCluster);
}

// The dominant tag across members; ties broken by summed relevance.
function dominantTag(members: NormalizedItem[]): Tag {
  const weight = new Map<Tag, number>();
  for (const m of members) for (const t of m.tags) weight.set(t, (weight.get(t) ?? 0) + m.relevance);
  return [...weight.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function toCluster(members: NormalizedItem[]): Cluster {
  // Representative = most relevant, then most engaged member.
  const rep = members.slice().sort(
    (a, b) => b.relevance - a.relevance || (b.engagement ?? 0) - (a.engagement ?? 0),
  )[0];
  const publishedAt = members
    .map((m) => m.publishedAt)
    .sort()[0]; // earliest coverage

  return {
    id: rep.id,
    items: members,
    tag: dominantTag(members),
    title: rep.title,
    teaser: rep.description.slice(0, 190),
    publishedAt,
    relevanceScore: Math.max(...members.map((m) => m.relevance)),
    score: 0, // filled by rank()
    category: "Latest", // filled by categorize()
    categoryReason: "",
  };
}
