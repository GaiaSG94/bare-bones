/*META{
"n": 4, "short": "Architecture",
"title": ["Trois étages,", "*un seul sens* de dépendance."],
"sub": "Un monorepo pnpm en TypeScript : le moteur en bas, le kit d'interface au milieu, les applications en haut. Les outils et les gardes CI tout autour.",
"steps": [
  {"t": "`packages/core`", "d": "Le moteur, en TypeScript pur, sans DOM : import, query, state, share, export, config, i18n."},
  {"t": "`packages/ui`", "d": "Le kit React, sans logique métier : explorateur, mise en page, filtres, grille, graphiques, partage, thème."},
  {"t": "Squelette, apps, exemples", "d": "Un starter de 81 lignes, deux apps et deux exemples, tous branchés sur les mêmes paquets, sans les modifier."},
  {"t": "Les outils autour", "d": "`create-bare-bones` pour échafauder, un Kiro power, `tools/doctor` et un Worker qui stocke les instantanés."},
  {"t": "Les gardes CI", "d": "Budgets de lignes et de poids, API publique seulement, gardes HTML et no-sound : la CI bloque tout écart."}
],
"intent": "Donner la carte du dépôt : qui dépend de qui, et ce qui veille autour.",
"approach": "Vue éclatée isométrique : trois plateaux flottants (core, ui, apps) portant leurs modules, reliés par des flux descendants ; outils à droite ; pylônes de garde CI en anneau."
}META*/

studio();
setView([16.5, 15.5, 24.5], [-1.6, 3.4, 2.0], 24);
shot(0, [12, 7.5, 16], [0.4, 1.0, 0]);
shot(1, [12.5, 10, 17], [0.4, 2.4, 0]);
shot(2, [14, 13, 19], [0.6, 3.6, 0]);
shot(3, [18, 12, 15], [5.6, 1.6, -2.4]);
shot(4, [16.5, 15.5, 24.5], [-1.6, 3.4, 2.0]);

