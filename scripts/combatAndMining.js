import {
  BLOCK_TYPES,
  BLOCK_SPAWN_CONFIG,
  EQUIPMENT_CONFIG,
  PRESTIGE_TALENTS,
  MINING_CRIT_CHANCE,
  MINING_CRIT_MULT,
  BLOCK_DOUBLE_GOLD_CHANCE,
  BLOCK_SCRAP_CHANCE,
  SCRAP_DROP_CHANCE,
  LUCKY_STRIKE_CHANCE,
  LUCKY_STRIKE_MULT,
  GOBLIN_SACK_CHANCE,
  GOBLIN_SACK_GOLD,
  MASSIVE_GOLD_MULT,
  PRESTIGE_RUN_GOLD_BONUS,
  BONUS_SCRAP_CHANCE,
  BONUS_CRYSTAL_CHANCE,
  BONUS_RUNE_CHANCE,
  BONUS_SHADOW_CHANCE,
  GOBLIN_KING_GOLD_REWARD,
  GOBLIN_KING_SPAWN_CHANCE,
  GOBLIN_KING_TIMEOUT_MS,
  AUTO_GOLD_TICK_MS,
  UPGRADE_SCALE
} from './config.js';
import { state, getMultiplier, getPrestigeMultiplier, saveGame } from './state.js';
import {
  updateBlockUI,
  updateUI,
  showDmgPopup,
  showEventPopup,
  showScrapPopup,
  showRandomGoblinMessage,
  showBlockBreakParticles
} from './ui.js';
import { playMagic, playBlockBreak, playGemBreak, playAncientBreak, playThud, playChaChing } from './audio.js';
import { checkAllMilestones, checkDailyMilestones, getMilestoneBlockGoldPercent } from './milestones.js';

let goblinKingEl = null;

export function addGold(amount) {
  const mult = getMultiplier() * getPrestigeMultiplier();
  const gained = Math.floor(amount * mult);
  state.gold += gained;
  if (state.dailyStats) state.dailyStats.goldEarnedToday = (state.dailyStats.goldEarnedToday || 0) + gained;
  checkAllMilestones();
  checkDailyMilestones();
  saveGame();
  updateUI();
}

export function getMiningDamage() {
  let dmg = state.perClick * getMultiplier() * getPrestigeMultiplier();

  const pickLv = state.equipment.miningPick || 0;
  dmg += EQUIPMENT_CONFIG.miningPick.effectPerLevel * pickLv;

  const runeLv = state.equipment.runeGauntlet || 0;
  if (runeLv > 0) dmg *= 1 + runeLv * (EQUIPMENT_CONFIG.runeGauntlet.effectPerLevel / 100);

  const fortitude = state.talents?.fortitude || 0;
  if (fortitude > 0) dmg *= 1 + fortitude * (PRESTIGE_TALENTS.fortitude.effectPerLevel / 100);

  let critChance = MINING_CRIT_CHANCE;
  const luckyLv = state.equipment.luckyCharm || 0;
  critChance += (EQUIPMENT_CONFIG.luckyCharm.effectPerLevel / 100) * luckyLv;
  const isCrit = Math.random() < critChance;
  if (isCrit) dmg *= MINING_CRIT_MULT;

  return { damage: Math.max(1, Math.floor(dmg)), isCrit };
}

// ─── Block Spawning ──────────────────────────────────────────────────────────
// Weight-based system; blocks require both a minimum blocks-broken count this
// run AND a minimum total ancestral-emerald count to appear.
// Weight formulas and all numeric parameters live in BLOCK_SPAWN_CONFIG.

