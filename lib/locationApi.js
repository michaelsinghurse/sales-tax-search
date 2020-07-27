"use strict";

const appRoot = require("app-root-path");
const config = require(`${appRoot}/lib/config.js`);
const { Client } = require("@googlemaps/google-maps-services-js");

function extractLocationInfo(result) {
  const output = {};

  result.address_components.forEach(component => {
    let types = component.types;

    if (types.includes("locality")) {
      output.city = component.long_name;
    } else if (types.includes("administrative_area_level_2")) {
      output.county = component.long_name.replace(" County", "");
    } else if (types.includes("administrative_area_level_1")) {
      output.state = component.short_name;
    }
  });

  output.latLng = JSON.stringify(result.geometry.location);

  return output;
}

function makeRequestObject(inputs) {
  return {
    params: {
      address: inputs.street + ", " + inputs.city + ", " + inputs.state,
      componentRestrictions: {
        country: inputs.country,
        postalCode: inputs.zip,
      },
      key: config.MAPS_KEY_SERVER,
    },
    timeout: 3000,
  };
}

function getLocation(inputs) {
  return new Promise((resolve, reject) => {
    const request = makeRequestObject(inputs);

    const geocoder = new Client({});
    geocoder.geocode(request)
      .then(response => {
        if (response.data.status === "OK") {
          resolve(extractLocationInfo(response.data.results[0]));
        } else {
          reject(response.data.status);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = { getLocation };


