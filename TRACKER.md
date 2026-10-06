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

_Last updated: 2026-10-06_

---

## 🎯 Next action (do this next)

**[UX] Write with sound enabled, then judge the feel.** The first silent trial
felt dull and its sub-pixel responses did not read as a typewriter. Sound is now
available through the fixed header, muted by default. Judge its authenticity and
long-session comfort, then decide whether the four strike motions and Return
still earn their place. Paper grain remains a separate author decision; the
standing no-texture instruction still applies until then.

---

## 🔄 In progress

- 🔄 **2026-10-06 [UX]** — Author writing-session check: the silent surface felt dull and its existing key responses were imperceptible; spacing was corrected and opt-in sound added. Awaiting the author's verdict on sound authenticity, comfort, which motions to retain, and paper grain.

---

## ⬜ Pending

### Focused POC — prove World → Me

- ⬜ **[UX]** Author follow-up: assess long-session comfort with the native caret and optional sound. The prior animated writing quill was distracting or tiring; the first silent trial was dull, but neither is comfort validation of this revised version.
- ⬜ **[UX]** Remaining writing-space ideas the author has not taken up yet: move the lens out of the text column into the margin or toolbar, and fade the five reference bullets out once writing is under way.
- ⬜ **[UX+Dev]** Complete the manuscript type, measure, spacing, keyboard, and reduced-motion pass across Today → Write

### Discovery robustness — after the core POC handoff

- ⬜ **[UX+Dev]** Show partial source-backed desks honestly when a category has fewer than two qualified topics; disclose the shortfall instead of replacing the entire desk with Evergreen prompts
- ⬜ **[UX+Dev]** Add an editorial quality-review loop for live provocations: record weak source/theme matches, tune rules, and expand human-authored frames without fabricating freshness
- ⬜ **[Dev]** Optionally evaluate local Hugging Face embeddings for semantic relevance/clustering; keep the deterministic pipeline as the required fallback

### Ghost reattachment — after the paper is proven

- ⬜ **[UX]** Define the dormant Ghost invocation and contextual lens chooser without permanent writing-time AI chrome (PRD FR-5.0; log.md idea 11)
- ⬜ **[UX+Dev]** Design passage-anchored Ghost margin notes for Idea, Clarity, Voice, Evidence, and Structure while preserving the raw draft (PRD FR-5.1; log.md idea 12)
- ⬜ **[UX+Dev]** Replace the single Review text block with a structured critique schema and distinguish revisions from new drafts (PRD FR-5.2, FR-6.2)
- ⬜ **[UX+Dev]** Add accept-insight and margin-comment motion only when their corresponding interactions exist (log.md idea 6)
- ⬜ **[Dev]** Choose and implement the production AI path for invoked Reflect/Review: free serverless proxy or BYO-key mode (PRD FR-10)

- ⬜ **[UX+Dev]** Add per-draft edit (pencil) and delete actions to the draft list. The project has **no icon library** — dependencies are React, React DOM and Anime.js only, and existing affordances are text or typographic marks (`→`, `↗`). Draw both as inline SVG in the plume's line-art register (same stroke weight and charcoal tone) rather than adding a dependency; deletion needs a confirm or undo, since drafts are the only copy of the work.

### Release and optional polish

- ⬜ **[Dev]** Configure the GitHub Pages build and deploy workflow after the focused POC passes browser QA
- ⬜ **[UX+Dev]** Evaluate remaining optional immersion only after the core writing behavior is settled: soft caret, paper texture, and View Transitions (PRD FR-8)

---

## ✅ Completed

- ✅ **2026-10-06 [UX+Dev]** — Built the author-requested opt-in typewriter sound: four subtly varied, locally generated buffers each for letter, punctuation, space, erase, and Return with a brief bell; a fixed-header Sound on/off button starts muted and stores the preference separately from drafts. Browser checks confirmed silence by default and after muting, all five sound classes when enabled, persistence across reload, sound in Write and Guided Reflect, no sound for arrows or shortcuts, and a visible control without phone overflow at 320px. Build and console checks pass. Authenticity and long-session comfort remain author judgments.

- ✅ **2026-10-06 [UX+Dev]** — Reduced the oversized space between manuscript paragraphs: line height 2.15 → 1.65, grid gap 28 → 14px, and textarea minimum height 52 → 40px. Browser check with three short paragraphs measured 54px between paragraph tops, with Return behavior intact and no console errors; production build passes. The author comfort check remains the next action.

- ✅ **2026-09-29 [UX+Dev]** — Typewriter quick wins by phase, then §10. **Phase 2
  (§5 input-specific response):** a keystroke's mechanical work now depends on what
  the key does — letter +0.55px, punctuation +0.61px (a sharper strike), space
  +0.36px (a soft tick), Backspace/Delete **-0.50px** (a reverse, back up the
  line). Arrows, modifiers and shortcuts produce nothing, per §5's warning that
  restraint protects the writing experience. **Phase 3 (§6 Return as the hero
  interaction):** Return now moves the machine rather than the line — the sheet
  travels 2.4px and returns while its shadow deepens, over 260-300ms, on top of
  the existing line advance. **§10 Paper and surface:** the page could not respond
  until it was an object, so the manuscript is now a sheet on a desk — the shell
  takes `--paper`, the sheet `--sheet`, with a soft resting shadow that deepens
  only on the carriage return via an animated `--sheet-lift` custom property.
  The page is never animated continuously. Measured: all five input classes
  distinct, carriage travel -1.71px with shadow lift peaking at 0.83, paper
  returning to identity and lift 0 at rest, and **zero movement of any kind under
  reduced motion**. Sheet is 760px wide with a 672px measure on desktop and 370px
  with a 338px measure on a phone, no horizontal overflow. Regression clean: axe
  reports no violations across all four surfaces in both motion modes, the 30%
  anchor and opacity ladder are unchanged, and no console errors. Moved the strike
  from the parent to `ParagraphEditor`, which knows both its own element and the
  key, removing a ref-map lookup. **Deliberately not done:** the paper grain §10
  offers, which contradicts the standing no-paper-texture instruction, and sound
  (§8), which needs a Web Audio build and a remembered mute preference. Synchronized
  the PRD, POC, implementation plan, CLAUDE.md, interaction report, and Idea 10 with the
  shipped response; the Plume is documented as fully unwired.


