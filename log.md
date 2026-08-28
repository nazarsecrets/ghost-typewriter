# Ghostwriter — Ideas to Discuss

Four ideas pulled from the editorial-desk review, narrowed down to explore their potential. Notation, current state, and open questions for each.

---

## Idea 3 — Reveal pathways one at a time (interview yourself)

**The move.** Stop returning Memory, Tension, Outcome, System, People as one visible set. Present a single pathway, full-bleed and quiet, and let the writer move through them one at a time.

```text
                              MEMORY

Think about the first time this
actually became a problem in your work.

                                  ↓

                          Something came to mind
```

Click → the page shifts → the next pathway (TENSION) replaces it. A subtle escape hatch: `show me another way into this →`.

**Why it matters.** The taxonomy is already good; the all-at-once grid flattens it into a checklist. Sequencing turns it into *interviewing yourself* — one question, space to answer, then the next. Closer to a ghostwriter drawing out the story than a form.

**Current state.** We already store all five pathways and a `pathwayIndex`, and render a trail. We show one prompt at a time in a "stage," but the whole trail is visible and the framing is navigational rather than exploratory.

**Open questions.**
- Keep the visible trail, or hide it to increase immersion (and lose orientation)?
- Is the order fixed, or does the writer branch ("another way in")?
- Do earlier answers stay visible as a trail, or recede entirely?
- What's the minimum answer before "continue" feels earned — or is skipping always allowed?

---

## Idea 4 — Introduce the "paper"

**The move.** The writing area stops being a textarea and becomes the centrepiece artefact — the manuscript, not "text entered into software."

```text
                              842 words

      THE PROTOTYPE BECAME THE SPECIFICATION

      I started noticing something during one
      of our working sessions.

      █

      Memory · System · Prototype
```

Generous width and vertical whitespace. Serif for manuscript, sans for system UI. No visible textarea boundary. No submit button crowding the manuscript.

**Why it matters.** This is the emotional centre. If the paper feels like an artefact, the whole product stops reading as an AI dashboard. Everything else (motion, margins, pacing) hangs off this surface feeling real.

**Current state.** Paragraph-based editor already exists — each paragraph is its own auto-resizing textarea, serif manuscript type, word count. But there's still a titled input, visible chrome (utility bar with Article/LinkedIn, Reflective/Editorial toggles), and a "Review this draft →" button sitting right at the manuscript's end.

**Open questions.**
- Where do the mode/tone controls go so they don't puncture the paper? (Hidden until summoned?)
- Does the "Review" action move off the page entirely (a gesture, a margin, a keystroke)?
- Serif choice — the plan names Iowan Old Style / Palatino. Is that the manuscript voice we want?
- How wide is "generous," and does it hold on smaller screens?

---

## Idea 6 — A small motion language (~six behaviours)

**The move.** Don't animate everything. Establish a fixed vocabulary so Anime.js becomes *interaction grammar*, not decoration.

| Moment                | Behaviour                                        |
| --------------------- | ------------------------------------------------ |
| Ghostwriter speaks    | Character or word reveal                         |
| New idea appears      | Gentle upward reveal                             |
| Switching pathways    | Question fades upward, next replaces it          |
| Accepting an insight  | Text physically moves toward manuscript          |
| Editor comment        | Margin annotation unfolds                        |
| Entering writing mode | UI chrome retreats and paper expands             |

**Why it matters.** A consistent, small motion set is what makes the app feel authored rather than templated. Each motion should mean something — the same behaviour always signals the same kind of event.

**Current state.** Six behaviours already exist in `src/motion.ts`: `ghostReveal`, `pathwayExit`, `pathwayEnter`, `focusParagraph`, `quietParagraph`, `enterWritingMode`. All gated behind `prefers-reduced-motion`. So the *scaffolding* matches this idea closely — but two of the listed moments have no counterpart yet: **"accepting an insight → text moves toward manuscript"** and **"editor comment → margin annotation unfolds"** (both depend on ideas not yet built).

**Open questions.**
- Which two behaviours do we add, and do they require the margin-notes and pull-the-thread features first?
- Is there a shared timing signature (duration, easing) that makes them read as one family?
- Should "Ghostwriter speaks" become a true typed timeline (cursor → sentence → pause → sentence) rather than a word fade?

---

## Idea 8 — One physical rule: fixed writing position

**The move.** While actively writing, the current paragraph stays ~40% down the viewport. Completed paragraphs drift upward and become slightly quieter (opacity `1 → .82`, not blurred). Your live thought stays physically centred while the manuscript accumulates around it.

**Why it matters.** This is the contemporary reinterpretation of a typewriter carriage — the single physical rule that gives the product its identity without going retro. It's the difference between "a text editor" and "an immersive writing surface."

**Current state.** Largely implemented. `focusParagraph` anchors the active paragraph to 42% of the viewport; `quietParagraph` softens older paragraphs (floor at 0.72). The plan calls out this "fixed writing line" as the distinctive element.

**Open questions.**
- 40% vs current 42% — does the anchor point *feel* right, or is it too high/low in practice?
- The quiet floor is 0.72; the review suggests 0.82 — how quiet before it reads as "gone"?
- Should the anchor hold during fast typing, or only settle on pause (to avoid a jittery carriage)?
- Is there a visible margin marker (the "writing line") or is the behaviour felt-only?

---

## Cross-cutting notes

- **3 and 4** define the two core surfaces (the interview, the paper). **6 and 8** are the motion and physics that make both feel alive. They're mutually reinforcing — worth discussing as a set.
- Much of this scaffolding already exists in code; the gap is mostly **framing, pacing, and restraint**, not net-new engineering — except the two missing motion behaviours in Idea 6, which depend on features outside this shortlist.
- Not in scope here (but referenced): margin critique (5) and pull-the-thread (7) — both would unlock the missing Idea 6 behaviours if we pursue them later.
