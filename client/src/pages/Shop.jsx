import { useEffect } from "react";
import { addToCartShared, toggleWishlistShared } from "../utils/shop";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../utils/currency";

export default function Shop() {
  const navigate = useNavigate();

  useEffect(() => {
    let currentPage = 1;
    let currentCategory = "All";
    let currentSearch = "";
    let currentSort = "";
    let currentPriceRange = "";

    async function loadProducts() {
      const grid = document.getElementById("product-grid");
      if (!grid) return;

      grid.innerHTML =
        "<div style='grid-column:1/-1;text-align:center;padding:60px 0;color:#888;font-family:Inter,sans-serif;letter-spacing:2px;font-size:13px;'>LOADING...</div>";

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
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();

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

        let products = data.products;
        if (currentPriceRange) {
          const [min, max] = currentPriceRange.split("-").map(Number);
          products = products.filter((p) => p.price >= min && p.price <= max);
        }

        const fallbacks = {
          Men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop",
          Women: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          Accessories: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
          Other: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
        };

        grid.innerHTML = products
          .map((p) => {
            const fallback = fallbacks[p.category] || fallbacks.Other;
            const stars = p.avgRating
              ? "★".repeat(Math.round(p.avgRating)) + "☆".repeat(5 - Math.round(p.avgRating))
              : "";
            const reviewCount = p.numReviews || 0;
            return `
            <div class="product-card" data-id="${p._id}">
              <div class="product-image-wrapper">
                <img src="${p.image}" loading="lazy" class="product-img"
                  onerror="this.onerror=null;this.src='${fallback}'" />
                ${p.isFeatured ? '<span class="product-badge">NEW</span>' : ""}
                <button class="wishlist-btn" data-wish-id="${p._id}">
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
                <div class="price-row"><span class="price">${formatINR(p.price)}</span></div>
                <button class="add-to-cart-btn" data-cart-id="${p._id}">
                  ADD TO BAG
                </button>
              </div>
            </div>`;
          })
          .join("");

        grid.querySelectorAll(".product-card").forEach((card) => {
          const id = card.getAttribute("data-id");
          card.addEventListener("click", () => navigate(`/detail?id=${id}`));
        });
        grid.querySelectorAll(".wishlist-btn").forEach((btn) => {
          const id = btn.getAttribute("data-wish-id");
          const p = products.find((x) => x._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlistShared(p._id, p.name, p.price, p.image);
          });
        });
        grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
          const id = btn.getAttribute("data-cart-id");
          const p = products.find((x) => x._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCartShared(p._id, p.name, p.price, p.image);
          });
        });

        renderPagination(data.pages, data.page);
      } catch (err) {
        grid.innerHTML =
          "<div style='grid-column:1/-1;text-align:center;padding:60px;color:#e63946;'>Failed to load products. Please try again.</div>";
      }
    }

    async function loadPlacement() {
      try {
        const res = await fetch("/api/placements/shop-spotlight");
        const data = await res.json();
        const section = document.getElementById("shop-placement");
        const titleEl = document.getElementById("shop-placement-title");
        const grid = document.getElementById("shop-placement-grid");
        if (!section || !grid || !data.success || !data.placement) {
          if (section) section.style.display = "none";
          return;
        }

        const placement = data.placement;
        const products = placement.productIds || [];
        if (!products.length) {
          section.style.display = "none";
          return;
        }

        section.style.display = "block";
        if (titleEl) titleEl.textContent = placement.title || "SPOTLIGHT";
        grid.innerHTML = products
          .map(
            (p) => `
            <div class="prod-card" data-id="${p._id}">
              <div class="prod-img-wrap">
                <img src="${p.image}" loading="lazy" class="product-img"
                  onerror="this.onerror=null;this.src='https://via.placeholder.com/300x400/cccccc/666?text=No+Image'" />
              </div>
              <div class="prod-info">
                <p class="prod-name">${p.name}</p>
                <p class="prod-price">${formatINR(p.price)}</p>
                <button class="prod-cart" data-cart-id="${p._id}">ADD TO BAG</button>
              </div>
            </div>`
          )
          .join("");

        grid.querySelectorAll(".prod-card").forEach((card) => {
          const id = card.getAttribute("data-id");
          card.addEventListener("click", () => navigate(`/detail?id=${id}`));
        });
        grid.querySelectorAll(".prod-cart").forEach((btn) => {
          const id = btn.getAttribute("data-cart-id");
          const product = products.find((p) => p._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCartShared(product._id, product.name, product.price, product.image);
          });
        });
      } catch {
        const section = document.getElementById("shop-placement");
        if (section) section.style.display = "none";
      }
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
          loadProducts();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }

    function setView(v) {
      const grid = document.getElementById("product-grid");
      grid.className = `product-grid${v === "list" ? " list-view" : ""}`;
      document.getElementById("view-grid").classList.toggle("active", v === "grid");
      document.getElementById("view-list").classList.toggle("active", v === "list");
    }

    function openSidebar() {
      document.getElementById("shop-sidebar").classList.add("open");
      document.getElementById("sidebar-overlay").classList.add("show");
    }
    function closeSidebar() {
      document.getElementById("shop-sidebar").classList.remove("open");
      document.getElementById("sidebar-overlay").classList.remove("show");
    }

    const sortEl = document.getElementById("sort-select");
    if (sortEl) sortEl.addEventListener("change", () => { currentPage = 1; loadProducts(); });

    const searchEl = document.getElementById("shop-search-input");
    if (searchEl) {
      let t;
      searchEl.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => { currentPage = 1; loadProducts(); }, 350);
      });
    }

    document.querySelectorAll('input[name="category"]').forEach((r) => {
      r.addEventListener("change", () => { currentPage = 1; loadProducts(); });
    });
    document.querySelectorAll('input[name="price"]').forEach((r) => {
      r.addEventListener("change", () => { currentPage = 1; loadProducts(); });
    });

    document.getElementById("filter-toggle-btn")?.addEventListener("click", openSidebar);
    document.getElementById("sidebar-close")?.addEventListener("click", closeSidebar);
    document.getElementById("sidebar-overlay")?.addEventListener("click", closeSidebar);

    document.getElementById("view-grid")?.addEventListener("click", () => setView("grid"));
    document.getElementById("view-list")?.addEventListener("click", () => setView("list"));

    document.getElementById("af-clear")?.addEventListener("click", () => {
      document.querySelectorAll('input[name="category"]').forEach((r) => (r.checked = r.value === "All"));
      document.querySelectorAll('input[name="price"]').forEach((r) => (r.checked = r.value === ""));
      currentPage = 1;
      loadProducts();
    });

    document.getElementById("apply-filters-btn")?.addEventListener("click", () => {
      closeSidebar();
      loadProducts();
    });

    loadProducts();
    loadPlacement();

    return () => {
      showToast;
    };
  }, [navigate]);

  return (
    <>
      <div className="shop-hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop&q=90')" }}>
        <div className="shop-hero-content">
          <p className="shop-hero-tag"><span className="gold-line"></span> VASTRA COLLECTION <span className="gold-line"></span></p>
          <h1 className="shop-hero-title">NEW ARRIVALS</h1>
          <p className="shop-hero-sub">Premium fashion — curated for the modern wardrobe</p>
        </div>
      </div>

      <section className="shop-placement" id="shop-placement" style={{ display: "none" }}>
        <div className="shop-placement-inner">
          <div className="shop-placement-header">
            <div>
              <p className="shop-placement-tag">FEATURED DROP</p>
              <h2 id="shop-placement-title">SPOTLIGHT</h2>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/shop")}
              >VIEW ALL <i className="fa-solid fa-arrow-right"></i></button>
          </div>
          <div className="product-scroll" id="shop-placement-grid"></div>
        </div>
      </section>

      <div className="active-filters-bar" id="active-filters-bar" style={{ display: "none" }}>
        <span className="af-label">FILTERS:</span>
        <div className="af-tags" id="af-tags"></div>
        <button className="af-clear" id="af-clear">CLEAR ALL</button>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar" id="shop-sidebar">
          <div className="sidebar-header">
            <h2>FILTERS</h2>
            <button className="sidebar-close" id="sidebar-close"><i className="fa-solid fa-xmark"></i></button>
          </div>

          <div className="filter-block">
            <div className="shop-search-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="shop-search-input" placeholder="Search products..." />
            </div>
          </div>

          <div className="filter-block">
            <div className="filter-block-header">
              <h4>CATEGORY</h4>
              <i className="fa-solid fa-chevron-down" id="cat-icon"></i>
            </div>
            <div className="filter-block-body" id="cat-body">
              <label className="filter-radio"><input type="radio" name="category" value="All" defaultChecked /> <span>All</span></label>
              <label className="filter-radio"><input type="radio" name="category" value="Men" /> <span>Men</span></label>
              <label className="filter-radio"><input type="radio" name="category" value="Women" /> <span>Women</span></label>
              <label className="filter-radio"><input type="radio" name="category" value="Accessories" /> <span>Accessories</span></label>
            </div>
          </div>

          <div className="filter-block">
            <div className="filter-block-header">
              <h4>PRICE RANGE</h4>
              <i className="fa-solid fa-chevron-down" id="price-icon"></i>
            </div>
            <div className="filter-block-body" id="price-body">
              <label className="filter-radio"><input type="radio" name="price" value="" defaultChecked /> <span>All Prices</span></label>
              <label className="filter-radio"><input type="radio" name="price" value="0-50" /> <span>Under Rs. 50</span></label>
              <label className="filter-radio"><input type="radio" name="price" value="50-100" /> <span>Rs. 50 - Rs. 100</span></label>
              <label className="filter-radio"><input type="radio" name="price" value="100-200" /> <span>Rs. 100 - Rs. 200</span></label>
              <label className="filter-radio"><input type="radio" name="price" value="200-999" /> <span>Above Rs. 200</span></label>
            </div>
          </div>

          <div className="filter-block">
            <div className="filter-block-header">
              <h4>TYPE</h4>
              <i className="fa-solid fa-chevron-down" id="sub-icon"></i>
            </div>
            <div className="filter-block-body" id="sub-body">
              <label className="filter-check"><input type="checkbox" value="Blazers" /> <span>Blazers</span></label>
              <label className="filter-check"><input type="checkbox" value="Shirts" /> <span>Shirts</span></label>
              <label className="filter-check"><input type="checkbox" value="Dresses" /> <span>Dresses</span></label>
              <label className="filter-check"><input type="checkbox" value="Jackets" /> <span>Jackets</span></label>
              <label className="filter-check"><input type="checkbox" value="Trousers" /> <span>Trousers</span></label>
              <label className="filter-check"><input type="checkbox" value="Coats" /> <span>Coats</span></label>
              <label className="filter-check"><input type="checkbox" value="Bags" /> <span>Bags</span></label>
              <label className="filter-check"><input type="checkbox" value="Scarves" /> <span>Scarves</span></label>
            </div>
          </div>

          <div className="filter-block">
            <div className="filter-block-header">
              <h4>RATING</h4>
              <i className="fa-solid fa-chevron-down" id="rating-icon"></i>
            </div>
            <div className="filter-block-body" id="rating-body">
              <label className="filter-radio"><input type="radio" name="rating" value="" defaultChecked /> <span>All Ratings</span></label>
              <label className="filter-radio"><input type="radio" name="rating" value="4" /> <span>★★★★☆ 4+ Stars</span></label>
              <label className="filter-radio"><input type="radio" name="rating" value="3" /> <span>★★★☆☆ 3+ Stars</span></label>
            </div>
          </div>

          <button className="apply-filters-btn" id="apply-filters-btn">APPLY FILTERS</button>
        </aside>

        <div className="sidebar-overlay" id="sidebar-overlay"></div>

        <main className="shop-main">
          <div className="shop-topbar">
            <div className="topbar-left">
              <button className="filter-toggle-btn" id="filter-toggle-btn"><i className="fa-solid fa-sliders"></i> FILTERS</button>
              <span className="result-count" id="result-count">Loading...</span>
            </div>
            <div className="topbar-right">
              <div className="sort-wrap">
                <label>SORT BY</label>
                <select id="sort-select">
                  <option value="">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
              <div className="view-toggle">
                <button className="view-btn active" id="view-grid"><i className="fa-solid fa-grip"></i></button>
                <button className="view-btn" id="view-list"><i className="fa-solid fa-list"></i></button>
              </div>
            </div>
          </div>

          <div className="product-grid" id="product-grid"></div>
          <div className="pagination-wrap" id="pagination-wrap"></div>
        </main>
      </div>
    </>
  );
}
