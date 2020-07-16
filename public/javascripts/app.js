"use strict";

let App = {
  resultsTemplate: null,

  bindListeners() {
    $(".search-form").on("submit", this.handleFormSubmit.bind(this));
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
    this.loadMapsApi();
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

    clipboard.on("success", event => {
      let $tooltip = $(event.trigger).find(".tooltiptext");
      $tooltip.text("Copied!");
      setTimeout(() => {
        $tooltip.text("Copy");
      }, 3 * 1000);
    });

    clipboard.on("error", event => {
      let $tooltip = $(event.target).find(".tooltiptext");
      $tooltip.text("Press Ctrl+C to copy");
      setTimeout(() => {
        $tooltip.text("Copy");
      }, 3 * 1000);
    });
  },
  
  loadMapsApi() {
    let settings = {
      url: "/api/mapsKey",
      method: "GET",
      dataType: "text",
    };

    $.ajax(settings)
      .done(data => {
        let script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + data;
        document.head.appendChild(script);
      })
      .fail((_jqXHR, _textStatus, errorThrown) => {
        console.log("Unable to load Google Maps.");
        console.log(errorThrown); // TEMP
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


