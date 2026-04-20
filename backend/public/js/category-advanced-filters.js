// Shared advanced filters for category pages (Men/Women/Kids/Accessories)
(function () {
  function toArray(setObj) {
    return Array.from(setObj || []);
  }

  function formatINR(value) {
    return `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
  }

  function parseImage(src, fallback) {
    if (!src) return fallback;
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    return src.startsWith("/") ? src : `/${src}`;
  }

  function colorName(value) {
    const v = String(value || "").trim();
    if (!v) return "";

    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) {
      const hex = v.toLowerCase();
      const map = {
        black: [0, 0, 0],
        white: [255, 255, 255],
        gray: [128, 128, 128],
        red: [220, 53, 69],
        orange: [255, 159, 10],
        yellow: [255, 193, 7],
        green: [25, 135, 84],
        blue: [13, 110, 253],
        navy: [13, 27, 62],
        purple: [111, 66, 193],
        pink: [214, 51, 132],
        brown: [121, 85, 72],
        teal: [32, 201, 151],
      };

      function toRgb(hexValue) {
        const normalized = hexValue.replace("#", "");
        const short = normalized.length === 3;
        const parts = short
          ? normalized.split("").map((ch) => parseInt(ch + ch, 16))
          : [
              parseInt(normalized.slice(0, 2), 16),
              parseInt(normalized.slice(2, 4), 16),
              parseInt(normalized.slice(4, 6), 16),
            ];
        return parts.map((n) => Number.isFinite(n) ? n : 0);
      }

      const [r, g, b] = toRgb(hex);
      let bestName = "Color";
      let bestDistance = Number.POSITIVE_INFINITY;
      Object.entries(map).forEach(([name, rgb]) => {
        const distance = Math.sqrt(
          Math.pow(r - rgb[0], 2) +
          Math.pow(g - rgb[1], 2) +
          Math.pow(b - rgb[2], 2)
        );
        if (distance < bestDistance) {
          bestDistance = distance;
          bestName = name.charAt(0).toUpperCase() + name.slice(1);
        }
      });
      return bestName;
    }

    return v;
  }

  function createCheckboxList(container, key, values, selectedSet) {
    if (!container) return;
    container.innerHTML = (values || [])
      .map((raw) => {
        const value = String(raw || "").trim();
        const label = key === "colors" ? colorName(value) : value;
        return `<label class="adv-check"><input type="checkbox" data-key="${key}" value="${value}" ${selectedSet.has(value) ? "checked" : ""}/> <span>${label}</span></label>`;
      })
      .join("");
  }

  function createBrandChips(container, brands, selectedSet) {
    if (!container) return;
    container.innerHTML = (brands || [])
      .map((name) => `<button class="adv-chip ${selectedSet.has(name) ? "active" : ""}" data-brand="${name}">${name}</button>`)
      .join("");
  }

  function reconcileSet(setObj, allowedValues) {
    const allowed = new Set(allowedValues || []);
    Array.from(setObj).forEach((val) => {
      if (!allowed.has(val)) setObj.delete(val);
    });
  }

  window.createAdvancedCategoryPage = function createAdvancedCategoryPage(config) {
    const state = {
      page: 1,
      limit: 16,
      category: config.category,
      sort: "",
      minPrice: 0,
      maxPrice: 50000,
      priceCap: 50000,
      minRating: "",
      subCategories: new Set(),
      sizes: new Set(),
      colors: new Set(),
      materials: new Set(),
      fits: new Set(),
      brands: new Set(),
    };

    let facetsCache = null;

    function getEl(id) {
      return document.getElementById(id);
    }

    function maxRangeValue() {
      if (!facetsCache || !facetsCache.priceRange) return 50000;
      return Math.max(100, Math.ceil(Number(facetsCache.priceRange.max || 50000)));
    }

    function minRangeValue() {
      if (!facetsCache || !facetsCache.priceRange) return 0;
      return Math.max(0, Math.floor(Number(facetsCache.priceRange.min || 0)));
    }

    function buildParams() {
      const params = new URLSearchParams({
        page: String(state.page),
        limit: String(state.limit),
        category: state.category,
      });

      if (state.sort) params.set("sort", state.sort);
      if (state.minRating) params.set("minRating", state.minRating);

      const baseMin = minRangeValue();
      const baseMax = maxRangeValue();
      if (state.minPrice > baseMin) params.set("minPrice", String(state.minPrice));
      if (state.maxPrice < baseMax) params.set("maxPrice", String(state.maxPrice));

      if (state.subCategories.size) params.set("subCategories", toArray(state.subCategories).join(","));
      if (state.sizes.size) params.set("sizes", toArray(state.sizes).join(","));
      if (state.colors.size) params.set("colors", toArray(state.colors).join(","));
      if (state.materials.size) params.set("material", toArray(state.materials).join(","));
      if (state.fits.size) params.set("fit", toArray(state.fits).join(","));
      if (state.brands.size) params.set("brand", toArray(state.brands).join(","));

      return params;
    }

    function renderActiveFilters() {
      const bar = getEl("active-filters-bar");
      const tags = getEl("af-tags");
      if (!bar || !tags) return;

      const chips = [];
      if (state.sort) chips.push({ label: `Sort: ${state.sort}`, action: "sort" });

      const baseMin = minRangeValue();
      const baseMax = maxRangeValue();
      if (state.minPrice > baseMin || state.maxPrice < baseMax) {
        chips.push({
          label: `Price: Up to ${formatINR(state.maxPrice)}`,
          action: "price",
        });
      }

      toArray(state.brands).forEach((v) => chips.push({ label: `Brand: ${v}`, action: "brands", value: v }));
      toArray(state.subCategories).forEach((v) => chips.push({ label: `Type: ${v}`, action: "subCategories", value: v }));
      toArray(state.sizes).forEach((v) => chips.push({ label: `Size: ${v}`, action: "sizes", value: v }));
      toArray(state.colors).forEach((v) => chips.push({ label: `Color: ${colorName(v)}`, action: "colors", value: v }));
      toArray(state.materials).forEach((v) => chips.push({ label: `Material: ${v}`, action: "materials", value: v }));
      toArray(state.fits).forEach((v) => chips.push({ label: `Fit: ${v}`, action: "fits", value: v }));
      if (state.minRating) chips.push({ label: `Rating: ${state.minRating}+`, action: "minRating" });

      if (!chips.length) {
        bar.style.display = "none";
        tags.innerHTML = "";
        return;
      }

      bar.style.display = "flex";
      tags.innerHTML = chips
        .map((chip) => `<button class="af-tag" data-action="${chip.action}" data-value="${chip.value || ""}">${chip.label} <i class="fa-solid fa-xmark"></i></button>`)
        .join("");
    }

    function renderFacets(facets) {
      if (!facets) return;

      reconcileSet(state.subCategories, facets.subCategories || []);
      reconcileSet(state.sizes, facets.sizes || []);
      reconcileSet(state.colors, facets.colors || []);
      reconcileSet(state.materials, facets.materials || []);
      reconcileSet(state.fits, facets.fits || []);
      reconcileSet(state.brands, facets.brands || []);

      createCheckboxList(getEl("sub-category-list"), "subCategories", facets.subCategories || [], state.subCategories);
      createCheckboxList(getEl("size-list"), "sizes", facets.sizes || [], state.sizes);
      createCheckboxList(getEl("color-list"), "colors", facets.colors || [], state.colors);
      createCheckboxList(getEl("material-list"), "materials", facets.materials || [], state.materials);
      createCheckboxList(getEl("fit-list"), "fits", facets.fits || [], state.fits);
      createBrandChips(getEl("brand-chip-list"), facets.brands || [], state.brands);

      const priceInput = getEl("price-max");
      const minValue = minRangeValue();
      const maxValue = maxRangeValue();

      state.minPrice = minValue;
      state.maxPrice = Math.max(minValue, Math.min(state.maxPrice, maxValue));
      state.priceCap = state.maxPrice;

      if (priceInput) {
        priceInput.min = String(minValue);
        priceInput.max = String(maxValue);
        priceInput.value = String(state.priceCap);
      }

      const minLabel = getEl("price-min-value");
      const maxLabel = getEl("price-max-value");
      if (minLabel) minLabel.textContent = formatINR(minValue);
      if (maxLabel) maxLabel.textContent = `Up to ${formatINR(state.priceCap)}`;
      syncPriceTrack();
    }

    function syncPriceTrack() {
      const track = getEl("price-range-track");
      const priceInput = getEl("price-max");
      if (!track || !priceInput) return;

      const minValue = minRangeValue();
      const maxValue = maxRangeValue();
      const span = Math.max(1, maxValue - minValue);
      const end = ((state.priceCap - minValue) / span) * 100;
      track.style.setProperty("--track-start", "0%");
      track.style.setProperty("--track-end", `${Math.max(0, Math.min(100, end))}%`);
    }

    function renderPagination(totalPages, current) {
      const wrap = getEl("pagination-wrap");
      if (!wrap || totalPages <= 1) {
        if (wrap) wrap.innerHTML = "";
        return;
      }

      let html = "";
      if (current > 1) html += `<button class="page-btn" onclick="goPage(${current - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;

      for (let i = 1; i <= totalPages; i += 1) {
        if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
          html += `<button class="page-btn${i === current ? " active" : ""}" onclick="goPage(${i})">${i}</button>`;
        } else if (i === current - 2 || i === current + 2) {
          html += `<button class="page-btn dots">...</button>`;
        }
      }

      if (current < totalPages) html += `<button class="page-btn" onclick="goPage(${current + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
      wrap.innerHTML = html;
    }

    async function loadProducts() {
      const grid = getEl("product-grid");
      if (!grid) return;

      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888;letter-spacing:2px;font-size:13px;">LOADING...</div>`;

      try {
        const res = await fetch(`/api/products?${buildParams()}`);
        const data = await res.json();

        if (data.success && data.facets) {
          facetsCache = data.facets;
          renderFacets(facetsCache);
        }

        renderActiveFilters();

        const products = data.products || [];
        const countEl = getEl("result-count");
        if (countEl) countEl.innerHTML = `<strong>${data.total || products.length}</strong> Products`;

        if (!data.success || !products.length) {
          grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">No products found.</div>`;
          const wrap = getEl("pagination-wrap");
          if (wrap) wrap.innerHTML = "";
          return;
        }

        grid.innerHTML = products
          .map((p) => {
            const fallback = config.fallbackImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop";
            const normalized = { ...p, image: parseImage(p.image, fallback) };
            return config.renderCard(normalized, fallback);
          })
          .join("");

        renderPagination(data.pages, data.page);
      } catch {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#e63946;">Failed to load.</div>`;
      }
    }

    function goPage(pageNo) {
      state.page = pageNo;
      loadProducts();
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }

    function clearAllFilters() {
      state.page = 1;
      state.sort = "";
      state.minRating = "";
      state.subCategories.clear();
      state.sizes.clear();
      state.colors.clear();
      state.materials.clear();
      state.fits.clear();
      state.brands.clear();

      state.minPrice = minRangeValue();
      state.maxPrice = maxRangeValue();
      state.priceCap = state.maxPrice;

      const sortEl = getEl("sort-select");
      if (sortEl) sortEl.value = "";

      const ratingEl = getEl("rating-select");
      if (ratingEl) ratingEl.value = "";

      renderFacets(facetsCache || {});
      loadProducts();
    }

    function removeFilter(action, value) {
      if (action === "sort") state.sort = "";
      if (action === "price") {
        state.minPrice = minRangeValue();
        state.maxPrice = maxRangeValue();
        state.priceCap = state.maxPrice;
      }
      if (action === "brands") state.brands.delete(value);
      if (action === "subCategories") state.subCategories.delete(value);
      if (action === "sizes") state.sizes.delete(value);
      if (action === "colors") state.colors.delete(value);
      if (action === "materials") state.materials.delete(value);
      if (action === "fits") state.fits.delete(value);
      if (action === "minRating") state.minRating = "";

      state.page = 1;
      renderFacets(facetsCache || {});
      loadProducts();
    }

    function setSubCategory(value) {
      state.subCategories.clear();
      if (value) state.subCategories.add(value);
      state.page = 1;
      renderFacets(facetsCache || {});
      loadProducts();
    }

    function initListeners() {
      const sortEl = getEl("sort-select");
      if (sortEl) {
        sortEl.addEventListener("change", () => {
          state.sort = sortEl.value;
          state.page = 1;
          loadProducts();
        });
      }

      const ratingEl = getEl("rating-select");
      if (ratingEl) {
        ratingEl.addEventListener("change", () => {
          state.minRating = ratingEl.value;
          state.page = 1;
          loadProducts();
        });
      }

      const priceRange = getEl("price-max");
      if (priceRange) {
        const syncPrice = () => {
          state.priceCap = Number(priceRange.value || maxRangeValue());
          state.minPrice = minRangeValue();
          state.maxPrice = Math.max(state.minPrice, Math.min(state.priceCap, maxRangeValue()));

          priceRange.value = String(state.priceCap);

          const minLabel = getEl("price-min-value");
          const maxLabel = getEl("price-max-value");
          if (minLabel) minLabel.textContent = formatINR(minRangeValue());
          if (maxLabel) maxLabel.textContent = `Up to ${formatINR(state.priceCap)}`;
          syncPriceTrack();
        };

        syncPriceTrack();
        priceRange.addEventListener("input", syncPrice);
        priceRange.addEventListener("change", () => {
          state.page = 1;
          loadProducts();
        });
      }

      [
        { id: "sub-category-list", key: "subCategories" },
        { id: "size-list", key: "sizes" },
        { id: "color-list", key: "colors" },
        { id: "material-list", key: "materials" },
        { id: "fit-list", key: "fits" },
      ].forEach(({ id, key }) => {
        const container = getEl(id);
        if (!container) return;
        container.addEventListener("change", (e) => {
          const input = e.target.closest("input[type='checkbox']");
          if (!input) return;
          if (input.checked) state[key].add(input.value);
          else state[key].delete(input.value);
          state.page = 1;
          loadProducts();
        });
      });

      const brandList = getEl("brand-chip-list");
      if (brandList) {
        brandList.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-brand]");
          if (!btn) return;
          const brand = btn.getAttribute("data-brand");
          if (!brand) return;
          if (state.brands.has(brand)) state.brands.delete(brand);
          else state.brands.add(brand);
          state.page = 1;
          loadProducts();
        });
      }

      const clearBtn = getEl("af-clear");
      if (clearBtn) clearBtn.addEventListener("click", clearAllFilters);

      const tags = getEl("af-tags");
      if (tags) {
        tags.addEventListener("click", (e) => {
          const btn = e.target.closest("button.af-tag");
          if (!btn) return;
          removeFilter(btn.dataset.action, btn.dataset.value || "");
        });
      }
    }

    function init() {
      initListeners();
      loadProducts();
      window.goPage = goPage;
      window.clearAllFilters = clearAllFilters;
    }

    return {
      init,
      loadProducts,
      goPage,
      clearAllFilters,
      setSubCategory,
    };
  };
})();
