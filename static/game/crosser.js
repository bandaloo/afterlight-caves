import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { polygon } from "./draw.js";

/**
 * alternately shoots bullets at 45 degrees and in cardinal directions. has no
 * movement AI but can be knocked around, which creates interesting scenarios.
 * more of a turret, so it doesn't have a face
 */
export class Crosser extends Enemy {
  /**
   * constructs a crosser entity
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, vel, acc, matryoshka) {
    super(pos, vel, acc, matryoshka);
    this.baseHealth = 20;
    this.initHealth();
    this.basePoints = 60;

    // stuff for shooting
    this.fireDelay = 90;
    this.bulletSpeed = 3;
    this.bulletLifetime = 300;
    this.wiggleCount = 0;
    this.diagonalMod = 0;
    this.bulletsPerShot = 4;
  }

  action() {
    super.action();
    const section = 360 / this.bulletsPerShot;
    if (
      this.shoot(
        new Vector(1, 0),
        this.vel,
        360 - section,
        (section / 2) * this.diagonalMod
      )
    ) {
      this.diagonalMod ^= 1; // flip 0 -> 1 and 1 -> 0
    }
    this.wiggleCount++;
  }

  drawBody() {
    const sides = this.bulletsPerShot * 2;
    for (let i = 0; i < 2; i++) {
      polygon(
        this.drawPos,
        sides,
        this.width * 1.2,
        this.height * 1.2,
        0,
        this.getBackgroundColor(),
        this.drawColor,
        5,
        n => {
          const a = Math.sin(
            (this.wiggleCount / (this.fireDelay * 2)) * 2 * Math.PI +
              Math.PI / 2
          );
          return (
            (1 - 0.2 * i) *
            (1 + (0.3 + i * 0.2) * a * Math.sin((sides / 2) * n + Math.PI / 2))
          );
        }
      );
    }
  }
}
