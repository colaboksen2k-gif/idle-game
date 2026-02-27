import { state, loadGame, saveGame, resetGame } from './scripts/state.js';
import { spawnBlock, handleMiningBlockClick, handleUpgradeClick, handleEquipmentClick } from './scripts/combatAndMining.js';
import { updateBlockUI, updateUI } from './scripts/ui.js';
import { checkAllMilestones, checkDailyReset, checkDailyMilestones } from './scripts/milestones.js';
import { setupMuteButton } from './scripts/audio.js';
import { doPrestige } from './scripts/prestige.js';
import { startGameLoops } from './scripts/gameLoop.js';

// ─── Global copy / paste lock ─────────────────────────────────────────────────

function disableCopyPaste() {
  const preventEvent = (event) => {
    event.preventDefault();
  };

  ['copy', 'cut', 'paste', 'contextmenu'].forEach((type) => {
    document.addEventListener(type, preventEvent);
  });

  document.addEventListener('keydown', (event) => {
    if (!event.ctrlKey && !event.metaKey) return;

    const key = event.key.toLowerCase();
    if (key === 'c' || key === 'v' || key === 'x' || key === 'a') {
      event.preventDefault();
    }
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });
}

// ─── Collapsible sections (Milestones / Daily) ───────────────────────────────

function initCollapsibles() {
  document.querySelectorAll('.collapse-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const body     = document.getElementById(targetId);
      if (!body) return;
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      // Rotate arrow
      btn.textContent = btn.textContent.replace(open ? '▾' : '▸', open ? '▸' : '▾');
    });
  });
}

// ─── Game event handlers ─────────────────────────────────────────────────────

const BLOCK_HIT_ANIMATION_MS = 150;

function initEventHandlers() {
  const miningBlock = document.getElementById('miningBlock');
  if (miningBlock) {
    miningBlock.addEventListener('click', (e) => {
      miningBlock.classList.add('mining-block-hit');
      handleMiningBlockClick(e);
      setTimeout(() => miningBlock.classList.remove('mining-block-hit'), BLOCK_HIT_ANIMATION_MS);
    });
  }

  document.querySelectorAll('.upgrade-buy').forEach((btn) => {
    btn.addEventListener('click', () => handleUpgradeClick(btn));
  });

  document.querySelectorAll('.equipment-section .buy-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleEquipmentClick(btn));
  });

  const prestigeBtn = document.getElementById('prestigeBtn');
  if (prestigeBtn) {
    prestigeBtn.addEventListener('click', () => doPrestige());
  }

  const prestigeDismiss = document.getElementById('prestigeOverlayDismiss');
  if (prestigeDismiss) {
    prestigeDismiss.addEventListener('click', () => {
      const overlay = document.getElementById('prestigeOverlay');
      if (overlay) overlay.style.display = 'none';
    });
  }

  // Use delegation so the handler works regardless of tab visibility at init
  document.body.addEventListener('click', (e) => {
    if (!e.target.closest('#newGameBtn')) return;

    const confirmed = window.confirm(
      'This will erase ALL progress and start a new game. Are you sure?'
    );
    if (!confirmed) return;

    resetGame();

    if (!state.currentBlock) spawnBlock();
    else updateBlockUI();

    checkDailyReset();
    checkAllMilestones();
    checkDailyMilestones();
    updateUI();
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

function init() {
  setupMuteButton(() => saveGame());
  loadGame();

  if (!state.currentBlock) spawnBlock();
  else updateBlockUI();

  checkDailyReset();
  checkAllMilestones();
  checkDailyMilestones();
  updateUI();

  initTabs();
  initCollapsibles();
  initEventHandlers();
  startGameLoops();
  disableCopyPaste();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
