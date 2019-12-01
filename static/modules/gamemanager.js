import { Entity } from "./entity.js";
import {
  controlKeydownListener,
  controlKeyupListener,
  cleanButtons
} from "../game/buttons.js";
import { inPlaceFilter } from "./helpers.js";
import { isColliding } from "./collision.js";
import { Vector } from "./vector.js";

class GameManager {
  updateTime = 10;
  overTime = 0;

  totalTime = 0;

  previousTime = 0;

  /** @type {Entity[]} */
  entities = [];

  /** @type {Entity[]} */
  particles = [];

  /** @type {number[][]} */
  terrain = [];

  /** @type {number} */
  blockWidth;

  /** @type {number} */
  blockHeight;

  /** @type {Vector} */
  cameraOffset = new Vector(0, 0);

  /** @type {Entity} */
  cameraEntity;

  // TODO consider whether we want the options pattern here
  constructor(
    width = 1920,
    height = 1080,
    displayWidth = 960,
    displayHeight = 540
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.canvas.width = width;
    this.canvas.height = height;

    this.displayCanvas = document.createElement("canvas");
    this.displayContext = this.displayCanvas.getContext("2d");
    this.displayContext.imageSmoothingEnabled = false;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.displayCanvas.width = displayWidth;
    this.displayCanvas.height = displayHeight;

    // drawing func defaults to a no-op
    this.drawFunc = () => {};

    const exitHandler = () => {
      if (document.fullscreenElement === null) {
        this.displayCanvas.width = this.displayWidth;
        this.displayCanvas.height = this.displayHeight;
      }
    };

    this.displayCanvas.addEventListener("fullscreenchange", exitHandler, false);

    document.addEventListener("keydown", e => {
      const code = e.keyCode;
      const key = String.fromCharCode(code);
      // press F for fullscreen
      if (key == "F") {
        // TODO get rid of these magic numbers for resolution
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.enterFullscreen();
      }
    });

    // add event listeners for hero controls
    document.addEventListener("keydown", controlKeydownListener);
    document.addEventListener("keyup", controlKeyupListener);

    this.addDisplayToDiv("gamediv");
  }

  enterFullscreen() {
    if (this.displayCanvas.requestFullscreen) {
      this.displayCanvas.requestFullscreen();
    } else {
      throw new Error("no request fullscreen function");
    }
  }

  addDisplayToDiv(id) {
    const displayDiv = document.getElementById(id);
    displayDiv.appendChild(this.displayCanvas);
  }

  stepGame() {
    // let all entities take their actions
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].action();
    }
    // run a physics step on all entities including particles
    /** @type {Entity[][]} */
    const entityLists = [this.entities, this.particles];
    for (let i = 0; i < entityLists.length; i++) {
      for (let j = 0; j < entityLists[i].length; j++) {
        entityLists[i][j].lifetime--;
        if (entityLists[i][j].lifetime <= 0) {
          entityLists[i][j].deleteMe = true;
        }
        entityLists[i][j].step();
      }
    }
    // push all entities out of walls
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].adjust();
    }
    // resolve collisions between entities
    this.collideWithEntities();
    // destroy entities that have an expired lifetime or are flagged
    this.destroyEntities(this.entities);
    this.destroyEntities(this.particles);
    // set presses and releases to false
    cleanButtons();
  }

  /**
   * removes all dead entities from an entity list
   * @param {Entity[]} entityList
   */
  destroyEntities(entityList) {
    // destroy all entites that want to be deleted
    inPlaceFilter(
      entityList,
      entity => entity.lifetime > 0 && !entity.deleteMe,
      entity => entity.destroy()
    );
  }

  drawGame() {
    // clear the display canvas
    this.displayCanvas.width = this.displayCanvas.width;
    // clear the drawing canvas
    this.canvas.width = this.canvas.width;

    // save drawing context
    this.context.save();
    // run draw func specified by game programmer
    this.drawFunc();
    // draw all particles
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw();
    }
    // draw all entities
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].draw();
    }
    // restore drawing context
    this.context.restore();

    // save display context
    this.displayContext.save();
    this.displayContext.scale(
      this.displayCanvas.width / this.canvas.width,
      this.displayCanvas.height / this.canvas.height
    );
    // copy the drawing canvas onto the display canvas
    this.displayContext.drawImage(this.canvas, 0, 0);
    // restore display context
    this.displayContext.restore();
  }

  collideWithEntities() {
    // generate the type map for faster access
    const map = new Map();
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      if (map.get(entity.type) === undefined) {
        map.set(entity.type, []);
      }
      map.get(entity.type).push(entity);
    }

    for (let i = 0; i < this.entities.length; i++) {
      const targetEntity = this.entities[i];
      const collideTypes = [];
      const collideMapIterator = targetEntity.collideMap.keys();

      // get types that the target entity should collide with
      for (
        let nextType = collideMapIterator.next();
        nextType.done !== true;
        nextType = collideMapIterator.next()
      ) {
        collideTypes.push(nextType.value);
      }

      for (let j = 0; j < collideTypes.length; j++) {
        const collideEntities = map.get(collideTypes[j]);
        if (collideEntities !== undefined) {
          for (let k = 0; k < collideEntities.length; k++) {
            if (isColliding(targetEntity, collideEntities[k])) {
              targetEntity.collideWithEntity(collideEntities[k]);
            }
          }
        }
      }
    }
  }

  /**
   * @param {Entity[]} entityList
   */
  prepareTween(entityList) {
    // get the tween vectors
    for (let i = 0; i < entityList.length; i++) {
      entityList[i].lastPos = entityList[i].pos;
    }
  }

  performTween(entityList, timeLeft) {
    for (let i = 0; i < entityList.length; i++) {
      // value used for debugging
      let tempPrevPos = entityList[i].lastPos;
      let tempDrawPos = entityList[i].lastPos.partway(
        entityList[i].pos,
        (this.updateTime + timeLeft) / this.updateTime
      );
      // value used for debugging
      let tempCurrPos = entityList[i].pos;
      // uncomment these to debug tweening
      //console.log("prev " + tempPrevPos);
      //console.log("draw " + tempDrawPos);
      //console.log("curr " + tempCurrPos);
      entityList[i].drawPos = tempDrawPos;
    }
  }

  /**
   * @param {number} [currentTime]
   */
  update(currentTime = this.updateTime) {
    // keep track of time passed
    let deltaTime = currentTime - this.previousTime;
    if (deltaTime > 200) {
      deltaTime = 200;
    }
    this.totalTime += deltaTime;
    let gameSteps = 0;
    let timeLeft = deltaTime - this.overTime;
    while (timeLeft > 0) {
      // if this loop is the last step before going over time
      if (timeLeft <= this.updateTime) {
        this.prepareTween(this.particles);
        this.prepareTween(this.entities);
      }
      this.stepGame();
      timeLeft -= this.updateTime;
      gameSteps++;
    }
    //console.log(gameSteps);
    // set all the tweened vectors to the draw positions
    this.performTween(this.entities, timeLeft);
    this.performTween(this.particles, timeLeft);
    this.overTime = -timeLeft;

    this.drawGame();
    //this.destroyEntities();

    // increase the time
    this.previousTime = currentTime;
    requestAnimationFrame(this.update.bind(this));
  }
}

