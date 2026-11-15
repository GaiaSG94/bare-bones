
// ===================== Bare Bones — home page engine =====================
// Fond en shader, sculpture de lignes fines qui se transforme d'étape en étape,
// étiquettes HTML nettes posées en 3D, scénario guidé.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/addons/renderers/CSS3DRenderer.js';

import { META } from './meta.js';
if (window.__bbNoGL) throw new Error('WebGL unavailable');
const REDUCED = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const site = document.getElementById('site');
const glEl = document.getElementById('gl');
const cssEl = document.getElementById('css3d');
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
glEl.appendChild(renderer.domElement);
renderer.domElement.setAttribute('role', 'img');
renderer.domElement.setAttribute('aria-label', META.alt || 'Interactive 3D sculpture');
const cssR = new CSS3DRenderer();
cssEl.appendChild(cssR.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 200);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.enableZoom = false; controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.3; controls.maxPolarAngle = Math.PI * 0.62;
controls.minAzimuthAngle = -0.8; controls.maxAzimuthAngle = 0.8;

// ---------- fonds ----------
const BG = { encre: 0, papier: 1, orbite: 2 };
const bgMat = new THREE.ShaderMaterial({
  uniforms: { uT: { value: 0 }, uRes: { value: new THREE.Vector2(1600, 900) }, uMode: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy * .5 + .5; gl_Position = vec4(position.xy, .9999, 1.); }',
  fragmentShader: `
    precision highp float;
    uniform float uT, uMode; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 6; i++){ v += a * n(p); p = p * 2.02 + 3.1; a *= .5; } return v; }
    void main(){
      vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 p = vec2((uv.x - .5) * asp, uv.y - .5); vec2 fc = gl_FragCoord.xy;
      vec3 col; float grain = .03;
      if (uMode < .5) {
        // Encre : noir bleuté, deux halos lents, très léger relief
        col = vec3(.027, .035, .047);
        float w = fbm(p * 1.4 + vec2(uT * .02, -uT * .015));
        col += vec3(.05, .09, .14) * smoothstep(.95, .0, length(p - vec2(.42, .06))) * (.6 + .5 * w);
        col += vec3(.09, .045, .02) * smoothstep(.7, .0, length(p - vec2(-.7, -.46))) * .7;
        col += vec3(.012) * (fbm(p * 7.) - .5);
      } else if (uMode < 1.5) {
        // Papier : gris chaud très clair, fibre fine, voile plus froid à droite
        col = vec3(.953, .949, .933);
        col -= vec3(.035, .022, .006) * smoothstep(.9, .0, length(p - vec2(.45, .05)));
        col += vec3(.012) * (fbm(p * 18. + 4.) - .5);
        grain = .022;
      } else {
        // Orbite : limbe d'une planète vue de l'espace, flou atmosphérique, poussière d'étoiles
        col = vec3(.012, .016, .024);
        vec2 c = vec2(.9, -1.32); float R = 1.32;
        float d = length(p - c);
        float surf = smoothstep(R + .004, R - .004, d);
        float tex = fbm((p - c) * 3. + vec2(uT * .006, 0.));
        vec3 ground = mix(vec3(.03, .04, .055), vec3(.12, .14, .17), tex) * smoothstep(R - .55, R, d);
        col = mix(col, ground, surf);
        float atm = exp(-max(d - R, 0.) * 9.) * (1. - surf * .55);
        col += vec3(.34, .52, .74) * atm * .55 + vec3(.9, .95, 1.) * exp(-abs(d - R) * 70.) * .35;
        float st = step(.9965, h(floor(fc / 2.))) * (1. - surf) * (.4 + .6 * h(floor(fc / 2.) + 7.));
        col += st * .55;
        col += vec3(.06, .08, .11) * smoothstep(.9, 0., length(p - vec2(-.5, .35))) * .5;
      }
      float v = smoothstep(1.35, .3, length(p * vec2(.8, 1.)));
      col *= mix(uMode > .5 && uMode < 1.5 ? .96 : .72, 1., v);
      col += (h(fc + fract(uT * 7.3) * 91.) - .5) * grain;
      gl_FragColor = vec4(col, 1.);
    }`,
  depthWrite: false, depthTest: false,
});
const bgGeo = new THREE.BufferGeometry();
bgGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
const bgMesh = new THREE.Mesh(bgGeo, bgMat); bgMesh.frustumCulled = false; bgMesh.renderOrder = -10; scene.add(bgMesh);

