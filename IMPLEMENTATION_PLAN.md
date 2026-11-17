# SVR Ghostwriter V1

> **Guidance clarification (September 28):** Memory, Tension, Outcome, System, and People are passive, prompt-specific bullet guides for the main prompt, not separate questions or steps. Guide copy is selected by the exact provocation (or stable Evergreen ID), with separate authored sets for all current prompts; topic changes and restored drafts derive guides from their selected topic. One continuous manuscript sits beneath them and is shared with the focused writing view. Earlier reflection notes remain recoverable. This supersedes the step-based guided-editor description below.

The canonical product requirements are defined in [PRD.md](./PRD.md). This file tracks the implementation direction and current build state.

## Why this exists

Ghostwriter is an intentional writing environment with an optional AI collaborator for keeping my voice as a designer alive on Medium. Its job is to remove the two frictions that stop me from publishing: not knowing *what* to write about, and losing momentum *while* writing. It solves the first by surfacing relevant, current UX/product material from the World, and the second by giving Me a calm, immersive space where the act of writing feels physical and continuous — like a typewriter, but softer and more alive. Ghost suggests only when intentionally invoked; it never becomes the author.

The mental model is: **a typewriter that keeps a designer intellectually curious.**

The intent is deliberately small: a tool for one author, hosted for free, lightweight, and easy to maintain. It should never become a heavy app. Every feature earns its place by protecting focus.

## The immersive typewriter experience

The distinctive feeling I'm after is a **modern, immersive typewriter** — the steadiness and rhythm of a typewriter without its rigidity. This is the emotional core, and motion is how we achieve it.

**Anime.js** is the primary tool for this. It's tiny (~tens of KB) and has no runtime dependencies. It drives the six named transition and paragraph behaviors, plus `paperImpulse` and `carriageReturn`. The Plume component remains in the repository but is unwired; the native caret is the only cursor. The signature move is the **fixed writing line**: the line being written stays anchored near 30% of the viewport while the page scrolls underneath, so the thought I'm writing stays physically still — the closest digital analog to paper feeding through a carriage.

Ways to deepen the immersion, all free and lightweight:

- **Anime.js (in use)** — word-by-word reveals, paragraph focus/quiet transitions, carriage-style scroll anchoring. Keep motion under ~600ms and always gate it behind `prefers-reduced-motion`.
- **Typewriter response (in use)** — Anime.js moves the active line 0.8–1.8px across with a small impact; erase reverses direction and sustained typing reduces the pulse. Return moves the sheet 8px and deepens its shadow before settling, alongside the recorded carriage cue. Input is immediate, and reduced motion disables all of this movement. The author still needs to assess long-session comfort.
- **The Plume (muted)** — `src/PlumeCursor.tsx` and its caret measurement remain in the tree, but the component is not rendered. The native caret is used in every view.
- **CSS-only touches** — subtle paper grain via the existing palette, a monospaced *option* for the manuscript for a truer typewriter register, and `@keyframes` for ambient details that don't need JS.
- **Web Audio API (in use, opt-in)** — short recorded strike samples and a separate carriage cue on Enter, adapted from the author-linked Pixabay recordings. The fixed-header toggle starts muted and remembers the preference. The author approved authenticity and comfort on 2026-10-18, retained the motions for now, and requested static paper grain. The carriage cue accompanies actual paragraph creation. Sound and its toggle remain specific to Typewriter, excluded from the planned Enchanted Diary theme.
- **View Transitions API** — native, zero-KB crossfades between the today → reflect → write → review modes, complementing Anime.js for the larger scene changes.

The rule: motion serves stillness. The AI and the interface can move; the writing should feel calm and anchored.

## Hosting: free, on GitHub, easy to maintain

The target is **GitHub Pages** — free, zero-maintenance static hosting straight from the repo. Provider-independent topic discovery is compatible with static hosting through `public/topics.json` and the local Evergreen fallback. Only optional personalized Reflect and Ghost review calls require an AI production path; Pages cannot hold their secret key or proxy those requests. The local Vite dev proxy does not deploy.

