/*META{
"n": 1, "short": "Affiche",
"title": ["Déposez un fichier,", "obtenez un *explorateur*."],
"sub": "Bare Bones est le squelette qu'on copie quand on vous tend un tableur : table typée, filtres, graphiques et lien de partage. Sans serveur.",
"steps": [
  {"t": "L'ossature", "d": "Un squelette minimal : un moteur pur, un kit d'interface et cinq points d'extension. Rien d'autre."},
  {"t": "Vous déposez un fichier", "d": "Un CSV de budget, ou les données de démo en un clic. Le fichier ne quitte jamais votre navigateur."},
  {"t": "Une table typée", "d": "Chaque colonne est reconnue : date, texte, catégorie, montant. Les lignes rejetées restent visibles."},
  {"t": "Filtres et métriques", "d": "Plages, catégories, recherche : les totaux se recalculent aussitôt, sans aller-retour serveur."},
  {"t": "Des graphiques maison", "d": "Courbes, barres, anneaux : tous dessinés par Bare Bones, sans aucune bibliothèque de graphiques."},
  {"t": "Un lien qui rouvre la vue", "d": "Toute la vue tient dans le fragment `#bb=` de l'URL. Aucun serveur, aucune base, aucun compte."}
],
"intent": "Poser l'identité : une ossature lumineuse qui porte, à elle seule, un explorateur de données complet.",
"approach": "Ossature de poutres de verre à cœur lumineux et articulations en os ; table, filtres, métriques et graphiques construits en volume ; lien `#bb=` suspendu par une chaîne."
}META*/

studio();
setView([2.4, 7.2, 22.5], [-1.3, 3.6, 0]);
shot(1, [1.4, 8.6, 15.5], [-0.6, 6.4, 0]);
shot(2, [-0.2, 6.2, 14.5], [-2.0, 4.5, 0.6]);
shot(3, [4.6, 6.4, 14.5], [1.6, 4.4, 0.6]);
shot(4, [3.2, 4.4, 14.5], [0.4, 1.9, 0.6]);
shot(5, [-2.6, 6.8, 22.5], [-0.8, 3.7, 0]);

// ---------- socle + ossature ----------
plinth(9.8, 4.4, [0, 0, 0]);
const A = armature({ w: 8.4, h: 5.8, d: 3, nx: 3, ny: 2 });
A.group.position.set(0, 0.22, 0);
scene.add(A.group);
A.beams.forEach((b, i) => at(0, b, { mode: 'grow', delay: i * 0.03, dur: 0.5 }));
A.nodes.forEach((n, i) => at(0, n, { delay: 0.5 + i * 0.018, drop: 0, dur: 0.45 }));
at(0, callout([-4.2, 3.34, 1.5], [-3.0, -1.5, 0], { kicker: 'Ossature', title: "5 points d'extension", body: 'importers · derivations · reducers · views · shareAdapters', w: 2.7 }), { delay: 1.4, drop: 0 });

const FZ = 1.78;

// ---------- le fichier déposé ----------
const file = file3D({
  name: 'budget-quartier.csv', w: 1.7, h: 2.1,
  lines: ['date;libelle;montant', '08/01/2026;Cotisations;1240,00', '15/01/2026;Location;-380', '03/02/2026;Subvention;2500', '11/02/2026;Fournitures;-145,9', '02/03/2026;Assurance;-212,4'],
});
place(file, [-1.7, 8.25, 0.6], [-0.1, 0.22, -0.06]);
scene.add(file);
at(1, file, { drop: 1.6, dur: 1 });
onTick((t) => { file.rotation.z = -0.06 + Math.sin(t * 0.7) * 0.025; });
const dropCurve = curveOf([[-1.7, 7.1, 0.8], [-1.6, 6.6, 1.3], [-1.5, 6.15, FZ]]);
const dropFlow = flow(dropCurve, { n: 12, color: COL.bone, speed: 0.3, size: 0.035 });
scene.add(dropFlow); at(1, dropFlow, { drop: 0 });
at(1, callout([-0.85, 8.6, 0.6], [3.3, 0.35, 0], { kicker: 'Fichier', title: 'Glissé-déposé', body: 'ou « Charger les données de démo »', accent: CSS.bone, w: 2.4 }), { delay: 0.6, drop: 0 });

