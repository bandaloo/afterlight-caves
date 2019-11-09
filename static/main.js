import { boardToString, getGrid, getEmptySpaces } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
import { startUp, setGameDrawFunc, addToWorld } from "./modules/gamemanager.js";
import { drawBoard } from "./game/draw.js";
import { Enemy } from "./game/enemy.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { Hero } from "./game/hero.js";
import { pepperGems } from "./game/generator.js";

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

const color = hsl(randomInt(360));

let board = pepperGems(
  getGrid(blockColumns, blockRows, caveRules, EdgesEnum.alive, 0.45, 20),
  0.1
);

console.log(boardToString(board));

setGameDrawFunc(() => {
  drawBoard(board, blockWidth, blockHeight, color);
});

let emptySpaces = shuffle(getEmptySpaces(board, 10, blockWidth, blockHeight));

for (let i = 0; i < 10; i++) {
  let enemy = new Enemy(
    new Vector(0, 0).add(
      new Vector(blockWidth / 2, blockHeight / 2).add(emptySpaces[i])
    ),
    10
  );
  enemy.vel = new Vector(0, 10);
  addToWorld(enemy);

  const hero = new Hero(new Vector(0, 0).add(
    new Vector(blockWidth / 2, blockHeight / 2).add(emptySpaces[11])
  ));
  addToWorld(hero);
}

startUp();
