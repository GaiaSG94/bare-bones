/*META{
"n": 1, "kicker": "Vue d'ensemble",
"headline": "Déposez un tableur. *Partagez un explorateur.*",
"lead": "Bare Bones transforme un simple CSV en table typée, filtres, graphiques et lien de partage, directement dans le navigateur. Sans serveur, sans compte.",
"alt": "Une ossature en vertèbres lumineuses porte une table typée, des filtres, des graphiques, un lien #bb= et un téléphone qui affiche la même vue.",
"steps": [
  {"who": "dev", "t": "L'équipe dev copie le squelette", "d": "Une commande : `pnpm create bare-bones`. Le squelette est assez petit pour être lu en une heure.", "r": "Un explorateur vide, prêt à recevoir des données."},
  {"who": "treso", "t": "La trésorerie reçoit un relevé bancaire", "d": "L'association de quartier exporte ses comptes en CSV : dates, libellés, montants. Personne ne veut l'ouvrir dans un tableur.", "r": "Un fichier brut, illisible pour les membres."},
  {"who": "treso", "also": ["none"], "t": "Le fichier est glissé dans Bare Bones", "d": "La lecture se fait dans le navigateur, en arrière-plan. Rien n'est envoyé sur un serveur.", "r": "Encodage, dates et nombres reconnus."},
  {"who": "bb", "t": "Une table typée apparaît", "d": "Chaque colonne reçoit un type : date, texte, catégorie, montant. Les lignes rejetées restent visibles à part.", "r": "Une table propre, triable et filtrable."},
  {"who": "bb", "also": ["treso"], "t": "Filtres et graphiques se construisent", "d": "Plages de montants, catégories, recherche : totaux et graphiques se recalculent instantanément.", "r": "Une vue claire du budget, sans aucune formule."},
  {"who": "treso", "t": "La vue devient un lien `#bb=`", "d": "Filtres, tri et graphique tiennent dans le fragment de l'URL, qui n'est jamais envoyé au serveur.", "r": "Un lien à coller dans un message."},
  {"who": "membres", "also": ["none"], "t": "Les membres ouvrent le lien", "d": "Sur leur téléphone, ils retrouvent exactement la même vue. Sans compte, sans rien installer.", "r": "Tout le monde voit les mêmes chiffres."}
]
}META*/

setView([6.2, 5.6, 17.5], [0.2, 2.7, 0]);
shot(0, [5.0, 4.8, 13.5], [0.9, 2.5, 0]);
shot(1, [4.4, 5.4, 14.0], [-0.6, 3.2, 0.4]);
shot(3, [4.6, 4.6, 13.5], [-0.2, 2.6, 0.8]);
shot(4, [7.6, 4.4, 13.5], [2.6, 2.2, 0.6]);
shot(5, [5.6, 6.4, 14.0], [1.2, 4.0, 0.6]);
shot(6, [8.6, 4.6, 15.0], [3.4, 2.4, 0.8]);

// ---------- l'ossature : cinq vertèbres traversées par un cœur lumineux ----------
const SX = 1.8;
const base = roundDisc(1.45, 0.24, 0.1, M.ceramic(COL.boneDeep)); base.position.set(SX, 0.12, 0); base.receiveShadow = true; scene.add(base);
const spine = new THREE.Group(); spine.position.set(SX, 0, 0); scene.add(spine);
const core = cyl(0.07, 0.07, 3.9, M.glow(COL.cyan, 1.9), [0, 2.35, 0], 24); core.castShadow = false;
const sleeve = cyl(0.2, 0.2, 3.9, M.frost(0xdff3ff), [0, 2.35, 0], 48);
const coreG = group(core, sleeve); spine.add(coreG);
at(0, coreG, { mode: 'grow', dur: 1.2 });
const verts = [];
for (let i = 0; i < 5; i++) {
  const v = group(roundDisc(0.92 - i * 0.03, 0.3, 0.12, M.ceramic()));
  v.add(torus(0.13, 0.035, M.satin(COL.cyan), [0, 0, 0.93 - i * 0.03], [0, 0, 0]));
  v.add(capsule([-0.75, 0, -0.2], [-1.25, -0.08, -0.35], 0.09, M.ceramic()), capsule([0.75, 0, -0.2], [1.25, -0.08, -0.35], 0.09, M.ceramic()));
  v.position.y = 0.75 + i * 0.68;
  spine.add(v); verts.push(v);
  at(0, v, { delay: 0.3 + i * 0.16, drop: 0.6 });
}
onTick((t) => { spine.position.y = Math.sin(t * 0.8) * 0.05; verts.forEach((v, i) => { v.rotation.y = Math.sin(t * 0.5 + i * 0.6) * 0.06; }); });
const tOss = tag([SX + 1.25, 3.5, -0.35], [1.6, 0.9, 0], { k: 'Ossature', b: "5 points d'extension", s: 'importers · derivations · reducers · views · shareAdapters' });
at(0, tOss.all, { delay: 1.1, mode: 'fade' });

