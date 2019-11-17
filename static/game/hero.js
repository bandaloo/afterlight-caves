import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { drawCircle, centeredOutlineCircle } from "./draw.js";
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
    // deal with movement input
    // add an acceleration if the button was just pressed
    let dirVec = new Vector(0, 0);
    if (buttons.move.up.status.pressed) {
      //this.acc.add(new Vector(0, -1 * this.speed));
      dirVec = dirVec.add(new Vector(0, -1));
    }
    if (buttons.move.right.status.pressed) {
      dirVec = dirVec.add(new Vector(1, 0));
    }
    if (buttons.move.down.status.pressed) {
      dirVec = dirVec.add(new Vector(0, 1));
    }
    if (buttons.move.left.status.pressed) {
      dirVec = dirVec.add(new Vector(-1, 0));
    }
    //console.log(this.pos);
    this.acc = dirVec;
  }
}
