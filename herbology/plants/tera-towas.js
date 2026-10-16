/* 14. Teratogens: TERA-TOWAS.
   From her slide (refs/p28_0.jpg, "TERA-TOWAS"): a gothic graphic-novel
   painting in thick black ink, charcoal greys lit by glowing red, a stormy
   grey sky with a red glow behind. A towering dark stone plant-woman rises
   out of a cracked grey stone flowerpot: long flowing black hair, a spiky
   glowing red crown, glowing red eyes and lips, a stern regal face. One arm
   is raised, its clawed open hand cradling a small glowing red sigil orb; the
   other hangs at her side with long claws. Her stone body is a city at night,
   covered in tiny lit red windows, with dark grey skyscraper crystals growing
   from her shoulders. Thick black vines spiral up round her from the pot and
   branch out to the sides; little grey buildings with red windows sprout from
   the branch ends and from the soil. The pot has glowing red cracks and a big
   glowing red "Tw"; clawed black roots grip the ground; she stands in a dark
   pool ringed by two glowing red rune circles. Two tiny helicopters circle.
   The figure is kept modest and stylised: a long fitted stone gown.
   Symptoms (the poison she takes from her soil): red windows flicker on and
   climb up from the pot, red toxic motes and dark smoke rise, the cracks pulse.
   Healed (my addition, from the doc's "Recovery, The Bloom", the curse lifted
   and the soil made safe): the red drains away, the windows turn warm gold and
   go out like dawn, the stone pales to a soft grey-lilac garden statue, the
   crown becomes a ring of white blossoms, the vines turn green and leaf out,
   the buildings crumble into sparkles and flowers grow in their place, the
   cracks seal and the "Tw" glows soft green, the pool runs clear blue and her
   face softens. */

