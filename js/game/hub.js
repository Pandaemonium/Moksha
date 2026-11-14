'use strict';
// ───────────────────────────────────────────────────────────────
//  The Court of Yama — hub between escapes
// ───────────────────────────────────────────────────────────────
(() => {
  const TAU = Math.PI * 2;
  const H = (M.hub = {});
  const S = () => M.save.data;

  H.NPC_LOOK = {
    yama: { s: 1.75, pal: { skin: '#34525a', hair: '#0a0a10', cloth: '#8a1a1a', cloth2: '#3a0a0a', armor: '#c89a3a', gold: '#e6b84a', gem: '#ff2a2a' }, style: { crown: 'horned', mustache: true, cape: '#4a0a10' }, weapon: 'danda' },
    chitragupta: { s: 1.12, pal: { skin: '#a8703f', hair: '#2a1a10', cloth: '#d8a34a', cloth2: '#8a3a1a', gold: '#e6b84a', gem: '#3ad0a0' }, style: { crown: 'turban', turban: '#c8502a', mustache: true, thread: true, robe: true }, weapon: 'pen' },
    nachiketa: { s: 0.82, pal: { skin: '#d29a68', hair: '#1a1010', cloth: '#f4ecd8', cloth2: '#d8c8a0', gold: '#c8a060' }, style: { hair: 'shikha', thread: true } },
    savitri: { s: 1.04, pal: { skin: '#b87a4e', hair: '#120a08', cloth: '#c8203a', cloth2: '#e6b84a', gold: '#ffd96a' }, style: { female: true, bindi: '#d8102a', garland: true } },
    chandra: { s: 1.25, pal: { skin: '#dfe8f5', hair: '#cfd8f0', cloth: '#e8f0ff', cloth2: '#a8b8e0', armor: '#c0d0f0', gold: '#f0f4ff', gem: '#9ac8ff' }, style: { crown: 'crescent', hair: 'long', float: true, robe: true, halo: '#cfe0ff', haloR: 30 } },
    kubera: { s: 1.2, pal: { skin: '#d8a060', hair: '#2a1a10', cloth: '#2a8a5a', cloth2: '#ffd24a', armor: '#ffd24a', gold: '#ffe08a', gem: '#3aff8a' }, style: { crown: 'tall', mustache: true, stout: true } },
  };

  H.build = () => {
    const reg = M.HUB_REGION;
    const room = M.rooms.blank('hub', reg, 2400, 1300);
    room.seed = 4242;
    room.noFg = true;
    room.cleared = true; room.rewardTaken = true;
    const s = S();
    room.obstacles.push(
      { type: 'throne', x: 1200, y: 240, r: 150, hidden: true },
      { type: 'desk', x: 1560, y: 420, r: 62, hidden: true },
      { type: 'banyan', x: 300, y: 1020, r: 50 },
      { type: 'rack', x: 400, y: 600, r: 40, hidden: true },
      { type: 'altar', x: 2040, y: 470, r: 30, hidden: true },
      { type: 'gate', x: 2250, y: 760, r: 70, hidden: true },
      { type: 'diya', x: 900, y: 300, r: 14 }, { type: 'diya', x: 1500, y: 300, r: 14 },
      { type: 'diya', x: 900, y: 980, r: 14 }, { type: 'diya', x: 1500, y: 980, r: 14 },
      { type: 'pillar', x: 700, y: 360, r: 30, h: 190 }, { type: 'pillar', x: 1700, y: 360, r: 30, h: 190 },
      { type: 'pillar', x: 700, y: 1120, r: 30, h: 190 }, { type: 'pillar', x: 1700, y: 1120, r: 30, h: 190 },
      { type: 'urn', x: 1040, y: 1000, r: 22 }, { type: 'urn', x: 1360, y: 1000, r: 22 },
      { type: 'urn', x: 1900, y: 1000, r: 22 }, { type: 'tree', x: 2150, y: 1120, r: 34, seed: 21 },
    );
    for (const o of room.obstacles) if (o.type === 'diya') room.lights.push({ x: o.x, y: o.y - 85, color: '#ffb040', r: 180 });
    room.lights.push({ x: 1200, y: 180, color: '#ff5a3a', r: 340 }, { x: 2250, y: 700, color: '#ffcf4a', r: 260 }, { x: 1560, y: 360, color: '#ffd080', r: 160 });
    room.paintExtra = (ctx, rng) => {
      // red runner carpet
      ctx.save();
      ctx.fillStyle = '#6a1020';
      ctx.fillRect(1100, 320, 200, 820);
      ctx.fillRect(1100, 680, 1150, 160);
      ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 4;
      ctx.strokeRect(1110, 330, 180, 800); ctx.strokeRect(1110, 690, 1130, 140);
      ctx.fillStyle = M.rgba('#e6b84a', 0.35);
      for (let y = 360; y < 1120; y += 50) { ctx.beginPath(); ctx.arc(1200, y, 7, 0, TAU); ctx.fill(); }
      // dais
      for (let i = 3; i >= 0; i--) { ctx.fillStyle = M.shade('#3a1a2a', -i * 0.08); M.rr(ctx, 880 - i * 30, 80 - i * 6, 640 + i * 60, 240 + i * 24, 30); ctx.fill(); }
      ctx.strokeStyle = M.rgba('#e6b84a', 0.6); ctx.lineWidth = 3; M.rr(ctx, 880, 80, 640, 240, 30); ctx.stroke();
      M.world.mandala(ctx, 1200, 720, 260, reg, rng, 0.16);
      ctx.restore();
      // river Vaitarani along the bottom
      ctx.save();
      const ry = 1300;
      ctx.fillStyle = M.shade(reg.stone, -0.2); ctx.fillRect(-400, ry - 10, 3200, 40);
      for (let x = -380; x < 2800; x += 60) { ctx.fillStyle = M.shade(reg.stone, -0.05 - rng() * 0.1); ctx.fillRect(x, ry - 8, 56, 26); }
      const g = ctx.createLinearGradient(0, ry + 20, 0, ry + 400);
      g.addColorStop(0, '#1a1040'); g.addColorStop(1, '#05030f');
      ctx.fillStyle = g; ctx.fillRect(-400, ry + 20, 3200, 400);
      ctx.restore();
    };
    M.rooms.finish(room);
    room.spawn = { x: 1200, y: 640 };
    // dummy
    const dummy = new M.Enemy('padati', 640, 620, { def: { name: 'Straw Rakshasa', hp: 999999, r: 22, speed: 0, ai: 'none', dmg: 0, body: { kind: 'dummy', glow: '#ffcf6b' }, heavy: true }, spawnDelay: 0 });
    dummy.active = true; dummy.state = 'idle'; dummy.isDummy = true; dummy.visH = 80;
    room.enemies.push(dummy);
    // NPCs
    room.npcs = [
      { id: 'yama', x: 1200, y: 290 },
      { id: 'chitragupta', x: 1560, y: 470 },
      { id: 'nachiketa', x: 520, y: 700 },
      { id: 'savitri', x: 420, y: 1110 },
    ];
    if (s.flags.chandraAppears) room.npcs.push({ id: 'chandra', x: 1650, y: 1250 });
    room.dhumra = { x: 940, y: 420 };
    room.interactables = [
      ...room.npcs.map((n) => ({ x: n.x, y: n.y, r: n.id === 'yama' ? 150 : 90, label: 'Talk', who: n.id, act: () => H.talk(n.id) })),
      { x: 1560, y: 360, r: 110, label: 'Ledger of Karma', act: () => M.ui.ledger(), alt: true },
      { x: 400, y: 600, r: 100, label: 'Choose Divine Arms', act: () => M.ui.armory() },
      { x: 940, y: 420, r: 100, label: 'Pet Dhumra', act: () => H.pet() },
      { x: 2040, y: 470, r: 90, label: 'Keepsakes', act: () => M.ui.keepsakes() },
      { x: 2250, y: 760, r: 120, label: 'Enter the Wheel', act: () => M.game.beginRun() },
    ];
    // ledger interactable overlaps chitragupta; make talk the closer target
    return room;
  };

  H.hasNew = (who) => {
    const e = M.dialogueFor(who, S());
    return e && !e.repeat;
  };

  H.talk = (who) => {
    const s = S();
    const e = M.dialogueFor(who, s);
    if (!e) return;
    M.ui.dialogue(e, () => H.offerGift(who));
  };

  H.offerGift = (who) => {
    const s = S();
    const aff = s.affinity[who] || 0;
    if (s.garlands <= 0 || aff >= M.MAX_AFFINITY) return;
    M.ui.choice(`Offer a marigold garland to ${M.CHARACTERS[who].name}? (${s.garlands} remaining)`, [
      { label: 'Offer Garland', act: () => H.gift(who) },
      { label: 'Not now', act: () => {} },
    ]);
  };

  const THANKS = {
    yama: ['Yama regards the garland for a long moment. Then he places it, carefully, around the horn of his crown.', 'Yama inclines his head. “Dharma notices kindness, child. So do I.”'],
    chitragupta: ['“A gift? For me? This is highly… I’ll need to log it.” He logs it. He is smiling.', '“Marigolds. My mother grew them.” He doesn’t say anything else for a while.'],
    nachiketa: ['“Is it for wearing or for eating?” He decides, after some thought, both.', 'Nachiketa wears the garland all day. Lord Yama pretends not to notice.'],
    savitri: ['“Oh, you charmer. Satyavan used to bring me these. Badly wrapped.”', 'Savitri tucks a single marigold behind her ear. “Go on, then. Make me proud.”'],
    chandra: ['The garland glows silver as he takes it. “You always did like bright things.”', 'Chandra holds the garland as though it might break. “Thank you, little star.”'],
    dhumra: ['Dhumra eats the garland. He appears deeply satisfied.', 'Dhumra snorts, then gently leans his enormous head against you.'],
  };

  H.gift = (who) => {
    const s = S();
    s.garlands--;
    s.affinity[who] = (s.affinity[who] || 0) + 1;
    const first = !s.keepsakes[who] && M.KEEPSAKES[who];
    if (first) s.keepsakes[who] = true;
    M.save.write();
    M.audio.sfx('boon');
    const line = M.pick(THANKS[who] || ['They accept your garland gratefully.']);
    M.ui.dialogue({ id: 'gift', lines: [['nar', line]] }, () => {
      if (first) M.ui.toast(`Keepsake received: ${M.KEEPSAKES[who].name}`, '#ffd96a', M.KEEPSAKES[who].icon, 4);
    });
  };

  H.pet = () => {
    const s = S();
    s.pets = (s.pets || 0) + 1;
    M.save.write();
    M.game.room.dhumraHappy = 2.5;
    M.audio.sfx('bell', { pitch: 0.6, vol: 0.5 });
    const lines = ['Dhumra, the great black buffalo of Death, rumbles contentedly.', 'Dhumra leans into your hand. Somewhere, a soul is collected slightly more gently.', 'Dhumra blinks one enormous, patient eye at you.', 'You scratch Dhumra behind the horns. He exhales a cloud of warm smoke.'];
    const extra = s.garlands > 0 && (s.affinity.dhumra || 0) < M.MAX_AFFINITY;
    M.ui.dialogue({ id: 'pet', lines: [['nar', lines[s.pets % lines.length] + (s.pets > 1 ? ` (Petted ${s.pets} times.)` : '')]] }, () => { if (extra) H.offerGift('dhumra'); });
  };

  // ── hub drawing ───────────────────────────────────────────────
  H.drawUnder = (ctx, room, t) => {
    // river shimmer + floating lamps
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const x = ((i * 137 + t * 22) % 3000) - 300, y = 1340 + (i % 5) * 50 + Math.sin(t + i) * 4;
      M.art.glow(ctx, x, y, 34, '#ffb040', 0.5);
      ctx.fillStyle = '#ffd080'; ctx.fillRect(x - 6, y, 12, 4);
    }
    for (let i = 0; i < 14; i++) {
      ctx.strokeStyle = M.rgba('#6a5ad8', 0.18); ctx.lineWidth = 2;
      const y = 1330 + i * 22;
      ctx.beginPath(); for (let x = -300; x < 2700; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.01 + t * 1.2 + i) * 4); ctx.stroke();
    }
    if (S().flags.chandraAppears) {
      M.art.glow(ctx, 1650, 1330, 180, '#cfe0ff', 0.4);
      ctx.fillStyle = M.rgba('#ffffff', 0.5); ctx.beginPath(); ctx.ellipse(1650, 1340, 70, 10, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  H.drawThrone = (ctx, t) => {
    ctx.save(); ctx.translate(1200, 250);
    M.art.shadow(ctx, 0, 0, 160, 30, 0.4);
    ctx.fillStyle = A.lg(ctx, -150, 0, 150, 0, [[0, '#1a0a14'], [0.5, '#3a1a2a'], [1, '#0a0408']]);
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-130, -260); ctx.quadraticCurveTo(0, -380, 130, -260); ctx.lineTo(150, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 4; ctx.stroke();
    // carved buffalo horns crest
    ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-60, -320); ctx.quadraticCurveTo(-170, -330, -150, -420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(60, -320); ctx.quadraticCurveTo(170, -330, 150, -420); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    M.art.glow(ctx, 0, -300, 60, '#ff3a2a', 0.6 + Math.sin(t * 1.5) * 0.15);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#c43c3c'; ctx.beginPath(); ctx.arc(0, -300, 16, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5a1020'; ctx.fillRect(-90, -100, 180, 60);
    ctx.strokeStyle = M.rgba('#e6b84a', 0.6); ctx.lineWidth = 2; ctx.strokeRect(-90, -100, 180, 60);
    ctx.restore();
  };
  const A = M.art;

  H.drawDesk = (ctx, t) => {
    ctx.save(); ctx.translate(1560, 420);
    M.art.shadow(ctx, 0, 0, 90, 20, 0.4);
    ctx.fillStyle = '#4a2a1a'; ctx.fillRect(-90, -60, 180, 60);
    ctx.fillStyle = '#6a3a20'; ctx.fillRect(-100, -74, 200, 16);
    ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 2; ctx.strokeRect(-100, -74, 200, 16);
    // great ledger
    ctx.fillStyle = '#8a1a1a'; ctx.fillRect(-60, -92, 120, 20);
    ctx.fillStyle = '#f0e0b8'; ctx.beginPath(); ctx.moveTo(-58, -92); ctx.quadraticCurveTo(-30, -104, 0, -94); ctx.quadraticCurveTo(30, -104, 58, -92); ctx.lineTo(58, -80); ctx.lineTo(-58, -80); ctx.fill();
    ctx.strokeStyle = M.rgba('#3a2010', 0.5); ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-50, -90 + i * 3); ctx.lineTo(-8, -90 + i * 3); ctx.moveTo(8, -90 + i * 3); ctx.lineTo(50, -90 + i * 3); ctx.stroke(); }
    // scroll pile
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#e8d0a0' : '#d8c090'; ctx.beginPath(); ctx.ellipse(-120 + i * 8, -20 - i * 12, 26, 9, 0.2, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, 0, -100, 70, '#ffd080', 0.4); ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  };

  H.drawRack = (ctx, t) => {
    ctx.save(); ctx.translate(400, 600);
    M.art.shadow(ctx, 0, 0, 70, 16, 0.35);
    ctx.fillStyle = '#4a2a1a'; ctx.fillRect(-70, -110, 10, 110); ctx.fillRect(60, -110, 10, 110); ctx.fillRect(-74, -114, 148, 10); ctx.fillRect(-74, -40, 148, 8);
    const ids = ['khadga', 'chakra', 'dhanush', 'gada'];
    const kinds = { khadga: 'sword', chakra: 'chakra', dhanush: 'bow', gada: 'mace' };
    ids.forEach((id, i) => {
      const owned = S().weapons[id];
      ctx.save(); ctx.globalAlpha = owned ? 1 : 0.3;
      M.art.weapon(ctx, kinds[id], -48 + i * 32, -30, -Math.PI / 2, 1, t * 0.1);
      ctx.restore();
      if (S().weapon === id) { ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, -48 + i * 32, -70, 30, '#ffd96a', 0.5); ctx.globalCompositeOperation = 'source-over'; }
    });
    ctx.restore();
  };

  H.drawAltar = (ctx, t) => {
    ctx.save(); ctx.translate(2040, 470);
    M.art.shadow(ctx, 0, 0, 40, 12, 0.35);
    ctx.fillStyle = '#3a2030'; ctx.fillRect(-34, -50, 68, 50);
    ctx.fillStyle = '#5a3040'; ctx.fillRect(-40, -58, 80, 10);
    ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 2; ctx.strokeRect(-40, -58, 80, 10);
    const k = S().keepsake;
    if (k) M.art.orb(ctx, M.KEEPSAKES[k].icon, 0, -90 + Math.sin(t * 2) * 4, 20, t);
    else { ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, 0, -80, 30, '#ffd96a', 0.3); ctx.globalCompositeOperation = 'source-over'; }
    ctx.restore();
  };

  H.drawGate = (ctx, t) => {
    ctx.save(); ctx.translate(2250, 760);
    M.art.shadow(ctx, 0, 10, 120, 28, 0.45);
    ctx.translate(0, -130);
    // stone frame
    ctx.fillStyle = '#2a1a24';
    ctx.beginPath(); ctx.ellipse(0, 0, 120, 150, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 5; ctx.stroke();
    // swirling chakravyuha portal: seven rings
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, 104, 134, 0, 0, TAU); ctx.clip();
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 140);
    g.addColorStop(0, '#fff0b0'); g.addColorStop(0.3, '#ff7a2a'); g.addColorStop(0.7, '#6a1040'); g.addColorStop(1, '#14040e');
    ctx.fillStyle = g; ctx.fillRect(-140, -160, 280, 320);
    ctx.globalCompositeOperation = 'lighter';
    for (let r = 1; r <= 7; r++) {
      ctx.strokeStyle = M.rgba(r % 2 ? '#ffcf4a' : '#ff6a8a', 0.55); ctx.lineWidth = 3;
      const rr = r * 17, dir = r % 2 ? 1 : -1;
      ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.82, rr, 0, t * 0.6 * dir + r, t * 0.6 * dir + r + 4.6); ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    M.art.glow(ctx, 0, 0, 200, '#ff9a3a', 0.25 + Math.sin(t * 2) * 0.05);
    ctx.restore();
  };

  H.drawDummy = (ctx, e, t) => {
    const wob = Math.sin(t * 18) * Math.max(0, e.flash) * 0.3;
    ctx.save(); ctx.translate(e.x, e.y);
    M.art.shadow(ctx, 0, 0, 20, 7);
    ctx.rotate(wob);
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-3, -80, 6, 80);
    ctx.fillStyle = '#d8b060'; ctx.beginPath(); ctx.ellipse(0, -50, 16, 26, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c8a050'; ctx.fillRect(-30, -66, 60, 8);
    ctx.fillStyle = '#e0c070'; ctx.beginPath(); ctx.arc(0, -86, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c03a2a'; ctx.beginPath(); ctx.moveTo(-10, -96); ctx.lineTo(-16, -112); ctx.lineTo(-4, -98); ctx.moveTo(10, -96); ctx.lineTo(16, -112); ctx.lineTo(4, -98); ctx.fill();
    ctx.fillStyle = '#1a0a0a'; ctx.fillRect(-6, -90, 3, 3); ctx.fillRect(3, -90, 3, 3); ctx.fillRect(-5, -82, 10, 2);
    if (e.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.flash; M.art.glow(ctx, 0, -60, 40, '#ffffff', 1); }
    ctx.restore();
  };

  H.drawNPC = (ctx, n, t) => {
    const L = H.NPC_LOOK[n.id];
    const pl = M.game.player;
    const face = M.angle(n.x, n.y, pl.x, pl.y);
    if (n.id === 'chandra') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, n.x, n.y - 70, 120, '#cfe0ff', 0.35); ctx.restore();
    }
    M.art.humanoid(ctx, { x: n.x, y: n.y, s: L.s, face: Math.abs(M.angDiff(face, Math.PI / 2)) < 1.4 ? face : Math.PI / 2 + (Math.cos(face) > 0 ? -0.3 : 0.3), t: t + n.x, walk: 0, moving: false, pal: L.pal, style: L.style, weapon: L.weapon, wAng: L.weapon === 'danda' ? -Math.PI / 2.3 : L.weapon === 'pen' ? -0.6 : undefined, alpha: n.id === 'chandra' ? 0.92 : 1 });
    if (H.hasNew(n.id)) {
      const y = n.y - 90 * L.s - 40 + Math.sin(t * 3) * 5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; M.art.glow(ctx, n.x, y, 26, '#ffd96a', 0.7); ctx.restore();
      ctx.font = '700 28px Cinzel, serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9a8'; ctx.strokeStyle = '#3a1a0a'; ctx.lineWidth = 4;
      ctx.strokeText('!', n.x, y + 10); ctx.fillText('!', n.x, y + 10);
    }
  };
})();
