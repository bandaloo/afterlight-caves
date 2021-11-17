const npmRun = require("npm-run");
const fs = require("fs").promises;
const fse = require("fs-extra");
const path = require("path");

/**
 * This script builds a production version of the game, compatible with
 * older and more obscure browsers
 */

/** @type{string} set these values to use a custom score server, e.g. "https" */
const SCORE_SERVER_SCHEME = process.env.SCORE_SERVER_SCHEME || undefined;
/** @type{string} set these values to use a custom score server, e.g. "example.com" */
const SCORE_SERVER_DOMAIN = process.env.SCORE_SERVER_DOMAIN || undefined;

/**
 * wraps npmRun.run() in a function that has no options and returns a promise to
 * avoid callback hell
 * @param{string} script the npm script to run
 * @return{Promise<void>}
 */
const runPromise = script => {
  return new Promise((resolve, reject) => {
    npmRun.exec(script, {}, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error encountered while running command '${script}':`);
        console.error(stderr);
        process.exit(1);
      }
      resolve(stdout);
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
  return fs
    .readFile(path, "utf8")
    .then(contents => fs.writeFile(path, contents.replace(find, replace)));
};


/**
 * builds a production version of the game, compatible with older and more
 * obscure browsers
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const buildProd = (
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Building production version with Babel...");
  return new Promise(resolve => {
    runPromise("babel static --out-dir build")
      .then(() => runPromise("browserify -vd build/main.js -o dist/bundle.js"))
      .then(() =>
        fse.copy(
          path.join("static", "index.html"),
          path.join("dist", "index.html")
        )
      )
      .then(() =>
        fse.copy(
          path.join("static", "style.css"),
          path.join("dist", "style.css")
        )
      )
      .then(() =>
        fse.copy(
          path.join("static", "license.txt"),
          path.join("dist", "license.txt")
        )
      )
      .then(() =>
        fse.copy(
          path.join("static", "favicon.ico"),
          path.join("dist", "favicon.ico")
        )
      )
      .then(() =>
        fse.copy(
          path.join("static", "anonymous-pro-b.ttf"),
          path.join("dist", "anonymous-pro-b.ttf")
        )
      )
      .then(() =>
        replaceInFile(
          path.join("dist", "index.html"),
          /<script type="module" src="main.js"/,
          '<script src="bundle.js"'
        )
      )
      .then(() => {
        if (
          scoreServerScheme !== undefined &&
          scoreServerDomain !== undefined
        ) {
          return replaceInFile(
            path.join("dist", "bundle.js"),
            /var GAME_URL = ".*";/,
            `var GAME_URL = "${scoreServerScheme}://${scoreServerDomain}";`
          );
        } else {
          return Promise.resolve();
        }
      })
      .then(() => replaceInFile(path.join("dist", "bundle.js"), /\.\./g, "."))
      .then(() =>
        fse.copy(path.join("static", "sounds"), path.join("dist", "sounds"))
      )
      .then(() =>
        fse.copy(path.join("static", "images"), path.join("dist", "images"))
      )
      .then(() => {
        console.log("Production version created at dist");
        resolve();
      })
      .catch(reason => {
        console.error("Error encountered in buildProd:");
        console.error(reason);
      });
  });
};

buildProd(SCORE_SERVER_SCHEME, SCORE_SERVER_DOMAIN).then();

