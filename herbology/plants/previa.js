/* 4. Placenta Previa: the Low-Lying Protector.
   From her slide (refs/p24_0.jpg): a round uterus pod cut open at the front,
   green rind outside, layered pink rim, a dark maroon inside webbed with red
   veins, narrowing at the bottom to a cervix opening. Crouched low in the very
   bottom, right over that opening, sits the placenta: a purple cauliflower
   creature with ruffled leaves on top, big sad glossy brown eyes and a little
   frown, its red root-vein arms clawing the rim and its red roots running down
   through the opening into the soil. From its crown a twisted green vine climbs
   out of the pod, with big dark leaves and curly tendrils, to a bud holding a
   sleeping baby. A wooden sign hangs on twine: "I grow low... not where I
   should." Gnarled roots, moss and small purple flowers at the base.
   Healed (my addition): the problem is where it grows, so the protector climbs
   up to the side wall where it belongs, its roots let go of the opening, the
   bleeding stops, the vine straightens, the bud opens into a big flower around
   the baby, and the sign flips to "Safe and sound." */

export default {
  id: 'previa',
  look: { ink: '#3a2216', bands: [90, 154, 214, 255], outline: 0.0045, rune: ['#ff8a8a', '#9fe0b8'], bg: ['#4d3a2e', '#281b15', '#0d0806'] },
  frame: { halfH: 1.5, halfW: 1.22, lookY: 1.39 },
  careTitle: 'Protect the low-lying protector',
  lines: {
    sick: 'I grow low... not where I should.',
    wrong: ['Not there... I cover the exit.', 'Careful! It bleeds again.', 'Please, no digging...'],
    right: ['Thank you... gently does it.', 'You found where I am.'],
    healed: 'Safe and sound.',
  },
  shows: [
    '<b>The creature crouched over the pod’s bottom opening</b>, roots running through it: the placenta lies low and covers the cervix.',
    '<b>Bright red sap dripping from the opening</b> while nobody winces: painless, bright-red bleeding.',
    '<b>The drips come in spells, stop, then come back</b>: bleeding can recur.',
    '<b>A soft pod that only breathes</b>, never clenches, and a creature that is sad but not hurting: a soft, non-tender uterus.',
    '<b>The baby’s bud tipped over sideways</b>: the baby may lie in an abnormal position.',
  ],
  healedNote: 'Healed, the protector climbs up to the side wall, away from the opening: the opening is clear, the bleeding stops, the vine straightens and the bud opens into a flower around the safe baby. The trouble was never what it is, only where it grew.',

  build(kit) {
    const { THREE, world, toon, noOutline, canvasTex, sheet, limb, lumpGeo, tendrilGeo, taperTube, mergeGeometries, addLeaf, face, palette, Spring,
      solveChain, particles, spark, wisp, randDir, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, V3, TAU, DEG, UP, tex } = kit;

    const CY = 0.9, PR = 0.6, PT = 0.07, GAP = 1.25;        // pod centre height, outer radius, wall, half-width of the front cut
    const MOUND = (r) => 0.07 * Math.sqrt(Math.max(0, 1 - (r / 0.95) ** 2));
    const ZV = new V3(0, 0, 1);

    const P = palette({
      rind: ['#6a8250', '#7da45c'], wall: ['#561a28', '#7c3444'], wallVein: ['#c42630', '#d8687a'],
      body: ['#7a376a', '#a4528e'], ruff: ['#a05c94', '#cc82b0'], bodyVein: ['#c42a3c', '#d86078'],
      arm: ['#a0242f', '#bf5262'], leaf: ['#587240', '#66a04e'], vine: ['#5c7a3e', '#6f9e4b'], sepal: ['#6c8c4a', '#86b462'],
    });

    /* ---------- textures ---------- */
    function veinTree(x, cx, cy, ang, len, w, depth) {
      let px = cx, py = cy;
      const n = 5 + Math.floor(R() * 4);
      x.lineWidth = w; x.beginPath(); x.moveTo(px, py);
      for (let i = 0; i < n; i++) {
        ang += rr(-0.45, 0.45);
        px += Math.cos(ang) * len / n; py += Math.sin(ang) * len / n;
        x.lineTo(px, py);
        if (depth > 0 && R() < 0.42) { x.stroke(); veinTree(x, px, py, ang + rr(-1.1, 1.1), len * rr(0.35, 0.6), w * 0.62, depth - 1); x.lineWidth = w; x.beginPath(); x.moveTo(px, py); }
      }
      x.stroke();
    }
    const wallMask = canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#f00'; x.lineCap = 'round'; x.lineJoin = 'round';
      for (let i = 0; i < 9; i++) veinTree(x, (i + 0.5) / 9 * w + rr(-15, 15), h + 4, -Math.PI / 2 + rr(-0.5, 0.5), rr(220, 380), rr(4, 6.5), 3);
      for (let i = 0; i < 14; i++) veinTree(x, rr(0, w), rr(0.1, 0.8) * h, rr(0, TAU), rr(80, 160), rr(1.5, 3), 2);
    }, { srgb: false });
    const bodyMask = canvasTex(512, 256, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#f00'; x.lineCap = 'round'; x.lineJoin = 'round';
      for (let i = 0; i < 10; i++) veinTree(x, (i + 0.5) / 10 * w + rr(-10, 10), h + 2, -Math.PI / 2 + rr(-0.4, 0.4), rr(110, 190), rr(2.5, 4), 3);
    }, { srgb: false });
    const rimTex = canvasTex(256, 8, (x, w, h) => {        // across the cut wall: green rind, pink layers, maroon lining
      const bands = [[0, 0.13, '#6f8a52'], [0.13, 0.2, '#f4c8b8'], [0.2, 0.3, '#dc9590'], [0.3, 0.36, '#f0b8ac'], [0.36, 0.5, '#d48288'],
        [0.5, 0.56, '#eeb4aa'], [0.56, 0.7, '#cf7e86'], [0.7, 0.78, '#e8a49e'], [0.78, 0.88, '#b45a68'], [0.88, 1, '#6a2232']];
      for (const [a, b, c] of bands) { x.fillStyle = c; x.fillRect(a * w, 0, (b - a) * w + 1, h); }
    });
    const leafTex = canvasTex(128, 256, (x, w, h) => {
      x.fillStyle = '#e6e6dc'; x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(60,40,60,.22)'); g.addColorStop(0.5, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(60,40,60,.22)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(110,70,100,.75)'; x.lineCap = 'round';
      x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 8); x.stroke();
      x.lineWidth = 2;
      for (let i = 1; i <= 6; i++) {
        const y = h - i * h / 7.2;
        for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w / 2 + s * w * 0.2, y - h * 0.05, w / 2 + s * w * 0.45, y - h * 0.14); x.stroke(); }
      }
    });

    /* ---------- materials ---------- */
    function veined(m, mask, U, key, spread) {
      m.map = mask;
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        if (spread) sh.vertexShader = 'varying vec3 vLP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vLP = position;');
        sh.fragmentShader = `uniform vec3 uVein;\nuniform float uAmt;\n${spread ? 'varying vec3 vLP;\nuniform vec3 uAttach;\nuniform float uSpread;\nuniform float uFloor;\n' : ''}` +
          sh.fragmentShader.replace('#include <map_fragment>', `
          float vk = texture2D( map, vMapUv ).r * uAmt;
          ${spread ? 'vk *= mix( uFloor, 1.0, 1.0 - smoothstep( uSpread * 0.45, uSpread, distance( vLP, uAttach ) ) );' : ''}
          diffuseColor.rgb = mix( diffuseColor.rgb, uVein, clamp( vk, 0.0, 1.0 ) );`);
      };
      m.customProgramCacheKey = () => key;
      return m;
    }
    const wallU = { uVein: { value: new THREE.Color() }, uAmt: { value: 1 }, uAttach: { value: new V3(0, -0.3, 0) }, uSpread: { value: 0.6 }, uFloor: { value: 0.3 } };
    const bodyU = { uVein: { value: new THREE.Color() }, uAmt: { value: 0.9 } };
    const rindMat = toon('#6a8250', { map: tex.grain, thickness: 0.006 });
    const wallMat = veined(toon('#561a28', { thickness: 0 }), wallMask, wallU, 'pv-wall', true);
    const rimMat = toon('#ffffff', { map: rimTex, thickness: 0.004 });
    const bodyMat = veined(toon('#7a376a', { thickness: 0.005 }), bodyMask, bodyU, 'pv-body', false);
    const ruffMat = veined(toon('#94508a', { thickness: 0.004, side: THREE.DoubleSide }), bodyMask, bodyU, 'pv-body', false);
    const armMat = toon('#a0242f', { map: tex.bark, thickness: 0.0035 });
    const vineMat = toon('#5c7a3e', { map: tex.bark, thickness: 0.004 });
    const leafMat = toon('#4a6238', { map: leafTex, side: THREE.DoubleSide, thickness: 0.004 });
    const sepalMat = toon('#6c8c4a', { map: leafTex, side: THREE.DoubleSide, thickness: 0.0035 });
    const budOutMat = toon('#7c9c58', { thickness: 0.004 });
    const budInMat = toon('#7a2c3c', { thickness: 0 });
    const babyMat = toon('#f2b9a2', { thickness: 0.0028 });
    const inkMat = noOutline(new THREE.MeshBasicMaterial({ color: '#5a3020' }));
    const petalOut = toon('#f6a8bc', { side: THREE.DoubleSide, thickness: 0.003 });
    const petalIn = toon('#e8789a', { side: THREE.DoubleSide, thickness: 0.003 });
    const rootMat = toon('#5e4236', { map: tex.bark, thickness: 0.0045 });
    const soilMat = toon('#5a4232', { map: tex.grain, thickness: 0.003 });
    const mossMat = toon('#6f8c3c', { map: tex.grain, thickness: 0.003 });
    const flowerMat = toon('#ffffff', { vertexColors: true, thickness: 0.0022 });
    const sapMat = toon('#d01e2a', { thickness: 0.003, emissive: '#5a0008', emissiveIntensity: 0.6 });
    const puddleMat = toon('#b41822', { thickness: 0.0025, emissive: '#4a0006', emissiveIntensity: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ffd8d8' }));
    const woodMat = toon('#a8845a', { thickness: 0.003 });
    const twineMat = toon('#c8b088', { thickness: 0.0015 });

    /* ---------- a lathe shell with the front cut away ---------- */
    function grid(nu, nv, fn, expect) {
      const pos = [], uv = [], idx = [];
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const r = fn(i, j); pos.push(r[0], r[1], r[2]); uv.push(r[3], r[4]); }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      const q = (Math.floor(nv / 2) * nu + Math.floor(nu / 2)) * 6;
      const A = new V3().fromArray(pos, idx[q] * 3), B = new V3().fromArray(pos, idx[q + 1] * 3), C = new V3().fromArray(pos, idx[q + 2] * 3);
      const n = B.clone().sub(A).cross(C.clone().sub(A)), cen = A.clone().add(B).add(C).divideScalar(3);
      if (n.dot(expect(cen)) < 0) for (let k = 0; k < idx.length; k += 3) { const tmp = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = tmp; }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    function shell(ctrl, T, gap, K, rows, uvO = [1, 1]) {
      const curve = new THREE.CatmullRomCurve3(ctrl.map(([r, y]) => new V3(r, y, 0)));
      const Pp = curve.getSpacedPoints(rows);
      const N = Pp.map((p, j) => { const a = Pp[Math.max(0, j - 1)], b = Pp[Math.min(rows, j + 1)], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty); return new V3(ty / l, -tx / l, 0); });
      const Qp = Pp.map((p, j) => p.clone().addScaledVector(N[j], -T));
      const ph0 = gap, ph1 = TAU - gap, ph = (i) => lerp(ph0, ph1, i / K);
      const at = (p, f) => [p.x * Math.sin(f), p.y, p.x * Math.cos(f)];
      const radial = (c) => new V3(c.x, 0, c.z);
      const outer = grid(K, rows, (i, j) => [...at(Pp[j], ph(i)), i / K * uvO[0], j / rows * uvO[1]], radial);
      const inner = grid(K, rows, (i, j) => [...at(Qp[j], ph(i)), i / K, j / rows], (c) => radial(c).negate());
      const mid = (j, t) => Pp[j].clone().lerp(Qp[j], t);
      const parts = [
        grid(2, rows, (i, j) => [...at(mid(j, i / 2), ph0), i / 2, j / rows], () => new V3(-Math.cos(ph0), 0, -Math.sin(ph0) * -1)),
        grid(2, rows, (i, j) => [...at(mid(j, i / 2), ph1), i / 2, j / rows], () => new V3(Math.cos(ph1), 0, -Math.sin(ph1))),
      ];
      const tan = (j0, j1) => Pp[j1].clone().sub(Pp[j0]).normalize();
      const tTop = tan(rows - 1, rows), tBot = tan(1, 0);
      parts.push(grid(K, 2, (i, j) => [...at(mid(rows, j / 2), ph(i)), j / 2, i / K], (c) => { const f = Math.atan2(c.x, c.z); return new V3(tTop.x * Math.sin(f), tTop.y, tTop.x * Math.cos(f)); }));
      parts.push(grid(K, 2, (i, j) => [...at(mid(0, j / 2), ph(i)), j / 2, i / K], (c) => { const f = Math.atan2(c.x, c.z); return new V3(tBot.x * Math.sin(f), tBot.y, tBot.x * Math.cos(f)); }));
      return { outer, inner, rim: mergeGeometries(parts), Pp, Qp, ph0, ph1, mid, at };
    }

    const G = new THREE.Group(); world.add(G);

    /* ---------- ground: soil mound, gnarled roots, moss, flowers ---------- */
    const soil = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 10, 0, TAU, 0, Math.PI / 2).scale(0.95, 0.07, 0.95), soilMat);
    soil.receiveShadow = true; G.add(soil);

    const sph = (th) => [PR * Math.sin(th), -PR * Math.cos(th)];
    const POD = shell([[0.125, -0.71], [0.14, -0.68], [0.178, -0.628], sph(0.45), sph(0.72), sph(1.0), sph(1.3), sph(1.6), sph(1.9), sph(2.2), sph(2.45), sph(Math.PI - 0.6)], PT, GAP, 36, 32, [4, 3]);

    {
      const roots = [];
      for (let i = 0; i < 9; i++) {
        const f = lerp(0.95, TAU - 0.95, i / 8) + rr(-0.15, 0.15), th = rr(0.12, 0.3);   // none across the front: the opening stays in view
        const r0 = PR * Math.sin(th) * 0.96, y0 = CY - PR * Math.cos(th) * 0.96;
        const d = new V3(Math.sin(f), 0, Math.cos(f)), far = rr(0.62, 0.98);
        const pts = [];
        for (let k = 0; k <= 6; k++) {
          const u = k / 6, rad = lerp(r0, far, Math.pow(u, 0.8));
          const y = lerp(y0, MOUND(rad) + 0.008, sstep(0, 0.3, u));
          const side = new V3(d.z, 0, -d.x).multiplyScalar(Math.sin(u * 5 + i) * 0.05 * u);
          pts.push(d.clone().multiplyScalar(rad).add(side).setY(y + (k > 0 && k < 6 ? rr(-0.012, 0.012) : 0)));
        }
        roots.push(taperTube(pts, rr(0.032, 0.042), 0.007, { segs: 20, radial: 6 }));
        if (R() < 0.7) {                                  // a side rootlet
          const s0 = pts[4].clone(), dd = new V3(d.z, 0, -d.x).multiplyScalar(R() < 0.5 ? 1 : -1);
          const e = s0.clone().addScaledVector(dd, 0.2).addScaledVector(d, 0.12);
          e.y = MOUND(Math.hypot(e.x, e.z)) + 0.008;
          roots.push(taperTube([s0, s0.clone().lerp(e, 0.5).setY(s0.y + 0.01), e], 0.02, 0.005, { segs: 12, radial: 6 }));
        }
      }
      const rm = new THREE.Mesh(mergeGeometries(roots), rootMat); rm.castShadow = true; G.add(rm);

      const moss = [];
      for (let i = 0; i < 40; i++) {
        const a = rr(0, TAU), r = rr(0.16, 0.8);
        moss.push([Math.sin(a) * r, MOUND(r) + 0.005, Math.cos(a) * r, rr(0.035, 0.085), 0.42]);
      }
      const mm = new THREE.Mesh(lumpGeo(moss, 9, 5), mossMat); mm.receiveShadow = true; G.add(mm);
    }
    function flowerGeo(x, z, s, col) {
      const parts = [], c = new THREE.Color(col), cc = new THREE.Color('#f6d860');
      const paint = (g, cl) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) cl.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
      const y = MOUND(Math.hypot(x, z)) + 0.03 * s;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        parts.push(paint(new THREE.SphereGeometry(0.03, 6, 4).scale(0.62, 0.22, 1).translate(0, 0, 0.03).rotateY(a).scale(s, s, s).translate(x, y, z), c));
      }
      parts.push(paint(new THREE.SphereGeometry(0.014, 6, 4).scale(s, s * 0.7, s).translate(x, y + 0.004 * s, z), cc));
      parts.push(paint(new THREE.CylinderGeometry(0.004, 0.005, 0.03 * s, 5).translate(x, y - 0.015 * s, z), new THREE.Color('#5a7a36')));
      return mergeGeometries(parts);
    }
    {
      const fl = [];
      for (const [a, r, s] of [[0.5, 0.62, 1.1], [1.0, 0.82, 0.9], [2.4, 0.7, 1.0], [-0.6, 0.66, 1.2], [-1.2, 0.84, 0.85], [-2.5, 0.6, 1], [3.0, 0.8, 0.9], [0.1, 0.86, 0.8]]) {
        fl.push(flowerGeo(Math.sin(a) * r, Math.cos(a) * r, s, R() < 0.5 ? '#9a74c8' : '#b48ad8'));
      }
      const fm = new THREE.Mesh(mergeGeometries(fl), flowerMat); G.add(fm);
    }
    // flowers that come up where the red puddle was, once healed
    const bloomFlowers = [];
    for (const [a, r, s] of [[0.3, 0.16, 1.4], [-0.9, 0.2, 1.2], [1.6, 0.22, 1.25], [2.6, 0.17, 1.1], [-2.2, 0.24, 1.3]]) {
      const x = Math.sin(a) * r, z = Math.cos(a) * r + 0.03;
      const g = flowerGeo(0, 0, s, a > 0 ? '#c890e0' : '#f0a0c8');
      const m = new THREE.Mesh(g, flowerMat); m.position.set(x, 0, z); m.scale.setScalar(1e-4); G.add(m);
      bloomFlowers.push({ m, d: rr(0, 0.25) });
    }

    /* ---------- the pod ---------- */
    const podG = new THREE.Group(); podG.position.y = CY; G.add(podG);
    const rind = new THREE.Mesh(POD.outer, rindMat); rind.castShadow = true; rind.receiveShadow = true;
    const wall = new THREE.Mesh(POD.inner, wallMat); wall.receiveShadow = true;
    const rim = new THREE.Mesh(POD.rim, rimMat);
    podG.add(rind, wall, rim);
    const rows = POD.Pp.length - 1;
    const jAtY = (y) => { let best = 0; for (let j = 0; j <= rows; j++) if (Math.abs(POD.Pp[j].y - y) < Math.abs(POD.Pp[best].y - y)) best = j; return best; };
    function rimPoint(side, y) {
      const j = jAtY(y), f = side > 0 ? POD.ph0 : POD.ph1;
      const [x, yy, z] = POD.at(POD.mid(j, 0.5), f);
      return new V3(x, yy, z).add(new V3(-side * Math.cos(GAP), 0, Math.sin(GAP)).multiplyScalar(0.025));
    }

    /* ---------- the creature ---------- */
    const cre = new THREE.Group(); podG.add(cre);
    const BA = 0.3, BB = 0.27, BC = 0.24;
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28).scale(BA, BB, BC), bodyMat); body.castShadow = true;
    cre.add(body);
    {
      const fl = [];
      for (let i = 0; i < 200 && fl.length < 42; i++) {
        const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)); if (d.lengthSq() > 1 || d.lengthSq() < 0.05) continue; d.normalize();
        if (d.z > 0.45 && d.y < 0.5 && d.y > -0.66 && Math.abs(d.x) < 0.66) continue;    // keep the face clear
        if (d.y < -0.8) continue;
        const r = rr(0.055, 0.095) * (d.y > 0.3 ? 1.15 : 1);
        fl.push([d.x * BA * 0.93, d.y * BB * 0.93, d.z * BC * 0.93, r]);
      }
      const florets = new THREE.Mesh(lumpGeo(fl, 10, 7), bodyMat); florets.castShadow = true; cre.add(florets);
      const RUF = sheet({ width: 0.62, cup: 0.34, curl: 0.3, wave: 0.16, waveN: 6, point: 0.3, cols: 14, rows: 10, tipPinch: -0.4 });
      const rf = [];
      for (const [az, hy, sz] of [[1.1, 0.6, 0.27], [-1.15, 0.62, 0.26], [1.9, 0.66, 0.27], [-1.95, 0.64, 0.27], [Math.PI, 0.72, 0.26], [0.5, 0.86, 0.2], [-0.55, 0.88, 0.19]]) {
        const out = new V3(Math.sin(az), 0, Math.cos(az));
        const dir = out.clone().multiplyScalar(0.6).add(new V3(0, Math.abs(az) < 1 ? 1.3 : 1.0, 0)).normalize();
        const at = new V3(out.x * BA * 0.55, BB * hy, out.z * BC * 0.55);
        const m = new THREE.Matrix4().compose(at,
          new THREE.Quaternion().setFromUnitVectors(UP, dir).multiply(new THREE.Quaternion().setFromAxisAngle(UP, az)), new V3(1, 1, 1).multiplyScalar(sz));
        rf.push(RUF.clone().applyMatrix4(m));
      }
      const ruff = new THREE.Mesh(mergeGeometries(rf), ruffMat); cre.add(ruff);
    }
    const rig = face(cre, {
      a: BA, b: BB, c: BC, gazeScale: 0.7,
      eyes: { x: 0.11, y: 0.0, r: 0.08, iris: '#6b3a1a', lid: '#7a376a' },
      brows: { y: 0.122, len: 0.08, r: 0.009, color: '#3a1a24' },
      mouth: { y: -0.13, inside: '#4a1020', lip: '#2a1010' },
      sickE: { lid: 0.86, low: 0.12, brow: 0.62, browY: 0.008, smile: -0.7, open: 0, w: 0.05 },
      wellE: { lid: 1, low: 0.3, brow: -0.05, browY: 0.016, smile: 0.9, open: 0.25, w: 0.09 },
      wrongE: { lid: 0.3, low: 0.5, brow: 0.85, browY: 0.0, smile: -1, open: 0.35, w: 0.06 },
      rightE: { lid: 0.95, low: 0.45, brow: 0.3, browY: 0.02, smile: 0.4, open: 0.1, w: 0.07 },
    });

    // red root-vein arms, claws on the rim
    const CLAW = (() => {
      const parts = [];
      for (const ang of [-38, 0, 38]) {
        const d = new V3(Math.sin(ang * DEG), 0, Math.cos(ang * DEG));
        const curve = new THREE.CatmullRomCurve3([new V3(0, 0, 0), d.clone().multiplyScalar(0.05).setY(0.012), d.clone().multiplyScalar(0.09).setY(-0.005), d.clone().multiplyScalar(0.105).setY(-0.04)]);
        parts.push(new THREE.TubeGeometry(curve, 10, 0.011, 6).toNonIndexed());
        parts.push(new THREE.ConeGeometry(0.011, 0.035, 6).translate(0, -0.0175, 0).translate(...d.clone().multiplyScalar(0.107).setY(-0.04).toArray()).toNonIndexed());
      }
      parts.push(new THREE.SphereGeometry(0.024, 10, 8).toNonIndexed());
      return mergeGeometries(parts);
    })();
    const _bm = new THREE.Matrix4();
    function basisQ(z, yHint) {
      const Z = z.clone().normalize(), Y = yHint.clone().addScaledVector(Z, -yHint.dot(Z)).normalize(), X = new V3().crossVectors(Y, Z);
      return new THREE.Quaternion().setFromRotationMatrix(_bm.makeBasis(X, Y, Z));
    }
    const arms = [];
    for (const side of [-1, 1]) {
      const L = limb({ len: 0.34, r0: 0.034, r1: 0.016, bones: 4, mat: armMat, gnarl: 0.12, radial: 8, cap: false });
      L.bones[0].rotation.order = 'YXZ';
      podG.add(L.mesh);
      const foot = new THREE.Group(); foot.position.y = L.seg; L.bones[3].add(foot);
      const claw = new THREE.Mesh(CLAW, armMat); foot.add(claw);
      arms.push({
        side, L, foot, st: { a: -0.6, c: 0.3 },
        sick: rimPoint(side, -0.47),
        healed: side < 0 ? new V3(-0.46, 0.0, -0.2) : new V3(0.16, 0.06, -0.48),
      });
      const A = arms[arms.length - 1], rr0 = A.healed.clone().normalize();
      A.qSick = basisQ(new V3(side * 0.9, -0.3, 0.3), new V3(0, 0.2, 1));      // fingers across the rim, tips curling behind it
      A.qHeal = basisQ(UP.clone().addScaledVector(rr0, -rr0.y), rr0.clone().negate());   // fingers up the wall, tips into it
    }
    // the roots it sends down through the opening
    const cervRoots = new THREE.Group(); cervRoots.position.set(0, -0.56, 0.0); podG.add(cervRoots);
    {
      const rs = [];
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.4, d = new V3(Math.sin(a), 0, Math.cos(a)), out = rr(0.18, 0.32);
        const groundY = -(CY - 0.56) + MOUND(out) + 0.01;
        rs.push(taperTube([new V3(d.x * 0.03, 0.06, d.z * 0.03), new V3(d.x * 0.02, -0.06, d.z * 0.02), new V3(d.x * 0.03, -0.17, d.z * 0.03),
          new V3(d.x * 0.08, groundY + 0.06, d.z * 0.08), new V3(d.x * out * 0.7, groundY + 0.01, d.z * out * 0.7), new V3(d.x * out, groundY, d.z * out)], 0.02, 0.006, { segs: 28, radial: 6 }));
      }
      const m = new THREE.Mesh(mergeGeometries(rs), armMat); cervRoots.add(m);
    }

    /* ---------- the vine, leaves, tendrils ---------- */
    const VN = 8, VLEN = 1.4;
    const vine = limb({ len: VLEN, r0: 0.046, r1: 0.026, bones: VN, mat: vineMat, strands: 2, twist: 1.6, spread: 0.02, gnarl: 0.05, radial: 8 });
    vine.bones[0].rotation.order = 'YXZ';
    G.add(vine.mesh);
    const vineCap = vine.bones[VN - 1].children.find((c) => c.isMesh);
    const vst = { a: 1.2, c: 0.05 };
    const nodes = Array.from({ length: VN + 1 }, () => { const g = new THREE.Group(); G.add(g); return g; });

    const LEAF = (() => {
      const s = sheet({ width: 0.62, cup: 0.1, curl: 0.12, tipPinch: 0.22, point: 0.42, cols: 8, rows: 14, wave: 0.05, waveN: 4 }).translate(0, 0.13, 0);
      const st = new THREE.CylinderGeometry(0.011, 0.014, 0.15, 6).translate(0, 0.075, 0);
      return mergeGeometries([s, st]);
    })();
    for (const [n, well, sickD, size] of [
      [6, new V3(-1, 0.55, 0.25), new V3(-1, -0.15, 0.3), 0.5],
      [4, new V3(1, 0.32, 0.18), new V3(1, -0.3, 0.25), 0.48],
      [5, new V3(-0.7, 0.25, 0.75), new V3(-0.7, -0.45, 0.75), 0.3],
      [3, new V3(0.55, 0.6, -0.6), new V3(0.6, 0.0, -0.6), 0.28],
      [7, new V3(0.55, 0.75, -0.55), new V3(0.7, 0.1, -0.5), 0.26],
    ]) addLeaf(nodes[n], new V3(0, 0, 0), well, sickD, size, leafMat, LEAF);
    const tendrils = [];
    for (const [n, rotZ, rotY, dir, s] of [[5, -0.7, 0.3, 1, 1.2], [6, 0.6, -0.4, -1, 1], [3, 0.9, 2.4, -1, 1.1]]) {
      const m = new THREE.Mesh(tendrilGeo({ rise: 0.1, r0: 0.065, coils: 1.8, thick: 0.009, dir }), vineMat);
      const g = new THREE.Group(); g.rotation.set(0, rotY, rotZ); g.scale.setScalar(s); g.add(m); nodes[n].add(g);
      tendrils.push({ g, rotZ, ph: rr(0, TAU) });
    }

    /* ---------- the bud and the sleeping baby ---------- */
    const budG = new THREE.Group(); G.add(budG);
    const bud = new THREE.Group(); bud.position.y = 0.25; bud.scale.setScalar(1.3); budG.add(bud);
    const BUD = shell([[0.03, -0.2], [0.11, -0.17], [0.18, -0.07], [0.2, 0.04], [0.17, 0.15], [0.1, 0.22], [0.05, 0.245]], 0.022, 0.95, 24, 20);
    { const o = new THREE.Mesh(BUD.outer, budOutMat), i = new THREE.Mesh(BUD.inner, budInMat), r = new THREE.Mesh(BUD.rim, rimMat); o.castShadow = true; bud.add(o, i, r); }
    const SEPAL = sheet({ width: 0.42, cup: 0.28, curl: -0.2, tipPinch: 0.45, point: 0.7, rows: 12 });
    const sepals = [];
    for (const az of [Math.PI, 2.25, -2.25, 1.35, -1.35]) {
      const arm = new THREE.Group(); arm.rotation.y = az; arm.position.y = -0.16; bud.add(arm);
      const p = new THREE.Mesh(SEPAL, sepalMat); p.scale.setScalar(Math.abs(az) > 2 ? 0.4 : 0.34); p.position.z = 0.15;
      arm.add(p); sepals.push({ p, az });
    }
    const PETAL = sheet({ width: 0.9, cup: 0.3, curl: 0.2, tipPinch: -0.4, cols: 8, rows: 8, point: 0.35 });
    // the flower faces you, behind the chamber, so it opens round the baby like a halo
    const flower = new THREE.Group(); flower.position.set(0, 0.02, -0.12); flower.rotation.x = Math.PI / 2 + 0.12; flower.scale.setScalar(1e-4); bud.add(flower);
    const petals = [];
    for (const [n, size, o0, o1, mat, ring] of [[9, 0.27, 0.3, 1.42, petalOut, 0], [9, 0.21, 0.2, 1.2, petalIn, 1]]) {
      for (let i = 0; i < n; i++) {
        const arm = new THREE.Group(); arm.rotation.y = (i + 0.5 * ring) / n * TAU; arm.position.y = ring * 0.03; flower.add(arm);
        const p = new THREE.Mesh(PETAL, mat); p.scale.setScalar(size); p.position.z = 0.1 + ring * 0.01;
        arm.add(p); petals.push({ p, o0, o1 });
      }
    }
    const baby = new THREE.Group(); baby.position.set(0.0, 0.0, 0.03); baby.scale.setScalar(1.3); bud.add(baby);
    {
      const parts = [], S = (r, ws = 12, hs = 8) => new THREE.SphereGeometry(r, ws, hs);
      const cap = (a, b, r) => {
        const A = new V3(...a), B = new V3(...b), d = B.clone().sub(A), len = d.length();
        return new THREE.CapsuleGeometry(r, Math.max(0.001, len), 4, 8).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize())).translate(...A.clone().lerp(B, 0.5).toArray());
      };
      parts.push(S(0.062, 18, 12).translate(-0.035, 0.055, 0));                       // head
      parts.push(S(0.012, 8, 6).translate(0.026, 0.042, 0.012));                       // nose
      parts.push(S(0.014, 8, 6).scale(1, 1.25, 0.6).translate(-0.05, 0.05, 0.056));   // ear
      parts.push(S(1, 20, 14).scale(0.06, 0.078, 0.052).rotateZ(-0.5).translate(-0.012, -0.035, 0));   // body
      for (const z of [-0.022, 0.024]) {
        parts.push(cap([-0.02, -0.085, z], [0.05, -0.052, z * 1.2], 0.021));          // thigh
        parts.push(cap([0.05, -0.052, z * 1.2], [0.012, -0.108, z * 1.3], 0.017));    // shin
        parts.push(S(0.016, 10, 8).scale(1.3, 0.8, 0.9).translate(0.02, -0.112, z * 1.3));   // foot
        parts.push(cap([-0.005, 0.0, z * 1.4], [0.03, 0.025, z * 0.9], 0.014));        // arm
        parts.push(S(0.014, 10, 8).translate(0.034, 0.032, z * 0.8));                  // hand by the chin
      }
      const bm = new THREE.Mesh(mergeGeometries(parts), babyMat); baby.add(bm);
      const eye = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.0022, 4, 10, Math.PI).rotateZ(Math.PI).translate(0.004, 0.06, 0.052), inkMat);
      baby.add(eye);
    }

    /* ---------- the sign, on twine ---------- */
    const signG = new THREE.Group(); G.add(signG);
    const swingG = new THREE.Group(); signG.add(swingG);
    const SIGN_W = 0.34, SIGN_H = 0.29;
    const drawSign = (lines, sizes, doodle) => (x, w, h) => {
      x.fillStyle = '#c9a272'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 46; i++) {
        x.strokeStyle = R() < 0.65 ? 'rgba(90,58,28,.22)' : 'rgba(255,240,210,.2)'; x.lineWidth = rr(1, 2.5);
        const y0 = R() * h; x.beginPath(); x.moveTo(0, y0);
        for (let px = 0; px <= w; px += 16) x.lineTo(px, y0 + Math.sin(px * 0.03 + i) * 3);
        x.stroke();
      }
      x.strokeStyle = 'rgba(80,50,22,.5)'; x.lineWidth = 9; x.strokeRect(4, 4, w - 8, h - 8);
      x.fillStyle = '#3a2614'; for (const px of [40, w - 40]) { x.beginPath(); x.arc(px, 20, 6, 0, TAU); x.fill(); }
      x.save(); x.translate(w / 2, h / 2); x.rotate(-0.07);
      x.fillStyle = '#3a2214'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const lh = h * 0.8 / lines.length;
      lines.forEach((l, i) => { x.font = `italic 700 ${sizes[i]}px "Cormorant Garamond", Georgia, serif`; x.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + 6); });
      if (doodle) {
        x.strokeStyle = '#7a3a3a'; x.lineWidth = 3; x.fillStyle = '#d06a7a';
        x.beginPath(); x.moveTo(78, 52); x.bezierCurveTo(78, 40, 96, 40, 96, 52); x.bezierCurveTo(96, 62, 82, 68, 78, 74); x.bezierCurveTo(74, 68, 60, 62, 60, 52); x.bezierCurveTo(60, 40, 78, 40, 78, 52); x.fill(); x.stroke();
      }
      x.restore();
    };
    const frontDraw = drawSign(['I grow', 'Low...', 'not where', 'I should.'], [40, 46, 38, 38], false);
    const backDraw = drawSign(['Safe', 'and', 'sound.'], [50, 40, 50], true);
    const frontTex = canvasTex(256, 220, frontDraw), backTex = canvasTex(256, 220, backDraw);
    document.fonts?.load?.('italic 700 40px "Cormorant Garamond"').then(() => {
      for (const [t, d] of [[frontTex, frontDraw], [backTex, backDraw]]) { d(t.image.getContext('2d'), 256, 220); t.needsUpdate = true; }
    }).catch(() => {});
    {
      const g = new THREE.BoxGeometry(SIGN_W, SIGN_H, 0.022);
      g.clearGroups(); g.addGroup(0, 24, 0); g.addGroup(24, 6, 1); g.addGroup(30, 6, 2);
      const board = new THREE.Mesh(g, [woodMat, toon('#ffffff', { map: frontTex, thickness: 0.003 }), toon('#ffffff', { map: backTex, thickness: 0.003 })]);
      board.position.y = -0.12 - SIGN_H / 2; board.rotation.z = 0.06; board.castShadow = true;
      swingG.add(board);
      const tw = [];
      for (const s of [-1, 1]) {
        const a = new V3(0, 0, 0), b = new V3(s * (SIGN_W / 2 - 0.045), -0.13 + s * 0.01, 0), d = b.clone().sub(a);
        tw.push(new THREE.CylinderGeometry(0.004, 0.004, d.length(), 5).translate(0, d.length() / 2, 0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize())));
      }
      tw.push(new THREE.TorusGeometry(0.018, 0.005, 5, 10).rotateY(Math.PI / 2));
      swingG.add(new THREE.Mesh(mergeGeometries(tw), twineMat));
    }
    const stalk = new THREE.Mesh(taperTube([new V3(0, 0, 0), new V3(0.06, 0.5, 0), new V3(0, 1, 0)], 0.02, 0.011, { segs: 12, radial: 6 }), vineMat);
    G.add(stalk);

    /* ---------- the bleeding: drops, a bead, the puddle, splashes ---------- */
    const splash = particles(tex.dot, 90);
    const MOUTH = new V3(0, CY - 0.715, 0.035), PUD_Y = MOUND(0) + 0.003;
    const DROP = new THREE.SphereGeometry(1, 14, 10);
    const drops = [];
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(DROP, sapMat); m.visible = false;
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), shineMat); sh.position.set(-0.35, 0.3, 0.75); m.add(sh);
      G.add(m); drops.push({ m, phase: 'idle', t: 0, v: 0, x: 0, z: 0 });
    }
    const bead = new THREE.Mesh(DROP, sapMat); G.add(bead);
    { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), shineMat); sh.position.set(-0.35, 0.3, 0.75); bead.add(sh); }
    const puddleGeo = (() => {
      const g = new THREE.CircleGeometry(1, 30), p = g.attributes.position;
      for (let i = 1; i < p.count; i++) { const a = Math.atan2(p.getY(i), p.getX(i)), k = 1 + 0.13 * Math.sin(3 * a + 0.5) + 0.07 * Math.sin(5 * a + 2); p.setXY(i, p.getX(i) * k, p.getY(i) * k); }
      return g.rotateX(-Math.PI / 2);
    })();
    const puddle = new THREE.Mesh(puddleGeo, puddleMat); puddle.position.set(0.02, PUD_Y, 0.06); G.add(puddle);

    /* ---------- motion state ---------- */
    const bleed = { on: false, t: 0, dur: 0, inten: 0, cool: 0.6, acc: 0, env: 0 };
    let puddleR = 0.13;
    const puddleS = new Spring(160, 9, 1);
    const relax = new Spring(40, 6);
    const budKick = new Spring(70, 5);
    const swing = new Spring(28, 1.6), swingX = new Spring(26, 1.8);
    const flipS = new Spring(38, 7);
    const bloomS = new Spring(110, 8);
    let sigh = null, nextSigh = 4.5;
    const dirSick = new V3(0, -1, 0.13).normalize(), dirHeal = new V3(-0.55, 0.26, -0.76).normalize();
    const CDIST = 0.28;
    const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion();
    const v1 = new V3(), v2 = new V3(), v3 = new V3();

    /** Bend a limb as an even arc from its root to a point D across and H up.
        The segments shorten (down to kMin) so the arc keeps only `slack` spare length. */
    function bendTo(L, D, H, slack, kMin, cap) {
      const chord = Math.max(1e-4, Math.hypot(D, H));
      const k = clamp(chord * slack / L.len, kMin, 1), seg = (L.len / L.nb) * k, Ls = seg * L.nb;
      for (let i = 1; i < L.nb; i++) L.bones[i].position.y = seg;
      if (cap) cap.position.y = seg;
      const ratio = clamp(chord / Ls, 0.05, 1);
      let lo = 0, hi = TAU * 0.95;                       // solve sin(p/2)/(p/2) = ratio for the arc angle p
      for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2, f = Math.sin(m / 2) / (m / 2); if (f > ratio) lo = m; else hi = m; }
      const c = lo / L.nb, beta = Math.atan2(H, D);
      return { a: beta + c * (L.nb - 1) / 2, c, seg };
    }

    function startBleed(inten, dur) { bleed.on = true; bleed.t = 0; bleed.dur = dur; bleed.inten = inten; }
    function spawnDrop() {
      const d = drops.find((q) => q.phase === 'idle'); if (!d) return;
      d.phase = 'form'; d.t = 0; d.x = MOUTH.x + rr(-0.025, 0.025); d.z = MOUTH.z + rr(-0.01, 0.015); d.m.visible = true;
    }
    function resetAll() {
      Object.assign(bleed, { on: false, t: 0, dur: 0, inten: 0, cool: 0.6, acc: 0, env: 0 });
      puddleR = 0.13; flipS.set(0); bloomS.set(0); sigh = null;
      for (const d of drops) { d.phase = 'idle'; d.m.visible = false; }
    }

    const centreW = () => cre.localToWorld(new V3(0, 0.02, 0));

    return {
      centre: centreW,
      anchor: () => cre.localToWorld(new V3(0.3, 0.32, 0)),
      react(type, s) {
        if (type === 'wrong') {          // it flinches, and a bleed starts
          startBleed(Math.max(0.75, s.sick), 2.4);
          swing.kick(3.2); swingX.kick(-1.6); budKick.kick(3);
          const c = centreW();
          for (let i = 0; i < 8; i++) spark.emit(c.clone().add(randDir().multiplyScalar(0.2)), { v: randDir().multiplyScalar(0.5), life: 0.5, s0: 0.07, s1: 0, color: '#ff5050', drag: 2 });
        } else {                         // it relaxes, and the drip slows
          relax.kick(2.5); swing.kick(-1.2);
          if (bleed.on) { bleed.dur = Math.min(bleed.dur, bleed.t + 0.35); bleed.inten *= 0.4; }
          bleed.cool += 3;
        }
      },
      burst() {
        bleed.on = false; bleed.cool = 1e9; sigh = null;
        swing.kick(2);
        const b = budG.localToWorld(new V3(0, 0.2, 0));
        for (let i = 0; i < 40; i++) spark.emit(b.clone().add(randDir().multiplyScalar(0.12)), { v: randDir().multiplyScalar(rnd(0.6, 1.4)), life: rnd(0.9, 1.5), s0: 0.09, s1: 0.01, color: i % 2 ? '#ffd1e6' : '#fff2b0', drag: 1.6 });
      },
      reset: resetAll,
      update(s) {
        const { t, dt, h, hp, sick, heal } = s;
        const fl = s.k.flinch.x;
        kit.leafFold = clamp(fl, 0, 1) * 0.6;
        relax.step(dt); budKick.step(dt); swing.step(dt); swingX.step(dt);

        /* where it grows: low over the opening, or up on the side wall */
        const climb = clamp(0.25 * sstep(0.4, 0.8, hp) + 0.75 * sstep(0.8, 1.0, hp), 0, 1.06);
        const cl = clamp(climb, 0, 1);

        /* colours */
        P.mix(rindMat, 'rind', h); P.mix(wallMat, 'wall', h); P.mix(wallU.uVein.value, 'wallVein', h);
        P.mix(bodyMat, 'body', h); P.mix(ruffMat, 'ruff', h); P.mix(bodyU.uVein.value, 'bodyVein', h); P.mix(rig.lidMat, 'body', h);
        P.mix(armMat, 'arm', h); P.mix(leafMat, 'leaf', h); P.mix(vineMat, 'vine', h); P.mix(sepalMat, 'sepal', h);
        bodyU.uAmt.value = lerp(0.95, 0.55, h);

        /* the soft pod: it only breathes, it never clenches */
        const breath = Math.sin(t * 1.1) * M;
        podG.scale.setScalar(1 + 0.011 * breath + relax.x * 0.01);

        /* bleeding episodes */
        if (!heal.on && !s.healed && h < 0.97) {
          if (!bleed.on) {
            bleed.cool -= dt;
            if (bleed.cool <= 0 && sick > 0.08) startBleed(sick, lerp(1.0, 3.0, sick) + rnd(0, 0.5));
          } else {
            bleed.t += dt;
            if (bleed.t > bleed.dur) { bleed.on = false; bleed.cool = lerp(10, 3.6, sick) + rnd(0, 1.5); }
          }
        } else bleed.on = false;
        const env = bleed.on ? sstep(0, 0.3, bleed.t) * (1 - sstep(bleed.dur - 0.45, bleed.dur, bleed.t)) : 0;
        bleed.env = lerp(bleed.env, env, 1 - Math.exp(-dt * 8));
        if (bleed.on) {
          bleed.acc += dt * lerp(2.2, 6.5, bleed.inten) * env;
          while (bleed.acc >= 1) { bleed.acc -= 1; spawnDrop(); }
        }

        /* the creature: calm-sad, breathing, sighing; flinches on a wrong card */
        nextSigh -= dt;
        if (nextSigh <= 0) { if (sick > 0.3 && !heal.on) sigh = { t: 0 }; nextSigh = rnd(6, 9); }
        let sg = 0;
        if (sigh) { sigh.t += dt; sg = Math.sin(Math.PI * clamp(sigh.t / 1.8, 0, 1)); if (sigh.t > 1.8) sigh = null; }
        const dir = v1.copy(dirSick).lerp(dirHeal, cl).normalize();
        cre.position.copy(dir).multiplyScalar(CDIST);
        cre.position.y += Math.sin(t * 1.3) * 0.006 * M + sg * 0.012 - fl * 0.025 + s.k.bounce.x * 0.012 + Math.sin(Math.PI * cl) * 0.05;
        cre.position.x += s.k.shake.x * 0.012;
        const bs = 1 + Math.sin(t * 1.3) * 0.012 * M + sg * 0.03;
        cre.scale.set(bs * (1 + fl * 0.05), bs * (1 - fl * 0.09) * (1 - relax.x * 0.01), bs * (1 + fl * 0.04));
        cre.rotation.set(lerp(0, 0.08, cl) + fl * 0.06, lerp(0, 0.55, cl) + Math.sin(t * 0.45) * 0.05 * M, Math.sin(t * 0.6) * 0.03 * M + s.k.shake.x * 0.02 + lerp(0, -0.12, cl));
        rig.over({ lid: 0.6, brow: 0.8, smile: -0.85, w: 0.05 }, sg * 0.7 + bleed.env * 0.45 * sick);

        /* the veins spread over the wall from wherever it grows */
        wallU.uAttach.value.copy(cre.position);
        wallU.uSpread.value = lerp(0.62, 0.52, h);
        wallU.uFloor.value = lerp(0.3, 0.22, h);
        wallU.uAmt.value = lerp(1, 0.75, h) * (1 + bleed.env * 0.35);

        /* its roots let go of the opening as it climbs */
        { const kr = 1 - sstep(0, 0.32, cl); cervRoots.scale.setScalar(Math.max(1e-4, kr)); cervRoots.visible = kr > 0.01; }

        G.updateMatrixWorld(true);

        /* arms: claws on the bottom rim, or on the side wall once healed */
        for (const A of arms) {
          const sh = v2.set(A.side * 0.25, -0.08, 0.09).applyMatrix4(cre.matrix);
          A.L.mesh.position.copy(sh);
          const tg = v3.copy(A.sick).lerp(A.healed, cl);
          tg.y += (fl * 0.02);
          const dx = tg.x - sh.x, dz = tg.z - sh.z;
          const b = bendTo(A.L, Math.hypot(dx, dz), tg.y - sh.y, 1.25, 0.45, null);
          A.foot.position.y = b.seg;
          const az = Math.atan2(dx, dz);
          A.L.bones[0].rotation.set(Math.PI / 2 - b.a, az, 0, 'YXZ');
          for (let i = 1; i < A.L.nb; i++) A.L.bones[i].rotation.set(b.c, 0, Math.sin(t * 0.8 + i + A.side) * 0.02 * M);
          A.az = az;
        }
        podG.updateMatrixWorld(true);
        podG.getWorldQuaternion(qa);
        for (const A of arms) {
          qb.slerpQuaternions(A.qSick, A.qHeal, cl).premultiply(qa);
          A.L.bones[A.L.nb - 1].getWorldQuaternion(qc).invert();
          A.foot.quaternion.copy(qc).multiply(qb);
        }

        /* the vine: from its crown, out of the pod, to the bud */
        const base = G.worldToLocal(cre.localToWorld(v1.set(0, BB * 0.86, 0)));
        const straight = sstep(0, 1, clamp(hp, 0, 1.1));
        const tip = v2.set(lerp(0.3, 0.12, straight) + base.x, 2.0, base.z);
        tip.x += Math.sin(t * 0.7) * 0.02 * M + budKick.x * 0.03;
        tip.x = Math.max(tip.x, base.x + 0.04);
        vine.mesh.position.copy(base);
        const dxv = tip.x - base.x, dyv = tip.y - base.y;
        const vb = bendTo(vine, dxv, dyv, lerp(1.07, 1.015, straight), 0.6, vineCap), seg = vb.seg;
        vst.a = vb.a; vst.c = vb.c;
        vine.bones[0].rotation.set(Math.PI / 2 - vst.a, Math.PI / 2, 0, 'YXZ');
        const wig = lerp(0.07, 0.02, straight);
        for (let i = 1; i < VN; i++) vine.bones[i].rotation.set(vst.c + Math.sin(i * 1.3 + 0.5) * wig, 0, Math.sin(t * 0.8 + i * 0.6) * 0.022 * M);
        G.updateMatrixWorld(true);
        for (let i = 0; i < VN; i++) G.worldToLocal(vine.bones[i].getWorldPosition(nodes[i].position));
        G.worldToLocal(vine.bones[VN - 1].localToWorld(nodes[VN].position.set(0, seg, 0)));
        for (const td of tendrils) td.g.rotation.z = td.rotZ + Math.sin(t * 1.2 + td.ph) * 0.12 * M;

        /* the bud: tipped sideways while sick, upright and blooming when healed */
        budG.position.copy(nodes[VN].position);
        const tilt = lerp(-0.78, 0, clamp(hp, 0, 1.08));
        budG.rotation.set(Math.sin(t * 0.5) * 0.04 * M, Math.sin(t * 0.35) * 0.08 * M, tilt + Math.sin(t * 0.9) * 0.04 * M - budKick.x * 0.08);
        baby.scale.setScalar(1.3 * (1 + Math.sin(t * 1.4) * 0.012 * M));
        bloomS.target = sstep(0.82, 1, h);
        const bl = Math.max(0, bloomS.step(dt));
        flower.scale.setScalar(Math.max(1e-4, Math.min(bl, 1.15))); flower.visible = bl > 0.01;
        for (const p of petals) p.p.rotation.x = lerp(p.o0, p.o1, clamp(bl, 0, 1.1));
        for (const sp of sepals) sp.p.rotation.x = lerp(0.42, 1.05, clamp(bl, 0, 1.1)) + Math.sin(t * 1.1 + sp.az) * 0.02 * M;
        flower.rotation.y = Math.sin(t * 0.6) * 0.1 * M;

        /* the sign hangs off a side stalk, swings, and flips when healed */
        const n4 = nodes[4].position, hang = v3.copy(n4).add(v1.set(-0.42, -0.02, 0.3));
        hang.y += Math.sin(t * 0.8) * 0.01 * M;
        const sd = v1.copy(hang).sub(n4), sl = sd.length();
        stalk.position.copy(n4); stalk.quaternion.setFromUnitVectors(UP, sd.normalize()); stalk.scale.set(1, sl, 1);
        signG.position.copy(hang);
        flipS.target = heal.burst || s.healed ? Math.PI : 0; flipS.step(dt);
        swingG.rotation.set(swingX.x * 0.1 + Math.sin(t * 0.7 + 1) * 0.02 * M, flipS.x, swing.x * 0.12 + Math.sin(t * 0.9) * 0.04 * M + s.k.shake.x * 0.03);

        /* drops: form at the opening, fall, splash into the puddle */
        for (const d of drops) {
          if (d.phase === 'form') {
            d.t += dt; const kf = clamp(d.t / 0.16, 0, 1);
            d.m.position.set(d.x, MOUTH.y - 0.012 * kf, d.z);
            d.m.scale.set(0.02 * kf + 1e-4, 0.026 * kf + 1e-4, 0.02 * kf + 1e-4);
            if (d.t > 0.16) { d.phase = 'fall'; d.v = 0; }
          } else if (d.phase === 'fall') {
            d.v -= 9.8 * 0.55 * dt; d.m.position.y += d.v * dt;
            d.m.scale.set(0.017, 0.03, 0.017);
            if (d.m.position.y <= PUD_Y + 0.01) {
              d.phase = 'splat'; d.t = 0; d.m.position.y = PUD_Y + 0.006;
              puddleR = Math.min(0.26, puddleR + 0.012); puddleS.kick(1.6);
              const at = G.localToWorld(v1.set(d.x, PUD_Y + 0.01, d.z));
              for (let i = 0; i < 4; i++) splash.emit(at, { v: new V3(rnd(-0.35, 0.35), rnd(0.4, 0.8), rnd(-0.35, 0.35)), life: rnd(0.25, 0.4), s0: 0.028, s1: 0.012, color: '#d0202c', g: -6, floor: PUD_Y });
            }
          } else if (d.phase === 'splat') {
            d.t += dt; const ks = clamp(d.t / 0.18, 0, 1);
            d.m.scale.set(0.02 * (1 + ks), 0.008 * (1 - ks) + 1e-4, 0.02 * (1 + ks));
            if (ks >= 1) { d.phase = 'idle'; d.m.visible = false; }
          }
        }
        // a bead of sap always hanging at the opening while it is low
        const bk = clamp(sick * 1.2 - cl, 0, 1) * (0.85 + 0.15 * Math.sin(t * 2.1)) + bleed.env * 0.3;
        bead.visible = bk > 0.03;
        bead.position.set(MOUTH.x, MOUTH.y - 0.012 * bk, MOUTH.z);
        bead.scale.set(0.017 * bk + 1e-4, 0.022 * bk + 1e-4, 0.017 * bk + 1e-4);
        // the puddle soaks in slowly, fast once healed
        puddleR = Math.max(0, puddleR - dt * (s.healed || heal.burst ? 0.12 : 0.006 + 0.012 * h));
        puddleS.target = 1; puddleS.step(dt);
        puddle.visible = puddleR > 0.004;
        const pr = puddleR * (1 + (puddleS.x - 1) * 0.08);
        puddle.scale.set(pr * 1.15, 1, pr);

        /* flowers come up where the red was */
        for (const b of bloomFlowers) {
          const kb = sstep(0.88 + b.d * 0.3, 1.0 + b.d * 0.3, h + (s.healed ? 0.3 : 0));
          b.m.scale.setScalar(Math.max(1e-4, kb)); b.m.visible = kb > 0.01;
          b.m.position.y = MOUND(Math.hypot(b.m.position.x, b.m.position.z));
        }
      },
    };
  },
};
