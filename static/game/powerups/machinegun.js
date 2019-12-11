import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

export class MachineGun extends PowerUp {
  /**
   * Makes you shoot faster
   * @param {Vector} pos
   * @param {number} magnitude how much faster you shoot
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude);
    this.powerUpName = "MachineGun " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    super.apply(creature);
    creature.fireDelay -= this.magnitude;
    if (creature.fireDelay < 1) creature.fireDelay = 1;
  }
}