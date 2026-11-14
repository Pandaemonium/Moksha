'use strict';
// ───────────────────────────────────────────────────────────────
//  Divine Arms — the weapons Abhimanyu can carry into the Wheel
// ───────────────────────────────────────────────────────────────
const DEG = Math.PI / 180;
M.WEAPONS = {
  khadga: {
    id: 'khadga', name: 'Khadga', title: 'Sword of the Lunar Line',
    cost: 0, color: '#cfe8ff',
    lore: 'A straight blade of moon-pale steel, the first weapon Arjuna ever placed in his son’s hand. Quick, honest, unforgiving of hesitation.',
    attackDesc: 'Three-strike combo. The final strike lunges.', specialDesc: 'Lunar Whirl — a full spin that cuts all around you.',
    combo: [
      { dmg: 20, range: 125, arc: 110 * DEG, dur: 0.24, active: 0.08, lunge: 70 },
      { dmg: 22, range: 130, arc: 120 * DEG, dur: 0.24, active: 0.08, lunge: 70 },
      { dmg: 40, range: 150, arc: 150 * DEG, dur: 0.4, active: 0.12, lunge: 130, heavy: true },
    ],
    special: { kind: 'whirl', dmg: 30, radius: 165, dur: 0.42 },
    upgrades: ['k_edge', 'k_reach', 'k_whirl', 'k_wave', 'k_crit'],
  },
  chakra: {
    id: 'chakra', name: 'Ratha Chakra', title: 'Wheel of the Last Stand',
    cost: 20, color: '#ffcf6b',
    lore: 'When every bow was broken and every sword shattered, Abhimanyu tore the wheel from his own chariot and fought on with it. The seven great warriors still could not bring him down alone.',
    attackDesc: 'Two heavy, wide bashes.', specialDesc: 'Hurl the wheel; it cuts through foes and returns to you.',
    combo: [
      { dmg: 26, range: 120, arc: 160 * DEG, dur: 0.32, active: 0.1, lunge: 40, knock: 260 },
      { dmg: 38, range: 130, arc: 190 * DEG, dur: 0.42, active: 0.12, lunge: 60, knock: 420, heavy: true },
    ],
    special: { kind: 'throw', dmg: 32, range: 560, speed: 1150, radius: 34, dur: 0.22 },
    upgrades: ['c_bash', 'c_heavy', 'c_bounce', 'c_quick', 'c_spin'],
  },
  dhanush: {
    id: 'dhanush', name: 'Dhanush', title: 'Echo of Gandiva',
    cost: 30, color: '#9fffcf',
    lore: 'Not Gandiva itself — that bow stays with your father on the field. But every bow remembers the first one, and this one hums Gandiva’s note when drawn.',
    attackDesc: 'Hold to draw; release for a stronger, piercing shot.', specialDesc: 'Loose a fan of five arrows.',
    combo: [{ dmg: 18, maxDmg: 62, charge: 0.5, speed: 1700, dur: 0.18 }],
    special: { kind: 'volley', dmg: 16, count: 5, spread: 40 * DEG, speed: 1500, dur: 0.38 },
    upgrades: ['d_draw', 'd_pierce', 'd_volley', 'd_power', 'd_crit'],
  },
  gada: {
    id: 'gada', name: 'Gada', title: 'Mace of the Wind-Born',
    cost: 40, color: '#ff9f7a',
    lore: 'Your uncle Bhima’s favourite argument. Heavy enough that lifting it is a kind of prayer, and swinging it is the answer.',
    attackDesc: 'Two crushing blows; the second shakes the earth.', specialDesc: 'Leap toward your aim and smash down.',
    combo: [
      { dmg: 45, range: 135, arc: 130 * DEG, dur: 0.5, active: 0.14, lunge: 40, knock: 300, heavy: true },
      { dmg: 70, range: 175, arc: 360 * DEG, dur: 0.72, active: 0.16, lunge: 0, knock: 520, heavy: true, quake: true },
    ],
    special: { kind: 'leap', dmg: 60, radius: 165, range: 330, dur: 0.55 },
    upgrades: ['g_power', 'g_quake', 'g_haste', 'g_leap', 'g_stun'],
  },
};
M.WEAPON_ORDER = ['khadga', 'chakra', 'dhanush', 'gada'];

