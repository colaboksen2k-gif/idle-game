import { state, saveGame } from './state.js';
import { MILESTONES, DAILY_MILESTONES } from './config.js';

// Cached sum of blockGoldPercent rewards from completed milestones
let _blockGoldPercent = 0;

export function getMilestoneBlockGoldPercent() {
  return _blockGoldPercent;
}

function recomputeBlockGoldPercent() {
  _blockGoldPercent = 0;
  for (const m of MILESTONES) {
    if (state.milestonesCompleted[m.id] && m.reward.blockGoldPercent) {
      _blockGoldPercent += m.reward.blockGoldPercent;
    }
  }
}

function grantReward(reward) {
  if (reward.gold)           state.gold           += reward.gold;
  if (reward.scrap)          state.shinyScrap      = (state.shinyScrap      || 0) + reward.scrap;
  if (reward.crystals)       state.crystals        = (state.crystals        || 0) + reward.crystals;
  if (reward.prestigeTokens) state.prestigeTokens  = (state.prestigeTokens  || 0) + reward.prestigeTokens;
}

export function checkAllMilestones() {
  for (const m of MILESTONES) {
    if (state.milestonesCompleted[m.id]) continue;

    let met = false;
    switch (m.goal.type) {
      case 'blocks':  met = (state.blocksBroken   || 0) >= m.goal.value; break;
      case 'gold':    met = (state.gold            || 0) >= m.goal.value; break;
      case 'gems':    met = (state.gemstonesBroken || 0) >= m.goal.value; break;
      case 'ancient': met = (state.ancientsBroken  || 0) >= m.goal.value; break;
    }

    if (met) {
      state.milestonesCompleted[m.id] = true;
      grantReward(m.reward);
    }
  }
  recomputeBlockGoldPercent();
}

export function checkDailyMilestones() {
  for (const m of DAILY_MILESTONES) {
    if (state.dailyMilestonesCompleted[m.id]) continue;

    let met = false;
    switch (m.goal.type) {
      case 'blocksToday':   met = (state.dailyStats?.blocksMinedToday || 0) >= m.goal.value; break;
      case 'goldToday':     met = (state.dailyStats?.goldEarnedToday  || 0) >= m.goal.value; break;
      case 'rareToday':     met = (state.dailyStats?.rareBrokenToday  || 0) >= m.goal.value; break;
      case 'prestigeToday': met = (state.dailyStats?.prestigedToday   || 0) >= m.goal.value; break;
    }

    if (met) {
      state.dailyMilestonesCompleted[m.id] = true;
      grantReward(m.reward);
    }
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function checkDailyReset() {
  const today = todayKey();
  if (!state.dailyStats) {
    state.dailyStats = {
      date: today,
      blocksMinedToday: 0,
      goldEarnedToday:  0,
      rareBrokenToday:  0,
      prestigedToday:   0
    };
    return;
  }
  if (state.dailyStats.date !== today) {
    state.dailyStats.date             = today;
    state.dailyStats.blocksMinedToday = 0;
    state.dailyStats.goldEarnedToday  = 0;
    state.dailyStats.rareBrokenToday  = 0;
    state.dailyStats.prestigedToday   = 0;
    state.dailyMilestonesCompleted    = {};
    saveGame();
  }
}
