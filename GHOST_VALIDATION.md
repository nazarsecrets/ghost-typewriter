# Ghost implementation validation — 2026-11-11

Implementation follows `GHOST_INVOCATION.md`. All AI responses used in browser checks were intercepted fixtures containing disposable text. These checks do not establish live model quality or author comfort.

## Evidence

- `npm run build`: guide coverage, TypeScript and production bundle pass. Ghost is a lazy UI chunk; GSAP is a separate chunk loaded only for author-triggered Ghost motion. The production build does not claim the development proxy is a production connection.
- `node --import tsx --test tests/ghost.test.ts tests/ghost-proxy.test.mjs`: five tests pass for original/prompted defaults, six frames, actual quoted evidence, two-question and 180-word limits, mechanics restricted to full review, complete frame maps and real paragraph references. Proxy tests cover origin/path/body limits, rate rejection, server-only key, upstream model/token controls, and sanitized failures.
- Browser: original reading defaults on; reading off prevents requests; enabling reading sends nothing; draft-first locks explain how to release them; setup, reading choice and frame survive reload. A selected passage alone is sent for a lens, while Check my frame uses the full draft. Escape restores exact textarea selection and focus. New edits mark the previous slip stale.
- Browser: all five lenses render structured slips; full-review mechanics start folded. Malformed provider output preserves the previous result; retry succeeds. Offline reading sends no request. Closing during loading cancels the request and does not reopen Ghost.
- Browser: North star and parked notes remain visible; ticking a beat reveals the next authored question. Switching any of the six frames or dropping a frame never modifies prose. Prompted drafts start with reading off and their five guides as anchors. Original and prompted drafts recover their own settings when reopened. Ghost is absent from Reflect.
- Layout: at 320, 390, 800, 1024, 1111, 1200, 1440 and 1920px, the resting plume is clear of the text column with no horizontal document overflow. A 1440px scroll test measured the exact same plume rectangle before/after 500px document scroll. Ghost is outside the manuscript's transformed entrance container.
- Axe checks: desktop menu and slip passed; the mobile menu's duplicate banner was fixed by using a generic dialog heading rather than another page header. Final regression passed: mobile menu axe clean, no transform under reduced motion, no sheet overlap with the manuscript scroll region, keyboard cycling, and immediate paragraph creation after closing Ghost. A delayed focus-restoration race found during testing was fixed by restoring selection in a layout effect after the dialog is removed.
- Settled screenshots in `output/playwright/ghost-slip-desktop.png`, `ghost-menu-desktop.png`, and `ghost-menu-phone.png` are local QA artifacts, excluded from Git by the existing `output/` rule.

## Layout clarifications adopted during implementation

Anchors sit above the low plume, rather than below the viewport edge. The plume remains available when AI is unconfigured so anchors are reachable. Medium/narrow layouts use a bottom sheet and reserve a separately scrolling manuscript region above it. Narrow layouts reserve right-side space for the plume. The native animated Plume cursor stays unwired. Existing saved Review text remains readable; new critique uses the slip and never requests rewritten prose.

## Outstanding external validation

Cloudflare Workers AI is now the selected hosted route. On 2026-11-17, network-enabled Wrangler OAuth verification succeeded and `ghostwriter-reading` deployed at `https://ghostwriter-reading.svr-ghostwriter.workers.dev/read` (version `fa493932-707a-48e6-bf92-9029e3590e4b`). All six current contract tests and the production build passed. Initial TLS propagation resolved. A disposable live reading returned HTTP 200 with a structured `{ slip }`; blocked origin returned 403 and allowed preflight 204. GitHub Pages Actions hosting and the public endpoint variable are configured; publication and hosted browser validation passed. Earlier browser evidence above is fixture-backed and predates the current `{ slip }` hosted contract. The former Anthropic template prose is superseded by the AI binding implementation.

A production preview without any AI configuration also passed: setup axe, static frames/ticks, clear unconfigured-lens copy, manuscript editing, exports available, and no GSAP resource loaded before interaction.

Real-provider sampling must check constructive specificity, no replacement prose, useful questions, response reliability under the schema, latency, and reading consent. Real mobile keyboard behavior and the author's motion/comfort verdict also remain unverified.

Reference documentation checked: [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context/), [Cloudflare rate-limiting bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). Rate limiting is approximate and per Cloudflare location, not a global spending cap.

## Hosted publication — 2026-11-17

- Pages workflow run `44171027143` passed build, all six Ghost tests and deployment for commit `89492ec`. Public app: https://nazarsecrets.github.io/ghost-typewriter/ . Project subpath assets load and the manuscript opens.
- Direct live reading with disposable text returned HTTP 200 and `{ slip }`. Blocked-origin check: 403; allowed-origin preflight: 204.
- Remote rate-limit observation remains inconclusive: seven then twenty invalid curl requests returned 400 without an observed 429. Python clients were rejected by Cloudflare with 1010 before reaching application validation. The local binding-rejection test passes; this is not evidence of a hard global rate cap.
- Hosted browser: created an original disposable draft, skipped setup, explicitly invoked “Question my argument,” and received a rendered live editorial slip with a verbatim quote. The manuscript remained unchanged. Screenshot: `output/playwright/ghost-hosted-slip.png`. This verifies the current `{ slip }` browser contract.