export default {
  id: 'tera-towas',
  look: { ink: '#0a0708', bands: [74, 138, 206, 255], outline: 0.005, rune: ['#ff3226', '#8fd8ff'], bg: ['#5e3236', '#2b2628', '#0d0b0c'] },
  frame: { halfH: 1.56, halfW: 1.52, lookY: 1.19 },
  careTitle: 'Lift the curse on Tera-Towas',
  lines: {
    sick: 'What you take, I take.',
    wrong: ['More poison in my soil!', 'It seeps into the seed.', 'The city burns brighter.'],
    right: ['One poison found.', 'A window goes dark.'],
    healed: 'Safe soil, safe seed.',
  },
  shows: [
    '<b>Red windows lighting up all over her stone body, climbing from the pot</b>: what the mother takes reaches the growing baby. "What you take, I take."',
    '<b>Red toxic motes and dark smoke rising from the soil</b>: harmful exposures: thalidomide, epilepsy medicines, retinoids, ACE inhibitors and ARBs, lithium, oral contraceptives, warfarin, alcohol, sulfonamides (T-E-R-A-T-O-W-A-S).',
    '<b>The cracks in the pot pulsing and spreading</b>: teratogens interfere with embryonic and fetal development.',
    '<b>The glowing orb held up in her claw</b>: the exposure itself. There is no universal antidote, so it has to be found and stopped.',
    '<b>Windows going dark, a crack sealing, the orb dimming with each right card</b>: reviewing medicines, blocking further exposure, checking the baby and teaching safe use.',
  ],
  healedNote: 'Healed, the curse lifts: the red drains away, the windows glow gold and go out like dawn, the city crumbles into flowers, and she softens into a pale garden statue crowned with white blossoms, standing in clear water. Safe soil, safe seed.',

  build(kit) {
    const { THREE, world, scene, camera, toon, noOutline, canvasTex, sheet, lumpGeo, taperTube, tendrilGeo, face, palette, Spring,
      spark, wisp, heartbeat, randDir, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, backOut, V3, TAU, DEG, UP, mergeGeometries, tex, runeMat, lights } = kit;

    const FIG_Y = 0.72;                     // the soil line: she rises from here
    const P = palette({
      stone: ['#3c3a41', '#cfc6da'], head: ['#46444b', '#d6cede'], hair: ['#141114', '#4a4258'], vine: ['#151113', '#4f8c3c'],
      pot: ['#46444b', '#b4afba'], bld: ['#4a4850', '#8c8794'], soil: ['#2c1a1a', '#4b3524'], peb: ['#4a474e', '#8a8478'],
      root: ['#100c0e', '#4a3c2c'], pool: ['#17111a', '#4fa8d6'], lip: ['#ff2c26', '#c27486'], lipIn: ['#b8141a', '#b46a7c'], eyeW: ['#ff3a26', '#f6f2fa'],
      iris: ['#ffd8b0', '#54446e'], claw: ['#0e0b0d', '#a69eb2'], heli: ['#2a282e', '#2a282e'], rim: ['#ff4a38', '#b8ffe0'],
      ring: ['#ff3a26', '#8fd8ff'], orb: ['#ff5a3a', '#d8ffd0'], halo: ['#ff3020', '#b8ffd8'],
    });
    const RED = new THREE.Color('#ff2a1a'), GREEN = new THREE.Color('#7dffa0');

    /* =====================================================================
       Textures, all drawn here
       ===================================================================== */
    const stoneMap = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#d2d0d6'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { x.fillStyle = R() < 0.6 ? 'rgba(0,0,0,.13)' : 'rgba(255,255,255,.16)'; x.beginPath(); x.arc(R() * w, R() * h, rr(0.6, 2.4), 0, TAU); x.fill(); }
      x.lineCap = 'round';
      for (let i = 0; i < 26; i++) {
        let xx = R() * w, yy = R() * h; const y1 = yy + rr(20, 90);
        x.strokeStyle = 'rgba(20,16,24,.28)'; x.lineWidth = rr(0.8, 1.8); x.beginPath(); x.moveTo(xx, yy);
        while (yy < y1) { yy += 6; xx += rr(-2.5, 2.5); x.lineTo(xx, yy); }
        x.stroke();
      }
    }, { repeat: true });
    const gownMap = stoneMap.clone(); gownMap.repeat.set(2, 1); gownMap.needsUpdate = true;

    /** A window mask: red = window, green = its rank (lower ranks light first). */
    const unit = (x, xc, yc, rank, pw, ph, gap) => {
      const k = R(), panes = k < 0.45 ? [[0, 0], [1, 0], [0, 1], [1, 1]] : k < 0.75 ? [[0, 0], [0, 1]] : [[0, 0]];
      for (const [i, j] of panes) {
        const rk = clamp(rank + rr(-0.03, 0.03), 0.04, 1);
        x.fillStyle = `rgb(255,${Math.round(rk * 255)},0)`; x.fillRect(xc + i * (pw + gap), yc - j * (ph + gap), pw, ph);
      }
    };
    // the gown: one tile round half her body, the full height; the poison climbs from the soil up
    const gownWin = canvasTex(512, 1024, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      const top = h * (1 - 1.2 / 1.49);
      for (let yc = h - 20; yc > top; yc -= rr(28, 36)) for (let xc = rr(4, 14); xc < w - 24; xc += rr(26, 38)) {
        if (R() < 0.35) continue;
        unit(x, xc, yc, 0.05 + 0.92 * (0.5 * R() + 0.5 * (1 - yc / h)), 9, 9, 2);
      }
    }, { srgb: false, repeat: true });
    // the arms: x along the arm, y around it
    const armWin = canvasTex(512, 256, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      for (let yc = h - 8; yc > 16; yc -= rr(28, 36)) for (let xc = rr(30, 50); xc < w - 50; xc += rr(28, 40)) {
        if (R() < 0.45) continue;
        unit(x, xc, yc, rr(0.3, 1), 9, 9, 2);
      }
    }, { srgb: false, repeat: true });
    // buildings: a 12 x 12 grid of windows over 0.24 units
    const TILE = 0.24;
    const bldWin = canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      const n = 16, c = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (R() < 0.2) continue;
        const rk = rr(0.05, 1); x.fillStyle = `rgb(255,${Math.round(rk * 255)},0)`;
        x.fillRect(Math.round(i * c + c * 0.24), Math.round(j * c + c * 0.2), Math.round(c * 0.52), Math.round(c * 0.6));
      }
    }, { srgb: false, repeat: true });

    // the pot: 1024 round x 320 up, covering y 0..0.78; red = crack, blue = how far along it is, green = the "Tw"
    const PW = 1024, PH = 320, PY = 0.78;
    const cracks = [];
    function grow(px, py, ang, len, ord, wd, depth) {
      const n = Math.round(len / 9);
      for (let i = 0; i < n; i++) {
        ang += rr(-0.45, 0.45);
        const nx = px + Math.cos(ang) * 9, ny = py + Math.sin(ang) * 9;
        cracks.push([px, py, nx, ny, ord, wd]); px = nx; py = ny; ord += 0.013; wd = Math.max(1.4, wd * 0.96);
        if (depth < 2 && R() < 0.09) grow(px, py, ang + rr(0.5, 1.1) * (R() < 0.5 ? -1 : 1), len * 0.5, ord, wd * 0.7, depth + 1);
      }
    }
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + rr(-0.3, 0.3); grow(530 + Math.cos(a) * 95, 215 + Math.sin(a) * 70, a, rr(70, 150), rr(0, 0.15), 4.5, 0); }
    for (let k = 0; k < 12; k++) grow(k < 6 ? rr(300, 740) : rr(0, PW), 3, Math.PI / 2 + rr(-0.5, 0.5), rr(60, 150), rr(0.05, 0.4), 4, 0);
    for (let k = 0; k < 8; k++) grow(k < 4 ? rr(320, 720) : rr(0, PW), PH - 3, -Math.PI / 2 + rr(-0.5, 0.5), rr(50, 120), rr(0.1, 0.45), 4, 0);
    const BAND = PH * (1 - 0.56 / PY);
    const drawTw = (x, fill) => {
      x.fillStyle = fill; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.font = 'bold 200px "Times New Roman", Georgia, serif'; x.fillText('T', 484, 286);
      x.font = 'bold 118px "Times New Roman", Georgia, serif'; x.fillText('w', 556, 286);
    };
    const potMap = canvasTex(PW, PH, (x, w, h) => {
      x.fillStyle = '#d0ced4'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 3000; i++) { x.fillStyle = R() < 0.6 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(R() * w, R() * h, rr(0.8, 3), 0, TAU); x.fill(); }
      // the rim's stone blocks
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, BAND, w, 10);
      x.strokeStyle = 'rgba(20,14,18,.55)'; x.lineWidth = 3;
      x.beginPath(); x.moveTo(0, BAND); x.lineTo(w, BAND); x.stroke();
      for (let px = rr(0, 40); px < w; px += rr(56, 84)) { x.beginPath(); x.moveTo(px, 0); x.lineTo(px + rr(-4, 4), BAND); x.stroke(); }
      x.lineCap = 'round';
      for (const [a, b, c, d, , wd] of cracks) { x.strokeStyle = 'rgba(30,20,26,.35)'; x.lineWidth = wd + 1; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); }
      drawTw(x, 'rgba(40,24,30,.45)');
    });
    const potCrk = canvasTex(PW, PH, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.lineCap = 'round';
      for (const [a, b, c, d, ord, wd] of cracks) { x.strokeStyle = `rgb(255,0,${Math.round(clamp(ord, 0, 1) * 255)})`; x.lineWidth = wd; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); }
      x.globalCompositeOperation = 'lighter';
      x.shadowColor = 'rgb(0,150,0)'; x.shadowBlur = 22; drawTw(x, 'rgb(0,120,0)');
      x.shadowBlur = 0; drawTw(x, 'rgb(0,255,0)');
    }, { srgb: false });
    // the orb's sigil
    const sigilTex = canvasTex(256, 128, (x, w, h) => {
      x.fillStyle = '#6a6a6a'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#fff'; x.lineWidth = 4; x.shadowColor = '#fff'; x.shadowBlur = 8;
      for (const cx of [64, 192]) {
        x.beginPath(); x.arc(cx, h / 2, 34, 0, TAU); x.stroke();
        x.beginPath();
        for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i * 2 % 5) / 5 * TAU; const px = cx + Math.cos(a) * 34, py = h / 2 + Math.sin(a) * 34; i ? x.lineTo(px, py) : x.moveTo(px, py); }
        x.stroke();
      }
    });
    const ringTex = canvasTex(512, 512, (x, w) => {
      const c = w / 2;
      x.strokeStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 16;
      x.lineWidth = 6; x.beginPath(); x.arc(c, c, 226, 0, TAU); x.stroke();
      x.lineWidth = 2.5; x.beginPath(); x.arc(c, c, 212, 0, TAU); x.stroke();
      x.lineWidth = 2;
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU; x.save(); x.translate(c + Math.cos(a) * 219, c + Math.sin(a) * 219); x.rotate(a);
        x.beginPath(); x.moveTo(-4, -3); x.lineTo(4, 0); x.lineTo(-4, 3); x.stroke(); x.restore();
      }
    });

    /* =====================================================================
       Materials
       ===================================================================== */
    // windows: lit by rank below uLit, a few blinking, red turning gold
    const U = {
      uTime: { value: 0 }, uLit: { value: 0.7 }, uGold: { value: 0 }, uGlow: { value: 1 }, uDark: { value: 1 },
      uRed: { value: new THREE.Color('#ff2a1a') }, uGoldC: { value: new THREE.Color('#ffc46a') },
    };
    function winMat(color, map, win, o = {}) {
      const m = toon(color, { map, ...o });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U, { uWin: { value: win } });
        sh.fragmentShader = 'uniform sampler2D uWin;\nuniform float uTime, uLit, uGold, uGlow, uDark;\nuniform vec3 uRed, uGoldC;\n' + sh.fragmentShader
          .replace('#include <map_fragment>', `#include <map_fragment>
            vec4 wv = texture2D( uWin, vMapUv );
            float wm = smoothstep( 0.3, 0.7, wv.r );
            diffuseColor.rgb *= mix( 1.0, 0.26, wm * uDark );`)
          .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
            float rk = wv.g + 0.045 * sin( uTime * 0.9 + wv.g * 47.0 );
            float on = 1.0 - smoothstep( uLit - 0.015, uLit + 0.015, rk );
            float fl = fract( sin( wv.g * 913.7 + floor( uTime * 6.0 + wv.g * 31.0 ) * 17.13 ) * 43758.5453 );
            on *= fl > 0.09 ? 1.0 : 0.2;
            totalEmissiveRadiance += mix( uRed, uGoldC, uGold ) * wm * on * uGlow;`);
      };
      return m;
    }
    const gownMat = winMat('#3c3a41', gownMap, gownWin);
    const armMat = winMat('#3c3a41', stoneMap, armWin);
    const bldMat = winMat('#4a4850', stoneMap, bldWin, { thickness: 0.004 });
    const headMat = toon('#46444b', { map: stoneMap });
    const hairMat = toon('#141114', { thickness: 0.004 });
    const clawMat = toon('#0e0b0d', { thickness: 0.003 });
    const vineMat = toon('#151113', { map: tex.bark, thickness: 0.0045 });
    const rootMat = toon('#100c0e', { map: tex.bark, thickness: 0.0045 });
    const crownMat = toon('#e0281c', { emissive: '#ff1a0a', emissiveIntensity: 0.9, thickness: 0.003 });
    const soilMat = toon('#2c1a1a', { map: tex.grain, emissive: '#ff2010', emissiveIntensity: 0.1, thickness: 0.003 });
    const pebMat = toon('#4a474e', { thickness: 0.0028 });
    const poolMat = noOutline(new THREE.MeshToonMaterial({ color: '#17111a', gradientMap: kit.BANDS, emissive: '#ff2010', emissiveIntensity: 0.05 }));
    const flowerMat = toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide, thickness: 0.0028 });
    const heliMat = toon('#2a282e', { thickness: 0.0022 });
    const rotorMat = noOutline(new THREE.MeshBasicMaterial({ color: '#1a181c', transparent: true, opacity: 0.75 }));
    // the pot: open cracks (in order of their spread) glow red, sealed ones leave a faint scar; the "Tw" glows
    const CU = { uCrk: { value: potCrk }, uSpread: { value: 0.6 }, uCrackI: { value: 1 }, uTwI: { value: 1 }, uCrackC: { value: RED.clone() }, uTwC: { value: RED.clone() } };
    const potMat = toon('#5a575e', { map: potMap, thickness: 0.006 });
    potMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, CU);
      sh.fragmentShader = 'uniform sampler2D uCrk;\nuniform float uSpread, uCrackI, uTwI;\nuniform vec3 uCrackC, uTwC;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
          vec4 cv = texture2D( uCrk, vMapUv );
          float open = 1.0 - smoothstep( uSpread - 0.04, uSpread + 0.04, cv.b );
          float crack = cv.r * open;
          diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.03, 0.015, 0.015 ), crack * 0.85 );`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += uCrackC * crack * uCrackI + uTwC * cv.g * uTwI;`);
    };
    const glowBasic = (color, o = {}) => noOutline(new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...o }));
    const ringMat = glowBasic('#ff3a26', { map: ringTex, opacity: 0.85 });
    const shockMat = glowBasic('#ff3a26', { opacity: 0, side: THREE.DoubleSide });
    const rippleMat = glowBasic('#ff5040', { opacity: 0.2, side: THREE.DoubleSide });
    const rippleMat2 = glowBasic('#ff5040', { opacity: 0.2, side: THREE.DoubleSide });
    const orbMat = kit.outline(new THREE.MeshBasicMaterial({ color: '#ff5a3a', map: sigilTex }), 0.003);
    const haloMat = glowBasic('#ff3020', { map: tex.puff, opacity: 0.7 });
    const sigRingMat = glowBasic('#ff4a30', { opacity: 0.9 });

    const plant = new THREE.Group(); world.add(plant);

    /* ---------- skinning helpers: one mesh, one bone per part that grows or crumbles ---------- */
    function setSkin(g, bi, fn = null) {
      const p = g.attributes.position, si = new Uint16Array(p.count * 4), sw = new Float32Array(p.count * 4);
      for (let i = 0; i < p.count; i++) {
        const [a, wa, b = 0, wb = 0] = fn ? fn(p.getX(i), p.getY(i), p.getZ(i)) : [bi, 1];
        si[i * 4] = a; si[i * 4 + 1] = b; sw[i * 4] = wa; sw[i * 4 + 1] = wb;
      }
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
      g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
      return g;
    }
    function skinned(geos, mat, bones, shadow = true) {
      const m = new THREE.SkinnedMesh(mergeGeometries(geos), mat);
      plant.add(m); world.updateMatrixWorld(true);
      m.bind(new THREE.Skeleton(bones));
      m.frustumCulled = false; m.castShadow = shadow;
      return m;
    }
    const boneAt = (parent, local) => { const b = new THREE.Bone(); b.position.copy(local); parent.add(b); return b; };
    const toWorld = (obj, p) => { world.updateMatrixWorld(true); return obj.localToWorld(p.clone()); };
    const colorize = (g, c) => {
      const col = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { a[i * 3] = col.r; a[i * 3 + 1] = col.g; a[i * 3 + 2] = col.b; }
      g.setAttribute('color', new THREE.BufferAttribute(a, 3));
      return g;
    };
    const orient = (g, dir, roll = 0) => g.rotateY(roll).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()));

    /* =====================================================================
       The pool, the rings, the pot, the roots
       ===================================================================== */
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.08, 64).rotateX(-Math.PI / 2), poolMat);
    pool.position.y = 0.008; pool.receiveShadow = true; plant.add(pool);
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5).rotateX(-Math.PI / 2), ringMat); ring.position.y = 0.014; plant.add(ring);
    const ripples = [rippleMat, rippleMat2].map((m) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 64).rotateX(-Math.PI / 2), m); r.position.y = 0.012; plant.add(r); return r; });
    const shock = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 80).rotateX(-Math.PI / 2), shockMat); shock.position.y = 0.03; shock.visible = false; plant.add(shock);

    const potProf = [[0.31, 0.0], [0.315, 0.03], [0.335, 0.12], [0.36, 0.24], [0.39, 0.36], [0.415, 0.46], [0.435, 0.54], [0.44, 0.56], [0.5, 0.565],
      [0.52, 0.59], [0.525, 0.66], [0.52, 0.74], [0.5, 0.775], [0.44, 0.785], [0.415, 0.77], [0.41, 0.72]].map(([r, y]) => new THREE.Vector2(r, y));
    const potGeo = new THREE.LatheGeometry(potProf, 56, Math.PI);
    { const p = potGeo.attributes.position, uv = potGeo.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setY(i, p.getY(i) / PY); }
    const pot = new THREE.Mesh(potGeo, potMat); pot.castShadow = true; plant.add(pot);
    const potR = (y) => 0.31 + (0.435 - 0.31) * clamp(y / 0.54, 0, 1);
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.415, 36).rotateX(-Math.PI / 2), soilMat); soil.position.y = 0.73; plant.add(soil);
    {
      const peb = [];
      for (let i = 0; i < 18; i++) { const a = rr(0, TAU), r = rr(0.24, 0.39); peb.push([Math.sin(a) * r, 0.735, Math.cos(a) * r, rr(0.025, 0.045), 0.6]); }
      plant.add(new THREE.Mesh(lumpGeo(peb, 7, 5), pebMat));
    }
    // clawed black roots gripping the ground
    {
      const parts = [];
      for (let i = 0; i < 8; i++) {
        const a = 0.66 + (i / 7) * (TAU - 1.32) + rr(-0.1, 0.1), d = new V3(Math.sin(a), 0, Math.cos(a)), side = new V3(d.z, 0, -d.x);
        const at = (r, y, s = 0) => d.clone().multiplyScalar(r).addScaledVector(side, s).setY(y);
        const r0 = potR(0.15) - 0.015, reach = rr(0.6, 0.72);
        const pts = [at(r0, 0.17), at(r0 + 0.08, 0.17, 0.01), at(lerp(r0, reach, 0.55), 0.12, -0.015), at(reach - 0.04, 0.05), at(reach, 0.025)];
        parts.push(taperTube(pts, 0.045, 0.024, { segs: 14, radial: 6 }));
        const toe = pts[4];
        for (const s of [-1, 0, 1]) {
          const td = d.clone().addScaledVector(side, s * 0.75).normalize(), L = rr(0.11, 0.16);
          const tp = [toe.clone(), toe.clone().addScaledVector(td, L * 0.45).setY(0.04), toe.clone().addScaledVector(td, L * 0.85).setY(0.02), toe.clone().addScaledVector(td, L).setY(0.002)];
          parts.push(taperTube(tp, 0.02, 0.002, { segs: 6, radial: 5 }));
        }
      }
      const roots = new THREE.Mesh(mergeGeometries(parts), rootMat); plant.add(roots);
    }

    /* =====================================================================
       Her: the stone gown, arms, head
       ===================================================================== */
    const fig = new THREE.Group(); fig.position.y = FIG_Y; plant.add(fig);
    const SX = 1.12, SZ = 0.78;
    const prof = [[0.235, -0.06], [0.215, 0.05], [0.195, 0.2], [0.184, 0.35], [0.19, 0.5], [0.198, 0.6], [0.19, 0.7], [0.166, 0.82], [0.156, 0.9],
      [0.164, 0.98], [0.175, 1.06], [0.173, 1.13], [0.17, 1.18], [0.158, 1.23], [0.115, 1.27], [0.062, 1.295], [0.052, 1.34], [0.049, 1.4], [0, 1.43]];
    const gR = (y) => {
      if (y <= prof[0][1]) return prof[0][0];
      for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); }
      return 0;
    };
    const gownGeo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 44, Math.PI);
    gownGeo.scale(SX, 1, SZ);
    { const p = gownGeo.attributes.position, uv = gownGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setY(i, (p.getY(i) + 0.06) / 1.49); }
    gownGeo.computeVertexNormals();
    const gown = new THREE.Mesh(gownGeo, gownMat); gown.castShadow = true; fig.add(gown);
    const onGown = (a, y, off) => new V3(Math.sin(a) * (gR(y) * SX + off), y, Math.cos(a) * (gR(y) * SZ + off));

    /* ---------- arms ---------- */
    const SR = new V3(0.18, 1.2, 0), SL = new V3(-0.18, 1.2, 0);
    const armR = new THREE.Group(); armR.position.copy(SR); fig.add(armR);
    const armL = new THREE.Group(); armL.position.copy(SL); fig.add(armL);
    function finger(base, dir, fwd, len, r0, clawLen, curl) {
      const d = dir.clone().normalize(), f = fwd.clone().normalize();
      const p1 = base.clone().addScaledVector(d, len * 0.5).addScaledVector(f, len * 0.12 * curl);
      const p2 = base.clone().addScaledVector(d, len).addScaledVector(f, len * 0.35 * curl);
      const cd = d.clone().addScaledVector(f, 0.6 * curl).normalize();
      const c1 = p2.clone().addScaledVector(cd, clawLen * 0.5).addScaledVector(f, clawLen * 0.15);
      const c2 = p2.clone().addScaledVector(cd, clawLen).addScaledVector(f, clawLen * 0.45);
      return {
        bone: taperTube([base, p1, p2], r0, r0 * 0.8, { segs: 8, radial: 6 }),
        claw: taperTube([p2.clone().addScaledVector(d, -0.004), c1, c2], r0 * 0.85, 0.0012, { segs: 10, radial: 6 }),
      };
    }
    // the raised arm: the open clawed hand, palm to us, cradling the orb
    const PALM = new V3(0.435, 1.645, 0.135).sub(SR);
    {
      const pts = [new V3(0, 0, 0), new V3(0.09, 0.05, 0.03), new V3(0.17, 0.11, 0.06), new V3(0.21, 0.22, 0.09), new V3(0.24, 0.33, 0.12), new V3(0.252, 0.4, 0.13)];
      const parts = [taperTube(pts, 0.05, 0.03, { segs: 32, radial: 10 }), new THREE.SphereGeometry(0.05, 14, 10)];
      parts.push(new THREE.SphereGeometry(1, 14, 10).scale(0.036, 0.042, 0.017).rotateZ(-0.12).translate(PALM.x, PALM.y, PALM.z));
      const claws = [];
      for (const [ang, len, cl] of [[-62, 0.06, 0.05], [-26, 0.075, 0.06], [2, 0.08, 0.065], [30, 0.075, 0.06], [58, 0.062, 0.05]]) {
        const a = ang * DEG, dir = new V3(Math.sin(a), Math.cos(a), 0);
        const base = PALM.clone().add(new V3(Math.sin(a) * 0.028, Math.cos(a) * 0.034, 0.004));
        const f = finger(base, dir, new V3(0, 0, 1), len, 0.0105, cl, 1);
        parts.push(f.bone); claws.push(f.claw);
      }
      { // thumb, low on the inner side, curling forward
        const base = PALM.clone().add(new V3(-0.032, -0.022, 0.006));
        const f = finger(base, new V3(-0.8, 0.45, 0.4), new V3(0.3, 0.2, 1), 0.055, 0.012, 0.045, 1);
        parts.push(f.bone); claws.push(f.claw);
      }
      const arm = new THREE.Mesh(mergeGeometries(parts), armMat); arm.castShadow = true; armR.add(arm);
      armR.add(new THREE.Mesh(mergeGeometries(claws), clawMat));
    }
    // the orb, its halo and a turning sigil ring
    const orbG = new THREE.Group(); orbG.position.copy(PALM).add(new V3(0, 0.03, 0.06)); armR.add(orbG);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.046, 24, 16), orbMat); orbG.add(orb);
    const sigRing = new THREE.Mesh(mergeGeometries([new THREE.TorusGeometry(0.075, 0.0035, 6, 48), new THREE.TorusGeometry(0.066, 0.0025, 6, 48).rotateX(1.1)]), sigRingMat);
    orbG.add(sigRing);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat); halo.renderOrder = 5; scene.add(halo);

    // the arm at her side, long claws hanging
    {
      const pts = [new V3(0, 0, 0), new V3(-0.06, -0.1, 0), new V3(-0.12, -0.22, 0), new V3(-0.15, -0.34, 0.02), new V3(-0.17, -0.44, 0.04)];
      const parts = [taperTube(pts, 0.05, 0.03, { segs: 28, radial: 10 }), new THREE.SphereGeometry(0.05, 14, 10)];
      const palm = new V3(-0.175, -0.485, 0.045);
      parts.push(new THREE.SphereGeometry(1, 14, 10).scale(0.017, 0.042, 0.032).rotateZ(0.12).translate(palm.x, palm.y, palm.z));
      const claws = [];
      for (const [dz, len, cl] of [[-0.022, 0.06, 0.06], [-0.006, 0.07, 0.075], [0.01, 0.068, 0.07], [0.025, 0.058, 0.06]]) {
        const base = palm.clone().add(new V3(0, -0.032, dz));
        const f = finger(base, new V3(-0.06, -1, dz * 3), new V3(0.45, 0, 0.3), len, 0.0105, cl, 1);
        parts.push(f.bone); claws.push(f.claw);
      }
      { const base = palm.clone().add(new V3(0.004, -0.01, 0.032));
        const f = finger(base, new V3(0.15, -0.7, 0.7), new V3(0.6, 0, 0.2), 0.05, 0.012, 0.045, 1);
        parts.push(f.bone); claws.push(f.claw); }
      const arm = new THREE.Mesh(mergeGeometries(parts), armMat); arm.castShadow = true; armL.add(arm);
      armL.add(new THREE.Mesh(mergeGeometries(claws), clawMat));
    }

    /* ---------- head ---------- */
    const HA = 0.088, HB = 0.112, HC = 0.095;
    const neck = new THREE.Group(); neck.position.set(0, 1.33, 0); fig.add(neck);
    const head = new THREE.Group(); head.position.set(0, 0.14, 0.02); neck.add(head);
    {
      const g = new THREE.SphereGeometry(1, 32, 24).scale(HA, HB, HC), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0) { const k = (y / HB) ** 2; p.setX(i, p.getX(i) * (1 - 0.3 * k)); p.setZ(i, p.getZ(i) * (1 - 0.08 * k)); } }
      g.computeVertexNormals();
      const nose = new THREE.SphereGeometry(1, 10, 8).scale(0.011, 0.022, 0.012).rotateX(-0.25).translate(0, -0.018, HC * 0.97);
      const m = new THREE.Mesh(mergeGeometries([g, nose]), headMat); m.castShadow = true; head.add(m);
    }
    const rig = face(head, {
      a: HA, b: HB, c: HC, gazeScale: 0.55,
      eyes: { x: 0.036, y: 0.006, r: 0.02, iris: '#ffd8b0', white: '#ff3a26', lid: '#46444b', pupil: false, shine: false },
      brows: { y: 0.043, len: 0.026, r: 0.0042, color: '#120c0e' },
      mouth: { y: -0.058, inside: '#b8141a', lip: '#ff2c26' },
      sickE: { lid: 0.72, low: 0.2, brow: -0.4, browY: -0.002, smile: -0.15, open: 0, w: 0.04 },
      wellE: { lid: 0.86, low: 0.3, brow: 0.06, browY: 0.004, smile: 0.5, open: 0.02, w: 0.04 },
      wrongE: { lid: 1, low: 0.05, brow: -0.8, browY: -0.005, smile: -0.6, open: 0.55, w: 0.034 },
      rightE: { lid: 0.8, low: 0.3, brow: -0.12, browY: 0.002, smile: 0.05, open: 0, w: 0.04 },
    });
    const eyeWhiteMat = rig.eyes[0].upper.parent.children[0].material;
    const irisMesh = rig.eyes.map((e) => e.look.children[0]);
    const irisMat = irisMesh[0].material;
    for (const m of irisMesh) m.scale.set(0.55, 0.55, 0.55 * 0.36);
    eyeWhiteMat.emissive.set('#ff2010'); irisMat.emissive.set('#ffb070');
    const mouthStrips = head.children.filter((o) => o.isMesh && o.material.isMeshBasicMaterial && o.material.side === THREE.DoubleSide);
    const lipMat = mouthStrips[0].material, lipInMat = mouthStrips[1].material;

    // the spiky glowing crown and the drop earrings
    const crown = new THREE.Group(); crown.position.set(0, 0.062, -0.006); crown.rotation.x = -0.2; head.add(crown);
    {
      const parts = [new THREE.TorusGeometry(HA * 0.98, 0.009, 6, 36).rotateX(Math.PI / 2).scale(1, 1, HC / HA)];
      const N = 13;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * TAU, front = Math.cos(a), hgt = 0.04 + 0.05 * Math.max(0, front) ** 3 + (i === 0 ? 0.13 : 0) + (i === 1 || i === N - 1 ? 0.035 : 0);
        const out = new V3(Math.sin(a), 0, Math.cos(a));
        const pos = new V3(Math.sin(a) * HA * 0.98, 0, Math.cos(a) * HC * 0.98);
        const dir = out.clone().multiplyScalar(0.18).add(UP);
        parts.push(orient(new THREE.ConeGeometry(i === 0 ? 0.018 : 0.013, hgt, 5).translate(0, hgt / 2, 0), dir).translate(pos.x, pos.y, pos.z));
        if (i % 2 === 0 && i) parts.push(orient(new THREE.ConeGeometry(0.008, hgt * 0.55, 4).translate(0, hgt * 0.27, 0), dir.clone().add(out.clone().multiplyScalar(0.4))).translate(pos.x + out.x * 0.01, pos.y, pos.z + out.z * 0.01));
      }
      crown.add(new THREE.Mesh(mergeGeometries(parts.map((g) => g.toNonIndexed())), crownMat));
      const ear = [];
      for (const s of [-1, 1]) {
        ear.push(new THREE.CylinderGeometry(0.0025, 0.0025, 0.03, 5).translate(s * HA * 1.0, -0.075, -0.012));
        ear.push(new THREE.SphereGeometry(1, 8, 8).scale(0.008, 0.017, 0.008).translate(s * HA * 1.0, -0.1, -0.012));
      }
      const earM = new THREE.Mesh(mergeGeometries(ear), crownMat); head.add(earM); crown.userData.ear = earM;
    }

    /* ---------- hair: long black locks, swaying from the neck ---------- */
    const bHead = boneAt(head, new V3(0, 0, 0)), bHL = boneAt(fig, new V3(-0.02, 1.35, -0.05)), bHR = boneAt(fig, new V3(0.02, 1.35, -0.05));
    {
      const HEADC = new V3(0, 1.47, 0.02), geos = [];
      const hw = (side) => (x, y) => { const d = clamp((FIG_Y + 1.43 - y) / 0.38, 0, 1); return [side < 0 ? 1 : 2, d, 0, 1 - d]; };
      // each lock a flat ribbon, wide across the body and thin away from it, so they overlap into a mane
      const lock = (pts, r0, side, flat = 0.3) => {
        const SEG = 18, RAD = 6;
        const curve = new THREE.CatmullRomCurve3(pts.map((p) => p.clone().setY(p.y + FIG_Y)));
        const g = taperTube(curve, r0, 0.004, { segs: SEG, radial: RAD }), p = g.attributes.position, d = new V3(), n = new V3();
        for (let j = 0; j <= SEG; j++) {
          const c = curve.getPointAt(j / SEG); n.set(c.x, 0, c.z + 0.03).normalize();
          for (let i = 0; i <= RAD; i++) {
            const k = j * (RAD + 1) + i; d.fromBufferAttribute(p, k).sub(c);
            d.addScaledVector(n, -d.dot(n) * (1 - flat)); p.setXYZ(k, c.x + d.x, c.y + d.y, c.z + d.z);
          }
        }
        g.computeVertexNormals();
        geos.push(setSkin(g, 0, hw(side)));
      };
      for (let i = 0; i < 18; i++) {
        const side = i % 2 ? 1 : -1, k = Math.floor(i / 2), a = side * (66 + k * 13.5) * DEG;
        const start = HEADC.clone().add(new V3(Math.sin(a) * HA * 0.92, 0.05 - k * 0.003, Math.cos(a) * HC * 0.92));
        const flare = (1 - k / 8) * (side > 0 ? 0.22 : 0.34) * rr(0.85, 1.1);
        const end = new V3(side * (0.1 + flare), rr(0.8, 0.98) - (side > 0 ? 0 : 0.06) - (k > 5 ? 0.06 : 0), -0.16 - k * 0.01 - (side > 0 ? 0.04 : 0));
        const out = new V3(start.x, 0, start.z - 0.02).normalize();
        const p1 = start.clone().addScaledVector(out, 0.06).add(new V3(0, -0.06, 0));
        const p2 = start.clone().lerp(end, 0.38).add(new V3(side * (0.05 + 0.03 * Math.sin(k * 1.7 + 1)), 0, -0.035));
        const p3 = start.clone().lerp(end, 0.7).add(new V3(-side * 0.04 * Math.sin(k * 2.3 + 0.5), 0, -0.035));
        lock([start, p1, p2, p3, end], 0.05 - k * 0.0018, side);
      }
      for (const s of [-1, 1]) {      // two locks framing the face
        lock([HEADC.clone().add(new V3(s * 0.05, 0.08, 0.06)), HEADC.clone().add(new V3(s * 0.1, 0.02, 0.05)), HEADC.clone().add(new V3(s * 0.118, -0.07, 0.04)),
          new V3(s * 0.14, 1.33, 0.04), new V3(s * 0.155, 1.24, 0.03)], 0.026, s, 0.5);
      }
      const cap = new THREE.SphereGeometry(1, 28, 12, 0, TAU, 0, 0.5 * Math.PI).scale(HA * 1.1, HB * 1.07, HC * 1.12).rotateX(-0.62)
        .translate(HEADC.x, HEADC.y + FIG_Y + 0.004, HEADC.z - 0.006);
      geos.push(setSkin(cap, 0));
      skinned(geos, hairMat, [bHead, bHL, bHR], false);
    }

    /* =====================================================================
       Vines, branches, the city, the crystals
       ===================================================================== */
    const curves = [];
    const vineParts = [];
    function vine(pts, r0, r1, segs = 80) { const c = new THREE.CatmullRomCurve3(pts); curves.push({ c, r0, r1 }); vineParts.push(taperTube(c, r0, r1, { segs, radial: 7 })); return c; }
    function spiral(a0, a1, y0, y1, n, off) {
      const pts = [];
      for (let i = 0; i <= n; i++) { const k = i / n; pts.push(onGown(lerp(a0, a1, k), lerp(y0, y1, k), off(k))); }
      return pts;
    }
    const tips = {
      R1: new V3(0.66, 1.06, 0.0), R2: new V3(0.64, 0.66, 0.12), L1: new V3(-0.64, 1.12, -0.05), L2: new V3(-0.65, 0.58, 0.04),
    };
    const aA = Math.PI / 2 - 0.25, aB = -Math.PI / 2 - 0.35;
    const vA = vine([...spiral(aA - 1.2 * TAU, aA, -0.06, 0.74, 16, (k) => lerp(0.055, 0.03, k)),
      new V3(0.34, 0.84, 0.07), new V3(0.47, 0.9, 0.05), new V3(0.58, 0.96, 0.02), tips.R1], 0.054, 0.015, 56);
    const vB = vine([...spiral(aB - 1.2 * TAU, aB, -0.06, 0.84, 16, (k) => lerp(0.055, 0.03, k)),
      new V3(-0.3, 0.9, -0.11), new V3(-0.44, 0.98, -0.12), new V3(-0.56, 1.03, -0.08), tips.L1], 0.054, 0.015, 56);
    const aC0 = 0.6 - 0.56 * (1.2 * TAU / 0.8);
    const vC = vine([...spiral(aC0, 0.6, -0.06, 0.5, 11, () => 0.03),
      new V3(0.2, 0.56, 0.26), new V3(0.24, 0.64, 0.3), new V3(0.21, 0.7, 0.33)], 0.034, 0.008, 64);
    vine([onGown(0.9, 0.69, 0.04), new V3(0.4, 0.62, 0.2), new V3(0.52, 0.58, 0.18), new V3(0.6, 0.6, 0.14), tips.R2], 0.03, 0.012, 40);
    vine([onGown(-2.2, 0.74, 0.04), new V3(-0.36, 0.6, -0.12), new V3(-0.5, 0.5, -0.05), new V3(-0.6, 0.52, 0.01), tips.L2], 0.03, 0.012, 40);
    // gnarled stubs and curling tendrils
    for (const [c, t, dir, len] of [[vA, 0.86, new V3(0.2, 1, 0.3), 0.1], [vB, 0.84, new V3(-0.2, 1, 0.2), 0.11], [vA, 0.93, new V3(0.4, -0.6, 0.3), 0.08], [vB, 0.92, new V3(-0.3, -0.7, 0.2), 0.08]]) {
      const p = c.getPointAt(t), d = dir.clone().normalize();
      vineParts.push(taperTube([p, p.clone().addScaledVector(d, len * 0.5).add(new V3(0.01, 0, 0)), p.clone().addScaledVector(d, len)], 0.014, 0.003, { segs: 10, radial: 6 }));
    }
    for (const [c, t, rot, dirS] of [[vA, 0.8, -0.4, 1], [vB, 0.78, 0.5, -1], [vC, 0.97, -0.2, -1], [vA, 0.62, -1.2, 1]]) {
      const g = tendrilGeo({ rise: 0.05, r0: 0.04, coils: 1.5, thick: 0.007, dir: dirS }).rotateZ(rot).rotateY(rr(-0.5, 0.5));
      const p = c.getPointAt(t); vineParts.push(g.translate(p.x, p.y, p.z));
    }
    const vines = new THREE.Mesh(mergeGeometries(vineParts), vineMat); vines.castShadow = true; fig.add(vines);

    // the city: buildings at the branch ends and in the soil, crystals on her shoulders
    const bScale = (g, sx, sy, ou = R(), ov = R()) => { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx + ou, uv.getY(i) * sy + ov); return g; };
    function boxUV(g, w, h, d) {
      const uv = g.attributes.uv, sz = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], ou = R(), ov = R();
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sz[f][0] / TILE + ou, uv.getY(i) * sz[f][1] / TILE + ov); }
      return g;
    }
    function building(w, h, d) {
      const parts = [boxUV(new THREE.BoxGeometry(w, h, d), w, h, d).translate(0, h / 2, 0)];
      const top = R();
      if (top < 0.4) parts.push(bScale(new THREE.ConeGeometry(w * 0.72, h * 0.28, 4), w * 3 / TILE, h * 0.28 / TILE).rotateY(Math.PI / 4).translate(0, h + h * 0.14, 0));
      else if (top < 0.65) parts.push(bScale(new THREE.CylinderGeometry(0.0035, 0.0035, h * 0.35, 4), 0.1, 0.1).translate(0, h + h * 0.17, 0));
      else parts.push(boxUV(new THREE.BoxGeometry(w * 0.66, h * 0.18, d * 0.66), w * 0.66, h * 0.18, d * 0.66).translate(0, h + h * 0.09, 0));
      return mergeGeometries(parts);
    }
    function crystal(r, len) {
      return mergeGeometries([
        bScale(new THREE.CylinderGeometry(r * 0.82, r, len, 6), TAU * r / TILE, len / TILE).translate(0, len / 2, 0),
        bScale(new THREE.ConeGeometry(r * 0.82, len * 0.38, 6), TAU * r / TILE, len * 0.38 / TILE).translate(0, len * 1.19, 0),
      ]);
    }
    const clusters = [];
    const bldGeos = [], bldBones = [];
    function city(name, parent, local, n, o) {
      const base = toWorld(parent, local), bone = boneAt(parent, local), bi = bldBones.length;
      bldBones.push(bone);
      for (let k = 0; k < n; k++) {
        const w = rr(o.w0, o.w1), h = rr(o.h0, o.h1);
        const g = building(w, h, w * rr(0.75, 1)).rotateY(rr(0, TAU)).rotateZ((k - (n - 1) / 2) * o.fan + rr(-0.07, 0.07)).rotateX(rr(-0.08, 0.08));
        g.translate(base.x + rr(-o.sp, o.sp), base.y - 0.012, base.z + rr(-o.sp, o.sp));
        bldGeos.push(setSkin(g, bi));
      }
      for (let k = 0; k < (o.cry || 0); k++) {
        const dir = new V3(rr(-0.5, 0.5) + (o.lean || 0), 1, rr(-0.4, 0.4));
        const g = orient(crystal(rr(0.016, 0.022), rr(0.08, 0.15)), dir, rr(0, 1)).translate(base.x + rr(-o.sp, o.sp), base.y - 0.01, base.z + rr(-o.sp, o.sp));
        bldGeos.push(setSkin(g, bi));
      }
      const c = { name, parent, local, base, bone, bi, flowers: o.flowers ?? 3, size: o.fsize ?? 1 };
      clusters.push(c);
      return c;
    }
    const bOpt = { w0: 0.045, w1: 0.066, h0: 0.1, h1: 0.24, sp: 0.03, fan: 0.22, cry: 1 };
    city('R1', fig, tips.R1, 3, { ...bOpt, lean: 0.4 });
    city('L1', fig, tips.L1, 3, { ...bOpt, lean: -0.4 });
    city('R2', fig, tips.R2, 2, { ...bOpt, h1: 0.2, lean: 0.5 });
    city('L2', fig, tips.L2, 3, { ...bOpt, h1: 0.2, lean: -0.5 });
    city('S1', plant, new V3(-0.28, 0.73, 0.16), 3, { w0: 0.065, w1: 0.09, h0: 0.22, h1: 0.44, sp: 0.04, fan: 0.12, cry: 0, fsize: 1.2 });
    city('S2', plant, new V3(0.29, 0.73, 0.12), 2, { w0: 0.065, w1: 0.085, h0: 0.26, h1: 0.4, sp: 0.04, fan: 0.12, cry: 0, fsize: 1.2 });
    city('S3', plant, new V3(0.06, 0.73, -0.32), 2, { w0: 0.06, w1: 0.08, h0: 0.24, h1: 0.4, sp: 0.03, fan: 0.1, cry: 0, flowers: 2 });
    // shoulder crystals: dark skyscraper spires
    for (const s of [-1, 1]) {
      const local = new V3(s * 0.15, 1.22, -0.07), base = toWorld(fig, local), bone = boneAt(fig, local), bi = bldBones.length;
      bldBones.push(bone);
      for (const [lean, back, len, r] of [[0.55, -0.35, 0.24, 0.03], [0.95, -0.15, 0.17, 0.024], [0.25, -0.6, 0.19, 0.022]]) {
        const g = orient(crystal(r, len), new V3(s * lean, 1, back), rr(0, 1)).translate(base.x + s * rr(0, 0.02), base.y, base.z + rr(-0.02, 0.01));
        bldGeos.push(setSkin(g, bi));
      }
      clusters.push({ name: s < 0 ? 'SHL' : 'SHR', parent: fig, local, base, bone, bi, flowers: 2, size: 0.75, shoulder: s });
    }
    const city3 = skinned(bldGeos, bldMat, bldBones);

    /* =====================================================================
       The healed garden, hidden until the curse lifts: flowers, leaves,
       a crown of white blossoms, a flower in her hand
       ===================================================================== */
    const PETAL = sheet({ width: 0.75, cup: 0.25, curl: -0.08, tipPinch: -0.3, point: 0.45, cols: 4, rows: 4 });
    const LEAF = sheet({ width: 0.36, cup: 0.14, curl: 0.16, point: 0.7, cols: 3, rows: 6 });
    const PETALS = ['#f6f2f8', '#f7cfe0', '#ddcdf4', '#fff4e0'];
    function flowerGeo(size, col, n = 5) {
      const parts = [];
      for (let i = 0; i < n; i++) parts.push(colorize(PETAL.clone().scale(size, size, size).rotateX(Math.PI / 2 - 0.55).rotateY(i / n * TAU), col));
      parts.push(colorize(new THREE.SphereGeometry(size * 0.26, 7, 5).scale(1, 0.6, 1).translate(0, size * 0.05, 0), '#f2c444'));
      return mergeGeometries(parts);
    }
    const flGeos = [], flBones = [], flowers = [];
    function addFlowerPiece(parent, local, geosLocal, delay, kind) {
      const at = toWorld(parent, local), bone = boneAt(parent, local), bi = flBones.length;
      flBones.push(bone);           // scaled to nothing after binding, in update
      for (const g of geosLocal) flGeos.push(setSkin(g.translate(at.x, at.y, at.z), bi));
      flowers.push({ bone, delay, kind });
    }
    // a bouquet where each cluster of buildings stood
    clusters.forEach((c, ci) => {
      const geos = [], s = c.size;
      for (let k = 0; k < c.flowers; k++) {
        const a = (k / c.flowers) * TAU + rr(-0.4, 0.4), lean = new V3(Math.sin(a) * 0.45 + (c.shoulder || 0) * 0.5, 1, Math.cos(a) * 0.45);
        const hgt = rr(0.08, 0.15) * s, top = lean.clone().normalize().multiplyScalar(hgt);
        geos.push(colorize(taperTube([new V3(0, 0, 0), top.clone().multiplyScalar(0.5).add(new V3(0.008, 0, 0)), top], 0.008, 0.006, { segs: 8, radial: 5 }), '#4f8c3c'));
        geos.push(orient(flowerGeo(rr(0.05, 0.065) * s, PETALS[(ci + k) % PETALS.length]), lean.clone().add(UP)).translate(top.x, top.y, top.z));
      }
      for (let k = 0; k < 2; k++) {
        const a = rr(0, TAU);
        geos.push(colorize(orient(LEAF.clone().scale(0.11 * s, 0.11 * s, 0.11 * s), new V3(Math.sin(a), 0.6, Math.cos(a)), rr(0, 1)), '#5c9c48'));
      }
      addFlowerPiece(c.parent, c.local, geos, 0.2 + ci * 0.08, 'bouquet');
    });
    // white blossoms round her head, where the crown was
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU, out = new V3(Math.sin(a), 0, Math.cos(a));
      const local = new V3(Math.sin(a) * HA * 1.0, 0.07 - 0.02 * Math.cos(a), Math.cos(a) * HC * 1.0 - 0.01);
      const geos = [orient(flowerGeo(i % 3 === 0 ? 0.046 : 0.038, i % 2 ? '#fbf8fc' : '#f4eaf6'), out.clone().multiplyScalar(0.9).add(new V3(0, 0.7, 0)))];
      if (i % 2 === 0) geos.push(colorize(orient(LEAF.clone().scale(0.045, 0.045, 0.045), out.clone().add(new V3(0, -0.2, 0))), '#6aa852'));
      addFlowerPiece(head, local, geos, 0.15 + i * 0.05, 'crown');
    }
    // a flower opening in her raised palm
    addFlowerPiece(armR, PALM.clone().add(new V3(0, 0.0, 0.03)), [orient(flowerGeo(0.06, '#fbf6fc', 6), new V3(0, 0.5, 1))], 0.45, 'palm');
    // fresh leaves along the vines, from the soil up
    {
      const leafSpots = [];
      for (const { c, r0, r1 } of curves) {
        for (let t = 0.12; t < 0.97; t += rr(0.07, 0.12)) {
          const p = c.getPointAt(t), tan = c.getTangentAt(t);
          let out = new V3(p.x, 0, p.z); if (out.lengthSq() < 1e-4) out.set(1, 0, 0); out.normalize();
          const side = new V3().crossVectors(tan, UP).normalize().multiplyScalar(R() < 0.5 ? -1 : 1);
          const dir = out.clone().multiplyScalar(0.5).add(side.multiplyScalar(0.7)).add(new V3(0, 0.55, 0)).normalize();
          const r = lerp(r0, r1, t);
          leafSpots.push({ local: p.clone().addScaledVector(dir, r * 0.8), dir, y: p.y });
        }
      }
      leafSpots.sort((a, b) => a.y - b.y);
      leafSpots.forEach((L, i) => {
        const s = rr(0.08, 0.12);
        addFlowerPiece(fig, L.local, [colorize(orient(LEAF.clone().scale(s, s, s), L.dir, rr(-0.6, 0.6)), i % 2 ? '#5c9c48' : '#6cb052')], 0.0 + (i / leafSpots.length) * 1.0, 'leaf');
      });
    }
    const garden = skinned(flGeos, flowerMat, flBones, false);

    /* ---------- two tiny helicopters circling ---------- */
    const helis = [];
    for (const [r, y, w, ph] of [[0.82, 2.22, 0.5, 0], [0.98, 1.72, -0.36, 2.4]]) {
      const g = new THREE.Group(); plant.add(g);
      const body = new THREE.Mesh(mergeGeometries([
        new THREE.SphereGeometry(1, 12, 8).scale(0.016, 0.014, 0.026),
        new THREE.CylinderGeometry(0.003, 0.005, 0.05, 5).rotateX(Math.PI / 2).translate(0, 0.004, -0.045),
        new THREE.BoxGeometry(0.002, 0.016, 0.01).translate(0, 0.01, -0.068),
        new THREE.CylinderGeometry(0.0018, 0.0018, 0.04, 4).rotateX(Math.PI / 2).translate(0.011, -0.016, 0),
        new THREE.CylinderGeometry(0.0018, 0.0018, 0.04, 4).rotateX(Math.PI / 2).translate(-0.011, -0.016, 0),
      ].map((q) => q.toNonIndexed())), heliMat);
      const rotor = new THREE.Mesh(mergeGeometries([new THREE.BoxGeometry(0.1, 0.0015, 0.006), new THREE.BoxGeometry(0.006, 0.0015, 0.1)]), rotorMat);
      rotor.position.y = 0.017; g.add(body, rotor);
      helis.push({ g, rotor, r, y, w, ph, blink: rr(0, 1) });
    }

    /* ---------- lights: the curse lights her from below and behind ---------- */
    const redLight = new THREE.PointLight('#ff2a1a', 0, 3.4, 1.5); redLight.position.set(0, 0.95, 0.75); plant.add(redLight);
    const backLight = new THREE.PointLight('#ff3020', 0, 3.2, 1.4); backLight.position.set(0, 1.9, -0.9); plant.add(backLight);
    const dawnLight = new THREE.PointLight('#ffe0b0', 0, 5, 1.2); dawnLight.position.set(0.6, 2.7, 1.5); plant.add(dawnLight);

    /* =====================================================================
       Motion
       ===================================================================== */
    const flare = new Spring(60, 8);
    let cureT = 0, shockT = -1;
    const crumbled = new Set();
    const tmp = new V3(), tmp2 = new V3();
    const chest = () => fig.localToWorld(new V3(0, 0.95, 0.16));
    const orbWorld = () => orb.getWorldPosition(new V3());
    const soilPoint = () => { const a = rnd(0, TAU), r = rnd(0.05, 0.4); return plant.localToWorld(new V3(Math.sin(a) * r, 0.75, Math.cos(a) * r)); };
    const crackPoint = () => { const a = rnd(-1.2, 1.2), y = rnd(0.1, 0.55); return plant.localToWorld(new V3(Math.sin(a) * (potR(y) + 0.01), y, Math.cos(a) * (potR(y) + 0.01))); };
    const ccol = new THREE.Color();

    return {
      centre: chest,
      anchor: () => head.localToWorld(new V3(0.34, 0.16, 0)),
      react(type) {
        if (type === 'wrong') {          // the curse flares: eyes, orb, windows, cracks, a shockwave
          flare.kick(9); shockT = 0; shock.visible = true;
          const o = orbWorld();
          for (let i = 0; i < 18; i++) spark.emit(o.clone().add(randDir().multiplyScalar(0.04)), { v: randDir().multiplyScalar(rnd(0.5, 1.2)), life: rnd(0.4, 0.8), s0: 0.09, s1: 0, color: '#ff4a2a', drag: 2 });
          for (let i = 0; i < 16; i++) spark.emit(soilPoint(), { v: new V3(rnd(-0.2, 0.2), rnd(0.6, 1.1), rnd(-0.2, 0.2)), life: rnd(0.9, 1.5), s0: 0.07, s1: 0.02, color: '#ff3020', drag: 0.8 });
          for (let i = 0; i < 10; i++) wisp.emit(soilPoint(), { v: new V3(rnd(-0.25, 0.25), rnd(0.4, 0.8), rnd(-0.25, 0.25)), life: rnd(1.2, 1.8), s0: 0.2, s1: 0.6, color: '#1c1719', drag: 1, a: 0.5 });
        } else {                          // relief: a crack seals, the orb cools
          const c = crackPoint();
          for (let i = 0; i < 12; i++) spark.emit(c.clone().add(randDir().multiplyScalar(0.03)), { v: randDir().multiplyScalar(rnd(0.15, 0.4)), life: rnd(0.7, 1.1), s0: 0.07, s1: 0.01, color: '#e8f4ff', drag: 1.6 });
          const o = orbWorld();
          for (let i = 0; i < 8; i++) spark.emit(o.clone().add(randDir().multiplyScalar(0.06)), { v: randDir().multiplyScalar(0.3), life: 0.8, s0: 0.06, s1: 0.01, color: '#bfe8ff', drag: 1.6 });
        }
      },
      burst() {
        for (let i = 0; i < 30; i++) { const d = randDir(); d.y = Math.abs(d.y); spark.emit(head.localToWorld(new V3(0, 0.1, 0)).addScaledVector(d, 0.1), { v: d.multiplyScalar(rnd(0.4, 1)), life: rnd(1, 1.6), s0: 0.08, s1: 0.01, color: '#ffffff', g: -0.3, drag: 1.4 }); }
      },
      reset() { cureT = 0; shockT = -1; shock.visible = false; crumbled.clear(); flare.set(0); },
      update(s) {
        const { t, dt, h, hp, sick, heal } = s;
        const wrongW = s.react?.type === 'wrong' ? s.react.w : 0, rightW = s.react?.type === 'right' ? s.react.w : 0;
        if (heal.on) cureT = heal.T; else if (s.healed || h > 0.97) cureT += dt; else { cureT = 0; crumbled.clear(); }
        const drain = sstep(0.05, 0.75, cureT);            // the red drains away
        const gold = sstep(0.6, 1.1, cureT) * (1 - sstep(2.6, 3.2, cureT));
        const out = sstep(1.5, 3.0, cureT);                // windows go out like dawn
        const cure = sstep(0.6, 1.6, cureT);
        const g = clamp(h * 0.38 + cure * 0.62, 0, 1);     // stone colour: a step per card, the rest at the cure
        const curse = (1 - drain) * (1 - 0.32 * h);
        flare.step(dt);
        const fl = Math.max(0, flare.x) / 9 * 3;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
        const beat = heartbeat(t, 0.9) * M;

        /* colours */
        for (const [m, k] of [[gownMat, 'stone'], [armMat, 'stone'], [headMat, 'head'], [rig.lidMat, 'stone'], [hairMat, 'hair'], [potMat, 'pot'], [bldMat, 'bld'],
          [soilMat, 'soil'], [pebMat, 'peb'], [rootMat, 'root'], [clawMat, 'claw']]) P.mix(m, k, g);
        P.mix(vineMat, 'vine', clamp(cure * 0.92 + h * 0.08, 0, 1));
        P.mix(poolMat, 'pool', clamp(cure * 0.85 + h * 0.15, 0, 1));
        poolMat.emissive.copy(RED).lerp(ccol.set('#4fa8d6'), cure); poolMat.emissiveIntensity = 0.06 * curse + 0.1 * cure;
        soilMat.emissiveIntensity = (0.08 + 0.1 * pulse) * curse + wrongW * 0.25;
        P.mix(lipMat, 'lip', clamp(drain * 0.85 + h * 0.15, 0, 1)); P.mix(lipInMat, 'lipIn', clamp(drain * 0.85 + h * 0.15, 0, 1));
        P.mix(eyeWhiteMat, 'eyeW', drain); P.mix(irisMat, 'iris', drain);
        for (const m of irisMesh) { const k = lerp(0.55, 0.78, drain); m.scale.set(k, k, k * 0.36); }
        eyeWhiteMat.emissiveIntensity = (0.75 + 0.15 * pulse) * curse + fl * 1.2 + wrongW * 0.6;
        irisMat.emissiveIntensity = (0.6 * curse + fl) * (1 - drain);
        crownMat.emissiveIntensity = (0.75 + 0.2 * pulse) * curse + fl * 0.8 + wrongW * 0.4;
        P.mix(ringMat, 'ring', cure); ringMat.opacity = 0.62 + 0.15 * pulse * curse + wrongW * 0.35;
        runeMat.opacity = Math.min(1, runeMat.opacity * 1.7 + wrongW * 0.4);
        P.mix(lights.rim, 'rim', g);
        lights.key.intensity = lerp(1.9, 2.4, g);
        redLight.intensity = (1.6 + 0.6 * pulse) * curse + wrongW * 2.5 + fl * 1.2;
        backLight.intensity = 2.6 * curse + wrongW * 1.5;
        dawnLight.intensity = cure * 1.3 + gold * 1.2;

        /* the windows: spreading from the soil up, flaring on a wrong card, going dark with care */
        U.uTime.value = t;
        const base = lerp(0.74, 0.26, h) + 0.06 * Math.sin(t * 0.45) * sick * M + wrongW * 0.42 - rightW * 0.14;
        U.uLit.value = lerp(lerp(base, 0.85, gold > 0 ? sstep(0.6, 0.9, cureT) : 0), -0.12, out);
        U.uGold.value = sstep(0.6, 1.1, cureT);
        U.uGlow.value = (0.95 + 0.25 * fl + 0.2 * wrongW) * (1 - 0.4 * drain * (1 - U.uGold.value));
        U.uDark.value = 1 - 0.82 * sstep(1.8, 3.2, cureT);

        /* the pot: cracks pulse and spread; healing seals them and the Tw turns green */
        CU.uSpread.value = lerp(0.62, 0.3, h) + 0.04 * Math.sin(t * 0.7) * M + wrongW * 0.5 - drain * 0.7;
        CU.uCrackI.value = (0.75 + 0.6 * pulse) * curse + wrongW * 1.4 + fl * 0.5;
        CU.uTwC.value.copy(RED).lerp(GREEN, drain);
        CU.uTwI.value = lerp((1.05 + 0.3 * pulse) * (1 - 0.25 * h) + wrongW * 0.6, 0.6, drain);

        /* the orb: pulses, blazes on a wrong card, dims with each right one, cools to a soft green */
        P.mix(orbMat, 'orb', drain);
        const orbS = (1 + 0.1 * beat * curse) * lerp(1, 0.78, h) * (1 + fl * 0.25 + wrongW * 0.35) * (1 - 0.35 * cure);
        orbG.scale.setScalar(Math.max(1e-3, orbS));
        orbG.position.copy(PALM).add(tmp.set(0, 0.03 + Math.sin(t * 1.3) * 0.008 * M, 0.06 + cure * 0.03));
        orb.rotation.y = t * 0.8;
        sigRing.rotation.set(t * 0.9, t * 1.3, 0);
        P.mix(sigRingMat, 'halo', drain); sigRingMat.opacity = 0.9 * (1 - cure * 0.8);
        P.mix(haloMat, 'halo', drain);
        haloMat.opacity = clamp((0.5 + 0.2 * beat) * curse + fl * 0.6 + wrongW * 0.4 + 0.35 * cure, 0, 1);
        halo.position.copy(orbWorld()); halo.quaternion.copy(camera.quaternion);
        halo.scale.setScalar((0.32 + 0.1 * beat * curse + fl * 0.25 + wrongW * 0.3) * lerp(1, 0.75, h) * (1 - 0.3 * cure));

        /* her: breathing, a slow regal sway, the stern face */
        const breath = Math.sin(t * 1.1) * M, fk = s.k.flinch.x;
        fig.rotation.set(Math.sin(t * 0.45) * 0.008 * M - fk * 0.03 + wrongW * 0.035, s.k.spin.x * 0.05, Math.sin(t * 0.5) * 0.012 * M + s.k.shake.x * 0.02);
        fig.position.y = FIG_Y + s.k.bounce.x * 0.008;
        gown.scale.set(1 + breath * 0.008, 1, 1 + breath * 0.012);
        neck.rotation.set(lerp(0.07, -0.03, hp) + wrongW * 0.12 + Math.sin(t * 0.4) * 0.02 * M - cure * 0.04, Math.sin(t * 0.3) * 0.06 * M, Math.sin(t * 0.6) * 0.015 * M + cure * 0.07);
        armR.rotation.set(wrongW * 0.2 + Math.sin(t * 0.7) * 0.02 * M, 0, Math.sin(t * 0.55) * 0.03 * M + wrongW * 0.1 - cure * 0.06);
        armL.rotation.set(Math.sin(t * 0.5 + 1) * 0.02 * M, 0, -Math.sin(t * 0.5) * 0.015 * M - wrongW * 0.07);
        bHL.rotation.set(Math.sin(t * 0.6) * 0.02 * M, 0, Math.sin(t * 0.8) * 0.025 * M - wrongW * 0.1 - fl * 0.03);
        bHR.rotation.set(Math.sin(t * 0.6 + 1) * 0.02 * M, 0, Math.sin(t * 0.8 + 0.7) * 0.025 * M + wrongW * 0.1 + fl * 0.03);
        if (heal.on && heal.T > 0.6) rig.over({ w: 0.04, open: 0.06, smile: 0.6, brow: 0.08 }, 1);

        /* the crown gives way to blossoms */
        crown.scale.setScalar(Math.max(1e-3, 1 - sstep(0.7, 1.25, cureT)));
        crown.userData.ear.scale.setScalar(Math.max(1e-3, 1 - sstep(0.7, 1.25, cureT)));

        /* the city crumbles into sparkles; flowers and leaves grow in its place */
        for (const c of clusters) {
          const d = 0.75 + c.bi * 0.08, cr = sstep(d, d + 0.55, cureT);
          c.bone.scale.set(Math.max(1e-3, 1 - cr * 0.5), Math.max(1e-3, 1 - cr), Math.max(1e-3, 1 - cr * 0.5));
          c.bone.rotation.z = Math.sin(t * 40 + c.bi) * 0.03 * sstep(0, 0.2, cr) * (1 - cr);
          if (cr > 0.02 && cr < 0.95 && Math.random() < dt * 40) {
            const p = c.parent.localToWorld(tmp.copy(c.local).add(tmp2.set(rnd(-0.06, 0.06), rnd(0, 0.2) * (1 - cr), rnd(-0.06, 0.06))));
            spark.emit(p, { v: new V3(rnd(-0.3, 0.3), rnd(0.2, 0.7), rnd(-0.3, 0.3)), life: rnd(0.6, 1.1), s0: rnd(0.05, 0.09), s1: 0.01, color: Math.random() < 0.5 ? '#ffd68a' : '#d8d2e0', g: -0.3, drag: 1.5 });
            if (Math.random() < 0.3) wisp.emit(p, { v: new V3(rnd(-0.1, 0.1), rnd(0.1, 0.3), rnd(-0.1, 0.1)), life: 1, s0: 0.08, s1: 0.22, color: '#bdb6c4', a: 0.35, drag: 1 });
          }
        }
        garden.visible = cureT > 0.9; city3.visible = cureT < 2.2;
        for (const f of flowers) {
          const st = (f.kind === 'leaf' ? 1.0 : f.kind === 'crown' ? 1.0 : f.kind === 'palm' ? 1.1 : 1.15) + f.delay;
          const k = clamp((cureT - st) / 0.55, 0, 1);
          const sc = k > 0 ? backOut(k) : 0;
          f.bone.scale.setScalar(Math.max(1e-3, sc));
          if (f.kind !== 'leaf' && k >= 1) f.bone.rotation.y = Math.sin(t * 0.8 + f.delay * 7) * 0.08 * M;
        }

        /* helicopters circle; healed, they fly off */
        const away = sstep(0.8, 2.4, cureT);
        for (const hl of helis) {
          const a = t * hl.w + hl.ph, r = hl.r + away * 1.6;
          hl.g.position.set(Math.sin(a) * r, hl.y + away * 1.2 + Math.sin(t * 1.3 + hl.ph) * 0.03, Math.cos(a) * r);
          hl.g.rotation.set(0.12 * Math.sign(hl.w), a + Math.PI / 2 * Math.sign(hl.w), -0.15 * Math.sign(hl.w));
          hl.g.scale.setScalar(Math.max(1e-3, 1 - away));
          hl.g.visible = away < 0.99;
          hl.rotor.rotation.y = t * 40;
          hl.blink += dt;
          if (hl.blink > 1 && away < 0.5) { hl.blink = 0; spark.emit(hl.g.localToWorld(tmp.set(0, -0.01, 0.02)), { life: 0.25, s0: 0.05, s1: 0.02, color: '#ff3020', a: 0.9 }); }
        }

        /* the pool: slow ripples; the wrong card sends a shockwave out */
        for (let i = 0; i < 2; i++) {
          const k = ((t * 0.32 + i * 0.5) % 1);
          ripples[i].scale.setScalar(lerp(0.45, 1.04, k));
          ripples[i].material.opacity = 0.22 * Math.sin(Math.PI * k) * (0.5 + 0.5 * curse + cure * 0.6);
          ripples[i].material.color.copy(RED).lerp(ccol.set('#d8f4ff'), cure);
        }
        if (shockT >= 0) {
          shockT += dt;
          const k = clamp(shockT / 0.9, 0, 1);
          shock.scale.setScalar(lerp(0.35, 2.0, 1 - (1 - k) ** 3));
          shockMat.opacity = (1 - k) * 0.95;
          if (k >= 1) { shockT = -1; shock.visible = false; }
        }

        /* the poison: red motes and dark smoke rising from the soil */
        if (!heal.on || heal.T < 0.4) {
          if (Math.random() < dt * 8 * curse * M * (1 + wrongW * 2)) spark.emit(soilPoint(), { v: new V3(rnd(-0.06, 0.06), rnd(0.22, 0.45), rnd(-0.06, 0.06)), life: rnd(1.8, 2.8), s0: rnd(0.04, 0.065), s1: 0.015, color: Math.random() < 0.7 ? '#ff3424' : '#ff7a3a', a: 0.9 });
          if (Math.random() < dt * 2.4 * curse * M) {
            const a = rnd(0, TAU);
            wisp.emit(plant.localToWorld(tmp.set(Math.sin(a) * 0.42, 0.78, Math.cos(a) * 0.42)), { v: new V3(Math.sin(a) * 0.05, rnd(0.18, 0.32), Math.cos(a) * 0.05), life: rnd(2.2, 3.2), s0: 0.14, s1: 0.5, color: '#211b1e', a: 0.42 });
          }
          if (Math.random() < dt * 1.2 * curse * M) spark.emit(crackPoint(), { v: new V3(0, rnd(0.05, 0.15), 0), life: rnd(0.8, 1.4), s0: 0.04, s1: 0.01, color: '#ff4a2a', a: 0.8 });
        }
      },
    };
  },
};
