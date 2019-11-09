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
 * return a random entry from an enum-like object
 * @param {Object.<string, number>} poolEnum
 * @return {number}
 */
export function randomFromEnum(poolEnum) {
  return poolEnum[
    Object.keys(poolEnum)[randomInt(Object.keys(poolEnum).length)]
  ];
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

/**
 * returns a copied shuffled version of the list given in
 * @param {any[]} list
 * @returns {any[]} a shuffled copied of the input
 */
export function shuffle(list) {
  let randomList = Array.from(list);
  for (let i = randomList.length - 1; i > 0; i--) {
    let j = randomInt(i + 1);
    [randomList[i], randomList[j]] = [randomList[j], randomList[i]];
  }
  return randomList;
}

// TODO check if the griderate function is really that useful

/**
 * function to facilitate iterating through rectangular 2d array
 * @param {any[][]} grid
 * @param {(arg0: any[][], arg1: number, arg2: number) => void} func
 */
export function griderate(grid, func) {
  let width = grid.length;
  let height = grid[0].length;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      func(grid, i, j);
    }
  }
}
