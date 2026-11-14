'use strict';
// ───────────────────────────────────────────────────────────────
//  The Devas and their boons
// ───────────────────────────────────────────────────────────────
M.RARITY = [
  { id: 'common', name: 'Common', color: '#e8e1d0' },
  { id: 'rare', name: 'Rare', color: '#4fb3ff' },
  { id: 'epic', name: 'Epic', color: '#c77dff' },
  { id: 'heroic', name: 'Heroic', color: '#ff6b4a' },
];

M.GODS = {
  indra: {
    id: 'indra', name: 'Indra', title: 'King of Svarga, Wielder of the Vajra',
    color: '#6fd3ff', color2: '#ffe27a', element: 'Lightning',
    blurb: 'Grandfather by blood. Father of Arjuna. Proud as thunder and just as loud.',
  },
  agni: {
    id: 'agni', name: 'Agni', title: 'The Sacrificial Flame, Mouth of the Gods',
    color: '#ff7a2f', color2: '#ffd15c', element: 'Fire',
    blurb: 'Every offering passes through his mouth to reach the heavens. He is always, always hungry.',
  },
  vayu: {
    id: 'vayu', name: 'Vayu', title: 'Lord of the Winds, Breath of All Things',
    color: '#8ff0c4', color2: '#e8fff4', element: 'Wind',
    blurb: 'Father of Bhima and Hanuman. He laughs like a storm coming through a forest.',
  },
  varuna: {
    id: 'varuna', name: 'Varuna', title: 'Keeper of Oaths, Lord of the Deep Waters',
    color: '#2fb8e6', color2: '#9ff0ff', element: 'Water',
    blurb: 'He binds the oathbreaker with a noose of water. He never forgets a promise, yours or anyone else’s.',
  },
  surya: {
    id: 'surya', name: 'Surya', title: 'The Sun, Eye of the World',
    color: '#ffb81f', color2: '#fff2a8', element: 'Radiance',
    blurb: 'Father of Karna, whose arrow cut your bowstring. He has never once looked away from anything. He cannot.',
  },
  durga: {
    id: 'durga', name: 'Durga', title: 'The Invincible, Slayer of Mahisha',
    color: '#ff3d7f', color2: '#ffc0d8', element: 'Shakti',
    blurb: 'Born from the combined fury of every god. She rides a lion. She does not lose.',
  },
};

// helper: describe value with sign / percent
const pct = (v) => `+${Math.round(v)}%`;

