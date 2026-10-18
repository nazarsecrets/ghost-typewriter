# Ghostwriter: Enchanted Diary Theme Specification

## 1. Product vision and integration mandate

**This is a theme for the existing Ghostwriter writing application, not a new product, standalone diary, or replacement editor.** Ghostwriter remains a focused online writing tool for developing long form articles, responding to ghostwriter prompts, and managing writing sessions and drafts. The Enchanted Diary theme adds a cinematic, tactile presentation inspired by the fictional diary interaction in *Harry Potter and the Chamber of Secrets*, using original assets and copy.

**Nonnegotiable:** Preserve the existing Ghostwriter workflows, editor semantics, writing content, prompt generation, navigation, and persistence. Do not rebuild features already implemented. First inspect the actual codebase and document its component tree, editor technology, state ownership, storage APIs, and theme conventions. Treat all examples below as adaptation patterns, not permission to overwrite the current architecture.

**Design principle:** The page feels alive, but the writer stays in control. The core editor remains a conventional, dependable writing surface underneath the theme.

### Theme scope and behavior

| Feature | Default Ghostwriter behavior | Enchanted Diary theme behavior |
| --- | --- | --- |
| Writing editor | Existing editor and keyboard commands | Same editor, with paper textures, ink typography, subtle responsive motion |
| Ghostwriter prompts | Existing prompts and prompt selection | Prompts can appear as invisible handwriting on the page, without changing their content |
| Long form drafts | Continuous, editable text | Continuous, editable text; **never absorb or delete the article text** |
| Autosave and recovery | Existing persistence | Exactly the same persistence and recovery |
| Ghostwriter assistant | Existing generation or feedback actions | Optional deliberate “Ask the diary” interaction with absorb and reveal animations |
| Draft history and export | Existing features | Retained, readable, accessible through existing controls |
| Theme switching | Existing theme mechanism if present | User can switch to or from Enchanted Diary without losing cursor position, content, or scroll location |

### Implementation boundaries

- Make this theme opt in, not the default unless the existing product requirements explicitly say otherwise.
- No mandatory closed book onboarding before writing; an opening animation may run on first entry and must be skippable.
- Do not turn Ghostwriter into a chat app. The AI dialogue is an optional overlay or deliberate writing aid, never the primary editor.
- Keep article drafts and assistant conversations logically separate, even if both are displayed on paper.
- Preserve existing `window._ghostSession` and `window._ghostDrafts` behavior **if those hooks still exist**. Inspect current code before using them; do not treat window globals as durable storage or replace the actual persistence implementation.
- Support the user's existing editorial or typewriter experience as another theme or mode; do not remove it.

## 1A. Theme activation and acceptance journey

1. User opens Ghostwriter and chooses **Enchanted Diary** from the existing theme picker (or a small theme picker added using current design conventions).
2. The current draft appears intact, with unchanged selection, cursor, formatting, scroll, and autosave behavior.
3. Paper, book framing, handwritten typography, shadows, and subtle ink responses are applied around the actual editor.
4. The user continues writing a long form article normally. Keystrokes are immediate; Enter inserts a paragraph according to existing editor behavior.
5. When the user explicitly requests a Ghostwriter prompt or assistant response, the relevant prompt or response is rendered with disappearing or emerging ink effects in a **separate transient visual layer**. Draft text is never cleared.
6. The user may skip animations, mute sounds, switch themes, close the book, and return to the same draft with no data loss.

## 2. Experience pillars
1. **Ordinary exterior, extraordinary behavior:** Worn black leather journal, understated cover, no magical glow by default.
2. **Material realism:** Paper grain, slight yellowing, page curvature, ink absorption, natural handwriting.
3. **Quiet responsiveness:** Subtle delay before replies; never imply an instant messaging interface.
4. **A private presence:** Replies emerge as if an invisible hand writes them; conversational tone is observant and concise, not manipulative.
5. **Trustworthy function:** Preserve the user's journal and make all magical effects reversible or non-destructive.

## 3. Optional cinematic interaction reference (not the default editing workflow)
### State A: Closed diary
- Center a small, weathered black leather diary on a dim, neutral desk surface.
- Show gentle texture, embossed original initials or no initials, worn corners, spine thickness, and believable shadow.
- On click, tap, Enter, or Space, open the cover with a restrained page-turn animation.

