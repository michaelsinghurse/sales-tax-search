"use strict";

let map = {
  getGeocode(inputs) {
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
  
  insertMap(inputs, element) {
    this.getGeocode(inputs)
      .then(geocode => {
        let map = new google.maps.Map(element, {
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
        $(element).html(img);
      });
  },
};

let views = {
  getRates(inputs) {
    return new Promise((resolve, reject) => {
      let settings = {
        method: "GET",
        url: "/api/rates",
        data: inputs,
        dataType: "html",
      };

      $.ajax(settings)
        .done(html => {
          resolve(html);
        })
        .fail((_jqXHR, _textStatus, errorThrown) => {
          reject(errorThrown);
        });
    });
  },

  getPage(url) {
    return new Promise((resolve, reject) => {
      let settings = {
        url,
        method: "GET",
        dataType: "html",
      };

      $.ajax(settings)
        .done(html => {
          resolve(html);
        })
        .fail((_jqXHR, _textStatus, errorThrown) => {
          reject(errorThrown);
        });
    });
  },
};

let app = {
  bindListeners() {
    $(".search-form").on("submit", this.handleSearchSubmit.bind(this));
    $(".login-form").on("submit", this.handleLoginSubmit.bind(this));
  },
  
  bindNavListeners() {
    $("header a").on("click", this.handleNavClick.bind(this));
    window.addEventListener("popstate", this.handlePopstate.bind(this));
  },

  getSearchId: (function() {
    let count = 0;
    return function() {
      count += 1;
      return count;
    };
  })(),
  
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
      street: this.sanitize($('#street').val().trim()),
      city: this.sanitize($('#city').val().trim()),
      state: $('#state').val(),
      zip: $('#zip').val(),
      country: "US",
      searchId: this.getSearchId()
    };

    event.currentTarget.reset();

    views.getRates(inputs)
      .then(html => {
        this.renderRates(html, inputs);
      })
      .catch(error => {
        //console.log(error);
      });
  },
  
  init() {
    this.bindNavListeners();
    this.renderPage(window.location.pathname);    
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
  
  renderPage(href, pushState = true) {
    let url;

    if (href === "/") {
      url = "/views/search";
    } else if (href === "/about" || href === "/login") {
      url = "/views" + href;
    } else {
      url = "/views/404";
    }

    views.getPage(url)
      .then(html => {
        $("main").html(html);
        if (pushState) {
          history.pushState({}, "", href);
        }
        this.bindListeners();
      })
      .catch(error => {
        //console.log(error);
      });
  },

  renderRates(html, inputs) {
    $(".results").prepend(html);
    this.instantiateCopyButtons(inputs.searchId);
    map.insertMap(inputs, $(`#search${inputs.searchId} .map`).get(0));
  },

  sanitize(string) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
};

$(app.init.bind(app));


