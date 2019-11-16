import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { buttons } from "./buttons.js";
import { drawCircle } from "./draw.js";

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
    drawCircle(this.drawPos, 25, "yellow");
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
    this.acc = dirVec;
  }
}
