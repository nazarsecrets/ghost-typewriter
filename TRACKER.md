# Project Tracker — SVR Ghostwriter

Single source of truth for **what's done, what's in progress, and what's next**.
Every agent and every session must keep this current (see the rule in `CLAUDE.md`).

- **Product requirements:** [PRD.md](./PRD.md)
- **Direction & build state:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **Current POC scope:** [POC.md](./POC.md)
- **Ideas backlog:** [log.md](./log.md)

**Legend:** ✅ done · 🔄 in progress · ⏸ on hold · ⬜ pending · 🎯 the one next action

**Classification:** every new progress item is labeled **[UX]**, **[Dev]**, or
**[UX+Dev]**. Read-only inspection does not require a separate tracker entry.

**Commit message:** every ✅ Completed entry (from 2026-11-17 on) opens with a
copy-ready commit message in a fenced `text` block, directly under its
date/label line and before the outcome (format in `CLAUDE.md` / `AGENTS.md`).

_Last updated: 2026-11-17_

---

## 🎯 Next action (do this next)

**[UX+Dev] Enchanted Diary Phase 1.** Add the opt-in appearance selector and static diary styling per `ENCHANTED_DIARY_PLAN.md`, preserving the mounted editor and saved drafts. Ghost is published and live reading verified; the separate rate-limit follow-up below remains pending.

---

## 🔄 In progress

- 🔄 **[UX+Dev] (started 2026-11-17)** Enchanted Diary Phase 1: add an opt-in appearance selector and static diary styling around the mounted existing editor, preserving drafts, session records, navigation, writing behavior, and exports.
No active implementation item.


---

## ⏸ On hold

- ⏸ **[UX] (held 2026-11-11 by author, while other aspects are built)** Assess long-session comfort on the open white canvas. Sound authenticity, comfort, and the on/off control were approved on 2026-10-18, with current motions retained for now. Remaining: write with the native caret and optional sound, and judge whether strike motion and Return's 8px text shift still earn their place without a sheet. (Merged with the former Pending comfort follow-up; the prior animated quill was distracting or tiring and the first silent trial was dull, but neither validates this version.)

---

## ⬜ Pending

### Optional Enchanted Diary theme

- ⬜ **[UX+Dev]** Phase 2, after Phase 1 preservation checks pass: refine diary materials and add cancellable, accessible prompt/review ink presentation using existing Anime.js; no manuscript absorption, new AI service, storage migration, or replacement editor. Retain effects only after an author comfort check.

### Focused POC — prove World → Me



### Discovery robustness — after the core POC handoff

- ⬜ **[UX+Dev]** Refresh cadence, remaining work: an all-seen state ("You've read this whole edition") and resetting the seen list per category, because today the source-backed desk stops changing after about 8 refreshes. Optional edition footnote and Evergreen copy are still awaiting the author's pick. The sync line is done; see Completed, 2026-11-11.
- ⬜ **[UX]** Author: write more frames where the editorial review shows one question carrying several topics. On the 2026-10-12 build the single Process fallback question carried 7 of 42 topics, and Design systems, Designing with uncertain systems, Interfaces, and Research each had a question on 3–5. Every new provocation in `pipeline/editorialize.ts` needs five guide lines in `src/writingGuideCopy.json` or the build fails. No frames were added by an agent, so the existing set stays author-owned.
- ⬜ **[UX]** Author: read `npm run topics:review` and record the first real verdicts in `data/editorial-verdicts.json`; the file is empty.
- ⬜ **[Dev]** Optionally evaluate local Hugging Face embeddings for semantic relevance/clustering; keep the deterministic pipeline as the required fallback

### Ghost reattachment — after the paper is proven

- ⬜ **[UX+Dev]** Design passage-anchored Ghost margin notes for Idea, Clarity, Voice, Evidence, and Structure while preserving the raw draft (PRD FR-5.1; log.md idea 12)
- ⬜ **[UX+Dev]** Distinguish revisions from new drafts (FR-6.2). The structured critique schema and slip UI from FR-5.2 are implemented and live-provider validation passed on 2026-11-17.
- ⬜ **[UX+Dev]** Add accept-insight and margin-comment motion only when their corresponding interactions exist (log.md idea 6)

