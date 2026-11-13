// ===================== Socle commun des planches Bare Bones (tout en 3D) =====================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const META = window.META;
if (window.__bbNoGL) throw new Error('WebGL indisponible : repli CSS 3D');
const FONT = new FontLoader().parse(FONT3D_DATA);

const COL = {
  night: 0x0D1A2C, ink: 0x0A1422, navy: 0x16273E, navy2: 0x1E3352,
  bone: 0xEDE7DA, boneSide: 0xB9B1A2, cyan: 0x4CC9F0, orange: 0xFF8A3D,
  red: 0xFF5A5F, green: 0x5BE3A4, gold: 0xF2C14E, violet: 0x9B8CFF, steel: 0x8FA3B8,
};
const CSS = {
  night: '#0D1A2C', ink: '#0A1422', bone: '#EDE7DA', boneDim: 'rgba(237,231,218,0.70)', boneFaint: 'rgba(237,231,218,0.42)',
  cyan: '#4CC9F0', orange: '#FF8A3D', red: '#FF5A5F', green: '#5BE3A4', gold: '#F2C14E', violet: '#9B8CFF', steel: '#8FA3B8',
};
const FD = '"Space Grotesk", Inter, "Segoe UI", sans-serif';
const FB = 'Inter, "Segoe UI", sans-serif';
const FM = '"JetBrains Mono", Consolas, monospace';
const REDUCED = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const hexCss = (c) => '#' + new THREE.Color(c).getHexString();

try {
  await Promise.race([
    Promise.all([`700 40px ${FD}`, `600 40px ${FD}`, `500 40px ${FD}`, `400 40px ${FB}`, `500 40px ${FB}`, `600 40px ${FB}`, `500 40px ${FM}`, `700 40px ${FM}`].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
} catch (e) { /* polices de repli */ }

// ---------- moteur ----------
const glEl = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
glEl.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', 'Scène 3D interactive : glisser pour orbiter, molette pour zoomer, flèches pour changer d\'étape');
renderer.domElement.setAttribute('role', 'img');

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.fog = new THREE.Fog(0x0F1E33, 26, 60);

const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 300);
scene.add(camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 5;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.49;
controls.enablePan = true;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1280, 720), 0.3, 0.6, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// lumière de studio
scene.add(new THREE.HemisphereLight(0xd2e6ff, 0x0a1422, 0.6));
const keyLight = new THREE.DirectionalLight(0xfff1e2, 2.4);
keyLight.position.set(7, 15, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
Object.assign(keyLight.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 60 });
keyLight.shadow.radius = 9;
keyLight.shadow.blurSamples = 16;
keyLight.shadow.bias = -0.0006;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x7fd6ff, 0.75);
fillLight.position.set(-11, 6, 5);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffb27a, 0.75);
rimLight.position.set(7, 6, -11);
scene.add(rimLight);

// ---------- utilitaires ----------
const v3 = (a) => (a && a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function place(o, p, r) { if (p) o.position.set(p[0], p[1], p[2]); if (r) o.rotation.set(r[0], r[1], r[2]); return o; }
function group(...kids) { const g = new THREE.Group(); kids.flat().forEach((k) => k && g.add(k)); return g; }
function noShadow(o) { o.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } }); return o; }

// ---------- matériaux (mis en cache) ----------
const _mc = new Map();
const memo = (k, f) => { if (!_mc.has(k)) _mc.set(k, f()); return _mc.get(k); };
const M = {
  ceramic: (c = COL.bone) => memo('cer' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.4, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.2, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 0.55 })),
  ink: (c = COL.navy) => memo('ink' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, metalness: 0.15, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.4 })),
  plate: () => memo('plate', () => new THREE.MeshStandardMaterial({ color: 0x0C1828, roughness: 0.8, metalness: 0, envMapIntensity: 0.12 })),
  candy: (c, e = 0.22) => memo('can' + c + e, () => new THREE.MeshPhysicalMaterial({ color: c, emissive: c, emissiveIntensity: e, roughness: 0.26, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 })),
  frost: (c = 0xcfeeff, t = 1) => memo('fro' + c + t, () => new THREE.MeshPhysicalMaterial({ color: c, transmission: t, thickness: 0.7, roughness: 0.22, metalness: 0, ior: 1.42, clearcoat: 0.5, clearcoatRoughness: 0.15, attenuationColor: new THREE.Color(c), attenuationDistance: 3, envMapIntensity: 1 })),
  glass: (c = 0x0F1E33, op = 1) => memo('gla' + c + op, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0, transparent: op < 1, opacity: op, envMapIntensity: 0.18 })),
  paper: () => memo('pap', () => new THREE.MeshStandardMaterial({ color: 0xE6E1D6, roughness: 0.78, metalness: 0, envMapIntensity: 0.45 })),
  hudSlab: () => memo('hslab', () => new THREE.MeshStandardMaterial({ color: 0x08111E, roughness: 0.65, metalness: 0, envMapIntensity: 0.08, fog: false })),
  hudFace: (c = COL.bone) => memo('hface' + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0, envMapIntensity: 0.3, fog: false })),
  hudAccent: (c = COL.orange, e = 0.25) => memo('hacc' + c + e, () => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: e, roughness: 0.45, metalness: 0, envMapIntensity: 0.3, fog: false })),
  chrome: () => memo('chr', () => new THREE.MeshStandardMaterial({ color: 0xdfe7f0, metalness: 1, roughness: 0.16 })),
  glow: (c = COL.cyan, k = 2.4) => memo('glo' + c + k, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false })),
  soft: (c = COL.cyan, op = 0.3) => memo('sof' + c + op, () => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })),
};
const hudMat = (m) => { const c = m.clone(); c.fog = false; return c; };

// ---------- primitives ----------
const _gc = new Map();
function rboxGeo(w, h, d, r = 0.06, seg = 4) {
  const rad = Math.max(0, Math.min(r, Math.min(w, h, d) / 2 - 0.0005));
  const k = [w, h, d, rad, seg].map((x) => +x.toFixed(4)).join('|');
  if (!_gc.has(k)) _gc.set(k, rad > 0.003 ? new RoundedBoxGeometry(w, h, d, seg, rad) : new THREE.BoxGeometry(w, h, d));
  return _gc.get(k);
}
function rbox(w, h, d, m, p, r = 0.06) { const me = new THREE.Mesh(rboxGeo(w, h, d, r), m); me.castShadow = true; return place(me, p); }
function pill(w, h, d, m, p) { return rbox(w, h, d, m, p, Math.min(h, d) / 2); }
function cyl(rt, rb, h, m, p, seg = 48) { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.castShadow = true; return place(me, p); }
function sphere(r, m, p, seg = 32) { const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.66)), m); me.castShadow = true; return place(me, p); }
function torus(r, t, m, p, rot, arc = Math.PI * 2) { const me = new THREE.Mesh(new THREE.TorusGeometry(r, t, 16, 64, arc), m); me.castShadow = true; return place(me, p, rot); }
function orient(me, A, B) {
  me.position.copy(A).add(B).multiplyScalar(0.5);
  me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return me;
}
function capsule(a, b, r, m) { const A = v3(a), B = v3(b); const L = Math.max(0.001, A.distanceTo(B) - 2 * r); const me = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 6, 18), m); me.castShadow = true; return orient(me, A, B); }
function rod(a, b, r, m) { const A = v3(a), B = v3(b); const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 12), m); return orient(me, A, B); }
function curveOf(pts, closed = false, tension = 0.5) { return new THREE.CatmullRomCurve3(pts.map(v3), closed, 'catmullrom', tension); }
function tube(c, r, m, segs = 160) { const curve = Array.isArray(c) ? curveOf(c) : c; const me = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, r, 12, false), m); me.userData.curve = curve; return me; }
function extrude(shape, depth, m, bevel = 0.02) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 32 });
  const me = new THREE.Mesh(g, m); me.castShadow = true; return me;
}

