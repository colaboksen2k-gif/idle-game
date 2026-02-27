import { state, getMultiplier, getPrestigeMultiplier, getPrestigeThreshold } from './state.js';
import {
  BLOCK_TYPES,
  EQUIPMENT_CONFIG,
  UPGRADE_SCALE,
  MILESTONES,
  DAILY_MILESTONES,
  PRESTIGE_TALENTS,
  goblinMessages,
  GOBLIN_MESSAGE_CHANCE,
  MAT_DISPLAY_EMERALD_RUNE,
  MAT_DISPLAY_EMERALD_SHADOW,
  MAT_DISPLAY_EMERALD_DRAGON
} from './config.js';
import { formatGold } from './utils.js';

// ─── UI layout constants ──────────────────────────────────────────────────────
// These control visual presentation only — not game balance
const HP_HIGH_PCT              = 60;   // % HP above which bar shows as high (green)
const HP_MID_PCT               = 30;   // % HP above which bar shows as mid (yellow)
const DMG_POPUP_OFFSET_X       = 30;   // px left of click position
const DMG_POPUP_OFFSET_Y       = 40;   // px above click position
const DMG_POPUP_MS             = 900;
const EVENT_POPUP_MS           = 1400;
const SCRAP_POPUP_OFFSET_X     = 40;   // px left of click position
const SCRAP_POPUP_OFFSET_Y     = 12;   // px above click position
const SCRAP_POPUP_MS           = 1200;
const GOBLIN_MSG_FADE_OPACITY  = 0.6;
const GOBLIN_MSG_FADE_DELAY_MS = 4000;

const BLOCK_PARTICLE_COUNT          = 36;
const BLOCK_PARTICLE_RADIUS_MIN_PX  = 26;
const BLOCK_PARTICLE_RADIUS_MAX_PX  = 95;
const BLOCK_PARTICLE_LIFETIME_MS    = 1000;

// ─── Block UI ────────────────────────────────────────────────────────────────

export function updateBlockUI() {
  const b = state.currentBlock;
  if (!b) return;
  const el     = document.getElementById('miningBlock');
  const nameEl = document.getElementById('blockName');
  const hpText = document.getElementById('blockHpText');
  const hpFill = document.getElementById('blockHpFill');
  const artEl  = document.getElementById('blockArt');

  el.className = 'mining-block has-art ' + b.type;
  nameEl.textContent = BLOCK_TYPES[b.type].name;
  hpText.textContent = Math.max(0, b.hp) + ' / ' + b.maxHp;

  const pct = (Math.max(0, b.hp) / b.maxHp) * 100;
  hpFill.style.width = pct + '%';
  hpFill.className = 'block-hp-fill' + (pct > HP_HIGH_PCT ? ' high' : pct > HP_MID_PCT ? ' mid' : '');

  // Pixel-art image support — src set to img/blocks/{type}.png
  // If the file doesn't exist the onerror handler hides the element
  if (artEl) {
    artEl.src = 'img/blocks/' + b.type + '.png';
    artEl.style.display = '';
  }
}

// ─── Popups ──────────────────────────────────────────────────────────────────

export function showDmgPopup(x, y, dmg, isCrit) {
  const popup = document.createElement('div');
  popup.className = 'dmg-popup' + (isCrit ? ' crit' : '');
  popup.textContent = '-' + dmg + (isCrit ? ' CRIT!' : '');
  document.body.appendChild(popup);
  popup.style.left = x - DMG_POPUP_OFFSET_X + 'px';
  popup.style.top  = y - DMG_POPUP_OFFSET_Y + 'px';
  setTimeout(() => popup.remove(), DMG_POPUP_MS);
}

export function showEventPopup(text, type) {
  const popup = document.createElement('div');
  popup.className = 'event-popup ' + (type || '');
  popup.textContent = text;
  document.body.appendChild(popup);
  popup.style.left      = '50%';
  popup.style.top       = '40%';
  popup.style.transform = 'translate(-50%, -50%)';
  setTimeout(() => popup.remove(), EVENT_POPUP_MS);
}

export function showScrapPopup(clientX, clientY) {
  const popup = document.createElement('div');
  popup.className = 'scrap-popup';
  popup.textContent = '+1 Scrap!';
  document.body.appendChild(popup);
  popup.style.left = clientX - SCRAP_POPUP_OFFSET_X + 'px';
  popup.style.top  = clientY - SCRAP_POPUP_OFFSET_Y + 'px';
  setTimeout(() => popup.remove(), SCRAP_POPUP_MS);
}

