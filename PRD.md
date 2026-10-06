# Product Requirements Document: SVR Ghostwriter

> **Guidance clarification (September 28):** Memory, Tension, Outcome, System, and People are passive, prompt-specific bullet guides for the main prompt, not separate questions or steps. Guide copy is selected by the exact provocation (or stable Evergreen ID), with separate authored sets for all current prompts; topic changes and restored drafts derive guides from their selected topic. One continuous manuscript sits beneath them and is shared with the focused writing view. Earlier reflection notes remain recoverable. This supersedes the step-based guided-editor description below.

**Status:** Draft for product alignment  
**Version:** 1.0  
**Last updated:** September 29, 2026
**Primary user:** The author  
**Target platform:** Responsive web application  
**Target hosting:** GitHub Pages with optional free serverless AI proxy

> **September 28 UX direction:** The author prefers a guided writing flow with smaller prompts and more writing space. Topic selection opens this spacious guided editor; a visible manuscript bypass remains available at every step. This updates the earlier direct-to-manuscript default below. Reflection notes can be moved into the manuscript explicitly. Drafts and notes save locally without AI review.

## 1. Product summary

SVR Ghostwriter is an intentional writing environment with an optional AI collaborator for a systems-driven B2B product designer who wants to publish grounded UX and product reflections on Medium and LinkedIn. It is not primarily an AI writing tool.

The closest mental model is:

> A typewriter that keeps a designer intellectually curious.

The product removes two recurring barriers:

1. Deciding what current topic is worth writing about.
2. Maintaining attention and momentum once writing begins.

Ghostwriter surfaces relevant material, guides the author through a short self-interview, and then retreats into a calm manuscript experience. Editorial critique is available without turning the manuscript into a chatbot.

The interaction principle is:

> The AI can move; the writing should feel still.

The Ghost behaves like a well-read collaborator sitting quietly across the room: absent while the author is thinking, available when intentionally invited, and never mistaken for the author.

## 2. Problem statement

Current writing tools separate inspiration, reflection, drafting, and editing into unrelated experiences. Generic AI writing products also tend to produce ideas or prose for the author instead of helping the author recover specific experiences and observations.

The author needs a lightweight environment that:

- Continuously supplies credible, current UX and product inspiration.
- Helps connect an industry topic to first-hand product work.
- Preserves the author's warm, grounded, quietly confident voice.
- Makes drafting feel physically steady and distraction-free.
- Protects work across refreshes and browser restarts.
- Does not depend on one hosted AI provider for basic operation.

## 3. Product opportunity

The opportunity is not another general-purpose editor or AI chat interface. It is a personal Ghostwriter environment where the system supplies movement around a stable manuscript:

- Sources and signals move into view.
- Reflection questions move one at a time.
- Editorial notes temporarily appear beside the work.
- The manuscript and current thought remain visually anchored.

### The three actors

| Actor | Responsibility |
| --- | --- |
| **World** | Supplies credible things worth noticing and thinking about |
| **Me** | Thinks, writes, argues, chooses, and remains the author |
| **Ghost** | Questions, challenges, connects, and refines only when invited |

The product must never allow Ghost to take over Me. This separation governs topic sourcing, manuscript behavior, AI invocation, review, and revision acceptance.

## 4. User and jobs to be done

### Primary user

A senior B2B product designer with a UX-generalist and systems-thinking practice. The user writes reflective articles grounded in research, complex workflows, realistic prototypes, team decisions, and observed outcomes.

### Core jobs

When the user wants to publish but does not know where to begin, they want to see a small set of relevant current conversations so they can identify one that connects to their work.

When a topic feels promising but abstract, they want focused questions that recover a real memory, tension, system, person, and outcome.

When writing, they want the current thought to remain visually stable so they can sustain momentum without managing an editor interface.

When a draft exists, they want structured editorial feedback that improves clarity without replacing their voice.

When they return later, they want the manuscript, settings, reflection context, and editorial feedback restored exactly enough to continue.

## 5. Goals

### Product goals

- Reduce the time between opening the product and beginning a meaningful draft.
- Provide six credible inspiration topics divided across Latest, Trending, and Under the Radar.
- Ensure topic discovery continues without Claude or another hosted LLM.
- Turn reflection into a quiet self-interview rather than a dashboard of prompts.
- Keep writing as the center of the interface and review as a temporary mode.
- Persist active work and recent drafts locally without requiring an account.
- Keep hosting and maintenance free or near-zero for a single author.

### Experience goals

- Calm, editorial, and focused rather than dashboard-like.
- Physical rhythm without nostalgic typewriter decoration.
- Motion that communicates state changes without competing with prose.
- Typing that becomes intrinsically satisfying without scores, streaks, or rewards layered on top.
- Controls that recede once writing begins.
- Clear source provenance for inspiration topics.
- An AI presence that feels invoked and temporary rather than permanent.

### Non-goals for V1

- Multi-user collaboration or shared documents.
- Accounts, cloud sync, or cross-device synchronization.
- A full rich-text or block editor.
- Automatic publication to Medium or LinkedIn.
- General news aggregation.
- AI-generated complete articles before the author writes.
- Inline AI completion, permanent AI sidebars, and unsolicited rewrite suggestions.
- Streaks, XP, badges, or other extrinsic writing gamification.
- Automated LinkedIn scraping.
- Complex analytics or engagement optimization.
- Mobile-native applications.

## 6. Product principles

1. **Writing is primary.** Inspiration, reflection, and review exist to return the user to the manuscript.
2. **The Ghostwriter suggests; it does not dictate.** Prompts should retrieve lived experience rather than manufacture authority.
3. **Evidence is better than claims.** Topic cards link to source material, and critique flags vague or performative language.
4. **Stillness is functional.** The active paragraph remains near the writing line while the manuscript moves underneath it.
5. **Freshness must be honest.** The system never invents novelty when sources have not changed.
6. **AI is an enhancement, not a gate.** Topic discovery, writing, persistence, and export remain usable without a hosted model.
7. **Every feature protects focus.** Features that do not reduce friction or preserve momentum remain out of scope.
8. **Ghost waits to be invited.** It does not interrupt typing, occupy a permanent panel, or offer unsolicited completions.
9. **The raw draft remains untouched.** Ghost may annotate and propose, but only the author changes the manuscript.
10. **Behavior carries the delight.** The product may look quiet in a screenshot; it comes alive through typing, paper movement, and intentional transitions rather than decoration.
11. **Writing is the reward.** Mechanical feedback may reinforce flow, but the product does not gamify authorship.
12. **Sources inform the prompt; they never become the prompt.** Current material supplies evidence and urgency, while Ghostwriter offers an original question that leaves room for the author's experience and point of view.

