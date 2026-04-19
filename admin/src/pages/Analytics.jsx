import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { formatINR } from "../utils/currency";

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/admin/analytics", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAnalytics(data.analytics);
      } catch (err) {
        setAnalytics(null);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <AdminLayout active="analytics" title="ANALYTICS">
      {!analytics ? (
        <div className="table-section">Loading analytics...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>TOTAL USERS</h3>
              <div className="value">{analytics.totalUsers}</div>
              <div className="change">All time</div>
            </div>
            <div className="stat-card">
              <h3>ACTIVE USERS (24H)</h3>
              <div className="value">{analytics.activeUsers}</div>
              <div className="change">Recent logins</div>
            </div>
            <div className="stat-card">
              <h3>TOTAL ORDERS</h3>
              <div className="value">{analytics.totalOrders}</div>
              <div className="change">All time</div>
            </div>
            <div className="stat-card">
              <h3>TOTAL REVENUE</h3>
              <div className="value">{formatINR(analytics.totalRevenue)}</div>
              <div className="change">Excl. cancelled</div>
            </div>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h3>ORDERS BY STATUS</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>COUNT</th>
                </tr>
              </thead>
              <tbody>
                {analytics.ordersByStatus.map((s) => (
                  <tr key={s._id}>
                    <td>{s._id}</td>
                    <td>{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h3>TOP USERS</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ORDERS</th>
                  <th>REVENUE</th>
                </tr>
              </thead>
              <tbody>
                {!analytics.ordersByUser.length ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  analytics.ordersByUser.map((u, idx) => (
                    <tr key={idx}>
                      <td>{u.user?.username || "Guest"}</td>
                      <td>{u.user?.email || "—"}</td>
                      <td>{u.count}</td>
                      <td>{formatINR(u.revenue || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
