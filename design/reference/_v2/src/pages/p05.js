/*META{
"n": 5, "short": "Flux de données",
"title": ["Le voyage", "d'*une ligne* de CSV."],
"sub": "D'octets bruts à des pixels, puis à un lien : chaque transformation a lieu dans le navigateur, jamais sur un serveur.",
"steps": [
  {"t": "Des octets bruts", "d": "Une ligne du relevé arrive telle quelle : `2026-02-11;Fournitures atelier;-145,90`, précédée d'un BOM."},
  {"t": "Encodage détecté", "d": "UTF-8 ou Windows-1252 ? Bare Bones le détecte et retire le BOM avant de lire quoi que ce soit."},
  {"t": "Des cellules typées", "d": "La date devient une date, le libellé du texte, le montant un nombre négatif."},
  {"t": "Une ligne de `Table`", "d": "La ligne rejoint la table typée, aux côtés des autres opérations de l'exercice."},
  {"t": "Filtre et agrégat", "d": "Elle passe les filtres actifs, puis s'additionne au total de sa catégorie."},
  {"t": "Des pixels de graphique", "d": "Le total devient la hauteur d'une barre, dessinée par le code de Bare Bones."},
  {"t": "Deux sorties", "d": "Soit un état de vue compact et public, soit un instantané chiffré AES-GCM-256 dont la clé reste dans le fragment."}
],
"intent": "Suivre une seule ligne de bout en bout pour rendre concrètes les transformations successives.",
"approach": "Un convoyeur de céramique traversé par un flux lumineux ; six portiques transforment la ligne (octets, encodage, cellules, table, agrégat, voxels) avant une bifurcation : carte publique ou coffre chiffré."
}META*/

studio();
const XS = [-8.6, -5.6, -2.6, 0.4, 3.4, 6.4];
setView([2.6, 8.2, 24.5], [1.0, 1.4, 0]);
XS.forEach((x, i) => { if (i > 0) shot(i, [x + 2.2, 4.6, 11.5], [x + 0.4, 1.2, 0]); });
shot(6, [6.5, 6.6, 18.5], [4.6, 1.4, 0]);

// convoyeur
const belt = rbox(18.4, 0.14, 1.3, M.ceramic(), [-1.1, 0.07, 0], 0.06); belt.receiveShadow = true; scene.add(belt);
aoBlob(22, 3.4, [-1.1, 0, 0], 0.5);
const line = curveOf([[-10.2, 0.75, 0], [-1, 0.75, 0], [7.6, 0.75, 0]], false, 0);
const segCol = [COL.bone, COL.bone, COL.cyan, COL.cyan, COL.green, COL.orange];
XS.forEach((x, i) => {
  const c = curveOf([[x - 1.5, 0.75, 0], [x + 1.5, 0.75, 0]], false, 0);
  const f = flow(c, { n: 5, color: segCol[i], speed: 0.45, size: 0.04, offset: i * 0.17 });
  scene.add(f); at(i, f, { drop: 0 });
});
function gate(i, name, sub, accent = CSS.cyan) {
  const x = XS[i];
  const arch = group(torus(1.05, 0.06, M.frost(0xd5f2ff, 0.9), [0, 0.15, 0], [0, 0, 0], Math.PI));
  arch.add(torus(1.05, 0.016, M.glow(new THREE.Color(accent).getHex(), 1.8), [0, 0.15, 0.07], [0, 0, 0], Math.PI));
  arch.position.set(x, 0.14, -0.15); scene.add(arch);
  const pl = plaque(i + 1, name, sub, accent, 2.1); pl.position.set(x, 0.32, 1.25); scene.add(pl);
  const holder = new THREE.Group(); holder.position.set(x, 0.14, 0); scene.add(holder);
  at(i, arch, { drop: 0.6 }); at(i, pl, { delay: 0.1, drop: 0.3 }); at(i, holder, { delay: 0.3, drop: 0.4 });
  return holder;
}

