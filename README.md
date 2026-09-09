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

## Validate

```sh
npm run build
```

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the interaction model, design system, and remaining production-hosting work.

See [PRD.md](./PRD.md) for the complete product requirements, inspiration-intelligence logic, acceptance criteria, risks, and release plan.