function mod(name, w, d, accent) {
  const g = group(rbox(w, 0.42, d, M.ceramic(), [0, 0.21, 0], 0.07));
  g.add(rbox(w - 0.08, 0.05, 0.06, M.glow(accent, 1.6), [0, 0.2, d / 2 + 0.005], 0.02));
  const tp = textPlane(w, d, (ctx, W, H) => { font(ctx, 600, Math.min(H * 0.26, W / (name.length * 0.62)), FM); ctx.fillStyle = '#16273E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, W / 2, H / 2); }, { px: 300 });
  tp.rotation.x = -Math.PI / 2; tp.position.y = 0.425; g.add(tp);
  return g;
}
function deck(y, w, d, accent, names, cols = 4) {
  const g = new THREE.Group();
  const slab = rbox(w, 0.24, d, M.ink(0x15263D), [0, 0, 0], 0.1); slab.receiveShadow = true; g.add(slab);
  const rim = tube(curveOf([[-w / 2, 0.13, d / 2], [w / 2, 0.13, d / 2]], false, 0), 0.025, M.glow(accent, 1.8), 4); g.add(rim);
  const mw = (w - 0.6 - (cols - 1) * 0.25) / cols;
  names.forEach((n, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const rowCount = Math.min(cols, names.length - r * cols);
    const x0 = -((rowCount - 1) * (mw + 0.25)) / 2;
    const m = mod(n, mw, 1.25, accent);
    m.position.set(x0 + c * (mw + 0.25), 0.12, -0.8 + r * 1.6);
    g.add(m);
  });
  g.position.y = y;
  scene.add(g);
  return g;
}
aoBlob(12, 8, [0, 0, 0], 0.55);
const core = deck(0.8, 8.2, 4.4, COL.cyan, ['import/', 'query/', 'state/', 'share/', 'export/', 'config/', 'i18n/']);
const ui = deck(3.4, 8.2, 4.4, COL.orange, ['explorer/', 'layout/', 'filters/', 'grid/', 'charts/', 'share/', 'theme/']);
at(0, core, { drop: -1.2, dur: 1 });
at(1, ui, { drop: 1.6, dur: 1 });

// étage du haut : squelette, apps, exemples
const top = new THREE.Group(); top.position.y = 6.0; scene.add(top);
const topSlab = rbox(8.2, 0.24, 4.4, M.ink(0x15263D), [0, 0, 0], 0.1); top.add(topSlab);
top.add(tube(curveOf([[-4.1, 0.13, 2.2], [4.1, 0.13, 2.2]], false, 0), 0.025, M.glow(COL.bone, 1.6), 4));
const sk = mod('skeleton/ · 81 l.', 2.3, 1.4, COL.bone); sk.position.set(-2.6, 0.12, -0.75); sk.scale.y = 1.6; top.add(sk);
const a1 = mod('apps/nonprofit-budget', 4.4, 1.25, COL.cyan); a1.position.set(1.55, 0.12, -0.8); top.add(a1);
const a2 = mod('apps/club-results', 3.4, 1.25, COL.orange); a2.position.set(-1.9, 0.12, 0.85); top.add(a2);
const e1 = mod('examples/candy-census', 2.0, 0.6, COL.violet); e1.position.set(2.15, 0.12, 0.55); top.add(e1);
const e2 = mod('examples/library-loans', 2.0, 0.6, COL.violet); e2.position.set(2.15, 0.12, 1.4); top.add(e2);
at(2, top, { drop: 1.8, dur: 1 });

// flux de dépendance : apps → ui → core
[[-2.8, -1.2], [0, 0.4], [2.8, -1.2]].forEach(([x, z], i) => {
  const c1 = curveOf([[x, 5.95, z], [x, 3.75, z]]), c2 = curveOf([[x, 3.35, z], [x, 1.15, z]]);
  const r1 = tube(c1, 0.02, M.soft(COL.bone, 0.35), 8), r2 = tube(c2, 0.02, M.soft(COL.bone, 0.35), 8);
  const f1 = flow(c1, { n: 4, color: COL.bone, speed: 0.4, size: 0.04, offset: i * 0.2 }), f2 = flow(c2, { n: 4, color: COL.cyan, speed: 0.4, size: 0.04, offset: i * 0.3 });
  scene.add(r1, r2, f1, f2);
  at(1, r2, { drop: 0 }); at(1, f2, { drop: 0 }); at(2, r1, { drop: 0 }); at(2, f1, { drop: 0 });
});

at(0, callout([-4.1, 0.9, 2.2], [-2.6, -0.6, 0], { kicker: '@bare-bones/core', title: 'Moteur TS pur', body: 'sans DOM · 3 258 / 3 300 lignes', w: 2.5 }), { delay: 0.8, drop: 0 });
at(1, callout([-4.1, 3.5, 2.2], [-2.6, 0.2, 0], { kicker: '@bare-bones/ui', title: 'Kit React', body: 'sans logique métier · 4 364 / 4 400', accent: CSS.orange, w: 2.5 }), { delay: 0.8, drop: 0 });
at(2, callout([2.6, 6.6, -0.8], [3.2, 1.0, 0], { kicker: 'Consommateurs', title: 'Mêmes paquets, zéro patch', body: 'squelette, 2 apps, 2 exemples', accent: CSS.bone, w: 2.7 }), { delay: 0.8, drop: 0 });

// outils, à droite
const tools = new THREE.Group(); scene.add(tools);
function toolBase(x, z, name, sub) {
  const g = group(cyl(0.75, 0.8, 0.2, M.ceramic(), [0, 0.1, 0], 48));
  const pl = group(rbox(1.7, 0.42, 0.06, M.plate(), [0, 0, 0], 0.06));
  pl.add(place(textPlane(1.7, 0.42, (ctx, W, H) => { const s = W / 1.7; richLine(ctx, name, 0.1 * s, 0.2 * s, { color: CSS.bone, size: 0.12 * s, weight: 600, fam: FM }); richLine(ctx, sub, 0.1 * s, 0.34 * s, { color: CSS.boneDim, size: 0.085 * s }); }, { px: 380 }), [0, 0, 0.032]));
  place(pl, [0, 0.32, 0.95], [-0.35, 0, 0]); g.add(pl);
  g.position.set(x, 0, z); tools.add(g); aoBlob(2.4, 2.4, [x, 0, z], 0.4);
  return g;
}
const t1 = toolBase(6.4, -5.6, 'create-bare-bones', 'pnpm create bare-bones my-app');
const term = group(rbox(1.0, 0.7, 0.12, M.ink(0x0A1422), [0, 0, 0], 0.06));
term.add(place(textPlane(1.0, 0.7, (ctx, W, H) => { font(ctx, 700, H * 0.3, FM); ctx.fillStyle = CSS.green; ctx.fillText('>_', W * 0.12, H * 0.6); }, { px: 300 }), [0, 0, 0.062]));
place(term, [0, 0.7, 0], [-0.1, -0.5, 0]); t1.add(term);
const t2 = toolBase(8.6, -3.8, 'power/bare-bones', 'skill Kiro · 10 datasets dorés');
const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), M.candy(COL.violet, 0.5)); gem.position.y = 0.95; gem.castShadow = true; t2.add(gem);
for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; t2.add(rbox(0.12, 0.12, 0.12, M.candy(COL.gold, 0.35), [Math.cos(a) * 0.62, 0.95, Math.sin(a) * 0.62], 0.025)); }
onTick((t) => { gem.rotation.y = t * 0.8; });
const t3 = toolBase(7.0, -1.6, 'tools/doctor', 'diagnostic du dépôt');
t3.add(rbox(0.22, 0.7, 0.22, M.candy(COL.green, 0.4), [0, 0.6, 0], 0.05), rbox(0.7, 0.22, 0.22, M.candy(COL.green, 0.4), [0, 0.6, 0], 0.05));
const t4 = toolBase(9.2, 0.6, 'infra/snapshot-store', 'Worker d\'instantanés');
[0, 1, 2].forEach((k) => t4.add(cyl(0.42, 0.42, 0.2, M.ink(COL.navy2), [0, 0.38 + k * 0.26, 0], 40), torus(0.42, 0.012, M.glow(COL.cyan, 1.6), [0, 0.48 + k * 0.26, 0], [Math.PI / 2, 0, 0])));
[t1, t2, t3, t4].forEach((t, i) => at(3, t, { delay: i * 0.15 }));

