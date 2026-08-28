# SVR Ghostwriter V1

## Why this exists

Ghostwriter is a personal writing companion for keeping my voice as a designer alive on Medium. Its job is to remove the two frictions that stop me from publishing: not knowing *what* to write about, and losing momentum *while* writing. It solves the first by surfacing relevant, current UX/product prompts (a "ghost" that suggests, never dictates), and the second by giving me a calm, immersive space where the act of writing feels physical and continuous — like a typewriter, but softer and more alive.

The intent is deliberately small: a tool for one author, hosted for free, lightweight, and easy to maintain. It should never become a heavy app. Every feature earns its place by protecting focus.

## The immersive typewriter experience

The distinctive feeling I'm after is a **modern, immersive typewriter** — the steadiness and rhythm of a typewriter without its rigidity. This is the emotional core, and motion is how we achieve it.

**Anime.js** is the primary tool for this. It's tiny (~tens of KB), has no runtime dependencies, and drives the six behaviors already defined (`ghostReveal`, `pathwayExit/Enter`, `focusParagraph`, `quietParagraph`, `enterWritingMode`). The signature move is the **fixed writing line**: the active paragraph stays anchored near 42% of the viewport while the page scrolls underneath, so the thought I'm writing stays physically still — the closest digital analog to paper feeding through a carriage.

Ways to deepen the immersion, all free and lightweight:

- **Anime.js (in use)** — word-by-word reveals, paragraph focus/quiet transitions, carriage-style scroll anchoring. Keep motion under ~600ms and always gate it behind `prefers-reduced-motion`.
- **CSS-only touches** — a soft caret, subtle paper grain via the existing palette, a monospaced *option* for the manuscript for a truer typewriter register, and `@keyframes` for ambient details that don't need JS.
- **Web Audio API (optional, opt-in)** — a faint keystroke/return-bell sound generated in-browser. No assets, no dependency, muted by default. This is the single highest-impact addition for "typewriter feel" if I want it.
- **View Transitions API** — native, zero-KB crossfades between the today → reflect → write → review modes, complementing Anime.js for the larger scene changes.

The rule: motion serves stillness. The AI and the interface can move; the writing should feel calm and anchored.

## Hosting: free, on GitHub, easy to maintain

The target is **GitHub Pages** — free, zero-maintenance static hosting straight from the repo. This is a good fit for everything *except* the Anthropic API calls, because Pages serves static files only and cannot hold a secret API key or proxy requests. The local Vite dev proxy that exists today does not deploy.

Two clean paths reconcile "free GitHub hosting" with the AI features (this is the one open item in the build sequence):

1. **GitHub Pages + a free serverless proxy** *(recommended)* — deploy the built static site to Pages, and put one small serverless function (Cloudflare Workers or Vercel free tier) in front of the Anthropic API to hold the key. The function is the production equivalent of today's Vite proxy: `/api/anthropic/*` → Anthropic, key injected server-side. Keeps hosting free and the key off the client.
2. **Fully static, bring-your-own-key** — ship only to Pages with no backend; the app prompts me to paste my own Anthropic key, stored in `localStorage` and sent directly from the browser. Zero infrastructure, but the key lives client-side (acceptable for a single-user personal tool, not for anything shared).

Either way the app stays a static bundle, so the immersive front-end and free hosting are never in tension — only the API path needs a decision.

## Product principle

The AI can move; the writing should feel still. Writing remains the product's center, while reflection and review are temporary modes around the manuscript.

## Interaction model

1. **Today** — load six current UX/product ideas and choose one.
2. **Reflect** — move through Memory, Tension, Outcome, System, and People one prompt at a time. Keep a small, navigable trail.
3. **Write** — enter a borderless manuscript. Keep the active paragraph near 42% of the viewport and soften older paragraphs without hiding them.
4. **Review** — show editorial critique beside the manuscript rather than converting the manuscript into chat.
5. **Refine and export** — return to the exact writing position, then export text or Markdown.

## V1 build sequence

- [x] Add a runnable Vite + React + TypeScript shell.
- [x] Replace window-only session variables with versioned localStorage records and real debounced writes.
- [x] Convert reflection cards into sequential prompts with response capture and trail navigation.
- [x] Build a paragraph-based manuscript editor with title, word count, focus anchoring, and quiet paragraph states.
- [x] Define the six Anime.js motion behaviors: `ghostReveal`, `pathwayExit`, `pathwayEnter`, `focusParagraph`, `quietParagraph`, and `enterWritingMode`.
- [x] Separate manuscript and editorial review modes.
- [ ] Add production API handling for GitHub Pages hosting (see "Hosting" above): either a free serverless proxy holding the key, or a static bring-your-own-key fallback. Vite's development proxy is included for local use only and does not deploy.
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

1. Copy `.env.example` to `.env` and add an Anthropic API key.
2. Run `npm install`.
3. Run `npm run dev`.

The API key is injected only by the local Vite proxy; it is never referenced in browser code.
