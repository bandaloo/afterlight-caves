const npmRun = require("npm-run");
const fs = require("fs").promises;
const fse = require("fs-extra");
const path = require("path");
const packager = require("electron-packager");
const installerRedHat = require("electron-installer-redhat");

/**
 * wraps npmRun.run() in a function that has no options and returns a promise to
 * avoid callback hell
 * @param{string} script the npm script to run
 * @return{Promise<void>}
 */
const runPromise = script => {
  return new Promise(resolve => {
    npmRun.exec(script, {}, () => {
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

/**
 * builds a desktop version of the game, but does not package it as a standalone
 * application
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const buildElectron = (
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Building Electron version...");
  return new Promise(resolve => {
    buildProd(scoreServerScheme, scoreServerDomain)
      .then(() =>
        fse.copy(
          path.join("electron-files", "index.html"),
          path.join("dist", "index.html")
        )
      )
      .then(() =>
        fse.copy(
          path.join("electron-files", "style.css"),
          path.join("dist", "style.css")
        )
      )
      .then(() =>
        fse.copy(
          path.join("electron-files", "enable-cookies.js"),
          path.join("dist", "enable-cookies.js")
        )
      )
      .then(() => {
        console.log("Electron version created at dist");
        resolve();
      })
      .catch(reason => {
        console.error("Error encountered in buildElectron:");
        console.error(reason);
      });
  });
};

/**
 * builds a desktop version of the game, and packages it as an executable
 * for various platforms
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const packageDesktop = (
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Packaging as Electron app bundles...");
  return new Promise(resolve => {
    buildElectron(scoreServerScheme, scoreServerDomain)
      .then(() =>
        packager({
          dir: ".",
          name: "afterlight-caves",
          out: "release-builds",
          overwrite: true,
          platform: "all",
          arch: "x64",
          icon: path.join("static", "images", "logo"),
          prune: true
        })
      )
      .then(appPaths => {
        console.log(`Electron app bundles created at:\n${appPaths.join("\n")}`);
        resolve();
      })
      .catch(reason => {
        console.error("Error encountered in buildElectron:");
        console.error(reason);
      });
  });
};

/**
 * builds a desktop version of the game, and packages it as an RPM file
 * @param{any} options options for electron-installer-redhat
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const packageRpm = (
  options,
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Packaging as RPM file...");
  return new Promise(resolve => {
    packageDesktop(scoreServerScheme, scoreServerDomain)
      .then(() => installerRedHat(options))
      .then(() => {
        console.error("RPM file created at release-builds");
        resolve()
      })
      .catch(reason => {
        console.error("Error encountered in packageRpm");
        console.error(reason);
      });
  });
};

/**
 * removes a list of directories
 * @param{string[]} toRemove directories to remove
 */
const cleanDirs = toRemove => {
  console.log(
    "Removing the following directories: " +
      toRemove.reduce((prev, cur) => `${prev}, ${cur}`)
  );

  // this fold removes each directory in a row
  toRemove.reduce((prev, cur) => {
    return prev.then(() => fs.rmdir(cur, { recursive: true }));
  }, Promise.resolve());
};

module.exports = {
  buildProd,
  buildElectron,
  cleanDirs,
  packageDesktop,
  packageRpm
};