## 7. Information architecture and primary flow

```text
DISCOVER → CHOOSE → WRITE → REFLECT → GHOST → REFINE → DRAFT
   World       Me       Me       Me      invited     Me       made
```

Mapped to the application:

```text
TODAY
  Review a small editorial desk of current or Evergreen ideas
        ↓
CHOOSE
  One idea carries onto the paper; everything else retreats
        ↓
WRITE
  Chrome-free manuscript with a fixed writing position
        ↓
REFLECT
  The author rereads and decides what the draft is saying
        ↓
GHOST
  Intentionally invoke questions, lenses, or editorial notes
        ↓
REFINE
  Accept, reject, or develop suggestions while preserving the raw draft
        ↓
DRAFT / EXPORT
  A durable piece the author made
```

Guided Memory, Tension, Outcome, System, and People pathways remain an optional way into the manuscript when the author wants help recalling experience. They are not a mandatory gate between choosing an idea and writing. The user may also bypass Today through **Start with a blank page**.

## 8. Scope and current implementation status

| Capability | Target state | Current state |
| --- | --- | --- |
| Today | Provider-independent topic pool | Static source-backed manifest integrated with an honest Evergreen fallback; no Claude topic request |
| Topic categories | 2 Latest, 2 Trending, 2 Under the Radar | Implemented when the manifest can fill all three categories |
| Local topic desk | Honest evergreen fallback and optional inspiration mode | Integrated fallback with stable rotation and explicit no-live-source labeling |
| Reflect | Guided writing with a manuscript bypass | Compact prompts, larger response area, free question navigation, explicit note transfer |
| Write | Paragraph-based immersive manuscript | Implemented |
| Fixed writing position | Live line held near 30% viewport height | Implemented with Anime.js |
| Review | Intentionally invoked Ghost annotations beside untouched manuscript | Separate review surface implemented; visible button, unstructured response, Claude-dependent |
| Persistence | Debounced local session and recent drafts | Implemented with versioned `localStorage` |
| Export | Markdown, text, Medium handoff | Implemented |
| Motion | Six foundational Anime.js behaviors plus two typewriter responses | Implemented |
| Production hosting | Static GitHub Pages deployment | Not yet configured |
| Production AI calls | Secure proxy or explicit BYO-key path | Decision required |

### POC findings and product implications

The working interface validates its individual Today, Reflect, Write, and Review surfaces. The focused paper POC and product doctrine refine their target order to Discover → Choose → Write, with Guided Reflect optional and post-writing Ghost intentionally invoked.

#### Validated by the working interface

- A direct **Start with a blank page** path protects the core writing job when inspiration or AI services are unavailable.
- One pathway at a time creates a quieter self-interview than presenting five simultaneous cards.
- A paragraph-based manuscript makes fixed-position writing, progressive paragraph quieting, and exact paragraph focus possible.
- A separate Review surface preserves the manuscript as the authoritative object instead of turning it into chat history.
- A 700ms debounced browser write is sufficient for the current single-author, small-document scope.
- Centralizing motion in named Anime.js behaviors makes the “motion serves stillness” rule enforceable.
- Article/LinkedIn and Reflective/Editorial settings are sufficient configuration, but the paper POC shows they should not remain visible while writing.

#### Validated by the local topic-desk experiment

The `src/topics.ts` POC contains 24 manually curated Evergreen prompts: four for each of the six product tags. Stable IDs, a deterministic date seed, persisted seen history through `topicSource.ts`, and a refresh offset support honest rotation. The selection algorithm attempts to show one prompt per tag before repeating a tag.

This validates:

- A useful inspiration experience can exist without any API or model.
- Daily stability is preferable to random reordering on every render.
- Manual Refresh should advance to a different deterministic set.
- Tag diversity is a valuable selection constraint independent of recency.
- The strongest curated content pattern is an observational tension in the title followed by an open reflective question in the teaser.
- A maintained local pool is a credible fallback and a useful source of editorial calibration for live topic generation.
- A deterministic source-to-provocation layer can turn current material into original writing questions without a hosted language model.

#### POC limitations that must not become product claims

- When a source-backed category contains fewer than two items, the loader currently replaces the entire desk with Evergreen prompts rather than showing fewer current topics honestly.
- Today now uses a rank-first editorial hierarchy with one lead story and five quieter signals. The usefulness of its Design, Technology, Industry, Ways of Working, and Self lens mapping still needs observation with real use.
- Evergreen content remains manually authored and does not become current merely because it rotates daily.
- Curated prompts and source-backed provocations use different schemas; source headlines are retained only as evidence and provenance.
- Guided navigation now uses explicit question tabs and Next question; the misleading duplicate angle action is removed.
- The reflection response includes an underlying angle, but the POC does not render it.
- Review is returned as one preformatted text block; the seven editorial sections are not yet represented as structured UI data.
- Drafts now retain a stable ID across autosaves; repeating Review no longer creates duplicate snapshots.
- Browser-storage write failures now display an export recovery warning. Drafts save independently of review.

The product must therefore distinguish **source-backed current topics** from **curated evergreen prompts**. Synthetic recency claims are prohibited outside prototypes.

## 9. Functional requirements

### FR-1: Today and inspiration discovery

#### FR-1.1 Topic presentation

The Today view must present exactly six topics when the current topic pool contains enough qualified material:

- 2 Latest
- 2 Trending
- 2 Under the Radar

Each topic must include:

