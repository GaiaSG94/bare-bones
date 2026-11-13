// ===================== Bare Bones — moteur des planches (site + scène 3D) =====================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/addons/renderers/CSS3DRenderer.js';

const META = window.META;
if (window.__bbNoGL) throw new Error('WebGL indisponible');
const REDUCED = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const site = document.getElementById('site');
const stageEl = document.getElementById('stage');
const cssEl = document.getElementById('css3d');

const COL = { bone: 0xEDE7DA, boneDeep: 0xCFC6B4, night: 0x0E1A2B, navy: 0x16273E, navy2: 0x1E3352, cyan: 0x4CC9F0, orange: 0xFF8A3D, green: 0x5BE3A4, gold: 0xF2C14E, violet: 0x9B8CFF, red: 0xFF6B6B };
const FD = '"Space Grotesk", Inter, sans-serif', FB = 'Inter, sans-serif', FM = '"JetBrains Mono", monospace';

try { await Promise.race([Promise.all([`600 30px ${FD}`, `400 30px ${FB}`, `500 30px ${FM}`].map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2000))]); } catch (e) { /* repli */ }

// ---------- rendu ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
stageEl.prepend(renderer.domElement);
renderer.domElement.setAttribute('role', 'img');
renderer.domElement.setAttribute('aria-label', META.alt || 'Scène 3D interactive');
const cssR = new CSS3DRenderer();
cssEl.appendChild(cssR.domElement);

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.enableZoom = false; controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.18; controls.maxPolarAngle = Math.PI * 0.52;

