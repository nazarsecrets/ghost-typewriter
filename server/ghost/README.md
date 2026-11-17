# Ghost reading proxy

The selected hosted route is GitHub Pages plus Cloudflare Workers AI. The Worker uses the AI binding with fixed `@cf/qwen/qwen3.8-27b`, server-owned instructions, validated editorial slips, a 64 KiB request cap, and six requests per minute per IP. No provider key is needed in the browser.

Wrangler OAuth was verified and `ghostwriter-reading` deployed on 2026-11-17:
`https://ghostwriter-reading.svr-ghostwriter.workers.dev/read`
Version: `fa493932-707a-48e6-bf92-9029e3590e4b`.

Live API validation passed on 2026-11-17: disposable text returned HTTP 200 with a validated `{ slip }`; blocked origin returned 403 and allowed preflight 204. The initial TLS propagation failure is resolved. Hosted browser validation is recorded in `GHOST_VALIDATION.md`.

1. Keep `ALLOWED_ORIGIN` set to the exact Pages origin, `https://nazarsecrets.github.io`.
2. Deploy with `wrangler deploy --config server/ghost/wrangler.jsonc` from the repository root.
3. Verify a disposable reading and blocked-origin/rate-limit behavior.
4. Set the repository variable `VITE_GHOST_API_URL` to the endpoint above, then publish the prepared Pages workflow after live validation passes.

CORS is not authentication. The rate limiter is approximate and does not establish a global spending cap. This route depends on Cloudflare hosting and its available AI allowance; model licensing and hosting terms are separate. Anchors and writing work without AI. Neither app nor Worker logs manuscript content.
