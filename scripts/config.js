// ─── Save ────────────────────────────────────────────────────────────────────
export const SAVE_KEY = 'caveIdle_v1';

// ─── Prestige threshold ───────────────────────────────────────────────────────
export const PRESTIGE_THRESHOLD  = 10000;
export const PRESTIGE_COST_SCALE = 1.5;   // threshold multiplied by this each prestige run

// ─── Upgrade scaling ──────────────────────────────────────────────────────────
export const UPGRADE_SCALE = 1.24;

// ─── Mining chances ───────────────────────────────────────────────────────────
export const MINING_CRIT_CHANCE       = 0.05;   // 5% base crit
export const MINING_CRIT_MULT         = 2.5;    // crit multiplier
export const BLOCK_DOUBLE_GOLD_CHANCE = 0.10;   // 10% chance to double block gold
export const BLOCK_SCRAP_CHANCE       = 0.15;   // 15% chance for scrap on block break
export const SCRAP_DROP_CHANCE        = 0.08;   // 8% chance for scrap on click
export const LUCKY_STRIKE_CHANCE      = 0.05;   // 5% lucky strike on click
export const LUCKY_STRIKE_MULT        = 2;      // lucky strike doubles damage
export const GOBLIN_SACK_CHANCE       = 0.015;  // 1.5% goblin sack on break
export const GOBLIN_SACK_GOLD         = 60;

// ─── Block gold ───────────────────────────────────────────────────────────────
export const MASSIVE_GOLD_MULT       = 1.5;   // celestial/astral block gold bonus
export const PRESTIGE_RUN_GOLD_BONUS = 0.02;  // +2% block gold per completed prestige run

// ─── Bonus drop chances ───────────────────────────────────────────────────────
// Applied on top of the base drop for blocks with special drop flags
export const BONUS_SCRAP_CHANCE   = 0.35;
export const BONUS_CRYSTAL_CHANCE = 0.40;
export const BONUS_RUNE_CHANCE    = 0.30;
export const BONUS_SHADOW_CHANCE  = 0.30;

// ─── Goblin King ──────────────────────────────────────────────────────────────
export const GOBLIN_KING_GOLD_REWARD  = 100;
export const GOBLIN_KING_SPAWN_CHANCE = 0.7;
export const GOBLIN_KING_TIMEOUT_MS   = 4000;

// ─── Goblin message ───────────────────────────────────────────────────────────
export const GOBLIN_MESSAGE_CHANCE = 0.12;  // per-click probability of showing a message

// ─── Game loop timings ────────────────────────────────────────────────────────
export const AUTO_GOLD_TICK_MS    = 100;
export const DAILY_RESET_CHECK_MS = 60_000;
export const GOBLIN_KING_CHECK_MS = 30_000;

// ─── Emerald prestige multiplier tiers ────────────────────────────────────────
// Three-tier scaling so early emeralds feel impactful without snowballing infinitely
export const EMERALD_TIER_1_CAP   = 10;    // first 10 emeralds are tier 1
export const EMERALD_TIER_2_COUNT = 15;    // next 15 (11–25) are tier 2
export const EMERALD_TIER_1_BONUS = 0.10;  // +10% multiplier per tier-1 emerald
export const EMERALD_TIER_2_BONUS = 0.12;  // +12% multiplier per tier-2 emerald
export const EMERALD_TIER_3_BONUS = 0.15;  // +15% multiplier per tier-3 emerald (26+)

// ─── Prestige run bonuses ─────────────────────────────────────────────────────
export const PRESTIGE_BONUS_BLOCK_THRESHOLDS = [50, 100]; // extra emerald awarded at these block-break counts
export const PRESTIGE_PERCLICK_HEADSTART     = 0.3;       // click power = 1 + emeralds * this

// ─── UI material display thresholds ──────────────────────────────────────────
// Show the material row once the player is close to unlocking blocks that drop it,
// so the resource doesn't appear from nowhere on first drop
export const MAT_DISPLAY_EMERALD_RUNE   = 30;
export const MAT_DISPLAY_EMERALD_SHADOW = 45;
export const MAT_DISPLAY_EMERALD_DRAGON = 90;