// ---------- textures canvas ----------
const radialTex = memoTex(() => canvasTex(256, 256, (ctx, W, H) => {
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  g.addColorStop(0, '#fff'); g.addColorStop(0.55, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}, false));
function memoTex(f) { let t; return () => (t ||= f()); }
function canvasTex(wpx, hpx, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(wpx)); c.height = Math.max(2, Math.round(hpx));
  const ctx = c.getContext('2d');
  draw(ctx, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  t.userData = { canvas: c, ctx, draw };
  return t;
}
function redraw(tex, draw) { const { canvas, ctx } = tex.userData; ctx.clearRect(0, 0, canvas.width, canvas.height); (draw || tex.userData.draw)(ctx, canvas.width, canvas.height); tex.needsUpdate = true; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function font(ctx, w, px, f = FB) { ctx.font = `${w} ${Math.round(px)}px ${f}`; }
// texte riche : `code` en mono orange, *accent* en orange
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t.replace(/[`*]/g, '')).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return lines;
}
function richLine(ctx, line, x, y, { color, code = CSS.orange, size, weight = 400, fam = FB }) {
  const parts = line.split(/(`[^`]+`|\*[^*]+\*)/).filter(Boolean);
  let cx = x;
  for (const p of parts) {
    if (p.startsWith('`')) { font(ctx, 500, size * 0.92, FM); ctx.fillStyle = code; const s = p.slice(1, -1); ctx.fillText(s, cx, y); cx += ctx.measureText(s).width; }
    else if (p.startsWith('*')) { font(ctx, weight, size, fam); ctx.fillStyle = code; const s = p.slice(1, -1); ctx.fillText(s, cx, y); cx += ctx.measureText(s).width; }
    else { font(ctx, weight, size, fam); ctx.fillStyle = color; ctx.fillText(p, cx, y); cx += ctx.measureText(p).width; }
  }
  return cx - x;
}
function textPlane(w, h, draw, { px = 360, fog = true } = {}) {
  const tex = canvasTex(w * px, h * px, draw);
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, fog });
  const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  me.renderOrder = 2;
  me.userData.tex = tex;
  return me;
}
const _mctx = document.createElement('canvas').getContext('2d');

// ---------- typographie 3D (Noto Sans Bold, SIL OFL) ----------
const RES = FONT.data.resolution;
function adv(str, size) { let a = 0; for (const ch of str) a += (FONT.data.glyphs[ch] || FONT.data.glyphs['?']).ha; return (a * size) / RES; }
function text3D(str, { size = 0.5, depth = 0.12, face = M.ceramic(), side = M.ceramic(COL.boneSide), bevel = true, align = 'left', curve = 5 } = {}) {
  const g = new TextGeometry(str, { font: FONT, size, height: depth, curveSegments: curve, bevelEnabled: bevel, bevelThickness: depth * 0.22, bevelSize: size * 0.018, bevelOffset: 0, bevelSegments: 3 });
  const w = adv(str, size);
  if (align === 'center') g.translate(-w / 2, 0, 0);
  if (align === 'right') g.translate(-w, 0, 0);
  const me = new THREE.Mesh(g, [face, side]);
  me.castShadow = true;
  me.userData.w = w;
  return me;
}
// ligne avec segments *accentués*
function text3DLine(line, { size = 0.5, depth = 0.1, face = M.ceramic(), accent = M.candy(COL.orange, 0.3), side = M.ceramic(COL.boneSide), accentSide = M.candy(0xB65A22, 0.15), align = 'left' } = {}) {
  const g = new THREE.Group();
  const parts = line.split(/(\*[^*]+\*)/).filter(Boolean);
  let x = 0;
  for (const p of parts) {
    const acc = p.startsWith('*');
    const s = acc ? p.slice(1, -1) : p;
    if (!s.trim()) { x += adv(s, size); continue; }
    const me = text3D(s, { size, depth, face: acc ? accent : face, side: acc ? accentSide : side });
    me.position.x = x; x += adv(s, size);
    g.add(me);
  }
  const w = x;
  if (align === 'center') g.children.forEach((c) => (c.position.x -= w / 2));
  g.userData.w = w;
  return g;
}

