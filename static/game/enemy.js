import { Entity, FarEnum } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { randomFromEnum, randomInt, hsl } from "../modules/helpers.js";
import { Creature } from "./creature.js";
import { centeredRect, circle, polygon } from "./draw.js";
import {
  addParticle,
  addToWorld,
  getTotalTime
} from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { Bullet } from "./bullet.js";
import { playSound } from "../modules/sound.js";
import { Pickup, PickupEnum } from "./pickup.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
export const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

const DROP_CHANCE = 0.2;

const BOMB_CHANCE = 0.3;
// naturally, the health chance is one minus the bomb chance

// TODO figure out how to put shape enum in the jsdoc

/**
 * @typedef {Object} Look
 * @property {number} shape
 * @property {string} color
 * @property {number} eyeSpacing
 * @property {number} eyeSize
 * @property {number} mouthWidth
 * @property {number} mouthOffset
 */

/**
 * @returns {Look}
 */
export function randomLook() {
  return {
    shape: randomFromEnum(ShapeEnum),
    color: hsl(randomInt(360), 100, 70),
    eyeSpacing: 10 + randomInt(10),
    eyeSize: 5 + randomInt(3),
    mouthWidth: 20 + randomInt(25),
    mouthOffset: 10 + randomInt(6)
  };
}

/**
 * @typedef {Object} Stats
 * @property {number} movementSpeed
 * @property {number} shotSpeed
 * @property {number} accuracy
 * @property {number} rateOfFire
 */

/**
 * returns random stats for an enemy of given difficulty
 * @param {number} difficulty
 * @return {Stats}
 */
export function randomStats(difficulty) {
  // TODO get rid of this
  let stats = {
    movementSpeed: 0,
    shotSpeed: 0,
    accuracy: 0,
    rateOfFire: 0
  };

  for (let i = 0; i < difficulty; i++) {
    let num = Math.random();
    if (num < 0.25) {
      stats.movementSpeed++;
    } else if (num < 0.5) {
      stats.shotSpeed++;
    } else if (num < 0.75) {
      stats.accuracy++;
    } else {
      stats.rateOfFire++;
    }
  }

  return stats;
}

export class Enemy extends Creature {
  health = 2;
  modifiers = {
    size: 0,
    speed: 0,
    explode: 0
  };

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Look} look
   * @param {Stats} stats
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {{size: number, speed: number, explode: number}} modifiers
   */
  constructor(
    pos,
    look,
    stats,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    modifiers = { size: 0, speed: 0, explode: 0 }
  ) {
    super(pos, vel, acc);
    this.look = look;
    this.stats = stats;
    this.type = "Enemy";
    this.modifiers = modifiers;
    this.width = 50 + 50 * this.modifiers.size;
    this.height = 50 + 50 * this.modifiers.size;
    this.reflectsOffWalls = true;
    this.drag = 0.005;
    this.maxRedFrames = 60;
    this.redFrames = 0;
    this.drawColor = this.look.color;
    this.bulletKnockback = 3;
    this.bulletColor = this.look.color;
    this.bulletDamage = 10;
    this.touchDamage = 10;
    this.farType = FarEnum.deactivate;

    this.collideMap.set(
      "Hero",
      /** @param {import("./hero.js").Hero} h */ h => this.touchHero(h)
    );
  }

  /**
   * @param {import("./hero.js").Hero} hero
   */
  touchHero(hero) {
    // impart momentum
    if (hero.invincibilityFrames <= 0) {
      const sizeDiff =
        (0.5 * this.width * this.height) / (hero.width * hero.height);
      hero.vel = hero.vel.add(this.vel.mult(sizeDiff));
    }

    // execute onTouchEnemy functions
    for (const ote of this.onTouchEnemy) {
      if (ote.func) ote.func(ote.data, /** @type{Creature} */ (hero));
    }
    // deal basic touch damage
    hero.takeDamage(this.touchDamage);
  }

  destroy() {
    for (let i = 0; i < 30; i++) {
      let p = new Particle(this.pos, this.look.color, EffectEnum.spark);
      p.lineWidth = 5;
      addParticle(p);
    }

    if (this.modifiers.size > 0) {
      const newModifiers = Object.assign({}, this.modifiers);
      newModifiers.size--;
      let randDir = Math.random() * 2 * Math.PI;
      const spawnNum = 3;
      const pushSpeed = 5;
      for (let i = 0; i < spawnNum; i++) {
        const childEnemy = new (Object.getPrototypeOf(this).constructor)(
          this.pos,
          this.look,
          this.stats,
          new Vector(
            Math.cos(randDir) * pushSpeed,
            Math.sin(randDir) * pushSpeed
          ),
          new Vector(0, 0),
          newModifiers
        );
        addToWorld(childEnemy);
        randDir += (2 * Math.PI) / spawnNum;
      }
    }

    // TODO change this to being only a chance
    if (Math.random() < DROP_CHANCE) {
      if (Math.random() < BOMB_CHANCE) {
        addToWorld(new Pickup(this.pos, PickupEnum.bomb));
      } else {
        addToWorld(new Pickup(this.pos, PickupEnum.health));
      }
    } else {
      console.log("no drop");
    }
  }

  /** @abstract */
  drawBody() {}

  /** @abstract */
  drawFace() {}

  draw() {
    this.drawBody();
    this.drawFace();
    super.draw();
  }

  toString() {
    return (
      `movement speed: ${this.stats.movementSpeed} ` +
      `shot speed: ${this.stats.shotSpeed} ` +
      `accuracy: ${this.stats.accuracy} ` +
      `rate of fire: ${this.stats.rateOfFire}`
    );
  }

  /**
   * @override
   * @param {number} amt amount of damage to take
   */
  takeDamage(amt) {
    playSound("enemy-hurt");
    this.redFrames = this.maxRedFrames;
    this.drawColor = "orangered";
    super.takeDamage(amt);
  }

  /**
   * @override
   */
  action() {
    if (this.redFrames > 0) {
      if (this.redFrames === 1) this.drawColor = this.look.color;
      this.redFrames--;
    }
    super.action();
  }
}
