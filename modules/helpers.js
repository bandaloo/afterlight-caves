/**
 * @param {number} n
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(n, lo));
}

/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
export function mod(m, n) {
  return (m + n) % n;
}
