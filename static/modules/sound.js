/** the default amount for how many times the same sound can play at once */
const MAX_SOUNDS = 1;

/** @type {Map<string, {sound: HTMLAudioElement, counter: number, maxCounter: number}>} */
const soundMap = new Map();

/**
 * gets the sound or logs if the sound cannot be found
 * @param {string} str
 * @returns {HTMLAudioElement}
 */
function getSound(str) {
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
 */
export function playSound(str, copy = true) {
  // return if no more of the same sound can be played
  if (soundMap.get(str).counter <= 0) return;
  soundMap.get(str).counter--;
  // clone the sound before playing to avoid network requests
  if (copy) {
    const clonedSound = /** @type {HTMLAudioElement} */ (getSound(
      str
    ).cloneNode(true));
    clonedSound.play();
  } else {
    // Due to an autoplay policy, sound can't be played until the DOM is
    // interacted with. If that happens, the sound will try to play again in one
    // second. This is the autoplay policy:
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    getSound(str)
      .play()
      .catch(err => {
        console.log(
          "sound couldn't be played due to user not interacting with DOM yet." +
            " trying again soon."
        );
        setTimeout(() => {
          playSound(str, copy);
        }, 1000);
      });
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
 * adds a sound to the sound map
 * @param {string} key
 * @param {string} filename
 */
export function addSound(key, filename, limit = MAX_SOUNDS) {
  soundMap.set(key, {
    sound: new Audio(filename),
    counter: MAX_SOUNDS,
    maxCounter: MAX_SOUNDS
  });
}

/**
 * reset the counter for all sounds to the max counter
 */
export function ageSounds() {
  for (const v of soundMap.values()) {
    v.counter = v.maxCounter;
  }
}
