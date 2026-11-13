/*META{
"n": 1, "kicker": "Overview",
"headline": "Drop a spreadsheet.|Share an *explorer.*",
"lead": "Bare Bones turns a plain CSV into a typed table, filters, charts and a share link. Everything happens in the browser: no server, no account.",
"alt": "A spine made of glowing threads. During the scenario the threads move from the chaos of a raw CSV to typed columns, then a bar chart, then a single thread: the #bb= link.",
"steps": [
  {"who": "dev", "t": "The dev team copies *the skeleton.*", "d": "One command: `pnpm create bare-bones`. The skeleton has five extension points and reads in about an hour.", "r": "An empty explorer, ready for data."},
  {"who": "treso", "t": "The treasurer gets *a raw bank export.*", "d": "The neighbourhood association exports its accounts as CSV: three date formats, commas and dots mixed up.", "r": "A file nobody wants to open."},
  {"who": "treso", "also": ["none"], "t": "The file is read *in the browser.*", "d": "Dropped into Bare Bones, it is parsed in the background: encoding, dates, numbers. Nothing is sent to a server.", "r": "The raw data starts to line up."},
  {"who": "bb", "t": "Every column *gets a type.*", "d": "Date, text, category, amount. Rows that fail to parse stay visible in a separate panel.", "r": "A clean table you can sort and filter."},
  {"who": "bb", "also": ["treso"], "t": "Filters and charts *build themselves.*", "d": "Amount ranges, categories, search: totals and charts update on every click, with no chart library.", "r": "A clear view of the budget, no formulas."},
  {"who": "treso", "t": "The whole view fits *in one link.*", "d": "Filters, sort order and chart are encoded in the URL's `#bb=` fragment, which never reaches the server.", "r": "A link to paste into a message."},
  {"who": "membres", "also": ["none"], "t": "Members open *the same view.*", "d": "On their phones, with no account and nothing to install, they see exactly what the treasurer prepared.", "r": "Everyone sees the same numbers."},
  {"who": "club", "also": ["dev"], "t": "Same skeleton, *a second app.*", "d": "The sports club plugs match results, the league table and form streaks into the same five extension points. Not one line of the skeleton changes.", "r": "Two very different apps, one shared core."},
  {"who": "club", "also": ["membres", "none"], "t": "The league table, *shared publicly.*", "d": "After each match day the club posts a short public `#bb=` link. Players and parents open the table on their phones, no account needed.", "r": "Six teams, one table, one link."}
]
}META*/

const REG = ['importers', 'derivations', 'reducers', 'views', 'shareAdapters'];
const SPINE = { spine: 1 };

idleState({ shape: SPINE, cam: { az: 0.42, el: 0.16, dist: 29, ty: -2.1 } });
state(0, { shape: SPINE, cam: { az: 0.5, el: 0.14, dist: 19 } });
state(1, { shape: { chaos: 1 }, cam: { az: 0.25, el: 0.2, dist: 21 } });
state(2, { shape: { chaos: 0.4, cols: 0.6, tint: 0.45 }, cam: { az: 0.18, el: 0.16, dist: 21 } });
state(3, { shape: { cols: 1, tint: 1 }, cam: { az: 0.12, el: 0.14, dist: 20.5 } });
state(4, { shape: { bars: 1, tint: 1 }, cam: { az: 0.3, el: 0.22, dist: 20 } });
state(5, { shape: { thread: 1, accent: 1 }, cam: { az: 0.2, el: 0.12, dist: 19 } });
state(6, { shape: { bars: 1, tint: 1 }, cam: { az: -0.2, el: 0.18, dist: 22 } });
state(7, { shape: { spine: 1, accent: .55 }, cam: { az: 0.55, el: 0.14, dist: 19 } });
state(8, { shape: { cols: 1, tint: 1 }, cam: { az: -0.25, el: 0.16, dist: 22 } });

// the skeleton: five extension points
REG.forEach((r, i) => label(`<b>${r}</b>`, [1.75, 2.1 - i * 1.05, 0.2], { cls: 'lab3d min', c: 'var(--acc-2)', steps: ['idle', 0] }));
label('<span class="k">Skeleton</span><b>5 extension points</b><span>everything else stays fixed</span>', [-2.6, 2.3, 0], { steps: ['idle'] });
label('<span class="k">skeleton/</span><b>81 lines</b><span>readable in an hour</span>', [-2.6, 2.3, 0], { steps: [0], c: 'var(--acc-2)' });

// raw export
label('<span class="k" style="color:var(--acc)">statement-2026.csv</span><b>Raw data</b><span>08/01/26;Dues;1 240,00<br>"15/01/2026";Hall rent;-380<br>03-02-2026;Grant;2500.00</span>', [-3.4, 1.9, 0], { steps: [1] });
label('<b>broken encoding</b>', [2.6, 1.9, 0.4], { cls: 'lab3d min', c: 'var(--no)', steps: [1] });
label('<b>3 date formats</b>', [3.1, -1.1, 0.2], { cls: 'lab3d min', c: 'var(--no)', steps: [1] });