- A concise, neutral theme label that is not copied from a source headline.
- An original, open-ended provocation designed to elicit experience, judgment, or a defensible point of view.
- A short, neutral **Why now** signal that explains why the theme is current without copying source framing.
- One user-facing lens: Design, Technology, Industry, Ways of Working, or Self.
- One primary tag: Systems, Research, AI, Leadership, Process, or Ethics.
- Category.
- Earliest or most relevant publication date.
- At least one source title and source URL.
- A brief explanation of why the topic belongs in its category.

Curated evergreen prompts may instead use a short observational sentence up to 90 characters followed by a reflective teaser. They must be visibly labeled as curated or evergreen and are not required to carry source-backed recency metadata.

The six items must not appear as six equally weighted dashboard cards. The target editorial composition is one dominant idea with five quieter signals. Selecting an idea makes the remaining desk retreat and carries the chosen provocation onto the manuscript.

Potential user-facing editorial lenses—Design, Technology, Industry, Ways of Working, and Self—may help intellectual serendipity. They are a presentation taxonomy to validate, not a replacement for source-backed recency categories or the internal product tags.

The primary clickable copy is the provocation, never a source headline. Source titles and URLs remain available only as supporting evidence. The conceptual flow is:

`source material → current signal → original provocation → the author's experience and perspective`

#### FR-1.2 Category definitions

**Latest** topics:

- Contain source material published within the last seven days.
- Meet the minimum relevance threshold for the author's UX/product profile.
- Are ranked primarily by recency and semantic relevance.

**Trending** topics:

- Contain material published within the last 21 days.
- Appear across multiple independent sources, show increasing engagement, or are marked fresh/rising by a source.
- Are ranked by momentum, source diversity, relevance, and recency.

**Under the Radar** topics:

- Contain material published within the last 30 days.
- Have high relevance or novelty but limited source coverage or moderate engagement.
- Favor niche practitioner discussions, specialized publications, research, and emerging tools over already-saturated mainstream stories.

Category logic must be deterministic and inspectable. A topic may qualify for multiple categories, but it may appear only once in a displayed set.

#### FR-1.3 Refresh behavior

- On application load, the client fetches the newest available topic manifest.
- The generated topic pool should contain approximately 30–50 clusters rather than only the six displayed items.
- Refresh selects another balanced set from the same pool, prioritizing topics not previously shown to the user.
- Seen topic IDs are stored locally.
- Topics may repeat only after the relevant pool is exhausted or materially updated.
- The interface displays the manifest's last-refreshed timestamp.
- If generation fails, the last valid manifest remains available with a visible stale-state message.
- If fewer than two qualified topics exist in a category, the product shows fewer results and explains why. It must not fabricate topics.
- If no valid manifest exists, the product may offer the curated topic desk under an **Evergreen prompts** label without Latest, Trending, or Under-the-Radar claims.

#### FR-1.4 Start without a topic

The user can enter Write directly through **Start with a blank page**. Topic-service failure must never block writing.

### FR-2: Provider-independent topic intelligence

#### FR-2.1 Source ingestion

The topic system collects permitted public metadata from a configurable source registry. Initial candidates include:

- Curated UX, product, design, research, and technology RSS/Atom feeds.
- DEV/Forem article APIs using relevant tags and fresh/rising states.
- Hacker News's public API with domain and keyword filtering.
- arXiv or OpenAlex records for HCI and human-AI interaction research.
- GitHub repository releases and discussions for design systems and prototyping tools.
- Bluesky public search as an experimental social signal, subject to availability and rate limits.
- A manual inspiration inbox containing URLs or notes supplied by the author.

LinkedIn is not an automated V1 source. The user may add a LinkedIn observation manually.

#### FR-2.2 Scheduled generation

- A scheduled GitHub Action runs every 6–12 hours.
- The job fetches source material in parallel and records source-level failures without failing the entire refresh.
- Only material from the previous 30 days is eligible for the active pool.
- The job emits a static `public/topics.json` manifest suitable for GitHub Pages.
- The previous valid manifest is retained if the new run fails validation.
- A manual workflow trigger is available for on-demand refreshes.

#### FR-2.3 Normalization and deduplication

Every source item is normalized to a common record containing ID, title, description, URL, source, published time, tags, and available engagement signals.

Deduplication occurs in two stages:

1. Exact canonical URL and normalized-title matching.
2. Semantic clustering of related coverage into a single topic.

#### FR-2.4 Hugging Face enrichment

The scheduled job may use a small open embedding or classification model from Hugging Face to:

- Measure relevance to the author's topic profile.
- Group semantically similar source items.
- Detect overlap with recently displayed topics.
- Assign or validate the six product tags.

The preferred runtime is the scheduled Node job, not the user's browser, to avoid repeated model downloads and inconsistent WebGPU support.

Hosted Hugging Face inference must not be required. If local model loading fails, the pipeline falls back to deterministic keyword matching, exact deduplication, and source metadata.

Optional local text generation may propose additional provocation candidates, but the pipeline must remain fully functional with deterministic, human-authored frames and the same originality validation.

#### FR-2.4a Source-to-provocation transformation

- The baseline pipeline detects a theme using inspectable keyword rules and selects from human-authored provocation frames deterministically.
- A provocation must be a question, must not reproduce a source headline, and must leave the position open for the author to form.
- The Why now copy describes the presence of a current signal; it does not summarize or endorse the source author's argument.
- Source titles remain unchanged inside provenance records so evidence is traceable.
- Manifest validation rejects missing provocations, missing Why now context, and excessive prompt-to-headline overlap.
- Hosted generation may improve framing later, but it is never required for topic discovery.

#### FR-2.5 Ranking logic

Initial ranking weights are tunable configuration rather than hard-coded product truth:

- Semantic relevance to the author profile: 35%
- Recency: 25%
- Momentum or engagement velocity: 20%
- Source diversity: 10%
- Novelty relative to recent topic history: 10%

Category-specific adjustments may change the weighting. Under the Radar reduces the benefit of high coverage and rewards novelty and niche-source relevance.

#### FR-2.6 Curated topic desk

The curated desk is an offline fallback and may also become a deliberate inspiration mode.

