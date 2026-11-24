/**
 * Draft memory: find the writer's own earlier passages that touch what they are
 * writing now. Runs entirely on this device over saved drafts; nothing is sent.
 *
 * Phase 1 is lexical (BM25 over paragraphs) so it is free, instant, offline and
 * explainable: every match names the words it shares. Embeddings can replace
 * `score` later behind the same `recallPassages` interface.
 */

export type MemoryDraft = { id: string; title: string; content: string; updatedAt: string };
export type Recollection = { draftId: string; title: string; updatedAt: string; paragraph: number; passage: string; shared: string[] };

const STOP = new Set(("a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each even every few for from further get got had has have having he her here hers him his how i if in into is it its itself just like make made many me might more most much must my myself no nor not now of off on once one only or other our ours out over own really same she should so some something such than that the their them then there these they thing things this those through to too under until up us very was we were what when where which while who whom why will with would yet you your yours " +
  "able actually always around back become came come done else ever going gone keep kind know let lot maybe means never often put rather said say see seem seems still take tell think thought though told took try want way well went work").split(/\s+/));

/** Light suffix folding so "decisions" meets "decision" and "designing" meets "design". */
export function stem(word: string) {
  if (word.length > 5 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  for (const suffix of ['ingly', 'edly', 'ing', 'ed', 'es', 's']) {
    if (word.length - suffix.length >= 4 && word.endsWith(suffix)) return word.slice(0, -suffix.length);
  }
  return word;
}

export function terms(text: string) {
  return (text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z][a-z'-]*[a-z]|[a-z]/g) ?? [])
    .map(word => word.replace(/'s$/, ''))
    .filter(word => word.length > 2 && !STOP.has(word))
    .map(stem);
}

type Unit = { draft: MemoryDraft; paragraph: number; passage: string; counts: Map<string, number>; length: number; surface: Map<string, string> };

function units(drafts: MemoryDraft[]): Unit[] {
  return drafts.flatMap(draft => draft.content.split(/\n\s*\n/).map((passage, paragraph) => {
    const counts = new Map<string, number>(); const surface = new Map<string, string>();
    const words = passage.toLowerCase().match(/[a-z][a-z'-]*[a-z]|[a-z]/g) ?? [];
    let length = 0;
    for (const word of words) {
      const [term] = terms(word); if (!term) continue;
      length++; counts.set(term, (counts.get(term) ?? 0) + 1);
      if (!surface.has(term)) surface.set(term, word.replace(/'s$/, ''));
    }
    return { draft, paragraph, passage: passage.trim(), counts, length, surface };
  })).filter(unit => unit.length >= 6);
}

/**
 * Returns up to `limit` passages from other drafts, at most one per draft,
 * best first. A passage must share at least `minShared` distinct meaningful
 * words with the query, so thin coincidences never surface.
 */
export function recallPassages(query: string, drafts: MemoryDraft[], options: { excludeId?: string; limit?: number; minShared?: number } = {}): Recollection[] {
  const { excludeId, limit = 3, minShared = 3 } = options;
  const queryTerms = new Map<string, number>();
  for (const term of terms(query)) queryTerms.set(term, (queryTerms.get(term) ?? 0) + 1);
  if (queryTerms.size < minShared) return [];
  const corpus = units(drafts.filter(draft => draft.id !== excludeId && draft.content.trim()));
  if (!corpus.length) return [];
  const average = corpus.reduce((sum, unit) => sum + unit.length, 0) / corpus.length;
  const frequency = new Map<string, number>();
  for (const unit of corpus) for (const term of unit.counts.keys()) frequency.set(term, (frequency.get(term) ?? 0) + 1);
  const k1 = 1.2, b = 0.75, n = corpus.length;
  const scored = corpus.map(unit => {
    let score = 0; const shared: string[] = [];
    for (const [term, weight] of queryTerms) {
      const tf = unit.counts.get(term); if (!tf) continue;
      const df = frequency.get(term) ?? 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * unit.length / average)) * Math.min(weight, 3);
      shared.push(unit.surface.get(term) ?? term);
    }
    return { unit, score, shared };
  }).filter(item => item.shared.length >= minShared).sort((a, b) => b.score - a.score || b.unit.draft.updatedAt.localeCompare(a.unit.draft.updatedAt));
  const seen = new Set<string>(); const results: Recollection[] = [];
  for (const { unit, shared } of scored) {
    if (seen.has(unit.draft.id)) continue;
    seen.add(unit.draft.id);
    results.push({ draftId: unit.draft.id, title: unit.draft.title, updatedAt: unit.draft.updatedAt, paragraph: unit.paragraph + 1, passage: unit.passage, shared: shared.slice(0, 5) });
    if (results.length === limit) break;
  }
  return results;
}
