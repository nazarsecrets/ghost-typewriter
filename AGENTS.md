# SVR Ghostwriter — Codex Agent Guide

Follow the product and engineering guidance in [CLAUDE.md](./CLAUDE.md). The
rules below are mandatory for Codex and any sub-agent working in this repo.

## Canonical docs (read before non-trivial work)

- **[PRD.md](./PRD.md)** — product requirements (authoritative).
- **[TRACKER.md](./TRACKER.md)** — live status: done / in progress / next.
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** — direction and rationale.
- **[POC.md](./POC.md)** — current proof-of-concept scope.

## Tracker rule (mandatory for every agent and every session)

`TRACKER.md` is the project's source of truth for progress and must remain
current as part of the work:

1. **Before starting**, read `TRACKER.md`. Work the `🎯 Next action` unless the
   user directs otherwise.
2. **When starting** a tracked item, move or add it under `🔄 In progress`.
3. **After every meaningful UX or development action**, update the tracker in
   the same task. A meaningful action is a completed unit that changes code,
   product behavior, UX direction, requirements, validation evidence, or scope;
   read-only inspection does not need its own entry.
4. Classify new entries as **[UX]**, **[Dev]**, or **[UX+Dev]**.
5. **When finishing** an item, move it to `✅ Completed` with today's date, a
   ready-to-use commit message, and a one-line outcome, then confirm or replace
   the `🎯 Next action`.
   Format every Completed entry so its commit message is the first thing to
   copy — a fenced `text` block directly under the date/label line, before the
   outcome:

   ````markdown
   - ✅ **YYYY-MM-DD [UX+Dev]**
     ```text
     Imperative subject line, 72 characters or fewer

     Optional body: what changed and why, wrapped at 72 columns.
     ```
     One-line outcome, with validation evidence.
   ````

   The message describes only that item's changes, so the author can commit it
   as-is. Write it; don't run `git commit` unless the author asks.
6. **When scope changes**, update the corresponding `⬜ Pending` entries.
7. Always update `_Last updated:_` whenever the tracker changes.
8. If work made no tracked progress, state that explicitly rather than creating
   a false completion entry.

Sub-agents follow the same rule. Updating `TRACKER.md` is the final step of any
task that changes project state. Do not hand off work with a stale tracker.

## Shared constraints

- Topic discovery must remain free and provider-independent.
- Curated Evergreen prompts must never be presented as live or source-backed.
- Motion uses the restrained Anime.js language and respects reduced motion.
- Secrets must never be included in the client bundle.
