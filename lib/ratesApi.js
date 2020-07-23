"use strict";

require("dotenv").config();
const Avatax = require("avatax");

const config = {
  appName: 'your-app',
  appVersion: '1.0',
  environment: 'production',
  machineName: 'your-machine-name'
};

const creds = {
  accountId: process.env.AVALARA_ID,
  licenseKey: process.env.AVALARA_KEY,
};

function findRateForType(object, type) {
  /* 
   * {
   *  totalRate: 0.1,
   *  rates: [
   *    { rate: 0.0625, type: "State" },
   *    { rate: 0.01, type: "City" },
   *    { rate: 0.005, type: "County" },
   *    { rate: 0.001, type: "Special" }
   *   ]
   *  }
  */

  let rateForType;

  if (type === "Combined") {
    rateForType = object.totalRate;
  } else {
    rateForType = object.rates
      .filter(obj => obj.type === type)
      .reduce((total, obj) => {
        total += obj.rate;
        return total;
      }, 0);
  }

  return rateForType;
}

function formatRatesObject(object) {
  let rates = {};
  
  rates.combined_rate =          findRateForType(object, "Combined");
  rates.state_rate =             findRateForType(object, "State");
  rates.county_rate =            findRateForType(object, "County");
  rates.city_rate =              findRateForType(object, "City");
  rates.combined_district_rate = findRateForType(object, "Special"); 

  return rates;
}

function getRates(input) {
  return new Promise((resolve, reject) => {
    var client = new Avatax(config).withSecurity(creds);

    const taxDocument = {
      line1: input.street,
      city: input.city,
      region: input.state,
      postalCode: input.zip,
      country: input.country,
    };

    client.taxRatesByAddress(taxDocument)
      .then(result => {
        resolve(formatRatesObject(result));
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = { getRates };
