/*META{
"n": 8, "short": "Garanties",
"title": ["Un squelette", "qui *refuse de grossir*."],
"sub": "Lignes de code, poids des bundles, API publique : les budgets sont mesurés par la machine et bloquent la CI au moindre dépassement.",
"steps": [
  {"t": "Plafonds de lignes", "d": "Total 7 703 / 8 000 lignes hors tests ; core 3 258 / 3 300 ; ui 4 364 / 4 400 ; squelette 81 / 300."},
  {"t": "Poids gzippé ≤ 200 ko", "d": "Chaque site pèse entre 113,6 et 116,0 ko gzippés, sous un plafond de 200 ko vérifié en CI."},
  {"t": "API publique seulement", "d": "L'API est gelée dans `docs/CONTRACTS.md` ; une garde refuse tout import qui passe à côté."},
  {"t": "14 propriétés fast-check", "d": "Quatorze propriétés testées à graines fixes (seed 20261111) : mêmes entrées, mêmes résultats, à chaque fois."},
  {"t": "Recette E.17 : 9 / 9", "d": "Les neuf critères d'acceptation passent. Le budget tient, le squelette reste lisible en une heure."}
],
"intent": "Rendre tangibles les budgets bloquants qui empêchent le squelette de grossir.",
"approach": "Rangée de jauges de verre remplies jusqu'à leur plafond orange ; portique « API publique seulement » ; 14 dés en orbite autour d'une graine ; neuf dalles cochées."
}META*/

studio();
setView([1.6, 6.4, 16], [-0.4, 2.3, 0]);
shot(1, [5.4, 5.2, 12.5], [3.0, 2.2, 0]);
shot(2, [8.2, 5.0, 9.5], [5.6, 2.0, -2.4]);
shot(3, [-3.2, 4.2, 10.5], [-5.6, 1.4, 1.5]);
shot(4, [1.6, 8.2, 22.5], [-1.0, 2.0, 0.4]);

// jauges
const base = rbox(9.6, 0.3, 1.7, M.ceramic(), [0, 0.15, 0], 0.1); base.receiveShadow = true; scene.add(base); aoBlob(12, 3.6, [0, 0, 0], 0.5);
at(0, base, { drop: 0 });
const H = 3.5;
const G = [
  ['7 703', '/ 8 000', 'Total', 'lignes hors tests', 7703 / 8000, COL.cyan, 0],
  ['3 258', '/ 3 300', 'core', 'lignes', 3258 / 3300, COL.cyan, 0],
  ['4 364', '/ 4 400', 'ui', 'lignes', 4364 / 4400, COL.cyan, 0],
  ['81', '/ 300', 'squelette', 'lignes', 81 / 300, COL.green, 0],
  ['116,0', '/ 200 ko', 'Bundle', 'gzippé, max.', 116 / 200, COL.orange, 1],
];
G.forEach(([v, cap, name, sub, f, col, step], i) => {
  const x = -3.8 + i * 1.9;
  const g = new THREE.Group(); g.position.set(x, 0.3, 0); scene.add(g);
  g.add(cyl(0.48, 0.5, 0.12, M.chrome(), [0, 0.06, 0]));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, H, 48, 1, true), M.frost(0xdff4ff, 0.95)); glass.position.y = H / 2 + 0.12; g.add(glass);
  g.add(torus(0.42, 0.025, M.chrome(), [0, 0.12, 0], [Math.PI / 2, 0, 0]));
  const ceil = torus(0.46, 0.04, M.candy(COL.orange, 0.9), [0, H + 0.12, 0], [Math.PI / 2, 0, 0]); g.add(ceil);
  const fgeo = new THREE.CylinderGeometry(0.34, 0.34, H * f, 48); fgeo.translate(0, (H * f) / 2, 0);
  const fill = new THREE.Mesh(fgeo, M.candy(col, 0.45)); fill.position.y = 0.13; g.add(fill);
  const top = text3D(v, { size: 0.34, depth: 0.08, align: 'center' }); top.position.set(0, H + 0.62, 0); g.add(top);
  const capP = textPlane(1.6, 0.26, (ctx, W, Hh) => { font(ctx, 500, Hh * 0.6, FM); ctx.fillStyle = CSS.orange; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cap, W / 2, Hh * 0.55); }, { px: 360 });
  capP.position.set(0, H + 0.42, 0.1); g.add(capP);
  const pl = plaque(null, name, sub, col === COL.orange ? CSS.orange : col === COL.green ? CSS.green : CSS.cyan, 1.7); pl.position.set(0, 0.2, 1.15); g.add(pl);
  at(step, g, { delay: i * 0.12, drop: 0.4 });
  at(step, fill, { mode: 'grow', delay: 0.5 + i * 0.12, dur: 1.4 });
});