The selected production path is GitHub Pages plus the Cloudflare Workers AI binding, with no provider credential in the browser. The fixed model and server-owned instructions return validated editorial slips from `/read`; the Worker restricts origins and request size and has an approximate rate-limit binding. `server/ghost/README.md` documents deployment. Discovery remains provider-independent. The older Anthropic/BYO-key proposal is superseded.

## Product principle

The AI can move; the writing should feel still. Writing remains the product's center, while reflection and review are temporary modes around the manuscript.

There are three actors:

- **World** supplies credible things worth noticing.
- **Me** thinks, writes, argues, and decides.
- **Ghost** questions, challenges, connects, and refines only when invited.

Never let Ghost take over Me. There is no permanent AI panel, unsolicited inline completion, or automatic replacement of raw prose. Writing itself is the reward; no streaks, XP, or productivity theatre are added.

## Current guided-editor update — September 28, 2026

The author chose a guided flow with compact questions and a larger response surface. Topic selection keeps this guided entry; the manuscript is available at any step. Notes can be moved into prose explicitly. Stable draft IDs, local autosave, storage-error feedback, and export now work independently of AI review. Mode/tone controls remain on Review, outside the manuscript.

## Interaction model

1. **Discover** — load an editorial desk of current or Evergreen UX/product ideas.
2. **Choose** — one idea carries onto the paper while the rest retreat.
3. **Write** — enter a borderless manuscript directly; guided pre-writing reflection remains optional.
4. **Reflect** — reread and decide what the draft is actually saying.
5. **Ghost** — intentionally invoke argument, depth, evidence, voice, or structure lenses.
6. **Refine and draft** — preserve the raw manuscript, make author-controlled changes, then export.

## V1 build sequence

- [x] Add a runnable Vite + React + TypeScript shell.
- [x] Replace window-only session variables with versioned localStorage records and real debounced writes.
- [x] Convert reflection cards into sequential prompts with response capture and trail navigation.
- [x] Build a paragraph-based manuscript editor with title, word count, focus anchoring, and quiet paragraph states.
- [x] Define six foundational Anime.js behaviors plus `paperImpulse` and `carriageReturn` for typewriter response.
- [x] Separate manuscript and editorial review modes.
- [x] Build the free source-backed topic pipeline, scheduled manifest, client loader, and honest Evergreen fallback.
- [x] Connect the topic loader to Today, add honest provenance and desk rotation, and remove the Claude topic request.
- [x] Add the deterministic source → signal → provocation layer: original lens-based questions lead, neutral Why now context explains currency, and source headlines remain provenance only.
- [x] Connect production Ghost readings through Cloudflare Workers AI and deploy the static app with GitHub Pages Actions.
- [x] Run browser-level rendering, manuscript entry, autosave, reload persistence, and console QA.

## Visual system

- **Paper** `#F3F5F2` — cool, low-glare canvas.
- **Sheet** `#FAFBF8` — manuscript surface.
- **Ink** `#20231F` — primary writing color.
- **Graphite** `#6E746C` — utility copy and quiet paragraphs.
- **Rule** `#D9DDD6` — structural dividers.
- **Signal** `#315B49` — focus and saved-state feedback.
- **Manuscript type** — Iowan Old Style / Palatino fallback.
- **Utility type** — Avenir Next / system sans fallback.

The distinctive element is the fixed writing line: a subtle margin marker and viewport anchoring behavior keep the active thought physically stable while the manuscript moves.

## Local setup

1. Optionally copy `.env.example` to `.env` and add an Anthropic API key for personalized Reflect and Review behavior.
2. Run `npm install`.
3. Run `npm run dev`.

Topic discovery and writing work without an API key. When configured, the key is injected only by the local Vite proxy; it is never referenced in browser code.
