// The room: four walls, one per section. You stand in the middle.
//
//            competitions (+Z)
//   projects (-X)   ●   experiences (+X)
//              about (-Z, main)
//
// Each wall is a Group whose local +Z points into the room and local +X runs left to right
// as seen from the center, so props are placed in wall coordinates.
import * as THREE from 'three';
import * as S from './screens.js';
import { profile, experiences, projects, videos, competitions } from '../data.js';

export const WALL_YAW = { about: 0, projects: Math.PI / 2, competitions: Math.PI, experiences: -Math.PI / 2 };
export const ROOM = { w: 10, h: 4, d: 10 };

const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

export function buildRoom(scene, lowTier) {
  const interactives = []; // { mesh, kind, index, dist, wall }
  const updaters = [];     // screens that redraw (throttled)
  const perFrame = [];     // cheap per-frame animations

  const M = {
    wall: new THREE.MeshStandardMaterial({ color: 0x0e1f3a, roughness: 0.96 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x0a1526, roughness: 0.82, metalness: 0.12 }),
    ceil: new THREE.MeshStandardMaterial({ color: 0x070f1c, roughness: 1 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x1a2a44, roughness: 0.55, metalness: 0.5 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x04070d, roughness: 0.4, metalness: 0.6 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x2b303c, roughness: 0.8 }),
    copper: new THREE.MeshStandardMaterial({ color: 0x9a5b2c, roughness: 0.35, metalness: 0.8 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0xe8ecf2, roughness: 0.5 }),
  };
  const add = (geo, mat, x, y, z, parent = scene) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m;
  };

  // Shell
  const floor = add(new THREE.PlaneGeometry(ROOM.w, ROOM.d), M.floor, 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  const ceil = add(new THREE.PlaneGeometry(ROOM.w, ROOM.d), M.ceil, 0, ROOM.h, 0); ceil.rotation.x = Math.PI / 2;
  const walls = {};
  const anchors = { about: [0, 0, -ROOM.d / 2], projects: [-ROOM.w / 2, 0, 0], competitions: [0, 0, ROOM.d / 2], experiences: [ROOM.w / 2, 0, 0] };
  Object.keys(anchors).forEach((id, wi) => {
    const g = new THREE.Group(); g.position.set(...anchors[id]); g.rotation.y = WALL_YAW[id]; scene.add(g); walls[id] = g;
    add(new THREE.PlaneGeometry(ROOM.w, ROOM.h), M.wall, 0, ROOM.h / 2, 0, g);
    // LED strip along the baseboard, chasing.
    const n = 24;
    const led = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.025, 0.03), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { mtx.setPosition(-ROOM.w / 2 + 0.25 + (i * (ROOM.w - 0.5)) / (n - 1), 0.03, 0.05); led.setMatrixAt(i, mtx); led.setColorAt(i, new THREE.Color(0x4df3ff)); }
    g.add(led);
    const col = new THREE.Color();
    perFrame.push(t => {
      for (let i = 0; i < n; i++) {
        const k = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.2 - (i + wi * 6) * 0.45), 3);
        col.setRGB(0.3 * k, 0.95 * k, k).multiplyScalar(2.2); led.setColorAt(i, col);
      }
      led.instanceColor.needsUpdate = true;
    });
  });

  // A framed screen with a bezel. `tex` is a canvas texture; color above 1 makes bright pixels bloom.
  function screen(g, o) {
    const bezel = add(new THREE.BoxGeometry(o.w + 0.07, o.h + 0.07, 0.05), M.bezel, o.x, o.y, o.z, g);
    if (o.tilt) bezel.rotation.y = o.tilt;
    const face = add(new THREE.PlaneGeometry(o.w, o.h), new THREE.MeshBasicMaterial({ map: o.tex, toneMapped: false, color: hdr(0xffffff, o.glow ?? 1.25) }), 0, 0, 0.026, bezel);
    if (o.kind) interactives.push({ mesh: face, kind: o.kind, index: o.index, dist: o.dist ?? 1.2, wall: o.wall, rows: o.rows });
    return bezel;
  }
  const point = (color, intensity, distance, x, y, z, parent) => { const l = new THREE.PointLight(color, intensity, distance, 2); l.position.set(x, y, z); parent.add(l); return l; };

  // ---------- About wall: the desk ----------
  const A = walls.about;
  add(new THREE.BoxGeometry(3.6, 0.07, 1.15), M.wood, 0, 0.78, 1.0, A);
  add(new THREE.BoxGeometry(0.06, 0.78, 1.05), M.metal, -1.7, 0.39, 1.0, A);
  add(new THREE.BoxGeometry(0.06, 0.78, 1.05), M.metal, 1.7, 0.39, 1.0, A);
  add(new THREE.BoxGeometry(3.4, 0.5, 0.04), M.metal, 0, 0.5, 0.5, A);
  const eq = S.equityCurve(), ob = S.orderBook(), tape = S.rankTape(competitions.ranked);
  updaters.push(eq.update, ob.update, tape.update);
  screen(A, { w: 1.2, h: 0.72, x: 0, y: 1.32, z: 0.62, tex: eq.texture, kind: 'about', index: 0, dist: 1.1, wall: 'about' });
  add(new THREE.BoxGeometry(0.08, 0.24, 0.08), M.metal, 0, 0.9, 0.62, A);
  add(new THREE.BoxGeometry(0.42, 0.02, 0.26), M.metal, 0, 0.82, 0.62, A);
  screen(A, { w: 1.0, h: 0.62, x: -1.3, y: 1.26, z: 0.72, tilt: 0.42, tex: ob.texture, kind: 'about', index: 1, dist: 1.0, wall: 'about' });
  screen(A, { w: 1.0, h: 0.62, x: 1.3, y: 1.26, z: 0.72, tilt: -0.42, tex: tape.texture, kind: 'about', index: 2, dist: 1.0, wall: 'about' });
  for (const x of [-1.3, 1.3]) { add(new THREE.BoxGeometry(0.06, 0.2, 0.06), M.metal, x, 0.9, 0.72, A); add(new THREE.BoxGeometry(0.34, 0.02, 0.22), M.metal, x, 0.82, 0.72, A); }
  // keyboard and mouse
  add(new THREE.BoxGeometry(0.62, 0.02, 0.2), M.bezel, -0.1, 0.825, 1.2, A);
  add(new THREE.BoxGeometry(0.07, 0.025, 0.11), M.bezel, 0.42, 0.825, 1.22, A);

  // The glow is baked into the texture; the material sits just above the bloom threshold so the letters stay legible.
  const NEON = 1.04;
  const neonMat = new THREE.MeshBasicMaterial({ map: S.neonSign(profile.name), transparent: true, toneMapped: false, color: hdr(0xffffff, NEON), depthWrite: false });
  add(new THREE.PlaneGeometry(4.4, 0.94), neonMat, 0, 3.12, 0.03, A);
  const neonLight = point(0x4df3ff, 12, 7, 0, 3.0, 1.0, A);
  perFrame.push(t => {
    const on = t > 1.5 ? 1 : (t < 0.4 ? 0 : (Math.sin(t * 43) > -0.3 ? 1 : 0.15) * Math.min(1, t / 1.5));
    const k = on * (1 + 0.03 * Math.sin(t * 31));
    neonMat.color.setScalar(NEON * k); neonLight.intensity = 12 * k;
  });

  add(new THREE.BoxGeometry(2.1, 1.37, 0.04), M.metal, -2.45, 2.28, 0.02, A);
  const wb = add(new THREE.PlaneGeometry(2.0, 1.27), new THREE.MeshStandardMaterial({ map: S.whiteboard(profile), roughness: 0.55 }), -2.45, 2.28, 0.045, A);
  interactives.push({ mesh: wb, kind: 'about', index: 3, dist: 1.6, wall: 'about' });
  add(new THREE.BoxGeometry(0.62, 0.74, 0.04), M.metal, 3.0, 2.2, 0.02, A);
  const cert = add(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshStandardMaterial({ map: S.certificate(), roughness: 0.7 }), 3.0, 2.2, 0.045, A);
  interactives.push({ mesh: cert, kind: 'about', index: 4, dist: 0.9, wall: 'about' });

  // Desk lamp, the one warm light in the room.
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.5), M.metal, 1.5, 1.07, 1.08, A);
  add(new THREE.CylinderGeometry(0.06, 0.07, 0.02), M.metal, 1.5, 0.83, 1.08, A);
  add(new THREE.ConeGeometry(0.16, 0.18, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x1d2a44, side: THREE.DoubleSide, roughness: 0.6 }), 1.5, 1.36, 1.08, A);
  add(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: hdr(0xffc257, 3), toneMapped: false }), 1.5, 1.3, 1.08, A);
  point(0xffb85c, 7, 4.5, 1.5, 1.24, 1.08, A);

  // Chessboard with a few pieces, and a rakweh.
  const cb = add(new THREE.PlaneGeometry(0.44, 0.44), new THREE.MeshStandardMaterial({ map: S.chessboard(), roughness: 0.8 }), -1.25, 0.822, 1.2, A); cb.rotation.x = -Math.PI / 2;
  const pieceGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.06, 10);
  for (const [f, r, light] of [[0, 0, true], [3, 0, true], [6, 1, false], [4, 3, false], [1, 5, true], [7, 7, false]]) {
    add(pieceGeo, light ? M.plastic : M.bezel, -1.25 - 0.19 + f * 0.055, 0.852, 1.2 - 0.19 + r * 0.055, A);
  }
  add(new THREE.CylinderGeometry(0.045, 0.062, 0.13, 16), M.copper, 0.8, 0.885, 1.32, A);
  const handle = add(new THREE.CylinderGeometry(0.007, 0.007, 0.22), M.copper, 0.93, 0.93, 1.32, A); handle.rotation.z = -1.1;

  // Chair pushed in under the desk, off to the left, so it never hides the monitors.
  const chair = new THREE.Group(); chair.position.set(-0.6, 0, 1.42); chair.rotation.y = 0.35; A.add(chair);
  add(new THREE.BoxGeometry(0.5, 0.05, 0.5), M.metal, 0, 0.46, 0, chair);
  add(new THREE.BoxGeometry(0.5, 0.42, 0.04), M.metal, 0, 0.7, 0.25, chair);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8), M.metal, 0, 0.23, 0, chair);
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 5), M.metal, 0, 0.02, 0, chair);

  // ---------- Projects wall: a bank of monitors ----------
  const P = walls.projects;
  const slots = [[-2.25, 2.62], [-0.75, 2.62], [0.75, 2.62], [2.25, 2.62], [-1.5, 1.72], [0, 1.72], [1.5, 1.72]];
  projects.forEach((p, i) => {
    const [x, y] = slots[i % slots.length];
    screen(P, { w: 1.38, h: 0.83, x, y, z: 0.03, tex: S.projectScreen(p), kind: 'project', index: i, dist: 1.4, wall: 'projects' });
  });
  // The video rack: two rows of YouTube thumbnails floating below the monitors, tilted up toward the viewer.
  const vidGeo = new THREE.PlaneGeometry(1.0, 0.5625);
  const playTex = S.playBadge();
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  videos.forEach((v, i) => {
    const row = i < 4 ? 0 : 1, col = i % 4;
    const x = (col - 1.5) * 1.06, y = row === 0 ? 1.02 : 0.48, z = 0.34;
    const mat = new THREE.MeshBasicMaterial({ map: S.videoCard(v), toneMapped: false, color: hdr(0xffffff, 1.0) });
    const card = add(vidGeo, mat, x, y, z, P);
    card.scale.setScalar(0.88);
    card.rotation.x = -0.16;
    add(new THREE.PlaneGeometry(0.17, 0.17), new THREE.MeshBasicMaterial({ map: playTex, transparent: true, toneMapped: false, color: hdr(0xffffff, 1.4), depthWrite: false }), 0, 0, 0.004, card);
    interactives.push({ mesh: card, kind: 'video', index: i, dist: 1.0, wall: 'projects' });
    // YouTube answers a grey 120x90 placeholder, not an error, when a size does not exist: judge by width.
    const sizes = ['maxresdefault', 'hq720', 'mqdefault'];
    const tryLoad = k => {
      if (k >= sizes.length) return;
      loader.load(`https://i.ytimg.com/vi/${v.id}/${sizes[k]}.jpg`, tex => {
        if (tex.image.width < 300 && k < sizes.length - 1) { tex.dispose(); tryLoad(k + 1); return; }
        tex.colorSpace = THREE.SRGBColorSpace; mat.map = tex; mat.needsUpdate = true;
      }, undefined, () => tryLoad(k + 1));
    };
    tryLoad(0);
    perFrame.push(t => { card.position.y = y + Math.sin(t * 1.1 + i * 0.8) * 0.012; });
  });
  add(new THREE.PlaneGeometry(0.7, 0.1), new THREE.MeshBasicMaterial({ map: S.label('YouTube'), transparent: true, toneMapped: false, color: hdr(0xffffff, 1.2) }), -2.75, 0.72, 0.04, P);
  point(0x3b82f6, 12, 8, 0, 2.6, 1.6, P);

  // ---------- Competitions wall: the leaderboard ----------
  const C = walls.competitions;
  const lb = S.leaderboard(competitions.ranked, competitions.entered.length);
  screen(C, { w: 4.6, h: 2.4, x: 0, y: 2.15, z: 0.03, tex: lb.texture, kind: 'leaderboard', index: -1, rows: lb.rows, dist: 3.4, wall: 'competitions', glow: 1.15 });
  competitions.ranked.slice(0, 3).forEach((r, i) => {
    const x = (i - 1) * 0.8;
    add(new THREE.BoxGeometry(0.07, 0.34, 0.012), new THREE.MeshStandardMaterial({ color: 0x2a5bd7, roughness: 0.7 }), x, 0.72, 0.04, C);
    // Unlit materials: under the cyan wall light a lit amber turns green.
    add(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 32), new THREE.MeshBasicMaterial({ color: 0xb8862e }), x, 0.5, 0.05, C).rotation.x = Math.PI / 2;
    const face = add(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({ map: S.medal(r.rank), transparent: true }), x, 0.5, 0.065, C);
    interactives.push({ mesh: face, kind: 'competition', index: i, dist: 0.9, wall: 'competitions' });
  });
  add(new THREE.PlaneGeometry(1.4, 0.2), new THREE.MeshBasicMaterial({ map: S.label('top 1 percent'), transparent: true, toneMapped: false, color: hdr(0xffffff, 1.2) }), 0, 0.22, 0.04, C);
  point(0x4df3ff, 12, 8, 0, 2.4, 1.8, C);

  // ---------- Experiences wall: three hanging badges ----------
  const E = walls.experiences;
  const count = experiences.length;
  experiences.forEach((e, i) => {
    const x = (count - 1 - i - (count - 1) / 2) * 1.9; // oldest on the left
    const g = new THREE.Group(); g.position.set(x, ROOM.h - 0.05, 0.32); E.add(g);
    add(new THREE.CylinderGeometry(0.004, 0.004, 1.2), M.metal, 0, -0.6, 0, g);
    add(new THREE.BoxGeometry(0.09, 0.06, 0.02), M.metal, 0, -1.22, 0, g);
    // The QR encodes a deep link to this badge, so a phone pointed at the screen lands on the same internship.
    const b = S.badge(e, `${location.origin}${location.pathname}#experiences/${e.slug}`);
    const card = add(new THREE.PlaneGeometry(0.74, 1.07), new THREE.MeshStandardMaterial({ map: b.texture, roughness: 0.65, side: THREE.DoubleSide }), 0, -1.78, 0, g);
    interactives.push({ mesh: card, kind: 'experience', index: i, dist: 1.15, wall: 'experiences', qr: b.qr });
    perFrame.push(t => { g.rotation.z = Math.sin(t * 0.9 + i * 1.7) * 0.035; g.rotation.x = Math.sin(t * 0.6 + i) * 0.02; });
    add(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: hdr(e.accent, 2.4), toneMapped: false }), x, 1.35, 0.05, E);
    add(new THREE.PlaneGeometry(0.7, 0.1), new THREE.MeshBasicMaterial({ map: S.label(e.year), transparent: true, toneMapped: false, color: hdr(0xffffff, 1.2) }), x, 1.12, 0.04, E);
  });
  add(new THREE.BoxGeometry(5.2, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: hdr(0x9fb8ff, 1.5), toneMapped: false }), 0, 1.35, 0.03, E);
  point(0x9fb8ff, 10, 8, 0, 2.6, 1.6, E);

  // ---------- Global light ----------
  scene.add(new THREE.AmbientLight(0x1e3a66, 0.9));
  scene.add(new THREE.HemisphereLight(0x2f4f80, 0x05080f, 0.6));
  add(new THREE.BoxGeometry(1.8, 0.02, 0.5), new THREE.MeshBasicMaterial({ color: hdr(0xbfe8ff, 1.05), toneMapped: false }), 0, ROOM.h - 0.015, 0);
  point(0xbfe8ff, lowTier ? 4 : 6, 9, 0, ROOM.h - 0.3, 0, scene);

  return { interactives, updaters, perFrame, walls };
}
