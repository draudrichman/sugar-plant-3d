/* Clubfoot, the "Club cub Monster", and her egg, modelled from the client's
   slide (Clubfoot): a fluffy pink foot lying flat, its forefoot turned in,
   five round toes with pale nails, big sparkly heart-shine eyes with lashes,
   a happy smile with two little fangs, a pink plaid flat cap with a pom, a
   pink studded collar with a gold "Clubfoot" plate and a heart, a little foot
   charm with a cross, and a pink golf club growing up out of her heel; and the
   white golf-ball egg, dimpled all the way round, with a thin dark green line.

   Model contract: see pyloric.js. This egg gives `profile` (her egg's outline,
   measured from art/clubfoot-egg.png, whose cut-out keeps the drop shadow under
   the egg) so the dimples can be painted round on the shell. */

import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PINK = '#f8a4c1';
const PINK_D = '#e97fa6';
const PINK_LT = '#ffc9da';
const HOT = '#ef5f97';
const GOLD = '#f3c74f';
const GOLD_D = '#c98e22';
const NAIL = '#ffe6ee';
const WHITE = '#fbfbfd';
const GREEN_LINE = '#1f5a24';

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------------- the egg's outline ---------------- */
// half-width (fraction of the widest) up her egg, read off her picture
const PROF = [
  [0.1, 0.78], [0.152, 0.861], [0.206, 0.924], [0.258, 0.963], [0.311, 0.987], [0.364, 1.0],
  [0.417, 0.994], [0.471, 0.976], [0.523, 0.947], [0.576, 0.907], [0.63, 0.857], [0.682, 0.799],
  [0.735, 0.732], [0.788, 0.655], [0.841, 0.57], [0.895, 0.463],
];
const ASPECT = 0.84;
function profile(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 0;
  if (t < 0.1) return 0.78 * Math.sqrt(1 - (1 - t / 0.1) ** 2);
  if (t > 0.895) return 0.463 * Math.sqrt(Math.max(0, 1 - ((t - 0.895) / 0.105) ** 2));
  for (let i = 1; i < PROF.length; i++)
    if (t <= PROF[i][0]) {
      const [t0, a] = PROF[i - 1], [t1, b] = PROF[i];
      return a + ((b - a) * (t - t0)) / (t1 - t0);
    }
  return 0.463;
}
// the shell's radius at height y, as the engine builds it (profiled(): H = 360 rows)
const EGG_H = 1.75;
const R_OF = (y) => profile(y / EGG_H) * (Math.round(360 * ASPECT) / 2) * (EGG_H / 359) * 0.985;

/* ---------------- small painted pieces ---------------- */
function heartPath(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy + s * 0.9);
  x.bezierCurveTo(cx - s * 1.25, cy + s * 0.05, cx - s * 0.95, cy - s * 0.95, cx, cy - s * 0.4);
  x.bezierCurveTo(cx + s * 0.95, cy - s * 0.95, cx + s * 1.25, cy + s * 0.05, cx, cy + s * 0.9);
  x.closePath();
}
function star4(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy - s);
  x.quadraticCurveTo(cx, cy, cx + s, cy);
  x.quadraticCurveTo(cx, cy, cx, cy + s);
  x.quadraticCurveTo(cx, cy, cx - s, cy);
  x.quadraticCurveTo(cx, cy, cx, cy - s);
  x.fill();
}
function heartShape(THREE, s) {
  const h = new THREE.Shape();
  h.moveTo(0, -s * 0.9);
  h.bezierCurveTo(-s * 1.25, -s * 0.05, -s * 0.95, s * 0.95, 0, s * 0.4);
  h.bezierCurveTo(s * 0.95, s * 0.95, s * 1.25, -s * 0.05, 0, -s * 0.9);
  return h;
}