// A · octets bruts
const h0 = gate(0, 'Octets bruts', 'BOM + 39 octets', CSS.bone);
const hex = group(rbox(2.4, 0.42, 0.1, M.ink(0x0E1C30), [0, 0, 0], 0.05));
hex.add(place(textPlane(2.4, 0.42, (ctx, W, H) => { font(ctx, 500, H * 0.34, FM); ctx.textBaseline = 'middle'; ctx.fillStyle = CSS.orange; ctx.fillText('EF BB BF', W * 0.04, H * 0.54); ctx.fillStyle = CSS.boneDim; ctx.fillText(' 32 30 32 36 2D 30 32 2D 31 31 3B 46…', W * 0.04 + ctx.measureText('EF BB BF').width, H * 0.54); }, { px: 360 }), [0, 0, 0.052]));
place(hex, [0, 1.75, -0.15], [-0.1, 0, 0]); h0.add(hex);
const bytes = new THREE.InstancedMesh(rboxGeo(0.14, 0.14, 0.14, 0.03), M.ceramic(), 18);
const dd = new THREE.Object3D();
onTick((t) => { for (let k = 0; k < 18; k++) { const u = ((k / 18 + t * 0.12) % 1); dd.position.set(-1.2 + u * 2.4, 0.62 + Math.sin(k * 1.7) * 0.12, Math.cos(k * 2.3) * 0.25); dd.rotation.set(k, k * 0.5, t * 0.5 + k); dd.scale.setScalar(k < 3 ? 1.25 : 1); dd.updateMatrix(); bytes.setMatrixAt(k, dd.matrix); } bytes.instanceMatrix.needsUpdate = true; });
bytes.castShadow = true; h0.add(bytes);

// B · encodage
const h1 = gate(1, 'Encodage', 'UTF-8 · BOM retiré');
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 24), M.frost(0xbfeeff, 1)); lens.scale.set(1, 1, 0.32); lens.position.y = 1.0; lens.castShadow = true; h1.add(lens);
const tag = chip3D('UTF-8 ✓'.replace(' ✓', ''), { accent: CSS.green }); tag.position.set(0, 1.85, 0.1); h1.add(tag);
const scan = rbox(0.04, 1.3, 1.0, M.soft(COL.cyan, 0.35), [0, 1.0, 0], 0); scan.castShadow = false; h1.add(scan);
onTick((t) => { scan.position.x = Math.sin(t * 1.6) * 0.7; });

// C · cellules typées
const h2 = gate(2, 'Cellules typées', 'date · texte · nombre', CSS.cyan);
[['2026-02-11', 'date', CSS.cyan], ['Fournitures', 'texte', CSS.bone], ['−145,90', 'nombre', CSS.orange]].forEach(([v, t, c], k) => {
  const tile = group(rbox(1.15, 0.38, 0.32, M.ink(0x16273E), [0, 0, 0], 0.07));
  tile.add(rbox(1.15, 0.05, 0.33, M.glow(new THREE.Color(c).getHex(), 1.5), [0, 0.2, 0], 0.02));
  tile.add(place(textPlane(1.15, 0.38, (ctx, W, H) => { font(ctx, 500, H * 0.36, t === 'texte' ? FB : FM); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v, W / 2, H * 0.48); font(ctx, 600, H * 0.2, FM); ctx.fillStyle = CSS.boneFaint; ctx.fillText(t, W / 2, H * 0.86); }, { px: 360 }), [0, 0, 0.163]));
  tile.position.set(0, 0.55 + k * 0.48, 0); h2.add(tile);
});

// D · ligne de Table
const h3 = gate(3, 'Ligne de `Table`', 'rejoint l\'exercice 2026');
for (let r = 0; r < 6; r++) {
  const hi = r === 3;
  const row = rbox(1.6, 0.13, 0.9, hi ? M.candy(COL.orange, 0.35) : M.ink(r % 2 ? 0x1B2E48 : 0x22385A), [hi ? 0.28 : 0, 0.32 + r * 0.19, 0], 0.04);
  h3.add(row);
  if (hi) onTick((t) => { row.position.x = 0.28 * (0.5 + 0.5 * Math.cos(t * 1.2)); });
}

// E · filtre et agrégat
const h4 = gate(4, 'Filtre & agrégat', 'Σ par catégorie', CSS.green);
const sieveTex = canvasTex(256, 256, (ctx, W, H) => { ctx.fillStyle = '#EDE7DA'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { ctx.beginPath(); ctx.arc(16 + i * 32, 16 + j * 32, 9, 0, 7); ctx.fill(); } }, false);
const sieve = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 1.0), new THREE.MeshStandardMaterial({ color: 0xEDE7DA, alphaMap: sieveTex, alphaTest: 0.5, roughness: 0.4, metalness: 0.3 }));
sieve.position.y = 1.55; sieve.castShadow = true; h4.add(sieve);
const sig = text3D('Σ', { size: 0.62, depth: 0.16, align: 'center', face: M.candy(COL.green, 0.3), side: M.candy(0x2E8A63, 0.2) });
sig.position.set(0, 0.35, 0); h4.add(sig);
h4.add(flow(curveOf([[0, 2.2, 0], [0, 1.0, 0]]), { n: 4, color: COL.cyan, speed: 0.6, size: 0.035 }));

