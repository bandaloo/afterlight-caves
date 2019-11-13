import { Vector } from "./vector.js";
import { Entity } from "./entity.js";
import { getTerrain, getDimensions, addToWorld } from "./gamemanager.js";

/**
 * checks if cell position solid (outside is solid)
 * @param {number} i
 * @param {number} j
 * @returns {boolean}
 */
export function solidAt(i, j) {
    const board = getTerrain();
    return (
      i < 0 ||
      i >= board.length ||
      j < 0 ||
      j >= board[0].length ||
      board[i][j] !== 0
    );
}

/**
 * Returns a list of collision objects to represent the cells the entiity is colliding with.
 * @param {Entity} entity 
 */
export function collideWithWorld(entity) {
    const block = getDimensions();
    const blockWidth = block.width;
    const blockHeight = block.height;

    if (entity.hitsWalls == false)
        return [];
    
    let entity_block_width = 1;
    let entity_block_height = 1;

    let entityCell = new Vector(Math.floor(entity.pos.x / blockWidth), Math.floor(entity.pos.y / blockHeight));
    let collidingEntities = [];

    // Iterate over any block within collision range of the entity 
    for (let i = entityCell.x - entity_block_width; i <= entityCell.x + entity_block_width; i++) {
        for (let j = entityCell.y - entity_block_height; j <= entityCell.y + entity_block_height; j++) {
            if(solidAt(i, j)){
                let x = (i + 1) * blockWidth - blockWidth / 2;
                let y = (j + 1) * blockHeight - blockHeight / 2;
                let e = new Entity(new Vector(x,y));
                e.width = blockWidth;
                e.height = blockHeight;
                if(solidAt(i + 1, j))
                    e.collidesRight = false;
                if(solidAt(i - 1, j))
                    e.collidesLeft = false;
                if(solidAt(i, j - 1))
                    e.collidesTop = false;
                if(solidAt(i, j + 1))
                   e.collidesBottom = false;
                collidingEntities.push(e);
            }
        }
    }
    return collidingEntities;
}

/**
 * Determines if two entities are colliding
 * @param {*} entity_a 
 * @param {*} entity_b 
 */
export function isColliding(entity_a, entity_b) {
    const a_left = entity_a.pos.x - entity_a.width / 2;
    const a_top = entity_a.pos.y - entity_a.height / 2;
    const b_left = entity_b.pos.x - entity_b.width / 2;
    const b_top = entity_b.pos.y - entity_b.height / 2;

    if (a_left + entity_a.width >= b_left &&
        a_left <= b_left + entity_b.width &&
        a_top + entity_a.height >= b_top &&
        a_top <= b_top + entity_b.height) {
        return true;
    }
    return false;
}

/**
 * Given two entities A and B, calculates the smallest vector needed to apply to entity A to prevent collision.
 * Returns empty vector if A and B are not colliding.
 * Assumes rectangle A does not surround rectangle B
 * @param {*} entity_a 
 * @param {*} entity_b 
 */
export function calculateCollisionVector(entity_a, entity_b){
    if(!isColliding(entity_a, entity_b))
        return new Vector(0, 0);

    const a_right = entity_a.pos.x + entity_a.width / 2;
    const a_left = entity_a.pos.x - entity_a.width / 2;
    const a_bottom = entity_a.pos.y + entity_a.height / 2;
    const a_top = entity_a.pos.y - entity_a.height / 2;
    const b_right = entity_b.pos.x + entity_b.width / 2;
    const b_left = entity_b.pos.x - entity_b.width / 2;
    const b_bottom = entity_b.pos.y + entity_b.height / 2;
    const b_top = entity_b.pos.y - entity_b.height / 2;

    let collisionVector = new Vector(0, 0);
    if(b_left < a_right && a_right < b_right){
        collisionVector.x = a_right - b_left;
    }
    if(b_left < a_left && a_left < b_right){
        collisionVector.x = a_left - b_right;
    }
    if(b_top < a_bottom && a_bottom < b_bottom){
        collisionVector.y = a_bottom - b_top;
    }
    if(b_top < a_top && a_top < b_bottom){
        collisionVector.y = a_top - b_bottom;
    }

    if(!entity_b.collidesBottom)
        collisionVector.y = Math.max(0, collisionVector.y);
    if(!entity_b.collidesTop)
        collisionVector.y = Math.min(0, collisionVector.y);
    if(!entity_b.collidesLeft)
        collisionVector.x = Math.min(0, collisionVector.x);
    if(!entity_b.collidesRight)
        collisionVector.x = Math.max(0, collisionVector.x);

    if(Math.abs(collisionVector.x) < Math.abs(collisionVector.y) && collisionVector.x != 0){
        collisionVector.y = 0
    } else if(Math.abs(collisionVector.y) < Math.abs(collisionVector.x) && collisionVector.y != 0){
        collisionVector.x = 0
    } else {

    }

    return collisionVector;
}

/**
 * move the entity based on collisions with walls and other entities
 * @param {Entity} entity 
 */
export function adjustEntity(entity) {
    let collidingEntities = collideWithWorld(entity);
    // TODO: fill this list with entities to collide with.
    let collisionVectors = [];
    for(let i = 0; i < collidingEntities.length; i++){
        const collisionVector = calculateCollisionVector(entity, collidingEntities[i]);
        if(!(collisionVector.x == 0 && collisionVector.y == 0)){
            collisionVectors.push(collisionVector);
        }
    }

    for(let i = 0; i < collisionVectors.length; i++){
        if(Math.abs(collisionVectors[i].x) > Math.abs(collisionVectors[i].y) && collisionVectors[i].x != 0){
            entity.pos.x -= collisionVectors[i].x;
            entity.vel.x = collisionVectors[i].x * -(entity.bounciness);
        }
        else if(Math.abs(collisionVectors[i].y) > Math.abs(collisionVectors[i].x) && collisionVectors[i].y != 0){
            entity.pos.y -= collisionVectors[i].y;
            entity.vel.y = collisionVectors[i].y * -(entity.bounciness);
        } else {
            entity.pos.x -= collisionVectors[i].x;
            entity.pos.y -= collisionVectors[i].y;
            entity.vel.x = collisionVectors[i].x * -(entity.bounciness);
            entity.vel.y = collisionVectors[i].y * -(entity.bounciness);
        }
    }
}
