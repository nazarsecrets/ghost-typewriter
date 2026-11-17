# Ghost — Invocation, Frames, Lenses & the Editor's Slip (draft v2)

_Status: implementation authorized 2026-11-11. UI and proxy template implemented; build, automated contract tests and browser UI checks pass (see `GHOST_VALIDATION.md`). Production deployment and real-provider sampling are not complete. Defines PRD FR-5.0 and extends it; covers log.md ideas 6, 11 and 12._

**Author decisions applied in v2**

- The mark is a **plume**, not a ghost. It is shown as the plume symbol plus a
  word for now.
- The mark **floats** in a fixed position beside the writing column instead of
  sitting in the toolbar, which scrolls away.
- The author can turn Ghost's reading **on or off** for a draft, especially an
  original, blank-page draft.
- Feedback arrives in an **editorial-review format**: a side panel or a slip
  that unrolls.
- The tone **builds the writer up with constructive suggestions**. It is not
  another Grammarly.
- Beyond lenses, Ghost offers **anchors**: writing habits and frameworks that
  help the writer start and keep going.
- Ghost is available in **both** blank and prompted drafts.
- **v2.1 decisions:** GSAP drives Ghost's interactions. The label is **Ghost**. The plume rests **low in the right margin**, away from the writing line. Reading is **on for original drafts** and **optional (off) for prompted drafts**.

## 1. The boundary this protects

**World supplies material. Me writes. Ghost edits like a good editor: it
questions and encourages, and never writes the piece.**

1. **Ghost never speaks first.** There is no idle detection and no nudges.
   Anything Ghost shows is the result of something the author did.
2. **Ghost never writes the manuscript.** It offers questions, observations, and
   structure. It never offers replacement prose.
3. **Ghost never sits on the writing line or delays a keystroke.**
4. **Ghost builds the writer up.** It leads with what is working and gives one
   clear next move, not an itemized list of faults.

### The plume and the typewriter

The typewriter is still **the author's** instrument. The plume becomes **the
editor's** pen. The two tools stand for the two actors, which fits the theme:
the writer types and the editor marks up in ink. This is a static emblem only.
The muted animated Plume *cursor* (`src/PlumeCursor.tsx`) stays unwired. Its
vane geometry may be reused to draw the static emblem. When this is adopted,
the Theme note in `CLAUDE.md` should say that the plume is Ghost's emblem, not
the writing instrument.

## 2. The floating plume

**Placement (wide screens, where the right gutter is at least 160px):**

- `position: fixed`, so it stays put while the page scrolls up.
- **x:** anchored to the column's right edge plus 56px. The column is
  left-anchored and capped at 672px (`.manuscript` in `src/styles.css`), so
  this x is stable at every wide viewport.
- **y:** resting low in the right margin, 32px above the bottom of the
  viewport. It is kept away from the writing line (30% of viewport height) so
  it never pulls at the writer's eye while they type. _(Author decision
  2026-11-11.)_
- **Look:** a plume symbol plus the word **Ghost**, in graphite ink, at the toolbar's text
  size. It never animates, pulses, or changes appearance based on content.

**Narrow screens (gutter under 160px, tablets in portrait, phones):** the plume
moves to a fixed bottom-right spot, 16px from the edges and above the on-screen
keyboard safe area, and shows the symbol only, with an accessible label.

**States**

| State | Appearance | Tooltip / accessible name |
| --- | --- | --- |
| AI unconfigured | Plume remains available for anchors | Reading is not connected; anchors still work on-device. |
| Reading on | Ink plume plus word | "Ghost: anchors, lenses and review" |
| Reading off | Same position, outline plume | "Ghost isn't reading this draft. Anchors are still available." |

There is no badge, dot, count, or pulse in any state.

**Invocation:** click the plume, or press ⌘/Ctrl+Shift+Enter (to be checked
against browser reservations). If text is selected, Ghost works on that passage.
Otherwise it works on the whole draft. The caret and selection are restored
exactly when Ghost closes.

## 3. Ghost in blank and prompted drafts (both: yes)

Ghost is available in both kinds of draft, because both writers benefit from an
editor. What differs is **what Ghost starts with** and **whether it reads by
default**.

