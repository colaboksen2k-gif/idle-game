// Gold formatting helpers keep large values readable without affecting game balance.
// Small values use locale-aware grouping; large values use suffixes like K, M, B, T.

const GOLD_FORMAT_THRESHOLDS = [
  { value: 1e12, suffix: 'T' },
  { value: 1e9,  suffix: 'B' },
  { value: 1e6,  suffix: 'M' },
  { value: 1e3,  suffix: 'K' }
];

const GOLD_SUFFIX_CUTOFF = 10_000;

export function formatGold(n) {
  const value = Number.isFinite(n) ? n : 0;

  if (value < GOLD_SUFFIX_CUTOFF) {
    return Math.floor(value).toLocaleString();
  }

  for (const { value: threshold, suffix } of GOLD_FORMAT_THRESHOLDS) {
    if (value >= threshold) {
      const scaled = value / threshold;
      return (scaled >= 100 ? Math.floor(scaled).toString() : scaled.toFixed(2)) + suffix;
    }
  }

  return Math.floor(value).toLocaleString();
}

