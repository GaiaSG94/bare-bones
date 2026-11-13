/*META{
"n": 10, "short": "Synthèse",
"title": ["Un squelette à copier,", "*un lien* à partager."],
"sub": "L'écosystème autour de Bare Bones, et sa promesse : un explorateur lisible en une heure, qui s'ouvre partout.",
"steps": [
  {"t": "Lisible en une heure", "d": "Cinq points d'extension, un concept par fichier, des budgets imposés : on lit tout le squelette en une heure."},
  {"t": "Publié sur GitHub Pages", "d": "Un index et trois sites statiques : le squelette, le budget d'association et les résultats du club."},
  {"t": "`pnpm create bare-bones my-app`", "d": "Le scaffolder crée un nouvel explorateur en une commande, sur Node.js LTS ≥ 20.19 et pnpm 10."},
  {"t": "Le power Kiro", "d": "Le skill `new-explorer-app`, dix jeux de données dorés et une rubrique d'évaluation pour générer de nouvelles apps."},
  {"t": "Deux apps, mêmes paquets", "d": "Budget et club prouvent la polyvalence ; `infra/snapshot-store` garde les instantanés partagés."},
  {"t": "Le lien `#bb=` sur un téléphone", "d": "Le classement du club, ouvert depuis un message : exactement la même vue, sans compte ni serveur."}
],
"intent": "Refermer le dossier : l'écosystème, la philosophie, et l'usage final sur un téléphone.",
"approach": "Ossature au centre d'un anneau lumineux ; autour, les trois sites, le terminal du scaffolder, le power Kiro et ses datasets dorés, le stockage d'instantanés ; un sablier « une heure » ; au premier plan, un téléphone ouvert sur le lien `#bb=`."
}META*/

studio();
setView([2.4, 8.8, 21.5], [0.8, 2.0, 0.4]);
shot(0, [1.2, 5.6, 11.5], [-0.6, 2.0, 0]);
shot(1, [-2.2, 5.6, 9.5], [-4.4, 1.8, -2.6]);
shot(2, [-3.4, 4.4, 9.5], [-5.6, 1.0, 0.4]);
shot(3, [6.2, 5.2, 8.5], [4.4, 1.4, -2.8]);
shot(4, [8.4, 5.0, 10.5], [5.8, 1.4, 0.8]);
shot(5, [3.6, 7.6, 18.5], [0.6, 2.0, 1.0]);

// anneau et ossature centrale
const ring = torus(6.2, 0.03, M.glow(COL.cyan, 1.2), [0.2, 0.03, 0], [Math.PI / 2, 0, 0]); ring.castShadow = false; scene.add(ring);
const pl = cyl(2.2, 2.3, 0.24, M.ceramic(), [0, 0.12, 0], 72); pl.receiveShadow = true; scene.add(pl); aoBlob(5.5, 5.5, [0, 0, 0], 0.55);
const A = armature({ w: 2.8, h: 3.4, d: 2.2, nx: 2, ny: 2 }); A.group.position.set(0, 0.24, 0); scene.add(A.group);
A.beams.forEach((b, i) => at(0, b, { mode: 'grow', delay: i * 0.03, dur: 0.45 }));
A.nodes.forEach((n, i) => at(0, n, { delay: 0.4 + i * 0.02, drop: 0 }));
at(0, ring, { drop: 0 });
// sablier « une heure »
const hg = new THREE.Group(); hg.position.set(-2.6, 0, 1.6); scene.add(hg);
hg.add(cyl(0.5, 0.5, 0.08, M.ink(COL.navy2), [0, 0.04, 0]), cyl(0.5, 0.5, 0.08, M.ink(COL.navy2), [0, 1.66, 0]));
hg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.06, 0.78, 40, 1, true), M.frost(0xdff4ff, 0.95)).translateY(1.23));
hg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.42, 0.78, 40, 1, true), M.frost(0xdff4ff, 0.95)).translateY(0.47));
const sandT = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 32), M.candy(COL.gold, 0.4)); sandT.rotation.x = Math.PI; sandT.position.y = 1.15; hg.add(sandT);
const sandB = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.3, 32), M.candy(COL.gold, 0.4)); sandB.position.y = 0.23; hg.add(sandB);
[[-0.46, 0], [0.46, 0]].forEach(([x]) => hg.add(cyl(0.03, 0.03, 1.6, M.chrome(), [x, 0.85, 0])));
onTick((t) => { const k = (t * 0.08) % 1; sandT.scale.setScalar(1 - k * 0.8); sandB.scale.setScalar(0.3 + k * 0.7); });
const ph = plaque(null, 'Lisible en une heure', '5 points d\'extension · 1 concept par fichier', CSS.gold, 2.9); ph.position.set(0, 0.3, 1.0); hg.add(ph);
at(0, hg, { delay: 0.6 });

