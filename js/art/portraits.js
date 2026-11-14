'use strict';
// ───────────────────────────────────────────────────────────────
//  Painted portraits for dialogue (procedural busts)
// ───────────────────────────────────────────────────────────────
(() => {
  const A = M.art;
  const TAU = Math.PI * 2;
  const P = {
    abhi: { skin: '#c68655', hair: '#1a0f0c', cloth: '#c8283a', armor: '#e6b84a', bg: ['#ffcf6b', '#7a1a20'], crown: 'mukuta', gem: '#ff3a5a', ear: 'ring', brow: 0.1, lips: '#9a4a3a', scarf: '#d8283a', young: true, tilak: '#d8283a' },
    yama: { skin: '#34525a', hair: '#0a0a10', cloth: '#8a1a1a', armor: '#c89a3a', bg: ['#c43c3c', '#14060a'], crown: 'horned', gem: '#ff2a2a', ear: 'big', brow: -0.15, lips: '#2a1a20', mustache: '#0a0a10', eyes: '#ffb040', glowEyes: true, broad: true },
    chitragupta: { skin: '#a8703f', hair: '#2a1a10', cloth: '#d8a34a', bg: ['#e8c070', '#3a200a'], crown: 'turban', turban: '#c8502a', gem: '#3ad0a0', ear: 'stud', brow: 0.05, lips: '#7a3a2a', mustache: '#2a1a10', pen: true, spectacles: false, thread: true },
    nachiketa: { skin: '#d29a68', hair: '#1a1010', cloth: '#f4ecd8', bg: ['#fff0c0', '#5a4a2a'], crown: 'shikha', ear: 'none', brow: 0.2, lips: '#a85a4a', child: true, thread: true, tilak: '#f0f0f0', ash: true },
    savitri: { skin: '#b87a4e', hair: '#120a08', cloth: '#c8203a', cloth2: '#e6b84a', bg: ['#ff6a7a', '#3a0a1a'], crown: 'female', gem: '#ff2a4a', ear: 'jhumka', brow: 0.05, lips: '#a02a3a', female: true, bindi: '#d8102a', nosering: true, flowers: '#fff4f0' },
    chandra: { skin: '#dfe8f5', hair: '#cfd8f0', cloth: '#e8f0ff', armor: '#c0d0f0', bg: ['#cfe0ff', '#0a1430'], crown: 'crescent', gem: '#9ac8ff', ear: 'ring', brow: 0.1, lips: '#8a90b0', glowSkin: '#cfe0ff', eyes: '#6a8ad8', long: true },
    kubera: { skin: '#d8a060', hair: '#2a1a10', cloth: '#2a8a5a', armor: '#ffd24a', bg: ['#ffd24a', '#4a2a00'], crown: 'tall', gem: '#3aff8a', ear: 'big', brow: 0.15, lips: '#9a4a2a', mustache: '#2a1a10', fat: true, mongoose: true },
    uttara: { skin: '#d9a074', hair: '#140a08', cloth: '#e080b0', cloth2: '#ffe0a0', bg: ['#f0a0c8', '#2a0a2a'], crown: 'female', gem: '#ff6aa0', ear: 'jhumka', brow: 0.1, lips: '#b04a5a', female: true, bindi: '#c8103a', veil: '#ffd0e8', young: true },
    indra: { skin: '#e0a868', hair: '#1a1010', cloth: '#2a5ab8', armor: '#ffd96a', bg: ['#6fd3ff', '#0a1a4a'], crown: 'tall', gem: '#6fd3ff', ear: 'big', brow: -0.05, lips: '#9a4a3a', mustache: '#1a1010', eyes: '#3a8aff', broad: true, sparks: '#cfefff' },
    agni: { skin: '#d8462a', hair: '#ffb030', cloth: '#ffb030', armor: '#ffd15c', bg: ['#ff7a2f', '#3a0a00'], crown: 'flame', ear: 'ring', brow: -0.1, lips: '#5a1a0a', eyes: '#ffe05a', glowEyes: true, beard: '#ff9a2a', flames: true },
    vayu: { skin: '#b8e0d8', hair: '#e8fff8', cloth: '#6ad0a8', armor: '#d8fff0', bg: ['#8ff0c4', '#0a3a2a'], crown: 'mukuta', gem: '#ffffff', ear: 'ring', brow: 0.2, lips: '#5a8a7a', long: true, windy: true, beard: '#e8fff8' },
    varuna: { skin: '#4a86c8', hair: '#0a1a3a', cloth: '#1a4a8a', armor: '#9ff0ff', bg: ['#2fb8e6', '#00142a'], crown: 'tall', gem: '#9ff0ff', ear: 'big', brow: 0, lips: '#1a2a5a', mustache: '#0a1a3a', eyes: '#cff8ff', glowEyes: true, water: true },
    surya: { skin: '#e8a040', hair: '#6a2a0a', cloth: '#ff7a1a', armor: '#fff2a8', bg: ['#ffb81f', '#4a1a00'], crown: 'tall', gem: '#ff3a1a', ear: 'kundala', brow: 0.05, lips: '#8a3a1a', eyes: '#fff2a8', glowEyes: true, rays: true },
    durga: { skin: '#e8b080', hair: '#120a08', cloth: '#d81a3a', cloth2: '#ffd24a', armor: '#ffd24a', bg: ['#ff3d7f', '#2a0010'], crown: 'tallF', gem: '#ff1a4a', ear: 'jhumka', brow: -0.1, lips: '#c01a2a', female: true, bindi: '#ff1a1a', thirdEye: true, arms: true, eyes: '#3a1010' },
    jayadratha: { skin: '#a87850', hair: '#14100c', cloth: '#3a2a6a', armor: '#8a8ab0', bg: ['#8a7ad8', '#10082a'], crown: 'helm', gem: '#8a7ad8', ear: 'stud', brow: -0.25, lips: '#5a2a2a', mustache: '#14100c', eyes: '#ff5a7a', glowEyes: true, spectral: true },
    karna: { skin: '#c88a50', hair: '#1a0f0c', cloth: '#8a2a1a', armor: '#ffd96a', bg: ['#ffb84a', '#3a1000'], crown: 'mukuta', gem: '#ff7a1a', ear: 'kundala', brow: -0.05, lips: '#8a3a2a', mustache: '#1a0f0c', eyes: '#ffd96a', glowEyes: true, glowArmor: true, spectral: true },
    ashwatthama: { skin: '#9a7a6a', hair: '#0a0808', cloth: '#4a0a1a', armor: '#5a3a3a', bg: ['#9a3a5a', '#0a0008'], crown: 'wild', ear: 'none', brow: -0.3, lips: '#4a1a1a', beard: '#1a1010', eyes: '#ff3a4a', glowEyes: true, wound: true, gaunt: true },
    drona: { skin: '#b8885a', hair: '#e8e4d8', cloth: '#f0e8d0', cloth2: '#d8902a', bg: ['#e8e0c8', '#2a2010'], crown: 'topknot', ear: 'ring', brow: -0.05, lips: '#7a4a3a', beard: '#f0ece0', mustache: '#f0ece0', old: true, thread: true, tilak: '#f0f0f0', ash: true },
  };
  A.PORTRAITS = P;

  const lg = A.lg;
  const circle = (ctx, x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };

  A.portrait = (ctx, id, w, h, t = 0, opts = {}) => {
    const c = P[id];
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    if (!c) { ctx.restore(); return; }
    const sc = Math.min(w / 360, h / 420);
    ctx.translate(w / 2, h);
    ctx.scale(sc, sc);
    // coordinate system: x centred, y up from bottom (negative)
    const breathe = Math.sin(t * 1.6) * 1.5;
    const faceY = -250 + breathe * 0.6;
    const FW = c.child ? 54 : c.fat ? 68 : c.gaunt ? 54 : c.female ? 56 : 60;
    const FH = c.child ? 66 : c.female ? 72 : 76;

    // background aureole
    if (!opts.noBg) {
      const g = ctx.createRadialGradient(0, faceY, 10, 0, faceY, 300);
      g.addColorStop(0, M.rgba(c.bg[0], 0.95)); g.addColorStop(0.45, M.rgba(M.mix(c.bg[0], c.bg[1], 0.5), 0.7)); g.addColorStop(1, M.rgba(c.bg[1], 0));
      ctx.fillStyle = g; ctx.fillRect(-200, -440, 400, 460);
      // mandala ring
      ctx.save(); ctx.translate(0, faceY); ctx.rotate(t * 0.08);
      ctx.strokeStyle = M.rgba('#ffffff', 0.13); ctx.lineWidth = 1.5;
      for (let ring = 0; ring < 2; ring++) {
        const R = 150 + ring * 34, n = 16 + ring * 8;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * R, Math.sin(a) * R, 16, 6, a, 0, TAU);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, R - 14, 0, TAU); ctx.stroke();
      }
      ctx.restore();
      if (c.rays) {
        ctx.save(); ctx.translate(0, faceY); ctx.rotate(t * 0.15);
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * TAU;
          ctx.fillStyle = M.rgba(c.armor, 0.22);
          ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.05) * 90, Math.sin(a - 0.05) * 90); ctx.lineTo(Math.cos(a) * 230, Math.sin(a) * 230); ctx.lineTo(Math.cos(a + 0.05) * 90, Math.sin(a + 0.05) * 90); ctx.fill();
        }
        ctx.restore();
      }
      if (c.flames) {
        for (let i = 0; i < 14; i++) {
          const x = -170 + i * 26, fh = 90 + Math.sin(t * 5 + i * 1.3) * 30;
          ctx.fillStyle = M.rgba(i % 2 ? '#ffd15c' : '#ff5a1a', 0.35);
          ctx.beginPath(); ctx.moveTo(x - 20, 0); ctx.quadraticCurveTo(x - 10, -fh * 0.6, x, -fh - 60); ctx.quadraticCurveTo(x + 10, -fh * 0.6, x + 20, 0); ctx.fill();
        }
      }
      if (c.water) {
        ctx.strokeStyle = M.rgba('#9ff0ff', 0.25); ctx.lineWidth = 3;
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          for (let x = -200; x <= 200; x += 10) ctx.lineTo(x, -40 - k * 60 + Math.sin(x * 0.03 + t * 1.5 + k) * 10);
          ctx.stroke();
        }
      }
      if (c.sparks) {
        ctx.strokeStyle = M.rgba(c.sparks, 0.6); ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const ph = Math.floor(t * 3 + k * 7) % 11;
          if (ph > 2) continue;
          let x = -150 + k * 140, y = -420;
          ctx.beginPath(); ctx.moveTo(x, y);
          while (y < -200) { x += M.rand(-20, 20); y += M.rand(18, 30); ctx.lineTo(x, y); }
          ctx.stroke();
        }
      }
    }
    if (c.arms) {
      // the goddess' many arms, fanned behind her
      for (let i = 0; i < 6; i++) {
        const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
        const a = -Math.PI / 2 + side * (0.5 + k * 0.38);
        ctx.save(); ctx.translate(side * 60, -120); ctx.rotate(a + Math.PI / 2 + Math.sin(t + i) * 0.03);
        ctx.fillStyle = lg(ctx, -12, 0, 12, 0, [[0, M.shade(c.skin, -0.25)], [1, c.skin]]);
        M.rr(ctx, -12, -170, 24, 170, 12); ctx.fill();
        ctx.fillStyle = c.armor; ctx.fillRect(-13, -60, 26, 8); ctx.fillRect(-13, -150, 26, 6);
        ctx.restore();
      }
    }

    // long / back hair
    if (c.female || c.long || c.crown === 'wild') {
      ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.moveTo(-FW - 14, faceY - 20);
      ctx.quadraticCurveTo(-FW - 40, faceY + 120, -FW - 30 + (c.windy ? Math.sin(t * 2) * 12 : 0), faceY + 210);
      ctx.lineTo(FW + 30 + (c.windy ? Math.sin(t * 2 + 1) * 12 : 0), faceY + 210);
      ctx.quadraticCurveTo(FW + 40, faceY + 120, FW + 14, faceY - 20);
      ctx.closePath(); ctx.fill();
      if (c.crown === 'wild') {
        for (let i = 0; i < 14; i++) {
          const a = Math.PI + (i / 13) * Math.PI;
          ctx.beginPath(); ctx.ellipse(Math.cos(a) * (FW + 18), faceY - 20 + Math.sin(a) * (FH + 10), 26, 10, a + 0.4, 0, TAU); ctx.fill();
        }
      }
    }
    if (c.veil) {
      ctx.fillStyle = M.rgba(c.veil, 0.4);
      ctx.beginPath(); ctx.moveTo(-FW - 30, faceY - 70); ctx.quadraticCurveTo(0, faceY - 140, FW + 30, faceY - 70); ctx.lineTo(FW + 90, 0); ctx.lineTo(-FW - 90, 0); ctx.closePath(); ctx.fill();
    }

    // shoulders / torso
    const shW = c.child ? 120 : c.fat ? 175 : c.broad ? 170 : c.female ? 130 : 150;
    const shY = faceY + FH + 52 + breathe;
    ctx.fillStyle = lg(ctx, -shW, shY, shW, 0, [[0, M.shade(c.skin, -0.3)], [0.5, c.skin], [1, M.shade(c.skin, -0.35)]]);
    ctx.beginPath(); ctx.moveTo(-shW - 30, 20); ctx.quadraticCurveTo(-shW - 10, shY + 10, -shW + 40, shY - 10); ctx.lineTo(shW - 40, shY - 10); ctx.quadraticCurveTo(shW + 10, shY + 10, shW + 30, 20); ctx.closePath(); ctx.fill();
    // garment
    if (c.armor && !c.female) {
      const ag = c.glowArmor ? 0.3 + Math.sin(t * 2) * 0.1 : 0;
      ctx.fillStyle = lg(ctx, -shW, shY, shW, 0, [[0, M.shade(c.armor, -0.25)], [0.45, M.shade(c.armor, 0.35 + ag)], [1, M.shade(c.armor, -0.45)]]);
      ctx.beginPath(); ctx.moveTo(-shW + 20, 20); ctx.quadraticCurveTo(-shW + 30, shY + 20, -shW + 60, shY - 2); ctx.quadraticCurveTo(0, shY + 26, shW - 60, shY - 2); ctx.quadraticCurveTo(shW - 30, shY + 20, shW - 20, 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = M.shade(c.armor, -0.5); ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, shY + 10 + i * 28, 70 - i * 6, 0.3, Math.PI - 0.3); ctx.stroke(); }
      circle(ctx, 0, shY + 58, 10, c.gem || '#ff3a5a'); circle(ctx, -3, shY + 55, 3, '#ffffff');
      if (c.glowArmor) A.glow(ctx, 0, shY + 40, 140, c.armor, 0.25 + ag);
    }
    // cloth drape
    ctx.fillStyle = lg(ctx, -shW, shY, shW, 0, [[0, M.shade(c.cloth, -0.25)], [0.5, c.cloth], [1, M.shade(c.cloth, -0.35)]]);
    if (c.female) {
      ctx.beginPath(); ctx.moveTo(-shW - 30, 20); ctx.quadraticCurveTo(-shW, shY, -shW + 40, shY - 8); ctx.lineTo(-shW + 70, shY - 10); ctx.lineTo(shW + 30, 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = c.cloth2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-shW + 60, shY - 10); ctx.lineTo(shW + 20, 20); ctx.stroke();
      ctx.fillStyle = M.shade(c.cloth, -0.15); ctx.beginPath(); ctx.moveTo(-shW + 40, 20); ctx.quadraticCurveTo(0, shY + 40, shW - 40, 20); ctx.fill();
    } else if (!c.armor || c.old || c.thread) {
      ctx.beginPath(); ctx.moveTo(-shW - 20, 20); ctx.quadraticCurveTo(-shW + 10, shY + 6, -shW + 50, shY - 6); ctx.lineTo(shW * 0.2, 20); ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(-shW - 30, 20); ctx.quadraticCurveTo(-shW - 5, shY + 5, -shW + 30, shY); ctx.lineTo(-shW + 10, 20); ctx.fill();
      ctx.beginPath(); ctx.moveTo(shW + 30, 20); ctx.quadraticCurveTo(shW + 5, shY + 5, shW - 30, shY); ctx.lineTo(shW - 10, 20); ctx.fill();
    }
    if (c.scarf) {
      ctx.strokeStyle = c.scarf; ctx.lineWidth = 18; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-shW + 50, shY); ctx.quadraticCurveTo(-shW + 10, shY + 50 + Math.sin(t * 2) * 6, -shW - 10, 10); ctx.stroke();
    }
    if (c.thread) { ctx.strokeStyle = '#f8f0d8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-shW + 60, shY - 4); ctx.quadraticCurveTo(10, shY + 60, shW - 30, 20); ctx.stroke(); }
    if (c.ash) { ctx.strokeStyle = M.rgba('#f0f0f0', 0.7); ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-50, shY + 30 + i * 9); ctx.lineTo(50, shY + 30 + i * 9); ctx.stroke(); } }
    // necklaces
    const gold = c.armor || '#e6b84a';
    if (!c.child && !c.old) {
      ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, shY - 40, 70, 0.7, Math.PI - 0.7); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, shY - 60, 105, 0.95, Math.PI - 0.95); ctx.stroke();
      for (let i = 0; i < 7; i++) { const a = 0.85 + i * ((Math.PI - 1.7) / 6); circle(ctx, Math.cos(a) * 70, shY - 40 + Math.sin(a) * 70, 4, i === 3 ? (c.gem || '#ff3a5a') : '#ffd96a'); }
    } else if (c.old || c.child) {
      ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(0, shY - 40, 66, 0.6, Math.PI - 0.6); ctx.stroke(); ctx.setLineDash([]);
    }
    if (c.mongoose) {
      const mx = shW - 70, my = shY - 22;
      ctx.fillStyle = '#a08060'; ctx.beginPath(); ctx.ellipse(mx, my, 40, 16, -0.15, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(mx - 40, my - 6 + Math.sin(t * 3) * 2, 15, 12, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#a08060'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 34, my); ctx.quadraticCurveTo(mx + 70, my + 10, mx + 64, my + 50); ctx.stroke();
      circle(ctx, mx - 46, my - 9 + Math.sin(t * 3) * 2, 2.5, '#1a1010');
      circle(ctx, mx - 54, my - 3, 3, '#3a2a2a');
    }

    // neck
    ctx.fillStyle = lg(ctx, -30, 0, 30, 0, [[0, M.shade(c.skin, -0.35)], [0.5, M.shade(c.skin, -0.1)], [1, M.shade(c.skin, -0.4)]]);
    ctx.fillRect(-FW * 0.45, faceY + 40, FW * 0.9, shY - faceY - 20);

    // ears & earrings
    for (const sd of [-1, 1]) {
      ctx.fillStyle = M.shade(c.skin, -0.12);
      ctx.beginPath(); ctx.ellipse(sd * (FW - 2), faceY + 4, 11, 20, sd * 0.15, 0, TAU); ctx.fill();
      const ex = sd * (FW + 1), ey = faceY + 26;
      if (c.ear === 'kundala') { circle(ctx, ex, ey + 10, 13, '#ffd96a'); circle(ctx, ex, ey + 10, 6, '#ff8a1a'); A.glow(ctx, ex, ey + 10, 34, '#ffd96a', 0.6 + Math.sin(t * 3) * 0.2); }
      else if (c.ear === 'ring' || c.ear === 'big') { ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = c.ear === 'big' ? 5 : 3.5; ctx.beginPath(); ctx.arc(ex, ey + 10, c.ear === 'big' ? 13 : 9, 0, TAU); ctx.stroke(); }
      else if (c.ear === 'jhumka') { circle(ctx, ex, ey, 4, '#e6b84a'); ctx.fillStyle = '#e6b84a'; ctx.beginPath(); ctx.moveTo(ex - 9, ey + 22); ctx.quadraticCurveTo(ex, ey, ex + 9, ey + 22); ctx.fill(); for (let k = -1; k <= 1; k++) circle(ctx, ex + k * 6, ey + 25, 2.4, '#ff6a8a'); }
      else if (c.ear === 'stud') circle(ctx, ex, ey + 2, 4.5, '#e6b84a');
    }

    // face shape
    const fx = 0, fy = faceY;
    const chin = fy + FH + (c.gaunt ? 8 : 0);
    const jaw = c.female || c.child ? 0.55 : 0.7;
    ctx.beginPath();
    ctx.moveTo(fx, fy - FH);
    ctx.bezierCurveTo(fx + FW * 0.95, fy - FH, fx + FW * 1.02, fy - FH * 0.25, fx + FW, fy + FH * 0.15);
    ctx.bezierCurveTo(fx + FW * 0.98, fy + FH * 0.6, fx + FW * jaw, chin, fx, chin);
    ctx.bezierCurveTo(fx - FW * jaw, chin, fx - FW * 0.98, fy + FH * 0.6, fx - FW, fy + FH * 0.15);
    ctx.bezierCurveTo(fx - FW * 1.02, fy - FH * 0.25, fx - FW * 0.95, fy - FH, fx, fy - FH);
    const fg = ctx.createRadialGradient(fx + 18, fy - 20, 10, fx, fy, FW * 1.5);
    fg.addColorStop(0, M.shade(c.skin, 0.22)); fg.addColorStop(0.6, c.skin); fg.addColorStop(1, M.shade(c.skin, -0.35));
    ctx.fillStyle = fg; ctx.fill();
    if (c.glowSkin) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, fx, fy, FW * 1.6, c.glowSkin, 0.25); ctx.restore(); }
    if (c.gaunt) { ctx.fillStyle = M.rgba('#000000', 0.15); ctx.beginPath(); ctx.ellipse(fx - FW * 0.55, fy + 22, 12, 22, 0.2, 0, TAU); ctx.ellipse(fx + FW * 0.55, fy + 22, 12, 22, -0.2, 0, TAU); ctx.fill(); }
    // cheeks
    ctx.fillStyle = M.rgba('#ff6a5a', c.female || c.young ? 0.14 : 0.07);
    ctx.beginPath(); ctx.ellipse(fx - FW * 0.55, fy + 24, 16, 10, 0, 0, TAU); ctx.ellipse(fx + FW * 0.55, fy + 24, 16, 10, 0, 0, TAU); ctx.fill();

    // eyes
    const blink = (t % 4.3) > 4.15 || opts.closed;
    const eyeY = fy - 4, eyeX = FW * 0.42, ew = c.child ? 15 : 16, eh = c.female ? 8.5 : 7.5;
    for (const sd of [-1, 1]) {
      const ex = fx + sd * eyeX;
      // brows
      ctx.strokeStyle = c.old ? '#d8d4c8' : M.shade(c.hair, -0.1);
      ctx.lineWidth = c.female ? 3.5 : 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ex - sd * ew * 1.1, eyeY - 15 + c.brow * 10); ctx.quadraticCurveTo(ex, eyeY - 24 - c.brow * 4, ex + sd * ew * 1.15, eyeY - 18 - c.brow * 12); ctx.stroke();
      if (blink) {
        ctx.strokeStyle = '#1a0c08'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex - ew, eyeY); ctx.quadraticCurveTo(ex, eyeY + 5, ex + ew, eyeY); ctx.stroke();
        continue;
      }
      ctx.beginPath(); ctx.moveTo(ex - ew, eyeY); ctx.quadraticCurveTo(ex, eyeY - eh * 1.6, ex + ew, eyeY - 1); ctx.quadraticCurveTo(ex, eyeY + eh * 1.2, ex - ew, eyeY); ctx.closePath();
      ctx.fillStyle = c.glowEyes ? M.shade(c.eyes, 0.6) : '#f6f0e8'; ctx.fill();
      ctx.save(); ctx.clip();
      const look = Math.sin(t * 0.37) * 2;
      circle(ctx, ex + look, eyeY - 1, 7, c.eyes || '#3a2414');
      circle(ctx, ex + look, eyeY - 1, 3.4, c.glowEyes ? '#ffffff' : '#0a0604');
      circle(ctx, ex + look + 2.5, eyeY - 3.5, 1.8, '#ffffff');
      ctx.restore();
      // kohl
      ctx.strokeStyle = '#140a06'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(ex - ew - sd * 0, eyeY); ctx.quadraticCurveTo(ex, eyeY - eh * 1.6, ex + ew, eyeY - 1); if (sd === 1) ctx.lineTo(ex + ew + 6, eyeY - 4); else ctx.moveTo(ex - ew, eyeY), ctx.lineTo(ex - ew - 6, eyeY - 4); ctx.stroke();
      if (c.glowEyes) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, ex, eyeY, 24, c.eyes, 0.5); ctx.restore(); }
    }
    // nose
    ctx.strokeStyle = M.rgba(M.shade(c.skin, -0.5), 0.6); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(fx + 4, fy + 2); ctx.quadraticCurveTo(fx + 7, fy + 22, fx + 3, fy + 28); ctx.stroke();
    ctx.fillStyle = M.rgba(M.shade(c.skin, -0.55), 0.5);
    ctx.beginPath(); ctx.ellipse(fx - 6, fy + 30, 4, 2.2, 0, 0, TAU); ctx.ellipse(fx + 6, fy + 30, 4, 2.2, 0, 0, TAU); ctx.fill();
    if (c.nosering) { ctx.strokeStyle = '#ffd96a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(fx - 12, fy + 34, 8, -1.2, 2.2); ctx.stroke(); circle(ctx, fx - 18, fy + 38, 2.2, '#ff3a5a'); }
    // lips
    const ly = fy + 46;
    const speak = opts.talking ? Math.abs(Math.sin(t * 14)) * 3 : 0;
    ctx.fillStyle = c.lips;
    ctx.beginPath(); ctx.moveTo(fx - 15, ly); ctx.quadraticCurveTo(fx - 6, ly - 6, fx, ly - 3); ctx.quadraticCurveTo(fx + 6, ly - 6, fx + 15, ly); ctx.quadraticCurveTo(fx, ly + 9 + speak, fx - 15, ly); ctx.fill();
    ctx.strokeStyle = M.shade(c.lips, -0.4); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx - 14, ly); ctx.quadraticCurveTo(fx, ly + 2 + speak, fx + 14, ly); ctx.stroke();
    // facial hair
    if (c.beard) {
      ctx.fillStyle = c.beard;
      ctx.beginPath(); ctx.moveTo(fx - FW * 0.95, fy + 10); ctx.quadraticCurveTo(fx - FW * 0.9, chin + 30, fx, chin + (c.old ? 60 : 30)); ctx.quadraticCurveTo(fx + FW * 0.9, chin + 30, fx + FW * 0.95, fy + 10); ctx.quadraticCurveTo(fx + FW * 0.6, fy + 50, fx + 18, ly + 12); ctx.lineTo(fx - 18, ly + 12); ctx.quadraticCurveTo(fx - FW * 0.6, fy + 50, fx - FW * 0.95, fy + 10); ctx.fill();
      if (c.old) { ctx.strokeStyle = M.rgba('#a8a090', 0.5); ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(fx - 30 + i * 7, ly + 14); ctx.quadraticCurveTo(fx - 30 + i * 7.5, chin + 20, fx - 10 + i * 2.5, chin + 50); ctx.stroke(); } }
    }
    if (c.mustache) {
      ctx.fillStyle = c.mustache;
      ctx.beginPath(); ctx.moveTo(fx, ly - 6); ctx.quadraticCurveTo(fx - 20, ly - 12, fx - 30, ly - 2); ctx.quadraticCurveTo(fx - 18, ly - 4, fx, ly - 1); ctx.quadraticCurveTo(fx + 18, ly - 4, fx + 30, ly - 2); ctx.quadraticCurveTo(fx + 20, ly - 12, fx, ly - 6); ctx.fill();
    }
    // forehead marks
    if (c.tilak) {
      if (c.ash) { ctx.strokeStyle = M.rgba(c.tilak, 0.85); ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(fx - 26, fy - 46 + i * 7); ctx.lineTo(fx + 26, fy - 46 + i * 7); ctx.stroke(); } circle(ctx, fx, fy - 40, 3.5, '#d8283a'); }
      else { ctx.fillStyle = c.tilak; ctx.beginPath(); ctx.moveTo(fx - 4, fy - 30); ctx.lineTo(fx, fy - 62); ctx.lineTo(fx + 4, fy - 30); ctx.fill(); }
    }
    if (c.bindi) circle(ctx, fx, fy - 30, c.female ? 5 : 4, c.bindi);
    if (c.thirdEye) { ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.ellipse(fx, fy - 44, 4, 9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#d8102a'; ctx.beginPath(); ctx.ellipse(fx, fy - 44, 2, 5, 0, 0, TAU); ctx.fill(); }
    if (c.wound) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, fx, fy - 42, 40, '#ff1a3a', 0.6 + Math.sin(t * 4) * 0.2); ctx.restore();
      ctx.fillStyle = '#3a0008'; ctx.beginPath(); ctx.ellipse(fx, fy - 42, 9, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#a0102a'; ctx.beginPath(); ctx.ellipse(fx, fy - 40, 5, 6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = M.rgba('#a0102a', 0.8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx + 2, fy - 32); ctx.quadraticCurveTo(fx + 4, fy - 20, fx + 2, fy - 8 + Math.sin(t) * 3); ctx.stroke();
    }

    // hair front / headgear
    ctx.fillStyle = c.hair;
    const hairTop = () => {
      ctx.beginPath();
      ctx.moveTo(fx - FW - 6, fy + 8);
      ctx.bezierCurveTo(fx - FW - 10, fy - FH - 30, fx + FW + 10, fy - FH - 30, fx + FW + 6, fy + 8);
      ctx.quadraticCurveTo(fx + FW * 0.7, fy - FH * 0.75, fx + 6, fy - FH * 0.82);
      ctx.quadraticCurveTo(fx - FW * 0.7, fy - FH * 0.75, fx - FW - 6, fy + 8);
      ctx.fill();
    };
    const G = '#e6b84a';
    const gemC = c.gem || '#ff3a5a';
    switch (c.crown) {
      case 'mukuta':
      case 'tall':
      case 'tallF':
      case 'horned': {
        hairTop();
        const H = c.crown === 'mukuta' ? 120 : 160;
        const base = fy - FH * 0.62;
        if (c.crown === 'horned') {
          ctx.strokeStyle = '#0a080c'; ctx.lineWidth = 18; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(fx - FW * 0.7, base - 20); ctx.quadraticCurveTo(fx - FW * 2.1, base - 30, fx - FW * 1.8, base - 120); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(fx + FW * 0.7, base - 20); ctx.quadraticCurveTo(fx + FW * 2.1, base - 30, fx + FW * 1.8, base - 120); ctx.stroke();
          ctx.strokeStyle = M.rgba('#5a5060', 0.6); ctx.lineWidth = 4; ctx.stroke();
        }
        ctx.fillStyle = lg(ctx, -FW, base - H, FW, base, [[0, M.shade(G, 0.5)], [0.5, G], [1, M.shade(G, -0.4)]]);
        ctx.beginPath(); ctx.moveTo(fx - FW * 1.02, base + 10);
        ctx.lineTo(fx - FW * 0.9, base - H * 0.35); ctx.lineTo(fx - FW * 0.55, base - H * 0.55); ctx.lineTo(fx - FW * 0.3, base - H * 0.8); ctx.lineTo(fx, base - H);
        ctx.lineTo(fx + FW * 0.3, base - H * 0.8); ctx.lineTo(fx + FW * 0.55, base - H * 0.55); ctx.lineTo(fx + FW * 0.9, base - H * 0.35); ctx.lineTo(fx + FW * 1.02, base + 10);
        ctx.quadraticCurveTo(fx, base - 12, fx - FW * 1.02, base + 10); ctx.fill();
        ctx.strokeStyle = M.shade(G, -0.45); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(fx - FW, base + 2); ctx.quadraticCurveTo(fx, base - 18, fx + FW, base + 2); ctx.stroke();
        for (let k = 1; k <= 3; k++) { const yy = base - H * 0.22 * k; const ww = FW * (1 - k * 0.22); ctx.beginPath(); ctx.moveTo(fx - ww, yy); ctx.quadraticCurveTo(fx, yy - 10, fx + ww, yy); ctx.stroke(); }
        circle(ctx, fx, base - 22, 11, gemC); circle(ctx, fx - 3, base - 25, 3.5, '#ffffff');
        for (const sd of [-1, 1]) { circle(ctx, fx + sd * FW * 0.6, base - 12, 6, gemC); }
        circle(ctx, fx, base - H, 6, '#fff4c0'); A.glow(ctx, fx, base - H, 22, '#fff4c0', 0.6);
        for (let i = 0; i < 9; i++) circle(ctx, fx - FW + i * (FW / 4), base + 6, 3.5, '#fff4d0');
        break;
      }
      case 'turban': {
        const tc = c.turban;
        ctx.fillStyle = lg(ctx, -FW, fy - FH - 60, FW, fy - FH, [[0, M.shade(tc, 0.3)], [1, M.shade(tc, -0.3)]]);
        ctx.beginPath(); ctx.ellipse(fx, fy - FH * 0.7, FW * 1.18, FH * 0.65, 0, Math.PI, 0); ctx.lineTo(fx + FW * 1.1, fy - FH * 0.55); ctx.quadraticCurveTo(fx, fy - FH * 0.75, fx - FW * 1.1, fy - FH * 0.55); ctx.fill();
        ctx.strokeStyle = M.shade(tc, -0.35); ctx.lineWidth = 3;
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(fx, fy - FH * 0.7 - k * 6, FW * (1.1 - k * 0.06), FH * (0.55 - k * 0.08), (k % 2 ? 0.08 : -0.08), Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
        circle(ctx, fx + 10, fy - FH * 0.95, 10, gemC); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.ellipse(fx + 16, fy - FH * 1.3, 6, 30, 0.3, 0, TAU); ctx.fill();
        break;
      }
      case 'shikha': {
        ctx.fillStyle = M.rgba(c.hair, 0.35);
        ctx.beginPath(); ctx.ellipse(fx, fy - FH * 0.55, FW * 0.95, FH * 0.5, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = c.hair;
        ctx.beginPath(); ctx.moveTo(fx - 6, fy - FH * 0.95); ctx.quadraticCurveTo(fx - 30, fy - FH * 1.4, fx - 10 + Math.sin(t * 2) * 6, fy - FH * 1.6); ctx.quadraticCurveTo(fx + 4, fy - FH * 1.3, fx + 6, fy - FH * 0.95); ctx.fill();
        break;
      }
      case 'topknot': {
        hairTop();
        ctx.beginPath(); ctx.ellipse(fx, fy - FH * 1.05, 30, 26, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = M.rgba('#a8a090', 0.6); ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(fx, fy - FH * 1.05, 10 + i * 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
        ctx.fillStyle = '#d8902a'; ctx.fillRect(fx - 30, fy - FH * 0.92, 60, 6);
        break;
      }
      case 'crescent': {
        hairTop();
        const by = fy - FH * 0.8;
        ctx.fillStyle = '#d0d8f0'; ctx.fillRect(fx - FW, by - 6, FW * 2, 12);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, fx, by - 70, 90, '#cfe0ff', 0.7); ctx.restore();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(fx, by - 60, 52, Math.PI * 0.82, Math.PI * 2.18); ctx.arc(fx, by - 42, 42, Math.PI * 2.18, Math.PI * 0.82, true); ctx.fill();
        circle(ctx, fx, by - 6, 8, gemC);
        break;
      }
      case 'helm': {
        const hc = c.armor;
        ctx.fillStyle = lg(ctx, -FW, fy - FH - 40, FW, fy, [[0, M.shade(hc, 0.4)], [1, M.shade(hc, -0.4)]]);
        ctx.beginPath(); ctx.moveTo(fx - FW * 1.15, fy + 10); ctx.bezierCurveTo(fx - FW * 1.2, fy - FH * 1.4, fx + FW * 1.2, fy - FH * 1.4, fx + FW * 1.15, fy + 10); ctx.lineTo(fx + FW * 0.85, fy + 10); ctx.quadraticCurveTo(fx + FW * 0.8, fy - FH * 0.6, fx, fy - FH * 0.6); ctx.quadraticCurveTo(fx - FW * 0.8, fy - FH * 0.6, fx - FW * 0.85, fy + 10); ctx.fill();
        ctx.fillStyle = M.shade(hc, 0.3); ctx.fillRect(fx - 5, fy - FH * 0.65, 10, 50);
        ctx.fillStyle = '#7a2a5a'; ctx.beginPath(); ctx.moveTo(fx, fy - FH * 1.25); ctx.quadraticCurveTo(fx - 60, fy - FH * 1.8, fx - 90 + Math.sin(t * 2) * 6, fy - FH * 0.9); ctx.quadraticCurveTo(fx - 40, fy - FH * 1.3, fx, fy - FH * 1.1); ctx.fill();
        circle(ctx, fx, fy - FH * 0.95, 10, gemC);
        // trident emblem: Shiva's boon
        ctx.strokeStyle = M.rgba('#cfe0ff', 0.8); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(fx, fy - FH * 1.05); ctx.lineTo(fx, fy - FH * 0.82); ctx.moveTo(fx - 10, fy - FH * 1.0); ctx.quadraticCurveTo(fx, fy - FH * 0.88, fx + 10, fy - FH * 1.0); ctx.stroke();
        break;
      }
      case 'female': {
        ctx.beginPath();
        ctx.moveTo(fx - FW - 4, fy + 20);
        ctx.bezierCurveTo(fx - FW - 12, fy - FH - 34, fx + FW + 12, fy - FH - 34, fx + FW + 4, fy + 20);
        ctx.quadraticCurveTo(fx + FW * 0.85, fy - FH * 0.6, fx, fy - FH * 0.86);
        ctx.quadraticCurveTo(fx - FW * 0.85, fy - FH * 0.6, fx - FW - 4, fy + 20);
        ctx.fill();
        ctx.strokeStyle = M.shade(c.hair, 0.25); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy - FH * 0.87); ctx.lineTo(fx, fy - FH - 18); ctx.stroke();
        // maang tikka
        ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy - FH - 14); ctx.lineTo(fx, fy - FH * 0.75); ctx.stroke();
        circle(ctx, fx, fy - FH * 0.72, 7, gemC); circle(ctx, fx, fy - FH * 0.72, 3, '#ffffff');
        if (c.flowers) for (let i = 0; i < 7; i++) circle(ctx, fx + FW * 0.9 + Math.cos(i) * 10, fy - FH * 0.4 + i * 8, 6, i % 2 ? c.flowers : '#ffd0d8');
        break;
      }
      case 'flame': {
        for (let k = 0; k < 9; k++) {
          const xx = fx - FW + k * (FW / 4), fh = 70 + Math.sin(t * 8 + k * 1.7) * 18 + (k === 4 ? 40 : 0);
          ctx.fillStyle = k % 2 ? '#ffd15c' : '#ff6a1a';
          ctx.beginPath(); ctx.moveTo(xx - 18, fy - FH * 0.6); ctx.quadraticCurveTo(xx - 12, fy - FH * 0.6 - fh * 0.6, xx, fy - FH * 0.6 - fh); ctx.quadraticCurveTo(xx + 12, fy - FH * 0.6 - fh * 0.6, xx + 18, fy - FH * 0.6); ctx.fill();
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, fx, fy - FH, 120, '#ff7a2f', 0.5); ctx.restore();
        break;
      }
      case 'wild': hairTop(); break;
    }
    if (c.pen) {
      ctx.save(); ctx.translate(fx + FW + 4, fy - 30); ctx.rotate(-0.9);
      ctx.fillStyle = '#d8c090'; ctx.fillRect(-4, -60, 8, 70);
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(0, 22); ctx.lineTo(4, 10); ctx.fill();
      ctx.restore();
    }
    if (c.spectral) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) A.glow(ctx, -150 + i * 60 + Math.sin(t + i) * 20, -20 - ((t * 40 + i * 70) % 200), 50, c.bg[0], 0.18);
      ctx.restore();
    }
    // rim light
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rim = ctx.createLinearGradient(-200, 0, 200, 0);
    rim.addColorStop(0, M.rgba(c.bg[0], 0.0)); rim.addColorStop(0.85, M.rgba(c.bg[0], 0)); rim.addColorStop(1, M.rgba(c.bg[0], 0.25));
    ctx.fillStyle = rim; ctx.fillRect(-200, -440, 400, 460);
    ctx.restore();
    ctx.restore();
  };
})();
