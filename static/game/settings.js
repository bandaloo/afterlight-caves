import { pauseSound, loopSound, playSound, getSound } from "../modules/sound.js";

export const settings = {
  "Mute music": {
    value: false,
    onClick() {
      this.value = !this.value;
      if (this.value) {
        pauseSound("captive-portal");
      } else {
        loopSound("captive-portal");
        getSound("captive-portal").play();
      }
    }
  },
  "Mute all": {
    value: false,
    onClick() {
      this.value = !this.value;
      if (this.value) {
        pauseSound("captive-portal");
      } else {
        loopSound("captive-portal");
        getSound("captive-portal").play();
      }
    }
  },
}
