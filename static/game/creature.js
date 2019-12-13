import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { Bullet } from "./bullet.js";
import { addToWorld, getDimensions } from "../modules/gamemanager.js";

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

  /** @type {(function(Bullet): void)[]} */
  bulletOnDestroy;

  /** @type {string[]} list containing the names of every pow/erup we have */
  powerUpsList;

  /** @type {number} the number of game steps to wait between each shot */
  fireDelay = 30;

  /** @type {number} counter for fireDelay */
  fireCount = 0;

  /** @type {number} the amount of damage this can take before dying */
  maxHealth = 10;

  /** @type {number} this creature's current health */
  currentHealth = 10;

  /** @type {number} the amount of damage each bullet deals */
  bulletDamage = 1;

  /** @type {number} A multiplier for how fast the creature moves */
  movementMultiplier = 1;

  /** @type {Map<string, number>}*/
  powerupMagnitudes = new Map();

  /**
   * @param {Vector} [pos] initial position
   * @param {Vector} [vel] initial velocity
   * @param {Vector} [acc] initial acceleration
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    super(pos, vel, acc);
    this.powerUpsList = new Array();
    this.bulletOnDestroy = new Array();
  }

  /**
   * action, e.g. shoot, that a creature does every step
   */
  action() {}

  /**
   * gets this creature's bullet
   * @param {Vector} dir
   * @param {boolean} [isGood]
   * @param {string} [color]
   * @return {Bullet}
   */
  getBullet(dir, isGood = false, color = "white") {
    const b = new Bullet(
      this.pos.add(dir.mult(this.width / 2)),
      dir.mult(this.bulletSpeed),
      new Vector(0, 0),
      isGood,
      color,
      this.bulletLifetime,
      this.bulletDamage
    );
    b.bounciness = this.bulletBounciness;
    b.rubberiness = this.bulletRubberiness;
    b.onDestroy = this.bulletOnDestroy;
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
}
