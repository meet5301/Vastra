const brandToken = localStorage.getItem("vastra_brand_token");
const modal = document.getElementById("brandProductModal");
const productsBody = document.getElementById("brandProductsBody");
const profileForm = document.getElementById("brandProfileForm");
const productForm = document.getElementById("brandProductForm");
const modalTitle = document.getElementById("productModalTitle");

let currentEditId = "";
let productsState = [];

if (!brandToken) {
  window.location.href = "/brand/login";
}

function authHeaders(includeContentType = true) {
  const headers = { Authorization: `Bearer ${brandToken}` };
  if (includeContentType) headers["Content-Type"] = "application/json";
  return headers;
}

function openModal(editing = false) {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modalTitle.textContent = editing ? "Edit Product" : "Add Product";
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  productForm.reset();
  document.getElementById("pp_isActive").checked = true;
  currentEditId = "";
}

function toCsvArray(value) {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function fillProfileForm(user) {
  const bp = user.brandProfile || {};
  document.getElementById("bp_brandName").value = bp.brandName || "";
  document.getElementById("bp_contactPhone").value = bp.contactPhone || "";
  document.getElementById("bp_website").value = bp.website || "";
  document.getElementById("bp_companyName").value = bp.companyName || "";
  document.getElementById("bp_about").value = bp.about || "";
}

function renderProducts(products) {
  if (!products.length) {
    productsBody.innerHTML = '<tr><td colspan="5" style="color:#666;">No products yet.</td></tr>';
    return;
  }

  productsBody.innerHTML = products
    .map((p) => {
      const price = Math.round(Number(p.price || 0)).toLocaleString("en-IN");
      return `
        <tr>
          <td>${p.name || ""}</td>
          <td>Rs. ${price}</td>
          <td>${p.stock ?? 0}</td>
          <td>${p.isActive ? "Active" : "Inactive"}</td>
          <td>
            <button class="brand-btn secondary" data-action="edit" data-id="${p._id}" style="padding:6px 10px;">Edit</button>
            <button class="brand-btn" data-action="delete" data-id="${p._id}" style="padding:6px 10px;background:#d72828;">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadProfile() {
  const res = await fetch("/api/brand/me", { headers: authHeaders(false) });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Failed to load brand profile");
    return null;
  }
  fillProfileForm(data.user);
  return data.user;
}

async function loadProducts() {
  const res = await fetch("/api/brand/products", { headers: authHeaders(false) });
  const data = await res.json();
  productsState = data.products || [];
  renderProducts(productsState);
  return productsState;
}

async function saveProfile(e, profileUser) {
  e.preventDefault();
  const payload = {
    username: profileUser?.username || "",
    brandName: document.getElementById("bp_brandName").value.trim(),
    contactPhone: document.getElementById("bp_contactPhone").value.trim(),
    website: document.getElementById("bp_website").value.trim(),
    companyName: document.getElementById("bp_companyName").value.trim(),
    about: document.getElementById("bp_about").value.trim(),
  };

  const res = await fetch("/api/brand/me", {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Failed to update profile");
    return;
  }
  alert("Brand profile updated");
}

function fillProductForm(product) {
  document.getElementById("pp_name").value = product.name || "";
  document.getElementById("pp_price").value = product.price || 0;
  document.getElementById("pp_image").value = product.image || "";
  document.getElementById("pp_category").value = product.category || "Men";
  document.getElementById("pp_subCategory").value = product.subCategory || "";
  document.getElementById("pp_sizes").value = (product.sizes || []).join(", ");
  document.getElementById("pp_colors").value = (product.colors || []).join(", ");
  document.getElementById("pp_stock").value = product.stock || 0;
  document.getElementById("pp_tags").value = (product.tags || []).join(", ");
  document.getElementById("pp_description").value = product.description || "";
  document.getElementById("pp_isActive").checked = product.isActive !== false;
}

async function saveProduct(e) {
  e.preventDefault();

  const payload = {
    name: document.getElementById("pp_name").value.trim(),
    price: Number(document.getElementById("pp_price").value || 0),
    image: document.getElementById("pp_image").value.trim(),
    category: document.getElementById("pp_category").value,
    subCategory: document.getElementById("pp_subCategory").value.trim(),
    sizes: toCsvArray(document.getElementById("pp_sizes").value),
    colors: toCsvArray(document.getElementById("pp_colors").value),
    stock: Number(document.getElementById("pp_stock").value || 0),
    tags: toCsvArray(document.getElementById("pp_tags").value),
    description: document.getElementById("pp_description").value.trim(),
    isActive: document.getElementById("pp_isActive").checked,
  };

  const isEdit = Boolean(currentEditId);
  const res = await fetch(isEdit ? `/api/brand/products/${currentEditId}` : "/api/brand/products", {
    method: isEdit ? "PUT" : "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!data.success) {
    alert(data.message || "Failed to save product");
    return;
  }

  closeModal();
  await loadProducts();
}

async function deleteProduct(id) {
  if (!window.confirm("Delete this product?")) return;

  const res = await fetch(`/api/brand/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  });
  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Delete failed");
    return;
  }

  await loadProducts();
}

(async function init() {
  let profileUser = await loadProfile();
  await loadProducts();

  profileForm.addEventListener("submit", (e) => saveProfile(e, profileUser));
  productForm.addEventListener("submit", saveProduct);

  document.getElementById("addProductBtn").addEventListener("click", () => {
    currentEditId = "";
    productForm.reset();
    document.getElementById("pp_isActive").checked = true;
    openModal(false);
  });

  document.getElementById("cancelProductModal").addEventListener("click", closeModal);
  document.getElementById("brandLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem("vastra_brand_token");
    localStorage.removeItem("vastra_brand_user");
    window.location.href = "/brand/login";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  productsBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "delete") {
      await deleteProduct(id);
      return;
    }

    if (action === "edit") {
      const product = productsState.find((p) => p._id === id);
      if (!product) return;
      currentEditId = id;
      fillProductForm(product);
      openModal(true);
    }
  });
})();
