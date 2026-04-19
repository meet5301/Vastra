import { useEffect } from "react";
import { addToCartShared } from "../utils/shop";
import { formatINR } from "../utils/currency";

export default function Search() {
  useEffect(() => {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const resultCount = document.getElementById("result-count");

    async function performSearch(query) {
      if (!query.trim()) {
        searchResults.innerHTML = '<p style="text-align:center;padding:2rem;">Enter a search term</p>';
        resultCount.textContent = "0 Results";
        return;
      }
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=100`);
        const data = await res.json();
        if (data.success && data.products.length > 0) {
          renderResults(data.products);
          resultCount.textContent = `${data.products.length} Results for "${query}"`;
        } else {
          searchResults.innerHTML = '<p style="text-align:center;padding:2rem;color:#999;">No products found</p>';
          resultCount.textContent = "0 Results";
        }
      } catch {
        searchResults.innerHTML = '<p style="text-align:center;color:red;">Search failed</p>';
      }
    }

    function renderResults(products) {
      searchResults.innerHTML = products
        .map(
          (p) => `
          <div class="product-card" style="cursor:pointer;" data-id="${p._id}">
            <img src="${p.image}" loading="lazy" class="product-img" onerror="this.src='https://via.placeholder.com/250'">
            <p class="name">${p.name}</p>
            <p class="price">${formatINR(p.price)}</p>
            <button class="add-to-cart-btn" data-cart-id="${p._id}">ADD TO BAG</button>
          </div>`
        )
        .join("");

      searchResults.querySelectorAll(".product-card").forEach((card) => {
        const id = card.getAttribute("data-id");
        card.addEventListener("click", () => (window.location.href = `/detail?id=${id}`));
      });
      searchResults.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
        const id = btn.getAttribute("data-cart-id");
        const p = products.find((x) => x._id === id);
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          addToCartShared(p._id, p.name, p.price, p.image);
        });
      });
    }

    searchInput.addEventListener("input", (e) => performSearch(e.target.value));

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");
    if (query) {
      searchInput.value = query;
      performSearch(query);
    }
  }, []);

  return (
    <main>
      <h1>SEARCH RESULTS</h1>
      <div className="container">
        <section className="content">
          <div className="grid-controls">
            <input type="text" id="search-input" placeholder="Search for products..." style={{ padding: 8, border: "1px solid #000", width: 300 }} />
            <span id="result-count" style={{ marginLeft: "2rem" }}>Searching...</span>
          </div>
          <div className="product-grid" id="search-results"></div>
        </section>
      </div>
    </main>
  );
}
