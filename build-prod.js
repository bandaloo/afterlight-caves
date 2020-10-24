/**
 * This script builds a production version of the game, compatible with
 * older and more obscure browsers
 */

const npm = require("npm");
const fs = require("fs").promises;
const fse = require("fs-extra");
const path = require("path");

/** @type{string} set these values to use a custom score server */
const SCORE_SERVER_SCHEME = undefined; // e.g. "https";
/** @type{string} set these values to use a custom score server */
const SCORE_SERVER_DOMAIN = undefined; // e.g. "example.com";

/**
 * wraps npm.run() in a function that returns a promise to avoid callback hell
 * @param{string} script the npm script to run
 * @return{Promise<void>}
 */
const runPromise = (script) => {
  return new Promise((resolve) => {
    npm.run(script, () => {
      resolve();
    });
  });
};

/**
 * find and replace text within a file
 * @param{string} path file path
 * @param{RegExp} find regular expression to find
 * @param{string} replace string to replace
 * @return{Promise<void>}
 */
const replaceInFile = (path, find, replace) => {
  return fs.readFile(path, "utf8")
    .then((contents) => fs.writeFile(path, contents.replace(find, replace)));
};

npm.load(() => {
  runPromise("compile-compat")
    .then(() => runPromise("browserify-compat"))
    .then(() => fse.copy(path.join("static", "index.html"), path.join("dist", "index.html")))
    .then(() => fse.copy(path.join("static", "style.css"), path.join("dist", "style.css")))
    .then(() => fse.copy(path.join("static", "license.txt"), path.join("dist", "license.txt")))
    .then(() => fse.copy(path.join("static", "favicon.ico"), path.join("dist", "favicon.ico")))
    .then(() => fse.copy(path.join("static", "anonymous-pro-b.ttf"), path.join("dist", "anonymous-pro-b.ttf")))
    .then(() => replaceInFile(path.join("dist", "index.html"), /<script type="module" src="main.js"/, "<script src=\"bundle.js\""))
    .then(() => {
      if (SCORE_SERVER_SCHEME !== undefined && SCORE_SERVER_DOMAIN !== undefined) {
        return replaceInFile(path.join("dist", "bundle.js"), /var GAME_URL = ".*";/, `var GAME_URL = "${SCORE_SERVER_SCHEME}://${SCORE_SERVER_DOMAIN}";`);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => replaceInFile(path.join("dist", "bundle.js"), /\.\./g, "."))
    .then(() => fse.copy(path.join("static", "sounds"), path.join("dist", "sounds")))
    .then(() => fse.copy(path.join("static", "images"), path.join("dist", "images")))
    .catch((reason) => {
      console.error("Error encountered:");
      console.error(reason);
    });
});
