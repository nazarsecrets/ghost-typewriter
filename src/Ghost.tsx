import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FRAMES, LENSES, ghostBeats, GHOST_SYSTEM, parseSlip, type GhostState, type GhostAction } from './ghostModel';
import type { WritingGuide } from './writingGuides';
import { recallPassages, type MemoryDraft, type Recollection } from './draftMemory';
import './ghost.css';
import { stopWritingScroll } from './motion';

type Props = { drafts: MemoryDraft[]; draftId: string; state: GhostState; onChange: (state: GhostState) => void; title: string; paragraphs: string[]; guides: WritingGuide[]; prompted: boolean; mode: string; tone: string; onMode: (mode: 'article' | 'linkedin') => void; onTone: (tone: 'reflective' | 'editorial') => void; configured: boolean; request: (system: string, content: string, signal: AbortSignal) => Promise<string> };
const SETUP_KEY = 'svr-ghostwriter-ghost-setup';
function setupSeen() { try { return localStorage.getItem(SETUP_KEY) === '1'; } catch { return false; } }
function Plume() { return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path d="M5 28 22 8M10 23C5 13 19 2 28 3c1 9-5 21-18 20Z" stroke="currentColor" strokeWidth="1.3"/><path d="m12 20 9-1m-5-4 8-1m-5-3 6-1M12 20l-1-6" stroke="currentColor" strokeWidth="1.1"/></svg>; }

