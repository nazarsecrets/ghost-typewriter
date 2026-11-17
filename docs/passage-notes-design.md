# Passage-anchored Ghost notes

Design proposal · 2026-11-17 · Implementation has not started.

## Experience

An author selects a passage, asks Ghost for a reading, then chooses **Keep as margin note** on the resulting slip. The note remembers the selected passage and the reading it prompted. Writing remains immediate and authoritative. Nothing is inserted into the manuscript, and no new request runs while the author edits.

Start with one note per explicitly selected passage and one open note at a time. Categories are **Idea, Clarity, Voice, Evidence, Structure**; they describe a note, not a score. The author chooses the category when keeping it. Do not infer a category from today's five lens labels, which are different concepts.

The current slip remains available. Whole-draft readings and unquoted questions stay in the slip; they do not receive invented passage anchors. V1 selection stays within one paragraph, matching the textarea editor's current selection capability. Cross-paragraph annotation is deferred.

## Attach a note

1. Select nonempty manuscript text, then invoke Ghost. Capture the selection before the control takes focus: draft ID, stable paragraph ID, UTF-16 start/end offsets, exact selected text, surrounding context, and request revision.
2. Run the existing passage lens with existing per-draft consent and cancellation. Only its existing payload goes to the provider; anchor metadata stays local.
3. The slip offers **Keep as margin note** only for a successful passage reading. Keep the reading, exact original quote, chosen category, and source revision together. Cap note text to the existing validated slip budget; show its main question and reason first, with the full reading available on expansion.
4. If the draft changed during inference, map the captured range through the intervening edits before offering to keep it. If mapping cannot establish a surviving range, offer **Choose passage to attach** instead. Never match a duplicate quote by its first occurrence.
5. The saved note opens in the margin. **Close note** returns the captured caret/selection without scrolling the author to a new place. No autosuggested annotations or marks in Guided Reflect.

Keeping and opening notes are local actions, including when reading is off. **Read this passage again** is a separate explicit provider request, requires reading on, and replaces a note's reading only after successful validation. Failures retain the previous note.

## How attachment survives editing

Persist a stable ID for every paragraph before implementing notes. Existing `string[]` paragraphs and index keys are insufficient. Preserve manuscript text, export serialization, old sessions, and draft recovery during that additive migration. The current IDs and note arrays must save together with the draft.

Each note stores an anchor and its original evidence separately:

```text
note: id, draftId, category, reading, createdAt, readingRevision,
      originalQuote, status(open/resolved), anchor
anchor: paragraphId, start, end, currentQuote, prefix, suffix,
        state(attached/changed/detached)
```

The offsets use the same UTF-16 units as textarea selection APIs. Do not normalize whitespace or punctuation when updating live offsets. Prefix/suffix are bounded recovery evidence, not text sent to the provider. No manuscript snapshots or keystroke history need to accumulate beyond the reading's existing source snapshot and anchor evidence.

| Edit | Attachment behavior |
| --- | --- |
| Insert/delete before a range | Shift offsets by the edit delta; keep the note attached. |
| Insert exactly at start or end | Treat boundary text as outside the passage; shift the start for insertion at start, retain the end for insertion at end. |
| Insert strictly inside, or replace part of the range | Map surviving endpoints, include interior replacement, mark **Passage changed**. |
| Delete/replace the whole range | Detach. Keep the original quote and note under **Passage removed**. |
| Split a paragraph outside the range | Keep the original ID for the left paragraph, allocate a right ID, and move the note with its text. |
| Split within a range | Represent the anchor as ordered fragments across the two paragraph IDs. Mark changed. Selection creation remains single-paragraph in V1, but an existing note may span a split. |
| Merge paragraphs | Map fragments into the surviving left paragraph using the exact join offset; preserve note identity. |
| Delete a paragraph | Detach its affected fragments; if any referenced text is lost, mark changed or detached rather than silently claiming the original passage survives. |
| Cut and paste elsewhere | Detach on cut. Offer manual reattachment; do not automatically follow a similar quote. |
| Undo/redo | Apply the same edit mapping or restore the matching anchor state from the same transaction; never independently guess from paragraph index. |
| Reload or legacy recovery | Restore IDs and anchors together. Validate bounds and exact current quote. If corrupt or ambiguous, retain a detached note. |

Implementation needs fragment support in the anchor record (`segments: [{paragraphId,start,end}]`) even though the compact example above shows the common one-segment case. Anchors must be transformed in the same state transaction as paragraph updates, Enter, Backspace/Delete merges, paste, and IME commits. Ambiguous multi-edit diffs fail to a detached state. Typing never waits for DOM measurements or a provider.

A changed passage keeps its mapped attachment, but the old reading is visibly labeled **Written for an earlier version**. This label remains until a successful explicit reread; restoring matching words alone must not imply fresh editorial validation. Detached notes are listed in Ghost under **Passages to reattach**, without a floating marker on unrelated prose. Select text and choose **Attach here**, or resolve/delete the note. Reattachment preserves the original quote and earlier-version label until reread.

