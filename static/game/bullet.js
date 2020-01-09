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
   * @param {Vector} [pos]
   * @param {Vector} [vel]
   * @param {Vector} [acc]
   * @param {boolean} [good] false by default
   * @param {string} [color] default "white",
   * @param {number} [lifetime] how long this bullet survives, in game steps
   * @param {number} [damage] how much damage this bullet deals
   */
  constructor(
    pos = new Vector(0, 0),
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    good = false,
    color = "white",
    lifetime = 100,
    damage = 1
  ) {
    super(pos, vel, acc);
    this.good = good;
    this.lifetime = lifetime;
    this.drag = 0.003;
    this.width = 24;
    this.height = 24;
    this.bounciness = 0;
    this.color = color;
    this.damage = damage;
    /**
     * @type {{ name: string
     *        , data: number
     *        , func: (function(Bullet, number): void)
     *        }[]}
     */
    this.onDestroy = new Array();

    /**
     * @type {{ name: string
     *        , data: number
     *        , func: (function( Bullet
     *                         , number
     *                         , import("./creature.js").Creature
     *                         ): void
     *                )
     *        }[]}
     */
    this.onHitEnemy = new Array();
    this.damage = damage;
    good ? (this.type = "PlayerBullet") : (this.type = "EnemyBullet");
    // execute all onHitEnemy functions when we hit an enemy
    if (good) {
      this.collideMap.set(
        "Enemy",
        /** @param {import("./enemy.js").Enemy} e */ e => {
          for (const ohe of this.onHitEnemy) {
            if (ohe["func"]) ohe["func"](this, ohe["data"], e);
          }
        }
      );
    } else {
      // Enemies consider the Hero as their enemy
      this.collideMap.set(
        "Hero",
        /** @param {import("./hero.js").Hero} h */ h => {
          for (const ohe of this.onHitEnemy) {
            if (ohe["func"]) ohe["func"](this, ohe["data"], h);
          }
        }
      );
    }
  }

  action() {}

  draw() {
    centeredOutlineCircle(this.drawPos, this.width / 2, 4, this.color, "black");
  }

  destroy() {
    // execute all on-destroy functions
    for (const od of this.onDestroy) {
      if (od["func"]) od["func"](this, od["data"]);
    }

    // show sparks
    for (let i = 0; i < 3; i++) {
      const spark = new Particle(
        this.pos,
        this.color,
        EffectEnum.spark,
        8,
        5,
        0.12
      );
      spark.lineWidth = 5;
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
          const p = new Particle(entity.pos, "black", EffectEnum.square, 5, 3);
          p.lineWidth = 1;
          p.strokeStyle = "white";
          addParticle(p);
        }
      }
    }
    // remove the bullet if it's not supposed to bounce
    if (this.bounciness === 0) {
      this.deleteMe = true;
    } else {
      // bounce off
      this.vel = this.vel.norm2();
      this.vel = this.vel.mult(5 * this.rubberiness);
    }
  }
}
