# Enchanted Diary — two-phase theme plan

_Planned: 2026-10-17 · Status: planning complete; implementation not started_

## Goal and boundaries

Offer **Typewriter (current default)** and **Enchanted Diary** as switchable appearances of the same Ghostwriter. Preserve all information, writing workflows, storage, drafts, prompts, notes, review, and exports. Switching appearance must not create a draft, submit text, trigger AI, or reset the writing session.

This plan adapts [enchanted_diary_spec.md](./enchanted_diary_spec.md). Its §§11 and 14 are superseded for this work by the two phases below. In particular, §11's Enter-to-submit, mock replies, new persistence, AI endpoint, history search, and memory scenes are outside this theme scope. Enter keeps its current paragraph behavior. Existing feature gaps are not silently expanded into theme work.

## Verified integration points

- `ghostwriter.tsx`: one app owns Today, Reflect, Write, and Review; Reflect and Write use the existing `ParagraphEditor` textareas and shared manuscript state. Theme changes must keep the current view and editor DOM nodes mounted, with stable keys and ancestry.
- Session storage: `svr-ghostwriter-session`, version 1; drafts: `svr-ghostwriter-drafts`, version 1. The 700ms autosave also flushes on visibility/page lifecycle events. Preserve serializers, records, IDs, timestamps, ordering, deletion protection, error feedback, and recovery behavior.
- Settings precedent: `svr-ghostwriter-sound` is separate from content. No existing theme picker/provider was found. `_ghostSession` and `_ghostDrafts` are not used in the current app; do not introduce them.
- `src/styles.css`: existing palette variables, manuscript surface, responsive styles, header, drafts drawer, and export controls. Root/background colors and some literal colors need careful scoping; changing only an inner paper color is insufficient.
- `src/motion.ts`: existing Anime.js behaviors, 30% writing anchor, and paragraph quieting. Extend this module instead of adding a competing motion-token module or animation engine.
- Topic selection currently opens guided Reflect; blank writing opens Write. Preserve both routes, guide copy, provenance, source links, and the distinction between live sources and Evergreen.
- Review uses the existing configured API path. The theme must not change request bodies, response content, availability, or failure behavior.

## Phase 1 — dependable, switchable diary appearance

**Outcome:** a complete static diary theme that can be used for real writing before cinematic effects exist.

1. Add a small accessible Appearance selector to the existing header, available across views: Typewriter / Enchanted Diary. Keep Typewriter as the default. Store only the preference under a separate versioned key, proposed `svr-ghostwriter-theme`; invalid or unavailable storage falls back safely, and preference-save failures do not masquerade as failed draft saves.
2. Apply a theme attribute to a stable existing root. Do not branch between separate editor trees, key the app by theme, or move the editor into a conditional wrapper. Theme state stays outside `Session`, `Draft`, and autosave dependencies; changing appearance alone must not write session/draft records or reorder Recent drafts.
3. Add scoped diary styling: charcoal/espresso surroundings, ivory paper, blue-black ink, restrained leather edging, and static book depth. Carry the palette through Today, guides, Review, draft dialog, exports, alerts, and focus states while preserving their information and actions.
4. Keep a continuous manuscript with the current readable measure and native caret. A desktop gutter or facing-page suggestion is decorative: no columns that split textareas, pagination, or duplicate editors. Use a single page on phones. Start with the current readable serif; trial a handwriting-inspired face only if readability and layout continuity pass.
5. Preserve selection and insertion position when opening/closing the selector, with predictable keyboard focus return. Preserve the visible reading position across styling changes. Re-measure existing textareas after theme/font changes so wrapping never clips content; do not synthesize text changes or reset the undo history. Test IME composition and defer any disruptive visual update until composition ends.
6. The author adopted static Typewriter paper grain on 2026-10-18, superseding its earlier no-texture restriction. Diary materials remain scoped to Diary. Do not re-enable the rejected animated quill. Keep the sound toggle Typewriter-only: switching to Diary mutes active sources and skips audio loading/playback; switching back restores the saved Typewriter preference without changing content.

