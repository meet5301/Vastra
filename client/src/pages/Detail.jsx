import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../utils/toast";
import { formatINR } from "../utils/currency";

export default function Detail() {
  const [params] = useSearchParams();
  const productId = params.get("id");

  useEffect(() => {
    const container = document.querySelector(".product-container");
    if (!productId) {
      if (container) container.innerHTML = "<p style='padding:2rem;color:#c00;'>Product ID is missing.</p>";
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!data.success) {
          container.innerHTML = `<p style='padding:2rem;color:#c00;'>${data.message || "Product not found."}</p>`;
          return;
        }

        const product = data.product;
        const mainImg = product.image?.startsWith("http") ? product.image : `/${product.image}`;

        document.querySelector(".product-title").textContent = product.name || "Product";
        document.querySelector(".price").textContent = formatINR(product.price);
        document.querySelector(".description-text").textContent = product.description || "No description available.";

        const compareList = document.getElementById("compare-prices-list");
        const basePrice = Number(product.price || 0);

        function renderCompareOffers(offers) {
          if (!compareList) return;
          if (!offers || !offers.length) {
            compareList.style.display = "block";
            compareList.innerHTML = '<p style="font-size:13px;color:#777;">Admin ne abhi kisi dusri website ka real price add nahi kiya hai.</p>';
            return;
          }

          compareList.style.display = "block";

          compareList.innerHTML = offers
            .map((offer) => {
              const offerPrice = Number(offer.price || 0);
              const diff = offerPrice - basePrice;
              const diffText = Number.isFinite(diff)
                ? (diff > 0 ? `${formatINR(Math.abs(diff))} higher than Vastra` : (diff < 0 ? `${formatINR(Math.abs(diff))} lower than Vastra` : "Same as Vastra"))
                : "Price unavailable";
              return `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #eee;">
                  <div>
                    <p style="margin:0;font-weight:600;">${offer.site || "Store"}</p>
                    <p style="margin:4px 0 0;color:#666;font-size:12px;">${offer.productName || product.name}</p>
                    <p style="margin:4px 0 0;color:#888;font-size:12px;">${diffText}</p>
                  </div>
                  <div style="text-align:right;">
                    <p style="margin:0;font-weight:700;">${formatINR(offerPrice)}</p>
                    ${offer.productUrl ? `<a href="${offer.productUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#111;text-decoration:underline;">View</a>` : ""}
                  </div>
                </div>
              `;
            })
            .join("");
        }

        try {
          const compareRes = await fetch(`/api/products/${product._id}/compare-prices`);
          const compareData = await compareRes.json();
          if (compareData.success) renderCompareOffers(compareData.offers || []);
          else renderCompareOffers([]);
        } catch {
          renderCompareOffers([]);
        }

        const sizeDropdown = document.querySelector(".size-dropdown");
        if (product.sizes && product.sizes.length) {
          sizeDropdown.innerHTML = product.sizes.map((s) => `<option value="${s}">${s}</option>`).join("");
        }

        const slides = [{ img: mainImg, color: null }];
        if (product.colorImages && product.colorImages.length) {
          product.colorImages.forEach((ci) => {
            if (ci.image) slides.push({ img: ci.image, color: ci.color });
          });
        }

        const sliderTrack = document.getElementById("slider-track");
        const sliderDots = document.getElementById("slider-dots");
        const prevBtn = document.getElementById("slider-prev");
        const nextBtn = document.getElementById("slider-next");
        let current = 0;

        sliderTrack.innerHTML = slides
          .map(
            (s) => `
          <div class="slide">
            <img src="${s.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x533/cccccc/666?text=No+Image'" />
          </div>`
          )
          .join("");

        if (slides.length > 1) {
          sliderDots.innerHTML = slides
            .map((_, i) => `<button class="slider-dot${i === 0 ? " active" : ""}" data-i="${i}"></button>`)
            .join("");
          sliderDots.querySelectorAll(".slider-dot").forEach((d) =>
            d.addEventListener("click", () => goTo(Number(d.dataset.i)))
          );
          prevBtn.style.display = "flex";
          nextBtn.style.display = "flex";
        } else {
          prevBtn.style.display = "none";
          nextBtn.style.display = "none";
        }

        function goTo(idx) {
          current = (idx + slides.length) % slides.length;
          sliderTrack.style.transform = `translateX(-${current * 100}%)`;
          sliderDots.querySelectorAll(".slider-dot").forEach((d, i) =>
            d.classList.toggle("active", i === current)
          );
        }

        prevBtn.addEventListener("click", () => goTo(current - 1));
        nextBtn.addEventListener("click", () => goTo(current + 1));

        let tx = 0;
        sliderTrack.addEventListener("touchstart", (e) => {
          tx = e.touches[0].clientX;
        }, { passive: true });
        sliderTrack.addEventListener("touchend", (e) => {
          const diff = tx - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
        });

        const infoSwatches = document.getElementById("info-color-swatches");
        const colorGroup = document.getElementById("color-selection-group");

        const colorSlideMap = {};
        if (product.colorImages && product.colorImages.length) {
          product.colorImages.forEach((ci, i) => {
            colorSlideMap[ci.color] = i + 1;
          });
        }

        const colors = product.colors?.length ? product.colors : ["#111111", "#8B4513", "#1a47b8", "#00a651"];

        if (infoSwatches) {
          infoSwatches.innerHTML = colors
            .map((color, i) => {
              const bg = color.startsWith("#") || color.startsWith("rgb") ? color : color.toLowerCase();
              return `<span class="swatch${i === 0 ? " active" : ""}" style="background:${bg};" data-color="${color}" title="${color}"></span>`;
            })
            .join("");

          infoSwatches.querySelectorAll(".swatch").forEach((sw) => {
            sw.addEventListener("click", () => {
              infoSwatches.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
              sw.classList.add("active");
              const slideIdx = colorSlideMap[sw.dataset.color];
              if (slideIdx !== undefined) goTo(slideIdx);
            });
          });
        } else if (colorGroup) {
          colorGroup.style.display = "none";
        }

        const wishlistIconBtn = document.getElementById("wishlist-icon-btn");
        const wishlistToggleButton = document.querySelector(".wishlist-toggle");

        function isInWishlist() {
          return !!JSON.parse(localStorage.getItem("vastra_wishlist") || "[]").find((i) => i.id === product._id);
        }

        function updateIconState(inList) {
          if (!wishlistIconBtn) return;
          wishlistIconBtn.innerHTML = inList ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
          wishlistIconBtn.classList.toggle("active", inList);
        }

        function updateToggleBtn(inList) {
          if (!wishlistToggleButton) return;
          wishlistToggleButton.innerHTML = inList
            ? '<i class="fas fa-heart"></i> IN WISHLIST'
            : '<i class="far fa-heart"></i> ADD TO WISHLIST';
          wishlistToggleButton.classList.toggle("active", inList);
        }

        async function toggleWL() {
          const token = localStorage.getItem("vastra_token");
          if (token) {
            await fetch(`/api/auth/wishlist/${product._id}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          const wl = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
          const exists = wl.find((i) => i.id === product._id);
          if (exists) {
            localStorage.setItem("vastra_wishlist", JSON.stringify(wl.filter((i) => i.id !== product._id)));
            showToast("Removed from wishlist!");
          } else {
            wl.push({ id: product._id, name: product.name, price: product.price, image: mainImg });
            localStorage.setItem("vastra_wishlist", JSON.stringify(wl));
            showToast("Added to wishlist!");
          }
          updateIconState(!exists);
          updateToggleBtn(!exists);
        }

        updateIconState(isInWishlist());
        updateToggleBtn(isInWishlist());
        if (wishlistIconBtn) wishlistIconBtn.addEventListener("click", toggleWL);
        if (wishlistToggleButton) wishlistToggleButton.addEventListener("click", toggleWL);

        document.querySelector(".add-to-cart").addEventListener("click", () => {
          const token = localStorage.getItem("vastra_token");
          if (!token) {
            showToast("Please login to add items to bag.");
            return;
          }

          const size = sizeDropdown.value;
          const cart = JSON.parse(localStorage.getItem("vastra_cart") || "[]");
          const existing = cart.find((i) => i.id === product._id && i.size === size);
          if (existing) existing.quantity += 1;
          else cart.push({ id: product._id, name: product.name, price: product.price, image: mainImg, size, quantity: 1 });
          localStorage.setItem("vastra_cart", JSON.stringify(cart));
          showToast(`${product.name} added to bag!`);
        });

        const reviewCountEl = document.getElementById("review-count");
        const reviewsList = document.getElementById("reviews-list");
        const reviewFormWrap = document.getElementById("review-form-wrap");
        const reviewForm = document.getElementById("review-form");

        function renderReviews(reviews) {
          if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = '<p style="color:#999;font-size:14px;padding:1rem 0;">No reviews yet. Be the first!</p>';
            return;
          }
          if (reviewCountEl) reviewCountEl.textContent = `${reviews.length} Review${reviews.length > 1 ? "s" : ""}`;
          reviewsList.innerHTML = reviews
            .map(
              (r) => `
            <div class="review-card">
              <div class="review-header">
                <span class="review-author">${r.username || "Customer"}</span>
                <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
              </div>
              <p class="review-text">${r.comment}</p>
              <p class="review-date">${new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>`
            )
            .join("");
        }

        renderReviews(product.reviews || []);

        const token = localStorage.getItem("vastra_token");
        if (token && reviewFormWrap) reviewFormWrap.style.display = "block";

        if (reviewForm) {
          reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rating = document.getElementById("review-rating").value;
            const comment = document.getElementById("review-comment").value;
            const btn = reviewForm.querySelector("button[type='submit']");
            btn.textContent = "Submitting...";
            btn.disabled = true;
            try {
              const r = await fetch(`/api/products/${product._id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating: Number(rating), comment }),
              });
              const d = await r.json();
              if (d.success) {
                reviewForm.reset();
                const upd = await (await fetch(`/api/products/${product._id}`)).json();
                if (upd.success) renderReviews(upd.product.reviews || []);
                showToast("Review submitted!");
              } else {
                showToast(d.message || "Could not submit review");
              }
            } catch {
              showToast("Server error");
            }
            btn.textContent = "SUBMIT REVIEW";
            btn.disabled = false;
          });
        }
      } catch (err) {
        container.innerHTML = "<p style='padding:2rem;color:#c00;'>Failed to load product details.</p>";
      }
    }

    load();
  }, [productId]);

  return (
    <>
      <main className="product-container">
        <div className="product-image-section">
          <div className="slider-wrapper">
            <button className="wishlist-icon" id="wishlist-icon-btn" aria-label="Add to wishlist">
              <i className="far fa-heart"></i>
            </button>
            <div className="slider-track" id="slider-track">
              <div className="slide"><img src="/images/6.png" alt="Product" /></div>
            </div>
            <button className="slider-btn prev" id="slider-prev"><i className="fa-solid fa-chevron-left"></i></button>
            <button className="slider-btn next" id="slider-next"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
          <div className="slider-dots" id="slider-dots"></div>
        </div>

        <div className="product-info-section">
          <h1 className="product-title">PRODUCT NAME</h1>
          <p className="price">Rs. 0</p>
          <div className="info-divider"></div>

          <div className="selection-group" id="color-selection-group">
            <label>Colors</label>
            <div className="color-swatches" id="info-color-swatches"></div>
          </div>

          <div className="selection-group">
            <label>Size</label>
            <select className="size-dropdown">
              <option>S</option><option>M</option><option>L</option><option>XL</option>
            </select>
          </div>

          <div className="selection-group">
            <label>Description</label>
            <p className="description-text">Loading...</p>
          </div>

          <div className="selection-group">
            <label>Other Website Prices</label>
            <div id="compare-prices-list"></div>
          </div>

          <div className="info-divider"></div>
          <div className="btn-group">
            <button className="add-to-cart">ADD TO BAG</button>
            <button className="wishlist-toggle"><i className="far fa-heart"></i> ADD TO WISHLIST</button>
          </div>

          <div className="delivery-info">
            <div className="delivery-item"><i className="fa-solid fa-truck"></i><span>Free shipping on orders above Rs. 999</span></div>
            <div className="delivery-item"><i className="fa-solid fa-rotate-left"></i><span>Easy 7-day returns</span></div>
            <div className="delivery-item"><i className="fa-solid fa-shield-halved"></i><span>Secure &amp; encrypted checkout</span></div>
          </div>
        </div>
      </main>

      <hr className="divider" />
      <section className="prizes-section">
        <div className="prizes-header">
          <h2 className="section-title">REVIEWS</h2>
          <span className="view-all" id="review-count"></span>
        </div>

        <div id="review-form-wrap" style={{ display: "none" }}>
          <h3>WRITE A REVIEW</h3>
          <form id="review-form">
            <select id="review-rating" required>
              <option value="">Select Rating</option>
              <option value="5">★★★★★ Excellent (5)</option>
              <option value="4">★★★★☆ Good (4)</option>
              <option value="3">★★★☆☆ Average (3)</option>
              <option value="2">★★☆☆☆ Poor (2)</option>
              <option value="1">★☆☆☆☆ Terrible (1)</option>
            </select>
            <textarea id="review-comment" rows="3" placeholder="Share your experience..." required></textarea>
            <button type="submit">SUBMIT REVIEW</button>
          </form>
        </div>

        <div id="reviews-list"></div>
      </section>
    </>
  );
}
