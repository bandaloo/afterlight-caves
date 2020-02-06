import { Entity, FarEnum } from "./entity.js";
import {
  controlKeydownListener,
  controlKeyupListener,
  ageButtons,
  gamepadConnectListener,
  gamepadDisconnectListener,
  getGamepadInput
} from "./buttons.js";
import { inPlaceFilter } from "./helpers.js";
import { isColliding } from "./collision.js";
import { Vector } from "./vector.js";
import { GuiElement } from "../modules/guielement.js";

const BLUR_SCALAR = 2;

class GameManager {
  updateTime = 10;
  overTime = 0;

  /** @type {number} */
  totalTime = 0;
  /** @type {number} */
  gameTime = 0;
  /** @type {number} */
  previousTime = 0;

  /** @type {Entity[]} */
  entities = [];

  /** @type {GuiElement} */
  guiElements = new Map();

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

  /** @type {number} */
  screenWidth;

  /** @type {number} */
  screenHeight;

  /** @type {number} */
  farDistance = 3000;

  /** @type {boolean} */
  gamePause = false;

  /**
   * map for entities that game programmer might want to access frequently, like player
   * @type {Map<string, Entity>}
   */
  importantEntities = new Map();

  // TODO consider whether we want the options pattern here
  constructor(
    width = 1920,
    height = 1080,
    displayWidth = 960,
    displayHeight = 540
  ) {
    // the canvas for drawing
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    //this.context.imageSmoothingEnabled = false;
    this.canvas.width = width;
    this.canvas.height = height;

    // the canvas for displaying
    this.displayCanvas = document.createElement("canvas");
    this.displayContext = this.displayCanvas.getContext("2d");
    //this.displayContext.imageSmoothingEnabled = false;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.displayCanvas.width = displayWidth;
    this.displayCanvas.height = displayHeight;

    // the untouched canvas for blurring before copying
    this.blurCanvas = document.createElement("canvas");
    this.blurContext = this.blurCanvas.getContext("2d");
    // TODO reconsider usage of image smoothing
    //this.blurContext.imageSmoothingEnabled = false;
    this.blurCanvas.width = width / BLUR_SCALAR;
    this.blurCanvas.height = height / BLUR_SCALAR;

    console.log("test");

    this.screenWidth = width;
    this.screenHeight = height;

    // TODO get rid of this
    this.blurContext.filter = "blur(3px) brightness(200%)";

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

    document.addEventListener("keydown", e => {
      const code = e.keyCode;
      const key = String.fromCharCode(code);
      // press P to pause
      if (key == "P") {
        toggleGuiElement("pausescreen");
        this.gamePause = !this.gamePause;
      }
    });

    // add event listeners for hero controls
    document.addEventListener("keydown", controlKeydownListener);
    document.addEventListener("keyup", controlKeyupListener);

    // deal with controllers
    window.addEventListener("gamepadconnected", gamepadConnectListener);
    window.addEventListener("gamepaddisconnected", gamepadDisconnectListener);

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
    // do changes on far away entities
    for (let i = 0; i < this.entities.length; i++) {
      const {
        width: screenWidth,
        height: screenHeight
      } = getScreenDimensions();
      const screenCenter = new Vector(screenWidth, screenHeight).mult(0.5);
      const cameraCenter = getCameraOffset()
        .mult(-1)
        .add(screenCenter);

      if (this.entities[i].pos.dist2(cameraCenter) > getFarDistance() ** 2) {
        if (this.entities[i].farType === FarEnum.delete) {
          this.entities[i].deleteMe = true;
        } else if (this.entities[i].farType === FarEnum.deactivate) {
          this.entities[i].active = false;
        }
      } else {
        if (this.entities[i].farType === FarEnum.deactivate) {
          // reactivate close enemies
          this.entities[i].active = true;
        }
      }
    }

    // let all entities take their actions
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].pausable && this.gamePause) continue;

      // exclude inactive entities
      if (this.entities[i].active) {
        this.entities[i].action();
      }
    }

    // let all Gui elements take their actions
    for (const guiKey of this.guiElements.keys()) {
      if (this.guiElements.get(guiKey).active) {
        this.guiElements.get(guiKey).action();
      }
    }

    // run a physics step on all entities including particles
    /** @type {Entity[][]} */
    const entityLists = [this.entities, this.particles];
    for (let i = 0; i < entityLists.length; i++) {
      if (entityLists[i].pausable && this.gamePause) continue;

      for (let j = 0; j < entityLists[i].length; j++) {
        if (entityLists[i][j].pausable && this.gamePause) continue;
        // exclude inactive entities
        if (entityLists[i][j].active) {
          entityLists[i][j].lifetime--;
          if (entityLists[i][j].lifetime <= 0) {
            entityLists[i][j].deleteMe = true;
          }
          entityLists[i][j].step();
        }
      }
    }

    // push all entities out of walls
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].pausable && this.gamePause) continue;

      // exclude inactive entities
      if (this.entities[i].active) {
        this.entities[i].adjust();
      }
    }

    // resolve collisions between entities
    this.collideWithEntities();
    // destroy entities that have an expired lifetime or are flagged
    this.destroyEntities(this.entities);
    this.destroyEntities(this.particles);

    // tell buttons that a step has passed
    ageButtons();
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
    // reposition camera if there is a followed entity
    if (this.cameraEntity !== undefined) {
      this.cameraOffset = this.cameraEntity.drawPos
        .mult(-1)
        .add(new Vector(this.screenWidth / 2, this.screenHeight / 2));
    }

    // clear the display canvas with black rectangle
    this.displayContext.fillRect(
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );
    // clear the drawing canvas with alpha 0
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // clear the blur canvas with alpha 0
    this.blurContext.clearRect(
      0,
      0,
      this.blurCanvas.width,
      this.blurCanvas.height
    );

    // save drawing context
    this.context.save();
    // run draw func specified by game programmer
    this.drawFunc();

    // draw all particles
    for (let i = 0; i < this.particles.length; i++) {
      // TODO see if culling particles does anything for performance
      if (this.particles[i].onScreen()) {
        this.particles[i].draw();
      }
    }

    // draw all entities
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].onScreen()) {
        this.entities[i].draw();
      }
    }
    // restore drawing context
    this.context.restore();

    // copy the drawing canvas onto the blur canvas
    this.blurContext.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width / BLUR_SCALAR,
      this.canvas.height / BLUR_SCALAR
    );

    // align camera, draw the gui, reset camera
    // this is after the draw canvas is copied to the blur canvas
    // move this to before if you want the gui blurred
    const originalOffset = this.cameraOffset;
    this.cameraOffset = new Vector(0, 0);
    for (const guiKey of this.guiElements.keys()) {
      if (this.guiElements.get(guiKey).active) {
        this.guiElements.get(guiKey).draw();
      }
    }

    this.cameraOffset = originalOffset;

    // copy the blur canvas onto the display canvas
    this.displayContext.drawImage(
      this.blurCanvas,
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );

    // save display context
    this.displayContext.save();
    this.displayContext.globalCompositeOperation = "lighter";
    // copy the drawing canvas onto the display canvas
    this.displayContext.drawImage(
      this.canvas,
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );
    // restore display context
    this.displayContext.restore();
  }

  collideWithEntities() {
    // TODO why is this logic not part of the collision.js file?
    // generate the type map for faster access
    const map = new Map();
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].pausable && this.gamePause) continue;
      const entity = this.entities[i];
      // exclude inactive entities
      if (entity.active) {
        if (map.get(entity.type) === undefined) {
          map.set(entity.type, []);
        }
        map.get(entity.type).push(entity);
      }
    }

    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].pausable && this.gamePause) continue;
      const targetEntity = this.entities[i];
      // exclude inactive entities
      if (targetEntity.active) {
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
  }

  /**
   * @param {Entity[]} entityList
   */
  prepareTween(entityList) {
    // get the tween vectors
    for (let i = 0; i < entityList.length; i++) {
      // exclude inactive entities
      if (entityList[i].active) {
        entityList[i].lastPos = entityList[i].pos;
      }
    }
  }

  performTween(entityList, timeLeft) {
    for (let i = 0; i < entityList.length; i++) {
      // exclude inactive entities
      if (entityList[i].active) {
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
  }

  /**
   * @param {number} [currentTime]
   */
  update(currentTime = this.updateTime) {
    // get input from any controllers
    getGamepadInput();

    // keep track of time passed
    let deltaTime = currentTime - this.previousTime;
    if (deltaTime > 200) {
      deltaTime = 200;
    }
    this.totalTime += deltaTime;

    // Game time doesn't incrememnt when the game is paused.
    if (!this.gamePause) this.gameTime += deltaTime;

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

// TODO make this use inboundsBoard
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

export function getGameTime() {
  return gameManager.gameTime;
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
  entity.drawPos = entity.pos;
  entity.lastPos = entity.pos;
  gameManager.entities.push(entity);
}

/**
 * add a GUI element to the GUI of the game
 * @param {string} key
 * @param {GuiElement} guiElement
 */
export function addToGui(key, guiElement) {
  gameManager.guiElements.set(key, guiElement);
}

/**
 * toggle a gui elements to be active or not active
 * @param {string} key
 */
export function toggleGuiElement(key) {
  gameManager.guiElements.get(key).active = !gameManager.guiElements.get(key)
    .active;
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

/**
 * gets the camera entity
 * @returns {Entity}
 */
export function getCameraEntity() {
  return gameManager.cameraEntity;
}

/**
 * sets the camera entity
 * @param {Entity} cameraEntity
 */
export function setCameraEntity(cameraEntity) {
  gameManager.cameraEntity = cameraEntity;
}

/**
 * return an object with info about screen dimensions
 * @returns {{width: number, height: number}}
 */
export function getScreenDimensions() {
  return { width: gameManager.screenWidth, height: gameManager.screenHeight };
}

/**
 * @param {string} name
 * @returns {Entity}
 */
export function getImportantEntity(name) {
  return gameManager.importantEntities.get(name);
}

/**
 * @param {string} name
 * @param {Entity} entity
 */
export function setImportantEntity(name, entity) {
  gameManager.importantEntities.set(name, entity);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function hasImportantEntity(name) {
  return gameManager.importantEntities.has(name);
}

/**
 * @param {string} name
 */
export function deleteImportantEntity(name) {
  gameManager.importantEntities.delete(name);
}

/**
 * get center of terrain cell position
 * @param {Vector} vec
 * @returns {Vector}
 */
export function cellToWorldPosition(vec) {
  const { width: blockWidth, height: blockHeight } = getDimensions();
  return new Vector(
    vec.x * blockWidth + blockWidth / 2,
    vec.y * blockHeight + blockHeight / 2
  );
}

export function getFarDistance() {
  return gameManager.farDistance;
}

/**
 * sets the far distance
 * @param {number} farDistance
 */
export function setFarDistance(farDistance) {
  gameManager.farDistance = farDistance;
}
