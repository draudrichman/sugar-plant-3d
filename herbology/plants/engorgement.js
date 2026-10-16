/* 12. Breast Engorgement: the Overflowing Carton.
   From her slide (refs/p26_0.jpg, "ENGORGEMENT"): a gable-top milk carton,
   white with big blue cow spots, "MILK" in bold blue letters and a cute face
   (two black oval eyes with shines, a small smile), a two-leaf sprout at its
   foot, standing on a big chocolate-chip cookie in a spreading puddle of milk.
   Thick glossy milk overflows from the open top and pours down every side; a
   bouquet of chocolate-chip and swirl cookies on thin green stems bursts out
   of the top. Sky blue with swirly white clouds, green grass, thick ink.
   Symptoms: the carton bulges tight and shiny and creaks (swollen, firm, tight
   skin), winces when the overflow surges (tender), its pour spout is squashed
   flat so the milk gushes everywhere else (flattened nipple, poor latch), and
   it overflows evenly on both sides (bilateral).
   Healed (my addition): the carton relaxes into a neat box, the spout opens
   and pours a tidy stream into a cup, the puddle dries, the cookies bloom into
   cookie-centred flowers and the sprout grows and flowers. */

const INK = '#161616';

export default {
  id: 'engorgement',
  look: { ink: INK, bands: [124, 190, 236, 255], outline: 0.0058, rune: ['#a6dcff', '#ffe28a'], bg: ['#e6f7fc', '#b4e2f2', '#80c6e2'] },
  frame: { halfH: 1.22, halfW: 1.45, lookY: 1.04 },
  careTitle: 'Ease the carton',
  lines: {
    sick: 'Too full to flow!',
    wrong: ['Too full! It all gushes out!', 'Ow! Tighter still!', "I'm bursting!"],
    right: ['Ahh, it flows!', 'Easier now.'],
    healed: 'Flowing just right!',
  },
  shows: [
    '<b>A carton bulging tight</b>, its sides rounded and stretched with a shiny sheen, creaking under the strain: swollen, firm breasts with tight, shiny skin.',
    '<b>A wince every time the overflow surges</b>: the fullness is tender and painful.',
    '<b>A pour spout squashed flat</b> that only dribbles, so the milk cannot come out where it should: flattened nipples and difficulty with the baby\'s latch.',
    '<b>Milk gushing over every side at once</b>, evenly left and right: usually bilateral fullness.',
    '<b>A spreading puddle and cookies bursting out of the top</b>: more milk, fluid and congestion than the carton can hold.',
  ],
  healedNote: 'Healed, the carton relaxes back into a neat box, the spout opens and pours a tidy stream into a cup, the puddle dries up, and the cookies bloom into cookie-centred flowers: milk that is removed regularly flows just right.',

  build(kit) {
    const { THREE, world, scene, lights, toon, noOutline, canvasTex, sheet, taperTube, addLeaf, face, palette, Spring,
      particles, rnd, M, REDUCE, clamp, lerp, sstep, V3, TAU, DEG, mergeGeometries } = kit;

    /* ---------- her light: clear daylight ---------- */
    lights.hemi.color.set('#ffffff'); lights.hemi.groundColor.set('#7f9a6e'); lights.hemi.intensity = 1.3;
    lights.key.color.set('#fff6e6'); lights.rim.color.set('#e4f6ff'); lights.rim.intensity = 1.0;
    lights.heal.color.set('#fff2c8');

    const P = palette({
      carton: ['#fbeeee', '#f7fafd'], milk: ['#f5ebd2', '#fffbf2'], grass: ['#93b968', '#79c658'],
      stem: ['#7d9c4e', '#52ad47'], leaf: ['#7aa24a', '#5bbb4c'],
    });
    const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    /* ---------- dimensions ---------- */
    const W = 0.36, D = 0.33, Y0 = 0.16, Y1 = 1.06, YM = (Y0 + Y1) / 2, HH = (Y1 - Y0) / 2;
    const BUL = 0.12;            // how far the sides bow out at full engorgement
    const FL = 0.27;             // roof flap length

    /* ---------- painted textures ---------- */
    function blob(x, cx, cy, r, rg, fill = '#3a8fd6', lw = 3) {
      const n = 9, pts = [];
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rg() * 0.35, q = r * (0.72 + rg() * 0.45); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); }
      const mid = (i) => { const a = pts[(i + n) % n], b = pts[(i + 1 + n) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
      x.beginPath(); const m0 = mid(-1); x.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) { const m = mid(i); x.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
      x.closePath(); x.fillStyle = fill; x.fill(); x.lineWidth = lw; x.strokeStyle = INK; x.stroke();
    }
    const AW = 256, AH = 384;
    const SPOTS = [
      [[6, 14, 48], [250, 22, 54], [10, 236, 36], [64, 356, 60], [236, 318, 64]],      // front: corners, the middle stays clear
      [[64, 64, 52], [204, 176, 60], [72, 300, 62], [232, 376, 42]],                    // right
      [[40, 52, 48], [192, 112, 58], [110, 254, 62], [242, 334, 50], [18, 372, 38]],    // back
      [[196, 44, 56], [62, 172, 58], [192, 302, 66], [30, 374, 42]],                    // left
    ];
    const atlas = canvasTex(AW * 4, AH, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      const rg = seeded(7);
      SPOTS.forEach((list, f) => {
        x.save(); x.beginPath(); x.rect(f * AW, 0, AW, AH); x.clip();
        for (const [cx, cy, r] of list) blob(x, f * AW + cx, cy, r, rg);
        x.restore();
      });
      x.save();
      x.font = '900 76px "Arial Black", "Arial Rounded MT Bold", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const sc = Math.min(1, 200 / x.measureText('MILK').width);
      x.translate(AW / 2, 66); x.scale(sc, 1);
      x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = INK; x.strokeText('MILK', 0, 0);
      x.fillStyle = '#2e88d4'; x.fillText('MILK', 0, 0);
      x.restore();
      x.fillStyle = INK;                                            // ink on the box edges
      for (let f = 0; f <= 4; f++) x.fillRect(f * AW - 3, 0, 6, AH);
      x.fillRect(0, 0, w, 5); x.fillRect(0, h - 4, w, 4);
    });
    const flapTex = canvasTex(256, 112, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      const rg = seeded(3); blob(x, 206, 44, 34, rg); blob(x, 34, 90, 26, rg);
      x.fillStyle = INK; x.fillRect(0, 0, w, 5); x.fillRect(0, h - 5, w, 5); x.fillRect(0, 0, 5, h); x.fillRect(w - 5, 0, 5, h);
    });
    const shineTex = canvasTex(64, 256, (x) => {
      x.lineCap = 'round';
      const path = () => { x.beginPath(); x.moveTo(34, 28); x.quadraticCurveTo(24, 128, 34, 228); };
      path(); x.strokeStyle = '#9ccbea'; x.lineWidth = 24; x.stroke();
      path(); x.strokeStyle = '#ffffff'; x.lineWidth = 16; x.stroke();
    });
    const stressTex = canvasTex(256, 384, (x) => {     // cartoon strain marks at the corners and edges
      x.strokeStyle = INK; x.lineCap = 'round'; x.lineWidth = 6;
      const arcs = (cx, cy, ang, n = 3) => {
        for (let i = 0; i < n; i++) {
          const a = ang + (i - (n - 1) / 2) * 0.42, r0 = 16, r1 = 34 + (i % 2) * 6;
          x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); x.stroke();
        }
      };
      arcs(16, 30, Math.PI * 0.25); arcs(240, 30, Math.PI * 0.75);
      arcs(16, 356, -Math.PI * 0.25); arcs(240, 356, -Math.PI * 0.75);
      for (const [cx, s] of [[22, 1], [234, -1]]) {
        x.beginPath(); x.arc(cx - s * 26, 210, 34, -0.5, 0.5, false); if (s < 0) { x.beginPath(); x.arc(cx + 26, 210, 34, Math.PI - 0.5, Math.PI + 0.5, false); } x.stroke();
      }
    });
    function cookieTex(kind) {
      return canvasTex(512, 256, (x) => {
        x.fillStyle = '#b07440'; x.fillRect(256, 0, 256, 256);                 // right half: the rim colour
        const g = x.createRadialGradient(128, 128, 8, 128, 128, 124);
        g.addColorStop(0, '#b87a46'); g.addColorStop(0.75, '#a86b3c'); g.addColorStop(1, '#93572e');
        x.fillStyle = g; x.fillRect(0, 0, 256, 256);
        const rg = seeded(kind === 'base' ? 41 : kind === 'swirl' ? 23 : 17);
        for (let i = 0; i < 90; i++) {                                           // baked speckle
          x.fillStyle = rg() < 0.5 ? 'rgba(80,40,20,.25)' : 'rgba(255,220,170,.22)';
          const a = rg() * TAU, r = Math.sqrt(rg()) * 110; x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 1.5 + rg() * 2, 0, TAU); x.fill();
        }
        if (kind === 'swirl') {
          const path = () => { x.beginPath(); for (let th = 0.5; th <= 3.1 * Math.PI; th += 0.08) { const r = 6 + 10.2 * th; const px = 128 + Math.cos(th) * r, py = 128 + Math.sin(th) * r; th === 0.5 ? x.moveTo(px, py) : x.lineTo(px, py); } };
          x.lineCap = 'round'; x.lineJoin = 'round';
          path(); x.strokeStyle = INK; x.lineWidth = 30; x.stroke();
          path(); x.strokeStyle = '#f6eed8'; x.lineWidth = 21; x.stroke();
        } else {
          const n = kind === 'base' ? 30 : 9, rMax = kind === 'base' ? 104 : 88, size = kind === 'base' ? 9 : 17;
          for (let i = 0; i < n; i++) {
            const a = rg() * TAU, r = Math.sqrt(rg()) * rMax;
            blob(x, 128 + Math.cos(a) * r, 128 + Math.sin(a) * r, size * (0.75 + rg() * 0.5), rg, '#4a2716', kind === 'base' ? 2.5 : 3.5);
          }
        }
        x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.arc(128, 128, 118, 0, TAU); x.stroke();
      });
    }
    const flowTex = canvasTex(256, 64, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      const rg = seeded(11);
      for (let i = 0; i < 30; i++) {
        const cx = rg() * w, cy = rg() * h, L = 16 + rg() * 40, T = 2 + rg() * 4;
        x.fillStyle = rg() < 0.6 ? 'rgba(222,206,170,0.6)' : '#ffffff';
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.beginPath(); x.ellipse(cx + ox, cy + oy, L, T, 0, 0, TAU); x.fill(); }
      }
      x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(0, h * 0.22, w, h * 0.08);    // a glossy streak along the stream
    }, { repeat: true });
    flowTex.repeat.set(3, 1);
    const dropTex = canvasTex(64, 64, (x) => {
      x.fillStyle = INK; x.beginPath(); x.arc(32, 32, 30, 0, TAU); x.fill();
      x.fillStyle = '#ffffff'; x.beginPath(); x.arc(32, 32, 23, 0, TAU); x.fill();
    }, { srgb: false });

    /* ---------- materials ---------- */
    const bodyMat = toon('#ffffff', { map: atlas, side: THREE.DoubleSide });
    const flapMat = toon('#ffffff', { map: flapTex });
    const gableMat = toon('#ffffff', { side: THREE.DoubleSide });
    const lipMat = toon('#ffffff', { thickness: 0.004 });
    const throatMat = noOutline(new THREE.MeshBasicMaterial({ color: '#5a3a3a', side: THREE.DoubleSide }));
    const streamMat = toon('#fbf5e4', { map: flowTex, emissive: '#2c2a22' });
    const milkMat = toon('#fbf5e4', { emissive: '#2c2a22' });
    const chipMat = toon('#ffffff', { map: cookieTex('chip') });
    const swirlMat = toon('#ffffff', { map: cookieTex('swirl') });
    const baseMat = toon('#ffffff', { map: cookieTex('base') });
    const stemMat = toon('#7d9c4e', { thickness: 0.0035 });
    const leafMat = toon('#7aa24a', { side: THREE.DoubleSide, thickness: 0.004 });
    const petalMat = toon('#fffdf6', { thickness: 0.004 });
    const yolkMat = toon('#ffd34a', { thickness: 0.003 });
    const grassMat = toon('#93b968', { side: THREE.DoubleSide, thickness: 0.004 });
    const tuftMat = toon('#6fa04a', { thickness: 0.0025 });
    const cupMat = toon('#ffffff', { map: canvasTex(256, 96, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      const rg = seeded(5); for (const [cx, cy, r] of [[30, 50, 22], [110, 30, 20], [180, 62, 24], [240, 26, 16]]) blob(x, cx, cy, r, rg);
    }) });
    const decalBase = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 };
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ map: shineTex, ...decalBase }));
    const stressMat = noOutline(new THREE.MeshBasicMaterial({ map: stressTex, ...decalBase, opacity: 0 }));

    /* ---------- the stage: grass, clouds ---------- */
    const grass = new THREE.Mesh(new THREE.LatheGeometry([[0, -0.012], [1.6, -0.02], [2.6, -0.07], [3.1, -0.16], [3.25, -0.32]].map(([r, y]) => new THREE.Vector2(r, y)), 72), grassMat);
    world.add(grass);
    {
      const rg = seeded(29), parts = [];
      for (let i = 0; i < 26; i++) {
        const a = rg() * TAU, r = 1.4 + rg() * 1.4, cx = Math.cos(a) * r, cz = Math.sin(a) * r, y = -0.012 - 0.04 * sstep(1.6, 3.0, r);
        for (let j = 0; j < 3; j++) {
          const hgt = 0.07 + rg() * 0.06;
          parts.push(new THREE.ConeGeometry(0.018, hgt, 5).translate(0, hgt / 2, 0).rotateZ((j - 1) * 0.45).translate(cx + (j - 1) * 0.02, y, cz));
        }
      }
      world.add(new THREE.Mesh(mergeGeometries(parts), tuftMat));
    }
    const cloudTex = canvasTex(1024, 512, (x, w, h) => {
      const rg = seeded(19);
      const puffs = [[60, 360, 0.55], [230, 380, 0.42], [400, 352, 0.6], [600, 384, 0.45], [780, 356, 0.62], [960, 378, 0.5]];
      x.fillStyle = '#ffffff';
      x.fillRect(0, 396, w, h - 396);
      for (const [cx, cy, s] of puffs) for (const [dx, dy, r] of [[-110, 30, 64], [-40, -24, 86], [52, -6, 78], [124, 34, 58], [6, 44, 80]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, TAU); x.fill(); }
      x.strokeStyle = '#a8d8ea'; x.lineCap = 'round'; x.lineWidth = 5;
      for (const [cx, cy, s] of puffs) for (const [dx, dy, r] of [[-40, -24, 50], [100, 30, 30]]) {
        x.beginPath(); for (let th = 0; th <= 3.2 * Math.PI; th += 0.1) { const q = (th / (3.2 * Math.PI)) * r * s; const px = cx + dx * s + Math.cos(th) * q, py = cy + dy * s + Math.sin(th) * q; th ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
      }
      x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 9;            // the little white swooshes in her sky
      for (let i = 0; i < 9; i++) { const sx = rg() * w, sy = 40 + rg() * 180; x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + 20, sy - 12, sx + 46, sy - 8); x.stroke(); }
    });
    const clouds = new THREE.Mesh(new THREE.PlaneGeometry(17, 8.5), noOutline(new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false })));
    clouds.position.set(0, 1.3, -5.6); clouds.renderOrder = -1;
    scene.add(clouds);

    /* ---------- the milk puddle ---------- */
    const puddle = (() => {
      const pts = [];
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU, r = 1.02 + 0.1 * Math.sin(3 * a + 1) + 0.07 * Math.sin(5 * a + 2) + 0.045 * Math.sin(9 * a + 0.5);
        pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r * 0.92));
      }
      const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.014, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.03, bevelSegments: 2 });
      g.rotateX(-Math.PI / 2).translate(0, 0.012, 0);
      const rg = seeded(31), drops = [];
      for (let i = 0; i < 12; i++) { const a = rg() * TAU, r = 1.22 + rg() * 0.3, s = 0.025 + rg() * 0.035; drops.push(new THREE.SphereGeometry(s, 12, 6).scale(1.4, 0.35, 1).translate(Math.cos(a) * r, 0.012, Math.sin(a) * r * 0.92).toNonIndexed()); }
      for (const d of drops) { d.deleteAttribute('uv'); }
      g.deleteAttribute('uv');
      return new THREE.Mesh(mergeGeometries([g, ...drops]), milkMat);
    })();
    world.add(puddle);

    /* ---------- the cookie base ---------- */
    function remapCookieUV(g, R) {     // caps take the left half of the cookie texture, rims the plain right half
      const uv = g.attributes.uv;
      const caps = g.groups.find((q) => q.materialIndex === 0);
      for (let i = 0; i < uv.count; i++) {
        const inCap = caps && i >= caps.start && i < caps.start + caps.count;
        if (inCap) uv.setXY(i, ((uv.getX(i) / R) * 0.5 + 0.5) * 0.5, (uv.getY(i) / R) * 0.5 + 0.5);
        else uv.setXY(i, 0.75, 0.5);
      }
      g.clearGroups();
      return g;
    }
    const baseCookie = (() => {
      const pts = [];
      for (let i = 0; i < 56; i++) { const a = (i / 56) * TAU, r = 0.64 * (1 + 0.022 * Math.sin(7 * a) + 0.014 * Math.sin(13 * a + 1)); pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)); }
      const g = remapCookieUV(new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.04, bevelSegments: 2 }), 0.62);
      g.rotateX(-Math.PI / 2).translate(0, 0.06, 0);
      const m = new THREE.Mesh(g, baseMat); m.castShadow = true; m.receiveShadow = true;
      return m;
    })();
    world.add(baseCookie);

    /* ---------- the carton ---------- */
    const YAW = -0.32;            // turned a little, as she drew it, so the spout side shows
    const yawG = new THREE.Group(); yawG.rotation.y = YAW; world.add(yawG);
    const cartPivot = new THREE.Group(); cartPivot.position.y = Y0; world.add(cartPivot);
    const cart = new THREE.Group(); cart.position.y = -Y0; cartPivot.add(cart);

    // its four sides, with a morph target that bows them out (the engorgement)
    const FACES = [
      { n: new V3(0, 0, 1), p: (u, v) => new V3(u * W, YM + v * HH, D) },
      { n: new V3(1, 0, 0), p: (u, v) => new V3(W, YM + v * HH, -u * D) },
      { n: new V3(0, 0, -1), p: (u, v) => new V3(-u * W, YM + v * HH, -D) },
      { n: new V3(-1, 0, 0), p: (u, v) => new V3(-W, YM + v * HH, u * D) },
    ];
    const bulgeOf = (p, out) => {
      const v = clamp((p.y - YM) / HH, -1, 1), f = 1 - v * v;
      const ax = clamp(p.x / W, -1, 1), az = clamp(p.z / D, -1, 1);
      return out.set(BUL * f * ax * (0.25 + 0.75 * (1 - az * az)), 0, BUL * f * az * (0.25 + 0.75 * (1 - ax * ax)));
    };
    function patch(fi, u0, u1, v0, v1, nu, nv, lift, uvf) {
      const F = FACES[fi], pos = [], pos2 = [], uv = [], idx = [], b = new V3();
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
        const iu = i / nu, jv = j / nv, p = F.p(lerp(u0, u1, iu), lerp(v0, v1, jv));
        bulgeOf(p, b); p.addScaledVector(F.n, lift);
        pos.push(p.x, p.y, p.z); pos2.push(p.x + b.x, p.y, p.z + b.z);
        uv.push(...uvf(iu, jv));
      }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, c = a + nu + 1; idx.push(a, a + 1, c + 1, a, c + 1, c); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      const g2 = new THREE.BufferGeometry();
      g2.setAttribute('position', new THREE.Float32BufferAttribute(pos2, 3)); g2.setIndex(idx); g2.computeVertexNormals();
      g.morphAttributes.position = [g2.attributes.position];
      g.morphAttributes.normal = [g2.attributes.normal];
      return g;
    }
    const body = new THREE.Mesh(mergeGeometries([0, 1, 2, 3].map((fi) => patch(fi, -1, 1, -1, 1, 12, 18, 0, (iu, jv) => [(fi + iu) / 4, jv]))), bodyMat);
    body.castShadow = true; cart.add(body);
    const shine = new THREE.Mesh(mergeGeometries([
      patch(0, -0.88, -0.68, -0.45, 0.42, 3, 10, 0.004, (iu, jv) => [iu, jv]),
      patch(0, -0.88, -0.7, 0.54, 0.68, 2, 3, 0.004, (iu, jv) => [iu, 0.4 + jv * 0.2]),
      patch(1, -0.74, -0.54, -0.5, 0.42, 3, 10, 0.004, (iu, jv) => [iu, jv]),
      patch(3, 0.56, 0.76, -0.5, 0.42, 3, 10, 0.004, (iu, jv) => [iu, jv]),
      patch(2, -0.76, -0.56, -0.5, 0.42, 3, 10, 0.004, (iu, jv) => [iu, jv]),
    ]), shineMat);
    cart.add(shine);
    const stress = new THREE.Mesh(mergeGeometries([0, 1, 3].map((fi) => patch(fi, -1, 1, -1, 1, 10, 14, 0.005, (iu, jv) => [iu, jv]))), stressMat);
    cart.add(stress);

    // the face, on the front
    const FY = Y1 - (Y1 - Y0) * 0.375, FC = 0.06, vF = (FY - YM) / HH;
    const faceG = new THREE.Group(); faceG.position.set(0, FY, D); cart.add(faceG);
    const rig = face(faceG, {
      a: 1.1, b: 1.1, c: FC,
      eyes: { x: 0.105, y: 0.03, r: 0.05, iris: '#141414', white: '#141414', lid: '#f7f2f2', pupil: false, shine: true },
      brows: { y: 0.1, len: 0.04, r: 0.008, color: INK },
      mouth: { y: -0.07, inside: '#a0404e', lip: INK },
      sickE: { lid: 0.86, low: 0.12, brow: 0.35, browY: 0, smile: -0.2, open: 0.04, w: 0.07 },
      wellE: { lid: 1, low: 0.3, brow: -0.05, browY: 0.012, smile: 1.15, open: 0.42, w: 0.13 },
      wrongE: { lid: 0.3, low: 0.7, brow: 0.95, browY: -0.005, smile: -1, open: 0.3, w: 0.1 },
      rightE: { lid: 1, low: 0.6, brow: 0.05, browY: 0.02, smile: 1.1, open: 0.45, w: 0.12 },
    });
    for (const e of rig.eyes) e.upper.parent.scale.set(0.82, 1.28, 0.8);       // black ovals, as she drew them
    const winceE = { lid: 0.22, low: 0.75, brow: 0.9, smile: -0.9, open: 0.14, w: 0.09 };

    // the gable top: two roof flaps on hinges and the side walls between them
    const FLAP = new THREE.BoxGeometry(2 * W + 0.006, FL, 0.014).translate(0, FL / 2, 0);
    const flaps = [1, -1].map((side) => {
      const hinge = new THREE.Group(); hinge.position.set(0, Y1, side * D); cart.add(hinge);
      const m = new THREE.Mesh(FLAP, flapMat); m.castShadow = true; hinge.add(m);
      return hinge;
    });
    const gables = [1, -1].map((sx) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      const m = new THREE.Mesh(g, gableMat); m.frustumCulled = false; cart.add(m);
      return { m, sx };
    });
    function setGables(aF, aB) {
      const yF = Y1 + FL * Math.cos(aF), zF = D + FL * Math.sin(aF), yB = Y1 + FL * Math.cos(aB), zB = -D - FL * Math.sin(aB);
      for (const G of gables) {
        const x = G.sx * (W + 0.002), p = G.m.geometry.attributes.position;
        p.setXYZ(0, x, Y1, D); p.setXYZ(1, x, Y1, -D); p.setXYZ(2, x, yB, zB); p.setXYZ(3, x, yF, zF);
        p.needsUpdate = true; G.m.geometry.computeVertexNormals();
      }
    }

    // the pour spout on the right gable: two lips that are squashed flat when sick
    const spoutG = new THREE.Group(); spoutG.position.set(W + 0.006, Y1 + 0.1, 0); cart.add(spoutG);
    const lipGeo = (sy) => {       // half of a diamond beak: a low pyramid on the triangle of the spout
      const A = [0, 0, -0.125], B = [0.2, 0, 0], C = [0, 0, 0.125], E = [0.02, 0.085 * sy, 0];
      const ctr = new V3(0.055, 0.02 * sy, 0), tris = [];
      for (const [p, q, r] of [[A, B, C], [A, B, E], [B, C, E], [C, A, E]]) {    // wind every face outward
        const P0 = new V3(...p), P1 = new V3(...q), P2 = new V3(...r);
        const n = P1.clone().sub(P0).cross(P2.clone().sub(P0));
        tris.push(...(n.dot(P0.clone().sub(ctr)) > 0 ? [p, q, r] : [p, r, q]));
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3)); g.computeVertexNormals();
      return g;
    };
    const upperP = new THREE.Group(), lowerP = new THREE.Group(); spoutG.add(upperP, lowerP);
    const upLip = new THREE.Mesh(lipGeo(1), lipMat); upperP.add(upLip);
    const loLip = new THREE.Mesh(lipGeo(-1), lipMat); lowerP.add(loLip);
    const throat = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.18, -0.08), new THREE.Vector2(0.18, 0.08)]), { depth: 0.17, bevelEnabled: false }).translate(0, 0, -0.085), throatMat);
    spoutG.add(throat);

    // milk inside the top, the overflowing dome and the splash crown
    const milkTop = new THREE.Mesh(new THREE.BoxGeometry(2 * W - 0.012, 0.03, 2 * D - 0.012), milkMat);
    milkTop.position.y = Y1 - 0.05; cart.add(milkTop);
    const CROWN = (() => {
      const parts = [new THREE.SphereGeometry(0.31, 20, 9).scale(1, 0.85, 1)];
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; parts.push(new THREE.SphereGeometry(0.095, 10, 6).scale(1, 0.75, 1).translate(Math.cos(a) * 0.255, 0.035, Math.sin(a) * 0.255)); }
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + 0.2, o = new V3(Math.cos(a), 0, Math.sin(a)), hh = 0.16 + (i % 3) * 0.05;
        parts.push(taperTube([o.clone().multiplyScalar(0.2).setY(0.06), o.clone().multiplyScalar(0.3).setY(hh * 0.75), o.clone().multiplyScalar(0.38).setY(hh)], 0.034, 0.012, { segs: 10, radial: 7 }));
        parts.push(new THREE.SphereGeometry(0.026, 8, 5).translate(o.x * 0.42, hh + 0.05, o.z * 0.42));
      }
      return mergeGeometries(parts);
    })();
    const crown = new THREE.Mesh(CROWN, milkMat); crown.position.y = Y1 - 0.03; cart.add(crown);

    // drips running down the front from the rim
    const dripsG = new THREE.Group(); dripsG.position.set(0, Y1, D); cart.add(dripsG);
    dripsG.add(new THREE.Mesh(mergeGeometries([[-0.31, 0.16], [-0.015, 0.05], [0.31, 0.12]].flatMap(([x, len]) => [
      taperTube([new V3(x, 0.035, -0.04), new V3(x, 0.03, 0.004), new V3(x, -0.02, 0.014), new V3(x, -len, 0.014)], 0.022, 0.02, { segs: 12, radial: 7 }),
      new THREE.SphereGeometry(0.03, 12, 8).scale(1, 1.2, 1).translate(x, -len - 0.01, 0.014),
    ])), milkMat));

    // milk pooled on the cookie around the carton's foot
    const footMilk = (() => {
      const parts = [], rg = seeded(37);
      for (let i = 0; i < 18; i++) {
        const t = i / 18, side = Math.floor(t * 4), k = (t * 4) % 1, u = k * 2 - 1, qx = W + 0.05, qz = D + 0.05;
        const [x, z] = [[u * qx, qz], [qx, -u * qz], [-u * qx, -qz], [-qx, u * qz]][side];
        const r = 0.07 + rg() * 0.05;
        parts.push(new THREE.SphereGeometry(r, 14, 6).scale(1.3, 0.32, 1.3).translate(x, 0.005, z));
      }
      const g = new THREE.Group(); g.position.y = Y0; cart.add(g);
      g.add(new THREE.Mesh(mergeGeometries(parts), milkMat));
      return g;
    })();

    /* ---------- the overflow: six streams, even on both sides ---------- */
    function milkTube(pts, rf, segs = 60, radial = 10, thin = 0.3) {
      const curve = new THREE.CatmullRomCurve3(pts);
      const g = new THREE.TubeGeometry(curve, segs, 1, radial, false);
      const p = g.attributes.position, n = g.attributes.normal, thinPos = new Float32Array(p.count * 3);
      for (let j = 0; j <= segs; j++) {
        const k = j / segs, r = rf(k), c = curve.getPointAt(k);
        for (let i = 0; i <= radial; i++) {
          const q = j * (radial + 1) + i, nx = n.getX(q), ny = n.getY(q), nz = n.getZ(q);
          p.setXYZ(q, c.x + nx * r, c.y + ny * r, c.z + nz * r);
          thinPos[q * 3] = c.x + nx * r * thin; thinPos[q * 3 + 1] = c.y + ny * r * thin; thinPos[q * 3 + 2] = c.z + nz * r * thin;
        }
      }
      g.computeVertexNormals();
      g.morphAttributes.position = [new THREE.BufferAttribute(thinPos, 3)];
      return g;
    }
    const rEdge = (a) => Math.min(W / Math.max(1e-3, Math.abs(Math.sin(a))), D / Math.max(1e-3, Math.abs(Math.cos(a))));
    const streamR = (k) => 0.068 * lerp(0.45, 1, sstep(0, 0.12, k)) * (1 - 0.16 * Math.exp(-(((k - 0.52) / 0.12) ** 2))) * (1 + 0.28 * sstep(0.86, 1, k));
    const SPLASH = (() => {
      const parts = [new THREE.SphereGeometry(0.11, 14, 6).scale(1, 0.26, 1)];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + 0.3, o = new V3(Math.cos(a), 0, Math.sin(a)), hh = 0.08 + (i % 3) * 0.035;
        parts.push(taperTube([o.clone().multiplyScalar(0.07), o.clone().multiplyScalar(0.11).setY(hh * 0.6), o.clone().multiplyScalar(0.16).setY(hh)], 0.022, 0.008, { segs: 8, radial: 6 }));
        parts.push(new THREE.SphereGeometry(0.019, 6, 4).translate(o.x * 0.18, hh + 0.035, o.z * 0.18));
      }
      return mergeGeometries(parts);
    })();
    const streams = [];
    for (const deg of [46, -46, 134, -134, 168, -168]) {
      const a = deg * DEG, d = new V3(Math.sin(a), 0, Math.cos(a)), re = rEdge(a);
      const at = (r, y) => d.clone().multiplyScalar(r).setY(y);
      const LAND = 0.84;
      const m = new THREE.Mesh(milkTube([at(re * 0.35, Y1 + 0.06), at(re * 0.85, Y1 + 0.24), at(re + 0.16, Y1 + 0.17), at(re + 0.26, Y1 - 0.1), at(re + 0.29, YM + 0.02), at(re + 0.33, 0.42), at(LAND, 0.05)], streamR), streamMat);
      cart.add(m);
      const sp = new THREE.Mesh(SPLASH, milkMat); sp.position.copy(at(LAND, 0.03)); yawG.add(sp);
      streams.push({ m, sp, d, ph: rnd(0, TAU), land: at(LAND, 0.06) });
    }
    // the pour from the spout (healed, and briefly for a right card)
    const CUP_AT = new V3(0.96, 0, 0.3);
    const spoutStream = new THREE.Mesh(milkTube([new V3(W + 0.14, Y1 + 0.12, 0), new V3(W + 0.3, Y1 + 0.1, 0.03), new V3(0.72, 0.96, 0.12), new V3(0.84, 0.66, 0.22), new V3(0.93, 0.34, 0.28), new V3(CUP_AT.x, 0.06, CUP_AT.z)],
      (k) => 0.034 * lerp(0.7, 1, sstep(0, 0.1, k)) * (1 - 0.12 * sstep(0.3, 0.9, k)), 48, 9, 0.25), streamMat);
    cart.add(spoutStream);

    // the cup it pours into
    const cupG = new THREE.Group(); cupG.position.copy(CUP_AT); yawG.add(cupG);
    {
      const lathe = new THREE.LatheGeometry([[0.0, 0.0], [0.1, 0.0], [0.12, 0.016], [0.128, 0.2], [0.134, 0.236], [0.12, 0.236], [0.113, 0.03], [0.0, 0.03]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
      const handle = new THREE.TorusGeometry(0.06, 0.017, 8, 14, Math.PI).rotateZ(-Math.PI / 2).translate(0.126, 0.12, 0);
      const cup = new THREE.Mesh(mergeGeometries([lathe, handle]), cupMat); cup.castShadow = true;
      cup.rotation.y = -0.5; cupG.add(cup);
    }
    const cupMilk = new THREE.Mesh(new THREE.CircleGeometry(0.114, 22).rotateX(-Math.PI / 2), milkMat);
    cupG.add(cupMilk);

    /* ---------- the bouquet of cookies on stems ---------- */
    function cookieShape(bite) {
      const sh = new THREE.Shape(), Rr = 0.93;
      if (!bite) { sh.absarc(0, 0, Rr, 0, TAU, false); return sh; }
      const a0 = 0.45, a1 = a0 + TAU - 1.35, am = a0 - 0.675;
      const p0 = [Math.cos(a0) * Rr, Math.sin(a0) * Rr], p1 = [Math.cos(a1) * Rr, Math.sin(a1) * Rr], c = [Math.cos(am) * 0.3, Math.sin(am) * 0.3];
      sh.moveTo(p0[0], p0[1]); sh.absarc(0, 0, Rr, a0, a1, false);
      const zig = (A, B, n, amp) => {
        for (let i = 1; i <= n; i++) {
          const k = i / n, nx = -(B[1] - A[1]), ny = B[0] - A[0], L = Math.hypot(nx, ny), o = i < n ? (i % 2 ? amp : -amp) : 0;
          sh.lineTo(lerp(A[0], B[0], k) + (nx / L) * o, lerp(A[1], B[1], k) + (ny / L) * o);
        }
      };
      zig(p1, c, 4, 0.06); zig(c, p0, 4, 0.06);
      return sh;
    }
    const cookieGeo = (bite) => remapCookieUV(new THREE.ExtrudeGeometry(cookieShape(bite), { depth: 0.2, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 1, curveSegments: 22 }), 1).translate(0, 0, -0.1);
    const CHIP = cookieGeo(false), BROKEN = cookieGeo(true);
        const PETAL_SOLID = new THREE.SphereGeometry(1, 12, 8).scale(0.3, 0.52, 0.07).rotateX(0.25);
    const PETALS = mergeGeometries(Array.from({ length: 9 }, (_, i) => PETAL_SOLID.clone().translate(0, 1.12, -0.1).rotateZ((i / 9) * TAU)));

    const bq = new THREE.Group(); bq.position.set(0, Y1 - 0.05, 0); cart.add(bq);
    const COOKIES = [
      ['swirl', -0.64, 0.56, 0.02, 0.15], ['swirl', -0.3, 0.86, -0.06, 0.15], ['swirl', 0.33, 0.9, -0.08, 0.15], ['swirl', 0.68, 0.6, 0.0, 0.13],
      ['swirl', -0.74, 0.22, 0.14, 0.09], ['chip', 0.0, 0.46, 0.15, 0.19], ['broken', -0.28, 0.33, 0.2, 0.15], ['broken', 0.3, 0.37, 0.17, 0.15],
      ['chip', 0.09, 0.72, -0.06, 0.15], ['chip', 0.54, 0.24, 0.22, 0.1], ['broken', -0.1, 0.2, 0.32, 0.11], ['chip', -0.2, 0.63, -0.1, 0.13],
    ];
    const cookies = [], stemParts = [];
    const ZV = new V3(0, 0, 1);
    for (const [kind, x, y, z, size] of COOKIES) {
      const tip = new V3(x, y, z);
      stemParts.push(taperTube(new THREE.QuadraticBezierCurve3(new V3(x * 0.12, -0.02, z * 0.25), new V3(x * 0.3, y * 0.62, z * 0.6), tip.clone().add(new V3(0, 0, -0.02))), 0.014, 0.01, { segs: 16, radial: 6 }));
      const m = new THREE.Mesh(kind === 'broken' ? BROKEN : CHIP, kind === 'swirl' ? swirlMat : chipMat);
      m.position.copy(tip); m.scale.setScalar(size);
      const n = new V3(x * 0.55, 0.32, 1).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(ZV, n).multiply(new THREE.Quaternion().setFromAxisAngle(ZV, rnd(0, TAU)));
      const petals = new THREE.Mesh(PETALS, petalMat); petals.visible = false; m.add(petals);
      bq.add(m);
      cookies.push({ m, q, petals, broken: kind === 'broken', ph: rnd(0, TAU), f: rnd(1.6, 2.6) });
    }
    const stems = new THREE.Mesh(mergeGeometries(stemParts), stemMat); bq.add(stems);

    // two cookies that fly off on a wrong card
    const flyers = [0, 1].map(() => { const m = new THREE.Mesh(CHIP, chipMat); m.scale.setScalar(0.1); m.visible = false; m.castShadow = true; world.add(m); return { m, v: new V3(), w: new V3(), t: 0, on: false }; });

    /* ---------- the sprout at its foot ---------- */
    const sproutG = new THREE.Group(); sproutG.position.set(0, Y0, D + 0.13); cart.add(sproutG);
    const sSway = new THREE.Group(); sproutG.add(sSway);
    const sStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.017, 1, 8).translate(0, 0.5, 0), stemMat); sSway.add(sStem);
    const sTip = new THREE.Group(); sSway.add(sTip);
    const LEAF = sheet({ width: 0.5, cup: 0.2, curl: 0.16, point: 0.7 });
    const sLeaves = [-1, 1].map((sx) => {
      const L = addLeaf(sTip, new V3(0, 0, 0), new V3(sx, 0.75, 0.3), new V3(sx, 0.18, 0.4), 0.15, leafMat, LEAF, new V3(sx * 0.2, 1, 0.3));
      L.roll = 0; return L;
    });
    const sBloom = new THREE.Group(); sBloom.position.y = 0.02; sBloom.scale.setScalar(1e-3); sTip.add(sBloom);
    {
      const fl = new THREE.Mesh(mergeGeometries(Array.from({ length: 6 }, (_, i) => PETAL_SOLID.clone().scale(0.075, 0.075, 0.075).translate(0, 0.055, -0.005).rotateZ((i / 6) * TAU))), petalMat);
      fl.rotation.x = -0.35; sBloom.add(fl);
      const yolk = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10).scale(1, 1, 0.6), yolkMat); yolk.rotation.x = -0.35; sBloom.add(yolk);
    }

    /* ---------- particles: milk droplets and cookie crumbs ---------- */
    const drops = particles(dropTex, 360, THREE.NormalBlending);
    const MILKC = '#fbf5e4', CRUMB = ['#8a5230', '#a86b3c', '#5a3220'];
    const _p = new V3(), _v = new V3(), _q = new THREE.Quaternion();
    function emitCart(local, vel, o) {
      cart.localToWorld(_p.copy(local));
      cart.getWorldQuaternion(_q);
      drops.emit(_p, { v: _v.copy(vel).applyQuaternion(_q), floor: 0.04, ...o });
    }
    function spray(n, power = 1) {
      for (let i = 0; i < n; i++) {
        const a = rnd(0, TAU), d = new V3(Math.sin(a), 0, Math.cos(a));
        emitCart(d.clone().multiplyScalar(rnd(0.1, 0.3)).setY(Y1 + rnd(0.1, 0.25)), d.multiplyScalar(rnd(0.5, 1.3) * power).setY(rnd(1.2, 2.4) * power),
          { life: rnd(0.8, 1.3), s0: rnd(0.035, 0.055), s1: 0.025, color: MILKC, g: -5.5, drag: 0.3, spin: 0 });
      }
    }
    function crumbs(n, power = 1) {
      for (let i = 0; i < n; i++) {
        const C = cookies[Math.floor(rnd(0, cookies.length))];
        const at = C.m.getWorldPosition(new V3());
        drops.emit(at, { v: new V3(rnd(-1, 1), rnd(0.5, 1.8), rnd(-0.4, 1)).multiplyScalar(power), life: rnd(0.9, 1.4), s0: rnd(0.03, 0.05), s1: 0.025, color: CRUMB[i % 3], g: -5, drag: 0.4, floor: 0.04 });
      }
    }

    /* ---------- motion state ---------- */
    const surgeS = new Spring(120, 6);         // the bulge popping out on a wrong card
    const spoutS = new Spring(70, 9);          // the spout opening
    const bloomS = new Spring(90, 7.5);
    const cupS = new Spring(110, 9);
    const sproutS = new Spring(60, 8, 0.13);
    const flowerS = new Spring(110, 7);
    let strain = null, nextStrain = 2.2, dribble = 0.6, cupFill = 0.12;
    const tmpE = new THREE.Euler(), tmpQ = new THREE.Quaternion();
    const centre = () => cart.localToWorld(new V3(0, 0.8, 0.15));

    function launchFlyers() {
      flyers.forEach((F, i) => {
        const s = i ? 1 : -1;
        F.on = true; F.t = 0; F.m.visible = true; F.m.scale.setScalar(0.1);
        F.m.position.copy(world.worldToLocal(cart.localToWorld(new V3(s * 0.15, Y1 + 0.6, 0.1))));
        F.v.set(s * rnd(0.9, 1.3), rnd(2.2, 2.7), rnd(0.3, 0.7)); F.w.set(rnd(4, 8), rnd(-4, 4), rnd(4, 8) * s);
      });
    }

    return {
      centre,
      anchor: () => cart.localToWorld(new V3(0.62, 2.0, 0)),
      react(type) {
        if (type === 'wrong') {                 // a big gush: the carton swells, milk and cookies spray
          surgeS.kick(5.5);
          spray(70, 1.25); crumbs(26, 1.3); launchFlyers();
          strain = null;
        } else {
          spoutS.kick(4);
          for (let i = 0; i < 10; i++) emitCart(new V3(W + 0.28, Y1 + 0.12, 0), new V3(rnd(0.3, 0.8), rnd(0.3, 0.9), rnd(-0.3, 0.3)), { life: 0.7, s0: 0.04, s1: 0.02, color: MILKC, g: -5 });
        }
      },
      burst() {
        strain = null; bloomS.kick(4); flowerS.kick(3);
        spray(40, 0.9);
      },
      reset() {
        strain = null; nextStrain = 2.2; cupFill = 0.12;
        surgeS.set(0); spoutS.set(0); bloomS.set(0); cupS.set(0); sproutS.set(0.13); flowerS.set(0);
        for (const F of flyers) { F.on = false; F.m.visible = false; }
      },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        const hp = clamp(s.hp, -0.1, 1.15), hc = clamp(hp, 0, 1);
        const wrongK = s.react?.type === 'wrong' ? s.react.w : 0;
        const rightK = s.react?.type === 'right' ? s.react.w : 0;
        surgeS.step(dt);
        kit.leafFold = clamp(s.k.flinch.x, 0, 1) * 0.6;

        /* the creak: every few seconds the strain builds, it shudders and winces */
        nextStrain -= dt;
        if (nextStrain <= 0) {
          if (!heal.on && sick > 0.3 && !s.react) strain = { t: 0, dur: 1.05 };
          nextStrain = rnd(3.4, 5.6);
        }
        let strainK = 0;
        if (strain) {
          strain.t += dt;
          strainK = Math.sin(Math.PI * clamp(strain.t / strain.dur, 0, 1)) * sick;
          if (strain.t > strain.dur) strain = null;
        }
        const breath = Math.sin(t * 1.7) * M;
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.1);

        /* how full it is: the bulge and the overflow, both read from health */
        const base = clamp(1 - hp * 1.2, 0, 1);
        const flow = clamp(base * (0.9 + 0.1 * pulse) + wrongK * 0.75 + strainK * 0.3 - rightK * 0.35 * base, 0, 1.7);
        const bulge = Math.max(0, lerp(1, 0.04, hc) + wrongK * 0.4 + surgeS.x * 0.22 + strainK * 0.3 - rightK * 0.28 * (1 - hc)
          + breath * 0.04 * (1 - hc) + clamp(s.k.flinch.x, 0, 1) * 0.12);

        /* the carton: sway, breathing, the shudder */
        const sway = Math.sin(t * 0.9) * 0.016 * M * (0.5 + sick);
        const shim = (Math.sin(t * 57) * 0.011 + Math.sin(t * 43) * 0.006) * (strainK + wrongK * 0.7) * M;
        cartPivot.rotation.set(-s.k.flinch.x * 0.035, YAW + s.k.spin.x * 0.07, sway + shim + s.k.shake.x * 0.035);
        const sy = 1 + breath * 0.008 + s.k.bounce.x * 0.03 - clamp(s.k.flinch.x, 0, 1) * 0.04;
        cartPivot.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
        body.morphTargetInfluences[0] = bulge;
        shine.morphTargetInfluences[0] = bulge;
        stress.morphTargetInfluences[0] = bulge;
        shineMat.opacity = clamp(bulge * 1.1 - 0.1, 0, 0.92);
        stressMat.opacity = clamp(strainK * 1.4 + wrongK, 0, 1);
        faceG.position.z = D + BUL * bulge * (1 - vF * vF) - FC + 0.002;
        P.mix(bodyMat, 'carton', h); P.mix(flapMat, 'carton', h); P.mix(gableMat, 'carton', h); P.mix(lipMat, 'carton', h); P.mix(rig.lidMat, 'carton', h);
        P.mix(streamMat, 'milk', h); P.mix(milkMat, 'milk', h); P.mix(grassMat, 'grass', h); P.mix(stemMat, 'stem', h); P.mix(leafMat, 'leaf', h);

        /* the face: worried brows while it is sick, a wince when it surges */
        const browVis = clamp(sick * 0.9 + strainK + wrongK, 0, 1);
        for (const e of rig.eyes) e.brow?.scale.setScalar(Math.max(1e-3, browVis));
        rig.over(winceE, strainK * 0.9);

        /* the gable top: burst open and flapping when full, neat when well */
        const aOpen = lerp(0.95, -0.3, clamp(hp, -0.1, 1.1)) + wrongK * 0.35 + surgeS.x * 0.08 + strainK * 0.12;
        const wob = Math.sin(t * 6.3) * 0.05 * Math.min(flow, 1) * M;
        flaps[0].rotation.x = aOpen + wob; flaps[1].rotation.x = -(aOpen - wob * 0.8);
        setGables(aOpen + wob, aOpen - wob * 0.8);

        /* the spout: squashed flat when sick, opening as it heals */
        spoutS.target = clamp(sstep(0.3, 1, h) + rightK * 1.2, 0, 1); spoutS.step(dt);
        const op = clamp(spoutS.x, 0, 1.15), flat = 1 - clamp(op, 0, 1);
        upperP.rotation.z = op * 0.42; lowerP.rotation.z = -op * 0.42;
        throat.visible = op > 0.03; throat.scale.set(1, Math.max(1e-3, op), 1);
        spoutG.scale.set(1.35 * (1 - flat * 0.1), 1.35 * lerp(1, 0.45, flat), 1.35 * lerp(1, 1.3, flat));
        spoutG.rotation.set(flat * 0.25 + Math.sin(t * 2.1) * 0.04 * flat * M, 0, lerp(0.05, 0.42, flat));
        const spoutFlow = clamp(Math.max(rightK * 0.95, sstep(0.5, 1, h) * 0.62) * clamp(op * 1.3, 0, 1), 0, 1);
        spoutStream.visible = spoutFlow > 0.08;
        spoutStream.morphTargetInfluences[0] = 1 - spoutFlow;

        /* the overflow */
        for (const S of streams) {
          const f = flow * (1 + 0.1 * Math.sin(t * 2.3 + S.ph));
          S.m.visible = f > 0.08; S.m.morphTargetInfluences[0] = clamp(1 - f, -0.7, 1);
          S.sp.visible = f > 0.06; S.sp.scale.setScalar(Math.max(1e-3, clamp(f, 0, 1.4) * (1 + 0.16 * Math.sin(t * 9 + S.ph))));
        }
        flowTex.offset.x -= dt * lerp(1.0, 0.5, hc) * (1 + wrongK * 0.8);
        crown.visible = flow > 0.03;
        crown.scale.set(1 + 0.05 * pulse * flow, Math.max(1e-3, clamp(0.12 + flow * 0.88, 0, 1.5)), 1 + 0.05 * pulse * flow);
        dripsG.visible = flow > 0.05;
        dripsG.scale.set(1, Math.max(1e-3, clamp(flow, 0, 1.3)), 1);
        dripsG.position.z = D + BUL * bulge * 0.3;
        footMilk.visible = flow > 0.04; footMilk.scale.setScalar(Math.max(1e-3, clamp(0.3 + flow * 0.7, 0, 1.3)));
        const pk = 1 - sstep(0.3, 1, h);
        puddle.visible = pk > 0.02;
        puddle.scale.set(Math.max(1e-3, pk * (1 + 0.015 * breath + wrongK * 0.06)), 1, Math.max(1e-3, pk * (1 + 0.015 * breath + wrongK * 0.06)));

        /* the bouquet: jostled by the gush when sick, blooming when well */
        bq.scale.setScalar(1 + wrongK * 0.1 + surgeS.x * 0.05 + strainK * 0.03 + s.k.bounce.x * 0.02);
        bq.rotation.z = Math.sin(t * 0.8) * 0.025 * M;
        bloomS.target = sstep(0.55, 1, h);
        const bloom = clamp(bloomS.step(dt), 0, 1.2);
        for (const C of cookies) {
          const amp = (0.05 + sick * 0.09 + wrongK * 0.3 + strainK * 0.08) * M;
          tmpE.set(Math.sin(t * C.f + C.ph) * amp, Math.cos(t * C.f * 0.8 + C.ph) * amp, Math.sin(t * C.f * 0.6 + C.ph) * amp * 0.6);
          C.m.quaternion.copy(C.q).multiply(tmpQ.setFromEuler(tmpE));
          if (C.broken) C.m.geometry = h > 0.85 ? CHIP : BROKEN;
          C.petals.visible = bloom > 0.01;
          C.petals.scale.setScalar(Math.max(1e-3, bloom));
          C.petals.rotation.z = Math.sin(t * 0.6 + C.ph) * 0.1 * M;
        }

        /* the sprout grows and flowers */
        sproutS.target = lerp(0.12, 0.22, sstep(0.4, 1, h));
        const sh = Math.max(0.05, sproutS.step(dt));
        sStem.scale.y = sh; sTip.position.y = sh;
        sSway.rotation.z = Math.sin(t * 1.3) * 0.06 * M; sSway.rotation.x = Math.sin(t * 1.1 + 1) * 0.04 * M;
        for (const L of sLeaves) L.mesh.scale.setScalar(L.size * lerp(1, 1.2, sstep(0.4, 1, h)));
        flowerS.target = sstep(0.8, 1, h);
        sBloom.scale.setScalar(Math.max(1e-3, clamp(flowerS.step(dt), 0, 1.3)));

        /* the cup */
        cupS.target = sstep(0.4, 0.8, h);
        const cs = clamp(cupS.step(dt), 0, 1.25);
        cupG.visible = cs > 0.01; cupG.scale.setScalar(Math.max(1e-3, cs));
        if (spoutFlow > 0.1 && cs > 0.5) cupFill = Math.min(0.2, cupFill + dt * 0.03 * spoutFlow);
        cupMilk.position.y = cupFill;

        world.updateMatrixWorld(true);

        /* droplets and crumbs */
        if (flow > 0.05 && Math.random() < dt * 12 * flow * M) spray(1, 0.8 + flow * 0.2);
        if (flow > 0.05) for (const S of streams) {
          if (Math.random() < dt * 2.5 * flow * M) {
            const p = yawG.localToWorld(S.land.clone());
            const v = S.d.clone().applyQuaternion(yawG.getWorldQuaternion(_q)).multiplyScalar(rnd(0.2, 0.7)).setY(rnd(0.8, 1.5));
            drops.emit(p, { v, life: rnd(0.4, 0.7), s0: 0.04, s1: 0.02, color: MILKC, g: -5, floor: 0.04 });
          }
        }
        if (sick > 0.3 && Math.random() < dt * 1.5 * sick * M) crumbs(1, 0.6);
        if (op < 0.3 && sick > 0.3 && (dribble -= dt) <= 0) {          // the squashed spout only dribbles
          dribble = rnd(0.7, 1.3);
          emitCart(new V3(W + 0.24, Y1 + 0.2, rnd(-0.04, 0.04)), new V3(0.05, -0.1, 0), { life: 1.1, s0: 0.035, s1: 0.03, color: MILKC, g: -3.5 });
        }
        if (spoutFlow > 0.2 && Math.random() < dt * 6 * M) {
          const p = yawG.localToWorld(CUP_AT.clone().setY(cs > 0.5 ? cupFill + 0.02 : 0.06));
          drops.emit(p, { v: new V3(rnd(-0.3, 0.3), rnd(0.5, 0.9), rnd(-0.3, 0.3)), life: 0.4, s0: 0.03, s1: 0.015, color: MILKC, g: -5 });
        }

        /* cookies thrown off by a wrong card */
        for (const F of flyers) {
          if (!F.on) continue;
          F.t += dt;
          const floorY = 0.05;
          if (F.m.position.y > floorY || F.v.y > 0) {
            F.v.y -= 6 * dt; F.m.position.addScaledVector(F.v, dt);
            F.m.rotation.x += F.w.x * dt; F.m.rotation.y += F.w.y * dt; F.m.rotation.z += F.w.z * dt;
            if (F.m.position.y <= floorY) { F.m.position.y = floorY; F.v.set(0, 0, 0); F.m.rotation.set(-Math.PI / 2, 0, F.m.rotation.z); }
          }
          if (F.t > 1.2) F.m.scale.setScalar(Math.max(1e-3, 0.1 * (1 - (F.t - 1.2) / 0.4)));
          if (F.t > 1.6) { F.on = false; F.m.visible = false; }
        }
      },
    };
  },
};
