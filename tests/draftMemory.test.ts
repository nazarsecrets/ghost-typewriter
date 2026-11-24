import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recallPassages, stem, terms } from '../src/draftMemory';

const drafts = [
  { id: 'current', title: 'Now', updatedAt: '2026-11-20T00:00:00Z', content: 'Our design system tokens drifted while the research backlog grew.' },
  { id: 'march', title: 'Tokens and trust', updatedAt: '2026-03-04T00:00:00Z', content: 'An opening paragraph about the weather and nothing in particular today.\n\nWhen the design system tokens drifted, the research team stopped trusting the components and rebuilt them by hand in every file.' },
  { id: 'may', title: 'Interviews', updatedAt: '2026-05-10T00:00:00Z', content: 'Customer interviews taught me to wait through silence before asking the next question in the session.' },
];

test('terms drop stopwords and fold simple suffixes', () => {
  assert.deepEqual(terms('The designers were designing decisions'), ['designer', 'design', 'decision']);
  assert.equal(stem('stories'), 'story');
  assert.equal(stem('this'), 'this');
});

test('recall finds the related paragraph in another draft and names shared words', () => {
  const [match, ...rest] = recallPassages('design system tokens drifted research', drafts, { excludeId: 'current' });
  assert.equal(match.draftId, 'march'); assert.equal(match.paragraph, 2);
  assert.ok(match.passage.startsWith('When the design system'));
  assert.ok(match.shared.includes('tokens') && match.shared.includes('research'));
  assert.equal(rest.length, 0, 'unrelated drafts stay out');
});

test('recall never returns the current draft and stays silent on thin overlap', () => {
  assert.ok(recallPassages(drafts[0].content, drafts, { excludeId: 'current' }).every(r => r.draftId !== 'current'));
  assert.deepEqual(recallPassages('tokens', drafts, { excludeId: 'current' }), []);
  assert.deepEqual(recallPassages('design system tokens', [], {}), []);
});

test('at most one passage per draft and the limit holds', () => {
  const many = Array.from({ length: 6 }, (_, i) => ({ id: `d${i}`, title: `D${i}`, updatedAt: `2026-0${i + 1}-01T00:00:00Z`, content: 'design system tokens drifted and research slowed the components work again.\n\ndesign system tokens drifted again for the research components team.' }));
  const results = recallPassages('design system tokens drifted research components', many, { limit: 3 });
  assert.equal(results.length, 3); assert.equal(new Set(results.map(r => r.draftId)).size, 3);
});
