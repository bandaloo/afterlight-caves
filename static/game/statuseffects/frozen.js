import { StatusEffect } from "../statuseffect.js";
import { Creature } from "../creature.js";
import { centeredRoundedRect } from "../draw.js";
import { getContext, getCameraOffset } from "../../modules/gamemanager.js";

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
    this.previousMaxAcc = undefined;
    this.previousBounciness = undefined;
    this.previousDrag = undefined;
  }

  /**
   * Remember previous attributes and set new ones
   * @override
   * @param {Creature} creature
   */
  initialize(creature) {
    this.previousMaxSpeed = creature.maxSpeed;
    this.previousMaxAcc = creature.maxAcc;
    this.previousBounciness = creature.bounciness;
    this.previousDrag = creature.drag;
    creature.maxSpeed = MAX_FROZEN_SPEED;
    creature.maxAcc = MAX_FROZEN_ACCELERATION;
    creature.bounciness = 0;
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
    if (this.previousBounciness !== undefined)
      creature.bounciness = this.previousBounciness;
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
    const context = getContext();
    context.save();
    context.strokeStyle = "white";
    context.lineWidth = 3;
    const centerVec = creature.drawPos.add(getCameraOffset());

    // draw long center line
    context.beginPath();
    context.moveTo(
      centerVec.x - creature.width * 0.25,
      centerVec.y + creature.width * 0.25
    );
    context.lineTo(
      centerVec.x + creature.width * 0.25,
      centerVec.y - creature.width * 0.25
    );
    context.closePath();
    context.stroke();

    // draw right line
    context.beginPath();
    context.moveTo(
      centerVec.x - creature.width * 0.15 + creature.width * 0.15,
      centerVec.y + creature.width * 0.15 + creature.width * 0.15
    );
    context.lineTo(
      centerVec.x + creature.width * 0.15 + creature.width * 0.15,
      centerVec.y - creature.width * 0.15 + creature.width * 0.15
    );
    context.closePath();
    context.stroke();

    // draw left line
    context.beginPath();
    context.moveTo(
      centerVec.x - creature.width * 0.08 - creature.width * 0.1,
      centerVec.y + creature.width * 0.08 - creature.width * 0.1
    );
    context.lineTo(
      centerVec.x + creature.width * 0.08 - creature.width * 0.1,
      centerVec.y - creature.width * 0.08 - creature.width * 0.1
    );
    context.closePath();
    context.stroke();

    context.restore();
  }
}
