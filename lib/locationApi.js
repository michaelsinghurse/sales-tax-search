"use strict";

require("dotenv").config();
const { Client } = require("@googlemaps/google-maps-services-js");

function extractLocationInfo(result) {
  let output = {};
  
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
  
  output.latLng = result.geometry.location;

  return output;
}

function getLocation(inputs) {
  return new Promise((resolve, reject) => {
    let request = {
      params: {
        address: inputs.street + ', ' + inputs.city + ', ' + inputs.state,
        componentRestrictions: {
          country: inputs.country,
          postalCode: inputs.zip,
        },
        key: process.env.MAPS_KEY,
      },
      timeout: 3000,
    };

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
