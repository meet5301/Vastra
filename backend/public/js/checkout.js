// ─── VASTRA CHECKOUT JS ─────────────────────────────────────────────

function getCart()  { return JSON.parse(localStorage.getItem("vastra_cart") || "[]"); }
function getToken() { return localStorage.getItem("vastra_token"); }
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = "position:fixed;bottom:2rem;right:2rem;background:#000;color:#fff;padding:12px 20px;z-index:9999;font-size:14px;letter-spacing:1px;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = getCart();

  // Fill order summary from cart
  const summarySection = document.querySelector(".summary-section");
  if (summarySection && cart.length > 0) {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 3.5;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    summarySection.querySelector("p:nth-child(2) span").textContent = `Rs. ${Math.round(subtotal).toLocaleString("en-IN")}`;
    summarySection.querySelector("p:nth-child(3) span").textContent = shipping === 0 ? "FREE" : `Rs. ${Math.round(shipping).toLocaleString("en-IN")}`;
    summarySection.querySelector("h3 span").textContent = `Rs. ${Math.round(total).toLocaleString("en-IN")}`;
  }

  // Checkout button
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", placeOrder);
  }
});

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your bag is empty!");
    window.location.href = "/shop";
    return;
  }

  const firstName = document.getElementById("checkout-firstname")?.value || "";
  const lastName  = document.getElementById("checkout-lastname")?.value || "";
  const email     = document.getElementById("checkout-email")?.value || "";
  const address   = document.getElementById("checkout-address")?.value || "";
  const city      = document.getElementById("checkout-city")?.value || "Ahmedabad";
  const phone     = document.getElementById("checkout-phone")?.value || "";

  if (!address) {
    alert("Please fill in your shipping address.");
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 3.5;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const payOnDelivery = document.querySelector("input[type='checkbox']:checked");

  const orderData = {
    items: cart.map((i) => ({
      product: i.id,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
    })),
    shippingAddress: { address, city },
    guestInfo: { firstName, lastName, email, phone },
    paymentMethod: "COD",
    subtotal,
    shippingCost: shipping,
    tax,
    totalAmount: parseFloat(total.toFixed(2)),
  };

  try {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(orderData),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.removeItem("vastra_cart");
      showToast(`Order placed! ID: ${data.order._id.slice(-8).toUpperCase()}`);
      setTimeout(() => { window.location.href = "/profile"; }, 2000);
    } else {
      alert(data.message || "Failed to place order");
    }
  } catch (err) {
    alert("Server error. Please try again.");
  }
}
