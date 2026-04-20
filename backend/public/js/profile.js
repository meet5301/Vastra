// ─── VASTRA PROFILE JS ────────────────────────────────────────────

function getToken() { return localStorage.getItem("vastra_token"); }
function getUser() {
  const u = localStorage.getItem("vastra_user");
  return u ? JSON.parse(u) : null;
}
function logout() {
  ["vastra_token","vastra_user","vastra_cart","vastra_admin_token","vastra_admin_user"].forEach(k => localStorage.removeItem(k));
  window.location.href = "/login";
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
  setTimeout(() => (t.style.display = "none"), 2500);
}

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderOrderProgress(order) {
  const progress = ["Processing", "Confirmed", "Shipped", "Delivered"];
  if (order?.orderStatus === "Cancelled") {
    return `<div class="order-meta" style="margin-top:8px;color:#b42318;font-weight:700;">Order Cancelled</div>`;
  }

  const current = progress.indexOf(order?.orderStatus || "Processing");
  return `
    <div class="order-meta" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
      ${progress
        .map((step, idx) => {
          const active = idx <= (current === -1 ? 0 : current);
          return `<span style="padding:3px 8px;border:1px solid ${active ? "#111" : "#d0d0d0"};background:${active ? "#111" : "#fff"};color:${active ? "#fff" : "#666"};font-size:11px;letter-spacing:0.5px;">${step}</span>`;
        })
        .join("")}
    </div>`;
}

function renderTimeline(order) {
  if (!Array.isArray(order?.trackingEvents) || order.trackingEvents.length === 0) {
    return "";
  }

  const events = [...order.trackingEvents]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return `
    <div style="margin-top:8px;display:grid;gap:5px;">
      ${events
        .map((event) => {
          const when = event?.createdAt ? new Date(event.createdAt).toLocaleString("en-IN") : "";
          return `<div class="order-meta" style="font-size:12px;color:#555;"><strong>${esc(event.status || "Update")}</strong> - ${esc(event.note || "")}${when ? ` <span style="color:#888;">(${esc(when)})</span>` : ""}</div>`;
        })
        .join("")}
    </div>`;
}

function renderOrders(orders) {
  const list = document.getElementById("orders-list");
  if (!list) return;
  if (!orders || orders.length === 0) {
    list.innerHTML = '<div class="orders-empty">No orders yet. Start shopping to see your history here.</div>';
    return;
  }
  list.innerHTML = orders.map((order) => {
    const status = order.orderStatus ? order.orderStatus.toUpperCase() : "PLACED";
    const paymentStatus = order.paymentStatus ? order.paymentStatus.toUpperCase() : "PENDING";
    const orderId = order._id ? order._id.slice(-8).toUpperCase() : "----";
    const onlineMethod = order.paymentMethod && order.paymentMethod !== "COD";
    const canRetry = onlineMethod && order.paymentStatus !== "Paid";
    const canRequestReturn = order.orderStatus === "Delivered" && !["Requested", "Approved"].includes(order.refundStatus || "");
    const codCharge = Number(order.codCharge || 0);
    const subtotalAmount = Number(order.subtotal || 0);
    const shippingAmount = Number(order.shippingCost || 0);
    const taxAmount = Number(order.tax || 0);
    const discountAmount = Number(order.discount || 0);
    const latestEvent = Array.isArray(order.trackingEvents) && order.trackingEvents.length
      ? order.trackingEvents[order.trackingEvents.length - 1]
      : null;
    return `
      <div class="order-item">
        <div class="order-row">
          <span>Order #${orderId}</span>
          <span class="order-status">${status}</span>
        </div>
        <div class="order-meta">Rs. ${Math.round(order.totalAmount || 0).toLocaleString("en-IN")} · ${(order.items || []).length} item(s)</div>
        <div class="order-row">
          <span>${new Date(order.createdAt).toLocaleDateString()}</span>
          <span>${order.paymentMethod || "COD"} · ${paymentStatus}</span>
        </div>
        ${order.refundStatus ? `<div class="order-meta" style="margin-top:6px;color:${order.refundStatus === "Approved" ? "#067647" : order.refundStatus === "Rejected" ? "#b42318" : "#b54708"};">Refund: ${esc(order.refundStatus.toUpperCase())}</div>` : ""}
        ${renderOrderProgress(order)}
        ${latestEvent ? `<div class="order-meta" style="margin-top:6px;color:#666;">Latest: ${esc(latestEvent.status)} - ${esc(latestEvent.note)}</div>` : ""}
        <details style="margin-top:8px;">
          <summary style="cursor:pointer;font-size:12px;letter-spacing:1px;color:#333;">TRACK ORDER & BILL DETAILS</summary>
          <div style="margin-top:8px;padding:8px;border:1px solid #eee;background:#fcfcfc;">
            <div class="order-meta" style="font-size:12px;">Subtotal: Rs. ${Math.round(subtotalAmount).toLocaleString("en-IN")}</div>
            <div class="order-meta" style="font-size:12px;">Shipping: Rs. ${Math.round(shippingAmount).toLocaleString("en-IN")}</div>
            ${codCharge > 0 ? `<div class="order-meta" style="font-size:12px;">COD Charge: Rs. ${Math.round(codCharge).toLocaleString("en-IN")}</div>` : ""}
            <div class="order-meta" style="font-size:12px;">Tax: Rs. ${Math.round(taxAmount).toLocaleString("en-IN")}</div>
            ${discountAmount > 0 ? `<div class="order-meta" style="font-size:12px;">Discount: - Rs. ${Math.round(discountAmount).toLocaleString("en-IN")}</div>` : ""}
            <div class="order-meta" style="margin-top:4px;font-size:12px;font-weight:700;color:#111;">Total: Rs. ${Math.round(order.totalAmount || 0).toLocaleString("en-IN")}</div>
            ${renderTimeline(order)}
          </div>
        </details>
        <div class="order-row" style="margin-top:8px;gap:8px;justify-content:flex-start;flex-wrap:wrap;">
          <button onclick="downloadInvoice('${order._id}')" style="background:#111;color:#fff;border:1px solid #111;padding:6px 10px;cursor:pointer;font-size:11px;letter-spacing:1px;">INVOICE</button>
          ${canRetry ? `<button onclick="retryOrderPayment('${order._id}')" style="background:#fff;color:#111;border:1px solid #111;padding:6px 10px;cursor:pointer;font-size:11px;letter-spacing:1px;">RETRY PAYMENT</button>` : ""}
          ${canRequestReturn ? `<button onclick="requestReturnRefund('${order._id}')" style="background:#fff;color:#111;border:1px solid #111;padding:6px 10px;cursor:pointer;font-size:11px;letter-spacing:1px;">REQUEST RETURN</button>` : ""}
        </div>
      </div>`;
  }).join("");
}

async function requestReturnRefund(orderId) {
  const token = getToken();
  if (!token) return;

  const reason = window.prompt("Optional reason for return/refund request:", "") || "";
  try {
    const res = await fetch(`/api/orders/${orderId}/return-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message || "Unable to submit return request");
      return;
    }

    showToast("Return/refund request submitted");
    const ordersRes = await fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } });
    const ordersData = await ordersRes.json();
    renderOrders(ordersData.orders || []);
  } catch {
    showToast("Server error");
  }
}

