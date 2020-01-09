import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { Bullet } from "./bullet.js";
import { addToWorld, getDimensions } from "../modules/gamemanager.js";
import { StatusEffect } from "./statuseffect.js";
import { Bomb } from "./bomb.js";
import { clamp } from "../modules/helpers.js";

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

  /** @type {number} the number of game steps before bombs detonate */
  bombFuseTime = 180;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a funciton to execute when the bomb detonates
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bomb, number): void)
   *        }[]}
   */
  bombOnDetonate;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a function to execute when a creature is
   * caught in the blast of the bomb
   * @type {{ name: string
   *        , data: number
   *        , func: function( Bomb
   *                        , number
   *                        , Creature
   *                        ): void
   *        }[]}
   */
  bombOnBlastCreature;

  bombBlastRadius = 300;

  /** @type {number} the amount of damage this can take before dying */
  maxHealth = 10;

  /**
   * @type {number} this creature's current health. Don't directly get or set
   * this! Instead use `takeDamage()` or `gainHealth()`
   * @private
   */
  currentHealth = 10;

  /** @type {number} maximum number of bombs this creature can hold */
  maxBombs = 3;

  /**
   * @type {number} current number of bombs this creature is holding. Don't
   * directly set this! Instead use `changeNumBombs()`
   */
  currentBombs = 3;

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

  /** @type {number} number of bullets per shot, spread into a 30 degree cone */
  bulletsPerShot = 1;

  /**
   * @param {Vector} [pos] initial position
   * @param {Vector} [vel] initial velocity
   * @param {Vector} [acc] initial acceleration
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    super(pos, vel, acc);
    this.bulletOnDestroy = new Array();
    this.bulletOnHitEnemy = new Array();
    this.bombOnDetonate = new Array();
    this.bombOnBlastCreature = new Array();

    // bombs deal basic damage
    this.bombOnBlastCreature.push({
      name: "Basic Damage",
      data: 1,
      func: (bomb, num, creature) => {
        creature.takeDamage(num);
      }
    });
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
      for (let i = 0; i < this.bulletsPerShot; ++i) {
        // calculate a new direction so bullets are spread evenly across a 30
        // degree cone
        let newDir = dir;
        if (this.bulletsPerShot > 1) {
          let theta = Math.atan(dir.y / dir.x);
          if (dir.x < 0) theta += Math.PI; // account for left-facing shots
          const r = dir.mag();
          const degreesToAdd = (i / (this.bulletsPerShot - 1)) * 30 - 15;
          theta += degreesToAdd * (Math.PI / 180);
          newDir = new Vector(r * Math.cos(theta), r * Math.sin(theta));
        }
        const b = this.getBullet(newDir, isGood, color);
        b.vel = b.vel.add(additionalVelocity);
        addToWorld(b);
        this.fireCount = 0;
      }
    }
  }

  /**
   * Places a bomb into the world
   * @param {Vector} pos the position to place the bomb, by default the
   * creature's position
   * @param {boolean} [isGood] true if the bomb was planted by the player,
   * false otherwise
   * @param {string|CanvasGradient|CanvasPattern} [fillStyle]
   */
  placeBomb(pos = this.drawPos, isGood = false, fillStyle = "white") {
    if (this.currentBombs > 0) {
      const b = this.getBomb(pos, isGood, fillStyle);
      addToWorld(b);
      this.addBombs(-1);
    }
  }

  /**
   * Gets this creature's bomb.
   *
   * You should always use this method instead of calling `new Bomb' dirrectly
   * @param {Vector} pos
   * @param {string|CanvasGradient|CanvasPattern} [fillStyle]
   * @param {boolean} [isGood]
   * @return {Bomb}
   */
  getBomb(pos, isGood = false, fillStyle = "white") {
    const b = new Bomb(pos, isGood, fillStyle, this.bombFuseTime);
    b.onDetonate = this.bombOnDetonate;
    b.onBlastCreature = this.bombOnBlastCreature;
    b.blastRadius = this.bombBlastRadius;
    return b;
  }

  /**
   * Decreases the creatures current health by amt, killing it if necessary
   * @param {number} amt the amount of damage dealt
   */
  takeDamage(amt) {
    this.currentHealth -= amt;
    if (this.currentHealth <= 0) {
      if (this.type !== "Hero")
        // TODO remove this so the hero can die
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
   * @return {number} the amount of basic damage this creature's bombs deal
   */
  getBombDamage() {
    for (const obj of this.bombOnBlastCreature) {
      if (obj.name === "Basic Damage") {
        return obj.data;
      }
    }
  }

  /**
   * @param {number} newBombDamage new damage dealt by this creature's bombs
   */
  setBombDamage(newBombDamage) {
    for (const obj of this.bombOnBlastCreature) {
      if (obj.name === "Basic Damage") {
        obj.data = newBombDamage;
        return;
      }
    }
  }

  /**
   * add or subtract bombs from this creature
   * @param {number} amt amount of bombs, can be negative
   */
  addBombs(amt) {
    this.currentBombs = clamp(this.currentBombs + amt, 0, this.maxBombs);
  }
}
