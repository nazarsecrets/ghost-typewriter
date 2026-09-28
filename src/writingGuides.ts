import copy from "./writingGuideCopy.json";
import type { DisplayTopic } from "./topicSource";

const LABELS = ["Memory", "Tension", "Outcome", "System", "People"] as const;
export type WritingGuide = { label: typeof LABELS[number]; text: string };

// Match the actual provocation, not its broad tag or source headline. Multiple
// provocations within one theme need different angles. Curated IDs are stable.
// Derive at render time so restored drafts never retain another topic's guides.
export function writingGuides(topic: DisplayTopic | null): WritingGuide[] {
  if (!topic) return [];
  const key = topic.origin === "source-backed" ? topic.provocation : topic.id;
  const authored = (copy as Record<string, string[]>)[key];
  const prompt = topic.origin === "source-backed" ? topic.provocation : topic.title;
  // Older saved topics or newly added prompts remain usable without an AI call.
  // Unknown prompts are explicitly anchored to their question, not misclassified.
  const lines = authored ?? [
    `What experience from your work brings “${prompt}” into focus?`,
    "Which part of your answer would a colleague with a different experience challenge?",
    "What observed result supports your answer, and what remains uncertain?",
    "Which rule or incentive shaped the example you are using to answer this?",
    "Whose perspective is missing from your answer to this question?",
  ];
  return LABELS.map((label, index) => ({ label, text: lines[index] }));
}