- The pool remains grouped across Systems, Research, AI, Leadership, Process, and Ethics.
- The maintained pool contains at least four prompts per tag, matching the initial POC baseline; it can expand without changing selection logic.
- Every curated prompt receives a stable ID and optional editorial version date.
- A date-seeded deterministic shuffle provides a stable daily desk.
- A persisted refresh offset and seen-ID history rotate the desk without unnecessary repetition.
- Selection attempts one prompt per tag before allowing duplicate tags.
- Curated prompts use an observational title and a question or tension-based teaser.
- Curated prompts use the category **Evergreen**, not Latest, Trending, Breaking, or Under the Radar.
- Generated “since” labels are not displayed for curated content.
- Updating the pool is a lightweight editorial task and does not require rebuilding product logic.

### FR-3: Reflect

Guided reflection is optional. The default POC path is Choose → Write; the author may invoke guided reflection before writing when a topic feels interesting but still abstract.

#### FR-3.1 Sequential pathways

The Reflect view presents one pathway at a time in this order:

1. Memory
2. Tension
3. Outcome
4. System
5. People

Each pathway contains one specific, grounded prompt. All five cards must never appear simultaneously.

The reflection payload may also contain a one-sentence underlying angle. When shown, it provides quiet context for the sequence and must not read like a thesis the user is expected to adopt.

#### FR-3.2 Self-interview behavior

- The user may write an optional response under each question.
- Responses persist as part of the active session.
- Continue advances to the next pathway.
- **Show me another angle** replaces the current question with another prompt of the same pathway type; it does not duplicate Continue behavior.
- The pathway trail shows visited, current, and future states.
- Visited pathways remain selectable.
- Future pathways remain unavailable until reached.
- The final pathway offers **Enter the manuscript**.
- Reflection responses remain private working notes and are not automatically inserted into the manuscript.

#### FR-3.3 Prompt generation and fallback

- Prompts should ask for concrete memories, assumptions, decisions, people, systems, and outcomes.
- Prompts must not write article prose for the user.
- Hosted AI may personalize prompts to the selected topic.
- Five deterministic fallback prompts ensure Reflect remains usable without AI.
- A future provider adapter should allow hosted Claude, another provider, or a local open model without changing the view logic.

### FR-4: Immersive manuscript

#### FR-4.1 Manuscript presentation

- The manuscript uses a 650–720px readable width on desktop.
- The title behaves as part of the manuscript rather than a separate form.
- Paragraph inputs have no visible conventional field borders.
- Manuscript typography uses an editorial serif; utilities use sans serif.
- The interface displays a subtle word count.
- The word count includes the manuscript body but excludes the title; the POC currently counts both and should be aligned before release.
- Mode, tone, save state, drafts, and export remain secondary.

#### FR-4.2 Paragraph editing

- Each paragraph is independently editable and grows with its content.
- Enter creates a new paragraph at the cursor position.
- Backspace on an empty non-first paragraph removes it and returns focus to the preceding paragraph.
- Clicking a paragraph makes it active.
- The current manuscript is assembled with blank lines between paragraphs for persistence and export.

#### FR-4.3 Fixed writing position

- The line being written returns to approximately 30% from the top of the viewport.
- The target position is 30% (`WRITING_ANCHOR` in `src/motion.ts`), settled on a ~600ms pause rather than on every keystroke.
- The anchor holds the *caret line*, not the paragraph top, so a growing paragraph does not push the caret down the screen.
- The manuscript's trailing space must exceed `100% - WRITING_ANCHOR` of the viewport, or the last lines of a short draft cannot reach the position.
- Older paragraphs remain visible.
- Older paragraphs soften to 0.72 opacity one paragraph back and 0.42 beyond that; the active paragraph is always restored to full ink.
- No paragraph becomes inaccessible or permanently hidden.
- Mobile layouts may remove the visible writing-line marker while retaining readable focus behavior.

#### FR-4.6 The Plume transitions — muted

> **Muted 2026-09-29 by author decision.** The instrument of this product is a
> typewriter, not a quill, so the Plume does not fit the theme. The component and
> its inkwell are retained in the tree but are not rendered; the native caret is
> the only cursor in every view. The transition-only Plume model described below
> was also unwired. The current writing response is described in FR-8.1 and
> `typewriting-feel.md`.


The native text caret remains authoritative for editing, selection, IME
composition, and accessibility. The Plume details below document the built
component, not current application behavior.

**Drawing.** A custom quill of 60px on desktop and 46px on a phone, between real
feather anatomy and a refined editorial line illustration — never an emoji,
stock icon, filled silhouette, or Victorian engraving.

- Three animation groups: feather body (both vanes and all barbs), `shaft`, `nib`. Individual barbs are never animated.
- The vane outlines and barb geometry are generated, not hand-drawn: widths follow a smoothed profile whose fullness sits high on the feather, and the tip closes in a soft cap rather than a point.
- The two vanes are deliberately asymmetric and meet along the shaft; the shaft carries a pronounced curve and runs bare along the calamus below them.
- Barbs rake back toward the quill end and start clear of the shaft so they never cross it; a slight deterministic jitter keeps the outer edge from reading as a perfect arc.
- The nib is a slim cut wedge with its slit, drawn a shade darker (`#14160e`) than the shaft (`#2b2f2a`) and the feather (`#3a3f38`).
- Size is bounded by legibility, not taste: with a 2.15 line height on 22px serif, a feather above ~58px reaches past the x-height of the line above and its full mid-section crosses the words. At 60px only the narrow tip grazes the descenders. 68px was tried and rejected for this reason.
- The quill sits at 0.82 opacity so the line above reads through the tip.

**Anchoring.** Position is expressed from the *nib tip*, never the SVG box.

- The nib tip lands on the text baseline immediately after the last glyph, and follows the caret onto the next line as text wraps.
- The feather is free to extend outside the line box; it is never shrunk to fit.
- Every transform pivots on the nib (`transform-origin` at the nib in both the wrapper and the SVG groups), so the quill turns on its point of contact rather than floating beside the text.
- The whole quill, not just its point of contact, is kept clear of the fixed header.

**Current writing response.** Eligible letters, punctuation, spaces, and erase
keys produce distinct, sub-pixel responses on the active line; arrows, modifiers,
and shortcuts produce none. Return advances the line while the sheet makes one
brief carriage movement. Text commits immediately and is never delayed by motion.
Both responses settle without looping and produce no movement under reduced
motion. No character landing, sound, or paper grain is implemented.

