// Look-around controls for a person standing in the middle of the room.
// Drag to turn; on release the view snaps to the nearest wall. Click a screen to step up to it.
import * as THREE from 'three';
import { WALL_YAW } from './scene/room.js';

const HALF_PI = Math.PI / 2;
const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));

export class RoomControls {
  constructor(camera, dom, { onWall, onClick, onDrag, onFocus } = {}) {
    this.camera = camera; this.dom = dom;
    this.onWall = onWall; this.onClick = onClick; this.onDrag = onDrag; this.onFocus = onFocus;
    this.yaw = 0; this.targetYaw = 0;
    this.mx = 0; this.my = 0;
    this.dragging = false; this.moved = 0; this.lastX = 0; this.lastT = 0; this.vel = 0;
    this.origin = new THREE.Vector3(0, 1.45, 0);
    this.back = 0;          // how far behind the center the camera stands (portrait phones)
    this.focus = null;      // { pos, look } when stepped up to a screen
    this.wall = 'about'; this.settled = false;
    this._pos = new THREE.Vector3(); this._q = new THREE.Quaternion();
    this._e = new THREE.Euler(0, 0, 0, 'YXZ'); this._m = new THREE.Matrix4(); this._dir = new THREE.Vector3();

    dom.addEventListener('pointerdown', e => this.down(e));
    dom.addEventListener('pointermove', e => this.move(e));
    dom.addEventListener('pointerup', e => this.up(e));
    dom.addEventListener('pointercancel', e => this.up(e));
    addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') this.turn(1);
      else if (e.key === 'ArrowRight') this.turn(-1);
      else if (e.key === 'Escape') this.unfocus();
    });
    dom.style.touchAction = 'none';
  }

  down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this.dragging = true; this.moved = 0; this.vel = 0;
    this.startX = e.clientX; this.startY = e.clientY; this.startT = performance.now();
    this.lastX = e.clientX; this.lastT = this.startT;
    this.dom.setPointerCapture?.(e.pointerId);
    this.dom.classList.add('grabbing');
  }
  move(e) {
    this.mx = (e.clientX / innerWidth) * 2 - 1;
    this.my = -((e.clientY / innerHeight) * 2 - 1);
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX; this.lastX = e.clientX;
    // Distance from where the press started, not accumulated jitter, decides click versus drag.
    this.moved = Math.max(this.moved, Math.hypot(e.clientX - this.startX, e.clientY - this.startY));
    if (this.moved < 10) return;
    // Pulling away while stepped up to something steps back first, then keeps turning.
    if (this.focus) this.unfocus();
    const now = performance.now(), dt = Math.max(1, now - this.lastT); this.lastT = now;
    const k = 0.0045 * (innerWidth < 700 ? 1.6 : 1);
    this.yaw += dx * k;
    this.vel = 0.8 * this.vel + 0.2 * ((dx * k) / dt) * 1000;
    this.onDrag?.();
  }
  up(e) {
    if (!this.dragging) return;
    this.dragging = false; this.dom.classList.remove('grabbing');
    const quick = performance.now() - this.startT < 320;
    if (this.moved < 12 || (quick && this.moved < 30)) { this.onClick?.(e.clientX, e.clientY); return; }
    if (this.focus) return;
    this.targetYaw = Math.round((this.yaw + this.vel * 0.12) / HALF_PI) * HALF_PI;
  }

  turn(dir) {
    if (this.focus) this.unfocus();
    this.targetYaw = Math.round(this.targetYaw / HALF_PI) * HALF_PI + dir * HALF_PI;
  }
  goTo(id) {
    if (this.focus) this.unfocus();
    this.targetYaw += wrapAngle(WALL_YAW[id] - this.targetYaw);
  }
  focusOn(point, normal, dist) {
    this.focus = { pos: point.clone().addScaledVector(normal, dist), look: point.clone() };
    this.onFocus?.(true);
  }
  unfocus() {
    if (!this.focus) return;
    this.focus = null;
    this.yaw = this.targetYaw = Math.round(this.targetYaw / HALF_PI) * HALF_PI;
    this.onFocus?.(false);
  }
  wallFor(yaw) {
    let best = 'about', bd = Infinity;
    for (const id in WALL_YAW) { const d = Math.abs(wrapAngle(yaw - WALL_YAW[id])); if (d < bd) { bd = d; best = id; } }
    return best;
  }

  update(dt) {
    // Exponential approach in wall-clock time, so a slow frame rate still lands on the wall in the same time.
    const s = 1 - Math.exp(-dt * 7);
    if (!this.dragging && !this.focus) this.yaw += (this.targetYaw - this.yaw) * s;
    this._dir.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    if (this.focus) {
      this.camera.position.lerp(this.focus.pos, s);
      this._m.lookAt(this.camera.position, this.focus.look, THREE.Object3D.DEFAULT_UP);
      this._q.setFromRotationMatrix(this._m);
      this.camera.quaternion.slerp(this._q, s);
    } else {
      this._pos.copy(this.origin).addScaledVector(this._dir, -this.back);
      this.camera.position.lerp(this._pos, s);
      const yawOff = this.dragging ? 0 : -this.mx * 0.05;
      const pitch = this.dragging ? 0 : this.my * 0.06;
      this._e.set(pitch, this.yaw + yawOff, 0);
      this._q.setFromEuler(this._e);
      this.camera.quaternion.slerp(this._q, Math.min(1, s * 1.6));
    }
    const wall = this.wallFor(this.targetYaw);
    const settled = !this.dragging && !this.focus && Math.abs(this.yaw - this.targetYaw) < 0.03;
    if (wall !== this.wall || settled !== this.settled) { this.wall = wall; this.settled = settled; this.onWall?.(wall, settled); }
  }
}
