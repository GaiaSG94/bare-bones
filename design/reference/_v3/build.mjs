// Assemble chaque planche en une page HTML autonome (socle CSS/JS + scène inlinés).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const out = join(root, 'planches');
mkdirSync(out, { recursive: true });
const css = readFileSync(join(src, 'common.css'), 'utf8');
const common = readFileSync(join(src, 'common.js'), 'utf8');
const V = '0.160.0';
const importmap = JSON.stringify({ imports: { three: `https://cdn.jsdelivr.net/npm/three@${V}/build/three.module.js`, 'three/addons/': `https://cdn.jsdelivr.net/npm/three@${V}/examples/jsm/` } });
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>');

const LOGO = `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="lgT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#21466E"/><stop offset=".55" stop-color="#11243C"/><stop offset="1" stop-color="#0A1422"/></linearGradient><linearGradient id="lgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D8D0C0"/></linearGradient><radialGradient id="lgG" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#4CC9F0" stop-opacity=".55"/><stop offset="1" stop-color="#4CC9F0" stop-opacity="0"/></radialGradient></defs><rect x="1" y="1" width="46" height="46" rx="14" fill="url(#lgT)"/><rect x="1" y="1" width="46" height="46" rx="14" fill="url(#lgG)"/><rect x="1.5" y="1.5" width="45" height="45" rx="13.5" fill="none" stroke="rgba(255,255,255,.18)"/><g transform="rotate(-38 24 24)" fill="url(#lgB)"><circle cx="13.6" cy="20.2" r="4.5"/><circle cx="13.6" cy="27.8" r="4.5"/><circle cx="34.4" cy="20.2" r="4.5"/><circle cx="34.4" cy="27.8" r="4.5"/><rect x="13" y="20.7" width="22" height="6.6" rx="3.3"/></g><circle cx="24" cy="24" r="2.3" fill="#FF8A3D"/></svg>`;
const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ACTORS = {
  dev: { name: 'Équipe dev', role: 'copie le squelette en 1 h', c: '#4CC9F0', icon: I('<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5"/>') },
  treso: { name: 'Trésorerie', role: 'association de quartier', c: '#FF8A3D', icon: I('<path d="M16 7.5a5.5 5.5 0 1 0 0 9"/><path d="M5 10.5h8M5 13.5h8"/>') },
  membres: { name: 'Membres', role: 'consultent sans Excel', c: '#5BE3A4', icon: I('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.4-3.2 2.7-5 5.5-5s5.1 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.3"/><path d="M15.8 14.1c2.4-.3 4.4 1.3 4.7 4.4"/>') },
  club: { name: 'Club sportif', role: '6 équipes, un classement', c: '#F2C14E', icon: I('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>') },
  kiro: { name: 'Kiro', role: 'Kiroween 2026 · génère des apps', c: '#9B8CFF', icon: I('<path d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>') },
  none: { name: 'Serveur', role: 'aucun : tout reste local', c: '#FF6B6B', icon: I('<rect x="4" y="4.5" width="16" height="6" rx="1.6"/><rect x="4" y="13.5" width="16" height="6" rx="1.6"/>') },
  bb: { name: 'Bare Bones', role: 'dans le navigateur', c: '#2A8FD0', icon: I('<g transform="rotate(-38 12 12)"><circle cx="6.8" cy="10.2" r="2.1"/><circle cx="6.8" cy="13.8" r="2.1"/><circle cx="17.2" cy="10.2" r="2.1"/><circle cx="17.2" cy="13.8" r="2.1"/><path d="M7 12h10"/></g>') },
};
const CAST = ['dev', 'treso', 'membres', 'club', 'kiro', 'none'];
const SLOGAN = 'Déposez un tableur. Partagez un explorateur.';
const PROBLEM = "Une association reçoit un tableur. Personne ne l'ouvrira, les outils sont trop lourds, et un serveur est hors de question.";
const ANSWER = "Un explorateur prêt à copier, qui tourne dans le navigateur et se partage par un simple lien. Zéro serveur.";
const BGS = [['nuit', 'Nuit', 'linear-gradient(135deg,#0B1626,#1E3B5C 55%,#4CC9F0)'], ['porcelaine', 'Porcelaine', 'linear-gradient(135deg,#FBF8F2,#E7E0D2 60%,#FFD2B0)'], ['plan', 'Plan', 'repeating-linear-gradient(0deg,#0E1A2B 0 5px,#21486B 5px 6px),#0E1A2B'], ['aurore', 'Aurore', 'linear-gradient(135deg,#060A13,#2BB5C9 45%,#8A6CF0 70%,#FF8A3D)'], ['graphite', 'Graphite', 'conic-gradient(from 200deg,#15161B,#3A3D49,#6C6F7E,#15161B)']];
const chev = (d) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="${d}"/></svg>`;

const pages = readdirSync(join(src, 'pages')).filter((f) => /^p\d\d\.js$/.test(f)).sort();
const metas = [];
for (const f of pages) {
  const js = readFileSync(join(src, 'pages', f), 'utf8');
  const meta = JSON.parse(js.match(/\/\*META([\s\S]*?)META\*\//)[1]);
  meta.actors = ACTORS;
  metas.push(meta);
}
const total = 10;
for (const meta of metas) {
  const n = meta.n, nn = String(n).padStart(2, '0');
  const js = readFileSync(join(src, 'pages', `p${nn}.js`), 'utf8');
  const has = (k) => metas.some((m) => m.n === k);
  const pp = String(n - 1).padStart(2, '0'), np = String(n + 1).padStart(2, '0');
  const prev = n > 1 && has(n - 1) ? `<a href="planche-${pp}.html" aria-label="Planche précédente">${chev('M10 3 5 8l5 5')}</a>` : `<span class="off" aria-hidden="true">${chev('M10 3 5 8l5 5')}</span>`;
  const next = n < total && has(n + 1) ? `<a href="planche-${np}.html" aria-label="Planche suivante">${chev('m6 3 5 5-5 5')}</a>` : `<span class="off" aria-hidden="true">${chev('m6 3 5 5-5 5')}</span>`;
  const st = meta.stepTime || 6.5;
  const html = `<!doctype html>
