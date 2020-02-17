import {
  pauseSound,
  loopSound,
  playSound,
  getSound
} from "../modules/sound.js";

export const settings = {
  "Mute music": {
    value: false,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
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
  "Mute sound effects": {
    value: false,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
    }
  },
  "Camera following strategy": {
    value: true,
    getDisplayVal() {
      return this.value ? "tight" : "loose";
    },
    onClick() {
      return (this.value = !this.value);
    }
  },
  "Glow effect": {
    value: true,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
    }
  },
  "Splatter effects": {
    value: true,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
    }
  },
};
