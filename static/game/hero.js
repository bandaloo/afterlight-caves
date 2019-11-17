import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle } from "./draw.js";
import { buttons } from "./buttons.js";
import { addToWorld } from "../modules/gamemanager.js";
import { Bullet } from "./bullet.js";

export class Hero extends Entity {
  fireDelay = 3; // game steps to wait before firing
  fireCount = 0;
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
    centeredOutlineCircle(
      this.drawPos.add(this.eyeDirection.mult(10)),
      10,
      4,
      "white"
    );
  }

  action() {
    this.acc = buttons.move.vec;
    // prevents velocity from getting too small and normalization messing up
    if (!buttons.shoot.vec.isZeroVec()) {
      this.eyeDirection = buttons.shoot.vec;
      // shoot a bullet
      if (this.fireCount === 0) {
        addToWorld(
          new Bullet(
            this.pos.add(buttons.shoot.vec.mult(this.width / 2)),
            buttons.shoot.vec.mult(10),
            new Vector(0, 0),
            true
          )
        );
      }
      this.fireCount++;
      this.fireCount %= this.fireDelay;
    } else if (this.vel.magnitude() > 0.001) {
      this.eyeDirection = this.vel.norm();
    }
  }
}
