let audioCtx = null;
let soundMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function isSoundMuted() {
  return soundMuted;
}

function updateMuteButton() {
  const btn = document.getElementById('muteBtn');
  if (!btn) return;
  if (soundMuted) {
    btn.textContent = '🔇 Sound off';
    btn.classList.add('muted');
  } else {
    btn.textContent = '🔊 Sound on';
    btn.classList.remove('muted');
  }
}

export function applySavedSoundMuted(value) {
  soundMuted = !!value;
  updateMuteButton();
}

export function setupMuteButton(onToggle) {
  const btn = document.getElementById('muteBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    soundMuted = !soundMuted;
    updateMuteButton();
    if (typeof onToggle === 'function') {
      onToggle(soundMuted);
    }
  });
  updateMuteButton();
}

export function playClink() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

export function playChaChing() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const playTone = (freq, start, dur) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start);
    osc.stop(start + dur);
  };
  playTone(880, ctx.currentTime, 0.08);
  playTone(1320, ctx.currentTime + 0.06, 0.12);
}

export function playMagic() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const times = [0, 0.05, 0.1, 0.15];
  const freqs = [1200, 1600, 2000, 2400];
  times.forEach((t, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + t);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.2);
  });
}

export function playThud() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function playPrestigeSound() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  [0, 0.08, 0.16].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + i * 200, t + delay);
    gain.gain.setValueAtTime(0.18, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.25);
    osc.start(t + delay);
    osc.stop(t + delay + 0.25);
  });
}

export function playBlockBreak() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
  gain.gain.setValueAtTime(0.22, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  osc.start(t);
  osc.stop(t + 0.14);
}

export function playGemBreak() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  [0, 0.06, 0.12].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + i * 400, t + delay);
    osc.frequency.exponentialRampToValueAtTime(400, t + delay + 0.15);
    gain.gain.setValueAtTime(0.14, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
    osc.start(t + delay);
    osc.stop(t + delay + 0.18);
  });
}

export function playAncientBreak() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.25);
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.start(t);
  osc.stop(t + 0.3);
}

