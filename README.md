# SVR Ghostwriter

An intentional writing environment with an optional AI collaborator for turning current UX ideas into grounded, reflective articles.

The product loop is: **Discover → Choose → Write → Reflect → Ghost → Refine → Draft**.

World supplies things worth noticing. You remain the author. Ghost questions and refines only when invited.

## Run locally

```sh
cp .env.example .env
# Optional: add ANTHROPIC_API_KEY for personalized Reflect/Review
npm install
npm run dev
```

Topic discovery and writing do not require an API key. Optional local AI requests use the Vite proxy at `/api/anthropic`; the key stays in the development server environment.

Current sources are converted into original, lens-based questions by a deterministic local pipeline. Article headlines are kept only as provenance behind each prompt; no hosted model is needed to generate the Today desk.

Each build also records how every source reached its question in `data/editorial-review.json`. `npm run topics:review` lists the weak matches (no theme found, a theme supported only by the description, or two themes tied), the keywords behind them, and the questions carried by more than two topics. To overrule a match, add an entry to `data/editorial-verdicts.json` and rebuild:

```json
[
  { "id": "41b123757eeb", "verdict": "retheme", "theme": "Research that changes work", "note": "about method, not leadership" },
  { "id": "169857c0668c", "verdict": "drop", "note": "not a design question" }
]
```

`id` is the topic id shown by the review; `theme` must be an existing theme title in `pipeline/editorialize.ts`. A verdict changes only the frame or whether the topic appears; dates, sources, and category reasons always come from the source.

## Validate

```sh
npm run build
```

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the interaction model, design system, and remaining production-hosting work.

See [PRD.md](./PRD.md) for the complete product requirements, inspiration-intelligence logic, acceptance criteria, risks, and release plan.
