import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { formatINR } from "../utils/currency";

const emptyForm = {
  _id: "",
  code: "",
  type: "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "0",
  startAt: "",
  endAt: "",
  usageLimit: "0",
  isActive: true,
};

export default function Discounts() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/coupons/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCoupons(data.coupons || []);
      } catch (err) {
        setCoupons([]);
      }
    }
    loadCoupons();
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

  function openEditModal(c) {
    setFormValues({
      _id: c._id,
      code: c.code,
      type: c.type,
      value: c.value,
      minOrder: c.minOrder || 0,
      maxDiscount: c.maxDiscount || 0,
      startAt: c.startAt ? c.startAt.slice(0, 10) : "",
      endAt: c.endAt ? c.endAt.slice(0, 10) : "",
      usageLimit: c.usageLimit || 0,
      isActive: c.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = formValues._id;
    const payload = {
      code: formValues.code.toUpperCase().trim(),
      type: formValues.type,
      value: Number(formValues.value || 0),
      minOrder: Number(formValues.minOrder || 0),
      maxDiscount: Number(formValues.maxDiscount || 0),
      startAt: formValues.startAt || null,
      endAt: formValues.endAt || null,
      usageLimit: Number(formValues.usageLimit || 0),
      isActive: !!formValues.isActive,
    };

    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(id ? `/api/coupons/admin/${id}` : "/api/coupons/admin/create", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast(id ? "Coupon updated" : "Coupon created");
        setModalOpen(false);
        const refresh = await fetch("/api/coupons/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refresh.json();
        setCoupons(refreshData.coupons || []);
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      alert("Server error");
    }
  }

  async function deleteCoupon(id) {
    if (!confirm("Delete this coupon?")) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/coupons/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast("Coupon deleted");
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      alert("Error deleting coupon");
    }
  }

  return (
    <AdminLayout
      active="discounts"
      title="DISCOUNTS"
      topbarContent={<button className="btn btn-black btn-sm" onClick={openAddModal}>+ ADD COUPON</button>}
    >
      <div className="table-section">
        <div className="table-header">
          <h3>ALL COUPONS</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>CODE</th>
              <th>TYPE</th>
              <th>VALUE</th>
              <th>MIN ORDER</th>
              <th>USAGE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!coupons.length ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type}</td>
                  <td>{c.type === "percent" ? `${c.value}%` : formatINR(c.value)}</td>
                  <td>{formatINR(c.minOrder || 0)}</td>
                  <td>{c.usedCount}/{c.usageLimit || "∞"}</td>
                  <td>
                    <span className={`badge badge-${c.isActive ? "active" : "inactive"}`}>
                      {c.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6, paddingTop: 14 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditModal(c)}>EDIT</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCoupon(c._id)}>DELETE</button>
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
          <h2>{formValues._id ? "EDIT COUPON" : "ADD COUPON"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>CODE</label>
                <input
                  type="text"
                  value={formValues.code}
                  onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>TYPE</label>
                <select
                  value={formValues.type}
                  onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                >
                  <option value="percent">Percent</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>VALUE</label>
                <input
                  type="number"
                  min="0"
                  value={formValues.value}
                  onChange={(e) => setFormValues({ ...formValues, value: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>MIN ORDER</label>
                <input
                  type="number"
                  min="0"
                  value={formValues.minOrder}
                  onChange={(e) => setFormValues({ ...formValues, minOrder: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>MAX DISCOUNT</label>
                <input
                  type="number"
                  min="0"
                  value={formValues.maxDiscount}
                  onChange={(e) => setFormValues({ ...formValues, maxDiscount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>USAGE LIMIT</label>
                <input
                  type="number"
                  min="0"
                  value={formValues.usageLimit}
                  onChange={(e) => setFormValues({ ...formValues, usageLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>START DATE</label>
                <input
                  type="date"
                  value={formValues.startAt}
                  onChange={(e) => setFormValues({ ...formValues, startAt: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>END DATE</label>
                <input
                  type="date"
                  value={formValues.endAt}
                  onChange={(e) => setFormValues({ ...formValues, endAt: e.target.value })}
                />
              </div>
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
              <button type="submit" className="btn btn-black" style={{ flex: 1 }}>SAVE COUPON</button>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>CANCEL</button>
            </div>
          </form>
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
