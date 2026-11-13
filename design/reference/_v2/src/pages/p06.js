/*META{
"n": 6, "short": "Points d'extension",
"title": ["Cinq prises,", "*deux apps* très différentes."],
"sub": "Les applications se branchent uniquement par cinq registres. Le moteur et le kit d'interface ne sont jamais modifiés.",
"stepTime": 5,
"steps": [
  {"t": "Cinq ports nommés", "d": "`importers`, `derivations`, `reducers`, `views`, `shareAdapters` : la seule surface de personnalisation, déclarée dans `explorer.config.ts`."},
  {"t": "Le budget s'y clipse", "d": "Relevé bancaire débit/crédit, règles de catégorisation, réalisé vs prévu, exercice fiscal, partage chiffré privé."},
  {"t": "Le club, à la place", "d": "Résultats de matchs, issue W/D/L, classement, séries de forme, partage public compact sur téléphone."},
  {"t": "Le squelette n'a pas bougé", "d": "Deux apps très différentes, zéro ligne modifiée dans `packages/core` et `packages/ui`."}
],
"intent": "Faire comprendre que toute personnalisation passe par cinq registres, et que deux apps opposées s'y branchent sans toucher au squelette.",
"approach": "Ossature à cinq baies, chacune dotée d'un port lumineux ; deux jeux de cartouches (budget, club) viennent s'y clipser tour à tour ; cadenas sur core et ui."
}META*/

studio();
setView([1.6, 7.0, 20], [-0.6, 3.1, 0]);
shot(1, [-2.4, 6.6, 17], [-1.6, 3.0, 0]);
shot(2, [4.2, 6.6, 17], [0.8, 3.0, 0]);
shot(3, [1.6, 7.6, 20.5], [-0.4, 3.2, 0]);

plinth(4.4, 3.4, [0, 0, 0]);
const A = armature({ w: 3.2, h: 5.5, d: 2.4, nx: 1, ny: 5, braces: false });
A.group.position.set(0, 0.22, 0);
scene.add(A.group);
A.beams.forEach((b, i) => at(0, b, { mode: 'grow', delay: i * 0.03, dur: 0.45 }));
A.nodes.forEach((n, i) => at(0, n, { delay: 0.4 + i * 0.02, drop: 0, dur: 0.4 }));

const REG = ['importers', 'derivations', 'reducers', 'views', 'shareAdapters'];
const PY = REG.map((_, i) => 0.22 + 1.1 * (4 - i) + 0.55);
const FZ = 1.2;
const rings = REG.map((r, i) => {
  const ring = torus(0.36, 0.05, M.candy(COL.cyan, 0.5), [0, PY[i], FZ + 0.02]);
  const sock = cyl(0.26, 0.26, 0.1, M.ink(0x0A1422), [0, PY[i], FZ - 0.02]); sock.rotation.x = Math.PI / 2;
  const tag = group(rbox(1.75, 0.36, 0.06, M.ink(COL.navy), [0, 0, 0], 0.05));
  tag.add(place(textPlane(1.75, 0.36, (ctx, W, H) => { font(ctx, 600, H * 0.4, FM); ctx.fillStyle = CSS.cyan; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(r, W - H * 0.35, H * 0.55); }, { px: 380 }), [0, 0, 0.032]));
  tag.position.set(-2.55, PY[i], FZ);
  const g = group(ring, sock, tag); scene.add(g);
  at(0, g, { delay: 0.9 + i * 0.12, drop: 0 });
  return ring;
});

function cartridge(reg, val, accent) {
  const acc = new THREE.Color(accent).getHex();
  const g = group(rbox(2.3, 0.66, 0.5, M.ink(0x16273E), [0, 0, 0], 0.1));
  g.add(rbox(0.1, 0.66, 0.52, M.candy(acc, 0.45), [-1.12, 0, 0], 0.04));
  g.add(cyl(0.12, 0.12, 0.3, M.chrome(), [-1.32, 0, 0]).rotateZ(Math.PI / 2));
  g.add(place(textPlane(2.1, 0.66, (ctx, W, H) => {
    const s = W / 2.1;
    font(ctx, 600, 0.1 * s, FM); ctx.fillStyle = accent; ctx.fillText(reg, 0.16 * s, 0.24 * s);
    richLine(ctx, val, 0.16 * s, 0.48 * s, { color: CSS.bone, size: 0.15 * s, weight: 600, fam: FD });
  }, { px: 380 }), [0.08, 0, 0.255]));
  scene.add(g);
  return g;
}
const BUD = ['Relevé débit/crédit', 'Catégorisation', 'Réalisé vs prévu', 'Exercice fiscal', 'Partage chiffré'];
const CLUB = ['Résultats de matchs', 'Issue W / D / L', 'Classement', 'Séries de forme', 'Partage public'];
const homeB = PY.map((y, i) => new THREE.Vector3(-6.6, y * 0.8 + 0.2, -3.4));
const homeC = PY.map((y, i) => new THREE.Vector3(6.6, y * 0.8 + 0.2, -3.4));
const dock = PY.map((y) => new THREE.Vector3(1.32, y, FZ + 0.35));
const bud = BUD.map((v, i) => { const c = cartridge(REG[i], v, CSS.cyan); c.position.copy(homeB[i]); c.rotation.y = 0.35; at(0, c, { delay: 1.4 + i * 0.08, drop: 0.5 }); return c; });
const club = CLUB.map((v, i) => { const c = cartridge(REG[i], v, CSS.orange); c.position.copy(homeC[i]); c.rotation.y = -0.35; at(0, c, { delay: 1.6 + i * 0.08, drop: 0.5 }); return c; });
// étiquettes des deux jeux
const lb = plaque(null, 'App budget', 'apps/nonprofit-budget · 596 lignes', CSS.cyan, 2.5); lb.position.set(-6.6, 0.3, -1.9); scene.add(lb); at(0, lb, { delay: 1.8 });
const lc = plaque(null, 'App club', 'apps/club-results · 395 lignes', CSS.orange, 2.5); lc.position.set(6.6, 0.3, -1.9); scene.add(lc); at(0, lc, { delay: 1.9 });
aoBlob(3.4, 3, [-6.6, 0, -3.4], 0.4); aoBlob(3.4, 3, [6.6, 0, -3.4], 0.4);