- ⬜ **[UX+Dev]** Decide whether an explicit pencil icon is useful beside the existing row-click editing action. If adopted, match the new inline SVG delete icon's line weight and keep both buttons accessible.

### Hosted Ghost follow-up

- ⬜ **[Dev]** Investigate remote rate-limit enforcement: the configured six-per-minute binding did not emit 429 during bounded invalid-request probes (7 then 20). Local rejection handling passes. Do not claim a hard global cap; see `GHOST_VALIDATION.md`.

### Release and optional polish

- ⬜ **[UX+Dev]** Evaluate remaining optional immersion only after the core writing behavior is settled: soft caret, paper texture, and View Transitions (PRD FR-8)

---

## ✅ Completed

- ✅ **2026-11-17 [UX+Dev]**
  ```text
  Move the Reflect lens and add optional guide overstrikes

  Keep the lens in the toolbar, recede reference guides without reflow,
  and persist reversible guide marks with each draft. Retain Anime.js
  and immediate reduced-motion states; keep GSAP limited to Ghost.
  ```
  Moved the lens out of the text column, added keyboard-accessible per-draft guide marks with stepped overstrikes, and fade guides to 0.68 after writing begins with hover/focus recovery and full opacity in forced colors/print. Ink-colored reference text preserves readability while dimmed. No progress meters or unsolicited onboarding. Updated PRD and README. Build and diff checks pass; Chromium verified reload persistence, reversible and keyboard marks, unchanged prose, stable manuscript position during fade, focus recovery, reduced motion/forced colors, and no overflow at 320px. Screenshots: `output/playwright/reflect-guide-marks-{mobile,desktop}.png`. Enchanted Diary remains next. Changes are local and uncommitted.

- ✅ **2026-11-17 [UX]**
  ```text
  Update the getting-started guide for the Reflect writing flow
  ```
  Updated README onboarding for optional angles, the first-paragraph cue, folded labels, shared manuscript, local saves/export, and deliberate Ghost reading; replaced obsolete Anthropic setup instructions. Checked labels and consent behavior against current source. Documentation only; no runtime tests needed. Overstrike and motion proposals remain pending; Enchanted Diary remains next.

- ✅ **2026-11-17 [Dev]**
  ```text
  Reconcile stale Ghost hosting tracker status
  ```
  Removed the superseded hosting pause record and duplicate pending hosting/Pages entries; live API and hosted UI validation and publication are recorded below. Remote rate-limit enforcement remains pending; Enchanted Diary remains next.

- ✅ **2026-11-17 [Dev]**
  ```text
  Require a copy-ready commit message on every completed tracker item

  Claude (CLAUDE.md) and Codex (AGENTS.md) now open each Completed entry
  with a fenced commit message, before the outcome, so the author can
  copy it first. Agents write the message but do not commit unless asked.
  ```
  Added the commit-message rule and format to both agent guides and the tracker header; the Reflect guides entry below follows it. Earlier entries are unchanged.

- ✅ **2026-11-17 [UX+Dev]** — Published Ghost at https://nazarsecrets.github.io/ghost-typewriter/ using Workers AI at `ghostwriter-reading.svr-ghostwriter.workers.dev/read`. Wrangler OAuth verified; endpoint TLS propagation resolved; disposable direct API and hosted browser readings returned structured slips with the original manuscript unchanged. CORS blocked-origin 403 and allowed preflight 204 pass; six contract tests, local build, and Pages workflow run `44171027143` build/deploy pass for `89492ec`. Preserved current remote topic manifest during merge. Reconciled hosting docs. Rate-limit observation is inconclusive and tracked separately. Enchanted Diary remains unimplemented.

