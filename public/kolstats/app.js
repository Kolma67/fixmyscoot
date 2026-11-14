(() => {
'use strict';

/* ---------- helpers ---------- */
const OLD_KEY = 'kolstats.v1', PW_KEY = 'kolstats.pw', API = '/kolstats/api';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const dayIdx = (s = today()) => (parse(s).getDay() + 6) % 7; // Mon = 0
const weekStart = (s = today()) => addDays(s, -dayIdx(s));
const daysUntil = s => Math.round((parse(s) - parse(today())) / 864e5);
const fmtDate = s => parse(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const clamp = v => Math.max(0, Math.min(100, v));
const round = (v, d = 0) => { const p = 10 ** d; return Math.round(v * p) / p; };
const pace = m => { let s = Math.round(m * 60); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
const e1rm = (w, r) => r <= 1 ? w : w * (1 + r / 30);
const bar = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${clamp(pct)}%"></i></div>`;
const rel = s => { const n = daysUntil(s); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n > 0 ? `in ${n} d` : `${-n} d overdue`; };

const PLAN = [
  { d: 'Mon', n: 'Push', run: 0 }, { d: 'Tue', n: 'Pull', run: 0 },
  { d: 'Wed', n: 'Run · 1 h Zone 2', run: 1 }, { d: 'Thu', n: 'Legs', run: 0 },
  { d: 'Fri', n: 'Push', run: 0 }, { d: 'Sat', n: 'Pull', run: 0 },
  { d: 'Sun', n: 'Run · 2 h Zone 2', run: 1 },
];
const SUBJ = { matek: 'Matek · emelt', tori: 'Töri · közép', magyar: 'Magyar · közép' };
const GOAL = { bench: 140, runMin: 60, hr: 140, exam: 90 };

/* ---------- state ---------- */
function defaults() {
  const t = today();
  return {
    v: 1,
    workout: { weeks: {}, lifts: [{ id: uid(), date: t, ex: 'Bench press', w: 100, reps: 6 }], runs: [] },
    exam: { subjects: { matek: { topics: [], mocks: [] }, tori: { topics: [], mocks: [] }, magyar: { topics: [], mocks: [] } } },
    work: { goals: [
      { id: uid(), title: 'Profitable online business — AI animated YT Shorts', note: 'Still figuring out the niche.', due: '', steps: [
        { id: uid(), text: 'Commit to one channel concept for 30 uploads', done: false },
        { id: uid(), text: 'Fixed weekly upload schedule', done: false },
        { id: uid(), text: 'First 1,000 subscribers', done: false },
        { id: uid(), text: 'First payout', done: false } ] },
      { id: uid(), title: 'FixMyScoot — reopen next summer', note: '', due: '2027-06-01', steps: [
        { id: uid(), text: 'Decide reopening date', done: false },
        { id: uid(), text: 'Update prices and site', done: false } ] },
    ] },
    macros: { targets: { kcal: 2800, protein: 130 }, days: {}, weights: [{ date: t, kg: 65 }] },
    tasks: [
      { id: uid(), title: 'Érettségi — magyar (confirm date)', date: '2027-05-03', type: 'event', done: false },
      { id: uid(), title: 'Érettségi — matek emelt (confirm date)', date: '2027-05-04', type: 'event', done: false },
      { id: uid(), title: 'Érettségi — töri (confirm date)', date: '2027-05-05', type: 'event', done: false },
    ],
  };
}
let S = null;
const ui = { macroDate: today(), subj: 'matek' };

/* ---------- online storage ---------- */
let pw = null, rev = 0, dirty = false, saving = false, timer = null;
let fade = null;
const status = (t, bad) => { clearTimeout(fade); const el = $('#sync'); el.textContent = t; el.classList.toggle('bad', !!bad); el.hidden = !t; };
const api = (method, body, keepalive) => fetch(API, {
  method, cache: 'no-store', keepalive: !!keepalive,
  headers: { authorization: 'Bearer ' + encodeURIComponent(pw), 'content-type': 'application/json' },
  body: body ? JSON.stringify(body) : undefined,
});
function save() { dirty = true; status('Saving…'); clearTimeout(timer); timer = setTimeout(push, 500); }
async function push(force) {
  clearTimeout(timer); timer = null;
  if (saving) return;
  saving = true; dirty = false;
  try {
    const r = await api('PUT', { rev, data: S, force: !!force });
    if (r.ok) { rev = (await r.json()).rev; status('Saved'); fade = setTimeout(() => status(''), 1500); }
    else if (r.status === 409) { const doc = await r.json(); S = doc.data; rev = doc.rev; render(); status('Changed on another device — reloaded, redo your last change', true); }
    else if (r.status === 401 || r.status === 429) { lockOut(); }
    else throw new Error(r.status);
  } catch { dirty = true; status('Offline — not saved, retrying', true); timer = setTimeout(push, 5000); }
  saving = false;
  if (dirty && !timer) timer = setTimeout(push, 500);
}
async function refresh() {
  if (!S || dirty || saving) return;
  try {
    const r = await api('GET'); if (!r.ok) return;
    const doc = await r.json();
    if (doc.data && doc.rev !== rev && !dirty && !saving) { S = doc.data; rev = doc.rev; render(); }
  } catch { /* offline: keep what we have */ }
}
function lockOut() { S = null; pw = null; sessionStorage.removeItem(PW_KEY); localStorage.removeItem(PW_KEY); showLock(); }

/* ---------- auth ---------- */
function showLock(msg = '') {
  $('#app').hidden = true; status('');
  const el = $('#lock'); el.hidden = false;
  el.innerHTML = `<form data-form="unlock">
    <div class="brand"><span class="dot"></span>kolstats</div>
    <input type="password" name="pw" autocomplete="current-password" placeholder="Password" required autofocus>
    <label><input type="checkbox" name="remember"> Stay unlocked on this device</label>
    <button class="primary">Unlock</button>
    <div class="err" id="err">${esc(msg)}</div></form>`;
}
// Asks the server for the data with this password. Returns an error message, or '' once unlocked.
async function login(p, remember) {
  pw = p;
  let r;
  try { r = await api('GET'); } catch { pw = null; return 'Cannot reach the server'; }
  if (!r.ok) {
    pw = null;
    if (r.status === 401) return 'Wrong password';
    if (r.status === 429) { const j = await r.json().catch(() => ({})); return `Too many attempts — try again in ${j.retryMin || 15} min`; }
    if (r.status === 503) return 'Server password is not set up yet';
    return 'Server error';
  }
  const doc = await r.json();
  rev = doc.rev || 0;
  sessionStorage.setItem(PW_KEY, p);
  if (remember) localStorage.setItem(PW_KEY, p);
  if (doc.data) S = doc.data;
  else {
    // First login ever: carry over anything already entered in this browser.
    let old = null; try { old = JSON.parse(localStorage.getItem(OLD_KEY)); } catch { /* ignore */ }
    S = old && old.v === 1 ? old : defaults();
    delete S.auth;
    push(true);
  }
  $('#lock').hidden = true; $('#app').hidden = false; render();
  return '';
}

/* ---------- derived numbers ---------- */
const weekDone = (ws = weekStart()) => Object.values(S.workout.weeks[ws] || {}).filter(Boolean).length;
const benchBest = () => Math.max(0, ...S.workout.lifts.filter(l => /bench/i.test(l.ex)).map(l => e1rm(l.w, l.reps)));
const z2runs = () => S.workout.runs.filter(r => r.km > 0 && r.min > 0 && r.hr > 0 && r.hr <= GOAL.hr);
const z2best = () => { const r = z2runs().map(r => r.min / r.km); return r.length ? Math.min(...r) : null; };
const dayTotals = d => (S.macros.days[d] || []).reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p }), { kcal: 0, p: 0 });
const subjPct = k => { const t = S.exam.subjects[k].topics; return t.length ? t.filter(x => x.status === 2).length / t.length * 100 : 0; };
const lastMock = k => { const m = [...S.exam.subjects[k].mocks].sort((a, b) => a.date.localeCompare(b.date)); return m.length ? m[m.length - 1].pct : null; };
const sortedTasks = () => [...S.tasks].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

/* ---------- chart ---------- */
function lineChart(pts, { goal, fmt = v => round(v, 1) } = {}) {
  if (pts.length < 2) return '<p class="muted small">Log at least two entries to see a trend.</p>';
  const W = 600, H = 170, p = 30, ys = pts.map(q => q.y).concat(goal != null ? [goal] : []);
  let mn = Math.min(...ys), mx = Math.max(...ys); if (mn === mx) { mn -= 1; mx += 1; }
  const r = mx - mn; mn -= r * .12; mx += r * .12;
  const X = i => p + i * (W - 2 * p) / (pts.length - 1), Y = v => H - p - (v - mn) * (H - 2 * p) / (mx - mn);
  const line = pts.map((q, i) => `${X(i).toFixed(1)},${Y(q.y).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    ${goal != null ? `<line x1="${p}" x2="${W - p}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="#f5b85c" stroke-dasharray="5 5" stroke-width="1"/><text x="${W - p}" y="${Y(goal) - 6}" fill="#f5b85c" font-size="11" text-anchor="end">goal ${esc(fmt(goal))}</text>` : ''}
    <polyline points="${line}" fill="none" stroke="#8ef0a8" stroke-width="2" stroke-linejoin="round"/>
    ${pts.map((q, i) => `<circle cx="${X(i)}" cy="${Y(q.y)}" r="3" fill="#8ef0a8"><title>${esc(q.x)}: ${esc(fmt(q.y))}</title></circle>`).join('')}
    <text x="${p}" y="${H - 8}" fill="#8a93a3" font-size="11">${esc(pts[0].x)}</text>
    <text x="${W - p}" y="${H - 8}" fill="#8a93a3" font-size="11" text-anchor="end">${esc(last.x)}</text>
    <text x="${X(pts.length - 1)}" y="${Y(last.y) - 9}" fill="#e8ebf0" font-size="12" text-anchor="end">${esc(fmt(last.y))}</text>
  </svg>`;
}

/* ---------- nav ---------- */
const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ROUTES = [
  ['dashboard', 'Dashboard', ic('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>')],
  ['workout', 'Workout', ic('<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>')],
  ['exam', 'Érettségi', ic('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 8h6"/>')],
  ['work', 'Work', ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>')],
  ['macros', 'Macros', ic('<path d="M12 21c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-5-3-7 0 4-5 6-5 11 0 4 3 7 7 7z"/>')],
  ['tasks', 'Tasks', ic('<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>')],
  ['settings', 'Settings', ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>')],
];
const route = () => { const r = location.hash.slice(1); return ROUTES.some(x => x[0] === r) ? r : 'dashboard'; };

/* ---------- views ---------- */
const V = {};

V.dashboard = () => {
  const t = today(), h = new Date().getHours(), di = dayIdx();
  const tot = dayTotals(t), tg = S.macros.targets, wk = weekDone();
  const doneToday = !!(S.workout.weeks[weekStart()] || {})[di];
  const up = sortedTasks().filter(x => !x.done && x.date).slice(0, 7);
  const bb = benchBest(), zb = z2best();
  const goals = [
    ['Bench 140 kg', bb ? `≈ ${round(bb)} kg est. 1RM` : 'no bench logged', bb / GOAL.bench * 100],
    ['10 k in 60 min ≤ 140 bpm', zb ? `${pace(zb)}/km in Z2 → 10 k ≈ ${round(zb * 10)} min` : 'no Zone 2 run logged yet', zb ? GOAL.runMin / (zb * 10) * 100 : 0],
    ...Object.keys(SUBJ).map(k => { const m = lastMock(k), n = S.exam.subjects[k].topics.length;
      return [`${SUBJ[k]} → 90%`, `${n ? round(subjPct(k)) + '% topics' : 'no topics yet'}${m != null ? ` · last mock ${m}%` : ''}`, m != null ? m / GOAL.exam * 100 : subjPct(k)]; }),
    ...S.work.goals.map(g => { const d = g.steps.filter(s => s.done).length; return [g.title, `${d}/${g.steps.length} steps`, g.steps.length ? d / g.steps.length * 100 : 0]; }),
  ];
  return `<div class="head"><div><h1>Good ${h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}</h1><p class="muted">${fmtDate(t)}</p></div></div>
  <div class="grid g4">
    <div class="card stat"><div class="k">Today</div><div class="v" style="font-size:19px">${esc(PLAN[di].n)}</div>
      <button data-act="toggleDay" data-i="${di}" class="${doneToday ? '' : 'primary'}">${doneToday ? '✓ Done' : 'Mark done'}</button></div>
    <div class="card stat"><div class="k">This week</div><div class="v">${wk}<small> / 7 sessions</small></div>${bar(wk / 7 * 100)}</div>
    <div class="card stat"><div class="k">Calories</div><div class="v">${round(tot.kcal)}<small> / ${tg.kcal}</small></div>${bar(tot.kcal / tg.kcal * 100, tot.kcal > tg.kcal * 1.05 ? 'warn' : '')}</div>
    <div class="card stat"><div class="k">Protein</div><div class="v">${round(tot.p)}<small> / ${tg.protein} g</small></div>${bar(tot.p / tg.protein * 100, 'blue')}</div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h2>Upcoming</h2>
      ${up.length ? `<ul class="list">${up.map(x => `<li><button class="check" data-act="toggleTask" data-id="${x.id}" aria-label="Done"></button>
        <span class="grow">${esc(x.title)}<br><span class="muted small">${fmtDate(x.date)}</span></span>
        <span class="tag ${daysUntil(x.date) < 0 ? 'bad' : x.type === 'event' ? 'event' : ''}">${rel(x.date)}</span></li>`).join('')}</ul>` : '<p class="muted small">Nothing scheduled.</p>'}
      <p class="mt"><a class="muted small" href="#tasks">All tasks →</a></p></div>
    <div class="card"><h2>How I'm doing</h2>
      ${goals.map(([a, b, p]) => `<div class="goal"><div class="top"><span>${esc(a)}</span><span>${esc(b)}</span></div>${bar(p)}</div>`).join('')}</div>
  </div>`;
};

V.workout = () => {
  const ws = weekStart(), wk = S.workout.weeks[ws] || {}, di = dayIdx();
  const lifts = [...S.workout.lifts].sort((a, b) => b.date.localeCompare(a.date));
  const runs = [...S.workout.runs].sort((a, b) => b.date.localeCompare(a.date));
  const benchPts = [...lifts].reverse().filter(l => /bench/i.test(l.ex)).map(l => ({ x: l.date.slice(5), y: e1rm(l.w, l.reps) }));
  const runPts = [...z2runs()].sort((a, b) => a.date.localeCompare(b.date)).map(r => ({ x: r.date.slice(5), y: r.min / r.km }));
  const exs = [...new Set(['Bench press', 'Overhead press', 'Squat', 'Deadlift', 'Pull-up', 'Barbell row', ...S.workout.lifts.map(l => l.ex)])];
  return `<div class="head"><div><h1>Workout</h1><p class="muted">Week of ${fmtDate(ws)} · ${weekDone()} / 7 done</p></div></div>
  <div class="grid g7">${PLAN.map((p, i) => `<button class="day ${i === di ? 'today' : ''} ${wk[i] ? 'on' : ''}" data-act="toggleDay" data-i="${i}">
    <span class="d">${p.d}${i === di ? ' · today' : ''}</span><span class="n">${esc(p.n)}</span><span class="s">${wk[i] ? '✓ done' : 'tap to complete'}</span></button>`).join('')}</div>
  <div class="grid g2 mt">
    <div class="card"><h2>Bench · estimated 1RM</h2>${lineChart(benchPts, { goal: GOAL.bench, fmt: v => round(v) + ' kg' })}</div>
    <div class="card"><h2>Zone 2 pace (runs ≤ ${GOAL.hr} bpm)</h2>${lineChart(runPts, { goal: 6, fmt: v => pace(v) + '/km' })}</div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h2>Log lift</h2>
      <form class="row" data-form="addLift"><input type="date" name="date" value="${today()}" required>
        <input class="w2" name="ex" list="exs" placeholder="Exercise" required><datalist id="exs">${exs.map(e => `<option value="${esc(e)}">`).join('')}</datalist>
        <input name="w" inputmode="decimal" placeholder="kg" required><input name="reps" inputmode="numeric" placeholder="reps" required>
        <button class="primary">Add</button></form>
      <ul class="list mt">${lifts.slice(0, 12).map(l => `<li><span class="grow">${esc(l.ex)} <span class="muted">· ${l.w} kg × ${l.reps}</span><br><span class="muted small">${fmtDate(l.date)} · e1RM ${round(e1rm(l.w, l.reps))} kg</span></span>
        <button class="ghost" data-act="del" data-path="workout.lifts" data-id="${l.id}" aria-label="Delete">✕</button></li>`).join('') || '<li class="muted small">No lifts yet.</li>'}</ul></div>
    <div class="card"><h2>Log run</h2>
      <form class="row" data-form="addRun"><input type="date" name="date" value="${today()}" required>
        <input name="km" inputmode="decimal" placeholder="km" required><input name="min" inputmode="decimal" placeholder="minutes" required>
        <input name="hr" inputmode="numeric" placeholder="avg bpm" required><button class="primary">Add</button></form>
      <ul class="list mt">${runs.slice(0, 12).map(r => `<li><span class="grow">${r.km} km <span class="muted">· ${r.min} min · ${pace(r.min / r.km)}/km</span><br><span class="muted small">${fmtDate(r.date)} · ${r.hr} bpm</span></span>
        <span class="tag ${r.hr <= GOAL.hr ? 'ok' : 'warn'}">${r.hr <= GOAL.hr ? 'Zone 2' : 'above Z2'}</span>
        <button class="ghost" data-act="del" data-path="workout.runs" data-id="${r.id}" aria-label="Delete">✕</button></li>`).join('') || '<li class="muted small">No runs yet.</li>'}</ul></div>
  </div>`;
};

V.exam = () => {
  const k = ui.subj, s = S.exam.subjects[k], ST = ['To do', 'Learning', 'Done'];
  const mocks = [...s.mocks].sort((a, b) => a.date.localeCompare(b.date));
  const exam = S.tasks.filter(t => /érettségi/i.test(t.title) && t.date && !t.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  return `<div class="head"><div><h1>Érettségi</h1><p class="muted">Target ≈ 90% in each${exam ? ` · ${daysUntil(exam.date)} days to go` : ''}</p></div></div>
  <div class="grid g3">${Object.keys(SUBJ).map(x => { const m = lastMock(x), n = S.exam.subjects[x].topics;
    return `<button class="day ${x === k ? 'today' : ''}" data-act="subj" data-k="${x}"><span class="d">${esc(SUBJ[x])}</span>
      <span class="n">${n.length ? round(subjPct(x)) + '% learned' : 'No topics yet'}</span>${bar(subjPct(x))}
      <span class="s">${n.filter(t => t.status === 2).length}/${n.length} topics${m != null ? ` · last mock ${m}%` : ''}</span></button>`; }).join('')}</div>
  <div class="grid g2 mt">
    <div class="card"><h2>${esc(SUBJ[k])} — topics</h2>
      <ul class="list">${s.topics.map(t => `<li><span class="grow ${t.status === 2 ? 'done' : ''}">${esc(t.name)}</span>
        <button class="status s${t.status}" data-act="cycle" data-id="${t.id}">${ST[t.status]}</button>
        <button class="ghost" data-act="del" data-path="exam.subjects.${k}.topics" data-id="${t.id}" aria-label="Delete">✕</button></li>`).join('') || '<li class="muted small">Empty for now — paste the topic list (tételek / témakörök) below.</li>'}</ul>
      <form data-form="addTopics" class="mt"><textarea name="names" placeholder="Add topics — one per line" required></textarea><button class="primary mt">Add topics</button></form></div>
    <div class="card"><h2>Mock exam results</h2>
      ${lineChart(mocks.map(m => ({ x: m.date.slice(5), y: m.pct })), { goal: GOAL.exam, fmt: v => round(v) + '%' })}
      <form class="row mt" data-form="addMock"><input type="date" name="date" value="${today()}" required><input name="pct" inputmode="decimal" placeholder="score %" required>
        <input class="w2" name="note" placeholder="Which paper (optional)"><button class="primary">Add</button></form>
      <ul class="list mt">${[...mocks].reverse().map(m => `<li><span class="grow">${m.pct}% <span class="muted">${esc(m.note || '')}</span><br><span class="muted small">${fmtDate(m.date)}</span></span>
        <button class="ghost" data-act="del" data-path="exam.subjects.${k}.mocks" data-id="${m.id}" aria-label="Delete">✕</button></li>`).join('')}</ul></div>
  </div>`;
};

V.work = () => `<div class="head"><div><h1>Work</h1><p class="muted">Goals and the next steps toward them</p></div></div>
  <div class="grid g2">${S.work.goals.map(g => { const d = g.steps.filter(s => s.done).length;
    return `<div class="card"><div class="goal"><div class="top"><h3>${esc(g.title)}</h3><span>${d}/${g.steps.length}${g.due ? ` · ${rel(g.due)}` : ''}</span></div>${bar(g.steps.length ? d / g.steps.length * 100 : 0)}</div>
      ${g.note ? `<p class="muted small mt">${esc(g.note)}</p>` : ''}
      <ul class="list mt">${g.steps.map(s => `<li><button class="check ${s.done ? 'on' : ''}" data-act="toggleStep" data-g="${g.id}" data-id="${s.id}" aria-label="Toggle"></button>
        <span class="grow ${s.done ? 'done' : ''}">${esc(s.text)}</span><button class="ghost" data-act="delStep" data-g="${g.id}" data-id="${s.id}" aria-label="Delete">✕</button></li>`).join('')}</ul>
      <form class="row mt" data-form="addStep"><input type="hidden" name="g" value="${g.id}"><input class="w2" name="text" placeholder="Next step" required><button>Add</button>
        <button type="button" class="ghost" data-act="delGoal" data-id="${g.id}">Delete goal</button></form></div>`; }).join('')}</div>
  <div class="card mt"><h2>New goal</h2><form class="row" data-form="addGoal"><input class="w2" name="title" placeholder="Goal" required>
    <input class="w2" name="note" placeholder="Note (optional)"><input type="date" name="due"><button class="primary">Add</button></form></div>`;

V.macros = () => {
  const d = ui.macroDate, tg = S.macros.targets, items = S.macros.days[d] || [], tot = dayTotals(d);
  const week = [...Array(7)].map((_, i) => addDays(today(), i - 6));
  const mx = Math.max(tg.kcal, ...week.map(x => dayTotals(x).kcal));
  const freq = {}; Object.values(S.macros.days).flat().forEach(f => { (freq[f.name] ||= { ...f, c: 0 }).c++; });
  const top = Object.values(freq).sort((a, b) => b.c - a.c).slice(0, 8);
  const w = [...S.macros.weights].sort((a, b) => a.date.localeCompare(b.date));
  return `<div class="head"><div><h1>Macros</h1><p class="muted">${d === today() ? 'Today' : fmtDate(d)}</p></div>
    <div class="datenav"><button data-act="mday" data-n="-1">‹</button><input type="date" data-change="mdate" value="${d}"><button data-act="mday" data-n="1">›</button></div></div>
  <div class="grid g2">
    <div class="card stat"><div class="k">Calories</div><div class="v">${round(tot.kcal)}<small> / ${tg.kcal} kcal · ${round(tg.kcal - tot.kcal)} left</small></div>${bar(tot.kcal / tg.kcal * 100, tot.kcal > tg.kcal * 1.05 ? 'warn' : '')}</div>
    <div class="card stat"><div class="k">Protein</div><div class="v">${round(tot.p)}<small> / ${tg.protein} g · ${round(tg.protein - tot.p)} left</small></div>${bar(tot.p / tg.protein * 100, 'blue')}</div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h2>Food</h2>
      <form class="row" data-form="addFood"><input class="w2" name="name" placeholder="Food" required><input name="kcal" inputmode="decimal" placeholder="kcal" required>
        <input name="p" inputmode="decimal" placeholder="protein g" required><button class="primary">Add</button></form>
      ${top.length ? `<div class="chips mt">${top.map(f => `<button class="chip" data-act="quick" data-name="${esc(f.name)}" data-kcal="${f.kcal}" data-p="${f.p}">+ ${esc(f.name)}</button>`).join('')}</div>` : ''}
      <ul class="list mt">${items.map(f => `<li><span class="grow">${esc(f.name)}</span><span class="muted small">${f.kcal} kcal · ${f.p} g</span>
        <button class="ghost" data-act="delFood" data-id="${f.id}" aria-label="Delete">✕</button></li>`).join('') || '<li class="muted small">Nothing logged.</li>'}</ul></div>
    <div class="card"><h2>Last 7 days</h2>
      <div class="mini">${week.map(x => { const k = dayTotals(x).kcal; return `<div title="${round(k)} kcal · ${round(dayTotals(x).p)} g protein"><i class="${k > tg.kcal * 1.05 ? 'over' : ''}" style="height:${k / mx * 100}%"></i>${PLAN[dayIdx(x)].d[0]}</div>`; }).join('')}</div>
      <h2 class="mt" style="margin-top:22px">Daily targets</h2>
      <form class="row" data-form="targets"><label class="f">kcal<input name="kcal" inputmode="numeric" value="${tg.kcal}" required></label>
        <label class="f">protein g<input name="protein" inputmode="numeric" value="${tg.protein}" required></label><button>Save</button></form></div>
  </div>
  <div class="card mt"><h2>Bodyweight</h2>${lineChart(w.map(x => ({ x: x.date.slice(5), y: x.kg })), { fmt: v => round(v, 1) + ' kg' })}
    <form class="row mt" data-form="addWeight"><input type="date" name="date" value="${today()}" required><input name="kg" inputmode="decimal" placeholder="kg" required><button class="primary">Log</button></form>
    <p class="muted small mt">Latest: ${w.length ? `${w[w.length - 1].kg} kg (${fmtDate(w[w.length - 1].date)})` : '—'}</p></div>`;
};

V.tasks = () => {
  const all = sortedTasks(), open = all.filter(t => !t.done), done = all.filter(t => t.done);
  const li = t => `<li><button class="check ${t.done ? 'on' : ''}" data-act="toggleTask" data-id="${t.id}" aria-label="Toggle"></button>
    <span class="grow ${t.done ? 'done' : ''}">${esc(t.title)}${t.date ? `<br><span class="muted small">${fmtDate(t.date)}</span>` : ''}</span>
    <span class="tag ${t.type === 'event' ? 'event' : ''}">${t.type}</span>
    ${t.date && !t.done ? `<span class="tag ${daysUntil(t.date) < 0 ? 'bad' : ''}">${rel(t.date)}</span>` : ''}
    <button class="ghost" data-act="del" data-path="tasks" data-id="${t.id}" aria-label="Delete">✕</button></li>`;
  return `<div class="head"><div><h1>Tasks & events</h1><p class="muted">${open.length} open</p></div></div>
  <div class="card"><form class="row" data-form="addTask"><input class="w2" name="title" placeholder="What" required><input type="date" name="date">
    <select name="type"><option value="task">Task</option><option value="event">Event</option></select><button class="primary">Add</button></form></div>
  <div class="card mt"><h2>Open</h2><ul class="list">${open.map(li).join('') || '<li class="muted small">All clear.</li>'}</ul></div>
  ${done.length ? `<div class="card mt"><h2>Done</h2><ul class="list">${done.map(li).join('')}</ul><button class="mt" data-act="clearDone">Clear done</button></div>` : ''}`;
};

V.settings = () => `<div class="head"><div><h1>Settings</h1><p class="muted">Data is stored online and syncs across your devices</p></div></div>
  <div class="grid g2">
    <div class="card"><h2>Backup</h2><p class="muted small">Optional: download a copy of everything, or restore one.</p>
      <div class="chips mt"><button data-act="export">Export JSON</button><label class="btn" style="cursor:pointer">Import JSON<input type="file" accept="application/json" data-change="import" hidden></label></div></div>
    <div class="card"><h2>Access</h2><p class="muted small">The password is set in Netlify (KOLSTATS_PASSWORD).</p>
      <div class="chips mt"><button data-act="lock">Lock this device</button><button class="danger" data-act="reset">Erase all data</button></div></div>
  </div>`;

/* ---------- render ---------- */
function render() {
  const r = route();
  $('#nav').innerHTML = ROUTES.map(([k, n, i]) => `${k === 'settings' ? '<span class="sep"></span>' : ''}<a href="#${k}" class="${k === r ? 'on' : ''}">${i}<span>${n}</span></a>`).join('');
  $('#view').innerHTML = V[r]();
}
const commit = () => { save(); render(); };
const at = path => path.split('.').reduce((o, k) => o[k], S);

/* ---------- actions ---------- */
const A = {
  toggleDay({ i }) { const w = S.workout.weeks[weekStart()] ||= {}; w[i] = !w[i]; },
  toggleTask({ id }) { const t = S.tasks.find(x => x.id === id); t.done = !t.done; },
  clearDone() { S.tasks = S.tasks.filter(t => !t.done); },
  del({ path, id }) { const a = at(path); a.splice(a.findIndex(x => x.id === id), 1); },
  subj({ k }) { ui.subj = k; },
  cycle({ id }) { const t = S.exam.subjects[ui.subj].topics.find(x => x.id === id); t.status = (t.status + 1) % 3; },
  toggleStep({ g, id }) { const s = S.work.goals.find(x => x.id === g).steps.find(x => x.id === id); s.done = !s.done; },
  delStep({ g, id }) { const G = S.work.goals.find(x => x.id === g); G.steps = G.steps.filter(x => x.id !== id); },
  delGoal({ id }) { if (confirm('Delete this goal?')) S.work.goals = S.work.goals.filter(x => x.id !== id); },
  mday({ n }) { ui.macroDate = addDays(ui.macroDate, +n); },
  quick({ name, kcal, p }) { (S.macros.days[ui.macroDate] ||= []).push({ id: uid(), name, kcal: +kcal, p: +p }); },
  delFood({ id }) { S.macros.days[ui.macroDate] = S.macros.days[ui.macroDate].filter(x => x.id !== id); },
  export() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = `kolstats-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
  },
  lock() { lockOut(); return false; },
  reset() { if (!confirm('Erase everything on all devices? This cannot be undone.')) return false; S = defaults(); render(); push(true); return false; },
};
const F = {
  async unlock({ pw: p, remember }) {
    $('#err').textContent = '';
    const msg = await login(p, remember);
    if (msg) $('#err').textContent = msg;
    return false;
  },
  addLift({ date, ex, w, reps }) { if (num(w) > 0 && num(reps) > 0) S.workout.lifts.push({ id: uid(), date, ex: ex.trim(), w: num(w), reps: Math.round(num(reps)) }); },
  addRun({ date, km, min, hr }) { if (num(km) > 0 && num(min) > 0) S.workout.runs.push({ id: uid(), date, km: num(km), min: num(min), hr: Math.round(num(hr)) }); },
  addTopics({ names }) { names.split('\n').map(s => s.trim()).filter(Boolean).forEach(name => S.exam.subjects[ui.subj].topics.push({ id: uid(), name, status: 0 })); },
  addMock({ date, pct, note }) { S.exam.subjects[ui.subj].mocks.push({ id: uid(), date, pct: clamp(num(pct)), note: note.trim() }); },
  addGoal({ title, note, due }) { S.work.goals.push({ id: uid(), title: title.trim(), note: note.trim(), due, steps: [] }); },
  addStep({ g, text }) { S.work.goals.find(x => x.id === g).steps.push({ id: uid(), text: text.trim(), done: false }); },
  addFood({ name, kcal, p }) { (S.macros.days[ui.macroDate] ||= []).push({ id: uid(), name: name.trim(), kcal: num(kcal), p: num(p) }); },
  targets({ kcal, protein }) { if (num(kcal) > 0 && num(protein) > 0) S.macros.targets = { kcal: Math.round(num(kcal)), protein: Math.round(num(protein)) }; },
  addWeight({ date, kg }) { if (num(kg) > 0) { S.macros.weights = S.macros.weights.filter(x => x.date !== date); S.macros.weights.push({ date, kg: num(kg) }); } },
  addTask({ title, date, type }) { S.tasks.push({ id: uid(), title: title.trim(), date, type, done: false }); },
};
const C = {
  mdate(el) { if (el.value) { ui.macroDate = el.value; render(); } },
  import(el) {
    const f = el.files[0]; if (!f) return;
    f.text().then(t => {
      const d = JSON.parse(t);
      if (d.v !== 1 || !d.workout || !d.macros) throw 0;
      if (!confirm('Replace all data on this device with this backup?')) return;
      delete d.auth; S = d; render(); push(true);
    }).catch(() => alert('Not a valid kolstats backup.'));
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (A[el.dataset.act](el.dataset) !== false) commit();
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  if (await F[f.dataset.form](Object.fromEntries(new FormData(f))) !== false) commit();
});
document.addEventListener('change', e => { const k = e.target.dataset.change; if (k) C[k](e.target); });
addEventListener('hashchange', () => { if (S) { render(); scrollTo(0, 0); } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
addEventListener('pagehide', () => { if (S && dirty) api('PUT', { rev, data: S }, true); });

(async () => {
  const stored = sessionStorage.getItem(PW_KEY) || localStorage.getItem(PW_KEY);
  if (!stored) return showLock();
  const msg = await login(stored, !!localStorage.getItem(PW_KEY));
  if (msg) { if (msg === 'Wrong password') lockOut(); else showLock(msg); }
})();
})();