export function getNextBlockType() {
  const n = state.blocksBroken;
  const e = state.ancestralEmeralds;
  const spelunkerBonus = (state.talents?.spelunker || 0) * (PRESTIGE_TALENTS.spelunker.effectPerLevel / 100);

  const candidates = [];

  for (const [type, spawn] of Object.entries(BLOCK_SPAWN_CONFIG)) {
    if (n < spawn.minBlocks) continue;
    const def = BLOCK_TYPES[type];
    if (def.unlockEmeralds > 0 && e < def.unlockEmeralds) continue;

    let w;
    if (spawn.startW !== undefined) {
      w = Math.max(spawn.startW - n * spawn.decayRate, spawn.minW);
    } else if (spawn.baseW !== undefined) {
      w = spawn.baseW + spelunkerBonus * spawn.spelunkerScale;
    } else {
      w = Math.min((n - spawn.rampStart) * spawn.rampRate, spawn.maxW);
    }
    candidates.push({ type, w });
  }

  if (candidates.length === 0) return 'stone';

  const totalW = candidates.reduce((s, c) => s + c.w, 0);
  let roll = Math.random() * totalW;
  for (const c of candidates) {
    roll -= c.w;
    if (roll <= 0) return c.type;
  }
  return candidates[candidates.length - 1].type;
}

export function spawnBlock() {
  const type = getNextBlockType();
  const def  = BLOCK_TYPES[type];
  state.currentBlock = {
    type,
    maxHp:          def.maxHp,
    hp:             def.maxHp,
    goldMin:        def.goldMin,
    goldMax:        def.goldMax,
    rare:           def.rare           || false,
    dropCrystals:   def.dropCrystals   || false,
    dropAncient:    def.dropAncient    || false,
    dropBonusScrap: def.dropBonusScrap || false,
    dropRune:       def.dropRune       || false,
    dropShadow:     def.dropShadow     || false,
    dropDragon:     def.dropDragon     || false,
    dropAll:        def.dropAll        || false,
    dropBonus:      def.dropBonus      || 1,
    massiveGold:    def.massiveGold    || false
  };
  updateBlockUI();
}

export function breakBlock() {
  if (!state.currentBlock) return;
  const b = state.currentBlock;

  if      (b.type === 'gemstone')      playGemBreak();
  else if (b.type === 'ancient')       playAncientBreak();
  else if (b.type === 'astralCrystal') playGemBreak();
  else if (b.type === 'celestialCore') playAncientBreak();
  else                                  playBlockBreak();

  // ── Gold ──────────────────────────────────────────────────────────────────
  let gold = b.goldMin + Math.floor(Math.random() * (b.goldMax - b.goldMin + 1));
  if (Math.random() < BLOCK_DOUBLE_GOLD_CHANCE) gold *= 2;

  const ringLv = state.equipment.goldRing || 0;
  if (ringLv > 0) gold = Math.floor(gold * (1 + (EQUIPMENT_CONFIG.goldRing.effectPerLevel / 100) * ringLv));

  const milestoneBonus = getMilestoneBlockGoldPercent();
  if (milestoneBonus > 0) gold = Math.floor(gold * (1 + milestoneBonus / 100));

  // Each completed prestige run permanently boosts block gold for future runs
  const prestigeRunBonus = 1 + (state.prestigeCount || 0) * PRESTIGE_RUN_GOLD_BONUS;
  gold = Math.floor(gold * prestigeRunBonus);

  if (b.massiveGold) gold = Math.floor(gold * MASSIVE_GOLD_MULT);

  addGold(gold);

  // ── Materials ─────────────────────────────────────────────────────────────
  const fortuneBonus = (state.talents?.fortune || 0) * (PRESTIGE_TALENTS.fortune.effectPerLevel / 100);
  const shadowVeilLv = (state.equipment?.shadowVeil || 0);
  const dropMult     = 1 + fortuneBonus + shadowVeilLv * (EQUIPMENT_CONFIG.shadowVeil.effectPerLevel / 100);

  const scrapChance = BLOCK_SCRAP_CHANCE * dropMult;
  if (Math.random() < scrapChance) {
    state.shinyScrap++;
    playMagic();
  }

  if (b.dropBonusScrap) {
    const extra = Math.random() < (BONUS_SCRAP_CHANCE * dropMult) ? 2 : 1;
    state.shinyScrap += extra;
    playMagic();
  }

  if (b.dropCrystals) {
    state.crystals += 1 + (Math.random() < BONUS_CRYSTAL_CHANCE * dropMult ? 1 : 0);
  }

  if (b.dropAncient) {
    state.ancientFragments += 1;
  }

  if (b.dropRune) {
    state.runeShards = (state.runeShards || 0) + 1 + (Math.random() < BONUS_RUNE_CHANCE * dropMult ? 1 : 0);
  }

  if (b.dropShadow) {
    state.shadowDust = (state.shadowDust || 0) + 1 + (Math.random() < BONUS_SHADOW_CHANCE * dropMult ? 1 : 0);
  }

  if (b.dropDragon) {
    state.dragonScales = (state.dragonScales || 0) + 1;
  }

  if (b.dropAll) {
    const bonus = Math.floor(b.dropBonus * dropMult);
    state.shinyScrap       += bonus;
    state.crystals         += bonus;
    state.ancientFragments += bonus;
    if (e_check(35)) state.runeShards   = (state.runeShards   || 0) + bonus;
    if (e_check(50)) state.shadowDust   = (state.shadowDust   || 0) + bonus;
    if (e_check(100))state.dragonScales = (state.dragonScales || 0) + bonus;
  }

  // ── Block type counters ───────────────────────────────────────────────────
  if (b.type === 'gemstone')      state.gemstonesBroken++;
  if (b.type === 'ancient')       state.ancientsBroken++;
  if (b.type === 'platinum')      state.platinumBroken = (state.platinumBroken || 0) + 1;
  if (b.type === 'mythril')       state.mythrilBroken  = (state.mythrilBroken  || 0) + 1;

  if (b.rare) {
    if (state.dailyStats) state.dailyStats.rareBrokenToday = (state.dailyStats.rareBrokenToday || 0) + 1;
  }

  if (Math.random() < GOBLIN_SACK_CHANCE) {
    const sackGold = Math.floor(GOBLIN_SACK_GOLD * getMultiplier() * getPrestigeMultiplier());
    state.gold += sackGold;
    showEventPopup('Goblin sack! +' + sackGold + ' gold', 'sack');
  }

  state.blocksBroken++;
  if (state.dailyStats) state.dailyStats.blocksMinedToday = (state.dailyStats.blocksMinedToday || 0) + 1;

  checkAllMilestones();
  checkDailyMilestones();
  spawnBlock();
  saveGame();
  updateUI();
}

