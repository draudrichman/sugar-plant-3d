/* Mother Nature's Herbology: the shared 3D garden engine.

   One engine, fifteen plants. The engine owns everything the plants share:
   the renderer and ink outlines, lights and the rune circle, springs, the
   particle systems, leaves, faces, the turntable, the card logic and the heal
   sequence. A plant (plants/<id>.js) only builds its own model and says how it
   moves.

   It has no UI and no framework. mountGarden() takes a canvas and a plant and
   returns a small controller (answer, react, heal, reset, dispose), so the same
   code runs in these test pages and, later, inside a React component in the
   game.

   Plant module contract (default export):
     {
       id, look: { ink, bands, bg, rune: [sick, healed], outline },
       frame: { halfH, halfW, lookY, camLift },   // what the camera keeps in view
       lines: { sick, wrong: [...], right: [...], healed },   // optional speech
       build(kit) -> {
         update(s),            // every frame; s is the frame state below
         react(type, s),       // 'wrong' | 'right', once per answer
         burst(s),             // the moment the curse breaks
         centre(),             // world-space point sparkles gather to
         anchor?(),            // world-space point the speech bubble hangs from
         reset?(),
       }
     }
   Frame state s: { t, dt, h (health 0..1, smooth), hp (health with overshoot),
     sick, heal: { on, T, gather 0..1, burst, glow 0..1 }, healed,
     react: { type, t, dur, w } | null, k: { bounce, shake, spin, flinch } springs,
     M (motion scale, lower with reduced motion), pointer, turn } */

import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* =========================================================================
   Helpers
   ========================================================================= */
export const V3 = THREE.Vector3;
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const UP = new V3(0, 1, 0);
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const backOut = (t) => { const s = 1.9; return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2; };
export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rnd = (a, b) => a + (b - a) * Math.random();
export const randDir = () => new V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize();
/** A heartbeat: two quick beats, then a rest. */
export function heartbeat(time, rate) {
  const f = (time * rate) % 1;
  return Math.exp(-((f / 0.05) ** 2)) + 0.6 * Math.exp(-(((f - 0.17) / 0.05) ** 2)) + Math.exp(-(((f - 1) / 0.05) ** 2));
}

export class Spring {
  constructor(k, d, x = 0) { this.k = k; this.d = d; this.x = x; this.v = 0; this.target = x; }
  step(dt) {
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) { this.v += (this.k * (this.target - this.x) - this.d * this.v) * h; this.x += this.v * h; }
    return this.x;
  }
  kick(v) { this.v += v; }
  set(x) { this.x = this.target = x; this.v = 0; }
}

/** Bend a chain of n equal segments (length s) so its tip lands D across and
    H up from its root, by solving two numbers: the angle it leaves at (a) and
    an even curl along its length (c). st carries a and c between frames. */
export function solveChain(st, D, H, n, s) {
  let { a, c } = st;
  for (let it = 0; it < 8; it++) {
    let x = 0, y = 0, xa = 0, ya = 0, xc = 0, yc = 0;
    for (let i = 0; i < n; i++) {
      const th = a - i * c, co = Math.cos(th), si = Math.sin(th);
      x += s * co; y += s * si; xa -= s * si; ya += s * co; xc += s * i * si; yc -= s * i * co;
    }
    const ex = D - x, ey = H - y;
    if (ex * ex + ey * ey < 1e-8) break;
    const det = xa * yc - xc * ya;
    if (Math.abs(det) < 1e-6) break;
    let da = (yc * ex - xc * ey) / det, dc = (-ya * ex + xa * ey) / det;
    const m = Math.max(Math.abs(da), Math.abs(dc));
    if (m > 0.3) { da *= 0.3 / m; dc *= 0.3 / m; }
    a = clamp(a + da, -1.55, 1.55); c = clamp(c + dc, -0.35, 1.0);
  }
  st.a = a; st.c = c;
}

/* =========================================================================
   Geometry
   ========================================================================= */
/** A leaf, petal or sepal: a small curved sheet, length 1 along +Y. */
export function sheet({ width = 0.36, cup = 0.16, curl = 0.14, tipPinch = 0.3, cols = 6, rows = 12, point = 0.8, wave = 0, waveN = 5 } = {}) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    const hw = width * Math.pow(Math.sin(Math.PI * Math.min(v * 1.05, 1)), point) * (1 - tipPinch * v);
    for (let i = 0; i <= cols; i++) {
      const u = i / cols * 2 - 1;
      const ruffle = wave * Math.sin(v * waveN * Math.PI + u * 2) * Math.abs(u) * hw;
      pos.push(u * hw, v, -cup * u * u * hw * 2 + curl * v * v + ruffle);
      uv.push(u * 0.5 + 0.5, v);
    }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
    idx.push(a, b, d, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/** A bendable limb: a tapered tube skinned to a chain of bones, so it curves
    smoothly as the bones turn. strands > 1 twists several tubes together.
    gnarl > 0 wobbles the radius so it reads as wood or root. */
export function limb({ len, r0, r1, bones: nb, mat, strands = 1, twist = 0, spread = 0, gnarl = 0, radial = 10, cap = true }) {
  const parts = [];
  for (let s = 0; s < strands; s++) {
    const g = new THREE.CylinderGeometry(r1, r0, len, radial, nb * 8, false);
    g.translate(0, len / 2, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      let x = p.getX(i), z = p.getZ(i);
      if (gnarl) { const a = Math.atan2(z, x), k = 1 + gnarl * (Math.sin(y * 13 + a * 2 + s) + 0.6 * Math.sin(y * 29 + a * 3 + 1.7)); x *= k; z *= k; }
      if (strands > 1) { const a = (y / len) * twist * TAU + (s / strands) * TAU, r = spread * lerp(1, 0.6, y / len); x += Math.cos(a) * r; z += Math.sin(a) * r; }
      p.setX(i, x); p.setZ(i, z);
    }
    g.computeVertexNormals();
    parts.push(g);
  }
  const geo = parts.length > 1 ? mergeGeometries(parts) : parts[0];
  const p = geo.attributes.position, seg = len / nb;
  const si = [], sw = [];
  for (let i = 0; i < p.count; i++) {
    const f = clamp(p.getY(i) / seg, 0, nb - 1e-4), b = Math.floor(f), t = f - b;
    si.push(b, Math.min(b + 1, nb - 1), 0, 0); sw.push(1 - t, t, 0, 0);
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  const bones = [];
  for (let i = 0; i < nb; i++) { const b = new THREE.Bone(); b.position.y = i ? seg : 0; if (i) bones[i - 1].add(b); bones.push(b); }
  const mesh = new THREE.SkinnedMesh(geo, mat);
  mesh.add(bones[0]); mesh.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));
  mesh.frustumCulled = false; mesh.castShadow = true;
  if (cap) { const c = new THREE.Mesh(new THREE.SphereGeometry(r1, radial, 8), mat); c.position.y = seg; bones[nb - 1].add(c); }
  return { mesh, bones, seg, nb, len };
}

