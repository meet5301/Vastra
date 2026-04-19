import { useEffect, useMemo, useState } from "react";

const emptyProduct = {
  _id: "",
  name: "",
  price: "",
  image: "",
  category: "Men",
  subCategory: "",
  sizes: "S, M, L, XL",
  colors: "",
  stock: "",
  description: "",
  tags: "",
  isActive: true,
};

export default function BrandDashboard() {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [profileForm, setProfileForm] = useState({ brandName: "", contactPhone: "", website: "", companyName: "", about: "" });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [modalOpen, setModalOpen] = useState(false);

  const token = useMemo(() => localStorage.getItem("vastra_brand_token"), []);

  useEffect(() => {
    if (!token) {
      window.location.href = "/brand/login";
      return;
    }
    loadProfile();
    loadProducts();
  }, [token]);

  function authHeaders(contentType = true) {
    const headers = { Authorization: `Bearer ${token}` };
    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
  }

  async function loadProfile() {
    const res = await fetch("/api/brand/me", { headers: authHeaders(false) });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Failed to load brand profile");
      return;
    }
    setProfile(data.user);
    setProfileForm({
      brandName: data.user.brandProfile?.brandName || "",
      contactPhone: data.user.brandProfile?.contactPhone || "",
      website: data.user.brandProfile?.website || "",
      companyName: data.user.brandProfile?.companyName || "",
      about: data.user.brandProfile?.about || "",
    });
  }

  async function loadProducts() {
    const res = await fetch("/api/brand/products", { headers: authHeaders(false) });
    const data = await res.json();
    if (!data.success) return;
    setProducts(data.products || []);
  }

  async function saveProfile(e) {
    e.preventDefault();
    const body = {
      username: profile?.username,
      ...profileForm,
    };
    const res = await fetch("/api/brand/me", { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Failed to save profile");
      return;
    }
    setProfile(data.user);
    alert("Brand profile updated");
  }

  function openAddProduct() {
    setProductForm(emptyProduct);
    setModalOpen(true);
  }

  function openEditProduct(product) {
    setProductForm({
      _id: product._id,
      name: product.name || "",
      price: product.price || "",
      image: product.image || "",
      category: product.category || "Men",
      subCategory: product.subCategory || "",
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      stock: product.stock || "",
      description: product.description || "",
      tags: (product.tags || []).join(", "),
      isActive: product.isActive !== false,
    });
    setModalOpen(true);
  }

  async function saveProduct(e) {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price || 0),
      stock: Number(productForm.stock || 0),
    };
    const isEdit = !!productForm._id;
    const res = await fetch(isEdit ? `/api/brand/products/${productForm._id}` : "/api/brand/products", {
      method: isEdit ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Failed to save product");
      return;
    }
    setModalOpen(false);
    setProductForm(emptyProduct);
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;
    const res = await fetch(`/api/brand/products/${id}`, { method: "DELETE", headers: authHeaders(false) });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Failed to delete");
      return;
    }
    loadProducts();
  }

  function logout() {
    localStorage.removeItem("vastra_brand_token");
    localStorage.removeItem("vastra_brand_user");
    window.location.href = "/brand/login";
  }

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ letterSpacing: 2 }}>Brand Seller Dashboard</h1>
          <p style={{ color: "#666" }}>Manage your brand profile and products.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={openAddProduct}>+ Add Product</button>
          <button onClick={logout} style={{ background: "#fff", color: "#000", border: "1px solid #000" }}>Logout</button>
        </div>
      </div>

      <section style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 10 }}>Brand Profile</h3>
        <form onSubmit={saveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input placeholder="Brand Name" value={profileForm.brandName} onChange={(e) => setProfileForm((p) => ({ ...p, brandName: e.target.value }))} />
          <input placeholder="Contact Phone" value={profileForm.contactPhone} onChange={(e) => setProfileForm((p) => ({ ...p, contactPhone: e.target.value }))} />
          <input placeholder="Website" value={profileForm.website} onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))} />
          <input placeholder="Company Name" value={profileForm.companyName} onChange={(e) => setProfileForm((p) => ({ ...p, companyName: e.target.value }))} />
          <input placeholder="About" value={profileForm.about} onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))} style={{ gridColumn: "1 / span 2" }} />
          <button type="submit" style={{ gridColumn: "1 / span 2" }}>Save Brand Profile</button>
        </form>
      </section>

      <section style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Your Products ({products.length})</h3>
        {!products.length ? (
          <p style={{ color: "#666" }}>No products yet. Add your first listing.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Name</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Price</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Stock</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Status</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{p.name}</td>
                  <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>Rs. {Math.round(Number(p.price || 0)).toLocaleString("en-IN")}</td>
                  <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{p.stock}</td>
                  <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{p.isActive ? "Active" : "Inactive"}</td>
                  <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8, display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => openEditProduct(p)}>Edit</button>
                    <button type="button" onClick={() => deleteProduct(p._id)} style={{ background: "#d72828" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {modalOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 999 }}>
          <div style={{ width: "min(760px, 94vw)", background: "#fff", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginBottom: 10 }}>{productForm._id ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={saveProduct} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
              <input type="number" min="0" placeholder="Price (INR)" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
              <input placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} required />
              <input placeholder="Category (Men/Women/Accessories/Other)" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} />
              <input placeholder="Sub Category" value={productForm.subCategory} onChange={(e) => setProductForm((p) => ({ ...p, subCategory: e.target.value }))} />
              <input type="number" min="0" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} />
              <input placeholder="Sizes (comma separated)" value={productForm.sizes} onChange={(e) => setProductForm((p) => ({ ...p, sizes: e.target.value }))} />
              <input placeholder="Colors (comma separated)" value={productForm.colors} onChange={(e) => setProductForm((p) => ({ ...p, colors: e.target.value }))} />
              <input placeholder="Tags (comma separated)" value={productForm.tags} onChange={(e) => setProductForm((p) => ({ ...p, tags: e.target.value }))} />
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!productForm.isActive} onChange={(e) => setProductForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <input placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} style={{ gridColumn: "1 / span 2" }} />
              <div style={{ gridColumn: "1 / span 2", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: "#fff", color: "#000", border: "1px solid #000" }}>Cancel</button>
                <button type="submit">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