// ---------- carte de verre (étiquette 3D) ----------
const billboards = [];
function card({ kicker, title, body, accent = CSS.cyan, w = 2.6, ts = 0.16, bs = 0.1, ks = 0.068, pad = 0.15, px = 420, n, mono = false } = {}) {
  const inner = w - pad * 2;
  font(_mctx, 600, ts * px, mono ? FM : FD);
  const tl = title ? wrap(_mctx, title, inner * px) : [];
  font(_mctx, 400, bs * px, FB);
  const bl = body ? wrap(_mctx, body, inner * px) : [];
  const kh = kicker ? ks * 1.9 : 0;
  const h = pad + kh + tl.length * ts * 1.2 + (bl.length ? bs * 0.55 + bl.length * bs * 1.48 : 0) + pad * 0.9;
  const g = new THREE.Group();
  const slab = rbox(w, h, 0.06, M.glass(0x0E1C30), null, Math.min(0.1, h / 3));
  slab.castShadow = false;
  g.add(slab);
  const face = textPlane(w, h, (ctx, W, H) => {
    const s = px;
    const hl = ctx.createLinearGradient(0, 0, W, 0); hl.addColorStop(0, accent); hl.addColorStop(0.6, accent + '00');
    ctx.fillStyle = hl; ctx.globalAlpha = 0.85; ctx.fillRect(pad * s, 0.02 * s, W - pad * 2 * s, 2.2); ctx.globalAlpha = 1;
    let y = pad * s;
    if (kicker) {
      font(ctx, 600, ks * s, FM); ctx.fillStyle = accent; ctx.textBaseline = 'top';
      ctx.fillText(String(kicker).toUpperCase().split('').join(String.fromCharCode(8202)), pad * s, y);
      y += kh * s;
    }
    ctx.textBaseline = 'alphabetic';
    tl.forEach((l) => { y += ts * s * 1.0; richLine(ctx, l, pad * s, y, { color: CSS.bone, size: ts * s, weight: 600, fam: mono ? FM : FD, code: accent === CSS.cyan ? CSS.orange : accent }); y += ts * s * 0.2; });
    if (bl.length) y += bs * s * 0.55;
    bl.forEach((l) => { y += bs * s * 1.08; richLine(ctx, l, pad * s, y, { color: CSS.boneDim, size: bs * s, code: CSS.orange }); y += bs * s * 0.4; });
  }, { px });
  face.position.z = 0.033;
  g.add(face);
  if (n != null) {
    const coin = cyl(0.13, 0.13, 0.06, M.candy(new THREE.Color(accent).getHex(), 0.35), [w / 2 - 0.02, h / 2 - 0.02, 0.05]);
    coin.rotation.x = Math.PI / 2; coin.castShadow = false;
    const numTex = textPlane(0.22, 0.22, (ctx, W, H) => { font(ctx, 700, H * 0.52, FM); ctx.fillStyle = '#0A1422'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), W / 2, H * 0.54); }, { px: 400 });
    numTex.position.set(w / 2 - 0.02, h / 2 - 0.02, 0.084);
    g.add(coin, numTex);
  }
  g.userData.size = { w, h };
  return g;
}
// étiquette posée dans la scène : point d'ancrage + fil + carte qui fait face à la caméra
function callout(anchor, off, opts = {}) {
  const accent = opts.accent || CSS.cyan;
  const acc = new THREE.Color(accent).getHex();
  const g = new THREE.Group(); g.position.copy(v3(anchor));
  const c = card(opts); c.position.set(off[0], off[1], off[2] || 0);
  c.userData.billboard = { ref: opts.ref || 17 };
  billboards.push(c);
  const dot = sphere(0.055, M.glow(acc, 2.2), [0, 0, 0], 16); dot.castShadow = false;
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.115, 40), M.soft(acc, 0.7));
  halo.userData.billboard = { fixed: true }; billboards.push(halo);
  onTick((t) => { const k = 1 + ((t * 0.7) % 1) * 1.4; halo.scale.setScalar(k); halo.material.opacity = 0.7 * (1 - ((t * 0.7) % 1)); });
  const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 1, 8), M.soft(acc, 0.6));
  c.userData.lead = lead;
  g.add(lead, dot, halo, c);
  scene.add(g);
  return g;
}

// ---------- studio ----------
function studio({ radius = 72, glowAt = [0, 0, 0] } = {}) {
  scene.background = canvasTex(1600, 900, (ctx, W, H) => {
    const g = ctx.createRadialGradient(W * 0.58, H * 0.42, 0, W * 0.58, H * 0.42, W * 0.75);
    g.addColorStop(0, '#1C3654'); g.addColorStop(0.45, '#12253D'); g.addColorStop(1, '#08111E');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  const floorTex = canvasTex(1024, 1024, (ctx, W, H) => {
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    g.addColorStop(0, '#1B3150'); g.addColorStop(0.5, '#132640'); g.addColorStop(1, '#0D1A2C');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(radius, 128), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.8, metalness: 0.05, envMapIntensity: 0.15 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(floor);
  // trame de points discrète qui s'efface en s'éloignant
  const dots = canvasTex(64, 64, (ctx, W, H) => { ctx.fillStyle = 'rgba(160,215,245,0.55)'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 2.2, 0, 7); ctx.fill(); });
  dots.wrapS = dots.wrapT = THREE.RepeatWrapping; dots.repeat.set(radius * 0.9, radius * 0.9);
  const grid = new THREE.Mesh(new THREE.CircleGeometry(26, 96), new THREE.MeshBasicMaterial({ map: dots, alphaMap: radialTex(), transparent: true, opacity: 0.35, depthWrite: false }));
  grid.rotation.x = -Math.PI / 2; grid.position.set(glowAt[0], 0.004, glowAt[2]);
  scene.add(grid);
  bokeh();
  return floor;
}
function aoBlob(w, d, p, op = 0.55) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: 0x02060c, alphaMap: radialTex(), transparent: true, opacity: op, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(p[0], 0.008, p[2]);
  scene.add(m); return m;
}
function bokeh(n = 140) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const cA = new THREE.Color(COL.cyan), cB = new THREE.Color(COL.orange), cC = new THREE.Color(COL.bone);
  for (let i = 0; i < n; i++) {
    pos.set([(Math.random() - 0.5) * 44, 0.5 + Math.random() * 13, -6 - Math.random() * 16], i * 3);
    const c = [cA, cA, cC, cB][i % 4]; col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.32, map: radialTex(), vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false }));
  scene.add(p);
  onTick((t) => { p.position.x = Math.sin(t * 0.05) * 0.8; p.position.y = Math.sin(t * 0.13) * 0.2; });
}

// ---------- ossature : poutres de lumière, articulations en os ----------
function armature({ w = 6, h = 4, d = 2.6, nx = 3, ny = 2, r = 0.075, braces = true } = {}) {
  const g = new THREE.Group();
  const xs = [...Array(nx + 1)].map((_, i) => -w / 2 + (i * w) / nx);
  const ys = [...Array(ny + 1)].map((_, i) => (i * h) / ny);
  const zs = [-d / 2, d / 2];
  const beams = [], nodes = [];
  const glass = M.frost(0xd8f3ff, 0.92), core = M.glow(COL.cyan, 2.1), bone = M.ceramic();
  const add = (a, b, rad = r) => {
    const bg = group(capsule(a, b, rad, glass), rod(a, b, rad * 0.22, core));
    bg.children[1].castShadow = false;
    g.add(bg); beams.push(bg);
  };
  xs.forEach((x) => zs.forEach((z) => add([x, 0, z], [x, h, z], r * 1.12)));
  ys.forEach((y) => zs.forEach((z) => xs.slice(0, -1).forEach((x, i) => add([x, y, z], [xs[i + 1], y, z]))));
  ys.forEach((y) => xs.forEach((x) => add([x, y, zs[0]], [x, y, zs[1]], r * 0.85)));
  if (braces) xs.slice(0, -1).forEach((x, i) => ys.slice(0, -1).forEach((y, j) => add([x, y, zs[0]], [xs[i + 1], ys[j + 1], zs[0]], r * 0.55)));
  xs.forEach((x) => ys.forEach((y) => zs.forEach((z) => {
    const n = group(sphere(r * 1.9, bone, [0, 0, 0], 24));
    n.position.set(x, y, z);
    g.add(n); nodes.push(n);
  })));
  return { group: g, beams, nodes, xs, ys, zs };
}

