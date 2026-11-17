import { GHOST_SYSTEM, LENSES, parseSlip } from '../../src/ghostModel.ts';

export const MODEL = '@cf/qwen/qwen3.8-27b';
// Cloudflare AI binding: no provider credential or manuscript logging.
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    const json = (body, status = 200) => Response.json(body, { status, headers: cors });
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403 });
    if (new URL(request.url).pathname !== '/read') return json({ error: 'Not found' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!env.AI || !env.RATE_LIMITER) return json({ error: 'Reading is not configured' }, 503);
    if (!(await env.RATE_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' })).success) return json({ error: 'Ghost has reached its reading limit. Try again later. Your draft is safe.' }, 429);
    if (!request.headers.get('Content-Type')?.includes('application/json')) return json({ error: 'Expected JSON' }, 415);
    if (Number(request.headers.get('Content-Length')) > 65536) return json({ error: 'Text too long' }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Empty request' }, 400);
    let length = 0; const chunks = [];
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 65536) { await reader.cancel(); return json({ error: 'Text too long' }, 413); }
      chunks.push(value);
    }
    let context;
    try {
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      context = JSON.parse(new TextDecoder().decode(bytes)).context;
    } catch { return json({ error: 'Invalid JSON' }, 400); }
    const actions = [...LENSES, 'Check my frame', "Editor's slip"];
    const string = (value, max) => typeof value === 'string' && value.length <= max;
    if (!context || !actions.includes(context.action) || !['this draft', 'this passage'].includes(context.scope) || !string(context.title, 1000) || !['article', 'linkedin'].includes(context.mode) || !['reflective', 'editorial'].includes(context.tone) || !string(context.reader, 350) || !string(context.northStar, 350) || !Array.isArray(context.paragraphs) || !context.paragraphs.length || context.paragraphs.length > 1000 || !context.paragraphs.every((p, i) => p.number === i + 1 && string(p.text, 45000)) || !Array.isArray(context.beats) || context.beats.length > 6 || !context.beats.every(b => string(b.label, 100) && string(b.question, 2000)) || (context.action === 'Check my frame' && !context.beats.length)) return json({ error: 'Invalid reading request' }, 400);
    const text = context.paragraphs.map(p => p.text).join('\n\n');
    if (!text.trim() || text.length > 45000) return json({ error: 'Select a shorter passage to read' }, 413);
    // Whitelist context fields. Client instructions, model names, token budgets,
    // tools and provider options never reach inference.
    const input = { action: context.action, scope: context.scope, title: context.title, mode: context.mode, tone: context.tone, reader: context.reader, northStar: context.northStar, beats: context.action === 'Check my frame' ? context.beats : [], paragraphs: context.paragraphs.map(({ number, text }) => ({ number, text })) };
    let timer;
    try {
      const data = await Promise.race([
        env.AI.run(MODEL, {
          messages: [{ role: 'system', content: GHOST_SYSTEM }, { role: 'user', content: JSON.stringify(input) }],
          response_format: { type: 'json_object' }, max_completion_tokens: 1800, reasoning_effort: 'low', stream: false, store: false
        }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 40000); })
      ]);
      const raw = data.choices?.[0]?.message?.content ?? data.response;
      if (typeof raw !== 'string') return json({ error: 'Ghost could not finish this reading. Please try again.' }, 502);
      const slip = parseSlip(raw, text, context.action, input.beats.map(b => b.label), context.paragraphs.length);
      return json({ slip });
    } catch (error) {
      if (/quota|neurons|limit|capacity|429/i.test(error instanceof Error ? error.message : '')) return json({ error: 'Ghost has reached its reading limit. Try again later. Your draft is safe.' }, 429);
      return json({ error: "Ghost couldn't read this just now. Your draft is safe." }, error?.message === 'timeout' ? 504 : 502);
    } finally { clearTimeout(timer); }
  }
};
