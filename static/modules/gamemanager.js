import { Entity } from "./entity.js";
import { Vector } from "./vector.js";
import {
  controlKeydownListener,
  controlKeyupListener,
  cleanButtons
} from "../game/buttons.js";
import { inPlaceFilter } from "./helpers.js";
import { isColliding } from "./collision.js";

class GameManager {
  updateTime = 10;
  overTime = 0;

  totalTime = 0;

  previousTime = 0;

  /** @type {Entity[]} */
  entities = [];

  /** @type {Vector[]} */
  lastPositions = [];

  /** @type {number[][]} */
  terrain = [];

  /** @type {number} */
  blockWidth;

  /** @type {number} */
  blockHeight;

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
      this.entities[i].lifetime--;
      if (this.entities[i].lifetime <= 0) {
        this.entities[i].deleteMe = true;
      }
    }
    // run a physics step on all entities
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].step();
    }
    // push all entities out of walls
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].adjust();
    }
    // resolve collisions between entities
    this.collideWithEntities();
    // destroy entities that have an expired lifetime or are flagged
    this.destroyEntities();
    // set presses and releases to false
    cleanButtons();
  }

  destroyEntities() {
    // destroy all entites that want to be deleted
    inPlaceFilter(
      this.entities,
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
    for (let i = 0; i < this.entities.length; i++) {
      const targetEntity = this.entities[i];
      const collideTypes = [];
      const collideMapIterator = targetEntity.collideMap.keys();
      for (
        let nextType = collideMapIterator.next();
        nextType.done !== true;
        nextType = collideMapIterator.next()
      ) {
        collideTypes.push(nextType.value);
      }
      const collideEntities = this.entities.filter(
        entity =>
          collideTypes.includes(entity.type) &&
          isColliding(targetEntity, entity)
      );
      for (let j = 0; j < collideEntities.length; j++) {
        targetEntity.collide(collideEntities[j]);
      }
    }
  }

  // TODO should currentTime be an optional parameter?

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
      let doDestroy = true;
      if (timeLeft <= this.updateTime) {
        //this.lastPositions = [];
        // get the tween vectors
        for (let i = 0; i < this.entities.length; i++) {
          //this.lastPositions.push(this.entities[i].pos);
          this.entities[i].lastPos = this.entities[i].pos;
        }
        // delay destruction of entities until after draw, just this time
        doDestroy = false;
      }
      this.stepGame();
      if (doDestroy) {
        //this.destroyEntities();
      }
      timeLeft -= this.updateTime;
      gameSteps++;
    }
    //console.log(gameSteps);
    // set all the tweened vectors to the draw positions
    for (let i = 0; i < this.entities.length; i++) {
      //let tempPrevPos = this.lastPositions[i];
      let tempPrevPos = this.entities[i].lastPos;
      /*
      let tempDrawPos = this.lastPositions[i].partway(
        this.entities[i].pos,
        (this.updateTime + timeLeft) / this.updateTime
      );
      */
      let tempDrawPos = this.entities[i].lastPos.partway(
        this.entities[i].pos,
        (this.updateTime + timeLeft) / this.updateTime
      );
      //let tempCurrPos = this.entities[i].pos;
      let tempCurrPos = this.entities[i].pos;
      //console.log("prev " + tempPrevPos);
      //console.log("draw " + tempDrawPos);
      //console.log("curr " + tempCurrPos);
      this.entities[i].drawPos = tempDrawPos;
    }

    this.overTime = -timeLeft;

    this.drawGame();
    this.destroyEntities();

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

export function getDimensions() {
  return { width: gameManager.blockWidth, height: gameManager.blockHeight };
}

/**
 * add an entity to the game world
 * @param {Entity} entity
 */
export function addToWorld(entity) {
  gameManager.entities.push(entity);
}

export function destroyEverything() {
  gameManager.entities = [];
}