// ---------- table typée ----------
const table = table3D({
  title: 'Relevé 2026', meta: '6 lignes · 0 rejetée', w: 5.0, rowH: 0.33, headH: 0.5,
  cols: [{ n: 'Date', t: 'date', w: 0.22 }, { n: 'Libellé', t: 'texte', w: 0.32 }, { n: 'Catégorie', t: 'catégorie', w: 0.24 }, { n: 'Montant', t: 'nombre', w: 0.22, right: true }],
  rows: [['2026-01-08', 'Cotisations', 'Adhésions', '+1 240,00'], ['2026-01-15', 'Location salle', 'Locaux', '−380,00'], ['2026-02-03', 'Subvention', 'Subventions', '+2 500,00'], ['2026-02-11', 'Fournitures', 'Activités', '−145,90'], ['2026-03-02', 'Assurance', 'Frais fixes', '−212,40']],
  highlight: 3,
});
table.position.set(-1.45, 4.6, FZ);
scene.add(table);
at(2, table, { drop: 0.4 });
at(2, callout([-3.85, 5.05, FZ + 0.1], [-3.4, -0.6, 0], { kicker: 'Table', title: 'Colonnes typées', body: 'date · texte · catégorie · nombre', w: 2.5 }), { delay: 0.5, drop: 0 });

// ---------- filtres ----------
const fp = new THREE.Group();
fp.add(rbox(2.5, 2.62, 0.08, M.glass(0x0C1A2D, 0.92), [0, 0, -0.06], 0.12));
const PX = 300, FH = 2.62;
const fy = (y) => (FH / 2 - y) * PX;
fp.add(place(textPlane(2.5, FH, (ctx, W) => {
  richLine(ctx, 'Filtres', 0.16 * PX, fy(1.0), { color: CSS.bone, size: 0.2 * PX, weight: 600, fam: FD });
  font(ctx, 600, 0.085 * PX, FM); ctx.fillStyle = CSS.boneFaint;
  ctx.fillText('MONTANT', 0.16 * PX, fy(0.72)); ctx.fillText('CATÉGORIES', 0.16 * PX, fy(0.0)); ctx.fillText('RECHERCHE', 0.16 * PX, fy(-0.82));
  font(ctx, 500, 0.1 * PX, FM); ctx.fillStyle = CSS.bone; ctx.fillText('−500 €', 0.16 * PX, fy(0.2)); ctx.textAlign = 'right'; ctx.fillText('+3 000 €', W - 0.16 * PX, fy(0.2));
}, { px: PX }), [0, 0, 0]));
const sl = slider3D(2.0, 0.22, 0.72); sl.position.set(0, 0.45, 0.05); fp.add(sl);
let cx = -1.05;
[['Adhésions', 1], ['Activités', 1]].forEach(([t, on]) => { const c = chip3D(t, { on }); c.position.set(cx + c.userData.w / 2, -0.27, 0.05); cx += c.userData.w + 0.08; fp.add(c); });
cx = -1.05;
[['Locaux', 0], ['Subventions', 1]].forEach(([t, on]) => { const c = chip3D(t, { on }); c.position.set(cx + c.userData.w / 2, -0.6, 0.05); cx += c.userData.w + 0.08; fp.add(c); });
fp.add(pill(2.18, 0.3, 0.07, M.ink(COL.navy), [0, -1.08, 0.04]));
fp.add(place(textPlane(2.18, 0.3, (ctx, W, H) => { font(ctx, 400, H * 0.45, FB); ctx.fillStyle = CSS.bone; ctx.textBaseline = 'middle'; ctx.fillText('fourni', H * 0.5, H * 0.54); }, { px: 400 }), [0, -1.08, 0.078]));
const caret = rbox(0.012, 0.16, 0.01, M.glow(COL.cyan, 2), [-0.63, -1.08, 0.08], 0);
fp.add(caret);
onTick((t) => { caret.visible = Math.sin(t * 6) > 0; const k = Math.sin(t * 0.8) * 0.06; sl.userData.k1.position.x = -1 + 0.44 + k; sl.userData.k2.position.x = -1 + 1.44 - k; });
fp.position.set(2.85, 4.6, FZ);
scene.add(fp);
at(3, fp, { drop: 0.4 });

