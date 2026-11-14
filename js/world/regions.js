'use strict';
// ───────────────────────────────────────────────────────────────
//  Regions of the Wheel + room background painter
// ───────────────────────────────────────────────────────────────
M.REGIONS = [
  {
    id: 'kamala', name: 'Kamala Vana', sub: 'The Lotus Grove · Rings I–II', music: 'r0',
    floor: '#2f6e5c', floor2: '#1b4640', grout: '#123630', tile: 'moss',
    accent: '#ff7ab0', accent2: '#ffd96a', wall: '#0b2a20', wallStone: '#6a8a70',
    leaf: '#2f9a5a', leaf2: '#155a34', flower: '#ff6aa0', flower2: '#fff0f6', stone: '#b8b098',
    water: '#1f8aa0', ambient: 'petals', light: '#fff0c0', tint: 'rgba(255,200,150,0.03)', vignette: 'rgba(5,25,20,0.6)',
    props: ['pillar', 'tree', 'urn', 'diya', 'tree'], ponds: true, shafts: true,
  },
  {
    id: 'ranabhumi', name: 'Swarna Ranabhumi', sub: 'The Golden Field of the Fallen · Rings III–IV', music: 'r1',
    floor: '#9a7440', floor2: '#5e4222', grout: '#4a3018', tile: 'earth',
    accent: '#ff9a1a', accent2: '#d8283a', wall: '#2a1408', wallStone: '#9a7a50',
    leaf: '#d0a030', leaf2: '#8a5a10', flower: '#ff8a10', flower2: '#ffd23a', stone: '#c8a878',
    ambient: 'embers', light: '#ffc070', tint: 'rgba(255,150,60,0.06)', vignette: 'rgba(40,10,0,0.55)',
    props: ['rubble', 'pillar', 'diya', 'rubble', 'urn'], shafts: true, sky: true,
  },
  {
    id: 'patala', name: 'Patala', sub: 'The Serpent Deep · Rings V–VI', music: 'r2',
    floor: '#262058', floor2: '#120e34', grout: '#0a0824', tile: 'gem',
    accent: '#7affc8', accent2: '#b68cff', wall: '#06041a', wallStone: '#3a3a6a',
    leaf: '#1f6a8a', leaf2: '#122a5a', flower: '#7affc8', flower2: '#c8a0ff', stone: '#5a5a90', glow: '#7affc8',
    ambient: 'spores', light: '#7affc8', tint: 'rgba(60,40,140,0.08)', vignette: 'rgba(0,0,20,0.65)',
    props: ['statue', 'crystal', 'pillar', 'crystal'], ponds: true, water: '#1a4a8a',
  },
  {
    id: 'garbha', name: 'Garbha', sub: 'The Heart of the Wheel · Ring VII', music: 'r3',
    floor: '#1a1a4a', floor2: '#0a0a24', grout: '#3a2a10', tile: 'cosmic',
    accent: '#ffcf4a', accent2: '#ff6a8a', wall: '#030312', wallStone: '#2a2a5a',
    leaf: '#4a2a8a', leaf2: '#1a1050', flower: '#ffcf4a', flower2: '#ff8ab8', stone: '#4a4a80',
    ambient: 'motes', light: '#ffcf4a', tint: 'rgba(80,60,160,0.06)', vignette: 'rgba(0,0,15,0.6)',
    props: ['obelisk', 'diya', 'pillar'],
  },
];
M.HUB_REGION = {
  id: 'hub', name: 'The Court of Yama', sub: 'On the bank of the Vaitarani', music: 'hub',
  floor: '#3a2030', floor2: '#160a14', grout: '#0c040a', tile: 'court',
  accent: '#c43c3c', accent2: '#e6b84a', wall: '#06020a', wallStone: '#4a2a3a',
  leaf: '#4a1a3a', leaf2: '#1e0a1a', flower: '#ff4a5a', flower2: '#ffd96a', stone: '#5a4050',
  ambient: 'lamps', light: '#ffb060', tint: 'rgba(255,120,80,0.04)', vignette: 'rgba(10,0,10,0.55)',
  props: [],
};