/** A big storybook eye (the kit's, with her iris: dark, a pink heart low in it, star sparkles). */
function sparkleEye(kit, { r = 0.13, lid = PINK, side = 1 } = {}) {
  const { THREE, toon, canvasTex, noInk, TAU, clamp, lerp, V3 } = kit;
  const g = new THREE.Group();
  // the eyeball: a sphere squashed front to back; the iris is a cap lying ON it (not a flat disc
  // half inside it), and turns with the gaze
  const ball = new THREE.Group();
  ball.scale.z = 0.62;
  g.add(ball);
  const white = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), toon('#fffaf8'));
  ball.add(white);
  const irisTex = canvasTex(256, 256, (x, w) => {
    const c = w / 2;
    // the iris: dark plum with a pink glow low in it, a dark rim
    const rg = x.createRadialGradient(c, c * 1.25, 4, c, c, c);
    rg.addColorStop(0, '#d0567f');
    rg.addColorStop(0.45, '#8a2c50');
    rg.addColorStop(0.85, '#3f0f22');
    rg.addColorStop(1, '#1c0510');
    x.fillStyle = rg;
    x.beginPath();
    x.arc(c, c, c, 0, TAU);
    x.fill();
    // the pupil
    x.fillStyle = '#1a0510';
    x.beginPath();
    x.arc(c, c * 0.96, c * 0.5, 0, TAU);
    x.fill();
    // the heart shine, low in the eye
    const hg = x.createLinearGradient(0, c * 1.05, 0, c * 1.8);
    hg.addColorStop(0, '#ffc2d6');
    hg.addColorStop(1, '#ff4f88');
    x.fillStyle = hg;
    heartPath(x, c + c * 0.06 * side, c * 1.38, c * 0.4);
    x.fill();
    // the sparkles: a big round shine, a star, little twinkles
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.arc(c - c * 0.3 * side, c - c * 0.34, c * 0.27, 0, TAU);
    x.fill();
    star4(x, c + c * 0.36 * side, c - c * 0.2, c * 0.32);
    star4(x, c - c * 0.56 * side, c + c * 0.28, c * 0.15);
    x.beginPath();
    x.arc(c + c * 0.1 * side, c - c * 0.64, c * 0.06, 0, TAU);
    x.fill();
  });
  const look = new THREE.Group();
  const TH = Math.asin(0.84), RC = r * 1.012, RHO = RC * Math.sin(TH);
  const capGeo = new THREE.SphereGeometry(RC, 40, 14, 0, TAU, 0, TH);
  capGeo.rotateX(Math.PI / 2); // its pole to +Z
  {
    const P = capGeo.attributes.position, U = capGeo.attributes.uv;
    for (let i = 0; i < P.count; i++) U.setXY(i, 0.5 + P.getX(i) / (2 * RHO), 0.5 + P.getY(i) / (2 * RHO));
  }
  const irisM = noInk(new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ map: irisTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })));
  look.add(irisM);
  ball.add(look);
  const lidM = new THREE.Mesh(new THREE.SphereGeometry(r * 1.07, 32, 14, 0, TAU, 0, Math.PI / 2), toon(lid, { side: THREE.DoubleSide }));
  lidM.scale.z = 0.7;
  g.add(lidM);
  const lashMat = new THREE.MeshBasicMaterial({ color: '#2b1220' });
  // her lashes: three, curling out of the upper outer corner
  for (let i = 0; i < 3; i++) {
    const a = 0.32 + i * 0.36; // up from the outer corner
    const len = r * (0.5 - i * 0.08);
    const lash = noInk(new THREE.Mesh(new THREE.ConeGeometry(r * 0.08, len, 6), lashMat));
    const rim = new V3(Math.cos(a) * side * r * 1.0, Math.sin(a) * r * 1.0, r * 0.22);
    const out = new V3(Math.cos(a) * side * 1.1, Math.sin(a) + 0.35, 0.25).normalize();
    lash.position.copy(rim).addScaledVector(out, len / 2);
    lash.quaternion.setFromUnitVectors(new V3(0, 1, 0), out);
    g.add(lash);
  }
  return {
    group: g,
    blink(k) {
      lidM.rotation.x = lerp(-1.15, 1.5, clamp(k, 0, 1));
      look.visible = k < 0.85;
    },
    look(x, y) {
      look.rotation.set(-clamp(y, -1, 1) * 0.18, clamp(x, -1, 1) * 0.26, 0);
    },
  };
}

/** A ribbon bow, one unit wide, facing +Z. */
function bow(kit, color) {
  const { THREE, toon } = kit;
  const g = new THREE.Group();
  const mat = toon(color);
  const dark = toon(new THREE.Color(color).multiplyScalar(0.8));
  for (const s of [-1, 1]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 12), mat);
    lobe.scale.set(0.46, 0.34, 0.18);
    lobe.position.set(s * 0.28, 0.04, 0);
    lobe.rotation.z = s * 0.25;
    g.add(lobe);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.05), mat);
    tail.position.set(s * 0.13, -0.26, -0.02);
    tail.rotation.z = s * 0.38;
    g.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), dark);
  knot.scale.z = 0.8;
  knot.position.z = 0.05;
  g.add(knot);
  return g;
}

/** Bends a flat part (lying in x, facing +z) round a vertical cylinder of radius R. */
function bendY(geo, R) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), a = x / R;
    p.setXYZ(i, (R + z) * Math.sin(a), p.getY(i), (R + z) * Math.cos(a) - R);
  }
  geo.computeVertexNormals();
  return geo;
}

/** A band swept round a closed loop: points, outward normals, ups; a rounded-box section. */
function sweepBand(THREE, pts, ns, ups, { a = 0.03, b = 0.05, off = 0, K = 20 } = {}) {
  const N = pts.length;
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const p = pts[i % N], n = ns[i % N], u = ups[i % N];
    for (let j = 0; j <= K; j++) {
      const f = (j % K) / K * Math.PI * 2, c = Math.cos(f), s = Math.sin(f);
      const px = a * Math.sign(c) * Math.abs(c) ** 0.45 + off, py = b * Math.sign(s) * Math.abs(s) ** 0.45;
      pos.push(p.x + n.x * px + u.x * py, p.y + n.y * px + u.y * py, p.z + n.z * px + u.z * py);
      uv.push(i / N, j / K);
    }
  }
  for (let i = 0; i < N; i++)
    for (let j = 0; j < K; j++) {
      const A = i * (K + 1) + j, B = A + 1, C = A + K + 1, D = C + 1;
      idx.push(A, B, C, B, D, C);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // facing out? (the j = 0 point is the outermost of the section)
  const nr = geo.attributes.normal;
  if (nr.getX(0) * ns[0].x + nr.getY(0) * ns[0].y + nr.getZ(0) * ns[0].z < 0) {
    for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    geo.setIndex(idx);
    geo.computeVertexNormals();
  }
  // weld the seams' normals
  const weld = (a, b) => {
    const x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1;
    nr.setXYZ(a, x / l, y / l, z / l);
    nr.setXYZ(b, x / l, y / l, z / l);
  };
  for (let i = 0; i <= N; i++) weld(i * (K + 1), i * (K + 1) + K);
  for (let j = 0; j <= K; j++) weld(j, N * (K + 1) + j);
  return geo;
}

