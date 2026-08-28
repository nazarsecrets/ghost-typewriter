# Product Requirements Document: SVR Ghostwriter

**Status:** Draft for product alignment  
**Version:** 1.0  
**Last updated:** August 28, 2026  
**Primary user:** The author  
**Target platform:** Responsive web application  
**Target hosting:** GitHub Pages with optional free serverless AI proxy

## 1. Product summary

SVR Ghostwriter is a personal writing environment for a systems-driven B2B product designer who wants to publish grounded UX and product reflections on Medium and LinkedIn.

The product removes two recurring barriers:

1. Deciding what current topic is worth writing about.
2. Maintaining attention and momentum once writing begins.

Ghostwriter surfaces relevant material, guides the author through a short self-interview, and then retreats into a calm manuscript experience. Editorial critique is available without turning the manuscript into a chatbot.

The product principle is:

> The AI can move; the writing should feel still.

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
- Controls that recede once writing begins.
- Clear source provenance for inspiration topics.

### Non-goals for V1

- Multi-user collaboration or shared documents.
- Accounts, cloud sync, or cross-device synchronization.
- A full rich-text or block editor.
- Automatic publication to Medium or LinkedIn.
- General news aggregation.
- AI-generated complete articles before the author writes.
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

## 7. Information architecture and primary flow

```text
TODAY
  Choose a current idea or start with a blank page
        ↓
REFLECT
  One pathway at a time
        ↓
WRITE
  Immersive manuscript at a fixed writing position
        ↓
REVIEW
  Manuscript beside editorial notes
        ↓
REFINE
  Return to the same manuscript and writing context
        ↓
EXPORT
  Markdown, text, or Medium handoff
```

The user may bypass Today and Reflect by choosing **Start with a blank page**.

## 8. Scope and current implementation status

| Capability | Target state | Current state |
| --- | --- | --- |
| Today | Provider-independent topic pool | Claude-generated topics in local development |
| Topic categories | 2 Latest, 2 Trending, 2 Under the Radar | 2 Breaking, 2 Trending, 2 Under the Radar |
| Reflect | Five sequential pathways | Implemented with hosted AI plus deterministic fallback |
| Write | Paragraph-based immersive manuscript | Implemented |
| Fixed writing position | Active paragraph near 42% viewport height | Implemented with Anime.js |
| Review | Editorial notes beside manuscript | Implemented; currently Claude-dependent |
| Persistence | Debounced local session and recent drafts | Implemented with versioned `localStorage` |
| Export | Markdown, text, Medium handoff | Implemented |
| Motion | Six reusable Anime.js behaviors | Implemented |
| Production hosting | Static GitHub Pages deployment | Not yet configured |
| Production AI calls | Secure proxy or explicit BYO-key path | Decision required |

## 9. Functional requirements

### FR-1: Today and inspiration discovery

#### FR-1.1 Topic presentation

The Today view must present exactly six topics when the current topic pool contains enough qualified material:

- 2 Latest
- 2 Trending
- 2 Under the Radar

Each topic must include:

- A three-to-seven-word topic label.
- A concise teaser under 200 characters.
- One primary tag: Systems, Research, AI, Leadership, Process, or Ethics.
- Category.
- Earliest or most relevant publication date.
- At least one source title and source URL.
- A brief explanation of why the topic belongs in its category.

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

Optional local text generation may create teasers, but the pipeline must also support teasers derived from source descriptions without generative AI.

#### FR-2.5 Ranking logic

Initial ranking weights are tunable configuration rather than hard-coded product truth:

- Semantic relevance to the author profile: 35%
- Recency: 25%
- Momentum or engagement velocity: 20%
- Source diversity: 10%
- Novelty relative to recent topic history: 10%

Category-specific adjustments may change the weighting. Under the Radar reduces the benefit of high coverage and rewards novelty and niche-source relevance.

### FR-3: Reflect

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
- The pathway trail shows visited, current, and future states.
- Visited pathways remain selectable.
- Future pathways remain unavailable until reached.
- The final pathway offers **Enter the manuscript**.

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
- Mode, tone, save state, drafts, and export remain secondary.

#### FR-4.2 Paragraph editing

- Each paragraph is independently editable and grows with its content.
- Enter creates a new paragraph at the cursor position.
- Backspace on an empty non-first paragraph removes it and returns focus to the preceding paragraph.
- Clicking a paragraph makes it active.
- The current manuscript is assembled with blank lines between paragraphs for persistence and export.

#### FR-4.3 Fixed writing position

- The active paragraph returns to approximately 40–45% from the top of the viewport.
- The target position is 42% on supported desktop layouts.
- Older paragraphs remain visible.
- Recent older paragraphs soften progressively toward approximately 0.88 and 0.72 opacity.
- No paragraph becomes inaccessible or permanently hidden.
- Mobile layouts may remove the visible writing-line marker while retaining readable focus behavior.

#### FR-4.4 Distraction reduction

Once writing begins, inspiration and reflection controls retreat. The manuscript must not turn into a conversation thread or display editorial responses inline with prose.

### FR-5: Review and refine

#### FR-5.1 Review structure

Review displays:

- The manuscript in a read-only editorial presentation.
- Editorial notes in a separate adjacent panel on desktop.
- A stacked layout on smaller screens.
- A clear **Return to manuscript** action.

#### FR-5.2 Critique requirements

The editorial review includes, in order:

1. Grammar and mechanics.
2. Voice and tone.
3. Structure and flow.
4. A refined version preserving the author's voice.
5. What changed and why.
6. Two or three alternative titles.
7. Three relevant hashtags when appropriate.

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

