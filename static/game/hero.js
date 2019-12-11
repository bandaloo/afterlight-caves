import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle } from "./draw.js";
import { buttons } from "./buttons.js";
import { addParticle } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { PowerUp } from "./powerup.js";
import { Creature } from "./creature.js";

export class Hero extends Creature {
  drag = 0.1; // movement deceleration
  eyeDirection = new Vector(0, 1);

  /**
   * @param startingPos {Vector} the starting position of this Hero
   * @constructor
   */
  constructor(startingPos) {
    super(startingPos);
    this.type = "Hero";

    // set initial attributes
    this.width = 50;
    this.height = 50;
    this.fireDelay = 20;
    this.maxHealth = 30;
    this.currentHealth = this.maxHealth;
    this.bulletSpeed = 10;

    // collect powerups when you collide with them
    this.collideMap.set("PowerUp", entity => {
      /** @type {PowerUp} */ (entity).apply(this);
      for (let i = 0; i < 60; i++) {
        let randColor =
          "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 50%)";
        const spark = new Particle(this.pos, randColor, EffectEnum.spark);
        spark.width = 15;
        spark.multiplier = 8;
        addParticle(spark);
      }
      entity.deleteMe = true;
    });
  }

  /**
   * Draws the hero at its position in the world
   */
  draw() {
    centeredOutlineCircle(this.drawPos, this.width / 2, 4, "white", "black");
    centeredOutlineCircle(
      this.drawPos.add(this.eyeDirection.mult(10)),
      10,
      4,
      "white"
    );
  }

  action() {
    this.acc = buttons.move.vec;
    // prevents velocity from getting too small and normalization messing up
    if (!buttons.shoot.vec.isZeroVec()) {
      this.eyeDirection = buttons.shoot.vec;
      this.shoot(buttons.shoot.vec, true);
    } else if (this.vel.magnitude() > 0.001) {
      this.eyeDirection = this.vel.norm();
    }
  }

  /**
   * @override
   */
  collideWithBlock() {
    if (this.bounciness > 0) {
      this.vel = this.vel.norm();
      this.vel = this.vel.mult(5 * this.rubberiness);
    }
  }
}
