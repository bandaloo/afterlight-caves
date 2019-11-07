/**
 * an enum for the different types of possible rules for neighbor counts
 * @enum {number}
 */
export const RulesEnum = Object.freeze({ die: 1, stay: 2, both: 3, birth: 4 });

/**
 * a enum for the different types of behavior at the edges
 * @enum {number}
 */
export const EdgesEnum = Object.freeze({ wrap: 1, alive: 2, dead: 3 });

export const caveRules = [
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.stay,
  RulesEnum.both,
  RulesEnum.both,
  RulesEnum.both,
  RulesEnum.both
];

export const conwayRules = [
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.stay,
  RulesEnum.both,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die
];
