import { useEffect } from "react";
import { addToCartShared, toggleWishlistShared } from "../utils/shop";
import { showToast } from "../utils/toast";

const markup = `
<section class="men-hero">
  <div class="men-hero-track" id="men-hero-track">
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> NEW ARRIVALS <span class="gold-line"></span></p>
        <h1>ACCESSORIES</h1>
        <h2>Complete your look, define your style.</h2>
        <button onclick="window.location.href='/accessories#products'">SHOP NOW</button>
      </div>
    </div>
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> PREMIUM WATCHES <span class="gold-line"></span></p>
        <h1>TIMEPIECES</h1>
        <h2>Luxury watches for every wrist.</h2>
        <button onclick="window.location.href='/accessories#products'">EXPLORE</button>
      </div>
    </div>
    <div class="men-hero-slide" style="background-image:url('https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1600&h=600&fit=crop&q=90');">
      <div class="men-hero-overlay"></div>
      <div class="men-hero-content">
        <p class="men-hero-tag"><span class="gold-line"></span> TRENDING NOW <span class="gold-line"></span></p>
        <h1>JEWELLERY</h1>
        <h2>Elevate every outfit effortlessly.</h2>
        <button onclick="window.location.href='/accessories#products'">SHOP NOW</button>
      </div>
    </div>
  </div>
  <button class="men-hero-arrow prev" id="mh-prev"><i class="fa-solid fa-chevron-left"></i></button>
  <button class="men-hero-arrow next" id="mh-next"><i class="fa-solid fa-chevron-right"></i></button>
  <div class="men-hero-dots" id="mh-dots"><button class="mh-dot active"></button><button class="mh-dot"></button><button class="mh-dot"></button></div>
</section>

<div class="men-page">
  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">EXCLUSIVE OFFERS</p><h2>Biggest Deals On Accessories</h2></div><a href="/accessories#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="deals-grid">
      <div class="deal-card" onclick="setTypeFilter('Bags')" style="background:url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">UP TO 40% OFF</span><h3>Bags</h3></div></div>
      <div class="deal-card" onclick="setTypeFilter('Jewellery')" style="background:url('https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">NEW IN</span><h3>Jewellery</h3></div></div>
      <div class="deal-card" onclick="setTypeFilter('Watches')" style="background:url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">TRENDING</span><h3>Watches</h3></div></div>
      <div class="deal-card" onclick="setTypeFilter('Scarves')" style="background:url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop') center/cover;"><div class="deal-overlay"><span class="deal-badge">BEST SELLER</span><h3>Scarves</h3></div></div>
    </div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">SHOP BY TYPE</p><h2>Categories To Bag</h2></div></div>
    <div class="cat-chips-row">
      <div class="cat-chip-card" onclick="setTypeFilter('Bags')"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop') center/cover;"></div><span>Bags</span></div>
      <div class="cat-chip-card" onclick="setTypeFilter('Watches')"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop') center/cover;"></div><span>Watches</span></div>
      <div class="cat-chip-card" onclick="setTypeFilter('Jewellery')"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop') center/cover;"></div><span>Jewellery</span></div>
      <div class="cat-chip-card" onclick="setTypeFilter('Scarves')"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop') center/cover;"></div><span>Scarves</span></div>
      <div class="cat-chip-card" onclick="setTypeFilter('Belts')"><div class="cat-chip-img" style="background:url('https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=200&h=200&fit=crop') center/cover;"></div><span>Belts</span></div>
    </div>
  </section>

  <section class="men-section brands-section">
    <div class="men-section-header"><div><p class="men-tag">PREMIUM</p><h2>Explore Top Brands</h2></div></div>
    <div class="brands-grid">
      <div class="brand-card" onclick="window.location.href='/accessories#products'"><span>VASTRA LUXE</span></div>
      <div class="brand-card" onclick="window.location.href='/accessories#products'"><span>VASTRA GOLD</span></div>
      <div class="brand-card" onclick="window.location.href='/accessories#products'"><span>VASTRA CRAFT</span></div>
      <div class="brand-card" onclick="window.location.href='/accessories#products'"><span>VASTRA SPORT</span></div>
      <div class="brand-card" onclick="window.location.href='/accessories#products'"><span>VASTRA EDIT</span></div>
    </div>
  </section>

  <section class="luxe-banner" onclick="window.location.href='/accessories#products'">
    <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&h=400&fit=crop&q=85" alt="Vastra Accessories" />
    <div class="luxe-overlay"><p class="men-tag">EXCLUSIVE</p><h2>VASTRA LUXE ACCESSORIES</h2><p>Premium accessories — crafted for the discerning individual</p><button>SHOP LUXE</button></div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">HOT RIGHT NOW</p><h2>Trending Bags & Wallets</h2></div><a href="/accessories#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="trending-scroll" id="trending-bags"></div>
  </section>

  <section class="men-section">
    <div class="men-section-header"><div><p class="men-tag">POPULAR</p><h2>Trending Jewellery & Watches</h2></div><a href="/accessories#products" class="men-view-all">VIEW ALL <i class="fa-solid fa-arrow-right"></i></a></div>
    <div class="trending-scroll" id="trending-jewellery"></div>
  </section>

  <section class="men-section" id="products">
    <div class="men-section-header"><div><p class="men-tag">COMPLETE COLLECTION</p><h2>All Accessories</h2></div><span class="result-count" id="result-count"></span></div>
    <div class="men-filter-bar">
      <div class="mfb-group"><span class="mfb-label">SORT</span><select id="sort-select" class="mfb-select"><option value="">Recommended</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option></select></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">PRICE</span><div class="mfb-pills" id="price-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="0-50">Under Rs. 50</button><button class="mfb-pill" data-val="50-100">Rs. 50-Rs. 100</button><button class="mfb-pill" data-val="100-200">Rs. 100-Rs. 200</button><button class="mfb-pill" data-val="200-999">Rs. 200+</button></div></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">TYPE</span><div class="mfb-pills" id="type-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="Bags">Bags</button><button class="mfb-pill" data-val="Watches">Watches</button><button class="mfb-pill" data-val="Jewellery">Jewellery</button><button class="mfb-pill" data-val="Scarves">Scarves</button><button class="mfb-pill" data-val="Belts">Belts</button><button class="mfb-pill" data-val="Sunglasses">Sunglasses</button></div></div>
      <div class="mfb-divider"></div>
      <div class="mfb-group"><span class="mfb-label">RATING</span><div class="mfb-pills" id="rating-pills"><button class="mfb-pill active" data-val="">All</button><button class="mfb-pill" data-val="4">4★ & above</button><button class="mfb-pill" data-val="3">3★ & above</button></div></div>
    </div>
    <div class="men-product-grid" id="product-grid"></div>
    <div class="pagination-wrap" id="pagination-wrap"></div>
  </section>
</div>
`;

