/* 9. Hydatidiform Mole: the Bubble-Cluster Vine.
   From her slide (refs/p21_0.jpg): soft glowing night-blue storybook, thin
   dark-plum ink. A slender lilac-white trunk of two strands wound round each
   other rises from a flat disc of cracked pinkish-tan earth, little light
   streaks rising from the cracks. On top, a big luminous berry made entirely of
   translucent pink-lilac bubbles (glossy, glowing from inside, a cream rim of
   light), a small blue-green calyx and stem, and inside it a faint curled baby
   made of the same lilac bubbles. A swirl of cyan aura arcs round the fruit.
   Four bunches of bubble-grapes hang from curling branches, a few pale leaves,
   tendrils ending in bead-buds, sparkles all round.
   The bubbles are sphere impostors: one instanced quad each, ray-traced to a
   sphere in the fragment shader (depth written, its own thin ink ring), so the
   hundreds of them cost one draw call and can each bud, swell and pop.
   Healed (my addition, from the doc's cure: removal, then hCG follow-up): the
   abnormal bubbles pop away into sparkles, a single healthy cherry blossom opens
   where the bubble fruit was, the bunches turn into fresh green leaves and small
   flowers, the aura settles into a gentle glow and the cracked earth heals. */

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FRUIT_R = 0.44, TRUNK_LEN = 1.42, DISC_R = 1.15, DISC_H = 0.07, FRUIT_UP = 0.42;

