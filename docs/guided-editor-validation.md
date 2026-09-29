# Guided editor validation — September 29, 2026

## Outcome

The author found the continuously visible quill distracting or tiring and chose
**native text caret while writing; quill only for transitions**. Implemented that
choice. No additional typing effect was introduced. Comfort of the revised
experience remains for author follow-up; technical checks do not prove comfort.

## Method and limits

An automated browser walkthrough typed a fictional support/refund scenario against
“Where should human judgment remain visible in an AI-assisted workflow?” The
walkthrough lasted 159 seconds through the editing checkpoint, produced 305 words
in four paragraphs, switched from guidance to focused writing, revised an earlier
paragraph, returned to the guides, and reloaded. This was not a long human writing
session, nor a claim about the author's professional experience.

## Findings and changes

- The prompt supported a specific scene, a disagreement, an outcome, a workflow
  intervention, and an affected person's perspective. This assesses one prompt,
  not all 60 sets.
- The People guide assumed a wrong recommendation and centered the reviewer.
  Revised the five guides to be shorter and more open: accepted or challenged
  suggestions, differing judgments, consequences, inspection/override, and voice.
- At 1280 × 900, the original guide block occupied 142.5px. At 390 × 844,
  it occupied 247.5px and the first writing line began at 613.3px. Revised copy
  reduced the mobile block to 224.8px and raised writing to 590.5px. Five plain
  bullets remain visible; no collapsible panel, forced steps, or automatic fade.
- Author feedback is the decisive comfort evidence: the prior quill was tiring.
  Removed keystroke, wrap, and idle responses. Preserved only intentional
  transitions and the native caret throughout. Typing interrupts transitions.

## Verification

- All four paragraphs and the earlier-paragraph edit matched expected text;
  reload restored them exactly.
- Revised version: no visible quill frames during typing and a 5.7-second idle
  window; native caret remained enabled.
- Reflection → writing: arriving → hidden. Session exit: stowing → hidden.
  Session entry: lifting → hidden. Reduced motion: hidden throughout.
- Reload persistence also passed after the cursor revision.
- Desktop and mobile screenshots inspected; no horizontal overflow in the
  measured mobile walkthrough. No runtime console errors in the session log.
- Production build and whitespace checks pass.

Artifacts are in `output/playwright/`: `session-desktop-before.png`,
`session-mobile-before.png`, `session-native-mobile.png`,
`session-native-desktop.png`, and `guided-session-evidence/`.

## Follow-up

The author should use the revised native-caret experience for a longer session.
Keep the existing transitions unless that use identifies a specific problem.
Other prompts and broader keyboard/accessibility behavior remain separate checks.
