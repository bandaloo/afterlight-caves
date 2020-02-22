import { caveRules } from "./rules";

/**
 * @typedef TerrainSettings
 * @property {number[]} rules
 * @property {number} density
 * @property {number} generations
 *
 * @typedef SpawnSettings
 * @property {number} chance
 * @property {number} densityDistanceLo
 * @property {number} densityDistanceHi
 * @property {number} powerDistanceLo
 * @property {number} powerDistanceHi
 * @property {number} powerScalar
 * @property {number} randomPowerAddend
 *
 * @typedef DimensionSettings
 * @property {number} width
 * @property {number} height
 *
 * @typedef GameModeSettings
 * @property {{minutes: number, seconds: number}} timeLimit
 */

/** @type {Object<string, TerrainSettings>} */
export const terrainSettings = {
  original: {
    rules: caveRules,
    density: 0.5,
    generations: 20
  }
};

/** @type {Object<string, SpawnSettings>} */
export const spawnSettings = {
  original: {
    chance: 0.025,
    densityDistanceLo: 1000,
    densityDistanceHi: 5000,
    powerDistanceLo: 1000,
    powerDistanceHi: 5000,
    powerScalar: 3,
    randomPowerAddend: 3
  }
};

/** @type {Object<string, DimensionSettings>} */
export const dimensionSettings = {
  original: { width: 256, height: 144 }
};

/** @type {Object<string, GameModeSettings>} */
export const constraintSettings = {
  original: {
    timeLimit: { minutes: 5, seconds: 0 }
  }
};
