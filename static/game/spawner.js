import {
  addToWorld,
  cellToWorldPosition,
  getImportantEntity
} from "../modules/gamemanager.js";
import { randomInt, randomPop, griderate } from "../modules/helpers.js";
import { Chase } from "./chase.js";
import { Crosser } from "./crosser.js";
import { distanceBoard } from "./generator.js";
import { Scatter } from "./scatter.js";
import { Shooter } from "./shooter.js";
import { Bomber } from "./bomber.js";
import { Vector } from "../modules/vector.js";
import { ChanceTable } from "../modules/chancetable.js";
import { Enemy } from "./enemy.js";

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
