// Assemble chaque planche en un fichier HTML autonome (socle + scène inlinés).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const out = join(root, 'planches');
mkdirSync(out, { recursive: true });

const css = readFileSync(join(src, 'common.css'), 'utf8');
const common = readFileSync(join(src, 'common.js'), 'utf8');
const font3d = readFileSync(join(src, 'font3d.json'), 'utf8');
const THREE_V = '0.160.0';
const importmap = JSON.stringify({ imports: {
  three: `https://cdn.jsdelivr.net/npm/three@${THREE_V}/build/three.module.js`,
  'three/addons/': `https://cdn.jsdelivr.net/npm/three@${THREE_V}/examples/jsm/`,
} });
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap';
const BONE = '<svg viewBox="0 0 40 16" aria-hidden="true"><path fill="currentColor" d="M6 1.5a3.5 3.5 0 0 1 3.3 2.4h21.4A3.5 3.5 0 1 1 34 8a3.5 3.5 0 1 1-3.3 4.1H9.3A3.5 3.5 0 1 1 6 8a3.5 3.5 0 1 1 0-6.5Z"/></svg>';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => s.replace(/<[^>]+>/g, '');
const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>');

const pages = readdirSync(join(src, 'pages')).filter((f) => /^p\d\d\.js$/.test(f)).sort();
const metas = [];
for (const f of pages) {
  const js = readFileSync(join(src, 'pages', f), 'utf8');
  const m = js.match(/\/\*META([\s\S]*?)META\*\//);
  if (!m) throw new Error('META manquant dans ' + f);
  const meta = JSON.parse(m[1]);
  metas.push(meta);
  const n = meta.n, nn = String(n).padStart(2, '0');
  const prev = n > 1 ? `<a href="planche-${String(n - 1).padStart(2, '0')}.html" aria-label="Planche précédente">← ${String(n - 1).padStart(2, '0')}</a>` : '<span class="off">← 00</span>';
  const next = n < 10 ? `<a href="planche-${String(n + 1).padStart(2, '0')}.html" aria-label="Planche suivante">${String(n + 1).padStart(2, '0')} →</a>` : '<span class="off">11 →</span>';
  const fb = meta.steps.map((st, i) =>
    `<div class="card" style="--z:${(i % 3) * 1.2 + Math.floor(i / 3) * 0.6}"><i>${String(i + 1).padStart(2, '0')}</i><b>${rich(st.t)}</b><span>${rich(st.d)}</span></div>`).join('');
  const ico = {
    prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 2.5h2v11H3zM14 2.5v11L6 8z"/></svg>',
    next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M11 2.5h2v11h-2zM2 2.5v11L10 8z"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg>',
    reset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M3.2 6.2A5 5 0 1 1 3 9.5M3 2.8v3.6h3.6"/></svg>',
    grid: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z"/></svg>',
    l: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M10 3 5 8l5 5"/></svg>',
    r: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="m6 3 5 5-5 5"/></svg>',
  };
  const pp = String(n - 1).padStart(2, '0'), np = String(n + 1).padStart(2, '0');
  const prevA = n > 1 ? `<a href="planche-${pp}.html" aria-label="Planche précédente (${pp})">${ico.l}</a>` : `<span class="off" aria-hidden="true">${ico.l}</span>`;
  const nextA = n < 10 ? `<a href="planche-${np}.html" aria-label="Planche suivante (${np})">${ico.r}</a>` : `<span class="off" aria-hidden="true">${ico.r}</span>`;
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Bare Bones · ${nn} ${esc(meta.short)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>
<script type="importmap">${importmap}</script>
</head>
<body>
<main class="planche" id="planche">
  <div class="gl" id="gl"></div>
  <section class="sr" aria-label="Contenu de la planche">
    <p class="k">Bare Bones · Planche ${nn} / 10 · Kiroween 2026 · Skeleton Crew</p>
    <h1>${meta.title.map((l) => rich(l)).join(' ')}</h1>
    <p>${rich(meta.sub)}</p>
    <ol>${meta.steps.map((st) => `<li><b>${rich(st.t)}</b> ${rich(st.d)}</li>`).join('')}</ol>
  </section>
  <nav class="ui" aria-label="Navigation">
    <button type="button" id="prev" aria-label="Étape précédente">${ico.prev}</button>
    <button type="button" id="play" aria-label="Lecture">${ico.play}</button>
    <button type="button" id="next" aria-label="Étape suivante">${ico.next}</button>
    <span class="count" id="count" aria-live="polite">01 / ${String(meta.steps.length).padStart(2, '0')}</span>
    <button type="button" id="reset" aria-label="Recentrer la caméra">${ico.reset}</button>
    <span class="sep"></span>
    ${prevA}
    <a href="index.html" aria-label="Sommaire des dix planches">${ico.grid}</a>
    ${nextA}
  </nav>
  <div class="fallback" id="fallback" hidden>
    <div class="stack">${fb}</div>
    <p class="note">WebGL indisponible : vue isométrique CSS 3D de repli</p>
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
// Police 3D : sous-ensemble de Noto Sans Bold, SIL Open Font License 1.1
const FONT3D_DATA = ${font3d};
${common}
${js}
start();
</script>
</body>
</html>
`;
  writeFileSync(join(out, `planche-${nn}.html`), html);
  console.log('ok', `planche-${nn}.html`, (html.length / 1024).toFixed(1) + ' ko');
}

// ---------- sommaire ----------
const cards = metas.map((m) => {
  const nn = String(m.n).padStart(2, '0');
  return `<li class="card">
      <a href="planche-${nn}.html">
        ${existsSync(join(out, 'thumbs', `planche-${nn}.jpg`)) ? `<span class="th"><img src="thumbs/planche-${nn}.jpg" alt="" loading="lazy" width="640" height="360"></span>` : ''}
        <span class="no">${nn}</span>
        <span class="body">
          <span class="t">${m.title.join(' ').replace(/\*/g, '')}</span>
          <span class="i">${rich(m.intent)}</span>
          <span class="a"><b>3D</b> ${rich(m.approach)}</span>
        </span>
        <span class="go" aria-hidden="true">→</span>
      </a>
    </li>`;
}).join('\n    ');

const indexBody = `<title>Bare Bones en 3D</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
/* Sommaire : une feuille de plan d'architecte, les dix planches en cartouches numérotés. */
:root {
  --bg: #0E1A2B; --panel: #13243A; --fg: #EDE7DA; --dim: rgba(237,231,218,.68); --faint: rgba(237,231,218,.38);
  --cyan: #4CC9F0; --orange: #FF8A3D; --line: rgba(76,201,240,.2);
  --f-display: "Space Grotesk", "Segoe UI", system-ui, sans-serif; --f-body: Inter, "Segoe UI", system-ui, sans-serif; --f-mono: "JetBrains Mono", ui-monospace, Consolas, monospace;
  color-scheme: dark;
}
@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { --bg: #F4F1E9; --panel: #FFFFFF; --fg: #0E1A2B; --dim: rgba(14,26,43,.72); --faint: rgba(14,26,43,.45); --cyan: #0A7FA8; --orange: #C2560F; --line: rgba(10,127,168,.22); color-scheme: light; } }
:root[data-theme="light"] { --bg: #F4F1E9; --panel: #FFFFFF; --fg: #0E1A2B; --dim: rgba(14,26,43,.72); --faint: rgba(14,26,43,.45); --cyan: #0A7FA8; --orange: #C2560F; --line: rgba(10,127,168,.22); color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--fg); font-family: var(--f-body);
  background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 48px 48px; background-position: -1px -1px;
}
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 56px 72px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.kicker { font: 500 12px/1 var(--f-mono); letter-spacing: .18em; text-transform: uppercase; color: var(--cyan); display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
.kicker .badge { color: var(--orange); border: 1px solid currentColor; border-radius: 999px; padding: 6px 10px; }
h1 { font: 700 clamp(40px, 7vw, 84px)/.95 var(--f-display); letter-spacing: -.035em; margin: 22px 0 18px; text-wrap: balance; }
h1 span { color: var(--orange); }
.lede { max-width: 62ch; font-size: 17px; line-height: 1.55; color: var(--dim); margin: 0; }
.lede code { font-family: var(--f-mono); color: var(--orange); font-size: .92em; }
.meta { display: flex; flex-wrap: wrap; gap: 8px 22px; margin: 26px 0 0; padding: 0; list-style: none; font: 500 13px/1.3 var(--f-mono); color: var(--faint); }
.meta b { color: var(--fg); font-weight: 600; }
h2 { font: 600 13px/1 var(--f-mono); letter-spacing: .16em; text-transform: uppercase; color: var(--faint); margin: 56px 0 16px; }
ol.grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 14px; }
.grid { perspective: 1400px; }
.card a {
  height: 100%; display: grid; grid-template-columns: auto 1fr auto; gap: 14px 16px; align-items: start;
  padding: 14px 18px 20px; border-radius: 16px; text-decoration: none; color: inherit;
  background: var(--panel); border: 1px solid var(--line);
  transform-style: preserve-3d;
  transition: border-color .25s, transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s;
  box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 18px 40px -24px rgba(0,0,0,.6);
}
.card a:hover, .card a:focus-visible { border-color: var(--cyan); transform: rotateX(4deg) rotateY(-5deg) translateZ(14px); box-shadow: 0 30px 60px -28px rgba(0,0,0,.75); outline: none; }
.th { grid-column: 1 / -1; display: block; border-radius: 10px; overflow: hidden; aspect-ratio: 16 / 9; background: #0D1A2C; transform: translateZ(18px); box-shadow: 0 12px 28px -16px rgba(0,0,0,.7); }
.th img { display: block; width: 100%; height: 100%; object-fit: cover; }
.card a:focus-visible { box-shadow: 0 0 0 2px var(--cyan); }
.no { font: 700 30px/1 var(--f-display); color: var(--cyan); font-variant-numeric: tabular-nums; min-width: 1.6em; }
.body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.t { font: 600 19px/1.2 var(--f-display); letter-spacing: -.01em; text-wrap: balance; }
.i { font-size: 14.5px; line-height: 1.5; color: var(--dim); }
.a { font-size: 13px; line-height: 1.5; color: var(--faint); }
.a b { font: 600 11px/1 var(--f-mono); letter-spacing: .1em; color: var(--orange); margin-right: 4px; }
.i code, .a code, .t code { font-family: var(--f-mono); font-size: .9em; }
.go { color: var(--faint); font-size: 20px; transition: color .2s, transform .2s; }
.card a:hover .go { color: var(--cyan); transform: translateX(3px); }
footer { margin-top: 48px; font-size: 13px; line-height: 1.6; color: var(--faint); max-width: 70ch; }
@media (prefers-reduced-motion: reduce) { .card a, .go { transition: none; } .card a:hover, .card a:focus-visible { transform: none; } }
</style>
<div class="wrap">
  <div class="kicker"><span>Dossier de planches 3D</span><span class="badge">Kiroween 2026 · Skeleton Crew</span></div>
  <h1>Bare Bones,<br><span>en dix planches.</span></h1>
  <p class="lede">Déposez un fichier. Obtenez une table typée, des filtres, des graphiques et un lien <code>#bb=</code> qui rouvre exactement la même vue, sans serveur, sans base de données, sans compte. Chaque planche est une scène Three.js interactive au format 16:9, révélée étape par étape.</p>
  <ul class="meta">
    <li><b>10</b> scènes 3D interactives</li>
    <li>Three.js <b>${THREE_V}</b> · OrbitControls</li>
    <li>Repli <b>CSS 3D</b> sans WebGL</li>
    <li>Chiffres mesurés le <b>11 novembre 2026</b></li>
  </ul>
  <h2>Le plan</h2>
  <ol class="grid">
    ${cards}
  </ol>
  <footer>Chaque planche se pilote à la souris (orbite, zoom) et au clavier (← → pour les étapes). Les jeux de données affichés dans les scènes sont des exemples dans l'esprit des démos du projet : budget d'association de quartier et saison d'un club à six équipes.</footer>
</div>
`;
writeFileSync(join(out, '_artifact-index.html'), indexBody);
writeFileSync(join(out, 'index.html'), `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${indexBody}</body>\n</html>\n`);
console.log('ok index.html');
