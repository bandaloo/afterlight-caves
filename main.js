import { boardToString, getGrid } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
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

setGameDrawFunc(() => {
  drawBoard(board, blockWidth, blockHeight);
});

startUp();
