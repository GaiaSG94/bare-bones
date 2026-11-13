/*META{
"n": 2, "short": "Problème → promesse",
"title": ["Un tableur brut,", "un *explorateur* sans backend."],
"sub": "Chaque association reçoit un jour un CSV. Personne ne veut écrire l'explorateur, ni se battre avec les encodages, les dates et le partage.",
"steps": [
  {"t": "Un CSV brut", "d": "Un export bancaire : encodage cassé, trois formats de date, virgules et points mélangés, lignes vides."},
  {"t": "Des outils obèses", "d": "Tableur géant ou outil BI à licences : trop lourds pour un trésorier bénévole ou un club."},
  {"t": "Un serveur ? Non.", "d": "Pas de base de données, pas d'hébergement, pas de comptes à créer ni à maintenir."},
  {"t": "Le fichier entre dans l'ossature", "d": "Le même CSV est déposé dans Bare Bones, directement dans le navigateur."},
  {"t": "Table typée et graphiques", "d": "Dates, montants et catégories sont reconnus ; les graphiques suivent tout seuls."},
  {"t": "Un lien `#bb=` à partager", "d": "La vue entière tient dans l'URL : on l'envoie, elle se rouvre à l'identique, sans serveur."}
],
"intent": "Opposer la situation de départ (un CSV que personne n'ouvrira) à la promesse du squelette.",
"approach": "Diptyque : à gauche le CSV aux défauts surlignés, des blocs obèses et un serveur barré ; à droite le même fichier entre dans l'ossature et devient table, graphiques et lien."
}META*/

studio();
setView([1.2, 7.6, 24], [-1.2, 2.6, 0]);
shot(0, [-2.6, 5.2, 15.5], [-4.4, 2.0, 0]);
shot(3, [1.2, 7.6, 24], [-1.2, 2.6, 0]);
shot(4, [7.2, 5.6, 15], [5.4, 2.4, 0.5]);
shot(5, [-0.4, 7.0, 24], [-0.6, 2.4, 0]);

// ================= AVANT =================
plinth(3.4, 2.6, [-4.6, 0, 0.9]);
const raw = file3D({
  name: 'export_banque (3).csv', w: 2.1, h: 2.5, bad: [0, 3, 4, 5],
  lines: ['date;libellÃ©;montant', '08/01/26;Cotisations;1 240,00', '15/01/2026;Location;-380', '03-02-2026;Subvention;2500.00', ';;;', '02/03/2026;Assurance;âˆ’212,4'],
});
place(raw, [-4.6, 1.55, 1.0], [-0.12, 0.18, 0]);
scene.add(raw);
at(0, raw, { drop: 1 });
// marqueurs d'alerte
[[-3.42, 1.97], [-3.42, 1.27], [-3.42, 1.1], [-3.42, 0.93]].forEach(([x, y], i) => {
  const w = group(sphere(0.07, M.candy(COL.orange, 0.5), [0, 0, 0], 20));
  place(w, [x, y + 0.2, 1.25]);
  scene.add(w);
  at(0, w, { delay: 0.5 + i * 0.12, drop: 0 });
});
const pl0 = plaque(null, 'Avant : un CSV brut', 'encodage cassé · 3 formats de date · lignes vides', CSS.orange, 3.2); pl0.position.set(-4.6, 0.32, 2.45); scene.add(pl0); at(0, pl0, { delay: 0.4, drop: 0.3 });

// blocs obèses
const slate = M.ink(0x2A3B53);
function bulky(w, h, d, p) {
  const g = group(rbox(w, h, d, slate, [0, h / 2, 0], 0.14));
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) g.add(pill(w * 0.17, 0.1, 0.05, M.ink(0x3D5272), [-w * 0.3 + c * w * 0.2, h * 0.86 - r * 0.24, d / 2 + 0.02]));
  g.add(rbox(w * 0.78, h * 0.32, 0.04, M.ink(0x1A2A40), [0, h * 0.24, d / 2 + 0.02], 0.04));
  place(g, p); scene.add(g); aoBlob(w * 1.6, d * 1.6, p, 0.5);
  return g;
}
const t1 = bulky(2.3, 3.2, 1.9, [-8.6, 0, -1.6]);
const t2 = bulky(2.5, 2.3, 2.0, [-6.0, 0, -2.9]);
at(1, t1); at(1, t2, { delay: 0.15 });
const pl1 = plaque(null, 'Des outils obèses', 'tableur géant · BI à licences', CSS.steel, 2.6); pl1.position.set(-8.1, 0.32, 0.55); scene.add(pl1); at(1, pl1, { delay: 0.3, drop: 0.3 });

