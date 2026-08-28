# SVR Ghostwriter — Agent Guide

A personal, immersive writing tool: current UX/product ideas → guided reflection
→ distraction-free manuscript → editorial review → export. Static React app,
free GitHub Pages hosting, provider-independent topic pipeline.

## Canonical docs (read before non-trivial work)

- **[PRD.md](./PRD.md)** — product requirements (authoritative).
- **[TRACKER.md](./TRACKER.md)** — live status: done / in progress / next.
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** — direction & rationale.
- **[POC.md](./POC.md)** — current proof-of-concept scope.

## ⚠️ Tracker rule (mandatory for EVERY agent, EVERY session)

`TRACKER.md` is the project's source of truth for progress. You **must** keep it
current as part of doing the work — not as an optional extra:

1. **Before starting**, read `TRACKER.md`. Work the `🎯 Next action` unless the
   user directs otherwise.
2. **When you start** a tracked item, move it to `🔄 In progress`.
3. **After every meaningful UX or development action**, update the tracker in
   the same task. A meaningful action is a completed unit that changes code,
   product behavior, UX direction, requirements, validation evidence, or scope;
   read-only inspection does not need its own entry. Classify new entries as
   **[UX]**, **[Dev]**, or **[UX+Dev]**.
4. **When you finish** an item, move it to `✅ Completed` with today's date and a
   one-line summary, and set a new `🎯 Next action`.
5. **When scope changes** (new task, discovered work, dropped item), add/remove
   the corresponding `⬜ Pending` entry.
6. **Always** update the `_Last updated:_` date when you edit the tracker.

This applies to sub-agents and spawned agents too: updating `TRACKER.md` is the
final step of any task that changes project state. Do not close out work with the
tracker stale. If a task made no tracked progress, say so — don't silently skip.

## Project conventions

- **Cost & dependencies:** the `topics → select → write` flow must stay free and
  provider-independent. Topic discovery uses `public/topics.json` (built by the
  pipeline) with the Evergreen curated fallback — never a hosted LLM.
- **Honesty:** never present curated Evergreen prompts as current, and never emit
  synthetic recency ("surfaced N days ago") for non-source-backed content (PRD §8).
- **Motion:** Anime.js only, the six named behaviors, under ~600ms, always gated
  behind `prefers-reduced-motion`. Motion serves stillness.
- **Secrets:** no API key ever in the client bundle.

## Commands

- `npm run dev` — local dev server.
- `npm run build` — typecheck + production build.
- `npm run topics:build` — run the topic pipeline, writes `public/topics.json`.
- `npx tsc --noEmit -p pipeline/tsconfig.json` — typecheck the pipeline.

## Layout

- `ghostwriter.tsx` — the app (single component, four views).
- `src/motion.ts` — the six Anime.js behaviors.
- `src/topics.ts` — Evergreen curated fallback desk.
- `src/topicSource.ts` — client topic loader (manifest + fallback + selection).
- `pipeline/` — provider-independent topic generation (Node/tsx).
- `.github/workflows/topics.yml` — scheduled manifest refresh.
