// Assemble chaque planche en une page HTML autonome.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src'), out = join(root, 'planches');
mkdirSync(out, { recursive: true });
const stadium = 'data:image/jpeg;base64,' + readFileSync(join(src, 'assets', 'stadium.jpg')).toString('base64');
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const css = readFileSync(join(src, 'common.css'), 'utf8') + `
.site { --stadium: url(${stadium}); --grain-img: ${GRAIN}; }
`;
const common = readFileSync(join(src, 'common.js'), 'utf8');
const V = '0.160.0';
const importmap = JSON.stringify({ imports: { three: `https://cdn.jsdelivr.net/npm/three@${V}/build/three.module.js`, 'three/addons/': `https://cdn.jsdelivr.net/npm/three@${V}/examples/jsm/` } });
const FONTS = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\|/g, '<br>');

const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><g transform="rotate(-35 16 16)" fill="currentColor"><circle cx="7.4" cy="13.1" r="3.7"/><circle cx="7.4" cy="18.9" r="3.7"/><circle cx="24.6" cy="13.1" r="3.7"/><circle cx="24.6" cy="18.9" r="3.7"/><rect x="7.2" y="13.3" width="17.6" height="5.4" rx="2.7"/></g><circle cx="16" cy="16" r="1.9" fill="var(--acc)"/></svg>';
const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ACTORS = {
  dev: { name: 'Dev team', role: 'copies the skeleton', c: '#4CC9F0', icon: I('<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5"/>') },
  treso: { name: 'Treasurer', role: 'local association', c: '#FF8A3D', icon: I('<path d="M16 7.5a5.5 5.5 0 1 0 0 9"/><path d="M5 10.5h8M5 13.5h8"/>') },
  membres: { name: 'Members', role: 'just open a link', c: '#5BE3A4', icon: I('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.4-3.2 2.7-5 5.5-5s5.1 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.3"/><path d="M15.8 14.1c2.4-.3 4.4 1.3 4.7 4.4"/>') },
  club: { name: 'Sports club', role: '6 teams, 1 league table', c: '#F2C14E', icon: I('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>') },
  kiro: { name: 'Kiro', role: 'Kiroween 2026 · power', c: '#9B8CFF', icon: I('<path d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>') },
  none: { name: 'Server', role: 'none: all stays local', c: '#FF6B6B', icon: I('<rect x="4" y="4.5" width="16" height="6" rx="1"/><rect x="4" y="13.5" width="16" height="6" rx="1"/><path d="M3 21 21 3"/>') },
  bb: { name: 'Bare Bones', role: 'in the browser', c: '#F2EEE6', icon: '' },
};
const CAST = ['dev', 'treso', 'membres', 'club', 'kiro', 'none'];
const MENU = [[1, 'Overview'], [3, 'Pipeline'], [4, 'Architecture'], [7, 'Sharing'], [9, 'Numbers']];
const PROBLEM = 'A community group is handed a spreadsheet. Nobody will open it, the usual tools are too heavy, and running a server is out of the question.';
const ANSWER = 'A copy-ready data explorer that runs in the browser and is shared with a single link. Zero server, zero account.';
const chev = (d) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="${d}"/></svg>`;

const files = readdirSync(join(src, 'pages')).filter((f) => /^p\d\d\.js$/.test(f)).sort();
const exists = new Set(files.map((f) => +f.slice(1, 3)));
for (const f of files) {
  const js = readFileSync(join(src, 'pages', f), 'utf8');
  const meta = JSON.parse(js.match(/\/\*META([\s\S]*?)META\*\//)[1]);
  meta.actors = ACTORS;
  const n = meta.n, nn = String(n).padStart(2, '0');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Bare Bones · ${nn} ${esc(meta.kicker)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>
<script type="importmap">${importmap}</script>
</head>
<body>
<main class="site" id="site" data-bg="papier">
  <div class="gl" id="gl"></div>
  <div class="css3d" id="css3d"></div>
  <div class="fallback" id="fallback" hidden>${meta.steps.map((s, i) => `<div><b>${String(i + 1).padStart(2, '0')} · ${rich(s.t)}</b>${rich(s.d)}</div>`).join('')}</div>
  <div class="ui">
    <div class="frame passive"></div>
    <div class="rule passive" style="top:5.4cqw"></div>
    <div class="hatch passive" style="top:5.4cqw"></div>
    <span class="tick passive" style="left:2.8cqw;top:7.2cqw">BB-${nn}</span>
    <span class="tick passive" style="right:2.8cqw;top:7.2cqw">16:9 · 1600×900</span>
    <div class="vline passive" style="left:49.5cqw;top:6.65cqw;bottom:8.4cqw"></div>
    <header class="nav">
      <a class="brand" href="index.html" aria-label="Bare Bones">${LOGO}<b>bare bones</b></a>
      <nav class="menu" aria-label="Boards">${MENU.map(([k, l]) => (exists.has(k) && k !== n ? `<a href="planche-${String(k).padStart(2, '0')}.html">${l}</a>` : `<a${k === n ? ' aria-current="page"' : ' aria-disabled="true"'}>${l}</a>`)).join('')}</nav>
      <div class="right">
        <span class="chip-tag">Kiroween 2026 <i>·</i> Skeleton Crew</span>
        <div class="bgs" role="radiogroup" aria-label="Background"><span>Theme</span>
          <button type="button" role="radio" aria-checked="false" data-bg="encre" style="--sw:#0B0E13">Ink</button>
          <button type="button" role="radio" aria-checked="false" data-bg="papier" style="--sw:#F3F2EE">Paper</button>
          <button type="button" role="radio" aria-checked="false" data-bg="orbite" style="--sw:radial-gradient(circle at 70% 120%,#9fc3ea 0 38%,#0b0f15 42%)">Orbit</button>
        </div>
        <button type="button" class="btn-dark" id="play-top">Play the scenario</button>
      </div>
    </header>
    <section class="hero">
      <span class="label">[ ${nn} — ${esc(meta.kicker)} ]</span>
      <h1>${rich(meta.headline)}</h1>
      <p class="lead">${rich(meta.lead)}</p>
      <div class="cta">
        <button type="button" class="pill" id="play">Play the scenario <span class="arr">${chev('m6 3 5 5-5 5')}</span></button>
        <span class="cta-meta">${meta.steps.length} steps · about ${Math.round(meta.steps.length * (meta.stepTime || 7) / 5) * 5} s</span>
      </div>
      <div class="facts">${(meta.facts || []).map((x) => `<span>${rich(x)}</span>`).join('')}</div>
    </section>
    <aside class="spec" aria-label="The problem and the answer">
      <div><span class="label no">The problem</span><p>${PROBLEM}</p></div>
      <div><span class="label yes">The answer — Bare Bones</span><p>${ANSWER}</p></div>
    </aside>
    <nav class="apps" aria-label="The two apps built on this skeleton">
      <div class="apps-h"><span class="label">Two apps · <b>one skeleton</b></span><span class="label">0 lines changed in core &amp; ui</span></div>
      <a class="app orb" href="app-budget.html">
        <i style="right:-2.2cqw;top:-2.6cqw;width:8.4cqw;height:8.4cqw;background:radial-gradient(circle at 34% 30%,#FFE3C8 0,#F58A5A 38%,#E0573A 70%,#B8402E)"></i>
        <i style="right:5.2cqw;top:2.6cqw;width:2.6cqw;height:2.6cqw;background:radial-gradient(circle at 34% 30%,#F6DDFF 0,#B77BF0 40%,#7B4BD1 80%)"></i>
        <i style="right:3.6cqw;top:5.6cqw;width:1.4cqw;height:1.4cqw;background:radial-gradient(circle at 34% 30%,#E1F7E9 0,#7FD3A6 42%,#2FA472 82%)"></i>
        <span class="k">App 01 · Budget</span>
        <b>Fern Street Budget</b>
        <small>Association accounts · private, encrypted link</small>
        <span class="ft"><span class="stat">+€3,165 left</span><span class="go">Preview →</span></span>
      </a>
      <a class="app flood" href="app-club.html">
        <span class="k">App 02 · Club</span>
        <b>Riverside Six</b>
        <small>League table &amp; form · public link</small>
        <span class="ft"><span class="stat">Castors <span>23 pts</span></span><span class="go">Preview →</span></span>
      </a>
    </nav>
    <section class="cap" id="cap" hidden aria-live="polite" aria-label="Scenario step">
      <div class="sc-ticks"></div>
      <div class="row"><span class="num"></span><span class="who"></span>
        <span class="ctrl"><button type="button" id="sc-prev" aria-label="Previous step">${chev('M10 3 5 8l5 5')}</button><button type="button" id="sc-pause" aria-label="Pause or play"></button><button type="button" id="sc-next" aria-label="Next step"></button><button type="button" class="sc-close" id="sc-close" aria-label="Leave the scenario">✕</button></span></div>
      <div class="body"><h2></h2><p></p><div class="res"><span class="label">Result</span><span></span></div></div>
    </section>
    <footer class="cast" aria-label="Who is involved">
      <div class="head"><span class="label">Who’s involved</span><span class="label">6 parties</span></div>
      ${CAST.map((k) => { const a = ACTORS[k]; return `<div class="actor${k === 'none' ? ' none' : ''}" data-actor="${k}" style="--c:${a.c}"><span class="ic">${a.icon}</span><span class="tx"><b>${a.name}</b><small>${a.role}</small></span></div>`; }).join('\n      ')}
    </footer>
  </div>
</main>
<script>
window.META = ${JSON.stringify(meta)};
(function () {
  var ok = false;
  try { var c = document.createElement('canvas'); ok = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) {}
  function fb() { if (window.__bb3d) return; document.getElementById('fallback').hidden = false; }
  if (!ok) { window.__bbNoGL = true; fb(); } else { setTimeout(fb, 12000); }
})();
</script>
<script type="module">
${common}
${js}
start();
</script>
</body>
</html>
`;
  writeFileSync(join(out, `planche-${nn}.html`), html);
  // variante pour publication en artifact : sans doctype/html/head/body (la plateforme les ajoute)
  const art = html.replace(/<!doctype html>\s*<html lang="en">\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*/, '').replace(/<\/head>\s*<body>\s*/, '').replace(/\s*<\/body>\s*<\/html>\s*$/, '\n');
  writeFileSync(join(out, `planche-${nn}.artifact.html`), art);
  console.log('ok', `planche-${nn}.html`, (html.length / 1024).toFixed(0) + ' ko');
}
