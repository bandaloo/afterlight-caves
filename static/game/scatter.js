import { Enemy, ShapeEnum } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import {
  centeredOutlineCircle,
  centeredOutlineRect,
  drawLine
} from "./draw.js";
import { addParticle } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";

export class Scatter extends Enemy {
  health = 3;

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
    acc = new Vector(0, 0)
  ) {
    super(pos, look, stats, vel, acc);
  }

  action() {
    // TODO change this
    if (Math.random() < 0.01) {
      const randomDir = Math.random() * 2 * Math.PI;
      const acc = new Vector(
        Math.cos(randomDir) * 0.1,
        Math.sin(randomDir) * 0.1
      );
      this.acc = acc;
    }
  }

  draw() {
    // draw the body
    if (this.look.shape === ShapeEnum.circle) {
      centeredOutlineCircle(
        this.drawPos,
        this.width / 2,
        4,
        this.look.color,
        "black"
      );
    } else {
      centeredOutlineRect(
        this.drawPos,
        this.width,
        this.height,
        4,
        this.look.color,
        "black"
      );
    }

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

  destroy() {
    for (let i = 0; i < 30; i++) {
      addParticle(new Particle(this.pos, this.look.color, EffectEnum.spark));
    }
    console.log("i got destroyed");
  }
}
