"use strict";

const express = require('express');
const taxjar = require('taxjar');

const router = express.Router();

router.get('/', (req, res) => {
  const addressObject = {
    street: req.query.street,
    city: req.query.city,
    state: req.query.state,
    zip: req.query.zip,
    country: req.query.country 
  }

  const searchId = req.query.searchId;
  
  // temporary code - Tue 7/14/20
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

  res.json(data.rate);

  // temporary code - Mon 7/13/20
  /*
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

  res.type("text");
  res.render("search-result", {
    addressObject,
    searchId,
    rateObject: data,
  });
  */

  // original code
  /*
  const client = new taxjar({
    apiKey: process.env.TAXJAR_API_KEY
  });

  client.ratesForLocation(addressObject.zip, {
    street: addressObject.street, 
    city: addressObject.city,
    state: addressObject.state,
    country: addressObject.country        
  }).then(data => {
    res.type('text');
    res.render('search-result', {
      addressObject: addressObject,
      searchId: searchId,
      rateObject: data
    });
    }).catch(err => {
      res.type('text');
      res.render('rates-not-found', {
        error: err
      });
    });
  */
});

module.exports = router;
