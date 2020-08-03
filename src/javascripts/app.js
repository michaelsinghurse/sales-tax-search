"use strict";

const map = {
  insertMap(element) {
    const geocode = element.dataset.geocode;

    if (geocode) {
      // eslint-disable-next-line no-undef
      const map = new google.maps.Map(element, {
        center: JSON.parse(geocode),
        zoom: 10
      });

      // eslint-disable-next-line no-unused-vars, no-undef
      const marker = new google.maps.Marker({
        position: JSON.parse(geocode),
        map,
        title: "Sales Location",
      });
    } else {
      const img = document.createElement("img");
      img.setAttribute("src", "./images/map-error.png");
      $(element).html(img);
    }
  },
};

const views = {
  getRates(inputs) {
    return new Promise((resolve, reject) => {
      const settings = {
        method: "GET",
        url: "/api/rates",
        data: inputs,
        dataType: "html",
      };

      $.ajax(settings)
        .done(html => resolve(html))
        .fail((_jqXHR, textStatus) => reject(new Error(textStatus)));
    });
  },

  getView(href) {
    return new Promise((resolve, reject) => {
      let url;

      if (href === "/") {
        url = "/views/search";
      } else if (href === "/about" || href === "/login") {
        url = "/views" + href;
      } else {
        url = "/views/404";
      }

      const settings = {
        url,
        method: "GET",
        dataType: "html",
      };

      $.ajax(settings)
        .done(html => resolve(html))
        .fail((_jqXHR, textStatus) => reject(new Error(textStatus)));
    });
  },
};

const app = {
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
    const href = $(event.target).attr("href");
    this.renderView(href);
  },

  handlePopstate(_event) {
    this.renderView(window.location.pathname, false);
  },

  handleSearchSubmit(event) {
    event.preventDefault();

    const inputs = {
      street: this.sanitize($("#street").val().trim()),
      city: this.sanitize($("#city").val().trim()),
      state: $("#state").val(),
      zip: $("#zip").val(),
      country: "US",
      searchId: this.getSearchId()
    };

    event.currentTarget.reset();

    views.getRates(inputs)
      .then(html => {
        this.renderSearchResults(html, inputs);
      })
      .catch(_error => {
        this.handleServerError();
      });
  },

  handleServerError() {
    const msg = "An error occurred. Please reload the page and try again.";
    window.alert(msg);
  },

  init() {
    this.bindNavListeners();
    this.renderView(window.location.pathname);
  },

  instantiateCopyButtons(id) {
    // eslint-disable-next-line no-undef
    const clipboard = new ClipboardJS(`#search${id} .btn-copy`);

    clipboard.on("success", event => {
      const $tooltip = $(event.trigger).find(".tooltiptext");
      $tooltip.text("Copied!");
      setTimeout(() => {
        $tooltip.text("Copy");
      }, 3 * 1000);
    });

    clipboard.on("error", event => {
      const $tooltip = $(event.target).find(".tooltiptext");
      $tooltip.text("Press Ctrl+C to copy");
      setTimeout(() => {
        $tooltip.text("Copy");
      }, 3 * 1000);
    });
  },

  renderView(href, pushState = true) {
    views.getView(href)
      .then(html => {
        $("main").html(html);
        if (pushState) {
          history.pushState({}, "", href);
        }
        this.bindListeners();
      })
      .catch(_error => {
        this.handleServerError();
      });
  },

  renderSearchResults(html, inputs) {
    $(".results").prepend(html);
    this.instantiateCopyButtons(inputs.searchId);
    map.insertMap($(`#search${inputs.searchId} .map`).get(0));
  },

  sanitize(string) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
};

$(app.init.bind(app));


