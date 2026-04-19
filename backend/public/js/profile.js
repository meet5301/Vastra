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

function renderOrders(orders) {
  const list = document.getElementById("orders-list");
  if (!list) return;
  if (!orders || orders.length === 0) {
    list.innerHTML = '<div class="orders-empty">No orders yet. Start shopping to see your history here.</div>';
    return;
  }
  list.innerHTML = orders.map((order) => {
    const status = order.orderStatus ? order.orderStatus.toUpperCase() : "PLACED";
    const orderId = order._id ? order._id.slice(-8).toUpperCase() : "----";
    return `
      <div class="order-item">
        <div class="order-row">
          <span>Order #${orderId}</span>
          <span class="order-status">${status}</span>
        </div>
        <div class="order-meta">$${order.totalAmount} · ${order.items.length} item(s)</div>
        <div class="order-row">
          <span>${new Date(order.createdAt).toLocaleDateString()}</span>
          <span>${order.paymentMethod || "COD"}</span>
        </div>
      </div>`;
  }).join("");
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
