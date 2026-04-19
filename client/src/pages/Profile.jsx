import { useEffect } from "react";
import { clearAuth, getToken, getUser } from "../utils/storage";
import { showToast } from "../utils/toast";
import { formatINR } from "../utils/currency";

export default function Profile() {
  useEffect(() => {
    function logout() {
      clearAuth();
      window.location.href = "/login";
    }

    function renderOrders(orders) {
      const list = document.getElementById("orders-list");
      if (!list) return;
      if (!orders || orders.length === 0) {
        list.innerHTML = '<div class="orders-empty">No orders yet. Start shopping to see your history here.</div>';
        return;
      }
      list.innerHTML = orders
        .map((order) => {
          const status = order.orderStatus ? order.orderStatus.toUpperCase() : "PLACED";
          const orderId = order._id ? order._id.slice(-8).toUpperCase() : "----";
          return `
          <div class="order-item">
            <div class="order-row">
              <span>Order #${orderId}</span>
              <span class="order-status">${status}</span>
            </div>
            <div class="order-meta">${formatINR(order.totalAmount)} · ${order.items.length} item(s)</div>
            <div class="order-row">
              <span>${new Date(order.createdAt).toLocaleDateString()}</span>
              <span>${order.paymentMethod || "COD"}</span>
            </div>
          </div>`;
        })
        .join("");
    }

    function renderAddresses(addresses) {
      const list = document.getElementById("addresses-list");
      if (!list) return;
      if (!addresses || addresses.length === 0) {
        list.innerHTML = '<p style="color:#999;font-size:14px;">No saved addresses.</p>';
        return;
      }
      list.innerHTML = addresses
        .map(
          (a) => `
          <div class="order-item" style="position:relative;">
            ${a.isDefault ? '<span style="font-size:11px;background:#000;color:#fff;padding:2px 8px;letter-spacing:1px;">DEFAULT</span>' : ""}
            <div class="order-row"><span>${a.fullName}</span><span>${a.phone}</span></div>
            <div class="order-meta">${a.address}, ${a.city}</div>
            <button data-addr="${a._id}" style="background:none;border:none;color:#999;cursor:pointer;font-size:12px;padding:0;margin-top:4px;">REMOVE</button>
          </div>`
        )
        .join("");

      list.querySelectorAll("button[data-addr]").forEach((btn) => {
        btn.addEventListener("click", () => deleteAddress(btn.getAttribute("data-addr")));
      });
    }

    async function deleteAddress(addrId) {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`/api/auth/addresses/${addrId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        renderAddresses(data.addresses);
        showToast("Address removed");
      }
    }

    async function init() {
      const token = getToken();
      const localUser = getUser();

      const nameEl = document.getElementById("profile-name");
      const emailEl = document.getElementById("profile-email");
      const avatarEl = document.getElementById("profile-avatar");
      const loginBtn = document.getElementById("profile-login-btn");
      const logoutBtn = document.getElementById("profile-logout-btn");

      if (logoutBtn) logoutBtn.addEventListener("click", logout);

      if (!token) {
        if (loginBtn) loginBtn.style.display = "inline-flex";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (nameEl) nameEl.textContent = "Guest";
        if (emailEl) emailEl.textContent = "Login to view your orders and details.";
        if (avatarEl) avatarEl.textContent = "V";
        renderOrders([]);
        return;
      }

      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-flex";

      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!data.success) {
          logout();
          return;
        }

        const user = data.user || localUser;
        if (nameEl) nameEl.textContent = user?.username || "Customer";
        if (emailEl) emailEl.textContent = user?.email || "";
        if (avatarEl) avatarEl.textContent = (user?.username || "V").charAt(0).toUpperCase();

        const editName = document.getElementById("edit-username");
        const editEmail = document.getElementById("edit-email");
        if (editName) editName.value = user?.username || "";
        if (editEmail) editEmail.value = user?.email || "";

        renderAddresses(user?.addresses || []);

        const ordersRes = await fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } });
        const ordersData = await ordersRes.json();
        renderOrders(ordersData.orders || []);
      } catch {
        renderOrders([]);
      }

      const editForm = document.getElementById("edit-profile-form");
      if (editForm) {
        editForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const username = document.getElementById("edit-username").value;
          const email = document.getElementById("edit-email").value;
          const btn = editForm.querySelector("button[type='submit']");
          btn.textContent = "Saving...";
          btn.disabled = true;
          try {
            const res = await fetch("/api/auth/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ username, email }),
            });
            const data = await res.json();
            if (data.success) {
              localStorage.setItem(
                "vastra_user",
                JSON.stringify({ ...getUser(), username: data.user.username, email: data.user.email })
              );
              if (nameEl) nameEl.textContent = data.user.username;
              if (emailEl) emailEl.textContent = data.user.email;
              if (avatarEl) avatarEl.textContent = data.user.username.charAt(0).toUpperCase();
              showToast("Profile updated!");
            } else {
              showToast(data.message || "Update failed");
            }
          } catch {
            showToast("Server error");
          }
          btn.textContent = "SAVE CHANGES";
          btn.disabled = false;
        });
      }

      const pwForm = document.getElementById("change-password-form");
      if (pwForm) {
        pwForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const oldPassword = document.getElementById("old-password").value;
          const newPassword = document.getElementById("new-password").value;
          const btn = pwForm.querySelector("button[type='submit']");
          btn.textContent = "Updating...";
          btn.disabled = true;
          try {
            const res = await fetch("/api/auth/change-password", {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ oldPassword, newPassword }),
            });
            const data = await res.json();
            showToast(data.success ? "Password changed!" : data.message || "Failed");
            if (data.success) pwForm.reset();
          } catch {
            showToast("Server error");
          }
          btn.textContent = "UPDATE PASSWORD";
          btn.disabled = false;
        });
      }

      const addrForm = document.getElementById("add-address-form");
      if (addrForm) {
        addrForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const body = {
            fullName: document.getElementById("addr-name").value,
            phone: document.getElementById("addr-phone").value,
            address: document.getElementById("addr-address").value,
            city: document.getElementById("addr-city").value,
            isDefault: document.getElementById("addr-default")?.checked || false,
          };
          const btn = addrForm.querySelector("button[type='submit']");
          btn.textContent = "Saving...";
          btn.disabled = true;
          try {
            const res = await fetch("/api/auth/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
              renderAddresses(data.addresses);
              addrForm.reset();
              showToast("Address saved!");
            } else {
              showToast(data.message || "Failed");
            }
          } catch {
            showToast("Server error");
          }
          btn.textContent = "SAVE ADDRESS";
          btn.disabled = false;
        });
      }
    }

    init();
  }, []);

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-badge">
          <div className="avatar" id="profile-avatar">V</div>
          <div className="profile-meta">
            <p className="eyebrow">MY ACCOUNT</p>
            <h1 id="profile-name">Guest</h1>
            <p id="profile-email" className="muted">Login to view your orders and details.</p>
            <div className="profile-actions">
              <a id="profile-login-btn" className="btn btn-solid" href="/login">LOGIN</a>
              <button id="profile-logout-btn" className="btn btn-outline" type="button">LOGOUT</button>
            </div>
          </div>
        </div>
        <div className="help-card">
          <h3>HELPLINE</h3>
          <p>Mon - Sat, 10am - 7pm</p>
          <a href="tel:+919999999999">+91 99999 99999</a>
          <span className="divider"></span>
          <a href="mailto:support@vastra.com">support@vastra.com</a>
        </div>
      </section>

      <section className="profile-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>MY ORDERS</h2>
            <a className="link" href="/shop">Continue shopping</a>
          </div>
          <div id="orders-list" className="orders-list"></div>
        </div>

        <div className="panel">
          <h2>QUICK LINKS</h2>
          <div className="quick-links">
            <a href="/wishlist"><i className="fa-regular fa-heart"></i> Wishlist</a>
            <a href="/shopingbag"><i className="fa-solid fa-bag-shopping"></i> My Bag</a>
            <a href="#address-section" onClick={(e) => { e.preventDefault(); document.getElementById("address-section").scrollIntoView({ behavior: "smooth" }); }}><i className="fa-solid fa-location-dot"></i> Addresses</a>
            <a href="#edit-section" onClick={(e) => { e.preventDefault(); document.getElementById("edit-section").scrollIntoView({ behavior: "smooth" }); }}><i className="fa-regular fa-user"></i> Edit Profile</a>
            <a href="#password-section" onClick={(e) => { e.preventDefault(); document.getElementById("password-section").scrollIntoView({ behavior: "smooth" }); }}><i className="fa-solid fa-lock"></i> Change Password</a>
            <a href="/shop"><i className="fa-solid fa-bag-shopping"></i> Shop Now</a>
          </div>
        </div>
      </section>

      <section className="profile-grid" id="edit-section">
        <div className="panel">
          <div className="panel-header"><h2>EDIT PROFILE</h2></div>
          <form id="edit-profile-form" className="profile-form">
            <div className="form-group">
              <label>USERNAME</label>
              <input id="edit-username" type="text" required />
            </div>
            <div className="form-group">
              <label>EMAIL</label>
              <input id="edit-email" type="email" required />
            </div>
            <button type="submit" className="btn btn-solid">SAVE CHANGES</button>
          </form>
        </div>

        <div className="panel" id="password-section">
          <div className="panel-header"><h2>CHANGE PASSWORD</h2></div>
          <form id="change-password-form" className="profile-form">
            <div className="form-group">
              <label>OLD PASSWORD</label>
              <input id="old-password" type="password" required />
            </div>
            <div className="form-group">
              <label>NEW PASSWORD</label>
              <input id="new-password" type="password" required minLength="6" />
            </div>
            <button type="submit" className="btn btn-solid">UPDATE PASSWORD</button>
          </form>
        </div>
      </section>

      <section className="profile-grid" id="address-section">
        <div className="panel">
          <div className="panel-header"><h2>MY ADDRESSES</h2></div>
          <div id="addresses-list" className="orders-list"></div>
        </div>

        <div className="panel">
          <div className="panel-header"><h2>ADD ADDRESS</h2></div>
          <form id="add-address-form" className="profile-form">
            <input id="addr-name" type="text" placeholder="Full Name" required />
            <input id="addr-phone" type="text" placeholder="Phone" required />
            <input id="addr-address" type="text" placeholder="Address" required />
            <input id="addr-city" type="text" placeholder="City" required />
            <label className="checkbox-label">
              <input id="addr-default" type="checkbox" /> Set as default
            </label>
            <button type="submit" className="btn btn-solid">SAVE ADDRESS</button>
          </form>
        </div>
      </section>
    </main>
  );
}
