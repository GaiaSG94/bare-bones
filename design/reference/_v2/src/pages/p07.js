/*META{
"n": 7, "short": "Lien #bb=",
"title": ["Un lien,", "*deux façons* de partager."],
"sub": "Le lien `#bb=` rouvre exactement la même vue : en clair pour un état public, chiffré quand les données sont privées.",
"steps": [
  {"t": "Le fragment `#bb=`", "d": "Tout ce qui suit le # reste dans le navigateur : il n'est jamais envoyé au serveur."},
  {"t": "Mode public : état compact", "d": "Filtres, tri, vue, palette : un état court et lisible, recolorable, qu'on peut partager à tous."},
  {"t": "Mode privé : coffret chiffré", "d": "Un instantané des données, chiffré en AES-GCM-256, qui voyage avec le lien."},
  {"t": "La clé reste dans le fragment", "d": "La clé de déchiffrement est accrochée au fragment : elle ne traverse jamais le serveur."},
  {"t": "Lien falsifié : repli", "d": "Un lien altéré ne casse rien : Bare Bones affiche un message de repli au lieu d'une vue corrompue."}
],
"intent": "Expliquer les deux modes du lien de partage et pourquoi le serveur ne voit jamais ni l'état ni la clé.",
"approach": "Barre d'adresse en volume ; le fragment se dédouble en chaîne vers une carte d'état recolorable et un coffret AES-GCM-256 dont la clé reste pendue au fragment ; serveur derrière une vitre ; lien cassé et carte de repli."
}META*/

studio();
setView([2.2, 7.8, 22], [0.8, 2.4, 0]);
shot(0, [0.8, 5.8, 13.5], [0.2, 3.4, 0]);
shot(1, [5.6, 6.8, 14.5], [3.6, 3.6, -0.6]);
shot(2, [6.4, 4.8, 14], [4.2, 1.6, 0.6]);
shot(3, [-1.2, 6.2, 15.5], [-0.8, 2.6, -0.6]);
shot(4, [2.2, 7.8, 22], [0.8, 2.4, 0]);

// barre d'adresse
const bar = urlPill('https://…/club-results/', '#bb=k7Qx…', { fs: 0.2, h: 0.62 });
bar.position.set(-0.6, 3.6, 0); scene.add(bar);
const W = bar.userData.w;
const fragX = -0.6 + W / 2 - 1.15;
const fragRing = pill(2.1, 0.86, 0.06, M.soft(COL.orange, 0.25), [fragX, 3.6, -0.02]); fragRing.castShadow = false; scene.add(fragRing);
at(0, bar, { drop: 0.6 }); at(0, fragRing, { delay: 0.4, drop: 0 });
onTick((t) => { fragRing.material.opacity = 0.18 + 0.12 * Math.sin(t * 2.4); });

// serveur derrière une vitre
const rack = group(rbox(1.3, 3.0, 1.2, M.ink(0x223249), [0, 1.5, 0], 0.08));
for (let i = 0; i < 6; i++) { rack.add(rbox(1.1, 0.3, 0.04, M.ink(0x15253A), [0, 0.4 + i * 0.42, 0.61], 0.03)); rack.add(sphere(0.035, M.glow(COL.green, 2), [0.42, 0.4 + i * 0.42, 0.64], 12)); }
place(rack, [-6.4, 0, -3.4]); scene.add(rack); aoBlob(2.4, 2.4, [-6.4, 0, -3.4], 0.5);
const pathC = curveOf([[-3.4, 3.3, -0.2], [-5.2, 3.4, -1.8], [-6.2, 3.1, -3.0]]);
const pathT = tube(pathC, 0.02, M.soft(COL.bone, 0.4), 40); const pathF = flow(pathC, { n: 5, color: COL.bone, speed: 0.35, size: 0.04 });
scene.add(rack, pathT, pathF);
// le fragment tente le même chemin : il est arrêté net
const fragC = curveOf([[fragX, 3.3, -0.3], [fragX - 1.2, 3.5, -1.6], [fragX - 2.4, 3.4, -2.4]]);
const glassWall = tube(fragC, 0.02, M.soft(COL.orange, 0.5), 30); scene.add(glassWall);
const xBar = group(capsule([-0.3, -0.3, 0], [0.3, 0.3, 0], 0.06, M.candy(COL.red, 0.9)), capsule([-0.3, 0.3, 0], [0.3, -0.3, 0], 0.06, M.candy(COL.red, 0.9)));
xBar.position.copy(fragC.getPointAt(1)); scene.add(xBar);
[rack, pathT, pathF, glassWall, xBar].forEach((o, i) => at(0, o, { delay: 0.6 + i * 0.1, drop: 0.3 }));
const ps = plaque(null, 'Serveur', 'reçoit le chemin, jamais le fragment', CSS.bone, 2.6); ps.position.set(-6.4, 0.32, -2.2); scene.add(ps); at(0, ps, { delay: 1.0 });

