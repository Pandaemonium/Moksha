'use strict';
// ───────────────────────────────────────────────────────────────
//  Foes and their behaviour
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const C = M.combat;
  const RED = '#ff3a3a';

  class Enemy {
    constructor(id, x, y, opts = {}) {
      const def = (this.def = opts.def || M.ENEMIES[id]);
      this.id = M.uid(); this.kind = id; this.name = def.name;
      this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.kbx = 0; this.kby = 0;
      const depth = opts.depthScale || 1;
      this.elite = !!opts.elite;
      this.scale = this.elite ? 1.18 : 1;
      this.r = def.r * this.scale;
      this.maxHp = Math.round(def.hp * depth * (this.elite ? 2 : 1));
      this.hp = this.maxHp;
      this.maxArmor = this.elite ? Math.round(this.maxHp * 0.5) : 0;
      this.armor = this.maxArmor;
      this.dmg = Math.round(def.dmg * (opts.dmgScale || 1) * (this.elite ? 1.25 : 1));
      this.heavy = !!def.heavy;
      this.big = this.elite;
      this.face = Math.PI / 2; this.walk = M.rand(10);
      this.state = 'spawn'; this.stateT = 0; this.active = false; this.spawnTime = opts.spawnDelay ?? 0.75;
      this.status = {}; this.flash = 0; this.visH = def.r * 3.2 * this.scale;
      this.glow = def.body.glow;
      this.cool = M.rand(0.4, 1.4);
      this.strafe = M.chance(0.5) ? 1 : -1;
      this.t0 = M.rand(10);
      if (this.elite) this.name = 'Elite ' + this.name;
    }
    get stunned() { return (this.status.stun || 0) > 0 || (this.status.bind || 0) > 0 || (this.stun || 0) > 0; }

    setState(s) { this.state = s; this.stateT = 0; }

    update(dt) {
      const g = M.game, pl = g.player;
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 6);
      if (this.state === 'spawn') {
        if (this.stateT >= this.spawnTime) { this.active = true; if (M.ENEMIES[this.kind] && !this.isDummy) M.save.data.flags['foe_' + this.kind] = 1; this.setState('idle'); M.audio.sfx('spawn', { vol: 0.4 }); M.fx.burst(this.x, this.y, this.glow, 12, { z: 30 }); }
        return;
      }
      C.tickStatus(this, dt);
      if (this.dead) return;
      if (this.stun > 0) this.stun -= dt;
      const slow = (this.status.soak > 0 ? 0.6 : 1);
      let mx = 0, my = 0;
      const dp = M.dist(this.x, this.y, pl.x, pl.y);
      const ap = M.angle(this.x, this.y, pl.x, pl.y);
      if (!this.stunned) {
        const r = this.ai(dt, dp, ap, slow);
        if (r) { mx = r.x; my = r.y; }
      } else if (this.state === 'windup') this.setState('recover');
      // separation from other foes
      for (const o of g.room.enemies) {
        if (o === this || o.dead || !o.active) continue;
        const d2 = M.dist2(this.x, this.y, o.x, o.y), rr = this.r + o.r;
        if (d2 < rr * rr && d2 > 0.01) {
          const d = Math.sqrt(d2), push = (rr - d) * 0.5;
          this.x += ((this.x - o.x) / d) * push; this.y += ((this.y - o.y) / d) * push;
        }
      }
      // knockback & wall slam
      const kb = Math.hypot(this.kbx, this.kby);
      this.x += (mx + this.kbx) * dt; this.y += (my + this.kby) * dt;
      const kd = Math.exp(-7 * dt);
      this.kbx *= kd; this.kby *= kd;
      const hitWall = g.collideWorld(this);
      if (this.slamT > 0) {
        this.slamT -= dt;
        if (hitWall && kb > 180 && this.slamPending) {
          const dmg = this.slamPending; this.slamPending = 0;
          M.fx.burst(this.x, this.y, '#c8ffe8', 14, { z: 30, max: 360 });
          M.audio.sfx('hitHeavy'); g.shake(5);
          if (pl.mods.flags.maelstrom) this.status.bind = 1.5;
          C.hit(this, dmg, { src: 'status', color: '#b8ffe0', noCrit: true });
        }
      }
      this.moving = Math.hypot(mx, my) > 20;
      if (this.moving) this.walk += dt * 5;
      if (this.kind === 'ratha') this.spin = (this.spin || 0) + (Math.hypot(mx, my) * dt) / 18;
    }

    // steering toward a point with obstacle avoidance
    steer(tx, ty, speed) {
      const g = M.game;
      let dx = tx - this.x, dy = ty - this.y;
      const l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      for (const o of g.room.obstacles) {
        const ox = o.x - this.x, oy = o.y - this.y;
        const d = Math.hypot(ox, oy);
        const lim = o.r + this.r + 50;
        if (d < lim && (ox * dx + oy * dy) > 0) {
          const side = ox * dy - oy * dx > 0 ? 1 : -1;
          const w = ((lim - d) / lim) * 1.6;
          const px = -dy * side, py = dx * side;
          dx += px * w; dy += py * w;
          const nl = Math.hypot(dx, dy) || 1; dx /= nl; dy /= nl;
        }
      }
      return { x: dx * speed, y: dy * speed };
    }

    ai(dt, dp, ap, slow) {
      const d = this.def, g = M.game, pl = g.player;
      const spd = d.speed * slow;
      this.cool -= dt;
      switch (d.ai) {
        case 'melee': case 'swarm': {
          if (this.state === 'idle') {
            this.face = ap;
            if (dp < d.range + 30 && this.cool <= 0) { this.setState('windup'); this.lungeA = ap; M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(ap) * d.lunge * 0.45, this.y + Math.sin(ap) * d.lunge * 0.45, this.r * 1.6, d.windup, RED); return null; }
            const jit = d.ai === 'swarm' ? Math.sin(g.time * 6 + this.t0) * 0.7 : 0;
            const tx = pl.x + Math.cos(ap + Math.PI / 2) * 60 * jit, ty = pl.y + Math.sin(ap + Math.PI / 2) * 60 * jit;
            if (dp > d.range * 0.7) return this.steer(tx, ty, spd);
            return null;
          }
          if (this.state === 'windup') { if (this.stateT >= d.windup) { this.setState('attack'); this.hitDone = false; M.audio.sfx('swing', { pitch: 0.8 }); } return null; }
          if (this.state === 'attack') {
            const dur = 0.18;
            if (!this.hitDone && M.dist(this.x, this.y, pl.x, pl.y) < this.r + pl.r + 26) { this.hitDone = true; pl.hurt(this.dmg, this, this); }
            if (this.stateT >= dur) { this.setState('recover'); this.cool = d.recover; }
            const ls = (d.lunge * 0.45) / dur;
            return { x: Math.cos(this.lungeA) * ls, y: Math.sin(this.lungeA) * ls };
          }
          if (this.state === 'recover') { if (this.stateT >= d.recover * 0.6) this.setState('idle'); return null; }
          break;
        }
        case 'ranged': {
          if (this.state === 'idle') {
            this.face = ap;
            if (this.cool <= 0 && dp < 800) { this.setState('windup'); this.aimA = ap; return null; }
            let tx = this.x, ty = this.y;
            if (dp < d.prefer - 80) { tx = this.x - Math.cos(ap) * 100; ty = this.y - Math.sin(ap) * 100; }
            else if (dp > d.prefer + 120) { tx = pl.x; ty = pl.y; }
            else { tx = this.x + Math.cos(ap + Math.PI / 2 * this.strafe) * 100; ty = this.y + Math.sin(ap + Math.PI / 2 * this.strafe) * 100; if (Math.random() < dt * 0.5) this.strafe *= -1; }
            return this.steer(tx, ty, spd * 0.8);
          }
          if (this.state === 'windup') {
            this.aimA = M.lerp(this.aimA, ap, dt * 3); this.face = this.aimA;
            if (this.stateT < 0.05) M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(ap) * 460, this.y + Math.sin(ap) * 460, 4, d.windup, '#ff9a3c');
            if (this.stateT >= d.windup) {
              const n = this.elite ? 3 : 1;
              for (let i = 0; i < n; i++) {
                const a = this.aimA + (i - (n - 1) / 2) * 0.18;
                C.proj({ team: 'enemy', kind: 'arrow', x: this.x + Math.cos(a) * 24, y: this.y + Math.sin(a) * 24, vx: Math.cos(a) * d.projSpeed, vy: Math.sin(a) * d.projSpeed, r: 8, life: 2, dmg: this.dmg, color: '#ff9a3c', owner: this });
              }
              M.audio.sfx('arrow', { vol: 0.6 });
              this.setState('recover'); this.cool = d.recover;
            }
            return null;
          }
          if (this.state === 'recover') { if (this.stateT >= 0.4) this.setState('idle'); return null; }
          break;
        }
        case 'charger': {
          if (this.state === 'idle') {
            this.face = ap;
            if (this.cool <= 0 && dp < 700) {
              this.setState('windup'); this.chargeA = ap;
              M.fx.telegraphLine(this.x, this.y, this.x + Math.cos(ap) * d.chargeSpeed * d.chargeTime, this.y + Math.sin(ap) * d.chargeSpeed * d.chargeTime, this.r * 2, d.windup, RED);
              M.audio.sfx('roar', { vol: 0.6 });
              return null;
            }
            return dp > 160 ? this.steer(pl.x, pl.y, spd) : null;
          }
          if (this.state === 'windup') { if (this.stateT >= d.windup) { this.setState('attack'); this.hitDone = false; } return null; }
          if (this.state === 'attack') {
            if (!this.hitDone && M.dist(this.x, this.y, pl.x, pl.y) < this.r + pl.r + 6) { this.hitDone = true; pl.hurt(this.dmg, this, this); }
            if (Math.random() < 0.5) M.fx.add({ type: 'smoke', x: this.x + M.rand(-20, 20), y: this.y, vy: -20, size: 14, color: '#a08a70', life: 0.6, alpha: 0.3 });
            const nx = this.x + Math.cos(this.chargeA) * 30, ny = this.y + Math.sin(this.chargeA) * 30;
            if (this.stateT > 0.1 && M.game.blocked(nx, ny, this.r)) { this.setState('recover'); this.stun = 1.1; this.cool = d.recover; M.game.shake(7); M.audio.sfx('hitHeavy'); M.fx.burst(this.x, this.y, '#ffe0a0', 16, { z: 30 }); return null; }
            if (this.stateT >= d.chargeTime) { this.setState('recover'); this.cool = d.recover; }
            return { x: Math.cos(this.chargeA) * d.chargeSpeed * slow, y: Math.sin(this.chargeA) * d.chargeSpeed * slow };
          }
          if (this.state === 'recover') { if (this.stateT >= 0.6) this.setState('idle'); return null; }
          break;
        }
        case 'caster': {
          if (this.state === 'idle') {
            this.face = ap;
            if (this.cool <= 0) {
              if (Math.random() < 0.4 || dp < 180) { this.setState('vanish'); return null; }
              this.setState('windup'); return null;
            }
            return this.steer(this.x + Math.cos(ap + Math.PI / 2 * this.strafe) * 100, this.y + Math.sin(ap + Math.PI / 2 * this.strafe) * 100, spd * 0.6);
          }
          if (this.state === 'vanish') {
            this.alpha = Math.max(0, 1 - this.stateT / 0.3);
            if (this.stateT >= 0.3 && !this.moved) {
              this.moved = true;
              const room = g.room;
              for (let k = 0; k < 10; k++) {
                const a = M.rand(TAU), r = M.rand(300, 460);
                const nx = M.clamp(pl.x + Math.cos(a) * r, 60, room.w - 60), ny = M.clamp(pl.y + Math.sin(a) * r, 60, room.h - 60);
                if (!g.blocked(nx, ny, this.r)) { this.x = nx; this.y = ny; break; }
              }
              M.fx.burst(this.x, this.y, this.glow, 10, { z: 40 });
            }
            if (this.stateT >= 0.6) { this.alpha = 1; this.moved = false; this.setState('windup'); }
            return null;
          }
          if (this.state === 'windup') {
            this.attacking = true;
            if (this.stateT >= d.windup) {
              this.attacking = false;
              if (d.homing) {
                for (let i = -1; i <= 1; i++) {
                  const a = ap + i * 0.5;
                  C.proj({ team: 'enemy', kind: 'orb', x: this.x, y: this.y, vx: Math.cos(a) * d.projSpeed, vy: Math.sin(a) * d.projSpeed, r: 9, life: 3.2, dmg: this.dmg, color: this.glow, homing: 2.2, owner: this });
                }
              } else {
                const n = this.elite ? 14 : 10, off = M.rand(TAU);
                for (let i = 0; i < n; i++) {
                  const a = off + (i / n) * TAU;
                  C.proj({ team: 'enemy', kind: 'orb', x: this.x, y: this.y, vx: Math.cos(a) * d.projSpeed, vy: Math.sin(a) * d.projSpeed, r: 9, life: 4, dmg: this.dmg, color: this.glow, owner: this });
                }
              }
              M.audio.sfx('shoot', { pitch: 0.7 });
              this.setState('recover'); this.cool = d.recover;
            }
            return null;
          }
          if (this.state === 'recover') { this.attacking = false; if (this.stateT >= 0.5) this.setState('idle'); return null; }
          break;
        }
        case 'spitter': {
          if (this.state === 'idle') {
            this.face = ap;
            if (this.cool <= 0 && dp < 750) { this.setState('windup'); this.target = { x: pl.x + pl.vx * 0.4, y: pl.y + pl.vy * 0.4 }; return null; }
            let tx = this.x, ty = this.y;
            if (dp < d.prefer - 60) { tx = this.x - Math.cos(ap) * 100; ty = this.y - Math.sin(ap) * 100; } else if (dp > d.prefer + 150) { tx = pl.x; ty = pl.y; }
            else return null;
            return this.steer(tx, ty, spd);
          }
          if (this.state === 'windup') {
            this.attacking = true;
            if (this.stateT >= d.windup) {
              this.attacking = false;
              const shots = this.elite ? 3 : 1;
              for (let i = 0; i < shots; i++) {
                const tx = this.target.x + (i ? M.rand(-120, 120) : 0), ty = this.target.y + (i ? M.rand(-90, 90) : 0);
                const flight = 0.85;
                M.fx.telegraphCircle(tx, ty, 72, flight, '#7aff8a');
                C.proj({ team: 'none', kind: 'spit', x: this.x, y: this.y, vx: (tx - this.x) / flight, vy: (ty - this.y) / flight, r: 6, life: flight, dmg: 0, color: '#7aff8a', ghost: true, silent: true,
                  onDie: (b) => { C.zone({ team: 'enemy', kind: 'venom', x: b.x, y: b.y, r: 72, life: 4, dmg: Math.round(this.dmg * 0.6), tickEvery: 0.5, owner: this }); M.audio.sfx('water', { vol: 0.5 }); } });
              }
              M.audio.sfx('shoot', { pitch: 0.6 });
              this.setState('recover'); this.cool = d.recover;
            }
            return null;
          }
          if (this.state === 'recover') { if (this.stateT >= 0.5) this.setState('idle'); return null; }
          break;
        }
        case 'sweeper': {
          if (this.state === 'idle') {
            this.face = ap;
            if (dp < d.range && this.cool <= 0) { this.setState('windup'); M.fx.telegraphCircle(this.x, this.y, d.range, d.windup, RED); return null; }
            return this.steer(pl.x, pl.y, spd);
          }
          if (this.state === 'windup') { this.attacking = true; if (this.stateT >= d.windup) { this.attacking = false; this.setState('recover'); this.cool = d.recover; M.fx.ring(this.x, this.y, d.range, '#7ab8ff', 0.3, 8); M.audio.sfx('swingHeavy'); if (M.dist(this.x, this.y, pl.x, pl.y) < d.range + pl.r) pl.hurt(this.dmg, this, this); } return null; }
          if (this.state === 'recover') { if (this.stateT >= 0.5) this.setState('idle'); return null; }
          break;
        }
        case 'bomber': {
          if (this.state === 'idle') {
            if (dp < 80) { this.setState('windup'); this.fuse = true; M.fx.telegraphCircle(this.x, this.y, 115, d.windup, '#ff6af0'); M.audio.sfx('warn'); return null; }
            return this.steer(pl.x, pl.y, spd);
          }
          if (this.state === 'windup') {
            if (this.stateT >= d.windup) {
              M.fx.ring(this.x, this.y, 115, '#ff6af0', 0.4, 12);
              M.fx.burst(this.x, this.y, '#ffb0ff', 24, { z: 26, max: 420 });
              M.audio.sfx('explode', { vol: 0.8 }); g.shake(7);
              if (M.dist(this.x, this.y, pl.x, pl.y) < 115 + pl.r) pl.hurt(this.dmg, null, this);
              for (const o of g.room.enemies) if (o !== this && !o.dead && o.active && M.dist(o.x, o.y, this.x, this.y) < 115) C.hit(o, 20, { src: 'status', noCrit: true });
              this.hp = 0; C.kill(this);
            }
            return null;
          }
          break;
        }
        case 'sentinel': {
          if (this.state === 'idle') {
            this.face = ap;
            if (this.cool <= 0) { this.setState('windup'); this.pattern = M.pick(['spiral', 'ring', 'spiral']); return null; }
            return dp > 260 ? this.steer(pl.x, pl.y, spd) : null;
          }
          if (this.state === 'windup') { this.attacking = true; if (this.stateT >= d.windup) { this.setState('fire'); this.shotT = 0; this.spinA = M.rand(TAU); } return null; }
          if (this.state === 'fire') {
            this.shotT -= dt;
            if (this.pattern === 'spiral') {
              if (this.shotT <= 0) {
                this.shotT = 0.09;
                this.spinA += 0.42;
                for (let k = 0; k < 3; k++) {
                  const a = this.spinA + (k / 3) * TAU;
                  C.proj({ team: 'enemy', kind: 'orb', x: this.x, y: this.y, vx: Math.cos(a) * d.projSpeed, vy: Math.sin(a) * d.projSpeed, r: 8, life: 4, dmg: this.dmg, color: '#ffcf4a', owner: this });
                }
                M.audio.sfx('shoot', { vol: 0.25, minGap: 0.08 });
              }
              if (this.stateT >= 2.0) { this.attacking = false; this.setState('recover'); this.cool = d.recover; }
            } else {
              if (this.shotT <= 0) {
                this.shotT = 0.55;
                const n = 18, off = M.rand(TAU);
                for (let i = 0; i < n; i++) { const a = off + (i / n) * TAU; C.proj({ team: 'enemy', kind: 'orb', x: this.x, y: this.y, vx: Math.cos(a) * d.projSpeed * 1.1, vy: Math.sin(a) * d.projSpeed * 1.1, r: 9, life: 4, dmg: this.dmg, color: '#ffcf4a', owner: this }); }
                M.audio.sfx('shoot', { pitch: 0.6 });
              }
              if (this.stateT >= 1.7) { this.attacking = false; this.setState('recover'); this.cool = d.recover; }
            }
            return null;
          }
          if (this.state === 'recover') { if (this.stateT >= 0.6) this.setState('idle'); return null; }
          break;
        }
      }
      return null;
    }

    draw(ctx, t) {
      const b = this.def.body;
      if (this.state === 'spawn') {
        const k = this.stateT / this.spawnTime;
        ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1, 0.55);
        ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, 0, 0, 70 * k + 10, this.glow, 0.6);
        ctx.strokeStyle = M.rgba(this.glow, 0.8); ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, (30 + i * 14) * k, t * 4 + i, t * 4 + i + 4); ctx.stroke(); }
        ctx.restore();
        return;
      }
      const winding = this.state === 'windup' || this.fuse;
      if (winding) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, this.x, this.y - this.visH * 0.45, this.visH * 0.9, RED, 0.25 + Math.sin(t * 30) * 0.1);
        ctx.restore();
      }
      if (this.elite) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        M.art.glow(ctx, this.x, this.y - this.visH * 0.4, this.visH, '#ffcf4a', 0.18);
        ctx.restore();
      }
      const o = { x: this.x, y: this.y, s: this.scale, face: this.face, t: t + this.t0, walk: this.walk, moving: this.moving, body: b, flash: this.flash, attacking: this.attacking || this.state === 'attack' || this.state === 'windup', fuse: this.fuse, spin: this.spin };
      ctx.save();
      if (this.alpha !== undefined) ctx.globalAlpha = this.alpha;
      switch (b.kind) {
        case 'soldier': {
          const wk = b.weapon === 'bow' ? 'bow' : b.weapon === 'shield' ? 'sword' : 'spear';
          let wAng = this.face;
          if (this.state === 'windup' && wk === 'spear') wAng = this.face + Math.PI * 0.08;
          M.art.humanoid(ctx, {
            x: this.x, y: this.y, s: this.scale, face: this.face, t: o.t, walk: this.walk, moving: this.moving,
            pal: { skin: '#8a7a9a', hair: '#1a1028', cloth: b.cloth, cloth2: M.shade(b.armor, -0.3), armor: b.armor, gold: '#c8a8e0', gem: b.glow },
            style: { crown: 'helm', shield: b.weapon === 'shield' ? b.armor : null, plume: b.glow },
            pal2: null, weapon: wk, wAng, wExtra: { draw: this.state === 'windup' ? Math.min(1, this.stateT / this.def.windup) : 0 },
            spectral: b.glow, eyes: b.glow, flash: this.flash, alpha: 0.95,
          });
          break;
        }
        case 'pishacha': M.art.pishacha(ctx, o); break;
        case 'elephant': M.art.elephant(ctx, o); break;
        case 'chariot': M.art.chariot(ctx, o); break;
        case 'vetala': M.art.vetala(ctx, o); break;
        case 'naga': M.art.naga(ctx, o); break;
        case 'bhuta': M.art.bhuta(ctx, o); break;
        case 'sentinel': M.art.sentinel(ctx, o); break;
      }
      ctx.restore();
      // status marks
      if (this.status.bind > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1, 0.5);
        ctx.strokeStyle = M.rgba('#9ff0ff', 0.9); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, this.r + 8, t * 3, t * 3 + 5); ctx.stroke();
        ctx.restore();
      }
      if (this.status.glare > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, this.x, this.y - this.visH - 6, 14, '#ffe27a', 0.8); ctx.restore(); }
    }

    drawBars(ctx) {
      if (this.state === 'spawn' || this.dead || this.isBoss) return;
      if (this.hp >= this.maxHp && this.armor >= this.maxArmor && !this.elite) return;
      const w = Math.max(44, this.r * 2.4), x = this.x - w / 2, y = this.y - this.visH - 18;
      ctx.fillStyle = 'rgba(10,0,10,0.7)'; ctx.fillRect(x - 1, y - 1, w + 2, 7);
      ctx.fillStyle = '#ff3a5a'; ctx.fillRect(x, y, w * Math.max(0, this.hp / this.maxHp), 5);
      if (this.maxArmor) {
        ctx.fillStyle = 'rgba(10,0,10,0.7)'; ctx.fillRect(x - 1, y - 7, w + 2, 5);
        ctx.fillStyle = '#9fc8ff'; ctx.fillRect(x, y - 6, w * (this.armor / this.maxArmor), 3);
      }
      const bs = this.status.burn;
      if (bs && bs.stacks > 0) {
        ctx.font = '700 12px Cinzel, serif'; ctx.textAlign = 'left';
        ctx.fillStyle = '#ff9a4a'; ctx.fillText('✹' + bs.stacks, x + w + 4, y + 6);
      }
    }
  }
  M.Enemy = Enemy;
})();