| | Prompted draft (came through Today → Reflect) | Blank-page draft (original) |
| --- | --- | --- |
| Starting anchor | The topic's five writing guides (Memory, Tension, Outcome, System, People), which already exist | The author picks a frame or habit (§4), or none |
| Ghost reading | **Optional, off** by default. The writing guides already carry the author, and Ghost is an extra they can switch on | **On** by default. A blank page is where an editor helps most _(author decision 2026-11-11)_ |
| Toggle | "Let Ghost read this draft": on/off, saved per draft | Same |

**What the toggle controls:** only whether Ghost *reads the text*. When it is
off, lenses, frame checks, and the editor's slip are unavailable and no text
leaves the device. Anchors stay usable because they are static and run on the
device. Turning reading on never sends anything by itself. A lens or review is
still something the author asks for.

## 4. Anchors: frames and habits (the blank-page toolkit)

Anchors give the blank page some footholds without filling it. They are
**author-chosen, static, free, and on-device**. Ghost only *checks* them when
asked, and the author must have reading turned on.

### 4a. Frames: structures to write toward

Choosing a frame places its **beats** as small anchor points in the right
gutter, beside the column, above the low resting plume. On narrow screens anchors follow the manuscript in document flow. Each beat is a label with a guiding
question.

| Frame | Beats | Good for |
| --- | --- | --- |
| What · So what · Now what | Observation → Meaning → Change | Reflective UX pieces |
| Claim first | Point → Reasons → Evidence → So what | Opinion and argument |
| SCQA | Situation → Complication → Question → Answer | Explaining a decision |
| Case story | Context → Problem → What I did → What changed | Portfolio and case essays |
| Changed my mind | I used to think → Then → Now I think → Why it matters | Personal essays |
| Hook · Story · Lesson · Ask | Hook → Story → Lesson → Question | LinkedIn mode |

Prompted drafts use their five writing guides as the frame, so both kinds of
draft share one anchor system.

**Keeping the author going:**

- The author ticks a beat when it feels done. Only then does the next beat's
  guiding question appear in the gutter, as static text with no motion loop.
  Ghost has not spoken first, because the author's tick caused it.
- **Check my frame** (an AI action that needs reading on) maps paragraphs to
  beats. It reports which beats are strong, which are thin, and which are
  missing, and asks one question to start the next beat. It assesses the frame
  the author chose. It does not impose a different one.
- The author can switch or drop a frame at any time, and the text never
  changes.

### 4b. Habits: craft disciplines the author opts into

| Habit | What it does |
| --- | --- |
| **North star** | Before writing, the author states the point in one sentence. It is pinned at the top of the gutter as the reference the whole piece answers to. |
| **Name your reader** | One line about who the piece is for. Lenses and the slip use it. |
| **Draft before you edit** | **Opt-in** _(author decision 2026-11-11)_. Lenses stay locked until the author marks "First draft done". This protects the first pass from self-editing, which is the opposite of Grammarly. The author is always told it is on (§4c). |
| **Park the next line** | On leaving, the author jots where they will pick up. It is shown at the top when the draft is reopened. |

There are no streaks, XP, word-count pressure, or scores (log.md idea 10).

### 4c. First-time setup intro and keeping the author informed

The author must never be surprised by a locked lens. Awareness comes from
setup and static labels, never from Ghost interrupting.

**First-time cue (static, not a nudge):** until a writer has opened Ghost once,
the plume reads **Ghost · Set up** instead of **Ghost**. It does not animate,
badge, or pop. After setup is finished or skipped, the label goes back to
**Ghost** for good. The setup intro is saved as seen in local storage. If local
storage is unavailable, the intro shows again next time, which is safe.

**Setup intro (the first time Ghost is opened, on any draft):** a short card
unrolls from the plume in place of the menu. There are three steps, and each one
is skippable.

```
GHOST · SET UP                                   1 of 3
─────────────────────────────────────────────
I'm your editor. I read only when you let me,
I never rewrite your words, and I speak only
when you ask.

Reading this draft            [ On ]   ← original draft default
                                                 [Next →]  Skip
─────────────────────────────────────────────
2 of 3 · Pick a frame (optional)
What · So what · Now what   Claim first   SCQA
Case story   Changed my mind   Hook · Story · Lesson · Ask
None for now
─────────────────────────────────────────────
3 of 3 · Habits (all optional)
☐ North star: say your point in one sentence first
☐ Name your reader
☐ Draft before you edit: I'll hold my questions
  until you mark "First draft done"
☐ Park the next line: leave yourself a note when you stop
                                              [Start writing]
```