### State B: Blank open page
- Display a two-page spread on wide screens; single page on narrow screens.
- Warm off-white paper, subtle fibers, center gutter, soft shadows, natural margins.
- The existing Ghostwriter editor is mounted as the writing surface; on desktop it may occupy one or both pages depending on readability and draft length. Focus behaves exactly as in the existing editor.
- Show a minimal first-use hint only once: “Write something.” Hide it on focus.

### State C: User writes
- Support keyboard typing, paste, selection, undo/redo, and IME composition.
- Render user input in legible handwriting-inspired type; keep a real semantic editable control underneath or as the source of truth.
- Do not delay actual text input for animation. Characters must appear immediately under the user's control.
- **For ordinary drafting, Enter must preserve the existing editor paragraph behavior.** Only an explicit assistant interaction (for example, “Ask the diary”) may use a separate submit action; never intercept Enter globally.

### State D: Ink absorption
- After submission, hold the handwritten entry for 350–650 ms.
- Over 900–1500 ms, simulate ink soaking into paper: lower stroke opacity unevenly, introduce tiny blur and diffusion, and subtly expand dark pigment edges before they disappear.
- Preserve the entry in storage before beginning the effect.
- Respect reduced motion by replacing the animation with a short crossfade.

### State E: Waiting
- Leave a moment of blank paper (roughly 600–1400 ms, configurable).
- No loading spinner. A faint paper sound or ambient shift may suggest presence if sound is enabled.
- If response generation is slow, provide an accessible non-cinematic status and a discreet retry control rather than an indefinite blank page.

### State F: Invisible reply
- Reveal the response as flowing handwriting, progressively by grapheme or word rather than simply fading an entire paragraph.
- Slightly vary rhythm at punctuation and line endings; do not create illegible or jittering text.
- Use a subtly different ink tone or handwriting style for the diary's voice.
- Maintain a natural line wrap and consistent baseline. Avoid excessive simulated pen jitter.
- Reply remains readable until the next action; never erase it unexpectedly.

### State G: Continue
- Let the user respond directly on the page.
- Provide an unobtrusive way to view earlier exchanges, such as page turning or a journal history panel.
- Restore the exact conversation and display state after refresh.

### Optional State H: Memory scene
- On a deliberate “Show me” interaction, transition from the page into an original illustrated or atmospheric memory scene.
- Use layered depth, dissolving paper texture, and a clear Back to diary action.
- This is a future enhancement, not part of the initial build.

## 4. Visual direction
### Palette
- Leather: near-black charcoal and muted espresso.
- Paper: ivory, pale ochre, faded parchment.
- Ink: soft charcoal for user writing, deep blue-black for diary replies.
- Surroundings: dark warm neutrals, without fantasy neon effects.

### Material and composition
- Prefer high-resolution original textures with CSS gradients for lighting; keep image downloads optimized.
- Cover: edge wear, subtle creases, stitching, and embossing.
- Pages: restrained grain, slight unevenness, center fold shadow, delicate edge darkening.
- Desk: optional soft shadow and ambient vignette; diary remains focal point.
- Typography: legible handwriting font for ink and restrained serif for non-diary controls. Verify font licensing and support fallback fonts.

### Motion language
- Physical and organic, not bouncy or playful.
- Page opening: 700–1100 ms with realistic perspective and easing.
- Ink absorption: 900–1500 ms, uneven diffusion.
- Response writing: adaptive to text length, usually 2–6 seconds; allow Skip animation.
- No animated background distractions.

## 5. Functional behavior
- Keyboard first, touch friendly, responsive desktop/mobile layouts.
- Draft autosaves while typing; committed entries and replies persist across reloads.
- Journal history is accessible and searchable, but hidden from the immersive default view.
- Include export as plain text or Markdown and delete/reset with confirmation.
- Provide sound toggle, reduced-motion support, and an accessible plain-text mode.
- User text must never be discarded when the response fails or the page is closed.
- A failed request should preserve the entry and allow retry without duplicating it.

## 6. Conversation intelligence
### Response persona
The diary is curious, thoughtful, concise, and a little mysterious. It asks relevant questions and references earlier journal entries when helpful. It must not claim to be sentient, exert pressure, encourage dependency, or imitate the original character's harmful behavior.

