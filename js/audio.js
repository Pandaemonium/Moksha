'use strict';
// ───────────────────────────────────────────────────────────────
//  MOKSHA — procedural audio: raga-based music + synthesized SFX
// ───────────────────────────────────────────────────────────────
(() => {
  const A = {};
  M.audio = A;
  let ctx = null, master, musicBus, sfxBus, reverb, reverbSend, noiseBuf, comp;
  const pluckCache = new Map();
  A.ready = false;
  A.vol = { master: 0.8, music: 0.6, sfx: 0.8 };

  A.init = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain();
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(3.2, 2.6);
    reverbSend = ctx.createGain(); reverbSend.gain.value = 0.5;
    reverbSend.connect(reverb); reverb.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    A.ready = true;
    A.applyVolumes();
    startScheduler();
  };

  A.applyVolumes = () => {
    if (!ctx) return;
    master.gain.value = A.vol.master;
    musicBus.gain.value = A.vol.music * 0.55;
    sfxBus.gain.value = A.vol.sfx;
  };

  function makeImpulse(sec, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * sec);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  const now = () => ctx.currentTime;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ── primitive voices ──────────────────────────────────────────
  function env(g, t, a, peak, d, sus = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d);
  }
  function osc(type, freq, t, dur, peak, dest, opts = {}) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(Math.max(opts.to, 1), t + (opts.glide || dur));
    if (opts.detune) o.detune.value = opts.detune;
    env(g, t, opts.a || 0.005, peak, dur);
    o.connect(g);
    let out = g;
    if (opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = opts.filter; f.frequency.value = opts.ff || 1000; f.Q.value = opts.q || 1;
      g.connect(f); out = f;
    }
    out.connect(dest);
    if (opts.verb) { const s = ctx.createGain(); s.gain.value = opts.verb; out.connect(s); s.connect(reverbSend); }
    o.start(t); o.stop(t + (opts.a || 0.005) + dur + 0.05);
    return o;
  }
  function noise(t, dur, peak, dest, opts = {}) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.playbackRate.value = opts.rate || 1;
    const f = ctx.createBiquadFilter();
    f.type = opts.filter || 'bandpass';
    f.frequency.setValueAtTime(opts.ff || 1200, t);
    if (opts.fto) f.frequency.exponentialRampToValueAtTime(opts.fto, t + dur);
    f.Q.value = opts.q || 1;
    const g = ctx.createGain();
    env(g, t, opts.a || 0.003, peak, dur);
    s.connect(f); f.connect(g); g.connect(dest);
    if (opts.verb) { const sg = ctx.createGain(); sg.gain.value = opts.verb; g.connect(sg); sg.connect(reverbSend); }
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.1);
  }

  // Karplus-Strong plucked string, pre-rendered & cached per pitch
  function pluckBuffer(freq, bright = 0.5) {
    const key = Math.round(freq * 10) + ':' + bright;
    if (pluckCache.has(key)) return pluckCache.get(key);
    const rate = ctx.sampleRate, len = Math.floor(rate * 2.2);
    const buf = ctx.createBuffer(1, len, rate);
    const d = buf.getChannelData(0);
    const N = Math.max(2, Math.round(rate / freq));
    const ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0, prev = 0;
    const damp = 0.996 - (1 - bright) * 0.004;
    for (let i = 0; i < len; i++) {
      const cur = ring[idx];
      const nxt = ring[(idx + 1) % N];
      // jawari-like buzz: slight nonlinearity
      let v = (cur + nxt) * 0.5 * damp;
      v = v + 0.08 * Math.sin(v * 3.0) * bright;
      ring[idx] = v;
      d[i] = cur * 0.6 + prev * 0.4;
      prev = cur;
      idx = (idx + 1) % N;
    }
    pluckCache.set(key, buf);
    return buf;
  }
  function pluck(freq, t, peak, dest, opts = {}) {
    const s = ctx.createBufferSource();
    // render at base pitch and use playbackRate for meend (glide)
    s.buffer = pluckBuffer(opts.base || freq, opts.bright ?? 0.6);
    const rate0 = (opts.from || freq) / (opts.base || freq);
    const rate1 = freq / (opts.base || freq);
    s.playbackRate.setValueAtTime(rate0, t);
    if (opts.from) s.playbackRate.linearRampToValueAtTime(rate1, t + (opts.glide || 0.12));
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (opts.dur || 1.8));
    const f = ctx.createBiquadFilter();
    f.type = 'peaking'; f.frequency.value = 2400; f.gain.value = 6; f.Q.value = 1.2;
    s.connect(f); f.connect(g); g.connect(dest);
    const sg = ctx.createGain(); sg.gain.value = opts.verb ?? 0.35; g.connect(sg); sg.connect(reverbSend);
    s.start(t); s.stop(t + (opts.dur || 1.8) + 0.05);
  }

  // ── instruments ───────────────────────────────────────────────
  const inst = {
    tanpura(freq, t, vol) {
      for (const [mult, det, v] of [[1, -4, 1], [1, 5, 0.8], [2, 2, 0.35], [3, 0, 0.12]]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = freq * mult; o.detune.value = det;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.Q.value = 6;
        f.frequency.setValueAtTime(freq * 3, t);
        f.frequency.linearRampToValueAtTime(freq * 9, t + 0.8);
        f.frequency.linearRampToValueAtTime(freq * 2.5, t + 3.2);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol * v * 0.11, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
        o.connect(f); f.connect(g); g.connect(musicBus);
        const sg = ctx.createGain(); sg.gain.value = 0.45; g.connect(sg); sg.connect(reverbSend);
        o.start(t); o.stop(t + 3.7);
      }
    },
    sitar(freq, t, vol, from) {
      pluck(freq, t, vol * 0.5, musicBus, { from, glide: 0.14, base: freq, bright: 0.8, dur: 1.6 });
      // sympathetic shimmer
      osc('sine', freq * 4, t + 0.01, 0.6, vol * 0.025, musicBus, { verb: 0.8 });
    },
    santoor(freq, t, vol) {
      pluck(freq, t, vol * 0.32, musicBus, { base: freq, bright: 0.95, dur: 1.2, verb: 0.5 });
      pluck(freq * 2.003, t, vol * 0.12, musicBus, { base: freq * 2.003, bright: 0.95, dur: 0.8, verb: 0.5 });
    },
    bansuri(freq, t, vol, dur = 0.8, from) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(from || freq, t);
      if (from) o.frequency.exponentialRampToValueAtTime(freq, t + 0.15);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2;
      const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * 0.012, t + dur * 0.6);
      lfo.connect(lg); lg.connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq * 3.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol * 0.12, t + 0.09);
      g.gain.setValueAtTime(vol * 0.11, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
      o.connect(f); f.connect(g); g.connect(musicBus);
      const sg = ctx.createGain(); sg.gain.value = 0.9; g.connect(sg); sg.connect(reverbSend);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.3); lfo.stop(t + dur + 0.3);
      noise(t, 0.12, vol * 0.02, musicBus, { ff: freq * 2, q: 2 });
    },
    pad(freq, t, vol, dur) {
      for (const det of [-9, 0, 8]) {
        const o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.value = freq; o.detune.value = det;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq * 2.2; f.Q.value = 0.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol * 0.03, t + dur * 0.4);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(f); f.connect(g); g.connect(musicBus);
        const sg = ctx.createGain(); sg.gain.value = 0.7; g.connect(sg); sg.connect(reverbSend);
        o.start(t); o.stop(t + dur + 0.1);
      }
    },
    // tabla bols
    na(t, v) { osc('sine', 680, t, 0.18, v * 0.32, musicBus, { to: 660, verb: 0.15 }); osc('triangle', 1360, t, 0.05, v * 0.1, musicBus); noise(t, 0.02, v * 0.18, musicBus, { ff: 3500, q: 1.5 }); },
    tin(t, v) { osc('sine', 920, t, 0.32, v * 0.22, musicBus, { verb: 0.3 }); osc('sine', 1840, t, 0.1, v * 0.05, musicBus); },
    te(t, v) { noise(t, 0.035, v * 0.25, musicBus, { ff: 2600, q: 0.8 }); osc('sine', 520, t, 0.04, v * 0.1, musicBus); },
    ka(t, v) { noise(t, 0.05, v * 0.35, musicBus, { filter: 'lowpass', ff: 700, q: 0.7 }); },
    ge(t, v) { osc('sine', 82, t, 0.5, v * 0.55, musicBus, { to: 104, glide: 0.18, a: 0.004 }); noise(t, 0.03, v * 0.1, musicBus, { filter: 'lowpass', ff: 300 }); },
    dha(t, v) { inst.na(t, v); inst.ge(t, v); },
    dhin(t, v) { inst.tin(t, v * 0.9); inst.ge(t, v); },
    dhol(t, v) { osc('sine', 62, t, 0.4, v * 0.7, musicBus, { to: 44, glide: 0.3 }); noise(t, 0.08, v * 0.3, musicBus, { filter: 'lowpass', ff: 400 }); },
    dholHi(t, v) { osc('sine', 240, t, 0.12, v * 0.3, musicBus, { to: 200 }); noise(t, 0.04, v * 0.25, musicBus, { ff: 2000 }); },
    manjira(t, v) { for (const f of [3520, 4980, 6110]) osc('sine', f, t, 0.5, v * 0.025, musicBus, { verb: 0.6 }); },
  };

  // ── tracks ────────────────────────────────────────────────────
  // scale = semitone offsets within the octave (a raga's ascending notes)
  const TRACKS = {
    title:   { bpm: 64, tonic: 49, scale: [0, 2, 4, 6, 7, 9, 11], lead: 'bansuri', perc: null, drone: true, density: 0.35, pad: true },
    hub:     { bpm: 72, tonic: 49, scale: [0, 2, 4, 6, 7, 9, 11], lead: 'sitar', perc: 'theka8soft', drone: true, density: 0.42 },
    r0:      { bpm: 108, tonic: 49, scale: [0, 1, 4, 5, 7, 8, 11], lead: 'sitar', perc: 'keherwa', drone: true, density: 0.55, alt: 'santoor' },
    r1:      { bpm: 116, tonic: 47, scale: [0, 2, 3, 5, 7, 9, 10], lead: 'sitar', perc: 'keherwa', drone: true, density: 0.58, alt: 'bansuri' },
    r2:      { bpm: 100, tonic: 46, scale: [0, 1, 3, 6, 7, 8, 11], lead: 'santoor', perc: 'teental', drone: true, density: 0.5, alt: 'sitar' },
    r3:      { bpm: 122, tonic: 49, scale: [0, 1, 4, 6, 9, 11], lead: 'sitar', perc: 'keherwa', drone: true, density: 0.6, alt: 'bansuri', pad: true },
    boss:    { bpm: 138, tonic: 47, scale: [0, 1, 3, 5, 7, 8, 10], lead: 'sitar', perc: 'boss', drone: true, density: 0.7, pad: true },
    rest:    { bpm: 60, tonic: 49, scale: [0, 2, 5, 7, 11], lead: 'bansuri', perc: null, drone: true, density: 0.3, pad: true },
    shop:    { bpm: 92, tonic: 51, scale: [0, 2, 4, 7, 9], lead: 'santoor', perc: 'theka8soft', drone: true, density: 0.5 },
    ending:  { bpm: 58, tonic: 49, scale: [0, 2, 4, 6, 7, 9, 11], lead: 'bansuri', perc: null, drone: true, density: 0.38, pad: true },
  };
  // percussion patterns in 16th steps (bar = 16 steps, keherwa uses 8 beats * 2)
  const PERC = {
    keherwa: ['dha', 0, 'te', 'ge', 'na', 0, 'ti', 'na', 'ka', 0, 'na', 0, 'dhin', 0, 'na', 'te'],
    theka8soft: ['dha', 0, 0, 0, 'na', 0, 'tin', 0, 'na', 0, 0, 0, 'dhin', 0, 'na', 0],
    teental: ['dha', 0, 'dhin', 0, 'dhin', 0, 'dha', 0, 'dha', 0, 'tin', 0, 'tin', 0, 'na', 0],
    boss: ['dhol', 'te', 'na', 'dhol', 'dha', 'te', 'dholHi', 'na', 'dhol', 'te', 'dhol', 'na', 'dha', 'dholHi', 'dhol', 'te'],
  };

  let cur = null, curName = null, step = 0, nextT = 0, melodyDeg = 7, droneT = 0, phraseLeft = 0, restLeft = 0, lastFreq = null, intensity = 0.6, motif = [], motifIdx = 0, padT = 0;
  A.setIntensity = (v) => { intensity = M.clamp(v, 0, 1); };
  A.music = (name) => {
    if (!ctx) { A._pending = name; return; }
    if (curName === name) return;
    // fade
    const t = now();
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(0.0001, t + 0.6);
    musicBus.gain.linearRampToValueAtTime(A.vol.music * 0.55, t + 1.4);
    curName = name;
    setTimeout(() => {
      cur = name ? TRACKS[name] : null;
      step = 0; nextT = now() + 0.1; droneT = nextT; padT = nextT; phraseLeft = 0; restLeft = 2; motif = [];
    }, 650);
  };

  function degToFreq(tr, deg) {
    const n = tr.scale.length;
    const oct = Math.floor(deg / n), idx = ((deg % n) + n) % n;
    return mtof(tr.tonic + 12 + oct * 12 + tr.scale[idx]);
  }

  function scheduleStep(t, stepDur) {
    const tr = cur;
    const s16 = step % 16;
    // drone: Pa Sa' Sa' Sa cycle ~ every 1.3s independent of tempo
    if (tr.drone && t >= droneT) {
      const cyc = Math.floor(droneT * 10) % 4;
      const hasPa = tr.scale.includes(7);
      const notes = [hasPa ? tr.tonic - 5 : tr.tonic - 1, tr.tonic, tr.tonic, tr.tonic - 12];
      inst.tanpura(mtof(notes[cyc % 4]), droneT, 0.9);
      droneT += 1.35;
    }
    if (tr.pad && t >= padT) {
      const base = degToFreq(tr, M.pick([0, 0, 4, 2])) / 2;
      inst.pad(base, padT, 0.9, 6.5);
      padT += 6;
    }
    // percussion
    if (tr.perc && intensity > 0.15) {
      const pat = PERC[tr.perc];
      const b = pat[s16];
      const v = 0.5 + intensity * 0.5;
      if (b) {
        const fn = inst[b] || inst[{ ti: 'tin' }[b]] || inst.na;
        fn(t, (s16 % 4 === 0 ? 1 : 0.7) * v);
      } else if (intensity > 0.7 && Math.random() < 0.25) inst.te(t, 0.5);
      if (tr.perc === 'boss' && s16 % 8 === 4) inst.manjira(t, 1);
    }
    // melody: phrase-based random walk with motifs
    const dens = tr.density * (0.6 + intensity * 0.6);
    const onBeat = s16 % 2 === 0;
    if (restLeft > 0) { restLeft--; }
    else if ((onBeat || Math.random() < 0.3 * intensity) && Math.random() < dens) {
      if (phraseLeft <= 0) {
        phraseLeft = M.randi(4, 9);
        // occasionally repeat a motif for coherence
        if (motif.length > 3 && Math.random() < 0.45) motifIdx = 0; else { motif = []; motifIdx = -1; }
      }
      let deg;
      if (motifIdx >= 0 && motifIdx < motif.length) { deg = motif[motifIdx++]; }
      else {
        const stepSize = M.weighted([-2, -1, 1, 2, 0, 3, -3], (x) => ({ '-2': 2, '-1': 5, '1': 5, '2': 2, '0': 1, '3': 0.6, '-3': 0.6 })[x]);
        melodyDeg = M.clamp(melodyDeg + stepSize, 0, tr.scale.length * 2 + 2);
        // gravitate to Sa / Pa
        if (Math.random() < 0.12) melodyDeg = Math.round(melodyDeg / tr.scale.length) * tr.scale.length;
        deg = melodyDeg;
        if (motifIdx === -1) motif.push(deg);
      }
      const f = degToFreq(tr, deg);
      const useAlt = tr.alt && Math.floor(step / 64) % 2 === 1;
      const lead = useAlt ? tr.alt : tr.lead;
      const glideFrom = lastFreq && Math.random() < 0.3 ? lastFreq : null;
      if (lead === 'sitar') inst.sitar(f, t, 0.9, glideFrom);
      else if (lead === 'santoor') inst.santoor(f, t, 0.9);
      else inst.bansuri(f, t, 0.9, stepDur * M.randi(2, 5), glideFrom);
      lastFreq = f;
      phraseLeft--;
      if (phraseLeft <= 0) restLeft = M.randi(2, 6);
    }
  }

  function startScheduler() {
    setInterval(() => {
      if (!ctx || !cur) return;
      const stepDur = 60 / cur.bpm / 4;
      while (nextT < now() + 0.2) {
        if (nextT < now() - 0.5) nextT = now() + 0.05;
        scheduleStep(nextT, stepDur);
        nextT += stepDur;
        step++;
      }
    }, 30);
    if (A._pending) { const p = A._pending; A._pending = null; A.music(p); }
  }

  // ── SFX ───────────────────────────────────────────────────────
  let lastSfx = {};
  A.sfx = (name, opts = {}) => {
    if (!ctx || ctx.state !== 'running') return;
    const t = now();
    // rate limit identical sounds
    if (lastSfx[name] && t - lastSfx[name] < (opts.minGap ?? 0.03)) return;
    lastSfx[name] = t;
    const v = opts.vol ?? 1;
    const p = opts.pitch ?? 1;
    const B = sfxBus;
    switch (name) {
      case 'swing': noise(t, 0.12, 0.25 * v, B, { ff: 900 * p, fto: 3200 * p, q: 1.2 }); break;
      case 'swingHeavy': noise(t, 0.25, 0.35 * v, B, { ff: 300 * p, fto: 1400, q: 1 }); osc('sine', 120, t, 0.2, 0.15 * v, B, { to: 60 }); break;
      case 'hit':
        osc('sine', 180 * p, t, 0.12, 0.5 * v, B, { to: 70 });
        noise(t, 0.06, 0.4 * v, B, { ff: 2400 * p, q: 0.8 });
        osc('square', 900 * p, t, 0.03, 0.06 * v, B);
        break;
      case 'hitHeavy':
        osc('sine', 120 * p, t, 0.25, 0.7 * v, B, { to: 40 });
        noise(t, 0.12, 0.5 * v, B, { filter: 'lowpass', ff: 1800 });
        break;
      case 'crit':
        osc('sine', 1200, t, 0.3, 0.2 * v, B, { verb: 0.5 }); osc('sine', 1800, t, 0.35, 0.12 * v, B, { verb: 0.5 });
        osc('sine', 160, t, 0.2, 0.6 * v, B, { to: 50 });
        break;
      case 'hurt': osc('sawtooth', 220, t, 0.25, 0.25 * v, B, { to: 90, filter: 'lowpass', ff: 1200 }); noise(t, 0.15, 0.4 * v, B, { ff: 600 }); break;
      case 'dash': noise(t, 0.22, 0.3 * v, B, { ff: 400, fto: 2400, q: 2 }); break;
      case 'arrow': noise(t, 0.15, 0.25 * v, B, { ff: 2500, fto: 900, q: 3 }); osc('triangle', 600, t, 0.08, 0.08 * v, B, { to: 300 }); break;
      case 'bowstring': pluck(110, t, 0.5 * v, B, { base: 110, bright: 0.3, dur: 0.4, verb: 0.1 }); break;
      case 'astra': osc('sine', 500, t, 0.4, 0.25 * v, B, { to: 1400, glide: 0.2, verb: 0.4 }); noise(t, 0.3, 0.2 * v, B, { ff: 1500, fto: 5000, q: 4 }); break;
      case 'explode': osc('sine', 90, t, 0.6, 0.8 * v, B, { to: 30 }); noise(t, 0.6, 0.6 * v, B, { filter: 'lowpass', ff: 2000, fto: 200, verb: 0.3 }); break;
      case 'lightning':
        noise(t, 0.4, 0.5 * v, B, { filter: 'highpass', ff: 1200, verb: 0.4 });
        osc('sawtooth', 70, t, 0.3, 0.3 * v, B, { to: 40, filter: 'lowpass', ff: 600 });
        for (let i = 0; i < 4; i++) noise(t + i * 0.035, 0.03, 0.4 * v, B, { ff: 4000, q: 1 });
        break;
      case 'fire': noise(t, 0.35, 0.35 * v, B, { filter: 'lowpass', ff: 800, fto: 2400 }); osc('sine', 140, t, 0.2, 0.15 * v, B, { to: 80 }); break;
      case 'wind': noise(t, 0.5, 0.3 * v, B, { ff: 500, fto: 1800, q: 6, a: 0.1 }); break;
      case 'water': for (let i = 0; i < 3; i++) osc('sine', M.rand(500, 900), t + i * 0.05, 0.12, 0.15 * v, B, { to: M.rand(1200, 2000), glide: 0.08 }); noise(t, 0.3, 0.15 * v, B, { filter: 'lowpass', ff: 900 }); break;
      case 'sun': osc('sine', 880, t, 0.6, 0.12 * v, B, { verb: 0.8 }); osc('sine', 1320, t + 0.05, 0.6, 0.1 * v, B, { verb: 0.8 }); osc('sine', 1760, t + 0.1, 0.5, 0.08 * v, B, { verb: 0.8 }); break;
      case 'roar': osc('sawtooth', 90, t, 0.7, 0.35 * v, B, { to: 60, filter: 'lowpass', ff: 700, a: 0.05 }); noise(t, 0.7, 0.3 * v, B, { ff: 400, q: 0.8, a: 0.05 }); break;
      case 'pickup': [1, 1.5, 2].forEach((m, i) => osc('sine', 880 * m * p, t + i * 0.06, 0.3, 0.15 * v, B, { verb: 0.5 })); break;
      case 'coin': [2600, 3300].forEach((f, i) => osc('square', f, t + i * 0.05, 0.08, 0.05 * v, B, { filter: 'lowpass', ff: 5000 })); break;
      case 'boon':
        [0, 4, 7, 11, 14].forEach((s, i) => osc('sine', mtof(73 + s), t + i * 0.07, 1.2, 0.09 * v, B, { verb: 1 }));
        noise(t, 1, 0.08 * v, B, { filter: 'highpass', ff: 5000, verb: 1, a: 0.3 });
        break;
      case 'gong':
        for (const [f, a] of [[110, 0.5], [164, 0.3], [227, 0.2], [341, 0.12], [522, 0.08]]) osc('sine', f * p, t, 3.5, a * v * 0.6, B, { verb: 0.8, a: 0.01 });
        noise(t, 0.08, 0.3 * v, B, { filter: 'lowpass', ff: 500 });
        break;
      case 'bell':
        for (const [f, a] of [[1, 0.5], [2.76, 0.25], [5.4, 0.12], [8.9, 0.06]]) osc('sine', 660 * p * f, t, 1.6, a * v * 0.3, B, { verb: 0.8 });
        break;
      case 'uiMove': osc('sine', 1200, t, 0.05, 0.06 * v, B); break;
      case 'uiSelect': osc('sine', 880, t, 0.12, 0.12 * v, B, { verb: 0.3 }); osc('sine', 1320, t + 0.05, 0.15, 0.1 * v, B, { verb: 0.3 }); break;
      case 'uiBack': osc('sine', 700, t, 0.1, 0.1 * v, B, { to: 450 }); break;
      case 'death':
        osc('sawtooth', 160, t, 2.0, 0.3 * v, B, { to: 40, glide: 2, filter: 'lowpass', ff: 800, verb: 0.8 });
        A.sfx('gong', { pitch: 0.6, vol: 0.8 });
        break;
      case 'enemyDie': noise(t, 0.4, 0.3 * v, B, { ff: 600 * p, fto: 200, q: 2, verb: 0.3 }); osc('sine', 300 * p, t, 0.3, 0.15 * v, B, { to: 100 }); break;
      case 'spawn': osc('sine', 200, t, 0.5, 0.12 * v, B, { to: 600, a: 0.2, verb: 0.6 }); break;
      case 'shield': osc('triangle', 1500, t, 0.2, 0.15 * v, B, { to: 900, verb: 0.4 }); noise(t, 0.05, 0.2 * v, B, { ff: 5000 }); break;
      case 'heal': [0, 4, 7, 12].forEach((s, i) => osc('sine', mtof(77 + s), t + i * 0.08, 0.6, 0.1 * v, B, { verb: 0.8 })); break;
      case 'bossIntro': A.sfx('gong', { pitch: 0.8 }); inst.dhol(t, 1.2); inst.dhol(t + 0.3, 1.2); inst.dhol(t + 0.45, 1.4); break;
      case 'levelup': [0, 7, 12, 16, 19].forEach((s, i) => osc('triangle', mtof(72 + s), t + i * 0.05, 0.4, 0.08 * v, B, { verb: 0.6 })); break;
      case 'door': A.sfx('bell', { pitch: 0.8, vol: 0.7 }); noise(t, 0.6, 0.2 * v, B, { filter: 'lowpass', ff: 300, a: 0.2 }); break;
      case 'shoot': osc('sine', 700 * p, t, 0.15, 0.12 * v, B, { to: 300 }); noise(t, 0.08, 0.1 * v, B, { ff: 1500 }); break;
      case 'warn': osc('sine', 520, t, 0.15, 0.1 * v, B); osc('sine', 520, t + 0.18, 0.15, 0.1 * v, B); break;
      case 'block': osc('square', 400, t, 0.06, 0.12 * v, B, { filter: 'lowpass', ff: 2000 }); noise(t, 0.05, 0.3 * v, B, { ff: 3000, q: 3 }); break;
      case 'talk': osc('sine', M.rand(500, 700) * p, t, 0.03, 0.03 * v, B); break;
      case 'chime': pluck(mtof(85 + M.pick([0, 2, 4, 7, 9])), t, 0.3 * v, B, { base: 440, bright: 0.9, dur: 1 }); break;
    }
  };
})();
