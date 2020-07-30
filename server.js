"use strict";

const config = require("./lib/config.js");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const ratesRouter = require("./routes/ratesRouter.js");
const winston = require("./lib/winston.js");

const app = express();

app.set("host", config.HOST);
app.set("port", config.PORT);
app.set("views", "./views");
app.set("view engine", "hbs");

app.use(morgan("short", { stream: winston.stream }));
app.use("/", express.static(path.join(__dirname, "public")));

// allow client to access node_modules folder
app.use("/scripts", express.static(path.join(__dirname, "node_modules")));

app.use("/api/rates", ratesRouter);

app.get("/views/:view", function(req, res) {
  const view = req.params.view;

  switch (view) {
    case "search":
      res.render("search");
      break;
    case "about":
      res.render("about");
      break;
    case "login":
      res.render("login");
      break;
    case "404":
      res.render("page-not-found");
      break;
  }
});

app.use("/", function(_req, res) {
  res.render("index", { MAPS_KEY: config.MAPS_KEY_CLIENT });
});

// error handler
app.use(function(err, req, res, next) {
  winston.error(`${err.status || 500} - ${err.stack} - ${req.originalUrl} - ` +
    `${req.method} - ${req.ip}`);

  res.status(500).end();
});

app.listen(app.get("port"), app.get("host"), () => {
  console.log(`App is listening on port ${app.get("port")} of ${app.get("host")}!`);
});

module.exports = app;


