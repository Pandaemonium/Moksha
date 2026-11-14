'use strict';
// ───────────────────────────────────────────────────────────────
//  Abhimanyu
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const C = M.combat;
  const BASE_HP = 60;

  class Player {
    constructor() {
      this.x = 0; this.y = 0; this.r = 19; this.vx = 0; this.vy = 0;
      this.face = 0; this.walk = 0; this.moving = false; this.visH = 80;
      this.hp = BASE_HP; this.maxHp = BASE_HP;
      this.state = 'idle'; this.stateT = 0;
      this.comboIdx = 0; this.comboWin = 0; this.atk = null; this.atkHitDone = false;
      this.dashT = 0; this.dashCharges = 1; this.dashMax = 1; this.dashRecharge = 0; this.dashDir = { x: 1, y: 0 };
      this.invulnT = 0; this.hurtT = 0; this.flash = 0; this.lastHurt = -99;
      this.astraCharges = 1; this.astraMax = 1; this.astraRegen = 0;
      this.wheelOut = false; this.bowCharge = 0;
      this.stillT = 0; this.attackCount = 0;
      this.boons = []; this.weaponId = 'khadga'; this.upgrades = [];
      this.defiance = 0; this.roomShieldLeft = 0; this.embraceUsed = false;
      this.scarf = Array.from({ length: 7 }, () => ({ x: 0, y: 0, px: 0, py: 0 }));
      this.kbx = 0; this.kby = 0;
      this.dead = false;
      this.rebuild();
    }

    get weapon() { return this._weapon; }

    rebuild(healDelta = true) {
      const S = M.save.data;
      const m = M.freshMods();
      // ledger
      const rank = (id) => S.ledger[id] || 0;
      m.allDmg += rank('focus') * 0.05;
      m.dmgTaken *= 1 - rank('kavach') * 0.04;
      // keepsake
      const ks = this.keepsake;
      if (ks === 'dhumra') m.dmgTaken *= 0.85;
      if (ks === 'chitragupta') m.kauriMult += 0.3;
      if (ks === 'nachiketa') m.dmg.astra += 0.25;
      // boons
      for (const b of this.boons) M.BOON_BY_ID[b.id].apply(m, M.boonValue(b));
      this.mods = m;
      const oldMax = this.maxHp;
      this.maxHp = BASE_HP + rank('vigor') * 6 + m.maxHp + (this.bonusHp || 0);
      if (healDelta && this.maxHp > oldMax) this.hp += this.maxHp - oldMax;
      this.hp = Math.min(this.hp, this.maxHp);
      this.dashMax = 1 + rank('dash') + m.dashCharges;
      this.dashCharges = Math.min(this.dashCharges, this.dashMax);
      this.astraMax = 1 + rank('astra') + (ks === 'nachiketa' ? 1 : 0);
      this.astraCharges = Math.min(this.astraCharges, this.astraMax);
      this._weapon = M.buildWeapon(this.weaponId, this.upgrades);
    }

    resetForRun() {
      this.boons = []; this.upgrades = []; this.bonusHp = 0;
      this.rebuild(false);
      this.hp = this.maxHp;
      this.dashCharges = this.dashMax; this.astraCharges = this.astraMax;
      this.state = 'idle'; this.dead = false; this.wheelOut = false;
      this.invulnT = 0;
    }

    onEnterRoom() {
      this.roomShieldLeft = this.mods.roomShield;
      this.embraceUsed = false;
      this.state = 'idle'; this.atk = null; this.wheelOut = false; this.bowCharge = 0;
      this.vx = this.vy = 0; this.kbx = this.kby = 0;
      this.dashCharges = this.dashMax;
      this.astraCharges = this.astraMax;
      this.scarf.forEach((p) => { p.x = p.px = this.x; p.y = p.py = this.y - 46; });
      if (this.keepsake === 'savitri' && M.game.scene === 'run') this.heal(4, true);
    }

    heal(n, quiet) {
      const before = this.hp;
      this.hp = Math.min(this.maxHp, this.hp + n);
      const got = Math.round(this.hp - before);
      if (got > 0 && !quiet) { M.fx.text(this.x, this.y - 30, '+' + got, '#7aff9a', 22); M.audio.sfx('heal'); }
      if (got > 0 && quiet) M.fx.add({ type: 'glow', x: this.x, y: this.y - 40, size: 30, color: '#7aff9a', life: 0.4 });
    }

    hurt(dmg, src, pos = {}) {
      const g = M.game, m = this.mods;
      if (this.dead || this.invulnT > 0 || g.scene === 'hub' || g.cinematic) return;
      if (Math.random() < m.dodge) {
        M.fx.text(this.x, this.y - 30, 'Dodge!', '#b8ffe0', 20);
        this.invulnT = 0.3;
        M.audio.sfx('wind', { vol: 0.5 });
        return;
      }
      if (this.roomShieldLeft > 0) {
        this.roomShieldLeft--;
        M.fx.text(this.x, this.y - 30, 'Kavacha!', '#ffe27a', 22);
        M.fx.ring(this.x, this.y, 80, '#ffe27a', 0.4, 8);
        M.audio.sfx('shield');
        this.invulnT = 0.5;
        return;
      }
      if (src && src.status && src.status.glare > 0) dmg *= 0.7;
      dmg = Math.max(1, Math.round(dmg * m.dmgTaken));
      if (m.retaliate && src && !src.dead && src.hp !== undefined) {
        M.fx.skybolt(src.x, src.y); M.audio.sfx('lightning');
        C.hit(src, m.retaliate, { src: 'lightning', color: '#9fe0ff', noStop: true });
      }
      this.hp -= dmg;
      this.lastHurt = g.time;
      this.flash = 1; this.hurtT = 0.25; this.invulnT = 0.75;
      g.stats.dmgTaken += dmg;
      M.fx.text(this.x, this.y - 30, '-' + dmg, '#ff4a5a', 26);
      M.fx.burst(this.x, this.y, '#ff3a4a', 14, { z: 40, max: 320 });
      M.audio.sfx('hurt');
      g.shake(10); g.hitstop = Math.max(g.hitstop, 0.08);
      g.flashScreen('#ff0030', 0.25);
      if (pos.x !== undefined) { const a = M.angle(pos.x, pos.y, this.x, this.y); this.kbx += Math.cos(a) * 260; this.kby += Math.sin(a) * 260; }
      if (m.embrace && !this.embraceUsed && this.hp > 0 && this.hp < this.maxHp * 0.25) {
        this.embraceUsed = true; this.invulnT = 1.6;
        this.heal(m.embrace);
        M.fx.ring(this.x, this.y, 140, '#ff3d7f', 0.6, 10);
        M.fx.text(this.x, this.y - 60, 'Mother’s Embrace', '#ff8ab8', 22);
      }
      if (this.hp <= 0) {
        if (g.run && g.run.defiance > 0) {
          g.run.defiance--;
          const frac = g.run.defianceFrac.shift() || 0.5;
          this.hp = Math.round(this.maxHp * frac);
          this.invulnT = 2;
          M.fx.ring(this.x, this.y, 220, '#ffe08a', 0.8, 14);
          M.fx.text(this.x, this.y - 70, 'Second Breath', '#ffe08a', 30);
          M.audio.sfx('heal'); M.audio.sfx('gong', { pitch: 1.4, vol: 0.6 });
          for (const e of g.room.enemies) if (!e.dead && M.dist(e.x, e.y, this.x, this.y) < 260) { const a = M.angle(this.x, this.y, e.x, e.y); e.kbx += Math.cos(a) * 600; e.kby += Math.sin(a) * 600; }
          return;
        }
        this.hp = 0; this.dead = true; this.state = 'dead'; this.stateT = 0;
        g.onPlayerDeath(src);
      }
    }

    aimAngle() {
      const I = M.input, g = M.game;
      if (I.usingPad) {
        if (I.padAim.x || I.padAim.y) return Math.atan2(I.padAim.y, I.padAim.x);
        const mv = I.moveVec();
        if (mv.x || mv.y) return Math.atan2(mv.y, mv.x);
        // soft auto-aim to nearest foe
        const n = C.nearestEnemy(this.x, this.y, 500);
        if (n) return M.angle(this.x, this.y, n.x, n.y);
        return this.face;
      }
      const w = g.mouseWorld();
      return M.angle(this.x, this.y - 30, w.x, w.y);
    }

    update(dt) {
      const g = M.game, I = M.input, m = this.mods, W = this.weapon;
      this.stateT += dt;
      this.invulnT -= dt; this.hurtT -= dt; this.flash = Math.max(0, this.flash - dt * 4);
      if (this.dead) { this.updateScarf(dt); return; }
      const canAct = !g.cinematic && !g.uiBlocking;
      const mv = canAct ? I.moveVec() : { x: 0, y: 0 };
      if (canAct) this.face = this.state === 'attack' || this.state === 'special' ? this.face : this.aimAngle();
      // stillness (for Narayanastra)
      const acting = mv.x || mv.y || this.state !== 'idle' || I.down.has('attack') || I.down.has('special');
      this.stillT = acting ? 0 : this.stillT + dt;

      // regen
      if (m.regen && g.time - this.lastHurt > 3 && this.hp < this.maxHp * 0.6 && g.scene === 'run') this.hp = Math.min(this.maxHp * 0.6, this.hp + m.regen * dt);
      // astra recharge
      if (this.astraCharges < this.astraMax) { this.astraRegen += dt; if (this.astraRegen >= 4.5) { this.astraRegen = 0; this.astraCharges++; } }
      // dash recharge
      if (this.state !== 'dash' && this.dashCharges < this.dashMax) { this.dashRecharge += dt; if (this.dashRecharge >= 0.42) { this.dashRecharge = 0; this.dashCharges = this.dashMax; } }

      const speed = 330 * m.speed;
      let tvx = mv.x * speed, tvy = mv.y * speed;

      // ── inputs ──
      if (canAct) {
        const dashP = I.pressed.has('dash');
        if (dashP && this.dashCharges > 0 && this.state !== 'dash' && !(this.state === 'special' && W.special.kind === 'leap')) this.startDash(mv);
        if (I.pressed.has('astra') && this.astraCharges > 0 && (this.state === 'idle' || this.state === 'dash') && g.scene === 'run') this.castAstra();
        const isBow = this.weaponId === 'dhanush';
        if (isBow) {
          if (I.down.has('attack') && (this.state === 'idle' || this.state === 'aim')) {
            if (this.state !== 'aim') { this.state = 'aim'; this.stateT = 0; this.bowCharge = 0; M.audio.sfx('bowstring', { vol: 0.5 }); }
            this.bowCharge = Math.min(1, this.bowCharge + dt / (W.combo[0].charge / m.attackSpeed));
            if (this.bowCharge >= 1 && !this._fullPing) { this._fullPing = true; M.audio.sfx('chime'); }
          }
          if (this.state === 'aim' && !I.down.has('attack')) this.fireArrow();
        } else if ((I.pressed.has('attack') || (I.down.has('attack') && this.comboWin > 0)) && (this.state === 'idle' || (this.state === 'dash' && this.stateT > 0.06))) {
          this.startAttack(this.state === 'dash');
        } else if (I.pressed.has('attack') && this.state === 'attack') this.buffered = 'attack';
        if (I.pressed.has('special') && (this.state === 'idle' || this.state === 'dash' || this.state === 'aim')) this.startSpecial();
        else if (I.pressed.has('special') && this.state === 'attack') this.buffered = 'special';
        if (I.pressed.has('interact')) g.tryInteract();
      }

      // ── states ──
      switch (this.state) {
        case 'dash': {
          const dDur = 0.17;
          const dSpeed = (235 * m.dashDist) / dDur;
          tvx = this.dashDir.x * dSpeed; tvy = this.dashDir.y * dSpeed;
          this.invulnT = Math.max(this.invulnT, 0.04);
          this.dashTick(dt);
          if (Math.random() < 0.9) M.fx.add({ type: 'glow', x: this.x, y: this.y - 34, size: 34, color: '#ffd07a', life: 0.25, alpha: 0.5 });
          if (this.stateT >= dDur) { this.endDash(); }
          break;
        }
        case 'attack': {
          const a = this.atk;
          const dur = a.dur / m.attackSpeed;
          const t = this.stateT / dur;
          tvx *= 0.15; tvy *= 0.15;
          if (t < 0.45 && a.lunge) {
            const ls = (a.lunge * (this.dashStrike ? 1.5 : 1)) / (dur * 0.45);
            tvx += Math.cos(this.face) * ls; tvy += Math.sin(this.face) * ls;
          }
          const hitAt = 0.28;
          if (!this.atkHitDone && t >= hitAt) { this.atkHitDone = true; this.doSwing(a); }
          if (t >= 1) {
            this.state = 'idle'; this.stateT = 0;
            this.comboWin = 0.34;
            this.comboIdx = (this.comboIdx + 1) % W.combo.length;
            if (this.buffered === 'attack') { this.buffered = null; this.startAttack(false); }
            else if (this.buffered === 'special') { this.buffered = null; this.startSpecial(); }
          }
          break;
        }
        case 'aim': tvx *= 0.45; tvy *= 0.45; break;
        case 'special': {
          const sp = W.special;
          const dur = sp.dur / m.attackSpeed;
          tvx *= sp.kind === 'whirl' ? 0.55 : 0.1; tvy *= sp.kind === 'whirl' ? 0.55 : 0.1;
          if (sp.kind === 'leap') {
            const k = Math.min(1, this.stateT / dur);
            this.x = M.lerp(this.leapFrom.x, this.leapTo.x, M.ease.inOutSine(k));
            this.y = M.lerp(this.leapFrom.y, this.leapTo.y, M.ease.inOutSine(k));
            this.leapH = Math.sin(k * Math.PI) * 90;
            tvx = tvy = 0;
            this.invulnT = Math.max(this.invulnT, 0.05);
          }
          if (!this.specialDone && this.stateT >= dur * (sp.kind === 'leap' ? 1 : 0.3)) { this.specialDone = true; this.doSpecial(); }
          if (this.stateT >= dur) {
            this.state = 'idle'; this.stateT = 0; this.leapH = 0;
            if (this.buffered) { const b = this.buffered; this.buffered = null; if (b === 'attack' && this.weaponId !== 'dhanush') this.startAttack(false); }
          }
          break;
        }
      }
      this.comboWin -= dt;
      if (this.comboWin <= 0 && this.state === 'idle') this.comboIdx = 0;

      // smooth velocity
      const accel = this.state === 'dash' ? 1 : 1 - Math.exp(-18 * dt);
      this.vx = M.lerp(this.vx, tvx, accel); this.vy = M.lerp(this.vy, tvy, accel);
      const kbd = Math.exp(-9 * dt);
      this.kbx *= kbd; this.kby *= kbd;
      this.x += (this.vx + this.kbx) * dt; this.y += (this.vy + this.kby) * dt;
      g.collideWorld(this);
      this.moving = Math.hypot(this.vx, this.vy) > 30;
      if (this.moving) this.walk += dt * 6 * (Math.hypot(this.vx, this.vy) / 330);
      this.updateScarf(dt);
    }

    updateScarf(dt) {
      const dir = Math.cos(this.face) >= 0 ? 1 : -1;
      const ax = this.x - dir * 6, ay = this.y - 45 - (this.leapH || 0);
      const pts = this.scarf;
      pts[0].x = ax; pts[0].y = ay;
      const wind = Math.sin(M.game.time * 3) * 20;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * 0.86, vy = (p.y - p.py) * 0.86;
        p.px = p.x; p.py = p.y;
        p.x += vx + (-dir * 30 + wind * 0.3) * dt; p.y += vy + 60 * dt;
      }
      for (let k = 0; k < 3; k++) for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, L = 6;
        const f = (d - L) / d;
        b.x -= dx * f; b.y -= dy * f;
      }
    }

    // ── dash ──
    startDash(mv) {
      const m = this.mods;
      let dx = mv.x, dy = mv.y;
      if (!dx && !dy) { dx = Math.cos(this.face); dy = Math.sin(this.face); }
      const l = Math.hypot(dx, dy) || 1;
      this.dashDir = { x: dx / l, y: dy / l };
      this.dashCharges--; this.dashRecharge = 0;
      if (this.state === 'aim') this.bowCharge = 0;
      this.state = 'dash'; this.stateT = 0; this.atk = null;
      this.invulnT = Math.max(this.invulnT, 0.2);
      this.dashHit = new Set(); this.dashTrailD = 0;
      M.audio.sfx('dash');
      M.fx.ring(this.x, this.y, 50, '#ffe0a0', 0.25, 4);
      for (const f of m.dashFx) {
        if (f.type === 'bolts') {
          const n = f.count + m.chainJumps;
          const foes = M.game.room.enemies.filter((e) => !e.dead && e.active && M.dist(e.x, e.y, this.x, this.y) < 340).sort((a, b) => M.dist2(a.x, a.y, this.x, this.y) - M.dist2(b.x, b.y, this.x, this.y)).slice(0, n);
          foes.forEach((e, i) => M.game.after(() => { if (e.dead) return; M.fx.skybolt(e.x, e.y); M.audio.sfx('lightning', { vol: 0.7 }); C.hit(e, f.dmg, { src: 'lightning', color: '#9fe0ff', noStop: true }); }, 30 + i * 60));
        }
        if (f.type === 'pool') {
          C.zone({ kind: 'pool', x: this.x, y: this.y, r: 95, life: 2.6, dmg: f.dmg, tickEvery: 0.45, fx: [{ type: 'soak' }], color: '#4ad0ff' });
          M.audio.sfx('water', { vol: 0.6 });
        }
      }
    }
    dashTick(dt) {
      const m = this.mods;
      for (const f of m.dashFx) {
        if (f.type === 'fireTrail') {
          this.dashTrailD += 235 / 0.17 * dt;
          if (this.dashTrailD > 45) {
            this.dashTrailD = 0;
            C.zone({ kind: 'fire', x: this.x, y: this.y, r: 38, life: 2.2, dmg: f.dmg, tickEvery: 0.5, fx: [{ type: 'burn', stacks: 1 }], color: '#ff9a4a' });
          }
        }
        if (f.type === 'gust') {
          for (const e of C.enemiesNear(this.x, this.y, 50)) {
            if (this.dashHit.has(e)) continue;
            this.dashHit.add(e);
            C.hit(e, f.dmg, { src: 'dash', x: this.x, y: this.y, kb: 520, color: '#c8ffe8', fx: m.flags.maelstrom ? [{ type: 'soak' }] : null });
          }
        }
      }
    }
    endDash() {
      const m = this.mods;
      this.state = 'idle'; this.stateT = 0;
      for (const f of m.dashFx) {
        if (f.type === 'flash') {
          M.fx.ring(this.x, this.y, 170, '#ffe27a', 0.35, 8);
          M.fx.add({ type: 'flash', x: this.x, y: this.y, r: 180, color: '#fff2a8', life: 0.2 });
          M.audio.sfx('sun', { vol: 0.5 });
          for (const e of C.enemiesNear(this.x, this.y, 170)) C.hit(e, f.dmg, { src: 'dash', color: '#ffe27a', fx: [{ type: 'glare' }], noStop: true });
        }
        if (f.type === 'pounce') {
          M.fx.ring(this.x, this.y, 120, '#ff3d7f', 0.35, 10);
          M.audio.sfx('roar', { vol: 0.5 });
          for (const e of C.enemiesNear(this.x, this.y, 120)) C.hit(e, f.dmg, { src: 'dash', x: this.x, y: this.y, kb: 300, color: '#ff8ab8' });
          M.game.shake(5);
        }
      }
    }

    // ── attack ──
    startAttack(fromDash) {
      const W = this.weapon;
      this.state = 'attack'; this.stateT = 0; this.atkHitDone = false;
      if (this.comboIdx >= W.combo.length) this.comboIdx = 0;
      this.atk = W.combo[this.comboIdx];
      this.dashStrike = fromDash;
      this.face = this.aimAngle();
      M.audio.sfx(this.atk.heavy ? 'swingHeavy' : 'swing', { pitch: M.rand(0.9, 1.1) });
    }
    doSwing(a) {
      const g = M.game, m = this.mods, W = this.weapon;
      const range = a.range, arc = a.arc;
      const col = M.WEAPONS[this.weaponId].color;
      M.fx.slash(this.x, this.y, this.face, Math.min(arc, TAU - 0.01), range, col, a.heavy ? 0.26 : 0.18, a.heavy ? 1.5 : 1);
      if (a.quake) { M.fx.ring(this.x, this.y, range, '#ff9f7a', 0.4, 12); g.shake(7); M.audio.sfx('hitHeavy', { pitch: 0.6 }); }
      this.attackCount++;
      let first = null;
      for (const e of g.room.enemies) {
        if (e.dead || !e.active) continue;
        if (!M.pointInArc(e.x, e.y, this.x, this.y, range + e.r, this.face, arc / 2 + 0.15)) continue;
        if (!first) first = e;
        const dmg = a.dmg * (this.dashStrike ? 1.5 : 1);
        C.hit(e, dmg, { src: 'attack', fx: m.attackFx, x: this.x, y: this.y, kb: a.knock || 140, heavy: a.heavy, crit: a.crit, stun: a.stun, color: col });
      }
      if (first && m.flags.thirdBolt && this.attackCount % 3 === 0) {
        const t = first;
        g.after(() => { if (!t.dead) { M.fx.skybolt(t.x, t.y); M.audio.sfx('lightning'); C.hit(t, 40, { src: 'lightning', color: '#9fe0ff', noStop: true }); } }, 60);
      }
      if (W.flags.crescent && this.comboIdx === 2) {
        C.proj({ kind: 'crescent', x: this.x + Math.cos(this.face) * 40, y: this.y + Math.sin(this.face) * 40, vx: Math.cos(this.face) * 1100, vy: Math.sin(this.face) * 1100, r: 40, life: 0.55, dmg: W.flags.crescent, pierce: 99, src: 'attack', fx: m.attackFx, color: '#cfe8ff' });
      }
    }
    fireArrow() {
      const W = this.weapon, m = this.mods, c = W.combo[0];
      const k = this.bowCharge;
      const full = k >= 1;
      const dmg = M.lerp(c.dmg, c.maxDmg, k * k);
      const big = full && W.flags.bigShot;
      this.face = this.aimAngle();
      C.proj({ kind: 'arrow', x: this.x + Math.cos(this.face) * 26, y: this.y + Math.sin(this.face) * 26, vx: Math.cos(this.face) * c.speed * (0.8 + k * 0.4), vy: Math.sin(this.face) * c.speed * (0.8 + k * 0.4), r: big ? 16 : 9, life: 0.75, dmg, pierce: full || W.flags.pierce ? 99 : 0, src: 'attack', fx: m.attackFx, color: full ? '#9fffcf' : '#e8f0d0', crit: c.crit || 0, big, kb: full ? 200 : 80 });
      M.audio.sfx('arrow', { pitch: full ? 0.8 : 1.1 });
      if (full) M.fx.ring(this.x + Math.cos(this.face) * 30, this.y + Math.sin(this.face) * 30, 40, '#9fffcf', 0.25, 4);
      this.attackCount++;
      if (m.flags.thirdBolt && this.attackCount % 3 === 0) {
        const n = C.nearestEnemy(this.x + Math.cos(this.face) * 300, this.y + Math.sin(this.face) * 300, 260);
        if (n) M.game.after(() => { if (!n.dead) { M.fx.skybolt(n.x, n.y); C.hit(n, 40, { src: 'lightning', color: '#9fe0ff', noStop: true }); } }, 120);
      }
      this.state = 'attackRecover'; this.stateT = 0; this._fullPing = false;
      this.bowCharge = 0;
      M.game.after(() => { if (this.state === 'attackRecover') this.state = 'idle'; }, (c.dur / m.attackSpeed) * 1000);
    }

    // ── special ──
    startSpecial() {
      const sp = this.weapon.special;
      if (sp.kind === 'throw' && this.wheelOut) return;
      this.face = this.aimAngle();
      this.state = 'special'; this.stateT = 0; this.specialDone = false; this.bowCharge = 0;
      if (sp.kind === 'leap') {
        const w = M.game.mouseWorld();
        const d = M.input.usingPad ? sp.range : Math.min(sp.range, M.dist(this.x, this.y, w.x, w.y + 30));
        this.leapFrom = { x: this.x, y: this.y };
        const tx = this.x + Math.cos(this.face) * d, ty = this.y + Math.sin(this.face) * d;
        const room = M.game.room;
        this.leapTo = { x: M.clamp(tx, 30, room.w - 30), y: M.clamp(ty, 30, room.h - 30) };
        M.audio.sfx('swingHeavy', { pitch: 0.7 });
      } else M.audio.sfx(sp.kind === 'volley' ? 'bowstring' : 'swingHeavy', { pitch: 1.1 });
    }
    doSpecial() {
      const g = M.game, m = this.mods, sp = this.weapon.special;
      const fx = m.specialFx;
      const col = M.WEAPONS[this.weaponId].color;
      switch (sp.kind) {
        case 'whirl': {
          M.fx.slash(this.x, this.y, this.face, TAU - 0.01, sp.radius, '#cfe8ff', 0.3, 1.4);
          M.fx.ring(this.x, this.y, sp.radius, '#cfe8ff', 0.3, 6);
          for (const e of C.enemiesNear(this.x, this.y, sp.radius)) C.hit(e, sp.dmg, { src: 'special', fx, x: this.x, y: this.y, kb: 260, color: '#cfe8ff' });
          M.audio.sfx('swing', { pitch: 0.7 });
          break;
        }
        case 'throw': {
          this.wheelOut = true;
          const self = this;
          const W = this.weapon;
          const b = C.proj({
            kind: 'wheel', x: this.x + Math.cos(this.face) * 30, y: this.y + Math.sin(this.face) * 30,
            vx: Math.cos(this.face) * sp.speed, vy: Math.sin(this.face) * sp.speed, r: sp.radius, life: 6, dmg: sp.dmg, pierce: 999, src: 'special', fx, color: '#ffcf6b', ghost: false,
            bounce: W.flags.bounce || 0, dist: 0, returning: false, kb: 220,
            update(b, dt) {
              b.dist += Math.hypot(b.vx, b.vy) * dt;
              if (!b.returning && b.dist >= sp.range * (1 + (W.flags.bounce ? 0.6 : 0))) { b.returning = true; b.hitSet.clear(); b.ghost = true; b.bounce = 0; }
              if (b.returning) {
                const a = M.angle(b.x, b.y, self.x, self.y);
                b.vx = Math.cos(a) * sp.speed * 1.15; b.vy = Math.sin(a) * sp.speed * 1.15;
                if (M.dist(b.x, b.y, self.x, self.y) < 40) { b.life = 0; }
              }
              if (Math.random() < 0.5) M.fx.add({ type: 'glow', x: b.x, y: b.y - 34, size: 26, color: '#ffcf6b', life: 0.2, alpha: 0.4 });
            },
            onDie() { self.wheelOut = false; M.audio.sfx('block', { vol: 0.5 }); },
          });
          M.audio.sfx('swingHeavy');
          b.silent = true;
          break;
        }
        case 'volley': {
          const n = sp.count;
          for (let i = 0; i < n; i++) {
            const a = this.face + (i - (n - 1) / 2) * (sp.spread / Math.max(1, n - 1)) * 2;
            C.proj({ kind: 'arrow', x: this.x + Math.cos(a) * 26, y: this.y + Math.sin(a) * 26, vx: Math.cos(a) * sp.speed, vy: Math.sin(a) * sp.speed, r: 9, life: 0.6, dmg: sp.dmg, pierce: this.weapon.flags.pierce ? 99 : 0, src: 'special', fx, color: '#9fffcf', kb: 120 });
          }
          M.audio.sfx('arrow', { pitch: 0.9 });
          break;
        }
        case 'leap': {
          M.fx.ring(this.x, this.y, sp.radius, '#ff9f7a', 0.45, 14);
          M.fx.burst(this.x, this.y, '#ffd0a0', 24, { z: 5, max: 420 });
          for (let i = 0; i < 8; i++) M.fx.add({ type: 'smoke', x: this.x + M.rand(-60, 60), y: this.y + M.rand(-20, 20), vy: -30, size: 18, color: '#8a6a5a', life: 0.8 });
          M.audio.sfx('explode', { vol: 0.7 }); g.shake(10);
          for (const e of C.enemiesNear(this.x, this.y, sp.radius)) C.hit(e, sp.dmg, { src: 'special', fx, x: this.x, y: this.y, kb: 420, heavy: true, color: col });
          break;
        }
      }
      for (const s of m.specialSpawn) {
        if (s.type === 'cyclone') {
          const cx = this.x + Math.cos(this.face) * 90, cy = this.y + Math.sin(this.face) * 90;
          C.zone({ kind: 'cyclone', x: cx, y: cy, r: 115, life: 2, dmg: s.dmg, tickEvery: 0.22, pull: 240, color: '#c8ffe8', fx: m.flags.maelstrom ? [{ type: 'soak' }] : null });
          M.audio.sfx('wind');
        }
      }
    }

    // ── astra ──
    castAstra() {
      const g = M.game, m = this.mods;
      this.astraCharges--; this.astraRegen = 0;
      const a = this.aimAngle(); this.face = a;
      const k = m.astra ? m.astra.kind : 'base';
      const mult = m.dmg.astra;
      const w = g.mouseWorld();
      const tx = M.input.usingPad ? this.x + Math.cos(a) * 380 : w.x, ty = M.input.usingPad ? this.y + Math.sin(a) * 380 : w.y + 30;
      M.audio.sfx('astra');
      const sx = this.x + Math.cos(a) * 30, sy = this.y + Math.sin(a) * 30;
      switch (k) {
        case 'base': {
          C.proj({ kind: 'astra', x: sx, y: sy, vx: Math.cos(a) * 1300, vy: Math.sin(a) * 1300, r: 14, life: 0.45, dmg: 0, color: '#ffe27a', src: 'astra',
            onHit(b) { b.life = 0; },
            onDie(b) {
              M.fx.ring(b.x, b.y, 110, '#ffe27a', 0.4, 10); M.fx.burst(b.x, b.y, '#fff2a8', 20, { z: 20, max: 380 });
              M.audio.sfx('explode', { vol: 0.6 }); g.shake(5);
              for (const e of C.enemiesNear(b.x, b.y, 110)) C.hit(e, 50 * mult, { src: 'astra', x: b.x, y: b.y, kb: 300, color: '#ffe27a', noStop: true });
            } });
          break;
        }
        case 'storm': {
          const d = Math.min(450, M.dist(this.x, this.y, tx, ty));
          const zx = this.x + Math.cos(a) * d, zy = this.y + Math.sin(a) * d;
          C.zone({ kind: 'storm', x: zx, y: zy, r: 160, life: 5, dmg: 0, tickEvery: 99, strikeT: 0,
            update(z, dt) {
              z.strikeT -= dt;
              if (z.strikeT <= 0) {
                z.strikeT = 0.5;
                const foes = C.enemiesNear(z.x, z.y, z.r);
                const n = 1 + Math.floor(m.chainJumps / 2);
                for (let i = 0; i < n && foes.length; i++) {
                  const e = foes.splice(Math.floor(Math.random() * foes.length), 1)[0];
                  M.fx.skybolt(e.x, e.y); M.audio.sfx('lightning', { vol: 0.6, minGap: 0.1 });
                  C.hit(e, m.astra.dmg * mult, { src: 'lightning', color: '#9fe0ff', noStop: true });
                }
              }
            } });
          break;
        }
        case 'fireball': {
          C.proj({ kind: 'fireball', x: sx, y: sy, vx: Math.cos(a) * 850, vy: Math.sin(a) * 850, r: 20, life: 0.6, dmg: 0, color: '#ff7a2f', src: 'astra',
            onHit(b) { b.life = 0; },
            onDie(b) {
              M.fx.ring(b.x, b.y, 160, '#ff7a2f', 0.5, 14); M.fx.burst(b.x, b.y, '#ffd15c', 30, { z: 20, max: 450 });
              M.fx.add({ type: 'flash', x: b.x, y: b.y, r: 220, color: '#ff7a2f', life: 0.3 });
              M.audio.sfx('explode'); g.shake(9);
              for (const e of C.enemiesNear(b.x, b.y, 160)) C.hit(e, m.astra.dmg * mult, { src: 'astra', fx: [{ type: 'burn', stacks: 3 }], x: b.x, y: b.y, kb: 300, color: '#ffb040', noStop: true });
            } });
          M.audio.sfx('fire');
          break;
        }
        case 'tornado': {
          C.zone({ kind: 'tornado', x: sx, y: sy, r: 95, life: 5, dmg: m.astra.dmg * mult, tickEvery: 0.25, pull: 200, src: 'astra', color: '#c8ffe8', vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, fx: m.flags.maelstrom ? [{ type: 'soak' }] : null,
            update(z, dt) {
              const n = C.nearestEnemy(z.x, z.y, 700);
              if (n) { const aa = M.angle(z.x, z.y, n.x, n.y); z.vx = M.lerp(z.vx, Math.cos(aa) * 180, dt * 2); z.vy = M.lerp(z.vy, Math.sin(aa) * 180, dt * 2); }
              z.x = M.clamp(z.x + z.vx * dt, 20, g.room.w - 20); z.y = M.clamp(z.y + z.vy * dt, 20, g.room.h - 20);
            } });
          M.audio.sfx('wind');
          break;
        }
        case 'wave': {
          C.proj({ kind: 'wave', x: sx, y: sy, vx: Math.cos(a) * 900, vy: Math.sin(a) * 900, r: 75, life: 0.7, dmg: m.astra.dmg * mult, pierce: 999, src: 'astra', ghost: true, fx: [{ type: 'soak' }, { type: 'knock', force: 500 }], color: '#9ff0ff', kb: 300 });
          M.audio.sfx('water');
          break;
        }
        case 'beam': {
          const L = 950;
          const ex = this.x + Math.cos(a) * L, ey = this.y + Math.sin(a) * L;
          M.fx.beam(this.x, this.y, ex, ey, '#ffe27a', 0.45, 26);
          M.audio.sfx('sun'); g.shake(6);
          for (const e of g.room.enemies) if (!e.dead && e.active && M.segDist(e.x, e.y, this.x, this.y, ex, ey) < 40 + e.r) C.hit(e, m.astra.dmg * mult, { src: 'astra', color: '#ffe27a', noStop: true });
          break;
        }
        case 'discs': {
          const self = this;
          C.zone({ kind: 'discs', x: this.x, y: this.y, r: 0, life: 6, dmg: m.astra.dmg * mult, tickEvery: 99, hitCd: new Map(),
            update(z, dt) {
              z.x = self.x; z.y = self.y;
              for (let i = 0; i < 3; i++) {
                const aa = z.t * 4.2 + (i / 3) * TAU;
                const dx = self.x + Math.cos(aa) * 105, dy = self.y + Math.sin(aa) * 70;
                for (const e of C.enemiesNear(dx, dy, 22)) {
                  const key = e.id + ':' + i;
                  if ((z.hitCd.get(key) || -9) + 0.4 > z.t) continue;
                  z.hitCd.set(key, z.t);
                  C.hit(e, z.dmg, { src: 'astra', color: '#ff8ab8', noStop: true, x: dx, y: dy, kb: 100 });
                }
              }
            },
            draw(ctx, z, t) {
              const fade = Math.min(1, (z.life - z.t) * 3);
              for (let i = 0; i < 3; i++) {
                const aa = z.t * 4.2 + (i / 3) * TAU;
                const dx = self.x + Math.cos(aa) * 105, dy = self.y + Math.sin(aa) * 70 - 34;
                ctx.save(); ctx.globalAlpha = fade;
                ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, dx, dy, 30, '#ff3d7f', 0.6); ctx.globalCompositeOperation = 'source-over';
                ctx.translate(dx, dy); ctx.rotate(t * 20);
                ctx.strokeStyle = '#ffc0d8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.stroke();
                for (let k = 0; k < 6; k++) { const ka = (k / 6) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(ka) * 13, Math.sin(ka) * 13); ctx.lineTo(Math.cos(ka + 0.4) * 19, Math.sin(ka + 0.4) * 19); ctx.stroke(); }
                ctx.restore();
              }
            } });
          break;
        }
      }
    }

    draw(ctx, t) {
      if (this.dead && this.stateT > 1.2) return;
      const blink = this.invulnT > 0 && this.hurtT < 0 && this.state !== 'dash' && Math.floor(t * 20) % 2 === 0;
      const W = M.WEAPONS[this.weaponId];
      let wk = { khadga: 'sword', chakra: 'chakra', dhanush: 'bow', gada: 'mace' }[this.weaponId];
      let wAng = this.face;
      let reach = 13;
      if (this.state === 'attack' && this.atk) {
        const dur = this.atk.dur / this.mods.attackSpeed;
        const k = Math.min(1, this.stateT / dur);
        const arc = Math.min(this.atk.arc, Math.PI * 1.6);
        const side = this.comboIdx % 2 ? 1 : -1;
        wAng = this.face + side * M.lerp(-arc / 2, arc / 2, M.ease.outCubic(Math.min(1, k * 1.6)));
        reach = 16;
      } else if (this.state === 'special' && this.weapon.special.kind === 'whirl') {
        wAng = this.face + this.stateT * 30; reach = 16;
      }
      if (this.wheelOut && wk === 'chakra') wk = null;
      const leap = this.leapH || 0;
      if (leap) M.art.shadow(ctx, this.x, this.y, 18 * (1 - leap / 200), 7);
      ctx.save();
      if (this.dead) ctx.globalAlpha = Math.max(0, 1 - this.stateT / 1.2);
      if (blink) ctx.globalAlpha *= 0.35;
      // aura
      ctx.globalCompositeOperation = 'lighter';
      M.art.glow(ctx, this.x, this.y - 40 - leap, 60, '#ffd07a', 0.18);
      ctx.globalCompositeOperation = 'source-over';
      const scarf = this.scarf.map((p) => ({ x: p.x - this.x, y: p.y - this.y + leap }));
      M.art.humanoid(ctx, {
        x: this.x, y: this.y - leap, s: 1, face: this.face, t, walk: this.walk, moving: this.moving && this.state !== 'dash',
        pal: { skin: '#c68655', hair: '#1a0f0c', cloth: '#f2d27a', cloth2: '#c8283a', armor: '#e6b84a', gold: '#ffd96a', gem: '#ff3a5a' },
        style: { crown: 'mukuta', hair: 'short', garland: false, sash: true },
        weapon: wk, wAng, reach, wExtra: { draw: this.state === 'aim' ? this.bowCharge : 0 },
        scarf, scarfColor: '#d8283a', flash: this.flash, noShadow: leap > 0,
      });
      ctx.restore();
      if (this.state === 'aim') {
        // aim guide
        ctx.save();
        ctx.strokeStyle = M.rgba('#9fffcf', 0.25 + this.bowCharge * 0.5); ctx.lineWidth = 2; ctx.setLineDash([8, 10]);
        ctx.beginPath(); ctx.moveTo(this.x + Math.cos(this.face) * 40, this.y - 30 + Math.sin(this.face) * 40); ctx.lineTo(this.x + Math.cos(this.face) * 420, this.y - 30 + Math.sin(this.face) * 420); ctx.stroke();
        ctx.restore();
      }
    }
  }
  M.Player = Player;
})();