// ---------- composants d'interface en volume ----------
const TYPE_COL = { date: CSS.cyan, nombre: CSS.orange, texte: CSS.bone, catégorie: CSS.green, issue: CSS.gold, entier: CSS.orange };
// table typée : une tuile par cellule, en-têtes avec pastille de type, ligne surlignée en relief
function table3D({ cols, rows, w = 5.4, rowH = 0.34, headH = 0.5, gap = 0.035, highlight = -1, depth = 0.07, title, meta } = {}) {
  const g = new THREE.Group();
  const titleH = title ? 0.42 : 0;
  const H = titleH + headH + rows.length * rowH;
  const back = rbox(w + 0.28, H + 0.28, 0.08, M.glass(0x0C1A2D, 0.92), [0, 0, -0.06], 0.12);
  back.castShadow = true; g.add(back);
  const x0 = -w / 2; let cx = x0;
  const xs = cols.map((c) => { const s = cx; cx += c.w * w; return s; });
  const top = H / 2;
  cols.forEach((c, i) => {
    const cw = c.w * w;
    g.add(rbox(cw - gap, headH - gap, depth, M.ink(COL.navy2), [xs[i] + cw / 2, top - titleH - headH / 2, 0], 0.05));
    g.add(pill(0.07, 0.07, 0.02, M.candy(new THREE.Color(TYPE_COL[c.t] || CSS.cyan).getHex(), 0.5), [xs[i] + 0.12, top - titleH - headH * 0.73, depth / 2 + 0.01]));
  });
  rows.forEach((r, j) => {
    const yc = top - titleH - headH - j * rowH - rowH / 2;
    const hi = j === highlight;
    cols.forEach((c, i) => {
      const cw = c.w * w;
      g.add(rbox(cw - gap, rowH - gap, depth, hi ? M.candy(0x3B2414, 0.12) : M.ink(j % 2 ? 0x15253B : 0x182A42), [xs[i] + cw / 2, yc, hi ? 0.16 : 0], 0.04));
    });
  });
  const px = 300;
  const tp = textPlane(w, H, (ctx, W, Hh) => {
    const s = px;
    if (title) {
      richLine(ctx, title, 0.02 * s, titleH * 0.62 * s, { color: CSS.bone, size: 0.2 * s, weight: 600, fam: FD });
      if (meta) { font(ctx, 500, 0.11 * s, FM); ctx.fillStyle = CSS.boneFaint; ctx.textAlign = 'right'; ctx.fillText(meta, W - 0.02 * s, titleH * 0.6 * s); ctx.textAlign = 'left'; }
    }
    cols.forEach((c, i) => {
      const lx = (xs[i] - x0) * s, cw = c.w * w * s;
      const tx = c.right ? lx + cw - 0.12 * s : lx + 0.22 * s;
      ctx.textAlign = c.right ? 'right' : 'left';
      font(ctx, 600, 0.15 * s, FD); ctx.fillStyle = CSS.bone; ctx.fillText(c.n, c.right ? tx : lx + 0.12 * s, (titleH + headH * 0.45) * s);
      font(ctx, 500, 0.095 * s, FM); ctx.fillStyle = TYPE_COL[c.t] || CSS.cyan; ctx.fillText(c.t, tx, (titleH + headH * 0.8) * s);
    });
    rows.forEach((r, j) => {
      if (j === highlight) return;
      drawRow(ctx, r, (titleH + headH + j * rowH + rowH * 0.64) * s);
    });
    function drawRow(c2, r, y) { r.forEach((v, i) => cellText(c2, cols[i], v, (xs[i] - x0) * s, cols[i].w * w * s, y, s)); }
  }, { px });
  tp.position.set(0, 0, depth / 2 + 0.004);
  g.add(tp);
  if (highlight >= 0) {
    const hp = textPlane(w, rowH, (ctx) => { rows[highlight].forEach((v, i) => cellText(ctx, cols[i], v, (xs[i] - x0) * px, cols[i].w * w * px, rowH * 0.64 * px, px)); }, { px });
    hp.position.set(0, top - titleH - headH - highlight * rowH - rowH / 2, 0.16 + depth / 2 + 0.004);
    g.add(hp);
  }
  g.userData.H = H;
  return g;
}
function cellText(ctx, c, v, lx, cw, y, s) {
  const tx = c.right ? lx + cw - 0.12 * s : lx + 0.12 * s;
  ctx.textAlign = c.right ? 'right' : 'left';
  const str = String(v);
  if (c.t === 'issue') {
    let ox = lx + 0.12 * s;
    [...str].forEach((ch) => {
      const col = ch === 'W' ? CSS.green : ch === 'D' ? CSS.gold : CSS.red;
      rr(ctx, ox, y - 0.15 * s, 0.17 * s, 0.17 * s, 0.04 * s); ctx.fillStyle = col + '30'; ctx.fill();
      font(ctx, 700, 0.11 * s, FM); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(ch, ox + 0.085 * s, y - 0.025 * s);
      ox += 0.2 * s;
    });
    ctx.textAlign = 'left'; return;
  }
  const isNum = c.t === 'nombre' || c.t === 'date' || c.t === 'entier';
  font(ctx, isNum ? 500 : 400, 0.12 * s, isNum ? FM : FB);
  ctx.fillStyle = c.t === 'nombre' && str.trim().startsWith('−') ? CSS.orange : c.t === 'catégorie' ? CSS.green : CSS.bone;
  ctx.fillText(str, tx, y);
  ctx.textAlign = 'left';
}
// barres arrondies sur un socle
function bars3D(vals, { bw = 0.34, gap = 0.16, maxH = 2, colors = [COL.cyan], depth = 0.34, labels, base = true, max } = {}) {
  const g = new THREE.Group();
  const m = max ?? Math.max(...vals);
  const W = vals.length * (bw + gap) - gap;
  if (base) {
    const b = rbox(W + 0.4, 0.1, depth + 0.4, M.ceramic(), [0, 0.05, 0], 0.05); b.receiveShadow = true; g.add(b);
  }
  const bars = [];
  vals.forEach((v, i) => {
    const h = Math.max(0.05, (v / m) * maxH);
    const geo = new RoundedBoxGeometry(bw, h, depth, 4, Math.min(0.06, bw / 3)); geo.translate(0, h / 2, 0);
    const me = new THREE.Mesh(geo, M.candy(colors[i % colors.length], 0.22));
    me.castShadow = true; me.position.set(-W / 2 + i * (bw + gap) + bw / 2, base ? 0.1 : 0, 0);
    g.add(me); bars.push(me);
  });
  if (labels) {
    const tp = textPlane(W + 0.4, 0.22, (ctx, Wp, Hp) => {
      font(ctx, 500, Hp * 0.5, FM); ctx.fillStyle = CSS.night; ctx.textAlign = 'center';
      labels.forEach((l, i) => ctx.fillText(l, ((0.2 + i * (bw + gap) + bw / 2) / (W + 0.4)) * Wp, Hp * 0.66));
    }, { px: 300 });
    tp.position.set(0, 0.05, (depth + 0.4) / 2 + 0.006);
    tp.scale.y = 0.45;
    g.add(tp);
  }
  g.userData.bars = bars;
  return g;
}
// aire extrudée + courbe lumineuse
function area3D(vals, { w = 2.6, h = 1.4, depth = 0.16, color = COL.cyan, min, max, ref } = {}) {
  const g = new THREE.Group();
  const lo = min ?? Math.min(...vals) * 0.8, hi = max ?? Math.max(...vals) * 1.05;
  const P = (v, i, arr) => new THREE.Vector2(-w / 2 + (i / (arr.length - 1)) * w, ((v - lo) / (hi - lo)) * h);
  const pts = vals.map(P);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); pts.forEach((p) => sh.lineTo(p.x, p.y)); sh.lineTo(w / 2, 0); sh.lineTo(-w / 2, 0);
  const body = extrude(sh, depth, M.frost(color, 0.85), 0.015);
  body.position.z = -depth / 2; g.add(body);
  const line = tube(curveOf(pts.map((p) => [p.x, p.y, depth / 2 + 0.02]), false, 0.1), 0.028, M.glow(color, 2.2), 120);
  line.castShadow = false; g.add(line);
  const end = pts[pts.length - 1]; g.add(sphere(0.06, M.ceramic(), [end.x, end.y, depth / 2 + 0.02]));
  if (ref) {
    const rp = ref.map(P);
    const rc = curveOf(rp.map((p) => [p.x, p.y, depth / 2 + 0.05]), false, 0.1);
    for (let i = 0; i <= 26; i++) { const q = rc.getPointAt(i / 26); g.add(sphere(0.018, M.glow(COL.orange, 2), [q.x, q.y, q.z], 8)); }
  }
  const base = rbox(w + 0.3, 0.06, depth + 0.4, M.ceramic(), [0, -0.03, 0], 0.03); base.receiveShadow = true; g.add(base);
  return g;
}
// anneau en secteurs extrudés
function donut3D(parts, { r = 0.8, t = 0.3, depth = 0.22, gap = 0.035, colors = [COL.cyan, COL.orange, COL.green, COL.gold, COL.violet] } = {}) {
  const g = new THREE.Group();
  const sum = parts.reduce((a, b) => a + b, 0);
  let a0 = Math.PI / 2;
  parts.forEach((p, i) => {
    const da = (p / sum) * Math.PI * 2;
    const s0 = a0 - gap / 2, s1 = a0 - da + gap / 2;
    const sh = new THREE.Shape();
    sh.absarc(0, 0, r, s0, s1, true);
    sh.absarc(0, 0, r - t, s1, s0, false);
    const me = extrude(sh, depth, M.candy(colors[i % colors.length], 0.2), 0.02);
    me.position.z = -depth / 2 - (i === 0 ? -0.08 : 0);
    g.add(me);
    a0 -= da;
  });
  return g;
}
// curseur de plage
function slider3D(w = 2, lo = 0.2, hi = 0.75, accent = COL.cyan) {
  const g = new THREE.Group();
  g.add(capsule([-w / 2, 0, 0], [w / 2, 0, 0], 0.035, M.ink(COL.navy2)));
  const seg = capsule([-w / 2 + lo * w, 0, 0.005], [-w / 2 + hi * w, 0, 0.005], 0.042, M.candy(accent, 0.4));
  g.add(seg);
  const k1 = sphere(0.1, M.ceramic(), [-w / 2 + lo * w, 0, 0.02]), k2 = sphere(0.1, M.ceramic(), [-w / 2 + hi * w, 0, 0.02]);
  k1.scale.z = k2.scale.z = 0.7;
  g.add(k1, k2);
  g.userData = { k1, k2, seg, w };
  return g;
}
function chip3D(text, { on = true, accent = CSS.green, h = 0.26, fs = 0.12 } = {}) {
  font(_mctx, 500, fs * 400, FB);
  const w = _mctx.measureText(text).width / 400 + h * 1.4;
  const acc = new THREE.Color(accent).getHex();
  const g = group(pill(w, h, 0.08, on ? M.candy(acc, 0.08) : M.ink(COL.navy2), [0, 0, 0]));
  if (on) g.children[0].material = memo('chipon' + acc, () => new THREE.MeshStandardMaterial({ color: new THREE.Color(acc).multiplyScalar(0.16), emissive: acc, emissiveIntensity: 0.06, roughness: 0.5, envMapIntensity: 0.25 }));
  const tp = textPlane(w, h, (ctx, W, H) => {
    font(ctx, 500, fs * 400, FB); ctx.fillStyle = on ? accent : CSS.boneDim; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, H * 0.54);
  }, { px: 400 });
  tp.position.z = 0.042; g.add(tp);
  g.userData.w = w;
  return g;
}
// fichier papier à coin plié
function file3D({ name = 'donnees.csv', lines = [], w = 1.8, h = 2.3, accent = CSS.orange, bad = [] } = {}) {
  const g = new THREE.Group();
  const c = 0.38;
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, -h / 2); sh.lineTo(w / 2, -h / 2); sh.lineTo(w / 2, h / 2 - c); sh.lineTo(w / 2 - c, h / 2); sh.lineTo(-w / 2, h / 2); sh.lineTo(-w / 2, -h / 2);
  const paper = extrude(sh, 0.035, M.paper(), 0.012); paper.position.z = -0.0175; g.add(paper);
  const fold = new THREE.Shape(); fold.moveTo(w / 2 - c, h / 2); fold.lineTo(w / 2 - c, h / 2 - c); fold.lineTo(w / 2, h / 2 - c); fold.lineTo(w / 2 - c, h / 2);
  const f = extrude(fold, 0.02, M.ink(0xBDB6A8), 0.006); f.position.z = 0.03; g.add(f);
  const tp = textPlane(w, h, (ctx, W, H) => {
    const s = W / w;
    rr(ctx, 0.14 * s, 0.16 * s, 0.46 * s, 0.2 * s, 0.1 * s); ctx.fillStyle = accent; ctx.fill();
    font(ctx, 700, 0.11 * s, FM); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('CSV', 0.37 * s, 0.3 * s); ctx.textAlign = 'left';
    font(ctx, 600, 0.13 * s, FD); ctx.fillStyle = '#0D1A2C'; ctx.fillText(name, 0.14 * s, 0.6 * s);
    ctx.fillStyle = 'rgba(13,26,44,0.12)'; ctx.fillRect(0.14 * s, 0.7 * s, W - 0.28 * s, 2);
    font(ctx, 500, 0.085 * s, FM);
    lines.forEach((l, i) => { ctx.fillStyle = bad.includes(i) ? accent : 'rgba(13,26,44,0.72)'; ctx.fillText(l, 0.14 * s, (0.9 + i * 0.17) * s); });
  }, { px: 360 });
  tp.position.z = 0.033; g.add(tp);
  return g;
}
// pastille d'URL : chemin en clair, fragment #bb= en orange
function urlPill(path, frag, { h = 0.5, fs = 0.2, accent = CSS.orange, icon = 'link' } = {}) {
  font(_mctx, 500, fs * 400, FM);
  const tw = (_mctx.measureText(path).width + _mctx.measureText(frag).width) / 400;
  const w = tw + h * 1.9;
  const g = group(pill(w, h, 0.16, M.glass(0x101F35, 0.92), [0, 0, 0]));
  const rim = pill(w + 0.04, h + 0.04, 0.12, M.candy(new THREE.Color(accent).getHex(), 0.5), [0, 0, -0.03]); g.add(rim);
  const tp = textPlane(w, h, (ctx, W, H) => {
    font(ctx, 500, fs * 400, FM); ctx.textBaseline = 'middle';
    ctx.fillStyle = CSS.boneDim; ctx.fillText(path, h * 1.25 * 400, H * 0.54);
    ctx.fillStyle = accent; ctx.fillText(frag, h * 1.25 * 400 + ctx.measureText(path).width, H * 0.54);
  }, { px: 400 });
  tp.position.z = 0.085; g.add(tp);
  const ix = -w / 2 + h * 0.62;
  if (icon === 'link') {
    g.add(torus(0.07, 0.022, M.chrome(), [ix - 0.05, 0, 0.09], [0, 0, 0.6]), torus(0.07, 0.022, M.chrome(), [ix + 0.05, 0, 0.09], [0, 0, 0.6]));
    g.children.at(-1).scale.set(1.3, 0.8, 1); g.children.at(-2).scale.set(1.3, 0.8, 1);
  } else if (icon === 'lock') {
    g.add(rbox(0.16, 0.13, 0.05, M.candy(COL.orange, 0.3), [ix, -0.03, 0.1], 0.02), torus(0.05, 0.016, M.chrome(), [ix, 0.05, 0.1], null, Math.PI));
  }
  g.userData.w = w;
  return g;
}
function metric3D(label, value, accent = CSS.cyan, { w = 2.2, h = 0.62 } = {}) {
  const g = group(rbox(w, h, 0.12, M.ink(COL.navy), [0, 0, 0], 0.08));
  const acc = new THREE.Color(accent).getHex();
  g.add(sphere(0.05, M.glow(acc, 2), [-w / 2 + 0.2, 0, 0.07], 16));
  const tp = textPlane(w, h, (ctx, W, H) => {
    font(ctx, 500, H * 0.24, FB); ctx.fillStyle = CSS.boneDim; ctx.textBaseline = 'middle'; ctx.fillText(label, 0.34 * (W / w), H * 0.52);
    font(ctx, 600, H * 0.36, FM); ctx.fillStyle = accent; ctx.textAlign = 'right'; ctx.fillText(value, W - 0.16 * (W / w), H * 0.54);
  }, { px: 360 });
  tp.position.z = 0.064; g.add(tp);
  return g;
}
function chain(a, b, { n = 6, r = 0.16, t = 0.04, m = M.chrome() } = {}) {
  const A = v3(a), B = v3(b);
  const g = new THREE.Group();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), B.clone().sub(A).normalize());
  for (let i = 0; i < n; i++) {
    const l = new THREE.Mesh(new THREE.TorusGeometry(r, t, 12, 32), m);
    l.scale.set(1.5, 1, 1); l.position.lerpVectors(A, B, (i + 0.5) / n); l.quaternion.copy(q);
    if (i % 2) l.rotateX(Math.PI / 2);
    l.castShadow = true; g.add(l);
  }
  return g;
}
// plaque posée devant un objet : numéro, nom, précision
function plaque(n, name, sub, accent = CSS.cyan, w = 1.9) {
  const h = 0.56;
  const g = group(rbox(w, h, 0.08, M.plate(), [0, 0, 0], 0.07));
  g.add(place(textPlane(w, h, (ctx, W) => {
    const s = W / w;
    let x = 0.14 * s;
    if (n != null) { font(ctx, 700, 0.17 * s, FM); ctx.fillStyle = accent; ctx.fillText(String(n).padStart(2, '0'), x, 0.32 * s); x = 0.52 * s; }
    richLine(ctx, name, x, 0.27 * s, { color: CSS.bone, size: 0.15 * s, weight: 600, fam: FD, code: accent });
    if (sub) richLine(ctx, sub, x, 0.45 * s, { color: CSS.boneDim, size: 0.095 * s, code: accent });
  }, { px: 380 }), [0, 0, 0.042]));
  g.rotation.x = -0.32;
  g.scale.setScalar(1.18);
  return g;
}
function plinth(w, d, p, h = 0.22) {
  const b = rbox(w, h, d, M.ink(0x14243A), [p[0], h / 2, p[2]], 0.08); b.receiveShadow = true;
  scene.add(b);
  aoBlob(w * 1.5, d * 1.6, p, 0.5);
  return b;
}