On a prompted draft, step 1 shows reading **Off** (optional), and step 2
says _"This draft already has its five writing guides as its frame."_

**While Draft before you edit is on, the author always knows:**

- **Static line in the gutter anchors area:** _"Drafting first. My questions
  wait until you mark First draft done."_ with **Mark done** beside it.
- **In the plume menu:** each lens row shows _"after your first draft"_ in place
  of its description, and **First draft done** sits at the top of the menu.
- **If a lens is chosen anyway:** the §7 message appears with **Mark done now**
  and **Keep drafting**. It never silently fails.
- **After marking done:** a one-line confirmation, _"First draft done. Lenses are
  open."_ The habit can be switched off at any time from the menu.

## 5. Lenses: questions on written text (reading on)

These are the same five lenses as v1, chosen from the plume menu: **Question my
argument**, **Find what's missing**, **Help me go deeper**, **Challenge an
assumption**, and **Help me structure this**. The order is fixed, there is no
free-text box, and the copy follows the selection's scope ("this passage" or
"this draft"). Each lens returns its result in the editor's slip (§6).

**Plume menu** (same popover pattern as Export):

```
Ghost · On "Why our dashboards lie" · 640 words        Reading: On ●
───────────────────────────────────────────────────────────
ANCHORS    Frame: What · So what · Now what   ›   Check my frame
           Habits: North star ✓  Draft before you edit
LENSES     1 Question my argument
           2 Find what's missing
           3 Help me go deeper
           4 Challenge an assumption
           5 Help me structure this
REVIEW     Editor's slip for the whole draft
```

## 6. The editor's slip: how feedback arrives

### Format

The slip is a strip of editorial paper that **rises from the plume and unrolls
upward** through the right gutter, beside the manuscript. The writer reads the notes next to
their own words and never leaves the page. It replaces the separate Review view
for lens and slip results.

- **Wide screens:** a slip about 360px wide in the gutter, which scrolls on its
  own. The manuscript stays editable alongside.
- **Medium screens and phones (gutter too narrow):** it unrolls upward as a bottom sheet. While open, the manuscript has its own scroll area above it so the sheet does not cover prose. A narrow right margin reserves room for the fixed plume even while it is closed.
- **Material:** in the Typewriter theme it is a typed galley proof, a
  newspaper-like editorial slip that matches the Today desk. Enchanted Diary may
  later dress it as a parchment scroll. The structure stays the same.
- **Close:** Esc, a "Roll up" control, or clicking the manuscript. The slip rolls
  back into the plume and focus returns to the caret.

### Motion

The unroll is the missing **"Editor comment → margin annotation unfolds"**
behaviour from log.md idea 6, so it fills an existing slot in the motion
language rather than adding new decoration.

- It takes about 480ms: a clip-path reveal plus a small paper roll edge that
  travels down and settles. It does not loop.
- Under `prefers-reduced-motion` the slip appears instantly.
- **Library: GSAP** _(author decision 2026-11-11)_. Ghost's interactions use
  GSAP: the plume menu opening, the setup intro, the slip unrolling and rolling
  up, and the frame beat ticks. Writing-time motion (strikes, Return) stays on
  Anime.js.
- **Character: calm, plus about 3% personality** _(author decision
  2026-11-11)_. The motions keep the restrained Anime.js feel, with a small,
  noticeable lift: a gentle overshoot, one soft settle, and a plume that reacts.
  There is no squash, rubbery stretch, or repeated bounce. Starting values,
  tuned by eye in the browser:

  | Interaction | Motion | GSAP |
  | --- | --- | --- |
  | Slip unrolls | Rises and unrolls, overshoots about 3% of its height, then settles once | `back.out(0.9)` (about 3.0% overshoot), about 480ms |
  | Slip rolls up | Rolls back into the plume with no overshoot | `power2.in`, about 320ms |
  | Plume, when opened | Tilts about 6° like a pen being picked up, scales to 1.03, then settles | `back.out(0.9)`, about 360ms |
  | Plume, when the slip closes | Dips about 2px like a pen set down | `power1.out`, about 200ms |
  | Frame beat ticked | Tick draws in, beat label lifts 2px and settles | `back.out(0.9)`, about 280ms |
  | Menu and setup intro | Fade plus 4px rise, a 30ms stagger per row | `power2.out`, about 240ms |

