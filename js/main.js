'use strict';
// ───────────────────────────────────────────────────────────────
//  MOKSHA — game loop, camera, rendering & scene flow
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, SCALE = 1;

  const G = (M.game = {
    time: 0, scene: 'title', room: null, player: null, run: null,
    cam: { x: 0, y: 0, shake: 0, sx: 0, sy: 0 }, hitstop: 0, slowmo: 0,
    timers: [], uiBlocking: false, cinematic: false, transitioning: false,
    flash: { color: '#ffffff', a: 0 }, stats: { dmgTaken: 0 }, camFocus: null,
  });

  G.after = (fn, ms = 0) => { G.timers.push({ t: G.time + ms / 1000, fn }); };
  G.shake = (n) => { if (M.save.data.settings.shake) G.cam.shake = Math.max(G.cam.shake, n); };
  G.flashScreen = (color, a) => { G.flash.color = color; G.flash.a = Math.max(G.flash.a, a); };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
    SCALE = H / 900;
    if (W / SCALE < 1000) SCALE = W / 1000; // keep enough width on portrait screens
  }
  window.addEventListener('resize', resize);
  resize();

  G.mouseWorld = () => {
    const I = M.input;
    return { x: (I.mx * DPR - W / 2) / SCALE + G.cam.x, y: (I.my * DPR - H / 2) / SCALE + G.cam.y };
  };

  // ── world collision ───────────────────────────────────────────
  G.blocked = (x, y, r) => {
    const room = G.room;
    if (x < r || y < r || x > room.w - r || y > room.h - r) return true;
    for (const o of room.obstacles) { const rr = o.r * (o.flat ? 1.15 : 1) + r; if (M.dist2(x, y, o.x, o.y) < rr * rr) return true; }
    return false;
  };
  G.collideWorld = (e) => {
    const room = G.room;
    let hit = false;
    for (const o of room.obstacles) {
      const rr = o.r * (o.flat ? 1.15 : 1) + e.r;
      const dx = e.x - o.x, dy = (e.y - o.y) * (o.flat ? 1.35 : 1);
      const d2 = dx * dx + dy * dy;
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) || 1;
        e.x = o.x + (dx / d) * rr; e.y = o.y + ((dy / d) * rr) / (o.flat ? 1.35 : 1);
        hit = true;
      }
    }
    const minY = 26;
    let inDoor = false;
    if (e === G.player) for (const d of room.doors) if (d.open && Math.abs(e.x - d.x) < 52) inDoor = true;
    const maxY = room.h - e.r;
    if (e.x < e.r) { e.x = e.r; hit = true; }
    if (e.x > room.w - e.r) { e.x = room.w - e.r; hit = true; }
    if (e.y < (inDoor ? -10 : minY)) { e.y = inDoor ? -10 : minY; hit = true; }
    if (e.y > maxY) { e.y = maxY; hit = true; }
    return hit;
  };

  // ── rooms & scenes ────────────────────────────────────────────
  G.setRoom = (room) => {
    G.room = room;
    const pl = G.player;
    pl.x = room.spawn.x; pl.y = room.spawn.y; pl.face = -Math.PI / 2;
    pl.onEnterRoom();
    G.cam.x = pl.x; G.cam.y = pl.y - 200;
    M.fx.clear();
    M.fx.initAmbient(room);
    G.lastKillPos = null;
    G.narayana = false;
  };

  G.transition = (fn) => {
    if (G.transitioning) return;
    G.transitioning = true;
    M.ui.fadeTo(1, 0.35, () => {
      fn();
      G.after(() => M.ui.fadeTo(0, 0.45, () => { G.transitioning = false; }), 50);
    });
  };

  G.toHub = (result) => {
    const s = M.save.data;
    G.scene = 'hub';
    G.run = null;
    G.cinematic = false; G.camFocus = null;
    M.ui.bossBar(null);
    const pl = G.player;
    pl.weaponId = s.weapon; pl.keepsake = s.keepsake;
    pl.resetForRun();
    G.setRoom(M.hub.build());
    M.audio.music('hub'); M.audio.setIntensity(0.5);
    M.ui.setMode('hub');
    M.ui.fadeTo(0, 1.0);
    M.save.write();
    if (result === 'death') G.after(() => M.ui.toast('The Wheel turns, and you wake on the bank of the Vaitarani.', '#e8d8c0', null, 4), 900);
  };

  G.beginRun = () => {
    if (G.transitioning) return;
    M.audio.sfx('gong', { pitch: 0.9 });
    G.transition(() => {
      G.scene = 'run';
      M.ui.setMode('run');
      M.runs.start();
    });
  };

  G.onEnemyKilled = (e) => {
    if (G.run && e.room === G.room) { G.run.kills++; G.lastKillPos = { x: e.x, y: e.y }; }
  };

  G.onPlayerDeath = (src) => {
    const s = M.save.data, run = G.run;
    G.slowmo = 2.5;
    M.audio.sfx('death');
    M.audio.music(null);
    M.ui.bossBar(null);
    const killer = src ? (src.isBoss ? src.name : src.name || 'the Wheel') : 'the Wheel';
    s.deaths++;
    s.lastRun = { result: 'death', region: run ? run.region : 0, killer, bossId: src && src.isBoss ? src.bossId : null };
    if (src && src.isBoss) s.bossDeaths[src.bossId] = (s.bossDeaths[src.bossId] || 0) + 1;
    M.save.write();
    G.after(() => {
      M.ui.deathScreen({
        killer, region: M.REGIONS[run ? run.region : 0].name, rooms: run ? run.depth : 0,
        kills: run ? run.kills : 0, punya: run ? run.punya : 0, garlands: run ? run.garlands : 0,
        time: run ? G.time - run.startTime : 0,
      }, () => { M.ui.fadeTo(1, 0.6, () => G.toHub('death')); });
    }, 1700);
  };

  // ── interaction ───────────────────────────────────────────────
  G.nearestInteractable = () => {
    const pl = G.player, room = G.room;
    if (!room) return null;
    let best = null, bd = 1e9;
    for (const it of room.interactables) {
      const d = M.dist(pl.x, pl.y, it.x, it.y);
      if (d < it.r && d < bd) { bd = d; best = it; }
    }
    for (const p of room.pickups) {
      if (p.price === undefined) continue;
      const d = M.dist(pl.x, pl.y, p.x, p.y);
      if (d < 80 && d < bd) {
        bd = d;
        const name = p.kind === 'boon' ? `Boon of ${M.GODS[p.god].name}` : { amrita: 'Amrita', heal: 'Ladoo of Kubera', heart: 'Heart Lotus', chisel: 'Chisel of Vishwakarma' }[p.kind];
        best = { label: `Buy ${name} — ${p.price} Kauri`, act: () => M.runs.collect(p) };
      }
    }
    return best;
  };
  G.tryInteract = () => {
    if (G.uiBlocking || G.cinematic) return;
    const it = G.nearestInteractable();
    if (it) { M.audio.sfx('uiSelect', { vol: 0.6 }); it.act(); }
  };

  // ── update ────────────────────────────────────────────────────
  let last = performance.now();
  function frame(now) {
    let rdt = Math.min(0.05, (now - last) / 1000);
    last = now;
    M.input.pollPad();
    update(rdt);
    render(rdt);
    M.input.endFrame();
    requestAnimationFrame(frame);
  }

  function update(rdt) {
    M.ui.update(rdt);
    if (M.input.pressed.has('pause') || M.input.pressed.has('boons')) M.ui.togglePause(M.input.pressed.has('boons'));
    if (G.scene === 'title') { G.time += rdt; return; }
    if (!G.room) return;
    let dt = rdt;
    if (G.uiBlocking) dt = 0;
    if (G.hitstop > 0) { G.hitstop -= rdt; dt *= 0.05; }
    if (G.slowmo > 0) { G.slowmo -= rdt; dt *= 0.35; }
    G.time += dt;
    // timers
    for (let i = G.timers.length - 1; i >= 0; i--) if (G.time >= G.timers[i].t) { const t = G.timers.splice(i, 1)[0]; t.fn(); }
    if (dt === 0) return;
    const room = G.room, pl = G.player;
    room.t += dt;
    pl.update(dt);
    for (const e of room.enemies) if (!e.dead) e.update(dt);
    for (const e of room.enemies) if (e.isDummy) { e.hp = e.maxHp; e.flash = Math.max(0, e.flash - dt * 2); }
    room.enemies = room.enemies.filter((e) => !e.dead || G.time - e.deathT < 0.01);
    M.combat.updateProjs(dt);
    M.combat.updateZones(dt);
    M.fx.update(dt);
    M.fx.updateAmbient(dt, room, G.time);
    if (room.dhumraHappy > 0) room.dhumraHappy -= dt;
    if (G.scene === 'run' && G.run) {
      M.runs.updateRoom(room, dt);
      // free pickups collect on touch
      for (const p of room.pickups.slice()) if (p.price === undefined && !p.taken && M.dist(pl.x, pl.y, p.x, p.y) < 56 && !G.uiBlocking) M.runs.collect(p);
      // doors
      if (!G.transitioning && !pl.dead) for (const d of room.doors) if (d.open && Math.abs(pl.x - d.x) < 56 && pl.y < 20) M.runs.useDoor(d);
    }
    // camera
    let tx = pl.x, ty = pl.y - 40;
    if (!M.input.usingPad && !G.cinematic) { const mw = G.mouseWorld(); tx += M.clamp((mw.x - pl.x) * 0.12, -90, 90); ty += M.clamp((mw.y - pl.y) * 0.12, -70, 70); }
    if (G.camFocus) { tx = G.camFocus.x; ty = G.camFocus.y; }
    const vw = W / SCALE, vh = H / SCALE;
    const minX = -200 + vw / 2, maxX = room.w + 200 - vw / 2, minY = -300 + vh / 2, maxY = room.h + (room.kind === 'hub' ? 260 : 130) - vh / 2;
    tx = minX > maxX ? room.w / 2 : M.clamp(tx, minX, maxX);
    ty = minY > maxY ? room.h / 2 : M.clamp(ty, minY, maxY);
    G.cam.x = M.damp(G.cam.x, tx, G.camFocus ? 3 : 7, rdt);
    G.cam.y = M.damp(G.cam.y, ty, G.camFocus ? 3 : 7, rdt);
    G.cam.shake = Math.max(0, G.cam.shake - rdt * 40);
    G.cam.sx = (Math.random() - 0.5) * G.cam.shake; G.cam.sy = (Math.random() - 0.5) * G.cam.shake;
    G.flash.a = Math.max(0, G.flash.a - rdt * 2.5);
  }

  // ── render ────────────────────────────────────────────────────
  function render(rdt) {
    const t = G.time;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (G.scene === 'title' || !G.room) { M.art.titleBackground(ctx, W, H, performance.now() / 1000); return; }
    const room = G.room, pl = G.player, reg = room.region;
    ctx.fillStyle = reg.wall; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(SCALE, 0, 0, SCALE, W / 2 - (G.cam.x + G.cam.sx) * SCALE, H / 2 - (G.cam.y + G.cam.sy) * SCALE);
    const Mg = M.world.MARGIN;
    ctx.drawImage(room.bg, -Mg, -Mg);
    // animated floor touches
    if (room.kind === 'hub') M.hub.drawUnder(ctx, room, t);
    drawWater(room, t);
    if (reg.shafts) drawShafts(room, t);
    M.fx.drawGround(ctx, t);
    for (const z of room.zones) M.combat.drawZone(ctx, z, t);
    M.rooms.drawDoors(ctx, room, t);
    // y-sorted world
    const list = [];
    for (const o of room.obstacles) if (!o.flat && !o.hidden) list.push({ y: o.y, d: () => drawProp(o, t) });
    for (const e of room.enemies) list.push({ y: e.y, d: () => (e.isDummy ? M.hub.drawDummy(ctx, e, t) : e.draw(ctx, t)) });
    for (const p of room.pickups) list.push({ y: p.y, d: () => M.rooms.drawPickup(ctx, p, t) });
    for (const n of room.npcs) list.push({ y: n.y, d: () => (n.id === 'kubera' ? drawKubera(n, t) : M.hub.drawNPC(ctx, n, t)) });
    list.push({ y: pl.y, d: () => pl.draw(ctx, t) });
    if (room.kind === 'hub') {
      list.push({ y: 250, d: () => M.hub.drawThrone(ctx, t) });
      list.push({ y: 420, d: () => M.hub.drawDesk(ctx, t) });
      list.push({ y: 600, d: () => M.hub.drawRack(ctx, t) });
      list.push({ y: 470, d: () => M.hub.drawAltar(ctx, t) });
      list.push({ y: 760, d: () => M.hub.drawGate(ctx, t) });
      list.push({ y: room.dhumra.y, d: () => M.art.buffalo(ctx, room.dhumra.x, room.dhumra.y, t, 1.1, room.dhumraHappy > 0 ? 1 : 0) });
    }
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.d();
    for (const b of room.projs) M.combat.drawProj(ctx, b, t);
    M.fx.draw(ctx, t);
    if (!room.noFg) ctx.drawImage(room.fg, -Mg, -Mg);
    M.fx.drawAmbient(ctx, t);
    // lights
    ctx.globalCompositeOperation = 'lighter';
    for (const L of room.lights) M.art.glow(ctx, L.x, L.y, L.r * (0.95 + Math.sin(t * 7 + L.x) * 0.04), L.color, 0.32);
    ctx.globalCompositeOperation = 'source-over';
    for (const e of room.enemies) if (!e.isDummy) e.drawBars(ctx);
    // screen space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = reg.tint; ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, reg.vignette);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    if (G.narayana) {
      ctx.fillStyle = `rgba(255,190,60,${0.08 + Math.sin(t * 6) * 0.03})`; ctx.fillRect(0, 0, W, H);
      if (pl.stillT > 0.35) { ctx.fillStyle = 'rgba(120,200,255,0.08)'; ctx.fillRect(0, 0, W, H); }
    }
    if (pl.hp < pl.maxHp * 0.25 && G.scene === 'run') {
      const lg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, `rgba(140,0,20,${0.3 + Math.sin(t * 5) * 0.1})`);
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    }
    if (G.flash.a > 0) { ctx.fillStyle = M.rgba(G.flash.color, G.flash.a * 0.5); ctx.fillRect(0, 0, W, H); }
  }

  function drawProp(o, t) {
    const pl = G.player;
    if (o.type === 'tree' || o.type === 'banyan') {
      // fade canopy if the player is behind it
      const behind = pl.y < o.y && Math.abs(pl.x - o.x) < (o.type === 'banyan' ? 180 : 110) && pl.y > o.y - (o.type === 'banyan' ? 320 : 220);
      o.fade = M.lerp(o.fade ?? 1, behind ? 0.45 : 1, 0.15);
    }
    M.art.prop(ctx, o, t, G.room.region);
  }
  function drawKubera(n, t) {
    const L = M.hub.NPC_LOOK.kubera, pl = G.player;
    M.art.humanoid(ctx, { x: n.x, y: n.y, s: L.s, face: M.angle(n.x, n.y, pl.x, pl.y), t, pal: L.pal, style: L.style });
    // pot of gold + mongoose
    ctx.save(); ctx.translate(n.x + 60, n.y);
    M.art.shadow(ctx, 0, 0, 30, 9);
    const g = ctx.createRadialGradient(-6, -26, 3, 0, -20, 30);
    g.addColorStop(0, '#fff0b0'); g.addColorStop(1, '#8a5a10');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -22, 26, 22, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    M.art.glow(ctx, 0, -46, 30, '#ffd24a', 0.7);
    for (let i = 0; i < 5; i++) M.art.glow(ctx, -12 + i * 6, -46 - ((t * 30 + i * 9) % 30), 5, '#fff0a0', 0.8);
    ctx.restore();
    ctx.save(); ctx.translate(n.x - 34, n.y - 104 * 0.98);
    ctx.fillStyle = '#a08060'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-14, -4 + Math.sin(t * 3) * 1.5, 7, 5.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1a1010'; ctx.fillRect(-17, -6, 2, 2);
    ctx.restore();
  }
  function drawWater(room, t) {
    for (const o of room.obstacles) {
      if (o.type !== 'pond' && o.type !== 'pool') continue;
      const rx = o.type === 'pool' ? 175 : o.r * 1.25, ry = o.type === 'pool' ? 108 : o.r * 0.85;
      ctx.save(); ctx.translate(o.x, o.y);
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const k = ((t * 0.25 + i / 5) % 1);
        ctx.strokeStyle = M.rgba('#bff4ff', 0.25 * (1 - k)); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(Math.sin(i * 3) * rx * 0.4, Math.cos(i * 2) * ry * 0.4, rx * k * 0.6, ry * k * 0.6, 0, 0, TAU); ctx.stroke();
      }
      M.art.glow(ctx, -rx * 0.3 + Math.sin(t * 0.7) * 20, -ry * 0.3, rx * 0.6, '#9fe8ff', 0.15);
      ctx.restore();
    }
  }
  function drawShafts(room, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const x = room.w * (0.15 + i * 0.25) + Math.sin(t * 0.2 + i) * 40;
      const g = ctx.createLinearGradient(x, -200, x + 300, room.h);
      g.addColorStop(0, M.rgba(room.region.light, 0.06 + Math.sin(t * 0.5 + i * 2) * 0.025)); g.addColorStop(1, M.rgba(room.region.light, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, -200); ctx.lineTo(x + 120, -200); ctx.lineTo(x + 520, room.h); ctx.lineTo(x + 260, room.h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // ── boot ──────────────────────────────────────────────────────
  M.boot = () => {
    if (M._booted) return;
    M._booted = true;
    M.save.load();
    const st = M.save.data.settings;
    Object.assign(M.audio.vol, { master: st.master, music: st.music, sfx: st.sfx });
    G.player = new M.Player();
    M.ui.init();
    M.ui.title();
    requestAnimationFrame(frame);
    window.__moksha = G; // debugging handle
  };

  G.newGame = () => {
    M.save.reset();
    M.save.write();
    M.ui.cutscene(M.CUTSCENES.prologue, () => {
      G.toHub();
      G.after(() => M.hub.talk('yama'), 1200);
    }, 'title');
  };
  G.continueGame = () => {
    M.ui.fadeTo(1, 0.6, () => G.toHub());
  };
})();
