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
   */
  constructor(pos, vel, acc = new Vector(0, 0), good) {
    super(pos, vel, acc);
    this.good = good;
    this.lifetime = 100;
    this.drag = 0.003;
    this.width = 24;
    this.height = 24;
    this.bounciness = 1;
    good ? (this.type = "PlayerBullet") : (this.type = "EnemyBullet");
  }

  action() {}

  draw() {
    centeredOutlineCircle(this.drawPos, this.width / 2, 4, "white", "black");
  }

  destroy() {
    for (let i = 0; i < 3; i++) {
      addParticle(
        new Particle(this.pos, "white", EffectEnum.spark, 8, 5, 0.12)
      );
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
  }
}
