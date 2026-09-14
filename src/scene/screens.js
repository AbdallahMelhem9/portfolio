// Everything drawn on a monitor, badge, sign or board is a 2D canvas turned into a texture.
// No image assets: the room paints itself.
import * as THREE from 'three';
import qrcode from 'qrcode-generator';

export const FONT = {
  display: '"Chakra Petch", "Segoe UI", sans-serif',
  body: '"IBM Plex Sans", "Segoe UI", sans-serif',
  mono: '"IBM Plex Mono", Consolas, monospace',
};
export const INK = {
  bg: '#050d1c', bar: '#0a1830', line: '#173a68', cyan: '#4df3ff', blue: '#3b82f6',
  ice: '#dcebff', muted: '#8aa6cf', dim: '#5b7399', amber: '#ffc257', white: '#f4f9ff', red: '#ff8a94',
};

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
export function toTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Word-wrap `text` at x,y; returns the y after the last line.
export function wrap(ctx, text, x, y, maxW, lineH, maxLines = 99) {
  const words = text.split(' ');
  let line = '', lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      if (lines === maxLines - 1) { ctx.fillText(line.replace(/[,.]?$/, '') + '…', x, y); return y + lineH; }
      ctx.fillText(line, x, y); y += lineH; lines++; line = words[i];
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Dark screen with a title bar. Returns the bar height.
function frame(ctx, w, h, title, right) {
  ctx.fillStyle = INK.bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(23,58,104,.45)'; ctx.lineWidth = 1;
  const step = Math.round(h / 10);
  for (let y = step; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
  const bh = Math.round(h * 0.12);
  ctx.fillStyle = INK.bar; ctx.fillRect(0, 0, w, bh);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillStyle = INK.cyan; ctx.font = `600 ${Math.round(bh * 0.46)}px ${FONT.display}`;
  ctx.fillText(title, Math.round(w * 0.03), bh / 2);
  if (right) {
    ctx.textAlign = 'right'; ctx.fillStyle = INK.muted; ctx.font = `500 ${Math.round(bh * 0.36)}px ${FONT.mono}`;
    ctx.fillText(right, w - Math.round(w * 0.03), bh / 2); ctx.textAlign = 'left';
  }
  return bh;
}

// Right desk monitor: the competition results scroll past as a tape.
export function rankTape(rows) {
  const w = 1024, h = 640;
  const [c, ctx] = makeCanvas(w, h);
  const tex = toTexture(c);
  const fmt = r => `${r.short}  ${r.rank} of ${r.of.toLocaleString('en-US')}`;
  const lanes = [rows.slice(0, 2), rows.slice(2, 4), rows.slice(4, 6)].map(l => l.map(fmt).join('        ') + '        ');
  function update(t) {
    const bh = frame(ctx, w, h, 'results tape', 'private leaderboards');
    const laneH = (h - bh) / 3;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    lanes.forEach((str, l) => {
      const y = bh + laneH * (l + 0.5);
      ctx.font = `600 ${l === 1 ? 62 : 50}px ${FONT.display}`;
      ctx.fillStyle = l === 1 ? INK.white : INK.muted;
      const sw = ctx.measureText(str).width;
      const x = -((t * (70 + l * 28)) % sw);
      for (let k = 0; x + k * sw < w + sw; k++) ctx.fillText(str, x + k * sw, y);
      ctx.strokeStyle = INK.line; ctx.beginPath(); ctx.moveTo(0, y + laneH / 2); ctx.lineTo(w, y + laneH / 2); ctx.stroke();
    });
    tex.needsUpdate = true;
  }
  update(0);
  return { texture: tex, update };
}

// Center desk monitor: an equity curve with drawdown shading, sliding over time.
export function equityCurve() {
  const w = 1024, h = 640;
  const [c, ctx] = makeCanvas(w, h);
  const tex = toTexture(c);
  const rnd = mulberry(20260914);
  const N = 900, series = [100];
  for (let i = 1; i < N; i++) series.push(series[i - 1] * (1 + 0.0009 + (rnd() - 0.5) * 0.02));
  const win = 220;
  function update(t) {
    const bh = frame(ctx, w, h, 'equity curve, demo data', 'not real returns');
    const start = Math.floor(t * 6) % (N - win);
    const pts = series.slice(start, start + win);
    let lo = Infinity, hi = -Infinity;
    for (const v of pts) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const px = 40, py = bh + 30, pw = w - 80, ph = h - bh - 100;
    const X = i => px + (i / (win - 1)) * pw;
    const Y = v => py + (1 - (v - lo) / (hi - lo || 1)) * ph;
    let peak = pts[0], maxDD = 0;
    ctx.fillStyle = 'rgba(255,90,90,.14)';
    for (let i = 1; i < win; i++) {
      if (pts[i] > peak) peak = pts[i];
      const dd = 1 - pts[i] / peak; if (dd > maxDD) maxDD = dd;
      if (dd > 0) ctx.fillRect(X(i - 1), Y(peak), X(i) - X(i - 1) + 1, Y(pts[i]) - Y(peak));
    }
    ctx.beginPath(); ctx.moveTo(X(0), Y(pts[0]));
    for (let i = 1; i < win; i++) ctx.lineTo(X(i), Y(pts[i]));
    ctx.lineTo(X(win - 1), py + ph); ctx.lineTo(X(0), py + ph); ctx.closePath();
    const g = ctx.createLinearGradient(0, py, 0, py + ph);
    g.addColorStop(0, 'rgba(77,243,255,.35)'); g.addColorStop(1, 'rgba(77,243,255,0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(0), Y(pts[0]));
    for (let i = 1; i < win; i++) ctx.lineTo(X(i), Y(pts[i]));
    ctx.strokeStyle = INK.cyan; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK.white; ctx.font = `600 40px ${FONT.mono}`; ctx.textAlign = 'right';
    ctx.fillText(pts[win - 1].toFixed(2), w - 40, h - 28);
    ctx.fillStyle = INK.muted; ctx.font = `500 26px ${FONT.mono}`; ctx.textAlign = 'left';
    ctx.fillText(`max drawdown ${(maxDD * 100).toFixed(1)}%`, 40, h - 28);
    tex.needsUpdate = true;
  }
  update(0);
  return { texture: tex, update };
}

// Left desk monitor: a level-2 order book that breathes.
export function orderBook() {
  const w = 1024, h = 640;
  const [c, ctx] = makeCanvas(w, h);
  const tex = toTexture(c);
  const L = 9;
  function update(t) {
    const bh = frame(ctx, w, h, 'order book, demo data', 'L2, 9 levels');
    const mid = 4210 + Math.sin(t * 0.7) * 3 + Math.sin(t * 2.3) * 0.8;
    const rowH = (h - bh - 20) / (L * 2 + 1);
    const r2 = mulberry(Math.floor(t * 2) + 1);
    ctx.textBaseline = 'middle';
    for (let i = 0; i < L * 2 + 1; i++) {
      const y = bh + 10 + rowH * (i + 0.5);
      if (i === L) {
        ctx.fillStyle = INK.ice; ctx.font = `600 36px ${FONT.display}`; ctx.textAlign = 'center';
        ctx.fillText(mid.toFixed(2), w / 2, y);
        ctx.fillStyle = INK.dim; ctx.font = `500 22px ${FONT.mono}`;
        ctx.textAlign = 'left'; ctx.fillText('bids', 30, y); ctx.textAlign = 'right'; ctx.fillText('asks', w - 30, y);
        continue;
      }
      const ask = i < L, lvl = ask ? L - i : i - L;
      const price = ask ? mid + lvl * 0.25 : mid - lvl * 0.25;
      const size = Math.round(20 + r2() * 380);
      const bw = (size / 400) * (w * 0.4);
      ctx.fillStyle = ask ? 'rgba(255,110,120,.26)' : 'rgba(77,243,255,.26)';
      if (ask) ctx.fillRect(w / 2 + 120, y - rowH * 0.36, bw, rowH * 0.72);
      else ctx.fillRect(w / 2 - 120 - bw, y - rowH * 0.36, bw, rowH * 0.72);
      ctx.font = `500 30px ${FONT.mono}`;
      ctx.fillStyle = ask ? INK.red : INK.cyan; ctx.textAlign = ask ? 'left' : 'right';
      ctx.fillText(price.toFixed(2), ask ? w / 2 + 130 : w / 2 - 130, y);
      ctx.fillStyle = INK.muted; ctx.textAlign = ask ? 'right' : 'left';
      ctx.fillText(String(size), ask ? w - 30 : 30, y);
    }
    ctx.textAlign = 'left';
    tex.needsUpdate = true;
  }
  update(0);
  return { texture: tex, update };
}

// The big wall screen on the competitions side.
export function leaderboard(ranked, total) {
  const w = 1536, h = 800;
  const [c, ctx] = makeCanvas(w, h);
  const bh = frame(ctx, w, h, 'leaderboard', `${ranked.length} of ${total} results. Click a row to open it`);
  ctx.textBaseline = 'middle';
  const yHead = bh + 34;
  ctx.fillStyle = INK.dim; ctx.font = `500 24px ${FONT.mono}`; ctx.textAlign = 'left';
  ctx.fillText('rank', 60, yHead); ctx.fillText('competition', 400, yHead); ctx.fillText('host', 1010, yHead);
  ctx.textAlign = 'right'; ctx.fillText('top', w - 60, yHead); ctx.textAlign = 'left';
  const rowH = (h - bh - 70) / ranked.length;
  const rows = [];
  ranked.forEach((r, i) => {
    const yTop = bh + 70 + rowH * i, y = yTop + rowH / 2;
    rows.push({ v0: 1 - (yTop + rowH) / h, v1: 1 - yTop / h });
    const top = (100 * r.rank) / r.of, gold = top <= 1;
    if (i % 2) { ctx.fillStyle = 'rgba(10,24,48,.65)'; ctx.fillRect(30, y - rowH / 2, w - 60, rowH); }
    ctx.textAlign = 'left';
    ctx.fillStyle = gold ? INK.amber : INK.cyan; ctx.font = `700 46px ${FONT.display}`; ctx.fillText(String(r.rank), 60, y);
    ctx.fillStyle = INK.muted; ctx.font = `500 24px ${FONT.mono}`; ctx.fillText(`of ${r.of.toLocaleString('en-US')}`, 170, y + 3);
    ctx.fillStyle = INK.white; ctx.font = `500 31px ${FONT.body}`; ctx.fillText(r.name, 400, y);
    ctx.fillStyle = INK.muted; ctx.font = `400 25px ${FONT.body}`; ctx.fillText(r.host, 1010, y);
    ctx.textAlign = 'right'; ctx.fillStyle = gold ? INK.amber : INK.cyan; ctx.font = `600 28px ${FONT.mono}`;
    ctx.fillText(`${top < 10 ? top.toFixed(1) : Math.round(top)}%`, w - 60, y);
  });
  // `rows` gives each row's band in texture v coordinates (1 = top), so a click on the screen can be mapped to a row.
  return { texture: toTexture(c), rows };
}

// One project per monitor on the projects wall.
export function projectScreen(p) {
  const w = 800, h = 480;
  const [c, ctx] = makeCanvas(w, h);
  const bh = frame(ctx, w, h, p.stackShort, p.url ? 'github' : 'private');
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = INK.white; ctx.font = `700 52px ${FONT.display}`;
  let y = wrap(ctx, p.title, 36, bh + 78, w - 72, 58, 2);
  ctx.fillStyle = INK.muted; ctx.font = `400 27px ${FONT.body}`;
  wrap(ctx, p.blurb, 36, y + 22, w - 72, 36, 5);
  ctx.fillStyle = INK.cyan; ctx.fillRect(36, h - 30, 120, 4);
  return toTexture(c);
}

// Draws a QR code (with a one-module quiet zone) into a square of the given size.
export function drawQR(ctx, text, x, y, size) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), m = size / (n + 2);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#071226';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(x + (c + 1) * m, y + (r + 1) * m, m + 0.4, m + 0.4);
}

// The same QR as an image URL, for the scanner card in the page.
export function qrImage(text, size = 256) {
  const [c, ctx] = makeCanvas(size, size);
  drawQR(ctx, text, 0, 0, size);
  return c.toDataURL('image/png');
}

// A hanging conference badge for each internship, with a real QR code that deep-links to it.
// Returns the texture plus the QR's rectangle in texture coordinates, so the scanner overlay can find it.
export function badge(e, qrText) {
  const w = 512, h = 740;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#e9f0f8'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = e.accent; ctx.fillRect(0, 0, w, 150);
  ctx.fillStyle = '#0a1830'; ctx.beginPath(); ctx.roundRect(w / 2 - 50, 30, 100, 24, 12); ctx.fill();
  ctx.fillStyle = '#071226'; ctx.font = `700 36px ${FONT.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(e.company, w / 2, 106);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#0b1a31'; ctx.font = `600 34px ${FONT.body}`;
  let y = wrap(ctx, e.role, 40, 228, w - 80, 42, 2);
  ctx.fillStyle = '#4b5f7d'; ctx.font = `500 25px ${FONT.mono}`; ctx.fillText(e.when, 40, y + 12); y += 54;
  ctx.fillStyle = '#31425c'; ctx.font = `400 24px ${FONT.body}`;
  wrap(ctx, e.skills, 40, y + 18, w - 80, 32, 3);

  const size = 190, qx = 40, qy = h - 36 - size;
  drawQR(ctx, qrText, qx, qy, size);
  const tx = qx + size + 24;
  ctx.fillStyle = '#0b1a31'; ctx.font = `700 34px ${FONT.display}`; ctx.fillText('scan me', tx, qy + 60);
  ctx.fillStyle = '#4b5f7d'; ctx.font = `400 22px ${FONT.body}`; wrap(ctx, 'or click the badge', tx, qy + 96, w - tx - 36, 28, 2);
  ctx.font = `500 20px ${FONT.mono}`; ctx.fillText(`intern, ${e.year}`, tx, qy + size - 6);
  return { texture: toTexture(c), qr: { u0: qx / w, u1: (qx + size) / w, v0: 1 - (qy + size) / h, v1: 1 - qy / h } };
}

// Fallback card for a video while (or if) its YouTube thumbnail does not load.
export function videoCard(v) {
  const w = 640, h = 360;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#0a1830'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(77,243,255,.08)'; ctx.fillRect(0, h - 70, w, 70);
  ctx.fillStyle = INK.ice; ctx.font = `600 34px ${FONT.body}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  wrap(ctx, v.title, 36, 70, w - 72, 42, 4);
  ctx.fillStyle = INK.muted; ctx.font = `500 22px ${FONT.mono}`; ctx.fillText(`YouTube, ${v.date}`, 36, h - 26);
  return toTexture(c);
}

// A play button to float over each video thumbnail.
export function playBadge() {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(230,30,40,.92)'; ctx.beginPath(); ctx.roundRect(28, 68, 200, 120, 30); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(108, 98); ctx.lineTo(108, 158); ctx.lineTo(164, 128); ctx.closePath(); ctx.fill();
  return toTexture(c);
}

// The neon name above the desk. Transparent canvas with a baked glow.
export function neonSign(text) {
  const w = 1600, h = 340;
  const [c, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);
  ctx.font = `700 150px ${FONT.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = INK.cyan; ctx.shadowBlur = 60; ctx.fillStyle = INK.cyan;
  for (let i = 0; i < 3; i++) ctx.fillText(text, w / 2, h / 2 + 6);
  ctx.shadowBlur = 0; ctx.fillStyle = '#eafeff'; ctx.fillText(text, w / 2, h / 2 + 6);
  return toTexture(c);
}

// The whiteboard next to the desk: the road from Beirut to Paris, and what got written along the way.
export function whiteboard(profile) {
  const w = 1100, h = 700;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#e4ebf3'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(175,190,212,.28)';
  for (const [x, y, r] of [[220, 520, 120], [820, 190, 150], [960, 560, 90]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  const blue = '#1d4ed8', dark = '#1f2a44', red = '#b83b3b';
  ctx.save(); ctx.rotate(-0.008);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = blue; ctx.font = `600 54px ${FONT.display}`; ctx.fillText('Beirut to Paris', 60, 92);
  const stops = [...profile.education].reverse();
  const x0 = 90, x1 = w - 90, yPath = 210;
  ctx.strokeStyle = blue; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, yPath);
  for (let i = 1; i <= 40; i++) { const t = i / 40; ctx.lineTo(x0 + (x1 - x0) * t, yPath + Math.sin(t * 9) * 6); }
  ctx.stroke();
  stops.forEach((s, i) => {
    const x = x0 + ((x1 - x0) * i) / (stops.length - 1);
    ctx.fillStyle = '#e4ebf3'; ctx.beginPath(); ctx.arc(x, yPath, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.textAlign = i === 0 ? 'left' : i === stops.length - 1 ? 'right' : 'center';
    ctx.fillStyle = dark; ctx.font = `600 26px ${FONT.body}`; ctx.fillText(s.short, x, yPath + 58);
    ctx.fillStyle = '#4b5f7d'; ctx.font = `500 22px ${FONT.mono}`; ctx.fillText(s.when.slice(0, 4), x, yPath + 90);
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = dark; ctx.font = `italic 500 40px ${FONT.body}`;
  ctx.fillText('dS = μS dt + σS dW', 60, 410);
  ctx.fillText('df = f′ dS + ½ f″ σ²S² dt', 60, 470);
  ctx.fillStyle = red; ctx.font = `500 28px ${FONT.body}`;
  ctx.fillText('c-index 0.68 with Cox + Nmut', 60, 545);
  ctx.fillText('imbalance = (qb − qa) / (qb + qa)', 60, 595);
  ctx.strokeStyle = blue; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const y = 380 + i * 34, bw = 40 + i * 28, aw = 40 + (5 - i) * 28;
    ctx.strokeRect(860 - bw, y, bw, 24); ctx.strokeRect(880, y, aw, 24);
  }
  ctx.fillStyle = '#4b5f7d'; ctx.font = `500 22px ${FONT.mono}`;
  ctx.fillText('bids', 700, 620); ctx.fillText('asks', 960, 620);
  ctx.restore();
  return toTexture(c);
}

export function chessboard() {
  const [c, ctx] = makeCanvas(256, 256);
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    ctx.fillStyle = (r + f) % 2 ? '#2b3a55' : '#d8d3c8';
    ctx.fillRect(f * 32, r * 32, 32, 32);
  }
  return toTexture(c);
}

// The framed certificate on the About wall: IEEE student branch president, from the CV.
export function certificate() {
  const w = 300, h = 360;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#eef1f5'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1f2a44'; ctx.lineWidth = 3; ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.strokeStyle = '#8a9bb8'; ctx.lineWidth = 1; ctx.strokeRect(22, 22, w - 44, h - 44);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1d4ed8'; ctx.font = `700 54px ${FONT.display}`; ctx.fillText('IEEE', w / 2, 78);
  ctx.fillStyle = '#1f2a44'; ctx.font = `600 19px ${FONT.body}`; ctx.fillText('Student Branch', w / 2, 118);
  ctx.fillStyle = '#4b5f7d'; ctx.font = `400 16px ${FONT.body}`; ctx.fillText('Lebanese University', w / 2, 142);
  ctx.strokeStyle = '#8a9bb8'; ctx.beginPath(); ctx.moveTo(60, 168); ctx.lineTo(w - 60, 168); ctx.stroke();
  ctx.fillStyle = '#1f2a44'; ctx.font = `600 22px ${FONT.body}`; ctx.fillText('Branch President', w / 2, 200);
  ctx.fillStyle = '#4b5f7d'; ctx.font = `500 17px ${FONT.mono}`; ctx.fillText('2022 to 2023', w / 2, 228);
  ctx.font = `400 14px ${FONT.body}`; ctx.fillText('Abdallah Melhem', w / 2, 256);
  ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w / 2, 308, 26, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(w / 2, 308, 19, 0, Math.PI * 2); ctx.stroke();
  return toTexture(c);
}

export function medal(rank) {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = '#ffc257'; ctx.beginPath(); ctx.arc(128, 128, 124, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b8862e'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(128, 128, 102, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#4a3208'; ctx.font = `700 ${rank > 99 ? 84 : 110}px ${FONT.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(rank), 128, 134);
  return toTexture(c);
}

// Short wall label. 7:1 canvas, so pair it with a plane of the same ratio.
export function label(text, color = INK.muted) {
  const [c, ctx] = makeCanvas(560, 80);
  ctx.clearRect(0, 0, 560, 80);
  ctx.fillStyle = color; ctx.font = `500 40px ${FONT.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 280, 40);
  return toTexture(c);
}
