/* Newborn & Pediatric Hatchlings: the 3D hatchery.

   Eggs on velvet cushions along a shelf, each the client's own egg painting
   made solid, and the hatching: wobbles, glowing cracks running over the
   shell, a burst of light, the shell breaking into real pieces, and her baby
   monster popping out.

   How her flat painting becomes an egg (eggFrom):
     - the egg's outline is read from the painting, row by row, and turned
       about its middle (a lathe), so the solid egg has exactly her silhouette;
     - the painting is projected onto it from the front, so seen face on it is
       her picture, and turned it rounds away like a real shell;
     - whatever sticks out of the egg (a katana, a wafer, a tassel) is not part
       of that solid: it is kept as a cut-out at the egg's middle, and moves,
       rocks and falls with it.
   The cracks and the broken pieces come from one pattern (cells on the egg,
   seeded per egg), so the shell breaks exactly where it cracked.

   No UI and no framework: mountHatchery() takes a canvas and the creatures and
   returns a small controller, so the same code can later run inside the game's
   React page. For tests, window.__hatch drives time by hand (the preview pane
   throttles animation frames). */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as toonKit from './toon.js';

const V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashId = (id) => [...id].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

/** A damped spring: kick it, and it rings back to rest. */
class Spring {
  constructor(k = 180, c = 12) {
    this.k = k;
    this.c = c;
    this.x = 0;
    this.v = 0;
  }
  kick(v) {
    this.v += v;
  }
  update(dt) {
    this.v += (-this.k * this.x - this.c * this.v) * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

/* =========================================================================
   Canvas textures (no image files besides her art)
   ========================================================================= */
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const radialTex = (stops) =>
  canvasTex(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    for (const [o, c] of stops) r.addColorStop(o, c);
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
function wallTex() {
  return canvasTex(1024, 512, (g, w, h) => {
    const bg = g.createRadialGradient(w / 2, h * 0.55, 30, w / 2, h * 0.55, w * 0.62);
    bg.addColorStop(0, '#3a2358');
    bg.addColorStop(0.5, '#221436');
    bg.addColorStop(1, '#0d0715');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    // stone courses
    const r = rng(7);
    g.strokeStyle = 'rgba(10,4,20,0.35)';
    g.lineWidth = 2;
    for (let y = 0, row = 0; y < h; y += 26, row++) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
      for (let x = (row % 2) * 30; x < w; x += 52 + r() * 22) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + 26);
        g.stroke();
      }
    }
    // two tall arched windows, moonlit
    for (const cx of [w * 0.5 - 190, w * 0.5 + 190]) {
      const ww = 84, wh = 150, top = 140;
      g.save();
      g.beginPath();
      g.moveTo(cx - ww / 2, top + wh);
      g.lineTo(cx - ww / 2, top + ww / 2);
      g.arc(cx, top + ww / 2, ww / 2, Math.PI, 0);
      g.lineTo(cx + ww / 2, top + wh);
      g.closePath();
      const m = g.createLinearGradient(0, top, 0, top + wh);
      m.addColorStop(0, '#6f7fd6');
      m.addColorStop(1, '#2b2d6e');
      g.fillStyle = m;
      g.fill();
      g.clip();
      g.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 14; i++) g.fillRect(cx - ww / 2 + r() * ww, top + r() * wh * 0.8, 2, 2);
      g.strokeStyle = 'rgba(20,10,40,0.85)';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(cx, top);
      g.lineTo(cx, top + wh);
      g.moveTo(cx - ww / 2, top + wh * 0.55);
      g.lineTo(cx + ww / 2, top + wh * 0.55);
      g.stroke();
      g.restore();
      g.strokeStyle = '#1a0f2a';
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(cx - ww / 2, top + wh);
      g.lineTo(cx - ww / 2, top + ww / 2);
      g.arc(cx, top + ww / 2, ww / 2, Math.PI, 0);
      g.lineTo(cx + ww / 2, top + wh);
      g.stroke();
    }
    const v = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
  });
}
function woodTex() {
  const t = canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#5a3520';
    g.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = `rgba(${r() < 0.5 ? '30,16,8' : '120,74,40'},${0.15 + r() * 0.25})`;
      g.lineWidth = 0.6 + r() * 1.6;
      g.beginPath();
      const y = r() * h;
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 2 + (r() - 0.5) * 2);
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function raysTex() {
  return canvasTex(512, 512, (g, w, h) => {
    g.translate(w / 2, h / 2);
    const r = rng(11);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + r() * 0.2, wd = 0.05 + r() * 0.07;
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, w / 2);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.35)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, w / 2, a - wd, a + wd);
      g.closePath();
      g.fill();
    }
  }, false);
}

/* =========================================================================
   Her egg painting, measured
   ========================================================================= */
/** The egg's outline, row by row: its middle, top, bottom and half-width per row. */
function measure(img) {
  const H = 360, W = Math.round((img.width * H) / img.height);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, W, H);
  const a = g.getImageData(0, 0, W, H).data;
  const on = (x, y) => x >= 0 && x < W && a[(y * W + x) * 4 + 3] > 128;
  let sx = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (on(x, y)) (sx += x), n++;
  const run = (y, x) => {
    if (!on(x, y)) return null;
    let L = x, R = x;
    while (on(L - 1, y)) L--;
    while (on(R + 1, y)) R++;
    return [L, R];
  };
  // the middle: the median of each row's middle, over the body's central rows (one-sided parts,
  // like a sword along one flank, pull a few rows off; the median ignores them)
  const c0 = Math.round(sx / n);
  const mids = [];
  for (let y = Math.round(H * 0.3); y < H * 0.8; y++) {
    const r = run(y, c0);
    if (r) mids.push((r[0] + r[1]) / 2);
  }
  mids.sort((p, q) => p - q);
  const cx = mids[mids.length >> 1] ?? c0;
  const cxi = Math.round(cx);
  // each row's half-width: the nearer side, so a part sticking out of one flank is not taken for shell
  const hw = new Float32Array(H);
  for (let y = 0; y < H; y++) {
    const r = run(y, cxi);
    hw[y] = r ? Math.max(0, Math.min(cx - r[0], r[1] - cx)) : 0;
  }
  // the body is the longest stretch of rows that are solid at the middle
  let top = 0, bottom = 0;
  for (let y = 0, s = -1; y <= H; y++) {
    if (y < H && hw[y] > 1.5) {
      if (s < 0) s = y;
    } else if (s >= 0) {
      if (y - 1 - s > bottom - top) (top = s), (bottom = y - 1);
      s = -1;
    }
  }
  // steady the outline: a median, then an average, over a few rows
  const med = new Float32Array(H);
  for (let y = 0; y < H; y++) {
    const w = [];
    for (let k = -3; k <= 3; k++) w.push(hw[clamp(y + k, top, bottom)]);
    w.sort((p, q) => p - q);
    med[y] = w[3];
  }
  for (let y = top; y <= bottom; y++) {
    let s = 0;
    for (let k = -2; k <= 2; k++) s += med[clamp(y + k, top, bottom)];
    hw[y] = s / 5;
  }
  return { W, H, cx, top, bottom, hw, img };
}

/* =========================================================================
   Cracks and pieces: one pattern of cells over the egg
   ========================================================================= */
