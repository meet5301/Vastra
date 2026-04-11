// ─── VASTRA PROFILE JS ────────────────────────────────────────────

function getToken() { return localStorage.getItem("vastra_token"); }
function getUser() {
  const u = localStorage.getItem("vastra_user");
  return u ? JSON.parse(u) : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  const localUser = getUser();

  // If not logged in, show login prompt
  const bottomLinks = document.querySelector(".bottom-links");

  if (!token) {
    if (bottomLinks) {
      bottomLinks.innerHTML = `
        <span style="color:#999;">Please login to view your profile</span>
        <div>
          <a href="/signup">Register</a>
          <a href="/login">Login</a>
        </div>`;
    }
    return;
  }

  // Fetch fresh user data
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success) { logout(); return; }

    const user = data.user;

    // Update profile name display
    const subtitle = document.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = user.username;

    const h1 = document.querySelector(".container > h1");
    if (h1) h1.textContent = user.email;

    // Update bottom links
    if (bottomLinks) {
      bottomLinks.innerHTML = `
        <span>Welcome, ${user.username}</span>
        <div>
          <button onclick="logout()" style="background:none;border:1px solid #000;padding:6px 16px;cursor:pointer;letter-spacing:1px;">LOGOUT</button>
        </div>`;
    }

    // Load orders on MY ORDERS card click
    const orderCard = document.querySelector(".card:nth-child(1)");
    if (orderCard) {
      orderCard.style.cursor = "pointer";
      orderCard.addEventListener("click", loadOrders);
    }

    // Wishlist card
    const wishCard = document.querySelector(".card:nth-child(2)");
    if (wishCard && user.wishlist?.length) {
      wishCard.querySelector("h3").textContent = `WISHLIST (${user.wishlist.length})`;
    }

  } catch (err) {
    console.error(err);
  }
});

async function loadOrders() {
  const token = getToken();
  try {
    const res = await fetch("/api/orders/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const container = document.querySelector(".container");

    let ordersHtml = data.orders.map(o => `
      <div style="border:1px solid #eee;padding:1rem;margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:12px;color:#888;">Order #${o._id.slice(-8).toUpperCase()}</span>
          <span style="font-size:12px;font-weight:600;letter-spacing:1px;">${o.orderStatus.toUpperCase()}</span>
        </div>
        <p style="margin:8px 0;">$${o.totalAmount} · ${o.items.length} item(s)</p>
        <p style="font-size:12px;color:#888;">${new Date(o.createdAt).toLocaleDateString()}</p>
      </div>`).join("") || "<p style='color:#888;'>No orders yet.</p>";

    // Append orders below cards
    let ordersDiv = document.getElementById("orders-section");
    if (!ordersDiv) {
      ordersDiv = document.createElement("div");
      ordersDiv.id = "orders-section";
      ordersDiv.style.cssText = "margin-top:2rem;";
      container.appendChild(ordersDiv);
    }
    ordersDiv.innerHTML = `<h2 style="letter-spacing:2px;margin-bottom:1rem;">MY ORDERS</h2>${ordersHtml}`;
    ordersDiv.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    alert("Failed to load orders");
  }
}

function logout() {
  localStorage.removeItem("vastra_token");
  localStorage.removeItem("vastra_user");
  localStorage.removeItem("vastra_cart");
  window.location.href = "/login";
}
