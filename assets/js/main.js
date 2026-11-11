(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("main-nav");
  var navToggle = document.querySelector(".nav-toggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (event.target && event.target.closest && event.target.closest(".site-header")) return;
      closeNav();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeNav();
    });
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px" });
    revealElements.forEach(function (element) { observer.observe(element); });
  } else {
    revealElements.forEach(function (element) { element.classList.add("in-view"); });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy") || "";
      var original = button.textContent;
      var done = function () {
        button.textContent = "Copié";
        window.setTimeout(function () { button.textContent = original; }, 1400);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); done(); } catch (error) {}
        document.body.removeChild(area);
      }
    });
  });

  var courseGrid = document.getElementById("course-grid");
  if (courseGrid) {
    var cards = Array.prototype.slice.call(courseGrid.querySelectorAll(".course-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-level]"));
    var search = document.getElementById("course-search");
    var category = document.getElementById("course-category");
    var countLabel = document.getElementById("course-count");
    var emptyState = document.getElementById("course-empty");
    var activeLevel = "all";

    var applyFilters = function () {
      var query = (search && search.value ? search.value : "").trim().toLowerCase();
      var activeCategory = category && category.value ? category.value : "all";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "") + " " + card.textContent.toLowerCase();
        var matchesLevel = activeLevel === "all" || card.getAttribute("data-level") === activeLevel;
        var matchesCategory = activeCategory === "all" || card.getAttribute("data-cat") === activeCategory;
        var matchesSearch = !query || haystack.toLowerCase().indexOf(query) !== -1;
        var show = matchesLevel && matchesCategory && matchesSearch;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (countLabel) countLabel.textContent = String(visible);
      if (emptyState) emptyState.hidden = visible !== 0;
    };

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeLevel = chip.getAttribute("data-filter-level");
        chips.forEach(function (item) {
          var selected = item === chip;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        applyFilters();
      });
    });

    if (search) search.addEventListener("input", applyFilters);
    if (category) category.addEventListener("change", applyFilters);
    applyFilters();
  }

  var modules = Array.prototype.slice.call(document.querySelectorAll("[data-module]"));
  if (modules.length) {
    var storageKey = "hla.modules.v1";
    var state = {};
    try { state = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (error) { state = {}; }

    var bar = document.getElementById("roadmap-bar");
    var label = document.getElementById("roadmap-label");

    var updateProgress = function () {
      var done = modules.filter(function (box) { return box.checked; }).length;
      if (bar) bar.style.width = (done / modules.length) * 100 + "%";
      if (label) label.textContent = done + " / " + modules.length + " modules terminés";
    };

    modules.forEach(function (box) {
      box.checked = Boolean(state[box.getAttribute("data-module")]);
      box.addEventListener("change", function () {
        state[box.getAttribute("data-module")] = box.checked;
        try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) {}
        updateProgress();
      });
    });

    updateProgress();

    var resetRoadmap = document.getElementById("reset-roadmap");
    if (resetRoadmap) {
      resetRoadmap.addEventListener("click", function () {
        if (!window.confirm("Réinitialiser votre progression sur le parcours ?")) return;
        state = {};
        try { localStorage.removeItem(storageKey); } catch (error) {}
        modules.forEach(function (box) { box.checked = false; });
        updateProgress();
      });
    }
  }
})();