// gardes CI : pylônes en anneau
const guards = ['Budget de lignes', 'Poids gzippé ≤ 200 ko', 'API publique seulement', 'Garde injection HTML', 'Garde no-sound'];
guards.forEach((gname, i) => {
  const a = Math.PI * 0.62 + (i / (guards.length - 1)) * Math.PI * 1.1;
  const x = Math.cos(a) * 6.6, z = Math.sin(a) * 4.4 + 0.4;
  const g = group(cyl(0.22, 0.26, 0.16, M.ceramic(), [0, 0.08, 0], 32), capsule([0, 0.2, 0], [0, 3.4, 0], 0.07, M.candy(COL.orange, 0.6)));
  const sh = new THREE.Shape(); sh.moveTo(0, 0.42); sh.quadraticCurveTo(0.32, 0.4, 0.34, 0.2); sh.quadraticCurveTo(0.3, -0.25, 0, -0.42); sh.quadraticCurveTo(-0.3, -0.25, -0.34, 0.2); sh.quadraticCurveTo(-0.32, 0.4, 0, 0.42);
  const shield = extrude(sh, 0.08, M.candy(COL.orange, 0.3), 0.02); shield.position.set(0, 3.0, 0.08); g.add(shield);
  const pl = group(rbox(1.9, 0.36, 0.05, M.plate(), [0, 0, 0], 0.05));
  pl.add(place(textPlane(1.9, 0.36, (ctx, W, H) => { font(ctx, 600, H * 0.38, FD); ctx.fillStyle = CSS.bone; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(gname, W / 2, H * 0.55); }, { px: 380 }), [0, 0, 0.027]));
  pl.position.set(0, 3.85, 0); pl.scale.setScalar(1.5); pl.userData.billboard = { fixed: true }; billboards.push(pl); g.add(pl);
  g.position.set(x, 0, z); scene.add(g);
  at(4, g, { delay: i * 0.12, drop: 0.8 });
});
