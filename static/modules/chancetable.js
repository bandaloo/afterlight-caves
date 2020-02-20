/** @template T */
export class ChanceTable {
  /**
   * constructs a chance table with the given info
   * @param {Map<T, number>} info
   */
  constructor(info = new Map()) {
    this.info = info;
  }

  /**
   * adds an item with a weight to the chance table
   * @param {T} result the item to return when randomly chosen
   * @param {number} weight how strongly to weight that item
   */
  add(result, weight) {
    this.info.set(result, weight);
  }

  /**
   * add to the table in bulk
   * @param {{result: T, chance: number}[]} pairs the data to add to the chance table
   */
  addAll(pairs) {
    for (const p of pairs) {
      this.add(p.result, p.chance);
    }
  }

  /**
   * picks a random element from the chance table based on the weights
   * @returns {T} the chosen element
   */
  pick() {
    // add up total weight
    let sum = 0;
    for (const weight of this.info.values()) {
      sum += weight;
    }

    // choose a number and count up until that choice
    let choice = Math.random() * sum;
    let count = 0;
    for (const [result, weight] of this.info.entries()) {
      if (choice > count && choice < count + weight) {
        return result;
      }
      count += weight;
    }
    return; // should be an impossible condition
  }
}
