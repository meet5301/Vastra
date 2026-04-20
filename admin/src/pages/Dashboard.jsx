import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { formatINR } from "../utils/currency";

function statusBadge(status) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status.toUpperCase()}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: "—",
    totalRevenue: "—",
    pending: "—",
    delivered: "—",
    totalUsers: "—",
    activeUsers: "—",
    pendingBrandApprovals: "—",
    pendingProductApprovals: "—",
  });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/admin/analytics", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) return;
        const s = data.analytics;
        setStats({
          totalOrders: s.totalOrders,
          totalRevenue: formatINR(s.totalRevenue),
          pending: s.pending,
          delivered: s.delivered,
          totalUsers: s.totalUsers,
          activeUsers: s.activeUsers,
          pendingBrandApprovals: s.pendingBrandApprovals,
          pendingProductApprovals: s.pendingProductApprovals,
        });
      } catch (err) {
        // keep placeholders
      }
    }

    async function loadRecentOrders() {
      try {
        const token = localStorage.getItem("vastra_admin_token");
        const res = await fetch("/api/orders/admin/all?limit=5", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) return;
        setOrders(data.orders || []);
      } catch (err) {
        setOrders([]);
      }
    }

    loadStats();
    loadRecentOrders();
  }, []);

  const user = JSON.parse(localStorage.getItem("vastra_admin_user") || "{}");

  const todayDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const topbarContent = (
    <>
      <span id="admin-name">{user.username || "Admin"}</span>
      <span>·</span>
      <span id="today-date">{todayDate}</span>
    </>
  );

  return (
    <AdminLayout active="dashboard" title="DASHBOARD" topbarContent={topbarContent}>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>TOTAL ORDERS</h3>
          <div className="value" id="stat-orders">{stats.totalOrders}</div>
          <div className="change">All time</div>
        </div>
        <div className="stat-card">
          <h3>TOTAL REVENUE</h3>
          <div className="value" id="stat-revenue">{stats.totalRevenue}</div>
          <div className="change">Excl. cancelled</div>
        </div>
        <div className="stat-card">
          <h3>PENDING</h3>
          <div className="value" id="stat-pending">{stats.pending}</div>
          <div className="change">Processing orders</div>
        </div>
        <div className="stat-card">
          <h3>DELIVERED</h3>
          <div className="value" id="stat-delivered">{stats.delivered}</div>
          <div className="change">Completed orders</div>
        </div>
        <div className="stat-card">
          <h3>TOTAL USERS</h3>
          <div className="value">{stats.totalUsers}</div>
          <div className="change">All time</div>
        </div>
        <div className="stat-card">
          <h3>ACTIVE USERS</h3>
          <div className="value">{stats.activeUsers}</div>
          <div className="change">Last 24h</div>
        </div>
        <div className="stat-card">
          <h3>PENDING BRAND APPROVALS</h3>
          <div className="value">{stats.pendingBrandApprovals}</div>
          <div className="change">Need admin review</div>
        </div>
        <div className="stat-card">
          <h3>PENDING PRODUCT APPROVALS</h3>
          <div className="value">{stats.pendingProductApprovals}</div>
          <div className="change">Need admin review</div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h3>RECENT ORDERS</h3>
          <a href="/orders" className="btn btn-outline btn-sm">VIEW ALL</a>
        </div>
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {!orders.length ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: "monospace" }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{o.user?.username || o.guestInfo?.firstName || "Guest"}</td>
                  <td>{formatINR(o.totalAmount)}</td>
                  <td>{statusBadge(o.orderStatus)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
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
