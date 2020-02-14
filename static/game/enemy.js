import { isCollidingCheat } from "../modules/collision.js";
import { FarEnum } from "../modules/entity.js";
import {
  addParticle,
  addToWorld,
  getImportantEntity
} from "../modules/gamemanager.js";
import { hsl, randomInt } from "../modules/helpers.js";
import { playSound } from "../modules/sound.js";
import { Vector } from "../modules/vector.js";
import { Creature } from "./creature.js";
import { CHEAT_RADIUS, Hero } from "./hero.js";
import { EffectEnum, Particle } from "./particle.js";
import { Pickup, PickupEnum } from "./pickup.js";
import { splatter } from "./draw.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
export const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

const DROP_CHANCE = 0.2;
const BOMB_CHANCE = 0.3;
const BASE_SIZE = 50;
const MATRYOSHKA_HEALTH = 10;
const MATRYOSHKA_SIZE = 50;

export class Enemy extends Creature {
  baseHealth = 10;
  currentHealth = this.baseHealth;
  basePoints = 50;

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
    const size = BASE_SIZE + MATRYOSHKA_SIZE * matryoshka;
    this.type = "Enemy";
    /** if the enemy is big and will split up */
    this.matryoshka = matryoshka;
    this.width = size;
    this.height = size;
    this.reflectsOffWalls = true;
    this.drag = 0.005;
    this.maxRedFrames = 60;
    this.redFrames = 0;
    this.bulletKnockback = 3;
    this.bulletDamage = 10;
    this.touchDamage = 10;
    this.farType = FarEnum.deactivate;
    this.basePoints = 50;

    // TODO get rid of this
    const randomHue = randomInt(360);
    this.drawColor = hsl(randomHue, 100, 70);
    this.splatterColor = `hsla(${randomHue}, 60%, 60%, 0.1)`;
    this.originalDrawColor = this.drawColor;
    this.bulletColor = this.drawColor;

    this.collideMap.set(
      "Hero",
      /** @param {import("./hero.js").Hero} h */ h => this.touchHero(h)
    );
  }

  initHealth() {
    this.maxHealth = this.baseHealth + this.matryoshka * MATRYOSHKA_HEALTH;
    this.currentHealth = this.maxHealth;
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
    for (let i = 0; i < 25; i++) {
      let p = new Particle(this.pos, this.originalDrawColor, EffectEnum.spark);
      p.lineWidth = 5;
      addParticle(p);
      splatter(this.pos, this.splatterColor, this.width, "rectangular");
    }

    // TODO this assumes that enemies can only be killed by the hero
    const hero = getImportantEntity("hero");
    if (hero !== undefined) {
      /** @type {Hero} */ (hero).addPoints(this.getPointValue());
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

  /**
   * @return {number} the amount of points killing this enemy is worth,
   * based on its power ups, size, etc.
   */
  getPointValue() {
    let out = this.basePoints;
    out += 75 * this.matryoshka;

    // add 10 points for each magnitude of each power up
    for (const key in this.powerUps) {
      out += this.powerUps.get(key) * 10;
    }

    return out;
  }
}
