# Ghostwriter POC — "The Paper with One Rule"

> **Guidance clarification (September 28):** Memory, Tension, Outcome, System, and People are passive, prompt-specific bullet guides for the main prompt, not separate questions or steps. Guide copy is selected by the exact provocation (or stable Evergreen ID), with separate authored sets for all current prompts; topic changes and restored drafts derive guides from their selected topic. One continuous manuscript sits beneath them and is shared with the focused writing view. Earlier reflection notes remain recoverable. This supersedes the step-based guided-editor description below.

A proof of concept for the grug-shaped version of Ghostwriter: an immersive, focused writing tool built around **one physical rule** on **one worthy surface**. Everything else is subtraction.

> **Thesis:** You review today's ideas, choose one, and drop straight onto a manuscript that keeps your live thought physically still while the writing accumulates around it. No chat. No chrome on the page. No AI theatre. One rule, held with conviction.

This is not a proof of an AI writing tool. It is a proof of an intentional writing environment with an optional collaborator:

> A typewriter that keeps a designer intellectually curious.

The full product has three actors—**World** supplies things worth noticing, **Me** thinks and writes, and **Ghost** questions or refines only when invited. This POC deliberately proves World → Me. Ghost stays out of the room until the paper itself feels inevitable.

---

> **September 28 direction update:** The author selected guided writing with smaller prompts and more writing space. The current implementation keeps topic → guided writing as the default, with freely selectable questions, an always-available manuscript bypass, and explicit transfer of notes. The direct-entry flow below remains the earlier POC proposal rather than the current default.

## 0. The flow this POC covers

```text
   REVIEW TOPICS  ──▶  SELECT ONE  ──▶  WRITE (the paper)
   today's ideas      a single idea     one physical rule
```

The POC is the **whole path from "what should I write about" to the act of writing** — the two frictions the product exists to remove — and nothing after. Reflection pathways, AI critique, and export are deferred (they exist and reattach later).

---

## 1. What we're proving

Two things, in sequence:

1. That **reviewing today's ideas and selecting one** feels like an editorial desk delivering a story, not a dashboard of equal cards.
2. That landing on the **chrome-free paper** with the **fixed writing position** (Ideas 4 + 8) makes the act of writing feel immersive and focused — distinctive, not "another AI writing app."

**Success = the path feels inevitable.** An idea arrives, you choose it, and you're writing on paper that knows to stay still — no seam, no software friction between deciding and writing.

---

## 2. The one rule (Idea 8)

While actively writing:

- The **current paragraph** stays anchored at ~40% down the viewport.
- **Completed paragraphs** drift upward as you continue.
- Older writing gets **quieter** — opacity `1` active, `0.72` one paragraph back, `0.42` beyond; never blurred, never hidden.
- The anchor **settles on pause**, not on every keystroke (no jitter during fast typing).

This is the contemporary reinterpretation of a typewriter carriage. It is the whole identity of the product.

Settled: `focusParagraph` (30% anchor, holding the caret line) and `quietParagraph` (0.42 floor) in `src/motion.ts`, with both exposed as constants.

---

## 3. The surface (Idea 4)

The paper is the artefact, not a textarea.

```text
                              842 words

      THE PROTOTYPE BECAME THE SPECIFICATION

      I started noticing something during one
      of our working sessions.

      █

```

Rules for the surface:
- Generous width, generous vertical whitespace.
- **Serif** manuscript type; **sans** for the few system elements.
- No visible textarea boundary, no border, no box.
- **No submit button** beside the manuscript.
- Word count is the only ambient indicator, quiet and top-aligned.

### What disappears (the subtraction)
| Currently on the write screen | POC |
| --- | --- |
| Article / LinkedIn toggle | Removed from view; summoned later, not while writing |
| Reflective / Editorial toggle | Same — not a writing-time decision |
| "Review this draft →" button at manuscript end | Removed; review becomes a deliberate gesture (keystroke / command), off the page |
| "writing line" debug label | Removed or made a felt-only margin marker |
| Save state pill | Reduced to a whisper, or removed (autosave is silent and trusted) |

---

## 4. Typing as the reward

**Revised September 29, 2026:** The pace-responsive quill passed technical
checks but the author found it distracting or tiring. The Plume is now unwired,
and the native text caret is the only cursor. A restrained typewriter response
has since been adopted: eligible keys produce distinct sub-pixel movement on
the active line, scaled down during sustained typing; Return moves the sheet
briefly as the line advances. Arrows, modifiers, shortcuts, and reduced-motion
sessions produce no movement. Text is never delayed.

The reward is immediate text entry, a steady writing position, and a readable
manuscript. Typing interrupts transitions immediately; it never waits for them.
The 30% anchor still settles on pause, and reduced motion removes nonessential
transition movement. There are no streaks, scores, or celebrations.

