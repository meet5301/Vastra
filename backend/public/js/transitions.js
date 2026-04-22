// ── VASTRA SMOOTH PAGE TRANSITIONS ───────────────────────────────
(function () {

  // 1. Create full-screen overlay
  const overlay = document.createElement("div");
  overlay.id = "page-overlay";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "background:#fff",
    "z-index:99999", "pointer-events:none",
    "opacity:1", "transition:opacity 0.35s ease"
  ].join(";");
  document.documentElement.appendChild(overlay);

  // 2. Fade overlay OUT on page load (reveal page)
  function revealPage() {
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealPage);
  } else {
    revealPage();
  }

  // Also handle bfcache (back/forward)
  window.addEventListener("pageshow", revealPage);

  // 3. Navigate with fade
  let navigating = false;
  function goTo(href) {
    if (navigating) return;
    navigating = true;
    overlay.style.transition = "opacity 0.28s ease";
    overlay.style.opacity = "1";
    setTimeout(() => { window.location.href = href; }, 300);
  }

  // 4. Intercept local <a> clicks for transition
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (link) {
      if (document.body.classList.contains("nav-open") && link.closest(".menu")) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript") ||
          href.startsWith("mailto") || href.startsWith("tel") ||
          href.startsWith("http") || href.startsWith("//") ||
          link.target === "_blank") return;
      e.preventDefault();
      goTo(href);
      return;
    }

    // Intercept elements with onclick containing window.location.href
    const el = e.target.closest("[onclick]");
    if (!el) return;
    const oc = el.getAttribute("onclick") || "";
    const m = oc.match(/window\.location\.href\s*=\s*['"`]([^'"`]+)['"`]/);
    if (!m) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // Remove onclick to prevent double navigation
    el.removeAttribute("onclick");
    goTo(m[1]);
  }, true);

})();
