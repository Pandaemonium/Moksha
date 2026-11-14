'use strict';
// ───────────────────────────────────────────────────────────────
//  MOKSHA — shared utilities
// ───────────────────────────────────────────────────────────────
const M = (window.M = window.M || {});

M.TAU = Math.PI * 2;
M.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
M.lerp = (a, b, t) => a + (b - a) * t;
M.dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
M.dist2 = (ax, ay, bx, by) => (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
M.angle = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
M.rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
M.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
M.chance = (p) => Math.random() < p;
M.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
M.shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
M.weighted = (items, wf) => {
  let tot = 0;
  for (const it of items) tot += Math.max(0, wf(it));
  let r = Math.random() * tot;
  for (const it of items) {
    r -= Math.max(0, wf(it));
    if (r <= 0) return it;
  }
  return items[items.length - 1];
};
M.angDiff = (a, b) => {
  let d = (b - a) % M.TAU;
  if (d > Math.PI) d -= M.TAU;
  if (d < -Math.PI) d += M.TAU;
  return d;
};
M.approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));
M.damp = (a, b, lambda, dt) => M.lerp(a, b, 1 - Math.exp(-lambda * dt));

M.ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inCubic: (t) => t * t * t,
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
};

// Seeded RNG (mulberry32) — for deterministic room decoration
M.rng = (seed) => {
  let a = seed >>> 0;
  const f = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (lo, hi) => lo + f() * (hi - lo);
  f.int = (lo, hi) => Math.floor(lo + f() * (hi - lo + 1));
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  return f;
};

// ── colour helpers ─────────────────────────────────────────────
const _rgbCache = {};
M.hexToRgb = (hex) => {
  if (_rgbCache[hex]) return _rgbCache[hex];
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return (_rgbCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
};
M.rgba = (hex, a = 1) => {
  const [r, g, b] = M.hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
M.mix = (h1, h2, t) => {
  const a = M.hexToRgb(h1), b = M.hexToRgb(h2);
  const r = Math.round(M.lerp(a[0], b[0], t)), g = Math.round(M.lerp(a[1], b[1], t)), bl = Math.round(M.lerp(a[2], b[2], t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
};
M.shade = (hex, amt) => (amt >= 0 ? M.mix(hex, '#ffffff', amt) : M.mix(hex, '#000000', -amt));

// ── geometry ───────────────────────────────────────────────────
M.circleHit = (a, b, pad = 0) => M.dist2(a.x, a.y, b.x, b.y) < (a.r + b.r + pad) * (a.r + b.r + pad);
M.pointInArc = (px, py, cx, cy, radius, dir, halfArc) => {
  const d = M.dist(px, py, cx, cy);
  if (d > radius) return false;
  if (halfArc >= Math.PI) return true;
  return Math.abs(M.angDiff(dir, M.angle(cx, cy, px, py))) <= halfArc;
};
// distance from point to segment
M.segDist = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = M.clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

M.fmt = (n) => Math.round(n).toLocaleString();
M.uid = (() => { let i = 0; return () => ++i; })();

// rounded-rect path
M.rr = (ctx, x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

M.makeCanvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
};

// small event bus
M.events = {
  _h: {},
  on(n, f) { (this._h[n] = this._h[n] || []).push(f); },
  emit(n, ...a) { (this._h[n] || []).forEach((f) => f(...a)); },
};
