# Ghostwriter POC — "The Paper with One Rule"

A proof of concept for the grug-shaped version of Ghostwriter: an immersive, focused writing tool built around **one physical rule** on **one worthy surface**. Everything else is subtraction.

> **Thesis:** A manuscript that keeps your live thought physically still while the writing accumulates around it. No dashboard. No chrome. No AI theatre. One rule, held with conviction.

---

## 1. What we're proving

That a single physical constraint — the **fixed writing position** (Idea 8) on a **chrome-free paper** (Idea 4) — is enough to make writing feel immersive and focused, distinctive rather than "another AI writing app."

We are **not** proving the reflection flow, the topic desk, or the AI critique in this POC. Those exist and can be reattached later. The POC isolates the core feeling so we can judge it honestly.

**Success = the writing surface feels inevitable.** You open it, you write, and it feels like paper that knows to stay still — not software you're typing into.

---

## 2. The one rule (Idea 8)

While actively writing:

- The **current paragraph** stays anchored at ~40% down the viewport.
- **Completed paragraphs** drift upward as you continue.
- Older writing gets **slightly quieter** — opacity `1 → ~0.82`, never blurred, never hidden.
- The anchor **settles on pause**, not on every keystroke (no jitter during fast typing).

This is the contemporary reinterpretation of a typewriter carriage. It is the whole identity of the product.

Already scaffolded: `focusParagraph` (42% anchor) and `quietParagraph` (0.72 floor) in `src/motion.ts`. POC tunes these, doesn't rebuild them.

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

## 4. Scope

**In:**
- Blank manuscript, title + paragraphs (reuse existing paragraph editor).
- The fixed-writing-position rule, tuned.
- Chrome-free layout.
- Silent, durable autosave (`localStorage`, versioned — already implemented).

**Out (deferred, not deleted):**
- Topic desk / today view.
- Reflection pathways.
- AI critique / margin notes.
- Export flows.
- The serverless API proxy (no AI calls in this POC → nothing to secure yet).

Deferring the AI entirely is deliberate: if the paper doesn't feel right *silent*, no amount of AI will save it.

---

## 5. Build plan (small)

1. **Fork a `/write`-only entry** — render the writing shell directly, bypassing `today → reflect`. (Reuse `startBlank`'s path.)
2. **Strip the chrome** — remove the utility bar and end-of-manuscript button from the write view; keep title + paragraphs + word count.
3. **Tune the rule** — expose anchor % and quiet floor as constants; try 40% / 0.82, settle-on-pause behavior.
4. **Silence autosave** — keep the durable write, drop or soften the visible "Saved" state.
5. **Type + spacing pass** — confirm serif manuscript, generous measure, whitespace.

All five are edits to existing code, not new systems. Estimated as an afternoon, not a sprint.

---

## 6. What to decide by looking at it

These are tuning questions the POC exists to answer — judged by feel, in the browser, not on paper:

- **Anchor point:** 40% vs 42% — where does the live line *want* to sit?
- **Quiet floor:** 0.82 (calmer) vs 0.72 (more recession) — how quiet before old text reads as "gone"?
- **Settle timing:** does anchoring on pause feel natural, or do we need continuous tracking?
- **Whitespace / measure:** how wide is "generous" before the eye loses the line?
- **Silence:** is a removed save-state trusting-and-calm, or unsettling?

---

## 7. The grug test

Before adding anything back, ask of every element: *does this protect the writing, or decorate the software?* The 2026 Apple Design Award for grug went to an app that did **one thing** with total conviction and cut everything else. This POC is that discipline applied to writing:

> Less dashboard. Less chat. Less AI theatre. More typography, silence, pacing, and one physical rule you can feel.

If the silent paper feels inevitable, we reattach the ghostwriter around it — as a presence, not a service. If it doesn't, we fix the paper first.
