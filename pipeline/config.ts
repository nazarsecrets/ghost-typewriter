// Tunable configuration for the topic pipeline.
// None of this is product truth — it is inspectable, editable calibration.

import type { Tag } from "./types.ts";

// The freshness window. Nothing older than 30 days enters the active pool.
export const WINDOW_DAYS = 30;
export const CATEGORY_DAYS = { latest: 7, trending: 21, underRadar: 30 };

// How many topics the manifest may carry (client selects/rotates from these).
export const MANIFEST_MAX_TOPICS = 50;

// Items scoring below this after the core-term gate are dropped as marginal.
export const MIN_RELEVANCE = 0.3;

// Ranking weights (FR-2.5). Must sum to 1.
export const WEIGHTS = {
  relevance: 0.35,
  recency: 0.25,
  momentum: 0.2,
  sourceDiversity: 0.1,
  novelty: 0.1,
};

// Core terms: an item must contain at least one of these to be considered on
// topic at all. This gates out generic tech/AI posts (a "distributed OS" that
// merely mentions "agent" or "system") that would otherwise score on the
// broad profile below. Precision over recall — this is a personal desk.
export const CORE_TERMS: string[] = [
  "ux", "user experience", "user interface", "product design", "design system",
  "design systems", "usability", "user research", "ux research", "interaction design",
  "designer", "design team", "figma", "prototyp", "wireframe", "accessibility", "a11y",
  "human-computer", "human computer", "hci", "information architecture", "design ops",
  "product designer", "dark pattern", "design leadership", "ui design",
];

// The author's interest profile. Relevance = weighted keyword overlap, but only
// scored once an item has already passed the CORE_TERMS gate. Generic single
// tokens are weighted low so they add nuance without carrying an item alone.
export const AUTHOR_PROFILE: Record<string, number> = {
  "design system": 3, "design systems": 3, component: 1, token: 1, figma: 2,
  ux: 3, "user experience": 3, "product design": 3, designer: 2, usability: 3,
  "user research": 3, "ux research": 3, discovery: 2, synthesis: 2, "interaction design": 3,
  prototype: 2, prototyping: 2, wireframe: 1, "information architecture": 2,
  "artificial intelligence": 1, llm: 1, "generative ai": 2, "ai agent": 1,
  "b2b": 2, enterprise: 1, workflow: 1, "systems thinking": 3, "design ops": 2,
  accessibility: 3, a11y: 2, ethics: 1, "dark pattern": 3, consent: 1, privacy: 1,
  "design leadership": 3, "design critique": 2, "design process": 2, handoff: 2,
};

// Keyword → tag map. First-matching / highest-count wins; ties broken by order.
export const TAG_KEYWORDS: Record<Tag, string[]> = {
  Systems: ["design system", "design systems", "component", "token", "library", "consistency", "systems thinking", "pattern library"],
  Research: ["research", "user research", "discovery", "interview", "usability", "synthesis", "ethnograph", "insight", "study"],
  AI: ["ai", "artificial intelligence", "llm", "gpt", "agent", "generative", "machine learning", "model", "prompt", "copilot"],
  Leadership: ["leadership", "manager", "management", "director", "team", "hiring", "career", "org", "strategy"],
  Process: ["process", "workflow", "handoff", "agile", "sprint", "roadmap", "collaboration", "documentation", "velocity", "ops"],
  Ethics: ["ethics", "dark pattern", "consent", "privacy", "accessibility", "a11y", "inclusive", "bias", "surveillance", "manipulation"],
};

export type SourceType = "rss" | "devto" | "hackernews" | "arxiv" | "github";

export type SourceDef = {
  key: string;
  type: SourceType;
  // Meaning depends on type: RSS feed URL, Forem tag, HN query, arXiv category, GitHub "owner/repo".
  target: string;
  label: string;
  enabled?: boolean;
};

// The source registry (FR-2.1). All free, public, no auth for the defaults.
// GitHub releases work unauthenticated but benefit from GITHUB_TOKEN rate limits.
export const SOURCES: SourceDef[] = [
  // RSS/Atom — UX/product/design publications
  { key: "smashing", type: "rss", target: "https://www.smashingmagazine.com/feed/", label: "Smashing Magazine" },
  { key: "nngroup", type: "rss", target: "https://www.nngroup.com/feed/rss/", label: "Nielsen Norman Group" },
  { key: "uxcollective", type: "rss", target: "https://uxdesign.cc/feed", label: "UX Collective" },
  { key: "alistapart", type: "rss", target: "https://alistapart.com/main/feed/", label: "A List Apart" },
  { key: "uxmatters", type: "rss", target: "https://www.uxmatters.com/index.xml", label: "UXmatters" },

  // DEV/Forem — by tag
  { key: "devto-ux", type: "devto", target: "ux", label: "DEV · ux" },
  { key: "devto-design", type: "devto", target: "design", label: "DEV · design" },

  // Hacker News — via Algolia search API, keyword queries
  { key: "hn-ux", type: "hackernews", target: "UX design", label: "Hacker News · UX" },
  { key: "hn-designsystem", type: "hackernews", target: "design system", label: "Hacker News · design systems" },

  // arXiv — HCI category
  { key: "arxiv-hci", type: "arxiv", target: "cs.HC", label: "arXiv · Human-Computer Interaction" },

  // GitHub — design-system / prototyping tool releases
  { key: "gh-radix", type: "github", target: "radix-ui/primitives", label: "GitHub · Radix" },
  { key: "gh-storybook", type: "github", target: "storybookjs/storybook", label: "GitHub · Storybook" },
];
