import { clamp } from "./helpers.js";

class Vector {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Vector} v
   * @returns {number}
   */
  dist2(v) {
    return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
  }

  /**
   * @param {Vector} v
   * @returns {number}
   */
  dist(v) {
    return Math.sqrt(this.dist2(v));
  }

  /**
   * @param {number} sx
   * @param {number} sy
   * @returns {Vector}
   */
  mult(sx, sy = sx) {
    return new Vector(this.x * sx, this.y * sy);
  }

  /**
   * @param {Vector} v
   * @returns {Vector}
   */
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  /**
   * @param {Vector} v
   * @returns {Vector}
   */
  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  /**
   * @param {Vector} v
   * @returns {number}
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * @returns {Vector}
   */
  norm() {
    if (this.x === 0 && this.y === 0) {
      throw new Error("can't normalize the zero vector");
    }
    return this.mult(1 / this.dist(new Vector(0, 0)));
  }

  /**
   * @param {Vector} v
   */
  midpoint(v) {
    return new Vector((this.x + v.x) / 2, (this.y + v.y) / 2);
  }

  /**
   * @param {Vector} v
   * @param {number} s
   */
  partway(v, s) {
    return this.add(v.sub(this).mult(s));
  }

  /**
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Vector}
   */
  closestVecToSeg(a, b) {
    let length2 = a.dist2(b);
    if (length2 === 0) {
      return a;
    }
    const t = clamp(this.sub(a).dot(b.sub(a)) / length2, 0, 1);
    const c = b
      .sub(a)
      .mult(t)
      .add(a);
    return c;
  }

  /**
   * @param {Vector} a
   * @param {Vector} b
   * @returns {number}
   */
  distToSeg(a, b) {
    return this.dist(this.closestVecToSeg(a, b));
  }

  toString() {
    return `[${this.x}, ${this.y}]`;
  }
}

export { Vector };
