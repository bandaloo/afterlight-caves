import {
  addToWorld,
  cellToWorldPosition,
  getImportantEntity,
  getDimensions
} from "../modules/gamemanager.js";
import { randomInt, griderate } from "../modules/helpers.js";
import { Chase } from "./chase.js";
import { Crosser } from "./crosser.js";
import { distanceBoard, segregateTerrain } from "./generator.js";
import { Scatter } from "./scatter.js";
import { Shooter } from "./shooter.js";
import { Bomber } from "./bomber.js";
import { Vector } from "../modules/vector.js";
import { ChanceTable } from "../modules/chancetable.js";
import { Enemy } from "./enemy.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

/**
 * a continuous function that 0 when x is below a certain point, 1 when x is
 * above a certain point. when x is between these two points, the function
 * rises from 0 to 1 with a constant slope
 * @param {number} x number passed into the function
 * @param {number} lo the lower bound (where y starts increasing from 0)
 * @param {number} hi the upper bound (where y stops increasing at 1)
 */
function riseFunction(x, lo, hi) {
  if (x < lo) return 0;
  if (x > hi) return 1;
  return (x - lo) / (hi - lo);
}

/**
 * returns 0, 1 or 2 with 1 and 2 being more rare
 */
function sizeChance() {
  return Math.floor(3 * Math.random() ** 2);
}

/**
 * spawns the enemies based on a chance. has a chance to spawn bigger enemies,
 * but they will all be scaled down if they can't fit. a bigger board will
 * yield more enemies.
 * @param {number[][]} board number grid indicating how to spawn enemies
 * @param {number} chance of an enemy spawning
 * @param {number} densityDistanceLo where enemy density starts ramping up
 * @param {number} densityDistanceHi where enemy density stops ramping up
 * @param {number} powerDistanceLo where enemy power level starts ramping up
 * @param {number} powerDistanceHi where enemy power level stops ramping up
 */
export function spawnEnemies(
  board,
  chance,
  densityDistanceLo = 1000,
  densityDistanceHi = 5000,
  powerDistanceLo = 1000,
  powerDistanceHi = 6000,
  powerScalar = 3,
  randomPowerAddend = 3
) {
  const { board: distBoard } = distanceBoard(board);

  /** @type {ChanceTable<(typeof Enemy)>} */
  const chanceTable = new ChanceTable();
  chanceTable.add(Chase, 2);
  chanceTable.add(Scatter, 2);
  chanceTable.add(Shooter, 2);
  chanceTable.add(Crosser, 2);
  chanceTable.add(Bomber, 1);

  griderate(board, (board, i, j) => {
    // can't spawn on top of a block, so return immediately if the case
    if (board[i][j] === 1) return;

    const position = cellToWorldPosition(new Vector(i, j));
    const distanceToHero = position.dist(getImportantEntity("hero").pos);

    // roll whether to spawn an enemy
    const roll = Math.random();

    // scale the chance based on distancee from the center
    const scaledChance =
      chance *
      riseFunction(distanceToHero, densityDistanceLo, densityDistanceHi);

    // if chance has succeeded to spawn an enemy
    if (roll < scaledChance) {
      // don't spawn an enemy that can't fit
      const matryoshka = Math.min(distBoard[i][j] - 1, sizeChance());

      // scale the power level as distance from start increases
      const powerLevel = riseFunction(
        distanceToHero,
        powerDistanceLo,
        powerDistanceHi
      );
      const scaledPowerLevel =
        randomInt(randomPowerAddend) + powerLevel * powerScalar;

      // pick a random enemy and add it to world
      const enemy = new (chanceTable.pick())(
        position,
        undefined,
        undefined,
        matryoshka,
        scaledPowerLevel
      );
      addToWorld(enemy);
    }
  });
}

// TODO this powerup spawning algorithm is specific to caves
/**
 * spawn powerups into the world
 * @param {number[][]} board
 * @param {number} [additionalChance] not 0 to 1, but rather in the hundreds
 */