### Context strategy
- Keep a chronological record of turns with timestamps and IDs.
- Send recent turns plus a compact, user-editable summary of earlier context to the model.
- Distinguish the user's private journal content from the system's behavioral instructions.
- Never present invented memories as facts.
- Clearly disclose whether entries are processed by a third-party AI provider.

### Suggested response contract
```json
{
  "reply": "A brief, natural diary response.",
  "tone": "curious",
  "followUpQuestion": null
}
```
The UI renders `reply` as handwriting; metadata remains hidden. Validate model output server-side.

## 7. Recommended implementation
### Stack
- **Reuse the project’s existing framework, bundler, editor, styling, and state management.** React + TypeScript is an example only if it matches the codebase.
- CSS transforms and perspective for the book; CSS layers for textures.
- Anime.js for controlled sequences, page movement, and reveal timing.
- Canvas 2D or SVG masks for ink diffusion if CSS-only effects look artificial.
- **Reuse Ghostwriter’s current draft persistence and recovery.** Do not add IndexedDB or migrate storage solely for the theme.
- Optional server endpoint for AI responses; never expose an API key in browser code.

### Animation JavaScript libraries and selection guide

**Recommended approach:** Use **Anime.js as the primary animation orchestrator**, native CSS for simple material effects, and add specialized libraries only when a specific visual requirement cannot be achieved convincingly. Avoid combining multiple general-purpose timeline engines.

| Library | Best use in this diary | Priority | Implementation guidance |
| --- | --- | --- | --- |
| **Anime.js** | Cover opening, page movement, ink absorption timing, invisible reply sequencing, staggered strokes | **Core** | One central timeline per interaction state; cancel or complete timelines on navigation and reduced motion. |
| **Three.js** | Optional dimensional book cover, realistic curved pages, lighting and depth | Optional, advanced | Introduce only if CSS `perspective` and transforms cannot produce the desired realism; consider performance on mobile. |
| **PixiJS** | GPU accelerated ink diffusion, irregular masking, pigment spreading across paper | Optional, advanced | Use as a dedicated visual overlay; keep editable text in DOM, never inside a canvas. |
| **GSAP** | Alternative for complex chained motion and advanced timeline controls | Alternative to Anime.js | Choose **either** GSAP **or** Anime.js for orchestration, not both by default. Check licensing for any optional plugins. |
| **Motion for React** (`motion`) | Component entrance/exit and React layout transitions, preferences/history panels | Optional | Useful for surrounding UI, but avoid a second animation engine for the diary's core cinematic sequence. |
| **Rive** | Author controlled interactive book or flourish animations as reusable assets | Optional | Best when animations are authored visually; requires asset authoring and adds runtime weight. |
| **Howler.js** | Page rustle, nib scratching, faint ambient sounds | Optional audio | Not a visual animation library; synchronize cues with Anime.js events and honor mute preferences. |

#### Recommended combinations

- **Lean MVP:** Anime.js + CSS transforms/gradients + native Web Animations API where appropriate. No extra rendering library.
- **Enhanced ink realism:** Anime.js + PixiJS for the pigment layer only.
- **Cinematic dimensional book:** Anime.js + Three.js for the book scene, retaining DOM based editing and text.
- **Sound rich version:** Add Howler.js after the visual interaction is stable.

#### Effect to tool mapping

| Effect | Preferred technique |
| --- | --- |
| Leather cover opens | CSS 3D perspective/transforms orchestrated by Anime.js |
| Page turns and settles | CSS transforms, shadows, and Anime.js easing; Three.js only for complex curvature |
| User ink sinks into paper | Anime.js timing + CSS/SVG mask; PixiJS for high fidelity diffusion |
| Diary's reply writes itself | DOM text with `Intl.Segmenter` + Anime.js staggered reveal; SVG stroke animation for authored lettering only |
| Paper breathing / ambient light | Very subtle CSS animation or static layered gradients |
| Memory scene transition | Anime.js layered opacity and perspective; Three.js only if genuine 3D navigation is required |
| Page rustle and ink sound | Howler.js event cues, muted by default |

#### Integration rules

