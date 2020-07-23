"use strict";

require("dotenv").config();
const express = require("express");
const { getRates } = require("../lib/ratesApi");
const { getLocation } = require("../lib/locationApi");

const router = express.Router();

router.get('/', (req, res) => {
  const inputs = {
    street: req.query.street,
    city: req.query.city,
    state: req.query.state,
    zip: req.query.zip,
    country: req.query.country, 
    searchId: req.query.searchId,
  };
  
  Promise.allSettled([getRates(inputs), getLocation(inputs)])
    .then(results => {
      if (results[0].status === "fulfilled") {
        res.render("rates-found", {
          rates: results[0].value,
          geo: results[1].value,
          inputs
        });
      } else {
        res.render("rates-not-found", {
          inputs
        });
      }
    });

/*
  // temporary code - Tue 7/20/20
  let data = {
    rate: {
      zip: "54155",
      country: "US",
      country_rate: "0.0",
      state: "WI",
      state_rate: 0.05,
      county: "BROWN",
      county_rate: 0.005,
      city: "HOBART",
      city_rate: 0.0,
      combined_district_rate: 0.001,
      combined_rate: 0.056,
      freight_taxable: true,
    },
  };
  
  res.render("rates-found", { 
    rates: data.rate, 
    inputs, 
  });
*/
/*
  res.render("rates-not-found", {
    inputs
  });
*/

});

module.exports = router;
