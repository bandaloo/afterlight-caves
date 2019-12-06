import { Enemy, ShapeEnum } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import {
  centeredOutlineCircle,
  centeredOutlineRect,
  drawLine,
  centeredOutlineEllipse
} from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity
} from "../modules/gamemanager.js";
import { Entity } from "../modules/entity.js";

export class Chase extends Enemy {
  health = 3;
  followDistace = 500;
  following = false;
  followTimer = 0;
  followTimerMax = 200;

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
    this.drag = 0.01;
  }

  action() {
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      // TODO make vector to helper function in entity
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (this.followTimer >= 0 || dirVec.magnitude() < this.followDistace) {
        this.followTimer--;
        this.following = true;
        this.acc = dirVec.norm2().mult(0.1);
      } else {
        this.following = false;
        this.acc = new Vector(0, 0);
      }
    }
  }

  drawFace() {
    /**
     * draw the eye
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawEye = scalar => {
      centeredOutlineEllipse(
        this.drawPos.add(new Vector(scalar * this.look.eyeSpacing, 0)),
        this.look.eyeSize * 3,
        this.look.eyeSize * 1.5,
        4,
        this.look.color,
        "black"
      );
    };

    /**
     * draw the pupil
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawPupil = scalar => {
      centeredOutlineCircle(
        this.drawPos.add(new Vector(scalar * this.look.eyeSpacing, 0)),
        this.look.eyeSize,
        4,
        this.look.color,
        "black"
      );
    };

    if (this.following) {
      drawEye(0);
      drawPupil(0);
    } else {
      drawLine(
        this.drawPos.sub(new Vector(this.look.eyeSize * 3, 0)),
        this.drawPos.add(new Vector(this.look.eyeSize * 3, 0)),
        this.look.color,
        4
      );
    }

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
    this.followTimer = this.followTimerMax;
  }
}
