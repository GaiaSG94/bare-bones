/*META{
"n": 9, "short": "Métriques",
"title": ["Les chiffres,", "*mesurés* le 11 novembre 2026."],
"sub": "Tests, CI, lignes, poids et dépendances : l'état réel du dépôt, rendu en volume.",
"steps": [
  {"t": "516 tests, 48 fichiers", "d": "Tous passants. Chaque cube est un test, chaque colonne un fichier de test."},
  {"t": "Playwright : 6 specs × 3 sites", "d": "Les six scénarios de bout en bout passent sur le squelette, le budget et le club, sur `main`."},
  {"t": "Verdict CI en ~25 s", "d": "Sur 8 runners auto-hébergés, la CI rend son verdict en vingt-cinq secondes environ."},
  {"t": "Des apps sous plafond", "d": "Budget : 596 lignes, club : 395, pour un plafond de 600. Le squelette : 81 lignes."},
  {"t": "Bundles 113,6 à 116,0 ko", "d": "Poids gzippé des trois sites, loin sous le plafond de 200 ko."},
  {"t": "3 dépendances d'exécution", "d": "`zod`, `react`, `react-dom`. Zéro framework CSS, zéro state manager, zéro copyleft."}
],
"intent": "Donner les preuves chiffrées en un coup d'œil, chacune sous une forme qui se lit sans légende.",
"approach": "Plateau de data-viz 3D : 516 cubes empilés en 48 colonnes, 18 dalles Playwright, cadran de CI entouré de 8 runners, barres de lignes sous plafond, règle de poids, trois sphères de dépendances."
}META*/

studio();
setView([0.2, 15.0, 15.0], [-1.4, 0.4, -1.6]);
shot(0, [1.6, 6.8, 9.5], [-0.4, 1.6, -3.0]);
shot(1, [-3.2, 6.4, 9.5], [-4.4, 0.6, 2.4]);
shot(2, [-3.6, 5.8, 8.5], [-5.2, 1.0, -2.2]);
shot(3, [3.6, 5.6, 11.0], [2.0, 1.4, 2.6]);
shot(4, [8.2, 5.6, 8.5], [7.0, 0.6, 0.4]);
shot(5, [0.2, 15.0, 15.0], [-1.4, 0.4, -1.6]);

function bigNum(txt, sub, p, accent = CSS.cyan, size = 0.55) {
  const g = new THREE.Group();
  const t = text3D(txt, { size, depth: 0.12, align: 'center' }); g.add(t);
  const s = textPlane(3, 0.3, (ctx, W, H) => { font(ctx, 600, H * 0.5, FM); ctx.fillStyle = accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sub.toUpperCase(), W / 2, H * 0.55); }, { px: 360 });
  s.position.y = -0.25; g.add(s);
  g.userData.billboard = { fixed: true }; billboards.push(g);
  place(g, p); scene.add(g);
  return g;
}

// 1 · 516 tests en 48 colonnes
const tests = new THREE.Group(); tests.position.set(0.4, 0, -3.0); scene.add(tests);
tests.add(rbox(2.6, 0.16, 2.0, M.ceramic(), [0, 0.08, 0], 0.06)); aoBlob(4, 3.4, [0.4, 0, -3.0], 0.5);
const w = [...Array(48)].map((_, i) => 6 + ((i * 37) % 11) + (i % 5 === 0 ? 3 : 0));
const tot = w.reduce((a, b) => a + b, 0);
const hts = w.map((x) => Math.floor((x * 516) / tot));
let rest = 516 - hts.reduce((a, b) => a + b, 0); for (let i = 0; rest > 0; i = (i + 7) % 48, rest--) hts[i]++;
const cubes = new THREE.InstancedMesh(rboxGeo(0.2, 0.17, 0.2, 0.03), M.candy(COL.cyan, 0.25), 516);
cubes.castShadow = true;
const d = new THREE.Object3D(); let ci = 0;
hts.forEach((h, i) => { const cx = -1.05 + (i % 8) * 0.3, cz = -0.75 + Math.floor(i / 8) * 0.3; for (let k = 0; k < h; k++) { d.position.set(cx, 0.26 + k * 0.19, cz); d.updateMatrix(); cubes.setMatrixAt(ci++, d.matrix); } });
tests.add(cubes);
at(0, tests, { drop: 0 }); at(0, cubes, { mode: 'grow', dur: 1.6 });
at(0, bigNum('516', 'tests · 48 fichiers', [-2.0, 1.2, -1.6]), { delay: 0.6, drop: 0.4 });

