const express = require("express");
const fs = require("fs");
const fsp = require("fs").promises;
const app = express();
const md5 = require("md5");
var path = require("path");

async function hashFiles(root) {
  return new Promise((resolve, reject) => {
    fsp.readdir(root).then(files => {
      let totalHash = [];
      let filesScanned = 0;
      files.forEach(function(file, index) {
        var fullPath = path.join(root, file);
        fsp
          .stat(fullPath)
          .then(stat => {
            if (stat.isDirectory()) {
              return hashFiles(fullPath);
            } else if (stat.isFile() && path.extname(file) == ".js") {
              return fsp.readFile(fullPath);
            } else {
              return;
            }
          })
          .catch(error => {
            console.error("Error stating file " + file + ".", error);
          })
          .then(promiseVal => {
            if (promiseVal === undefined) {
              //pass
            } else if (promiseVal instanceof Buffer) {
              const hash = md5(promiseVal);
              totalHash.push([file, hash]);
            } else if (promiseVal instanceof Array) {
              promiseVal.forEach(buf => {
                totalHash.push(buf);
              });
            }
            filesScanned++;
            if (filesScanned == files.length) {
              resolve(totalHash);
            }
          })
          .catch(error => {
            console.error("Could not read file " + file + " ", error);
          });
      });
    });
  }).catch(err => {
    //console.error("Could not list the directory.", err);
    console.error("Could not list the directory.", err);
  });
}

async function getVerification() {
  let filehashes = await hashFiles("./static");
  filehashes.sort();
  console.log("filehashes");
  console.log(filehashes);
  let totalString = "";
  filehashes.forEach(hash => {
    totalString += hash[1];
  });
  const finalhash = md5(totalString);
  console.log("finalhash");
  console.log(finalhash);
  return finalhash;
}

/**
 * @param {express.Response} res
 * @param {string} message
 * @param {number} status
 */
const sendRes = (res, status, message) => {
  res
    .status(status)
    .contentType("application/json")
    .send(
      JSON.stringify({
        status: status,
        message: message
      })
    );
};

// static directory
// requests that don't match any of the other endpoints will be served from here
app.use(express.static(__dirname + "/static"));

// use express built-in JSON parser
app.use(express.json());

// get port from environment variable, or use 3000 as the default
const port = process.env.NODE_PORT || 4000;

const verification = getVerification();

/**
 * gets the current list of scores from the server and returns it like this:
 * {
 *     scores: [
 *         { username: "jojonium", score: 9999 },
 *         ...
 *     ]
 * }
 */
app.get("/scores", (req, res) => {
  fs.readFile("./scores.json", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error(err);
      sendRes(res, 500, "Couldn't read scores file");
      return;
    }
    /** @type {{ scores: { username: string, score: number }[]}} */
    let currentScores = undefined;
    try {
      currentScores = JSON.parse(data.toString("utf-8"));
      if (!(currentScores.scores instanceof Array)) {
        throw new Error();
      }
      // send scores
      sendRes(res, 200, JSON.stringify({ scores: currentScores.scores }));
      return;
    } catch (e) {
      console.error(e);
      // no scores, send empty array
      sendRes(res, 200, JSON.stringify({ scores: [] }));
      return;
    }
  });
});

/**
 * accepts new scores
 * Request body should in JSON format and include a username and score, e.g.
 * {
 *    username: "jojonium",
 *    score: 99999
 * }
 */
app.post("/score", (req, res) => {
  const body = req.body;
  if (body.username === undefined) {
    sendRes(res, 400, "Missing username field");
    return;
  } else if (body.score === undefined) {
    sendRes(res, 400, "Missing score field");
    return;
  } else if (body.verification === undefined) {
    sendRes(res, 400, "Missing verification field");
  } else {
    if (body.verification != verification) {
      sendRes(
        res,
        401,
        "Verification Failed. Verify your version of the game."
      );
    }
    fs.readFile("./scores.json", (err, data) => {
      // ignore 'no such file' errors, we'll create a new one
      if (err && err.code !== "ENOENT") {
        sendRes(res, 500, "Failed to read scores file");
        return;
      } else {
        /** @type {{ scores: { username: string, score: number }[]}} */
        let currentScores = undefined;
        try {
          currentScores = JSON.parse(data.toString("utf-8"));
          if (!(currentScores.scores instanceof Array)) {
            throw new Error();
          }
        } catch (e) {
          console.error(e);
          // make new file
          currentScores = { scores: [] };
        }
        currentScores.scores.push({
          username: body.username,
          score: body.score
        });
        fs.writeFile(
          "./scores.json",
          JSON.stringify(currentScores),
          { encoding: "utf8", mode: 0o664 },
          () => {
            res
              .status(200)
              .contentType("application/json")
              .send(
                JSON.stringify({ status: 200, message: "Score submitted" })
              );
          }
        );
      }
    });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
