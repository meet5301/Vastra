// ── VASTRA WOMEN PAGE JS ──────────────────────────────────────────
let currentPage = 1, currentSort = "";

function renderCard(p) {
  const fb = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop';
  const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
  return `
    <div class="men-prod-card" onclick="window.location.href='/detail?id=${p._id}'">
      <div class="men-prod-img-wrap">
        <img src="${p.image}" loading="lazy" onerror="this.onerror=null;this.src='${fb}'" />
        ${p.isFeatured ? '<span class="men-badge">NEW</span>' : ''}
        <button class="men-wish" onclick="event.stopPropagation(); toggleWishlistShared('${p._id}','${p.name}',${p.price},'${p.image}')">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="men-prod-info">
        <p class="men-prod-sub">${p.subCategory || p.category}</p>
        <p class="men-prod-name">${p.name}</p>
        ${stars ? `<div class="men-prod-stars">${stars} <span>(${p.numReviews})</span></div>` : ''}
        <p class="men-prod-price">$${p.price}</p>
        <button class="men-prod-btn" onclick="event.stopPropagation(); addToCartShared('${p._id}','${p.name}',${p.price},'${p.image}')">ADD TO BAG</button>
      </div>
    </div>`;
}

async function loadWomenProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888;letter-spacing:2px;font-size:13px;">LOADING...</div>`;
  const sortEl = document.getElementById("sort-select");
  if (sortEl) currentSort = sortEl.value;
  const activePriceEl = document.querySelector('#price-pills .mfb-pill.active');
  const activeTypeEl  = document.querySelector('#type-pills .mfb-pill.active');
  const priceVal = activePriceEl ? activePriceEl.dataset.val : '';
  const typeVal  = activeTypeEl  ? activeTypeEl.dataset.val  : '';
  const params = new URLSearchParams({ page: currentPage, limit: 16, category: "Women", ...(currentSort && { sort: currentSort }) });
  try {
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    let products = data.products || [];
    if (priceVal) { const [min,max] = priceVal.split('-').map(Number); products = products.filter(p=>p.price>=min&&p.price<=max); }
    if (typeVal) products = products.filter(p => (p.subCategory||'').toLowerCase().includes(typeVal.toLowerCase()));
    const countEl = document.getElementById("result-count");
    if (countEl) countEl.innerHTML = `<strong>${products.length}</strong> Products`;
    if (!products.length) { grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">No products found.</div>`; return; }
    grid.innerHTML = products.map(renderCard).join("");
    renderPagination(data.pages, data.page);
  } catch { grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#e63946;">Failed to load.</div>`; }
}

async function loadTrending(containerId, limit = 5) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const res = await fetch(`/api/products?category=Women&limit=${limit}&sort=rating`);
    const data = await res.json();
    if (data.success) el.innerHTML = data.products.map(renderCard).join("");
  } catch {}
}

function renderPagination(totalPages, current) {
  const wrap = document.getElementById("pagination-wrap");
  if (!wrap || totalPages <= 1) { if (wrap) wrap.innerHTML = ""; return; }
  let html = "";
  if (current > 1) html += `<button class="page-btn" onclick="goPage(${current-1})"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i===1||i===totalPages||(i>=current-1&&i<=current+1)) html += `<button class="page-btn${i===current?" active":""}" onclick="goPage(${i})">${i}</button>`;
    else if (i===current-2||i===current+2) html += `<button class="page-btn dots">...</button>`;
  }
  if (current < totalPages) html += `<button class="page-btn" onclick="goPage(${current+1})"><i class="fa-solid fa-chevron-right"></i></button>`;
  wrap.innerHTML = html;
}

function goPage(p) { currentPage=p; loadWomenProducts(); document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); }

document.addEventListener("DOMContentLoaded", () => {
  loadWomenProducts();
  loadTrending("trending-formal", 5);
  loadTrending("trending-casual", 5);
  const sortEl = document.getElementById("sort-select");
  if (sortEl) sortEl.addEventListener("change", () => { currentPage=1; loadWomenProducts(); });
});
