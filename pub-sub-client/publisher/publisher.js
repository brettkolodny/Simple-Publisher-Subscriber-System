const express = require("express");
const prompt = require("prompt");
const request = require("request");

const app = express();
var PORT;

var id;
var password;
var serverURL;

app.use(express.static("public"));

function register() {
  const options = {
    method: "post",
    body: { pubID: id, password: password },
    json: true,
    url: `http://${serverURL}/api/publish/register`
  };

  request(options, (err, res, body) => {
    if (err || res == 400) {
      console.log(
        "There was an error while trying to register with the server"
      );
    }
  });
}

function publish(message) {
  const options = {
    method: "post",
    body: { pubID: id, password: password, message: message },
    json: true,
    url: `http://${serverURL}/api/publish/`
  };

  request(options, (err, res, body) => {
    if (err || res == 400) {
      console.log("There was an error publushing the message");
    } else {
      console.log(`Published message: ${message}`);
    }
  });
}

function startPrompt() {
  prompt.message = ">";
  prompt.before = value => {
    return value.toLowerCase();
  };

  prompt.start();
  prompt.get("command", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const parsedResult = result.command.split(" ");
      if (parsedResult[0] === "exit") {
        process.exit();
      } else if (parsedResult[0] === "register") {
        if (
          id === undefined ||
          password === undefined ||
          serverURL === undefined
        ) {
          console.log(
            "Please set up the Publisher ID, password, and Server URL before registering or publishing a message"
          );
        } else {
          register();
        }
      } else if (parsedResult.length > 1) {
        if (parsedResult[0] === "password") {
          if (password !== undefined) {
            console.log("You have already set the password");
          } else {
            password = parsedResult[1];
          }
        } else if (parsedResult[0] === "id") {
          if (id !== undefined) {
            console.log("You have already set the publisher ID");
          } else {
            id = parsedResult[1];
          }
        } else if (parsedResult[0] === "serverurl") {
          if (serverURL !== undefined) {
            console.log("You have already set the Server URL");
          } else {
            serverURL = parsedResult[1];
            console.log(`This is the server URL: ${serverURL}`);
          }
        } else if (parsedResult[0] === "publish") {
          if (
            id === undefined ||
            password === undefined ||
            serverURL === undefined
          ) {
            console.log(
              "Please set up the Publisher ID, password, and Server URL before registering or publishing a message"
            );
          } else {
            let message = "";
            for (i = 1; i < parsedResult.length; ++i) {
              message += `${parsedResult[i]} `;
            }
            publish(message);
          }
        } else {
          console.log("Invalid command");
        }
      } else {
        console.log("Invalid command");
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

  await prompt.get(
    ["ServerURL", "PORT", "ID", "Password"],
    async (err, result) => {
      PORT = parseInt(result.PORT);
      url = `http://${result.port}/api/receive/news/`;
      serverURL = result.ServerURL;
      id = result.ID;
      password = result.Password;
      await app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
      });
      startPrompt();
    }
  );
}

start();
