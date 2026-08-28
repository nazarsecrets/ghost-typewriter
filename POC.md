# Ghostwriter POC — "The Paper with One Rule"

A proof of concept for the grug-shaped version of Ghostwriter: an immersive, focused writing tool built around **one physical rule** on **one worthy surface**. Everything else is subtraction.

> **Thesis:** You review today's ideas, choose one, and drop straight onto a manuscript that keeps your live thought physically still while the writing accumulates around it. No chat. No chrome on the page. No AI theatre. One rule, held with conviction.

---

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

**One dependency:** the topic desk loads ideas from Claude. For the POC that means either a working local key (dev proxy) or a small hardcoded set of sample topics so the flow is demoable without the API. The serverless proxy decision is still deferred; the paper itself makes no AI calls.

Skipping reflection and everything after the paper is deliberate: this POC proves the *entry into writing*. If arriving at the paper doesn't feel right, nothing downstream will save it.

---

## 5. Build plan (small)

1. **Reshape the topic desk** — break the equal-card grid into one dominant story + five quieter signals; stagger them in with Anime.js on load. (Fall back to sample topics if no key.)
2. **Wire select → write** — choosing an idea seeds the manuscript title/subject and goes straight to the write view, bypassing reflection for the POC.
3. **Strip the chrome** — remove the utility bar (mode/tone toggles) and the end-of-manuscript button from the write view; keep title + paragraphs + word count.
4. **Tune the rule** — expose anchor % and quiet floor as constants; try 40% / 0.82, settle-on-pause behavior.
5. **Silence autosave** — keep the durable write, drop or soften the visible "Saved" state.
6. **Type + spacing pass** — confirm serif manuscript, generous measure, whitespace on the paper.

All six are edits to existing code, not new systems. Estimated as an afternoon, not a sprint.

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
