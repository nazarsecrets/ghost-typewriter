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

## Idea 9 — Intellectual serendipity, not a prompt library

**The move.** Today feels like a small editorial desk delivering a few things worth thinking about. One story leads; the remaining signals are quieter. Possible reader-facing lenses are Design, Technology, Industry, Ways of Working, and Self.

**Why it matters.** The product begins creating value before writing starts: it broadens professional awareness without asking the author to search or prompt an AI.

**Current state.** Implemented. Today gives the highest-ranked idea dominant editorial weight, presents five quieter signals beside it, and maps existing product tags into Design, Technology, Industry, Ways of Working, and Self lenses. Source-backed items now pass through a deterministic editorial layer: an original question becomes the prompt, a neutral Why now explains the signal, and the article headline remains provenance only. Evergreen provenance remains explicit.

**Open questions.**
- Are the editorial lenses useful navigation or unnecessary taxonomy?
- Should one dominant story be selected by rank, category, or author preference?
- How much source context belongs on the desk before it becomes a news reader?

---

## Idea 10 — Typing enters a quieter flow state

**The move.** A keystroke gets a minute mechanical response; after sustained writing, nonessential feedback reduces and the environment becomes quieter.

```text
keypress → character lands → cursor advances → page fills → environment quiets
```

**Why it matters.** The writing becomes intrinsically rewarding without streaks, XP, or productivity pressure.

**Current state.** The manuscript has a fixed paragraph position and quiets old paragraphs, but it does not yet distinguish initial typing from sustained flow or settle only on pause.

**Open questions.**
- What can respond without adding input latency: character, caret, paper, or optional sound?
- When does flow begin, and how gradually should feedback recede?
- Does any per-character animation remain comfortable in long sessions?

---

## Idea 11 — Ghost waits until invoked

**The move.** No permanent AI panel. A quiet dormant mark waits off the paper until the author intentionally invokes it, then offers contextual lenses: question my argument, find what is missing, go deeper, challenge an assumption, or help with structure.

**Why it matters.** It preserves the actor boundary: World supplies material, Me writes, Ghost questions. The AI feels like a collaborator rather than the owner of the document.

**Current state.** Review is a separate surface, which is directionally correct, but it is reached through a visible manuscript-end button and returns a general critique block.

**Open questions.**
- Is Ghost invoked through a mark, keyboard command, command palette, or combination?
- Should the mark ever indicate availability, or remain visually inert?
- Can Guided Reflect use the same invocation grammar without becoming an interruption?

---

## Idea 12 — Editorial pencil in the margin

**The move.** Preserve the raw draft and unfold Ghost observations beside specific passages. Classify notes as Idea, Clarity, Voice, Evidence, or Structure.

**Why it matters.** Questions and annotations develop the writer; automatic rewrites merely polish output. The author explicitly decides what enters the manuscript.

**Current state.** The side-by-side Review layout exists, but the response is one preformatted text block with no passage anchors or structured lenses.

**Open questions.**
- How is a note anchored when paragraphs change during revision?
- Does accepting a note copy a prompt into working notes or change prose directly? The current doctrine favors notes, never automatic replacement.
- Which annotation types deserve distinct motion without expanding the motion language indefinitely?

---

## Cross-cutting notes

- **3 and 4** define the two core surfaces (the interview, the paper). **6 and 8** are the motion and physics that make both feel alive. They're mutually reinforcing — worth discussing as a set.
- Much of this scaffolding already exists in code; the gap is mostly **framing, pacing, and restraint**, not net-new engineering — except the two missing motion behaviours in Idea 6, which depend on features outside this shortlist.
- Not in scope here (but referenced): margin critique (5) and pull-the-thread (7) — both would unlock the missing Idea 6 behaviours if we pursue them later.
- **9–12** extend the same doctrine: World creates curiosity, the paper protects Me, and Ghost arrives only after intentional invocation.
