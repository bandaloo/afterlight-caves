/**
 * @typedef Resource
 * @property {string} name
 * @property {string} file
 * @property {number} [vol]
 */
/** @type {Resource[]} */
export const resources = [
  {
    name: "afterlight-caves",
    file: "../sounds/afterlight-caves.mp3",
    vol: 0.5
  },

  { name: "hit-breakable", file: "../sounds/hit-breakable.wav", vol: 0.7 },
  { name: "enemy-hurt", file: "../sounds/enemy-hurt.wav", vol: 1.0 },
  { name: "enemy-dead", file: "../sounds/enemy-dead.wav", vol: 1.0 },
  { name: "hero-hurt", file: "../sounds/hero-hurt.wav", vol: 0.7 },
  { name: "power-up", file: "../sounds/power-up.wav", vol: 0.7 },
  { name: "shoot", file: "../sounds/shoot.wav", vol: 0.7 },
  { name: "death", file: "../sounds/death.wav", vol: 0.7 },
  { name: "gem", file: "../sounds/gem.wav", vol: 0.7 },
  { name: "menu-nav", file: "../sounds/menu-nav.wav", vol: 0.7 },
  { name: "menu-back", file: "../sounds/menu-back.wav", vol: 0.7 },
  { name: "menu-select", file: "../sounds/menu-select.wav", vol: 0.7 },
  { name: "bomb-explode", file: "../sounds/bomb-explode.wav", vol: 0.7 },
  { name: "health-pickup", file: "../sounds/health-pickup.wav", vol: 0.7 },
  { name: "bomb-pickup", file: "../sounds/bomb-pickup.wav", vol: 0.7 },
  { name: "item-get", file: "../sounds/item-get.wav", vol: 0.7 },

  // power up names
  { name: "amplify", file: "../sounds/powerups/amplify.wav" },
  { name: "icy", file: "../sounds/powerups/icy.wav" },
  { name: "nitroglycerin", file: "../sounds/powerups/nitroglycerin.wav" },
  { name: "right", file: "../sounds/powerups/right.wav" },
  { name: "ultra-bomb", file: "../sounds/powerups/ultra-bomb.wav" },
  { name: "zoom", file: "../sounds/powerups/zoom.wav" },
  { name: "bigger-bombs", file: "../sounds/powerups/bigger-bombs.wav" },
  { name: "flamethrower", file: "../sounds/powerups/flamethrower.wav" },
  { name: "jalapeño", file: "../sounds/powerups/jalapeno.wav" },
  { name: "slippery-bombs", file: "../sounds/powerups/slippery-bombs.wav" },
  { name: "vitality", file: "../sounds/powerups/vitality.wav" },
  { name: "cone", file: "../sounds/powerups/cone.wav" },
  { name: "knapsack", file: "../sounds/powerups/knapsack.wav" },
  { name: "orb", file: "../sounds/powerups/orb.wav" },
  { name: "thermalite", file: "../sounds/powerups/thermalite.wav" },
  { name: "wall", file: "../sounds/powerups/wall.wav" },
  { name: "damage-up", file: "../sounds/powerups/damage-up.wav" },
  { name: "group-bomb", file: "../sounds/powerups/group-bomb.wav" },
  { name: "left", file: "../sounds/powerups/left.wav" },
  { name: "popsicle", file: "../sounds/powerups/popsicle.wav" },
  { name: "xplode", file: "../sounds/powerups/xplode.wav" },
  { name: "elastic", file: "../sounds/powerups/elastic.wav" },
  { name: "hot", file: "../sounds/powerups/hot.wav" },
  { name: "machine-gun", file: "../sounds/powerups/machine-gun.wav" },
  { name: "quick-shot", file: "../sounds/powerups/quick-shot.wav" },
  { name: "yeet", file: "../sounds/powerups/yeet.wav" },

  // power up magnitudes
  { name: "one", file: "../sounds/powerups/one.wav" },
  { name: "two", file: "../sounds/powerups/two.wav" },
  { name: "three", file: "../sounds/powerups/three.wav" },
  { name: "four", file: "../sounds/powerups/four.wav" },
  { name: "five", file: "../sounds/powerups/five.wav" }
];
