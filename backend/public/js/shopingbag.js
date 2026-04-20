// ─── VASTRA SHOPPING BAG JS ────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem("vastra_cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("vastra_cart", JSON.stringify(cart));
}

function proceedToCheckout() {
  const token = localStorage.getItem("vastra_token");
  if (!token) {
    showToast("Please login to continue checkout.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
    return;
  }
  window.location.href = "/checkout";
}

function renderCart() {
  const cart = getCart();
  const container = document.querySelector(".bag-items");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-state"><h2>Your bag is empty</h2><a href="/men" class="empty-state-link">Continue Shopping</a></div>';
    return;
  }

  let subtotal = 0;
  const itemsHtml = cart
    .map((item, idx) => {
      const imageUrl = item.image?.startsWith("http") || item.image?.startsWith("https")
        ? item.image
        : item.image?.startsWith("/")
        ? item.image
        : `/${item.image}`;
      subtotal += item.price * item.quantity;
      return `
    <div class="bag-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid #eee;">
      <img src="${imageUrl}" style="width:80px;height:100px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/80x100'">
      <div style="flex:1;">
        <p style="font-weight:600;letter-spacing:1px;">${item.name}</p>
        <p style="color:#666;font-size:13px;">Size: ${item.size}</p>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
          <button onclick="changeQty(${idx}, -1)" style="width:28px;height:28px;border:1px solid #000;background:#fff;cursor:pointer;">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${idx}, 1)" style="width:28px;height:28px;border:1px solid #000;background:#fff;cursor:pointer;">+</button>
        </div>
      </div>
      <div style="text-align:right;">
        <p style="font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</p>
        <button onclick="removeItem(${idx})" style="margin-top:8px;background:none;border:none;color:#999;cursor:pointer;font-size:12px;">REMOVE</button>
      </div>
    </div>`;
    })
    .join("");

  const shipping = subtotal > 100 ? 0 : 3.5;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 320px;gap:2rem;align-items:start;">
      <div>${itemsHtml}</div>
      <div style="border:1px solid #eee;padding:1.5rem;">
        <h3 style="letter-spacing:2px;margin-bottom:1rem;">ORDER SUMMARY</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Shipping</span><span>${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span></div>
        <hr style="margin:1rem 0;">
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
        <button onclick="proceedToCheckout()" style="width:100%;padding:14px;background:#000;color:#fff;border:none;letter-spacing:2px;cursor:pointer;margin-top:1rem;font-size:14px;">
          PROCEED TO CHECKOUT
        </button>
        <a href="/men" style="display:block;text-align:center;margin-top:12px;font-size:13px;color:#666;text-decoration:underline;">Continue Shopping</a>
      </div>
    </div>`;
}

function changeQty(idx, delta) {
  const cart = getCart();
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
}

function removeItem(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
}

document.addEventListener("DOMContentLoaded", renderCart);
