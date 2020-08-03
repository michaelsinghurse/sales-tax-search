"use strict";

var map = {
  insertMap: function insertMap(element) {
    var geocode = element.dataset.geocode;

    if (geocode) {
      // eslint-disable-next-line no-undef
      var _map = new google.maps.Map(element, {
        center: JSON.parse(geocode),
        zoom: 10
      }); // eslint-disable-next-line no-unused-vars, no-undef


      var marker = new google.maps.Marker({
        position: JSON.parse(geocode),
        map: _map,
        title: "Sales Location"
      });
    } else {
      var img = document.createElement("img");
      img.setAttribute("src", "./images/map-error.png");
      $(element).html(img);
    }
  }
};
var views = {
  getRates: function getRates(inputs) {
    return new Promise(function (resolve, reject) {
      var settings = {
        method: "GET",
        url: "/api/rates",
        data: inputs,
        dataType: "html"
      };
      $.ajax(settings).done(function (html) {
        return resolve(html);
      }).fail(function (_jqXHR, textStatus) {
        return reject(new Error(textStatus));
      });
    });
  },
  getView: function getView(href) {
    return new Promise(function (resolve, reject) {
      var url;

      if (href === "/") {
        url = "/views/search";
      } else if (href === "/about" || href === "/login") {
        url = "/views" + href;
      } else {
        url = "/views/404";
      }

      var settings = {
        url: url,
        method: "GET",
        dataType: "html"
      };
      $.ajax(settings).done(function (html) {
        return resolve(html);
      }).fail(function (_jqXHR, textStatus) {
        return reject(new Error(textStatus));
      });
    });
  }
};
var app = {
  bindListeners: function bindListeners() {
    $(".search-form").on("submit", this.handleSearchSubmit.bind(this));
    $(".login-form").on("submit", this.handleLoginSubmit.bind(this));
  },
  bindNavListeners: function bindNavListeners() {
    $("header a").on("click", this.handleNavClick.bind(this));
    window.addEventListener("popstate", this.handlePopstate.bind(this));
  },
  getSearchId: function () {
    var count = 0;
    return function () {
      count += 1;
      return count;
    };
  }(),
  handleLoginSubmit: function handleLoginSubmit(event) {
    event.preventDefault();
    event.currentTarget.reset();
  },
  handleNavClick: function handleNavClick(event) {
    event.preventDefault();
    var href = $(event.target).attr("href");
    this.renderPage(href);
  },
  handlePopstate: function handlePopstate(_event) {
    console.log("state:", _event.state); //TODO: delete
    // this.insertView(_event.state);

    this.renderPage(window.location.pathname, false);
  },
  handleSearchSubmit: function handleSearchSubmit(event) {
    var _this = this;

    event.preventDefault();
    var inputs = {
      street: this.sanitize($("#street").val().trim()),
      city: this.sanitize($("#city").val().trim()),
      state: $("#state").val(),
      zip: $("#zip").val(),
      country: "US",
      searchId: this.getSearchId()
    };
    event.currentTarget.reset();
    views.getRates(inputs).then(function (html) {
      _this.renderRates(html, inputs);
    })["catch"](function (_error) {
      _this.handleServerError();
    });
  },
  handleServerError: function handleServerError() {
    var msg = "An error occurred. Please reload the page and try again.";
    window.alert(msg);
  },
  init: function init() {
    console.log("INIT()"); // TODO: DELETE

    this.bindNavListeners();
    this.renderPage(window.location.pathname);
  },
  instantiateCopyButtons: function instantiateCopyButtons(id) {
    // eslint-disable-next-line no-undef
    var clipboard = new ClipboardJS("#search".concat(id, " .btn-copy"));
    clipboard.on("success", function (event) {
      var $tooltip = $(event.trigger).find(".tooltiptext");
      $tooltip.text("Copied!");
      setTimeout(function () {
        $tooltip.text("Copy");
      }, 3 * 1000);
    });
    clipboard.on("error", function (event) {
      var $tooltip = $(event.target).find(".tooltiptext");
      $tooltip.text("Press Ctrl+C to copy");
      setTimeout(function () {
        $tooltip.text("Copy");
      }, 3 * 1000);
    });
  },
  renderPage: function renderPage(href) {
    var _this2 = this;

    var pushState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    views.getView(href).then(function (html) {
      $("main").html(html);

      if (pushState) {
        history.pushState({
          foo: "bar"
        }, "", href); // TODO: change back to {}
      }

      _this2.bindListeners();
    })["catch"](function (_error) {
      _this2.handleServerError();
    });
  },
  renderRates: function renderRates(html, inputs) {
    $(".results").prepend(html);
    this.instantiateCopyButtons(inputs.searchId);
    map.insertMap($("#search".concat(inputs.searchId, " .map")).get(0));
  },
  sanitize: function sanitize(string) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};
$(app.init.bind(app));