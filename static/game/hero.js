import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle } from "./draw.js";
import { buttons } from "./buttons.js";

export class Hero extends Entity {
  fireRate = 2; // bullets per second
  speed = 2; // movement speed
  drag = 0.1; // movement deceleration
  health = 3; // hits taken before dying
  eyeDirection = new Vector(0, 1);

  /**
   * @param startingPos {Vector} the starting position of this Hero
   * @constructor
   */
  constructor(startingPos) {
    super(startingPos);
    this.type = "Hero";
    this.width = 50;
    this.height = 50;
  }

  /**
   * Draws the hero at its position in the world
   */
  draw() {
    centeredOutlineCircle(this.drawPos, this.width / 2, 4, "white", "black");
    if (!this.vel.isZeroVec()) {
      this.eyeDirection = this.vel.norm();
    }
    centeredOutlineCircle(
      this.drawPos.add(this.eyeDirection.mult(10)),
      10,
      4,
      "white"
    );
  }

  action() {
    this.acc = buttons.move.vec;
  }
}
