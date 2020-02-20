import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, circle, polygon } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity
} from "../modules/gamemanager.js";
import { randomInt } from "../modules/helpers.js";

export class Shooter extends Enemy {
  avoidDistance = 600;
  chaseDistance = 400;
  avoiding = false;
  avoidTimer = 0;
  avoidTimerMax = 200;
  shootDistance = 700;

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, vel, acc, matryoshka) {
    super(pos, vel, acc, matryoshka);
    this.baseHealth = 20;
    this.initHealth();
    this.fireDelay = 90;
    this.bulletSpeed = 5;
    this.bulletLifetime = 500;
    this.basePoints = 80;
    this.drag = 0.007;
    this.collideMap.set("PlayerBullet", e => {
      this.avoidTimer = this.avoidTimerMax;
    });
    // scalar to switch strafing directions (-1 or 1)
    this.strafeScalar = randomInt(2);
  }

  action() {
    super.action();
    // TODO make this AI better
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      if (Math.random() < 0.01) {
        this.strafeScalar *= -1;
      }
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      const strafeVec = dirVec.norm2().rotate(Math.PI / 2);
      // TODO do we need avoid timer
      if (this.avoidTimer >= 0 || dirVec.magnitude() < this.avoidDistance) {
        this.avoidTimer--;
        this.avoiding = true;
        this.acc = dirVec
          .norm2()
          .mult(0.15 * (this.chaseDistance > dirVec.magnitude() ? -1.5 : 1))
          .mult(this.movementMultiplier)
          .add(strafeVec.mult(0.05 * this.strafeScalar));
      } else {
        this.avoiding = false;
        this.acc = new Vector(0, 0);
      }

      if (dirVec.magnitude() < this.shootDistance) {
        this.shoot(dirVec, this.vel.mult(0.2));
      }
    }
  }

  drawBody() {
    const sides = 6;
    const bgColor = this.getBackgroundColor();
    for (let i = 0; i < 2; i++) {
      polygon(
        this.drawPos,
        sides,
        this.width * 1.2,
        this.height * 1.2,
        ((i + 0.5) * this.vel.x) / 20,
        bgColor,
        this.drawColor,
        5
      );
    }
  }

  drawFace() {
    const eyeSpacing = 10;
    const eyeSize = 6;

    /**
     * draw a single eye
     * @param {number} x change this to modify what side of face to draw
     * @param {number} y change this to modify what side of face to draw
     */
    const drawEye = (x, y) => {
      circle(
        this.drawPos.add(new Vector(x * eyeSpacing, y * eyeSpacing)),
        eyeSize,
        undefined,
        4,
        this.drawColor
      );
    };

    // draw the eyes
    drawEye(1, -0.5);
    drawEye(-1, -0.5);
    drawEye(0.8, 0.5);
    drawEye(-0.8, 0.5);

    const mouthWidth = 30;
    const mouthOffset = 12;

    // draw the mouth
    const mouthHalf = mouthWidth / 2;

    line(
      new Vector(this.drawPos.x + mouthHalf, this.drawPos.y + mouthOffset),
      new Vector(this.drawPos.x - mouthHalf, this.drawPos.y + mouthOffset),
      this.drawColor,
      4
    );
  }
}
