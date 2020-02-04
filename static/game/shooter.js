import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, circle, polygon } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity,
  getTotalTime
} from "../modules/gamemanager.js";

export class Shooter extends Enemy {
  avoidDistace = 500;
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
  constructor(
    pos,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    matryoshka = 0
  ) {
    super(pos, vel, acc, matryoshka);
    this.maxHealth = 2;
    this.gainHealth(2);
    this.fireDelay = 90;
    this.bulletSpeed = 3;
    this.bulletLifetime = 180;
    this.collideMap.set("Hero", e => {
      this.avoidTimer = this.avoidTimerMax;
    });
  }

  action() {
    super.action();
    // TODO make this AI better
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (this.avoidTimer >= 0 || dirVec.magnitude() < this.avoidDistace) {
        this.avoidTimer--;
        this.avoiding = true;
        this.acc = dirVec
          .norm2()
          .mult(-0.15)
          .mult(this.movementMultiplier);
      } else {
        this.avoiding = false;
        this.acc = new Vector(0, 0);
      }

      if (dirVec.magnitude() < this.shootDistance) {
        this.shoot(dirVec, this.vel);
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
