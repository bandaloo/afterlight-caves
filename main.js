import { getGrid } from "./modules/life.js";
import { boardToString } from "./modules/life.js";
import { caveRules, EdgesEnum } from "./modules/rules.js";
import { startUp } from "./modules/gamemanager.js";

let board = getGrid(50, 50, caveRules, EdgesEnum.alive, 0.5, 20);
console.log(boardToString(board));
console.log(board);

startUp();
