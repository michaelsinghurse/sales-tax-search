"use strict";

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const ratesRouter = require('./routes/ratesRouter');

const app = express();

app.set("port", process.env.PORT || 8080);

app.use(morgan("common"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/rates", ratesRouter);

app.use(function(req, res) {
  res.status(404).send("Page not found!");
});

app.listen(app.get("port"), () => {
  console.log(`app is listening on part ${app.get("port")}...`);
});
