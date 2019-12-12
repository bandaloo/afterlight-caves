import { distanceBoard } from "./generator.js";
import { Shooter } from "./shooter.js";
import { Chase } from "./chase.js";
import { Scatter } from "./scatter.js";
import { randomLook, randomStats } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { createNumberGrid } from "./life.js";
import { randomInt, shuffle } from "../modules/helpers.js";
import { addToWorld, cellToWorldPosition } from "../modules/gamemanager.js";

export function populateLevel(board, numEnemies) {
  // board containing distances from nearest solid block
  const { board: distBoard, cells: distCells } = distanceBoard(board);

  // randomize the distance cells
  for (let i = 0; i < distCells.length; i++) {
    if (distCells[i] !== undefined) {
      distCells[i] = shuffle(distCells[i]);
    }
  }

  const creatureClasses = [Chase, Scatter, Shooter];

  const enemyLooks = [];
  const enemyStats = [];

  for (let i = 0; i < creatureClasses.length; i++) {
    enemyLooks.push(randomLook());
    enemyStats.push(randomStats(i * 3 + 3));
  }

  for (let i = 0; i < numEnemies; i++) {
    const randomChoice = randomInt(creatureClasses.length);
    // TODO randomly choose this position correctly
    const size = randomInt(3);
    if (distCells[size + 1] === undefined) {
      console.log("undefined? " + size);
      continue;
    }
    const position = cellToWorldPosition(distCells[size + 1].pop());
    // TODO catch the situation where enemy is too large to spawn anywhere
    const enemy = new creatureClasses[randomChoice](
      position,
      enemyLooks[randomChoice],
      enemyStats[randomChoice],
      undefined,
      undefined,
      { size: size, speed: 0, explode: 0 }
    );
    addToWorld(enemy);
  }
}