export function showBlockBreakParticles() {
  const blockEl = document.getElementById('miningBlock');
  if (!blockEl) return;

  const rect = blockEl.getBoundingClientRect();
  const cx   = rect.left + rect.width / 2;
  const cy   = rect.top  + rect.height / 2;

  for (let i = 0; i < BLOCK_PARTICLE_COUNT; i++) {
    const particle = document.createElement('div');
    particle.className = 'block-particle';

    const baseAngle = (Math.PI * 2 * i) / BLOCK_PARTICLE_COUNT;
    const jitter    = (Math.random() - 0.5) * 0.9;
    const angle     = baseAngle + jitter;

    const radiusRange = BLOCK_PARTICLE_RADIUS_MAX_PX - BLOCK_PARTICLE_RADIUS_MIN_PX;
    const distance    = BLOCK_PARTICLE_RADIUS_MIN_PX + Math.random() * radiusRange;

    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    particle.style.left = cx + 'px';
    particle.style.top  = cy + 'px';
    particle.style.setProperty('--particle-tx', offsetX + 'px');
    particle.style.setProperty('--particle-ty', offsetY + 'px');

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), BLOCK_PARTICLE_LIFETIME_MS);
  }
}

export function showRandomGoblinMessage() {
  const el = document.getElementById('goblinMessage');
  if (!el) return;
  if (Math.random() < GOBLIN_MESSAGE_CHANCE) {
    el.textContent = goblinMessages[Math.floor(Math.random() * goblinMessages.length)];
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = String(GOBLIN_MSG_FADE_OPACITY); }, GOBLIN_MSG_FADE_DELAY_MS);
  }
}

// ─── Equipment cost helper ───────────────────────────────────────────────────

function getEquipmentCost(id) {
  const cfg = EQUIPMENT_CONFIG[id];
  const lv  = state.equipment[id] || 0;
  if (lv >= cfg.maxLevel) return null;
  const mult = Math.pow(cfg.scale, lv);
  return {
    gold:    Math.floor(cfg.gold     * mult),
    scrap:   Math.floor(cfg.scrap    * mult),
    crystals:Math.floor(cfg.crystals * mult),
    ancient: Math.floor(cfg.ancient  * mult),
    rune:    Math.floor(cfg.rune     * mult),
    shadow:  Math.floor(cfg.shadow   * mult),
    dragon:  Math.floor(cfg.dragon   * mult)
  };
}

// ─── Talents ─────────────────────────────────────────────────────────────────

function renderTalents() {
  const list   = document.getElementById('talentsList');
  const tokEl  = document.getElementById('prestigeTokens');
  if (!list) return;
  const tokens = state.prestigeTokens || 0;
  if (tokEl) tokEl.textContent = tokens;

  list.innerHTML = Object.entries(PRESTIGE_TALENTS).map(([id, cfg]) => {
    const lv    = state.talents?.[id] || 0;
    const maxed = lv >= cfg.maxLevel;
    const cost  = maxed ? null : cfg.costs[lv];
    const canAfford = !maxed && tokens >= cost;
    const btnHtml = maxed
      ? '<button class="talent-btn" disabled>Max</button>'
      : `<button class="talent-btn" data-talent="${id}" ${canAfford ? '' : 'disabled'}>${cost}🪙</button>`;
    return `
      <div class="talent-row">
        <div class="talent-info">
          <span class="talent-name">${cfg.name} <span class="talent-lvl">${lv}/${cfg.maxLevel}</span></span>
          <span class="talent-desc">${cfg.desc}</span>
        </div>
        ${btnHtml}
      </div>`;
  }).join('');

  list.querySelectorAll('.talent-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      import('./prestige.js').then(({ buyTalent }) => buyTalent(btn.dataset.talent));
    });
  });
}

// ─── Daily Milestones ────────────────────────────────────────────────────────

function renderDailyMilestones() {
  const list = document.getElementById('dailyList');
  if (!list) return;
  list.innerHTML = DAILY_MILESTONES.map((m) => {
    const done = state.dailyMilestonesCompleted?.[m.id];
    const rewardText = m.reward.gold          ? formatGold(m.reward.gold) + 'g'
                     : m.reward.scrap         ? m.reward.scrap + ' scrap'
                     : m.reward.crystals      ? m.reward.crystals + ' cry'
                     : m.reward.prestigeTokens? m.reward.prestigeTokens + '🪙'
                     : '';
    return `<div class="milestone-row ${done ? 'done' : ''}">
      <span class="icon">${done ? '✓' : '○'}</span>
      <span>${m.name}</span>
      ${rewardText ? `<span class="milestone-reward">(${rewardText})</span>` : ''}
    </div>`;
  }).join('');
}

