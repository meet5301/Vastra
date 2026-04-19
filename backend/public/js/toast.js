// ─── VASTRA SHARED TOAST ──────────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById("vastra-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "vastra-toast";
    t.style.cssText = "position:fixed;bottom:2rem;right:2rem;background:#000;color:#fff;padding:12px 22px;z-index:99999;font-size:13px;letter-spacing:1px;opacity:0;transition:opacity 0.3s;pointer-events:none;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = "0"; }, 2500);
}

function addToCartShared(id, name, price, image, size = "M") {
  const cart = JSON.parse(localStorage.getItem("vastra_cart") || "[]");
  const existing = cart.find((i) => i.id === id && i.size === size);
  if (existing) { existing.quantity += 1; }
  else { cart.push({ id, name, price, image, size, quantity: 1 }); }
  localStorage.setItem("vastra_cart", JSON.stringify(cart));
  showToast(`${name} added to bag!`);
}

async function toggleWishlistShared(id, name, price, image) {
  const token = localStorage.getItem("vastra_token");
  if (token) {
    await fetch(`/api/auth/wishlist/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  }
  const wishlist = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
  const exists = wishlist.find((item) => item.id === id);
  if (exists) {
    localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist.filter((item) => item.id !== id)));
    showToast(`${name} removed from wishlist`);
  } else {
    wishlist.push({ id, name, price, image });
    localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist));
    showToast(`${name} added to wishlist!`);
  }
}
