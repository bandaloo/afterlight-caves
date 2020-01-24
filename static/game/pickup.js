import { Vector } from "../modules/vector";
import { Entity } from "../modules/entity";
import { centeredRoundedRect } from "./draw";

/**
 * @enum {number}
 */
const PickupEnum = Object.freeze({ bomb: 1, health: 2 });

export class Pickup extends Entity {
  /**
   * @param {Vector} pos
   * @param {number} pickupEnum
   */
  constructor(pos, pickupEnum) {
    super(pos, new Vector(0, 0), new Vector(0, 0));
    this.width = 32;
    this.height = 32;
    this.pickupEnum = pickupEnum;
  }

  draw() {
    const color = this.pickupEnum === PickupEnum.bomb ? "gray" : "red";
    centeredRoundedRect(
      this.drawPos,
      this.width,
      this.height,
      "black",
      color,
      5,
      10
    );

    // draw inner element
    centeredRoundedRect(
      this.drawPos,
      this.width / 2,
      this.height / 2,
      "black",
      color,
      this.pickupEnum === PickupEnum.bomb ? this.width / 4 : 0,
      10
    );
  }
}
