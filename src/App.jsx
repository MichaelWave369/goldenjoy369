import React, { useMemo, useState } from 'react';
import { Archive, Download, HeartPulse, NotebookPen, Plus, RotateCcw, Save, Sparkles, Sprout, Undo2 } from 'lucide-react';

const PHI = (1 + Math.sqrt(5)) / 2;
const thresholds = { seal: 0.72 };
const nowIso = () => new Date().toISOString();
const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const round2 = (n) => Math.round(n * 100) / 100;
const slugify = (v) => v.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `lens_${Date.now()}`;
const fibDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString(); };

function joyScore(joy, mode = 'seal') {
  const e = clamp01(joy.energy), c = clamp01(joy.coherence), d = clamp01(joy.delight), cl = clamp01(joy.closure), f = clamp01(joy.forward_pull);
  if (mode === 'seal') return clamp01(0.15 * e + 0.20 * c + 0.15 * d + 0.25 * cl + 0.25 * f);
  if (mode === 'return') return clamp01(0.25 * e + 0.20 * c + 0.15 * d + 0.15 * cl + 0.25 * f);
  return clamp01((e + c + d + cl + f) / 5);
}

function completionScore(round) {
  const essence = round.essence?.trim() ? 1 : 0.35;
  const artifacts = round.structure_outputs?.length ? 1 : 0.25;
  const next = round.next_return_pointer?.trim() ? 1 : 0.25;
  const atlas = round.atlas_mapping?.length ? 1 : 0.25;
  return clamp01(0.2 * essence + 0.2 * artifacts + 0.2 * next + 0.2 * atlas + 0.2 * joyScore(round.joy, 'seal') - 0.15 * clamp01(round.drag));
}

const starterLens = {
  lens_id: 'goldenjoy369', title: 'GoldenJoy369 Runtime', domain: 'creative_continuity_runtime', status: 'active',
  pillar: 'Build', created_at: nowIso(), latest_round_id: 'round_001', latest_seal_id: null,
  tags: ['no-zero', 'golden-joy', 'runtime', 'PHI369']
};

const starterRound = {
  round_id: 'round_001', round_number: 1, lens_id: 'goldenjoy369', phase: 'spark',
  spark: 'Build the smallest runnable GoldenJoy369 app that can log and seal its own first real round.',
  delta: 'The spec round harvested; the lens rotated to building.',
  structure_outputs: ['v0.3 spec', 'infographic poster', 'React MVP scaffold'],
  essence: 'GoldenJoy369 is a local-first continuity garden for creative rounds, seeded projects, bridge detection, and release with honor.',
  next_return_pointer: 'Use the app to seal this first MVP round, then begin a return round inside the tool.',
  atlas_mapping: ['GoldenJoy369', 'No-Zero Spiral', 'PHI369', 'Living Atlas'],
  rest_instruction: 'Do not expand the spec again until one real round is logged inside the tool.',
  joy: { energy: 0.94, coherence: 0.95, delight: 0.96, closure: 0.88, forward_pull: 0.97 },
  drag: 0.08, started_at: nowIso(), sealed_at: null
};

function defaultState() {
  return { lenses: [starterLens], activeLensId: 'goldenjoy369', rounds: [starterRound], seals: [], seedNotes: [], bridges: [], releases: [] };
}

function createSeal(lens, round) {
  const sealedAt = nowIso();
  return {
    seal_id: `seal_${lens.lens_id}_${Date.now()}`, lens_id: lens.lens_id, round_id: round.round_id,
    previous_seal_id: lens.latest_seal_id, essence: round.essence, artifact_refs: round.structure_outputs,
    next_return_pointer: round.next_return_pointer, atlas_mapping: round.atlas_mapping, rest_instruction: round.rest_instruction,
    golden_joy_note: 'This seal preserves a development round inside its own No-Zero system.',
    joy_score: round2(joyScore(round.joy, 'seal')), completion_score: round2(completionScore(round)),
    sealed_at: sealedAt, round_started_at: round.started_at,
    round_duration_minutes: Math.max(1, Math.round((new Date(sealedAt) - new Date(round.started_at)) / 60000)),
    return_check_after: 'FIB_3_DAYS', return_check_at: fibDate(3),
    release_review_after: 'FIB_89_DAYS', release_review_at: fibDate(89), status_after_seal: 'seeded'
  };
}

function createReturnRound(lens, latestSeal, count) {
  return {
    round_id: `round_${Date.now()}`, round_number: count + 1, lens_id: lens.lens_id, phase: 'spark',
    spark: latestSeal ? `Return from seed: ${latestSeal.next_return_pointer}` : 'Return round opened from the Seed Vault.',
    delta: 'Seeded lens returned to active focus.', structure_outputs: [], essence: '', next_return_pointer: '',
    atlas_mapping: latestSeal?.atlas_mapping || lens.tags || [], rest_instruction: '',
    joy: { energy: 0.75, coherence: 0.75, delight: 0.75, closure: 0.4, forward_pull: 0.85 },
    drag: 0.15, started_at: nowIso(), sealed_at: null
  };
}

