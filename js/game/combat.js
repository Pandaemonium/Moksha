'use strict';
// ───────────────────────────────────────────────────────────────
//  Combat core: damage, status effects, projectiles, zones
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const C = (M.combat = {});
  const G = () => M.game;

  C.enemiesNear = (x, y, r, exclude) => G().room.enemies.filter((e) => !e.dead && e.active && e !== exclude && M.dist2(x, y, e.x, e.y) <= (r + e.r) * (r + e.r));
  C.nearestEnemy = (x, y, maxR = 99999, exclude) => {
    let best = null, bd = maxR * maxR;
    for (const e of G().room.enemies) {
      if (e.dead || !e.active || (exclude && exclude.has(e))) continue;
      const d = M.dist2(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  };

  // ── player → enemy ─────────────────────────────────────────────
  C.hit = (e, base, o = {}) => {
    const g = G(), p = g.player, m = p.mods;
    if (e.dead || !e.active) return 0;
    if (e.invuln) {
      if (!e._immT || g.time - e._immT > 0.5) { M.fx.text(e.x, e.y - 20, 'Immune', '#cfe0ff', 18); e._immT = g.time; M.audio.sfx('block'); }
      return 0;
    }
    // shield-bearers block from the front
    if (e.def && e.def.shield && !e.stunned && e.state === 'idle' && o.src !== 'status' && o.src !== 'lightning' && o.x !== undefined) {
      const a = M.angle(e.x, e.y, o.x, o.y);
      if (Math.abs(M.angDiff(e.face, a)) < 1.1) {
        M.fx.text(e.x, e.y - 20, 'Blocked', '#ffd24a', 18);
        M.fx.burst(e.x + Math.cos(e.face) * 20, e.y, '#ffe08a', 6, { z: 36 });
        M.audio.sfx('block');
        e.flash = 0.3;
        return 0;
      }
    }
    let mult = 1 + m.allDmg;
    if (o.src && m.dmg[o.src]) mult *= m.dmg[o.src];
    if (e.big) mult += m.bigDmg;
    if (p.hp < p.maxHp * 0.5) mult += m.lowHpDmg;
    if (e.status.static > 0) mult += m.staticVuln;
    if ((e.status.soak > 0 || e.status.bind > 0) && m.soakVuln) mult += m.soakVuln;
    if (o.src === 'lightning' && m.flags.monsoon && e.status.soak > 0) mult *= 2;
    let dmg = base * mult;
    let crit = false;
    if (!o.noCrit) {
      let cc = m.critChance + (o.crit || 0);
      if (o.src === 'special') cc += m.specialCrit;
      if (e.status.glare > 0) cc += m.glareCrit;
      if (Math.random() < cc) { crit = true; dmg *= m.critMult; }
    }
    dmg = Math.max(1, Math.round(dmg));
    // armour absorbs first
    let toHp = dmg;
    if (e.armor > 0) {
      const a = Math.min(e.armor, dmg);
      e.armor -= a; toHp = dmg - a;
      if (e.armor <= 0) {
        e.armor = 0;
        M.fx.text(e.x, e.y - 40, 'Armour Broken!', '#9fc8ff', 20);
        M.fx.burst(e.x, e.y, '#cfe0ff', 20, { z: 40, max: 400 });
        M.audio.sfx('block', { vol: 1.2 });
        e.stun = Math.max(e.stun || 0, e.isBoss ? 0.6 : 1.2);
      }
    }
    e.hp -= toHp;
    e.flash = 1;
    e.lastHitT = g.time;
    // presentation
    const col = crit ? '#ffe14a' : o.color || (o.src === 'status' ? '#ff9a4a' : '#ffffff');
    if (M.save.data.settings.damageNumbers) M.fx.text(e.x, e.y - e.visH * 0.5, (crit ? '' : '') + dmg, col, crit ? 30 : o.src === 'status' ? 16 : 22, { crit });
    if (o.src !== 'status') {
      const hc = o.color || '#ffffff';
      M.fx.burst(e.x, e.y, hc, crit ? 14 : 7, { z: e.visH * 0.45, max: crit ? 420 : 300 });
      M.audio.sfx(crit ? 'crit' : o.heavy ? 'hitHeavy' : 'hit', { pitch: M.rand(0.9, 1.15), minGap: 0.02 });
      if (!o.noStop) g.hitstop = Math.max(g.hitstop, crit ? 0.07 : o.heavy ? 0.06 : 0.035);
      if (crit) g.shake(6);
    }
    if (crit && m.flags.critHeal) p.heal(1, true);
    // knockback
    if (o.kb && !e.heavy && !e.isBoss) {
      const a = M.angle(o.x ?? p.x, o.y ?? p.y, e.x, e.y);
      const f = o.kb * (e.def && e.def.r > 30 ? 0.4 : 1);
      e.kbx += Math.cos(a) * f; e.kby += Math.sin(a) * f;
    }
    if (o.stun) e.stun = Math.max(e.stun || 0, o.stun * (e.isBoss ? 0.25 : 1));
    // on-hit effects
    if (o.fx) for (const f of o.fx) C.applyFx(e, f, o);
    if (o.src === 'lightning') {
      if (m.staticVuln) e.status.static = 4;
      if (m.flags.lightningBurns) C.addBurn(e, 1);
    }
    if (e.hp <= 0) C.kill(e, o);
    return dmg;
  };

  C.addBurn = (e, n) => {
    const b = e.status.burn || (e.status.burn = { stacks: 0, t: 0, tick: 0 });
    b.stacks = Math.min(14, b.stacks + n); b.t = 0;
  };

  C.applyFx = (e, f, o) => {
    const g = G(), p = g.player, m = p.mods;
    switch (f.type) {
      case 'chain': {
        const jumps = f.jumps + m.chainJumps;
        const hitSet = new Set([e]);
        let from = e;
        for (let i = 0; i < jumps; i++) {
          const n = C.nearestEnemy(from.x, from.y, 280, hitSet);
          if (!n) break;
          hitSet.add(n);
          M.fx.bolt(from.x, from.y - 30, n.x, n.y - 30, '#9fe0ff');
          ((target, delay) => M.game.after(() => C.hit(target, f.dmg, { src: 'lightning', color: '#9fe0ff', noStop: true }), delay))(n, 40 * i);
          from = n;
        }
        if (hitSet.size > 1) M.audio.sfx('lightning', { vol: 0.5, minGap: 0.1 });
        break;
      }
      case 'bolt': {
        const strikes = 1 + m.chainJumps;
        const targets = [e];
        if (strikes > 1) {
          const others = C.enemiesNear(e.x, e.y, 300, e);
          for (let i = 0; i < strikes - 1 && i < others.length; i++) targets.push(others[i]);
        }
        targets.forEach((t, i) => M.game.after(() => { if (t.dead) return; M.fx.skybolt(t.x, t.y); M.audio.sfx('lightning', { minGap: 0.05 }); C.hit(t, f.dmg, { src: 'lightning', color: '#9fe0ff', noStop: true }); }, 60 + i * 90));
        break;
      }
      case 'burn': C.addBurn(e, f.stacks); break;
      case 'knock': {
        if (e.heavy || e.isBoss) break;
        const a = M.angle(o.x ?? p.x, o.y ?? p.y, e.x, e.y);
        e.kbx += Math.cos(a) * f.force; e.kby += Math.sin(a) * f.force;
        e.slamPending = m.wallSlam || 0;
        e.slamT = 0.45;
        if (m.flags.maelstrom) e.status.soak = 3;
        M.fx.burst(e.x, e.y, '#c8ffe8', 5, { z: 30, dir: a, spread: 0.4 });
        break;
      }
      case 'soak': e.status.soak = 3; break;
      case 'bind': e.status.bind = e.isBoss ? f.dur * 0.35 : f.dur; break;
      case 'glare': e.status.glare = 5; break;
    }
  };

  C.kill = (e, o = {}) => {
    if (e.dead) return;
    const g = G(), p = g.player, m = p.mods;
    e.dead = true; e.hp = 0;
    e.deathT = g.time;
    M.save.data.totalKills++;
    if (e.onDeath) e.onDeath(e);
    const burning = e.status.burn && e.status.burn.stacks > 0;
    M.audio.sfx('enemyDie', { pitch: e.big ? 0.6 : M.rand(0.9, 1.2) });
    M.fx.burst(e.x, e.y, e.glow || '#ff6a8a', e.big ? 30 : 16, { z: e.visH * 0.4, max: 380, life: 0.9 });
    for (let i = 0; i < 6; i++) M.fx.add({ type: 'smoke', x: e.x + M.rand(-14, 14), y: e.y - M.rand(10, e.visH), vy: -M.rand(20, 60), size: M.rand(8, 16), color: e.glow || '#8a5aaa', life: M.rand(0.6, 1.1), alpha: 0.3 });
    M.fx.add({ type: 'flash', x: e.x, y: e.y, r: e.r * 4, color: e.glow || '#ff6a8a', life: 0.25 });
    if (burning && m.burnExplode) {
      M.game.after(() => {
        M.fx.ring(e.x, e.y, 130, '#ff7a2f', 0.4, 10);
        M.fx.burst(e.x, e.y, '#ffb040', 20, { z: 20, max: 380 });
        M.audio.sfx('explode', { vol: 0.6 });
        for (const n of C.enemiesNear(e.x, e.y, 130)) C.hit(n, m.burnExplode, { src: 'status', color: '#ff9a4a', noStop: true });
      }, 60);
    }
    if (burning && m.flags.wildfire) {
      for (const n of C.enemiesNear(e.x, e.y, 220)) { C.addBurn(n, Math.ceil(e.status.burn.stacks / 2) + 1); M.fx.bolt(e.x, e.y - 20, n.x, n.y - 20, '#ff9a2a', 0.2, 2); }
    }
    g.onEnemyKilled(e);
  };

  // ── status effects tick ────────────────────────────────────────
  C.tickStatus = (e, dt) => {
    const s = e.status, g = G(), m = g.player.mods;
    if (s.burn && s.burn.stacks > 0) {
      s.burn.t += dt; s.burn.tick += dt;
      if (s.burn.tick >= 0.5) {
        s.burn.tick = 0;
        C.hit(e, s.burn.stacks * 1.6 * m.burnPower, { src: 'status', noCrit: true, color: '#ff9a4a' });
      }
      if (s.burn.t > 4) s.burn.stacks = 0;
      if (Math.random() < dt * 12) M.fx.add({ type: 'glow', x: e.x + M.rand(-e.r, e.r), y: e.y - M.rand(10, e.visH), vy: -60, size: 10, color: '#ff7a2f', life: 0.5 });
    }
    for (const k of ['soak', 'bind', 'glare', 'static', 'stun']) if (s[k] > 0) s[k] -= dt;
    if (s.glare > 0 && m.flags.solarflare) {
      s._sf = (s._sf || 0) + dt;
      if (s._sf >= 1) { s._sf = 0; C.addBurn(e, 1); }
    }
    if (s.soak > 0 && Math.random() < dt * 6) M.fx.add({ type: 'glow', x: e.x + M.rand(-e.r, e.r), y: e.y - M.rand(5, e.visH * 0.6), vy: 40, size: 6, color: '#4ad0ff', life: 0.5 });
    if (s.static > 0 && Math.random() < dt * 5) M.fx.bolt(e.x - 10, e.y - e.visH * 0.7, e.x + 10, e.y - e.visH * 0.3, '#9fe0ff', 0.08, 1.5);
  };

  // ── projectiles ────────────────────────────────────────────────
  C.proj = (o) => {
    const p = Object.assign({ id: M.uid(), t: 0, life: 2, r: 8, pierce: 0, hitSet: new Set(), team: 'player', z: 34, color: '#ffffff' }, o);
    G().room.projs.push(p);
    return p;
  };

  C.updateProjs = (dt) => {
    const g = G(), room = g.room, pl = g.player;
    for (let i = room.projs.length - 1; i >= 0; i--) {
      const b = room.projs[i];
      b.t += dt;
      if (b.update) b.update(b, dt);
      if (b.homing && b.team === 'enemy' && b.t > 0.15) {
        const want = M.angle(b.x, b.y, pl.x, pl.y);
        const cur = Math.atan2(b.vy, b.vx);
        const sp = Math.hypot(b.vx, b.vy);
        const na = cur + M.clamp(M.angDiff(cur, want), -b.homing * dt, b.homing * dt);
        b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
      }
      if (!b.noMove) { b.x += b.vx * dt; b.y += b.vy * dt; }
      if (b.trail && Math.random() < 0.8) M.fx.add({ type: 'glow', x: b.x, y: b.y - b.z, size: b.r * 2.2, color: b.color, life: 0.25, alpha: 0.5 });
      let dead = b.t >= b.life;
      // walls
      if (!b.ghost && (b.x < -10 || b.y < -10 || b.x > room.w + 10 || b.y > room.h + 10)) {
        if (b.bounce > 0) {
          b.bounce--;
          if (b.x < -10 || b.x > room.w + 10) b.vx *= -1; else b.vy *= -1;
          b.x = M.clamp(b.x, -9, room.w + 9); b.y = M.clamp(b.y, -9, room.h + 9);
          b.hitSet.clear();
        } else dead = true;
      }
      if (!b.ghost && !dead) for (const o of room.obstacles) {
        if (o.flat) continue;
        if (M.dist2(b.x, b.y, o.x, o.y) < (o.r + b.r) * (o.r + b.r)) { if (b.bounce > 0) { b.bounce--; const a = M.angle(o.x, o.y, b.x, b.y); const sp = Math.hypot(b.vx, b.vy); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; } else dead = true; break; }
      }
      if (!dead) {
        if (b.team === 'player') {
          for (const e of room.enemies) {
            if (e.dead || !e.active || b.hitSet.has(e)) continue;
            if (M.dist2(b.x, b.y, e.x, e.y) < (b.r + e.r) * (b.r + e.r)) {
              b.hitSet.add(e);
              if (b.onHit) b.onHit(b, e);
              else C.hit(e, b.dmg, { src: b.src || 'attack', fx: b.fx, x: b.x - b.vx * 0.05, y: b.y - b.vy * 0.05, kb: b.kb, color: b.color, crit: b.crit });
              if (b.pierce-- <= 0) { dead = true; break; }
            }
          }
        } else if (b.team === 'enemy') {
          if (!pl.dead && M.dist2(b.x, b.y, pl.x, pl.y) < (b.r + pl.r * 0.8) * (b.r + pl.r * 0.8)) {
            if (!(b.respectStill && pl.stillT > 0.35)) {
              pl.hurt(b.dmg, b.owner, { x: b.x, y: b.y });
              dead = !b.pierceAll;
            }
          }
        }
      }
      if (dead) {
        if (b.onDie) b.onDie(b);
        else if (!b.silent) M.fx.burst(b.x, b.y, b.color, 5, { z: b.z, max: 160 });
        room.projs.splice(i, 1);
      }
    }
  };

  C.drawProj = (ctx, b, t) => {
    if (b.draw) return b.draw(ctx, b, t);
    const a = Math.atan2(b.vy, b.vx);
    ctx.save(); ctx.translate(b.x, b.y - b.z);
    switch (b.kind) {
      case 'arrow': {
        ctx.rotate(a);
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, b.big ? 30 : 18, b.color, 0.6);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = b.big ? 3.5 : 2.2;
        ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(12, 0); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(9, -4); ctx.lineTo(9, 4); ctx.fill();
        ctx.fillStyle = b.color; ctx.fillRect(-24, -3, 6, 6);
        break;
      }
      case 'orb': {
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, b.r * 3, b.color, 0.75);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, b.r * 0.55, 0, TAU); ctx.fill();
        break;
      }
      case 'wheel': {
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, b.r * 2.6, '#ffcf6b', 0.6);
        ctx.globalCompositeOperation = 'source-over';
        M.art.weapon(ctx, 'chakra', -20 * (b.r / 34), 0, 0, b.r / 20, t * 2, {});
        break;
      }
      case 'astra': {
        ctx.rotate(a);
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, 40, b.color, 0.8);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#fff8d0'; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(4, -6); ctx.lineTo(-22, 0); ctx.lineTo(4, 6); ctx.closePath(); ctx.fill();
        break;
      }
      case 'fireball': {
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, b.r * 3.2, '#ff7a2f', 0.9);
        M.art.glow(ctx, 0, 0, b.r * 1.6, '#ffe08a', 0.9);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'crescent': {
        ctx.rotate(a);
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = M.rgba('#cfe8ff', 0.8);
        ctx.beginPath(); ctx.arc(0, 0, b.r, -1.2, 1.2); ctx.arc(-10, 0, b.r * 0.85, 1.1, -1.1, true); ctx.fill();
        M.art.glow(ctx, 0, 0, b.r * 1.8, '#9fc8ff', 0.4);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'wave': {
        ctx.rotate(a);
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(-30, 0, 20, 0);
        g.addColorStop(0, M.rgba('#2fb8e6', 0)); g.addColorStop(1, M.rgba('#9ff0ff', 0.85));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(0, 0, 30, b.r, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = M.rgba('#ffffff', 0.8); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, 30, b.r, 0, -1.2, 1.2); ctx.stroke();
        break;
      }
      case 'spit': {
        const k = b.t / b.life;
        const h = Math.sin(k * Math.PI) * 160;
        ctx.translate(0, -h + b.z);
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, 26, b.color, 0.9);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#e0fff0'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
        break;
      }
      case 'weapon': { // Narayanastra rain
        ctx.rotate(a);
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, 26, b.color, 0.7);
        ctx.globalCompositeOperation = 'source-over';
        M.art.weapon(ctx, b.wk || 'spear', -26, 0, 0, 0.9, t);
        break;
      }
      default: {
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, b.r * 3, b.color, 0.7);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.restore();
  };

  // ── zones (lingering area effects) ─────────────────────────────
  C.zone = (o) => {
    const z = Object.assign({ id: M.uid(), t: 0, life: 2, r: 60, team: 'player', cd: new Map(), tickEvery: 0.4 }, o);
    G().room.zones.push(z);
    return z;
  };
  C.updateZones = (dt) => {
    const g = G(), room = g.room, pl = g.player;
    for (let i = room.zones.length - 1; i >= 0; i--) {
      const z = room.zones[i];
      z.t += dt;
      if (z.update) z.update(z, dt);
      if (z.team === 'player') {
        if (z.dmg !== undefined) {
          for (const e of room.enemies) {
            if (e.dead || !e.active) continue;
            const rr = (z.r + e.r);
            const d2 = M.dist2(z.x, z.y, e.x, e.y);
            if (d2 > rr * rr) continue;
            if (z.pull && !e.heavy && !e.isBoss) { const a = M.angle(e.x, e.y, z.x, z.y); e.x += Math.cos(a) * z.pull * dt; e.y += Math.sin(a) * z.pull * dt; }
            const last = z.cd.get(e) ?? -99;
            if (z.t - last >= z.tickEvery) {
              z.cd.set(e, z.t);
              if (z.onTick) z.onTick(z, e);
              else C.hit(e, z.dmg, { src: z.src || 'status', fx: z.fx, color: z.color, noCrit: z.noCrit, noStop: true, x: z.x, y: z.y });
            }
          }
        }
      } else if (z.team === 'enemy' && z.dmg && z.t > (z.delay || 0) && !pl.dead) {
        const rr = z.r + pl.r * 0.6;
        if (M.dist2(z.x, z.y, pl.x, pl.y) < rr * rr) {
          const last = z.cd.get(pl) ?? -99;
          if (z.t - last >= z.tickEvery) { z.cd.set(pl, z.t); pl.hurt(z.dmg, z.owner, { x: z.x, y: z.y }); }
        }
      }
      if (z.t >= z.life) { if (z.onEnd) z.onEnd(z); room.zones.splice(i, 1); }
    }
  };
  C.drawZone = (ctx, z, t) => {
    if (z.draw) return z.draw(ctx, z, t);
    const k = z.t / z.life;
    const fade = Math.min(1, (1 - k) * 4, z.t * 6);
    ctx.save(); ctx.translate(z.x, z.y);
    switch (z.kind) {
      case 'fire': {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) M.art.glow(ctx, Math.sin(t * 7 + i * 2 + z.id) * 10, -10 - i * 10 - Math.sin(t * 9 + i) * 5, z.r * (1 - i * 0.2), i ? '#ffd15c' : '#ff5a1a', 0.55 * fade);
        break;
      }
      case 'pool': case 'venom': {
        ctx.scale(1, 0.6);
        const col = z.kind === 'venom' ? '#7aff8a' : '#2fb8e6';
        const g = ctx.createRadialGradient(0, 0, 4, 0, 0, z.r);
        g.addColorStop(0, M.rgba(M.shade(col, 0.4), 0.55 * fade)); g.addColorStop(0.8, M.rgba(col, 0.35 * fade)); g.addColorStop(1, M.rgba(col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, z.r, 0, TAU); ctx.fill();
        ctx.strokeStyle = M.rgba('#ffffff', 0.35 * fade); ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, z.r * (((t * 0.6 + i / 3) % 1)), 0, TAU); ctx.stroke(); }
        break;
      }
      case 'cyclone': case 'tornado': {
        ctx.globalCompositeOperation = 'lighter';
        const col = '#b8ffe0';
        for (let i = 0; i < 7; i++) {
          const yy = -i * 16, rr = z.r * (0.35 + i * 0.1);
          ctx.strokeStyle = M.rgba(col, (0.5 - i * 0.05) * fade); ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(Math.sin(t * 6 + i) * 6, yy, rr, rr * 0.3, 0, t * 8 + i, t * 8 + i + 4.5); ctx.stroke();
        }
        M.art.glow(ctx, 0, -40, z.r, '#8ff0c4', 0.25 * fade);
        break;
      }
      case 'storm': {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 5; i++) M.art.glow(ctx, Math.cos(t + i * 1.3) * z.r * 0.5, -150 + Math.sin(t * 1.4 + i) * 10, 70, '#6fa0d8', 0.35 * fade);
        ctx.globalCompositeOperation = 'source-over';
        ctx.scale(1, 0.6);
        ctx.strokeStyle = M.rgba('#9fe0ff', 0.35 * fade); ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.arc(0, 0, z.r, t, t + TAU); ctx.stroke(); ctx.setLineDash([]);
        break;
      }
      case 'shock': {
        ctx.scale(1, 0.62);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = M.rgba(z.color || '#ff6a4a', fade); ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, z.r, 0, TAU); ctx.stroke();
        break;
      }
    }
    ctx.restore();
  };
})();
