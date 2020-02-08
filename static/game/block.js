import { Vector } from "../modules/vector.js";
import { Particle, EffectEnum } from "./particle.js";
import {
  cellToWorldPosition,
  setBlock,
  addParticle,
  getImportantEntity
} from "../modules/gamemanager.js";
import { blockField } from "./generator.js";
import { Hero } from "./hero.js";

export class Block {
  /**
   * block that has info about durability and gems
   * @param {number} durability
   * @param {import("./generator").GemInfo} gemType
   */
  constructor(durability = 1, gemType = undefined) {
    this.durability = durability;
    this.gemType = gemType;
  }
}

/**
 * @param {Vector} cellVec
 * @param {boolean} grantPoints
 */
export function destroyBlock(cellVec, grantPoints = true) {
  const worldVec = cellToWorldPosition(cellVec);
  if (setBlock(cellVec.x, cellVec.y, 0)) {
    for (let i = 0; i < 3; i++) {
      const p = new Particle(worldVec, "black", EffectEnum.square, 5, 3);
      p.lineWidth = 1;
      p.strokeStyle = "white";
      addParticle(p);
    }
    if (grantPoints) {
      const gemType = blockField[cellVec.x][cellVec.y].gemType;
      if (gemType !== undefined) {
        const hero = /** @type {Hero} */ (getImportantEntity("hero"));
        hero.addPoints(gemType.points);
      }
    }
  }
}
