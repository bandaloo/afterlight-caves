import { Vector } from "../modules/vector.js";
import { Particle, EffectEnum } from "./particle.js";
import {
  cellToWorldPosition,
  setBlock,
  addParticle,
  getImportantEntity,
  inbounds,
  getBlockWidth,
  getBlockHeight
} from "../modules/gamemanager.js";
import { blockField } from "./generator.js";
import { Hero } from "./hero.js";
import { playSound } from "../modules/sound.js";
import { Entity } from "../modules/entity.js";

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
  if (setBlock(cellVec.x, cellVec.y, 0)) {
    const worldVec = cellToWorldPosition(cellVec);
    // check if the block is on screen
    const testEntity = new Entity(worldVec);
    testEntity.width = getBlockWidth();
    testEntity.height = getBlockHeight();
    if (testEntity.onScreen()) {
      playSound("hit-breakable");
      for (let i = 0; i < 3; i++) {
        const p = new Particle(worldVec, "black", EffectEnum.square, 5, 3);
        p.lineWidth = 1;
        p.strokeStyle = "white";
        addParticle(p);
      }
    }
    if (grantPoints) {
      const gemType = blockField[cellVec.x][cellVec.y].gemType;
      if (gemType !== undefined) {
        playSound("gem");
        const hero = /** @type {Hero} */ (getImportantEntity("hero"));
        hero.addPoints(gemType.points);
      }
    }
  }
}