// ─── Block Types ──────────────────────────────────────────────────────────────
// unlockEmeralds: total ancestral emeralds required for this block to appear
export const BLOCK_TYPES = {
  // Normal — available from the start
  stone:         { name: 'Stone',          maxHp: 55,   goldMin: 3,    goldMax: 8,    unlockEmeralds: 0   },
  copper:        { name: 'Copper',         maxHp: 100,  goldMin: 10,   goldMax: 18,   unlockEmeralds: 0   },
  iron:          { name: 'Iron',           maxHp: 180,  goldMin: 20,   goldMax: 35,   unlockEmeralds: 0   },
  gold:          { name: 'Gold',           maxHp: 300,  goldMin: 40,   goldMax: 65,   unlockEmeralds: 0   },

  // Normal — prestige-unlocked
  platinum:      { name: 'Platinum',       maxHp: 500,  goldMin: 80,   goldMax: 130,  unlockEmeralds: 5,   dropBonusScrap: true },
  mythril:       { name: 'Mythril',        maxHp: 800,  goldMin: 150,  goldMax: 235,  unlockEmeralds: 12  },
  runeStone:     { name: 'Rune Stone',     maxHp: 1200, goldMin: 300,  goldMax: 460,  unlockEmeralds: 35,  dropRune: true },
  chaosFragment: { name: 'Chaos Fragment', maxHp: 2000, goldMin: 600,  goldMax: 950,  unlockEmeralds: 70  },

  // Rare — low-weight special drops
  gemstone:      { name: 'Gemstone',       maxHp: 400,  goldMin: 100,  goldMax: 200,  unlockEmeralds: 0,   rare: true, dropCrystals: true },
  ancient:       { name: 'Ancient Stone',  maxHp: 600,  goldMin: 200,  goldMax: 400,  unlockEmeralds: 0,   rare: true, dropAncient: true },
  voidCrystal:   { name: 'Void Crystal',   maxHp: 1000, goldMin: 400,  goldMax: 650,  unlockEmeralds: 20,  rare: true, dropCrystals: true },
  shadowOre:     { name: 'Shadow Ore',     maxHp: 1500, goldMin: 500,  goldMax: 820,  unlockEmeralds: 50,  rare: true, dropShadow: true },
  dragonVein:    { name: 'Dragon Vein',    maxHp: 2500, goldMin: 800,  goldMax: 1250, unlockEmeralds: 100, rare: true, dropDragon: true },
  astralCrystal: { name: 'Astral Crystal', maxHp: 4000, goldMin: 1500, goldMax: 2600, unlockEmeralds: 150, rare: true, dropAll: true, dropBonus: 2, massiveGold: true },
  celestialCore: { name: 'Celestial Core', maxHp: 8000, goldMin: 3000, goldMax: 5200, unlockEmeralds: 250, rare: true, dropAll: true, dropBonus: 3, massiveGold: true },
};

// ─── Block Spawn Weights ──────────────────────────────────────────────────────
// Controls how the weighted-random block selector evolves as blocks are broken.
//
// Normal blocks (non-rare, non-stone):
//   weight = Math.min((n - rampStart) * rampRate, maxW)
//   copper uses rampStart:0 so it benefits from blocks broken before it appears
//
// Stone (decaying):
//   weight = Math.max(startW - n * decayRate, minW)
//
// Rare blocks (fixed base + spelunker talent scaling):
//   weight = baseW + spelunkerBonus * spelunkerScale
export const BLOCK_SPAWN_CONFIG = {
  stone:         { minBlocks: 0,   startW: 60,  decayRate: 0.8, minW: 4                          },
  copper:        { minBlocks: 5,   rampStart: 0,  rampRate: 2.0, maxW: 35 },
  iron:          { minBlocks: 15,  rampStart: 15, rampRate: 1.5, maxW: 28 },
  gold:          { minBlocks: 25,  rampStart: 25, rampRate: 0.8, maxW: 20 },
  platinum:      { minBlocks: 30,  rampStart: 30, rampRate: 0.6, maxW: 18 },
  mythril:       { minBlocks: 35,  rampStart: 35, rampRate: 0.4, maxW: 12 },
  runeStone:     { minBlocks: 50,  rampStart: 50, rampRate: 0.3, maxW: 10 },
  chaosFragment: { minBlocks: 60,  rampStart: 60, rampRate: 0.2, maxW: 8  },
  gemstone:      { minBlocks: 25,  baseW: 3,   spelunkerScale: 50 },
  ancient:       { minBlocks: 40,  baseW: 1.5, spelunkerScale: 30 },
  voidCrystal:   { minBlocks: 50,  baseW: 2,   spelunkerScale: 20 },
  shadowOre:     { minBlocks: 60,  baseW: 1.5, spelunkerScale: 15 },
  dragonVein:    { minBlocks: 80,  baseW: 1,   spelunkerScale: 10 },
  astralCrystal: { minBlocks: 100, baseW: 0.5, spelunkerScale: 5  },
  celestialCore: { minBlocks: 150, baseW: 0.3, spelunkerScale: 3  },
};

