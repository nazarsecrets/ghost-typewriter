# SVR Ghostwriter

An intentional writing environment with an optional AI collaborator for turning current UX ideas into grounded, reflective articles.

The product loop is: **Discover → Choose → Write → Reflect → Ghost → Refine → Draft**.

World supplies things worth noticing. You remain the author. Ghost questions and refines only when invited.

## Start writing

Open [Ghostwriter](https://nazarsecrets.github.io/ghost-typewriter/). Writing needs no account or AI key.

1. Choose an idea from Today, or select **Start with a blank page →** if you already know what to write.
2. With a topic, write directly beneath its prompt. **Memory, Tension, Outcome, System, and People are angles, not steps**—use any, in any order. You can leave the others alone. The empty first paragraph carries the topic's Memory cue to help you begin; typing replaces the placeholder.
3. Select **Focus on manuscript →** when you want more space. This is the same manuscript, so your writing carries across. Use **Writing guides** to return to the topic's angles.
4. When you return to the guided view with words already in your draft, the angles fold to their labels. Select a label to reveal its guide, **Show all angles** to expand them, or **Fold to labels** to put them away. Mark any angle you have explored using its checkbox; its overstrike is optional, reversible, and saved with that draft. Guides fade to a quieter level once the draft has words, without moving the manuscript. Hover over them or focus a control to read them at full strength.
5. Drafts save in this browser on this device. Check the save status, reopen work through **Drafts**, and use **Export ▾** to copy Markdown or download a copy you can keep elsewhere.

Sound is optional and starts off. Use **Sound on/off** in the header to choose what feels comfortable.

## Invite Ghost when you want a reading

In the focused manuscript, open **Ghost**. Setup is optional; you can skip it and keep writing. Topic-based drafts start with reading off; blank-page drafts start with reading on. You can change **Let Ghost read this draft** for each draft.

Turning reading on sends nothing. Choosing a lens, a frame check, or an editorial review sends the draft or selected passage to the hosted Cloudflare reading service. Choose **Question my argument**, for example, when you want a question about your reasoning. Ghost returns an editorial slip alongside your unchanged words. Static anchors remain available with reading off, and writing and export work without AI.

## Run locally

```sh
npm install
npm run dev
```

Topic discovery and writing do not require an API key. To enable optional hosted Ghost readings locally, copy `.env.example` to `.env`, set `VITE_GHOST_API_URL` to a Worker configured to allow your local app origin, and restart Vite. For a local Worker, use `GHOST_LOCAL=1` with Wrangler on port 8787. See [the Worker setup guide](./server/ghost/README.md). Never put a secret in a `VITE_` variable.

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

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the interaction model, design system, and hosting details.

See [PRD.md](./PRD.md) for the complete product requirements, inspiration-intelligence logic, acceptance criteria, risks, and release plan.
