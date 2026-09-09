# Project Tracker — SVR Ghostwriter

Single source of truth for **what's done, what's in progress, and what's next**.
Every agent and every session must keep this current (see the rule in `CLAUDE.md`).

- **Product requirements:** [PRD.md](./PRD.md)
- **Direction & build state:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **Current POC scope:** [POC.md](./POC.md)
- **Ideas backlog:** [log.md](./log.md)

**Legend:** ✅ done · 🔄 in progress · ⬜ pending · 🎯 the one next action

**Classification:** every new progress item is labeled **[UX]**, **[Dev]**, or
**[UX+Dev]**. Read-only inspection does not require a separate tracker entry.

_Last updated: 2026-09-09_

---

## 🎯 Next action (do this next)

**Show partial source-backed desks honestly when a category has fewer than two
topics.** Keep the available current topics and visibly disclose the shortfall
instead of replacing the entire desk with Evergreen prompts.

---

## 🔄 In progress

_(nothing currently — pick up the Next action above)_

---

## ⬜ Pending

### Dev
- ⬜ Show fewer source-backed topics honestly when a category has <2 — **this is the Next action above**
- ⬜ Optional local Hugging Face embedding pass in the pipeline for semantic relevance/clustering (seam left in `enrich.ts`)
- ⬜ Production AI path for Reflect/Review: free serverless proxy **or** BYO-key mode (PRD FR-10) — the one open V1 build-sequence item
- ⬜ Configure GitHub Pages build + deploy workflow
- ⬜ Structured critique schema for Review (replace single preformatted text block; PRD FR-5.2)
- ⬜ Distinguish "revision" vs "new draft" on repeated Review (PRD FR-6.2)
- ⬜ Visible persistence warning on storage write failure (PRD §14)
- ⬜ Align word count to exclude the title (PRD FR-4.1)

### UX
- ⬜ Strip write-view chrome to the "paper" (POC.md §3; log.md idea 4)
- ⬜ Tune fixed writing position: anchor %, quiet floor, settle-on-pause (POC.md §6; log.md idea 8)
- ⬜ Reflect as an optional one-at-a-time self-interview; preserve direct Choose → Write and differentiate "Continue" vs "Show me another angle" (PRD FR-3.2; log.md idea 3)
- ⬜ Render the reflection "angle" (currently unused)
- ⬜ Motion language: add the two missing behaviors (accept-insight, margin-comment) if ideas 5/7 are pursued (log.md idea 6)
- ⬜ Optional immersion: soft caret, paper texture, opt-in Web Audio, View Transitions (PRD FR-8)
- ⬜ Accessibility + reduced-motion pass across the primary flow
- ⬜ **[UX+Dev]** Prototype typing-as-reward feedback that settles on pause and becomes quieter during sustained flow (POC.md §4; log.md idea 10)
- ⬜ **[UX]** Define the dormant Ghost invocation and contextual lens chooser without permanent writing-time AI chrome (PRD FR-5.0; log.md idea 11)
- ⬜ **[UX+Dev]** Design passage-anchored Ghost margin notes for Idea, Clarity, Voice, Evidence, and Structure while preserving the raw draft (PRD FR-5.1; log.md idea 12)

---

## ✅ Completed

- ✅ **2026-09-09 [UX+Dev]** — Redesigned Today as a responsive editorial desk
  with one rank-first lead story, five quieter signals, visible editorial lenses,
  honest provenance, and complete loading/empty states; verified desktop,
  mobile, refresh, selection, and Evergreen behavior, with Lighthouse scores of
  100 performance / 100 accessibility / 100 best practices.
- ✅ **2026-09-08 [UX+Dev]** — Connected Today to the provider-independent
  topic loader, added source/category provenance and honest stale/Evergreen
  labels, wired refresh rotation, and verified source-backed and fallback flows
  in-browser with no topic-selection Anthropic request when unconfigured;
  synchronized the PRD and implementation-plan status.
- ✅ **2026-08-28 [UX]** — Audited the intentional-writing considerations
  against PRD, POC, implementation plan, README, and ideas backlog; confirmed
  coverage and preserved the distinction between documented direction and
  pending UI implementation.
- ✅ **2026-08-28 [UX]** — Integrated the intentional-writing doctrine across
  PRD, POC, implementation plan, README, and ideas backlog: World / Me / Ghost,
  Discover → Choose → Write, optional Guided Reflect, invoked Ghost, raw-draft
  authority, and typing as intrinsic reward.
- ✅ **2026-08-28 [Dev]** — Added root `AGENTS.md` with the mandatory
  tracker workflow, mirrored the rule in `CLAUDE.md`, and established UX / Dev /
  UX+Dev classification for every meaningful project action.
- ✅ **2026-08-28 [Dev]** — Revalidated the current app and topic pipeline after
  the tracking-rule setup: `npm run build` and the pipeline TypeScript check pass.
- ✅ **2026-08-28** — Provider-independent topic pipeline: sources (RSS/DEV/HN/arXiv/GitHub), normalize, dedupe/cluster, rank, categorize, validated `public/topics.json`; verified live (11/12 sources, 50 topics)
- ✅ **2026-08-28** — GitHub Action `topics.yml` (8-hour schedule + manual), commits manifest on change
- ✅ **2026-08-28** — Client `topicSource.ts` loader: manifest fetch/validate, balanced 2/2/2 selection, seen-ID rotation, Evergreen fallback
- ✅ **2026-08-28** — `src/topics.ts` reworked to PRD-honest Evergreen desk (stable IDs, no synthetic recency)
- ✅ **2026-08-28** — PRD, IMPLEMENTATION_PLAN, POC, log docs authored/aligned
- ✅ Phase 1 foundation: Vite + React + TS shell, sequential reflection, paragraph manuscript, fixed writing position, six Anime.js behaviors, versioned localStorage, separate review surface, export
