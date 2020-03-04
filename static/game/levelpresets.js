import { caveRules, EdgesEnum } from "./rules.js";
import { getGrid, getEmptySpaces } from "./life.js";
import { shuffle, hsl, randomInt } from "../modules/helpers.js";
import {
  setBlockDimensions,
  setImportantEntity,
  setCameraEntity,
  addToWorld,
  setTerrain,
  addToGui
} from "../modules/gamemanager.js";
import { Hero } from "./hero.js";
import { Vector } from "../modules/vector.js";
import { initBlockField } from "./generator.js";
import { spawnEnemies, spawnPowerups } from "./spawner.js";
import { setGameDrawFunc } from "../modules/displaymanager.js";
import { drawBoard } from "./draw.js";
import { TimeDisplay } from "./timedisplay.js";
import { PositronRifle } from "./items/positronrifle.js";

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
 * @property {number} tilesPerChance
 *
 * @typedef DimensionSettings
 * @property {number} roomWidth
 * @property {number} roomHeight
 * @property {number} blockWidth
 * @property {number} blockHeight
 *
 * @typedef GameModeSettings
 * @property {{minutes: number, seconds: number}} timeLimit
 *
 * @typedef SettingsGroup
 * @property {TerrainSettings} terrain
 * @property {SpawnSettings} spawn
 * @property {DimensionSettings} dimensions
 * @property {GameModeSettings} gameMode
 */

const DEFAULT_BLOCK_WIDTH = 60;
const DEFAULT_BLOCK_HEIGHT = 60;

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
    randomPowerAddend: 3,
    tilesPerChance: 280
  }
};

/** @type {Object<string, DimensionSettings>} */
export const dimensionsSettings = {
  original: {
    roomWidth: 256,
    roomHeight: 144,
    blockWidth: DEFAULT_BLOCK_WIDTH,
    blockHeight: DEFAULT_BLOCK_HEIGHT
  }
};

/** @type {Object<string, GameModeSettings>} */
export const gameModeSettings = {
  original: {
    timeLimit: { minutes: 5, seconds: 0 }
  }
};

/** @type {Object<string, SettingsGroup>} */
export const settingsGroups = {
  original: {
    terrain: terrainSettings.original,
    spawn: spawnSettings.original,
    dimensions: dimensionsSettings.original,
    gameMode: gameModeSettings.original
  }
};

/**
 * generate terrain, spawn enemies, spawn powerups and set game mode based
 * on a group of settings
 * @param {SettingsGroup} group
 */
export function startLevelFromSettings(group) {
  const timedisplay = new TimeDisplay(
    new Vector(0, 200 - 32),
    100 *
      (group.gameMode.timeLimit.minutes * 60 + group.gameMode.timeLimit.seconds)
  );
  addToGui("timedisplay", timedisplay);

  const board = getGrid(
    group.dimensions.roomWidth,
    group.dimensions.roomHeight,
    group.terrain.rules,
    EdgesEnum.alive,
    group.terrain.density,
    group.terrain.generations
  );

  const hue = randomInt(360);

  setGameDrawFunc(() => {
    drawBoard(
      board,
      group.dimensions.blockWidth,
      group.dimensions.blockHeight,
      hue
    );
  });

  let emptySpaces = shuffle(
    getEmptySpaces(
      board,
      10,
      group.dimensions.blockWidth,
      group.dimensions.blockHeight
    )
  );

  // TODO change the hero spawning
  const hero = new Hero(
    new Vector(0, 0).add(
      new Vector(
        group.dimensions.blockWidth / 2,
        group.dimensions.blockHeight / 2
      ).add(emptySpaces[0])
    )
  );

  // failsafe to prevent infinite attempted spawns
  let giveUpCount = 0;
  const giveUpMax = 50;
  let partsSpawned = 0;
  // try to spawn
  while (partsSpawned < 3) {
    const emptySpace = emptySpaces
      .pop()
      .add(
        new Vector(
          group.dimensions.blockWidth / 2,
          group.dimensions.blockHeight / 2
        )
      );

    if (giveUpCount > giveUpMax || emptySpace.dist(hero.pos) > 2000) {
      addToWorld(new PositronRifle(emptySpace));
      partsSpawned++;
    } else {
      giveUpCount++;
    }
  }

  setImportantEntity("hero", hero);
  setCameraEntity(hero);
  addToWorld(hero);

  setTerrain(board);
  initBlockField(board);
  // has to be called after setting the terrain for the splatter canvas
  setBlockDimensions(group.dimensions.blockWidth, group.dimensions.blockHeight);

  // spawn the enemies custom to the settings group
  spawnEnemies(
    board,
    group.spawn.chance,
    group.spawn.densityDistanceLo,
    group.spawn.densityDistanceHi,
    group.spawn.powerDistanceLo,
    group.spawn.powerDistanceHi,
    group.spawn.powerScalar,
    group.spawn.randomPowerAddend
  );

  // spawn the powerups custom to the settings group
  spawnPowerups(board, group.spawn.tilesPerChance);
}
