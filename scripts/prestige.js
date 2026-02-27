import { state, saveGame, getPrestigeMultiplier, getPrestigeThreshold } from './state.js';
import {
  PRESTIGE_TALENTS,
  PRESTIGE_BONUS_BLOCK_THRESHOLDS,
  PRESTIGE_PERCLICK_HEADSTART,
  BLOCK_TYPES
} from './config.js';
import { updateUI } from './ui.js';
import { playPrestigeSound } from './audio.js';
import { checkAllMilestones, checkDailyMilestones } from './milestones.js';
import { spawnBlock } from './combatAndMining.js';
import { formatGold } from './utils.js';

// ─── Prestige (Rebirth) ──────────────────────────────────────────────────────

function getNextBlockUnlock(currentEmeralds) {
  const entries = Object.entries(BLOCK_TYPES)
    .filter(([, v]) => v.unlockEmeralds > currentEmeralds)
    .sort((a, b) => a[1].unlockEmeralds - b[1].unlockEmeralds);
  if (entries.length === 0) return null;
  return { emeralds: entries[0][1].unlockEmeralds, name: entries[0][1].name };
}

export function showPrestigeSummary(runStats) {
  const total = state.ancestralEmeralds;
  const bonusPct = ((getPrestigeMultiplier() - 1) * 100).toFixed(0);
  const msgEl   = document.getElementById('prestigeOverlayMessage');
  const overlay = document.getElementById('prestigeOverlay');
  if (!msgEl || !overlay) return;

  const nextUnlock = getNextBlockUnlock(total);
  const bonusLine  = runStats.bonusEmeralds > 0
    ? ` + <strong>${runStats.bonusEmeralds}</strong> bonus`
    : '';
  const unlockLine = nextUnlock
    ? `<p class="unlock-hint">Next unlock at <strong>${nextUnlock.emeralds}</strong> emeralds: <em>${nextUnlock.name}</em></p>`
    : '<p class="unlock-hint">All block tiers unlocked! 🏆</p>';

  msgEl.innerHTML = `
    <div class="prestige-run-stats">
      <span>Run ${state.prestigeCount}</span>
      <span>${runStats.blocksBroken} blocks mined</span>
      <span>${formatGold(runStats.goldEarned)} gold earned</span>
    </div>
    <p>Emeralds earned: <strong>${runStats.emeraldsGained}</strong>${bonusLine}</p>
    <p>Total: <strong>${total}</strong> emeralds · <strong>+1</strong> Cave Token</p>
    <p>Gold multiplier: <strong>+${bonusPct}%</strong></p>
    ${unlockLine}
  `;
  overlay.style.display = 'flex';

  const EMERALD_PULSE_MS = 600;
  const el = document.querySelector('.prestige-stats');
  if (el) {
    el.classList.add('emerald-pulse');
    setTimeout(() => el && el.classList.remove('emerald-pulse'), EMERALD_PULSE_MS);
  }
}

export function doPrestige() {
  const threshold = getPrestigeThreshold();
  if (state.gold < threshold) return;

  const emeraldsGained = Math.floor(state.gold / threshold);

  // Bonus emeralds for run performance — thresholds reward players who mine more before prestiging
  let bonusEmeralds = 0;
  for (const t of PRESTIGE_BONUS_BLOCK_THRESHOLDS) {
    if (state.blocksBroken >= t) bonusEmeralds += 1;
  }
  if (state.gemstonesBroken > 0 || state.ancientsBroken > 0) bonusEmeralds += 1;

  const totalEmeralds = emeraldsGained + bonusEmeralds;

  const runStats = {
    blocksBroken: state.blocksBroken,
    goldEarned: state.gold,
    emeraldsGained,
    bonusEmeralds
  };

  state.ancestralEmeralds += totalEmeralds;
  state.prestigeCount++;
  state.prestigeTokens = (state.prestigeTokens || 0) + 1;

  state.gold = 0;
  state.perClick = 1 + Math.floor(state.ancestralEmeralds * PRESTIGE_PERCLICK_HEADSTART);
  state.blocksBroken = 0;
  state.gemstonesBroken = 0;
  state.ancientsBroken = 0;
  state.platinumBroken = 0;
  state.mythrilBroken = 0;

  for (const id of Object.keys(state.upgrades)) {
    state.upgrades[id].count = 0;
  }

  if (state.dailyStats) {
    state.dailyStats.prestigedToday = (state.dailyStats.prestigedToday || 0) + 1;
  }

  spawnBlock();
  saveGame();
  updateUI();
  playPrestigeSound();
  showPrestigeSummary(runStats);
  checkAllMilestones();
  checkDailyMilestones();
}

// ─── Cave Talents ────────────────────────────────────────────────────────────

export function buyTalent(id) {
  const cfg = PRESTIGE_TALENTS[id];
  if (!cfg) return;
  const lv = state.talents[id] || 0;
  if (lv >= cfg.maxLevel) return;
  const cost = cfg.costs[lv];
  if ((state.prestigeTokens || 0) < cost) return;
  state.prestigeTokens -= cost;
  state.talents[id] = lv + 1;
  saveGame();
  updateUI();
}