**Historical transition states.** arriving, lifting, stowing, departing,
responding, returning, then hidden. No state loops. These states are not currently
wired into the application.

- Ghostwriter thinking: the nib lifts off the baseline, the feather rotates upright, the plume withdraws and fades.
- Ghostwriter finished: the plume returns from the direction it left, the nib approaches the writer's previous caret position and disappears, leaving the native caret.
- Reflection → manuscript: the plume travels from the chosen question down to the first writing baseline, the nib drawing one thin curved stroke that connects the two; the stroke fades shortly after, the quill rotates into its writing angle, and focus follows. Thought, then ink, then writing.
- Entering a writing session: the inkwell appears in the left margin, the plume lifts out of it, rotates upright and travels to the caret. Leaving: the nib lifts, the plume travels back and settles into the well, which then fades.
- The well is anchored to the bottom-left margin (`bottom: 14vh`, `left: max(12px, calc(50% - 476px))`), which holds a 34px gap from the text column at every width and keeps it below the writing line on short viewports. It is hidden under 980px, where the lift is skipped.
- A writing session spans Reflect, Write and Review — only Today is outside it. The inkwell is used for entering and leaving a session, never for Review, where the pen is handed back to the caret it left.

**Contract.** The Plume is a visual layer only: native editing, selection, IME
composition, and accessibility behavior stay with the textarea.

- A textarea mirror (`src/caret.ts`) measures the true insertion point, including mid-line edits and wrapped lines.
- Positioning runs on `requestAnimationFrame` and never causes a React render.
- The native caret remains visible during writing, idle time, and transitions.
- The Plume hides on selection ranges, blur, IME composition, a hidden tab, and whenever the caret leaves the visible sheet.
- Under `prefers-reduced-motion` or forced colors the Plume does not render at all and the native caret returns.
- On coarse pointers the manuscript is not auto-focused on view change, so opening a document never summons the keyboard; the writer taps to begin.
- The Plume is the only skeuomorphic object in the interface: no paper textures, vintage grounds, handwriting faces, ink stains, or shadows around the feather.

#### FR-4.4 Distraction reduction

Once writing begins, inspiration and reflection controls retreat. The manuscript must not turn into a conversation thread or display editorial responses inline with prose.

- No permanent AI panel is visible while typing.
- No inline rewrite, completion, or “improve with AI” affordance interrupts the manuscript.
- Mode and tone controls are hidden or summoned outside the paper rather than occupying the writing surface.
- Review is invoked through a deliberate off-paper action, command, or keystroke.
- Autosave is silent unless it fails.

#### FR-4.5 Typing as intrinsic reward

Typing feedback may use restrained character landing, caret movement, or minute mechanical response to make producing text feel satisfying.

- Feedback must never delay character input or make the manuscript jitter.
- The first sentence may carry slightly more mechanical character.
- After sustained writing, nonessential feedback reduces as the environment enters a quieter flow state.
- Fixed-position settling should occur on paragraph change or a short pause rather than recentering on every keystroke.
- Feedback is disabled with reduced motion and remains optional if sound is introduced.
- The product does not use streaks, XP, celebratory counters, or productivity pressure.

### FR-5: Review and refine

#### FR-5.0 Intentional Ghost invocation

Ghost has no permanent panel. While the author writes, it may be represented by a quiet dormant mark that performs no action until invoked.

When invoked after writing, Ghost offers a small set of author-controlled lenses:

- Question my argument.
- Find what is missing.
- Help me go deeper.
- Challenge this assumption.
- Help me structure this.

The invocation avoids generic “What can I help you with?” framing. It is contextual to the current manuscript and begins with questions or observations rather than rewritten prose.

#### FR-5.1 Review structure

Review displays:

- The manuscript in a read-only editorial presentation.
- Editorial notes in a separate adjacent panel on desktop.
- A stacked layout on smaller screens.
- A clear **Return to manuscript** action.
- The untouched raw draft as the authoritative left-hand artifact.
- Ghost observations as separate margin-like annotations rather than inline replacements.

Editorial annotations use these lenses when applicable:

- **Idea:** the argument could go deeper.
- **Clarity:** a sentence is carrying too much.
- **Voice:** a passage sounds more generic than the surrounding draft.
- **Evidence:** a claim would benefit from a concrete example.
- **Structure:** the strongest idea appears too late or in the wrong place.

Each annotation points to relevant manuscript text and may offer a question or development action. Suggestions do not modify manuscript content until the author explicitly accepts or rewrites them.

#### FR-5.2 Critique requirements

The editorial review includes, in order:

1. Grammar and mechanics.
2. Voice and tone.
3. Structure and flow.
4. A refined version preserving the author's voice.
5. What changed and why.
6. Two or three alternative titles.
7. Three relevant hashtags when appropriate.

The provider response should use a validated structured schema for these sections. The interface may render prose within a section, but it must not depend on parsing arbitrary heading text from one unstructured response.

The review must flag buzzwords, performative claims, vague language, unsupported outcomes, and weak connections to systems or product consequences.

#### FR-5.3 Mode and tone

The user may choose:

- Article or LinkedIn.
- Reflective or Editorial tone.

These settings persist and inform critique behavior.

#### FR-5.4 Review fallback

Review currently requires a capable language model. If unavailable:

- The manuscript remains editable and exportable.
- The failed review does not overwrite an existing review.
- The interface explains that editorial review is unavailable and offers retry.
- The product does not imply the draft itself was lost.

### FR-6: Persistence and drafts

#### FR-6.1 Active session

- Active session state is stored under `svr-ghostwriter-session`.
- Storage uses a versioned wrapper to support future migrations.
- Writes occur after a real 700ms debounce.
- The UI transitions from Unsaved to Saved only after the browser write succeeds.
- No artificial saving delay is introduced.
- Refreshing or reopening the browser restores the last saved view and content.

The active session contains view, mode, tone, selected topic, pathways, pathway position, reflection responses, title, paragraphs, active paragraph, and review.

#### FR-6.2 Recent drafts