**Likely files:** `ghostwriter.tsx`, `src/styles.css`, a small theme preference helper if useful, and canonical guidance clarifications that distinguish default Typewriter from opt-in Diary. No data migration or dependency installation.

**Exit gate:** production build plus browser regression checks on both themes. Use existing populated storage fixtures and a 1,000-word manuscript. Toggle repeatedly mid-paragraph and during a pending save; compare content, IDs, notes, selected topic, review, and exports. With saving settled, compare raw session/draft values before and after a theme-only toggle, including timestamps and ordering. Verify editor node identity, selection, caret, scroll continuity, typing, Enter/split, merges, paste, undo/redo to the existing editor's baseline, IME, reload, draft reopen, delete/cancel, and storage-error export recovery. Verify keyboard focus, screen reader labels, contrast including quiet paragraphs, zoom, reduced motion, and 320px/390px layouts. Any existing baseline limitation is documented separately rather than claimed solved.

## Phase 2 — restrained diary materials and ink presentation

**Entry condition:** Phase 1's preservation checks pass.

**Outcome:** diary character deepens around the same dependable editor.

1. Refine static cover edges, fold shadow, paper tone, and ink typography using CSS first. Trial optimized original textures only within the diary theme after documenting the scoped exception; provide a plain-paper/readable fallback. Assets never become required for editing. The earlier Typewriter no-texture restriction was superseded by the author on 2026-10-18.
2. Add an optional, skippable book-opening or page-settle effect to decorative layers. Ordinary navigation lands directly on usable writing; a closed cover never gates access. Keep routine motion below approximately 600ms in line with current project guidance, rather than adopting the spec's long cinematic timings wholesale.
3. Reveal existing prompt text or a completed existing Review response through a transient, non-interactive visual layer. Preserve the full semantic text and reserved layout underneath; hide visual duplicates from assistive technology. Reveal by grapheme/word without changing stored strings or triggering new requests. Skip shows the full text immediately; reduced motion shows it immediately as well. Announce a completed response once rather than character by character.
4. If absorption adds value, restrict it to a disposable visual copy of deliberately invoked prompt/review material. Never fade or absorb manuscript text, title, reflection answers, or stored review content. No artificial blank waiting period; existing loading/error/retry controls remain readable.
5. Cancel and clean up effects on typing, Skip, navigation, theme change, reduced-motion changes, or unmount. Effects have separate transient state; they never control autosave, draft selection, editor focus, or API requests. Preserve the saved Typewriter sound preference, but do not show its toggle, prepare its audio, or play its samples in Diary. Mute/cancel active sounds when leaving Typewriter; do not introduce diary audio assets.

**Likely files:** `src/styles.css`, `src/motion.ts`, narrowly scoped presentation components if needed, `ghostwriter.tsx` wiring, and optional optimized local assets. Use Anime.js + CSS/SVG only. Three.js, PixiJS, GSAP, Rive, Howler, a new AI service, conversation memory, searchable history, and memory scenes remain outside these phases.

**Exit gate:** repeat Phase 1's data and editing checks with effects active. Test Skip/cancel and theme toggling at each effect stage, rapid repeated actions, unavailable Review, request failure, offline writing, long replies, and reload. Check that no extra API call occurs, no visual duplicate is announced, and no effect blocks input, selection, export, or recovery. Compare performance and console output with Typewriter on desktop and narrow mobile layouts. A real author session determines which typography/material/motion choices remain; automated checks establish preservation, not comfort.

## Delivery and status

Deliver Phase 1 independently; Phase 2 is enhancement rather than a prerequisite for writing. Report modified paths, completed checks, baseline limitations, and remaining author judgments after each phase, then update `TRACKER.md` as the final project-state edit. This document records planned acceptance gates; none have been executed as theme validation yet.
