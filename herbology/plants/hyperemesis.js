/* 10. Hyperemesis Gravidarum: the Hyperemesis Bellflower.
   From her slide (refs/p22_0.jpg): a tall, gaunt vine of many twisted green-
   brown strands with thin vines spiralling round it, rising from a wide mat of
   tangled dark roots. Drooping, tattered leaves full of holes, curly tendrils,
   purplish bruised tints. At the top it arches over and hangs a big drooping
   bell hood, green and spotted outside, mauve inside, with a ragged scalloped
   rim. Under it a sad, sickly green face: closed weeping eyes, furrowed brows,
   an open downturned mouth pouring a pale lime stream into a spreading puddle.
   Storybook, not gross: the stream is translucent and the puddle glossy.
   Healed (my addition, from "Recovery: The Bloom"): the stream stops and the
   puddle dries up, the vine stands up and fills out, the holes close and the
   leaves turn fresh green, the hood lifts and opens into a bright bellflower
   turned to the sun, she opens her eyes, smiles and sips a dewdrop, and small
   bellflowers bloom along the vine. */

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default {
  id: 'hyperemesis',
  look: { ink: '#232913', bands: [92, 156, 214, 255], outline: 0.0042, rune: ['#c6d46a', '#b8a4f0'], bg: ['#4b5536', '#252b19', '#0b0e07'] },
  frame: { halfH: 1.68, halfW: 1.35, lookY: 1.4 },
  careTitle: 'Help her keep it down',
  lines: {
    sick: "I can't keep anything down...",
    wrong: ['Urgh... not that...', 'It all comes back up...', "I can't keep anything down..."],
    right: ['Small sips... that helps.', 'A little better...'],
    healed: 'I can finally eat!',
  },
  shows: [
    '<b>A stream that never stops, and heaving fits every few seconds</b>: persistent, severe nausea and vomiting; food and fluids will not stay down.',
    '<b>Gaunt, stringy strands and leaves eaten full of holes</b>: weight loss and malnutrition.',
    '<b>Leaves curling up with crisp brown edges, a puddle spreading below</b>: dehydration, fluid lost faster than it goes in.',
    '<b>A fast, shaky tremble, and a wobble each time it straightens up</b>: tachycardia and orthostatic dizziness.',
    '<b>Sagging vine, heavy closed eyes, purple bruised tints</b>: exhaustion, with electrolytes and nourishment drained away.',
  ],
  healedNote: 'Healed, the stream stops and the puddle dries up; the vine stands up and fills out, the holes close and the leaves turn fresh green, and the drooping hood lifts into a bright bellflower turned to the sun. She opens her eyes, smiles and sips a dewdrop: small amounts, kept down.',

  build(kit) {
    const { THREE, world, toon, noOutline, canvasTex, sheet, limb, lumpGeo, taperTube, tendrilGeo, addLeaf, face, palette, Spring,
      particles, spark, wisp, randDir, rnd, M, REDUCE, clamp, lerp, sstep, V3, TAU, UP, lights, blob, rune, tex, mergeGeometries, heartbeat } = kit;
    const R = rng(22062026);
    const rr = (a, b) => a + (b - a) * R();

    /* ---------- her light: parchment warm key, olive bounce, a lilac fill ---------- */
    lights.hemi.color.set('#f4f1dc'); lights.hemi.groundColor.set('#4a4a2c'); lights.hemi.intensity = 1.2;
    lights.key.color.set('#fff4dc');
    lights.rim.color.set('#d9f0a8');
    lights.fill.color.set('#e4d6ff');
    lights.heal.color.set('#efe0ff');
    blob.scale.setScalar(1.15); rune.scale.setScalar(1.05);

    const P = palette({
      vine: ['#77703f', '#5f9440'], vine2: ['#5f5634', '#74a347'], root: ['#5a4632', '#614a32'],
      leaf: ['#6f7c3a', '#5ea345'], leaf2: ['#636e34', '#78b052'],
      hoodOut: ['#a3ae66', '#a28ce6'], hoodSpot: ['#5c6930', '#8670d6'], hoodIn: ['#7a5a7c', '#e4b6f0'],
      skin: ['#aab670', '#c6de98'],
    });

    /** A toon material whose map is a mask: the glsl mixes colours by its channels. */
    function masked(color, map, U, glsl, o = {}) {
      const m = toon(color, { map, ...o });
      const decl = Object.entries(U).map(([k, u]) => `uniform ${u.value.isColor ? 'vec3' : 'float'} ${k};`).join('\n');
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.fragmentShader = decl + '\n' + sh.fragmentShader.replace('#include <map_fragment>', `vec4 mk = texture2D( map, vMapUv );\n${glsl}`);
      };
      m.customProgramCacheKey = () => 'hyp|' + glsl;
      return m;
    }

    /* ---------- painted masks ---------- */
    // vine: r = dark grain, g = pale highlights, b = purple bruise streaks
    const vineMask = canvasTex(128, 512, (c, w, h) => {
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 70; i++) {
        const px = R() * w, red = R() < 0.65;
        c.strokeStyle = red ? `rgba(255,0,0,${rr(0.35, 0.9)})` : `rgba(0,255,0,${rr(0.3, 0.7)})`;
        c.lineWidth = rr(1, 3.2); c.beginPath(); c.moveTo(px, 0);
        for (let y = 0; y <= h; y += 24) c.lineTo(px + Math.sin(y * 0.03 + i) * 5, y);
        c.stroke();
      }
      c.filter = 'blur(4px)';
      for (let i = 0; i < 9; i++) {
        const px = R() * w, y0 = R() * h;
        c.strokeStyle = 'rgba(0,0,255,.9)'; c.lineWidth = rr(6, 14);
        c.beginPath(); c.moveTo(px, y0); c.lineTo(px + rr(-8, 8), y0 + rr(80, 220)); c.stroke();
      }
    }, { srgb: false, repeat: true });
    vineMask.repeat.set(1, 3);

    // hood: r = spots, g = ribs, b = dry rim
    const hoodMask = canvasTex(512, 256, (c, w, h) => {
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 21; i++) {
        const u0 = (i / 21) * w; c.strokeStyle = 'rgba(0,255,0,.6)'; c.lineWidth = rr(1.5, 3);
        c.beginPath(); for (let y = 0; y <= h; y += 8) c.lineTo(u0 + Math.sin(y * 0.04 + i) * 4, y); c.stroke();
      }
      for (let i = 0; i < 280; i++) {
        const v = Math.pow(R(), 1.25);
        c.fillStyle = `rgba(255,0,0,${rr(0.55, 1)})`;
        c.beginPath(); c.ellipse(R() * w, (1 - v) * h * 0.97, rr(2.2, 5.5), rr(4.5, 12), rr(-0.2, 0.2), 0, TAU); c.fill();
      }
      const g = c.createLinearGradient(0, 0, 0, h * 0.14);
      g.addColorStop(0, 'rgba(0,0,255,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h * 0.14);
    }, { srgb: false });

    /* ---------- materials ---------- */
    const vineU = { uBruise: { value: new THREE.Color('#6c4568') }, uBruiseK: { value: 0.8 } };
    const VINE_GLSL = `diffuseColor.rgb *= 1.0 - mk.r * 0.34;
      diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * 1.2 + vec3( 0.04 ), mk.g * 0.5 );
      diffuseColor.rgb = mix( diffuseColor.rgb, uBruise, clamp( mk.b * uBruiseK, 0.0, 1.0 ) );`;
    const vineMat = masked(P.pal.vine[0], vineMask, vineU, VINE_GLSL, { thickness: 0.0042 });
    const vine2Mat = masked(P.pal.vine2[0], vineMask, vineU, VINE_GLSL, { thickness: 0.0026 });
    const rootMat = toon(P.pal.root[0], { map: tex.bark, thickness: 0.0034 });

    const leafU = { uBruise: { value: new THREE.Color('#7a4f78') }, uBruiseK: { value: 0.8 }, uDry: { value: new THREE.Color('#8a6a3a') }, uDryK: { value: 1 } };
    const LEAF_GLSL = `diffuseColor.rgb = mix( diffuseColor.rgb, uBruise, clamp( mk.b * uBruiseK, 0.0, 1.0 ) );
      diffuseColor.rgb = mix( diffuseColor.rgb, uDry, clamp( mk.g * uDryK, 0.0, 1.0 ) );
      diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * 1.22 + vec3( 0.05 ), mk.r * 0.6 );`;

    const hoodU = {
      uSpot: { value: new THREE.Color(P.pal.hoodSpot[0]) }, uSpotK: { value: 0.9 }, uInner: { value: new THREE.Color(P.pal.hoodIn[0]) },
      uDry: { value: new THREE.Color('#7a6a3a') }, uDryK: { value: 1 },
    };
    const hoodMat = masked(P.pal.hoodOut[0], hoodMask, hoodU, `
      vec3 outer = mix( diffuseColor.rgb, uSpot, mk.r * uSpotK );
      outer *= 1.0 - mk.g * 0.16;
      outer = mix( outer, uDry, mk.b * uDryK * 0.55 );
      vec3 inner = mix( uInner * 0.55, uInner, smoothstep( 0.05, 0.95, vMapUv.y ) );
      inner *= 1.0 - mk.g * 0.22;
      diffuseColor.rgb = gl_FrontFacing ? outer : inner;`, { side: THREE.DoubleSide, thickness: 0.0045 });

    const skinMat = toon(P.pal.skin[0], { thickness: 0.0042 });
    const tearMat = toon('#d6eef4', { transparent: true, opacity: 0.85, emissive: '#9fc8d8', emissiveIntensity: 0.25, thickness: 0.0016, ink: '#4f6a70' });
    const dewMat = toon('#e6f8ff', { transparent: true, opacity: 0.8, emissive: '#bfe6ff', emissiveIntensity: 0.35, thickness: 0.002, ink: '#4f6a70' });
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ffffff' }));

    /* ---------- the goo: a scrolling, translucent stream and a glossy pool ---------- */
    const streamTex = canvasTex(64, 256, (c, w, h) => {
      c.fillStyle = '#d4de8e'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        const light = R() < 0.55, px = R() * w;
        c.strokeStyle = light ? 'rgba(244,248,206,.85)' : 'rgba(160,174,90,.7)'; c.lineWidth = light ? rr(2, 5) : rr(1, 2.5);
        c.beginPath(); c.moveTo(px, 0); for (let y = 0; y <= h; y += 16) c.lineTo(px + Math.sin(y * 0.05 + i) * 3, y); c.stroke();
      }
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(R() * w, R() * h, rr(2, 4.5), 0, TAU); c.stroke(); }
    }, { repeat: true });
    const streamMat = toon('#ffffff', { map: streamTex, transparent: true, opacity: 0.84, emissive: '#5a6420', emissiveIntensity: 0.3, thickness: 0.0024, ink: '#56602a' });
    const puddleTex = canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = '#c2cb8a'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 46; i++) {
        c.fillStyle = 'rgba(222,231,162,.75)'; c.strokeStyle = 'rgba(160,172,84,.85)'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(R() * w, R() * h, rr(7, 20), rr(6, 15), rr(0, TAU), 0, TAU); c.fill(); c.stroke();
      }
      c.fillStyle = 'rgba(255,255,255,.8)';
      for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(rr(40, 216), rr(40, 216), rr(6, 14), rr(2, 4), rr(-0.5, 0.5), 0, TAU); c.fill(); }
      const g = c.createRadialGradient(w / 2, h / 2, w * 0.22, w / 2, h / 2, w * 0.5);
      g.addColorStop(0, 'rgba(120,132,52,0)'); g.addColorStop(1, 'rgba(120,132,52,.55)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
    const puddleMat = toon('#f2f4e0', { map: puddleTex, emissive: '#4a5418', emissiveIntensity: 0.12, thickness: 0.003, ink: '#56602a' });

    // particle sprites: white so they can be tinted; a darker rim reads as ink
    const dropTex = canvasTex(64, 64, (c) => {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(32, 32, 25, 0, TAU); c.fill();
      c.lineWidth = 5; c.strokeStyle = 'rgb(84,92,58)'; c.stroke();
      c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(26, 26, 7, 0, TAU); c.fill();
    }, { srgb: false });
    const bubTex = canvasTex(64, 64, (c) => {
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(32, 32, 26, 0, TAU); c.fill();
      c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(23, 23, 5, 0, TAU); c.fill();
    }, { srgb: false });
    const goo = particles(dropTex, 220);
    const bub = particles(bubTex, 48);

    /* ---------- roots: a wide tangle on the ground, one draw ---------- */
    const BASE = new V3(-0.36, 0, -0.06);
    {
      const parts = [];
      const root = (from, dir, len, y0, r0, branch) => {
        const side = new V3(-dir.z, 0, dir.x), pts = [], n = 7, ph = rr(0, TAU);
        for (let k = 0; k <= n; k++) {
          const f = k / n;
          const p = from.clone().addScaledVector(dir, len * f).addScaledVector(side, Math.sin(f * 6 + ph) * 0.05 * f + (k ? rr(-0.015, 0.015) : 0));
          p.y = lerp(y0, 0.012, Math.pow(f, 0.42)) + (k ? rr(0, 0.01) : 0);
          pts.push(p);
        }
        parts.push(taperTube(pts, r0, 0.004, { segs: 12, radial: 5 }));
        if (branch) for (let b = 0; b < 2; b++) {
          const k = 2 + Math.floor(R() * 3), d = dir.clone().applyAxisAngle(UP, rr(0.45, 0.9) * (b ? 1 : -1));
          root(pts[k].clone().setY(0.012), d, len * rr(0.3, 0.5), pts[k].y, r0 * 0.5, false);
        }
      };
      for (let i = 0; i < 17; i++) {
        const a = (i / 17) * TAU + rr(-0.15, 0.15), dir = new V3(Math.sin(a), 0, Math.cos(a));
        const len = rr(0.45, 0.8) * (0.75 + 0.55 * Math.abs(dir.x)) * (dir.z > 0.4 ? 0.7 : 1) * (dir.x > 0.3 && dir.z > 0 ? 0.8 : 1);
        root(BASE.clone().addScaledVector(dir, 0.06), dir, len, rr(0.1, 0.3), rr(0.024, 0.04), R() < 0.85);
      }
      const roots = new THREE.Mesh(mergeGeometries(parts), rootMat); roots.castShadow = true; world.add(roots);
      const soilTex = canvasTex(128, 128, (c, w) => {
        const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        g.addColorStop(0, 'rgba(46,36,22,.75)'); g.addColorStop(0.6, 'rgba(46,36,22,.4)'); g.addColorStop(1, 'rgba(46,36,22,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, w);
      });
      const soil = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.5), noOutline(new THREE.MeshBasicMaterial({ map: soilTex, transparent: true, depthWrite: false })));
      soil.rotation.x = -Math.PI / 2; soil.position.set(BASE.x, 0.005, BASE.z); world.add(soil);
    }

    /* ---------- the vine: five gaunt strands twisted together, three thin ones spiralling round ---------- */
    const NB = 8, VLEN = 2.6;
    const vine = limb({ len: VLEN, r0: 0.06, r1: 0.025, bones: NB, mat: vineMat, strands: 5, twist: 1.6, spread: 0.08, gnarl: 0.05, radial: 8, cap: false });
    const vine2 = limb({ len: VLEN, r0: 0.018, r1: 0.009, bones: NB, mat: vine2Mat, strands: 3, twist: 3.4, spread: 0.145, radial: 5, cap: false });
    /** Flare the base into the roots; add a morph target that fills the strands out. */
    function prepLimb(L, flareK, fill, radial) {
      const g = L.mesh.geometry, p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < 0.34) { const k = 1 + flareK * (1 - y / 0.34) ** 2; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
      }
      g.computeVertexNormals();
      const n = g.attributes.normal, d = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) {
        if (radial) { const x = p.getX(i), z = p.getZ(i), l = Math.hypot(x, z) || 1; d[i * 3] = (x / l) * fill; d[i * 3 + 2] = (z / l) * fill; }
        else { d[i * 3] = n.getX(i) * fill; d[i * 3 + 1] = n.getY(i) * fill * 0.2; d[i * 3 + 2] = n.getZ(i) * fill; }
      }
      g.morphAttributes.position = [new THREE.Float32BufferAttribute(d, 3)];
      g.morphTargetsRelative = true;
      L.mesh.updateMorphTargets();
    }
    prepLimb(vine, 1.3, 0.016, false);
    prepLimb(vine2, 1.2, 0.018, true);
    vine.mesh.position.copy(BASE); vine2.mesh.position.copy(BASE);
    vine2.mesh.castShadow = false;
    world.add(vine.mesh, vine2.mesh);
    const SEG = vine.seg;

    // her arch when sick; standing up when healed (angles per bone: z bends sideways, x toward you)
    const SICK_Z = [0.07, 0.04, -0.03, -0.06, -0.12, -0.28, -0.52, -0.72];
    const SICK_X = [0, 0.01, 0.0, 0.0, 0.0, 0.0, 0.02, 0.02];
    const WELL_Z = [0.25, 0.15, -0.1, -0.3, -0.4, -0.25, 0.15, 0.35];
    const WELL_X = [0, 0.02, 0.02, 0, -0.02, -0.02, 0, 0.06];
    const poseBones = (k, extra) => {
      for (let i = 0; i < NB; i++) {
        vine.bones[i].rotation.set(lerp(SICK_X[i], WELL_X[i], k) + (extra?.x[i] ?? 0), 0, lerp(SICK_Z[i], WELL_Z[i], k) + (extra?.z[i] ?? 0));
        vine2.bones[i].rotation.copy(vine.bones[i].rotation);
      }
      world.updateMatrixWorld(true);
    };

    /* ---------- leaves: tattered, holes that close, edges that curl ---------- */
    /** A leaf with holes eaten in it. Morph 0 opens the holes (each patch shrinks
        to its centre), morph 1 curls and crisps the edges. */
    function leafVariant(seed, { width = 0.36, cup = 0.13, curl = 0.18, point = 0.72, tipPinch = 0.3, nHoles = 5, nBites = 3 } = {}) {
      const r = rng(seed), q = (a, b) => a + (b - a) * r();
      const COLS = 14, ROWS = 24;
      const bites = Array.from({ length: nBites }, () => ({ v: q(0.2, 0.92), s: r() < 0.5 ? -1 : 1, d: q(0.3, 0.6), w: q(0.025, 0.06) }));
      const sgn = (u) => (u < 0 ? -1 : 1);
      const hw = (v, s) => {
        let w = width * Math.pow(Math.sin(Math.PI * Math.min(v * 1.05, 1)), point) * (1 - tipPinch * v);
        for (const b of bites) if (b.s === s) w *= 1 - b.d * Math.exp(-(((v - b.v) / b.w) ** 2));
        return Math.max(w, 1e-4);
      };
      const surf = (u, v, out) => { const w = hw(v, sgn(u)); return out.set(u * w, v, -cup * u * u * w * 2 + curl * v * v); };
      const dry = (u, v, out) => { const w = hw(v, sgn(u)); return out.set(-0.34 * u * Math.abs(u) * w, -0.07 * v ** 3, -0.6 * u * u * w - 0.22 * v ** 3); };
      const holes = [];
      for (let tries = 0; holes.length < nHoles && tries < 120; tries++) {
        const v = q(0.2, 0.86), s = r() < 0.5 ? -1 : 1, w = hw(v, s), u = s * q(0.2, 0.62), rad = q(0.045, 0.085) * Math.min(1, w / 0.22);
        const x = u * w;
        if (rad < 0.03 || Math.abs(x) + rad > w * 0.86 || Math.abs(x) - rad < 0.02) continue;
        if (holes.some((h) => Math.hypot(h.x - x, h.y - v) < h.r + rad + 0.035)) continue;
        holes.push({ x, y: v, r: rad, s });
      }
      const NV = (COLS + 1) * (ROWS + 1), U = new Float32Array(NV), Vv = new Float32Array(NV), FX = new Float32Array(NV);
      for (let j = 0; j <= ROWS; j++) for (let i = 0; i <= COLS; i++) {
        const k = j * (COLS + 1) + i, u = (i / COLS) * 2 - 1, v = j / ROWS;
        U[k] = u; Vv[k] = v; FX[k] = u * hw(v, sgn(u));
      }
      const tris = [];
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const a = j * (COLS + 1) + i, b = a + 1, c = a + COLS + 1, d = c + 1;
        tris.push([a, b, d], [a, d, c]);
      }
      const inHole = (x, y) => holes.findIndex((h) => (x - h.x) ** 2 + (y - h.y) ** 2 < h.r * h.r);
      const triHole = tris.map(([a, b, c]) => inHole((FX[a] + FX[b] + FX[c]) / 3, (Vv[a] + Vv[b] + Vv[c]) / 3));
      const kept = new Uint8Array(NV), holeOf = new Int16Array(NV).fill(-1);
      tris.forEach((t, n) => { for (const k of t) { if (triHole[n] < 0) kept[k] = 1; else holeOf[k] = triHole[n]; } });
      for (let k = 0; k < NV; k++) {                // snap each hole's edge onto its circle
        if (!kept[k] || holeOf[k] < 0) continue;
        const h = holes[holeOf[k]], dx = FX[k] - h.x, dy = Vv[k] - h.y, l = Math.hypot(dx, dy) || 1;
        const x = h.x + (dx / l) * h.r, y = clamp(h.y + (dy / l) * h.r, 0, 1);
        Vv[k] = y; U[k] = clamp(x / hw(y, sgn(x)), -1, 1);
      }
      const pos = [], uv = [], dH = [], dC = [], idx = [], map = new Int32Array(NV).fill(-1);
      const a3 = new V3(), b3 = new V3(), cen = holes.map((h) => surf(h.x / hw(h.y, h.s), h.y, new V3()));
      const push = (k, hi) => {
        surf(U[k], Vv[k], a3); pos.push(a3.x, a3.y, a3.z); uv.push(U[k] * 0.5 + 0.5, Vv[k]);
        dry(U[k], Vv[k], b3); dC.push(b3.x, b3.y, b3.z);
        if (hi >= 0) dH.push(cen[hi].x - a3.x, cen[hi].y - a3.y, cen[hi].z - a3.z); else dH.push(0, 0, 0);
        return pos.length / 3 - 1;
      };
      tris.forEach((t, n) => {
        if (triHole[n] < 0) for (const k of t) { if (map[k] < 0) map[k] = push(k, -1); idx.push(map[k]); }
        else for (const k of t) idx.push(push(k, triHole[n]));
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      g.morphAttributes.position = [new THREE.Float32BufferAttribute(dH, 3), new THREE.Float32BufferAttribute(dC, 3)];
      g.morphTargetsRelative = true;
      // its mask: r = veins, g = dry brown edges, tip and hole rims, b = bruises
      const mask = canvasTex(128, 256, (c, W, H) => {
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'lighter';
        const ge = c.createLinearGradient(0, 0, W, 0);
        ge.addColorStop(0, 'rgba(0,255,0,1)'); ge.addColorStop(0.08, 'rgba(0,255,0,.35)'); ge.addColorStop(0.18, 'rgba(0,0,0,0)');
        ge.addColorStop(0.82, 'rgba(0,0,0,0)'); ge.addColorStop(0.92, 'rgba(0,255,0,.35)'); ge.addColorStop(1, 'rgba(0,255,0,1)');
        c.fillStyle = ge; c.fillRect(0, 0, W, H);
        const gt = c.createLinearGradient(0, 0, 0, H * 0.16);
        gt.addColorStop(0, 'rgba(0,255,0,1)'); gt.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gt; c.fillRect(0, 0, W, H * 0.16);
        c.strokeStyle = 'rgba(0,255,0,1)';
        for (const h of holes) {
          const w = hw(h.y, h.s);
          c.lineWidth = 5; c.beginPath(); c.ellipse(((h.x / w) * 0.5 + 0.5) * W, (1 - h.y) * H, (h.r / w) * 0.5 * W + 2, h.r * H + 2, 0, 0, TAU); c.stroke();
        }
        c.strokeStyle = 'rgba(255,0,0,1)'; c.lineCap = 'round';
        c.lineWidth = 4; c.beginPath(); c.moveTo(W / 2, H); c.lineTo(W / 2, 8); c.stroke();
        c.lineWidth = 2;
        for (let i = 1; i <= 7; i++) {
          const y = H - (i * H) / 8.2;
          for (const s of [-1, 1]) { c.beginPath(); c.moveTo(W / 2, y); c.quadraticCurveTo(W / 2 + s * W * 0.2, y - H * 0.04, W / 2 + s * W * 0.44, y - H * 0.12); c.stroke(); }
        }
        c.filter = 'blur(7px)'; c.fillStyle = 'rgba(0,0,255,.9)';
        for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(q(0.2, 0.8) * W, q(0.2, 0.8) * H, q(10, 22), q(16, 34), 0, 0, TAU); c.fill(); }
      }, { srgb: false });
      return { geo: g, mask };
    }
    const VARIANTS = [
      leafVariant(11, { nHoles: 6, nBites: 5 }), leafVariant(23, { width: 0.32, nHoles: 5, nBites: 5, curl: 0.24 }), leafVariant(37, { width: 0.4, nHoles: 7, point: 0.65, nBites: 6 }),
    ];
    const leafMats = VARIANTS.map((v, i) => masked(P.pal[i === 1 ? 'leaf2' : 'leaf'][0], v.mask, leafU, LEAF_GLSL, { side: THREE.DoubleSide, thickness: 0.0034 }));

    // leaf directions are given in world terms, then turned into each bone's frame at both poses
    const leaves = [];
    const LEAVES = [
      // bone, along, azimuth (deg, 0 = toward you, 90 = right), size, variant, well dir, sick dir
      [1, 0.45, -95, 0.68, 0, [-0.8, 0.4, 0.1], [-0.85, -0.55, 0.2]],
      [1, 0.8, 85, 0.62, 1, [0.8, 0.4, 0.15], [0.8, -0.65, 0.3]],
      [2, 0.5, -150, 0.54, 2, [-0.5, 0.4, -0.6], [-0.5, -0.6, -0.7]],
      [2, 0.9, 115, 0.57, 0, [0.7, 0.4, -0.3], [0.75, -0.6, -0.2]],
      [3, 0.55, -70, 0.62, 2, [-0.85, 0.4, 0.35], [-0.8, -0.7, 0.4]],
      [4, 0.3, 30, 0.54, 1, [0.6, 0.4, 0.5], [0.55, -0.75, 0.6]],
      [5, 0.4, -110, 0.54, 0, [-0.8, 0.4, -0.1], [-0.75, -0.55, 0.1]],
      [6, 0.2, -45, 0.46, 2, [-0.5, 0.4, 0.4], [-0.6, 0.2, 0.75]],
      [6, 0.8, 170, 0.43, 1, [0.1, 0.4, -0.7], [-0.1, 0.4, -0.95]],
      [7, 0.6, 60, 0.41, 0, [0.6, 0.4, 0.2], [0.2, 0.9, 0.4]],
    ];
    {
      const toBone = (bone, d) => d.clone().applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()).invert()).normalize();
      poseBones(0); const sickDirs = LEAVES.map(([b, , , , , , ds]) => toBone(vine.bones[b], new V3(...ds)));
      poseBones(1); const wellDirs = LEAVES.map(([b, , , , , dw]) => toBone(vine.bones[b], new V3(...dw)));
      LEAVES.forEach(([b, along, az, size, vi], n) => {
        const out = new V3(Math.sin(az * Math.PI / 180), 0, Math.cos(az * Math.PI / 180));
        const at = out.clone().multiplyScalar(0.07).setY(SEG * along);
        const L = addLeaf(vine.bones[b], at, wellDirs[n], sickDirs[n], size, leafMats[vi], VARIANTS[vi].geo, out.clone().multiplyScalar(0.25).add(new V3(0, 1, 0)));
        L.mesh.castShadow = size > 0.38;
        leaves.push(L);
      });
    }

    // curly tendrils, merged per bone
    function tendrils(specs) {
      return mergeGeometries(specs.map(([p, d, spin, o]) => {
        const g = tendrilGeo({ thick: 0.009, ...o });
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize()).multiply(new THREE.Quaternion().setFromAxisAngle(UP, spin)));
        return g.translate(p.x, p.y, p.z);
      }));
    }
    const tendrilMeshes = [];
    for (const [b, specs] of [
      [2, [[new V3(-0.04, 0.1, 0.02), new V3(-1, 0.6, 0.2), 0.3, { rise: 0.14, r0: 0.07, coils: 1.8 }], [new V3(0.04, 0.22, -0.02), new V3(1, 0.8, -0.3), 2.8, { rise: 0.1, r0: 0.055, coils: 1.6, dir: -1 }]]],
      [4, [[new V3(-0.04, 0.15, 0.02), new V3(-1, 0.4, 0.3), 0.2, { rise: 0.16, r0: 0.08, coils: 2 }], [new V3(0.04, 0.05, 0.03), new V3(0.8, 0.3, 0.6), 2.4, { rise: 0.12, r0: 0.06, dir: -1 }]]],
      [6, [[new V3(0, 0.1, 0.04), new V3(-0.4, 1, 0.2), 0.6, { rise: 0.2, r0: 0.08, coils: 2.2 }], [new V3(0.03, 0.25, -0.03), new V3(0.3, 1, -0.5), 2, { rise: 0.15, r0: 0.07, dir: -1 }]]],
      [7, [[new V3(0, 0.2, 0.03), new V3(-0.6, 1, 0), 0.1, { rise: 0.24, r0: 0.09, coils: 2.4 }]]],
    ]) {
      const m = new THREE.Mesh(tendrils(specs), vine2Mat);
      vine.bones[b].add(m); tendrilMeshes.push({ m, ph: rr(0, TAU) });
    }

    /* ---------- the hood: a drooping bell that turns up into a bellflower ---------- */
    const HSEG = 56, HT = 18;
    const ragPh = [rr(0, TAU), rr(0, TAU), rr(0, TAU)];
    const rag = (th) => 0.5 * Math.sin(5 * th + ragPh[0]) + 0.3 * Math.sin(11 * th + ragPh[1]) + 0.2 * Math.sin(17 * th + ragPh[2]);
    /** A point on the hood: th around, t from apex (0) to rim (1); k = 0 hanging hood, 1 open bellflower. */
    function bellPoint(th, t, k, lobes, ragK, out, frontK = 1) {
      const lob = Math.pow(Math.abs(Math.sin((th * lobes) / 2)), 0.6), rg = rag(th) * ragK, front = Math.max(0, Math.cos(th)) ** 2;
      const r0 = 0.47 * Math.pow(Math.sin((t * Math.PI) / 2), 0.8) + (0.045 * lob + 0.03 * rg) * t ** 4;
      const y0 = -0.84 * t - (0.18 * lob + 0.06 * rg) * t ** 3 + 0.42 * front * t ** 3;
      const r1 = 0.09 * Math.sin((Math.min(1, t * 4) * Math.PI) / 2) + 0.31 * t ** 1.3 + 0.14 * lob * t ** 4;
      const y1 = -0.5 * t + 0.11 * lob * t ** 5 + 0.2 * front * t ** 3 * frontK;
      const rad = lerp(r0, r1, k), y = lerp(y0, y1, k);
      return out.set(Math.sin(th) * rad, y, Math.cos(th) * rad);
    }
    function bellGeo(segs, rows) {
      const g = new THREE.BufferGeometry(), n = (segs + 1) * (rows + 1), uv = [], idx = [];
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= segs; i++) uv.push(i / segs, j / rows);
      for (let j = 0; j < rows; j++) for (let i = 0; i < segs; i++) {
        const a = j * (segs + 1) + i, b = a + 1, c = a + segs + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    }
    function shapeBell(g, segs, rows, k, lobes, ragK, frontK = 1) {
      const p = g.attributes.position, v = new V3();
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= segs; i++) {
        bellPoint((i / segs) * TAU, j / rows, k, lobes, ragK, v, frontK);
        p.setXYZ(j * (segs + 1) + i, v.x, v.y, v.z);
      }
      p.needsUpdate = true; g.computeVertexNormals();
    }
    const hoodGeo = bellGeo(HSEG, HT);
    let hoodShapeK = -1;
    const hood = new THREE.Group(); world.add(hood);
    const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat); hoodMesh.castShadow = true; hoodMesh.frustumCulled = false; hood.add(hoodMesh);
    const rimTips = Array.from({ length: 7 }, (_, m) => Math.round((((2 * m + 1) * Math.PI) / 7 / TAU) * HSEG)).map((i) => HT * (HSEG + 1) + i);
    // the calyx where the vine enters, with two tendrils curling up off it
    hood.add(new THREE.Mesh(mergeGeometries([
      lumpGeo([[0, 0.01, 0, 0.065], [0.045, -0.03, 0.03, 0.045], [-0.04, -0.035, 0.03, 0.04], [0.01, -0.04, -0.045, 0.045]], 12, 9),
      tendrils([[new V3(0.02, 0.04, 0.02), new V3(0.5, 1, 0.3), 0.4, { rise: 0.12, r0: 0.08, coils: 2 }], [new V3(-0.03, 0.03, -0.02), new V3(-0.2, 1, -0.4), 2.6, { rise: 0.18, r0: 0.06, dir: -1 }]]),
    ]), vine2Mat));

    // the face, peeking out under the hood
    const HA = 0.2, HB = 0.25, HC = 0.18;
    const head = new THREE.Group(); hood.add(head);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), skinMat);
    headMesh.scale.set(HA, HB, HC); headMesh.castShadow = true; head.add(headMesh);
    const surfZ = (x, y) => HC * Math.sqrt(Math.max(1e-4, 1 - (x / HA) ** 2 - (y / HB) ** 2));
    const before = new Set(head.children);
    const MOUTH_Y = -0.12;
    const rig = face(head, {
      a: HA, b: HB, c: HC,
      eyes: { x: 0.082, y: 0.03, r: 0.048, iris: '#4a5a24', white: '#f4f2dc', lid: P.pal.skin[0].getStyle() },
      brows: { y: 0.105, len: 0.06, r: 0.009, color: '#3a4220' },
      mouth: { y: MOUTH_Y, inside: '#3e2a2a', lip: '#2a3014' },
      blush: { color: '232,140,150', x: 0.125, y: -0.06, w: 0.095, h: 0.06 },
      sickE: { lid: 0.0, low: 0.12, brow: 0.8, browY: 0.0, smile: -0.85, open: 0.75, w: 0.09 },
      wellE: { lid: 1, low: 0.3, brow: -0.05, browY: 0.012, smile: 1, open: 0.15, w: 0.1 },
      wrongE: { lid: 0, low: 0.5, brow: 1, browY: -0.006, smile: -1, open: 1.1, w: 0.115 },
      rightE: { lid: 0.4, low: 0.3, brow: 0.35, browY: 0.008, smile: -0.1, open: 0.25, w: 0.08 },
      gazeScale: 0.6,
    });
    const blushMats = head.children.filter((o) => !before.has(o) && o.isMesh && o.material.map).map((o) => o.material);
    // tear streaks down both cheeks, one draw
    {
      const parts = [];
      for (const s of [-1, 1]) {
        const pts = [];
        for (let k = 0; k <= 6; k++) { const f = k / 6, x = s * (0.1 + 0.024 * f), y = 0.0 - 0.15 * f; pts.push(new V3(x, y, surfZ(x, y) + 0.004)); }
        parts.push(taperTube(pts, 0.0075, 0.005, { segs: 12, radial: 5 }));
        const e = pts[6]; parts.push(new THREE.SphereGeometry(0.013, 10, 8).scale(1, 1.3, 0.8).translate(e.x, e.y - 0.008, e.z));
      }
      head.add(new THREE.Mesh(mergeGeometries(parts.map((g) => g.index ? g : g)), tearMat));
    }
    // healed: a little leaf held up under her chin, with a dewdrop to sip
    const dewLeafMat = leafMats[0];
    const dewLeaf = new THREE.Mesh(sheet({ width: 0.42, cup: 0.32, curl: 0.12, point: 0.6 }), dewLeafMat);
    const dewPivot = new THREE.Group(); dewPivot.position.set(0.07, -0.25, 0.12); head.add(dewPivot);
    dewPivot.add(dewLeaf); dewLeaf.quaternion.setFromUnitVectors(UP, new V3(-0.35, 0.35, 1).normalize());
    const dew = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), dewMat);
    const dewShine = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), shineMat); dewShine.position.set(-0.009, 0.01, 0.018); dew.add(dewShine);
    head.add(dew);
    const DEW_REST = new V3(0.0, -0.215, HC + 0.075);

    /* ---------- small bellflowers along the vine (healed) ---------- */
    const FSEG = 24, FT = 7;
    const flowerGeo = bellGeo(FSEG, FT); shapeBell(flowerGeo, FSEG, FT, 1, 5, 0, 0); flowerGeo.scale(0.27, 0.27, 0.27);
    const flowers = [];
    for (const [b, along, az, up] of [[1, 0.3, 160, 0.4], [2, 0.6, 60, 0.6], [3, 0.4, -120, 0.5], [4, 0.7, 110, 0.6], [5, 0.7, -40, 0.7], [6, 0.5, 80, 0.8], [3, 0.9, 20, 0.5]]) {
      const out = new V3(Math.sin(az * Math.PI / 180), 0, Math.cos(az * Math.PI / 180));
      const g = new THREE.Group(); g.position.copy(out).multiplyScalar(0.05).setY(SEG * along); vine.bones[b].add(g);
      const m = new THREE.Mesh(flowerGeo, hoodMat); g.add(m);
      g.quaternion.setFromUnitVectors(new V3(0, -1, 0), out.clone().multiplyScalar(1 - up).add(new V3(0, up, 0)).normalize());
      g.scale.setScalar(1e-4); g.visible = false;
      flowers.push({ g, i: flowers.length });
    }

    /* ---------- the stream: a tapering tube rebuilt in place each frame ---------- */
    const NS = 30, RS = 8;
    const streamGeo = new THREE.BufferGeometry();
    const sPos = new THREE.BufferAttribute(new Float32Array((NS + 1) * (RS + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const sNor = new THREE.BufferAttribute(new Float32Array((NS + 1) * (RS + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage);
    { const uv = [], idx = [];
      for (let k = 0; k <= NS; k++) for (let i = 0; i <= RS; i++) uv.push(i / RS, (k / NS) * 3);
      for (let k = 0; k < NS; k++) for (let i = 0; i < RS; i++) { const a = k * (RS + 1) + i, b = a + 1, c = a + RS + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
      streamGeo.setAttribute('position', sPos); streamGeo.setAttribute('normal', sNor);
      streamGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); streamGeo.setIndex(idx); }
    const stream = new THREE.Mesh(streamGeo, streamMat); stream.frustumCulled = false; world.add(stream);
    const sP = Array.from({ length: NS + 1 }, () => new V3()), sR = new Float32Array(NS + 1);
    const _t = new V3(), _b = new V3(), _n = new V3(), REF = new V3(1, 0, 0);
    function buildStream(M0, fwd, rMouth, rTop, gushK, cut, t) {
      const speed = 0.1 + 0.42 * gushK, g = 3.4;
      const vx = fwd.x * speed, vz = fwd.z * speed, vy = fwd.y * speed - 0.05;
      const T = (vy + Math.sqrt(vy * vy + 2 * g * Math.max(0.05, M0.y))) / g, t0 = cut * T;
      for (let k = 0; k <= NS; k++) {
        const u = k / NS, tau = lerp(t0, T, u);
        sP[k].set(M0.x + vx * tau + Math.sin(t * 2.3 + u * 3) * 0.012 * u, Math.max(0.004, M0.y + vy * tau - 0.5 * g * tau * tau), M0.z + vz * tau + Math.cos(t * 1.9 + u * 4) * 0.01 * u);
        let r = lerp(rMouth, rTop, sstep(0, 0.12, u)) * (1 - 0.5 * Math.pow(u, 0.7)) * (1 + 0.17 * Math.sin(u * 26 - t * 10) * M);
        r *= 1 + 1.4 * sstep(0.9, 1, u);
        if (cut > 0) r *= sstep(0, 0.14, u) * (1 - 0.6 * cut);
        sR[k] = Math.max(1e-4, r);
      }
      for (let k = 0; k <= NS; k++) {
        _t.subVectors(sP[Math.min(NS, k + 1)], sP[Math.max(0, k - 1)]).normalize();
        _b.crossVectors(_t, REF).normalize(); _n.crossVectors(_b, _t);
        for (let i = 0; i <= RS; i++) {
          const a = (i / RS) * TAU, ca = Math.cos(a), sa = Math.sin(a), j = k * (RS + 1) + i;
          const nx = ca * _n.x + sa * _b.x, ny = ca * _n.y + sa * _b.y, nz = ca * _n.z + sa * _b.z;
          sPos.setXYZ(j, sP[k].x + nx * sR[k], sP[k].y + ny * sR[k], sP[k].z + nz * sR[k]); sNor.setXYZ(j, nx, ny, nz);
        }
      }
      sPos.needsUpdate = true; sNor.needsUpdate = true;
    }

    /* ---------- the puddle: a glossy, lobed pool with globs at its edge ---------- */
    const PX = 0.5, PZ = 0.36;
    const lobR = (a) => 1 + 0.16 * Math.sin(3 * a + 1.1) + 0.1 * Math.sin(5 * a + 0.3) + 0.06 * Math.sin(9 * a + 2);
    const puddle = new THREE.Group(); world.add(puddle);
    {
      const NA = 48, NR = 7, H = 0.026, pos = [0, H, 0], uv = [0.5, 0.5], idx = [];
      for (let k = 1; k <= NR; k++) {
        const rho = 1 - (1 - k / NR) ** 1.6, y = H * Math.sqrt(Math.max(0, 1 - rho ** 8));
        for (let i = 0; i < NA; i++) {
          const a = (i / NA) * TAU, L = lobR(a), x = Math.cos(a) * L * rho * PX, z = Math.sin(a) * L * rho * PZ;
          pos.push(x, y, z); uv.push(x / (2.6 * PX) + 0.5, z / (2.6 * PZ) + 0.5);
        }
      }
      for (let i = 0; i < NA; i++) idx.push(0, 1 + ((i + 1) % NA), 1 + i);
      for (let k = 1; k < NR; k++) for (let i = 0; i < NA; i++) {
        const a = 1 + (k - 1) * NA + i, b = 1 + (k - 1) * NA + ((i + 1) % NA), c = a + NA, d = b + NA;
        idx.push(a, b, c, b, d, c);
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      pg.setIndex(idx); pg.computeVertexNormals();
      const globs = [];
      for (let i = 0; i < 9; i++) { const a = rr(0, TAU), L = lobR(a) * rr(0.82, 0.98); globs.push([Math.cos(a) * L * PX, 0.012, Math.sin(a) * L * PZ, rr(0.028, 0.055), 0.45]); }
      for (let i = 0; i < 4; i++) globs.push([rr(-0.25, 0.25), 0.024, rr(-0.15, 0.15), rr(0.025, 0.04), 0.4]);
      const pm = new THREE.Mesh(mergeGeometries([pg, lumpGeo(globs, 12, 8)]), puddleMat);
      pm.receiveShadow = true; puddle.add(pm);
    }
    let puddlePlaced = false;

    /* ---------- motion state ---------- */
    const bloomS = new Spring(46, 7.5);       // the hood lifting into a bell, with a little overshoot
    const wobS = new Spring(38, 2.6);         // the orthostatic wobble after each heave
    const pudS = new Spring(60, 8, 1);        // the puddle spreading with each gush
    const flowS = new Spring(30, 9, 0.35);    // how hard it pours
    let heave = null, nextHeave = 2.2, relief = null, cured = false, cureT = 0, sipT = 0, dribbleT = 0;
    const startHeave = (amp, skip = 0) => { heave = { t: skip, amp, splashed: false, kicked: false }; };
    const qSick = new THREE.Quaternion(), qWell = new THREE.Quaternion(), qTmp = new THREE.Quaternion(), qInv = new THREE.Quaternion(), eTmp = new THREE.Euler();
    function basisQ(q, axis, front) {
      const y = axis.clone().normalize().negate(), z = front.clone().addScaledVector(y, -front.dot(y)).normalize(), x = new V3().crossVectors(y, z);
      return q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    }
    basisQ(qSick, new V3(0.34, -0.86, 0.22), new V3(0.15, 0, 1));
    basisQ(qWell, new V3(0.04, 1, 0.4), new V3(0, 0, 1));
    const HEAD_SICK = new V3(0, -0.74, 0.25), HEAD_WELL = new V3(0, -0.36, 0.06);
    const tip = new V3(), mouthW = new V3(), fwdW = new V3(), wq = new THREE.Quaternion(), tmp = new V3();
    const ex = { x: new Float32Array(NB), z: new Float32Array(NB) };
    const headWorld = () => head.getWorldPosition(new V3());

    return {
      centre: headWorld,
      anchor: () => headWorld().add(tmp.set(0.42, 0.42, 0)),
      react(type) {
        if (type === 'wrong') {              // the curse flares: a big heave and gush, leaves recoil
          startHeave(1.5, 0.3); nextHeave = Math.max(nextHeave, 3.5);
        } else {                             // relief: the stream thins, a shaky breath
          relief = { t: 0 };
          const c = headWorld();
          for (let i = 0; i < 10; i++) { const d = randDir(); spark.emit(c.clone().addScaledVector(d, 0.35), { v: d.multiplyScalar(0.4), life: 0.9, s0: 0.08, s1: 0.02, color: '#dff4b0', drag: 1.6 }); }
        }
      },
      burst() { cured = true; cureT = 0; heave = null; relief = null; },
      reset() { cured = false; cureT = 0; heave = null; relief = null; nextHeave = 2.2; sipT = 0; flowS.set(0.35); },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        const hp = s.hp, fl = s.k.flinch.x;
        if (cured) cureT += dt;
        if (!heal.on && !s.healed && s.hTarget < 0.5) cured = false;   // health dragged back down

        /* colours */
        P.mix(vineMat, 'vine', h); P.mix(vine2Mat, 'vine2', h); P.mix(rootMat, 'root', h);
        leafMats.forEach((m, i) => P.mix(m, i === 1 ? 'leaf2' : 'leaf', h));
        const hb = sstep(0.55, 1, h);                                   // the hood keeps its green until it blooms
        P.mix(hoodMat, 'hoodOut', hb); P.mix(hoodU.uSpot.value, 'hoodSpot', hb); P.mix(hoodU.uInner.value, 'hoodIn', hb);
        P.mix(skinMat, 'skin', h); P.mix(rig.lidMat, 'skin', h);
        hoodU.uSpotK.value = lerp(0.9, 0.1, hb); hoodU.uDryK.value = clamp(1 - h * 1.2, 0, 1);
        vineU.uBruiseK.value = sick * 0.85; leafU.uBruiseK.value = sick * 0.8; leafU.uDryK.value = clamp(1 - h * 1.2, 0, 1);
        for (const m of blushMats) m.opacity = sstep(0.5, 1, h);
        tearMat.opacity = 0.85 * clamp(sick * 1.6, 0, 1);

        /* heaving fits, every ~5 s while sick */
        const ill = clamp(1 - h / 0.85, 0, 1);
        if (!heal.on && !cured && sick > 0.12) {
          nextHeave -= dt;
          if (nextHeave <= 0 && !heave) { startHeave(lerp(0.45, 1, ill)); nextHeave = lerp(7.5, 4.8, ill) + rnd(-0.4, 0.4); }
        }
        let wind = 0, lurch = 0, gush = 0;
        if (heave) {
          const T = (heave.t += dt), a = heave.amp;
          wind = sstep(0, 0.42, T) * (1 - sstep(0.42, 0.58, T)) * a;
          lurch = sstep(0.45, 0.62, T) * (1 - sstep(0.85, 1.7, T)) * a;
          gush = sstep(0.5, 0.64, T) * (1 - sstep(0.75, 2.3, T)) * a;
          if (!heave.kicked && T > 1.45) { heave.kicked = true; wobS.kick(4.5 * a * M); }
          if (T > 2.4) heave = null;
        }
        let relEnv = 0, breath = 0;
        if (relief) {
          const T = (relief.t += dt);
          relEnv = sstep(0, 0.25, T) * (1 - sstep(1.0, 1.5, T));
          breath = Math.sin(Math.PI * clamp(T / 1.3, 0, 1));
          if (T > 0.9 && !relief.kicked) { relief.kicked = true; wobS.kick(1.6 * M); }
          if (T > 1.6) relief = null;
        }
        wobS.step(dt); bloomS.step(dt);
        bloomS.target = sstep(0.8, 1, h);
        const bloom = clamp(bloomS.x, -0.1, 1.12), bk = clamp(bloom, 0, 1);

        /* tachycardia: a fast, shaky tremble on top of everything */
        const trem = sick * (REDUCE ? 0.3 : 1) * (0.7 + 0.3 * heartbeat(t, 2.1)) + breath * 0.6;
        const vib = Math.sin(t * 47) * 0.6 + Math.sin(t * 31 + 1) * 0.4;

        /* the vine */
        const pose = clamp(lerp(0, 0.3, clamp(hp, 0, 0.8) / 0.75) + bloom * 0.7, -0.1, 1.12);
        const sway = Math.sin(t * 0.6) * M, br = Math.sin(t * lerp(1.0, 1.6, h)) * M;
        for (let i = 0; i < NB; i++) {
          const f = i / (NB - 1);
          let z = sway * 0.012 * (0.5 + f) + br * 0.008 * (1 - f) + vib * 0.006 * trem + wobS.x * 0.035 * f + s.k.shake.x * 0.02 * f;
          let x = wobS.x * 0.05 * f - fl * 0.09 * f;
          if (i >= 3) { z += -(lurch * 0.1 - wind * 0.07) * (f + 0.2); x += (lurch * 0.13 - wind * 0.07) * f; }
          z -= sick * 0.03 * f * (0.6 + 0.4 * Math.sin(t * 0.45));      // fatigue: a slow sag
          z += breath * 0.05 * f * (1 - pose);                            // the shaky breath lifts it a little
          ex.z[i] = z; ex.x[i] = x;
        }
        const squat = lerp(1, 0.9, clamp(bloom, 0, 1));            // standing up, it fills out rather than shooting up
        vine.mesh.scale.y = vine2.mesh.scale.y = squat;
        poseBones(pose, ex);
        vine.mesh.morphTargetInfluences[0] = clamp(h, 0, 1);
        vine2.mesh.morphTargetInfluences[0] = clamp(h, 0, 1);
        for (const tm of tendrilMeshes) tm.m.rotation.set(Math.sin(t * 1.1 + tm.ph) * 0.06 * M, 0, Math.cos(t * 0.9 + tm.ph) * 0.06 * M + vib * 0.02 * trem);

        /* the hood hangs off the vine's tip */
        vine.bones[NB - 1].localToWorld(tip.set(0, SEG, 0)); world.worldToLocal(tip);
        hood.position.copy(tip);
        const up = clamp(lerp(0, 0.1, clamp(hp, 0, 0.8) / 0.75) + bloom, -0.05, 1.12);
        hood.quaternion.slerpQuaternions(qSick, qWell, up);
        qTmp.setFromEuler(eTmp.set(-lurch * 0.3 + wind * 0.14 + wobS.x * 0.04 + fl * 0.1, 0, vib * 0.02 * trem + Math.sin(t * 0.7) * 0.03 * M));
        hood.quaternion.premultiply(qTmp);
        const hs = lerp(1, 0.95, bk) * (1 + 0.014 * heartbeat(t, 2.1) * sick * M);
        hood.scale.setScalar(hs);
        if (Math.abs(bk - hoodShapeK) > 0.004) { hoodShapeK = bk; shapeBell(hoodGeo, HSEG, HT, bk, 7, 1 - bk); }

        /* the head: sits in the hood but faces you */
        head.position.lerpVectors(HEAD_SICK, HEAD_WELL, bk);
        head.scale.setScalar(1 / hs);
        qTmp.setFromEuler(eTmp.set(lerp(0.3, -0.16, bk) - lurch * 0.08 + wind * 0.1 - fl * 0.06, Math.sin(t * 0.5) * 0.06 * M, lerp(0.14, 0, bk) + vib * 0.03 * trem));
        head.quaternion.copy(qInv.copy(hood.quaternion).invert().multiply(qTmp));
        hood.updateMatrixWorld(true);

        /* the face over its base expression */
        rig.over({ lid: 0, low: 0.4, brow: 1, browY: -0.004, smile: -0.4, open: 0.04, w: 0.07 }, clamp(wind, 0, 1));
        rig.over({ lid: 0, brow: 1, smile: -1, open: 1.15, w: 0.12 }, clamp(lurch, 0, 1));
        rig.over({ open: 0.12, w: 0.07, smile: -0.2, brow: 0.35 }, relEnv * 0.6);

        /* the flow: a dribble, a gush with each heave, thinner with relief, stops when cured */
        const cut = Math.max(cured ? sstep(0, 1.1, cureT) : 0, sstep(0.88, 0.99, h));
        flowS.target = lerp(0.35, 0.1, clamp(h / 0.75, 0, 1)) * (1 - 0.7 * relEnv) + gush;
        flowS.step(dt);
        const flow = Math.max(0, flowS.x);
        const E = rig.E;
        const my = MOUTH_Y - E.smile * 0.34 * E.w - Math.max(0, E.open) * 0.3 * E.w;
        head.localToWorld(mouthW.set(0, my, surfZ(0, my) - 0.012));
        fwdW.set(0, 0, 1).transformDirection(head.matrixWorld);
        world.getWorldQuaternion(wq).invert();
        const mouthL = world.worldToLocal(mouthW.clone()), fwdL = fwdW.clone().applyQuaternion(wq);
        fwdL.y -= 0.9; fwdL.normalize();
        const showStream = cut < 0.999 && flow > 0.01;
        stream.visible = showStream;
        if (showStream) {
          const rMouth = clamp(0.42 * E.w * (0.35 + Math.max(0, E.open)), 0.012, 0.05);
          buildStream(mouthL, fwdL, rMouth, 0.022 + 0.036 * Math.min(flow, 1.6), clamp(gush, 0, 1.5), cut, t);
          streamTex.offset.y -= dt * lerp(0.9, 2.4, clamp(gush, 0, 1));
        }
        if (!puddlePlaced) { puddlePlaced = true; puddle.position.set(sP[NS].x + 0.08, 0, sP[NS].z + 0.04); }

        /* the puddle spreads, bubbles, and dries up when cured */
        const evap = Math.max(cured ? sstep(0.3, 2.4, cureT) : 0, sstep(0.88, 1, h));
        pudS.target = lerp(1, 0.6, clamp(h / 0.75, 0, 1)); pudS.step(dt);
        const ps = Math.max(1e-4, pudS.x * (1 - evap));
        puddle.scale.set(ps, Math.max(0.2, 1 - evap * 0.8), ps); puddle.visible = ps > 0.01;

        /* drips and splashes */
        if (showStream) {
          if (Math.random() < dt * (3 + 10 * flow) * M) {
            const k = 3 + Math.floor(Math.random() * (NS - 8));
            goo.emit(world.localToWorld(tmp.copy(sP[k]).add(randDir().multiplyScalar(sR[k] * 1.2))), { v: new V3(rnd(-0.15, 0.15), rnd(-0.6, -0.2), rnd(-0.1, 0.15)), life: rnd(0.8, 1.4), s0: rnd(0.025, 0.045), s1: 0.02, color: '#dce69a', g: -3, floor: 0.02, spin: 0 });
          }
          if (heave && !heave.splashed && heave.t > 0.75) {
            heave.splashed = true; pudS.kick(1.2 * heave.amp);
            const at = world.localToWorld(tmp.copy(sP[NS]).setY(0.03));
            for (let i = 0; i < 14; i++) { const a = rnd(0, TAU), sp = rnd(0.3, 0.8); goo.emit(at, { v: new V3(Math.cos(a) * sp, rnd(0.6, 1.2), Math.sin(a) * sp), life: rnd(0.6, 1), s0: rnd(0.025, 0.05), s1: 0.02, color: '#dce69a', g: -4.5, floor: 0.02, spin: 0 }); }
          }
        }
        dribbleT -= dt;
        if (dribbleT <= 0 && ill > 0.1) {                      // slime dripping off the hood's ragged tips
          dribbleT = rnd(0.6, 1.4) / Math.max(0.3, ill);
          const pa = hoodGeo.attributes.position, i = rimTips[Math.floor(Math.random() * rimTips.length)];
          const at = hoodMesh.localToWorld(tmp.set(pa.getX(i), pa.getY(i), pa.getZ(i)));
          goo.emit(at, { v: new V3(0, -0.1, 0), life: 1.6, s0: 0.03, s1: 0.024, color: '#d4de8e', g: -3, floor: 0.02, spin: 0 });
        }
        if (sick > 0.3 && Math.random() < dt * 0.6 * M) {     // a tear falls from her chin
          goo.emit(head.localToWorld(tmp.set(rnd(-0.1, 0.1), -0.15, 0.1)), { v: new V3(0, -0.2, 0.05), life: 1.4, s0: 0.022, s1: 0.016, color: '#cfeaf4', g: -3, floor: 0.02, spin: 0 });
        }
        if (puddle.visible && Math.random() < dt * 3 * ps * (1 - evap) * M) {
          const a = rnd(0, TAU), rho = Math.sqrt(Math.random()) * 0.8;
          bub.emit(puddle.localToWorld(tmp.set(Math.cos(a) * lobR(a) * rho * PX, 0.03, Math.sin(a) * lobR(a) * rho * PZ)), { life: rnd(0.7, 1.2), s0: 0.015, s1: rnd(0.05, 0.08), color: '#eef4c4', spin: 0 });
        }
        if (evap > 0.02 && evap < 0.98 && Math.random() < dt * 30) {
          const a = rnd(0, TAU), rho = Math.sqrt(Math.random()) * ps;
          wisp.emit(puddle.localToWorld(tmp.set(Math.cos(a) * rho * PX, 0.04, Math.sin(a) * rho * PZ)), { v: new V3(rnd(-0.05, 0.05), rnd(0.35, 0.6), rnd(-0.05, 0.05)), life: rnd(1, 1.6), s0: 0.1, s1: 0.32, color: '#f2f6e6', a: 0.35 });
        }

        /* leaves: holes close, curl eases, recoil on the wrong card, shudder with each heave */
        kit.leafFold = clamp(fl, 0, 1) * 0.9 + clamp(lurch, 0, 1) * 0.25;
        const holeK = clamp(1 - h / 0.85, 0, 1), curlK = clamp(1 - h * 1.15, 0, 1) * 0.55;
        for (const L of leaves) {
          L.mesh.morphTargetInfluences[0] = holeK; L.mesh.morphTargetInfluences[1] = curlK;
          L.flutter = 1 + 2.2 * clamp(lurch, 0, 1.5) + trem * 0.5;
          L.droop = sick * 0.35 * (0.7 + 0.3 * Math.sin(t * 0.45)) + lurch * 0.25;
        }

        /* healed: flowers along the vine, and a dewdrop to sip */
        for (const f of flowers) {
          const k = sstep(0.86 + f.i * 0.015, 0.95 + f.i * 0.007, h);
          f.g.visible = k > 0.01; f.g.scale.setScalar(Math.max(1e-4, k * (1 + 0.15 * Math.sin(Math.PI * k))));
        }
        const dewOn = sstep(0.9, 1, bk) * (cut >= 0.999 ? 1 : 0);
        dewLeaf.visible = dew.visible = dewOn > 0.01;
        dewPivot.scale.setScalar(Math.max(1e-4, dewOn) * 0.22);
        if (dewOn > 0.01) {
          sipT += dt;
          const p = sipT % 4.4;
          const grow = sstep(0.2, 1.6, p), sip = sstep(2.2, 2.75, p);
          tmp.set(0, my - 0.005, surfZ(0, my) + 0.005);
          dew.position.lerpVectors(DEW_REST, tmp, sip);
          dew.scale.setScalar(Math.max(1e-4, grow * (1 - sip) * dewOn));
          const sipFace = sstep(1.9, 2.25, p) * (1 - sstep(2.8, 3.1, p));
          rig.over({ lid: 0.75, open: 0.4, w: 0.045, smile: 0.25, brow: 0.05 }, sipFace * dewOn);
          rig.over({ lid: 0.55, low: 0.55, smile: 1.15, open: 0.25, w: 0.12 }, sstep(2.9, 3.2, p) * (1 - sstep(3.9, 4.3, p)) * dewOn);
        } else sipT = 0;
      },
    };
  },
};
