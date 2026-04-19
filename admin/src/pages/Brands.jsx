import { useEffect, useState } from "react";
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

export default function Brands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadBrands() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/brands/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBrands(data.brands || []);
      } catch (err) {
        setBrands([]);
      }
    }
    loadBrands();
  }, []);

  function toast(msg) {
    const t = document.getElementById("admin-toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
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
        const refresh = await fetch("/api/brands/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refresh.json();
        setBrands(refreshData.brands || []);
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
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
    } catch (err) {
      alert("Error deleting brand");
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

      <div className={`modal-overlay ${modalOpen ? "open" : ""}`}>
        <div className="modal">
          <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          <h2>{formValues._id ? "EDIT BRAND" : "ADD BRAND"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>NAME</label>
              <input
                type="text"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>SLUG</label>
              <input
                type="text"
                value={formValues.slug}
                onChange={(e) => setFormValues({ ...formValues, slug: e.target.value })}
                placeholder="auto from name"
              />
            </div>
            <div className="form-group">
              <label>LOGO URL</label>
              <input
                type="text"
                value={formValues.logo}
                onChange={(e) => setFormValues({ ...formValues, logo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>DESCRIPTION</label>
              <textarea
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>STATUS</label>
              <select
                value={formValues.isActive ? "true" : "false"}
                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="submit" className="btn btn-black" style={{ flex: 1 }}>SAVE BRAND</button>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>CANCEL</button>
            </div>
          </form>
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