// ---------- le relevé CSV ----------
const file = fileSheet({ name: 'releve-2026.csv', lines: ['date;libelle;montant', '08/01/2026;Cotisations;1240,00', '15/01/2026;Location;-380', '03/02/2026;Subvention;2500', '11/02/2026;Fournitures;-145,9', '02/03/2026;Assurance;-212,4'] });
place(file, [-2.4, 4.3, -0.4], [-0.08, 0.42, 0.06]);
scene.add(file);
at(1, file, { drop: 1.2 });
onTick((t) => { file.position.y = 4.3 + Math.sin(t * 0.9 + 1) * 0.06; });
const tCsv = tag([-2.9, 5.35, -0.4], [-0.6, 0.75, 0], { k: 'Relevé bancaire', b: 'Un CSV brut', s: 'que personne ne veut ouvrir', c: 'var(--orange)', hex: COL.orange });
at(1, tCsv.all, { delay: 0.5, mode: 'fade' });

// le fichier est lu dans le navigateur : flux vers le cœur
const inCurve = curveOf([[-1.7, 4.0, 0], [-0.4, 4.4, 0.4], [SX - 0.1, 4.2, 0.3]]);
const inFlow = flow(inCurve, { n: 14, color: COL.bone, speed: 0.32, size: 0.035, k: 1.3 });
scene.add(inFlow); at(2, inFlow, { mode: 'fade' });

// ---------- table typée (HTML net, posé en 3D) ----------
const tableHtml = `<h4>Relevé 2026 <span class="pill">Table typée</span></h4><p class="sub">6 lignes lues · 0 rejetée · types inférés</p>
<table class="t3d"><thead><tr><th>Date<small style="color:var(--cyan)">date</small></th><th>Libellé<small style="color:var(--fg-2)">texte</small></th><th>Catégorie<small style="color:var(--green)">catégorie</small></th><th style="text-align:right">Montant<small style="color:var(--orange)">nombre</small></th></tr></thead>
<tbody><tr><td class="d">2026-01-08</td><td>Cotisations</td><td class="c">Adhésions</td><td class="n">+1 240,00</td></tr>
<tr><td class="d">2026-01-15</td><td>Location salle</td><td class="c">Locaux</td><td class="n neg">−380,00</td></tr>
<tr><td class="d">2026-02-03</td><td>Subvention</td><td class="c">Subventions</td><td class="n">+2 500,00</td></tr>
<tr class="hi"><td class="d">2026-02-11</td><td>Fournitures</td><td class="c">Activités</td><td class="n neg">−145,90</td></tr>
<tr><td class="d">2026-03-02</td><td>Assurance</td><td class="c">Frais fixes</td><td class="n neg">−212,40</td></tr></tbody></table>`;
const table = css3d(tableHtml, { pos: [-1.2, 2.25, 1.4], rot: [0, 0.34, 0], cls: 'panel3d', w: 470, scale: 0.0082 });
at(3, table, { drop: 0.5 });
// ombre portée de la table (plaque fantôme)
const tShadow = rbox(3.8, 2.5, 0.02, memo('ghost', () => new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })), [-1.2, 2.25, 1.38]);
tShadow.rotation.y = 0.34; scene.add(tShadow); at(3, tShadow, { drop: 0.5 });

// ---------- filtres ----------
const filtersHtml = `<h4>Filtres</h4><p class="sub">recalcul instantané</p><div class="f3d">
<div class="row"><span class="rk">Montant</span><div class="rail"><i></i></div><div class="vals"><span>−500 €</span><span>+3 000 €</span></div></div>
<div class="row"><span class="rk">Catégories</span><div class="chips"><span class="on">Adhésions</span><span class="on">Activités</span><span>Locaux</span><span class="on">Subventions</span></div></div>
<div class="row"><span class="rk">Recherche</span><div class="search">fourni<i></i></div></div></div>`;
const filters = css3d(filtersHtml, { pos: [4.7, 3.7, -0.9], rot: [0, -0.08, 0], cls: 'panel3d', w: 300, scale: 0.0082 });
at(4, filters, { drop: 0.5 });
const fShadow = rbox(2.45, 2.6, 0.02, memo('ghost', () => new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })), [4.7, 3.7, -0.92]); fShadow.rotation.y = -0.08; scene.add(fShadow); at(4, fShadow, { drop: 0.5 });

