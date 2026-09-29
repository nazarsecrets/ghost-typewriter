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

_Last updated: 2026-09-29_

---

## 🎯 Next action (do this next)

**[UX+Dev] Complete the manuscript keyboard and accessibility pass** across
Today → guided writing → focused writing. Separately collect the author's
long-session comfort feedback on the revised native-caret experience; do not
add typing effects without a concrete need.

---

## 🔄 In progress

_(nothing currently)_

---

## ⬜ Pending

### Focused POC — prove World → Me

- ⬜ **[UX]** Author follow-up: assess long-session comfort of the native-caret revision. The prior animated writing quill was reported as distracting or tiring; this is not yet comfort validation of the revised version.
- ⬜ **[UX]** Remaining writing-space ideas the author has not taken up yet: move the lens out of the text column into the margin or toolbar, and fade the five reference bullets out once writing is under way.
- ⬜ **[UX+Dev]** Complete the manuscript type, measure, spacing, keyboard, and reduced-motion pass across Today → Write

### Discovery robustness — after the core POC handoff

- ⬜ **[UX+Dev]** Show partial source-backed desks honestly when a category has fewer than two qualified topics; disclose the shortfall instead of replacing the entire desk with Evergreen prompts
- ⬜ **[UX+Dev]** Add an editorial quality-review loop for live provocations: record weak source/theme matches, tune rules, and expand human-authored frames without fabricating freshness
- ⬜ **[Dev]** Optionally evaluate local Hugging Face embeddings for semantic relevance/clustering; keep the deterministic pipeline as the required fallback

### Ghost reattachment — after the paper is proven

- ⬜ **[UX]** Define the dormant Ghost invocation and contextual lens chooser without permanent writing-time AI chrome (PRD FR-5.0; log.md idea 11)
- ⬜ **[UX]** Evaluate the authored prompt-specific guides during real writing and refine weak angles; add guide copy whenever new provocations or Evergreen prompts are introduced.
- ⬜ **[UX+Dev]** Design passage-anchored Ghost margin notes for Idea, Clarity, Voice, Evidence, and Structure while preserving the raw draft (PRD FR-5.1; log.md idea 12)
- ⬜ **[UX+Dev]** Replace the single Review text block with a structured critique schema and distinguish revisions from new drafts (PRD FR-5.2, FR-6.2)
- ⬜ **[UX+Dev]** Add accept-insight and margin-comment motion only when their corresponding interactions exist (log.md idea 6)
- ⬜ **[Dev]** Choose and implement the production AI path for invoked Reflect/Review: free serverless proxy or BYO-key mode (PRD FR-10)

### Release and optional polish

- ⬜ **[Dev]** Configure the GitHub Pages build and deploy workflow after the focused POC passes browser QA
- ⬜ **[UX+Dev]** Evaluate optional immersion only after the core writing behavior is settled: soft caret, paper texture, opt-in Web Audio, and View Transitions (PRD FR-8)

---

## ✅ Completed

- ✅ **2026-09-29 [UX+Dev]** — Guided-editor validation produced a concrete comfort failure: the author found the quill distracting/tiring and selected native caret during writing, quill only for transitions. Removed typing, line-wrap, and idle reactions; preserved entering/leaving and reflection handoffs, with input interrupting them. A 159-second automated walkthrough preserved 305 words, four paragraphs, an earlier edit, and reload state. Tightened the evaluated AI-judgment guides, removing the assumption that the recommendation was wrong; mobile guide height reduced 247.5 → 224.8px. Revised behavior verified: zero visible quill frames while typing/idle, transitions work, reduced motion hides the quill, native caret and persistence retained. Build/diff checks pass. Full evidence and limits: `docs/guided-editor-validation.md`. Revised long-session comfort remains an author follow-up, not a claimed pass.

- ✅ **2026-09-29 [UX+Dev]** — Verified the existing quill satisfies the typing-as-reward prototype; no additional visual or audio effect added. Browser samples measured deliberate-key feedback at 1.97px / 1.97° versus sustained 60ms typing at 0.8px / 0.7°, zero idle frames during continuous typing, one idle adjustment after stopping, all 81 characters preserved, and native-caret fallback under reduced motion. Updated POC §4 and log idea 10; long-session comfort remains a real-use question. Removed one stray closing CSS brace found by verification; production build now passes without warnings. Evidence: `output/playwright/typing-feedback-verification.json`.