- Recent drafts are stored under `svr-ghostwriter-drafts`.
- Up to 20 drafts are retained.
- Draft records include a stable ID, title, timestamp, and manuscript content.
- Selecting a draft restores its title and paragraphs into Write.
- Requesting a successful review creates a draft snapshot in the current implementation.
- Requesting Review again must update or intentionally version the existing snapshot rather than silently creating indistinguishable duplicates.

Future consideration: explicit New, Save snapshot, Rename, and Delete actions. These are not required for initial V1 acceptance.

### FR-7: Export

- Markdown export includes the manuscript title as an H1.
- Text export contains title followed by manuscript content.
- Filenames are generated safely from the manuscript title.
- Medium opens in a new protected tab for manual paste.
- Export remains available whenever manuscript content exists, even if review fails.

#### FR-8.1 Paper and surface

The manuscript is a sheet laid on a desk, not a full-bleed background: the
writing shell uses `--paper`, the manuscript uses `--sheet`, and the sheet
carries a soft resting shadow. This makes the page an object that can respond
(`typewriting-feel.md` §10).

- The surface reacts to a keystroke only on the active line, never the application.
- The sheet's shadow deepens only on the carriage return, driven by `--sheet-lift`.
- The page is never animated continuously. Stillness is the default, and movement reads because the page is otherwise calm.
- Not adopted: the paper grain §10 offers. It conflicts with the standing instruction that the interface carries no paper texture, and remains an author decision.

### FR-8: Motion system

Anime.js is the primary motion library. Motion is organized into six foundational transition and paragraph behaviors plus two writing responses:

| Behavior | Purpose | Target behavior |
| --- | --- | --- |
| `ghostReveal` | Ghostwriter speaks | Words reveal with restrained irregular timing |
| `pathwayExit` | Leave current prompt | Rise approximately 12px and fade |
| `pathwayEnter` | Introduce next prompt | Enter from slightly below and settle |
| `focusParagraph` | Maintain writing position | Move manuscript so the caret line returns near 30% |
| `quietParagraph` | Reduce visual competition | Progressively soften older paragraphs |
| `enterWritingMode` | Transition into manuscript | Reflection retreats and manuscript quietly expands |
| `paperImpulse` | Answer a keystroke | Active line dips a fraction of a pixel; letter, punctuation, space and erase each differ |
| `carriageReturn` | Answer a Return | The sheet travels back and its shadow deepens, then settles |

Motion requirements:

- Typical duration remains below approximately 600ms.
- Buttons, badges, and utilities do not bounce or animate decoratively.
- Excessive stagger is prohibited.
- `prefers-reduced-motion` disables nonessential movement.
- The product remains fully usable without animation.
- Motion remains editorial and mechanical: cursor movement, paper shifts, character impressions, prompt collapse, Ghost appearance, margin annotation, and focus transition.
- Playfulness comes from behavior rather than decorative effects.

Optional future immersion:

- ~~A softer custom caret.~~ Built as the Plume (FR-4.6).
- Subtle CSS paper texture.
- Optional monospaced manuscript type.
- Opt-in Web Audio keystroke and return sounds, muted by default.
- Native View Transitions for large mode changes.

### FR-9: Navigation and state continuity

- Today, Write, and Drafts remain accessible from the global header when relevant.
- Leaving Write does not clear manuscript content.
- Entering Review does not change the active manuscript.
- Returning from Review restores the manuscript and last active paragraph.
- Starting a blank manuscript is explicit and must not silently destroy a saved draft snapshot.

### FR-10: Hosting and AI access

#### Static application

- The React application builds as a static bundle.
- GitHub Pages is the preferred free host.
- Topic manifests and source metadata deploy as static assets.

#### Production AI calls

The local Vite proxy is development-only and cannot protect secrets on GitHub Pages. Production must use one of these explicit paths:

1. **Recommended:** GitHub Pages plus a free serverless proxy that stores the provider key and applies rate limits.
2. **Personal fallback:** A bring-your-own-key mode with clear disclosure that the credential is stored locally in the browser.

The selected implementation must:

- Never bake a secret API key into the static JavaScript bundle.
- Limit request body size and allowed upstream paths.
- Avoid logging manuscript content by default.
- Return actionable, non-destructive error states.

## 10. Topic data contract

### System shape

```text
Public sources + manual inspiration inbox
                    ↓
        Scheduled GitHub Action
  fetch → normalize → deduplicate → cluster
       → classify → rank → validate
                    ↓
          public/topics.json
                    ↓
        Static React application
  Discover → Choose → Write → Reflect → Ghost → Refine → Draft
                    ↓
      Versioned browser localStorage

Optional review/pathway request
                    ↓
       Restricted serverless proxy
                    ↓
            Configured AI provider
```

The static topic path and manuscript path must continue functioning when the optional AI path is unavailable.

### Manifest

The target generated manifest follows this conceptual structure:

```ts
type TopicManifest = {
  version: 2;
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  topics: SourceBackedTopic[];
  sourceHealth: SourceHealth[];
};

type TopicBase = {
  id: string;
  title: string;
  tag: "Systems" | "Research" | "AI" | "Leadership" | "Process" | "Ethics";
};

type SourceBackedTopic = TopicBase & {
  provocation: string;
  whyNow: string;
  lens: "Design" | "Technology" | "Industry" | "Ways of Working" | "Self";
  origin: "source-backed";
  category: "Latest" | "Trending" | "Under the Radar";
  publishedAt: string;
  since: string;
  relevanceScore: number;
  categoryReason: string;
  sources: Array<{
    name: string;
    title: string;
    url: string;
    publishedAt: string;
  }>;
};

type CuratedTopic = TopicBase & {
  teaser: string;
  origin: "curated";
  category: "Evergreen";
  editorialVersion?: string;
};
```

The client must validate the manifest before replacing the last known valid pool.

## 11. Visual system

### Palette

- Paper: `#F3F5F2`
- Sheet: `#FAFBF8`
- Ink: `#20231F`
- Graphite: `#6E746C`
- Rule: `#D9DDD6`
- Signal: `#315B49`

### Typography