const gameManager = new GameManager();

export function startUp() {
  gameManager.update();
}

export function getCanvas() {
  return gameManager.canvas;
}

export function getContext() {
  return gameManager.context;
}

export function getCanvasWidth() {
  return gameManager.canvas.width;
}

export function getCanvasHeight() {
  return gameManager.canvas.height;
}

/**
 * set the additional draw function to happen every game loop
 * @param {() => void} drawFunc drawing function to happen every loop
 */
export function setGameDrawFunc(drawFunc) {
  gameManager.drawFunc = drawFunc;
}

/**
 * set the grid of numbers to determine solid parts of world
 * @param {number[][]} board
 */
export function setTerrain(board) {
  gameManager.terrain = board;
}

export function getTerrain() {
  return gameManager.terrain;
}

/**
 * returns whether a coordinate is inbounds for the terrain
 * @param {number} i
 * @param {number} j
 */
export function inbounds(i, j) {
  return (
    i >= 0 &&
    i < gameManager.terrain.length &&
    j >= 0 &&
    j < gameManager.terrain[0].length
  );
}

/**
 * set a block in the current terrain without going out of bounds
 * @param {number} i
 * @param {number} j
 * @param {number} val
 * @returns {boolean} whether the block was able to be set
 */
export function setBlock(i, j, val) {
  if (inbounds(i, j)) {
    gameManager.terrain[i][j] = val;
    // was able to set it
    return true;
  }
  // wasn't able to set it
  return false;
}

export function getTotalTime() {
  return gameManager.totalTime;
}

/**
 * set dimensions that the terrain is supposed to represent
 * @param {number} blockWidth
 * @param {number} blockHeight
 */
export function setDimensions(blockWidth, blockHeight) {
  gameManager.blockWidth = blockWidth;
  gameManager.blockHeight = blockHeight;
}

/**
 * return an object with info about block dimensions
 * @returns {{width: number, height: number}}
 */
export function getDimensions() {
  return { width: gameManager.blockWidth, height: gameManager.blockHeight };
}

/**
 * add an entity to the game world as a full entity
 * @param {Entity} entity
 */
export function addToWorld(entity) {
  gameManager.entities.push(entity);
}

/**
 * get rid of all the entities
 */
export function destroyEverything() {
  gameManager.entities = [];
}

/**
 * add entity to the game world as a particle
 * @param {Entity} particle
 */
export function addParticle(particle) {
  gameManager.particles.push(particle);
}

/**
 * get the camera offset
 */
export function getCameraOffset() {
  return gameManager.cameraOffset;
}

/**
 * set the camera offset
 * @param {Vector} cameraOffset
 */
export function setCameraOffset(cameraOffset) {
  gameManager.cameraOffset = cameraOffset;
}
