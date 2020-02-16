import { GuiElement } from "../modules/guielement.js";
import {
  ageButtons,
  controlKeydownListener,
  controlKeyupListener,
  gamepadConnectListener,
  gamepadDisconnectListener,
  getGamepadInput,
  buttons
} from "./buttons.js";
import { isColliding } from "./collision.js";
import { Entity, FarEnum } from "./entity.js";
import { inPlaceFilter } from "./helpers.js";
import { Vector } from "./vector.js";
import { ageSounds } from "./sound.js";
import { resetDemo } from "../main.js";
import { PauseScreen } from "../game/pausescreen.js";
import {
  getScreenDimensions,
  getCameraOffset,
  toggleFullscreen,
  drawGame,
  setSplatterSize,
  addDisplayToDiv
} from "./displaymanager.js";

// TODO move this
const BLUR_SCALAR = 2;

// TODO move this to displaymanager
export const SPLATTER_SCALAR = 4;

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

  /** @type {Map<string, GuiElement>} */
  guiElements = new Map();

  /** @type {Entity[]} */
  particles = [];

  /** @type {number[][]} */
  terrain = [];

  /** @type {number} */
  blockWidth;

  /** @type {number} */
  blockHeight;

  /** @type {number} */
  resetCounter;

  /** @type {Vector} */
  cameraOffset = new Vector(0, 0);

  /** @type {Entity} */
  cameraEntity;

  /** @type {number} */
  farDistance = 3000;

  /** @type {boolean} */
  gamePause = false;

  /**
   * map for entities that game programmer might want to access frequently, like player
   * @type {Map<string, Entity>}
   */
  importantEntities = new Map();

  constructor() {
    document.getElementById("name-input").addEventListener("focus", () => {
      collectInput(false);
    });

    document.getElementById("name-input").addEventListener("blur", () => {
      collectInput(true);
    });

    collectInput(true);
  }

  togglePause() {
    if (!this.gamePause) {
      gameManager.guiElements.get("pausescreen").active = true;
      this.gamePause = true;
    } else {
      const pauseScreen = /** @type { PauseScreen } */ (this.guiElements.get(
        "pausescreen"
      ));
      pauseScreen.onBack();
      this.gamePause = false;
    }
  }

  stepGame() {
    ageSounds();
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
          // reactivate close entities
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
    // check pause and fullscreen buttons
    if (buttons.fullscreen.status.isPressed) {
      toggleFullscreen();
    }
    if (buttons.pause.status.isPressed) {
      // you can't pause while dead
      if (!this.importantEntities.get("hero").deleteMe) this.togglePause();
    }
    if (buttons.reset.status.isDown) {
      this.resetCounter++;
      if (this.resetCounter >= 60) {
        this.resetCounter = 0;
        resetDemo();
      }
    } else {
      this.resetCounter = 0;
    }

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

  /**
   * set all the draw positions of the entities to perform the tweening
   * @param {Entity[]} entityList
   * @param {number} timeLeft
   */
  performTween(entityList, timeLeft) {
    for (let i = 0; i < entityList.length; i++) {
      // exclude inactive entities
      if (entityList[i].active) {
        // uncomment these to debug tweening
        //let tempPrevPos = entityList[i].lastPos; // value used for debugging
        let tempDrawPos = entityList[i].lastPos.partway(
          entityList[i].pos,
          (this.updateTime + timeLeft) / this.updateTime
        );
        // uncomment these to debug tweening
        //let tempCurrPos = entityList[i].pos; // value used for debugging
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

    // uncomment this for debugging
    //let gameSteps = 0;
    let timeLeft = deltaTime - this.overTime;
    while (timeLeft > 0) {
      // if this loop is the last step before going over time
      if (timeLeft <= this.updateTime) {
        this.prepareTween(this.particles);
        this.prepareTween(this.entities);
      }
      this.stepGame();
      timeLeft -= this.updateTime;
      // uncomment these to debug tweening
      //gameSteps++;
    }
    // set all the tweened vectors to the draw positions
    this.performTween(this.entities, timeLeft);
    this.performTween(this.particles, timeLeft);
    this.overTime = -timeLeft;

    drawGame(this.entities, this.particles, this.guiElements);
    //this.destroyEntities();

    // increase the time
    this.previousTime = currentTime;
    requestAnimationFrame(this.update.bind(this));
  }
}

const gameManager = new GameManager();

export function startUp() {
  addDisplayToDiv("gamediv");
  gameManager.update();
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
  // set the splatter canvas to the correct width once this is done
  const boardWidth = gameManager.terrain.length;
  const boardHeight = gameManager.terrain[0].length;

  // we don't actually need to clear the splatter canvas on a game reset
  // because this happens when the width property of the canvas is changed
  setSplatterSize(
    (boardWidth * blockWidth) / SPLATTER_SCALAR,
    (boardHeight * blockHeight) / SPLATTER_SCALAR
  );
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
 * get gui element from key
 * @param {string} key
 */
export function getGuiElement(key) {
  return gameManager.guiElements.get(key);
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

export function setPause(arg = true) {
  gameManager.gamePause = arg;
}

export function getPause() {
  return gameManager.gamePause;
}

/**
 * Set whether or not to collect input from keyboard
 */
export function collectInput(arg = true) {
  document.removeEventListener("keydown", controlKeydownListener);
  document.removeEventListener("keyup", controlKeyupListener);

  // deal with controllers
  window.removeEventListener("gamepadconnected", gamepadConnectListener);
  window.removeEventListener("gamepaddisconnected", gamepadDisconnectListener);

  if (arg) {
    // add event listeners for hero controls
    document.addEventListener("keydown", controlKeydownListener);
    document.addEventListener("keyup", controlKeyupListener);

    // deal with controllers
    window.addEventListener("gamepadconnected", gamepadConnectListener);
    window.addEventListener("gamepaddisconnected", gamepadDisconnectListener);
  }
}
