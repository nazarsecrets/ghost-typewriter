// Curated Evergreen prompt desk — the honest offline fallback (PRD FR-2.6).
//
// This is NOT current material and never claims to be: category is always
// "Evergreen", every prompt has a stable id, and there are no synthetic "since"
// labels. The real, source-backed current topics come from public/topics.json,
// produced by the scheduled pipeline. This desk shows only when no valid
// manifest is available, or as a deliberate "Evergreen prompts" mode.

export type Tag = "Systems" | "Research" | "AI" | "Leadership" | "Process" | "Ethics";

export type CuratedTopic = {
  id: string;
  title: string;
  teaser: string;
  tag: Tag;
  origin: "curated";
  category: "Evergreen";
  editorialVersion?: string;
};

type Seed = { id: string; title: string; teaser: string; tag: Tag };

// The pool. Grows freely — add rows, selection logic is unaffected.
// Stable ids never change once assigned (they drive seen-history rotation).
const POOL: Seed[] = [
  { id: "sys-1", tag: "Systems", title: "Design systems are becoming less about components.", teaser: "When agents consume the system, what is the system for?" },
  { id: "sys-2", tag: "Systems", title: "The token layer is quietly eating the component layer.", teaser: "Teams ship variables faster than they ship parts." },
  { id: "sys-3", tag: "Systems", title: "Every design system ends up encoding a politics.", teaser: "Who gets to add a component, and who has to ask?" },
  { id: "sys-4", tag: "Systems", title: "Consistency stopped being the hard part.", teaser: "The hard part is knowing when to break your own rules." },

  { id: "res-1", tag: "Research", title: "Research debt is becoming visible.", teaser: "The insights were there. Nobody could find them in time." },
  { id: "res-2", tag: "Research", title: "Continuous discovery quietly became a compliance ritual.", teaser: "Weekly interviews, but when did anything change because of one?" },
  { id: "res-3", tag: "Research", title: "The best research artifact is often a changed mind, not a report.", teaser: "How do you ship a conviction?" },
  { id: "res-4", tag: "Research", title: "Synthesis is the skill nobody teaches.", teaser: "Everyone can run the interview. Few can hear it." },

  { id: "ai-1", tag: "AI", title: "The prototype is becoming the specification.", teaser: "When the mock runs, what is left for the spec to say?" },
  { id: "ai-2", tag: "AI", title: "Designing for models means designing for uncertainty.", teaser: "The output isn't a state you can draw once." },
  { id: "ai-3", tag: "AI", title: "Prompt fields are the new empty state.", teaser: "A blank box asking users to imagine what's possible." },
  { id: "ai-4", tag: "AI", title: "AI made the interface optional. That's the problem.", teaser: "If the model can just do it, what were we designing?" },

  { id: "lead-1", tag: "Leadership", title: "Design leadership is drifting from taste to translation.", teaser: "The job became explaining design to everyone who isn't." },
  { id: "lead-2", tag: "Leadership", title: "Managing designers now means managing model output too.", teaser: "Half the critique is aimed at something nobody drew." },
  { id: "lead-3", tag: "Leadership", title: "The design org keeps getting reorganized around the roadmap.", teaser: "Craft survives the reorg or it doesn't." },
  { id: "lead-4", tag: "Leadership", title: "Seniority stopped meaning 'makes the artifact'.", teaser: "So what does a senior designer actually do all day?" },

  { id: "proc-1", tag: "Process", title: "Handoff was never the bottleneck.", teaser: "The bottleneck was shared understanding, and it still is." },
  { id: "proc-2", tag: "Process", title: "Velocity metrics are reshaping what designers make.", teaser: "You optimize for the thing you're measured on." },
  { id: "proc-3", tag: "Process", title: "The double diamond is a story we tell after the fact.", teaser: "Real projects don't diverge and converge on schedule." },
  { id: "proc-4", tag: "Process", title: "Documentation is where design decisions go to die.", teaser: "Written down, then never read, then relitigated." },

  { id: "eth-1", tag: "Ethics", title: "Dark patterns went quiet, not away.", teaser: "The manipulation got more polite and harder to name." },
  { id: "eth-2", tag: "Ethics", title: "Accessibility is being reframed as a growth lever.", teaser: "Is that a win, or did we lose the argument that mattered?" },
  { id: "eth-3", tag: "Ethics", title: "Consent flows are designed to be skipped.", teaser: "We A/B tested our way out of informed consent." },
  { id: "eth-4", tag: "Ethics", title: "Personalization and surveillance share a codebase.", teaser: "The line is a product decision, not a technical one." },
];

// Deterministic PRNG so the same seed always yields the same desk.
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dayNumber(date = new Date()): number {
  return Math.floor(date.getTime() / 86_400_000);
}

// Pick six Evergreen prompts: tag-diverse first, deprioritizing seen ids.
// `offset` advances on manual refresh; `seen` rotates without hard repetition.
export function curatedDesk(offset = 0, seen: Set<string> = new Set(), date = new Date()): CuratedTopic[] {
  const rand = mulberry32(dayNumber(date) * 1000 + offset);
  // Unseen first, then seen — both shuffled deterministically.
  const pool = shuffled(POOL, rand);
  const order = [...pool.filter((s) => !seen.has(s.id)), ...pool.filter((s) => seen.has(s.id))];

  const picked: Seed[] = [];
  const usedTags = new Set<Tag>();
  for (const seed of order) {
    if (picked.length === 6) break;
    if (usedTags.has(seed.tag)) continue;
    picked.push(seed);
    usedTags.add(seed.tag);
  }
  for (const seed of order) {
    if (picked.length === 6) break;
    if (!picked.includes(seed)) picked.push(seed);
  }

  return picked.map((seed) => ({ ...seed, origin: "curated", category: "Evergreen" }));
}