function Field({ label, value, onChange, multiline = false, placeholder = '' }) {
  const cls = 'w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-300/50';
  return <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/80">{label}</span>{multiline ? <textarea className={`${cls} min-h-[86px]`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /> : <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}</label>;
}

function Slider({ label, value, onChange }) {
  return <label className="space-y-1 text-sm text-zinc-200"><div className="flex justify-between"><span>{label}</span><span className="tabular-nums text-amber-200">{round2(value)}</span></div><input className="w-full accent-amber-200" type="range" min="0" max="1" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function Panel({ children }) { return <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 shadow-2xl">{children}</section>; }
function Badge({ children }) { return <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs capitalize text-zinc-200">{children}</span>; }
function Bar({ label, value }) { const p = Math.round(clamp01(value) * 100); return <div className="space-y-1"><div className="flex justify-between text-xs text-zinc-300"><span>{label}</span><span>{p}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-100/80" style={{ width: `${p}%` }} /></div></div>; }

export default function App() {
  const [state, setState] = useState(defaultState);
  const [newLensTitle, setNewLensTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notePointer, setNotePointer] = useState('');

  const activeLens = state.lenses.find((l) => l.lens_id === state.activeLensId) || state.lenses[0];
  const lensRounds = state.rounds.filter((r) => r.lens_id === activeLens.lens_id);
  const openRound = lensRounds.find((r) => !r.sealed_at) || null;
  const latestRound = lensRounds[0] || null;
  const latestSeal = state.seals.find((s) => s.seal_id === activeLens.latest_seal_id) || state.seals.find((s) => s.lens_id === activeLens.lens_id) || null;
  const displayedRound = openRound || latestRound;
  const score = useMemo(() => openRound ? completionScore(openRound) : 0, [openRound]);
  const joy = useMemo(() => openRound ? joyScore(openRound.joy, 'seal') : 0, [openRound]);
  const seedNotes = state.seedNotes.filter((n) => n.lens_id === activeLens.lens_id);

  function updateRound(patch) {
    if (!openRound) return;
    setState((s) => ({ ...s, rounds: s.rounds.map((r) => r.round_id === openRound.round_id ? { ...r, ...patch } : r) }));
  }
  function updateJoy(key, value) { updateRound({ joy: { ...openRound.joy, [key]: value } }); }
  function updateList(key, value) { updateRound({ [key]: value.split('\n').map((x) => x.trim()).filter(Boolean) }); }
  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `goldenjoy369_snapshot_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
  }
  function createLens() {
    const title = newLensTitle.trim(); if (!title) return; const id = slugify(title); const roundId = `round_${Date.now()}`;
    const lens = { lens_id: id, title, domain: 'creative_system', status: 'active', pillar: 'Build', created_at: nowIso(), latest_round_id: roundId, latest_seal_id: null, tags: ['new-lens'] };
    const round = { ...starterRound, lens_id: id, round_id: roundId, round_number: 1, spark: '', delta: '', structure_outputs: [], essence: '', next_return_pointer: '', atlas_mapping: [], rest_instruction: '', joy: { energy: 0.6, coherence: 0.6, delight: 0.6, closure: 0.25, forward_pull: 0.7 }, drag: 0.2, started_at: nowIso(), sealed_at: null };
    setState((s) => ({ ...s, activeLensId: id, lenses: [lens, ...s.lenses], rounds: [round, ...s.rounds] })); setNewLensTitle('');
  }
  function sealRound() {
    if (!openRound || score < thresholds.seal) return; const seal = createSeal(activeLens, openRound);
    setState((s) => ({ ...s,
      lenses: s.lenses.map((l) => l.lens_id === activeLens.lens_id ? { ...l, status: 'seeded', latest_seal_id: seal.seal_id, latest_round_id: openRound.round_id } : l),
      rounds: s.rounds.map((r) => r.round_id === openRound.round_id ? { ...r, phase: 'sealed', sealed_at: seal.sealed_at } : r),
      seals: [seal, ...s.seals],
      seedNotes: [{ seed_note_id: `seednote_${activeLens.lens_id}_${Date.now()}`, lens_id: activeLens.lens_id, seal_id: seal.seal_id, note_type: 'system_event', note: 'Round sealed. Project is seeded, not abandoned.', next_return_pointer_update: seal.next_return_pointer, created_at: nowIso() }, ...s.seedNotes]
    }));
  }
  function beginReturnRound() {
    const round = createReturnRound(activeLens, latestSeal, lensRounds.length);
    setState((s) => ({ ...s,
      lenses: s.lenses.map((l) => l.lens_id === activeLens.lens_id ? { ...l, status: 'active', latest_round_id: round.round_id } : l),
      rounds: [round, ...s.rounds],
      seedNotes: latestSeal ? [{ seed_note_id: `seednote_${activeLens.lens_id}_${Date.now()}`, lens_id: activeLens.lens_id, seal_id: latestSeal.seal_id, note_type: 'return_started', note: 'Seed returned to active focus through a new round.', next_return_pointer_update: latestSeal.next_return_pointer, created_at: nowIso() }, ...s.seedNotes] : s.seedNotes
    }));
  }
  function addSeedNote() {
    if (!latestSeal || !noteText.trim()) return;
    setState((s) => ({ ...s, seedNotes: [{ seed_note_id: `seednote_${activeLens.lens_id}_${Date.now()}`, lens_id: activeLens.lens_id, seal_id: latestSeal.seal_id, note_type: notePointer.trim() ? 'return_pointer_update' : 'context_note', note: noteText.trim(), next_return_pointer_update: notePointer.trim(), created_at: nowIso() }, ...s.seedNotes] }));
    setNoteText(''); setNotePointer('');
  }

  const returnDue = state.seals.filter((s) => new Date(s.return_check_at).getTime() < Date.now()).length;
  const clutter = state.seals.filter((s) => new Date(s.release_review_at).getTime() < Date.now()).length;

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3f2f12_0,#111111_38%,#050505_100%)] p-4 text-zinc-100 md:p-6"><div className="mx-auto max-w-7xl space-y-5">
    <header className="rounded-3xl border border-amber-200/20 bg-black/40 p-6 shadow-2xl"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-amber-200/80"><Sparkles size={18}/> GoldenJoy369 MVP</div><h1 className="text-4xl font-semibold tracking-tight text-amber-100 md:text-5xl">No-Zero Spiral Runtime</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">Seal a creative round, tend the seed, begin a return round, and watch the lens spiral.</p></div><div className="flex gap-2"><button onClick={exportJson} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"><Download size={16}/> Export JSON</button><button onClick={() => setState(defaultState())} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"><RotateCcw size={16}/> Reset</button></div></div></header>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[290px_1fr_380px]">
      <Panel><h2 className="mb-4 flex items-center gap-2 font-semibold text-amber-100"><Sprout size={18}/> Project Lenses</h2><div className="mb-4 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3"><Field label="New lens" value={newLensTitle} onChange={setNewLensTitle} placeholder="Example: Professor Phi"/><button onClick={createLens} disabled={!newLensTitle.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 disabled:opacity-40"><Plus size={16}/> Create Lens</button></div><div className="space-y-2">{state.lenses.map((lens) => <button key={lens.lens_id} onClick={() => setState((s) => ({ ...s, activeLensId: lens.lens_id }))} className={`w-full rounded-2xl border p-3 text-left transition ${lens.lens_id === activeLens.lens_id ? 'border-amber-200/40 bg-amber-200/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}><div className="flex items-start justify-between gap-2"><div><div className="font-medium text-zinc-100">{lens.title}</div><div className="mt-1 text-xs text-zinc-400">{lens.domain}</div></div><Badge>{lens.status}</Badge></div></button>)}</div></Panel>
      <div className="space-y-5"><Panel><div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-semibold text-amber-100"><Sparkles size={20}/> Active 369 Round</h2><p className="text-sm text-zinc-400">3 Spark → 6 Structure → 9 Harvest & Seal → φ Return</p></div>{!openRound && latestSeal && <button onClick={beginReturnRound} className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-100"><Undo2 size={16}/> Begin Return Round</button>}</div>{openRound ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Spark / Δ" value={openRound.spark} onChange={(v) => updateRound({ spark: v })} multiline/><Field label="Essence" value={openRound.essence} onChange={(v) => updateRound({ essence: v })} multiline/><Field label="Structure Outputs — one per line" value={(openRound.structure_outputs || []).join('\n')} onChange={(v) => updateList('structure_outputs', v)} multiline placeholder={'spec.md\nposter.png'}/><Field label="Atlas Mapping — one per line" value={(openRound.atlas_mapping || []).join('\n')} onChange={(v) => updateList('atlas_mapping', v)} multiline placeholder={'PHI369\nGoldenJoy369'}/><Field label="Next Return Pointer" value={openRound.next_return_pointer} onChange={(v) => updateRound({ next_return_pointer: v })} multiline/><Field label="Rest Instruction" value={openRound.rest_instruction} onChange={(v) => updateRound({ rest_instruction: v })} multiline/></div> : <div className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm text-zinc-300"><strong className="text-amber-100">Latest round is sealed and locked.</strong><p className="mt-2">Truth-of-round is preserved. Use SeedNotes to tend the seed, or begin a return round to continue the spiral.</p><p className="mt-3">{latestSeal?.essence}</p></div>}</Panel>
      <Panel><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-100"><HeartPulse size={20}/> Joy Signal</h2>{openRound ? <><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Slider label="Energy" value={openRound.joy.energy} onChange={(v)=>updateJoy('energy',v)}/><Slider label="Coherence" value={openRound.joy.coherence} onChange={(v)=>updateJoy('coherence',v)}/><Slider label="Delight" value={openRound.joy.delight} onChange={(v)=>updateJoy('delight',v)}/><Slider label="Closure" value={openRound.joy.closure} onChange={(v)=>updateJoy('closure',v)}/><Slider label="Forward-Pull" value={openRound.joy.forward_pull} onChange={(v)=>updateJoy('forward_pull',v)}/><Slider label="Drag / Confusion Debt" value={openRound.drag} onChange={(v)=>updateRound({drag:v})}/></div><div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"><Bar label="Seal-time Joy" value={joy}/><Bar label="Round Completion" value={score}/></div><div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4"><div><div className="font-medium text-zinc-100">{score >= thresholds.seal ? 'This round is sealable.' : 'This round wants more clarity before sealing.'}</div><div className="text-sm text-zinc-400">MVP shortcut: completion measures field presence plus joy.</div></div><button onClick={sealRound} disabled={score < thresholds.seal} className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-5 py-3 font-semibold text-black hover:bg-amber-100 disabled:opacity-40"><Save size={18}/> Generate SealPacket</button></div></> : <p className="text-sm text-zinc-400">Joy is locked for sealed rounds. Begin a return round to capture a new joy signal.</p>}</Panel></div>
      <div className="space-y-5"><Panel><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-100"><Archive size={20}/> Seed Vault</h2>{state.seals.length ? <div className="space-y-3">{state.seals.map((s) => <div key={s.seal_id} className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex justify-between"><strong>{s.lens_id}</strong><Badge>{s.status_after_seal}</Badge></div><p className="mt-2 text-sm text-zinc-300">{s.essence}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400"><span>Joy {s.joy_score}</span><span>RC {s.completion_score}</span><span>Return {s.return_check_after}</span><span>Release {s.release_review_after}</span></div></div>)}</div> : <p className="text-sm text-zinc-400">No seals yet.</p>}</Panel><Panel><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-100"><NotebookPen size={20}/> SeedNote Composer</h2>{latestSeal ? <div className="space-y-3"><Field label="Seed note" value={noteText} onChange={setNoteText} multiline/><Field label="Optional next-return update" value={notePointer} onChange={setNotePointer} multiline/><button onClick={addSeedNote} disabled={!noteText.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-40"><Plus size={16}/> Append SeedNote</button></div> : <p className="text-sm text-zinc-400">SeedNotes appear after the first seal.</p>}</Panel><Panel><h2 className="mb-4 text-xl font-semibold text-amber-100">Atlas Health</h2><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-white/5 p-3">Seals<div className="text-2xl text-amber-100">{state.seals.length}</div></div><div className="rounded-xl bg-white/5 p-3">Seeded<div className="text-2xl text-amber-100">{state.lenses.filter(l=>l.status==='seeded').length}</div></div><div className="rounded-xl bg-white/5 p-3">Return Due<div className="text-2xl text-amber-100">{returnDue}</div></div><div className="rounded-xl bg-white/5 p-3">Clutter Index<div className="text-2xl text-amber-100">{clutter}</div></div></div><p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-300">Return Due is a gentle revisit cue. Clutter Index only counts seeds past release-review.</p></Panel><Panel><h2 className="mb-4 text-xl font-semibold text-amber-100">Seed Notes</h2>{seedNotes.length ? <div className="space-y-2">{seedNotes.map(n=><div key={n.seed_note_id} className="rounded-xl bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{n.note_type}</div><p className="mt-1">{n.note}</p>{n.next_return_pointer_update && <p className="mt-2 text-xs text-amber-100">Return pointer: {n.next_return_pointer_update}</p>}</div>)}</div> : <p className="text-sm text-zinc-400">No seed notes yet.</p>}</Panel></div>
    </div><footer className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400"><strong className="text-amber-100">MVP boundary:</strong> This is a local-first preview. Bridge detection, merge UI, release-with-honor actions, JSON import, and Markdown export are next layers. <span className="ml-2 text-zinc-500">φ ≈ {round2(PHI)}</span></footer></div></main>;
}
