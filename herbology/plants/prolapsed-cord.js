/* 15. Prolapsed Umbilical Cord: the Prolapsed Cord Vine.
   From her slide (refs/p25_0.jpg): a tall pod plant in soft watercolour with
   a thin dark-green ink. A big almond "womb chamber" of two green protective
   leaves (lighter veins, a pale cream edge) cups an opening that shows a deep
   rose-maroon inside, where a pink baby sleeps curled, wrapped in pink petals
   like a bud. Over the pod, an arch of curly tendrils with a leaf sprig on
   top. At the bottom the pod narrows into the "dilated cervix": rose-pink
   petals with darker inner edges and dewdrops, flaring open. From the baby's
   belly a twisted lavender-purple vine, the cord, runs down through those
   petals, hangs out below with little green leaves and a green tendril round
   it, and trails on the soil, where two big purple bell-flowers lie wilted
   with strain marks beside them.
   Symptoms: the petals clamp the vine in waves like contractions; each squeeze
   pinches it thin and turns it bluish, its leaves wilt, the baby's glow dims
   and the baby stirs, the heartbeat light in the pod slows, and the wilted
   bells sink lower. Clear drops fall from the petals: the waters have broken.
   Healed (my addition): the pressure is gone and the baby is safe, so the pod
   rises and its two leaves open like a flower round the sleeping baby with a
   warm golden glow; the vine turns a calm lavender and relaxes, its leaves
   perk up and sprout tiny flowers, the bells lift and bloom fresh, and the
   cervix petals soften open. */

