// ─── VASTRA CHECKOUT JS ─────────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem("vastra_cart") || "[]");
}
function getToken() {
  return localStorage.getItem("vastra_token");
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

    summarySection.querySelector("p:nth-child(2) span").textContent = `$${subtotal.toFixed(2)}`;
    summarySection.querySelector("p:nth-child(3) span").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    summarySection.querySelector("h3 span").textContent = `$${total.toFixed(2)}`;
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

  const firstName = document.querySelector("input[placeholder='First name'], input:nth-of-type(1)")?.value || "";
  const lastName = document.querySelector("input[placeholder='Last name'], input:nth-of-type(2)")?.value || "";
  const email = document.querySelector("input[type='email']")?.value || "";
  const address = document.querySelector("input[placeholder='Address'], .row input")?.value || "";
  const city = document.querySelector("select option:checked")?.value || "Ahmedabad";
  const phone = document.querySelector("input[placeholder='Phone'], input[type='tel']")?.value || "";

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
      alert(`Order placed successfully! Order ID: ${data.order._id}`);
      window.location.href = "/";
    } else {
      alert(data.message || "Failed to place order");
    }
  } catch (err) {
    alert("Server error. Please try again.");
  }
}
