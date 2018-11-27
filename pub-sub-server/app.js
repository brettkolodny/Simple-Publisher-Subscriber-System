const express = require("express");
const Map = require("collections/map");
const List = require("collections/list");
const bodyParser = require("body-parser");
var request = require("request");
var path = require("path");

const app = express();
const PORT = 8080;
//const HOST = "0.0.0.0";

var publisherInfo = new Map();

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Server");
});

/*
~Attempts to subscribe to a publisher~
Checks if the publisher id (pubID) and subscriber url (subURL)
  exist and if they do not sends an error code of 400.
Checks if the publisher exists and if it does not then
  returns an error code of 400.
Otherwise checks if the subscriber is already subscribed,
  if it is not then adds the subscriber to the publisher's
  subscriber list in pub_sub_map then sends success code of 200
*/
app.post("/api/subscribe/", (req, res) => {
  const pubID = req.body.pubID;
  const subURL = req.body.subURL;

  if (pubID === undefined || subURL === undefined) {
    res.sendStatus(400);
    return;
  }

  if (!publisherInfo.has(pubID)) {
    res.sendStatus(400);
    return;
  }

  if (!publisherInfo.get(pubID).subscribers.has(subURL)) {
    publisherInfo.get(pubID).subscribers.push(subURL);
  }

  res.sendStatus(200);
  console.log(`Subscriber just subscribed to ${pubID}`);
});

/*
~Attenpts to publish a message~
Check if req.body contains a publisher id (pubID) and
  a message (message). If it does not then then a 400 response
  is sent.
If the publisher has not published anything before
  then they are added to the Map containing publishers and
  their associated info (publisherInfo).
Otherwise their message is pushed onto the collection of their
  messages (if their password was correct).
Then all subscribers are notified.
*/
app.post("/api/publish", (req, res) => {
  const pubID = req.body.pubID;
  const pubPassword = req.body.password;
  const message = req.body.message;

  if (
    pubID === undefined ||
    message === undefined ||
    pubPassword === undefined
  ) {
    res.sendStatus(400);
    return;
  } else {
    if (!publisherInfo.has(pubID)) {
      res.sendStatus(400);
      return;
    } else {
      if (publisherInfo.get(pubID).password != pubPassword) {
        res.sendStatus(400);
        return;
      }
    }
  }

  publisherInfo.get(pubID).subscribers.forEach(value => {
    const options = {
      method: "post",
      body: { notification: message },
      json: true,
      url: `${value}`
    };

    request(options, (err, res, body) => {
      if (err) {
        console.log(`Issue publishing news to ${value}`);
      }
    });
  });

  res.sendStatus(200);
  console.log(`Published from ${pubID}: ${message}`);
  return;
});

/*
~Register a new publisher~
Adds the publisher to publisherInfo if it does not
  already exist there.
*/
app.post("/api/publish/register", (req, res) => {
  const pubID = req.body.pubID;
  const pubPassword = req.body.password;

  if (
    pubID === undefined ||
    pubPassword === undefined ||
    publisherInfo.has(pubID)
  ) {
    res.sendStatus(400);
    return;
  }

  publisherInfo.set(pubID, {
    password: pubPassword,
    subscribers: new List(),
    messages: new List()
  });
  res.sendStatus(200);
  console.log(`The following publisher just registered: ${pubID}`);
  return;
});

/*
~Get latest news from a publisher~
If the publisher exists and has a message returns the most
  recent message.
Otherwise sends a 404 error code.
*/
app.get("/api/publish/pubID:/news/latest", (req, res) => {
  const pubID = req.params.pubID;
  if (
    publisherInfo.has(pubID) &&
    publisherInfo.get(pubID).messages.length > 0
  ) {
    res.send(publisherInfo.get(pubID).messages.peek());
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
