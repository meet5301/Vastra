// ── VASTRA ACCESSORIES PAGE JS ────────────────────────────
const ACCESSORIES_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop";

// ── CART ──────────────────────────────────────────────────
function getCart() { return JSON.parse(localStorage.getItem("vastra_cart") || "[]"); }
function saveCart(c) { localStorage.setItem("vastra_cart", JSON.stringify(c)); updateCartBadgeAcc(); }
function updateCartBadgeAcc() {
  const total = getCart().reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll(".cart-badge, #cart-count").forEach(el => el.textContent = total);
}
function addToCartShared(id, name, price, image, size = "Free") {
  const cart = getCart();
  const ex = cart.find(i => i.id === id && i.size === size);
  if (ex) ex.quantity += 1; else cart.push({ id, name, price, image, size, quantity: 1 });
  saveCart(cart);
  showToast(`${name} added to bag!`);
}

// ── WISHLIST ──────────────────────────────────────────────
function getWishlist() { return JSON.parse(localStorage.getItem("vastra_wishlist") || "[]"); }
async function toggleWishlistShared(id, name, price, image) {
  const token = localStorage.getItem("vastra_token");
  if (token) await fetch(`/api/auth/wishlist/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  const wl = getWishlist();
  const exists = wl.find(i => i.id === id);
  if (exists) {
    localStorage.setItem("vastra_wishlist", JSON.stringify(wl.filter(i => i.id !== id)));
    showToast(`${name} removed from wishlist`);
  } else {
    wl.push({ id, name, price, image });
    localStorage.setItem("vastra_wishlist", JSON.stringify(wl));
    showToast(`${name} added to wishlist!`);
  }
  syncWishlistHearts();
}
function syncWishlistHearts() {
  const wl = getWishlist();
  document.querySelectorAll(".men-wish").forEach(btn => {
    const id = btn.dataset.id;
    const icon = btn.querySelector("i");
    if (!icon) return;
    if (wl.find(i => i.id === id)) { icon.classList.replace("far", "fas"); btn.style.color = "#e63946"; }
    else { icon.classList.replace("fas", "far"); btn.style.color = ""; }
  });
}

// ── QUICK VIEW MODAL ──────────────────────────────────────
function openQuickView(p) {
  let modal = document.getElementById("qv-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "qv-modal";
    modal.innerHTML = `
      <div class="qv-backdrop"></div>
      <div class="qv-box">
        <button class="qv-close">&times;</button>
        <div class="qv-img-wrap"><img id="qv-img" /></div>
        <div class="qv-info">
          <p class="qv-cat" id="qv-cat"></p>
          <h2 id="qv-name"></h2>
          <div class="qv-stars" id="qv-stars"></div>
          <p class="qv-price" id="qv-price"></p>
          <div class="qv-sizes" id="qv-sizes"></div>
          <div class="qv-actions">
            <button class="qv-cart-btn" id="qv-cart-btn">ADD TO BAG</button>
            <button class="qv-wish-btn" id="qv-wish-btn"><i class="far fa-heart"></i></button>
          </div>
          <a class="qv-detail-link" id="qv-detail-link">VIEW FULL DETAILS →</a>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".qv-backdrop").addEventListener("click", closeQuickView);
    modal.querySelector(".qv-close").addEventListener("click", closeQuickView);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeQuickView(); });
  }

  const fb = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=700&fit=crop";
  const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
  const sizes = ["XS", "S", "M", "L", "XL", "Free"];
  let selectedSize = "Free";

  modal.querySelector("#qv-img").src = p.image || fb;
  modal.querySelector("#qv-img").onerror = function () { this.src = fb; };
  modal.querySelector("#qv-cat").textContent = p.subCategory || p.category || "";
  modal.querySelector("#qv-name").textContent = p.name;
  modal.querySelector("#qv-stars").innerHTML = stars ? `${stars} <span>(${p.numReviews || 0})</span>` : "";
  modal.querySelector("#qv-price").textContent = `Rs. ${Math.round(Number(p.price || 0)).toLocaleString("en-IN")}`;
  modal.querySelector("#qv-detail-link").href = `/detail?id=${p._id}`;

  const sizesEl = modal.querySelector("#qv-sizes");
  sizesEl.innerHTML = sizes.map(s =>
    `<button class="qv-size${s === selectedSize ? " active" : ""}" data-size="${s}">${s}</button>`
  ).join("");
  sizesEl.querySelectorAll(".qv-size").forEach(btn => {
    btn.addEventListener("click", () => {
      sizesEl.querySelectorAll(".qv-size").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.dataset.size;
    });
  });

  modal.querySelector("#qv-cart-btn").onclick = () => { addToCartShared(p._id, p.name, p.price, p.image, selectedSize); closeQuickView(); };

  const wishBtn = modal.querySelector("#qv-wish-btn");
  const inWl = getWishlist().find(i => i.id === p._id);
  wishBtn.querySelector("i").className = inWl ? "fas fa-heart" : "far fa-heart";
  wishBtn.style.color = inWl ? "#e63946" : "";
  wishBtn.onclick = () => toggleWishlistShared(p._id, p.name, p.price, p.image);

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeQuickView() {
  const modal = document.getElementById("qv-modal");
  if (modal) { modal.classList.remove("open"); document.body.style.overflow = ""; }
}

