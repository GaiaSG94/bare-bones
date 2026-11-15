import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const PX = 10, PZ = -26, PL = 105, PW = 68;
const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const texture = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d") as CanvasRenderingContext2D, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

function buildPitch(scene: THREE.Scene): void {
  const map = texture(2048, Math.round((2048 * PW) / PL), (g, w, h) => {
    const sx = w / PL, sz = h / PW;
    for (let i = 0; i < 22; i++) { g.fillStyle = i % 2 ? "#2E7A39" : "#286C32"; g.fillRect((i * w) / 22, 0, w / 22 + 1, h); }
    for (let i = 0; i < 60000; i++) { const x = rnd() * w, y = rnd() * h; g.strokeStyle = rnd() > 0.5 ? "rgba(10,30,12,.08)" : "rgba(150,200,120,.05)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 2, y - (2 + rnd() * 4)); g.stroke(); }
    g.strokeStyle = "rgba(236,242,236,.88)"; g.lineWidth = 0.12 * sx;
    g.strokeRect(sx, sz, (PL - 2) * sx, (PW - 2) * sz);
    g.beginPath(); g.moveTo(w / 2, sz); g.lineTo(w / 2, h - sz); g.stroke();
    g.beginPath(); g.ellipse(w / 2, h / 2, 9.15 * sx, 9.15 * sz, 0, 0, Math.PI * 2); g.stroke();
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x050807, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.03; scene.add(ground);
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PL + 8, PW + 8), new THREE.MeshStandardMaterial({ map, roughness: 0.92 }));
  pitch.rotation.x = -Math.PI / 2; pitch.position.set(PX, 0, PZ); scene.add(pitch);
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.3, metalness: 0.2 });
  [-1, 1].forEach((k) => {
    const goal = new THREE.Group();
    [-3.66, 3.66].forEach((z) => { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.44, 12), white); post.position.set(0, 1.22, z); goal.add(post); });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.32, 12), white); bar.rotation.x = Math.PI / 2; bar.position.y = 2.44; goal.add(bar);
    goal.position.set(PX + k * (PL / 2 - 1), 0, PZ); scene.add(goal);
  });
}

function buildStand(scene: THREE.Scene, length: number, rows: number, at: readonly [number, number, number], rotY: number): void {
  const concrete = new THREE.MeshStandardMaterial({ color: 0x23272f, roughness: 0.95 });
  const seats = new THREE.MeshStandardMaterial({ color: 0x173757, roughness: 0.7 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x1a1e25, roughness: 0.5, metalness: 0.6 });
  const s = new THREE.Group();
  for (let i = 0; i < rows; i++) {
    const row = new THREE.Mesh(new THREE.BoxGeometry(length, 0.5, 1.6), seats); row.position.set(0, 0.8 + i * 0.8, -i * 1.6); s.add(row);
    const riser = new THREE.Mesh(new THREE.BoxGeometry(length, 0.8 * (i + 1), 0.25), concrete); riser.position.set(0, 0.4 * (i + 1), -i * 1.6 - 0.8); s.add(riser);
  }
  const aisles: number[] = [];
  for (let x = -length / 2 + 10; x < length / 2; x += 14) aisles.push(x);
  const fans: [number, number, number][] = [];
  for (let i = 0; i < rows; i++) for (let x = -length / 2 + 0.4; x < length / 2; x += 0.58) {
    if (aisles.some((a) => Math.abs(a - x) < 0.9) || rnd() < 0.12) continue;
    fans.push([x + (rnd() - 0.5) * 0.1, 1.3 + i * 0.8 + rnd() * 0.08, -i * 1.6 + 0.1]);
  }
  const shirts = [0x1f2933, 0x111418, 0x2d3a4a, 0x0e5e95, 0x38bdf8, 0xd9dee5, 0x6b2a2a, 0x3f4a3a];
  const skins = [0x2b1d16, 0x4a3226, 0x6b4a36, 0x8c6448, 0xb08566, 0xc9a07e];
  const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.5, 0.28), new THREE.MeshStandardMaterial({ roughness: 0.85 }), fans.length);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.8 }), fans.length);
  const d = new THREE.Object3D(), c = new THREE.Color();
  fans.forEach((p, k) => {
    d.position.set(p[0], p[1], p[2]); d.rotation.y = (rnd() - 0.5) * 0.4; d.scale.set(1, 0.85 + rnd() * 0.3, 1); d.updateMatrix();
    bodies.setMatrixAt(k, d.matrix); bodies.setColorAt(k, c.setHex(shirts[Math.floor(rnd() * shirts.length)] ?? 0x1f2933).multiplyScalar(0.7 + rnd() * 0.5));
    d.position.set(p[0], p[1] + 0.4, p[2]); d.rotation.set(0, 0, 0); d.scale.setScalar(0.9 + rnd() * 0.2); d.updateMatrix();
    heads.setMatrixAt(k, d.matrix); heads.setColorAt(k, c.setHex(skins[Math.floor(rnd() * skins.length)] ?? 0x4a3226));
  });
  s.add(bodies, heads);
  const roofY = 0.8 + rows * 0.8 + 5;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(length + 2, 0.5, rows * 1.6 + 7), steel); roof.position.set(0, roofY, -rows * 0.8 + 1.5); s.add(roof);
  for (let x = -length / 2 + 2; x < length / 2; x += 4) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.85, 2), toneMapped: false }));
    lamp.position.set(x, roofY - 0.95, 4.4); s.add(lamp);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(length + 2, roofY, 0.4), concrete); back.position.set(0, roofY / 2, -rows * 1.6 - 2); s.add(back);
  s.position.set(at[0], at[1], at[2]); s.rotation.y = rotY; scene.add(s);
}