// 2 · Playwright 6 × 3
const pw = new THREE.Group(); pw.position.set(-3.6, 0, 2.6); scene.add(pw);
pw.add(rbox(2.6, 0.12, 3.0, M.ceramic(), [0, 0.06, 0], 0.06)); aoBlob(4, 4.2, [-3.6, 0, 2.6], 0.45);
const chk = new THREE.Shape(); chk.moveTo(-0.1, 0.0); chk.lineTo(-0.03, -0.07); chk.lineTo(0.11, 0.08); chk.lineTo(0.08, 0.11); chk.lineTo(-0.03, 0.0); chk.lineTo(-0.07, 0.04); chk.lineTo(-0.1, 0.0);
['squelette', 'budget', 'club'].forEach((site, c) => {
  for (let r = 0; r < 6; r++) {
    const t = rbox(0.66, 0.1, 0.38, M.ink(0x183A35), [-0.78 + c * 0.78, 0.17, -1.05 + r * 0.43], 0.05); pw.add(t);
    const k = extrude(chk, 0.04, M.candy(COL.green, 0.6), 0.01); k.rotation.x = -Math.PI / 2; k.position.set(-0.78 + c * 0.78, 0.24, -1.05 + r * 0.43); pw.add(k);
  }
  const lab = textPlane(0.76, 0.2, (ctx, W, H) => { font(ctx, 600, H * 0.5, FM); ctx.fillStyle = CSS.bone; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(site, W / 2, H * 0.55); }, { px: 360 });
  lab.rotation.x = -Math.PI / 2; lab.position.set(-0.78 + c * 0.78, 0.13, 1.4); pw.add(lab);
});
at(1, pw, { drop: 0.4 });
at(1, bigNum('6 × 3', 'specs × sites, verts', [-6.2, 1.0, 2.6], CSS.green, 0.45), { delay: 0.4, drop: 0.3 });

// 3 · cadran CI ~25 s, 8 runners
const ci8 = new THREE.Group(); ci8.position.set(-5.4, 0, -2.2); scene.add(ci8);
const dial = group(cyl(1.1, 1.15, 0.2, M.ceramic(), [0, 0.1, 0], 64));
const arc = torus(0.86, 0.09, M.candy(COL.orange, 0.6), [0, 0.24, 0], [-Math.PI / 2, 0, Math.PI / 2], (25 / 60) * Math.PI * 2); arc.rotation.z = Math.PI / 2; dial.add(arc);
dial.add(torus(0.86, 0.02, M.ink(COL.navy2), [0, 0.22, 0], [Math.PI / 2, 0, 0]));
const hand = rbox(0.05, 0.04, 0.8, M.ink(0x0A1422), [0, 0.28, -0.35], 0.02); dial.add(hand);
ci8.add(dial);
for (let k = 0; k < 8; k++) {
  const a = (k / 8) * Math.PI * 2;
  const r = group(rbox(0.36, 0.5, 0.36, M.ink(0x223249), [0, 0.25, 0], 0.06), sphere(0.03, M.glow(COL.green, 2.2), [0.1, 0.38, 0.185], 10), sphere(0.03, M.glow(COL.cyan, 2.2), [0.1, 0.24, 0.185], 10));
  r.position.set(Math.cos(a) * 1.75, 0, Math.sin(a) * 1.75); r.rotation.y = -a + Math.PI / 2; ci8.add(r);
}
aoBlob(4.6, 4.6, [-5.4, 0, -2.2], 0.45);
at(2, ci8, { drop: 0.4 });
at(2, bigNum('~25 s', 'verdict CI · 8 runners', [-5.4, 1.0, -0.2], CSS.orange, 0.5), { delay: 0.4, drop: 0.3 });

// 4 · lignes sous plafond
const ln = new THREE.Group(); ln.position.set(2.2, 0, 2.6); scene.add(ln);
ln.add(rbox(3.0, 0.12, 1.4, M.ceramic(), [0, 0.06, 0], 0.06)); aoBlob(4.2, 2.6, [2.2, 0, 2.6], 0.45);
const HMAX = 2.6;
[[596, COL.cyan, 'budget'], [395, COL.orange, 'club'], [81, COL.green, 'squelette']].forEach(([v, c, n], i) => {
  const h = (v / 600) * HMAX;
  const geo = new RoundedBoxGeometry(0.5, h, 0.5, 4, 0.06); geo.translate(0, h / 2, 0);
  const b = new THREE.Mesh(geo, M.candy(c, 0.25)); b.castShadow = true; b.position.set(-0.85 + i * 0.85, 0.12, 0); ln.add(b);
  at(3, b, { mode: 'grow', delay: 0.3 + i * 0.12, dur: 1.2 });
  const vt = text3D(String(v), { size: 0.24, depth: 0.06, align: 'center' }); vt.position.set(-0.85 + i * 0.85, 0.2 + h, 0.1); ln.add(vt);
  const lab = textPlane(0.85, 0.2, (ctx, W, H) => { font(ctx, 600, H * 0.48, FM); ctx.fillStyle = CSS.bone; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, W / 2, H * 0.55); }, { px: 360 });
  lab.position.set(-0.85 + i * 0.85, 0.06, 0.71); ln.add(lab);
});
const cy = 0.12 + HMAX; [[[-1.45, cy, -0.65], [1.45, cy, -0.65]], [[-1.45, cy, 0.65], [1.45, cy, 0.65]], [[-1.45, cy, -0.65], [-1.45, cy, 0.65]], [[1.45, cy, -0.65], [1.45, cy, 0.65]]].forEach(([a, b]) => ln.add(rod(a, b, 0.02, M.glow(COL.orange, 1.6))));
ln.add(place(textPlane(1.6, 0.24, (ctx, W, H) => { font(ctx, 600, H * 0.5, FM); ctx.fillStyle = CSS.orange; ctx.textBaseline = 'middle'; ctx.fillText('plafond 600', 4, H * 0.55); }, { px: 360 }), [1.0, 0.32 + HMAX, 0.66]));
const sk300 = rbox(0.62, 0.03, 0.62, M.candy(COL.green, 0.8), [0.85, 0.12 + (300 / 600) * HMAX, 0], 0.01); ln.add(sk300);
at(3, ln, { drop: 0.4 });