function e_check(threshold) {
  return (state.ancestralEmeralds || 0) >= threshold;
}

export function getAutoBaseAmount() {
  let base =
    state.upgrades.autoClick.count * state.upgrades.autoClick.inc +
    state.upgrades.mine.count * state.upgrades.mine.inc;

  const pactLv = state.equipment.goblinPact || 0;
  if (pactLv > 0) base *= 1 + (EQUIPMENT_CONFIG.goblinPact.effectPerLevel / 100) * pactLv;

  const momentum = state.talents?.momentum || 0;
  if (momentum > 0) base *= 1 + momentum * (PRESTIGE_TALENTS.momentum.effectPerLevel / 100);

  // Scale per-second base down to a per-tick amount
  return base * (AUTO_GOLD_TICK_MS / 1000);
}

export function tryDropScrap(clickX, clickY) {
  if (Math.random() >= SCRAP_DROP_CHANCE) return;
  state.shinyScrap++;
  playMagic();
  showScrapPopup(clickX, clickY);
  updateUI();
}

export function handleMiningBlockClick(event) {
  if (!state.currentBlock) return;
  let { damage, isCrit } = getMiningDamage();
  const luckyStrike = Math.random() < LUCKY_STRIKE_CHANCE;
  if (luckyStrike) {
    damage = Math.max(1, damage * LUCKY_STRIKE_MULT);
    showEventPopup('Lucky strike!', 'lucky');
  }
  state.currentBlock.hp -= damage;
  showDmgPopup(event.clientX, event.clientY, damage, isCrit);
  tryDropScrap(event.clientX, event.clientY);
  showRandomGoblinMessage();
  if (state.currentBlock.hp <= 0) {
    showBlockBreakParticles();
    breakBlock();
  } else {
    updateBlockUI();
    saveGame();
  }
}

