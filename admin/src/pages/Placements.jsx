import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const emptyForm = {
  key: "",
  title: "",
  description: "",
  bannerImage: "",
  productIds: "",
  isActive: true,
};

export default function Placements() {
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadPlacements() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/placements/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPlacements(data.placements || []);
      } catch (err) {
        setPlacements([]);
      }
    }
    loadPlacements();
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

  function openEditModal(p) {
    setFormValues({
      key: p.key,
      title: p.title || "",
      description: p.description || "",
      bannerImage: p.bannerImage || "",
      productIds: (p.productIds || []).map((id) => id.toString()).join(", "),
      isActive: p.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: formValues.title,
      description: formValues.description,
      bannerImage: formValues.bannerImage,
      productIds: formValues.productIds
        ? formValues.productIds.split(",").map((id) => id.trim()).filter(Boolean)
        : [],
      isActive: !!formValues.isActive,
    };

    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/placements/admin/${formValues.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast("Placement saved");
        setModalOpen(false);
        const refresh = await fetch("/api/placements/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refresh.json();
        setPlacements(refreshData.placements || []);
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      alert("Server error");
    }
  }

  async function deletePlacement(id) {
    if (!confirm("Delete this placement?")) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/placements/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast("Placement deleted");
        setPlacements((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      alert("Server error");
    }
  }

  return (
    <AdminLayout
      active="placements"
      title="PLACEMENTS"
      topbarContent={<button className="btn btn-black btn-sm" onClick={openAddModal}>+ ADD PLACEMENT</button>}
    >
      <div className="table-section">
        <div className="table-header">
          <h3>ALL PLACEMENTS</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>KEY</th>
              <th>TITLE</th>
              <th>PRODUCTS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!placements.length ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No placements yet.
                </td>
              </tr>
            ) : (
              placements.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.key}</strong></td>
                  <td>{p.title || "—"}</td>
                  <td>{p.productIds?.length || 0}</td>
                  <td>
                    <span className={`badge badge-${p.isActive ? "active" : "inactive"}`}>
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6, paddingTop: 14 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditModal(p)}>EDIT</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deletePlacement(p._id)}>DELETE</button>
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
          <h2>{formValues.key ? "EDIT PLACEMENT" : "ADD PLACEMENT"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>KEY (e.g. home-spotlight, shop-spotlight)</label>
              <input
                type="text"
                value={formValues.key}
                onChange={(e) => setFormValues({ ...formValues, key: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>TITLE</label>
              <input
                type="text"
                value={formValues.title}
                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
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
              <label>BANNER IMAGE URL</label>
              <input
                type="text"
                value={formValues.bannerImage}
                onChange={(e) => setFormValues({ ...formValues, bannerImage: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>PRODUCT IDS (comma separated)</label>
              <textarea
                value={formValues.productIds}
                onChange={(e) => setFormValues({ ...formValues, productIds: e.target.value })}
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
              <button type="submit" className="btn btn-black" style={{ flex: 1 }}>SAVE PLACEMENT</button>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>CANCEL</button>
            </div>
          </form>
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