// portique « API publique seulement »
const gate = new THREE.Group(); gate.position.set(6.0, 0, -2.4); gate.rotation.y = -0.35; scene.add(gate);
gate.add(capsule([-1.2, 0, 0], [-1.2, 2.8, 0], 0.12, M.ceramic()), capsule([1.2, 0, 0], [1.2, 2.8, 0], 0.12, M.ceramic()));
const sign = group(rbox(2.9, 0.62, 0.14, M.ink(COL.navy), [0, 0, 0], 0.1));
sign.add(place(textPlane(2.9, 0.62, (ctx, W, Hh) => { const s = W / 2.9; font(ctx, 600, 0.1 * s, FM); ctx.fillStyle = CSS.cyan; ctx.fillText('docs/CONTRACTS.md', 0.18 * s, 0.22 * s); richLine(ctx, 'API publique seulement', 0.18 * s, 0.48 * s, { color: CSS.bone, size: 0.18 * s, weight: 600, fam: FD }); }, { px: 360 }), [0, 0, 0.072]));
sign.position.set(0, 3.1, 0); gate.add(sign);
const beamL = rbox(2.2, 0.12, 0.12, M.candy(COL.green, 0.5), [0, 1.1, 0], 0.05); gate.add(beamL);
const blocked = rbox(0.5, 0.5, 0.5, M.candy(COL.red, 0.4), [0, 0.25, 1.4], 0.08); gate.add(blocked);
const ok = rbox(0.5, 0.5, 0.5, M.candy(COL.cyan, 0.3), [0, 0.25, -0.2], 0.08); gate.add(ok);
onTick((t) => { const k = (t * 0.35) % 1; ok.position.z = 1.2 - k * 2.8; ok.visible = gate.visible; blocked.position.z = 1.6 - Math.min(1, ((t * 0.35 + 0.5) % 1) * 2) * 0.5; });
aoBlob(3.6, 2.4, [6.0, 0, -2.4], 0.45);
at(2, gate, { drop: 0.6 });

// 14 propriétés fast-check autour de la graine
const seed = new THREE.Group(); seed.position.set(-5.8, 0, 1.6); scene.add(seed);
seed.add(cyl(0.95, 1.0, 0.24, M.ceramic(), [0, 0.12, 0], 64));
const sd = text3D('20261111', { size: 0.2, depth: 0.05, align: 'center', face: M.candy(COL.orange, 0.3), side: M.candy(0xA8501C, 0.15) }); sd.rotation.x = -Math.PI / 2; sd.position.set(0, 0.25, 0.08); seed.add(sd);
const orbit = new THREE.Group(); orbit.position.y = 1.1; seed.add(orbit);
for (let k = 0; k < 14; k++) {
  const a = (k / 14) * Math.PI * 2;
  const die = rbox(0.24, 0.24, 0.24, M.ceramic(), [Math.cos(a) * 1.15, Math.sin(k * 1.3) * 0.18, Math.sin(a) * 1.15], 0.05);
  [[0, 0, 0.122], [0.06, 0.06, 0.122], [-0.06, -0.06, 0.122]].slice(0, 1 + (k % 3)).forEach((p) => die.add(sphere(0.022, M.ink(0x0A1422), p, 10)));
  die.rotation.set(k, k * 0.7, 0); orbit.add(die);
}
onTick((t) => { orbit.rotation.y = t * 0.35; });
const ps = plaque(null, '14 propriétés fast-check', 'graines fixes · seed 20261111', CSS.orange, 2.7); ps.position.set(0, 0.3, 1.5); seed.add(ps);
aoBlob(3, 3, [-5.8, 0, 1.6], 0.45);
at(3, seed, { drop: 0.6 });

// recette 9/9
const rec = new THREE.Group(); rec.position.set(5.9, 0, 2.2); scene.add(rec);
const chk = new THREE.Shape(); chk.moveTo(-0.16, 0.0); chk.lineTo(-0.05, -0.11); chk.lineTo(0.17, 0.13); chk.lineTo(0.13, 0.17); chk.lineTo(-0.05, -0.03); chk.lineTo(-0.12, 0.04); chk.lineTo(-0.16, 0.0);
for (let k = 0; k < 9; k++) {
  const r = Math.floor(k / 3), c = k % 3;
  const tile = rbox(0.6, 0.14, 0.6, M.ink(0x183A35), [-0.68 + c * 0.68, 0.07, -0.68 + r * 0.68], 0.07);
  const ck = extrude(chk, 0.06, M.candy(COL.green, 0.6), 0.012); ck.rotation.x = -Math.PI / 2; ck.position.set(-0.68 + c * 0.68, 0.15, -0.68 + r * 0.68);
  rec.add(tile, ck);
  at(4, ck, { delay: 0.3 + k * 0.08, drop: 0.5 });
}
const pr = plaque(null, 'Recette E.17 : 9 / 9', 'critères d\'acceptation', CSS.green, 2.3); pr.position.set(0, 0.3, 1.45); rec.add(pr);
aoBlob(3, 3, [5.9, 0, 2.2], 0.45);
at(4, rec, { drop: 0.4 });
