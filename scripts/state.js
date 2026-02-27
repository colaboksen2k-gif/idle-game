import {
  SAVE_KEY,
  EQUIPMENT_CONFIG,
  PRESTIGE_TALENTS,
  PRESTIGE_THRESHOLD,
  PRESTIGE_COST_SCALE,
  EMERALD_TIER_1_CAP,
  EMERALD_TIER_2_COUNT,
  EMERALD_TIER_1_BONUS,
  EMERALD_TIER_2_BONUS,
  EMERALD_TIER_3_BONUS
} from './config.js';
import { applySavedSoundMuted, isSoundMuted } from './audio.js';

export const state = {
  gold: 0,
  perClick: 1,
  shinyScrap: 0,
  crystals: 0,
  ancientFragments: 0,
  runeShards: 0,
  shadowDust: 0,
  dragonScales: 0,
  ancestralEmeralds: 0,
  prestigeTokens: 0,
  blocksBroken: 0,
  gemstonesBroken: 0,
  ancientsBroken: 0,
  platinumBroken: 0,
  mythrilBroken: 0,
  prestigeCount: 0,
  milestonesCompleted: {},
  dailyMilestonesCompleted: {},
  dailyStats: {
    date: '',
    blocksMinedToday: 0,
    goldEarnedToday: 0,
    rareBrokenToday: 0,
    prestigedToday: 0
  },
  currentBlock: null,
  equipment: {
    miningPick: 0, goldRing: 0, luckyCharm: 0, goblinPact: 0,
    runeGauntlet: 0, shadowVeil: 0, dragonAegis: 0
  },
  talents: {
    greed: 0, fortitude: 0, fortune: 0, spelunker: 0, momentum: 0
  },
  upgrades: {
    clickPower: { count: 0, cost: 15,  inc: 1 },
    autoClick:  { count: 0, cost: 80,  inc: 1 },
    mine:       { count: 0, cost: 280, inc: 5 },
    multiplier: { count: 0, cost: 650, inc: 0 },
    scrapClick: { count: 0, cost: 12,  inc: 5, currency: 'scrap' }
  }
};

const INITIAL_STATE = JSON.parse(JSON.stringify(state));

export function getMultiplier() {
  return 1 + (state.upgrades.multiplier?.count || 0);
}

// Tiered emerald scaling: 0–TIER1_CAP → TIER1_BONUS/ea, then TIER2_COUNT more at TIER2_BONUS,
// then TIER3_BONUS/ea thereafter. Greed talent and Dragon Aegis add flat % on top.
export function getPrestigeMultiplier() {
  const e = state.ancestralEmeralds;
  const tier1 = Math.min(e, EMERALD_TIER_1_CAP) * EMERALD_TIER_1_BONUS;
  const tier2 = Math.min(Math.max(e - EMERALD_TIER_1_CAP, 0), EMERALD_TIER_2_COUNT) * EMERALD_TIER_2_BONUS;
  const tier3 = Math.max(e - EMERALD_TIER_1_CAP - EMERALD_TIER_2_COUNT, 0) * EMERALD_TIER_3_BONUS;
  const greedBonus  = (state.talents?.greed || 0) * (PRESTIGE_TALENTS.greed.effectPerLevel / 100);
  const dragonBonus = (state.equipment?.dragonAegis || 0) * (EQUIPMENT_CONFIG.dragonAegis.effectPerLevel / 100);
  return 1 + tier1 + tier2 + tier3 + greedBonus + dragonBonus;
}

// Scales with prestigeCount so each run requires more gold than the last
export function getPrestigeThreshold() {
  return Math.floor(PRESTIGE_THRESHOLD * Math.pow(PRESTIGE_COST_SCALE, state.prestigeCount));
}

