import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { Bullet } from "./bullet.js";
import { addToWorld, getDimensions } from "../modules/gamemanager.js";
import { StatusEffect } from "./statuseffect.js";

/**
 * Class representing an entity that moves around and shoots, such as enemies
 * or the Hero
 * @abstract
 */
export class Creature extends Entity {
  /** @type {number} 0 if bullets don't bounce, 1 if they do */
  bulletBounciness = 0;

  /** @type {number} rubberiness of bullets spawned by this */
  bulletRubberiness = 0;

  /** @type {number} speed of bullets spawned by this */
  bulletSpeed = 1;

  /** @type {number} how long bullets spawned by this live */
  bulletLifetime = 100;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the powerup the function came from, a data, which is some number the
   * function takes, and a func, which is a funciton to execute when the bullet
   * gets destroyed
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bullet, number): void)
   *        }[]}
   */
  bulletOnDestroy;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the powerup or effect the function came from, a data, which is some number
   * the function takes, and a func, which is a function to execute when the
   * bullet hits an enemy
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bullet, number, Creature): void)
   *        }[]}
   */
  bulletOnHitEnemy;

  /** @type {number} the number of game steps to wait between each shot */
  fireDelay = 30;

  /** @type {number} counter for fireDelay */
  fireCount = 0;

  /** @type {number} the amount of damage this can take before dying */
  maxHealth = 10;

  /**
   * @type {number} this creature's current health. Don't directly get or set
   * this! Instead use `takeDamage()` or `gainHealth()`
   * @private
   */
  currentHealth = 10;

  /** @type {number} the amount of damage each bullet deals */
  bulletDamage = 1;

  /** @type {number} size of bullets spawned by this */
  bulletSize = 24;

  /** @type {number} A multiplier for how fast the creature moves */
  movementMultiplier = 1;

  /** @type {Map<string, number>}*/
  powerUps = new Map();

  /** @type {StatusEffect[]} */
  statusEffects = new Array();

  /**
   * @param {Vector} [pos] initial position
   * @param {Vector} [vel] initial velocity
   * @param {Vector} [acc] initial acceleration
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    super(pos, vel, acc);
    this.bulletOnDestroy = new Array();
    this.bulletOnHitEnemy = new Array();
  }

  /**
   * An action, e.g. shoot, that a creature does every step. Sub-classes should
   * call `super.action()` in their own action methods to apply status effects
   * each step
   */
  action() {
    for (const se of this.statusEffects) {
      if (se) se.action(this);
    }
  }

  /**
   * Draw this creature. Sub-classes should call `super.draw()` in their action
   * methods to draw status effects each step
   */
  draw() {
    for (const se of this.statusEffects) {
      if (se) se.draw(this);
    }
  }

  /**
   * Gets this creature's bullet.
   *
   * You should always use this method instead of calling `new Bullet' dirrectly
   * @param {Vector} dir
   * @param {boolean} [isGood]
   * @param {string} [color]
   * @return {Bullet}
   */
  getBullet(dir, isGood = false, color = "white") {
    const b = new Bullet(
      this.pos.add(dir.mult(this.width / 2)),
      dir.norm2().mult(this.bulletSpeed),
      new Vector(0, 0),
      isGood,
      color,
      this.bulletLifetime,
      this.bulletDamage
    );
    b.bounciness = this.bulletBounciness;
    b.rubberiness = this.bulletRubberiness;
    b.onDestroy = this.bulletOnDestroy;
    b.onHitEnemy = this.bulletOnHitEnemy;
    b.width = this.bulletSize;
    return b;
  }

  /**
   * Shoots in the given direction
   * @param {Vector} dir the direction to shoot in
   * @param {boolean} [isGood] true if this was shot by the hero, false
   * otherwise (the default)
   * @param {string} [color] color of the bullet, default white
   * @param {Vector} [additionalVelocity]
   */
  shoot(
    dir,
    isGood = false,
    color = "white",
    additionalVelocity = new Vector(0, 0)
  ) {
    dir = dir.norm2();
    // Conditional is so fire count doesn't roll over before shooting
    if (this.fireCount < this.fireDelay) {
      this.fireCount++;
    }
    if (dir.isZeroVec()) {
      // can't shoot without a direction
      return;
    }
    // shoot a bullet
    if (this.fireCount >= this.fireDelay) {
      const b = this.getBullet(dir, isGood, color);
      b.vel = b.vel.add(additionalVelocity);
      addToWorld(b);
      this.fireCount = 0;
    }
  }

  /**
   * Decreases the creatures current health by amt, killing it if necessary
   * @param {number} amt the amount of damage dealt
   */
  takeDamage(amt) {
    this.currentHealth -= amt;
    if (this.currentHealth <= 0) {
      if (this.type !== "Hero") // TODO remove this so the hero can die
        this.deleteMe = true;
    }
  }

  /**
   * Increases current health by amt, up to a cap of maxHealth
   * @param {number} amt the amount of health to gain
   */
  gainHealth(amt) {
    this.currentHealth = Math.min(this.currentHealth + amt, this.maxHealth);
  }

  /**
   * Returns this creature's current health
   * @return {number}
   */
  getCurrentHealth() {
    return this.currentHealth;
  }

  /**
   * Adds a status effect to this creature
   * @param {StatusEffect} statusEffect 
   */
  addStatusEffect(statusEffect) {
    this.statusEffects.push(statusEffect);
    statusEffect.initialize(this);
  }
}