// ---------- fonds (shaders) ----------
const BG = { nuit: 0, porcelaine: 1, plan: 2, aurore: 3, graphite: 4 };
const bgMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1600, 900) }, uMode: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
  fragmentShader: `
    precision highp float;
    uniform float uTime; uniform vec2 uRes; uniform float uMode; varying vec2 vUv;
    float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
    vec3 blob(vec2 p, vec2 c, float r, vec3 col){ float d = length(p - c); return col * exp(-d * d / (r * r)); }
    void main(){
      vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 p = vec2((uv.x - .5) * asp, uv.y - .5);
      float t = uTime; vec2 fc = gl_FragCoord.xy; float px = uRes.y / 900.;
      vec3 col; bool light = uMode > .5 && uMode < 1.5;
      if (uMode < .5) {
        col = mix(vec3(.031, .063, .114), vec3(.075, .14, .235), clamp(uv.y * .75 + uv.x * .35, 0., 1.));
        vec2 w = vec2(fbm(p * 1.3 + t * .03), fbm(p * 1.3 - t * .025 + 4.));
        col += blob(p + (w - .5) * .4, vec2(.5, .16), .55, vec3(.09, .36, .5)) * .6;
        col += blob(p + (w - .5) * .4, vec2(-.62, -.36), .45, vec3(.5, .22, .07)) * .32;
        col += blob(p, vec2(.05, .5), .7, vec3(.1, .18, .32)) * .45;
      } else if (uMode < 1.5) {
        col = mix(vec3(.905, .89, .858), vec3(.972, .963, .945), uv.y * .8 + .1);
        vec2 w = vec2(fbm(p * 1.2 + t * .02), fbm(p * 1.2 - t * .02 + 3.));
        col -= blob(p + (w - .5) * .35, vec2(.55, .18), .55, vec3(.16, .055, 0.)) * .55;
        col -= blob(p + (w - .5) * .35, vec2(-.6, -.32), .5, vec3(0., .07, .15)) * .55;
      } else if (uMode < 2.5) {
        col = mix(vec3(.035, .07, .125), vec3(.06, .115, .19), uv.y);
        float s1 = 22. * px, s2 = 110. * px;
        vec2 m1 = mod(fc, s1), m2 = mod(fc, s2);
        float g1 = (m1.x < 1. || m1.y < 1.) ? 1. : 0.;
        float g2 = (m2.x < 1.3 || m2.y < 1.3) ? 1. : 0.;
        float cr = ((m2.x < 1.3 && (m2.y < 8. || m2.y > s2 - 8.)) || (m2.y < 1.3 && (m2.x < 8. || m2.x > s2 - 8.))) ? 1. : 0.;
        float fade = smoothstep(1.1, .1, length(p * vec2(.75, 1.1) - vec2(.12, 0.)));
        col += vec3(.3, .79, .94) * (g1 * .03 + g2 * .07 + cr * .22) * fade;
        col += blob(p, vec2(.38, .08), .65, vec3(.06, .16, .24)) * .7;
      } else if (uMode < 3.5) {
        col = vec3(.018, .03, .06) + vec3(.02, .03, .055) * uv.y;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          float y = .08 + fi * .11 + (fbm(vec2(p.x * 1.05 + t * .035 + fi * 3., fi * 1.7)) - .5) * .55;
          float band = exp(-pow((p.y - y) * (4.5 + fi * 2.), 2.)) * (.55 + .45 * fbm(vec2(p.x * 3. + t * .07, fi)));
          vec3 c = mix(vec3(.12, .72, .82), vec3(.48, .34, .95), smoothstep(-.9, .7, p.x + fi * .3));
          c = mix(c, vec3(1., .55, .25), smoothstep(.35, 1.1, p.x - fi * .25) * .55);
          col += c * band * .26;
        }
      } else {
        col = mix(vec3(.036, .038, .046), vec3(.07, .072, .085), uv.y);
        float hue = fbm(p * 1.1 + t * .02);
        vec3 ir = .5 + .5 * cos(6.2831 * (hue + vec3(0., .33, .67)));
        col += ir * .06 * smoothstep(.95, 0., length(p - vec2(.38, .08)));
        vec2 cell = mod(fc, 9. * px) - 4.5 * px; float r = 1.25 * px * smoothstep(1.1, .15, length(p - vec2(.42, .05)));
        col += vec3(.85) * .05 * step(length(cell), r);
      }
      float v = smoothstep(1.3, .25, length(p * vec2(.82, 1.)));
      col *= mix(light ? .93 : .7, 1., v);
      col += (h(fc + fract(t * 7.) * 100.) - .5) * (light ? .028 : .038);
      gl_FragColor = vec4(col, 1.);
    }`,
  depthWrite: false, depthTest: false,
});
const bgGeo = new THREE.BufferGeometry();
bgGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
const bgMesh = new THREE.Mesh(bgGeo, bgMat); bgMesh.frustumCulled = false; bgMesh.renderOrder = -1000; scene.add(bgMesh);

// ---------- lumière ----------
const hemi = new THREE.HemisphereLight(0xdce9ff, 0x101a2a, 0.75); scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff3e6, 2.6);
key.position.set(6, 14, 9); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 });
key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -0.0005;
scene.add(key);
const fill = new THREE.DirectionalLight(0x8fdcff, 0.7); fill.position.set(-10, 5, 6); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffc29a, 0.9); rim.position.set(6, 6, -10); scene.add(rim);
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.34 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), shadowMat);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

