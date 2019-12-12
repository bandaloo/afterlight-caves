import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle, drawLine } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity
} from "../modules/gamemanager.js";
import { Entity } from "../modules/entity.js";

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
    this.currentHealth = 2;
    this.fireDelay = 90;
    this.bulletSpeed = 3;
    this.bulletLifetime = 120;
  }

  action() {
    // TODO make this AI better
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (this.avoidTimer >= 0 || dirVec.magnitude() < this.avoidDistace) {
        this.avoidTimer--;
        this.avoiding = true;
        this.acc = dirVec.norm2().mult(-0.15);
      } else {
        this.avoiding = false;
        this.acc = new Vector(0, 0);
      }

      if (dirVec.magnitude() < this.shootDistance) {
        this.shoot(dirVec, false, this.look.color);
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
      centeredOutlineCircle(
        this.drawPos.add(
          new Vector(x * this.look.eyeSpacing, y * this.look.eyeSpacing)
        ),
        this.look.eyeSize,
        2,
        this.look.color,
        "black"
      );
    };

    // draw the eyes
    drawEye(-1, -1);
    drawEye(1, -1);
    drawEye(0.6, -2);
    drawEye(-0.6, -2);

    // draw the mouth
    const mouthHalf = this.look.mouthWidth / 2;

    drawLine(
      new Vector(
        this.drawPos.x + mouthHalf,
        this.drawPos.y + this.look.mouthOffset
      ),
      new Vector(
        this.drawPos.x - mouthHalf,
        this.drawPos.y + this.look.mouthOffset
      ),
      this.look.color,
      4
    );
  }

  /**
   * @param {Entity} entity
   */
  hit(entity) {
    super.hit(entity);
    this.avoidTimer = this.avoidTimerMax;
  }
}
