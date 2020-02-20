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
import { powerUpTypes } from "./powerups/poweruptypes.js";

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
 * yield more enemies
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
  powerScalar = 3
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
    if (board[i][j] === 1) return;
    const position = cellToWorldPosition(new Vector(i, j));
    const distanceToHero = position.dist(getImportantEntity("hero").pos);
    const roll = Math.random();
    const scaledChance =
      chance *
      riseFunction(distanceToHero, densityDistanceLo, densityDistanceHi);
    if (roll < scaledChance) {
      const matryoshka = Math.min(distBoard[i][j] - 1, sizeChance());
      const powerLevel = riseFunction(
        distanceToHero,
        powerDistanceLo,
        powerDistanceHi
      );
      const scaledPowerLevel = randomInt(3) + powerLevel * powerScalar;

      const enemy = new (chanceTable.pick())(
        position,
        undefined,
        undefined,
        matryoshka,
        scaledPowerLevel
      );
      addToWorld(enemy);
      console.log("added an enemy to the world");
    }
  });
}

/**
 * spawn powerups into the world
 * @param {number[][]} board 
 * @param {number} [powerupChance] not 0 to 1, but rather in the hundreds
 */
export function spawnPowerups(board, powerupChance = 280) {
  const {width: blockWidth, height: blockHeight} = getDimensions();

  // Get the segregated board
  const {
    segregatedBoard: segregatedBoard,
    groupNum: groupNum,
    largestGroup: largestGroup
  } = segregateTerrain(board);

  // Init the cave locations array
  const caveLocations = [];
  for (let i = 0; i < groupNum; i++) {
    caveLocations.push([]);
  }

  // For each cave, give it a list of available terrain.
  for (let i = 0; i < segregatedBoard.length; i++) {
    for (let j = 0; j < segregatedBoard[i].length; j++) {
      const location = segregatedBoard[i][j];
      if (location != 0)
        caveLocations[location - 1].push(
          new Vector(i * blockWidth, j * blockHeight)
        );
    }
  }

  // If empty numbers exist (They shouldn't, but do) delete them.
  // TODO: figure out why we need this
  for (let i = 0; i < caveLocations.length; i++) {
    if (caveLocations[i].length == 0) caveLocations.splice(i, i);
  }
  const tilesPerAdditionalPowerupChance = powerupChance;

  for (let i = 0; i < caveLocations.length; i++) {
    if (i == largestGroup) continue;

    // Have a chance for an additional powerup for every 10 blocks.
    const additional_powerups = Math.floor(
      Math.max(1000 - caveLocations[i].length, 0) /
        tilesPerAdditionalPowerupChance
    );
    const powerup_num = Math.floor(Math.random() * additional_powerups) + 1;

    for (let p = 0; p < powerup_num; p++) {
      const randomIndex = Math.floor(Math.random() * caveLocations[i].length);
      const randomTile = caveLocations[i][randomIndex];
      caveLocations[i].splice(randomIndex, 1);

      const location = randomTile.add(
        new Vector(blockWidth / 2, blockHeight / 2)
      );

      const r = Math.random();
      const magnitude = Math.floor(Math.random() * 5) + 1;
      for (let j = 1; j <= powerUpTypes.length; ++j) {
        if (r < j / powerUpTypes.length) {
          const powerUp = new powerUpTypes[j - 1](magnitude, location);
          addToWorld(powerUp);
          break;
        }
      }
    }
  }

}