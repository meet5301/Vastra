import { showToast } from "./toast";

export function getCart() {
  return JSON.parse(localStorage.getItem("vastra_cart") || "[]");
}

export function saveCart(cart) {
  localStorage.setItem("vastra_cart", JSON.stringify(cart));
}

export function addToCartShared(id, name, price, image, size = "M") {
  const token = localStorage.getItem("vastra_token");
  if (!token) {
    showToast("Please login to add items to bag.");
    return;
  }

  const cart = getCart();
  const existing = cart.find((i) => i.id === id && i.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, image, size, quantity: 1 });
  }
  saveCart(cart);
  showToast(`${name} added to bag!`);
}

export function getWishlist() {
  return JSON.parse(localStorage.getItem("vastra_wishlist") || "[]");
}

export async function toggleWishlistShared(id, name, price, image) {
  const token = localStorage.getItem("vastra_token");
  if (token) {
    await fetch(`/api/auth/wishlist/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  const wishlist = getWishlist();
  const exists = wishlist.find((item) => item.id === id);
  if (exists) {
    localStorage.setItem(
      "vastra_wishlist",
      JSON.stringify(wishlist.filter((item) => item.id !== id))
    );
    showToast(`${name} removed from wishlist`);
  } else {
    wishlist.push({ id, name, price, image });
    localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist));
    showToast(`${name} added to wishlist!`);
  }
}