- Manuscript and editorial display: Iowan Old Style with Palatino and Georgia fallbacks.
- Controls and metadata: Avenir Next with system sans-serif fallbacks.

### Signature element

The fixed writing line is the product's signature. A subtle margin marker identifies the visual writing position while the active paragraph remains stable and the page moves.

### Responsive behavior

- Desktop manuscript remains centered and narrow.
- Topic rows reduce metadata density on small screens.
- Reflection trail may scroll horizontally.
- Review columns stack on small screens.
- Controls remain keyboard accessible and large enough for touch interaction.

## 12. Voice and content guidelines

Ghostwriter's editorial voice is:

- Warm
- Grounded
- Quietly confident
- Observational rather than opinionated
- Plain and precise
- Evidence-led
- Outcome-aware without overstating impact

Avoid:

- Dramatic hooks.
- Generic UX thought-leadership language.
- Buzzwords and vague transformation claims.
- Overly poetic metaphors.
- Advice that sounds more certain than the author's evidence.
- Writing complete experiences the author did not provide.

## 13. Non-functional requirements

### Accessibility

- All controls are keyboard reachable.
- Focus states are visible.
- Inputs have accessible labels.
- Reduced-motion preferences are respected.
- Color is not the only indicator of state.
- Text and interactive controls meet WCAG AA contrast targets.

### Performance

- The writing route remains responsive during continuous typing.
- Autosave does not block keystrokes.
- Topic retrieval does not block entry into a blank manuscript.
- Topic-manifest payload should remain small enough for immediate static delivery.
- Local Hugging Face model work occurs during scheduled generation, not the typing path.

### Reliability

- A failed source does not invalidate successful sources.
- A failed manifest build does not replace the previous valid manifest.
- Storage parsing failures return safe defaults.
- AI failure never deletes or blocks access to manuscript content.

### Privacy and security

- Manuscripts remain in browser storage unless deliberately submitted for review.
- No analytics or third-party tracking is required for V1.
- Source collection processes public metadata only and respect source terms and rate limits.
- Secrets remain server-side unless the user explicitly selects bring-your-own-key mode.

## 14. States and error handling

### Topics

- Loading: “Listening for current conversations…”
- Missing configuration: explain the unavailable enrichment path and preserve blank writing.
- Refresh failed with cached manifest: show cached topics and their age.
- No qualified topics: explain that no current material met the relevance threshold.
- No valid current manifest: offer clearly labeled Evergreen prompts, never simulated freshness labels.

### Reflection

- Loading: “Finding a way into the story…”
- AI unavailable: load deterministic five-pathway fallback.

### Writing

- Empty manuscript: review action disabled.
- Pending save: Unsaved.
- Completed local write: Saved.
- Storage failure: retain in-memory content and display a specific persistence warning.

### Review

- Loading: “Reading closely…”
- Failure: preserve manuscript and prior review, explain failure, allow retry and export.

## 15. Success measures

Because this is initially a private single-user product, success is measured through behavior and quality checks rather than growth metrics.

### Primary outcome

Number of manuscripts reaching Review or Export per week.

### Supporting measures

- Time from opening Today to entering the first manuscript paragraph.
- Percentage of sessions that progress from topic selection to Write.
- Percentage of started manuscripts restored and continued in a later session.
- Number of distinct inspiration topics opened before pool repetition.
- Percentage of generated topics with valid sources and dates.
- Percentage of topic refreshes completed without a hosted LLM.
- Frequency of review requests and return-to-manuscript actions.

### Initial quality targets

- 100% of displayed topics have at least one valid source URL and date.
- A successful scheduled refresh produces two qualified topics per category when the source pool supports it.
- The manifest is no more than 12 hours old under normal scheduled operation.
- A refresh prioritizes unseen topics until its category pool is exhausted.
- Session content survives refresh and browser restart in supported browsers.
- No manuscript content is lost when topic or review services fail.
- Production build completes successfully.

## 16. Release plan

### Phase 1: Writing foundation — implemented

- Vite, React, and TypeScript shell.
- Sequential reflection flow.
- Immersive paragraph manuscript.
- Fixed writing position.
- Anime.js motion system.
- Local persistence and recent drafts.
- Separate review surface.
- Markdown and text export.

### Phase 2: Inspiration intelligence — foundation implemented

Implemented:

- Honest local Evergreen desk with stable IDs and deterministic selection.
- Source registry and scheduled collection job.
- Normalization, validation, deterministic filtering, clustering, ranking, and category logic.
- Static 30–50-topic manifest.
- Client manifest validation, balanced selection, seen-topic history, and Evergreen fallback.
- Today integration through `topicSource.loadTopics()` with no Claude topic request.
- Manual source-backed and Evergreen desk rotation through `advanceDeskOffset()`.
- Source provenance, category reasons, manifest age, Latest labeling, and honest Evergreen labeling.
- Rank-first editorial composition with one dominant story, five quieter signals, and visible editorial lenses.

Remaining:

- Show fewer current topics honestly when a category has fewer than two instead of replacing the full desk.
- Add optional local Hugging Face embeddings for improved semantic clustering and relevance.

### Phase 3: Production deployment

- Configure GitHub Pages build and deploy workflow.
- Select secure serverless proxy or bring-your-own-key behavior.
- Add provider abstraction for pathway and critique requests.
- Add rate limits and request validation if proxy is selected.

### Phase 4: Quality and immersion

- Test topic quality against manual author judgment.
- Tune category thresholds and ranking weights.
- Test paragraph focus behavior across long manuscripts and mobile layouts.
- Decide whether to add optional sound, custom caret, or View Transitions.

## 17. V1 acceptance criteria

The target V1 is accepted when:

