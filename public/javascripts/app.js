"use strict";

let App = {
  resultsTemplate: null,

  bindListeners() {
    $(".js-search-form").on("submit", this.handleFormSubmit.bind(this));
  },
  
  compileHtmlTemplates() {
    this.resultsTemplate = Handlebars.compile($("#searchResult").html());
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

  insertGoogleMapOfAddress(inputs) {
    const geocoderRequestObject = {
      address: inputs.street + ', ' + inputs.city + ', ' + inputs.state,
      componentRestrictions: {
        country: inputs.country,
        postalCode: inputs.zip,
      }
    };

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(geocoderRequestObject, (results, status) => {
      if (status == 'OK') {
        this.renderGoogleMapAtLatLng(results[0].geometry.location);
      } else {
        let errorMsg = "<p>Unable to load map for address given. " +
          "Please check the address and try again.</p>";
        $('#map').html(errorMsg);
      }
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

  renderGoogleMapAtLatLng(addressLatLng) {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: addressLatLng,
      zoom: 10
    });

    const marker = new google.maps.Marker({
      position: addressLatLng,
      map,
      title: "Sales Location",
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
    this.insertGoogleMapOfAddress(inputs);
  },
};

$(App.init.bind(App));


