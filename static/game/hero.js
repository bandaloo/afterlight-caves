import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle } from "./draw.js";
import { buttons } from "./buttons.js";
import { addParticle, addToWorld } from "../modules/gamemanager.js";
import { Bullet } from "./bullet.js";
import { Particle, EffectEnum } from "./particle.js";
import { PowerUp } from "./powerup.js";

export class Hero extends Entity {
  fireDelay = 10; // game steps to wait before firing
  fireCount = 0;
  drag = 0.1; // movement deceleration
  health = 3; // hits taken before dying
  eyeDirection = new Vector(0, 1);

  /**
   * @param startingPos {Vector} the starting position of this Hero
   * @constructor
   */
  constructor(startingPos) {
    super(startingPos);
    this.type = "Hero";
    this.width = 50;
    this.height = 50;

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
      // shoot a bullet
      if (this.fireCount === 0) {
        let b = new Bullet(
          this.pos.add(buttons.shoot.vec.mult(this.width / 2)),
          buttons.shoot.vec.mult(10).add(this.vel),
          new Vector(0, 0),
          true
        );
        b.bounciness = this.bulletBounciness;
        b.rubberiness = this.bulletRubberiness;
        addToWorld(b);
      }
      this.fireCount++;
      this.fireCount %= this.fireDelay;
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
