/* 6. Pre-eclampsia: the Pre-eclampsia Clam Plant.
   From her slide (refs/p18_0.jpg): a lilac clam shell with darker purple
   spots and a thick cream wavy lip for a head; inside, a puffy purple face
   with heavy-lidded tired eyes, bags under them and a small frown. It sits on
   a twisted green stem in a mound of dark soil, two big droopy leaves
   yellowing with purple blotches. A black BP cuff (white "BP CUFF", a red
   heart) hangs on a vine off the stem, its hoses running to a squeeze bulb
   and to a round gauge that reads high, in the red. Charcoal ink line.
   Healed (my addition, from "Recovery: The Bloom"): it opens wide like a
   happy clam with a pearl inside, the puffiness goes, the leaves green and
   lift, the cuff hangs loose and the needle settles in the normal zone. */

export default {
  id: 'clam-plant',
  look: { ink: '#2b2430', bands: [92, 158, 218, 255], outline: 0.0045, rune: ['#c79af0', '#8fe0b4'], bg: ['#4d3f60', '#271d34', '#0c0812'] },
  frame: { halfH: 1.3, halfW: 1.5, lookY: 1.13 },
  careTitle: 'Ease the pressure',
  lines: {
    sick: 'Not feeling quite shore...',
    wrong: ['Ow, my head!', 'Clamming up...', 'The pressure!'],
    right: ['Ahh, a little looser.', 'Phew...'],
    healed: 'Feeling shore-ly better!',
  },
  shows: [
    '<b>The gauge needle in the red, twitching, the cuff squeezing</b>: high blood pressure.',
    '<b>A puffy face, a swollen stem, heavy waterlogged leaves</b>: swelling (oedema).',
    '<b>Foamy bubbles in the soil</b>: protein in the urine.',
    '<b>The shell clenching, pain stars throbbing</b>: a persistent headache.',
    '<b>Sparkles flickering before its eyes</b>: visual disturbances.',
    '<b>A sudden wince</b>: right upper quadrant or epigastric pain.',
  ],
  healedNote: 'Healed, it opens wide like a happy clam with a pearl inside: the puffiness goes down, the leaves turn green and lift, the cuff hangs loose and the needle settles in the normal zone.',

  build(kit) {
    const { THREE, world, toon, noOutline, canvasTex, sheet, limb, taperTube, addLeaf, face, palette, Spring,
      spark, wisp, heartbeat, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, V3, TAU, DEG, mergeGeometries, tex } = kit;

    const P = palette({
      shell: ['#ffffff', '#fff3fb'], face: ['#8a5a9c', '#b67dc2'], lid: ['#7c4c90', '#a774b8'], bag: ['#5c3272', '#ad74bb'],
      mantle: ['#6a3c7c', '#8e5098'], stem: ['#82995a', '#5ea64b'], leaf: ['#719a4a', '#4fa444'], vein: ['#b2bd7e', '#c8e8a2'],
    });

    /* ---------- textures ---------- */
    // shell: v runs from the inner centre (0) over the lip (0.42..0.58) to the outer centre (1)
    const shellTex = canvasTex(1024, 512, (x, w, h) => {
      const yO = h * 0.42, yL = h * 0.58;
      let g = x.createLinearGradient(0, 0, 0, yO);
      g.addColorStop(0, '#d2bae6'); g.addColorStop(1, '#c0a2d8');
      x.fillStyle = g; x.fillRect(0, 0, w, yO);
      const blob = (cx, cy, rx, ry) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill(); };
      for (let i = 0; i < 320; i++) {                 // soft mottling
        const y = R() * yO, st = 1 / Math.max(0.2, Math.sin(Math.PI / 2 * y / yO));
        x.fillStyle = R() < 0.55 ? 'rgba(240,230,250,.32)' : 'rgba(140,100,175,.14)';
        blob(R() * w, y, rr(5, 16) * st, rr(3, 9));
      }
      for (let i = 0; i < 115; i++) {                 // the purple spots, bigger toward the lip
        const y = Math.pow(R(), 0.55) * yO * 0.97, k = y / yO, st = 1 / Math.max(0.22, Math.sin(Math.PI / 2 * k));
        const rx = rr(5, 14) * (0.5 + 0.7 * k) * st, ry = rr(4.5, 11) * (0.5 + 0.7 * k), cx = R() * w;
        x.fillStyle = 'rgba(146,98,186,.92)'; blob(cx, y, rx, ry);
        x.fillStyle = 'rgba(118,74,160,.6)'; blob(cx + rx * 0.15, y + ry * 0.2, rx * 0.55, ry * 0.5);
      }
      // the cream lip, a little shading at each edge
      x.fillStyle = '#f3e7d1'; x.fillRect(0, yO, w, yL - yO);
      x.fillStyle = 'rgba(205,180,160,.55)'; x.fillRect(0, yO, w, 6); x.fillRect(0, yL - 7, w, 7);
      x.fillStyle = 'rgba(255,255,250,.6)'; x.fillRect(0, yO + (yL - yO) * 0.35, w, 6);
      // inside: purple flesh, a ruffled frill by the lip, fibres toward the centre
      g = x.createLinearGradient(0, yL, 0, h);
      g.addColorStop(0, '#a874b4'); g.addColorStop(0.25, '#915ca2'); g.addColorStop(1, '#5e3270');
      x.fillStyle = g; x.fillRect(0, yL, w, h - yL);
      x.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        x.strokeStyle = k % 2 ? 'rgba(200,150,210,.45)' : 'rgba(90,45,110,.55)'; x.lineWidth = 5 - k * 0.6;
        x.beginPath();
        for (let px = 0; px <= w; px += 6) { const py = yL + 10 + k * 11 + Math.sin(px * 0.055 + k * 1.3) * 6; px ? x.lineTo(px, py) : x.moveTo(px, py); }
        x.stroke();
      }
      for (let i = 0; i < 220; i++) {
        const px = R() * w, py = yL + rr(40, 90);
        x.strokeStyle = R() < 0.6 ? 'rgba(80,40,100,.3)' : 'rgba(205,160,215,.25)'; x.lineWidth = rr(1, 2.5);
        x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + rr(-6, 6), py + 40, px + rr(-10, 10), Math.min(h, py + rr(60, 110))); x.stroke();
      }
    });

    // leaf mask: red = purple blotches, green = yellowing toward edges and tip, blue = veins
    const leafMask = canvasTex(128, 256, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'lighter';
      let g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(0,255,0,1)'); g.addColorStop(0.3, 'rgba(0,90,0,1)'); g.addColorStop(0.5, 'rgba(0,0,0,1)'); g.addColorStop(0.72, 'rgba(0,110,0,1)'); g.addColorStop(1, 'rgba(0,255,0,1)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,150,0,1)'); g.addColorStop(0.4, 'rgba(0,20,0,1)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i++) {
        const r = rr(4, 11), cx = rr(0.18, 0.82) * w, cy = rr(0.12, 0.85) * h;
        const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, 'rgba(255,0,0,1)'); rg.addColorStop(0.7, 'rgba(255,0,0,.9)'); rg.addColorStop(1, 'rgba(255,0,0,0)');
        x.fillStyle = rg; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
      }
      x.strokeStyle = 'rgb(0,0,255)'; x.lineCap = 'round';
      x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 6); x.stroke();
      x.lineWidth = 2;
      for (let i = 1; i <= 7; i++) {
        const y = h - i * h / 8.2;
        for (const s of [-1, 1]) { x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w / 2 + s * w * 0.2, y - h * 0.04, w / 2 + s * w * 0.44, y - h * 0.13); x.stroke(); }
      }
    }, { srgb: false });

    const cuffTex = canvasTex(512, 256, (x, w, h) => {
      x.fillStyle = '#2a2a31'; x.fillRect(0, 0, w, h);
      x.lineWidth = 1;
      for (let i = 0; i < w; i += 4) { x.strokeStyle = i % 8 ? 'rgba(150,150,165,.13)' : 'rgba(0,0,0,.25)'; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
      for (let j = 0; j < h; j += 4) { x.strokeStyle = j % 8 ? 'rgba(150,150,165,.12)' : 'rgba(0,0,0,.22)'; x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
      x.setLineDash([9, 6]); x.strokeStyle = 'rgba(205,205,215,.55)'; x.lineWidth = 2.5;
      for (const y of [h * 0.16, h * 0.84]) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
      x.setLineDash([]);
      x.fillStyle = '#f6f6f6'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = 'bold 62px Arial, Helvetica, sans-serif'; x.fillText('BP', 256, 82);
      x.font = 'bold 40px Arial, Helvetica, sans-serif'; x.fillText('CUFF', 256, 132);
      const hx = 256, hy = 182, s = 26;           // the red heart with a pulse line
      x.fillStyle = '#d6343e'; x.beginPath();
      x.moveTo(hx, hy + s * 0.75);
      x.bezierCurveTo(hx - s * 1.3, hy - s * 0.1, hx - s * 0.7, hy - s * 1.05, hx, hy - s * 0.4);
      x.bezierCurveTo(hx + s * 0.7, hy - s * 1.05, hx + s * 1.3, hy - s * 0.1, hx, hy + s * 0.75);
      x.fill();
      x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.lineJoin = 'round'; x.beginPath();
      x.moveTo(hx - 40, hy - 4); x.lineTo(hx - 14, hy - 4); x.lineTo(hx - 7, hy - 18); x.lineTo(hx + 1, hy + 10); x.lineTo(hx + 8, hy - 8); x.lineTo(hx + 14, hy - 4); x.lineTo(hx + 40, hy - 4);
      x.stroke();
    });

    // the gauge dial: 60..200 mmHg over 240 degrees, a red zone and a pale green normal zone
    const ang = (v) => ((v - 130) / 140) * 240 * DEG;      // from 12 o'clock, clockwise
    const dialTex = canvasTex(256, 256, (x, w) => {
      const c = w / 2, ca = (a) => a - Math.PI / 2;
      x.fillStyle = '#f7f4ec'; x.beginPath(); x.arc(c, c, c, 0, TAU); x.fill();
      x.lineCap = 'butt';
      x.strokeStyle = 'rgba(226,72,72,.9)'; x.lineWidth = 22; x.beginPath(); x.arc(c, c, 100, ca(ang(158)), ca(ang(200))); x.stroke();
      x.strokeStyle = 'rgba(236,140,130,.7)'; x.lineWidth = 22; x.beginPath(); x.arc(c, c, 100, ca(ang(145)), ca(ang(158))); x.stroke();
      x.strokeStyle = 'rgba(120,196,120,.75)'; x.lineWidth = 12; x.beginPath(); x.arc(c, c, 104, ca(ang(95)), ca(ang(130))); x.stroke();
      x.strokeStyle = '#2a2430';
      for (let v = 60; v <= 200; v += 5) {
        const a = ang(v), major = v % 20 === 0, r0 = major ? 92 : 100;
        x.lineWidth = major ? 3.5 : 1.6;
        x.beginPath(); x.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); x.lineTo(c + Math.sin(a) * 111, c - Math.cos(a) * 111); x.stroke();
      }
      x.fillStyle = '#2a2430'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = 'bold 19px Georgia, serif';
      for (let v = 60; v <= 200; v += 20) { const a = ang(v); x.fillText(String(v), c + Math.sin(a) * 72, c - Math.cos(a) * 72); }
      x.font = 'italic 17px Georgia, serif'; x.fillText('mmHg', c, c + 50);
    });

    /* ---------- materials ---------- */
    const shellMat = toon('#ffffff', { map: shellTex, thickness: 0.0052 });
    const mantleMat = toon('#6a3c7c', { thickness: 0.003 });
    const faceMat = toon('#8a5a9c', { thickness: 0.0042 });
    const bagMat = toon('#5c3272', { thickness: 0 });
    const stemMat = toon('#82995a', { map: tex.bark, thickness: 0.004 });
    const soilMat = toon('#4a3427', { map: tex.grain, thickness: 0.0045 });
    const pebbleMat = toon('#8a8078', { thickness: 0.003 });
    const leafU = { uSick: { value: 1 }, uYellow: { value: new THREE.Color('#d2be5a') }, uBlotch: { value: new THREE.Color('#5e3866') }, uVein: { value: new THREE.Color('#b2bd7e') } };
    const leafMat = toon('#8aa257', { map: leafMask, side: THREE.DoubleSide, thickness: 0.0042 });
    leafMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, leafU);
      sh.fragmentShader = 'uniform float uSick;\nuniform vec3 uYellow;\nuniform vec3 uBlotch;\nuniform vec3 uVein;\n' + sh.fragmentShader.replace('#include <map_fragment>', `
        vec4 lm = texture2D( map, vMapUv );
        diffuseColor.rgb = mix( diffuseColor.rgb, uYellow, clamp( lm.g * 1.1, 0.0, 1.0 ) * uSick * 0.55 );
        diffuseColor.rgb = mix( diffuseColor.rgb, uBlotch, lm.r * uSick * 0.9 );
        diffuseColor.rgb = mix( diffuseColor.rgb, uVein, lm.b * 0.6 );`);
    };
    const rubberMat = toon('#2c2c34', { thickness: 0.0035 });
    const silverMat = toon('#b9bec8', { thickness: 0.0025 });
    const cuffMat = toon('#ffffff', { map: cuffTex, thickness: 0.0045 });
    const dialMat = toon('#ffffff', { map: dialTex, thickness: 0 });
    const needleMat = toon('#1d1a22', { thickness: 0.002 });
    const starMat = toon('#ffd34a', { thickness: 0.003, emissive: '#ff9a3a', emissiveIntensity: 0.25 });
    const popMat = toon('#ee4b3c', { thickness: 0.0035, emissive: '#ff4020', emissiveIntensity: 0.3 });
    const pearlMat = toon('#fff6fb', { thickness: 0.003, emissive: '#ffd6ec', emissiveIntensity: 0.35 });
    const foamMat = toon('#f4f2ea', { thickness: 0, transparent: true, opacity: 0.92, emissive: '#cfd8e8', emissiveIntensity: 0.25 });

    /** A curly tendril (as kit.tendrilGeo, lighter). */
    function curl({ rise = 0.1, r0 = 0.06, coils = 1.7, thick = 0.009, dir = 1 }) {
      const pts = [new V3(0, 0, 0), new V3(0, rise * 0.5, 0), new V3(0, rise, 0)];
      for (let i = 1; i <= 24; i++) { const k = i / 24, a = k * coils * TAU, r = r0 * (1 - 0.78 * k); pts.push(new V3(dir * (r0 - r * Math.cos(a)), rise + r * Math.sin(a), 0)); }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, thick, 5, false);
    }

    /* ---------- the plant ---------- */
    const plant = new THREE.Group(); world.add(plant);
    const tmpV = new V3(), tmpV2 = new V3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion();

    // soil: a lumpy mound; soilY gives its height so bubbles can sit on it
    const soilEdge = (th) => 0.6 * (1 + 0.07 * Math.sin(5 * th + 0.7) + 0.04 * Math.sin(11 * th + 2.1));
    const soilN = (x, z) => 0.02 * Math.sin(x * 17 + 1.3) * Math.cos(z * 15 + 0.4) + 0.012 * Math.sin(x * 31 - z * 27);
    const soilY = (x, z) => { const th = Math.atan2(z, x), k = clamp(Math.hypot(x, z) / soilEdge(th), 0, 1); return 0.22 * Math.pow(1 - k * k, 0.75) + soilN(x, z) * (1 - k * k); };
    const soilGeo = (() => {
      const RINGS = 10, COLS = 44, pos = [], uv = [], idx = [];
      for (let j = 0; j <= RINGS; j++) for (let i = 0; i <= COLS; i++) {
        const th = (i / COLS) * TAU, r = soilEdge(th) * (j / RINGS), x = Math.cos(th) * r, z = Math.sin(th) * r;
        pos.push(x, soilY(x, z), z); uv.push(x * 2, z * 2);
      }
      for (let j = 0; j < RINGS; j++) for (let i = 0; i < COLS; i++) {
        const a = j * (COLS + 1) + i, b = a + 1, c = a + COLS + 1, d = c + 1;
        idx.push(a, d, b, a, c, d);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      const parts = [g];
      for (let i = 0; i < 16; i++) {                // clods round the rim and on top
        const th = rr(0, TAU), k = i < 10 ? rr(0.85, 1.0) : rr(0.3, 0.7), x = Math.cos(th) * soilEdge(th) * k, z = Math.sin(th) * soilEdge(th) * k;
        const r = rr(0.035, 0.07);
        parts.push(new THREE.SphereGeometry(r, 8, 5).scale(1, 0.7, 1).translate(x, soilY(x, z) + r * 0.2, z));
      }
      // a small clod where the gauge's stalk is planted
      parts.push(new THREE.SphereGeometry(0.14, 14, 8, 0, TAU, 0, Math.PI / 2).scale(1, 0.45, 1).translate(1.1, 0, -0.12));
      return mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)).map((p) => { p.deleteAttribute('normal'); return p; }));
    })();
    soilGeo.computeVertexNormals();
    const soil = new THREE.Mesh(soilGeo, soilMat); soil.receiveShadow = true; plant.add(soil);
    {
      const parts = [];
      for (let i = 0; i < 14; i++) {
        const th = rr(0, TAU), k = rr(0.35, 0.95), x = Math.cos(th) * soilEdge(th) * k, z = Math.sin(th) * soilEdge(th) * k;
        parts.push(new THREE.DodecahedronGeometry(rr(0.018, 0.035), 0).scale(1, 0.7, 1).translate(x, soilY(x, z) + 0.008, z));
      }
      plant.add(new THREE.Mesh(mergeGeometries(parts), pebbleMat));
    }

    // the twisted stem
    const STEM_Y = 0.16;
    const stem = limb({ len: 1.0, r0: 0.058, r1: 0.04, bones: 5, mat: stemMat, strands: 3, twist: 0.85, spread: 0.034, cap: false, radial: 9 });
    stem.mesh.position.y = STEM_Y; plant.add(stem.mesh);
    {
      // a flared foot with roots curling over the soil
      const parts = [new THREE.LatheGeometry([[0.18, 0.1], [0.155, 0.17], [0.125, 0.24], [0.1, 0.32], [0.088, 0.42]].map(([r, y]) => new THREE.Vector2(r, y)), 16)];
      for (const [th, len, up] of [[0.4, 0.42, 0.05], [2.1, 0.38, 0.04], [3.6, 0.45, 0.06], [5.0, 0.34, 0.04], [-0.9, 0.3, 0.03]]) {
        const pts = [];
        for (let k = 0; k <= 4; k++) {
          const r = 0.08 + (k / 4) * len, bend = Math.sin(k * 0.9) * 0.08, x = Math.cos(th + bend) * r, z = Math.sin(th + bend) * r;
          pts.push(new V3(x, soilY(x, z) + 0.01 + up * (1 - k / 4) + (k === 0 ? 0.08 : 0), z));
        }
        parts.push(taperTube(pts, 0.035, 0.008, { segs: 20, radial: 6 }));
      }
      const foot = new THREE.Mesh(mergeGeometries(parts.map((p) => p.toNonIndexed())), stemMat); foot.castShadow = true; plant.add(foot);
    }

    // followers: groups that ride a stem bone
    const followers = [];
    function follower(bi, y) { const g = new THREE.Group(); plant.add(g); followers.push({ g, b: stem.bones[bi], y }); return g; }
    function stepFollowers() {
      plant.updateMatrixWorld(true);
      plant.getWorldQuaternion(tmpQ).invert();
      for (const f of followers) {
        f.g.position.copy(f.b.localToWorld(tmpV.set(0, f.y, 0))); plant.worldToLocal(f.g.position);
        f.b.getWorldQuaternion(tmpQ2); f.g.quaternion.copy(tmpQ).multiply(tmpQ2);
      }
    }

    // leaves: two big droopy ones on the left, a smaller one right, one behind
    const LEAF = sheet({ width: 0.42, cup: 0.13, curl: 0.22, point: 0.72, rows: 14, cols: 7, wave: 0.07, waveN: 6 });
    const LEAF2 = sheet({ width: 0.38, cup: 0.16, curl: 0.3, point: 0.8, rows: 12, wave: 0.05 });
    const leaves = [];
    {
      const f2 = follower(2, 0.08), f1 = follower(1, 0.1), f3 = follower(3, 0.02);
      leaves.push(addLeaf(f2, new V3(-0.03, 0, 0), new V3(-0.78, 0.62, 0.18), new V3(-0.85, -0.42, 0.22), 0.98, leafMat, LEAF, new V3(-0.2, 1, 0.4)));
      leaves.push(addLeaf(f1, new V3(-0.03, 0, 0.02), new V3(-0.5, 0.72, 0.55), new V3(-0.55, -0.3, 0.62), 0.72, leafMat, LEAF, new V3(-0.1, 1, 0.5)));
      leaves.push(addLeaf(f1, new V3(0.03, -0.02, 0), new V3(0.72, 0.62, 0.32), new V3(0.8, -0.2, 0.4), 0.55, leafMat, LEAF2, new V3(0.2, 1, 0.4)));
      leaves.push(addLeaf(f3, new V3(0, 0, -0.02), new V3(0.25, 0.7, -0.7), new V3(0.3, -0.25, -0.8), 0.6, leafMat, LEAF2));
      // little curly tendrils on the stem
      const td1 = new THREE.Mesh(curl({ rise: 0.1, r0: 0.06, coils: 1.6, thick: 0.009, dir: -1 }), stemMat);
      td1.position.set(-0.03, 0.05, 0.03); td1.rotation.set(0.3, 0.4, 0.35); f3.add(td1);
      const td2 = new THREE.Mesh(curl({ rise: 0.08, r0: 0.05, coils: 1.8, thick: 0.008, dir: 1 }), stemMat);
      td2.position.set(0.03, 0.02, 0.03); td2.rotation.set(0.2, -0.5, -0.5); f2.add(td2);
    }

    /* ---------- the clam head ---------- */
    const headF = follower(4, stem.seg);
    const head = new THREE.Group(); head.position.y = 0.46; headF.add(head);

    function valveGeo({ H, sign, T = 0.062, A = 0.64, B = 0.5, N = 9, wave = 0.05, lobe = 0.04 }) {
      const C = 64, RI = 10, RL = 6, RO = 15, rows = RI + RL + RO;
      const pos = [], uv = [], idx = [];
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= C; i++) {
        const u = i / C, th = Math.PI + u * TAU, sx = Math.sin(th), cz = Math.cos(th);
        const re = 1 / Math.sqrt((sx / A) ** 2 + (cz / B) ** 2);
        const front = sstep(-0.8, 0.1, cz), wv = Math.cos(N * th);
        const rim = re * (1 + 0.045 * wv * front), w = wave * wv * front;
        const lb = lobe * (0.5 + 0.5 * Math.cos(4 * th + 0.4)) * (0.6 + 0.4 * front);
        let r, y, v;
        if (j <= RI) { const a = (j / RI) * Math.PI / 2, q = Math.sin(a); r = (rim - T) * q; y = sign * (H - T) * Math.cos(a) + w * q ** 4; v = 0.42 * (j / RI); }
        else if (j <= RI + RL) { const f = ((j - RI) / RL) * Math.PI; r = rim - T / 2 - (T / 2) * Math.cos(f); y = w - sign * T * 0.55 * Math.sin(f); v = 0.42 + (0.16 * (j - RI)) / RL; }
        else { const e = (j - RI - RL) / RO, a = (1 - e) * Math.PI / 2, q = Math.sin(a); r = rim * q; y = sign * (H * Math.cos(a) + lb * Math.sin(Math.PI * q)) + w * q ** 4; v = 0.58 + 0.42 * e; }
        pos.push(r * sx, y, r * cz); uv.push(u, v);
      }
      for (let j = 0; j < rows; j++) for (let i = 0; i < C; i++) {
        const a = j * (C + 1) + i, b = a + 1, c = a + C + 1, d = c + 1;
        if (sign > 0) idx.push(a, b, d, a, d, c); else idx.push(a, d, b, a, c, d);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    const HB = 0.48;
    const hingeU = new THREE.Group(); hingeU.position.z = -HB; head.add(hingeU);
    const hingeL = new THREE.Group(); hingeL.position.z = -HB; head.add(hingeL);
    const upper = new THREE.Mesh(valveGeo({ H: 0.44, sign: 1 }), shellMat); upper.position.z = HB; upper.castShadow = true; hingeU.add(upper);
    const lower = new THREE.Mesh(valveGeo({ H: 0.33, sign: -1 }), shellMat); lower.position.z = HB; lower.castShadow = true; hingeL.add(lower);

    // the neck: the stem flaring into the bottom of the shell
    const neck = new THREE.Mesh(new THREE.LatheGeometry([[0.05, -0.5], [0.06, -0.42], [0.09, -0.35], [0.15, -0.28], [0.2, -0.24]].map(([r, y]) => new THREE.Vector2(r, y)), 14), stemMat);
    neck.castShadow = true; head.add(neck);
    for (const [x, ry, rz] of [[-0.06, 0.6, 0.6], [0.06, -0.4, -0.7]]) {
      const td = new THREE.Mesh(curl({ rise: 0.06, r0: 0.045, coils: 1.7, thick: 0.008, dir: x < 0 ? -1 : 1 }), stemMat);
      td.position.set(x, -0.36, 0.05); td.rotation.set(0.2, ry, rz); head.add(td);
    }

    // the flesh inside, filling the back and the sides of the gape
    const mantle = new THREE.Mesh(mergeGeometries([[0, -0.02, -0.2, 0.3, 0.7], [-0.3, -0.04, -0.06, 0.17, 0.55], [0.3, -0.04, -0.06, 0.17, 0.55]]
      .map(([x, y, z, r, sy]) => new THREE.SphereGeometry(r, 18, 12).scale(1.15, sy, 1).translate(x, y, z))), mantleMat);
    head.add(mantle);

    // the face: a puffy purple blob with cheeks and a nose
    const FA = 0.33, FB = 0.27, FC = 0.23;
    const faceG = new THREE.Group(); faceG.position.set(0, 0.1, 0.1); head.add(faceG);
    const fSurfZ = (x, y) => FC * Math.sqrt(Math.max(1e-4, 1 - (x / FA) ** 2 - (y / FB) ** 2));
    const EYE = { x: 0.122, y: 0.055, r: 0.08 };
    const faceBlob = new THREE.Mesh(mergeGeometries([
      new THREE.SphereGeometry(1, 32, 22).scale(FA, FB, FC),
      new THREE.SphereGeometry(0.12, 16, 12).translate(-0.155, -0.1, 0.13),
      new THREE.SphereGeometry(0.12, 16, 12).translate(0.155, -0.1, 0.13),
      new THREE.SphereGeometry(0.034, 14, 10).scale(1.1, 0.9, 1).translate(0, -0.035, fSurfZ(0, -0.035) - 0.004),
    ]), faceMat);
    faceBlob.castShadow = true; faceG.add(faceBlob);
    const bags = new THREE.Mesh(mergeGeometries([-1, 1].map((s) => {
      const x = s * EYE.x, y = EYE.y - EYE.r * 0.98;
      return new THREE.SphereGeometry(1, 16, 10).scale(0.058, 0.024, 0.02).rotateZ(s * 0.12).translate(x, y, fSurfZ(x, y) - 0.004);
    })), bagMat);
    faceG.add(bags);
    const rig = face(faceG, {
      a: FA, b: FB, c: FC, gazeScale: 0.6,
      eyes: { x: EYE.x, y: EYE.y, r: EYE.r, iris: '#2a1a26', white: '#f6eed2', lid: '#71438a' },
      brows: { y: 0.162, len: 0.075, r: 0.0095, color: '#4b2a5a' },
      mouth: { y: -0.13, inside: '#4a2040', lip: '#2b2430' },
      sickE: { lid: 0.2, low: 0.28, brow: 0.42, browY: -0.004, smile: -0.85, open: 0, w: 0.065 },
      wellE: { lid: 1, low: 0.24, brow: -0.08, browY: 0.02, smile: 1, open: 0.35, w: 0.13 },
      wrongE: { lid: 0.08, low: 0.55, brow: 0.9, browY: -0.01, smile: -1, open: 0.35, w: 0.08 },
      rightE: { lid: 0.7, low: 0.3, brow: 0.15, browY: 0.02, smile: 0.2, open: 0.55, w: 0.07 },
    });

    // the pearl, which only appears when healed
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 18), pearlMat);
    pearl.position.set(0.31, -0.05, 0.32); pearl.scale.setScalar(1e-4); head.add(pearl);
    const pearlShine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), noOutline(new THREE.MeshBasicMaterial({ color: '#ffffff' })));
    pearlShine.position.set(-0.03, 0.04, 0.07); pearl.add(pearlShine);
    const pearlS = new Spring(110, 8);

    // headache: pain stars over the shell, and one that pops on a wrong card
    const starShape = new THREE.Shape();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 0.032 : 0.078, a = (k / 10) * TAU + Math.PI / 2; k ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const STAR = new THREE.ExtrudeGeometry(starShape, { depth: 0.024, bevelEnabled: false }).translate(0, 0, -0.012);
    const stars = [[-0.52, 0.66, 0.12, 0.9], [0.5, 0.74, 0.06, 1], [-0.1, 0.88, 0.02, 0.8]].map(([x, y, z, s], i) => {
      const m = new THREE.Mesh(STAR, starMat); m.position.set(x, y, z); head.add(m);
      return { m, x, y, z, s, ph: i * 1.7 };
    });
    const popStar = new THREE.Mesh(STAR, popMat); popStar.position.set(0.3, 0.88, 0.25); popStar.scale.setScalar(1e-4); head.add(popStar);

    /* ---------- the BP cuff on its vine, the bulb, the gauge ---------- */
    const vineF = follower(4, 0.02);
    {
      const pts = [[0.0, 0, 0], [0.13, 0.06, 0.02], [0.25, 0.02, 0.04], [0.31, -0.1, 0.05], [0.32, -0.3, 0.05], [0.31, -0.5, 0.05], [0.26, -0.59, 0.06], [0.2, -0.56, 0.06], [0.21, -0.5, 0.06]].map((p) => new V3(...p));
      const vine = new THREE.Mesh(taperTube(pts, 0.03, 0.01, { segs: 40, radial: 7 }), stemMat); vine.castShadow = true; vineF.add(vine);
    }
    const cuffG = new THREE.Group(); cuffG.position.set(0.32, -0.3, 0.05); cuffG.rotation.y = -0.2; vineF.add(cuffG);
    const cuffGeo = new THREE.LatheGeometry([[0.04, -0.17], [0.11, -0.17], [0.127, -0.158], [0.134, -0.135], [0.137, -0.06], [0.137, 0.06], [0.134, 0.135], [0.127, 0.158], [0.11, 0.17], [0.04, 0.17]]
      .map(([r, y]) => new THREE.Vector2(r, y)), 40, -Math.PI, TAU);
    { const p = cuffGeo.attributes.position, u = cuffGeo.attributes.uv; for (let i = 0; i < p.count; i++) u.setY(i, (p.getY(i) + 0.17) / 0.34); }
    const cuff = new THREE.Mesh(cuffGeo, cuffMat); cuff.castShadow = true; cuffG.add(cuff);
    const outA = new THREE.Object3D(); outA.position.set(0.035, -0.17, 0.08); cuffG.add(outA);
    const outB = new THREE.Object3D(); outB.position.set(-0.04, -0.17, 0.075); cuffG.add(outB);

    // the squeeze bulb, hanging off its hose
    const bulbG = new THREE.Group(); plant.add(bulbG);
    const bulbBody = new THREE.Group(); bulbG.add(bulbBody);
    const bulb = new THREE.Mesh(mergeGeometries([
      new THREE.SphereGeometry(0.1, 22, 16).scale(1.35, 1, 1).translate(0.15, 0, 0),
      new THREE.SphereGeometry(0.045, 14, 10).translate(0.03, 0, 0),
    ]), rubberMat);
    bulb.castShadow = true; bulbBody.add(bulb);
    const valve = new THREE.Mesh(mergeGeometries([
      new THREE.CylinderGeometry(0.028, 0.028, 0.07, 12).rotateZ(Math.PI / 2).translate(-0.01, 0, 0),
      new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8).translate(-0.01, 0.04, 0),
      new THREE.CylinderGeometry(0.022, 0.022, 0.014, 12).translate(-0.01, 0.066, 0),
    ]), silverMat);
    bulbG.add(valve);
    const bulbEnd = new V3(-0.05, 0, 0);

    // the gauge on its own green stalk
    const gauge = new THREE.Group(); gauge.position.set(1.06, 1.42, -0.02); gauge.rotation.set(-0.06, -0.14, 0); plant.add(gauge);
    const bezel = new THREE.Mesh(mergeGeometries([
      new THREE.CylinderGeometry(0.28, 0.28, 0.075, 40).rotateX(Math.PI / 2),
      new THREE.TorusGeometry(0.256, 0.024, 8, 40).translate(0, 0, 0.038),
      new THREE.CylinderGeometry(0.038, 0.038, 0.07, 12).translate(0, -0.3, 0),
      new THREE.CylinderGeometry(0.028, 0.028, 0.05, 10).translate(0, -0.355, 0),
    ]), rubberMat);
    bezel.castShadow = true; gauge.add(bezel);
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.238, 48), dialMat); dial.position.z = 0.039; gauge.add(dial);
    const needle = new THREE.Mesh(mergeGeometries([
      new THREE.BoxGeometry(0.014, 0.23, 0.006).translate(0, 0.08, 0),
      new THREE.CylinderGeometry(0.022, 0.022, 0.012, 14).rotateX(Math.PI / 2),
    ]), needleMat);
    needle.position.z = 0.047; gauge.add(needle);
    const nub = new THREE.Object3D(); nub.position.set(0, -0.375, 0); gauge.add(nub);
    {
      const pts = [new V3(1.1, 0.02, -0.12), new V3(1.13, 0.45, -0.12), new V3(1.1, 0.9, -0.1), new V3(1.07, 1.3, -0.07)];
      const stalk = new THREE.Mesh(taperTube(pts, 0.032, 0.022, { segs: 24, radial: 7 }), stemMat); stalk.castShadow = true; plant.add(stalk);
      const sf = new THREE.Group(); sf.position.set(1.13, 0.5, -0.11); plant.add(sf);
      leaves.push(addLeaf(sf, new V3(), new V3(0.6, 0.7, 0.3), new V3(0.7, -0.1, 0.35), 0.34, leafMat, LEAF2));
    }

    // hoses, rebuilt in place each frame so they follow the swaying cuff
    function hose(segs, radial, r) {
      const g = new THREE.TubeGeometry(new THREE.LineCurve3(new V3(), new V3(0, 1, 0)), segs, r, radial, false);
      const m = new THREE.Mesh(g, rubberMat); m.frustumCulled = false; plant.add(m);
      return { g, segs, radial, r };
    }
    const hoseA = hose(48, 8, 0.016), hoseB = hose(24, 8, 0.016);
    const _n = new V3(), _pt = new V3();
    function setHose(H, pts) {
      const curve = new THREE.CatmullRomCurve3(pts);
      const fr = curve.computeFrenetFrames(H.segs, false);
      const p = H.g.attributes.position, n = H.g.attributes.normal;
      for (let j = 0; j <= H.segs; j++) {
        curve.getPointAt(j / H.segs, _pt);
        const N = fr.normals[j], B = fr.binormals[j];
        for (let i = 0; i <= H.radial; i++) {
          const v = (i / H.radial) * TAU, sn = Math.sin(v), cs = -Math.cos(v), k = j * (H.radial + 1) + i;
          _n.set(cs * N.x + sn * B.x, cs * N.y + sn * B.y, cs * N.z + sn * B.z).normalize();
          n.setXYZ(k, _n.x, _n.y, _n.z);
          p.setXYZ(k, _pt.x + _n.x * H.r, _pt.y + _n.y * H.r, _pt.z + _n.z * H.r);
        }
      }
      p.needsUpdate = n.needsUpdate = true;
    }

    /* ---------- proteinuria: foam bubbles on the soil ---------- */
    const NB = 14;
    const foam = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 9, 6), foamMat, NB);
    foam.frustumCulled = false; plant.add(foam);
    const bubbles = [];
    for (let c = 0; c < 5; c++) {                       // little clusters of froth
      const th = (c / 5) * TAU + 0.5 + rr(-0.3, 0.3), r = rr(0.18, 0.4), off = rr(0, 4);
      for (let i = 0; i < NB / 5 && bubbles.length < NB; i++) {
        const x = Math.cos(th) * r + rr(-0.045, 0.045), z = Math.sin(th) * r + rr(-0.045, 0.045);
        bubbles.push({ x, z, y: soilY(x, z), r: rr(0.016, 0.032), per: rr(2.4, 3.6), off: off + i * 0.35, k: 0 });
      }
    }
    while (bubbles.length < NB) { const x = rr(-0.3, 0.3), z = rr(0.15, 0.35); bubbles.push({ x, z, y: soilY(x, z), r: 0.02, per: 3, off: rr(0, 3), k: 0 }); }
    const _m4 = new THREE.Matrix4(), _q0 = new THREE.Quaternion(), _sc = new V3();

    /* ---------- motion state ---------- */
    const valveS = new Spring(260, 15, 0.5);
    const needleS = new Spring(120, 9, 168);
    let wrongT = -1, rightT = -1, wince = null, nextWince = 4, flick = null, nextFlick = 2.5;
    const headWorld = () => head.localToWorld(new V3(0, 0.08, 0.15));
    const SICK_Z = [0.05, -0.07, 0.05, 0.04, -0.03];
    const camQ = new THREE.Quaternion(), ZAX = new V3(0, 0, 1);

    return {
      centre: headWorld,
      anchor: () => head.localToWorld(new V3(0.5, 0.75, 0)),
      react(type) {
        if (type === 'wrong') { wrongT = 0; valveS.kick(-4); }
        else {
          rightT = 0;
          const m = faceG.localToWorld(new V3(0, -0.12, 0.3)), d = faceG.localToWorld(new V3(0, 0.1, 1.2)).sub(m).normalize();
          for (let i = 0; i < 8; i++) wisp.emit(m.clone(), { v: d.clone().multiplyScalar(rnd(0.4, 0.8)).add(new V3(rnd(-0.15, 0.15), rnd(0, 0.2), 0)), life: rnd(0.8, 1.2), s0: 0.1, s1: 0.32, color: '#f3ecff', drag: 1.5, a: 0.45 });
        }
      },
      burst() {
        wrongT = rightT = -1; wince = flick = null;
        valveS.kick(5); pearlS.kick(4);
        for (const b of bubbles) spark.emit(plant.localToWorld(new V3(b.x, b.y + 0.04, b.z)), { v: new V3(0, rnd(0.6, 1.2), 0), life: rnd(0.8, 1.3), s0: 0.08, s1: 0.01, color: '#ffffff', drag: 1.2 });
      },
      reset() { wrongT = rightT = -1; wince = flick = null; valveS.set(0.5); needleS.set(168); pearlS.set(0); },
      update(s) {
        const { t, dt, h, sick, heal } = s;
        const hp = clamp(s.hp, -0.1, 1.15);
        const live = !heal.on && !s.healed;

        /* colours */
        P.mix(shellMat, 'shell', h); P.mix(faceMat, 'face', h); P.mix(rig.lidMat, 'lid', h); P.mix(bagMat, 'bag', h);
        P.mix(mantleMat, 'mantle', h); P.mix(stemMat, 'stem', h); P.mix(leafMat, 'leaf', h); P.mix(leafU.uVein.value, 'vein', h);
        leafU.uSick.value = clamp(sick * 1.05, 0, 1);
        shellMat.emissive.setRGB(0.1, 0.06, 0.11).multiplyScalar(h + heal.glow * 0.8);

        /* rhythms: the pulse, the headache throb, the cuff pump */
        const beat = heartbeat(t, lerp(1.35, 0.9, h)) * M;
        const throb = heartbeat(t + 0.4, 0.72) * M * sick;
        const pf = (t * 0.5) % 1, squeeze = sstep(0, 0.1, pf) * (1 - sstep(0.22, 0.42, pf)) * sick * M;

        /* reactions and the random fits */
        let wk = 0, rk = 0, wnc = 0, flk = 0;
        if (wrongT >= 0) { wrongT += dt; wk = sstep(0, 0.06, wrongT) * (1 - sstep(0.6, 1.25, wrongT)); if (wrongT > 1.35) wrongT = -1; }
        if (rightT >= 0) { rightT += dt; rk = sstep(0, 0.2, rightT) * (1 - sstep(0.7, 1.15, rightT)); if (rightT > 1.2) rightT = -1; }
        nextWince -= dt;
        if (nextWince <= 0) { if (live && sick > 0.3 && wrongT < 0) { wince = { t: 0 }; } nextWince = rnd(6, 9.5); }
        if (wince) {
          wince.t += dt; wnc = Math.sin(Math.PI * clamp(wince.t / 0.9, 0, 1)) * sick;
          if (wince.t < dt * 1.5) {                  // a jab under the shell, on its right side
            const at = stem.bones[4].localToWorld(new V3(-0.09, 0.12, 0.06));
            for (let i = 0; i < 6; i++) spark.emit(at, { v: new V3(rnd(-0.5, 0.1), rnd(-0.2, 0.4), rnd(0, 0.4)), life: rnd(0.3, 0.5), s0: 0.08, s1: 0, color: '#ff5a48', drag: 2 });
          }
          if (wince.t > 0.9) wince = null;
        }
        nextFlick -= dt;
        if (nextFlick <= 0) { if (live && sick > 0.3) flick = { t: 0 }; nextFlick = rnd(3, 5.5); }
        if (flick) {
          flick.t += dt; flk = Math.sin(Math.PI * clamp(flick.t / 0.8, 0, 1)) * sick;
          if (!REDUCE && Math.random() < dt * 60) {
            const at = faceG.localToWorld(new V3(rnd(-0.24, 0.24), rnd(-0.02, 0.17), 0.34));
            spark.emit(at, { v: new V3(rnd(-0.05, 0.05), rnd(-0.05, 0.05), 0), life: rnd(0.12, 0.3), s0: rnd(0.07, 0.13), s1: 0, color: ['#ffffff', '#fff3a6', '#bfe9ff'][Math.floor(rnd(0, 3))], spin: rnd(-8, 8) });
          }
          if (flick.t > 0.8) flick = null;
        }
        rig.over({ lid: 0.08, low: 0.55, brow: 0.95, browY: -0.01, smile: -1, open: 0.15, w: 0.055 }, wnc);
        rig.over({ lid: 0.2, low: 0.35, brow: 0.6 }, flk * 0.8);
        rig.over({ lid: 0.25, brow: 0.6 }, throb * 0.25);

        /* the stem: swollen, slumped when sick, upright when well */
        plant.position.x = s.k.shake.x * 0.02;
        const swell = lerp(1.2, 1, clamp(h, 0, 1)) + 0.025 * Math.sin(t * 1.3) * M * sick;
        stem.bones[0].scale.set(swell, 1, swell);
        for (let i = 0; i < 5; i++) {
          const b = stem.bones[i];
          b.rotation.z = SICK_Z[i] * sick + Math.sin(t * 0.7 + i * 0.5) * 0.022 * M + (i > 2 ? wnc * 0.06 : 0);
          b.rotation.x = lerp(0.035, -0.012, hp) + Math.sin(t * 0.53 + i) * 0.012 * M + (i > 1 ? s.k.flinch.x * 0.05 : 0);
        }
        stepFollowers();

        /* the head */
        head.position.y = 0.46 + s.k.bounce.x * 0.035;
        head.rotation.set(lerp(0.04, -0.08, hp) + s.k.flinch.x * 0.14 + wnc * 0.1, s.k.spin.x * 0.12 + Math.sin(t * 0.4) * 0.06 * M, wnc * 0.16 + s.k.shake.x * 0.05);
        let open = lerp(0.5, 0.98, hp) - throb * 0.14 - wnc * 0.18 + Math.sin(t * 1.1) * 0.025 * M;
        if (s.healed) open += Math.sin(t * 1.7) * 0.05 * M;
        open = lerp(open, 0.15, wk) + rk * 0.2;
        valveS.target = open; valveS.step(dt);
        hingeU.rotation.x = -clamp(valveS.x, 0.02, 1.25);
        hingeL.rotation.x = lerp(0.06, 0.16, clamp(hp, 0, 1)) * (1 - wk) + throb * 0.02;
        const shut = 1 - clamp((valveS.x - 0.06) / 0.38, 0, 1);       // the face squashes as the shell clamps
        const puff = lerp(1.1, 0.97, clamp(h, 0, 1)) + 0.018 * Math.sin(t * 1.3) * M;
        faceG.scale.set(puff * (1 + throb * 0.03 + shut * 0.08), puff * lerp(1, 0.7, shut), puff);
        bags.scale.setScalar(Math.max(1e-4, 1 - h * 0.85));

        /* pain stars, turned to face the camera */
        head.updateMatrixWorld(true);
        camQ.copy(head.getWorldQuaternion(tmpQ).invert()).multiply(kit.camera.quaternion);
        for (const st of stars) {
          const k = sick * (0.7 + 0.55 * throb) + wk * 0.5;
          st.m.visible = k > 0.03;
          st.m.scale.setScalar(Math.max(1e-4, k * st.s));
          st.m.position.set(st.x + Math.sin(t * 0.9 + st.ph) * 0.03, st.y + Math.sin(t * 1.3 + st.ph) * 0.03, st.z);
          st.m.quaternion.copy(camQ).multiply(tmpQ2.setFromAxisAngle(ZAX, t * 0.9 + st.ph));
        }
        const pk = wrongT >= 0 ? sstep(0, 0.12, wrongT) * (1 - sstep(0.55, 0.95, wrongT)) : 0;
        popStar.visible = pk > 0.01;
        popStar.scale.setScalar(Math.max(1e-4, pk * (1.6 + 0.3 * Math.sin(wrongT * 30))));
        popStar.quaternion.copy(camQ).multiply(tmpQ2.setFromAxisAngle(ZAX, (wrongT >= 0 ? wrongT : 0) * 5));

        /* the pearl */
        pearlS.target = sstep(0.82, 1, h);
        const pb = Math.max(0, pearlS.step(dt));
        pearl.scale.setScalar(Math.max(1e-4, Math.min(pb, 1.2))); pearl.visible = pb > 0.01;
        pearlMat.emissiveIntensity = 0.3 + 0.15 * Math.sin(t * 2.2);
        if (h > 0.9 && Math.random() < dt * 1.6 * M) spark.emit(pearl.localToWorld(new V3(rnd(-0.05, 0.05), rnd(0, 0.07), 0.08)), { life: 0.6, s0: 0.1, s1: 0, color: '#fff4fb', spin: 3 });

        /* leaves: waterlogged and heavy */
        for (const L of leaves) { L.droop = sick * (0.12 + 0.05 * Math.sin(t * 0.9 + L.ph)); L.flutter = lerp(0.6, 1, h); }
        kit.leafFold = clamp(s.k.flinch.x, 0, 1) * 0.5;

        /* the cuff: squeezing in time with the bulb; loose when healed */
        const loose = clamp(h, 0, 1);
        const cr = (1 + squeeze * 0.07 + beat * 0.012 * sick) * lerp(1, 1.18, loose);
        cuffG.scale.set(cr, 1, cr);
        cuffG.position.set(0.32 + loose * 0.015, -0.3 - loose * 0.045, 0.05);
        cuffG.rotation.set(0, -0.2, loose * 0.16);

        /* the gauge: high and twitching, spiking when it hurts, normal when well */
        const bp = lerp(168, 114, h) + beat * 4 * (1 - 0.5 * h) + squeeze * 7 + wk * 28 - rk * 6;
        needleS.target = bp; needleS.step(dt);
        const jit = sick * (Math.sin(t * 31) * 0.9 + Math.sin(t * 17.3) * 0.6) * M;
        needle.rotation.z = -ang(clamp(needleS.x + jit, 55, 206));

        /* bulb and hoses */
        plant.updateMatrixWorld(true);
        const oA = plant.worldToLocal(outA.getWorldPosition(new V3())), oB = plant.worldToLocal(outB.getWorldPosition(new V3()));
        const sw = Math.sin(t * 1.1) * 0.015 * M;
        bulbG.position.set(oB.x + 0.2 + sw, oB.y - 0.26, oB.z + 0.2);
        bulbG.rotation.set(0.1, -0.35, -0.65 + sw * 3);
        bulbBody.scale.set(1 + squeeze * 0.12, 1 - squeeze * 0.22, 1 - squeeze * 0.22);
        bulbG.updateMatrixWorld(true);
        const bE = plant.worldToLocal(bulbG.localToWorld(tmpV2.copy(bulbEnd)));
        const nubP = plant.worldToLocal(nub.getWorldPosition(new V3()));
        setHose(hoseA, [oA, oA.clone().add(new V3(0.02, -0.12, 0.03)), new V3(0.62, 0.34, 0.18), new V3(1.0, 0.52, 0.08), nubP.clone().add(new V3(0, -0.18, 0)), nubP]);
        setHose(hoseB, [oB, oB.clone().add(new V3(0, -0.1, 0.03)), bE.clone().add(new V3(-0.06, 0.06, 0)), bE]);

        /* proteinuria: foam bubbles rising in the soil and popping */
        for (let i = 0; i < NB; i++) {
          const b = bubbles[i], k = ((t + b.off) / b.per) % 1;
          const amt = clamp((sick - 0.15) / 0.85, 0, 1);
          const sz = b.r * amt * sstep(0, 0.55, k) * (1 - sstep(0.88, 0.93, k)) * (1 + 0.08 * Math.sin(t * 9 + i));
          if (b.k < 0.9 && k >= 0.9 && amt > 0.2 && live) spark.emit(plant.localToWorld(new V3(b.x, b.y + b.r, b.z)), { v: new V3(0, 0.25, 0), life: 0.3, s0: 0.05, s1: 0, color: '#ffffff' });
          b.k = k;
          _m4.compose(_sc.set(b.x, b.y + sz * 0.45, b.z), _q0, tmpV.setScalar(Math.max(1e-4, sz)));
          foam.setMatrixAt(i, _m4);
        }
        foam.instanceMatrix.needsUpdate = true;
        foam.visible = sick > 0.12;
      },
    };
  },
};
