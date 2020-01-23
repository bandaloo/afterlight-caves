import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, circle } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity
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
    this.maxHealth = 2;
    this.gainHealth(2);
    this.fireDelay = 90;
    this.bulletSpeed = 3;
    this.bulletLifetime = 120;
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

  drawFace() {
    // TODO make this actually look good
    /**
     * draw a single eye
     * @param {number} x change this to modify what side of face to draw
     * @param {number} y change this to modify what side of face to draw
     */
    const drawEye = (x, y) => {
      circle(
        this.drawPos.add(
          new Vector(x * this.look.eyeSpacing, y * this.look.eyeSpacing)
        ),
        this.look.eyeSize,
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

    // draw the mouth
    const mouthHalf = this.look.mouthWidth / 2;

    line(
      new Vector(
        this.drawPos.x + mouthHalf,
        this.drawPos.y + this.look.mouthOffset + 5
      ),
      new Vector(
        this.drawPos.x - mouthHalf,
        this.drawPos.y + this.look.mouthOffset + 5
      ),
      this.drawColor,
      4
    );
  }
}
