/* Sir Pyloric Bow-Tie and his egg, modelled from the client's slide
   (Hypertrophic Pyloric Stenosis): a pink stomach gentleman in a top hat,
   monocle and moustache, a waistcoat with a bow tie and a pocket watch, his
   big bow tied round the pylorus, a silver cloche on a tray and a towel over
   his arm; and the burgundy tuxedo egg with the stomach in relief, the little
   bow on its pylorus, the big bow and medallion and the ruby buttons.

   Model contract (see engine.js, eggFrom):
     shape            her egg picture: the egg's outline is read from it
     eggPaint(g,w,h)  the shell, painted all the way round (x: round the egg,
                      front in the middle; y: top to bottom)
     eggProps(kit, shell)  the parts in relief on the shell; shell.at(x, y, lift)
                      gives the point and normal on its front
     monster(kit)     { group, update(dt, t, ctx), react() }, standing on y = 0 */

const PINK = '#f47a8c';
const PINK_LT = '#ff9fb0';
const PINK_D = '#d04a66';
const BURG = '#8c1931';
const BURG_D = '#5a0d20';
const WINE = '#a51f3d';
const GOLD = '#e8b24a';
const CREAM = '#f4e2c4';
const VEST = '#3b1421';
const WHITE = '#fff8ef';
const SILVER = '#e3e4ec';
const HAT = '#2c1222';

/** The stomach, as a small emblem: a J of a tube with a round belly. */
function stomachIcon(x, cx, cy, s, fill = '#f06c86') {
  x.save();
  x.translate(cx, cy);
  x.scale(s, s);
  x.lineCap = 'round';
  x.lineJoin = 'round';
  x.strokeStyle = '#7a1430';
  const path = () => {
    x.beginPath();
    x.moveTo(-0.08, -0.95);
    x.quadraticCurveTo(-0.12, -0.42, 0.18, -0.38);
    x.quadraticCurveTo(0.78, -0.3, 0.7, 0.2);
    x.quadraticCurveTo(0.6, 0.66, 0.08, 0.62);
    x.quadraticCurveTo(-0.32, 0.56, -0.5, 0.42);
    x.quadraticCurveTo(-0.72, 0.3, -0.74, 0.62);
  };
  path();
  x.lineWidth = 0.42;
  x.stroke();
  path();
  x.lineWidth = 0.3;
  x.strokeStyle = fill;
  x.stroke();
  x.fillStyle = fill;
  x.beginPath();
  x.ellipse(0.32, 0.12, 0.42, 0.36, -0.3, 0, Math.PI * 2);
  x.fill();
  x.restore();
}
/** A gold laurel: two curved rows of leaves. */
function laurel(x, cx, cy, r) {
  x.fillStyle = GOLD;
  for (const s of [-1, 1])
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 2 + s * (0.55 + i * 0.32);
      x.save();
      x.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      x.rotate(a + (s * Math.PI) / 2);
      x.beginPath();
      x.ellipse(0, 0, r * 0.07, r * 0.16, 0, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }
}

/** A ribbon bow, one unit wide, facing +Z. Gold-edged where her bows are. */
function bow(kit, color, { gold = true } = {}) {
  const { THREE, toon } = kit;
  const g = new THREE.Group();
  const mat = toon(color);
  const dark = toon(new THREE.Color(color).multiplyScalar(0.7));
  for (const s of [-1, 1]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 18), mat);
    lobe.scale.set(0.44, 0.34, 0.16);
    lobe.position.set(s * 0.27, 0.02, 0);
    lobe.rotation.z = s * 0.18;
    if (gold) lobe.userData.inkColor = GOLD;
    g.add(lobe);
    const fold = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), dark);
    fold.scale.set(0.2, 0.18, 0.1);
    fold.position.set(s * 0.17, 0.0, 0.05);
    fold.userData.noInk = true;
    g.add(fold);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.36, 0.04), mat);
    tail.position.set(s * 0.12, -0.24, -0.02);
    tail.rotation.z = s * 0.4;
    if (gold) tail.userData.inkColor = GOLD;
    g.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), mat);
  knot.scale.z = 0.8;
  knot.position.z = 0.04;
  if (gold) knot.userData.inkColor = GOLD;
  g.add(knot);
  return g;
}

