"use strict";

let App = {
  bindListeners() {
    $(".js-search-form").on("submit", this.handleFormSubmit.bind(this));
  },
  
  getSearchId: (function() {
    let count = 0;
    return function() {
      count += 1;
      return count;
    };
  })(),

  getSearchResultsFromServer(inputs) {
    let settings = {
      method: "GET",
      url: "/api/rates",
      data: inputs,
      dataType: "html"
    };

    $.ajax(settings)
      .done(data => {
        this.renderHtmlFromServer(data);
        this.instantiateAndHandleCopyButtons();
        this.insertGoogleMapOfAddress(inputs); 
      }) 
      .fail((_jqXHR, textStatus) => {
        let errorMessage = "<p>Request failed: Unable to retrieve rates from server. Please check the address and try again.</p>";
        this.renderHtmlFromServer(errorMessage);
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

    this.getSearchResultsFromServer(inputs);
  },

  init() {
    this.bindListeners();
  },

  insertGoogleMapOfAddress(searchObject) {
    const street = searchObject.street;
    const city = searchObject.city;
    const state = searchObject.state;

    const geocoder = new google.maps.Geocoder();
    const geocoderRequestObject = {
      address: street + ', ' + city + ', ' + state,
      componentRestrictions: {
        country: searchObject.country,
        postalCode: searchObject.zip
      }
    };

    geocoder.geocode(geocoderRequestObject, (results, status) => {
      if (status == 'OK') {
        this.renderGoogleMapAtLatLng(results[0].geometry.location);
      } else {
        //console.log('Geocoder Error!');
        $('#map').html('<p>Unable to load map for address given. Please check the address and try again.</p>');
      }
    });
  },

  instantiateAndHandleCopyButtons() {
    const clipboard = new Clipboard(".js-btn-copy-input");
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

  renderHtmlFromServer(htmlString) {
    let $resultsList = $(".js-results-list");
    if ($resultsList.children().length === 0) {
      $resultsList.prop("hidden", false).html(htmlString);
    }
    else {
      $resultsList.prepend(htmlString);
    }
  },
};

$(App.init.bind(App));