export function spawnPowerups(board, additionalChance = 280) {
  // TODO tweak some of these powerups to be rarer in the chance table
  /** @type {ChanceTable<typeof import("../game/powerup.js").PowerUp>} */
  const chanceTable = new ChanceTable();
  chanceTable.addAll([
    { result: PowerUpTypes.Amplify, chance: 1 },
    { result: PowerUpTypes.BiggerBombs, chance: 1 },
    { result: PowerUpTypes.Cone, chance: 1 },
    { result: PowerUpTypes.DamageUp, chance: 1 },
    { result: PowerUpTypes.Elastic, chance: 1 },
    { result: PowerUpTypes.FlameThrower, chance: 1 },
    { result: PowerUpTypes.GroupBomb, chance: 1 },
    { result: PowerUpTypes.Hot, chance: 1 },
    { result: PowerUpTypes.Icy, chance: 1 },
    { result: PowerUpTypes.Jalapeno, chance: 1 },
    { result: PowerUpTypes.Knapsack, chance: 1 },
    { result: PowerUpTypes.Left, chance: 1 },
    { result: PowerUpTypes.MachineGun, chance: 1 },
    { result: PowerUpTypes.Nitroglycerin, chance: 1 },
    { result: PowerUpTypes.Orb, chance: 1 },
    { result: PowerUpTypes.Popsicle, chance: 1 },
    { result: PowerUpTypes.QuickShot, chance: 1 },
    { result: PowerUpTypes.Right, chance: 1 },
    { result: PowerUpTypes.SlipperyBombs, chance: 1 },
    { result: PowerUpTypes.Thermalite, chance: 1 },
    { result: PowerUpTypes.UltraBomb, chance: 1 },
    { result: PowerUpTypes.Vitality, chance: 1 },
    { result: PowerUpTypes.Wall, chance: 1 },
    { result: PowerUpTypes.Xplode, chance: 1 },
    { result: PowerUpTypes.Yeet, chance: 1 },
    { result: PowerUpTypes.Zoom, chance: 1 }
  ]);

  const { width: blockWidth, height: blockHeight } = getDimensions();

  // Get the segregated board
  const {
    segregatedBoard: segregatedBoard,
    groupNum: groupNum,
    largestGroup: largestGroup
  } = segregateTerrain(board);

  // Init the cave locations array
  /** @type {Vector[][]} */
  const caveLocations = [];
  for (let i = 0; i < groupNum; i++) {
    caveLocations.push([]);
  }

  // For each cave, give it a list of available terrain.
  for (let i = 0; i < segregatedBoard.length; i++) {
    for (let j = 0; j < segregatedBoard[i].length; j++) {
      const location = segregatedBoard[i][j];
      if (location !== 0) {
        caveLocations[location - 1].push(
          new Vector(i * blockWidth, j * blockHeight)
        );
      }
    }
  }

  // If empty numbers exist (They shouldn't, but do) delete them.
  // TODO: figure out why we need this
  for (let i = 0; i < caveLocations.length; i++) {
    if (caveLocations[i].length == 0) caveLocations.splice(i, i);
  }
  const tilesPerAdditionalPowerupChance = additionalChance;

  for (let i = 0; i < caveLocations.length; i++) {
    if (i == largestGroup) continue;

    // Have a chance for an additional powerup for every 10 blocks.
    const additional_powerups = Math.floor(
      Math.max(1000 - caveLocations[i].length, 0) /
        tilesPerAdditionalPowerupChance
    );
    const powerup_num = Math.floor(Math.random() * additional_powerups) + 1;

    for (let p = 0; p < powerup_num; p++) {
      if (caveLocations[i].length > 0) {
        const randomIndex = randomInt(caveLocations[i].length);
        const randomTile = caveLocations[i][randomIndex];
        caveLocations[i].splice(randomIndex, 1);

        const location = randomTile.add(
          new Vector(blockWidth / 2, blockHeight / 2)
        );

        const randomMagnitude = randomInt(5) + 1;
        addToWorld(new (chanceTable.pick())(randomMagnitude, location));
      }
    }
  }
}
