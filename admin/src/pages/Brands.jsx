import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const emptyForm = {
  _id: "",
  name: "",
  slug: "",
  logo: "",
  description: "",
  isActive: true,
};

const emptyBrandUser = {
  _id: "",
  username: "",
  email: "",
  brandName: "",
  contactPhone: "",
  website: "",
  companyName: "",
  about: "",
};

export default function Brands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [brandUsers, setBrandUsers] = useState([]);
  const [brandProductsByUser, setBrandProductsByUser] = useState({});
  const [loadingProductsByUser, setLoadingProductsByUser] = useState({});
  const [expandedBrandUserId, setExpandedBrandUserId] = useState("");
  const [formValues, setFormValues] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingBrandUser, setEditingBrandUser] = useState(emptyBrandUser);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    loadBrands();
    loadBrandUsers();
  }, []);

  function toast(msg) {
    const t = document.getElementById("admin-toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
  }

  async function loadBrands() {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch("/api/brands/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBrands(data.brands || []);
    } catch {
      setBrands([]);
    }
  }

  async function loadBrandUsers() {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch("/api/admin/users", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBrandUsers((data.users || []).filter((u) => u.role === "brand"));
    } catch {
      setBrandUsers([]);
    }
  }

  function openAddModal() {
    setFormValues(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(b) {
    setFormValues({
      _id: b._id,
      name: b.name,
      slug: b.slug,
      logo: b.logo || "",
      description: b.description || "",
      isActive: b.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = formValues._id;
    const payload = {
      name: formValues.name,
      slug: formValues.slug,
      logo: formValues.logo,
      description: formValues.description,
      isActive: !!formValues.isActive,
    };

    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(id ? `/api/brands/admin/${id}` : "/api/brands/admin/create", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast(id ? "Brand updated" : "Brand created");
        setModalOpen(false);
        loadBrands();
      } else {
        alert(data.message || "Failed");
      }
    } catch {
      alert("Server error");
    }
  }

  async function deleteBrand(id) {
    if (!confirm("Delete this brand?")) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/brands/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast("Brand deleted");
        setBrands((prev) => prev.filter((b) => b._id !== id));
      }
    } catch {
      alert("Error deleting brand");
    }
  }

  async function toggleBrandApproval(id, approved) {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/users/${id}/brand-approval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update approval");
        return;
      }
      toast(approved ? "Brand approved" : "Brand set to pending");
      loadBrandUsers();
    } catch {
      alert("Error updating approval");
    }
  }

  async function loadBrandProducts(brandUserId) {
    try {
      setLoadingProductsByUser((prev) => ({ ...prev, [brandUserId]: true }));
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/users/${brandUserId}/products`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to load products");
        return;
      }
      setBrandProductsByUser((prev) => ({ ...prev, [brandUserId]: data.products || [] }));
    } catch {
      alert("Error loading brand products");
    } finally {
      setLoadingProductsByUser((prev) => ({ ...prev, [brandUserId]: false }));
    }
  }

  async function toggleProductApproval(productId, approved, brandUserId) {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/products/${productId}/approval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update product approval");
        return;
      }

      setBrandProductsByUser((prev) => ({
        ...prev,
        [brandUserId]: (prev[brandUserId] || []).map((p) =>
          p._id === productId ? { ...p, adminApproved: approved } : p
        ),
      }));
      toast(approved ? "Product approved" : "Product unapproved");
    } catch {
      alert("Error updating product approval");
    }
  }

  async function toggleBrandProducts(userId) {
    if (expandedBrandUserId === userId) {
      setExpandedBrandUserId("");
      return;
    }

    setExpandedBrandUserId(userId);
    if (!brandProductsByUser[userId]) {
      await loadBrandProducts(userId);
    }
  }

  function openUserEditModal(user) {
    setEditingBrandUser({
      _id: user._id,
      username: user.username || "",
      email: user.email || "",
      brandName: user.brandProfile?.brandName || "",
      contactPhone: user.brandProfile?.contactPhone || "",
      website: user.brandProfile?.website || "",
      companyName: user.brandProfile?.companyName || "",
      about: user.brandProfile?.about || "",
    });
    setUserModalOpen(true);
  }

  async function saveBrandUser(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/users/${editingBrandUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingBrandUser),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update brand seller");
        return;
      }
      toast("Brand seller updated");
      setUserModalOpen(false);
      setEditingBrandUser(emptyBrandUser);
      loadBrandUsers();
    } catch {
      alert("Error updating brand seller");
    }
  }

  async function deleteBrandUser(id) {
    if (!confirm("Delete this brand seller?")) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast("Brand seller deleted");
        setBrandUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch {
      alert("Error deleting brand seller");
    }
  }

  return (
    <AdminLayout
      active="brands"
      title="BRANDS"
      topbarContent={<button className="btn btn-black btn-sm" onClick={openAddModal}>+ ADD BRAND</button>}
    >
      <div className="table-section">
        <div className="table-header">
          <h3>ALL BRANDS</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>SLUG</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!brands.length ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No brands yet.
                </td>
              </tr>
            ) : (
              brands.map((b) => (
                <tr key={b._id}>
                  <td><strong>{b.name}</strong></td>
                  <td>{b.slug}</td>
                  <td>
                    <span className={`badge badge-${b.isActive ? "active" : "inactive"}`}>
                      {b.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6, paddingTop: 14 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditModal(b)}>EDIT</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteBrand(b._id)}>DELETE</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-section" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h3>BRAND SELLERS</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>BRAND</th>
              <th>EMAIL</th>
              <th>APPROVAL</th>
              <th>PRODUCTS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!brandUsers.length ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1.5rem", color: "#888" }}>
                  No brand sellers found.
                </td>
              </tr>
            ) : (
              brandUsers.map((u) => (
                <Fragment key={u._id}>
                  <tr>
                    <td><strong>{u.brandProfile?.brandName || u.username}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.brandProfile?.approved ? "APPROVED" : "PENDING"}</td>
                    <td>{u.brandProductCount || 0}</td>
                    <td style={{ display: "flex", gap: 6, paddingTop: 14, flexWrap: "wrap" }}>
                      <button
                        className="btn btn-sm"
                        style={{ background: u.brandProfile?.approved ? "#f59e0b" : "#10b981", color: "#fff" }}
                        onClick={() => toggleBrandApproval(u._id, !u.brandProfile?.approved)}
                      >
                        {u.brandProfile?.approved ? "UNAPPROVE" : "APPROVE"}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleBrandProducts(u._id)}
                      >
                        {expandedBrandUserId === u._id ? "HIDE PRODUCTS" : "VIEW PRODUCTS"}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => openUserEditModal(u)}>EDIT</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteBrandUser(u._id)}>DELETE</button>
                    </td>
                  </tr>
                  {expandedBrandUserId === u._id && (
                    <tr>
                      <td colSpan="5" style={{ background: "#fafafa" }}>
                        {loadingProductsByUser[u._id] ? (
                          <div style={{ padding: "12px 8px", color: "#777" }}>Loading products...</div>
                        ) : !(brandProductsByUser[u._id] || []).length ? (
                          <div style={{ padding: "12px 8px", color: "#777" }}>No products for this brand.</div>
                        ) : (
                          <div style={{ padding: "8px 0" }}>
                            <table style={{ width: "100%" }}>
                              <thead>
                                <tr>
                                  <th>PRODUCT</th>
                                  <th>PRICE</th>
                                  <th>STATUS</th>
                                  <th>APPROVAL</th>
                                  <th>ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(brandProductsByUser[u._id] || []).map((p) => (
                                  <tr key={p._id}>
                                    <td>{p.name}</td>
                                    <td>Rs. {Math.round(Number(p.price || 0)).toLocaleString("en-IN")}</td>
                                    <td>{p.isActive ? "ACTIVE" : "INACTIVE"}</td>
                                    <td>{p.adminApproved ? "APPROVED" : "PENDING"}</td>
                                    <td>
                                      <button
                                        className="btn btn-sm"
                                        style={{
                                          background: p.adminApproved ? "#f59e0b" : "#10b981",
                                          color: "#fff",
                                        }}
                                        onClick={() =>
                                          toggleProductApproval(p._id, !p.adminApproved, u._id)
                                        }
                                      >
                                        {p.adminApproved ? "UNAPPROVE" : "APPROVE"}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${modalOpen ? "open" : ""}`}>
        <div className="modal" style={{ width: "700px" }}>
          <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          <h2>{formValues._id ? "EDIT BRAND" : "ADD NEW BRAND"}</h2>
          
          <form onSubmit={handleSubmit}>
            {/* LOGO PREVIEW SECTION */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem", alignItems: "start" }}>
              <div>
                <div className="form-group">
                  <label>BRAND NAME *</label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    placeholder="e.g., Nike, Adidas, Zara"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SLUG</label>
                  <input
                    type="text"
                    value={formValues.slug}
                    onChange={(e) => setFormValues({ ...formValues, slug: e.target.value })}
                    placeholder="auto-generated from name"
                  />
                </div>
              </div>

              {/* LOGO PREVIEW */}
              <div style={{ 
                background: "#f9f9f9", 
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "140px",
                textAlign: "center"
              }}>
                {formValues.logo ? (
                  <img 
                    src={formValues.logo} 
                    alt="Logo Preview" 
                    style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "block";
                    }}
                  />
                ) : (
                  <div style={{ color: "#999", fontSize: "12px" }}>
                    Logo preview will appear here
                  </div>
                )}
                {formValues.logo && (
                  <div style={{ display: "none", color: "#999", fontSize: "12px" }}>
                    Invalid image URL
                  </div>
                )}
              </div>
            </div>

            {/* LOGO URL */}
            <div className="form-group">
              <label>LOGO URL</label>
              <input
                type="text"
                value={formValues.logo}
                onChange={(e) => setFormValues({ ...formValues, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <small style={{ color: "#999", display: "block", marginTop: "4px", fontSize: "12px" }}>
                Provide a direct link to the brand logo image
              </small>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label>DESCRIPTION</label>
              <textarea
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                placeholder="Brief description about the brand..."
                style={{ minHeight: "100px" }}
              />
            </div>

            {/* STATUS */}
            <div className="form-group">
              <label>STATUS</label>
              <select
                value={formValues.isActive ? "true" : "false"}
                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === "true" })}
              >
                <option value="true">✓ Active</option>
                <option value="false">✗ Inactive</option>
              </select>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setModalOpen(false)}
              >
                CANCEL
              </button>
              <button type="submit" className="btn btn-black">
                {formValues._id ? "UPDATE BRAND" : "CREATE BRAND"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`modal-overlay ${userModalOpen ? "open" : ""}`}>
        <div className="modal" style={{ width: "700px" }}>
          <button className="modal-close" onClick={() => setUserModalOpen(false)}>✕</button>
          <h2>EDIT BRAND SELLER</h2>
          
          <form onSubmit={saveBrandUser}>
            {/* ACCOUNT INFO SECTION */}
            <fieldset style={{ border: "none", padding: 0, marginBottom: "1.5rem" }}>
              <legend style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", color: "#888", marginBottom: "1rem", textTransform: "uppercase" }}>
                Account Information
              </legend>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>USERNAME</label>
                  <input
                    type="text"
                    value={editingBrandUser.username}
                    onChange={(e) => setEditingBrandUser((p) => ({ ...p, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    value={editingBrandUser.email}
                    onChange={(e) => setEditingBrandUser((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* BRAND INFO SECTION */}
            <fieldset style={{ border: "none", padding: 0, marginBottom: "1.5rem" }}>
              <legend style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", color: "#888", marginBottom: "1rem", textTransform: "uppercase" }}>
                Brand Details
              </legend>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>BRAND NAME</label>
                  <input
                    type="text"
                    value={editingBrandUser.brandName}
                    onChange={(e) => setEditingBrandUser((p) => ({ ...p, brandName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>COMPANY NAME</label>
                  <input
                    type="text"
                    value={editingBrandUser.companyName}
                    onChange={(e) => setEditingBrandUser((p) => ({ ...p, companyName: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>CONTACT PHONE</label>
                  <input
                    type="text"
                    value={editingBrandUser.contactPhone}
                    onChange={(e) => setEditingBrandUser((p) => ({ ...p, contactPhone: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>WEBSITE</label>
                  <input
                    type="text"
                    value={editingBrandUser.website}
                    onChange={(e) => setEditingBrandUser((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </fieldset>

            {/* ABOUT SECTION */}
            <div className="form-group">
              <label>ABOUT</label>
              <textarea
                value={editingBrandUser.about}
                onChange={(e) => setEditingBrandUser((p) => ({ ...p, about: e.target.value }))}
                placeholder="Tell us about your brand..."
                style={{ minHeight: "100px" }}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setUserModalOpen(false)}
              >
                CANCEL
              </button>
              <button type="submit" className="btn btn-black">
                SAVE BRAND SELLER
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
