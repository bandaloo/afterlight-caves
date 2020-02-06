import { Enemy, ShapeEnum } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, ellipse, circle, polygon } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity,
  getGameTime
} from "../modules/gamemanager.js";

export class Chase extends Enemy {
  followDistace = 500;
  following = false;
  followTimer = 0;
  followTimerMax = 200;

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0), matryoshka) {
    super(pos, vel, acc, matryoshka);
    this.drag = 0.015;
    this.maxHealth = 2;
    this.gainHealth(2);
    this.collideMap.set("PlayerBullet", e => {
      console.log("follow timer set");
      this.followTimer = this.followTimerMax;
    });
  }

  /**
   * @override
   * @param {import("./hero.js").Hero} hero
   */
  touchHero(hero) {
    super.touchHero(hero);
  }

  action() {
    super.action();
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      // TODO make vector to helper function in entity
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (this.followTimer >= 0 || dirVec.magnitude() < this.followDistace) {
        this.followTimer--;
        this.following = true;
        this.acc = dirVec
          .norm2()
          .mult(0.15)
          .mult(this.movementMultiplier);
      } else {
        this.following = false;
        this.acc = new Vector(0, 0);
      }
    }
  }

  drawBody() {
    const sides = 5;
    const bgColor = this.getBackgroundColor();
    for (let i = 0; i < 2; i++) {
      polygon(
        this.drawPos,
        sides,
        this.width * 1.2,
        this.height * 1.2,
        getGameTime() / 1000 + (i * sides) / 2 / 5,
        bgColor,
        this.drawColor,
        5,
        n => 1 + Math.sin(2 * n + getGameTime() / (200 + 100 * i)) / 5
      );
    }
  }

  drawFace() {
    const eyeSpacing = 5;
    const eyeSize = 7;
    /**
     * draw the eye
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawEye = scalar => {
      ellipse(
        this.drawPos.add(new Vector(scalar * eyeSpacing, 0)),
        eyeSize * 3,
        eyeSize * 1.5,
        undefined,
        4,
        this.drawColor
      );
    };

    /**
     * draw the pupil
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawPupil = scalar => {
      circle(
        this.drawPos.add(new Vector(scalar * eyeSpacing, 0)),
        eyeSize,
        undefined,
        4,
        this.drawColor
      );
    };

    if (this.following) {
      drawEye(0);
      drawPupil(0);
    } else {
      line(
        this.drawPos.sub(new Vector(eyeSize * 3, 0)),
        this.drawPos.add(new Vector(eyeSize * 3, 0)),
        this.drawColor,
        4
      );
    }

    const mouthWidth = 16;
    const mouthOffset = 10;

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
