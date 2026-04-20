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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh", background: "#f5f5f5" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", letterSpacing: "3px", margin: "0 0 0.5rem 0", fontWeight: 700 }}>BRAND SELLER DASHBOARD</h1>
          <p style={{ color: "#666", fontSize: "13px", letterSpacing: "1px", margin: 0 }}>Manage your brand profile and product listings</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button 
            onClick={openAddProduct}
            style={{
              padding: "10px 20px",
              background: "#000",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              letterSpacing: "1px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "4px"
            }}
          >
            + ADD PRODUCT
          </button>
          <button 
            onClick={logout}
            style={{
              padding: "10px 20px",
              background: "#fff",
              color: "#000",
              border: "1px solid #000",
              cursor: "pointer",
              letterSpacing: "1px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "4px"
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* BRAND PROFILE SECTION */}
      <section style={{ background: "#fff", padding: "2rem", marginBottom: "2rem", border: "1px solid #eee" }}>
        <h2 style={{ fontSize: "1rem", letterSpacing: "2px", fontWeight: 600, marginBottom: "1.5rem", margin: "0 0 1.5rem 0" }}>BRAND PROFILE</h2>
        
        <form onSubmit={saveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>BRAND NAME</label>
            <input 
              type="text"
              value={profileForm.brandName} 
              onChange={(e) => setProfileForm((p) => ({ ...p, brandName: e.target.value }))}
              placeholder="Your brand name"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#000"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>CONTACT PHONE</label>
            <input 
              type="text"
              value={profileForm.contactPhone} 
              onChange={(e) => setProfileForm((p) => ({ ...p, contactPhone: e.target.value }))}
              placeholder="Your phone number"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#000"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>WEBSITE</label>
            <input 
              type="text"
              value={profileForm.website} 
              onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://your-website.com"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#000"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>COMPANY NAME</label>
            <input 
              type="text"
              value={profileForm.companyName} 
              onChange={(e) => setProfileForm((p) => ({ ...p, companyName: e.target.value }))}
              placeholder="Your company name"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#000"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>

          <div style={{ gridColumn: "1 / span 2" }}>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>ABOUT YOUR BRAND</label>
            <textarea 
              value={profileForm.about} 
              onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))}
              placeholder="Tell us about your brand..."
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                minHeight: "100px",
                fontFamily: "inherit",
                resize: "vertical"
              }}
              onFocus={(e) => e.target.style.borderColor = "#000"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              gridColumn: "1 / span 2",
              padding: "12px 20px", 
              background: "#000", 
              color: "#fff", 
              border: "none", 
              cursor: "pointer", 
              letterSpacing: "2px", 
              fontSize: "12px", 
              fontWeight: 600,
              borderRadius: "2px"
            }}
          >
            SAVE BRAND PROFILE
          </button>
        </form>
      </section>

      {/* PRODUCTS SECTION */}
      <section style={{ background: "#fff", padding: "2rem", border: "1px solid #eee" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", letterSpacing: "2px", fontWeight: 600, margin: 0 }}>YOUR PRODUCTS</h2>
          <span style={{ fontSize: "13px", color: "#888", letterSpacing: "1px" }}>({products.length} total)</span>
        </div>

        {!products.length ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#888" }}>
            <p style={{ fontSize: "14px", marginBottom: "1rem" }}>No products yet. Start by adding your first product listing.</p>
            <button 
              onClick={openAddProduct}
              style={{
                padding: "10px 20px",
                background: "#000",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                letterSpacing: "1px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "4px"
              }}
            >
              + ADD FIRST PRODUCT
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "12px", letterSpacing: "1px", fontSize: "11px", color: "#888", fontWeight: 600 }}>PRODUCT NAME</th>
                  <th style={{ textAlign: "left", padding: "12px", letterSpacing: "1px", fontSize: "11px", color: "#888", fontWeight: 600 }}>PRICE</th>
                  <th style={{ textAlign: "left", padding: "12px", letterSpacing: "1px", fontSize: "11px", color: "#888", fontWeight: 600 }}>STOCK</th>
                  <th style={{ textAlign: "left", padding: "12px", letterSpacing: "1px", fontSize: "11px", color: "#888", fontWeight: 600 }}>STATUS</th>
                  <th style={{ textAlign: "left", padding: "12px", letterSpacing: "1px", fontSize: "11px", color: "#888", fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px" }}><strong>{p.name}</strong></td>
                    <td style={{ padding: "12px" }}>Rs. {Math.round(Number(p.price || 0)).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px" }}>{p.stock}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        fontSize: "11px",
                        letterSpacing: "1px",
                        borderRadius: "2px",
                        background: p.isActive ? "#d4edda" : "#f8d7da",
                        color: p.isActive ? "#155724" : "#721c24"
                      }}>
                        {p.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                      <button 
                        type="button" 
                        onClick={() => openEditProduct(p)}
                        style={{
                          padding: "6px 12px",
                          background: "#fff",
                          color: "#000",
                          border: "1px solid #000",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "1px",
                          borderRadius: "2px"
                        }}
                      >
                        EDIT
                      </button>
                      <button 
                        type="button" 
                        onClick={() => deleteProduct(p._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#ff3b30",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "1px",
                          borderRadius: "2px"
                        }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ADD/EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ width: "min(700px, 100%)", background: "#fff", padding: "2rem", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button 
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#888"
              }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: "1rem", letterSpacing: "3px", fontWeight: 600, marginBottom: "1.5rem", marginTop: 0 }}>
              {productForm._id ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
            </h2>

            <form onSubmit={saveProduct} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>PRODUCT NAME *</label>
                <input 
                  type="text"
                  placeholder="e.g., Cotton T-Shirt Blue" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>PRICE (INR) *</label>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="999" 
                  value={productForm.price} 
                  onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>IMAGE URL *</label>
                <input 
                  type="text"
                  placeholder="https://example.com/image.jpg" 
                  value={productForm.image} 
                  onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>CATEGORY</label>
                <select 
                  value={productForm.category} 
                  onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Kids</option>
                  <option>Accessories</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>SUB CATEGORY</label>
                <input 
                  type="text"
                  placeholder="e.g., T-Shirts, Jeans" 
                  value={productForm.subCategory} 
                  onChange={(e) => setProductForm((p) => ({ ...p, subCategory: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>STOCK *</label>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="100" 
                  value={productForm.stock} 
                  onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>SIZES</label>
                <input 
                  type="text"
                  placeholder="S, M, L, XL" 
                  value={productForm.sizes} 
                  onChange={(e) => setProductForm((p) => ({ ...p, sizes: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>COLORS</label>
                <input 
                  type="text"
                  placeholder="Blue, White, Black" 
                  value={productForm.colors} 
                  onChange={(e) => setProductForm((p) => ({ ...p, colors: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>TAGS</label>
                <input 
                  type="text"
                  placeholder="summer, cotton, casual" 
                  value={productForm.tags} 
                  onChange={(e) => setProductForm((p) => ({ ...p, tags: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "1px", color: "#888", marginBottom: "8px", fontWeight: 600 }}>DESCRIPTION</label>
                <textarea 
                  placeholder="Detailed product description..." 
                  value={productForm.description} 
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    minHeight: "100px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#000"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#333", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={!!productForm.isActive} 
                    onChange={(e) => setProductForm((p) => ({ ...p, isActive: e.target.checked }))}
                    style={{ cursor: "pointer" }}
                  />
                  <span>Product is Active</span>
                </label>
              </div>

              <div style={{ gridColumn: "1 / span 2", display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#fff",
                    color: "#000",
                    border: "1px solid #000",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "2px"
                  }}
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "2px"
                  }}
                >
                  {productForm._id ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
