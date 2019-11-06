export const RulesEnum = Object.freeze({ die: 1, stay: 2, both: 3, birth: 4 });

export const EdgesEnum = Object.freeze({ wrap: 1, alive: 2, dead: 3 });

/** @type {number[]} */
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

/** @type {number[]} */
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
