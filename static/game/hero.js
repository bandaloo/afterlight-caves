import { Vector } from "../modules/vector.js";
import { centeredOutlineCircle } from "./draw.js";
import { buttons } from "./buttons.js";
import { addParticle } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { PowerUp } from "./powerup.js";
import { Creature } from "./creature.js";
import { Entity } from "../modules/entity.js";
import { Bullet } from "./bullet.js";
import { playSound } from "../modules/sound.js";

const DEFAULT_SIZE = 50;

export class Hero extends Creature {
  drag = 0.1; // movement deceleration
  eyeDirection = new Vector(0, 1);
  invincibilityFrames = 0;
  invincibilityFramesMax = 100;

  /**
   * @param startingPos {Vector} the starting position of this Hero
   * @constructor
   */
  constructor(startingPos) {
    super(startingPos);
    this.type = "Hero";

    // set initial attributes
    this.width = DEFAULT_SIZE;
    this.height = DEFAULT_SIZE;
    this.fireDelay = 20;
    this.maxHealth = 100;
    this.currentHealth = this.maxHealth;
    this.bulletSpeed = 8;
    this.bulletLifetime = 80;

    // collect powerups when you collide with them
    this.collideMap.set("PowerUp", entity => {
      playSound("sounds/spacey-snd.wav");
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

    this.collideMap.set("Enemy", entity => {
      this.hit(entity);
    });

    this.collideMap.set("EnemyBullet", entity => {
      this.hit(entity);
    });
  }

  /**
   * Draws the hero at its position in the world
   */
  draw() {
    centeredOutlineCircle(
      this.drawPos,
      this.width / 2,
      4,
      "white",
      this.invincibilityFrames > 0
        ? `rgba(255, 255, 255, ${this.invincibilityFrames /
            this.invincibilityFramesMax})`
        : "black"
    );
    centeredOutlineCircle(
      this.drawPos.add(this.eyeDirection.mult(10)),
      10,
      4,
      "white"
    );
  }

  action() {
    if (Math.random() < 0.01) {
      if (this.width > DEFAULT_SIZE || this.height > DEFAULT_SIZE) {
        this.width = Math.floor(this.width - 1);
        this.height = Math.floor(this.height - 1);
      }
      if (this.width < DEFAULT_SIZE || this.height < DEFAULT_SIZE) {
        this.width = Math.ceil(this.width + 1);
        this.height = Math.ceil(this.height + 1);
      }
    }

    if (this.invincibilityFrames > 0) {
      this.invincibilityFrames--;
    }
    this.acc = buttons.move.vec.mult(this.movementMultiplier);
    // prevents velocity from getting too small and normalization messing up
    if (this.shoot(buttons.shoot.vec, true, undefined, this.vel)) {
      console.log("shot");
      playSound("sounds/laser-shot.wav");
    }
    if (!buttons.shoot.vec.isZeroVec()) {
      const normalizedShootVec = buttons.shoot.vec.norm2();
      this.eyeDirection = normalizedShootVec;
    } else if (this.vel.magnitude() > 0.001) {
      this.eyeDirection = this.vel.norm();
    }
  }

  /**
   * @override
   */
  collideWithBlock() {
    if (this.bounciness > 0) {
      this.vel = this.vel.norm2();
      this.vel = this.vel.mult(5 * this.rubberiness);
    }
  }

  /**
   * get hit by an enemy or enemy bullet
   * @param {Entity} entity
   */
  hit(entity) {
    // TODO move this scalar somewhere else
    const damageScalar = 10;
    const damage = Math.floor(
      (entity.type === "Enemy"
        ? /** @type {Creature} */ (entity).bulletDamage
        : /** @type {Bullet} */ (entity).damage) * damageScalar
    );

    // basically leniency as far as taking damage goes
    const hitBuffer = 10;

    const hitDist = entity.width + this.width - hitBuffer;

    if (this.invincibilityFrames == 0) {
      if (this.pos.dist(entity.pos) < hitDist) {
        this.currentHealth -= damage;
        this.invincibilityFrames = this.invincibilityFramesMax;
        if (entity.type === "EnemyBullet") {
          entity.deleteMe = true;
        }
        if (this.currentHealth < 0) {
          this.currentHealth = 0;
        }
      }
    }
  }
}
