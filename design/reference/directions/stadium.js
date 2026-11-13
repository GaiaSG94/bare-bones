// ---------- stade de nuit, version photo-réaliste ----------
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

if (location.search.includes('bgonly')) document.body.classList.add('bgonly');
const W = 1600, H = 900;
const canvas = document.getElementById('stadium');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0A101B, 0.0042);
const camera = new THREE.PerspectiveCamera(34, W / H, 0.5, 2500);
const CAM = new THREE.Vector3(-30, 8, 44), look = new THREE.Vector3(26, 6.5, -36);
camera.position.copy(CAM); camera.lookAt(look);

const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const PX = 10, PZ = -26, PL = 105, PW = 68;
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const ctex = (w, h, draw, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; };

// ---------- ciel : dégradé, nuages éclairés par le stade, étoiles ----------
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1200, 64, 32), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `varying vec3 vP;
    float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 6; i++){ v += a * n(p); p = p * 2.03 + 7.1; a *= .5; } return v; }
    void main(){ float y = vP.y; vec2 d = vP.xz / max(.08, y + .12);
      vec3 top = vec3(.003, .005, .012), hor = vec3(.035, .045, .07);
      vec3 c = mix(hor, top, smoothstep(-.02, .5, y));
      c += vec3(.22, .2, .24) * exp(-max(y, 0.) * 20.) * .5;
      float cl = smoothstep(.45, .8, fbm(d * .55 + vec2(3., 1.)));
      c = mix(c, vec3(.09, .1, .13) * (1.3 - y), cl * smoothstep(.0, .12, y) * .75);
      float s = step(.9982, h(floor(vP.xy * 700.) + floor(vP.z * 300.))) * smoothstep(.15, .55, y) * (1. - cl);
      c += s * .45;
      gl_FragColor = vec4(c, 1.); }`,
})));

// ---------- sol, piste de bord, abris de touche ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x050807, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -.03; scene.add(ground);
const apron = new THREE.Mesh(new THREE.PlaneGeometry(PL + 36, PW + 40), new THREE.MeshStandardMaterial({ color: 0x163A1E, roughness: 1 }));
apron.rotation.x = -Math.PI / 2; apron.position.set(PX, -.015, PZ); scene.add(apron);

// ---------- pelouse : tonte, brins, usure, lignes ; relief par bump map ----------
const TW = 3072, TH = Math.round(3072 * PW / PL);
const pitchMap = ctex(TW, TH, (g, w, h) => {
  const sx = w / PL, sz = h / PW;
  for (let i = 0; i < 22; i++) { g.fillStyle = i % 2 ? '#2E7A39' : '#286C32'; g.fillRect((i * w) / 22, 0, w / 22 + 1, h); }
  for (let i = 0; i < 260000; i++) { const x = rnd() * w, y = rnd() * h, l = 2 + rnd() * 4; g.strokeStyle = rnd() > .5 ? `rgba(10,30,12,${.05 + rnd() * .08})` : `rgba(150,200,120,${.03 + rnd() * .05})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 2, y - l); g.stroke(); }
  const wear = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(120,110,70,${a})`); gr.addColorStop(1, 'rgba(120,110,70,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  wear(w / 2, h / 2, 9 * sx, .18); wear(5 * sx, h / 2, 6 * sx, .3); wear(w - 5 * sx, h / 2, 6 * sx, .3); wear(11 * sx, h / 2, 4 * sx, .15); wear(w - 11 * sx, h / 2, 4 * sx, .15);
  g.strokeStyle = 'rgba(236,242,236,.88)'; g.lineWidth = .12 * sx; g.shadowColor = 'rgba(255,255,255,.4)'; g.shadowBlur = 2;
  const R = (x, y, ww, hh) => g.strokeRect(x * sx, y * sz, ww * sx, hh * sz);
  R(1, 1, PL - 2, PW - 2);
  g.beginPath(); g.moveTo(w / 2, sz); g.lineTo(w / 2, h - sz); g.stroke();
  g.beginPath(); g.ellipse(w / 2, h / 2, 9.15 * sx, 9.15 * sz, 0, 0, Math.PI * 2); g.stroke();
  [0, 1].forEach((k) => {
    const x0 = k ? PL - 1 - 16.5 : 1; R(x0, (PW - 40.3) / 2, 16.5, 40.3); R(k ? PL - 1 - 5.5 : 1, (PW - 18.3) / 2, 5.5, 18.3);
    const ps = k ? PL - 12 : 12; g.beginPath(); g.ellipse(ps * sx, h / 2, 9.15 * sx, 9.15 * sz, 0, k ? Math.PI - .93 : -.93, k ? Math.PI + .93 : .93); g.stroke();
    g.fillStyle = 'rgba(236,242,236,.9)'; g.beginPath(); g.arc(ps * sx, h / 2, .15 * sx, 0, 7); g.fill();
  });
  g.beginPath(); g.arc(w / 2, h / 2, .15 * sx, 0, 7); g.fill();
});
const bump = ctex(1024, 1024, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 120000; i++) { const v = Math.floor(90 + rnd() * 90); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 2.5); } }, false);
bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(30, 20);
const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PL + 8, PW + 8), new THREE.MeshStandardMaterial({ map: pitchMap, bumpMap: bump, bumpScale: 1.4, roughness: .92, metalness: 0 }));
pitch.rotation.x = -Math.PI / 2; pitch.position.set(PX, 0, PZ); scene.add(pitch);

