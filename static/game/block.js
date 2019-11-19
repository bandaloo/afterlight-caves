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
