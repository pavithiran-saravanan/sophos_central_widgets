/*
Copyright (c) 2017, ZOHO CORPORATION
License: MIT
*/
const portfinder = require("portfinder");
var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var morgan = require("morgan");
var serveIndex = require("serve-index");
var https = require("https");
var chalk = require("chalk");
const {
  runHealthCheckQuery,
  getEndpoints,
  getAlerts,
  getEvents,
  getDetections,
  getUsers,
  getApplications,
  blockItem,
  unblockItem
} = require("./js/sophosAPI");

process.env.PWD = process.env.PWD || process.cwd();

var expressApp = express();

var portPromise = portfinder.getPortPromise({
  startPort: 5000,
  port: 5000,
  stopPort: 5009,
});

portPromise.then((port) => {
  expressApp.set("port", port);
  expressApp.use(morgan("dev"));
  expressApp.use(bodyParser.json());
  expressApp.use(bodyParser.urlencoded({ extended: false }));
  expressApp.use(errorHandler());

  expressApp.use("/", function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let connectSrc = "";
    let manifest = fs
      .readFileSync(path.join(__dirname, "..", "plugin-manifest.json"))
      .toString();
    manifest = JSON.parse(manifest);
    if (
      manifest != null &&
      manifest.cspDomains != null &&
      manifest.cspDomains["connect-src"] != null
    ) {
      let connectDomains = manifest.cspDomains["connect-src"];
      if (validateDomains(connectDomains)) {
        console.log(
          chalk.bold.red(
            connectDomains + " - found to be invalid URL(s) in connect-src"
          )
        );
        next();
        return false;
      }
      connectSrc = connectDomains.join(" ");
    }
    //res.setHeader('Content-Security-Policy', 'connect-src https://*.zohostatic.com https://*.sigmausercontent.com '+ connectSrc);
    next();
  });

  expressApp.get("/plugin-manifest.json", function (req, res) {
    res.sendfile("plugin-manifest.json");
  });

  expressApp.use("/app", express.static("app"));
  expressApp.use("/app", serveIndex("app"));

  expressApp.get("/", function (req, res) {
    res.redirect("/app");
  });

  expressApp.get("/scores", async (req, res) => {
    const data = await runHealthCheckQuery();
    res.send(data);
  });

  expressApp.get("/endpoints", async (req, res) => {
    const data = await getEndpoints();
    res.send(data);
  });

  expressApp.get("/alerts", async (req, res) => {
    const data = await getAlerts();
    res.send(data);
  });

  expressApp.get("/events", async (req, res) => {
    const data = await getEvents();
    res.send(data);
  });

  expressApp.get("/detections", async (req, res) => {
    const data = await getDetections();
    res.send(data);
  });

  expressApp.get("/users", async (req, res) => {
    const data = await getUsers();
    res.send(data);
  });

  expressApp.get("/applications", async (req, res) => {
    const data = await getApplications();
    res.send(data);
  });

  expressApp.get("/blockItem/:fileName/:path/:sha256", async (req, res) => {
    res.send(await blockItem(req.params));
  });

  expressApp.get("/unblockItem/:blockedItemId", async (req, res) => {
  });

  var options = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
  };

  https
    .createServer(options, expressApp)
    .listen(port, function () {
      console.log(chalk.green("Zet running at ht" + "tps://127.0.0.1:" + port));
      console.log(
        chalk.bold.cyan(
          "Note: Please enable the host (https://127.0.0.1:" +
            port +
            ") in a new tab and authorize the connection by clicking Advanced->Proceed to 127.0.0.1 (unsafe)."
        )
      );
    })
    .on("error", function (err) {
      if (err.code === "EADDRINUSE") {
        console.log(chalk.bold.red(port + " port is already in use"));
      }
    });

  function validateDomains(domainsList) {
    var invalidURLs = domainsList.filter(function (domain) {
      return !isValidURL(domain);
    });

    return invalidURLs && invalidURLs.length > 0;
  }

  function isValidURL(url) {
    try {
      var parsedURL = new URL(url);
      if (
        parsedURL.protocol !== "http" + ":" &&
        parsedURL.protocol !== "https" + ":" &&
        parsedURL.protocol !== "wss" + ":"
      ) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  }
});
