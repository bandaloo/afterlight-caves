import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, circle, polygon } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity
} from "../modules/gamemanager.js";
import { randomInt } from "../modules/helpers.js";

export class BeamShooter extends Enemy {
  shootDistance = 800;

  /**
   * @param {Vector} pos
   */
  constructor(pos) {
    super(pos, new Vector(0, 0), new Vector(0, 0), 0);
    this.baseHealth = 70;
    this.initHealth();
    this.fireDelay = 130;
    this.bulletSpeed = 5;
    this.bulletLifetime = 200;
    this.basePoints = 90;
    this.drag = 0.01;
    this.width = 150;
    this.height = 150;
    this.turnRandomDirection();
    // the direction this is facing
    /** @type {Vector} */
    this.facing = this.vel.norm2();
  }

  /**
   * turn to face a random direction
   */
  turnRandomDirection() {
    const d = randomInt(4);
    switch (d) {
      case 0:
        this.vel = new Vector(0, -1);
        break;
      case 1:
        this.vel = new Vector(1, 0);
        break;
      case 2:
        this.vel = new Vector(0, 1);
        break;
      case 3:
        this.vel = new Vector(-1, 0);
        break;
    }
  }

  action() {
    super.action();
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (dirVec.mag() < this.shootDistance) {
        const radians = this.facing.angleBetween(dirVec.norm2());
        if (Math.abs(radians) > 0.05) {
          // turn to face hero
          this.facing = this.facing
            .rotate((this.facing.cross(dirVec) < 0 ? -1 : 1) * 0.01)
            .norm2();
        }
        this.shoot(this.facing);
      } else {
        // can't see the hero, spin slowly
        this.facing = this.facing.rotate(0.002).norm2();
      }
    }
  }

  drawBody() {
    line(
      this.drawPos,
      this.drawPos.add(
        this.facing
          .norm2()
          .mult(this.width / 2 * 0.8)
          .rotate(0.2)
      ),
      this.drawColor,
      5
    );
    line(
      this.drawPos,
      this.drawPos.add(
        this.facing
          .norm2()
          .mult(this.width / 2 * 0.8)
          .rotate(-0.2)
      ),
      this.drawColor,
      5
    );
    const bgColor = this.getBackgroundColor();
    circle(this.drawPos, this.width / 2, bgColor, 5, this.drawColor);
    circle(this.drawPos, this.width / 2 * 0.8, bgColor, 5, this.drawColor);
  }
}
