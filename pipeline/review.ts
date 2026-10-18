// Editorial quality review: records how each source reached its frame and
// flags the weak matches, so rules and frames are tuned from evidence.
// Written by the build to data/editorial-review.json; never shipped to the
// client and never a source of dates or recency for the desk.
// Read it with: `npm run topics:review`.

import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import type { ThemeMatch } from "./editorialize.ts";
import type { SourceBackedTopic } from "./types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REVIEW_PATH = join(HERE, "..", "data", "editorial-review.json");
export const VERDICTS_PATH = join(HERE, "..", "data", "editorial-verdicts.json");

// More topics than this on one question means the theme needs more frames.
const FRAME_REUSE_LIMIT = 2;

export type ReviewFlag = "fallback-frame" | "thin-match" | "ambiguous";

// The author's judgment on one topic, kept in data/editorial-verdicts.json.
// "drop" removes the topic from the desk; "retheme" files it under `theme`.
export type Verdict = {
  id: string;
  verdict: "drop" | "retheme";
  theme?: string;
  note?: string;
};

export type ReviewEntry = {
  id: string;
  theme: string;
  provocation: string;
  tag: string;
  source: string;
  sourceTitle: string;
  sourceUrl: string;
  match: ThemeMatch;
  flags: ReviewFlag[];
};

export type EditorialReview = {
  generatedAt: string;
  summary: {
    topics: number;
    flagged: number;
    byFlag: Record<ReviewFlag, number>;
    // Keywords behind flagged matches: the first place to look when tuning rules.
    weakKeywords: Array<{ keyword: string; theme: string; flagged: number }>;
    // Questions carried by several topics at once: where new frames are needed.
    overusedFrames: Array<{ provocation: string; theme: string; topics: number }>;
    verdicts: { applied: string[]; stale: string[]; invalid: string[] };
  };
  entries: ReviewEntry[];
};

export async function loadVerdicts(): Promise<Verdict[]> {
  try {
    const verdicts = JSON.parse(await readFile(VERDICTS_PATH, "utf8")) as Array<Partial<Verdict>>;
    return verdicts.filter((v): v is Verdict => Boolean(v.id) && (v.verdict === "drop" || v.verdict === "retheme"));
  } catch {
    return [];
  }
}

function flagsFor(match: ThemeMatch): ReviewFlag[] {
  if (match.forced) return [];
  if (!match.theme) return ["fallback-frame"];
  const flags: ReviewFlag[] = [];
  // No headline support: the theme came only from words in the description.
  if (match.hits.every((hit) => hit.where === "description")) flags.push("thin-match");
  if (match.runnerUp && match.runnerUp.score === match.score) flags.push("ambiguous");
  return flags;
}

export function buildReview(
  topics: Array<{ topic: SourceBackedTopic; match: ThemeMatch }>,
  verdicts: EditorialReview["summary"]["verdicts"],
  generatedAt: string,
): EditorialReview {
  const entries: ReviewEntry[] = topics.map(({ topic, match }) => ({
    id: topic.id,
    theme: topic.title,
    provocation: topic.provocation,
    tag: topic.tag,
    source: topic.sources[0].name,
    sourceTitle: topic.sources[0].title,
    sourceUrl: topic.sources[0].url,
    match,
    flags: flagsFor(match),
  }));

  const byFlag: Record<ReviewFlag, number> = { "fallback-frame": 0, "thin-match": 0, ambiguous: 0 };
  const weak = new Map<string, { keyword: string; theme: string; flagged: number }>();
  const frames = new Map<string, { provocation: string; theme: string; topics: number }>();
  for (const entry of entries) {
    for (const flag of entry.flags) byFlag[flag]++;
    if (entry.flags.length) {
      for (const hit of entry.match.hits) {
        const key = `${entry.theme}::${hit.keyword}`;
        const row = weak.get(key) ?? { keyword: hit.keyword, theme: entry.theme, flagged: 0 };
        row.flagged++;
        weak.set(key, row);
      }
    }
    const frame = frames.get(entry.provocation) ?? { provocation: entry.provocation, theme: entry.theme, topics: 0 };
    frame.topics++;
    frames.set(entry.provocation, frame);
  }

  return {
    generatedAt,
    summary: {
      topics: entries.length,
      flagged: entries.filter((entry) => entry.flags.length).length,
      byFlag,
      weakKeywords: [...weak.values()].sort((a, b) => b.flagged - a.flagged),
      overusedFrames: [...frames.values()].filter((f) => f.topics > FRAME_REUSE_LIMIT).sort((a, b) => b.topics - a.topics),
      verdicts,
    },
    // Flagged entries first; the manifest's rank order is kept within each group.
    entries: entries.slice().sort((a, b) => Number(b.flags.length > 0) - Number(a.flags.length > 0)),
  };
}

async function print() {
  let review: EditorialReview;
  try {
    review = JSON.parse(await readFile(REVIEW_PATH, "utf8")) as EditorialReview;
  } catch {
    console.error("\n✗ No editorial review yet. Run `npm run topics:build` first.\n");
    process.exitCode = 1;
    return;
  }
  const { summary } = review;
  console.log(`\n▪ Editorial review — built ${review.generatedAt}`);
  console.log(`  ${summary.flagged} of ${summary.topics} topics flagged  ${JSON.stringify(summary.byFlag)}\n`);

  for (const entry of review.entries.filter((e) => e.flags.length)) {
    const hits = entry.match.hits.map((hit) => `${hit.keyword} (${hit.where})`).join(", ") || "no theme keyword";
    console.log(`  ${entry.id}  [${entry.flags.join(", ")}]`);
    console.log(`    source  ${entry.source}: ${entry.sourceTitle}`);
    console.log(`    frame   ${entry.theme} — ${entry.provocation}`);
    console.log(`    matched ${hits}${entry.match.runnerUp ? `; runner-up ${entry.match.runnerUp.theme} (${entry.match.runnerUp.score})` : ""}\n`);
  }

  if (summary.weakKeywords.length) {
    console.log("  Keywords behind flagged matches:");
    for (const row of summary.weakKeywords.slice(0, 10)) console.log(`    ${String(row.flagged).padStart(2)} × ${row.keyword}  (${row.theme})`);
    console.log("");
  }
  if (summary.overusedFrames.length) {
    console.log("  Frames carried by several topics (write more for these themes):");
    for (const frame of summary.overusedFrames) console.log(`    ${String(frame.topics).padStart(2)} × ${frame.theme} — ${frame.provocation}`);
    console.log("");
  }
  const { applied, stale, invalid } = summary.verdicts;
  console.log(`  Verdicts: ${applied.length} applied, ${stale.length} stale, ${invalid.length} invalid`);
  if (stale.length) console.log(`    stale (topic left the window, safe to delete): ${stale.join(", ")}`);
  if (invalid.length) console.log(`    invalid (unknown theme): ${invalid.join(", ")}`);
  console.log(`\n  Record a verdict in data/editorial-verdicts.json, then rebuild.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  print().catch((error) => {
    console.error("\n✗ Review failed:", error);
    process.exitCode = 1;
  });
}
