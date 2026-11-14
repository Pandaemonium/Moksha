'use strict';
// ───────────────────────────────────────────────────────────────
//  Persistence
// ───────────────────────────────────────────────────────────────
(() => {
  const KEY = 'moksha_save_v1';
  const fresh = () => ({
    v: 1, created: Date.now(),
    runs: 0, deaths: 0, wins: 0,
    punya: 0, garlands: 0,
    ledger: {}, weapons: { khadga: true }, weapon: 'khadga',
    keepsake: null, keepsakes: {},
    affinity: {}, seen: {}, flags: {},
    godMet: {}, bossMet: {}, bossKills: {}, bossDeaths: {},
    visions: 0, maxRegion: 0, lastRun: null, chandraRun: 0,
    bestTime: null, totalKills: 0, pets: 0,
    settings: { master: 0.8, music: 0.6, sfx: 0.8, shake: true, damageNumbers: true },
  });
  M.save = {
    data: null,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const d = JSON.parse(raw);
          this.data = Object.assign(fresh(), d);
          this.data.settings = Object.assign(fresh().settings, d.settings || {});
          return this.data;
        }
      } catch (e) { console.warn('save load failed', e); }
      this.data = fresh();
      return this.data;
    },
    has() {
      try { const raw = localStorage.getItem(KEY); return !!raw && JSON.parse(raw).flags?.intro; } catch (e) { return false; }
    },
    write() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* storage unavailable */ }
    },
    reset() {
      this.data = fresh();
      const keep = this.data.settings;
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      this.data.settings = keep;
      return this.data;
    },
    rank(id) { return this.data.ledger[id] || 0; },
  };
})();
