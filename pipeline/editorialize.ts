// Deterministic source -> signal -> provocation layer.
// Sources establish that a subject is current; human-authored frames turn that
// signal into an original question. No hosted model or copied source prose.

import type { Cluster, EditorialLens, Tag } from "./types.ts";
import { jaccard, normalizeTitle } from "./util.ts";

type Theme = {
  title: string;
  lens: EditorialLens;
  keywords: string[];
  provocations: string[];
};

const LENS_BY_TAG: Record<Tag, EditorialLens> = {
  Systems: "Design",
  Research: "Design",
  AI: "Technology",
  Leadership: "Self",
  Process: "Ways of Working",
  Ethics: "Industry",
};

const THEMES: Theme[] = [
  {
    title: "Design systems and judgment",
    lens: "Design",
    keywords: ["design system", "component", "token", "library", "figma"],
    provocations: [
      "When does consistency stop helping a team think clearly?",
      "What judgment should a design system preserve rather than automate?",
      "Who gets to decide when the system should be broken?",
    ],
  },
  {
    title: "Research that changes work",
    lens: "Design",
    keywords: ["research", "interview", "insight", "discovery", "participant", "usability"],
    provocations: [
      "What makes an insight powerful enough to change a team's direction?",
      "When does research create understanding, and when does it merely create evidence?",
      "Which part of research work most often disappears between learning and deciding?",
    ],
  },
  {
    title: "Designing with uncertain systems",
    lens: "Technology",
    keywords: ["ai", "agent", "model", "llm", "generative", "machine learning", "copilot"],
    provocations: [
      "What should a designer make legible when the system cannot promise the same answer twice?",
      "Where should human judgment remain visible in an AI-assisted workflow?",
      "How does product responsibility change when an interface can act on a person's behalf?",
    ],
  },
  {
    title: "Prototypes as decisions",
    lens: "Design",
    keywords: ["prototype", "prototyping", "mockup", "wireframe", "proof of concept"],
    provocations: [
      "When does a prototype begin making decisions the team has not discussed?",
      "What becomes easier to misunderstand when a prototype feels complete?",
      "Which question should a prototype answer before it starts persuading people?",
    ],
  },
  {
    title: "Access as a product choice",
    lens: "Industry",
    keywords: ["accessibility", "accessible", "inclusive", "wcag", "disability"],
    provocations: [
      "What changes when accessibility is treated as a design premise rather than a final check?",
      "Whose experience reveals the assumptions hidden in a supposedly simple flow?",
      "When does an accessibility compromise become a product decision rather than a technical constraint?",
    ],
  },
  {
    title: "Consent and product incentives",
    lens: "Industry",
    keywords: ["privacy", "consent", "surveillance", "tracking", "dark pattern", "personalization"],
    provocations: [
      "What does meaningful consent look like when the product benefits from a quick yes?",
      "Where does personalization become a decision made about people rather than for them?",
      "Which product incentive makes an ethical design choice hardest to defend?",
    ],
  },
  {
    title: "The work around the artifact",
    lens: "Ways of Working",
    keywords: ["handoff", "workflow", "collaboration", "documentation", "process", "developer", "engineering"],
    provocations: [
      "Which part of collaboration matters most but leaves the least visible artifact?",
      "When does a workflow protect shared understanding, and when does it replace it?",
      "What keeps getting lost between a design decision and its implementation?",
    ],
  },
  {
    title: "Leadership through uncertainty",
    lens: "Self",
    keywords: ["leadership", "manager", "career", "senior", "team", "organization", "organisation"],
    provocations: [
      "What kind of clarity can a design leader provide without pretending to have certainty?",
      "Which part of senior design work is important precisely because it is hard to point to?",
      "When should a leader protect the team's judgment instead of accelerating its output?",
    ],
  },
  {
    title: "Interfaces and attention",
    lens: "Design",
    keywords: ["interface", "interaction", "navigation", "mobile", "app", "website", "visual design"],
    provocations: [
      "What is the interface asking people to notice, and what does it teach them to ignore?",
      "When does making an interaction easier also make its consequences harder to see?",
      "Which interface choice quietly determines how a person understands the whole product?",
    ],
  },
  {
    title: "Automation and control",
    lens: "Technology",
    keywords: ["automation", "automated", "autonomous", "robot", "tool", "software"],
    provocations: [
      "What control should never disappear simply because a task can be automated?",
      "When does convenience make a system's judgment harder to question?",
      "Which part of the work should automation make more visible rather than remove?",
    ],
  },
];

const FALLBACKS: Record<Tag, { title: string; provocations: string[] }> = {
  Systems: { title: "Rules and exceptions", provocations: ["Which rule helps the work scale, and which exception keeps it honest?"] },
  Research: { title: "Evidence and conviction", provocations: ["What would have to be learned before your opinion on this should change?"] },
  AI: { title: "Human judgment in technology", provocations: ["Where should human judgment remain visible as this technology enters the work?"] },
  Leadership: { title: "The shape of responsibility", provocations: ["What responsibility becomes easier to overlook as this kind of work changes?"] },
  Process: { title: "How the work gets made", provocations: ["Which assumption about how this work gets done deserves to be questioned?"] },
  Ethics: { title: "Product choices and power", provocations: ["Who gains agency from this product choice, and who quietly gives some up?"] },
};

function pickIndex(id: string, length: number): number {
  const parsed = Number.parseInt(id.slice(0, 8), 16);
  return (Number.isFinite(parsed) ? parsed : id.length) % length;
}

function detectTheme(cluster: Cluster): Theme | null {
  const text = cluster.items.map((item) => `${item.title} ${item.description}`).join(" ").toLowerCase();
  let winner: { theme: Theme; score: number } | null = null;
  for (const theme of THEMES) {
    const score = theme.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > 0 && (!winner || score > winner.score)) winner = { theme, score };
  }
  return winner?.theme ?? null;
}

function overlapsSource(prompt: string, cluster: Cluster): boolean {
  const normalizedPrompt = normalizeTitle(prompt);
  return cluster.items.some((item) => jaccard(normalizedPrompt, normalizeTitle(item.title)) >= 0.55);
}

export function editorialize(cluster: Cluster): {
  title: string;
  provocation: string;
  whyNow: string;
  lens: EditorialLens;
} {
  const theme = detectTheme(cluster);
  const fallback = FALLBACKS[cluster.tag];
  const candidates = theme?.provocations ?? fallback.provocations;
  const selected = candidates[pickIndex(cluster.id, candidates.length)];
  const provocation = overlapsSource(selected, cluster) ? fallback.provocations[0] : selected;
  const sourceSignal = cluster.items.length > 1 ? "Several recent sources are" : "A recent source is";
  const title = theme?.title ?? fallback.title;

  return {
    title,
    provocation,
    whyNow: `${sourceSignal} raising questions about ${title.toLowerCase()} across product and design work.`,
    lens: theme?.lens ?? LENS_BY_TAG[cluster.tag],
  };
}
