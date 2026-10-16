/* 2. Gestational Diabetes: the Sugar Plant.
   A port of sugar-plant.html (the prototype the client approved) onto the
   shared engine, so it looks and moves the same. From her slide
   (refs/p15_0.jpg): a terracotta pot, a twisted thorny two-strand stem, a
   collar of leaves, a swollen pink fruit speckled with sugar and studded with
   sugar cubes, big glossy brown eyes with lashes, worried brows, freckled
   blush and a small mouth; a pink calyx with two big leaves and curly
   tendrils on top; two arching branches each hanging a bunch of sugar cubes.
   Healed (my addition): the sugar falls off and dissolves into the soil, the
   fruit shrinks back to "just the right size" and it flowers. */

import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** The prototype's own seeded random, so the cubes, leaves and blossoms land
    exactly where they did on the page she approved. */
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default {
  id: 'sugar-plant',
  look: { ink: '#5a3a30', bands: [118, 172, 220, 255], outline: 0.0034, rune: ['#f0a8c0', '#8fe0b4'], bg: ['#24493b', '#11291e', '#050c08'] },
  frame: { halfH: 1.82, halfW: 1.7, lookY: 1.6, camLift: 0.16 },
  careTitle: 'Keep me small',
  lines: {
    sick: 'Too much sugar makes me grow!',
    wrong: ['Too much sugar makes me grow!'],
    healed: 'Just the right size!',
  },
  shows: [
    '<b>Sugar cubes</b> crusting the fruit and weighing down the branches: extra sugar in the blood, the raised glucose a screening finds.',
    '<b>Sugar-speckled skin that glints</b>: sweet sap, which the Sugar-Sap Testing Kit measures.',
    '<b>A swollen fruit</b>, "too much sugar makes me grow": possible excessive fetal growth, a big baby.',
    '<b>Heavy sighs and droopy lids</b>: fatigue.',
    '<b>Leaves still perky</b>: often there are no symptoms at all, so it has to be looked for.',
    '<b>Puffing up</b> at the wrong care: the curse feeds on it.',
  ],
  healedNote: 'Healed, the sugar falls away and dissolves into the soil, the fruit shrinks back to just the right size, and it flowers.',

  build(kit) {
    const { THREE, world, scene, toon, noOutline, canvasTex, sheet, limb, tendrilGeo, addLeaf, face, palette, Spring,
      spark, randDir, rnd, M, REDUCE, clamp, lerp, sstep, backOut, V3, TAU, DEG, UP, lights, blob, rune, runeMat, tex, mergeGeometries } = kit;
    const R = rng(20261013);
    const rr = (a, b) => a + (b - a) * R();

    /* ---------- her light: warm pink bounce from below, rosy shadows ---------- */
    lights.hemi.color.set('#fff4ea'); lights.hemi.groundColor.set('#7a4a52'); lights.hemi.intensity = 1.25;
    lights.key.color.set('#fff3e2');
    lights.fill.color.set('#ffd9e4'); lights.fill.intensity = 0.55;
    lights.heal.color.set('#ffd6e4');
    blob.scale.setScalar(2.1 / 2.4); rune.scale.setScalar(2.9 / 3.1);

    /* ---------- painted textures (the prototype's, same seed, same order) ---------- */
    /* The fruit's skin is a mask, not a colour: red = white sugar speckle, green =
       darker freckles. The shader mixes them over the skin colour, so the speckle
       thins out as the sugar leaves without repainting anything. */
    const skinMask = canvasTex(1024, 512, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 5200; i++) {
        const v = R(), y = (1 - v) * h;
        if (R() > 0.35 + 0.65 * v) continue;                 // denser toward the crown
        x.fillStyle = `rgb(${Math.round(rr(150, 255))},0,0)`;
        x.beginPath(); x.arc(R() * w, y, rr(0.8, 3.0), 0, TAU); x.fill();
      }
      for (let i = 0; i < 520; i++) {
        x.fillStyle = 'rgb(0,255,0)';
        x.beginPath(); x.arc(R() * w, R() * h, rr(0.8, 2), 0, TAU); x.fill();
      }
    }, { srgb: false });
    const potTex = canvasTex(512, 256, (x, w, h) => {
      x.fillStyle = '#ececec'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        x.fillStyle = R() < 0.55 ? 'rgba(110,60,40,.09)' : 'rgba(255,255,255,.14)';
        x.beginPath(); x.arc(R() * w, R() * h, rr(0.6, 2.2), 0, TAU); x.fill();
      }
      x.fillStyle = 'rgba(70,30,20,.16)'; x.fillRect(0, h * 0.245, w, h * 0.035);
      x.fillStyle = 'rgba(255,255,255,.16)'; x.fillRect(0, h * 0.05, w, h * 0.05);
    });
    const soilTex = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#d0d0d0'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) {
        x.fillStyle = R() < 0.6 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.2)';
        x.beginPath(); x.arc(R() * w, R() * h, rr(0.8, 3.2), 0, TAU); x.fill();
      }
    });
    /* Her blush: a soft pink cloud with a few darker freckles in it. */
    const blushTex = canvasTex(128, 96, (x, w, h) => {
      const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.48);
      g.addColorStop(0, 'rgba(240,120,130,.55)'); g.addColorStop(0.6, 'rgba(240,120,130,.25)'); g.addColorStop(1, 'rgba(240,120,130,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(200,80,90,.75)';
      for (const [fx, fy] of [[0.32, 0.44], [0.46, 0.36], [0.6, 0.46], [0.42, 0.58], [0.56, 0.62], [0.7, 0.55]]) { x.beginPath(); x.arc(fx * w, fy * h, 3, 0, TAU); x.fill(); }
    });

    /* ---------- palette from her painting: [cursed, healed] ---------- */
    const PAL = {
      skin: ['#ee93a3', '#f6bcae'],   // hot sugary pink, easing to a soft peach-pink
      leaf: ['#7f9a5e', '#4f9a49'],
      leaf2: ['#8ea86c', '#64ae56'],
      stem: ['#73905a', '#4f8a3f'],
    };
    const P = palette(PAL);

    const skinMat = toon(PAL.skin[0], { map: skinMask, thickness: 0.004 });
    const skinU = { uSugar: { value: 1 } };
    skinMat.onBeforeCompile = (sh) => {
      sh.uniforms.uSugar = skinU.uSugar;
      sh.fragmentShader = 'uniform float uSugar;\n' + sh.fragmentShader.replace('#include <map_fragment>', `
        vec4 sm = texture2D( map, vMapUv );
        diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 1.0, 0.96, 0.95 ), sm.r * ( 0.15 + 0.7 * uSugar ) );
        diffuseColor.rgb *= 1.0 - sm.g * 0.2;`);
    };
    const stemMat = toon(PAL.stem[0], { thickness: 0.0036 });
    const leafMat = toon(PAL.leaf[0], { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.003 });
    const leafMat2 = toon(PAL.leaf2[0], { map: tex.leaf, side: THREE.DoubleSide, thickness: 0.003 });
    const calyxMat = toon('#ec8ea0', { side: THREE.DoubleSide, thickness: 0.0026 });
    // cubes and thorns are drawn instanced (see `instanced` below), so they carry their own ink
    const thornMat = toon('#eaa0a8', { thickness: 0 });
    const cubeMat = toon('#fff4f2', { thickness: 0, emissive: '#ffd9df', emissiveIntensity: 0.12 });
    const cubeMatPink = toon('#ffe3e6', { thickness: 0, emissive: '#ffc9d2', emissiveIntensity: 0.12 });
    const potMat = toon('#c4875a', { map: potTex, thickness: 0.0042 });
    const soilMat = toon('#3f2b20', { map: soilTex, thickness: 0.0025 });
    const petalMat = toon('#f7a6ba', { side: THREE.DoubleSide, thickness: 0.0022 });
    const petalMat2 = toon('#fff1f5', { side: THREE.DoubleSide, thickness: 0.0022 });
    const coreMat = toon('#ffd451', { thickness: 0.0018 });

    const LEAF = sheet({ width: 0.42, cup: 0.14, curl: 0.18, point: 0.7 });       // her broad, pointed leaves
    const SEPAL = sheet({ width: 0.3, cup: 0.25, curl: 0.25, tipPinch: 0.55 });
    const CALYX = sheet({ width: 0.34, cup: 0.2, curl: 0.3, tipPinch: 0.7, cols: 4, rows: 6 });
    const PETAL = sheet({ width: 0.55, cup: 0.25, curl: -0.12, tipPinch: -0.2, cols: 4, rows: 6, point: 0.6 });
    const CUBE = new RoundedBoxGeometry(1, 1, 1, 2, 0.16);

    /** Many small parts in one draw: each part is an empty Object3D (a proxy)
        placed in the scene graph like a mesh would be, and every frame its world
        matrix is copied into an InstancedMesh. The engine's OutlineEffect does not
        apply instance matrices when it inflates the outline, so these draw their
        own ink: a back-faced hull pushed out by the same screen-space formula. */
    const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
    function instanced(geo, mat, thick, proxies, castShadow = false) {
      const mesh = new THREE.InstancedMesh(geo, mat, proxies.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false; mesh.castShadow = castShadow;
      const hullMat = noOutline(new THREE.MeshBasicMaterial({ color: kit.look.ink, side: THREE.BackSide }));
      const uThick = { value: thick };
      hullMat.onBeforeCompile = (sh) => {
        sh.uniforms.uThick = uThick;
        sh.vertexShader = 'uniform float uThick;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
          vec4 inner = vec4( transformed - normal, 1.0 );
          #ifdef USE_INSTANCING
            inner = instanceMatrix * inner;
          #endif
          vec4 pos2 = projectionMatrix * modelViewMatrix * inner;
          gl_Position += normalize( gl_Position - pos2 ) * uThick * gl_Position.w;`);
      };
      const hull = new THREE.InstancedMesh(geo, hullMat, proxies.length);
      hull.instanceMatrix = mesh.instanceMatrix; hull.frustumCulled = false;
      scene.add(mesh, hull);
      return {
        sync() {
          let any = false;
          proxies.forEach((p, i) => { mesh.setMatrixAt(i, p.visible ? p.matrixWorld : ZERO); any ||= p.visible; });
          mesh.instanceMatrix.needsUpdate = true;
          mesh.visible = hull.visible = any;
        },
      };
    }

    /** An engine leaf, with the prototype's flutter values from its own seed. */
    function leaf(parent, at, dirWell, dirSick, size, mat = leafMat, geo = LEAF) {
      const L = addLeaf(parent, at, dirWell, dirSick, size, mat, geo);
      L.mesh.castShadow = false;
      L.roll = rr(-0.5, 0.5); L.ph = rr(0, TAU); L.f = rr(1.3, 2.2);
      return L;
    }

    /* ---------- the pot and soil ---------- */
    const POT_H = 0.76, SOIL_Y = 0.665, POT_R = 0.6;
    const potProfile = [
      [0.0, 0.0], [0.46, 0.0], [0.5, 0.03], [0.53, 0.18], [0.56, 0.33], [0.585, 0.45], [0.6, 0.52],
      [0.63, 0.55], [0.71, 0.56], [0.74, 0.6], [0.745, 0.69], [0.71, 0.74], [0.64, 0.745], [0.615, 0.71], [0.6, 0.665],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const potGeo = new THREE.LatheGeometry(potProfile, 44);
    { const p = potGeo.attributes.position, uv = potGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setY(i, p.getY(i) / POT_H); }
    const pot = new THREE.Mesh(potGeo, potMat); pot.castShadow = true; world.add(pot);
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.605, 40), soilMat);
    soil.rotation.x = -Math.PI / 2; soil.position.y = SOIL_Y; world.add(soil);

    const plant = new THREE.Group(); plant.position.y = SOIL_Y; world.add(plant);

    /* ---------- a twisted, thorny stem: two strands wound together ---------- */
    const trunk = limb({ len: 0.82, r0: 0.07, r1: 0.055, bones: 4, mat: stemMat, strands: 2, twist: 1.3, spread: 0.045 });
    plant.add(trunk.mesh);
    const THORN = new THREE.ConeGeometry(0.014, 0.05, 6);
    const thorns = [];
    const thornAt = () => { const t = new THREE.Object3D(); thorns.push(t); return t; };
    function thorn(parent, y, az, tilt = 0.9) {
      const t = thornAt();
      const out = new V3(Math.sin(az), 0, Math.cos(az));
      t.position.copy(out).multiplyScalar(0.06).setY(y);
      t.quaternion.setFromUnitVectors(UP, out.clone().multiplyScalar(Math.sin(tilt)).add(new V3(0, Math.cos(tilt), 0)).normalize());
      parent.add(t);
    }
    for (let i = 0; i < 4; i++) { thorn(trunk.bones[i], trunk.seg * 0.5, i * 2.1 + 0.4); if (i % 2) thorn(trunk.bones[i], trunk.seg * 0.2, i * 2.1 + 2.6); }

    /* ---------- the neck: a collar of leaves, the fruit on top ---------- */
    const neck = new THREE.Group(); neck.position.y = trunk.seg; trunk.bones[3].add(neck);
    for (let i = 0; i < 8; i++) {
      const az = (i / 8) * TAU + 0.2, out = new V3(Math.sin(az), 0, Math.cos(az));
      leaf(neck, out.clone().multiplyScalar(0.12).setY(0.02),
        out.clone().multiplyScalar(0.8).add(new V3(0, 0.75, 0)), out.clone().multiplyScalar(1).add(new V3(0, 0.15, 0)),
        rr(0.34, 0.42), i % 2 ? leafMat : leafMat2, SEPAL);
    }

    const HA = 0.64, HB = 0.6, HC = 0.6;            // the fruit's three radii, at its biggest
    const swell = new THREE.Group(); neck.add(swell); // scaled from the bottom: it grows up out of its collar
    const head = new THREE.Group(); head.position.y = HB * 0.9; swell.add(head);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 44), skinMat);
    headMesh.scale.set(HA, HB, HC); headMesh.castShadow = true; head.add(headMesh);
    const surfN = (x, y, z) => new V3(x / (HA * HA), y / (HB * HB), z / (HC * HC)).normalize();
    function onHead(y, az, inset = 0) {
      const rh = Math.sqrt(Math.max(0, 1 - (y / HB) ** 2));
      const v = new V3(HA * rh * Math.sin(az), y, HC * rh * Math.cos(az));
      const n = surfN(v.x, v.y, v.z);
      return { p: v.addScaledVector(n, -inset), n };
    }

    /* ---------- face: big glossy brown eyes, lashes, worried brows ---------- */
    const before = new Set(head.children);
    const fc = face(head, {
      a: HA, b: HB, c: HC,
      eyes: { x: 0.21, y: -0.02, r: 0.13, iris: '#3b2016', lid: PAL.skin[0], lashes: true },
      brows: { y: 0.19, len: 0.11, r: 0.011, color: '#5a3a2e' },
      mouth: { y: -0.21, inside: '#8a3a46', lip: '#5a3030' },
      blush: { x: 0.36, y: -0.17, w: 0.2, h: 0.14, freckles: true },
    });
    // her blush has darker freckles than the engine's, and her lashes are darker than the ink
    for (const o of head.children) {
      if (before.has(o) || !o.isMesh || !o.material.map || o.material.map === blushTex) continue;
      o.material.map.dispose(); o.material.map = blushTex; o.material.needsUpdate = true;
    }
    for (const e of fc.eyes) for (const l of e.upper.children) l.material.color.set('#3a221c');

    /* ---------- the top: pink calyx, sprout, two broad leaves, tendrils ---------- */
    const top = new THREE.Group(); top.position.y = HB * 0.95; head.add(top);   // counter-scaled so it stays lush as the fruit shrinks
    top.add(new THREE.Mesh(mergeGeometries(Array.from({ length: 6 }, (_, i) => {   // six sepals, one draw
      const az = (i / 6) * TAU, out = new V3(Math.sin(az), 0, Math.cos(az));
      const q = new THREE.Quaternion().setFromUnitVectors(UP, out.clone().multiplyScalar(0.95).add(new V3(0, 0.3, 0)).normalize());
      return CALYX.clone().scale(0.17, 0.17, 0.17).applyQuaternion(q);
    })), calyxMat));
    const sprout = limb({ len: 0.22, r0: 0.035, r1: 0.026, bones: 2, mat: stemMat });
    sprout.mesh.castShadow = false;
    top.add(sprout.mesh);
    const sproutTip = new V3(0, sprout.seg, 0);
    // two big leaves splayed left and right, one behind: perky even while cursed, as she painted it
    leaf(sprout.bones[1], sproutTip, new V3(-1, 0.7, 0.2), new V3(-1, 0.35, 0.25), 0.66);
    leaf(sprout.bones[1], sproutTip, new V3(1, 0.8, -0.05), new V3(1, 0.4, -0.1), 0.7, leafMat2);
    leaf(sprout.bones[1], sproutTip, new V3(0.1, 1, -0.6), new V3(0.15, 0.6, -1), 0.46);
    const tendril = (o) => new THREE.Mesh(tendrilGeo(o), stemMat);
    const tendrils = [];
    for (const [x, dir, rise, r0, rot] of [[-0.03, -1, 0.3, 0.08, -0.1], [0.03, 1, 0.12, 0.065, 0.25]]) {
      const piv = new THREE.Group(); piv.position.set(x, 0.02, 0.02); piv.rotation.z = rot; piv.add(tendril({ rise, r0, dir }));
      top.add(piv); tendrils.push(piv);
    }
    const crownFlower = new THREE.Group();          // opens only once it is healed
    crownFlower.position.copy(sproutTip).setY(sprout.seg + 0.03);
    sprout.bones[1].add(crownFlower);
    function flower(parent, size, mat = petalMat, n = 6) {
      const f = new THREE.Group();
      f.add(new THREE.Mesh(mergeGeometries(Array.from({ length: n }, (_, i) =>   // all petals, one draw
        PETAL.clone().scale(size, size, size).rotateX(Math.PI / 2 - 0.55).rotateY((i / n) * TAU))), mat));
      const core = new THREE.Mesh(new THREE.SphereGeometry(size * 0.2, 12, 8), coreMat); core.position.y = size * 0.08; f.add(core);
      f.scale.setScalar(1e-4); parent.add(f); return f;
    }
    const blossoms = [{ f: flower(crownFlower, 0.2), s: new Spring(150, 9), at: 0.9 }];

    /* ---------- sugar cubes ---------- */
    /** Every cube knows its home and the health at which it falls off, so the
        sugar comes away a little with each correct card and grows back if the
        health slider is dragged down. */
    const cubes = [];
    function addCube(parent, pos, quat, size, thr, pink = false) {
      const m = new THREE.Object3D();             // a proxy: drawn by the cube instancer
      m.position.copy(pos); m.quaternion.copy(quat); m.scale.setScalar(size);
      parent.add(m);
      cubes.push({ m, pink, home: parent, pos: pos.clone(), quat: quat.clone(), size, thr, state: 'on', grow: 1, v: new V3(), w: new V3(), t: 0 });
    }
    { // studded over the fruit, clear of the face
      let placed = 0, tries = 0;
      while (placed < 30 && tries++ < 400) {
        const az = rr(0, TAU), y = rr(-0.42, 0.5);
        const { p, n } = onHead(y, az, 0.012);
        if (p.z > 0.1 && Math.abs(p.x) < 0.5 && p.y > -0.42 && p.y < 0.3) continue;
        if (cubes.some((c) => c.pos.distanceTo(p) < 0.12)) continue;
        const q = new THREE.Quaternion().setFromUnitVectors(UP, n).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(-0.3, 0.3), rr(0, TAU), rr(-0.3, 0.3))));
        addCube(head, p, q, rr(0.075, 0.105), rr(0.08, 0.9));
        placed++;
      }
    }

    /* ---------- two arching branches, each hanging a bunch of sugar ---------- */
    const branches = [], clusters = [];
    function addCluster(bone, at, side) {
      const c = new THREE.Group(); c.position.copy(at); bone.add(c);
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.013, 0.14, 6), stemMat);
      stalk.position.y = -0.07; c.add(stalk);
      const s = 0.088;
      const grid = [[-0.55, 0, 0.3], [0.55, 0, 0.2], [0, 0, -0.55], [-0.3, -1, 0.1], [0.45, -1, -0.15], [0.05, -2, 0.05], [-0.6, -1.1, -0.6]];
      grid.forEach(([x, y, z], i) => {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(-0.4, 0.4), rr(0, TAU), rr(-0.4, 0.4)));
        addCube(c, new V3(x * s * 1.1, -0.18 + y * s * 1.02, z * s * 1.1), q, s * rr(0.92, 1.08), 0.15 + i * 0.1, true);
      });
      // what grows there instead, once the sugar is gone
      for (const [x, y, z, sz, mat] of [[0.04, -0.17, 0.05, 0.1, petalMat], [-0.07, -0.12, -0.04, 0.08, petalMat2], [0.06, -0.08, -0.06, 0.07, petalMat]]) {
        const holder = new THREE.Group(); holder.position.set(x, y, z); holder.rotation.set(rr(-0.5, 0.5), 0, side * 0.6); c.add(holder);
        blossoms.push({ f: flower(holder, sz, mat, 5), s: new Spring(rr(110, 200), rr(7, 10)), at: rr(0.86, 0.95) });
      }
      const rec = { c, bone, swing: new Spring(18, 3), sw: rr(0, TAU) };
      clusters.push(rec);
      return rec;
    }
    for (const side of [-1, 1]) {
      const L = limb({ len: 1.18, r0: 0.048, r1: 0.022, bones: 5, mat: stemMat });
      L.mesh.position.set(0, trunk.seg * 0.55, 0);
      L.bones[0].rotation.order = 'YXZ';
      trunk.bones[2].add(L.mesh);
      for (let i = 1; i < 4; i++) {
        const t = thornAt(); t.scale.setScalar(0.75);
        t.position.set(0, L.seg * 0.5, -0.03); t.rotation.x = -1.1; L.bones[i].add(t);
      }
      // a big leaf standing up off the top of the arch, a smaller one below it
      leaf(L.bones[2], new V3(0, L.seg * 0.4, -0.02), new V3(side * 0.15, 0.35, -1), new V3(side * 0.3, 0.2, -0.3), 0.5, side > 0 ? leafMat : leafMat2);
      leaf(L.bones[1], new V3(0, L.seg * 0.6, 0), new V3(side * 0.9, 0.4, -0.2), new V3(side * 0.6, 0.1, 0.7), 0.3);
      const tip = tendril({ rise: 0.05, r0: 0.05, dir: side, thick: 0.009 });
      tip.position.set(0, L.seg, 0); tip.rotation.y = Math.PI / 2; L.bones[4].add(tip);
      const s = new Spring(rr(36, 48), rr(6.5, 8)), ph = rr(0, TAU);
      branches.push({ side, L, s, ph, cluster: addCluster(L.bones[4], new V3(0, L.seg * 0.85, 0), side) });
    }

    const drawn = [
      instanced(CUBE, cubeMat, 0.0026, cubes.filter((c) => !c.pink).map((c) => c.m), true),
      instanced(CUBE, cubeMatPink, 0.0026, cubes.filter((c) => c.pink).map((c) => c.m), true),
      instanced(THORN, thornMat, 0.0016, thorns),
    ];

    /* ---------- motion ---------- */
    const puff = new Spring(120, 7);        // wrong care: it swells up
    const pop = new Spring(240, 11);        // the heal: holds its breath, then squashes as the sugar flies off
    let sigh = null, nextSigh = 5, burstBoost = 1;
    const SIGH_E = { lid: 0.25, low: 0.1, brow: 0.6, browY: 0.01, smile: -0.7, open: 0.25, w: 0.08 };
    const SQUEEZE_E = { lid: 0.05 };
    const tmpQ = new THREE.Quaternion(), hangQ = new THREE.Quaternion(), hangE = new THREE.Euler();
    const worldPos = (o) => o.getWorldPosition(new V3());
    const headCentre = () => headMesh.getWorldPosition(new V3());

    /* the sugar cubes: on the plant, falling, or gone */
    function detach(c) {
      world.attach(c.m);                          // keeps where it is in the world
      const from = world.worldToLocal(headCentre());
      const out = c.m.position.clone().sub(from).setY(0).normalize();
      c.v.copy(out).multiplyScalar(rnd(0.5, 1.2) * burstBoost).add(new V3(0, rnd(0.6, 1.4) * Math.sqrt(burstBoost), 0));
      c.w.set(rnd(-8, 8), rnd(-8, 8), rnd(-8, 8));
      c.state = 'fall'; c.t = 0;
      spark.emit(worldPos(c.m), { life: 0.5, s0: 0.16, s1: 0, color: '#fff0f4', spin: rnd(-3, 3) });
    }
    function reattach(c) {
      c.home.add(c.m);
      c.m.position.copy(c.pos); c.m.quaternion.copy(c.quat);
      c.m.visible = true; c.state = 'on'; c.grow = 0;
    }
    function stepCubes(dt, hTarget) {
      for (const c of cubes) {
        const keep = hTarget < c.thr;
        if (keep && c.state !== 'on') reattach(c);
        else if (!keep && c.state === 'on') detach(c);
        if (c.state === 'on') {
          if (c.grow < 1) c.grow = Math.min(1, c.grow + dt * 3.5);
          c.m.scale.setScalar(c.size * Math.max(1e-4, backOut(c.grow)));
        } else if (c.state === 'fall') {
          c.t += dt;
          c.v.y -= 6.5 * dt;
          c.m.position.addScaledVector(c.v, dt);
          c.m.rotation.x += c.w.x * dt; c.m.rotation.y += c.w.y * dt; c.m.rotation.z += c.w.z * dt;
          const r = Math.hypot(c.m.position.x, c.m.position.z);
          const floor = (r < POT_R ? SOIL_Y : 0) + c.size * 0.5;
          if (c.m.position.y < floor) {                    // land, bounce a little, slide to a stop
            c.m.position.y = floor;
            c.v.y = Math.abs(c.v.y) > 0.6 ? -c.v.y * 0.3 : 0;
            c.v.x *= 0.55; c.v.z *= 0.55; c.w.multiplyScalar(0.5);
          }
          if (c.t > 1.5) {                                   // then it dissolves, sugar into soil
            const k = clamp((c.t - 1.5) / 0.6, 0, 1);
            c.m.scale.setScalar(c.size * (1 - k) + 1e-4);
            if (k >= 1) {
              c.state = 'gone'; c.m.visible = false;
              if (Math.random() < 0.6) spark.emit(worldPos(c.m), { v: new V3(0, 0.25, 0), life: 0.6, s0: 0.1, s1: 0, color: '#ffe6ee', a: 0.8, spin: rnd(-3, 3) });
            }
          }
        }
      }
    }

    return {
      centre: headCentre,
      anchor: () => headMesh.localToWorld(new V3(0.85, 0.5, 0.2)),
      react(type) {
        for (const c of clusters) c.swing.kick(rnd(-2, 2));
        if (type === 'wrong') {
          // "Too much sugar makes me grow!" It puffs up, and the sugar glitters.
          puff.kick(2.4);
          const c = headCentre();
          for (let i = 0; i < 26; i++) {
            const d = randDir();
            spark.emit(c.clone().addScaledVector(d, 0.6), { v: d.multiplyScalar(rnd(0.3, 0.9)), life: rnd(0.6, 1), s0: 0.1, s1: 0.03, color: '#ffd0dc', drag: 1.8, a: 0.9, spin: rnd(-3, 3) });
          }
        }
      },
      burst() {                                   // the sugar flies off, the fruit squashes and shrinks
        pop.kick(-5); burstBoost = 2.2; sigh = null;
        for (const c of clusters) c.swing.kick(rnd(-3, 3));
      },
      reset() { sigh = null; puff.set(0); pop.set(0); burstBoost = 1; },
      update(s) {
        const { t, dt, h, hp, heal, hTarget } = s;
        const glow = heal.glow;
        if (heal.on) sigh = null;

        /* colour */
        P.mix(skinMat, 'skin', h); fc.lidMat.color.copy(skinMat.color);
        P.mix(leafMat, 'leaf', h); P.mix(leafMat2, 'leaf2', h); P.mix(stemMat, 'stem', h);
        skinU.uSugar.value = 1 - h;
        // enough glow to read as magic, not so much the face washes out
        skinMat.emissive.set('#ffc2d6').multiplyScalar(glow * 0.22);
        lights.heal.intensity = glow * 6;
        runeMat.opacity = 0.24 + 0.1 * Math.sin(t * 1.6) * M + glow * 0.9;

        /* the fruit: swollen when cursed, shrinking as it heals */
        pop.target = heal.on && !heal.burst ? 0.1 : 0;
        pop.step(dt); puff.step(dt);
        const breathe = Math.sin(t * TAU * lerp(0.3, 0.5, h)) * lerp(0.028, 0.02, h) * M;
        let sighK = 0;
        if (sigh) { sigh.t += dt; sighK = Math.sin(Math.PI * clamp(sigh.t / 2, 0, 1)); if (sigh.t > 2) sigh = null; }
        nextSigh -= dt;
        if (nextSigh <= 0) { if (!s.react && !heal.on && hTarget < 0.5 && !REDUCE) sigh = { t: 0 }; nextSigh = rnd(7, 11); }
        const size = lerp(1, 0.66, clamp(hp, -0.1, 1.15)) * (1 + Math.max(-0.2, puff.x) * 0.12);
        const sq = (heal.on ? 0 : s.k.bounce.x) + pop.x;
        swell.scale.set(size * (1 - breathe * 0.4 - sq * 0.45), size * (1 + breathe + sq - sighK * 0.04), size * (1 - breathe * 0.4 - sq * 0.45));
        top.scale.setScalar(Math.pow(1 / size, 0.75));      // the leaves on top stay lush as it shrinks
        const fl = s.k.flinch.x;
        neck.rotation.x = lerp(0.1, -0.02, h) + sighK * 0.12 - fl * 0.06;
        neck.rotation.z = s.k.shake.x * 0.04 + Math.sin(t * 0.9) * 0.03 * M;
        neck.rotation.y = s.k.spin.x * 0.06 + Math.sin(t * 0.55) * 0.05 * M;
        for (let i = 0; i < trunk.bones.length; i++) {
          const b = trunk.bones[i];
          b.rotation.x = lerp(0.03, 0, h) + (i ? 0.012 * Math.sin(t * 0.8 + i) * M : 0);
          b.rotation.z = Math.sin(t * 0.7 + i * 0.7) * 0.02 * M;
        }
        for (const [i, tp] of tendrils.entries()) tp.rotation.x = Math.sin(t * 1.2 + i * 2) * 0.08 * M;
        for (const b of sprout.bones) b.rotation.z = Math.sin(t * 1.1) * 0.04 * M;

        /* branches: weighed down by sugar, lifting as it falls away */
        for (const br of branches) {
          br.s.target = hTarget;
          const hb = br.s.step(dt), bones = br.L.bones;
          const el = lerp(50, 64, hb) * DEG;           // they arch out wide, so the sugar hangs clear of the pot
          bones[0].rotation.set(Math.PI / 2 - el, br.side * 80 * DEG, 0, 'YXZ');
          for (let i = 1; i < bones.length; i++) {
            const sway = Math.sin(t * 1.3 - i * 0.55 + br.ph) * 0.05 * M;
            bones[i].rotation.x = lerp(0.36, 0.27, hb) + sway * 0.4;
            bones[i].rotation.z = sway;
          }
        }

        /* blossoms */
        for (const b of blossoms) {
          b.s.target = sstep(b.at - 0.08, b.at + 0.05, h);
          const bs = b.s.step(dt);
          b.f.scale.setScalar(Math.max(1e-4, bs)); b.f.visible = bs > 2e-3;   // closed buds cost no draws
          b.f.rotation.y = t * 0.2;
        }
        // sugar glints while cursed
        if (h < 0.85 && Math.random() < dt * 8 * (1 - h) * M) {
          const on = cubes.filter((c) => c.state === 'on');
          if (on.length) spark.emit(worldPos(on[Math.floor(Math.random() * on.length)].m).add(randDir().multiplyScalar(0.04)), { life: rnd(0.4, 0.8), s0: 0.12, s1: 0, color: '#fff2f6', a: 0.9, spin: rnd(-3, 3) });
        }

        /* expression on top of the engine's: the sighs, and a squeeze at the first sting */
        fc.over(SIGH_E, sighK * (1 - (s.react?.w ?? 0)));
        if (s.react?.type === 'wrong' && s.react.t < 0.25) fc.over(SQUEEZE_E, s.react.w);

        /* what hangs and what falls */
        scene.updateMatrixWorld();
        for (const c of clusters) {
          c.swing.target = 0; c.swing.step(dt);
          const a = Math.sin(t * 1.6 + c.sw) * 0.06 * M + c.swing.x * 0.3;
          hangQ.setFromEuler(hangE.set(a * 0.6, 0, a));
          c.bone.getWorldQuaternion(tmpQ).invert();
          c.c.quaternion.copy(tmpQ).multiply(hangQ);
        }
        scene.updateMatrixWorld();
        stepCubes(dt, hTarget);
        burstBoost = 1;
        scene.updateMatrixWorld();
        for (const d of drawn) d.sync();
        lights.heal.position.copy(headCentre()).add(new V3(0, 0, 0.9));
      },
    };
  },
};
