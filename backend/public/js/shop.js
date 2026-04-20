// ── VASTRA SHOP JS (Phase 3) ──────────────────────────────────────
const state = {
  page: 1,
  limit: 16,
  category: "All",
  search: "",
  sort: "",
  minPrice: 0,
  maxPrice: 50000,
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

function toArray(setObj) {
  return [...setObj];
}

function parseImage(src, fallback) {
  if (!src) return fallback;
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function formatINR(value) {
  return `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function buildParams() {
  const params = new URLSearchParams({
    page: String(state.page),
    limit: String(state.limit),
  });

  if (state.category !== "All") params.set("category", state.category);
  if (state.search) params.set("search", state.search);
  if (state.sort) params.set("sort", state.sort);
  if (state.minPrice > 0) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice < 50000) params.set("maxPrice", String(state.maxPrice));
  if (state.minRating) params.set("minRating", state.minRating);
  if (state.subCategories.size) params.set("subCategories", toArray(state.subCategories).join(","));
  if (state.sizes.size) params.set("sizes", toArray(state.sizes).join(","));
  if (state.colors.size) params.set("colors", toArray(state.colors).join(","));
  if (state.materials.size) params.set("material", toArray(state.materials).join(","));
  if (state.fits.size) params.set("fit", toArray(state.fits).join(","));
  if (state.brands.size) params.set("brand", toArray(state.brands).join(","));

  return params;
}

function renderCheckboxList(containerId, values, key, selectedSet) {
  const container = getEl(containerId);
  if (!container) return;
  container.innerHTML = values
    .map(
      (value) =>
        `<label class="filter-check"><input type="checkbox" data-key="${key}" value="${value}" ${selectedSet.has(value) ? "checked" : ""}/> <span>${value}</span></label>`
    )
    .join("");
}

function renderBrandChips(brands) {
  const container = getEl("brand-chip-list");
  if (!container) return;
  container.innerHTML = brands
    .map(
      (name) =>
        `<button class="chip-btn ${state.brands.has(name) ? "active" : ""}" data-brand="${name}">${name}</button>`
    )
    .join("");
}

function reconcileSet(selectedSet, allowed) {
  const allowedSet = new Set(allowed);
  [...selectedSet].forEach((value) => {
    if (!allowedSet.has(value)) selectedSet.delete(value);
  });
}

function renderDynamicFacets(facets) {
  if (!facets) return;

  reconcileSet(state.subCategories, facets.subCategories || []);
  reconcileSet(state.sizes, facets.sizes || []);
  reconcileSet(state.colors, facets.colors || []);
  reconcileSet(state.materials, facets.materials || []);
  reconcileSet(state.fits, facets.fits || []);
  reconcileSet(state.brands, facets.brands || []);

  renderCheckboxList("sub-category-list", facets.subCategories || [], "subCategories", state.subCategories);
  renderCheckboxList("size-list", facets.sizes || [], "sizes", state.sizes);
  renderCheckboxList("color-list", facets.colors || [], "colors", state.colors);
  renderCheckboxList("material-list", facets.materials || [], "materials", state.materials);
  renderCheckboxList("fit-list", facets.fits || [], "fits", state.fits);
  renderBrandChips(facets.brands || []);

  const minInput = getEl("price-min");
  const maxInput = getEl("price-max");
  if (minInput && maxInput && facets.priceRange) {
    const realMin = Math.max(0, Math.floor(Number(facets.priceRange.min || 0)));
    const realMax = Math.max(realMin + 100, Math.ceil(Number(facets.priceRange.max || 50000)));
    minInput.min = String(realMin);
    minInput.max = String(realMax);
    maxInput.min = String(realMin);
    maxInput.max = String(realMax);

    state.minPrice = Math.max(realMin, Math.min(state.minPrice, realMax));
    state.maxPrice = Math.max(state.minPrice, Math.min(state.maxPrice, realMax));

    minInput.value = String(state.minPrice);
    maxInput.value = String(state.maxPrice);
    getEl("price-min-value").textContent = formatINR(state.minPrice);
    getEl("price-max-value").textContent = formatINR(state.maxPrice);
  }
}

function renderActiveFilters() {
  const bar = getEl("active-filters-bar");
  const tags = getEl("af-tags");
  if (!bar || !tags) return;

  const chips = [];
  if (state.category !== "All") chips.push({ label: `Category: ${state.category}`, action: "category" });
  if (state.search) chips.push({ label: `Search: ${state.search}`, action: "search" });
  if (state.sort) chips.push({ label: `Sort: ${state.sort}`, action: "sort" });
  if (state.minPrice > 0 || state.maxPrice < 50000) {
    chips.push({ label: `Price: ${formatINR(state.minPrice)} - ${formatINR(state.maxPrice)}`, action: "price" });
  }

  toArray(state.subCategories).forEach((v) => chips.push({ label: `Type: ${v}`, action: "subCategories", value: v }));
  toArray(state.sizes).forEach((v) => chips.push({ label: `Size: ${v}`, action: "sizes", value: v }));
  toArray(state.colors).forEach((v) => chips.push({ label: `Color: ${v}`, action: "colors", value: v }));
  toArray(state.materials).forEach((v) => chips.push({ label: `Material: ${v}`, action: "materials", value: v }));
  toArray(state.fits).forEach((v) => chips.push({ label: `Fit: ${v}`, action: "fits", value: v }));
  toArray(state.brands).forEach((v) => chips.push({ label: `Brand: ${v}`, action: "brands", value: v }));

  if (!chips.length) {
    bar.style.display = "none";
    tags.innerHTML = "";
    return;
  }

  bar.style.display = "flex";
  tags.innerHTML = chips
    .map(
      (chip) => `<button class="af-tag" data-action="${chip.action}" data-value="${chip.value || ""}">${chip.label} <i class="fa-solid fa-xmark"></i></button>`
    )
    .join("");
}

async function loadProducts() {
  const grid = getEl("product-grid");
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#888;font-family:'Inter',sans-serif;letter-spacing:2px;font-size:13px;">LOADING...</div>`;

  const params = buildParams();

  try {
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();

    const countEl = getEl("result-count");
    if (countEl) countEl.innerHTML = `<strong>${data.total || 0}</strong> Products`;

    if (data.success && data.facets) {
      facetsCache = data.facets;
      renderDynamicFacets(facetsCache);
    }
    renderActiveFilters();

    if (!data.success || !data.products.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-face-sad-tear"></i>
          <h3>No Products Found</h3>
          <p>Try adjusting your filters or search term.</p>
          <button class="empty-state-link" onclick="clearAllFilters()">CLEAR FILTERS</button>
        </div>`;
      getEl("pagination-wrap").innerHTML = "";
      return;
    }

    const fallbacks = {
      Men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop",
      Women: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
      Accessories: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
      Other: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
    };

    grid.innerHTML = data.products
      .map((p) => {
        const fallback = fallbacks[p.category] || fallbacks.Other;
        const imageSrc = parseImage(p.image, fallback);
        const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
        const reviewCount = p.numReviews || 0;
        const hasDiscount = Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.price);
        const discountPct = hasDiscount
          ? Math.round(((Number(p.price) - Number(p.discountPrice)) / Number(p.price)) * 100)
          : 0;
        return `
          <div class="product-card" onclick="window.location.href='/detail?id=${p._id}'">
            <div class="product-image-wrapper">
              <img src="${imageSrc}" loading="lazy" class="product-img"
                onerror="this.onerror=null;this.src='${fallback}'" />
              ${p.isFeatured ? '<span class="product-badge">NEW</span>' : ""}
              ${hasDiscount ? `<span class="product-badge sale">-${discountPct}%</span>` : ""}
              <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${p._id}','${p.name}',${p.price},'${imageSrc}')">
                <i class="far fa-heart"></i>
              </button>
            </div>
            <div class="product-info">
              <p class="product-category-tag">${p.category || ""}</p>
              <p class="name">${p.name}</p>
              ${reviewCount > 0 ? `<div class="rating-row"><span class="rating-stars">${stars}</span><span class="rating-count">(${reviewCount})</span></div>` : ""}
              <div class="price-row">
                ${hasDiscount ? `<span class="price-original">${formatINR(p.price)}</span><span class="price">${formatINR(p.discountPrice)}</span>` : `<span class="price">${formatINR(p.price)}</span>`}
              </div>
              <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p._id}','${p.name}',${hasDiscount ? Number(p.discountPrice) : Number(p.price)},'${imageSrc}')">
                ADD TO BAG
              </button>
            </div>
          </div>`;
      })
      .join("");

    renderPagination(data.pages, data.page);
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#e63946;">Failed to load products. Please try again.</div>`;
  }
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

function goPage(p) {
  state.page = p;
  loadProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearAllFilters() {
  state.page = 1;
  state.category = "All";
  state.search = "";
  state.sort = "";
  state.minPrice = 0;
  state.maxPrice = 50000;
  state.minRating = "";
  state.subCategories.clear();
  state.sizes.clear();
  state.colors.clear();
  state.materials.clear();
  state.fits.clear();
  state.brands.clear();

  const searchEl = getEl("shop-search-input");
  if (searchEl) searchEl.value = "";
  const sortEl = getEl("sort-select");
  if (sortEl) sortEl.value = "";
  document.querySelectorAll('input[name="category"]').forEach((r) => {
    r.checked = r.value === "All";
  });
  document.querySelectorAll('input[name="rating"]').forEach((r) => {
    r.checked = r.value === "";
  });

  if (facetsCache?.priceRange) {
    state.minPrice = Number(facetsCache.priceRange.min || 0);
    state.maxPrice = Number(facetsCache.priceRange.max || 50000);
  }

  renderDynamicFacets(facetsCache || {});
  loadProducts();
}

function removeActiveFilter(action, value) {
  if (action === "category") state.category = "All";
  if (action === "search") state.search = "";
  if (action === "sort") state.sort = "";
  if (action === "price") {
    state.minPrice = Number(facetsCache?.priceRange?.min || 0);
    state.maxPrice = Number(facetsCache?.priceRange?.max || 50000);
  }
  if (action === "subCategories") state.subCategories.delete(value);
  if (action === "sizes") state.sizes.delete(value);
  if (action === "colors") state.colors.delete(value);
  if (action === "materials") state.materials.delete(value);
  if (action === "fits") state.fits.delete(value);
  if (action === "brands") state.brands.delete(value);

  state.page = 1;
  renderDynamicFacets(facetsCache || {});
  loadProducts();
}

// ── CART ──────────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem("vastra_cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("vastra_cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, name, price, image, size = "M") {
  const cart = getCart();
  const existing = cart.find((i) => i.id === id && i.size === size);
  if (existing) existing.quantity += 1;
  else cart.push({ id, name, price, image, size, quantity: 1 });
  saveCart(cart);
  showToast(`${name} added to bag!`);
}

function updateCartBadge() {
  const total = getCart().reduce((s, i) => s + i.quantity, 0);
  const badge = document.querySelector(".cart-badge, #cart-count");
  if (badge) badge.textContent = total;
}

// ── WISHLIST ──────────────────────────────────────────────────────
async function toggleWishlist(id, name, price, image) {
  const token = localStorage.getItem("vastra_token");
  if (token) {
    await fetch(`/api/auth/wishlist/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  const wl = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
  const exists = wl.find((i) => i.id === id);
  if (exists) {
    localStorage.setItem("vastra_wishlist", JSON.stringify(wl.filter((i) => i.id !== id)));
    showToast(`${name} removed from wishlist`);
  } else {
    wl.push({ id, name, price, image });
    localStorage.setItem("vastra_wishlist", JSON.stringify(wl));
    showToast(`${name} added to wishlist!`);
  }
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  const sortEl = getEl("sort-select");
  if (sortEl) {
    sortEl.addEventListener("change", () => {
      state.sort = sortEl.value;
      state.page = 1;
      loadProducts();
    });
  }

  const searchEl = getEl("shop-search-input");
  if (searchEl) {
    let t;
    searchEl.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.search = searchEl.value.trim();
        state.page = 1;
        loadProducts();
      }, 300);
    });
  }

  document.querySelectorAll('input[name="category"]').forEach((r) => {
    r.addEventListener("change", () => {
      state.category = r.value;
      state.page = 1;
      loadProducts();
    });
  });

  document.querySelectorAll('input[name="rating"]').forEach((r) => {
    r.addEventListener("change", () => {
      state.minRating = r.value;
      state.page = 1;
      loadProducts();
    });
  });

  const minRange = getEl("price-min");
  const maxRange = getEl("price-max");
  if (minRange && maxRange) {
    const syncPriceLabels = () => {
      state.minPrice = Number(minRange.value || 0);
      state.maxPrice = Number(maxRange.value || 0);
      if (state.minPrice > state.maxPrice) {
        if (document.activeElement === minRange) state.maxPrice = state.minPrice;
        else state.minPrice = state.maxPrice;
      }
      minRange.value = String(state.minPrice);
      maxRange.value = String(state.maxPrice);
      getEl("price-min-value").textContent = formatINR(state.minPrice);
      getEl("price-max-value").textContent = formatINR(state.maxPrice);
    };

    minRange.addEventListener("input", syncPriceLabels);
    maxRange.addEventListener("input", syncPriceLabels);
    minRange.addEventListener("change", () => {
      state.page = 1;
      loadProducts();
    });
    maxRange.addEventListener("change", () => {
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

  const brandContainer = getEl("brand-chip-list");
  if (brandContainer) {
    brandContainer.addEventListener("click", (e) => {
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

  const afClear = getEl("af-clear");
  if (afClear) afClear.addEventListener("click", clearAllFilters);

  const afTags = getEl("af-tags");
  if (afTags) {
    afTags.addEventListener("click", (e) => {
      const btn = e.target.closest("button.af-tag");
      if (!btn) return;
      removeActiveFilter(btn.dataset.action, btn.dataset.value);
    });
  }

  loadProducts();
});

window.loadProducts = loadProducts;
window.goPage = goPage;
window.clearAllFilters = clearAllFilters;
