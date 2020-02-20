import {
  addToWorld,
  cellToWorldPosition,
  getImportantEntity
} from "../modules/gamemanager.js";
import { randomInt, randomPop, griderate } from "../modules/helpers.js";
import { Chase } from "./chase.js";
import { Crosser } from "./crosser.js";
import { distanceBoard } from "./generator.js";
import { powerUpTypes } from "./powerups/poweruptypes.js";
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
 * @param {number} x
 * @param {number} lo
 * @param {number} hi
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
 *
 * @param {number[][]} board
 * @param {number} chance
 * @param {number} densityDistanceLo
 * @param {number} densityDistanceHi
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
