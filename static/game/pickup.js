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

const POWERUP_LIFETIME = 500;
const POWERUP_DISAPPEARING = 50;

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
    this.color = pickupEnum === PickupEnum.bomb ? "gray" : "red";
    this.lifetime = POWERUP_LIFETIME;
  }

  draw() {
    const sizeScalar =
      this.lifetime > POWERUP_DISAPPEARING
        ? 1.0
        : this.lifetime / POWERUP_DISAPPEARING;

    const lineWidth = (5 + 2 * Math.sin(getTotalTime() / 100)) * sizeScalar;

    centeredRect(
      this.drawPos,
      this.width * sizeScalar,
      this.height * sizeScalar,
      "black",
      this.color,
      5
    );

    // draw inner element
    if (this.pickupEnum === PickupEnum.health) {
      centeredRect(
        this.drawPos,
        (this.width / 2) * sizeScalar,
        (this.height / 2) * sizeScalar,
        "black",
        this.color,
        lineWidth
      );
    } else {
      circle(
        this.drawPos,
        (this.width / 4) * sizeScalar,
        "black",
        lineWidth,
        this.color
      );
    }
  }
}
