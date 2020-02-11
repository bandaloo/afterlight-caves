const express = require("express");
const fs = require("fs");
const app = express();

/**
 * @param {Response} res
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

// get port from environment variable, or use 3000 as the default
const port = process.env.NODE_PORT || 4000;

// accept new scores
app.post("score", (req, res) => {
  let body;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    // send error
    sendRes(res, 400, "Failed to read request");
    return;
  }
  if (body.username === undefined) {
    sendRes(res, 400, "Missing username field");
    return;
  } else if (body.score === undefined) {
    sendRes(res, 400, "Missing score field");
    return;
  } else {
    fs.readFile("./scores.json", (err, data) => {
      if (err) {
        sendRes(res, 500, "Failed to read scores file");
        return;
      } else {
        let currentScores = undefined;
        try {
          currentScores = JSON.parse(data.toString("utf-8"));
          if (!currentScores.scores.push) {
            throw new Error();
          }
        } catch (e) {
          // make new file
          console.log("Invalid scores file");
          currentScores = { scores: [] };
        }
        currentScores.scores.push({
          username: body.username,
          score: body.score
        });
        fs.writeFile(
          "./scores.json",
          currentScores,
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
  console.log("listening on port 4000...");
});

