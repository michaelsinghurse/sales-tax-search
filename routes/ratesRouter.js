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
});

module.exports = router;
