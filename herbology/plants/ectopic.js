/* 8. Ectopic Pregnancy: the Wrong-Place Sprout.
   From her slide (refs/p20_0.jpg): a pale-green pea of a sprout with fine
   cracks, big dark glossy sad eyes and a little frown, four magenta petals
   sprouting from its head like a crown and curly tendrils. Its slender vine
   body coils around and around a thick rose-red fallopian tube that rises from
   below, arcs over to the right and ends in frilly finger-like fimbriae hanging
   down; brown-red root veins from the vine dig into the tube. Lower left, a
   thin branch leads to the ovary, a lumpy lavender ball in frilly pink fronds.
   Soft painted storybook look with a thin dark-olive ink.
   Symptoms: the tube around the sprout swells and throbs on one side with a red
   flush (one-sided pain), dark sap seeps out in drops (spotting or bleeding),
   thin cracks glow red when it is worst (rupture warning, shoulder-tip pain),
   and the sprout sways, woozy (dizziness, shock).
   Healed (my addition): an ectopic pregnancy cannot be moved into the uterus,
   so the cure is about the tube and the mother. The vine lets go of the tube
   and the sprout settles on the soft mound as a calm closed bud with a gentle
   glow; the swelling, veins, cracks and bleeding fade, the tube is smooth
   healthy pink and small pink flowers bloom along it. */