// F · voxels
const h5 = gate(5, 'Pixels', 'une barre, dessinée maison', CSS.orange);
[4, 7, 5, 9].forEach((hgt, c) => { for (let k = 0; k < hgt; k++) h5.add(rbox(0.2, 0.17, 0.2, M.candy(c === 3 ? COL.orange : COL.cyan, 0.3), [-0.36 + c * 0.24, 0.2 + k * 0.19, 0], 0.03)); });

// bifurcation
const pubC = curveOf([[7.6, 0.75, 0], [8.8, 1.4, -0.8], [10.4, 2.2, -2.2]]);
const prvC = curveOf([[7.6, 0.75, 0], [8.8, 0.7, 1.0], [10.4, 0.7, 2.4]]);
[[pubC, COL.cyan], [prvC, COL.orange]].forEach(([c, col]) => { const t = tube(c, 0.03, M.soft(col, 0.45), 40); const f = flow(c, { n: 5, color: col, speed: 0.4, size: 0.04 }); scene.add(t, f); at(6, t, { drop: 0 }); at(6, f, { drop: 0 }); });
// public : carte d'état compacte, recolorable
const pub = group(rbox(2.0, 1.25, 0.1, M.ceramic(), [0, 0, 0], 0.08));
pub.add(place(textPlane(2.0, 1.25, (ctx, W, H) => { const s = W / 2; richLine(ctx, 'État de vue', 0.14 * s, 0.26 * s, { color: CSS.night, size: 0.15 * s, weight: 600, fam: FD }); font(ctx, 500, 0.085 * s, FM); ctx.fillStyle = 'rgba(13,26,44,0.7)'; ['filters: Activités', 'sort: montant ↓'.replace(' ↓', ' desc'), 'view: barres', 'palette: 3'].forEach((l, i) => ctx.fillText(l, 0.14 * s, (0.46 + i * 0.15) * s)); }, { px: 360 }), [0, 0, 0.052]));
const sw = [COL.cyan, COL.orange, COL.green].map((c, i) => { const d = cyl(0.11, 0.11, 0.05, M.candy(c, 0.3), [0.55 + i * 0.27, -0.38, 0.07]); d.rotation.x = Math.PI / 2; pub.add(d); return d; });
const pals = [[COL.cyan, COL.orange, COL.green], [COL.violet, COL.gold, COL.cyan], [COL.orange, COL.green, COL.violet]];
let pi = 0; setInterval(() => { if (REDUCED) return; pi = (pi + 1) % 3; sw.forEach((d, i) => { d.material = M.candy(pals[pi][i], 0.3); }); }, 1600);
place(pub, [11.2, 2.7, -2.6], [0, -0.35, 0]); scene.add(pub);
at(6, pub, { delay: 0.3 });
// privé : coffre chiffré
const vault = group(rbox(1.5, 1.0, 1.2, M.ink(0x1A2C46), [0, 0.5, 0], 0.12));
vault.add(rbox(1.56, 0.12, 1.26, M.candy(COL.orange, 0.25), [0, 1.0, 0], 0.05));
const dial = cyl(0.26, 0.26, 0.08, M.chrome(), [0, 0.5, 0.62]); dial.rotation.x = Math.PI / 2; vault.add(dial);
vault.add(place(textPlane(1.3, 0.24, (ctx, W, H) => { font(ctx, 600, H * 0.52, FM); ctx.fillStyle = CSS.orange; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AES-GCM-256', W / 2, H * 0.55); }, { px: 380 }), [0, 0.12, 0.605]));
onTick((t) => { dial.rotation.y = t * 0.7; });
place(vault, [11.0, 0.0, 2.6], [0, -0.4, 0]); scene.add(vault); aoBlob(2.6, 2.6, [11, 0, 2.6], 0.5);
at(6, vault, { delay: 0.45 });
at(6, callout([11.2, 3.4, -2.6], [-0.4, 1.6, 0], { kicker: 'Public', title: 'État compact', body: 'filtres, tri, vue : recolorable', w: 2.3 }), { delay: 0.8, drop: 0 });
at(6, callout([10.6, 1.1, 2.6], [-2.4, 1.2, 1.4], { kicker: 'Privé', title: 'Instantané chiffré', body: 'la clé reste dans le fragment', accent: CSS.orange, w: 2.3 }), { delay: 1.0, drop: 0 });