/** Several spheres merged into one lumpy mesh: one draw call. */
export function lumpGeo(parts, ws = 22, hs = 16) {
  return mergeGeometries(parts.map(([x, y, z, r, sy = 1]) => new THREE.SphereGeometry(r, ws, hs).scale(1, sy, 1).translate(x, y, z)));
}

/** A curly tendril: up, then a tightening spiral, in the XY plane. */
export function tendrilGeo({ rise = 0.12, r0 = 0.07, coils = 1.7, thick = 0.011, dir = 1 } = {}) {
  const pts = [new V3(0, 0, 0), new V3(0, rise * 0.5, 0), new V3(0, rise, 0)];
  const N = 46;
  for (let i = 1; i <= N; i++) {
    const k = i / N, a = k * coils * TAU, r = r0 * (1 - 0.78 * k);
    pts.push(new V3(dir * (r0 - r * Math.cos(a)), rise + r * Math.sin(a), 0));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, thick, 6, false);
}

/** A tube through points whose radius tapers from r0 to r1. */
export function taperTube(points, r0, r1 = r0, { segs = 48, radial = 8 } = {}) {
  const curve = typeof points.getPointAt === "function" ? points : new THREE.CatmullRomCurve3(points);
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const p = g.attributes.position, n = g.attributes.normal;
  const frames = curve.computeFrenetFrames(segs, false);
  for (let j = 0; j <= segs; j++) {
    const r = lerp(r0, r1, j / segs), c = curve.getPointAt(j / segs);
    for (let i = 0; i <= radial; i++) {
      const k = j * (radial + 1) + i;
      p.setXYZ(k, c.x + n.getX(k) * r, c.y + n.getY(k) * r, c.z + n.getZ(k) * r);
    }
  }
  g.computeVertexNormals();
  return g;
}

/* =========================================================================
   Canvas textures (drawn in code: no image files)
   ========================================================================= */
export function canvasTex(w, h, draw, { srgb = true, repeat = false } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function sharedTextures(R) {
  const rr = (a, b) => a + (b - a) * R();
  return {
    spark: canvasTex(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 2; x.lineCap = 'round';
      x.beginPath(); x.moveTo(32, 3); x.lineTo(32, 61); x.moveTo(3, 32); x.lineTo(61, 32); x.stroke();
    }, { srgb: false }),
    puff: canvasTex(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 31);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.5, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    }, { srgb: false }),
    dot: canvasTex(32, 32, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(16, 16, 14, 0, TAU); x.fill(); }, { srgb: false }),
    blob: canvasTex(128, 128, (x) => {
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 62);
      g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.55, 'rgba(0,0,0,.24)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    }),
    rune: canvasTex(512, 512, (x, w) => {
      const c = w / 2;
      x.strokeStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 14;
      x.lineWidth = 5; x.beginPath(); x.arc(c, c, 236, 0, TAU); x.stroke();
      x.lineWidth = 2.5; x.beginPath(); x.arc(c, c, 206, 0, TAU); x.stroke();
      x.lineWidth = 2; x.beginPath(); x.arc(c, c, 150, 0, TAU); x.stroke();
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * TAU; x.save(); x.translate(c + Math.cos(a) * 221, c + Math.sin(a) * 221); x.rotate(a + Math.PI / 2);
        x.lineWidth = 2; x.beginPath(); x.moveTo(0, -9); x.quadraticCurveTo(7, 0, 0, 9); x.quadraticCurveTo(-7, 0, 0, -9); x.stroke(); x.restore();
      }
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU;
        x.lineWidth = 2; x.beginPath(); x.moveTo(c, c);
        x.quadraticCurveTo(c + Math.cos(a - 0.5) * 120, c + Math.sin(a - 0.5) * 120, c + Math.cos(a) * 150, c + Math.sin(a) * 150);
        x.quadraticCurveTo(c + Math.cos(a + 0.5) * 120, c + Math.sin(a + 0.5) * 120, c, c); x.stroke();
      }
    }),
    /** Leaf veins in grey: multiply over any leaf colour. */
    leaf: canvasTex(128, 256, (x, w, h) => {
      x.fillStyle = '#dcdcdc'; x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(0,0,0,.12)'); g.addColorStop(0.5, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(0,0,0,.12)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineCap = 'round';
      x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 8); x.stroke();
      x.lineWidth = 1.8; x.strokeStyle = 'rgba(70,60,50,.35)';
      for (let i = 1; i <= 6; i++) {
        const y = h - i * h / 7.2;
        for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w / 2 + s * w * 0.2, y - h * 0.05, w / 2 + s * w * 0.44, y - h * 0.13); x.stroke(); }
      }
    }),
    /** Bark or root grain in grey. */
    bark: canvasTex(128, 512, (x, w, h) => {
      x.fillStyle = '#d4d4d4'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        const px = R() * w;
        x.strokeStyle = R() < 0.6 ? 'rgba(40,30,20,.35)' : 'rgba(255,255,255,.3)';
        x.lineWidth = rr(1, 3); x.beginPath(); x.moveTo(px, 0);
        for (let y = 0; y <= h; y += 32) x.lineTo(px + Math.sin(y * 0.03 + i) * 4, y);
        x.stroke();
      }
    }),
    /** Speckle for soil, stone or skin, in grey. */
    grain: canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#d0d0d0'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) {
        x.fillStyle = R() < 0.6 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.2)';
        x.beginPath(); x.arc(R() * w, R() * h, rr(0.8, 3.2), 0, TAU); x.fill();
      }
    }, { repeat: true }),
  };
}

