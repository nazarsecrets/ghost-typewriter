# SVR Ghostwriter

A personal writing environment for turning current UX ideas into grounded, reflective articles.

The V1 flow is: **Today → Reflect → Write → Review → Refine → Export**.

## Run locally

```sh
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
npm install
npm run dev
```

The browser calls the local Vite proxy at `/api/anthropic`; the API key stays in the development server environment.

## Validate

```sh
npm run build
```

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the interaction model, design system, and remaining production-hosting work.

See [PRD.md](./PRD.md) for the complete product requirements, inspiration-intelligence logic, acceptance criteria, risks, and release plan.