async function retryOrderPayment(orderId) {
  const token = getToken();
  if (!token) return;

  try {
    const retryRes = await fetch(`/api/orders/${orderId}/payment/retry`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const retryData = await retryRes.json();
    if (!retryData.success) {
      showToast(retryData.message || "Retry failed");
      return;
    }

    const intent = retryData.paymentIntent;
    const ok = window.confirm(
      `Mock ${intent.gateway} ${intent.mode.toUpperCase()} payment for Rs. ${Math.round(intent.amount).toLocaleString("en-IN")}.\n\nOK = Paid, Cancel = Failed`
    );

    const confirmRes = await fetch(`/api/orders/${orderId}/payment/confirm`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentStatus: ok ? "Paid" : "Failed",
        paymentIntentId: intent.intentId,
        paymentReference: ok ? `TXN_${Date.now()}` : "",
      }),
    });
    const confirmData = await confirmRes.json();
    if (!confirmData.success) {
      showToast(confirmData.message || "Could not update payment status");
      return;
    }

    showToast(ok ? "Payment successful" : "Payment failed");
    const ordersRes = await fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } });
    const ordersData = await ordersRes.json();
    renderOrders(ordersData.orders || []);
  } catch {
    showToast("Server error");
  }
}

function downloadInvoice(orderId) {
  const token = getToken();
  if (!token) {
    showToast("Please login first");
    return;
  }

  fetch(`/api/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Invoice download failed");
      return res.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(() => showToast("Unable to download invoice"));
}

function renderAddresses(addresses) {
  const list = document.getElementById("addresses-list");
  if (!list) return;
  if (!addresses || addresses.length === 0) {
    list.innerHTML = '<p style="color:#999;font-size:14px;">No saved addresses.</p>';
    return;
  }
  list.innerHTML = addresses.map((a) => `
    <div class="order-item" style="position:relative;">
      ${a.isDefault ? '<span style="font-size:11px;background:#000;color:#fff;padding:2px 8px;letter-spacing:1px;">DEFAULT</span>' : ""}
      <div class="order-row"><span>${a.fullName}</span><span>${a.phone}</span></div>
      <div class="order-meta">${a.address}, ${a.city}</div>
      <button onclick="deleteAddress('${a._id}')" style="background:none;border:none;color:#999;cursor:pointer;font-size:12px;padding:0;margin-top:4px;">REMOVE</button>
    </div>`).join("");
}

async function deleteAddress(addrId) {
  const token = getToken();
  if (!token) return;
  const res = await fetch(`/api/auth/addresses/${addrId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.success) { renderAddresses(data.addresses); showToast("Address removed"); }
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  const localUser = getUser();

  const nameEl    = document.getElementById("profile-name");
  const emailEl   = document.getElementById("profile-email");
  const avatarEl  = document.getElementById("profile-avatar");
  const loginBtn  = document.getElementById("profile-login-btn");
  const logoutBtn = document.getElementById("profile-logout-btn");

  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  if (!token) {
    if (loginBtn)  loginBtn.style.display  = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (nameEl)    nameEl.textContent  = "Guest";
    if (emailEl)   emailEl.textContent = "Login to view your orders and details.";
    if (avatarEl)  avatarEl.textContent = "V";
    renderOrders([]);
    return;
  }

  if (loginBtn)  loginBtn.style.display  = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-flex";

  try {
    const res  = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.success) { logout(); return; }

    const user = data.user || localUser;
    if (nameEl)   nameEl.textContent  = user?.username || "Customer";
    if (emailEl)  emailEl.textContent = user?.email || "";
    if (avatarEl) avatarEl.textContent = (user?.username || "V").charAt(0).toUpperCase();

    // Pre-fill edit form
    const editName  = document.getElementById("edit-username");
    const editEmail = document.getElementById("edit-email");
    if (editName)  editName.value  = user?.username || "";
    if (editEmail) editEmail.value = user?.email || "";

    // Render addresses
    renderAddresses(user?.addresses || []);

    // Orders
    const ordersRes  = await fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } });
    const ordersData = await ordersRes.json();
    renderOrders(ordersData.orders || []);
  } catch (err) {
    renderOrders([]);
  }

  // ── Edit Profile Form ──────────────────────────────────────────
  const editForm = document.getElementById("edit-profile-form");
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("edit-username").value;
      const email    = document.getElementById("edit-email").value;
      const btn = editForm.querySelector("button[type='submit']");
      btn.textContent = "Saving..."; btn.disabled = true;
      try {
        const res  = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username, email }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("vastra_user", JSON.stringify({ ...getUser(), username: data.user.username, email: data.user.email }));
          if (nameEl)  nameEl.textContent  = data.user.username;
          if (emailEl) emailEl.textContent = data.user.email;
          if (avatarEl) avatarEl.textContent = data.user.username.charAt(0).toUpperCase();
          showToast("Profile updated!");
        } else {
          showToast(data.message || "Update failed");
        }
      } catch { showToast("Server error"); }
      btn.textContent = "SAVE CHANGES"; btn.disabled = false;
    });
  }

  // ── Change Password Form ───────────────────────────────────────
  const pwForm = document.getElementById("change-password-form");
  if (pwForm) {
    pwForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const oldPassword = document.getElementById("old-password").value;
      const newPassword = document.getElementById("new-password").value;
      const btn = pwForm.querySelector("button[type='submit']");
      btn.textContent = "Updating..."; btn.disabled = true;
      try {
        const res  = await fetch("/api/auth/change-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ oldPassword, newPassword }),
        });
        const data = await res.json();
        showToast(data.success ? "Password changed!" : (data.message || "Failed"));
        if (data.success) pwForm.reset();
      } catch { showToast("Server error"); }
      btn.textContent = "UPDATE PASSWORD"; btn.disabled = false;
    });
  }

  // ── Add Address Form ───────────────────────────────────────────
  const addrForm = document.getElementById("add-address-form");
  if (addrForm) {
    addrForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = {
        fullName:  document.getElementById("addr-name").value,
        phone:     document.getElementById("addr-phone").value,
        address:   document.getElementById("addr-address").value,
        city:      document.getElementById("addr-city").value,
        isDefault: document.getElementById("addr-default")?.checked || false,
      };
      const btn = addrForm.querySelector("button[type='submit']");
      btn.textContent = "Saving..."; btn.disabled = true;
      try {
        const res  = await fetch("/api/auth/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) { renderAddresses(data.addresses); addrForm.reset(); showToast("Address saved!"); }
        else showToast(data.message || "Failed");
      } catch { showToast("Server error"); }
      btn.textContent = "SAVE ADDRESS"; btn.disabled = false;
    });
  }
});