/* =========================================================================
   mountGarden
   ========================================================================= */
export function mountGarden({ canvas, container = canvas.parentElement, plant, bubble = null, onEvent = () => {}, pixelRatio = 2, seed = 14022026 }) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = REDUCE ? 0.35 : 1;
  const R = rng(seed);
  const rr = (a, b) => a + (b - a) * R();
  const look = { ink: '#2a1a14', bands: [96, 160, 220, 255], rune: ['#f0a8c0', '#8fe0b4'], outline: 0.004, ...plant.look };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.info.autoReset = false;

  const INK = new THREE.Color(look.ink).toArray();
  const effect = new OutlineEffect(renderer, { defaultThickness: look.outline, defaultColor: INK, defaultAlpha: 1 });
  const outline = (m, thickness = look.outline, color = INK) => { m.userData.outlineParameters = { thickness, color, alpha: 1, visible: true, keepAlive: true }; return m; };
  const noOutline = (m) => { m.userData.outlineParameters = { visible: false }; return m; };
  function gradient(vals) {
    const d = new Uint8Array(vals.length * 4);
    vals.forEach((v, i) => d.set([v, v, v, 255], i * 4));
    const t = new THREE.DataTexture(d, vals.length, 1);
    t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  }
  const BANDS = gradient(look.bands);
  /** The house material: cel bands plus an ink outline. o.thickness / o.ink override the line. */
  function toon(color, o = {}) {
    const { thickness, ink, ...rest } = o;
    const m = new THREE.MeshToonMaterial({ color, gradientMap: BANDS, ...rest });
    return thickness === 0 ? noOutline(m) : outline(m, thickness ?? look.outline, ink ? new THREE.Color(ink).toArray() : INK);
  }
  const tex = sharedTextures(R);

  /* ---------- scene, light, ground ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const world = new THREE.Group();      // the turntable: dragging turns this
  scene.add(world);
  const hemi = new THREE.HemisphereLight('#f6efe6', '#3a2a24', 1.15);
  const key = new THREE.DirectionalLight('#fff0dc', 2.4);
  key.position.set(-3.2, 6.8, 4.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3.8, bottom: -1, near: 1, far: 18 });
  key.shadow.bias = -0.0006;
  const rim = new THREE.DirectionalLight('#b8ffe0', 1.3);
  rim.position.set(3.2, 3.6, -5);
  const fill = new THREE.DirectionalLight('#e8d8ff', 0.5);
  fill.position.set(4, 1.4, 3);
  const healLight = new THREE.PointLight('#ffe6c4', 0, 6, 1.6);
  scene.add(hemi, key, rim, fill, healLight);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(5, 48), noOutline(new THREE.ShadowMaterial({ color: '#03100a', opacity: 0.32 })));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), noOutline(new THREE.MeshBasicMaterial({ map: tex.blob, transparent: true, depthWrite: false })));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.006;
  const runeMat = noOutline(new THREE.MeshBasicMaterial({ map: tex.rune, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: look.rune[0], opacity: 0.3 }));
  const rune = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.1), runeMat);
  rune.rotation.x = -Math.PI / 2; rune.position.y = 0.004;
  world.add(ground, blob, rune);
  const runeCol = look.rune.map((c) => new THREE.Color(c));

  /* ---------- particles ---------- */
  const systems = [];
  function particles(map, max, blending = THREE.NormalBlending) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), size = new Float32Array(max), alpha = new Float32Array(max), rot = new Float32Array(max);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute('aRot', new THREE.BufferAttribute(rot, 1));
    const mat = noOutline(new THREE.ShaderMaterial({
      uniforms: { uTex: { value: map }, uPx: { value: 600 } },
      vertexShader: `
        attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aRot;
        varying vec3 vColor; varying float vAlpha; varying float vRot; uniform float uPx;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPx / -mv.z;
          vColor = aColor; vAlpha = aAlpha; vRot = aRot;
        }`,
      fragmentShader: `
        uniform sampler2D uTex; varying vec3 vColor; varying float vAlpha; varying float vRot;
        void main() {
          vec2 p = gl_PointCoord - 0.5; float c = cos(vRot), s = sin(vRot);
          p = mat2(c, -s, s, c) * p;
          vec4 t = texture2D(uTex, p + 0.5);
          gl_FragColor = vec4(vColor * t.rgb, t.a * vAlpha);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, blending,
    }));
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
    const P = Array.from({ length: max }, () => ({ life: 0, max: 1, p: new V3(), v: new V3(), s0: 0, s1: 0, c: new THREE.Color(), g: 0, drag: 0, spin: 0, rot: 0, a: 1, floor: -Infinity }));
    let next = 0, alive = 0;
    const sys = {
      mat, points: pts,
      /** at is world space. floor: particles stop and spread at this height. */
      emit(at, { v = new V3(), life = 1, s0 = 0.08, s1 = 0, color = '#ffffff', g = 0, drag = 0, a = 1, spin = rnd(-2, 2), floor = -Infinity } = {}) {
        const q = P[next]; next = (next + 1) % max;
        q.life = q.max = life; q.p.copy(at); q.v.copy(v); q.s0 = s0; q.s1 = s1; q.c.set(color); q.g = g; q.drag = drag;
        q.spin = spin; q.rot = rnd(0, TAU); q.a = a; q.floor = floor;
      },
      step(dt) {
        alive = 0;
        for (let i = 0; i < max; i++) {
          const q = P[i];
          if (q.life > 0) {
            alive++;
            q.life -= dt;
            q.v.y += q.g * dt; q.v.multiplyScalar(Math.exp(-q.drag * dt)); q.p.addScaledVector(q.v, dt);
            if (q.p.y < q.floor) { q.p.y = q.floor; q.v.set(0, 0, 0); }
            q.rot += q.spin * dt;
            const k = 1 - q.life / q.max;
            pos[i * 3] = q.p.x; pos[i * 3 + 1] = q.p.y; pos[i * 3 + 2] = q.p.z;
            col[i * 3] = q.c.r; col[i * 3 + 1] = q.c.g; col[i * 3 + 2] = q.c.b;
            size[i] = lerp(q.s0, q.s1, k);
            alpha[i] = q.a * Math.sin(Math.PI * Math.min(1, k * 1.1 + 0.06));
            rot[i] = q.rot;
          } else { size[i] = 0; alpha[i] = 0; }
        }
        for (const n of ['position', 'aColor', 'aSize', 'aAlpha', 'aRot']) geo.attributes[n].needsUpdate = true;
      },
      alive: () => alive,
    };
    systems.push(sys);
    return sys;
  }
  const spark = particles(tex.spark, 500, THREE.AdditiveBlending);
  const wisp = particles(tex.puff, 160, THREE.NormalBlending);

  /* ---------- leaves: point between a sick and a well direction ---------- */
  const leafList = [];
  const leafS = new Spring(26, 5.5);
  /** dirWell / dirSick / dirIn are directions in the parent's space. Health
      picks between well and sick; kit.leafFold pulls toward dirIn (folding in). */
  function addLeaf(parent, at, dirWell, dirSick, size, mat, geo, dirIn = null) {
    const pivot = new THREE.Group(); pivot.position.copy(at); parent.add(pivot);
    const mesh = new THREE.Mesh(geo, mat); mesh.scale.setScalar(size); mesh.castShadow = true; pivot.add(mesh);
    const L = {
      pivot, mesh, size, dirWell: dirWell.clone().normalize(), dirSick: dirSick.clone().normalize(),
      dirIn: (dirIn ?? dirWell.clone().multiply(new V3(-0.4, 1, -0.4))).clone().normalize(),
      roll: rr(-0.45, 0.45), ph: rr(0, TAU), f: rr(1.3, 2.2), flutter: 1, droop: 0,
    };
    leafList.push(L);
    return L;
  }
  const _lv = new V3(), _lq = new THREE.Quaternion();
  function stepLeaves(t) {
    const lp = clamp(leafS.x, -0.2, 1.35);
    for (const L of leafList) {
      _lv.copy(L.dirSick).lerp(L.dirWell, lp);
      if (kit.leafFold > 0.01) _lv.lerp(L.dirIn, clamp(kit.leafFold, 0, 1) * 0.8);
      _lv.x += Math.sin(t * L.f + L.ph) * 0.055 * M * L.flutter;
      _lv.z += Math.cos(t * L.f * 0.8 + L.ph) * 0.04 * M * L.flutter;
      _lv.y -= L.droop;
      L.pivot.quaternion.setFromUnitVectors(UP, _lv.normalize());
      _lq.setFromAxisAngle(UP, L.roll + Math.sin(t * L.f * 1.3 + L.ph) * 0.08 * M * L.flutter);
      L.pivot.quaternion.multiply(_lq);
    }
  }

  /* ---------- faces ---------- */
  const faces = [];
  /** A storybook face on an ellipsoid head (radii a, b, c, centred on the
      parent's origin, facing +Z). Eyes blink and follow the pointer; brows,
      lids and mouth follow health and reactions on their own. Every part is
      optional. Returns the rig; plants can push extra expression with
      face.over(E, weight) each frame. */
  function face(parent, o = {}) {
    const { a = 0.5, b = 0.5, c = 0.5 } = o;
    const eyeO = { x: 0.2, y: 0.02, r: 0.11, iris: '#3b2016', white: '#fffaf4', lid: '#c8a080', lashes: false, pupil: true, shine: true, ...(o.eyes || {}) };
    const browO = o.brows === false ? null : { y: 0.17, len: 0.11, r: 0.011, color: '#4a2e24', ...(o.brows || {}) };
    const mouthO = o.mouth === false ? null : { y: -0.19, inside: '#7a3040', lip: '#3a1c1c', ...(o.mouth || {}) };
    const blushO = o.blush ? { color: '240,120,130', x: 0.33, y: -0.14, w: 0.18, h: 0.12, freckles: false, ...(o.blush === true ? {} : o.blush) } : null;
    const surfZ = (x, y) => c * Math.sqrt(Math.max(1e-4, 1 - (x / a) ** 2 - (y / b) ** 2));
    const surfN = (x, y, z) => new V3(x / (a * a), y / (b * b), z / (c * c)).normalize();
    const lidMat = toon(eyeO.lid, { thickness: 0.0022, side: THREE.DoubleSide });
    const whiteMat = toon(eyeO.white, { thickness: 0.0026 });
    const irisMat = noOutline(new THREE.MeshToonMaterial({ color: eyeO.iris, gradientMap: BANDS }));
    const pupilMat = noOutline(new THREE.MeshBasicMaterial({ color: '#120a08' }));
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    const eyes = [];
    const re = eyeO.r;
    for (const s of [-1, 1]) {
      const ex = s * eyeO.x, ey = eyeO.y, ez = surfZ(ex, ey), n = surfN(ex, ey, ez);
      const g = new THREE.Group();
      g.position.set(ex, ey, ez).addScaledVector(n, -re * 0.5);
      g.quaternion.setFromUnitVectors(new V3(0, 0, 1), n);
      parent.add(g);
      g.add(new THREE.Mesh(new THREE.SphereGeometry(re, 28, 20), whiteMat));
      const lookG = new THREE.Group(); g.add(lookG);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(re * 0.8, 24, 16), irisMat);
      iris.scale.z = 0.36; iris.position.z = re * 0.7; lookG.add(iris);
      if (eyeO.pupil) { const p = new THREE.Mesh(new THREE.SphereGeometry(re * 0.42, 20, 14), pupilMat); p.scale.z = 0.3; p.position.z = re * 0.86; lookG.add(p); }
      if (eyeO.shine) {
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(re * 0.24, 14, 10), shineMat); s1.position.set(-re * 0.26, re * 0.3, re * 0.93); s1.scale.z = 0.4;
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(re * 0.1, 10, 8), shineMat); s2.position.set(re * 0.28, -re * 0.26, re * 0.95); s2.scale.z = 0.4;
        lookG.add(s1, s2);
      }
      const upper = new THREE.Mesh(new THREE.SphereGeometry(re * 1.06, 28, 14, 0, TAU, 0, Math.PI / 2), lidMat);
      const lower = new THREE.Mesh(new THREE.SphereGeometry(re * 1.055, 28, 14, 0, TAU, Math.PI / 2, Math.PI / 2), lidMat);
      g.add(upper, lower);
      if (eyeO.lashes) {
        const lashMat = noOutline(new THREE.MeshBasicMaterial({ color: look.ink }));
        for (const [ang0, len] of [[0.35, 0.07], [0.62, 0.075], [0.9, 0.06]]) {
          const lash = new THREE.Mesh(new THREE.ConeGeometry(0.008 * re / 0.13, len * re / 0.13, 5), lashMat);
          const ang = s > 0 ? ang0 : Math.PI - ang0;
          const rimP = new V3(Math.cos(ang) * re * 1.06, 0, Math.sin(ang) * re * 1.06);
          const outDir = rimP.clone().normalize().multiplyScalar(0.7).add(new V3(0, 0.75, 0)).normalize();
          lash.position.copy(rimP).addScaledVector(outDir, len * re / 0.13 / 2);
          lash.quaternion.setFromUnitVectors(UP, outDir);
          upper.add(lash);
        }
      }
      let browPivot = null, brow = null;
      if (browO) {
        brow = new THREE.Mesh(new THREE.CapsuleGeometry(browO.r, browO.len, 4, 8), toon(browO.color, { thickness: 0.0012 }));
        brow.rotation.z = Math.PI / 2;
        browPivot = new THREE.Group();
        browPivot.position.set(s * eyeO.x, browO.y, surfZ(s * eyeO.x, browO.y) + 0.01);
        browPivot.rotation.y = s * 0.3;
        browPivot.add(brow); parent.add(browPivot);
      }
      eyes.push({ s, upper, lower, look: lookG, browPivot, brow });
    }
    if (blushO) {
      const bt = canvasTex(128, 96, (x, w, h) => {
        const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.48);
        g.addColorStop(0, `rgba(${blushO.color},.55)`); g.addColorStop(0.6, `rgba(${blushO.color},.25)`); g.addColorStop(1, `rgba(${blushO.color},0)`);
        x.fillStyle = g; x.fillRect(0, 0, w, h);
        if (blushO.freckles) { x.fillStyle = `rgba(${blushO.color},.9)`; for (const [fx, fy] of [[0.32, 0.44], [0.46, 0.36], [0.6, 0.46], [0.42, 0.58], [0.56, 0.62], [0.7, 0.55]]) { x.beginPath(); x.arc(fx * w, fy * h, 3, 0, TAU); x.fill(); } }
      });
      const bm = noOutline(new THREE.MeshBasicMaterial({ map: bt, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      for (const s of [-1, 1]) {
        const g = new THREE.PlaneGeometry(blushO.w, blushO.h, 8, 6), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = s * blushO.x + p.getX(i), y = blushO.y + p.getY(i); p.setXYZ(i, x, y, surfZ(x, y) + 0.006); }
        parent.add(new THREE.Mesh(g, bm));
      }
    }
    // the mouth: an ink lip and a coloured inside, two strips on the head's curve
    const COLS = 16;
    const strips = [];
    if (mouthO) {
      for (const [col, pad, lift, fac] of [[mouthO.lip, 0.0085, 0.004, -2], [mouthO.inside, 0, 0.007, -3]]) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((COLS + 1) * 2 * 3), 3));
        const idx = []; for (let i = 0; i < COLS; i++) { const k = i * 2; idx.push(k, k + 1, k + 3, k, k + 3, k + 2); }
        geo.setIndex(idx);
        const m = new THREE.Mesh(geo, noOutline(new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: fac, polygonOffsetUnits: fac * 2 })));
        m.frustumCulled = false; parent.add(m); strips.push({ m, pad, lift });
      }
    }
    function setMouth(w, smile, open) {
      for (const { m, pad, lift } of strips) {
        const p = m.geometry.attributes.position;
        for (let i = 0; i <= COLS; i++) {
          const u = i / COLS * 2 - 1, x = u * (w / 2 + pad * 0.5);
          const mid = smile * 0.34 * w * (u * u - 1), bow = 1 - u * u;
          const Yu = mouthO.y + mid + 0.004 + open * 0.2 * w * bow + pad, Yl = mouthO.y + mid - 0.004 - open * 0.75 * w * bow - pad;
          p.setXYZ(i * 2, x, Yu, surfZ(x, Yu) + lift);
          p.setXYZ(i * 2 + 1, x, Yl, surfZ(x, Yl) + lift);
        }
        p.needsUpdate = true;
      }
    }
    const E = { lid: 1, low: 0, brow: 0, browY: 0, smile: 0, open: 0, w: 0.1 };
    const rig = {
      eyes, lidMat, setMouth, E,
      /** Expressions at full sickness and full health; plants may replace these. */
      sickE: { lid: 0.8, low: 0.05, brow: 0.5, browY: 0, smile: -0.6, open: 0, w: 0.075, ...(o.sickE || {}) },
      wellE: { lid: 1, low: 0.28, brow: -0.05, browY: 0.018, smile: 0.9, open: 0.3, w: 0.15, ...(o.wellE || {}) },
      wrongE: { lid: 0.7, low: 0.45, brow: 0.75, browY: 0.012, smile: -1, open: 0.45, w: 0.09, ...(o.wrongE || {}) },
      rightE: { lid: 1, low: 0.65, brow: 0.12, browY: 0.035, smile: 1.1, open: 0.5, w: 0.15, ...(o.rightE || {}) },
      blink: 0, nextBlink: rr(1, 3), wander: { x: 0, y: 0 }, nextLook: 0,
      lookX: new Spring(60, 12), lookY: new Spring(60, 12),
      gazeScale: o.gazeScale ?? 1, lidTint: o.lidTint ?? null,
      overs: [],
      over(e, w) { if (w > 0.001) this.overs.push([e, w]); },
    };
    faces.push(rig);
    return rig;
  }
  function blend(E, o, w) { for (const k in E) if (o[k] !== undefined) E[k] = lerp(E[k], o[k], w); }
  function stepFace(f, s) {
    const { E } = f;
    for (const k in E) E[k] = lerp(f.sickE[k], f.wellE[k], s.h);
    if (s.react) blend(E, s.react.type === 'wrong' ? f.wrongE : f.rightE, s.react.w);
    if (s.heal.on) {
      const T = s.heal.T;
      // sized from this face's own healthy mouth, so small heads get small mouths
      const W = f.wellE;
      blend(E, T < 0.6 ? { lid: 0, low: 0.6, brow: 0.2, browY: W.browY * 0.5, smile: 0.2, open: 0, w: W.w * 0.55 } : { lid: 1, low: 0.6, brow: 0.15, browY: W.browY * 2, smile: 1.2, open: W.open * 2, w: W.w * 1.13 },
        T < 0.6 ? sstep(0, 0.15, T) : 1 - sstep(2.6, 3.6, T));
    }
    for (const [e, w] of f.overs) blend(E, e, w);
    f.overs.length = 0;
    f.nextBlink -= s.dt;
    if (f.nextBlink <= 0) { f.blink = 1; f.nextBlink = rnd(2.2, 5); }
    if (f.blink > 0) f.blink = Math.max(0, f.blink - s.dt / 0.2);
    const blinkK = Math.sin(Math.PI * f.blink);
    f.nextLook -= s.dt;
    if (f.nextLook <= 0) { f.wander = { x: rnd(-0.4, 0.4), y: rnd(-0.2, 0.25) }; f.nextLook = rnd(1.2, 3); }
    const follow = s.t - pointer.t < 2.5;
    let lx = (follow ? pointer.x * 0.5 : f.wander.x) - turn.x * 0.55;
    let ly = follow ? -pointer.y * 0.4 : f.wander.y;
    if (s.react?.type === 'wrong') ly += 0.2;
    f.lookX.target = clamp(lx * f.gazeScale, -0.45, 0.45); f.lookY.target = clamp(ly * f.gazeScale, -0.35, 0.35);
    f.lookX.step(s.dt); f.lookY.step(s.dt);
    for (const e of f.eyes) {
      const lid = clamp(E.lid * (1 - blinkK), 0, 1);
      e.upper.rotation.x = lerp(1.56, -1.3, lid);
      // with the eye shut the lower lid stays down and the iris hides, so no ring or highlight shows through
      e.lower.rotation.x = lerp(1.46, 0.4, clamp(E.low, 0, 1) * sstep(0.05, 0.3, lid));
      e.look.rotation.set(f.lookY.x, f.lookX.x, 0);
      e.look.visible = lid > 0.06;
      if (e.browPivot) {
        e.browPivot.position.y = (e.by ??= e.browPivot.position.y) + E.browY;
        e.brow.rotation.set(0, 0, Math.PI / 2 - e.s * E.brow);
      }
    }
    f.setMouth(E.w, E.smile, Math.max(0, E.open));
  }

  /* ---------- palettes: [sick, healed] colour pairs ---------- */
  function palette(PAL) {
    const pal = {};
    for (const k in PAL) pal[k] = PAL[k].map((c) => new THREE.Color(c));
    return { pal, mix: (out, k, h) => (out.isColor ? out : out.color).copy(pal[k][0]).lerp(pal[k][1], h) };
  }

  /* ---------- state ---------- */
  const pointer = { x: 0, y: 0, t: -99 };
  const turn = new Spring(40, 11);
  const drag = { on: false, x: 0, last: -99 };
  const k = { bounce: new Spring(200, 10), shake: new Spring(280, 7), spin: new Spring(55, 4.5), flinch: new Spring(110, 11) };
  const hPose = new Spring(30, 8.5), hCol = new Spring(13, 7.2);
  let hTarget = 0, t = 0, react = null, healing = null, healed = false, glow = 0, healIn = 0;
  let right = 0, rightNeeded = plant.rightNeeded ?? 4;

  const kit = {
    THREE, scene, world, camera, renderer, R, rr, rnd, M, REDUCE, look,
    lights: { hemi, key, rim, fill, heal: healLight }, ground, blob, rune, runeMat,
    outline, noOutline, toon, gradient, BANDS, canvasTex, tex,
    sheet, limb, lumpGeo, tendrilGeo, taperTube, mergeGeometries,
    particles, spark, wisp, randDir,
    addLeaf, leaves: leafList, leafS, leafFold: 0,
    face, palette, Spring, solveChain, heartbeat,
    clamp, lerp, sstep, backOut, V3, TAU, DEG, UP,
    say: (text, ms) => say(text, ms),
    worldPos: (o) => o.getWorldPosition(new V3()),
  };

  const inst = plant.build(kit);
  const centre = () => inst.centre?.() ?? new V3(0, 1.2, 0);

  /* ---------- speech ---------- */
  let bubbleTimer = 0;
  function say(text, ms = 2800) {
    if (!text) return;
    onEvent({ type: 'say', text });
    if (!bubble) return;
    bubble.textContent = text; bubble.dataset.on = 'true';
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => (bubble.dataset.on = 'false'), ms);
  }
  const pick = (v) => (Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v);
  const _bp = new V3();
  function placeBubble() {
    if (!bubble || bubble.dataset.on !== 'true') return;
    const p = (inst.anchor?.() ?? centre().add(_bp.set(0.5, 0.45, 0))).project(camera);
    const w = container.clientWidth, h = container.clientHeight;
    bubble.style.left = `${clamp((p.x * 0.5 + 0.5) * w, 8, w - bubble.offsetWidth - 8)}px`;
    bubble.style.top = `${clamp((-p.y * 0.5 + 0.5) * h - bubble.offsetHeight, 8, h - bubble.offsetHeight - 8)}px`;
  }

  /* ---------- reactions and the heal ---------- */
  function doReact(type) {
    if (healing || healed) return;
    react = { type, t: 0, dur: type === 'wrong' ? 1.35 : 1.15, w: 0 };
    const c = centre();
    if (type === 'wrong') {
      k.shake.kick(6); k.flinch.target = 1; setTimeout(() => (k.flinch.target = 0), 420);
      for (let i = 0; i < 16; i++) spark.emit(c.clone().add(randDir().multiplyScalar(0.4)), { v: randDir().multiplyScalar(rnd(0.5, 1.2)), life: rnd(0.4, 0.8), s0: 0.1, s1: 0, color: '#ff7a5c', drag: 2 });
      say(pick(plant.lines?.wrong), 2600);
    } else {
      k.bounce.kick(4.5); leafS.kick(3);
      for (let i = 0; i < 22; i++) {
        const d = randDir(); d.y = Math.abs(d.y) * 0.6 + 0.3;
        spark.emit(c.clone().addScaledVector(d, 0.5), { v: d.clone().multiplyScalar(rnd(0.5, 1.1)), life: rnd(0.7, 1.1), s0: 0.1, s1: 0.02, color: Math.random() < 0.5 ? '#ffe28a' : '#b6ffd2', g: 0.2, drag: 1.6 });
      }
      if (plant.lines?.right) say(pick(plant.lines.right), 2200);
    }
    inst.react?.(type, frameState());
  }
  function heal() {
    if (healing || healed) return;
    healing = { T: 0, burst: false };
    react = null;
  }
  function reset() {
    healing = null; react = null; healed = false; glow = 0; hTarget = 0; right = 0; healIn = 0;
    inst.reset?.();
    onEvent({ type: 'progress', value: 0 });
  }
  /** A card was played. Returns { ok, done }. */
  function answer(ok) {
    if (healing || healed) return { ok, done: healed };
    if (!ok) { doReact('wrong'); return { ok, done: false }; }
    right++;
    doReact('right');
    if (right >= rightNeeded) { hTarget = Math.max(hTarget, 0.75); healIn = 0.65; }   // a beat to land the card, then the cure
    else hTarget = right / rightNeeded;
    onEvent({ type: 'progress', value: right / rightNeeded });
    return { ok, done: right >= rightNeeded };
  }

  /* ---------- the frame ---------- */
  const S = { heal: {}, k, M, pointer, turn };
  function frameState() {
    const h = clamp(hCol.x, 0, 1);
    Object.assign(S, { t, dt: S.dt ?? 0, h, hp: hPose.x, sick: 1 - h, healed, react, hTarget });
    Object.assign(S.heal, { on: !!healing, T: healing?.T ?? 0, gather: healing ? sstep(0, 0.65, healing.T) : 0, burst: !!healing?.burst, glow });
    return S;
  }
  function update(dt) {
    t += dt; S.dt = dt;
    if (healIn > 0 && (healIn -= dt) <= 0) heal();
    if (healing) {
      const T = (healing.T += dt);
      if (T < 0.65) {
        k.bounce.target = -0.6; glow = sstep(0, 0.65, T);
        if (Math.random() < dt * 90) {
          const a = rnd(0, TAU), r = rnd(1.2, 1.6), c = centre();
          const at = world.localToWorld(new V3(Math.cos(a) * r, rnd(0.2, 2.5), Math.sin(a) * r));
          spark.emit(at, { v: c.clone().sub(at).multiplyScalar(1.6), life: 0.55, s0: 0.05, s1: 0.12, color: Math.random() < 0.5 ? '#ffd6e4' : '#ffe9a0' });
        }
      } else if (!healing.burst) {
        healing.burst = true;
        k.bounce.target = 0; k.bounce.kick(7); k.spin.kick(8); leafS.kick(5);
        hTarget = 1;
        const c = centre();
        for (let i = 0; i < 170; i++) spark.emit(c, { v: randDir().multiplyScalar(rnd(1.2, 3.5)), life: rnd(1.1, 2.1), s0: rnd(0.08, 0.17), s1: 0.01, color: ['#ffe28a', '#b6ffd2', '#ffd1e6', '#ffffff'][i % 4], g: -1, drag: 1.5 });
        for (let i = 0; i < 26; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.3)), { v: randDir().multiplyScalar(rnd(0.8, 1.6)), life: rnd(1, 1.6), s0: 0.25, s1: 0.7, color: '#f4f8ff', drag: 1.5, a: 0.4 });
        inst.burst?.(frameState());
      } else {
        glow = Math.max(0, 1 - (T - 0.65) / 1.6);
        if (T > 3.6) {
          healing = null; healed = true; glow = 0;
          say(plant.lines?.healed, 3400);
          onEvent({ type: 'healed' });
        }
      }
    } else k.bounce.target = 0;

    if (react) {
      react.t += dt;
      react.w = sstep(0, 0.08, react.t) * (1 - sstep(react.dur - 0.38, react.dur, react.t));
      if (react.t > react.dur) react = null;
    }
    hPose.target = hTarget; hCol.target = hTarget; leafS.target = hTarget;
    hPose.step(dt); hCol.step(dt); leafS.step(dt);
    for (const s of Object.values(k)) s.step(dt);
    turn.step(dt);
    if (!drag.on && t - drag.last > 2.5) turn.target = 0;
    world.rotation.y = turn.x;

    const s = frameState();
    runeMat.color.copy(runeCol[0]).lerp(runeCol[1], s.h);
    runeMat.opacity = 0.24 + 0.1 * Math.sin(t * 1.6) * M + glow * 0.8;
    healLight.intensity = glow * 5;
    healLight.position.copy(centre()).add(_bp.set(0, 0.1, 0.9));

    stepLeaves(t);
    inst.update(s);
    for (const f of faces) stepFace(f, s);
    if (s.h > 0.9 && Math.random() < dt * 2 * M) {
      const a = rnd(0, TAU), r = rnd(0.5, 1.4);
      spark.emit(world.localToWorld(new V3(Math.cos(a) * r, rnd(0.8, 2.4), Math.sin(a) * r)), { v: new V3(0, rnd(0.08, 0.2), 0), life: rnd(2.5, 4), s0: 0.06, s1: 0.03, color: '#ffe9a0', a: 0.7 });
    }
    for (const sys of systems) sys.step(dt);
    placeBubble();
  }

  /* ---------- sizing, input, loop ---------- */
  const frame = { halfH: 1.5, halfW: 1.6, lookY: 1.2, camLift: 0.17, ...plant.frame };
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfV = Math.tan((camera.fov * DEG) / 2), halfH = halfV * camera.aspect;
    const dist = Math.max(frame.halfH / halfV, frame.halfW / halfH) * 1.04;
    camera.position.set(0, frame.lookY + 0.03 + dist * frame.camLift, dist);
    camera.lookAt(0, frame.lookY, 0);
    camera.updateProjectionMatrix();
    const px = renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * halfV);
    for (const sys of systems) sys.mat.uniforms.uPx.value = px;
  }
  const ro = new ResizeObserver(resize); ro.observe(container);
  resize();

  const onDown = (e) => { drag.on = true; drag.x = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1; pointer.t = t;
    if (drag.on) { turn.target = clamp(turn.target + (e.clientX - drag.x) * 0.009, -1.4, 1.4); drag.x = e.clientX; drag.last = t; }
  };
  const onUp = () => { drag.on = false; drag.last = t; canvas.classList.remove('dragging'); };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // Stop drawing when the canvas is off screen: no hidden 3D eating the CPU.
  let visible = true, raf = 0, last = performance.now(), fpsAvg = 60, statT = 0;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } });
  io.observe(canvas);
  function render() { renderer.info.reset(); effect.render(scene, camera); }
  function loop(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    update(dt); render();
    fpsAvg = lerp(fpsAvg, 1 / Math.max(dt, 1e-3), 0.05);
    if ((statT += dt) > 0.5) { statT = 0; onEvent({ type: 'stats', fps: fpsAvg, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }); }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  setTimeout(() => { if (!healed && hTarget < 0.5) say(plant.lines?.sick, 3200); }, 1200);

  function dispose() {
    cancelAnimationFrame(raf); raf = 0; visible = false;
    ro.disconnect(); io.disconnect(); clearTimeout(bubbleTimer);
    canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp);
    scene.traverse((o) => {
      o.geometry?.dispose();
      for (const m of [].concat(o.material || [])) { for (const v of Object.values(m)) if (v?.isTexture) v.dispose(); m.dispose(); }
    });
    for (const v of Object.values(tex)) v.dispose();
    renderer.dispose();
  }

  return {
    answer, react: doReact, heal, reset, dispose, say,
    setHealth(v) { healing = null; healed = false; hTarget = clamp(v, 0, 1); right = Math.round(hTarget * rightNeeded); },
    setRightNeeded(n) { rightNeeded = n; },
    get healed() { return healed; },
    debug: {
      kit, inst,
      /** Hold the turntable at an angle (radians) to check side views; 0 releases it. */
      turn(a = 0) { turn.set(a); drag.last = a ? 1e9 : -99; },
      step(sec = 1) { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) update(1 / 60); render(); return n; },
      state: () => ({ hTarget, h: +hCol.x.toFixed(3), hp: +hPose.x.toFixed(3), right, rightNeeded, healing: !!healing, healed, react: react?.type ?? null }),
      stats: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }),
      particles: () => systems.map((s) => s.alive()),
    },
  };
}
