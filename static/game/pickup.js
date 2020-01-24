import { Vector } from "../modules/vector.js";
import { Entity, FarEnum } from "../modules/entity.js";
import { centeredRoundedRect } from "./draw.js";

/**
 * @enum {number}
 */
export const PickupEnum = Object.freeze({ bomb: 1, health: 2 });

export class Pickup extends Entity {
  /**
   * @param {Vector} pos
   * @param {number} pickupEnum
   */
  constructor(pos, pickupEnum) {
    super(pos, new Vector(0, 0), new Vector(0, 0));
    this.width = 64;
    this.height = 64;
    this.pickupEnum = pickupEnum;
    this.farType = FarEnum.deactivate;
    this.color = pickupEnum === PickupEnum.bomb ? "gray" : "red";
  }

  draw() {
    /*
    centeredRoundedRect(
      this.drawPos,
      this.width,
      this.height,
      "black",
      this.color,
      3,
      0
    );

    // draw inner element
    centeredRoundedRect(
      this.drawPos,
      this.width / 2,
      this.height / 2,
      "black",
      this.color,
      5,
      this.pickupEnum === PickupEnum.bomb ? this.width / 4 : 0
    );
    */
  }
}