export default {
  id: 'ectopic',
  look: { ink: '#2f3320', bands: [104, 166, 222, 255], outline: 0.0042, rune: ['#ff8a9c', '#9fe0b8'], bg: ['#5a3a4c', '#2e1c28', '#100a0e'] },
  frame: { halfH: 1.44, halfW: 1.22, lookY: 1.29 },
  careTitle: 'Keep her safe',
  lines: {
    sick: 'Growing in the wrong place.',
    wrong: ['Ow... it is tightening!', 'It hurts, just on this side...', 'I feel so dizzy...'],
    right: ['That eases it a little.', 'A little safer.'],
    healed: 'Safe now.',
  },
  shows: [
    '<b>A vine coiled tight around the tube</b>, roots digging in: the pregnancy has implanted in the fallopian tube, not the uterus.',
    '<b>The tube swells and throbs on one side</b> with a red flush: one-sided pelvic or abdominal pain.',
    '<b>Dark sap seeping out in drops</b>: vaginal spotting or bleeding.',
    '<b>Thin cracks that glow red</b> when it is at its worst: a warning of rupture and internal bleeding, which can show as shoulder-tip pain.',
    '<b>The sprout sways, woozy</b>: dizziness, fainting or shock with rupture.',
  ],
  healedNote: 'Healed, the vine lets go and the sprout rests as a calm closed bud; the swelling, cracks and bleeding fade, the tube is smooth healthy pink and small flowers bloom along it. An ectopic pregnancy cannot be moved into the uterus: the care keeps the mother safe.',

  build(kit) {
    const { THREE, world, scene, toon, noOutline, canvasTex, sheet, lumpGeo, tendrilGeo, addLeaf, face, palette, Spring,
      spark, wisp, heartbeat, randDir, rnd, M, REDUCE, clamp, lerp, sstep, V3, TAU, UP, lights, tex, mergeGeometries } = kit;
    let seed = 20261015;
    const R = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const rr = (a, b) => a + (b - a) * R();

    /* ---------- her light: warm and rosy ---------- */
    lights.hemi.color.set('#fff3ea'); lights.hemi.groundColor.set('#6a3a48'); lights.hemi.intensity = 1.2;
    lights.key.color.set('#fff1e0');
    lights.fill.color.set('#ffd6e2'); lights.fill.intensity = 0.55;
    lights.rim.color.set('#ffe0f0');
    lights.heal.color.set('#ffe0ea');
    const budLight = new THREE.PointLight('#ffe2b0', 0, 2.2, 1.6); scene.add(budLight);
    const flushLight = new THREE.PointLight('#ff4a4a', 0, 1.4, 1.8); scene.add(flushLight);

    const P = palette({
      tube: ['#a24e60', '#e8a0ac'], fimb: ['#bd5a70', '#e899a8'], mound: ['#c0808e', '#d897a3'], root: ['#9a5462', '#bf7a88'],
      head: ['#a9b46e', '#c2d58c'], vine: ['#6c853c', '#7da54a'], leaf: ['#7a9a48', '#88b453'], petal: ['#a8558f', '#c47db5'],
      ovary: ['#ad92c8', '#c8b0e2'],
    });

    /* ---------- painted textures ---------- */
    const headTex = canvasTex(512, 256, (x, w, h) => {      // fine cracks on a pale pea
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {                       // soft mottling
        const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
        const cx = rr(0, w), cy = rr(0, h), r = rr(10, 34);
        x.save(); x.translate(cx, cy); x.scale(r, r * 0.8);
        g.addColorStop(0, R() < 0.5 ? 'rgba(210,225,170,.35)' : 'rgba(150,160,90,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, TAU); x.fill(); x.restore();
      }
      x.lineCap = 'round'; x.lineJoin = 'round';
      const crack = (px, py, ang, len, wdt, depth) => {
        x.strokeStyle = `rgba(62,70,32,${0.5 + wdt * 0.1})`; x.lineWidth = wdt;
        x.beginPath(); x.moveTo(px, py);
        for (let k = 0; k < len; k++) { ang += rr(-0.6, 0.6); px += Math.cos(ang) * 7; py += Math.sin(ang) * 7; x.lineTo(px, py); if (depth < 2 && R() < 0.22) { x.stroke(); crack(px, py, ang + rr(-1.2, 1.2), Math.floor(len * 0.5), wdt * 0.7, depth + 1); x.strokeStyle = `rgba(62,70,32,${0.5 + wdt * 0.1})`; x.lineWidth = wdt; x.beginPath(); x.moveTo(px, py); } }
        x.stroke();
      };
      // u = 0.25 faces front; keep the cracks to the cheeks, temples and crown
      for (const [u, v, a] of [[0.06, 0.35, 1.2], [0.14, 0.22, 0.5], [0.36, 0.25, 2.4], [0.43, 0.42, 1.8], [0.33, 0.62, 2.0], [0.17, 0.66, 0.9], [0.6, 0.3, 1.0], [0.75, 0.5, 2.0], [0.9, 0.3, 1.5], [0.27, 0.08, 1.6]]) {
        crack(u * w, v * h, a, 9, 2.2, 0);
      }
    });
    const petalTex = canvasTex(128, 256, (x, w, h) => {     // veined petals: darker base, paler rim
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, 'rgba(70,10,60,.45)'); g.addColorStop(0.4, 'rgba(70,10,60,.1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      const e = x.createLinearGradient(0, 0, w, 0);
      e.addColorStop(0, 'rgba(255,220,250,.35)'); e.addColorStop(0.25, 'rgba(255,255,255,0)'); e.addColorStop(0.75, 'rgba(255,255,255,0)'); e.addColorStop(1, 'rgba(255,220,250,.35)');
      x.fillStyle = e; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(80,16,64,.5)'; x.lineCap = 'round';
      x.lineWidth = 2.4; x.beginPath(); x.moveTo(w / 2, h); x.quadraticCurveTo(w / 2 + 4, h * 0.5, w / 2, 10); x.stroke();
      x.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) {
        const y0 = h - i * h / 10 - 12, s = i % 2 ? 1 : -1;
        x.beginPath(); x.moveTo(w / 2, y0);
        x.bezierCurveTo(w / 2 + s * w * 0.12, y0 - 20, w / 2 + s * w * 0.28, y0 - 34, w / 2 + s * w * 0.42, y0 - 60); x.stroke();
      }
    }, { srgb: true });

    /* ---------- materials ---------- */
    const tubeU = { uFlush: { value: 1 }, uGlow: { value: 0 }, uFlushCol: { value: new THREE.Color('#d42a40') } };
    const tubeMat = toon('#b45468');
    tubeMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, tubeU);
      sh.vertexShader = 'attribute float aW;\nvarying float vW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vW = aW;');
      sh.fragmentShader = 'uniform float uFlush;\nuniform float uGlow;\nuniform vec3 uFlushCol;\nvarying float vW;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
          diffuseColor.rgb = mix( diffuseColor.rgb, uFlushCol, clamp( vW * uFlush, 0.0, 1.0 ) * 0.72 );`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += uFlushCol * vW * uGlow;`);
    };
    const fimbMat = toon('#bd5a70');
    const frondMat = toon('#bd5a70', { side: THREE.DoubleSide, thickness: 0.0026 });
    const capMat = toon('#6e2234', { thickness: 0 });
    const moundMat = toon('#c0808e', { map: tex.grain });
    const rootMat = toon('#9a5462', { thickness: 0.0022 });
    const veinMat = toon('#7a3420', { thickness: 0 });
    const crackMat = toon('#4a0c16', { thickness: 0, emissive: '#ff3020', emissiveIntensity: 0 });
    const vineMat = toon('#6c853c', { thickness: 0.003 });
    const leafMat = toon('#7a9a48', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.0026 });
    const headMat = toon('#a9b46e', { map: headTex, emissive: '#ffe6a8', emissiveIntensity: 0 });
    const petalMat = toon('#a24c8c', { map: petalTex, side: THREE.DoubleSide, thickness: 0.003 });
    const ovaryMat = toon('#ad92c8', { thickness: 0.003 });
    const sapMat = toon('#7a1020', { thickness: 0.0022 });
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ffb0b8' }));
    const flowerMat = toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide, thickness: 0.0022 });

    const root = new THREE.Group(); world.add(root);

    /* ---------- the fallopian tube: centre line and surface helpers ---------- */
    const TP = [[0.1, -0.12, 0], [0.07, 0.2, 0], [-0.02, 0.5, 0], [-0.14, 0.8, 0.0], [-0.18, 1.05, 0], [-0.1, 1.3, 0],
      [0.15, 1.5, -0.05], [0.45, 1.66, -0.1], [0.72, 1.75, -0.12], [0.9, 1.68, -0.12], [0.97, 1.5, -0.1], [0.97, 1.3, -0.08]];
    const curve = new THREE.CatmullRomCurve3(TP.map((p) => new V3(...p)), false, 'centripetal');
    const NS = 600;
    const FR = curve.computeFrenetFrames(NS, false);
    const SP = Array.from({ length: NS + 1 }, (_, i) => curve.getPointAt(i / NS));
    const rProf = (u) => 0.136 - 0.05 * sstep(0.45, 0.62, u) + 0.03 * sstep(0.93, 1, u);
    const _a = new V3(), _b = new V3();
    /** Point, tangent, normal, binormal at u, interpolated between samples. */
    function at(u, out = {}) {
      const f = clamp(u, 0, 1) * NS, i = Math.min(NS - 1, Math.floor(f)), k = f - i;
      out.p = (out.p || new V3()).copy(SP[i]).lerp(SP[i + 1], k);
      out.T = (out.T || new V3()).copy(FR.tangents[i]).lerp(FR.tangents[i + 1], k).normalize();
      out.N = (out.N || new V3()).copy(FR.normals[i]).lerp(FR.normals[i + 1], k).normalize();
      out.B = (out.B || new V3()).copy(FR.binormals[i]).lerp(FR.binormals[i + 1], k).normalize();
      return out;
    }
    const F0 = {};
    const dirAt = (u, th, out = new V3()) => { at(u, F0); return out.copy(F0.N).multiplyScalar(Math.cos(th)).addScaledVector(F0.B, Math.sin(th)); };
    const surf = (u, th, rho) => { const d = dirAt(u, th); return F0.p.clone().addScaledVector(d, rho); };
    const thetaOf = (u, w) => { at(u, F0); const d = w.clone().normalize(); d.addScaledVector(F0.T, -d.dot(F0.T)).normalize(); return Math.atan2(d.dot(F0.B), d.dot(F0.N)); };
    const uAtY = (y) => { for (let i = 0; i <= NS / 2; i++) if (SP[i].y >= y) return i / NS; return 0.5; };

    const uTop = uAtY(1.26), uBot = uAtY(0.46), uc = uAtY(0.9), SIG = 0.075;
    const SIDE = new V3(0.55, -0.1, 0.83).normalize();       // the painful side faces the viewer
    const bump = (u) => Math.exp(-(((u - uc) / SIG) ** 2));
    const sideW = (d) => 0.3 + 0.7 * (0.5 + 0.5 * d.dot(SIDE));

    /** Anything glued to the tube: each vertex keeps its spot on the centre line
        and its radial direction, so it rides the swelling. */
    function rider(geo, swellK = 1, uWin = [0, 1]) {
      const p = geo.attributes.position, n = p.count;
      const C = new Float32Array(n * 3), D = new Float32Array(n * 3), R0 = new Float32Array(n), W = new Float32Array(n);
      const i0 = Math.floor(uWin[0] * NS), i1 = Math.ceil(uWin[1] * NS);
      for (let v = 0; v < n; v++) {
        _a.fromBufferAttribute(p, v);
        let best = 1e9, bi = i0;
        for (let i = i0; i <= i1; i++) { const q = SP[i], dd = (q.x - _a.x) ** 2 + (q.y - _a.y) ** 2 + (q.z - _a.z) ** 2; if (dd < best) { best = dd; bi = i; } }
        const c = SP[bi]; _b.subVectors(_a, c); const r = _b.length(); _b.divideScalar(r || 1);
        C.set([c.x, c.y, c.z], v * 3); D.set([_b.x, _b.y, _b.z], v * 3); R0[v] = r;
        W[v] = bump(bi / NS) * sideW(_b);
      }
      return {
        geo, W,
        apply(sw, lift = 0) {
          const k = sw * swellK;
          for (let v = 0, j = 0; v < n; v++, j += 3) { const r = R0[v] + W[v] * k + lift; p.setXYZ(v, C[j] + D[j] * r, C[j + 1] + D[j + 1] * r, C[j + 2] + D[j + 2] * r); }
          p.needsUpdate = true;
        },
      };
    }
    /** A tube along a curve with radius rFn(t). */
    function varTube(c, segs, radial, rFn) {
      const g = new THREE.TubeGeometry(c, segs, 1, radial, false);
      const p = g.attributes.position, nn = g.attributes.normal;
      for (let j = 0; j <= segs; j++) {
        const q = c.getPointAt(j / segs), r = rFn(j / segs);
        for (let i = 0; i <= radial; i++) { const k = j * (radial + 1) + i; p.setXYZ(k, q.x + nn.getX(k) * r, q.y + nn.getY(k) * r, q.z + nn.getZ(k) * r); }
      }
      g.computeVertexNormals();
      return g;
    }

    // the tube itself
    const TSEG = 140, TRAD = 16;
    const tubeGeo = varTube(curve, TSEG, TRAD, rProf);
    const tubeR = rider(tubeGeo, 1);
    tubeGeo.setAttribute('aW', new THREE.BufferAttribute(tubeR.W, 1));
    const tube = new THREE.Mesh(tubeGeo, tubeMat); tube.castShadow = true; tube.frustumCulled = false; root.add(tube);

    // the fimbriae: a dark mouth and finger-like fronds hanging from the end
    const endF = at(1, {});
    const cap = new THREE.Mesh(new THREE.CircleGeometry(rProf(1) * 0.92, 20), capMat);
    cap.position.copy(endF.p).addScaledVector(endF.T, -0.01);
    cap.quaternion.setFromUnitVectors(new V3(0, 0, 1), endF.T); root.add(cap);
    const fingers = [], fingerBase = [];
    {
      const parts = [], NF = 11;
      for (let k = 0; k < NF; k++) {
        const th = (k / NF) * TAU + rr(-0.15, 0.15), inner = k % 4 === 3;
        const d = new V3().copy(endF.N).multiplyScalar(Math.cos(th)).addScaledVector(endF.B, Math.sin(th));
        const L = inner ? rr(0.16, 0.2) : rr(0.24, 0.34), spread = inner ? 0.03 : rr(0.06, 0.1);
        const s0 = endF.p.clone().addScaledVector(d, rProf(1) * (inner ? 0.55 : 0.85)).addScaledVector(endF.T, -0.02);
        const down = new V3(0, -1, 0);
        const pts = [s0];
        for (let i = 1; i <= 5; i++) {
          const t = i / 5;
          pts.push(s0.clone().addScaledVector(endF.T, L * t * 0.75).addScaledVector(down, L * t * 0.3).addScaledVector(d, spread * Math.sin(t * 2.2) + (t > 0.7 ? 0.05 * (t - 0.7) / 0.3 : 0))
            .add(new V3(rr(-0.012, 0.012), 0, rr(-0.012, 0.012))));
        }
        // curl the tip outward and up a little
        const tip = pts[5].clone().addScaledVector(d, 0.035).addScaledVector(down, -0.02);
        pts.push(tip);
        const c = new THREE.CatmullRomCurve3(pts);
        const g = varTube(c, 18, 6, (t) => lerp(0.027, 0.012, t) * (t > 0.9 ? Math.sqrt(Math.max(0.05, 1 - ((t - 0.9) / 0.1) ** 2)) : 1));
        const kArr = new Float32Array(g.attributes.position.count);
        for (let j = 0; j <= 18; j++) for (let i = 0; i <= 6; i++) kArr[j * 7 + i] = j / 18;
        g.setAttribute('aK', new THREE.BufferAttribute(kArr, 1));
        const ph = new Float32Array(g.attributes.position.count).fill(rr(0, TAU));
        g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
        parts.push(g);
      }
      const g = mergeGeometries(parts);
      const fm = new THREE.Mesh(g, fimbMat); fm.frustumCulled = false; root.add(fm);
      fingers.push(fm); fingerBase.push(g.attributes.position.array.slice());
    }

    /* ---------- the pink root mound, the tube's base sunk into it ---------- */
    const LUMPS = [[0.08, 0, 0, 0.36, 0.32], [-0.2, 0, 0.12, 0.24, 0.3], [0.3, 0, -0.06, 0.25, 0.28], [-0.62, 0, 0.16, 0.3, 0.28], [-0.85, 0, 0.1, 0.2, 0.26], [0.44, 0, 0.4, 0.22, 0.3], [0.24, 0, 0.24, 0.18, 0.3]];
    const mound = new THREE.Mesh(lumpGeo(LUMPS, 22, 10), moundMat); mound.receiveShadow = true; root.add(mound);
    const moundY = (x, z) => { let y = 0; for (const [lx, , lz, r, sy] of LUMPS) { const q = r * r - (x - lx) ** 2 - (z - lz) ** 2; if (q > 0) y = Math.max(y, sy * Math.sqrt(q)); } return y; };
    {
      const parts = [];
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * TAU + rr(-0.3, 0.3), L = rr(0.45, 0.75);
        const pts = [];
        for (let i = 0; i <= 6; i++) {
          const t = i / 6, r = 0.12 + t * L, aa = a + Math.sin(t * 3 + k) * 0.25;
          const x = 0.08 + Math.cos(aa) * r, z = Math.sin(aa) * r * 0.8;
          pts.push(new V3(x, Math.max(moundY(x, z) - 0.012, -0.01) + 0.004, z));
        }
        parts.push(varTube(new THREE.CatmullRomCurve3(pts), 16, 5, (t) => lerp(0.028, 0.006, t)));
      }
      const rm = new THREE.Mesh(mergeGeometries(parts), rootMat); rm.receiveShadow = true; root.add(rm);
    }

    /* ---------- the ovary branch, the ovary and its frilly fronds ---------- */
    const O = new V3(-0.6, 0.25, 0.16), OR = 0.17;
    const uBr = uAtY(0.82);
    const brStart = surf(uBr, thetaOf(uBr, new V3(-1, 0.1, -0.5)), rProf(uBr) * 0.6);
    const J = O.clone().add(new V3(0.08, 0.14, -0.02));
    const branchC = new THREE.CatmullRomCurve3([brStart, new V3(-0.34, 0.9, 0.0), new V3(-0.46, 0.82, 0.06), new V3(-0.52, 0.6, 0.12), J]);
    const branch = new THREE.Mesh(varTube(branchC, 50, 10, (t) => lerp(0.045, 0.032, t)), fimbMat); branch.castShadow = true; root.add(branch);
    const ovaryGeo = new THREE.SphereGeometry(OR, 40, 26);
    {
      const bumps = Array.from({ length: 44 }, () => randDir());
      const p = ovaryGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        _a.fromBufferAttribute(p, i).normalize();
        let m = 0; for (const b of bumps) m = Math.max(m, Math.exp(-(1 - _a.dot(b)) / 0.03));
        _a.multiplyScalar(OR * (0.86 + 0.2 * m)); _a.y *= 0.95;
        p.setXYZ(i, _a.x, _a.y, _a.z);
      }
      ovaryGeo.computeVertexNormals();
    }
    const ovary = new THREE.Mesh(ovaryGeo, ovaryMat); ovary.position.copy(O); ovary.castShadow = true; root.add(ovary);
    // frilly fronds wrapping the ovary's far side and spilling to the mound
    let cradle;
    {
      const parts = [];
      const up0 = J.clone().sub(O).normalize();
      for (const [ax, ay, az, w0, len] of [[-1, 0, 0.15, 0.05, 2.6], [-0.85, 0, -0.5, 0.05, 2.5], [-0.3, 0, -1, 0.045, 2.3], [0.3, 0, -1, 0.04, 2.0], [-1, -0.3, 0.45, 0.04, 2.7], [-0.6, 0, -0.8, 0.05, 2.9]]) {
        const dk = new V3(ax, ay, az); dk.addScaledVector(up0, -dk.dot(up0)).normalize();
        const M = 30, COLS = 8, pos = [], idx = [];
        const pts = [];
        for (let j = 0; j <= M; j++) {
          const t = j / M, th = 0.45 + t * len, rad = OR * 1.02 + 0.012 + sstep(0.55, 1, t) * 0.14;
          const pnt = O.clone().addScaledVector(up0, Math.cos(th) * rad).addScaledVector(dk, Math.sin(th) * rad);
          pnt.y = Math.max(pnt.y, moundY(pnt.x, pnt.z) + 0.01);
          pts.push(pnt);
        }
        for (let j = 0; j <= M; j++) {
          const t = j / M, c = pts[j], T = pts[Math.min(M, j + 1)].clone().sub(pts[Math.max(0, j - 1)]).normalize();
          const nrm = c.clone().sub(O).normalize(), side = new V3().crossVectors(T, nrm).normalize();
          const w = w0 * (0.5 + 1.1 * Math.sin(Math.PI * Math.min(1, t * 1.15)));
          for (let i = 0; i <= COLS; i++) {
            const v = i / COLS * 2 - 1, fr = 0.018 * Math.sin(t * 11 + v * 2.2) * Math.abs(v);
            pos.push(c.x + side.x * v * w + nrm.x * fr, c.y + side.y * v * w + nrm.y * fr, c.z + side.z * v * w + nrm.z * fr);
          }
        }
        for (let j = 0; j < M; j++) for (let i = 0; i < COLS; i++) { const a = j * (COLS + 1) + i, b = a + 1, c2 = a + COLS + 1, d = c2 + 1; idx.push(a, b, d, a, d, c2); }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
        parts.push(g.toNonIndexed());
      }
      const g = mergeGeometries(parts); g.computeVertexNormals();
      cradle = new THREE.Mesh(g, frondMat); root.add(cradle);
    }

    /* ---------- the vine coiled around the tube ---------- */
    const TURNS = 3.0, VR = 0.036;
    const th0 = thetaOf(uTop, new V3(-0.55, 0.45, 0.7));
    const coilU = (s) => lerp(uTop, uBot, s), coilTh = (s) => th0 + s * TURNS * TAU;
    const coilPt = (s, extra = 0) => surf(coilU(s), coilTh(s), rProf(coilU(s)) + VR * 0.72 + extra);
    const coilCurve = new THREE.CatmullRomCurve3(Array.from({ length: 241 }, (_, i) => coilPt(i / 240)));
    const CSEG = 280, CRAD = 7;
    const coilGeo = varTube(coilCurve, CSEG, CRAD, (t) => VR * (t < 0.75 ? 1 : lerp(1, 0.3, (t - 0.75) / 0.25)));
    const coilR = rider(coilGeo, 0.72, [Math.max(0, uBot - 0.06), Math.min(1, uTop + 0.06)]);
    const coil = new THREE.Mesh(coilGeo, vineMat); coil.castShadow = true; coil.frustumCulled = false; root.add(coil);
    const A0 = coilCurve.getPointAt(0), A0out = coilCurve.getTangentAt(0).negate();

    // curly tendrils along the vine
    const ctGeo = mergeGeometries([0.18, 0.33, 0.47, 0.62, 0.78, 0.9].map((s, k) => {
      const u = coilU(s), d = dirAt(u, coilTh(s)).clone(), tg = coilCurve.getTangentAt(s);
      const x = tg.addScaledVector(d, -tg.dot(d)).normalize(), z = new V3().crossVectors(x, d);
      const m = new THREE.Matrix4().makeBasis(x, d, z).setPosition(coilPt(s, 0.015));
      return tendrilGeo({ rise: rr(0.05, 0.09), r0: rr(0.035, 0.05), coils: 1.6, thick: 0.008, dir: k % 2 ? 1 : -1 }).applyMatrix4(m);
    }));
    const ctR = rider(ctGeo, 0.72, [Math.max(0, uBot - 0.06), Math.min(1, uTop + 0.06)]);
    const coilTendrils = new THREE.Mesh(ctGeo, vineMat); coilTendrils.frustumCulled = false; root.add(coilTendrils);

    // small leaves on the vine
    const LEAF = sheet({ width: 0.42, cup: 0.14, curl: 0.18, point: 0.7, rows: 10 });
    const coilLeaves = [];
    for (const [s, size] of [[0.1, 0.17], [0.27, 0.14], [0.52, 0.13]]) {
      const u = coilU(s), d = dirAt(u, coilTh(s)).clone();
      const L = addLeaf(root, coilPt(s, 0.012), d.clone().add(new V3(0, 0.55, 0)), d.clone().add(new V3(0, -0.3, 0)), size, leafMat, LEAF);
      coilLeaves.push({ L, s });
    }

    // root veins: from the vine, digging into and spreading over the tube
    let veinR, veins;
    {
      const parts = [], LEN = 2.95;
      const walk = (u, th, a, steps, r0) => {
        const pts = [surf(u, th, rProf(u) - 0.003)];
        for (let i = 0; i < steps; i++) {
          a += rr(-0.5, 0.5); const st = 0.028;
          u += Math.cos(a) * st / LEN; th += Math.sin(a) * st / rProf(u);
          pts.push(surf(u, th, rProf(u) + 0.0015));
          if (i === 3 && steps > 5) walk(u, th, a + (R() < 0.5 ? 1 : -1) * rr(0.7, 1.2), steps - 5, r0 * 0.75);
        }
        parts.push(varTube(new THREE.CatmullRomCurve3(pts), steps * 3, 5, (t) => lerp(r0, 0.0025, t)));
      };
      for (let k = 0; k < 16; k++) {
        const s = (k + 0.5) / 16, a = (k % 2 ? 0 : Math.PI) + rr(-0.9, 0.9);
        walk(coilU(s), coilTh(s) + rr(-0.3, 0.3), a, 7 + Math.floor(R() * 5), 0.0075);
      }
      const g = mergeGeometries(parts);
      veinR = rider(g, 1, [Math.max(0, uBot - 0.12), Math.min(1, uTop + 0.12)]);
      veins = new THREE.Mesh(g, veinMat); veins.frustumCulled = false; root.add(veins);
    }
    // thin cracks on the swollen side: the rupture warning
    let crackR, cracks;
    {
      const parts = [], thc = thetaOf(uc, SIDE);
      for (let k = 0; k < 6; k++) {
        let u = uc + rr(-0.07, 0.07), th = thc + rr(-0.9, 0.9);
        const dir = R() < 0.5 ? 1 : -1, pts = [];
        for (let i = 0; i < 6; i++) { pts.push(surf(u, th, rProf(u) + 0.0008)); u += dir * rr(0.006, 0.011); th += (i % 2 ? 1 : -1) * rr(0.06, 0.16); }
        parts.push(varTube(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05), 24, 4, (t) => lerp(0.0062, 0.0025, t)));
      }
      const g = mergeGeometries(parts);
      crackR = rider(g, 1, [uc - 0.2, uc + 0.2]);
      cracks = new THREE.Mesh(g, crackMat); cracks.frustumCulled = false; root.add(cracks);
    }

    /* ---------- the sprout: pea head, face, crown of petals ---------- */
    const HA = 0.2, HB = 0.19, HC = 0.19;
    const HS = new V3(0.08, 1.93, 0.08);                      // where it perches, sick
    const HREST = new V3(0.42, 0.63, 0.4);                    // where it settles, healed
    const HCTRL = new V3(0.62, 1.75, 0.8);
    const sp = new THREE.Group(); sp.position.copy(HS); root.add(sp);
    const headG = new THREE.Group(); sp.add(headG);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), headMat);
    headMesh.scale.set(HA, HB, HC); headMesh.castShadow = true; headG.add(headMesh);
    const rig = face(headG, {
      a: HA, b: HB, c: HC, gazeScale: 0.6,
      eyes: { x: 0.08, y: -0.004, r: 0.062, iris: '#140c14', white: '#46344a', lid: '#9aa662' },
      brows: { y: 0.082, len: 0.04, r: 0.0055, color: '#4e5428' },
      mouth: { y: -0.086, inside: '#4a2a2c', lip: '#3a3020' },
      sickE: { lid: 0.86, low: 0.14, brow: 0.45, browY: 0.006, smile: -0.8, open: 0, w: 0.042 },
      wellE: { lid: 0.95, low: 0.28, brow: 0.05, browY: 0.006, smile: 0.35, open: 0.02, w: 0.052 },
      wrongE: { lid: 0.62, low: 0.45, brow: 0.85, browY: 0.004, smile: -1, open: 0.35, w: 0.055 },
      rightE: { lid: 1, low: 0.5, brow: 0.2, browY: 0.01, smile: 0.5, open: 0.2, w: 0.058 },
    });
    // closed-eye lash lines for when it rests (the engine's lids alone read as blank bumps)
    const lashMat = toon('#2f3320', { thickness: 0 });
    const lashes = rig.eyes.map((e) => {
      const re = 0.062, pts = [];
      for (let i = 0; i <= 16; i++) { const a = lerp(-2.55, -0.59, i / 16), x = Math.cos(a) * re * 0.78, y = Math.sin(a) * re * 0.5 - re * 0.08; pts.push(new V3(x, y, Math.sqrt(Math.max(0, (re * 1.08) ** 2 - x * x - y * y)))); }
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.0045, 5), lashMat);
      m.visible = false; e.upper.parent.add(m); return m;
    });
    const PEACE = { lid: 0, low: 0, brow: -0.08, browY: 0.004, smile: 0.55, open: 0, w: 0.06 };
    const DIZZY = { lid: 0.45, low: 0.3, brow: 0.7 };

    // crown: four big petals, open and wilting when sick, a closed bud when healed
    const PETAL = sheet({ width: 0.46, cup: 0.2, curl: 0.34, tipPinch: 0.2, point: 0.55, wave: 0.04, waveN: 4, cols: 8, rows: 14 });
    const petals = [];
    for (const [x, y, z, size, roll, droop] of [[0.75, 0.85, -0.15, 0.56, 0.15, 0.1], [1, 0.1, 0.3, 0.5, -0.1, 0.4], [-1, 0.05, 0.35, 0.44, 0.1, 0.45], [-0.55, 0.85, -0.45, 0.46, -0.2, 0.15]]) {
      const piv = new THREE.Group(); headG.add(piv);
      const m = new THREE.Mesh(PETAL, petalMat); m.castShadow = true; m.scale.setScalar(size); piv.add(m);
      const open = new V3(x, y, z).normalize(), out = new V3(x, 0, z).normalize();
      petals.push({ piv, m, size, open, out, roll, droop, ph: rr(0, TAU) });
    }
    const _pm = new THREE.Matrix4(), _px = new V3(), _pz = new V3(), _pd = new V3(), _pq = new THREE.Quaternion();
    function aimPetal(pt, dir, roll) {
      _pd.copy(dir).normalize();
      _pz.copy(UP).addScaledVector(_pd, -UP.dot(_pd));                 // toward the flower's axis
      if (_pz.lengthSq() < 1e-4) _pz.copy(pt.out).negate();
      _pz.normalize().negate();                                         // local -Z (the hollow) faces in
      _px.crossVectors(_pd, _pz).normalize(); _pz.crossVectors(_px, _pd);
      _pm.makeBasis(_px, _pd, _pz); pt.piv.quaternion.setFromRotationMatrix(_pm);
      _pq.setFromAxisAngle(UP, roll); pt.piv.quaternion.multiply(_pq);
    }
    const htGeo = mergeGeometries([[-0.07, -1, 0.14, 0.055, 0.5, 0.06], [0.08, 1, 0.1, 0.05, -0.6, -0.05]].map(([x, dir, rise, r0, rz, z]) =>
      tendrilGeo({ rise, r0, dir, thick: 0.008, coils: 1.8 }).rotateZ(rz).translate(x, HB * 0.86, z)));
    headG.add(new THREE.Mesh(htGeo, vineMat));
    const halo = new THREE.Sprite(noOutline(new THREE.SpriteMaterial({ map: tex.puff, color: '#ffe6b8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })));
    halo.scale.setScalar(0.95); halo.position.y = 0.12; headG.add(halo);

    // the neck: a short strip rebuilt each frame from the vine to the head
    const NSEG = 18, NRAD = 8;
    const neckGeo = new THREE.BufferGeometry();
    {
      neckGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NSEG + 1) * (NRAD + 1) * 3), 3));
      neckGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array((NSEG + 1) * (NRAD + 1) * 3), 3));
      const idx = [];
      for (let j = 0; j < NSEG; j++) for (let i = 0; i < NRAD; i++) { const a = j * (NRAD + 1) + i, b = a + NRAD + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      neckGeo.setIndex(idx);
    }
    const neck = new THREE.Mesh(neckGeo, vineMat); neck.castShadow = true; neck.frustumCulled = false; root.add(neck);
    const NP = Array.from({ length: NSEG + 1 }, () => new V3());
    const _nT = new V3(), _nN = new V3(), _nB = new V3(), _nd = new V3();
    function sweepNeck(rFn) {
      const p = neckGeo.attributes.position, nr = neckGeo.attributes.normal;
      for (let j = 0; j <= NSEG; j++) {
        _nT.subVectors(NP[Math.min(NSEG, j + 1)], NP[Math.max(0, j - 1)]).normalize();
        if (j === 0) { _nN.set(0, 0, 1).addScaledVector(_nT, -_nT.z); if (_nN.lengthSq() < 1e-4) _nN.set(1, 0, 0); }
        else _nN.addScaledVector(_nT, -_nN.dot(_nT));
        _nN.normalize(); _nB.crossVectors(_nT, _nN);
        const r = rFn(j / NSEG);
        for (let i = 0; i <= NRAD; i++) {
          const a = (i / NRAD) * TAU, k = j * (NRAD + 1) + i;
          _nd.copy(_nN).multiplyScalar(-Math.cos(a)).addScaledVector(_nB, Math.sin(a));   // TubeGeometry's winding
          p.setXYZ(k, NP[j].x + _nd.x * r, NP[j].y + _nd.y * r, NP[j].z + _nd.z * r); nr.setXYZ(k, _nd.x, _nd.y, _nd.z);
        }
      }
      p.needsUpdate = true; nr.needsUpdate = true;
    }
    const bez = (out, a, b, c, d, t) => { const m = 1 - t; return out.set(0, 0, 0).addScaledVector(a, m * m * m).addScaledVector(b, 3 * m * m * t).addScaledVector(c, 3 * m * t * t).addScaledVector(d, t * t * t); };
    const leafHold = new THREE.Group(); root.add(leafHold);
    addLeaf(leafHold, new V3(-0.01, 0, 0), new V3(-1, 0.55, 0.35), new V3(-1, -0.15, 0.35), 0.18, leafMat, LEAF);
    addLeaf(leafHold, new V3(0.01, -0.04, 0), new V3(1, 0.4, 0.25), new V3(1, -0.25, 0.2), 0.15, leafMat, LEAF);

    /* ---------- dark sap: drops seep from the swollen side and fall ---------- */
    const DROP = new THREE.SphereGeometry(1, 16, 12);
    const drops = [[new V3(0.4, -0.3, 0.86), -0.03, 0.4], [new V3(0.78, -0.35, 0.52), -0.065, 1.6]].map(([d, du, wait]) => {
      const m = new THREE.Mesh(DROP, sapMat); m.visible = false; root.add(m);
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), shineMat); sh.position.set(-0.35, 0.35, 0.75); m.add(sh);
      return { m, d: d.normalize(), u: uc + du, st: 'wait', t: wait, k: 0, p: new V3(), vy: 0, floor: 0 };
    });
    const beadPos = (dr, sw, out) => {
      at(dr.u, F0); _nd.copy(dr.d).addScaledVector(F0.T, -dr.d.dot(F0.T)).normalize();
      return out.copy(F0.p).addScaledVector(_nd, rProf(dr.u) + bump(dr.u) * sideW(_nd) * sw + 0.014);
    };
    const pud0 = beadPos(drops[0], 0.05, new V3());
    const puddle = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 8), sapMat);
    puddle.position.set(pud0.x + 0.02, moundY(pud0.x, pud0.z) + 0.002, pud0.z); root.add(puddle);
    const pudS = new Spring(90, 8);

    /* ---------- healed: small pink flowers along the tube ---------- */
    const FLOWER = (() => {
      const parts = [], pet = sheet({ width: 0.55, cup: 0.18, curl: -0.1, point: 0.5, cols: 5, rows: 6 });
      for (let i = 0; i < 5; i++) parts.push(pet.clone().rotateX(Math.PI / 2 - 0.35).rotateY((i / 5) * TAU));
      const petals5 = mergeGeometries(parts.map((g) => g.toNonIndexed()));
      const core = new THREE.SphereGeometry(0.2, 10, 8).toNonIndexed(); core.translate(0, 0.06, 0);
      const paint = (g, c) => { const col = new THREE.Color(c), a = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < a.length; i += 3) col.toArray(a, i); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); g.deleteAttribute('uv'); return g; };
      return mergeGeometries([paint(petals5, '#ffb4c8'), paint(core, '#ffe08a')]);
    })();
    const flowers = [[0.1, 0.1, 0.9, 0.09], [0.2, -0.5, 0.95, 0.08], [0.3, 0.6, 0.85, 0.085], [0.4, -0.3, 0.9, 0.08], [0.55, 0.0, 0.9, 0.075], [0.66, 0.4, 0.9, 0.07], [0.76, -0.2, 0.9, 0.07], [0.86, 0.3, 0.9, 0.065], [0.47, 0.9, 0.6, 0.07]].map(([u, ox, oz, size], i) => {
      const w = new V3(ox, 0.35, oz), th = thetaOf(u, w), d = dirAt(u, th).clone();
      const g = new THREE.Group(); g.position.copy(surf(u, th, rProf(u) - 0.004)); g.quaternion.setFromUnitVectors(UP, d); root.add(g);
      const m = new THREE.Mesh(FLOWER, flowerMat); m.scale.setScalar(1e-4); g.add(m);
      return { m, size, s: new Spring(70, 7), delay: 1.3 + i * 0.14, ph: rr(0, TAU) };
    });

    /* ---------- motion ---------- */
    const flare = new Spring(55, 7);       // the curse flaring on a wrong card
    const ease = new Spring(40, 8);        // relief on a right card
    const budS = new Spring(60, 9);        // petals closing into a bud
    let released = false, relT = 0, spell = 0, spellT = 5, nextSpell = rnd(4, 7);
    const swellCentre = () => root.localToWorld(surf(uc, thetaOf(uc, SIDE), rProf(uc) + 0.05));
    const _h = new V3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
    const qSick = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -0.2, 0.1));
    const qRest = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -0.25, -0.04));
    const P0 = new V3(), P1 = new V3(), P2 = new V3(), P3 = new V3(), S0 = new V3(), S1 = new V3();

    function resetState() {
      released = false; relT = 0; spell = 0; nextSpell = rnd(4, 7);
      budS.set(0); flare.set(0); ease.set(0);
      for (const f of flowers) { f.s.set(0); f.m.scale.setScalar(1e-4); }
      for (const d of drops) { d.st = 'wait'; d.t = rnd(0.3, 1.5); d.m.visible = false; }
      coil.visible = coilTendrils.visible = true; coil.geometry.setDrawRange(0, Infinity);
    }

    return {
      centre: swellCentre,
      anchor: () => sp.localToWorld(new V3(0.3, 0.45, 0)),
      react(type) {
        const c = swellCentre();
        if (type === 'wrong') {
          flare.kick(7);
          for (const d of drops) if (d.st === 'wait') d.t = Math.min(d.t, 0.05);
          for (let i = 0; i < 10; i++) { const v = randDir(); spark.emit(c.clone().addScaledVector(v, 0.1), { v: v.multiplyScalar(rnd(0.4, 0.9)), life: rnd(0.4, 0.7), s0: 0.08, s1: 0, color: '#ff4a3a', drag: 2 }); }
        } else {
          ease.kick(4);
          for (let i = 0; i < 10; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.12)), { v: randDir().multiplyScalar(0.25).add(new V3(0, 0.3, 0)), life: rnd(0.9, 1.3), s0: 0.12, s1: 0.32, color: '#ffe8f0', drag: 1.2, a: 0.35 });
        }
      },
      burst() { released = true; relT = 0; },
      reset: resetState,
      update(s) {
        const { t, dt, h, sick, heal } = s;
        if (!released && s.healed) { released = true; relT = 3; }
        if (released) relT += dt;
        flare.step(dt); ease.step(dt);
        const fl = Math.max(0, flare.x), es = Math.max(0, ease.x);
        kit.leafFold = clamp(s.k.flinch.x, 0, 1) * 0.6;

        /* colours */
        P.mix(tubeMat, 'tube', h); P.mix(fimbMat, 'fimb', h); P.mix(frondMat, 'fimb', h); P.mix(moundMat, 'mound', h); P.mix(rootMat, 'root', h);
        P.mix(headMat, 'head', h); P.mix(vineMat, 'vine', h); P.mix(leafMat, 'leaf', h); P.mix(petalMat, 'petal', h); P.mix(ovaryMat, 'ovary', h);

        /* the swelling: one side, throbbing with the pulse */
        const beat = heartbeat(t, lerp(1.35, 0.9, h)) * M;
        const sw = Math.max(0, sick * (0.055 + 0.022 * beat) + fl * 0.055 - es * 0.01) * (heal.on && !heal.burst ? 1 - heal.gather * 0.6 : 1);
        tubeR.apply(sw, 0); tubeGeo.computeVertexNormals();
        tubeU.uFlush.value = clamp(sick * (0.85 + 0.25 * beat) + fl * 0.4 - es * 0.15, 0, 1.4);
        tubeU.uGlow.value = sick * 0.12 * beat + fl * 0.35;
        flushLight.intensity = (sick * (0.12 + 0.16 * beat) + fl * 0.6) * (released ? 0 : 1);
        flushLight.position.copy(swellCentre()).add(_h.set(0.1, 0, 0.35));

        /* vine: clings, eases, lets go */
        const rel = released ? sstep(0, 0.9, relT) : 0;
        const coilLift = lerp(0, 0.006, h) + es * 0.012 - fl * 0.018 + (heal.on ? heal.gather * 0.018 : 0) + rel * 0.02;
        coilR.apply(sw, coilLift); ctR.apply(sw, coilLift);
        const segs = Math.round(CSEG * (1 - rel));
        coil.visible = segs > 0; coil.geometry.setDrawRange(0, segs * CRAD * 6);
        coilTendrils.visible = rel < 0.12;
        for (const cl of coilLeaves) cl.L.pivot.scale.setScalar(Math.max(1e-4, sstep(0, 0.08, (1 - rel) - cl.s)));
        veinR.apply(sw, lerp(0.0012, -0.014, sstep(0.25, 1, h)) - fl * 0.002 + rel * -0.01);
        veins.visible = h < 0.995;
        const crackVis = sstep(0.3, 0.7, sick) + fl * 0.5;
        crackR.apply(sw, lerp(-0.012, 0.0008, clamp(crackVis, 0, 1)));
        cracks.visible = crackVis > 0.02;
        crackMat.emissiveIntensity = sstep(0.55, 1, sick) * (0.35 + 0.9 * beat) + fl * 1.6;

        /* the sprout: woozy, clinging, then settling */
        if (!released && !REDUCE) {
          nextSpell -= dt;
          if (nextSpell <= 0 && sick > 0.3) { spellT = 0; nextSpell = rnd(6, 9); }
        }
        spellT += dt; spell = Math.sin(Math.PI * clamp(spellT / 2.6, 0, 1));
        const dizzy = sick * (0.55 + 0.6 * spell) * (released ? 0 : 1) + fl * 0.4;
        const tw = t * 0.85;
        const travel = released ? sstep(1.0, 2.6, relT) : 0;
        bez(_h, HS, HS.clone().lerp(HCTRL, 0.6), HCTRL, HREST, travel);
        sp.position.copy(_h).add(_a.set(
          Math.sin(tw) * 0.045 * dizzy * M + s.k.shake.x * 0.02 - fl * 0.03,
          Math.sin(t * 1.3) * 0.01 * M + s.k.bounce.x * 0.03 - s.k.flinch.x * 0.04,
          Math.cos(tw) * 0.035 * dizzy * M - s.k.flinch.x * 0.03));
        _e.set(Math.cos(tw * 1.1) * 0.07 * dizzy * M + s.k.flinch.x * 0.15, Math.sin(t * 0.4) * 0.08 * M + s.k.spin.x * 0.08, Math.sin(tw + 0.6) * 0.14 * dizzy * M + s.k.shake.x * 0.03);
        _q.setFromEuler(_e);
        sp.quaternion.copy(qSick).slerp(qRest, travel).multiply(_q);
        const breath = 1 + Math.sin(t * lerp(1.6, 1.0, h)) * 0.012 * M;
        headG.scale.set(breath, breath * (1 + s.k.bounce.x * 0.02), breath);
        sp.updateMatrix();

        // face: dizzy spells, then peace once it lets go
        rig.over(DIZZY, spell * sick * (released ? 0 : 1));
        const peace = released ? sstep(1.0, 2.0, relT) : 0;
        rig.over(PEACE, peace);
        for (const e of rig.eyes) e.look.visible = peace < 0.6;   // the engine's eye shine pokes through closed lids
        for (const l of lashes) l.visible = peace >= 0.6;

        // petals: wilting open crown, closing into a bud
        budS.target = released && relT > 0.5 ? 1 : 0;
        const bud = clamp(budS.step(dt), -0.1, 1.15);
        for (const pt of petals) {
          const wilt = pt.droop * (sick * 0.9 + fl * 0.4) - es * 0.15;
          _a.copy(pt.open); _a.y -= wilt;
          _a.x += Math.sin(t * 1.3 + pt.ph) * 0.04 * M; _a.z += Math.cos(t * 1.1 + pt.ph) * 0.04 * M;
          _b.copy(pt.out).multiplyScalar(0.22).add(UP);
          _a.normalize().lerp(_b.normalize(), clamp(bud, 0, 1));
          aimPetal(pt, _a, pt.roll * (1 - bud));
          pt.piv.position.set(pt.out.x * lerp(0.05, 0.035, bud), HB * lerp(0.8, 0.85, bud), pt.out.z * lerp(0.05, 0.035, bud));
          const sc = pt.size * lerp(1, 0.78, clamp(bud, 0, 1));
          pt.m.scale.set(sc, sc, sc * lerp(1, 0.55, clamp(bud, 0, 1)));
        }

        // the neck: from the vine on the tube up to the head; then a little stem
        const detach = released ? sstep(0.7, 1.0, relT) : 0;
        P3.set(0, -HB * 0.85, 0).applyMatrix4(sp.matrix);
        P2.set(0, -0.36, 0.02).applyMatrix4(sp.matrix);
        S1.set(0, -0.5, 0.0).applyMatrix4(sp.matrix); S0.set(0.02, -0.64, 0.02).applyMatrix4(sp.matrix);
        P0.copy(A0).lerp(S0, detach); P1.copy(A0).addScaledVector(A0out, 0.18).lerp(S1, detach);
        for (let j = 0; j <= NSEG; j++) bez(NP[j], P0, P1, P2, P3, j / NSEG);
        sweepNeck((u) => lerp(VR, VR * 1.12, u));
        bez(leafHold.position, P0, P1, P2, P3, 0.72);

        // glow when settled
        const glowK = released ? sstep(1.6, 2.8, relT) : 0;
        const pulse = 0.85 + 0.15 * Math.sin(t * 1.4);
        headMat.emissiveIntensity = glowK * 0.1 * pulse;
        halo.material.opacity = glowK * 0.4 * pulse;
        budLight.intensity = glowK * 0.45 * pulse;
        budLight.position.copy(root.localToWorld(_a.copy(sp.position).add(_b.set(0, 0.35, 0.45))));

        /* fimbriae: fingers sway softly */
        {
          const g = fingers[0].geometry, p = g.attributes.position, base = fingerBase[0], K = g.attributes.aK.array, PH = g.attributes.aPh.array;
          const amp = (0.03 + 0.02 * h + fl * 0.02) * M;
          for (let i = 0; i < p.count; i++) {
            const k = K[i] * K[i], ph = PH[i];
            p.array[i * 3] = base[i * 3] + Math.sin(t * 1.3 + ph) * amp * k;
            p.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 1.7 + ph * 2) * amp * 0.3 * k;
            p.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 1.1 + ph) * amp * k;
          }
          p.needsUpdate = true;
        }
        cradle.rotation.set(0, 0, 0);

        /* dark sap */
        const drip = sick > 0.3 && !released;
        for (const d of drops) {
          if (d.st === 'wait') {
            d.m.visible = false;
            d.t -= dt * (drip ? sick : 0);
            if (d.t <= 0 && drip) { d.st = 'bead'; d.k = 0; }
          } else if (d.st === 'bead') {
            d.k += dt / 1.4;
            beadPos(d, sw, d.m.position); d.m.visible = true;
            const k = clamp(d.k, 0, 1);
            d.m.scale.set(0.024 * k + 1e-4, 0.03 * k + 1e-4, 0.024 * k + 1e-4);
            if (d.k >= 1) { d.st = 'fall'; d.vy = 0; d.p.copy(d.m.position); d.floor = moundY(d.p.x, d.p.z) + 0.012; }
          } else if (d.st === 'fall') {
            d.vy -= 6 * dt; d.p.y += d.vy * dt; d.m.position.copy(d.p);
            d.m.scale.set(0.021, 0.034, 0.021);
            if (d.p.y <= d.floor) { d.st = 'splat'; d.k = 0; d.m.position.y = d.floor - 0.006; pudS.kick(1.2); }
          } else {
            d.k += dt / 0.45;
            const k = clamp(d.k, 0, 1);
            d.m.scale.set(0.024 * (1 + k), 0.012 * (1 - k) + 1e-4, 0.024 * (1 + k));
            if (k >= 1) { d.st = 'wait'; d.t = rnd(1.2, 2.6); d.m.visible = false; }
          }
          if (released && d.st !== 'wait') { d.st = 'wait'; d.t = 2; d.m.visible = false; }
        }
        pudS.target = 0; pudS.step(dt);
        const pk = clamp(sick * 1.15 - 0.12, 0, 1) * (1 - rel);
        puddle.visible = pk > 0.02;
        puddle.scale.set((0.075 + pudS.x * 0.012) * pk + 1e-4, 0.01 * pk + 1e-4, (0.06 + pudS.x * 0.01) * pk + 1e-4);

        /* flowers bloom along the healed tube */
        for (const f of flowers) {
          f.s.target = released && relT > f.delay ? 1 : 0;
          const k = Math.max(0, f.s.step(dt));
          f.m.scale.setScalar(Math.max(1e-4, f.size * Math.min(k, 1.2) * (1 + Math.sin(t * 1.2 + f.ph) * 0.03 * M)));
          f.m.rotation.y = Math.sin(t * 0.6 + f.ph) * 0.2 * M;
        }
      },
    };
  },
};
