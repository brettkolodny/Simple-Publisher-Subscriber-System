const express = require("express");
const bodyParser = require("body-parser");
const prompt = require("prompt");
const request = require("request");

var url;
var serverURL;

const app = express();
var PORT = 8080;
//const HOST = "0.0.0.0";

app.use(express.static("public"));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/api/receive/news", (req, res) => {
  console.log(`\n${req.body.notification}\n`);
  res.send(req.body.notification);
});

function subscribe(pubID) {
  const options = {
    method: "post",
    body: { pubID: pubID, subURL: url },
    json: true,
    url: `http://${serverURL}/api/subscribe/`
  };

  request(options, (err, res, body) => {
    if (err) {
      console.log(err);
    }
  });
}

function startPrompt() {
  prompt.message = ">";
  prompt.before = value => {
    return value.toLowerCase();
  };

  prompt.start();
  prompt.get("command", async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const parsedResult = result.command.split(" ");
      if (parsedResult[0] === "exit") {
        process.exit();
      } else if (parsedResult.length != 2) {
        console.log("Please input a valid command");
      } else {
        if (parsedResult[0] === "serverurl") {
          serverURL = parsedResult[1];
          console.log(`Server URL is now ${serverURL}`);
        } else if (parsedResult[0] === "subscribe") {
          if (serverURL !== "undefined" && url !== "undefined") {
            await subscribe(parsedResult[1]);
          } else {
            console.log(
              "Please set the Server's URL and Subscriber URL using the serverURL and URL command"
            );
          }
        } else if (parsedResult[0] === "url") {
          url = `http://${parsedResult[1]}/api/receive/news/`;
          console.log(`URL is now ${url}`);
        } else {
          console.log("Please input a valid command");
        }
      }
    }
    startPrompt();
  });
}

async function start() {
  prompt.message = ">";
  prompt.before = value => {
    return value.toLowerCase();
  };

  prompt.start();

  await prompt.get(["ServerURL", "PORT", "SubURL"], async (err, result) => {
    PORT = parseInt(result.PORT);
    url = `${result.SubURL}/api/receive/news`;
    console.log(url);
    serverURL = result.ServerURL;
    console.log(serverURL);
    await app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
    });
    startPrompt();
  });
}

start();