// buts avec filets
const white = new THREE.MeshStandardMaterial({ color: 0xF2F4F6, roughness: .3, metalness: .2, emissive: 0x1a1a1a });
const netTex = ctex(256, 256, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.4; for (let i = 0; i <= w; i += 12) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, false);
netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping; netTex.repeat.set(6, 3);
const netM = new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: netTex, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false, roughness: 1 });
[-1, 1].forEach((k) => {
  const gg = new THREE.Group();
  [-3.66, 3.66].forEach((z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.44, 12), white); p.position.set(0, 1.22, z); gg.add(p); });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 7.32, 12), white); bar.rotation.x = Math.PI / 2; bar.position.y = 2.44; gg.add(bar);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 2.44), netM); back.rotation.y = Math.PI / 2; back.position.set(k * 2, 1.22, 0); gg.add(back);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(2, 7.32), netM); top.rotation.set(-Math.PI / 2, 0, Math.PI / 2); top.position.set(k * 1, 2.44, 0); gg.add(top);
  [-3.66, 3.66].forEach((z) => { const sd = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.44), netM); sd.position.set(k, 1.22, z); gg.add(sd); });
  gg.position.set(PX + k * (PL / 2 - 1), 0, PZ); scene.add(gg);
});
const ball = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .4 })); ball.position.set(PX, .22, PZ); scene.add(ball);

// abris de touche (bancs couverts)
const dugM = new THREE.MeshStandardMaterial({ color: 0x1B222C, roughness: .5, metalness: .4 });
const glassM = new THREE.MeshPhysicalMaterial({ color: 0xBFD8EE, transparent: true, opacity: .22, roughness: .05, metalness: 0, depthWrite: false });
[-9, 9].forEach((dx) => {
  const d = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(7, .4, 2.2), dugM); base.position.y = .2; d.add(base);
  for (let i = 0; i < 8; i++) { const seat = new THREE.Mesh(new THREE.BoxGeometry(.7, .5, .6), new THREE.MeshStandardMaterial({ color: 0x0E6FA8, roughness: .5 })); seat.position.set(-3 + i * .86, .65, -.3); d.add(seat); }
  const roofG = new THREE.Mesh(new THREE.BoxGeometry(7.2, .06, 2.6), glassM); roofG.position.set(0, 2.1, -.1); roofG.rotation.x = -.18; d.add(roofG);
  const backG = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.9, .06), glassM); backG.position.set(0, 1.15, -1.2); d.add(backG);
  [-3.6, 3.6].forEach((x) => { const sideG = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.9, 2.4), glassM); sideG.position.set(x, 1.15, -.1); d.add(sideG); const post = new THREE.Mesh(new THREE.BoxGeometry(.08, 2.1, .08), dugM); post.position.set(x, 1.05, 1.1); d.add(post); });
  d.position.set(PX + dx, 0, PZ + PW / 2 + 4); scene.add(d);
});

