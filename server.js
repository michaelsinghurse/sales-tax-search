"use strict";

require("dotenv").config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const ratesRouter = require('./routes/ratesRouter');

const app = express();

app.set("port", process.env.PORT);
app.set("views", "./views");
app.set("view engine", "hbs");

app.use(morgan("common"));
app.use("/", express.static(path.join(__dirname, "public")));

// allow client to access node_modules folder
app.use("/scripts", express.static(path.join(__dirname, "node_modules")));

app.use("/api/rates", ratesRouter);

app.get("/api/mapsKey", function(req, res) {
  res.send(process.env.MAPS_KEY);
});

app.get("/search", function(req, res) {
  res.render("search");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/notfound", function(req, res) {
  res.render("page-not-found");
});

app.use("/", function(req, res) {
  //res.sendFile(path.join(__dirname, "public", "index.html"));
  res.render("index", { MAPS_KEY: process.env.MAPS_KEY });
});

app.use(function(req, res) {
  res.status(404).send("Page not found!");
});

app.listen(app.get("port"), () => {
  console.log(`app is listening on part ${app.get("port")}...`);
});