export function saveGame() {
  const save = {
    gold: state.gold,
    perClick: state.perClick,
    shinyScrap: state.shinyScrap,
    crystals: state.crystals,
    ancientFragments: state.ancientFragments,
    runeShards: state.runeShards,
    shadowDust: state.shadowDust,
    dragonScales: state.dragonScales,
    ancestralEmeralds: state.ancestralEmeralds,
    prestigeTokens: state.prestigeTokens,
    blocksBroken: state.blocksBroken,
    gemstonesBroken: state.gemstonesBroken,
    ancientsBroken: state.ancientsBroken,
    platinumBroken: state.platinumBroken,
    mythrilBroken: state.mythrilBroken,
    prestigeCount: state.prestigeCount,
    milestonesCompleted: JSON.parse(JSON.stringify(state.milestonesCompleted)),
    dailyMilestonesCompleted: JSON.parse(JSON.stringify(state.dailyMilestonesCompleted)),
    dailyStats: JSON.parse(JSON.stringify(state.dailyStats)),
    currentBlock: state.currentBlock ? JSON.parse(JSON.stringify(state.currentBlock)) : null,
    equipment: JSON.parse(JSON.stringify(state.equipment)),
    talents: JSON.parse(JSON.stringify(state.talents)),
    upgrades: JSON.parse(JSON.stringify(state.upgrades)),
    soundMuted: isSoundMuted()
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    // ignore
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const save = JSON.parse(raw);

    state.gold             = save.gold ?? 0;
    state.perClick         = save.perClick ?? 1;
    state.shinyScrap       = save.shinyScrap ?? 0;
    state.crystals         = save.crystals ?? 0;
    state.ancientFragments = save.ancientFragments ?? 0;
    state.runeShards       = save.runeShards ?? 0;
    state.shadowDust       = save.shadowDust ?? 0;
    state.dragonScales     = save.dragonScales ?? 0;
    state.ancestralEmeralds = save.ancestralEmeralds ?? 0;
    state.prestigeTokens   = save.prestigeTokens ?? 0;
    state.blocksBroken     = save.blocksBroken ?? 0;
    state.gemstonesBroken  = save.gemstonesBroken ?? 0;
    state.ancientsBroken   = save.ancientsBroken ?? 0;
    state.platinumBroken   = save.platinumBroken ?? 0;
    state.mythrilBroken    = save.mythrilBroken ?? 0;
    state.prestigeCount    = save.prestigeCount ?? 0;
    state.milestonesCompleted =
      save.milestonesCompleted && typeof save.milestonesCompleted === 'object'
        ? save.milestonesCompleted
        : {};
    state.dailyMilestonesCompleted =
      save.dailyMilestonesCompleted && typeof save.dailyMilestonesCompleted === 'object'
        ? save.dailyMilestonesCompleted
        : {};
    if (save.dailyStats && typeof save.dailyStats === 'object') {
      Object.assign(state.dailyStats, save.dailyStats);
    }
    state.currentBlock = save.currentBlock ?? null;

    if (save.equipment) {
      Object.keys(state.equipment).forEach((k) => {
        const v = save.equipment[k];
        if (v === true) state.equipment[k] = 1;
        else if (typeof v === 'number') {
          const max = EQUIPMENT_CONFIG[k] ? EQUIPMENT_CONFIG[k].maxLevel : 5;
          state.equipment[k] = Math.min(v, max);
        } else {
          state.equipment[k] = 0;
        }
      });
    }

    if (save.talents && typeof save.talents === 'object') {
      Object.keys(state.talents).forEach((k) => {
        state.talents[k] = save.talents[k] ?? 0;
      });
    }

    if (save.upgrades) {
      for (const id of Object.keys(state.upgrades)) {
        if (save.upgrades[id] && typeof save.upgrades[id].count === 'number') {
          state.upgrades[id].count = save.upgrades[id].count;
        }
      }
    }

    applySavedSoundMuted(save.soundMuted ?? false);
  } catch (e) {
    // ignore
  }
}

export function resetGame() {
  const wasMuted = isSoundMuted();

  Object.keys(state).forEach((key) => {
    const snapshot = INITIAL_STATE[key];
    state[key] =
      snapshot && typeof snapshot === 'object'
        ? JSON.parse(JSON.stringify(snapshot))
        : snapshot;
  });

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }

  applySavedSoundMuted(wasMuted);
  saveGame();
}
