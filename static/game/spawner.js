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
 *
 * @param {number[][]} board
 * @param {number} chance
 * @param {number} safetyDistance
 * @param {number} hardDistance
 */
export function spawnEnemies(
  board,
  chance,
  safetyDistance = 1000,
  hardDistance = 5000
) {
  const { cells: distCells } = distanceBoard(board);

  // TODO make actually have rarity
  const creatureClasses = [
    Chase,
    Chase,
    Scatter,
    Scatter,
    Shooter,
    Shooter,
    Crosser,
    Crosser,
    Bomber
  ];

  griderate(board, (board, i, j) => {
    if (board[i][j] === 1) return;
    const position = cellToWorldPosition(new Vector(i, j));
    const distanceToHero = position.dist(getImportantEntity("hero").pos);
    const roll = Math.random();
    const scaledChance =
      chance * riseFunction(distanceToHero, safetyDistance, hardDistance);
    if (roll < scaledChance) {
      // TODO determine a size based on distCells
      const enemy = new creatureClasses[randomInt(creatureClasses.length)](
        position,
        undefined,
        undefined,
        0
      );
      addToWorld(enemy);
    }
  });
}

/**
 * @param {number[][]} board
 * @param {number} numEnemies
 */
export function populateLevel(board, numEnemies) {
  // board containing distances from nearest solid block
  const { cells: distCells } = distanceBoard(board);

  // TODO make actually enemy rarity
  const creatureClasses = [
    Chase,
    Chase,
    Scatter,
    Scatter,
    Shooter,
    Shooter,
    Crosser,
    Crosser,
    Bomber
  ];

  for (let i = 0; i < numEnemies; i++) {
    const randomChoice = randomInt(creatureClasses.length);
    // TODO randomly choose this position correctly
    const size = randomInt(3);
    if (distCells[size + 1] === undefined) {
      continue;
    }
    const safetyDistance = 1000;
    const easyDistance = 8000;
    const easyRespawns = 3;

    let cellPosition;
    let position;
    let respawns = 0;

    let positionOkay = false;

    while (!positionOkay) {
      cellPosition = randomPop(distCells[size + 1]);
      position = cellToWorldPosition(cellPosition);

      const distanceToHero2 = position.dist2(getImportantEntity("hero").pos);

      if (distanceToHero2 < safetyDistance ** 2) {
        // too close, not okay to spawn
        continue;
      }

      // choose another spot if spawning in the easy zone
      if (respawns < easyRespawns && distanceToHero2 < easyDistance ** 2) {
        respawns++;
        // calculate respawn chance based on distance from hero
        const easyRespawnChance =
          (easyDistance - Math.sqrt(distanceToHero2)) / easyDistance;
        if (Math.random() < easyRespawnChance) {
          continue;
        }
      }
      positionOkay = true;
    }
    // TODO catch the situation where enemy is too large to spawn anywhere
    const enemy = new creatureClasses[randomChoice](
      position,
      undefined,
      undefined,
      size
    );

    //Apply random effects
    const numPowerUps = Math.random() * 6;
    for (let k = 0; k < numPowerUps; k++) {
      if (Math.random() > 0.75) {
        const p = new powerUpTypes[randomInt(powerUpTypes.length)](
          1 + randomInt(5)
        );
        p.apply(enemy);
      }
    }

    addToWorld(enemy);
  }
}
