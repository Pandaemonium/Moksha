'use strict';
// ───────────────────────────────────────────────────────────────
//  Title background & cutscene illustrations
// ───────────────────────────────────────────────────────────────
(() => {
  const A = M.art;
  const TAU = Math.PI * 2;
  const petals = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: M.rand(3, 7), v: M.rand(0.02, 0.05), ph: M.rand(TAU), c: M.pick(['#ff8ab8', '#ffd0e0', '#ffcf6b', '#ffffff']) }));

  function sky(ctx, w, h, stops) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  function wheelRings(ctx, cx, cy, R, t, col, alpha = 1, flatten = 1) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, flatten);
    for (let r = 1; r <= 7; r++) {
      const rr = (R * r) / 7, n = 6 + r * 6, dir = r % 2 ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + t * 0.15 * dir + r;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        ctx.fillStyle = M.rgba(col, alpha * (0.35 + 0.08 * r));
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(0, -R * 0.025); ctx.lineTo(R * 0.012, R * 0.02); ctx.lineTo(-R * 0.012, R * 0.02); ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = M.rgba(col, alpha * 0.18); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }
  function drawPetals(ctx, w, h, t) {
    for (const p of petals) {
      const x = ((p.x + t * p.v * 0.6) % 1) * w, y = ((p.y + t * p.v) % 1) * h;
      ctx.save(); ctx.translate(x + Math.sin(t + p.ph) * 20, y); ctx.rotate(t + p.ph);
      ctx.fillStyle = M.rgba(p.c, 0.7);
      ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  A.titleBackground = (ctx, w, h, t) => {
    sky(ctx, w, h, [[0, '#14062a'], [0.55, '#4a0a2a'], [1, '#a0301a']]);
    const s = Math.min(w, h);
    ctx.globalCompositeOperation = 'lighter';
    A.glow(ctx, w / 2, h * 0.46, s * 0.6, '#ff7a2a', 0.35);
    A.glow(ctx, w / 2, h * 0.46, s * 0.25, '#ffd96a', 0.35);
    ctx.globalCompositeOperation = 'source-over';
    wheelRings(ctx, w / 2, h * 0.46, s * 0.62, t, '#ffcf6b', 0.9, 1);
    // mandala centre lotus
    ctx.save(); ctx.translate(w / 2, h * 0.46);
    for (let k = 0; k < 2; k++) for (let i = 0; i < 12; i++) {
      ctx.save(); ctx.rotate((i / 12) * TAU + k * (TAU / 24) + t * 0.05 * (k ? -1 : 1));
      ctx.fillStyle = M.rgba(k ? '#ff6a9a' : '#ffcf6b', 0.35 - k * 0.1);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.05, -s * 0.09, 0, -s * (0.16 + k * 0.04)); ctx.quadraticCurveTo(-s * 0.05, -s * 0.09, 0, 0); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // foreground silhouette: lotus leaves & reeds
    ctx.fillStyle = '#0a0412';
    for (let i = 0; i < 14; i++) {
      const x = (i / 13) * w, lh = h * (0.08 + ((i * 37) % 7) * 0.012);
      ctx.beginPath(); ctx.ellipse(x, h - lh * 0.3, w * 0.07, lh * 0.5, 0, Math.PI, 0); ctx.fill();
    }
    ctx.fillRect(0, h * 0.95, w, h * 0.05);
    ctx.strokeStyle = '#0a0412'; ctx.lineWidth = 3;
    for (let i = 0; i < 30; i++) { const x = (i * 97) % w; ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + 10, h * 0.85, x + Math.sin(t + i) * 6, h * (0.78 + (i % 5) * 0.02)); ctx.stroke(); }
    drawPetals(ctx, w, h, t);
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(5,0,10,0.75)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  };

  // cutscene illustrations
  A.scene = (ctx, key, w, h, t) => {
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, s = Math.min(w, h);
    const portrait = (id, bg) => {
      sky(ctx, w, h, bg);
      const pc = A._pcv || (A._pcv = M.makeCanvas(360, 420));
      const px = pc.getContext('2d');
      px.globalCompositeOperation = 'source-over';
      A.portrait(px, id, 360, 420, t, {});
      px.globalCompositeOperation = 'destination-in';
      const mg = px.createRadialGradient(180, 190, 60, 180, 200, 215);
      mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(0.7, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
      px.fillStyle = mg; px.fillRect(0, 0, 360, 420);
      px.globalCompositeOperation = 'source-over';
      const ps = Math.min(w / 360, h / 420) * 0.95;
      ctx.drawImage(pc, cx - 180 * ps, h - 420 * ps, 360 * ps, 420 * ps);
    };
    switch (key) {
      case 'field': {
        sky(ctx, w, h, [[0, '#3a0a2a'], [0.5, '#c83a1a'], [0.8, '#ffb040'], [1, '#3a1a0a']]);
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, w * 0.62, h * 0.62, s * 0.4, '#fff0a0', 0.9); ctx.globalCompositeOperation = 'source-over';
        for (let row = 0; row < 4; row++) {
          ctx.fillStyle = M.mix('#1a0408', '#5a1a10', row / 4);
          const by = h * (0.7 + row * 0.08);
          ctx.fillRect(0, by, w, h - by);
          for (let x = (row * 13) % 20; x < w; x += 9 + row * 3) {
            const ph = Math.sin(x * 0.3 + row) * 4;
            ctx.fillRect(x, by - 18 - row * 4 + ph, 3 + row, 20 + row * 4);
            if (x % 5 < 1) { ctx.fillRect(x + 1, by - 50 - row * 8, 1.5, 40); }
          }
          for (let x = 40 + row * 70; x < w; x += 220) { ctx.fillRect(x, by - 90 - row * 12, 2.5, 80); ctx.beginPath(); ctx.moveTo(x + 2, by - 90 - row * 12); ctx.lineTo(x + 30 + Math.sin(t * 3 + x) * 4, by - 82 - row * 12); ctx.lineTo(x + 2, by - 72 - row * 12); ctx.fill(); }
        }
        break;
      }
      case 'vyuha': case 'breach': {
        sky(ctx, w, h, [[0, '#0a0614'], [1, '#2a0a1a']]);
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, cx, cy, s * 0.5, '#ff7a2a', 0.25); ctx.globalCompositeOperation = 'source-over';
        wheelRings(ctx, cx, cy, s * 0.45, t * 2, '#ffcf6b', 1, 0.7);
        if (key === 'breach') {
          const k = (t % 4) / 4;
          ctx.globalCompositeOperation = 'lighter';
          const x = M.lerp(w * 0.05, cx, Math.min(1, k * 1.4)), y = M.lerp(h * 0.9, cy, Math.min(1, k * 1.4));
          ctx.strokeStyle = '#fff4c0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(w * 0.05, h * 0.9); ctx.lineTo(x, y); ctx.stroke();
          A.glow(ctx, x, y, 80, '#ffe08a', 1);
          ctx.globalCompositeOperation = 'source-over';
        }
        break;
      }
      case 'womb': {
        sky(ctx, w, h, [[0, '#2a0a2a'], [1, '#6a1a3a']]);
        ctx.globalCompositeOperation = 'lighter';
        A.glow(ctx, cx, cy, s * 0.45, '#ff8ab8', 0.5);
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 16; i++) {
          ctx.save(); ctx.translate(cx, cy + s * 0.12); ctx.rotate((i / 16) * TAU * 0.5 - TAU / 4 + Math.sin(t * 0.5) * 0.02);
          ctx.fillStyle = M.rgba(i % 2 ? '#ff9ac8' : '#ffc0dc', 0.75);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.06, -s * 0.12, 0, -s * 0.26); ctx.quadraticCurveTo(-s * 0.06, -s * 0.12, 0, 0); ctx.fill();
          ctx.restore();
        }
        ctx.globalCompositeOperation = 'lighter';
        A.glow(ctx, cx, cy, s * 0.12, '#fff4e0', 0.9);
        ctx.strokeStyle = M.rgba('#fff4e0', 0.8); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, s * 0.05, 0.5, Math.PI * 1.8); ctx.stroke();
        // sound-waves of the father's voice, fading
        for (let i = 0; i < 6; i++) {
          const k = ((t * 0.4 + i / 6) % 1);
          ctx.strokeStyle = M.rgba('#ffd96a', (1 - k) * 0.5 * (i < 3 ? 1 : 0.25)); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(w * 0.1, cy, s * 0.1 + k * s * 0.5, -0.5, 0.5); ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'boy': portrait('abhi', [[0, '#3a0a1a'], [1, '#a0401a']]); break;
      case 'drona': portrait('drona', [[0, '#1a1408'], [1, '#5a4020']]); break;
      case 'chandra': portrait('chandra', [[0, '#050a1a'], [1, '#1a2a5a']]); break;
      case 'yama': portrait('yama', [[0, '#14060a'], [1, '#3a0a14']]); break;
      case 'wheel': {
        sky(ctx, w, h, [[0, '#2a0408'], [0.6, '#a01a1a'], [1, '#2a0a08']]);
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, cx, cy * 0.9, s * 0.4, '#ff5a2a', 0.8); ctx.globalCompositeOperation = 'source-over';
        ctx.save(); ctx.translate(cx, cy * 0.9); ctx.rotate(t * 0.3);
        ctx.strokeStyle = '#140406'; ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.arc(0, 0, s * 0.25, 0, TAU); ctx.stroke();
        ctx.lineWidth = s * 0.012;
        for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * 0.25, Math.sin(a) * s * 0.25); ctx.stroke(); }
        ctx.fillStyle = '#140406'; ctx.beginPath(); ctx.arc(0, 0, s * 0.04, 0, TAU); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = 'rgba(20,4,6,0.9)'; ctx.lineWidth = 2;
        for (let i = 0; i < 18; i++) { const y = ((i * 53 + t * 300) % (h * 1.2)) - h * 0.1, x = (i * 131) % w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60, y + 30); ctx.stroke(); }
        break;
      }
      case 'river': {
        sky(ctx, w, h, [[0, '#05030f'], [0.55, '#14103a'], [1, '#05030f']]);
        for (let i = 0; i < 60; i++) { const x = (i * 97 + t * 10 * ((i % 3) + 1)) % w, y = h * 0.6 + ((i * 41) % (h * 0.38)); ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, x, y, 18, '#ffb040', 0.7); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffd080'; ctx.fillRect(x - 4, y, 8, 3); }
        ctx.fillStyle = '#020108'; ctx.beginPath(); ctx.ellipse(w * 0.25, h * 0.6, w * 0.3, h * 0.05, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#020108'; ctx.fillRect(w * 0.24, h * 0.45, 10, h * 0.15); ctx.beginPath(); ctx.arc(w * 0.245, h * 0.43, 10, 0, TAU); ctx.fill();
        break;
      }
      case 'open': {
        sky(ctx, w, h, [[0, '#2a1040'], [1, '#ff9a5a']]);
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, cx, cy, s * 0.5, '#fff0b0', 0.6 + Math.sin(t) * 0.1); ctx.globalCompositeOperation = 'source-over';
        const k = Math.min(1, t * 0.25);
        for (let i = 0; i < 12; i++) {
          ctx.save(); ctx.translate(cx, cy + s * 0.15); ctx.rotate(((i - 5.5) / 6) * (0.4 + k * 1.1));
          ctx.fillStyle = M.rgba(i % 2 ? '#ff8ab8' : '#ffc0dc', 0.9);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.07, -s * 0.15, 0, -s * 0.3); ctx.quadraticCurveTo(-s * 0.07, -s * 0.15, 0, 0); ctx.fill();
          ctx.restore();
        }
        break;
      }
      case 'chamber': case 'stillborn': case 'baby': {
        const night = key !== 'baby';
        sky(ctx, w, h, night ? [[0, '#0a0a20'], [1, '#1a1030']] : [[0, '#3a1a20'], [1, '#a05a30']]);
        // window
        ctx.fillStyle = night ? '#1a2a5a' : '#ffb060';
        ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.55); ctx.lineTo(w * 0.62, h * 0.2); ctx.quadraticCurveTo(w * 0.72, h * 0.05, w * 0.82, h * 0.2); ctx.lineTo(w * 0.82, h * 0.55); ctx.fill();
        if (night) { ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, w * 0.72, h * 0.22, s * 0.12, '#cfe0ff', 0.9); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w * 0.72, h * 0.22, s * 0.04, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
        // moonbeam
        ctx.globalCompositeOperation = 'lighter';
        const bg = ctx.createLinearGradient(w * 0.7, h * 0.3, w * 0.4, h * 0.8);
        bg.addColorStop(0, M.rgba(night ? '#cfe0ff' : '#ffe0a0', 0.25)); bg.addColorStop(1, M.rgba(night ? '#cfe0ff' : '#ffe0a0', 0));
        ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.3); ctx.lineTo(w * 0.82, h * 0.3); ctx.lineTo(w * 0.55, h * 0.9); ctx.lineTo(w * 0.2, h * 0.9); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        // bed and sleeping figure
        ctx.fillStyle = '#2a1420'; ctx.fillRect(w * 0.12, h * 0.68, w * 0.45, h * 0.08);
        ctx.fillStyle = night ? '#5a3a6a' : '#c06a5a'; ctx.beginPath(); ctx.ellipse(w * 0.33, h * 0.67, w * 0.18, h * 0.05, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#1a0a10'; ctx.beginPath(); ctx.arc(w * 0.17, h * 0.64, s * 0.03, 0, TAU); ctx.fill();
        if (key === 'baby' || key === 'stillborn') {
          ctx.globalCompositeOperation = 'lighter';
          A.glow(ctx, w * 0.42, h * 0.6, s * (key === 'baby' ? 0.12 : 0.05), key === 'baby' ? '#ffe0a0' : '#6a7aa0', key === 'baby' ? 0.9 : 0.4);
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = key === 'baby' ? '#fff0d8' : '#8a90b0'; ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.6, s * 0.03, s * 0.02, 0, 0, TAU); ctx.fill();
        } else {
          // a shimmer of moonlight kneeling by the bed
          ctx.globalCompositeOperation = 'lighter';
          A.glow(ctx, w * 0.5, h * 0.58, s * 0.1, '#cfe0ff', 0.4 + Math.sin(t * 2) * 0.1);
          ctx.globalCompositeOperation = 'source-over';
        }
        break;
      }
      case 'dawn': {
        sky(ctx, w, h, [[0, '#2a1a4a'], [0.55, '#ff8a5a'], [0.7, '#ffd08a'], [1, '#3a2a4a']]);
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, cx, h * 0.62, s * 0.4, '#fff0b0', 0.9); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(40,20,60,0.85)'; ctx.fillRect(0, h * 0.65, w, h * 0.35);
        for (let i = 0; i < 10; i++) { ctx.fillStyle = M.rgba('#ffd08a', 0.3); ctx.fillRect(cx - 120 + Math.sin(t + i) * 30 - i * 6, h * 0.68 + i * 14, 240 - i * 10, 2); }
        break;
      }
      case 'brahmastra': {
        sky(ctx, w, h, [[0, '#05020a'], [1, '#2a0a1a']]);
        for (let i = 0; i < 80; i++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect((i * 173) % w, (i * 97) % (h * 0.6), 1.5, 1.5); }
        const k = (t * 0.3) % 1;
        const x = M.lerp(w * 0.1, w * 0.7, k), y = M.lerp(h * 0.1, h * 0.7, k);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = M.rgba('#ffb040', 0.7); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.1); ctx.lineTo(x, y); ctx.stroke();
        A.glow(ctx, x, y, s * 0.15, '#fff0b0', 1);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#05020a'; ctx.fillRect(0, h * 0.78, w, h);
        ctx.fillRect(w * 0.6, h * 0.6, w * 0.2, h * 0.2); ctx.beginPath(); ctx.moveTo(w * 0.58, h * 0.6); ctx.lineTo(w * 0.7, h * 0.5); ctx.lineTo(w * 0.82, h * 0.6); ctx.fill();
        break;
      }
      case 'krishna': {
        sky(ctx, w, h, [[0, '#0a1a3a'], [1, '#1a3a6a']]);
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, cx, cy, s * 0.45, '#3a7aff', 0.6); A.glow(ctx, cx, cy, s * 0.15, '#cfe8ff', 0.6); ctx.globalCompositeOperation = 'source-over';
        // peacock feather
        ctx.save(); ctx.translate(cx, cy + s * 0.25); ctx.rotate(-0.15 + Math.sin(t * 0.6) * 0.03);
        ctx.strokeStyle = '#c8e0a0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -s * 0.25, 0, -s * 0.45); ctx.stroke();
        for (let i = 0; i < 30; i++) { const yy = -s * 0.1 - i * s * 0.011; ctx.strokeStyle = M.rgba('#3ab88a', 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(-s * 0.07, yy - s * 0.03); ctx.moveTo(0, yy); ctx.lineTo(s * 0.07, yy - s * 0.03); ctx.stroke(); }
        const ey = -s * 0.42;
        ctx.fillStyle = '#1a8a5a'; ctx.beginPath(); ctx.ellipse(0, ey, s * 0.06, s * 0.08, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffd96a'; ctx.beginPath(); ctx.ellipse(0, ey + 4, s * 0.04, s * 0.055, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#1a3aa0'; ctx.beginPath(); ctx.ellipse(0, ey + 6, s * 0.025, s * 0.035, 0, 0, TAU); ctx.fill();
        ctx.restore();
        break;
      }
      case 'moon': {
        sky(ctx, w, h, [[0, '#02040f'], [1, '#0a1430']]);
        for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) * 0.12})`; ctx.fillRect((i * 173) % w, (i * 97) % h, 1.5, 1.5); }
        ctx.globalCompositeOperation = 'lighter'; A.glow(ctx, cx, h * 0.3, s * 0.4, '#cfe0ff', 0.7); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#f0f4ff'; ctx.beginPath(); ctx.arc(cx, h * 0.3, s * 0.13, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(180,190,220,0.4)'; ctx.beginPath(); ctx.arc(cx - s * 0.04, h * 0.28, s * 0.03, 0, TAU); ctx.arc(cx + s * 0.05, h * 0.33, s * 0.02, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = M.rgba('#cfe0ff', 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, h * 0.43);
        for (let y = h * 0.43; y < h * 0.95; y += 10) ctx.lineTo(cx + Math.sin(y * 0.03 + t * 2) * 20, y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'title': {
        A.titleBackground(ctx, w, h, t);
        break;
      }
      default: sky(ctx, w, h, [[0, '#0a0410'], [1, '#2a0a1a']]);
    }
    ctx.restore();
  };
})();
