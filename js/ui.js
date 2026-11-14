'use strict';
// ───────────────────────────────────────────────────────────────
//  User interface (DOM overlay)
// ───────────────────────────────────────────────────────────────
(() => {
  const U = (M.ui = {});
  const $ = (sel, el = document) => el.querySelector(sel);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const S = () => M.save.data;
  const G = () => M.game;
  const SLOT_NAMES = { attack: 'Attack', special: 'Special', dash: 'Dash', astra: 'Astra', passive: 'Blessing' };
  let stack = [];
  let dlg = null;
  let cut = null;
  let mode = 'title';

  const blocking = () => { G().uiBlocking = stack.length > 0 || !!dlg || !!cut; };

  U.init = () => {
    U.root = $('#ui');
    U.hud = $('#hud');
    U.modal = $('#modals');
    U.fade = $('#fade');
    U.prompt = $('#prompt');
    U.toasts = $('#toasts');
    U.bannerEl = $('#banner');
    U.bossEl = $('#bossbar');
    U.buildHud();
    U.fade.style.opacity = 1;
    document.addEventListener('click', () => M.audio.init(), { once: false });
  };

  // ── fade ──
  let fadeAnim = null;
  U.fadeTo = (a, dur, cb) => {
    const from = parseFloat(U.fade.style.opacity || 0);
    const start = performance.now();
    if (fadeAnim) cancelAnimationFrame(fadeAnim);
    const step = (now) => {
      const k = Math.min(1, (now - start) / (dur * 1000));
      U.fade.style.opacity = M.lerp(from, a, M.ease.inOutSine(k));
      U.fade.style.pointerEvents = a > 0.5 ? 'all' : 'none';
      if (k < 1) fadeAnim = requestAnimationFrame(step); else { fadeAnim = null; cb && cb(); }
    };
    fadeAnim = requestAnimationFrame(step);
  };

  U.setMode = (m) => {
    mode = m;
    U.hud.classList.toggle('hidden', m === 'title');
    U.hud.classList.toggle('hub', m === 'hub');
    $('#title')?.classList.toggle('hidden', m !== 'title');
  };

  // ── title ──
  U.title = () => {
    U.setMode('title');
    const t = $('#title');
    const has = M.save.has();
    t.innerHTML = `
      <div class="title-wrap">
        <div class="title-deva">मोक्ष</div>
        <h1 class="title-main">MOKSHA</h1>
        <div class="title-sub">Escape the Wheel</div>
        <div class="title-menu">
          ${has ? '<button class="btn nav" data-a="continue">Continue</button>' : ''}
          <button class="btn nav" data-a="new">${has ? 'New Journey' : 'Begin'}</button>
          <button class="btn nav" data-a="settings">Settings</button>
          <button class="btn nav" data-a="credits">Credits</button>
        </div>
        <div class="title-foot">A tale of the thirteenth day &middot; Best with headphones</div>
      </div>`;
    t.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      M.audio.init(); M.audio.sfx('uiSelect');
      const a = b.dataset.a;
      if (a === 'continue') { U.setMode('hub'); G().continueGame(); }
      if (a === 'new') {
        const go = () => { t.classList.add('hidden'); G().newGame(); };
        if (has) U.confirm('Begin a new journey? Your current progress will be erased.', go); else go();
      }
      if (a === 'settings') U.settings();
      if (a === 'credits') U.credits(() => {}, true);
    }));
    U.fadeTo(0, 1.2);
    const startMusic = () => { M.audio.init(); M.audio.music('title'); window.removeEventListener('pointerdown', startMusic); window.removeEventListener('keydown', startMusic); };
    window.addEventListener('pointerdown', startMusic); window.addEventListener('keydown', startMusic);
    U.navTarget = t;
  };

  // ── HUD ──
  U.buildHud = () => {
    U.hud.innerHTML = `
      <div class="hud-tl">
        <div class="hp-frame"><div class="hp-bar"><div class="hp-fill"></div><div class="hp-ghost"></div></div><div class="hp-text"></div></div>
        <div class="pips"><div class="dash-pips"></div><div class="astra-pips"></div><div class="def-pips"></div></div>
      </div>
      <div class="hud-tr">
        <div class="cur kauri"><img src="${M.art.iconURL('kauri', 40)}"><span></span></div>
        <div class="cur punya"><img src="${M.art.iconURL('punya', 40)}"><span></span></div>
        <div class="cur garland"><img src="${M.art.iconURL('garland', 40)}"><span></span></div>
      </div>
      <div class="hud-loc"></div>
      <div class="hud-bl"><div class="weapon-ic"></div><div class="boon-list"></div></div>
      <div class="hud-br"><span class="key">Esc</span> Menu &nbsp; <span class="key">Tab</span> Boons</div>`;
    U.hp = { fill: $('.hp-fill', U.hud), ghost: $('.hp-ghost', U.hud), text: $('.hp-text', U.hud) };
    U.ghostHp = 1;
  };
  let hudSig = '';
  U.updateHud = (dt) => {
    const g = G(), pl = g.player, s = S();
    if (!pl || mode === 'title') return;
    const f = Math.max(0, pl.hp / pl.maxHp);
    U.hp.fill.style.width = f * 100 + '%';
    U.ghostHp = Math.max(f, U.ghostHp - dt * 0.4);
    U.hp.ghost.style.width = U.ghostHp * 100 + '%';
    U.hp.text.textContent = `${Math.ceil(pl.hp)} / ${pl.maxHp}`;
    const run = g.run;
    const sig = [pl.dashCharges, pl.dashMax, pl.astraCharges, pl.astraMax, run ? run.defiance : -1, run ? run.kauri : -1, s.punya, s.garlands, pl.boons.map((b) => b.id + b.level + b.rarity).join(','), pl.weaponId, pl.upgrades.length, mode, run ? run.region + ':' + run.roomNo : ''].join('|');
    if (sig === hudSig) return;
    hudSig = sig;
    $('.dash-pips', U.hud).innerHTML = Array.from({ length: pl.dashMax }, (_, i) => `<i class="pip dash ${i < pl.dashCharges ? 'on' : ''}"></i>`).join('');
    $('.astra-pips', U.hud).innerHTML = mode === 'run' ? Array.from({ length: pl.astraMax }, (_, i) => `<i class="pip astra ${i < pl.astraCharges ? 'on' : ''}"></i>`).join('') : '';
    $('.def-pips', U.hud).innerHTML = run ? Array.from({ length: run.defiance }, () => `<img class="def" src="${M.art.iconURL('lamp', 32)}">`).join('') : '';
    $('.kauri', U.hud).style.display = run ? '' : 'none';
    $('.kauri span', U.hud).textContent = run ? run.kauri : 0;
    $('.punya span', U.hud).textContent = s.punya;
    $('.garland span', U.hud).textContent = s.garlands;
    $('.hud-loc', U.hud).textContent = run ? `${M.REGIONS[run.region].name} · Chamber ${run.depth}` : 'The Court of Yama';
    const kinds = { khadga: 'sword', chakra: 'chakra', dhanush: 'bow', gada: 'mace' };
    $('.weapon-ic', U.hud).innerHTML = `<span>${M.WEAPONS[pl.weaponId].name}</span>${pl.upgrades.length ? `<em>+${pl.upgrades.length}</em>` : ''}`;
    $('.boon-list', U.hud).innerHTML = pl.boons.map((b) => {
      const d = M.BOON_BY_ID[b.id];
      return `<div class="boon-ic" style="--c:${M.RARITY[b.rarity].color}" title="${d.name}"><img src="${M.art.iconURL(d.god, 44, true)}">${b.level > 1 ? `<b>${b.level}</b>` : ''}</div>`;
    }).join('');
  };

  U.bossBar = (boss) => {
    U.boss = boss;
    if (!boss) { U.bossEl.classList.add('hidden'); return; }
    U.bossEl.classList.remove('hidden');
    U.bossEl.innerHTML = `<div class="boss-name">${boss.name}</div><div class="boss-title">${boss.title}</div><div class="boss-track"><div class="boss-fill"></div><div class="boss-armor"></div><i style="left:33%"></i><i style="left:66%"></i></div>`;
    U.bossEl.style.setProperty('--c', boss.glow);
  };

  // ── toasts / banners ──
  U.toast = (text, color = '#ffffff', icon, dur = 2.6) => {
    const t = h('div', 'toast', `${icon ? `<img src="${M.art.iconURL(icon, 36)}">` : ''}<span>${text}</span>`);
    t.style.setProperty('--c', color);
    U.toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), dur * 1000);
    setTimeout(() => t.remove(), dur * 1000 + 600);
  };
  U.banner = (title, sub, color = '#ffd96a', big = false) => {
    const b = U.bannerEl;
    b.className = 'banner' + (big ? ' big' : '');
    b.style.setProperty('--c', color);
    b.innerHTML = `<div class="b-line"></div><div class="b-title">${title}</div>${sub ? `<div class="b-sub">${sub}</div>` : ''}<div class="b-line"></div>`;
    void b.offsetWidth; b.classList.add('show');
    clearTimeout(U._bt); U._bt = setTimeout(() => b.classList.remove('show'), big ? 3000 : 2600);
  };
  U.hint = (html, dur = 9) => {
    let el = document.getElementById('hint');
    if (!el) { el = h('div', ''); el.id = 'hint'; U.root.appendChild(el); }
    el.innerHTML = html; el.classList.add('show');
    clearTimeout(U._ht); U._ht = setTimeout(() => el.classList.remove('show'), dur * 1000);
  };
  U.regionCard = (reg) => setTimeout(() => U.banner(reg.name, reg.sub, reg.accent, true), 700);

  // ── generic modal ──
  U.open = (el, opts = {}) => {
    const wrap = h('div', 'modal-wrap');
    wrap.appendChild(el);
    U.modal.appendChild(wrap);
    stack.push({ wrap, el, opts });
    blocking();
    requestAnimationFrame(() => wrap.classList.add('show'));
    U.navTarget = el; U.navIdx = 0; U.refreshNav();
    M.audio.sfx('uiMove');
    return wrap;
  };
  U.swallow = () => { M.input.pressed.clear(); };
  U.close = () => {
    const top = stack.pop();
    if (!top) return;
    U.swallow();
    top.wrap.classList.remove('show');
    setTimeout(() => top.wrap.remove(), 200);
    if (top.opts.onClose) top.opts.onClose();
    blocking();
    const nt = stack[stack.length - 1];
    U.navTarget = nt ? nt.el : (mode === 'title' ? $('#title') : null); U.navIdx = 0; U.refreshNav();
    M.audio.sfx('uiBack');
  };
  U.closeAll = () => { while (stack.length) U.close(); };

  // keyboard / pad navigation across '.nav' elements
  U.refreshNav = () => {
    if (!U.navTarget) return;
    const items = [...U.navTarget.querySelectorAll('.nav:not([disabled])')];
    items.forEach((b, i) => b.classList.toggle('focus', i === U.navIdx && U.keyNav));
  };
  U.handleNav = () => {
    const I = M.input;
    if (!U.navTarget || dlg || cut) return;
    const items = [...U.navTarget.querySelectorAll('.nav:not([disabled])')];
    if (!items.length) return;
    if (!(U.navIdx >= 0 && U.navIdx < items.length)) U.navIdx = 0;
    let moved = false;
    if (I.pressed.has('down') || I.pressed.has('right')) { U.navIdx = (U.navIdx + 1) % items.length; moved = true; }
    if (I.pressed.has('up') || I.pressed.has('left')) { U.navIdx = (U.navIdx - 1 + items.length) % items.length; moved = true; }
    if (moved) { U.keyNav = true; U.refreshNav(); M.audio.sfx('uiMove'); items[U.navIdx].scrollIntoView({ block: 'nearest' }); }
    if (U.keyNav && (I.pressed.has('confirm') || I.pressed.has('interact'))) { const b = items[U.navIdx]; if (b) b.click(); }
    // number keys for choices
  };
  window.addEventListener('mousemove', () => { if (U.keyNav) { U.keyNav = false; U.refreshNav(); } });

  U.confirm = (text, yes) => {
    const p = h('div', 'panel small', `<p class="confirm-text">${text}</p><div class="row"><button class="btn nav">Yes</button><button class="btn ghost nav">No</button></div>`);
    const [y, n] = p.querySelectorAll('button');
    y.onclick = () => { U.close(); yes(); };
    n.onclick = () => U.close();
    U.open(p, { closable: true });
  };
  U.choice = (text, opts) => {
    const p = h('div', 'panel small', `<p class="confirm-text">${text}</p><div class="col"></div>`);
    const col = $('.col', p);
    opts.forEach((o) => { const b = h('button', 'btn nav', o.label); b.onclick = () => { U.close(); o.act(); }; col.appendChild(b); });
    U.open(p, { closable: true });
  };

  // ── dialogue ──
  U.dialogue = (entry, onDone, opts = {}) => {
    const s = S();
    if (entry.id && !['vision', 'gift', 'pet', 'defeat'].includes(entry.id)) { s.seen[entry.id] = 1; if (entry.set) Object.assign(s.flags, entry.set); M.save.write(); }
    const el = h('div', 'dialogue');
    el.innerHTML = `
      <canvas class="por left" width="360" height="420"></canvas>
      <canvas class="por right" width="360" height="420"></canvas>
      <div class="dbox">
        <div class="dname"><span class="n"></span><span class="t"></span></div>
        <div class="dtext"></div>
        <div class="dmore">▼</div>
      </div>`;
    if (opts.vision) el.classList.add('vision');
    U.root.appendChild(el);
    const speakers = [...new Set(entry.lines.map((l) => l[0]).filter((x) => x !== 'nar'))];
    const other = speakers.find((x) => x !== 'abhi');
    dlg = { el, entry, i: -1, onDone, other, typed: 0, full: '', t: 0, opts, closing: false };
    blocking();
    requestAnimationFrame(() => el.classList.add('show'));
    el.addEventListener('click', () => U.advance());
    U.advance();
  };
  U.advance = () => {
    if (!dlg || dlg.closing) return;
    if (dlg.i >= 0 && dlg.typed < dlg.full.length) { dlg.typed = dlg.full.length; return; }
    dlg.i++;
    if (dlg.i >= dlg.entry.lines.length) {
      const d = dlg; d.closing = true;
      d.el.classList.remove('show');
      setTimeout(() => d.el.remove(), 250);
      dlg = null; blocking();
      U.swallow();
      if (d.onDone) d.onDone();
      return;
    }
    const [who, text] = dlg.entry.lines[dlg.i];
    dlg.who = who; dlg.full = text; dlg.typed = 0;
    const el = dlg.el;
    const nar = who === 'nar';
    el.classList.toggle('nar', nar);
    const ch = M.CHARACTERS[who];
    $('.dname .n', el).textContent = nar ? '' : ch.name;
    $('.dname .t', el).textContent = nar ? '' : ch.title;
    $('.dname', el).style.setProperty('--c', nar ? '#ffffff' : ch.color);
    $('.dbox', el).style.setProperty('--c', nar ? '#c8b8a0' : ch.color);
    el.querySelector('.por.left').classList.toggle('dim', who === 'abhi' || nar);
    el.querySelector('.por.right').classList.toggle('dim', who !== 'abhi');
    el.querySelector('.por.left').classList.toggle('none', !dlg.other || !M.art.PORTRAITS[dlg.other]);
    el.querySelector('.por.right').classList.toggle('none', !dlg.entry.lines.some((l) => l[0] === 'abhi'));
    M.audio.sfx('uiMove', { vol: 0.5 });
  };
  const updateDialogue = (dt) => {
    if (!dlg) return;
    const I = M.input;
    if (I.pressed.has('confirm') || I.pressed.has('interact') || I.pressed.has('dash')) U.advance();
    if (!dlg) return;
    dlg.t += dt;
    if (dlg.typed < dlg.full.length) {
      const before = Math.floor(dlg.typed);
      dlg.typed = Math.min(dlg.full.length, dlg.typed + dt * 62);
      if (Math.floor(dlg.typed) !== before && Math.floor(dlg.typed) % 3 === 0 && dlg.who !== 'nar') M.audio.sfx('talk', { pitch: dlg.who === 'abhi' ? 1.1 : 0.8, minGap: 0.04 });
    }
    const el = dlg.el;
    $('.dtext', el).textContent = dlg.full.slice(0, Math.floor(dlg.typed));
    $('.dmore', el).style.opacity = dlg.typed >= dlg.full.length ? 1 : 0;
    const tl = performance.now() / 1000;
    const L = el.querySelector('.por.left'), R = el.querySelector('.por.right');
    if (dlg.other && M.art.PORTRAITS[dlg.other]) M.art.portrait(L.getContext('2d'), dlg.other, 360, 420, tl, { talking: dlg.who === dlg.other && dlg.typed < dlg.full.length });
    M.art.portrait(R.getContext('2d'), 'abhi', 360, 420, tl, { talking: dlg.who === 'abhi' && dlg.typed < dlg.full.length });
  };

  // ── boon selection ──
  U.boonCard = (b, slotFilled) => {
    const d = M.BOON_BY_ID[b.id];
    const god = M.GODS[d.god];
    const v = M.boonValue(b);
    const r = M.RARITY[b.rarity];
    const icon = d.duo ? `<img class="duo2" src="${M.art.iconURL(d.god2, 64, true)}">` : '';
    return `<div class="bc-icon"><img src="${M.art.iconURL(d.god, 72, true)}">${icon}</div>
      <div class="bc-body">
        <div class="bc-head"><span class="bc-name">${d.name}</span><span class="bc-rar" style="color:${d.duo ? '#ffe08a' : r.color}">${d.duo ? 'Duo' : r.name}</span></div>
        <div class="bc-slot">${SLOT_NAMES[d.slot]}${d.duo ? ` · ${god.name} & ${M.GODS[d.god2].name}` : ''}</div>
        <div class="bc-desc">${d.desc(v)}</div>
        ${slotFilled ? `<div class="bc-rep">Replaces ${M.BOON_BY_ID[slotFilled].name}</div>` : ''}
      </div>`;
  };
  U.boonChoice = (godId, opts, onPick, reroll) => {
    const god = M.GODS[godId];
    const pl = G().player;
    const p = h('div', 'panel boons');
    p.style.setProperty('--c', god.color);
    const render = (list) => {
      p.innerHTML = `<div class="bp-head"><img src="${M.art.iconURL(godId, 84, true)}"><div><div class="bp-god">Boon of ${god.name}</div><div class="bp-title">${god.title}</div></div></div><div class="bp-list"></div>
        <div class="bp-foot">${G().run && G().run.rerolls > 0 ? `<button class="btn ghost nav reroll"><img src="${M.art.iconURL('reroll', 28)}"> Dharmic Appeal (${G().run.rerolls})</button>` : '<span class="hint">Choose one blessing</span>'}</div>`;
      const listEl = $('.bp-list', p);
      list.forEach((b, i) => {
        const d = M.BOON_BY_ID[b.id];
        const filled = d.slot !== 'passive' ? (pl.boons.find((x) => M.BOON_BY_ID[x.id].slot === d.slot) || {}).id : null;
        const c = h('button', 'boon-card nav', U.boonCard(b, filled));
        c.style.setProperty('--r', d.duo ? '#ffe08a' : M.RARITY[b.rarity].color);
        c.style.animationDelay = i * 0.07 + 's';
        c.onclick = () => { U.close(); onPick(b); };
        listEl.appendChild(c);
      });
      const rr = $('.reroll', p);
      if (rr) rr.onclick = () => { G().run.rerolls--; M.audio.sfx('chime'); render(reroll()); U.navIdx = 0; U.refreshNav(); };
    };
    render(opts);
    U.open(p, { closable: false });
  };
  U.amritaChoice = (boons, onPick) => {
    const p = h('div', 'panel boons');
    p.style.setProperty('--c', '#7affe0');
    p.innerHTML = `<div class="bp-head"><img src="${M.art.iconURL('amrita', 84, true)}"><div><div class="bp-god">Amrita</div><div class="bp-title">The nectar of the gods. Choose a blessing to deepen.</div></div></div><div class="bp-list"></div>`;
    const listEl = $('.bp-list', p);
    boons.forEach((b) => {
      const nb = { ...b, level: b.level + 1 };
      const d = M.BOON_BY_ID[b.id];
      const c = h('button', 'boon-card nav', U.boonCard(nb) + `<div class="bc-lvl">Lv ${b.level} → ${b.level + 1}</div>`);
      c.style.setProperty('--r', '#7affe0');
      c.onclick = () => { U.close(); onPick(b); };
      listEl.appendChild(c);
    });
    U.open(p, { closable: false });
  };
  U.chiselChoice = (ids, onPick) => {
    const p = h('div', 'panel boons');
    p.style.setProperty('--c', '#d0d8e8');
    const W = M.WEAPONS[G().player.weaponId];
    p.innerHTML = `<div class="bp-head"><img src="${M.art.iconURL('chisel', 84, true)}"><div><div class="bp-god">Chisel of Vishwakarma</div><div class="bp-title">The divine architect reshapes your ${W.name}.</div></div></div><div class="bp-list"></div>`;
    const listEl = $('.bp-list', p);
    ids.forEach((id) => {
      const u = M.CHISELS[id];
      const c = h('button', 'boon-card nav', `<div class="bc-icon"><img src="${M.art.iconURL('chisel', 72, true)}"></div><div class="bc-body"><div class="bc-head"><span class="bc-name">${u.name}</span><span class="bc-rar" style="color:#d0d8e8">${W.name}</span></div><div class="bc-desc">${u.desc}</div></div>`);
      c.style.setProperty('--r', '#d0d8e8');
      c.onclick = () => { U.close(); onPick(id); };
      listEl.appendChild(c);
    });
    U.open(p, { closable: false });
  };

  // ── ledger of karma ──
  U.ledger = () => {
    const p = h('div', 'panel ledger');
    const render = () => {
      const s = S();
      p.innerHTML = `<div class="ph"><h2>Ledger of Karma</h2><div class="ph-sub">“Write in the margins. Most irregular.” — Chitragupta</div><div class="ph-cur"><img src="${M.art.iconURL('punya', 36)}"> ${s.punya} Punya</div></div><div class="lg-list"></div><button class="btn ghost nav close">Close</button>`;
      const list = $('.lg-list', p);
      for (const L of M.LEDGER) {
        const r = s.ledger[L.id] || 0, max = L.costs.length;
        const cost = L.costs[r];
        const row = h('div', 'lg-row', `
          <img src="${M.art.iconURL(L.icon, 56, true)}">
          <div class="lg-body"><div class="lg-name">${L.name}</div><div class="lg-desc">${r ? L.desc(r) : L.per}</div>
          <div class="lg-pips">${Array.from({ length: max }, (_, i) => `<i class="${i < r ? 'on' : ''}"></i>`).join('')}</div></div>`);
        const b = h('button', 'btn nav' + (r >= max ? ' done' : ''), r >= max ? 'Complete' : `Annotate · ${cost}`);
        if (r >= max || s.punya < cost) b.disabled = true;
        b.onclick = () => {
          s.punya -= cost; s.ledger[L.id] = r + 1; M.save.write();
          M.audio.sfx('levelup');
          const pl = G().player; pl.resetForRun();
          render(); U.refreshNav();
        };
        row.appendChild(b);
        list.appendChild(row);
      }
      $('.close', p).onclick = () => U.close();
    };
    render();
    U.open(p, { closable: true });
  };

  // ── armory ──
  U.armory = () => {
    const p = h('div', 'panel armory');
    const render = () => {
      const s = S();
      p.innerHTML = `<div class="ph"><h2>Divine Arms</h2><div class="ph-sub">Choose what you carry into the Wheel.</div><div class="ph-cur"><img src="${M.art.iconURL('punya', 36)}"> ${s.punya} Punya</div></div><div class="ar-list"></div><button class="btn ghost nav close">Close</button>`;
      const list = $('.ar-list', p);
      for (const id of M.WEAPON_ORDER) {
        const W = M.WEAPONS[id];
        const owned = s.weapons[id];
        const eq = s.weapon === id;
        const card = h('div', 'ar-card' + (eq ? ' eq' : '') + (owned ? '' : ' locked'));
        card.style.setProperty('--c', W.color);
        const cv = h('canvas', 'ar-art'); cv.width = 160; cv.height = 120;
        const c2 = cv.getContext('2d');
        const kinds = { khadga: 'sword', chakra: 'chakra', dhanush: 'bow', gada: 'mace' };
        c2.globalCompositeOperation = 'lighter'; M.art.glow(c2, 80, 60, 70, W.color, 0.5); c2.globalCompositeOperation = 'source-over';
        M.art.weapon(c2, kinds[id], id === 'chakra' ? 40 : id === 'dhanush' ? 70 : 30, 62, id === 'dhanush' ? 0 : -0.5, id === 'chakra' ? 2.2 : 2, 0);
        card.appendChild(cv);
        card.appendChild(h('div', 'ar-body', `<div class="ar-name">${W.name}</div><div class="ar-title">${W.title}</div><div class="ar-lore">${W.lore}</div><div class="ar-moves"><b>Attack</b> ${W.attackDesc}<br><b>Special</b> ${W.specialDesc}</div>`));
        const b = h('button', 'btn nav', eq ? 'Equipped' : owned ? 'Equip' : `Unseal · ${W.cost} Punya`);
        if (eq || (!owned && s.punya < W.cost)) b.disabled = true;
        b.onclick = () => {
          if (!owned) { s.punya -= W.cost; s.weapons[id] = true; M.audio.sfx('levelup'); }
          s.weapon = id; M.save.write();
          const pl = G().player; pl.weaponId = id; pl.resetForRun();
          M.audio.sfx('uiSelect');
          render(); U.refreshNav();
        };
        card.appendChild(b);
        list.appendChild(card);
      }
      $('.close', p).onclick = () => U.close();
    };
    render();
    U.open(p, { closable: true });
  };

  // ── keepsakes ──
  U.keepsakes = () => {
    const p = h('div', 'panel keeps');
    const render = () => {
      const s = S();
      p.innerHTML = `<div class="ph"><h2>Keepsakes</h2><div class="ph-sub">Tokens of affection. Carry one into the Wheel.</div></div><div class="ks-list"></div><button class="btn ghost nav close">Close</button>`;
      const list = $('.ks-list', p);
      for (const [id, K] of Object.entries(M.KEEPSAKES)) {
        const got = s.keepsakes[id];
        const eq = s.keepsake === id;
        const b = h('button', 'ks-card nav' + (eq ? ' eq' : '') + (got ? '' : ' locked'), `<img src="${M.art.iconURL(K.icon, 64, true)}"><div><div class="ks-name">${got ? K.name : '???'}</div><div class="ks-from">${got ? 'From ' + M.CHARACTERS[K.from].name : 'Offer a garland to ' + M.CHARACTERS[K.from].name}</div>${got ? `<div class="ks-desc">${K.desc}</div>` : ''}</div>`);
        if (!got) b.disabled = true;
        b.onclick = () => { s.keepsake = eq ? null : id; M.save.write(); G().player.keepsake = s.keepsake; G().player.resetForRun(); M.audio.sfx('bell'); render(); U.refreshNav(); };
        list.appendChild(b);
      }
      $('.close', p).onclick = () => U.close();
    };
    render();
    U.open(p, { closable: true });
  };

  // ── pause / boons / codex / settings ──
  U.togglePause = (boonsTab) => {
    if (mode === 'title' || cut) return;
    if (stack.length) { const top = stack[stack.length - 1]; if (top.opts.closable) U.close(); return; }
    if (dlg || G().transitioning) return;
    U.pause(boonsTab ? 'boons' : 'boons');
  };
  U.pause = (tab = 'boons') => {
    const p = h('div', 'panel pause');
    const tabs = [['boons', 'Blessings'], ['codex', 'Itihasa'], ['controls', 'Controls'], ['settings', 'Settings']];
    p.innerHTML = `<div class="tabs">${tabs.map(([k, n]) => `<button class="tab nav" data-t="${k}">${n}</button>`).join('')}</div><div class="tab-body"></div>
      <div class="row foot"><button class="btn nav resume">Resume</button>${G().scene === 'run' ? '<button class="btn ghost nav abandon">Abandon Escape</button>' : ''}<button class="btn ghost nav quit">Title Screen</button></div>`;
    const body = $('.tab-body', p);
    const show = (k) => {
      p.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.t === k));
      body.innerHTML = '';
      if (k === 'boons') body.appendChild(U.boonsView());
      if (k === 'codex') body.appendChild(U.codexView());
      if (k === 'controls') body.appendChild(U.controlsView());
      if (k === 'settings') body.appendChild(U.settingsView());
    };
    p.querySelectorAll('.tab').forEach((b) => (b.onclick = () => { M.audio.sfx('uiMove'); show(b.dataset.t); }));
    $('.resume', p).onclick = () => U.close();
    const ab = $('.abandon', p);
    if (ab) ab.onclick = () => U.confirm('Abandon this escape? You will return to the Court of Yama.', () => { U.closeAll(); const pl = G().player; pl.hp = 0; pl.dead = true; pl.state = 'dead'; pl.stateT = 0; G().onPlayerDeath(null); });
    $('.quit', p).onclick = () => U.confirm('Return to the title screen? Progress in the current escape will be lost.', () => { U.closeAll(); location.reload(); });
    show(tab);
    U.open(p, { closable: true });
  };
  U.boonsView = () => {
    const pl = G().player;
    const el = h('div', 'bv');
    const W = M.WEAPONS[pl.weaponId];
    let html = `<div class="bv-weapon"><div class="bv-wn">${W.name} <span>${W.title}</span></div><div class="bv-wd"><b>Attack</b> ${W.attackDesc} &nbsp; <b>Special</b> ${W.specialDesc}</div>${pl.upgrades.map((u) => `<div class="bv-up">⚒ <b>${M.CHISELS[u].name}</b>: ${M.CHISELS[u].desc}</div>`).join('')}</div>`;
    if (!pl.boons.length) html += `<p class="empty">You carry no blessings yet. The gods are watching.</p>`;
    html += pl.boons.map((b) => `<div class="bv-row" style="--r:${M.RARITY[b.rarity].color}">${U.boonCard(b)}${b.level > 1 ? `<div class="bc-lvl">Lv ${b.level}</div>` : ''}</div>`).join('');
    const s = S();
    html += `<div class="bv-stats">Max Health ${pl.maxHp} &middot; Dashes ${pl.dashMax} &middot; Astras ${pl.astraMax}${G().run ? ` &middot; Second Breaths ${G().run.defiance}` : ''}${s.keepsake ? ` &middot; Keepsake: ${M.KEEPSAKES[s.keepsake].name}` : ''}</div>`;
    el.innerHTML = html;
    return el;
  };
  U.codexView = () => {
    const s = S();
    const el = h('div', 'cx');
    const met = (id) => {
      if (['abhi', 'yama', 'chitragupta', 'nachiketa', 'uttara'].includes(id)) return s.flags.intro;
      if (id === 'savitri') return s.seen.s_intro;
      if (id === 'chandra') return s.flags.chandraAppears;
      if (id === 'kubera') return s.flags.kuberaMet;
      if (M.BOSSES[id]) return s.bossMet[id];
      return false;
    };
    const ids = Object.keys(M.CODEX).filter(met);
    const godIds = Object.keys(M.GODS).filter((g) => s.godMet[g]);
    el.innerHTML = `<div class="cx-list"></div><div class="cx-page"><p class="empty">Select a name to read what is known.</p></div>`;
    const list = $('.cx-list', el), page = $('.cx-page', el);
    const showChar = (id) => {
      const ch = M.CHARACTERS[id];
      const aff = s.affinity[id] || 0;
      const entries = M.CODEX[id].filter((e) => e.req <= aff + (M.BOSSES[id] ? (s.bossKills[id] || 0) : 0) || (id === 'abhi' || id === 'uttara'));
      const locked = M.CODEX[id].length - entries.length;
      page.innerHTML = `<canvas width="360" height="420" class="cx-por"></canvas><h3 style="color:${ch.color}">${ch.name}</h3><div class="cx-title">${ch.title}</div>${entries.map((e) => `<p>${e.text}</p>`).join('')}${locked ? `<p class="locked">${locked} more entr${locked > 1 ? 'ies' : 'y'} will be revealed as your bond deepens.</p>` : ''}`;
      if (M.art.PORTRAITS[id]) M.art.portrait($('canvas', page).getContext('2d'), id, 360, 420, 1); else $('canvas', page).remove();
    };
    const showGod = (gid) => {
      const g = M.GODS[gid];
      page.innerHTML = `<canvas width="360" height="420" class="cx-por"></canvas><h3 style="color:${g.color}">${g.name}</h3><div class="cx-title">${g.title}</div><p>${g.blurb}</p><p class="locked">Element: ${g.element}</p>`;
      M.art.portrait($('canvas', page).getContext('2d'), gid, 360, 420, 1);
    };
    const section = (title, arr, fn, nameOf) => {
      if (!arr.length) return;
      list.appendChild(h('div', 'cx-sec', title));
      for (const id of arr) { const b = h('button', 'cx-item nav', nameOf(id)); b.onclick = () => { list.querySelectorAll('.cx-item').forEach((x) => x.classList.remove('on')); b.classList.add('on'); fn(id); }; list.appendChild(b); }
    };
    section('The Court & the Living', ids.filter((i) => !M.BOSSES[i]), showChar, (i) => M.CHARACTERS[i].name);
    section('The Devas', godIds, showGod, (i) => M.GODS[i].name);
    section('Guardians of the Wheel', ids.filter((i) => M.BOSSES[i]), showChar, (i) => M.CHARACTERS[i].name);
    const foes = Object.keys(M.ENEMIES).filter((k) => s.flags['foe_' + k]);
    section('Echoes', foes, (k) => { const e = M.ENEMIES[k]; page.innerHTML = `<h3>${e.name}</h3><p>${e.lore}</p>`; }, (k) => M.ENEMIES[k].name);
    return el;
  };
  U.controlsView = () => h('div', 'ctl', `
    <table>
      <tr><td>Move</td><td><span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span></td><td>Left stick</td></tr>
      <tr><td>Attack</td><td><span class="key">Left Click</span> / <span class="key">J</span></td><td>X</td></tr>
      <tr><td>Special</td><td><span class="key">Right Click</span> / <span class="key">K</span></td><td>Y</td></tr>
      <tr><td>Dash</td><td><span class="key">Space</span> / <span class="key">Shift</span></td><td>A</td></tr>
      <tr><td>Astra</td><td><span class="key">Q</span></td><td>RB / RT</td></tr>
      <tr><td>Interact</td><td><span class="key">E</span></td><td>B</td></tr>
      <tr><td>Menu / Blessings</td><td><span class="key">Esc</span> / <span class="key">Tab</span></td><td>Start</td></tr>
    </table>
    <p class="tip">Dash through attacks: you are untouchable mid-dash. Attack straight out of a dash for a stronger Dash-Strike. Red markings on the ground show where a blow will land.</p>`);
  U.settingsView = () => {
    const s = S().settings;
    const el = h('div', 'set', `
      <label>Master Volume<input type="range" min="0" max="1" step="0.05" data-k="master" value="${s.master}"></label>
      <label>Music<input type="range" min="0" max="1" step="0.05" data-k="music" value="${s.music}"></label>
      <label>Effects<input type="range" min="0" max="1" step="0.05" data-k="sfx" value="${s.sfx}"></label>
      <label class="chk"><input type="checkbox" data-k="shake" ${s.shake ? 'checked' : ''}> Screen shake</label>
      <label class="chk"><input type="checkbox" data-k="damageNumbers" ${s.damageNumbers ? 'checked' : ''}> Damage numbers</label>
      <button class="btn ghost danger reset">Erase all progress</button>`);
    el.querySelectorAll('input[type=range]').forEach((i) => (i.oninput = () => { s[i.dataset.k] = parseFloat(i.value); M.audio.vol[i.dataset.k] = s[i.dataset.k]; M.audio.applyVolumes(); M.save.write(); }));
    el.querySelectorAll('input[type=checkbox]').forEach((i) => (i.onchange = () => { s[i.dataset.k] = i.checked; M.save.write(); }));
    $('.reset', el).onclick = () => U.confirm('Erase all progress permanently? This cannot be undone.', () => { M.save.reset(); M.save.write(); location.reload(); });
    return el;
  };
  U.settings = () => {
    const p = h('div', 'panel small');
    p.appendChild(h('h2', '', 'Settings'));
    p.appendChild(U.settingsView());
    const c = h('button', 'btn nav', 'Close'); c.onclick = () => U.close(); p.appendChild(c);
    U.open(p, { closable: true });
  };

  // ── death ──
  const DEATH_QUOTES = [
    ['Yama', 'The Wheel turns. So do you.'],
    ['Nachiketa', 'Death isn’t the opposite of learning. It’s just a very strict teacher.'],
    ['Savitri', 'Walk faster next time.'],
    ['Chitragupta', 'D.A. Noted.'],
    ['Drona', 'Every defeat is a lesson the body remembers.'],
  ];
  U.deathScreen = (st, onGo) => {
    const p = h('div', 'death');
    const q = M.pick(DEATH_QUOTES);
    const mm = Math.floor(st.time / 60), ss = Math.floor(st.time % 60).toString().padStart(2, '0');
    p.innerHTML = `<div class="d-title">SLAIN</div><div class="d-sub">by ${st.killer} in ${st.region}</div>
      <div class="d-stats"><div><b>${st.rooms}</b>Chambers</div><div><b>${st.kills}</b>Echoes Freed</div><div><b>${mm}:${ss}</b>Time</div><div><b>${st.punya}</b>Punya Kept</div></div>
      <div class="d-quote">“${q[1]}”<span>— ${q[0]}</span></div>
      <button class="btn nav go">Return to the Court</button>`;
    U.open(p, { closable: false });
    $('.go', p).onclick = () => { U.close(); onGo(); };
  };

  // ── cutscenes ──
  U.cutscene = (panels, onDone, music) => {
    const el = h('div', 'cutscene');
    el.innerHTML = `<canvas class="cs-art"></canvas><div class="cs-text"></div><div class="cs-hint">Click or press Space to continue · <span class="skip">Skip</span></div>`;
    U.root.appendChild(el);
    const cv = $('canvas', el);
    const resize = () => { const r = Math.min(2, devicePixelRatio || 1); cv.width = cv.clientWidth * r; cv.height = cv.clientHeight * r; };
    cut = { el, panels, i: -1, t: 0, cv, resize, onDone };
    blocking();
    U.fadeTo(0, 0.8);
    if (music) M.audio.music(music);
    requestAnimationFrame(() => { el.classList.add('show'); resize(); });
    window.addEventListener('resize', resize);
    el.addEventListener('click', (e) => { if (e.target.classList.contains('skip')) U.endCut(); else U.nextPanel(); });
    U.nextPanel();
  };
  U.nextPanel = () => {
    if (!cut) return;
    if (cut.t < 0.35 && cut.i >= 0) return;
    cut.i++; cut.t = 0;
    if (cut.i >= cut.panels.length) return U.endCut();
    const P = cut.panels[cut.i];
    const tx = $('.cs-text', cut.el);
    tx.classList.remove('in'); void tx.offsetWidth;
    tx.textContent = P.text;
    tx.classList.toggle('big', P.art === 'title');
    tx.classList.add('in');
    M.audio.sfx('chime', { vol: 0.5 });
  };
  U.endCut = () => {
    if (!cut) return;
    const c = cut; cut = null;
    U.swallow();
    window.removeEventListener('resize', c.resize);
    c.el.classList.remove('show');
    setTimeout(() => c.el.remove(), 600);
    blocking();
    c.onDone && c.onDone();
  };
  const updateCut = (dt) => {
    if (!cut) return;
    cut.t += dt;
    const I = M.input;
    if (I.pressed.has('confirm') || I.pressed.has('dash') || I.pressed.has('interact')) U.nextPanel();
    if (!cut) return;
    const P = cut.panels[cut.i];
    if (P) M.art.scene(cut.cv.getContext('2d'), P.art, cut.cv.width, cut.cv.height, cut.t + cut.i * 3);
  };

  U.credits = (onDone, fromTitle) => {
    const el = h('div', 'credits');
    el.innerHTML = `<div class="cr-scroll">
      <div class="cr-deva">मोक्ष</div><h1>MOKSHA</h1><p class="cr-sub">A tale of the thirteenth day</p>
      <p>Inspired by the story of Abhimanyu and the Chakravyuha<br>from the <em>Mahabharata</em>, with episodes from the <em>Katha Upanishad</em><br>and the tale of Savitri and Satyavan.</p>
      <h4>Cast</h4><p>Abhimanyu &middot; Yama &middot; Chitragupta &middot; Nachiketa &middot; Savitri &middot; Chandra<br>Uttara &middot; Kubera &middot; Indra &middot; Agni &middot; Vayu &middot; Varuna &middot; Surya &middot; Durga<br>Jayadratha &middot; Karna &middot; Ashwatthama &middot; Drona &middot; and Dhumra, a very good buffalo</p>
      <h4>Made With</h4><p>Hand-written JavaScript &middot; Canvas 2D &middot; Web Audio<br>Every image is painted in code, and every note is played live in ragas Yaman, Bhairav, Kafi, Todi, Marwa and Bhairavi.</p>
      <h4>With Gratitude</h4><p>To the storytellers, singers and grandmothers who kept these tales alive across three thousand years of retelling.</p>
      <p class="cr-end">“The Self is never born and never dies.”<br><span>Katha Upanishad 1.2.18</span></p>
    </div><div class="cs-hint">Click to close</div>`;
    U.root.appendChild(el);
    cut = { el, panels: [], i: 0, t: 0, credits: true };
    blocking();
    requestAnimationFrame(() => el.classList.add('show'));
    const end = () => { if (!cut) return; cut = null; el.classList.remove('show'); setTimeout(() => el.remove(), 600); blocking(); onDone && onDone(); };
    el.addEventListener('click', end);
    cut.end = end;
  };

  // ── per-frame ──
  U.update = (dt) => {
    if (cut && cut.credits) { if (M.input.pressed.has('confirm') || M.input.pressed.has('pause')) cut.end(); return; }
    updateCut(dt);
    updateDialogue(dt);
    U.handleNav();
    U.updateHud(dt);
    // interaction prompt
    const g = G();
    let label = null;
    if (!g.uiBlocking && !g.cinematic && g.room && mode !== 'title') {
      const it = g.nearestInteractable();
      if (it) label = it.label === 'Talk' ? `Talk to ${M.CHARACTERS[it.who].name}` : it.label;
    }
    if (label !== U._lastPrompt) {
      U._lastPrompt = label;
      U.prompt.innerHTML = label ? `<span class="key">E</span> ${label}` : '';
      U.prompt.classList.toggle('show', !!label);
    }
    // boss bar
    if (U.boss) {
      const b = U.boss;
      const f = $('.boss-fill', U.bossEl), a = $('.boss-armor', U.bossEl);
      if (f) f.style.width = Math.max(0, b.hp / b.maxHp) * 100 + '%';
      if (a) a.style.width = b.maxArmor ? (b.armor / b.maxArmor) * 100 + '%' : '0%';
      U.bossEl.classList.toggle('immune', !!b.invuln);
    }
  };
})();