// ---------- métriques ----------
[['Recettes', '+12 480 €', CSS.cyan], ['Dépenses', '−9 315 €', CSS.orange], ['Réalisé vs prévu', '−3,1 %', CSS.green]].forEach(([k, v, c], i) => {
  const m = metric3D(k, v, c, { w: 2.45, h: 0.6 });
  m.position.set(0, 2.5 - i * 0.74, FZ);
  scene.add(m);
  at(3, m, { delay: 0.25 + i * 0.12, drop: 0.3 });
});
at(3, callout([4.1, 5.5, FZ + 0.1], [2.6, 0.5, 0], { kicker: 'Filtres', title: 'Recalcul instantané', body: 'plages, multi-sélection, texte', w: 2.4 }), { delay: 0.6, drop: 0 });

// ---------- graphiques ----------
const area = area3D([1240, 860, 3360, 3214, 3002, 2362, 2950, 3480], { w: 2.3, h: 1.7, ref: [1000, 1300, 2900, 3100, 3200, 2800, 3000, 3300] });
area.position.set(-2.8, 0.28, 0.85);
scene.add(area);
at(4, area, { drop: 0.5 });
const bars = bars3D([1.25, 0.7, 1.65, 0.95], { bw: 0.28, gap: 0.14, maxH: 1.75, colors: [COL.cyan, COL.orange], depth: 0.3 });
bars.position.set(2.05, 0.22, 0.75);
scene.add(bars);
bars.userData.bars.forEach((b, i) => at(4, b, { mode: 'grow', delay: 0.15 + i * 0.1 }));
at(4, bars.children[0], { drop: 0 });
const donut = donut3D([42, 28, 18, 12], { r: 0.55, t: 0.2, depth: 0.16 });
donut.position.set(3.5, 1.35, 0.85);
scene.add(donut);
at(4, donut, { delay: 0.4, drop: 0.3 });
onTick((t) => { donut.rotation.y = Math.sin(t * 0.5) * 0.35; });
at(4, callout([3.5, 1.95, 0.9], [3.0, 0.1, 0], { kicker: 'Graphiques', title: '100 % maison', body: 'zéro bibliothèque de graphiques', w: 2.4, accent: CSS.orange }), { delay: 0.6, drop: 0 });

// ---------- le lien #bb= ----------
const url = urlPill('…/nonprofit-budget/', '#bb=eJzNk8t…', { fs: 0.15, h: 0.46 });
url.position.set(2.2, 6.95, 2.3);
scene.add(url);
const ch = chain([4.2, 6.24, 1.5], [3.95, 6.85, 2.25], { n: 3, r: 0.1, t: 0.028 });
scene.add(ch);
at(5, url, { drop: 0.8 });
at(5, ch, { delay: 0.2, drop: 0.3 });
onTick((t) => { url.position.y = 6.95 + Math.sin(t * 1.1) * 0.05; });
at(5, callout([4.25, 6.95, 2.3], [2.4, 1.0, 0], { kicker: 'Partage', title: 'Lien `#bb=`', body: 'rouvre exactement la même vue', accent: CSS.orange, w: 2.4 }), { delay: 0.5, drop: 0 });
