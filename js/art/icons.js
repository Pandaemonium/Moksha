'use strict';
// ───────────────────────────────────────────────────────────────
//  Icons: god sigils, rewards, ledger glyphs
// ───────────────────────────────────────────────────────────────
(() => {
  const A = M.art;
  const TAU = Math.PI * 2;
  const circle = (ctx, x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };

  const ICON_COLORS = {
    amrita: '#7affe0', kauri: '#ffe9c8', heart: '#ff4a6a', punya: '#ffcf4a', garland: '#ff9a1a', chisel: '#d0d8e8',
    shop: '#ffd24a', boss: '#ff4a4a', rest: '#7ad8ff', heal: '#ffb060', shield: '#9fc8ff', eye: '#9fffcf', lotus: '#ff8ab8',
    wind: '#8ff0c4', astra: '#ffe27a', star: '#fff2a8', scroll: '#e8d0a0', coin: '#ffd24a', bell: '#e6b84a', lamp: '#ffb040',
    pen: '#d8c090', ember: '#ff7a2f', thread: '#c8f0a0', moon: '#cfe0ff', reroll: '#c8b0ff', key: '#ffd24a', next: '#ffe08a',
  };
  A.iconColor = (k) => (M.GODS[k] ? M.GODS[k].color : ICON_COLORS[k] || '#ffffff');

  // draws icon centred at (x,y) fitting radius r
  A.icon = (ctx, kind, x, y, r, t = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(r / 20, r / 20);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    switch (kind) {
      case 'indra': { // vajra
        ctx.fillStyle = '#ffe27a'; ctx.strokeStyle = '#6fd3ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, 4, 3, 0, 0, TAU); ctx.fill();
        for (const sd of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(0, sd * 3); ctx.quadraticCurveTo(-9, sd * 10, 0, sd * 18); ctx.quadraticCurveTo(9, sd * 10, 0, sd * 3); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, sd * 3); ctx.lineTo(0, sd * 18); ctx.stroke();
        }
        ctx.strokeStyle = '#cfefff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(-9, -1); ctx.lineTo(-13, 2); ctx.lineTo(-8, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(9, -3); ctx.lineTo(13, 0); ctx.lineTo(8, 6); ctx.stroke();
        break;
      }
      case 'agni': case 'ember': {
        const f = Math.sin(t * 8) * 1.2;
        ctx.fillStyle = '#ff5a1a';
        ctx.beginPath(); ctx.moveTo(-11, 12); ctx.quadraticCurveTo(-15, -2, -4 + f, -18); ctx.quadraticCurveTo(-2, -6, 3, -8); ctx.quadraticCurveTo(4, -16, 8 - f, -20); ctx.quadraticCurveTo(16, -2, 11, 12); ctx.quadraticCurveTo(0, 18, -11, 12); ctx.fill();
        ctx.fillStyle = '#ffd15c';
        ctx.beginPath(); ctx.moveTo(-6, 12); ctx.quadraticCurveTo(-8, 2, 0 + f, -8); ctx.quadraticCurveTo(8, 2, 6, 12); ctx.quadraticCurveTo(0, 15, -6, 12); ctx.fill();
        circle(ctx, 0, 8, 3, '#ffffff');
        break;
      }
      case 'vayu': case 'wind': {
        ctx.strokeStyle = '#8ff0c4'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-16, -6); ctx.lineTo(6, -6); ctx.arc(6, -11, 5, Math.PI / 2, -Math.PI * 0.9, true); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(12, 2); ctx.arc(12, 7, 5, -Math.PI / 2, Math.PI * 0.9); ctx.stroke();
        ctx.strokeStyle = '#e8fff4'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(2, 10); ctx.arc(2, 14, 4, -Math.PI / 2, Math.PI * 0.9); ctx.stroke();
        break;
      }
      case 'varuna': {
        ctx.strokeStyle = '#2fb8e6'; ctx.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          for (let i = -16; i <= 16; i += 2) ctx.lineTo(i, -8 + k * 8 + Math.sin(i * 0.35 + k + t * 3) * 3);
          ctx.stroke();
        }
        ctx.strokeStyle = '#9ff0ff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.stroke();
        break;
      }
      case 'surya': case 'star': {
        const c1 = kind === 'surya' ? '#ffb81f' : '#fff2a8';
        ctx.fillStyle = c1;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU + t * 0.5;
          ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.12) * 9, Math.sin(a - 0.12) * 9); ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19); ctx.lineTo(Math.cos(a + 0.12) * 9, Math.sin(a + 0.12) * 9); ctx.fill();
        }
        circle(ctx, 0, 0, 9, '#fff2a8'); circle(ctx, 0, 0, 5, c1);
        break;
      }
      case 'durga': { // trishula
        ctx.strokeStyle = '#ffc0d8'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, -18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-11, -16); ctx.quadraticCurveTo(-11, -3, 0, -3); ctx.quadraticCurveTo(11, -3, 11, -16); ctx.stroke();
        ctx.fillStyle = '#ff3d7f';
        for (const xx of [-11, 0, 11]) { ctx.beginPath(); ctx.moveTo(xx - 3, -15); ctx.lineTo(xx, -21); ctx.lineTo(xx + 3, -15); ctx.fill(); }
        circle(ctx, 0, 4, 3, '#ff3d7f');
        break;
      }
      case 'amrita': { // kalasha
        const g = ctx.createRadialGradient(-4, 0, 1, 0, 4, 14);
        g.addColorStop(0, '#fff0b0'); g.addColorStop(0.5, '#d8a030'); g.addColorStop(1, '#6a3a10');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 5, 12, 11, 0, 0, TAU); ctx.fill();
        ctx.fillRect(-5, -9, 10, 6);
        ctx.fillStyle = '#7affe0'; ctx.beginPath(); ctx.ellipse(0, -9, 6, 2.5, 0, 0, TAU); ctx.fill();
        A.glow(ctx, 0, -12, 14, '#7affe0', 0.8 + Math.sin(t * 4) * 0.2);
        circle(ctx, 0, -14 - ((t * 10) % 6), 1.6, '#e0fff8');
        break;
      }
      case 'kauri': case 'coin': {
        ctx.fillStyle = '#ffe9c8'; ctx.strokeStyle = '#a08060'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, 11, 15, 0.3, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#6a4a30'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-3, -11); ctx.quadraticCurveTo(2, 0, -2, 12); ctx.stroke();
        for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-1 + i * 0.3, i * 3.2); ctx.lineTo(3 + i * 0.3, i * 3.2); ctx.stroke(); }
        break;
      }
      case 'heart': case 'lotus': {
        const pc = kind === 'heart' ? '#ff4a6a' : '#ff8ab8';
        for (let i = -2; i <= 2; i++) {
          ctx.save(); ctx.rotate(i * 0.42);
          ctx.fillStyle = M.shade(pc, Math.abs(i) * -0.12);
          ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(-8, -2, 0, -17); ctx.quadraticCurveTo(8, -2, 0, 10); ctx.fill();
          ctx.restore();
        }
        circle(ctx, 0, 7, 4, '#ffd96a');
        ctx.fillStyle = '#2a8a5a'; ctx.beginPath(); ctx.ellipse(0, 14, 16, 4, 0, 0, TAU); ctx.fill();
        break;
      }
      case 'punya': case 'lamp': {
        ctx.fillStyle = '#c8802a'; ctx.beginPath(); ctx.moveTo(-14, 6); ctx.quadraticCurveTo(0, 18, 14, 6); ctx.quadraticCurveTo(10, 3, 0, 3); ctx.quadraticCurveTo(-10, 3, -14, 6); ctx.fill();
        ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(10, 5); ctx.lineTo(17, 1); ctx.lineTo(12, 7); ctx.fill();
        const f = Math.sin(t * 9) * 1;
        ctx.fillStyle = '#ffcf4a'; ctx.beginPath(); ctx.moveTo(-4, 3); ctx.quadraticCurveTo(-3 + f, -10, 0 + f, -17); ctx.quadraticCurveTo(3 + f, -10, 4, 3); ctx.fill();
        circle(ctx, f * 0.4, -2, 2.4, '#ffffff');
        A.glow(ctx, 0, -6, 18, '#ffcf4a', 0.5);
        break;
      }
      case 'garland': {
        for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; circle(ctx, Math.cos(a) * 13, Math.sin(a) * 13, 4.4, i % 2 ? '#ff9a1a' : '#ffd23a'); }
        circle(ctx, 0, 15, 4, '#ff5a1a');
        break;
      }
      case 'chisel': {
        ctx.save(); ctx.rotate(-0.7);
        ctx.fillStyle = '#8a5a2a'; M.rr(ctx, -4, 2, 8, 18, 2); ctx.fill();
        ctx.fillStyle = '#d0d8e8'; ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(-3, -16); ctx.lineTo(3, -16); ctx.lineTo(4, 2); ctx.fill();
        ctx.fillStyle = '#e6b84a'; ctx.fillRect(-5, 0, 10, 3);
        ctx.restore();
        A.glow(ctx, 8, -10, 10, '#ffffff', 0.6);
        break;
      }
      case 'shop': {
        ctx.fillStyle = '#c8902a'; ctx.beginPath(); ctx.moveTo(-12, -4); ctx.quadraticCurveTo(-16, 16, 0, 16); ctx.quadraticCurveTo(16, 16, 12, -4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e6b84a'; ctx.fillRect(-8, -9, 16, 5);
        ctx.fillStyle = '#8a1a1a'; ctx.fillRect(-9, -5, 18, 2.5);
        circle(ctx, 0, 6, 4, '#ffd24a');
        break;
      }
      case 'boss': {
        ctx.strokeStyle = '#ff4a4a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(14, -14); ctx.moveTo(14, 14); ctx.lineTo(-14, -14); ctx.stroke();
        circle(ctx, 0, 0, 6, '#ff4a4a'); circle(ctx, 0, 0, 3, '#ffd96a');
        break;
      }
      case 'rest': {
        ctx.strokeStyle = '#7ad8ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 10, 17, 5, 0, 0, TAU); ctx.stroke();
        A.icon(ctx, 'lotus', 0, -2, 14, t);
        break;
      }
      case 'heal': {
        for (const [xx, yy] of [[-7, 4], [7, 4], [0, -6]]) {
          const g = ctx.createRadialGradient(xx - 2, yy - 2, 1, xx, yy, 8);
          g.addColorStop(0, '#ffe0a0'); g.addColorStop(1, '#d87a20');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xx, yy, 7.5, 0, TAU); ctx.fill();
        }
        break;
      }
      case 'shield': {
        ctx.fillStyle = '#5a7ab8'; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(14, -10); ctx.quadraticCurveTo(14, 8, 0, 18); ctx.quadraticCurveTo(-14, 8, -14, -10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 2; ctx.stroke(); circle(ctx, 0, 0, 4, '#e6b84a');
        break;
      }
      case 'eye': {
        ctx.fillStyle = '#f0f0e0'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.quadraticCurveTo(0, -14, 16, 0); ctx.quadraticCurveTo(0, 14, -16, 0); ctx.fill();
        circle(ctx, 0, 0, 6, '#2a8a5a'); circle(ctx, 0, 0, 3, '#0a0a0a');
        ctx.strokeStyle = '#9fffcf'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.stroke();
        break;
      }
      case 'astra': {
        ctx.save(); ctx.rotate(-0.8);
        ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(5, -6); ctx.lineTo(2, 14); ctx.lineTo(-2, 14); ctx.lineTo(-5, -6); ctx.closePath(); ctx.fill();
        ctx.restore(); A.glow(ctx, 0, 0, 18, '#ffe27a', 0.5);
        break;
      }
      case 'scroll': {
        ctx.fillStyle = '#e8d0a0'; ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = '#a07a40'; ctx.beginPath(); ctx.ellipse(-12, 0, 3, 13, 0, 0, TAU); ctx.ellipse(12, 0, 3, 13, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#7a4a20'; ctx.lineWidth = 1.2; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-7, i * 5); ctx.lineTo(7, i * 5); ctx.stroke(); }
        break;
      }
      case 'bell': {
        ctx.fillStyle = '#e6b84a'; ctx.beginPath(); ctx.moveTo(-12, 10); ctx.quadraticCurveTo(-12, -14, 0, -14); ctx.quadraticCurveTo(12, -14, 12, 10); ctx.closePath(); ctx.fill();
        ctx.fillRect(-14, 9, 28, 3); circle(ctx, 0, 14, 3, '#8a5a1a'); circle(ctx, 0, -16, 3, '#8a5a1a');
        break;
      }
      case 'pen': {
        ctx.save(); ctx.rotate(0.7);
        ctx.fillStyle = '#d8c090'; ctx.fillRect(-2.5, -18, 5, 28);
        ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(-2.5, 10); ctx.lineTo(0, 18); ctx.lineTo(2.5, 10); ctx.fill();
        ctx.restore();
        break;
      }
      case 'thread': {
        ctx.strokeStyle = '#c8f0a0'; ctx.lineWidth = 2.5;
        ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i * 0.5; ctx.lineTo(Math.cos(a) * (4 + i * 0.35), Math.sin(a) * (4 + i * 0.35)); } ctx.stroke();
        ctx.fillStyle = '#2a8a4a'; ctx.beginPath(); ctx.ellipse(10, -12, 5, 9, 0.6, 0, TAU); ctx.fill();
        break;
      }
      case 'moon': {
        ctx.fillStyle = '#e8f0ff';
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(7, -5, 13, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        A.glow(ctx, 0, 0, 22, '#cfe0ff', 0.4);
        break;
      }
      case 'reroll': {
        ctx.strokeStyle = '#c8b0ff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0.4, Math.PI * 1.7); ctx.stroke();
        ctx.fillStyle = '#c8b0ff'; ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(16, 2); ctx.lineTo(4, -2); ctx.fill();
        break;
      }
      case 'key': A.icon(ctx, 'chisel', 0, 0, 20, t); break;
      case 'next': { ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 2.5; for (let r = 4; r <= 16; r += 6) { ctx.beginPath(); ctx.arc(0, 0, r, t + r, t + r + 4.8); ctx.stroke(); } A.glow(ctx, 0, 0, 12, '#fff4c0', 0.8); break; }
      default: circle(ctx, 0, 0, 10, '#ffffff');
    }
    ctx.restore();
  };

  // orb with icon (for reward previews above doors and pickups)
  A.orb = (ctx, kind, x, y, r, t) => {
    const col = A.iconColor(kind);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    A.glow(ctx, x, y, r * 2.4, col, 0.45 + Math.sin(t * 3) * 0.1);
    ctx.restore();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 1, x, y, r);
    g.addColorStop(0, M.rgba('#ffffff', 0.35)); g.addColorStop(0.6, M.rgba(M.mix(col, '#140a20', 0.65), 0.9)); g.addColorStop(1, M.rgba(M.mix(col, '#000000', 0.6), 0.95));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = M.rgba(col, 0.9); ctx.lineWidth = 2; ctx.stroke();
    A.icon(ctx, kind, x, y, r * 0.72, t);
  };

  const urlCache = {};
  A.iconURL = (kind, size = 48, orb = false) => {
    const k = kind + ':' + size + ':' + orb;
    if (urlCache[k]) return urlCache[k];
    const c = M.makeCanvas(size, size);
    const ctx = c.getContext('2d');
    if (orb) A.orb(ctx, kind, size / 2, size / 2, size * 0.32, 0);
    else A.icon(ctx, kind, size / 2, size / 2, size * 0.42, 0);
    return (urlCache[k] = c.toDataURL());
  };
})();
