import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

export default function Users() {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [query, setQuery] = useState("");

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
      if (data.success) toast(`Role updated to ${role}`);
      else alert(data.message);
    } catch (err) {
      alert("Error updating role");
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
              <th>JOINED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
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
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    {u._id !== currentAdminId ? (
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>DELETE</button>
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

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