export default {
  id: 'mole',
  look: { ink: '#3a2142', bands: [116, 172, 224, 255], outline: 0.0032, rune: ['#c9a2f2', '#9fe8c4'], bg: ['#5a6aab', '#2b356c', '#111533'] },
  frame: { halfH: 1.46, halfW: 1.3, lookY: 1.3, camLift: 0.24 },
  careTitle: 'Clear the bubbles',
  lines: {
    sick: 'Too many bubbles!',
    wrong: ['More bubbles!', 'It keeps growing!'],
    right: ['Pop!', 'A little lighter.'],
    healed: 'All clear.',
  },
  shows: [
    '<b>Bubbles that keep budding and swelling</b>, tiny new ones popping up all over the clusters: the abnormal, runaway growth of trophoblast tissue in a molar pregnancy.',
    '<b>An oversized fruit that keeps swelling</b>: a uterus larger than expected for the dates.',
    '<b>A pulsing, over-bright glow</b>: very high hCG levels.',
    '<b>Dark-red drips</b> from the lowest grapes: vaginal bleeding.',
    '<b>The whole vine swaying queasily</b>, heaving now and then: excessive nausea and vomiting.',
    '<b>A faint baby shape among the bubbles</b>: a partial mole may hold some fetal tissue, a complete mole none; neither pregnancy can continue.',
  ],
  healedNote: 'Healed, the abnormal bubbles are cleared away (uterine evacuation, then serial hCG checks), the glow calms, the cracked earth heals smooth, and a single healthy blossom opens where the bubble fruit was.',

  build(kit) {
    const { THREE, world, scene, camera, toon, noOutline, canvasTex, sheet, limb, taperTube, lumpGeo, addLeaf, palette, Spring,
      spark, particles, randDir, rnd, M, REDUCE, clamp, lerp, sstep, backOut, V3, TAU, DEG, UP, lights, tex, mergeGeometries, look } = kit;
    const R = rng(21092026);
    const rr = (a, b) => a + (b - a) * R();
    const GROUND = DISC_H;

    /* ---------- her light: cool night, lilac bounce, cyan rim from the aura ---------- */
    lights.hemi.color.set('#ece8ff'); lights.hemi.groundColor.set('#4d3e70'); lights.hemi.intensity = 1.25;
    lights.key.color.set('#fff2f6'); lights.key.intensity = 2.2;
    lights.rim.color.set('#8fe4ff'); lights.rim.intensity = 1.5;
    lights.fill.color.set('#d8c8ff'); lights.fill.intensity = 0.6;
    lights.heal.color.set('#ffd6ea');
    const glowLight = new THREE.PointLight('#ff9ad6', 0, 3.6, 1.6);   // the hCG glow lights its own vine
    scene.add(glowLight);

    const P = palette({
      trunk: ['#cdbfe8', '#e2d6e2'], leaf: ['#d3dccb', '#7cc466'], bead: ['#c8b0f0', '#93d270'],
      calyx: ['#78b8b4', '#62b05a'], earth: ['#d59f99', '#d9b19c'], earthSide: ['#ae7887', '#b48a80'],
      pebble: ['#c2898f', '#c79a8c'], core: ['#d996d4', '#f0c0d4'],
    });

    /* ---------- textures ---------- */
    // the earth: red = cracks, green = soft mottling, lighter in the middle like her disc
    const cracks = [];
    for (let i = 0; i < 10; i++) {
      let a = (i / 10) * TAU + rr(-0.25, 0.25), r = rr(0.14, 0.3);
      const pts = [[Math.cos(a) * r, Math.sin(a) * r]];
      const end = rr(0.72, 1.06);
      while (r < end) {
        r += rr(0.06, 0.11); a += rr(-0.24, 0.24);
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        if (R() < 0.2) {
          const b = [[pts.at(-1)[0], pts.at(-1)[1]]]; let ba = a + (R() < 0.5 ? -0.7 : 0.7), br = r;
          for (let k = 0; k < 3; k++) { br += rr(0.04, 0.08); ba += rr(-0.3, 0.3); b.push([Math.cos(ba) * br, Math.sin(ba) * br]); }
          cracks.push({ pts: b, w: 1.6 });
        }
      }
      cracks.push({ pts, w: 2.6 });
    }
    for (let i = 0; i < 6; i++) {
      let a = rr(0, TAU), r = rr(0.45, 0.95); const pts = [[Math.cos(a) * r, Math.sin(a) * r]];
      for (let k = 0; k < 3; k++) { a += rr(-0.12, 0.12); r += rr(-0.04, 0.06); const s = rr(0.05, 0.09); pts.push([pts.at(-1)[0] + Math.cos(a + 1.4) * s, pts.at(-1)[1] + Math.sin(a + 1.4) * s]); }
      cracks.push({ pts, w: 1.5 });
    }
    // CylinderGeometry's top cap: uv.x follows z, uv.y follows x (and canvases are flipped in y)
    const toCanvas = (x, z, S) => [(z / DISC_R * 0.5 + 0.5) * S, (0.5 - x / DISC_R * 0.5) * S];
    const earthMask = canvasTex(512, 512, (x, w) => {
      const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, 'rgb(0,215,0)'); g.addColorStop(0.55, 'rgb(0,150,0)'); g.addColorStop(1, 'rgb(0,70,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, w);
      for (let i = 0; i < 60; i++) {
        x.fillStyle = `rgba(0,${R() < 0.5 ? 255 : 30},0,.12)`;
        x.beginPath(); x.ellipse(rr(0, w), rr(0, w), rr(10, 40), rr(6, 22), rr(0, TAU), 0, TAU); x.fill();
      }
      x.strokeStyle = '#f00'; x.lineCap = 'round'; x.lineJoin = 'round';
      for (const c of cracks) {
        x.lineWidth = c.w; x.beginPath();
        c.pts.forEach(([px, pz], i) => { const [u, v] = toCanvas(px * DISC_R, pz * DISC_R, w); i ? x.lineTo(u, v) : x.moveTo(u, v); });
        x.stroke();
      }
    }, { srgb: false });

    // the baby: her curled silhouette, head full of little bubbles, drawn once and laid over the fruit
    // a single outline, facing left as she drew it: big round head, face in profile, fist at the chin,
    // back curled round, knees drawn up, a foot tucked under
    const babyPath = (x) => {
      x.beginPath();
      x.moveTo(150, 28);
      x.arc(150, 80, 52, -Math.PI / 2, 0.62);
      x.bezierCurveTo(216, 138, 224, 186, 200, 214);
      x.bezierCurveTo(186, 234, 152, 240, 128, 232);
      x.bezierCurveTo(114, 240, 98, 242, 90, 236);
      x.quadraticCurveTo(80, 230, 84, 222);
      x.bezierCurveTo(70, 212, 62, 196, 72, 182);
      x.bezierCurveTo(86, 170, 110, 168, 124, 160);
      x.bezierCurveTo(120, 150, 110, 142, 104, 134);
      x.bezierCurveTo(92, 132, 86, 118, 96, 110);
      x.bezierCurveTo(100, 106, 97, 102, 98, 98);
      x.quadraticCurveTo(91, 93, 95, 86);
      x.bezierCurveTo(98, 77, 100, 68, 104, 60);
      x.bezierCurveTo(112, 38, 130, 28, 150, 28);
      x.closePath();
    };
    const babyTex = canvasTex(256, 256, (x) => {
      x.lineJoin = 'round'; x.lineCap = 'round';
      babyPath(x);
      const fg = x.createRadialGradient(150, 120, 10, 150, 140, 120);
      fg.addColorStop(0, 'rgba(196,188,255,.62)'); fg.addColorStop(1, 'rgba(150,138,236,.5)');
      x.fillStyle = fg; x.fill();
      x.strokeStyle = '#3e2266'; x.lineWidth = 5; x.stroke();
      // inner lines: the arm to the fist, the thigh, an ear, a closed eye
      x.lineWidth = 3; x.strokeStyle = 'rgba(62,34,102,.9)';
      x.beginPath(); x.moveTo(156, 124); x.bezierCurveTo(140, 140, 118, 140, 104, 128); x.stroke();
      x.beginPath(); x.moveTo(80, 186); x.bezierCurveTo(118, 196, 150, 196, 176, 214); x.stroke();
      x.beginPath(); x.arc(162, 94, 8, -1.2, 2.2); x.stroke();
      x.beginPath(); x.arc(114, 76, 6, 0.3, 2.6); x.stroke();
      // the bubbles in the head
      const placed = [];
      for (let k = 0; k < 500 && placed.length < 15; k++) {
        const a = rr(0, TAU), d = Math.sqrt(R()) * 34, r = rr(7, 12);
        const bx = 160 + Math.cos(a) * d, by = 70 + Math.sin(a) * d;
        if (Math.hypot(bx - 150, by - 80) + r > 48 || bx - r < 120) continue;
        if (placed.some(([px, py, pr]) => Math.hypot(px - bx, py - by) < (pr + r) * 0.85)) continue;
        placed.push([bx, by, r]);
      }
      for (const [bx, by, r] of placed) {
        x.fillStyle = 'rgba(200,194,255,.85)'; x.beginPath(); x.arc(bx, by, r, 0, TAU); x.fill();
        x.strokeStyle = 'rgba(74,42,110,.75)'; x.lineWidth = 1.6; x.stroke();
        x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(bx - r * 0.35, by - r * 0.35, r * 0.25, 0, TAU); x.fill();
      }
    });
    const babyPix = babyTex.image.getContext('2d').getImageData(0, 0, 256, 256).data;

    const haloTex = canvasTex(256, 256, (x, w) => {
      const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, 'rgba(255,220,240,0)'); g.addColorStop(0.5, 'rgba(255,230,220,0)');
      g.addColorStop(0.6, 'rgba(255,242,214,.95)'); g.addColorStop(0.67, 'rgba(255,196,232,.5)');
      g.addColorStop(0.82, 'rgba(236,160,236,.16)'); g.addColorStop(1, 'rgba(190,150,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, w);
    });
    const petalTex = canvasTex(64, 128, (x, w, h) => {
      const g = x.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, '#e9689a'); g.addColorStop(0.3, '#f5a2c0'); g.addColorStop(0.75, '#fac6d8'); g.addColorStop(1, '#fde4ec');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(226,104,148,.35)'; x.lineWidth = 1.5; x.lineCap = 'round';
      for (const s of [-1, 0, 1]) { x.beginPath(); x.moveTo(w / 2, h); x.quadraticCurveTo(w / 2 + s * w * 0.1, h * 0.6, w / 2 + s * w * 0.24, h * 0.32); x.stroke(); }
    });

    /* ---------- materials ---------- */
    const trunkMat = toon('#d8cceb', { thickness: 0.0034 });
    const leafMat = toon('#d3dccb', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.0026 });
    const beadMat = toon('#c8b0f0', { thickness: 0.0024, emissive: '#b080ff', emissiveIntensity: 0.25 });
    const calyxMat = toon('#78b8b4', { side: THREE.DoubleSide, thickness: 0.0026 });
    const stemMat = toon('#78b8b4', { thickness: 0.0028 });
    const coreMat = toon('#d996d4', { thickness: 0, emissive: '#ff9ad8', emissiveIntensity: 0.3 });
    const bunchCoreMat = toon('#c99ae0', { thickness: 0, emissive: '#e08ae8', emissiveIntensity: 0.25 });
    const earthTop = toon('#d59f99', { map: earthMask, thickness: 0.0034 });
    const earthU = { uCrack: { value: 1 }, uCrackCol: { value: new THREE.Color('#5a3050') } };
    earthTop.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, earthU);
      sh.fragmentShader = 'uniform float uCrack;\nuniform vec3 uCrackCol;\n' + sh.fragmentShader.replace('#include <map_fragment>', `
        vec4 em = texture2D( map, vMapUv );
        diffuseColor.rgb *= 0.84 + em.g * mix( 0.42, 0.3, uCrack );
        diffuseColor.rgb = mix( diffuseColor.rgb, uCrackCol, em.r * 0.9 * uCrack );`);
    };
    const earthSide = toon('#ae7887', { thickness: 0.0034 });
    const pebbleMat = toon('#c2898f', { thickness: 0.0022 });
    const dripMat = toon('#7a1426', { thickness: 0.0024, emissive: '#4a0010', emissiveIntensity: 0.3 });
    const arcMat = toon('#5fc6e6', { thickness: 0.0022, ink: '#25507a', emissive: '#3aaee0', emissiveIntensity: 0.65, transparent: true });
    const petalMat = toon('#fff0f5', { map: petalTex, side: THREE.DoubleSide, thickness: 0.0024 });
    const centreMat = toon('#f07aa4', { thickness: 0.002 });
    const antherMat = toon('#ffd65e', { thickness: 0.0016, emissive: '#ffcc40', emissiveIntensity: 0.25 });
    const filMat = toon('#ffe6ee', { thickness: 0 });

    const LEAF = sheet({ width: 0.36, cup: 0.14, curl: 0.15, point: 0.75 });
    const SEPAL = sheet({ width: 0.3, cup: 0.2, curl: 0.22, tipPinch: 0.5, cols: 5, rows: 8 });
    // a cherry petal: broad, with a notch in its rounded tip
    const PETAL = sheet({ width: 0.35, cup: 0.18, curl: -0.08, tipPinch: -0.45, point: 0.45, cols: 8, rows: 12 });
    { const p = PETAL.attributes.position, uv = PETAL.attributes.uv;
      for (let i = 0; i < p.count; i++) { const u = uv.getX(i) * 2 - 1, v = uv.getY(i); p.setY(i, p.getY(i) - 0.17 * (1 - Math.abs(u)) ** 1.6 * sstep(0.72, 1, v)); }
      PETAL.computeVertexNormals(); }

    const placed = (geo, { s = 1, rx = 0, ry = 0, dir = null, at = null } = {}) => {
      const g = geo.clone(); g.scale(s, s, s);
      if (rx) g.rotateX(rx); if (ry) g.rotateY(ry);
      if (dir) g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()));
      if (at) g.translate(at.x, at.y, at.z);
      return g;
    };

    /* ---------- the cracked earth disc ---------- */
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(DISC_R, DISC_R * 0.97, DISC_H, 72, 1), [earthSide, earthTop, earthSide]);
    disc.position.y = DISC_H / 2; disc.receiveShadow = true; disc.castShadow = true; world.add(disc);
    const pebbleParts = [];
    for (let i = 0; i < 7; i++) {
      const a = rr(0, TAU), r = rr(0.45, 1.0);
      pebbleParts.push([Math.cos(a) * r, GROUND, Math.sin(a) * r, rr(0.025, 0.045), 0.45]);
    }
    const pebbles = new THREE.Mesh(lumpGeo(pebbleParts, 10, 7), pebbleMat); world.add(pebbles);

    // light streaks rising out of the cracks: crossed strips, moved in the shader
    const streakU = { uT: { value: 0 }, uAmt: { value: 1 }, uCol: { value: new THREE.Color('#ffdc96') } };
    {
      const pos = [], uv = [], nrm = [], ph = [], spd = [], idx = [];
      const segs = cracks.map((c) => c.pts);
      for (let i = 0; i < 22; i++) {
        const c = segs[Math.floor(R() * segs.length)], j = Math.floor(R() * (c.length - 1)), f = R();
        const x0 = lerp(c[j][0], c[j + 1][0], f) * DISC_R, z0 = lerp(c[j][1], c[j + 1][1], f) * DISC_R;
        if (Math.hypot(x0, z0) > DISC_R * 0.9 || Math.hypot(x0, z0) < 0.3) { i--; continue; }
        const w = rr(0.008, 0.013), hh = rr(0.11, 0.2), p0 = R(), s0 = rr(0.35, 0.6);
        for (const rot of [0, Math.PI / 2]) {
          const b = pos.length / 3, dx = Math.cos(rot) * w, dz = Math.sin(rot) * w;
          for (const [sx, sy] of [[-1, 0], [1, 0], [1, 1], [-1, 1]]) {
            pos.push(x0 + dx * sx, GROUND + sy * hh, z0 + dz * sx); uv.push(sx * 0.5 + 0.5, sy); nrm.push(0, 0, 1); ph.push(p0); spd.push(s0);
          }
          idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
      g.setAttribute('aPh', new THREE.Float32BufferAttribute(ph, 1));
      g.setAttribute('aSpd', new THREE.Float32BufferAttribute(spd, 1));
      g.setIndex(idx);
      const m = noOutline(new THREE.ShaderMaterial({
        uniforms: streakU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        vertexShader: `
          attribute float aPh; attribute float aSpd; uniform float uT; uniform float uAmt;
          varying vec2 vUv; varying float vA;
          void main() {
            float k = fract( uT * aSpd + aPh );
            vec3 p = position; p.y += k * 0.26;
            vA = sin( 3.14159 * k ) * uAmt; vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
          }`,
        fragmentShader: `
          uniform vec3 uCol; varying vec2 vUv; varying float vA;
          void main() {
            float a = 1.0 - abs( vUv.x * 2.0 - 1.0 );
            a = a * a * smoothstep( 0.0, 0.3, vUv.y ) * ( 1.0 - smoothstep( 0.5, 1.0, vUv.y ) );
            gl_FragColor = vec4( uCol, a * vA );
            #include <colorspace_fragment>
          }`,
      }));
      const streaks = new THREE.Mesh(g, m); streaks.frustumCulled = false; world.add(streaks);
    }

    /* ---------- the twisted trunk ---------- */
    const tree = new THREE.Group(); tree.position.y = GROUND - 0.015; world.add(tree);
    const NB = 6;
    const trunk = limb({ len: TRUNK_LEN, r0: 0.07, r1: 0.046, bones: NB, mat: trunkMat, strands: 2, twist: 1.15, spread: 0.06, radial: 10 });
    tree.add(trunk.mesh);
    const REST = [[0.16, 0.03], [-0.18, -0.02], [-0.16, 0.02], [0.1, 0], [0.14, -0.03], [-0.02, 0]];   // her S-curve: [z, x] per bone
    trunk.bones.forEach((b, i) => b.rotation.set(REST[i][1], 0, REST[i][0]));
    world.updateMatrixWorld(true);
    const SEG = trunk.seg;
    const boneAt = (h) => trunk.bones[clamp(Math.floor(h / SEG), 0, NB - 1)];
    const trunkPt = (h) => { const b = boneAt(h), i = trunk.bones.indexOf(b); return tree.worldToLocal(b.localToWorld(new V3(0, h - i * SEG, 0))); };
    /** Build in tree space, then hand to the trunk bone at height h so it rides the sway. */
    const ride = (obj, h) => { tree.add(obj); world.updateMatrixWorld(true); boneAt(h).attach(obj); return obj; };

    // root flare spreading over the disc
    {
      const parts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + rr(-0.3, 0.3), L = rr(0.26, 0.42), d = new V3(Math.cos(a), 0, Math.sin(a));
        parts.push(taperTube([new V3(0, 0.2, 0), d.clone().multiplyScalar(0.07).setY(0.08), d.clone().multiplyScalar(L * 0.6).setY(0.025), d.clone().multiplyScalar(L).setY(0.012)], 0.05, 0.008, { segs: 16, radial: 7 }));
      }
      const roots = new THREE.Mesh(mergeGeometries(parts), trunkMat); roots.castShadow = true; tree.add(roots);
    }

    /* ---------- branches, tendrils, bead-buds and the bunch hooks ---------- */
    function curl(start, ang, len, k0, k1, dz = 0, n = 26) {
      const pts = []; let x = start.x, y = start.y, a = ang; const ds = len / n;
      for (let i = 1; i <= n; i++) { a += lerp(k0, k1, i / n) * ds; x += Math.cos(a) * ds; y += Math.sin(a) * ds; pts.push(new V3(x, y, start.z + dz * i / n)); }
      return pts;
    }
    const BR = [
      { h: 1.06, via: [[-0.22, 1.04, -0.04], [-0.46, 1.2, -0.08]], tip: [-0.6, 1.3, -0.1], curl: [2.0, 0.5, 0, -15, 0.02], L: 0.5, Rt: 0.165, rb: [0.046, 0.062] },
      { h: 0.8, via: [[0.2, 0.9, 0.04], [0.42, 1.1, 0.07]], tip: [0.6, 1.18, 0.08], curl: [0.25, 0.6, 0, -13, -0.04], L: 0.52, Rt: 0.17, rb: [0.046, 0.064] },
      { h: 0.56, via: [[-0.2, 0.58, 0.08]], tip: [-0.44, 0.62, 0.14], curl: [2.4, 0.2, 0, 18, 0.02], L: 0.27, Rt: 0.09, rb: [0.03, 0.04] },
      { h: 0.6, via: [[0.18, 0.6, -0.06]], tip: [0.36, 0.62, -0.1], curl: [0.05, 0.36, 0, 15, 0.02], L: 0.3, Rt: 0.095, rb: [0.031, 0.041] },
    ];
    const bunches = [];
    for (const b of BR) {
      const g = new THREE.Group();
      const tip = new V3(...b.tip);
      const [ang, len, k0, k1, dz] = b.curl;
      const tail = curl(tip, ang, len, k0, k1, dz);
      const base = trunkPt(b.h);
      const pts = [base.clone().add(new V3(Math.sign(tip.x) * -0.02, -0.02, 0)), base, ...b.via.map((v) => new V3(...v)), tip, ...tail];
      g.add(Object.assign(new THREE.Mesh(taperTube(pts, 0.03, 0.006, { segs: 70, radial: 7 }), trunkMat), { castShadow: true }));
      // bead-buds along the curl and at its end
      const beads = [];
      const end = tail.at(-1), prev = tail.at(-2);
      beads.push(new THREE.SphereGeometry(0.027, 12, 9).translate(end.x, end.y, end.z));
      for (const f of [0.45, 0.7, 0.86]) {
        const i = Math.floor(f * (tail.length - 1)), p = tail[i], q = tail[i + 1];
        const tan = q.clone().sub(p).normalize(), side = new V3(-tan.y, tan.x, 0).multiplyScalar(R() < 0.5 ? 1 : -1);
        const r = rr(0.014, 0.02);
        beads.push(new THREE.SphereGeometry(r, 10, 8).translate(p.x + side.x * (r + 0.008), p.y + side.y * (r + 0.008), p.z));
      }
      void prev;
      g.add(new THREE.Mesh(mergeGeometries(beads), beadMat));
      const pivot = new THREE.Group(); pivot.position.copy(tip).add(new V3(0, -0.01, 0)); g.add(pivot);
      ride(g, b.h);
      bunches.push({ ...b, g, pivot, ph: rr(0, TAU), bub: [] });
    }

    // a few pale leaves, as she drew them
    for (const [h, off, dWell, dSick, size] of [
      [1.3, [-0.04, 0, 0.03], [-0.85, 0.6, 0.25], [-0.85, 0.1, 0.3], 0.22],
      [1.18, [0.04, 0, 0.02], [0.75, 0.55, 0.3], [0.8, 0.05, 0.3], 0.17],
      [1.06, [-0.3, 1.08 - 1.06, -0.02], [-0.25, -0.9, 0.35], [-0.2, -1, 0.3], 0.18],
      [0.8, [0.3, 1.0 - 0.8, 0.05], [0.4, 0.9, 0.25], [0.6, 0.3, 0.3], 0.18],
    ]) {
      const hold = new THREE.Group();
      const at = trunkPt(h);
      if (Math.abs(off[0]) > 0.1) at.set(off[0], h + off[1], off[2]); else at.add(new V3(...off));
      hold.position.copy(at); ride(hold, h);
      const L = addLeaf(hold, new V3(), new V3(...dWell), new V3(...dSick), size, leafMat, LEAF);
      L.mesh.castShadow = false;
    }

    /* ---------- the crown: hub at the trunk tip, the bubble fruit, the blossom ---------- */
    const hub = new THREE.Group(); hub.position.copy(trunkPt(TRUNK_LEN)); ride(hub, TRUNK_LEN);
    const fruitG = new THREE.Group(); hub.add(fruitG);
    const fruitC = new THREE.Group(); fruitC.position.y = FRUIT_UP; fruitG.add(fruitC);
    const SHELL = new V3(1, 0.98, 0.86);
    const shellPt = (d) => {
      const rS = FRUIT_R * (1 + 0.055 * Math.sin(5 * Math.atan2(d.z, d.x) + 1.7 * d.y) * (1 - d.y * d.y) + 0.045 * d.y);
      return d.clone().multiplyScalar(rS).multiply(SHELL);
    };
    const core = new THREE.Mesh(new THREE.SphereGeometry(FRUIT_R * 0.93, 32, 22).scale(SHELL.x, SHELL.y, SHELL.z), coreMat);
    core.castShadow = true; fruitC.add(core);

    // the faint curled baby, laid over the front of the fruit
    const BW = 0.72, BCX = 0.04, BCY = 0.0;
    const decalMat = noOutline(new THREE.MeshBasicMaterial({ map: babyTex, transparent: true, depthWrite: false, opacity: 0.85 }));
    {
      const g = new THREE.PlaneGeometry(BW, BW, 18, 18), p = g.attributes.position;
      const a = FRUIT_R * 1.06 + 0.075, b = FRUIT_R * 1.06 * 0.98 + 0.075, c = FRUIT_R * 1.06 * 0.86 + 0.075;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) + BCX, y = p.getY(i) + BCY;
        p.setXYZ(i, x, y, c * Math.sqrt(Math.max(0.02, 1 - (x / a) ** 2 - (y / b) ** 2)));
      }
      g.computeVertexNormals();
      fruitC.add(new THREE.Mesh(g, decalMat));
    }
    const inBaby = (p) => {
      if (p.z < 0.1) return false;
      const u = (p.x - BCX) / BW + 0.5, v = 0.5 - (p.y - BCY) / BW;
      if (u < 0 || u > 1 || v < 0 || v > 1) return false;
      return babyPix[(Math.floor(v * 255) * 256 + Math.floor(u * 255)) * 4 + 3] > 128;
    };

    // the swirling cyan aura: tapered brush-stroke arcs round the fruit
    const auraG = new THREE.Group(); fruitC.add(auraG);
    const arcs = [];
    for (const [rad, a0, a1, th, tilt] of [
      [0.66, 105, 22, 0.03, 0.25], [0.71, 8, -62, 0.024, -0.2], [0.69, 168, 232, 0.026, 0.35],
      [0.63, -78, -38, 0.016, 0.1], [0.6, 122, 150, 0.012, -0.3], [0.74, 250, 285, 0.014, 0.2],
    ]) {
      const n = 40, pts = [];
      for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n) * DEG; pts.push(new V3(Math.cos(a) * rad, Math.sin(a) * rad, 0)); }
      const curve = new THREE.CatmullRomCurve3(pts);
      const g = new THREE.TubeGeometry(curve, n, 1, 6, false), p = g.attributes.position;
      for (let j = 0; j <= n; j++) {
        const c = curve.getPointAt(j / n), r = th * Math.sin(Math.PI * j / n) ** 0.7 + 0.0015;
        for (let i = 0; i <= 6; i++) {
          const k = j * 7 + i;
          p.setXYZ(k, c.x + (p.getX(k) - c.x) * r, c.y + (p.getY(k) - c.y) * r, c.z + (p.getZ(k) - c.z) * r * 0.4);
        }
      }
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, arcMat); m.rotation.y = tilt; auraG.add(m);
      arcs.push({ m, pts });
    }

    // the crown group carries what is not swollen: calyx, stem, neck and the blossom
    const crownG = new THREE.Group(); hub.add(crownG);
    const BLOSSOM_AT = new V3(0, 0.2, 0.05), BLOSSOM_TILT = 0.95;
    const blossomQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(BLOSSOM_TILT, 0, 0));
    const calyxG = new THREE.Group(); crownG.add(calyxG);
    for (let i = 0; i < 5; i++) {
      const az = (i / 5) * TAU + 0.4, out = new V3(Math.sin(az), 0, Math.cos(az));
      const L = addLeaf(calyxG, out.clone().multiplyScalar(0.02), out.clone().add(new V3(0, 0.12, 0)), out.clone().add(new V3(0, -0.22, 0)), 0.21, calyxMat, SEPAL, out.clone().multiplyScalar(0.4).add(new V3(0, 1, 0)));
      L.roll = 0; L.flutter = 0.5;
    }
    const stem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(0, -0.01, 0), new V3(0.03, 0.08, 0), new V3(-0.025, 0.15, 0.01)), 12, 0.017, 7), stemMat);
    stem.castShadow = true; calyxG.add(stem);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.046, 1, 10).translate(0, 0.5, 0), trunkMat);
    neck.quaternion.setFromUnitVectors(UP, BLOSSOM_AT.clone().normalize()); crownG.add(neck);
    const BLOSSOM_LEN = BLOSSOM_AT.length();

    const blossom = new THREE.Group(); blossom.position.copy(BLOSSOM_AT); blossom.quaternion.copy(blossomQ); crownG.add(blossom);
    const petals = [];
    for (let i = 0; i < 5; i++) {
      const arm = new THREE.Group(); arm.rotation.y = (i / 5) * TAU + 0.3; blossom.add(arm);
      const p = new THREE.Mesh(PETAL, petalMat); p.scale.setScalar(0.37); p.position.z = 0.02; p.castShadow = true;
      arm.add(p); petals.push(p);
    }
    {
      blossom.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 10).scale(1, 0.55, 1), centreMat));
      const fil = [], anth = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU + rr(-0.1, 0.1), tilt = rr(0.45, 0.8), len = rr(0.08, 0.11);
        const d = new V3(Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a));
        fil.push(placed(new THREE.CylinderGeometry(0.0035, 0.005, len, 5).translate(0, len / 2, 0), { dir: d }));
        anth.push(new THREE.SphereGeometry(0.012, 8, 6).translate(d.x * len, d.y * len, d.z * len));
      }
      blossom.add(new THREE.Mesh(mergeGeometries(fil), filMat), new THREE.Mesh(mergeGeometries(anth), antherMat));
    }

    // the healed bunches: fresh leaves and two small blossoms on each hook
    const smallBlossom = (s, dir, at) => {
      const ps = [], cs = [];
      for (let i = 0; i < 5; i++) ps.push(placed(PETAL, { s, rx: 1.15, ry: (i / 5) * TAU }));
      cs.push(new THREE.SphereGeometry(s * 0.2, 10, 7));
      const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
      return [mergeGeometries(ps).applyQuaternion(q).translate(at.x, at.y, at.z), mergeGeometries(cs).applyQuaternion(q).translate(at.x, at.y, at.z)];
    };
    for (const bn of bunches) {
      const k = bn.L / 0.5;
      const sprig = new THREE.Group(); bn.pivot.add(sprig);
      const lv = [];
      for (const [dx, dy, dz, ry] of [[-0.8, -0.35, 0.35, 0.3], [0.8, -0.25, 0.3, -0.4], [0.1, -0.9, 0.45, 0.1], [-0.2, 0.5, -0.6, 0.6]]) {
        lv.push(placed(LEAF, { s: 0.15 * Math.max(0.7, k), ry, dir: new V3(dx, dy, dz) }));
      }
      const [p1, c1] = smallBlossom(0.09 * Math.max(0.75, k), new V3(-0.35, 0.2, 1), new V3(-0.05, -0.08, 0.07));
      const [p2, c2] = smallBlossom(0.075 * Math.max(0.75, k), new V3(0.45, -0.2, 1), new V3(0.07, -0.15, 0.05));
      sprig.add(new THREE.Mesh(mergeGeometries(lv), leafMat), new THREE.Mesh(mergeGeometries([p1, p2]), petalMat), new THREE.Mesh(mergeGeometries([c1, c2]), antherMat));
      sprig.scale.setScalar(1e-4); sprig.visible = false;
      bn.sprig = sprig;
      // a small core inside the bunch so its gaps read as more bubble, and it casts a shadow
      const parts = [];
      for (let j = 0; j < 5; j++) { const v = j / 4; parts.push([0, -0.03 - v * bn.L * 0.95, 0, bn.Rt * (1 - 0.75 * v) * 0.85]); }
      bn.core = new THREE.Mesh(lumpGeo(parts, 12, 9), bunchCoreMat); bn.core.castShadow = true; bn.pivot.add(bn.core);
    }

    // the over-bright hCG halo: a camera-facing glow with a cream rim at the fruit's edge
    const haloMat = noOutline(new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffffff' }));
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat); halo.frustumCulled = false; scene.add(halo);
    const haloSick = new THREE.Color('#fff0dc'), haloWell = new THREE.Color('#ffc4dc');

    /* ---------- the bubbles: sphere impostors, one draw call ---------- */
    const MAXB = 720;
    const qgeo = new THREE.InstancedBufferGeometry();
    qgeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    qgeo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    qgeo.setIndex([0, 1, 2, 0, 2, 3]);
    const iPos = new THREE.InstancedBufferAttribute(new Float32Array(MAXB * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const iRad = new THREE.InstancedBufferAttribute(new Float32Array(MAXB), 1).setUsage(THREE.DynamicDrawUsage);
    const iCol = new THREE.InstancedBufferAttribute(new Float32Array(MAXB * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const iGlow = new THREE.InstancedBufferAttribute(new Float32Array(MAXB), 1).setUsage(THREE.DynamicDrawUsage);
    qgeo.setAttribute('iPos', iPos); qgeo.setAttribute('iRad', iRad); qgeo.setAttribute('iCol', iCol); qgeo.setAttribute('iGlow', iGlow);
    qgeo.instanceCount = 0;
    const B = look.bands.map((v) => v / 255);
    const bubU = {
      uInk: { value: 0.0031 * Math.tan(15 * DEG) }, uInkCol: { value: new THREE.Color('#4e2c66') },
      uL: { value: new V3(0, 1, 0) }, uGlow: { value: 0.5 }, uGlowCol: { value: new THREE.Color('#ffd0ee') },
      uRim: { value: new THREE.Color('#fff0dc') }, uBands: { value: new THREE.Vector4(B[0], B[1], B[2], B[3]) },
    };
    const bubMat = noOutline(new THREE.ShaderMaterial({
      uniforms: bubU,
      vertexShader: `
        attribute vec3 iPos; attribute float iRad; attribute vec3 iCol; attribute float iGlow;
        uniform float uInk;
        varying vec3 vC; varying vec3 vP; varying float vR; varying float vRo; varying vec3 vCol; varying float vGlow;
        void main() {
          vec4 c = modelViewMatrix * vec4( iPos, 1.0 );
          vR = iRad; vRo = iRad + uInk * -c.z;
          vec3 p = c.xyz + vec3( position.xy * vRo * 1.2, 0.0 );
          vC = c.xyz; vP = p; vCol = iCol; vGlow = iGlow;
          gl_Position = projectionMatrix * vec4( p, 1.0 );
        }`,
      fragmentShader: `
        uniform mat4 projectionMatrix;
        uniform vec3 uInkCol; uniform vec3 uL; uniform float uGlow; uniform vec3 uGlowCol; uniform vec3 uRim; uniform vec4 uBands;
        varying vec3 vC; varying vec3 vP; varying float vR; varying float vRo; varying vec3 vCol; varying float vGlow;
        void main() {
          vec3 rd = normalize( vP );
          float b = dot( rd, vC ), cc = dot( vC, vC );
          float hO = b * b - cc + vRo * vRo;
          if ( hO < 0.0 ) discard;
          float hI = b * b - cc + vR * vR;
          vec3 hit, col;
          if ( hI < 0.0 ) { hit = rd * ( b - sqrt( hO ) ); col = uInkCol; }
          else {
            hit = rd * ( b - sqrt( hI ) );
            vec3 n = ( hit - vC ) / vR;
            float facing = clamp( dot( n, -rd ), 0.0, 1.0 );
            float d = dot( n, uL ) * 0.5 + 0.5;
            float band = d < 0.25 ? uBands.x : d < 0.5 ? uBands.y : d < 0.75 ? uBands.z : uBands.w;
            col = vCol * ( 0.42 + 0.6 * band );
            col += vCol * uGlowCol * pow( facing, 1.6 ) * ( 0.12 + 0.5 * ( uGlow + vGlow ) );
            col = mix( col, uRim, pow( 1.0 - facing, 2.2 ) * 0.3 );
            float s1 = smoothstep( 0.9, 0.925, dot( n, normalize( vec3( -0.42, 0.55, 0.72 ) ) ) );
            float s2 = smoothstep( 0.955, 0.972, dot( n, normalize( vec3( 0.48, -0.42, 0.77 ) ) ) );
            col = mix( col, vec3( 1.0 ), max( s1 * 0.9, s2 * 0.55 ) );
          }
          vec4 clip = projectionMatrix * vec4( hit, 1.0 );
          gl_FragDepth = ( clip.z / clip.w ) * 0.5 + 0.5;
          gl_FragColor = vec4( col, 1.0 );
          #include <colorspace_fragment>
        }`,
    }));
    const bubMesh = new THREE.Mesh(qgeo, bubMat); bubMesh.frustumCulled = false; scene.add(bubMesh);
    const popFx = particles(tex.spark, 700, THREE.AdditiveBlending);

    const hosts = [fruitC, ...bunches.map((b) => b.pivot)];
    const hostM = hosts.map(() => new THREE.Matrix4()), hostS = hosts.map(() => 1);
    const bubbles = [], byHost = hosts.map(() => []);
    const addBub = (o) => {
      const b = { st: 'live', s: 1, k: 0, glow: 0, ph: rr(0, TAU), f: rr(0.8, 2.2), sw: rr(0.05, 0.17), wp: new V3(), wr: 0, ...o };
      bubbles.push(b); byHost[b.host].push(b); return b;
    };
    const PINK = new THREE.Color('#ee90d2'), PALE = new THREE.Color('#f6c2e6'), LILAC = new THREE.Color('#b590f0'), BABYC = new THREE.Color('#a49ff4');
    const fruitCol = (d) => {
      if (R() < 0.16) return PALE.clone();
      return PINK.clone().lerp(LILAC, clamp(0.45 + 0.4 * (d.x * 0.6 - d.y * 0.4) + rr(-0.3, 0.3), 0, 1));
    };
    {
      const N1 = 230;
      for (let i = 0; i < N1; i++) {
        const y = 1 - 2 * (i + 0.5) / N1, rad = Math.sqrt(1 - y * y), a = i * 2.39996;
        const d = new V3(Math.cos(a) * rad + rr(-0.05, 0.05), y + rr(-0.03, 0.03), Math.sin(a) * rad + rr(-0.05, 0.05)).normalize();
        if (d.y > 0.88) continue;
        const r = rr(0.052, 0.09), p = shellPt(d).addScaledVector(d, -r * 0.35);
        addBub({ host: 0, p, r, col: inBaby(p) ? BABYC.clone() : fruitCol(d), thr: rr(0.12, 0.97), kind: 'fruit' });
      }
      for (let i = 0; i < 110; i++) {
        const d = randDirR(); if (d.y > 0.84) { i--; continue; }
        const r = rr(0.03, 0.05), p = shellPt(d).addScaledVector(d, -r * 0.05);
        addBub({ host: 0, p, r, col: inBaby(p) ? BABYC.clone() : fruitCol(d), thr: rr(0.12, 0.97), kind: 'fruit' });
      }
    }
    function randDirR() { return new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize(); }
    const TOPC = new THREE.Color('#f7bfe2'), BOTC = new THREE.Color('#a596f0');
    bunches.forEach((bn, bi) => {
      const host = bi + 1, [rb0, rb1] = bn.rb;
      const rows = Math.max(4, Math.round(bn.L / (rb1 * 1.4)));
      for (let j = 0; j < rows; j++) {
        const v = j / (rows - 1), y = -0.035 - v * bn.L;
        const Rr = bn.Rt * (1 - 0.8 * v ** 1.15) * (j === 0 ? 0.8 : 1), rb = lerp(rb1, rb0, v);
        const n = Math.max(1, Math.round(TAU * Rr / (rb * 1.55)));
        for (let k = 0; k < n; k++) {
          const a = (k / n) * TAU + j * 0.9 + rr(-0.2, 0.2), rad = n === 1 ? 0 : Rr;
          addBub({ host, p: new V3(Math.cos(a) * rad, y + rr(-0.012, 0.012), Math.sin(a) * rad), r: rb * rr(0.88, 1.1), col: TOPC.clone().lerp(BOTC, clamp(v + rr(-0.2, 0.2), 0, 1)), thr: rr(0.12, 0.97), kind: 'bunch' });
        }
      }
      // the lowest grape, where the dark sap gathers
      bn.low = addBub({ host, p: new V3(0, -0.035 - bn.L - rb0 * 0.7, 0), r: rb0 * 1.05, col: new THREE.Color('#b0709e'), thr: 0.6, kind: 'bunch' });
    });
    // buds: a pool of tiny new bubbles that pop into being and swell
    const buds = [];
    for (let i = 0; i < 90; i++) buds.push(addBub({ host: 0, p: new V3(), r: 0.03, col: PALE.clone(), kind: 'bud', st: 'off', s: 0, life: 0 }));
    function spawnBud(big) {
      const b = buds.find((q) => q.st === 'off'); if (!b) return;
      const host = R() < 0.58 ? 0 : 1 + Math.floor(R() * 4);
      let base = null;
      for (let k = 0; k < 8 && !base; k++) { const c = byHost[host][Math.floor(R() * byHost[host].length)]; if (c.kind !== 'bud' && c.st === 'live') base = c; }
      if (!base) return;
      const out = host === 0 ? base.p.clone().normalize() : new V3(base.p.x, 0, base.p.z);
      if (out.lengthSq() < 1e-4) out.set(0, -1, 0);
      out.normalize().multiplyScalar(0.8).add(randDir().multiplyScalar(0.6)).normalize();
      if (b.host !== host) { byHost[b.host].splice(byHost[b.host].indexOf(b), 1); byHost[host].push(b); b.host = host; }
      b.p.copy(base.p).addScaledVector(out, base.r * 0.95);
      b.r = big ? rr(0.04, 0.07) : rr(0.022, 0.042); b.big = big;
      b.col.copy(base.col).lerp(PALE, 0.35);
      b.st = 'grow'; b.k = big ? -rnd(0, 0.25) : 0; b.life = rr(3, 6.5); b.glow = big ? 1.6 : 1;
      b.fresh = true;
    }

    /* ---------- the dark-red drips ---------- */
    const DROP = new THREE.SphereGeometry(0.024, 12, 9);
    const SPLAT = new THREE.SphereGeometry(0.05, 14, 6);
    const drips = [2, 3, 1].map((bi, i) => {
      const drop = new THREE.Mesh(DROP, dripMat); drop.visible = false; drop.castShadow = true; world.add(drop);
      const sm = toon('#6c1022', { thickness: 0.0018, transparent: true });
      const splat = new THREE.Mesh(SPLAT, sm); splat.visible = false; splat.scale.set(1, 0.1, 1); world.add(splat);
      return { b: bunches[bi].low, drop, splat, sm, st: 'wait', k: 0.6 + i * 1.1, y: 0, v: 0, sk: 99 };
    });

    /* ---------- motion state ---------- */
    const flare = new Spring(60, 8), balloon = new Spring(70, 6.5), crownS = new Spring(90, 9), sprigS = new Spring(80, 8);
    let heave = null, nextHeave = 4, budAcc = 0, starAcc = 0, dotAcc = 0, auraSpin = 0;
    const AURA_TILT = new THREE.Euler(-0.22, 0.15, 0);
    const _v = new V3(), _v2 = new V3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(), _L = new V3();
    const sickGreen = new THREE.Color('#c2d8a4');
    const fruitCentre = () => fruitC.localToWorld(new V3());
    const blossomCentre = () => blossom.localToWorld(new V3(0, 0.03, 0));
    const centre = () => {
      const k = clamp(crownS.x, 0, 1);
      return k < 0.01 ? fruitCentre() : fruitCentre().lerp(blossomCentre(), k);
    };
    function popBubble(b, delay) { if (b.st === 'live' || b.st === 'grow') { b.st = 'wait'; b.k = delay; } }

    return {
      centre,
      anchor: () => centre().add(new V3(0.5, 0.5, 0)),
      react(type) {
        if (type === 'wrong') {          // the growth flares: a burst of new bubbles, the fruit balloons
          for (let i = 0; i < 32; i++) spawnBud(true);
          balloon.kick(3.2); flare.kick(6);
        } else {                         // relief: the new buds pop into sparkles, the glow dips
          for (const b of buds) popBubble(b, rnd(0, 0.35));
          flare.kick(-3);
        }
      },
      burst() { heave = null; for (const b of buds) popBubble(b, rnd(0, 0.5)); },
      reset() {
        heave = null;
        for (const b of buds) { b.st = 'off'; b.s = 0; }
        for (const d of drips) { d.st = 'wait'; d.k = rnd(0.5, 2); d.drop.visible = false; d.splat.visible = false; d.sk = 99; }
      },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        const killAll = heal.burst || s.healed;
        const hT = killAll ? 1.01 : s.hTarget;
        kit.leafFold = clamp(s.k.flinch.x, 0, 1) * 0.6;
        flare.step(dt); balloon.step(dt);
        crownS.target = sstep(0.8, 1, h); crownS.step(dt);
        sprigS.target = sstep(0.82, 1, h); sprigS.step(dt);
        const hb = clamp(crownS.x, 0, 1.15), hbc = clamp(hb, 0, 1);

        /* hCG: a pulsing, over-bright glow */
        const pulse = Math.pow(0.5 + 0.5 * Math.sin(t * 2.7), 3) * M;
        const glow = clamp(sick * (0.45 + 0.95 * pulse) + Math.max(0, flare.x) * 0.5 - Math.max(0, -flare.x) * 0.2, 0, 2.2);
        bubU.uGlow.value = 0.15 + glow * 0.75 + heal.gather * 0.6;

        /* colours */
        P.mix(trunkMat, 'trunk', h); P.mix(leafMat, 'leaf', h); P.mix(beadMat, 'bead', h);
        P.mix(calyxMat, 'calyx', h); P.mix(stemMat, 'calyx', h); P.mix(earthTop, 'earth', h); P.mix(earthSide, 'earthSide', h);
        P.mix(pebbleMat, 'pebble', h); P.mix(coreMat, 'core', h);
        beadMat.emissiveIntensity = 0.25 * sick;
        coreMat.emissiveIntensity = 0.12 + glow * 0.4; bunchCoreMat.emissiveIntensity = 0.1 + glow * 0.3;
        earthU.uCrack.value = clamp(1 - h * 1.05, 0, 1);
        streakU.uT.value = t; streakU.uAmt.value = clamp(sick * 1.2, 0, 1) * (0.5 + 0.3 * pulse);

        /* nausea: the whole vine sways queasily, and now and then heaves */
        nextHeave -= dt;
        if (nextHeave <= 0) { if (!heal.on && sick > 0.3 && !REDUCE) heave = { t: 0, dur: 1.7 }; nextHeave = rnd(5, 8); }
        let hv = 0;
        if (heave) { heave.t += dt; hv = Math.sin(Math.PI * clamp(heave.t / heave.dur, 0, 1)) * sick; if (heave.t > heave.dur) heave = null; }
        if (hv > 0) trunkMat.color.lerp(sickGreen, hv * 0.5);
        const fl = s.k.flinch.x, sh = s.k.shake.x;
        trunk.bones.forEach((b, i) => {
          const q = sick * M;
          const z = q * (0.034 * Math.sin(t * 0.62 + i * 0.5) + 0.018 * Math.sin(t * 1.37 + i * 0.85 + 1.3)) + h * 0.008 * Math.sin(t * 0.8 + i * 0.3) * M
            + sh * 0.025 + (hv * 0.03 * Math.sin(t * 9 + i)) * (i > 2 ? 1 : 0);
          const x = q * (0.028 * Math.sin(t * 0.51 + i * 0.55 + 2) + 0.014 * Math.sin(t * 1.11 + i)) + hv * 0.05 - (i < 2 ? fl * 0.09 : 0);
          b.rotation.set(REST[i][1] + x, 0, REST[i][0] + z);
        });
        tree.rotation.y = s.k.spin.x * 0.1;

        /* the fruit: oversized, swelling, ballooning on a wrong card */
        const big = lerp(1.08, 0.94, clamp(s.hp, 0, 1.2));
        const swell = 1 + 0.035 * Math.sin(t * 1.25) * sick * M + glow * 0.012;
        const bal = 1 + Math.max(-0.2, balloon.x) * 0.3 + (s.react?.type === 'wrong' ? s.react.w * 0.2 : 0);
        const sc = big * swell * bal * (1 - 0.08 * heal.gather);
        fruitG.scale.set(sc * (1 + hv * 0.05), sc * (1 - hv * 0.08) * (1 + s.k.bounce.x * 0.03), sc);
        fruitG.rotation.set(Math.sin(t * 0.7 + 1) * 0.05 * sick * M, 0, Math.sin(t * 0.9) * 0.06 * sick * M);
        crownG.rotation.copy(fruitG.rotation);
        core.scale.setScalar(Math.max(1e-4, 1 - sstep(0.75, 0.97, h)));
        core.visible = core.scale.x > 0.01;
        decalMat.opacity = 0.85 * (1 - sstep(0.45, 0.9, h)) * (0.92 + 0.08 * pulse);
        fruitC.children[1].visible = decalMat.opacity > 0.01;

        /* the aura swirls; it fades into a calm glow as she heals */
        const auraK = 1 - sstep(0.55, 0.95, h);
        auraSpin -= dt * (lerp(0.75, 0.3, h) + Math.max(0, flare.x) * 1.4) * M;
        arcMat.opacity = auraK * (0.8 + 0.2 * pulse);
        auraG.scale.setScalar(lerp(0.7, 1, auraK) * (1 + 0.03 * Math.sin(t * 1.7) * M));
        auraG.visible = auraK > 0.01;

        /* the crown: calyx slides from the fruit top to behind the blossom */
        const topY = (FRUIT_UP + FRUIT_R * 1.0) * fruitG.scale.y + 0.03;
        calyxG.position.set(0, topY, 0).lerp(_v.copy(BLOSSOM_AT).addScaledVector(_v2.set(0, 1, 0).applyQuaternion(blossomQ), -0.035), hbc);
        calyxG.quaternion.identity().slerp(blossomQ, hbc);
        calyxG.scale.setScalar(lerp(1, 1.15, hbc));
        stem.scale.setScalar(Math.max(1e-4, 1 - hbc)); stem.visible = hbc < 0.99;
        neck.scale.set(1, Math.max(1e-4, BLOSSOM_LEN * hbc), 1); neck.visible = hbc > 0.01;
        blossom.scale.setScalar(Math.max(1e-4, hb)); blossom.visible = hb > 0.01;
        blossom.rotation.z = Math.sin(t * 0.6) * 0.06 * M;
        for (const p of petals) p.rotation.x = lerp(0.2, 1.22, clamp(hb, 0, 1.1)) + Math.sin(t * 1.3 + p.parent.rotation.y * 2) * 0.03 * M * hbc;
        const sg = clamp(sprigS.x, 0, 1.15);
        for (const bn of bunches) {
          bn.sprig.scale.setScalar(Math.max(1e-4, sg)); bn.sprig.visible = sg > 0.01;
          bn.core.scale.setScalar(Math.max(1e-4, 1 - sstep(0.7, 0.95, h))); bn.core.visible = bn.core.scale.x > 0.01;
        }

        /* bunches hang from their hooks and swing; the aura keeps facing you, like a glow */
        world.updateMatrixWorld(true);
        fruitC.getWorldQuaternion(_q).invert();
        AURA_TILT.z = auraSpin;
        auraG.quaternion.copy(_q).multiply(_q2.setFromEuler(AURA_TILT));
        for (const bn of bunches) {
          bn.pivot.parent.getWorldQuaternion(_q).invert();
          _e.set(Math.sin(t * 0.8 + bn.ph) * (0.07 * sick + 0.02) * M + fl * 0.1, 0, Math.sin(t * 0.63 + bn.ph) * (0.09 * sick + 0.02) * M + sh * 0.05 + hv * 0.12 * Math.sin(t * 6));
          _q2.setFromEuler(_e).premultiply(world.quaternion);
          bn.pivot.quaternion.copy(_q).multiply(_q2);
          bn.pivot.updateMatrixWorld(true);
        }

        /* the bubbles: bud, swell, pop */
        hosts.forEach((ho, i) => { hostM[i].copy(ho.matrixWorld); hostS[i] = _v.setFromMatrixScale(ho.matrixWorld).x; });
        const budRate = heal.on || s.healed ? 0 : 7 * clamp(sick * 1.3 - 0.1, 0, 1) * M;
        budAcc += dt * budRate;
        while (budAcc > 1) { budAcc -= 1; spawnBud(false); }
        const pos = iPos.array, rad = iRad.array, col = iCol.array, gl = iGlow.array;
        let n = 0;
        for (const b of bubbles) {
          let sc2 = 0;
          if (b.kind === 'bud') {
            if (b.st === 'grow' && hT > 0.9) popBubble(b, rnd(0, 0.5));
            if (b.st === 'grow') {
              b.k += dt;
              const k0 = b.big ? 0.8 : 0.55;
              sc2 = b.k < 0 ? 0 : b.k < 0.25 ? backOut(b.k / 0.25) * k0 : k0 + (1 - k0) * sstep(0.25, 2.4, b.k);
              b.glow = Math.max(0, (b.big ? 1.6 : 1) - Math.max(0, b.k) * 1.5);
              if (b.k > b.life) { b.st = 'shrink'; b.k = 0; }
            } else if (b.st === 'shrink') {
              b.k += dt; sc2 = 1 - b.k / 0.9;
              if (b.k > 0.9) { b.st = 'off'; sc2 = 0; }
            }
          } else {
            const allowed = b.thr > hT;
            if ((b.st === 'live' || b.st === 'grow') && !allowed) { b.st = 'wait'; b.k = killAll ? rnd(0, 0.9) : rnd(0, 0.6); }
            if (b.st === 'dead' && allowed) { b.st = 'grow'; b.k = -rnd(0, 1.2); }
            if (b.st === 'wait' && allowed) b.st = 'live';
            if (b.st === 'live') sc2 = 1;
            else if (b.st === 'grow') { b.k += dt; sc2 = b.k < 0 ? 0 : backOut(clamp(b.k / 0.5, 0, 1)); if (b.k >= 0.5) b.st = 'live'; }
          }
          if (b.st === 'wait') { b.k -= dt; sc2 = 1; if (b.k <= 0) { b.st = 'pop'; b.k = 0; } }
          if (b.st === 'pop') {
            b.k += dt; sc2 = 1 + 0.4 * Math.sin(Math.PI * clamp(b.k / 0.14, 0, 1)); b.glow = 1.2;
            if (b.k >= 0.14) {
              b.st = b.kind === 'bud' ? 'off' : 'dead'; sc2 = 0; b.glow = 0;
              for (let k = 0; k < 2; k++) popFx.emit(b.wp, { v: randDir().multiplyScalar(rnd(0.3, 0.9)), life: rnd(0.45, 0.85), s0: Math.max(0.06, b.wr * 2.4), s1: 0, color: ['#ffd6f0', '#ffffff', '#e6d2ff'][k + (n % 2)], drag: 2.5, g: 0.3 });
            }
          }
          b.s = sc2;
          if (sc2 <= 0.001) continue;
          const swell2 = 1 + b.sw * sick * M * Math.sin(t * b.f + b.ph) + 0.05 * heal.gather * Math.sin(t * 40 + b.ph);
          b.wp.copy(b.p).applyMatrix4(hostM[b.host]);
          b.wr = b.r * sc2 * swell2 * hostS[b.host];
          if (b.fresh && b.k >= 0) { b.fresh = false; spark.emit(b.wp, { v: new V3(0, 0.15, 0), life: b.big ? 0.7 : 0.5, s0: b.big ? 0.16 : 0.07, s1: 0, color: '#ffc4ec' }); }
          if (n >= MAXB) continue;
          pos[n * 3] = b.wp.x; pos[n * 3 + 1] = b.wp.y; pos[n * 3 + 2] = b.wp.z;
          rad[n] = b.wr; col[n * 3] = b.col.r; col[n * 3 + 1] = b.col.g; col[n * 3 + 2] = b.col.b; gl[n] = b.glow;
          n++;
        }
        qgeo.instanceCount = n; bubMesh.visible = n > 0;
        iPos.needsUpdate = iRad.needsUpdate = iCol.needsUpdate = iGlow.needsUpdate = true;
        _L.copy(lights.key.position).sub(lights.key.target.position).normalize().transformDirection(camera.matrixWorldInverse);
        bubU.uL.value.copy(_L);

        /* bleeding: dark-red drops gather on the lowest grapes, fall and splat */
        const dripOn = sick > 0.3 && !heal.on && !s.healed;
        for (const d of drips) {
          if (d.st === 'wait') {
            d.drop.visible = false; d.k -= dt;
            if (d.k <= 0 && dripOn && d.b.st === 'live') { d.st = 'grow'; d.k = 0; }
          } else if (d.st === 'grow') {
            d.k += dt;
            if (d.b.st !== 'live' && d.b.st !== 'wait') { d.st = 'wait'; d.k = 1; continue; }
            const g = sstep(0, 1.3, d.k);
            world.worldToLocal(_v.copy(d.b.wp)); _v.y -= d.b.wr + 0.012 + 0.012 * g;
            d.drop.position.copy(_v); d.drop.scale.set(g, g * (1 + g * 0.4), g); d.drop.visible = g > 0.02;
            if (d.k > 1.3) { d.st = 'fall'; d.v = 0; d.y = _v.y; }
          } else {
            d.v -= 9.8 * 0.55 * dt; d.y += d.v * dt;
            d.drop.position.y = d.y; d.drop.scale.set(0.8, 1.45, 0.8);
            if (d.y <= GROUND + 0.012) {
              d.st = 'wait'; d.k = rnd(1.0, 2.6) / Math.max(sick, 0.35); d.drop.visible = false;
              d.splat.position.set(d.drop.position.x, GROUND + 0.002, d.drop.position.z); d.sk = 0;
            }
          }
          d.sk += dt;
          const sk = d.sk;
          d.splat.visible = sk < 3.5;
          if (d.splat.visible) {
            const g = 0.35 + 0.65 * sstep(0, 0.25, sk);
            d.splat.scale.set(g, 0.1, g * 0.8);
            d.sm.opacity = 0.9 * (1 - sstep(1.2, 3.5, sk)) * (heal.on || s.healed ? 0.5 : 1);
          }
        }

        /* the glow: halo, light, sparkles */
        const fc = fruitCentre(), cc = centre();
        halo.position.copy(fc).lerp(blossomCentre(), hbc);
        halo.quaternion.copy(camera.quaternion);
        halo.scale.setScalar(lerp(1.72 * hostS[0], 1.15, hbc) * (1 + 0.04 * pulse * sick));
        haloMat.color.copy(haloSick).lerp(haloWell, hbc).multiplyScalar(lerp(0.55 + glow * 0.55, 0.42 + 0.06 * Math.sin(t * 1.2), hbc) + heal.glow * 0.4);
        glowLight.position.copy(cc).add(_v.set(0, 0, 0.35));
        glowLight.intensity = lerp(0.7 + glow * 1.6, 0.5, hbc);
        glowLight.color.set(hbc > 0.5 ? '#ffc8e0' : '#ff9ad6');

        starAcc += dt * (2 + 3.5 * sick) * M;
        while (starAcc > 1) {
          starAcc -= 1;
          const d = randDir(); d.z *= 0.6;
          spark.emit(cc.clone().addScaledVector(d, rnd(0.72, 1.3)), { v: new V3(0, rnd(0.02, 0.08), 0), life: rnd(1.3, 2.4), s0: rnd(0.06, 0.12), s1: 0, color: R() < 0.7 ? '#fff1c4' : '#ffffff', a: 0.9, spin: 0 });
        }
        dotAcc += dt * 3 * auraK * M;
        while (dotAcc > 1) {
          dotAcc -= 1;
          const a = arcs[Math.floor(R() * arcs.length)], p = a.pts[Math.floor(R() * a.pts.length)];
          spark.emit(a.m.localToWorld(p.clone()), { v: randDir().multiplyScalar(0.08), life: rnd(0.6, 1.1), s0: 0.05, s1: 0, color: '#9ef0ff', a: 0.9 });
        }
      },
    };
  },
};
