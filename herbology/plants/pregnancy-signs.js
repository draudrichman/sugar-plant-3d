/* 13. Pregnancy Signs: the Signs Seedling.
   From her slide (refs/p27_0.jpg, "PREGNANCY SIGNS!"): a terracotta pot with
   carved swirls and a zigzag band, a little soil heaped round its foot, and
   out of it a big squishy cluster of glossy jelly-bean blobs in pink, baby
   blue and lavender. The big pink blob at the front has the face (dot eyes,
   blush, a small smile); a cream paper banner wraps the cluster; brown twigs
   with green leaves poke out of both sides. Round the pot, her little sign
   characters: five are built here as small toys (the butterfly of Quickening,
   the pillow of Hegar's / Goodell's sign, the calendar with its red X of
   Amenorrhea, the tape measure of Fundal Height and the coil spring of
   Ballottement).
   Pregnancy is a normal process, not a disease, so "sick" here means
   "unconfirmed": the cluster is pale and droopy, question marks float over
   it, and the sign friends are grey and asleep. Each correct card wakes one
   friend into colour and its own little animation. Healed (my addition):
   confirmed and blooming, every friend awake and dancing, full pastel
   colour, little flowers among the blobs, the banner fluttering, confetti. */

export default {
  id: 'pregnancy-signs',
  look: { ink: '#3a2630', bands: [124, 182, 230, 255], outline: 0.0042, rune: ['#c8bcd6', '#ffb0d2'], bg: ['#c2eadf', '#8fcdca', '#4f93a6'] },
  frame: { halfH: 1.3, halfW: 1.52, lookY: 1.12 },
  careTitle: 'Confirm the signs',
  lines: {
    sick: 'Am I... expecting?',
    wrong: ['Hmm... still not sure?', 'Is that a sign?', 'Still a mystery!'],
    right: ['A sign!', 'Oh! There it is!', 'One more clue!'],
    healed: 'Confirmed and blooming!',
  },
  shows: [
    '<b>A pale, droopy cluster under floating question marks</b>: not yet confirmed. Presumptive signs only suggest a pregnancy; they need checking.',
    '<b>The calendar with its red X</b>, flipping its pages: amenorrhea, the missed period (presumptive).',
    '<b>The butterfly fluttering round the pot</b>: quickening, the first fetal movements the mother feels, around 16 to 20 weeks (presumptive).',
    '<b>The soft, squishy pillow</b>: Hegar\'s sign (softening of the lower uterine segment) and Goodell\'s sign (softening of the cervix), both probable signs.',
    '<b>The tape measure climbing the pot and the bouncing spring</b>: fundal height as the uterus enlarges, and ballottement, the fetus rebounding when the examiner taps (probable).',
    '<b>Every friend awake and the cluster in full bloom</b>: confirmed. Positive signs are the fetal heartbeat heard by an examiner, the fetus seen on ultrasound and fetal movement felt by an examiner.',
  ],
  healedNote: 'Confirmed and blooming: every sign friend is awake and dancing, the cluster glows full pastel with little flowers among the blobs, the face beams, the banner flutters and confetti falls. Pregnancy is a normal process, not a disease: the care is testing, ultrasound, nutrition, scheduled visits and safe habits.',

  build(kit) {
    const { THREE, world, toon, noOutline, canvasTex, sheet, lumpGeo, taperTube, addLeaf, face, palette, Spring,
      spark, particles, randDir, rnd, rr, M, clamp, lerp, sstep, V3, TAU, mergeGeometries, tex } = kit;
    const INK = kit.look.ink;
    const N = 5;

    const P = palette({
      pink: ['#e8d3db', '#f7a0c4'], blue: ['#d3dde7', '#8fc4ee'], lav: ['#dcd3e8', '#bc9fec'], face: ['#eedde3', '#f9b0cd'],
      leaf: ['#a9b49e', '#5fb858'], twig: ['#8d8079', '#7a4a2a'],
      cal: ['#c9c6cc', '#f4f1ea'], pillow: ['#cfc8cd', '#f8a2c4'], tape: ['#c9c5ba', '#ffd23e'], hub: ['#aaa59c', '#eba12a'], spring: ['#c6c1cd', '#b39af0'], bfly: ['#c0bbc6', '#a985e4'],
    });

    /* ---------- shared bits ---------- */
    const inkMat = noOutline(new THREE.MeshBasicMaterial({ color: INK }));
    const blushMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ff8fb0', transparent: true, opacity: 0.75, depthWrite: false }));
    const shineMat = noOutline(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    /** An unlit textured material that can fade to grey (uSat 0) while asleep. */
    function desatMat(params) {
      const m = noOutline(new THREE.MeshBasicMaterial(params));
      const u = { value: 1 };
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uSat = u;
        sh.fragmentShader = 'uniform float uSat;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
          { float l = dot( diffuseColor.rgb, vec3( 0.299, 0.587, 0.114 ) ); diffuseColor.rgb = mix( vec3( l ) * 0.92 + 0.07, diffuseColor.rgb, uSat ); }`);
      };
      m.userData.sat = u;
      return m;
    }
    function spriteTex(w, h, draw) {
      const t = canvasTex(w, h, draw);
      return noOutline(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    }
    const qDraw = (x, w, h) => {
      x.font = `900 ${h * 0.8}px "Trebuchet MS", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineJoin = 'round'; x.lineWidth = h * 0.09; x.strokeStyle = INK; x.strokeText('?', w / 2, h * 0.54);
      x.fillStyle = '#b48ef0'; x.fillText('?', w / 2, h * 0.54);
    };

    /* ---------- the pot ---------- */
    const potR = (y) => (y < 0.7 ? 0.4 + 0.15 * (y / 0.7) + 0.012 * Math.sin(Math.PI * y / 0.7) : 0.635);
    const potTex = canvasTex(1024, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#d98656'); g.addColorStop(1, '#c46c42');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(120,50,20,.08)' : 'rgba(255,220,190,.08)'; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, rnd(1, 3), 0, TAU); x.fill(); }
      const carve = (path) => {
        x.lineCap = 'round'; x.lineJoin = 'round';
        x.save(); x.translate(2, 3); x.strokeStyle = 'rgba(255,214,180,.5)'; x.lineWidth = 4; path(); x.stroke(); x.restore();
        x.strokeStyle = 'rgba(122,48,22,.62)'; x.lineWidth = 7; path(); x.stroke();
      };
      const swirl = (cx, cy, s) => () => {      // her double curl: two spirals meeting in a U
        x.beginPath();
        for (const sg of [-1, 1]) {
          const ox = cx + sg * s * 0.36;
          for (let k = 0; k <= 60; k++) {
            const th = k / 60 * TAU * 1.15, r = s * 0.42 * (1 - th / (TAU * 1.5));
            const a = Math.PI / 2 + sg * th;            // start at the bottom, curl up and in
            const px = ox + Math.cos(a) * r * sg, py = cy + Math.sin(a) * r;
            if (k === 0) x.moveTo(px, py); else x.lineTo(px, py);
          }
        }
        x.moveTo(cx - s * 0.36, cy + s * 0.42); x.quadraticCurveTo(cx, cy + s * 0.7, cx + s * 0.36, cy + s * 0.42);
      };
      for (let k = 0; k <= 6; k++) carve(swirl(w / 2 + (k - 3) * w / 6, h * 0.36, 78));
      carve(() => { x.beginPath(); x.moveTo(0, h * 0.66); for (let px = 0; px <= w; px += 26) x.lineTo(px, h * 0.66 + ((px / 26) % 2 ? 16 : -2)); });
      carve(() => { x.beginPath(); x.moveTo(0, h * 0.82); for (let px = 0; px <= w; px += 26) x.lineTo(px, h * 0.82 + ((px / 26) % 2 ? -14 : 2)); });
    });
    const potMat = toon('#ffffff', { map: potTex, thickness: 0.0048 });
    const rimMat = toon('#d88a5c', { thickness: 0.0048 });
    const soilMat = toon('#7a5236', { map: tex.grain, thickness: 0.0035 });
    const pot = new THREE.Group(); world.add(pot);
    const potPts = []; for (let k = 0; k <= 12; k++) { const y = 0.7 * k / 12; potPts.push(new THREE.Vector2(potR(y), y)); }
    const potBody = new THREE.Mesh(new THREE.LatheGeometry(potPts, 64, Math.PI), potMat); potBody.castShadow = true; pot.add(potBody);
    const rimPts = [[0.548, 0.69], [0.612, 0.69], [0.636, 0.72], [0.642, 0.78], [0.628, 0.835], [0.585, 0.85], [0.55, 0.84], [0.54, 0.76]].map(([r, y]) => new THREE.Vector2(r, y));
    const rim = new THREE.Mesh(new THREE.LatheGeometry(rimPts, 64), rimMat); pot.add(rim);
    const soil = new THREE.Mesh(lumpGeo([
      [0, 0.79, 0, 0.56, 0.13],
      [-0.48, 0.0, 0.28, 0.09, 0.45], [-0.3, 0.0, 0.45, 0.07, 0.5], [0.12, 0.0, 0.5, 0.06, 0.45], [0.46, 0.0, 0.2, 0.08, 0.5],
      [0.34, 0.0, -0.36, 0.09, 0.45], [-0.4, 0.0, -0.3, 0.07, 0.45], [-0.62, 0.0, 0.08, 0.05, 0.5],
    ], 16, 8), soilMat);
    pot.add(soil);

    /* ---------- the blob cluster ---------- */
    const cl = new THREE.Group(); cl.position.y = 0.8; world.add(cl);
    const CC = new V3(0, 0.62, 0);   // its middle
    const mPink = toon('#f7a0c4', { emissive: '#ffb6d6', emissiveIntensity: 0 });
    const mBlue = toon('#8fc4ee', { emissive: '#bfe2ff', emissiveIntensity: 0 });
    const mLav = toon('#bc9fec', { emissive: '#d8c6ff', emissiveIntensity: 0 });
    const mFace = toon('#f9b0cd', { emissive: '#ffc6dc', emissiveIntensity: 0 });
    const BLOBS = [
      // x, y, z, r, colour, tilt
      [0.02, 1.2, 0.0, 0.2, 'pink', 0.25], [0.2, 1.17, 0.2, 0.12, 'pink', -0.7], [-0.33, 1.08, 0.02, 0.22, 'blue', 0.5], [0.37, 1.07, 0.0, 0.22, 'blue', -0.5],
      [-0.05, 1.1, -0.32, 0.22, 'pink', 0],
      [-0.57, 0.86, 0.12, 0.25, 'blue', 1.2], [0.57, 0.84, 0.14, 0.25, 'pink', -1.1], [-0.4, 0.92, -0.36, 0.24, 'pink', 0.3], [0.38, 0.9, -0.38, 0.24, 'lav', -0.3],
      [-0.68, 0.52, 0.1, 0.25, 'pink', 1.3], [0.68, 0.52, 0.1, 0.25, 'pink', -1.3], [-0.52, 0.58, -0.42, 0.26, 'blue', 0.4], [0.52, 0.58, -0.42, 0.26, 'blue', -0.4],
      [0.0, 0.6, -0.6, 0.26, 'pink', 0], [-0.36, 0.62, 0.42, 0.19, 'pink', 0.3], [0.37, 0.62, 0.42, 0.19, 'blue', -0.3],
      [-0.48, 0.24, 0.32, 0.22, 'pink', 0.4], [0.0, 0.22, 0.48, 0.22, 'blue', 0], [0.48, 0.24, 0.32, 0.22, 'pink', -0.4],
      [-0.56, 0.22, -0.2, 0.22, 'lav', 0.8], [0.56, 0.22, -0.2, 0.22, 'lav', -0.8], [-0.22, 0.07, 0.22, 0.2, 'lav', 0.2], [0.24, 0.07, 0.2, 0.2, 'lav', -0.2],
      [0.0, 0.1, -0.4, 0.22, 'blue', 0],
    ];
    const BEAN = [1.32, 0.82, 0.9];
    const beanInv = [];       // for finding the cluster's surface (flowers)
    const layerParts = { pink: [], blue: [], lav: [] }, shineParts = { pink: [], blue: [], lav: [] };
    for (const [x, y, z, r, col, tilt] of BLOBS) {
      const az = Math.atan2(x, z);
      const m4 = new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, az, tilt, 'YXZ')), new V3(r * BEAN[0], r * BEAN[1], r * BEAN[2]));
      layerParts[col].push(new THREE.SphereGeometry(1, 20, 13).applyMatrix4(m4));
      beanInv.push(m4.clone().invert());
      if (z > -0.05) {      // a gloss highlight, up and to the left where the key light is
        const hp = new V3(-0.42, 0.62, 0.66).normalize().multiplyScalar(0.93).applyMatrix4(m4);
        shineParts[col].push(new THREE.SphereGeometry(r * 0.16, 10, 8).scale(1.4, 0.8, 0.35).lookAt(new V3(0, 0, 1)).translate(hp.x, hp.y, hp.z + 0.004));
      }
    }
    // a soft core so no gaps show between the beans
    layerParts.pink.push(new THREE.SphereGeometry(0.55, 22, 14).scale(1.15, 1.05, 1).translate(CC.x, CC.y, CC.z - 0.05));
    beanInv.push(new THREE.Matrix4().compose(new V3(CC.x, CC.y, CC.z - 0.05), new THREE.Quaternion(), new V3(0.63, 0.58, 0.55)).invert());
    const layers = [];
    for (const [col, mat] of [['pink', mPink], ['blue', mBlue], ['lav', mLav]]) {
      const g = new THREE.Group(); g.position.copy(CC); cl.add(g);
      const mesh = new THREE.Mesh(mergeGeometries(layerParts[col]).translate(-CC.x, -CC.y, -CC.z), mat); mesh.castShadow = true; g.add(mesh);
      if (shineParts[col].length) g.add(new THREE.Mesh(mergeGeometries(shineParts[col]).translate(-CC.x, -CC.y, -CC.z), shineMat));
      layers.push({ g, ph: layers.length * 2.1 });
    }

    // the face blob
    const FA = { a: 0.36, b: 0.31, c: 0.28 };
    const faceG = new THREE.Group(); faceG.position.set(0, 0.88, 0.32); cl.add(faceG);
    const faceBlob = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 22).scale(FA.a, FA.b, FA.c), mFace); faceBlob.castShadow = true; faceG.add(faceBlob);
    { const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8).scale(1.5, 0.8, 0.3), shineMat);
      const n = new V3(-0.55, 0.62, 0.56).normalize(); s.position.set(n.x * FA.a * 0.96, n.y * FA.b * 0.96, n.z * FA.c * 0.96 + 0.01); s.lookAt(s.position.clone().multiplyScalar(2)); faceG.add(s); }
    beanInv.push(new THREE.Matrix4().compose(faceG.position.clone(), new THREE.Quaternion(), new V3(FA.a, FA.b, FA.c)).invert());
    const rig = face(faceG, {
      ...FA,
      eyes: { x: 0.12, y: 0.035, r: 0.05, white: '#2b1a20', iris: '#2b1a20', pupil: false, lid: '#f9b0cd' },
      brows: { y: 0.125, len: 0.045, r: 0.008, color: '#7a4458' },
      mouth: { y: -0.075, inside: '#c4506e', lip: '#3a1c26' },
      blush: { color: '255,120,160', x: 0.215, y: -0.045, w: 0.13, h: 0.085 },
      sickE: { lid: 0.82, low: 0.12, brow: 0.42, browY: 0.012, smile: -0.12, open: 0.08, w: 0.055 },
      wellE: { lid: 1, low: 0.45, brow: -0.08, browY: 0.016, smile: 1.15, open: 0.42, w: 0.115 },
      wrongE: { lid: 1, low: 0, brow: 0.62, browY: 0.024, smile: -0.35, open: 0.35, w: 0.05 },
      rightE: { lid: 1, low: 0.55, brow: 0.05, browY: 0.026, smile: 1.1, open: 0.5, w: 0.11 },
    });

    // the paper banner
    const BAN = { r: 0.73, y: 0.45, hgt: 0.24, arc: TAU * 0.6 };
    const bannerTex = canvasTex(1536, 128, (x, w, h) => {
      x.fillStyle = '#f7eedb'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { x.fillStyle = 'rgba(160,130,90,.07)'; x.fillRect(Math.random() * w, Math.random() * h, rnd(2, 10), 1.5); }
      x.fillStyle = 'rgba(150,115,80,.25)'; x.fillRect(0, 0, w, 7); x.fillRect(0, h - 7, w, 7);
      x.font = '900 82px "Trebuchet MS", "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.save(); x.translate(w / 2, h / 2 + 4); x.scale(0.82, 1);
      x.fillStyle = '#2a1a1e'; x.fillText('PREGNANCY SIGNS!', 0, 0); x.restore();
    });
    const bannerMat = toon('#ffffff', { map: bannerTex, side: THREE.DoubleSide, thickness: 0.003 });
    const bannerGeo = new THREE.CylinderGeometry(BAN.r, BAN.r * 1.03, BAN.hgt, 72, 3, true, -BAN.arc / 2, BAN.arc);
    const banner = new THREE.Mesh(bannerGeo, bannerMat); banner.position.y = BAN.y; cl.add(banner);
    const banBase = Float32Array.from(bannerGeo.attributes.position.array);

    // twigs and leaves
    const twigMat = toon('#7a4a2a', { thickness: 0.0035 });
    const leafMat = toon('#5fb858', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.003 });
    const LEAF = sheet({ width: 0.42, cup: 0.14, curl: 0.12, point: 0.7, rows: 10 });
    const sides = [];
    for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(s * 0.4, 0.62, -0.08); cl.add(g);
      const v = (x, y, z) => new V3(s * x, y, z);
      const geo = mergeGeometries([
        taperTube([v(0, 0.05, 0), v(0.3, 0.22, -0.02), v(0.5, 0.42, 0), v(0.58, 0.6, 0.04)], 0.034, 0.012, { segs: 20, radial: 7 }),
        taperTube([v(0.36, 0.28, -0.02), v(0.52, 0.3, 0.04), v(0.68, 0.38, 0.08)], 0.02, 0.01, { segs: 12, radial: 6 }),
        taperTube([v(0, -0.05, 0), v(0.38, -0.06, 0.05), v(0.62, 0.0, 0.1), v(0.78, 0.1, 0.14)], 0.034, 0.012, { segs: 20, radial: 7 }),
        taperTube([v(0, -0.2, 0), v(0.3, -0.36, 0.08), v(0.48, -0.56, 0.16), v(0.58, -0.76, 0.22)], 0.032, 0.012, { segs: 20, radial: 7 }),
      ]);
      const tw = new THREE.Mesh(geo, twigMat); g.add(tw);
      for (const [at, dir, size] of [
        [v(0.58, 0.6, 0.04), v(0.45, 0.85, 0.2), 0.22], [v(0.68, 0.38, 0.08), v(0.85, 0.35, 0.3), 0.2],
        [v(0.78, 0.1, 0.14), v(0.9, 0.3, 0.3), 0.22], [v(0.45, -0.04, 0.07), v(0.2, 0.9, 0.4), 0.18],
        [v(0.58, -0.76, 0.22), v(0.55, -0.6, 0.45), 0.21], [v(0.38, -0.46, 0.13), v(0.85, -0.05, 0.4), 0.18],
      ]) {
        const sick = dir.clone().setY(dir.y - 1.0).add(new V3(0, 0, 0.1));
        const L = addLeaf(g, at, dir, sick, size, leafMat, LEAF);
        L.roll = s * rr(0.1, 0.5);
      }
      sides.push({ g, s });
    }

    // flowers that open among the blobs when it is confirmed
    const inBlob = (p) => { const q = new V3(); for (const m of beanInv) { q.copy(p).applyMatrix4(m); if (q.lengthSq() < 1) return true; } return false; };
    function surfaceAt(dir) {
      const d = dir.clone().normalize(), p = new V3();
      for (let k = 0.3; k < 1.6; k += 0.01) { p.copy(CC).addScaledVector(d, k); if (!inBlob(p)) return p.addScaledVector(d, -0.012); }
      return p;
    }
    const flowerMat = toon('#ffffff', { vertexColors: true, thickness: 0.0025 });
    function flowerGeo(petal, centre) {
      const parts = [];
      const paint = (g, c) => { const col = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
      for (let i = 0; i < 5; i++) parts.push(paint(new THREE.SphereGeometry(0.032, 8, 6).scale(1, 0.62, 0.32).translate(0.036, 0, 0).rotateZ(i / 5 * TAU + 0.3), petal));
      parts.push(paint(new THREE.SphereGeometry(0.022, 8, 6).scale(1, 1, 0.6).translate(0, 0, 0.008), centre));
      return mergeGeometries(parts);
    }
    const FLOWER_GEOS = [flowerGeo('#fffaf6', '#ffc93c'), flowerGeo('#fff0a6', '#f58ab4'), flowerGeo('#ffd6e8', '#ffcf4a')];
    const flowers = [];
    for (const [dx, dy, dz, sz] of [[0.05, 1, 0.15, 2.3], [-0.5, 0.8, 0.45, 2], [0.62, 0.72, 0.45, 2], [-0.95, 0.35, 0.4, 1.8], [0.95, 0.3, 0.42, 1.8],
      [-0.7, -0.5, 0.7, 1.9], [0.12, -0.55, 1, 1.9], [0.78, -0.45, 0.65, 1.8], [-0.25, 0.9, -0.5, 1.8], [0.45, 0.95, -0.2, 1.7],
      [-0.8, 0.3, 0.55, 1.5], [0.8, 0.3, 0.55, 1.5]]) {
      const n = new V3(dx, dy, dz).normalize(), at = surfaceAt(n);
      const m = new THREE.Mesh(FLOWER_GEOS[flowers.length % 3], flowerMat);
      m.position.copy(at); m.quaternion.setFromUnitVectors(new V3(0, 0, 1), n); m.scale.setScalar(1e-4); cl.add(m);
      flowers.push({ m, sz, ph: rr(0, TAU), d: flowers.length * 0.05 });
    }

    /* ---------- floating question marks ---------- */
    const qMat = spriteTex(128, 128, qDraw);
    const qs = [[-0.92, 1.98, 0.25, 0.2], [0.98, 1.92, 0.2, 0.18], [0.42, 2.26, 0.1, 0.22]].map(([x, y, z, s], i) => {
      const sp = new THREE.Sprite(qMat.clone()); sp.position.set(x, y, z); sp.scale.setScalar(s); world.add(sp);
      return { sp, base: new V3(x, y, z), s, ph: i * 1.7 };
    });
    const popQ = new THREE.Sprite(qMat.clone()); popQ.position.set(-0.05, 2.18, 0.5); popQ.scale.setScalar(1e-4); world.add(popQ);
    let popT = 9;

    /* ---------- the sign friends ---------- */
    function labelMat(lines) {
      const H = 104 * lines.length + 16;
      const m = spriteTex(512, H, (x, w, h) => {
        x.font = '900 92px "Trebuchet MS", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
        lines.forEach((l, i) => {
          const y = 8 + 54 + i * 104, k = Math.min(0.86, (w - 28) / x.measureText(l).width);
          x.save(); x.translate(w / 2, y); x.scale(k, 1);
          x.lineWidth = 20; x.strokeStyle = 'rgba(255,253,246,.96)'; x.strokeText(l, 0, 0);
          x.fillStyle = '#3a2630'; x.fillText(l, 0, 0); x.restore();
        });
      });
      m.userData.aspect = H / 512;
      return m;
    }
    const zMat = spriteTex(96, 96, (x) => {
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 7; x.strokeStyle = '#fffaf2'; x.fillStyle = '#7d6a9a';
      x.font = 'italic 900 44px "Trebuchet MS", Arial'; x.strokeText('z', 34, 62); x.fillText('z', 34, 62);
      x.font = 'italic 900 30px "Trebuchet MS", Arial'; x.strokeText('z', 66, 30); x.fillText('z', 66, 30);
    });
    function toyFace(parent, { y, z, r = 0.013, dx = 0.036, m = 0.016, blush = true }) {
      const g = new THREE.Group(); g.position.set(0, y, z); parent.add(g);
      const eyes = new THREE.Mesh(mergeGeometries([-1, 1].map((s) => new THREE.SphereGeometry(r, 12, 10).scale(1, 1.25, 0.5).translate(s * dx, 0, 0))), inkMat);
      g.add(eyes);
      const mouth = new THREE.Mesh(new THREE.TorusGeometry(m, r * 0.3, 6, 14, Math.PI).rotateZ(Math.PI), inkMat);
      mouth.position.y = -r * 1.5; mouth.scale.z = 0.5; g.add(mouth);
      if (blush) g.add(new THREE.Mesh(mergeGeometries([-1, 1].map((s) => new THREE.SphereGeometry(r * 1.25, 10, 8).scale(1.4, 0.7, 0.25).translate(s * dx * 1.8, -r * 1.5, -0.003))), blushMat));
      return { g, eyes, mouth };
    }
    const toys = {}, TOY = 1.35;
    function makeToy(id, home, yaw, lines, labelY, zY) {
      const g = new THREE.Group(); g.position.copy(home); g.rotation.y = yaw; g.scale.setScalar(TOY); world.add(g);
      const body = new THREE.Group(); g.add(body);
      const label = new THREE.Sprite(labelMat(lines)); const lw = 0.5;
      label.scale.set(lw, lw * label.material.userData.aspect, 1); label.position.y = labelY; label.renderOrder = 5; g.add(label);
      const zz = new THREE.Sprite(zMat.clone()); zz.scale.setScalar(0.13); zz.position.set(0.06, zY, 0); g.add(zz);
      const T = { id, g, body, home: home.clone(), yaw, label, zz, zY, wake: new Spring(55, 9), pop: new Spring(170, 7), hop: new Spring(150, 8), mats: [], sats: [], face: null, ph: rr(0, TAU) };
      toys[id] = T;
      return T;
    }

    // 1. Amenorrhea: a calendar with a red X
    const calDraw = (withX) => (x, w, h) => {
      x.fillStyle = '#fffdf8'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#e4504f'; x.fillRect(0, 0, w, h * 0.22);
      x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(w * (0.18 + i * 0.16), h * 0.06, 7, 0, TAU); x.fill(); }
      x.strokeStyle = INK; x.lineWidth = 4;
      for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(w * (0.18 + i * 0.16), h * 0.03, 6, 14, 0, 0, TAU); x.stroke(); }
      x.strokeStyle = '#b9aeb2'; x.lineWidth = 2.5;
      const gx = w * 0.08, gy = h * 0.3, gw = w * 0.84, gh = h * 0.62;
      for (let i = 0; i <= 5; i++) { x.beginPath(); x.moveTo(gx + gw * i / 5, gy); x.lineTo(gx + gw * i / 5, gy + gh); x.stroke(); }
      for (let j = 0; j <= 4; j++) { x.beginPath(); x.moveTo(gx, gy + gh * j / 4); x.lineTo(gx + gw, gy + gh * j / 4); x.stroke(); }
      if (withX) {
        x.strokeStyle = '#e03a3e'; x.lineWidth = 13; x.lineCap = 'round';
        const cx = gx + gw * 0.5, cy = gy + gh * 0.5, s = gw * 0.17;
        x.beginPath(); x.moveTo(cx - s, cy - s); x.lineTo(cx + s, cy + s); x.moveTo(cx + s, cy - s); x.lineTo(cx - s, cy + s); x.stroke();
      } else { x.fillStyle = '#d8cfd2'; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(gx + gw * ((i % 5) + 0.5) / 5, gy + gh * (Math.floor(i / 5) + 0.5) / 4, 5, 0, TAU); x.fill(); } }
      x.strokeStyle = INK; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
    };
    const cal = makeToy('cal', new V3(-1.14, 0, -0.26), 0.4, ['AMENORRHEA'], 0.6, 0.42);
    { const calMat = toon('#f4f1ea', { thickness: 0.004 }); cal.mats.push([calMat, 'cal']);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.3, 0.05).translate(0, 0.15, 0), calMat); box.castShadow = true; cal.body.add(box);
      const pageMat = desatMat({ map: canvasTex(256, 280, calDraw(true)) }); cal.sats.push(pageMat.userData.sat);
      const page = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.28), pageMat); page.position.set(0, 0.15, 0.026); cal.body.add(page);
      const flipMat = desatMat({ map: canvasTex(256, 218, (x) => { x.translate(0, -62); calDraw(false)(x, 256, 280); }), side: THREE.DoubleSide }); cal.sats.push(flipMat.userData.sat);
      const flipPivot = new THREE.Group(); flipPivot.position.set(0, 0.15 + 0.14 - 0.28 * 0.22 + 0.001, 0.028); cal.body.add(flipPivot);
      const flip = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.28 * 0.78).translate(0, -0.28 * 0.39, 0), flipMat); flipPivot.add(flip);
      cal.flip = flipPivot; cal.flipMesh = flip;
    }

    // 2. Quickening: a lilac butterfly
    const bf = makeToy('bf', new V3(-0.22, 0.067 * 1.35, 0.86), 0.1, ['QUICKENING'], 0.25, 0.2);
    { const bodyMat = toon('#a985e4', { thickness: 0.0032 }); bf.mats.push([bodyMat, 'bfly']);
      const geo = mergeGeometries([
        new THREE.CapsuleGeometry(0.022, 0.09, 4, 10),
        new THREE.SphereGeometry(0.04, 16, 12).translate(0, 0.085, 0),
        taperTube([new V3(-0.012, 0.11, 0), new V3(-0.03, 0.16, 0.01), new V3(-0.05, 0.19, 0.0)], 0.005, 0.004, { segs: 8, radial: 5 }),
        taperTube([new V3(0.012, 0.11, 0), new V3(0.03, 0.16, 0.01), new V3(0.05, 0.19, 0.0)], 0.005, 0.004, { segs: 8, radial: 5 }),
        new THREE.SphereGeometry(0.011, 8, 6).translate(-0.05, 0.19, 0), new THREE.SphereGeometry(0.011, 8, 6).translate(0.05, 0.19, 0),
      ]);
      const b = new THREE.Mesh(geo, bodyMat); b.castShadow = true; bf.body.add(b);
      bf.face = toyFace(bf.body, { y: 0.088, z: 0.037, r: 0.008, dx: 0.016, m: 0.009 });
      const wingTex = canvasTex(256, 256, (x, w, h) => {
        x.lineJoin = 'round';
        const wing = () => {
          x.beginPath(); x.moveTo(8, 120);
          x.bezierCurveTo(30, 20, 150, -10, 236, 30); x.bezierCurveTo(258, 70, 220, 120, 150, 132);
          x.bezierCurveTo(200, 160, 210, 220, 160, 244); x.bezierCurveTo(110, 262, 40, 210, 8, 140); x.closePath();
        };
        wing(); x.fillStyle = '#c9a8f0'; x.fill();
        x.save(); wing(); x.clip();
        x.fillStyle = '#ffe7a4'; x.beginPath(); x.ellipse(110, 78, 62, 36, -0.35, 0, TAU); x.fill(); x.beginPath(); x.ellipse(105, 190, 38, 30, 0.5, 0, TAU); x.fill();
        x.fillStyle = '#f2a6cf'; x.beginPath(); x.arc(118, 76, 15, 0, TAU); x.fill(); x.beginPath(); x.arc(108, 192, 11, 0, TAU); x.fill();
        x.restore();
        wing(); x.strokeStyle = INK; x.lineWidth = 9; x.stroke();
        x.lineWidth = 5; x.beginPath(); x.moveTo(12, 130); x.quadraticCurveTo(80, 128, 150, 132); x.stroke();
      });
      const wingMat = desatMat({ map: wingTex, side: THREE.DoubleSide, alphaTest: 0.5 }); bf.sats.push(wingMat.userData.sat);
      const WG = new THREE.PlaneGeometry(0.2, 0.2).translate(0.1, 0.0, 0);
      bf.wings = [-1, 1].map((s) => {
        const p = new THREE.Group(); p.position.set(s * 0.012, 0.02, -0.004); bf.body.add(p);
        const m = new THREE.Mesh(WG, wingMat); m.scale.x = s; p.add(m);
        return { p, s };
      });
    }

    // 3. Hegar's / Goodell's sign: a soft pink pillow
    const PW = 0.15, PH = 0.125, PD = 0.07;
    const pillowGeo = (() => {
      const g = new THREE.SphereGeometry(1, 28, 20), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const sx = Math.sign(x) * Math.pow(Math.abs(x), 0.55), sy = Math.sign(y) * Math.pow(Math.abs(y), 0.55);
        const corner = (x * x) * (y * y) * 4;
        p.setXYZ(i, sx * PW * (1 + 0.12 * y * y), sy * PH * (1 + 0.12 * x * x), z * PD * (1 - 0.55 * corner));
      }
      g.computeVertexNormals();
      return g;
    })();
    const pil = makeToy('pil', new V3(1.04, 0, 0.3), -0.35, ["HEGAR'S /", "GOODELL'S"], -0.1, 0.32);
    { const m = toon('#f8a2c4', { thickness: 0.004 }); pil.mats.push([m, 'pillow']);
      pil.cushion = new THREE.Group(); pil.body.add(pil.cushion);
      const c = new THREE.Mesh(pillowGeo, m); c.castShadow = true; pil.cushion.add(c);
      pil.face = toyFace(pil.cushion, { y: 0.012, z: PD * 0.985, r: 0.012, dx: 0.04, m: 0.015 });
    }

    // 4. Fundal height: a yellow tape measure that climbs the pot
    const tapeAz = 0.62, tapeHome = new V3(Math.sin(tapeAz) * 0.6, 0, Math.cos(tapeAz) * 0.6);
    const tp = makeToy('tp', tapeHome, tapeAz, ['FUNDAL HEIGHT'], -0.07, 0.33);
    { const m = toon('#ffd23e', { thickness: 0.004 }); tp.mats.push([m, 'tape']);
      const hubMat = toon('#e9a92a', { thickness: 0.002 }); tp.mats.push([hubMat, 'hub']);
      const geo = mergeGeometries([
        new THREE.CylinderGeometry(0.1, 0.1, 0.075, 30).rotateX(Math.PI / 2).translate(0, 0.13, 0),
        new THREE.SphereGeometry(0.024, 10, 8).scale(1, 0.8, 1.2).translate(-0.045, 0.022, 0.005),
        new THREE.SphereGeometry(0.024, 10, 8).scale(1, 0.8, 1.2).translate(0.045, 0.022, 0.005),
        new THREE.BoxGeometry(0.05, 0.025, 0.05).translate(0, 0.235, -0.01),
      ].map((g) => g.toNonIndexed()));
      const b = new THREE.Mesh(geo, m); b.castShadow = true; tp.body.add(b);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 28).rotateX(Math.PI / 2), hubMat); hub.position.set(0, 0.13, 0.036); tp.body.add(hub);
      tp.face = toyFace(tp.body, { y: 0.142, z: 0.043, r: 0.011, dx: 0.032, m: 0.014 });
      const tickTex = canvasTex(64, 128, (x, w, h) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#5a4630'; for (let j = 0; j < 8; j++) x.fillRect(0, j * 16, j % 4 === 0 ? w * 0.6 : w * 0.32, 3);
        x.fillStyle = 'rgba(90,70,48,.6)'; x.fillRect(0, 0, 4, h); x.fillRect(w - 4, 0, 4, h);
      }, { repeat: true });
      const stripMat = toon('#ffd23e', { map: tickTex, side: THREE.DoubleSide, thickness: 0 }); tp.mats.push([stripMat, 'tape']);
      const NS = 16, g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NS + 1) * 2 * 3), 3));
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array((NS + 1) * 2 * 2), 2));
      const idx = []; for (let i = 0; i < NS; i++) { const k = i * 2; idx.push(k, k + 1, k + 3, k, k + 3, k + 2); } g.setIndex(idx);
      tp.strip = new THREE.Mesh(g, stripMat); tp.strip.frustumCulled = false; world.add(tp.strip); tp.NS = NS;
    }

    // 5. Ballottement: a lavender coil spring with a face
    const sp = makeToy('sp', new V3(-0.7, 0, 0.66), 0.3, ['BALLOTTEMENT'], -0.07, 0.48);
    { const m = toon('#b39af0', { thickness: 0.0035 }); sp.mats.push([m, 'spring']);
      const pts = []; for (let i = 0; i <= 120; i++) { const k = i / 120, a = k * TAU * 4.2; pts.push(new V3(Math.cos(a) * 0.055, 0.012 + k * 0.2, Math.sin(a) * 0.055)); }
      sp.coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.016, 7), m); sp.coil.castShadow = true; sp.body.add(sp.coil);
      sp.head = new THREE.Group(); sp.body.add(sp.head);
      const hg = mergeGeometries([
        new THREE.SphereGeometry(0.075, 22, 16).scale(1, 1.08, 0.95),
        taperTube([new V3(-0.06, -0.03, 0), new V3(-0.11, 0.0, 0.01), new V3(-0.13, 0.07, 0.02)], 0.013, 0.011, { segs: 10, radial: 6 }),
        taperTube([new V3(0.06, -0.03, 0), new V3(0.11, 0.0, 0.01), new V3(0.13, 0.07, 0.02)], 0.013, 0.011, { segs: 10, radial: 6 }),
        new THREE.SphereGeometry(0.02, 10, 8).translate(-0.13, 0.08, 0.02), new THREE.SphereGeometry(0.02, 10, 8).translate(0.13, 0.08, 0.02),
      ]);
      const h = new THREE.Mesh(hg, m); h.castShadow = true; sp.head.add(h);
      sp.face = toyFace(sp.head, { y: 0.005, z: 0.07, r: 0.012, dx: 0.028, m: 0.016 });
    }

    const ORDER = ['cal', 'bf', 'pil', 'tp', 'sp'];   // presumptive first, then probable
    let rightCount = 0;

    /* ---------- confetti ---------- */
    const confTex = canvasTex(32, 32, (x) => { x.fillStyle = '#fff'; x.fillRect(9, 4, 14, 24); }, { srgb: false });
    const conf = particles(confTex, 220);
    const CONF = ['#ff9cc6', '#8fc4ee', '#bc9fec', '#ffe07a', '#9ae6b4', '#ffffff'];
    function confetti(at, n, speed) {
      for (let i = 0; i < n; i++) {
        const d = randDir(); d.y = Math.abs(d.y) * 0.8 + 0.4;
        conf.emit(at.clone().addScaledVector(d, 0.2), { v: d.multiplyScalar(rnd(0.6, 1.4) * speed), life: rnd(1.8, 3), s0: rnd(0.07, 0.11), s1: 0.06, color: CONF[i % CONF.length], g: -1.1, drag: 1.4, spin: rnd(-8, 8) });
      }
    }

    /* ---------- motion ---------- */
    const wob = new Spring(90, 5);     // confusion wobble
    const bloomS = new Spring(70, 7);
    const tmp = new V3(), tmp2 = new V3();
    const clCentre = () => cl.localToWorld(CC.clone());
    const toyWorld = (T) => T.g.localToWorld(new V3(0, 0.15, 0));

    function updateToy(T, s, party) {
      T.wake.step(s.dt); T.pop.step(s.dt); T.hop.step(s.dt);
      const w = clamp(T.wake.x, 0, 1), wk = sstep(0.2, 0.9, w);
      for (const [m, k] of T.mats) P.mix(m, k, w);
      for (const u of T.sats) u.value = w;
      if (T.face) {
        T.face.eyes.scale.y = lerp(0.16, 1, sstep(0.35, 0.8, w));
        T.face.mouth.scale.set(lerp(0.55, 1, wk), lerp(0.35, 1 + party * 0.3, wk), 0.5);
      }
      T.zz.visible = w < 0.9;
      T.zz.material.opacity = (1 - sstep(0.1, 0.6, w)) * 0.95;
      T.zz.position.y = T.zY + ((s.t * 0.35 + T.ph) % 1) * 0.08;
      T.label.visible = w > 0.4;
      T.label.material.opacity = sstep(0.45, 0.95, w);
      // a friend in front of the plant keeps its name on top of the pot and twigs; one behind it lets the plant hide it
      T.label.material.depthTest = T.id === 'bf' || T.g.getWorldPosition(tmp).z < 0.05;
      return { w, wk };
    }

    return {
      centre: clCentre,
      anchor: () => cl.localToWorld(new V3(0.62, 1.3, 0.2)),
      react(type) {
        if (type === 'wrong') {
          wob.kick(9); popT = 0;
          for (const id of ORDER) if (toys[id].wake.x > 0.5) toys[id].hop.kick(3);
        } else {
          rightCount = Math.min(N, rightCount + 1);
          const T = toys[ORDER[rightCount - 1]];
          T.pop.kick(9); T.hop.kick(3.5);
          const at = toyWorld(T);
          for (let i = 0; i < 18; i++) { const d = randDir(); spark.emit(at.clone().addScaledVector(d, 0.1), { v: d.multiplyScalar(rnd(0.4, 0.9)), life: rnd(0.6, 1), s0: 0.09, s1: 0.02, color: CONF[i % 5], drag: 1.6 }); }
        }
      },
      burst() {
        rightCount = N;
        for (const id of ORDER) { toys[id].pop.kick(8); toys[id].hop.kick(4); }
        confetti(clCentre(), 90, 2.2);
      },
      reset() { rightCount = 0; popT = 9; },
      update(s) {
        const { t, dt, h, hp, heal } = s;
        const sick = 1 - h;
        const party = sstep(0.88, 1, h);
        const flash = heal.on ? (heal.burst ? heal.glow : heal.gather) : 0;
        if (s.hTarget < 0.001 && !heal.on && !s.healed) rightCount = 0;
        let n = Math.max(rightCount, Math.floor(s.hTarget * N + 1e-4));
        if (s.healed || heal.burst) n = N;
        ORDER.forEach((id, i) => { toys[id].wake.target = i < n ? 1 : 0; });
        wob.step(dt);

        /* colour */
        P.mix(mPink, 'pink', h); P.mix(mBlue, 'blue', h); P.mix(mLav, 'lav', h); P.mix(mFace, 'face', h); P.mix(rig.lidMat, 'face', h);
        P.mix(leafMat, 'leaf', h); P.mix(twigMat, 'twig', h);
        const em = party * (0.1 + 0.04 * Math.sin(t * 3)) + flash * 0.35;
        for (const m of [mPink, mBlue, mLav, mFace]) m.emissiveIntensity = em;

        /* the cluster: droopy and unsure when sick, plump and bouncy when well */
        const breath = Math.sin(t * lerp(1.1, 1.7, h)) * M;
        const fl = s.k.flinch.x, bob = s.k.bounce.x, wb = wob.x;
        cl.position.set(s.k.shake.x * 0.02, 0.8 + lerp(-0.05, 0, clamp(hp, 0, 1.2)) + bob * 0.035 - fl * 0.025 + party * Math.abs(Math.sin(t * 3.2)) * 0.03 * M, 0);
        cl.rotation.set(lerp(0.1, 0, hp) - fl * 0.08, s.k.spin.x * 0.06 + party * Math.sin(t * 1.6) * 0.12 * M,
          lerp(0.07, 0, hp) * Math.sin(t * 0.45) + Math.sin(t * 0.7) * 0.02 * M + s.k.shake.x * 0.035 + party * Math.sin(t * 3.2) * 0.05 * M);
        const sy = lerp(0.9, 1, clamp(hp, 0, 1.15)) * (1 + breath * 0.012) * (1 - bob * 0.02);
        const sxz = (1 + breath * 0.008) * (1 + bob * 0.012) * lerp(1.04, 1, h);
        cl.scale.set(sxz, sy, sxz);
        layers.forEach((L, i) => {
          const ph = L.ph;
          L.g.rotation.set(Math.sin(t * 9 + ph) * wb * 0.05, Math.sin(t * 7 + ph * 1.3) * wb * 0.06, Math.cos(t * 8 + ph) * wb * 0.05);
          L.g.position.set(CC.x + Math.sin(t * 11 + ph) * wb * 0.01, CC.y + Math.sin(t * 1.3 + ph) * 0.008 * M, CC.z);
          L.g.scale.setScalar(1 + Math.sin(t * 1.6 + ph) * 0.01 * M + party * Math.sin(t * 4 + ph) * 0.02 * M);
        });
        faceG.rotation.set(Math.sin(t * 0.6) * 0.03 * M, Math.sin(t * 0.4) * 0.08 * sick * M, (Math.sin(t * 0.5) * 0.1 * sick + Math.sin(t * 10) * wb * 0.03) * M);
        faceG.position.y = 0.88 + Math.sin(t * 1.6 + 0.5) * 0.006 * M;
        if (popT < 1.5) rig.over({ lid: 1, low: 0, brow: 0.7, browY: 0.03, smile: -0.25, open: 0.4, w: 0.05 }, sstep(0, 0.1, popT) * (1 - sstep(1, 1.4, popT)));

        /* twigs droop when sick and lift as it is confirmed */
        for (const S of sides) {
          S.g.rotation.z = -S.s * (lerp(0.32, 0, clamp(hp, 0, 1.2)) + Math.sin(t * 0.8 + S.s) * 0.025 * M - party * Math.sin(t * 3.2 + S.s) * 0.06 * M);
        }
        for (const L of kit.leaves) L.flutter = 1 + party * 1.6 + Math.abs(wb) * 2;

        /* banner: sags at the ends when unsure, flutters when it is confirmed */
        { const p = bannerGeo.attributes.position, amp = 0.004 + party * 0.016 + Math.abs(wb) * 0.01;
          for (let i = 0; i < p.count; i++) {
            const x = banBase[i * 3], y = banBase[i * 3 + 1], z = banBase[i * 3 + 2];
            const th = Math.atan2(x, z), e = Math.abs(th) / (BAN.arc / 2);
            const k = 1 + amp * Math.sin(th * 6 + t * 5) * (0.3 + e);
            p.setXYZ(i, x * k, y + amp * 1.5 * Math.sin(th * 4 - t * 4.5) * (0.4 + e) - sick * 0.05 * e * e - (y + BAN.hgt / 2) * sick * 0.1 * e * e, z * k);
          }
          p.needsUpdate = true; bannerGeo.computeVertexNormals(); }

        /* flowers */
        bloomS.target = sstep(0.85, 1, h);
        const bl = bloomS.step(dt);
        for (const f of flowers) {
          const k = clamp((bl - f.d) / (1 - f.d * 0.5), 0, 1.25);
          f.m.visible = k > 0.01;
          f.m.scale.setScalar(Math.max(1e-4, k * f.sz * (1 + Math.sin(t * 3 + f.ph) * 0.06 * party)));
          f.m.rotateZ(dt * 0.4 * party);
        }

        /* question marks */
        qs.forEach((q, i) => {
          const v = 1 - sstep(i * 0.22, i * 0.22 + 0.2, h);
          q.sp.visible = v > 0.01;
          q.sp.material.opacity = v;
          q.sp.position.set(q.base.x + Math.sin(t * 0.9 + q.ph) * 0.04, q.base.y + Math.sin(t * 1.4 + q.ph) * 0.05 * M, q.base.z);
          q.sp.scale.setScalar(q.s * (0.7 + 0.3 * v) * (1 + Math.abs(wb) * 0.08));
          q.sp.material.rotation = Math.sin(t * 1.1 + q.ph) * 0.25;
        });
        popT += dt;
        { const k = sstep(0, 0.14, popT) * (1 - sstep(0.95, 1.3, popT));
          popQ.visible = k > 0.01; popQ.material.opacity = k;
          popQ.scale.setScalar(Math.max(1e-4, 0.42 * k * (1 + 0.25 * Math.exp(-popT * 6) * Math.sin(popT * 30))));
          popQ.position.y = 2.12 + popT * 0.08; popQ.material.rotation = Math.sin(popT * 14) * 0.2 * (1 - sstep(0, 1, popT)); }

        /* the sign friends */
        const hop = (T) => Math.max(0, T.hop.x) * 0.05 + party * Math.abs(Math.sin(t * 4.2 + T.ph)) * 0.07 * M;
        // calendar: slumped on its back asleep; awake it stands and flips its pages
        { const T = toys.cal, { w } = updateToy(T, s, party);
          T.body.rotation.set(lerp(-1.25, -0.1, sstep(0, 1, w)) , party * Math.sin(t * 2.4) * 0.3 * M, party * Math.sin(t * 4.2 + T.ph) * 0.1);
          T.body.position.y = hop(T) + (1 - sstep(0, 1, w)) * 0.025;
          T.body.scale.setScalar(1 + Math.max(0, T.pop.x) * 0.12);
          const f = ((t + T.ph) * 0.42) % 1, on = sstep(0.6, 1, w);
          let rot = 0, sc = 1;
          if (f < 0.3) rot = -Math.PI * 1.08 * sstep(0, 0.3, f);
          else if (f < 0.55) { rot = -Math.PI * 1.08; sc = 1 - sstep(0.42, 0.55, f); }
          else if (f < 0.75) { rot = 0; sc = sstep(0.55, 0.75, f); }
          T.flip.rotation.x = rot * on; T.flip.scale.y = Math.max(1e-3, lerp(1, sc, on));
        }
        // butterfly: asleep on the rim with folded wings; awake it flutters round the plant
        { const T = toys.bf, { w } = updateToy(T, s, party);
          const fly = sstep(0.05, 1, clamp(T.wake.x, 0, 1));
          const az = t * (0.75 + party * 0.35) + 2.2, y = 1.8 + 0.2 * Math.cos(az) + 0.06 * Math.sin(t * 2.3);
          tmp.set(Math.sin(az) * 1.08, y, Math.cos(az) * 0.82);
          T.g.position.copy(T.home).lerp(tmp, fly);
          T.g.rotation.set(0, lerp(T.yaw, 0.55 * Math.atan2(tmp.x, tmp.z), fly), Math.sin(t * 2) * 0.15 * fly);
          T.body.rotation.x = lerp(0.35, 0, w);
          T.body.scale.setScalar(1 + Math.max(0, T.pop.x) * 0.15);
          const flap = 0.15 + 0.95 * (0.5 + 0.5 * Math.sin(t * (14 + party * 6)));
          const rest = 0.95 + Math.sin(t * 0.8) * 0.04;
          for (const W of T.wings) W.p.rotation.y = -W.s * lerp(rest, flap, sstep(0, 0.6, w));
        }
        // pillow: lying flat asleep; awake it stands and squishes softly
        { const T = toys.pil, { w } = updateToy(T, s, party);
          const up = sstep(0, 1, w), sq = (0.5 + 0.5 * Math.sin(t * 2.6 + T.ph)) * up;
          const sqY = 1 - 0.12 * sq - Math.max(0, T.pop.x) * 0.05, sqX = 1 + 0.09 * sq + Math.max(0, T.pop.x) * 0.08;
          T.cushion.scale.set(sqX, sqY, sqX);
          T.body.rotation.set(lerp(-1.42, 0, up), party * Math.sin(t * 2.6) * 0.35 * M, party * Math.sin(t * 4.2 + T.ph) * 0.15);
          T.body.position.y = lerp(PD * 0.95, PH * sqY, up) + hop(T);
        }
        // tape measure: dozing; awake it reels its tape up the side of the pot
        { const T = toys.tp, { w } = updateToy(T, s, party);
          T.body.rotation.set(lerp(-0.25, 0, w), party * Math.sin(t * 3) * 0.3 * M, lerp(0.35, 0, w) + party * Math.sin(t * 4.2 + T.ph) * 0.12);
          T.body.position.y = hop(T);
          T.body.scale.setScalar(1 + Math.max(0, T.pop.x) * 0.15);
          const L = 0.32 + 0.36 * sstep(0.5, 1, w) * (0.62 + 0.38 * Math.sin(t * 1.3 + T.ph));
          const g = T.strip.geometry, p = g.attributes.position, uv = g.attributes.uv, NS = T.NS;
          T.strip.visible = L > 0.34;
          if (T.strip.visible) {
            const ca = Math.cos(tapeAz), sa = Math.sin(tapeAz), half = 0.032;
            let len = 0, prev = null;
            for (let i = 0; i <= NS; i++) {
              const k = i / NS, y = lerp(0.3, L, k), r = i === 0 ? 0.56 : potR(y) + 0.012;
              const c = tmp2.set(sa * r, y + (i === 0 ? T.body.position.y : 0), ca * r);
              if (prev) len += c.distanceTo(prev);
              prev = (prev || new V3()).copy(c);
              p.setXYZ(i * 2, c.x - ca * half, c.y, c.z + sa * half);
              p.setXYZ(i * 2 + 1, c.x + ca * half, c.y, c.z - sa * half);
              uv.setXY(i * 2, 0, len * 4); uv.setXY(i * 2 + 1, 1, len * 4);
            }
            p.needsUpdate = true; uv.needsUpdate = true; g.computeVertexNormals();
          }
        }
        // spring: squashed and slumped asleep; awake it bounces
        { const T = toys.sp, { w } = updateToy(T, s, party);
          const up = sstep(0, 1, w), b = Math.abs(Math.sin(t * (3.6 + party * 1.4) + T.ph));
          const cs = lerp(0.55, lerp(0.72, 1.28, b), up) - Math.max(0, T.pop.x) * 0.1;
          T.coil.scale.set(1, cs, 1);
          T.head.position.set(0, 0.012 + 0.2 * cs + 0.07, 0);
          T.head.rotation.set(lerp(0.3, 0, up), 0, lerp(0.45, Math.sin(t * 3.6 + T.ph) * 0.12, up));
          T.body.position.y = up * b * 0.07 * M + Math.max(0, T.hop.x) * 0.05;
          T.body.rotation.y = party * Math.sin(t * 2.2) * 0.5 * M;
        }

        /* confetti while it celebrates */
        if (party > 0.6 && Math.random() < dt * 14 * M) {
          const at = world.localToWorld(new V3(rnd(-1.3, 1.3), 2.45, rnd(-0.4, 0.6)));
          conf.emit(at, { v: new V3(rnd(-0.1, 0.1), rnd(-0.35, -0.2), 0), life: rnd(3.5, 5), s0: 0.08, s1: 0.07, color: CONF[Math.floor(rnd(0, CONF.length))], g: -0.05, drag: 0.4, spin: rnd(-5, 5), floor: 0.02 });
        }
      },
    };
  },
};
