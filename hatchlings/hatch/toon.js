/* The hatchlings' modelling kit: the storybook-toon look of the Herbology
   garden (cel bands and an ink line), for creatures built in code.

   The ink line is drawn as a dark shell behind each part (its back faces,
   pushed out along the normals), not with three's OutlineEffect: that one
   takes over the whole render, and the hatchery renders through a bloom pass. */

import * as THREE from 'three';

export const V3 = THREE.Vector3;
export const TAU = Math.PI * 2;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const INK = '#2b1220';

function gradient(vals) {
  const d = new Uint8Array(vals.length * 4);
  vals.forEach((v, i) => d.set([v, v, v, 255], i * 4));
  const t = new THREE.DataTexture(d, vals.length, 1);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}
/** Three light bands and a shadow band, as in the garden. */
export const BANDS = gradient([110, 170, 225, 255]);

/** The house material: flat cel bands of one colour (or of a painted map). */
export function toon(color, o = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: BANDS, ...o });
}

const inkMats = new Map();
function inkMat(w, color) {
  const k = `${w}|${color}`;
  if (!inkMats.has(k)) {
    inkMats.set(
      k,
      new THREE.ShaderMaterial({
        uniforms: { uW: { value: w }, uCol: { value: new THREE.Color(color) } },
        vertexShader: /* glsl */ `
          uniform float uW;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * normal);
            // pushed out in proportion to the distance, so the line keeps one width on screen
            mv.xyz += n * uW * -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uCol;
          void main() {
            gl_FragColor = vec4(uCol, 1.0);
            #include <colorspace_fragment>
          }`,
        side: THREE.BackSide,
      }),
    );
  }
  return inkMats.get(k);
}
/** Gives every mesh under root an ink line (meshes marked userData.noInk are skipped). */
export function ink(root, w = 0.0032, color = INK) {
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && !o.userData.noInk && !o.userData.isInk) meshes.push(o);
  });
  for (const m of meshes) {
    // (a part can carry its own line colour: the gold edge of a ribbon)
    const hull = new THREE.Mesh(m.geometry, inkMat(m.userData.inkW ?? w, m.userData.inkColor ?? color));
    hull.userData.isInk = true;
    hull.renderOrder = m.renderOrder;
    m.add(hull);
  }
  return root;
}
export const noInk = (m) => ((m.userData.noInk = true), m);

/** A tube through points whose radius runs from r0 to r1 (or follows rAt(t)). */
export function taperTube(points, r0, r1 = r0, { segs = 40, radial = 14, rAt = null, closed = false } = {}) {
  const curve = typeof points.getPointAt === 'function' ? points : new THREE.CatmullRomCurve3(points);
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, closed);
  const p = g.attributes.position, n = g.attributes.normal;
  for (let j = 0; j <= segs; j++) {
    const t = j / segs, r = rAt ? rAt(t) : lerp(r0, r1, t), c = curve.getPointAt(t);
    for (let i = 0; i <= radial; i++) {
      const k = j * (radial + 1) + i;
      p.setXYZ(k, c.x + n.getX(k) * r, c.y + n.getY(k) * r, c.z + n.getZ(k) * r);
    }
  }
  g.computeVertexNormals();
  return g;
}

