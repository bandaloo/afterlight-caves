import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, circle, polygon } from "./draw.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { Cone } from "../game/powerups/cone.js";

export class Scatter extends Enemy {
  // TODO get rid of modifiers
  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {import("./enemy.js").Look} look
   * @param {import("./enemy.js").Stats} stats
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(
    pos,
    look,
    stats,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    modifiers = { size: 0, speed: 0, explode: 0 }
  ) {
    super(pos, look, stats, vel, acc, modifiers);
    // TODO weird that you have to give a powerup a position, even if just using
    // it to apply directly
    new Cone(new Vector(0, 0), 1).apply(this);
    this.maxHealth = 2;
    this.gainHealth(2);
    this.bulletSpeed = 5;
    this.bulletLifetime = 300;
    this.fireDelay = 0;
  }

  destroy() {
    console.log(getImportantEntity("hero"));
    const vecToHero = getImportantEntity("hero")
      .pos.sub(this.drawPos)
      .norm2();
    this.shoot(vecToHero);
    super.destroy();
  }

  action() {
    super.action();
    // TODO change this
    if (Math.random() < 0.01) {
      const randomDir = Math.random() * 2 * Math.PI;
      const acc = new Vector(
        Math.cos(randomDir) * 0.1,
        Math.sin(randomDir) * 0.1
      );
      this.acc = acc.mult(this.movementMultiplier);
    }
  }

  drawBody() {
    const sides = 3;
    const bgColor = this.getBackgroundColor();
    polygon(
      this.drawPos,
      sides,
      this.width,
      this.height,
      Math.atan2(this.vel.y, this.vel.x),
      bgColor,
      this.drawColor
    );
  }

  drawFace() {
    const drawEye = (scalar, offset) => {
      circle(
        this.drawPos.add(offset),
        scalar,
        "rgba(0, 0, 0, 0)",
        4,
        this.drawColor
      );
    };

    const vecToHero = getImportantEntity("hero")
      .pos.sub(this.drawPos)
      .norm2();

    drawEye(8, vecToHero.mult(10));
    drawEye(16, new Vector(0, 0));
  }
}
