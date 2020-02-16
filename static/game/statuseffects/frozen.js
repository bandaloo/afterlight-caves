import { StatusEffect } from "../statuseffect.js";
import { Creature } from "../creature.js";
import { centeredRoundedRect, line } from "../draw.js";
import { Vector } from "../../modules/vector.js";

const MAX_FROZEN_SPEED = 0.4;
const MAX_FROZEN_ACCELERATION = 0.1;
const FROZEN_DRAG = 0.001; // drag of frozen entities

export class Frozen extends StatusEffect {
  /**
   * Constructs a new Frozen effect. This effect freezes the creature, making
   * only able to move very slowly
   * @param {number} lifetime amount of time in game steps before this status
   * effect wears off. Set it to Infinity for an effect that lasts forever
   */
  constructor(lifetime) {
    super("Frozen", lifetime);
    this.prevAcc = undefined;
    this.previousMaxSpeed = undefined;
    this.previousMaxAccMag = undefined;
    this.previousReflectsOffWalls = undefined;
    this.previousDrag = undefined;
  }

  /**
   * Remember previous attributes and set new ones
   * @override
   * @param {Creature} creature
   */
  initialize(creature) {
    this.previousMaxSpeed = creature.maxSpeed;
    this.previousMaxAccMag = creature.maxAccMag;
    this.previousReflectsOffWalls = creature.reflectsOffWalls;
    this.previousDrag = creature.drag;
    creature.maxSpeed = MAX_FROZEN_SPEED;
    creature.maxAccMag = MAX_FROZEN_ACCELERATION;
    creature.reflectsOffWalls = false;
    creature.drag = FROZEN_DRAG;
  }

  /**
   * Multiple Frozen effects shouldn't exist on the same creature at once,
   * instead getting a new Frozen while you're already Frozen should just
   * extend the lifetime of the first one
   * @override
   * @param {Creature} creature
   */
  apply(creature) {
    for (const se of creature.statusEffects) {
      if (se && se.statusEffectClass === this.statusEffectClass) {
        se.lifetime += this.lifetime;
        return;
      }
    }

    // the creature doesn't have a Frozen effect yet, we'll just add this one
    super.apply(creature);
  }

  /**
   * Changing direction while frozen should be difficult
   * @override
   * @param {Creature} creature
   */
  action(creature) {
    super.action(creature);
    if (this.prevAcc !== undefined && this.prevAcc.mag() > 0) {
      creature.acc = creature.acc.mult(
        Math.abs(this.prevAcc.x) * 0.1,
        Math.abs(this.prevAcc.y) * 0.1
      );
    }
    this.prevAcc = creature.acc;
  }

  /**
   * Reset attributes to their original values
   * @override
   * @param {Creature} creature
   */
  wearOff(creature) {
    if (this.previousMaxSpeed !== undefined)
      creature.maxSpeed = this.previousMaxSpeed;
    if (this.previousReflectsOffWalls !== undefined)
      creature.reflectsOffWalls = this.previousReflectsOffWalls;
    if (this.previousMaxAccMag !== undefined)
      creature.maxAccMag = this.previousMaxAccMag;
    if (this.previousDrag !== undefined) creature.drag = this.previousDrag;
  }

  /**
   * Draw an ice cube around the creature
   * @override
   * @param {Creature} creature
   */
  draw(creature) {
    // TODO this could probably look better
    centeredRoundedRect(
      creature.drawPos,
      creature.width + 8,
      creature.height + 8,
      "rgba(61, 174, 233, 0.7)",
      "white",
      4,
      8
    );
    // long center line
    line(
      new Vector(
        creature.drawPos.x - creature.width * 0.25,
        creature.drawPos.y + creature.height * 0.25
      ),
      new Vector(
        creature.drawPos.x + creature.width * 0.25,
        creature.drawPos.y - creature.width * 0.25
      ),
      "white",
      3
    );
    // right line
    line(
      new Vector(
        creature.drawPos.x - creature.width * 0.15 + creature.width * 0.15,
        creature.drawPos.y + creature.width * 0.15 + creature.width * 0.15
      ),
      new Vector(
        creature.drawPos.x + creature.width * 0.15 + creature.width * 0.15,
        creature.drawPos.y - creature.width * 0.15 + creature.width * 0.15
      ),
      "white",
      3
    );
    // left line
    line(
      new Vector(
        creature.drawPos.x - creature.width * 0.08 - creature.width * 0.1,
        creature.drawPos.y + creature.width * 0.08 - creature.width * 0.1
      ),
      new Vector(
        creature.drawPos.x + creature.width * 0.08 - creature.width * 0.1,
        creature.drawPos.y - creature.width * 0.08 - creature.width * 0.1
      ),
      "white",
      3
    );
  }
}
