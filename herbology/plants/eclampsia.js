/* 7. Eclampsia: the Storm Clam.
   From her slide (refs/p19_1.jpg, "ECLAMPSIA"): the Pre-eclampsia Clam Plant
   in full storm. A big pale lilac-grey clam, wide open, with a violet-magenta
   orb inside throwing cyan lightning and pink vein cracks across the inner
   shell; two curling dark-blue horn tendrils behind; teal and purple seaweed
   fronds; a tangle of dark-blue tentacle roots over pale icy crystals; pink
   teardrops; three glowing icons (a pregnant silhouette, a broken heart with a
   heartbeat line, a stopwatch). Thick navy ink on a deep-blue night.
   It has no face: the storm is the character. A seizure every 6-8 s (a flicker
   of light first, then the shell clamps rigid, jerks, and slumps limp); the
   orb pulses fast and drifts dim in between.
   Healed (my addition, from her doc calling it "the orchid"): the storm
   passes, the orb cools into a calm pearl, the crystals glow aqua, the tears
   turn to bubbles and an orchid blooms on the shell's crest. */

export default {
  id: 'eclampsia',
  look: { ink: '#121838', bands: [78, 148, 210, 255], outline: 0.0056, rune: ['#b46cff', '#7fe6dc'], bg: ['#27478e', '#142a63', '#060d2b'] },
  frame: { halfH: 1.42, halfW: 1.44, lookY: 1.3 },
  careTitle: 'Calm the storm',
  lines: {
    sick: 'The storm is coming...',
    wrong: ['The storm breaks!', 'Lightning... again!', 'Too much thunder!'],
    right: ['The thunder softens...', 'Easier now...'],
    healed: 'Calm waters.',
  },
  shows: [
    '<b>A storm every few seconds</b>: the shell clamps rigid and shudders, the roots stiffen, then jerk in rhythm: a tonic-clonic seizure.',
    '<b>A limp slump after each storm</b>, the glow nearly out: the postictal state.',
    '<b>A flicker of light</b> just before each storm: headache or visual changes beforehand.',
    '<b>The orb dims and drifts</b> between storms: altered consciousness.',
    '<b>A fast, hard pulse</b> through the orb and its pink veins: severe hypertension.',
    '<b>A broken heart with a jumpy trace</b>: possible fetal heart rate abnormalities.',
  ],
  healedNote: 'Healed, the storm passes: the lightning fades, the orb cools into a calm pearl, the shell rests open, the crystals glow aqua, and an orchid blooms, as her document calls this plant.',

  build(kit) {
    const { THREE, world, scene, camera, toon, noOutline, canvasTex, sheet, limb, taperTube, palette, Spring, lights,
      spark, wisp, heartbeat, randDir, rnd, rr, R, M, clamp, lerp, sstep, V3, TAU, mergeGeometries, tex } = kit;

    /* ---------- night light: cool sky, deep-blue bounce, cyan rim ---------- */
    lights.hemi.color.set('#e6ecff'); lights.hemi.groundColor.set('#26306a'); lights.hemi.intensity = 1.2;
    lights.key.color.set('#f4f0ff'); lights.key.intensity = 2.2;
    lights.rim.color.set('#9fe8ff'); lights.rim.intensity = 1.6;
    lights.fill.color.set('#c8b8ff'); lights.fill.intensity = 0.6;
    lights.heal.color.set('#d8f4ff');
    const stormLight = new THREE.PointLight('#b060ff', 0, 3.4, 1.5);
    scene.add(stormLight);

    const P = palette({
      shell: ['#bdb5d8', '#ebe2f3'], rim: ['#e4e0f2', '#fff7fc'], inner: ['#d4ccf2', '#fff0fa'],
      tent: ['#2b4486', '#3d86aa'], weedA: ['#2f8a86', '#3dbf9e'], weedB: ['#5b47a2', '#9670d6'],
      crystal: ['#b6dcf4', '#b4f4ea'], drop: ['#e04c8c', '#a6eaf0'], dropB: ['#6cbcec', '#c4f4f4'],
      orb: ['#ffffff', '#cfc4ea'], glow: ['#c24cff', '#bfeeff'], light: ['#b060ff', '#bfe8ff'],
      cryGlow: ['#58c0ff', '#5ff0d8'],
    });

    /* =====================================================================
       Canvas painting helpers
       ===================================================================== */
    /** A branching crack or bolt, drawn from (px, py) heading ang. */
    function branch2d(x, px, py, ang, len, width, depth, jag, col, rand = R) {
      const n = 7, pts = [];
      let cx = px, cy = py;
      for (let k = 1; k <= n; k++) {
        const a = ang + (rand() - 0.5) * jag;
        cx += Math.cos(a) * len / n; cy += Math.sin(a) * len / n; pts.push([cx, cy]);
      }
      x.strokeStyle = col; x.shadowColor = col; x.lineWidth = width;
      x.beginPath(); x.moveTo(px, py); for (const [qx, qy] of pts) x.lineTo(qx, qy); x.stroke();
      if (depth > 0) for (let k = 1; k < n - 1; k++) if (rand() < 0.42) branch2d(x, pts[k][0], pts[k][1], ang + (rand() < 0.5 ? -1 : 1) * (0.35 + rand() * 0.6), len * 0.45, width * 0.62, depth - 1, jag, col, rand);
    }
    // the inner shell: a pale fan of ribs (colour), and a mask of what glows:
    // red = pink veins, green / blue = two sets of lightning that flicker in turn
    function innerBase(cx, cy) {
      return canvasTex(512, 512, (x, w, h) => {
        const g = x.createRadialGradient(cx, cy, 8, cx, cy, 340);
        g.addColorStop(0, '#d6c2ff'); g.addColorStop(0.25, '#a592ec'); g.addColorStop(0.65, '#8288d8'); g.addColorStop(1, '#98a6e6');
        x.fillStyle = g; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 17; i++) {
          const a = lerp(-1.42, 1.42, i / 16);
          x.strokeStyle = i % 2 ? 'rgba(255,255,255,.2)' : 'rgba(60,40,140,.13)'; x.lineWidth = i % 2 ? 16 : 9;
          x.beginPath(); x.moveTo(w / 2, h + 10); x.lineTo(w / 2 + Math.sin(a) * 760, h - Math.cos(a) * 760); x.stroke();
        }
        for (let i = 0; i < 220; i++) {
          x.fillStyle = `rgba(255,255,255,${rr(0.2, 0.75).toFixed(2)})`;
          x.beginPath(); x.arc(R() * w, R() * h, rr(0.8, 2.6), 0, TAU); x.fill();
        }
      });
    }
    function innerMask(cx, cy, a0, a1) {
      return canvasTex(512, 512, (x, w, h) => {
        x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
        x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round'; x.shadowBlur = 5;
        for (let i = 0; i < 9; i++) branch2d(x, cx, cy, lerp(a0, a1, (i + 0.5) / 9) + rr(-0.15, 0.15), rr(200, 330), 5, 1, 0.5, 'rgb(255,0,0)');
        for (let i = 0; i < 5; i++) branch2d(x, cx, cy, lerp(a0, a1, (i + 0.3) / 5) + rr(-0.2, 0.2), rr(230, 340), 4.4, 2, 1.0, 'rgb(0,255,0)');
        for (let i = 0; i < 5; i++) branch2d(x, cx, cy, lerp(a0, a1, (i + 0.75) / 5) + rr(-0.2, 0.2), rr(230, 340), 4.4, 2, 1.0, 'rgb(0,0,255)');
      }, { srgb: false });
    }

    /* =====================================================================
       The clam: two valves hinged at the back, mouth toward you
       ===================================================================== */
    const RX = 0.72, RZE = 0.48, ZC = 0.3, ZF = ZC + RZE, DEPTH = 0.27, HY = 1.2;
    /** A point on the lower valve in its own frame: the hinge is a straight
        line along x at z = 0, the mouth toward +z, the bowl hanging down. The
        plan is an ellipse (centre z = ZC) cut off by the hinge line, so the two
        valves meet along their back corners as in her drawing. a goes round the
        ellipse (0 = front lip), r runs centre to rim; layer 0 = outer skin
        (ribbed), 1 = inner face (smooth, a little in). */
    function valvePoint(a, r, layer, out) {
      const x = r * RX * Math.sin(a), z = Math.max(0, ZC + r * RZE * Math.cos(a));
      const rho2 = Math.min(1, (x / RX) ** 2 + ((z - ZC) / RZE) ** 2);
      const bowl = Math.sqrt(1 - rho2) * sstep(0, 0.24, z);
      const psi = Math.atan2(x, z + 0.18);                 // ribs fan out from the hinge
      const k = lerp(1 + 0.07 * Math.cos(12 * psi), 0.84, layer);
      return out.set(x, -DEPTH * bowl * k + 0.034 * Math.cos(9 * psi) * Math.min(r, 1) ** 4 * sstep(0.03, 0.2, z) + layer * 0.034 * (1 - sstep(0.82, 1, r)) * sstep(0.03, 0.14, z), z);
    }
    const A0 = -Math.PI, A1 = Math.PI, _hn = new V3(), _hb = new V3(0, -0.6, -1).normalize();
    function valveGeo(layer) {
      const C = 72, RN = 20, pos = [], uv = [], idx = [], v = new V3();
      for (let j = 0; j <= RN; j++) for (let i = 0; i <= C; i++) {
        valvePoint(lerp(A0, A1, i / C), j / RN, layer, v);
        pos.push(v.x, v.y, v.z); uv.push(0.5 + v.x / (2 * RX), v.z / ZF);
      }
      for (let j = 0; j < RN; j++) for (let i = 0; i < C; i++) {
        const p = j * (C + 1) + i, q = p + 1, s2 = p + C + 1, t2 = s2 + 1;
        idx.push(p, s2, q, q, s2, t2);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      // make sure the inner face looks up (into the bowl) and the outer one down
      const ny = g.attributes.normal.getY((RN >> 1) * (C + 1) + (C >> 1));
      if ((layer ? ny < 0 : ny > 0)) { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const tmp = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = tmp; } g.computeVertexNormals(); }
      // the outer skin folds flat along the hinge; point those normals back and away
      // so the ink shell is pushed behind the joint instead of across the mouth
      if (!layer) {
        const ps = g.attributes.position, ns = g.attributes.normal;
        for (let k = 0; k < ps.count; k++) {
          const w = 1 - sstep(0.02, 0.16, ps.getZ(k));
          if (w > 0) { _hn.set(ns.getX(k), ns.getY(k), ns.getZ(k)).lerp(_hb, w).normalize(); ns.setXYZ(k, _hn.x, _hn.y, _hn.z); }
        }
      }
      return g;
    }
    // the white lip runs round the mouth only, not along the hinge
    const aH = Math.acos(-ZC / RZE) - 0.02, rimPts = [];
    for (let i = 0; i <= 80; i++) rimPts.push(valvePoint(lerp(-aH, aH, i / 80), 1, 0.5, new V3()));
    const RIM = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts), 110, 0.03, 6, false);

    // the two inner faces glow from the orb outward: each gets its own centre
    const SH = { vein: { value: new THREE.Color() }, boltA: { value: new THREE.Color() }, boltB: { value: new THREE.Color() }, core: { value: new THREE.Color() } };
    function innerMaterial(cu, cv, a0, a1) {
      const cx = cu * 512, cy = (1 - cv) * 512;
      const m = toon('#ffffff', { map: innerBase(cx, cy), thickness: 0 });
      const U = { uMask: { value: innerMask(cx, cy, a0, a1) }, uC: { value: new THREE.Vector2(cu, cv) }, uVein: SH.vein, uBoltA: SH.boltA, uBoltB: SH.boltB, uCore: SH.core };
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.fragmentShader = 'uniform sampler2D uMask;\nuniform vec2 uC;\nuniform vec3 uVein;\nuniform vec3 uBoltA;\nuniform vec3 uBoltB;\nuniform vec3 uCore;\n' +
          sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          vec3 mk = texture2D( uMask, vMapUv ).rgb;
          vec2 dc = ( vMapUv - uC ) * vec2( 1.0, 0.64 );
          totalEmissiveRadiance += uVein * mk.r + uBoltA * mk.g + uBoltB * mk.b + uCore * exp( -dot( dc, dc ) * 30.0 );`);
      };
      return m;
    }

    const shellMat = toon('#bdb5d8', { thickness: 0.0062 });
    const rimMat = toon('#e4e0f2', { thickness: 0.005 });
    const innerLo = innerMaterial(0.5, 0.4, 0, TAU), innerUp = innerMaterial(0.5, 0.08, -Math.PI - 0.15, 0.15);

    const body = new THREE.Group(); world.add(body);
    const shell = new THREE.Group(); shell.position.set(0, HY, -0.26); body.add(shell);
    const lowerP = new THREE.Group(), upperP = new THREE.Group();
    shell.add(lowerP, upperP);
    // a soft lavender seam along the hinge, so the valves' back edges read as one joint
    const hingeX = RX * Math.sqrt(1 - (ZC / RZE) ** 2);
    const seam = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, hingeX * 1.85, 4, 12).rotateZ(Math.PI / 2), noOutline(new THREE.MeshToonMaterial({ color: '#8c84d0', gradientMap: kit.BANDS })));
    seam.position.set(0, 0, 0.01); shell.add(seam);
    const OUT = valveGeo(0), IN = valveGeo(1);
    for (const [pivot, flip] of [[lowerP, false], [upperP, true]]) {
      const o = OUT.clone(), i = IN.clone(), r = RIM.clone();
      if (flip) for (const g of [o, i, r]) g.rotateZ(Math.PI);
      const mo = new THREE.Mesh(o, shellMat), mi = new THREE.Mesh(i, flip ? innerUp : innerLo), mr = new THREE.Mesh(r, rimMat);
      mo.castShadow = mr.castShadow = true;
      pivot.add(mo, mi, mr);
    }

    /* ---------- the orb ---------- */
    const orbTex = canvasTex(256, 128, (x, w, h) => {
      x.fillStyle = '#3a1286'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 46; i++) {
        const px = R() * w, py = R() * h, r = rr(8, 26), g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, i % 3 ? 'rgba(214,64,214,.55)' : 'rgba(120,80,255,.5)'); g.addColorStop(1, 'rgba(214,64,214,0)');
        x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
      }
      x.lineCap = 'round';
      for (let i = 0; i < 18; i++) {
        x.strokeStyle = `rgba(255,${Math.round(rr(110, 190))},235,${rr(0.4, 0.85).toFixed(2)})`; x.lineWidth = rr(1.5, 3.5);
        const a0 = rr(0, TAU); x.beginPath(); x.arc(R() * w, R() * h, rr(8, 34), a0, a0 + rr(1, 2.6)); x.stroke();
      }
      x.shadowBlur = 4;
      for (let i = 0; i < 6; i++) branch2d(x, R() * w, R() * h, rr(0, TAU), rr(40, 80), 2.4, 1, 0.9, 'rgba(255,120,200,.95)');
      x.shadowBlur = 0; x.fillStyle = '#fff';
      for (let i = 0; i < 60; i++) { x.globalAlpha = rr(0.3, 1); x.beginPath(); x.arc(R() * w, R() * h, rr(0.5, 1.6), 0, TAU); x.fill(); }
      x.globalAlpha = 1;
    });
    const orbU = { uCalm: { value: 0 }, uIri: { value: new THREE.Color('#bfe0ff') } };
    const orbMat = toon('#ffffff', { map: orbTex, emissive: '#ffffff', emissiveMap: orbTex, emissiveIntensity: 0.6, thickness: 0.0035, ink: '#2a0c5a' });
    orbMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, orbU);
      sh.fragmentShader = 'uniform float uCalm;\nuniform vec3 uIri;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          diffuseColor *= mix( sampledDiffuseColor, vec4( 1.0 ), uCalm );`)
        .replace('#include <emissivemap_fragment>', `
          vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
          totalEmissiveRadiance *= mix( emissiveColor.rgb, vec3( 1.0 ), uCalm );
          float fres = 1.0 - clamp( dot( normalize( normal ), normalize( vViewPosition ) ), 0.0, 1.0 );
          totalEmissiveRadiance += mix( uIri, vec3( 1.0, 0.72, 0.9 ), smoothstep( 0.4, 0.95, fres ) ) * pow( fres, 1.6 ) * uCalm * 0.55;`);
    };
    const ORB = new V3(0, -0.07, 0.29), ORB_R = 0.23;
    const orbG = new THREE.Group(); orbG.position.copy(ORB); shell.add(orbG);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(ORB_R, 36, 24), orbMat); orb.castShadow = true; orbG.add(orb);
    const glowMat = noOutline(new THREE.SpriteMaterial({ map: tex.puff, color: '#c24cff', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    const glow = new THREE.Sprite(glowMat); glow.scale.setScalar(1.1); orbG.add(glow);
    const coreMat = noOutline(new THREE.SpriteMaterial({ map: tex.spark, color: '#ffffff', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    const core = new THREE.Sprite(coreMat); core.position.z = ORB_R + 0.02; orbG.add(core);

    /* ---------- lightning: re-randomising bolts, one camera-facing ribbon mesh ---------- */
    const NBOLT = 9, NM = 9, NBR = 5, SEGS = (NM - 1) + (NBR - 1), VPB = SEGS * 2 * 6;
    const bPos = new Float32Array(NBOLT * VPB * 3), bCol = new Float32Array(NBOLT * VPB * 3), bUv = new Float32Array(NBOLT * VPB * 2);
    for (let q = 0; q < NBOLT * VPB / 6; q++) bUv.set([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], q * 12);
    const boltGeo = new THREE.BufferGeometry();
    boltGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    boltGeo.setAttribute('color', new THREE.BufferAttribute(bCol, 3));
    boltGeo.setAttribute('uv', new THREE.BufferAttribute(bUv, 2));
    const ribbonTex = canvasTex(64, 4, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }, { srgb: false });
    const boltMat = noOutline(new THREE.MeshBasicMaterial({ map: ribbonTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    const boltMesh = new THREE.Mesh(boltGeo, boltMat); boltMesh.frustumCulled = false; shell.add(boltMesh);
    const bolts = Array.from({ length: NBOLT }, () => ({
      on: false, life: rnd(0, 0.3), I: 0, valve: 0, a: 0, r: 0, bi: 3, blen: 0.2,
      off: Array.from({ length: NM }, () => new V3()), bdir: new V3(), boff: Array.from({ length: NBR }, () => new V3()),
    }));
    function regen(b, reach) {
      b.valve = Math.random() < 0.55 ? 1 : 0; b.a = rnd(-2.1, 2.1); b.r = rnd(0.45, 0.95) * reach;
      for (let k = 0; k < NM; k++) b.off[k].copy(randDir()).multiplyScalar(rnd(0.03, 0.08) * Math.sin(Math.PI * k / (NM - 1)));
      b.bi = 2 + Math.floor(Math.random() * 4); b.bdir.copy(randDir()); b.blen = rnd(0.12, 0.26);
      for (let k = 0; k < NBR; k++) b.boff[k].copy(randDir()).multiplyScalar(rnd(0.01, 0.04) * (k / (NBR - 1)));
    }
    const _a = new V3(), _b = new V3(), _d = new V3(), _n = new V3(), _m = new V3(), camL = new V3();
    const mainP = Array.from({ length: NM }, () => new V3()), brP = Array.from({ length: NBR }, () => new V3());
    function innerPoint(valve, a, r, out) {
      valvePoint(a, r, 1, out); out.y += 0.03;
      if (valve) { out.x = -out.x; out.y = -out.y; }
      return out.applyMatrix4((valve ? upperP : lowerP).matrix);
    }
    function quad(o, p0, p1, w0, w1, r, g, b) {
      _d.subVectors(p1, p0); _m.addVectors(p0, p1).multiplyScalar(0.5);
      _n.subVectors(camL, _m).cross(_d).normalize();
      const A = [p0.x - _n.x * w0, p0.y - _n.y * w0, p0.z - _n.z * w0], B = [p0.x + _n.x * w0, p0.y + _n.y * w0, p0.z + _n.z * w0];
      const C = [p1.x + _n.x * w1, p1.y + _n.y * w1, p1.z + _n.z * w1], D = [p1.x - _n.x * w1, p1.y - _n.y * w1, p1.z - _n.z * w1];
      bPos.set(A, o); bPos.set(B, o + 3); bPos.set(C, o + 6); bPos.set(A, o + 9); bPos.set(C, o + 12); bPos.set(D, o + 15);
      for (let v = 0; v < 6; v++) { bCol[o + v * 3] = r; bCol[o + v * 3 + 1] = g; bCol[o + v * 3 + 2] = b; }
    }
    function writeBolt(i, b, shrink, I) {
      let o = i * VPB * 3;
      if (!b.on || I < 0.01) { bPos.fill(0, o, o + VPB * 3); return; }
      innerPoint(b.valve, b.a, b.r, _b);
      _a.subVectors(_b, orbG.position).normalize().multiplyScalar(ORB_R * 0.9).add(orbG.position);
      _b.lerp(_a, shrink);
      const L = _a.distanceTo(_b) / 0.6;
      for (let k = 0; k < NM; k++) mainP[k].lerpVectors(_a, _b, k / (NM - 1)).addScaledVector(b.off[k], L);
      _d.subVectors(_b, _a).normalize().addScaledVector(b.bdir, 0.9).normalize();
      for (let k = 0; k < NBR; k++) brP[k].copy(mainP[b.bi]).addScaledVector(_d, b.blen * L * k / (NBR - 1)).add(b.boff[k]);
      const f = I * (0.75 + 0.25 * Math.random());
      for (const [pts, n, k0] of [[mainP, NM, 1], [brP, NBR, 0.65]]) {
        for (let k = 0; k < n - 1; k++) {
          const w0 = 1 - 0.55 * k / (n - 1), w1 = 1 - 0.55 * (k + 1) / (n - 1), e = f * k0;
          quad(o, pts[k], pts[k + 1], 0.042 * w0 * k0, 0.042 * w1 * k0, 0.25 * e * 0.6, 0.7 * e * 0.6, 1.0 * e * 0.6); o += 18;
          quad(o, pts[k], pts[k + 1], 0.0095 * w0, 0.0095 * w1, e, e, e); o += 18;
        }
      }
    }

    /* =====================================================================
       Horns, side curls, seaweed, tentacles, crystals
       ===================================================================== */
    function curlPoints(H, r0, coils, dir, sway = 0.05) {
      const pts = [];
      for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(new V3(dir * Math.sin(k * Math.PI) * sway, k * H, 0)); }
      for (let i = 1; i <= 44; i++) { const k = i / 44, a = k * coils * TAU, r = r0 * (1 - 0.74 * k); pts.push(new V3(dir * (r0 - r * Math.cos(a)), H + r * Math.sin(a), 0)); }
      return pts;
    }
    const tentMat = toon('#2b4486', { thickness: 0.0052 });
    const hornGeo = (dir) => {
      const pts = curlPoints(1.12, 0.17, 1.25, dir, 0.06);
      const parts = [taperTube(pts, 0.07, 0.014, { segs: 72, radial: 8 })];
      const curve = new THREE.CatmullRomCurve3(pts), ctr = new V3(dir * 0.17, 1.12, 0);
      for (const u of [0.3, 0.5, 0.66, 0.78]) {          // little thorns on the outside of the curl
        const p = curve.getPointAt(u), out = u < 0.45 ? new V3(-dir, 0.3, 0).normalize() : p.clone().sub(ctr).normalize();
        const r = lerp(0.07, 0.03, u);
        parts.push(new THREE.ConeGeometry(r * 0.5, r * 1.3, 6).translate(0, r * 0.65, 0)
          .applyQuaternion(new THREE.Quaternion().setFromUnitVectors(kit.UP, out)).translate(p.x + out.x * r * 0.6, p.y + out.y * r * 0.6, p.z));
      }
      return mergeGeometries(parts);
    };
    const horns = [];
    for (const side of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(side * 0.36, -0.04, -0.26); g.rotation.order = 'YXZ'; shell.add(g);
      const m = new THREE.Mesh(hornGeo(side), tentMat); m.castShadow = true; g.add(m);
      horns.push({ g, side });
    }

    const weedA = toon('#2f8a86', { side: THREE.DoubleSide, thickness: 0.0045 });
    const weedB = toon('#5b47a2', { side: THREE.DoubleSide, thickness: 0.0045 });
    {   // two purple curls rising beside the shell
      const parts = [];
      for (const side of [-1, 1]) {
        const g = taperTube(curlPoints(0.62, 0.11, 1.1, side, 0.08), 0.036, 0.01, { segs: 70, radial: 8 });
        g.rotateZ(-side * 0.42).translate(side * 0.42, 0.9, -0.22);
        parts.push(g);
      }
      const m = new THREE.Mesh(mergeGeometries(parts), weedB); m.castShadow = true; body.add(m);
    }

    /** A skinned ribbon along +Y: geometry spans y 0..len. */
    function skinned(geo, len, nb, mat) {
      const p = geo.attributes.position, seg = len / nb, si = [], sw = [];
      for (let i = 0; i < p.count; i++) {
        const f = clamp(p.getY(i) / seg, 0, nb - 1e-4), b = Math.floor(f), t = f - b;
        si.push(b, Math.min(b + 1, nb - 1), 0, 0); sw.push(1 - t, t, 0, 0);
      }
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
      geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
      const bones = [];
      for (let i = 0; i < nb; i++) { const b = new THREE.Bone(); b.position.y = i ? seg : 0; if (i) bones[i - 1].add(b); bones.push(b); }
      const mesh = new THREE.SkinnedMesh(geo, mat);
      mesh.add(bones[0]); mesh.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));
      mesh.frustumCulled = false; mesh.castShadow = true;
      return { mesh, bones };
    }
    function frondGeo(len, W, waves, lobes, ph) {
      const cols = 6, rows = 40, pos = [], idx = [];
      for (let j = 0; j <= rows; j++) {
        const v = j / rows;
        const env = Math.pow(Math.sin(Math.PI * Math.min(1, 0.14 + v * 0.93)), 0.6);
        const hw = W * env * (0.7 + 0.4 * Math.abs(Math.sin(v * lobes * Math.PI + ph))) * (1 - 0.3 * v);
        const cx = W * 0.9 * Math.sin(v * waves * Math.PI + ph) * v;
        for (let i = 0; i <= cols; i++) {
          const u = i / cols * 2 - 1;
          pos.push(cx + u * hw, v * len, -0.3 * hw * u * u + 0.25 * hw * Math.sin(v * 18 + u * 3) * Math.abs(u));
        }
      }
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    const fronds = [];
    for (const side of [-1, 1]) {
      for (const [x, z, lean, len, W, mat, yaw] of [
        [0.36, -0.22, 0.62, 1.1, 0.2, side < 0 ? weedA : weedB, 0.25], [0.42, -0.1, 1.28, 1.0, 0.19, weedA, -0.15],
        [0.32, 0.0, 1.95, 0.8, 0.17, weedB, 0.1], [0.2, -0.34, 0.95, 1.05, 0.14, side < 0 ? weedB : weedA, 0.4],
      ]) {
        const nb = 6, f = skinned(frondGeo(len, W, rr(1.5, 2.6), rr(5, 8), rr(0, TAU)), len, nb, mat);
        const g = new THREE.Group(); g.position.set(side * x, 0.86, z); g.rotation.set(0, side * yaw, -side * lean, 'YXZ'); body.add(g);
        g.add(f.mesh);
        fronds.push({ ...f, nb, side, f: rr(0.8, 1.2), ph: rr(0, TAU), bend: rr(-0.06, 0.06) });
      }
    }

    const tents = [];
    for (const cfg of [
      { x: -0.1, z: 0.18, yaw: -0.28, len: 1.1, th0: 0.16, c: 0.07, hook: 1.55, s: 1 },
      { x: 0.11, z: 0.2, yaw: 0.32, len: 1.06, th0: 0.18, c: 0.06, hook: 1.65, s: -1 },
      { x: -0.27, z: 0.06, yaw: -0.9, len: 1.15, th0: 0.22, c: 0.09, hook: 1.4, s: -1 },
      { x: 0.28, z: 0.05, yaw: 0.95, len: 1.15, th0: 0.22, c: 0.09, hook: 1.4, s: 1 },
      { x: 0.0, z: 0.26, yaw: 0.05, len: 0.92, th0: 0.32, c: 0.12, hook: 1.75, s: 1 },
      { x: -0.2, z: -0.14, yaw: -2.1, len: 1.05, th0: 0.25, c: 0.1, hook: 1.3, s: 1 },
      { x: 0.2, z: -0.14, yaw: 2.1, len: 1.05, th0: 0.25, c: 0.1, hook: 1.3, s: -1 },
    ]) {
      const nb = 7, L = limb({ len: cfg.len, r0: 0.062, r1: 0.011, bones: nb, mat: tentMat, cap: false, radial: 8 });
      L.mesh.position.set(cfg.x, 0.82, cfg.z); body.add(L.mesh);
      L.bones[0].rotation.order = 'YXZ';
      tents.push({ ...cfg, L, nb, ph: rr(0, TAU), th: new Float32Array(nb) });
    }

    const crystalMat = toon('#b6dcf4', { emissive: '#58c0ff', emissiveIntensity: 0.15, thickness: 0.0042 });
    const CRYS = (() => {
      const parts = [];
      for (const [x, z, len, r, tilt, az] of [
        [0, 0.04, 0.6, 0.11, 0.12, 0], [-0.22, 0.1, 0.5, 0.1, 0.55, -0.9], [0.24, 0.09, 0.52, 0.1, 0.55, 0.9],
        [-0.1, 0.28, 0.4, 0.085, 0.8, -0.35], [0.13, 0.3, 0.38, 0.08, 0.85, 0.45], [-0.4, -0.04, 0.42, 0.09, 0.95, -1.5],
        [0.41, -0.04, 0.44, 0.09, 0.9, 1.5], [0.02, -0.25, 0.48, 0.1, 0.5, 3.1], [-0.26, -0.22, 0.36, 0.08, 0.85, -2.4],
        [0.28, -0.2, 0.34, 0.08, 0.85, 2.4], [0.02, 0.42, 0.26, 0.07, 1.2, 0.05], [-0.36, 0.26, 0.24, 0.06, 1.25, -0.8],
      ]) {
        const g = mergeGeometries([
          new THREE.CylinderGeometry(r, r * 1.04, len * 0.7, 6, 1).translate(0, len * 0.35, 0),
          new THREE.ConeGeometry(r, len * 0.3, 6).translate(0, len * 0.85, 0),
        ]);
        g.rotateY(rr(0, TAU));
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(kit.UP, new V3(Math.sin(az) * Math.sin(tilt), Math.cos(tilt), Math.cos(az) * Math.sin(tilt))));
        g.translate(x, -0.04, z);
        parts.push(g);
      }
      const g = mergeGeometries(parts.map((q) => q.toNonIndexed()));
      g.computeVertexNormals();          // non-indexed: one normal per face, so the facets read
      return g;
    })();
    const crystals = new THREE.Mesh(CRYS, crystalMat); crystals.castShadow = true; world.add(crystals);
    const edgeMat = noOutline(new THREE.LineBasicMaterial({ color: '#4a6aa8', transparent: true, opacity: 0.8 }));
    crystals.add(new THREE.LineSegments(new THREE.EdgesGeometry(CRYS, 20), edgeMat));

    /* ---------- pink teardrops (bubbles once healed) ---------- */
    const DROP = (() => {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const th = Math.PI * (1 - i / 16); pts.push(new THREE.Vector2(Math.max(1e-4, Math.sin(th) * Math.pow(Math.sin(th / 2), 1.3) * 0.64), Math.cos(th))); }
      return new THREE.LatheGeometry(pts, 14);
    })();
    const dropMat = toon('#e04c8c', { thickness: 0.004 }), dropMatB = toon('#6cbcec', { thickness: 0.004 });
    const dropShine = noOutline(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    const SHINE = new THREE.SphereGeometry(0.16, 8, 6).scale(0.6, 1.4, 0.5);
    const drops = [];
    for (const [x, y, z, s, blue] of [
      [-1.02, 1.72, 0.15, 0.14, 0], [-1.05, 0.95, 0.2, 0.13, 0], [-0.66, 0.62, 0.38, 0.09, 0], [0.98, 1.5, 0.15, 0.1, 0],
      [0.66, 0.6, 0.4, 0.1, 0], [-0.42, 2.22, -0.1, 0.06, 0], [0.42, 2.28, -0.1, 0.06, 0], [1.02, 0.45, 0.1, 0.06, 0],
      [-0.78, 1.3, 0.3, 0.06, 1], [0.84, 1.85, 0.2, 0.05, 1],
    ]) {
      const g = new THREE.Group(); g.position.set(x, y, z); world.add(g);
      const m = new THREE.Mesh(DROP, blue ? dropMatB : dropMat); m.scale.setScalar(s); g.add(m);
      const sh = new THREE.Mesh(SHINE, dropShine); sh.position.set(-0.22, -0.25, 0.42); m.add(sh);
      drops.push({ g, m, s, y, ph: rr(0, TAU) });
    }

    /* ---------- her three glowing icons, painted live on canvas ---------- */
    const ink = kit.look.ink;
    function iconSprite(draw, at, size) {
      const t = canvasTex(160, 160, draw);
      const mat = noOutline(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
      const sp = new THREE.Sprite(mat); sp.position.copy(at); sp.scale.setScalar(size); world.add(sp);
      return { sp, t, ctx: t.image.getContext('2d'), mat, at: at.clone(), ph: rr(0, TAU) };
    }
    function aura(x, w, h, col) {
      const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
      g.addColorStop(0, `rgba(${col},.35)`); g.addColorStop(0.6, `rgba(${col},.16)`); g.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }
    const belly = iconSprite((x, w, h) => {
      aura(x, w, h, '120,220,255');
      x.save(); x.translate(w / 2 - 4, h / 2 + 6);
      x.shadowColor = '#8fefff'; x.shadowBlur = 12; x.lineJoin = 'round';
      x.beginPath();
      x.moveTo(-14, -44); x.bezierCurveTo(-24, -28, -26, -4, -20, 12); x.bezierCurveTo(-16, 26, -24, 40, -18, 52);
      x.lineTo(14, 52); x.bezierCurveTo(10, 44, 42, 40, 40, 14); x.bezierCurveTo(38, -4, 20, -2, 20, -10);
      x.bezierCurveTo(28, -18, 22, -30, 8, -32); x.bezierCurveTo(4, -36, 6, -42, 4, -44); x.closePath();
      x.fillStyle = '#c4ecff'; x.fill(); x.shadowBlur = 0; x.strokeStyle = ink; x.lineWidth = 5; x.stroke();
      x.beginPath(); x.arc(-4, -56, 13, 0, TAU); x.fillStyle = '#c4ecff'; x.fill(); x.stroke();
      x.lineWidth = 2.5; x.beginPath(); x.arc(0, -56, 5, 0.2, Math.PI - 0.2); x.stroke();
      x.beginPath(); x.arc(22, 22, 9, -1.2, 1.2); x.stroke();
      x.restore();
    }, new V3(-1.12, 2.08, 0.05), 0.46);
    const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    function ecg(u, irregular) {
      const n = Math.floor(u), f = u - n;
      const jit = irregular ? (hash(n) - 0.5) * 0.3 : 0;
      const amp = irregular ? (hash(n + 7) < 0.3 ? 0.25 : 0.6 + 0.6 * hash(n + 3)) : 1;
      const g = (c, wd) => Math.exp(-(((f - c - jit) / wd) ** 2));
      return amp * (-1.0 * g(0.45, 0.022) + 0.42 * g(0.51, 0.022) - 0.16 * g(0.25, 0.06) - 0.22 * g(0.76, 0.07));
    }
    const heart = iconSprite(() => {}, new V3(1.12, 2.12, 0.05), 0.48);
    function drawHeart(time, irregular, mend, beatK) {
      const x = heart.ctx, w = 160, h = 160;
      x.clearRect(0, 0, w, h);
      aura(x, w, h, mend ? '140,255,220' : '120,220,255');
      x.save(); x.translate(w / 2, h / 2 + 2); x.scale(1 + beatK * 0.06, 1 + beatK * 0.06);
      x.beginPath(); x.moveTo(0, 40); x.bezierCurveTo(-52, 6, -46, -40, -22, -40); x.bezierCurveTo(-10, -40, -2, -32, 0, -22);
      x.bezierCurveTo(2, -32, 10, -40, 22, -40); x.bezierCurveTo(46, -40, 52, 6, 0, 40); x.closePath();
      x.shadowColor = '#9ff0ff'; x.shadowBlur = 14; x.fillStyle = mend ? '#f7b6d8' : '#f095c6'; x.fill();
      x.shadowBlur = 0; x.strokeStyle = ink; x.lineWidth = 5; x.lineJoin = 'round'; x.stroke();
      if (!mend) { x.lineWidth = 3.5; x.beginPath(); x.moveTo(0, -22); x.lineTo(-6, -8); x.lineTo(5, 2); x.lineTo(-5, 14); x.lineTo(2, 26); x.stroke(); }
      x.restore();
      x.lineWidth = 3.4; x.strokeStyle = '#ffffff'; x.shadowColor = '#5fe8ff'; x.shadowBlur = 8; x.lineJoin = 'round';
      x.beginPath();
      for (let px = 18; px <= 142; px += 2) {
        const y = h / 2 + 4 + ecg((px - 18) / 124 * 2.2 + time * (irregular ? 1.7 : 1.1), irregular) * 30;
        if (px === 18) x.moveTo(px, y); else x.lineTo(px, y);
      }
      x.stroke(); x.shadowBlur = 0;
      heart.t.needsUpdate = true;
    }
    const watch = iconSprite(() => {}, new V3(1.2, 0.98, 0.12), 0.44);
    function drawWatch(hand, minute, calmK) {
      const x = watch.ctx, w = 160, h = 160;
      x.clearRect(0, 0, w, h);
      aura(x, w, h, calmK > 0.5 ? '140,255,220' : '120,220,255');
      x.save(); x.translate(w / 2, h / 2 + 8);
      x.strokeStyle = ink; x.lineWidth = 5; x.fillStyle = '#c8e6ff';
      x.fillRect(-9, -62, 18, 12); x.strokeRect(-9, -62, 18, 12);
      for (const s of [-1, 1]) { x.save(); x.rotate(s * 0.75); x.fillRect(-6, -56, 12, 9); x.strokeRect(-6, -56, 12, 9); x.restore(); }
      x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.shadowColor = '#8fefff'; x.shadowBlur = 14; x.fill(); x.shadowBlur = 0; x.stroke();
      x.beginPath(); x.arc(0, 0, 38, 0, TAU); x.fillStyle = '#eef8ff'; x.fill(); x.lineWidth = 2.5; x.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.lineWidth = i % 3 ? 2 : 3.5; x.beginPath(); x.moveTo(Math.sin(a) * 30, -Math.cos(a) * 30); x.lineTo(Math.sin(a) * 36, -Math.cos(a) * 36); x.stroke(); }
      x.lineCap = 'round';
      x.lineWidth = 4.5; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.sin(minute) * 20, -Math.cos(minute) * 20); x.stroke();
      x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.sin(hand) * 31, -Math.cos(hand) * 31); x.stroke();
      x.fillStyle = ink; x.beginPath(); x.arc(0, 0, 4.5, 0, TAU); x.fill();
      x.restore();
      watch.t.needsUpdate = true;
    }
    const icons = [belly, heart, watch];

    /* ---------- the orchid that blooms on the crest when healed ---------- */
    const petalMat = toon('#f6c6ec', { side: THREE.DoubleSide, thickness: 0.0035 });
    const lipMat = toon('#c73a8c', { side: THREE.DoubleSide, thickness: 0.0035 });
    const colMat = toon('#ffe6a0', { thickness: 0 });
    const orchidRoot = new THREE.Group(); orchidRoot.position.set(0, -0.03, ZF - 0.02); upperP.add(orchidRoot);
    const stem = new THREE.Mesh(taperTube([new V3(0, 0, 0), new V3(0, 0.07, 0.03), new V3(0, 0.13, 0.07)], 0.02, 0.013, { segs: 12, radial: 7 }), weedA);
    orchidRoot.add(stem);
    const flower = new THREE.Group(); flower.position.set(0, 0.15, 0.09); orchidRoot.add(flower);
    const SEPAL = sheet({ width: 0.3, cup: 0.12, curl: 0.06, tipPinch: 0.45, point: 0.7, rows: 8, cols: 6 });
    const PETAL = sheet({ width: 0.62, cup: 0.14, curl: 0.06, tipPinch: -0.1, point: 0.4, rows: 8, cols: 8 });
    const LIP = sheet({ width: 0.44, cup: 0.4, curl: 0.28, tipPinch: 0, point: 0.5, rows: 8, cols: 6 });
    const petals = [];
    for (const [geo, mat, ang, size, open1] of [
      [SEPAL, petalMat, 0, 0.19, 0.12], [SEPAL, petalMat, 2.3, 0.18, 0.12], [SEPAL, petalMat, -2.3, 0.18, 0.12],
      [PETAL, petalMat, 1.2, 0.17, 0.18], [PETAL, petalMat, -1.2, 0.17, 0.18], [LIP, lipMat, Math.PI, 0.13, 0.55],
    ]) {
      const pv = new THREE.Group(); pv.rotation.z = ang; pv.position.z = mat === lipMat ? 0.02 : 0; flower.add(pv);
      const m = new THREE.Mesh(geo, mat); m.scale.setScalar(size); pv.add(m);
      petals.push({ m, open1 });
    }
    const column = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 8), colMat); column.position.z = 0.03; flower.add(column);
    orchidRoot.scale.setScalar(1e-4); orchidRoot.visible = false;
    const bloomS = new Spring(90, 9);

    /* =====================================================================
       Motion
       ===================================================================== */
    let sz = null, nextSz = 3.6, calm = 0, lastH = 0, flickT = 0, flickA = 0, flickB = 0, iconT = 0, watchHand = 0, watchMin = 0;
    const tmpV = new V3(), tmpC = new THREE.Color(), PEARL = new THREE.Color('#cfe4ff'), EDGE0 = new THREE.Color('#4a6aa8'), EDGE1 = new THREE.Color('#3f9aa8');
    const orbWorld = () => orbG.localToWorld(new V3());
    const ampFor = (h) => clamp(1.15 - h * 1.3, 0, 1);

    return {
      centre: orbWorld,
      anchor: () => shell.localToWorld(new V3(0.1, 1.08, 0.3)),
      /** Debug: start a seizure now ('burst' for the short one). */
      seize(burst = false) { sz = { t: 0, A: Math.max(0.6, ampFor(lastH)), burst, side: Math.random() < 0.5 ? -1 : 1 }; },
      react(type) {
        const c = orbWorld();
        if (type === 'wrong') {                  // the storm breaks at once
          sz = { t: 0, A: Math.max(0.85, ampFor(lastH)), burst: true, side: Math.random() < 0.5 ? -1 : 1 };
          nextSz = Math.max(nextSz, 5);
          for (let i = 0; i < 26; i++) { const d = randDir(); spark.emit(c.clone().addScaledVector(d, 0.2), { v: d.multiplyScalar(rnd(1, 2.2)), life: rnd(0.25, 0.5), s0: 0.12, s1: 0, color: i % 3 ? '#8ff0ff' : '#ffffff', drag: 3 }); }
        } else {                                 // relief: the thunder steps down a notch, the shell eases
          calm = 1;
          for (let i = 0; i < 10; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.15)), { v: randDir().multiplyScalar(0.35).add(new V3(0, 0.3, 0)), life: rnd(0.9, 1.3), s0: 0.14, s1: 0.4, color: '#d8f6ff', drag: 1.4, a: 0.35 });
        }
      },
      burst() {
        sz = null; calm = 1; bloomS.kick(2);
        const c = orbWorld();
        for (let i = 0; i < 24; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.2)), { v: randDir().multiplyScalar(rnd(0.6, 1.2)), life: rnd(1, 1.6), s0: 0.2, s1: 0.6, color: '#c8fff2', drag: 1.6, a: 0.35 });
        for (let i = 0; i < 30; i++) {
          const a = rnd(0, TAU), r = rnd(0.1, 0.5);
          spark.emit(world.localToWorld(new V3(Math.cos(a) * r, rnd(0.1, 0.6), Math.sin(a) * r)), { v: new V3(0, rnd(0.3, 0.8), 0), life: rnd(0.8, 1.5), s0: 0.1, s1: 0.02, color: '#7ff0e0', drag: 1 });
        }
      },
      reset() { sz = null; nextSz = 3.6; calm = 0; bloomS.set(0); },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        lastH = s.hTarget;
        const cool = heal.on ? (heal.burst ? 1 : heal.gather) : (s.healed ? 1 : 0);
        calm = Math.max(0, calm - dt * 0.8);
        if (heal.on) sz = null;

        /* ---------- the seizure clock ---------- */
        nextSz -= dt;
        if (nextSz <= 0) {
          const A = ampFor(s.hTarget);
          if (!sz && !heal.on && !s.healed && A > 0.2) sz = { t: 0, A, burst: false, side: Math.random() < 0.5 ? -1 : 1 };
          nextSz = lerp(6.2, 8.5, h) + rnd(0, 1.2);
        }
        let kA = 0, kT = 0, kC = 0, kP = 0, J = 0, jS = 1, A = 0, side = 1;
        if (sz) {
          const T = (sz.t += dt); A = sz.A * M; side = sz.side;
          const [a0, t1, c1, p1] = sz.burst ? [0, 0.28, 1.1, 2.3] : [0.75, 1.25, 2.35, 3.9];
          if (T < a0 + 0.05) kA = sstep(0, 0.15, T) * (1 - sstep(a0 - 0.05, a0 + 0.05, T));
          kT = sstep(a0, a0 + 0.07, T) * (1 - sstep(t1 - 0.04, t1 + 0.08, T));
          kC = sstep(t1 - 0.04, t1 + 0.05, T) * (1 - sstep(c1 - 0.12, c1 + 0.04, T));
          if (T > t1) { const tau = T - t1, ph = 4.6 * tau - tau * tau / (c1 - t1); J = Math.pow(0.5 + 0.5 * Math.sin(TAU * ph), 6); jS = Math.floor(ph) % 2 ? 1 : -1; }
          kP = sstep(c1 - 0.12, c1 + 0.15, T) * (1 - sstep(p1 - 0.8, p1, T));
          if (T > p1) sz = null;
        }
        const tr = kT * A, cl = kC * A, jc = J * cl, pk = kP * A;
        const strobe = kA > 0 && Math.sin(t * 53) * Math.sin(t * 31 + 1) > 0.12 ? 1 : 0;

        /* ---------- the body: breathing, the rigid tremor, the jerks, the slump ---------- */
        const fl = s.k.flinch.x, bob = s.k.bounce.x;
        body.position.set(
          Math.sin(t * 0.5) * 0.025 * M + s.k.shake.x * 0.02 + Math.sin(t * 97) * 0.008 * tr + jS * jc * 0.022,
          Math.sin(t * 1.05) * 0.01 * M + bob * 0.03 + jc * 0.04 + tr * 0.02 - pk * 0.06 - fl * 0.02,
          -fl * 0.04,
        );
        body.rotation.set(
          Math.sin(t * 0.7) * 0.015 * M + pk * 0.05 - fl * 0.06 - jc * 0.04,
          s.k.spin.x * 0.07 + Math.sin(t * 0.33) * 0.04 * M,
          -Math.sin(t * 0.5) * 0.02 * M + s.k.shake.x * 0.03 + Math.sin(t * 83) * 0.018 * tr + jS * jc * 0.05 + pk * 0.08 * side,
        );

        /* ---------- the shell ---------- */
        const breath = Math.sin(t * lerp(0.9, 0.65, h)) * M;
        let open = lerp(1.12, 1.2, h) + breath * 0.04 + calm * 0.09;
        open = lerp(open, 0.14, tr);
        open = lerp(open, 0.72 - 0.58 * J, cl);
        open = lerp(open, 0.8, pk);
        open += Math.sin(t * 71) * 0.03 * (tr + cl);
        if (heal.on && !heal.burst) open = lerp(open, 1.3, heal.gather);
        upperP.rotation.x = -open;
        lowerP.rotation.x = 0.42 + breath * 0.012 - tr * 0.08 + jc * 0.06 + pk * 0.05;
        upperP.updateMatrix(); lowerP.updateMatrix();
        P.mix(shellMat, 'shell', h); P.mix(rimMat, 'rim', h);
        P.mix(innerLo, 'inner', h); P.mix(innerUp, 'inner', h);

        /* ---------- the orb: fast pulse, the daze, the flashes ---------- */
        const beat = heartbeat(t, lerp(2.0, 0.95, h)) * M;
        const daze = 0.5 + 0.32 * Math.sin(t * 0.45) + 0.1 * Math.sin(t * 1.3);
        let glowK = sick * (0.32 + 0.38 * beat) * lerp(1, daze, sick) + (tr + cl) * 0.9 + jc * 0.7 + strobe * kA * 1.4;
        glowK *= 1 - pk * 0.8;
        glowK = glowK * (1 - cool) + calm * 0.3 * (1 - h);
        const calmOrb = sstep(0.7, 1, h);
        orbU.uCalm.value = Math.max(calmOrb, cool * 0.6);
        P.mix(orbMat, 'orb', calmOrb);
        orbMat.emissive.set('#ffffff').lerp(PEARL, calmOrb);
        orbMat.emissiveIntensity = lerp(0.35 + glowK * 1.1, 0.1 + 0.04 * Math.sin(t * 1.2), calmOrb);
        const drift = sick * M * (1 - tr);
        orbG.position.set(ORB.x + Math.sin(t * 0.37) * 0.035 * drift, ORB.y + Math.sin(t * 0.53 + 1) * 0.025 * drift - pk * 0.03, ORB.z + Math.cos(t * 0.29) * 0.03 * drift);
        orbG.scale.setScalar(1 + beat * 0.07 * sick - tr * 0.07 + jc * 0.05);
        orb.rotation.y += dt * (0.25 + glowK * 0.5) * M;
        orb.rotation.x = Math.sin(t * 0.21) * 0.3;
        P.mix(glowMat, 'glow', calmOrb);
        glowMat.opacity = clamp(0.28 + glowK * 0.4, 0, 0.72) * (1 - calmOrb) + calmOrb * (0.26 + 0.06 * Math.sin(t * 1.2));
        glow.scale.setScalar(lerp(0.9 + Math.min(glowK, 1.2) * 0.35, 0.95, calmOrb));
        const coreK = clamp(sick * 0.25 * (0.5 + beat) + (tr + cl) * 0.9 + strobe * kA, 0, 1.4) * (1 - cool) * (1 - pk * 0.8);
        coreMat.opacity = Math.min(0.9, coreK); core.visible = coreK > 0.02;
        core.scale.setScalar(0.16 + coreK * 0.24 + jc * 0.1);
        coreMat.rotation = t * 3;

        /* ---------- lightning ---------- */
        const lvl = (sick * 0.5 * lerp(1, daze, 0.6) + (tr + cl) * 1.35 + kA * strobe * 0.7) * (1 - cool) * (1 - calm * 0.5) * (1 - pk * 0.7);
        world.updateMatrixWorld();
        shell.worldToLocal(camL.copy(camera.position));
        const shrink = heal.on ? (heal.burst ? 1 : heal.gather) : 0;
        const nOn = Math.ceil(NBOLT * clamp(lvl, 0.3, 1));
        bolts.forEach((b, i) => {
          b.life -= dt;
          if (b.life <= 0) {
            if (i < nOn && Math.random() < clamp(lvl * 0.75, 0, 0.95)) { regen(b, lvl > 0.9 ? 1.18 : 1); b.on = true; b.life = rnd(0.05, 0.16); b.I = rnd(0.6, 1.2); }
            else { b.on = false; b.life = rnd(0.05, 0.4) / (0.3 + lvl); }
          }
          writeBolt(i, b, shrink, b.I * clamp(0.3 + lvl * 0.8, 0, 1.7));
        });
        boltGeo.attributes.position.needsUpdate = true; boltGeo.attributes.color.needsUpdate = true;
        flickT -= dt;
        if (flickT <= 0) { flickA = Math.random() < lvl * 0.9 ? rnd(0.5, 1.2) : 0; flickB = Math.random() < lvl * 0.9 ? rnd(0.5, 1.2) : 0; flickT = rnd(0.04, 0.14); }
        SH.boltA.value.setRGB(0.38, 0.9, 1).multiplyScalar(flickA * Math.min(lvl, 1.5) * 0.9);
        SH.boltB.value.setRGB(0.5, 0.95, 1).multiplyScalar(flickB * Math.min(lvl, 1.5) * 0.9);
        const veinK = (sick * (0.25 + 0.75 * beat) * 0.8 + (tr + cl) * 0.5) * (1 - cool) * (1 - pk * 0.6);
        SH.vein.value.setRGB(1, 0.25, 0.66).multiplyScalar(veinK * 0.6);
        SH.core.value.setRGB(0.75, 0.3, 1).multiplyScalar(glowK * 0.35).add(tmpC.setRGB(0.55, 0.85, 1).multiplyScalar(calmOrb * 0.22));
        if (cl > 0.1 && Math.random() < dt * 40 * cl) {
          const b = bolts[Math.floor(Math.random() * NBOLT)];
          if (b.on) spark.emit(shell.localToWorld(innerPoint(b.valve, b.a, b.r, tmpV)), { v: randDir().multiplyScalar(rnd(0.3, 0.9)), life: rnd(0.2, 0.4), s0: 0.07, s1: 0, color: '#9ff4ff', drag: 3 });
        }
        if (kA > 0.2 && Math.random() < dt * 22 * kA) {     // the aura: glints swimming in the air above
          const a = rnd(-1.2, 1.2);
          spark.emit(shell.localToWorld(tmpV.set(Math.sin(a) * 0.7, rnd(0.6, 1.1), 0.2 + Math.cos(a) * 0.3)), { v: new V3(rnd(-0.2, 0.2), rnd(-0.1, 0.1), 0), life: rnd(0.15, 0.3), s0: 0.06, s1: 0.1, color: '#ffffff' });
        }
        stormLight.position.copy(orbWorld()).add(tmpV.set(0, 0.15, 0.5));
        P.mix(stormLight, 'light', calmOrb);
        stormLight.intensity = (glowK * 1.4 + jc * 1.5 + strobe * kA * 2) * (1 - calmOrb) + calmOrb * 0.35;

        /* ---------- horns: stiffen, jerk, flop ---------- */
        for (const hn of horns) {
          hn.g.rotation.set(-0.16 + Math.sin(t * 0.6 + hn.side) * 0.03 * M - pk * 0.12,
            0, hn.side * (-0.04 + Math.sin(t * 0.8 + hn.side) * 0.04 * M - tr * 0.1 - jc * 0.14 + pk * 0.22));
        }

        /* ---------- seaweed ---------- */
        P.mix(weedA, 'weedA', h); P.mix(weedB, 'weedB', h);
        const swayA = lerp(0.05, 0.11, h) * M;
        for (const f of fronds) {
          for (let i = 1; i < f.nb; i++) {
            const k = i / f.nb;
            f.bones[i].rotation.set(Math.sin(t * f.f * 0.7 + f.ph - i) * 0.04 * M, 0,
              f.bend + Math.sin(t * f.f - i * 0.7 + f.ph) * swayA * (0.4 + k) + f.side * jc * 0.1 * k - f.side * tr * 0.04 + f.side * pk * 0.05 * k);
          }
        }

        /* ---------- tentacles: writhing, rigid, jerking, limp; never through the floor ---------- */
        P.mix(tentMat, 'tent', h);
        const writhe = lerp(0.06, 0.09, h) * M * (1 - tr) * (1 - pk * 0.9);
        const rootY = body.position.y + 0.82;
        for (const tc of tents) {
          const seg = tc.L.seg, nb = tc.nb;
          let th0 = tc.th0 + tr * 0.5 + jc * 0.32 + pk * 0.12;
          let c = tc.c * (1 - tr * 0.7);
          const hook = tc.hook * (1 - tr * 0.75) * (1 - pk * 0.55) * lerp(1, 0.85, h) + jc * 0.5;
          for (let it = 0; it < 12; it++) {
            let th = th0, y = rootY, minY = 9;
            tc.th[0] = th;
            for (let i = 1; i <= nb; i++) {
              y -= seg * Math.cos(th); minY = Math.min(minY, y);
              if (i < nb) { const k = i / nb; th += c + hook * k * k * k + Math.sin(t * lerp(0.9, 0.6, h) - i * 0.9 + tc.ph) * writhe + Math.sin(t * 90 + i) * 0.03 * tr; tc.th[i] = th; }
            }
            if (minY >= 0.075) break;
            c += 0.035; th0 += 0.03;
          }
          tc.L.mesh.position.y = 0.82;
          tc.L.bones[0].rotation.set(Math.PI - tc.th[0], tc.yaw, 0, 'YXZ');
          for (let i = 1; i < nb; i++) {
            tc.L.bones[i].rotation.set(-(tc.th[i] - tc.th[i - 1]), 0,
              tc.s * Math.sin(i * 1.3 + tc.ph) * 0.22 * (1 - pk * 0.5) + Math.sin(t * 0.7 + tc.ph + i * 0.5) * writhe * 1.4 + jS * jc * 0.12);
          }
        }

        /* ---------- crystals ---------- */
        P.mix(crystalMat, 'crystal', h);
        P.mix(crystalMat.emissive, 'cryGlow', h);
        crystalMat.emissiveIntensity = lerp(0.12, 0.42 + 0.14 * Math.sin(t * 1.3), h) + (jc + strobe * kA) * 0.35 * (1 - cool);
        edgeMat.color.copy(EDGE0).lerp(EDGE1, h);

        /* ---------- tears, then bubbles ---------- */
        P.mix(dropMat, 'drop', h); P.mix(dropMatB, 'dropB', h);
        for (const d of drops) {
          const rise = (h * ((t * 0.06 + d.ph) % 1)) * 0.12;
          d.g.position.y = d.y + Math.sin(t * 1.1 + d.ph) * 0.03 * M + rise;
          d.g.rotation.z = Math.sin(t * 0.9 + d.ph) * 0.12 * M;
          d.m.scale.set(d.s * lerp(1, 0.9, h), d.s * lerp(1, 0.62, h), d.s * lerp(1, 0.9, h));
        }

        /* ---------- icons ---------- */
        for (const ic of icons) ic.sp.position.set(ic.at.x, ic.at.y + Math.sin(t * 0.9 + ic.ph) * 0.03 * M, ic.at.z);
        watchHand += dt * lerp(5.5, 1.2, h) * (1 + jc * 3); watchMin += dt * lerp(0.5, 0.1, h);
        iconT -= dt;
        if (iconT <= 0) { iconT = 1 / 12; drawHeart(t, h < 0.8, h > 0.85, heartbeat(t, lerp(2.0, 1.0, h))); drawWatch(watchHand, watchMin, h); }

        /* ---------- the orchid ---------- */
        bloomS.target = sstep(0.85, 1, h);
        const bl = Math.max(0, bloomS.step(dt));
        orchidRoot.visible = bl > 0.01;
        orchidRoot.scale.setScalar(Math.max(1e-4, Math.min(bl, 1.15) * 1.35));
        orchidRoot.rotation.set(open, 0, Math.sin(t * 0.8) * 0.06 * M);
        for (const p of petals) p.m.rotation.x = lerp(1.35, p.open1, clamp(bl, 0, 1.1));
      },
    };
  },
};