- **Rules that still hold:** every motion answers an author action. Nothing
  idles, loops, wiggles, or breathes, including the plume at rest. Motion never
  moves the manuscript text or delays a keystroke. Everything stays under
  600ms. Under `prefers-reduced-motion` all of it is instant (opacity only).

### Tone: uplifting and specific, not Grammarly

The slip reads like a good editor's note in the margin. It does not read like a
spell-checker report.

```
EDITOR'S SLIP · Question my argument
─────────────────────────────────────
You're arguing that dashboards fail because teams stop asking
what they were built to answer.

WHAT'S WORKING
"The chart was right. The question was stale." This line carries
the whole piece. Keep it.

THE ONE MOVE
Your strongest proof arrives in paragraph 5. What happens if the
reader meets it in paragraph 2?

QUESTIONS TO CARRY
· Who noticed first, and why them?
· What would the team have done differently with the right question?

▸ Small things (3), shown only in a full review
```

**Rules for every slip:**

1. **Start with understanding.** A one-sentence reading of the piece's point
   shows the writer that Ghost actually read it.
2. **Lead with a strength.** It must be specific and quoted. Generic praise such
   as "Great job!" is not allowed.
3. **Give one move.** Name a single highest-leverage suggestion, framed as a
   question with its reason, not a list of ten.
4. **Ask at most two questions** for the author to carry into the next pass.
5. **Keep mechanics behind a fold.** Grammar and typos appear only as a count,
   expandable, and only in a full review. Never as red underlines, never inline,
   never by default.
6. **No rewrites, scores, or percentages.**
7. **Keep it under about 180 words.** If it takes longer to read than to act on,
   it is too long.
8. Use the stated reader (§4b) and the draft's mode and tone (FR-5.3).

**Note:** today's `CRITIQUE_PROMPT` in `ghostwriter.tsx` asks for grammar
first, a refined version, titles, and hashtags. That is the Grammarly pattern
this section rejects. It should be rewritten to this contract when the slip is
built.

**If the author edits after a slip:** the slip stays and is marked _"Written
for an earlier version of this draft"_.

## 7. States and failure (inherits FR-5.4)

| State | Copy |
| --- | --- |
| Reading off, lens requested | _"Ghost isn't reading this draft. Turn reading on to use lenses."_ with an inline **Turn on** control |
| Draft before you edit is active | _"You asked to finish a first draft before editing. Mark it done when you're ready."_ |
| Loading | The slip unrolls to a header showing _"Reading closely…"_ |
| Failure | _"Ghost couldn't read this just now. Your draft is safe."_ with **Try again** |
| Offline | _"Ghost needs a connection. Anchors, writing and exports still work."_ |

## 8. Guided Reflect

Ghost stays out of Reflect for now. Reflect is already where the author
questions themself.

## 9. Acceptance checks

- The plume stays at a fixed x and y while the manuscript scrolls, and never
  overlaps the column at any width from 320px to 1920px.
- It does not animate at rest; its action-triggered tilt and settle follow §6. Its appearance never depends on draft content.
- Blank (original) drafts start with reading on. Prompted drafts start with reading off.
  The setting is saved per draft and survives reload.
- With reading off, no network request contains manuscript text.
- Anchors work with AI unconfigured and with reading off.
- Every slip follows §6 (understanding, strength, one move, two questions or
  fewer, about 180 words or fewer, no rewrites), checked by sampling.
- GSAP is loaded only for Ghost interactions. The unroll does not loop and is
  instant under reduced motion.
- The menu and slip are fully keyboard-operable, Esc restores caret and
  selection, and both pass axe.

## 10. Decisions for the author

Decided 2026-11-11:

- Motion library: GSAP for Ghost.
- Label: "Ghost".
- Plume position: low in the right margin.
- Reading defaults: on for original drafts, optional for prompted drafts.

- Frames: keep all six.
- Draft before you edit: opt-in, with a first-time setup intro and constant
  awareness while it is on (§4c).
- Motion character: calm interactions built in GSAP, plus about 3% personality
  (§6 Motion).

Still open: none blocking. The motion values are starting points to tune in the
browser with the author.

## Dependencies

- A real AI path in production (PRD FR-10) for lenses, Check my frame, and the
  slip. Anchors ship without it.
- The structured critique schema adopts the §6 contract in `src/ghostModel.ts`.
- PRD FR-5.0–5.2 now reflect the plume, consent, anchors and slip. Legacy saved Review text remains readable; new reviews use the slip.
