/**
 * clamps a number between a minimum and maximum value
 * @param {number} n the number to clamp
 * @param {number} lo lower bound of clamp
 * @param {number} hi upper bound of clamp
 * @returns {number}
 */
export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(n, lo));
}

/**
 * true mathematical modulus that works for negative numbers
 * @param {number} m number to be modded
 * @param {number} n number to mod by
 * @return {number}
 */
export function mod(m, n) {
  return (m + n) % n;
}