// ── RENDER CARD ───────────────────────────────────────────
function renderCard(p) {
  const fb = ACCESSORIES_FALLBACK_IMAGE;
  const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
  const wl = getWishlist();
  const inWl = wl.find(i => i.id === p._id);
  return `
    <div class="men-prod-card" onclick="window.location.href='/detail?id=${p._id}'">
      <div class="men-prod-img-wrap">
        <img src="${p.image}" loading="lazy" onerror="this.onerror=null;this.src='${fb}'" />
        ${p.isFeatured ? '<span class="men-badge">NEW</span>' : ""}
        <button class="men-wish ${inWl ? "wishlisted" : ""}" data-id="${p._id}"
          onclick="event.stopPropagation(); toggleWishlistShared('${p._id}','${p.name.replace(/'/g, "\\'")}',${p.price},'${p.image}')">
          <i class="${inWl ? "fas" : "far"} fa-heart"></i>
        </button>
        <button class="men-quick-view" onclick="event.stopPropagation(); openQuickView(${JSON.stringify(p).replace(/"/g, '&quot;')})">
          QUICK VIEW
        </button>
      </div>
      <div class="men-prod-info">
        <p class="men-prod-sub">${p.subCategory || p.category}</p>
        <p class="men-prod-name">${p.name}</p>
        ${stars ? `<div class="men-prod-stars">${stars} <span>(${p.numReviews})</span></div>` : ""}
        <p class="men-prod-price">Rs. ${Math.round(Number(p.price || 0)).toLocaleString("en-IN")}</p>
        <button class="men-prod-btn" onclick="event.stopPropagation(); addToCartShared('${p._id}','${p.name.replace(/'/g, "\\'")}',${p.price},'${p.image}')">ADD TO BAG</button>
      </div>
    </div>`;
}

const accessoriesPageController = window.createAdvancedCategoryPage({
  category: "Accessories",
  fallbackImage: ACCESSORIES_FALLBACK_IMAGE,
  renderCard,
});

async function loadAccProducts() {
  await accessoriesPageController.loadProducts();
  syncWishlistHearts();
}

// ── TRENDING ──────────────────────────────────────────────
async function loadTrendingAcc(containerId, subCategory = "") {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const params = new URLSearchParams({ category: "Accessories", limit: 5, sort: "rating", ...(subCategory && { subCategory }) });
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    if (data.success && data.products.length) el.innerHTML = data.products.map(renderCard).join("");
  } catch {}
}

function setTypeFilter(type) {
  accessoriesPageController.setSubCategory(type);
  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  accessoriesPageController.init();
  loadTrendingAcc("trending-bags", "Bags");
  loadTrendingAcc("trending-jewellery", "Jewellery");
  updateCartBadgeAcc();
  window.setTypeFilter = setTypeFilter;
});