// ---------- boucle, étapes, interpolations ----------
const ticks = [];
function onTick(fn) { ticks.push(fn); return fn; }
function flow(curve, { n = 14, color = COL.cyan, speed = 0.12, size = 0.05, k = 2.6, offset = 0 } = {}) {
  const geo = new THREE.CapsuleGeometry(size, size * 2.6, 4, 10);
  const im = new THREE.InstancedMesh(geo, M.glow(color, k), n);
  im.frustumCulled = false;
  const d = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), tan = new THREE.Vector3();
  onTick((t) => {
    if (!im.visible) return;
    for (let i = 0; i < n; i++) {
      const u = (((i / n) + t * speed + offset) % 1 + 1) % 1;
      curve.getPointAt(u, d.position);
      curve.getTangentAt(u, tan);
      d.quaternion.setFromUnitVectors(up, tan);
      d.scale.setScalar(0.3 + 0.7 * Math.sin(u * Math.PI));
      d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  });
  return im;
}
const tweens = [];
function tween(dur, fn, { ease = easeInOutCubic, delay = 0, done } = {}) {
  if (REDUCED) { fn(1); done && done(); return null; }
  const tw = { t: -delay, dur, fn, ease, done };
  tweens.push(tw); return tw;
}
function moveTo(obj, target, dur = 0.9, opts = {}) { const from = obj.position.clone(), to = v3(target); return tween(dur, (k) => obj.position.lerpVectors(from, to, k), opts); }