// nœud de bifurcation
const knot = sphere(0.16, M.chrome(), [fragX + 1.6, 2.4, 0.3]); scene.add(knot); at(1, knot, { drop: 0 });
scene.add(chain([fragX + 0.2, 3.2, 0.1], [fragX + 1.5, 2.5, 0.3], { n: 4, r: 0.1, t: 0.028 }));
at(1, scene.children.at(-1), { drop: 0 });

// public : état compact recolorable
const pubChain = chain([fragX + 1.75, 2.55, 0.2], [4.8, 4.0, -1.3], { n: 7, r: 0.1, t: 0.028 }); scene.add(pubChain);
const pub = group(rbox(2.6, 1.7, 0.12, M.ceramic(), [0, 0, 0], 0.1));
pub.add(place(textPlane(2.6, 1.7, (ctx, Wp) => { const s = Wp / 2.6; richLine(ctx, 'État de vue', 0.18 * s, 0.32 * s, { color: CSS.night, size: 0.19 * s, weight: 600, fam: FD }); font(ctx, 500, 0.11 * s, FM); ctx.fillStyle = 'rgba(13,26,44,0.72)'; ['vue : classement', 'tri : points desc', 'filtre : saison 2026', 'palette : 3 couleurs'].forEach((l, i) => ctx.fillText(l, 0.18 * s, (0.58 + i * 0.2) * s)); }, { px: 340 }), [0, 0, 0.062]));
const sw = [0, 1, 2].map((i) => { const d = cyl(0.13, 0.13, 0.06, M.candy(COL.cyan, 0.3), [0.75 + i * 0.32, -0.55, 0.08]); d.rotation.x = Math.PI / 2; pub.add(d); return d; });
const pals = [[COL.cyan, COL.orange, COL.green], [COL.violet, COL.gold, COL.cyan], [COL.orange, COL.green, COL.violet]];
let pi = 0, pt = 0;
onTick((t, dt) => { pt += dt; if (pt > 1.6 && !REDUCED) { pt = 0; pi = (pi + 1) % 3; } sw.forEach((d, i) => { d.material = M.candy(pals[pi][i], 0.3); }); });
place(pub, [5.6, 4.7, -1.6], [0, -0.3, 0]); scene.add(pub);
at(1, pubChain, { delay: 0.2, drop: 0 }); at(1, pub, { delay: 0.4 });
at(1, callout([6.9, 5.5, -1.6], [0.6, 1.3, 0], { kicker: 'Public', title: 'Compact, recolorable', body: 'lisible par tous', w: 2.3 }), { delay: 0.9, drop: 0 });

