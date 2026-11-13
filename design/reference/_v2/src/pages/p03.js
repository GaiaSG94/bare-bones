/*META{
"n": 3, "short": "Pipeline",
"title": ["Du fichier au lien,", "*sept étapes* dans l'onglet."],
"sub": "Le pipeline complet de Bare Bones. Rien ne part sur un serveur : tout se passe dans le navigateur, de l'import au lien de partage.",
"steps": [
  {"t": "Dépôt ou mode démo", "d": "On glisse un fichier, ou on clique « Charger les données de démo » : un budget d'association ou une saison de club."},
  {"t": "Import hors du fil principal", "d": "Un Web Worker détecte l'encodage, lit dates et nombres. Les lignes rejetées restent visibles dans un panneau."},
  {"t": "Une `Table` typée", "d": "Chaque colonne reçoit un type. C'est la colonne vertébrale du projet, gelée dans `types.ts`."},
  {"t": "Query", "d": "`core/query` applique filtres, tris, agrégats, colonnes dérivées et comparaisons."},
  {"t": "Interface maison", "d": "Grille virtualisée, filtres, cartes de métriques et graphiques dessinés sans aucune bibliothèque."},
  {"t": "État encodé, compressé", "d": "Toute la vue est sérialisée puis compressée par `state/codec` et `state/compress`."},
  {"t": "Le lien `#bb=`", "d": "Il tient dans le fragment de l'URL : quiconque l'ouvre retrouve exactement la même vue."}
],
"intent": "Montrer le chemin complet, du fichier déposé au lien partagé, comme un circuit lisible d'un coup d'œil.",
"approach": "Sept socles numérotés reliés par une piste lumineuse où circulent les données ; chaque socle porte un objet 3D : fichier, Worker à engrenages, colonnes typées, entonnoir, interface, presse, lien."
}META*/

studio();
const XS = [-8.4, -5.6, -2.8, 0, 2.8, 5.6, 8.4];
const ZS = [0.9, -0.9, 0.9, -0.9, 0.9, -0.9, 0.9];
setView([0.8, 7.4, 21.5], [-0.4, 1.0, 0]);
XS.forEach((x, i) => { if (i % 2 === 0 && i > 0 && i < 6) shot(i, [x + 1.2, 5.6, ZS[i] + 12.5], [x + 0.6, 1.3, ZS[i]]); });
shot(1, [-4.2, 5.6, 11.6], [-5.0, 1.3, -0.4]);
shot(3, [1.4, 5.6, 11.6], [0.6, 1.3, -0.4]);
shot(5, [7.0, 5.6, 11.6], [6.2, 1.3, -0.4]);
shot(6, [0.8, 7.4, 21.5], [-0.4, 1.0, 0]);

// piste
const pts = XS.map((x, i) => [x, 0.14, ZS[i]]);
for (let i = 0; i < XS.length - 1; i++) {
  const c = curveOf([pts[i], [(XS[i] + XS[i + 1]) / 2, 0.14, 0], pts[i + 1]]);
  const t = tube(c, 0.045, M.glow(COL.cyan, 1.3), 60); t.castShadow = false;
  const f = flow(c, { n: 6, color: i < 2 ? COL.bone : i < 5 ? COL.cyan : COL.orange, speed: 0.35, size: 0.04, offset: i * 0.13 });
  scene.add(t, f);
  at(i + 1, t, { drop: 0, delay: 0 }); at(i + 1, f, { drop: 0, delay: 0.2 });
}