// ---------- panneaux LED ----------
const led = ctex(2048, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#061726'); gr.addColorStop(.5, '#0B2C48'); gr.addColorStop(1, '#061726'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.font = '700 40px "Inter Tight", Arial'; g.textBaseline = 'middle'; for (let x = 40; x < w; x += 1024) { g.fillStyle = '#7DD3FC'; g.fillText('RIVERSIDE SIX', x, 34); g.fillStyle = 'rgba(238,242,247,.75)'; g.fillText('SEASON 2026', x + 420, 34); } for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y, w, 1); } });
led.wrapS = THREE.RepeatWrapping; led.repeat.set(2, 1);
const ledM = new THREE.MeshBasicMaterial({ map: led, toneMapped: false, color: new THREE.Color(1.25, 1.25, 1.3) });
const b1 = new THREE.Mesh(new THREE.BoxGeometry(PL + 10, .9, .2), ledM); b1.position.set(PX, .45, PZ - PW / 2 - 5); scene.add(b1);
const b2 = new THREE.Mesh(new THREE.BoxGeometry(PW + 8, .9, .2), ledM); b2.rotation.y = Math.PI / 2; b2.position.set(PX + PL / 2 + 6, .45, PZ); scene.add(b2);

// ---------- tribunes : gradins, allées, foule en volume, toit et charpente ----------
const concrete = new THREE.MeshStandardMaterial({ color: 0x23272F, roughness: .95 });
const seatM = new THREE.MeshStandardMaterial({ color: 0x173757, roughness: .7 });
const aisleM = new THREE.MeshStandardMaterial({ color: 0x3A3F48, roughness: .9 });
const steelM = new THREE.MeshStandardMaterial({ color: 0x1A1E25, roughness: .5, metalness: .6 });
const fanGeo = new THREE.BoxGeometry(.4, .5, .28);
const headGeo = new THREE.SphereGeometry(.13, 10, 8);
const headM = new THREE.MeshStandardMaterial({ roughness: .8 });
const skin = [0x2B1D16, 0x4A3226, 0x6B4A36, 0x8C6448, 0xB08566, 0xC9A07E, 0x1A1410, 0x3A2A20];
const fanM = new THREE.MeshStandardMaterial({ roughness: .85 });
const shirt = [0x1F2933, 0x111418, 0x2D3A4A, 0x0E5E95, 0x38BDF8, 0xD9DEE5, 0x6B2A2A, 0x3F4A3A, 0x0B4F7A, 0xE5E7EB];
function stand(len, rows, at, rotY) {
  const s = new THREE.Group();
  for (let i = 0; i < rows; i++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(len, .5, 1.6), seatM); st.position.set(0, .8 + i * .8, -i * 1.6); s.add(st);
    const rs = new THREE.Mesh(new THREE.BoxGeometry(len, .8 * (i + 1), .25), concrete); rs.position.set(0, .4 * (i + 1), -i * 1.6 - .8); s.add(rs);
  }
  const aisles = [];
  for (let x = -len / 2 + 10; x < len / 2; x += 14) { aisles.push(x); const a = new THREE.Mesh(new THREE.BoxGeometry(1.2, .1, rows * 1.6), aisleM); a.position.set(x, .8 + rows * .4, -rows * .8 + .8); a.rotation.x = Math.atan2(.8, 1.6); s.add(a); }
  const fans = [];
  for (let i = 0; i < rows; i++) for (let x = -len / 2 + .4; x < len / 2; x += .58) { if (aisles.some((a) => Math.abs(a - x) < .9)) continue; if (rnd() < .12) continue; fans.push([x + (rnd() - .5) * .1, 1.3 + i * .8 + rnd() * .08, -i * 1.6 + .1]); }
  const im = new THREE.InstancedMesh(fanGeo, fanM, fans.length);
  const d = new THREE.Object3D(), c = new THREE.Color();
  fans.forEach((p, k) => { d.position.set(...p); d.rotation.y = (rnd() - .5) * .4; d.scale.set(1, .85 + rnd() * .3, 1); d.updateMatrix(); im.setMatrixAt(k, d.matrix); c.setHex(shirt[Math.floor(rnd() * shirt.length)]).multiplyScalar(.7 + rnd() * .5); im.setColorAt(k, c); });
  const hm = new THREE.InstancedMesh(headGeo, headM, fans.length);
  fans.forEach((p, k) => { d.position.set(p[0], p[1] + .4, p[2]); d.rotation.set(0, 0, 0); d.scale.setScalar(.9 + rnd() * .2); d.updateMatrix(); hm.setMatrixAt(k, d.matrix); c.setHex(skin[Math.floor(rnd() * skin.length)]); hm.setColorAt(k, c); });
  s.add(im, hm);
  const roofY = .8 + rows * .8 + 5;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(len + 2, .5, rows * 1.6 + 7), steelM); roof.position.set(0, roofY, -rows * .8 + 1.5); s.add(roof);
  for (let x = -len / 2; x <= len / 2; x += 6) { const tr = new THREE.Mesh(new THREE.BoxGeometry(.25, .9, rows * 1.6 + 7), steelM); tr.position.set(x, roofY - .6, -rows * .8 + 1.5); s.add(tr); }
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(len + 2, 1.4, .3), steelM); fascia.position.set(0, roofY - .2, 5); s.add(fascia);
  for (let x = -len / 2 + 2; x < len / 2; x += 4) { const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, .12, .25), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.85, 2), toneMapped: false })); lamp.position.set(x, roofY - .95, 4.4); s.add(lamp); }
  for (let x = -len / 2 + 6; x < len / 2; x += 18) { const col = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, roofY, 10), steelM); col.position.set(x, roofY / 2, -rows * 1.6 - 1.5); s.add(col); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(len + 2, roofY, .4), concrete); back.position.set(0, roofY / 2, -rows * 1.6 - 2); s.add(back);
  s.position.set(at[0], 0, at[2]); s.rotation.y = rotY; scene.add(s);
}
stand(PL + 30, 22, [PX, 0, PZ - PW / 2 - 10], 0);
stand(PW + 22, 16, [PX + PL / 2 + 12, 0, PZ], -Math.PI / 2);
// angle entre les tribunes : bloc de béton et tableau d'affichage
const corner = new THREE.Mesh(new THREE.BoxGeometry(30, 22, 30), concrete); corner.position.set(PX + PL / 2 + 34, 11, PZ - PW / 2 - 36); corner.rotation.y = Math.PI / 4; scene.add(corner);
const sb = ctex(1024, 512, (g, w, h) => {
  g.fillStyle = '#04070C'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#0B2C48'; g.fillRect(0, 0, w, 110);
  g.font = '800 64px "Inter Tight", Arial'; g.textBaseline = 'middle'; g.fillStyle = '#7DD3FC'; g.fillText('RIVERSIDE SIX', 40, 58); g.fillStyle = 'rgba(238,242,247,.8)'; g.textAlign = 'right'; g.fillText('WEEK 12', w - 40, 58); g.textAlign = 'left';
  g.font = '600 46px "Inter Tight", Arial'; g.fillStyle = 'rgba(238,242,247,.6)'; g.fillText('NEXT', 40, 170);
  g.font = '800 92px "Inter Tight", Arial'; g.fillStyle = '#EEF2F7'; g.fillText('CASTORS', 40, 260); g.fillText('OTTERS', 40, 380);
  g.font = '800 70px "Geist Mono", monospace'; g.fillStyle = '#7DD3FC'; g.textAlign = 'right'; g.fillText('SAT 14:00', w - 40, 320);
  for (let y = 0; y < h; y += 4) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y, w, 1.5); }
});
const board = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ map: sb, toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.2) }));
board.position.set(PX + PL / 2 + 13, 13.5, PZ - PW / 2 - 13); board.lookAt(CAM.x, 12, CAM.z); scene.add(board);
const bframe = new THREE.Mesh(new THREE.BoxGeometry(16.8, 8.8, .6), steelM); bframe.position.copy(board.position); bframe.quaternion.copy(board.quaternion); bframe.translateZ(-.35); scene.add(bframe);

