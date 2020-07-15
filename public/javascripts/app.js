"use strict";

let App = {
  resultsTemplate: null,

  bindListeners() {
    $(".js-search-form").on("submit", this.handleFormSubmit.bind(this));
  },
  
  compileHtmlTemplates() {
    this.resultsTemplate = Handlebars.compile($("#searchResult").html());
  },

  getMapGeocode(inputs) {
    return new Promise((resolve, reject) => {
      let request = {
        address: inputs.street + ', ' + inputs.city + ', ' + inputs.state,
        componentRestrictions: {
          country: inputs.country,
          postalCode: inputs.zip,
        }
      };

      let geocoder = new google.maps.Geocoder();
      geocoder.geocode(request, (results, status) => {
        if (status === "OK") {
          resolve(results[0].geometry.location);
        } else {
          reject();
        }
      });
    });
  },
  
  getSearchId: (function() {
    let count = 0;
    return function() {
      count += 1;
      return count;
    };
  })(),
  
  getRatesFromServer(inputs) {
    return new Promise((resolve, reject) => {
      let settings = {
        method: "GET",
        url: "/api/rates",
        data: inputs,
        dataType: "json",
      };

      $.ajax(settings)
        .done(data => {
          resolve(data);
        })
        .fail((_jqXHR, textStatus) => {
          // TODO: return a more helpful error message
          reject(textStatus);
        });
    });
  },

  handleFormSubmit(event) {
    event.preventDefault();

    let inputs = {
      street: $('#street').val().trim(),
      city: $('#city').val().trim(),
      state: $('#state').val().trim(),
      zip: $('#zip').val().trim(),
      country: "US",
      searchId: this.getSearchId()
    };

    event.currentTarget.reset();

    this.getRatesFromServer(inputs)
      .then(rates => {
        this.renderSearchResults(inputs, rates);
      })
      .catch(error => {
        console.log(error);
      });
  },

  init() {
    this.bindListeners();
    this.compileHtmlTemplates();
  },

  insertMap(inputs) {
    let $map = $(`#search${inputs.searchId} .map`);
    
    this.getMapGeocode(inputs)
      .then(geocode => {
        let map = new google.maps.Map($map.get(0), {
          center: geocode,
          zoom: 10
        });

        let marker = new google.maps.Marker({
          position: geocode,
          map,
          title: "Sales Location",
        });
      })
      .catch(() => {
        let img = document.createElement("img");
        img.setAttribute("src", "./images/map-error.png");
        $map.html(img);
      });
  },

  instantiateCopyButtons(id) {
    const clipboard = new ClipboardJS(`#search${id} .btn-copy`);
    // TODO: remove the following
    // TODO: change text in tooltip to "Copied!", set timeout for 5 seconds,
    // and then change back to "Copy"
    clipboard.on("success", event => {
      console.log("Action:", event.action);
      console.log("Text:", event.text);
      console.log("Trigger:", event.trigger);
    });
  },

  renderHtmlFromServer(inputs, rates) {
    let $resultsList = $(".results");
    if ($resultsList.children().length === 0) {
      $resultsList.prop("hidden", false).html(this.resultsTemplate({ rates, inputs }));
    }
    else {
      $resultsList.prepend(this.resultsTemplate({ rates, inputs }));
    }
  },

  renderSearchResults(inputs, rates) {
    this.renderHtmlFromServer(inputs, rates);
    this.instantiateCopyButtons(inputs.searchId);
    this.insertMap(inputs);
  },
};

$(App.init.bind(App));