/* ---------------- the body's shape: a foot, as a smooth union of three ellipsoids ---------------- */
const MOUND = { c: [0.12, 0.4, -0.12], r: [0.56, 0.48, 0.5] };
const HEEL = { c: [0.4, 0.2, -0.42], r: [0.32, 0.22, 0.3] };
const ALPHA = 0.55; // the forefoot's inward turn (toward -x)
const FORE = { c: [-0.25, 0.12, 0.18], r: [0.36, 0.14, 0.42] };
const SA = Math.sin(ALPHA), CA = Math.cos(ALPHA);
function ellSd(px, py, pz, c, r) {
  const x = px - c[0], y = py - c[1], z = pz - c[2];
  const k0 = Math.hypot(x / r[0], y / r[1], z / r[2]);
  const k1 = Math.hypot(x / (r[0] * r[0]), y / (r[1] * r[1]), z / (r[2] * r[2]));
  return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(...r);
}
function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
function foreSd(px, py, pz) {
  // into the forefoot's frame: local x across (P = (cos, 0, sin)), local z along (D = (-sin, 0, cos))
  const x = px - FORE.c[0], z = pz - FORE.c[2];
  const lx = x * CA + z * SA, lz = -x * SA + z * CA;
  return ellSd(lx, py, lz, [0, FORE.c[1], 0], FORE.r);
}
const sdUpper = (x, y, z) => smin(ellSd(x, y, z, MOUND.c, MOUND.r), ellSd(x, y, z, HEEL.c, HEEL.r), 0.16);
function sdBody(x, y, z) {
  const d = smin(sdUpper(x, y, z), foreSd(x, y, z), 0.12);
  return -smin(-d, y, 0.05); // cut flat on the ground
}
const COLLAR_Y = (th) => 0.33 - 0.06 * Math.cos(th);
const AX = [0.12, -0.12]; // the mound's vertical axis (x, z)

