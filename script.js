(function () {
  "use strict";

  /* -------------------------- Theme toggle -------------------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var STORAGE_KEY = "kiosk-adlershof-theme";

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    var isDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches) || !theme;
    var moonIcon = themeToggle ? themeToggle.querySelector('[data-theme-icon="dark"]') : null;
    var sunIcon = themeToggle ? themeToggle.querySelector('[data-theme-icon="light"]') : null;
    if (moonIcon && sunIcon) {
      var showSun = theme === "light";
      moonIcon.style.display = showSun ? "none" : "inline";
      sunIcon.style.display = showSun ? "inline" : "none";
    }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var isDarkNow = current === "dark" || (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = isDarkNow ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* -------------------------- Mobile menu -------------------------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("[data-close-menu]").forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
  }

  /* -------------------------- Live open status -------------------------- */
  // Öffnungszeiten: Mo-Sa 08:00-00:00 (bis Mitternacht), So geschlossen
  function getBerlinParts() {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    var parts = fmt.formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var hour = map.hour === "24" ? 0 : parseInt(map.hour, 10);
    return {
      day: weekdayMap[map.weekday],
      minutes: hour * 60 + parseInt(map.minute, 10)
    };
  }

  function updateStatus() {
    var statusDot = document.getElementById("statusDot");
    var statusText = document.getElementById("statusText");
    if (!statusDot || !statusText) return;

    var now = getBerlinParts();
    var isOpen = now.day >= 1 && now.day <= 6 && now.minutes >= 480; // 08:00, closes at midnight (start of next day)

    statusDot.classList.toggle("is-open", isOpen);
    if (isOpen) {
      statusText.innerHTML = '<strong>Geöffnet</strong> · bis Mitternacht';
    } else if (now.day === 0) {
      statusText.innerHTML = '<strong>Geschlossen</strong> · Sonntag Ruhetag';
    } else {
      statusText.innerHTML = '<strong>Geschlossen</strong> · ab 08:00 wieder da';
    }

    var todayRow = document.querySelector('.hours__row[data-day="' + now.day + '"]');
    document.querySelectorAll(".hours__row").forEach(function (row) {
      row.classList.remove("hours__row--today");
    });
    if (todayRow) todayRow.classList.add("hours__row--today");
  }
  updateStatus();

  /* -------------------------- Gallery lightbox -------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-lightbox");
      var altText = btn.querySelector("img") ? btn.querySelector("img").alt : "";
      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = altText;
      }
      if (lightbox) lightbox.classList.add("is-open");
    });
  });

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove("is-open");
    if (lightboxImg) lightboxImg.src = "";
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* -------------------------- Click-to-load map -------------------------- */
  // Datenschutz-Versprechen: Google Maps lädt nur nach Klick.
  var loadMapBtn = document.getElementById("loadMapBtn");
  var mapContainer = document.getElementById("mapContainer");
  if (loadMapBtn && mapContainer) {
    loadMapBtn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=Rudower+Chaussee+5B,+12489+Berlin&output=embed";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.title = "Standort KIOSK Adlershof auf Google Maps";
      mapContainer.innerHTML = "";
      mapContainer.appendChild(iframe);
    });
  }

  /* -------------------------- Scroll reveal -------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* -------------------------- Back to top -------------------------- */
  var toTop = document.getElementById("toTop");
  var toTopLink = document.getElementById("toTopLink");

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  if (toTop) toTop.addEventListener("click", scrollToTop);
  if (toTopLink) toTopLink.addEventListener("click", scrollToTop);

  var scrollSentinel = document.getElementById("scrollSentinel");
  if (toTop && scrollSentinel && "IntersectionObserver" in window) {
    var toTopObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          toTop.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    toTopObserver.observe(scrollSentinel);
  }

  /* -------------------------- Footer year -------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
