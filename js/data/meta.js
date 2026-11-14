'use strict';
// ───────────────────────────────────────────────────────────────
//  Ledger of Karma (permanent upgrades) and Keepsakes
// ───────────────────────────────────────────────────────────────
M.LEDGER = [
  { id: 'vigor', name: 'Vigor of Bhima', icon: 'heart', costs: [5, 10, 15, 20, 25],
    desc: (r) => `+${r * 6} maximum health.`, per: 'Each annotation: +6 maximum health.' },
  { id: 'kavach', name: 'Armour of Patience', icon: 'shield', costs: [10, 15, 20, 25, 30],
    desc: (r) => `Take ${r * 4}% less damage from foes.`, per: 'Each annotation: 4% less damage taken.' },
  { id: 'focus', name: 'Arjuna’s Focus', icon: 'eye', costs: [10, 15, 20, 25, 30],
    desc: (r) => `Deal +${r * 5}% damage.`, per: 'Each annotation: +5% damage.' },
  { id: 'prana', name: 'Second Breath', icon: 'lotus', costs: [30, 50, 80],
    desc: (r) => `When slain, rise again with half your health. ${r} time${r !== 1 ? 's' : ''} per escape.`, per: 'Each annotation: rise once more when slain.' },
  { id: 'dash', name: 'Wind-Step', icon: 'wind', costs: [25],
    desc: () => `+1 Dash charge.`, per: 'Gain an additional Dash charge.' },
  { id: 'astra', name: 'Astra Mastery', icon: 'astra', costs: [20, 40],
    desc: (r) => `+${r} Astra charge${r !== 1 ? 's' : ''}.`, per: 'Each annotation: +1 Astra charge.' },
  { id: 'grace', name: 'Grace of the Devas', icon: 'star', costs: [15, 25, 35, 45],
    desc: (r) => `Boons are ${r * 5}% more likely to be Rare or better.`, per: 'Each annotation: boons are more often Rare or better.' },
  { id: 'persuade', name: 'Dharmic Appeal', icon: 'scroll', costs: [20, 30, 40],
    desc: (r) => `You may ask the gods to reconsider their offering ${r} time${r !== 1 ? 's' : ''} per escape.`, per: 'Each annotation: one reroll of boon offerings per escape.' },
  { id: 'wealth', name: 'Kubera’s Favour', icon: 'coin', costs: [5, 10, 15, 20],
    desc: (r) => `Begin each escape with ${r * 25} Kauri.`, per: 'Each annotation: +25 starting Kauri.' },
];

M.KEEPSAKES = {
  dhumra: { name: 'Buffalo Bell', from: 'dhumra', desc: 'Take <em>15%</em> less damage from foes.', icon: 'bell' },
  yama: { name: 'Lamp of the First Road', from: 'yama', desc: 'Rise once more when slain, with <em>40%</em> health.', icon: 'lamp' },
  chitragupta: { name: 'Reed Pen', from: 'chitragupta', desc: 'Find <em>+30%</em> more Kauri.', icon: 'pen' },
  nachiketa: { name: 'Ember of the Third Night', from: 'nachiketa', desc: '<em>+1</em> Astra charge; Astras deal <em>+25%</em> damage.', icon: 'ember' },
  savitri: { name: 'Banyan Thread', from: 'savitri', desc: 'Restore <em>4</em> health each time you enter a chamber.', icon: 'thread' },
  chandra: { name: 'Moonstone', from: 'chandra', desc: 'Boons are far more likely to be <em>Rare</em> or better.', icon: 'moon' },
};
M.MAX_AFFINITY = 6;
