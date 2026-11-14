'use strict';
// ───────────────────────────────────────────────────────────────
//  Guardians of the Wheel
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const C = M.combat;
  const RED = '#ff3a3a';

  const LOOK = {
    jayadratha: { pal: { skin: '#a87850', hair: '#14100c', cloth: '#2a1a4a', cloth2: '#4a3a7a', armor: '#6a5aa8', gold: '#c8c0e8', gem: '#8a7ad8' }, style: { crown: 'helm', shield: '#8a8ab0', mustache: true, plume: '#7a2a5a' }, weapon: 'sword', glow: '#8a7ad8' },
    karna: { pal: { skin: '#c88a50', hair: '#1a0f0c', cloth: '#8a2a1a', cloth2: '#c8502a', armor: '#ffd96a', gold: '#fff0a0', gem: '#ff7a1a' }, style: { crown: 'mukuta', kundala: true, halo: '#ffb84a', haloR: 34, rays: true, mustache: true }, weapon: 'bow', glow: '#ffb84a' },
    ashwatthama: { pal: { skin: '#9a7a6a', hair: '#0a0808', cloth: '#4a0a1a', cloth2: '#2a0a10', armor: '#3a2a2a', gold: '#8a6a5a', gem: '#ff3a4a' }, style: { crown: null, hair: 'wild', wound: true, beard: '#1a1010', cape: '#2a0010' }, weapon: 'sword', glow: '#ff3a5a' },
    drona: { pal: { skin: '#b8885a', hair: '#e8e4d8', cloth: '#f0e8d0', cloth2: '#d8902a', armor: null, gold: '#e6b84a' }, style: { crown: null, hair: 'topknot', beard: '#f0ece0', thread: true, robe: true, halo: '#ffe08a', haloR: 30, tilak: '#f0f0f0' }, weapon: 'bow', glow: '#ffe08a' },
  };

  class Boss extends M.Enemy {
    constructor(id, x, y) {
      const B = M.BOSSES[id];
      const def = { name: B.name, hp: B.hp, r: B.r, speed: 150, ai: 'boss', dmg: 14, body: { kind: 'boss', glow: LOOK[id].glow }, heavy: true };
      super(id, x, y, { def, spawnDelay: 0.01 });
      this.bossId = id; this.title = B.title; this.isBoss = true; this.big = true; this.heavy = true;
      this.scale = 1.85; this.r = B.r; this.visH = 150;
      const hpMult = 1 + (M.game.run ? Math.max(0, M.save.data.wins) * 0.08 : 0);
      this.maxHp = this.hp = Math.round(B.hp * hpMult);
      this.maxArmor = this.armor = 0;
      this.phase = 1; this.act = null; this.idleT = 1.4; this.look = LOOK[id];
      this.glow = LOOK[id].glow;
      this.atkCount = 0;
      this.dmg = { jayadratha: 15, karna: 13, ashwatthama: 15, drona: 14 }[id];
    }

    // ── action helpers ──
    start(name) { this.act = { name, t: 0, step: 0, d: {} }; }
    hurtIf(cond, dmg) { const pl = M.game.player; if (cond) pl.hurt(dmg || this.dmg, this, this); }
    keepDistance(dp, ap, want, speed) {
      const pl = M.game.player;
      if (dp < want - 60) return this.steer(this.x - Math.cos(ap) * 100, this.y - Math.sin(ap) * 100, speed);
      if (dp > want + 80) return this.steer(pl.x, pl.y, speed);
      return this.steer(this.x + Math.cos(ap + Math.PI / 2 * this.strafe) * 100, this.y + Math.sin(ap + Math.PI / 2 * this.strafe) * 100, speed * 0.6);
    }
    banner(title, sub) { M.ui.banner(title, sub, this.glow); }

    ai(dt, dp, ap, slow) {
      const g = M.game;
      if (g.cinematic) return null;
      const frac = this.hp / this.maxHp;
      this.checkPhase(frac);
      if (!this.act) {
        this.face = ap;
        this.idleT -= dt;
        if (this.idleT <= 0) { this.choose(dp, frac); this.atkCount++; }
        return this.idleMove(dt, dp, ap, slow);
      }
      this.act.t += dt;
      const fn = this['a_' + this.act.name];
      const r = fn.call(this, this.act, dt, dp, ap, slow);
      if (this.act && this.act.done) { this.act = null; this.idleT = (this.phase >= 3 ? 0.45 : 0.75) + M.rand(0, 0.4); }
      return r || null;
    }
    checkPhase() {}
    idleMove(dt, dp, ap, slow) { return dp > 180 ? this.steer(M.game.player.x, M.game.player.y, 130 * slow) : null; }

    draw(ctx, t) {
      const L = this.look;
      ctx.save();
      if (this.alpha !== undefined) ctx.globalAlpha = this.alpha;
      ctx.globalCompositeOperation = 'lighter';
      M.art.glow(ctx, this.x, this.y - 75, 160, this.glow, this.invuln ? 0.45 : 0.22);
      ctx.globalCompositeOperation = 'source-over';
      if (this.act && this.act.tele) { ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, this.x, this.y - 60, 120, RED, 0.25 + Math.sin(t * 30) * 0.1); ctx.globalCompositeOperation = 'source-over'; }
      let wAng = this.face;
      if (this.act && this.act.swing !== undefined) wAng = this.face + this.act.swing;
      M.art.humanoid(ctx, {
        x: this.x, y: this.y, s: this.scale, face: this.face, t, walk: this.walk, moving: this.moving,
        pal: L.pal, style: L.style, weapon: L.weapon, wAng, wExtra: { draw: this.act && this.act.draw || 0 },
        flash: this.flash, spectral: this.bossId === 'drona' ? null : this.glow, eyes: this.bossId === 'ashwatthama' || this.bossId === 'jayadratha' ? this.glow : null,
        shieldGlow: this.invuln ? '#cfe0ff' : null, weaponScale: 1.1,
      });
      ctx.restore();
      if (this.invuln) {
        ctx.save(); ctx.translate(this.x, this.y - 75);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = M.rgba('#cfe0ff', 0.6 + Math.sin(t * 5) * 0.2); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, 85, 115, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = M.rgba('#cfe0ff', 0.9); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, -120); ctx.moveTo(-16, -146); ctx.quadraticCurveTo(0, -124, 16, -146); ctx.stroke();
        ctx.restore();
      }
    }
  }

  // ═════════════ JAYADRATHA ═════════════
  class Jayadratha extends Boss {
    checkPhase(frac) {
      if ((this.phase === 1 && frac < 0.66) || (this.phase === 2 && frac < 0.33)) {
        this.phase++;
        this.act = null; this.start('boon');
      }
    }
    choose(dp) {
      const opts = dp < 220 ? ['spin', 'trident', 'charge'] : ['charge', 'trident', 'charge', 'spin'];
      this.start(M.pick(opts));
    }
    a_charge(a, dt, dp, ap) {
      if (a.step === 0) { a.ang = ap; a.tele = true; M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(ap) * 640, this.y + Math.sin(ap) * 640, 80, 0.75, RED); M.audio.sfx('roar', { vol: 0.5 }); a.step = 1; }
      if (a.step === 1) { this.face = a.ang; if (a.t >= 0.75) { a.step = 2; a.t = 0; a.tele = false; a.hit = false; } return null; }
      if (a.step === 2) {
        if (!a.hit && M.dist(this.x, this.y, M.game.player.x, M.game.player.y) < this.r + 40) { a.hit = true; this.hurtIf(true, this.dmg + 3); }
        if (Math.random() < 0.6) M.fx.add({ type: 'smoke', x: this.x, y: this.y, vy: -20, size: 18, color: '#6a5aa8', life: 0.5, alpha: 0.3 });
        if (a.t >= 0.5 || M.game.blocked(this.x + Math.cos(a.ang) * 40, this.y + Math.sin(a.ang) * 40, this.r)) { a.done = true; M.game.shake(6); }
        return { x: Math.cos(a.ang) * 1150, y: Math.sin(a.ang) * 1150 };
      }
    }
    a_spin(a) {
      if (a.step === 0) { a.tele = true; M.fx.telegraphCircle(this.x, this.y, 190, 0.85, RED); a.step = 1; }
      if (a.step === 1 && a.t >= 0.85) {
        a.tele = false; a.step = 2;
        M.fx.slash(this.x, this.y, 0, TAU - 0.01, 190, '#b8a8ff', 0.3, 1.6); M.fx.ring(this.x, this.y, 190, '#8a7ad8', 0.35, 10);
        M.audio.sfx('swingHeavy'); M.game.shake(6);
        const pl = M.game.player; this.hurtIf(M.dist(this.x, this.y, pl.x, pl.y) < 190 + pl.r);
      }
      if (a.step === 2) a.swing = a.t * 30;
      if (a.t >= 1.3) a.done = true;
    }
    a_trident(a, dt, dp, ap) {
      if (a.step === 0) {
        a.tele = true; a.angs = [ap - 0.38, ap, ap + 0.38];
        for (const an of a.angs) M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(an) * 760, this.y + Math.sin(an) * 760, 46, 0.85, '#cfe0ff');
        a.step = 1;
      }
      if (a.step === 1 && a.t >= 0.85) {
        a.tele = false; a.step = 2;
        M.audio.sfx('lightning'); M.game.shake(8);
        const pl = M.game.player;
        for (const an of a.angs) {
          const ex = this.x + Math.cos(an) * 760, ey = this.y + Math.sin(an) * 760;
          M.fx.bolt(this.x, this.y - 40, ex, ey - 20, '#cfe0ff', 0.35, 5);
          if (M.segDist(pl.x, pl.y, this.x, this.y, ex, ey) < 30 + pl.r) { this.hurtIf(true, this.dmg - 1); }
        }
      }
      if (a.t >= 1.4) a.done = true;
    }
    a_boon(a) {
      const g = M.game;
      if (a.step === 0) {
        this.invuln = true; a.step = 1;
        this.banner('Boon of Shiva', 'He cannot be harmed while his soldiers hold the line.');
        M.audio.sfx('gong', { pitch: 0.9 });
        const room = g.room;
        const ids = this.phase === 2 ? ['padati', 'padati', 'padati', 'dhanvin', 'dhanvin'] : ['padati', 'kavachin', 'padati', 'dhanvin', 'dhanvin', 'pishacha', 'pishacha'];
        a.adds = ids.map((id, i) => {
          const an = (i / ids.length) * TAU;
          const e = new M.Enemy(id, M.clamp(room.w / 2 + Math.cos(an) * 360, 80, room.w - 80), M.clamp(room.h / 2 + Math.sin(an) * 260, 80, room.h - 80), { spawnDelay: 0.6 + i * 0.12, depthScale: 1 });
          e.room = room; room.enemies.push(e);
          return e;
        });
      }
      // stand at the gate (centre-top)
      const tx = g.room.w / 2, ty = g.room.h * 0.32;
      if (a.adds.every((e) => e.dead) || a.t > 22) {
        this.invuln = false; a.done = true; this.stun = 2.2;
        M.fx.text(this.x, this.y - 140, 'The Boon Falters!', '#cfe0ff', 26);
        M.audio.sfx('block', { vol: 1.3 }); M.fx.burst(this.x, this.y, '#cfe0ff', 30, { z: 70, max: 420 });
        return null;
      }
      return M.dist(this.x, this.y, tx, ty) > 20 ? this.steer(tx, ty, 160) : null;
    }
  }

  // ═════════════ KARNA ═════════════
  class Karna extends Boss {
    checkPhase(frac) {
      if (this.phase === 1 && frac < 0.5) {
        this.phase = 2; this.maxArmor = this.armor = 520;
        this.banner('Kavacha and Kundala', 'The armour he was born with returns to him.');
        M.audio.sfx('sun'); M.fx.ring(this.x, this.y, 200, '#ffd96a', 0.6, 14);
        this.act = null; this.idleT = 0.8;
      }
    }
    idleMove(dt, dp, ap, slow) { return this.keepDistance(dp, ap, 430, 170 * slow); }
    choose(dp) {
      if (dp < 200) return this.start('flare');
      const o = ['volley', 'volley', 'rain'];
      if (this.phase >= 2 && this.atkCount % 3 === 2) return this.start('vasavi');
      this.start(M.pick(o));
    }
    a_volley(a, dt, dp, ap) {
      const shots = this.phase >= 2 ? 3 : 2;
      if (a.step === 0) { a.tele = true; a.n = 0; a.step = 1; a.aim = ap; }
      if (a.step === 1) {
        a.draw = Math.min(1, a.t / 0.55);
        a.aim = M.lerp(a.aim, ap, dt * 4); this.face = a.aim;
        if (a.t >= 0.55) {
          const n = 5 + this.phase;
          for (let i = 0; i < n; i++) {
            const an = a.aim + (i - (n - 1) / 2) * 0.13;
            C.proj({ team: 'enemy', kind: 'arrow', x: this.x + Math.cos(an) * 30, y: this.y + Math.sin(an) * 30, vx: Math.cos(an) * 780, vy: Math.sin(an) * 780, r: 9, life: 2, dmg: this.dmg - 3, color: '#ffb84a', owner: this });
          }
          M.audio.sfx('arrow');
          a.n++; a.t = 0; a.draw = 0;
          if (a.n >= shots) { a.done = true; a.tele = false; }
        }
      }
    }
    a_rain(a) {
      const pl = M.game.player;
      if (a.step === 0) {
        a.tele = true; a.spots = [];
        const n = this.phase >= 2 ? 9 : 7;
        for (let i = 0; i < n; i++) {
          const sx = pl.x + (i === 0 ? 0 : M.rand(-260, 260)), sy = pl.y + (i === 0 ? 0 : M.rand(-200, 200));
          a.spots.push([sx, sy]); M.fx.telegraphCircle(sx, sy, 78, 1.05, '#ffb84a');
        }
        a.step = 1; M.audio.sfx('bowstring');
        a.draw = 1;
      }
      if (a.step === 1 && a.t >= 1.05) {
        a.step = 2; a.tele = false; a.draw = 0;
        for (const [sx, sy] of a.spots) {
          for (let k = 0; k < 4; k++) M.fx.add({ type: 'spark', x: sx + M.rand(-40, 40), y: sy - 300, vx: 0, vy: 2200, life: 0.14, size: 3, color: '#ffe08a', add: true });
          M.fx.ring(sx, sy, 78, '#ffb84a', 0.3, 6);
          if (M.dist(pl.x, pl.y, sx, sy) < 78 + pl.r * 0.5) this.hurtIf(true, this.dmg - 2);
        }
        M.audio.sfx('arrow', { pitch: 0.7 }); M.game.shake(4);
      }
      if (a.t >= 1.5) a.done = true;
    }
    a_vasavi(a, dt, dp, ap) {
      const room = M.game.room;
      if (a.step === 0) { a.tele = true; a.aim = ap; a.step = 1; this.banner('Vasavi Shakti', 'The spear of Indra. It never misses twice.'); M.audio.sfx('warn'); }
      if (a.step === 1) {
        if (a.t < 0.9) a.aim = M.lerp(a.aim, ap, dt * 5);
        this.face = a.aim;
        a.draw = 1;
        if (!a.line || a.t < 0.9) { a.line = true; if (Math.floor(a.t * 10) !== a.lastTick) { a.lastTick = Math.floor(a.t * 10); M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(a.aim) * 2000, this.y + Math.sin(a.aim) * 2000, 70, 0.12, '#ffe27a'); } }
        if (a.t >= 1.4) {
          a.step = 2; a.tele = false; a.draw = 0;
          const ex = this.x + Math.cos(a.aim) * 2200, ey = this.y + Math.sin(a.aim) * 2200;
          M.fx.beam(this.x, this.y, ex, ey, '#ffe27a', 0.5, 34);
          M.audio.sfx('lightning'); M.audio.sfx('sun'); M.game.shake(12);
          const pl = M.game.player;
          if (M.segDist(pl.x, pl.y, this.x, this.y, ex, ey) < 40 + pl.r) this.hurtIf(true, this.dmg + 10);
        }
      }
      if (a.t >= 2) a.done = true;
    }
    a_flare(a) {
      if (a.step === 0) { a.tele = true; M.fx.telegraphCircle(this.x, this.y, 120, 0.45, '#ffe27a'); a.step = 1; }
      if (a.step === 1 && a.t > 0.45) {
        a.step = 2; a.tele = false;
        const n = 20;
        for (let i = 0; i < n; i++) { const an = (i / n) * TAU; C.proj({ team: 'enemy', kind: 'orb', x: this.x, y: this.y, vx: Math.cos(an) * 360, vy: Math.sin(an) * 360, r: 10, life: 3, dmg: this.dmg - 3, color: '#ffd96a', owner: this }); }
        M.audio.sfx('sun'); M.fx.add({ type: 'flash', x: this.x, y: this.y, r: 260, color: '#ffe27a', life: 0.3 });
        // leap away
        const room = M.game.room, pl = M.game.player;
        const an = M.angle(pl.x, pl.y, this.x, this.y);
        const nx = M.clamp(this.x + Math.cos(an) * 320, 90, room.w - 90), ny = M.clamp(this.y + Math.sin(an) * 320, 90, room.h - 90);
        if (!M.game.blocked(nx, ny, this.r)) { M.fx.burst(this.x, this.y, '#ffb84a', 16, { z: 60 }); this.x = nx; this.y = ny; }
      }
      if (a.t >= 0.9) a.done = true;
    }
  }

  // ═════════════ ASHWATTHAMA ═════════════
  class Ashwatthama extends Boss {
    checkPhase(frac) {
      if ((this.phase === 1 && frac < 0.7) || (this.phase === 2 && frac < 0.35)) {
        this.phase++;
        this.act = null; this.start('narayana');
      }
    }
    idleMove(dt, dp, ap, slow) { return dp > 140 ? this.steer(M.game.player.x, M.game.player.y, 190 * slow) : null; }
    choose(dp) {
      if (this.phase >= 3 && this.atkCount % 3 === 2) return this.start('brahmashira');
      this.start(M.pick(dp < 260 ? ['dashes', 'flames', 'dashes'] : ['dashes', 'flames']));
    }
    a_dashes(a, dt, dp, ap) {
      const pl = M.game.player;
      const n = this.phase >= 2 ? 4 : 3;
      if (a.step === 0) { a.i = 0; a.step = 1; a.t = 0; }
      if (a.step === 1) { // telegraph
        if (a.t < dt * 1.5) { a.ang = ap; a.tele = true; M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(ap) * 360, this.y + Math.sin(ap) * 360, 60, 0.42, RED); }
        this.face = a.ang;
        if (a.t >= 0.42) { a.step = 2; a.t = 0; a.tele = false; a.hit = false; M.audio.sfx('swing', { pitch: 0.7 }); }
        return null;
      }
      if (a.step === 2) {
        a.swing = -1 + a.t * 10;
        if (!a.hit && M.dist(this.x, this.y, pl.x, pl.y) < this.r + 46) { a.hit = true; this.hurtIf(true); }
        if (a.t >= 0.2) {
          M.fx.slash(this.x, this.y, a.ang, 2.4, 140, '#ff3a5a', 0.2, 1.3);
          a.i++; a.t = 0; a.step = a.i >= n ? 3 : 1; a.swing = undefined;
        }
        if (M.game.blocked(this.x + Math.cos(a.ang) * 40, this.y + Math.sin(a.ang) * 40, this.r)) return null;
        return { x: Math.cos(a.ang) * 1800, y: Math.sin(a.ang) * 1800 };
      }
      if (a.step === 3 && a.t > 0.5) a.done = true;
    }
    a_flames(a, dt) {
      if (a.step === 0) { a.tele = true; a.step = 1; a.spin = M.rand(TAU); a.st = 0; M.audio.sfx('fire'); }
      if (a.t > 0.5) {
        a.tele = false;
        a.st -= dt;
        if (a.st <= 0) {
          a.st = 0.08; a.spin += 0.5 * (this.phase >= 2 ? 1.1 : 1);
          for (let k = 0; k < 2; k++) { const an = a.spin + k * Math.PI; C.proj({ team: 'enemy', kind: 'orb', x: this.x, y: this.y, vx: Math.cos(an) * 300, vy: Math.sin(an) * 300, r: 10, life: 4, dmg: this.dmg - 4, color: '#ff3a5a', owner: this }); }
          M.audio.sfx('shoot', { vol: 0.25, minGap: 0.07 });
        }
      }
      if (a.t >= 2.4) a.done = true;
    }
    a_narayana(a, dt) {
      const g = M.game, pl = g.player, room = g.room;
      if (a.step === 0) {
        a.step = 1; this.invuln = true;
        this.banner('Narayanastra', 'Lay down your arms. Stand perfectly still.');
        M.audio.sfx('gong', { pitch: 0.6 }); g.flashScreen('#ffcf4a', 0.4);
        a.spawnT = 0;
        g.narayana = true;
      }
      const tx = room.w / 2, ty = room.h * 0.3;
      a.spawnT -= dt;
      if (a.t > 1.2 && a.t < 7.5 && a.spawnT <= 0) {
        a.spawnT = 0.07;
        // weapons rain from the sky toward the player
        const sx = pl.x + M.rand(-520, 520), sy = pl.y - 520;
        const tx2 = pl.x + M.rand(-60, 60), ty2 = pl.y + M.rand(-40, 40);
        const an = M.angle(sx, sy, tx2, ty2);
        C.proj({ team: 'enemy', kind: 'weapon', wk: M.pick(['spear', 'sword', 'mace', 'trident']), x: sx, y: sy, vx: Math.cos(an) * 900, vy: Math.sin(an) * 900, r: 14, life: 1.4, dmg: this.dmg - 4, color: '#ffcf4a', ghost: true, respectStill: true, owner: this, silent: true });
      }
      if (a.t >= 8) { a.done = true; this.invuln = false; g.narayana = false; M.fx.text(this.x, this.y - 140, 'The Astra Is Spent', '#ffcf4a', 24); this.stun = 1.5; }
      return M.dist(this.x, this.y, tx, ty) > 20 ? this.steer(tx, ty, 200) : null;
    }
    a_brahmashira(a) {
      const pl = M.game.player;
      if (a.step === 0) { a.step = 1; a.tele = true; a.tx = pl.x; a.ty = pl.y; M.fx.telegraphCircle(a.tx, a.ty, 300, 1.7, '#ff2a6a'); this.banner('Brahmashira', ''); M.audio.sfx('warn'); }
      if (a.step === 1) {
        if (Math.random() < 0.6) M.fx.add({ type: 'glow', x: this.x + M.rand(-30, 30), y: this.y - 150, vy: -10, size: 40, color: '#ff2a6a', life: 0.3 });
        if (a.t >= 1.7) {
          a.step = 2; a.tele = false;
          M.fx.ring(a.tx, a.ty, 300, '#ff2a6a', 0.6, 20); M.fx.add({ type: 'flash', x: a.tx, y: a.ty, r: 420, color: '#ff6a9a', life: 0.4 });
          M.audio.sfx('explode'); M.game.shake(14);
          if (M.dist(pl.x, pl.y, a.tx, a.ty) < 300) this.hurtIf(true, this.dmg + 12);
        }
      }
      if (a.t >= 2.3) a.done = true;
    }
  }

  // ═════════════ DRONA ═════════════
  class Drona extends Boss {
    checkPhase(frac) {
      if (this.phase === 1 && frac < 0.66) {
        this.phase = 2; this.act = null;
        this.banner('Second Lesson', 'The Wheel turns. Learn its rhythm.');
        this.spawnWheel();
      } else if (this.phase === 2 && frac < 0.33) {
        this.phase = 3; this.act = null;
        this.banner('Final Lesson', 'An astra is not a weapon. It is a question.');
        const room = M.game.room;
        for (const [x, y] of [[room.w * 0.25, room.h * 0.6], [room.w * 0.75, room.h * 0.6]]) { const e = new M.Enemy('dvarapala', x, y, { spawnDelay: 1 }); e.room = room; room.enemies.push(e); }
      }
    }
    spawnWheel() {
      const room = M.game.room, self = this;
      M.audio.sfx('gong', { pitch: 1.1 });
      C.zone({ team: 'enemy', kind: 'wheel', x: room.w / 2, y: room.h / 2 + 40, r: 0, life: 9999, tickEvery: 0.6, ang: 0, delay: 1.2,
        update(z, dt) {
          if (self.dead) { z.life = 0; return; }
          z.ang += dt * (self.phase >= 3 ? 0.75 : 0.55);
          if (z.t < z.delay) return;
          const pl = M.game.player;
          for (let i = 0; i < 6; i++) {
            const a = z.ang + (i / 6) * TAU;
            const ex = z.x + Math.cos(a) * 900, ey = z.y + Math.sin(a) * 900 * 0.7;
            if (M.segDist(pl.x, pl.y, z.x + Math.cos(a) * 90, z.y + Math.sin(a) * 63, ex, ey) < 14 + pl.r * 0.6) {
              const last = z.cd.get(pl) ?? -99;
              if (z.t - last >= z.tickEvery) { z.cd.set(pl, z.t); pl.hurt(self.dmg - 4, self, { x: pl.x - Math.cos(a + Math.PI / 2) * 10, y: pl.y }); }
            }
          }
        },
        draw(ctx, z, t) {
          const vis = Math.min(1, z.t / z.delay);
          ctx.save(); ctx.translate(z.x, z.y);
          ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 6; i++) {
            const a = z.ang + (i / 6) * TAU;
            ctx.strokeStyle = M.rgba('#ffcf4a', (z.t < z.delay ? 0.25 : 0.75) * vis); ctx.lineWidth = z.t < z.delay ? 3 : 10;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * 90, Math.sin(a) * 63); ctx.lineTo(Math.cos(a) * 900, Math.sin(a) * 630); ctx.stroke();
            ctx.strokeStyle = M.rgba('#ffffff', 0.6 * vis); ctx.lineWidth = 2; ctx.stroke();
          }
          ctx.scale(1, 0.7);
          ctx.strokeStyle = M.rgba('#ffcf4a', 0.8 * vis); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.stroke();
          M.art.glow(ctx, 0, 0, 120, '#ffcf4a', 0.3 * vis);
          ctx.restore();
        } });
    }
    idleMove(dt, dp, ap, slow) { return this.keepDistance(dp, ap, 380, 150 * slow); }
    choose(dp) {
      if (this.phase >= 3 && this.atkCount % 3 === 0) return this.start('brahmastra');
      if (dp < 180) return this.start('blink');
      this.start(M.pick(['triple', 'ring', 'triple', this.phase >= 2 ? 'blink' : 'triple']));
    }
    a_triple(a, dt, dp, ap) {
      if (a.step === 0) { a.n = 0; a.step = 1; a.aim = ap; a.tele = true; }
      a.aim = M.lerp(a.aim, ap, dt * 6); this.face = a.aim;
      a.draw = Math.min(1, a.t / 0.4);
      if (a.t >= 0.4) {
        for (let i = -1; i <= 1; i++) { const an = a.aim + i * 0.09; C.proj({ team: 'enemy', kind: 'arrow', x: this.x + Math.cos(an) * 30, y: this.y + Math.sin(an) * 30, vx: Math.cos(an) * 900, vy: Math.sin(an) * 900, r: 9, life: 2, dmg: this.dmg - 3, color: '#ffe08a', owner: this }); }
        M.audio.sfx('arrow'); a.n++; a.t = 0; a.draw = 0;
        if (a.n >= 3) { a.done = true; a.tele = false; }
      }
    }
    a_ring(a) {
      if (a.step === 0) { a.step = 1; a.tele = true; M.fx.telegraphCircle(this.x, this.y, 80, 0.6, '#ffe08a'); }
      if (a.step === 1 && a.t > 0.6) {
        a.step = 2; a.tele = false;
        for (let w = 0; w < 2; w++) M.game.after(() => {
          if (this.dead) return;
          const n = 24, off = w * (Math.PI / n);
          for (let i = 0; i < n; i++) { const an = off + (i / n) * TAU; C.proj({ team: 'enemy', kind: 'arrow', x: this.x, y: this.y, vx: Math.cos(an) * 420, vy: Math.sin(an) * 420, r: 8, life: 3, dmg: this.dmg - 4, color: '#ffe08a', owner: this }); }
          M.audio.sfx('arrow', { pitch: 0.8 });
        }, w * 380);
      }
      if (a.t >= 1.4) a.done = true;
    }
    a_blink(a) {
      if (a.step === 0) { a.step = 1; this.alpha = 1; }
      if (a.step === 1) {
        this.alpha = Math.max(0, 1 - a.t / 0.25);
        if (a.t >= 0.25) {
          const room = M.game.room, pl = M.game.player;
          for (let k = 0; k < 12; k++) { const an = M.rand(TAU), r = M.rand(330, 480); const nx = M.clamp(pl.x + Math.cos(an) * r, 90, room.w - 90), ny = M.clamp(pl.y + Math.sin(an) * r, 90, room.h - 90); if (!M.game.blocked(nx, ny, this.r)) { this.x = nx; this.y = ny; break; } }
          a.step = 2; a.t = 0; M.fx.burst(this.x, this.y, '#ffe08a', 16, { z: 60 });
        }
      }
      if (a.step === 2) { this.alpha = Math.min(1, a.t / 0.25); if (a.t >= 0.3) { this.alpha = undefined; a.done = true; } }
    }
    a_brahmastra(a) {
      const pl = M.game.player;
      if (a.step === 0) { a.step = 1; a.k = 0; a.tele = true; this.banner('Brahmastra', ''); a.nextT = 0; }
      if (a.step === 1 && a.t >= a.nextT && a.k < 5) {
        const tx = pl.x, ty = pl.y;
        M.fx.telegraphCircle(tx, ty, 160, 0.85, '#ff8a3a');
        M.audio.sfx('warn');
        M.game.after(() => {
          M.fx.ring(tx, ty, 160, '#ffcf4a', 0.5, 14); M.fx.add({ type: 'flash', x: tx, y: ty, r: 240, color: '#ffcf4a', life: 0.3 });
          M.fx.bolt(tx, ty - 700, tx, ty - 10, '#ffe08a', 0.3, 6);
          M.audio.sfx('explode', { vol: 0.8 }); M.game.shake(8);
          if (!this.dead && M.dist(pl.x, pl.y, tx, ty) < 160) pl.hurt(this.dmg + 4, this, { x: tx, y: ty });
        }, 850);
        a.k++; a.nextT = a.t + 0.6;
      }
      if (a.k >= 5 && a.t > a.nextT + 0.9) { a.done = true; a.tele = false; }
    }
  }

  M.makeBoss = (id, x, y) => new ({ jayadratha: Jayadratha, karna: Karna, ashwatthama: Ashwatthama, drona: Drona }[id])(id, x, y);
})();
