// ─── VASTRA SHOP PAGE JS ──────────────────────────────────────────
// Fetches products from /api/products and renders them

let currentPage = 1;
let currentCategory = "All";
let currentSearch = "";
let currentSort = "";

async function loadProducts() {
  const grid = document.querySelector(".product-grid");
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center;padding:2rem;">Loading...</p>';

  const params = new URLSearchParams({
    page: currentPage,
    limit: 12,
    ...(currentCategory !== "All" && { category: currentCategory }),
    ...(currentSearch && { search: currentSearch }),
    ...(currentSort && { sort: currentSort }),
  });

  try {
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();

    if (!data.success || data.products.length === 0) {
      grid.innerHTML = '<p style="text-align:center;padding:2rem;color:#888;">No products found.</p>';
      return;
    }

    // Update item count
    const countEl = document.querySelector(".grid-controls span");
    if (countEl) countEl.textContent = `${data.total} Items`;

    grid.innerHTML = data.products
      .map(
        (p) => `
      <div class="product-card">
        <div class="product-image-wrapper">
          <img src="${p.image}" loading="lazy" class="product-img" onerror="this.src='https://via.placeholder.com/300x400/cccccc/666666?text=No+Image'">
          <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${p._id}','${p.name}',${p.price},'${p.image}')">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div onclick="window.location.href='/detail?id=${p._id}'">
          <p class="name">${p.name}</p>
          <p class="price">$${p.price}</p>
        </div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p._id}','${p.name}',${p.price},'${p.image}')">
          ADD TO BAG
        </button>
      </div>`
      )
      .join("");

    // Pagination
    renderPagination(data.pages, data.page);
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:red;">Failed to load products.</p>';
  }
}

function renderPagination(totalPages, current) {
  let el = document.querySelector(".pagination");
  if (!el) {
    el = document.createElement("div");
    el.className = "pagination";
    el.style.cssText = "display:flex;gap:8px;justify-content:center;margin:2rem 0;";
    document.querySelector(".content")?.appendChild(el);
  }
  el.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.cssText = `padding:6px 12px;border:1px solid #000;background:${i === current ? "#000" : "#fff"};color:${i === current ? "#fff" : "#000"};cursor:pointer;`;
    btn.onclick = () => { currentPage = i; loadProducts(); };
    el.appendChild(btn);
  }
}

// ── CART (localStorage) ────────────────────────────────────────────
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
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, image, size, quantity: 1 });
  }
  saveCart(cart);
  showToast(`${name} added to bag!`);
}
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector(".cart-badge, #cart-count");
  if (badge) badge.textContent = total;
}
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = "position:fixed;bottom:2rem;right:2rem;background:#000;color:#fff;padding:12px 20px;z-index:9999;font-size:14px;letter-spacing:1px;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2500);
}

// ── WISHLIST ───────────────────────────────────────────────
function getWishlist() {
  return JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
}
function saveWishlist(wishlist) {
  localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist));
}
function toggleWishlist(id, name, price, image) {
  const wishlist = getWishlist();
  const exists = wishlist.find((item) => item.id === id);
  if (exists) {
    saveWishlist(wishlist.filter((item) => item.id !== id));
    showToast(`${name} removed from wishlist`);
  } else {
    wishlist.push({ id, name, price, image });
    saveWishlist(wishlist);
    showToast(`${name} added to wishlist`);
  }
  loadProducts();
}

// ── FILTERS & SEARCH ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartBadge();

  // Search
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }

  // Sort
  const sortSelect = document.querySelector(".grid-controls select");
  if (sortSelect) {
    sortSelect.innerHTML = `
      <option value="">Sort by: All Items</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>`;
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }

  // Category checkboxes
  const checkboxes = document.querySelectorAll(".filter-section input[type='checkbox']");
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const label = cb.parentElement.textContent.trim();
      currentCategory = label === "All" ? "All" : label;
      currentPage = 1;
      loadProducts();
    });
  });
});
