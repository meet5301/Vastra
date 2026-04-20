// ── VASTRA KIDS PAGE JS ───────────────────────────────────────────
const KIDS_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop";

function renderCard(p, fallback) {
  const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
  const safeName = String(p.name || "").replace(/'/g, "\\'");
  return `
    <div class="men-prod-card" onclick="window.location.href='/detail?id=${p._id}'">
      <div class="men-prod-img-wrap">
        <img src="${p.image}" loading="lazy" onerror="this.onerror=null;this.src='${fallback || KIDS_FALLBACK_IMAGE}'" />
        ${p.isFeatured ? '<span class="men-badge">NEW</span>' : ""}
        <button class="men-wish" onclick="event.stopPropagation(); toggleWishlistShared('${p._id}','${safeName}',${p.price},'${p.image}')">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="men-prod-info">
        <p class="men-prod-sub">${p.subCategory || p.category || ""}</p>
        <p class="men-prod-name">${p.name || ""}</p>
        ${stars ? `<div class="men-prod-stars">${stars} <span>(${p.numReviews || 0})</span></div>` : ""}
        <p class="men-prod-price">Rs. ${Math.round(Number(p.price || 0)).toLocaleString("en-IN")}</p>
        <button class="men-prod-btn" onclick="event.stopPropagation(); addToCartShared('${p._id}','${safeName}',${p.price},'${p.image}')">ADD TO BAG</button>
      </div>
    </div>`;
}

const kidsPageController = window.createAdvancedCategoryPage({
  category: "All",
  fallbackImage: KIDS_FALLBACK_IMAGE,
  renderCard,
});

function loadKidsProducts() {
  kidsPageController.loadProducts();
}

async function loadTrending(containerId, limit = 5) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const res = await fetch(`/api/products?limit=${limit}&sort=rating`);
    const data = await res.json();
    if (data.success) {
      el.innerHTML = (data.products || [])
        .map((p) => renderCard({ ...p, image: p.image || KIDS_FALLBACK_IMAGE }, KIDS_FALLBACK_IMAGE))
        .join("");
    }
  } catch {}
}

document.addEventListener("DOMContentLoaded", () => {
  kidsPageController.init();
  loadTrending("trending-formal", 5);
  loadTrending("trending-casual", 5);
});
