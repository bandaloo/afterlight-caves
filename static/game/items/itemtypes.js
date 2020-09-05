import { PositronRifle } from "./positronrifle.js";
import { Vector } from "../../modules/vector.js";

export {
  PositronRifle
};

/** @type {typeof Item[]} */
export const itemTypes = [
  PositronRifle
];

/** @type Map<string, {symbol: string, max: number}> */
export const itemSymbols = new Map();

for (const i of itemTypes) {
  let temp = new i(new Vector(0, 0));
  itemSymbols.set(temp.itemName, {
    symbol: temp.symbol,
    max: temp.numParts
  });
}
