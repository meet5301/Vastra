// ── VASTRA KIDS PAGE JS ───────────────────────────────────────────
let currentPage = 1;
let currentSearch = "";
let currentSort = "";
let currentPriceRange = "";

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#888;font-family:'Inter',sans-serif;letter-spacing:2px;font-size:13px;">LOADING...</div>`;

  const priceEl = document.querySelector('input[name="price"]:checked');
  if (priceEl) currentPriceRange = priceEl.value;
  const sortEl = document.getElementById("sort-select");
  if (sortEl) currentSort = sortEl.value;
  const searchEl = document.getElementById("shop-search-input");
  if (searchEl) currentSearch = searchEl.value;

  const params = new URLSearchParams({
    page: currentPage, limit: 16,
    ...(currentSearch && { search: currentSearch }),
    ...(currentSort && { sort: currentSort }),
  });

  try {
    const res  = await fetch(`/api/products?${params}`);
    const data = await res.json();

    const countEl = document.getElementById("result-count");
    if (countEl) countEl.innerHTML = `<strong>${data.total || 0}</strong> Products`;

    if (!data.success || !data.products.length) {
      grid.innerHTML = `<div class="empty-state"><i class="fa-regular fa-face-sad-tear"></i><h3>No Products Found</h3><p>Try adjusting your filters.</p><a href="/kids" class="empty-state-link">CLEAR FILTERS</a></div>`;
      return;
    }

    let products = data.products;
    if (currentPriceRange) {
      const [min, max] = currentPriceRange.split("-").map(Number);
      products = products.filter(p => p.price >= min && p.price <= max);
    }

    const fallbacks = {
      Men: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop',
      Women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
      Accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop',
      Other: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop',
    };

    grid.innerHTML = products.map(p => {
      const fallback = fallbacks[p.category] || fallbacks.Other;
      const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
      return `
        <div class="product-card" onclick="window.location.href='/detail?id=${p._id}'">
          <div class="product-image-wrapper">
            <img src="${p.image}" loading="lazy" class="product-img" onerror="this.onerror=null;this.src='${fallback}'" />
            ${p.isFeatured ? '<span class="product-badge">NEW</span>' : ''}
            <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlistShared('${p._id}','${p.name}',${p.price},'${p.image}')">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-info">
            <p class="product-category-tag">${p.category || ""}</p>
            <p class="name">${p.name}</p>
            ${p.numReviews > 0 ? `<div class="rating-row"><span class="rating-stars">${stars}</span><span class="rating-count">(${p.numReviews})</span></div>` : ""}
            <div class="price-row"><span class="price">$${p.price}</span></div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCartShared('${p._id}','${p.name}',${p.price},'${p.image}')">ADD TO BAG</button>
          </div>
        </div>`;
    }).join("");

    renderPagination(data.pages, data.page);
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#e63946;">Failed to load products.</div>`;
  }
}

function renderPagination(totalPages, current) {
  const wrap = document.getElementById("pagination-wrap");
  if (!wrap || totalPages <= 1) { if (wrap) wrap.innerHTML = ""; return; }
  let html = "";
  if (current > 1) html += `<button class="page-btn" onclick="goPage(${current-1})"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current-1 && i <= current+1)) html += `<button class="page-btn${i===current?" active":""}" onclick="goPage(${i})">${i}</button>`;
    else if (i === current-2 || i === current+2) html += `<button class="page-btn dots">...</button>`;
  }
  if (current < totalPages) html += `<button class="page-btn" onclick="goPage(${current+1})"><i class="fa-solid fa-chevron-right"></i></button>`;
  wrap.innerHTML = html;
}

function goPage(p) { currentPage = p; loadProducts(); window.scrollTo({ top: 0, behavior: "smooth" }); }

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  const sortEl = document.getElementById("sort-select");
  if (sortEl) sortEl.addEventListener("change", () => { currentPage = 1; loadProducts(); });
  const searchEl = document.getElementById("shop-search-input");
  if (searchEl) { let t; searchEl.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { currentPage = 1; loadProducts(); }, 350); }); }
  document.querySelectorAll('input[name="price"]').forEach(r => r.addEventListener("change", () => { currentPage = 1; loadProducts(); }));
});
