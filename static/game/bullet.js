import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { centeredOutlineCircle } from "./draw.js";
import { getCell } from "../modules/collision.js";
import { setBlock, addParticle, inbounds } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { blockField } from "./generator.js";

export class Bullet extends Entity {
  /**
   * constructs a new bullet
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {boolean} good
   * @param {string} [color] default "white"
   */
  constructor(pos, vel, acc = new Vector(0, 0), good, color = "white") {
    super(pos, vel, acc);
    this.good = good;
    this.lifetime = 100;
    this.drag = 0.003;
    this.width = 24;
    this.height = 24;
    this.bounciness = 0;
    this.color = color;
    good ? (this.type = "PlayerBullet") : (this.type = "EnemyBullet");
  }

  action() {}

  draw() {
    centeredOutlineCircle(this.drawPos, this.width / 2, 4, this.color, "black");
  }

  destroy() {
    for (let i = 0; i < 3; i++) {
      const spark = new Particle(
        this.pos,
        "white",
        EffectEnum.spark,
        8,
        5,
        0.12
      );
      spark.width = 5;
      addParticle(spark);
    }
  }

  /**
   * what to do when hitting a block
   * @param {Entity} entity
   */
  collideWithBlock(entity) {
    const cellVec = getCell(entity.pos);
    if (
      inbounds(cellVec.x, cellVec.y) &&
      blockField[cellVec.x][cellVec.y].durability !== Infinity
    ) {
      if (setBlock(cellVec.x, cellVec.y, 0)) {
        for (let i = 0; i < 15; i++) {
          addParticle(
            new Particle(entity.pos, "black", EffectEnum.square, 5, 3)
          );
        }
      }
    }
    // remove the bullet if it's not supposed to bounce
    if (this.bounciness === 0) {
      this.deleteMe = true;
    } else {
      // bounce off
      this.vel = this.vel.norm();
      this.vel = this.vel.mult(5 * this.rubberiness);
    }
  }
}