export function handleUpgradeClick(button) {
  const id       = button.dataset.id;
  const baseCost = parseInt(button.dataset.cost, 10);
  const inc      = parseInt(button.dataset.inc, 10);
  const upgrade  = state.upgrades[id];
  const currency = button.dataset.currency || 'gold';
  const cost     = currency === 'scrap'
    ? baseCost
    : Math.floor(baseCost * Math.pow(UPGRADE_SCALE, upgrade.count));

  const canAfford = currency === 'scrap' ? state.shinyScrap >= cost : state.gold >= cost;
  if (canAfford && (id !== 'scrapClick' || upgrade.count < 1)) {
    playChaChing();
    if (currency === 'scrap') state.shinyScrap -= cost;
    else                       state.gold       -= cost;
    upgrade.count++;
    if (id === 'clickPower') state.perClick += inc;
    if (id === 'scrapClick') state.perClick += inc;
    saveGame();
    updateUI();
    showRandomGoblinMessage();
  }
}

export function handleEquipmentClick(button) {
  const id  = button.dataset.eq;
  const row = button.closest('.equipment-item');
  if (!row) return;
  const lv  = state.equipment[id] || 0;
  const cfg = EQUIPMENT_CONFIG[id];
  if (!cfg) return;
  if (lv >= cfg.maxLevel) return;

  const mult = Math.pow(cfg.scale, lv);
  const cost = {
    gold:    Math.floor(cfg.gold     * mult),
    scrap:   Math.floor(cfg.scrap    * mult),
    crystals:Math.floor(cfg.crystals * mult),
    ancient: Math.floor(cfg.ancient  * mult),
    rune:    Math.floor(cfg.rune     * mult),
    shadow:  Math.floor(cfg.shadow   * mult),
    dragon:  Math.floor(cfg.dragon   * mult)
  };

  if (
    state.gold             < cost.gold     ||
    state.shinyScrap       < cost.scrap    ||
    state.crystals         < cost.crystals ||
    state.ancientFragments < cost.ancient  ||
    (state.runeShards   || 0) < cost.rune   ||
    (state.shadowDust   || 0) < cost.shadow ||
    (state.dragonScales || 0) < cost.dragon
  ) return;

  state.gold             -= cost.gold;
  state.shinyScrap       -= cost.scrap;
  state.crystals         -= cost.crystals;
  state.ancientFragments -= cost.ancient;
  state.runeShards        = (state.runeShards   || 0) - cost.rune;
  state.shadowDust        = (state.shadowDust   || 0) - cost.shadow;
  state.dragonScales      = (state.dragonScales || 0) - cost.dragon;

  state.equipment[id] = lv + 1;
  playChaChing();
  saveGame();
  updateUI();
}

// ─── Goblin King ─────────────────────────────────────────────────────────────

export function spawnGoblinKing() {
  if (goblinKingEl) return;
  playThud();
  const king = document.createElement('button');
  king.className = 'goblin-king';
  king.textContent = `👑 GOBLIN KING\nClick for ${GOBLIN_KING_GOLD_REWARD} gold!`;
  const KING_PADDING  = 80;
  const KING_BTN_SIZE = 120;
  king.style.left = KING_PADDING + Math.random() * (window.innerWidth  - KING_BTN_SIZE - KING_PADDING * 2) + 'px';
  king.style.top  = KING_PADDING + Math.random() * (window.innerHeight - KING_BTN_SIZE - KING_PADDING * 2) + 'px';
  king.addEventListener('click', () => {
    addGold(GOBLIN_KING_GOLD_REWARD);
    hideGoblinKing();
  });
  document.body.appendChild(king);
  goblinKingEl = king;
  setTimeout(hideGoblinKing, GOBLIN_KING_TIMEOUT_MS);
}

export function hideGoblinKing() {
  if (goblinKingEl) {
    goblinKingEl.remove();
    goblinKingEl = null;
  }
}

export function maybeSpawnGoblinKing() {
  if (Math.random() < GOBLIN_KING_SPAWN_CHANCE) spawnGoblinKing();
}