// Each boon: vals = [common, rare, epic, heroic]; grow = per-level multiplier increment
M.BOONS = [
  // ═════ INDRA ═════
  { id: 'indra_attack', god: 'indra', slot: 'attack', name: 'Vajra Strike', vals: [10, 13, 16, 20], grow: 0.3,
    desc: (v) => `Your <b>Attack</b> arcs lightning that jumps to <b>2</b> nearby foes for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => m.attackFx.push({ type: 'chain', dmg: v, jumps: 2 }) },
  { id: 'indra_special', god: 'indra', slot: 'special', name: 'Thundering Flourish', vals: [30, 40, 50, 62], grow: 0.3,
    desc: (v) => `Your <b>Special</b> calls down a thunderbolt on each foe hit for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => m.specialFx.push({ type: 'bolt', dmg: v }) },
  { id: 'indra_dash', god: 'indra', slot: 'dash', name: 'Storm Step', vals: [14, 18, 22, 28], grow: 0.3,
    desc: (v) => `Your <b>Dash</b> strikes up to <b>3</b> nearby foes with lightning for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => m.dashFx.push({ type: 'bolts', dmg: v, count: 3 }) },
  { id: 'indra_astra', god: 'indra', slot: 'astra', name: 'Airavata’s Thunderhead', vals: [14, 17, 21, 26], grow: 0.3,
    desc: (v) => `Your <b>Astra</b> becomes a storm-cloud that strikes foes beneath it for <em>${Math.round(v)}</em> damage, repeatedly.`,
    apply: (m, v) => { m.astra = { kind: 'storm', dmg: v }; } },
  { id: 'indra_rolling', god: 'indra', slot: 'passive', name: 'Rolling Thunder', vals: [1, 2, 2, 3], grow: 0, int: true,
    req: (b) => b.some((x) => ['indra_attack', 'indra_special', 'indra_dash', 'indra_astra'].includes(x.id)),
    desc: (v) => `Your lightning effects jump or strike <em>+${v}</em> additional time${v > 1 ? 's' : ''}.`,
    apply: (m, v) => { m.chainJumps += v; } },
  { id: 'indra_crown', god: 'indra', slot: 'passive', name: 'Clouded Crown', vals: [40, 55, 70, 90], grow: 0.3,
    desc: (v) => `When struck, a thunderbolt answers your attacker for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => { m.retaliate = Math.max(m.retaliate, v); } },
  { id: 'indra_static', god: 'indra', slot: 'passive', name: 'Static Brand', vals: [15, 20, 25, 32], grow: 0.25,
    desc: (v) => `Foes struck by your lightning take <em>${pct(v)}</em> damage from all sources for 4 seconds.`,
    apply: (m, v) => { m.staticVuln = Math.max(m.staticVuln, v / 100); } },

  // ═════ AGNI ═════
  { id: 'agni_attack', god: 'agni', slot: 'attack', name: 'Kindling Strike', vals: [20, 26, 32, 40], grow: 0.3,
    desc: (v) => `Your <b>Attack</b> deals <em>${pct(v)}</em> damage and inflicts <b>Burn</b>.`,
    apply: (m, v) => { m.dmg.attack += v / 100; m.attackFx.push({ type: 'burn', stacks: 1 }); } },
  { id: 'agni_special', god: 'agni', slot: 'special', name: 'Havan Flourish', vals: [30, 40, 50, 62], grow: 0.3,
    desc: (v) => `Your <b>Special</b> deals <em>${pct(v)}</em> damage and inflicts <b>2 Burn</b>.`,
    apply: (m, v) => { m.dmg.special += v / 100; m.specialFx.push({ type: 'burn', stacks: 2 }); } },
  { id: 'agni_dash', god: 'agni', slot: 'dash', name: 'Ember Trail', vals: [10, 13, 16, 20], grow: 0.3,
    desc: (v) => `Your <b>Dash</b> leaves a trail of flame that scorches foes for <em>${Math.round(v)}</em> and inflicts <b>Burn</b>.`,
    apply: (m, v) => m.dashFx.push({ type: 'fireTrail', dmg: v }) },
  { id: 'agni_astra', god: 'agni', slot: 'astra', name: 'Agneyastra', vals: [60, 75, 90, 110], grow: 0.3,
    desc: (v) => `Your <b>Astra</b> becomes a fireball that bursts for <em>${Math.round(v)}</em> damage and inflicts <b>3 Burn</b>.`,
    apply: (m, v) => { m.astra = { kind: 'fireball', dmg: v }; } },
  { id: 'agni_hunger', god: 'agni', slot: 'passive', name: 'Hungry Flame', vals: [40, 60, 80, 100], grow: 0.3,
    req: (b) => b.some((x) => ['agni_attack', 'agni_special', 'agni_dash', 'agni_astra'].includes(x.id)),
    desc: (v) => `Your <b>Burn</b> deals <em>${pct(v)}</em> damage.`,
    apply: (m, v) => { m.burnPower += v / 100; } },
  { id: 'agni_ghee', god: 'agni', slot: 'passive', name: 'Offering of Ghee', vals: [25, 32, 40, 50], grow: 0.3,
    req: (b) => b.some((x) => ['agni_attack', 'agni_special', 'agni_dash', 'agni_astra'].includes(x.id)),
    desc: (v) => `Burning foes erupt when slain, dealing <em>${Math.round(v)}</em> damage around them.`,
    apply: (m, v) => { m.burnExplode = Math.max(m.burnExplode, v); } },
  { id: 'agni_hearth', god: 'agni', slot: 'passive', name: 'Sacred Hearth', vals: [4, 6, 8, 10], grow: 0.3, int: true,
    desc: (v) => `Restore <em>${v}</em> health each time you clear a chamber.`,
    apply: (m, v) => { m.clearHeal += v; } },

  // ═════ VAYU ═════
  { id: 'vayu_attack', god: 'vayu', slot: 'attack', name: 'Gale Strike', vals: [30, 40, 50, 65], grow: 0.3,
    desc: (v) => `Your <b>Attack</b> hurls foes back. Any foe slammed into a wall takes <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => { m.attackFx.push({ type: 'knock', force: 650 }); m.wallSlam = Math.max(m.wallSlam, v); } },
  { id: 'vayu_special', god: 'vayu', slot: 'special', name: 'Cyclone Flourish', vals: [6, 8, 10, 13], grow: 0.3,
    desc: (v) => `Your <b>Special</b> conjures a whirlwind that draws foes in, dealing <em>${Math.round(v)}</em> damage rapidly.`,
    apply: (m, v) => m.specialSpawn.push({ type: 'cyclone', dmg: v }) },
  { id: 'vayu_dash', god: 'vayu', slot: 'dash', name: 'Tailwind Step', vals: [16, 21, 26, 33], grow: 0.3,
    desc: (v) => `Your <b>Dash</b> batters foes in your path for <em>${Math.round(v)}</em> damage and knocks them aside.`,
    apply: (m, v) => m.dashFx.push({ type: 'gust', dmg: v }) },
  { id: 'vayu_astra', god: 'vayu', slot: 'astra', name: 'Vayavyastra', vals: [8, 10, 12, 15], grow: 0.3,
    desc: (v) => `Your <b>Astra</b> becomes a wandering tornado that pulls in and shreds foes for <em>${Math.round(v)}</em> per hit.`,
    apply: (m, v) => { m.astra = { kind: 'tornado', dmg: v }; } },
  { id: 'vayu_prana', god: 'vayu', slot: 'passive', name: 'Breath of Prana', vals: [10, 13, 16, 20], grow: 0.2,
    desc: (v) => `You have a <em>${Math.round(v)}%</em> chance to dodge any harm completely.`,
    apply: (m, v) => { m.dodge += v / 100; } },
  { id: 'vayu_fleet', god: 'vayu', slot: 'passive', name: 'Fleet as the Wind', vals: [10, 14, 18, 24], grow: 0.25,
    desc: (v) => `You move <em>${pct(v)}</em> faster and attack <em>${pct(v / 2)}</em> faster.`,
    apply: (m, v) => { m.speed += v / 100; m.attackSpeed += v / 200; } },
  { id: 'vayu_hanuman', god: 'vayu', slot: 'passive', name: 'Hanuman’s Leap', vals: [1, 1, 1, 2], grow: 0, int: true, unique: true,
    desc: (v) => `Gain <em>+${v}</em> Dash charge${v > 1 ? 's' : ''}. Your dashes carry further.`,
    apply: (m, v) => { m.dashCharges += v; m.dashDist += 0.15; } },

  // ═════ VARUNA ═════
  { id: 'varuna_attack', god: 'varuna', slot: 'attack', name: 'Tidal Strike', vals: [15, 20, 25, 32], grow: 0.3,
    desc: (v) => `Your <b>Attack</b> deals <em>${pct(v)}</em> damage and <b>Soaks</b> foes, slowing them.`,
    apply: (m, v) => { m.dmg.attack += v / 100; m.attackFx.push({ type: 'soak' }); } },
  { id: 'varuna_special', god: 'varuna', slot: 'special', name: 'Pasha Flourish', vals: [1.0, 1.3, 1.6, 2.0], grow: 0.15, dec: 1,
    desc: (v) => `Your <b>Special</b> casts Varuna’s noose, <b>Binding</b> foes in place for <em>${v.toFixed(1)}s</em>.`,
    apply: (m, v) => { m.specialFx.push({ type: 'bind', dur: v }); m.specialFx.push({ type: 'soak' }); } },
  { id: 'varuna_dash', god: 'varuna', slot: 'dash', name: 'Undertow Step', vals: [6, 8, 10, 13], grow: 0.3,
    desc: (v) => `Your <b>Dash</b> leaves a whirling pool that <b>Soaks</b> foes and deals <em>${Math.round(v)}</em> damage over and over.`,
    apply: (m, v) => m.dashFx.push({ type: 'pool', dmg: v }) },
  { id: 'varuna_astra', god: 'varuna', slot: 'astra', name: 'Varunastra', vals: [50, 62, 75, 92], grow: 0.3,
    desc: (v) => `Your <b>Astra</b> unleashes a great wave that crashes through foes for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => { m.astra = { kind: 'wave', dmg: v }; } },
  { id: 'varuna_oath', god: 'varuna', slot: 'passive', name: 'Deep Oath', vals: [18, 24, 30, 38], grow: 0.25,
    req: (b) => b.some((x) => ['varuna_attack', 'varuna_special', 'varuna_dash', 'varuna_astra'].includes(x.id)),
    desc: (v) => `<b>Soaked</b> or <b>Bound</b> foes take <em>${pct(v)}</em> damage.`,
    apply: (m, v) => { m.soakVuln = Math.max(m.soakVuln, v / 100); } },
  { id: 'varuna_life', god: 'varuna', slot: 'passive', name: 'Waters of Life', vals: [20, 25, 32, 40], grow: 0.25, int: true,
    desc: (v) => `Gain <em>+${v}</em> maximum health.`,
    apply: (m, v) => { m.maxHp += v; } },
  { id: 'varuna_patience', god: 'varuna', slot: 'passive', name: 'Ocean’s Patience', vals: [0.8, 1.0, 1.3, 1.7], grow: 0.2, dec: 1,
    desc: (v) => `While you avoid harm for 3 seconds, regenerate <em>${v.toFixed(1)}</em> health per second (up to 60% of your maximum).`,
    apply: (m, v) => { m.regen += v; } },

  // ═════ SURYA ═════
  { id: 'surya_attack', god: 'surya', slot: 'attack', name: 'Solar Strike', vals: [15, 20, 25, 32], grow: 0.3,
    desc: (v) => `Your <b>Attack</b> deals <em>${pct(v)}</em> damage and inflicts <b>Glare</b>: dazzled foes deal 30% less damage.`,
    apply: (m, v) => { m.dmg.attack += v / 100; m.attackFx.push({ type: 'glare' }); } },
  { id: 'surya_special', god: 'surya', slot: 'special', name: 'Corona Flourish', vals: [30, 40, 50, 62], grow: 0.3,
    desc: (v) => `Your <b>Special</b> deals <em>${pct(v)}</em> damage, inflicts <b>Glare</b>, and has <b>+20%</b> critical chance.`,
    apply: (m, v) => { m.dmg.special += v / 100; m.specialFx.push({ type: 'glare' }); m.specialCrit += 0.2; } },
  { id: 'surya_dash', god: 'surya', slot: 'dash', name: 'Dawn Step', vals: [12, 16, 20, 25], grow: 0.3,
    desc: (v) => `Your <b>Dash</b> releases a flash of dawn, dealing <em>${Math.round(v)}</em> to nearby foes and inflicting <b>Glare</b>.`,
    apply: (m, v) => m.dashFx.push({ type: 'flash', dmg: v }) },
  { id: 'surya_astra', god: 'surya', slot: 'astra', name: 'Suryastra', vals: [70, 85, 100, 122], grow: 0.3,
    desc: (v) => `Your <b>Astra</b> becomes a lance of sunlight that pierces everything in a line for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => { m.astra = { kind: 'beam', dmg: v }; } },
  { id: 'surya_zenith', god: 'surya', slot: 'passive', name: 'High Noon', vals: [6, 8, 10, 13], grow: 0.2,
    desc: (v) => `All your damage has <em>+${Math.round(v)}%</em> chance to be <b>Critical</b>.`,
    apply: (m, v) => { m.critChance += v / 100; } },
  { id: 'surya_kavacha', god: 'surya', slot: 'passive', name: 'Kavacha of Light', vals: [1, 1, 2, 2], grow: 0, int: true,
    desc: (v) => `The first <em>${v}</em> blow${v > 1 ? 's' : ''} against you in each chamber ${v > 1 ? 'are' : 'is'} turned aside by golden armour.`,
    apply: (m, v) => { m.roomShield = Math.max(m.roomShield, v); } },
  { id: 'surya_truth', god: 'surya', slot: 'passive', name: 'Blinding Truth', vals: [15, 20, 25, 32], grow: 0.2,
    req: (b) => b.some((x) => ['surya_attack', 'surya_special', 'surya_dash'].includes(x.id)),
    desc: (v) => `You have <em>+${Math.round(v)}%</em> critical chance against <b>Glared</b> foes.`,
    apply: (m, v) => { m.glareCrit += v / 100; } },

  // ═════ DURGA ═════
  { id: 'durga_attack', god: 'durga', slot: 'attack', name: 'Trishula Strike', vals: [40, 50, 62, 78], grow: 0.3,
    desc: (v) => `Your <b>Attack</b> deals <em>${pct(v)}</em> damage.`,
    apply: (m, v) => { m.dmg.attack += v / 100; } },
  { id: 'durga_special', god: 'durga', slot: 'special', name: 'Simha Flourish', vals: [50, 65, 80, 100], grow: 0.3,
    desc: (v) => `Your <b>Special</b> deals <em>${pct(v)}</em> damage and the lion’s roar hurls foes back.`,
    apply: (m, v) => { m.dmg.special += v / 100; m.specialFx.push({ type: 'knock', force: 450 }); } },
  { id: 'durga_dash', god: 'durga', slot: 'dash', name: 'Lion’s Pounce', vals: [28, 36, 45, 56], grow: 0.3,
    desc: (v) => `Your <b>Dash</b> ends in a pounce that strikes foes around you for <em>${Math.round(v)}</em> damage.`,
    apply: (m, v) => m.dashFx.push({ type: 'pounce', dmg: v }) },
  { id: 'durga_astra', god: 'durga', slot: 'astra', name: 'Discs of the Goddess', vals: [14, 18, 22, 27], grow: 0.3,
    desc: (v) => `Your <b>Astra</b> summons three whirling discs that orbit you, cutting foes for <em>${Math.round(v)}</em>.`,
    apply: (m, v) => { m.astra = { kind: 'discs', dmg: v }; } },
  { id: 'durga_mardini', god: 'durga', slot: 'passive', name: 'Mahishasura Mardini', vals: [20, 26, 32, 40], grow: 0.25,
    desc: (v) => `You deal <em>${pct(v)}</em> damage to <b>Elites</b> and <b>Guardians</b>.`,
    apply: (m, v) => { m.bigDmg += v / 100; } },
  { id: 'durga_raudra', god: 'durga', slot: 'passive', name: 'Raudra', vals: [25, 35, 45, 60], grow: 0.25,
    desc: (v) => `While below half health, you deal <em>${pct(v)}</em> damage.`,
    apply: (m, v) => { m.lowHpDmg += v / 100; } },
  { id: 'durga_embrace', god: 'durga', slot: 'passive', name: 'Mother’s Embrace', vals: [10, 14, 18, 24], grow: 0.25, int: true,
    desc: (v) => `Once per chamber, when brought below 25% health, become invulnerable briefly and restore <em>${v}</em> health.`,
    apply: (m, v) => { m.embrace = Math.max(m.embrace, v); } },

  // ═════ DUO BOONS ═════
  { id: 'duo_vajrafire', god: 'indra', god2: 'agni', duo: true, slot: 'passive', name: 'Burning Vajra', vals: [1, 1, 1, 1], int: true,
    desc: () => `Your lightning sets foes ablaze, inflicting <b>Burn</b> with every strike.`,
    apply: (m) => { m.flags.lightningBurns = true; } },
  { id: 'duo_wildfire', god: 'agni', god2: 'vayu', duo: true, slot: 'passive', name: 'Wildfire', vals: [1, 1, 1, 1], int: true,
    desc: () => `When a burning foe falls, the wind carries its flames to every foe nearby.`,
    apply: (m) => { m.flags.wildfire = true; } },
  { id: 'duo_monsoon', god: 'indra', god2: 'varuna', duo: true, slot: 'passive', name: 'Monsoon', vals: [1, 1, 1, 1], int: true,
    desc: () => `Your lightning deals <b>double</b> damage to <b>Soaked</b> foes.`,
    apply: (m) => { m.flags.monsoon = true; } },
  { id: 'duo_whirlpool', god: 'vayu', god2: 'varuna', duo: true, slot: 'passive', name: 'Maelstrom', vals: [1, 1, 1, 1], int: true,
    desc: () => `Foes you hurl into walls are <b>Bound</b> for 1.5s. Your wind effects <b>Soak</b>.`,
    apply: (m) => { m.flags.maelstrom = true; } },
  { id: 'duo_solarflare', god: 'surya', god2: 'agni', duo: true, slot: 'passive', name: 'Solar Flare', vals: [1, 1, 1, 1], int: true,
    desc: () => `<b>Glared</b> foes catch fire, gaining <b>Burn</b> each second.`,
    apply: (m) => { m.flags.solarflare = true; } },
  { id: 'duo_dawnvictory', god: 'surya', god2: 'durga', duo: true, slot: 'passive', name: 'Dawn of Victory', vals: [1, 1, 1, 1], int: true,
    desc: () => `Each <b>Critical</b> hit restores <b>1</b> health.`,
    apply: (m) => { m.flags.critHeal = true; } },
  { id: 'duo_thundertrident', god: 'durga', god2: 'indra', duo: true, slot: 'passive', name: 'Trident of Storms', vals: [1, 1, 1, 1], int: true,
    desc: () => `Every third <b>Attack</b> calls a thunderbolt on its target for <b>40</b> damage.`,
    apply: (m) => { m.flags.thirdBolt = true; } },
];
M.BOON_BY_ID = Object.fromEntries(M.BOONS.map((b) => [b.id, b]));

M.boonValue = (boonState) => {
  const def = M.BOON_BY_ID[boonState.id];
  const base = def.vals[boonState.rarity];
  let v = base * (1 + (boonState.level - 1) * (def.grow ?? 0.3));
  if (def.int) v = Math.round(v);
  return v;
};

M.freshMods = () => ({
  dmg: { attack: 1, special: 1, dash: 1, astra: 1 },
  attackFx: [], specialFx: [], dashFx: [], specialSpawn: [],
  astra: null,
  critChance: 0, specialCrit: 0, glareCrit: 0, critMult: 3,
  dodge: 0, speed: 1, attackSpeed: 1, maxHp: 0, dmgTaken: 1,
  chainJumps: 0, retaliate: 0, staticVuln: 0,
  burnPower: 1, burnExplode: 0, clearHeal: 0,
  wallSlam: 0, dashCharges: 0, dashDist: 1,
  soakVuln: 0, regen: 0, roomShield: 0,
  bigDmg: 0, lowHpDmg: 0, embrace: 0,
  allDmg: 0, kauriMult: 1,
  flags: {},
});
