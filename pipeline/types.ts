// Shared types for the topic-generation pipeline.
// The manifest shape mirrors PRD §10 so the client can consume it directly.

export type Tag = "Systems" | "Research" | "AI" | "Leadership" | "Process" | "Ethics";
export type Category = "Latest" | "Trending" | "Under the Radar";

// A single item as fetched from one source, before normalization.
export type RawItem = {
  source: string; // registry key, e.g. "smashing-rss"
  title: string;
  description: string;
  url: string;
  publishedAt: string; // ISO
  engagement?: number; // points, reactions, stars — source-relative
};

// A normalized, cleaned record. `id` is a stable content hash.
export type NormalizedItem = RawItem & {
  id: string;
  tags: Tag[];
  relevance: number; // 0..1 relevance to the author profile
};

// A cluster of related coverage that becomes one displayed topic.
export type Cluster = {
  id: string; // stable hash of the canonical member
  items: NormalizedItem[];
  tag: Tag;
  title: string;
  teaser: string;
  publishedAt: string; // earliest member
  score: number; // final rank score
  relevanceScore: number;
  category: Category;
  categoryReason: string;
};

export type SourceHealth = {
  source: string;
  ok: boolean;
  items: number;
  error?: string;
  fetchedAt: string;
};

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

export type TopicManifest = {
  version: 1;
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  topics: SourceBackedTopic[];
  sourceHealth: SourceHealth[];
};
