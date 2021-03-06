import { StatusEffect } from "../statuseffect.js";
import { Creature } from "../creature.js";
import { Particle, EffectEnum } from "../particle.js";
import { Vector } from "../../modules/vector.js";
import { addParticle } from "../../modules/gamemanager.js";

const CHANCE_TO_BURN = 1 / 10; // chance to take damage each step
const BURNING_DAMAGE = 3;

export class Burning extends StatusEffect {
  /**
   * Constructs a new Burning effect. This effect causes the creature to burn,
   * taking small amounts of damage over time
   * @param {number} lifetime amount of time in game steps before this status
   * effect wears off. Set it to Infinity for an effect that lasts forever
   */
  constructor(lifetime) {
    super("Burning", lifetime);
    this.burned = false; // set to true if we should burn this step
  }

  /**
   * The creature will randomly take a small amount of damage
   * @override
   * @param {Creature} creature
   */
  action(creature) {
    this.burned = Math.random() < CHANCE_TO_BURN;
    if (this.burned) {
      creature.takeDamage(BURNING_DAMAGE);
    }
    // make some particles
    // TODO this could probably look better
    if (Math.random() < 0.4) {
      // create a fire particle
      let color;
      if (Math.random() < 0.4) {
        color = "hsl(19, 87%, 4%)"; // smoke
      } else {
        color = "hsl(" + Math.floor(Math.random() * 55 - 5) + ", 100%, 50%)";
      }
      const xOffset = Math.random() * creature.width - creature.width / 2;
      const yOffset = Math.random() * creature.height - creature.height / 2;
      const p = new Particle(
        // this draw position is fine
        new Vector(creature.drawPos.x + xOffset, creature.drawPos.y + yOffset),
        color,
        EffectEnum.square,
        5,
        5,
        0.08,
        30,
        20,
        new Vector(Math.random() - 0.5, -0.3)
      );
      p.vel = new Vector(Math.random() * 0.7 - 0.35, Math.random() * 0.2 - 0.2);
      p.strokeStyle = "white";
      p.lineWidth = 1;
      p.width = 20;
      p.height = 20;
      addParticle(p);
    }
    // call the super-class's action to step down lifetime
    super.action(creature);
  }
}