- ✅ **2026-11-17 [UX+Dev]**
  ```text
  Fold Reflect guides to labels and cue the first paragraph

  Use the topic's Memory guide as the empty first paragraph's placeholder,
  add an "Angles, not steps" note above the guides, and fold the guides to
  label chips when Reflect opens on a draft that already has words. Each
  chip reveals one guide with the existing pathwayEnter motion. Folding is
  decided on entry only, so typing never reflows the page.
  ```
  Built three onboarding-reference changes in Reflect: the empty first paragraph uses the topic's Memory guide as its placeholder; an "Angles, not steps — use any, in any order." note sits above the guides; when Reflect opens on a draft that already has words, the guides fold to five label chips that each reveal one guide (existing `pathwayEnter` Anime.js motion, reduced-motion gated), with a Show all / Fold toggle. Folding is decided on entry only so typing never reflows the page. GSAP stays Ghost-only. `npm run build` passes; headless Chromium checked placeholder, note, no mid-typing fold, fold on return, chip reveal and aria-expanded, unfold, and no overflow at 320px, with no page errors.

- ✅ **2026-11-17 [Dev]** — Followed Cloudflare’s official agent setup instructions: installed all 22 Cloudflare skills globally under `~/.agents/skills/`, registered the enabled `cloudflare` MCP server at `https://mcp.cloudflare.com/mcp` in Codex user configuration, and completed OAuth (CLI reported successful login). Installer warnings concerned unsupported PromptScript global installs; Codex skills installed successfully. Optional beta `cf` CLI skipped because this project already has Wrangler configuration. Restart Codex to load the MCP server. This does not deploy Ghost or establish Wrangler authentication.

- ✅ **2026-11-11 [UX+Dev]** — Implemented Ghost's setup, static plume, six frames, four optional habits, per-draft reading defaults/persistence, five passage-aware lenses, frame checks, structured editorial slips, stale-result marking, cancellation/retry/offline states, and isolated GSAP. New critique leaves the manuscript editable and never requests rewritten prose; legacy saved Review text stays readable. Build and five contract/proxy tests pass. Browser checks covered consent, selection restoration, per-draft recovery, all lenses, invalid-response recovery, 320–1920px placement, fixed scroll position, reduced motion, immediate writing after close, and axe for setup/menu/slip; production anchors work without AI. `GHOST_VALIDATION.md` records evidence and remaining limits. An initial proxy template is present but undeployed; the complete feature remains In progress until the free hosted route and live-provider checks are resolved. PRD FR-5, the invocation document and agent guidance are reconciled.

- ✅ **2026-11-11 [UX+Dev]** — Today's source desk heading now reads "Synced 3h ago • Next sync in 5h", replacing "Updated <date>", in the format the author chose. `syncStatus()` in `src/topicSource.ts` counts down to the next scheduled check on the workflow's 8-hour cron (00/08/16 UTC), never to new ideas. It shows "Next sync due now" for up to 90 minutes after a missed slot, then "Next sync is running late", and after 24 hours "Last synced Oct 12 • New syncs haven't arrived". The line re-renders each minute, and Evergreen desks show no sync line. `SYNC_INTERVAL_HOURS` must match `.github/workflows/topics.yml`. Validation: `npm run build` passes, and a script checked each state's wording at sample times. No browser check was run. The current local manifest (2026-10-12) shows the stale wording until the Pages deploy and the scheduled refresh are live.

- ✅ **2026-11-11 [UX]** — Author confirmed distinct layouts: keep the prompt/guided view centered and the focused manuscript on its OneNote-style, left-aligned open canvas. Current CSS already implements this direction; no runtime changes or new browser validation were needed. This layout decision does not close the held long-session comfort assessment. Optional Enchanted Diary Phase 1 remains next.

- ✅ **2026-11-11 [UX+Dev]** — Removed the manuscript title's visible focus border to match the paragraph editor's native-caret treatment; forced-colors mode retains its Highlight outline. `npm run build` passes; browser QA not run. The optional Enchanted Diary Phase 1 remains next.

- ✅ **2026-11-09 [UX+Dev]** — Closed the 2026-10-18 sound/grain item after verifying its existing implementation: carriage audio follows paragraph creation, Shift+Enter and title navigation stay silent, strikes play when enabled, and muting persists after reload. Static grain loads on Typewriter Reflect and is removed in forced colors and print; Write remains smooth white per the superseding 2026-11-04 canvas decision. Production build passes; browser checks confirmed these behaviors and no console errors, plus paragraph creation under reduced motion without a new carriage transform. No runtime changes were needed. Enchanted Diary remains unimplemented; excluding Typewriter sound and its control remains a requirement of that pending theme, not a validated theme feature. Author's newer canvas comfort follow-up remains next.

