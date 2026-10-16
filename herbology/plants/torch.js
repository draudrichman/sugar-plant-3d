/* 11. TORCH Infections: the Torch Sprout.
   From her slide (refs/p23_0.jpg): a starry night-blue sky. A slumped burlap
   sack printed "KITTY LITTER OF LIBERTY" in dark plum, with a round pink badge
   of a teal cat in a gold crown holding up a torch. The sack is full of
   confetti-coloured litter that also spills in a ring on the ground. Out of it
   grows a tall straight green sprout with broad leaves; on four of them sit
   cartoon germs: blue, yellow, purple and a red "C" crescent. The stem ends
   in a teal bronze torch cup holding a tall green magical flame, with a small
   teal Statue-of-Liberty figure standing in it, and a swirl of coloured smoke
   (the "TORCH screen") drifting off to one side.
   The sprout itself looks almost normal, because maternal infection is often
   silent: the germs give it away. Fever and rash: red spots on the leaves and
   the flame flaring hot. Growth restriction: a small pale bud that stays
   stunted. Newborn effects: the bud flickers.
   Healed (my addition, from her doc's "Recovery, the Bloom"): every germ pops,
   the rash fades, the flame settles into a warm golden glow, the bud opens
   into a pink flower, two fresh leaves unfurl and the litter sparkles. */