Future consideration: explicit New, Save snapshot, Rename, and Delete actions. These are not required for initial V1 acceptance.

### FR-7: Export

- Markdown export includes the manuscript title as an H1.
- Text export contains title followed by manuscript content.
- Filenames are generated safely from the manuscript title.
- Medium opens in a new protected tab for manual paste.
- Export remains available whenever manuscript content exists, even if review fails.

### FR-8: Motion system

Anime.js is the primary motion library. Motion is organized into six reusable behaviors:

| Behavior | Purpose | Target behavior |
| --- | --- | --- |
| `ghostReveal` | Ghostwriter speaks | Words reveal with restrained irregular timing |
| `pathwayExit` | Leave current prompt | Rise approximately 12px and fade |
| `pathwayEnter` | Introduce next prompt | Enter from slightly below and settle |
| `focusParagraph` | Maintain writing position | Move manuscript so active paragraph returns near 42% |
| `quietParagraph` | Reduce visual competition | Progressively soften older paragraphs |
| `enterWritingMode` | Transition into manuscript | Reflection retreats and manuscript quietly expands |

Motion requirements:

- Typical duration remains below approximately 600ms.
- Buttons, badges, and utilities do not bounce or animate decoratively.
- Excessive stagger is prohibited.
- `prefers-reduced-motion` disables nonessential movement.
- The product remains fully usable without animation.

Optional future immersion:

- A softer custom caret.
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
  Today → Reflect → Write → Review → Export
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
  version: 1;
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  topics: Topic[];
  sourceHealth: SourceHealth[];
};

type Topic = {
  id: string;
  title: string;
  teaser: string;
  tag: "Systems" | "Research" | "AI" | "Leadership" | "Process" | "Ethics";
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

### Phase 2: Inspiration intelligence

- Add source registry.
- Add scheduled collection job.
- Normalize and validate source records.
- Add deterministic filtering and category logic.
- Add local Hugging Face embeddings for clustering and relevance.
- Generate 30–50-topic static manifest.
- Add seen-topic rotation and source provenance to Today.
- Rename Breaking to Latest.

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
5. Topic failure does not block blank writing.
6. Selecting a topic opens one reflection pathway at a time.
7. All five pathway types are reachable and visited prompts remain navigable.
8. Deterministic prompts are available when personalized prompt generation fails.
9. The manuscript is borderless, paragraph-based, and visually primary.
10. The active paragraph returns near the fixed writing position.
11. Older paragraphs remain readable while becoming visually quieter.
12. All six Anime.js behaviors are wired and reduced motion is respected.
13. The active session persists across a browser reload.
14. Recent draft snapshots persist and reopen correctly.
15. Review appears separately from the manuscript and does not convert writing into chat.
16. Review failure preserves writing and export.
17. Markdown and text exports contain the complete title and manuscript.
18. No production API secret exists in the client bundle.
19. Keyboard navigation and visible focus work across the primary flow.
20. Source provenance, refresh age, and category reasoning are visible for every topic.

## 18. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Sparse UX-specific activity in a short window | Categories may lack two honest topics | Use diverse sources, show fewer topics honestly, retain relevant cached material |
| “Trending” based on weak engagement data | Misleading category | Combine source diversity, rising states, and time-based velocity; display category reason |
| Under-the-radar ranking becomes arbitrary | Low trust | Require high relevance and expose source count and reason |
| Feed/API changes or rate limits | Refresh failures | Source adapters, health reporting, per-source failure isolation, cached manifest |
| Semantic model download or inference fails | Clustering degrades | Deterministic fallback and previous valid manifest |
| WebGPU/browser inconsistency | Poor client performance | Run enrichment in scheduled Node job instead of browser |
| Local storage is cleared | Lost local-only work | Clear product disclosure; later optional file backup/export |
| Static hosting cannot hold secrets | Review unavailable in production | Serverless proxy or explicit BYO-key decision |
| AI critique rewrites the author's identity | Product loses purpose | Strong voice prompt, structured critique, manuscript remains authoritative |
| Motion becomes theatrical | Reduced focus | Six-behavior constraint, short durations, reduced-motion support |

## 19. Open decisions

1. Should the public label be **Latest** or **Breaking**? Current direction favors Latest because it is calmer and more accurate.
2. Which sources form the initial trusted registry, and which remain experimental?
3. Should manual inspiration items participate in ranking or appear in a separate personal queue?
4. Which local Hugging Face embedding model offers the best quality/runtime balance in GitHub Actions?
5. Should topic teasers remain source-derived or use an optional local generative model?
6. Should production review use a serverless proxy or bring-your-own-key mode?
7. Is Claude retained for critique, or should the provider adapter support multiple hosted and local models at launch?
8. When should a manuscript become a durable draft snapshot: review, explicit save, navigation away, or a time interval?
9. Should optional typewriter sound and monospaced typography be included after the silent experience is validated?

## 20. Decisions already made

- The product is personal and single-author first.
- Writing is the central interface.
- Reflection shows one pathway at a time.
- The fixed writing position targets approximately 42% of viewport height.
- Anime.js powers a restrained six-behavior motion system.
- Active work and recent drafts use versioned local browser storage.
- Review is separate from the manuscript rather than chat-based.
- Topic discovery must stop depending on Claude.
- A multi-source scheduled pipeline is preferred over RSS alone.
- Hugging Face is used for optional local enrichment rather than as a required hosted content source.
- Refresh prioritizes unseen topics but does not pretend sources changed when they did not.
- Static, free, low-maintenance hosting remains a product constraint.
