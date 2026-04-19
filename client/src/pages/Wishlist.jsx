import { useEffect } from "react";
import { addToCartShared } from "../utils/shop";
import { formatINR } from "../utils/currency";

export default function Wishlist() {
  useEffect(() => {
    document.body.classList.add("wishlist-page");

    async function syncAndRenderWishlist() {
      const token = localStorage.getItem("vastra_token");
      if (token) {
        try {
          const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (data.success && data.user.wishlist) {
            const apiWishlist = data.user.wishlist.map((p) => ({
              id: p._id,
              name: p.name,
              price: p.price,
              image: p.image,
            }));
            localStorage.setItem("vastra_wishlist", JSON.stringify(apiWishlist));
          }
        } catch {}
      }
      renderWishlist();
    }

    function renderWishlist() {
      const wishlist = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
      const container = document.getElementById("wishlist-container");
      container.classList.toggle("is-empty", wishlist.length === 0);
      if (wishlist.length === 0) {
        container.innerHTML = '<div class="empty-state"><h2>Your wishlist is empty</h2><a href="/shop" class="empty-state-link">Continue Shopping</a></div>';
        return;
      }
      container.innerHTML = wishlist
        .map(
          (item) => `
          <div class="wishlist-item">
            <button class="remove-wishlist" data-id="${item.id}">✕</button>
            <img src="${item.image}" onerror="this.src='https://via.placeholder.com/250'" data-detail="${item.id}">
            <p style="font-weight:600;">${item.name}</p>
            <p style="color:#999;font-size:14px;">${formatINR(item.price)}</p>
            <button class="wishlist-add" data-cart-id="${item.id}" style="width:100%;padding:10px;background:#000;color:#fff;border:none;cursor:pointer;margin-top:8px;">ADD TO BAG</button>
          </div>`
        )
        .join("");

      container.querySelectorAll(".remove-wishlist").forEach((btn) => {
        btn.addEventListener("click", () => removeFromWishlist(btn.getAttribute("data-id")));
      });
      container.querySelectorAll("img[data-detail]").forEach((img) => {
        img.addEventListener("click", () => {
          const id = img.getAttribute("data-detail");
          window.location.href = `/detail?id=${id}`;
        });
      });
      container.querySelectorAll(".wishlist-add").forEach((btn) => {
        const id = btn.getAttribute("data-cart-id");
        const item = wishlist.find((w) => w.id === id);
        btn.addEventListener("click", () => addToCartShared(item.id, item.name, item.price, item.image));
      });
    }

    async function removeFromWishlist(id) {
      const token = localStorage.getItem("vastra_token");
      if (token) {
        await fetch(`/api/auth/wishlist/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      }
      let wishlist = JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
      localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist.filter((item) => item.id !== id)));
      renderWishlist();
    }

    syncAndRenderWishlist();

    return () => {
      document.body.classList.remove("wishlist-page");
    };
  }, []);

  return (
    <main>
      <h1>MY WISHLIST</h1>
      <div className="container wishlist-container">
        <section className="content">
          <div className="wishlist-grid" id="wishlist-container"></div>
        </section>
      </div>
    </main>
  );
}
