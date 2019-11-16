import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { drawCircle } from "../modules/helpers.js";
import { buttons } from "./buttons.js";

export class Hero extends Entity {
  fireRate = 2; // bullets per second
  speed = 2; // movement speed
  drag = 0.1; // movement deceleration
  health = 3; // hits taken before dying

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
    drawCircle(this.drawPos, 20, "yellow");
  }

  update() {
    // deal with movement input
    // add an acceleration if the button was just pressed
    if (buttons.move.up.status.pressed) {
      this.acc.add(new Vector(0, -1 * this.speed));
    } else if (buttons.move.right.status.pressed) {
      this.acc.add(new Vector(this.speed, 0));
    } else if (buttons.move.down.status.pressed) {
      this.acc.add(new Vector(0, this.speed));
    } else if (buttons.move.left.status.pressed) {
      this.acc.add(new Vector(-1 * this.speed, 0));
    } else {
      this.acc = new Vector(0, 0);
    }

    // reset acceleration if we've reached max speed
    if (this.vel.mag() >= this.speed) {
      this.acc = new Vector(0, 0);
    }
  }
}
