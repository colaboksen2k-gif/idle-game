import { addGold, getAutoBaseAmount, maybeSpawnGoblinKing } from './combatAndMining.js';
import { checkDailyReset, checkDailyMilestones } from './milestones.js';
import { AUTO_GOLD_TICK_MS, DAILY_RESET_CHECK_MS, GOBLIN_KING_CHECK_MS } from './config.js';

export function startGameLoops() {
  setInterval(() => {
    const base = getAutoBaseAmount();
    if (base > 0) addGold(base);
  }, AUTO_GOLD_TICK_MS);

  setInterval(() => {
    checkDailyReset();
    checkDailyMilestones();
  }, DAILY_RESET_CHECK_MS);

  setInterval(() => {
    maybeSpawnGoblinKing();
  }, GOBLIN_KING_CHECK_MS);
}
