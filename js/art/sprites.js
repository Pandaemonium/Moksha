'use strict';
// ───────────────────────────────────────────────────────────────
//  Procedural sprites: characters, foes, props
// ───────────────────────────────────────────────────────────────
(() => {
  const A = (M.art = M.art || {});
  const TAU = Math.PI * 2;

  A.glow = (ctx, x, y, r, color, a = 1) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, M.rgba(color, a));
    g.addColorStop(0.4, M.rgba(color, a * 0.35));
    g.addColorStop(1, M.rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  A.shadow = (ctx, x, y, rx, ry, a = 0.32) => {
    ctx.fillStyle = `rgba(10,0,20,${a})`;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  };
  const lg = (ctx, x0, y0, x1, y1, stops) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };
  A.lg = lg;
  const circle = (ctx, x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
  const limb = (ctx, x1, y1, x2, y2, w, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };

  // ── weapons ────────────────────────────────────────────────────
  A.weapon = (ctx, kind, x, y, ang, s = 1, t = 0, extra = {}) => {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    switch (kind) {
      case 'sword': {
        ctx.fillStyle = lg(ctx, 0, -3, 0, 3, [[0, '#ffffff'], [0.5, '#cfe8ff'], [1, '#7a9ac8']]);
        ctx.beginPath(); ctx.moveTo(6, -2.6); ctx.lineTo(44, -2.2); ctx.lineTo(52, 0); ctx.lineTo(44, 2.2); ctx.lineTo(6, 2.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e6b84a'; ctx.fillRect(3, -7, 4, 14);
        ctx.fillStyle = '#8a3a1a'; ctx.fillRect(-6, -2, 9, 4);
        circle(ctx, -7, 0, 2.6, '#ffd96a');
        break;
      }
      case 'chakra': {
        ctx.translate(20, 0);
        const r = extra.r || 17, spin = t * 14;
        ctx.rotate(spin);
        ctx.strokeStyle = '#7a4a1f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r + 2, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#a0682a'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
        circle(ctx, 0, 0, 4.5, '#ffd96a');
        break;
      }
      case 'bow': {
        const draw = extra.draw || 0;
        ctx.strokeStyle = '#7a4a1f'; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(2, -26); ctx.quadraticCurveTo(16, -14, 12, 0); ctx.quadraticCurveTo(16, 14, 2, 26); ctx.stroke();
        ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(2, -26); ctx.quadraticCurveTo(16, -14, 12, 0); ctx.quadraticCurveTo(16, 14, 2, 26); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,240,0.85)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(2, -26); ctx.lineTo(2 - draw * 16, 0); ctx.lineTo(2, 26); ctx.stroke();
        if (draw > 0) {
          ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(2 - draw * 16, 0); ctx.lineTo(34, 0); ctx.stroke();
          ctx.fillStyle = '#cfe8ff'; ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(32, -3.5); ctx.lineTo(32, 3.5); ctx.fill();
          if (draw >= 1) A.glow(ctx, 36, 0, 16, '#9fffcf', 0.8);
        }
        break;
      }
      case 'mace': {
        ctx.fillStyle = '#6a3b1f'; ctx.fillRect(-4, -2.5, 34, 5);
        ctx.fillStyle = '#e6b84a'; ctx.fillRect(26, -3.5, 4, 7);
        const g = ctx.createRadialGradient(40, -4, 2, 40, 0, 14);
        g.addColorStop(0, '#fff0b0'); g.addColorStop(0.5, '#e6b84a'); g.addColorStop(1, '#8a5a1a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(40, 0, 12, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(120,70,20,0.7)'; ctx.lineWidth = 1.4;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(40, 0, 12, i * 0.8, i * 0.8 + 0.5); ctx.stroke(); }
        circle(ctx, 53, 0, 3, '#ffd96a');
        break;
      }
      case 'spear': {
        ctx.fillStyle = '#5a3a2a'; ctx.fillRect(-14, -1.6, 56, 3.2);
        ctx.fillStyle = '#d8d8e8'; ctx.beginPath(); ctx.moveTo(42, -4); ctx.lineTo(56, 0); ctx.lineTo(42, 4); ctx.fill();
        ctx.fillStyle = '#c03a4a'; ctx.fillRect(38, -3, 3, 6);
        break;
      }
      case 'danda': {
        ctx.fillStyle = '#2a2030'; ctx.fillRect(-10, -2.5, 60, 5);
        ctx.fillStyle = '#e6b84a'; ctx.fillRect(44, -5, 10, 10); ctx.fillRect(-12, -3.5, 4, 7);
        circle(ctx, 58, 0, 6, '#c43c3c'); A.glow(ctx, 58, 0, 14, '#ff4a3a', 0.4);
        break;
      }
      case 'trident': {
        ctx.fillStyle = '#c8c8d8'; ctx.fillRect(-12, -1.8, 60, 3.6);
        ctx.strokeStyle = '#e8e8f8'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(62, 0); ctx.moveTo(48, -8); ctx.quadraticCurveTo(52, -2, 58, -8); ctx.moveTo(48, 8); ctx.quadraticCurveTo(52, 2, 58, 8); ctx.moveTo(48, -8); ctx.lineTo(48, 8); ctx.stroke();
        break;
      }
      case 'pen': {
        ctx.fillStyle = '#d8c090'; ctx.fillRect(0, -1.2, 22, 2.4);
        ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(22, -1.2); ctx.lineTo(27, 0); ctx.lineTo(22, 1.2); ctx.fill();
        break;
      }
      case 'blade2': { // naga curved blade
        ctx.fillStyle = lg(ctx, 0, -3, 0, 3, [[0, '#e0f0ff'], [1, '#6a8ab8']]);
        ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(26, -8, 38, 2); ctx.quadraticCurveTo(24, -1, 4, 2); ctx.fill();
        ctx.fillStyle = '#e6b84a'; ctx.fillRect(0, -4, 4, 8);
        break;
      }
    }
    ctx.restore();
  };

  // ── humanoid (player, NPCs, soldiers, bosses) ──────────────────
  // o: {x,y,s,face,t,walk,pal,style,weapon,wAng,wExtra,alpha,flash,spectral,eyes}
  A.humanoid = (ctx, o) => {
    const s = o.s || 1, t = o.t || 0, pal = o.pal, st = o.style || {};
    o.walk = o.walk || 0;
    const dir = Math.cos(o.face) >= 0 ? 1 : -1;
    const bob = o.moving ? Math.abs(Math.sin(o.walk * 2)) * 2.2 : Math.sin(t * 2.2) * 0.8;
    const stride = o.moving ? Math.sin(o.walk * 2) * 7 : 0;
    ctx.save();
    ctx.translate(o.x, o.y);
    if (!o.noShadow) A.shadow(ctx, 0, 0, 17 * s * (st.stout ? 1.25 : 1), 7 * s);
    if (o.spectral) {
      // wisps around the feet
      for (let i = 0; i < 4; i++) {
        const a = t * 1.7 + i * 1.6;
        A.glow(ctx, Math.cos(a) * 10 * s, -4 * s + Math.sin(a * 1.3) * 3, 16 * s, o.spectral, 0.22);
      }
    }
    ctx.scale(s, s);
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.translate(0, -bob);
    if (st.float) ctx.translate(0, -8 + Math.sin(t * 2) * 3);
    if (st.halo) {
      ctx.save();
      ctx.translate(0, -60);
      ctx.rotate(t * 0.2);
      const hr = st.haloR || 26;
      const g = ctx.createRadialGradient(0, 0, hr * 0.3, 0, 0, hr);
      g.addColorStop(0, M.rgba(st.halo, 0)); g.addColorStop(0.75, M.rgba(st.halo, 0.45)); g.addColorStop(1, M.rgba(st.halo, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, hr, 0, TAU); ctx.fill();
      if (st.rays) {
        ctx.strokeStyle = M.rgba(st.halo, 0.5); ctx.lineWidth = 1.5;
        for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * hr * 0.8, Math.sin(a) * hr * 0.8); ctx.lineTo(Math.cos(a) * hr * 1.25, Math.sin(a) * hr * 1.25); ctx.stroke(); }
      }
      ctx.restore();
    }
    const W = st.stout ? 1.35 : st.slim ? 0.85 : 1;
    ctx.save();
    ctx.scale(dir, 1);

    // cape / scarf (behind)
    if (o.scarf) {
      ctx.save(); ctx.scale(dir, 1); // scarf points are in world-relative space
      ctx.strokeStyle = o.scarfColor || '#d8283a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(o.scarf[0].x / s, o.scarf[0].y / s);
      for (let i = 1; i < o.scarf.length; i++) ctx.lineTo(o.scarf[i].x / s, o.scarf[i].y / s);
      ctx.stroke();
      ctx.strokeStyle = M.rgba('#ffd96a', 0.6); ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    }
    if (st.cape) {
      const sw = Math.sin(t * 2.5) * 3;
      ctx.fillStyle = st.cape;
      ctx.beginPath(); ctx.moveTo(-11 * W, -46); ctx.quadraticCurveTo(-20 * W - sw, -20, -16 * W - sw, 2); ctx.lineTo(10 * W, 0); ctx.lineTo(11 * W, -46); ctx.fill();
    }
    if (st.hair === 'long' || st.hair === 'wild' || st.female) {
      // back hair
      ctx.fillStyle = pal.hair;
      ctx.beginPath(); ctx.ellipse(-4, -54, 10, st.female ? 18 : 13, 0.2, 0, TAU); ctx.fill();
      if (st.female) { ctx.beginPath(); ctx.ellipse(-8, -34, 4, 12, 0.15, 0, TAU); ctx.fill(); }
    }

    // legs
    if (!st.female && !st.robe) {
      limb(ctx, -4, -22, -5 - stride * 0.6, -1, 5.5, pal.skin);
      limb(ctx, 4, -22, 5 + stride * 0.6, -1, 5.5, pal.skin);
      circle(ctx, -5 - stride * 0.6, -1, 3, M.shade(pal.skin, -0.3));
      circle(ctx, 5 + stride * 0.6, -1, 3, M.shade(pal.skin, -0.3));
      // dhoti
      ctx.fillStyle = pal.cloth;
      ctx.beginPath(); ctx.moveTo(-10 * W, -30); ctx.lineTo(10 * W, -30); ctx.lineTo(12 * W + stride * 0.3, -11); ctx.lineTo(1, -14); ctx.lineTo(-12 * W - stride * 0.3, -11); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = M.shade(pal.cloth, -0.25); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(-6, -13); ctx.moveTo(3, -28); ctx.lineTo(5, -13); ctx.stroke();
      ctx.fillStyle = pal.gold || '#e6b84a'; ctx.fillRect(-12 * W, -12.5, 6, 1.6); ctx.fillRect(6 * W, -12.5, 6, 1.6);
    } else {
      // sari / robe to the feet
      const sway = Math.sin(t * 2 + (o.walk || 0)) * 1.5;
      ctx.fillStyle = lg(ctx, 0, -32, 0, 0, [[0, pal.cloth], [1, M.shade(pal.cloth, -0.25)]]);
      ctx.beginPath(); ctx.moveTo(-10 * W, -32); ctx.lineTo(10 * W, -32); ctx.quadraticCurveTo(14 * W, -12, 13 * W + sway, 0); ctx.lineTo(-13 * W + sway, 0); ctx.quadraticCurveTo(-14 * W, -12, -10 * W, -32); ctx.fill();
      ctx.fillStyle = pal.gold || '#e6b84a';
      ctx.beginPath(); ctx.moveTo(-13 * W + sway, -1); ctx.lineTo(13 * W + sway, -1); ctx.lineTo(13 * W + sway, -4); ctx.lineTo(-13 * W + sway, -4); ctx.fill();
    }

    // torso
    const tw = 11 * W;
    ctx.fillStyle = pal.skin;
    ctx.beginPath(); ctx.moveTo(-tw + 2, -28); ctx.lineTo(-tw - 1, -46); ctx.quadraticCurveTo(0, -50, tw + 1, -46); ctx.lineTo(tw - 2, -28); ctx.closePath(); ctx.fill();
    if (pal.armor) {
      ctx.fillStyle = lg(ctx, -tw, -46, tw, -30, [[0, M.shade(pal.armor, 0.35)], [0.5, pal.armor], [1, M.shade(pal.armor, -0.35)]]);
      ctx.beginPath(); ctx.moveTo(-tw + 1, -30); ctx.lineTo(-tw, -45); ctx.quadraticCurveTo(0, -48, tw, -45); ctx.lineTo(tw - 1, -30); ctx.quadraticCurveTo(0, -27, -tw + 1, -30); ctx.fill();
      ctx.strokeStyle = M.rgba(pal.gold || '#ffe08a', 0.8); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(0, -30); ctx.stroke();
      circle(ctx, 0, -39, 2.4, pal.gem || '#ff3a5a');
    } else if (st.female) {
      ctx.fillStyle = pal.cloth2 || pal.cloth;
      ctx.beginPath(); ctx.moveTo(-tw, -44); ctx.quadraticCurveTo(0, -47, tw, -44); ctx.lineTo(tw - 1, -37); ctx.quadraticCurveTo(0, -35, -tw + 1, -37); ctx.fill();
    }
    if (st.thread) { ctx.strokeStyle = '#f8f0d8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -46); ctx.lineTo(8, -29); ctx.stroke(); }
    // pallu / sash across torso
    if (st.female || st.sash) {
      ctx.fillStyle = st.female ? M.shade(pal.cloth, 0.1) : pal.cloth2;
      ctx.beginPath(); ctx.moveTo(-tw - 1, -46); ctx.lineTo(-tw + 5, -47); ctx.lineTo(tw, -30); ctx.lineTo(tw - 6, -28); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = pal.gold || '#e6b84a'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    // belt
    ctx.fillStyle = pal.cloth2 || M.shade(pal.cloth, -0.2);
    ctx.fillRect(-tw + 1, -32, tw * 2 - 2, 4);
    if (pal.gold) { ctx.fillStyle = pal.gold; ctx.fillRect(-2, -32.5, 4, 5); }
    // necklace
    ctx.strokeStyle = pal.gold || '#e6b84a'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(0, -50, 7, 0.35, Math.PI - 0.35); ctx.stroke();
    if (st.garland) {
      ctx.strokeStyle = '#ff9a1a'; ctx.lineWidth = 3.4; ctx.setLineDash([2.2, 1.4]);
      ctx.beginPath(); ctx.arc(0, -48, 10, 0.25, Math.PI - 0.25); ctx.stroke(); ctx.setLineDash([]);
    }

    // back arm
    const shY = -44;
    if (!o.noBackArm) {
      limb(ctx, -tw + 1, shY, -tw - 2, -28 + Math.sin(o.walk * 2) * 2, 4.6, M.shade(pal.skin, -0.15));
    }

    // head
    const hy = -59;
    ctx.fillStyle = M.shade(pal.skin, -0.1); ctx.fillRect(-3, -53, 6, 5);
    const hg = ctx.createRadialGradient(3, hy - 3, 2, 0, hy, 11);
    hg.addColorStop(0, M.shade(pal.skin, 0.18)); hg.addColorStop(1, pal.skin);
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, hy, 9.2, 10, 0, 0, TAU); ctx.fill();
    // hair front
    ctx.fillStyle = pal.hair;
    if (st.hair === 'bald' || st.hair === 'shikha') {
      ctx.beginPath(); ctx.arc(0, hy - 1, 9.4, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
      if (st.hair === 'shikha') { ctx.beginPath(); ctx.ellipse(-5, hy - 10, 2.5, 4, -0.5, 0, TAU); ctx.fill(); }
    } else {
      ctx.beginPath(); ctx.arc(0, hy - 1, 9.8, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(9, hy + 1); ctx.quadraticCurveTo(0, hy - 6, -9.5, hy + 3); ctx.fill();
      if (st.hair === 'wild') {
        for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 10, hy + Math.sin(a) * 10, 4, 2, a, 0, TAU); ctx.fill(); }
      }
      if (st.hair === 'topknot') { ctx.beginPath(); ctx.arc(-2, hy - 12, 4.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8e0c8'; ctx.fillRect(-4, hy - 10, 4, 1.4); }
      if (st.female) { circle(ctx, -7, hy - 2, 5.2, pal.hair); circle(ctx, -9, hy - 1, 2.4, '#fff0f0'); circle(ctx, -10.5, hy + 1, 2, '#ff6a8a'); }
    }
    // beard
    if (st.beard) {
      ctx.fillStyle = st.beard;
      ctx.beginPath(); ctx.moveTo(-8, hy + 2); ctx.quadraticCurveTo(-6, hy + 16, 3, hy + 17); ctx.quadraticCurveTo(10, hy + 12, 9, hy + 2); ctx.quadraticCurveTo(3, hy + 7, -8, hy + 2); ctx.fill();
    }
    if (st.mustache) { ctx.strokeStyle = pal.hair; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(1, hy + 4.5); ctx.quadraticCurveTo(6, hy + 3, 9, hy + 5); ctx.stroke(); }
    // eyes
    if (o.eyes) {
      A.glow(ctx, 5, hy - 1, 7, o.eyes, 0.9);
      circle(ctx, 5, hy - 1, 1.6, '#ffffff');
    } else {
      circle(ctx, 5.5, hy - 1, 1.5, '#1a0e10');
      ctx.strokeStyle = '#1a0e10'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(3.5, hy - 4); ctx.lineTo(7.5, hy - 4.4); ctx.stroke();
    }
    // tilak / bindi / wound
    if (st.tilak) { ctx.fillStyle = st.tilak; ctx.fillRect(1.5, hy - 9, 1.6, 5); }
    if (st.bindi) circle(ctx, 2.5, hy - 5.5, 1.3, st.bindi);
    if (st.wound) { A.glow(ctx, 2.5, hy - 6, 10, '#ff2a4a', 0.7 + Math.sin(t * 5) * 0.2); circle(ctx, 2.5, hy - 6, 2.2, '#5a0010'); }
    // earring
    circle(ctx, -2.5, hy + 4, st.kundala ? 3 : 1.8, pal.gold || '#e6b84a');
    if (st.kundala) A.glow(ctx, -2.5, hy + 4, 9, '#ffd96a', 0.8);

    // headgear
    const G = pal.gold || '#e6b84a';
    switch (st.crown) {
      case 'mukuta': {
        ctx.fillStyle = lg(ctx, -8, hy - 24, 8, hy - 8, [[0, M.shade(G, 0.4)], [0.5, G], [1, M.shade(G, -0.3)]]);
        ctx.beginPath(); ctx.moveTo(-8.5, hy - 6); ctx.lineTo(-7, hy - 15); ctx.lineTo(-3, hy - 19); ctx.lineTo(0, hy - 27); ctx.lineTo(3, hy - 19); ctx.lineTo(7, hy - 15); ctx.lineTo(8.5, hy - 6); ctx.closePath(); ctx.fill();
        circle(ctx, 0, hy - 12, 2.2, pal.gem || '#ff3a5a');
        circle(ctx, 0, hy - 27, 1.6, '#fff4c0');
        break;
      }
      case 'tall': {
        ctx.fillStyle = lg(ctx, -9, hy - 32, 9, hy - 8, [[0, M.shade(G, 0.4)], [0.5, G], [1, M.shade(G, -0.35)]]);
        ctx.beginPath(); ctx.moveTo(-9.5, hy - 6); ctx.lineTo(-7, hy - 22); ctx.lineTo(-2, hy - 30); ctx.lineTo(0, hy - 36); ctx.lineTo(2, hy - 30); ctx.lineTo(7, hy - 22); ctx.lineTo(9.5, hy - 6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = M.shade(G, -0.4); ctx.lineWidth = 0.8;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-8 + k, hy - 10 - k * 7); ctx.lineTo(8 - k, hy - 10 - k * 7); ctx.stroke(); }
        circle(ctx, 0, hy - 14, 2.6, pal.gem || '#ff3a5a');
        break;
      }
      case 'helm': {
        ctx.fillStyle = pal.armor || '#5a5a7a';
        ctx.beginPath(); ctx.arc(0, hy - 2, 10.5, Math.PI, 0); ctx.lineTo(10.5, hy + 1); ctx.lineTo(-10.5, hy + 1); ctx.fill();
        ctx.fillStyle = M.shade(pal.armor || '#5a5a7a', 0.3); ctx.fillRect(-1.2, hy - 16, 2.4, 6);
        ctx.fillStyle = pal.plume || '#c03a4a'; ctx.beginPath(); ctx.ellipse(-3, hy - 17, 6, 2.5, -0.3, 0, TAU); ctx.fill();
        break;
      }
      case 'turban': {
        ctx.fillStyle = st.turban || '#e0a040';
        ctx.beginPath(); ctx.ellipse(0, hy - 7, 11, 7.5, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = M.shade(st.turban || '#e0a040', -0.25); ctx.lineWidth = 1;
        for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(0, hy - 7 + k * 2.5, 10, 4.5, k * 0.12, Math.PI, 0); ctx.stroke(); }
        circle(ctx, 3, hy - 9, 2, pal.gem || '#3ad0a0');
        break;
      }
      case 'crescent': {
        ctx.fillStyle = '#f0f6ff';
        ctx.beginPath(); ctx.arc(0, hy - 16, 9, Math.PI * 0.9, Math.PI * 2.1); ctx.arc(0, hy - 13, 7, Math.PI * 2.1, Math.PI * 0.9, true); ctx.fill();
        A.glow(ctx, 0, hy - 18, 18, '#cfe0ff', 0.6);
        ctx.fillStyle = G; ctx.fillRect(-8, hy - 8, 16, 3);
        break;
      }
      case 'horned': {
        ctx.fillStyle = lg(ctx, -9, hy - 30, 9, hy - 8, [[0, M.shade(G, 0.4)], [1, M.shade(G, -0.3)]]);
        ctx.beginPath(); ctx.moveTo(-9.5, hy - 6); ctx.lineTo(-6, hy - 24); ctx.lineTo(0, hy - 30); ctx.lineTo(6, hy - 24); ctx.lineTo(9.5, hy - 6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#1a1418'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-8, hy - 12); ctx.quadraticCurveTo(-20, hy - 14, -18, hy - 26); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, hy - 12); ctx.quadraticCurveTo(20, hy - 14, 18, hy - 26); ctx.stroke();
        circle(ctx, 0, hy - 14, 2.6, '#ff3a3a');
        break;
      }
      case 'flame': {
        for (let k = 0; k < 5; k++) {
          const fx = -6 + k * 3, fh = 14 + Math.sin(t * 9 + k * 1.7) * 4 + (k === 2 ? 6 : 0);
          ctx.fillStyle = k % 2 ? '#ffd15c' : '#ff7a2f';
          ctx.beginPath(); ctx.moveTo(fx - 3, hy - 6); ctx.quadraticCurveTo(fx - 2, hy - 6 - fh * 0.6, fx, hy - 6 - fh); ctx.quadraticCurveTo(fx + 2, hy - 6 - fh * 0.6, fx + 3, hy - 6); ctx.fill();
        }
        A.glow(ctx, 0, hy - 14, 24, '#ff7a2f', 0.5);
        break;
      }
    }

    // front arm + weapon
    const shx = tw - 1;
    const wAng = o.wAng !== undefined ? o.wAng : o.face;
    // convert world aim angle into flipped local space
    const la = dir === 1 ? wAng : Math.PI - wAng;
    const reach = o.reach || 13;
    const hx = shx + Math.cos(la) * reach, hyy = shY + 2 + Math.sin(la) * reach * 0.75;
    limb(ctx, shx, shY, hx, hyy, 4.8, pal.skin);
    circle(ctx, shx + Math.cos(la) * 6, shY + 1 + Math.sin(la) * 4, 2.6, pal.gold || '#e6b84a');
    if (st.extraArms) {
      for (let k = 0; k < st.extraArms; k++) {
        const ea = -0.9 - k * 0.5 + Math.sin(t * 1.5 + k) * 0.08;
        limb(ctx, 0, shY, Math.cos(ea) * 22 * (k % 2 ? -1 : 1), shY + Math.sin(ea) * 20, 3.5, M.rgba(pal.skin, 0.85));
      }
    }
    if (st.shield) {
      ctx.save();
      const sx = -tw + 2, sy = -36;
      const g = ctx.createRadialGradient(sx + 3, sy - 3, 2, sx, sy, 15);
      g.addColorStop(0, M.shade(st.shield, 0.4)); g.addColorStop(1, M.shade(st.shield, -0.3));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(sx, sy, 12, 15, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = G; ctx.lineWidth = 1.6; ctx.stroke();
      circle(ctx, sx, sy, 3, G);
      if (o.shieldGlow) A.glow(ctx, sx, sy, 30, o.shieldGlow, 0.7);
      ctx.restore();
    }
    ctx.restore(); // un-flip
    if (o.weapon) {
      const handX = dir * hx, handY = hyy;
      A.weapon(ctx, o.weapon, handX, handY, wAng, o.weaponScale || 1, t, o.wExtra || {});
    }
    if (o.flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, o.flash) * 0.8;
      A.glow(ctx, 0, -38, 40, '#ffffff', 1);
    }
    ctx.restore();
  };

  // ── non-humanoid foes ─────────────────────────────────────────
  A.pishacha = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    const dir = Math.cos(o.face) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(o.x, o.y);
    A.shadow(ctx, 0, 0, 14 * s, 5 * s);
    ctx.scale(s * dir, s);
    const hop = o.moving ? Math.abs(Math.sin(o.walk * 3)) * 4 : 0;
    ctx.translate(0, -hop);
    const sk = b.skin;
    limb(ctx, -4, -12, -7, 0, 3.5, M.shade(sk, -0.2)); limb(ctx, 4, -12, 6, 0, 3.5, M.shade(sk, -0.2));
    ctx.fillStyle = lg(ctx, 0, -30, 0, -8, [[0, M.shade(sk, 0.15)], [1, M.shade(sk, -0.25)]]);
    ctx.beginPath(); ctx.ellipse(2, -18, 9, 11, 0.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = M.shade(sk, -0.4); ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(2, -16 + i * 3, 6, -0.6, 0.6); ctx.stroke(); }
    const reachA = o.attacking ? 1 : 0.3 + Math.sin(t * 6) * 0.1;
    limb(ctx, 8, -22, 18 + reachA * 6, -14 + reachA * 4, 2.8, sk);
    ctx.strokeStyle = '#f0f0d0'; ctx.lineWidth = 1.2;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(18 + reachA * 6, -14 + reachA * 4); ctx.lineTo(23 + reachA * 6, -14 + reachA * 4 + i * 2.5); ctx.stroke(); }
    circle(ctx, 8, -30, 7, M.shade(sk, 0.05));
    ctx.fillStyle = '#1a1a10'; ctx.beginPath(); ctx.ellipse(12, -27, 3, 1.8, 0, 0, TAU); ctx.fill();
    A.glow(ctx, 10, -31, 7, b.glow, 0.9); circle(ctx, 10.5, -31, 1.4, '#ffffff');
    ctx.fillStyle = '#3a3a2a'; ctx.beginPath(); ctx.moveTo(2, -34); ctx.lineTo(-4, -38); ctx.lineTo(4, -36); ctx.fill();
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 4, -20, 26, '#ffffff', 1); }
    ctx.restore();
  };

  A.elephant = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    const dir = Math.cos(o.face) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(o.x, o.y);
    A.shadow(ctx, 0, 0, 46 * s, 14 * s);
    ctx.scale(s * dir, s);
    ctx.globalAlpha *= 0.94;
    const step = o.moving ? Math.sin(o.walk * 2) * 5 : 0;
    const legC = M.shade(b.skin, -0.15);
    [[-24, step], [-10, -step], [14, -step], [26, step]].forEach(([lx, off]) => { ctx.fillStyle = legC; M.rr(ctx, lx - 6 + off * 0.3, -26, 12, 26, 4); ctx.fill(); });
    ctx.fillStyle = lg(ctx, 0, -70, 0, -18, [[0, M.shade(b.skin, 0.2)], [1, M.shade(b.skin, -0.2)]]);
    ctx.beginPath(); ctx.ellipse(0, -42, 38, 26, 0, 0, TAU); ctx.fill();
    // caparison
    ctx.fillStyle = b.cloth;
    ctx.beginPath(); ctx.moveTo(-28, -60); ctx.quadraticCurveTo(0, -70, 24, -60); ctx.lineTo(22, -26); ctx.quadraticCurveTo(0, -20, -26, -26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = b.gold; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.fillStyle = b.gold;
    for (let i = 0; i < 6; i++) circle(ctx, -22 + i * 8.5, -27, 2, b.gold);
    ctx.strokeStyle = M.rgba(b.gold, 0.7); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-2, -44, 9, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(-2, -44, 4, 0, TAU); ctx.stroke();
    // head
    ctx.fillStyle = M.shade(b.skin, 0.1);
    ctx.beginPath(); ctx.ellipse(36, -52, 16, 18, 0.2, 0, TAU); ctx.fill();
    const ear = Math.sin(t * 3) * 0.15;
    ctx.fillStyle = M.shade(b.skin, -0.05);
    ctx.save(); ctx.translate(28, -56); ctx.rotate(ear); ctx.beginPath(); ctx.ellipse(-4, 2, 11, 15, 0.2, 0, TAU); ctx.fill(); ctx.restore();
    // trunk
    const tr = o.attacking ? -0.6 : Math.sin(t * 2) * 0.2;
    ctx.strokeStyle = M.shade(b.skin, 0.05); ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(46, -50); ctx.quadraticCurveTo(58, -36 + tr * 10, 52 + tr * 6, -16 + tr * 16); ctx.stroke();
    ctx.strokeStyle = '#fff8e0'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(44, -42); ctx.quadraticCurveTo(58, -38, 62, -46); ctx.stroke();
    // headpiece
    ctx.fillStyle = b.gold; ctx.beginPath(); ctx.moveTo(30, -68); ctx.lineTo(42, -70); ctx.lineTo(46, -56); ctx.lineTo(34, -54); ctx.fill();
    A.glow(ctx, 40, -56, 9, b.glow, 0.9);
    circle(ctx, 40, -56, 1.8, '#ffffff');
    // howdah
    ctx.fillStyle = M.shade(b.gold, -0.2); ctx.fillRect(-14, -78, 24, 12);
    ctx.fillStyle = b.cloth; ctx.beginPath(); ctx.moveTo(-16, -78); ctx.quadraticCurveTo(-2, -96, 12, -78); ctx.fill();
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 0, -44, 60, '#ffffff', 1); }
    ctx.restore();
  };

  A.chariot = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    const dir = Math.cos(o.face) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(o.x, o.y);
    A.shadow(ctx, 0, 0, 52 * s, 12 * s);
    ctx.scale(s * dir, s);
    ctx.globalAlpha *= 0.93;
    const spin = (o.spin || 0);
    // horse
    const gal = o.moving ? Math.sin(o.walk * 3) : 0;
    ctx.fillStyle = M.rgba(b.horse, 0.85);
    ctx.beginPath(); ctx.ellipse(36, -34, 18, 9, 0, 0, TAU); ctx.fill();
    limb(ctx, 26, -28, 24 + gal * 6, -2, 3.5, M.rgba(b.horse, 0.8)); limb(ctx, 46, -28, 48 - gal * 6, -2, 3.5, M.rgba(b.horse, 0.8));
    limb(ctx, 48, -38, 58, -54, 7, M.rgba(b.horse, 0.85));
    ctx.fillStyle = M.rgba(b.horse, 0.9); ctx.beginPath(); ctx.ellipse(62, -55, 8, 4.5, 0.5, 0, TAU); ctx.fill();
    A.glow(ctx, 62, -57, 7, b.glow, 0.9);
    ctx.strokeStyle = M.rgba('#fff0d0', 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(52, -50); ctx.quadraticCurveTo(44, -60, 38, -52); ctx.stroke();
    // car
    ctx.fillStyle = lg(ctx, 0, -50, 0, -18, [[0, M.shade(b.gold, 0.2)], [1, b.wood]]);
    ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(-26, -50); ctx.quadraticCurveTo(-4, -58, 18, -46); ctx.lineTo(22, -18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = b.gold; ctx.lineWidth = 1.5; ctx.stroke();
    // banner
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-22, -48); ctx.lineTo(-22, -100); ctx.stroke();
    const wv = Math.sin(t * 6) * 4;
    ctx.fillStyle = '#c03a3a'; ctx.beginPath(); ctx.moveTo(-22, -100); ctx.quadraticCurveTo(-8, -98 + wv, 4, -92 + wv); ctx.lineTo(-22, -86); ctx.fill();
    // wheel
    ctx.save(); ctx.translate(-6, -18); ctx.rotate(spin);
    ctx.strokeStyle = b.wood; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.stroke();
    ctx.strokeStyle = b.gold; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 19, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; limb(ctx, 0, 0, Math.cos(a) * 16, Math.sin(a) * 16, 1.8, b.wood); }
    circle(ctx, 0, 0, 3.5, b.gold);
    ctx.restore();
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 10, -36, 60, '#ffffff', 1); }
    ctx.restore();
  };

  A.vetala = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    const dir = Math.cos(o.face) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(o.x, o.y);
    A.shadow(ctx, 0, 0, 14 * s, 5 * s, 0.22);
    ctx.scale(s * dir, s);
    ctx.translate(0, -16 + Math.sin(t * 2.4) * 4);
    A.glow(ctx, 0, -24, 40, b.glow, 0.25);
    ctx.fillStyle = lg(ctx, 0, -50, 0, 0, [[0, b.cloak], [1, M.rgba(b.cloak, 0)]]);
    ctx.beginPath(); ctx.moveTo(-14, -42);
    for (let i = 0; i <= 6; i++) { const x = -16 + i * 5.5; ctx.lineTo(x, 2 + Math.sin(t * 5 + i) * 4 + (i % 2) * 6); }
    ctx.lineTo(14, -42); ctx.quadraticCurveTo(0, -52, -14, -42); ctx.fill();
    // arms raised when casting
    const raise = o.attacking ? 1 : 0;
    limb(ctx, 8, -40, 20, -40 - raise * 16, 3, b.skin);
    limb(ctx, -8, -40, -18, -38 - raise * 14, 3, b.skin);
    if (raise) A.glow(ctx, 20, -58, 16, b.glow, 0.9);
    circle(ctx, 2, -50, 8, b.skin);
    ctx.fillStyle = '#e8e8f0';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-6 + i * 3, -56); ctx.quadraticCurveTo(-8 + i * 3, -42, -10 + i * 3 + Math.sin(t * 3 + i), -30); ctx.lineTo(-8 + i * 3, -30); ctx.quadraticCurveTo(-5 + i * 3, -44, -4 + i * 3, -56); ctx.fill(); }
    A.glow(ctx, 6, -51, 6, b.glow, 1); circle(ctx, 6, -51, 1.4, '#ffffff');
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 0, -36, 34, '#ffffff', 1); }
    ctx.restore();
  };

  A.naga = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    const dir = Math.cos(o.face) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(o.x, o.y);
    A.shadow(ctx, 0, 0, 22 * s, 7 * s);
    ctx.scale(s * dir, s);
    // tail coils
    for (let i = 7; i >= 0; i--) {
      const a = i * 0.9 + t * 1.2;
      const r = 4 + i * 1.6;
      const cx = -i * 3 + Math.cos(a) * 4, cy = -4 + Math.sin(a) * 2;
      ctx.fillStyle = i % 2 ? b.scale : M.shade(b.scale, -0.15);
      ctx.beginPath(); ctx.ellipse(cx, cy, r + 3, r * 0.6 + 2, 0, 0, TAU); ctx.fill();
    }
    const sway = Math.sin(t * 2.5) * 2;
    ctx.fillStyle = lg(ctx, -8, -40, 8, -8, [[0, b.scale], [1, M.shade(b.scale, -0.3)]]);
    ctx.beginPath(); ctx.moveTo(-9, -8); ctx.quadraticCurveTo(-11 + sway, -26, -8 + sway, -42); ctx.lineTo(8 + sway, -42); ctx.quadraticCurveTo(10 + sway, -24, 9, -8); ctx.fill();
    ctx.fillStyle = b.belly; ctx.beginPath(); ctx.ellipse(1 + sway, -24, 4, 13, 0, 0, TAU); ctx.fill();
    // hood
    ctx.fillStyle = M.shade(b.scale, -0.1);
    ctx.beginPath(); ctx.ellipse(sway - 2, -54, 16, 15, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = b.belly; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(sway - 2, -54, 11, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    circle(ctx, sway - 8, -58, 2, b.glow); circle(ctx, sway + 4, -58, 2, b.glow);
    // head
    circle(ctx, sway + 2, -52, 7.5, M.shade(b.scale, 0.2));
    A.glow(ctx, sway + 6, -53, 6, b.glow, 1); circle(ctx, sway + 6, -53, 1.4, '#ffffff');
    circle(ctx, sway + 1, -63, 2.4, '#ffe08a'); A.glow(ctx, sway + 1, -63, 9, '#ffe08a', 0.7);
    // arms
    if (b.armed) {
      A.weapon(ctx, 'blade2', 8 + sway, -36, o.attacking ? -0.4 + Math.sin(t * 20) : 0.5, 1, t);
      A.weapon(ctx, 'blade2', -6 + sway, -34, o.attacking ? 3.5 : 2.4, 1, t);
    } else {
      limb(ctx, 7 + sway, -38, 15 + sway, -30 - (o.attacking ? 10 : 0), 3, M.shade(b.scale, 0.2));
      if (o.attacking) A.glow(ctx, 15 + sway, -40, 14, b.glow, 0.9);
    }
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 0, -36, 40, '#ffffff', 1); }
    ctx.restore();
  };

  A.bhuta = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    ctx.save(); ctx.translate(o.x, o.y);
    A.shadow(ctx, 0, 0, 12 * s, 4 * s, 0.25);
    ctx.scale(s, s);
    const pulse = o.fuse ? 1 + Math.sin(t * 30) * 0.25 : 1 + Math.sin(t * 4) * 0.08;
    ctx.translate(0, -26 + Math.sin(t * 3) * 3);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a = t * 4 + i;
      A.glow(ctx, Math.sin(a) * 5, 6 - (i * 4 + ((t * 30) % 4)), 13 - i, b.glow, 0.35);
    }
    A.glow(ctx, 0, 0, 26 * pulse, o.fuse ? '#ffffff' : b.glow, 0.7);
    ctx.globalCompositeOperation = 'source-over';
    circle(ctx, 0, 0, 9 * pulse, b.core);
    ctx.fillStyle = '#3a0a3a';
    ctx.beginPath(); ctx.ellipse(-3, -1, 2, 2.6, 0, 0, TAU); ctx.ellipse(3, -1, 2, 2.6, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-2.5, 4, 5, 1.2);
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 0, 0, 24, '#ffffff', 1); }
    ctx.restore();
  };

  A.sentinel = (ctx, o) => {
    const b = o.body, t = o.t, s = o.s || 1;
    ctx.save(); ctx.translate(o.x, o.y);
    // rune circle
    ctx.save(); ctx.scale(1, 0.4); ctx.rotate(t * 0.6);
    ctx.strokeStyle = M.rgba(b.glow, 0.5); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 44 * s, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * 44 * s, Math.sin(a) * 44 * s, 4, 0, TAU); ctx.stroke(); }
    ctx.restore();
    ctx.scale(s, s);
    ctx.translate(0, -10 + Math.sin(t * 1.5) * 3);
    ctx.fillStyle = lg(ctx, -24, -90, 24, 0, [[0, M.shade(b.stone, 0.25)], [1, M.shade(b.stone, -0.35)]]);
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-26, -50); ctx.lineTo(-18, -70); ctx.lineTo(18, -70); ctx.lineTo(26, -50); ctx.lineTo(22, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = b.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-24, -48); ctx.lineTo(24, -48); ctx.moveTo(-22, -20); ctx.lineTo(22, -20); ctx.stroke();
    // face
    ctx.fillStyle = M.shade(b.stone, 0.1);
    ctx.beginPath(); ctx.moveTo(-16, -70); ctx.lineTo(-14, -94); ctx.lineTo(0, -104); ctx.lineTo(14, -94); ctx.lineTo(16, -70); ctx.closePath(); ctx.fill();
    ctx.fillStyle = b.gold; ctx.beginPath(); ctx.moveTo(-14, -94); ctx.lineTo(0, -116); ctx.lineTo(14, -94); ctx.fill();
    const eg = o.attacking ? 1 : 0.6 + Math.sin(t * 3) * 0.2;
    A.glow(ctx, -6, -84, 10, b.glow, eg); A.glow(ctx, 6, -84, 10, b.glow, eg);
    circle(ctx, -6, -84, 2, '#ffffff'); circle(ctx, 6, -84, 2, '#ffffff');
    A.glow(ctx, 0, -36, 18, b.glow, 0.5 * eg);
    ctx.strokeStyle = b.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -36, 8, 0, TAU); ctx.stroke();
    if (o.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.flash; A.glow(ctx, 0, -60, 60, '#ffffff', 1); }
    ctx.restore();
  };

  A.buffalo = (ctx, x, y, t, s = 1, happy = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    A.shadow(ctx, 0, 0, 56, 14);
    const br = Math.sin(t * 1.3) * 1.5;
    ctx.fillStyle = lg(ctx, 0, -46, 0, 0, [[0, '#4a4658'], [1, '#1e1a26']]);
    ctx.beginPath(); ctx.ellipse(-6, -20, 48, 22 + br, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a2632';
    ctx.beginPath(); ctx.ellipse(-40, -6, 14, 7, 0, 0, TAU); ctx.ellipse(18, -4, 14, 6, 0, 0, TAU); ctx.fill();
    // head
    const nod = Math.sin(t * 0.7) * 2 + happy * Math.sin(t * 8) * 2;
    ctx.save(); ctx.translate(40, -26 + nod);
    ctx.fillStyle = '#34303e'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 15, 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5a5262'; ctx.beginPath(); ctx.ellipse(12, 6, 9, 7, 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.quadraticCurveTo(-30, -16, -26, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -12); ctx.quadraticCurveTo(24, -28, 32, -14); ctx.stroke();
    if (happy > 0) { ctx.strokeStyle = '#1a1418'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(4, -2, 2.5, Math.PI, 0); ctx.stroke(); }
    else { circle(ctx, 4, -2, 2, '#ff8a4a'); A.glow(ctx, 4, -2, 6, '#ff8a4a', 0.6); }
    circle(ctx, -4, 10, 4, '#e6b84a');
    ctx.restore();
    // bell
    circle(ctx, 32, -8, 4.5, '#e6b84a');
    ctx.restore();
  };

  // ── props ───────────────────────────────────────────────────────
  A.prop = (ctx, p, t, pal) => {
    const { x, y } = p;
    ctx.save(); ctx.translate(x, y);
    const st = pal.stone || '#a89880';
    switch (p.type) {
      case 'pillar': {
        A.shadow(ctx, 0, 0, 34, 12, 0.35);
        const h = p.h || 150;
        ctx.fillStyle = M.shade(st, -0.3); ctx.fillRect(-30, -18, 60, 18);
        ctx.fillStyle = M.shade(st, -0.1); ctx.fillRect(-26, -26, 52, 10);
        ctx.fillStyle = lg(ctx, -22, 0, 22, 0, [[0, M.shade(st, 0.25)], [0.4, st], [1, M.shade(st, -0.45)]]);
        ctx.fillRect(-21, -h, 42, h - 24);
        ctx.strokeStyle = M.rgba('#000000', 0.18); ctx.lineWidth = 1.2;
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 7, -h + 10); ctx.lineTo(i * 7, -30); ctx.stroke(); }
        ctx.fillStyle = M.shade(st, -0.15);
        ctx.fillRect(-24, -h * 0.55, 48, 9);
        ctx.fillStyle = pal.accent || '#e6b84a'; ctx.fillRect(-24, -h * 0.55 + 3, 48, 2);
        // capital
        ctx.fillStyle = lg(ctx, -32, 0, 32, 0, [[0, M.shade(st, 0.2)], [1, M.shade(st, -0.4)]]);
        ctx.beginPath(); ctx.moveTo(-22, -h); ctx.quadraticCurveTo(-36, -h - 8, -32, -h - 18); ctx.lineTo(32, -h - 18); ctx.quadraticCurveTo(36, -h - 8, 22, -h); ctx.fill();
        ctx.fillStyle = M.shade(st, -0.25); ctx.fillRect(-36, -h - 26, 72, 9);
        // garland
        ctx.strokeStyle = '#ff9a1a'; ctx.lineWidth = 5; ctx.setLineDash([3, 2]);
        ctx.beginPath(); ctx.moveTo(-22, -h + 6); ctx.quadraticCurveTo(0, -h + 34, 22, -h + 6); ctx.stroke();
        ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-22, -h + 6); ctx.quadraticCurveTo(0, -h + 26, 22, -h + 6); ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'tree': {
        A.shadow(ctx, 0, 0, 40, 14, 0.4);
        ctx.fillStyle = lg(ctx, -12, 0, 12, 0, [[0, '#6a4a3a'], [1, '#2a1a1a']]);
        ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-8, -60, -18, -110); ctx.lineTo(16, -110); ctx.quadraticCurveTo(6, -60, 14, 0); ctx.fill();
        const leaf = pal.leaf || '#2f8a4a';
        const cy = -150;
        const fade = p.fade || 1;
        ctx.globalAlpha *= fade;
        const rng = M.rng(p.seed || 7);
        for (let i = 0; i < 18; i++) {
          const a = rng() * TAU, d = rng() * 60;
          const lx = Math.cos(a) * d * 1.3, ly = cy + Math.sin(a) * d * 0.7 + Math.sin(t * 1.3 + i) * 1.5;
          const r = 28 + rng() * 20;
          const g = ctx.createRadialGradient(lx - r * 0.3, ly - r * 0.4, 2, lx, ly, r);
          g.addColorStop(0, M.shade(leaf, 0.35)); g.addColorStop(0.7, leaf); g.addColorStop(1, M.shade(leaf, -0.4));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, r, 0, TAU); ctx.fill();
        }
        for (let i = 0; i < 26; i++) {
          const a = rng() * TAU, d = rng() * 80;
          circle(ctx, Math.cos(a) * d * 1.2, cy + Math.sin(a) * d * 0.6, 3 + rng() * 2.5, pal.flower || '#ff4a6a');
        }
        break;
      }
      case 'diya': {
        A.shadow(ctx, 0, 0, 16, 6, 0.35);
        ctx.fillStyle = lg(ctx, -6, 0, 6, 0, [[0, '#ffe08a'], [0.5, '#c8902a'], [1, '#6a4a10']]);
        ctx.fillRect(-3, -70, 6, 64);
        ctx.beginPath(); ctx.ellipse(0, -4, 14, 5, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -40, 9, 3, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-14, -72); ctx.quadraticCurveTo(0, -60, 14, -72); ctx.lineTo(-14, -72); ctx.fill();
        const fl = Math.sin(t * 13 + x) * 1.5;
        ctx.fillStyle = '#ffd25a';
        ctx.beginPath(); ctx.moveTo(-4, -73); ctx.quadraticCurveTo(-3 + fl, -86, 0 + fl, -92); ctx.quadraticCurveTo(3 + fl, -86, 4, -73); ctx.fill();
        circle(ctx, 0 + fl * 0.5, -77, 2.2, '#ffffff');
        break;
      }
      case 'urn': {
        A.shadow(ctx, 0, 0, 22, 8, 0.35);
        const g = ctx.createRadialGradient(-6, -26, 3, 0, -20, 24);
        g.addColorStop(0, '#fff0b0'); g.addColorStop(0.5, '#d8a030'); g.addColorStop(1, '#6a3a10');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -20, 20, 19, 0, 0, TAU); ctx.fill();
        ctx.fillRect(-9, -44, 18, 8);
        ctx.fillStyle = '#3a9a3a';
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * 6, -48, 4, 12, i * 0.35, 0, TAU); ctx.fill(); }
        circle(ctx, 0, -56, 8, '#8a5a2a');
        ctx.fillStyle = '#c03a2a'; ctx.fillRect(-19, -24, 38, 3); for (let k = -3; k <= 3; k++) circle(ctx, k * 5, -16, 1.6, '#fff0b0');
        break;
      }
      case 'rubble': { // broken chariot
        A.shadow(ctx, 0, 0, 46, 14, 0.35);
        ctx.save(); ctx.rotate(-0.25);
        ctx.strokeStyle = '#5a3a1f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-14, -18, 20, 0, Math.PI * 1.6); ctx.stroke();
        for (let i = 0; i < 6; i++) { const a = (i / 8) * TAU; limb(ctx, -14, -18, -14 + Math.cos(a) * 19, -18 + Math.sin(a) * 19, 2, '#6a4a2a'); }
        ctx.restore();
        ctx.fillStyle = '#7a5a30'; ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(34, -2); ctx.lineTo(30, -24); ctx.lineTo(0, -30); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(20, -20); ctx.lineTo(44, -78); ctx.stroke();
        const wv = Math.sin(t * 3 + x) * 3;
        ctx.fillStyle = '#b02a3a'; ctx.beginPath(); ctx.moveTo(44, -78); ctx.quadraticCurveTo(56, -74 + wv, 66, -70 + wv); ctx.lineTo(42, -62); ctx.fill();
        break;
      }
      case 'statue': { // naga statue
        A.shadow(ctx, 0, 0, 30, 10, 0.35);
        ctx.fillStyle = M.shade(st, -0.25); ctx.fillRect(-26, -20, 52, 20);
        ctx.fillStyle = lg(ctx, -20, 0, 20, 0, [[0, M.shade(st, 0.2)], [1, M.shade(st, -0.4)]]);
        ctx.beginPath(); ctx.moveTo(-14, -20); ctx.quadraticCurveTo(-18, -70, 0, -96); ctx.quadraticCurveTo(18, -70, 14, -20); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -104, 26, 22, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = M.shade(st, -0.1);
        for (let i = -2; i <= 2; i++) circle(ctx, i * 10, -110 + Math.abs(i) * 4, 6, M.shade(st, 0.05));
        const gl = 0.6 + Math.sin(t * 2 + x) * 0.3;
        for (let i = -2; i <= 2; i++) A.glow(ctx, i * 10, -110 + Math.abs(i) * 4, 8, pal.glow || '#7affc8', gl);
        circle(ctx, 0, -60, 6, pal.glow || '#7affc8'); A.glow(ctx, 0, -60, 22, pal.glow || '#7affc8', gl);
        break;
      }
      case 'crystal': {
        A.shadow(ctx, 0, 0, 24, 8, 0.3);
        const c = pal.glow || '#7affc8';
        ctx.globalAlpha *= 0.92;
        [[-12, -40, 0.25, 10], [8, -58, -0.1, 12], [16, -30, -0.4, 8], [-2, -26, 0.05, 9]].forEach(([cx, h, rot, w]) => {
          ctx.save(); ctx.rotate(rot);
          ctx.fillStyle = lg(ctx, cx - w, 0, cx + w, 0, [[0, M.shade(c, 0.5)], [0.5, c], [1, M.shade(c, -0.5)]]);
          ctx.beginPath(); ctx.moveTo(cx - w, 0); ctx.lineTo(cx - w * 0.7, h); ctx.lineTo(cx, h - w * 1.5); ctx.lineTo(cx + w * 0.7, h); ctx.lineTo(cx + w, 0); ctx.closePath(); ctx.fill();
          ctx.restore();
        });
        break;
      }
      case 'obelisk': {
        A.shadow(ctx, 0, 0, 28, 10, 0.35);
        ctx.fillStyle = lg(ctx, -18, 0, 18, 0, [[0, '#3a3a7a'], [1, '#141432']]);
        ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-12, -120); ctx.lineTo(0, -140); ctx.lineTo(12, -120); ctx.lineTo(18, 0); ctx.closePath(); ctx.fill();
        const gl = 0.6 + Math.sin(t * 1.5 + x * 0.01) * 0.3;
        ctx.strokeStyle = M.rgba('#ffcf4a', gl); ctx.lineWidth = 1.6;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, -30 - i * 24, 6, 0, TAU); ctx.stroke(); }
        A.glow(ctx, 0, -140, 22, '#ffcf4a', gl);
        break;
      }
      case 'banyan': { // hub tree (big)
        A.shadow(ctx, 0, 0, 80, 24, 0.4);
        ctx.fillStyle = lg(ctx, -30, 0, 30, 0, [[0, '#5a3a2a'], [1, '#201010']]);
        ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-18, -100, -40, -180); ctx.lineTo(40, -180); ctx.quadraticCurveTo(18, -100, 34, 0); ctx.fill();
        ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 2;
        for (let i = 0; i < 9; i++) { const rx = -120 + i * 30; ctx.beginPath(); ctx.moveTo(rx, -170); ctx.quadraticCurveTo(rx + 5, -90, rx + Math.sin(t + i) * 2, -8); ctx.stroke(); }
        const rng = M.rng(99);
        for (let i = 0; i < 30; i++) {
          const a = rng() * TAU, d = rng() * 110;
          const lx = Math.cos(a) * d * 1.4, ly = -230 + Math.sin(a) * d * 0.55 + Math.sin(t + i) * 1.2;
          const r = 40 + rng() * 28;
          const g = ctx.createRadialGradient(lx - r * 0.3, ly - r * 0.4, 2, lx, ly, r);
          g.addColorStop(0, '#4ab86a'); g.addColorStop(0.7, '#1e6a3a'); g.addColorStop(1, '#0a2a1a');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, r, 0, TAU); ctx.fill();
        }
        for (let i = 0; i < 18; i++) { const a = rng() * TAU, d = rng() * 120; A.glow(ctx, Math.cos(a) * d * 1.3, -230 + Math.sin(a) * d * 0.5, 10, '#ffe08a', 0.5 + Math.sin(t * 2 + i) * 0.3); }
        break;
      }
    }
    ctx.restore();
  };
})();