/** A round gold medallion with the stomach on it. */
function medallion(kit, r) {
  const { THREE, toon, decal } = kit;
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.16, 10, 40), toon(GOLD));
  g.add(ring);
  const face = decal(r * 2, r * 2, (x, w, h) => {
    x.fillStyle = '#7d1430';
    x.beginPath();
    x.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    x.fill();
    stomachIcon(x, w * 0.5, h * 0.52, w * 0.3);
  });
  face.position.z = 0.005;
  g.add(face);
  return g;
}

export default {
  // her egg's outline, measured from her picture (bottom to top, fractions of the widest)
  aspect: 0.8296,
  profile: (t) => {
    const P = [0.3347,0.6377,0.8019,0.8173,0.6692,0.6267,0.6732,0.7115,0.7455,0.7769,0.8057,0.8318,0.8564,0.879,0.8985,0.9162,0.9313,0.9437,0.9565,0.9671,0.9769,0.9845,0.9907,0.9933,1,1,1,1,1,1,0.9935,0.99,0.9825,0.975,0.9647,0.9545,0.9443,0.9327,0.9204,0.908,0.8929,0.8761,0.8574,0.8383,0.8286,0.8136,0.794,0.7702,0.7475,0.7262,0.705,0.6837,0.6598,0.6345,0.6064,0.5763,0.5461,0.5095,0.4718,0.4301,0.384,0.3296,0.2669,0.1862,0.0721];
    const f = Math.min(1, Math.max(0, t)) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f));
    return P[i] + (P[i + 1] - P[i]) * (f - i);
  },

  eggPaint(g, w, h) {
    const X = (deg) => w / 2 + (deg / 360) * w;
    const Y = (f) => h * (1 - f);
    g.fillStyle = BURG;
    g.fillRect(0, 0, w, h);
    // quilting
    g.strokeStyle = 'rgba(55,5,18,0.55)';
    g.lineWidth = 3;
    const step = w / 40;
    for (let i = -60; i < 100; i++) {
      g.beginPath();
      g.moveTo(i * step, 0);
      g.lineTo(i * step + h * 0.8, h);
      g.stroke();
      g.beginPath();
      g.moveTo(i * step, 0);
      g.lineTo(i * step - h * 0.8, h);
      g.stroke();
    }
    const poly = (pts, fill, stroke = GOLD, lw = 12) => {
      g.beginPath();
      pts.forEach(([d, f], i) => (i ? g.lineTo(X(d), Y(f)) : g.moveTo(X(d), Y(f))));
      g.closePath();
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = lw;
        g.lineJoin = 'round';
        g.stroke();
      }
    };
    // the dark window the stomach sits in
    poly([[-70, 0.56], [-55, 0.8], [-25, 0.98], [0, 1.02], [30, 0.98], [58, 0.8], [72, 0.56], [0, 0.52]], BURG_D);
    // cream diamonds on the flanks
    for (const s of [-1, 1]) poly([[s * 74, 0.5], [s * 92, 0.68], [s * 110, 0.5], [s * 92, 0.32]], CREAM);
    // the shirt front, with its placket, and the lapels' gold edges
    poly([[-15, 0.43], [15, 0.43], [40, 0.01], [-40, 0.01]], CREAM);
    g.fillStyle = 'rgba(200,170,130,0.35)';
    g.fillRect(X(-3.5), Y(0.42), X(3.5) - X(-3.5), Y(0.02) - Y(0.42));
    for (const s of [-1, 1]) {
      g.strokeStyle = GOLD;
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(X(s * 26), Y(0.46));
      g.lineTo(X(s * 62), Y(0.03));
      g.stroke();
      g.beginPath();
      g.moveTo(X(s * 58), Y(0.58));
      g.quadraticCurveTo(X(s * 70), Y(0.3), X(s * 66), Y(0.02));
      g.stroke();
    }
    // little gold flashes round the stomach, as in her picture
    g.fillStyle = GOLD;
    for (const [d, f, a] of [[-42, 0.82, -0.6], [-50, 0.74, -1.2], [-48, 0.62, -2.0], [-34, 0.58, 2.6], [40, 0.6, 0.9], [46, 0.66, 0.4]]) {
      g.save();
      g.translate(X(d), Y(f));
      g.rotate(a);
      g.fillRect(-5, -18, 10, 36);
      g.restore();
    }
  },

  eggProps(kit, shell) {
    const { THREE, toon, taperTube } = kit;
    const out = [];
    // the stomach, in relief: a round belly on the shell, the oesophagus coming down into it from
    // the top, the pylorus leaving it to the left and turning down
    const pinkMat = toon('#f2707f');
    const onShell = (pts, sink) => pts.map(([x, y]) => {
      const { p, n } = shell.at(x, y, 0);
      return p.addScaledVector(n, -sink);
    });
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), pinkMat);
    {
      const { p, n } = shell.at(0.17, 1.17, -0.05);
      belly.position.copy(p);
      belly.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      belly.rotateZ(-0.55);
      belly.scale.set(0.3, 0.2, 0.12);
    }
    out.push(belly);
    const gullet = new THREE.Mesh(taperTube(onShell([[0.0, 1.68], [-0.03, 1.55], [0.0, 1.42], [0.08, 1.3]], 0.03), 0.07, 0.1, { segs: 30, radial: 14 }), pinkMat);
    const pylorus = new THREE.Mesh(taperTube(onShell([[0.02, 1.03], [-0.12, 1.06], [-0.24, 1.12], [-0.36, 1.08], [-0.45, 0.94]], 0.025), 0.085, 0.07, { segs: 36, radial: 14, rAt: (t) => 0.085 - 0.04 * Math.sin(Math.PI * Math.min(1, t * 1.6)) + 0.01 * t }), pinkMat);
    out.push(gullet, pylorus);
    for (const [x, y, r] of [[0.0, 1.68, 0.07], [-0.45, 0.94, 0.07]]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), pinkMat);
      cap.position.copy(onShell([[x, y]], 0.025)[0]);
      out.push(cap);
    }
    // a little bow tied on the pylorus
    const small = bow(kit, WINE);
    {
      const { p, n } = shell.at(-0.23, 1.12, 0.06);
      small.position.copy(p);
      small.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      small.scale.setScalar(0.2);
    }
    out.push(small);
    // the big bow, nearly as wide as the egg: each loop laid on the shell's curve, a knot and the
    // medallion between them (no tails: on her egg they run on as the lapels, painted)
    const big = new THREE.Group();
    const wine = toon(WINE), wineD = toon('#7c1530');
    for (const s of [-1, 1]) {
      const loop = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), wine);
      const { p, n } = shell.at(s * 0.27, 0.73, 0.01);
      loop.position.copy(p);
      loop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      loop.rotateZ(s * 0.12);
      loop.scale.set(0.24, 0.17, 0.075);
      loop.userData.inkColor = GOLD;
      const fold = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), wineD);
      const f = shell.at(s * 0.13, 0.73, 0.05);
      fold.position.copy(f.p);
      fold.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.n);
      fold.scale.set(0.09, 0.12, 0.05);
      fold.userData.noInk = true;
      big.add(loop, fold);
    }
    {
      const { p, n } = shell.at(0, 0.73, 0.06);
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), wine);
      knot.scale.z = 0.7;
      knot.position.copy(p);
      knot.userData.inkColor = GOLD;
      const med = medallion(kit, 0.085);
      med.position.copy(p).addScaledVector(n, 0.075);
      med.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      big.add(knot, med);
    }
    out.push(big);
    // three ruby buttons down the shirt
    const ruby = toon('#9c1030'), gold = toon(GOLD);
    for (const y of [0.45, 0.3, 0.15]) {
      const { p, n } = shell.at(0, y, 0.0);
      const b = new THREE.Group();
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), ruby);
      gem.scale.z = 0.7;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 8, 24), gold);
      b.add(gem, ring);
      b.position.copy(p);
      b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      out.push(b);
    }
    return out;
  },

  monster(kit) {
    const { THREE, toon, taperTube, decal, eye, blush, Spring, V3 } = kit;
    const root = new THREE.Group();
    const g = new THREE.Group(); // everything but the feet sways a little
    root.add(g);

    // ---- the body: a stomach, leaning toward its oesophagus, waistcoat painted on ----
    const A = 0.5, B = 0.62, C = 0.425, CY = 0.95;
    const lean = (yl) => -0.12 * Math.max(0, yl / B) ** 2;
    const bodyGeo = new THREE.SphereGeometry(0.5, 72, 52);
    {
      const p = bodyGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i) * (B / 0.5), z = p.getZ(i) * (C / 0.5);
        p.setXYZ(i, x + lean(y), y + CY, z);
      }
      bodyGeo.computeVertexNormals();
    }
    const bodyTex = kit.canvasTex(2048, 1024, (x, w, h) => {
      // the sphere's own map: x round it (the front a quarter of the way), y top to bottom
      x.fillStyle = PINK;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(200,60,95,0.1)';
      x.lineWidth = 5;
      for (let i = 0; i < 26; i++) {
        x.beginPath();
        const y0 = (i / 26) * h * 0.55 + 40;
        x.moveTo(0, y0);
        for (let X = 0; X <= w; X += 40) x.lineTo(X, y0 + Math.sin(X * 0.012 + i) * 9);
        x.stroke();
      }
      const F = w * 0.25, U = (d) => F + (d / 360) * w, V = (f) => f * h;
      // the waistcoat, all round below the chest
      x.fillStyle = VEST;
      x.fillRect(0, V(0.57), w, h);
      // the shirt front in its V, the lapels either side, gold edging
      x.fillStyle = WHITE;
      x.beginPath();
      x.moveTo(U(-26), V(0.555));
      x.lineTo(U(26), V(0.555));
      x.lineTo(U(0), V(0.76));
      x.closePath();
      x.fill();
      x.fillStyle = WINE;
      for (const s of [-1, 1]) {
        x.beginPath();
        x.moveTo(U(s * 26), V(0.555));
        x.lineTo(U(s * 40), V(0.56));
        x.lineTo(U(s * 6), V(0.83));
        x.lineTo(U(0), V(0.76));
        x.closePath();
        x.fill();
      }
      x.strokeStyle = GOLD;
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(U(-80), V(0.575));
      x.lineTo(U(-40), V(0.56));
      x.lineTo(U(-6), V(0.83));
      x.moveTo(U(80), V(0.575));
      x.lineTo(U(40), V(0.56));
      x.lineTo(U(6), V(0.83));
      x.stroke();
      // the hem, and burgundy breeches below
      x.fillStyle = '#6a1428';
      x.fillRect(0, V(0.86), w, h);
      x.strokeStyle = GOLD;
      x.beginPath();
      x.moveTo(0, V(0.86));
      x.lineTo(w, V(0.86));
      x.stroke();
    });
    const body = new THREE.Mesh(bodyGeo, toon('#ffffff', { map: bodyTex }));
    g.add(body);
    /** A point on the body's front at (x, y), lifted along its normal. */
    const at = (x, y, lift = 0) => {
      const yl = y - CY, xl = x - lean(yl);
      const z = C * Math.sqrt(Math.max(1e-4, 1 - (xl / A) ** 2 - (yl / B) ** 2));
      const n = new V3(xl / (A * A), yl / (B * B), z / (C * C)).normalize();
      return { p: new V3(x, y, z).addScaledVector(n, lift), n };
    };
    const place = (o, x, y, lift = 0) => {
      const { p, n } = at(x, y, lift);
      o.position.copy(p);
      o.quaternion.setFromUnitVectors(new V3(0, 0, 1), n);
      return o;
    };
    const pinkMat = toon(PINK), goldMat = toon(GOLD), inside = toon('#7a1a2f');

    // ---- the tubes: the oesophagus up from his head, the duodenum out of his side ----
    const tube = (pts, r0, r1) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new V3(...p)));
      const m = new THREE.Mesh(taperTube(curve, r0, r1, { segs: 40, radial: 18 }), pinkMat);
      g.add(m);
      // an open end: a rim and the dark inside
      const end = curve.getPointAt(1), dir = curve.getTangentAt(1);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(r1 * 0.92, r1 * 0.22, 10, 28), toon(PINK_LT));
      rim.position.copy(end);
      rim.quaternion.setFromUnitVectors(new V3(0, 0, 1), dir);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(r1 * 0.88, 24), inside);
      hole.position.copy(end).addScaledVector(dir, -0.01);
      hole.quaternion.copy(rim.quaternion);
      hole.userData.noInk = true;
      g.add(rim, hole);
      return m;
    };
    tube([[-0.1, 1.36, 0.02], [-0.22, 1.56, 0.02], [-0.3, 1.74, 0.05], [-0.28, 1.86, 0.13]], 0.17, 0.15);
    tube([[-0.38, 0.88, 0.06], [-0.6, 0.95, 0.1], [-0.82, 0.88, 0.12], [-0.9, 0.7, 0.14]], 0.13, 0.115);

    // ---- the face ----
    const eyes = [];
    for (const s of [-1, 1]) {
      const e = eye({ r: 0.15, iris: '#e43d6c', irisDark: '#6e0b2c', lid: PINK, side: s });
      place(e.group, s * 0.205, 1.23, -0.055);
      g.add(e.group);
      eyes.push(e);
      const brow = new THREE.Mesh(
        taperTube(
          [new V3(-0.06, -0.01, 0), new V3(0, 0.012, 0), new V3(0.06, 0, 0)].map((v) => v.clone()),
          0.011,
          0.011,
          { segs: 10, radial: 6 },
        ),
        toon('#4a1424'),
      );
      place(brow, s * 0.18, 1.45, 0.01);
      g.add(brow);
    }
    // the monocle on his right eye, its chain looping down
    const mono = new THREE.Group();
    mono.add(new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.022, 10, 40), goldMat));
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.165, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, depthWrite: false }));
    glass.userData.noInk = true;
    mono.add(glass);
    place(mono, 0.205, 1.23, 0.075);
    g.add(mono);
    {
      const a = at(0.29, 1.1, 0.06).p, b = at(0.4, 0.9, 0.06).p;
      const chain = new THREE.Mesh(taperTube([a, a.clone().lerp(b, 0.5).add(new V3(0.04, -0.05, 0.04)), b, new V3(0.6, 0.98, 0.25)], 0.009, 0.009, { segs: 30, radial: 6 }), goldMat);
      chain.userData.noInk = true;
      g.add(chain);
    }
    // the moustache: two curls
    const stache = new THREE.Group();
    for (const s of [-1, 1]) {
      const pts = [[0.0, 1.075], [0.07, 1.095], [0.14, 1.075], [0.175, 1.035], [0.15, 1.01], [0.12, 1.03]].map(([x, y]) => at(s * x, y, 0.025).p);
      stache.add(new THREE.Mesh(taperTube(pts, 0.032, 0.012, { segs: 30, radial: 10 }), toon('#3a1a16')));
    }
    g.add(stache);
    const smile = new THREE.Mesh(taperTube([at(-0.04, 1.0, 0.012).p, at(0, 0.985, 0.012).p, at(0.04, 1.0, 0.012).p], 0.009, 0.009, { segs: 10, radial: 6 }), toon('#7a1a2f'));
    smile.userData.noInk = true;
    g.add(smile);
    for (const s of [-1, 1]) g.add(place(blush(0.17, 0.1), s * 0.31, 1.06, 0.012));

    // ---- the waistcoat's parts: bow tie, jabot, buttons, pocket watch ----
    // the bow tie: two pointed wings either side of a knot
    const tie = new THREE.Group();
    {
      const wing = new THREE.Shape();
      wing.moveTo(0, 0.02);
      wing.quadraticCurveTo(0.06, 0.03, 0.1, 0.06);
      wing.quadraticCurveTo(0.125, 0.0, 0.1, -0.06);
      wing.quadraticCurveTo(0.06, -0.03, 0, -0.02);
      wing.closePath();
      const geo = new THREE.ExtrudeGeometry(wing, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 2, curveSegments: 10 });
      const wm = toon(WINE);
      for (const s of [-1, 1]) {
        const w = new THREE.Mesh(geo, wm);
        w.scale.x = s;
        tie.add(w);
      }
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), toon('#8c1834'));
      k.scale.set(1, 1.2, 0.8);
      k.position.z = 0.025;
      tie.add(k);
    }
    place(tie, 0.0, 0.825, 0.0);
    g.add(tie);
    for (const y of [0.66, 0.54]) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), goldMat);
      g.add(place(b, 0.15, y, 0.01));
    }
    const watch = new THREE.Group();
    watch.add(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 28), goldMat));
    const dial = decal(0.14, 0.14, (x, w, h) => {
      x.fillStyle = '#fffaf0';
      x.beginPath();
      x.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = '#3a2414';
      x.lineWidth = 8;
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(w / 2, h / 2);
      x.lineTo(w / 2, h * 0.2);
      x.moveTo(w / 2, h / 2);
      x.lineTo(w * 0.7, h * 0.56);
      x.stroke();
      x.fillStyle = '#3a2414';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        x.fillRect(w / 2 + Math.cos(a) * w * 0.4 - 3, h / 2 + Math.sin(a) * h * 0.4 - 3, 6, 6);
      }
    });
    dial.position.z = 0.004;
    watch.add(dial);
    place(watch, -0.13, 0.56, 0.03);
    g.add(watch);
    {
      const a = at(-0.12, 0.63, 0.02).p, b = at(0.15, 0.66, 0.02).p;
      const chain = new THREE.Mesh(taperTube([a, a.clone().lerp(b, 0.5).add(new V3(0, -0.07, 0.03)), b], 0.008, 0.008, { segs: 20, radial: 6 }), goldMat);
      chain.userData.noInk = true;
      g.add(chain);
    }

    // ---- the big bow on his pylorus, with its medallion; the gold "ta-da" marks above ----
    const bigBow = bow(kit, WINE);
    bigBow.position.set(-0.56, 0.92, 0.22);
    bigBow.rotation.set(0, 0.25, 0.12);
    bigBow.scale.setScalar(0.78);
    const med = medallion(kit, 0.1);
    med.position.z = 0.1;
    bigBow.add(med);
    g.add(bigBow);
    const ticks = new THREE.Group();
    for (const [a, l] of [[2.05, 0.13], [1.6, 0.16], [1.15, 0.13]]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, l, 0.02), toon('#f6c43e'));
      t.position.set(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0);
      t.rotation.z = a - Math.PI / 2;
      ticks.add(t);
    }
    ticks.position.set(-0.6, 1.0, 0.25);
    g.add(ticks);

    // ---- the top hat, tipped ----
    const hat = new THREE.Group();
    const hatMat = toon(HAT);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.035, 48), hatMat);
    brim.scale.z = 0.86;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.245, 0.44, 40), hatMat);
    crown.position.y = 0.24;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.256, 0.252, 0.09, 40), toon(WINE));
    band.position.y = 0.07;
    band.userData.noInk = true;
    const badge = new THREE.Group();
    badge.add(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 8, 28), goldMat));
    const badgeFace = decal(0.32, 0.22, (x, w, h) => {
      laurel(x, w / 2, h * 0.52, h * 0.42);
      x.fillStyle = '#f6c84e';
      x.beginPath();
      x.arc(w / 2, h * 0.48, h * 0.23, 0, Math.PI * 2);
      x.fill();
      stomachIcon(x, w / 2, h * 0.5, h * 0.13);
    }, { round: false });
    badgeFace.position.z = 0.004;
    badge.add(badgeFace);
    badge.position.set(0, 0.23, 0.27);
    hat.add(brim, crown, band, badge);
    hat.position.set(0.27, 1.49, 0.02);
    hat.rotation.set(0.12, -0.15, -0.24);
    g.add(hat);

    // ---- his right arm, the gloved hand, the tray and cloche, the towel ----
    const arm = new THREE.Mesh(taperTube([at(0.42, 0.84, -0.05).p, new V3(0.58, 0.78, 0.2), new V3(0.66, 0.9, 0.26)], 0.075, 0.065, { segs: 20, radial: 12 }), pinkMat);
    g.add(arm);
    const hand = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), toon(WHITE));
    palm.scale.set(1, 0.85, 0.9);
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), toon(WHITE));
    thumb.position.set(-0.06, 0.04, 0.04);
    hand.add(palm, thumb);
    hand.position.set(0.68, 0.95, 0.27);
    g.add(hand);
    const tray = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.24, 0.025, 48), goldMat);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.014, 8, 48), goldMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 0.012;
    lip.userData.noInk = true;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), toon(SILVER));
    dome.position.y = 0.012;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), goldMat);
    knob.position.y = 0.23;
    const domeBadge = decal(0.2, 0.15, (x, w, h) => {
      laurel(x, w / 2, h * 0.55, h * 0.42);
      stomachIcon(x, w / 2, h * 0.52, h * 0.2);
    }, { round: false });
    domeBadge.position.set(0, 0.11, 0.168);
    domeBadge.rotation.x = -0.5;
    tray.add(plate, lip, dome, knob, domeBadge);
    tray.position.set(0.74, 1.04, 0.26);
    tray.rotation.set(0.22, -0.3, -0.05);
    g.add(tray);
    const towelTex = kit.canvasTex(128, 192, (x, w, h) => {
      x.fillStyle = WHITE;
      x.fillRect(0, 0, w, h);
      x.fillStyle = GOLD;
      x.fillRect(0, h * 0.82, w, 6);
      x.fillRect(0, h * 0.86, w, 3);
      stomachIcon(x, w * 0.62, h * 0.55, 18, '#e04a6a');
    });
    const towelGeo = new THREE.PlaneGeometry(0.22, 0.34, 6, 10);
    {
      const p = towelGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i);
        p.setZ(i, Math.sin((x / 0.22) * Math.PI * 2.2) * 0.018 + (0.17 - y) * 0.1);
      }
      towelGeo.computeVertexNormals();
    }
    const towel = new THREE.Mesh(towelGeo, toon('#ffffff', { map: towelTex, side: THREE.DoubleSide }));
    towel.position.set(0.6, 0.74, 0.33);
    towel.rotation.set(0, -0.45, 0.1);
    g.add(towel);

    // ---- the feet: sitting, soles to the front, paw pads ----
    const padTex = (x, w, h) => {
      x.fillStyle = '#ff9db0';
      x.strokeStyle = '#c84466';
      x.lineWidth = 6;
      const pad = (cx, cy, rx, ry) => {
        x.beginPath();
        x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        x.fill();
        x.stroke();
      };
      pad(w * 0.5, h * 0.62, w * 0.26, h * 0.22);
      pad(w * 0.26, h * 0.3, w * 0.09, h * 0.1);
      pad(w * 0.5, h * 0.22, w * 0.09, h * 0.1);
      pad(w * 0.74, h * 0.3, w * 0.09, h * 0.1);
    };
    for (const s of [-1, 1]) {
      const foot = new THREE.Group();
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 24), pinkMat);
      ball.scale.set(1, 1, 1.05);
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 10, 32), toon(WHITE));
      cuff.position.z = -0.14;
      const sole = decal(0.36, 0.36, padTex);
      sole.position.z = 0.262;
      foot.add(ball, cuff, sole);
      foot.position.set(s * 0.4, 0.26, 0.22);
      foot.rotation.set(-0.15, s * 0.28, 0);
      root.add(foot);
    }

    kit.ink(root);

    // ---- life ----
    const hatHop = new Spring(160, 9), twitch = new Spring(220, 8);
    let blinkT = 0, nextBlink = 1.5, happy = 0, wander = { x: 0, y: 0 }, nextLook = 0;
    const lookX = new Spring(60, 12), lookY = new Spring(60, 12);
    return {
      group: root,
      update(dt, t, ctx) {
        nextBlink -= dt;
        if (nextBlink <= 0) {
          blinkT = 1;
          nextBlink = 2 + Math.random() * 3;
        }
        blinkT = Math.max(0, blinkT - dt / 0.18);
        happy = Math.max(0, happy - dt);
        const shut = Math.max(Math.sin(Math.PI * blinkT), happy > 0 ? 0.75 : 0);
        nextLook -= dt;
        if (nextLook <= 0) {
          wander = { x: Math.random() * 1.4 - 0.7, y: Math.random() * 0.8 - 0.3 };
          nextLook = 1.2 + Math.random() * 2;
        }
        lookX.target = ctx.focused ? ctx.ndc.x * 1.2 : wander.x;
        lookY.target = ctx.focused ? ctx.ndc.y * 1.2 : wander.y;
        lookX.update(dt);
        lookY.update(dt);
        for (const e of eyes) {
          e.blink(shut);
          e.look(lookX.x, lookY.x);
        }
        // the hat sways and hops; the moustache twitches now and then; the tray bobs
        hat.position.y = 1.49 + Math.max(0, hatHop.update(dt)) * 0.12;
        hat.rotation.z = -0.24 + Math.sin(t * 1.3) * 0.03 + hatHop.x * 0.15;
        if (Math.random() < dt * 0.35) twitch.kick(6);
        stache.rotation.z = twitch.update(dt) * 0.04;
        stache.position.y = Math.abs(twitch.x) * 0.006;
        tray.position.y = 1.04 + Math.sin(t * 2.1) * 0.012;
        tray.rotation.z = -0.05 + Math.sin(t * 2.1 + 0.6) * 0.03;
        towel.rotation.z = 0.1 + Math.sin(t * 1.7) * 0.04;
        ticks.scale.setScalar(1 + Math.max(0, Math.sin(t * 4)) * 0.18);
        g.rotation.z = Math.sin(t * 1.1) * 0.02;
      },
      react() {
        hatHop.kick(5);
        twitch.kick(9);
        happy = 0.5;
      },
    };
  },
};
