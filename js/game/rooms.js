'use strict';
// ───────────────────────────────────────────────────────────────
//  Room generation, doors, pickups & interactables
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const R = (M.rooms = {});
  const PROP_R = { pillar: 30, tree: 34, urn: 22, diya: 14, rubble: 38, statue: 28, crystal: 24, obelisk: 24 };
  const LIGHT = { diya: '#ffb040', crystal: null, statue: null, obelisk: '#ffcf4a' };

  R.blank = (kind, region, w, h) => ({
    kind, region, w, h, seed: M.randi(1, 1e9),
    obstacles: [], enemies: [], projs: [], zones: [], pickups: [], interactables: [], doors: [], npcs: [],
    waves: [], waveIdx: 0, cleared: false, rewardTaken: false, t: 0, lights: [],
  });

  R.placeProps = (room, n) => {
    const reg = room.region;
    const tries = 200;
    const sp = { x: room.w / 2, y: room.h - 130 };
    if (reg.ponds && M.chance(0.65)) {
      const np = M.chance(0.4) ? 2 : 1;
      for (let i = 0; i < np; i++) {
        const left = i === 0 ? M.chance(0.5) : !room.obstacles[0] || room.obstacles[0].x > room.w / 2;
        const r = M.randi(80, 115);
        room.obstacles.push({ type: 'pond', flat: true, x: left ? M.randi(230, 360) : room.w - M.randi(230, 360), y: M.randi(room.h * 0.35, room.h * 0.7), r });
      }
    }
    for (let i = 0, k = 0; i < n && k < tries; k++) {
      const type = M.pick(reg.props);
      const x = M.randi(150, room.w - 150), y = M.randi(240, room.h - 220);
      const r = PROP_R[type];
      if (M.dist(x, y, sp.x, sp.y) < 260) continue;
      if (Math.abs(x - room.w / 2) < 200 && Math.abs(y - room.h * 0.55) < 160 && M.chance(0.7)) continue;
      if (room.obstacles.some((o) => M.dist(x, y, o.x, o.y) < o.r + r + 170)) continue;
      room.obstacles.push({ type, x, y, r, h: M.randi(130, 170), seed: M.randi(1, 1e6) });
      if (LIGHT[type] !== undefined) room.lights.push({ x, y: y - (type === 'diya' ? 85 : 140), color: LIGHT[type] || reg.glow || reg.light, r: 140 });
      if (type === 'crystal' || type === 'statue') room.lights.push({ x, y: y - 60, color: reg.glow || '#7affc8', r: 160 });
      i++;
    }
    // symmetric lamps by the back wall
    for (const x of [room.w * 0.1, room.w * 0.9]) { room.obstacles.push({ type: 'diya', x, y: 70, r: 14 }); room.lights.push({ x, y: -15, color: '#ffb040', r: 160 }); }
  };

  R.finish = (room) => {
    room.bg = M.world.buildBackground(room);
    room.fg = M.world.buildForeground(room);
  };

  // ── doors ─────────────────────────────────────────────────────
  R.makeDoors = (room, rewards) => {
    const n = rewards.length;
    room.doors = rewards.map((rw, i) => ({ x: room.w * ((i + 1) / (n + 1)), y: 0, w: 120, reward: rw, open: false, openT: 0 }));
  };
  R.drawDoors = (ctx, room, t) => {
    for (const d of room.doors) {
      const reg = room.region;
      ctx.save(); ctx.translate(d.x, d.y);
      const k = d.open ? Math.min(1, d.openT * 2) : 0;
      // arch frame
      ctx.fillStyle = M.shade(reg.wallStone, -0.15);
      ctx.beginPath(); ctx.moveTo(-74, 4); ctx.lineTo(-74, -120); ctx.quadraticCurveTo(0, -205, 74, -120); ctx.lineTo(74, 4); ctx.lineTo(56, 4); ctx.lineTo(56, -112); ctx.quadraticCurveTo(0, -180, -56, -112); ctx.lineTo(-56, 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = M.rgba(reg.accent2, 0.8); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-66, 0); ctx.lineTo(-66, -118); ctx.quadraticCurveTo(0, -194, 66, -118); ctx.lineTo(66, 0); ctx.stroke();
      // opening
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-56, 4); ctx.lineTo(-56, -112); ctx.quadraticCurveTo(0, -180, 56, -112); ctx.lineTo(56, 4); ctx.closePath(); ctx.clip();
      const col = d.reward.kind === 'boon' ? M.GODS[d.reward.god].color : M.art.iconColor(d.reward.kind);
      const g = ctx.createLinearGradient(0, -170, 0, 0);
      g.addColorStop(0, M.rgba(M.mix(col, '#000000', 0.5), 0.9)); g.addColorStop(1, M.rgba('#05020a', 1));
      ctx.fillStyle = d.open ? g : '#05020a'; ctx.fillRect(-60, -190, 120, 200);
      if (d.open) {
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, -60, 120, col, 0.5 + Math.sin(t * 3) * 0.1);
        for (let i = 0; i < 5; i++) { const yy = -((t * 60 + i * 40) % 200); ctx.fillStyle = M.rgba(col, 0.4); ctx.fillRect(-40 + i * 18, yy, 2, 14); }
        ctx.globalCompositeOperation = 'source-over';
      }
      // door leaves
      const slide = k * 56;
      ctx.fillStyle = M.shade(reg.wallStone, -0.4);
      ctx.fillRect(-56 - slide, -190, 56, 196); ctx.fillRect(slide, -190, 56, 196);
      ctx.strokeStyle = M.rgba(reg.accent2, 0.6); ctx.lineWidth = 2;
      ctx.strokeRect(-50 - slide, -160, 44, 150); ctx.strokeRect(6 + slide, -160, 44, 150);
      ctx.restore();
      // reward orb
      const oy = -232 + Math.sin(t * 2 + d.x) * 6;
      M.art.orb(ctx, d.reward.kind === 'boon' ? d.reward.god : d.reward.kind, 0, oy, 26, t);
      if (!d.open) { ctx.fillStyle = 'rgba(5,0,10,0.45)'; ctx.beginPath(); ctx.arc(0, oy, 27, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
  };

  // ── pickups ───────────────────────────────────────────────────
  R.spawnPickup = (room, kind, x, y, extra = {}) => {
    const p = Object.assign({ kind, x, y, t: 0, r: 34, taken: false }, extra);
    room.pickups.push(p);
    M.fx.ring(x, y, 120, M.art.iconColor(extra.god || kind), 0.6, 8);
    M.fx.burst(x, y, M.art.iconColor(extra.god || kind), 26, { z: 50, max: 380 });
    M.audio.sfx('bell', { vol: 0.6 });
    return p;
  };
  R.drawPickup = (ctx, p, t) => {
    const k = p.kind === 'boon' ? p.god : p.kind;
    const col = M.art.iconColor(k);
    const bob = Math.sin(t * 2.5 + p.x) * 6;
    M.art.shadow(ctx, p.x, p.y, 26, 9, 0.3);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);
    ctx.save(); ctx.scale(1, 0.4); ctx.rotate(t * 0.8);
    ctx.strokeStyle = M.rgba(col, 0.6); ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(0, 0, 44, i, i + 0.6); ctx.stroke(); }
    ctx.restore();
    for (let i = 0; i < 3; i++) { const yy = -((t * 50 + i * 30) % 90); M.art.glow(ctx, Math.sin(t * 3 + i) * 14, yy, 10, col, 0.6); }
    ctx.restore();
    M.art.orb(ctx, k, p.x, p.y - 54 + bob, 30, t);
    if (p.price !== undefined) {
      ctx.font = '700 18px Cinzel, serif'; ctx.textAlign = 'center';
      const can = M.game.run && M.game.run.kauri >= p.price;
      ctx.fillStyle = 'rgba(10,0,10,0.75)'; M.rr(ctx, p.x - 42, p.y + 14, 84, 26, 8); ctx.fill();
      ctx.fillStyle = can ? '#ffe9c8' : '#a06060';
      ctx.fillText(p.price + ' ◉', p.x, p.y + 33);
    }
  };

  // ── encounter planning ────────────────────────────────────────
  R.planWaves = (room, regionIdx, roomNo, wins) => {
    const pool = M.REGION_POOLS[regionIdx];
    let budget = 5 + regionIdx * 3.2 + roomNo * 1.15 + Math.min(wins, 4) * 0.8;
    const waves = budget < 8.5 ? 1 : budget < 13 ? 2 : 3;
    const out = [];
    let elites = 0;
    const eliteChance = 0.04 + regionIdx * 0.07 + roomNo * 0.025 + wins * 0.03;
    for (let w = 0; w < waves; w++) {
      let b = budget / waves + (w === waves - 1 ? 1 : 0);
      const list = [];
      let guard = 50;
      while (b > 0.9 && guard-- > 0) {
        const opts = pool.filter((id) => M.ENEMIES[id].pts <= b + 0.5);
        if (!opts.length) break;
        const id = M.pick(opts);
        const def = M.ENEMIES[id];
        const elite = elites < 1 + Math.floor(regionIdx / 2) && def.pts >= 2 && M.chance(eliteChance);
        if (elite) elites++;
        list.push({ id, elite });
        b -= def.pts * (elite ? 1.8 : 1);
      }
      out.push(list);
    }
    room.waves = out;
    room.depthScale = 1 + regionIdx * 0.22 + roomNo * 0.03 + wins * 0.06;
  };

  R.spawnWave = (room, list) => {
    const g = M.game, pl = g.player;
    list.forEach((s, i) => {
      let x, y, tries = 0;
      do {
        x = M.randi(120, room.w - 120); y = M.randi(160, room.h - 140); tries++;
      } while (tries < 40 && (M.dist(x, y, pl.x, pl.y) < 360 || g.blocked(x, y, 40)));
      const e = new M.Enemy(s.id, x, y, { elite: s.elite, depthScale: room.depthScale, spawnDelay: 0.7 + i * 0.08 });
      e.room = room;
      room.enemies.push(e);
    });
  };
})();