// local parsing
label('<span class="k" style="color:var(--ok)">Local parsing</span><b>In the browser</b><span>encoding · dates · numbers</span>', [-0.9, 2.35, 0], { steps: [2] });

// typed table: one label per column
[['date', 'var(--acc-2)'], ['text', 'var(--fg)'], ['category', 'var(--ok)'], ['amount', 'var(--acc)']].forEach(([t, c], k) => label(`<b>${t}</b>`, [(k - 1.5) * 2.25, 2.6, 0], { cls: 'lab3d min', c, steps: [3] }));
label('<span class="k">Typed table</span><b>6 rows · 0 rejected</b>', [-5.4, -0.6, 0], { steps: [3] });

// charts
label('<span class="k" style="color:var(--acc)">Charts</span><b>100% home-made</b><span>no chart library</span>', [3.9, 2.2, 0], { steps: [4] });
label('<b>filter: Activities</b>', [-3.2, 1.6, 0.2], { cls: 'lab3d min', c: 'var(--ok)', steps: [4] });

// the link
label('<div class="url3d">…/budget/<em>#bb=eJzNk8t…</em></div>', [0, 1.05, 0], { cls: '', steps: [5] });
label('<b>the fragment never leaves the browser</b>', [0, -0.95, 0], { cls: 'lab3d min', c: 'var(--acc)', steps: [5] });

// the members' phone
label(`<div class="phone3d"><div class="scr"><div class="u">…/budget/<em>#bb=eJzNk8t…</em></div><h6>Budget 2026</h6><p class="s">filter: Activities</p><div class="kp"><div>Income<b>+€12,480</b></div><div>Expenses<b>−€9,315</b></div></div><div class="br"><i style="height:48%"></i><i style="height:30%"></i><i style="height:82%"></i><i style="height:56%"></i><i style="height:94%"></i><i style="height:40%"></i></div><p class="ft">Same view as the treasurer · no account</p></div></div>`, [2.6, -0.4, 3.0], { cls: '', sprite: false, rot: [0, -0.15, 0], scale: 0.0082, steps: [6] });
label('<span class="k" style="color:var(--ok)">Members</span><b>Same view</b><span>no account, nothing to install</span>', [-3.9, 1.4, 0], { steps: [6] });

// le club : mêmes cinq points d'extension, autres modules
const CLUB = ['match results', 'points & goal diff.', 'league table', 'form streaks', 'public link'];
REG.forEach((r, i) => label(`<b>${r}</b><span style="font:500 12px/1 var(--f-mono);color:var(--acc)">→ ${CLUB[i]}</span>`, [1.75, 2.1 - i * 1.05, 0.2], { cls: 'lab3d min', c: 'var(--acc)', steps: [7] }));
label('<span class="k" style="color:var(--acc)">apps/club-results</span><b>Same 5 slots, new modules</b><span>0 lines changed in core &amp; ui</span>', [-3.9, 1.8, 0], { steps: [7] });
// le téléphone du club, au style Floodlight
const TEAMS = [['Castors', '#38BDF8', 23], ['Herons', '#E2E8F0', 19], ['Otters', '#22C55E', 15], ['Falcons', '#F59E0B', 13], ['Lynx', '#A78BFA', 9], ['Swifts', '#64748B', 6]];
label(`<div class="phone3d"><div class="scr" style="background:radial-gradient(120% 55% at 50% -5%,rgba(56,189,248,.3),rgba(56,189,248,0) 60%),linear-gradient(180deg,#0A1120,#05070C)"><div class="u">…/club-results/<em style="color:#7DD3FC">#bb=r2Vx9…</em></div><h6 style="font-weight:800;letter-spacing:-.05em">League <span style="font-weight:300;color:#7DD3FC">table</span></h6><p class="s">Riverside Six · week 12</p>${TEAMS.map(([n, c, p], i) => `<div style="display:flex;align-items:center;gap:9px;margin-top:6px;padding:8px 10px;border-radius:11px;${i === 0 ? 'background:linear-gradient(90deg,rgba(56,189,248,.28),rgba(56,189,248,.06));box-shadow:inset 0 0 0 1px rgba(125,211,252,.45)' : 'background:rgba(238,242,247,.04)'}"><span style="font:600 10px/1 var(--f-mono);opacity:.55;width:10px">${i + 1}</span><i style="width:14px;height:16px;background:${c};clip-path:polygon(0 0,100% 0,100% 62%,50% 100%,0 62%)"></i><span style="flex:1;font:600 13px/1 var(--f-sans)">${n}</span><b style="font:800 16px/1 var(--f-sans)">${p}</b></div>`).join('')}<p class="ft">Public link · opens on any phone</p></div></div>`, [2.6, -0.4, 3.0], { cls: '', sprite: false, rot: [0, -0.15, 0], scale: 0.0082, steps: [8] });
label('<span class="k" style="color:var(--acc)">Club</span><b>Public, compact link</b><span>players &amp; parents, no account</span>', [-3.9, 1.4, 0], { steps: [8] });
