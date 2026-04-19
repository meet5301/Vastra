import { useEffect } from "react";
import { addToCartShared, toggleWishlistShared } from "../utils/shop";

const markup = `
<section class="men-hero">
  <div class="men-hero-track" id="men-hero-track">
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> NEW SEASON <span class="gold-line"></span></p>
        <h1>KIDS' EDIT</h1>
        <h2>Fun. Bright. Comfortable.</h2>
        <button onclick="window.location.href='/kids#products'">SHOP NOW</button>
      </div>
    </div>
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> BOYS COLLECTION <span class="gold-line"></span></p>
        <h1>BOYS' WEAR</h1>
        <h2>Style for the little gentlemen.</h2>
        <button onclick="window.location.href='/kids#products'">EXPLORE</button>
      </div>
    </div>
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> GIRLS COLLECTION <span class="gold-line"></span></p>
        <h1>GIRLS' WEAR</h1>
        <h2>Adorable fashion for little ones.</h2>
        <button onclick="window.location.href='/kids#products'">SHOP NOW</button>
      </div>
    </div>
  </div>
  <button class="men-hero-arrow prev" id="mh-prev"><i class="fa-solid fa-chevron-left"></i></button>
  <button class="men-hero-arrow next" id="mh-next"><i class="fa-solid fa-chevron-right"></i></button>
  <div class="men-hero-dots" id="mh-dots"><button class="mh-dot active"></button><button class="mh-dot"></button><button class="mh-dot"></button></div>
</section>

<div class="men-page">
  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">EXCLUSIVE OFFERS</p><h2>Biggest Deals On Top Brands</h2></div><a href="/kids#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="deals-grid">
      <div class="deal-card" onclick="window.location.href='/kids#products'" style="background:url('https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">UP TO 40% OFF</span><h3>Boys Wear</h3></div></div>
      <div class="deal-card" onclick="window.location.href='/kids#products'" style="background:url('https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">NEW IN</span><h3>Girls Wear</h3></div></div>
      <div class="deal-card" onclick="window.location.href='/kids#products'" style="background:url('https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">TRENDING</span><h3>Casual Wear</h3></div></div>
      <div class="deal-card" onclick="window.location.href='/kids#products'" style="background:url('https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">BEST SELLER</span><h3>Accessories</h3></div></div>
    </div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">SHOP BY TYPE</p><h2>Categories To Bag</h2></div></div>
    <div class="cat-chips-row">
      <div class="cat-chip-card" onclick="window.location.href='/kids#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=200&h=200&fit=crop') center/cover;"></div><span>Boys</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/kids#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=200&h=200&fit=crop') center/cover;"></div><span>Girls</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/kids#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&h=200&fit=crop') center/cover;"></div><span>Casual</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/kids#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=200&h=200&fit=crop') center/cover;"></div><span>Accessories</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/kids#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=200&h=200&fit=crop') center/cover;"></div><span>Festive</span></div>
      <div class="cat-chip-card" onclick="window.location.href='/kids#products'"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&h=200&fit=crop') center/cover;"></div><span>Sports</span></div>
    </div>
  </section>

  <section class="men-section brands-section">
    <div class="men-section-header"><div><p class="men-tag">PREMIUM KIDS' BRANDS</p><h2>Explore Top Brands</h2></div></div>
    <div class="brands-grid">
      <div class="brand-card" onclick="window.location.href='/kids#products'"><span>VASTRA JUNIOR</span></div>
      <div class="brand-card" onclick="window.location.href='/kids#products'"><span>VASTRA MINI</span></div>
      <div class="brand-card" onclick="window.location.href='/kids#products'"><span>VASTRA TOTS</span></div>
      <div class="brand-card" onclick="window.location.href='/kids#products'"><span>VASTRA PLAY</span></div>
      <div class="brand-card" onclick="window.location.href='/kids#products'"><span>VASTRA LITTLE</span></div>
    </div>
  </section>

  <section class="luxe-banner" onclick="window.location.href='/kids#products'">
    <img src="https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1400&h=400&fit=crop&q=85" alt="Vastra Junior" />
    <div class="luxe-overlay"><p class="men-tag">EXCLUSIVE</p><h2>VASTRA JUNIOR</h2><p>Premium kidswear — crafted for comfort and style</p><button>SHOP JUNIOR</button></div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">HOT RIGHT NOW</p><h2>Trending In Boys Wear</h2></div><a href="/kids#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="trending-scroll" id="trending-formal"></div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">POPULAR</p><h2>Trending In Girls Wear</h2></div><a href="/kids#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="trending-scroll" id="trending-casual"></div>
  </section>

  <section class="men-section" id="products">
    <div class="men-section-header"><div><p class="men-tag">COMPLETE COLLECTION</p><h2>All Kids' Products</h2></div><span class="result-count" id="result-count"></span></div>
    <div class="men-filter-bar">
      <div class="mfb-group"><span class="mfb-label">SORT</span><select id="sort-select" class="mfb-select"><option value="">Recommended</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option></select></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">PRICE</span><div class="mfb-pills" id="price-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="0-30">Under Rs. 30</button><button class="mfb-pill" data-val="30-60">Rs. 30-Rs. 60</button><button class="mfb-pill" data-val="60-100">Rs. 60-Rs. 100</button><button class="mfb-pill" data-val="100-999">Rs. 100+</button></div></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">RATING</span><div class="mfb-pills" id="rating-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="4">4★ & above</button><button class="mfb-pill" data-val="3">3★ & above</button></div></div>
    </div>
    <div class="men-product-grid" id="product-grid"></div>
    <div class="pagination-wrap" id="pagination-wrap"></div>
  </section>
</div>
`;

export default function Kids() {
  useEffect(() => {
    let currentPage = 1;
    let currentSort = "";
    const formatINR = (value) => `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

    function renderCard(p) {
      const fb = "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop";
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

    async function loadKidsProducts() {
      const grid = document.getElementById("product-grid");
      if (!grid) return;
      grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#888;letter-spacing:2px;font-size:13px;'>LOADING...</div>";

      const sortEl = document.getElementById("sort-select");
      if (sortEl) currentSort = sortEl.value;

      const activePriceEl = document.querySelector("#price-pills .mfb-pill.active");
      const priceVal = activePriceEl ? activePriceEl.dataset.val : "";

      const params = new URLSearchParams({
        page: currentPage,
        limit: 16,
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
        const res = await fetch(`/api/products?limit=${limit}&sort=rating`);
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
          loadKidsProducts();
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
          loadKidsProducts();
        });
      });
    });

    const sortEl = document.getElementById("sort-select");
    if (sortEl) sortEl.addEventListener("change", () => { currentPage = 1; loadKidsProducts(); });

    loadKidsProducts();
    loadTrending("trending-formal", 5);
    loadTrending("trending-casual", 5);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