- ✅ **2026-09-28 [UX+Dev]** — Replaced identical generic bullets with 60 distinct authored five-guide sets matched to the exact main provocation or Evergreen ID (36 pipeline prompts + 24 Evergreen topics). Guides derive from the selected topic on render, including restored drafts, without AI calls. Coverage validation includes every current manifest topic; build and diff checks pass. Browser QA verified different guides for two prompts within the same theme, reload persistence, and no mobile overflow. Updated guide requirements in PRD, POC, and implementation plan; existing writing-motion work and next action preserved.

- ✅ **2026-09-28 [UX+Dev]** — Judged the plume and inkwell by writing with them,
  and changed both on the evidence. **Size:** wrote a real multi-paragraph passage
  at 68 / 58 / 50px and compared. 68px was wrong — the feather's full mid-section
  crosses the line above and sat on top of a word. The bound is typographic: with
  a 2.15 line on 22px serif, the previous line's x-height is ~57px above the
  current baseline, so any feather above ~58px crosses the words rather than the
  gap. Settled at **60px** (the floor of the author's 60-80px range), where only
  the narrow tip grazes the descenders, and gave opacity back from 0.72 to
  **0.82** since there is less to see through. **Inkwell:** measured placement at
  five viewport shapes and found two faults — the well overlapped the text column
  by 6px at every width (it was clipping the first character of the manuscript
  placeholder), and at `56vh` it sat above the writing line on short viewports, so
  the plume travelled down into it. Re-anchored to the bottom-left margin
  (`bottom: 14vh`, `left: max(12px, calc(50% - 476px))`): now a consistent 34px
  gap from the column at 1000-1920px wide, always on screen, and at or below the
  writing line on every shape tested. Regression clean at the settled values: nib
  exact (60px desktop, 46px phone), all five transitions, 30% anchor, opacity
  ladder, reduced motion, selection hiding, no overflow, no console errors. Build
  passes; PRD FR-4.6 records the legibility bound so the size is not re-raised
  without re-deciding the line height.

- ✅ **2026-09-28 [UX+Dev]** — Plume as a real writing instrument, against the
  author's quill-and-inkwell reference. No flow, autosave, pathway or critique
  behaviour changed. **Drawing:** redrawn on a taller 34x56 proportion at 68px
  desktop / 46px phone, taking the reference's character — soft rounded tip
  instead of a point, fullness high on the feather, a pronounced shaft curve, and
  dense fine barbs. The vane outlines and barbs are now *generated* geometry
  (`tools/quill-geometry.py`) rather than hand-written path data: smoothed width
  profiles, raked barbs set clear of the shaft, and a deterministic jitter so the
  edge is not a perfect arc. Regrouped to the three animation groups the spec
  asks for — feather body / shaft / nib — with no barb animated individually.
  The inkwell was redrawn as a squat bottle with shoulders, a neck collar and
  heavy ink, replacing the rounded tub. **New behaviour:** line wraps now read as
  a larger move than a keystroke (a ~300ms travel down and back, then a landing);
  entering a writing session lifts the plume out of the inkwell in the left
  margin and travels it to the caret; leaving stows it back. **Fixed a real
  regression found in verification:** returning from Review came out of the
  inkwell instead of being handed back, because `active` treated Review as
  outside the session. A writing session now spans Reflect, Write and Review —
  only Today is outside it. **Legibility trade:** at 68px the feather crosses the
  line above, which no line height can fully clear, so the quill sits at 0.72
  opacity and the manuscript line height went 1.95 -> 2.15; text now reads
  through it. Verified in Chrome: enter session hidden->lifting->resting with the
  inkwell fading to 0.85 and back; one `wrapping` event on a wrapping sentence;
  reflection->write hidden->arriving->resting; leave session stowing->hidden;
  Review departing at 59ms -> responding -> returning to the exact caret position
  it left (y 269.1075 both sides). Nib anchoring exact at both sizes (68px dx=0
  dy=0 desktop, 46px on phone). Regression clean: 30% anchor, opacity ladder,
  reduced motion (no plume, native caret), selection/blur/IME hiding, mobile
  tap-to-write, no overflow, no console errors. Build passes; PRD FR-4.6 and
  CLAUDE.md updated.

- ✅ **2026-09-28 [UX+Dev]** — Rebuilt the Plume as a richer, physical quill. No
  product flow, state, or storage behaviour changed; `PlumeCursor`'s props are
  untouched, so `ghostwriter.tsx` needed no edit beyond the taller line's resize
  floor. **Drawing:** a custom 38px quill in four groups (nib / shaft / wide vane /
  narrow vane) — asymmetric vanes meeting along a curved shaft, bare calamus,
  raked barbs set clear of the shaft, and a slim cut nib a shade darker than the
  feather. Iterated three times against zoomed renders; the first two read as a
  leaf on a stick. **Anchoring:** position is now expressed from the nib tip, not
  the SVG box — measured landing is dx=0, dy=0 against the baseline immediately
  after the last glyph — and every transform pivots on the nib, in both the
  wrapper and the SVG groups. **Physics:** velocity-aware reaction (measured 2.18°
  for deliberate keys vs 0.69° for continuous typing, which flows horizontally
  instead of restarting), animations cancelled and replaced rather than queued,
  and real feather lag (nib peaks at 160ms, shaft ~200ms, vanes ~210-230ms).
  Added the microscopic ink contact under the nib, the single idle adjustment
  after ~3.8s, the depart/return handoff around Review, and the reflection
  transition where the nib draws a curved stroke from the question to the first
  baseline (verified drawing 1 -> 0). Manuscript line height 1.75 -> 1.95 with
  more paragraph air so the feather never collides. Raised the visibility guard by
  the feather's height so the quill never overlaps the fixed header. **Also closed
  the branch the last entry could not reach:** drove the Review path by
  intercepting the request locally (no external call) — departing at 55ms, flight
  fading out, responding, then returning to the exact caret position it left
  (y 269.1075 both sides). Regression clean: 30% anchor holds, opacity ladder
  unchanged, reduced motion still renders no Plume and restores the native caret,
  selection/blur/IME hiding intact, mobile tap-to-write works, no overflow, no
  console errors. Build passes. PRD FR-4.6 rewritten to specify the drawing,
  anchoring, writing physics, states and contract.

- ✅ **2026-09-28 [UX+Dev]** — Completed the Plume job: browser verification and
  docs alignment. Verified in Chrome at 1280x900, 1280x620 and iPhone-sized, full
  and reduced motion. The Plume tracks the measured caret (moves exactly with the
  text through a 150px scroll: 216 -> 66 as the caret goes 226 -> 76); the state
  machine settles resting -> one `thinking` breath at 1.4s -> resting and never
  loops; it hides on selection, blur, and IME, restoring `caret-color` each time;
  under `prefers-reduced-motion` it does not render at all and the native caret
  returns; editing, selection and text integrity are untouched throughout; no
  console errors anywhere; no horizontal overflow on mobile. Confirmed that the
  coarse-pointer rule at `ghostwriter.tsx:325` is deliberate, not a focus bug —
  opening a document on touch does not summon the keyboard, and tap-to-write then
  focuses, shows the Plume and persists text. Save states and timestamps are in
  place. Documented the Plume as PRD FR-4.6 and in the implementation plan and
  CLAUDE.md conventions (motion now reads "six named behaviors plus the Plume
  cursor states; no state may loop"), and synced the stale writing-rule numbers
  across PRD and POC to the settled 30% anchor and 1 / 0.72 / 0.42 ladder, marking
  POC's anchor / quiet-floor / settle-timing questions answered. Build passes.
  Not verified: the departing/responding states during Review, which need a build
  with a key configured — carried as the next action.

- ✅ **2026-09-28 [UX]** — Raised the writing position: the live line sat at 42% of
  the viewport and read as too low, especially at the start of a draft where only
  ~30px of scroll exists and layout, not the anchor, sets the height. Moved
  `WRITING_ANCHOR` to 0.30 (0.33 first, then 0.30 by the author's eye) and cut the
  space above the first line (`.manuscript`
  padding-top `clamp(64px, 12vh, 140px)` -> `clamp(40px, 7vh, 96px)`, `.paragraphs`
  margin-top 56 -> 40px) so the opening line starts where the anchor would hold it;
  trailing space raised to 72vh to stay above the 67vh the new anchor needs. The
  line now sits at 290px of a 900px viewport (32%) identically on the first
  keystroke and deep into a draft — it never moves. Re-verified: no drift during
  typing, ladder unchanged, no console errors, no mobile overflow, reload persists.
  Build passes.

- ✅ **2026-09-28 [UX+Dev]** — Browser QA of the writing-space pass (Playwright on
  Chrome, 1280x900 and iPhone-sized). Found and fixed four defects the build could
  not catch: three later `.reflection-stage textarea` override rules still boxed the
  new paragraph surface (one with `min-height: 45vh`, which also drove a React
  "Maximum update depth exceeded" loop against the auto-resize); the global
  `:focus-visible` outline drew a literal box around the live paragraph (now
  suppressed for `.manuscript-paragraph` only — the caret is the focus indicator);
  the caret followed a paragraph split one frame late and dropped keystrokes, fixed
  by moving focus and auto-resize to `useLayoutEffect`; and `.manuscript`'s 50vh
  trailing space was less than the 60vh the 40% anchor needs, so the last lines of a
  short draft could not reach the writing position (now 64vh). Also aligned the dead
  `.writing-line` gutter style to 40vh. Measured: the caret holds at 380px of an
  900px viewport (40% = 360) while a paragraph grows 77 -> 193px, identical across
  nine samples under reduced motion; scroll is bit-identical during typing and only
  moves on the 600ms settle; the opacity ladder reads 0.42 / 0.42 / 0.72 / 1 and a
  revisited paragraph returns to full ink. No console errors, no horizontal overflow
  on mobile, reload persistence intact. Production build passes.

- ✅ **2026-09-28 [UX+Dev]** — Writing-space pass, on the author's direction. Removed
  the bordered "prompt box" from Reflect (a leftover holding pen that read as a chat
  composer) and gave Reflect the same borderless paragraph surface as Write, so there
  is now one writing surface in the app. Made the fixed writing position hold the
  *caret line* rather than the paragraph top, anchored at 40% with settle-on-pause
  (600ms) instead of immediate refocus, and honoured the anchor under reduced motion
  as an instant jump — the position is the rule, only the travel is motion. Deepened
  the focus falloff to 1 / 0.72 / 0.42 (active / previous / older) as the author's
  tuning choice, superseding the 0.82 candidate in POC.md §2; the values now live as
  exposed constants in `src/motion.ts` and are mirrored by `is-past` / `is-distant`
  resting styles so reduced motion keeps the same hierarchy. Fixed a latent bug where
  `quietParagraph`'s inline opacity left a revisited earlier paragraph permanently
  dim. Production build passes; browser QA is the next action.

- ✅ **2026-09-28 [UX+Dev]** — Replaced the sequential Memory/Tension/Outcome/System/People flow with five plain reference bullets beneath the main prompt. One borderless manuscript is shared with focused writing; removed per-question answers and progression. Preserved earlier notes for recovery. Updated product docs. Build and diff checks pass; browser QA confirms five bullets, shared manuscript content, reload persistence, and no mobile overflow.

- ✅ **2026-09-28 [UX+Dev]** — Reworked guided writing per the author's preference:
  compact prompts, substantially larger response surface, free question navigation,
  manuscript bypass, and explicit note transfer. Simplified manuscript controls;
  added stable-ID draft autosave independent of AI review, note preservation,
  export access, storage-error recovery, and title-excluded word count. Preserved
  the existing word-spacing fix and corrected selected-text Enter behavior.
  Production build and diff checks pass; browser QA verified desktop/mobile,
  reload persistence, note transfer, two-draft switching, Markdown export contents,
  simulated storage failure, HTTP 200, no horizontal mobile overflow, and no console
  errors. PRD, POC, and implementation direction updated; anchor tuning remains pending.

- ✅ **2026-09-28 [UX+Dev]** — Fixed Reflect prompt rendering: words were jammed
  together because the `Words` component put the inter-word space inside the
  `display:inline-block` `[data-word]` spans (trailing whitespace is trimmed in
  an inline-block box). Moved the space to a text node between spans; animation
  target preserved. Typecheck and production build pass.
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
