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
 * @returns {number}
 */
export function mod(m, n) {
  return (m + n) % n;
}

/**
 * returns a random int up to but excluding the input parameter
 * @param {number} max
 * @returns {number}
 */
export function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * makes red green blue string
 * @param {number} r red
 * @param {number} g green
 * @param {number} b blue
 * @returns {string}
 */
export function rgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * makes hue saturation lightness string
 * @param {number} h hue
 * @param {number} s saturation
 * @param {number} l lightness
 * @returns {string}
 */
export function hsl(h, s = 100, l = 50) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
