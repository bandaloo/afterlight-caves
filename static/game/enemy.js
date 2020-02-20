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
import { powerUpTypes } from "./powerups/poweruptypes.js";

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
   * @param {number} level
   * @param {import("../modules/chancetable.js").ChanceTable<typeof import("./powerup.js").PowerUp>} powerUpTable
   */
  constructor(
    pos,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    matryoshka = 0,
    level = 0,
    powerUpTable = undefined
  ) {
    super(pos, vel, acc);
    const size = BASE_SIZE + MATRYOSHKA_SIZE * matryoshka;
    this.type = "Enemy";
    /** if the enemy is big and will split up */
    this.matryoshka = matryoshka;
    this.level = level;
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
    this.applyPowerColor();

    this.collideMap.set(
      "Hero",
      /** @param {import("./hero.js").Hero} h */ h => this.touchHero(h)
    );

    this.applyPowerUps(powerUpTable);
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
      splatter(
        this.pos,
        this.splatterColor,
        this.width,
        "rectangular",
        this.vel
      );
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
      if (this.matryoshka > 1) {
        // drop a level 1 power up as a reward
        const powerUp = new powerUpTypes[
          Math.floor(Math.random() * powerUpTypes.length)
        ](Math.min(5, this.matryoshka - 1), this.pos);
        addToWorld(powerUp);
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

  /**
   * apply powerups based on level
   * @param {import("../modules/chancetable.js").ChanceTable<typeof import("./powerup.js").PowerUp>} powerUpTable
   */
  applyPowerUps(powerUpTable) {
    if (powerUpTable === undefined) return;
    for (let i = 0; i < this.level; i++) {
      new (powerUpTable.pick())(randomInt(5) + 1).apply(this);
    }
  }

  /**
   *
   */
  applyPowerColor() {
    let hue;
    if (this.level < 1) {
      hue = 0; // red
    } else if (this.level < 2) {
      hue = 136; // green (kind of seafoam)
    } else if (this.level < 3) {
      hue = 187; // blue (light)
    } else if (this.level < 4) {
      hue = 273; // purple (royal)
    } else {
      hue = 43; // orange (light tangerine)
    }

    this.drawColor = hsl(hue, 100, 70);
    this.splatterColor = `hsla(${hue}, 40%, 40%, 0.8)`;
    this.originalDrawColor = this.drawColor;
    this.bulletColor = this.drawColor;
  }
}
