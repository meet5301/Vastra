import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addToCartShared, toggleWishlistShared } from "../utils/shop";
import { formatINR } from "../utils/currency";

export default function Home() {
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    const track = document.getElementById("hero-track");
    const dots = document.querySelectorAll(".hero-dot");
    const slides = document.querySelectorAll(".hero-slide");
    const progBar = document.getElementById("hero-progress-bar");
    const curEl = document.getElementById("hero-cur");
    if (!track || slides.length === 0) return;

    let cur = 0;

    function heroGoTo(idx) {
      cur = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === cur));
      if (curEl) curEl.textContent = String(cur + 1).padStart(2, "0");
      if (progBar) {
        progBar.style.transition = "none";
        progBar.style.width = "0%";
        requestAnimationFrame(() => {
          progBar.style.transition = "width 4.5s linear";
          progBar.style.width = "100%";
        });
      }
    }

    function startAuto() {
      heroGoTo(cur);
      intervalRef.current = setInterval(() => heroGoTo(cur + 1), 4500);
    }
    function stopAuto() {
      clearInterval(intervalRef.current);
    }

    const prevBtn = document.getElementById("hero-prev");
    const nextBtn = document.getElementById("hero-next");
    if (prevBtn) prevBtn.addEventListener("click", () => { stopAuto(); heroGoTo(cur - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { stopAuto(); heroGoTo(cur + 1); startAuto(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { stopAuto(); heroGoTo(i); startAuto(); }));

    let hx = 0;
    track.addEventListener("touchstart", (e) => { hx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      const diff = hx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); heroGoTo(diff > 0 ? cur + 1 : cur - 1); startAuto(); }
    });

    startAuto();

    return () => {
      stopAuto();
      if (prevBtn) prevBtn.replaceWith(prevBtn.cloneNode(true));
      if (nextBtn) nextBtn.replaceWith(nextBtn.cloneNode(true));
    };
  }, []);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const res = await fetch("/api/products/featured");
        const data = await res.json();
        const grid = document.getElementById("featured-grid");
        if (!grid || !data.products || !data.products.length) return;
        grid.innerHTML = data.products
          .map(
            (p) => `
            <div class="prod-card" data-id="${p._id}">
              <div class="prod-img-wrap">
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/300x400/cccccc/666?text=No+Image'" loading="lazy" />
                <button class="prod-wish" data-wish-id="${p._id}">
                  <i class="far fa-heart"></i>
                </button>
                ${p.isFeatured ? '<span class="prod-badge">NEW</span>' : ""}
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
        grid.querySelectorAll(".prod-wish").forEach((btn) => {
          const id = btn.getAttribute("data-wish-id");
          const product = data.products.find((p) => p._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlistShared(product._id, product.name, product.price, product.image);
          });
        });
        grid.querySelectorAll(".prod-cart").forEach((btn) => {
          const id = btn.getAttribute("data-cart-id");
          const product = data.products.find((p) => p._id === id);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCartShared(product._id, product.name, product.price, product.image);
          });
        });
      } catch {
        return;
      }
    }

    loadFeaturedProducts();
  }, [navigate]);

  useEffect(() => {
    async function loadPromoCoupon() {
      try {
        const res = await fetch("/api/coupons/public/active");
        const data = await res.json();
        const codeEl = document.getElementById("promo-code");
        const titleEl = document.getElementById("promo-title");
        if (!codeEl || !titleEl) return;

        if (data.success && data.coupons && data.coupons.length > 0) {
          const c = data.coupons[0];
          const valueLabel = c.type === "percent" ? `${c.value}% OFF` : `${formatINR(c.value)} OFF`;
          titleEl.textContent = valueLabel;
          codeEl.textContent = c.code;
        } else {
          titleEl.textContent = "NO ACTIVE OFFERS";
          codeEl.textContent = "—";
        }
      } catch {
        const codeEl = document.getElementById("promo-code");
        const titleEl = document.getElementById("promo-title");
        if (codeEl) codeEl.textContent = "—";
        if (titleEl) titleEl.textContent = "NO ACTIVE OFFERS";
      }
    }

    async function loadPlacement() {
      try {
        const res = await fetch("/api/placements/home-spotlight");
        const data = await res.json();
        const section = document.getElementById("placement-section");
        const titleEl = document.getElementById("placement-title");
        const grid = document.getElementById("placement-grid");
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
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/300x400/cccccc/666?text=No+Image'" loading="lazy" />
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
        const section = document.getElementById("placement-section");
        if (section) section.style.display = "none";
      }
    }

    loadPromoCoupon();
    loadPlacement();
  }, [navigate]);

  return (
    <>
      <div className="offer-strip">
        <div className="offer-track">
            <span>🚚 FREE SHIPPING ON ORDERS ABOVE Rs. 999</span>
          <span>✨ NEW ARRIVALS EVERY WEEK</span>
          <span>🔒 SECURE PAYMENTS</span>
          <span>↩️ EASY 7-DAY RETURNS</span>
            <span>🚚 FREE SHIPPING ON ORDERS ABOVE Rs. 999</span>
          <span>✨ NEW ARRIVALS EVERY WEEK</span>
          <span>🔒 SECURE PAYMENTS</span>
          <span>↩️ EASY 7-DAY RETURNS</span>
        </div>
      </div>

      <section className="hero-slider">
        <div className="hero-track" id="hero-track">
          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&q=90')",
            }}
          >
            <div className="hero-bg-overlay"></div>
            <div className="hero-content">
              <p className="hero-tag"><span className="gold-line"></span> NEW SEASON 2025 <span className="gold-line"></span></p>
              <h1 className="hero-h1">VASTRA.</h1>
              <h2 className="hero-h2">Redefine Your Style</h2>
              <p className="hero-sub">Premium fashion for the modern wardrobe</p>
              <div className="hero-btns">
                <button onClick={() => navigate("/shop")} className="btn-hero-primary">SHOP NOW</button>
                <button onClick={() => navigate("/categories")} className="btn-hero-outline">EXPLORE</button>
              </div>
            </div>
          </div>

          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&h=900&fit=crop&q=90')",
            }}
          >
            <div className="hero-bg-overlay"></div>
            <div className="hero-content">
              <p className="hero-tag"><span className="gold-line"></span> MEN'S EDIT <span className="gold-line"></span></p>
              <h1 className="hero-h1">BOLD.</h1>
              <h2 className="hero-h2">Minimal. Powerful.</h2>
              <p className="hero-sub">Curated menswear for every occasion</p>
              <div className="hero-btns">
                <button onClick={() => navigate("/men")} className="btn-hero-primary">SHOP MEN</button>
                <button onClick={() => navigate("/categories")} className="btn-hero-outline">VIEW ALL</button>
              </div>
            </div>
          </div>

          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&h=900&fit=crop&q=90')",
            }}
          >
            <div className="hero-bg-overlay"></div>
            <div className="hero-content">
              <p className="hero-tag"><span className="gold-line"></span> WOMEN'S COLLECTION <span className="gold-line"></span></p>
              <h1 className="hero-h1">ELEGANT.</h1>
              <h2 className="hero-h2">Timeless Fashion</h2>
              <p className="hero-sub">Discover the latest women's trends</p>
              <div className="hero-btns">
                <button onClick={() => navigate("/women")} className="btn-hero-primary">SHOP WOMEN</button>
                <button onClick={() => navigate("/categories")} className="btn-hero-outline">VIEW ALL</button>
              </div>
            </div>
          </div>

          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&q=90')",
            }}
          >
            <div className="hero-bg-overlay"></div>
            <div className="hero-content">
              <p className="hero-tag"><span className="gold-line"></span> ACCESSORIES <span className="gold-line"></span></p>
              <h1 className="hero-h1">COMPLETE.</h1>
              <h2 className="hero-h2">Your Look Today</h2>
              <p className="hero-sub">Bags, scarves, jewelry &amp; more</p>
              <div className="hero-btns">
                <button onClick={() => navigate("/accessories")} className="btn-hero-primary">SHOP NOW</button>
                <button onClick={() => navigate("/categories")} className="btn-hero-outline">EXPLORE</button>
              </div>
            </div>
          </div>
        </div>

        <button className="hero-arrow prev" id="hero-prev"><i className="fa-solid fa-chevron-left"></i></button>
        <button className="hero-arrow next" id="hero-next"><i className="fa-solid fa-chevron-right"></i></button>
        <div className="hero-progress"><div className="hero-progress-bar" id="hero-progress-bar"></div></div>
        <div className="hero-dots" id="hero-dots">
          <button className="hero-dot active"></button>
          <button className="hero-dot"></button>
          <button className="hero-dot"></button>
          <button className="hero-dot"></button>
        </div>
        <div className="hero-counter"><span id="hero-cur">01</span> / <span>04</span></div>
      </section>

      <section className="cat-strip">
        <div className="cat-strip-inner">
          <div className="cat-chip" onClick={() => navigate("/kids")}
            ><div className="cat-chip-img" style={{ background: "url('https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=120&h=120&fit=crop') center/cover" }}></div><span>KIDS</span></div>
          <div className="cat-chip" onClick={() => navigate("/men")}
            ><div className="cat-chip-img" style={{ background: "url('https://images.unsplash.com/photo-1617137968427-85924c800a22?w=120&h=120&fit=crop') center/cover" }}></div><span>MEN</span></div>
          <div className="cat-chip" onClick={() => navigate("/women")}
            ><div className="cat-chip-img" style={{ background: "url('https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=120&h=120&fit=crop') center/cover" }}></div><span>WOMEN</span></div>
          <div className="cat-chip" onClick={() => navigate("/accessories")}
            ><div className="cat-chip-img" style={{ background: "url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop') center/cover" }}></div><span>ACCESSORIES</span></div>
          <div className="cat-chip" onClick={() => navigate("/shop")}
            ><div className="cat-chip-img" style={{ background: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=120&h=120&fit=crop') center/cover" }}></div><span>UNDER Rs. 4,999</span></div>
          <div className="cat-chip" onClick={() => navigate("/shop")}
            ><div className="cat-chip-img" style={{ background: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=120&h=120&fit=crop') center/cover" }}></div><span>NEW IN</span></div>
        </div>
      </section>

      <section className="banner-row">
        <div className="banner-card banner-large" onClick={() => navigate("/women")}
          ><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=700&fit=crop&q=85" alt="Women" />
          <div className="banner-overlay"><p className="banner-tag">WOMEN'S EDIT</p><h3>New Season<br />Arrivals</h3><button>SHOP NOW</button></div>
        </div>
        <div className="banner-col">
          <div className="banner-card" onClick={() => navigate("/men")}
            ><img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&h=320&fit=crop&q=85" alt="Men" />
            <div className="banner-overlay"><p className="banner-tag">MEN</p><h3>Premium<br />Blazers</h3><button>EXPLORE</button></div>
          </div>
          <div className="banner-card" onClick={() => navigate("/accessories")}
            ><img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=320&fit=crop&q=85" alt="Accessories" />
            <div className="banner-overlay"><p className="banner-tag">ACCESSORIES</p><h3>Bags &amp;<br />Scarves</h3><button>SHOP NOW</button></div>
          </div>
        </div>
      </section>

      <div className="page-container">
        <section className="home-section">
          <div className="section-header">
            <div>
              <p className="section-tag">HANDPICKED FOR YOU</p>
              <h2 className="section-title">NEW ARRIVALS</h2>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/shop")}
              >VIEW ALL <i className="fa-solid fa-arrow-right"></i></button>
          </div>
          <div className="product-scroll" id="featured-grid"></div>
        </section>

        <section className="promo-banner">
          <div className="promo-text">
            <p className="promo-tag">LIMITED TIME</p>
            <h2 id="promo-title">FLAT 20% OFF</h2>
            <p>On your first order. Use code <strong id="promo-code">VASTRA20</strong></p>
            <button onClick={() => navigate("/shop")}>CLAIM OFFER</button>
          </div>
          <div className="promo-img">
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop&q=85" alt="Promo" />
          </div>
        </section>

        <section className="home-section" id="placement-section" style={{ display: "none" }}>
          <div className="section-header">
            <div>
              <p className="section-tag">FEATURED</p>
              <h2 className="section-title" id="placement-title">SPOTLIGHT</h2>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/shop")}
              >VIEW ALL <i className="fa-solid fa-arrow-right"></i></button>
          </div>
          <div className="product-scroll" id="placement-grid"></div>
        </section>

        <section className="home-section">
          <div className="section-header">
            <div>
              <p className="section-tag">BROWSE BY</p>
              <h2 className="section-title">CATEGORIES</h2>
            </div>
          </div>
          <div className="cat-banners">
            <div className="cat-banner" onClick={() => navigate("/men")}
              ><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&q=85" alt="Men" />
              <div className="cat-banner-overlay"><h3>MEN</h3><p>Blazers, Shirts, Trousers</p><span>SHOP →</span></div>
            </div>
            <div className="cat-banner" onClick={() => navigate("/women")}
              ><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&h=600&fit=crop&q=85" alt="Women" />
              <div className="cat-banner-overlay"><h3>WOMEN</h3><p>Dresses, Coats, Blouses</p><span>SHOP →</span></div>
            </div>
            <div className="cat-banner" onClick={() => navigate("/accessories")}
              ><img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop&q=85" alt="Accessories" />
              <div className="cat-banner-overlay"><h3>ACCESSORIES</h3><p>Bags, Scarves, Jewelry</p><span>SHOP →</span></div>
            </div>
          </div>
        </section>

        <section className="why-vastra">
          <div className="why-item"><div className="why-icon"><i className="fa-solid fa-truck-fast"></i></div><h4>FREE SHIPPING</h4><p>On all orders above Rs. 999</p></div>
          <div className="why-item"><div className="why-icon"><i className="fa-solid fa-rotate-left"></i></div><h4>EASY RETURNS</h4><p>7-day hassle-free returns</p></div>
          <div className="why-item"><div className="why-icon"><i className="fa-solid fa-shield-halved"></i></div><h4>SECURE PAYMENT</h4><p>100% safe &amp; encrypted</p></div>
          <div className="why-item"><div className="why-icon"><i className="fa-solid fa-headset"></i></div><h4>24/7 SUPPORT</h4><p>Always here to help you</p></div>
          <div className="why-item"><div className="why-icon"><i className="fa-solid fa-star"></i></div><h4>PREMIUM QUALITY</h4><p>Curated &amp; quality checked</p></div>
        </section>

        <section className="home-section">
          <div className="section-header">
            <div><p className="section-tag">INSPIRATION</p><h2 className="section-title">STYLE JOURNAL</h2></div>
            <button className="view-all-btn" onClick={() => navigate("/journal")}
              >READ MORE <i className="fa-solid fa-arrow-right"></i></button>
          </div>
          <div className="journal-grid">
            <div className="journal-card">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=260&fit=crop&q=85" alt="Journal" />
              <div className="journal-info"><span className="journal-tag">STYLE TIPS</span><h4>How to Build a Capsule Wardrobe</h4><p>Minimal pieces, maximum outfits. The art of dressing well.</p></div>
            </div>
            <div className="journal-card">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=260&fit=crop&q=85" alt="Journal" />
              <div className="journal-info"><span className="journal-tag">TRENDS</span><h4>Top 5 Trends This Season</h4><p>From oversized blazers to earth tones — what's in right now.</p></div>
            </div>
            <div className="journal-card">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=260&fit=crop&q=85" alt="Journal" />
              <div className="journal-info"><span className="journal-tag">GUIDE</span><h4>Dressing for Every Occasion</h4><p>Office, casual, evening — your complete style guide.</p></div>
            </div>
          </div>
        </section>

        <section className="our-story">
          <div className="story-img-wrap">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=520&fit=crop&q=85" alt="Our Story" />
          </div>
          <div className="story-content">
            <p className="section-tag">ABOUT US</p>
            <h2>OUR STORY</h2>
            <p>VASTRA was born from a simple belief — that great fashion should be accessible, sustainable, and timeless. We curate premium clothing that blends modern aesthetics with everyday comfort.</p>
            <p>Every piece in our collection is carefully selected to ensure quality, fit, and style that lasts beyond seasons.</p>
            <button onClick={() => navigate("/about")}>LEARN MORE <i className="fa-solid fa-arrow-right"></i></button>
          </div>
        </section>
      </div>
    </>
  );
}
