import { boardToString, getGrid, getEmptySpaces } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
import {
  startUp,
  setGameDrawFunc,
  addToWorld,
  setTerrain,
  setDimensions,
  destroyEverything
} from "./modules/gamemanager.js";
import { drawBoard } from "./game/draw.js";
import { Enemy, randomLook, randomStats } from "./game/enemy.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { pepperGems } from "./game/generator.js";

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

/** @type {string} */
let color;

/** @type {import("./game/enemy.js").Look[]} */
let enemyLooks = [];

/** @type {import("./game/enemy.js").Stats[]} */
let enemyStats = [];

function resetDemo() {
  destroyEverything();
  color = hsl(randomInt(360));
  enemyLooks = [];
  enemyStats = [];

  let board = pepperGems(
    getGrid(blockColumns, blockRows, caveRules, EdgesEnum.alive, 0.45, 20),
    0.1
  );

  console.log(boardToString(board));

  setTerrain(board);
  setDimensions(blockWidth, blockHeight);

  setGameDrawFunc(() => {
    drawBoard(board, blockWidth, blockHeight, color);
  });

  let emptySpaces = shuffle(getEmptySpaces(board, 10, blockWidth, blockHeight));

  // create three looks with three difficulties
  for (let i = 0; i < 3; i++) {
    enemyLooks.push(randomLook());
    enemyStats.push(randomStats(i * 3 + 3));
  }

  for (let i = 0; i < 30; i++) {
    const enemy = new Enemy(
      emptySpaces[i % emptySpaces.length].add(
        new Vector(blockWidth / 2, blockHeight / 2)
      ),
      enemyLooks[i % 3],
      enemyStats[i % 3]
    );
    enemy.drag = 0.005;
    addToWorld(enemy);
  }
}

document.addEventListener("keydown", e => {
  const code = e.keyCode;
  const key = String.fromCharCode(code);
  // press F for fullscreen
  if (key == "R") {
    resetDemo();
  }
});

resetDemo();

startUp();
