import { getGrid } from "./modules/life.js";
import { boardToString } from "./modules/life.js";
import { caveRules, EdgesEnum } from "./modules/rules.js";
import { conwayRules } from "./modules/rules.js";

// there's nothing here at the moment
console.log("hello world! :/");

let board = getGrid(50, 50, caveRules, EdgesEnum.alive, 0.5, 20);
console.log(boardToString(board));
console.log(board);
