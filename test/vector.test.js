import { Vector } from "../modules/vector.js";

describe("Vector", function() {
  let zeroVector = new Vector(0, 0);
  let middleVector = new Vector(5, 5);
  let endVector = new Vector(10, 10);
  let endVectorFlat = new Vector(10, 0);
  let diagonalVector = new Vector(2, -2);
  let offStart = new Vector(-1, 0);
  let offEnd = new Vector(10, 11);

  describe("#dist2()", function() {
    it("should calculate the squared distance", function() {
      chai.expect(middleVector.dist2(endVector)).to.equal(50);
    });
    it("should calculate the squared distance as zero", function() {
      chai.expect(middleVector.dist2(middleVector)).to.equal(0);
    });
  });

  describe("#dist()", function() {
    it("should calculate the distance", function() {
      chai.expect(middleVector.dist(endVector)).to.equal(5 * Math.sqrt(2));
    });
    it("should calculate the distance as zero", function() {
      chai.expect(middleVector.dist(middleVector)).to.equal(0);
    });
  });

  describe("#mult()", function() {
    it("should multiply the vector by a scalar", function() {
      chai.expect(endVector.mult(2)).to.eql(new Vector(20, 20));
    });
  });

  describe("#add()", function() {
    it("should add two vectors together", function() {
      chai.expect(diagonalVector.add(endVector)).to.eql(new Vector(12, 8));
    });
  });

  describe("#sub()", function() {
    it("should add subtract vectors", function() {
      chai.expect(endVector.sub(diagonalVector)).to.eql(new Vector(8, 12));
    });
  });

  describe("#dot()", function() {
    it("should calculate the dot product of two vectors", function() {
      chai.expect(new Vector(1, 2).dot(new Vector(3, 4))).to.eql(11);
    });

    it("should get zero from dotting with zero vector", function() {
      chai.expect(new Vector(1, 2).dot(zeroVector)).to.eql(0);
    });
  });

  describe("#norm()", function() {
    it("should throw error trying to normalize zero vector", function() {
      chai
        .expect(function() {
          zeroVector.norm();
        })
        .to.throw(Error, "zero vector");
    });

    it("should normalize vector", function() {
      chai
        .expect(middleVector.norm())
        .to.eql(new Vector(1 / Math.sqrt(2), 1 / Math.sqrt(2)));
    });
  });

  describe("#distToSeg()", function() {
    it("should have zero distance to segment", function() {
      chai.expect(middleVector.distToSeg(zeroVector, endVector)).to.equal(0);
    });

    it("should have zero distance to first endpoint", function() {
      chai.expect(zeroVector.distToSeg(zeroVector, endVector)).to.equal(0);
    });

    it("should have one distance from first endpoint", function() {
      chai.expect(offStart.distToSeg(zeroVector, endVector)).to.equal(1);
    });

    it("should have zero distance from last endpoint", function() {
      chai.expect(endVector.distToSeg(zeroVector, endVector)).to.equal(0);
    });

    it("should have one distance from last endpoint", function() {
      chai.expect(offEnd.distToSeg(zeroVector, endVector)).to.equal(1);
    });

    it("should have five distance from segment", function() {
      chai
        .expect(middleVector.distToSeg(zeroVector, endVectorFlat))
        .to.equal(5);
    });
  });

  describe("#closestVecToSeg()", function() {
    it("should be on middle of segment at same point", function() {
      chai
        .expect(middleVector.closestVecToSeg(zeroVector, endVector))
        .to.eql(middleVector);
    });

    it("should be on first endpoint at same point", function() {
      chai
        .expect(zeroVector.closestVecToSeg(zeroVector, endVector))
        .to.eql(zeroVector);
    });

    it("should be on first endpoint at different point", function() {
      chai
        .expect(offStart.closestVecToSeg(zeroVector, endVector))
        .to.eql(zeroVector);
    });

    it("should be on last endpoint at same point", function() {
      chai
        .expect(endVector.closestVecToSeg(zeroVector, endVector))
        .to.eql(endVector);
    });

    it("should be on last endpoint at different point", function() {
      chai
        .expect(offEnd.closestVecToSeg(zeroVector, endVector))
        .to.eql(endVector);
    });

    it("should be in middle of flat segment at different point", function() {
      chai
        .expect(middleVector.closestVecToSeg(zeroVector, endVectorFlat))
        .to.eql(new Vector(5, 0));
    });
  });
});
