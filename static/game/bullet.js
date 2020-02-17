import { getCell } from "../modules/collision.js";
import { Entity, FarEnum } from "../modules/entity.js";
import { addParticle, inbounds, setBlock } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { circle } from "./draw.js";
import { blockField } from "./generator.js";
import { CHEAT_RADIUS } from "./hero.js";
import { EffectEnum, Particle } from "./particle.js";
import { destroyBlock } from "./block.js";
import { playSound } from "../modules/sound.js";

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
    this.reflectsOffWalls = false;
    this.color = color;
    this.damage = damage;
    this.knockback = 3;
    /**
     * @type {{ name: string, data: number, func: (function(Bullet, number): void) }[]}
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
    this.farType = FarEnum.delete;
    this.type = good ? "PlayerBullet" : "EnemyBullet";
    // set function for when we hit enemies
    const entityType = this.good ? "Enemy" : "Hero";
    this.collideMap.set(
      entityType,
      /** @param {import ("./creature.js").Creature} c */ c => {
        // deal basic damage
        c.takeDamage(this.damage);
        // impart momentum
        const size = (c.width * c.height) / 300;
        c.vel = c.vel.add(this.vel.mult(this.knockback / size));
        // call onHitEnemy functions
        for (const ohe of this.onHitEnemy) {
          if (ohe.func) ohe.func(this, ohe.data, c);
        }
        this.deleteMe = true;
      }
    );
  }

  action() {}

  draw() {
    // the min here is so you don't get an error for drawing circle with width
    // too big
    circle(
      this.drawPos,
      this.width / 2,
      "black",
      Math.max(1, Math.min(4 + (this.damage / 10 - 1) * 2, this.width / 2)),
      this.color
    );
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
   * @param {Vector} pos
   */
  collideWithBlock(pos) {
    const cellVec = getCell(pos);
    if (
      inbounds(cellVec.x, cellVec.y) &&
      blockField[cellVec.x][cellVec.y].durability !== Infinity
    ) {
      if (setBlock(cellVec.x, cellVec.y, 0)) {
        destroyBlock(cellVec, this.type === "PlayerBullet");
        if (this.onScreen()) playSound("hit-breakable");
      }
    }
    // remove the bullet if it's not supposed to bounce
    if (!this.reflectsOffWalls) {
      this.deleteMe = true;
    }
  }
}
