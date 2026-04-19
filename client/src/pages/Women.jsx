import { useEffect } from "react";
import { addToCartShared, toggleWishlistShared } from "../utils/shop";

const markup = `
<section class="men-hero">
  <div class="men-hero-track" id="men-hero-track">
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> NEW SEASON <span class="gold-line"></span></p>
        <h1>WOMEN'S EDIT</h1>
        <h2>Elegant. Timeless. Powerful.</h2>
        <button onclick="window.location.href='/women#products'">SHOP NOW</button>
      </div>
    </div>
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> PREMIUM DRESSES <span class="gold-line"></span></p>
        <h1>EVENING WEAR</h1>
        <h2>Dress to dazzle every occasion.</h2>
        <button onclick="window.location.href='/women#products'">EXPLORE</button>
      </div>
    </div>
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> CASUAL COLLECTION <span class="gold-line"></span></p>
        <h1>EVERYDAY CHIC</h1>
        <h2>Comfort meets effortless style.</h2>
        <button onclick="window.location.href='/women#products'">SHOP NOW</button>
      </div>
    </div>
  </div>
  <button class="men-hero-arrow prev" id="mh-prev"><i class="fa-solid fa-chevron-left"></i></button>
  <button class="men-hero-arrow next" id="mh-next"><i class="fa-solid fa-chevron-right"></i></button>
  <div class="men-hero-dots" id="mh-dots"><button class="mh-dot active"></button><button class="mh-dot"></button><button class="mh-dot"></button></div>
</section>

<div class="men-page">
  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">EXCLUSIVE OFFERS</p><h2>Biggest Deals On Top Brands</h2></div><a href="/women#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="deals-grid">
      <div class="deal-card" onclick="window.location.href='/women#products'" style="background:url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">UP TO 50% OFF</span><h3>Dresses</h3></div></div>
      <div class="deal-card" onclick="window.location.href='/women#products'" style="background:url('https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">NEW IN</span><h3>Blouses</h3></div></div>
      <div class="deal-card" onclick="window.location.href='/women#products'" style="background:url('https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">TRENDING</span><h3>Coats</h3></div></div>
      <div class="deal-card" onclick="window.location.href='/women#products'" style="background:url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">BEST SELLER</span><h3>Skirts</h3></div></div>
    </div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">SHOP BY TYPE</p><h2>Categories To Bag</h2></div></div>
    <div class="cat-chips-row">
      <div class="cat-chip-card" onclick="window.location.href='/women#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&h=200&fit=crop') center/cover;"></div><span>Dresses</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/women#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=200&h=200&fit=crop') center/cover;"></div><span>Blouses</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/women#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&h=200&fit=crop') center/cover;"></div><span>Coats</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/women#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&h=200&fit=crop') center/cover;"></div><span>Skirts</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/women#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop') center/cover;"></div><span>Jackets</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/women#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop') center/cover;"></div><span>Sweaters</span></div>
    </div>
  </section>

  <section class="men-section brands-section">
    <div class="men-section-header"><div><p class="men-tag">PREMIUM WOMEN'S BRANDS</p><h2>Explore Top Brands</h2></div></div>
    <div class="brands-grid">
      <div class="brand-card" onclick="window.location.href='/women#products'"><span>VASTRA FEMME</span></div>
      <div class="brand-card" onclick="window.location.href='/women#products'"><span>VASTRA LUXE</span></div>
      <div class="brand-card" onclick="window.location.href='/women#products'"><span>VASTRA ELEGANCE</span></div>
      <div class="brand-card" onclick="window.location.href='/women#products'"><span>VASTRA CASUAL</span></div>
      <div class="brand-card" onclick="window.location.href='/women#products'"><span>VASTRA COUTURE</span></div>
    </div>
  </section>

  <section class="luxe-banner" onclick="window.location.href='/women#products'">
    <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=400&fit=crop&q=85" alt="Vastra Femme" />
    <div class="luxe-overlay"><p class="men-tag">EXCLUSIVE</p><h2>VASTRA FEMME</h2><p>Premium womenswear — crafted for the modern woman</p><button>SHOP FEMME</button></div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">HOT RIGHT NOW</p><h2>Trending In Indian Wear</h2></div><a href="/women#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="trending-scroll" id="trending-formal"></div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">POPULAR</p><h2>Trending In Western Wear</h2></div><a href="/women#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="trending-scroll" id="trending-casual"></div>
  </section>

  <section class="men-section" id="products">
    <div class="men-section-header"><div><p class="men-tag">COMPLETE COLLECTION</p><h2>All Women's Products</h2></div><span class="result-count" id="result-count"></span></div>
    <div class="men-filter-bar">
      <div class="mfb-group"><span class="mfb-label">SORT</span><select id="sort-select" class="mfb-select"><option value="">Recommended</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option></select></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">PRICE</span><div class="mfb-pills" id="price-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="0-50">Under Rs. 50</button><button class="mfb-pill" data-val="50-100">Rs. 50-Rs. 100</button><button class="mfb-pill" data-val="100-200">Rs. 100-Rs. 200</button><button class="mfb-pill" data-val="200-999">Rs. 200+</button></div></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">TYPE</span><div class="mfb-pills" id="type-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="Dresses">Dresses</button><button class="mfb-pill" data-val="Blouses">Blouses</button><button class="mfb-pill" data-val="Coats">Coats</button><button class="mfb-pill" data-val="Skirts">Skirts</button><button class="mfb-pill" data-val="Jackets">Jackets</button><button class="mfb-pill" data-val="Sweaters">Sweaters</button></div></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">RATING</span><div class="mfb-pills" id="rating-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="4">4★ & above</button><button class="mfb-pill" data-val="3">3★ & above</button></div></div>
    </div>
    <div class="men-product-grid" id="product-grid"></div>
    <div class="pagination-wrap" id="pagination-wrap"></div>
  </section>
</div>
`;

