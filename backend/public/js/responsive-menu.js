window.initResponsiveMenu = function initResponsiveMenu() {
  var menuToggle = document.getElementById("nav-menu-toggle");
  var menuClose = document.getElementById("nav-menu-close");
  var drawer = document.querySelector(".mobile-drawer");
  var overlay = document.querySelector(".mobile-drawer-overlay");
  var drawerNav = document.querySelector(".drawer-nav");
  var bottomLinks = document.querySelectorAll(".mobile-bottom-link[data-mobile-path]");

  if (!menuToggle || !drawer || !overlay) return;
  if (menuToggle.dataset.responsiveBound === "1") return;

  menuToggle.dataset.responsiveBound = "1";

  function setOpenState(isOpen) {
    document.body.classList.toggle("nav-open", isOpen);
    drawer.setAttribute("aria-hidden", isOpen ? "false" : "true");
    overlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  menuToggle.addEventListener("click", function () {
    setOpenState(!document.body.classList.contains("nav-open"));
  });

  if (menuClose) {
    menuClose.addEventListener("click", function () {
      setOpenState(false);
    });
  }

  overlay.addEventListener("click", function () {
    setOpenState(false);
  });

  if (drawerNav) {
    drawerNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        setOpenState(false);
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setOpenState(false);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) {
      setOpenState(false);
    }
  });

  var path = window.location.pathname.toLowerCase();
  bottomLinks.forEach(function (link) {
    var targetPath = (link.getAttribute("data-mobile-path") || "").toLowerCase();
    var isHome = targetPath === "/";
    var active = isHome ? path === "/" : path === targetPath || path.startsWith(targetPath + "/");
    link.classList.toggle("active", active);
  });
};
