import { boardToString, getGrid, getEmptySpaces } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
import {
  startUp,
  setGameDrawFunc,
  addToWorld,
  setTerrain,
  setDimensions,
  destroyEverything,
  setCameraEntity,
  setImportantEntity
} from "./modules/gamemanager.js";
import { drawBoard } from "./game/draw.js";
import { Enemy, randomLook, randomStats } from "./game/enemy.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { Hero } from "./game/hero.js";
import { initBlockField, distanceBoard } from "./game/generator.js";
import { PowerUp } from "./game/powerup.js";
import { Bigify } from "./game/powerups/bigify.js";
import { Zoom } from "./game/powerups/zoom.js";
import { Rubber } from "./game/powerups/rubber.js";
import { Elastic } from "./game/powerups/elastic.js";
import { Scatter } from "./game/scatter.js";
import { Chase } from "./game/chase.js";
import { Shooter } from "./game/shooter.js";

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

/** @type {string} */
let color;

/** @type {import("./game/enemy.js").Look[]} */
let enemyLooks = [];

/** @type {import("./game/enemy.js").Stats[]} */
let enemyStats = [];

function resetDemo() {
  destroyEverything();
  color = hsl(randomInt(360));
  enemyLooks = [];
  enemyStats = [];

  let board = getGrid(
    blockColumns * 8,
    blockRows * 8,
    caveRules,
    EdgesEnum.alive,
    0.45,
    20
  );

  setTerrain(board);
  initBlockField(board);
  setDimensions(blockWidth, blockHeight);

  setGameDrawFunc(() => {
    drawBoard(board, blockWidth, blockHeight, color);
  });

  // TODO use this to spawn big enemies
  let distBoard = distanceBoard(board);

  let emptySpaces = shuffle(getEmptySpaces(board, 10, blockWidth, blockHeight));

  // create four looks with four difficulties
  for (let i = 0; i < 4; i++) {
    enemyLooks.push(randomLook());
    enemyStats.push(randomStats(i * 3 + 3));
  }

  for (let i = 0; i < 500; i++) {
    // TODO change this with actual enemy spawning system
    const enemy = new Shooter(
      emptySpaces[i % emptySpaces.length].add(
        new Vector(blockWidth / 2, blockHeight / 2)
      ),
      enemyLooks[i % 4],
      enemyStats[i % 4],
      undefined,
      undefined,
      { size: randomInt(3), speed: 0, explode: 0 }
    );
    addToWorld(enemy);
    /*
    if (i % 2) {
      const enemy = new Chase(
        emptySpaces[i % emptySpaces.length].add(
          new Vector(blockWidth / 2, blockHeight / 2)
        ),
        enemyLooks[i % 4],
        enemyStats[i % 4],
        undefined,
        undefined,
        { size: randomInt(3), speed: 0, explode: 0 }
      );
      addToWorld(enemy);
    } else {
      const enemy = new Scatter(
        emptySpaces[i % emptySpaces.length].add(
          new Vector(blockWidth / 2, blockHeight / 2)
        ),
        enemyLooks[i % 4],
        enemyStats[i % 4],
        undefined,
        undefined,
        { size: randomInt(3), speed: 0, explode: 0 }
      );
      addToWorld(enemy);
    }
    */
  }
  // TODO change this with actual powerup spawning
  const powerUpTypes = [Bigify, Elastic, Rubber, Zoom];
  for (let i = 0; i < 70; ++i) {
    const r = Math.random();
    const magnitude = Math.floor(Math.random() * 5) + 1;
    const location = emptySpaces[
      Math.floor(Math.random() * emptySpaces.length)
    ].add(new Vector(blockWidth / 2, blockHeight / 2));
    for (let j = 1; j <= powerUpTypes.length; ++j) {
      if (r < j / powerUpTypes.length) {
        const powerUp = new powerUpTypes[j-1](location, magnitude);
        console.log(powerUp.powerUpName);
        addToWorld(powerUp);
        break;
      }
    }
  }

  const hero = new Hero(
    new Vector(0, 0).add(
      new Vector(blockWidth / 2, blockHeight / 2).add(emptySpaces[11])
    )
  );
  setCameraEntity(hero);
  setImportantEntity("hero", hero);
  addToWorld(hero);

  // TODO remove this
  // add a powerup
  const rubber = new Elastic(
    hero.drawPos.add(new Vector(60, 1)),
    1 + Math.floor(Math.random() * 5)
  );
  addToWorld(rubber);
}

document.addEventListener("keydown", e => {
  const code = e.keyCode;
  const key = String.fromCharCode(code);
  // press F for fullscreen
  if (key == "R") {
    resetDemo();
  }
});

resetDemo();

startUp();
