/* 5. Gestational Hypertension: Gesta, the Hypertensive Bloom.
   From her slide (refs/p17_0.jpg): a slender sage-green plant-woman in soft
   watercolour with thin purple-grey ink. A round head with a few darker
   speckles on the forehead, big sad violet eyes, a small worried mouth, rosy
   cheeks; a bob of big purple petals with three curly stamens on top; a collar
   of leaves (one purple); a pregnant belly with a glowing round window and a
   curled baby inside, one leafy hand under it; the other arm in a purple
   blood-pressure cuff, its tube looping to a gauge she holds up (needle near
   160) and a dark bulb hanging below. A skirt of long leaves, a spread of
   trailing roots, a few fallen petals.
   Mostly calm, because gestational hypertension is often symptomless: the
   trouble lives in the gauge, the cuff and a faint throb at her temples.
   Healed (my addition, from her note "resolves after birth, returning to
   balance"): the needle settles in the green, the cuff and tubes fall away,
   the gauge turns into a flower in her hand, and her petals lift and brighten. */

export default {
  id: 'gesta',
  look: { ink: '#4a3a56', bands: [112, 172, 226, 255], outline: 0.0032, rune: ['#c88ae0', '#9fe0b4'], bg: ['#4a3d60', '#241d34', '#0b0812'] },
  frame: { halfH: 1.56, halfW: 1.25, lookY: 1.3 },
  careTitle: 'Watch over Gesta',
  lines: {
    sick: 'Watchful, not permanent.',
    wrong: ['The pressure is climbing!', 'Ooh, it spiked!', 'Too much strain...'],
    right: ['A little calmer.', 'That helps.'],
    healed: 'Back in balance!',
  },
  shows: [
    '<b>The gauge needle stuck near 160, twitching in the red</b>: blood pressure of 140/90 or more, new after 20 weeks.',
    '<b>The cuff tightening on her arm, pump after pump</b>: pressure that has to be measured again and again.',
    '<b>Calm, just worried</b>: gestational hypertension often has no symptoms at all.',
    '<b>A purple throb at her temples, petals drooping</b>: the warning petals. New headache, vision changes or upper belly pain can mean it is turning into preeclampsia.',
    '<b>Glancing at the gauge, a hand on the glowing belly</b>: mother and baby both kept under watch.',
  ],
  healedNote: 'Healed, the needle settles back in the green, the cuff falls away and the gauge blooms into a flower in her hand. As her art says, it resolves after birth, returning to balance.',

  build(kit) {
    const { THREE, world, toon, noOutline, canvasTex, sheet, lumpGeo, taperTube, addLeaf, face, palette, Spring,
      spark, wisp, heartbeat, randDir, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, backOut, V3, TAU, DEG, UP, mergeGeometries, tex } = kit;

    const P = palette({
      skin: ['#93a46c', '#a2c873'], leaf: ['#7b9452', '#68ad4e'], leaf2: ['#87a05c', '#7cbd5a'],
      petal: ['#9a76b0', '#c681da'], root: ['#6d6a4c', '#6f7c4a'], glow: ['#e2e6b4', '#fff1c4'],
      spot: ['#6f8048', '#78985a'],
    });

    /* ---------- textures ---------- */
    // faint purple veins and watercolour grain, multiplied over the skin colour
    const veinTex = canvasTex(256, 512, (x, w, h) => {
      x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        x.fillStyle = R() < 0.55 ? 'rgba(60,70,40,.08)' : 'rgba(255,255,255,.18)';
        x.beginPath(); x.arc(R() * w, R() * h, rr(2, 7), 0, TAU); x.fill();
      }
      x.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        const px = (i + R() * 0.6) * w / 9, y0 = rr(0.05, 0.5) * h, y1 = y0 + rr(0.25, 0.5) * h;
        x.strokeStyle = 'rgba(150,90,175,.42)'; x.lineWidth = rr(1.2, 2.4);
        x.beginPath(); x.moveTo(px, y0);
        for (let y = y0; y <= y1; y += 12) x.lineTo(px + Math.sin(y * 0.04 + i * 2) * 7, y);
        x.stroke();
      }
    }, { repeat: true });
    veinTex.repeat.set(2, 1);
    const dialTex = canvasTex(256, 256, (x, w) => {
      const c = w / 2, ang = (v) => (-135 + 270 * (v - 80) / 140) * DEG;
      x.fillStyle = '#f7f1e4'; x.beginPath(); x.arc(c, c, 127, 0, TAU); x.fill();
      x.lineCap = 'butt';
      x.lineWidth = 13; x.strokeStyle = '#7cbf72'; x.beginPath(); x.arc(c, c, 104, ang(88) - Math.PI / 2, ang(132) - Math.PI / 2); x.stroke();
      x.strokeStyle = '#e0626c'; x.beginPath(); x.arc(c, c, 104, ang(140) - Math.PI / 2, ang(220) - Math.PI / 2); x.stroke();
      for (let v = 80; v <= 220; v += 10) {
        const a = ang(v), big = v % 20 === 0;
        x.strokeStyle = '#3c2c40'; x.lineWidth = big ? 4 : 2;
        x.beginPath(); x.moveTo(c + Math.sin(a) * 114, c - Math.cos(a) * 114); x.lineTo(c + Math.sin(a) * (big ? 92 : 100), c - Math.cos(a) * (big ? 92 : 100)); x.stroke();
        if (big) {
          x.fillStyle = v >= 140 ? '#b8323e' : '#3c2c40'; x.font = 'bold 21px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillText(String(v), c + Math.sin(a) * 72, c - Math.cos(a) * 72);
        }
      }
      x.fillStyle = '#6a5a70'; x.font = 'italic 17px Georgia, serif'; x.textAlign = 'center'; x.fillText('mmHg', c, c + 52);
      x.strokeStyle = '#8c8494'; x.lineWidth = 3; x.beginPath(); x.arc(c, c, 125, 0, TAU); x.stroke();
    });
    const flushTex = canvasTex(64, 64, (x, w, h) => {
      const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    });

    /* ---------- materials ---------- */
    const skinMat = toon('#93a46c', { map: veinTex });
    const headMat = toon('#93a46c');
    const spotMat = toon('#6f8048', { thickness: 0 });
    const leafMat = toon('#7b9452', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.003 });
    const leafMat2 = toon('#87a05c', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.003 });
    const petalMat = toon('#8f74a3', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.003 });
    const rootMat = toon('#6d6a4c', { map: tex.bark, thickness: 0.0026 });
    const glowMat = toon('#e2e6b4', { emissive: '#f4ecb0', emissiveIntensity: 0.3, thickness: 0.0025 });
    const rimMat = toon('#728652', { thickness: 0.0022 });
    const babyMat = toon('#c4d496', { emissive: '#e8f0b0', emissiveIntensity: 0.18, thickness: 0.0018 });
    const cuffMat = toon('#5d5194', { thickness: 0.003 });
    const tubeMat = toon('#4c406c', { thickness: 0.0024 });
    const bulbMat = toon('#43345e', { thickness: 0.003 });
    const metalMat = toon('#cfccd6', { thickness: 0.0028 });
    const dialMat = noOutline(new THREE.MeshBasicMaterial({ map: dialTex }));
    const needleMat = noOutline(new THREE.MeshBasicMaterial({ color: '#8c1a34', side: THREE.DoubleSide }));
    const flushMat = noOutline(new THREE.MeshBasicMaterial({ map: flushTex, color: '#a63fc4', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
    const flowerMat = toon('#e48ad6', { side: THREE.DoubleSide, thickness: 0.0026 });
    const flowerCore = toon('#f6d766', { thickness: 0.0024 });

    /* ---------- shapes ---------- */
    const HAIR = sheet({ width: 0.58, cup: 0.18, curl: 0.5, tipPinch: -0.25, point: 0.5, cols: 8, rows: 12, wave: 0.1, waveN: 3 });
    const TOPP = sheet({ width: 0.52, cup: -0.18, curl: 0.3, tipPinch: -0.2, point: 0.5, cols: 8, rows: 12, wave: 0.12, waveN: 3 });
    const LEAF = sheet({ width: 0.36, cup: 0.14, curl: 0.18, point: 0.7, rows: 12 });
    const SKIRT = sheet({ width: 0.21, cup: 0.16, curl: 0.22, point: 0.75, tipPinch: 0.35, rows: 14 });
    const PETAL_S = sheet({ width: 0.42, cup: 0.1, curl: 0.08, tipPinch: -0.2, point: 0.5, cols: 6, rows: 6 });

    /** Engine leaves point their +Y along a direction; this is the roll that
        turns their curl (local +Z) toward `want`, so petals curl the way I mean. */
    const _q = new THREE.Quaternion();
    function rollFor(dir, want) {
      _q.setFromUnitVectors(UP, dir.clone().normalize());
      const x0 = new V3(1, 0, 0).applyQuaternion(_q), z0 = new V3(0, 0, 1).applyQuaternion(_q);
      const d = dir.clone().normalize(), w = want.clone().addScaledVector(d, -want.dot(d)).normalize();
      return Math.atan2(w.dot(x0), w.dot(z0));
    }
    function leaf(parent, at, dirWell, dirSick, size, mat, geo, want, dirIn) {
      const L = addLeaf(parent, at, dirWell, dirSick, size, mat, geo, dirIn);
      L.roll = rollFor(dirWell.clone().add(dirSick), want);
      return L;
    }

    /* ---------- Gesta ---------- */
    const gesta = new THREE.Group(); world.add(gesta);
    const PIV = 0.34;                                     // she sways from the top of her roots
    const torso = new THREE.Group(); torso.position.y = PIV; gesta.add(torso);
    const body = new THREE.Group(); body.position.y = -PIV; torso.add(body);

    // trunk: flared foot, slim waist, small chest, narrow sloping shoulders, long neck
    const prof = [
      [0, 0.0], [0.31, 0.0], [0.27, 0.06], [0.21, 0.16], [0.18, 0.32], [0.185, 0.5], [0.21, 0.7], [0.245, 0.9],
      [0.255, 1.1], [0.235, 1.3], [0.2, 1.42], [0.195, 1.52], [0.2, 1.6], [0.17, 1.68], [0.12, 1.74],
      [0.072, 1.8], [0.06, 1.9], [0.056, 2.0], [0, 2.03],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const trunk = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), skinMat); trunk.castShadow = true; body.add(trunk);

    // the belly, with its round window and the curled baby inside
    const BC = new V3(0, 1.1, 0.1), BR = new V3(0.29, 0.33, 0.3);
    const bellyG = new THREE.Group(); bellyG.position.copy(BC); body.add(bellyG);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), skinMat); belly.scale.copy(BR); belly.castShadow = true; bellyG.add(belly);
    const onBelly = (x, y, k = 1) => {            // a point just over the belly's front surface (body space)
      const u = 1 - (x / (BR.x * k)) ** 2 - ((y - BC.y) / (BR.y * k)) ** 2;
      return new V3(x, y, BC.z + BR.z * k * Math.sqrt(Math.max(0, u)));
    };
    const WIN = new V3(0, -0.03, 0.265);            // window centre, belly space
    const win = new THREE.Group(); win.position.copy(WIN); bellyG.add(win);
    const pane = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 16), glowMat); pane.scale.z = 0.3; win.add(pane);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.012, 8, 48), rimMat); rim.position.z = 0.006; win.add(rim);
    const babyGeo = mergeGeometries([
      new THREE.SphereGeometry(0.052, 18, 12).translate(0.035, 0.042, 0),                                  // head
      taperTube([new V3(0.012, 0.012, 0), new V3(-0.03, -0.01, 0), new V3(-0.035, -0.055, 0), new V3(-0.005, -0.08, 0), new V3(0.03, -0.078, 0)], 0.04, 0.032, { segs: 16, radial: 10 }),
      new THREE.SphereGeometry(0.032, 12, 8).translate(0.03, -0.078, 0),                                    // bottom
      taperTube([new V3(0.025, -0.07, 0.01), new V3(0.065, -0.05, 0.015), new V3(0.06, -0.02, 0.02)], 0.02, 0.013, { segs: 8, radial: 6 }),     // folded leg
      taperTube([new V3(0.0, 0.0, 0.015), new V3(0.03, -0.012, 0.025), new V3(0.05, 0.005, 0.025)], 0.014, 0.01, { segs: 8, radial: 6 }),       // arm to chin
    ]);
    const baby = new THREE.Mesh(babyGeo, babyMat); baby.position.z = 0.043; baby.scale.z = 0.4; win.add(baby);
    const cord = new THREE.Mesh(kit.tendrilGeo({ rise: 0.015, r0: 0.03, coils: 1.4, thick: 0.004, dir: -1 }), babyMat);
    cord.position.set(-0.07, 0.05, 0.035); cord.rotation.z = 0.5; win.add(cord);

    /* ---------- arms ---------- */
    const SH = [new V3(-0.18, 1.62, 0), new V3(0.18, 1.62, 0)];
    // her right arm comes down her side and cradles the belly from below, leafy fingers spread
    {
      const pts = [SH[0], new V3(-0.28, 1.46, 0.0), new V3(-0.335, 1.26, 0.04), new V3(-0.315, 1.06, 0.17), new V3(-0.23, 0.91, 0.28), new V3(-0.12, 0.85, 0.325)];
      const parts = [taperTube(pts, 0.042, 0.032, { segs: 40, radial: 10 }), new THREE.SphereGeometry(0.044, 14, 10).translate(SH[0].x, SH[0].y, SH[0].z)];
      const base = new V3(-0.12, 0.85, 0.325);
      parts.push(new THREE.SphereGeometry(0.04, 14, 10).scale(1.2, 0.8, 0.9).translate(base.x, base.y, base.z));
      for (const [ex, ey] of [[0.07, 0.93], [0.1, 0.86], [0.07, 0.79], [0.0, 0.76]]) {
        const fp = [];
        for (let i = 0; i <= 4; i++) { const k = i / 4; fp.push(onBelly(lerp(base.x + 0.02, ex, k), lerp(base.y, ey, k), 1.07)); }
        fp[0].z = Math.max(fp[0].z, base.z);
        parts.push(taperTube(fp, 0.017, 0.006, { segs: 14, radial: 6 }));
      }
      const arm = new THREE.Mesh(mergeGeometries(parts), skinMat); arm.castShadow = true; body.add(arm);
    }
    // her left arm in the cuff, holding the gauge up; tube and bulb hang from it
    const armR = new THREE.Group(); armR.position.copy(SH[1]); body.add(armR);
    const rel = (x, y, z) => new V3(x, y, z).sub(SH[1]);
    {
      const pts = [rel(0.18, 1.62, 0), rel(0.27, 1.47, 0.01), rel(0.335, 1.3, 0.05), rel(0.42, 1.33, 0.1), rel(0.5, 1.42, 0.14), rel(0.55, 1.5, 0.15)];
      const parts = [taperTube(pts, 0.042, 0.032, { segs: 40, radial: 10 }), new THREE.SphereGeometry(0.044, 14, 10)];
      const palm = rel(0.565, 1.53, 0.15);
      parts.push(new THREE.SphereGeometry(0.036, 14, 10).scale(1, 1.1, 0.9).translate(palm.x, palm.y, palm.z));
      for (const [dz, dy] of [[0.04, 0.02], [0.045, -0.01], [-0.03, 0.01]]) {
        const fp = [palm.clone(), palm.clone().add(new V3(0.03, dy + 0.02, dz)), palm.clone().add(new V3(0.06, dy + 0.035, dz * 0.4))];
        parts.push(taperTube(fp, 0.015, 0.006, { segs: 10, radial: 6 }));
      }
      const arm = new THREE.Mesh(mergeGeometries(parts), skinMat); arm.castShadow = true; armR.add(arm);
    }
    // the cuff on the upper arm
    const cuffAt = rel(0.275, 1.45, 0.012), cuffDir = rel(0.27, 1.47, 0.01).sub(rel(0.18, 1.62, 0)).normalize();
    const cuffG = new THREE.Group(); cuffG.position.copy(cuffAt); cuffG.quaternion.setFromUnitVectors(UP, cuffDir.clone().negate()); armR.add(cuffG);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.07, 0.15, 20, 1), cuffMat); cuff.castShadow = true; cuffG.add(cuff);
    // the gauge, held up
    const GAUGE = rel(0.6, 1.7, 0.15);
    const gauge = new THREE.Group(); gauge.position.copy(GAUGE); gauge.rotation.y = -0.12; armR.add(gauge);
    const gaugeBody = new THREE.Mesh(mergeGeometries([
      new THREE.CylinderGeometry(0.112, 0.112, 0.04, 36).rotateX(Math.PI / 2),
      new THREE.TorusGeometry(0.112, 0.013, 8, 44).translate(0, 0, 0.02),
      new THREE.CylinderGeometry(0.017, 0.02, 0.07, 10).translate(0, -0.142, 0),
      new THREE.CylinderGeometry(0.014, 0.014, 0.03, 8).translate(0, 0.125, 0),
    ]), metalMat);
    gaugeBody.castShadow = true; gauge.add(gaugeBody);
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.104, 40), dialMat); dial.position.z = 0.0215; gauge.add(dial);
    const needle = new THREE.Mesh(mergeGeometries([new THREE.PlaneGeometry(0.011, 0.09).translate(0, 0.035, 0), new THREE.CircleGeometry(0.014, 14)]), needleMat);
    needle.position.z = 0.025; gauge.add(needle);
    // tube from the cuff looping under the forearm up to the gauge
    const STEM = rel(0.6, 1.53, 0.16);
    const tubeA = new THREE.Mesh(taperTube([rel(0.31, 1.4, 0.06), rel(0.355, 1.27, 0.13), rel(0.45, 1.21, 0.18), rel(0.55, 1.28, 0.2), rel(0.6, 1.42, 0.18), STEM], 0.011, 0.011, { segs: 40, radial: 6 }), tubeMat);
    armR.add(tubeA);
    // the bulb on its own tube, swinging from the gauge stem
    const bulbG = new THREE.Group(); bulbG.position.copy(STEM); armR.add(bulbG);
    bulbG.add(new THREE.Mesh(taperTube([new V3(0, 0, 0), new V3(0.09, -0.04, -0.02), new V3(0.15, -0.17, -0.03), new V3(0.13, -0.34, -0.01), new V3(0.1, -0.43, 0)], 0.011, 0.011, { segs: 32, radial: 6 }), tubeMat));
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.04, 10), metalMat); valve.position.set(0.1, -0.45, 0); bulbG.add(valve);
    const bulbP = new THREE.Group(); bulbP.position.set(0.1, -0.47, 0); bulbG.add(bulbP);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16).translate(0, -1, 0), bulbMat); bulb.scale.set(0.06, 0.085, 0.06); bulb.castShadow = true; bulbP.add(bulb);
        // the flower the gauge turns into
    const flower = new THREE.Group(); flower.position.copy(GAUGE); flower.scale.setScalar(1e-4); armR.add(flower);
    {
      const pg = [];
      for (let i = 0; i < 7; i++) pg.push(PETAL_S.clone().scale(0.17, 0.17, 0.17).rotateX(0.45).rotateZ(i / 7 * TAU));
      for (let i = 0; i < 5; i++) pg.push(PETAL_S.clone().scale(0.11, 0.11, 0.11).rotateX(0.85).rotateZ(i / 5 * TAU + 0.4).translate(0, 0, 0.012));
      flower.add(new THREE.Mesh(mergeGeometries(pg), flowerMat));
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), flowerCore); core.scale.z = 0.6; core.position.z = 0.02; flower.add(core);
      const stem = new THREE.Mesh(taperTube([new V3(0, 0, 0), new V3(-0.01, -0.08, 0), new V3(-0.03, -0.17, 0)], 0.012, 0.014, { segs: 10, radial: 6 }), leafMat); flower.add(stem);
    }

    /* ---------- collar of leaves, one purple ---------- */
    const collar = [];
    for (const [az, mat, size, dy] of [[-35, leafMat, 0.3, -0.2], [-90, leafMat2, 0.34, -0.15], [-150, leafMat, 0.3, -0.05], [150, leafMat2, 0.3, -0.05], [90, leafMat, 0.34, -0.15], [32, petalMat, 0.3, -0.3], [0, leafMat2, 0.24, -0.45]]) {
      const a = az * DEG, out = new V3(Math.sin(a), 0, Math.cos(a));
      const L = leaf(body, out.clone().multiplyScalar(0.07).setY(1.77), out.clone().setY(dy + 0.15), out.clone().setY(dy - 0.35), size, mat, LEAF, new V3(0, -1, 0), out.clone().setY(-0.25));
      L.mesh.castShadow = false; collar.push(L);
    }

    /* ---------- the skirt of long leaves ---------- */
    const skirt = [];
    for (let i = 0; i < 13; i++) {
      const up = i < 7, n = up ? 7 : 6, a = ((up ? i : i - 7) / n) * TAU + (up ? 0.2 : 0.65), out = new V3(Math.sin(a), 0, Math.cos(a));
      const size = up ? 0.72 : 0.52;
      const L = leaf(body, out.clone().multiplyScalar(up ? 0.17 : 0.16).setY(up ? 0.8 : 0.48), out.clone().setY(up ? -0.55 : -0.3), out.clone().setY(up ? -0.9 : -0.6),
        size, i % 2 ? leafMat2 : leafMat, SKIRT, out, out.clone().multiplyScalar(0.25).setY(-1));
      skirt.push(L);
    }

    /* ---------- roots ---------- */
    {
      const parts = [], rand = kit.R;
      for (let i = 0; i < 19; i++) {
        const a0 = (i / 19) * TAU + rr(-0.1, 0.1), len = rr(0.6, 0.98), w = rr(0.026, 0.04);
        const pts = [];
        for (let k = 0; k <= 7; k++) {
          const f = k / 7, a = a0 + Math.sin(f * 4.2 + i) * 0.13 * f, r = 0.2 + len * f;
          pts.push(new V3(Math.sin(a) * r, lerp(0.16, 0.012, Math.sqrt(f)) + Math.sin(f * 9 + i) * 0.01 * f, Math.cos(a) * r));
        }
        parts.push(taperTube(pts, w, 0.006, { segs: 20, radial: 6 }));
        for (let b = 0; b < 2; b++) {          // side rootlets
          const f0 = rr(0.3, 0.7), j = Math.floor(f0 * 7), p0 = pts[j], side = rand() < 0.5 ? -1 : 1;
          const da = side * rr(0.3, 0.6), r0 = Math.hypot(p0.x, p0.z), bl = rr(0.18, 0.32);
          const bp = [];
          for (let k = 0; k <= 4; k++) {
            const f = k / 4, a = Math.atan2(p0.x, p0.z) + da * f + Math.sin(f * 5 + b) * 0.08, r = r0 + bl * f;
            bp.push(new V3(Math.sin(a) * r, lerp(p0.y, 0.01, f), Math.cos(a) * r));
          }
          parts.push(taperTube(bp, w * 0.45, 0.004, { segs: 9, radial: 5 }));
        }
      }
      const roots = new THREE.Mesh(mergeGeometries(parts), rootMat); roots.castShadow = true; gesta.add(roots);
    }
    // fallen petals on the ground
    {
      const pg = [];
      for (const [a, r, s] of [[-50, 0.92, 0.15], [-120, 0.8, 0.13], [70, 1.05, 0.14], [140, 0.85, 0.12], [20, 0.95, 0.11]]) {
        pg.push(PETAL_S.clone().scale(s, s, s).rotateX(-Math.PI / 2 + 0.08).rotateY(rr(0, TAU)).translate(Math.sin(a * DEG) * r, 0.014, Math.cos(a * DEG) * r));
      }
      gesta.add(new THREE.Mesh(mergeGeometries(pg), petalMat));
    }
    const fallP = new THREE.Mesh(PETAL_S, petalMat); fallP.visible = false; gesta.add(fallP);
    const fall = { phase: 'wait', t: 3, p: new V3(), v: new V3(), rot: 0 };

    /* ---------- head ---------- */
    const HA = 0.2, HB = 0.23, HC = 0.19;
    const neck = new THREE.Group(); neck.position.set(0, 1.86, 0); body.add(neck);
    const head = new THREE.Group(); head.position.set(0, 0.26, 0.02); neck.add(head);
    {
      const g = new THREE.SphereGeometry(1, 34, 26).scale(HA, HB, HC), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0) p.setX(i, p.getX(i) * (1 - 0.22 * (y / HB) ** 2)); }
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, headMat); m.castShadow = true; head.add(m);
    }
    const surfZ = (x, y) => HC * Math.sqrt(Math.max(1e-4, 1 - (x / HA) ** 2 - (y / HB) ** 2));
    // forehead speckles
    head.add(new THREE.Mesh(mergeGeometries([[0, 0.142, 0.015, 1.4], [-0.032, 0.124, 0.007], [0.032, 0.124, 0.007], [-0.058, 0.112, 0.006], [0.058, 0.11, 0.006],
      [-0.016, 0.106, 0.0055], [0.018, 0.108, 0.0055], [0, 0.12, 0.006], [-0.044, 0.1, 0.0045], [0.046, 0.098, 0.0045]]
      .map(([x, y, r, sy = 1]) => new THREE.SphereGeometry(r, 8, 6).scale(1, sy, 0.6).translate(x, y, surfZ(x, y) - r * 0.1))), spotMat));
    // temples: a purple throb
    let flush;
    {
      const gs = [];
      for (const s of [-1, 1]) {
        const g = new THREE.PlaneGeometry(0.07, 0.075, 6, 6), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = s * 0.15 + p.getX(i), y = 0.055 + p.getY(i); p.setXYZ(i, x, y, surfZ(x, y) + 0.004); }
        gs.push(g);
      }
      head.add(flush = new THREE.Mesh(mergeGeometries(gs), flushMat));
    }
    const rig = face(head, {
      a: HA, b: HB, c: HC,
      eyes: { x: 0.083, y: -0.008, r: 0.056, iris: '#6c4c8c', lid: '#93a46c', lashes: true },
      brows: { y: 0.082, len: 0.044, r: 0.0055, color: '#54405e' },
      mouth: { y: -0.118, inside: '#7c3a52', lip: '#4a2c3e' },
      blush: { color: '236,128,148', x: 0.122, y: -0.068, w: 0.09, h: 0.06 },
      sickE: { lid: 0.8, low: 0.14, brow: 0.6, browY: 0.004, smile: -0.55, open: 0, w: 0.036 },
      wellE: { lid: 1, low: 0.32, brow: -0.05, browY: 0.01, smile: 0.95, open: 0.18, w: 0.062 },
      wrongE: { lid: 0.42, low: 0.55, brow: 0.9, browY: -0.004, smile: -1, open: 0.4, w: 0.05 },
      rightE: { lid: 1, low: 0.4, brow: 0.25, browY: 0.008, smile: 0.45, open: 0.1, w: 0.05 },
    });

    // the petal bob: a scalloped petal cap over her crown, big petals hanging
    // round her head to the jaw with tips flaring out, three rising on top
    {
      const g = new THREE.SphereGeometry(1, 36, 10, 0, TAU, 0, 0.37 * Math.PI), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), edge = sstep(0.55, 0.42, y), ph = Math.atan2(x, z);
        const k = 1 + edge * 0.06 * Math.abs(Math.sin(ph * 4.5));
        p.setXYZ(i, x * k, y - edge * 0.07 * (1 - Math.abs(Math.sin(ph * 4.5))), z * k);
      }
      g.scale(HA * 1.07, HB * 1.07, HC * 1.1); g.computeVertexNormals();
      const cap = new THREE.Mesh(g, petalMat); cap.rotation.x = -0.32; cap.position.set(0, 0.004, -0.004); head.add(cap);
    }
    const petals = [];
    for (const [az, size] of [[78, 0.43], [-80, 0.44], [112, 0.45], [-112, 0.45], [146, 0.43], [-146, 0.43], [180, 0.4]]) {
      const a = az * DEG, out = new V3(Math.sin(a), 0, Math.cos(a));
      const L = leaf(head, out.clone().multiplyScalar(0.17).setY(0.09).add(new V3(0, 0, -0.03)), out.clone().multiplyScalar(0.95).setY(-1), out.clone().multiplyScalar(0.5).setY(-1),
        size, petalMat, HAIR, out, out.clone().setY(-0.15));
      L.flutter = 0.6; L.mesh.castShadow = false; petals.push(L);
    }
    for (const [az, size, up] of [[46, 0.5, 2.6], [-40, 0.42, 1.8], [175, 0.4, 1.6]]) {
      const a = az * DEG, out = new V3(Math.sin(a), 0, Math.cos(a));
      const L = leaf(head, out.clone().multiplyScalar(0.06).setY(0.19).add(new V3(0, 0, -0.04)), out.clone().setY(up), out.clone().setY(up * 0.75),
        size, petalMat, TOPP, out.clone().setY(-0.7), out.clone().setY(up * 1.6));
      L.flutter = 0.7; L.mesh.castShadow = false; petals.push(L);
    }
    // three curly stamens
    const stamens = [];
    for (const [lean, h, curl] of [[0, 0.32, -1], [-0.42, 0.26, -1], [0.42, 0.24, 1]]) {
      const g = new THREE.Group(); g.position.set(0, 0.2, -0.02); g.rotation.z = -lean; head.add(g);
      const pts = [new V3(0, 0, 0), new V3(0.01 * curl, h * 0.45, 0), new V3(-0.015 * curl, h * 0.8, 0), new V3(0.01 * curl, h, 0),
        new V3(0.05 * curl, h + 0.035, 0), new V3(0.075 * curl, h + 0.005, 0), new V3(0.06 * curl, h - 0.02, 0)];
      const tip = pts[pts.length - 1];
      const m = new THREE.Mesh(mergeGeometries([taperTube(pts, 0.009, 0.006, { segs: 30, radial: 6 }), new THREE.SphereGeometry(0.02, 12, 10).translate(tip.x, tip.y, tip.z)]), petalMat);
      g.add(m); stamens.push({ g, lean, ph: rr(0, TAU) });
    }

    /* ---------- motion ---------- */
    const needleS = new Spring(70, 9, 162);
    const twitchS = new Spring(260, 11);
    const bloomS = new Spring(90, 9);
    let nextTwitch = 1.2, glance = null, nextGlance = 2.2, bloomed = false;
    const tmp = new V3();
    const centre = () => win.localToWorld(new V3(0, 0, 0.06));

    return {
      centre,
      anchor: () => head.localToWorld(new V3(0.34, 0.3, 0)),
      react(type) {
        const g = gauge.localToWorld(new V3(0, 0, 0.05));
        if (type === 'wrong') {
          needleS.kick(260);
          for (let i = 0; i < 12; i++) spark.emit(g.clone().add(randDir().multiplyScalar(0.08)), { v: randDir().multiplyScalar(rnd(0.4, 0.9)), life: rnd(0.4, 0.7), s0: 0.08, s1: 0, color: '#ff6a8a', drag: 2 });
          glance = { t: 0, dur: 1.4 };
        } else {
          needleS.kick(-90);
          for (let i = 0; i < 8; i++) { const d = randDir(); spark.emit(g.clone().addScaledVector(d, 0.12), { v: d.multiplyScalar(0.35), life: 0.8, s0: 0.07, s1: 0.02, color: '#b6ffd2', drag: 1.6 }); }
        }
      },
      burst() {
        bloomed = true; glance = null;
        const g = gauge.localToWorld(new V3(0, 0, 0.05));
        for (let i = 0; i < 30; i++) spark.emit(g, { v: randDir().multiplyScalar(rnd(0.5, 1.3)), life: rnd(0.8, 1.4), s0: 0.09, s1: 0.01, color: ['#f6b6ee', '#ffe28a', '#ffffff'][i % 3], g: -0.6, drag: 1.8 });
        const c = head.localToWorld(new V3(0, 0.15, 0));
        for (let i = 0; i < 24; i++) { const d = randDir(); d.y = Math.abs(d.y); spark.emit(c.clone().addScaledVector(d, 0.3), { v: d.multiplyScalar(rnd(0.6, 1.2)), life: rnd(1, 1.6), s0: 0.1, s1: 0.02, color: '#e6a6ff', g: -0.4, drag: 1.4 }); }
      },
      reset() { bloomed = false; glance = null; fall.phase = 'wait'; fall.t = 3; fallP.visible = false; needleS.set(162); },
      update(s) {
        const { t, dt, h, hp, sick, heal } = s;
        const wrongW = s.react?.type === 'wrong' ? s.react.w : 0;
        const rightW = s.react?.type === 'right' ? s.react.w : 0;
        kit.leafFold = clamp(Math.max(s.k.flinch.x, wrongW * 0.85), 0, 1);

        /* colour */
        P.mix(skinMat, 'skin', h); P.mix(headMat, 'skin', h); P.mix(rig.lidMat, 'skin', h);
        P.mix(leafMat, 'leaf', h); P.mix(leafMat2, 'leaf2', h); P.mix(petalMat, 'petal', h);
        P.mix(rootMat, 'root', h); P.mix(glowMat, 'glow', h); P.mix(spotMat, 'spot', h);
        const beat = heartbeat(t, lerp(1.35, 1.0, h)) * M;
        glowMat.emissiveIntensity = 0.26 + 0.08 * Math.sin(t * 1.4) * M + 0.25 * h + heal.glow * 0.4;
        babyMat.emissiveIntensity = 0.14 + 0.1 * h + heal.glow * 0.3;
        petalMat.emissive.set('#ffffff').multiplyScalar(heal.glow * 0.18);
        flush.visible = flushMat.opacity > 0.005;
        flushMat.opacity = clamp(sick * (0.16 + 0.34 * beat) + wrongW * 0.55, 0, 0.85) * (heal.on ? 1 - heal.gather : 1);

        /* the pump cycle: squeeze the bulb, the cuff swells, the needle jumps */
        const pf = (t % 4.6) / 4.6, amp = Math.pow(sick, 0.7) * M;
        const squeeze = (Math.exp(-(((pf - 0.05) / 0.03) ** 2)) + Math.exp(-(((pf - 0.15) / 0.03) ** 2))) * amp;
        const inflate = sstep(0.03, 0.22, pf) * (1 - sstep(0.3, 0.95, pf)) * amp;
        nextTwitch -= dt;
        if (nextTwitch <= 0) { twitchS.kick(rnd(18, 34) * sick * M); nextTwitch = rnd(0.9, 2.2); }
        twitchS.step(dt);

        /* the needle */
        const bloom = clamp(Math.max(sstep(0.86, 1, h), bloomed ? 1 : 0), 0, 1);
        bloomS.target = bloom; bloomS.step(dt);
        const pres = lerp(162, 114, h) + inflate * 7 + beat * 3 * sick + twitchS.x + Math.sin(t * 23) * 0.8 * sick * M + wrongW * 34 - rightW * 6;
        needleS.target = pres; needleS.step(dt);
        const nv = clamp(needleS.x, 78, 222);
        needle.rotation.z = -(-135 + 270 * (nv - 80) / 140) * DEG;

        /* cuff, bulb */
        const cb = clamp(bloomS.x, 0, 1.2);
        const cs = 1 + inflate * 0.12 + beat * 0.03 * sick + wrongW * (0.22 + 0.06 * Math.sin(t * 30));
        const off = sstep(0, 0.7, cb), gone = sstep(0.45, 1, cb);
        cuff.scale.set(cs * (1 + off * 0.25), 1 - off * 0.1, cs * (1 + off * 0.25));
        cuffG.position.copy(cuffAt).addScaledVector(cuffDir, off * 0.1);
        cuffG.scale.setScalar(Math.max(1e-4, 1 - gone));
        const sq = clamp(squeeze * 0.28 + wrongW * 0.3 * (0.5 + 0.5 * Math.sin(t * 20)), 0, 0.45);
        bulb.scale.set(0.06 * (1 + sq * 0.6), 0.085 * (1 - sq), 0.06 * (1 + sq * 0.6));
        bulbG.rotation.set(Math.sin(t * 1.1 + 0.6) * 0.06 * M, 0, Math.sin(t * 1.3) * 0.08 * M + s.k.shake.x * 0.05 - squeeze * 0.06);
        bulbG.scale.setScalar(Math.max(1e-4, 1 - gone));
        tubeA.scale.setScalar(Math.max(1e-4, 1 - gone));
        tubeA.position.copy(STEM).multiplyScalar(gone);
        gauge.scale.setScalar(Math.max(1e-4, 1 - sstep(0.1, 0.6, cb)));
        gauge.rotation.z = Math.sin(t * 31) * 0.03 * wrongW;
        flower.scale.setScalar(Math.max(1e-4, cb > 0.3 ? backOut(clamp((cb - 0.3) / 0.7, 0, 1)) : 0));
        flower.rotation.z = Math.sin(t * 0.9) * 0.1 * M;
        flower.visible = cb > 0.3; gauge.visible = cb < 0.6; cuffG.visible = bulbG.visible = tubeA.visible = gone < 0.999;

        /* the glance at the gauge */
        nextGlance -= dt;
        if (nextGlance <= 0) { if (!glance && !heal.on && sick > 0.25 && !s.react) glance = { t: 0, dur: 2.1 }; nextGlance = rnd(4, 6.5); }
        let gl = 0;
        if (glance) {
          glance.t += dt;
          gl = sstep(0, 0.35, glance.t) * (1 - sstep(glance.dur - 0.45, glance.dur, glance.t));
          rig.wander = { x: 0.42, y: 0.28 }; rig.nextLook = 0.3;
          if (glance.t > glance.dur) { glance = null; rig.nextLook = 0; }
        }
        rig.over({ brow: 0.8, smile: -0.7 }, gl * sick * 0.7);

        /* body: breath, sway, posture */
        const fl = s.k.flinch.x, bob = s.k.bounce.x, breath = Math.sin(t * 1.25) * M;
        torso.rotation.set(lerp(0.05, -0.01, hp) - fl * 0.05 + bloom * 0.0, s.k.spin.x * 0.06, Math.sin(t * 0.55) * 0.02 * M + s.k.shake.x * 0.025);
        torso.position.y = PIV + bob * 0.025 - fl * 0.012;
        trunk.scale.set(1 + breath * 0.006, 1, 1 + breath * 0.006);
        const bs = 1 + breath * 0.012;
        bellyG.scale.set(bs, 1 + breath * 0.006, bs);
        neck.rotation.set(lerp(0.12, 0.02, hp) + gl * 0.1 + bloom * 0.1 + fl * 0.12, gl * 0.42 + Math.sin(t * 0.4) * 0.04 * M - bloom * 0.12, lerp(-0.13, -0.03, hp) + Math.sin(t * 0.7) * 0.02 * M - gl * 0.05);
        const throb = 1 + beat * 0.006 * sick;
        head.scale.setScalar(throb);
        armR.rotation.set(-wrongW * 0.08, 0, Math.sin(t * 0.8) * 0.025 * M - gl * 0.04 + rightW * 0.04 - cb * 0.1);

        /* petals droop when sick, flare on a wrong card, lift when healed */
        for (const L of petals) { L.droop = sick * 0.12 + beat * 0.02 * sick; L.mesh.scale.setScalar(L.size * (1 + 0.08 * cb)); }
        for (const L of collar) L.droop = sick * 0.08;
        for (const st of stamens) st.g.rotation.set(Math.sin(t * 1.3 + st.ph) * 0.08 * M, 0, -st.lean * lerp(1.25, 1, h) + Math.sin(t * 1.1 + st.ph) * 0.1 * M + wrongW * 0.3 * Math.sin(t * 25 + st.ph));

        /* a petal now and then lets go while she is unwell */
        if (fall.phase === 'wait') {
          fall.t -= dt;
          if (fall.t <= 0) {
            if (sick > 0.4 && !heal.on && !REDUCE) {
              fall.phase = 'fall'; fall.t = 0;
              const az = rnd(0.9, 2.2) * (Math.random() < 0.5 ? -1 : 1);
              fall.p.copy(gesta.worldToLocal(head.localToWorld(new V3(Math.sin(az) * 0.32, -0.12, Math.cos(az) * 0.32))));
              fall.v.set(Math.sin(az) * 0.15, -0.28, Math.cos(az) * 0.15); fall.rot = rnd(0, TAU);
              fallP.visible = true;
            } else fall.t = rnd(2, 4);
          }
        } else if (fall.phase === 'fall') {
          fall.t += dt;
          fall.p.addScaledVector(fall.v, dt); fall.p.x += Math.sin(fall.t * 3.2) * 0.25 * dt;
          fallP.position.copy(fall.p); fallP.scale.setScalar(0.13);
          fallP.rotation.set(Math.sin(fall.t * 2.6) * 0.9 - 0.6, fall.rot + fall.t * 1.3, Math.cos(fall.t * 2.1) * 0.6);
          if (fall.p.y <= 0.02) { fall.phase = 'rest'; fall.t = 0; fall.p.y = 0.02; fallP.rotation.set(-Math.PI / 2 + 0.1, 0, fall.rot); }
        } else {
          fall.t += dt;
          fallP.scale.setScalar(0.13 * (1 - sstep(1.4, 2.2, fall.t)) + 1e-4);
          if (fall.t > 2.2) { fall.phase = 'wait'; fall.t = rnd(5, 8); fallP.visible = false; }
        }
        if (heal.on && fall.phase !== 'wait') { fall.phase = 'wait'; fall.t = 6; fallP.visible = false; }
        if (h > 0.9 && Math.random() < dt * 1.2 * M) {
          const a = rnd(0, TAU);
          wisp.emit(head.localToWorld(tmp.set(Math.sin(a) * 0.3, 0.15, Math.cos(a) * 0.3)), { v: new V3(0, rnd(0.1, 0.2), 0), life: 2, s0: 0.06, s1: 0.1, color: '#f0d6ff', a: 0.25 });
        }
      },
    };
  },
};