1. The app builds and deploys as a static site.
2. Today loads a validated, source-backed topic manifest without Claude.
3. Under normal source conditions, Today shows two Latest, two Trending, and two Under the Radar topics.
4. Refresh favors unseen topics and never fabricates replacements.
5. When no current manifest is available, the local topic desk displays six honestly labeled Evergreen prompts without simulated dates.
6. Manual Refresh changes the deterministic set and prioritizes unseen prompt IDs.
7. Topic failure does not block blank writing.
8. Selecting a topic carries it directly onto the manuscript without requiring AI or guided reflection.
9. Guided reflection remains intentionally invokable and shows one pathway at a time.
10. All five pathway types are reachable and visited prompts remain navigable.
11. Show me another angle changes the current pathway prompt instead of advancing.
12. Deterministic prompts are available when personalized prompt generation fails.
13. The manuscript is borderless, paragraph-based, and visually primary.
14. The active paragraph returns near the fixed writing position without per-keystroke jitter.
15. Older paragraphs remain readable while becoming visually quieter.
16. Writing-time controls and permanent AI chrome are absent from the paper.
17. Typing feedback reduces during sustained flow and respects reduced motion.
18. Ghost remains dormant until intentionally invoked.
19. Ghost annotations are classified by Idea, Clarity, Voice, Evidence, or Structure and never overwrite raw prose automatically.
20. All eight named Anime.js behaviors are wired and reduced motion is respected.
21. The active session persists across a browser reload.
22. Recent draft snapshots persist and reopen correctly.
23. Review appears separately from the manuscript and does not convert writing into chat.
24. Review failure preserves writing and export.
25. Markdown and text exports contain the complete title and manuscript.
26. No production API secret exists in the client bundle.
27. Keyboard navigation and visible focus work across the primary flow.
28. Source provenance, refresh age, category reasoning, and neutral Why now context are visible for every source-backed topic.
29. No source headline is presented as a writing prompt; every source-backed item carries an original question that passes the overlap gate.

## 18. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Sparse UX-specific activity in a short window | Categories may lack two honest topics | Use diverse sources, show fewer topics honestly, retain relevant cached material |
| Curated prompts are mistaken for live industry signals | Loss of trust | Separate Evergreen origin and prohibit synthetic recency claims |
| Source authors' headlines become the writer's prompts | Imitative framing and weakened authorship | Transform sources into original provocations; restrict headlines to provenance |
| “Trending” based on weak engagement data | Misleading category | Combine source diversity, rising states, and time-based velocity; display category reason |
| Under-the-radar ranking becomes arbitrary | Low trust | Require high relevance and expose source count and reason |
| Feed/API changes or rate limits | Refresh failures | Source adapters, health reporting, per-source failure isolation, cached manifest |
| Semantic model download or inference fails | Clustering degrades | Deterministic fallback and previous valid manifest |
| WebGPU/browser inconsistency | Poor client performance | Run enrichment in scheduled Node job instead of browser |
| Local storage is cleared | Lost local-only work | Clear product disclosure; later optional file backup/export |
| Static hosting cannot hold secrets | Review unavailable in production | Serverless proxy or explicit BYO-key decision |
| AI critique rewrites the author's identity | Product loses purpose | Strong voice prompt, structured critique, manuscript remains authoritative |
| Ghost becomes an always-on AI assistant | Writing is interrupted and authorship blurs | Dormant-by-default invocation; no inline completion or permanent panel |
| Mechanical typing feedback becomes distracting | Flow degrades and input feels delayed | Subtle response, pause-based settling, adaptive reduction, reduced-motion fallback |
| Motion becomes theatrical | Reduced focus | Named-behavior constraint, short durations, reduced-motion support |

## 19. Open decisions

1. Should the public label be **Latest** or **Breaking**? Current direction favors Latest because it is calmer and more accurate.
2. Which sources form the initial trusted registry, and which remain experimental?
3. Should manual inspiration items participate in ranking or appear in a separate personal queue?
4. Which local Hugging Face embedding model offers the best quality/runtime balance in GitHub Actions?
5. When should the human-authored provocation library expand, and would optional local generation add enough variety to justify its review burden?
6. Should production review use a serverless proxy or bring-your-own-key mode?
7. Is Claude retained for critique, or should the provider adapter support multiple hosted and local models at launch?
8. When should a manuscript become a durable draft snapshot: review, explicit save, navigation away, or a time interval?
9. Should optional typewriter sound and monospaced typography be included after the silent experience is validated?
10. Should the curated desk remain a fallback only, or appear as a user-selectable Evergreen mode beside current topics?
11. Should Guided Reflect remain a visible optional route, or appear only when the author asks for help getting started?
12. What invokes Ghost after writing: a dormant mark, keyboard command, command palette, or combination?
13. ~~Which typing response—visual character landing, caret behavior, optional sound, or paper movement—adds tactility without delaying input?~~ Answered: **paper movement**. The quill is muted; a keystroke is answered by a sub-pixel impulse on the active line (`paperImpulse`), sized down as typing speeds up. Character landing and sound remain open — see `typewriting-feel.md` phases 2-4.
14. Do the visible Design, Technology, Industry, Ways of Working, and Self lenses improve scanning enough to keep?

## 20. Decisions already made

- The product is personal and single-author first.
- Writing is the central interface.
- Reflection shows one pathway at a time.
- The fixed writing position targets approximately 30% of viewport height.
- Anime.js powers six foundational manuscript behaviors plus `paperImpulse` and `carriageReturn`; the Plume is unwired.
- Active work and recent drafts use versioned local browser storage.
- Review is separate from the manuscript rather than chat-based.
- Topic discovery must stop depending on Claude.
- A multi-source scheduled pipeline is preferred over RSS alone.
- Hugging Face is used for optional local enrichment rather than as a required hosted content source.
- Refresh prioritizes unseen topics but does not pretend sources changed when they did not.
- The local topic pool is valuable as an Evergreen desk, but its generated recency labels are not product truth.
- Static, free, low-maintenance hosting remains a product constraint.
- The product is an intentional writing environment with an optional AI collaborator, not an AI writing tool.
- World supplies material, Me remains the author, and Ghost questions or refines only when invited.
- The default POC path is Discover → Choose → Write; guided pre-writing reflection is optional.
- Ghost has no permanent writing-time panel and does not provide unsolicited inline completion.
- The raw manuscript remains authoritative and is never changed without explicit author action.
- Writing itself—not streaks, XP, or productivity scoring—is the reward.
- Today gives the highest-ranked topic dominant editorial weight and presents the remaining five as quieter signals.
- Existing product tags map to visible editorial lenses for evaluation without changing source-backed category logic.
