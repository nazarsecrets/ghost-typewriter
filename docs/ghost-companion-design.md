# Ghost as a companion — a Clippy that knows when to be quiet

_Status: proposal for author review (2026-11-19). Nothing here is implemented. Several items need an author decision, because they amend Ghost's current rules (see §7)._

## 1. The ask

- Keep Ghost (the plume and the slip that unrolls, which the author calls the scroll guide) **in the right margin**, where it is today (`src/ghost.css`: right gutter on wide screens, bottom-right on narrow ones).
- Keep the onboarding as written: the README "Start writing" flow of Today → Reflect angles → mark an angle → Focus on manuscript → invite Ghost.
- Give Ghost a bit of Clippy's **personality and presence**: a small character who is fun to have around, reminds you of good habits, and helps younger or newer writers stay anchored. It must never interrupt someone who just wants to write.

## 2. What Clippy got wrong, and what it got right

A note on the name: Clippy (officially "Clippit") was the Office Assistant in Microsoft Office 97–2003. Windows XP's assistant was a different character, Rover, the search dog. Both came out of Microsoft's assistant work in the late 1990s (Microsoft Bob, then the Lumière research project).

**What failed, and the rule each failure gives us:**

| Clippy's failure | Our rule |
| --- | --- |
| Spoke first, guessing intent ("It looks like you're writing a letter") | Ghost reacts only to **things the author did**. It never infers what they're doing from their text or from pauses. |
| Interrupted mid-task and stole focus | Ghost never speaks **while the author is typing**, and never takes focus or covers prose. |
| Didn't learn: dismissing it once didn't stop it | Every kind of remark has **"Don't mention this again"**, and that choice is remembered. |
| Fidgeted constantly (idle animations) and pulled the eye | No idle or looping motion. Each gesture is **one-shot** and answers an event. |
| Hard to turn off; on for everyone by default | **Companion is opt-in.** Quiet Ghost (today's behavior) stays the default. |
| Shipped without the original research's confidence threshold, so it acted on bad guesses | We don't guess. Every trigger is a definite event (a view change, a checkbox, a goal the author set). |

**What worked, and is worth keeping:**

- A **character** makes software feel less clinical. People still feel fond of Clippy. The fondness was for the character; the annoyance was about timing.
- **Gestures carried meaning without words**: a tilt, a glance, a little flourish. A gesture can acknowledge something without needing a sentence.
- **Being findable**: it lived in one consistent place. Ghost already has that (fixed in the right margin).

## 3. The idea: three levels, chosen in Ghost's setup

| Level | Who it suits | What Ghost does |
| --- | --- | --- |
| **Quiet** (default) | Writers honing their craft who want silence | Exactly today's behavior: a static plume that speaks only when invoked. |
| **Companion** | Anyone who wants a bit of fun | Small one-shot gestures in reply to the author's actions, plus an occasional one-line remark **at a boundary** (see §4). |
| **Mentor** | Younger or newer writers who want structure | Companion, plus habits the author schedules themselves: a session intention, a timed sprint, a gentle end-of-session look back. |

The level is saved as a preference and can be changed at any time from the Ghost menu ("How chatty is Ghost?"). Switching to Quiet takes effect immediately.

## 4. When Ghost may react: boundaries, never pauses

A **boundary** is a moment the author created by doing something other than typing prose. Ghost never reacts to typing, to pauses, or to the content of the manuscript.

| Boundary (author action) | Gesture (Companion and Mentor) | Optional one-line remark |
| --- | --- | --- |
| Opens or reopens a draft | Plume lifts slightly and settles (a nod) | "Back to *Title*." |
| Marks a guide angle as explored | Small ink tick drawn beside the plume | none; the gesture is enough |
| Enters **Focus on manuscript** | Plume dips, like a pen going into an inkwell, and then stays still for the whole session | none |
| Returns to Reflect from Write | Brief glance toward the angles | "Any angle left to try?" (only if some are unmarked) |
| Reaches a word goal **the author set** | An ink underline is drawn under the word count | "300 words. You set that goal and reached it." |
| Ends a Mentor sprint they started | Plume taps once | "Sprint done. Keep going, or take a breath?" |
| Exports or leaves for the Today desk | A small bow | "Saved on this device." (Mentor adds the intention look-back below.) |

**Rules for remarks:**

1. **At most one remark per boundary**, and none if one appeared in the last 10 minutes. Gestures don't count toward this limit.
2. A remark is a **short line beside the plume** in the right margin. It never covers the manuscript, never takes focus, and is announced with `aria-live="polite"`.
3. It **fades by itself** (about 6s) or disappears **the moment the author types**. Typing always wins.
4. Each remark has a tiny **×** and a **"Don't mention this again"** option, remembered per kind.
5. No praise inflation, no streaks, no guilt ("You haven't written in 3 days"). Numbers are only ever true counts from this draft (PRD §8 honesty rule).

## 5. Mentor habits, all set by the author

These help younger or newer writers "stay anchored" **without idle detection**, because every reminder is one the author scheduled.

- **Session intention:** when starting a draft, an optional field: "Today I want to… (describe one moment in detail)". Ghost keeps it under the plume, in quiet text. At the end of the session it asks once: "You wanted to describe one moment in detail. Did it happen?" The author can answer yes, partly or skip. Nothing is graded.
- **Timed sprint:** the author picks 10, 15 or 25 minutes. There's no on-screen countdown (it would loop and pull the eye); only the end of the sprint is marked (§4).
- **Anchor of the day:** one of Ghost's existing anchors (writing habits) is shown as a static line when a session opens, if the author chose "show me an anchor each time".

## 6. Onboarding: the current flow, guided by Ghost

The onboarding copy stays as written in the README. What changes is **who presents it**: Ghost, from its spot in the right margin.

- **First visit:** the plume shows a one-time static label: "New here? Ghost can show you around." No motion and no popup. Ignoring it is fine, and it never comes back after the first session.
- If accepted, the tour has **five stops** that match the README: Today desk, Reflect angles, marking an angle, Focus on manuscript, and inviting a reading. Each stop is a small slip from the plume with a short ink rule pointing to the relevant control. **No dimming overlay and no blocked page**: the author can keep using the app, and the tour simply waits.
- Stops advance when the author **actually does the step** (for example, opening Reflect), not on a timer. "Skip tour" is always available, and "Show me around again" stays in the Ghost menu.
- The tour works at every level, including Quiet, since the author asked for it.

## 7. Author decisions needed (these amend current rules)

1. **"Ghost never speaks first"** (GHOST_INVOCATION.md §1) → proposed: *"Ghost never speaks while you write. In Companion or Mentor, which you opt into, it may react at boundaries you create."* Quiet keeps the original rule.
2. **"The plume never animates"** (§2) → proposed: one-shot gestures in Companion and Mentor only, never idle or looping. Quiet stays static.
3. **"No unsolicited onboarding"** (Reflect guide-marks entry, 2026-11-17) → proposed: the single static first-visit label in §6 is the only exception.
4. **The character's look:** keep the plume as the character (recommended, since it matches the editor's-pen theme), or draw a small plume-with-eyes figure for Companion and Mentor only.
5. **Enchanted Diary:** should the companion appear there too, perhaps as the parchment scroll? This proposal applies to Typewriter only until that's decided.

