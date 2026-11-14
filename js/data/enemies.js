'use strict';
// ───────────────────────────────────────────────────────────────
//  Echoes of the Wheel — foes within the Chakravyuha
// ───────────────────────────────────────────────────────────────
M.ENEMIES = {
  padati: {
    name: 'Echo Footman', hp: 52, r: 20, speed: 125, ai: 'melee', dmg: 10, range: 85, windup: 0.6, lunge: 260, recover: 0.7, pts: 2,
    body: { kind: 'soldier', armor: '#5b4a8a', cloth: '#2c2350', weapon: 'spear', glow: '#ff5a7a' },
    lore: 'Every soldier who stood in the formation that day left an impression in it, the way a foot leaves a print in wet clay. They remember only one order: close the gap.',
  },
  pishacha: {
    name: 'Pishacha', hp: 22, r: 15, speed: 240, ai: 'swarm', dmg: 5, range: 44, windup: 0.28, lunge: 200, recover: 0.5, pts: 1,
    body: { kind: 'pishacha', skin: '#7f9a74', glow: '#d6ff6a' },
    lore: 'Flesh-hungry ghouls that gather wherever there has been a great deal of dying. Kurukshetra fed them for eighteen days. They followed the smell inside.',
  },
  dhanvin: {
    name: 'Echo Archer', hp: 40, r: 19, speed: 110, ai: 'ranged', dmg: 9, prefer: 400, windup: 0.85, projSpeed: 560, recover: 1.1, pts: 2,
    body: { kind: 'soldier', armor: '#3f5a8a', cloth: '#1d2a4a', weapon: 'bow', glow: '#ff9a3c' },
    lore: 'Archers of the Kaurava line. In life they loosed so many arrows that the sky over the field went dark at noon. They are still aiming at that same sky.',
  },
  gaja: {
    name: 'Shade-Elephant', hp: 240, r: 42, speed: 85, ai: 'charger', dmg: 20, windup: 1.0, chargeSpeed: 640, chargeTime: 1.1, recover: 1.3, pts: 5, heavy: true,
    body: { kind: 'elephant', skin: '#5a5470', cloth: '#a0203a', gold: '#e6b84a', glow: '#ff5a7a' },
    lore: 'War-elephants in caparisons of crimson and gold. In the Wheel they have no riders. They do not seem to notice.',
  },
  ratha: {
    name: 'Phantom Chariot', hp: 170, r: 36, speed: 95, ai: 'charger', dmg: 18, windup: 0.75, chargeSpeed: 820, chargeTime: 0.9, recover: 0.9, pts: 4, heavy: true,
    body: { kind: 'chariot', wood: '#6a3b1f', gold: '#e6b84a', horse: '#c8c0b0', glow: '#ffb84a' },
    lore: 'A chariot with no charioteer, drawn by horses made of dust and the memory of hooves. Its banner bears no house. All the houses are the same here.',
  },
  vetala: {
    name: 'Vetala', hp: 68, r: 20, speed: 90, ai: 'caster', dmg: 8, windup: 1.0, recover: 1.8, projSpeed: 230, pts: 3,
    body: { kind: 'vetala', skin: '#b8b0d8', cloak: '#3a2a5a', glow: '#b68cff' },
    lore: 'Spirits that hang from trees at the edge of cremation grounds and pose riddles to kings. This one has stopped asking riddles. It has started asking for you.',
  },
  kavachin: {
    name: 'Shield-Bearer', hp: 110, r: 23, speed: 105, ai: 'melee', dmg: 13, range: 90, windup: 0.75, lunge: 230, recover: 0.9, pts: 3, shield: true,
    body: { kind: 'soldier', armor: '#8a6a2a', cloth: '#3a2a10', weapon: 'shield', glow: '#ffd24a' },
    lore: 'They lock shields so tightly that light cannot pass between them. Strike them from the front and you strike bronze. Strike them from behind, and they are only men.',
  },
  naga: {
    name: 'Naga Spitter', hp: 62, r: 22, speed: 80, ai: 'spitter', dmg: 10, prefer: 420, windup: 0.9, recover: 1.5, pts: 2.5,
    body: { kind: 'naga', scale: '#1fa88a', belly: '#d8e8a0', glow: '#7affc8' },
    lore: 'Serpent-folk of the underworld, half-human above the waist, jewelled hoods flared. Their venom pools glow like moonlight on deep water.',
  },
  nagayodha: {
    name: 'Naga Warrior', hp: 105, r: 25, speed: 115, ai: 'sweeper', dmg: 13, range: 120, windup: 0.8, recover: 1.0, pts: 3,
    body: { kind: 'naga', scale: '#3a6ad8', belly: '#e8d8a0', glow: '#7ab8ff', armed: true },
    lore: 'Champions of Patala who fight with a blade in each hand and a tail that sweeps the floor clean of anything standing.',
  },
  bhuta: {
    name: 'Bhuta', hp: 30, r: 16, speed: 170, ai: 'bomber', dmg: 22, windup: 0.7, pts: 1.5,
    body: { kind: 'bhuta', glow: '#ff6af0', core: '#ffe0ff' },
    lore: 'A restless ghost of someone who died with too much left undone. It burns that leftover longing all at once, and explosively.',
  },
  mayavi: {
    name: 'Mayavi', hp: 70, r: 20, speed: 100, ai: 'caster', dmg: 9, windup: 1.1, recover: 1.6, projSpeed: 300, homing: true, pts: 3,
    body: { kind: 'vetala', skin: '#9fe8ff', cloak: '#103a4a', glow: '#4af0ff' },
    lore: 'Illusionists who learned maya — the art of making the false seem true. Their bolts of light bend to follow you, as if they knew where you meant to go.',
  },
  dvarapala: {
    name: 'Spiral Sentinel', hp: 300, r: 40, speed: 55, ai: 'sentinel', dmg: 9, windup: 1.2, recover: 1.6, projSpeed: 260, pts: 6, heavy: true,
    body: { kind: 'sentinel', stone: '#4a4a7a', gold: '#ffcf4a', glow: '#ffcf4a' },
    lore: 'Door-guardians carved into the innermost ring by Drona’s own mantras. They are not alive. They are the formation’s idea of a wall, given a reason to move.',
  },
};

// Encounter pools per region
M.REGION_POOLS = [
  ['padati', 'pishacha', 'dhanvin', 'gaja'],
  ['padati', 'dhanvin', 'kavachin', 'ratha', 'vetala', 'pishacha'],
  ['naga', 'nagayodha', 'bhuta', 'mayavi', 'pishacha'],
  ['kavachin', 'nagayodha', 'mayavi', 'dvarapala', 'bhuta', 'dhanvin', 'vetala', 'ratha'],
];

M.BOSSES = {
  jayadratha: { name: 'Jayadratha', title: 'Holder of the Gate', hp: 1500, r: 34, region: 0 },
  karna: { name: 'Karna', title: 'Son of the Sun', hp: 2000, r: 32, region: 1 },
  ashwatthama: { name: 'Ashwatthama', title: 'The Undying', hp: 2500, r: 32, region: 2 },
  drona: { name: 'Drona', title: 'Architect of the Wheel', hp: 3400, r: 32, region: 3 },
};