// privé : coffret chiffré
const prvChain = chain([fragX + 1.75, 2.25, 0.4], [5.2, 1.4, 1.4], { n: 7, r: 0.1, t: 0.028, m: M.candy(COL.orange, 0.3) }); scene.add(prvChain);
const vault = group(rbox(1.8, 1.1, 1.3, M.ink(0x1A2C46), [0, 0.55, 0], 0.12));
const lid = rbox(1.86, 0.16, 1.36, M.candy(COL.orange, 0.25), [0, 1.12, 0], 0.06); vault.add(lid);
const dial = cyl(0.3, 0.3, 0.08, M.chrome(), [0, 0.55, 0.67]); dial.rotation.x = Math.PI / 2; vault.add(dial);
vault.add(place(textPlane(1.6, 0.26, (ctx, Wp, Hp) => { font(ctx, 600, Hp * 0.52, FM); ctx.fillStyle = CSS.orange; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AES-GCM-256', Wp / 2, Hp * 0.55); }, { px: 380 }), [0, 0.13, 0.665]));
place(vault, [6.2, 0, 1.6], [0, -0.35, 0]); scene.add(vault); aoBlob(3, 3, [6.2, 0, 1.6], 0.5);
onTick((t) => { dial.rotation.y = t * 0.6; });
at(2, prvChain, { delay: 0.2, drop: 0 }); at(2, vault, { delay: 0.4 });
at(2, callout([7.1, 1.25, 1.9], [0.9, 1.9, 0], { kicker: 'Privé', title: 'Instantané chiffré', body: 'AES-GCM-256', accent: CSS.orange, w: 2.2 }), { delay: 0.9, drop: 0 });

// la clé, pendue au fragment
const key = group(torus(0.2, 0.06, M.candy(COL.gold, 0.4), [0, 0, 0]), cyl(0.045, 0.045, 0.9, M.candy(COL.gold, 0.4), [0, -0.65, 0]));
key.add(rbox(0.2, 0.08, 0.06, M.candy(COL.gold, 0.4), [0.1, -0.92, 0], 0.02), rbox(0.14, 0.08, 0.06, M.candy(COL.gold, 0.4), [0.08, -0.76, 0], 0.02));
const keyAnchor = new THREE.Group(); keyAnchor.position.set(fragX + 0.4, 3.25, 0.2); scene.add(keyAnchor);
const thread = rod([0, 0, 0], [0, -0.85, 0], 0.008, M.glow(COL.gold, 1.6)); keyAnchor.add(thread);
key.position.set(0, -1.08, 0); keyAnchor.add(key);
onTick((t) => { keyAnchor.rotation.z = Math.sin(t * 1.3) * 0.12; key.rotation.y = Math.sin(t * 0.8) * 0.5; });
at(3, keyAnchor, { drop: 0.4 });
at(3, callout([fragX + 0.4, 2.0, 0.2], [-2.8, -0.8, 0], { kicker: 'Clé', title: 'Reste dans le fragment', body: 'ne quitte jamais le navigateur', accent: CSS.gold, w: 2.4 }), { delay: 0.6, drop: 0 });

// lien falsifié → repli
const brokenL = urlPill('…/club-results/', '#bb=k7Q', { fs: 0.15, h: 0.46, accent: CSS.red });
const brokenR = urlPill('', '%$x…', { fs: 0.15, h: 0.46, accent: CSS.red, icon: 'none' });
place(brokenL, [-1.4, 0.55, 3.4], [0, 0, -0.08]); place(brokenR, [1.25, 0.42, 3.5], [0, 0, 0.12]);
scene.add(brokenL, brokenR);
const fallback = group(rbox(2.5, 1.0, 0.12, M.ink(COL.navy), [0, 0, 0], 0.1));
fallback.add(place(textPlane(2.5, 1.0, (ctx, Wp) => { const s = Wp / 2.5; font(ctx, 700, 0.12 * s, FM); ctx.fillStyle = CSS.gold; ctx.fillText('MESSAGE DE REPLI', 0.18 * s, 0.28 * s); richLine(ctx, 'Lien illisible', 0.18 * s, 0.55 * s, { color: CSS.bone, size: 0.17 * s, weight: 600, fam: FD }); richLine(ctx, 'la vue par défaut s\'affiche', 0.18 * s, 0.8 * s, { color: CSS.boneDim, size: 0.11 * s }); }, { px: 360 }), [0, 0, 0.062]));
place(fallback, [3.9, 0.95, 3.2], [0, -0.25, 0]); scene.add(fallback);
[brokenL, brokenR].forEach((o, i) => at(4, o, { delay: i * 0.15 })); at(4, fallback, { delay: 0.45 });
