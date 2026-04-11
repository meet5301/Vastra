window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const container = document.querySelector(".product-container");
  const titleEl = document.querySelector(".product-title");
  const priceEl = document.querySelector(".price");
  const descriptionEl = document.querySelector(".description-text");
  const mainImage = document.querySelector(".main-image-card img");
  const wishlistIcon = document.querySelector(".wishlist-icon");
  const swatchRow = document.querySelector(".thumbnail-row");
  const sizeDropdown = document.querySelector(".size-dropdown");
  const addToCartButton = document.querySelector(".add-to-cart");
  const wishlistToggleButton = document.querySelector(".wishlist-toggle");

  if (!productId) {
    container.innerHTML = "<p style='padding:2rem;color:#c00;'>Product ID is missing.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();
    if (!data.success) {
      container.innerHTML = `<p style='padding:2rem;color:#c00;'>${data.message || "Product not found."}</p>`;
      return;
    }

    const product = data.product;
    const imageUrl = product.image?.startsWith("/") ? product.image : product.image;

    titleEl.textContent = product.name || "Product Detail";
    priceEl.textContent = `$${product.price?.toFixed?.(2) ?? product.price}`;
    descriptionEl.textContent = product.description || "No description available.";
    mainImage.src = imageUrl;
    mainImage.alt = product.name || "Product image";
    mainImage.onerror = () => { mainImage.src = 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image'; };

    if (product.colors && product.colors.length) {
      swatchRow.innerHTML = product.colors
        .slice(0, 6)
        .map((color) => `<span class="swatch" style="background:${color.toLowerCase()};"></span>`)
        .join("");
    }

    if (product.sizes && product.sizes.length) {
      sizeDropdown.innerHTML = product.sizes
        .map((size) => `<option value="${size}">${size}</option>`)
        .join("\n");
    }

    addToCartButton.addEventListener("click", () => {
      const size = sizeDropdown.value;
      const cart = JSON.parse(localStorage.getItem("vastra_cart") || "[]");
      const existing = cart.find((item) => item.id === product._id && item.size === size);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id: product._id, name: product.name, price: product.price, image: imageUrl, size, quantity: 1 });
      }
      localStorage.setItem("vastra_cart", JSON.stringify(cart));
      alert(`${product.name} added to bag.`);
    });

    // OLD wishlist icon handler
    if (wishlistIcon) {
      wishlistIcon.addEventListener("click", () => {
        const wishlist = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
        const exists = wishlist.find((item) => item.id === product._id);
        if (exists) {
          const index = wishlist.indexOf(exists);
          wishlist.splice(index, 1);
          wishlistIcon.classList.remove("active");
          alert("Removed from wishlist!");
        } else {
          wishlist.push({ id: product._id, name: product.name, price: product.price, image: imageUrl });
          wishlistIcon.classList.add("active");
          alert("Added to wishlist!");
        }
        localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist));
      });
    }

    // NEW wishlist button handler
    if (wishlistToggleButton) {
      wishlistToggleButton.addEventListener("click", () => {
        const wishlist = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
        const exists = wishlist.find((item) => item.id === product._id);
        if (exists) {
          const index = wishlist.indexOf(exists);
          wishlist.splice(index, 1);
          wishlistToggleButton.classList.remove("active");
          wishlistToggleButton.innerHTML = '<i class="far fa-heart"></i> ADD TO WISHLIST';
          alert("Removed from wishlist!");
        } else {
          wishlist.push({ id: product._id, name: product.name, price: product.price, image: imageUrl });
          wishlistToggleButton.classList.add("active");
          wishlistToggleButton.innerHTML = '<i class="fas fa-heart"></i> IN WISHLIST';
          alert("Added to wishlist!");
        }
        localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist));
      });
      
      // Show current status on load
      const wishlist = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
      if (wishlist.find((item) => item.id === product._id)) {
        wishlistToggleButton.classList.add("active");
        wishlistToggleButton.innerHTML = '<i class="fas fa-heart"></i> IN WISHLIST';
      }
    }
  } catch (err) {
    container.innerHTML = "<p style='padding:2rem;color:#c00;'>Failed to load product details.</p>";
  }
});