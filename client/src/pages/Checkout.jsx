import { useEffect } from "react";
import { formatINR } from "../utils/currency";

export default function Checkout() {
  useEffect(() => {
    function getCart() {
      return JSON.parse(localStorage.getItem("vastra_cart") || "[]");
    }
    function getToken() {
      return localStorage.getItem("vastra_token");
    }

    if (!getToken()) {
      alert("Please login to continue checkout.");
      window.location.href = "/login";
      return;
    }
    function getStoredCoupon() {
      try {
        return JSON.parse(localStorage.getItem("vastra_coupon") || "null");
      } catch {
        return null;
      }
    }
    function setStoredCoupon(coupon) {
      localStorage.setItem("vastra_coupon", JSON.stringify(coupon));
    }
    function clearStoredCoupon() {
      localStorage.removeItem("vastra_coupon");
    }
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

    function calculateTotals(cart, coupon) {
      const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const shipping = subtotal >= 999 ? 0 : 79;
      const tax = subtotal * 0.05;
      const discount = coupon?.discountAmount ? Number(coupon.discountAmount) : 0;
      const total = Math.max(0, subtotal + shipping + tax - discount);
      return { subtotal, shipping, tax, discount, total };
    }

    let appliedCoupon = getStoredCoupon();

    const cart = getCart();
    const summarySection = document.querySelector(".summary-section");
    function updateSummaryDisplay() {
      if (!summarySection || cart.length === 0) return;
      const totals = calculateTotals(cart, appliedCoupon);

      const subtotalEl = summarySection.querySelector("[data-summary='subtotal']");
      const shippingEl = summarySection.querySelector("[data-summary='shipping']");
      const discountEl = summarySection.querySelector("[data-summary='discount']");
      const taxEl = summarySection.querySelector("[data-summary='tax']");
      const totalEl = summarySection.querySelector("[data-summary='total']");
      const statusEl = summarySection.querySelector("#coupon-status");

      if (subtotalEl) subtotalEl.textContent = formatINR(totals.subtotal);
      if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? "FREE" : formatINR(totals.shipping);
      if (discountEl) discountEl.textContent = totals.discount > 0 ? `- ${formatINR(totals.discount)}` : formatINR(0);
      if (taxEl) taxEl.textContent = formatINR(totals.tax);
      if (totalEl) totalEl.textContent = formatINR(totals.total);

      if (statusEl) {
        statusEl.textContent = appliedCoupon
          ? `Applied: ${appliedCoupon.code}`
          : "No coupon applied";
      }
    }

    async function applyCouponCode(code) {
      if (!code) {
        appliedCoupon = null;
        clearStoredCoupon();
        updateSummaryDisplay();
        return;
      }
      const totals = calculateTotals(cart, null);
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, orderAmount: totals.subtotal }),
        });
        const data = await res.json();
        if (data.success) {
          appliedCoupon = {
            couponId: data.coupon.id,
            code: data.coupon.code,
            type: data.coupon.type,
            value: data.coupon.value,
            discountAmount: data.coupon.discountAmount,
          };
          setStoredCoupon(appliedCoupon);
          updateSummaryDisplay();
          showToast("Coupon applied");
        } else {
          appliedCoupon = null;
          clearStoredCoupon();
          updateSummaryDisplay();
          alert(data.message || "Invalid coupon");
        }
      } catch {
        alert("Failed to apply coupon");
      }
    }

    async function autoApplyBestCoupon() {
      if (!cart.length) return;
      const totals = calculateTotals(cart, null);
      try {
        const res = await fetch(`/api/coupons/public/best?orderAmount=${totals.subtotal}`);
        const data = await res.json();
        if (data.success && data.coupon) {
          appliedCoupon = {
            couponId: data.coupon.id,
            code: data.coupon.code,
            type: data.coupon.type,
            value: data.coupon.value,
            discountAmount: data.coupon.discountAmount,
          };
          setStoredCoupon(appliedCoupon);
        }
        updateSummaryDisplay();
      } catch {
        updateSummaryDisplay();
      }
    }

    async function loadAvailableCoupons() {
      const listEl = document.getElementById("coupon-list");
      if (!listEl) return;
      try {
        const res = await fetch("/api/coupons/public/active");
        const data = await res.json();
        if (!data.success || !data.coupons?.length) {
          listEl.innerHTML = "<div class='coupon-empty'>No active coupons</div>";
          return;
        }

        listEl.innerHTML = data.coupons
          .map((c) => {
            const label = c.type === "percent" ? `${c.value}% OFF` : `${formatINR(c.value)} OFF`;
            const min = c.minOrder ? `Min ${formatINR(c.minOrder)}` : "No minimum";
            return `
              <button class="coupon-chip" data-code="${c.code}">
                <strong>${c.code}</strong>
                <span>${label} · ${min}</span>
              </button>`;
          })
          .join("");

        listEl.querySelectorAll(".coupon-chip").forEach((btn) => {
          btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-code");
            const input = document.getElementById("coupon-code-input");
            if (input) input.value = code;
            applyCouponCode(code);
          });
        });
      } catch {
        listEl.innerHTML = "<div class='coupon-empty'>Failed to load coupons</div>";
      }
    }

    if (summarySection && cart.length > 0) {
      updateSummaryDisplay();
      if (!appliedCoupon) autoApplyBestCoupon();
    }
    loadAvailableCoupons();

    async function placeOrder() {
      if (!getToken()) {
        alert("Please login to continue checkout.");
        window.location.href = "/login";
        return;
      }

      const cart = getCart();
      if (cart.length === 0) {
        alert("Your bag is empty!");
        window.location.href = "/shop";
        return;
      }

      const firstName = document.getElementById("checkout-firstname")?.value || "";
      const lastName = document.getElementById("checkout-lastname")?.value || "";
      const email = document.getElementById("checkout-email")?.value || "";
      const address = document.getElementById("checkout-address")?.value || "";
      const city = document.getElementById("checkout-city")?.value || "Ahmedabad";
      const phone = document.getElementById("checkout-phone")?.value || "";

      if (!address) {
        alert("Please fill in your shipping address.");
        return;
      }

      const storedCoupon = getStoredCoupon();
      const totals = calculateTotals(cart, storedCoupon);

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
        subtotal: totals.subtotal,
        shippingCost: totals.shipping,
        discount: totals.discount,
        tax: totals.tax,
        totalAmount: parseFloat(totals.total.toFixed(2)),
        coupon: storedCoupon || undefined,
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
      } catch {
        alert("Server error. Please try again.");
      }
    }

    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) checkoutBtn.addEventListener("click", placeOrder);

    const applyBtn = document.getElementById("coupon-apply-btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const input = document.getElementById("coupon-code-input");
        const code = input?.value?.trim();
        applyCouponCode(code);
      });
    }
  }, []);

  return (
    <div className="container">
      <h1>CHECKOUT</h1>
      <div className="checkout-wrapper">
        <div className="form-section">
          <h2>SHIPPING INFO</h2>
          <label>First name</label>
          <input type="text" id="checkout-firstname" placeholder="First name" />
          <label>Last name</label>
          <input type="text" id="checkout-lastname" placeholder="Last name" />
          <label>Email *</label>
          <input type="email" id="checkout-email" />
          <div className="row">
            <div>
              <label>Address</label>
              <input type="text" id="checkout-address" />
            </div>
            <div>
              <label>City</label>
              <select id="checkout-city">
                <option>Surat</option>
                <option>Ahmedabad</option>
                <option>Vadodara</option>
              </select>
            </div>
          </div>
          <label>Phone</label>
          <input type="text" id="checkout-phone" />
          <div className="options">
            <label><input type="checkbox" /> Register account</label>
            <label><input type="checkbox" defaultChecked /> Pay on delivery</label>
          </div>
          <button className="checkout-btn">CHECKOUT</button>
        </div>

        <div className="summary-section">
          <h2>ORDER SUMMARY</h2>
          <p>Subtotal <span data-summary="subtotal">Rs. 0</span></p>
          <p>Shipping <span data-summary="shipping">Rs. 0</span></p>
          <p>Promo Discount <span data-summary="discount">Rs. 0</span></p>
          <p>Tax <span data-summary="tax">Rs. 0</span></p>
          <h3>Total <span data-summary="total">Rs. 0</span></h3>

          <div className="coupon-box">
            <label>COUPON CODE</label>
            <div className="coupon-row">
              <input type="text" id="coupon-code-input" placeholder="ENTER CODE" />
              <button type="button" id="coupon-apply-btn">APPLY</button>
            </div>
            <div className="coupon-status" id="coupon-status">No coupon applied</div>
            <div className="coupon-list" id="coupon-list"></div>
          </div>

          <h2>PAYMENTS</h2>
          <div className="payments">
            <i className="fa-brands fa-cc-visa"></i>
            <i className="fa-brands fa-cc-mastercard"></i>
            <i className="fa-brands fa-cc-amex"></i>
            <i className="fa-brands fa-cc-paypal"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