export function canvasTex(w, h, draw, { srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A flat badge (a disc or a plane) painted in code, laid on a surface. */
export function decal(w, h, draw, { round = true, px = 256 } = {}) {
  const t = canvasTex(px, Math.round((px * h) / w), draw);
  const g = round ? new THREE.CircleGeometry(w / 2, 40) : new THREE.PlaneGeometry(w, h);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  return noInk(m);
}

/**
 * A big storybook eye, set into a surface and facing +Z: a white, a painted iris that follows the
 * pointer, an upper lid that blinks, and lashes on the lid.
 *   blink(k)  0 open .. 1 shut;  look(x, y)  -1..1
 */
export function eye({ r = 0.12, iris = '#e0386a', irisDark = '#7a0f35', lid = '#f07a8e', lashes = 3, side = 1 } = {}) {
  const g = new THREE.Group();
  const white = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), toon('#fffaf6'));
  white.scale.z = 0.62;
  g.add(white);
  const irisTex = canvasTex(256, 256, (x, w, h) => {
    const c = w / 2;
    const rg = x.createRadialGradient(c, c * 1.08, 4, c, c, c);
    rg.addColorStop(0, '#ffd3e2');
    rg.addColorStop(0.45, iris);
    rg.addColorStop(0.92, irisDark);
    rg.addColorStop(1, '#2a0814');
    x.fillStyle = rg;
    x.beginPath();
    x.arc(c, c, c, 0, TAU);
    x.fill();
    x.fillStyle = '#1c0610';
    x.beginPath();
    x.arc(c, c * 1.02, c * 0.38, 0, TAU);
    x.fill();
    // the shine: a big soft one high on one side, a small one low on the other, a twinkle
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.ellipse(c - c * 0.32 * side, c - c * 0.36, c * 0.26, c * 0.2, -0.5, 0, TAU);
    x.fill();
    x.beginPath();
    x.arc(c + c * 0.36 * side, c + c * 0.38, c * 0.1, 0, TAU);
    x.fill();
    x.globalAlpha = 0.6;
    x.beginPath();
    x.arc(c + c * 0.1 * side, c - c * 0.55, c * 0.06, 0, TAU);
    x.fill();
  });
  const look = new THREE.Group();
  const irisM = noInk(new THREE.Mesh(new THREE.CircleGeometry(r * 0.78, 40), new THREE.MeshBasicMaterial({ map: irisTex })));
  irisM.position.z = r * 0.6;
  look.add(irisM);
  g.add(look);
  // the lid: the top half of a shell just bigger than the eye, swung down to blink
  const lidM = new THREE.Mesh(new THREE.SphereGeometry(r * 1.07, 32, 14, 0, TAU, 0, Math.PI / 2), toon(lid, { side: THREE.DoubleSide }));
  lidM.scale.z = 0.7;
  g.add(lidM);
  const lashMat = new THREE.MeshBasicMaterial({ color: INK });
  for (let i = 0; i < lashes; i++) {
    const a = 0.25 + i * 0.32; // round the outer corner
    const len = r * (0.42 - i * 0.06);
    const lash = noInk(new THREE.Mesh(new THREE.ConeGeometry(r * 0.07, len, 6), lashMat));
    const rim = new V3(Math.cos(a) * side * r * 1.07, 0.02 * r, Math.sin(a) * r * 0.75);
    const out = new V3(Math.cos(a) * side * 0.8, 0.9, Math.sin(a) * 0.3).normalize();
    lash.position.copy(rim).addScaledVector(out, len / 2);
    lash.quaternion.setFromUnitVectors(new V3(0, 1, 0), out);
    lidM.add(lash);
  }
  return {
    group: g,
    white,
    blink(k) {
      // open: the lid folded back over the top; shut: swung down over the front
      lidM.rotation.x = lerp(-1.15, 1.5, clamp(k, 0, 1));
      look.visible = k < 0.85;
    },
    look(x, y) {
      look.position.set(clamp(x, -1, 1) * r * 0.16, clamp(y, -1, 1) * r * 0.12, 0);
    },
  };
}

/** A soft round blush, laid on a surface. */
export function blush(w, h, color = '240,110,140') {
  return decal(w, h, (x, W, H) => {
    const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    g.addColorStop(0, `rgba(${color},.7)`);
    g.addColorStop(0.6, `rgba(${color},.3)`);
    g.addColorStop(1, `rgba(${color},0)`);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  });
}

/** A damped spring toward a target. */
export class Spring {
  constructor(k = 120, c = 12) {
    this.k = k;
    this.c = c;
    this.x = 0;
    this.v = 0;
    this.target = 0;
  }
  kick(v) {
    this.v += v;
  }
  update(dt) {
    this.v += (-this.k * (this.x - this.target) - this.c * this.v) * dt;
    this.x += this.v * dt;
    return this.x;
  }
}