function buildTowers(scene: THREE.Scene): THREE.Points[] {
  const glow = texture(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.12, "rgba(235,245,255,.65)");
    gr.addColorStop(0.45, "rgba(180,215,255,.12)"); gr.addColorStop(1, "rgba(160,200,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const beam = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying float vY; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.); vD = length(mv.xyz); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "varying float vY; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(abs(dot(vN, vV)), 2.); float a = (pow(vY, 2.2) * f * .16 + pow(vY, 10.) * .3) * smoothstep(55., 120., vD); gl_FragColor = vec4(vec3(.86, .93, 1.) * a, a); }",
  });
  const pole = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.45, metalness: 0.7 });
  const lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 6.2, 6.6), toneMapped: false });
  const dust: THREE.Points[] = [];
  const tower = (x: number, z: number, visible = true): void => {
    const top = new THREE.Vector3(x, 46, z), target = new THREE.Vector3(PX + (x - PX) * 0.12, 0, PZ + (z - PZ) * 0.12);
    const spot = new THREE.SpotLight(0xedf5ff, 16000, 0, 0.46, 0.7, 2);
    spot.position.copy(top); spot.target.position.copy(target); scene.add(spot, spot.target);
    if (!visible) return;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.95, 46, 18), pole); mast.position.set(x, 23, z); scene.add(mast);
    const head = new THREE.Group(); head.position.copy(top); head.lookAt(target);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.1, 0.5), pole); housing.position.set(-3.75 + i * 1.5, -2.1 + j * 1.4, 0.05); head.add(housing);
      const bulb = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.85), lamp); bulb.position.set(-3.75 + i * 1.5, -2.1 + j * 1.4, 0.31); head.add(bulb);
    }
    scene.add(head);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    halo.scale.set(30, 30, 1); halo.position.copy(top); scene.add(halo);
    const dir = target.clone().sub(top), length = dir.length();
    [28, 16].forEach((r) => {
      const geo = new THREE.ConeGeometry(r, length, 64, 1, true); geo.translate(0, -length / 2, 0);
      const cone = new THREE.Mesh(geo, beam); cone.position.copy(top);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize()); scene.add(cone);
    });
    const n = 1200, positions = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const t = Math.pow(rnd(), 0.7), p = top.clone().lerp(target, t);
      const r = t * 24 * Math.sqrt(rnd()), a = rnd() * 6.283;
      positions.set([p.x + Math.cos(a) * r, p.y + (rnd() - 0.5) * 5, p.z + Math.sin(a) * r], k * 3);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.12, color: 0xd6ebff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(points); dust.push(points);
  };
  tower(PX - 6, PZ - PW / 2 - 34); tower(PX + PL / 2 + 22, PZ - PW / 2 - 24);
  tower(PX + PL / 2 + 34, PZ + 6); tower(PX - PL / 2 - 30, PZ + PW / 2 + 30, false);
  return dust;
}

function buildLedBoard(scene: THREE.Scene): void {
  const led = texture(2048, 64, (g, w) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, "#061726"); gr.addColorStop(0.5, "#0B2C48"); gr.addColorStop(1, "#061726");
    g.fillStyle = gr; g.fillRect(0, 0, w, 64);
    g.font = '700 40px "Inter Tight", Arial'; g.textBaseline = "middle";
    for (let x = 40; x < w; x += 1024) {
      g.fillStyle = "#7DD3FC"; g.fillText("RIVERSIDE SIX", x, 34);
      g.fillStyle = "rgba(238,242,247,.75)"; g.fillText("SEASON 2026", x + 420, 34);
    }
  });
  const board = new THREE.Mesh(new THREE.BoxGeometry(PL + 10, 0.9, 0.2), new THREE.MeshBasicMaterial({ map: led, toneMapped: false }));
  board.position.set(PX, 0.45, PZ - PW / 2 - 5); scene.add(board);
}

/** Night stadium adapted from design/reference/directions/stadium.js. */
export function startStadium(canvas: HTMLCanvasElement): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x0a101b, 0.0042);
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1200, 64, 32), new THREE.MeshBasicMaterial({ color: 0x04060c, side: THREE.BackSide, depthWrite: false, fog: false })));
  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.5, 2500);
  const CAM = new THREE.Vector3(-30, 8, 44), look = new THREE.Vector3(26, 6.5, -36);
  camera.position.copy(CAM); camera.lookAt(look);
  buildPitch(scene);
  buildStand(scene, PL + 30, 22, [PX, 0, PZ - PW / 2 - 10], 0);
  buildStand(scene, PW + 22, 16, [PX + PL / 2 + 12, 0, PZ], -Math.PI / 2);
  buildLedBoard(scene);
  const dust = buildTowers(scene);
  scene.add(new THREE.HemisphereLight(0x8fa8d0, 0x0a140d, 0.35));
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.5, 0.97));
  composer.addPass(new OutputPass());
  let mx = 0, my = 0, raf = 0;
  const onResize = (): void => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  };
  const onPointer = (e: PointerEvent): void => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
  window.addEventListener("resize", onResize); window.addEventListener("pointermove", onPointer);
  const clock = new THREE.Clock();
  const frame = (): void => {
    const t = clock.getElapsedTime();
    camera.position.set(CAM.x + mx * 3, CAM.y - my * 1.5, CAM.z); camera.lookAt(look);
    dust.forEach((p, i) => { p.position.y = Math.sin(t * 0.3 + i) * 0.3; });
    composer.render(); document.body.dataset.ready = "1"; raf = requestAnimationFrame(frame);
  };
  frame();
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize); window.removeEventListener("pointermove", onPointer); renderer.dispose();
  };
}