const N_SEEDS = 16;
/** The cell pattern's wobble, so cracks zig-zag. The same sum is in the shader (warp). */
function warp(d) {
  const w = new V3(
    Math.sin(d.x * 5.1 + d.y * 1.7 + d.z * 3.3 + 1.3),
    Math.sin(d.x * 2.3 + d.y * 6.1 + d.z * 1.1 + 2.1),
    Math.sin(d.x * 3.7 + d.y * 2.9 + d.z * 5.9 + 0.7),
  );
  return d.clone().addScaledVector(w, 0.1).normalize();
}
const WARP_GLSL = /* glsl */ `
vec3 warp(vec3 d) {
  vec3 w = vec3(
    sin(d.x * 5.1 + d.y * 1.7 + d.z * 3.3 + 1.3),
    sin(d.x * 2.3 + d.y * 6.1 + d.z * 1.1 + 2.1),
    sin(d.x * 3.7 + d.y * 2.9 + d.z * 5.9 + 0.7));
  return normalize(d + 0.1 * w);
}`;

/** The egg's shell: lit gently over her painting, with the cracks, glowing, run across it. */
function shellMaterial(map, U) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, ...U },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vLocal; varying vec3 vN; varying vec3 vW;
      void main() {
        vUv = uv;
        vLocal = position;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform vec3 uKey, uRim, uGlowCol, uC, uK, uOrigin;
      uniform vec3 uSeeds[${N_SEEDS}];
      uniform float uCrack, uGlow, uHover, uToon;
      varying vec2 vUv; varying vec3 vLocal; varying vec3 vN; varying vec3 vW;
      ${WARP_GLSL}
      void main() {
        vec3 base = texture2D(map, vUv).rgb;
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        vec3 V = normalize(cameraPosition - vW);
        float lam = max(dot(n, uKey), 0.0);
        float fr = pow(1.0 - max(dot(n, V), 0.0), 2.4);
        float hl = max(dot(n, normalize(uKey + V)), 0.0);
        vec3 col;
        if (uToon > 0.5) {
          // a modelled egg: flat cel bands and a hard glint, the garden's toon look
          col = base * (lam > 0.55 ? 1.0 : lam > 0.18 ? 0.84 : 0.66);
          col += uRim * fr * (0.1 + 0.5 * uHover);
        } else {
          // her painting carries its own light; this only rounds it, and gives it a glaze
          col = base * (0.74 + 0.3 * lam);
          col += uRim * fr * (0.22 + 0.55 * uHover);
          col += vec3(1.0) * pow(hl, 70.0) * 0.22;
        }
        if (uCrack > 0.0) {
          vec3 q = warp(normalize((vLocal - uC) * uK));
          float d1 = -2.0, d2 = -2.0;
          for (int i = 0; i < ${N_SEEDS}; i++) {
            float d = dot(q, uSeeds[i]);
            if (d > d1) { d2 = d1; d1 = d; } else if (d > d2) { d2 = d; }
          }
          float e = d1 - d2;
          // how far the cracks have run, from where they started
          float g = acos(clamp(dot(q, uOrigin), -1.0, 1.0)) / 3.14159;
          float reach = smoothstep(uCrack * 1.08, uCrack * 1.08 - 0.05, g);
          float line = smoothstep(0.02, 0.005, e) * reach;
          float lip = smoothstep(0.045, 0.0, e) * reach;
          col *= 1.0 - 0.45 * lip;
          col += uGlowCol * (line * (0.8 + 3.0 * uGlow) + exp(-e / 0.045) * reach * 0.4 * uGlow);
        }
        col += uGlowCol * uGlow * 0.06;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/** One egg: its solid shell, the parts that stick out, its broken pieces, and its hatchling. */
/** An egg outline given by a model instead of read from a picture: profile(t) is the half-width at
    height t (0 bottom .. 1 top), as a fraction of the widest; aspect is width over height. */
function profiled({ profile, aspect = 0.78 }) {
  const H = 360, W = Math.round(H * aspect), hw = new Float32Array(H);
  for (let y = 0; y < H; y++) hw[y] = Math.max(0, profile(1 - y / (H - 1))) * (W / 2);
  return { W, H, cx: W / 2, top: 0, bottom: H - 1, hw, img: null };
}

async function eggFrom(c, tex, monsterTex, o) {
  const m = o.model?.profile ? profiled(o.model) : measure(tex.image);
  const EGG_H = o.eggH;
  const s = EGG_H / (m.bottom - m.top); // world units per measured pixel
  const RINGS = 90, SEGS = 104;
  let rMax = 0;
  for (let y = m.top; y <= m.bottom; y++) rMax = Math.max(rMax, m.hw[y] * s);

  // ---- the shell: rings from the bottom up, closed at both ends ----------------
  const rows = [{ y: 0, r: 0, py: m.bottom }];
  for (let j = 0; j <= RINGS; j++) {
    const py = m.bottom - ((m.bottom - m.top) * j) / RINGS;
    const y0 = Math.floor(py), f = py - y0;
    const hw = m.hw[clamp(y0, m.top, m.bottom)] * (1 - f) + m.hw[clamp(y0 + 1, m.top, m.bottom)] * f;
    rows.push({ y: (m.bottom - py) * s, r: hw * s * 0.985, py });
  }
  rows.push({ y: (m.bottom - m.top) * s, r: 0, py: m.top });
  const pos = [], uv = [], idx = [];
  for (const row of rows) {
    for (let i = 0; i <= SEGS; i++) {
      const a = -Math.PI + (TAU * i) / SEGS; // the seam at the back
      const x = row.r * Math.sin(a), z = row.r * Math.cos(a);
      pos.push(x, row.y, z);
      // her painting is projected from the front (its pixel straight behind this point); a
      // modelled egg is painted all the way round instead
      if (o.model) uv.push((a + Math.PI) / TAU, row.y / EGG_H);
      else uv.push((m.cx + x / s) / m.W, 1 - row.py / m.H);
    }
  }
  const stride = SEGS + 1;
  for (let j = 0; j < rows.length - 1; j++)
    for (let i = 0; i < SEGS; i++) {
      const a = j * stride + i, b = a + 1, cc = a + stride, d = cc + 1;
      idx.push(a, b, d, a, d, cc);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // (the seam's two copies of each point share one normal, or a line shows down the back)
  const nrm = geo.attributes.normal;
  for (let j = 0; j < rows.length; j++) {
    const a = j * stride, b = a + SEGS;
    const nx = nrm.getX(a) + nrm.getX(b), ny = nrm.getY(a) + nrm.getY(b), nz = nrm.getZ(a) + nrm.getZ(b);
    const l = Math.hypot(nx, ny, nz) || 1;
    nrm.setXYZ(a, nx / l, ny / l, nz / l);
    nrm.setXYZ(b, nx / l, ny / l, nz / l);
  }

  // ---- the cell pattern ----------------------------------------------------------
  const R = rng(hashId(c.id));
  const seeds = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N_SEEDS; i++) {
    const y = 1 - (2 * (i + 0.5)) / N_SEEDS, r = Math.sqrt(1 - y * y), a = golden * i + R() * 0.6;
    seeds.push(new V3(r * Math.cos(a), y, r * Math.sin(a)).addScaledVector(new V3(R() - 0.5, R() - 0.5, R() - 0.5), 0.35).normalize());
  }
  // the cracks start on the line between the two cells nearest the front, a little above the middle
  const front = new V3(0.15, 0.35, 1).normalize();
  const near = [...seeds].sort((p, q) => q.dot(front) - p.dot(front));
  const origin = near[0].clone().add(near[1]).normalize();
  const C = new V3(0, EGG_H / 2, 0), K = new V3(1 / rMax, 2 / EGG_H, 1 / rMax);
  const cellOf = (p) => {
    const q = warp(p.clone().sub(C).multiply(K).normalize());
    let best = 0, bd = -2;
    seeds.forEach((sd, i) => {
      const d = q.dot(sd);
      if (d > bd) (bd = d), (best = i);
    });
    return best;
  };

  const U = {
    uKey: { value: new V3(0.45, 0.62, 0.65).normalize() },
    uRim: { value: new THREE.Color('#ffe6b0') },
    uGlowCol: { value: new THREE.Color(c.glow).multiplyScalar(1.0) },
    uC: { value: C },
    uK: { value: K },
    uOrigin: { value: origin },
    uSeeds: { value: seeds },
    uCrack: { value: 0 },
    uGlow: { value: 0 },
    uHover: { value: 0 },
    uToon: { value: o.model ? 1 : 0 },
  };
  const shellMap = o.model ? toonKit.canvasTex(2048, 1024, o.model.eggPaint) : tex;
  const shellMat = shellMaterial(shellMap, U);
  const body = new THREE.Mesh(geo, shellMat);
  if (o.model) toonKit.ink(body);

  // ---- the broken pieces: each cell's patch of shell, with an inside and a thickness ----
  const P = geo.attributes.position, UVs = geo.attributes.uv, NN = geo.attributes.normal;
  const tris = [];
  const cellTris = Array.from({ length: N_SEEDS }, () => []);
  const tmp = new V3(), ta = new V3(), tb = new V3(), tc = new V3();
  for (let t = 0; t < idx.length; t += 3) {
    ta.fromBufferAttribute(P, idx[t]);
    tb.fromBufferAttribute(P, idx[t + 1]);
    tc.fromBufferAttribute(P, idx[t + 2]);
    const cell = cellOf(tmp.copy(ta).add(tb).add(tc).divideScalar(3));
    tris.push(cell);
    cellTris[cell].push(t / 3);
  }
  // which triangle lies across each edge
  const across = new Map();
  for (let t = 0; t < idx.length / 3; t++)
    for (let e = 0; e < 3; e++) {
      const a = idx[t * 3 + e], b = idx[t * 3 + ((e + 1) % 3)];
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      const l = across.get(key);
      if (l) l.push(t);
      else across.set(key, [t]);
    }
  const THICK = 0.045;
  const innerMat = new THREE.MeshStandardMaterial({ color: c.shell, roughness: 0.85, side: THREE.DoubleSide, emissive: new THREE.Color(c.glow), emissiveIntensity: 0.35 });
  const pieces = [];
  for (let k = 0; k < N_SEEDS; k++) {
    if (!cellTris[k].length) continue;
    const op = [], on = [], ou = [], ip = [], inn = [];
    const pt = (i) => new V3().fromBufferAttribute(P, i);
    const nr = (i) => new V3().fromBufferAttribute(NN, i);
    const inner = (i) => pt(i).addScaledVector(nr(i), -THICK);
    const push3 = (arr, v) => arr.push(v.x, v.y, v.z);
    for (const t of cellTris[k]) {
      const v = [idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]];
      for (const i of v) {
        push3(op, pt(i));
        push3(on, nr(i));
        ou.push(UVs.getX(i), UVs.getY(i));
      }
      for (const i of [v[0], v[2], v[1]]) {
        push3(ip, inner(i));
        push3(inn, nr(i).negate());
      }
      // where the neighbour across an edge is another piece (or none), a wall: the shell's thickness
      for (let e = 0; e < 3; e++) {
        const a = v[e], b = v[(e + 1) % 3];
        const l = across.get(a < b ? `${a},${b}` : `${b},${a}`);
        const other = l?.find((x) => x !== t);
        if (other !== undefined && tris[other] === k) continue;
        const A = pt(a), B = pt(b), Ai = inner(a), Bi = inner(b);
        const wn = new V3().subVectors(B, A).cross(nr(a)).normalize();
        for (const q of [A, Ai, B, B, Ai, Bi]) {
          push3(ip, q);
          push3(inn, wn);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    const all = [...op, ...ip];
    g.setAttribute('position', new THREE.Float32BufferAttribute(all, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute([...on, ...inn], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([...ou, ...new Array((ip.length / 3) * 2).fill(0)], 2));
    g.addGroup(0, op.length / 3, 0);
    g.addGroup(op.length / 3, ip.length / 3, 1);
    // pivot at the piece's own middle, so it tumbles about itself
    const mid = new V3();
    for (let i = 0; i < op.length; i += 3) mid.add(new V3(op[i], op[i + 1], op[i + 2]));
    mid.divideScalar(op.length / 3);
    g.translate(-mid.x, -mid.y, -mid.z);
    const mesh = new THREE.Mesh(g, [shellMat, innerMat]);
    mesh.visible = false;
    if (o.model) toonKit.ink(mesh);
    pieces.push({ mesh, home: mid, dir: mid.clone().sub(C).normalize(), vel: new V3(), spin: new V3(), rest: false });
  }

  // ---- a modelled egg: its parts in relief, and its hatchling --------------------------
  if (o.model) {
    /** A point on the shell's front at (x, y) (as seen face on), lifted along its normal. */
    const at = (x, y, lift = 0) => {
      const R = (yy) => {
        let i = 1;
        while (i < rows.length - 1 && rows[i].y < yy) i++;
        const a0 = rows[i - 1], a1 = rows[i], f = clamp((yy - a0.y) / (a1.y - a0.y || 1), 0, 1);
        return a0.r + (a1.r - a0.r) * f;
      };
      // (never a zero radius: at the egg's tips it would make the normal NaN)
      const r = Math.max(R(y), 1e-3), dr = (R(y + 0.01) - R(y - 0.01)) / 0.02;
      const z = Math.sqrt(Math.max(1e-6, r * r - x * x));
      const n = new V3(x / r, -dr, z / r).normalize();
      return { p: new V3(x, y, z).addScaledVector(n, lift), n };
    };
    const extras = o.model.eggProps(o.kit, { at, H: EGG_H, rMax });
    for (const x of extras) toonKit.ink(x);
    const mon = o.model.monster(o.kit);
    mon.group.visible = false;
    return { m, body, extras: homes(extras), pieces, monster: mon.group, model: mon, flat: false, U, innerMat, C, rMax, origin, EGG_H };
  }

  // ---- what sticks out: the painting, less the shell, on a card through the egg's middle ----
  const full = tex.image, k = full.width / m.W;
  const ec = document.createElement('canvas');
  ec.width = full.width;
  ec.height = full.height;
  const eg = ec.getContext('2d');
  eg.drawImage(full, 0, 0);
  for (let y = m.top; y <= m.bottom; y++) {
    const hw = m.hw[y] * 0.985;
    eg.clearRect((m.cx - hw) * k, y * k - 0.5, 2 * hw * k, k + 1);
  }
  const extraTex = new THREE.CanvasTexture(ec);
  extraTex.colorSpace = THREE.SRGBColorSpace;
  extraTex.anisotropy = 4;
  const extra = new THREE.Mesh(
    new THREE.PlaneGeometry(m.W * s, m.H * s),
    new THREE.MeshBasicMaterial({ map: extraTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }),
  );
  extra.position.set((m.W / 2 - m.cx) * s, (m.bottom - m.H / 2) * s, 0);

  // ---- the hatchling: her painting, standing ----------------------------------------
  const mi = monsterTex.image, mh = o.monsterH, mw = (mh * mi.width) / mi.height;
  const mg = new THREE.PlaneGeometry(mw, mh);
  mg.translate(0, mh / 2, 0);
  const monster = new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ map: monsterTex, transparent: true, alphaTest: 0.05, depthWrite: false }));
  monster.renderOrder = 5;
  monster.visible = false;

  return { m, body, extras: homes([extra]), pieces, monster, model: null, flat: true, U, innerMat, C, rMax, origin, EGG_H };
}
/** Notes where each part sits, so a hatched egg can be put back together. */
function homes(list) {
  for (const x of list) x.userData.home = { p: x.position.clone(), q: x.quaternion.clone(), s: x.scale.clone() };
  return list;
}

/* =========================================================================
   Sparkles, confetti, rays
   ========================================================================= */
class Sparkles {
  constructor(max) {
    this.max = max;
    this.p = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.fade = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.age = new Float32Array(max).fill(1e9);
    this.life = new Float32Array(max).fill(1);
    this.drag = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.base = new Float32Array(max);
    this.next = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3));
    g.setAttribute('aCol', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aFade', new THREE.BufferAttribute(this.fade, 1));
    this.points = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: { uPx: { value: 400 } },
        vertexShader: /* glsl */ `
          attribute vec3 aCol; attribute float aSize; attribute float aFade;
          varying vec3 vCol; varying float vFade;
          uniform float uPx;
          void main() {
            vCol = aCol; vFade = aFade;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uPx / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vCol; varying float vFade;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float r = length(c);
            // a four-pointed twinkle: a soft core and two thin crossing beams
            float core = exp(-r * r * 60.0);
            float beams = max(0.0, 1.0 - abs(c.x) * 14.0) * max(0.0, 1.0 - abs(c.y) * 2.2)
                        + max(0.0, 1.0 - abs(c.y) * 14.0) * max(0.0, 1.0 - abs(c.x) * 2.2);
            float a = (core + beams * 0.7) * vFade;
            if (a < 0.01) discard;
            gl_FragColor = vec4(vCol * a, a);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
  }
  emit(at, n, { speed = 1.5, up = 0.5, spread = 0.2, color = '#ffffff', size = 0.22, life = 1.2, drag = 1.5, grav = -0.6, hdr = 2.2 } = {}) {
    const cols = [].concat(color).map((x) => new THREE.Color(x).multiplyScalar(hdr));
    for (let i = 0; i < n; i++) {
      const j = this.next;
      this.next = (this.next + 1) % this.max;
      const d = new V3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      this.p[j * 3] = at.x + d.x * spread;
      this.p[j * 3 + 1] = at.y + d.y * spread;
      this.p[j * 3 + 2] = at.z + d.z * spread;
      const sp = speed * (0.4 + Math.random() * 0.8);
      this.vel[j * 3] = d.x * sp;
      this.vel[j * 3 + 1] = d.y * sp + up;
      this.vel[j * 3 + 2] = d.z * sp;
      const cl = cols[(Math.random() * cols.length) | 0];
      this.col[j * 3] = cl.r;
      this.col[j * 3 + 1] = cl.g;
      this.col[j * 3 + 2] = cl.b;
      this.base[j] = size * (0.5 + Math.random());
      this.age[j] = 0;
      this.life[j] = life * (0.6 + Math.random() * 0.8);
      this.drag[j] = drag;
      this.grav[j] = grav;
    }
  }
  update(dt, t) {
    for (let j = 0; j < this.max; j++) {
      const a = (this.age[j] += dt), L = this.life[j];
      if (a >= L) {
        this.fade[j] = 0;
        this.size[j] = 0;
        continue;
      }
      const f = Math.exp(-this.drag[j] * dt);
      this.vel[j * 3] *= f;
      this.vel[j * 3 + 1] = this.vel[j * 3 + 1] * f + this.grav[j] * dt;
      this.vel[j * 3 + 2] *= f;
      this.p[j * 3] += this.vel[j * 3] * dt;
      this.p[j * 3 + 1] += this.vel[j * 3 + 1] * dt;
      this.p[j * 3 + 2] += this.vel[j * 3 + 2] * dt;
      const x = a / L;
      this.fade[j] = smooth(0, 0.08, x) * (1 - smooth(0.55, 1, x)) * (0.75 + 0.25 * Math.sin(t * 22 + j));
      this.size[j] = this.base[j];
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = g.attributes.aCol.needsUpdate = g.attributes.aSize.needsUpdate = g.attributes.aFade.needsUpdate = true;
  }
}

class Confetti {
  constructor(max) {
    this.max = max;
    const g = new THREE.PlaneGeometry(0.07, 0.12);
    this.mesh = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.bits = Array.from({ length: max }, () => ({ p: new V3(), v: new V3(), r: new V3(), w: new V3(), age: 1e9, life: 1 }));
    const c = new THREE.Color('#ffffff');
    for (let i = 0; i < max; i++) this.mesh.setColorAt(i, c);
    this.next = 0;
    this.o = new THREE.Object3D();
    this.hide();
  }
  hide() {
    this.o.scale.setScalar(0);
    this.o.updateMatrix();
    for (let i = 0; i < this.max; i++) this.mesh.setMatrixAt(i, this.o.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  burst(at, n, colors) {
    const cols = colors.map((x) => new THREE.Color(x));
    for (let i = 0; i < n; i++) {
      const j = this.next;
      this.next = (this.next + 1) % this.max;
      const b = this.bits[j];
      const a = Math.random() * TAU, sp = 1.6 + Math.random() * 2.4;
      b.p.copy(at);
      b.v.set(Math.cos(a) * sp * 0.8, 3.2 + Math.random() * 2.6, Math.sin(a) * sp * 0.5 + 0.6);
      b.r.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU);
      b.w.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8);
      b.age = 0;
      b.life = 2.6 + Math.random() * 1.4;
      this.mesh.setColorAt(j, cols[(Math.random() * cols.length) | 0]);
    }
    this.mesh.instanceColor.needsUpdate = true;
  }
  update(dt, t, floor) {
    let any = false;
    this.bits.forEach((b, i) => {
      b.age += dt;
      if (b.age >= b.life) {
        if (b.age - dt < b.life) {
          this.o.scale.setScalar(0);
          this.o.updateMatrix();
          this.mesh.setMatrixAt(i, this.o.matrix);
          any = true;
        }
        return;
      }
      any = true;
      b.v.multiplyScalar(Math.exp(-2.2 * dt));
      b.v.y -= 3.4 * dt;
      b.p.addScaledVector(b.v, dt);
      b.p.x += Math.sin(t * 3 + i) * 0.25 * dt;
      if (b.p.y < floor) (b.p.y = floor), b.v.set(0, 0, 0), b.w.multiplyScalar(0.9);
      b.r.addScaledVector(b.w, dt);
      this.o.position.copy(b.p);
      this.o.rotation.set(b.r.x, b.r.y, b.r.z);
      this.o.scale.setScalar(1 - smooth(0.8, 1, b.age / b.life));
      this.o.updateMatrix();
      this.mesh.setMatrixAt(i, this.o.matrix);
    });
    if (any) this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/* =========================================================================
   The hatchery
   ========================================================================= */
export async function mountHatchery(canvas, list, hooks = {}) {
  // the modelled creatures' code first; one that fails to load is left off the shelf, not the page
  const loaded = await Promise.all(
    list.map((c) =>
      c.model
        ? import(`./models/${c.model}.js`).then(
            (m) => m.default,
            (err) => console.warn(`hatchery: ${c.id} left out, its model did not load`, err),
          )
        : null,
    ),
  );
  const creatures = list.filter((_, i) => loaded[i] !== undefined);
  const models = loaded.filter((x) => x !== undefined);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#120a1c');
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // A pixel the burst's light pushed past what the buffer holds (on some graphics cards) becomes
  // not-a-number, and the bloom spreads it over the screen as black: such pixels are dropped and
  // the brightest held to a ceiling before the bloom sees them.
  composer.addPass(
    new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          if (any(isnan(c)) || any(isinf(c))) c = vec4(0.0, 0.0, 0.0, 1.0);
          gl_FragColor = vec4(clamp(c.rgb, 0.0, 24.0), c.a);
        }`,
    }),
  );
  // (only light brighter than white blooms: the cracks, the flames, the sparkles, never her colours)
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.45, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- the room ---------------------------------------------------------------------
  scene.add(new THREE.HemisphereLight('#c8b6ff', '#2a1430', 1.1));
  const key = new THREE.DirectionalLight('#ffe2c0', 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9a7bff', 1.2);
  rim.position.set(-4, 3, -3);
  scene.add(rim);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 21), new THREE.MeshBasicMaterial({ map: wallTex() }));
  wall.position.set(0, 1.5, -5);
  scene.add(wall);

  const SLOT = 3.0;
  const wood = woodTex();
  wood.repeat.set(3, 1);
  const shelfW = SLOT * creatures.length + 1.6;
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(shelfW, 0.28, 2.0), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.75 }));
  shelf.position.set(0, -0.14, 0);
  scene.add(shelf);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(shelfW + 0.1, 0.1, 0.12), new THREE.MeshStandardMaterial({ color: '#c99a3d', metalness: 0.8, roughness: 0.35 }));
  lip.position.set(0, -0.08, 1.02);
  scene.add(lip);
  for (const x of [-shelfW / 2 + 0.5, shelfW / 2 - 0.5]) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 1.2), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.8 }));
    br.position.set(x, -0.7, -0.3);
    scene.add(br);
  }

  // candles floating behind, as in the hatchery she showed
  const flameTex = radialTex([
    [0, 'rgba(255,255,240,1)'],
    [0.25, 'rgba(255,214,120,0.9)'],
    [0.6, 'rgba(255,140,40,0.25)'],
    [1, 'rgba(255,120,30,0)'],
  ]);
  const candles = [];
  const cr = rng(5);
  for (let i = 0, n = Math.max(9, Math.round(shelfW / 1.6)); i < n; i++) {
    const g = new THREE.Group();
    const h = 0.35 + cr() * 0.3;
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, h, 14), new THREE.MeshStandardMaterial({ color: '#f1e4c8', roughness: 0.6, emissive: '#ffb060', emissiveIntensity: 0.12 }));
    wax.position.y = h / 2;
    g.add(wax);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: new THREE.Color(3, 2.2, 1.2), blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.position.y = h + 0.09;
    fl.scale.set(0.16, 0.28, 1);
    g.add(fl);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: new THREE.Color(0.9, 0.55, 0.25), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.y = h + 0.09;
    halo.scale.set(1.1, 1.1, 1);
    g.add(halo);
    g.position.set((i / (n - 1) - 0.5) * Math.max(13, shelfW) + (cr() - 0.5) * 0.8, 2.6 + cr() * 1.6, -2.2 - cr() * 1.6);
    scene.add(g);
    candles.push({ g, fl, halo, y0: g.position.y, ph: cr() * TAU });
  }

  // sparkles, and the dust in the candlelight
  const sparkles = new Sparkles(700);
  scene.add(sparkles.points);
  const confetti = new Confetti(220);
  scene.add(confetti.mesh);

  const rays = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: raysTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  rays.renderOrder = 1;
  scene.add(rays);
  const flash = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: radialTex([
        [0, 'rgba(255,255,255,1)'],
        [0.3, 'rgba(255,255,255,0.6)'],
        [1, 'rgba(255,255,255,0)'],
      ]),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flash.renderOrder = 12;
  scene.add(flash);
  const hatchLight = new THREE.PointLight('#ffffff', 0, 9, 1.6);
  scene.add(hatchLight);

  const shadowTex = radialTex([
    [0, 'rgba(0,0,0,0.6)'],
    [0.6, 'rgba(0,0,0,0.25)'],
    [1, 'rgba(0,0,0,0)'],
  ]);

  // ---- the eggs -----------------------------------------------------------------------
  const loader = new THREE.TextureLoader();
  const load = async (u) => {
    const t = await loader.loadAsync(u);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const velvet = new THREE.MeshPhysicalMaterial({ color: '#6e1430', roughness: 0.8, sheen: 1, sheenColor: new THREE.Color('#ff7a9c'), sheenRoughness: 0.45 });
  const gold = new THREE.MeshStandardMaterial({ color: '#d9a441', metalness: 0.85, roughness: 0.3 });
  const CUSHION_TOP = 0.3;

  const slots = await Promise.all(
    creatures.map(async (c, i) => {
      // a modelled creature (models/<id>.js), or her two pictures
      const model = models[i];
      const shape = model ? model.shape : c.egg;
      const [eggTex, monTex] = await Promise.all([shape ? load(shape) : null, model ? null : load(c.monster)]);
      const e = await eggFrom(c, eggTex, monTex, { eggH: 1.75, monsterH: 1.9, model, kit: { THREE, ...toonKit } });
      const x = (i - (creatures.length - 1) / 2) * SLOT;

      const cushion = new THREE.Group();
      const pad = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), velvet);
      pad.scale.set(0.95, 0.24, 0.8);
      pad.position.y = 0.17;
      cushion.add(pad);
      for (const [sx, sz] of [[-0.8, 0.55], [0.8, 0.55], [-0.8, -0.55], [0.8, -0.55]]) {
        const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 10), gold);
        t.position.set(sx, 0.1, sz);
        t.rotation.z = sx * 0.4;
        cushion.add(t);
      }
      cushion.position.x = x;
      scene.add(cushion);

      // the egg rocks on its base, so it hangs from a pivot at the bottom
      const rock = new THREE.Group();
      rock.position.set(x, CUSHION_TOP - 0.06, 0);
      const turn = new THREE.Group();
      rock.add(turn);
      turn.add(e.body, ...e.extras);
      for (const p of e.pieces) turn.add(p.mesh);
      scene.add(rock);

      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, CUSHION_TOP + 0.002, 0.02);
      shadow.scale.set(e.rMax * 2.4, e.rMax * 1.6, 1);
      scene.add(shadow);

      const mon = new THREE.Group();
      mon.position.set(x, CUSHION_TOP - 0.05, 0.05);
      mon.add(e.monster);
      scene.add(mon);
      for (const o of [e.body, ...e.extras, e.monster]) o.userData.slot = i;

      return {
        c, i, x, e, rock, turn, mon, shadow,
        state: 'idle', T: 0, crack: 0, glow: 0, hover: 0, lift: 0,
        wiggleAt: 2 + Math.random() * 4, wiggle: new Spring(90, 5),
        pop: new Spring(160, 9), squash: new Spring(220, 10),
        drag: 0, puffs: 0, burst: false, told: false, D: -1,
      };
    }),
  );

  // ---- the camera -------------------------------------------------------------------------
  const view = { focus: -1, card: false, page: 0 };
  const cam = { pos: new V3(0, 3, 14), tgt: new V3(0, 1, 0) };
  const want = { pos: new V3(), tgt: new V3() };
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const narrow = () => camera.aspect < 0.85;
  const perPage = () => (narrow() ? 1 : 3);
  const pages = () => Math.ceil(slots.length / perPage());
  function aim() {
    const A = camera.aspect;
    if (view.focus < 0) {
      // a page of the shelf: three eggs at a time, or one on a narrow screen
      const per = perPage(), on = slots.slice(view.page * per, view.page * per + per);
      const fitW = narrow() ? SLOT * 1.35 : SLOT * Math.min(per, slots.length) + 0.6;
      const d = Math.max((fitW / 2) / (tanH * A), 3.4 / tanH);
      const cx = on.reduce((a, s) => a + s.x, 0) / Math.max(1, on.length);
      want.tgt.set(cx, 1.15, 0);
      want.pos.set(cx, 1.15 + d * 0.2, d);
    } else {
      const s = slots[view.focus];
      const visH = narrow() ? (view.card ? 4.9 : 4.4) : view.card ? 3.9 : 3.3;
      let d = visH / 2 / tanH;
      d = Math.max(d, (narrow() ? 2.6 : 3.2) / 2 / (tanH * A));
      const visW = 2 * d * tanH * A;
      // with the card open the creature steps aside: left of a side card, above a bottom one
      const sx = view.card && !narrow() ? visW * 0.2 : 0;
      // (on a phone the card covers the lower half: the creature stands in the upper, under the title)
      const sy = view.card && narrow() ? -visH * 0.195 : 0;
      want.tgt.set(s.x + sx, 1.12 + sy, 0);
      want.pos.set(s.x + sx, 1.12 + sy + d * 0.16, d);
    }
  }

  // ---- input --------------------------------------------------------------------------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0, 0);
  let hovered = -1, down = null;
  const pickables = () => slots.flatMap((s) => (s.state === 'hatched' || s.burst ? [s.e.monster] : [s.e.body, ...s.e.extras]));
  function pick() {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables(), true);
    for (const h of hits) {
      let o = h.object;
      while (o && o.userData.slot === undefined) o = o.parent;
      if (!o) continue;
      const s = slots[o.userData.slot];
      // (a cut-out's clear pixels do not count)
      if (s.e.flat && h.uv && h.object.material.map) {
        const img = h.object.material.map.image;
        if (img && img.getContext) {
          const px = Math.floor(h.uv.x * img.width), py = Math.floor((1 - h.uv.y) * img.height);
          if (img.getContext('2d').getImageData(px, py, 1, 1).data[3] < 60) continue;
        } else if (h.object === s.e.monster && !alphaAt(s, h.uv)) continue;
      }
      return s.i;
    }
    return -1;
  }
  // the hatchling's own clear pixels, read once
  const alphaCache = new Map();
  function alphaAt(s, uvp) {
    let a = alphaCache.get(s.c.id);
    if (!a) {
      const img = s.e.monster.material.map.image, w = 160, h = Math.round((160 * img.height) / img.width);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, w, h);
      a = { w, h, d: g.getImageData(0, 0, w, h).data };
      alphaCache.set(s.c.id, a);
    }
    const x = Math.floor(uvp.x * a.w), y = Math.floor((1 - uvp.y) * a.h);
    return a.d[(y * a.w + x) * 4 + 3] > 60;
  }
  const toNdc = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const onMove = (e) => {
    toNdc(e);
    if (down && view.focus >= 0) {
      const s = slots[view.focus];
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 6) down.moved = true;
      if (s.state === 'idle') s.drag = clamp(down.drag + dx * 0.008, -0.75, 0.75);
    } else if (down && Math.abs(e.clientX - down.x) > 6) down.moved = true;
    hovered = pick();
    canvas.style.cursor = hovered >= 0 ? 'pointer' : 'default';
    hooks.onHover?.(hovered >= 0 ? slots[hovered].c.id : null);
  };
  const onDown = (e) => {
    toNdc(e);
    const s = view.focus >= 0 ? slots[view.focus] : null;
    down = { x: e.clientX, y: e.clientY, moved: false, drag: s ? s.drag : 0 };
  };
  const onUp = (e) => {
    if (!down) return;
    const d = down;
    down = null;
    toNdc(e);
    if (d.moved) {
      // a swipe along the shelf, on a narrow screen
      if (view.focus < 0 && pages() > 1) ctl.page(view.page + (e.clientX < d.x ? 1 : -1));
      return;
    }
    const i = pick();
    if (i < 0) return;
    const s = slots[i];
    if (s.state === 'idle') ctl.hatch(s.c.id);
    else if (s.state === 'hatched') {
      s.squash.kick(-3);
      s.e.model?.react();
      sparkles.emit(new V3(s.x, CUSHION_TOP + 1.2, 0.3), 14, { color: [s.c.glow, '#ffffff'], speed: 1.2, size: 0.18 });
      if (view.focus !== i) ctl.focus(s.c.id, true);
    }
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  addEventListener('pointerup', onUp);

  // ---- the hatching ---------------------------------------------------------------------
  /** Puts an egg back as it was: whole, still, unhatched. */
  function restore(s) {
    s.state = 'idle';
    s.T = 0;
    s.crack = s.glow = 0;
    s.burst = s.told = false;
    s.puffs = 0;
    s.drag = 0;
    s.D = -1;
    s.e.body.visible = true;
    for (const x of s.e.extras) {
      const h = x.userData.home;
      x.visible = true;
      x.position.copy(h.p);
      x.quaternion.copy(h.q);
      x.scale.copy(h.s);
      x.userData.v = null;
    }
    for (const p of s.e.pieces) {
      p.mesh.visible = false;
      p.mesh.position.copy(p.home);
      p.mesh.rotation.set(0, 0, 0);
      p.mesh.scale.setScalar(1);
      p.rest = false;
    }
    s.e.monster.visible = false;
    s.shadow.visible = true;
    s.rock.rotation.set(0, 0, 0);
    s.rock.position.y = CUSHION_TOP - 0.06;
  }
  /** Shows a hatched creature at rest on its cushion, without the hatching. */
  function settled(s) {
    restore(s);
    s.state = 'hatched';
    s.burst = true;
    s.told = true;
    s.e.body.visible = false;
    for (const x of s.e.extras) x.visible = false;
    s.e.monster.visible = true;
    s.pop.x = 0;
    s.pop.v = 0;
  }

  // the moments of the hatching, in seconds from the tap
  const PULSES = [
    { at: 0.15, amp: 0.13, crack: 0.2, glow: 0.25 },
    { at: 1.05, amp: 0.17, crack: 0.48, glow: 0.6 },
    { at: 1.95, amp: 0.22, crack: 0.8, glow: 1.0, hop: true },
  ];
  const SHAKE = 2.55, BURST = 3.05, CARD = 4.55;

  function hatchStep(s, dt, t) {
    s.T += dt;
    const T = s.T, e = s.e;
    const world = (v) => s.turn.localToWorld(v.clone());
    // wobbles: each pulse a rocking that rings down, the third with a hop
    let rz = 0, hop = 0;
    let crackTo = 0, glowTo = 0;
    for (const p of PULSES) {
      if (T < p.at) break;
      const u = T - p.at;
      rz += p.amp * Math.sin(u * TAU * 2.4) * Math.exp(-u * 3.4) * (reduced ? 0.2 : 1);
      if (p.hop && u < 0.4) hop = Math.sin((Math.PI * u) / 0.4) * 0.16 * (reduced ? 0 : 1);
      crackTo = p.crack;
      glowTo = p.glow;
    }
    if (T > SHAKE && T < BURST) {
      // the last moment before it gives: a fast tremble, the cracks all the way round, light pouring out
      const u = smooth(SHAKE, BURST, T);
      rz += Math.sin(T * 75) * 0.035 * u * (reduced ? 0.2 : 1);
      crackTo = 1;
      glowTo = 1 + u * 1.2;
    } else if (T >= BURST) {
      // broken: the cracks on the flying pieces cool
      rz = 0;
      crackTo = 1;
      glowTo = 0.15;
    }
    s.crack = damp(s.crack, crackTo, 9, dt);
    s.glow = damp(s.glow, glowTo, T >= BURST ? 8 : 6, dt);
    s.rock.rotation.z = rz;
    s.rock.position.y = CUSHION_TOP - 0.06 + hop;
    // (it turns to face the viewer as it hatches)
    s.turn.rotation.y = damp(s.turn.rotation.y, 0, 5, dt);
    s.turn.rotation.x = damp(s.turn.rotation.x, 0, 5, dt);
    e.U.uCrack.value = s.crack;
    e.U.uGlow.value = s.glow;

    const heart = world(new V3(0, e.EGG_H * 0.5, 0));
    // a puff of sparkles from the crack at each pulse
    while (s.puffs < PULSES.length && T >= PULSES[s.puffs].at) {
      const o = world(e.origin.clone().multiply(new V3(e.rMax, e.EGG_H / 2, e.rMax)).add(e.C));
      sparkles.emit(o, 18 + s.puffs * 10, { color: [s.c.glow, '#ffffff'], speed: 1.4, up: 0.6, size: 0.2, life: 0.9 });
      s.puffs++;
    }
    // (in front of the egg and of the hatchling that takes its place: inside either it would blaze)
    hatchLight.position.copy(heart).add(new V3(0, 0.2, 1.3));
    hatchLight.color.set(s.c.glow);
    rays.position.copy(heart).add(new V3(0, 0, -0.3));

    if (T < BURST) {
      hatchLight.intensity = s.glow * 4;
      const r = smooth(SHAKE - 0.4, BURST, T);
      rays.material.opacity = r * 0.55;
      rays.material.color.set(s.c.glow);
      rays.scale.setScalar(2.4 + r * 1.6);
      rays.rotation.z += dt * 0.4;
      return;
    }

    if (!s.burst) {
      // ---- it breaks ----
      s.burst = true;
      e.body.visible = false;
      for (const p of e.pieces) {
        p.mesh.visible = true;
        // thrown out sideways and up, clear of the hatchling (toward the viewer they hid it)
        const out = new V3(p.dir.x, 0, p.dir.z * 0.25);
        if (out.lengthSq() < 0.01) out.set(Math.random() - 0.5, 0, 0);
        out.normalize();
        p.vel.copy(out.multiplyScalar(1.8 + Math.random() * 1.6)).add(new V3(0, 2.2 + Math.max(0, p.dir.y) * 2.2 + Math.random(), 0.15));
        p.spin.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
      }
      for (const x of e.extras) {
        const side = Math.sign(x.position.x || Math.random() - 0.5);
        x.userData.v = new V3(side * (0.6 + Math.random() * 1.2), 2.4 + Math.random() * 1.2, 0.5 + Math.random() * 0.6);
        x.userData.w = (Math.random() - 0.5) * 6;
      }
      sparkles.emit(heart, 130, { color: [s.c.glow, '#ffffff', '#fff3c0'], speed: 4.2, up: 0.8, size: 0.22, life: 1.4, drag: 1.8, grav: -1.2, hdr: 1.6 });
      sparkles.emit(heart, 30, { color: ['#ffffff'], speed: 1.2, up: 0.4, size: 0.3, life: 2.2, drag: 0.8, grav: 0.1, hdr: 1.4 });
      if (s.c.confetti.length && !reduced) confetti.burst(heart.clone().add(new V3(0, 0.2, 0.2)), 140, s.c.confetti);
      e.monster.visible = true;
      s.pop.x = -1;
      s.pop.v = 0;
      s.squash.kick(6);
      s.D = 0;
      s.rock.rotation.z = 0;
      s.rock.position.y = CUSHION_TOP - 0.06;
      hooks.onBurst?.(s.c.id);
    }
    const u = T - BURST;
    // the flash, the light dying back, the rays fading
    flash.position.copy(heart).add(new V3(0, 0, 0.8));
    flash.material.opacity = Math.exp(-u * 9) * 0.75;
    flash.scale.setScalar(1.6 + u * 6);
    hatchLight.intensity = 9 * Math.exp(-u * 4.5);
    rays.material.opacity = 0.7 * Math.exp(-u * 2.2);
    rays.scale.setScalar(4 + u * 3);
    rays.rotation.z += dt * 0.6;
    if (!s.told && T >= CARD) {
      s.told = true;
      s.state = 'hatched';
      rays.material.opacity = 0;
      hooks.onHatched?.(s.c.id);
    }
  }

  /** The broken shell: the pieces fly, fall to the shelf and shrink away (after the card has opened too). */
  function debrisStep(s, dt) {
    const e = s.e, u = (s.D += dt);
    const world = (v) => s.turn.localToWorld(v.clone());
    let any = false;
    for (const p of e.pieces) {
      if (!p.mesh.visible) continue;
      any = true;
      p.vel.y -= 9.8 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      const wp = world(p.mesh.position);
      if (wp.y < 0.06) {
        p.mesh.position.y += 0.06 - wp.y;
        p.vel.y *= -0.32;
        p.vel.x *= 0.6;
        p.vel.z *= 0.6;
        p.spin.multiplyScalar(0.5);
      }
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.rotation.z += p.spin.z * dt;
      const sc = 1 - smooth(1.3, 2.1, u);
      p.mesh.scale.setScalar(Math.max(sc, 0.001));
      if (sc <= 0) p.mesh.visible = false;
    }
    e.innerMat.emissiveIntensity = 0.35 + 0.9 * Math.exp(-u * 2.5);
    // the parts that stuck out fall with them
    for (const x of e.extras) {
      const ev = x.userData.v;
      if (!x.visible || !ev) continue;
      any = true;
      ev.y -= 9.8 * dt;
      x.position.addScaledVector(ev, dt);
      x.rotation.z += x.userData.w * dt;
      const sc = 1 - smooth(1.0, 1.8, u);
      x.scale.copy(x.userData.home.s).multiplyScalar(Math.max(sc, 0.001));
      if (sc <= 0) x.visible = false;
    }
    if (!any) s.D = -1;
  }

  function idleStep(s, dt, t) {
    const focused = view.focus === s.i;
    // something stirs inside: now and then a little wiggle
    s.wiggleAt -= dt;
    if (s.wiggleAt <= 0 && !reduced) {
      s.wiggle.kick((Math.random() < 0.5 ? -1 : 1) * (focused ? 1.6 : 1.1));
      s.wiggleAt = 2.5 + Math.random() * 4.5;
    }
    s.wiggle.update(dt);
    s.hover = damp(s.hover, hovered === s.i ? 1 : 0, 10, dt);
    s.lift = damp(s.lift, hovered === s.i ? 0.07 : 0, 8, dt);
    s.rock.rotation.z = s.wiggle.x * 0.06;
    s.rock.position.y = CUSHION_TOP - 0.06 + s.lift;
    // it turns a little toward the pointer, and can be turned by hand when looked at closely
    const toward = focused ? ndc.x * 0.35 : 0.12 * Math.sin(t * 0.35 + s.i * 1.7);
    if (!down) s.drag = damp(s.drag, 0, 3, dt);
    s.turn.rotation.y = damp(s.turn.rotation.y, toward + s.drag, 6, dt);
    s.turn.rotation.x = damp(s.turn.rotation.x, focused ? -ndc.y * 0.08 : 0, 6, dt);
    s.e.U.uHover.value = s.hover;
  }

  function monsterStep(s, dt, t) {
    const m = s.e.monster;
    if (!m.visible) return;
    // it springs up out of the egg, overshoots, lands with a squash, then breathes and bobs
    const p = s.pop.update(dt);
    const q = s.squash.update(dt);
    const k = clamp(1 + p, 0, 1.4);
    const breathe = reduced ? 0 : Math.sin(t * 2.2 + s.i) * 0.022;
    const sqY = 1 + q * 0.06 + breathe, sqX = 1 - q * 0.04 - breathe * 0.5;
    const shelfScale = view.focus === s.i ? 1 : 0.86;
    s.mon.userData.sc = damp(s.mon.userData.sc ?? shelfScale, shelfScale, 5, dt);
    const sc = s.mon.userData.sc;
    m.scale.set(k * sqX * sc, k * sqY * sc, s.e.flat ? 1 : k * sqX * sc);
    if (s.e.model) s.e.model.update(dt, t, { focused: view.focus === s.i, ndc });
    m.position.y = (reduced ? 0 : Math.max(0, Math.sin(t * 1.6 + s.i)) * 0.035) - p * 0.35;
    m.rotation.z = reduced ? 0 : Math.sin(t * 1.1 + s.i * 2) * 0.03;
    // always facing the viewer
    s.mon.rotation.y = Math.atan2(camera.position.x - s.mon.position.x, camera.position.z - s.mon.position.z);
    // (a modelled one also turns a little toward the pointer, or about itself)
    if (!s.e.flat) s.mon.rotation.y += view.focus === s.i ? ndc.x * 0.4 : Math.sin(t * 0.3 + s.i) * 0.18;
  }

  // ---- the loop -------------------------------------------------------------------------
  let t = 0, last = 0, manual = false;
  function frame(dt) {
    t += dt;
    for (const s of slots) {
      if (s.state === 'hatching') hatchStep(s, dt, t);
      else if (s.state === 'idle') idleStep(s, dt, t);
      if (s.D >= 0) debrisStep(s, dt);
      monsterStep(s, dt, t);
    }
    if (!slots.some((s) => s.state === 'hatching')) {
      hatchLight.intensity = damp(hatchLight.intensity, 0, 4, dt);
      flash.material.opacity = damp(flash.material.opacity, 0, 8, dt);
    }
    for (const c of candles) {
      c.g.position.y = c.y0 + Math.sin(t * 0.6 + c.ph) * 0.06;
      const f = 1 + Math.sin(t * 13 + c.ph) * 0.06 + Math.sin(t * 7.3 + c.ph * 2) * 0.05;
      c.fl.scale.set(0.16 * f, 0.28 * f, 1);
      c.halo.material.opacity = 0.3 + 0.06 * f;
    }
    // drifting motes, now and then
    if (Math.random() < dt * 6) sparkles.emit(new V3((Math.random() - 0.5) * 12, 0.5 + Math.random() * 4, -1 - Math.random() * 2), 1, { color: '#ffd9a0', speed: 0.05, up: 0.05, size: 0.07, life: 5, drag: 0, grav: 0.01, hdr: 1.2 });
    sparkles.update(dt, t);
    confetti.update(dt, t, 0.02);
    rays.lookAt(camera.position);
    flash.lookAt(camera.position);
    aim();
    const k = 1 - Math.exp(-4.2 * dt);
    cam.pos.lerp(want.pos, k);
    cam.tgt.lerp(want.tgt, k);
    camera.position.copy(cam.pos);
    camera.lookAt(cam.tgt);
    sparkles.points.material.uniforms.uPx.value = renderer.domElement.height / (2 * tanH);
    composer.render();
  }
  // Everything the hatching shows for the first time (the hatchling, the shell's pieces, the
  // confetti) is prepared now, while the page loads: built at the moment of the burst, its shaders
  // and pictures held up that frame, which on some machines showed as a black flash.
  {
    const hidden = [];
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o);
        o.visible = true;
      }
    });
    try {
      await renderer.compileAsync(scene, camera);
    } catch (err) {
      console.warn('hatchery: shaders not prepared ahead', err);
    }
    scene.traverse((o) => {
      for (const m of [].concat(o.material || [])) for (const v of Object.values(m)) if (v?.isTexture) renderer.initTexture(v);
    });
    for (const o of hidden) o.visible = false;
  }

  renderer.setAnimationLoop((now) => {
    if (manual) return;
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    frame(dt);
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w / 2, h / 2);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  aim();
  cam.pos.copy(want.pos);
  cam.tgt.copy(want.tgt);

  const byId = (id) => slots.find((s) => s.c.id === id);
  const ctl = {
    /** Looks closely at one egg (or hatchling). */
    focus(id, card = false) {
      const s = byId(id);
      if (!s) return;
      view.focus = s.i;
      view.page = Math.floor(s.i / perPage());
      view.card = card;
      hooks.onFocus?.(id);
      if (card) hooks.onHatched?.(id);
    },
    /** Back to the shelf. */
    back() {
      view.focus = -1;
      view.card = false;
      hooks.onBack?.();
    },
    /** Shows another page of the shelf. */
    page(i) {
      view.page = clamp(i, 0, pages() - 1);
      hooks.onPage?.(view.page);
    },
    /** How many pages the shelf has at this screen's width. */
    pages,
    setCard(on) {
      view.card = on;
    },
    /** Hatches an egg: looks at it, then breaks it open. */
    hatch(id) {
      const s = byId(id);
      if (!s || s.state !== 'idle') return;
      ctl.focus(id);
      s.state = 'hatching';
      s.T = reduced ? BURST - 0.2 : -0.45; // (a beat for the camera to arrive)
      hooks.onHatching?.(id);
    },
    /** Puts eggs back unhatched (all of them, or one). */
    reset(id) {
      for (const s of id ? [byId(id)] : slots) if (s) restore(s);
      confetti.hide();
      // (and the hatching's light, if one was under way)
      rays.material.opacity = 0;
      flash.material.opacity = 0;
      hatchLight.intensity = 0;
    },
    /** Shows these creatures already hatched (from a saved game). */
    setHatched(ids) {
      for (const id of ids) {
        const s = byId(id);
        if (s) settled(s);
      }
    },
    get page_() {
      return view.page;
    },
    resize,
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      renderer.dispose();
    },
  };
  // for tests: drive time by hand
  window.__hatch = {
    ...ctl,
    step(sec = 1, fps = 60) {
      manual = true;
      for (let i = 0, n = Math.round(sec * fps); i < n; i++) frame(1 / fps);
    },
    live() {
      manual = false;
      last = 0;
    },
    state: () => slots.map((s) => ({ id: s.c.id, state: s.state, T: +s.T.toFixed(2), crack: +s.crack.toFixed(2) })),
    stats: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles }),
    measure: (id) => {
      const m = byId(id).e.m;
      return { W: m.W, H: m.H, cx: m.cx, top: m.top, bottom: m.bottom };
    },
  };
  return ctl;
}
