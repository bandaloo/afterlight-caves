import { Cone } from "../game/powerups/cone.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { circle, polygon } from "./draw.js";
import { Enemy } from "./enemy.js";
import { randomNormalVec } from "../modules/helpers.js";

export class Scatter extends Enemy {
  /**
   * constructs a scatter enemy
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   */
  constructor(
    pos,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    matryoshka = 0
  ) {
    super(pos, vel, acc, matryoshka);
    this.baseHealth = 10;
    this.initHealth();
    new Cone(2).apply(this);
    this.bulletSpeed = 5;
    this.bulletLifetime = 300;
    this.fireDelay = 0;
    this.basePoints = 50;
  }

  destroy() {
    const vecToHero = getImportantEntity("hero")
      .pos.sub(this.pos)
      .norm2();
    this.shoot(vecToHero, undefined, 50);
    super.destroy();
  }

  action() {
    super.action();
    if (Math.random() < 0.01) {
      const acc = randomNormalVec().mult(0.1);
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
