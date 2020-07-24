"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const ratesRouter = require("./routes/ratesRouter");

const app = express();

app.set("host", process.env.HOST);
app.set("port", process.env.PORT);
app.set("views", "./views");
app.set("view engine", "hbs");

app.use(morgan("common"));
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

app.use("/", function(req, res) {
  res.render("index", { MAPS_KEY: process.env.MAPS_KEY_CLIENT });
});

app.listen(app.get("port"), app.get("host"), () => {
  console.log(`App is listening on port ${app.get("port")} of ${app.get("host")}!`);
});