1. The **DOM text editor remains the source of truth**. Visual layers are disposable effects, never storage.
2. Centralize motion duration, easing, delays, and cancellation in a `motionTokens.ts` module.
3. Use an `AnimationController` adapter so effects can be swapped without changing conversation logic.
4. Clean up timelines, canvas resources, and event listeners on component unmount or state changes.
5. Honor `prefers-reduced-motion` and expose Skip animation for longer sequences.
6. Lazy load Three.js, PixiJS, Rive, and audio only when their features are enabled.
7. Check current package APIs, versions, bundle sizes, and licenses before installation; avoid adding libraries merely for visual novelty.

### Suggested additive component architecture (adapt to actual codebase)
```text
Existing Ghostwriter App
├── Existing Editor / Prompt System / Draft Management / Autosave  [UNCHANGED]
├── Existing Theme Provider or Theme Selector
│   └── EnchantedDiaryTheme
│       ├── DiaryFrame / PaperSurface                    [presentation only]
│       ├── ExistingEditorSlot                          [original editor instance]
│       ├── InkVisualOverlay                            [pointer-events: none]
│       ├── PromptRevealLayer                           [presentation only]
│       └── OptionalBookOpenTransition                  [skippable]
└── Existing Assistant Actions
    └── OptionalDiaryReplyPresentation                  [existing response data]
```
**Do not duplicate the editor, autosave logic, prompt service, history drawer, or conversation service.**

### Visual effects state machine (separate from editor state)
```text
idle -> optionalOpening -> idle
idle -> promptRevealing -> idle
idle -> assistantInkAbsorbing -> assistantWaiting -> assistantReplyRevealing -> idle
any animation -> skipped/cancelled -> idle
```
The existing editor remains editable throughout except during an explicitly scoped modal interaction. Visual state must never become the source of truth for writing content.

Use explicit states and transition guards. Prevent double submission. If a new interaction occurs during animation, finish or cancel the visual effect safely without losing persisted data.

### Storage and compatibility
- Do not introduce a new draft schema or overwrite current saved drafts for a visual theme.
- Store only theme preferences using the existing settings mechanism (for example, `themeId: "enchanted-diary"`, reduced motion and sound preferences).
- If the codebase exposes `window._ghostSession` or `window._ghostDrafts`, preserve their behavior and ensure theme toggling does not reset them.
- Keep any assistant conversation state separate from article draft content and follow existing privacy controls.

### Theme design tokens
Define scoped variables or equivalent tokens without changing global editor styles:

```css
[data-theme="enchanted-diary"] {
  --diary-paper: #efe4c9;
  --diary-ink: #30271f;
  --diary-leather: #211b19;
  --diary-paper-shadow: rgba(43, 30, 19, 0.16);
  --diary-motion-scale: 1;
}
```
Use original, optimized textures and legible handwriting-inspired fonts. Provide a readable fallback font and adequate contrast. Paper grain must not reduce legibility or interfere with text selection.

## 8. Animation implementation notes
### Ink absorption
1. Measure the rendered writing bounds.
2. Capture a visual-only duplicate of the ink layer while preserving original text in state/storage.
3. Animate masked opacity with subtle edge blur and diffusion; use a seeded noise mask for irregular absorption.
4. Remove only the visual duplicate after animation completes.
5. Keep a hidden accessible transcript available throughout.

### Invisible handwriting
1. Segment reply using `Intl.Segmenter` for grapheme-safe reveal.
2. Layout full reply before animation to prevent reflow.
3. Reveal text progressively with a clipping/masking layer or per-grapheme opacity.
4. Pause modestly at punctuation.
5. Allow interruption and instant completion.

### Performance
- Prefer transform/opacity for routine motion.
- Limit blur and filters to small overlays; avoid large continuously repainted canvases.
- Preload only essential assets; test low-power devices.
- Aim for smooth 60 fps on typical modern hardware, with graceful fallback.

## 9. Accessibility and usability
- Fully operable with keyboard and screen reader.
- Respect `prefers-reduced-motion`.
- Provide an explicit text-only transcript and a Skip animation action.
- Maintain readable contrast and scalable text.
- Announce completed diary responses via a polite live region, not every animated character.
- Keep focus stable during visual transitions.
- Preserve native text editing behavior and selection.