let docked = null;
function setDock(which) {
  if (docked === which) return;
  docked = which;
  [[bud, homeB, 'b', 0.35], [club, homeC, 'c', -0.35]].forEach(([set, home, key, ry]) => {
    set.forEach((c, i) => {
      const inn = which === key;
      const fromP = c.position.clone(), toP = inn ? dock[i] : home[i];
      const fromR = c.rotation.y, toR = inn ? 0 : ry;
      const mid = fromP.clone().lerp(toP, 0.5); mid.z += 1.6;
      tween(1.1, (k) => {
        const a = fromP.clone().lerp(mid, k), b = mid.clone().lerp(toP, k);
        c.position.copy(a.lerp(b, k));
        c.rotation.y = lerp(fromR, toR, k);
      }, { delay: (inn ? 0.25 : 0) + i * 0.09 });
    });
  });
  const col = which === 'b' ? COL.cyan : which === 'c' ? COL.orange : COL.cyan;
  rings.forEach((r, i) => tween(0.4, () => { r.material = M.candy(col, which ? 0.9 : 0.5); }, { delay: 1.1 + i * 0.09 }));
}
let alt = 0;
onStep((cur) => {
  if (cur <= 0) setDock(null);
  else if (cur === 1) setDock('b');
  else if (cur === 2) setDock('c');
  else if (!docked) setDock('c');
  alt = 0;
});
onTick((t, dt) => { if (cur === 3 && !REDUCED) { alt += dt; if (alt > 3.6) { alt = 0; setDock(docked === 'b' ? 'c' : 'b'); } } });

// cadenas : core et ui intouchés
function padlock(label) {
  const g = group(rbox(0.6, 0.5, 0.3, M.candy(COL.orange, 0.25), [0, 0.25, 0], 0.08), torus(0.2, 0.05, M.chrome(), [0, 0.5, 0], [0, 0, 0], Math.PI));
  g.add(place(textPlane(0.6, 0.22, (ctx, W, H) => { font(ctx, 700, H * 0.5, FM); ctx.fillStyle = '#1A0E05'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, W / 2, H * 0.55); }, { px: 400 }), [0, 0.22, 0.152]));
  return g;
}
const lk1 = padlock('core'), lk2 = padlock('ui');
lk1.position.set(-0.75, 5.85, 0.6); lk2.position.set(0.75, 5.85, 0.6);
scene.add(lk1, lk2);
at(3, lk1, { drop: 1 }); at(3, lk2, { delay: 0.15, drop: 1 });
const zero = plaque(null, '0 ligne modifiée', 'dans `packages/core` et `packages/ui`', CSS.green, 2.9); zero.position.set(0, 0.32, 2.25); scene.add(zero);
at(3, zero, { delay: 0.3, drop: 0.3 });

// explorer.config.ts
const code = group(rbox(3.2, 2.1, 0.1, M.ink(0x0A1422), [0, 0, 0], 0.1));
code.add(place(textPlane(3.2, 2.1, (ctx, W, H) => {
  const s = W / 3.2;
  font(ctx, 600, 0.12 * s, FM); ctx.fillStyle = CSS.boneFaint; ctx.fillText('explorer.config.ts  ·  exemple', 0.18 * s, 0.26 * s);
  const L = [['export default {', CSS.boneDim], ['  importers:     [bankStatement],', CSS.bone], ['  derivations:   [categorize],', CSS.bone], ['  reducers:      [actualVsBudget],', CSS.bone], ['  views:         [fiscalYear],', CSS.bone], ['  shareAdapters: [encrypted],', CSS.bone], ['};', CSS.boneDim]];
  font(ctx, 500, 0.11 * s, FM);
  L.forEach(([l, c], i) => { const m = l.match(/^(\s+)(\w+):(\s+)(.*)$/); const y = (0.52 + i * 0.21) * s; if (m) { ctx.fillStyle = CSS.cyan; ctx.fillText(m[1] + m[2] + ':', 0.18 * s, y); ctx.fillStyle = CSS.orange; ctx.fillText(m[4], 0.18 * s + ctx.measureText(m[1] + m[2] + ':' + m[3]).width, y); } else { ctx.fillStyle = c; ctx.fillText(l, 0.18 * s, y); } });
}, { px: 340 }), [0, 0, 0.052]));
place(code, [3.3, 6.5, -1.6], [0, -0.3, 0]); code.scale.setScalar(0.85);
scene.add(code);
at(3, code, { delay: 0.5, drop: 0.6 });
