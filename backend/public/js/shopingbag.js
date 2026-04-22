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
    <div class="bag-item-row">
      <img src="${imageUrl}" class="bag-item-image" onerror="this.src='/images/no-image.svg'">
      <div class="bag-item-main">
        <p class="bag-item-name">${item.name}</p>
        <p class="bag-item-size">Size: ${item.size}</p>
        <div class="bag-item-qty">
          <button type="button" onclick="changeQty(${idx}, -1)">−</button>
          <span>${item.quantity}</span>
          <button type="button" onclick="changeQty(${idx}, 1)">+</button>
        </div>
      </div>
      <div class="bag-item-side">
        <p class="bag-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
        <button type="button" class="bag-item-remove" onclick="removeItem(${idx})">REMOVE</button>
      </div>
    </div>`;
    })
    .join("");

  const shipping = subtotal > 100 ? 0 : 3.5;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="bag-layout">
      <div>${itemsHtml}</div>
      <div class="bag-summary-box">
        <h3>ORDER SUMMARY</h3>
        <div class="bag-summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="bag-summary-row"><span>Shipping</span><span>${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span></div>
        <hr>
        <div class="bag-summary-total"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
        <button type="button" onclick="proceedToCheckout()" class="bag-checkout-btn">
          PROCEED TO CHECKOUT
        </button>
        <a href="/men" class="bag-continue-link">Continue Shopping</a>
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