/* =================================================================================== */
export default {
  profile,
  aspect: ASPECT,

  eggPaint(g, w, h) {
    // a white golf ball: hexagonally packed dimples, laid out by arc length so they stay round
    g.fillStyle = WHITE;
    g.fillRect(0, 0, w, h);
    const NS = 600, ys = [], S = [0];
    for (let k = 0; k <= NS; k++) ys.push((k / NS) * EGG_H);
    for (let k = 1; k <= NS; k++) S.push(S[k - 1] + Math.hypot(ys[k] - ys[k - 1], R_OF(ys[k]) - R_OF(ys[k - 1])));
    const total = S[NS];
    const yAtS = (s) => {
      let k = 1;
      while (k < NS && S[k] < s) k++;
      const f = (s - S[k - 1]) / (S[k] - S[k - 1] || 1);
      return ys[k - 1] + (ys[k] - ys[k - 1]) * f;
    };
    const SP = 0.165, RHO = SP * 0.43, PY = h / EGG_H;
    const rows = Math.round(total / ((SP * Math.sqrt(3)) / 2));
    const dimple = (cx, cy, rx, ry) => {
      g.save();
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      g.clip();
      // the cup: shaded under its top rim, lit on its lower wall
      g.fillStyle = '#c3c7d3';
      g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
      g.fillStyle = '#e2e5ec';
      g.beginPath();
      g.ellipse(cx + rx * 0.06, cy + ry * 0.3, rx * 0.98, ry * 0.95, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f7f8fb';
      g.beginPath();
      g.ellipse(cx + rx * 0.1, cy + ry * 0.72, rx * 0.86, ry * 0.62, 0, 0, Math.PI * 2);
      g.fill();
      // a glint in the shade
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.ellipse(cx - rx * 0.38, cy - ry * 0.42, rx * 0.17, ry * 0.11, -0.5, 0, Math.PI * 2);
      g.fill();
      g.restore();
      // the rim: a grey edge over the top, a white lip below
      g.lineWidth = 2.2;
      g.strokeStyle = '#a9aebd';
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, 0, Math.PI * 0.92, Math.PI * 2.08);
      g.stroke();
      g.strokeStyle = 'rgba(160,166,182,0.45)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
      g.stroke();
    };
    for (let j = 0; j < rows; j++) {
      const s = (j + 0.5) * (total / rows);
      const y = yAtS(s), r = R_OF(y);
      const n = Math.round((2 * Math.PI * r) / SP);
      if (n < 4) continue;
      const q = Math.hypot(1, (R_OF(y + 0.005) - R_OF(y - 0.005)) / 0.01); // arc length per height
      const rx = (RHO / (2 * Math.PI * r)) * w, ry = (RHO / q) * PY;
      const cy = h * (1 - y / EGG_H);
      for (let i = 0; i < n; i++) {
        const cx = ((i + (j % 2) * 0.5) / n) * w;
        for (const dx of [-w, 0, w]) if (cx + dx + rx > 0 && cx + dx - rx < w) dimple(cx + dx, cy, rx, ry);
      }
    }
  },

  eggProps(kit, shell) {
    // her egg's thin dark green line: a hull just outside the engine's ink line, pulled a hair toward
    // the camera so it wins over the dark one; shown only while the whole shell is
    const { THREE } = kit;
    const pts = [new THREE.Vector2(0, 0)];
    for (let i = 1; i < 64; i++) {
      const y = (i / 64) * shell.H;
      pts.push(new THREE.Vector2(shell.at(0, y, 0).p.z, y));
    }
    pts.push(new THREE.Vector2(0, shell.H));
    const geo = new THREE.LatheGeometry(pts, 80);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uW: { value: 0.0036 }, uPull: { value: 0.06 }, uCol: { value: new THREE.Color(GREEN_LINE) } },
      vertexShader: /* glsl */ `
        uniform float uW, uPull;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normal);
          mv.xyz += n * uW * -mv.z;
          gl_Position = projectionMatrix * mv;
          vec4 q = mv; q.z += uPull;
          vec4 c2 = projectionMatrix * q;
          gl_Position.z = c2.z / c2.w * gl_Position.w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCol;
        void main() {
          gl_FragColor = vec4(uCol, 1.0);
          #include <colorspace_fragment>
        }`,
      side: THREE.BackSide,
    });
    const hull = new THREE.Mesh(geo, mat);
    hull.userData.noInk = true;
    hull.userData.isInk = true;
    hull.raycast = () => {};
    const line = new THREE.Group();
    line.add(hull);
    line.updateMatrixWorld = function (force) {
      const body = this.parent?.children.find((o) => o.isMesh && o.material?.uniforms?.uCrack);
      hull.visible = body ? body.visible : true;
      return THREE.Object3D.prototype.updateMatrixWorld.call(this, force);
    };
    return [line];
  },

  monster(kit) {
    const { THREE, toon, taperTube, decal, blush, Spring, V3, TAU } = kit;
    const root = new THREE.Group();
    const g = new THREE.Group(); // she bounces as one
    const big = new THREE.Group(); // she sits 1.2x the modelled size
    big.scale.setScalar(1.2);
    root.add(big);
    big.add(g);
    const pinkMat = toon(PINK), goldMat = toon(GOLD), hotMat = toon(HOT);

    // ---- the furry foot: a sphere pushed out to the shape, with tufts round its edges ----
    const C = new V3(0.0, 0.16, -0.02);
    const faceDir = new V3(0.12, 0.52, 0.34).sub(C).normalize();
    const march = (sd, o, d, tMax, step = 0.006) => {
      let t = 0, inside = sd(o.x, o.y, o.z) <= 0;
      if (!inside) return 0;
      while (t < tMax) {
        const tn = t + step;
        if (sd(o.x + d.x * tn, o.y + d.y * tn, o.z + d.z * tn) > 0) break;
        t = tn;
      }
      let a = t, b = t + step;
      for (let k = 0; k < 7; k++) {
        const m = (a + b) / 2;
        if (sd(o.x + d.x * m, o.y + d.y * m, o.z + d.z * m) > 0) b = m;
        else a = m;
      }
      return (a + b) / 2;
    };
    const grad = (sd, p) => {
      const e = 0.002;
      return new V3(
        sd(p.x + e, p.y, p.z) - sd(p.x - e, p.y, p.z),
        sd(p.x, p.y + e, p.z) - sd(p.x, p.y - e, p.z),
        sd(p.x, p.y, p.z + e) - sd(p.x, p.y, p.z - e),
      ).normalize();
    };
    // tuft centres scattered evenly over the sphere of directions
    const tufts = [];
    {
      const N = 230, gold = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), a = gold * i;
        tufts.push({ d: new V3(r * Math.cos(a), y, r * Math.sin(a)), k: 0.65 + 0.35 * (Math.abs(Math.sin(i * 12.9898) * 43758.5) % 1) });
      }
    }
    const bodyGeo = new THREE.SphereGeometry(1, 104, 72);
    {
      const p = bodyGeo.attributes.position, d = new V3(), q = new V3();
      for (let i = 0; i < p.count; i++) {
        d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
        const t = march(sdBody, C, d, 1.6);
        q.copy(C).addScaledVector(d, t);
        // tufts: little pointed lumps, kept off the face, the collar and the ground
        let best = -2, bk = 1;
        for (const tf of tufts) {
          const c = tf.d.dot(d);
          if (c > best) (best = c), (bk = tf.k);
        }
        const ang = Math.acos(Math.min(1, best));
        let amp = 0.058 * bk * Math.max(0, 1 - ang / 0.17) ** 1.4;
        amp *= smooth(0.66, 0.95, Math.acos(Math.min(1, d.dot(faceDir))));
        amp *= smooth(0.0, 0.1, q.y);
        const th = Math.atan2(q.x - AX[0], q.z - AX[1]);
        amp *= smooth(0.05, 0.12, Math.abs(q.y - COLLAR_Y(th)));
        q.addScaledVector(d, amp);
        p.setXYZ(i, q.x, Math.max(0, q.y), q.z);
      }
      bodyGeo.computeVertexNormals();
      const nr = bodyGeo.attributes.normal, W = 104;
      for (let iy = 0; iy <= 72; iy++) {
        const a = iy * (W + 1), b = a + W;
        const x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1;
        nr.setXYZ(a, x / l, y / l, z / l);
        nr.setXYZ(b, x / l, y / l, z / l);
      }
    }
    const furTex = kit.canvasTex(1024, 512, (x, w, h) => {
      x.fillStyle = PINK;
      x.fillRect(0, 0, w, h);
      x.lineCap = 'round';
      // short fur strokes, darker and lighter, hanging downward; fewer on the face
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 1900; i++) {
        const X = rnd() * w, Y = rnd() * h;
        const onFace = Math.hypot((X - w * 0.25) / (w * 0.09), (Y - h * 0.3) / (h * 0.16)) < 1;
        if (onFace && rnd() < 0.75) continue;
        const dark = rnd() < 0.55;
        x.strokeStyle = dark ? 'rgba(222,104,148,0.42)' : 'rgba(255,214,228,0.6)';
        x.lineWidth = 1.5 + rnd() * 1.6;
        const L = 8 + rnd() * 14, a = Math.PI / 2 + (rnd() - 0.5) * 0.9;
        x.beginPath();
        x.moveTo(X, Y);
        x.quadraticCurveTo(X + Math.cos(a) * L * 0.5 + 4, Y + Math.sin(a) * L * 0.5, X + Math.cos(a) * L, Y + Math.sin(a) * L);
        x.stroke();
      }
    });
    const body = new THREE.Mesh(bodyGeo, toon('#ffffff', { map: furTex }));
    g.add(body);

    /** A point on her front at (x, y), lifted along its normal. */
    const at = (x, y, lift = 0) => {
      const o = new V3(x, y, 1.4);
      let z = 1.4;
      while (z > -1 && sdBody(x, y, z) > 0) z -= 0.004;
      let a = z, b = z + 0.004;
      for (let k = 0; k < 8; k++) {
        const m = (a + b) / 2;
        if (sdBody(x, y, m) > 0) b = m;
        else a = m;
      }
      o.z = (a + b) / 2;
      const n = grad(sdBody, o);
      return { p: o.addScaledVector(n, lift), n };
    };
    const place = (obj, x, y, lift = 0) => {
      const { p, n } = at(x, y, lift);
      obj.position.copy(p);
      obj.quaternion.setFromUnitVectors(new V3(0, 0, 1), n);
      return obj;
    };

    // ---- the forefoot's five toes, turned in; each can wiggle about its root ----
    const toeGeo = new THREE.SphereGeometry(1, 28, 20);
    const nailGeo = new THREE.SphereGeometry(1, 20, 12);
    const nailMat = toon(NAIL);
    const toes = [];
    {
      const fore = new THREE.Group();
      fore.position.set(FORE.c[0], 0, FORE.c[2]);
      fore.rotation.y = -ALPHA;
      g.add(fore);
      const spec = [
        [-0.25, 0.0, 0.15, -0.12],
        [-0.06, 0.03, 0.115, -0.02],
        [0.09, 0.0, 0.105, 0.08],
        [0.22, -0.06, 0.095, 0.18],
        [0.33, -0.13, 0.085, 0.3],
      ];
      for (const [lx, lz, r, yaw] of spec) {
        const pivot = new THREE.Group();
        pivot.position.set(lx, r * 0.78, FORE.r[2] * Math.sqrt(Math.max(0, 1 - (lx / FORE.r[0]) ** 2)) * 0.82 + lz - r * 0.3);
        pivot.rotation.order = 'YXZ';
        pivot.rotation.y = yaw;
        const toe = new THREE.Mesh(toeGeo, pinkMat);
        toe.scale.set(r, r * 0.8, r * 1.18);
        toe.position.z = r * 0.55;
        const nail = new THREE.Mesh(nailGeo, nailMat);
        nail.scale.set(r * 0.58, r * 0.16, r * 0.5);
        nail.position.set(0, r * 0.6, r * 1.33);
        nail.rotation.x = 0.85;
        pivot.add(toe, nail);
        fore.add(pivot);
        toes.push(pivot);
      }
    }

    // ---- the face: sparkly eyes, a smile with two little fangs, blushing cheeks ----
    const eyes = [];
    for (const s of [-1, 1]) {
      const e = sparkleEye(kit, { r: 0.135, side: s });
      place(e.group, 0.12 + s * 0.165, 0.63, -0.04);
      g.add(e.group);
      eyes.push(e);
    }
    const smilePts = [[-0.14, 0.5], [-0.1, 0.46], [0.0, 0.425], [0.12, 0.415], [0.24, 0.425], [0.34, 0.46], [0.38, 0.5]].map(([x, y]) => at(x, y, 0.012).p);
    const smile = new THREE.Mesh(taperTube(smilePts, 0.012, 0.012, { segs: 40, radial: 8 }), toon('#7a2240'));
    smile.userData.noInk = true;
    g.add(smile);
    const fangMat = toon('#ffffff');
    for (const fx of [0.02, 0.22]) {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.07, 14), fangMat);
      const { p, n } = at(fx, 0.4, 0.012);
      fang.position.copy(p);
      fang.quaternion.setFromUnitVectors(new V3(0, 0, 1), n);
      fang.rotateX(Math.PI); // point down
      fang.scale.z = 0.6;
      g.add(fang);
    }
    for (const s of [-1, 1]) {
      const b = decal(0.15, 0.09, (x, W, H) => {
        const rg = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
        rg.addColorStop(0, 'rgba(244,104,146,.75)');
        rg.addColorStop(0.65, 'rgba(244,104,146,.35)');
        rg.addColorStop(1, 'rgba(244,104,146,0)');
        x.fillStyle = rg;
        x.fillRect(0, 0, W, H);
        x.strokeStyle = 'rgba(214,60,110,.75)';
        x.lineWidth = 7;
        x.lineCap = 'round';
        for (const k of [-1, 0, 1]) {
          x.beginPath();
          x.moveTo(W / 2 + k * W * 0.16 - W * 0.04, H * 0.66);
          x.lineTo(W / 2 + k * W * 0.16 + W * 0.04, H * 0.34);
          x.stroke();
        }
      });
      g.add(place(b, 0.12 + s * 0.3, 0.5, 0.012));
    }

    // ---- the collar, round her middle, studded; the plate, the heart, the foot charm ----
    const NC = 96, cPts = [], cNs = [], cUps = [];
    for (let i = 0; i < NC; i++) {
      const th = (i / NC) * TAU;
      const h = new V3(Math.sin(th), 0, Math.cos(th));
      const o = new V3(AX[0], COLLAR_Y(th), AX[1]);
      const t = march(sdUpper, o, h, 1.2, 0.005);
      cPts.push(o.addScaledVector(h, t));
    }
    for (let i = 0; i < NC; i++) {
      const T = cPts[(i + 1) % NC].clone().sub(cPts[(i + NC - 1) % NC]).normalize();
      const gr = grad(sdUpper, cPts[i]);
      let up = new V3().crossVectors(T, gr).normalize();
      if (up.y < 0) up.negate();
      const n = new V3().crossVectors(up, T).normalize();
      if (n.dot(gr) < 0) n.negate();
      cNs.push(n);
      cUps.push(up);
    }
    const collar = new THREE.Mesh(sweepBand(THREE, cPts, cNs, cUps, { a: 0.032, b: 0.052, off: 0.03, K: 20 }), hotMat);
    g.add(collar);
    const frameAt = (th, out) => {
      const i = Math.round((th / TAU) * NC) % NC;
      const m = new THREE.Matrix4().makeBasis(new V3().crossVectors(cUps[i], cNs[i]).normalize(), cUps[i], cNs[i]);
      return { p: cPts[i].clone().addScaledVector(cNs[i], out), q: new THREE.Quaternion().setFromRotationMatrix(m), i };
    };
    const PLATE_TH = 0.2, CHARM_TH = 0.95;
    {
      const studs = [];
      for (let i = 0; i < NC; i += 3) {
        const th = (i / NC) * TAU, dth = Math.min(Math.abs(th - PLATE_TH), TAU - Math.abs(th - PLATE_TH));
        if (dth < 0.5 || Math.abs(th - CHARM_TH) < 0.12) continue;
        const s = new THREE.SphereGeometry(0.017, 10, 8);
        const p = cPts[i].clone().addScaledVector(cNs[i], 0.03 + 0.032);
        s.translate(p.x, p.y, p.z);
        studs.push(s);
      }
      g.add(new THREE.Mesh(mergeGeometries(studs), goldMat));
    }
    // the plate, bent round the collar
    {
      const f = frameAt(PLATE_TH, 0.03 + 0.03);
      const R = Math.hypot(f.p.x - AX[0], f.p.z - AX[1]) * 0.95;
      const plate = new THREE.Group();
      const W = 0.52, H = 0.16, rr = 0.065;
      // a rounded rectangle with many points along its sides, so it bends smoothly
      const outline = [];
      const corner = (cx, cy, a0) => {
        for (let k = 0; k <= 6; k++) {
          const a = a0 + (k / 6) * (Math.PI / 2);
          outline.push(new THREE.Vector2(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr));
        }
      };
      const edge = (x0, y0, x1, y1, n) => {
        for (let k = 1; k < n; k++) outline.push(new THREE.Vector2(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n));
      };
      corner(W / 2 - rr, -H / 2 + rr, -Math.PI / 2);
      edge(W / 2, -H / 2 + rr, W / 2, H / 2 - rr, 2);
      corner(W / 2 - rr, H / 2 - rr, 0);
      edge(W / 2 - rr, H / 2, -W / 2 + rr, H / 2, 16);
      corner(-W / 2 + rr, H / 2 - rr, Math.PI / 2);
      edge(-W / 2, H / 2 - rr, -W / 2, -H / 2 + rr, 2);
      corner(-W / 2 + rr, -H / 2 + rr, Math.PI);
      edge(-W / 2 + rr, -H / 2, W / 2 - rr, -H / 2, 16);
      const sh = new THREE.Shape(outline);
      const pg = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 8, steps: 1 });
      const plateBody = new THREE.Mesh(bendY(pg, R), goldMat);
      plateBody.userData.inkColor = GOLD_D;
      const tex = kit.canvasTex(512, 160, (x, w, h) => {
        x.clearRect(0, 0, w, h);
        const fam = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive';
        let px = 120;
        x.font = `bold ${px}px ${fam}`;
        px = Math.min(px, (px * w * 0.86) / x.measureText('Clubfoot').width);
        x.font = `bold ${px}px ${fam}`;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.lineJoin = 'round';
        x.lineWidth = 14;
        x.strokeStyle = '#fff6d8';
        x.strokeText('Clubfoot', w / 2, h * 0.6);
        x.fillStyle = '#1e1014';
        x.fillText('Clubfoot', w / 2, h * 0.6);
      });
      const tg = bendY(new THREE.PlaneGeometry(W * 0.92, H * 0.88, 24, 1).translate(0, 0, 0.033), R);
      const text = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      text.userData.noInk = true;
      // the heart, with its heartbeat, sitting up on the plate's top edge
      const heart = new THREE.Mesh(new THREE.ExtrudeGeometry(heartShape(THREE, 0.06), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 3, curveSegments: 14 }), toon('#ec3a66'));
      heart.userData.inkColor = GOLD_D;
      heart.position.set(-0.1, H / 2 + 0.012, 0.03);
      const ecg = decal(0.11, 0.06, (x, w, h) => {
        x.strokeStyle = '#ffffff';
        x.lineWidth = 14;
        x.lineJoin = 'round';
        x.lineCap = 'round';
        x.beginPath();
        x.moveTo(w * 0.04, h * 0.55);
        x.lineTo(w * 0.32, h * 0.55);
        x.lineTo(w * 0.42, h * 0.15);
        x.lineTo(w * 0.54, h * 0.88);
        x.lineTo(w * 0.64, h * 0.4);
        x.lineTo(w * 0.7, h * 0.55);
        x.lineTo(w * 0.96, h * 0.55);
        x.stroke();
      }, { round: false });
      ecg.position.set(-0.1, H / 2 + 0.017, 0.075);
      plate.add(plateBody, text, heart, ecg);
      plate.position.copy(f.p);
      plate.quaternion.copy(f.q);
      g.add(plate);
    }
    // the foot charm, hanging under a little bow on her right
    const charm = new THREE.Group();
    {
      const f = frameAt(CHARM_TH, 0.03 + 0.045);
      const holder = new THREE.Group();
      holder.position.copy(f.p);
      holder.quaternion.copy(f.q);
      const b = bow(kit, '#ffb6cc');
      b.scale.setScalar(0.13);
      b.position.z = 0.01;
      holder.add(b);
      charm.position.set(0, -0.03, 0.02);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.005, 6, 16), goldMat);
      ring.position.y = -0.025;
      ring.userData.noInk = true;
      const sole = new THREE.Shape();
      sole.moveTo(0, -0.075);
      sole.bezierCurveTo(0.045, -0.075, 0.05, -0.02, 0.045, 0.02);
      sole.bezierCurveTo(0.04, 0.05, 0.03, 0.055, 0.0, 0.055);
      sole.bezierCurveTo(-0.035, 0.055, -0.05, 0.035, -0.045, 0.0);
      sole.bezierCurveTo(-0.04, -0.04, -0.04, -0.075, 0, -0.075);
      const tagGeos = [new THREE.ExtrudeGeometry(sole, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2, curveSegments: 10 })];
      for (const [x, y, r] of [[-0.03, 0.068, 0.014], [-0.008, 0.078, 0.011], [0.011, 0.077, 0.01], [0.027, 0.07, 0.009], [0.04, 0.059, 0.008]]) {
        const tg = new THREE.SphereGeometry(r, 10, 8);
        tg.scale(1, 1, 0.6);
        tg.translate(x, y, 0.012);
        tg.deleteAttribute('uv');
        tagGeos.push(tg);
      }
      tagGeos[0].deleteAttribute('uv');
      const tag = new THREE.Mesh(mergeGeometries(tagGeos.map((q) => (q.index ? q.toNonIndexed() : q))), toon('#ffd3df'));
      tag.userData.inkColor = GOLD_D;
      tag.position.y = -0.115;
      const cross = decal(0.06, 0.06, (x, w, h) => {
        x.fillStyle = '#ff5f8c';
        x.beginPath();
        x.arc(w / 2, h / 2, w / 2, 0, TAU);
        x.fill();
        x.fillStyle = '#ffffff';
        x.fillRect(w * 0.4, h * 0.18, w * 0.2, h * 0.64);
        x.fillRect(w * 0.18, h * 0.4, w * 0.64, h * 0.2);
      });
      cross.position.set(0, -0.125, 0.027);
      charm.add(ring, tag, cross);
      holder.add(charm);
      g.add(holder);
    }

    // ---- the plaid flat cap with its pom, tipped on top ----
    const hat = new THREE.Group();
    const pom = new THREE.Group();
    {
      const plaid = kit.canvasTex(512, 256, (x, w, h) => {
        x.fillStyle = '#f7aec6';
        x.fillRect(0, 0, w, h);
        x.fillStyle = 'rgba(226,104,150,0.45)';
        for (let i = 0; i < w; i += 64) x.fillRect(i, 0, 22, h);
        for (let j = 0; j < h; j += 32) x.fillRect(0, j, w, 11);
        x.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 40; i < w; i += 64) x.fillRect(i, 0, 4, h);
        for (let j = 20; j < h; j += 32) x.fillRect(0, j, w, 3);
      });
      const capMat = toon('#ffffff', { map: plaid });
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.2, 36, 16, 0, TAU, 0, Math.PI / 2), capMat);
      crown.scale.set(1.04, 0.6, 1.0);
      crown.position.y = 0.025;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.206, 0.2, 0.05, 36), toon('#ee86ab'));
      band.position.y = 0.012;
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.024, 28, 1, false, -Math.PI / 2, Math.PI), capMat);
      brim.scale.z = 0.85;
      brim.position.set(0, 0.012, 0.1);
      brim.rotation.x = 0.18;
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 12), toon('#f7aec6'));
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16), toon('#ee86ab'));
      button.position.y = -0.04;
      button.userData.noInk = true;
      pom.add(ball);
      pom.position.y = 0.025 + 0.2 * 0.6 + 0.03;
      hat.add(crown, band, brim, pom);
      hat.position.set(0.24, 0.85, -0.1);
      hat.rotation.set(-0.12, 0.3, -0.24);
      g.add(hat);
    }

    // ---- the golf club, growing up out of her heel: pink neck, white shaft, striped grip ----
    const BASE = new V3(0.4, 0.4, -0.38);
    const club = new THREE.Group();
    club.position.copy(BASE);
    {
      const rel = (x, y, z) => new V3(x, y, z).sub(BASE);
      const neck = new THREE.Mesh(
        taperTube([rel(0.38, 0.38, -0.36), rel(0.48, 0.62, -0.45), rel(0.56, 0.86, -0.51), rel(0.6, 1.02, -0.54)], 0.17, 0.05, {
          segs: 30,
          radial: 18,
          rAt: (t) => 0.05 + 0.13 * (1 - t) ** 1.6,
        }),
        pinkMat,
      );
      const collarRing = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.052, 0.05, 18), toon(PINK_D));
      const top = rel(0.6, 1.02, -0.54);
      const dir = new V3(0.18, 0.7, -0.06).normalize();
      collarRing.position.copy(top);
      collarRing.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
      const SH = 0.56, GR = 0.4;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, SH, 14), toon('#f4f5fa'));
      shaft.position.copy(top).addScaledVector(dir, SH / 2);
      shaft.quaternion.copy(collarRing.quaternion);
      const stripes = kit.canvasTex(128, 256, (x, w, h) => {
        x.fillStyle = '#f597b8';
        x.fillRect(0, 0, w, h);
        x.strokeStyle = '#ffd9e6';
        x.lineWidth = 12;
        for (let i = -8; i < 8; i++) {
          x.beginPath();
          x.moveTo(i * 32, 0);
          x.lineTo(i * 32 + w, h / 2);
          x.moveTo(i * 32, h / 2);
          x.lineTo(i * 32 + w, h);
          x.stroke();
        }
      });
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.044, GR, 18, 1), toon('#ffffff', { map: stripes }));
      grip.position.copy(top).addScaledVector(dir, SH + GR / 2);
      grip.quaternion.copy(collarRing.quaternion);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 10, 0, TAU, 0, Math.PI / 2), toon('#f597b8'));
      cap.position.copy(top).addScaledVector(dir, SH + GR);
      cap.quaternion.copy(collarRing.quaternion);
      cap.scale.y = 0.5;
      club.add(neck, collarRing, shaft, grip, cap);
    }
    g.add(club);

    kit.ink(root);

    // ---- life ----
    const lookX = new Spring(60, 12), lookY = new Spring(60, 12);
    const squash = new Spring(180, 10), clubKick = new Spring(70, 5), swing = new Spring(40, 2.2);
    let blinkT = 0, nextBlink = 1.2, happy = 0, wander = { x: 0, y: 0 }, nextLook = 0;
    let waveT = 9, nextWave = 1.5, hopT = 9, wiggle = 0, prevY = 0;
    return {
      group: root,
      update(dt, t, ctx) {
        // eyes: blink, wander, follow the pointer when she's looked at
        nextBlink -= dt;
        if (nextBlink <= 0) {
          blinkT = 1;
          nextBlink = 2 + Math.random() * 3;
        }
        blinkT = Math.max(0, blinkT - dt / 0.18);
        happy = Math.max(0, happy - dt);
        const shut = Math.max(Math.sin(Math.PI * blinkT), happy > 0 ? 0.62 : 0);
        nextLook -= dt;
        if (nextLook <= 0) {
          wander = { x: Math.random() * 1.4 - 0.7, y: Math.random() * 0.8 - 0.3 };
          nextLook = 1.2 + Math.random() * 2;
        }
        lookX.target = ctx.focused ? ctx.ndc.x * 1.2 : wander.x;
        lookY.target = ctx.focused ? ctx.ndc.y * 1.2 : wander.y;
        lookX.update(dt);
        lookY.update(dt);
        for (const e of eyes) {
          e.blink(shut);
          e.look(lookX.x, lookY.x);
        }
        // the toes: a wave runs along them every few seconds (and wiggle hard when she's happy)
        nextWave -= dt;
        if (nextWave <= 0) {
          waveT = 0;
          nextWave = 2.2 + Math.random() * 2.2;
        }
        waveT += dt;
        wiggle = Math.max(0, wiggle - dt);
        toes.forEach((toe, i) => {
          const u = (waveT - i * 0.09) / 0.32;
          const wave = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0;
          const fast = wiggle > 0 ? Math.max(0, Math.sin(t * 22 + i * 1.3)) * Math.min(1, wiggle) : 0;
          toe.rotation.x = -0.42 * wave - 0.35 * fast;
        });
        // the happy bounce: two hops, a squash on each landing
        hopT += dt;
        let y = 0;
        if (hopT < 0.42) y = 0.17 * Math.sin((Math.PI * hopT) / 0.42);
        else if (hopT < 0.72) y = 0.07 * Math.sin((Math.PI * (hopT - 0.42)) / 0.3);
        if (prevY > 0 && y <= 0) squash.kick(-3.2);
        if (prevY > 0 && y > 0 && hopT >= 0.42 && hopT - dt < 0.42) squash.kick(-2.2);
        prevY = y;
        const q = squash.update(dt);
        g.position.y = y;
        g.scale.set(1 - q * 0.08, 1 + q * 0.12, 1 - q * 0.08);
        // the club sways like a tail; the charm swings; the pom bobs
        const ck = clubKick.update(dt);
        club.rotation.z = Math.sin(t * 1.5) * 0.07 + ck * 0.35;
        club.rotation.x = Math.sin(t * 0.95 + 0.7) * 0.045;
        swing.target = Math.sin(t * 1.5) * 0.08;
        swing.update(dt);
        charm.rotation.z = swing.x;
        charm.rotation.x = -Math.abs(swing.x) * 0.3;
        pom.position.y = 0.175 + Math.sin(t * 3.1) * 0.006 + Math.max(0, y) * 0.08;
        hat.rotation.z = -0.24 + Math.sin(t * 1.5 + 0.5) * 0.025 - q * 0.05;
      },
      react() {
        hopT = 0;
        happy = 0.9;
        wiggle = 1.1;
        clubKick.kick(5);
        swing.kick(4);
      },
    };
  },
};