// ─── Equipment Config ─────────────────────────────────────────────────────────
// gold/scrap/crystals/ancient/rune/shadow/dragon = base cost at level 0→1
// scale = cost multiplier per level
// unlockEmeralds = 0 means always visible
// effectPerLevel = the numeric magnitude of the bonus per level (used by logic via /100)
export const EQUIPMENT_CONFIG = {
  miningPick: {
    maxLevel: 5, effectPerLevel: 4, scale: 1.65, unlockEmeralds: 0,
    gold: 60,  scrap: 2, crystals: 0, ancient: 0, rune: 0, shadow: 0, dragon: 0
  },
  goldRing: {
    maxLevel: 5, effectPerLevel: 12, scale: 1.70, unlockEmeralds: 0,
    gold: 100, scrap: 4, crystals: 1, ancient: 0, rune: 0, shadow: 0, dragon: 0
  },
  luckyCharm: {
    maxLevel: 5, effectPerLevel: 4, scale: 1.70, unlockEmeralds: 0,
    gold: 150, scrap: 5, crystals: 2, ancient: 1, rune: 0, shadow: 0, dragon: 0
  },
  goblinPact: {
    maxLevel: 5, effectPerLevel: 10, scale: 1.70, unlockEmeralds: 0,
    gold: 180, scrap: 4, crystals: 2, ancient: 1, rune: 0, shadow: 0, dragon: 0
  },
  runeGauntlet: {
    maxLevel: 5, effectPerLevel: 20, scale: 1.80, unlockEmeralds: 35,
    gold: 400, scrap: 8, crystals: 5, ancient: 3, rune: 2, shadow: 0, dragon: 0
  },
  shadowVeil: {
    maxLevel: 5, effectPerLevel: 15, scale: 1.80, unlockEmeralds: 50,
    gold: 600, scrap: 10, crystals: 7, ancient: 5, rune: 3, shadow: 2, dragon: 0
  },
  dragonAegis: {
    maxLevel: 5, effectPerLevel: 25, scale: 1.90, unlockEmeralds: 100,
    gold: 900, scrap: 15, crystals: 10, ancient: 7, rune: 5, shadow: 3, dragon: 2
  }
};

// ─── Cave Talents ─────────────────────────────────────────────────────────────
// effectPerLevel = the numeric magnitude of the bonus (used by logic via /100)
export const PRESTIGE_TALENTS = {
  greed: {
    name: 'Greed',
    desc: '+8% all gold income per level',
    effectPerLevel: 8,
    maxLevel: 5,
    costs: [1, 2, 3, 5, 8]
  },
  fortitude: {
    name: 'Fortitude',
    desc: '+15% mining damage per level',
    effectPerLevel: 15,
    maxLevel: 5,
    costs: [1, 2, 3, 5, 8]
  },
  fortune: {
    name: 'Fortune',
    desc: '+10% material drop rate per level',
    effectPerLevel: 10,
    maxLevel: 5,
    costs: [1, 2, 4, 6, 10]
  },
  spelunker: {
    name: 'Spelunker',
    desc: '+1% rare block chance per level',
    effectPerLevel: 1,
    maxLevel: 5,
    costs: [2, 3, 5, 8, 12]
  },
  momentum: {
    name: 'Momentum',
    desc: '+5% auto-mining speed per level',
    effectPerLevel: 5,
    maxLevel: 5,
    costs: [1, 2, 3, 5, 8]
  }
};

