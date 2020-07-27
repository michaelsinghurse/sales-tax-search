"use strict";

const appRoot = require("app-root-path");
const express = require("express");
const { getRates } = require(`${appRoot}/lib/ratesApi`);
const { getLocation } = require(`${appRoot}/lib/locationApi`);

const router = express.Router();

const extractInputs = req => ({
  street: req.query.street,
  city: req.query.city,
  state: req.query.state,
  zip: req.query.zip,
  country: req.query.country,
  searchId: req.query.searchId,
});

router.get("/", (req, res) => {
  const inputs = extractInputs(req);

  Promise.allSettled([getRates(inputs), getLocation(inputs)])
    .then(results => {
      if (results.every(result => result.status === "fulfilled")) {
        res.render("rates-found", {
          rates: results[0].value,
          location: results[1].value,
          inputs,
        });
      } else {
        res.render("rates-not-found", {
          inputs,
        });
      }
    });
});

module.exports = router;