function station(i, name, sub, accent = CSS.cyan) {
  const x = XS[i], z = ZS[i];
  const ped = group(cyl(1.0, 1.06, 0.26, M.ceramic(), [0, 0.13, 0], 64), torus(1.0, 0.018, M.glow(new THREE.Color(accent).getHex(), 1.8), [0, 0.27, 0], [Math.PI / 2, 0, 0]));
  ped.children[0].receiveShadow = true;
  place(ped, [x, 0, z]); scene.add(ped); aoBlob(3, 3, [x, 0, z], 0.45);
  const pl = group(rbox(1.9, 0.56, 0.08, M.plate(), [0, 0, 0], 0.07));
  pl.add(place(textPlane(1.9, 0.56, (ctx, W, H) => {
    const s = W / 1.9;
    font(ctx, 700, 0.17 * s, FM); ctx.fillStyle = accent; ctx.fillText(String(i + 1).padStart(2, '0'), 0.14 * s, 0.32 * s);
    richLine(ctx, name, 0.52 * s, 0.27 * s, { color: CSS.bone, size: 0.15 * s, weight: 600, fam: FD });
    richLine(ctx, sub, 0.52 * s, 0.45 * s, { color: CSS.boneDim, size: 0.095 * s, code: accent });
  }, { px: 380 }), [0, 0, 0.042]));
  place(pl, [x, 0.4, z + 1.32], [-0.32, 0, 0]); pl.scale.setScalar(1.15);
  scene.add(pl);
  const top = new THREE.Group(); top.position.set(x, 0.27, z); scene.add(top);
  at(i, ped, { drop: 0.3 }); at(i, pl, { delay: 0.15, drop: 0.3 }); at(i, top, { delay: 0.3 });
  return top;
}

// 1 · dépôt / démo
const s1 = station(0, 'Dépôt', 'fichier ou « démo »', CSS.bone);
const f1 = file3D({ name: 'club-saison.csv', w: 0.95, h: 1.2, lines: ['equipe;j;v;n;d', 'Castors;10;7;2;1', 'Hérons;10;6;1;3', 'Loutres;10;4;3;3'] });
place(f1, [-0.25, 0.85, 0], [0, 0.3, 0.05]); s1.add(f1);
const demo = group(pill(0.9, 0.3, 0.14, M.candy(COL.orange, 0.3), [0, 0, 0]));
demo.add(place(textPlane(0.9, 0.3, (ctx, W, H) => { font(ctx, 600, H * 0.46, FD); ctx.fillStyle = '#1A0E05'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Démo', W / 2, H * 0.55); }, { px: 400 }), [0, 0, 0.072]));
place(demo, [0.5, 0.22, 0.45], [-0.3, -0.3, 0]); s1.add(demo);
onTick((t) => { f1.position.y = 0.85 + Math.sin(t * 1.2) * 0.06; });

// 2 · import dans un Worker
const s2 = station(1, 'Import', 'Web Worker hors thread');
const capsuleGlass = capsule([0, 0.25, 0], [0, 1.65, 0], 0.55, M.frost(0xd5f2ff, 0.95)); s2.add(capsuleGlass);
const gears = [];
[[0, 0.62, 0.32, COL.cyan], [0.14, 0.98, 0.22, COL.orange], [-0.12, 1.28, 0.2, COL.bone]].forEach(([gx, gy, r, c]) => {
  const g = group(torus(r, 0.05, M.candy(c, 0.25), [0, 0, 0]));
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; const tth = rbox(0.07, 0.09, 0.08, M.candy(c, 0.25), [Math.cos(a) * (r + 0.07), Math.sin(a) * (r + 0.07), 0], 0.02); tth.rotation.z = a; g.add(tth); }
  g.position.set(gx, gy, 0); s2.add(g); gears.push(g);
});
onTick((t) => gears.forEach((g, i) => { g.rotation.z = t * (i % 2 ? -1.2 : 1) * (1 + i * 0.3); }));
const tray = group(rbox(0.75, 0.1, 0.5, M.ink(COL.navy2), [0, 0, 0], 0.04));
[[-0.2, 0], [0.02, 0.06], [0.22, -0.05]].forEach(([tx, tz], k) => tray.add(rbox(0.13, 0.13, 0.13, M.candy(COL.orange, 0.4), [tx, 0.12, tz], 0.03)));
place(tray, [0.8, 0.06, 0.55], [0, -0.4, 0]); s2.add(tray);
at(1, callout([-4.75, 0.6, -0.3], [2.0, 2.4, 0], { kicker: 'Lignes rejetées', title: 'Visibles, pas perdues', body: 'encodage · dates · nombres', accent: CSS.orange, w: 2.3 }), { delay: 0.8, drop: 0 });

// 3 · Table typée : colonnes de tuiles colorées par type
const s3 = station(2, 'Table typée', '`Table` · `types.ts`');
[[COL.cyan, 'date'], [COL.bone, 'texte'], [COL.green, 'catégorie'], [COL.orange, 'nombre']].forEach(([c, t], ci) => {
  for (let r = 0; r < 6; r++) s3.add(rbox(0.3, 0.17, 0.3, r === 5 ? M.candy(c, 0.4) : M.ink(r % 2 ? 0x1B2E48 : 0x22385A), [-0.54 + ci * 0.36, 0.1 + r * 0.2, 0], 0.04));
  s3.add(rbox(0.3, 0.05, 0.3, M.glow(c, 1.4), [-0.54 + ci * 0.36, 1.32, 0], 0.02));
});

// 4 · query : entonnoir + Σ
const s4 = station(3, 'Query', '`core/query`');
const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.14, 1.0, 48, 1, true), M.frost(0xd5f2ff, 0.95));
funnel.position.y = 1.35; s4.add(funnel);
s4.add(torus(0.72, 0.03, M.glow(COL.cyan, 1.6), [0, 1.85, 0], [Math.PI / 2, 0, 0]));
const sig = text3D('Σ', { size: 0.5, depth: 0.14, align: 'center', face: M.candy(COL.cyan, 0.3), side: M.candy(0x2A7FA0, 0.2) });
sig.position.set(0, 0.12, 0); s4.add(sig);
const fall = flow(curveOf([[0, 2.3, 0], [0, 1.6, 0], [0, 0.85, 0]]), { n: 6, color: COL.bone, speed: 0.6, size: 0.04 });
s4.add(fall);

// 5 · interface maison
const s5 = station(4, 'Interface', 'grille, filtres, graphiques');
const scr = group(rbox(1.7, 1.15, 0.1, M.ink(0x0E1C30), [0, 0, 0], 0.08));
for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) scr.add(rbox(0.3, 0.13, 0.04, M.ink(r === 0 ? COL.navy2 : 0x1A2C46), [-0.55 + c * 0.34, 0.36 - r * 0.17, 0.06], 0.03));
const mb = bars3D([0.6, 0.35, 0.8], { bw: 0.13, gap: 0.06, maxH: 0.7, base: false, depth: 0.1, colors: [COL.cyan, COL.orange] });
mb.position.set(0.5, -0.35, 0.06); scr.add(mb);
place(scr, [0, 1.0, 0], [-0.08, 0, 0]); s5.add(scr);
s5.add(cyl(0.05, 0.05, 0.45, M.chrome(), [0, 0.22, -0.05]));

