import {
  getCell,
  CollisionBox,
  nextIntersection,
  CollisionBeam
} from "../modules/collision.js";
import { Entity, FarEnum } from "../modules/entity.js";
import { addParticle, inbounds } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { circle } from "./draw.js";
import { blockField } from "./generator.js";
import { EffectEnum, Particle } from "./particle.js";
import { destroyBlock } from "./block.js";
import { line } from "./draw.js";
import { Creature } from "./creature.js";

export class Bullet extends Entity {
  /**
   * constructs a new bullet
   * @param {Vector} [pos]
   * @param {Vector} [vel]
   * @param {Vector} [acc]
   * @param {import("./creature.js").Creature} owner the creature that fired
   * this bullet
   * @param {string} [color] default "white",
   * @param {number} [lifetime] how long this bullet survives, in game steps
   * @param {number} [damage] how much damage this bullet deals
   */
  constructor(
    pos = new Vector(0, 0),
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    owner,
    color = "white",
    lifetime = 100,
    damage = 1
  ) {
    super(pos, vel, acc);
    this.good = owner !== undefined && owner.type === "Hero";
    this.owner = owner;
    this.lifetime = lifetime;
    this.drag = 0.003;
    this.width = 24;
    this.height = 24;
    this.reflectsOffWalls = false;
    this.color = color;
    this.damage = damage;
    this.knockback = 3;
    /**@type {"Box"|"Circle"}*/
    this.collisionType = "Box";
    this.angle = 0;

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
    this.type = this.good ? "PlayerBullet" : "EnemyBullet";
    // set function for when we hit enemies
    const entityType = this.good ? "Enemy" : "Hero";
    this.collideMap.set(entityType, this.touchEnemy.bind(this));
  }

  /**
   * called when this bullet touches an enemy (for enemy bullets this is called
   * when it touches the hero)
   * @param {import("./creature.js").Creature} creature
   */
  touchEnemy(creature) {
    // deal basic damage
    creature.takeDamage(this.damage, this.vel.norm2());
    // impart momentum
    const size = (creature.width * creature.height) / 300;
    creature.vel = creature.vel.add(this.vel.mult(this.knockback / size));
    // call onHitEnemy functions
    for (const ohe of this.onHitEnemy) {
      if (ohe.func) ohe.func(this, ohe.data, creature);
    }
    this.deleteMe = true;
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
      destroyBlock(cellVec, this.type === "PlayerBullet");
    }
    // remove the bullet if it's not supposed to bounce
    if (!this.reflectsOffWalls) {
      this.deleteMe = true;
    }
  }
}

export class Beam extends Bullet {
  /**
   * Constructs a new beam. Beams don't have velocity or acceleration. Instead,
   * they have a starting point (pos) and length
   * @param {Vector} [pos] the position of the origin of the beam
   * @param {Vector} [vel] the direction the beam is facing
   * @param {Vector} [acc] ignored
   * @param {import("./creature.js").Creature} owner the creature that fired
   * this beam
   * @param {string} [color] default "white",
   * @param {number} [lifetime] how long this beam survives, in game steps
   * @param {number} [damage] how much damage this beam deals
   */
  constructor(
    pos = new Vector(0, 0),
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    owner,
    color = "white",
    lifetime = 100,
    damage = 1
  ) {
    super(
      pos,
      new Vector(0, 0),
      new Vector(0, 0),
      owner,
      color,
      lifetime,
      damage
    );
    this.length = 0;
    // basically the faster your bullets are the more often your beam hits
    this.cooldown = Math.floor((1 / vel.mag()) * 200);
    this.dir = vel.norm2();
    this.lifetime = 100;
    this.occludedByWalls = false;
    // rate limit breaking blocks
    this.maxBlockBreakCounter = 5;
    this.blockBreakCounter = this.maxBlockBreakCounter - 1;
    this.creaturesHit = {};
  }

  /** @override */
  getCollisionShape() {
    return new CollisionBeam(
      this.pos,
      this.pos.add(this.dir.mult(this.length)),
      this.width
    );
  }

  /**
   * Draw a beam with a white core and bullet color glow. The white section is
   * thicker the more damage this deals
   * @override
   */
  draw() {
    this.drawPos = this.owner.drawPos.add(
      this.owner.facing.mult(Math.min(this.owner.width) / 4)
    );
    line(
      this.drawPos,
      this.pos.add(this.dir.mult(this.length)),
      this.color,
      this.width
    );
    line(
      this.drawPos,
      this.pos.add(this.dir.mult(this.length)),
      "white",
      Math.min(this.damage * 0.75, this.width - 4)
    );
  }

  /**
   * called when this beam touches an enemy (for enemy beams this is called
   * when it touches the hero)
   * @param {import("./creature.js").Creature} creature
   */
  touchEnemy(creature) {
    // if we haven't hit the creature yet, hit it and set the cooldown
    if (this.creaturesHit[creature.id] === undefined) {
      this.creaturesHit[creature.id] = { c: creature, cooldown: this.cooldown };
      // deal basic damage
      creature.takeDamage(this.damage, this.dir);
      // impart momentum
      const size = (creature.width * creature.height) / 1000;
      creature.acc = creature.acc.add(this.dir.mult(this.knockback / size));
      // call onHitEnemy functions
      for (const ohe of this.onHitEnemy) {
        if (ohe.func) ohe.func(this, ohe.data, creature);
      }
    }
  }

  /** @override */
  destroy() {
    // execute all on-destroy functions
    for (const od of this.onDestroy) {
      if (od.func) od.func(this, od.data);
    }
  }

  /**
   * what to do when hitting a block
   * @override
   * @param {Vector} pos
   */
  collideWithBlock(pos) {
    const cellVec = getCell(pos);
    if (
      inbounds(cellVec.x, cellVec.y) &&
      blockField[cellVec.x][cellVec.y].durability !== Infinity
    ) {
      destroyBlock(cellVec, this.type === "PlayerBullet");
    }
  }

  /**
   * @override
   * calculate length and set position each step
   */
  action() {
    if (this.owner.deleteMe) this.deleteMe = true;
    this.dir = this.owner.facing.rotate(this.angle);
    this.pos = this.owner.pos.add(
      this.owner.facing.mult(Math.min(this.owner.width) / 4)
    );
    const intersect = nextIntersection(this.pos, this.dir);
    // rate limit block collisions
    if (this.blockBreakCounter === this.maxBlockBreakCounter)
      this.collideWithBlock(intersect);
    this.length = intersect.sub(this.pos).mag();

    // tick down cooldowns
    if (this.blockBreakCounter++ > this.maxBlockBreakCounter)
      this.blockBreakCounter = 0;
    for (const key in this.creaturesHit) {
      if (this.creaturesHit[key]) {
        if (this.creaturesHit[key].cooldown === 0)
          this.creaturesHit[key] = undefined;
        else
          this.creaturesHit[key].cooldown--;
      }
    }

  }
}
