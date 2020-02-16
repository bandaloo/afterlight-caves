import { pauseSound, loopSound, playSound } from "../modules/sound.js";

export const settings = {
  muteMusic: {
    name: "Mute music",
    value: false,
    onClick() {
      this.value = !this.value;
      if (this.value) {
        pauseSound("captive-portal");
      } else {
        loopSound("captive-portal");
        playSound("captive-portal", false);
      }
    }
  },

  *[Symbol.iterator]() {
    yield this.muteMusic;
  }
}
