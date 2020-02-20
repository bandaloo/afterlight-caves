import { settings } from "../game/settings.js";

/** the default amount for how many times the same sound can play at once */
const MAX_SOUNDS = 1;

/** @type {Map<string, {sound: HTMLAudioElement, counter: number, maxCounter: number, volume: number}>} */
const soundMap = new Map();

/**
 * gets the sound or logs if the sound cannot be found
 * @param {string} str
 * @returns {HTMLAudioElement}
 */
export function getSound(str) {
  if (soundMap.has(str)) {
    return soundMap.get(str).sound;
  } else {
    console.error(`the sound "${str}" could not be found`);
  }
}

/**
 * play a sound or copy the sound and play it (useful for overlapping sounds)
 * @param {string} str
 * @param {boolean} copy whether to play a copy of the sound
 * @param {boolean} music whether this sound is music (as opposed to sfx)
 * @return {HTMLAudioElement}
 */
export function playSound(str, copy = true, music = false) {
  if (!music && settings["Mute sound effects"].value) return getSound(str);

  // return if no more of the same sound can be played
  if (soundMap.get(str).counter <= 0) return;
  soundMap.get(str).counter--;
  // clone the sound before playing to avoid network requests
  if (copy) {
    const clonedSound = /** @type {HTMLAudioElement} */ (getSound(
      str
    ).cloneNode(true));
    clonedSound.volume = soundMap.get(str).volume;
    clonedSound.play();
    return clonedSound;
  } else {
    // Due to an autoplay policy, sound can't be played until the DOM is
    // interacted with. If that happens, the sound will try to play again in one
    // second. This is the autoplay policy:
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    // We get around this by forcing DOM interaction before the game begins.
    const sound = getSound(str);
    sound.volume = soundMap.get(str).volume;
    sound.play().catch(() => {
      console.error(
        "Sound couldn't be played due to user not interacting with DOM yet." +
          " Trying again soon."
      );
      setTimeout(() => {
        playSound(str, copy);
      }, 1000);
    });
    return sound;
  }
}

/**
 * pauses the original sound.
 * @param {string} str
 */
export function pauseSound(str) {
  getSound(str).pause();
}

/**
 * sets the original sound back to the beginning
 * @param {string} str
 */
export function resetSound(str) {
  getSound(str).currentTime = 0;
}

/**
 * sets the loop value of a sound
 * @param {string} str
 * @param {boolean} doLoop
 */
export function loopSound(str, doLoop = true) {
  getSound(str).loop = doLoop;
}

/**
 * reset the counter for all sounds to the max counter
 */
export function ageSounds() {
  for (const v of soundMap.values()) {
    v.counter = v.maxCounter;
  }
}

/**
 * adds a sound to the sound map asynchronously
 * @param {string} key
 * @param {string} filename
 * @param {number} volume
 * @returns {Promise<HTMLAudioElement>} a promise returning the audio
 */
export function addSound(key, filename, volume) {
  return new Promise(resolve => {
    const audio = new Audio(filename);
    audio.addEventListener("canplaythrough", () => {
      soundMap.set(key, {
        sound: audio,
        counter: MAX_SOUNDS,
        maxCounter: MAX_SOUNDS,
        volume: volume
      });
      resolve(audio);
    });
    audio.onerror = () => {
      throw new Error("Failed to get audio " + filename);
    };
  });
}
