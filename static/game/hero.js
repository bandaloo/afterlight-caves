import { Creature } from "./creature.js";
import { Vector } from "../modules/vector.js";
import { circle } from "./draw.js";
import { buttons } from "../modules/buttons.js";
import { addParticle, toggleGuiElement } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { PowerUp, POWER_UP_POINTS_FACTOR } from "./powerup.js";
import { playSound, getSound } from "../modules/sound.js";
import { CollisionCircle } from "../modules/collision.js";
import { Item } from "./item.js";

const DEFAULT_SIZE = 50;

// circles have to overlap by this many units for hero to be hit
export const CHEAT_RADIUS = 16;

export class Hero extends Creature {
  /** @type {number} */
  score;
  drag = 0.1; // movement deceleration
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
    this.gainHealth(this.maxHealth);
    this.bulletSpeed = 8;
    this.bulletLifetime = 60;
    this.bulletDamage = 8;
    this.bombFuseTime = 300;
    this.bombHue = 126;
    this.bulletColor = "white";
    this.score = 0;
    this.setBombDamage(18);

    // Manually set the collision shape to allow for a smaller hitbox
    const collisionShape = new CollisionCircle(
      (DEFAULT_SIZE - CHEAT_RADIUS) / 2,
      this.pos
    );
    const terrainCollisionShape = new CollisionCircle(
      DEFAULT_SIZE / 2,
      this.pos
    );

    this.setCollisionShape(collisionShape);
    this.setTerrainCollisionShape(terrainCollisionShape);

    // collect powerups when you collide with them
    this.collideMap.set("PowerUp", (/** @type {PowerUp} */ entity) => {
      entity.apply(this);
      for (let i = 0; i < 30; i++) {
        let randColor =
          "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 50%)";
        const spark = new Particle(this.pos, randColor, EffectEnum.spark);
        spark.lineWidth = 15;
        spark.multiplier = 8;
        addParticle(spark);
      }
      this.addPoints(entity.magnitude * POWER_UP_POINTS_FACTOR);
      // play sound
      let magSound;
      switch (entity.magnitude) {
        case 1:
          magSound = "one";
          break;
        case 2:
          magSound = "two";
          break;
        case 3:
          magSound = "three";
          break;
        case 4:
          magSound = "four";
          break;
        case 5:
          magSound = "five";
          break;
      }
      const puClassSound = entity.powerUpClass.toLowerCase().replace(" ", "-");
      playSound("power-up");
      const duration = getSound(puClassSound).duration;
      setTimeout(() => playSound(puClassSound), 300);
      setTimeout(() => playSound(magSound), duration * 1000 + 250);
      entity.deleteMe = true;
    });

    // collect items when you collide with them
    this.collideMap.set(
      "Item",
      /** @param {Item} i */ i => {
        i.apply(this);
        i.deleteMe = true;
      }
    );

    this.collideMap.set("Enemy", entity => {
      for (const ote of this.onTouchEnemy) {
        if (ote.func) ote.func(ote.data, /** @type{Creature} */ (entity));
      }
    });
  }

  /**
   * Draws the hero at its position in the world
   */
  draw() {
    // draw body
    circle(
      this.drawPos,
      this.width / 2,
      this.invincibilityFrames > 0
        ? `rgba(255, 255, 255, ${this.invincibilityFrames /
            this.invincibilityFramesMax})`
        : "rgba(0, 0, 0, 1)",
      4,
      "white"
    );

    // draw eye
    circle(this.drawPos.add(this.facing.mult(10)), 12, undefined, 4, "white");

    // draw status effects
    super.draw();
  }

  action() {
    // gradually return to default size
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
    if (this.shoot(buttons.shoot.vec, this.vel.mult(0.5))) {
      playSound("shoot");
    }
    if (!buttons.shoot.vec.isZeroVec()) {
      const normalizedShootVec = buttons.shoot.vec.norm2();
      this.facing = normalizedShootVec;
    } else if (this.vel.mag() > 0.1) {
      this.facing = this.vel.norm();
    }

    if (buttons.primary.status.isPressed) {
      this.placeBomb(this.pos);
    }
    if (buttons.secondary.status.isPressed) {
      console.log("Secondary pressed");
    }

    // apply powerup effects
    super.action();
  }

  destroy() {
    playSound("death");
    for (let i = 0; i < 40; i++) {
      let p = new Particle(
        this.pos,
        "white",
        EffectEnum.spark,
        10,
        3,
        0.08,
        50
      );
      p.lineWidth = 5;
      addParticle(p);
    }
    super.destroy();
    toggleGuiElement("deathscreen");
  }

  /**
   * @param {number} amt of damage to take
   * @param {Vector} [dir] the direction the damage came from
   * @override
   */
  takeDamage(amt, dir) {
    if (this.invincibilityFrames <= 0) {
      playSound("hero-hurt");
      super.takeDamage(amt, dir);
      this.invincibilityFrames = this.invincibilityFramesMax;
    }
  }

  /**
   * adds points to the hero's score and updates the score display
   * @param {number} amt number of points to add
   */
  addPoints(amt) {
    this.score += amt;
  }
}
