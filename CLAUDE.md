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
4. **When you finish** an item, move it to `✅ Completed` with today's date, a
   ready-to-use commit message, and a one-line summary, and set a new
   `🎯 Next action`.
   Format every Completed entry so its commit message is the first thing to
   copy — a fenced `text` block directly under the date/label line, before the
   outcome:

   ````markdown
   - ✅ **YYYY-MM-DD [UX+Dev]**
     ```text
     Imperative subject line, 72 characters or fewer

     Optional body: what changed and why, wrapped at 72 columns.
     ```
     One-line outcome, with validation evidence.
   ````

   The message describes only that item's changes, so the author can commit it
   as-is. Write it; don't run `git commit` unless the author asks.
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
- **Motion:** Anime.js only, the named behaviors, under ~600ms, always gated
  behind `prefers-reduced-motion`. Motion serves stillness; no state may loop.
  Exception (author decision 2026-11-11): Ghost's interactions (plume menu,
  editor's slip, frame beats) use GSAP with calm motion plus about 3% overshoot
  personality (no idle or looping motion); see `GHOST_INVOCATION.md`. Writing-time
  motion stays on Anime.js. GSAP loads only when a Ghost interaction needs motion.
- **Theme:** the instrument is a **typewriter**, not a quill. Ghost's static plume is the editor's emblem; the animated Plume cursor is muted
  (unwired, files retained) by author decision — see `typewriting-feel.md` for the
  interaction model. Writing-time motion answers a keystroke; it never precedes or
  delays one, and the text model is always authoritative. On 2026-10-18 the
  author approved sound authenticity/comfort and retained the motions for now.
  Static paper grain is adopted for Typewriter's Reflect view; since 2026-11-04 the
  Write view is a smooth, borderless white canvas with no sheet (PRD FR-8.1). Sound and its toggle are Typewriter-only; Enchanted Diary will
  not load or play these sounds or show this toggle, while retaining the saved
  Typewriter sound preference.
- **Secrets:** no API key ever in the client bundle.

## Commands

- `npm run dev` — local dev server.
- `npm run build` — typecheck + production build.
- `npm run topics:build` — run the topic pipeline, writes `public/topics.json` and
  the review record `data/editorial-review.json`.
- `npm run topics:review` — print weak source/theme matches and overused frames.
  Author verdicts (`drop` / `retheme`) go in `data/editorial-verdicts.json`.
- `npx tsc --noEmit -p pipeline/tsconfig.json` — typecheck the pipeline.

## Layout

- `ghostwriter.tsx` — the app (single component, four views).
- `src/Ghost.tsx`, `src/ghostModel.ts`, `src/ghost.css` — Ghost setup, anchors, consent and structured editorial slips.
- `server/ghost/` — Cloudflare Workers AI production reading proxy and setup instructions.
- `src/motion.ts` — six foundational Anime.js behaviors, two typewriter response behaviors, and writing-rule constants
  (`WRITING_ANCHOR`, the opacity ladder).
- `src/PlumeCursor.tsx` — the quill cursor and its inkwell. **Muted:** retained but
  not rendered. Its generated vane geometry comes from `tools/quill-geometry.py`.
- `src/caret.ts` — textarea mirror measuring the true insertion point. Still the
  right tool for the typewriter's writing zone.
- `src/topics.ts` — Evergreen curated fallback desk.
- `src/topicSource.ts` — client topic loader (manifest + fallback + selection).
- `pipeline/` — provider-independent topic generation (Node/tsx).
- `.github/workflows/topics.yml` — scheduled manifest refresh.