## 8. Motion: how the two libraries split the work

The split doesn't change: **GSAP is for Ghost; Anime.js is for writing-time** (CLAUDE.md, author decision 2026-11-11). Nothing in this proposal runs while a key is being pressed.

**GSAP (lazy-loaded with Ghost, as today):**
- **Timelines** for each gesture (nod, dip, glance, tap, bow), each 250–500ms, with a little overshoot of about 3% (`back.out(1.2)`, or a `CustomEase` tuned to that).
- **DrawSVGPlugin** for the ink tick and the goal underline, so the ink draws in like a pen stroke.
- **MorphSVGPlugin** (optional) to bend the plume's vane for expressions. It can reuse the generated geometry from `tools/quill-geometry.py`.
- Since GSAP 3.13, all of these plugins ship free in the standard `gsap` package. The project's `gsap@^3.15` already includes them, so there is no new dependency or cost.

**Anime.js (unchanged):** stays the only library for writing-time motion (carriage return, paragraph focus, guide overstrike and recede). The companion adds nothing to it.

**Reduced motion:** every gesture becomes an immediate state change, or nothing; remarks still appear and fade without motion. Every timeline is killed when the author starts typing, matching how `stopWritingScroll()` works today.

## 9. Prototype plan

1. **Author decisions** in §7.
2. **Phase 1:** the level setting (Quiet / Companion / Mentor), the opt-in tour, three boundaries (open draft, mark angle, set word goal), and the remark rules (cooldown, fade on keystroke, don't-mention-again).
   **Validation:** typing never delayed; no remark while typing; screen-reader announcements polite; reduced motion; layouts at 320, 390 and 1440px with the plume still in the right margin; an author comfort session.
3. **Phase 2:** Mentor habits (intention, sprint, anchor of the day) and the remaining boundaries.
4. **Keep** a gesture or remark only if it passes an author comfort check, as with the typewriter motions.