<html lang="fr">
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
<main class="site" id="site" data-bg="nuit">
  <div class="stage" id="stage">
    <div class="css3d" id="css3d"></div>
    <div class="fallback" id="fallback" hidden><div class="stack">${meta.steps.map((s, i) => `<div><b>${i + 1}. ${rich(s.t)}</b>${rich(s.d)}</div>`).join('')}</div></div>
  </div>
  <div class="ui">
    <header class="nav">
      <a class="brand" href="index.html" aria-label="Bare Bones, sommaire des planches">${LOGO}<span class="name">Bare Bones</span><span class="slogan">${SLOGAN}</span></a>
      <nav class="pager" aria-label="Planches">${prev}<span class="where"><b>${nn}</b> / ${total} · ${esc(meta.kicker)}</span>${next}</nav>
      <span class="event">Kiroween 2026 · Skeleton Crew</span>
      <div class="bgpick" role="radiogroup" aria-label="Choisir le fond"><span class="lbl">Fond</span>${BGS.map(([k, l, sw]) => `<button type="button" role="radio" aria-checked="false" data-bg="${k}" aria-label="${l}" title="${l}" style="--sw:${sw}"></button>`).join('')}</div>
    </header>
    <section class="hero layer" data-depth="1.2">
      <p class="eyebrow">${nn} <i>/</i> ${esc(meta.kicker)}</p>
      <h1>${rich(meta.headline)}</h1>
      <p class="lead">${rich(meta.lead)}</p>
      <div class="cta">
        <button type="button" class="btn primary" id="play"><span class="ic"><svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4.5 2.8v10.4L13 8z"/></svg></span>Lancer le scénario</button>
        <span class="meta">${meta.steps.length} étapes · ${Math.round((meta.steps.length * st) / 5) * 5} s</span>
      </div>
    </section>
    <section class="scenario" id="scenario" hidden aria-live="polite" aria-label="Scénario pas à pas">
      <div class="sc-top"><span class="k">Scénario</span><div class="sc-bar"></div><button type="button" class="sc-close" id="sc-close">Fermer</button></div>
      <div class="sc-body">
        <div class="sc-who"></div>
        <p class="sc-step"></p>
        <h2 class="sc-title"></h2>
        <p class="sc-text"></p>
        <div class="sc-result"><span class="k">Résultat</span><p></p></div>
      </div>
      <div class="sc-ctrl">
        <button type="button" id="sc-prev" aria-label="Étape précédente">${chev('M10 3 5 8l5 5')}</button>
        <button type="button" id="sc-pause" aria-label="Pause ou lecture"></button>
        <button type="button" id="sc-next" aria-label="Étape suivante"></button>
        <span class="hint">← → étapes · Espace pause · Échap quitter</span>
      </div>
    </section>
    <aside class="mission layer" data-depth="0.8" aria-label="Le problème et la réponse">
      <div><span class="k">Le problème</span><p>${PROBLEM}</p></div>
      <div><span class="k">La réponse</span><p>${ANSWER}</p></div>
    </aside>
    <footer class="cast layer" data-depth="0.6" aria-label="Qui est impliqué">
      <span class="k">Qui est<br>impliqué</span>
      ${CAST.map((k) => { const a = ACTORS[k]; return `<div class="actor${k === 'none' ? ' none' : ''}" data-actor="${k}" style="--c:${a.c}"><span class="av">${a.icon}</span><span class="tx"><b>${a.name}</b><small>${a.role}</small></span></div>`; }).join('\n      ')}
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
  console.log('ok', `planche-${nn}.html`, (html.length / 1024).toFixed(0) + ' ko');
}