function node(p, path) {
  const c = curveOf([[0, 0.4, 0], [p[0] * 0.5, 1.6, p[2] * 0.5], [p[0], 0.5, p[2]]]);
  const t = tube(c, 0.015, M.soft(COL.cyan, 0.35), 50), f = flow(c, { n: 4, color: COL.cyan, speed: 0.3, size: 0.035 });
  scene.add(t, f);
  const base = cyl(0.95, 1.0, 0.18, M.ceramic(), [p[0], 0.09, p[2]], 56); scene.add(base); aoBlob(2.8, 2.8, p, 0.4);
  const g = new THREE.Group(); g.position.set(p[0], 0.18, p[2]); scene.add(g);
  return { g, parts: [t, f, base, g] };
}
function reveal(step, n) { n.parts.forEach((o, i) => at(step, o, { delay: 0.1 * i, drop: o === n.g ? 0.5 : 0 })); }

// GitHub Pages : trois sites
const gp = node([-4.4, 0, -2.6]);
['squelette', 'budget', 'club'].forEach((s, i) => {
  const sc = group(rbox(1.1, 0.75, 0.06, M.ink(0x0E1C30), [0, 0, 0], 0.06));
  sc.add(place(textPlane(1.1, 0.75, (ctx, W, H) => { const k = W / 1.1; ctx.fillStyle = 'rgba(76,201,240,0.18)'; ctx.fillRect(0, 0, W, 0.14 * k); font(ctx, 600, 0.09 * k, FM); ctx.fillStyle = CSS.bone; ctx.fillText(s, 0.08 * k, 0.1 * k); for (let r = 0; r < 4; r++) { ctx.fillStyle = r % 2 ? 'rgba(237,231,218,0.08)' : 'rgba(237,231,218,0.14)'; ctx.fillRect(0.08 * k, (0.22 + r * 0.11) * k, 0.55 * k, 0.07 * k); } [0.3, 0.18, 0.4].forEach((h, j) => { ctx.fillStyle = j === 1 ? CSS.orange : CSS.cyan; ctx.fillRect((0.72 + j * 0.11) * k, (0.66 - h) * k, 0.07 * k, h * k); }); }, { px: 360 }), [0, 0, 0.032]));
  sc.position.set(-0.9 + i * 0.9, 1.0 + (i === 1 ? 0.25 : 0), (i === 1 ? -0.2 : 0.1)); sc.rotation.y = (1 - i) * 0.35; gp.g.add(sc);
});
const pgp = plaque(null, 'GitHub Pages', 'index + 3 sites statiques', CSS.cyan, 2.4); pgp.position.set(0, 0.15, 1.15); gp.g.add(pgp);
reveal(1, gp);

// scaffolder
const sf = node([-5.8, 0, 0.6]);
const term = group(rbox(2.5, 1.1, 0.1, M.ink(0x0A1422), [0, 0, 0], 0.08));
term.add(place(textPlane(2.5, 1.1, (ctx, W, H) => { const k = W / 2.5; [CSS.red, CSS.gold, CSS.green].forEach((c, j) => { ctx.beginPath(); ctx.arc((0.14 + j * 0.12) * k, 0.13 * k, 0.035 * k, 0, 7); ctx.fillStyle = c; ctx.fill(); }); font(ctx, 500, 0.11 * k, FM); ctx.fillStyle = CSS.green; ctx.fillText('$', 0.12 * k, 0.48 * k); ctx.fillStyle = CSS.bone; ctx.fillText('pnpm create bare-bones my-app', 0.26 * k, 0.48 * k); ctx.fillStyle = CSS.boneDim; ctx.fillText('✓ explorer.config.ts', 0.12 * k, 0.7 * k); ctx.fillText('✓ data/ · 5 registres prêts', 0.12 * k, 0.88 * k); }, { px: 360 }), [0, 0, 0.052]));
term.position.set(0, 1.0, 0); term.rotation.set(-0.1, 0.45, 0); sf.g.add(term);
reveal(2, sf);

// power Kiro
const kp = node([4.4, 0, -2.8]);
const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), M.candy(COL.violet, 0.5)); gem.position.y = 1.2; gem.castShadow = true; kp.g.add(gem);
for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; kp.g.add(rbox(0.16, 0.16, 0.16, M.candy(COL.gold, 0.4), [Math.cos(a) * 0.78, 1.2 + Math.sin(a * 3) * 0.1, Math.sin(a) * 0.78], 0.03)); }
onTick((t) => { gem.rotation.y = t * 0.7; });
const pk = plaque(null, 'Power Kiro', '`new-explorer-app` · 10 datasets dorés', CSS.violet, 2.8); pk.position.set(0, 0.15, 1.15); kp.g.add(pk);
reveal(3, kp);