// 6 · codec : presse qui compresse l'état
const s6 = station(5, 'État', '`state/codec` + `compress`', CSS.orange);
const cube = group(rbox(0.7, 0.7, 0.7, M.ceramic(), [0, 0, 0], 0.08));
cube.add(place(textPlane(0.7, 0.7, (ctx, W, H) => { font(ctx, 600, H * 0.3, FM); ctx.fillStyle = CSS.night; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('{…}', W / 2, H / 2); }, { px: 300 }), [0, 0, 0.356]));
cube.position.y = 0.95; s6.add(cube);
const pT = rbox(1.1, 0.1, 1.0, M.chrome(), [0, 1.55, 0], 0.04), pB = rbox(1.1, 0.1, 1.0, M.chrome(), [0, 0.35, 0], 0.04);
s6.add(pT, pB, cyl(0.04, 0.04, 1.9, M.chrome(), [-0.5, 1.0, -0.45]), cyl(0.04, 0.04, 1.9, M.chrome(), [0.5, 1.0, -0.45]));
onTick((t) => { const k = 0.5 + 0.5 * Math.sin(t * 1.6); const sy = 1 - 0.45 * k; cube.scale.set(1 + 0.08 * k, sy, 1 + 0.08 * k); pT.position.y = 0.95 + 0.35 * sy + 0.05; pB.position.y = 0.95 - 0.35 * sy - 0.05; });

// 7 · lien #bb=
const s7 = station(6, 'Lien `#bb=`', 'la vue dans l\'URL', CSS.orange);
const u = urlPill('', '#bb=eJzNk8t…', { fs: 0.15, h: 0.42 });
place(u, [0, 1.25, 0], [0, -0.25, 0]); s7.add(u);
s7.add(chain([0, 0.12, 0], [0, 1.0, 0], { n: 4, r: 0.1, t: 0.028 }));
onTick((t) => { u.position.y = 1.25 + Math.sin(t * 1.3) * 0.05; });