function setBackground(name) {
  if (!(name in BG)) name = 'nuit';
  site.dataset.bg = name;
  bgMat.uniforms.uMode.value = BG[name];
  const light = name === 'porcelaine';
  shadowMat.opacity = light ? 0.16 : 0.34;
  hemi.intensity = light ? 1.0 : 0.75;
  renderer.toneMappingExposure = light ? 1.12 : 1.05;
  document.querySelectorAll('.bgpick button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.bg === name)));
  try { localStorage.setItem('bb-bg', name); } catch (e) { /* stockage indisponible */ }
}
document.querySelectorAll('.bgpick button').forEach((b) => b.addEventListener('click', () => setBackground(b.dataset.bg)));
let initialBg = new URLSearchParams(location.search).get('bg');
if (!initialBg) { try { initialBg = localStorage.getItem('bb-bg'); } catch (e) { /* rien */ } }
setBackground(initialBg || 'nuit');

// ---------- utilitaires ----------
const v3 = (a) => (a && a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => { const c1 = 1.3, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function place(o, p, r) { if (p) o.position.set(p[0], p[1], p[2]); if (r) o.rotation.set(r[0], r[1], r[2]); return o; }
function group(...k) { const g = new THREE.Group(); k.flat().forEach((c) => c && g.add(c)); return g; }

const _m = new Map(); const memo = (k, f) => { if (!_m.has(k)) _m.set(k, f()); return _m.get(k); };
const M = {
  ceramic: (c = COL.bone) => memo('cer' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.25, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 0.7 })),
  satin: (c) => memo('sat' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.18, envMapIntensity: 0.8 })),
  frost: (c = 0xe6f6ff) => memo('fro' + c, () => new THREE.MeshPhysicalMaterial({ color: c, transmission: 1, thickness: 0.8, roughness: 0.18, ior: 1.45, clearcoat: 0.6, attenuationColor: new THREE.Color(c), attenuationDistance: 4, envMapIntensity: 1.1 })),
  irid: (c = 0xffffff) => memo('iri' + c, () => new THREE.MeshPhysicalMaterial({ color: c, transmission: 0.9, thickness: 0.6, roughness: 0.12, ior: 1.5, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 620], clearcoat: 1, envMapIntensity: 1.3 })),
  ink: (c = COL.navy) => memo('ink' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, metalness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.6 })),
  chrome: () => memo('chr', () => new THREE.MeshStandardMaterial({ color: 0xe6edf4, metalness: 1, roughness: 0.14 })),
  glow: (c = COL.cyan, k = 1.6) => memo('glo' + c + k, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false })),
  soft: (c = COL.cyan, op = 0.4) => memo('sof' + c + op, () => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, toneMapped: false })),
};
const _g = new Map();
function rboxGeo(w, h, d, r = 0.06) { const rad = Math.max(0, Math.min(r, Math.min(w, h, d) / 2 - 0.0005)); const k = [w, h, d, rad].map((x) => x.toFixed(4)).join('|'); if (!_g.has(k)) _g.set(k, rad > 0.003 ? new RoundedBoxGeometry(w, h, d, 5, rad) : new THREE.BoxGeometry(w, h, d)); return _g.get(k); }
function rbox(w, h, d, m, p, r = 0.06) { const me = new THREE.Mesh(rboxGeo(w, h, d, r), m); me.castShadow = true; return place(me, p); }
function cyl(rt, rb, h, m, p, seg = 64) { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.castShadow = true; return place(me, p); }
function sphere(r, m, p, seg = 40) { const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), m); me.castShadow = true; return place(me, p); }
function torus(r, t, m, p, rot, arc = Math.PI * 2) { const me = new THREE.Mesh(new THREE.TorusGeometry(r, t, 20, 96, arc), m); me.castShadow = true; return place(me, p, rot); }
function orient(me, A, B) { me.position.copy(A).add(B).multiplyScalar(0.5); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return me; }
function capsule(a, b, r, m) { const A = v3(a), B = v3(b); const me = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, A.distanceTo(B) - 2 * r), 8, 24), m); me.castShadow = true; return orient(me, A, B); }
function rod(a, b, r, m) { const A = v3(a), B = v3(b); return orient(new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 12), m), A, B); }
function curveOf(pts, closed = false, tension = 0.5) { return new THREE.CatmullRomCurve3(pts.map(v3), closed, 'catmullrom', tension); }
function tube(c, r, m, segs = 160) { const curve = Array.isArray(c) ? curveOf(c) : c; return new THREE.Mesh(new THREE.TubeGeometry(curve, segs, r, 12, false), m); }
// disque arrondi (vertèbre, socle) par révolution d'un profil
function roundDisc(r, h, bevel = 0.08, m) {
  const pts = []; const b = Math.min(bevel, h / 2 - 0.001);
  pts.push(new THREE.Vector2(0, -h / 2));
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, -h / 2 + b + Math.sin(a) * b)); }
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, h / 2 - b + Math.sin(a) * b)); }
  pts.push(new THREE.Vector2(0, h / 2));
  const me = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), m); me.castShadow = true; return me;
}
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------- HTML posé dans l'espace 3D (texte net) ----------
function css3d(html, { pos = [0, 0, 0], rot, scale = 0.01, sprite = false, cls = '', w, h } = {}) {
  const el = document.createElement('div');
  el.className = cls; el.innerHTML = html;
  if (w) el.style.width = w + 'px';
  if (h) el.style.height = h + 'px';
  const o = sprite ? new CSS3DSprite(el) : new CSS3DObject(el);
  o.scale.setScalar(scale);
  place(o, pos, rot);
  scene.add(o);
  return o;
}
// étiquette : point d'ancrage lumineux + fil + carte HTML face caméra
function tag(anchor, off, { k, b, s, c = 'var(--cyan)', hex = COL.cyan } = {}) {
  const A = v3(anchor), P = A.clone().add(v3(off));
  const g = new THREE.Group();
  const dot = sphere(0.045, M.glow(hex, 1.8), [A.x, A.y, A.z], 16); dot.castShadow = false;
  const line = rod(A, P, 0.006, M.soft(hex, 0.6));
  g.add(dot, line); scene.add(g);
  const card = css3d(`${k ? `<span class="k">${k}</span>` : ''}${b ? `<b>${b}</b>` : ''}${s ? `<span>${s}</span>` : ''}`, { pos: [P.x, P.y, P.z], sprite: true, cls: 'lbl3d', scale: 0.0105 });
  card.element.style.setProperty('--c', c);
  const root = group(); root.add(g); scene.add(root);
  return { line: g, card, all: [g, card] };
}

