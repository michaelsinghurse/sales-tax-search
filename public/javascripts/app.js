"use strict";

const searchCounter = {
  _count: 0,
  get: function() {
      return this._count;
  },
  increment: function() {
      this._count += 1;
  }
};

function handleAddressInput() {
  $('.js-search-form').on('submit', function(event) {
    event.preventDefault();

    const street = $('#street').val().trim();
    const city = $('#city').val().trim();
    const state = $('#state').val().trim();
    const zip = $('#zip').val().trim();

    $('.js-search-form')[0].reset();

    searchCounter.increment();

    const searchObject = {
      street: street,
      city: city,
      state: state,
      zip: zip,
      country: 'US',
      searchId: searchCounter.get()
    };

    getSearchResultsFromServer(searchObject);
  });
}

function getSearchResultsFromServer(searchObject) {
  const settings = {
    method: 'GET',
    url: '/api/rates',
    data: searchObject,
    dataType: 'html'
  };

  const request = $.ajax(settings);

  request.done(function(data) {
    renderHtmlFromServer(data);
    instantiateAndHandleCopyButtons();
    insertGoogleMapOfAddress(searchObject); 
  }); 
  request.fail(function(jqXHR, textStatus) {
    const htmlErrorMessage = '<p>Request failed: Unable to retrieve rates from server. Please check the address and try again.</p>';
    renderHtmlFromServer(htmlErrorMessage);
  });
}

function renderHtmlFromServer(htmlString) {
  const $resultsList = $('.js-results-list');
  if ($resultsList.children().length === 0) {
    $resultsList
    .prop('hidden', false)
    .html(htmlString);
  }
  else {
    $resultsList.prepend(htmlString);
  }
}

function instantiateAndHandleCopyButtons() {
  const clipboard = new Clipboard('.js-btn-copy-input');
}

//first get latitude and longitude; then render the map
function insertGoogleMapOfAddress(searchObject) {
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

  geocoder.geocode(geocoderRequestObject, function(results, status) {
    if (status == 'OK') {
      renderGoogleMapAtLatLng(results[0].geometry.location);
    } else {
      //console.log('Geocoder Error!');
      $('#map').html('<p>Unable to load map for address given. Please check the address and try again.</p>');
    }
  });
}

function renderGoogleMapAtLatLng(addressLatLng) {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: addressLatLng,
    zoom: 10
  });
  const marker = new google.maps.Marker({
    position: addressLatLng,
    map: map,
    title: 'Hello World'
  });
}

$(function() {
  handleAddressInput();
});
