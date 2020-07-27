"use strict";

const appRoot = require("app-root-path");
const Avatax = require("avatax");
const config = require(`${appRoot}/lib/config.js`);

const clientConfig = {
  appName: "sales-tax-rates",
  appVersion: "1.0",
  environment: "production",
  machineName: "server"
};

const clientAuth = {
  accountId: config.AVALARA_ID,
  licenseKey: config.AVALARA_KEY,
};

function findRateForType(object, type) {
  let rateForType;

  if (type === "Total") {
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
  const rates = {};

  rates.totalRate         = findRateForType(object, "Total");
  rates.stateRate         = findRateForType(object, "State");
  rates.countyRate        = findRateForType(object, "County");
  rates.cityRate          = findRateForType(object, "City");
  rates.totalDistrictRate = findRateForType(object, "Special");

  return rates;
}

function getRates(input) {
  return new Promise((resolve, reject) => {
    const client = new Avatax(clientConfig).withSecurity(clientAuth);

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


