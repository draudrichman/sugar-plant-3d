/* 3. Placental Abruption: The Abruptor.
   From her slide (refs/p16_0.jpg), the darkest painting of the set: a lean,
   sinewy plant-creature with a mossy olive leafy torso and spiky leaf ruffs; a
   huge ruffled crimson-purple crest like a lettuce fan, red-veined, dripping
   dark sap from its ragged edge; a narrow mauve alien face with a pointed
   chin, dark red eyes and a stern frown; long maroon arms whose clawed hands
   tear a twisted purple-blue and pink cord up out of a split green pod. The
   pod is lined with red veiny tissue, brimming with dark sap that spills over
   the rim and pools on the ground. Gnarled roots spread at the base.
   Healed (my addition, from the doc's "Recovery, The Bloom"): it lets go, the
   cord settles back into the pod, the pod closes green around a steady glow,
   the bleeding stops and the pool dries, and the crest turns rose and green
   and flowers. */

export default {
  id: 'abruptor',
  look: { ink: '#150a0c', bands: [60, 122, 192, 255], outline: 0.0056, rune: ['#d23c58', '#9fe0a8'], bg: ['#4b3b40', '#22171b', '#0a0607'] },
  frame: { halfH: 1.62, halfW: 1.36, lookY: 1.2 },
  careTitle: 'Loosen the Abruptor’s grip',
  lines: {
    sick: 'I come on suddenly. What was connected, I tear apart.',
    wrong: ['Harder, then. I tear.', 'More comes loose in my hands.', 'Too slow. The bleeding spreads.'],
    right: ['My grip... slips.', 'The pull is easing.', 'Hm. You came quickly.'],
    healed: 'I let go. Let them both be safe.',
  },
  shows: [
    '<b>A sharp, convulsive clench</b> every few seconds: sudden abdominal or back pain.',
    '<b>Dark sap dripping from the crest and spilling from the pod</b> into a growing pool: dark bleeding. The pod brims with it too, as bleeding can be concealed.',
    '<b>The pod squeezing tight, again and again</b>: a rigid, tender uterus with frequent contractions.',
    '<b>A faint light in the pod that flickers and falters</b>: fetal distress.',
    '<b>Its colours draining to grey in faint spells</b>: maternal shock in severe cases.',
    '<b>The cord torn up out of the pod</b>: the placenta separating from the uterine wall.',
  ],
  healedNote: 'Healed, it lets go: the cord settles back into the pod, the pod closes green around a steady glow, the bleeding stops and the crest blooms rose and green. (In real life nothing reattaches a placenta: care means stabilising mother and baby and delivering when needed.)',

  build(kit) {
    const { THREE, world, toon, noOutline, canvasTex, sheet, limb, taperTube, addLeaf, face, palette, Spring,
      particles, spark, wisp, randDir, rnd, rr, R, M, REDUCE, clamp, lerp, sstep, V3, TAU, UP, mergeGeometries, tex } = kit;

    const _v = new V3(), _v2 = new V3(), _d = new V3(), _b = new V3(), _e = new V3(), _w = new V3(), _t = new V3(), _x = new V3(), _z = new V3();
    const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), _c = new THREE.Color();
    const toRoot = (obj, p, out = new V3()) => world.worldToLocal(obj.localToWorld(out.copy(p)));
    const toWorld = (p) => world.localToWorld(p.clone());

    const P = palette({
      crest: ['#4a1236', '#7ea65a'], crestVein: ['#a02a4c', '#e8869e'], crestEdge: ['#3a0610', '#f2a2b8'],
      head: ['#8a626c', '#bf9a94'], body: ['#4f5c2c', '#5f9a46'], arm: ['#7a2840', '#9a5c62'],
      pod: ['#344220', '#4f9040'], podVein: ['#25290f', '#9ccc78'], rim: ['#c4a48a', '#f2e4c6'],
      bed: ['#701428', '#d2808e'], bedVein: ['#d8707e', '#f8c8cc'],
      blood: ['#4a0710', '#eaa0aa'], leaf: ['#45552a', '#58a046'], root: ['#3a2629', '#4c3a28'],
      cord: ['#b9a8bc', '#ffffff'], iris: ['#b8182c', '#6a9e3c'], white: ['#3a0c14', '#f6ece0'],
    });

    /* ---------- textures: masks drawn in code ---------- */
    function veinTree(x, px, py, ang, len, wd, depth, col, jit = 0.22) {
      let cx = px, cy = py, a = ang;
      const steps = Math.max(3, Math.round(len / 7)), kids = [];
      x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); x.moveTo(cx, cy);
      for (let i = 0; i < steps; i++) {
        a += rr(-jit, jit);
        cx += Math.cos(a) * len / steps; cy += Math.sin(a) * len / steps;
        x.lineTo(cx, cy);
        if (depth > 0 && R() < 0.32) kids.push([cx, cy, a + (R() < 0.5 ? -1 : 1) * rr(0.35, 0.8)]);
      }
      x.stroke();
      for (const [kx, ky, ka] of kids) veinTree(x, kx, ky, ka, len * rr(0.3, 0.5), Math.max(0.8, wd * 0.62), depth - 1, col, jit);
    }
    const lighter = (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, x.canvas.width, x.canvas.height); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round'; };
    // crest: red veins radiating from the root, green ragged wet edge, blue shade near the root
    const crestMask = canvasTex(512, 256, (x, w, h) => {
      lighter(x);
      let g = x.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, 'rgb(0,0,255)'); g.addColorStop(0.45, 'rgb(0,0,50)'); g.addColorStop(1, 'rgb(0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      g = x.createLinearGradient(0, 0, 0, h * 0.13);
      g.addColorStop(0, 'rgb(0,255,0)'); g.addColorStop(1, 'rgb(0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h * 0.13);
      x.fillStyle = 'rgba(0,150,0,.6)';
      for (let i = 0; i < 46; i++) { x.beginPath(); x.ellipse(R() * w, rr(0, h * 0.17), rr(3, 8), rr(5, 15), 0, 0, TAU); x.fill(); }
      for (let i = 0; i < 11; i++) veinTree(x, (i + 0.5) / 11 * w + rr(-6, 6), h + 2, -Math.PI / 2 + rr(-0.1, 0.1), h * rr(0.8, 1.0), 2.2, 3, 'rgb(255,0,0)', 0.09);
          }, { srgb: false });
    // pod outside: leaf veins running up, a cream lip at the top, mottling
    const podMask = canvasTex(512, 256, (x, w, h) => {
      lighter(x);
      const g = x.createLinearGradient(0, 0, 0, h * 0.065);
      g.addColorStop(0, 'rgb(0,255,0)'); g.addColorStop(0.6, 'rgb(0,200,0)'); g.addColorStop(1, 'rgb(0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h * 0.065);
      x.fillStyle = 'rgba(0,0,255,.16)';
      for (let i = 0; i < 80; i++) { x.beginPath(); x.ellipse(R() * w, R() * h, rr(6, 20), rr(10, 30), rr(0, 3), 0, TAU); x.fill(); }
      for (let i = 0; i < 16; i++) veinTree(x, (i + 0.5) / 16 * w, h + 2, -Math.PI / 2 + rr(-0.15, 0.15), h * rr(0.7, 0.9), 2.2, 2, 'rgb(255,0,0)');
    }, { srgb: false });
    // pod lining: the placental bed, lobes and a web of veins, a cream lip at the bottom (v = 0 is the lip)
    const bedMask = canvasTex(512, 256, (x, w, h) => {
      lighter(x);
      const g = x.createLinearGradient(0, h, 0, h * 0.88);
      g.addColorStop(0, 'rgb(0,255,0)'); g.addColorStop(0.5, 'rgb(0,200,0)'); g.addColorStop(1, 'rgb(0,0,0)');
      x.fillStyle = g; x.fillRect(0, h * 0.88, w, h * 0.12);
      for (let i = 0; i < 50; i++) {
        const cx = R() * w, cy = rr(0, 0.86) * h, r = rr(14, 30);
        const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        gg.addColorStop(0, 'rgba(0,0,255,0)'); gg.addColorStop(1, 'rgba(0,0,255,.45)');
        x.fillStyle = gg; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
      }
      for (let i = 0; i < 26; i++) veinTree(x, R() * w, rr(0, 0.84) * h, rr(0, TAU), rr(40, 90), 1.8, 2, 'rgb(255,0,0)');
    }, { srgb: false });
    // body: mossy little leaves and fibres, grey to multiply
    const bodyTex = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#d2d2d2'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 300; i++) {
        const L = rr(10, 24); x.save(); x.translate(R() * w, R() * h); x.rotate(rr(-0.6, 0.6));
        x.fillStyle = R() < 0.55 ? 'rgba(30,40,10,.24)' : 'rgba(255,255,225,.16)';
        x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(L * 0.35, -L * 0.5, 0, -L); x.quadraticCurveTo(-L * 0.35, -L * 0.5, 0, 0); x.fill();
        x.restore();
      }
      x.strokeStyle = 'rgba(30,36,10,.28)';
      for (let i = 0; i < 36; i++) { const px = R() * w; x.lineWidth = rr(0.8, 2); x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= h; y += 16) x.lineTo(px + Math.sin(y * 0.05 + i) * 4, y); x.stroke(); }
    });
    // head: a leaf-bud face, ridge and veins running up into the crest, shadowed sockets
    const headTex = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, w, h);
      const fx = w * 0.25;
      for (const s of [-1, 1]) {
        const ex = fx + s * w * 0.072, g = x.createRadialGradient(ex, h * 0.49, 2, ex, h * 0.49, w * 0.07);
        g.addColorStop(0, 'rgba(40,8,18,.55)'); g.addColorStop(1, 'rgba(40,8,18,0)');
        x.fillStyle = g; x.fillRect(0, 0, w, h);
        const c = x.createLinearGradient(ex, h * 0.56, ex + s * 12, h * 0.7);
        c.addColorStop(0, 'rgba(40,10,20,.25)'); c.addColorStop(1, 'rgba(40,10,20,0)');
        x.fillStyle = c; x.beginPath(); x.ellipse(ex + s * 6, h * 0.62, 7, 18, -s * 0.4, 0, TAU); x.fill();
      }
      x.lineCap = 'round';
      x.strokeStyle = 'rgba(60,16,30,.5)'; x.lineWidth = 2.4;
      x.beginPath(); x.moveTo(fx, h * 0.58); x.lineTo(fx, 0); x.stroke();
      x.lineWidth = 1.5;
      for (let k = 0; k < 6; k++) for (const s of [-1, 1]) {
        const y0 = h * (0.44 - k * 0.07);
        x.beginPath(); x.moveTo(fx, y0); x.quadraticCurveTo(fx + s * w * 0.04, y0 - h * 0.03, fx + s * w * (0.07 + k * 0.025), y0 - h * 0.1); x.stroke();
      }
      for (let i = 0; i < 500; i++) { x.fillStyle = R() < 0.6 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.1)'; x.fillRect(R() * w, R() * h, 2, 2); }
    });
    // sinew: long pale muscle fibres, grey to multiply
    const sinewTex = canvasTex(128, 512, (x, w, h) => {
      x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        const px = R() * w; x.lineWidth = rr(1, 3.5);
        x.strokeStyle = R() < 0.65 ? 'rgba(255,235,235,.32)' : 'rgba(50,0,10,.22)';
        x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= h; y += 24) x.lineTo(px + Math.sin(y * 0.02 + i) * 5, y); x.stroke();
      }
    });
    // glossy streaks on the sap
    const sapHi = canvasTex(128, 128, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(255,220,220,.55)'; x.lineCap = 'round';
      x.lineWidth = 5; x.beginPath(); x.arc(w * 0.42, h * 0.62, w * 0.28, 3.6, 4.6); x.stroke();
      x.lineWidth = 3; x.beginPath(); x.arc(w * 0.6, h * 0.4, w * 0.18, 0.3, 1.1); x.stroke();
      x.fillStyle = 'rgba(255,230,230,.5)';
      for (const [a, b, r] of [[0.7, 0.7, 4], [0.25, 0.3, 3], [0.78, 0.25, 2.5]]) { x.beginPath(); x.arc(a * w, b * h, r, 0, TAU); x.fill(); }
    });

    /* ---------- materials ---------- */
    const U = (vein, edge, k, shade) => ({ uVein: { value: new THREE.Color(vein) }, uEdge: { value: new THREE.Color(edge) }, uVeinK: { value: k }, uShade: { value: shade } });
    function maskMat(col, map, Un, o = {}) {
      const m = toon(col, { map, ...o });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, Un);
        sh.fragmentShader = 'uniform vec3 uVein;\nuniform vec3 uEdge;\nuniform float uVeinK;\nuniform float uShade;\n' + sh.fragmentShader.replace('#include <map_fragment>', `
          vec4 mk = texture2D( map, vMapUv );
          diffuseColor.rgb *= 1.0 - mk.b * uShade;
          diffuseColor.rgb = mix( diffuseColor.rgb, uVein, mk.r * uVeinK );
          diffuseColor.rgb = mix( diffuseColor.rgb, uEdge, mk.g );`);
      };
      return m;
    }
    const crestU = U('#a02a4c', '#3a0610', 0.7, 0.45), podU = U('#3c4222', '#d8bca2', 0.55, 0.3), bedU = U('#d8707e', '#d8bca2', 0.75, 0.45);
    const crestMat = maskMat('#6c1a3a', crestMask, crestU, { side: THREE.DoubleSide, thickness: 0.006, emissive: '#ff1830', emissiveIntensity: 0 });
    const podMat = maskMat('#6e7a44', podMask, podU, { thickness: 0.0058 });
    const bedMat = maskMat('#701428', bedMask, bedU, { thickness: 0.003, side: THREE.DoubleSide });
    const bodyMat = toon('#4f5c2c', { map: bodyTex, thickness: 0.0055 });
    const headMat = toon('#8a626c', { map: headTex, thickness: 0.0055 });
    const armMat = toon('#74263e', { map: sinewTex, thickness: 0.005 });
    const rootMat = toon('#3a2629', { map: tex.bark, thickness: 0.0045 });
    const leafMat = toon('#45552a', { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.0042 });
    const clawMat = toon('#24100f', { thickness: 0.003 });
    const bloodMat = toon('#4a0710', { thickness: 0.0042, emissive: '#2a0006', emissiveIntensity: 1 });
    const sapMat = toon('#4a0710', { thickness: 0, emissive: '#ffffff', emissiveMap: sapHi, emissiveIntensity: 0.55 });
    const poolMat = toon('#43060e', { thickness: 0.004, emissive: '#ffffff', emissiveMap: sapHi, emissiveIntensity: 0.45 });
    poolMat.emissiveMap = sapHi.clone(); poolMat.emissiveMap.offset.set(0.5, 0.5); poolMat.emissiveMap.repeat.set(1.3, 1.3); poolMat.emissiveMap.needsUpdate = true;
    const cordMat = toon('#b9a8bc', { vertexColors: true, thickness: 0.0042 });
    const flowerMat = toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide, thickness: 0.003 });
    const blood = particles(tex.dot, 260, THREE.NormalBlending);

    /* ---------- roots ---------- */
    {
      const parts = [];
      const fan = (base, n, az0, az1, l0, l1, rad, lift) => {
        for (let i = 0; i < n; i++) {
          const az = lerp(az0, az1, (i + rr(0.2, 0.8)) / n), len = rr(l0, l1), pts = [];
          for (let k = 0; k <= 7; k++) {
            const f = k / 7, r = 0.04 + f * len, wob = Math.sin(f * 6 + i * 1.7) * 0.22 * f;
            pts.push(new V3(base.x + Math.sin(az + wob) * r, lerp(lift, 0.012, Math.sqrt(f)) + Math.max(0, Math.sin(f * 11 + i)) * 0.02 * f, base.z + Math.cos(az + wob) * r));
          }
          parts.push(taperTube(pts, rad * rr(0.8, 1.15), 0.007, { segs: 28, radial: 6 }));
        }
      };
      fan(new V3(0, 0, -0.52), 11, -2.4, 2.4, 0.55, 1.05, 0.06, 0.22);
      fan(new V3(0.04, 0, 0.28), 9, -2.2, 2.2, 0.7, 1.05, 0.045, 0.1);
      const m = new THREE.Mesh(mergeGeometries(parts), rootMat); m.castShadow = true; world.add(m);
    }

    /* ---------- the pod: a split bowl, green leaf outside, placental bed inside ---------- */
    const OUT = [[0, 0], [0.16, 0.012], [0.32, 0.05], [0.46, 0.12], [0.56, 0.22], [0.615, 0.33], [0.625, 0.44], [0.6, 0.54], [0.578, 0.61], [0.566, 0.65], [0.55, 0.675]];
    const INN = [[0.55, 0.675], [0.528, 0.668], [0.512, 0.64], [0.522, 0.56], [0.528, 0.46], [0.495, 0.35], [0.42, 0.23], [0.3, 0.14], [0.15, 0.09], [0, 0.08]];
    const podRoot = new THREE.Group(); podRoot.position.set(0.04, 0.07, 0.26); podRoot.rotation.x = 0.27; podRoot.scale.set(1.28, 0.95, 1.05); world.add(podRoot);
    const podSq = new THREE.Group(); podRoot.add(podSq);
    const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 56, Math.PI);
    const podGeo = lathe(OUT), bedGeo = lathe(INN);
    const baseOf = (g) => { const p = g.attributes.position, b = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); b[i * 3] = Math.hypot(x, z); b[i * 3 + 1] = p.getY(i); b[i * 3 + 2] = Math.atan2(x, z); } return b; };
    const podBase = baseOf(podGeo), bedBase = baseOf(bedGeo);
    const podMesh = new THREE.Mesh(podGeo, podMat); podMesh.castShadow = true; podMesh.frustumCulled = false;
    const bedMesh = new THREE.Mesh(bedGeo, bedMat); bedMesh.frustumCulled = false;
    podSq.add(podMesh, bedMesh);
    const NOTCH = 0.38;
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    function podDeform(r0, y0, a, split, closing, out) {
      const w = sstep(0.4, 0.675, y0), n = Math.exp(-((wrapA(a - NOTCH) / 0.3) ** 2));
      const rag = lerp(1, 0.3, closing) * (0.03 * Math.sin(3 * a + 1) + 0.022 * Math.sin(7 * a + 0.3) + 0.012 * Math.sin(13 * a + 2)) + 0.05 * (1 - Math.cos(a)) * 0.5;
      const y = y0 + w * (rag - split * 0.25 * n + closing * 0.1);
      const r = r0 * (1 + w * (split * 0.1 * n + split * 0.03) - closing * 0.46 * w * w);
      return out.set(Math.sin(a) * r, y, Math.cos(a) * r);
    }
    function shapePod(split, closing) {
      for (const [g, b] of [[podGeo, podBase], [bedGeo, bedBase]]) {
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { podDeform(b[i * 3], b[i * 3 + 1], b[i * 3 + 2], split, closing, _v); p.setXYZ(i, _v.x, _v.y, _v.z); }
        p.needsUpdate = true; g.computeVertexNormals();
      }
    }
    const innerR = (y) => { for (let i = 1; i < INN.length; i++) { const [ra, ya] = INN[i - 1], [rb, yb] = INN[i]; if (y <= ya && y >= yb) return lerp(ra, rb, (ya - y) / (ya - yb || 1)); } return 0.5; };

    // the sap that fills the pod, its glossy surface level with the rim
    const sap = new THREE.Mesh(new THREE.CircleGeometry(1, 56).rotateX(-Math.PI / 2), sapMat); podSq.add(sap);
    const BED = new V3(0.0, 0.3, 0.06);

    // the fetal pulse: a faint glow in the pod
    const glowMat = noOutline(new THREE.SpriteMaterial({ map: tex.puff, color: '#ff9aa8', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const glow = new THREE.Sprite(glowMat); podSq.add(glow);
    const babyLight = new THREE.PointLight('#ff9a8a', 0, 1.5, 1.4); podSq.add(babyLight);

    // the spill: rivulets over the notch, down the outside, into the pool
    let spillMesh = null, spillCurve = null;
    const spillDrops = [0, 0.5].map((ph) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 9), bloodMat); m.scale.set(1, 1.3, 1); podSq.add(m); return { m, ph }; });
    const podInv = new THREE.Matrix4();
    function rivuletPts(a, split, closing, fill, toGround) {
      const pts = [];
      podDeform(innerR(fill) * 0.8, fill, a, split, closing, _v); pts.push(_v.clone().setY(fill + 0.008));
      for (let j = OUT.length - 1; j >= 3; j--) {
        const [r, y] = OUT[j];
        podDeform(r, y, a, split, closing, _v);
        const k = (Math.hypot(_v.x, _v.z) + 0.008) / Math.max(1e-3, Math.hypot(_v.x, _v.z));
        pts.push(new V3(_v.x * k, _v.y, _v.z * k));
      }
      if (toGround) {
        podInv.copy(world.matrixWorld).invert().multiply(podRoot.matrixWorld).invert();
        const last = pts[pts.length - 1].clone().applyMatrix4(_m.copy(podInv).invert());
        for (const [dx, dz] of [[0.05, 0.06], [0.12, 0.14]]) pts.push(new V3(last.x + dx, 0.018, last.z + dz).applyMatrix4(podInv));
      }
      return pts;
    }
    function buildSpill(split, closing, flow, fill) {
      if (spillMesh) { podSq.remove(spillMesh); spillMesh.geometry.dispose(); spillMesh = null; }
      if (flow < 0.03) return;
      world.updateMatrixWorld(true);
      const parts = [];
      for (const [a, keep, r0, main] of [[NOTCH, 1, 0.026, true], [NOTCH - 0.2, 0.55, 0.018, false], [NOTCH + 0.2, 0.7, 0.02, false]]) {
        let pts = rivuletPts(a, split, closing, fill, main);
        if (!main) pts = pts.slice(0, Math.max(3, Math.round(pts.length * keep)));
        if (main) spillCurve = new THREE.CatmullRomCurve3(pts);
        // engine note: taperTube's points.isCurve test never passes in r160, so it gets the point array
        parts.push(taperTube(pts, r0 * flow, r0 * 0.55 * flow, { segs: 40, radial: 7 }));
        const end = pts[pts.length - 1];
        parts.push(new THREE.SphereGeometry(r0 * 1.15 * flow, 10, 8).scale(1, main ? 0.5 : 1.3, 1).translate(end.x, end.y - (main ? 0 : 0.01), end.z));
      }
      spillMesh = new THREE.Mesh(mergeGeometries(parts.map((g) => g.toNonIndexed())), bloodMat);
      spillMesh.frustumCulled = false; podSq.add(spillMesh);
    }

    // the pool on the ground in front of the notch
    const pool = new THREE.Group(); world.add(pool);
    {
      const shp = (cx, cz, sx, sz, n, wob) => {
        const s = new THREE.Shape();
        for (let i = 0; i <= n; i++) {
          const a = i / n * TAU, r = 1 + wob * (0.18 * Math.sin(3 * a + 0.5) + 0.1 * Math.sin(5 * a + 1.3) + 0.06 * Math.sin(9 * a));
          const px = cx + Math.cos(a) * r * sx, py = cz + Math.sin(a) * r * sz;
          if (i) s.lineTo(px, py); else s.moveTo(px, py);
        }
        return s;
      };
      const ex = { depth: 0.004, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.016, bevelSegments: 2, curveSegments: 4 };
      const parts = [new THREE.ExtrudeGeometry(shp(0, 0, 0.4, 0.22, 48, 1), ex)];
      for (const [x, z, r] of [[0.5, -0.05, 0.035], [0.47, 0.13, 0.025], [-0.42, 0.12, 0.03], [0.2, 0.3, 0.028], [0.6, 0.06, 0.018]]) parts.push(new THREE.ExtrudeGeometry(shp(x, z, r, r, 14, 0.4), ex));
      const g = mergeGeometries(parts).rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, poolMat); m.position.y = 0.01; pool.add(m);
      // under the end of the main rivulet, spreading forward
      world.updateMatrixWorld(true);
      const pts = rivuletPts(NOTCH, 1, 0, 0.53, true);
      const end = pts[pts.length - 1].applyMatrix4(_m.copy(podInv).invert());
      pool.position.set(end.x + 0.08, 0, end.z + 0.0);
    }

    // big pointed leaves cupping the pod
    const PODLEAF = sheet({ width: 0.4, cup: 0.22, curl: 0.34, point: 0.85, tipPinch: 0.35, rows: 12 });
    for (const [x, z, well, sickD, size] of [
      [-0.68, 0.18, [-0.55, 1, 0.25], [-0.95, 0.5, 0.3], 0.86], [0.72, 0.06, [0.5, 1, 0.1], [0.95, 0.45, 0.1], 0.8],
      [-0.42, 0.66, [-0.5, 0.75, 0.75], [-0.55, 0.3, 0.9], 0.62], [0.42, -0.3, [0.35, 1, -0.3], [0.55, 0.7, -0.4], 0.72],
      [-0.5, -0.22, [-0.4, 1, -0.3], [-0.7, 0.7, -0.4], 0.66],
    ]) {
      const L = addLeaf(world, new V3(x, 0.05, z), new V3(...well), new V3(...sickD), size, leafMat, PODLEAF);
      L.mesh.castShadow = false;
    }

    /* ---------- the creature ---------- */
    const trunk = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.02], [0.2, 0.0], [0.19, 0.08], [0.15, 0.25], [0.125, 0.5], [0.112, 0.72], [0.1, 0.8], [0, 0.82]].map(([r, y]) => new THREE.Vector2(r, y)), 24).scale(1, 1, 0.8), bodyMat);
    trunk.position.set(0, 0, -0.52); trunk.castShadow = true; world.add(trunk);
    const upper = new THREE.Group(); upper.position.set(0, 0.76, -0.52); world.add(upper);
    const chest = new THREE.Mesh(new THREE.LatheGeometry([[0, -0.07], [0.11, -0.06], [0.113, 0.05], [0.128, 0.2], [0.158, 0.36], [0.178, 0.5], [0.184, 0.58], [0.16, 0.66], [0.1, 0.71], [0.062, 0.76], [0.052, 0.88], [0.06, 0.95], [0, 0.99]].map(([r, y]) => new THREE.Vector2(r, y)), 28).scale(1, 1, 0.72), bodyMat);
    chest.castShadow = true; upper.add(chest);

    // leafy ruffs: spiky at the shoulders, ragged at the waist
    const SPIKE = sheet({ width: 0.22, cup: 0.12, curl: 0.3, point: 1.3, tipPinch: 0.3, rows: 10 });
    for (const s of [-1, 1]) {
      for (const [at, well, sickD, size] of [
        [[s * 0.15, 0.63, -0.02], [s * 0.5, 1, -0.1], [s * 0.95, 0.55, -0.1], 0.3],
        [[s * 0.12, 0.6, -0.08], [s * 0.3, 1, -0.6], [s * 0.6, 0.7, -0.7], 0.27],
        [[s * 0.07, 0.72, 0.02], [s * 0.35, 1, 0.3], [s * 0.6, 0.9, 0.35], 0.2],
        [[s * 0.1, 0.02, 0.02], [s * 0.7, -0.35, 0.5], [s * 0.85, -0.6, 0.45], 0.28],
      ]) { const L = addLeaf(upper, new V3(...at), new V3(...well), new V3(...sickD), size, leafMat, SPIKE); L.mesh.castShadow = false; }
    }

    // head: a narrow mauve leaf-bud with a pointed chin
    const head = new THREE.Group(); head.position.set(0, 1.04, 0.07); upper.add(head);
    const HA = 0.15, HB = 0.23, HC = 0.16;
    const headGeo = new THREE.SphereGeometry(1, 40, 30).scale(HA, HB, HC);
    { const p = headGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const ny = p.getY(i) / HB, k = sstep(-0.62, -1, ny);
        p.setXYZ(i, p.getX(i) * (1 - 0.6 * k), p.getY(i) - 0.075 * k, p.getZ(i) * (1 - 0.3 * k) + 0.02 * k);
      }
      headGeo.computeVertexNormals(); }
    const headMesh = new THREE.Mesh(headGeo, headMat); headMesh.castShadow = true; head.add(headMesh);
    const fc = face(head, {
      a: HA, b: HB, c: HC, gazeScale: 0.7,
      eyes: { x: 0.064, y: 0.012, r: 0.04, iris: '#b8182c', white: '#3a0c14', lid: '#8a626c', pupil: true, shine: true },
      brows: { y: 0.07, len: 0.058, r: 0.009, color: '#2a0c14' },
      mouth: { y: -0.125, inside: '#4a0a16', lip: '#22070d' },
      sickE: { lid: 0.62, low: 0.3, brow: -0.5, browY: -0.006, smile: -0.75, open: 0, w: 0.052 },
      wellE: { lid: 0.95, low: 0.25, brow: 0.12, browY: 0.008, smile: 0.75, open: 0.12, w: 0.068 },
      wrongE: { lid: 0.92, low: 0.1, brow: -0.85, browY: -0.01, smile: -1.1, open: 0.55, w: 0.07 },
      rightE: { lid: 0.85, low: 0.35, brow: 0.3, browY: 0.012, smile: -0.1, open: 0.2, w: 0.06 },
    });
    const irisMat = fc.eyes[0].look.children[0].material, whiteMat = fc.eyes[0].look.parent.children[0].material;
    const painE = { lid: 0.3, low: 0.6, brow: 0.6, browY: -0.006, smile: -1.15, open: 0.35, w: 0.065 };
    const faintE = { lid: 0.32, low: 0.1, brow: 0.4, smile: -0.4, open: 0.12 };

    // the crest: a huge ruffled fan, built as a polar grid and rippled every frame
    const crestG = new THREE.Group(); crestG.position.set(0, 0.13, -0.06); crestG.rotation.x = -0.12; head.add(crestG);
    const CC = 64, CRr = 16, TH = 1.72;
    const crestR = new Float32Array(CC + 1);
    for (let i = 0; i <= CC; i++) {
      const th = (i / CC * 2 - 1) * TH;
      crestR[i] = 0.9 * (1 + 0.1 * Math.sin(4.2 * th + 0.6) + 0.06 * Math.sin(9 * th + 1.1) + 0.04 * Math.sin(19 * th + 0.4) + 0.025 * Math.sin(33 * th + 2))
        * (1 - 0.2 * Math.exp(-(((th - 0.05) / 0.1) ** 2))) * (1 - 0.22 * sstep(1.2, TH, Math.abs(th)));
    }
    const crestGeo = new THREE.BufferGeometry();
    {
      const n = (CC + 1) * (CRr + 1), uv = new Float32Array(n * 2), idx = [];
      for (let j = 0; j <= CRr; j++) for (let i = 0; i <= CC; i++) { const k = j * (CC + 1) + i; uv[k * 2] = i / CC; uv[k * 2 + 1] = j / CRr; }
      for (let j = 0; j < CRr; j++) for (let i = 0; i < CC; i++) { const a = j * (CC + 1) + i, b = a + 1, c = a + CC + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      crestGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      crestGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      crestGeo.setIndex(idx);
    }
    const crestMesh = new THREE.Mesh(crestGeo, crestMat); crestMesh.castShadow = true; crestMesh.frustumCulled = false; crestG.add(crestMesh);
    const cr = { droop: 1, ruff: 1, shiver: 0, t: 0 };
    function crestPoint(th, v, R0, out) {
      const r = v * R0, sx = Math.sin(th), cy = Math.cos(th), t = cr.t;
      let x = sx * r * 1.06, y = cy * r * 0.88;
      y -= cr.droop * 0.3 * v * v * sstep(0.55, 1.75, Math.abs(th));
      let z = -0.34 * x * x + 0.14 * v * v * Math.max(0, cy);
      z += cr.ruff * v * v * (0.085 * Math.sin(th * 7 + 1.3 + Math.sin(t * 1.1 + th * 2) * 0.7) + 0.035 * Math.sin(th * 17 + t * 1.8)) + 0.05 * v * Math.sin(th * 3.2 + 0.5);
      z += cr.shiver * v * Math.sin(th * 31 + t * 70) * 0.025;
      const k = 1 + 0.03 * v * v * Math.sin(th * 15 + t * 0.9) * cr.ruff;
      return out.set(x * k, y * k, z);
    }
    const crestRAt = (th) => crestR[clamp(Math.round((th / TH + 1) / 2 * CC), 0, CC)];
    function updateCrest() {
      const p = crestGeo.attributes.position;
      let k = 0;
      for (let j = 0; j <= CRr; j++) {
        const v = lerp(0.05, 1, j / CRr);
        for (let i = 0; i <= CC; i++) { crestPoint((i / CC * 2 - 1) * TH, v, crestR[i], _v); p.setXYZ(k++, _v.x, _v.y, _v.z); }
      }
      p.needsUpdate = true; crestGeo.computeVertexNormals();
    }

    // flowers that open on the healed crest
    const FLOWER = (() => {
      const parts = [], petal = sheet({ width: 0.55, cup: 0.3, curl: 0.15, point: 0.5, tipPinch: -0.2, cols: 4, rows: 5 });
      const col = (g, c) => { const cc = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) cc.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
      for (let i = 0; i < 5; i++) parts.push(col(petal.clone().rotateX(-0.35).rotateZ(i / 5 * TAU), i % 2 ? '#f3a2bd' : '#f7b6c9'));
      parts.push(col(new THREE.SphereGeometry(0.16, 10, 8).scale(1, 1, 0.6), '#ffd45c'));
      return mergeGeometries(parts.map((g) => g.toNonIndexed()));
    })();
    const flowers = [[-1.25, 0.82, 0.1], [-0.75, 0.93, 0.115], [-0.3, 0.7, 0.09], [0.32, 0.86, 0.115], [0.82, 0.92, 0.105], [1.28, 0.8, 0.095], [0.02, 0.5, 0.08], [-1.0, 0.55, 0.075], [1.02, 0.6, 0.075]].map(([th, v, size], i) => {
      const m = new THREE.Mesh(FLOWER, flowerMat); m.visible = false; crestG.add(m);
      return { m, th, v, size, rot: i * 1.3 };
    });
    const flowerS = new Spring(90, 9);

    // dripping from the crest's ragged lower edges
    const ICICLE = new THREE.LatheGeometry([[0, -0.176], [0.012, -0.172], [0.024, -0.16], [0.03, -0.14], [0.026, -0.12], [0.016, -0.09], [0.012, -0.05], [0.014, -0.01], [0, 0]].map(([r, y]) => new THREE.Vector2(r, y)), 12);
    const DROP = new THREE.SphereGeometry(0.03, 12, 9).scale(1, 1.3, 1);
    const drips = [-1.6, -1.34, -1.05, 1.1, 1.38, 1.62].map((th, i) => {
      const ic = new THREE.Mesh(ICICLE, bloodMat); world.add(ic);
      const dr = new THREE.Mesh(DROP, bloodMat); dr.visible = false; world.add(dr);
      return { th, ic, dr, t: rr(0, 1.5), period: rr(1.6, 2.6), len: 0.5, fall: null, at: new V3(), size: rr(0.8, 1.1) };
    });

    // arms: long sinewy maroon limbs, two-bone IK to the hands
    const fingerTube = (pts, r0, r1) => taperTube(pts.map((p) => new V3(...p)), r0, r1, { segs: 10, radial: 6 });
    const FIST = mergeGeometries([
      new THREE.SphereGeometry(0.05, 14, 10).scale(1.15, 1.05, 0.8).translate(0, 0.045, -0.01),
      ...[0, 1, 2, 3].map((i) => { const x = (i - 1.5) * 0.026; return fingerTube([[x, 0.07, -0.01], [x * 1.1, 0.108, 0.01], [x * 1.1, 0.115, 0.055], [x, 0.088, 0.085], [x * 0.9, 0.055, 0.075]], 0.016, 0.011); }),
      fingerTube([[0.05, 0.03, 0.0], [0.065, 0.065, 0.04], [0.035, 0.085, 0.07]], 0.016, 0.011),
    ].map((g) => g.toNonIndexed()));
    const FIST_CLAW = mergeGeometries([0, 1, 2, 3].map((i) => { const x = (i - 1.5) * 0.026 * 0.9; return new THREE.ConeGeometry(0.01, 0.045, 6).rotateX(Math.PI).translate(x, 0.035, 0.07); }).map((g) => g.toNonIndexed()));
    const OPEN = mergeGeometries([
      new THREE.SphereGeometry(0.05, 14, 10).scale(1.15, 1.1, 0.65).translate(0, 0.045, 0),
      ...[0, 1, 2, 3].map((i) => { const x = (i - 1.5) * 0.03; return fingerTube([[x, 0.075, 0], [x * 1.3, 0.13, 0.0], [x * 1.45, 0.18, -0.02], [x * 1.5, 0.21, -0.05]], 0.015, 0.01); }),
      fingerTube([[0.05, 0.03, 0.0], [0.09, 0.07, 0.0], [0.11, 0.11, -0.02]], 0.015, 0.01),
    ].map((g) => g.toNonIndexed()));
    const OPEN_CLAW = mergeGeometries([0, 1, 2, 3].map((i) => { const x = (i - 1.5) * 0.03 * 1.5; return new THREE.ConeGeometry(0.009, 0.05, 6).rotateX(-0.5).translate(x, 0.235, -0.065); }).map((g) => g.toNonIndexed()));
    const FROND = mergeGeometries([[0.6, -1], [0.2, 1], [-0.3, -0.6]].map(([y, s], i) => sheet({ width: 0.2, cup: 0.1, curl: 0.3, point: 1.3, rows: 8 }).scale(0.2 + i * 0.03, 0.2 + i * 0.03, 0.2).rotateZ(s * 1.0).rotateY(i * 2.1).translate(0, y * 0.12 + 0.12, 0)).map((g) => g.toNonIndexed()));
    const GRIP_OFF = new V3(0, 0.088, 0.035).multiplyScalar(1.3);
    const arms = [-1, 1].map((side) => {
      const A = 0.56, B = 0.56, nb = 6;
      const L = limb({ len: A + B, r0: 0.052, r1: 0.032, bones: nb, mat: armMat, gnarl: 0.09, radial: 9 });
      world.add(L.mesh);
      const hand = new THREE.Group(); hand.position.y = L.seg; hand.scale.setScalar(1.3); L.bones[nb - 1].add(hand);
      const fist = new THREE.Group(), open = new THREE.Group();
      fist.add(new THREE.Mesh(FIST, armMat), new THREE.Mesh(FIST_CLAW, clawMat));
      open.add(new THREE.Mesh(OPEN, armMat), new THREE.Mesh(OPEN_CLAW, clawMat));
      open.visible = false; hand.add(fist, open);
      for (const m of [...fist.children, ...open.children]) m.castShadow = true;
      const fr = new THREE.Mesh(FROND, leafMat); fr.position.y = 0.05; fr.rotation.y = side * 0.8; L.bones[4].add(fr);
      return {
        side, L, A, B, e: 3, hand, fist, open, shoulder: new V3(side * 0.165, 0.6, -0.01),
        pole: side < 0 ? new V3(-1, 0.75, -0.35) : new V3(1, 0.2, -0.45),
        f: new V3(0, 0, 1), qf: new THREE.Quaternion(), qd: new THREE.Quaternion(), wrist: new V3(),
      };
    });

    // the cord: three twisted strands (purple-blue, pink, plum) and torn fibres at the pod end
    const STR = [
      { r: 0.02, off: 0.022, ph: 0, col: '#5a58ae' }, { r: 0.019, off: 0.022, ph: TAU / 3, col: '#d97c98' }, { r: 0.018, off: 0.022, ph: TAU * 2 / 3, col: '#7c3f88' },
      { r: 0.006, off: 0.012, ph: 0.9, col: '#eaa4b6', fib: 1 }, { r: 0.006, off: 0.012, ph: 2.9, col: '#c06a90', fib: 1 }, { r: 0.0055, off: 0.012, ph: 4.9, col: '#eaa4b6', fib: 1 },
      { r: 0.005, off: 0.012, ph: 3.9, col: '#8a78c0', fib: 1 },
    ];
    const NS = 72, RAD = 6;
    const cordGeo = new THREE.BufferGeometry();
    const cordN = STR.length * (NS + 1) * RAD;
    {
      const col = new Float32Array(cordN * 3), idx = [];
      STR.forEach((st, s) => {
        const cc = new THREE.Color(st.col);
        for (let i = 0; i <= NS; i++) for (let k = 0; k < RAD; k++) cc.toArray(col, ((s * (NS + 1) + i) * RAD + k) * 3);
        for (let i = 0; i < NS; i++) for (let k = 0; k < RAD; k++) {
          const a = (s * (NS + 1) + i) * RAD + k, b = (s * (NS + 1) + i) * RAD + (k + 1) % RAD, c = a + RAD, d = b + RAD;
          idx.push(a, d, c, a, b, d);
        }
      });
      cordGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cordN * 3), 3));
      cordGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(cordN * 3), 3));
      cordGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      cordGeo.setIndex(idx);
    }
    const cord = new THREE.Mesh(cordGeo, cordMat); cord.frustumCulled = false; cord.castShadow = true; world.add(cord);
    const cp = Array.from({ length: 7 }, () => new V3());
    const cordCurve = new THREE.CatmullRomCurve3(cp, false, 'centripetal');
    const cPts = Array.from({ length: NS + 1 }, () => new V3()), cT = new V3(), cN = new V3(), cB = new V3();
    function sweepCord(fray) {
      for (let i = 0; i <= NS; i++) cordCurve.getPoint(i / NS, cPts[i]);
      const pos = cordGeo.attributes.position.array, nor = cordGeo.attributes.normal.array;
      cN.set(1, 0, 0);
      for (let i = 0; i <= NS; i++) {
        const u = i / NS;
        cT.subVectors(cPts[Math.min(NS, i + 1)], cPts[Math.max(0, i - 1)]).normalize();
        cN.addScaledVector(cT, -cN.dot(cT));
        if (cN.lengthSq() < 1e-6) cN.set(0, 0, 1).addScaledVector(cT, -cT.z);
        cN.normalize(); cB.crossVectors(cT, cN);
        const splay = fray * (1 - sstep(0, 0.2, u)) ** 2;
        STR.forEach((st, s) => {
          const ang = u * TAU * 13 + st.ph + (st.fib ? splay * 2 : 0);
          const off = st.off + splay * (st.fib ? 0.2 : 0.055);
          let rad = st.r * (1 - 0.7 * sstep(0.92, 1, u));
          if (st.fib) rad *= fray * (1 - sstep(0.16, 0.3, u)) * (0.6 + 0.4 * sstep(0, 0.08, u));
          const ca = Math.cos(ang), sa = Math.sin(ang);
          const cx = cPts[i].x + (cN.x * ca + cB.x * sa) * off, cy = cPts[i].y + (cN.y * ca + cB.y * sa) * off - (st.fib ? splay * 0.06 : 0), cz = cPts[i].z + (cN.z * ca + cB.z * sa) * off;
          for (let k = 0; k < RAD; k++) {
            const b = k / RAD * TAU, cb = Math.cos(b), sb = Math.sin(b);
            const nx = cN.x * cb + cB.x * sb, ny = cN.y * cb + cB.y * sb, nz = cN.z * cb + cB.z * sb;
            const o = ((s * (NS + 1) + i) * RAD + k) * 3;
            pos[o] = cx + nx * rad; pos[o + 1] = cy + ny * rad; pos[o + 2] = cz + nz * rad;
            nor[o] = nx; nor[o + 1] = ny; nor[o + 2] = nz;
          }
        });
      }
      cordGeo.attributes.position.needsUpdate = true; cordGeo.attributes.normal.needsUpdate = true;
    }

    /* ---------- poses ---------- */
    const A_SICK = new V3(-0.34, 1.28, 0.24), A_LOOSE = new V3(-0.22, 1.04, 0.32);
    const B_SICK = new V3(0.0, 0.98, 0.37), B_LOOSE = new V3(0.03, 0.84, 0.38);
    const REST = [new V3(-0.4, 0.74, 0.3), new V3(0.42, 0.74, 0.28)];
    const HEAL_CORD = [[0, 0, 0], [0, 0.2, 0.02], [0.1, 0.36, 0.07], [0.03, 0.45, 0.11], [-0.11, 0.39, 0.12], [-0.15, 0.22, 0.08], [-0.08, 0.04, 0.03]].map((p) => new V3(...p));

    /* ---------- motion state ---------- */
    const yank = new Spring(70, 9), loosen = new Spring(60, 8), flare = new Spring(55, 7), release = new Spring(40, 7.5);
    const st = {
      pool: 0.6, jolt: { t: 9, next: 1.6, amp: 0 }, contr: { t: 9, next: 2.4, amp: 0 }, faint: { t: 9, next: 5 },
      fetal: { ph: 0, rate: 2.6, dip: 0 }, podKey: [-1, -1], spillKey: -1,
    };
    const fillAt = (h) => lerp(0.53, 0.32, sstep(0.55, 1, h));
    const pallorTargets = () => [crestMat.color, crestU.uVein.value, headMat.color, fc.lidMat.color, bodyMat.color, armMat.color, leafMat.color, podMat.color];
    function drain(k) {
      if (k <= 0.001) return;
      for (const c of pallorTargets()) { const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; c.lerp(_c.setRGB(l * 0.9, l * 0.97, l * 1.08), k); }
    }
    function splash(at, n, speed = 1, up = 1.4) {
      for (let i = 0; i < n; i++) {
        const d = randDir(); d.y = Math.abs(d.y) * up + 0.3;
        blood.emit(at, { v: d.multiplyScalar(rnd(0.4, 1.1) * speed), life: rnd(0.5, 0.9), s0: rnd(0.03, 0.05), s1: 0.06, color: Math.random() < 0.7 ? '#4e0812' : '#6a0e1a', g: -6, drag: 0.6, floor: 0.014, spin: 0 });
      }
    }
    const sapCentre = () => podSq.localToWorld(new V3(0.02, fillAt(0) + 0.02, 0.05));
    let lastFill = fillAt(0);

    return {
      centre: () => toWorld(new V3(0, 1.1, 0)),
      anchor: () => head.localToWorld(new V3(0.42, 0.42, 0)),
      react(type) {
        if (type === 'wrong') {                      // it yanks the cord harder: blood splashes
          yank.kick(9); flare.kick(7);
          st.contr.t = 0; st.contr.amp = 1.15;
          st.fetal.dip = 1.6;
          st.pool = Math.min(1.3, st.pool + 0.16);
          const sc = podSq.localToWorld(new V3(0.02, lastFill + 0.02, 0.05));
          splash(sc, 46, 1.5, 2.4);
          for (let i = 0; i < 10; i++) blood.emit(sc, { v: new V3(rnd(-0.5, 0.5), rnd(1.8, 2.8), rnd(-0.2, 0.6)), life: 0.9, s0: 0.07, s1: 0.05, color: '#560a14', g: -6, floor: 0.014, spin: 0 });
          for (const d of drips) if (!d.fall && d.ic.visible) d.t = d.period;
        } else {                                     // relief: the grip loosens a little
          loosen.kick(-5);
          for (let i = 0; i < 10; i++) { const dd = randDir(); spark.emit(toWorld(new V3(0.04, 0.75, 0.4)).addScaledVector(dd, 0.2), { v: dd.multiplyScalar(0.4).setY(0.5), life: 0.9, s0: 0.08, s1: 0.02, color: '#ffd6a0', drag: 1.4 }); }
        }
      },
      burst() {
        flowerS.kick(10); release.kick(4);
        for (const d of drips) { d.fall = null; d.dr.visible = false; }
        const c = toWorld(new V3(0.04, 0.8, 0.42));
        for (let i = 0; i < 40; i++) { const dd = randDir(); dd.y = Math.abs(dd.y) + 0.2; spark.emit(c, { v: dd.multiplyScalar(rnd(0.6, 1.6)), life: rnd(0.9, 1.5), s0: 0.1, s1: 0.02, color: i % 2 ? '#b6ffd2' : '#ffe9a0', g: -0.4, drag: 1.4 }); }
        for (let i = 0; i < 10; i++) wisp.emit(c.clone().add(randDir().multiplyScalar(0.2)), { v: new V3(rnd(-0.3, 0.3), rnd(0.4, 0.9), rnd(-0.3, 0.3)), life: 1.4, s0: 0.2, s1: 0.6, color: '#e8ffe8', a: 0.35, drag: 1 });
      },
      reset() {
        st.pool = 0.6; st.jolt.t = 9; st.contr.t = 9; st.faint.t = 9;
        for (const d of drips) { d.fall = null; d.dr.visible = false; }
      },
      update(s) {
        const { t, dt, h, heal } = s;
        const hp = s.hp, sick = 1 - h, calm = heal.on || s.healed;
        cr.t = t;
        kit.leafFold = clamp(s.k.flinch.x, 0, 1) * 0.6;
        yank.step(dt); loosen.step(dt); flare.step(dt); release.step(dt);

        /* ---- timers: pain jolts, contractions, faint spells, the fetal pulse ---- */
        const J = st.jolt;
        if ((J.next -= dt) <= 0) {
          J.next = rnd(2.6, 4.4);
          if (!calm && sick > 0.12 && !REDUCE) {
            J.t = 0; J.amp = sick; s.k.shake.kick(2.2 * sick);
            splash(podSq.localToWorld(new V3(0.02, lastFill + 0.02, 0.05)), Math.round(8 * sick), 0.8);
          }
        }
        J.t += dt;
        const jolt = J.t < 1.4 ? (1 - Math.exp(-J.t * 40)) * Math.exp(-J.t * 4.2) * J.amp * M : 0;
        const C = st.contr;
        if ((C.next -= dt) <= 0) { C.next = lerp(3.4, 6.5, h) + rnd(-0.4, 0.4); if (!calm && sick > 0.2) { C.t = 0; C.amp = sick; } }
        C.t += dt;
        const cz = C.t < 1.6 ? Math.sin(Math.PI * C.t / 1.6) ** 1.5 * C.amp : 0;
        const F = st.faint;
        if ((F.next -= dt) <= 0) { F.next = rnd(7, 10); if (!calm && sick > 0.55 && !REDUCE) F.t = 0; }
        F.t += dt;
        const faint = F.t < 2.6 ? Math.sin(Math.PI * F.t / 2.6) * sstep(0.5, 0.9, sick) : 0;

        /* ---- posture ---- */
        const lp = clamp(hp, -0.1, 1.15), fl = s.k.flinch.x;
        const lean = lerp(0.3, 0.05, lp) + jolt * 0.22 + faint * 0.1 + fl * 0.08 + flare.x * 0.02;
        const br = Math.sin(t * lerp(2.1, 1.3, h)) * M;
        upper.position.set(s.k.shake.x * 0.012 + Math.sin(t * 0.5) * 0.01 * M, 0.76 + s.k.bounce.x * 0.03 - faint * 0.03, -0.52);
        upper.rotation.set(lean, Math.sin(t * 0.37) * 0.04 * M + s.k.spin.x * 0.05, Math.sin(t * 0.5) * 0.03 * M + s.k.shake.x * 0.02 + faint * Math.sin(t * 1.3) * 0.04);
        chest.scale.set(1 + br * 0.022, 1, 1 + br * 0.03);
        head.rotation.set(-lean * 0.75 + lerp(0.14, -0.04, lp) + jolt * 0.18 + faint * 0.15, Math.sin(t * 0.43) * 0.06 * M, Math.sin(t * 0.61) * 0.03 * M + jolt * Math.sin(t * 50) * 0.05);
        if (jolt > 0.02) fc.over(painE, clamp(jolt * 1.4, 0, 1));
        if (faint > 0.02) fc.over(faintE, faint * 0.8);

        /* ---- the crest: flares on a wrong card, snaps in on a jolt, perks up as it heals ---- */
        cr.droop = lerp(1, 0.15, clamp(lp, 0, 1)) + faint * 0.4;
        cr.ruff = lerp(1.1, 0.7, h) + flare.x * 0.3;
        cr.shiver = jolt * 1.2 + Math.max(0, flare.x) * 0.3;
        updateCrest();
        const fs = 1 + Math.max(0, flare.x) * 0.05 - jolt * 0.08;
        crestG.scale.set(fs * (1 + br * 0.01), fs, 1);
        crestG.rotation.set(-0.12 + jolt * 0.12, 0, Math.sin(t * 0.5 + 1) * 0.035 * M);
        crestMat.emissiveIntensity = Math.max(0, flare.x) * 0.45 + jolt * 0.15;

        /* ---- the pod: split open when sick, squeezing in contractions, closing when healed ---- */
        const split = clamp(1 - lp, 0, 1), closing = clamp(sstep(0.8, 1.05, lp), 0, 1);
        if (Math.abs(split - st.podKey[0]) > 0.004 || Math.abs(closing - st.podKey[1]) > 0.004) { shapePod(split, closing); st.podKey = [split, closing]; }
        podSq.scale.set(1 - 0.075 * cz, 1 + 0.05 * cz, 1 - 0.075 * cz);
        podSq.position.y = Math.sin(t * 1.7) * 0.004 * M;
        const fill = fillAt(h) + cz * 0.015 + Math.sin(t * 2.3) * 0.003;
        lastFill = fill;
        const fr0 = innerR(fill), fr = fr0 * (1 + sstep(0.4, 0.675, fill) * (split * 0.03 - closing * 0.46 * sstep(0.4, 0.675, fill))) + 0.012;
        sap.position.y = fill; sap.scale.set(fr, 1, fr);
        const flow = clamp(1 - h * 1.3, 0, 1);
        const spillKey = Math.round(split * 30) * 1000 + Math.round(flow * 30);
        if (spillKey !== st.spillKey) { st.spillKey = spillKey; buildSpill(split, closing, flow, fillAt(h)); }
        for (const d of spillDrops) {
          d.m.visible = !!spillMesh && flow > 0.1;
          if (d.m.visible) { const u = (t * (0.45 + cz * 0.5) + d.ph) % 1; spillCurve.getPoint(u, d.m.position); d.m.scale.setScalar(flow * (0.7 + 0.3 * Math.sin(u * Math.PI))); }
        }

        /* ---- the pool grows while it bleeds, dries as it heals ---- */
        if (h > 0.8 || s.healed) st.pool = Math.max(0, st.pool - dt * 0.5);
        else st.pool = Math.min(lerp(0.3, 1.1, sick) + 0.2, st.pool + dt * 0.03 * sick + cz * dt * 0.03);
        const ps = Math.max(1e-4, st.pool);
        pool.scale.set(ps, 1, ps); pool.visible = st.pool > 0.01;

        /* ---- hands, cord, arms ---- */
        world.updateMatrixWorld(true);
        const bed = toRoot(podSq, BED);
        const rel = clamp(1 - sstep(0.86, 1.0, h) + 0, 0, 1);
        const grip = clamp(rel - Math.max(0, release.x) * 0.2, 0, 1), let_ = 1 - grip;
        const ease = clamp(lp, 0, 1);
        const yk = Math.max(-0.3, yank.x) + jolt * 0.55;
        const gA = _v.copy(A_SICK).lerp(A_LOOSE, ease).add(_v2.set(-0.1, 0.24, -0.12).multiplyScalar(yk)).add(_t.set(0, loosen.x * 0.02, 0)).clone();
        const gB = _v.copy(B_SICK).lerp(B_LOOSE, ease).add(_v2.set(-0.05, 0.14, -0.06).multiplyScalar(yk)).add(_t.set(0, loosen.x * 0.02, 0)).clone();
        gA.x += Math.sin(t * 0.9) * 0.01 * M; gB.y += Math.sin(t * 1.3) * 0.008 * M;
        const sway = Math.sin(t * 0.8) * 0.04 * M;
        const sickCord = [
          bed, _d.copy(bed).add(_v2.set(-0.02, 0.22 + yk * 0.05, 0.04)).clone(), gB, gA,
          gA.clone().add(_v2.set(-0.13, -0.02, -0.05)), gA.clone().add(_v2.set(-0.22 + sway * 0.5, -0.19, -0.04)), gA.clone().add(_v2.set(-0.24 + sway, -0.4 + yk * 0.1, 0.0)),
        ];
        for (let i = 0; i < 7; i++) cp[i].copy(sickCord[i]).lerp(_v2.copy(bed).add(HEAL_CORD[i]), let_);
        cp[0].copy(bed);
        sweepCord(clamp(sick * 1.15 + Math.max(0, yank.x) * 0.3, 0, 1.3) * (1 - let_));

        const grips = [gA, gB];
        arms.forEach((arm, i) => {
          const S = toRoot(upper, arm.shoulder);
          const restP = _e.copy(REST[i]); restP.y += Math.sin(t * 0.9 + i) * 0.01 * M;
          // hand frame: on the cord, its fingers wrap across the cord; at rest, palm down on the pod
          const tan = i === 0 ? _t.subVectors(cp[4], cp[2]) : _t.subVectors(cp[3], cp[1]);
          const xh = _x.copy(tan.normalize()).lerp(_b.set(arm.side, 0, 0.3).normalize(), let_);
          const f = arm.f;
          xh.addScaledVector(f, -xh.dot(f)).normalize();
          _z.crossVectors(xh, f);
          _m.makeBasis(xh, f, _z); arm.qd.setFromRotationMatrix(_m);
          const target = _w.copy(grips[i]).lerp(restP, let_).sub(_d.copy(GRIP_OFF).multiplyScalar(grip).applyQuaternion(arm.qd));
          solveArm(arm, S, target);
          arm.hand.quaternion.copy(arm.qf).invert().multiply(arm.qd);
          arm.fist.visible = grip > 0.5; arm.open.visible = !arm.fist.visible;
        });

        /* ---- the crest drips ---- */
        const dripOn = sstep(0.75, 0.4, h) * (calm ? 0 : 1);
        for (const d of drips) {
          crestPoint(d.th, 0.975, crestRAt(d.th), _v); toRoot(crestG, _v, d.at);
          d.t += dt * (1 + sick * 0.6);
          const grow = clamp(d.t / d.period, 0, 1);
          const sc = dripOn * d.size;
          d.ic.visible = sc > 0.02;
          d.ic.position.copy(d.at); d.ic.scale.set(sc, sc * lerp(0.45, 1.25, grow * grow), sc);
          if (d.t >= d.period) {
            d.t = 0; d.period = rr(1.6, 2.8);
            if (sc > 0.2) { d.fall = { y: d.at.y - 0.17 * sc * 1.2, v: 0, splat: -1 }; d.dr.position.copy(d.at); d.dr.scale.setScalar(sc); }
          }
          if (d.fall) {
            const fd = d.fall; d.dr.visible = true;
            if (fd.splat < 0) {
              fd.v -= 6.5 * dt; fd.y += fd.v * dt; d.dr.position.y = fd.y;
              const inPod = ((d.at.x - 0.04) / 0.75) ** 2 + ((d.at.z - 0.4) / 0.6) ** 2 < 1, floor = inPod ? 0.62 : 0.02;
              if (fd.y <= floor) { fd.splat = 0; d.dr.position.y = floor; splash(toWorld(d.dr.position), 5, 0.45, 1); }
            } else {
              fd.splat += dt; const k = clamp(fd.splat / 0.35, 0, 1);
              d.dr.scale.set(d.size * (1 + k * 1.4), d.size * Math.max(0.05, 0.3 * (1 - k)), d.size * (1 + k * 1.4));
              if (k >= 1) { d.fall = null; d.dr.visible = false; }
            }
          }
        }

        /* ---- flowers on the healed crest ---- */
        flowerS.target = sstep(0.85, 1, h);
        const fb = Math.max(0, flowerS.step(dt));
        for (const fw of flowers) {
          fw.m.visible = fb > 0.01;
          if (!fw.m.visible) continue;
          crestPoint(fw.th, fw.v, crestRAt(fw.th), fw.m.position); fw.m.position.z += 0.015;
          fw.m.scale.setScalar(fw.size * Math.min(fb, 1.2));
          fw.m.rotation.set(0.15, Math.sin(fw.th) * -0.5, fw.rot + Math.sin(t * 0.8 + fw.rot) * 0.1 * M);
        }

        /* ---- the fetal pulse: faint, irregular, dipping when sick; steady and golden when healed ---- */
        const Fe = st.fetal;
        Fe.ph += dt * Fe.rate * (Fe.dip > 0 ? 0.45 : 1);
        if (Fe.ph >= 1) {
          Fe.ph -= 1; Fe.rate = lerp(2.7, 2.0, h) * (1 + rnd(-0.35, 0.35) * sick);
          if (!calm && sick > 0.35 && Math.random() < 0.18 * sick) Fe.dip = rnd(1, 1.8);
        }
        Fe.dip = Math.max(0, Fe.dip - dt);
        const pulse = Math.exp(-((Fe.ph / 0.08) ** 2)) + Math.exp(-(((Fe.ph - 1) / 0.08) ** 2));
        let bright = lerp(0.55, 1.15, h) * (Fe.dip > 0 ? 0.25 : 1);
        if (sick > 0.3 && Math.random() < 0.12 * sick) bright *= 0.3;
        const gy = lerp(fill + 0.03, 0.72, closing);
        glow.position.set(0.03, gy, 0.08);
        const gs = (0.32 + 0.16 * pulse) * lerp(1, 1.5, closing);
        glow.scale.set(gs / 1.28, gs / 0.95, 1);
        glowMat.opacity = clamp((0.25 + 0.75 * pulse) * bright, 0, 1) * lerp(0.75, 1, h);
        glowMat.color.set('#ff8a9c').lerp(_c.set('#ffe08a'), h);
        babyLight.position.copy(glow.position);
        babyLight.color.copy(glowMat.color);
        babyLight.intensity = (0.25 + 0.75 * pulse) * bright * 0.9;

        /* ---- colour ---- */
        P.mix(crestMat, 'crest', h); P.mix(crestU.uVein.value, 'crestVein', h); P.mix(crestU.uEdge.value, 'crestEdge', h);
        P.mix(headMat, 'head', h); P.mix(fc.lidMat, 'head', h); P.mix(bodyMat, 'body', h); P.mix(armMat, 'arm', h);
        P.mix(podMat, 'pod', h); P.mix(podU.uVein.value, 'podVein', h); P.mix(podU.uEdge.value, 'rim', h); P.mix(bedU.uEdge.value, 'rim', h);
        P.mix(bedMat, 'bed', h); P.mix(bedU.uVein.value, 'bedVein', h); P.mix(sapMat, 'blood', sstep(0.6, 1, h));
        P.mix(leafMat, 'leaf', h); P.mix(rootMat, 'root', h); P.mix(cordMat, 'cord', h);
        P.mix(irisMat, 'iris', h); P.mix(whiteMat, 'white', sstep(0.3, 1, h));
        sapMat.emissiveIntensity = lerp(0.55, 0.25, h);
        podMat.color.lerp(_c.set('#b8b07a'), cz * 0.3);                 // rigid: the pod pales as it clamps
        podMat.emissive.set('#ffd890').multiplyScalar(closing * 0.06 * (0.7 + 0.3 * pulse));
        drain(Math.max(faint * 0.7, 0.1 * sstep(0.55, 1, sick)) * (calm ? 0 : 1));
      },
    };

    function solveArm(arm, S, T) {
      const { A, B } = arm;
      _d.subVectors(T, S);
      const dist = clamp(_d.length(), Math.abs(A - B) + 0.05, (A + B) * 0.995);
      const dir = _d.normalize();
      const cosA = clamp((A * A + dist * dist - B * B) / (2 * A * dist), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
      const bend = _b.copy(arm.pole).addScaledVector(dir, -arm.pole.dot(dir)).normalize();
      const E = _e.copy(S).addScaledVector(dir, A * cosA).addScaledVector(bend, A * sinA);
      const Wr = arm.wrist.copy(S).addScaledVector(dir, dist);
      arm.L.mesh.position.copy(S);
      _q.setFromUnitVectors(UP, _t.subVectors(E, S).normalize());
      arm.L.bones[0].quaternion.copy(_q);
      arm.f.subVectors(Wr, E).normalize();
      _q2.setFromUnitVectors(UP, arm.f);
      arm.qf.copy(_q2);
      arm.L.bones[arm.e].quaternion.copy(_q).invert().multiply(_q2);
    }
  },
};
