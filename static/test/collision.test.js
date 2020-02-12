import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { isColliding } from "../modules/collision.js";

let box1 = new Entity();
let box2 = new Entity();

describe("Collision", function() {
  describe("Square no collision", function() {
    box1 = new Entity();
    box1.pos = new Vector(0, 0);
    box1.width = 1;
    box1.height = 1;
    box2 = new Entity();
    box2.pos = new Vector(2, 0);
    box2.height = 1;
    box2.width = 1;
    it("Should not detect box2 intersect box1", function() {
      chai.expect(isColliding(box1, box2)).to.equal(false);
    });
    it("Should not detect box1 intersect box2", function() {
      chai.expect(isColliding(box1, box2)).to.equal(false);
    });
  });

  describe("Square left collision", function() {
    it("Should not detect box2 intersect box1", function() {
      box1 = new Entity();
      box1.pos = new Vector(0, 0);
      box1.width = 2;
      box1.height = 1;
      box2 = new Entity();
      box2.pos = new Vector(2, 0);
      box2.width = 2;
      box2.height = 1;
      chai.expect(isColliding(box1, box2)).to.equal(false);
    });
    it("Should detect boxes intersecting", function() {
      box1 = new Entity();
      box1.pos = new Vector(0, 0);
      box1.width = 2;
      box1.height = 1;
      box2 = new Entity();
      box2.pos = new Vector(1, 0);
      box2.width = 2;
      box2.height = 1;
      chai.expect(isColliding(box1, box2)).to.equal(true);
      chai.expect(isColliding(box2, box1)).to.equal(true);
    });
    it("Should detect boxes bearly intersecting", function() {
      box1 = new Entity();
      box1.pos = new Vector(0, 0);
      box1.width = 2.1;
      box1.height = 1;
      box2 = new Entity();
      box2.pos = new Vector(2, 0);
      box2.width = 2;
      box2.height = 1;
      chai.expect(isColliding(box1, box2)).to.equal(true);
      chai.expect(isColliding(box2, box1)).to.equal(true);
    });
  });
});