export default function Women() {
  useEffect(() => {
    let currentPage = 1;
    let currentSort = "";
    const formatINR = (value) => `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

    function renderCard(p) {
      const fb = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop";
      const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
      return `
        <div class="men-prod-card" onclick="window.location.href='/detail?id=${p._id}'">
          <div class="men-prod-img-wrap">
            <img src="${p.image}" loading="lazy" onerror="this.onerror=null;this.src='${fb}'" />
            ${p.isFeatured ? '<span class="men-badge">NEW</span>' : ""}
            <button class="men-wish" data-id="${p._id}"><i class="far fa-heart"></i></button>
          </div>
          <div class="men-prod-info">
            <p class="men-prod-sub">${p.subCategory || p.category}</p>
            <p class="men-prod-name">${p.name}</p>
            ${stars ? `<div class="men-prod-stars">${stars} <span>(${p.numReviews})</span></div>` : ""}
            <p class="men-prod-price">${formatINR(p.price)}</p>
            <button class="men-prod-btn" data-cart-id="${p._id}">ADD TO BAG</button>
          </div>
        </div>`;
    }

    async function loadWomenProducts() {
      const grid = document.getElementById("product-grid");
      if (!grid) return;
      grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#888;letter-spacing:2px;font-size:13px;'>LOADING...</div>";

      const sortEl = document.getElementById("sort-select");
      if (sortEl) currentSort = sortEl.value;

      const activePriceEl = document.querySelector("#price-pills .mfb-pill.active");
      const activeTypeEl = document.querySelector("#type-pills .mfb-pill.active");
      const priceVal = activePriceEl ? activePriceEl.dataset.val : "";
      const typeVal = activeTypeEl ? activeTypeEl.dataset.val : "";

      const params = new URLSearchParams({
        page: currentPage,
        limit: 16,
        category: "Women",
        ...(currentSort && { sort: currentSort }),
      });
      try {
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        let products = data.products || [];
        if (priceVal) {
          const [min, max] = priceVal.split("-").map(Number);
          products = products.filter((p) => p.price >= min && p.price <= max);
        }
        if (typeVal) {
          products = products.filter((p) => (p.subCategory || "").toLowerCase().includes(typeVal.toLowerCase()));
        }
        const countEl = document.getElementById("result-count");
        if (countEl) countEl.innerHTML = `<strong>${products.length}</strong> Products`;
        if (!products.length) {
          grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#888;'>No products found.</div>";
          return;
        }
        grid.innerHTML = products.map(renderCard).join("");

        grid.querySelectorAll(".men-wish").forEach((btn) => {
          const id = btn.getAttribute("data-id");
          const p = products.find((x) => x._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlistShared(p._id, p.name, p.price, p.image);
          });
        });
        grid.querySelectorAll(".men-prod-btn").forEach((btn) => {
          const id = btn.getAttribute("data-cart-id");
          const p = products.find((x) => x._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCartShared(p._id, p.name, p.price, p.image);
          });
        });

        renderPagination(data.pages, data.page);
      } catch {
        grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#e63946;'>Failed to load.</div>";
      }
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
      if (!wrap || totalPages <= 1) {
        if (wrap) wrap.innerHTML = "";
        return;
      }
      let html = "";
      if (current > 1) html += `<button class="page-btn" data-page="${current - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
          html += `<button class="page-btn${i === current ? " active" : ""}" data-page="${i}">${i}</button>`;
        } else if (i === current - 2 || i === current + 2) {
          html += `<button class="page-btn dots">...</button>`;
        }
      }
      if (current < totalPages) html += `<button class="page-btn" data-page="${current + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
      wrap.innerHTML = html;
      wrap.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentPage = Number(btn.getAttribute("data-page"));
          loadWomenProducts();
          document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }

    const mhTrack = document.getElementById("men-hero-track");
    const mhDots = document.querySelectorAll(".mh-dot");
    let mhCur = 0;
    let mhTimer;
    function mhGoTo(i) {
      mhCur = (i + 3) % 3;
      mhTrack.style.transform = `translateX(-${mhCur * 100}%)`;
      mhDots.forEach((d, j) => d.classList.toggle("active", j === mhCur));
    }
    function mhStart() {
      mhTimer = setInterval(() => mhGoTo(mhCur + 1), 4000);
    }
    document.getElementById("mh-prev")?.addEventListener("click", () => { clearInterval(mhTimer); mhGoTo(mhCur - 1); mhStart(); });
    document.getElementById("mh-next")?.addEventListener("click", () => { clearInterval(mhTimer); mhGoTo(mhCur + 1); mhStart(); });
    mhDots.forEach((d, i) => d.addEventListener("click", () => { clearInterval(mhTimer); mhGoTo(i); mhStart(); }));
    mhStart();

    document.querySelectorAll(".mfb-pills").forEach((group) => {
      group.querySelectorAll(".mfb-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          group.querySelectorAll(".mfb-pill").forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          currentPage = 1;
          loadWomenProducts();
        });
      });
    });

    const sortEl = document.getElementById("sort-select");
    if (sortEl) sortEl.addEventListener("change", () => { currentPage = 1; loadWomenProducts(); });

    loadWomenProducts();
    loadTrending("trending-formal", 5);
    loadTrending("trending-casual", 5);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