A 305-word, four-paragraph automated walkthrough preserved input, editing, and
reload state before these latest motion changes. This is usability evidence, not
proof of long-session comfort. In the first author trial, the silent surface felt
dull and its mechanical responses were not perceptible; paragraph spacing was
then tightened. Opt-in Web Audio sounds and a persistent, visible Sound on/off
control are now available for another real session. Paper grain remains unadopted.

## 5. Scope

**In:**
- **Topic desk** — review today's ideas as an editorial desk (one dominant story, quieter signals), not a grid of equal cards.
- **Selection** — choose one idea; it carries through as the manuscript's subject.
- **Direct hand-off to the paper** — selecting an idea drops you straight onto the manuscript (skip reflection for the POC), with the chosen title seeded.
- Manuscript, title + paragraphs (reuse existing paragraph editor).
- The fixed-writing-position rule, tuned.
- Chrome-free writing layout.
- Silent, durable autosave (`localStorage`, versioned — already implemented).

**Out (deferred, not deleted):**
- Reflection pathways (Today → *Reflect* → Write becomes Today → Write for the POC).
- AI critique / margin notes.
- Export flows.

**Topic dependency:** Today loads the provider-independent static topic manifest and falls back to the honest local Evergreen desk. Source-backed records are transformed into an original lens-based provocation and neutral Why now signal; article headlines remain provenance rather than prompts. Discover → Choose → Write therefore requires no Claude key, serverless proxy, or hosted model. The paper itself makes no AI calls.

Skipping guided reflection and everything after the paper is deliberate: this POC proves the *entry into writing*. If arriving at the paper doesn't feel right, nothing downstream will save it.

---

## 6. How Ghost reattaches later

Ghost is deferred, not deleted. It should return only after the author has written and intentionally invokes it—never as a permanent sidebar or inline completion engine.

A quiet dormant mark may offer contextual lenses:

- Question my argument.
- Find what is missing.
- Help me go deeper.
- Challenge this assumption.
- Help me structure this.

The resulting notes live beside the untouched draft and identify Idea, Clarity, Voice, Evidence, or Structure concerns. Ghost proposes questions and connections; Me decides what enters the manuscript.

## 7. Build plan (small)

1. **Reshape the topic desk — complete.** The highest-ranked provocation leads, five quieter signals follow, editorial lenses aid scanning, and source-backed or Evergreen provenance remains explicit. For current material, Why now carries the signal and the linked article remains evidence rather than the writing prompt. The desk stays still on load; interaction feedback carries the motion.
2. **Wire select → write** — choosing an idea seeds the manuscript title/subject and goes straight to the write view, bypassing reflection for the POC.
3. **Strip the chrome** — remove the utility bar (mode/tone toggles) and the end-of-manuscript button from the write view; keep title + paragraphs + word count.
4. ~~**Tune the rule**~~ — done: constants exposed, 30% anchor with settle-on-pause (600ms), 1 / 0.72 / 0.42 falloff.
5. **Silence autosave** — keep the durable write, drop or soften the visible "Saved" state.
6. **Type + spacing pass** — confirm serif manuscript, generous measure, whitespace on the paper.

All six are edits to existing code, not new systems. Estimated as an afternoon, not a sprint.

---

## 8. What to decide by looking at it

These are tuning questions the POC exists to answer — judged by feel, in the browser, not on paper:

- ~~**Anchor point:** 40% vs 42%~~ — settled at **30%**; 40% and 42% both read as too low on screen. Measured at 290px of a 900px viewport, identical on the first keystroke and deep into a draft.
- ~~**Quiet floor:** 0.82 vs 0.72~~ — settled deeper than either: **0.72** one paragraph back, **0.42** beyond. Revisiting a paragraph restores it to full ink.
- ~~**Settle timing:**~~ — settled on pause at 600ms; scroll is unchanged between keystrokes and moves only once typing stops.
- **Whitespace / measure:** how wide is "generous" before the eye loses the line?
- **Silence:** is a removed save-state trusting-and-calm, or unsettling?
- **Typing response:** which subtle mechanical cue rewards typing without becoming noticeable or delaying input?
- **Flow transition:** when should feedback become quieter after sustained writing?

---

## 9. The grug test

Before adding anything back, ask of every element: *does this protect the writing, or decorate the software?* The 2026 Apple Design Award for grug went to an app that did **one thing** with total conviction and cut everything else. This POC is that discipline applied to writing:

> Less dashboard. Less chat. Less AI theatre. More typography, silence, pacing, and one physical rule you can feel.

The product should almost look boring in a screenshot. It comes alive only when someone starts typing.

If the silent paper feels inevitable, we reattach the ghostwriter around it — as a presence, not a service. If it doesn't, we fix the paper first.
