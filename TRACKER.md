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

**[UX+Dev] Wire Choose → Write for the focused POC.** Selecting a provocation
should enter the manuscript directly, preserve the chosen theme as quiet
context, and keep Guided Reflect available only as an intentional option.

---

## 🔄 In progress

_(nothing currently — pick up the Next action above)_

---

## ⬜ Pending

### Focused POC — prove World → Me

- ⬜ **[UX+Dev]** Wire Choose → Write and make Guided Reflect optional — **this is the Next action above** (POC.md §5)
- ⬜ **[UX+Dev]** Strip write-view chrome to the paper: remove writing-time mode/tone controls, manuscript-end Review button, and debug writing-line label (POC.md §3)
- ⬜ **[UX+Dev]** Tune the physical writing rule: test 40% anchor, 0.82 quiet floor, and settle-on-pause behavior instead of immediate refocus (POC.md §§2, 7)
- ⬜ **[UX+Dev]** Make autosave quiet, expose storage-write failure, and align word count to exclude the title (PRD FR-4.1, §14)
- ⬜ **[UX+Dev]** Complete the manuscript type, measure, spacing, keyboard, and reduced-motion pass across Today → Write
- ⬜ **[UX+Dev]** Prototype restrained typing-as-reward feedback that becomes quieter during sustained flow (POC.md §4; log.md idea 10)

### Discovery robustness — after the core POC handoff

- ⬜ **[UX+Dev]** Show partial source-backed desks honestly when a category has fewer than two qualified topics; disclose the shortfall instead of replacing the entire desk with Evergreen prompts
- ⬜ **[UX+Dev]** Add an editorial quality-review loop for live provocations: record weak source/theme matches, tune rules, and expand human-authored frames without fabricating freshness
- ⬜ **[Dev]** Optionally evaluate local Hugging Face embeddings for semantic relevance/clustering; keep the deterministic pipeline as the required fallback

### Ghost reattachment — after the paper is proven

- ⬜ **[UX]** Define the dormant Ghost invocation and contextual lens chooser without permanent writing-time AI chrome (PRD FR-5.0; log.md idea 11)
- ⬜ **[UX+Dev]** Restore Reflect as an optional one-at-a-time self-interview; differentiate Continue from Show me another angle and render the currently unused angle (PRD FR-3.2; log.md idea 3)
- ⬜ **[UX+Dev]** Design passage-anchored Ghost margin notes for Idea, Clarity, Voice, Evidence, and Structure while preserving the raw draft (PRD FR-5.1; log.md idea 12)
- ⬜ **[UX+Dev]** Replace the single Review text block with a structured critique schema and distinguish revisions from new drafts (PRD FR-5.2, FR-6.2)
- ⬜ **[UX+Dev]** Add accept-insight and margin-comment motion only when their corresponding interactions exist (log.md idea 6)
- ⬜ **[Dev]** Choose and implement the production AI path for invoked Reflect/Review: free serverless proxy or BYO-key mode (PRD FR-10)

### Release and optional polish

- ⬜ **[Dev]** Configure the GitHub Pages build and deploy workflow after the focused POC passes browser QA
- ⬜ **[UX+Dev]** Evaluate optional immersion only after the core writing behavior is settled: soft caret, paper texture, opt-in Web Audio, and View Transitions (PRD FR-8)

---

## ✅ Completed

- ✅ **2026-09-09 [UX]** — Re-evaluated and reordered the tracker after the
  source-to-provocation work: Choose → Write now leads the focused POC, paper
  work follows in dependency order, and discovery robustness, Ghost, release,
  and optional enrichment are explicitly separated.
- ✅ **2026-09-09 [UX+Dev]** — Replaced source-headline prompts with a validated
  v2 source → signal → provocation model: deterministic lens-based questions,
  neutral Why now context, stricter relevance, diverse rotation, and provenance-
  only headlines; rebuilt a 33-topic balanced manifest and verified Today,
  Refresh, and Reflect in-browser plus TypeScript and production builds.
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
