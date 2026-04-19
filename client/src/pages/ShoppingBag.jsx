import { useEffect } from "react";

export default function ShoppingBag() {
  useEffect(() => {
    const formatINR = (value) => `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

    function getCart() {
      return JSON.parse(localStorage.getItem("vastra_cart") || "[]");
    }
    function saveCart(cart) {
      localStorage.setItem("vastra_cart", JSON.stringify(cart));
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

    function calculateTotals(cart, coupon) {
      const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const shipping = subtotal >= 999 ? 0 : 79;
      const discount = coupon?.discountAmount ? Number(coupon.discountAmount) : 0;
      const total = Math.max(0, subtotal + shipping - discount);
      return { subtotal, shipping, discount, total };
    }

    let appliedCoupon = getStoredCoupon();

    function renderCart() {
      const cart = getCart();
      const container = document.querySelector(".bag-items");
      if (!container) return;

      if (cart.length === 0) {
        container.innerHTML = '<div class="empty-state"><h2>Your bag is empty</h2><a href="/shop" class="empty-state-link">Continue Shopping</a></div>';
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
                <button data-idx="${idx}" data-delta="-1" style="width:28px;height:28px;border:1px solid #000;background:#fff;cursor:pointer;">−</button>
                <span>${item.quantity}</span>
                <button data-idx="${idx}" data-delta="1" style="width:28px;height:28px;border:1px solid #000;background:#fff;cursor:pointer;">+</button>
              </div>
            </div>
            <div style="text-align:right;">
              <p style="font-weight:600;">${formatINR(item.price * item.quantity)}</p>
              <button data-remove="${idx}" style="margin-top:8px;background:none;border:none;color:#999;cursor:pointer;font-size:12px;">REMOVE</button>
            </div>
          </div>`;
        })
        .join("");

      const totals = calculateTotals(cart, appliedCoupon);

      container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 320px;gap:2rem;align-items:start;">
          <div>${itemsHtml}</div>
          <div style="border:1px solid #eee;padding:1.5rem;">
            <h3 style="letter-spacing:2px;margin-bottom:1rem;">ORDER SUMMARY</h3>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Subtotal</span><span id="bag-subtotal">${formatINR(totals.subtotal)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Shipping</span><span id="bag-shipping">${totals.shipping === 0 ? "FREE" : formatINR(totals.shipping)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Promo Discount</span><span id="bag-discount">${totals.discount > 0 ? "- " + formatINR(totals.discount) : formatINR(0)}</span></div>
            <div style="margin:12px 0 10px; border-top:1px dashed #ddd; padding-top:10px;">
              <label style="font-size:11px;letter-spacing:2px;font-weight:700;display:block;margin-bottom:6px;">COUPON CODE</label>
              <div style="display:flex;gap:8px;">
                <input id="bag-coupon-input" type="text" placeholder="ENTER CODE" style="flex:1;padding:9px;border:1px solid #ccc;" />
                <button id="bag-coupon-apply" style="padding:9px 14px;border:none;background:#111;color:#fff;letter-spacing:1px;font-weight:700;cursor:pointer;">APPLY</button>
              </div>
              <div id="bag-coupon-status" style="margin-top:8px;font-size:12px;color:#666;">${appliedCoupon ? `Applied: ${appliedCoupon.code}` : "No coupon applied"}</div>
            </div>
            <hr style="margin:1rem 0;">
            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;"><span>TOTAL</span><span id="bag-total">${formatINR(totals.total)}</span></div>
            <button id="bag-checkout-btn" style="width:100%;padding:14px;background:#000;color:#fff;border:none;letter-spacing:2px;cursor:pointer;margin-top:1rem;font-size:14px;">
              PROCEED TO CHECKOUT
            </button>
            <a href="/shop" style="display:block;text-align:center;margin-top:12px;font-size:13px;color:#666;text-decoration:underline;">Continue Shopping</a>
          </div>
        </div>`;

      container.querySelectorAll("button[data-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-idx"));
          const delta = Number(btn.getAttribute("data-delta"));
          const cart = getCart();
          cart[idx].quantity += delta;
          if (cart[idx].quantity <= 0) cart.splice(idx, 1);
          saveCart(cart);
          renderCart();
        });
      });

      container.querySelectorAll("button[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-remove"));
          const cart = getCart();
          cart.splice(idx, 1);
          saveCart(cart);
          renderCart();
        });
      });

      const checkoutBtn = document.getElementById("bag-checkout-btn");
      if (checkoutBtn) checkoutBtn.addEventListener("click", () => { window.location.href = "/checkout"; });

      const applyBtn = document.getElementById("bag-coupon-apply");
      if (applyBtn) {
        applyBtn.addEventListener("click", async () => {
          const input = document.getElementById("bag-coupon-input");
          const code = input?.value?.trim();
          if (!code) {
            appliedCoupon = null;
            clearStoredCoupon();
            renderCart();
            return;
          }
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
              renderCart();
            } else {
              appliedCoupon = null;
              clearStoredCoupon();
              alert(data.message || "Invalid coupon");
              renderCart();
            }
          } catch {
            alert("Failed to apply coupon");
          }
        });
      }
    }

    async function autoApplyBestCoupon() {
      const cart = getCart();
      if (!cart.length) return;
      if (appliedCoupon) return;
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
      } catch {
        return;
      }
    }

    renderCart();
    autoApplyBestCoupon().then(() => renderCart());
  }, []);

  return (
    <div className="container">
      <h1>YOUR SHOPPING BAG</h1>
      <div className="bag-items"></div>
    </div>
  );
}