## Wide layout

Use a right gutter only when there is room for the existing manuscript measure, a 24px gap, and a 280px note without horizontal overflow. Determine this from available container width, not device names. Never squeeze or recenter the manuscript to make room.

A small numbered button sits beside the anchored passage's first line. It has a category label for assistive technology and a minimum 44px interaction target. The number is local reading order, not persistent identity or priority. Resolved notes leave this list and remain accessible from Ghost.

The active note aligns with its passage where possible, clamped below the header and above the dormant Ghost control. If several notes overlap, show their markers and one open note with Previous/Next controls; do not stack cards over prose or shove them down the page. A short rule indicates the active connection. When its passage scrolls away, replace the connection with **Passage above/below · Show passage**; do not draw a misleading connector to the viewport edge.

Only an open note highlights its current passage. Keep original text color and selection readability. With textareas, use a noninteractive mirror overlay for the highlight; this must follow font metrics, wrapping, internal textarea scroll, zoom, and the existing manuscript transforms. Hide a stale overlay during measurement rather than displaying it on the wrong words. The native caret and textarea remain the editing surface.

## Narrow layout

Keep a slim marker rail outside the text, with one marker per anchored paragraph and a count when several notes share it. Never shrink the text column to accommodate a card. Reuse existing gutter space where it fits; if a 44px target cannot fit outside prose at 320px or zoom, expose **Notes (n)** in Document actions instead of overlaying a button on text.

Selecting a marker opens a bottom sheet containing the category, original quote, current attachment status, and reading. It uses the existing Ghost sheet behavior: manuscript scroll area above, note scroll area below, no prose hidden under the sheet. Default height is bounded to about 40% of the visual viewport; respond to keyboard/visual-viewport changes. On short viewports, open the note in a dedicated dialog with the quoted passage, and provide **Return to passage**. Do not leave an unusably small manuscript strip.

Use the same one-note content and actions as desktop. Opening a note must not summon the keyboard. Escape/Close restores focus to its marker or invoking control; **Return to passage** explicitly restores the editor range. Clicking a visible paragraph closes the note and lets that click place the caret. No drag-only controls or hover-only discovery.

## States and actions

- Attached: category, quote preview, question/reason; **Show passage**, **Read again**, **Resolve**, **Delete**.
- Changed: earlier-version label and original quote; **Show current passage**, **Read again**, **Reattach**, **Resolve**.
- Detached: **Passage removed** and original quote; **Attach to selection**, **Resolve**, **Delete**. No misleading margin position.
- Resolved: no margin marker; available in Ghost's resolved list with **Reopen**. No celebration or progress percentage.
- Delete: offer local Undo; delete only the note. Never delete its passage.
- Loading/error/offline/reading-off: retain note and anchor, use existing non-destructive feedback, and offer reread only when available.

## Accessibility and motion

Markers are buttons with names such as “Evidence note 2 on ‘We measured clicks’.” Active state is exposed through expanded/controls relationships; no reliance on color alone. Notes follow a predictable keyboard order after document actions; Tab must not traverse an overlay per character. Use dialog semantics only for the modal narrow fallback, with focus containment; the wide margin is a labeled complementary region.

Keep input instant. Use existing Ghost GSAP only for deliberate note opening/closing under its established exception, no idle motion or per-keystroke connector animation. Reduced motion makes changes immediate. Forced colors use system outlines and visible text labels. Text exports remain clean manuscript content; a notes export is outside V1 scope.

## Implementation sequence and acceptance

1. Prove stable paragraph IDs and edit transactions while preserving old drafts, exports, Enter/merge behavior, native undo, IME, and the writing anchor.
2. Add persisted local anchor records and deterministic mapping. Test duplicate quotes, emoji offsets, boundary insertions, replacements, splits/merges, deleted text, undo/redo, reload, and edits during a pending reading.
3. Add explicit Keep, category choice, reread, resolve and reattach actions without changing today's provider response schema. Do not synthesize missing evidence.
4. Add measured wide markers/highlights, then narrow sheet/toolbar fallback. Verify 320px, 390px, 768px, wide desktop, 200%/400% zoom, keyboard opening, forced colors, reduced motion, and soft keyboard.
5. Verify no caret displacement from note creation or updates; no stale highlight on unrelated prose; no new network calls from typing, keeping, resolving, opening, or reattaching. Failed reads preserve notes. Reread uses the newly mapped passage only after explicit invocation.

Author review should assess whether the rail and one-note presentation preserve writing comfort. This document is a reviewable proposal, not a validated implementation or a claim of research findings. Stable-ID migration, native undo mapping, and textarea highlight geometry are the main engineering risks to resolve in a prototype.