// serveur barré
const rack = group(rbox(1.3, 3.4, 1.2, M.ink(0x223249), [0, 1.7, 0], 0.08));
for (let i = 0; i < 7; i++) {
  rack.add(rbox(1.1, 0.3, 0.04, M.ink(0x15253A), [0, 0.42 + i * 0.43, 0.61], 0.03));
  rack.add(sphere(0.035, M.glow(i % 3 ? COL.green : COL.cyan, 2.2), [0.42, 0.42 + i * 0.43, 0.64], 12));
}
place(rack, [-2.2, 0, -1.7]); scene.add(rack); aoBlob(2.2, 2.2, [-2.2, 0, -1.7], 0.5);
const cross = group(capsule([-0.9, -1.25, 0], [0.9, 1.25, 0], 0.09, M.candy(COL.red, 0.9)), capsule([-0.9, 1.25, 0], [0.9, -1.25, 0], 0.09, M.candy(COL.red, 0.9)));
place(cross, [-2.2, 1.75, -0.9]); scene.add(cross);
at(2, rack); at(2, cross, { delay: 0.35, drop: 0 });
const pl2 = plaque(null, 'Serveur + base : barrés', 'rien à héberger ni à maintenir', CSS.red, 2.7); pl2.position.set(-1.7, 0.32, -0.2); scene.add(pl2); at(2, pl2, { delay: 0.4, drop: 0.3 });


// ================= passage =================
const arc = curveOf([[-3.4, 2.9, 1.2], [-0.6, 5.6, 1.4], [2.6, 6.4, 0.8], [4.6, 5.4, 0.2]]);
const arcTube = tube(arc, 0.02, M.soft(COL.cyan, 0.35), 120);
const arcFlow = flow(arc, { n: 14, color: COL.bone, speed: 0.22, size: 0.04 });
scene.add(arcTube, arcFlow);
at(3, arcTube, { drop: 0 }); at(3, arcFlow, { drop: 0 });
at(3, callout([-0.6, 5.62, 1.4], [0.0, 1.3, 0], { kicker: 'Glissé-déposé', title: 'Le même fichier', body: 'lu dans le navigateur, sans envoi', accent: CSS.bone, w: 2.5 }), { delay: 0.6, drop: 0 });

// ================= APRÈS =================
plinth(6.6, 3.8, [5.6, 0, 0]);
const A = armature({ w: 5.6, h: 4.4, d: 2.4, nx: 2, ny: 2 });
A.group.position.set(5.6, 0.22, 0);
scene.add(A.group);
A.beams.forEach((b, i) => at(3, b, { mode: 'grow', delay: 0.3 + i * 0.03, dur: 0.45 }));
A.nodes.forEach((n, i) => at(3, n, { delay: 0.8 + i * 0.02, drop: 0, dur: 0.4 }));
const inFile = file3D({ name: 'export_banque (3).csv', w: 1.3, h: 1.6, lines: ['08/01/26;Cotisations;1 240,00', '15/01/2026;Location;-380', '03-02-2026;Subvention;2500.00'] });
place(inFile, [4.6, 5.3, 0], [0, 0.2, 0.08]);
scene.add(inFile);
at(3, inFile, { delay: 1.1, drop: 1.4 });

const tbl = table3D({
  title: 'Relevé 2026', meta: 'typé', w: 4.7, rowH: 0.3, headH: 0.46,
  cols: [{ n: 'Date', t: 'date', w: 0.24 }, { n: 'Libellé', t: 'texte', w: 0.3 }, { n: 'Catégorie', t: 'catégorie', w: 0.24 }, { n: 'Montant', t: 'nombre', w: 0.22, right: true }],
  rows: [['2026-01-08', 'Cotisations', 'Adhésions', '+1 240,00'], ['2026-01-15', 'Location', 'Locaux', '−380,00'], ['2026-02-03', 'Subvention', 'Subventions', '+2 500,00']],
});
tbl.position.set(5.6, 3.5, 1.45);
scene.add(tbl); at(4, tbl, { drop: 0.4 });
const bars = bars3D([1.3, 0.5, 1.7, 0.9, 0.6], { bw: 0.26, gap: 0.12, maxH: 1.6, colors: [COL.cyan, COL.orange], depth: 0.28 });
bars.position.set(4.25, 0.22, 0.5); scene.add(bars);
bars.userData.bars.forEach((b, i) => at(4, b, { mode: 'grow', delay: 0.2 + i * 0.08 }));
at(4, bars.children[0], { drop: 0 });
const donut = donut3D([45, 25, 18, 12], { r: 0.6, t: 0.22, depth: 0.16 });
donut.position.set(7.0, 1.3, 0.6); scene.add(donut);
at(4, donut, { delay: 0.4 });
onTick((t) => { donut.rotation.y = Math.sin(t * 0.5) * 0.35; });

const url = urlPill('…/budget/', '#bb=eJzNk8t…', { fs: 0.15, h: 0.46 });
url.position.set(5.6, 1.05, 2.55); scene.add(url);
at(5, url, { drop: 0.6 });
const pl5 = plaque(null, 'Après : 0 serveur · 0 base · 0 compte', 'la vue entière tient dans le lien `#bb=`', CSS.green, 3.8); pl5.position.set(5.6, 0.32, 3.45); scene.add(pl5); at(5, pl5, { delay: 0.3, drop: 0.3 });
