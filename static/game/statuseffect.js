import { Creature } from "./creature.js";

/**
 * This class represents a status effect, such as being on fire or poisoned,
 * that can be applied to a creature.
 * @abstract
 */
export class StatusEffect {
  /**
   * constructs a StatusEffect
   * @param {string} statusEffectClass the name of this kind of status effect,
   * e.g. "Burning"
   * @param {number} lifetime amount of time in game seconds before this status
   * effect wears off. Set it to Infinity for an effect that lasts forever
   */
  constructor(statusEffectClass = "Null Status Effect", lifetime = 600) {
    this.statusEffectClass = statusEffectClass;
    this.lifetime = lifetime;
  }

  /**
   * Applies this status effect to a creature. By default it adds this to the
   * creatures list of status effects. Sub-classes can override this for
   * different functionality
   * @param {Creature} creature the creature to apply this status effect to
   */
  apply(creature) {
    creature.statusEffects.push(this);
    this.initialize(creature);
  }

  /**
   * Exectues each game step. Concrete subclasses should override this to apply
   * the functionality of their status effect to the creature taken as an
   * argument (e.g. "Burning" should have the creature take damage each step).
   * Call `super.action(creature)` in the overridden function to step the
   * lifetime counter
   * @param {Creature} creature the creature that has this status effect
   */
  action(creature) {
    if (this.lifetime > 0) {
      this.lifetime--;
    } else {
      this.wearOff(creature);
      for (const se in creature.statusEffects) {
        if (creature.statusEffects[se] === this) {
          // remove this from its owner's list of status effects
          delete creature.statusEffects[se];
        }
      }
    }
  }

  /**
   * Something to do once when the effect is first applied to a creature
   * @param {Creature} creature the creature that has this status effect
   */
  initialize(creature) {}

  /**
   * Something to do when the effect wears off, e.g. resetting attributes to
   * their original values
   * @abstract
   * @param {Creature} creature the creature that has this status effect
   */
  wearOff(creature) {}

  /**
   * Draw this status effect around the creature it's on. E.g. "Burning" should
   * show flames and smoke coming out of the creature
   * @abstract
   * @param {Creature} creature the creature that has this status effect
   */
  draw(creature) {}
}