// ─── Milestones ───────────────────────────────────────────────────────────────
// goal.type: 'blocks' | 'gold' | 'gems' | 'ancient'
// reward:    { gold?, scrap?, crystals?, blockGoldPercent? }
export const MILESTONES = [
  { id: 'first_block',  name: 'First Block',           goal: { type: 'blocks',  value: 1   }, reward: { gold: 5 } },
  { id: 'blocks_10',    name: 'Novice Miner (10)',      goal: { type: 'blocks',  value: 10  }, reward: { gold: 25 } },
  { id: 'blocks_50',    name: 'Seasoned Miner (50)',    goal: { type: 'blocks',  value: 50  }, reward: { crystals: 2 } },
  { id: 'blocks_100',   name: 'Veteran Miner (100)',    goal: { type: 'blocks',  value: 100 }, reward: { blockGoldPercent: 10 } },
  { id: 'blocks_250',   name: 'Master Miner (250)',     goal: { type: 'blocks',  value: 250 }, reward: { blockGoldPercent: 15 } },
  { id: 'blocks_500',   name: 'Cave Legend (500)',      goal: { type: 'blocks',  value: 500 }, reward: { blockGoldPercent: 20 } },
  { id: 'gold_500',     name: 'Gold Finder (500g)',     goal: { type: 'gold',    value: 500 }, reward: { scrap: 3 } },
  { id: 'gold_5000',    name: 'Gold Hoarder (5k)',      goal: { type: 'gold',    value: 5000 }, reward: { crystals: 3 } },
  { id: 'gold_50000',   name: 'Gold Baron (50k)',       goal: { type: 'gold',    value: 50000 }, reward: { blockGoldPercent: 10 } },
  { id: 'gold_500000',  name: 'Cave Tycoon (500k)',     goal: { type: 'gold',    value: 500000 }, reward: { blockGoldPercent: 15 } },
  { id: 'gems_5',       name: 'Gem Hunter (5)',         goal: { type: 'gems',    value: 5  }, reward: { crystals: 5 } },
  { id: 'gems_20',      name: 'Gem Collector (20)',     goal: { type: 'gems',    value: 20 }, reward: { crystals: 10 } },
  { id: 'ancient_3',    name: 'Ancient Collector (3)',  goal: { type: 'ancient', value: 3  }, reward: { gold: 200 } },
  { id: 'ancient_10',   name: 'Ancient Scholar (10)',   goal: { type: 'ancient', value: 10 }, reward: { scrap: 8 } },
];

// ─── Daily Milestones ─────────────────────────────────────────────────────────
// goal.type: 'blocksToday' | 'goldToday' | 'rareToday' | 'prestigeToday'
// reward:    { gold?, scrap?, crystals?, prestigeTokens? }
export const DAILY_MILESTONES = [
  { id: 'daily_blocks_20',  name: 'Mine 20 blocks today',    goal: { type: 'blocksToday',   value: 20   }, reward: { scrap: 5 } },
  { id: 'daily_blocks_100', name: 'Mine 100 blocks today',   goal: { type: 'blocksToday',   value: 100  }, reward: { crystals: 2 } },
  { id: 'daily_gold_1000',  name: 'Earn 1,000 gold today',   goal: { type: 'goldToday',     value: 1000 }, reward: { scrap: 3 } },
  { id: 'daily_gold_10000', name: 'Earn 10,000 gold today',  goal: { type: 'goldToday',     value: 10000}, reward: { prestigeTokens: 1 } },
  { id: 'daily_rare_1',     name: 'Mine a rare block today', goal: { type: 'rareToday',     value: 1    }, reward: { crystals: 3 } },
  { id: 'daily_prestige_1', name: 'Travel deeper once',      goal: { type: 'prestigeToday', value: 1    }, reward: { prestigeTokens: 2 } },
];

// ─── Goblin flavour text ──────────────────────────────────────────────────────
export const goblinMessages = [
  'More gold for the goblin horde!',
  "Oi! That's my cave!",
  'Dig faster, human!',
  'My precious shinies...',
  'The rocks smell like gold today!',
  'BOOOOOOM! Heh heh!',
  "Don't tell the Goblin King I'm helping you.",
  'I found a worm. Is worm gold? No? I keep.',
  'This cave goes very, very deep...',
  'CRIIIT! That one hurt even ME!',
  'Every crystal is a goblin tear. Just kidding... maybe.',
  'Platinum?! The fancy goblins will be jealous.',
  'Keep digging. The ancient ones are watching.',
  'More scrap for the goblin collectors!',
  'Lucky strike! The cave gods smile upon you.',
];