const reveals = [];
function at(step, obj, { drop = 0.6, mode = 'pop', delay = 0, dur = 0.8 } = {}) {
  const r = { obj, step, p: 0, target: 0, s: obj.scale.clone(), y: obj.position.y, drop, mode, delay, wait: 0, dur };
  reveals.push(r); applyReveal(r); return obj;
}
function applyReveal(r) {
  const p = r.p, o = r.obj;
  if (r.mode === 'grow') o.scale.set(r.s.x, Math.max(1e-4, r.s.y * easeOutCubic(p)), r.s.z);
  else {
    const e = p <= 0 ? 0 : easeOutBack(p);
    o.scale.copy(r.s).multiplyScalar(Math.max(1e-4, e));
    o.position.y = r.y + (1 - easeOutCubic(p)) * r.drop;
  }
  o.visible = p > 0.002;
}

const STEPS = META.steps;
const N = STEPS.length;
let cur = -1;
const stepHooks = [];
function onStep(fn) { stepHooks.push(fn); }
const shots = {};
function shot(i, pos, target) { shots[i] = { pos: v3(pos), target: v3(target) }; }
const home = { pos: new THREE.Vector3(0, 6, 22), target: new THREE.Vector3(0, 2, 0) };
let swayOn = !REDUCED, swayT = 0, flying = false;
function flyTo(s, dur = 1.8) {
  const fromP = camera.position.clone(), fromT = controls.target.clone();
  home.pos.copy(s.pos); home.target.copy(s.target);
  flying = true;
  const done = () => { flying = false; swayT = 0; swayOn = !REDUCED; };
  if (!tween(dur, (k) => { camera.position.lerpVectors(fromP, s.pos, k); controls.target.lerpVectors(fromT, s.target, k); }, { done })) done();
}
function go(i) {
  i = clamp(i, 0, N - 1);
  const prev = cur; cur = i;
  reveals.forEach((r) => { const t = cur >= r.step ? 1 : 0; if (t !== r.target) { r.target = t; r.wait = t ? r.delay : 0; } });
  stepHooks.forEach((f) => f(cur, prev));
  let s = null; for (let k = cur; k >= 0 && !s; k--) s = shots[k];
  if (s && prev !== -1 && !s.pos.equals(home.pos)) flyTo(s);
  updateCaption();
  const cnt = document.getElementById('count'); if (cnt) cnt.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
}
function setView(pos, target, fov) {
  home.pos.copy(v3(pos)); home.target.copy(v3(target));
  if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  camera.position.copy(home.pos); controls.target.copy(home.target); controls.update();
  if (!shots[0]) shot(0, pos, target);
}
controls.addEventListener('start', () => { swayOn = false; });

