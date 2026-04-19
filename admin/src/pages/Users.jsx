import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const emptyEdit = {
  _id: "",
  username: "",
  email: "",
  role: "user",
  brandName: "",
  contactPhone: "",
  website: "",
  companyName: "",
  about: "",
};

export default function Users() {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState(emptyEdit);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/admin/users", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllUsers(data.users || []);
      } catch (err) {
        setAllUsers([]);
      }
    }
    loadUsers();
  }, []);

  async function refreshUsers() {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch("/api/admin/users", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch {
      setAllUsers([]);
    }
  }

  function toast(msg) {
    const t = document.getElementById("admin-toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allUsers.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, query]);

  async function changeRole(id, role) {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Role updated to ${role}`);
        refreshUsers();
      }
      else alert(data.message);
    } catch (err) {
      alert("Error updating role");
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
      toast(approved ? "Brand approved" : "Brand approval removed");
      refreshUsers();
    } catch {
      alert("Error updating approval");
    }
  }

  function openEditModal(u) {
    setEditingUser({
      _id: u._id,
      username: u.username || "",
      email: u.email || "",
      role: u.role || "user",
      brandName: u.brandProfile?.brandName || "",
      contactPhone: u.brandProfile?.contactPhone || "",
      website: u.brandProfile?.website || "",
      companyName: u.brandProfile?.companyName || "",
      about: u.brandProfile?.about || "",
    });
    setModalOpen(true);
  }

  async function saveUserEdit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const payload = {
        username: editingUser.username,
        email: editingUser.email,
        brandName: editingUser.brandName,
        contactPhone: editingUser.contactPhone,
        website: editingUser.website,
        companyName: editingUser.companyName,
        about: editingUser.about,
      };
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to save changes");
        return;
      }
      toast("User updated");
      setModalOpen(false);
      setEditingUser(emptyEdit);
      refreshUsers();
    } catch {
      alert("Error saving user");
    }
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast("User deleted");
        setAllUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (err) {
      alert("Error deleting user");
    }
  }

  const currentAdmin = JSON.parse(localStorage.getItem("vastra_admin_user") || "{}");
  const currentAdminId = currentAdmin._id || currentAdmin.id;

  return (
    <AdminLayout active="users" title="USERS">
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="table-section">
        <div className="table-header">
          <h3>ALL USERS <span id="user-count" style={{ color: "#888", fontSize: 12 }}>({filtered.length})</span></h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>BRAND</th>
              <th>APPROVAL</th>
              <th>PRODUCTS</th>
              <th>JOINED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: u.role === "admin" ? 700 : 400,
                      }}
                      value={u.role}
                    >
                      <option value="user">USER</option>
                      <option value="brand">BRAND SELLER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td>{u.role === "brand" ? (u.brandProfile?.brandName || "-") : "-"}</td>
                  <td>{u.role === "brand" ? (u.brandProfile?.approved ? "APPROVED" : "PENDING") : "-"}</td>
                  <td>{u.role === "brand" ? (u.brandProductCount || 0) : "-"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    {u._id !== currentAdminId ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {u.role === "brand" ? (
                          <button
                            className="btn btn-sm"
                            style={{ background: u.brandProfile?.approved ? "#f59e0b" : "#10b981", color: "#fff" }}
                            onClick={() => toggleBrandApproval(u._id, !u.brandProfile?.approved)}
                          >
                            {u.brandProfile?.approved ? "UNAPPROVE" : "APPROVE"}
                          </button>
                        ) : null}
                        <button className="btn btn-black btn-sm" onClick={() => openEditModal(u)}>EDIT</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>DELETE</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "#888" }}>YOU</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div className="modal show" style={{ display: "flex" }}>
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>EDIT USER</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={saveUserEdit} className="modal-form" style={{ display: "grid", gap: 10 }}>
              <label>
                <span>Username</span>
                <input
                  value={editingUser.username}
                  onChange={(e) => setEditingUser((p) => ({ ...p, username: e.target.value }))}
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </label>

              {editingUser.role === "brand" ? (
                <>
                  <label>
                    <span>Brand Name</span>
                    <input
                      value={editingUser.brandName}
                      onChange={(e) => setEditingUser((p) => ({ ...p, brandName: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Contact Phone</span>
                    <input
                      value={editingUser.contactPhone}
                      onChange={(e) => setEditingUser((p) => ({ ...p, contactPhone: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Website</span>
                    <input
                      value={editingUser.website}
                      onChange={(e) => setEditingUser((p) => ({ ...p, website: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Company Name</span>
                    <input
                      value={editingUser.companyName}
                      onChange={(e) => setEditingUser((p) => ({ ...p, companyName: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>About</span>
                    <textarea
                      value={editingUser.about}
                      onChange={(e) => setEditingUser((p) => ({ ...p, about: e.target.value }))}
                    />
                  </label>
                </>
              ) : null}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-sm" onClick={() => setModalOpen(false)}>CANCEL</button>
                <button type="submit" className="btn btn-black btn-sm">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