## 10. Privacy and safety
- Default to local-first storage.
- Obtain explicit user consent before sending journal text to an AI provider.
- Offer deletion, export, and clear indication of network processing.
- Never embed API credentials client-side.
- Sanitize displayed content; do not render untrusted HTML from model output.
- Make it clear this is a fictional diary experience, not an actual supernatural entity.

## 11. Build phases
### Phase 1: Safe theme integration
- Closed diary, open spread, editable page, Enter-to-submit.
- Mock diary replies, persistence, basic fade absorption and progressive reveal.
- Responsive layout and keyboard accessibility.

### Phase 2: Material realism and optional ink effects
- Refine leather and paper textures, shadows, perspective, page turn, and ink diffusion.
- Tune timing and type rhythm using visual comparison and user testing.

### Phase 3: Existing assistant presentation
- Add secure AI endpoint, contextual replies, failure handling, and user consent.
- Keep a fully functional offline/mock mode.

### Phase 4: Optional cinematic enhancements
- Page history, search, optional sounds, original memory scenes, export, and personalization.

## 12. Acceptance criteria for integration
- Theme appears in Ghostwriter’s existing theme selection and can be disabled at any time.
- All existing writing, prompt, editing, draft management, and export functionality still works.
- Drafts are byte-for-byte preserved when changing themes; undo/redo, selection, keyboard shortcuts, and cursor position are retained wherever the existing editor supports them.
- Enter creates a normal paragraph in the writing editor, not a diary message submission.
- Typing remains responsive; theme animation never blocks input or autosave.
- Ink absorption is restricted to deliberate assistant or prompt interactions and never destroys article text.
- Reload and autosave recovery behave exactly as before. Existing `_ghostSession` and `_ghostDrafts` hooks are not broken if present.
- Reduced motion, keyboard use, screen readers, mobile layouts, and skip animation are supported.
- Advanced animation libraries are lazy loaded, optional, and do not cause editor remounts or layout shifts.
- No additional AI service or paid API is introduced without explicit approval.

## 13. Ready to use vibe coding instruction

> **Task:** Add an opt in **Enchanted Diary** theme to the **existing Ghostwriter project**. Do not build a standalone diary or replace the existing focused writing experience. First inspect the repository and identify the current editor, themes, prompt workflow, session and draft state, autosave and storage, and animation setup. Preserve all existing behaviors, including `window._ghostSession` and `window._ghostDrafts` if still used. Implement the theme as a scoped visual layer around the existing editor, using original worn leather and paper textures, readable handwritten typography, and restrained page and ink effects. Use the current project stack. Prefer Anime.js if already installed or appropriate; use CSS and SVG masks first, with PixiJS only for demonstrably better ink diffusion. Do not add GSAP alongside Anime.js. Keep draft content persistent and editable at all times. Only use disappearing ink for deliberately invoked Ghostwriter prompts or assistant replies, never for ordinary article text. Make the opening sequence optional and skippable. Respect reduced motion, accessibility, mobile performance, and existing theme controls. Implement in small phases, test existing writing and autosave workflows after each phase, and report modified files and any tradeoffs. Do not migrate data or add a paid AI integration without asking.

## 14. Suggested build sequence and regression tests

| Phase | Implement | Verify before proceeding |
| --- | --- | --- |
| 0. Audit | Inspect repository and existing writing flows | Document actual integration points; no code changes |
| 1. Theme shell | Add theme registration, scoped tokens, paper and leather visuals | Switch themes without remounting editor or losing draft |
| 2. Writing feel | Typography, subtle ink feedback, paper depth | Typing, paste, IME, undo, selection, Enter, autosave |
| 3. Prompt reveal | Animate existing prompt text on visual overlay | Prompt remains accessible and skippable |
| 4. Assistant reveal | Animate existing assistant response with ink effects | No draft mutation, errors recover safely |
| 5. Polish | Optional page turn, sound, advanced rendering | Performance, reduced motion, mobile, screen reader |

**Regression scenarios:** Write 1,000 words; toggle themes mid paragraph; refresh while autosave is pending; paste formatted text; use undo and redo; navigate between drafts; request a prompt; cancel animation; use keyboard only; enable reduced motion; use narrow mobile layout. The theme must not cause content loss in any scenario.
