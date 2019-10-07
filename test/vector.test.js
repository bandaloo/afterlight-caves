import { Vector } from "../modules/vector.js";

describe("Vector", function() {
  let startVector = new Vector(0, 0);
  let endVector = new Vector(10, 10);
  describe("mult", function() {
    it("should multiply the vector by a scalar", function() {
      chai.expect(endVector.mult(2)).to.eql(new Vector(20, 20));
    });
  });
});
