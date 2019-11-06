import { getGrid } from "./modules/life.js";
import { boardToString } from "./modules/life.js";
import { caveRules, EdgesEnum } from "./modules/rules.js";
import { startUp, setGameDrawFunc } from "./modules/gamemanager.js";
import { drawBoard } from "./modules/draw.js";

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

let board = getGrid(
  blockColumns,
  blockRows,
  caveRules,
  EdgesEnum.alive,
  0.45,
  20
);
console.log(boardToString(board));
console.log(board);

setGameDrawFunc(() => {
  drawBoard(board);
});

startUp();