- ✅ **2026-11-04 [UX+Dev]** — Replaced the Write sheet and desk with a OneNote-style open white canvas from the author's reference, superseding the two sheet entries below. No edges, shadow, or grain on Write; text starts at the upper left in line with the header; the column stays capped at 672px with open space to the right. Title now comes first, with date and time beneath it, and the "Your manuscript" label is gone. The date shows the last save because drafts store no creation date. Free positioning, sideways growth, and ruled lines were not built, since they would require replacing the paragraph editor. The machine-illustration pending item is dropped as moot. Validation: `npm run build` passes; browser checks from 1920px to 320px, and with reduced motion at 1280px, covered typing, paragraph creation, reload recovery, no horizontal overflow including during Return, caret at 0.296–0.297 of viewport height, and no console errors. axe not re-run.

- ✅ **2026-11-04 [UX+Dev]** — Author asked for more breathing room at the sides of the sheet. Inner side margins grew from 44px to 96px on desktop and 16px to 28px on phones; the sheet widened from 760px to 864px so the desktop text column stays 672px and line length is preserved. Phone lines are slightly shorter. Validation below in the same session: measured at 1440, 1280, 1024, 800, 390, and 320px with no horizontal overflow.

- ✅ **2026-11-04 [UX+Dev]** — Restyled the Write sheet from the author's typewriter reference: crisp warm white (`#FFFEFA`) with square corners, a hard edge and contact shadow, on a warm desk (`#E8E1D2`) scoped to Typewriter's Write view. Grain alpha dropped from .09 to .03 because it had dimmed the sheet to the desk's brightness; this also lightens Reflect. Graphite and rule are adjusted in scope (graphite 5.35:1 on desk, 6.90:1 on sheet). Column width, Return shadow behavior, and motion code are unchanged. Validation: `npm run build` passes; browser checks at 1280px and 390px, with and without reduced motion (1280px), covered typing, paragraph creation, no horizontal overflow, and no console errors; the caret settled at the same position as the old layout (0.296 of viewport height at 1280px). axe was not re-run. The machine illustration in the reference was not built; that decision is under Pending.

- ✅ **2026-10-18 [UX+Dev]** — Preserved partial source-backed desks in `src/topicSource.ts`; Today now discloses total and per-category shortfalls without mixing in Evergreen or filling missing slots from other categories. Updated PRD status. Validation: production build/guide coverage, pipeline typecheck, and diff checks pass; Playwright verified 2/1/0, 0/0/1, and 2/2/2 desks, stale labeling, Refresh preferring unseen source IDs while retaining a partial desk, empty/invalid/network-failure Evergreen fallback, 390px overflow, topic → guided writing → reload recovery, and Enter creating a second paragraph. No page exceptions; the deliberately aborted manifest produced the expected network error. Session/draft persistence code is unchanged. The author sound-and-motion session remains next; diary implementation remains pending.

- ✅ **2026-10-17 [UX+Dev]** — Read `enchanted_diary_spec.md`, canonical guidance, and current editor/storage integration; recorded a two-phase optional-theme plan in `ENCHANTED_DIARY_PLAN.md` with preservation gates and explicit resolution of the spec's Enter-to-submit/new-AI scope conflicts. Planning only; no runtime changes or theme validation performed. The author sound-and-motion session remains next.