// ---------- matériaux d'objets récurrents ----------
function fileSheet({ name = 'releve.csv', lines = [], w = 1.6, h = 2.05, bad = [] } = {}) {
  const g = new THREE.Group();
  const c = 0.34;
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, -h / 2); sh.lineTo(w / 2, -h / 2); sh.lineTo(w / 2, h / 2 - c); sh.lineTo(w / 2 - c, h / 2); sh.lineTo(-w / 2, h / 2); sh.closePath();
  const paper = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3 }), memo('paper', () => new THREE.MeshPhysicalMaterial({ color: 0xF6F2EA, roughness: 0.72, sheen: 0.4, envMapIntensity: 0.5 })));
  paper.castShadow = true; paper.position.z = -0.015; g.add(paper);
  const fold = new THREE.Shape(); fold.moveTo(w / 2 - c, h / 2); fold.lineTo(w / 2 - c, h / 2 - c); fold.lineTo(w / 2, h / 2 - c); fold.closePath();
  const f = new THREE.Mesh(new THREE.ExtrudeGeometry(fold, { depth: 0.012, bevelEnabled: false }), M.satin(0xD8D1C4)); f.position.z = 0.03; g.add(f);
  const px = 300;
  const tex = canvasTex(w * px, h * px, (ctx, W) => {
    const s = px;
    rr(ctx, 0.13 * s, 0.15 * s, 0.42 * s, 0.19 * s, 0.095 * s); ctx.fillStyle = '#FF8A3D'; ctx.fill();
    ctx.font = `700 ${0.1 * s}px ${FM}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('CSV', 0.34 * s, 0.28 * s); ctx.textAlign = 'left';
    ctx.font = `600 ${0.12 * s}px ${FD}`; ctx.fillStyle = '#0E1A2B'; ctx.fillText(name, 0.13 * s, 0.56 * s);
    ctx.fillStyle = 'rgba(14,26,43,0.1)'; ctx.fillRect(0.13 * s, 0.66 * s, W - 0.26 * s, 2);
    ctx.font = `500 ${0.074 * s}px ${FM}`;
    lines.forEach((l, i) => { ctx.fillStyle = bad.includes(i) ? '#E2621A' : 'rgba(14,26,43,0.62)'; ctx.fillText(l, 0.13 * s, (0.85 + i * 0.15) * s); });
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
  face.position.z = 0.032; face.renderOrder = 2; g.add(face);
  return g;
}

// ---------- boucle : révélations, interpolations, scénario ----------
const ticks = []; function onTick(f) { ticks.push(f); return f; }
const tweens = [];
function tween(dur, fn, { ease = easeInOutCubic, delay = 0, done } = {}) { if (REDUCED) { fn(1); done && done(); return null; } const tw = { t: -delay, dur, fn, ease, done }; tweens.push(tw); return tw; }
function flow(curve, { n = 14, color = COL.cyan, speed = 0.12, size = 0.04, k = 1.8, offset = 0 } = {}) {
  const im = new THREE.InstancedMesh(new THREE.CapsuleGeometry(size, size * 2.4, 4, 10), M.glow(color, k), n);
  im.frustumCulled = false;
  const d = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), tan = new THREE.Vector3();
  onTick((t) => { if (!im.visible) return; for (let i = 0; i < n; i++) { const u = (((i / n) + t * speed + offset) % 1 + 1) % 1; curve.getPointAt(u, d.position); curve.getTangentAt(u, tan); d.quaternion.setFromUnitVectors(up, tan); d.scale.setScalar(0.3 + 0.7 * Math.sin(u * Math.PI)); d.updateMatrix(); im.setMatrixAt(i, d.matrix); } im.instanceMatrix.needsUpdate = true; });
  return im;
}

const reveals = [];
function at(step, objs, { drop = 0.5, mode = 'pop', delay = 0, dur = 0.85 } = {}) {
  [objs].flat().forEach((obj) => {
    const r = { obj, step, p: 1, target: 1, s: obj.scale.clone(), y: obj.position.y, drop, mode, delay, wait: 0, dur };
    reveals.push(r);
  });
  return objs;
}
function applyReveal(r) {
  const p = r.p, o = r.obj;
  if (r.mode === 'grow') o.scale.set(r.s.x, Math.max(1e-4, r.s.y * easeOutCubic(p)), r.s.z);
  else if (r.mode === 'fade') o.scale.copy(r.s);
  else { const e = p <= 0 ? 0 : easeOutBack(p); o.scale.copy(r.s).multiplyScalar(Math.max(1e-4, e)); o.position.y = r.y + (1 - easeOutCubic(p)) * r.drop; }
  o.visible = p > 0.003;
  if (o.isCSS3DObject) o.element.style.opacity = String(clamp((p - 0.2) / 0.8, 0, 1));
}

// caméra : vue d'ensemble + plans par étape
const shots = {};
function shot(i, pos, target) { shots[i] = { pos: v3(pos), target: v3(target) }; }
const overview = { pos: new THREE.Vector3(0, 5, 20), target: new THREE.Vector3(0, 2, 0) };
function setView(pos, target, fov) { overview.pos.copy(v3(pos)); overview.target.copy(v3(target)); if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); } camera.position.copy(overview.pos); controls.target.copy(overview.target); }
const home = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
let flying = false, userMoved = false;
function flyTo(s, dur = 1.9) {
  home.pos.copy(s.pos); home.target.copy(s.target); userMoved = false;
  const fp = camera.position.clone(), ft = controls.target.clone();
  flying = true;
  const done = () => { flying = false; };
  if (!tween(dur, (k) => { camera.position.lerpVectors(fp, s.pos, k); controls.target.lerpVectors(ft, s.target, k); }, { done })) { camera.position.copy(s.pos); controls.target.copy(s.target); done(); }
}
controls.addEventListener('start', () => { userMoved = true; });

const STEPS = META.steps, N = STEPS.length;
const ACTORS = META.actors;
let cur = N - 1, playing = false, paused = false, stepClock = 0;
const STEP_T = META.stepTime || 6.5;
const stepHooks = []; function onStep(f) { stepHooks.push(f); }

function setStep(i, instant = false) {
  cur = clamp(i, 0, N - 1);
  reveals.forEach((r) => { const t = cur >= r.step ? 1 : 0; if (t !== r.target) { r.target = t; r.wait = t ? r.delay : 0; } if (instant) { r.p = r.target; r.wait = 0; applyReveal(r); } });
  stepHooks.forEach((f) => f(cur, playing));
}
function shotFor(i) { let s = null; for (let k = i; k >= 0 && !s; k--) s = shots[k]; return s || overview; }

// panneau de scénario
const sc = document.getElementById('scenario');
const scBar = sc.querySelector('.sc-bar');
scBar.innerHTML = STEPS.map(() => '<i></i>').join('');
const bars = [...scBar.children];
function renderPanel() {
  const st = STEPS[cur];
  const a = ACTORS[st.who] || ACTORS.bb;
  sc.querySelector('.sc-who').innerHTML = `<span class="av" style="--c:${a.c}">${a.icon}</span><span class="tx"><b>${a.name}</b><small>${a.role}</small></span>`;
  sc.querySelector('.sc-step').innerHTML = `Étape ${cur + 1} sur ${N}`;
  sc.querySelector('.sc-title').innerHTML = st.t;
  sc.querySelector('.sc-text').innerHTML = st.d;
  const res = sc.querySelector('.sc-result');
  res.hidden = !st.r; if (st.r) res.querySelector('p').innerHTML = st.r;
  const body = sc.querySelector('.sc-body'); body.classList.remove('sc-anim'); void body.offsetWidth; body.classList.add('sc-anim');
  bars.forEach((b, j) => { b.classList.toggle('done', j < cur); b.classList.toggle('cur', j === cur); b.style.setProperty('--p', j === cur ? '0' : '1'); });
  document.querySelectorAll('.actor').forEach((el) => el.classList.toggle('on', el.dataset.actor === st.who || (st.also || []).includes(el.dataset.actor)));
  const pb = document.getElementById('sc-pause'); if (pb) pb.innerHTML = paused ? ICON.play : ICON.pause;
  document.getElementById('sc-next').innerHTML = cur >= N - 1 ? ICON.replay : ICON.next;
}
const ICON = {
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4.5 2.8v10.4L13 8z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="m6 3 5 5-5 5"/></svg>',
  replay: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M3.2 6.2A5 5 0 1 1 3 9.5M3 2.8v3.6h3.6"/></svg>',
};
function goStep(i) { setStep(i); stepClock = 0; renderPanel(); flyTo(shotFor(cur)); }
function startScenario() {
  playing = true; paused = REDUCED; site.classList.add('playing'); sc.hidden = false;
  reveals.forEach((r) => { r.target = 0; r.p = 0; r.wait = 0; applyReveal(r); });
  goStep(0);
  document.getElementById('sc-next').focus({ preventScroll: true });
}
function stopScenario() {
  playing = false; site.classList.remove('playing'); sc.hidden = true;
  document.querySelectorAll('.actor').forEach((el) => el.classList.remove('on'));
  setStep(N - 1); flyTo(overview);
  document.getElementById('play').focus({ preventScroll: true });
}
document.getElementById('play').addEventListener('click', startScenario);
document.getElementById('sc-close').addEventListener('click', stopScenario);
document.getElementById('sc-prev').addEventListener('click', () => goStep(cur - 1));
document.getElementById('sc-next').addEventListener('click', () => { if (cur >= N - 1) startScenario(); else goStep(cur + 1); });
document.getElementById('sc-pause').addEventListener('click', () => { paused = !paused; renderPanel(); });
window.addEventListener('keydown', (e) => {
  if (!playing) { if (e.key === 'Enter' && document.activeElement === document.body) startScenario(); return; }
  if (e.key === 'ArrowRight') goStep(cur + 1);
  if (e.key === 'ArrowLeft') goStep(cur - 1);
  if (e.key === 'Escape') stopScenario();
  if (e.key === ' ') { e.preventDefault(); paused = !paused; renderPanel(); }
});

// parallaxe : la caméra et les calques d'interface suivent le pointeur
let px = 0, py = 0, spx = 0, spy = 0;
site.addEventListener('pointermove', (e) => { const r = site.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width) * 2 - 1; py = ((e.clientY - r.top) / r.height) * 2 - 1; });
site.addEventListener('pointerleave', () => { px = 0; py = 0; });
const layers = [...document.querySelectorAll('.layer')];

function resize() {
  const w = stageEl.clientWidth, h = stageEl.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); cssR.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  bgMat.uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
}
new ResizeObserver(resize).observe(stageEl);

const clock = new THREE.Clock();
let started = false;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  bgMat.uniforms.uTime.value = REDUCED ? 3 : t;
  for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t += dt; if (tw.t < 0) continue; const k = clamp(tw.t / tw.dur, 0, 1); tw.fn(tw.ease(k)); if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); } }
  for (const r of reveals) { if (r.p === r.target) continue; if (r.wait > 0) { r.wait -= dt; continue; } r.p = REDUCED ? r.target : clamp(r.p + Math.sign(r.target - r.p) * (dt / r.dur), 0, 1); applyReveal(r); }
  for (const f of ticks) f(REDUCED ? 2 : t, dt);
  spx = lerp(spx, px, 0.05); spy = lerp(spy, py, 0.05);
  if (!flying && !userMoved) {
    const base = home.pos.clone().sub(home.target);
    base.applyAxisAngle(new THREE.Vector3(0, 1, 0), (REDUCED ? 0 : Math.sin(t * 0.12) * 0.035) - spx * 0.06);
    camera.position.copy(home.target).add(base); camera.position.y += spy * 0.6;
    controls.target.copy(home.target);
  }
  layers.forEach((l) => { const d = +(l.dataset.depth || 1); l.style.transform = `rotateY(${(spx * 2.2 * d).toFixed(3)}deg) rotateX(${(-spy * 1.6 * d).toFixed(3)}deg) translateZ(${(d * 6).toFixed(1)}px)`; });
  if (playing && !paused) {
    stepClock += dt;
    const b = bars[cur]; if (b) b.style.setProperty('--p', String(clamp(stepClock / STEP_T, 0, 1)));
    if (stepClock > STEP_T) { if (cur < N - 1) goStep(cur + 1); else { paused = true; renderPanel(); } }
  }
  controls.update();
  renderer.render(scene, camera);
  cssR.render(scene, camera);
  if (!started) { started = true; window.__bb3d = true; document.getElementById('fallback')?.setAttribute('hidden', ''); }
  requestAnimationFrame(frame);
}
function start() {
  resize();
  home.pos.copy(overview.pos); home.target.copy(overview.target);
  setStep(N - 1, true);
  const qs = new URLSearchParams(location.search);
  if (qs.has('step')) { playing = true; paused = true; site.classList.add('playing'); sc.hidden = false; const k = +qs.get('step') - 1; setStep(k, true); renderPanel(); const s = shotFor(k); home.pos.copy(s.pos); home.target.copy(s.target); camera.position.copy(s.pos); controls.target.copy(s.target); }
  requestAnimationFrame(frame);
}
// ===================== fin du moteur — scène de la planche =====================