export default {
  id: 'torch',
  look: { ink: '#151a3e', bands: [100, 166, 224, 255], outline: 0.0042, rune: ['#b48cff', '#ffd36a'], bg: ['#30479a', '#18245e', '#060a24'] },
  frame: { halfH: 1.66, halfW: 1.22, lookY: 1.36 },
  careTitle: 'Screen the Torch Sprout',
  lines: {
    sick: "Something's in the soil...",
    wrong: ['Hee hee, more of us!', 'The germs are multiplying!', 'My flame is sputtering!'],
    right: ['Pop! One germ gone.', 'That one is caught!', 'A little brighter.'],
    healed: 'Torch-bright and germ-free!',
  },
  shows: [
    '<b>A sprout that looks almost normal</b>: maternal TORCH infection is often silent; only the germs riding her leaves give it away.',
    '<b>Germs marked T, O, R, C, H</b>: toxoplasmosis (hence the kitty litter), other infections such as syphilis and varicella-zoster, rubella, cytomegalovirus and herpes simplex.',
    '<b>Red spots on the leaves and the flame flaring hot orange</b>: fever, rash or swollen glands, depending on the organism.',
    '<b>A small bud that stays pale and stunted</b>: fetal growth restriction.',
    '<b>The bud flickering like a weak bulb</b>: congenital anomalies and newborn effects such as jaundice, hearing loss or neurologic problems.',
    '<b>Coloured smoke drifting from the torch</b>: the TORCH screen, testing mother and baby for each organism.',
  ],
  healedNote: 'Healed, every germ has popped, the rash fades, the green flame settles into a warm golden glow and the stunted bud opens into a healthy flower: the organism found and treated, the baby checked and followed up.',

  build(kit) {
    const { THREE, world, scene, toon, noOutline, canvasTex, sheet, limb, addLeaf, palette, Spring,
      spark, wisp, randDir, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, backOut, V3, TAU, UP, mergeGeometries, tex } = kit;

    const INK = kit.look.ink;
    const root = new THREE.Group(); world.add(root);
    const flameLight = new THREE.PointLight('#6cffa0', 1.2, 2.6, 1.6);
    scene.add(flameLight);

    const P = palette({
      leaf: ['#4e9448', '#4fb24f'], leaf2: ['#5a9e50', '#5fc25a'], stem: ['#4b8a45', '#4aa84a'],
      bud: ['#d3d6ae', '#f37fb4'], fresh: ['#7fcf6a', '#7fd96a'],
    });

    /* =====================================================================
       Canvas textures
       ===================================================================== */
    /** Burlap: tan threads over and under, a few darker blotches. */
    function burlap(x, w, h, base, step, R2) {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let j = 0; j < h / step; j++) for (let i = 0; i < w / step; i++) {
        const over = (i + j) % 2;
        x.fillStyle = over ? `rgba(255,236,200,${0.1 + R2() * 0.12})` : `rgba(70,40,15,${0.1 + R2() * 0.12})`;
        x.fillRect(i * step + 0.5, j * step + 0.5, step - 1, step - 1);
      }
      x.lineWidth = 1.2;
      for (let i = 0; i < w; i += step) { x.strokeStyle = `rgba(60,35,12,${0.12 + R2() * 0.12})`; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + (R2() - 0.5) * 4, h); x.stroke(); }
      for (let j = 0; j < h; j += step) { x.strokeStyle = `rgba(60,35,12,${0.12 + R2() * 0.12})`; x.beginPath(); x.moveTo(0, j); x.lineTo(w, j + (R2() - 0.5) * 4); x.stroke(); }
      for (let i = 0; i < 40; i++) {
        const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, 'rgba(90,55,25,.16)'); g.addColorStop(1, 'rgba(90,55,25,0)');
        x.save(); x.translate(R2() * w, R2() * h); x.scale(20 + R2() * 70, 14 + R2() * 40); x.fillStyle = g;
        x.beginPath(); x.arc(0, 0, 1, 0, TAU); x.fill(); x.restore();
      }
    }
    const R2 = kit.R;
    const SACK_V = 0.94;                     // the print's v runs 0..1 over y 0..SACK_V
    const sackTex = canvasTex(2048, 640, (x, w, h) => {
      burlap(x, w, h, '#cfa874', 8, R2);
      const cx = w / 2, vy = (y) => (1 - y / SACK_V) * h;      // world height -> canvas row
      // the words, slightly tilted like a stamp
      x.save(); x.translate(cx, vy(0.705)); x.rotate(-0.025);
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
      x.font = '900 70px "Arial Black", "Arial Bold", Arial, sans-serif';
      for (const [s, dy] of [['KITTY LITTER', -40], ['OF LIBERTY', 42]]) {
        x.lineWidth = 10; x.strokeStyle = 'rgba(255,236,200,.35)'; x.strokeText(s, 0, dy);
        x.fillStyle = '#4b1f48'; x.fillText(s, 0, dy);
      }
      x.restore();
      // the badge: a teal cat in a gold crown holding a torch, on pink
      const by = vy(0.33), BR = 128;
      x.save(); x.translate(cx, by);
      x.fillStyle = '#f0a83c'; x.beginPath(); x.arc(0, 0, BR, 0, TAU); x.fill();
      x.lineWidth = 7; x.strokeStyle = '#2a1838'; x.stroke();
      x.fillStyle = '#e46cb8'; x.beginPath(); x.arc(0, 0, BR * 0.84, 0, TAU); x.fill(); x.lineWidth = 5; x.stroke();
      x.save(); x.beginPath(); x.arc(0, 0, BR * 0.84, 0, TAU); x.clip();
      x.lineJoin = 'round'; x.lineCap = 'round'; x.strokeStyle = '#2a1838'; x.lineWidth = 6;
      const teal = '#46c4b4';
      // body
      x.fillStyle = teal; x.beginPath(); x.ellipse(8, 112, 78, 70, 0, 0, TAU); x.fill(); x.stroke();
      // raised arm and torch (viewer's left)
      x.beginPath(); x.moveTo(-40, 70); x.quadraticCurveTo(-78, 40, -70, -6); x.lineWidth = 26; x.strokeStyle = '#2a1838'; x.stroke();
      x.lineWidth = 16; x.strokeStyle = teal; x.stroke();
      x.lineWidth = 6; x.strokeStyle = '#2a1838';
      x.fillStyle = '#9a6a3a'; x.beginPath(); x.moveTo(-80, -10); x.lineTo(-60, -10); x.lineTo(-64, -48); x.lineTo(-76, -48); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#f0a83c'; x.beginPath(); x.ellipse(-70, -52, 16, 7, 0, 0, TAU); x.fill(); x.stroke();
      x.fillStyle = '#ff8a2a'; x.beginPath(); x.moveTo(-84, -56); x.quadraticCurveTo(-90, -86, -68, -104); x.quadraticCurveTo(-60, -84, -54, -74); x.quadraticCurveTo(-52, -60, -56, -56); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#ffd84a'; x.beginPath(); x.moveTo(-76, -58); x.quadraticCurveTo(-78, -76, -68, -86); x.quadraticCurveTo(-60, -70, -62, -58); x.closePath(); x.fill();
      x.fillStyle = teal; x.beginPath(); x.arc(-70, -12, 13, 0, TAU); x.fill(); x.stroke();
      // head and ears
      x.fillStyle = teal;
      for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 20 + 8, -6); x.lineTo(s * 52 + 8, -40); x.lineTo(s * 54 + 8, 6); x.closePath(); x.fill(); x.stroke(); }
      x.beginPath(); x.ellipse(8, 22, 58, 48, 0, 0, TAU); x.fill(); x.stroke();
      x.fillStyle = '#f39ac6'; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 28 + 8, -8); x.lineTo(s * 46 + 8, -28); x.lineTo(s * 46 + 8, 0); x.closePath(); x.fill(); }
      // crown
      x.fillStyle = '#f6c234'; x.beginPath(); x.moveTo(-26, -20); x.lineTo(-30, -52); x.lineTo(-14, -34); x.lineTo(8, -62); x.lineTo(28, -34); x.lineTo(46, -52); x.lineTo(42, -20); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#e4405a'; x.beginPath(); x.arc(8, -32, 6, 0, TAU); x.fill();
      // face: happy closed eyes, little w mouth, whiskers
      x.lineWidth = 5;
      for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 22 + 8, 20, 9, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
      x.fillStyle = '#e4507a'; x.beginPath(); x.arc(8, 32, 4, 0, TAU); x.fill();
      x.beginPath(); x.arc(1, 38, 7, 0.1, Math.PI - 0.1); x.stroke(); x.beginPath(); x.arc(15, 38, 7, 0.1, Math.PI - 0.1); x.stroke();
      x.lineWidth = 3;
      for (const s of [-1, 1]) for (const d of [-6, 4]) { x.beginPath(); x.moveTo(s * 34 + 8, 32 + d); x.lineTo(s * 62 + 8, 28 + d * 1.6); x.stroke(); }
      x.restore(); x.restore();
    });
    sackTex.anisotropy = 8;
    const plainTex = canvasTex(512, 512, (x, w, h) => burlap(x, w, h, '#b48d5c', 8, R2), { repeat: true });
    const rollTex = canvasTex(256, 64, (x, w, h) => burlap(x, w, h, '#d6b07c', 8, R2), { repeat: true });
    rollTex.repeat.set(10, 1);
    const fillTex = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#cdd6f2'; x.fillRect(0, 0, w, h);
      const cols = ['#f06aa8', '#5aa0f0', '#6ad08a', '#f2d34a', '#a070e0', '#58d0cf', '#ffffff'];
      for (let i = 0; i < 900; i++) { x.fillStyle = cols[i % cols.length]; x.beginPath(); x.arc(R2() * w, R2() * h, 2 + R2() * 3.5, 0, TAU); x.fill(); }
    }, { repeat: true });
    fillTex.repeat.set(2, 2);

    /** Leaf mask: red = rash spots, blue = veins. */
    const leafMask = canvasTex(128, 256, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#00f'; x.lineCap = 'round'; x.lineWidth = 4;
      x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 10); x.stroke();
      x.lineWidth = 2;
      for (let i = 1; i <= 6; i++) {
        const y = h - i * h / 7.4;
        for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w / 2 + s * w * 0.2, y - h * 0.04, w / 2 + s * w * 0.42, y - h * 0.12); x.stroke(); }
      }
      for (const [u, v, r] of [[0.3, 0.3, 15], [0.7, 0.36, 13], [0.26, 0.56, 12], [0.74, 0.6, 15], [0.3, 0.78, 11], [0.64, 0.82, 10], [0.5, 0.2, 10], [0.5, 0.92, 8], [0.62, 0.48, 9], [0.4, 0.66, 9]]) {
        const g = x.createRadialGradient(u * w, v * h, 0, u * w, v * h, r);
        g.addColorStop(0, 'rgba(255,0,0,1)'); g.addColorStop(0.75, 'rgba(255,0,0,1)'); g.addColorStop(1, 'rgba(255,0,0,0)');
        x.fillStyle = g; x.beginPath(); x.arc(u * w, v * h, r, 0, TAU); x.fill();
      }
    }, { srgb: false });

    /** A germ's face and letter: 'grin', 'blink' or 'cackle'. */
    function faceTex(letter, mode) {
      return canvasTex(128, 128, (x) => {
        x.lineJoin = 'round'; x.lineCap = 'round';
        if (letter) {
          x.font = '900 30px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.lineWidth = 7; x.strokeStyle = INK; x.strokeText(letter, 64, 24); x.fillStyle = '#ffffff'; x.fillText(letter, 64, 24);
        }
        x.strokeStyle = INK; x.lineWidth = 4.5;
        if (mode === 'grin') {
          for (const s of [-1, 1]) {
            x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(64 + s * 20, 62, 12, 14, 0, 0, TAU); x.fill(); x.stroke();
            x.fillStyle = INK; x.beginPath(); x.arc(64 + s * 20 + 3, 65, 6, 0, TAU); x.fill();
            x.fillStyle = '#fff'; x.beginPath(); x.arc(64 + s * 20 + 1, 62, 2, 0, TAU); x.fill();
            x.beginPath(); x.moveTo(64 + s * 34, 44); x.lineTo(64 + s * 10, 52); x.stroke();      // sly brows
          }
          x.beginPath(); x.moveTo(46, 88); x.quadraticCurveTo(64, 104, 84, 86); x.stroke();
          x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(70, 93); x.lineTo(76, 92); x.lineTo(73, 99); x.closePath(); x.fill();
        } else if (mode === 'blink') {
          for (const s of [-1, 1]) { x.beginPath(); x.moveTo(64 + s * 30, 62); x.quadraticCurveTo(64 + s * 20, 68, 64 + s * 10, 62); x.stroke(); }
          x.beginPath(); x.moveTo(46, 88); x.quadraticCurveTo(64, 104, 84, 86); x.stroke();
        } else {
          for (const s of [-1, 1]) {
            x.beginPath(); x.moveTo(64 + s * 31, 64); x.quadraticCurveTo(64 + s * 20, 50, 64 + s * 9, 64); x.stroke();
            x.beginPath(); x.moveTo(64 + s * 34, 42); x.lineTo(64 + s * 8, 52); x.stroke();
          }
          x.fillStyle = '#6e1428'; x.beginPath(); x.moveTo(40, 78); x.quadraticCurveTo(64, 82, 88, 78); x.quadraticCurveTo(84, 118, 64, 118); x.quadraticCurveTo(44, 118, 40, 78); x.closePath(); x.fill(); x.stroke();
          x.fillStyle = '#ff7a96'; x.beginPath(); x.ellipse(64, 110, 12, 6, 0, 0, TAU); x.fill();
          x.fillStyle = '#ffffff'; for (const tx of [50, 64, 78]) { x.beginPath(); x.moveTo(tx - 6, 80); x.lineTo(tx + 6, 80); x.lineTo(tx, 89); x.closePath(); x.fill(); }
        }
      });
    }

    /* =====================================================================
       Materials and shared shapes
       ===================================================================== */
    const sackMat = toon('#fff4e4', { map: sackTex, thickness: 0.0048 });
    const sackIn = noOutline(new THREE.MeshToonMaterial({ color: '#8a6a48', map: plainTex, gradientMap: kit.BANDS, side: THREE.BackSide }));
    const rollMat = toon('#f6e6cc', { map: rollTex, thickness: 0.004 });
    const fillMat = toon('#ffffff', { map: fillTex, thickness: 0.0025 });
    const granMat = toon('#ffffff', { vertexColors: true, thickness: 0, emissive: '#ffffff', emissiveIntensity: 0 });
    const leafU = { uRash: { value: 1 }, uRashCol: { value: new THREE.Color('#e0344a') }, uVein: { value: new THREE.Color('#bfe39a') } };
    function leafMaterial(col) {
      const m = toon(col, { map: leafMask, side: THREE.DoubleSide, thickness: 0.004 });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, leafU);
        sh.fragmentShader = 'uniform float uRash;\nuniform vec3 uRashCol;\nuniform vec3 uVein;\n' + sh.fragmentShader.replace('#include <map_fragment>', `
          vec4 lm = texture2D( map, vMapUv );
          diffuseColor.rgb = mix( diffuseColor.rgb, uVein, lm.b * 0.55 );
          diffuseColor.rgb = mix( diffuseColor.rgb, uRashCol, lm.r * uRash );`);
      };
      m.customProgramCacheKey = () => 'torch-leaf';
      return m;
    }
    const leafMat = leafMaterial('#4e9448'), leafMat2 = leafMaterial('#5a9e50');
    const freshMat = toon('#7fcf6a', { side: THREE.DoubleSide, thickness: 0.004 });
    const stemMat = toon('#4b8a45', { thickness: 0.0042 });
    const bronze = toon('#3fa89c', { thickness: 0.0042 });
    const bronzeDark = toon('#2a7c78', { thickness: 0.0035 });
    const emberMat = noOutline(new THREE.MeshBasicMaterial({ color: '#2f8a5a' }));
    const statueMat = toon('#4ec2b0', { thickness: 0.0028 });
    const miniFlameMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ffb23a' }));
    const budMat = toon('#d3d6ae', { thickness: 0.0032, emissive: '#fffbe0', emissiveIntensity: 0 });
    const sepalMat = toon('#5a9e50', { side: THREE.DoubleSide, thickness: 0.003 });
    const petalMat = toon('#f590c0', { side: THREE.DoubleSide, thickness: 0.003 });
    const petalIn = toon('#ffb4d6', { side: THREE.DoubleSide, thickness: 0.003 });
    const pistilMat = toon('#ffd84a', { thickness: 0.003 });

    const LEAF = (() => {
      const s = sheet({ width: 0.34, cup: 0.12, curl: 0.12, point: 0.62, tipPinch: 0.22, rows: 14 }).translate(0, 0.16, 0);
      const pet = new THREE.CylinderGeometry(0.022, 0.03, 0.2, 6).translate(0, 0.09, 0);
      const uv = pet.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5, 0.01);
      return mergeGeometries([s, pet]);
    })();
    const PETAL = sheet({ width: 0.5, cup: 0.25, curl: -0.1, tipPinch: -0.3, cols: 6, rows: 6, point: 0.5 });
    const SEPAL = sheet({ width: 0.3, cup: 0.25, curl: 0.2, tipPinch: 0.5, cols: 4, rows: 5 });

    /* =====================================================================
       The sack
       ===================================================================== */
    const sackG = new THREE.Group(); root.add(sackG);
    const DEPTH = 0.8, NA = 64, NP = 28;
    const prof = new THREE.SplineCurve([[0, 0], [0.22, 0.004], [0.36, 0.024], [0.44, 0.07], [0.468, 0.15], [0.462, 0.27], [0.44, 0.42], [0.414, 0.56], [0.4, 0.68], [0.402, 0.78], [0.41, 0.86], [0.415, 0.88]].map(([r, y]) => new THREE.Vector2(r, y)));
    const yTop = (a) => 0.88 + 0.06 * Math.sin(a) ** 2 - 0.012 * Math.cos(a);
    function sackPoint(a, t, out) {
      const p = prof.getPoint(t), r0 = p.x;
      let y = p.y;
      if (y > 0.5) y += (y - 0.5) / 0.38 * (yTop(a) - 0.88);
      const fold = 1 + 0.035 * Math.sin(a * 7 + y * 5) * sstep(0.12, 0.7, y) + 0.022 * Math.sin(a * 4 - 1 + y * 9) * (1 - sstep(0.35, 0.8, y))
        + 0.03 * sstep(0.62, 0.92, y) * Math.sin(a * 3 + 0.8);
      const r = r0 * fold;
      return out.set(r * Math.sin(a) * (1 + 0.04 * (1 - y)), y, r * Math.cos(a) * DEPTH * (1 + 0.07 * Math.max(0, Math.cos(a)) * sstep(0.05, 0.5, y)));
    }
    const sackGeo = (() => {
      const pos = [], uv = [], idx = [], v = new V3();
      for (let j = 0; j <= NP; j++) {
        const t = j / NP;
        for (let i = 0; i <= NA; i++) {
          const u = i / NA, a = (u - 0.5) * TAU;
          sackPoint(a, t, v); pos.push(v.x, v.y, v.z); uv.push(u, v.y / SACK_V);
        }
      }
      for (let j = 0; j < NP; j++) for (let i = 0; i < NA; i++) {
        const a = j * (NA + 1) + i, b = a + 1, c = a + NA + 1, d = c + 1;
        idx.push(a, b, d, a, d, c);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    })();
    const sack = new THREE.Mesh(sackGeo, sackMat); sack.castShadow = true; sackG.add(sack);
    sackG.add(new THREE.Mesh(sackGeo, sackIn));
    // the rolled-open top
    const rimPts = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * TAU, p = sackPoint(a, 1, new V3());
      const o = new V3(p.x, 0, p.z).normalize();
      rimPts.push(p.addScaledVector(o, 0.022).add(new V3(0, -0.012, 0)));
    }
    const roll = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 128, 0.036, 10, true), rollMat);
    roll.castShadow = true; sackG.add(roll);
    // the litter inside: a domed bed
    const FILL_Y = 0.81;
    const fillY = (x, z) => FILL_Y + 0.05 * (1 - clamp((x / 0.4) ** 2 + (z / 0.31) ** 2, 0, 1));
    const fillGeo = new THREE.RingGeometry(0.001, 1, 48, 6);
    { const p = fillGeo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i) * 0.405, z = -p.getY(i) * 0.33; p.setXYZ(i, x, fillY(x, z), z); }
      fillGeo.computeVertexNormals(); }
    sackG.add(new THREE.Mesh(fillGeo, fillMat));

    /* litter granules: the bed and the spill, one merged mesh with vertex colours */
    const GRAN_COLS = ['#f06aa8', '#5aa0f0', '#6ad08a', '#f2d34a', '#a070e0', '#58d0cf', '#eef2ff', '#ff9a5a'].map((c) => new THREE.Color(c));
    const granSpots = [];
    const granGeo = (() => {
      const parts = [], base = new THREE.SphereGeometry(1, 6, 3);
      const add = (x, y, z, s) => {
        const g = base.clone().scale(s, s * 0.72, s).rotateY(rr(0, TAU)).rotateX(rr(-0.4, 0.4)).translate(x, y, z);
        const c = GRAN_COLS[Math.floor(R() * GRAN_COLS.length)], n = g.attributes.position.count, col = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        parts.push(g);
        if (R() < 0.18) granSpots.push(new V3(x, y + s, z));
      };
      // on the bed in the sack
      for (let i = 0; i < 150; i++) {
        const a = rr(0, TAU), r = Math.sqrt(R()) * 0.94;
        const x = Math.sin(a) * r * 0.38, z = Math.cos(a) * r * 0.3;
        if (Math.hypot(x, z) < 0.06) continue;
        const s = rr(0.016, 0.026); add(x, fillY(x, z) + s * 0.3, z, s);
      }
      // spilled in a ring, heaped against the sack, more in front
      for (let i = 0; i < 520; i++) {
        let a = rr(-Math.PI, Math.PI);
        if (R() < 0.45) a *= 0.45;
        const d = Math.pow(R(), 1.7) * (0.62 + 0.22 * Math.cos(a));
        const x = Math.sin(a) * (0.49 + d), z = Math.cos(a) * (0.4 + d);
        const s = rr(0.016, 0.03), heap = d < 0.12 ? rr(0, 0.05) * (1 - d / 0.12) : 0;
        add(x, s * 0.5 + heap, z, s);
      }
      return mergeGeometries(parts);
    })();
    const grains = new THREE.Mesh(granGeo, granMat); root.add(grains);

    /* =====================================================================
       The sprout
       ===================================================================== */
    const STEM_Y = FILL_Y - 0.03;
    const stem = limb({ len: 1.2, r0: 0.042, r1: 0.03, bones: 4, mat: stemMat, radial: 12 });
    stem.mesh.position.y = STEM_Y; root.add(stem.mesh);
    const B = stem.bones, SEG = stem.seg;

    const germLeaves = {};
    const allLeaves = [];
    function leaf(bone, y, side, dirWell, dirSick, size, mat, roll) {
      const L = addLeaf(B[bone], new V3(side * 0.03, y, 0.005), dirWell, dirSick, size, mat, LEAF);
      L.roll = roll ?? -side * 0.55; L.flutter = 0.8;
      allLeaves.push(L);
      return L;
    }
    germLeaves.R = leaf(1, 0.06, 1, new V3(0.85, 0.5, 0.32), new V3(0.9, 0.22, 0.3), 0.42, leafMat);
    germLeaves.C = leaf(1, 0.22, -1, new V3(-0.85, 0.55, 0.3), new V3(-0.9, 0.25, 0.28), 0.42, leafMat2);
    germLeaves.O = leaf(2, 0.1, 1, new V3(0.8, 0.68, 0.24), new V3(0.88, 0.38, 0.24), 0.42, leafMat2);
    germLeaves.T = leaf(2, 0.26, -1, new V3(-0.78, 0.74, 0.22), new V3(-0.86, 0.45, 0.22), 0.4, leafMat);
    leaf(3, 0.2, 1, new V3(0.62, 0.9, 0.1), new V3(0.75, 0.6, 0.1), 0.24, leafMat);
    leaf(3, 0.18, -1, new V3(-0.62, 0.9, 0.1), new V3(-0.75, 0.6, 0.1), 0.22, leafMat2);
    // two fresh leaves that only unfurl when healed
    const fresh = [
      addLeaf(B[0], new V3(0.03, 0.17, 0), new V3(0.8, 0.62, -0.35), new V3(0.1, 1, 0), 0.32, freshMat, LEAF, new V3(0.1, 1, 0)),
      addLeaf(B[3], new V3(-0.03, 0.04, 0), new V3(-0.8, 0.62, -0.35), new V3(-0.1, 1, 0), 0.3, freshMat, LEAF, new V3(-0.1, 1, 0)),
    ];
    for (const L of fresh) { L.roll = 0; L.mesh.scale.setScalar(1e-4); L.mesh.visible = false; }

    /* the stunted bud on a short side stalk */
    const budStalk = new THREE.Group(); budStalk.position.set(0.03, 0.08, 0.01); B[3].add(budStalk);
    const STALK_END = new V3(0.15, 0.035, 0.05);
    budStalk.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(0, 0, 0), new V3(0.08, 0.035, 0.02), STALK_END), 10, 0.011, 6), stemMat));
    const budHead = new THREE.Group(); budHead.position.copy(STALK_END); budHead.rotation.set(0.55, 0, -0.5); budStalk.add(budHead);
    const budGeo = new THREE.LatheGeometry([[0, 0], [0.026, 0.01], [0.04, 0.04], [0.036, 0.07], [0.018, 0.1], [0, 0.112]].map(([r, y]) => new THREE.Vector2(r, y)), 18);
    const bud = new THREE.Mesh(budGeo, budMat); bud.castShadow = true; budHead.add(bud);
    const sepals = mergeGeometries([0, 1, 2].map((i) => SEPAL.clone().scale(0.06, 0.06, 0.06).rotateX(-0.5).rotateY((i / 3) * TAU)));
    budHead.add(new THREE.Mesh(sepals, sepalMat));
    const petals = [];
    for (const [n, size, mat, ring] of [[6, 0.17, petalMat, 0], [5, 0.12, petalIn, 1]]) {
      for (let i = 0; i < n; i++) {
        const arm = new THREE.Group(); arm.rotation.y = (i / n) * TAU + ring * 0.5; arm.position.y = 0.03; budHead.add(arm);
        const p = new THREE.Mesh(PETAL, mat); p.scale.setScalar(1e-4); p.position.z = 0.01; arm.add(p);
        petals.push({ p, size, ring });
      }
    }
    const pistil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 8), pistilMat); pistil.position.y = 0.07; pistil.scale.setScalar(1e-4); budHead.add(pistil);

    /* =====================================================================
       The torch: cup, statue, flame
       ===================================================================== */
    const cup = new THREE.Group(); cup.position.y = SEG; B[3].add(cup);
    const cupGeo = new THREE.LatheGeometry([[0.034, -0.04], [0.045, -0.01], [0.07, 0.04], [0.12, 0.09], [0.165, 0.13], [0.17, 0.14]].map(([r, y]) => new THREE.Vector2(r, y)), 32);
    const cupM = new THREE.Mesh(cupGeo, bronze); cupM.castShadow = true; cup.add(cupM);
    const cupRim = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.018, 8, 40).rotateX(Math.PI / 2).translate(0, 0.14, 0), bronze); cup.add(cupRim);
    cup.add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 24).rotateX(Math.PI / 2).translate(0, 0.012, 0), bronzeDark));
    cup.add(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.013, 8, 20).rotateX(Math.PI / 2).translate(0, -0.035, 0), bronzeDark));
    const ember = new THREE.Mesh(new THREE.CircleGeometry(0.155, 28).rotateX(-Math.PI / 2).translate(0, 0.125, 0), emberMat); cup.add(ember);

    // the little Statue of Liberty, standing in the flame
    const statue = new THREE.Group(); statue.position.set(0, 0.07, 0.02); statue.scale.setScalar(0.92); cup.add(statue);
    const statueGeo = (() => {
      const parts = [];
      const robe = new THREE.LatheGeometry([[0, 0], [0.072, 0], [0.076, 0.02], [0.062, 0.1], [0.052, 0.18], [0.058, 0.24], [0.052, 0.27], [0.026, 0.29], [0.014, 0.3], [0, 0.3]].map(([r, y]) => new THREE.Vector2(r, y)), 22);
      { const p = robe.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.07 * Math.sin(a * 9) * (1 - p.getY(i) / 0.3); p.setX(i, x * k); p.setZ(i, z * k * 0.8); }
        robe.computeVertexNormals(); }
      parts.push(robe.toNonIndexed());
      parts.push(new THREE.SphereGeometry(0.034, 16, 12).translate(0, 0.33, 0).toNonIndexed());
      const crownC = new V3(0, 0.335, 0);
      for (let k = -3; k <= 3; k++) {
        const d = new V3(Math.sin(k * 0.42), Math.cos(k * 0.42), 0.35).normalize();
        const c = new THREE.ConeGeometry(0.008, 0.045, 5).translate(0, 0.0225, 0);
        c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d)).translate(...crownC.clone().addScaledVector(d, 0.03).toArray());
        parts.push(c.toNonIndexed());
      }
      parts.push(new THREE.TorusGeometry(0.033, 0.006, 6, 18).rotateX(Math.PI / 2 - 0.25).translate(0, 0.345, 0.004).toNonIndexed());
      const arm = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(-0.045, 0.265, 0), new V3(-0.075, 0.33, 0.01), new V3(-0.078, 0.43, 0.012)), 8, 0.014, 6);
      parts.push(arm.toNonIndexed());
      parts.push(new THREE.CylinderGeometry(0.012, 0.009, 0.05, 8).translate(-0.078, 0.455, 0.012).toNonIndexed());
      parts.push(new THREE.CylinderGeometry(0.02, 0.012, 0.018, 10).translate(-0.078, 0.485, 0.012).toNonIndexed());
      const arm2 = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(0.045, 0.262, 0), new V3(0.07, 0.22, 0.02), new V3(0.06, 0.19, 0.04)), 8, 0.013, 6);
      parts.push(arm2.toNonIndexed());
      parts.push(new THREE.BoxGeometry(0.05, 0.072, 0.014).rotateZ(-0.28).translate(0.064, 0.19, 0.05).toNonIndexed());
      return mergeGeometries(parts.map((g) => { g.deleteAttribute('uv'); return g; }));
    })();
    const statueM = new THREE.Mesh(statueGeo, statueMat); statueM.castShadow = true; statue.add(statueM);
    const miniFlame = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.016, 0.012], [0.018, 0.028], [0.009, 0.05], [0, 0.066]].map(([r, y]) => new THREE.Vector2(r, y)), 10), miniFlameMat);
    miniFlame.position.set(-0.078, 0.49, 0.012); statue.add(miniFlame);

    // the flame: three nested lathes deformed every frame, toon edged
    const flameG = new THREE.Group(); flameG.position.y = 0.09; cup.add(flameG);
    const FL_PROF = [[0, 0], [0.3, 0.03], [0.45, 0.12], [0.5, 0.26], [0.46, 0.42], [0.37, 0.58], [0.25, 0.74], [0.12, 0.89], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y));
    const FL_PTS = new THREE.SplineCurve(FL_PROF).getPoints(30);
    FL_PTS[0].x = 0; FL_PTS[FL_PTS.length - 1].x = 0;
    const flameVS = `varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
    const flameFS = `uniform vec3 uEdge; uniform vec3 uMid; uniform float uAE; uniform float uAM;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float e = smoothstep(0.3, 0.42, f);
        gl_FragColor = vec4(mix(uEdge, uMid, e), mix(uAE, uAM, e));
        #include <colorspace_fragment>
      }`;
    // colours per layer: [edge, mid] for sick (green), healed (gold) and hot (red)
    const FLC = {
      sick: [['#1f9a5a', '#55e08a'], ['#5fe08e', '#b4f7a8'], ['#c8ffc0', '#f2ffe4']],
      well: [['#e08a1c', '#ffc23d'], ['#ffc84a', '#ffe58f'], ['#fff0b0', '#fffbe8']],
      hot: [['#a81818', '#e8301c'], ['#f2401e', '#ff7a40'], ['#ff9a6a', '#ffcfa8']],
    };
    for (const k in FLC) FLC[k] = FLC[k].map((pair) => pair.map((c) => new THREE.Color(c)));
    const flames = [];
    function flameLayer(W, H, D, z, aE, aM, order) {
      const geo = new THREE.LatheGeometry(FL_PTS, 48);
      const U = { uEdge: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uAE: { value: aE }, uAM: { value: aM } };
      const m = new THREE.Mesh(geo, noOutline(new THREE.ShaderMaterial({ uniforms: U, vertexShader: flameVS, fragmentShader: flameFS, transparent: true, depthWrite: false, side: THREE.BackSide })));
      m.position.z = z; m.renderOrder = order; m.frustumCulled = false; flameG.add(m);
      const L = { m, geo, base: geo.attributes.position.array.slice(), U, W, H, D, aE, aM, ph: rr(0, TAU) };
      flames.push(L);
      return L;
    }
    flameLayer(0.26 * 2, 0.74, 0.62, -0.03, 0.96, 0.9, 1);
    flameLayer(0.18 * 2, 0.54, 0.6, -0.05, 0.94, 0.9, 2);
    flameLayer(0.1 * 2, 0.34, 0.6, -0.07, 0.95, 0.95, 3);
    const halo = new THREE.Sprite(noOutline(new THREE.SpriteMaterial({ map: tex.puff, color: '#5cff9a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45 })));
    halo.scale.set(1.0, 1.25, 1); halo.position.set(0, 0.32, -0.12); halo.renderOrder = 0; flameG.add(halo);
    const _c = new THREE.Color(), _c2 = new THREE.Color();
    function deformFlame(L, t, amp, hMul, sway, wMul) {
      const p = L.geo.attributes.position, b = L.base;
      for (let i = 0; i < p.count; i++) {
        const bx = b[i * 3], by = b[i * 3 + 1], bz = b[i * 3 + 2];
        const a = Math.atan2(bz, bx), k = by;
        const tongue = 1 + amp * k * (0.3 * Math.sin(3 * a + t * 7 + k * 6 + L.ph) + 0.16 * Math.sin(5 * a - t * 11 + k * 4)) + 0.22 * amp * sstep(0.35, 0.75, k) * Math.sin(k * 14 - t * 8 + L.ph) * (0.6 + 0.4 * Math.sin(2 * a));
        const lick = Math.sin(t * 9 + k * 7 + L.ph) * 0.035 * amp * k;
        p.setXYZ(i, bx * tongue * L.W * wMul + (sway * k * k * k + lick) * L.H, by * L.H * hMul, bz * tongue * L.W * wMul * L.D);
      }
      p.needsUpdate = true; L.geo.computeVertexNormals();
    }

    /* =====================================================================
       The germs: T, O, R, C, H
       ===================================================================== */
    function fib(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
        out.push(new V3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      return out;
    }
    function spikyGeo(r, n) {
      const parts = [new THREE.SphereGeometry(r, 14, 10)];
      for (const d of fib(n)) {
        if (d.z > 0.5) continue;                      // keep the face clear
        const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
        parts.push(new THREE.CylinderGeometry(r * 0.1, r * 0.16, r * 0.42, 5, 1, true).translate(0, r * 1.15, 0).applyQuaternion(q));
        parts.push(new THREE.SphereGeometry(r * 0.2, 6, 4).translate(0, r * 1.42, 0).applyQuaternion(q));
      }
      return mergeGeometries(parts);
    }
    function crescentGeo(R0, r) {
      const arc = 1.42 * Math.PI, rot = (2 * Math.PI - arc) / 2;
      const parts = [new THREE.TorusGeometry(R0, r, 12, 30, arc).rotateZ(rot)];
      for (const ang of [rot, rot + arc]) parts.push(new THREE.SphereGeometry(r, 12, 8).translate(Math.cos(ang) * R0, Math.sin(ang) * R0, 0));
      // the little stalk and knob on its upper horn
      const ang = rot + arc, tip = new V3(Math.cos(ang) * R0, Math.sin(ang) * R0, 0), d = new V3(0.4, 1, 0).normalize();
      parts.push(new THREE.CylinderGeometry(r * 0.22, r * 0.3, r * 1.1, 6).translate(0, r * 0.9, 0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d)).translate(tip.x, tip.y, tip.z));
      parts.push(new THREE.SphereGeometry(r * 0.42, 10, 8).translate(tip.x + d.x * r * 1.55, tip.y + d.y * r * 1.55, 0));
      return mergeGeometries(parts.map((g) => g.toNonIndexed()));
    }
    const capGeo = (r, span = 0.8) => new THREE.SphereGeometry(r, 14, 10, Math.PI / 2 - span, span * 2, Math.PI / 2 - span, span * 2);

    const germs = [];
    function makeGerm(letter, color, r, parent, at, kind = 'spiky', parentScale = 1) {
      const g = new THREE.Group(); g.position.copy(at); parent.add(g);
      const twirl = new THREE.Group(); g.add(twirl);
      const mat = toon(color, { thickness: 0.0034 });
      const bodyGeo = kind === 'crescent' ? crescentGeo(r * 0.95, r * 0.44) : spikyGeo(r, 22);
      const body = new THREE.Mesh(bodyGeo, mat); body.castShadow = true; twirl.add(body);
      const texs = { grin: faceTex(letter, 'grin'), blink: faceTex(letter, 'blink'), cackle: faceTex(letter, 'cackle') };
      const fm = noOutline(new THREE.MeshBasicMaterial({ map: texs.grin, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      let faceGeo;
      if (kind === 'crescent') faceGeo = capGeo(r * 0.46, 0.95).translate(-r * 0.95, 0, 0);
      else faceGeo = capGeo(r * 1.012);
      const faceM = new THREE.Mesh(faceGeo, fm); twirl.add(faceM);
      // two clones that pop out when it multiplies (a wrong card)
      const clones = [];
      for (const s of [-1, 1]) {
        const c = new THREE.Group(); c.visible = false; g.add(c);
        c.add(new THREE.Mesh(bodyGeo, mat));
        c.add(new THREE.Mesh(faceGeo, noOutline(new THREE.MeshBasicMaterial({ map: texs.cackle, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }))));
        clones.push({ c, s });
      }
      const G = { letter, color: new THREE.Color(color), r, g, twirl, body, fm, texs, clones, parentScale, base: at.clone(), state: 'alive', popT: 0,
        scale: new Spring(140, 10, 1), ph: rr(0, TAU), blink: rr(1, 4), blinkT: 0, nextTwirl: rr(2, 6), twirlT: -1, kind };
      germs.push(G);
      return G;
    }
    const onLeaf = (L, rz) => new V3(0, 0.74, 0.04 + rz / L.size);
    const gT = makeGerm('T', '#4f86e8', 0.07, germLeaves.T.mesh, onLeaf(germLeaves.T, 0.075));
    const gO = makeGerm('O', '#f2c834', 0.07, germLeaves.O.mesh, onLeaf(germLeaves.O, 0.075));
    const gR = makeGerm('R', '#9b5fe0', 0.07, germLeaves.R.mesh, onLeaf(germLeaves.R, 0.075));
    const gC = makeGerm('C', '#dc3a34', 0.075, germLeaves.C.mesh, onLeaf(germLeaves.C, 0.05), 'crescent');
    const gH = makeGerm('H', '#e85aa8', 0.045, budStalk, new V3(0.075, 0.075, 0.035));
    for (const G of [gT, gO, gR, gC]) G.parentScale = 1 / G.g.parent.scale.x;
    const POP_ORDER = [gR, gC, gO, gT, gH];

    /* =====================================================================
       Stars behind her (her starry night sky)
       ===================================================================== */
    {
      const n = 170, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos.set([rr(-7.5, 7.5), rr(-1.5, 5.5), rr(-7, -5)], i * 3);
        const c = new THREE.Color(['#ffffff', '#fff2b0', '#cfe0ff', '#ffd6f0'][i % 4]).multiplyScalar(rr(0.5, 1));
        col.set([c.r, c.g, c.b], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const stars = new THREE.Points(g, noOutline(new THREE.PointsMaterial({ size: 0.09, map: tex.spark, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })));
      stars.frustumCulled = false; scene.add(stars);
    }

    /* =====================================================================
       Motion
       ===================================================================== */
    const sput = new Spring(60, 9);           // the flame sputtering on a wrong card
    const swell = new Spring(90, 7);          // germs swelling on a wrong card
    const glowS = new Spring(80, 9);          // relief flash on a right card
    let flare = null, nextFlare = 2.5, counter = 0, lastHT = 0, wrongT = -1, budFlick = 0, budNext = 0.6, smokeAcc = 0, smokeI = 0;
    const SMOKE = ['#e889c4', '#6f8ff0', '#58d0cf', '#a585ee'];
    const tmpV = new V3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion();
    const flameTop = () => flameG.localToWorld(tmpV.set(0, 0.62, -0.03));
    const centre = () => B[2].localToWorld(new V3(0, 0.05, 0));

    function popGerm(G) {
      if (G.state !== 'alive') return;
      G.state = 'popping'; G.popT = 0;
    }
    function burstGerm(G) {
      const c = G.body.getWorldPosition(new V3());
      for (let i = 0; i < 26; i++) {
        const d = randDir();
        spark.emit(c.clone().addScaledVector(d, G.r * 0.6), { v: d.multiplyScalar(rnd(0.6, 1.4)), life: rnd(0.5, 0.9), s0: rnd(0.07, 0.12), s1: 0.01, color: i % 3 ? '#' + G.color.getHexString() : (i % 2 ? '#ffe28a' : '#ffffff'), drag: 2.4, g: 0.3 });
      }
      for (let i = 0; i < 5; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.03)), { v: randDir().multiplyScalar(0.3), life: 0.6, s0: 0.08, s1: 0.28, color: '#ffffff', drag: 2, a: 0.35 });
    }
    function restoreGerms(n) {
      for (let i = 0; i < POP_ORDER.length; i++) {
        const G = POP_ORDER[i];
        if (i >= n && G.state !== 'alive') { G.state = 'alive'; G.scale.set(0); G.g.visible = true; }
      }
    }

    return {
      centre,
      anchor: () => flameG.localToWorld(new V3(0.42, 0.45, 0)),
      react(type) {
        if (type === 'wrong') {
          sput.kick(7); swell.kick(6); wrongT = 0;
          for (const G of germs) if (G.state === 'alive') G.scale.kick(4);
          const c = flameTop();
          for (let i = 0; i < 10; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.06)), { v: new V3(rnd(-0.2, 0.2), rnd(0.4, 0.8), rnd(-0.1, 0.1)), life: rnd(0.8, 1.2), s0: 0.12, s1: 0.4, color: '#3a3050', drag: 1.2, a: 0.5 });
        } else {
          counter++; glowS.kick(5);
        }
      },
      burst() {
        for (const G of germs) if (G.state === 'alive') popGerm(G);
        for (let i = 0; i < 30; i++) {
          const p = granSpots[Math.floor(R() * granSpots.length)];
          spark.emit(root.localToWorld(p.clone()), { v: new V3(0, rnd(0.3, 0.8), 0), life: rnd(0.8, 1.4), s0: 0.08, s1: 0.01, color: ['#ffe28a', '#ffd1e6', '#b6ffd2'][i % 3], drag: 1 });
        }
      },
      reset() { counter = 0; lastHT = 0; flare = null; wrongT = -1; restoreGerms(0); },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        const hp = clamp(s.hp, -0.1, 1.2);
        sput.step(dt); swell.step(dt); glowS.step(dt);
        kit.leafFold = clamp(s.k.flinch.x, 0, 1) * 0.45;

        /* which germs should be gone: one per right card, the last at the cure */
        if (s.hTarget < lastHT - 1e-3) { counter = Math.round(s.hTarget * 4); restoreGerms(counter); }
        lastHT = s.hTarget;
        let want = Math.max(counter, Math.round(s.hTarget * 4));
        if (s.healed || heal.burst || s.hTarget > 0.99) want = 5;
        for (let i = 0; i < want && i < POP_ORDER.length; i++) popGerm(POP_ORDER[i]);

        /* fever flares: the flame flashes hot, the rash darkens */
        nextFlare -= dt;
        if (nextFlare <= 0) { if (sick > 0.3 && !heal.on && !REDUCE) flare = { t: 0, dur: 1.8 }; nextFlare = rnd(5, 8); }
        let fl = 0;
        if (flare) { flare.t += dt; fl = Math.sin(Math.PI * clamp(flare.t / flare.dur, 0, 1)) ** 1.5 * sick; if (flare.t > flare.dur) flare = null; }
        const sp = clamp(Math.max(Math.abs(sput.x) * 1.2, s.react?.type === 'wrong' ? s.react.w : 0), 0, 1);
        const hot = clamp(Math.max(fl * 0.75, sp), 0, 1);

        /* colours */
        P.mix(leafMat, 'leaf', h); P.mix(leafMat2, 'leaf2', h); P.mix(stemMat, 'stem', h); P.mix(budMat, 'bud', h); P.mix(sepalMat, 'leaf2', h);
        leafU.uRash.value = clamp(sick * (0.72 + 0.4 * fl) * (1 - sstep(0.6, 0.95, h)), 0, 1);
        flames.forEach((L, i) => {
          L.U.uEdge.value.copy(FLC.sick[i][0]).lerp(FLC.well[i][0], h).lerp(FLC.hot[i][0], hot);
          L.U.uMid.value.copy(FLC.sick[i][1]).lerp(FLC.well[i][1], h).lerp(FLC.hot[i][1], hot);
        });
        _c.set('#5cff9a').lerp(_c2.set('#ffc85a'), h).lerp(_c2.set('#ff5a3a'), hot);
        halo.material.color.copy(_c);
        halo.material.opacity = 0.42 + 0.2 * h + 0.25 * heal.glow + 0.15 * clamp(glowS.x, 0, 1);
        emberMat.color.copy(_c).multiplyScalar(0.6);
        flameLight.color.copy(_c);
        miniFlameMat.color.set('#ffb23a').lerp(_c2.set('#ffe07a'), h);

        /* the sprout: straight, a slow sway, a flinch on a wrong card */
        const lean = lerp(0.035, 0, clamp(hp, 0, 1));
        const shake = s.k.shake.x * 0.02, bob = s.k.bounce.x;
        for (let i = 0; i < B.length; i++) {
          B[i].rotation.set(
            (i === 0 ? -s.k.flinch.x * 0.06 : 0) + Math.sin(t * 0.7 + i * 0.6) * 0.01 * M,
            i === 0 ? s.k.spin.x * 0.06 : 0,
            Math.sin(t * 0.8 + i * 0.5) * 0.016 * M + lean * (i ? 0.5 : 1) + shake * (i ? 1 : 0.4),
          );
        }
        stem.mesh.position.y = STEM_Y + bob * 0.025;
        stem.mesh.scale.y = 1 + bob * 0.02;
        sackG.position.x = s.k.shake.x * 0.006;
        sackG.scale.set(1 - bob * 0.01, 1 + bob * 0.012 + Math.sin(t * 1.3) * 0.004 * M, 1 - bob * 0.01);
        for (const L of allLeaves) L.droop = lerp(0.08, 0, clamp(hp, 0, 1)) + fl * 0.04;

        /* fresh leaves unfurl when healed */
        const fg = sstep(0.82, 1, h);
        fresh.forEach((L, i) => {
          const k = Math.max(0, fg * (1 + 0.08 * Math.sin(t * 2 + i)));
          L.mesh.visible = k > 0.01;
          L.mesh.scale.setScalar(Math.max(1e-4, L.size * k));
          L.roll = (1 - k) * (i ? -1.2 : 1.2);
        });

        /* the stunted bud: pale and small, flickering; healed it blooms */
        const bloom = sstep(0.8, 1, h);
        budStalk.rotation.z = lerp(-0.55, 0.15, clamp(hp, 0, 1.1)) + Math.sin(t * 1.1) * 0.04 * M;
        budNext -= dt;
        if (budNext <= 0) { budFlick = sick > 0.2 ? 1 : 0; budNext = rnd(0.15, 1.4); }
        budFlick = Math.max(0, budFlick - dt * 5);
        const flick = budFlick * sick * (0.5 + 0.5 * Math.sin(t * 60));
        budMat.emissiveIntensity = flick * 0.55 + bloom * 0.05;
        bud.scale.setScalar(lerp(0.72, 1.15, bloom) * (1 + flick * 0.06));
        bud.position.x = (Math.random() - 0.5) * 0.006 * flick;
        for (const pe of petals) {
          const k = clamp(bloom * 1.08 - pe.ring * 0.08, 0, 1);
          pe.p.scale.setScalar(Math.max(1e-4, pe.size * backOut(k)));
          pe.p.rotation.x = lerp(-0.1, pe.ring ? 0.7 : 1.05, k);
        }
        pistil.scale.setScalar(Math.max(1e-4, bloom * 1.3));

        world.updateMatrixWorld();

        /* germs: bob, blink, twirl; swell and cackle on a wrong card; pop on a right one */
        if (wrongT >= 0) { wrongT += dt; if (wrongT > 1.4) wrongT = -1; }
        const cackle = wrongT >= 0 && wrongT < 1.25;
        world.getWorldQuaternion(tmpQ2);
        for (const G of germs) {
          if (G.state === 'gone') { G.g.visible = false; continue; }
          G.g.visible = true;
          let sc = clamp(G.scale.step(dt), 0, 1.6);
          if (G.state === 'alive') G.scale.target = 1;
          if (G.state === 'popping') {
            G.popT += dt;
            const pt = G.popT;
            sc *= (1 + 0.45 * sstep(0, 0.14, pt)) * (1 - sstep(0.14, 0.26, pt));
            if (pt >= 0.14 && pt - dt < 0.14) burstGerm(G);
            if (pt > 0.26) { G.state = 'gone'; G.g.visible = false; continue; }
          }
          const sw = 1 + clamp(swell.x, -0.2, 1.4) * 0.35 + (cackle ? 0.12 : 0);
          G.g.scale.setScalar(G.parentScale * Math.max(1e-4, sc * sw));
          // bob: little hops on the leaf
          const hop = Math.abs(Math.sin(t * (cackle ? 14 : 2.6) + G.ph)) * (cackle ? 0.022 : 0.016) * M;
          G.g.position.copy(G.base);
          // keep them upright in the world, facing out
          G.g.parent.getWorldQuaternion(tmpQ).invert();
          G.g.quaternion.copy(tmpQ).multiply(tmpQ2);
          tmpV.set(0, hop, 0).applyQuaternion(G.g.quaternion).multiplyScalar(G.parentScale);
          G.g.position.add(tmpV);
          // twirl now and then, otherwise a wobble
          G.nextTwirl -= dt;
          if (G.nextTwirl <= 0 && G.twirlT < 0) { G.twirlT = 0; G.nextTwirl = rnd(4, 8); }
          let yaw = Math.sin(t * 1.3 + G.ph) * 0.3 * M;
          if (G.twirlT >= 0) { G.twirlT += dt; yaw += TAU * backOut(clamp(G.twirlT / 0.7, 0, 1)); if (G.twirlT > 0.7) G.twirlT = -1; }
          if (cackle) yaw += Math.sin(t * 22 + G.ph) * 0.2;
          G.twirl.rotation.set(Math.sin(t * 1.7 + G.ph) * 0.12 * M, yaw, Math.sin(t * 1.1 + G.ph) * 0.15 * M + (cackle ? Math.sin(t * 18) * 0.15 : 0));
          // blink, cackle
          G.blink -= dt;
          if (G.blink <= 0) { G.blinkT = 0.14; G.blink = rnd(2, 5); }
          G.blinkT -= dt;
          G.fm.map = cackle ? G.texs.cackle : G.blinkT > 0 ? G.texs.blink : G.texs.grin;
          // clones: the germs multiply, then fold back in
          for (const cl of G.clones) {
            const on = cackle && G.state === 'alive';
            cl.c.visible = on;
            if (on) {
              const k = backOut(clamp(wrongT / 0.3, 0, 1)) * (1 - sstep(0.95, 1.25, wrongT));
              cl.c.scale.setScalar(Math.max(1e-4, k * 0.62));
              cl.c.position.set(cl.s * G.r * 2.3 * k, G.r * (0.9 + 0.35 * Math.abs(Math.sin(t * 15 + cl.s))) * k, G.r * 0.4 * k);
              cl.c.rotation.set(0, Math.sin(t * 20 + cl.s) * 0.3, cl.s * 0.2);
            }
          }
        }

        /* the flame */
        const calm = clamp(h, 0, 1);
        const amp = lerp(1.25, 0.65, calm) + sp * 1.6 + fl * 0.4;
        const sputN = sp * (0.55 + 0.45 * Math.sin(t * 31) * Math.sin(t * 17.3));
        const hMul = (1 + 0.06 * Math.sin(t * 8.5) * Math.sin(t * 5.3) + fl * 0.22 + clamp(glowS.x, -0.5, 1) * 0.08 + heal.glow * 0.15 + h * 0.05) * (1 - 0.42 * clamp(sputN, 0, 1));
        const sway = (0.06 * Math.sin(t * 2.1) + 0.03 * Math.sin(t * 4.7)) * M + 0.04;
        flames.forEach((L, i) => deformFlame(L, t + i * 0.37, amp * M + 0.15, hMul * (1 + i * 0.02 * Math.sin(t * 13 + i)), sway, 1 + fl * 0.08 + h * 0.04));
        miniFlame.scale.set(1, 1 + 0.25 * Math.sin(t * 13) * Math.sin(t * 7.1), 1);
        flameLight.position.copy(flameG.localToWorld(tmpV.set(0, 0.25, 0.25)));
        flameLight.intensity = (1.1 + 0.35 * Math.sin(t * 11) * Math.sin(t * 6.3) * M + fl * 0.8 + h * 0.6) * (1 - 0.5 * sputN);

        // rising sparks, red when it sputters
        if (Math.random() < dt * (5 + 10 * sp + 3 * h) * M) {
          const c = flameG.localToWorld(new V3(rnd(-0.08, 0.08), rnd(0.35, 0.6), rnd(-0.05, 0.05)));
          spark.emit(c, { v: new V3(rnd(-0.12, 0.12), rnd(0.35, 0.7), rnd(-0.05, 0.05)), life: rnd(0.7, 1.2), s0: rnd(0.04, 0.07), s1: 0, color: hot > 0.4 ? '#ff6a3a' : h > 0.6 ? '#ffd86a' : '#9dffb8', drag: 0.6 });
        }
        // the TORCH-screen smoke, drifting off to her upper right
        smokeAcc += dt * 6 * M * clamp(sick * 1.3, 0, 1) * (heal.on || s.healed ? 0 : 1);
        while (smokeAcc > 1) {
          smokeAcc -= 1;
          const c = flameTop().clone().add(new V3(rnd(-0.03, 0.05), rnd(-0.05, 0.05), 0));
          wisp.emit(c, { v: new V3(rnd(0.32, 0.45), rnd(0.12, 0.25), rnd(-0.05, 0.05)), life: rnd(2.2, 2.8), s0: 0.14, s1: rnd(0.5, 0.65), color: SMOKE[smokeI++ % SMOKE.length], drag: 0.25, a: 0.85 });
        }
        // fever: heat shimmer off the leaves during a flare
        if (fl > 0.3 && Math.random() < dt * 8 * fl) {
          const L = allLeaves[Math.floor(Math.random() * 4)];
          spark.emit(L.mesh.localToWorld(new V3(rnd(-0.15, 0.15), rnd(0.4, 0.9), 0.05)), { v: new V3(0, rnd(0.2, 0.4), 0), life: 0.7, s0: 0.05, s1: 0, color: '#ff8a6a', drag: 0.5 });
        }

        /* healed: the litter sparkles */
        granMat.emissiveIntensity = h * (0.08 + 0.06 * Math.sin(t * 3)) * M;
        if (h > 0.85 && Math.random() < dt * 5 * M) {
          const p = granSpots[Math.floor(Math.random() * granSpots.length)];
          spark.emit(root.localToWorld(tmpV.copy(p)), { v: new V3(0, 0.08, 0), life: rnd(0.5, 0.9), s0: 0.07, s1: 0, color: ['#ffffff', '#ffe9a0', '#ffd1e6'][Math.floor(Math.random() * 3)] });
        }
      },
    };
  },
};
