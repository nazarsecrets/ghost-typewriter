#!/usr/bin/env node
/**
 * Every provocation and Evergreen prompt must have authored guide copy: the
 * fallback is a safety net, not a shipping state. Also catches the copy faults
 * found in editorial review — ungrammatical stacking and lines long enough to
 * overflow the guide list on a phone.
 *
 *   node tools/check-guide-coverage.mjs
 */
import { readFileSync } from "node:fs";

const LABELS = ["Memory", "Tension", "Outcome", "System", "People"];
const MAX_LINE = 88;   // longer lines wrap to a third row in the phone guide list

const copy = JSON.parse(readFileSync(new URL("../src/writingGuideCopy.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../public/topics.json", import.meta.url), "utf8"));
const topicsSource = readFileSync(new URL("../src/topics.ts", import.meta.url), "utf8");

const provocations = (manifest.topics ?? manifest).map((t) => t.provocation).filter(Boolean);
const evergreenIds = [...topicsSource.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);

const problems = [];
for (const [what, keys] of [["manifest provocation", provocations], ["Evergreen prompt", evergreenIds]]) {
  for (const key of keys) {
    if (!copy[key]) problems.push(`missing guide copy for ${what}: ${key}`);
  }
}
for (const [key, lines] of Object.entries(copy)) {
  if (!Array.isArray(lines) || lines.length !== LABELS.length) {
    problems.push(`${key}: expected ${LABELS.length} guides, found ${lines?.length}`);
    continue;
  }
  lines.forEach((line, i) => {
    if (!line?.trim()) problems.push(`${key}: empty ${LABELS[i]} guide`);
    if (line.length > MAX_LINE) problems.push(`${key}: ${LABELS[i]} guide is ${line.length} chars (max ${MAX_LINE})`);
    if (/\bhow did how\b/i.test(line)) problems.push(`${key}: ${LABELS[i]} guide stacks "how did how"`);
  });
}

if (problems.length) {
  console.error(`Guide copy check failed (${problems.length}):`);
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}
console.log(`Guide copy OK: ${Object.keys(copy).length} sets cover ${provocations.length} provocations and ${evergreenIds.length} Evergreen prompts.`);
