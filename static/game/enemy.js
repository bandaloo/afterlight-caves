import { FarEnum } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { randomInt, hsl } from "../modules/helpers.js";
import { Creature } from "./creature.js";
import { addParticle, addToWorld } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { playSound } from "../modules/sound.js";
import { Pickup, PickupEnum } from "./pickup.js";
import { isCollidingCheat } from "../modules/collision.js";
import { CHEAT_RADIUS } from "./hero.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
export const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

const DROP_CHANCE = 0.2;

const BOMB_CHANCE = 0.3;

// TODO get rid of look
/**
 * @typedef {Object} Look
 * @property {number} shape
 * @property {string} color
 * @property {number} eyeSpacing
 * @property {number} eyeSize
 * @property {number} mouthWidth
 * @property {number} mouthOffset
 */

export class Enemy extends Creature {
  health = 2;

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   */
  constructor(
    pos,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    matryoshka = 0
  ) {
    super(pos, vel, acc);
    this.type = "Enemy";
    /** if the enemy is big and will split up */
    this.matryoshka = matryoshka;
    this.width = 50 + 50 * this.matryoshka;
    this.height = 50 + 50 * this.matryoshka;
    this.reflectsOffWalls = true;
    this.drag = 0.005;
    this.maxRedFrames = 60;
    this.redFrames = 0;
    this.bulletKnockback = 3;
    this.bulletDamage = 10;
    this.touchDamage = 10;
    this.farType = FarEnum.deactivate;

    // TODO get rid of this
    this.drawColor = hsl(randomInt(360), 100, 70);
    this.originalDrawColor = this.drawColor;
    this.bulletColor = this.drawColor;

    this.collideMap.set(
      "Hero",
      /** @param {import("./hero.js").Hero} h */ h => this.touchHero(h)
    );
  }

  /**
   * @param {import("./hero.js").Hero} hero
   */
  touchHero(hero) {
    if (isCollidingCheat(hero, this, CHEAT_RADIUS)) {
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
  }

  destroy() {
    for (let i = 0; i < 30; i++) {
      let p = new Particle(this.pos, this.originalDrawColor, EffectEnum.spark);
      p.lineWidth = 5;
      addParticle(p);
    }

    if (this.matryoshka > 0) {
      let randDir = Math.random() * 2 * Math.PI;
      const spawnNum = 3;
      const pushSpeed = 5;
      for (let i = 0; i < spawnNum; i++) {
        const childEnemy = new (Object.getPrototypeOf(this).constructor)(
          this.pos,
          new Vector(
            Math.cos(randDir) * pushSpeed,
            Math.sin(randDir) * pushSpeed
          ),
          new Vector(0, 0),
          this.matryoshka - 1
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
    }
  }

  /** @abstract */
  drawBody() {}

  /** @abstract */
  drawFace() {}

  getBackgroundColor() {
    return this.redFrames === 0 ? "rgba(0, 0, 0, 0)" : "rgba(255, 69, 0, 0.3)";
  }

  draw() {
    this.drawBody();
    this.drawFace();
    super.draw();
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
      if (this.redFrames === 1) this.drawColor = this.originalDrawColor;
      this.redFrames--;
    }
    super.action();
  }
}