// 5 · règle de poids
const bw = new THREE.Group(); bw.position.set(7.2, 0, 0.2); scene.add(bw);
const L = 4.0;
bw.add(rbox(L + 0.4, 0.12, 1.2, M.ceramic(), [0, 0.06, 0], 0.06)); aoBlob(5.4, 2.4, [7.2, 0, 0.2], 0.45);
const kx = (ko) => -L / 2 + (ko / 200) * L;
bw.add(capsule([kx(0), 0.3, 0], [kx(200), 0.3, 0], 0.1, M.ink(COL.navy2)));
const fillB = capsule([kx(0), 0.3, 0], [kx(113.6), 0.3, 0], 0.13, M.candy(COL.cyan, 0.3)); bw.add(fillB);
bw.add(capsule([kx(113.6), 0.3, 0], [kx(116.0), 0.3, 0], 0.15, M.candy(COL.orange, 0.8)));
bw.add(rbox(0.05, 0.9, 0.5, M.candy(COL.red, 0.6), [kx(200), 0.55, 0], 0.02));
bw.add(place(textPlane(L + 0.4, 0.24, (ctx, W, H) => { font(ctx, 500, H * 0.48, FM); ctx.fillStyle = CSS.night; ctx.textBaseline = 'middle'; [0, 50, 100, 150, 200].forEach((k) => { const x = ((kx(k) + L / 2 + 0.2) / (L + 0.4)) * W; ctx.textAlign = 'center'; ctx.fillText(k + (k === 200 ? ' ko' : ''), x, H * 0.55); }); }, { px: 360 }), [0, 0.06, 0.605]));
at(4, bw, { drop: 0.4 });
at(4, bigNum('113,6 – 116,0 ko', 'gzippé · plafond 200 ko', [7.2, 0.5, 2.3], CSS.orange, 0.34), { delay: 0.4, drop: 0.3 });

// 6 · 3 dépendances d'exécution
const deps = new THREE.Group(); deps.position.set(6.2, 1.6, -3.4); scene.add(deps);
const orbitD = new THREE.Group(); deps.add(orbitD);
deps.add(sphere(0.32, M.ceramic(), [0, 0, 0]));
[['zod', COL.violet], ['react', COL.cyan], ['react-dom', COL.green]].forEach(([n, c], i) => {
  const a = (i / 3) * Math.PI * 2;
  const g = group(sphere(0.34, M.candy(c, 0.35), [0, 0, 0], 40));
  const lab = textPlane(1.2, 0.26, (ctx, W, H) => { font(ctx, 600, H * 0.55, FM); ctx.fillStyle = CSS.bone; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, W / 2, H * 0.55); }, { px: 360 });
  lab.position.y = 0.58; lab.userData.billboard = { fixed: true }; billboards.push(lab); g.add(lab);
  g.position.set(Math.cos(a) * 1.4, Math.sin(a * 2) * 0.2, Math.sin(a) * 1.4); orbitD.add(g);
});
orbitD.add(torus(1.4, 0.012, M.soft(COL.bone, 0.4), [0, 0, 0], [Math.PI / 2, 0, 0]));
onTick((t) => { orbitD.rotation.y = t * 0.3; });
aoBlob(3.4, 3.4, [6.2, 0, -3.4], 0.4);
at(5, deps, { drop: 0.8 });
at(5, bigNum('3', 'dépendances d\'exécution', [3.6, 1.6, -3.6], CSS.violet, 0.6), { delay: 0.4, drop: 0.3 });
