import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildRoom } from './scene/room.js';
import { RoomControls } from './controls.js';
import { buildUI } from './ui.js';
import { experiences, projects, videos, competitions } from './data.js';
import { qrImage } from './scene/screens.js';
import './style.css';

const WALL_IDS = ['about', 'projects', 'competitions', 'experiences'];

async function start() {
  // Screens are painted with these fonts, so wait for them (but never longer than two seconds).
  const fonts = ['700 40px "Chakra Petch"', '500 40px "IBM Plex Sans"', '500 40px "IBM Plex Mono"'].map(f => document.fonts.load(f).catch(() => {}));
  await Promise.race([Promise.all(fonts), new Promise(r => setTimeout(r, 2000))]);

  const canvas = document.getElementById('scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowTier = matchMedia('(pointer: coarse)').matches || innerWidth < 800;
  const isMobile = () => innerWidth < 800;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowTier, powerPreference: 'high-performance' });
  } catch (err) {
    document.body.classList.add('no-webgl');
    return;
  }
  let dpr = Math.min(devicePixelRatio, lowTier ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02060d);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
  camera.position.set(0, 1.45, 0);

  const room = buildRoom(scene, lowTier);
  const ui = buildUI(document.getElementById('app'));
  const meshes = room.interactives.map(i => i.mesh);
  const byMesh = new Map(room.interactives.map(i => [i.mesh, i]));
  const raycaster = new THREE.Raycaster();
  const V = new THREE.Vector3(), Q = new THREE.Quaternion();

  const controls = new RoomControls(camera, canvas, {
    onWall: (wall, settled) => ui.setWall(wall, settled),
    onFocus: f => { ui.setFocused(f); if (!f) for (const it of room.interactives) if (it.mark) it.mark.visible = false; },
    onDrag: () => ui.hideHint(),
    onClick: (x, y) => {
      const p = pick(x, y);
      if (p) activate(p.it, p.hit);
      else if (controls.focus) controls.unfocus();
    },
  });
  ui.controls = controls;
  ui.onDetail = (kind, index) => activateByKind(kind, index);

  const ndc = (x, y) => new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  const toScreen = v => [((v.x + 1) / 2) * innerWidth, ((1 - v.y) / 2) * innerHeight];

  // What did the click mean? A direct hit first; otherwise the nearest thing on this wall within reach,
  // so a click near a monitor still steps up to it.
  function pick(x, y) {
    raycaster.setFromCamera(ndc(x, y), camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    if (hit) return { it: byMesh.get(hit.object), hit };
    let best = null, bd = 160 * 160;
    for (const it of room.interactives) {
      if (it.wall !== controls.wall) continue;
      it.mesh.getWorldPosition(V).project(camera);
      if (V.z > 1) continue;
      const [sx, sy] = toScreen(V);
      const d = (sx - x) ** 2 + (sy - y) ** 2;
      if (d < bd) { bd = d; best = it; }
    }
    return best ? { it: best, hit: null } : null;
  }

  function worldNormal(mesh) { return new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.getWorldQuaternion(Q)); }

  let scanIt = null;
  function activate(it, hit, rowOverride) {
    const mesh = it.mesh;
    const p = mesh.getWorldPosition(new THREE.Vector3()), n = worldNormal(mesh);
    ui.hideHint();
    switch (it.kind) {
      case 'leaderboard': {
        let row = rowOverride;
        if (row == null && hit?.uv) row = it.rows.findIndex(b => hit.uv.y >= b.v0 && hit.uv.y <= b.v1);
        if (row == null || row < 0) { controls.focusOn(p, n, it.dist); ui.open('competitions'); return; }
        // A gentle step toward the whole screen; the chosen row is marked on the screen and opened in the panel.
        const b = it.rows[row], H = mesh.geometry.parameters.height;
        if (it.mark) { it.mark.position.y = ((b.v0 + b.v1) / 2 - 0.5) * H; it.mark.scale.y = (b.v1 - b.v0) * H; it.mark.visible = true; }
        controls.focusOn(p, n, it.dist);
        ui.open('competitions'); ui.highlight('competition', row); ui.showDetail('competition', row);
        return;
      }
      case 'experience': {
        controls.focusOn(p, n, it.dist);
        ui.open('experiences'); ui.highlight('experience', it.index); ui.hideDetail();
        scanIt = it;
        ui.scan(qrImage(it.qrText), experiences[it.index].company).then(() => {
          if (controls.focus && scanIt === it) ui.showDetail('experience', it.index);
        });
        return;
      }
      case 'competition':
        controls.focusOn(p, n, it.dist);
        ui.open('competitions'); ui.highlight('competition', it.index); ui.showDetail('competition', it.index);
        return;
      case 'project':
        controls.focusOn(p, n, it.dist);
        ui.open('projects'); ui.highlight('project', it.index); ui.showDetail('project', it.index);
        return;
      case 'video':
        controls.focusOn(p, n, it.dist);
        ui.open('projects'); ui.highlight('video', it.index); ui.showDetail('video', it.index);
        return;
      default:
        controls.focusOn(p, n, it.dist);
        ui.open(it.wall);
    }
  }

  // From the panel (or a deep link): find the object for an item and step up to it.
  function activateByKind(kind, index) {
    if (kind === 'competition') {
      // From the panel, the leaderboard row is the informative view; medals are for clicking in the room.
      const board = room.interactives.find(x => x.kind === 'leaderboard');
      if (board) return activate(board, null, index);
    }
    const it = room.interactives.find(x => x.kind === kind && x.index === index);
    if (it) activate(it, null); else ui.showDetail(kind, index);
  }
  function findBySlug(wall, slug) {
    if (wall === 'experiences') { const i = experiences.findIndex(e => e.slug === slug); return i >= 0 ? ['experience', i] : null; }
    if (wall === 'competitions') { const i = competitions.ranked.findIndex(c => c.slug === slug); return i >= 0 ? ['competition', i] : null; }
    if (wall === 'projects') {
      const i = projects.findIndex(p => p.slug === slug); if (i >= 0) return ['project', i];
      const v = videos.findIndex(x => x.id === slug); return v >= 0 ? ['video', v] : null;
    }
    return null;
  }

  // Deep links: /#projects opens facing that wall, /#experiences/kinetix also opens that badge.
  let pending = null;
  const [startWall, startSlug] = location.hash.slice(1).split('/');
  if (WALL_IDS.includes(startWall)) {
    controls.goTo(startWall); controls.yaw = controls.targetYaw;
    if (startSlug) pending = { wall: startWall, slug: startSlug };
  }
  const baseOnWall = controls.onWall;
  controls.onWall = (wall, settled) => {
    baseOnWall(wall, settled);
    if (settled && !pending && location.hash.slice(1).split('/')[0] !== wall) history.replaceState(null, '', wall === 'about' ? location.pathname : `#${wall}`);
  };
  addEventListener('hashchange', () => { const w = location.hash.slice(1).split('/')[0]; if (WALL_IDS.includes(w) && w !== controls.wall) controls.goTo(w); });

  let hoverT = 0;
  canvas.addEventListener('pointermove', e => {
    const now = performance.now();
    if (now - hoverT < 60 || controls.dragging) return;
    hoverT = now;
    raycaster.setFromCamera(ndc(e.clientX, e.clientY), camera);
    canvas.style.cursor = raycaster.intersectObjects(meshes, false).length ? 'pointer' : '';
  });

  // Bloom runs at half resolution: the glow is soft anyway, and it cuts the pass cost by four.
  let composer = null, bloom = null;
  if (!lowTier) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.4, 0.5, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  function layout() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const portrait = h > w;
    camera.fov = portrait ? 74 : 50;
    // Standing a little behind the center keeps a whole wall in view next to the open panel.
    controls.back = portrait ? 1.9 : 1.6;
    camera.updateProjectionMatrix();
    if (composer) { composer.setSize(w, h); bloom.setSize(w / 2, h / 2); }
  }
  layout();
  addEventListener('resize', layout);

  // If the machine cannot keep up, step the quality down instead of stuttering: first drop bloom, then pixel ratio.
  let slow = 0;
  function degrade(dt) {
    slow = dt > 0.07 ? slow + dt : Math.max(0, slow - dt * 0.5);
    if (slow < 2) return;
    slow = 0;
    if (composer) { composer.dispose(); composer = null; bloom = null; }
    else if (dpr > 1) { dpr = 1; renderer.setPixelRatio(1); layout(); }
  }

  // When a panel is open, shift the view so the wall stays centered in the free area.
  let shiftX = 0, shiftY = 0;
  const clock = new THREE.Clock();
  let acc = 1;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.25);
    const t = clock.elapsedTime;
    degrade(dt);
    controls.update(dt);
    ui.setYaw(controls.yaw);

    if (pending && controls.settled && controls.wall === pending.wall) {
      const found = findBySlug(pending.wall, pending.slug);
      pending = null;
      if (found) activateByKind(found[0], found[1]);
    }

    const s = 1 - Math.exp(-dt * 5);
    const wantX = ui.state.panelOpen && !isMobile() ? 0.22 : 0;
    const wantY = ui.state.panelOpen && isMobile() ? 0.24 : 0;
    shiftX += (wantX - shiftX) * s; shiftY += (wantY - shiftY) * s;
    camera.setViewOffset(innerWidth, innerHeight, shiftX * innerWidth, shiftY * innerHeight, innerWidth, innerHeight);

    acc += dt;
    if (acc > 0.16 && !reduced) { acc = 0; for (const u of room.updaters) u(t); }
    const tt = reduced ? 2 : t;
    for (const f of room.perFrame) f(tt);

    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  frame();
  document.body.classList.add('ready');
}

start();