// deux apps + snapshot-store
const ap = node([6.0, 0, 0.8]);
[['Budget', CSS.cyan, -0.55, 0.3], ['Club', CSS.orange, 0.55, -0.3]].forEach(([n, c, x, ry]) => {
  const card = group(rbox(1.0, 1.3, 0.08, M.ink(0x0E1C30), [0, 0, 0], 0.07));
  card.add(place(textPlane(1.0, 1.3, (ctx, W, H) => { const k = W / 1.0; font(ctx, 600, 0.13 * k, FD); ctx.fillStyle = c; ctx.fillText(n, 0.1 * k, 0.2 * k); for (let r = 0; r < 5; r++) { ctx.fillStyle = 'rgba(237,231,218,0.12)'; ctx.fillRect(0.1 * k, (0.34 + r * 0.16) * k, 0.8 * k, 0.09 * k); } }, { px: 360 }), [0, 0, 0.042]));
  card.position.set(x, 1.0, 0); card.rotation.y = ry; ap.g.add(card);
});
const st = group(); [0, 1, 2].forEach((k) => st.add(cyl(0.32, 0.32, 0.16, M.ink(COL.navy2), [0, k * 0.2, 0], 36), torus(0.32, 0.01, M.glow(COL.cyan, 1.6), [0, k * 0.2 + 0.08, 0], [Math.PI / 2, 0, 0])));
st.position.set(1.4, 0.1, -0.4); ap.g.add(st);
const pa = plaque(null, 'Deux apps, mêmes paquets', '+ `infra/snapshot-store`', CSS.cyan, 2.9); pa.position.set(0, 0.15, 1.15); ap.g.add(pa);
reveal(4, ap);

// le téléphone
const phone = new THREE.Group(); phone.position.set(2.7, 0, 3.4); phone.rotation.y = -0.32; scene.add(phone);
phone.add(rbox(1.6, 0.12, 0.9, M.ceramic(), [0, 0.06, 0], 0.05));
const body = group(rbox(1.5, 3.0, 0.14, M.ink(0x0B1626), [0, 0, 0], 0.18));
body.add(rbox(1.56, 3.06, 0.1, M.chrome(), [0, 0, -0.03], 0.2));
body.add(place(textPlane(1.38, 2.86, (ctx, W, H) => {
  const k = W / 1.38;
  rr(ctx, 0, 0, W, H, 0.14 * k); ctx.fillStyle = '#0E1A2C'; ctx.fill();
  rr(ctx, 0.08 * k, 0.12 * k, 1.22 * k, 0.2 * k, 0.1 * k); ctx.fillStyle = 'rgba(237,231,218,0.08)'; ctx.fill();
  font(ctx, 500, 0.075 * k, FM); ctx.fillStyle = CSS.boneDim; ctx.textBaseline = 'middle'; ctx.fillText('…/club-results/', 0.16 * k, 0.225 * k);
  ctx.fillStyle = CSS.orange; ctx.fillText('#bb=a91…', 0.16 * k + ctx.measureText('…/club-results/').width, 0.225 * k);
  ctx.textBaseline = 'alphabetic';
  richLine(ctx, 'Classement 2026', 0.1 * k, 0.55 * k, { color: CSS.bone, size: 0.13 * k, weight: 600, fam: FD });
  const T = [['Castors', 23, 'WWDLW'], ['Hérons', 19, 'WLWWD'], ['Loutres', 15, 'DWLDW'], ['Faucons', 13, 'LWDWL'], ['Lynx', 9, 'LLWDL'], ['Martinets', 6, 'DLLLW']];
  T.forEach(([n, p, f], i) => {
    const y = (0.78 + i * 0.32) * k;
    ctx.fillStyle = i % 2 ? 'rgba(237,231,218,0.04)' : 'rgba(237,231,218,0.08)'; ctx.fillRect(0.06 * k, y - 0.17 * k, 1.26 * k, 0.28 * k);
    font(ctx, 600, 0.075 * k, FM); ctx.fillStyle = CSS.boneFaint; ctx.fillText(String(i + 1), 0.1 * k, y);
    font(ctx, 500, 0.085 * k, FB); ctx.fillStyle = CSS.bone; ctx.fillText(n, 0.22 * k, y);
    font(ctx, 600, 0.085 * k, FM); ctx.fillStyle = CSS.cyan; ctx.textAlign = 'right'; ctx.fillText(String(p), 0.66 * k, y); ctx.textAlign = 'left';
    [...f].forEach((ch, j) => { const c = ch === 'W' ? CSS.green : ch === 'D' ? CSS.gold : CSS.red; rr(ctx, (0.74 + j * 0.115) * k, y - 0.09 * k, 0.095 * k, 0.12 * k, 0.025 * k); ctx.fillStyle = c + '40'; ctx.fill(); font(ctx, 700, 0.06 * k, FM); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(ch, (0.7875 + j * 0.115) * k, y - 0.005 * k); ctx.textAlign = 'left'; });
  });
  font(ctx, 500, 0.065 * k, FB); ctx.fillStyle = CSS.boneFaint; ctx.fillText('Même vue, sans compte ni serveur', 0.1 * k, 2.72 * k);
}, { px: 420 }), [0, 0, 0.075]));
body.position.set(0, 1.62, -0.05); body.rotation.x = -0.12; phone.add(body);
aoBlob(2.4, 1.8, [2.7, 0, 3.4], 0.5);
at(5, phone, { drop: 1.2, dur: 1 });
at(5, callout([3.6, 3.0, 3.1], [1.9, 0.4, 0], { kicker: 'Fin du parcours', title: 'Le lien ouvert', body: 'exactement la même vue', accent: CSS.orange, w: 2.3 }), { delay: 0.8, drop: 0 });