// ---------- graphiques maison : barres sur un plateau de verre ----------
const tray = rbox(2.9, 0.1, 1.4, M.frost(0xeaf7ff), [4.1, 0.55, 1.7], 0.05); scene.add(tray);
const chart = new THREE.Group(); chart.position.set(4.1, 0.6, 1.7); scene.add(chart);
[1.1, 0.65, 1.55, 0.9, 1.85, 1.2].forEach((h, i) => {
  const geo = new RoundedBoxGeometry(0.28, h, 0.28, 5, 0.07); geo.translate(0, h / 2, 0);
  const b = new THREE.Mesh(geo, M.satin(i % 2 ? COL.orange : COL.cyan)); b.castShadow = true; b.position.set(-1.05 + i * 0.42, 0, 0);
  chart.add(b); at(4, b, { mode: 'grow', delay: 0.3 + i * 0.09, dur: 1 });
});
at(4, tray, { drop: 0.3 });
const tChart = tag([5.2, 2.5, 1.7], [1.1, 0.8, 0], { k: 'Graphiques', b: '100 % maison', s: 'zéro bibliothèque de graphiques', c: 'var(--orange)', hex: COL.orange });
at(4, tChart.all, { delay: 0.6, mode: 'fade' });

// ---------- le lien #bb= ----------
const link = new THREE.Group(); link.position.set(0.9, 5.25, 0.9); link.rotation.y = 0.28; scene.add(link);
link.add(capsule([-1.55, 0, 0], [1.55, 0, 0], 0.32, M.irid(0xffffff)));
link.add(capsule([-1.5, 0, 0], [1.5, 0, 0], 0.2, M.glow(COL.orange, 0.55)));
const linkTxt = css3d('<div style="font:500 22px/1 var(--f-mono);color:var(--fg);white-space:nowrap;text-shadow:0 2px 12px rgba(0,0,0,.4)">…/budget/<span style="color:var(--orange)">#bb=eJzNk8t…</span></div>', { pos: [0.9, 5.25, 1.25], rot: [0, 0.28, 0], scale: 0.0085 });
const chainC = curveOf([[SX, 4.35, 0.2], [SX - 0.1, 4.8, 0.6], [1.4, 5.0, 0.85]]);
const chainT = tube(chainC, 0.025, M.chrome(), 40);
scene.add(chainT);
at(5, [link, chainT], { drop: 0.7 }); at(5, linkTxt, { delay: 0.3, mode: 'fade' });
onTick((t) => { link.position.y = 5.25 + Math.sin(t * 1.1) * 0.05; linkTxt.position.y = link.position.y; });

// ---------- le téléphone des membres ----------
const phone = new THREE.Group(); phone.position.set(7.3, 2.15, 1.6); phone.rotation.set(-0.06, -0.38, 0.03); scene.add(phone);
phone.add(rbox(1.36, 2.72, 0.14, M.ink(0x0C1626), [0, 0, 0], 0.2));
phone.add(rbox(1.42, 2.78, 0.1, M.chrome(), [0, 0, -0.03], 0.22));
const screenHtml = `<div class="screen3d"><div class="url">…/budget/<em>#bb=eJzNk8t…</em></div><h5>Budget 2026</h5><div class="m"><div>Recettes<b>+12 480 €</b></div><div>Dépenses<b>−9 315 €</b></div></div><div class="bars"><i style="height:55%"></i><i style="height:32%"></i><i style="height:78%"></i><i style="height:45%"></i><i style="height:92%"></i></div><p class="foot">Même vue que la trésorerie · sans compte</p></div>`;
const screen = css3d(screenHtml, { pos: [7.3, 2.15, 1.69], rot: [-0.06, -0.38, 0.03], w: 250, h: 500, scale: 0.0049 });
const outCurve = curveOf([[2.5, 5.2, 1.0], [5.2, 4.6, 1.6], [6.9, 3.4, 1.7]]);
const outFlow = flow(outCurve, { n: 10, color: COL.orange, speed: 0.28, size: 0.035, k: 1.4 });
scene.add(outFlow);
at(6, phone, { drop: 1.0 }); at(6, screen, { delay: 0.3, drop: 1.0 }); at(6, outFlow, { mode: 'fade', delay: 0.4 });
onTick((t) => { const y = 2.15 + Math.sin(t * 0.9 + 2) * 0.05; phone.position.y = y; screen.position.y = y; });
