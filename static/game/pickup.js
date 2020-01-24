import { Vector } from "../modules/vector.js";
import { Entity, FarEnum } from "../modules/entity.js";
import {
  centeredRoundedRect,
  centeredRect,
  circle,
  roundedRect
} from "./draw.js";
import { getTotalTime } from "../modules/gamemanager.js";

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
    this.width = 32;
    this.height = 32;
    this.pickupEnum = pickupEnum;
    this.farType = FarEnum.deactivate;
    this.color = pickupEnum === PickupEnum.bomb ? "gray" : "red";
  }

  draw() {
    const lineWidth = 5 + 2 * Math.sin(getTotalTime() / 100);

    centeredRect(this.drawPos, this.width, this.height, "black", this.color, 5);

    // draw inner element
    if (this.pickupEnum === PickupEnum.health) {
      centeredRect(
        this.drawPos,
        this.width / 2,
        this.height / 2,
        "black",
        this.color,
        lineWidth
      );
    } else {
      circle(this.drawPos, this.width / 4, "black", lineWidth, this.color);
    }
  }
}
