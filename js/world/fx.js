'use strict';
// ───────────────────────────────────────────────────────────────
//  Particles & transient visual effects
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const FX = (M.fx = { list: [], ambient: [] });

  FX.clear = () => { FX.list.length = 0; FX.ambient.length = 0; };
  FX.add = (p) => {
    p.life = p.life ?? 0.6; p.t = 0;
    p.vx = p.vx || 0; p.vy = p.vy || 0;
    if (FX.list.length > 900) FX.list.shift();
    FX.list.push(p);
    return p;
  };
  FX.burst = (x, y, color, n = 10, opts = {}) => {
    for (let i = 0; i < n; i++) {
      const a = opts.dir !== undefined ? opts.dir + M.rand(-opts.spread || -0.6, opts.spread || 0.6) : M.rand(TAU);
      const sp = M.rand(opts.min ?? 80, opts.max ?? 320);
      FX.add({ type: opts.type || 'spark', x, y: y - (opts.z ?? 30), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: M.rand(0.25, opts.life ?? 0.6), size: M.rand(opts.smin ?? 2, opts.smax ?? 4), color, drag: opts.drag ?? 4, grav: opts.grav ?? 0, add: true });
    }
  };
  FX.text = (x, y, txt, color = '#ffffff', size = 22, opts = {}) => FX.add({ type: 'text', x: x + M.rand(-10, 10), y: y - 60, vy: -70, txt, color, size, life: opts.life ?? 0.9, crit: opts.crit, drag: 2 });
  FX.ring = (x, y, r, color, life = 0.4, width = 6) => FX.add({ type: 'ring', x, y, r0: r * 0.2, r, color, life, width });
  FX.slash = (x, y, ang, arc, range, color, life = 0.18, width = 1) => FX.add({ type: 'slash', x, y, ang, arc, range, color, life, width });
  FX.bolt = (x1, y1, x2, y2, color = '#cfefff', life = 0.22, w = 3) => {
    const pts = [];
    const n = Math.max(4, Math.floor(M.dist(x1, y1, x2, y2) / 22));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const off = i === 0 || i === n ? 0 : M.rand(-14, 14);
      const nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1;
      pts.push([M.lerp(x1, x2, t) + (nx / l) * off, M.lerp(y1, y2, t) + (ny / l) * off]);
    }
    FX.add({ type: 'bolt', pts, color, life, w });
  };
  FX.skybolt = (x, y, color = '#cfefff') => {
    FX.bolt(x + M.rand(-30, 30), y - 600, x, y - 10, color, 0.28, 4);
    FX.ring(x, y, 70, color, 0.3, 5);
    FX.burst(x, y, color, 12, { z: 6, max: 260 });
    FX.add({ type: 'flash', x, y, r: 120, color, life: 0.18 });
  };
  FX.beam = (x1, y1, x2, y2, color, life = 0.35, w = 30) => FX.add({ type: 'beam', x1, y1, x2, y2, color, life, w });
  FX.telegraphCircle = (x, y, r, life, color = '#ff3a3a') => FX.add({ type: 'tcircle', x, y, r, color, life, ground: true });
  FX.telegraphLine = (x1, y1, x2, y2, w, life, color = '#ff3a3a') => FX.add({ type: 'tline', x1, y1, x2, y2, w, color, life, ground: true });
  FX.decal = (x, y, r, color, life = 1.2) => FX.add({ type: 'decal', x, y, r, color, life, ground: true });

  FX.update = (dt) => {
    const L = FX.list;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.t += dt;
      if (p.t >= p.life) { L.splice(i, 1); continue; }
      if (p.drag) { const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy *= d; }
      if (p.grav) p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.vr) p.rot = (p.rot || 0) + p.vr * dt;
    }
  };

  // ground layer (decals & telegraphs), drawn under entities
  FX.drawGround = (ctx, time) => {
    for (const p of FX.list) {
      if (!p.ground) continue;
      const k = p.t / p.life;
      if (p.type === 'tcircle') {
        ctx.save();
        ctx.translate(p.x, p.y); ctx.scale(1, 0.62);
        ctx.fillStyle = M.rgba(p.color, 0.12 + k * 0.15);
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill();
        ctx.fillStyle = M.rgba(p.color, 0.28);
        ctx.beginPath(); ctx.arc(0, 0, p.r * k, 0, TAU); ctx.fill();
        ctx.strokeStyle = M.rgba(p.color, 0.8); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.stroke();
        ctx.restore();
      } else if (p.type === 'tline') {
        ctx.save();
        const a = Math.atan2(p.y2 - p.y1, p.x2 - p.x1), L = M.dist(p.x1, p.y1, p.x2, p.y2);
        ctx.translate(p.x1, p.y1); ctx.rotate(a);
        ctx.fillStyle = M.rgba(p.color, 0.12 + k * 0.12);
        ctx.fillRect(0, -p.w / 2, L, p.w);
        ctx.fillStyle = M.rgba(p.color, 0.3);
        ctx.fillRect(0, -p.w / 2, L * k, p.w);
        ctx.strokeStyle = M.rgba(p.color, 0.7); ctx.lineWidth = 2;
        ctx.strokeRect(0, -p.w / 2, L, p.w);
        ctx.restore();
      } else if (p.type === 'decal') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.6);
        ctx.fillStyle = M.rgba(p.color, 0.35 * (1 - k));
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
  };

  FX.draw = (ctx, time) => {
    for (const p of FX.list) {
      if (p.ground) continue;
      const k = p.t / p.life, inv = 1 - k;
      switch (p.type) {
        case 'spark': {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = M.rgba(p.color, inv);
          const sp = Math.hypot(p.vx, p.vy) * 0.03 + 1;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.fillRect(-p.size * sp, -p.size / 2, p.size * sp * 2, p.size);
          ctx.restore();
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 'glow': {
          ctx.globalCompositeOperation = 'lighter';
          M.art.glow(ctx, p.x, p.y, p.size * (p.grow ? 1 + k * p.grow : 1), p.color, inv * (p.alpha ?? 0.8));
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 'smoke': {
          ctx.fillStyle = M.rgba(p.color, inv * (p.alpha ?? 0.35));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + k * 1.5), 0, TAU); ctx.fill();
          break;
        }
        case 'petal': {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
          ctx.fillStyle = M.rgba(p.color, Math.min(1, inv * 2));
          ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, TAU); ctx.fill();
          ctx.restore();
          break;
        }
        case 'text': {
          const s = p.size * (p.crit ? 1 + Math.max(0, 0.6 - k * 3) : 1) * (k < 0.1 ? 0.6 + k * 4 : 1);
          ctx.font = `700 ${s}px "Cinzel", Georgia, serif`;
          ctx.textAlign = 'center';
          ctx.lineWidth = 4; ctx.strokeStyle = `rgba(20,0,10,${inv * 0.9})`;
          ctx.strokeText(p.txt, p.x, p.y);
          ctx.fillStyle = M.rgba(p.color, Math.min(1, inv * 1.8));
          ctx.fillText(p.txt, p.x, p.y);
          break;
        }
        case 'ring': {
          ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.62);
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = M.rgba(p.color, inv * 0.9); ctx.lineWidth = p.width * inv + 1;
          ctx.beginPath(); ctx.arc(0, 0, M.lerp(p.r0, p.r, M.ease.outCubic(k)), 0, TAU); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'slash': {
          ctx.save(); ctx.translate(p.x, p.y - 30);
          ctx.globalCompositeOperation = 'lighter';
          const a0 = p.ang - p.arc / 2, a1 = p.ang + p.arc / 2;
          const sweep = M.ease.outCubic(Math.min(1, k * 2.2));
          const aEnd = M.lerp(a0, a1, sweep);
          const r = p.range;
          ctx.fillStyle = M.rgba(p.color, inv * 0.55);
          ctx.beginPath(); ctx.arc(0, 0, r, a0, aEnd); ctx.arc(0, 0, r * (0.55 + 0.1 * p.width), aEnd, a0, true); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = M.rgba('#ffffff', inv * 0.9); ctx.lineWidth = 3 * p.width;
          ctx.beginPath(); ctx.arc(0, 0, r, a0 + (aEnd - a0) * 0.3, aEnd); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'bolt': {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const [lw, al] of [[p.w * 4, 0.25], [p.w, 1]]) {
            ctx.strokeStyle = M.rgba(lw > p.w ? p.color : '#ffffff', inv * al); ctx.lineWidth = lw; ctx.lineJoin = 'round';
            ctx.beginPath(); p.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
          }
          ctx.restore();
          break;
        }
        case 'flash': {
          ctx.globalCompositeOperation = 'lighter';
          M.art.glow(ctx, p.x, p.y - 30, p.r, p.color, inv);
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 'beam': {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const a = Math.atan2(p.y2 - p.y1, p.x2 - p.x1), L = M.dist(p.x1, p.y1, p.x2, p.y2);
          ctx.translate(p.x1, p.y1 - 30); ctx.rotate(a);
          const w = p.w * (k < 0.15 ? k / 0.15 : inv);
          const g = ctx.createLinearGradient(0, -w, 0, w);
          g.addColorStop(0, M.rgba(p.color, 0)); g.addColorStop(0.5, M.rgba('#ffffff', 0.95)); g.addColorStop(1, M.rgba(p.color, 0));
          ctx.fillStyle = g; ctx.fillRect(0, -w, L, w * 2);
          ctx.fillStyle = M.rgba(p.color, 0.5 * inv); ctx.fillRect(0, -w * 1.8, L, w * 3.6);
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  // ── ambient atmosphere per region ───────────────────────────────
  FX.initAmbient = (room) => {
    FX.ambient.length = 0;
    const reg = room.region;
    const n = reg.ambient === 'lamps' ? 60 : 70;
    for (let i = 0; i < n; i++) FX.ambient.push(newAmb(reg, room, true));
  };
  function newAmb(reg, room, scatter) {
    const x = M.rand(-200, room.w + 200), y = scatter ? M.rand(-200, room.h + 100) : -220;
    switch (reg.ambient) {
      case 'petals': return { k: 'petal', x, y, vx: M.rand(20, 50), vy: M.rand(25, 55), rot: M.rand(TAU), vr: M.rand(-2, 2), size: M.rand(4, 7), color: M.pick(['#ff8ab8', '#ffd0e0', '#ffffff', '#ff6aa0']), ph: M.rand(TAU) };
      case 'embers': return { k: 'ember', x, y: scatter ? y : room.h + 150, vx: M.rand(-15, 25), vy: -M.rand(25, 70), size: M.rand(1.5, 3.2), color: M.pick(['#ffb040', '#ff7a1a', '#ffe08a']), ph: M.rand(TAU) };
      case 'spores': return { k: 'spore', x, y, vx: M.rand(-10, 10), vy: -M.rand(5, 20), size: M.rand(2, 4), color: M.pick(['#7affc8', '#b68cff', '#9fdfff']), ph: M.rand(TAU) };
      case 'motes': return { k: 'mote', x, y, vx: M.rand(-12, 12), vy: -M.rand(8, 22), size: M.rand(1.5, 3), color: M.pick(['#ffcf4a', '#ffffff', '#ff8ab8']), ph: M.rand(TAU) };
      default: return { k: 'firefly', x, y, vx: M.rand(-10, 10), vy: M.rand(-10, 10), size: M.rand(1.5, 3), color: M.pick(['#ffb060', '#ffd080']), ph: M.rand(TAU) };
    }
  }
  FX.updateAmbient = (dt, room, time) => {
    for (const a of FX.ambient) {
      a.x += (a.vx + Math.sin(time * 0.8 + a.ph) * 14) * dt;
      a.y += a.vy * dt;
      if (a.vr) a.rot += a.vr * dt;
      if (a.y > room.h + 220 || a.y < -260 || a.x > room.w + 260 || a.x < -260) Object.assign(a, newAmb(room.region, room, false), a.k === 'ember' || a.k === 'spore' || a.k === 'mote' ? { y: room.h + 150, x: M.rand(-200, room.w + 200) } : {});
    }
  };
  FX.drawAmbient = (ctx, time) => {
    for (const a of FX.ambient) {
      if (a.k === 'petal') {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
        ctx.scale(1, Math.abs(Math.sin(time * 2 + a.ph)) * 0.7 + 0.3);
        ctx.fillStyle = M.rgba(a.color, 0.85);
        ctx.beginPath(); ctx.ellipse(0, 0, a.size, a.size * 0.55, 0, 0, TAU); ctx.fill();
        ctx.restore();
      } else {
        ctx.globalCompositeOperation = 'lighter';
        const fl = 0.5 + Math.sin(time * 3 + a.ph) * 0.5;
        M.art.glow(ctx, a.x, a.y, a.size * 5, a.color, 0.35 + fl * 0.4);
        ctx.fillStyle = M.rgba('#ffffff', 0.6 * fl);
        ctx.fillRect(a.x - 0.8, a.y - 0.8, 1.6, 1.6);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };
})();
