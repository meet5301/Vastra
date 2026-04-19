// ── VASTRA SHOP JS ────────────────────────────────────────────────
let currentPage = 1;
let currentCategory = "All";
let currentSearch = "";
let currentSort = "";
let currentPriceRange = "";

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#888;font-family:'Inter',sans-serif;letter-spacing:2px;font-size:13px;">LOADING...</div>`;

  // Read filters from sidebar
  const catEl = document.querySelector('input[name="category"]:checked');
  if (catEl) currentCategory = catEl.value;

  const priceEl = document.querySelector('input[name="price"]:checked');
  if (priceEl) currentPriceRange = priceEl.value;

  const sortEl = document.getElementById("sort-select");
  if (sortEl) currentSort = sortEl.value;

  const searchEl = document.getElementById("shop-search-input");
  if (searchEl) currentSearch = searchEl.value;

  const params = new URLSearchParams({
    page: currentPage,
    limit: 16,
    ...(currentCategory !== "All" && { category: currentCategory }),
    ...(currentSearch && { search: currentSearch }),
    ...(currentSort && { sort: currentSort }),
  });

  try {
    const res  = await fetch(`/api/products?${params}`);
    const data = await res.json();

    // Update count
    const countEl = document.getElementById("result-count");
    if (countEl) countEl.innerHTML = `<strong>${data.total || 0}</strong> Products`;

    if (!data.success || !data.products.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-face-sad-tear"></i>
          <h3>No Products Found</h3>
          <p>Try adjusting your filters or search term.</p>
          <a href="/shop" class="empty-state-link">CLEAR FILTERS</a>
        </div>`;
      document.getElementById("pagination-wrap").innerHTML = "";
      return;
    }

    // Client-side price filter
    let products = data.products;
    if (currentPriceRange) {
      const [min, max] = currentPriceRange.split("-").map(Number);
      products = products.filter(p => p.price >= min && p.price <= max);
    }

    // Reliable fallback images per category
  const fallbacks = {
    Men: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop',
    Women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    Accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop',
    Other: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
  };

  grid.innerHTML = products.map(p => {
      const fallback = fallbacks[p.category] || fallbacks.Other;
      const stars = p.avgRating ? '★'.repeat(Math.round(p.avgRating)) + '☆'.repeat(5 - Math.round(p.avgRating)) : '';
      const reviewCount = p.numReviews || 0;
      return `
        <div class="product-card" onclick="window.location.href='/detail?id=${p._id}'">
          <div class="product-image-wrapper">
            <img src="${p.image}" loading="lazy" class="product-img"
              onerror="this.onerror=null;this.src='${fallback}'" />
            ${p.isFeatured ? '<span class="product-badge">NEW</span>' : ''}
            <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${p._id}','${p.name}',${p.price},'${p.image}')">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-info">
            <p class="product-category-tag">${p.category || ""}</p>
            <p class="name">${p.name}</p>
            ${reviewCount > 0 ? `
            <div class="rating-row">
              <span class="rating-stars">${stars}</span>
              <span class="rating-count">(${reviewCount})</span>
            </div>` : ""}
            <div class="price-row">
              <span class="price">$${p.price}</span>
            </div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p._id}','${p.name}',${p.price},'${p.image}')">
              ADD TO BAG
            </button>
          </div>
        </div>`;
    }).join("");

    renderPagination(data.pages, data.page);
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#e63946;">Failed to load products. Please try again.</div>`;
  }
}

function renderPagination(totalPages, current) {
  const wrap = document.getElementById("pagination-wrap");
  if (!wrap || totalPages <= 1) { if (wrap) wrap.innerHTML = ""; return; }

  let html = "";
  if (current > 1) html += `<button class="page-btn" onclick="goPage(${current - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;

  for (let i = 1; i <= totalPages; i++) {
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
  currentPage = p;
  loadProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── CART ──────────────────────────────────────────────────────────
function getCart() { return JSON.parse(localStorage.getItem("vastra_cart") || "[]"); }
function saveCart(cart) { localStorage.setItem("vastra_cart", JSON.stringify(cart)); updateCartBadge(); }

function addToCart(id, name, price, image, size = "M") {
  const cart = getCart();
  const existing = cart.find(i => i.id === id && i.size === size);
  if (existing) { existing.quantity += 1; }
  else { cart.push({ id, name, price, image, size, quantity: 1 }); }
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
  if (token) await fetch(`/api/auth/wishlist/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  const wl = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
  const exists = wl.find(i => i.id === id);
  if (exists) {
    localStorage.setItem("vastra_wishlist", JSON.stringify(wl.filter(i => i.id !== id)));
    showToast(`${name} removed from wishlist`);
  } else {
    wl.push({ id, name, price, image });
    localStorage.setItem("vastra_wishlist", JSON.stringify(wl));
    showToast(`${name} added to wishlist!`);
  }
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartBadge();

  // Sort change
  const sortEl = document.getElementById("sort-select");
  if (sortEl) sortEl.addEventListener("change", () => { currentPage = 1; loadProducts(); });

  // Search input
  const searchEl = document.getElementById("shop-search-input");
  if (searchEl) {
    let t;
    searchEl.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { currentPage = 1; loadProducts(); }, 350);
    });
  }

  // Category radio
  document.querySelectorAll('input[name="category"]').forEach(r => {
    r.addEventListener("change", () => { currentPage = 1; loadProducts(); });
  });

  // Price radio
  document.querySelectorAll('input[name="price"]').forEach(r => {
    r.addEventListener("change", () => { currentPage = 1; loadProducts(); });
  });
});