- ✅ **2026-09-29 [UX+Dev]** — Manuscript keyboard and accessibility pass across
  Today → guided writing → focused writing, run with axe-core plus keyboard-only
  traversal, since axe cannot test operability. axe found one issue (no level-one
  heading in Write, because the manuscript title is an `<input>`); **the keyboard
  pass found four more, all in the drafts drawer**, which was an `<aside>` with no
  dialog semantics: focus never entered it, Tab escaped to the toolbar behind it,
  **Escape did not close it**, and focus was not restored on close. It is now a
  `role="dialog" aria-modal="true"` element with an accessible name, focus moved
  to its first control on open, Tab cycling inside it only, Escape closing it, and
  focus returned to the Drafts trigger (which now carries `aria-haspopup` and
  `aria-expanded`). Added a visually hidden `h1` mirroring the manuscript title,
  and `role="group" aria-label="Manuscript"` so the paragraph textareas are not a
  bare list of unlabelled fields. **Removed three `role="status"` live regions**
  from the routine save indicator: they announced "Saving… / All changes saved" on
  every pause, which is the opposite of PRD FR-4.4's "autosave is silent unless it
  fails" — the indicator stays visible and the failure path keeps `role="alert"`.
  Verified clean: axe reports no violations in all four surfaces under both full
  and reduced motion, and a keyboard-only run reaches Today → a topic → guided
  writing → focused writing, types two paragraphs, opens and dismisses the drafts
  dialog, and restores focus, with no console errors. Deliberately not added: a
  skip link — the header carries four controls and choosing a topic focuses the
  manuscript directly, so there is no block to bypass. The manuscript textareas
  keep no focus outline by design; the caret is their focus indicator.


- ✅ **2026-09-29 [UX+Dev]** — Muted the quill and started the typewriter. The
  author's instrument is a typewriter, so the plume no longer fits the theme;
  note this overrides `typewriting-feel.md` §11, which would have kept the plume
  as a second layer for the writer's *state*. `PlumeCursor` is unwired from the
  app with the component, its inkwell and its CSS retained, so the decision is
  reversible; bundle 291.9 -> 277.7 kB. Added `paperImpulse` as a named motion
  behaviour: Phase 1 of the document, stage 3 only — the active line answers a
  keystroke with a sub-pixel impulse, deliberately below the 0.5-1px the document
  suggests because writing-time motion has already been rejected once for comfort.
  It is local to the line, never the application, replaces rather than queues, and
  scales down with typing speed. Measured: deliberate keystrokes move the surface
  0 -> 0.60px and back over 54 frames; sustained typing peaks at 0.46px; the
  surface returns to identity with no backlog after typing stops; reduced motion
  produces zero movement. **Input is untouched** — keydown to commit is a median
  of 0.3ms, p95 0.6ms, max 1.3ms, with all 117 characters of a two-paragraph test
  present. Fixed a wiring bug found in verification: the impulse looked up only
  the Write ref map, so it never fired in Reflect. PRD FR-4.6 marked muted with
  the reason; CLAUDE.md records the typewriter theme and that the text model is
  always authoritative.


- ✅ **2026-09-29 [UX]** — Editorial pass over the 60 authored guide sets, driven by
  a phrasing audit rather than spot-checks. Found and fixed four faults: **11
  System guides were ungrammatical** ("How did how teams recognize coordination
  and record decisions shape what happened?" — the subject is the *way* a thing is
  done, now "How did the way …"); **59 of 60 People guides ended in the same
  clause** ("… experience that decision?"), several straining grammar and
  presupposing a decision the other four guides had not established — rewritten
  across five constructions sized to each subject, with 8 two-party subjects
  rewritten by hand to keep both parties in fewer words; **People guides ran long**
  (median 91 chars, max 113) — now median 81, max 88; and **Memory and Outcome
  openings were 52% and 62% identical** across the desk — now 25% and 31%, so a
  returning author stops meeting the same sentence shape every session. Thirteen
  lines over 88 chars were shortened, since longer lines wrap to a third row in the
  phone guide list. Verified: guides render for source-backed and Evergreen
  prompts on desktop and phone with no horizontal overflow, and the phone guide
  list measured **248px both before and after** the rewrite on the same prompt —
  the copy changes did not affect height (the 224.8px in the earlier entry was
  measured on a different prompt, so it was never a like-for-like comparison).

- ✅ **2026-09-29 [Dev]** — Made the guide-coverage promise real. There was **no
  coverage check in the repo** — an earlier claim that the build enforced it was
  wrong. Added `tools/check-guide-coverage.mjs` and wired it into `npm run build`
  (`npm run guides:check`): it fails the build when a manifest provocation or
  Evergreen prompt has no authored copy, when a set is not exactly five guides,
  when any line exceeds 88 characters, or when the "how did how" stacking
  reappears. Verified it exits 1 on a seeded fault and passes on the real data:
  60 sets covering 33 provocations and 24 Evergreen prompts.


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
