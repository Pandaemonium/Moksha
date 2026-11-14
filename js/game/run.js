'use strict';
// ───────────────────────────────────────────────────────────────
//  An escape attempt through the Wheel
// ───────────────────────────────────────────────────────────────
(() => {
  const R = M.rooms;
  const RUN = (M.runs = {});
  const S = () => M.save.data;
  const PLAN = (r) => (r === 0 ? ['c', 'c', 'c', 'c', 'c', 'c', 'boss'] : ['rest', 'c', 'c', 'c', 'c', 'c', 'boss']);
  const BOSS_OF = ['jayadratha', 'karna', 'ashwatthama', 'drona'];
  const GOD_IDS = Object.keys(M.GODS);

  RUN.start = () => {
    const g = M.game, s = S();
    const pl = g.player;
    pl.weaponId = s.weapon;
    pl.keepsake = s.keepsake;
    pl.resetForRun();
    const rk = (id) => s.ledger[id] || 0;
    const defFrac = [];
    for (let i = 0; i < rk('prana'); i++) defFrac.push(0.5);
    if (s.keepsake === 'yama') defFrac.push(0.4);
    g.run = {
      region: 0, roomNo: 0, kauri: rk('wealth') * 25, punya: 0, garlands: 0,
      defiance: defFrac.length, defianceFrac: defFrac, rerolls: rk('persuade'),
      chisels: 0, startTime: g.time, kills: 0, shopSlot: M.randi(2, 4), godsSeen: [], hearts: 0,
      depth: 0,
    };
    g.stats = { dmgTaken: 0 };
    s.runs++;
    M.save.write();
    RUN.enter({ kind: 'c', reward: { kind: 'boon', god: M.pick(GOD_IDS) } });
    M.ui.regionCard(M.REGIONS[0]);
    if (s.runs <= 2) g.after(() => M.ui.hint('<span class="key">WASD</span> Move &nbsp;&middot;&nbsp; <span class="key">Click</span> Attack &nbsp;&middot;&nbsp; <span class="key">Right Click</span> Special &nbsp;&middot;&nbsp; <span class="key">Space</span> Dash &nbsp;&middot;&nbsp; <span class="key">Q</span> Astra<br><em>Dashing makes you untouchable. Red markings show where blows will land.</em>', 11), 3200);
  };

  // ── room construction ─────────────────────────────────────────
  RUN.enter = (spec) => {
    const g = M.game, run = g.run;
    const reg = M.REGIONS[run.region];
    let room;
    if (spec.kind === 'boss') room = RUN.makeBoss(run.region);
    else if (spec.kind === 'shop') room = RUN.makeShop(reg);
    else if (spec.kind === 'rest') room = RUN.makeRest(reg);
    else room = RUN.makeCombat(reg, spec.reward);
    room.regionIdx = run.region;
    run.depth++;
    g.setRoom(room);
    const S0 = S();
    if (run.region > S0.maxRegion) S0.maxRegion = run.region;
    if (run.region >= 2 && !S0.flags.chandraAppears) { S0.flags.chandraAppears = 1; S0.chandraRun = S0.runs; }
    M.audio.music(room.kind === 'boss' ? null : room.kind === 'shop' ? 'shop' : room.kind === 'rest' ? 'rest' : reg.music);
    M.audio.setIntensity(room.kind === 'c' ? 0.8 : 0.3);
    if (room.onEnter) room.onEnter(room);
  };

  RUN.makeCombat = (reg, reward) => {
    const g = M.game, run = g.run;
    const room = R.blank('c', reg, M.randi(1500, 1900), M.randi(1050, 1250));
    room.reward = reward;
    R.placeProps(room, M.randi(2, 5));
    R.planWaves(room, run.region, run.roomNo, Math.min(S().wins, 5));
    R.finish(room);
    room.spawn = { x: room.w / 2, y: room.h - 110 };
    room.onEnter = () => { room.waveT = 0.9; };
    return room;
  };

  RUN.makeShop = (reg) => {
    const g = M.game, run = g.run;
    const room = R.blank('shop', reg, 1500, 1050);
    room.cleared = true; room.rewardTaken = true;
    room.obstacles.push({ type: 'urn', x: 420, y: 330, r: 22 }, { type: 'urn', x: 1080, y: 330, r: 22 });
    room.lights.push({ x: 750, y: 260, color: '#ffd24a', r: 260 });
    R.finish(room);
    room.spawn = { x: room.w / 2, y: room.h - 110 };
    room.npcs.push({ id: 'kubera', x: 750, y: 330, r: 34 });
    room.interactables.push({ x: 750, y: 330, r: 90, label: 'Talk to Kubera', act: () => RUN.talk('kubera') });
    const mult = 1 + run.region * 0.12;
    const items = [
      { kind: 'boon', god: M.pick(GOD_IDS), price: Math.round(150 * mult) },
      { kind: 'amrita', price: Math.round(115 * mult) },
      { kind: 'heal', price: Math.round(45 * mult) },
      M.chance(0.5) ? { kind: 'heart', price: Math.round(125 * mult) } : { kind: 'chisel', price: Math.round(165 * mult) },
    ];
    if (!g.player.boons.length) items[1] = { kind: 'boon', god: M.pick(GOD_IDS.filter((x) => x !== items[0].god)), price: Math.round(150 * mult) };
    items.forEach((it, i) => R.spawnPickup(room, it.kind, 390 + i * 240, 600, { god: it.god, price: it.price, shop: true }));
    R.makeDoors(room, RUN.nextRewards());
    room.doors.forEach((d) => (d.open = true));
    return room;
  };

  RUN.makeRest = (reg) => {
    const room = R.blank('rest', reg, 1400, 1000);
    room.cleared = true; room.rewardTaken = true;
    room.obstacles.push({ type: 'pool', flat: true, x: 700, y: 520, r: 120 });
    room.obstacles.push({ type: 'tree', x: 280, y: 380, r: 34, seed: 3 }, { type: 'tree', x: 1120, y: 380, r: 34, seed: 9 });
    room.lights.push({ x: 700, y: 480, color: '#9fe0ff', r: 300 });
    room.paintExtra = (ctx) => {
      // sacred pool with stone steps
      ctx.save(); ctx.translate(700, 520);
      for (let i = 3; i >= 0; i--) { ctx.fillStyle = M.shade(reg.stone, -0.1 - i * 0.08); ctx.beginPath(); ctx.ellipse(0, 6, 190 + i * 22, 120 + i * 15, 0, 0, Math.PI * 2); ctx.fill(); }
      const g = ctx.createRadialGradient(-40, -30, 10, 0, 0, 190);
      g.addColorStop(0, '#6ad8ff'); g.addColorStop(0.6, '#1a6aa0'); g.addColorStop(1, '#0a2a4a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 175, 108, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) M.world.flower(ctx, Math.cos(i) * 120, Math.sin(i * 1.7) * 60, 14, '#ffb0d0', '#fff0f6', 'lotus');
      ctx.restore();
    };
    R.finish(room);
    room.spawn = { x: room.w / 2, y: room.h - 100 };
    room.interactables.push({ x: 700, y: 520, r: 210, label: 'Gaze into the Sacred Pool', act: () => RUN.usePool(room) });
    R.makeDoors(room, RUN.nextRewards());
    room.doors.forEach((d) => (d.open = true));
    return room;
  };

  RUN.makeBoss = (regionIdx) => {
    const g = M.game;
    const reg = M.REGIONS[regionIdx];
    const room = R.blank('boss', reg, 1900, 1300);
    for (const [x, y] of [[420, 420], [1480, 420], [420, 940], [1480, 940]]) room.obstacles.push({ type: regionIdx === 3 ? 'obelisk' : 'pillar', x, y, r: 30, h: 170 });
    for (const [x, y] of [[420, 420], [1480, 420], [420, 940], [1480, 940]]) if (regionIdx === 3) room.lights.push({ x, y: y - 140, color: '#ffcf4a', r: 200 });
    room.obstacles.push({ type: 'diya', x: 200, y: 80, r: 14 }, { type: 'diya', x: 1700, y: 80, r: 14 });
    room.lights.push({ x: 200, y: -5, color: '#ffb040', r: 160 }, { x: 1700, y: -5, color: '#ffb040', r: 160 });
    R.finish(room);
    room.spawn = { x: room.w / 2, y: room.h - 120 };
    const id = BOSS_OF[regionIdx];
    room.bossId = id;
    room.onEnter = () => {
      const boss = M.makeBoss(id, room.w / 2, room.h * 0.34);
      boss.room = room; boss.face = Math.PI / 2;
      room.enemies.push(boss); room.boss = boss;
      boss.onDeath = () => RUN.bossDefeated(room, boss);
      g.cinematic = true;
      g.camFocus = { x: boss.x, y: boss.y - 60, t: 2.2 };
      M.audio.sfx('bossIntro');
      g.after(() => {
        const s = S();
        const entry = M.dialogueFor(id, s);
        const finish = () => {
          s.bossMet[id] = (s.bossMet[id] || 0) + 1;
          M.save.write();
          M.ui.banner(M.BOSSES[id].name, M.BOSSES[id].title, boss.glow, true);
          M.audio.music('boss'); M.audio.setIntensity(1);
          g.after(() => { g.cinematic = false; g.camFocus = null; M.ui.bossBar(boss); }, 900);
        };
        if (entry && (!s.seen[entry.id] || M.chance(0.6))) M.ui.dialogue(entry, finish); else finish();
      }, 1100);
    };
    return room;
  };

  // ── reward doors ──────────────────────────────────────────────
  RUN.nextRewards = () => {
    const g = M.game, run = g.run, s = S();
    const plan = PLAN(run.region);
    const nextNo = run.roomNo + 1;
    if (nextNo >= plan.length) return [{ kind: 'next' }];
    const next = plan[nextNo];
    if (next === 'boss') return [{ kind: 'boss' }];
    if (next === 'rest') return [{ kind: 'rest' }];
    const n = M.chance(0.35) ? 3 : 2;
    const out = [];
    if (nextNo === run.shopSlot) out.push({ kind: 'shop' });
    const usedGods = new Set();
    const usedKinds = new Set(out.map((o) => o.kind));
    let guard = 30;
    while (out.length < n && guard-- > 0) {
      const w = {
        boon: 50, amrita: g.player.boons.length ? 12 : 0, kauri: usedKinds.has('kauri') ? 0 : 11, heart: usedKinds.has('heart') ? 0 : 7,
        punya: usedKinds.has('punya') ? 0 : 10, garland: usedKinds.has('garland') || !s.flags.intro ? 0 : 6,
        chisel: run.chisels < 2 && run.depth >= 3 && !usedKinds.has('chisel') ? 6 : 0,
      };
      const kind = M.weighted(Object.keys(w), (k) => w[k]);
      if (kind === 'boon') {
        const god = M.pick(GOD_IDS.filter((x) => !usedGods.has(x)));
        usedGods.add(god); out.push({ kind, god });
      } else { if (kind === 'amrita' && usedKinds.has('amrita')) continue; usedKinds.add(kind); out.push({ kind }); }
    }
    return M.shuffle(out);
  };

  RUN.useDoor = (door) => {
    const g = M.game, run = g.run;
    if (g.transitioning) return;
    M.audio.sfx('door');
    g.transition(() => {
      const rw = door.reward;
      if (rw.kind === 'next') {
        run.region++; run.roomNo = 0; run.shopSlot = M.randi(2, 4);
        RUN.enter({ kind: 'rest' });
        M.ui.regionCard(M.REGIONS[run.region]);
        return;
      }
      run.roomNo++;
      if (rw.kind === 'boss') RUN.enter({ kind: 'boss' });
      else if (rw.kind === 'shop') RUN.enter({ kind: 'shop' });
      else if (rw.kind === 'rest') RUN.enter({ kind: 'rest' });
      else RUN.enter({ kind: 'c', reward: rw });
    });
  };

  // ── clearing ──────────────────────────────────────────────────
  RUN.updateRoom = (room, dt) => {
    const g = M.game;
    if (room.kind === 'c' && !room.cleared) {
      const alive = room.enemies.filter((e) => !e.dead).length;
      if (room.waveT > 0) { room.waveT -= dt; if (room.waveT <= 0) R.spawnWave(room, room.waves[room.waveIdx++]); }
      else if (alive <= (room.waveIdx < room.waves.length ? 1 : 0)) {
        if (room.waveIdx < room.waves.length) room.waveT = alive ? 0.6 : 0.4;
        else if (alive === 0) RUN.clearRoom(room);
      }
    }
    for (const d of room.doors) if (d.open) d.openT += dt;
  };

  RUN.clearRoom = (room) => {
    const g = M.game, pl = g.player;
    room.cleared = true;
    M.audio.setIntensity(0.3);
    M.audio.sfx('gong', { pitch: 1.2, vol: 0.5 });
    if (pl.mods.clearHeal) pl.heal(pl.mods.clearHeal);
    const rw = room.reward;
    const px = M.clamp(g.lastKillPos ? g.lastKillPos.x : room.w / 2, 160, room.w - 160);
    const py = M.clamp(g.lastKillPos ? g.lastKillPos.y : room.h / 2, 240, room.h - 200);
    g.after(() => { R.spawnPickup(room, rw.kind, px, py, { god: rw.god }); }, 500);
    R.makeDoors(room, RUN.nextRewards());
  };

  RUN.openDoors = (room) => {
    room.rewardTaken = true;
    for (const d of room.doors) d.open = true;
    M.audio.sfx('door');
  };

  // ── pickups ───────────────────────────────────────────────────
  RUN.collect = (p) => {
    const g = M.game, run = g.run, s = S(), pl = g.player, room = g.room;
    if (p.taken) return;
    if (p.price !== undefined) {
      if (run.kauri < p.price) { M.ui.toast('Not enough Kauri', '#ff8a8a'); M.audio.sfx('uiBack'); return; }
      run.kauri -= p.price; M.audio.sfx('coin');
    }
    p.taken = true;
    room.pickups.splice(room.pickups.indexOf(p), 1);
    const done = () => { if (!p.shop) RUN.openDoors(room); };
    const reg = run.region;
    switch (p.kind) {
      case 'boon': RUN.godEncounter(p.god, () => RUN.offerBoons(p.god, done)); break;
      case 'amrita': RUN.offerAmrita(done); break;
      case 'chisel': run.chisels++; RUN.offerChisel(done); break;
      case 'kauri': {
        const n = Math.round(M.randi(35, 60) * (1 + reg * 0.3) * pl.mods.kauriMult);
        run.kauri += n; M.ui.toast(`+${n} Kauri`, '#ffe9c8', 'kauri'); M.audio.sfx('coin'); done(); break;
      }
      case 'punya': {
        const n = M.randi(7, 12) + reg * 3;
        run.punya += n; s.punya += n; M.ui.toast(`+${n} Punya`, '#ffcf4a', 'punya'); M.audio.sfx('pickup'); M.save.write(); done(); break;
      }
      case 'garland': {
        run.garlands++; s.garlands++; M.ui.toast('+1 Marigold Garland', '#ff9a1a', 'garland'); M.audio.sfx('pickup'); M.save.write(); done(); break;
      }
      case 'heart': {
        pl.bonusHp = (pl.bonusHp || 0) + 25; pl.rebuild(); pl.heal(25, true);
        M.ui.toast('Heart Lotus: +25 Max Health', '#ff6a8a', 'heart'); M.audio.sfx('heal'); done(); break;
      }
      case 'heal': {
        pl.heal(Math.round(pl.maxHp * 0.3)); M.ui.toast('Ladoo of Kubera: health restored', '#ffb060', 'heal'); done(); break;
      }
    }
  };

  RUN.godEncounter = (god, then) => {
    const s = S(), run = M.game.run;
    const entry = M.dialogueFor(god, s);
    const first = !s.godMet[god];
    const show = entry && (!entry.repeat || M.chance(0.45));
    const fin = () => { s.godMet[god] = (s.godMet[god] || 0) + 1; M.save.write(); then(); };
    if (show) M.ui.dialogue(entry, fin, { god }); else fin();
    if (first) M.audio.sfx('boon');
  };

  RUN.rollRarity = () => {
    const s = S();
    const grace = (s.ledger.grace || 0) * 0.05;
    const moon = M.game.player.keepsake === 'chandra' ? 0.22 : 0;
    const r = Math.random();
    const heroic = 0.015 + moon * 0.1, epic = 0.06 + grace * 0.3 + moon * 0.25, rare = 0.2 + grace + moon;
    if (r < heroic) return 3;
    if (r < heroic + epic) return 2;
    if (r < heroic + epic + rare) return 1;
    return 0;
  };

  RUN.boonOptions = (god) => {
    const pl = M.game.player;
    const owned = new Set(pl.boons.map((b) => b.id));
    const ownedGods = new Set(pl.boons.map((b) => M.BOON_BY_ID[b.id].god));
    const pool = M.BOONS.filter((b) => !b.duo && b.god === god && !owned.has(b.id) && (!b.req || b.req(pl.boons)));
    const duos = M.BOONS.filter((b) => b.duo && (b.god === god || b.god2 === god) && !owned.has(b.id) && ownedGods.has(b.god) && ownedGods.has(b.god2) &&
      pl.boons.some((x) => !M.BOON_BY_ID[x.id].duo && M.BOON_BY_ID[x.id].god === b.god) && pl.boons.some((x) => !M.BOON_BY_ID[x.id].duo && M.BOON_BY_ID[x.id].god === b.god2));
    // prefer slot boons when the player has few
    const sh = M.shuffle(pool.slice()).sort((a, b) => (a.slot === 'passive') - (b.slot === 'passive') + (Math.random() - 0.5) * 1.5);
    const picks = sh.slice(0, 3);
    if (duos.length && M.chance(0.4)) picks[Math.min(2, picks.length)] = M.pick(duos);
    return picks.filter(Boolean).map((b) => ({ id: b.id, rarity: b.duo ? 2 : RUN.rollRarity(), level: 1 }));
  };

  RUN.offerBoons = (god, done) => {
    const opts = RUN.boonOptions(god);
    if (!opts.length) { // nothing left: grant kauri
      M.game.run.kauri += 80; M.ui.toast(`${M.GODS[god].name} has nothing more to give. +80 Kauri`, '#ffe9c8'); done(); return;
    }
    M.ui.boonChoice(god, opts, (choice) => {
      RUN.grantBoon(choice);
      done();
    }, () => RUN.boonOptions(god));
  };

  RUN.grantBoon = (choice) => {
    const pl = M.game.player;
    const def = M.BOON_BY_ID[choice.id];
    if (def.slot !== 'passive') pl.boons = pl.boons.filter((b) => M.BOON_BY_ID[b.id].slot !== def.slot);
    pl.boons.push(choice);
    pl.rebuild();
    M.audio.sfx('boon');
    M.fx.ring(pl.x, pl.y, 160, M.GODS[def.god].color, 0.7, 10);
    M.fx.burst(pl.x, pl.y, M.GODS[def.god].color, 30, { z: 50 });
  };

  RUN.offerAmrita = (done) => {
    const pl = M.game.player;
    const cand = M.shuffle(pl.boons.filter((b) => !M.BOON_BY_ID[b.id].duo && M.BOON_BY_ID[b.id].grow !== 0)).slice(0, 3);
    if (!cand.length) { pl.bonusHp = (pl.bonusHp || 0) + 10; pl.rebuild(); M.ui.toast('The amrita strengthens you: +10 Max Health', '#7affe0'); done(); return; }
    M.ui.amritaChoice(cand, (b) => { b.level++; pl.rebuild(); M.audio.sfx('levelup'); M.fx.ring(pl.x, pl.y, 140, '#7affe0', 0.6, 8); done(); });
  };

  RUN.offerChisel = (done) => {
    const pl = M.game.player;
    const W = M.WEAPONS[pl.weaponId];
    const cand = M.shuffle(W.upgrades.filter((u) => !pl.upgrades.includes(u))).slice(0, 3);
    if (!cand.length) { M.game.run.kauri += 100; M.ui.toast('+100 Kauri', '#ffe9c8'); done(); return; }
    M.ui.chiselChoice(cand, (u) => { pl.upgrades.push(u); pl.rebuild(); M.audio.sfx('levelup'); done(); });
  };

  RUN.usePool = (room) => {
    const g = M.game, s = S(), pl = g.player;
    if (room.poolUsed) { M.ui.toast('The water is still.', '#9fe0ff'); return; }
    room.poolUsed = true;
    pl.heal(Math.round(pl.maxHp * 0.4));
    M.fx.ring(700, 520, 220, '#9fe0ff', 0.9, 10);
    const idx = s.visions || 0;
    const lines = idx < M.VISIONS.length ? M.VISIONS[idx] : M.pick(M.VISION_REPEAT);
    s.visions = idx + 1;
    M.save.write();
    M.ui.dialogue({ id: 'vision', lines }, () => {}, { vision: true });
  };

  RUN.talk = (who) => {
    const s = S();
    const e = M.dialogueFor(who, s);
    if (e) M.ui.dialogue(e, () => {});
  };

  // ── bosses ────────────────────────────────────────────────────
  RUN.bossDefeated = (room, boss) => {
    const g = M.game, s = S(), run = g.run;
    const id = boss.bossId;
    s.bossKills[id] = (s.bossKills[id] || 0) + 1;
    M.ui.bossBar(null);
    M.audio.music(null);
    g.slowmo = 1.4;
    g.shake(16);
    M.audio.sfx('gong', { pitch: 0.7 });
    for (let i = 0; i < 4; i++) g.after(() => { M.fx.ring(boss.x, boss.y, 250 + i * 80, boss.glow, 0.8, 14); M.fx.burst(boss.x, boss.y, boss.glow, 40, { z: 60, max: 500, life: 1.2 }); }, i * 180);
    // clear remaining foes
    for (const e of room.enemies) if (!e.dead && e !== boss) M.combat.kill(e);
    room.projs.length = 0;
    room.zones = room.zones.filter((z) => z.team !== 'enemy');
    g.narayana = false;
    M.save.write();
    g.after(() => {
      const lines = M.BOSS_DEFEAT[id];
      const line = lines[Math.min(lines.length - 1, (s.bossKills[id] || 1) - 1)];
      M.ui.dialogue({ id: 'defeat', lines: [[id, line]] }, () => {
        room.cleared = true;
        if (run.region === 3) { RUN.victory(); return; }
        R.spawnPickup(room, 'heart', room.w / 2 - 110, room.h * 0.45);
        R.spawnPickup(room, 'punya', room.w / 2 + 110, room.h * 0.45);
        if ((s.bossKills[id] || 0) <= 2) R.spawnPickup(room, 'garland', room.w / 2, room.h * 0.58);
        room.bossLoot = 2 + ((s.bossKills[id] || 0) <= 2 ? 1 : 0);
        R.makeDoors(room, [{ kind: 'next' }]);
        M.audio.music(M.REGIONS[run.region].music); M.audio.setIntensity(0.2);
      });
    }, 1600);
  };

  RUN.victory = () => {
    const g = M.game, s = S(), run = g.run;
    s.wins++;
    const t = g.time - run.startTime;
    if (!s.bestTime || t < s.bestTime) s.bestTime = t;
    s.lastRun = { result: 'win', region: 3, time: t };
    s.punya += 30; run.punya += 30;
    M.save.write();
    const scene = s.wins >= 3 && !s.flags.trueEnding ? 'trueEnding' : s.wins >= 2 ? 'victory2' : 'victory1';
    g.after(() => {
      M.ui.fadeTo(1, 1.5, () => {
        M.ui.cutscene(M.CUTSCENES[scene], () => {
          if (scene === 'trueEnding') { s.flags.trueEnding = 1; M.save.write(); M.ui.credits(() => g.toHub('win')); }
          else g.toHub('win');
        }, scene === 'trueEnding' ? 'ending' : 'rest');
      });
    }, 600);
  };
})();
