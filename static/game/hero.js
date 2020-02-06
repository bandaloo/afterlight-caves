import { Vector } from "../modules/vector.js";
import { circle } from "./draw.js";
import { buttons } from "../modules/buttons.js";
import { addParticle } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { PowerUp } from "./powerup.js";
import { Creature } from "./creature.js";
import { Bullet } from "./bullet.js";
import { playSound } from "../modules/sound.js";

const DEFAULT_SIZE = 50;

// circles have to overlap by this many units for hero to be hit
export const CHEAT_RADIUS = 16;

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
    this.gainHealth(this.maxHealth);
    this.bulletSpeed = 6;
    this.bulletLifetime = 80;
    this.bombFuseTime = 300;
    this.bombHue = 126;
    this.bulletColor = "white";

    // collect powerups when you collide with them
    this.collideMap.set("PowerUp", entity => {
      playSound("spacey-snd");
      /** @type {PowerUp} */ (entity).apply(this);
      for (let i = 0; i < 30; i++) {
        // TODO move this to the destroy of powerup
        let randColor =
          "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 50%)";
        const spark = new Particle(this.pos, randColor, EffectEnum.spark);
        spark.lineWidth = 15;
        spark.multiplier = 8;
        addParticle(spark);
      }
      entity.deleteMe = true;
    });

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
        : "rgba(0, 0, 0, 0)",
      4,
      "white"
    );

    // draw eye
    circle(
      this.drawPos.add(this.eyeDirection.mult(10)),
      12,
      undefined,
      4,
      "white"
    );

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
    if (this.shoot(buttons.shoot.vec, this.vel)) {
      playSound("laser-shot");
    }
    if (!buttons.shoot.vec.isZeroVec()) {
      const normalizedShootVec = buttons.shoot.vec.norm2();
      this.eyeDirection = normalizedShootVec;
    } else if (this.vel.magnitude() > 0.001) {
      this.eyeDirection = this.vel.norm();
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

  /**
   * @param {number} amt of damage to take
   * @override
   */
  takeDamage(amt) {
    if (this.invincibilityFrames <= 0) {
      super.takeDamage(amt);
      this.invincibilityFrames = this.invincibilityFramesMax;
    }
  }
}
