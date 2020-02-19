/** @template T */
export class ChanceTable {
  /**
   * @param {Map<T, number>} info
   */
  constructor(info = new Map()) {
    this.info = info;
  }

  /**
   * @param {T} result
   * @param {number} weight
   */
  add(result, weight) {
    this.info.set(result, weight);
  }

  /**
   * add to the table in bulk
   * @param {{result: T, chance: number}[]} pairs
   */
  addAll(pairs) {
    for (const p of pairs) {
      this.add(p.result, p.chance);
    }
  }

  /**
   * picks a random element from the chance table based on the weights
   * @returns {T}
   */
  pick() {
    let sum = 0;
    for (const weight of this.info.values()) {
      sum += weight;
    }

    let choice = Math.random() * sum;
    let count = 0;
    for (const [result, weight] of this.info.entries()) {
      if (choice > count && choice < count + weight) {
        return result;
      }
      count += weight;
    }
    return;
  }
}
