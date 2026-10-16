/* 1. Mastitis: the Mastitis Sprite.
   From her slide (refs/p14_0.jpg): a mauve teardrop bulb glowing hot orange
   from inside, red-veined leaves, three swollen berries on top, two lower
   leaves dragged down by dark maroon masses, four gnarled root-legs with red
   nodules. Bold near-black ink. No face: it acts with its whole body.
   Healed (my addition, from her doc calling it "the rose"): the heat goes
   out, the swellings shrink, and a rose opens on top. */

export default {
  id: 'mastitis',
  look: { ink: '#1c1214', bands: [86, 152, 214, 255], outline: 0.005, rune: ['#ff9a5c', '#8fe0b4'], bg: ['#24493b', '#11291e', '#050c08'] },
  frame: { halfH: 1.5, halfW: 1.75, lookY: 1.22 },
  careTitle: 'Soothe the sprite',
  lines: {},
  shows: [
    '<b>A core glowing hot</b>, red-flushed veins: red, warm and swollen.',
    '<b>A throbbing pulse</b> through the glow and the lumps: pain.',
    '<b>Heavy masses</b> dragging the leaves down: a firm, tender area.',
    '<b>Heat rising off it, fits of shivering</b>: fever and chills.',
    '<b>Milky sap dripping</b>: milk that is not flowing.',
  ],
  healedNote: 'Healed, the heat cools, the swelling goes down, and it blooms into a rose, as her document calls it.',

  build(kit) {
    const { THREE, world, scene, toon, noOutline, canvasTex, sheet, limb, lumpGeo, addLeaf, palette, Spring, solveChain,
      spark, wisp, heartbeat, randDir, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, V3, TAU, DEG, UP, mergeGeometries, tex } = kit;

    const heatLight = new THREE.PointLight('#ff8a3c', 0, 3.2, 1.8);   // the fever lights its own leaves
    scene.add(heatLight);

    const P = palette({
      bulb: ['#8e5f93', '#d9a6c8'], leaf: ['#5f8a45', '#4f9a49'], leaf2: ['#6b9450', '#62ad55'],
      lump: ['#6a2034', '#5b3a8a'], nod: ['#b8324a', '#7a5a3a'],
    });

    /* ---------- materials ---------- */
    const leafMask = canvasTex(128, 256, (x, w, h) => {      // red = veins, green = a flush toward the edges
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      const g = x.createRadialGradient(w / 2, h * 0.55, w * 0.1, w / 2, h * 0.55, w * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,255,0,1)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#f00'; x.lineCap = 'round';
      x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 6); x.stroke();
      x.lineWidth = 2;
      for (let i = 1; i <= 8; i++) {
        const y = h - i * h / 9.2;
        for (const s of [-1, 1]) {
          x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w / 2 + s * w * 0.2, y - h * 0.04, w / 2 + s * w * 0.45, y - h * 0.12); x.stroke();
          x.lineWidth = 1; x.beginPath(); x.moveTo(w / 2 + s * w * 0.22, y - h * 0.05); x.lineTo(w / 2 + s * w * 0.3, y - h * 0.01); x.stroke(); x.lineWidth = 2;
        }
      }
    }, { srgb: false });

    // the bulb glows from inside, brightest facing you and low down, like heat through skin
    const bulbU = { uHeat: { value: 1 }, uHot: { value: new THREE.Color('#ff6a28') }, uCore: { value: new THREE.Color('#ffd06a') } };
    const bulbMat = toon('#8e5f93', { thickness: 0.0055 });
    bulbMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, bulbU);
      sh.vertexShader = 'varying float vHY;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vHY = position.y;');
      sh.fragmentShader = 'uniform float uHeat;\nuniform vec3 uHot;\nuniform vec3 uCore;\nvarying float vHY;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float facing = clamp( dot( normalize( normal ), normalize( vViewPosition ) ), 0.0, 1.0 );
        float low = 1.0 - smoothstep( 0.3, 0.88, vHY );
        float g = pow( facing, 3.2 ) * ( 0.15 + 0.85 * low ) * uHeat;
        totalEmissiveRadiance += mix( uHot, uCore, smoothstep( 0.55, 0.98, pow( facing, 4.0 ) * low ) ) * g * 0.62;`);
    };
    const leafU = { uHeat: { value: 1 }, uVeinCool: { value: new THREE.Color('#cfe3a8') }, uVeinHot: { value: new THREE.Color('#c42e3c') }, uFlush: { value: new THREE.Color('#a8483a') } };
    function leafMaterial(col) {
      const m = toon(col, { map: leafMask, side: THREE.DoubleSide, thickness: 0.0042 });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, leafU);
        sh.fragmentShader = 'uniform float uHeat;\nuniform vec3 uVeinCool;\nuniform vec3 uVeinHot;\nuniform vec3 uFlush;\n' + sh.fragmentShader.replace('#include <map_fragment>', `
          vec4 lm = texture2D( map, vMapUv );
          diffuseColor.rgb = mix( diffuseColor.rgb, uFlush, lm.g * uHeat * 0.28 );
          diffuseColor.rgb = mix( diffuseColor.rgb, mix( uVeinCool, uVeinHot, uHeat ), lm.r * 0.85 );`);
      };
      return m;
    }
    const leafMat = leafMaterial('#5f8a45'), leafMat2 = leafMaterial('#6b9450');
    const woodMat = toon('#76704a', { map: tex.bark, thickness: 0.005 });
    const stemMat = toon('#6f7a46', { thickness: 0.0035 });
    const lumpMat = toon('#6a2034', { thickness: 0.0045, emissive: '#ff4030', emissiveIntensity: 0 });
    const nodMat = toon('#b8324a', { thickness: 0.0032, emissive: '#ff3020', emissiveIntensity: 0 });
    const dripMat = toon('#f2b49c', { thickness: 0.003, transparent: true });
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ color: '#f4b8c4' }));
    const petalIn = toon('#d8436a', { side: THREE.DoubleSide, thickness: 0.003 });
    const petalOut = toon('#f290aa', { side: THREE.DoubleSide, thickness: 0.003 });

    const LEAF = sheet({ width: 0.36, cup: 0.12, curl: 0.2, point: 0.75, rows: 14 });
    const SEPAL = sheet({ width: 0.34, cup: 0.22, curl: 0.3, tipPinch: 0.5 });
    const PETAL = sheet({ width: 0.95, cup: 0.32, curl: 0.18, tipPinch: -0.45, cols: 8, rows: 8, point: 0.35 });

    /* ---------- the sprite ---------- */
    const sprite = new THREE.Group(); world.add(sprite);
    const BODY_Y = 0.84;
    const body = new THREE.Group(); body.position.y = BODY_Y; sprite.add(body);

    const bulbProfile = [
      [0, 0], [0.15, 0.012], [0.29, 0.065], [0.39, 0.16], [0.44, 0.28], [0.45, 0.4], [0.415, 0.53],
      [0.34, 0.66], [0.245, 0.77], [0.16, 0.86], [0.105, 0.93], [0.07, 0.97], [0, 0.985],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const bulbGeo = new THREE.LatheGeometry(bulbProfile, 48);
    { const p = bulbGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z);
        const k = 1 + 0.035 * Math.max(0, Math.sin(a * 5 + 0.4)) * (1 - sstep(0.12, 0.45, y)) * sstep(0, 0.08, y);
        p.setX(i, x * k); p.setZ(i, z * k);
      }
      bulbGeo.computeVertexNormals(); }
    const bulb = new THREE.Mesh(bulbGeo, bulbMat); bulb.castShadow = true;
    const bulbPivot = new THREE.Group(); bulbPivot.add(bulb); body.add(bulbPivot);
    const bulbR = (y) => {
      for (let i = 1; i < bulbProfile.length; i++) { const a = bulbProfile[i - 1], b = bulbProfile[i]; if (y <= b.y) return lerp(a.x, b.x, (y - a.y) / (b.y - a.y || 1)); }
      return 0;
    };

    // milky drips on the bulb, and one drop that falls
    const drips = [];
    for (const [az, y, s] of [[0.15, 0.2, 1], [-0.55, 0.14, 0.85], [0.75, 0.16, 0.9], [-1.2, 0.24, 0.8], [1.35, 0.27, 0.75], [0.4, 0.07, 0.7], [-0.15, 0.31, 0.65], [2.6, 0.2, 0.8], [-2.4, 0.18, 0.8]]) {
      const r = bulbR(y);
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), dripMat);
      m.position.set(Math.sin(az) * (r + 0.005), y - 0.035, Math.cos(az) * (r + 0.005));
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), shineMat); shine.position.set(-0.35, 0.35, 0.75); m.add(shine);
      bulb.add(m); drips.push({ m, s });
    }
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), dripMat);
    drop.visible = false; world.add(drop);
    const drip = { t: 0.5, phase: 'grow', y: 0, v: 0, splat: 0 };

    // the red-veined calyx
    const TOP_Y = 0.95;
    for (let i = 0; i < 6; i++) {
      const az = (i / 6) * TAU + 0.3, out = new V3(Math.sin(az), 0, Math.cos(az));
      addLeaf(body, out.clone().multiplyScalar(0.06).setY(TOP_Y - 0.06), out.clone().add(new V3(0, 0.45, 0)), out.clone().add(new V3(0, -0.1, 0)),
        rr(0.3, 0.38), i % 2 ? leafMat : leafMat2, SEPAL, out.clone().multiplyScalar(0.3).add(new V3(0, 1, 0)));
    }

    // lumps: the inflamed masses and the small swollen berries
    const lumps = [];
    function addLump(parent, at, parts, size, kind = 'berry') {
      const g = new THREE.Group(); g.position.copy(at); parent.add(g);
      const m = new THREE.Mesh(lumpGeo(parts), lumpMat); m.castShadow = true; g.add(m);
      for (const [x, y, z, r] of parts.slice(0, 3)) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 10, 6), shineMat);
        s.position.set(x - r * 0.35, y + r * 0.4, z + r * 0.75); s.scale.z = 0.4; g.add(s);
      }
      lumps.push({ g, size, kind, ph: rr(0, 1) });
      return g;
    }
    const tops = [];
    for (const [dx, dz, len, r, bend] of [[0.02, -0.06, 0.46, 0.13, 0.12], [-0.2, 0.04, 0.34, 0.1, -0.25], [0.22, 0.06, 0.3, 0.08, 0.3]]) {
      const curve = new THREE.QuadraticBezierCurve3(new V3(0, 0, 0), new V3(dx * 0.4 + bend * 0.1, len * 0.6, dz * 0.4), new V3(dx, len, dz));
      const g = new THREE.Group(); g.position.set(0, TOP_Y - 0.03, 0); body.add(g);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.02, 6), stemMat));
      addLump(g, new V3(dx, len + r * 0.8, dz), [[0, 0, 0, r], [r * 0.55, r * 0.25, r * 0.4, r * 0.45], [-r * 0.45, -r * 0.3, r * 0.45, r * 0.38]], r);
      tops.push({ g, ph: rr(0, TAU) });
    }
    // the four big leaves: two reaching up, two dragged down by the masses on their tips
    const heavy = [];
    for (const side of [-1, 1]) {
      const at = new V3(side * 0.05, TOP_Y - 0.08, 0);
      addLeaf(body, at, new V3(side * 0.75, 0.8, 0.05), new V3(side * 0.85, 0.6, 0.05), 0.78, side > 0 ? leafMat : leafMat2, LEAF, new V3(side * 0.15, 1, 0.5));
      const low = addLeaf(body, at.clone().setY(TOP_Y - 0.12), new V3(side, 0.42, 0.18), new V3(side, -0.45, 0.22), 0.86, side > 0 ? leafMat2 : leafMat, LEAF, new V3(side * 0.3, 0.3, 1));
      heavy.push(low);
      const mass = addLump(low.mesh, new V3(0, 0.95, 0.06), [[0, 0, 0, 0.19], [0.14, 0.09, 0.08, 0.13], [-0.12, -0.07, 0.1, 0.14], [0.05, -0.15, -0.06, 0.12]], 1, 'mass');
      mass.scale.setScalar(1 / 0.86);
    }

    // the rose, which only opens when healed
    const rose = new THREE.Group(); rose.position.set(0, TOP_Y + 0.1, 0); rose.scale.setScalar(1e-4); body.add(rose);
    const rosePetals = [];
    for (const [n, size, open0, open1, mat, ring] of [[4, 0.24, 0.02, 0.2, petalIn, 0], [5, 0.32, 0.1, 0.5, petalIn, 1], [6, 0.4, 0.22, 0.9, petalOut, 2]]) {
      for (let i = 0; i < n; i++) {
        const arm = new THREE.Group(); arm.rotation.y = (i / n) * TAU + ring * 0.6; rose.add(arm);
        const p = new THREE.Mesh(PETAL, mat); p.scale.setScalar(size); p.position.z = 0.015 + ring * 0.035;
        arm.add(p); rosePetals.push({ p, open0, open1 });
      }
    }
    const roseS = new Spring(120, 8);

    // four gnarled root-legs, feet planted
    const NOD = new THREE.SphereGeometry(1, 14, 10);
    const legs = [];
    const LEGS = [
      { az: -100, dist: 1.28, hip: new V3(-0.36, 0.34, -0.04), len: 1.85, nb: 6, r0: 0.075, r1: 0.032, a: 0.55, c: 0.4 },
      { az: 100, dist: 1.28, hip: new V3(0.36, 0.34, -0.04), len: 1.85, nb: 6, r0: 0.075, r1: 0.032, a: 0.55, c: 0.4 },
      { az: -34, dist: 0.64, hip: new V3(-0.12, 0.07, 0.05), len: 1.12, nb: 5, r0: 0.09, r1: 0.036, a: -0.7, c: 0.1 },
      { az: 34, dist: 0.64, hip: new V3(0.12, 0.07, 0.05), len: 1.12, nb: 5, r0: 0.09, r1: 0.036, a: -0.7, c: 0.1 },
    ];
    const CLAW = (() => {
      const parts = [];
      for (const ang of [-55, -18, 18, 55]) {
        const d = new V3(Math.sin(ang * DEG), 0, Math.cos(ang * DEG));
        const curve = new THREE.CatmullRomCurve3([new V3(0, 0, 0), d.clone().multiplyScalar(0.1).setY(0.03), d.clone().multiplyScalar(0.21).setY(0), d.clone().multiplyScalar(0.28).setY(-0.05)]);
        parts.push(new THREE.TubeGeometry(curve, 12, 0.022, 6));
        parts.push(new THREE.ConeGeometry(0.022, 0.07, 6).rotateX(Math.PI / 2).translate(...d.clone().multiplyScalar(0.3).setY(-0.06).toArray()));
      }
      parts.push(new THREE.SphereGeometry(0.05, 12, 8));
      return mergeGeometries(parts.map((g) => g.toNonIndexed()));
    })();
    const nodules = [];
    for (const cfg of LEGS) {
      const L = limb({ len: cfg.len, r0: cfg.r0, r1: cfg.r1, bones: cfg.nb, mat: woodMat, gnarl: 0.1, cap: false });
      L.bones[0].rotation.order = 'YXZ';
      sprite.add(L.mesh);
      const foot = new THREE.Group(); foot.position.y = L.seg; L.bones[cfg.nb - 1].add(foot);
      const claw = new THREE.Mesh(CLAW, woodMat); claw.castShadow = true; foot.add(claw);
      for (let i = 1; i < cfg.nb - 1; i++) {
        if (R() < 0.75) {
          const n = new THREE.Mesh(NOD, nodMat), a = rr(0, TAU);
          n.position.set(Math.cos(a) * cfg.r0 * 0.75, rr(0.2, 0.8) * L.seg, Math.sin(a) * cfg.r0 * 0.75);
          L.bones[i].add(n); nodules.push({ n, r: rr(0.045, 0.065) });
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), shineMat); s.position.set(-0.3, 0.4, 0.75); n.add(s);
        }
      }
      const footAt = new V3(Math.sin(cfg.az * DEG) * cfg.dist, 0.05, Math.cos(cfg.az * DEG) * cfg.dist);
      legs.push({ ...cfg, L, foot, footAt, st: { a: cfg.a, c: cfg.c } });
    }

    /* ---------- motion ---------- */
    const lumpS = new Spring(80, 6, 1);      // the swelling goes down with a little wobble
    const flare = new Spring(60, 9);         // a spike of heat
    let chill = null, nextChill = 3.5;
    const bulbCentre = () => bulb.localToWorld(new V3(0, 0.38, 0));
    const tmpV = new V3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion();

    return {
      centre: bulbCentre,
      anchor: () => bulb.localToWorld(new V3(0.55, 0.85, 0)),
      react(type) {
        const c = bulbCentre();
        if (type === 'wrong') {                // it hurts: fold in, flare hot, hiss of steam
          flare.kick(5); chill = { t: 0, dur: 0.7, amp: 1.6 };
          for (let i = 0; i < 14; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.3)), { v: new V3(rnd(-0.3, 0.3), rnd(0.6, 1.1), rnd(-0.3, 0.3)), life: rnd(0.8, 1.3), s0: 0.18, s1: 0.5, color: '#ffd8c4', drag: 1.2, a: 0.5 });
        } else {
          for (let i = 0; i < 12; i++) { const d = randDir(); spark.emit(c.clone().addScaledVector(d, 0.5), { v: d.multiplyScalar(0.5), life: 0.9, s0: 0.09, s1: 0.02, color: '#bfe8ff', drag: 1.6 }); }
        }
      },
      burst() { chill = null; },
      reset() { chill = null; },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        const cool = heal.on ? (heal.burst ? heal.glow : heal.gather) : 0;
        kit.leafFold = clamp(s.k.flinch.x, 0, 1);
        lumpS.target = 1 - s.hTarget; lumpS.step(dt); flare.step(dt);

        /* heat: the throb, the flare, the cooling */
        const beat = heartbeat(t, lerp(1.25, 0.8, h)) * M;
        const heat = clamp(sick * (0.82 + 0.28 * beat) + Math.max(0, flare.x) * 0.25, 0, 1.6) * (1 - cool);
        bulbU.uHeat.value = heat;
        leafU.uHeat.value = clamp(sick * 1.05, 0, 1);
        P.mix(bulbMat, 'bulb', h);
        bulbMat.emissive.set('#cfe8ff').multiplyScalar(cool * 0.35);
        P.mix(leafMat, 'leaf', h); P.mix(leafMat2, 'leaf2', h);
        P.mix(lumpMat, 'lump', h); P.mix(nodMat, 'nod', h);
        lumpMat.emissiveIntensity = heat * 0.07; nodMat.emissiveIntensity = heat * 0.15;
        heatLight.intensity = heat * 0.9;
        heatLight.position.copy(bulbCentre()).add(tmpV.set(0, 0.1, 0.55));

        /* body: weight shifting from foot to foot, the chills */
        nextChill -= dt;
        if (nextChill <= 0) { if (!heal.on && sick > 0.3 && !REDUCE) chill = { t: 0, dur: 0.9, amp: 1 }; nextChill = rnd(4.5, 7.5); }
        let jx = 0, jz = 0;
        if (chill) {
          chill.t += dt;
          const k = Math.sin(Math.PI * clamp(chill.t / chill.dur, 0, 1)) * chill.amp * sick;
          jx = Math.sin(t * 150) * 0.012 * k; jz = Math.cos(t * 131) * 0.01 * k;
          if (chill.t > chill.dur) chill = null;
        }
        const shift = lerp(0.07, 0.05, h) * M, fl = s.k.flinch.x, bob = s.k.bounce.x;
        body.position.set(
          Math.sin(t * 0.55) * shift + jx + s.k.shake.x * 0.02,
          BODY_Y + Math.sin(t * lerp(1.0, 1.6, h)) * 0.018 * M + bob * 0.03 - fl * 0.02,
          Math.sin(t * 0.41 + 1) * shift * 0.5 + jz - fl * 0.05,
        );
        body.rotation.set(lerp(0.06, -0.02, h) - fl * 0.12, s.k.spin.x * 0.07, -Math.sin(t * 0.55) * 0.05 * M + s.k.shake.x * 0.03);
        const throb = 1 + beat * 0.018 * sick;
        bulbPivot.scale.set(throb, throb * (1 - bob * 0.015), throb);
        for (const L of kit.leaves) L.flutter = 1 + jx * 60;
        for (const L of heavy) L.droop = beat * 0.06 * sick;
        for (const tp of tops) tp.g.rotation.set(Math.sin(t * 1.1 + tp.ph) * 0.08 * M, 0, Math.cos(t * 0.9 + tp.ph) * 0.08 * M);

        /* swelling */
        const sw = clamp(lumpS.x, -0.2, 1.2);
        for (const l of lumps) {
          const base = l.kind === 'mass' ? lerp(0.32, 1, sw) : lerp(0.5, 1, sw);
          const pulse = 1 + heartbeat(t + l.ph * 0.05, lerp(1.25, 0.8, h)) * 0.06 * sick * M;
          l.g.scale.setScalar(Math.max(0.05, base * pulse) * (l.kind === 'mass' ? 1 / 0.86 : 1));
        }
        for (const n of nodules) n.n.scale.setScalar(Math.max(1e-4, n.r * clamp(sw, 0, 1.2) * (1 + beat * 0.08 * sick)));
        for (const d of drips) { const k = clamp(sw, 0, 1); d.m.scale.set(0.05 * d.s * k + 1e-4, 0.085 * d.s * k + 1e-4, 0.05 * d.s * k + 1e-4); }

        /* the rose */
        roseS.target = sstep(0.82, 1, h);
        const rb = Math.max(0, roseS.step(dt));
        rose.scale.setScalar(Math.max(1e-4, Math.min(rb, 1.15)));
        for (const rp of rosePetals) rp.p.rotation.x = lerp(rp.open0, rp.open1, clamp(rb, 0, 1.1));
        rose.rotation.y = Math.sin(t * 0.7) * 0.15 * M;

        /* legs: solve each root to its planted foot */
        for (const lg of legs) {
          const hip = tmpV.copy(lg.hip).applyEuler(body.rotation).add(body.position);
          lg.L.mesh.position.copy(hip);
          const dx = lg.footAt.x - hip.x, dz = lg.footAt.z - hip.z;
          solveChain(lg.st, Math.hypot(dx, dz), lg.footAt.y - hip.y, lg.nb, lg.L.seg);
          lg.az = Math.atan2(dx, dz);
          lg.L.bones[0].rotation.set(Math.PI / 2 - lg.st.a, lg.az, 0, 'YXZ');
          for (let i = 1; i < lg.nb; i++) lg.L.bones[i].rotation.set(lg.st.c, 0, Math.sin(t * 0.9 + i) * 0.01 * M);
        }
        world.updateMatrixWorld();
        for (const lg of legs) {                   // claws flat on the ground, pointing out
          lg.L.bones[lg.nb - 1].getWorldQuaternion(tmpQ).invert();
          tmpQ2.setFromAxisAngle(UP, lg.az).premultiply(world.quaternion);
          lg.foot.quaternion.copy(tmpQ).multiply(tmpQ2);
        }

        /* fever: heat rising off it */
        if (heat > 0.25 && Math.random() < dt * 7 * heat * M) {
          const a = rnd(0, TAU), y = rnd(0.25, 0.75), r = bulbR(y);
          wisp.emit(bulb.localToWorld(new V3(Math.sin(a) * r, y, Math.cos(a) * r)), { v: new V3(rnd(-0.08, 0.08), rnd(0.35, 0.6), rnd(-0.08, 0.08)), life: rnd(1.4, 2.2), s0: 0.12, s1: 0.42, color: '#ffe2cf', a: 0.22 });
        }

        /* the milk drip, falling from the bulb */
        if (sick > 0.35 || drip.phase !== 'grow') {
          drip.t += dt;
          if (drip.phase === 'grow') {
            const gp = world.worldToLocal(drips[0].m.localToWorld(new V3(0, -0.9, 0)));
            const k = clamp(drip.t / 1.6, 0, 1);
            drop.visible = k > 0.02 && sick > 0.35;
            drop.scale.set(k, k * (1 + k * 0.8), k);
            drop.position.set(gp.x, gp.y - 0.03 * k, gp.z);
            dripMat.opacity = 1;
            if (drip.t > 1.6) { drip.phase = 'fall'; drip.v = 0; drip.y = drop.position.y; }
          } else if (drip.phase === 'fall') {
            drip.v -= 9.8 * dt * 0.6; drip.y += drip.v * dt; drop.position.y = drip.y;
            drop.scale.set(0.85, 1.5, 0.85);
            if (drip.y <= 0.012) { drip.phase = 'splat'; drip.splat = 0; drop.position.y = 0.012; }
          } else {
            drip.splat += dt;
            const k = clamp(drip.splat / 0.5, 0, 1);
            drop.scale.set(1 + k, Math.max(0.05, 0.35 * (1 - k)), 1 + k);
            dripMat.opacity = 1 - k * 0.9;
            if (k >= 1) { drip.phase = 'grow'; drip.t = 0; drop.visible = false; dripMat.opacity = 1; }
          }
        } else drop.visible = false;
      },
    };
  },
};