// ---------- pylônes : projecteurs, halos, traînées optiques, cônes et poussière ----------
const glowTex = ctex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.12, 'rgba(235,245,255,.65)'); gr.addColorStop(.45, 'rgba(180,215,255,.12)'); gr.addColorStop(1, 'rgba(160,200,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const streakTex = ctex(512, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(140,200,255,0)'); gr.addColorStop(.5, 'rgba(220,240,255,.9)'); gr.addColorStop(1, 'rgba(140,200,255,0)'); g.fillStyle = gr; const vg = g.createLinearGradient(0, 0, 0, h); g.fillRect(0, h / 2 - 2, w, 4); g.globalCompositeOperation = 'destination-in'; vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.5, 'rgba(0,0,0,1)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(0, 0, w, h); });
const beamMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying float vY; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.); vD = length(mv.xyz); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'varying float vY; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(abs(dot(vN, vV)), 2.); float a = (pow(vY, 2.2) * f * .16 + pow(vY, 10.) * .3) * smoothstep(55., 120., vD); gl_FragColor = vec4(vec3(.86, .93, 1.) * a, a); }',
});
const poleM = new THREE.MeshStandardMaterial({ color: 0x2A3038, roughness: .45, metalness: .7 });
const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 6.2, 6.6), toneMapped: false });
const dusts = [];
function tower(x, z, visible = true) {
  const hgt = 46, top = new THREE.Vector3(x, hgt, z);
  const target = new THREE.Vector3(PX + (x - PX) * .12, 0, PZ + (z - PZ) * .12);
  const spot = new THREE.SpotLight(0xEDF5FF, 16000, 0, .46, .7, 2); spot.position.copy(top); spot.target.position.copy(target); scene.add(spot, spot.target);
  if (!visible) return;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.4, .95, hgt, 18), poleM); pole.position.set(x, hgt / 2, z); scene.add(pole);
  for (let y = 4; y < hgt - 4; y += 3.2) { const rung = new THREE.Mesh(new THREE.BoxGeometry(.9, .06, .06), poleM); rung.position.set(x + .5, y, z); scene.add(rung); }
  const head = new THREE.Group(); head.position.copy(top); head.lookAt(target);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(9.6, 6, .5), poleM); frame.position.z = -.35; head.add(frame);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
    const hous = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.1, .5), poleM); hous.position.set(-3.75 + i * 1.5, -2.1 + j * 1.4, .05); head.add(hous);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .85), lampM); l.position.set(-3.75 + i * 1.5, -2.1 + j * 1.4, .31); head.add(l);
  }
  scene.add(head);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); halo.scale.set(30, 30, 1); halo.position.copy(top); scene.add(halo);
  const streak = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, color: 0xffffff, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); streak.scale.set(60, 2.5, 1); streak.position.copy(top); scene.add(streak);
  const dir = target.clone().sub(top), len = dir.length();
  [[28, 1], [16, .85]].forEach(([r, o]) => { const geo = new THREE.ConeGeometry(r, len, 64, 1, true); geo.translate(0, -len / 2, 0); const cone = new THREE.Mesh(geo, beamMat); cone.position.copy(top); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize()); cone.scale.setScalar(o); scene.add(cone); });
  const n = 1400, dp = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) { const t = Math.pow(rnd(), .7); const p = top.clone().lerp(target, t); const r = t * 24 * Math.sqrt(rnd()), a = rnd() * 6.283; p.x += Math.cos(a) * r; p.z += Math.sin(a) * r; p.y += (rnd() - .5) * 5; dp.set([p.x, p.y, p.z], k * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const pts = new THREE.Points(dg, new THREE.PointsMaterial({ size: .12, color: 0xD6EBFF, transparent: true, opacity: .45, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(pts); dusts.push(pts);
}
tower(PX - 6, PZ - PW / 2 - 34);
tower(PX + PL / 2 + 22, PZ - PW / 2 - 24);
tower(PX + PL / 2 + 34, PZ + 6);
tower(PX - PL / 2 - 30, PZ + PW / 2 + 30, false); // pylône hors champ, derrière la caméra : éclaire le premier plan
scene.add(new THREE.HemisphereLight(0x8FA8D0, 0x0A140D, .35));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), .7, .5, .97));
composer.addPass(new OutputPass());

let mx = 0, my = 0;
window.addEventListener('pointermove', (e) => { mx = e.clientX / W - .5; my = e.clientY / H - .5; });
const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  camera.position.set(CAM.x + mx * 3, CAM.y - my * 1.5, CAM.z); camera.lookAt(look);
  dusts.forEach((d, i) => { d.position.y = Math.sin(t * .3 + i) * .3; });
  composer.render();
  document.body.dataset.ready = '1';
  requestAnimationFrame(frame);
}
document.fonts.ready.then(() => frame());
