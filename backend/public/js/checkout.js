// ─── VASTRA CHECKOUT JS (Phase 4) ──────────────────────────────────

const COD_LIMIT = 15000;
const COD_EXTRA_CHARGE = 30;
const SUPPORTED_PAYMENT_METHODS = ["COD", "UPI", "PAYTM", "GPAY", "PHONEPE"];

function getCart() { return JSON.parse(localStorage.getItem("vastra_cart") || "[]"); }
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

function formatINR(v) {
  return `Rs. ${Math.round(Number(v || 0)).toLocaleString("en-IN")}`;
}

function getSelectedPaymentMethod() {
  const selected = document.querySelector("input[name='payment-method']:checked");
  const method = selected ? String(selected.value || "").toUpperCase() : "COD";
  return SUPPORTED_PAYMENT_METHODS.includes(method) ? method : "COD";
}

function computeTotals(cart, method) {
  const subtotal = cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
  const shipping = subtotal > 100 ? 0 : 3.5;
  const tax = subtotal * 0.05;
  const discount = 0;
  const codCharge = method === "COD" ? COD_EXTRA_CHARGE : 0;
  const total = subtotal + shipping + tax - discount + codCharge;
  return { subtotal, shipping, tax, discount, codCharge, total };
}

function updateSummary() {
  const cart = getCart();
  const method = getSelectedPaymentMethod();
  const totals = computeTotals(cart, method);

  const subtotalEl = document.getElementById("sum-subtotal");
  const shippingEl = document.getElementById("sum-shipping");
  const codChargeRowEl = document.getElementById("cod-charge-row");
  const codChargeEl = document.getElementById("sum-cod-charge");
  const discountEl = document.getElementById("sum-discount");
  const taxEl = document.getElementById("sum-tax");
  const totalEl = document.getElementById("sum-total");
  const codRuleNote = document.getElementById("cod-rule-note");

  if (subtotalEl) subtotalEl.textContent = formatINR(totals.subtotal);
  if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? "FREE" : formatINR(totals.shipping);
  if (codChargeRowEl) codChargeRowEl.style.display = totals.codCharge > 0 ? "flex" : "none";
  if (codChargeEl) codChargeEl.textContent = formatINR(totals.codCharge);
  if (discountEl) discountEl.textContent = totals.discount > 0 ? `- ${formatINR(totals.discount)}` : "Rs. 0";
  if (taxEl) taxEl.textContent = formatINR(totals.tax);
  if (totalEl) totalEl.textContent = formatINR(totals.total);

  if (codRuleNote) {
    if (method === "COD" && totals.total > COD_LIMIT) {
      codRuleNote.textContent = `COD not allowed above ${formatINR(COD_LIMIT)}. Please choose online payment.`;
      codRuleNote.style.color = "#b42318";
    } else {
      codRuleNote.textContent = `COD available up to ${formatINR(COD_LIMIT)}.`;
      codRuleNote.style.color = "#777";
    }
  }

  return totals;
}

function setCheckoutStatus(text, type = "info") {
  const el = document.getElementById("checkout-status");
  if (!el) return;
  el.textContent = text || "";
  el.style.color = type === "error" ? "#b42318" : type === "success" ? "#067647" : "#555";
}

async function confirmPayment(orderId, intentId, markPaid) {
  const token = getToken();
  if (!token) {
    setCheckoutStatus("Login required to finalize online payment.", "error");
    return false;
  }

  const res = await fetch(`/api/orders/${orderId}/payment/confirm`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentStatus: markPaid ? "Paid" : "Failed",
      paymentIntentId: intentId,
      paymentReference: markPaid ? `TXN_${Date.now()}` : "",
    }),
  });
  const data = await res.json();
  return !!data.success;
}

async function runMockGateway(order, paymentIntent) {
  const proceed = window.confirm(
    `Mock ${paymentIntent.gateway} ${paymentIntent.mode.toUpperCase()} payment for ${formatINR(paymentIntent.amount)}.\n\nPress OK to pay, Cancel to fail.`
  );

  const done = await confirmPayment(order._id, paymentIntent.intentId, proceed);
  if (!done) {
    setCheckoutStatus("Could not update payment status.", "error");
    return false;
  }
  return proceed;
}