// ---------- HUD en volume, accroché à la caméra ----------
const hud = new THREE.Group();
camera.add(hud);
const HUD_D = 4;
let capTex = null, capFace = null, capW = 0, capH = 0;
function hudDims() { const halfH = HUD_D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); return { halfH, halfW: halfH * (16 / 9) }; }
function buildHUD() {
  hud.clear();
  const { halfH, halfW } = hudDims();
  const U = (halfH * 2) / 900; // une unité « pixel » d'un cadre 1600×900
  const m = 30 * U;
  // en-tête : surtitre, titre en 3D, sous-titre
  const hw = 590 * U, pad = 26 * U, px = 1 / U * 1.6;
  const ts = (META.titleSize || 46) * U;
  const tLines = META.title;
  const ks = 12.5 * U, ss = 15.5 * U;
  font(_mctx, 400, ss * px, FB);
  const sl = wrap(_mctx, META.sub, (hw - pad * 2) * px);
  const th = tLines.length * ts * 1.12;
  const hh = pad + ks * 2.2 + th + 14 * U + sl.length * ss * 1.5 + pad * 0.8;
  const head = new THREE.Group();
  const slab = rbox(hw, hh, 22 * U, M.hudSlab(), null, 22 * U); slab.castShadow = false; head.add(slab);
  const face = textPlane(hw, hh, (ctx, W, H) => {
    const s = px; let y = pad * s;
    font(ctx, 600, ks * s, FM); ctx.textBaseline = 'top'; ctx.fillStyle = CSS.cyan;
    const kick = `BARE BONES  ·  PLANCHE ${String(META.n).padStart(2, '0')} / 10`;
    ctx.fillText(kick.split('').join(String.fromCharCode(8202)), pad * s, y);
    y += (ks * 2.2 + th + 14 * U) * s;
    ctx.textBaseline = 'alphabetic';
    sl.forEach((l) => { y += ss * s * 1.1; richLine(ctx, l, pad * s, y, { color: CSS.boneDim, size: ss * s }); y += ss * s * 0.4; });
    const hl = ctx.createLinearGradient(0, 0, W, 0); hl.addColorStop(0, CSS.cyan); hl.addColorStop(0.5, CSS.cyan + '00');
    ctx.fillStyle = hl; ctx.fillRect(pad * s, 3, W * 0.5, 2.5);
  }, { px, fog: false });
  face.position.z = 11.5 * U; head.add(face);
  tLines.forEach((l, i) => {
    const line = text3DLine(l, { size: ts * 0.86, depth: 9 * U, face: M.hudFace(), side: M.hudFace(0x8E8779), accent: M.hudAccent(), accentSide: M.hudAccent(0xA8501C, 0.1) });
    line.position.set(-hw / 2 + pad, hh / 2 - pad - ks * 2.2 - ts * (i + 1) * 1.12 + ts * 0.22, 11 * U);
    head.add(line);
  });
  head.position.set(-halfW + m + hw / 2, halfH - m - hh / 2, -HUD_D);
  head.rotation.set(-0.02, 0.08, 0);
  hud.add(head);
  // badge
  const bw = 300 * U, bh = 40 * U;
  const badge = group(pill(bw, bh, 14 * U, M.hudSlab(), [0, 0, 0]));
  const bface = textPlane(bw, bh, (ctx, W, H) => {
    font(ctx, 600, H * 0.3, FM); ctx.fillStyle = CSS.orange; ctx.textBaseline = 'middle';
    ctx.fillText('KIROWEEN 2026 · SKELETON CREW'.split('').join(String.fromCharCode(8202)), H * 1.45, H * 0.54);
  }, { px, fog: false });
  bface.position.z = 7.5 * U; badge.add(bface);
  const boneM = M.hudFace();
  const bx = -bw / 2 + bh * 0.72, br = 4.2 * U;
  badge.add(capsule([bx - 11 * U, 0, 9 * U], [bx + 11 * U, 0, 9 * U], 2.6 * U, boneM));
  [[-1, 1], [-1, -1], [1, 1], [1, -1]].forEach(([sx, sy]) => badge.add(sphere(br, boneM, [bx + sx * 12.5 * U, sy * 3.6 * U, 9 * U], 16)));
  badge.position.set(halfW - m - bw / 2, halfH - m - bh / 2, -HUD_D);
  badge.rotation.set(-0.02, -0.08, 0);
  hud.add(badge);
  // légende de l'étape (bas gauche)
  capW = 560 * U; capH = 150 * U;
  const cap = new THREE.Group();
  const cslab = rbox(capW, capH, 20 * U, M.hudSlab(), null, 20 * U); cslab.castShadow = false; cap.add(cslab);
  capFace = textPlane(capW, capH, () => {}, { px, fog: false });
  capFace.position.z = 10.5 * U; cap.add(capFace);
  capTex = capFace.userData.tex;
  cap.userData.U = U; cap.userData.px = px;
  cap.position.set(-halfW + m + capW / 2, -halfH + m + capH / 2, -HUD_D);
  cap.rotation.set(0.02, 0.07, 0);
  hud.add(cap);
  hud.userData.cap = cap;
  noShadow(hud);
  hud.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  updateCaption();
}
function updateCaption() {
  if (!capTex || cur < 0) return;
  const st = STEPS[cur];
  const cap = hud.userData.cap; const U = cap.userData.U, px = cap.userData.px;
  redraw(capTex, (ctx, W, H) => {
    const s = px, pad = 22 * U * s;
    // segments de progression
    const segW = (W - pad * 2 - (N - 1) * 6) / N;
    for (let i = 0; i < N; i++) { rr(ctx, pad + i * (segW + 6), pad * 0.75, segW, 4, 2); ctx.fillStyle = i < cur ? 'rgba(76,201,240,0.55)' : i === cur ? CSS.orange : 'rgba(237,231,218,0.14)'; ctx.fill(); }
    font(ctx, 600, 12 * U * s, FM); ctx.fillStyle = CSS.orange; ctx.textBaseline = 'top';
    ctx.fillText(`ÉTAPE ${String(cur + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`.split('').join(String.fromCharCode(8202)), pad, pad * 0.75 + 16 * U * s);
    ctx.textBaseline = 'alphabetic';
    let y = pad * 0.75 + 16 * U * s + 14 * U * s + 26 * U * s;
    richLine(ctx, st.t, pad, y, { color: CSS.bone, size: 25 * U * s, weight: 600, fam: FD });
    font(ctx, 400, 15 * U * s, FB);
    const lines = wrap(ctx, st.d, W - pad * 2);
    y += 10 * U * s;
    lines.slice(0, 3).forEach((l) => { y += 21 * U * s; richLine(ctx, l, pad, y, { color: CSS.boneDim, size: 15 * U * s }); });
  });
  if (!REDUCED) { const c = hud.userData.cap; tween(0.5, (k) => { c.rotation.x = 0.02 + (1 - k) * 0.5; capFace.material.opacity = k; }, { ease: easeOutCubic }); }
}