export default function Accessories() {
  useEffect(() => {
    let currentPage = 1;
    let currentSort = "";
    const formatINR = (value) => `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

    function getWishlist() {
      return JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
    }

    function syncWishlistHearts() {
      const wl = getWishlist();
      document.querySelectorAll(".men-wish").forEach((btn) => {
        const id = btn.dataset.id;
        const icon = btn.querySelector("i");
        if (!icon) return;
        if (wl.find((i) => i.id === id)) {
          icon.classList.replace("far", "fas");
          btn.style.color = "#e63946";
        } else {
          icon.classList.replace("fas", "far");
          btn.style.color = "";
        }
      });
    }

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
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") closeQuickView();
        });
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
      modal.querySelector("#qv-price").textContent = formatINR(p.price);
      modal.querySelector("#qv-detail-link").href = `/detail?id=${p._id}`;

      const sizesEl = modal.querySelector("#qv-sizes");
      sizesEl.innerHTML = sizes.map((s) => `<button class="qv-size${s === selectedSize ? " active" : ""}" data-size="${s}">${s}</button>`).join("");
      sizesEl.querySelectorAll(".qv-size").forEach((btn) => {
        btn.addEventListener("click", () => {
          sizesEl.querySelectorAll(".qv-size").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          selectedSize = btn.dataset.size;
        });
      });

      modal.querySelector("#qv-cart-btn").onclick = () => { addToCartShared(p._id, p.name, p.price, p.image, selectedSize); closeQuickView(); };

      const wishBtn = modal.querySelector("#qv-wish-btn");
      const inWl = getWishlist().find((i) => i.id === p._id);
      wishBtn.querySelector("i").className = inWl ? "fas fa-heart" : "far fa-heart";
      wishBtn.style.color = inWl ? "#e63946" : "";
      wishBtn.onclick = () => toggleWishlistShared(p._id, p.name, p.price, p.image);

      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeQuickView() {
      const modal = document.getElementById("qv-modal");
      if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = "";
      }
    }

    function renderCard(p) {
      const fb = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop";
      const stars = p.avgRating ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating)) : "";
      const wl = getWishlist();
      const inWl = wl.find((i) => i.id === p._id);
      return `
        <div class="men-prod-card" onclick="window.location.href='/detail?id=${p._id}'">
          <div class="men-prod-img-wrap">
            <img src="${p.image}" loading="lazy" onerror="this.onerror=null;this.src='${fb}'" />
            ${p.isFeatured ? '<span class="men-badge">NEW</span>' : ""}
            <button class="men-wish ${inWl ? "wishlisted" : ""}" data-id="${p._id}"><i class="${inWl ? "fas" : "far"} fa-heart"></i></button>
            <button class="men-quick-view" data-qv="${p._id}">QUICK VIEW</button>
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

    async function loadAccProducts() {
      const grid = document.getElementById("product-grid");
      if (!grid) return;
      grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#888;letter-spacing:2px;font-size:13px;'>LOADING...</div>";

      const sortEl = document.getElementById("sort-select");
      if (sortEl) currentSort = sortEl.value;

      const priceVal = document.querySelector("#price-pills .mfb-pill.active")?.dataset.val || "";
      const typeVal = document.querySelector("#type-pills .mfb-pill.active")?.dataset.val || "";
      const ratingVal = document.querySelector("#rating-pills .mfb-pill.active")?.dataset.val || "";

      const params = new URLSearchParams({
        page: currentPage,
        limit: 16,
        category: "Accessories",
        ...(currentSort && { sort: currentSort }),
        ...(typeVal && { subCategory: typeVal }),
      });

      try {
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        let products = data.products || [];

        if (priceVal) {
          const [min, max] = priceVal.split("-").map(Number);
          products = products.filter((p) => p.price >= min && p.price <= max);
        }
        if (ratingVal) products = products.filter((p) => p.avgRating >= Number(ratingVal));

        const countEl = document.getElementById("result-count");
        if (countEl) countEl.innerHTML = `<strong>${products.length}</strong> Products`;

        if (!data.success || !products.length) {
          grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#888;'>No products found.</div>";
          return;
        }
        grid.innerHTML = products.map(renderCard).join("");
        syncWishlistHearts();
        renderPagination(data.pages, data.page);

        grid.querySelectorAll(".men-wish").forEach((btn) => {
          const id = btn.getAttribute("data-id");
          const p = products.find((x) => x._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlistShared(p._id, p.name, p.price, p.image);
            syncWishlistHearts();
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
        grid.querySelectorAll(".men-quick-view").forEach((btn) => {
          const id = btn.getAttribute("data-qv");
          const p = products.find((x) => x._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            openQuickView(p);
          });
        });
      } catch {
        grid.innerHTML = "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#e63946;'>Failed to load.</div>";
      }
    }

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

    function renderPagination(totalPages, current) {
      const wrap = document.getElementById("pagination-wrap");
      if (!wrap || totalPages <= 1) { if (wrap) wrap.innerHTML = ""; return; }
      let html = "";
      if (current > 1) html += `<button class="page-btn" data-page="${current - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) html += `<button class="page-btn${i === current ? " active" : ""}" data-page="${i}">${i}</button>`;
        else if (i === current - 2 || i === current + 2) html += `<button class="page-btn dots">...</button>`;
      }
      if (current < totalPages) html += `<button class="page-btn" data-page="${current + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
      wrap.innerHTML = html;
      wrap.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentPage = Number(btn.getAttribute("data-page"));
          loadAccProducts();
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
    function mhStart() { mhTimer = setInterval(() => mhGoTo(mhCur + 1), 4000); }
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
          loadAccProducts();
        });
      });
    });

    window.setTypeFilter = function setTypeFilter(type) {
      document.querySelectorAll("#type-pills .mfb-pill").forEach((p) => {
        p.classList.toggle("active", p.dataset.val === type);
      });
      currentPage = 1;
      loadAccProducts();
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    };

    const sortEl = document.getElementById("sort-select");
    if (sortEl) sortEl.addEventListener("change", () => { currentPage = 1; loadAccProducts(); });

    loadAccProducts();
    loadTrendingAcc("trending-bags", "Bags");
    loadTrendingAcc("trending-jewellery", "Jewellery");

    showToast;
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
