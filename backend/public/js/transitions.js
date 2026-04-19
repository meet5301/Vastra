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

  // 4. Override window.location.href setter globally
  // Patch all onclick="window.location.href=..." by overriding navigation
  const origHref = window.location.href;

  // Intercept via Navigation API if available (modern browsers)
  if (window.navigation) {
    window.navigation.addEventListener("navigate", (e) => {
      if (!e.canIntercept || e.hashChange || e.downloadRequest) return;
      const url = new URL(e.destination.url);
      if (url.origin !== location.origin) return;
      e.intercept({
        handler: async () => {
          overlay.style.transition = "opacity 0.28s ease";
          overlay.style.opacity = "1";
          await new Promise(r => setTimeout(r, 300));
          window.location.href = e.destination.url;
        }
      });
    });
    return; // Navigation API handles everything
  }

  // 5. Fallback: intercept <a> clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (link) {
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