// ─── Main UI update ──────────────────────────────────────────────────────────

export function updateUI() {
  document.getElementById('gold').textContent = formatGold(state.gold);
  document.getElementById('scrap').textContent = state.shinyScrap;
  document.getElementById('crystals').textContent = state.crystals;
  document.getElementById('ancientFragments').textContent = state.ancientFragments;

  // New materials — show wrapper when player has any
  const runeWrap   = document.getElementById('mat-rune-wrap');
  const shadowWrap = document.getElementById('mat-shadow-wrap');
  const dragonWrap = document.getElementById('mat-dragon-wrap');
  const runeEl   = document.getElementById('runeShards');
  const shadowEl = document.getElementById('shadowDust');
  const dragonEl = document.getElementById('dragonScales');

  if (runeWrap && runeEl) {
    const show = (state.runeShards || 0) > 0 || state.ancestralEmeralds >= MAT_DISPLAY_EMERALD_RUNE;
    runeWrap.style.display   = show ? '' : 'none';
    runeEl.textContent       = state.runeShards || 0;
  }
  if (shadowWrap && shadowEl) {
    const show = (state.shadowDust || 0) > 0 || state.ancestralEmeralds >= MAT_DISPLAY_EMERALD_SHADOW;
    shadowWrap.style.display = show ? '' : 'none';
    shadowEl.textContent     = state.shadowDust || 0;
  }
  if (dragonWrap && dragonEl) {
    const show = (state.dragonScales || 0) > 0 || state.ancestralEmeralds >= MAT_DISPLAY_EMERALD_DRAGON;
    dragonWrap.style.display = show ? '' : 'none';
    dragonEl.textContent     = state.dragonScales || 0;
  }

  const pickLv  = state.equipment.miningPick || 0;
  const runeLv  = state.equipment.runeGauntlet || 0;
  const fortLv  = state.talents?.fortitude || 0;
  const baseDmg = state.perClick + EQUIPMENT_CONFIG.miningPick.effectPerLevel * pickLv;
  let dmgDisplay = baseDmg * getMultiplier() * getPrestigeMultiplier();
  if (runeLv > 0)  dmgDisplay *= 1 + runeLv * (EQUIPMENT_CONFIG.runeGauntlet.effectPerLevel / 100);
  if (fortLv > 0)  dmgDisplay *= 1 + fortLv * (PRESTIGE_TALENTS.fortitude.effectPerLevel / 100);
  document.getElementById('perClick').textContent = Math.floor(dmgDisplay);

  const blocksEl = document.getElementById('blocksBroken');
  if (blocksEl) blocksEl.textContent = state.blocksBroken;

  // ── Equipment ──────────────────────────────────────────────────────────────
  document.querySelectorAll('.equipment-item').forEach((row) => {
    const id  = row.dataset.id;
    const cfg = EQUIPMENT_CONFIG[id];
    if (!cfg) return;

    // Hide equipment that hasn't been unlocked by emeralds yet
    if (cfg.unlockEmeralds > 0 && state.ancestralEmeralds < cfg.unlockEmeralds) {
      row.style.display = 'none';
      return;
    }
    row.style.display = '';

    const lv   = state.equipment[id] || 0;
    const lvEl = row.querySelector('.eq-lvl');
    if (lvEl) lvEl.textContent = lv;
    const btn = row.querySelector('.buy-btn');
    if (!btn) return;

    if (lv >= cfg.maxLevel) {
      btn.textContent = 'Max';
      btn.disabled = true;
      row.classList.add('owned');
    } else {
      row.classList.remove('owned');
      const cost = getEquipmentCost(id);
      if (cost) {
        const parts = [];
        if (cost.gold)    parts.push(formatGold(cost.gold) + 'g');
        if (cost.scrap)   parts.push(cost.scrap   + ' scrap');
        if (cost.crystals)parts.push(cost.crystals+ ' cry');
        if (cost.ancient) parts.push(cost.ancient + ' anc');
        if (cost.rune)    parts.push(cost.rune    + ' rune');
        if (cost.shadow)  parts.push(cost.shadow  + ' shadow');
        if (cost.dragon)  parts.push(cost.dragon  + ' dragon');
        btn.textContent = (lv === 0 ? 'Buy: ' : 'Up: ') + parts.join('+');
        const can =
          state.gold             >= cost.gold     &&
          state.shinyScrap       >= cost.scrap    &&
          state.crystals         >= cost.crystals &&
          state.ancientFragments >= cost.ancient  &&
          (state.runeShards   || 0) >= cost.rune   &&
          (state.shadowDust   || 0) >= cost.shadow &&
          (state.dragonScales || 0) >= cost.dragon;
        btn.disabled = !can;
      }
    }
  });

  // ── Emeralds / Prestige ───────────────────────────────────────────────────
  const emeraldsEl     = document.getElementById('emeralds');
  const emeraldBonusEl = document.getElementById('emeraldBonus');
  if (emeraldsEl)     emeraldsEl.textContent     = state.ancestralEmeralds;
  if (emeraldBonusEl) emeraldBonusEl.textContent = ((getPrestigeMultiplier() - 1) * 100).toFixed(0);

  const threshold   = getPrestigeThreshold();
  const prestigeBtn = document.getElementById('prestigeBtn');
  if (prestigeBtn) prestigeBtn.disabled = state.gold < threshold;

  const emeraldsNext = Math.floor(state.gold / threshold);
  const hintEl = document.getElementById('prestigeHint');
  if (hintEl) {
    hintEl.textContent = emeraldsNext > 0
      ? `Next run: +${emeraldsNext} emerald${emeraldsNext !== 1 ? 's' : ''}`
      : `Reach ${formatGold(threshold)} gold to travel deeper.`;
  }

  // ── Milestones ────────────────────────────────────────────────────────────
  const listEl = document.getElementById('milestonesList');
  if (listEl) {
    listEl.innerHTML = MILESTONES.map((m) => {
      const done = state.milestonesCompleted[m.id];
      const rewardText = m.reward.gold            ? formatGold(m.reward.gold) + 'g'
                       : m.reward.crystals        ? m.reward.crystals + ' cry'
                       : m.reward.blockGoldPercent? '+' + m.reward.blockGoldPercent + '% blk gold'
                       : m.reward.scrap           ? m.reward.scrap + ' scrap'
                       : '';
      return `<div class="milestone-row ${done ? 'done' : ''}">
        <span class="icon">${done ? '✓' : '○'}</span>
        <span>${m.name}</span>
        ${rewardText ? `<span class="milestone-reward">(${rewardText})</span>` : ''}
      </div>`;
    }).join('');
  }

  // ── Daily milestones ──────────────────────────────────────────────────────
  renderDailyMilestones();

  // ── Talents ───────────────────────────────────────────────────────────────
  renderTalents();

  // ── Upgrades ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.upgrade-buy').forEach((btn) => {
    const id       = btn.dataset.id;
    const upgrade  = state.upgrades[id];
    const currency = btn.dataset.currency || 'gold';
    if (currency === 'scrap') {
      const cost = parseInt(btn.dataset.cost, 10);
      btn.textContent = `Buy (${cost} scrap)`;
      btn.disabled = state.shinyScrap < cost || upgrade.count >= 1;
    } else {
      const cost     = parseInt(btn.dataset.cost, 10);
      const nextCost = Math.floor(cost * Math.pow(UPGRADE_SCALE, upgrade.count));
      btn.textContent = `Buy (${nextCost})`;
      btn.disabled = state.gold < nextCost;
    }
  });

  document.querySelectorAll('[id^="count-"]').forEach((el) => {
    const id = el.id.replace('count-', '');
    if (state.upgrades[id]) el.textContent = 'x' + state.upgrades[id].count;
  });

  updateTabNotifications();
}

function updateTabNotifications() {
  const upgradesTab  = document.querySelector('[data-tab="upgrades"]');
  const equipmentTab = document.querySelector('[data-tab="equipment"]');

  const upgradesAffordable  = !!document.querySelector('#tab-upgrades .upgrade-buy:not([disabled])');
  const equipmentAffordable = !!document.querySelector('#tab-equipment .buy-btn:not([disabled])');

  if (upgradesTab) {
    upgradesTab.classList.toggle('has-notification',
      upgradesAffordable && !upgradesTab.classList.contains('active'));
  }
  if (equipmentTab) {
    equipmentTab.classList.toggle('has-notification',
      equipmentAffordable && !equipmentTab.classList.contains('active'));
  }
}
