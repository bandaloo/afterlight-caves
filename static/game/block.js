import { GemEnum } from "./generator.js";
export class Block {
  /**
   *
   * @param {number} durability
   * @param {GemEnum} gemType
   */
  constructor(durability = 1, gemType = undefined) {
    this.durability = durability;
    this.gemType = gemType;
  }
}