(() => {
  const TAU = Math.PI * 2;
  const W = (M.world = M.world || {});
  W.MARGIN = 380;

  const leafCluster = (ctx, x, y, size, rng, reg, dark = 0) => {
    const n = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < n; i++) {
      const a = rng() * TAU, len = size * (0.6 + rng() * 0.7);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, len, 0);
      const base = rng() < 0.5 ? reg.leaf : reg.leaf2;
      g.addColorStop(0, M.shade(base, -0.45 - dark)); g.addColorStop(0.6, M.shade(base, 0.05 - dark)); g.addColorStop(1, M.shade(base, 0.3 - dark));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.28, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.28, 0, 0); ctx.fill();
      ctx.strokeStyle = M.rgba(M.shade(base, 0.4), 0.35); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke();
      ctx.restore();
    }
  };
  const flower = (ctx, x, y, r, c1, c2, kind) => {
    if (kind === 'lotus') {
      for (let i = -2; i <= 2; i++) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(i * 0.45);
        ctx.fillStyle = M.shade(c1, Math.abs(i) * -0.1);
        ctx.beginPath(); ctx.moveTo(0, r * 0.4); ctx.quadraticCurveTo(-r * 0.5, -r * 0.2, 0, -r); ctx.quadraticCurveTo(r * 0.5, -r * 0.2, 0, r * 0.4); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#ffd96a'; ctx.beginPath(); ctx.arc(x, y + r * 0.1, r * 0.18, 0, TAU); ctx.fill();
    } else {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.fillStyle = i % 2 ? c1 : M.shade(c1, 0.15);
        ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.5, r * 0.32, a, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, TAU); ctx.fill();
    }
  };
  W.flower = flower;

  const mandala = (ctx, cx, cy, R, reg, rng, alpha = 0.22) => {
    ctx.save(); ctx.translate(cx, cy);
    ctx.scale(1, 0.78); // a touch of perspective
    const cols = [reg.accent, reg.accent2, M.shade(reg.floor, 0.35), '#ffffff'];
    const rings = 5;
    for (let k = rings; k >= 1; k--) {
      const r = (R * k) / rings;
      const n = 8 + k * 4;
      ctx.fillStyle = M.rgba(cols[k % cols.length], alpha * (0.6 + 0.08 * k));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + (k % 2 ? Math.PI / n : 0);
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(r * 0.7, 0); ctx.quadraticCurveTo(r * 0.85, -r * 0.14 * (4 / (k + 3)), r, 0); ctx.quadraticCurveTo(r * 0.85, r * 0.14 * (4 / (k + 3)), r * 0.7, 0); ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = M.rgba(cols[(k + 1) % cols.length], alpha * 0.9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, TAU); ctx.stroke();
      // dots
      ctx.fillStyle = M.rgba('#ffffff', alpha * 0.8);
      for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.02, Math.sin(a) * r * 1.02, 2.2, 0, TAU); ctx.fill(); }
    }
    ctx.fillStyle = M.rgba(reg.accent2, alpha * 1.6);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.08, 0, TAU); ctx.fill();
    ctx.restore();
  };
  W.mandala = mandala;

  W.paintFloor = (ctx, room, reg, rng) => {
    const { w, h } = room;
    ctx.save();
    M.rr(ctx, 0, 0, w, h, 70);
    ctx.clip();
    const g = ctx.createRadialGradient(w / 2, h * 0.45, 50, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, M.shade(reg.floor, 0.12)); g.addColorStop(0.6, reg.floor); g.addColorStop(1, reg.floor2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // tiles
    const T = reg.tile === 'court' ? 110 : reg.tile === 'earth' ? 0 : reg.tile === 'cosmic' ? 120 : 96;
    if (T) {
      // organic flagstones on a jittered grid
      const organic = reg.tile === 'moss' || reg.tile === 'gem';
      const TH = T * 0.72;
      const cols = Math.ceil(w / T) + 3, rows = Math.ceil(h / TH) + 2;
      const P = [];
      for (let j = 0; j <= rows; j++) {
        P[j] = [];
        for (let i = 0; i <= cols; i++) {
          const jit = organic ? T * 0.22 : 0;
          P[j][i] = [(i - 1) * T + (j % 2) * T * 0.5 + (rng() - 0.5) * jit, j * TH + (rng() - 0.5) * jit * 0.7];
        }
      }
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = P[j][i], b = P[j][i + 1], c = P[j + 1][i + 1], d = P[j + 1][i];
        const cx = (a[0] + c[0]) / 2, cy = (a[1] + c[1]) / 2;
        const v = (rng() - 0.5) * 0.22;
        const base = M.shade(reg.floor, v);
        const tg = ctx.createRadialGradient(cx - T * 0.15, cy - TH * 0.2, 4, cx, cy, T * 0.75);
        tg.addColorStop(0, M.rgba(M.shade(base, 0.12), 0.55)); tg.addColorStop(1, M.rgba(M.shade(base, -0.12), 0.55));
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.moveTo(a[0] + 2, a[1] + 2); ctx.lineTo(b[0] - 2, b[1] + 2); ctx.lineTo(c[0] - 2, c[1] - 2); ctx.lineTo(d[0] + 2, d[1] - 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = M.rgba(reg.grout, reg.tile === 'cosmic' ? 0.3 : 0.6); ctx.lineWidth = reg.tile === 'cosmic' ? 1 : 2.5;
        ctx.stroke();
        // top-left highlight edge for a bevelled look
        ctx.strokeStyle = M.rgba('#ffffff', 0.06); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d[0] + 3, d[1] - 3); ctx.lineTo(a[0] + 3, a[1] + 3); ctx.lineTo(b[0] - 3, b[1] + 3); ctx.stroke();
        if (reg.tile === 'moss' && rng() < 0.35) { // moss creeping in the joints
          ctx.strokeStyle = M.rgba(M.shade(reg.leaf, 0.1), 0.55); ctx.lineWidth = 3 + rng() * 4;
          ctx.beginPath(); ctx.moveTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
        }
        if (reg.tile === 'court' && rng() < 0.18) { ctx.strokeStyle = M.rgba(reg.accent2, 0.16); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, TAU); ctx.stroke(); for (let k = 0; k < 8; k++) { const ka = (k / 8) * TAU; ctx.beginPath(); ctx.arc(cx + Math.cos(ka) * 16, cy + Math.sin(ka) * 16, 3, 0, TAU); ctx.stroke(); } }
        if (reg.tile === 'cosmic' && rng() < 0.12) { ctx.strokeStyle = M.rgba(reg.accent, 0.22); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx, cy - 10); ctx.lineTo(cx + 10, cy); ctx.lineTo(cx, cy + 10); ctx.closePath(); ctx.stroke(); }
      }
      if (reg.tile === 'moss') for (let i = 0; i < 26; i++) { ctx.fillStyle = M.rgba(reg.leaf, 0.22 + rng() * 0.15); ctx.beginPath(); ctx.ellipse(rng() * w, rng() * h, 30 + rng() * 60, 14 + rng() * 26, rng() * 3, 0, TAU); ctx.fill(); }
    }
    if (reg.tile === 'earth') {
      for (let i = 0; i < 260; i++) {
        const x = rng() * w, y = rng() * h;
        ctx.fillStyle = M.rgba(rng() < 0.5 ? '#ffe0a0' : '#3a2010', 0.06 + rng() * 0.08);
        ctx.beginPath(); ctx.ellipse(x, y, 20 + rng() * 60, 8 + rng() * 20, rng() * 0.4, 0, TAU); ctx.fill();
      }
      // golden grass tufts
      for (let i = 0; i < 160; i++) {
        const x = rng() * w, y = rng() * h;
        ctx.strokeStyle = M.rgba(rng() < 0.5 ? '#ffd060' : '#c89030', 0.5); ctx.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + k * 2, y); ctx.quadraticCurveTo(x + k * 2 + 3, y - 6, x + k * 3 - 2, y - 10 - rng() * 6); ctx.stroke(); }
      }
      // scattered marigold petals
      for (let i = 0; i < 90; i++) { ctx.fillStyle = M.rgba(rng() < 0.6 ? '#ff9a1a' : '#ffd23a', 0.7); ctx.beginPath(); ctx.ellipse(rng() * w, rng() * h, 3, 2, rng() * 3, 0, TAU); ctx.fill(); }
    }
    if (reg.tile === 'gem') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) {
        let x = rng() * w, y = rng() * h;
        ctx.strokeStyle = M.rgba(rng() < 0.5 ? reg.accent : reg.accent2, 0.25); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) { x += (rng() - 0.5) * 90; y += (rng() - 0.5) * 60; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      for (let i = 0; i < 60; i++) { M.art.glow(ctx, rng() * w, rng() * h, 6 + rng() * 10, rng() < 0.5 ? reg.accent : reg.accent2, 0.35); }
      ctx.restore();
    }
    if (reg.tile === 'cosmic') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 400; i++) { ctx.fillStyle = M.rgba(rng() < 0.8 ? '#ffffff' : reg.accent, 0.2 + rng() * 0.5); ctx.fillRect(rng() * w, rng() * h, 1.5, 1.5); }
      for (let i = 0; i < 6; i++) M.art.glow(ctx, rng() * w, rng() * h, 120 + rng() * 140, rng() < 0.5 ? '#5a3aaa' : '#aa3a7a', 0.12);
      // spiral inlay
      ctx.strokeStyle = M.rgba(reg.accent, 0.22); ctx.lineWidth = 3;
      ctx.beginPath();
      for (let a = 0; a < TAU * 4; a += 0.05) { const r = 20 + a * 34; ctx.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r * 0.78); }
      ctx.stroke();
      ctx.restore();
    }
    // central rangoli
    if (room.kind !== 'hub') mandala(ctx, w / 2, h * 0.55, Math.min(w, h) * 0.28, reg, rng, room.kind === 'boss' ? 0.3 : 0.2);
    // scattered flowers & petals on the floor
    if (reg.tile === 'moss') for (let i = 0; i < 40; i++) { ctx.fillStyle = M.rgba(rng() < 0.6 ? reg.flower : '#ffffff', 0.55); ctx.beginPath(); ctx.ellipse(rng() * w, rng() * h, 4, 2.4, rng() * 3, 0, TAU); ctx.fill(); }
    // dappled light through the canopy
    if (reg.shafts) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 22; i++) M.art.glow(ctx, rng() * w, rng() * h, 40 + rng() * 80, reg.light, 0.035 + rng() * 0.04);
      ctx.restore();
    }
    // edge gardens: grasses, ferns & flowers creeping onto the stone
    if (room.kind !== 'hub') {
      const tuft = (x, y, s) => {
        ctx.strokeStyle = M.rgba(M.shade(reg.leaf, rng() * 0.3 - 0.1), 0.9); ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.22 + (rng() - 0.5) * 0.2; const L = s * (0.6 + rng() * 0.6); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 3, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
      };
      const kindF = reg.tile === 'moss' ? 'lotus' : 'marigold';
      const perim = [];
      for (let x = 30; x < w - 30; x += 34) { perim.push([x, 8 + rng() * 40]); perim.push([x, h - 8 - rng() * 40]); }
      for (let y = 40; y < h - 30; y += 34) { perim.push([8 + rng() * 40, y]); perim.push([w - 8 - rng() * 40, y]); }
      for (const [x, y] of perim) {
        const r = rng();
        if (r < 0.45) tuft(x, y, 18 + rng() * 14);
        else if (r < 0.7) leafCluster(ctx, x, y, 20 + rng() * 12, rng, reg, -0.05);
        if (rng() < 0.3) flower(ctx, x + (rng() - 0.5) * 20, y + (rng() - 0.5) * 14, 6 + rng() * 4, reg.flower, reg.flower2, kindF);
      }
      // a few islands of growth in the open floor
      for (let i = 0; i < 9; i++) {
        const x = 120 + rng() * (w - 240), y = 160 + rng() * (h - 300);
        for (let k = 0; k < 4; k++) tuft(x + (rng() - 0.5) * 40, y + (rng() - 0.5) * 20, 12 + rng() * 10);
        if (rng() < 0.6) flower(ctx, x, y - 6, 6, reg.flower, reg.flower2, kindF);
      }
    }
    // ambient occlusion at the edges
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.07})`; ctx.lineWidth = 12 + i * 12;
      M.rr(ctx, 0, 0, w, h, 70); ctx.stroke();
    }
    ctx.restore();
  };

  W.paintPond = (ctx, p, reg, rng) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const rx = p.r * 1.25, ry = p.r * 0.85;
    // stone rim
    ctx.fillStyle = M.shade(reg.stone, -0.25);
    ctx.beginPath(); ctx.ellipse(0, 4, rx + 16, ry + 14, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = reg.stone;
    ctx.beginPath(); ctx.ellipse(0, 0, rx + 12, ry + 10, 0, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 5, 0, 0, rx);
    g.addColorStop(0, M.shade(reg.water || '#1f8aa0', 0.3)); g.addColorStop(1, M.shade(reg.water || '#1f8aa0', -0.45));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
    // lily pads + lotus
    for (let i = 0; i < 7; i++) {
      const a = rng() * TAU, d = rng() * 0.75;
      const x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d;
      const r = 12 + rng() * 10;
      ctx.fillStyle = M.shade(reg.leaf, rng() * 0.2 - 0.1);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, 0.3, TAU - 0.1); ctx.closePath(); ctx.fill();
      if (rng() < 0.6) flower(ctx, x + 2, y - 4, 11, reg.flower, reg.flower2, 'lotus');
    }
    ctx.restore();
  };

  // carved back wall along the top of the room
  W.paintBackWall = (ctx, room, reg, rng) => {
    const { w } = room;
    const H = 190;
    const st = reg.wallStone;
    ctx.save();
    ctx.fillStyle = lg(ctx, 0, -H, 0, 0, [[0, M.shade(st, -0.55)], [0.6, M.shade(st, -0.2)], [1, M.shade(st, -0.45)]]);
    ctx.fillRect(-40, -H, w + 80, H + 10);
    // frieze bands
    ctx.fillStyle = M.shade(st, -0.05); ctx.fillRect(-40, -H + 26, w + 80, 16);
    ctx.fillStyle = M.rgba(reg.accent2, 0.6); ctx.fillRect(-40, -H + 32, w + 80, 3);
    ctx.fillStyle = M.shade(st, -0.1); ctx.fillRect(-40, -22, w + 80, 22);
    ctx.fillStyle = M.rgba(reg.accent, 0.5); ctx.fillRect(-40, -14, w + 80, 2);
    // niches with tiny carved figures
    for (let x = 30; x < w - 30; x += 120) {
      ctx.fillStyle = M.shade(st, -0.6);
      ctx.beginPath(); ctx.moveTo(x, -30); ctx.lineTo(x, -H + 80); ctx.quadraticCurveTo(x + 30, -H + 40, x + 60, -H + 80); ctx.lineTo(x + 60, -30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = M.rgba(reg.light, 0.08);
      ctx.beginPath(); ctx.ellipse(x + 30, -70, 16, 34, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = M.shade(st, -0.15);
      ctx.beginPath(); ctx.arc(x + 30, -96, 7, 0, TAU); ctx.fill();
      ctx.fillRect(x + 23, -88, 14, 30);
      ctx.fillRect(x + 18, -60, 24, 26);
      // pilaster
      ctx.fillStyle = M.shade(st, 0.05); ctx.fillRect(x + 72, -H + 40, 16, H - 62);
      ctx.fillStyle = M.rgba('#000000', 0.25); ctx.fillRect(x + 84, -H + 40, 4, H - 62);
    }
    // overhanging foliage atop the wall
    for (let x = -40; x < w + 60; x += 34) leafCluster(ctx, x, -H + 4 + rng() * 10, 44, rng, reg, 0.1);
    for (let x = 0; x < w; x += 70) if (rng() < 0.6) flower(ctx, x + rng() * 30, -H + 10 + rng() * 20, 9, reg.flower, reg.flower2, reg.tile === 'moss' ? 'lotus' : 'marigold');
    // hanging garlands / vines
    for (let x = 60; x < w; x += 180 + rng() * 120) {
      const len = 40 + rng() * 60;
      ctx.strokeStyle = M.rgba(reg.leaf, 0.9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, -H + 10); ctx.quadraticCurveTo(x + 8, -H + 10 + len * 0.5, x, -H + 10 + len); ctx.stroke();
      for (let k = 0; k < len; k += 9) { ctx.fillStyle = k % 18 ? reg.flower : reg.flower2; ctx.beginPath(); ctx.arc(x + Math.sin(k * 0.1) * 4, -H + 12 + k, 3.2, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  };
  const lg = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };

  W.paintBorder = (ctx, room, reg, rng) => {
    const { w, h } = room;
    const step = 46;
    // left & right
    for (let y = -60; y < h + 140; y += step) {
      for (let k = 0; k < 3; k++) {
        leafCluster(ctx, -20 - k * 70 - rng() * 30, y + rng() * 20, 60, rng, reg, k * 0.12);
        leafCluster(ctx, w + 20 + k * 70 + rng() * 30, y + rng() * 20, 60, rng, reg, k * 0.12);
      }
      if (rng() < 0.4) flower(ctx, -20 - rng() * 40, y, 9, reg.flower, reg.flower2, reg.tile === 'moss' ? 'lotus' : 'marigold');
      if (rng() < 0.4) flower(ctx, w + 20 + rng() * 40, y, 9, reg.flower, reg.flower2, reg.tile === 'moss' ? 'lotus' : 'marigold');
    }
    // bottom
    for (let x = -100; x < w + 120; x += step) {
      for (let k = 0; k < 3; k++) leafCluster(ctx, x + rng() * 20, h + 20 + k * 70 + rng() * 30, 60, rng, reg, k * 0.12);
    }
  };

  // build static background canvas for a room
  W.buildBackground = (room) => {
    const reg = room.region;
    const Mg = W.MARGIN;
    const c = M.makeCanvas(room.w + Mg * 2, room.h + Mg * 2);
    const ctx = c.getContext('2d');
    const rng = M.rng(room.seed || 1);
    // deep surround
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, M.shade(reg.wall, -0.2)); g.addColorStop(1, reg.wall);
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.translate(Mg, Mg);
    if (reg.sky) {
      const sg = ctx.createLinearGradient(0, -Mg, 0, -150);
      sg.addColorStop(0, '#3a0a2a'); sg.addColorStop(0.5, '#c8402a'); sg.addColorStop(1, '#ffb040');
      ctx.fillStyle = sg; ctx.fillRect(-Mg, -Mg, room.w + Mg * 2, Mg - 150);
      M.art.glow(ctx, room.w * 0.7, -230, 160, '#fff0a0', 0.8);
    }
    W.paintBorder(ctx, room, reg, rng);
    W.paintFloor(ctx, room, reg, rng);
    for (const o of room.obstacles) if (o.type === 'pond') W.paintPond(ctx, o, reg, rng);
    W.paintBackWall(ctx, room, reg, rng);
    if (room.paintExtra) room.paintExtra(ctx, rng);
    return c;
  };

  // foreground overhang (drawn above entities)
  W.buildForeground = (room) => {
    const reg = room.region;
    const Mg = W.MARGIN;
    const c = M.makeCanvas(room.w + Mg * 2, room.h + Mg * 2);
    const ctx = c.getContext('2d');
    const rng = M.rng((room.seed || 1) + 777);
    ctx.translate(Mg, Mg);
    for (let x = -120; x < room.w + 140; x += 38) leafCluster(ctx, x + rng() * 20, room.h + 34 + rng() * 26, 58, rng, reg, -0.05);
    for (let y = room.h * 0.15; y < room.h + 60; y += 60) {
      if (rng() < 0.5) leafCluster(ctx, -6 - rng() * 14, y, 54, rng, reg, -0.05);
      if (rng() < 0.5) leafCluster(ctx, room.w + 6 + rng() * 14, y, 54, rng, reg, -0.05);
    }
    for (let x = 0; x < room.w; x += 90) if (rng() < 0.5) flower(ctx, x + rng() * 40, room.h + 40 + rng() * 20, 10, reg.flower, reg.flower2, reg.tile === 'moss' ? 'lotus' : 'marigold');
    return c;
  };
})();
