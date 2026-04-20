window.addEventListener("DOMContentLoaded", async () => {
  const params    = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const container = document.querySelector(".product-container");

  if (!productId) {
    container.innerHTML = "<p style='padding:2rem;color:#c00;'>Product ID is missing.</p>";
    return;
  }

  try {
    const res  = await fetch(`/api/products/${productId}`);
    const data = await res.json();
    if (!data.success) {
      container.innerHTML = `<p style='padding:2rem;color:#c00;'>${data.message || "Product not found."}</p>`;
      return;
    }

    const product  = data.product;
    const mainImg  = product.image?.startsWith("http") ? product.image : `/${product.image}`;
    const compareList = document.getElementById("compare-prices-list");

    function formatMoney(value) {
      return typeof value === "number" ? `Rs. ${Math.round(value).toLocaleString("en-IN")}` : "Rs. 0";
    }

    function renderCompareOffers(basePrice, offers) {
      if (!compareList) return;
      if (!offers || offers.length === 0) {
        compareList.style.display = 'block';
        compareList.innerHTML = '<p class="compare-empty">Admin ne abhi kisi dusri website ka real price add nahi kiya hai.</p>';
        return;
      }

      compareList.style.display = 'grid';

      compareList.innerHTML = offers.map((offer) => {
        const hasPrice = typeof offer.price === "number";
        const hasDiff = hasPrice && typeof basePrice === "number";
        const diffValue = hasDiff ? offer.price - basePrice : null;
        const diffLabel = hasDiff
          ? (diffValue > 0
            ? `+${formatMoney(Math.abs(diffValue))} vs Vastra`
            : (diffValue < 0 ? `${formatMoney(Math.abs(diffValue))} cheaper` : "Same as Vastra"))
          : "Similar product price";

        return `
          <article class="compare-card">
            <div>
              <p class="compare-site">${offer.site || "Store"}</p>
              <p class="compare-title">${offer.productName || product.name}</p>
              <p class="compare-diff">${diffLabel}</p>
            </div>
            <div class="compare-actions">
              <p class="compare-price">${formatMoney(offer.price)}</p>
              <a class="compare-link" href="${offer.productUrl || '#'}" target="_blank" rel="noopener noreferrer">View</a>
            </div>
          </article>
        `;
      }).join("");
    }

    // ── Basic info ─────────────────────────────────────────────
    document.querySelector(".product-title").textContent    = product.name || "Product";
    document.querySelector(".price").textContent            = formatMoney(product.price);
    document.querySelector(".description-text").textContent = product.description || "No description available.";

    // ── PRICE COMPARISON ─────────────────────────────────────
    try {
      const compareRes = await fetch(`/api/products/${productId}/compare-prices`);
      const compareData = await compareRes.json();
      if (compareData.success) {
        renderCompareOffers(product.price, compareData.offers || []);
      } else {
        renderCompareOffers(product.price, []);
      }
    } catch {
      renderCompareOffers(product.price, []);
    }

    // ── Sizes ──────────────────────────────────────────────────
    const sizeDropdown = document.querySelector(".size-dropdown");
    if (product.sizes && product.sizes.length) {
      sizeDropdown.innerHTML = product.sizes.map((s) => `<option value="${s}">${s}</option>`).join("");
    }

    // ── BUILD SLIDES ───────────────────────────────────────────
    // slides = [{ img, color }]  — first slide = main image, then galleryImages, then colorImages
    const slides = [{ img: mainImg, color: null }];

    if (product.galleryImages && product.galleryImages.length) {
      product.galleryImages.forEach((img) => {
        if (!img) return;
        const normalized = img.startsWith("http") || img.startsWith("data:") ? img : `/${img}`;
        slides.push({ img: normalized, color: null });
      });
    }

    if (product.colorImages && product.colorImages.length) {
      product.colorImages.forEach((ci) => {
        if (!ci.image) return;
        const normalized = ci.image.startsWith("http") || ci.image.startsWith("data:") ? ci.image : `/${ci.image}`;
        slides.push({ img: normalized, color: ci.color });
      });
    }

    // ── SLIDER ─────────────────────────────────────────────────
    const sliderTrack = document.getElementById("slider-track");
    const sliderDots  = document.getElementById("slider-dots");
    const prevBtn     = document.getElementById("slider-prev");
    const nextBtn     = document.getElementById("slider-next");
    let current = 0;

    // Build slide HTML
    sliderTrack.innerHTML = slides.map((s) => `
      <div class="slide">
        <img src="${s.img}" alt="${product.name}"
          onerror="this.src='https://via.placeholder.com/400x533/cccccc/666?text=No+Image'" />
      </div>`).join("");

    // Build dots
    if (slides.length > 1) {
      sliderDots.innerHTML = slides.map((_, i) =>
        `<button class="slider-dot${i === 0 ? " active" : ""}" data-i="${i}"></button>`
      ).join("");
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

    // Touch swipe
    let tx = 0;
    sliderTrack.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
    sliderTrack.addEventListener("touchend", (e) => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    // ── COLOR SWATCHES ─────────────────────────────────────────
    const infoSwatches = document.getElementById("info-color-swatches");
    const colorGroup   = document.getElementById("color-selection-group");

    // Build color → slide index map
    const colorSlideMap = {};
    const galleryCount = Array.isArray(product.galleryImages) ? product.galleryImages.length : 0;
    if (product.colorImages && product.colorImages.length) {
      product.colorImages.forEach((ci, i) => {
        colorSlideMap[ci.color] = i + 1 + galleryCount; // +1 main image + gallery count
      });
    }

    const colors = (product.colors && product.colors.length)
      ? product.colors
      : ["#111111", "#8B4513", "#1a47b8", "#00a651"];

    if (infoSwatches) {
      infoSwatches.innerHTML = colors.map((color, i) => {
        const bg = (color.startsWith("#") || color.startsWith("rgb")) ? color : color.toLowerCase();
        return `<span class="swatch${i === 0 ? " active" : ""}"
          style="background:${bg};"
          data-color="${color}"
          title="${color}"></span>`;
      }).join("");

      infoSwatches.querySelectorAll(".swatch").forEach((sw) => {
        sw.addEventListener("click", () => {
          infoSwatches.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
          sw.classList.add("active");

          // Go to that color's slide
          const slideIdx = colorSlideMap[sw.dataset.color];
          if (slideIdx !== undefined) {
            goTo(slideIdx);
          }
        });
      });
    } else if (colorGroup) {
      colorGroup.style.display = "none";
    }

    // ── WISHLIST ICON ──────────────────────────────────────────
    const wishlistIconBtn      = document.getElementById("wishlist-icon-btn");
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
          method: "POST", headers: { Authorization: `Bearer ${token}` }
        });
      }
      const wl     = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
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
    if (wishlistIconBtn)      wishlistIconBtn.addEventListener("click", toggleWL);
    if (wishlistToggleButton) wishlistToggleButton.addEventListener("click", toggleWL);

    // ── ADD TO CART ────────────────────────────────────────────
    document.querySelector(".add-to-cart").addEventListener("click", () => {
      const size = sizeDropdown.value;
      const cart = JSON.parse(localStorage.getItem("vastra_cart") || "[]");
      const existing = cart.find((i) => i.id === product._id && i.size === size);
      if (existing) { existing.quantity += 1; }
      else { cart.push({ id: product._id, name: product.name, price: product.price, image: mainImg, size, quantity: 1 }); }
      localStorage.setItem("vastra_cart", JSON.stringify(cart));
      showToast(`${product.name} added to bag!`);
    });

    // ── REVIEWS ────────────────────────────────────────────────
    const reviewCountEl  = document.getElementById("review-count");
    const reviewsList    = document.getElementById("reviews-list");
    const reviewFormWrap = document.getElementById("review-form-wrap");
    const reviewForm     = document.getElementById("review-form");

    function renderReviews(reviews) {
      if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color:#999;font-size:14px;padding:1rem 0;">No reviews yet. Be the first!</p>';
        return;
      }
      if (reviewCountEl) reviewCountEl.textContent = `${reviews.length} Review${reviews.length > 1 ? "s" : ""}`;
      reviewsList.innerHTML = reviews.map((r) => `
        <div class="review-card">
          <div class="review-header">
            <span class="review-author">${r.username || "Customer"}</span>
            <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
          </div>
          <p class="review-text">${r.comment}</p>
          <p class="review-date">${new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>`).join("");
    }

    renderReviews(product.reviews || []);

    const token = localStorage.getItem("vastra_token");
    if (token && reviewFormWrap) reviewFormWrap.style.display = "block";

    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const rating  = document.getElementById("review-rating").value;
        const comment = document.getElementById("review-comment").value;
        const btn = reviewForm.querySelector("button[type='submit']");
        btn.textContent = "Submitting..."; btn.disabled = true;
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
        } catch { showToast("Server error"); }
        btn.textContent = "SUBMIT REVIEW"; btn.disabled = false;
      });
    }

  } catch (err) {
    container.innerHTML = "<p style='padding:2rem;color:#c00;'>Failed to load product details.</p>";
  }
});