// ---------- contrôles ----------
let playing = false, playTimer = 0;
const playBtn = document.getElementById('play');
const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';
function setPlaying(v) { playing = v; playTimer = 0; if (playBtn) { playBtn.innerHTML = v ? ICON_PAUSE : ICON_PLAY; playBtn.setAttribute('aria-label', v ? 'Mettre en pause' : 'Lecture'); } }
document.getElementById('prev')?.addEventListener('click', () => { setPlaying(false); go(cur - 1); });
document.getElementById('next')?.addEventListener('click', () => { setPlaying(false); go(cur + 1); });
playBtn?.addEventListener('click', () => { if (playing) setPlaying(false); else { if (cur >= N - 1) go(0); setPlaying(true); } });
document.getElementById('reset')?.addEventListener('click', () => { let s = null; for (let k = cur; k >= 0 && !s; k--) s = shots[k]; flyTo(s || home, 1.1); });
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { setPlaying(false); go(cur + 1); }
  if (e.key === 'ArrowLeft') { setPlaying(false); go(cur - 1); }
});

function resize() {
  const w = glEl.clientWidth, h = glEl.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  hud.visible = w >= 620;
}
new ResizeObserver(resize).observe(glEl);

const clock = new THREE.Clock();
let started = false;
const _q = new THREE.Quaternion(), _wp = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i]; tw.t += dt;
    if (tw.t < 0) continue;
    const k = clamp(tw.t / tw.dur, 0, 1);
    tw.fn(tw.ease(k));
    if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
  }
  for (const r of reveals) {
    if (r.p === r.target) continue;
    if (r.wait > 0) { r.wait -= dt; continue; }
    r.p = REDUCED ? r.target : clamp(r.p + Math.sign(r.target - r.p) * (dt / r.dur), 0, 1);
    applyReveal(r);
  }
  for (const f of ticks) f(REDUCED ? 2.0 : t, dt);
  if (swayOn && !flying) {
    swayT += dt;
    const off = home.pos.clone().sub(home.target);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(swayT * 0.14) * 0.07);
    camera.position.copy(home.target).add(off);
    camera.position.y += Math.sin(swayT * 0.1) * 0.2;
    controls.target.copy(home.target);
  }
  if (playing) { playTimer += dt; if (playTimer > (META.stepTime || 4.6)) { playTimer = 0; if (cur < N - 1) go(cur + 1); if (cur >= N - 1) setPlaying(false); } }
  controls.update();
  camera.updateMatrixWorld();
  for (const b of billboards) {
    if (!b.parent) continue;
    b.parent.getWorldQuaternion(_q).invert();
    b.quaternion.copy(_q.multiply(camera.quaternion));
    if (b.userData.billboard.ref) { b.getWorldPosition(_wp); b.scale.setScalar(_wp.distanceTo(camera.position) / b.userData.billboard.ref); }
    const lead = b.userData.lead;
    if (lead) {
      // le fil s'arrête au bord de la carte, jamais devant le texte
      const sz = b.userData.size, sc = b.scale.x;
      const d = new THREE.Vector3().copy(b.position).negate().applyQuaternion(b.quaternion.clone().invert());
      const k = Math.min((sz.w / 2) * sc / Math.max(1e-4, Math.abs(d.x)), (sz.h / 2) * sc / Math.max(1e-4, Math.abs(d.y)), 1);
      const edge = new THREE.Vector3(d.x * k, d.y * k, 0).applyQuaternion(b.quaternion).add(b.position);
      const len = edge.length();
      lead.visible = len > 0.05 && b.visible;
      lead.scale.set(1, Math.max(0.001, len), 1);
      lead.position.copy(edge).multiplyScalar(0.5);
      if (len > 1e-4) lead.quaternion.setFromUnitVectors(_up, edge.clone().normalize());
    }
  }
  composer.render();
  if (!started) { started = true; window.__bb3d = true; document.getElementById('fallback')?.setAttribute('hidden', ''); }
  requestAnimationFrame(frame);
}
function start() {
  resize();
  buildHUD();
  reveals.forEach(applyReveal);
  const qs = new URLSearchParams(location.search);
  if (qs.has('all') || qs.has('step')) {
    swayOn = false;
    const k = qs.has('step') ? +qs.get('step') - 1 : N - 1;
    go(k);
    let s = null; for (let j = k; j >= 0 && !s; j--) s = shots[j];
    if (s) { home.pos.copy(s.pos); home.target.copy(s.target); camera.position.copy(s.pos); controls.target.copy(s.target); }
    reveals.forEach((r) => { r.p = r.target; r.wait = 0; applyReveal(r); });
  } else if (REDUCED) { go(N - 1); setPlaying(false); }
  else { go(0); setPlaying(true); }
  requestAnimationFrame(frame);
}
// ===================== fin du socle — scène de la planche =====================
