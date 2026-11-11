(function () {
  "use strict";

  var STORAGE_KEY = "hla.labs.v1";

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (error) { return {}; }
  }

  function writeState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  window.HLA = {
    isComplete: function (id) {
      return Boolean(readState()[id]);
    },

    markComplete: function (id) {
      var state = readState();
      state[id] = { date: new Date().toISOString() };
      writeState(state);
    },

    reset: function (id) {
      var state = readState();
      delete state[id];
      writeState(state);
    },

    resetAll: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
    },

    initLab: function (options) {
      var form = document.getElementById(options.form);
      var input = document.getElementById(options.input);
      var feedback = document.getElementById(options.feedback);
      var success = document.getElementById(options.success);
      if (!form || !input || !success) return;

      var flagSlot = success.querySelector(".flag-value");
      if (flagSlot) flagSlot.textContent = options.flag;

      var showSuccess = function () {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (feedback) {
          feedback.textContent = "Flag valide — lab terminé.";
          feedback.className = "lab-feedback is-ok";
        }
        input.value = "";
      };

      if (this.isComplete(options.id)) {
        success.hidden = false;
        if (feedback) {
          feedback.textContent = "Ce lab est déjà validé sur cet appareil.";
          feedback.className = "lab-feedback is-ok";
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = (input.value || "").trim();
        if (value && value.toLowerCase() === options.flag.toLowerCase()) {
          this.markComplete(options.id);
          showSuccess();
        } else if (feedback) {
          feedback.textContent = "Flag incorrect. Vérifiez les indices et réessayez.";
          feedback.className = "lab-feedback is-error";
          input.focus();
        }
      }.bind(this));

      var reset = document.querySelector("[data-reset-lab]");
      if (reset) {
        reset.addEventListener("click", function () {
          this.reset(options.id);
          window.location.reload();
        }.bind(this));
      }
    },

    initIndex: function () {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-lab-id]"));
      if (!cards.length) return;

      var self = this;
      var done = 0;

      cards.forEach(function (card) {
        if (self.isComplete(card.getAttribute("data-lab-id"))) {
          card.classList.add("is-done");
          var badge = card.querySelector(".lab-done");
          if (badge) badge.hidden = false;
          done += 1;
        }
      });

      var count = document.getElementById("labs-count");
      if (count) count.textContent = done + " / " + cards.length;
      var bar = document.getElementById("labs-progress-bar");
      if (bar) bar.style.width = (done / cards.length) * 100 + "%";

      var reset = document.getElementById("reset-all-labs");
      if (reset) {
        reset.addEventListener("click", function () {
          if (!window.confirm("Réinitialiser la progression de tous les labs sur cet appareil ?")) return;
          self.resetAll();
          window.location.reload();
        });
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.HLA.initIndex();
  });
})();
