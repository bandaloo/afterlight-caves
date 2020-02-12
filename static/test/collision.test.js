import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { collision } from "../modules/collision.js";

describe("Vector", function() {
  let box1 = Entity(new Vector(1, 1), undefined, undefined);
  let box2 = Entity(new Vector(1, 1), undefined, undefined);

  describe("square collision side-by-side", function() {
    it("should calculate the squared distance", function() {
      chai.expect(middleVector.dist2(endVector)).to.equal(50);
    });
    it("should calculate the squared distance as zero", function() {
      chai.expect(middleVector.dist2(middleVector)).to.equal(0);
    });
  });
});