// ---------- sculpture de lignes ----------
const STRANDS = META.strands || 110, PTS = 170;
const lineGeo = new THREE.BufferGeometry();
const aU = new Float32Array(STRANDS * PTS), aV = new Float32Array(STRANDS * PTS), pos = new Float32Array(STRANDS * PTS * 3);
const idx = [];
for (let s = 0; s < STRANDS; s++) for (let i = 0; i < PTS; i++) { const k = s * PTS + i; aU[k] = i / (PTS - 1); aV[k] = (s + 0.5) / STRANDS; if (i < PTS - 1) idx.push(k, k + 1); }
lineGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
lineGeo.setAttribute('aU', new THREE.BufferAttribute(aU, 1));
lineGeo.setAttribute('aV', new THREE.BufferAttribute(aV, 1));
lineGeo.setIndex(idx);
const SHAPES = `
  attribute float aU; attribute float aV;
  uniform float uT, uTint, uThread, uAlpha, uSpread;
  uniform vec3 uWa, uWb, uBase, uAcc;
  varying vec3 vCol; varying float vA;
  float hs(float n){ return fract(sin(n) * 43758.5453); }
  vec3 sWave(float u, float v){ float x = (u - .5) * 9.; float ang = (u - .5) * 3.4 + uT * .16; float r = (v - .5) * 3.6; float y = sin(u * 4.7 + uT * .22) * .85; return vec3(x, y + r * sin(ang) * .85, r * cos(ang)); }
  vec3 sChaos(float u, float v){ float s = hs(v * 91.7 + 3.); float x = (u - .5) * 9. + sin(u * 23. + s * 7.) * .2; float y = (s - .5) * 4.6 + sin(u * 13. + s * 30. + uT * .8) * .7 * s + sin(u * 37. + s * 11. - uT) * .2; float z = sin(u * 8. + s * 20. + uT * .5) * 1.9 * (s - .5) * 2.; return vec3(x, y, z); }
  vec3 sCols(float u, float v){ float k = floor(v * 4.); float w = fract(v * 4.); return vec3((k - 1.5) * 2.25 + (w - .5) * 1.3, (u - .5) * 4.8, (w - .5) * .5 + sin(u * 3. + k) * .06); }
  vec3 sBars(float u, float v){ float b = floor(v * 8.); float w = fract(v * 8.); float hg = .8 + 3.6 * hs(b * 7.13 + 2.); return vec3((b - 3.5) * 1.06 + (w - .5) * .68, -2.4 + u * hg, (w - .5) * .38); }
  vec3 sThread(float u, float v){ float x = (u - .5) * 7.; float a = v * 6.2832 + u * 16. + uT * 1.1; float r = .045 + .32 * pow(abs(u - .5) * 2., 3.); return vec3(x, sin(u * 6.2832 + uT * .4) * .3 + cos(a) * r, sin(a) * r); }
  vec3 sSpine(float u, float v){ float y = (u - .5) * 5.4; float a = v * 6.2832 + u * 1.2; float b = 0.; for (int i = 0; i < 5; i++){ float c = -2.1 + float(i) * 1.05; b += exp(-pow((y - c) * 4.4, 2.)); } float r = .2 + b * 1.05; return vec3(cos(a) * r, y, sin(a) * r * .6); }
  vec3 shape(float u, float v){ return sWave(u, v) * uWa.x + sChaos(u, v) * uWa.y + sCols(u, v) * uWa.z + sBars(u, v) * uWb.x + sThread(u, v) * uWb.y + sSpine(u, v) * uWb.z; }
  vec3 color(float v){ float k = floor(v * 4.); vec3 cc = k < .5 ? vec3(.3, .79, .94) : k < 1.5 ? uBase : k < 2.5 ? vec3(.36, .89, .64) : vec3(1., .54, .24); vec3 c = mix(uBase, cc, uTint); return mix(c, uAcc, uThread); }
  float fadeEnds(float u){ return smoothstep(0., .07, u) * smoothstep(1., .93, u); }
`;
const lineMat = new THREE.ShaderMaterial({
  uniforms: { uT: { value: 0 }, uTint: { value: 0 }, uThread: { value: 0 }, uAlpha: { value: 0.5 }, uSpread: { value: 1 }, uWa: { value: new THREE.Vector3(1, 0, 0) }, uWb: { value: new THREE.Vector3(0, 0, 0) }, uBase: { value: new THREE.Color(0xF2EEE6) }, uAcc: { value: new THREE.Color(0xFF8A3D) } },
  vertexShader: SHAPES + 'void main(){ vec3 p = shape(aU, aV); vCol = color(aV); vA = (.3 + .7 * fadeEnds(aU)) * (.55 + .45 * hs(aV * 13.)); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }',
  fragmentShader: 'uniform float uAlpha, uThread; varying vec3 vCol; varying float vA; void main(){ gl_FragColor = vec4(vCol, vA * uAlpha * (1. - .55 * uThread)); }',
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
const lines = new THREE.LineSegments(lineGeo, lineMat); lines.frustumCulled = false; scene.add(lines);
// points scintillants posés sur les fils
const dotMat = new THREE.ShaderMaterial({
  uniforms: lineMat.uniforms,
  vertexShader: SHAPES + 'uniform float uPx; void main(){ vec3 p = shape(aU, aV); vCol = color(aV); float r = hs(aU * 311. + aV * 97.); vA = step(.93, r) * fadeEnds(aU) * (.5 + .5 * sin(uT * 2. + r * 40.)); vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = (1.6 + 2.4 * step(.985, r)) * uPx; gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform float uAlpha; varying vec3 vCol; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; if (dot(c, c) > .25) discard; gl_FragColor = vec4(vCol, vA * min(1., uAlpha * 2.2)); }',
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
dotMat.uniforms.uPx = { value: renderer.getPixelRatio() };
const dots = new THREE.Points(lineGeo, dotMat); dots.frustumCulled = false; scene.add(dots);

const SHAPE_KEYS = ['wave', 'chaos', 'cols', 'bars', 'thread', 'spine'];
const shapeNow = { wave: 1, chaos: 0, cols: 0, bars: 0, thread: 0, spine: 0, tint: 0, thread_c: 0 };
function applyShape(s) {
  lineMat.uniforms.uWa.value.set(s.wave, s.chaos, s.cols);
  lineMat.uniforms.uWb.value.set(s.bars, s.thread, s.spine);
  lineMat.uniforms.uTint.value = s.tint;
  lineMat.uniforms.uThread.value = s.thread_c;
}
function morph(target, dur = 2.2) {
  const from = { ...shapeNow };
  const to = { tint: 0, thread_c: 0 }; SHAPE_KEYS.forEach((k) => (to[k] = target[k] || 0)); if (target.tint != null) to.tint = target.tint; if (target.accent != null) to.thread_c = target.accent;
  tween(dur, (k) => { Object.keys(to).forEach((key) => (shapeNow[key] = lerp(from[key], to[key], k))); applyShape(shapeNow); });
}

// ---------- étiquettes HTML posées en 3D ----------
const labels = [];
function label(html, p, { cls = 'lab3d', c, steps = [], sprite = true, scale = 0.0105, rot } = {}) {
  const el = document.createElement('div');
  el.className = cls; el.innerHTML = html;
  if (c) el.style.setProperty('--c', c);
  const o = sprite ? new CSS3DSprite(el) : new CSS3DObject(el);
  o.position.set(p[0], p[1], p[2]); o.scale.setScalar(scale);
  if (rot) o.rotation.set(rot[0], rot[1], rot[2]);
  scene.add(o);
  const L = { o, el, steps, a: 0 };
  labels.push(L);
  return L;
}

// ---------- tween ----------
const tweens = [];
function tween(dur, fn, { delay = 0, done } = {}) { if (REDUCED || dur <= 0) { fn(1); done && done(); return; } tweens.push({ t: -delay, dur, fn, done }); }
const ticks = []; function onTick(f) { ticks.push(f); }

// ---------- caméra en orbite (azimut, élévation, distance) ----------
const camState = { az: 0.35, el: 0.18, dist: 21, ty: 0 };
let camAuto = true;
function aim(c, dur = 2.4) { const f = { ...camState }; tween(dur, (k) => { Object.keys(c).forEach((key) => (camState[key] = lerp(f[key], c[key], ease(k)))); }); camAuto = true; }
controls.addEventListener('start', () => { camAuto = false; });
function placeCamera(t) {
  if (!camAuto) return;
  const az = camState.az + (REDUCED ? 0 : Math.sin(t * 0.09) * 0.08) + px * 0.12;
  const el = camState.el + py * -0.05;
  camera.position.set(Math.sin(az) * Math.cos(el) * camState.dist, camState.ty + Math.sin(el) * camState.dist, Math.cos(az) * Math.cos(el) * camState.dist);
  controls.target.set(0, camState.ty, 0);
}

// ---------- fond : sélection ----------
function setBackground(name) {
  if (!(name in BG)) name = 'encre';
  site.dataset.bg = name;
  bgMat.uniforms.uMode.value = BG[name];
  const light = name === 'papier';
  lineMat.blending = dotMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
  lineMat.needsUpdate = dotMat.needsUpdate = true;
  lineMat.uniforms.uBase.value.set(light ? 0x0B0D10 : 0xF2EEE6);
  lineMat.uniforms.uAcc.value.set(light ? 0xE2621A : 0xFF8A3D);
  lineMat.uniforms.uAlpha.value = light ? 0.42 : 0.5;
  document.querySelectorAll('.bgs button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.bg === name)));
  try { localStorage.setItem('bb-theme', name); } catch (e) { /* stockage indisponible */ }
}
document.querySelectorAll('.bgs button').forEach((b) => b.addEventListener('click', () => setBackground(b.dataset.bg)));
let bg0 = new URLSearchParams(location.search).get('bg');
if (!bg0) { try { bg0 = localStorage.getItem('bb-theme'); } catch (e) { /* rien */ } }
setBackground(bg0 || 'papier');

// ---------- scénario ----------
const STEPS = META.steps, N = STEPS.length, ACTORS = META.actors;
const STEP_T = META.stepTime || 7;
const states = []; let idle = null;
function state(i, s) { states[i] = s; }
function idleState(s) { idle = s; }
let cur = -1, playing = false, paused = false, clockStep = 0;
const capEl = document.getElementById('cap');
const ticksEl = capEl.querySelector('.sc-ticks');
ticksEl.innerHTML = STEPS.map(() => '<i></i>').join('');
const tickEls = [...ticksEl.children];
const IC = {
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4.5 2.8v10.4L13 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="m6 3 5 5-5 5"/></svg>',
  again: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M3.2 6.2A5 5 0 1 1 3 9.5M3 2.8v3.6h3.6"/></svg>',
};
function apply(s, dur) {
  morph(s.shape || { wave: 1 }, dur);
  const c = { az: 0.35, el: 0.18, dist: 21, ty: 0, ...(s.cam || {}) };
  if (playing) { c.dist += 5.5; c.ty = s.cam?.pty ?? -2.0; }
  aim(c, dur * 1.1);
}
function showLabels(fn) { labels.forEach((L) => { L.want = fn(L) ? 1 : 0; }); }
const rich = (x) => String(x).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
function render() {
  const st = STEPS[cur], a = ACTORS[st.who];
  capEl.querySelector('.num').textContent = `${String(cur + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  const who = capEl.querySelector('.who'); who.style.setProperty('--c', a.c); who.innerHTML = `<i></i><b>${a.name}</b>&nbsp;· ${a.role}`;
  const body = capEl.querySelector('.body');
  body.querySelector('h2').innerHTML = rich(st.t); body.querySelector('p').innerHTML = rich(st.d);
  const res = body.querySelector('.res'); res.hidden = !st.r; if (st.r) res.lastElementChild.innerHTML = rich(st.r);
  body.classList.remove('anim'); void body.offsetWidth; body.classList.add('anim');
  tickEls.forEach((t, j) => { t.classList.toggle('done', j < cur); t.classList.toggle('cur', j === cur); t.style.setProperty('--p', j < cur ? '1' : '0'); });
  document.querySelectorAll('.actor').forEach((el) => el.classList.toggle('on', el.dataset.actor === st.who || (st.also || []).includes(el.dataset.actor)));
  document.getElementById('sc-pause').innerHTML = paused ? IC.play : IC.pause;
  document.getElementById('sc-next').innerHTML = cur >= N - 1 ? IC.again : IC.next;
}
function goStep(i, dur = 2.2) {
  cur = clamp(i, 0, N - 1); clockStep = 0;
  apply(states[cur] || idle, dur);
  showLabels((L) => L.steps.includes(cur));
  render();
}
function play() {
  playing = true; paused = REDUCED; site.classList.add('playing');
  capEl.hidden = false;
  goStep(0);
  document.getElementById('sc-next').focus({ preventScroll: true });
}
function stop() {
  playing = false; site.classList.remove('playing'); capEl.hidden = true;
  document.querySelectorAll('.actor').forEach((el) => el.classList.remove('on'));
  apply(idle, 2.2); showLabels((L) => L.steps.includes('idle'));
  document.getElementById('play').focus({ preventScroll: true });
}
document.getElementById('play').addEventListener('click', play);
document.getElementById('play-top')?.addEventListener('click', play);
document.getElementById('sc-close').addEventListener('click', stop);
document.getElementById('sc-prev').addEventListener('click', () => goStep(cur - 1));
document.getElementById('sc-next').addEventListener('click', () => (cur >= N - 1 ? play() : goStep(cur + 1)));
document.getElementById('sc-pause').addEventListener('click', () => { paused = !paused; render(); });
window.addEventListener('keydown', (e) => {
  if (!playing) return;
  if (e.key === 'ArrowRight') goStep(cur + 1);
  else if (e.key === 'ArrowLeft') goStep(cur - 1);
  else if (e.key === 'Escape') stop();
  else if (e.key === ' ') { e.preventDefault(); paused = !paused; render(); }
});

// ---------- pointeur ----------
let px = 0, py = 0, tx = 0, ty = 0;
site.addEventListener('pointermove', (e) => { const r = site.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1; });
site.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

// ---------- taille, décalage de la vue ----------
const SHIFT = META.shift ?? 0.24; // la sculpture vit dans la moitié droite
function resize() {
  const w = glEl.clientWidth, h = glEl.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); cssR.setSize(w, h);
  camera.aspect = w / h;
  const narrow = w < 700;
  const d = narrow ? 0 : Math.round(w * SHIFT);
  camera.setViewOffset(w, h, -d, narrow ? 0 : Math.round(h * (META.lift ?? 0.02)), w, h);
  camera.updateProjectionMatrix();
  bgMat.uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
}
new ResizeObserver(resize).observe(glEl);

const clock = new THREE.Clock();
let started = false;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; if (w.t < 0) continue; const k = clamp(w.t / w.dur, 0, 1); w.fn(ease(k)); if (k >= 1) { tweens.splice(i, 1); w.done && w.done(); } }
  px = lerp(px, tx, 0.04); py = lerp(py, ty, 0.04);
  const tt = REDUCED ? 4 : t;
  bgMat.uniforms.uT.value = tt; lineMat.uniforms.uT.value = tt;
  for (const f of ticks) f(tt, dt);
  labels.forEach((L) => { const want = L.want ?? 0; if (L.a !== want) { L.a = REDUCED ? want : clamp(L.a + Math.sign(want - L.a) * dt * 1.6, 0, 1); } L.o.visible = L.a > 0.01; L.el.style.opacity = String(L.a); });
  if (playing && !paused) {
    clockStep += dt;
    const tk = tickEls[cur]; if (tk) tk.style.setProperty('--p', String(clamp(clockStep / STEP_T, 0, 1)));
    if (clockStep > STEP_T) { if (cur < N - 1) goStep(cur + 1); else { paused = true; render(); } }
  }
  placeCamera(t);
  controls.update();
  renderer.render(scene, camera);
  cssR.render(scene, camera);
  if (!started) { started = true; window.__bb3d = true; document.getElementById('fallback')?.setAttribute('hidden', ''); }
  requestAnimationFrame(frame);
}
function start() {
  resize();
  apply(idle, 0);
  showLabels((L) => L.steps.includes('idle'));
  labels.forEach((L) => { L.a = L.want; });
  const qs = new URLSearchParams(location.search);
  if (qs.has('step')) { playing = true; paused = true; site.classList.add('playing'); capEl.hidden = false; goStep(+qs.get('step') - 1, 0); labels.forEach((L) => { L.a = L.want; }); }
  requestAnimationFrame(frame);
}
// ===================== end of the engine =====================



const REG = ['importers', 'derivations', 'reducers', 'views', 'shareAdapters'];
const SPINE = { spine: 1 };

idleState({ shape: SPINE, cam: { az: 0.42, el: 0.16, dist: 29, ty: -2.1 } });
state(0, { shape: SPINE, cam: { az: 0.5, el: 0.14, dist: 19 } });
state(1, { shape: { chaos: 1 }, cam: { az: 0.25, el: 0.2, dist: 21 } });
state(2, { shape: { chaos: 0.4, cols: 0.6, tint: 0.45 }, cam: { az: 0.18, el: 0.16, dist: 21 } });
state(3, { shape: { cols: 1, tint: 1 }, cam: { az: 0.12, el: 0.14, dist: 20.5 } });
state(4, { shape: { bars: 1, tint: 1 }, cam: { az: 0.3, el: 0.22, dist: 20 } });
state(5, { shape: { thread: 1, accent: 1 }, cam: { az: 0.2, el: 0.12, dist: 19 } });
state(6, { shape: { bars: 1, tint: 1 }, cam: { az: -0.2, el: 0.18, dist: 22 } });
state(7, { shape: { spine: 1, accent: .55 }, cam: { az: 0.55, el: 0.14, dist: 19 } });
state(8, { shape: { cols: 1, tint: 1 }, cam: { az: -0.25, el: 0.16, dist: 22 } });

// the skeleton: five extension points
REG.forEach((r, i) => label(`<b>${r}</b>`, [1.75, 2.1 - i * 1.05, 0.2], { cls: 'lab3d min', c: 'var(--acc-2)', steps: ['idle', 0] }));
label('<span class="k">Skeleton</span><b>5 extension points</b><span>everything else stays fixed</span>', [-2.6, 2.3, 0], { steps: ['idle'] });
label('<span class="k">skeleton/</span><b>70 lines</b><span>readable in an hour</span>', [-2.6, 2.3, 0], { steps: [0], c: 'var(--acc-2)' });

// raw export
label('<span class="k" style="color:var(--acc)">statement-2026.csv</span><b>Raw data</b><span>08/01/26;Dues;1 240,00<br>"15/01/2026";Hall rent;-380<br>03-02-2026;Grant;2500.00</span>', [-3.4, 1.9, 0], { steps: [1] });
label('<b>broken encoding</b>', [2.6, 1.9, 0.4], { cls: 'lab3d min', c: 'var(--no)', steps: [1] });
label('<b>3 date formats</b>', [3.1, -1.1, 0.2], { cls: 'lab3d min', c: 'var(--no)', steps: [1] });

// local parsing
label('<span class="k" style="color:var(--ok)">Local parsing</span><b>In the browser</b><span>encoding · dates · numbers</span>', [-0.9, 2.35, 0], { steps: [2] });

// typed table: one label per column
[['date', 'var(--acc-2)'], ['text', 'var(--fg)'], ['category', 'var(--ok)'], ['amount', 'var(--acc)']].forEach(([t, c], k) => label(`<b>${t}</b>`, [(k - 1.5) * 2.25, 2.6, 0], { cls: 'lab3d min', c, steps: [3] }));
label('<span class="k">Typed table</span><b>6 rows · 0 rejected</b>', [-5.4, -0.6, 0], { steps: [3] });

// charts
label('<span class="k" style="color:var(--acc)">Charts</span><b>100% home-made</b><span>no chart library</span>', [3.9, 2.2, 0], { steps: [4] });
label('<b>filter: Activities</b>', [-3.2, 1.6, 0.2], { cls: 'lab3d min', c: 'var(--ok)', steps: [4] });

// the link
label('<div class="url3d">…/budget/<em>#bb=eJzNk8t…</em></div>', [0, 1.05, 0], { cls: '', steps: [5] });
label('<b>the fragment never leaves the browser</b>', [0, -0.95, 0], { cls: 'lab3d min', c: 'var(--acc)', steps: [5] });

// the members' phone
label(`<div class="phone3d"><div class="scr"><div class="u">…/budget/<em>#bb=eJzNk8t…</em></div><h6>Budget 2026</h6><p class="s">filter: Activities</p><div class="kp"><div>Income<b>+€9,956</b></div><div>Expenses<b>−€15,474</b></div></div><div class="br"><i style="height:48%"></i><i style="height:30%"></i><i style="height:82%"></i><i style="height:56%"></i><i style="height:94%"></i><i style="height:40%"></i></div><p class="ft">Same view as the treasurer · no account</p></div></div>`, [2.6, -0.4, 3.0], { cls: '', sprite: false, rot: [0, -0.15, 0], scale: 0.0082, steps: [6] });
label('<span class="k" style="color:var(--ok)">Members</span><b>Same view</b><span>no account, nothing to install</span>', [-3.9, 1.4, 0], { steps: [6] });

// le club : mêmes cinq points d'extension, autres modules
const CLUB = ['match results', 'points & goal diff.', 'league table', 'form streaks', 'public link'];
REG.forEach((r, i) => label(`<b>${r}</b><span style="font:500 12px/1 var(--f-mono);color:var(--acc)">→ ${CLUB[i]}</span>`, [1.75, 2.1 - i * 1.05, 0.2], { cls: 'lab3d min', c: 'var(--acc)', steps: [7] }));
label('<span class="k" style="color:var(--acc)">apps/club-results</span><b>Same 5 slots, new modules</b><span>0 lines changed in core &amp; ui</span>', [-3.9, 1.8, 0], { steps: [7] });
// le téléphone du club, au style Floodlight
const TEAMS = [['Castors', '#38BDF8', 22], ['Herons', '#E2E8F0', 13], ['Otters', '#22C55E', 12], ['Falcons', '#F59E0B', 11], ['Lynx', '#A78BFA', 0], ['Swifts', '#64748B', 10]];
label(`<div class="phone3d"><div class="scr" style="background:radial-gradient(120% 55% at 50% -5%,rgba(56,189,248,.3),rgba(56,189,248,0) 60%),linear-gradient(180deg,#0A1120,#05070C)"><div class="u">…/club-results/<em style="color:#7DD3FC">#bb=r2Vx9…</em></div><h6 style="font-weight:800;letter-spacing:-.05em">League <span style="font-weight:300;color:#7DD3FC">table</span></h6><p class="s">Riverside Six · week 8</p>${TEAMS.map(([n, c, p], i) => `<div style="display:flex;align-items:center;gap:9px;margin-top:6px;padding:8px 10px;border-radius:11px;${i === 0 ? 'background:linear-gradient(90deg,rgba(56,189,248,.28),rgba(56,189,248,.06));box-shadow:inset 0 0 0 1px rgba(125,211,252,.45)' : 'background:rgba(238,242,247,.04)'}"><span style="font:600 10px/1 var(--f-mono);opacity:.55;width:10px">${i + 1}</span><i style="width:14px;height:16px;background:${c};clip-path:polygon(0 0,100% 0,100% 62%,50% 100%,0 62%)"></i><span style="flex:1;font:600 13px/1 var(--f-sans)">${n}</span><b style="font:800 16px/1 var(--f-sans)">${p}</b></div>`).join('')}<p class="ft">Public link · opens on any phone</p></div></div>`, [2.6, -0.4, 3.0], { cls: '', sprite: false, rot: [0, -0.15, 0], scale: 0.0082, steps: [8] });
label('<span class="k" style="color:var(--acc)">Club</span><b>Public, compact link</b><span>players &amp; parents, no account</span>', [-3.9, 1.4, 0], { steps: [8] });

start();