export default function Ghost(props: Props) {
  const { state, onChange, title, paragraphs, guides, prompted, configured } = props;
  const [seen, setSeen] = useState(setupSeen);
  const [panel, setPanel] = useState<'menu' | 'setup' | 'slip' | 'recall' | null>(null);
  const [recalled, setRecalled] = useState<Recollection[]>([]);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [scope, setScope] = useState('this draft');
  const root = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selection = useRef<{ element: HTMLInputElement | HTMLTextAreaElement; start: number; end: number; direction: 'forward' | 'backward' | 'none'; scroll: number; container: HTMLElement | null; containerScroll: number } | null>(null);
  const passage = useRef('');
  const request = useRef<AbortController | null>(null);
  const lastAction = useRef<GhostAction>("Editor's slip");
  const closing = useRef(false);
  const restoreOnClose = useRef(false);
  const alive = useRef(true);
  const tickCleanup = useRef<(() => void) | null>(null);
  const latest = useRef(props); latest.current = props;
  const beats = ghostBeats(state, guides);
  const currentBeat = beats.find(beat => !state.completed.includes(beat.label));
  const locked = state.habits.draftFirst && !state.firstDraftDone;
  const source = paragraphs.join('\n\n');
  const update = (patch: Partial<GhostState>) => onChange({ ...state, ...patch });

  function remember() {
    const el = document.activeElement;
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement && el.name === 'title') {
      selection.current = { element: el, start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0, direction: el.selectionDirection ?? 'none', scroll: window.scrollY, container: el.closest<HTMLElement>('.manuscript'), containerScroll: el.closest('.manuscript')?.scrollTop ?? 0 };
      passage.current = el instanceof HTMLTextAreaElement ? el.value.slice(el.selectionStart, el.selectionEnd) : '';
    }
  }
  function restore() {
    const saved = selection.current;
    if (saved?.element.isConnected) {
      saved.element.focus({ preventScroll: true });
      saved.element.setSelectionRange(saved.start, saved.end, saved.direction);
      if (saved.container) saved.container.scrollTop = saved.containerScroll;
      window.scrollTo({ top: saved.scroll, behavior: 'instant' });
    } else trigger.current?.focus({ preventScroll: true });
  }
  async function close(restoreFocus = true) {
    if (closing.current || !panel) return;
    closing.current = true;
    request.current?.abort(); setBusy(false);
    const element = paper.current;
    if (element && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try {
      const { gsap } = await import('gsap');
      if (!alive.current || !element.isConnected) return;
      await new Promise<void>(resolve => { gsap.to(element, { clipPath: 'inset(100% 0 0 0)', opacity: 0, duration: .32, ease: 'power2.in', onComplete: resolve, onInterrupt: resolve }); });
      if (trigger.current) gsap.fromTo(trigger.current, { y: -2 }, { y: 0, duration: .2, ease: 'power1.out', clearProps: 'transform' });
      } catch { /* Closing stays available if motion cannot load. */ }
    }
    if (!alive.current) return;
    restoreOnClose.current = restoreFocus;
    setPanel(null); closing.current = false;
  }
  useLayoutEffect(() => {
    if (panel === null && restoreOnClose.current) { restoreOnClose.current = false; restore(); }
  }, [panel]);
  function open() {
    if (panel) { void close(); return; }
    stopWritingScroll(); remember();
    setScope(passage.current ? 'this passage' : 'this draft');
    setMessage(''); setError(false); setStep(1); setPanel(seen ? 'menu' : 'setup');
  }
  function finishSetup() {
    try { localStorage.setItem(SETUP_KEY, '1'); setSeen(true); } catch { setStorageError(true); }
    void close();
  }

  useEffect(() => { alive.current = true; return () => { alive.current = false; request.current?.abort(); tickCleanup.current?.(); }; }, []);
  useEffect(() => {
    if (state.reading) return;
    request.current?.abort(); setBusy(false);
  }, [state.reading]);
  useEffect(() => {
    const viewport = window.visualViewport;
    function keyboard() { root.current?.style.setProperty('--ghost-keyboard', `${Math.max(0, window.innerHeight - (viewport?.height ?? window.innerHeight) - (viewport?.offsetTop ?? 0))}px`); }
    keyboard(); viewport?.addEventListener('resize', keyboard); viewport?.addEventListener('scroll', keyboard);
    return () => { viewport?.removeEventListener('resize', keyboard); viewport?.removeEventListener('scroll', keyboard); };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Enter' && !event.isComposing) { event.preventDefault(); open(); }
      if (event.key === 'Escape' && panel) { event.preventDefault(); event.stopPropagation(); void close(); }
      if (event.key === 'Tab' && panel && paper.current?.contains(document.activeElement)) {
        const controls = Array.from(paper.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, summary, a[href]')).filter(el => el.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const outside = (event: PointerEvent) => {
      if (!panel || root.current?.contains(event.target as Node)) return;
      // Clicking the manuscript chooses a new caret. Do not restore the old one.
      void close(false);
    };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', outside); };
  });
  useLayoutEffect(() => {
    if (!panel || !paper.current) return;
    paper.current.querySelector<HTMLElement>('button, input, select')?.focus({ preventScroll: true });
    let disposed = false;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let revert: (() => void) | undefined;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void import('gsap').then(({ gsap }) => {
        if (disposed || !paper.current) return;
        const context = gsap.context(() => {
          gsap.fromTo(paper.current, { opacity: 0, y: 8, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: panel === 'slip' ? .48 : .24, ease: panel === 'slip' ? 'back.out(0.9)' : 'power2.out', clearProps: 'transform' });
          gsap.fromTo(trigger.current, { rotation: -6, scale: 1.03 }, { rotation: 0, scale: 1, duration: .36, ease: 'back.out(0.9)', clearProps: 'transform' });
          const rows = Array.from(paper.current!.querySelectorAll('.ghost-row'));
          if (panel !== 'slip' && rows.length) gsap.fromTo(rows, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .24, stagger: .03, ease: 'power2.out', clearProps: 'all' });
        }, root);
        revert = () => context.revert();
      }).catch(() => { /* Motion must never prevent reading or editing. */ });
    }
    const reduce = () => { if (media.matches) revert?.(); };
    media.addEventListener('change', reduce);
    return () => { disposed = true; revert?.(); media.removeEventListener('change', reduce); };
  }, [panel, step]);

  async function ask(action: GhostAction) {
    lastAction.current = action; setMessage(''); setError(false);
    if (!state.reading) { setMessage("Ghost isn't reading this draft. Turn reading on to use lenses."); return; }
    if (locked) { setMessage("You asked to finish a first draft before editing. Mark it done when you're ready."); return; }
    if (!configured) { setMessage('Ghost reading is not connected yet. Anchors, writing and exports still work.'); return; }
    if (!navigator.onLine) { setMessage('Ghost needs a connection. Anchors, writing and exports still work.'); setError(true); setPanel('slip'); return; }
    const text = action === "Editor's slip" || action === 'Check my frame' ? source : passage.current || source;
    if (!text.trim()) { setMessage('Write a little first, then invite Ghost to read.'); return; }
    if (action === 'Check my frame' && !beats.length) { setMessage('Choose a frame before asking Ghost to check it.'); return; }
    if (text.length > 45000) { setMessage('This draft is too long for one reading. Select a passage of up to 45,000 characters and choose a lens.'); return; }
    const controller = new AbortController(); request.current?.abort(); request.current = controller;
    setBusy(true); setPanel('slip');
    const snapshot = latest.current;
    const fullScope = action === "Editor's slip" || action === 'Check my frame' || !passage.current;
    const requestScope = fullScope ? 'this draft' : 'this passage';
    setScope(requestScope);
    const timeout = window.setTimeout(() => controller.abort('timeout'), 45000);
    try {
      const raw = await props.request(GHOST_SYSTEM, JSON.stringify({ action, scope: requestScope, title, mode: props.mode, tone: props.tone, reader: state.habits.reader ? state.reader : '', northStar: state.habits.northStar ? state.northStar : '', beats: action === 'Check my frame' ? beats : [], paragraphs: fullScope ? paragraphs.map((text, i) => ({ number: i + 1, text })) : [{ number: 1, text }] }), controller.signal);
      if (controller.signal.aborted || !latest.current.state.reading) return;
      const result = parseSlip(raw, text, action, beats.map(b => b.label), paragraphs.length);
      latest.current.onChange({ ...latest.current.state, slip: { result, source: snapshot.paragraphs.join('\n\n'), title: snapshot.title, action, scope: requestScope } });
    } catch (error) {
      if (!controller.signal.aborted || controller.signal.reason === 'timeout') { setMessage(error instanceof Error && error.message === "reading-limit" ? "Ghost has reached its reading limit. Try again later. Your draft is safe." : "Ghost couldn't read this just now. Your draft is safe."); setError(true); }
    } finally { window.clearTimeout(timeout); if (request.current === controller) setBusy(false); }
  }

  function recall() {
    const query = passage.current || source;
    setMessage(''); setError(false);
    setScope(passage.current ? 'this passage' : 'this draft');
    setRecalled(query.trim() ? recallPassages(query, props.drafts, { excludeId: props.draftId }) : []);
    setPanel('recall');
  }

  function tick(label: string, checked: boolean, element: HTMLElement) {
    update({ completed: checked ? [...state.completed, label] : state.completed.filter(b => b !== label) });
    if (checked && !matchMedia('(prefers-reduced-motion: reduce)').matches) void import('gsap').then(({ gsap }) => { if (!element.isConnected || !alive.current) return; tickCleanup.current?.(); const lift = gsap.fromTo(element, { y: -2 }, { y: 0, duration: .28, ease: 'back.out(0.9)', clearProps: 'transform' }); const path = element.querySelector('.ghost-tick path'); const draw = path ? gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .28, ease: 'power2.out', clearProps: 'strokeDashoffset' }) : null; tickCleanup.current = () => { lift.kill(); draw?.kill(); }; }).catch(() => {});
  }
  const frames = <label className="ghost-field">Writing frame<select value={state.frame} onChange={event => update({ frame: event.target.value, completed: [] })}><option value="">None for now</option>{prompted ? <option value="guides">Your five writing guides</option> : null}{FRAMES.map(f => <option value={f.id} key={f.id}>{f.name}</option>)}</select></label>;
  const habits = <div className="ghost-habits">{([['northStar', 'North star: say your point in one sentence first'], ['reader', 'Name your reader'], ['draftFirst', 'Draft before you edit'], ['park', 'Park the next line']] as const).map(([key, label]) => <label key={key} className="ghost-row"><input type="checkbox" checked={state.habits[key]} onChange={e => update({ habits: { ...state.habits, [key]: e.target.checked } })}/>{label}</label>)}{state.habits.northStar ? <label className="ghost-field">Your north star<input maxLength={350} value={state.northStar} onChange={e => update({ northStar: e.target.value })}/></label> : null}{state.habits.reader ? <label className="ghost-field">Who is this for?<input maxLength={350} value={state.reader} onChange={e => update({ reader: e.target.value })}/></label> : null}{state.habits.park ? <label className="ghost-field">Where will you pick up?<textarea rows={2} maxLength={1000} value={state.park} onChange={e => update({ park: e.target.value })}/></label> : null}</div>;
  const reading = <label className="ghost-row ghost-reading"><input type="checkbox" checked={state.reading} onChange={e => update({ reading: e.target.checked })}/>Let Ghost read this draft <span>{state.reading ? 'On' : 'Off'}</span></label>;
  const slip = state.slip;
  return <div className={`ghost-root ${panel ? 'is-open' : ''} ${panel === 'slip' ? 'has-slip' : ''}`} ref={root}>
    <aside className="ghost-anchors" aria-label="Writing anchors">
      {state.habits.northStar && state.northStar ? <p><span>North star</span>{state.northStar}</p> : null}
      {state.habits.park && state.park ? <p><span>Pick up here</span>{state.park}</p> : null}
      {locked ? <p>Drafting first. My questions wait until you mark First draft done. <button onClick={() => { update({ firstDraftDone: true }); setMessage('First draft done. Lenses are open.'); }}>Mark done</button></p> : null}
      {beats.length ? <details><summary>{state.frame === 'guides' ? 'Writing guides' : FRAMES.find(f => f.id === state.frame)?.name}</summary>{beats.map(beat => <label key={beat.label} className="ghost-beat"><input type="checkbox" checked={state.completed.includes(beat.label)} onChange={e => tick(beat.label, e.target.checked, e.currentTarget.parentElement!)} /><svg className="ghost-tick" aria-hidden="true" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" pathLength="1"/></svg><span>{beat.label}{currentBeat?.label === beat.label ? <small>{beat.question}</small> : null}</span></label>)}</details> : null}
      {!panel && message === 'First draft done. Lenses are open.' ? <p role="status">{message}</p> : null}
    </aside>
    <button ref={trigger} className={`ghost-trigger ${state.reading ? 'is-reading' : ''}`} aria-label={state.reading ? `Ghost: anchors, lenses and review${!seen ? '. Set up' : ''}` : "Ghost isn't reading this draft. Anchors are still available."} aria-expanded={panel !== null} aria-controls={panel ? 'ghost-paper' : undefined} aria-haspopup="dialog" onPointerDown={remember} onClick={open}><Plume/><span>Ghost{!seen ? ' · Set up' : ''}</span></button>
    {panel ? <section ref={paper} id="ghost-paper" className={`ghost-paper ghost-${panel}`} role="dialog" aria-label={panel === 'setup' ? 'Ghost setup' : panel === 'slip' ? "Editor's slip" : panel === 'recall' ? 'From your drafts' : 'Ghost'}>
      <div className="ghost-paper-heading"><span>{panel === 'setup' ? `Ghost · Set up · ${step} of 3` : panel === 'slip' ? "Editor's slip" : panel === 'recall' ? 'From your drafts' : 'Ghost'}</span><button onClick={() => void close()} aria-label="Roll up Ghost">Roll up ↑</button></div>
      {panel === 'setup' ? <>
        {step === 1 ? <><h2>An editor, when you ask.</h2><p>I read only when you let me, I never rewrite your words, and I speak only when you ask.</p>{reading}<p className="ghost-caption">Turning reading on sends nothing. Only a lens, frame check or review sends text.</p></> : null}
        {step === 2 ? <><h2>Give the page a foothold.</h2>{prompted ? <p>This draft already has its five writing guides as its frame.</p> : null}{frames}</> : null}
        {step === 3 ? <><h2>Write on your own terms.</h2><p>Every habit is optional. You can change these later.</p>{habits}</> : null}
        <footer>{step > 1 ? <button onClick={() => setStep(step - 1)}>← Back</button> : null}<button onClick={() => step < 3 ? setStep(step + 1) : finishSetup()}>{step < 3 ? 'Next →' : 'Start writing'}</button><button onClick={finishSetup}>Skip setup</button></footer>
      </> : null}
      {panel === 'menu' ? <>
        <h2>{title || 'Untitled manuscript'}</h2><p className="ghost-caption">{source.trim().split(/\s+/).filter(Boolean).length} words · Working on {scope}</p>{reading}
        {!configured ? <p className="ghost-caption">Reading is not connected. Your anchors work here, on this device.</p> : null}
        {locked ? <button className="ghost-row" onClick={() => { update({ firstDraftDone: true }); setMessage('First draft done. Lenses are open.'); }}>First draft done</button> : null}
        <h3>Anchors</h3>{frames}<button className="ghost-row" onClick={() => void ask('Check my frame')}>Check my frame</button><details><summary>Habits</summary>{habits}</details>
        <h3>Your own words</h3><button className="ghost-row ghost-recall-row" onClick={recall}><span>Find related passages in my other drafts<small>on this device · {scope}</small></span></button>
        <h3>Lenses</h3>{LENSES.map((lens, i) => <button className="ghost-row ghost-lens" key={lens} onClick={() => void ask(lens)}><span>{i + 1}</span><span>{lens}<small>{locked ? 'after your first draft' : scope}</small></span></button>)}
        <h3>Review</h3><label className="ghost-field">Format<select value={props.mode} onChange={e => props.onMode(e.target.value as 'article' | 'linkedin')}><option value="article">Article</option><option value="linkedin">LinkedIn</option></select></label><label className="ghost-field">Editorial tone<select value={props.tone} onChange={e => props.onTone(e.target.value as 'reflective' | 'editorial')}><option value="reflective">Reflective</option><option value="editorial">Editorial</option></select></label><button className="ghost-row" onClick={() => void ask("Editor's slip")}>Editor's slip for the whole draft</button>{slip ? <button className="ghost-row" onClick={() => setPanel('slip')}>Read previous slip</button> : null}
      </> : null}
      {panel === 'slip' ? <>
        <h2>{busy ? lastAction.current : slip?.action ?? lastAction.current}</h2>
        <button className="ghost-back" onClick={() => { request.current?.abort(); setBusy(false); setMessage(''); setError(false); setPanel('menu'); }}>← Anchors and lenses</button>
        {busy ? <p role="status">Reading closely…</p> : null}
        {slip ? <article className="ghost-result"><p className="ghost-caption">{slip.action} · {slip.scope}</p>{slip.source !== source || slip.title !== title ? <p className="ghost-stale">Written for an earlier version of this draft</p> : null}<p>{slip.result.understanding}</p><h3>What's working</h3><blockquote>“{slip.result.strength.quote}”</blockquote><p>{slip.result.strength.note}</p><h3>The one move</h3><p>{slip.result.move.question}</p><p>{slip.result.move.reason}</p>{slip.result.questions.length ? <><h3>Questions to carry</h3><ul>{slip.result.questions.map(q => <li key={q}>{q}</li>)}</ul></> : null}{slip.result.frame ? <><h3>Your frame</h3>{slip.result.frame.map(b => <p key={b.beat}><strong>{b.beat} · {b.status}</strong><small>{b.paragraphs.length ? `Paragraphs ${b.paragraphs.join(', ')}` : 'No paragraph yet'}</small>{b.question}</p>)}</> : null}{slip.result.mechanics.length ? <details><summary>Small things ({slip.result.mechanics.length})</summary><ul>{slip.result.mechanics.map(m => <li key={m}>{m}</li>)}</ul></details> : null}</article> : null}
      </> : null}
      {panel === 'recall' ? <>
        <h2>You've written near this before.</h2>
        <button className="ghost-back" onClick={() => setPanel('menu')}>← Anchors and lenses</button>
        <p className="ghost-caption">Matched against {scope} on this device. Nothing was sent.</p>
        {recalled.length ? <article className="ghost-result ghost-recall" aria-live="polite">{recalled.map(item => <section key={item.draftId}>
          <h3>{item.title} · {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ¶{item.paragraph}</h3>
          <blockquote>{item.passage.length > 360 ? `${item.passage.slice(0, 360).replace(/\s+\S*$/, '')}…` : item.passage}</blockquote>
          <small>Shares: {item.shared.join(', ')}</small>
        </section>)}</article> : <p role="status">Nothing in your other drafts connects closely yet. This grows as you write more.</p>}
      </> : null}
      {message ? <div className="ghost-message" role={error ? 'alert' : 'status'}><p>{message}</p>{!state.reading ? <button onClick={() => { update({ reading: true }); setMessage('Reading is on. Choose a lens when you are ready.'); }}>Turn on</button> : locked ? <><button onClick={() => { update({ firstDraftDone: true }); setMessage('First draft done. Lenses are open.'); }}>Mark done now</button><button onClick={() => void close()}>Keep drafting</button></> : error ? <button onClick={() => void ask(lastAction.current)}>Try again</button> : null}</div> : null}
      {storageError ? <p role="alert">Setup could not be saved on this device. It will appear again next time.</p> : null}
    </section> : null}
  </div>;
}