- ✅ **2026-10-12 [UX+Dev]** — Built the editorial quality-review loop for live provocations. **Record:** every `topics:build` now writes `data/editorial-review.json` (never shipped to the client) with the keywords that put each source under its frame, and flags three weak cases: no theme matched, theme supported only by the description, and two themes tied. `npm run topics:review` prints the flagged topics, the keywords behind them, and questions carried by more than two topics. **Verdicts:** `data/editorial-verdicts.json` lets the author drop a topic or file it under a named theme; verdicts cannot change dates, sources, or category reasons, and stale or unknown-theme verdicts are reported instead of applied. **Rules tuned from a live snapshot of 43 topics:** keywords now match whole words (substring matching had read "ai" inside other words and filed pieces such as "Password Reset UX" and "SaaS Search UX" under the AI frame), a headline hit outweighs a description hit, job-posting headlines are dropped, and the Interfaces theme gained six keywords; 8 of 43 topics changed frame. **Evidence:** drop, retheme, unknown-theme, and stale verdicts each verified against a real build, then the verdict file reset to empty; pipeline typecheck and `npm run build` pass. The run refreshed `public/topics.json` (42 topics, 18 flagged). New frames were not written; that is the author item now under Pending. The author sound-and-motion session remains next.

- ✅ **2026-10-06 [UX+Dev]** — Completed the Today → Write manuscript pass. **Keyboard:** Backspace at a paragraph's start merges it into the previous one and Delete at its end merges the next one in, with the caret placed at the join either way; arrow keys at a paragraph edge cross into the neighbour; modified keys, selections and IME composition stay native; Enter in the title moves to the first paragraph. **Focus:** skip link to main, the heading takes focus at the top of the page on Today/Reflect/Review, the native caret remains the paragraph focus indicator (a trial 2px signal gutter rule was removed after the author saw it read as an outsized second cursor beside the caret; forced colors keep a Highlight outline). **Readability:** past paragraphs rest at 0.82 and distant ones at 0.68 instead of 0.72/0.42. Fixed a WCAG 2.5.3 failure on Today: source links' accessible name now starts with their visible source name. **Browser evidence (Playwright, 1280px and 390px, motion and reduced motion, 98/98 checks):** 68 characters per line at 22px/1.65 in a 672px column on desktop, 39 at 19px in 338px on a phone, 14px paragraph gap, no horizontal overflow on Write or Reflect; all boundary keys verified in both Write and Reflect; zero sheet, shell or line movement while typing, returning and erasing under reduced motion; axe clean on Today, Reflect and Write; no console errors. Production build passes.

- ✅ **2026-10-06 [UX+Dev]** — Added a Copy Markdown action under the writing view's Export menu and in Review, sharing the Markdown download serializer. The clipboard text preserves the H1 title, paragraph breaks, and H2/H3 reflection-note hierarchy, with success/failure feedback. Browser checks matched copied and downloaded content, verified Escape/focus behavior and no console errors; production build passes. The author sound-and-motion session remains next.

- ✅ **2026-10-06 [UX+Dev]** — Added a right-edge delete icon to each Recent drafts row, visible on hover/focus and always visible on touch. The separate Open button preserves row editing; deletion requires confirmation. Deleting the active draft rotates to a blank session and stays deleted after reload. Browser checks covered hover, focus, cancel, active/inactive deletion, persistence, icon placement, and no console errors; production build passes. The author sound-and-motion session remains next.

- ✅ **2026-10-06 [UX+Dev]** — Removed the Today subtitle's desktop-only left indent so it aligns with the heading; browser measurements showed matching left edges at 1280px and 390px, and the production build passes. The author sound-and-motion session remains next.

- ✅ **2026-10-06 [UX+Dev]** — Kept the existing Anime.js library and tuned its key response to a short active-line step with a small impact; erase reverses and rapid typing softens the pulse. Return now moves the sheet 8px with a brief shadow change beside the recorded carriage cue. Browser checks showed both motions settling to rest, paragraph creation and typing intact under reduced motion, and `npm run build` passing. The author's long-session verdict remains open.

- ✅ **2026-10-06 [UX+Dev]** — Replaced the synthetic buffers with eight short strikes adapted from the author-linked Pixabay old-typewriter recording and a separate scrolling cue on Enter. The opt-in toggle and saved preference remain. The full recordings are excluded from the app; source and adaptation details are recorded in `public/sounds/README.md`. Build passes; browser checks confirmed strike and carriage playback, mute, preference after reload, and no alerts or console errors. Authenticity and long-session comfort await the author's session.

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