M.CHISELS = {
  // Khadga
  k_edge: { name: 'Moonlit Edge', desc: 'Your Attack deals <em>+30%</em> damage.', apply: (w) => { w.combo.forEach((c) => (c.dmg *= 1.3)); } },
  k_reach: { name: 'Long Reach', desc: 'Your Attack reaches <em>+30%</em> further and sweeps wider.', apply: (w) => { w.combo.forEach((c) => { c.range *= 1.3; c.arc *= 1.15; }); } },
  k_whirl: { name: 'Full Moon Whirl', desc: 'Lunar Whirl has <em>+40%</em> radius and <em>+20</em> damage.', apply: (w) => { w.special.radius *= 1.4; w.special.dmg += 20; } },
  k_wave: { name: 'Crescent Wave', desc: 'Your third strike releases a crescent of moonlight that flies forward for <em>40</em> damage.', apply: (w) => { w.flags.crescent = 40; } },
  k_crit: { name: 'Lunar Precision', desc: 'Your third strike has <em>+35%</em> critical chance.', apply: (w) => { w.combo[2].crit = 0.35; } },
  // Chakra
  c_bash: { name: 'Crushing Rim', desc: 'Your Attack deals <em>+30%</em> damage.', apply: (w) => { w.combo.forEach((c) => (c.dmg *= 1.3)); } },
  c_heavy: { name: 'Iron-Bound Wheel', desc: 'Your thrown wheel is larger and deals <em>+25</em> damage.', apply: (w) => { w.special.dmg += 25; w.special.radius *= 1.35; } },
  c_bounce: { name: 'Ricochet', desc: 'Your thrown wheel rebounds off walls <em>3</em> times before returning.', apply: (w) => { w.flags.bounce = 3; } },
  c_quick: { name: 'Swift Return', desc: 'Your thrown wheel flies <em>40%</em> faster and further.', apply: (w) => { w.special.speed *= 1.4; w.special.range *= 1.25; } },
  c_spin: { name: 'Charioteer’s Spin', desc: 'Your second bash becomes a full spin with <em>+20%</em> damage.', apply: (w) => { const c = w.combo[1]; c.arc = Math.PI * 2; c.dmg *= 1.2; } },
  // Dhanush
  d_draw: { name: 'Swift Draw', desc: 'Your bow draws <em>40%</em> faster.', apply: (w) => { w.combo[0].charge *= 0.6; } },
  d_pierce: { name: 'Piercing Shafts', desc: 'All your arrows pierce through foes.', apply: (w) => { w.flags.pierce = true; } },
  d_volley: { name: 'Rain of Arrows', desc: 'Your volley looses <em>+3</em> arrows.', apply: (w) => { w.special.count += 3; w.special.spread *= 1.4; } },
  d_power: { name: 'Gandiva’s Note', desc: 'Fully drawn shots deal <em>+50%</em> damage and fly larger.', apply: (w) => { w.combo[0].maxDmg *= 1.5; w.flags.bigShot = true; } },
  d_crit: { name: 'Archer’s Eye', desc: 'Your Attack has <em>+20%</em> critical chance.', apply: (w) => { w.combo[0].crit = 0.2; } },
  // Gada
  g_power: { name: 'Bhima’s Might', desc: 'Your Attack deals <em>+30%</em> damage.', apply: (w) => { w.combo.forEach((c) => (c.dmg *= 1.3)); } },
  g_quake: { name: 'Earthshaker', desc: 'Your second blow’s quake reaches <em>+40%</em> further.', apply: (w) => { w.combo[1].range *= 1.4; } },
  g_haste: { name: 'Momentum', desc: 'You swing your mace <em>25%</em> faster.', apply: (w) => { w.combo.forEach((c) => { c.dur *= 0.75; c.active *= 0.75; }); } },
  g_leap: { name: 'Leap of the Wind-Son', desc: 'Your leap travels <em>+50%</em> further and deals <em>+30</em> damage.', apply: (w) => { w.special.range *= 1.5; w.special.dmg += 30; } },
  g_stun: { name: 'Stunning Blow', desc: 'Your second blow <em>stuns</em> foes for 1.2 seconds.', apply: (w) => { w.combo[1].stun = 1.2; } },
};

M.buildWeapon = (id, upgrades = []) => {
  const base = M.WEAPONS[id];
  const w = JSON.parse(JSON.stringify({ combo: base.combo, special: base.special }));
  w.id = id; w.flags = {};
  for (const u of upgrades) M.CHISELS[u].apply(w);
  return w;
};
