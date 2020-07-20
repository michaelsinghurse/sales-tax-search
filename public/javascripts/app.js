"use strict";

let App = {
  bindListeners() {
    $(".search-form").on("submit", this.handleSearchSubmit.bind(this));
    $(".login-form").on("submit", this.handleLoginSubmit.bind(this));
  },
  
  bindNavListeners() {
    $("header a").on("click", this.handleNavClick.bind(this));
    window.addEventListener("popstate", this.handlePopstate.bind(this));
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
        dataType: "html",
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

  handleLoginSubmit(event) {
    event.preventDefault();
    event.currentTarget.reset();
  },

  handleNavClick(event) {
    event.preventDefault();
    let href = $(event.target).attr("href");
    this.renderPage(href);
  },

  handlePopstate(event) {
    this.renderPage(window.location.pathname, false);
  },

  handleSearchSubmit(event) {
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
      .then(html => {
        this.renderSearchResults(html, inputs);
      })
      .catch(error => {
        console.log(error);
      });
  },
  
  init() {
    this.bindNavListeners();
    this.renderPage(window.location.pathname);    
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
  
  renderHtmlFromServer(html) {
    let $resultsList = $(".results");
    if ($resultsList.children().length === 0) {
      $resultsList.prop("hidden", false).html(html);
    }
    else {
      $resultsList.prepend(html);
    }
  },

  renderPage(href, pushState = true) {
    let url;

    if (href === "/") {
      url = "/views/search";
    } else {
      url = "/views" + href;
    }

    let settings = {
      url,
      method: "GET",
      dataType: "html",
    };

    $.ajax(settings)
      .done(html => {
        $("main").html(html);
        if (pushState) {
          history.pushState({}, "", href);
        }
        this.bindListeners();
      })
      .fail((_jqXHR, _textStatus, errorThrown) => {
        console.log("Unable to load page from server.");
        console.log("Error thrown:", errorThrown); // TEMP 
      });
  },
  
  renderSearchResults(html, inputs) {
    this.renderHtmlFromServer(html);    
    this.instantiateCopyButtons(inputs.searchId);
    this.insertMap(inputs);
  },
};

$(App.init.bind(App));


