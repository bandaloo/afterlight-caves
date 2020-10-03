(() => {
  "use strict";
  let ElectronCookies = require("@exponent/electron-cookies");
  ElectronCookies.enable({ origin: "app://-" });
})();