async function retryPayment(orderId) {
  const token = getToken();
  if (!token) {
    setCheckoutStatus("Login required for payment retry.", "error");
    return;
  }

  const res = await fetch(`/api/orders/${orderId}/payment/retry`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) {
    setCheckoutStatus(data.message || "Payment retry failed.", "error");
    return;
  }

  setCheckoutStatus("Retry intent created. Opening mock payment...", "info");
  const paid = await runMockGateway(data.order, data.paymentIntent);
  if (paid) {
    localStorage.removeItem("vastra_cart");
    showToast(`Payment successful! Order #${String(orderId).slice(-8).toUpperCase()}`);
    setTimeout(() => {
      window.location.href = "/profile";
    }, 900);
    return;
  }

  const statusEl = document.getElementById("checkout-status");
  if (statusEl) {
    statusEl.innerHTML = `Payment failed. <button id="retry-payment-btn" type="button" style="border:1px solid #111;background:#111;color:#fff;padding:5px 10px;cursor:pointer;">RETRY PAYMENT</button>`;
    const retryBtn = document.getElementById("retry-payment-btn");
    if (retryBtn) retryBtn.addEventListener("click", () => retryPayment(orderId));
  }
}

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your bag is empty!");
    window.location.href = "/men";
    return;
  }

  const firstName = document.getElementById("checkout-firstname")?.value || "";
  const lastName = document.getElementById("checkout-lastname")?.value || "";
  const email = document.getElementById("checkout-email")?.value || "";
  const address = document.getElementById("checkout-address")?.value || "";
  const city = document.getElementById("checkout-city")?.value || "Ahmedabad";
  const phone = document.getElementById("checkout-phone")?.value || "";

  if (!address || !email) {
    alert("Please fill email and shipping address.");
    return;
  }

  const method = getSelectedPaymentMethod();
  const totals = updateSummary();
  if (method === "COD" && totals.total > COD_LIMIT) {
    setCheckoutStatus(`COD not allowed above ${formatINR(COD_LIMIT)}. Choose online payment.`, "error");
    return;
  }

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
    paymentMethod: method,
    subtotal: totals.subtotal,
    shippingCost: totals.shipping,
    discount: totals.discount,
    tax: totals.tax,
    codCharge: totals.codCharge,
    totalAmount: parseFloat(totals.total.toFixed(2)),
  };

  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "PROCESSING...";
  }

  try {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(orderData),
    });
    const data = await res.json();

    if (!data.success) {
      setCheckoutStatus(data.message || "Failed to place order", "error");
      return;
    }

    if (data.paymentRequired && data.paymentIntent) {
      setCheckoutStatus("Order created. Launching mock payment...", "info");
      const paid = await runMockGateway(data.order, data.paymentIntent);
      if (paid) {
        localStorage.removeItem("vastra_cart");
        showToast(`Payment successful! Order #${data.order._id.slice(-8).toUpperCase()}`);
        setTimeout(() => {
          window.location.href = "/profile";
        }, 900);
      } else {
        const statusEl = document.getElementById("checkout-status");
        if (statusEl) {
          statusEl.innerHTML = `Payment failed. <button id="retry-payment-btn" type="button" style="border:1px solid #111;background:#111;color:#fff;padding:5px 10px;cursor:pointer;">RETRY PAYMENT</button>`;
          const retryBtn = document.getElementById("retry-payment-btn");
          if (retryBtn) retryBtn.addEventListener("click", () => retryPayment(data.order._id));
        }
      }
      return;
    }

    localStorage.removeItem("vastra_cart");
    showToast(`Order placed! ID: ${data.order._id.slice(-8).toUpperCase()}`);
    setTimeout(() => {
      window.location.href = "/profile";
    }, 900);
  } catch (err) {
    setCheckoutStatus("Server error. Please try again.", "error");
  } finally {
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "CHECKOUT";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateSummary();

  document.querySelectorAll("input[name='payment-method']").forEach((radio) => {
    radio.addEventListener("change", updateSummary);
  });

  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", placeOrder);
});
