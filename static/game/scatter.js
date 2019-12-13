import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle, drawLine } from "./draw.js";

export class Scatter extends Enemy {
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
  }

  action() {
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

  drawFace() {
    /**
     * draw a single eye
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawEye = scalar => {
      centeredOutlineCircle(
        this.drawPos.add(new Vector(scalar * this.look.eyeSpacing, 0)),
        this.look.eyeSize,
        4,
        this.look.color,
        "black"
      );
    };

    // draw the eyes
    drawEye(1);
    drawEye(-1);

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
}