export default {
  id: 'prolapsed-cord',
  look: { ink: '#2f4026', bands: [124, 180, 226, 255], outline: 0.0032, rune: ['#e48aa8', '#f2d27a'], bg: ['#b4b98c', '#6c7a55', '#262e1e'] },
  frame: { halfH: 1.62, halfW: 1.05, lookY: 1.47 },
  careTitle: 'Take the pressure off the vine',
  lines: {
    sick: "Don't squeeze the vine!",
    wrong: ['Too tight! The vine...', 'It squeezes harder!', 'The heartbeat is slowing!'],
    right: ['Ahh... room to breathe.', 'The vine eases.', 'Lift me, gently.'],
    healed: 'Breathing easy.',
  },
  shows: [
    '<b>The purple vine hanging out below the pink cervix petals</b>, ahead of the baby: the cord has slipped through the cervix and can be seen or felt.',
    '<b>The petals clamp the vine in waves</b>, pinching it thin and turning it bluish: contractions or the presenting part compress the cord.',
    '<b>The heartbeat light in the pod slows and dims with each squeeze</b>: sudden fetal bradycardia or variable decelerations.',
    '<b>The baby’s glow fades and it stirs</b> while the vine is pinched: its oxygen supply is being cut off.',
    '<b>Wilted bell-flowers, drooping vine leaves and strain marks</b>: compression risk and a threatened oxygen supply.',
    '<b>Clear drops falling from the petals</b>: the waters have broken; prolapse usually follows rupture of the membranes.',
  ],
  healedNote: 'Healed, the pressure is off the vine: the pod rises and opens like a flower round the safe, sleeping baby with a warm golden glow, the heartbeat light beats steady, the vine turns a calm lavender with tiny flowers, and the wilted bells lift and bloom.',

  build(kit) {
    const { THREE, world, camera, toon, noOutline, canvasTex, sheet, limb, taperTube, tendrilGeo, mergeGeometries, addLeaf, palette, Spring,
      particles, spark, wisp, heartbeat, randDir, rnd, rr, R, M, clamp, lerp, sstep, V3, TAU, UP, tex } = kit;

    const PY0 = 1.07, CW = 0.08, GAP = 0.78, PT = 0.04;   // pod origin height, cervix waist height in the pod, front cut, wall
    const G = new THREE.Group(); world.add(G);

    const P = palette({
      leaf: ['#cdd4bc', '#ffffff'], wall: ['#a07c86', '#ffffff'], rim: ['#c6cea0', '#e2ecbc'],
      cerv: ['#e8c8cc', '#ffffff'], bud: ['#e6ccd4', '#ffffff'], skin: ['#d88e9c', '#eaa2aa'],
      cord: ['#d4c8e6', '#ffffff'], vleaf: ['#6d8a4e', '#79ac57'], bell: ['#b4a2b0', '#ffffff'],
      stem: ['#6a7e48', '#76a252'], tend: ['#69884a', '#76a555'],
    });
    const BLUE = new THREE.Color('#5c62b4'), PINKC = new THREE.Color('#ffd2ea'), DARKLEAF = new THREE.Color('#4c5a3c');

    /* ---------- painted textures ---------- */
    const blots = (x, w, h, n, cols, a0, a1, r0, r1) => {
      for (let i = 0; i < n; i++) {
        const cx = R() * w, cy = R() * h, r = rr(r0, r1), c = cols[Math.floor(R() * cols.length)];
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(${c},${rr(a0, a1)})`); g.addColorStop(1, `rgba(${c},0)`);
        x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      }
    };
    const speck = (x, w, h, n, a = 0.07) => {
      for (let i = 0; i < n; i++) { x.fillStyle = R() < 0.5 ? `rgba(40,40,30,${a})` : `rgba(255,255,240,${a})`; x.fillRect(R() * w, R() * h, rr(1, 2.5), rr(1, 2.5)); }
    };
    // the womb leaves: u = 0 at the opening's edge, v = 0 at the bottom
    const wombTex = canvasTex(256, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#9ab47e'); g.addColorStop(0.5, '#88a66e'); g.addColorStop(1, '#759560');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      blots(x, w, h, 170, ['62,96,52', '196,214,160', '120,150,90'], 0.05, 0.16, 10, 50);
      speck(x, w, h, 2600);
      x.lineCap = 'round';
      for (let k = 0; k < 9; k++) {               // long veins fanning up and out from the bottom
        const u0 = 0.05 + 0.02 * k, u1 = 0.1 + 0.055 * k;
        x.strokeStyle = `rgba(228,238,196,${rr(0.4, 0.6)})`; x.lineWidth = rr(2, 3.4);
        x.beginPath(); x.moveTo(u0 * w, h); x.bezierCurveTo((u0 + 0.02) * w, h * 0.62, u1 * w, h * (0.5 - 0.03 * k), (u1 + 0.07) * w, h * (0.04 + 0.05 * k)); x.stroke();
        x.lineWidth = 1.2; x.strokeStyle = 'rgba(228,238,196,.35)';
        for (let q = 0; q < 3; q++) {
          const yy = h * (0.75 - 0.18 * q - 0.02 * k), xx = (u0 + (u1 - u0) * (0.3 + 0.25 * q)) * w;
          x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + 8, yy - 14, xx + 16, yy - 34); x.stroke();
        }
      }
      const bg = x.createLinearGradient(0, 0, w * 0.075, 0);          // the pale cream edge round the opening
      bg.addColorStop(0, 'rgba(236,238,192,1)'); bg.addColorStop(0.55, 'rgba(222,230,180,.8)'); bg.addColorStop(1, 'rgba(222,230,180,0)');
      x.fillStyle = bg; x.fillRect(0, 0, w * 0.075, h);
      x.strokeStyle = 'rgba(52,72,40,.5)'; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(w * 0.045, h); x.bezierCurveTo(w * 0.042, h * 0.6, w * 0.05, h * 0.3, w * 0.04, 0); x.stroke();
    });
    // the lining: deep rose-maroon, lighter near the cut edge, faint veins
    const wallTex = canvasTex(256, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#c86a7c'); g.addColorStop(0.12, '#b24c62'); g.addColorStop(0.5, '#8e3248'); g.addColorStop(1, '#6e2234');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      blots(x, w, h, 90, ['90,20,40', '220,120,140'], 0.06, 0.16, 10, 40);
      speck(x, w, h, 1200, 0.05);
      x.strokeStyle = 'rgba(70,14,30,.28)'; x.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        let px = R() * w, py = h; x.lineWidth = rr(1.2, 2.6); x.beginPath(); x.moveTo(px, py);
        for (let k = 0; k < 6; k++) { px += rr(-18, 18); py -= rr(20, 50); x.lineTo(px, py); }
        x.stroke();
      }
    });
    // cervix petals: u across a petal, v = 0 at the flared lip
    const cervTex = canvasTex(256, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#a8405a'); g.addColorStop(0.16, '#d4707e'); g.addColorStop(0.5, '#ea96a0'); g.addColorStop(0.84, '#d4707e'); g.addColorStop(1, '#a8405a');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      blots(x, w, h, 60, ['160,50,80', '255,200,205'], 0.06, 0.16, 8, 30);
      x.strokeStyle = 'rgba(255,214,218,.45)'; x.lineWidth = 1.6;
      for (let i = 1; i < 7; i++) { const u = i / 7 * w; x.beginPath(); x.moveTo(u, h); x.quadraticCurveTo(u + rr(-10, 10), h * 0.5, u + rr(-14, 14), 0); x.stroke(); }
      const lip = x.createLinearGradient(0, h, 0, h * 0.84);       // the rolled lip
      lip.addColorStop(0, 'rgba(150,40,64,.9)'); lip.addColorStop(0.25, 'rgba(250,196,200,.95)'); lip.addColorStop(0.55, 'rgba(250,196,200,.4)'); lip.addColorStop(1, 'rgba(250,196,200,0)');
      x.fillStyle = lip; x.fillRect(0, h * 0.84, w, h * 0.16);
      for (let i = 0; i < 22; i++) {                                 // dewdrops
        const px = rr(0.18, 0.82) * w, py = rr(0.15, 0.85) * h, r = rr(2, 4.2);
        x.fillStyle = 'rgba(255,240,242,.9)'; x.strokeStyle = 'rgba(150,50,72,.55)'; x.lineWidth = 1;
        x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); x.stroke();
      }
    });
    // the cord: three twisted strands, glossy lavender; f = sin(2pi(3u - v)) matches the geometry's bulges
    const cordTex = (() => {
      const W = 96, H = 96, c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'), img = x.createImageData(W, H);
      const base = [157, 134, 198], groove = [88, 70, 140], hi = [232, 222, 248];
      for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
        const u = (px + 0.5) / W, v = 1 - (py + 0.5) / H, f = Math.sin(TAU * (3 * u - v));
        const n = (Math.sin(px * 1.7 + py * 0.9) + Math.sin(px * 0.6 - py * 2.3)) * 3;
        let col;
        if (f < 0) col = base.map((b, i) => lerp(b, groove[i], Math.pow(-f, 1.2)));
        else { const k = Math.pow(Math.max(0, (f - 0.45) / 0.55), 1.6); col = base.map((b, i) => lerp(b, hi[i], k)); }
        const o = (py * W + px) * 4; img.data[o] = col[0] + n; img.data[o + 1] = col[1] + n; img.data[o + 2] = col[2] + n; img.data[o + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
      return t;
    })();
    const budTex = canvasTex(128, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, '#e2889e'); g.addColorStop(0.6, '#f0a8b6'); g.addColorStop(1, '#f8c4c8');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      blots(x, w, h, 40, ['200,90,120', '255,220,224'], 0.06, 0.14, 6, 24);
      x.strokeStyle = 'rgba(176,80,108,.45)'; x.lineWidth = 1.5; x.lineCap = 'round';
      for (let i = 0; i < 6; i++) { const u = (0.2 + i * 0.12) * w; x.beginPath(); x.moveTo(w / 2, h); x.quadraticCurveTo(u, h * 0.55, u + (u - w / 2) * 0.3, h * 0.08); x.stroke(); }
    });
    const bellTex = canvasTex(128, 128, (x, w, h) => {
      const g = x.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, '#6e3e74'); g.addColorStop(0.45, '#a46aa8'); g.addColorStop(0.85, '#cc96cc'); g.addColorStop(1, '#e2b8de');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      blots(x, w, h, 40, ['90,40,100', '240,200,240'], 0.06, 0.14, 5, 20);
      x.strokeStyle = 'rgba(84,36,96,.5)'; x.lineWidth = 1.6;
      for (let i = 0; i < 5; i++) { const u = (i + 0.5) / 5 * w; x.beginPath(); x.moveTo(u, h); x.lineTo(u + 2, h * 0.18); x.stroke(); }
      x.strokeStyle = 'rgba(240,210,240,.4)'; x.lineWidth = 1;
      for (let i = 0; i < 10; i++) { const u = (i + 0.25) / 10 * w; x.beginPath(); x.moveTo(u, h * 0.8); x.lineTo(u, h * 0.1); x.stroke(); }
    });
    const glowTex = canvasTex(128, 128, (x, w, h) => {
      const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }, { srgb: false });

    /* ---------- materials ---------- */
    const wombMat = toon('#ffffff', { map: wombTex, thickness: 0.0042 });
    const wallMat = toon('#ffffff', { map: wallTex, thickness: 0, emissive: '#ff8a9a', emissiveIntensity: 0 });
    const rimMat = toon('#c8d0a0', { thickness: 0.003 });
    const tendMat = toon('#69884a', { map: tex.bark, thickness: 0.0026 });
    const leafMat = toon('#6d8a4e', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.0026 });
    const vleafMat = toon('#6d8a4e', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.0024 });
    const cervMat = toon('#ffffff', { map: cervTex, side: THREE.DoubleSide, thickness: 0.003 });
    const budMat = toon('#ffffff', { map: budTex, side: THREE.DoubleSide, thickness: 0.0026, emissive: '#ff9a9a', emissiveIntensity: 0.1 });
    const skinMat = toon('#d88e9c', { thickness: 0.0026, emissive: '#ff8a7a', emissiveIntensity: 0.08 });
    const inkMat = noOutline(new THREE.MeshBasicMaterial({ color: '#4a2a30' }));
    const blushMat = noOutline(new THREE.MeshBasicMaterial({ color: '#f2909e', transparent: true, opacity: 0.7 }));
    const cordMat = toon('#ffffff', { map: cordTex, thickness: 0.003 });
    const bellMat = toon('#ffffff', { map: bellTex, side: THREE.DoubleSide, thickness: 0.003 });
    const stemMat = toon('#6a7e48', { thickness: 0.0024 });
    const soilMat = toon('#76604c', { map: tex.grain, thickness: 0.0026 });
    const fallenMat = toon('#8a9a5c', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.0018 });
    const strainMat = noOutline(new THREE.MeshBasicMaterial({ color: '#7a3a54', transparent: true, opacity: 0.8, depthWrite: false }));
    const petalOut = toon('#f6b2c6', { side: THREE.DoubleSide, thickness: 0.0019, emissive: '#ffb070', emissiveIntensity: 0 });
    const petalIn = toon('#ffe0aa', { side: THREE.DoubleSide, thickness: 0.0016, emissive: '#ffc060', emissiveIntensity: 0 });
    const flowerMat = toon('#ffffff', { vertexColors: true, thickness: 0.0016 });
    const dropMat = toon('#e4f2f6', { thickness: 0.0018, transparent: true, opacity: 0.85 });
    const glowMat = noOutline(new THREE.MeshBasicMaterial({ map: glowTex, color: '#ff9cb0', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));

    const hbLight = new THREE.PointLight('#ff9aa4', 0, 1.8, 1.6);
    const goldLight = new THREE.PointLight('#ffd27a', 0, 2.6, 1.4);
    G.add(hbLight, goldLight);

    /* ---------- helpers ---------- */
    const _bm = new THREE.Matrix4();
    /** Matrix placing a +Y sheet: its axis along dir, its face (+Z) toward out. */
    function place(at, dir, out, s) {
      const Y = dir.clone().normalize(), Z = out.clone().addScaledVector(Y, -out.dot(Y)).normalize(), X = new V3().crossVectors(Y, Z);
      return new THREE.Matrix4().makeBasis(X, Y, Z).scale(new V3(s, s, s)).setPosition(at);
    }
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
    /** One half of a lathed shell (angles ph0..ph1), with its cut faces and its top and bottom rims. */
    function shellHalf(ctrl, T, ph0, ph1, K, rows, flipU) {
      const curve = new THREE.CatmullRomCurve3(ctrl.map(([r, y]) => new V3(r, y, 0)));
      const Pp = curve.getSpacedPoints(rows);
      const N = Pp.map((p, j) => { const a = Pp[Math.max(0, j - 1)], b = Pp[Math.min(rows, j + 1)], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty); return new V3(ty / l, -tx / l, 0); });
      const Qp = Pp.map((p, j) => p.clone().addScaledVector(N[j], -T));
      const ph = (i) => lerp(ph0, ph1, i / K), U = (i) => (flipU ? 1 - i / K : i / K);
      const at = (p, f) => [p.x * Math.sin(f), p.y, p.x * Math.cos(f)];
      const radial = (c) => new V3(c.x, 0, c.z);
      const outer = grid(K, rows, (i, j) => [...at(Pp[j], ph(i)), U(i), j / rows], radial);
      const inner = grid(K, rows, (i, j) => [...at(Qp[j], ph(i)), U(i), j / rows], (c) => radial(c).negate());
      const mid = (j, t) => Pp[j].clone().lerp(Qp[j], t);
      const parts = [
        grid(2, rows, (i, j) => [...at(mid(j, i / 2), ph0), i / 2, j / rows], () => new V3(-Math.cos(ph0), 0, Math.sin(ph0))),
        grid(2, rows, (i, j) => [...at(mid(j, i / 2), ph1), i / 2, j / rows], () => new V3(Math.cos(ph1), 0, -Math.sin(ph1))),
      ];
      const tan = (j0, j1) => Pp[j1].clone().sub(Pp[j0]).normalize();
      const tTop = tan(rows - 1, rows), tBot = tan(1, 0);
      parts.push(grid(K, 2, (i, j) => [...at(mid(rows, j / 2), ph(i)), j / 2, i / K], (c) => { const f = Math.atan2(c.x, c.z); return new V3(tTop.x * Math.sin(f), tTop.y, tTop.x * Math.cos(f)); }));
      parts.push(grid(K, 2, (i, j) => [...at(mid(0, j / 2), ph(i)), j / 2, i / K], (c) => { const f = Math.atan2(c.x, c.z); return new V3(tBot.x * Math.sin(f), tBot.y, tBot.x * Math.cos(f)); }));
      return { outer, inner, rim: mergeGeometries(parts) };
    }
    /** A tube whose vertices are rewritten in place each frame (no new geometry). */
    function dynTube(N, radial, mat, uRep = 1) {
      const cnt = (N + 1) * (radial + 1);
      const pos = new Float32Array(cnt * 3), nor = new Float32Array(cnt * 3), uv = new Float32Array(cnt * 2), idx = [];
      for (let j = 0; j <= N; j++) for (let i = 0; i <= radial; i++) uv[(j * (radial + 1) + i) * 2] = i / radial * uRep;
      for (let j = 0; j < N; j++) for (let i = 0; i < radial; i++) { const a = j * (radial + 1) + i, b = a + 1, c = a + radial + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(idx);
      const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false; mesh.castShadow = true;
      const mk = () => Array.from({ length: N + 1 }, () => new V3());
      return { mesh, g, N, radial, pos, nor, uv, pts: mk(), T: mk(), Nn: mk(), B: mk() };
    }
    const _t = new V3(), _n = new V3(), _ref = new V3();
    function writeTube(T, rad, vt, bulge = 0) {
      const { N, radial, pts, pos, nor, uv } = T;
      for (let j = 0; j <= N; j++) {
        const t = T.T[j].copy(pts[Math.min(N, j + 1)]).sub(pts[Math.max(0, j - 1)]).normalize();
        const n = T.Nn[j];
        if (j === 0) { _ref.set(0, 0, 1); if (Math.abs(t.z) > 0.9) _ref.set(1, 0, 0); n.copy(_ref).addScaledVector(t, -_ref.dot(t)).normalize(); }
        else { n.copy(T.Nn[j - 1]).addScaledVector(t, -T.Nn[j - 1].dot(t)).normalize(); }
        const b = T.B[j].crossVectors(t, n);
        const r = rad(j), v = vt(j), c = pts[j];
        for (let i = 0; i <= radial; i++) {
          const th = (i / radial) * TAU, cs = Math.cos(th), sn = Math.sin(th);
          _n.set(n.x * cs + b.x * sn, n.y * cs + b.y * sn, n.z * cs + b.z * sn);
          const rr2 = bulge ? r * (1 + bulge * Math.sin(TAU * (3 * i / radial - v))) : r;
          const k = j * (radial + 1) + i;
          pos[k * 3] = c.x + _n.x * rr2; pos[k * 3 + 1] = c.y + _n.y * rr2; pos[k * 3 + 2] = c.z + _n.z * rr2;
          nor[k * 3] = _n.x; nor[k * 3 + 1] = _n.y; nor[k * 3 + 2] = _n.z;
          uv[k * 2 + 1] = v;
        }
      }
      T.g.attributes.position.needsUpdate = true; T.g.attributes.normal.needsUpdate = true; T.g.attributes.uv.needsUpdate = true;
    }
    function flowerGeo(s, col) {
      const parts = [], c = new THREE.Color(col), cc = new THREE.Color('#f6d060');
      const paint = (g, cl) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) cl.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
      for (let i = 0; i < 5; i++) parts.push(paint(new THREE.SphereGeometry(0.03, 7, 5).scale(0.62, 0.22, 1).translate(0, 0, 0.03).rotateY((i / 5) * TAU).scale(s, s, s), c));
      parts.push(paint(new THREE.SphereGeometry(0.015, 7, 5).scale(s, s * 0.7, s).translate(0, 0.004 * s, 0), cc));
      return mergeGeometries(parts).rotateX(Math.PI / 2);      // faces +Z
    }
    const LEAFG = (() => {
      const s = sheet({ width: 0.5, cup: 0.14, curl: 0.16, tipPinch: 0.25, point: 0.55, cols: 6, rows: 10 }).translate(0, 0.1, 0);
      const st = new THREE.CylinderGeometry(0.012, 0.016, 0.11, 5).translate(0, 0.055, 0);
      return mergeGeometries([s, st]);
    })();

    /* ---------- the soil patch, fallen leaves ---------- */
    const soil = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 8, 0, TAU, 0, Math.PI / 2).scale(0.62, 0.05, 0.5).translate(0, 0, 0.05), soilMat);
    soil.receiveShadow = true; G.add(soil);
    {
      const fl = [], LF = sheet({ width: 0.45, cup: 0.06, curl: 0.05, point: 0.6, cols: 4, rows: 6 });
      for (const [x, z, a, s] of [[-0.42, 0.22, 0.6, 0.11], [0.36, 0.3, -2.1, 0.1], [0.5, 0.0, 1.4, 0.09], [-0.2, 0.38, 2.5, 0.08], [0.18, 0.4, -0.4, 0.09], [-0.52, -0.05, -1.2, 0.08], [0.05, -0.28, 0.3, 0.08]]) {
        const r2 = (x / 0.62) ** 2 + ((z - 0.05) / 0.5) ** 2, y = 0.05 * Math.sqrt(Math.max(0, 1 - r2)) + 0.006;
        fl.push(LF.clone().rotateX(-Math.PI / 2 + 0.08).rotateY(a).scale(s, s, s).translate(x, y, z));
      }
      G.add(new THREE.Mesh(mergeGeometries(fl), fallenMat));
    }

    /* ---------- the pod: two womb leaves on hinges ---------- */
    const podG = new THREE.Group(); podG.position.y = PY0; G.add(podG);
    const PROF = [[0.19, -0.02], [0.23, 0.07], [0.31, 0.19], [0.41, 0.33], [0.48, 0.49], [0.52, 0.66], [0.51, 0.82], [0.45, 0.98], [0.35, 1.11], [0.22, 1.21], [0.1, 1.27], [0.03, 1.29]];
    const halves = [];
    for (const sd of [1, -1]) {
      const sh = sd > 0 ? shellHalf(PROF, PT, GAP, Math.PI, 26, 40, false) : shellHalf(PROF, PT, Math.PI, TAU - GAP, 26, 40, true);
      const hinge = new THREE.Group(); hinge.position.set(0.1 * sd, 0, 0); podG.add(hinge);
      const inner = new THREE.Group(); inner.position.set(-0.1 * sd, 0, 0); hinge.add(inner);
      const outer = new THREE.Mesh(sh.outer, wombMat); outer.castShadow = true;
      const wall = new THREE.Mesh(sh.inner, wallMat); wall.receiveShadow = true;
      const rim = new THREE.Mesh(sh.rim, rimMat);
      inner.add(outer, wall, rim);
      // the arch tendril, a curl at its shoulder and the curled leaf tip at the top of the opening
      const X = (p) => new V3(p[0] * sd, p[1], p[2]);
      const parts = [
        taperTube([[0.19, 1.15, 0.09], [0.27, 1.27, 0.06], [0.315, 1.4, 0.02], [0.295, 1.52, 0], [0.2, 1.6, 0], [0.09, 1.63, 0], [0.012, 1.59, 0]].map(X), 0.016, 0.009, { segs: 40, radial: 7 }),
        taperTube([[0.075, 1.22, 0.075], [0.055, 1.305, 0.065], [0.02, 1.33, 0.07], [0.004, 1.3, 0.085]].map(X), 0.02, 0.008, { segs: 14, radial: 7 }),
      ];
      const curl = tendrilGeo({ rise: 0.07, r0: 0.06, coils: 1.6, thick: 0.008, dir: sd });
      parts.push(curl.applyMatrix4(new THREE.Matrix4().makeRotationZ(-sd * 0.5).setPosition(0.31 * sd, 1.42, 0.015)));
      const curl2 = tendrilGeo({ rise: 0.05, r0: 0.045, coils: 1.5, thick: 0.007, dir: sd });
      parts.push(curl2.applyMatrix4(new THREE.Matrix4().makeRotationZ(-sd * 1.1).setPosition(0.25 * sd, 1.25, 0.07)));
      const arch = new THREE.Mesh(mergeGeometries(parts), tendMat); arch.castShadow = true; inner.add(arch);
      // the sprig on top: two leaves from each half, so it reads as one sprig when closed
      for (const [d, s] of [[new V3(0.85 * sd, 0.55, 0.12), 0.15], [new V3(0.25 * sd, 1, 0.18), 0.12]]) {
        const L = addLeaf(inner, new V3(0.01 * sd, 1.6, 0.01), d, d.clone().add(new V3(0, -0.5, 0)), s, leafMat, LEAFG);
        L.roll = sd * 0.2;
      }
      halves.push({ sd, hinge });
    }

    /* ---------- the cervix petals ---------- */
    const cervG = new THREE.Group(); cervG.position.y = CW; podG.add(cervG);
    const CPROF = [[0.305, -0.2], [0.287, -0.238], [0.248, -0.226], [0.2, -0.17], [0.15, -0.1], [0.118, -0.03], [0.108, 0.04], [0.125, 0.12], [0.175, 0.2], [0.228, 0.28], [0.255, 0.35], [0.258, 0.38]];
    {
      const curve = new THREE.CatmullRomCurve3(CPROF.map(([r, y]) => new V3(r, y, 0)));
      const rows = 22, cols = 10, Pp = curve.getSpacedPoints(rows);
      const parts = [];
      for (const [a, span, layer, slit] of [[0.86, 0.86, 1, 1], [-0.86, 0.86, 1, -1], [2.3, 0.8, 0.965, 0], [-2.3, 0.8, 0.965, 0]]) {
        const pos = [], uv = [], idx = [];
        for (let j = 0; j <= rows; j++) {
          const v = j / rows, p = Pp[j];
          const hw = span * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * v)), 0.35);
          for (let i = 0; i <= cols; i++) {
            const u = (i / cols) * 2 - 1;
            let f = a + u * hw;
            if (slit && u * slit < 0) f += slit * (0.12 + 0.16 * (1 - sstep(0, 0.45, v))) * (-u * slit) ** 3;   // the front slit, widest at the lip
            const R2 = p.x * layer * (1 + 0.1 * u * u * (1 - v));
            pos.push(R2 * Math.sin(f), p.y + 0.012 * u * u * (1 - v), R2 * Math.cos(f)); uv.push(u * 0.5 + 0.5, v);
          }
        }
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const q = j * (cols + 1) + i; idx.push(q, q + 1, q + cols + 2, q, q + cols + 2, q + cols + 1); }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx); g.computeVertexNormals(); parts.push(g);
      }
      const cm = new THREE.Mesh(mergeGeometries(parts), cervMat); cm.castShadow = true; cervG.add(cm);
    }

    /* ---------- the baby in its petal bud ---------- */
    const babyG = new THREE.Group(); babyG.position.set(-0.03, 0.73, 0.03); podG.add(babyG);
    const babyIn = new THREE.Group(); babyG.add(babyIn);
    {
      const body = new THREE.SphereGeometry(1, 28, 20).scale(0.15, 0.2, 0.125).rotateZ(0.35).translate(-0.06, -0.05, -0.01);
      const SP = sheet({ width: 0.62, cup: 0.3, curl: -0.12, tipPinch: 0.35, point: 0.6, cols: 10, rows: 14 });
      const petals = [
        SP.clone().applyMatrix4(place(new V3(0.02, -0.25, 0.05), new V3(-0.42, 1, 0.22), new V3(0.15, 0, 1), 0.44)),
        SP.clone().applyMatrix4(place(new V3(0.04, -0.24, 0.05), new V3(0.62, 1, 0.3), new V3(0.45, 0, 1), 0.27)),
        SP.clone().applyMatrix4(place(new V3(-0.04, -0.25, -0.03), new V3(-0.15, 1, -0.3), new V3(-0.1, 0, -1), 0.42)),
        SP.clone().applyMatrix4(place(new V3(-0.08, -0.24, 0.0), new V3(-0.75, 1, 0.05), new V3(-1, 0, 0.25), 0.34)),
      ];
      const bud = new THREE.Mesh(mergeGeometries([body, ...petals]), budMat); bud.castShadow = true; babyIn.add(bud);
    }
    const headG = new THREE.Group(); headG.position.set(0.075, 0.15, 0.04); headG.rotation.set(0.32, 0.72, 0.12); babyIn.add(headG);
    {
      const head = mergeGeometries([
        new THREE.SphereGeometry(0.104, 28, 20),
        new THREE.SphereGeometry(0.013, 10, 8).translate(0, -0.016, 0.103),
        new THREE.SphereGeometry(0.024, 12, 10).scale(0.55, 1, 0.85).translate(-0.1, -0.005, -0.012),
      ]);
      headG.add(new THREE.Mesh(head, skinMat));
      const eyes = mergeGeometries([-1, 1].map((s) => new THREE.TorusGeometry(0.019, 0.0034, 4, 12, Math.PI).rotateZ(Math.PI).rotateY(s * 0.36).translate(s * 0.038, 0.014, 0.099)));
      headG.add(new THREE.Mesh(eyes, inkMat));
      const blush = mergeGeometries([-1, 1].map((s) => new THREE.SphereGeometry(0.022, 10, 8).scale(1, 0.6, 0.3).translate(s * 0.058, -0.022, 0.084)));
      headG.add(new THREE.Mesh(blush, blushMat));
    }
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0028, 4, 10, Math.PI).rotateZ(Math.PI), inkMat);
    mouth.position.set(0, -0.046, 0.096); headG.add(mouth);
    const eyesMesh = headG.children[1];

    // the heartbeat light behind the baby (it turns into the golden glow when healed)
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat); glow.position.set(-0.02, 0.76, -0.18); podG.add(glow);

    // the bloom: two rings of petals that open behind the baby like a halo once healed
    const flower = new THREE.Group(); flower.position.set(-0.02, 0.74, -0.2); flower.rotation.x = Math.PI / 2; flower.scale.setScalar(1e-4); podG.add(flower);
    const PETAL = sheet({ width: 0.9, cup: 0.3, curl: 0.2, tipPinch: -0.4, cols: 8, rows: 8, point: 0.35 });
    const bloomPetals = [];
    for (const [n, size, o0, o1, mat, ring] of [[7, 0.36, 0.3, 1.38, petalOut, 0], [7, 0.27, 0.2, 1.18, petalIn, 1]]) {
      for (let i = 0; i < n; i++) {
        const arm = new THREE.Group(); arm.rotation.y = (i + 0.5 * ring) / n * TAU; arm.position.y = ring * 0.03; flower.add(arm);
        const p = new THREE.Mesh(PETAL, mat); p.scale.setScalar(size); p.position.z = 0.1 + ring * 0.01;
        arm.add(p); bloomPetals.push({ p, o0, o1 });
      }
    }

    /* ---------- the cord, the green tendril round it, its leaves ---------- */
    const CN = 96;
    const cord = dynTube(CN, 10, cordMat); G.add(cord.mesh);
    const HN = 70;
    const helix = dynTube(HN, 5, tendMat); G.add(helix.mesh);
    const CP = Array.from({ length: 12 }, () => new V3());
    const cordCurve = new THREE.CatmullRomCurve3(CP, false, 'centripetal');
    const cordLeaves = [];
    for (const [f, side, size] of [[0.1, 1, 0.15], [0.24, -1, 0.17], [0.37, 1, 0.16], [0.5, -1, 0.17], [0.63, 1, 0.15], [0.76, -1, 0.15], [0.9, 1, 0.13]]) {
      const node = new THREE.Group(); G.add(node);
      const L = addLeaf(node, new V3(0, 0, 0), new V3(side, 0.75, 0.4), new V3(side, -0.55, 0.4), size, vleafMat, LEAFG);
      L.roll = side * 0.35;
      const fl = new THREE.Mesh(flowerGeo(1.3, cordLeaves.length % 2 ? '#f8c8dc' : '#fff4f8'), flowerMat);
      fl.position.set(side * 0.03, 0.03, 0.04); fl.scale.setScalar(1e-4); node.add(fl);
      cordLeaves.push({ f, side, node, L, fl });
    }

    /* ---------- the wilted bell-flowers ---------- */
    const BELL = (() => {
      const prof = [[0.0, 0], [0.035, 0.012], [0.068, 0.05], [0.09, 0.11], [0.098, 0.17], [0.106, 0.22], [0.128, 0.265], [0.15, 0.295]].map(([r, y]) => new THREE.Vector2(r, y));
      const g = new THREE.LatheGeometry(prof, 40), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z);
        const k = sstep(0.14, 0.3, y), lobe = 0.5 + 0.5 * Math.cos(5 * a);
        const s = 1 + 0.07 * k * lobe - 0.05 * (1 - lobe) * sstep(0.04, 0.24, y);
        p.setXYZ(i, x * s, y + 0.05 * k * (lobe - 0.55), z * s);
      }
      g.computeVertexNormals();
      return g;
    })();
    const bells = [];
    for (const sd of [-1, 1]) {
      const L = limb({ len: 0.4, r0: 0.019, r1: 0.013, bones: 5, mat: stemMat, radial: 7 });
      L.mesh.position.set(0.06 * sd, 0.03, sd > 0 ? 0.0 : 0.04); G.add(L.mesh);
      const bellG = new THREE.Group(); bellG.position.y = L.seg; bellG.scale.setScalar(1.15); L.bones[4].add(bellG);
      const bell = new THREE.Mesh(BELL, bellMat); bell.castShadow = true; bellG.add(bell);
      const cal = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8).scale(1, 0.8, 1).translate(0, 0.012, 0), stemMat); bellG.add(cal);
      const sl = addLeaf(L.bones[1], new V3(0, 0.02, 0), new V3(-sd * 0.9, 0.7, 0.3), new V3(-sd * 0.9, -0.2, 0.3), 0.13, leafMat, LEAFG);
      sl.roll = -sd * 0.3;
      bells.push({ sd, L, bellG, bell, ph: rr(0, TAU) });
    }
    // leaves at the base
    for (const [x, z, dx, dz, s] of [[-0.16, 0.12, -1, 0.5, 0.2], [0.17, 0.1, 1, 0.45, 0.19], [-0.1, -0.1, -0.6, -0.8, 0.18], [0.12, -0.12, 0.6, -0.8, 0.18], [0.02, -0.16, 0.05, -1, 0.16]]) {
      const L = addLeaf(G, new V3(x, 0.035, z), new V3(dx, 0.75, dz), new V3(dx, 0.05, dz), s, leafMat, LEAFG);
      L.roll = rr(-0.3, 0.3);
    }
    // strain marks: short lines by the wilted bells
    const strain = (() => {
      const segs = [[[-0.5, 0.33], [-0.57, 0.4]], [[-0.4, 0.37], [-0.42, 0.46]], [[-0.29, 0.37], [-0.26, 0.45]],
        [[0.29, 0.38], [0.26, 0.46]], [[0.4, 0.38], [0.43, 0.47]], [[0.51, 0.34], [0.58, 0.41]]];
      const parts = segs.map(([a, b]) => {
        const A = new V3(a[0], a[1], 0.12), B = new V3(b[0], b[1], 0.12), d = B.clone().sub(A), l = d.length();
        return new THREE.CylinderGeometry(0.0055, 0.0055, l, 5).translate(0, l / 2, 0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize())).translate(A.x, A.y, A.z);
      });
      const m = new THREE.Mesh(mergeGeometries(parts), strainMat); G.add(m);
      return m;
    })();

    /* ---------- the waters: clear drops from the petals ---------- */
    const splash = particles(tex.dot, 40);
    const drops = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), dropMat); m.visible = false; G.add(m);
      drops.push({ m, phase: 'idle', t: 0, v: 0 });
    }

    /* ---------- motion state ---------- */
    let con = null, nextCon = 1.6, dip = 0, pink = 0, phase = 0, nextDrop = 1.2, stir = 0;
    const relief = new Spring(60, 7);
    const bloomS = new Spring(90, 8);
    const sqS = new Spring(90, 14);
    const v1 = new V3(), v2 = new V3(), qa = new THREE.Quaternion();
    const toG = (obj, x, y, z, out) => G.worldToLocal(obj.localToWorld(out.set(x, y, z)));
    const baseR = (s) => (s < 0.16 ? lerp(0.026, 0.04, s / 0.16) : s < 0.94 ? 0.043 : lerp(0.043, 0.018, (s - 0.94) / 0.06));
    const babyW = () => babyG.localToWorld(new V3(0.0, 0.0, 0.05));
    function startCon(amp, dur) { con = { t: 0, dur, amp }; }

    return {
      centre: babyW,
      anchor: () => podG.localToWorld(new V3(0.42, 1.2, 0)),
      react(type) {
        const c = babyW();
        if (type === 'wrong') {                     // a hard squeeze and a long, slow dip in the heartbeat
          startCon(1.4, 1.5); dip = 2.0; nextCon = 4.5;
          for (let i = 0; i < 8; i++) spark.emit(c.clone().add(randDir().multiplyScalar(0.15)), { v: randDir().multiplyScalar(0.4), life: 0.5, s0: 0.06, s1: 0, color: '#8a7ae0', drag: 2 });
        } else {                                    // relief: lift the bloom off the vine
          relief.kick(2.6); pink = 1; dip = 0;
          if (con) con.amp *= 0.2;
          nextCon = Math.max(nextCon, 3);
          for (let i = 0; i < 10; i++) { const d = randDir(); spark.emit(c.clone().addScaledVector(d, 0.3), { v: d.multiplyScalar(0.45), life: 0.9, s0: 0.08, s1: 0.02, color: '#ffd6ec', drag: 1.6 }); }
        }
      },
      burst() {
        con = null; dip = 0; pink = 0.6;
        const c = babyW();
        for (let i = 0; i < 46; i++) spark.emit(c.clone().add(randDir().multiplyScalar(0.15)), { v: randDir().multiplyScalar(rnd(0.6, 1.5)), life: rnd(0.9, 1.6), s0: 0.09, s1: 0.01, color: i % 2 ? '#ffd1e6' : '#fff0a8', drag: 1.6 });
        for (let i = 0; i < 10; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.2)), { v: randDir().multiplyScalar(0.6), life: 1.4, s0: 0.2, s1: 0.5, color: '#fff2d0', drag: 1.4, a: 0.35 });
      },
      reset() {
        con = null; dip = 0; pink = 0; nextCon = 1.6; bloomS.set(0); relief.set(0);
        for (const d of drops) { d.phase = 'idle'; d.m.visible = false; }
      },
      update(s) {
        const { t, dt, h, hp, sick, heal } = s;
        const fl = s.k.flinch.x;
        kit.leafFold = clamp(fl, 0, 1) * 0.4;
        relief.step(dt);

        /* contractions: the petals clamp the vine in waves */
        if (!heal.on && !s.healed) {
          nextCon -= dt;
          if (!con && nextCon <= 0 && sick > 0.12) { startCon(sick, lerp(1.3, 1.8, sick)); nextCon = lerp(6, 3.4, sick) + rnd(0, 1); }
        } else con = null;
        let sqRaw = 0;
        if (con) { con.t += dt; const k = clamp(con.t / con.dur, 0, 1); sqRaw = Math.pow(Math.sin(Math.PI * k), 1.4) * con.amp; if (con.t > con.dur) con = null; }
        sqS.target = sqRaw; sqS.step(dt);
        const sq = clamp(sqS.x, 0, 1.5), sq1 = Math.min(1, sq);
        dip = Math.max(0, dip - dt); pink = Math.max(0, pink - dt * 0.6);
        const dipK = sstep(0, 0.5, dip);

        /* the heartbeat light: steady, slowing and dimming with each squeeze */
        bloomS.target = sstep(0.82, 1, h);
        const bl = Math.max(0, bloomS.step(dt)), blC = clamp(bl, 0, 1);
        const rate = lerp(1.55, 0.6, sq1) * lerp(1, 0.55, dipK) * lerp(1, 0.8, blC);
        phase += dt * rate;
        const amp = lerp(1, 0.35, sq1) * lerp(1, 0.55, dipK);
        const beat = heartbeat(phase, 1) * amp * M;
        hbLight.intensity = (0.3 + 1.4 * beat) * (1 - 0.6 * blC) * lerp(0.9, 1, h);
        wallMat.emissiveIntensity = 0.05 + 0.13 * beat * (1 - blC * 0.5) + blC * 0.22;
        glowMat.color.set('#ff9cb0').lerp(PINKC.set('#ffcf7a'), blC);
        glowMat.opacity = lerp(0.12 + 0.34 * beat, 0.4 + 0.06 * beat, blC);
        glow.scale.setScalar(lerp(0.8 + 0.16 * beat, 1.25, blC));
        goldLight.intensity = blC * 0.7 + (heal.on ? heal.glow * 0.4 : 0);

        /* colours */
        P.mix(wombMat, 'leaf', h); P.mix(wallMat, 'wall', h); P.mix(rimMat, 'rim', h); P.mix(cervMat, 'cerv', h);
        P.mix(budMat, 'bud', h); P.mix(skinMat, 'skin', h); P.mix(vleafMat, 'vleaf', h); P.mix(leafMat, 'vleaf', h);
        P.mix(bellMat, 'bell', h); P.mix(stemMat, 'stem', h); P.mix(tendMat, 'tend', h);
        P.mix(cordMat, 'cord', h);
        cordMat.color.lerp(BLUE, clamp(0.08 * sick + 0.75 * sq1 + 0.25 * dipK, 0, 0.92) * (1 - pink));
        cordMat.color.lerp(PINKC.set('#ffd2ea'), pink * 0.55);
        vleafMat.color.lerp(DARKLEAF, sq1 * 0.45);
        const babyGlow = (lerp(0.07, 0.14, h) * (1 - 0.8 * sq1) * (1 - 0.5 * dipK) + blC * 0.03);
        skinMat.emissiveIntensity = babyGlow; budMat.emissiveIntensity = babyGlow * 0.6;
        for (const m of [petalOut, petalIn]) m.emissiveIntensity = blC * 0.12;

        /* the pod: lifted a step with each right card, higher still when healed */
        const breath = Math.sin(t * 1.15) * M;
        const lift = 0.13 * clamp(hp, -0.1, 1.15) + 0.14 * bl + relief.x * 0.05;
        podG.position.set(s.k.shake.x * 0.02 + Math.sin(t * 0.5) * 0.008 * M, PY0 + lift + s.k.bounce.x * 0.03 - fl * 0.02 + breath * 0.004, 0);
        podG.rotation.set(Math.sin(t * 0.43) * 0.012 * M, s.k.spin.x * 0.06, Math.sin(t * 0.6) * 0.016 * M + s.k.shake.x * 0.03);
        podG.scale.set(1 + 0.01 * breath - 0.018 * sq, 1 + 0.006 * breath + 0.01 * sq, 1 + 0.01 * breath - 0.018 * sq);
        const open = 0.36 * clamp(bl, 0, 1.12);
        for (const H of halves) H.hinge.rotation.set(0, H.sd * open * 0.12, -H.sd * open + H.sd * (fl * 0.025 + sq * 0.012));

        /* the cervix: tight while sick, clamping with each contraction, soft and open when healed */
        const cs = Math.max(0.5, lerp(1, 1.08, h) + 0.06 * blC - 0.12 * sick - 0.36 * sq);
        cervG.scale.set(cs, 1 + 0.05 * sq, cs);

        /* the baby: breathing; it stirs while the vine is squeezed */
        stir = lerp(stir, sq1 + dipK * 0.5, 1 - Math.exp(-dt * 6));
        const bb = 1 + Math.sin(t * 1.5) * 0.014 * M;
        babyIn.scale.set(bb, bb, bb);
        babyIn.rotation.set(Math.sin(t * 6.3) * 0.03 * stir * M, Math.sin(t * 4.1) * 0.06 * stir * M, Math.sin(t * 0.7) * 0.02 * M + Math.sin(t * 7.7) * 0.05 * stir * M);
        babyG.position.y = 0.73 + Math.sin(t * 5.2) * 0.008 * stir * M;
        headG.rotation.set(0.32 + Math.sin(t * 5.3) * 0.08 * stir * M, 0.72 + Math.sin(t * 3.7) * 0.18 * stir * M, 0.12);
        const calm = clamp(1 - (0.45 * sick + 1.1 * sq1 + 0.6 * dipK), 0, 1);
        const my = lerp(-1, 1, calm);
        mouth.scale.set(1, Math.abs(my) < 0.3 ? Math.sign(my || 1) * 0.3 : my, 1);
        eyesMesh.scale.set(1, lerp(1, 0.45, 1 - calm), 1);

        G.updateMatrixWorld(true);

        /* the cord: belly, through the cervix, hanging out, trailing on the soil */
        toG(babyG, 0.02, -0.24, 0.04, CP[0]);
        toG(podG, -0.005, CW + 0.33, 0.035, CP[1]);
        toG(cervG, 0, 0.03, 0, CP[2]);
        toG(cervG, 0, -0.27, 0.01, CP[3]);
        const top = CP[3].y, Hh = top - 0.05, slack = lerp(1, 0.45, clamp(Math.max(hp, bl), 0, 1)), sw = Math.sin(t * 0.8) * 0.012 * M;
        CP[4].set(CP[3].x + 0.015, top - 0.12, 0.03);
        CP[5].set(0.075 * slack + sw, top - 0.32 * Hh, 0.05);
        CP[6].set(-0.065 * slack - sw, top - 0.56 * Hh, 0.07);
        CP[7].set(0.05 * slack + sw * 0.5, top - 0.8 * Hh, 0.08);
        CP[8].set(0.0, 0.05, 0.12);
        CP[9].set(-0.1, 0.045, 0.21);
        CP[10].set(-0.2, 0.04, 0.22);
        CP[11].set(-0.25, 0.035, 0.15);
        cordCurve.updateArcLengths();
        const len = cordCurve.getLength();
        let jW = 0, jL = 0, jG = 0, dW = 1e9, dL = 1e9, dG = 1e9;
        for (let j = 0; j <= CN; j++) {
          const p = cordCurve.getPointAt(j / CN, cord.pts[j]);
          const a = p.distanceToSquared(CP[2]), b = p.distanceToSquared(CP[3]), c = p.distanceToSquared(CP[8]);
          if (a < dW) { dW = a; jW = j; } if (b < dL) { dL = b; jL = j; } if (c < dG) { dG = c; jG = j; }
        }
        const pinch = clamp(0.12 * sick + 0.5 * sq, 0, 0.62);
        const radAt = (j) => baseR(j / CN) * (1 - pinch * Math.exp(-(((j - jW) / 4.2) ** 2))) * (1 + 0.04 * Math.sin(t * 1.6 - j * 0.2) * h * M);
        writeTube(cord, radAt, (j) => (j / CN) * len / 0.22, 0.12);

        // the green tendril winding round the hanging cord
        const j0 = Math.max(0, jL - 3), j1 = Math.max(j0 + 4, jG);
        for (let k = 0; k <= HN; k++) {
          const jf = lerp(j0, j1, k / HN), ja = Math.floor(jf), jb = Math.min(CN, ja + 1), u = jf - ja;
          const ang = (k / HN) * 5.2 * TAU, r = radAt(ja) + 0.007;
          v1.copy(cord.Nn[ja]).lerp(cord.Nn[jb], u).multiplyScalar(Math.cos(ang) * r);
          v2.copy(cord.B[ja]).lerp(cord.B[jb], u).multiplyScalar(Math.sin(ang) * r);
          helix.pts[k].copy(cord.pts[ja]).lerp(cord.pts[jb], u).add(v1).add(v2);
        }
        writeTube(helix, (k) => 0.0075 * (k < 3 ? 0.4 + 0.2 * k : k > HN - 3 ? 0.4 + 0.2 * (HN - k) : 1), (k) => k * 0.1);

        // its leaves: wilting with every squeeze, perking up and flowering when healed
        for (const c of cordLeaves) {
          const j = Math.round(lerp(jL + 2, jG - 1, c.f));
          c.node.position.copy(cord.pts[j]).add(v1.set(c.side * baseR(j / CN) * 0.9, 0, 0.012));
          c.L.droop = sick * 0.15 + sq1 * 0.6 + dipK * 0.2;
          c.L.flutter = 1 + stir * 2;
          const kf = sstep(0.1 + c.f * 0.3, 0.6 + c.f * 0.3, bl);
          c.fl.scale.setScalar(Math.max(1e-4, kf)); c.fl.visible = kf > 0.01;
        }

        /* the bell-flowers: wilted to the ground, sinking with each squeeze; lifted and blooming once healed */
        const bLift = clamp(0.3 * clamp(hp, 0, 1.1) + 0.75 * bl, 0, 1.08);
        const sickA = [0.0, 0.18, 0.42, 0.52, 0.52], healA = [0.24, 0.1, 0.08, 0.06, 0.05];
        for (const B of bells) {
          const sway = Math.sin(t * 0.9 + B.ph) * 0.02 * M;
          for (let i = 0; i < 5; i++) {
            const a = lerp(sickA[i], healA[i], bLift) + (i ? (sq1 * 0.03 + dipK * 0.02) * sick : 0) + sway;
            B.L.bones[i].rotation.set(i === 0 ? 0.18 : 0, 0, -B.sd * a);
          }
          B.bellG.rotation.set(0, 0, -B.sd * lerp(0.5, 0.12, bLift));
          const op = lerp(0.92, 1.22, bLift);
          B.bell.scale.set(op, lerp(0.92, 1.04, bLift) * (1 - 0.03 * sq1), op);
          B.bell.rotation.y = Math.sin(t * 0.7 + B.ph) * 0.1 * M;
        }

        // strain marks pulse with the squeeze and fade as it eases
        strainMat.opacity = clamp(sick * (0.45 + 0.5 * sq1 + 0.3 * dipK), 0, 0.9);
        strain.visible = strainMat.opacity > 0.02;
        strain.position.set(Math.sin(t * 40) * 0.004 * sq1 * M, Math.cos(t * 37) * 0.003 * sq1 * M, 0);

        /* the waters: a clear drop now and then from the petals' lip */
        if (!heal.on && !s.healed && sick > 0.2) {
          nextDrop -= dt;
          if (nextDrop <= 0) {
            const d = drops.find((q) => q.phase === 'idle');
            if (d) { d.phase = 'form'; d.t = 0; d.a = rr(-1.2, 1.2); d.m.visible = true; }
            nextDrop = lerp(4.5, 2.2, sick) + rnd(0, 1);
          }
        }
        for (const d of drops) {
          if (d.phase === 'form') {
            d.t += dt; const k = clamp(d.t / 0.5, 0, 1);
            toG(cervG, Math.sin(d.a) * 0.22, -0.245, Math.cos(d.a) * 0.22, d.m.position);
            d.m.position.y -= 0.012 * k;
            d.m.scale.set(0.014 * k + 1e-4, 0.018 * k + 1e-4, 0.014 * k + 1e-4);
            if (d.t > 0.5) { d.phase = 'fall'; d.v = 0; }
          } else if (d.phase === 'fall') {
            d.v -= 9.8 * 0.5 * dt; d.m.position.y += d.v * dt; d.m.scale.set(0.012, 0.022, 0.012);
            if (d.m.position.y < 0.05) {
              d.phase = 'idle'; d.m.visible = false;
              const at = G.localToWorld(v1.copy(d.m.position).setY(0.05));
              for (let i = 0; i < 5; i++) splash.emit(at, { v: new V3(rnd(-0.3, 0.3), rnd(0.35, 0.7), rnd(-0.3, 0.3)), life: rnd(0.25, 0.4), s0: 0.022, s1: 0.01, color: '#e8f6fa', g: -6, floor: at.y });
            }
          }
        }

        /* the bloom halo round the baby */
        flower.scale.setScalar(Math.max(1e-4, Math.min(bl, 1.15))); flower.visible = bl > 0.01;
        for (const p of bloomPetals) p.p.rotation.x = lerp(p.o0, p.o1, clamp(bl, 0, 1.1));
        flower.rotation.z = Math.sin(t * 0.5) * 0.05 * M;

        /* the heartbeat glow faces the camera; the lights sit in the pod */
        podG.getWorldQuaternion(qa).invert();
        glow.quaternion.copy(qa).multiply(camera.quaternion);
        toG(podG, 0, 0.75, -0.22, hbLight.position);
        toG(podG, 0, 1.1, 0.55, goldLight.position);
      },
    };
  },
};
