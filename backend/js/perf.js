(function () {
  function optimizeImages() {
    const images = document.querySelectorAll("img");
    images.forEach((img, index) => {
      if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");

      if (!img.hasAttribute("loading")) {
        // Keep very first content images eager to avoid LCP regression.
        img.setAttribute("loading", index < 2 ? "eager" : "lazy");
      }

      if (img.getAttribute("loading") === "lazy" && !img.hasAttribute("fetchpriority")) {
        img.setAttribute("fetchpriority", "low");
      }
    });
  }

  function optimizeLongLists() {
    const selectors = [
      ".product-card",
      ".men-prod-card",
      ".acc-prod-card",
      ".search-item",
    ];

    document.querySelectorAll(selectors.join(",")).forEach((el) => {
      if (!el.style.contentVisibility) {
        el.style.contentVisibility = "auto";
        el.style.containIntrinsicSize = "320px 480px";
      }
    });
  }

  function runPerfOptimizations() {
    optimizeImages();
    optimizeLongLists();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPerfOptimizations);
  } else {
    runPerfOptimizations();
  }

  // Re-run when dynamic product lists are replaced.
  const observer = new MutationObserver(() => runPerfOptimizations());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
